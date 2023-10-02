import spacy
import os
from sentence_transformers import SentenceTransformer

# https://spacy.io/models/de#de_core_news_lg
nlp_de = spacy.load("de_core_news_lg")
nlp_en = spacy.load("en_core_web_lg")
transformer = SentenceTransformer(os.getenv("TRANSFORMER_MODEL", "distiluse-base-multilingual-cased-v1"))

def prepare_text(text, lang):
    if lang == "de":
        toks = nlp_de(text)
    elif lang == "en":
        toks = nlp_en(text)
    else:
        raise ValueError('No languagetag present!')

    tokens = [[w.text for w in s] for s in toks.sents]
    return tokens

def return_ents(text, lang):
    if lang == "de":
        doc = nlp_de(text)
    elif lang == "en":
        doc = nlp_en(text)
    else:
        raise ValueError('No languagetag present!')
    return doc.ents

def vectorize(tokens):
    return transformer.encode(tokens)
