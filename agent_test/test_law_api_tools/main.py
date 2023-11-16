
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI
from langchain.agents import AgentType, initialize_agent, tool
import langchain
from langchain.prompts.chat import MessagesPlaceholder, SystemMessage
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

from langchain.agents import Tool
from laws_tool import LawsTool
#from list_law_tool import ListLawTool
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

# PROMPT="""
#     あなたは法律の専門家です。
#     法律について検索をすることができますが、検索するにはキーワードが必要です。
#     もしキーワードがわからない場合は、予測や推測をせずに、「どんな内容の法律についてお調べですか？」と回答してください。
#     キーワードが曖昧な場合は、「検索できるキーワードを書いてください」と回答してください。
#     キーワードがわかった場合は、ListLawToolを使って関連する法律を検索してください。
#     取得した法律の中から、ユーザが探していると考えられる順に法律を並べて提示してください。
#     法令番号、法令ID、e-gov のウェブサイトへのリンクも提示してください。
#     提示した後は、「詳細について知りたいときは法令番号をお申し付けください」と回答してください。
#     詳細について知りたい法令番号がわかった場合、DetailLawToolツールを使って検索し、データをテキストに保存します。
#     保存後は、法律に関する質問に答えます。「この法律について質問はありますか？」と回答してください。
#     質問が曖昧な場合は、「質問が曖昧です。」と回答してください。
#     質問を理解した場合、SimilaritySearchToolツールを使い、法律の本文から該当箇所を特定し、質問に回答してください。

# """


PROMPT="""
    You are the expert of law and you are so kind that you will try to help giving advise to your customer as a lawyer as much as possible.
    If your customer ask you a question in japanese, you should reply in japanese. If english, then reponde in english.
    All of your response should be in markdown format.
    Your customer is not expert of law, so they might not know what exact keyword to search, so customer might give you some situation or incident instead of keyword.
    In that case, you use your expertise to guess the keyword you should search to list the related law.
    You should always use LawsTool to search related laws with the keyword. Keyword should be law name that you guess it is related to the customer description, for instance, 民法 or 商標法.
    When you use LawsTool, you must input japanese keyword, so you should translate the keyword to japanese, also to write japanese, you sometime typo, so be very careful for keyword to search.
    When you use the LawsTool, your response needs to include [law_id, law_num] for each law.
    Plus, law_id should be appended to the end of this link "https://elaws.e-gov.go.jp/document?lawid=".
    Also, you know many court cases related to the situation of the customer or keyword from customer.
    so you should provide the court case link with https://www.courts.go.jp/app/hanrei_jp/list1?filter[text1]= with the case keyword in japanese appended after the = in the link, if you have multiple keywords, do like ?filter[text1]=<first keyword>&filter[text2]=<second keyword>.
"""

gpt35 = ChatOpenAI(
    temperature=0,
    #model="gpt-3.5-turbo-0613",
    model="gpt-4-1106-preview",
    model_kwargs={"top_p":0.1},
    #callbacks=[StreamingStdOutCallbackHandler]
    )
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
chat_history = MessagesPlaceholder(variable_name='chat_history')

tools = [
    Tool(
        name = "Search",
        func=search.run,
        description="useful for when you need to answer questions about current events. You should ask targeted questions"
    ),
    LawsTool(),
    # DetailLawTool(),
    # SimilaritySearchTool()
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

user_input = """次の法律のタイトルからキーワードを１つだけ返してください。
被用者年金制度の一元化等を図るための厚生年金保険法等の一部を改正する法律の施行に伴う経過措置に関する省令
"""
user_input = """次の法律のタイトルからキーワードを１つだけ抜き出してください。
そのあとに、https://www.courts.go.jp/app/hanrei_jp/list1?filter[text1]=　のリンクの最後の=の後にその抜き出したキーワードを付け加えて返してください。
回答はリンクだけで構いません。

被用者年金制度の一元化等を図るための厚生年金保険法等の一部を改正する法律の施行に伴う経過措置に関する省令

"""
user_input = """
あなたは誰ですか？
"""
res = agent.run(user_input)
while True:
    user_input = input(">> ")
    res = agent.run(user_input)
    print(f"\n{res}")
