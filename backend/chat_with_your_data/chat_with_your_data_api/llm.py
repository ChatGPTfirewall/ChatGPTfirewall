import os

import tiktoken
from langchain.chains import LLMChain
from langchain_openai import OpenAI as LangChainOpenAI  
from langchain.prompts import PromptTemplate

token_encoder = "cl100k_base"  # used for ChatGPT 3.5 Turbo and ChatGPT 4
# llm = OpenAI(api_key=os.getenv("OPEN_AI_KEY"))  


def get_llm():
    """ LangChain OpenAI """
    return LangChainOpenAI(api_key=os.getenv("OPEN_AI_KEY"))


def count_tokens(template, question, context):
    prompt_template = PromptTemplate(
        template=template, input_variables=["context", "question"]
    )
    prompt = prompt_template.format(question=question, context=context)
    encoder = tiktoken.get_encoding(token_encoder)
    return len(encoder.encode(prompt))


def run_llm(template, prompt):
    prompt_template = PromptTemplate(
        template=template, input_variables=["context", "question"]
    )
    llm = get_llm()  
    llm_chain = LLMChain(prompt=prompt_template, llm=llm)
    return llm_chain.run(prompt)
