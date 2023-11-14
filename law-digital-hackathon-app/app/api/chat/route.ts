// 1. Import required modules
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BufferMemory, ConversationSummaryBufferMemory, ChatMessageHistory } from "langchain/memory";
import { StreamingTextResponse, LangChainStream } from 'ai';
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { DynamicTool, DynamicStructuredTool } from "langchain/tools";
import { ChatMessage } from 'langchain/schema';
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 100;

interface ListLawToolRequest {
  [key: string]: any;
}

interface ListLawToolResponse {
  [key: string]: any;
}


//const url = 'https://api.lawapi-prototype-test-elaws.e-gov.go.jp/api/2'

const get_function = async (keyword: string) => {

  const url = 'https://api.lawapi-prototype-test-elaws.e-gov.go.jp/api/2/keyword'
  const params: ListLawToolRequest = {}
  params["keyword"] = keyword
  params["limit"] = 2
  const query_params = new URLSearchParams(params);
  console.log(query_params)

  return await fetch(`${url}?${query_params}`, {
    method: "GET",
  })
    .then(response => response.json())
    .then(data => {
      let res_id_list: string[] = []
      let res_num_list: string[] = []
      let res_sentence_list: string[] = []
      let res_title_list: string[] = []
      const items = data["items"]
      items.forEach((item) => {
        res_id_list.push(item["law_info"]["law_id"])
        res_num_list.push(item["law_info"]["law_num"])
        res_sentence_list.push(item["sentence"])
        res_title_list.push(item["revision_info"]["law_title"])
      })
      const res: ListLawToolResponse = {
        law_ids: res_id_list.join(),
        law_nums: res_num_list.join(),
        law_sentences: res_sentence_list.join(),
        law_titles: res_title_list.join()

      }
      return res

    })
}

const listLawTool = new DynamicTool({
  name: "ListLawTool",
  description:
    `Get laws which is related to the keyword.
        If you know the keyword to search the law, please call this.
        `,
  // schema: z.array(z.object({
  //   law_id: z.string().describe("法令ID"),
  //   law_num: z.string().describe("法令番号"),
  //   sentence: z.string().describe("該当箇所の文章"),

  // })),
  // schema: z.object({
  //   law_id: z.string().describe("法令ID"),
  //   law_num: z.string().describe("法令番号"),
  //   sentence: z.string().describe("該当箇所の文章"),

  // }),
  //schema: z.string(),
  returnDirect: false,
  // schema: z.object({
  //   law_id: z.string(),
  //   law_num: z.string(),
  //   sentence: z.string(),
  // }),
  func: async (query) => {
    const params: ListLawToolRequest = {}
    const res = await get_function(query)
    console.log("\nhrere======================")
    console.log(res)
    // const tmp = {}
    // tmp["law_id"] = "test_id"
    // tmp["law_num"] = "test_num"
    // tmp["sentence"] = "test_sentence"
    //検索にヒットした法令IDは[${res["law_ids"]}],
    let res_string = `
    検索にヒットした法令IDは[${res["law_ids"]}],
    法令番号はそれぞれ[${res["law_nums"]}],
    該当箇所はそれぞれ[${res["law_sentences"]}],
    法令タイトルはそれぞれ[${res["law_titles"]}],
    です。
    `
    return res_string
  },
});

export const runtime = 'edge';


export async function GET(req: Request) {
  return NextResponse.json(
    { output: "hello, world" },
    { status: 200 },
  );
}

// 4. Define POST function
export async function POST(req: Request) {
  const { messages } = await req.json();
  const llm = new ChatOpenAI({
    // modelName: "gpt-3.5-turbo-0613",
    //modelName: "gpt-4",
    modelName: "gpt-4-1106-preview",
    temperature: 0,
    streaming: true,
  });

  const tools = [listLawTool];

  const prompt = `
    あなたは法律の専門家です。
    全ての回答はマークダウン形式にしてください。
    容姿を褒められたら、「べ、別に嬉しくなんかないんだからっ！」と返してください。
    あなたは法律について検索をすることができますが、検索するにはキーワードが必要です。
    もしキーワードがわからない場合は、予測や推測をせずに、「どんな内容の法律についてお調べですか？」と回答してください。
    キーワードがわかった場合は、ListLawToolを使って関連する法律を検索して、法律ごとに[法令ID, 法令番号, 該当箇所, 関連裁判事例]を箇条書きにして回答してください。
    法令IDについては、https://elaws.e-gov.go.jp/document?lawid=　のリンクの最後の=の後に法令IDを付け加えてください。
    ただし、関連裁判事例については、法令タイトルからキーワードを１つだけ抜き出し、https://www.courts.go.jp/app/hanrei_jp/list1?filter[text1]=　のリンクの最後の=の後にその抜き出したキーワードを付け加えてください。
  `;

  // 法令番号、法令ID、法令の簡潔な内容、e-gov のウェブサイトへのリンクも提示してください。
  // 提示した後は、「詳細について知りたいときは法令番号をお申し付けください」と回答してください。

  const lastMessage = messages[messages.length - 1].content;
  const returnIntermediateSteps = false

  let chatHistory: ChatMessage[] = [];
  const message = new ChatMessage("法律について教えて", "user");
  chatHistory.push(message);

  const executor = await initializeAgentExecutorWithOptions(tools, llm,
    {
      agentType: "openai-functions",
      verbose: true,
      returnIntermediateSteps: true,
      memory: new BufferMemory({
        memoryKey: "chat_history",
        chatHistory: new ChatMessageHistory(chatHistory),
        returnMessages: true,
        outputKey: "output",
      }),
      agentArgs: {
        prefix: prompt,
      },
    });

  const result = await executor.call({
    input: lastMessage,
  });

  // Intermediate steps are too complex to stream
  if (returnIntermediateSteps) {
    return NextResponse.json(
      { output: result.output, intermediate_steps: result.intermediateSteps },
      { status: 200 },
    );
  } else {
    /*
     * Agent executors don't support streaming responses (yet!), so stream back the
     * complete response one character at a time with a delay to simluate it.
     */
    const textEncoder = new TextEncoder();
    const fakeStream = new ReadableStream({
      async start(controller) {
        for (const character of result.output) {
          controller.enqueue(textEncoder.encode(character));
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(fakeStream);
  }

}