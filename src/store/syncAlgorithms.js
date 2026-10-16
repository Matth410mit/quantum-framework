/**
 * Algorithm sync: reads the AlgoWiki algorithm sheet and generates
 * src/store/algorithmVariants.js plus a report of what could and couldn't be
 * used (docs/sheet-sync-report.md).
 *
 * The sheet is read through its public CSV export, so no Google credentials
 * are needed.
 *
 * Usage:
 *   npm run sync                       # read the live sheet (and keep a copy
 *                                      # in .sheet-cache/)
 *   npm run sync -- --from .sheet-cache
 *                                      # re-run on the last copy, offline
 *   node src/store/syncAlgorithms.js --from ./sheet-csv
 *                                      # read Sheet1.csv, Quantum Algorithms.csv,
 *                                      # Parallel Algos.csv, Approx Algos.csv from a folder
 *
 * Which families become problems, and how their extra parameters are turned
 * into the problem size n, is set in sheetSync/problems.config.js.
 */

import fs from "fs";
import path from "path";
import * as math from "mathjs";
import { SHEET_PROBLEMS, CONSTANTS } from "./sheetSync/problems.config.js";
import { convertComplexity } from "./sheetSync/convert.js";
import { createLoggedFunction } from "./utils.js";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || "1c6HTfHQfp7MIg1LFo6_wFOzKLIHA1rzVpDxXIPosRQ0";
const SOURCE_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/`;
const OUTPUT_FILE = "src/store/algorithmVariants.js";
const REPORT_FILE = "docs/sheet-sync-report.md";

const TABS = {
  sheet1: "Sheet1",
  quantum: "Quantum Algorithms",
  parallel: "Parallel Algos",
  approx: "Approx Algos",
};

// Columns are found by header text. The index is the fallback when a header
// is missing or renamed (0-based: A = 0).
const COLUMNS = {
  sheet1: {
    family: ["Family Name", 1],
    variation: ["Variation", 4],
    name: ["Algorithm Name", 14],
    year: ["Year", 15],
    link: ["Paper/Reference Link", 16],
    authors: ["Authors", 18],
    title: ["Title", 20],
    exact: ["Exact algorithm?", 9],
    time: ["Time Complexity (Worst Only)", 28],
    encoding: ["Time Encoding", 29],
    definitions: ["Parameter definitions", 30],
    preferred: ["Preferred Parameter", 31],
    randomized: ["Randomized?", 43],
    approximate: ["Approximate?", 45],
    heuristic: ["Heuristic-based?", 47],
    parallel: ["Parallel?", 48],
    quantum: ["Quantum?", 50],
    domains: ["Domains", 75],
  },
  quantum: {
    family: ["Family Name", 1],
    variation: ["Variation", 3],
    name: ["Algorithm Name", 13],
    year: ["Year", 14],
    link: ["Paper/Reference Link", 15],
    authors: ["Authors", 17],
    title: ["Title", 19],
    exact: ["Exact algorithm?", 8],
    time: ["Time Complexity / Circuit Depth (Worst Only)", 27],
    encoding: ["Time Encoding", 28],
    definitions: ["Parameter definitions", 31],
    preferred: ["Preferred Parameter", 32],
    qubits: ["Space (QBit) Complexity (Auxiliary)", 39],
    approximate: ["Approximate?", 45],
    heuristic: ["Heuristic-based?", 47],
    parallel: ["Parallel?", 48],
    domains: [null, 60], // column BI has no header
  },
  parallel: {
    family: ["Family Name", 1],
    variation: ["Variation", 7],
    name: ["Algorithm Name", 17],
    year: ["Year", null],
    time: [null, 27],
    work: [null, 31],
  },
  approx: {
    family: ["Family Name", 1],
    variation: ["Variation", 5],
    name: ["Algorithm Name", 15],
    year: ["Year", null],
    time: [null, 28],
  },
};

// ---------------------------------------------------------------------------
// Reading the sheet

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const CACHE_DIR = ".sheet-cache";

async function readTab(tab, fromDir) {
  if (fromDir) {
    const file = path.join(fromDir, `${tab}.csv`);
    if (!fs.existsSync(file)) {
      console.log(`   (no ${file}, skipping ${tab})`);
      return [];
    }
    return parseCsv(fs.readFileSync(file, "utf8"));
  }
  const url = `${SOURCE_URL}gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Couldn't read the "${tab}" tab (HTTP ${res.status}). Is the sheet still shared publicly?`);
  const text = await res.text();
  // Keep a copy, so the sync can be re-run offline with --from .sheet-cache.
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(path.join(CACHE_DIR, `${tab}.csv`), text);
  return parseCsv(text);
}

