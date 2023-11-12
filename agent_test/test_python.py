from langchain.llms import OpenAI
#from langchain.agents.agent_toolkits import create_python_agent
from langchain_experimental.agents.agent_toolkits import create_python_agent
#from langchain.tools.python.tool import PythonREPLTool
from langchain_experimental.tools.python.tool import PythonREPLTool

llm = OpenAI(model_name="text-davinci-003")
agent_executor = create_python_agent(
    llm=llm,
    tool=PythonREPLTool(),
    verbose=True,
)
agent_executor.run("5つ目の素数は何？")
