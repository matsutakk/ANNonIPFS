//Locality sensitive hashing code
class LSH {
    dimensions: number;
    numHashes: number;
    hyperplanes: number[][];

    constructor(dimensions: number, numHashes:number) {
      this.dimensions = dimensions;
      this.numHashes = numHashes;
      this.hyperplanes = this._createHyperplanes();
    }
  
    _createHyperplanes() {
      let hyperplanes = [];
      for (let i = 0; i < this.numHashes; i++) {
        let plane = [];
        for (let j = 0; j < this.dimensions; j++) {
          plane.push(Math.random() - 0.5);
        }
        hyperplanes.push(plane);
      }
      return hyperplanes;
    }
  
    _dotProduct(a:number[], b:number[]) {
      if (a.length !== b.length) {
        throw 'Vectors must be the same dimensions';
      }
      return a.map((item:number, index:number) => item * b[index]).reduce((prev, curr) => prev + curr, 0);
    }
  
    hashVector(vector: number[]) {
      return this.hyperplanes.map(plane => this._dotProduct(plane, vector) > 0 ? 1 : 0).join('');
    }
  }
  

//get nearest content id
const getNearestCID = (hashes:BigInt[]) => {
    let cid:BigInt[] = [];
    let minDist = 10000
    for (let i = 0; i < hashes.length; i++) {
        cid.push(hashes[i]);
    }
    return cid;
}

const getAllSimilarContents = (hashes:BigInt[]) => { 
    for (let i = 0; i < hashes.length; i++) {
        //get all similar contents
    }
}

export default async function lshQuery(featureVector: number[]): Promise<string>{
    const lsh = new LSH(1536, 10); // 3 dimensions, 10 hashes
    const res = lsh.hashVector(featureVector)
    console.log(res);
    return res;
};