/**
 * Hardware comparison: for the model's problem, the year each quantum
 * algorithm reaches quantum economic advantage (QEA) on each hardware preset.
 * Used by HardwareComparisonGraph.vue.
 *
 * Modelling choices (kept here and in docs/hardware-comparison.md, not in the UI):
 * - Quantum candidates: the problem's quantum algorithms, minus approximate and
 *   heuristic-based ones, plus the model's own formula when it isn't one of them.
 *   The calculator's default is always a candidate.
 * - Classical baseline: the single classical algorithm whose runtime grows
 *   slowest as n grows (p = 1), from the same pool minus parallel algorithms
 *   and other variations of the problem (planar graphs, non-comparison sorts),
 *   plus the model's own classical formula when it isn't one of them.
 * - Each hardware column applies that preset's fields to a copy of the model
 *   (as the hardware dropdown does). Everything else (max compute time, ...)
 *   stays as the model has it. Each quantum algorithm uses its own qubit count.
 * - "Current inputs" is an extra column when the model's hardware fields no
 *   longer match the preset it was set from.
 * - Rows group algorithms whose runtimes are within a constant factor of each
 *   other (same Θ class), sorted from slowest-growing to fastest-growing.
 */

import * as math from 'mathjs';
import * as utils from './utils';
import { getAlgorithmOptions, isFormulaValid, qubitsNeededFor } from './problemCatalog';
import { applyHardwareToModel } from './urlState';
import { quantumEconomicAdvantage } from './qea';

const currentYear = new Date().getFullYear();

// Problem sizes (log10 n) used to compare growth. Large enough that
// polylog factors lose to polynomial ones (sqrt(n) log^4 n < n), small enough
// that 2^n stays finite in log space.
const LOG_N_NEAR = 150;
const LOG_N_FAR = 300;
// Two runtimes are in the same class when their log10 ratio changes by less
// than this between the two sizes (a constant factor doesn't change it).
const SAME_CLASS_TOLERANCE = 0.05;

// The model fields a hardware preset sets that change the results.
const HARDWARE_FIELDS = [
    'penaltyInput', 'processors', 'hardwareSlowdown', 'physicalLogicalQubitsRatio',
    'quantumImprovementRate', 'roadmapUnit', 'extrapolationType',
    'ratioImprovementRate', 'costFactor', 'costImprovementRate',
];

// log10 of the runtime at n = 10^logN, with one processor.
function logRuntime(formula, logN) {
    try {
        const f = utils.createConvertedFunction(utils.replaceVariable(formula, 'p', '1'));
        const value = Number(f(logN, { n: logN }));
        return Number.isFinite(value) ? value : NaN;
    } catch {
        return NaN;
    }
}

function growthProfile(formula) {
    return { near: logRuntime(formula, LOG_N_NEAR), far: logRuntime(formula, LOG_N_FAR) };
}

function sameClass(a, b) {
    const values = [a.near, a.far, b.near, b.far];
    if (!values.every(Number.isFinite)) return false;
    return Math.abs((a.far - b.far) - (a.near - b.near)) < SAME_CLASS_TOLERANCE;
}

function slowerGrowth(a, b) {
    const key = g => Number.isFinite(g.far) ? g.far : Number.isFinite(g.near) ? g.near : Infinity;
    return key(a) - key(b);
}

// ---------------------------------------------------------------------------
// Big-O labels: the runtime formula with constant factors and lower-order
// terms removed (in KaTeX), e.g. 0.3*n^3 + 0.005*n^3*log2(n) -> O(n^3 log n).

const hasN = node => node.filter(x => x.isSymbolNode && x.name === 'n').length > 0;

function flatten(node, fn) {
    const inner = node.isParenthesisNode ? node.content : node;
    if (inner.isOperatorNode && inner.fn === fn) return inner.args.flatMap(arg => flatten(arg, fn));
    return [node];
}

function product(factors) {
    if (factors.length === 0) return new math.ConstantNode(1);
    return factors.reduce((acc, f) => new math.OperatorNode('*', 'multiply', [acc, f]));
}

