from qdrant_client import QdrantClient
from pprint import pprint
import spacy
import tensorflow as tf
from simple_elmo import ElmoModel
from termcolor import colored

from flask import Flask, request, jsonify

app = Flask(__name__)

#########################################################################################
# Init
# -----------
#########################################################################################
#
# Todo:
#
#########################################################################################
nlp = spacy.load('en_core_web_lg')
graph = tf.Graph()
with graph.as_default() as elmo_graph:
    model = ElmoModel()
    # load model (193.zip from http://vectors.nlpl.eu/repository/ [German Wikipedia Dump of March 2020] [VECTORSIZE: 1024]) 
    model.load("193")

#client = QdrantClient(host="localhost", port=6333)
qdrant_client = QdrantClient(
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
def getCoontext():
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
    with graph.as_default():
            vector = model.get_elmo_vector_average(token)
    print("1")
    hits = client.search (
        collection_name="my_collection",
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

# Eample answer JSON
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