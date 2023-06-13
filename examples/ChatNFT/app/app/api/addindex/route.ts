import { ApiPromise } from "@polkadot/api";
import { WsProvider } from "@polkadot/rpc-provider";
import { BN, BN_ONE } from "@polkadot/util";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import type { WeightV2 } from '@polkadot/types/interfaces'

import { embeddingQuery } from '@/utils/embeddings'
import lshQuery from '@/utils/lsh'
import ABI from "@/abi/LshIndex.json";
import { contractAddress } from "@/abi/address";

type RequestData = {
    metadata: string,
    cid: string
}

type ReturnData = {
    Ok: string
}

if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing env var from OpenAI')
}

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);
const storageDepositLimit = null;

const stringToFloatArray = (str: string) : number[] => {
    const raw = atob(str);
    const len = raw.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = raw.charCodeAt(i);
    }
    return Array.from(new Float32Array(bytes.buffer));
}

export const params: number[][] = [];
export const fetchParams =async () => {
    // fetch Lsh params from blockchain
    const provider = new WsProvider('wss://rpc.shibuya.astar.network');
    const api = new ApiPromise({ provider });
    await api.isReady;
    const abi = new Abi(ABI, api.registry.getChainProperties());
    const contract = new ContractPromise(api, abi, contractAddress);
    const address = '5GNZgSUpbh1oeNUizq959yH52mvH7gokg4hiVijHiFBSpWCR'
    const { result, output } = await contract.query.getTotalLsh(
        address,
        {
        gasLimit: api?.registry.createType('WeightV2', {
            refTime: MAX_CALL_WEIGHT,
            proofSize: PROOFSIZE,
        }) as WeightV2,
        storageDepositLimit,
        }
    );

    const totalLsh = output?.toHuman() as ReturnData;
    for(let idx = 0; idx < Number(totalLsh.Ok); idx++){
        const { result, output } = await contract.query.getLshParam(
            address,
            {
                gasLimit: api?.registry.createType('WeightV2', {
                    refTime: MAX_CALL_WEIGHT,
                    proofSize: PROOFSIZE,
                }) as WeightV2,
                storageDepositLimit,
            },
            idx
        );
        if(output == null || output == undefined){ continue; }
        const str = output.toHuman() as ReturnData;
        params.push(stringToFloatArray(str.Ok));
    }
}

export async function POST(request: Request) {
    const { metadata, cid } = (await request.json()) as RequestData
    
    if (!metadata || !cid) {
        return new Response('No message in the request', { status: 400 })
    }

    if(params.length == 0){
        await fetchParams();
    }

    const embedding = await embeddingQuery(metadata);
    const hash = await lshQuery(embedding, params);

    return new Response(
            JSON.stringify({
                hash
            }),
        );
}