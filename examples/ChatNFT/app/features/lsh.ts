const dotProduct = (a:number[], b:number[]) => {
  if (a.length !== b.length) {
    // throw 'Vectors must be the same dimensions';
    return 0;
  }
  return a.map((item:number, index:number) => item * b[index]).reduce((prev, curr) => prev + curr, 0);
}

const gaussianRandom = (mean=0, stdev=1) => {
  const u: number = 1 - Math.random();
  const v: number = Math.random();
  const z: number = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  return z * stdev + mean;
}

export function cosineSimilarity(a:number[], b:number[]) {
  let dotProduct = a.map((item, index) => item * b[index]).reduce((prev, curr) => prev + curr, 0);
  let magnitudeA = Math.sqrt(a.map(item => item * item).reduce((prev, curr) => prev + curr, 0));
  let magnitudeB = Math.sqrt(b.map(item => item * item).reduce((prev, curr) => prev + curr, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Handling the edge case of zero-vector.
  } else {
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
export function generateLshParams(dim: number) {
  const plane: number[] = [];
  for(let j = 0; j < dim; j++){
    plane.push(gaussianRandom());
  }

  const buffer = new ArrayBuffer(plane.length * 4); // 4 bytes for each float32
  const view = new DataView(buffer);
  for(let i = 0; i < plane.length; i++) {
    view.setFloat32(i * 4, plane[i]); // store as float32
  }

  console.log(plane);

  return new Uint8Array(buffer); // this returns bytes array instead of number array
}

export async function lshQuery(featureVector: number[], params: number[][]): Promise<string>{
  console.log(params.length);
  return params.map(plane => dotProduct(plane, featureVector) > 0 ? 1 : 0).join('');
};