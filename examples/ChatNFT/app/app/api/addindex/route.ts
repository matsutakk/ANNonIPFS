import { embeddingQuery } from '@/features/embeddings'
import { lshQuery } from '@/features/lsh'
import { fetchParams, params } from "@/features/contract";
import { retrieveFromIPFS } from '@/features/ipfs';

type RequestData = {
    cid: string
}

export async function POST(request: Request) {
    const { cid } = (await request.json()) as RequestData
    
    if (!cid) {
        return new Response('No message in the request', { status: 400 })
    }

    const res = await retrieveFromIPFS(cid);
    //null check
    if(res === undefined) { return new Response('No response from IPFS', { status: 400 }) }

    const metadata = await res.json();
    console.log("meta data is ", metadata);;

    if(params.length == 0){
        await fetchParams();
    }

    const embedding = await embeddingQuery(JSON.stringify(metadata));
    const hash = await lshQuery(embedding, params);

    return new Response(
        JSON.stringify({
            hash
        }),
    );
}