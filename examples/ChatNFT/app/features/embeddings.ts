import { OpenAIEmbeddings } from "langchain/embeddings/openai";

if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing env var from OpenAI')
}

// if (!process.env.CLIP_API_KEY) {
//     throw new Error('Missing env var from Clip as a Service')
// }

export const embeddingQuery = async (text: string) => {
    const openAIembeddings: OpenAIEmbeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        timeout: 3000,
      });
      const res = await openAIembeddings.embedQuery(text);
      return res
};

export const encodingImageByClip = async (cid: string) => {
    return await fetch('https://evolving-lacewing-2d90dee9c4-http.wolf.jina.ai/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.CLIP_API_KEY as string,
        },
        body: JSON.stringify({
            data:[
                {"uri": cid},
            ],
            execEndpoint:"/",
        }),
    })
}

export const encodingTextByClip = async (text: string) => {
    return await fetch('https://evolving-lacewing-2d90dee9c4-http.wolf.jina.ai/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.CLIP_API_KEY as string,
        },
        body: JSON.stringify({
            data:[
                {"text": text}
            ],
            execEndpoint:"/",
        }),
    })
}

export const imageCaptioning = async (cid: string) => {
    return await fetch('https://closing-rhino-5dbda2dfe9-http.wolf.jina.ai/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.CLIP_API_KEY as string,
        },
        body: JSON.stringify({
            data:[
                {"uri": cid},
            ],
            execEndpoint:"/caption"
        }),
    })
}