import faiss
import pickle
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def search_documents(query, top_k=3):

    index = faiss.read_index("vectorstore/faiss_index.bin")

    with open("vectorstore/chunks.pkl", "rb") as f:
        chunks = pickle.load(f)

    query_embedding = model.encode([query])

    distances, indices = index.search(
        query_embedding.astype("float32"),
        top_k
    )

    results = []

    for idx in indices[0]:
        if idx < len(chunks):
            results.append(chunks[idx])

    return results