/**
 * Problem catalog for the problem selector.
 *
 * Everything shown about a problem comes from the algorithm sheet or from
 * references already in the app (ProblemReferences.vue). Fields with no
 * source yet are left empty, and the UI hides them until they're filled.
 *
 * To add a problem: add an entry below. To put problems in a "Popular" group
 * at the top of the dropdown: set `popularRank` (1 = first).
 */

import { algorithmVariants } from './algorithmVariants';
import * as math from 'mathjs';

// Problems are grouped by the sheet's Domains column. Problems that aren't in
// the sheet go in this group.
export const NO_DOMAIN_LABEL = 'Other';

export const POPULAR_GROUP_LABEL = 'Popular';
export const POPULAR_LIMIT = 10;

/*
 * domain: the sheet's Domains value for the problem's family (null if not in the sheet).
 * popularRank: position in the "Popular" group (null = not shown there).
 * aliases: extra search keywords.
 * description: shown under the selector and in Browse (null = hidden).
 * sizeParameter: what n means, from the sheet's Parameter definitions (null = hidden).
 * defaults.classical / defaults.quantum: the algorithm the calculator starts
 * from when the problem is picked. Names, years and citations are the ones in
 * ProblemReferences.vue; `url` only where the sheet or that file gives one.
 *   - `variantName`: use this algorithm from algorithmVariants.js when its
 *     formulas are valid (so the Algorithm Options picker shows it selected).
 *   - otherwise `runtime`/`work` are used, labeled with `name` and `year`.
 */
export const problemCatalog = [
    {
        problemName: 'Integer Factorization',
        domain: 'Numerical Analysis',
        popularRank: null,
        aliases: [],
        description: null,
        sizeParameter: 'n: number of bits in the integer',
        qubitToProblemSize: '{q}',
        defaults: {
            classical: {
                name: 'General Number Field Sieve',
                year: 1996,
                runtime: 'e^((64/9 * n)^(1/3) * log(n, e)^(2/3)) / p',
                work: 'e^((64/9 * n)^(1/3) * log(n, e)^(2/3))',
                reference: {
                    citation: 'Pomerance, Carl. "A tale of two sieves." Notices of the American Mathematical Society 43.12 (1996): 1473-1485.',
                    url: null,
                },
            },
            quantum: {
                name: "Shor's Algorithm",
                year: 1994,
                runtime: 'n^(2) * log(n, e)',
                work: 'n^(2) * log(n, e) * q',
                reference: {
                    citation: 'Peter Shor Algorithms for Quantum Computation: Discrete Logarithms and Factoring. In Proceedings of FOCS 1994, pg. 124-134.',
                    url: 'https://arxiv.org/pdf/quant-ph/9508027.pdf',
                },
            },
        },
    },
    {
        problemName: 'Database Search',
        domain: 'Combinatorics',
        popularRank: null,
        aliases: [],
        description: null,
        sizeParameter: null,
        qubitToProblemSize: '2^{q}',
        defaults: {
            classical: {
                name: 'Linear Search',
                year: null,
                runtime: 'n / p',
                work: 'n',
                reference: null,
            },
            quantum: {
                name: "Grover's Algorithm",
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
        popularRank: null,
        aliases: [],
        description: null,
        sizeParameter: 'n: number of vertices',
        qubitToProblemSize: '{q}',
        defaults: {
            classical: {
                name: 'Dynamic Programming',
                year: 1962,
                runtime: 'n^3 * 2^n / p',
                work: 'n^3 * 2^n',
                reference: {
                    citation: 'Held, Michael, and Richard M. Karp. "A dynamic programming approach to sequencing problems." Journal of the Society for Industrial and Applied mathematics 10.1 (1962): 196-210.',
                    url: null,
                },
            },
            quantum: {
                name: 'Quantum Approximate Optimization Algorithm',
                year: 2019,
                runtime: 'n * 1.78^n',
                work: 'n * 1.78^n * q',
                reference: {
                    citation: 'A. Ambainis, K. Balodis, J. Iraids, M. Kokainis, K. Prusis, and J. Vihrovs Quantum speedups for exponential-time dynamic programming algorithms Proceedings of the 30th Annual ACM-SIAM Symposium on Discrete Algorithms (SODA 19), pg. 1783-1793, 2019. [arXiv:1807.05209]',
                    url: null,
                },
            },
        },
    },
    {
        problemName: 'Time Dependent Hartree-Fock Approximation (Quantum Chemistry)',
        domain: null,
        popularRank: null,
        aliases: [],
        description: null,
        sizeParameter: null,
        qubitToProblemSize: '{q}',
        defaults: {
            classical: {
                name: 'Hartree-Fock Approximation',
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
        popularRank: null,
        aliases: [],
        description: null,
        sizeParameter: null,
        qubitToProblemSize: '{q}',
        defaults: {
            classical: {
                name: 'Full Configuration Interaction',
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
    if (d.variantName) {
        const match = (algorithmVariants[problem.problemName]?.[type] || [])
            .find(a => a.name === d.variantName && hasValidFormulas(a));
        if (match) return { ...match, year: match.year ?? d.year ?? null, reference: d.reference || null, recommended: true };
    }
    if (!isFormulaValid(d.runtime) || !isFormulaValid(d.work)) return null;
    return {
        key: `default-${type}`,
        name: d.name || 'Calculator preset',
        year: d.year ?? null,
        description: 'Best-known algorithm (calculator default)',
        available: true,
        runtimeFormula: d.runtime,
        workFormula: d.work,
        reference: d.reference || null,
        recommended: true,
    };
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

// Sheet algorithms left out of the picker because their formula can't be
// evaluated yet (e.g. "poly(n)" or blank).
export function getHiddenAlgorithmCount(problem, type) {
    if (!problem) return 0;
    return (algorithmVariants[problem.problemName]?.[type] || [])
        .filter(a => !hasValidFormulas(a)).length;
}

// True when the model's formulas are not the problem's recommended defaults.
export function isModifiedFromDefaults(problem, model) {
    if (!problem || !model) return false;
    const c = getDefaultAlgorithm(problem, 'classical');
    const q = getDefaultAlgorithm(problem, 'quantum');
    return (!!c && (model.classicalRuntimeInput !== c.runtimeFormula || model.classicalWork !== c.workFormula))
        || (!!q && (model.quantumRuntimeInput !== q.runtimeFormula || model.quantumWork !== q.workFormula));
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

// Grouped options for the main dropdown: "Popular" first (when any problem has
// a popularRank), then the remaining problems by domain. Only problems with a
// quantum algorithm are offered.
export function groupedProblemOptions(query = '') {
    const usable = problemCatalog.filter(p => hasQuantumAlgorithm(p) && matchesQuery(p, query));
    const popular = usable
        .filter(p => p.popularRank != null)
        .sort((a, b) => a.popularRank - b.popularRank)
        .slice(0, POPULAR_LIMIT);
    const groups = popular.length ? [{ label: POPULAR_GROUP_LABEL, problems: popular }] : [];
    for (const domain of domainsInUse()) {
        const problems = usable
            .filter(p => !popular.includes(p) && problemDomain(p) === domain)
            .sort((a, b) => a.problemName.localeCompare(b.problemName));
        if (problems.length) groups.push({ label: domain, problems });
    }
    return groups;
}
