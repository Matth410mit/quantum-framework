/**
 * Math for the Hardware Comparison page. For one problem, it works out one line
 * per hardware over time: either the largest problem the hardware can run, or
 * how far that is past the smallest problem where quantum wins. The second one
 * crosses 0 in the QEA year.
 *
 * Choices made here (also described in docs/hardware-comparison.md):
 * - Every line uses the same quantum algorithm. By default it's the one that
 *   reaches QEA first on the most hardware. Approximate and heuristic
 *   algorithms are not considered.
 * - By default the classical baseline is the algorithm whose runtime grows
 *   slowest. Parallel algorithms are not considered.
 * - Each line copies the model and applies one hardware's settings to it.
 *   All other settings stay as they are in the model.
 */

import * as math from 'mathjs';
import * as utils from './utils';
import { getAlgorithmOptions, isFormulaValid, qubitsNeededFor } from './problemCatalog';
import { applyHardwareToModel } from './urlState';
import { quantumEconomicAdvantage } from './qea';
import { SHEET_PROBLEMS } from './sheetSync/problems.config';
import { variationKey, variationKeys } from './sheetSync/variations';
import { hardwareTechnology } from './technology';
import { roadmapSpan } from './roadmapNotation';

export { hardwareTechnology, technologyLabel, TECHNOLOGY_ORDER } from './technology';

const currentYear = new Date().getFullYear();

// Problem sizes (as log10 n) used to compare how fast runtimes grow. They are
// large enough that polynomial terms beat log terms, and small enough that
// 2^n can still be computed in log space.
const LOG_N_NEAR = 150;
const LOG_N_FAR = 300;

// log10 of the runtime at n = 10^logN with one processor.
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

function slowerGrowth(a, b) {
    const key = g => Number.isFinite(g.far) ? g.far : Number.isFinite(g.near) ? g.near : Infinity;
    return key(a) - key(b);
}

// Big-O labels. Removes constants and smaller terms from a runtime formula,
// so 0.3*n^3 + 0.005*n^3*log2(n) becomes O(n^3 log n).

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
        // Keep the exponent as is when it contains n, since a constant there
        // changes the growth rate.
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
    // Write (log n)^2 rather than log n^2.
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

// Candidate algorithms

function matchesModel(algo, runtime, work) {
    return algo.runtimeFormula === runtime && algo.workFormula === work;
}

// Keep only algorithms for the same version of the problem, or for the general
// problem. Otherwise easier special cases (like planar graphs) would win.
function sameVersion(problem, options) {
    if (!problem.variation) return options;
    const sheet = SHEET_PROBLEMS.find(p => p.problemName === problem.problemName) || { problemName: problem.problemName };
    const target = variationKey(problem.variation, sheet);
    const kept = options.filter(a => a.recommended || !a.variation
        || [...variationKeys(a, sheet)].some(key => key === target || key === ''));
    return kept.length ? kept : options;
}