function leadingTerm(node) {
    if (node.isParenthesisNode) {
        const inner = leadingTerm(node.content);
        return inner.isOperatorNode ? new math.ParenthesisNode(inner) : inner;
    }
    if (!hasN(node)) return new math.ConstantNode(1);
    if (node.isOperatorNode && (node.fn === 'add' || node.fn === 'subtract')) {
        const terms = (node.fn === 'add' ? flatten(node, 'add') : node.args).filter(hasN);
        let best = terms[0];
        let bestGrowth = growthProfile(best.toString());
        for (const term of terms.slice(1)) {
            const g = growthProfile(term.toString());
            if (slowerGrowth(bestGrowth, g) < 0) { best = term; bestGrowth = g; }
        }
        return leadingTerm(best);
    }
    if (node.isOperatorNode && node.fn === 'multiply') {
        return product(flatten(node, 'multiply').filter(hasN).map(leadingTerm));
    }
    if (node.isOperatorNode && node.fn === 'divide') {
        if (!hasN(node.args[1])) return leadingTerm(node.args[0]);
        return new math.OperatorNode('/', 'divide', node.args.map(leadingTerm));
    }
    if (node.isFunctionNode && (node.fn.name === 'min' || node.fn.name === 'max')) {
        const ranked = node.args.filter(hasN)
            .map(arg => ({ arg, g: growthProfile(arg.toString()) }))
            .sort((a, b) => slowerGrowth(a.g, b.g));
        if (!ranked.length) return new math.ConstantNode(1);
        return leadingTerm((node.fn.name === 'min' ? ranked[0] : ranked[ranked.length - 1]).arg);
    }
    if (node.isOperatorNode && node.fn === 'pow') {
        // n^(5/3): drop constants from the base. 2^(n/2): the exponent is kept
        // exactly, since a constant there changes the class.
        if (hasN(node.args[1])) return node;
        return new math.OperatorNode('^', 'pow', [leadingTerm(node.args[0]), node.args[1]]);
    }
    if (node.isFunctionNode && ['log', 'log2', 'log10', 'ln'].includes(node.fn.name)) {
        return new math.FunctionNode('log', [leadingTerm(node.args[0])]);
    }
    if (node.isFunctionNode && node.fn.name === 'sqrt') {
        return new math.FunctionNode('sqrt', [leadingTerm(node.args[0])]);
    }
    return node;
}

function texHandler(node, options) {
    // (log n)^2, not log n^2
    const base = node.isOperatorNode && node.fn === 'pow' && (node.args[0].isParenthesisNode ? node.args[0].content : node.args[0]);
    if (base && base.isFunctionNode && base.fn.name === 'log') {
        return `\\left(${base.toTex(options)}\\right)^{${node.args[1].toTex(options)}}`;
    }
    if (node.isFunctionNode && node.fn.name === 'log') {
        const arg = node.args[0];
        const argTex = arg.toTex(options);
        return arg.isSymbolNode ? `\\log ${argTex}` : `\\log\\left(${argTex}\\right)`;
    }
}

export function bigOTex(formula) {
    try {
        const node = leadingTerm(math.parse(utils.replaceVariable(formula, 'p', '1')));
        const tex = node.toTex({ parenthesis: 'auto', handler: texHandler }).replaceAll('\\cdot', '\\,');
        return `O\\left(${tex}\\right)`;
    } catch {
        return `O\\left(\\text{${formula}}\\right)`;
    }
}

// ---------------------------------------------------------------------------
// Candidates

function matchesModel(algo, runtime, work) {
    return algo.runtimeFormula === runtime && algo.workFormula === work;
}

export function quantumCandidates(problem, model) {
    const options = getAlgorithmOptions(problem, 'quantum')
        .filter(a => a.recommended || (!a.approximate && !a.heuristic))
        .map(a => ({ ...a, qubits: qubitsNeededFor(problem, a) }));
    const own = { runtime: model.quantumRuntimeInput, work: model.quantumWork };
    if (isFormulaValid(own.runtime) && isFormulaValid(own.work)
        && !options.some(a => matchesModel(a, own.runtime, own.work))) {
        options.push({
            key: 'custom-quantum',
            name: 'Your formula',
            custom: true,
            runtimeFormula: own.runtime,
            workFormula: own.work,
            qubits: utils.modelQubitsNeeded(model),
        });
    }
    return options;
}

export function fastestClassical(problem, model) {
    let options = getAlgorithmOptions(problem, 'classical')
        .filter(a => a.recommended || (!a.approximate && !a.heuristic && !a.parallel));
    // Only the problem's own variation: the pickers also list special cases
    // (planar graphs, non-comparison sorts) that would otherwise always win.
    if (problem.variation) {
        const sameVariation = options.filter(a => a.recommended || a.variation === problem.variation);
        if (sameVariation.length) options = sameVariation;
    }
    const own = { runtime: model.classicalRuntimeInput, work: model.classicalWork };
    if (isFormulaValid(own.runtime) && isFormulaValid(own.work)
        && !options.some(a => matchesModel(a, own.runtime, own.work))) {
        options.push({
            key: 'custom-classical',
            name: 'Your formula',
            custom: true,
            runtimeFormula: own.runtime,
            workFormula: own.work,
        });
    }
    // Slowest-growing runtime; ties keep the earlier option (the default first).
    let best = null;
    let bestGrowth = null;
    for (const algo of options) {
        const g = growthProfile(algo.runtimeFormula);
        if (!Number.isFinite(g.far) && !Number.isFinite(g.near)) continue;
        if (!best || slowerGrowth(g, bestGrowth) < 0) { best = algo; bestGrowth = g; }
    }
    return best;
}

// ---------------------------------------------------------------------------
// Hardware columns

function sameValue(a, b) {
    if (a === b) return true;
    const x = Number(a), y = Number(b);
    return a != null && b != null && a !== '' && b !== '' && Number.isFinite(x) && x === y;
}

function sameRoadmap(a = {}, b = {}) {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every(k => sameValue(a[k], b[k]));
}

