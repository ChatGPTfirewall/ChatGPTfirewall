# Python demo script for vectorizing txt files

print("LOAD")
import spacy
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from qdrant_client.models import PointStruct
from pprint import pprint
from backend_old.embModel import Model, Algo, embModel

pprint("GO")

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
filelist = list( Path( './repo/contracts' ).glob('**/*.txt') )
textlist = []

for file in filelist:
    tmpLine = Text()
    tmpLine.setPath(file)
    #print(tmpLine.path) 
    textlist.append(tmpLine)

# tokenize sentences
####################
#nlp = spacy.load('de_core_news_sm')
nlp = spacy.load('en_core_web_lg')


for file in textlist:
    with open(file.path) as f:
        text = f.read()
    toks = nlp(text)
    sentences = [[w.text for w in s] for s in toks.sents]
    #for ent in toks.ents:
    #    print(ent.text, ent.start_char, ent.end_char, ent.label_)
    #pprint(sentences)
    for sentence in sentences:
        tmp = Text()
        tmp.path = file.path
        tmp.token = sentence
        vectorlist.append(tmp)
    print("#")
    
#exit()

# Init embModel
############
model = embModel(Model.SENTENCE_TRANFORM, Algo.SE_MSMARCO)
model.initModel()

# create vectors
################
for text in vectorlist:
    vector = model.vectorize(text.token)
    text.setVector(vector)
    #pprint(vector)
    pprint("lenght: " + str(len(vector[0])))

#exit()

# save vector and payload in qdrant
###################################
#client = QdrantClient(host="localhost", port=6333)
client = QdrantClient(
    url="https://e8f6b21f-1ba1-48a2-8c16-4b2db7614403.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key="9YukVb-MQP-hAlJm58913eq4BImfEcREG58wg2cTnKJAoweChlJgvw",
)

client.recreate_collection(
    collection_name="contracts",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)

idx = 1
for sentence in vectorlist:
    #print(sentence.token)
    #pprint(sentence.vector)
    client.upsert(
        #collection_name="my_collection",
        collection_name="contracts",
        points=[
            PointStruct(
                id=idx,
                vector=sentence.vector[0].tolist(),
                payload={"embModel": "Sentence_Transformer" ,"file": sentence.path, "text": " ".join(sentence.token)}
            )
        ]
    )
    idx= idx+1

print("Done")