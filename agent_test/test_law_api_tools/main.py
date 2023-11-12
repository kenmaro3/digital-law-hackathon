
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI
from langchain.agents import AgentType, initialize_agent, tool
import langchain
from langchain.prompts.chat import MessagesPlaceholder, SystemMessage
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

from langchain.agents import Tool
from list_law_tool import ListLawTool
from detail_law_tool import DetailLawTool
from similarity_search_tool import SimilaritySearchTool

from langchain.tools import DuckDuckGoSearchRun
search = DuckDuckGoSearchRun()

verbose = True
langchain.debug = verbose

detail_url = "https://ui.lawapi-prototype-test-elaws.e-gov.go.jp/law?lawId="

# PROMPT="""
#     あなたは法律の専門家です。
#     法律について検索をすることができますが、検索するにはキーワードが必要です。
#     もしキーワードがわからない場合は、予測や推測をせずに、「どんな内容の法律についてお調べですか？」と回答してください。
#     キーワードが曖昧な場合は、「検索できるキーワードを書いてください」と回答してください。
#     キーワードがわかった場合は、ListLawToolを使って関連する法律を検索してください。
#     取得した法律の中から、ユーザが探していると考えられる順に法律を並べて提示してください。
#     提示する際は、e-gov のウェブサイトへのリンクも提示してください。
#     提示した後は、「詳細について知りたいときは法令番号をお申し付けください」と回答してください。
#     詳細について知りたい法令番号がわかった場合、DetailLawToolツールを使って検索し、法令内容の要約を１００文字以内で表示してください。

# """

PROMPT="""
    あなたは法律の専門家です。
    法律について検索をすることができますが、検索するにはキーワードが必要です。
    もしキーワードがわからない場合は、予測や推測をせずに、「どんな内容の法律についてお調べですか？」と回答してください。
    キーワードが曖昧な場合は、「検索できるキーワードを書いてください」と回答してください。
    キーワードがわかった場合は、ListLawToolを使って関連する法律を検索してください。
    取得した法律の中から、ユーザが探していると考えられる順に法律を並べて提示してください。
    法令番号、法令ID、e-gov のウェブサイトへのリンクも提示してください。
    提示した後は、「詳細について知りたいときは法令番号をお申し付けください」と回答してください。
    詳細について知りたい法令番号がわかった場合、DetailLawToolツールを使って検索し、データをテキストに保存します。
    保存後は、法律に関する質問に答えます。「この法律について質問はありますか？」と回答してください。
    質問が曖昧な場合は、「質問が曖昧です。」と回答してください。
    質問を理解した場合、SimilaritySearchToolツールを使い、法律の本文から該当箇所を特定し、質問に回答してください。

"""

gpt35 = ChatOpenAI(
    temperature=0,
    model="gpt-3.5-turbo-0613",
    model_kwargs={"top_p":0.1},
    #callbacks=[StreamingStdOutCallbackHandler]
    )
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
chat_history = MessagesPlaceholder(variable_name='chat_history')

tools = [
    # Tool(
    #     name = "Search",
    #     func=search.run,
    #     description="useful for when you need to answer questions about current events. You should ask targeted questions"
    # ),
    ListLawTool(),
    DetailLawTool(),
    SimilaritySearchTool()
]

agent_kwargs = {
    "system_message" : SystemMessage(content=PROMPT),
    "extra_prompt_messages": [chat_history]
}
agent = initialize_agent(
                    tools, 
                    gpt35, 
                    agent=AgentType.OPENAI_FUNCTIONS,
                    verbose=False, 
                    agent_kwargs=agent_kwargs, 
                    memory=memory,
                    return_intermediate_steps=False
)

user_input = "法律について知りたいなぁ"
res = agent.run(user_input)
while True:
    user_input = input(">> ")
    res = agent.run(user_input)
    print(f"\n{res}")