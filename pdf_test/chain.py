from langchain.vectorstores import Pinecone
from langchain.embeddings.openai import OpenAIEmbeddings

from langchain.chat_models.openai import ChatOpenAI
from langchain.chains import VectorDBQAWithSourcesChain

import pinecone
from langchain.embeddings.openai import OpenAIEmbeddings

pinecone.init(
    api_key="", #api keyのセット
    environment="us-west4-gcp-free"
)

index_name = "pdf-example"

embedding = OpenAIEmbeddings()
vector_store = Pinecone.from_existing_index(
    index_name,
    embedding
)

llm = ChatOpenAI(model_name="gpt-3.5-turbo")
qa =VectorDBQAWithSourcesChain.from_chain_type(llm, chain_type="map_reduce", vectorstore=vector_store)

from langchain.agents import load_tools
from langchain.agents import initialize_agent
from langchain.agents import AgentType
from langchain.agents import Tool

tools = [
    Tool(
      name = "pinecone_searcher",
      func=qa,
      description="PDFを読み取った資料です"
  )
]

agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)


from langchain.chains.qa_with_sources.map_reduce_prompt import QUESTION_PROMPT
from langchain import PromptTemplate

template = """
あなたは親切なアシスタントです。下記の質問に日本語で回答してください。
質問：{question}
回答：
"""

prompt = PromptTemplate(
    input_variables=["question"],
    template=template,
)
query = "バックエンドを開発するときに使うべき言語はなんですか？"
question = prompt.format(question=query)
agent.run(question)
