import os
import tempfile

import ocrmypdf
import pypdf
import textract
from bs4 import BeautifulSoup
from docx import Document
from striprtf.striprtf import rtf_to_text


def save_file(folder_path, file):
    temp_file_path = os.path.join(folder_path, file.name)
    with open(temp_file_path, "wb+") as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    return temp_file_path


def extract_text(file_path, file_name):
    file_ext = os.path.splitext(file_name)[1].lower()

    match file_ext:
        case ".pdf":
            if __is_scanned_pdf(file_path):
                return __extract_text_from_scanned_pdf(file_path)
            return textract.process(file_path, method="pdfminer").decode("utf-8")

        case ".docx":
            doc = Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs]
            text = "\n".join(paragraphs)
            return text
        # TODO: .doc-Documents
        case ".rtf":
            text = __simple_extract(file_path)
            return rtf_to_text(text)
        case ".html":
            with open(file_path, "r", encoding="utf-8") as file:
                soup = BeautifulSoup(file, "html.parser")
                return soup.get_text(separator="\n")
        case _:
            return __simple_extract(file_path)


def __is_scanned_pdf(file_path):
    with open(file_path, "rb") as file:
        reader = pypdf.PdfReader(file)
        for page in reader.pages:
            text = page.extract_text()
            if text:
                # Es wurde Text auf der Seite gefunden
                return False
    return True


def __extract_text_from_scanned_pdf(file_path):
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
        temp_pdf_path = temp_file.name
        ocrmypdf.ocr(file_path, temp_pdf_path)
        text = textract.process(temp_pdf_path, method="pdfminer").decode("utf-8")
        os.unlink(temp_pdf_path)
        return text


def __simple_extract(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()