// Rows as objects keyed by the COLUMNS names.
function toRecords(rows, columns, source) {
  if (!rows.length) return [];
  const header = rows[0].map(h => h.trim());
  const index = {};
  for (const [key, [title, fallback]] of Object.entries(columns)) {
    const found = title ? header.indexOf(title) : -1;
    index[key] = found !== -1 ? found : fallback;
  }
  return rows.slice(1).map((row, i) => {
    const record = { source, row: i + 2 };
    for (const [key, idx] of Object.entries(index)) record[key] = idx == null ? "" : String(row[idx] ?? "").trim();
    return record;
  });
}

// ---------------------------------------------------------------------------
// Field helpers

const yes = v => /^(1|y|yes|true)$/i.test(String(v).trim());

function parseYear(value) {
  const year = parseInt(String(value || "").trim(), 10);
  return Number.isFinite(year) && year > 1000 && year < 2100 ? year : null;
}

function parseEncoding(value) {
  const code = Number(String(value || "").trim());
  return String(value || "").trim() !== "" && Number.isFinite(code) ? code : null;
}

// "['Aram W. Harrow', 'Seth Lloyd']" or "Harrow, Hassidim, Lloyd" -> names
function parseAuthors(value) {
  const text = String(value || "").trim();
  if (!text) return [];
  if (text.startsWith("[")) {
    const names = [...text.matchAll(/'((?:[^'\\]|\\.)*)'|"([^"]*)"/g)].map(m => (m[1] ?? m[2]).trim());
    return names.filter(Boolean);
  }
  return text.split(/\s*(?:,|;|\band\b|&)\s*/).filter(Boolean);
}

const PARTICLES = new Set(["van", "von", "de", "der", "den", "di", "da", "du", "le", "la", "del", "dos", "das"]);

function surname(name) {
  const parts = name.replace(/\s+/g, " ").trim().split(" ");
  let i = parts.length - 1;
  while (i > 0 && PARTICLES.has(parts[i - 1].toLowerCase())) i--;
  return parts.slice(i).join(" ");
}

