/**
 * Problem catalog for the problem selector.
 *
 * Everything shown about a problem comes from the algorithm sheet or from
 * references already in the app (ProblemReferences.vue). Fields with no
 * source yet are left empty, and the UI hides them until they're filled.
 *
 * Problems come from two places:
 *   - the hand-written entries below (problems the calculator started with), and
 *   - `sheetProblems` in algorithmVariants.js, generated from the sheet by
 *     `npm run sync` (see src/store/sheetSync/problems.config.js).
 */

import * as variants from './algorithmVariants.js';
import * as math from 'mathjs';

// Works with both the old generated file (algorithmVariants only) and the new
// one (sheetProblems too), so the app runs before and after a sync.
const sheetProblems = variants.sheetProblems || [];
// The old file filled Database Search with String Search rows; String Search
// is its own problem now, so those are dropped until the next sync.
const algorithmVariants = variants.sheetProblems
    ? (variants.algorithmVariants || {})
    : Object.fromEntries(Object.entries(variants.algorithmVariants || {}).filter(([name]) => name !== 'Database Search'));

// Problems are grouped by the sheet's Domains column. Problems that aren't in
// the sheet go in this group.
export const NO_DOMAIN_LABEL = 'Other';

/*
 * domain: the sheet's Domains value for the problem's family (null if not in the sheet).
 * aliases: extra search keywords.
 * description: shown under the selector and in Browse (null = hidden).
 * sizeParameter: what n means, from the sheet's Parameter definitions (null = hidden).
 * qubitsNeeded: logical qubits needed for an instance of size n, used when the
 *   chosen quantum algorithm doesn't give its own count.
 * assumptions: notes shown with the problem (e.g. dense graphs).
 * noSpeedup: true when the best quantum algorithm grows no slower than the
 *   best classical one.
 * defaults.classical / defaults.quantum: the algorithm the calculator starts
 * from when the problem is picked. Names, years and citations are the ones in
 * ProblemReferences.vue; `url` only where the sheet or that file gives one.
 *   - `variantKey`: use this algorithm from algorithmVariants.js.
 *   - otherwise `runtime`/`work` (and `qubits` for quantum) are used, labeled
 *     with `name`, `authors` and `year`.
 */
