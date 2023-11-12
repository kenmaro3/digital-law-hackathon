from langchain.llms import OpenAI
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory(return_messages=True)

memory.save_context(
    {"input": "AIとは何？"},
    {"output": "AIとは、人工知能のことです。"},
)
print(memory.load_memory_variables({}))
