from qdrant_client import QdrantClient, http
from qdrant_client.models import Distance, VectorParams, PointStruct
from qdrant_client.http.models import Distance, VectorParams
import spacy
from sentence_transformers import SentenceTransformer
import json
from langchain import PromptTemplate, LLMChain
from langchain.llms import OpenAI
import tiktoken
import uuid
import numpy as np

from flask import Flask, request, jsonify, redirect, session
from flask_cors import CORS
import os
import textract
from docx import Document
import psycopg2
from dotenv import load_dotenv
import requests
from xml.etree import ElementTree as ET

# import boto3
import ocrmypdf
import PyPDF2
import tempfile
from pathlib import Path
from striprtf.striprtf import rtf_to_text
from bs4 import BeautifulSoup
import init_db
import json
from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session
from requests.auth import HTTPBasicAuth
import secrets

from qdrant_client import QdrantClient, http
from qdrant_client.models import Distance, VectorParams
from pprint import pprint
import spacy
from sentence_transformers import SentenceTransformer, util
from langchain import PromptTemplate
from huggingface_hub import InferenceClient
from langchain import HuggingFaceHub, LLMChain
import os
from langchain.llms import OpenAI
from langchain import PromptTemplate, LLMChain
from flask import Flask, request, jsonify
import json

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
CORS(app)

dotenv_path = Path(".env")
load_dotenv(dotenv_path)

#########################################################################################
# UPLOAD
#########################################################################################
init_db.migrate()

# AWS-Anmeldeinformationen konfigurieren
# session = boto3.Session(aws_access_key_id=os.getenv('AWS_KEY'), aws_secret_access_key=os.getenv('AWS_SECRET'), region_name='eu-west-2')
# recognition = session.client('recognition')

nlp = spacy.load("de_core_news_lg")
transformer = SentenceTransformer("distiluse-base-multilingual-cased-v1")

template = """Beantworten Sie die Frage anhand des unten stehenden Kontextes. Wenn die
Frage nicht mit den angegebenen Informationen beantwortet werden kann, antworten Sie
mit "Ich weiß es nicht".

{kontext}

Frage: {frage}

Antwort: "" """

prompt = PromptTemplate(template=template, input_variables=["kontext", "frage"])
## ccc apikey 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
llm = OpenAI(openai_api_key="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")
llm_chain = LLMChain(prompt=prompt, llm=llm)


# client = QdrantClient(host="localhost", port=6333)
client = QdrantClient(
    url="https://e8f6b21f-1ba1-48a2-8c16-4b2db7614403.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key="9YukVb-MQP-hAlJm58913eq4BImfEcREG58wg2cTnKJAoweChlJgvw",
)


def prepareText(content):
    toks = nlp(content)
    sentences = [[w.text for w in s] for s in toks.sents]
    token = sentences
    return token


def getText(filename, user_collection_name_):
    # with open(filename) as f:
    #        text = f.read()
    conn = psycopg2.connect(init_db.database_connection)
    cursor = conn.cursor()
    queryUser = "SELECT id FROM users WHERE auth0_id = %s LIMIT 1"
    cursor.execute(queryUser, (user_collection_name_,))
    user = cursor.fetchone()

    print(user)

    PostgreSQL_select_Query = (
        "select text from documents where filename = %s AND user_id = %s"
    )
    cursor.execute(PostgreSQL_select_Query, (filename, user))
    text = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return text


def num_tokens_from_string(userPrompt):
    encoding = tiktoken.get_encoding("cl100k_base")  # gpt3.5turbo and gpt4
    num_tokens = len(encoding.encode(userPrompt))
    return num_tokens


