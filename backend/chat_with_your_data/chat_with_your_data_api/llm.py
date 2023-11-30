import os
import tiktoken

from langchain import PromptTemplate, LLMChain
from langchain.llms import OpenAI

token_encoder = "cl100k_base"  # used for ChatGPT 3.5 Turbo and ChatGPT 4
llm = OpenAI(openai_api_key=os.getenv("OPEN_AI_KEY"))


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
    llm_chain = LLMChain(prompt=prompt_template, llm=llm)
    return llm_chain.run(prompt)
