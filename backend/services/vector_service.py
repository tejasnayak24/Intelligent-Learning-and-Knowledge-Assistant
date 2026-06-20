import faiss
import numpy as np
import pickle
import os


def append_to_index(embeddings):

    index_file = "vectorstore/faiss_index.bin"

    embeddings = np.array(
        embeddings
    ).astype("float32")

    if os.path.exists(index_file):

        index = faiss.read_index(
            index_file
        )

    else:

        dimension = embeddings.shape[1]

        index = faiss.IndexFlatL2(
            dimension
        )

    index.add(embeddings)

    faiss.write_index(
        index,
        index_file
    )

    return index


def save_chunks(new_chunks):

    chunks_file = "vectorstore/chunks.pkl"

    if os.path.exists(chunks_file):

        with open(chunks_file, "rb") as f:
            all_chunks = pickle.load(f)

    else:

        all_chunks = []

    all_chunks.extend(new_chunks)

    with open(chunks_file, "wb") as f:
        pickle.dump(all_chunks, f)