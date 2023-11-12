from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.chains import SequentialChain

import os
os.environ["OPENAI_API_KEY"] = "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"

llm = OpenAI(model_name="text-davinci-003")
prompt_1 = PromptTemplate(
    input_variables=["adjective", "job"],
    template="{adjective}{job}に一番オススメのプログラミング言語は?\nプログラミング言語：",
)
chain_1 = LLMChain(llm=llm, prompt=prompt_1, output_key="programming_language")

prompt_2 = PromptTemplate(
    input_variables=["programming_language"],
    template="{programming_language}を学ぶためにやるべきことを3ステップで100文字で教えて。",
)
chain_2 = LLMChain(llm=llm, prompt=prompt_2, output_key="learning_step")

overall_chain = SequentialChain(
    chains=[chain_1, chain_2],
    input_variables=["adjective", "job"],
    output_variables=["programming_language", "learning_step"],
    verbose=True,
)
output = overall_chain({
    "adjective": "ベテランの",
    "job": "データサイエンティスト",
})
print(output)
