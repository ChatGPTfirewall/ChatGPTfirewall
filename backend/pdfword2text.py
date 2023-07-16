import os
import textract
from docx import Document
import psycopg2

def extract_text_from_pdf(file_path):
    # Extrahiere Text aus PDF-Datei mit Hilfe von textract
    text = textract.process(file_path, method='pdfminer')
    return text.decode('utf-8')


def extract_text_from_word(file_path):
    # Extrahiere Text aus Word-Dokument
    doc = Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs]
    text = '\n'.join(paragraphs)
    return text


def process_documents(database_connection):
    # Öffne eine Verbindung zur PostgreSQL-Datenbank
    conn = psycopg2.connect(database_connection)
    cursor = conn.cursor()

    # Abfrage, um alle Dateinamen aus der Tabelle abzurufen
    select_query = "SELECT filename FROM documents;"
    cursor.execute(select_query)
    filenames = cursor.fetchall()

    # Durchlaufe die Dateien
    for filename in filenames:
        file_path = filename[0]  # Nehme den Dateipfad aus der Abfrageergebniszeile

        file_ext = os.path.splitext(file_path)[1].lower()

        if file_ext == '.pdf':
            # Extrahiere Text aus PDF und speichere in der Datenbank
            text = extract_text_from_pdf(file_path)
            update_query = "UPDATE documents SET text = %s WHERE filename = %s;"
            cursor.execute(update_query, (text, file_path))

        elif file_ext == '.docx':
            # Extrahiere Text aus Word-Dokument und speichere in der Datenbank
            text = extract_text_from_word(file_path)
            update_query = "UPDATE documents SET text = %s WHERE filename = %s;"
            cursor.execute(update_query, (text, file_path))

    # Übertrage die Änderungen zur Datenbank und schließe die Verbindung
    conn.commit()
    cursor.close()
    conn.close()

# über eine .env-Datei die Login-Daten verwenden?
database_connection = "dbname=datadocs user=username password=password host=127.0.0.1 port=5432"
process_documents(database_connection)
