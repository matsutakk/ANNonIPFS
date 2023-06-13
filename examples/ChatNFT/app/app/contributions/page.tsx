"use client"; 

import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { ApiPromise } from "@polkadot/api";
import { WsProvider } from "@polkadot/rpc-provider";
import { BN, BN_ONE } from "@polkadot/util";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import type { WeightV2 } from '@polkadot/types/interfaces'
import ABI from "@/abi/LshIndex.json";
import { web3FromSource } from '@polkadot/extension-dapp';

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);
const storageDepositLimit = null;

export default function Home() {
    const [address, setAddress] = useState('');
    const [account, setAccount] = useState<InjectedAccountWithMeta | null>(null);;
    const [source, setSource] = useState('');
    const [metadata, setMetadata] = useState("");
    const [cid, setCID] = useState("");

    const handleFirstInputChange = (e:ChangeEvent<HTMLInputElement>) => {
        setMetadata(e.target.value);
    }

    const handleSecondInputChange = (e:ChangeEvent<HTMLInputElement>) => {
        setCID(e.target.value);
    }

    const handleFirstButtonClick = async () => {
        console.log('First Button clicked');
        const response = await fetch('/api/addindex', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                metadata: metadata,
                cid: cid,
            }),
        })
      
        if (!response.ok) {
            throw new Error(response.statusText)
        }

        const data = await response.json();

        console.log("hereeee");
        data.hash = parseInt(data.hash.split('').join(''), 2);
        console.log(data);

        // sign and send tx
        const injector = await web3FromSource(account.meta.source);
        const provider = new WsProvider('wss://rpc.shibuya.astar.network');
        const api = new ApiPromise({ provider });
        await api.isReady;
        const abi = new Abi(ABI, api.registry.getChainProperties());
        const contract = new ContractPromise(api, abi, "aLVQp8h5wbRoKFXsbCZtwQmRN8ygriZhGuphLeqsf6WKKN5");
        const { gasRequired } = await contract.query.addData(
                address,
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
            .signAndSend(address, {signer:injector.signer}, async (res) => {
                if (res.status.isInBlock) {
                    console.log('in a block')
                } else if (res.status.isFinalized) {
                    alert('Thank you for your contribution!');
                }
            });
    }

    const handleSecondButtonClick = async () => {
        console.log('Second Button clicked');
        
        // make LSH
        let randomVec: Float32Array = new Float32Array(1536);
        for (let i: number = 0; i < 1536; i++) {
            randomVec[i] = Math.random() - 0.5;
        }
        let uint: Uint8Array = new Uint8Array(randomVec.buffer);
        let plane: string = btoa( String.fromCharCode.apply( null, Array.from(uint) ) );


        // sign and send tx
        const injector = await web3FromSource(account.meta.source);
        const provider = new WsProvider('wss://rpc.shibuya.astar.network');
        const api = new ApiPromise({ provider });
        await api.isReady;
        const abi = new Abi(ABI, api.registry.getChainProperties());
        const contract = new ContractPromise(api, abi, "aLVQp8h5wbRoKFXsbCZtwQmRN8ygriZhGuphLeqsf6WKKN5");
        const { gasRequired } = await contract.query.registerLsh(
            address,
            {
              gasLimit: api?.registry.createType('WeightV2', {
                refTime: MAX_CALL_WEIGHT,
                proofSize: PROOFSIZE,
              }) as WeightV2,
              storageDepositLimit,
            },
            plane
          );
        const gasLimit = api?.registry.createType('WeightV2', gasRequired) as WeightV2   
        await contract.tx
            .registerLsh({
                gasLimit,
                storageDepositLimit
            }, plane)
            .signAndSend(address, {signer:injector.signer}, async (res) => {
                if (res.status.isInBlock) {
                    console.log('in a block')
                } else if (res.status.isFinalized) {
                    alert('Thank you for your contribution!');
                }
            });
    }

    useEffect(() =>  {
        const connectWallet = async () => {
          const { web3Accounts, web3Enable} = await import(
            "@polkadot/extension-dapp"
          );
      
          const allInjected = await web3Enable('chatNFT');
          if (allInjected.length === 0) {
            return;
          }
          const accounts = await web3Accounts();
          console.log("accounts",accounts)
      
          const account = accounts[0];
          setAccount(account);
          console.log("account",account)
      
          const address = account?.address
          const source = account?.meta?.source
      
          console.log("address",address)
          console.log("source",source)

          setAddress(address);
          setSource(source);
        }
        connectWallet();
    },[]);

  return (
    <main>
        <div className="mb-10 p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-x-4">
            <div className="flex-1  w-full">
                <div className="mb-4">
                    <p className="text-lg mb-2">Please input data for vectorDB index</p>
                    <TextInput
                        id="firstInput"
                        type="text"
                        className="mt-1 block w-full"
                        placeholder="Enter nft metadata"
                        value={metadata}
                        onChange={(e) => handleFirstInputChange(e)}
                    />

                    <TextInput
                        id="secondInput"
                        type="text"
                        className="mt-1 block w-full"
                        placeholder="Enter content address"
                        value={cid}
                        onChange={(e) => handleSecondInputChange(e)}
                    />
                </div>

                <Button 
                    className="mt-2 w-full"
                    onClick={()=>handleFirstButtonClick()}
                >
                    Upload
                </Button>
            </div>
        </div>

        <div className="mb-10 p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-x-4">
            <div className="flex-1 w-full">
                <p className="text-lg mb-2">Generate random vector & save it on-chain</p>
                <Button 
                    className="mt-2 w-full"
                    onClick={()=> handleSecondButtonClick()}
                >
                    Create New LSH Parameter
                </Button>    
            </div>
        </div>
    </main>
  );
}
