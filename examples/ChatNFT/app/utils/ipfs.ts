import { Web3Storage } from 'web3.storage'
import { CIDString } from 'web3.storage/dist/src/lib/interface'

function getAccessToken (): string{
  return process.env.WEB3STORAGE_TOKEN
}

function makeStorageClient () {
  return new Web3Storage({ token: getAccessToken() })
}

export async function retrieveFromIPFS (cid: string): Promise<Response|undefined> {
  const res = await fetch("https://ipfs.io/ipfs/"+cid)
  if (!res) { return undefined }
  console.log(`Got a response! [${res.status}] ${res.statusText}`)
  console.log(res);
  if (!res.ok) {
    throw new Error(`failed to get ${cid}`)
  }
  return res;
}

export async function storeFiles (files: File[]) {
  const client = makeStorageClient()
  const cid = await client.put(files)
  console.log('stored files with cid:', cid)
  return cid
}

export function makeFileObjects () {
  const files = [
    new File(['contents-of-file-1'], 'plain-utf8.txt'),
  ]
  return files
}