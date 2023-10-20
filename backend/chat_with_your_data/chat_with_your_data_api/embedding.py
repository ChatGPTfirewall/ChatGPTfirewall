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

def return_context(embedded_text, fact_, range_, contexttype_):
    text_sents = embedded_text.sents
    i = 0
    fact_index = 0
    for sent in text_sents:
        if "".join(fact_.split()) == "".join(sent.text.split()):
            print("FOUND")
            print(i)
            fact_index = i

        i = i + 1

    context = ""
    j = 0
    text_range_a = range(fact_index, fact_index + range_, 1)
    text_range_b = range(fact_index, fact_index - range_, -1)

    for sent in doc.sents:
        if contexttype_ == "context_a":
            if j in text_range_a:
                context = context + sent.text
                print("a")
        elif contexttype_ == "context_b":
            if j in text_range_b:
                context = context + sent.text
        j = j + 1

    return context


def vectorize(tokens):
    return transformer.encode(tokens)