export function authorsLabel(authors) {
  const names = authors.map(surname);
  if (names.length === 0) return null;
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names[0]} et al.`;
}

function slug(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

// log10 of a formula at size n (n is the actual size, not its log)
function logAt(formula, n) {
  try {
    const value = createLoggedFunction(formula)(n, { n, p: 1, q: 1 });
    return Number.isFinite(value) ? value : Infinity;
  } catch {
    return Infinity;
  }
}

// Drops redundant parentheses so formulas read cleanly in the app.
function tidy(formula) {
  try {
    return math.parse(formula).toString({ parenthesis: "auto", implicit: "show" });
  } catch {
    return formula;
  }
}

// ---------------------------------------------------------------------------
// Turning rows into algorithms

function algorithmName(record, authors) {
  const name = record.name.replace(/\s+/g, " ").trim();
  if (name && !name.startsWith("[")) return name;
  return authorsLabel(authors) || record.variation || "Unnamed";
}

function sizeLetters(problem) {
  return Object.entries(problem.vars).filter(([, expr]) => expr === "n").map(([letter]) => letter);
}

function buildAlgorithm(record, type, problem, index) {
  const authors = parseAuthors(record.authors).length
    ? parseAuthors(record.authors)
    : record.name.startsWith("[") ? parseAuthors(record.name) : [];
  const name = algorithmName(record, authors);
  const year = parseYear(record.year);
  const isParallel = record.source === TABS.parallel || yes(record.parallel);
  const approximate = record.source === TABS.approx || yes(record.approximate);
  const heuristic = yes(record.heuristic) || rowMatches(record, problem.heuristics);

  const base = {
    key: `${type}-${slug(name)}-${year ?? "na"}-${index}`,
    name: name.slice(0, 90),
    year,
    authors,
    authorsLabel: authorsLabel(authors),
    title: parseAuthors(record.title)[0] || record.title || null,
    url: /^https?:\/\//.test(record.link) ? record.link : null,
    complexity: record.time || null,
    encoding: parseEncoding(record.encoding),
    preferredParameter: record.preferred || null,
    variation: record.variation ? record.variation.replace(/\s+/g, " ").trim() : null,
    approximate,
    heuristic,
    parallel: isParallel,
    source: record.source,
    sheetRow: record.row,
    family: record.family,
  };

  const conv = convertComplexity(record.time, {
    vars: problem.vars,
    constants: CONSTANTS,
    allowP: type === "classical" && isParallel,
    bitsInExponent: !!problem.bitsInExponent,
    definitions: record.definitions,
  });
  if (!conv.formula) return { ...base, usable: false, reason: conv.reason };

  const assumptions = [...conv.assumptions];
  let runtimeFormula, workFormula, qubitsFormula = null;
  if (type === "classical") {
    if (isParallel) {
      runtimeFormula = conv.formula;
      const work = record.work ? convertComplexity(record.work, { vars: problem.vars, constants: CONSTANTS, definitions: record.definitions }) : {};
      workFormula = work.formula || `(${conv.formula}) * p`;
    } else {
      runtimeFormula = `(${conv.formula}) / p`;
      workFormula = conv.formula;
    }
  } else {
    runtimeFormula = conv.formula;
    workFormula = `(${conv.formula}) * q`;
    qubitsFormula = qubitsNeeded(record.qubits, problem, assumptions);
  }

  return {
    ...base,
    usable: true,
    runtimeFormula: tidy(runtimeFormula),
    workFormula: tidy(workFormula),
    qubitsFormula: qubitsFormula && tidy(qubitsFormula),
    assumptions,
  };
}

// Logical qubits needed for size n. The sheet's qubit column counts auxiliary
// qubits, so unless it states an exact count (no O-notation), the input itself
// is added: the input has to be held in qubits too.
function qubitsNeeded(text, problem, assumptions) {
  const input = problem.inputSize || "n";
  const raw = String(text || "").trim();
  if (!raw) {
    assumptions.push(`No qubit count in the sheet; assumes the input fits in ${input} qubits.`);
    return input;
  }
  const conv = convertComplexity(raw.split(/,|;/)[0], { vars: problem.vars, constants: CONSTANTS });
  if (!conv.formula) {
    assumptions.push(`Qubit count "${raw}" couldn't be used; assumes the input fits in ${input} qubits.`);
    return input;
  }
  if (/O\s*\(|Õ|\\tilde|O\^/.test(raw)) {
    assumptions.push(`Qubits: input (${input}) plus the sheet's auxiliary count ${raw}, constants taken as 1.`);
    return `(${input}) + (${conv.formula})`;
  }
  return conv.formula;
}

// Exact, sequential and not a heuristic: eligible to be a default.
const eligible = a => a.usable && !a.approximate && !a.heuristic && !a.parallel;

// Classical: lowest Time Encoding (only among rows coded in the problem's size
// parameter), then the slowest growth at n = 10^4, then the newest.
function pickClassicalDefault(algorithms, problem) {
  const letters = sizeLetters(problem);
  const comparableCode = a => a.encoding != null && (!a.preferredParameter || letters.includes(a.preferredParameter));
  return algorithms.filter(eligible).sort((a, b) =>
    (comparableCode(a) ? a.encoding : Infinity) - (comparableCode(b) ? b.encoding : Infinity)
    || logAt(a.workFormula, 1e4) - logAt(b.workFormula, 1e4)
    || (b.year ?? 0) - (a.year ?? 0))[0] || null;
}

// Quantum: the slowest growth at n = 10^4, then the newest.
function pickQuantumDefault(algorithms) {
  return algorithms.filter(eligible).sort((a, b) =>
    logAt(a.runtimeFormula, 1e4) - logAt(b.runtimeFormula, 1e4)
    || (b.year ?? 0) - (a.year ?? 0))[0] || null;
}

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