def is_scanned_pdf(file_path):
    with open(file_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text = page.extract_text()
            if text:
                # Es wurde Text auf der Seite gefunden
                return False
    return True


def extract_text_from_pdf(file_path):
    if is_scanned_pdf(file_path):
        # Das PDF ist gescannt, führe OCR-Texterkennung durch
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
            temp_pdf_path = temp_file.name
            ocrmypdf.ocr(file_path, temp_pdf_path)
            text = extract_text_from_pdf(temp_pdf_path)
            os.unlink(temp_pdf_path)
            return text

    # Das PDF ist textbasiert, extrahiere den Text
    text = textract.process(file_path, method="pdfminer")
    return text.decode("utf-8")


def extract_text_from_word_doc(file_path):
    if file_path.lower().endswith(".docx"):
        doc = Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs]
        text = "\n".join(paragraphs)
        return text
    # elif file_path.lower().endswith('.doc'):
    # TODO: .doc-Documents
    elif file_path.lower().endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as txt:
            text = txt.read()
        return text


def extract_text_from_rtf_html_xml_csv(file_path):
    if file_path.lower().endswith(".rtf"):
        with open(file_path, "r") as rtf:
            text = rtf.read()
            text = rtf_to_text(text)
        return text
    elif file_path.lower().endswith(".html"):
        with open(file_path, "r", encoding="utf-8") as file:
            soup = BeautifulSoup(file, "html.parser")
            text = soup.get_text(separator="\n")
        return text
    elif file_path.lower().endswith(".xml"):
        with open(file_path, "r", encoding="utf-8") as xml:
            text = xml.read()
        return text
    elif file_path.lower().endswith(".csv"):
        with open(file_path, "r", encoding="utf-8") as csv:
            text = csv.read()
        return text
    elif file_path.lower().endswith(".md"):
        with open(file_path, "r", encoding="utf-8") as md:
            text = md.read()
        return text


# Funktion zum Analysieren eines Bildes und Extrahieren von Labels
# def extract_text_from_image(image_path):
#     with open(image_path, 'rb') as image_file:
#         image_bytes = image_file.read()

#     response = recognition.detect_labels(Image={'Bytes': image_bytes}, MaxLabels=10, MinConfidence=75)

#     labels = [label['Name'] for label in response['Labels']]
#     return labels


def insert_document_to_database(user_id, filename, text):
    conn = psycopg2.connect(init_db.database_connection)
    cursor = conn.cursor()
    insert_query = (
        "INSERT INTO documents (user_id, filename, text) VALUES (%s, %s, %s);"
    )
    cursor.execute(insert_query, (user_id, filename, text))
    conn.commit()
    cursor.close()
    conn.close()


def insert_document_to_vectorDatabase(user_col, filename, text):
    tokText = prepareText(text)
    idx = 0

    for sentence in tokText:
        # print(sentence)
        try:
            vecSentence = transformer.encode([sentence])
        except:
            print("Bad input")
            print(sentence)
        # print(vecSentence)
        client.upsert(
            collection_name=user_col,
            points=[
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vecSentence[0].tolist(),  # numpy nparry.tolist
                    payload={"file": filename, "text": sentence},
                )
            ],
        )
        idx = idx + 1


@app.route("/upload", methods=["POST"])
def upload():
    username = request.args["user_name"]
    uploaded_files = request.files.getlist("files")
    filenames = []
    Path("temp").mkdir(parents=True, exist_ok=True)
    for uploaded_file in uploaded_files:
        filename = uploaded_file.filename
        # Speichere das hochgeladene Dokument temporär lokal

        temp_file_path = os.path.join(app.root_path, "temp", filename)
        uploaded_file.save(temp_file_path)

        # Extrahiere den Text aus dem hochgeladenen Dokument
        file_ext = os.path.splitext(filename)[1].lower()

        if file_ext == ".pdf":
            text = extract_text_from_pdf(temp_file_path)
        elif file_ext == ".docx" or file_ext == ".doc" or file_ext == ".txt":
            text = extract_text_from_word_doc(temp_file_path)
        elif (
            file_ext == ".rtf"
            or file_ext == ".html"
            or file_ext == ".xml"
            or file_ext == ".csv"
            or file_ext == ".md"
        ):
            text = extract_text_from_rtf_html_xml_csv(temp_file_path)
        else:
            text = ""

        user = get_user(username)

        # Füge das Dokument und den extrahierten Text zur Datenbank hinzu
        insert_document_to_database(user[0], filename, text)
        insert_document_to_vectorDatabase(user[1], filename, text)

        # Lösche das temporäre Dokument
        os.remove(temp_file_path)

        filenames.append(filename)

    return jsonify({"filenames": filenames})


