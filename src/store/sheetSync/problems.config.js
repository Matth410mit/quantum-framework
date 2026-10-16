/**
 * Which sheet families become calculator problems, and how each family's
 * extra parameters are expressed in the problem size n.
 *
 * `vars` maps a letter used in the sheet's complexity text to an expression in
 * n. A row whose complexity uses any other letter can't be used, and the sync
 * report says which letter blocked it. Keep the substitutions identical for the
 * classical and quantum sides, so both are compared on the same instances.
 *
 * The rules (decided Oct 16, see the supervisor-feedback plan):
 *   - Graphs are dense on both sides: edges m = E = n^2.
 *   - Instance sizes use Sheet1's "Ratios of input parameter sizes" column.
 *   - Magnitudes (capacity, weights, targets) use the sheet's constant when it
 *     gives one; otherwise the row is left out.
 *   - Accuracy/conditioning (eps, kappa, sparsity) and solution-size
 *     parameters (k = cover or clique size) are left out.
 *
 * `exclude` drops sheet rows that don't belong to the problem (matched by
 * field text, e.g. title). `quantumOnly` keeps only the matching rows of the
 * quantum families, for a problem that borrows rows filed under another family.
 * `heuristics` marks rows as heuristics when the sheet doesn't, so they stay
 * alternatives but can't be a default.
 *
 * `inputSize` is the number of logical qubits needed just to hold the input,
 * used when the sheet's qubit count leaves the input out (see qubitsNeeded in
 * syncAlgorithms.js).
 */

const LONGEST_COMMON_SUBSTRING_PAPERS = [
    // These papers solve longest common *substring*, which the Quantum tab
    // files under Longest Common Subsequence (checked Oct 16).
    { title: 'Quantum Meets Fine-grained Complexity' },
    { title: 'Near-Optimal Quantum Algorithms for String Problems' },
];

const GRAPH_VARS = { n: 'n', V: 'n', N: 'n', m: 'n^2', E: 'n^2' };
const DENSE = 'Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.';

export const SHEET_PROBLEMS = [
    // Problems the calculator already had (handPicked). Their defaults stay
    // hand-picked in problemCatalog.js; the sheet only adds alternatives to
    // the pickers, even when the sheet alone couldn't supply both defaults.
    {
        problemName: 'Integer Factorization',
        handPicked: true,
        sheet1: ['Integer Factoring'],
        parallel: ['Integer Factoring'],
        quantum: ['Integer Factoring', 'Integer factoring'],
        vars: { n: 'n' },
        inputSize: 'n',
        // n is the bit length, so the L-notation exponents need ln N = n ln 2.
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
        // DSatur and Petford & Welsh are heuristics, though the sheet doesn't say
        // so. Graph Coloring stays out until Sheet1 has an exact row for the
        // chromatic number, which is what the quantum rows solve.
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
        // Sheet1 defines d (degeneracy) as worst case d = O(n).
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
        // Two strings of equal length (Sheet1's ratio for sequence problems is n:m = 1:1).
        vars: { n: 'n', m: 'n' },
        inputSize: 'n',
        assumptions: ['Assumes both strings have length n.'],
    },
    {
        // Split from Longest Common Subsequence (Matthew, Oct 16). Sheet1 has
        // no classical rows for it yet, so it stays out until it does.
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
        // Li et al. (2023), O(N^7), is a quantum-walk method with no Variation;
        // it can't be the general problem, so it's left out until its Variation
        // is known (Matthew, Oct 16).
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

    // Graph problems that depend on the dense-graph rule.
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
        // Sheet1's ratio column: L (largest edge cost) = 100.
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

    // Problems that depend on Sheet1's size ratios.
    {
        problemName: 'Convex Hull',
        sheet1: ['Convex Hull'],
        quantum: ['Convex Hull'],
        // Sheet1's ratio column: h = n^0.5 points on the hull.
        vars: { n: 'n', N: 'n', h: 'sqrt(n)' },
        inputSize: 'n',
        assumptions: ['Assumes √n of the points are on the hull (from the sheet).'],
    },
    {
        problemName: 'String Search',
        sheet1: ['String Search'],
        parallel: ['String Search'],
        quantum: ['String Search'],
        // Sheet1's ratio column: n:m = 9:1 (text length : pattern length).
        vars: { n: 'n', m: 'n/9' },
        inputSize: 'n',
        assumptions: ['Assumes the pattern is n/9 characters long (from the sheet).'],
    },
    {
        problemName: 'Vertex Cover',
        sheet1: ['The Vertex Cover Problem'],
        quantum: ['The Vertex Cover Problem'],
        // TEMPORARY (Matthew, Oct 16): k = n, the sheet's own worst case, so
        // Vertex Cover can be compared at all. This bends the rule that
        // solution-size parameters are left out; revisit with the advisor.
        vars: { ...GRAPH_VARS, k: 'n' },
        inputSize: 'n^2',
        assumptions: [DENSE, 'Assumes the cover size k equals n, the worst case. This is a placeholder to revisit.'],
    },
];

// Constants substituted wherever they appear.
export const CONSTANTS = {
    'ω': '2.371552', // matrix multiplication exponent
};