export function variationKey(variation, problem) {
  const { stems, acronyms } = problemNameWords(problem);
  return words(String(variation || "").replace(/\([^)]*\)/g, " "))
    .map(singular)
    .filter(w => !VARIATION_FILLER.has(w) && !stems.has(stem(w)) && !acronyms.has(w))
    .join(" ");
}

// A cell can list several variations ("2-dimensional; 3-dimensional").
function variationKeys(algorithm, problem) {
  const parts = String(algorithm.variation || "").split(/;|\n/);
  return new Set(parts.map(part => variationKey(part, problem)));
}

// Defaults are only compared within one Variation, so a problem's two
// defaults solve the same version of it (e.g. not 3-coloring against general
// coloring). Among the variations with an eligible algorithm on both sides,
// the general problem (an empty key) is used when both sides have it, and
// otherwise the variation with the most sheet rows. A side that never names a
// variation (the Quantum tab leaves it blank for Sorting) is taken to cover
// every variation of the other side.
function pickDefaultsByVariation(classical, quantum, problem) {
  const keysOf = new Map([...classical, ...quantum].map(a => [a, variationKeys(a, problem)]));
  const counts = new Map();
  for (const keys of keysOf.values()) for (const key of keys) counts.set(key, (counts.get(key) || 0) + 1);
  const unnamed = side => side.filter(eligible).every(a => [...keysOf.get(a)].every(key => key === ""));
  const classicalAny = unnamed(classical), quantumAny = unnamed(quantum);
  const inVariation = (side, any, key) => side.filter(a => any || keysOf.get(a).has(key));
  const shared = [...counts.keys()]
    .filter(key => inVariation(classical, classicalAny, key).some(eligible) && inVariation(quantum, quantumAny, key).some(eligible))
    .sort((a, b) => (a !== "") - (b !== "") || counts.get(b) - counts.get(a) || a.localeCompare(b));
  if (!shared.length) return { classicalDefault: null, quantumDefault: null, variation: null };
  const key = shared[0];
  const classicalDefault = pickClassicalDefault(inVariation(classical, classicalAny, key), problem);
  const quantumDefault = pickQuantumDefault(inVariation(quantum, quantumAny, key));
  const named = [classicalDefault, quantumDefault].find(a => a?.variation && keysOf.get(a).has(key));
  const variation = named && String(named.variation).split(/;|\n/).map(part => part.trim())
    .find(part => variationKey(part, problem) === key);
  return { classicalDefault, quantumDefault, variation: variation || null };
}

// Variation names on each side, with how many usable exact algorithms each has.
function variationSummary(list) {
  const counts = new Map();
  for (const a of list) {
    const name = a.variation || "(no variation)";
    const entry = counts.get(name) || { rows: 0, eligible: 0 };
    entry.rows++;
    if (eligible(a)) entry.eligible++;
    counts.set(name, entry);
  }
  return [...counts.entries()].map(([name, c]) => `${name} (${c.eligible} of ${c.rows} usable exact)`).join("; ") || "none";
}

// "n: number of vertices" from a row's parameter definitions
function sizeDefinition(algorithm, records, problem) {
  const record = records.find(r => r.source === algorithm?.source && r.row === algorithm?.sheetRow);
  if (!record) return null;
  const letters = sizeLetters(problem);
  for (const line of record.definitions.replace(/<br\s*\/?>/gi, "\n").split(/\n|;|,(?=\s*\$?[A-Za-z]\$?\s*:)/)) {
    const m = line.match(/^\s*\$?([A-Za-z])\$?\s*[:;]\s*(.+)$/);
    if (m && letters.includes(m[1])) return `n: ${m[2].replace(/\$/g, "").trim()}`;
  }
  return null;
}

// A row matches a rule when every field the rule names contains its text,
// e.g. { title: "Quantum Meets Fine-grained" }.
function rowMatches(record, rules) {
  return (rules || []).some(rule => Object.entries(rule)
    .every(([field, text]) => String(record[field] || "").toLowerCase().includes(text.toLowerCase())));
}

function familyMatches(record, names) {
  return (names || []).some(n => n.trim().toLowerCase() === record.family.toLowerCase());
}