const handWritten = [
    {
        problemName: 'Integer Factorization',
        domain: 'Numerical Analysis',
        aliases: ['RSA'],
        description: null,
        sizeParameter: 'n: number of bits in the integer',
        qubitsNeeded: '2*n + 3',
        defaults: {
            classical: {
                name: 'General Number Field Sieve',
                authors: 'Pomerance',
                year: 1996,
                // L_N[1/3, (64/9)^(1/3)] with ln N = n ln 2 for an n-bit N.
                runtime: 'e^((64/9 * n * log(2))^(1/3) * log(n * log(2))^(2/3)) / p',
                work: 'e^((64/9 * n * log(2))^(1/3) * log(n * log(2))^(2/3))',
                reference: {
                    citation: 'Pomerance, Carl. "A tale of two sieves." Notices of the American Mathematical Society 43.12 (1996): 1473-1485.',
                    url: null,
                },
            },
            quantum: {
                name: "Shor's Algorithm",
                authors: 'Gidney & Ekerå',
                year: 2019,
                // Measurement depth, Toffoli count and logical qubits from the abstract.
                runtime: 'n^2 * (500 + log(n, 2))',
                work: '0.3 * n^3 + 0.0005 * n^3 * log(n, 2)',
                qubits: '3 * n + 0.002 * n * log(n, 2)',
                reference: {
                    citation: 'Gidney, Craig, and Martin Ekerå. "How to factor 2048 bit RSA integers in 8 hours using 20 million noisy qubits." Quantum 5 (2021): 433. arXiv:1905.09749.',
                    url: 'https://arxiv.org/abs/1905.09749',
                },
            },
        },
    },
    {
        problemName: 'Database Search',
        domain: 'Combinatorics',
        aliases: ['Unstructured search'],
        description: null,
        sizeParameter: 'n: number of entries',
        // n = 2^q entries are addressed by q qubits.
        qubitsNeeded: 'log(n, 2)',
        defaults: {
            classical: {
                name: 'Linear Search',
                authors: null,
                year: null,
                runtime: 'n / p',
                work: 'n',
                reference: null,
            },
            quantum: {
                name: "Grover's Algorithm",
                authors: 'Grover',
                year: 1996,
                runtime: 'sqrt(n)',
                work: 'sqrt(n) * q',
                reference: {
                    citation: "Lov K. Grover. 1996. A fast quantum mechanical algorithm for database search. In Proceedings of the twenty-eighth annual ACM symposium on Theory of Computing (STOC '96). Association for Computing Machinery, New York, NY, USA, 212–219. https://doi.org/10.1145/237814.237866",
                    url: 'https://doi.org/10.1145/237814.237866',
                },
            },
        },
    },
    {
        problemName: 'Traveling Salesman',
        domain: 'Combinatorics',
        aliases: ['TSP'],
        description: null,
        sizeParameter: 'n: number of vertices',
        qubitsNeeded: 'n',
        defaults: {
            classical: {
                name: 'Dynamic Programming',
                authors: 'Held & Karp',
                year: 1962,
                runtime: 'n^2 * 2^n / p',
                work: 'n^2 * 2^n',
                reference: {
                    citation: 'Held, Michael, and Richard M. Karp. "A dynamic programming approach to sequencing problems." Journal of the Society for Industrial and Applied mathematics 10.1 (1962): 196-210.',
                    url: null,
                },
            },
            quantum: {
                name: 'Ambainis et al.',
                authors: 'Ambainis et al.',
                year: 2019,
                runtime: 'n * 1.78^n',
                work: 'n * 1.78^n * q',
                reference: {
                    citation: 'A. Ambainis, K. Balodis, J. Iraids, M. Kokainis, K. Prusis, and J. Vihrovs Quantum speedups for exponential-time dynamic programming algorithms Proceedings of the 30th Annual ACM-SIAM Symposium on Discrete Algorithms (SODA 19), pg. 1783-1793, 2019. [arXiv:1807.05209]',
                    url: 'https://arxiv.org/abs/1807.05209',
                },
            },
        },
    },
    {
        problemName: 'Time Dependent Hartree-Fock Approximation (Quantum Chemistry)',
        domain: null,
        aliases: [],
        description: null,
        sizeParameter: null,
        qubitsNeeded: 'n',
        defaults: {
            classical: {
                name: 'Hartree-Fock Approximation',
                authors: 'Galvez Vallejo et al.',
                year: 2023,
                runtime: 'n^3',
                work: 'n^3',
                reference: {
                    citation: 'Galvez Vallejo, Jorge L., et al. "Toward an extreme-scale electronic structure system." The Journal of Chemical Physics 159.4 (2023).',
                    url: null,
                },
            },
            quantum: {
                name: 'Variational Quantum Eigensolver',
                authors: 'Babbush et al.',
                year: 2018,
                runtime: 'n',
                work: 'n * q',
                reference: {
                    citation: 'Babbush, Ryan, et al. "Encoding electronic spectra in quantum circuits with linear T complexity." Physical Review X 8.4 (2018): 041015.',
                    url: null,
                },
            },
        },
    },
    {
        problemName: 'Full Configuration Interaction (Quantum Chemistry)',
        domain: null,
        aliases: [],
        description: null,
        sizeParameter: null,
        qubitsNeeded: 'n',
        defaults: {
            classical: {
                name: 'Full Configuration Interaction',
                authors: 'Eriksen & Gauss',
                year: 2021,
                runtime: '(2 * pi * n)^(1/2) * (n / e)^n',
                work: '(2 * pi * n)^(1/2) * (n / e)^n',
                reference: {
                    citation: 'Eriksen, Janus J., and Jürgen Gauss. "Incremental treatments of the full configuration interaction problem." Wiley Interdisciplinary Reviews: Computational Molecular Science 11.5 (2021): e1525.',
                    url: null,
                },
            },
            quantum: {
                name: 'Quantum Phase Estimation',
                authors: 'Sugisaki et al.',
                year: 2018,
                runtime: 'n^5',
                work: 'n^5 * q',
                reference: {
                    citation: 'Sugisaki, Kenji, et al. "Quantum chemistry on quantum computers: A method for preparation of multiconfigurational wave functions on quantum computers without performing post-hartree–fock calculations." ACS central science 5.1 (2018): 167-175.',
                    url: null,
                },
            },
        },
    },
];

// A problem generated by the sync, in the same shape as the hand-written ones.
function fromSheet(p) {
    const quantumDefault = (algorithmVariants[p.problemName]?.quantum || []).find(a => a.key === p.defaultQuantumKey);
    return {
        problemName: p.problemName,
        domain: p.domain || null,
        aliases: [],
        description: null,
        sizeParameter: p.sizeParameter || null,
        qubitsNeeded: quantumDefault?.qubitsFormula || 'n',
        assumptions: p.assumptions || [],
        noSpeedup: !!p.noSpeedup,
        variation: p.variation || null,
        fromSheet: true,
        defaults: {
            classical: { variantKey: p.defaultClassicalKey },
            quantum: { variantKey: p.defaultQuantumKey },
        },
    };
}

const handWrittenNames = new Set(handWritten.map(p => p.problemName));

export const problemCatalog = [
    ...handWritten,
    ...sheetProblems.filter(p => !handWrittenNames.has(p.problemName)).map(fromSheet),
];

