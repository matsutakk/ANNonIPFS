import { embeddingQuery, encodingImageByClip, encodingTextByClip, imageCaptioning } from '@/features/embeddings'
import { lshQuery } from '@/features/lsh'
import { fetchParams, params } from "@/features/contract";
import { retrieveFromIPFS } from '@/features/ipfs';

type RequestData = {
    cid: string
}

type ValueObject = {
    value: string;
};

export async function POST(request: Request) {
    const { cid } = (await request.json()) as RequestData
    
    if (!cid) {
        return new Response('No message in the request', { status: 400 })
    }

    const res = await retrieveFromIPFS(cid);
    if(res === undefined) { return new Response('No response from IPFS', { status: 400 }) }
    const metadata = await res.json();
    console.log("meta data is ", metadata);

    if(params.length == 0){
        await fetchParams();
    }

    // const embedding = await embeddingQuery(JSON.stringify(metadata));
    const embedding = await embedingOfNftMetaData(metadata);
    // const embedding = await embeddingOfNftImage(metadata);
    const hash = await lshQuery(embedding, params);

    return new Response(
        JSON.stringify({
            hash
        }),
    );
}

export async function embedingOfNftMetaData(metadata: any): Promise<number[]> {
    let values = Object.values(metadata).flat();
    
    values = values.map(value => {
        if (typeof value === "object" && value !== null) {
            return (value as ValueObject).value;
        } else {
            return value as string;
        }
    });

    const text = values.join(', ');
    console.log("text is", text);
    const embedding = await embeddingQuery(text);
    return embedding
}

async function embeddingOfNftImage(metadata: any) {
    let cid = metadata.image;
    if(!cid.includes("ipfs")) throw new Error("invalid cid");

    // const caption = await imageCaptioning(cid);
    // caption.json().then((data) => {
    //     console.log(data.data[0].tags.response);
    // });

    let clip;
    if(cid.startsWith("http")){
        clip = await encodingImageByClip(cid);
    }else{
        cid = cid.replace("ipfs://","")
        clip = await encodingImageByClip("https://ipfs.io/ipfs/"+cid);
    }

    const clipJson = await clip.json();
    const embedding = clipJson.data[0].embedding;
    
    return embedding
}