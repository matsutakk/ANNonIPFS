import { OpenAIEmbeddings } from "langchain/embeddings/openai";

if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing env var from OpenAI')
}

export const embeddingQuery = async (text: string) => {
    const openAIembeddings: OpenAIEmbeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        timeout: 3000,
      });
      const res = await openAIembeddings.embedQuery(text);
      return res
};