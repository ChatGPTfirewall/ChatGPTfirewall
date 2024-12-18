import os
import spacy
from spacy.language import Language
from spacy.tokens import Doc
from sentence_transformers import SentenceTransformer

# Load spaCy models
nlp_de = spacy.load("de_core_news_lg")
nlp_en = spacy.load("en_core_web_lg")

# Custom component to detect various text structures
@Language.component("custom_segmenter")
def custom_segmenter(doc: Doc) -> Doc:
    if doc.is_parsed:
        return doc  # Avoid modifying if the document is already parsed

    for i, token in enumerate(doc[:-1]):
        # Start a new segment before numbered points like "(1)" or "1."
        if token.text in ["(", "1", "2", "3", "4", "5", "6", "7", "8", "9"] and doc[i + 1].text in [".", ")"]:
            if i > 0:
                doc[i].is_sent_start = True
            doc[i].is_sent_start = True
            if doc[i + 1].text == ")" and i + 2 < len(doc):
                doc[i + 2].is_sent_start = False  # Keep the content together with the subsection number
            elif doc[i + 1].text == "." and i + 2 < len(doc):
                doc[i + 2].is_sent_start = False  # Keep the content together with the number

        # Ensure that points like "1." "2." etc., stay intact with the following text
        elif token.text.isdigit() and doc[i + 1].text == ".":
            if i > 0:
                doc[i].is_sent_start = True
            if i + 2 < len(doc):
                doc[i + 2].is_sent_start = False

        # Handle cases like "(1)" and keep the text together
        elif token.text.startswith("(") and token.text.endswith(")"):
            if token.text[1:-1].isdigit() and i > 0:
                doc[i].is_sent_start = True
            if i + 1 < len(doc):
                doc[i + 1].is_sent_start = False

        # Avoid segmenting very short tokens like "(" or "2" as a separate sentence
        if len(token.text.strip()) < 2:
            doc[i].is_sent_start = False

    return doc

# Add the custom component before the parser
nlp_en.add_pipe("custom_segmenter", before="parser")
nlp_de.add_pipe("custom_segmenter", before="parser")

# Initialize the transformer model
transformer = SentenceTransformer(
    os.getenv("TRANSFORMER_MODEL", "paraphrase-multilingual-mpnet-base-v2")
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

def categorize(text: str):
    """
    Categorize the input text into chapters/headings.

    Args:
        text (str): The input text to analyze.

    Returns:
        List[Tuple[str, int]]: A list of tuples where each tuple contains a heading (str) 
                               and its line number (int) in the text.
    """
    headings = []
    lines = text.splitlines()

    for i, line in enumerate(lines):
        line = line.strip()  # Remove leading/trailing whitespace
        if len(line) == 0:  # Skip empty lines
            continue
        
        # Check if the line meets the heading criteria
        if (
            len(line.split()) <= 5  # Line is under 5 words
            and line[0].isupper()  # First letter of the first word is capitalized
            and not line.endswith((".", "!", "?"))  # Current line does not end with a sentence-ending char
            #and i + 1 < len(lines)  # There is a next line
            #and lines[i + 1].strip()  # Next line is not empty
            #and lines[i + 1].strip()[0].isupper()  # Next line starts with a capital letter
        ):
            headings.append((line, i + 1))

    return headings

def detect_entities(text, lang):
    nlp = nlp_de if lang == "de" else nlp_en
    doc = nlp(text)
    return doc.ents

def map_entities(entities, text, counter):
    entity_mapping = {}
    for entity in entities:
        entity_label = entity.label_
        original_value = entity.text
        if original_value not in entity_mapping:
            pseudo_value = generate_pseudo(entity_label, counter.get(entity_label, 0))
            counter[entity_label] = counter.get(entity_label, 1) + 1
            entity_mapping[original_value] = pseudo_value
    return entity_mapping

def generate_pseudo(entity_type, counter):
    return f"{entity_type}_{counter+1}"

def anonymize_text(text, entities, entity_mapping):
    parts = []
    prev_end = 0
    for entity in entities:
        start, end = entity.start_char, entity.end_char
        parts.append(text[prev_end:start])
        parts.append(entity_mapping.get(entity.text, entity.text))
        prev_end = end
    parts.append(text[prev_end:])
    return "".join(parts)