from flask import Flask, render_template, request
import os
import textract
from docx import Document
import psycopg2

app = Flask(__name__)

# Konfiguration für die PostgreSQL-Datenbank
database_connection = "dbname=datadocs user=robert password=postgres host=localhost port=5432"


def extract_text_from_pdf(file_path):
    text = textract.process(file_path, method='pdfminer')
    return text.decode('utf-8')


def extract_text_from_word(file_path):
    doc = Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs]
    text = '\n'.join(paragraphs)
    return text


def insert_document_to_database(filename, text):
    conn = psycopg2.connect(database_connection)
    cursor = conn.cursor()
    insert_query = "INSERT INTO documents (filename, text) VALUES (%s, %s);"
    cursor.execute(insert_query, (filename, text))
    conn.commit()
    cursor.close()
    conn.close()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload():
    uploaded_file = request.files['file']
    filename = uploaded_file.filename

    # Speichere das hochgeladene Dokument temporär lokal
    temp_file_path = os.path.join(app.root_path, 'temp', filename)
    uploaded_file.save(temp_file_path)

    # Extrahiere den Text aus dem hochgeladenen Dokument
    file_ext = os.path.splitext(filename)[1].lower()

    if file_ext == '.pdf':
        text = extract_text_from_pdf(temp_file_path)
    elif file_ext == '.docx':
        text = extract_text_from_word(temp_file_path)
    else:
        text = ''

    # Füge das Dokument und den extrahierten Text zur Datenbank hinzu
    insert_document_to_database(filename, text)

    # Lösche das temporäre Dokument
    os.remove(temp_file_path)

    return 'Dokument erfolgreich hochgeladen und Text extrahiert.'


if __name__ == '__main__':
    app.run(debug=True)
