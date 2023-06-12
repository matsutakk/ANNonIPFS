import { embeddingQuery } from '@/utils/embeddings'
import { retrieveFromIPFS } from '@/utils/ipfs';
import lshQuery from '@/utils/lsh'
import { OpenAIStream, OpenAIStreamPayload } from '@/utils/OpenAIStream'
import { PromptTemplate } from "langchain/prompts";


type RequestData = {
  message: string
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing env var from OpenAI')
}

// const promptTemplate

export async function POST(request: Request) {
  const { message } = (await request.json()) as RequestData

  if (!message) {
    return new Response('No message in the request', { status: 400 })
  }


  const embedding = await embeddingQuery(message);
  const lsh = await lshQuery(embedding);
  
  // fetch CID from blockchain
  // const cid = await fetchCID(message);

  // get meta data from IPFS
  const res = await retrieveFromIPFS("");
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
  const context = currentResponse.join("");
  if(context.length > 1000) { return new Response('context is too long', { status: 500 }) }

  // make prompt from cid and contents
  const promptTemplate = new PromptTemplate({
    inputVariables: ["context","message"],
    template: `
    あなたは与えられた入力に対して、おすすめのNFTを紹介する超優秀なAIです。
    マッチングNFT情報をもとに、入力:「{message}のようなNFTを紹介してください。」に対するおすすめNFTを返してください。
    マッチングNFT情報は、与えられた入力に対して私が返すべきNFTのmetadataをまとめたものです。

    以下のルールを守って回答を作成してください。
    ルール1 マッチングNFT情報はjsonなので、そのまま返さず、一般成人が理解できるような自然言語にしてください。
    ルール2 マッチングNFT情報にimageリンクがある場合、そのリンクを返してください。

    マッチングNFT情報:
    {context}
    `,
  });

  const prompt = await promptTemplate.format({ context:context, message:message});

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
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
