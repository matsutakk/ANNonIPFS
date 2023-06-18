const gatewayUrl = "https://ipfs.io/ipfs/"

export async function retrieveFromIPFS (cid: string): Promise<Response|undefined> {
  try{
    const res = await fetch(gatewayUrl+cid)
    if (!res) { return undefined }

    console.log(`Got a response! [${res.status}] ${res.statusText}`)
  
    if (!res.ok) {
      throw new Error(`failed to get ${cid}`)
    }
    
    return res;
  }catch(err){
    console.log(err);
    return undefined;
  }
}