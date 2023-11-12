from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI
from langchain.agents import AgentType, initialize_agent, tool
import langchain

import textwrap
def print_lines(text, w=80):
  for line in textwrap.wrap(text, width=w, replace_whitespace=False):
    print(line)

chat = ChatOpenAI(temperature=0)
print(chat.model_name)


memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

@tool
def get_word_length(word: str) -> int:
    """Returns the length of a word."""
    return len(word)

tools = [get_word_length]
agent = initialize_agent(tools, chat, agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION, verbose=True, memory=memory)

#print_lines(agent.agent.llm_chain.prompt.messages[0].prompt.template)

res = agent.run("Hello.")
print(res)
res = agent.run("Please tell me about you.")
print(res)
