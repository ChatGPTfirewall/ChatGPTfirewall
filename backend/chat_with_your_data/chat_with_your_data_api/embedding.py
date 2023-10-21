import spacy
import os
from sentence_transformers import SentenceTransformer

# https://spacy.io/models/de#de_core_news_lg
nlp_de = spacy.load("de_core_news_lg")
# https://spacy.io/models/de#en_core_web_lg
nlp_en = spacy.load("en_core_web_lg")

transformer = SentenceTransformer(
    os.getenv("TRANSFORMER_MODEL", "distiluse-base-multilingual-cased-v1")
)


def embed_text(text, lang):
    if lang == "de":
        return nlp_de(text)
    elif lang == "en":
        return nlp_en(text)
    else:
        raise ValueError("No languagetag present!")


def prepare_text(embedded_text):
    tokens = [[w.text for w in s] for s in embedded_text.sents]
    return tokens


def return_context(embedded_text_, fact_index, range_before_, range_after_):
    text_sents = list(embedded_text_.sents)

    context_before = ""

    text_range_before = range(max(fact_index - range_before_, 0), fact_index)

    context_after = ""

    text_range_after = range(
        fact_index + 1, min(fact_index + 1 + range_after_, len(text_sents))
    )

    for i, sent in enumerate(text_sents):
        if i in text_range_before:
            context_before += sent.text
        if i in text_range_after:
            context_after += sent.text

    return (context_before, context_after)


def vectorize(tokens):
    return transformer.encode(tokens)
