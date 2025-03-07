import os
import spacy
import re
import math
from spacy.language import Language
from spacy.tokens import Doc
from sentence_transformers import SentenceTransformer
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM


# Check if GPU is available
device = 'cuda' if torch.cuda.is_available() else 'cpu'

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

# Load the summarization model and tokenizer
bart_tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")
bart_model = AutoModelForSeq2SeqLM.from_pretrained("facebook/bart-large-cnn").to(device)

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

def return_embed_to_line(embedded_text_, fact_index, raw_text):
    # Split the raw text into lines
    raw_lines = raw_text.splitlines()
    
    # Get the sentence at the fact_index from the embedded text
    text_sents = list(embedded_text_.sents)
    if fact_index >= len(text_sents):
        raise ValueError("fact_index is out of range")
    
    target_sentence = text_sents[fact_index]
    target_sentence_text = target_sentence.text.strip()  # Get the text of the target sentence
    
    # Concatenate the raw text lines into a single string with line breaks
    concatenated_raw_text = "\n".join(raw_lines)
    
    # Find the starting and ending positions of the target sentence in the concatenated raw text
    start_pos = concatenated_raw_text.find(target_sentence_text)
    if start_pos == -1:
        raise ValueError("Target sentence not found in raw text")
    
    end_pos = start_pos + len(target_sentence_text)
    
    # Map the starting and ending positions back to line numbers
    # Count the number of line breaks before the starting and ending positions
    start_line = concatenated_raw_text.count("\n", 0, start_pos) + 1
    end_line = concatenated_raw_text.count("\n", 0, end_pos) + 1
    
    # Calculate the middle line number and round it up
    middle_line = math.ceil((start_line + end_line) / 2)
    
    return middle_line

def vectorize(tokens):
    return transformer.encode(tokens)

def is_first_alpha_uppercase(line):
    # This function will return True if the first alphabetic character is uppercase, ignoring numbers or symbols.
    match = re.search(r'[a-zA-Z]', line)  # Find the first alphabetic character
    if match:
        first_alpha = match.group(0)
        return first_alpha.isupper()  # Check if the first alphabetic character is uppercase
    return False  # No alphabetic character found

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
            len(line.split()) <= 10  # Line is under 10 words
            and is_first_alpha_uppercase(line)  # First letter of the first word is capitalized
            and not line.endswith((".", "!", "?"))  # Current line does not end with a sentence-ending char
            and (
                i + 1 == len(lines)  # There is no next line
                or len(lines[i + 1].strip()) == 0  # Next line is empty
                or i + 1 < len(lines)  # There is a next line
                and lines[i + 1].strip()  # Next line is not empty
                and is_first_alpha_uppercase(lines[i + 1])  # Next line starts with a capital letter
            )
        ):
            headings.append((line, i + 1))

    # filter empty chapters
    filtered_headings = []
    skip_next = False
    for j, (heading, line_num) in enumerate(headings):
        if skip_next:
            skip_next = False
            continue

        if j + 1 < len(headings):
            next_heading_line_num = headings[j + 1][1]
            if all(len(lines[k].strip()) == 0 for k in range(line_num, next_heading_line_num - 1)):
                skip_next = True  # Mark to skip the next chapter and take heading of higher level
        elif all(len(lines[k].strip()) == 0 for k in range(line_num, len(lines))):
            continue  # Skip empty chapter at the end
        filtered_headings.append((heading, line_num))

    # Additional check if chapter content meets requirements (at least 15 words or a sentence-ending char)
    final_headings = []
    for j, (heading, line_num) in enumerate(filtered_headings):
        if j + 1 < len(filtered_headings):
            next_heading_line_num = filtered_headings[j + 1][1]
            chapter_content = " ".join(lines[line_num:next_heading_line_num])
        else:
            chapter_content = " ".join(lines[line_num:])

        if len(chapter_content.split()) >= 15 or any(char in chapter_content for char in [".", "!", "?"]):
            final_headings.append((heading, line_num))

    return final_headings

def summarize_text(text: str) -> str:
    """
    Summarizes the input text using the facebook/bart-large-cnn model.

    Args:
        text (str): The input text to summarize.

    Returns:
        str: The summarized text.
    """
    # Ensure the input does not exceed the maximum length allowed by the model
    max_input_length = bart_tokenizer.model_max_length
    inputs = bart_tokenizer([text], max_length=min(1024, max_input_length), truncation=True, return_tensors="pt").to(device)

    # Generate summary
    try:
        summary_ids = bart_model.generate(inputs["input_ids"], num_beams=4, max_length=150, early_stopping=True)
        return bart_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    except IndexError as e:
        print(f"Error generating summary: {e}")
        return "An error occurred during summarization. Please check input length and formatting."

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