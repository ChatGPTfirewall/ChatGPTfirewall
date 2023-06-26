# Python demo script for vectorizing txt files

from sentence_transformers import SentenceTransformer, util
import spacy
from pathlib import Path
from qdrant_client import QdrantClient
import numpy as np
from qdrant_client.models import PointStruct
from pprint import pprint

class Text:
    path = ""
    token = ""
    vector = ""

    def __init__(self):
        self.path = ""
       
    def setPath(self, setPath):
        self.path = setPath

    def setToken(self, token):
        self.token = token

    def setVector(self, vector):
        self.vector = vector


################################################################


vectorlist = []

# collect txt
##############
filelist = list( Path( './repo' ).glob('**/*.txt') )

for file in filelist:
    tmpLine = Text()
    tmpLine.setPath(file)
    print(tmpLine.path) 
    vectorlist.append(tmpLine)

# tokenize sentences
####################
nlp = spacy.load('en_core_web_lg')

for file in vectorlist:
    with open(file.path) as f:
        text = f.read()
    toks = nlp(text)
    sentences = [[w.text for w in s] for s in toks.sents]
    sentences = []
    
    for sent in toks.sents:
        sentences.append([w.text for w in sent])
        #pprint([w.text for w in sent])
        pprint("OOOOOOOOOOOOOOOOOOOOOO")

    file.token = sentences
    print("#")
    
    
# Init EMB-Model
############
model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')


# create vectors
################
for text in vectorlist:
    pprint(text.token)
    vector = model.encode(text.token)
    text.setVector(vector)


# save vector and payload in qdrant
###################################
#client = QdrantClient(host="localhost", port=6333)
client = QdrantClient(
    url="https://e8f6b21f-1ba1-48a2-8c16-4b2db7614403.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key="9YukVb-MQP-hAlJm58913eq4BImfEcREG58wg2cTnKJAoweChlJgvw",
)

idx = 1
for file in vectorlist:
    print(file.token)
    print(file.vector)
    x = 0
    for vectorLine in file.vector:
        print(vectorLine)
        print(file.token[x])
        print(" ".join(file.token[x]))
        print("###")
        client.upsert(
            collection_name="my_collection2",
            points=[
                PointStruct(
                    id=x,
                    vector=vectorLine.tolist(),
                    payload={"file": file.path, "text": " ".join(file.token[x])}
                )
            ]
        )
        x = x+1
    print(x)