def get_user(username):
    conn = psycopg2.connect(init_db.database_connection)
    cursor = conn.cursor()
    query = "SELECT * FROM public.users WHERE username = %s LIMIT 1"
    cursor.execute(query, (username,))
    user = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return user


@app.route("/user/create", methods=["POST"])
def init_user():
    user = request.json
    result = user
    conn = psycopg2.connect(init_db.database_connection)
    cursor = conn.cursor()
    query = "INSERT INTO users (auth0_id, username, email) VALUES (%s, %s, %s);"

    try:
        cursor.execute(query, (user["user_sub"], user["username"], user["email"]))
    except Exception as err:
        result = json.loads('{"error":"something went wrong"}')

    conn.commit()
    cursor.close()
    conn.close()

    return result


@app.route("/nextcloud")
def nextcloud():
    nextcloudUser = request.args.get("nextCloudUserName")
    clientId = request.args.get("clientId")
    clientSecret = request.args.get("clientSecret")
    authorizationUrl = request.args.get("authorizationUrl")
    redirect_uri = "http://127.0.0.1:7007/redirect"
    FILES_URL = f"{authorizationUrl}remote.php/dav/files/{nextcloudUser}/"
    TOKEN_URL = f"{authorizationUrl}index.php/apps/oauth2/api/v1/token"
    AUTHORIZATION_URL = f"{authorizationUrl}/index.php/apps/oauth2/authorize"

    data = {
        "client_id": clientId,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "read",
    }

    session["clientSecret"] = clientSecret  # Speichere clientSecret in der Session
    session[
        "authorizationUrl"
    ] = authorizationUrl  # Speichere die authorizationUrl in der Session
    session["clientId"] = clientId  # Speichere die clientId in der Session
    session["nextcloudUser"] = nextcloudUser  # Speichere die clientId in der Session
    session["token_url"] = TOKEN_URL  # Speichere die clientId in der Session
    session["files_url"] = FILES_URL  # Speichere die clientId in der Session
    session["redirect_uri"] = redirect_uri  # Speichere die clientId in der Session

    url = (
        AUTHORIZATION_URL
        + "?"
        + "&".join([f"{key}={value}" for key, value in data.items()])
    )
    return redirect(url)


