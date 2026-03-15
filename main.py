# main.py
from fastapi import FastAPI, Form, Body
from fastapi.responses import JSONResponse
from typing import List
from interviewer_ai_engine import evaluate_candidate, generate_final_summary

app = FastAPI(title="Python AI Interview API")

# ------------------------
# Endpoint for per-question evaluation
# ------------------------
@app.post("/evaluate/")
async def evaluate(
    question: str = Form(...),
    answer: str = Form(...),
    evaluation_points: List[str] = Body(...)
):
    """
    Evaluate a candidate answer for a single question.
    """
    result = evaluate_candidate(question, answer, evaluation_points)
    return JSONResponse(content=result)


# ------------------------
# Endpoint to generate final summary after all questions
# ------------------------
@app.post("/final_summary/")
async def final_summary(all_reviews: List[str] = Body(...)):
    """
    Generate a final concise summary of the candidate's overall performance.
    Clears the list after generating summary.
    """
    summary_text = generate_final_summary(all_reviews)
    return JSONResponse(content={"final_summary": summary_text})


# ------------------------
# Run server
# ------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)