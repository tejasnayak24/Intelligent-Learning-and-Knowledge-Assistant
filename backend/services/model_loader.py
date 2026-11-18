"""Single shared embedding model for the backend, loaded lazily.

Document embeddings (embedding_service.py) and query embeddings
(search_service.py) must come from the same model, and each extra copy of
the model costs RAM. The model is not loaded when the app starts: the first
call to get_embedding_model() loads it, and every later call returns that
same instance. A lock makes sure that concurrent first calls (for example an
upload and a search arriving together) still create only one instance.

The model is all-MiniLM-L6-v2, run by FastEmbed on ONNX Runtime instead of
by sentence-transformers on PyTorch, which needs far less memory. It returns
the same normalized 384-dimensional vectors, so existing FAISS indexes keep
working.

The model files are downloaded on first use into the directory named by the
FASTEMBED_CACHE_PATH environment variable, and loaded from there without
downloading again once they are present. If the variable is unset or blank,
FastEmbed uses its own default cache directory (fastembed_cache in the
system temp directory).
"""

import os
import threading

import numpy as np

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Small batches and a single thread keep memory low on a 512 MB instance.
# FastEmbed's defaults (batch size 256, automatic thread count) used over
# 2 GB of RAM for a large PDF in testing.
EMBEDDING_BATCH_SIZE = 8
EMBEDDING_THREADS = 1

_embedding_model = None
_embedding_model_lock = threading.Lock()


class EmbeddingModel:
    """FastEmbed model with the encode() method the services call."""

    def __init__(self):
        # Imported here rather than at the top of the file, so that FastEmbed
        # and ONNX Runtime are not loaded until the model is first needed.
        from fastembed import TextEmbedding

        cache_path = os.environ.get("FASTEMBED_CACHE_PATH")
        cache_path = cache_path.strip() if cache_path and cache_path.strip() else None

        if cache_path is None:
            # FastEmbed reads FASTEMBED_CACHE_PATH itself when cache_dir is
            # None, so a blank value would still be used (an empty value
            # means the working directory). Removing the variable makes
            # FastEmbed fall back to its default cache directory.
            os.environ.pop("FASTEMBED_CACHE_PATH", None)

        self._model = TextEmbedding(
            model_name=EMBEDDING_MODEL_NAME,
            # None (not set or blank) lets FastEmbed use its default cache.
            cache_dir=cache_path,
            threads=EMBEDDING_THREADS,
        )

    def encode(self, texts):
        """Embed a list of texts.

        Returns a float32 NumPy array of shape (len(texts), 384), the format
        the FAISS code expects.
        """
        embeddings = self._model.embed(
            texts,
            batch_size=EMBEDDING_BATCH_SIZE,
        )

        return np.asarray(
            list(embeddings),
            dtype=np.float32,
        ).reshape(-1, self._model.embedding_size)


def get_embedding_model():
    """Return the process-wide embedding model, loading it on first call.

    If loading fails, the exception propagates and the next call retries.
    """
    global _embedding_model

    if _embedding_model is None:
        with _embedding_model_lock:
            # Check again: another thread may have loaded the model while
            # this one was waiting for the lock.
            if _embedding_model is None:
                _embedding_model = EmbeddingModel()

    return _embedding_model
