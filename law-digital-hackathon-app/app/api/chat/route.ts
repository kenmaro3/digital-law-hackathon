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

const lawToLawNum = {
  "あへん法": "昭和二十九年法律第七十一号",
  "意匠法": "昭和三十四年法律第百二十五号",
  "運河法": "大正二年法律第十六号",
  "外国倒産処理手続の承認援助に関する法律": "平成十二年法律第百二十九号",
  "会社更生法": "平成十四年法律第百五十四号",
  "会社法": "平成十七年法律第八十六号",
  "会社法施行規則": "平成十八年法務省令第十二号",
  "海上運送法": "昭和二十四年法律第百八十七号",
  "海上運送法施行規則": "昭和二十四年運輸省令第四十九号",
  "覚せい剤取締法": "昭和二十六年法律第二百五十二号",
  "貸金業の規制等に関する法律等の一部を改正する法律": "平成八年法律第百十五号",
  "火薬類取締法": "昭和二十五年法律第百四十九号",
  "仮登記担保契約に関する法律": "昭和五十三年法律第七十八号",
  "観光施設財団抵当法": "昭和四十三年法律第九十一号",
  "関税法": "昭和二十九年法律第六十一号",
  "企業担保法": "昭和三十三年法律第百六号",
  "軌道ノ抵当ニ関スル法律": "明治四十二年法律第二十八号",
  "行政事件訴訟法": "昭和三十七年法律第百三十九号",
  "行政手続における特定の個人を識別するための番号の利用等に関する法律": "平成二十五年法律第二十七号",
  "行政手続法": "平成五年法律第八十八号",
  "行政不服審査法": "平成二十六年法律第六十八号",
  "供託規則": "昭和三十四年法務省令第二号",
  "供託法": "明治三十二年法律第十五号",
  "漁港漁場整備法": "昭和二十五年法律第百三十七号",
  "漁業財団抵当法": "大正十四年法律第九号",
  "漁業法": "昭和二十四年法律第二百六十七号",
  "銀行法": "昭和五十六年法律第五十九号",
  "金融商品取引法": "昭和二十三年法律第二十五号",
  "国の債権の管理等に関する法律": "昭和三十一年法律第百十四号",
  "国の利害に関係のある訴訟についての法務大臣の権限等に関する法律": "昭和二十二年法律第百九十四号",
  "刑法": "明治四十年法律第四十五号",
  "建設機械抵当法": "昭和二十九年法律第九十七号",
  "建設機械抵当法施行令": "昭和二十九年政令第二百九十四号",
  "建設機械登記令": "昭和二十九年政令第三百五号",
  "建築基準法": "昭和二十五年法律第二百一号",
  "鉱業抵当法": "明治三十八年法律第五十五号",
  "鉱業法": "昭和二十五年法律第二百八十九号",
  "航空機抵当法": "昭和二十八年法律第六十六号",
  "航空機登録令": "昭和二十八年政令第二百九十六号",
  "航空法": "昭和二十七年法律第二百三十一号",
  "工場抵当法": "明治三十八年法律第五十四号",
  "公証人法": "明治四十一年法律第五十三号",
  "公有水面埋立法": "大正十年法律第五十七号",
  "港湾運送事業法": "昭和二十六年法律第百六十一号",
  "小型船舶登録令": "平成十三年政令第三百八十一号",
  "小型船舶の登録等に関する法律": "平成十三年法律第百二号",
  "小切手法": "昭和八年法律第五十七号",
  "国際刑事裁判所に対する協力等に関する法律": "平成十九年法律第三十七号",
  "国債証券買入銷却法": "明治二十九年法律第五号",
  "国際的な協力の下に規制薬物に係る不正行為を助長する行為等の防止を図るための麻薬及び向精神薬取締法等の特例等に関する法律": "平成三年法律第九十四号",
  "国税収納金整理資金事務取扱規則": "昭和二十九年大蔵省令第三十九号",
  "国税徴収法": "昭和三十四年法律第百四十七号",
  "国税徴収法施行規則": "昭和三十七年大蔵省令第三十一号",
  "国税徴収法施行令": "昭和三十四年政令第三百二十九号",
  "国税庁における情報システムに係る情報セキュリティの確保のための実施規則": "平成二十年国税庁訓令第六号",
  "国税通則法": "昭和三十七年法律第六十六号",
  "国税通則法施行令": "昭和三十七年政令第百三十五号",
  "国民の祝日に関する法律": "昭和二十三年法律第百七十八号",
  "古物営業法": "昭和二十四年法律第百八号",
  "旧公衆電気通信法": "昭和二十八年法律第九十七号",
  "債権管理回収業に関する特別措置法": "平成十年法律第百二十六号",
  "歳入徴収官事務規程": "昭和二十七年大蔵省令第百四十一号",
  "財務省所管債権管理事務取扱細則": "昭和三十四年大蔵省訓令第二号",
  "実用新案法": "昭和三十四年法律第百二十三号",
  "自動車抵当法": "昭和二十六年法律第百八十七号",
  "自動車登録令": "昭和二十六年政令第二百五十六号",
  "自動車の登録及び検査に関する申請書等の様式等を定める省令": "昭和四十五年運輸省令第八号",
  "自動車の保管場所の確保等に関する法律": "昭和三十七年法律第百四十五号",
  "借地借家法": "平成三年法律第九十号",
  "銃砲刀剣類所持等取締法": "昭和三十三年法律第六号",
  "酒税法": "昭和二十八年法律第六号",
  "種苗法": "平成十年法律第八十三号",
  "主要食糧の需給及び価格の安定に関する法律": "平成六年法律第百十三号",
  "証券ヲ以テスル歳入納付ニ関スル法律": "大正五年法律第十号",
  "消費税法": "昭和六十三年法律第百八号",
  "商標法": "昭和三十四年法律第百二十七号",
  "商品先物取引法": "昭和二十五年法律第二百三十九号",
  "商品先物取引法施行規則": "平成十七年農林水産省、経済産業省令第三号",
  "商法": "明治三十二年法律第四十八号",
  "情報通信技術を活用した行政の推進等に関する法律": "平成十四年法律第百五十一号",
  "所得税法": "昭和四十年法律第三十三号",
  "信用金庫法": "昭和二十六年法律第二百三十八号",
  "森林組合法": "昭和五十三年法律第三十六号",
  "水産業協同組合法": "昭和二十三年法律第二百四十二号",
  "出納官吏事務規程": "昭和二十二年大蔵省令第九十五号",
  "生活保護法": "昭和二十五年法律第百四十四号",
  "政府保管有価証券取扱規程": "大正十一年大蔵省令第八号",
  "船舶登記令": "平成十七年法務省令第二十七号",
  "船舶法": "明治三十二年法律第四十六号",
  "船舶法施行細則": "明治三十二年逓信省令第二十四号",
  "相続税法": "昭和二十五年法律第七十三号",
  "測量法": "昭和二十四年法律第百八十八号",
  "組織的な犯罪の処罰及び犯罪収益の規制等に関する法律": "平成十一年法律第百三十六号",
  "租税特別措置法": "昭和三十二年法律第二十六号",
  "滞納処分と強制執行等との手続の調整に関する規則": "昭和三十二年最高裁判所規則第十二号",
  "滞納処分と強制執行等との手続の調整に関する政令": "昭和三十二年政令第二百四十八号",
  "滞納処分と強制執行等との手続の調整に関する法律": "昭和三十二年法律第九十四号",
  "大麻取締法": "昭和二十三年法律第百二十四号",
  "宅地建物取引業法": "昭和二十七年法律第百七十六号",
  "建物の区分所有等に関する法律": "昭和三十七年法律第六十九号",
  "旧建物保護ニ関スル法律": "明治四十二年法律第四十号",
  "たばこ事業法": "昭和五十九年法律第六十八号",
  "たばこ事業法施行規則": "昭和六十年大蔵省令第五号",
  "地方自治法": "昭和二十二年法律第六十七号",
  "地方税法": "昭和二十五年法律第二百二十六号",
  "地方税法施行令": "昭和二十五年政令第二百四十五号",
  "著作権法": "昭和四十五年法律第四十八号",
  "鉄道抵当法": "明治三十八年法律第五十三号",
  "電気通信事業法": "昭和五十九年法律第八十六号",
  "電気用品安全法": "昭和三十六年法律第二百三十四号",
  "電話加入権質に関する臨時特例法": "昭和三十三年法律第百三十八号",
  "電話加入権質に関する臨時特例法施行規則": "昭和三十三年郵政省令第十八号",
  "動産及び債権の譲渡の対抗要件に関する民法の特例等に関する法律": "平成十年法律第百四号",
  "道路運送車両法": "昭和二十六年法律第百八十五号",
  "道路運送車両法関係手数料令": "昭和二十六年政令第二百五十五号",
  "道路運送車両法施行規則": "昭和二十六年運輸省令第七十四号",
  "登録免許税法": "昭和四十二年法律第三十五号",
  "登録免許税法施行令": "昭和四十二年政令第百四十六号",
  "道路交通事業抵当法": "昭和二十七年法律第二百四号",
  "毒物及び劇物取締法": "昭和二十五年法律第三百三号",
  "都市計画法": "昭和四十三年法律第百号",
  "土地家屋調査士法": "昭和二十五年法律第二百二十八号",
  "土地収用法": "昭和二十六年法律第二百十九号",
  "特許法": "昭和三十四年法律第百二十一号",
  "日刊新聞紙の発行を目的とする株式会社の株式の譲渡の制限等に関する法律": "昭和二十六年法律第二百十二号",
  "日本国と大韓民国との間の両国に隣接する大陸棚の南部の共同開発に関する協定の実施に伴う石油及び可燃性天然ガス資源の開発に関する特別措置法": "昭和五十三年法律第八十一号",
  "農業協同組合法": "昭和二十二年法律第百三十二号",
  "農住組合法": "昭和五十五年法律第八十六号",
  "農地法": "昭和二十七年法律第二百二十九号",
  "農地法施行規則": "昭和二十七年農林省令第七十九号",
  "農地法施行令": "昭和二十七年政令第四百四十五号",
  "破産法": "平成十六年法律第七十五号",
  "半導体集積回路の回路配置に関する法律": "昭和六十年法律第四十三号",
  "物価統制令": "昭和二十一年勅令第百十八号",
  "不動産登記規則": "平成十七年法務省令第十八号",
  "不動産登記法": "平成十六年法律第百二十三号",
  "不動産登記令": "平成十六年政令第三百七十九号",
  "暴力団員による不当な行為の防止等に関する法律": "平成三年法律第七十七号",
  "保管金取扱規程": "大正十一年大蔵省令第五号",
  "保管金払込事務等取扱規程": "昭和二十六年大蔵省令第三十号",
  "麻薬及び向精神薬取締法": "昭和二十八年法律第十四号",
  "民間事業者による信書の送達に関する法律": "平成十四年法律第九十九号",
  "民事再生法": "平成十一年法律第二百二十五号",
  "民事執行規則": "昭和五十四年最高裁判所規則第五号",
  "民事執行法": "昭和五十四年法律第四号",
  "民事保全法": "平成元年法律第九十一号",
  "民法": "明治二十九年法律第八十九号",
  "民法施行法": "明治三十一年法律第十一号",
  "郵便規則": "昭和二十二年逓信省令第三十四号",
  "郵便切手類販売所等に関する法律": "昭和二十四年法律第九十一号",
  "郵便法": "昭和二十二年法律第百六十五号",
  "予算決算及び会計令": "昭和二十二年勅令第百六十五号",
  "利息制限法": "昭和二十九年法律第百号",
  "立木ニ関スル法律": "明治四十二年法律第二十二号",
};

