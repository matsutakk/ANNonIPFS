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
  console.log("hash is ", hash);

  // fetch CID from blockchain
  const cids = await fetchCIDsFromBlockchain(hash);
  console.log("cids is ", cids);

  let context:string = "";
  if(cids.Ok.length === 0) { 
    context = "Since we could not find a match, we ask the customer to apologize and request a different input."
  }
  else{
    const res = await retrieveFromIPFS(cids.Ok[0]);
    console.log(res);
    if(res === undefined) { return new Response('No response from IPFS', { status: 400 }) }
  
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

  console.log("making prompt")

  // make prompt from cid and contents
  const promptTemplate = new PromptTemplate({
    inputVariables: ["context","message"],
    template: `
    You are a superb AI that recommends NFTs for a given input. Based on the matching NFT information that I will give to you, please reply with information about recommended NFTs that match the input: "{message}". 
    The matching NFT information is a summary of NFT metadata that I have obtained in advance that seems to match the input. 

    Please follow the rules below to create your response. 
    Rule 1: Matching NFT information is in json, so please do not return it as is. Please output the information in an easy-to-read format. 
    Rule 2: If the matching NFT information contains image links, please add the image link to your response end after new line.
    Rule 3: Please do not refer to my wording of this instruction, please make response message in as natural a language as possible. 
    Rule 4: If the matching NFT information does not match the given input very well, please reply asking for additional information.
    Rule 5: Matching NFT information is in json. If the json have key "attributes", please output json key and its value. For example, in the case of "trait_type:Type, value:Human", the format is "Type: Human Hair: White"
    
    Beginning of sample answer: "We can recommend an NFT that meets your requirements. .... "
    
    Below is the matching information. Now, please respond to the customer. 
    Matching NFT information:.
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

  console.log("returning respons")
  return new Response(stream);
}