# interviewer_ai_engine.py
import re
from sentence_transformers import SentenceTransformer, util
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage

# Persistent models (loaded once)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
ollama = ChatOllama(model="llama2", temperature=0)  # smaller/faster model

# Optional: cache embeddings for static evaluation points
evaluation_cache = {}

def evaluate_candidate(question: str, answer: str, evaluation_points: list):
    """
    Evaluate candidate answer synchronously.
    Returns review text, LLM score, semantic similarity, and aggregate score.
    """
    # Precompute or reuse embeddings for static evaluation points
    key = tuple(evaluation_points)
    if key in evaluation_cache:
        eval_embeddings = evaluation_cache[key]
    else:
        eval_embeddings = embedding_model.encode(evaluation_points, convert_to_tensor=True)
        evaluation_cache[key] = eval_embeddings

    # Shortened combined prompt
    eval_text = "\n".join([f"{i+1}. {ep}" for i, ep in enumerate(evaluation_points)])
    combined_prompt = f"""
You are an interviewer. The question is: "{question}"
Candidate answer: "{answer}"

Evaluation points:
{eval_text}

Instructions:
1. Give a concise review explaining where the candidate was correct, wrong, or missing points.
2. Use first-person pronouns (call them 'you'), keep it precise, under 10 lines.
3. At the end, provide a single numeric score from 0-10 (based only on key points). Do NOT include explanations with the score.
"""
    messages = [HumanMessage(content=combined_prompt)]

    # Generate response
    output_text = ollama.generate([messages]).generations[0][0].text.strip()

    # Split review and numeric score
    review_text = output_text
    match = re.search(r"\b([0-9]{1,2})\b", output_text)
    llm_score_value = min(int(match.group(1)), 10) if match else 0
    llm_score_norm = llm_score_value / 10

    # Candidate embedding
    answer_embedding = embedding_model.encode(answer, convert_to_tensor=True)
    cosine_scores = util.cos_sim(answer_embedding, eval_embeddings)[0].tolist()
    avg_similarity = sum(cosine_scores) / len(cosine_scores)

    aggregate_score = llm_score_norm  # unchanged

    return {
        "review_text": review_text,
        "llm_score": llm_score_value,
        "avg_similarity": avg_similarity,
        "aggregate_score": aggregate_score
    }


# -------------------------
# FINAL SUMMARY FUNCTION
# -------------------------
def generate_final_summary(all_reviews: list) -> str:
    """
    Generate a concise overall candidate summary from all per-question reviews.
    Clears the list after use to start a fresh interview.
    """
    ollama_final = ChatOllama(model="llama2", temperature=0)

    combined_reviews = " ".join(all_reviews)
    combined_reviews = combined_reviews[:3000]  # optional truncation

    prompt = f"""
You are an interviewer summarizing a candidate's overall performance.

Here are all individual question reviews:
{combined_reviews}

Instructions:
- Generate a concise summary of the candidate's strengths, weaknesses, and overall performance.
- Include major concepts consistently missed.
- Keep it under 10 lines.
- Do not invent new facts, only summarize what is in the reviews.
"""

    messages = [HumanMessage(content=prompt)]
    final_summary = ollama_final.generate([messages]).generations[0][0].text.strip()

    # Clear the list so the next interview starts fresh
    all_reviews.clear()

    return final_summary