@app.route("/redirect")
def getfiles():
    code = request.args.get("code")
    clientSecret = session.get("clientSecret")  # Hole clientSecret aus der Session
    authorizationUrl = session.get(
        "authorizationUrl"
    )  # Hole authorizationUrl aus der Session
    clientId = session.get("clientId")
    nextcloudUser = session.get("nextcloudUser")
    TOKEN_URL = session.get("token_url")
    FILES_URL = session.get("files_url")
    REDIRECT_URI = session.get("redirect_uri")
    Path("temp").mkdir(parents=True, exist_ok=True)

    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": clientId,
        "client_secret": clientSecret,
    }
    response = requests.post(TOKEN_URL, data=payload)
    access_token = response.json().get("access_token")

    if access_token:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.request("PROPFIND", FILES_URL, headers=headers)

        if response.status_code != 207:
            return "Fehler beim Abrufen der Dateien", 500

        root = ET.fromstring(response.content)
        files = [
            elem.text for elem in root.findall(".//{DAV:}href") if elem.text[-1] != "/"
        ]

    text_content = ""
    for file in files:
        filename = file.split("/")[-1]  # Dateiname aus der URL extrahieren
        file_ext = os.path.splitext(filename)[1].lower()

        download_url = f"{authorizationUrl}{file}"
        temp_file_path = os.path.join(app.root_path, "temp", filename)

        # Datei manuell herunterladen
        response = requests.get(
            download_url, headers={"Authorization": f"Bearer {access_token}"}
        )
        with open(temp_file_path, "wb") as f:
            f.write(response.content)

        # Text extrahieren
        if file_ext == ".pdf":
            text = extract_text_from_pdf(temp_file_path)
        elif file_ext in [".docx", ".doc", ".txt"]:
            text = extract_text_from_word_doc(temp_file_path)
        elif file_ext in [".rtf", ".html", ".xml", ".csv", ".md"]:
            text = extract_text_from_rtf_html_xml_csv(temp_file_path)
        else:
            text = ""

        # Text zur Textinhalt hinzufügen
        text_content += f"<h3>{filename}</h3><pre>{text}</pre>"

        # Temporäre Datei löschen
        os.remove(temp_file_path)

    return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Nextcloud File Explorer</title>
        </head>
        <body>
            <h1>Nextcloud File Explorer</h1>
            {text_content}
        </body>
        </html>
    """


#########################################################################################
# Init
# -----------
#########################################################################################
#
# Todo:
#
#########################################################################################
nlp = spacy.load("de_core_news_lg")
model = SentenceTransformer("multi-qa-MiniLM-L6-cos-v1")
transformer = SentenceTransformer("distiluse-base-multilingual-cased-v1")

# client = QdrantClient(host="localhost", port=6333)
client = QdrantClient(
    url="https://e8f6b21f-1ba1-48a2-8c16-4b2db7614403.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key="9YukVb-MQP-hAlJm58913eq4BImfEcREG58wg2cTnKJAoweChlJgvw",
)

# os.environ['HUGGINGFACEHUB_API_TOKEN'] = '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'
# os.environ["OPENAI_API_KEY"] = "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"

print("...prep")

template = """Beantworten Sie die Frage anhand des unten stehenden Kontextes. Wenn die
Frage nicht mit den angegebenen Informationen beantwortet werden kann, antworten Sie
mit "Ich weiß es nicht".

{kontext}

Frage: {frage}

