import os
import tiktoken

from langchain import PromptTemplate, LLMChain
from langchain.llms import OpenAI

template = """
Beantworten Sie die Frage anhand des unten stehenden Kontextes. Wenn die
Frage nicht mit den angegebenen Informationen beantwortet werden kann, antworten Sie
mit "Ich weiß es nicht".

{context}

Frage: 

{question}

Antwort: "" 
"""

token_encoder = "cl100k_base" # used for ChatGPT 3.5 Turbo and ChatGPT 4

prompt_template = PromptTemplate(template=template, input_variables=["context", "question"])
llm = OpenAI(openai_api_key=os.getenv("OPEN_AI_KEY"))

llm_chain = LLMChain(prompt=prompt_template, llm=llm)

def get_template():
    return prompt_template.template

def set_template(template_):
    # todo: check for keyword like context or question. (check l.33)
    template = template_
    # set new template
    prompt_template = PromptTemplate(template=template, input_variables=["context", "question"])
    # reinitialize llm_chain
    llm_chain = LLMChain(prompt=prompt_template, llm=llm)

def count_tokens(question, context):
    prompt = prompt_template.format(question=question, context=context)
    encoder = tiktoken.get_encoding(token_encoder) 
    return len(encoder.encode(prompt))

def run_llm(prompt):
    return llm_chain.run(prompt)