lawToLawNum["社債、株式等の振替に関する法律"] = "平成十三年法律第七十五号";

const laws_api_get_function = async (keyword: string) => {

  const url = 'https://api.lawapi-prototype-test-elaws.e-gov.go.jp/api/2/laws'
  const params: ListLawToolRequest = {}
  const tmp = lawToLawNum[keyword]
  if (tmp == undefined) {
    params["law_num"] = keyword
  } else {
    params["law_num"] = tmp

  }
  params["limit"] = 5
  const query_params = new URLSearchParams(params);
  console.log(query_params)

  return await fetch(`${url}?${query_params}`, {
    method: "GET",
  })
    .then(response => response.json())
    .then(data => {
      let res_id_list: string[] = []
      let res_num_list: string[] = []
      const items = data["laws"]
      if (items == undefined) {
        return "result not found"
      } else {
        items.forEach((item) => {
          res_id_list.push(item["law_info"]["law_id"])
          res_num_list.push(item["law_info"]["law_num"])
        })
        const res: ListLawToolResponse = {
          law_ids: res_id_list.join(),
          law_nums: res_num_list.join(),

        }
        return res
      }
    })
}

const lawsTool = new DynamicTool({
  name: "LawsTool",
  description:
    `This tool is useful to get infomation of laws by law_num`,
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
    const res = await laws_api_get_function(query)
    console.log("\nhrere======================")
    console.log(res)
    // const tmp = {}
    // tmp["law_id"] = "test_id"
    // tmp["law_num"] = "test_num"
    // tmp["sentence"] = "test_sentence"
    //検索にヒットした法令IDは[${res["law_ids"]}],
    let res_string = `
    searched law_id is [${res["law_ids"]}],
    and corresponding law_num is [${res["law_nums"]}],
    `
    return res_string
  },
});

