# Python demo script for vectorizing txt files

from simple_elmo import ElmoModel
import spacy
from pathlib import Path
from qdrant_client import QdrantClient
import numpy as np
from qdrant_client.models import PointStruct

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
    #print(text)
    toks = nlp(text)
    sentences = [[w.text for w in s] for s in toks.sents]
    file.token = sentences
    print("#")
    

# Init Elmo
############
model = ElmoModel()

# load model (201.zip from http://vectors.nlpl.eu/repository/ [German Wikipedia Dump of March 2020] [VECTORSIZE: 1024]) 
model.load("201")

# create vectors
################
for text in vectorlist:
    vector = model.get_elmo_vector_average(text.token)
    text.setVector(vector)


# save vector and payload in qdrant
###################################
client = QdrantClient(host="localhost", port=6333)

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
            collection_name="my_collection",
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