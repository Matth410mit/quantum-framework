/**
 * Which problem families from the sheet become calculator problems, and how
 * their other parameters are written in terms of the problem size n.
 *
 * `vars` maps each letter in the sheet's formulas to an expression in n. Rows
 * that use any other letter are skipped, and the sync report says which
 * letter caused it. Use the same values for classical and quantum so both
 * sides are compared on the same inputs.
 *
 * Rules agreed on Oct 16:
 *   - Graphs are dense: the number of edges is n^2.
 *   - Input sizes follow Sheet1's "Ratios of input parameter sizes" column.
 *   - Values like capacity, weights and targets use the sheet's constant if
 *     it gives one. Otherwise the row is skipped.
 *   - Rows that depend on accuracy (eps, kappa, sparsity) or on the size of
 *     the answer (like clique size k) are skipped.
 *
 * `exclude` skips rows that don't belong to the problem. `quantumOnly` keeps
 * only the matching quantum rows, for problems that borrow rows from another
 * family. `heuristics` marks rows as heuristics when the sheet doesn't, so
 * they can't be picked as the default.
 *
 * `inputSize` is the number of logical qubits needed just to hold the input.
 * It's used when the sheet's qubit count leaves the input out.
 */

const LONGEST_COMMON_SUBSTRING_PAPERS = [
    // These papers solve longest common substring, but the Quantum tab lists
    // them under Longest Common Subsequence.
    { title: 'Quantum Meets Fine-grained Complexity' },
    { title: 'Near-Optimal Quantum Algorithms for String Problems' },
];

const GRAPH_VARS = { n: 'n', V: 'n', N: 'n', m: 'n^2', E: 'n^2' };
const DENSE = 'Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.';

