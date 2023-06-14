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

export function generateLshParams(dim: number){
  const plane: number[] = [];
  for(let j = 0; j < dim; j++){
    plane.push(gaussianRandom());
  }
  return plane;
}

export async function lshQuery(featureVector: number[], params: number[][]): Promise<string>{
  return params.map(plane => dotProduct(plane, featureVector) > 0 ? 1 : 0).join('');
};