export function isFormulaValid(formula) {
    if (!formula || typeof formula !== 'string') return false;
    try {
        // Evaluate with a dummy scope to catch undefined-variable errors
        math.compile(formula).evaluate({ n: 2, p: 1, q: 1 });
        return true;
    } catch {
        return false;
    }
}

export function hasValidFormulas(algo) {
    if (!algo || !algo.available) return false;
    return isFormulaValid(algo.runtimeFormula) && isFormulaValid(algo.workFormula);
}

export function findProblem(problemName) {
    return problemCatalog.find(p => p.problemName === problemName) || null;
}

// The catalog default as an algorithm-variant object, so pickers can list it.
function defaultAsVariant(problem, type) {
    const d = problem.defaults?.[type];
    if (!d) return null;
    if (d.variantKey) {
        const match = (algorithmVariants[problem.problemName]?.[type] || [])
            .find(a => a.key === d.variantKey && hasValidFormulas(a));
        return match ? { ...match, recommended: true } : null;
    }
    if (!isFormulaValid(d.runtime) || !isFormulaValid(d.work)) return null;
    return {
        key: `default-${type}`,
        name: d.name || 'Calculator preset',
        year: d.year ?? null,
        authorsLabel: d.authors || null,
        description: 'Best-known algorithm (calculator default)',
        available: true,
        runtimeFormula: d.runtime,
        workFormula: d.work,
        qubitsFormula: d.qubits || null,
        reference: d.reference || null,
        url: d.reference?.url || null,
        recommended: true,
    };
}

// Logical qubits needed for size n with this quantum algorithm.
export function qubitsNeededFor(problem, quantumAlgorithm) {
    return quantumAlgorithm?.qubitsFormula || problem?.qubitsNeeded || 'n';
}

// "Gidney & Ekerå (2019)" and the citation (or paper title), for tooltips.
export function algorithmCredit(algo) {
    if (!algo) return '';
    const who = algo.authorsLabel || null;
    const byline = who && algo.year ? `${who} (${algo.year})` : who || (algo.year ? String(algo.year) : '');
    const citation = algo.reference?.citation || algo.title || '';
    return [byline, citation].filter(Boolean).join('\n');
}

export function getDefaultAlgorithm(problem, type) {
    return problem ? defaultAsVariant(problem, type) : null;
}

// Algorithms for the picker: the default first, then the rest newest-first
// (algorithms with no year keep their sheet order at the end).
export function getAlgorithmOptions(problem, type) {
    if (!problem) return [];
    const recommended = defaultAsVariant(problem, type);
    const others = (algorithmVariants[problem.problemName]?.[type] || [])
        .filter(a => hasValidFormulas(a) && a.key !== recommended?.key);
    const byYear = others
        .map((a, i) => ({ a, i }))
        .sort((x, y) => (y.a.year ?? -Infinity) - (x.a.year ?? -Infinity) || x.i - y.i)
        .map(x => x.a);
    return recommended ? [recommended, ...byYear] : byYear;
}

// True when the model's formulas are not the problem's recommended defaults.
export function isModifiedFromDefaults(problem, model) {
    if (!problem || !model) return false;
    const c = getDefaultAlgorithm(problem, 'classical');
    const q = getDefaultAlgorithm(problem, 'quantum');
    return (!!c && (model.classicalRuntimeInput !== c.runtimeFormula || model.classicalWork !== c.workFormula))
        || (!!q && (model.quantumRuntimeInput !== q.runtimeFormula || model.quantumWork !== q.workFormula))
        || (!!model.qubitsNeeded && model.qubitsNeeded !== qubitsNeededFor(problem, q));
}

export function hasQuantumAlgorithm(problem) {
    return getAlgorithmOptions(problem, 'quantum').length > 0;
}

export function problemDomain(problem) {
    return problem?.domain || NO_DOMAIN_LABEL;
}

// Domains in use, alphabetical, with problems outside the sheet last.
export function domainsInUse() {
    const domains = [...new Set(problemCatalog.map(p => p.domain).filter(Boolean))].sort();
    return problemCatalog.some(p => !p.domain) ? [...domains, NO_DOMAIN_LABEL] : domains;
}

export function matchesQuery(problem, query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return true;
    return [problem.problemName, problem.domain, problem.description, ...(problem.aliases || [])]
        .some(text => text && text.toLowerCase().includes(q));
}

// Grouped options for the main dropdown, by domain. Only problems with a
// quantum algorithm are offered.
export function groupedProblemOptions(query = '') {
    const usable = problemCatalog.filter(p => hasQuantumAlgorithm(p) && matchesQuery(p, query));
    const groups = [];
    for (const domain of domainsInUse()) {
        const problems = usable
            .filter(p => problemDomain(p) === domain)
            .sort((a, b) => a.problemName.localeCompare(b.problemName));
        if (problems.length) groups.push({ label: domain, problems });
    }
    return groups;
}
