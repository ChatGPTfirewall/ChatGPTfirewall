import spacy
import os
from sentence_transformers import SentenceTransformer

# https://spacy.io/models/de#de_core_news_lg
nlp = spacy.load(os.getenv("SPACY_NLP_MODEL", "de_core_news_lg"))
transformer = SentenceTransformer(os.getenv("TRANSFORMER_MODEL", "distiluse-base-multilingual-cased-v1"))

def prepare_text(text):
    toks = nlp(text)
    sentences = [[w.text for w in s] for s in toks.sents]
    tokens = sentences
    return tokens

def vectorize(tokens):
    return transformer.encode(tokens)