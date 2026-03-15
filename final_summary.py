from interviewer_ai_engine import evaluate_candidate, generate_final_summary

# ------------------------
# Demo Questions and Answers
# ------------------------
questions = [
    "What is overfitting?",
    "What is continuous deployment?",
    "Explain regularization in machine learning."
]

answers = [
    "Overfitting is when the model learns the data too well, including the noise, so it fails on new data.",
    "Continuous deployment automatically pushes every change to production without manual approval.",
    "Regularization helps prevent overfitting by adding penalties to large weights in the model."
]

evaluation_points_list = [
    ["Overfitting occurs when a model learns the training data too well including noise.",
     "An overfitted model performs well on training data but poorly on unseen test data.",
     "Models with high capacity or many parameters are more prone to overfitting.",
     "Regularization, dropout, cross-validation, or more data can reduce overfitting."],

    ["Continuous deployment automates the release process to production.",
     "No manual approval is needed for deployment.",
     "It ensures every change passes automated tests before production."],

    ["Regularization reduces overfitting by penalizing large weights.",
     "Common techniques include L1, L2 regularization.",
     "Helps model generalize better to unseen data."]
]

# ------------------------
# Evaluate each question
# ------------------------
all_reviews = []

for q, a, ep in zip(questions, answers, evaluation_points_list):
    result = evaluate_candidate(q, a, ep)
    print(f"Question: {q}")
    print(f"Candidate Review:\n{result['review_text']}")
    print(f"LLM Score: {result['llm_score']}, Semantic Similarity: {result['avg_similarity']:.2f}")
    print("-" * 60)
    all_reviews.append(result['review_text'])

# ------------------------
# Generate final summary at the end
# ------------------------
final_summary = generate_final_summary(all_reviews)
print("\nFINAL OVERALL SUMMARY:\n", final_summary)