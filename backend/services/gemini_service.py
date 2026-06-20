from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def generate_answer(question, context):

    prompt = f"""
Answer ONLY using the provided context.

Context:
{context}

Question:
{question}

If the answer is not in the context, say:
"I could not find that information in the uploaded documents."
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text