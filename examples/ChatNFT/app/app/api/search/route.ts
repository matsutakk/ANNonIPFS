import { PromptTemplate } from "langchain/prompts";
import { OpenAIStream, OpenAIStreamPayload } from '@/features/OpenAIStream'
import { embeddingQuery } from '@/features/embeddings'
import { retrieveFromIPFS } from '@/features/ipfs';
import { lshQuery } from '@/features/lsh'
import { fetchCIDsFromBlockchain, fetchParams, params } from "@/features/contract";

type RequestData = {
  message: string
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing env var from OpenAI')
}

export async function POST(request: Request) {
  const { message } = (await request.json()) as RequestData

  if (!message) {
    return new Response('No message in the request', { status: 400 })
  }

  if(params.length === 0) {
    console.log("call fetchParams");
    await fetchParams();
  }
  
  // embedding query and hash it by lsh
  const embedding = await embeddingQuery(message);
  const lsh = await lshQuery(embedding, params);
  const hash = parseInt(lsh.split('').join(''), 2);

  // fetch CID from blockchain
  const cids = await fetchCIDsFromBlockchain(hash);

  let context:string = "";
  if(cids.Ok.length === 0) { 
    context = "マッチングが見つからなかったため、謝罪と違う入力の依頼をお客様にお願いいたします。"
  }
  else{
    const res = await retrieveFromIPFS(cids.Ok[0]);
    console.log(res);
  
    const decoder = new TextDecoder();
    let currentResponse: string[] = []
    const reader = res?.body?.getReader();
    if(reader === undefined) { return new Response('No reader in the response', { status: 400 }) }
    while (true) {
      const { done, value } = await reader.read();
      const chunkValue = decoder.decode(value)
      currentResponse = [...currentResponse, chunkValue]
      if (done) break;
    }
  
    console.log(currentResponse.join(""));
    context = currentResponse.join("");
    if(context.length > 1000) { return new Response('context is too long', { status: 500 }) }
  }

  // make prompt from cid and contents
  const promptTemplate = new PromptTemplate({
    inputVariables: ["context","message"],
    template: `
    あなたは与えられた入力に対して、おすすめNFTを紹介する超優秀なAIです。
    マッチングNFT情報をもとに、入力:「{message}」にマッチするおすすめNFTに関する情報を返信してください。
    マッチングNFT情報は、私が予め取得しておいた、入力にマッチしていそうと思われるNFTのmetadataをまとめたものです。

    以下のルールを守って回答を作成してください。
    ルール1 マッチングNFT情報はjsonなので、そのまま返さず、一般成人が理解できるような自然言語にしてください。必要に応じて見やすいように出力してください。
    ルール2 マッチングNFT情報にimageリンクがある場合、そのリンクのipfs://の部分を取り除き、「http://ipfs.io/ipfs/リンク内容」として出力してください。
    ルール3 私のこの指示の言葉遣いは参考にせず、なるべく自然な言葉で返してください。
    ルール4 マッチングNFT情報が、{message}の情報とあまり合致しない場合、追加の情報を求める返信をしてください。
    ルール5 マッチングNFT情報にattributesがある場合、「trait_typeの値；valueの値」を改行して出力してください。例えば、"trait_type:Type, value:Human"の場合、以下のような形式となります。
    
    Type: Human
    Hair: White
    以下省略

    必要であれば、回答例も参考にしてください。
    回答例:「
      条件に合うNFTを〇つお勧めいたします。1つ目、...。2つ目、...。3つ目、...。
    」

    以下がマッチング情報です。それでは、お客様への回答お願いいたします。
    マッチングNFT情報:
    {context}
    `,
  });

  const prompt = await promptTemplate.format({ context:context, message:message});
  
  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2048,
    stream: true,
    n: 1,
  }

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}