Antwort: "" """


prompt = PromptTemplate(template=template, input_variables=["kontext", "frage"])
## ccc apikey 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
llm = OpenAI(openai_api_key="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")
llm_chain = LLMChain(prompt=prompt, llm=llm)


def prepareText(content):
    toks = nlp(content)
    sentences = [[w.text for w in s] for s in toks.sents]
    token = sentences
    return token


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
@app.route("/api/context", methods=["GET"])
def getContext():
    # get contet from request
    content = request.args.get("content")
    print(content)

    user_collection_name = request.args.get(
        "user_collection_name"
    )  # or auth0_id in db (user table)
    # todo: check if request is valid
    # [...]
    sentence = prepareText(content)
    vector = transformer.encode(sentence)
    print(vector[0].tolist())
    hits = client.search(
        collection_name=user_collection_name,
        query_vector=vector[0].tolist(),
        limit=3,  # magic number
    )

    # answer = '{"facts":[{"answer":1, "file":2, "score":3, "text":loremiosum}]}'
    tmpFactArray = []
    for hit in hits:
        tmpFact = {}
        tmpFact["answer"] = hit.payload.get("text")
        tmpFact["file"] = hit.payload.get("file")
        tmpFact["score"] = hit.score
        tmpFact["text"] = getText(hit.payload.get("file"), user_collection_name)
        tmpFactArray.append(tmpFact)
        print(hit)
    answer = {"facts": tmpFactArray}

    return answer


# Example answer JSON
# {
#   "facts": [
#     {
#       "answer": "|url = https://www.csoonline.com / article/3674836 / confidential - computing - what - is - it - and - why - do - you - need - it.html |accessdate=2023 - 03 - 12 |website = CSO Online } } < /ref >  ",
#       "file": "repo/ccc.txt",
#       "text": "text from file ..."
#     },
#     {
#       "answer": "[ [ Tencent ] ] and [ [ VMware]].<ref>{{Cite web |title = Confidential Computing Consortium Establishes Formation with Founding Members and Open Governance Structure |publisher = Linux Foundation |url = https://www.linuxfoundation.org / press / press - release / confidential - computing - consortium - establishes - formation - with - founding - members - and - open - governance - structure-2 |accessdate=2023 - 03 - 12}}</ref><ref>{{Cite web |last = Gold |first = Jack |date=2020 - 09 - 28 |title = Confidential computing : What is it and why do you need it ?",
#       "file": "repo/ccc.txt",
#       "text": "text from file ..."
#     },
#     {
#       "answer": "Mithril Security,<ref>{{Cite web |title = Mithril Security Democratizes AI Privacy Thanks To Daniel Quoc Dung Huynh|url = https://www.techtimes.com / articles/282785/20221102 / mithril - security - democratizes - ai - privacy - thanks - to - daniel - quoc - dung - huynh.htm|last = Thompson|first = David|date=2022 - 11 - 02|accessdate=2023 - 03 - 12}}</ref >",
#       "file": "repo/ccc.txt",
#       "text": "text from file ..."
#     },
#     [...]
#   ]
# }


#########################################################################################
# POST: llmaanswer
# -----------
# POST Body
#   * JSON :: json with context-text
# route
#   * /api/llmaanswer
# return
#  "answer":
#      "answer": "Both Northwind and Health Plus...exams and glasses."
#
#########################################################################################
#
# Todo:
#
#########################################################################################
@app.route("/api/llmanswer", methods=["POST"])
def getLLManswer():
    # get contet from request
    content = request.get_json()
    # print(content)
    # todo: check if request is valid
    # [...]

    kontext = ""
    for context in content["contexts"]:
        print(context["file"])
        kontext = kontext + context["file"] + "\n"
        kontext = kontext + context["editedText"] + "\n\n"

    frage = content["question"]

    # f = open("demofile2.txt", "a")
    # f.write(prompt.format(frage=frage,kontext=kontext))
    # f.close()

    toks = num_tokens_from_string(prompt.format(frage=frage, kontext=kontext))
    print(toks)
    # max 4097 tokens!

    if toks < 4098:
        answer = llm_chain.run({"kontext": kontext, "frage": frage})
    else:
        answer = "Uh, die Frage war zu lang!"
    return {"result": answer}


# {
#  "contexts": [
#    {
#      "file": "Molecule Man",
#      "editedText": "Lorem Ipsum1"
#    },
#    {
#      "file": "Molecule Man2",
#      "editedText": "Lorem Ipsum2 "
#    }
#  ],
#  "question": "this is the question?"
# }

# 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


#########################################################################################
# GET: POST
# -----------
# GET Parameter
#   * user_collection_name :: Word, sentence or paragraph from user
# route
#   * /api/createCollection
# return
#   * TRUE or FALSE
#########################################################################################
#
# Todo:
#   *  good return with error handling
#
#########################################################################################
@app.route("/api/createCollection", methods=["POST"])
def createCollection():
    # get contet from request
    content = request.get_json()
    print(content)
    # todo: check if request is valid
    # [...]
    # client = QdrantClient(host="localhost", port=6333)
    client = QdrantClient(
        url="https://e8f6b21f-1ba1-48a2-8c16-4b2db7614403.us-east-1-0.aws.cloud.qdrant.io:6333",
        api_key="9YukVb-MQP-hAlJm58913eq4BImfEcREG58wg2cTnKJAoweChlJgvw",
    )

    user_collection_name = content["user_collection_name"]
    print(user_collection_name)
    try:
        status = client.get_collection(collection_name=user_collection_name)
    except http.exceptions.UnexpectedResponse as e:
        error = json.loads(e.content)["status"]["error"]
        # Collection doesnt exist
        if (
            error
            == "Not found: Collection `" + user_collection_name + "` doesn't exist!"
        ):
            # create collection
            print("create collection: " + user_collection_name)
            client.recreate_collection(
                collection_name=user_collection_name,
                vectors_config=VectorParams(size=512, distance=Distance.COSINE),
            )
            return "True"
        # other Error
        else:
            print("other error")
            return "False"

    except Exception as exception:
        print("Something else went wrong")
        return "False"

    return "True"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=7007)