export function quantumCandidates(problem, model) {
    const options = sameVersion(problem, getAlgorithmOptions(problem, 'quantum')
        .filter(a => a.recommended || (!a.approximate && !a.heuristic)))
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

// Classical algorithms the baseline can be picked from.
export function classicalCandidates(problem, model) {
    const options = sameVersion(problem, getAlgorithmOptions(problem, 'classical')
        .filter(a => a.recommended || (!a.approximate && !a.heuristic && !a.parallel)));
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
    return options;
}

export function fastestClassical(problem, model) {
    // Pick the slowest-growing runtime. On a tie, keep the earlier one.
    const options = classicalCandidates(problem, model);
    let best = null;
    let bestGrowth = null;
    for (const algo of options) {
        const g = growthProfile(algo.runtimeFormula);
        if (!Number.isFinite(g.far) && !Number.isFinite(g.near)) continue;
        if (!best || slowerGrowth(g, bestGrowth) < 0) { best = algo; bestGrowth = g; }
    }
    return best;
}

// The comparison

// The time axis runs from this year to YEARS_SHOWN years ahead, in half years.
export const YEARS_SHOWN = 15;
const STEPS_PER_YEAR = 2;

// Turns a QEA result into a calendar year. "Already" becomes this year and a
// failed calculation becomes null.
function asYear(t) {
    if (t === null || t === undefined || Number.isNaN(t)) return null;
    if (t === 0) return currentYear;
    return t;
}

// log10(feasible size) - log10(advantage size). Returns null if it can't be
// calculated, and -Infinity if quantum doesn't win at any size that year.
function headroom(feasible, advantage) {
    if (advantage === null || advantage === undefined || !Number.isFinite(feasible)) return null;
    if (advantage === Infinity) return -Infinity;
    return feasible - advantage;
}

// Returns the value, or null if it isn't a finite number.
function finiteOrNull(value) {
    return Number.isFinite(value) ? value : null;
}

// Results for one algorithm on one hardware: the largest runnable size each
// year, and for both speed and cost the headroom, the size where quantum
// starts to win, the QEA year, and the largest runnable size in that year.
function seriesFor(model, hardware, classical, quantum, years) {
    const variant = JSON.parse(JSON.stringify(model));
    applyHardwareToModel(variant, hardware);
    variant.classicalRuntimeInput = classical.runtimeFormula;
    variant.classicalWork = classical.workFormula;
    variant.quantumRuntimeInput = quantum.runtimeFormula;
    variant.quantumWork = quantum.workFormula;
    variant.qubitsNeeded = quantum.qubits;
    delete variant.qubitToProblemSize;
    try {
        const qea = quantumEconomicAdvantage(variant, { fast: true });
        const sizes = [];
        const speed = { values: [], advantage: [] }, cost = { values: [], advantage: [] };
        for (const year of years) {
            const feasible = qea.cappedFeasible(year);
            sizes.push(finiteOrNull(feasible));
            for (const [entry, advantage] of [[speed, qea.quantumAdvantage(year)], [cost, qea.quantumCostAdvantage(year)]]) {
                entry.values.push(headroom(feasible, advantage));
                entry.advantage.push(finiteOrNull(advantage));
            }
        }
        for (const [entry, t] of [[speed, qea.tStar], [cost, qea.tCostStar]]) {
            entry.qea = asYear(t);
            entry.qeaSize = Number.isFinite(entry.qea) ? finiteOrNull(qea.cappedFeasible(entry.qea)) : null;
        }
        return { sizes, speed, cost };
    } catch (err) {
        console.warn('Hardware comparison failed for', hardware.hardwareName, quantum.name, err);
        const empty = () => ({ values: years.map(() => null), advantage: years.map(() => null), qea: null, qeaSize: null });
        return { sizes: years.map(() => null), speed: empty(), cost: empty() };
    }
}

// The best algorithm on one hardware is the one that reaches QEA first. If
// none does, it's the one with the most headroom at the end.
function bestOf(series) {
    let best = null;
    series.forEach((s, k) => {
        if (Number.isFinite(s.qea) && (best === null || s.qea < series[best].qea)) best = k;
    });
    if (best === null) {
        const last = s => s.values[s.values.length - 1];
        series.forEach((s, k) => {
            const v = last(s);
            if (v !== null && v !== -Infinity && (best === null || !(last(series[best]) >= v))) best = k;
        });
    }
    return best === null ? 0 : best;
}

// The recommended quantum algorithm is the one that does best on the most
// hardware, for both speed and cost. On a tie, the earlier one wins.
function recommendedOf(seriesByHardware) {
    const wins = seriesByHardware[0].map(() => 0);
    for (const series of seriesByHardware) {
        for (const mode of ['speed', 'cost']) wins[bestOf(series.map(s => s[mode]))]++;
    }
    return wins.indexOf(Math.max(...wins));
}

function lineOf(series, algorithm) {
    return {
        algorithm,
        values: series.values.map(v => (v === null || v === -Infinity ? null : v)),
        // log10 n where quantum starts to win, or null if it doesn't that year.
        advantage: series.advantage,
        // Infinity means not before 3000. null means it couldn't be calculated.
        qea: series.qea,
        qeaSize: series.qeaSize,
    };
}

/**
 * Returns everything the graph needs, or null if the problem has no quantum
 * algorithm or no usable classical one.
 *   years: the time axis
 *   lines: one per hardware, with { name, technology, basedOn, roadmapEnd,
 *     sizes, speed, cost }. sizes holds log10 of the largest runnable n each
 *     year. speed and cost each hold { algorithm, values, advantage, qea, qeaSize }.
 *   candidates: the quantum algorithms that were compared
 *   recommendedKey: the recommended quantum algorithm's key
 *   classical: the classical baseline
 * quantumKey and classicalKey pick a specific algorithm instead of the default.
 * Unknown keys fall back to the default.
 */
export function compareHardwareOverTime(model, problem, hardwares, { quantumKey = null, classicalKey = null } = {}) {
    if (!model || !problem) return null;
    const quantum = quantumCandidates(problem, model);
    const classical = (classicalKey && classicalCandidates(problem, model).find(a => a.key === classicalKey))
        || fastestClassical(problem, model);
    if (!quantum.length || !classical || !hardwares.length) return null;

    const years = Array.from({ length: YEARS_SHOWN * STEPS_PER_YEAR + 1 }, (_, i) => currentYear + i / STEPS_PER_YEAR);

    // Run every candidate on every hardware to find the recommended one.
    const seriesByHardware = hardwares.map(hardware => {
        // Algorithms with the same formulas and qubits give the same results, so cache them.
        const cache = new Map();
        return quantum.map(algorithm => {
            const key = [algorithm.runtimeFormula, algorithm.workFormula, algorithm.qubits].join('|');
            if (!cache.has(key)) cache.set(key, seriesFor(model, hardware, classical, algorithm, years));
            return cache.get(key);
        });
    });
    const recommended = recommendedOf(seriesByHardware);
    const chosen = quantumKey ? quantum.findIndex(a => a.key === quantumKey) : -1;
    const used = chosen >= 0 ? chosen : recommended;

    const lines = hardwares.map((hardware, h) => ({
        name: hardware.hardwareName,
        technology: hardwareTechnology(hardware),
        basedOn: hardware.basedOn || null,
        // The last roadmap year. Values after it are extrapolated.
        roadmapEnd: roadmapSpan(hardware.roadmap)?.[1] ?? null,
        sizes: seriesByHardware[h][used].sizes,
        speed: lineOf(seriesByHardware[h][used].speed, used),
        cost: lineOf(seriesByHardware[h][used].cost, used),
    }));

    return {
        years,
        lines,
        candidates: quantum.map(a => ({
            key: a.key || null,
            name: a.name || 'Quantum algorithm',
            authors: a.authorsLabel || null,
            year: a.year ?? null,
            tex: bigOTex(a.runtimeFormula),
            custom: !!a.custom,
        })),
        recommendedKey: quantum[recommended].key || null,
        classical: { key: classical.key || null, name: classical.name || 'Classical algorithm', tex: bigOTex(classical.runtimeFormula) },
    };
}
