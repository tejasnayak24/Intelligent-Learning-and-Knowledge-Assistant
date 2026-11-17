import faiss
import pickle
from services.model_loader import get_embedding_model

def search_documents(
    query,
    top_k=3
):

    index = faiss.read_index(
        "vectorstore/faiss_index.bin"
    )

    with open(
        "vectorstore/chunks.pkl",
        "rb"
    ) as f:

        chunks = pickle.load(f)

    query_embedding = get_embedding_model().encode(
        [query]
    )

    distances, indices = index.search(
        query_embedding.astype("float32"),
        top_k
    )

    results = []

    for idx in indices[0]:

        if idx < len(chunks):

            results.append({
                "filename":
                    chunks[idx]["filename"],

                "text":
                    chunks[idx]["text"]
            })

    return results