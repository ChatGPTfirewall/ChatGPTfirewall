from qdrant_client import QdrantClient
import numpy as np
from pprint import pprint
import spacy
from sentence_transformers import SentenceTransformer, util
from termcolor import colored


nlp = spacy.load('en_core_web_lg')

print(colored("Type Question (and press Enter):", "green"))
text = input()

toks = nlp(text)
sentences = [[w.text for w in s] for s in toks.sents]
token = sentences

print(colored(token,"red"))
print("#")


# Init EMB-Model
############
model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')

# create vectors
################
#pprint(token)

vector = model.encode(token)
#print(colored(vector,"red"))
#print("x")

#client = QdrantClient(host="localhost", port=6333)
client = QdrantClient(
    url="https://e8f6b21f-1ba1-48a2-8c16-4b2db7614403.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key="9YukVb-MQP-hAlJm58913eq4BImfEcREG58wg2cTnKJAoweChlJgvw",
)

hits = client.search(
    collection_name="my_collection2",
    query_vector=vector[0].tolist(),
    limit=5  # Return 5 closest points
)

for hit in hits:
    print(colored(hit.payload.get("text"),"green"))
    print(colored("Score: " + str(hit.score),"green"))
    print(colored("###########################","red"))