const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

export function termFrequency(tokens: string[]) {
  return tokens.reduce<Record<string, number>>((acc, token) => {
    acc[token] = (acc[token] ?? 0) + 1;
    return acc;
  }, {});
}

export function cosineSimilarity(leftText: string, rightText: string) {
  const left = termFrequency(tokenize(leftText));
  const right = termFrequency(tokenize(rightText));
  const terms = new Set([...Object.keys(left), ...Object.keys(right)]);

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (const term of terms) {
    const leftValue = left[term] ?? 0;
    const rightValue = right[term] ?? 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export function normalizedSimilarityScore(leftText: string, rightText: string) {
  return Math.round(cosineSimilarity(leftText, rightText) * 100);
}
