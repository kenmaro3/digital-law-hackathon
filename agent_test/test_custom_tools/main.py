from langchain.llms import OpenAI
from langchain.chains import LLMMathChain
from langchain.chat_models import ChatOpenAI
from langchain.agents import Tool
from langchain.agents import load_tools
from langchain.agents import initialize_agent
from langchain.agents import AgentType
from langchain.tools import DuckDuckGoSearchRun
from langchain.memory import ConversationBufferMemory

from text_file_writer_tool import TextFileWriterTool
from similarity_search_tool import SimilaritySearchTool


search = DuckDuckGoSearchRun()

llm = ChatOpenAI(
    model="gpt-3.5-turbo-16k",
    temperature=0
)

llm_math_chain = LLMMathChain.from_llm(llm=llm, verbose=True)

tools = [
    Tool(
        name = "Search",
        func=search.run,
        description="useful for when you need to answer questions about current events. You should ask targeted questions"
    ),
    TextFileWriterTool(),
    SimilaritySearchTool()
]


from langchain.prompts import MessagesPlaceholder
agent_kwargs = {
    "extra_prompt_messages": [MessagesPlaceholder(variable_name="memory")],
}
memory = ConversationBufferMemory(memory_key="memory", return_messages=True)
mrkl = initialize_agent(tools, llm, agent=AgentType.OPENAI_FUNCTIONS, agent_kwargs=agent_kwargs, memory=memory, verbose=True)

# 会話ループ
user = ""
while user != "exit":
    user = input("入力してください:")
    print(user)
    if(user == "exit"):
        break
    ai = mrkl.run(input=user)
    print(ai)
