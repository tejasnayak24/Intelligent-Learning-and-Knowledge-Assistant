"""Single shared SentenceTransformer instance for the backend.

Document embeddings (embedding_service.py) and query embeddings
(search_service.py) must come from the same model, and each extra copy of
the model costs RAM. Python runs a module's top-level code only once per
process, so every importer of this module gets the same instance.
"""

from sentence_transformers import SentenceTransformer

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# Loaded once, when this module is first imported (during app startup).
_embedding_model = SentenceTransformer(
    EMBEDDING_MODEL_NAME
)


def get_embedding_model():
    """Return the process-wide SentenceTransformer instance."""
    return _embedding_model
