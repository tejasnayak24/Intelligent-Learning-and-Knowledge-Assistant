"""Single shared SentenceTransformer instance for the backend, loaded lazily.

Document embeddings (embedding_service.py) and query embeddings
(search_service.py) must come from the same model, and each extra copy of
the model costs RAM. The model is not loaded when the app starts: the first
call to get_embedding_model() loads it, and every later call returns that
same instance. A lock makes sure that concurrent first calls (for example an
upload and a search arriving together) still create only one instance.
"""

import threading

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

_embedding_model = None
_embedding_model_lock = threading.Lock()


def get_embedding_model():
    """Return the process-wide SentenceTransformer, loading it on first call.

    If loading fails, the exception propagates and the next call retries.
    """
    global _embedding_model

    if _embedding_model is None:
        with _embedding_model_lock:
            # Check again: another thread may have loaded the model while
            # this one was waiting for the lock.
            if _embedding_model is None:
                # Imported here rather than at the top of the file, so that
                # torch and transformers are not loaded until the model is
                # first needed.
                from sentence_transformers import SentenceTransformer

                _embedding_model = SentenceTransformer(
                    EMBEDDING_MODEL_NAME
                )

    return _embedding_model
