import os
import faiss
import numpy as np
import pickle
from services.model_loader import get_embedding_model

INDEX_FILE = "vectorstore/faiss_index.bin"
CHUNKS_FILE = "vectorstore/chunks.pkl"


def get_document_chunks(document_id, owner):
    """Positions and records of the chunks of one user's document.

    A chunk's position in chunks.pkl is also its ID in the FAISS index.
    Chunks saved before documents had IDs have no document_id or owner, so
    they are never returned.
    """

    if not os.path.exists(CHUNKS_FILE):
        return []

    with open(CHUNKS_FILE, "rb") as f:
        chunks = pickle.load(f)

    return [
        (position, chunk)
        for position, chunk in enumerate(chunks)
        if chunk.get("document_id") == document_id
        and chunk.get("owner") == owner
    ]


def search_documents(
    query,
    document_id,
    owner,
    top_k=3
):
    """The top_k chunks of one user's document that best match the query.

    The FAISS search only considers that document's chunk IDs, so chunks of
    other PDFs and other users are never candidates.
    """

    document_chunks = dict(
        get_document_chunks(document_id, owner)
    )

    if not document_chunks or not os.path.exists(INDEX_FILE):
        return []

    index = faiss.read_index(
        INDEX_FILE
    )

    query_embedding = get_embedding_model().encode(
        [query]
    )

    selector = faiss.IDSelectorBatch(
        np.array(list(document_chunks), dtype="int64")
    )

    distances, indices = index.search(
        query_embedding.astype("float32"),
        min(top_k, len(document_chunks)),
        params=faiss.SearchParameters(sel=selector)
    )

    results = []

    for idx in indices[0]:

        # FAISS returns -1 for empty result slots. Looking the ID up in this
        # document's chunks skips those and returns nothing from elsewhere.
        chunk = document_chunks.get(int(idx))

        if chunk is not None:

            results.append({
                "filename": chunk["filename"],
                "text": chunk["text"],
                "page_start": chunk.get("page_start"),
                "page_end": chunk.get("page_end")
            })

    return results
