from qdrant_client import QdrantClient
from pprint import pprint
import spacy
import tensorflow as tf
from sentence_transformers import SentenceTransformer, util
from termcolor import colored

from flask import Flask, request
import os
import textract
from docx import Document
import psycopg2
from dotenv import load_dotenv
# import boto3
from pathlib import Path

app = Flask(__name__)

dotenv_path = Path('.env')
load_dotenv(dotenv_path)

#########################################################################################
# Init
# -----------
#########################################################################################
#
# Todo:
#
#########################################################################################
nlp = spacy.load('en_core_web_lg')
model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')



# client = QdrantClient(host="localhost", port=6333)
client = QdrantClient(
    url="https://e8f6b21f-1ba1-48a2-8c16-4b2db7614403.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key="9YukVb-MQP-hAlJm58913eq4BImfEcREG58wg2cTnKJAoweChlJgvw",
)

#########################################################################################
# GET: Context
# -----------
# GET Parameter
#   * content :: Word, sentence or paragraph from user
# route
#   * /api/context
# return
#  "context": 
#      "answer": "Both Northwind and Health Plus...exams and glasses.",     |
#      "file": "Benefit_Options-2.pdf",                                     | n-th time
#      "score": 59.6                                                        | 
#
#########################################################################################
#
# Todo:
#   *  GET Parameter: Number of context parts 
#   *  GET Parameter minimal Score
#
#########################################################################################
@app.route("/api/context" , methods=['GET'])
def getContext():
    # get contet from request 
    content = request.args.get('content')
    print(content)
    # todo: check if request is valid
    # [...]
    toks = nlp(content)
    print("1")
    sentences = [[w.text for w in s] for s in toks.sents]
    token = sentences
    print("1")
    #model.load("193")
    print(model )
    vector = model.encode(token)
    print("1")
    hits = client.search (
        collection_name="my_collection2",
        query_vector=vector[0].tolist(),
        limit=5  # Return 5 closest points
    )
    
    #answer = '{"facts":[{"answer":1, "file":2, "score":3}]}'
    tmpFactArray = []
    for hit in hits:
        tmpFact = {}
        tmpFact["answer"] = hit.payload.get("text")
        tmpFact["file"] = hit.payload.get("file")
        tmpFact["score"] = hit.score
        tmpFactArray.append(tmpFact)
        print(hit)
    answer = {"facts":tmpFactArray}

    return answer

# Example answer JSON
# {
#   "facts": [
#     {
#       "answer": "|url = https://www.csoonline.com / article/3674836 / confidential - computing - what - is - it - and - why - do - you - need - it.html |accessdate=2023 - 03 - 12 |website = CSO Online } } < /ref >  ",
#       "file": "repo/ccc.txt",
#       "score": 0.39699805
#     },
#     {
#       "answer": "[ [ Tencent ] ] and [ [ VMware]].<ref>{{Cite web |title = Confidential Computing Consortium Establishes Formation with Founding Members and Open Governance Structure |publisher = Linux Foundation |url = https://www.linuxfoundation.org / press / press - release / confidential - computing - consortium - establishes - formation - with - founding - members - and - open - governance - structure-2 |accessdate=2023 - 03 - 12}}</ref><ref>{{Cite web |last = Gold |first = Jack |date=2020 - 09 - 28 |title = Confidential computing : What is it and why do you need it ?",
#       "file": "repo/ccc.txt",
#       "score": 0.38119522
#     },
#     {
#       "answer": "Mithril Security,<ref>{{Cite web |title = Mithril Security Democratizes AI Privacy Thanks To Daniel Quoc Dung Huynh|url = https://www.techtimes.com / articles/282785/20221102 / mithril - security - democratizes - ai - privacy - thanks - to - daniel - quoc - dung - huynh.htm|last = Thompson|first = David|date=2022 - 11 - 02|accessdate=2023 - 03 - 12}}</ref >",
#       "file": "repo/ccc.txt",
#       "score": 0.38079184
#     },
#     {
#       "answer": "In their various implementations , TEEs can provide different levels of isolation including [ [ virtual machine ] ] , individual application , or compute functions.<ref>{{Cite web |last1 = Sturmann |first2 = Axel|last2= Simon |first1 = Lily |date=2019 - 12 - 02 |title = Current Trusted Execution Environment landscape |url = https://next.redhat.com/2019/12/02 / current - trusted - execution - environment - landscape/ |accessdate=2023 - 03 - 12 |website = Red Hat Emerging Technologies}}</ref>\\nTypically , data in use in a computer 's compute components and memory exists in a decrypted state and can be vulnerable to examination or tampering by unauthorized software or administrators.<ref name = spectrum>{{Cite web |title = What Is Confidential Computing?|url = https://spectrum.ieee.org / what - is - confidential - computing |accessdate=2023 - 03 - 12 |website = IEEE Spectrum|first = Fahmida|last = Rashid|date=2020 - 05 - 27}}</ref><ref>{{Cite web |title = What Is Confidential Computing and Why It 's Key To Securing Data in Use ?",
#       "file": "repo/ccc.txt",
#       "score": 0.37619933
#     },
#     {
#       "answer": "and others.\\n\\n==Confidential Computing Consortium==\\nConfidential computing is supported by an advocacy and technical collaboration group called the Confidential Computing Consortium.<ref name = ccc>{{Cite web |title = What is the Confidential Computing Consortium?|url = https://confidentialcomputing.io/ |accessdate=2023 - 03 - 12 |website = Confidential Computing Consortium } } < /ref >  ",
#       "file": "repo/ccc.txt",
#       "score": 0.36752164
#     }
#   ]
# }

# Upload route

DB_HOST=os.getenv('DB_HOST')
DB_PORT=os.getenv('DB_PORT')
DB_USER=os.getenv('DB_USER')
DB_NAME=os.getenv('DB_NAME')
DB_PASSWORD=os.getenv('DB_PASSWORD')
# Konfiguration für die PostgreSQL-Datenbank
database_connection = f"dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD} host={DB_HOST} port=5432"

# AWS-Anmeldeinformationen konfigurieren
# session = boto3.Session(aws_access_key_id=os.getenv('AWS_KEY'), aws_secret_access_key=os.getenv('AWS_SECRET'), region_name='eu-west-2')
# recognition = session.client('recognition')

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