function dedupe(algorithms) {
  const seen = new Set();
  return algorithms.filter(a => {
    const id = `${a.name.toLowerCase()}|${a.year}|${a.runtimeFormula || a.complexity}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Main

export async function main(argv = process.argv.slice(2)) {
  const fromIndex = argv.indexOf("--from");
  const fromDir = fromIndex !== -1 ? argv[fromIndex + 1] : null;
  console.log(`Reading the algorithm sheet${fromDir ? ` from ${fromDir}` : ""}...`);

  const records = {};
  for (const [key, tab] of Object.entries(TABS)) {
    records[key] = toRecords(await readTab(tab, fromDir), COLUMNS[key], tab);
    console.log(`   ${tab}: ${records[key].length} rows`);
  }
  const allRecords = Object.values(records).flat();

  const algorithmVariants = {};
  const sheetProblems = [];
  const report = [];
  const missingFamilies = [];

  for (const problem of SHEET_PROBLEMS) {
    const classicalRecords = [
      ...records.sheet1.filter(r => familyMatches(r, problem.sheet1) && !yes(r.quantum)),
      ...records.parallel.filter(r => familyMatches(r, problem.parallel)),
      ...records.approx.filter(r => familyMatches(r, problem.approx)),
    ];
    const quantumRecords = records.quantum.filter(r => familyMatches(r, problem.quantum)
      && (!problem.quantumOnly || rowMatches(r, problem.quantumOnly)));

    for (const [tabKey, names] of [["sheet1", problem.sheet1], ["quantum", problem.quantum]]) {
      for (const name of names || []) {
        if (!records[tabKey].some(r => r.family.toLowerCase() === name.toLowerCase())) missingFamilies.push(`${TABS[tabKey]}: "${name}"`);
      }
    }

    const kept = r => !rowMatches(r, problem.exclude);
    const classical = dedupe(classicalRecords.filter(kept).filter(r => r.name || r.time).map((r, i) => buildAlgorithm(r, "classical", problem, i)));
    const quantum = dedupe(quantumRecords.filter(kept).filter(r => r.name || r.time).map((r, i) => buildAlgorithm(r, "quantum", problem, i)));

    const { classicalDefault, quantumDefault, variation } = pickDefaultsByVariation(classical, quantum, problem);
    const usableClassical = classical.filter(a => a.usable);
    const usableQuantum = quantum.filter(a => a.usable);

    const strip = ({ usable, reason, sheetRow, family, preferredParameter, ...rest }) => ({ ...rest, available: true });
    let status;
    if (problem.handPicked) {
      status = "Included (defaults hand-picked in problemCatalog.js; the sheet adds alternatives)";
      algorithmVariants[problem.problemName] = {
        classical: usableClassical.map(strip),
        quantum: usableQuantum.map(strip),
      };
    } else if (!classicalDefault || !quantumDefault) {
      const anyClassical = classical.some(eligible), anyQuantum = quantum.some(eligible);
      status = !anyClassical || !anyQuantum
        ? `Left out: no usable exact ${!anyClassical ? "classical" : "quantum"} algorithm`
        : "Left out: no Variation has a usable exact algorithm on both sides";
    } else {
      status = "Included";
      algorithmVariants[problem.problemName] = {
        classical: usableClassical.map(strip),
        quantum: usableQuantum.map(strip),
      };
      const domain = records.sheet1.find(r => familyMatches(r, problem.sheet1) && r.domains)?.domains
        || quantumRecords.find(r => r.domains)?.domains || null;
      const classicalGrowth = logAt(classicalDefault.workFormula, 1e6);
      const quantumGrowth = logAt(quantumDefault.runtimeFormula, 1e6);
      sheetProblems.push({
        problemName: problem.problemName,
        domain: domain ? domain.split(/[,;]/)[0].trim() : null,
        sizeParameter: sizeDefinition(quantumDefault, allRecords, problem) || sizeDefinition(classicalDefault, allRecords, problem),
        assumptions: problem.assumptions || [],
        variation,
        defaultClassicalKey: classicalDefault.key,
        defaultQuantumKey: quantumDefault.key,
        noSpeedup: quantumGrowth >= classicalGrowth,
      });
    }

    report.push({ problem, status, classical, quantum, classicalDefault, quantumDefault, variation });
    console.log(`   ${problem.problemName}: ${usableClassical.length}/${classical.length} classical, ${usableQuantum.length}/${quantum.length} quantum usable. ${status}${variation && !problem.handPicked ? ` [${variation}]` : ""}`);
  }

  fs.writeFileSync(path.resolve(process.cwd(), OUTPUT_FILE), generateJs({ algorithmVariants, sheetProblems }), "utf8");
  fs.mkdirSync(path.dirname(path.resolve(process.cwd(), REPORT_FILE)), { recursive: true });
  fs.writeFileSync(path.resolve(process.cwd(), REPORT_FILE), generateReport(report, missingFamilies), "utf8");
  console.log(`\nWrote ${OUTPUT_FILE} (${sheetProblems.length} problems) and ${REPORT_FILE}.`);
}

function generateJs({ algorithmVariants, sheetProblems }) {
  return `/**
 * Algorithm data generated from the algorithm sheet by src/store/syncAlgorithms.js.
 *
 * Last updated: ${new Date().toISOString()}
 * Source: ${SOURCE_URL}
 *
 * DO NOT EDIT THIS FILE MANUALLY - run \`npm run sync\` instead.
 * What was left out, and why: docs/sheet-sync-report.md
 */

// Problems built from the sheet (problemCatalog.js adds them to the selector).
export const sheetProblems = ${JSON.stringify(sheetProblems, null, 2)};

// Usable algorithms per problem.
export const algorithmVariants = ${JSON.stringify(algorithmVariants, null, 2)};
`;
}

function cell(text) {
  return String(text ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

function generateReport(report, missingFamilies) {
  const lines = [
    "# Algorithm sheet sync report",
    "",
    `Generated ${new Date().toISOString()} by \`npm run sync\` from ${SOURCE_URL}.`,
    "",
    "Rows marked ✗ are left out of the calculator. Substitution rules are in `src/store/sheetSync/problems.config.js`.",
    "",
    "## Summary",
    "",
    "| Problem | Classical usable | Quantum usable | Status |",
    "|---|---|---|---|",
    ...report.map(r => `| ${r.problem.problemName} | ${r.classical.filter(a => a.usable).length} of ${r.classical.length} | ${r.quantum.filter(a => a.usable).length} of ${r.quantum.length} | ${r.status} |`),
    "",
  ];
  if (missingFamilies.length) {
    lines.push("## Family names in the config that the sheet doesn't have", "", ...missingFamilies.map(f => `- ${f}`), "");
  }
  for (const r of report) {
    lines.push(`## ${r.problem.problemName}`, "");
    if (r.classicalDefault) lines.push(`Default classical: ${r.classicalDefault.name}${r.classicalDefault.year ? ` (${r.classicalDefault.year})` : ""}  `);
    if (r.quantumDefault) lines.push(`Default quantum: ${r.quantumDefault.name}${r.quantumDefault.year ? ` (${r.quantumDefault.year})` : ""}  `);
    if (!r.problem.handPicked) {
      if (r.variation) lines.push(`Variation compared: ${r.variation}  `);
      for (const note of r.problem.assumptions || []) lines.push(`Assumption: ${note}  `);
      lines.push(`Classical variations: ${cell(variationSummary(r.classical))}  `, `Quantum variations: ${cell(variationSummary(r.quantum))}`);
    }
    lines.push("", "| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |", "|---|---|---|---|---|---|---|---|");
    for (const [side, list] of [["Classical", r.classical], ["Quantum", r.quantum]]) {
      for (const a of list) {
        lines.push(`| ${a.usable ? "✓" : "✗"} | ${side}${a.parallel ? " (parallel)" : a.approximate ? " (approx.)" : ""} | ${cell(a.name)} | ${a.year ?? ""} | ${cell(a.variation)} | \`${cell(a.complexity)}\` | ${a.encoding ?? ""} | ${a.usable ? `\`${cell(a.runtimeFormula)}\`` : cell(a.reason)} |`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isDirectRun) {
  main().catch(err => {
    console.error("\nERROR:", err?.message || err);
    process.exit(1);
  });
}
