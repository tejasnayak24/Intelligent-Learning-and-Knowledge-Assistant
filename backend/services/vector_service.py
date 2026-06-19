import faiss
import numpy as np
import pickle

def create_index(embeddings):

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(
        np.array(embeddings).astype("float32")
    )

    return index


def save_index(index):

    faiss.write_index(
        index,
        "vectorstore/faiss_index.bin"
    )


def save_chunks(chunks):

    with open(
        "vectorstore/chunks.pkl",
        "wb"
    ) as f:

        pickle.dump(chunks, f)