export const SHEET_PROBLEMS = [
    // Problems the calculator already had. Their defaults are set by hand in
    // problemCatalog.js, and the sheet only adds more algorithms to choose from.
    {
        problemName: 'Integer Factorization',
        handPicked: true,
        sheet1: ['Integer Factoring'],
        parallel: ['Integer Factoring'],
        quantum: ['Integer Factoring', 'Integer factoring'],
        vars: { n: 'n' },
        inputSize: 'n',
        // n is the number of bits, so ln N = n ln 2.
        bitsInExponent: true,
    },
    {
        problemName: 'Traveling Salesman',
        handPicked: true,
        sheet1: ['The Traveling-Salesman Problem'],
        approx: ['The Traveling-Salesman Problem'],
        quantum: ['The Traveling-Salesman Problem'],
        vars: GRAPH_VARS,
        inputSize: 'n^2',
    },

    // New problems from the sheet.
    {
        problemName: 'Subset Sum',
        sheet1: ['The Subset-Sum Problem'],
        quantum: ['The Subset-Sum Problem'],
        vars: { n: 'n' },
        inputSize: 'n',
    },
    {
        problemName: 'Graph Coloring',
        sheet1: ['Graph Coloring'],
        quantum: ['Graph Coloring'],
        vars: GRAPH_VARS,
        inputSize: 'n^2',
        assumptions: [DENSE],
        // DSatur and Petford & Welsh are heuristics, even though the sheet doesn't
        // say so. Graph Coloring stays out until Sheet1 has an exact classical
        // algorithm for the chromatic number, which the quantum rows solve.
        heuristics: [{ name: 'DSatur' }, { name: 'Petford' }],
    },
    {
        problemName: 'Set Cover',
        sheet1: ['The Set-Covering Problem'],
        quantum: ['The Set-Covering Problem'],
        vars: { n: 'n' },
        inputSize: 'n',
    },
    {
        problemName: 'Clique',
        sheet1: ['Clique Problems'],
        quantum: ['Clique Problems'],
        // Sheet1 sets the degeneracy d to its worst case, O(n).
        vars: { ...GRAPH_VARS, d: 'n' },
        inputSize: 'n^2',
        assumptions: [DENSE],
    },
    {
        problemName: 'Cycle Detection',
        sheet1: ['Cycle Detection'],
        quantum: ['Cycle Detection'],
        vars: GRAPH_VARS,
        inputSize: 'n^2',
        assumptions: [DENSE],
    },
    {
        problemName: 'Strongly Connected Components',
        sheet1: ['Strongly Connected Components'],
        quantum: ['Strongly Connected Components'],
        vars: GRAPH_VARS,
        inputSize: 'n^2',
        assumptions: [DENSE],
    },
    {
        problemName: 'Longest Common Subsequence',
        sheet1: ['Longest Common Subsequence'],
        quantum: ['Longest Common Subsequence'],
        exclude: LONGEST_COMMON_SUBSTRING_PAPERS,
        // Both strings have the same length, as in Sheet1.
        vars: { n: 'n', m: 'n' },
        inputSize: 'n',
        assumptions: ['Assumes both strings have length n.'],
    },
    {
        // Split from Longest Common Subsequence on Oct 16. Sheet1 has no
        // classical algorithms for it yet, so it's left out for now.
        problemName: 'Longest Common Substring',
        sheet1: ['Longest Common Substring'],
        quantum: ['Longest Common Subsequence'],
        quantumOnly: LONGEST_COMMON_SUBSTRING_PAPERS,
        vars: { n: 'n', m: 'n' },
        inputSize: 'n',
        assumptions: ['Assumes both strings have length n.'],
    },
    {
        problemName: 'Longest Palindromic Substring',
        sheet1: ['Longest Palindromic Substring'],
        quantum: ['Longest Palidrome Substring'],
        vars: { n: 'n' },
        inputSize: 'n',
    },
    {
        problemName: 'Matrix Chain Multiplication',
        sheet1: ['Matrix Chain Multiplication'],
        quantum: ['Matrix Chain Multiplication'],
        vars: { n: 'n' },
        inputSize: 'n',
    },
    {
        problemName: 'Optimal Binary Search Trees',
        sheet1: ['Optimal Binary Search Trees'],
        quantum: ['Optimal Binary Search Trees'],
        vars: { n: 'n', N: 'n' },
        inputSize: 'n',
    },
    {
        problemName: 'Maximum Cut',
        sheet1: ['Maximum Cut'],
        quantum: ['Maximum Cut'],
        vars: GRAPH_VARS,
        inputSize: 'n^2',
        assumptions: [DENSE, 'The classical default is brute force, the only exact algorithm in the sheet. Faster exact algorithms exist (Williams 2005, about 1.73ⁿ), so the quantum advantage shown is an upper bound.'],
    },
    {
        problemName: 'Graph Isomorphism',
        sheet1: ['Graph Isomorphism Problem'],
        quantum: ['Graph Isomorphism'],
        // Li et al. (2023) has no Variation in the sheet, so it's left out
        // until we know which version of the problem it solves.
        exclude: [{ title: 'Continuous-Time Quantum Walk' }],
        vars: GRAPH_VARS,
        inputSize: 'n^2',
        assumptions: [DENSE],
    },
    {
        problemName: 'Nearest Neighbor Search',
        sheet1: ['Nearest Neighbor Search'],
        quantum: ['Nearest Neighbor'],
        vars: { n: 'n', N: 'n' },
        inputSize: 'n',
    },
    {
        problemName: 'Sorting',
        sheet1: ['Sorting'],
        quantum: ['Sorting'],
        vars: { n: 'n' },
        inputSize: 'n',
    },
    {
        problemName: 'Lowest Common Ancestor',
        sheet1: ['Lowest Common Ancestor'],
        quantum: ['Lowest Common Ancestor'],
        vars: { n: 'n', V: 'n' },
        inputSize: 'n',
    },

    // Graph problems that rely on the dense graph rule.
    {
        problemName: 'Maximum Cardinality Matching',
        sheet1: ['Maximum Cardinality Matching'],
        quantum: ['Maximum Cardinality Matching'],
        vars: GRAPH_VARS,
        inputSize: 'n^2',
        assumptions: [DENSE],
    },
    {
        problemName: 'Minimum Spanning Tree',
        sheet1: ['Minimum Spanning Tree (MST)'],
        quantum: ['Minimum Spanning Tree (MST)', 'Minumum Spanning Tree (MST)'],
        vars: GRAPH_VARS,
        inputSize: 'n^2',
        assumptions: [DENSE],
    },
    {
        problemName: 'Shortest Path',
        sheet1: ['Shortest Path (Directed Graphs)'],
        quantum: ['Shortest-Path (Directed Graphs)'],
        // From Sheet1: the largest edge cost L is 100.
        vars: { ...GRAPH_VARS, L: '100' },
        inputSize: 'n^2',
        assumptions: [DENSE, 'Largest edge cost L = 100 (from the sheet).'],
    },
    {
        problemName: 'All-Pairs Shortest Paths',
        sheet1: ['All-Pairs Shortest Paths (APSP)'],
        quantum: ['All-Pairs Shortest Paths'],
        vars: GRAPH_VARS,
        inputSize: 'n^2',
        assumptions: [DENSE],
    },
    {
        problemName: 'Maximum Flow',
        sheet1: ['Maximum Flow'],
        quantum: ['Maximum Flow'],
        // In a dense graph the maximum degree D is about n.
        vars: { ...GRAPH_VARS, D: 'n' },
        inputSize: 'n^2',
        assumptions: [DENSE],
    },

    // Problems that rely on Sheet1's size ratios.
    {
        problemName: 'Convex Hull',
        sheet1: ['Convex Hull'],
        quantum: ['Convex Hull'],
        // From Sheet1: the hull has h = n^0.5 points.
        vars: { n: 'n', N: 'n', h: 'sqrt(n)' },
        inputSize: 'n',
        assumptions: ['Assumes √n of the points are on the hull (from the sheet).'],
    },
    {
        problemName: 'String Search',
        sheet1: ['String Search'],
        parallel: ['String Search'],
        quantum: ['String Search'],
        // From Sheet1: the text is 9 times longer than the pattern.
        vars: { n: 'n', m: 'n/9' },
        inputSize: 'n',
        assumptions: ['Assumes the pattern is n/9 characters long (from the sheet).'],
    },
    {
        problemName: 'Vertex Cover',
        sheet1: ['The Vertex Cover Problem'],
        quantum: ['The Vertex Cover Problem'],
        // Temporary: k = n (the sheet's worst case) so Vertex Cover can be
        // compared at all. This breaks the rule about answer-size parameters,
        // so check it with the advisor.
        vars: { ...GRAPH_VARS, k: 'n' },
        inputSize: 'n^2',
        assumptions: [DENSE, 'Assumes the cover size k equals n, the worst case. This is a placeholder to revisit.'],
    },
];

// Constants that are filled in wherever they appear.
export const CONSTANTS = {
    'ω': '2.371552', // matrix multiplication exponent
};
