#########################################################################################
# embModel
#########################################################################################
#
# This class represents an abstraction of different embModels. Including:
#   * ELMO model with simple_elmo
#   * sentence transform with different algos
#
#########################################################################################
#from simple_elmo import ElmoModel
print("1")
#from sentence_transformers import SentenceTransformer, util
print("2")
from sent2vec.vectorizer import Vectorizer
print("loaded")

class Model:
    ELMO                = 1
    SENTENCE_TRANFORM   = 2
    SENT2VEC            = 3
    #OPEN_AI            = 4
    #AZURE              = 5

class Algo:
    ELMO_EN             = "193"
    ELMO_DE             = "201"
    SE_QA_L6_V1         = 'multi-qa-MiniLM-L6-cos-v1'
    S2V_dil_uncased     = "distilbert-base-uncased"
    S2V_dil_multi_cased = "distilbert-base-multilingual-cased"


# TODO SE_XXX [https://www.sbert.net/docs/pretrained_models.html]
# all-mpnet-base-v2
# multi-qa-mpnet-base-dot-v1
# all-distilroberta-v1
# all-MiniLM-L12-v2
# multi-qa-distilbert-cos-v1
# all-MiniLM-L6-v2
# paraphrase-multilingual-mpnet-base-v2
# paraphrase-albert-small-v2
# paraphrase-multilingual-MiniLM-L12-v2
# paraphrase-MiniLM-L3-v2
# distiluse-base-multilingual-cased-v1
# distiluse-base-multilingual-cased-v2 

class embModel:
    def __init__(self,model,algo): 
        self.usedModel = model
        self.usedAlgo  = algo
        self.rdy       = False 

    def initModel(self):
        if self.usedModel is not None and self.usedAlgo is not None:
            match self.usedModel:
                case Model.ELMO:
                    print("ELMO")
                    self.model = ElmoModel()
                    self.model.load(self.usedAlgo)
                    self.rdy = True
                case Model.SENTENCE_TRANFORM:
                    print("SE")
                    self.model = SentenceTransformer(Algo.SE_QA_L6_V1)
                    self.rdy = True
                case Model.SENT2VEC:
                    print("S2V")
                    self.model = Vectorizer(pretrained_weights=self.usedAlgo)
                    self.rdy = True

    def vectorize(self, tokenizedText):
        if self.rdy:
            match self.usedModel:
                case Model.ELMO:
                    print("ELMO")
                    vector = self.model.get_elmo_vector_average(tokenizedText)
                    return vector
                case Model.SENTENCE_TRANFORM:
                    print("SE")
                    vector = self.model.encode(tokenizedText)
                    return vector
                case Model.SENT2VEC:
                    print("S2V")
                    # uses no tokenized textx, put sentence as str in list
                    self.model.run([" ".join(str(x) for x in tokenizedText)])
                    # return just the vector
                    vector = self.model.vectors[0]
                    return vector



### test
print("go")
tmpClass = embModel(Model.SENT2VEC, Algo.S2V_dil_multi_cased)
tmpClass.initModel()
vec = tmpClass.vectorize([['Why', 'always', 'me', '?']])
print(vec)