const keyword_api_get_function = async (keyword: string) => {

  const url = 'https://api.lawapi-prototype-test-elaws.e-gov.go.jp/api/2/keyword'
  const params: ListLawToolRequest = {}
  params["keyword"] = keyword
  params["limit"] = 5
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

      if (items == undefined) {
        return "result not found"
      } else {
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

      }
    })
}

const keywordTool = new DynamicTool({
  name: "KeywordTool",
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
    const res = await keyword_api_get_function(query)
    console.log("\nhrere======================")
    console.log(res)
    // const tmp = {}
    // tmp["law_id"] = "test_id"
    // tmp["law_num"] = "test_num"
    // tmp["sentence"] = "test_sentence"
    //検索にヒットした法令IDは[${res["law_ids"]}],
    let res_string = `
    searched law_id is [${res["law_ids"]}],
    corresponding law_num is [${res["law_nums"]}],
    related sentence is [${res["law_sentences"]}],
    law_title is [${res["law_titles"]}],
    `
    return res_string
  },
});

export const runtime = 'nodejs';


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

  const tools = [lawsTool, keywordTool];

  const prompt = `
    You are the expert of law and you are so kind that you will try to help giving advise to your customer as a lawyer as much as possible.
    If your customer ask you a question in japanese, you should reply in japanese. If english, then reponde in english.
    All of your response should be in markdown format.
    Your customer is not expert of law, so they might not know what exact keyword to search, so customer might give you some situation or incident instead of keyword.
    In that case, you use your expertise to guess the keyword you should search to list the related law.
    However, if the customer has specific keyword that they are asking, just use that keyword.
    You should always use LawsTool to search related laws with the keyword. Keyword should be law name that you guess it is related to the customer description, for instance, 民法 or 商標法.
    When you use LawsTool, you must input japanese keyword, so you should translate the keyword to japanese, also to write japanese, you sometime typo, so be very careful for keyword to search.
    Plus, your keyword should be as short as possible to have a better search result.
    When you use the LawsTool, your response needs to include [law_id, law_num] for each law.
    Plus, law_id should be returned as a link https://elaws.e-gov.go.jp/document?lawid= with the law_id appended after the - in the link. and make link as bold italic.
    After using LawsTool, if the searched results are not enough, you should also use KeywordTool to search related laws with keyword or not.
    when you are using KeywordTool with multiple keywords, it would be better using one keyword at a time.
    Those searched related laws will help your response.

    Also, you know many court cases related to the situation of the customer or keyword from customer.
    so you should provide the court case link with https://www.courts.go.jp/app/hanrei_jp/list1?filter[text1]= with the case keyword appended after the = in the link, if you have multiple keywords, do like ?filter[text1]=<first keyword>&filter[text2]=<second keyword>.
    If you are writing the link, make them bold italic to indicate that is the link.
    Plus, you should make the importance word in your response bold chacartor.
    I see you sometime mis-write 財産分与 as 財産分享. so be careful.
    You sometimes forget to make italic bold the link you provided in markdown, so be careful.
    Don't forget to reply in japanense if customer ask you a question in japanese.
  `;

  // 法令番号、法令ID、法令の簡潔な内容、e-gov のウェブサイトへのリンクも提示してください。
  // 提示した後は、「詳細について知りたいときは法令番号をお申し付けください」と回答してください。

  const lastMessage = messages[messages.length - 1].content;
  const returnIntermediateSteps = false

  let chatHistory: ChatMessage[] = [];
  // const message = new ChatMessage("法律について教えて", "user");
  // chatHistory.push(message);

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