export function matchesHardware(model, hardware) {
    return !!hardware
        && HARDWARE_FIELDS.every(f => sameValue(model[f], hardware[f]))
        && sameRoadmap(model.roadmap, hardware.roadmap);
}

export function hardwareColumns(model, hardwares) {
    const columns = hardwares.map(h => ({ name: h.hardwareName, hardware: h }));
    const preset = hardwares.find(h => h.hardwareName === model.hardwareName);
    if (!matchesHardware(model, preset)) {
        columns.push({ name: 'Current inputs', current: true, basedOn: model.hardwareName || null });
    }
    return columns;
}

// ---------------------------------------------------------------------------
// The comparison

// QEA years as calendar years: "already" becomes this year, a failed
// bisection becomes null, never stays Infinity.
function asYear(t) {
    if (t === null || t === undefined || Number.isNaN(t)) return null;
    if (t === 0) return currentYear;
    return t;
}

function qeaFor(model, column, classical, quantum) {
    const variant = JSON.parse(JSON.stringify(model));
    if (column.hardware) applyHardwareToModel(variant, column.hardware);
    variant.classicalRuntimeInput = classical.runtimeFormula;
    variant.classicalWork = classical.workFormula;
    variant.quantumRuntimeInput = quantum.runtimeFormula;
    variant.quantumWork = quantum.workFormula;
    variant.qubitsNeeded = quantum.qubits;
    delete variant.qubitToProblemSize;
    try {
        const { tStar, tCostStar } = quantumEconomicAdvantage(variant, { fast: true });
        return { speed: asYear(tStar), cost: asYear(tCostStar) };
    } catch (err) {
        console.warn('Hardware comparison: QEA failed for', column.name, quantum.name, err);
        return { speed: null, cost: null };
    }
}

// Groups the runtimes into rows of the same class, slowest-growing first.
function complexityRows(formulas) {
    const items = formulas.map((formula, i) => ({ i, formula, growth: growthProfile(formula), tex: bigOTex(formula) }));
    items.sort((a, b) => slowerGrowth(a.growth, b.growth));
    const rows = [];
    const rowOf = new Array(formulas.length);
    for (const item of items) {
        // Same class, or the same label (n^2 (500 + log n) is still far from
        // n^2 log n at the sizes compared, but reads the same).
        const row = rows.find(r => sameClass(r.growth, item.growth)
            || r.formulas.includes(item.formula) || r.texes.includes(item.tex));
        if (row) {
            row.formulas.push(item.formula);
            row.texes.push(item.tex);
            // The shortest label reads best (n^(3/2) rather than sqrt(n * n^2)).
            if (item.tex.length < row.tex.length) row.tex = item.tex;
            rowOf[item.i] = row;
        } else {
            const created = { growth: item.growth, tex: item.tex, texes: [item.tex], formulas: [item.formula] };
            rows.push(created);
            rowOf[item.i] = created;
        }
    }
    return { rows: rows.map(r => ({ tex: r.tex })), rowIndex: rowOf.map(r => rows.indexOf(r)) };
}

/**
 * Everything the graph needs, or null when the problem has no quantum
 * algorithm or no usable classical one.
 *   columns: [{ name, current, basedOn }]
 *   rows: [{ tex }]  (Big-O labels, bottom to top)
 *   classical: { algorithm, rowIndex }
 *   points: [{ column, candidate, row, algorithm, speed, cost }]
 *   winners: { speed: [[pointIndex...] per column], cost: [...] }
 */
export function compareHardware(model, problem, hardwares) {
    if (!model || !problem) return null;
    const quantum = quantumCandidates(problem, model);
    const classical = fastestClassical(problem, model);
    if (!quantum.length || !classical) return null;

    const columns = hardwareColumns(model, hardwares);
    const { rows, rowIndex } = complexityRows([...quantum.map(a => a.runtimeFormula), classical.runtimeFormula]);

    const points = [];
    columns.forEach((column, c) => {
        // Algorithms with the same formulas and qubits get the same years.
        const cache = new Map();
        quantum.forEach((algorithm, k) => {
            const key = [algorithm.runtimeFormula, algorithm.workFormula, algorithm.qubits].join('|');
            if (!cache.has(key)) cache.set(key, qeaFor(model, column, classical, algorithm));
            points.push({ column: c, candidate: k, row: rowIndex[k], algorithm, ...cache.get(key) });
        });
    });

    const winners = { speed: [], cost: [] };
    for (const mode of ['speed', 'cost']) {
        columns.forEach((_, c) => {
            const inColumn = points.map((p, i) => ({ p, i })).filter(({ p }) => p.column === c && Number.isFinite(p[mode]));
            const earliest = Math.min(...inColumn.map(({ p }) => p[mode]));
            winners[mode].push(inColumn.filter(({ p }) => p[mode] - earliest < 1e-6).map(({ i }) => i));
        });
    }

    return {
        columns: columns.map(({ name, current, basedOn }) => ({ name, current: !!current, basedOn: basedOn || null })),
        rows,
        classical: { algorithm: classical, rowIndex: rowIndex[quantum.length] },
        candidates: quantum.length,
        points,
        winners,
    };
}
