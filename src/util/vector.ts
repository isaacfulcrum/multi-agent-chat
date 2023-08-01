
export function calculateDistance(vector1: number[], vector2: number[]) {
  if (vector1.length !== vector2.length) {
    throw new Error("Vectors must have the same number of dimensions");
  }

  let squaredDiffSum = 0;
  for (let i = 0; i < vector1.length; i++) {
    squaredDiffSum += Math.pow(vector1[i] - vector2[i], 2);
  }

  const distance = Math.sqrt(squaredDiffSum);
  return distance;
}
