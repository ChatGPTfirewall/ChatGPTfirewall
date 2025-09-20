from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    AutoConfig,
    AutoModelForCausalLM,
)
import torch
import time

class HierarchicalSummarizer:
    def __init__(self, model_name="facebook/bart-large-cnn", device=None):
        self.device = device if device else ("cuda" if torch.cuda.is_available() else "cpu")
        config = AutoConfig.from_pretrained(model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)

        # Decide model type
        if hasattr(config, "is_encoder_decoder") and config.is_encoder_decoder:
            self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        else:
            self.model = AutoModelForCausalLM.from_pretrained(model_name)

        self.default_max_input_tokens = 1024
        self.default_window_size = self.tokenizer.model_max_length  # <= 1024
        self.default_overlap = 200
        self.default_num_beams = 4  # greedy decoding → faster
        self.default_max_length = 150
        self.default_min_length = 50

    # -------------------------
    # Summarize a single chunk
    # -------------------------
    def summarize_chunk(self, text: str, min_len=None, max_len=None, num_beams=None) -> str:
        start = time.time()#TODO: Remove
        min_len = min_len or self.default_min_length
        max_len = max_len or self.default_max_length
        num_beams = num_beams or self.default_num_beams

        inputs = self.tokenizer(
            [text],
            max_length=self.default_max_input_tokens,  # BART input limit
            truncation=True,
            return_tensors="pt"
        ).to(self.device)

        summary_ids = self.model.generate(
            inputs["input_ids"],
            num_beams=num_beams,
            min_length=min_len,
            max_length=max_len,
            early_stopping=True
        )

        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)

        end = time.time()  # TODO: Remove
        print(f"Summary time: {end - start:.4f} seconds")
        return summary

    # -------------------------
    # Sliding window over original text
    # -------------------------
    def sliding_window_text(self, text: str, window_size=None, overlap=None):
        window_size = window_size or self.default_window_size
        overlap = overlap or self.default_overlap

        tokens = self.tokenizer.encode(text)
        print(f"Total tokens: {len(tokens)} tokens")
        chunks = []
        start = 0
        while start < len(tokens):
            end = start + window_size
            chunk = tokens[start:end]
            print(f"Token count: {len(chunk)} tokens")
            chunks.append(self.tokenizer.decode(chunk, skip_special_tokens=True))
            if end >= len(tokens):
                break
            start += window_size - overlap
        return chunks

    # -------------------------
    # Recursive batching for summaries
    # -------------------------
    def recursive_summarize_summaries(
        self, summaries, max_input_tokens=None, min_len=None, max_len=None
    ):
        print("In recursive summarize")
        max_input_tokens = max_input_tokens or self.tokenizer.model_max_length
        min_len = min_len or self.default_min_length
        max_len = max_len or self.default_max_length

        combined_summaries = []
        current_batch = []
        current_len = 0

        for s in summaries:
            s_len = len(self.tokenizer.encode(s))
            if current_len + s_len > max_input_tokens:
                batch_text = " ".join(current_batch)
                combined_summaries.append(self.summarize_chunk(batch_text, min_len=min_len, max_len=max_len))
                current_batch = [s]
                current_len = s_len
            else:
                current_batch.append(s)
                current_len += s_len

        if current_batch:
            batch_text = " ".join(current_batch)
            combined_summaries.append(self.summarize_chunk(batch_text, min_len=min_len, max_len=max_len))

        if len(combined_summaries) > 1:
            return self.recursive_summarize_summaries(combined_summaries, max_input_tokens, min_len, max_len)
        else:
            return combined_summaries[0]

    # -------------------------
    # Full hierarchical summarization
    # -------------------------
    def summarize(self, text: str) -> str:
        # Stage 1: Sliding window on original text
        chunks = self.sliding_window_text(text, window_size=self.default_window_size, overlap=self.default_overlap)
        print(len(chunks))
        for chunk in chunks:
            print(len(chunk))
        # return str(len(chunks))
        chunk_summaries = [self.summarize_chunk(c) for c in chunks]

        start = time.time()
        # Stage 2: Recursive batching on chunk summaries
        final_summary = self.recursive_summarize_summaries(chunk_summaries, max_input_tokens=self.default_max_input_tokens, min_len=self.default_min_length, max_len=self.default_max_length)
        end = time.time()
        print(f"Final (recursive summary) time: {end - start:.4f} seconds")
        return final_summary