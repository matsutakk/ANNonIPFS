"use client"; 

import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { ApiPromise } from "@polkadot/api";
import { WsProvider } from "@polkadot/rpc-provider";
import { options } from "@astar-network/astar-api";
import { sendTransaction } from "@astar-network/astar-sdk-core";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import ABI from "@/abi/LshIndex.json";


const inter = Inter({ subsets: ['latin'] });

export default function Home() {
    const [data, setData] = useState("");
    const [address, setAddress] = useState('');
    const [source, setSource] = useState('');
    useEffect(() =>  {
        const connectWallet = async () => {

        const { web3Accounts, web3Enable} = await import(
          "@polkadot/extension-dapp"
        );
    
        const allInjected = await web3Enable('my dapp');
      
        if (allInjected.length === 0) {
          return;
        }
        const accounts = await web3Accounts();
        console.log("accounts",accounts)
    
        const account = accounts[0];
        console.log("account",account)
    
        const address = account?.address
        const source = account?.meta?.source
    
        console.log("address",address)
        console.log("source",source)
    
        setAddress(address);
        setSource(source);
      }
        const connectNode = async () => {
            const provider = new WsProvider('wss://rpc.shibuya.astar.network');
            const api = new ApiPromise(options({ provider }));
            await api.isReady;
            console.log((await api.rpc.system.properties()).toHuman());
            const abi = new Abi(ABI, api.registry.getChainProperties());

            // Initialise the contract class
            const contract = new ContractPromise(api, abi, "ZMQ7DzDwhqMjnbuPt5EnkVXUTnDfRDAmdh7kXwdMp6bcHTp");

            // // Get the gas WeightV2 using api.consts.system.blockWeights['maxBlock']
            // const gasLimit = api.registry.createType(
            //     "WeightV2",
            //     api.consts.system.blockWeights["maxBlock"]
            // );
  
            // // Query the contract message
            // const { gasRequired, result, output } = await contract.query.pot(
            //     account.address,
            //     {
            //     gasLimit,
            //     }
            // );
        }
        connectNode();
    },[]);

  return (
    <main className={inter.className}>
      <h1 className="text-4xl font-bold text-center">IPFS Uploader</h1>
      <p>{data}</p>
    </main>
  );
}
