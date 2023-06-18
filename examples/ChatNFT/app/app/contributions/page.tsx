"use client"; 

import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { addDataToBlockchain, addLshToBlockchain, connectWallet } from '@/features/contract';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [account, setAccount] = useState<InjectedAccountWithMeta | null>(null);
    const [cid, setCID] = useState("");

    const handleInputChange = (setter: Function) => (e: ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
    }

    const handleAddData = async () => {
        if (account === null) alert("Please install Polkadot.js");
        else {
            setLoading(true);
            await addDataToBlockchain(account, cid);
            setLoading(false);
        }
    }

    const handleCreateLSH = async () => {
        if (account === null) alert("Please install Polkadot.js");
        else{
            setLoading(true);
            await addLshToBlockchain(account, 1536); // 1536 is the dimension of the vector we are using. see OpenAI text-ada-002
            // await addLshToBlockchain(account, 512); // 512 is CLIP encoder output dimension
            setLoading(false);
        }
    }

    useEffect(() =>  {
        connectWallet().then((res) => {
            if (res === null || res == undefined) alert("Please install Polkadot.js");
            else setAccount(res.account);
        });
    }, []);

    return (
        <div className='pt-20'>
            {loading ? (
                <div>
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div> 
                </div>
            ) : null}
            <div className="mb-10 p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-x-4">
                <div className="flex-1  w-full">
                    <div className="mb-4">
                        <p className="text-lg mb-2">Content ID for vectorDB index</p>
                        <TextInput
                            id="cidInput"
                            type="text"
                            className="mt-1 block w-full"
                            placeholder="Enter content ID on IPFS"
                            value={cid}
                            onChange={handleInputChange(setCID)}
                        />
                    </div>

                    <Button 
                        className="mt-2 w-full"
                        onClick={handleAddData}
                    >
                        Upload
                    </Button>
                </div>
            </div>

            {/* <div className="mb-10 p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-x-4">
                <div className="flex-1 w-full">
                    <p className="text-lg mb-2">Generate random vector & save it on-chain</p>
                    <Button 
                        className="mt-2 w-full"
                        onClick={handleCreateLSH}
                    >
                        Create New LSH Parameter
                    </Button>    
                </div>
            </div> */}
        </div>
    );
}
