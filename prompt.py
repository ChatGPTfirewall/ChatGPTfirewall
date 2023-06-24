from qdrant_client import QdrantClient
import numpy as np
from pprint import pprint
import spacy
from simple_elmo import ElmoModel
from termcolor import colored


nlp = spacy.load('de_core_news_sm')

print(colored("Type Question (and press Enter):", "green"))
text = input()

toks = nlp(text)
sentences = [[w.text for w in s] for s in toks.sents]
token = sentences

print(colored(token,"red"))
print("#")


# Init Elmo
############
model = ElmoModel()

# load model (201.zip from http://vectors.nlpl.eu/repository/ [German Wikipedia Dump of March 2020] [VECTORSIZE: 1024]) 
model.load("/Users/robert/Documents/repoHSFlensburg/Forschungsprojekt/confidential-cloud-computing/repo/201")

# create vectors
################
vector = model.get_elmo_vector_average(token)
print(colored(vector,"red"))
print("x")

client = QdrantClient(host="localhost", port=6333)

#query_vector = np.random.rand(1024)
hits = client.search(
    collection_name="my_collection",
    query_vector=vector[0].tolist(),
    limit=5  # Return 5 closest points
)

for hit in hits:
    print(colored(hit.payload.get("text"),"green"))
    print(colored("###########################","red"))