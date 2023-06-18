import { PromptTemplate } from "langchain/prompts";
import { OpenAIStream, OpenAIStreamPayload } from '@/features/OpenAIStream'
import { embeddingQuery, encodingTextByClip } from '@/features/embeddings'
import { retrieveFromIPFS } from '@/features/ipfs';
import { cosineSimilarity, lshQuery } from '@/features/lsh'
import { fetchCIDsFromBlockchain, fetchParams, params } from "@/features/contract";

type RequestData = {
  message: string,
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing env var from OpenAI')
}

export async function POST(request: Request) {
  let { message } = (await request.json()) as RequestData

  if (!message) {
    return new Response('No message in the request', { status: 400 })
  }

  if(params.length === 0) {
    console.log("call fetchParams");
    await fetchParams();
  }
  
  // embedding query and hash it by lsh
  message = message.replace('Searching','');
  const embedding = await embeddingQuery(message);

  const bitPattern: number[] = [];
  const lsh = await lshQuery(embedding, params);
  let hashBit = lsh.split('');
  bitPattern.push(parseInt(hashBit.join(''),2));
  console.log("hash is ", bitPattern[0]);

  let context:string[] = [];
  for(let i = 0; i < bitPattern.length; i++){
    
    // fetch CID from blockchain
    const cids = await fetchCIDsFromBlockchain(bitPattern[i]);
    console.log("cids is ", cids);

    if(cids.Ok.length === 0) { 
      context.push("Since we could not find a match, we ask the customer to apologize and request a different input.")
    }
    else{
      for(let i = 0; i < Math.min(cids.Ok.length,3); i++){
        const res = await retrieveFromIPFS(cids.Ok[i]);
        if(res === undefined) { continue }
      
        const decoder = new TextDecoder();
        let currentResponse: string[] = []
        const reader = res?.body?.getReader();
        if(reader === undefined) { continue }
        while (true) {
          const { done, value } = await reader.read();
          const chunkValue = decoder.decode(value)
          currentResponse = [...currentResponse, chunkValue]
          if (done) break;
        }
      
        const info = currentResponse.join("")
        console.log(info);
        context.push(info)
      }
    }

    if(context.length > 10) { break; }
  }

  if(context.length === 0) { return new Response('No response from IPFS', { status: 500 }) }

  console.log("making prompt")

  // make prompt from cid and contents
  const promptTemplate = new PromptTemplate({
    inputVariables: ["context","message"],
    template: `
    You are a superb AI that recommends NFTs for a given input. Based on the matching NFT information that I will give to you, please reply with information about recommended NFTs that match the input: "{message}". 
    The matching NFT information is a summary of NFT metadata that I have obtained in advance that seems to match the input. This information may be incorrect for the given input, so, you should select and extract the correct information from the matching NFT information and reply to the customer.

    Please follow the rules below to create your response. 
    Rule 1: Your response should be in natural language. Easy to read and understand. You can add new lines to your response to make it easier to see.
    Rule 2: Matching NFT information can be interpreted as json, so please do not return it as is. Please output the information in an easy-to-read format. 
    Rule 3: If the matching NFT information json contains "image" key, please add the key's value to your response end after new line. Please do not add comma or period after image link value.
    Rule 4: Please do not refer to my wording of this instruction, please make response message in as natural a language as possible. 
    Rule 5: If the matching NFT information json have key "attributes", please output json key and its value one by one. For example, in the case of "trait_type:Type, value:Human", the format is "Type: Human Hair: White"
    Rule 6: If the matching NFT information is not empty, please make at least one recommendation even though the matching information may be incorrect.

    Beginning of sample answer: "We can recommend an NFT that meets your requirements. .... "
    
    Below is the matching information. Now, please respond to the customer. 
    Matching NFT information:
    {context}
    `,
  });

  const prompt = await promptTemplate.format({ context:context, message:message});
  
  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
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