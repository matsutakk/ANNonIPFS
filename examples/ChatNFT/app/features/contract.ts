import { ApiPromise } from "@polkadot/api";
import { WsProvider } from "@polkadot/rpc-provider";
import { BN, BN_ONE } from "@polkadot/util";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import type { WeightV2 } from '@polkadot/types/interfaces'
import ABI from "@/abi/LshIndex.json";
import { generateLshParams } from "./lsh";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const address = '5GNZgSUpbh1oeNUizq959yH52mvH7gokg4hiVijHiFBSpWCR';
const contractAddress = "XfcBk389kBFZ4EnuEsWaJEMYPNmEc5jWLiHCJF12XESyxKQ"
const providerUrl = 'wss://rpc.shibuya.astar.network'

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);
const storageDepositLimit = null;

type ReturnData = {
    Ok: string
}

export const connectWallet = async () => {
    const { web3Accounts, web3Enable} = await import(
        "@polkadot/extension-dapp"
      );

    const allInjected = await web3Enable('chatNFT');
    if (allInjected.length === 0) {
      return;
    }
    const accounts = await web3Accounts();
    const account = accounts[0];
    const address = account?.address
    const source = account?.meta?.source
    return { account:account, address:address, sourct:source };
}

export const setupApiContract = async () => {
    const provider = new WsProvider(providerUrl);
    const api = new ApiPromise({ provider });
    await api.isReady;
    const abi = new Abi(ABI, api.registry.getChainProperties());
    const contract = new ContractPromise(api, abi, contractAddress);
    return {api, contract};    
}

const uint8ArrayToFloatArray = (bytes: Uint8Array) : number[] => {
    const array = new Float32Array(bytes.length / 4);
    const view = new DataView(bytes.buffer);
    for(let i = 0; i < array.length; i++) {
      array[i] = view.getFloat32(i * 4); // read as float32
    }
    return Array.from(array);
}

function uint8ArrayToBase64(buffer: Uint8Array) {
    let binary = '';
    const bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b: number) => binary += String.fromCharCode(b));
    return btoa(binary);
}

function base64ToUint8Array(base64String: string) {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++)    {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export const addLshToBlockchain = async (account:InjectedAccountWithMeta, featureDim: number) => {
    const { web3FromSource } = await import(
        "@polkadot/extension-dapp"
      );

    // make LSH
    let randomVec = generateLshParams(featureDim);
    let param = uint8ArrayToBase64(randomVec);
    console.log(param);
    console.log(uint8ArrayToFloatArray(base64ToUint8Array(param)));

    // sign and send tx
    const injector = await web3FromSource(account.meta.source);;
    const { api, contract } = await setupApiContract();
    const { gasRequired } = await contract.query.registerLsh(
        account.address,
        {
          gasLimit: api?.registry.createType('WeightV2', {
            refTime: MAX_CALL_WEIGHT,
            proofSize: PROOFSIZE,
          }) as WeightV2,
          storageDepositLimit,
        },
        param
      );
    const gasLimit = api?.registry.createType('WeightV2', gasRequired) as WeightV2   
    await contract.tx
        .registerLsh({
            gasLimit,
            storageDepositLimit
        }, param)
        .signAndSend(account.address, {signer:injector.signer}, async (res) => {
            if (res.status.isInBlock) {
                console.log('in a block')
            } else if (res.status.isFinalized) {
                alert('Thank you for your contribution!');
            }
        });
}

export const addDataToBlockchain = async (account:InjectedAccountWithMeta, cid:string) => {
    const response = await fetch('/api/addindex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cid: cid,
        }),
    })

    console.log(`Got a response! [${response.status}] ${response.statusText}`)
  
    if (!response.ok) {
        alert(`Error: ${response.status} ${response.statusText}`)
        return
    }

    const data = await response.json();
    data.hash = parseInt(data.hash.split('').join(''), 2);
    console.log(data);

    const { web3FromSource } = await import(
        "@polkadot/extension-dapp"
    );

    // sign and send tx
    const injector = await web3FromSource(account.meta.source);;
    const { api, contract } = await setupApiContract();
    const { gasRequired } = await contract.query.addData(
            account.address,
            {
                gasLimit: api?.registry.createType('WeightV2', {
                    refTime: MAX_CALL_WEIGHT,
                    proofSize: PROOFSIZE,
                }) as WeightV2,
                storageDepositLimit,
            },
            data.hash,
            cid,
        );
    const gasLimit = api?.registry.createType('WeightV2', gasRequired) as WeightV2   
    await contract.tx
        .addData({
            gasLimit,
            storageDepositLimit
        }, data.hash, cid)
        .signAndSend(account.address, {signer:injector.signer}, async (res) => {
            if (res.status.isInBlock) {
                console.log('in a block')
            } else if (res.status.isFinalized) {
                alert('Thank you for your contribution!');
            }
        });
}


export const params: number[][] = [];

const fetchLshParams = async (contract: ContractPromise, address: string, index: number) => {
    const { result, output } = await contract.query.getLshParam(
        address,
        {
            gasLimit: contract.api?.registry.createType('WeightV2', {
                refTime: MAX_CALL_WEIGHT,
                proofSize: PROOFSIZE,
            }) as WeightV2,
            storageDepositLimit,
        },
        index
    );

    if(output == null || output == undefined){ return; }
    const str = output.toHuman() as ReturnData;
    params.push(uint8ArrayToFloatArray(base64ToUint8Array(str.Ok)));
}

const fetchTotalLshAndParams = async (contract: ContractPromise, address: string) => {
    const { result, output } = await contract.query.getCurrentNumOfLsh(
        address,
        {
            gasLimit: contract.api?.registry.createType('WeightV2', {
                refTime: MAX_CALL_WEIGHT,
                proofSize: PROOFSIZE,
            }) as WeightV2,
            storageDepositLimit,
        }
    );

    const totalLsh = output?.toHuman() as ReturnData;
    for(let idx = 0; idx < Number(totalLsh.Ok); idx++){
        await fetchLshParams(contract, address, idx);
    }
}

export const fetchParams =async () => {
    const { contract } = await setupApiContract();
    await fetchTotalLshAndParams(contract, address);
}

export const fetchCIDsFromBlockchain = async (hash:number) => {
    const { api, contract } = await setupApiContract();
    const { result, output } = await contract.query.getData(
      address,
      {
        gasLimit: api?.registry.createType('WeightV2', {
          refTime: MAX_CALL_WEIGHT,
          proofSize: PROOFSIZE,
        }) as WeightV2,
        storageDepositLimit,
      },
      hash
    );
     
    console.log("Query result is");
    console.log(result.toHuman());
    console.log(output?.toHuman());

    return output?.toHuman() as ReturnData;
}