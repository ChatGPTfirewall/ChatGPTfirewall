import os

import tiktoken
from langchain.chains import LLMChain
from langchain_openai import OpenAI as LangChainOpenAI  # 用于 LangChain 集成
from langchain.prompts import PromptTemplate

token_encoder = "cl100k_base"  # used for ChatGPT 3.5 Turbo and ChatGPT 4
# llm = OpenAI(api_key=os.getenv("OPEN_AI_KEY"))  # 注释掉模块级别的初始化


def get_llm():
    """按需创建 LangChain OpenAI 实例"""
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
    llm = get_llm()  # 在函数中创建 LLM 实例
    llm_chain = LLMChain(prompt=prompt_template, llm=llm)
    return llm_chain.run(prompt)
