import requests
import time
import os
from django.conf import settings

class OllamaHierarchicalSummarizer:
    SMALL_MODEL_TOKEN_FACTOR = 0.7
    def __init__(self, model_name=None, base_url=None):
        self.base_url = base_url or getattr(settings, "LLM_SERVICE_URL", "http://llm-service:11434")
        self.__model_setup()

    # -------------------------
    # Token estimation
    # -------------------------
    def estimate_tokens(self, text: str) -> int:
        # Rough heuristic: 1 token ≈ 1.3 words
        words = text.split()
        return int(len(words) / self.SMALL_MODEL_TOKEN_FACTOR)

    def max_words_for_tokens(self, token_limit: int) -> int:
        return int(token_limit * self.SMALL_MODEL_TOKEN_FACTOR)

    def _remove_think_from_response(self, response: str) -> str:
        start = response.find("<think>")
        if start != -1:
            end = response.find("</think>", start)
            if end != -1:
                response = response[:start] + response[end + len("</think>"):]

        return response

    # -------------------------
    # Summarize a single chunk using Ollama
    # -------------------------
    def summarize_chunk(self, text: str, target_words=None) -> str:
        start = time.time()
        if target_words:
            prompt = (
                f"Summarize provided text. "
                f"Summary should not exceed {target_words} words in length."
                f"Preserve all important details, tone, and language.\n\nText:\n{text}"
            )
        else:
            prompt = (
                f"Summarize the following text while keeping as much detail, tone, and "
                f"structure as possible. Write the summary in the same language as the input text.\n\n{text}"
            )

        response = requests.post(
            f"{self.base_url}/api/generate",
            json={
                "model": self.model_name,
                "prompt": prompt,
                "stream": False
            },
            timeout=300
        )
        response.raise_for_status()
        summary = response.json()["response"]
        summary = self._remove_think_from_response(summary)

        end = time.time()
        print(f"Summary time: {end - start:.4f} seconds")
        return summary.strip()

    # -------------------------
    # Sliding window over original text
    # -------------------------
    def sliding_window_text(self, text: str, window_size=None, overlap=None):
        window_size = window_size or self.default_window_size
        overlap = overlap or self.default_overlap

        words = text.split()
        words_count = len(words)

        max_words = self.max_words_for_tokens(window_size)
        chunks = []
        start = 0
        while start < words_count:
            end = min(start + max_words, words_count)
            chunk = " ".join(words[start:end])
            chunk_tokens = self.estimate_tokens(chunk)
            print(f"Chunk: {chunk_tokens} tokens (approx)")
            chunks.append(chunk)
            if end >= words_count:
                break
            start += max_words - overlap
        return chunks

    # -------------------------
    # Recursive batching for summaries
    # -------------------------
    def recursive_summarize_summaries(
        self, summaries, max_input_tokens=None, target_words=None
    ):
        print("Recursive summarize")
        max_input_tokens = max_input_tokens or self.default_max_input_tokens

        combined_summaries = []
        current_batch = []
        current_len = 0

        for s in summaries:
            s_len = self.estimate_tokens(s)
            if current_len + s_len > max_input_tokens:
                batch_text = " ".join(current_batch)
                combined_summaries.append(
                    self.summarize_chunk(batch_text, target_words)
                )
                current_batch = [s]
                current_len = s_len
            else:
                current_batch.append(s)
                current_len += s_len

        if current_batch:
            batch_text = " ".join(current_batch)
            combined_summaries.append(
                self.summarize_chunk(batch_text, target_words)
            )

        if len(combined_summaries) > 1:
            return self.recursive_summarize_summaries(
                combined_summaries, max_input_tokens, target_words
            )
        else:
            return combined_summaries[0]

    def __model_setup(self):
        self.model_name = os.getenv("SUMMARIZATION_MODEL_NAME", "smollm2:135m")
        # Context-aware defaults
        chunk_size = int(os.getenv("SUMMARIZATION_CHUNK_SIZE", 7500))
        self.default_max_input_tokens = chunk_size
        self.default_window_size = chunk_size  # safety margin
        self.default_overlap = int(os.getenv("SUMMARIZATION_CHUNK_OVERLAP", 300))  # overlap for coherence
        self.default_summary_words = 300  # final output length guide


    # -------------------------
    # Full hierarchical summarization
    # -------------------------
    def summarize(self, text: str, target_words=None) -> str:
        total_tokens = self.estimate_tokens(text)
        print(f"Total tokens (approx): {total_tokens}")
        print(f"Using model: {self.model_name}")

        if total_tokens <= self.default_window_size:
            # Text fits in one go → skip chunking and recursive summarization
            print("Text fits into context, summarizing directly.")
            return self.summarize_chunk(text, target_words or self.default_summary_words)

        # Stage 1: Sliding window on original text
        chunks = self.sliding_window_text(
            text,
            window_size=self.default_window_size,
            overlap=self.default_overlap
        )
        print(f"Chunks: {len(chunks)}")
        chunk_summaries = [self.summarize_chunk(c) for c in chunks]

        start = time.time()
        # Stage 2: Recursive batching on chunk summaries
        final_summary = self.recursive_summarize_summaries(
            chunk_summaries,
            max_input_tokens=self.default_max_input_tokens,
            target_words=target_words or self.default_summary_words
        )
        end = time.time()
        print(f"Final (recursive summary) time: {end - start:.4f} seconds")
        return final_summary
