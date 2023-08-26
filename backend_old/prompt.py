from qdrant_client import QdrantClient
import numpy as np
from pprint import pprint
import spacy
from simple_elmo import ElmoModel
from termcolor import colored
from embModel import Model, Algo, embModel
from langchain import PromptTemplate
from huggingface_hub import InferenceClient
from langchain import HuggingFaceHub, LLMChain
import os


nlp = spacy.load('de_core_news_sm')

print(colored("Type Question (and press Enter):", "green"))
text = input()

toks = nlp(text)
sentences = [[w.text for w in s] for s in toks.sents]
token = sentences

print(colored(token,"red"))
print("#")

# Init
#######
# Init embModel
############
#model = embModel(Model.SENT2VEC, Algo.S2V_dil_multi_cased)
model = embModel(Model.SENTENCE_TRANFORM, Algo.SE_MSMARCO)
model.initModel()

# create vectors
################
vector = model.vectorize(token[0])
#print(colored(vector,"red"))
print("x")

#client = QdrantClient(host="localhost", port=6333)
client = QdrantClient(
    url="https://e8f6b21f-1ba1-48a2-8c16-4b2db7614403.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key="9YukVb-MQP-hAlJm58913eq4BImfEcREG58wg2cTnKJAoweChlJgvw",
)

#query_vector = np.random.rand(1024)
hits = client.search(
    collection_name="contracts",
    query_vector=vector[0].tolist(),
    limit=5  # Return 5 closest points
)

for hit in hits:
    print(colored(hit.payload.get("text"),"green"))
    print(colored("Score: " + str(hit.score),"green"))
    print(colored("File: " + str(hit.payload.get("file")),"green"))
    print(colored("###########################","red"))


#########################################

template = """Answer the question based on the context below. If the
question cannot be answered using the information provided answer
with "I don't know".

{context}

Question: {query}

Answer: """

prompt_template = PromptTemplate(
    input_variables=["query", "context"],
    template=template
)

filepath = str(hits[0].payload.get("file"))
with open(filepath) as f:
    textContext = f.read()

prompt = prompt_template.format(
    query=text,
    context=textContext
)


with open('readme.txt', 'w') as f:
    f.writelines(prompt)

#
#os.environ['HUGGINGFACEHUB_API_TOKEN'] = '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'
#
#print("...prep")
## initialize Hub LLM
#hub_llm = HuggingFaceHub(
#        repo_id='google/flan-t5-xl',
#    model_kwargs={'temperature':1e-10}
#)
#
#print("..ask")