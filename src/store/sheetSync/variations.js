/**
 * Compares the sheet's Variation names by meaning. Used by the sync (to pick
 * defaults within one Variation) and by the hardware comparison graph (to
 * compare algorithms for the same version of a problem). No Node imports, so
 * the app can use it too.
 */

// Variations are compared by name. The two tabs word them differently ("LCS"
// vs "Longest Common Subsequence", "APSP (Adjacency Matrix Model)" vs "APSP",
// "2-dimensional" vs "2-dimensional Convex Hull"), so a name is reduced to what
// sets it apart from the problem itself: parenthesised notes, filler words,
// plurals and words or acronyms of the problem's own name are dropped. An empty
// key means the problem in general.
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

// problem: an entry of SHEET_PROBLEMS (problems.config.js), for its family names.
export function variationKey(variation, problem) {
  const { stems, acronyms } = problemNameWords(problem);
  return words(String(variation || "").replace(/\([^)]*\)/g, " "))
    .map(singular)
    .filter(w => !VARIATION_FILLER.has(w) && !stems.has(stem(w)) && !acronyms.has(w))
    .join(" ");
}

// A cell can list several variations ("2-dimensional; 3-dimensional").
export function variationKeys(algorithm, problem) {
  const parts = String(algorithm.variation || "").split(/;|\n/);
  return new Set(parts.map(part => variationKey(part, problem)));
}
