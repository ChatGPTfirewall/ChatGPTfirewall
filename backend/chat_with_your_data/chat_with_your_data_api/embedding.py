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

def return_context(fact_, text_, score_, lang_, range_,contexttype_):
    if lang_ == "de":
        doc = nlp_de(text_)
    elif lang_ == "en":
        doc = nlp_en(text_)
    else:
        raise ValueError('No languagetag present!')
    text_sents = doc.sents
    i=0
    fact_index = 0 
    for sent in text_sents:
        if "".join(fact_.split()) == "".join(sent.text.split()):
            print("FOUND")
            print(i)
            fact_index = i

        i = i+1

    context = ""
    j = 0
    text_range_a = range(fact_index, fact_index+range_, 1)
    text_range_b = range(fact_index, fact_index-range_, -1)

    for sent in doc.sents:
        if contexttype_ == "context_a":
            if j in text_range_a:
                context = context + sent.text
                print("a")
        elif contexttype_ == "context_b":
            if j in text_range_b:
                context = context + sent.text
        j = j+1
        
    return context

def vectorize(tokens):
    return transformer.encode(tokens)
