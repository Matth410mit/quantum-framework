/**
 * Hardware comparison over time: for one problem, one line per hardware
 * (presets and the user's own) showing how far its largest runnable problem is
 * past the smallest problem where quantum wins (the gap between the
 * feasibility line and the speed or cost advantage line of the QEA graph). The
 * line crosses 0 in the QEA year. Used by the Hardware Comparison page.
 *
 * Modelling choices (kept here and in docs/hardware-comparison.md, not in the UI):
 * - Every line uses the same quantum algorithm. Unless the reader picks one,
 *   it's the recommended one: the algorithm that does best (reaches QEA
 *   first) on the most hardware, for speed and cost (see recommendedOf). The
 *   page's dropdown marks it "Recommended". Candidates: the
 *   problem's quantum algorithms for its own variation or the general problem
 *   (see sameVersion), minus approximate and heuristic-based ones, plus the
 *   model's own formula when it isn't one of them. The calculator's default is
 *   always a candidate.
 * - Unless the reader picks one, the classical baseline (marked "Recommended"
 *   on the page) is the single
 *   classical algorithm whose runtime grows slowest as n grows (p = 1), from
 *   the same kind of pool minus parallel algorithms, plus the model's own
 *   classical formula when it isn't one of them.
 * - Each hardware line applies that hardware's fields to a copy of the model
 *   (as the hardware dropdown does). Everything else (max compute time, ...)
 *   stays as the model has it. Each quantum algorithm uses its own qubit count.
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

// Problem sizes (log10 n) used to compare growth. Large enough that
// polylog factors lose to polynomial ones (sqrt(n) log^4 n < n), small enough
// that 2^n stays finite in log space.
const LOG_N_NEAR = 150;
const LOG_N_FAR = 300;

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

// Only algorithms for the problem's own version, on both sides: its Variation
// (compared by meaning, as the sync does, so rewordings and notes like
// "(Adjacency List Model)" still match) or the general problem. The pickers
// also list special or easier cases (planar graphs, DAGs, verifying an MST,
// undirected components for SCCs, max-weight instead of maximal cliques)
// that would otherwise win.
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

// The classical algorithms the baseline is chosen from.
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
    // Slowest-growing runtime; ties keep the earlier option (the default first).
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

// ---------------------------------------------------------------------------
// The comparison

// The time axis: this year to YEARS_SHOWN years out, every half year.
export const YEARS_SHOWN = 15;
const STEPS_PER_YEAR = 2;

// QEA years as calendar years: "already" becomes this year, a failed
// bisection becomes null, never stays Infinity.
function asYear(t) {
    if (t === null || t === undefined || Number.isNaN(t)) return null;
    if (t === 0) return currentYear;
    return t;
}

// log10(feasible size) - log10(advantage size). null when it can't be
// calculated; -Infinity when quantum doesn't win at any size that year.
function headroom(feasible, advantage) {
    if (advantage === null || advantage === undefined || !Number.isFinite(feasible)) return null;
    if (advantage === Infinity) return -Infinity;
    return feasible - advantage;
}

// Headroom for every year, and the QEA years, for one algorithm on one hardware.
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
        const speed = [], cost = [];
        for (const year of years) {
            const feasible = qea.cappedFeasible(year);
            speed.push(headroom(feasible, qea.quantumAdvantage(year)));
            cost.push(headroom(feasible, qea.quantumCostAdvantage(year)));
        }
        return {
            speed: { values: speed, qea: asYear(qea.tStar) },
            cost: { values: cost, qea: asYear(qea.tCostStar) },
        };
    } catch (err) {
        console.warn('Hardware comparison failed for', hardware.hardwareName, quantum.name, err);
        const empty = { values: years.map(() => null), qea: null };
        return { speed: empty, cost: { ...empty } };
    }
}

// The candidate that does best on one hardware: the one that reaches QEA
// first; if none does, the one with the most headroom at the end of the
// period. (Picking the best algorithm year by year gives the same lines: on
// the current sheet the best algorithm never changes within the period on any
// problem.)
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

// The recommended quantum algorithm: the one that does best on the most
// hardware, counting speed and cost. Ties go to the earlier candidate (the
// calculator's default comes first).
function recommendedOf(seriesByHardware) {
    const wins = seriesByHardware[0].map(() => 0);
    for (const series of seriesByHardware) {
        for (const mode of ['speed', 'cost']) wins[bestOf(series.map(s => s[mode]))]++;
    }
    return wins.indexOf(Math.max(...wins));
}

// One line's values for one mode.
function lineOf(series, algorithm) {
    return {
        algorithm,
        values: series.values.map(v => (v === null || v === -Infinity ? null : v)),
        // Infinity: not before 3000. null: couldn't be calculated.
        qea: series.qea,
    };
}

/**
 * Everything the graph needs, or null when the problem has no quantum
 * algorithm or no usable classical one. Every hardware uses the same quantum
 * algorithm.
 *   years: [year...] (twice a year, this year to YEARS_SHOWN years out)
 *   lines: [{ name, technology, basedOn, roadmapEnd, speed, cost }], one per hardware,
 *     where speed and cost are { algorithm (candidate index),
 *     values: [headroom | null], qea: year | Infinity | null }
 *   candidates: [{ key, name, authors, year, tex, custom }]
 *   recommendedKey: the recommended quantum algorithm's key (see recommendedOf)
 *   classical: { key, name, tex }
 * options.quantumKey / options.classicalKey: use that algorithm (an
 * algorithm's key) instead of the recommended quantum one or the fastest
 * classical one. Unknown keys fall back to those.
 */
export function compareHardwareOverTime(model, problem, hardwares, { quantumKey = null, classicalKey = null } = {}) {
    if (!model || !problem) return null;
    const quantum = quantumCandidates(problem, model);
    const classical = (classicalKey && classicalCandidates(problem, model).find(a => a.key === classicalKey))
        || fastestClassical(problem, model);
    if (!quantum.length || !classical || !hardwares.length) return null;

    const years = Array.from({ length: YEARS_SHOWN * STEPS_PER_YEAR + 1 }, (_, i) => currentYear + i / STEPS_PER_YEAR);

    // Every candidate on every hardware, to find the recommended one.
    const seriesByHardware = hardwares.map(hardware => {
        // Algorithms with the same formulas and qubits give the same results.
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
        // The last roadmap year; later values are extrapolated.
        roadmapEnd: roadmapSpan(hardware.roadmap)?.[1] ?? null,
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
