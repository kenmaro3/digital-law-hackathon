from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.chains import SimpleSequentialChain


llm = OpenAI(model_name="text-davinci-003")
prompt_1 = PromptTemplate(
		input_variables=["job"],
		template="{job}に一番オススメのプログラミング言語は何?"
)
chain_1 = LLMChain(llm=llm, prompt=prompt_1)

prompt_2 = PromptTemplate(
    input_variables=["programming_language"],
    template="{programming_language}を学ぶためにやるべきことを3ステップで100文字で教えて。",
)
chain_2 = LLMChain(llm=llm, prompt=prompt_2)

overall_chain = SimpleSequentialChain(chains=[chain_1, chain_2], verbose=True)
print(overall_chain("データサイエンティスト"))
