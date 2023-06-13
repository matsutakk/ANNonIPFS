const dotProduct = (a:number[], b:number[]) => {
  if (a.length !== b.length) {
    throw 'Vectors must be the same dimensions';
  }
  return a.map((item:number, index:number) => item * b[index]).reduce((prev, curr) => prev + curr, 0);
}

export default async function lshQuery(featureVector: number[], params: number[][]): Promise<string>{
  return params.map(plane => dotProduct(plane, featureVector) > 0 ? 1 : 0).join('');
};