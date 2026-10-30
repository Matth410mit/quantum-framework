/**
 * Compares the sheet's Variation names by meaning. Used by the sync and the
 * hardware comparison graph. It has no Node imports so the app can use it too.
 */

// The two sheet tabs word variations differently (for example "LCS" and
// "Longest Common Subsequence"). To compare them, a name is cut down to what
// makes it different from the problem. Notes in brackets, filler words,
// plurals and the problem's own name are removed. An empty key means the
// general problem.
const VARIATION_FILLER = new Set(["the", "a", "an", "problem", "problems", "general", "graph", "graphs", "on", "of", "with", "for", "in"]);
const stem = word => word.slice(0, 5);
const singular = word => (word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word);
const words = text => String(text || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

function problemNameWords(problem) {
  const names = [problem.problemName, ...["sheet1", "quantum", "parallel", "approx"].flatMap(tab => problem[tab] || [])];
  const stems = new Set(), acronyms = new Set();
  for (const name of names) {
    const list = words(name).filter(w => !VARIATION_FILLER.has(w));
    list.forEach(w => stems.add(stem(singular(w))));
    if (list.length > 1) acronyms.add(list.map(w => w[0]).join(""));
  }
  return { stems, acronyms };
}

// problem is an entry of SHEET_PROBLEMS in problems.config.js.
export function variationKey(variation, problem) {
  const { stems, acronyms } = problemNameWords(problem);
  return words(String(variation || "").replace(/\([^)]*\)/g, " "))
    .map(singular)
    .filter(w => !VARIATION_FILLER.has(w) && !stems.has(stem(w)) && !acronyms.has(w))
    .join(" ");
}

// A cell can list several variations separated by semicolons.
export function variationKeys(algorithm, problem) {
  const parts = String(algorithm.variation || "").split(/;|\n/);
  return new Set(parts.map(part => variationKey(part, problem)));
}
