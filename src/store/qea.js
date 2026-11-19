// Quantum economic advantage (QEA) math, shared by Models.vue and the
// hardware comparison graph.

import * as math from 'mathjs';
import * as utils from './utils';

const currentYear = new Date().getFullYear();

// returns log_10 of the problem size where qa is reached
// processors only apply if the variable p is used in the classical function
// logScale: search over log10(n) instead of n (firstCrossingLogScale). Same
// root, in a few dozen steps instead of ~350; used by the hardware comparison,
// which runs this many times.
// slowdown: log10, already worked out for the year (the hardware slowdown for
// speed, the cost factor for cost). processors: log10 of the classical cores.
export function getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, slowdown, processors, { logScale = false } = {}) {
    let adjustmentFactor = Number(slowdown);

    if (slowdown == null || isNaN(adjustmentFactor)) {
        console.log(`Slowdown or cost factor is null or NaN: ${slowdown}`);
        return 0;
    }

    adjustmentFactor = math.max(adjustmentFactor, 0);

    // The comparably priced classical machine is the same size every year.
    const p = Math.pow(10, Number(processors));

    function evaluate(n) {
        let scope = { n: n, p };
        let value = logClassicalFunction(n, scope) - logQuantumFunction(n) - logPenaltyFunction(n) - adjustmentFactor;
        return value;
    }

    let upperBound = 10 ** 100;
    let lowerBound = 2;
    // Start where both formulas are defined: some aren't for tiny inputs
    // (pattern length m = n/9 gives log(n/9) < 0 below n = 9; 2n - 5 qubits is
    // negative at n = 2), and an undefined value at n = 2 used to fail the
    // whole search.
    while (lowerBound < 50 && !Number.isFinite(evaluate(lowerBound))) {
        lowerBound += 0.25;
    }
    let lastValue = evaluate(lowerBound);
    while (lowerBound < 50 && lastValue >= 0) {
        lowerBound += 0.25;
        let nextValue = evaluate(lowerBound);

        lastValue = nextValue;
    }
    if (logScale) {
        return firstCrossingLogScale(evaluate, lowerBound, upperBound);
    }

    let result = utils.bisectionMethod(evaluate, lowerBound, upperBound, "QA bisection");

    if (result === null) {
        console.log(`QA bisection returned null; adjustmentFactor was ${adjustmentFactor}`);
        console.log("lowerBound:", lowerBound, "upperBound:", upperBound);
        console.log("f(lowerBound):", evaluate(lowerBound), "f(upperBound):", evaluate(upperBound));
        return null;
    }
    else if (result == 0) {
        return 0;
    }
    else if (result == Infinity) {
        return Infinity;
    }


    // if (lowerBound > 2) {
    //     console.log(`Final lowerBound guess was ${lowerBound}`);
    // }

    return Math.log10(result);
}

// log10 of the smallest n in [lowerBound, upperBound] where evaluate turns
// positive, with the same 0 / Infinity / null results as the bisection above.
// Steps up one order of magnitude at a time and then bisects that step, so it
// stays below the sizes where the log formulas lose precision (above ~10^16,
// terms like n/2 * log10(2) swamp log10(n) and the sign becomes noise).
function firstCrossingLogScale(evaluate, lowerBound, upperBound) {
    const f = x => evaluate(10 ** x);
    const lo = Math.log10(lowerBound), hi = Math.log10(upperBound);
    const fLo = evaluate(lowerBound), fHi = f(hi);
    if (fLo == null || fHi == null || isNaN(fLo) || isNaN(fHi)) return null;
    if (fLo >= 0) return 0;
    if (fHi < 0) return Infinity;
    let a = lo;
    for (let b = Math.min(Math.floor(lo) + 1, hi); ; b = Math.min(b + 1, hi)) {
        const fb = f(b);
        if (fb == null || isNaN(fb)) return null;
        if (fb >= 0) {
            const root = utils.bisectionMethod(f, a, b, "QA bisection (log scale)");
            return root === 0 ? a : root;
        }
        if (b >= hi) return Infinity;
        a = b;
    }
}

// Replaces q (logical qubits) in a formula with the qubits needed for size n,
// so work and penalty formulas can use q.
export function convertQubits(model, expression) {
    return utils.replaceVariable(expression, "q", `(${utils.modelQubitsNeeded(model)})`);
}

//returns the log_10 of the amount of logical qubits available with the given parameters
export function getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, roadmapUnit, extrapolationType) {
    const logOfPhysicalQubits = utils.getPhysicalQubits(year, roadmap, extrapolationType)
    if (roadmapUnit === "logical") {
        return logOfPhysicalQubits
    }

    //log_10 of the PLQR including the ratio improvement rate
    let adjustedPLQR = Math.log10(physicalLogicalQubitsRatio) + (year - currentYear) * Math.log10(ratioImprovementRate);
    const minimumPLQR = Math.log10(utils.MINIMUM_PLQR);
    adjustedPLQR = Math.max(adjustedPLQR, minimumPLQR);

    //logLogicalQubits has the log_10 of the number of logical qubits
    let logLogicalQubits = logOfPhysicalQubits - adjustedPLQR

    // Clamp: fewer than 1 logical qubit means nothing useful can be computed
    if (!Number.isFinite(logLogicalQubits)) logLogicalQubits = 0;
    logLogicalQubits = Math.max(logLogicalQubits, 0);

    return logLogicalQubits
}

// returns the (base-10) log of the problem size solvable for a given year:
// the largest n whose qubits needed fit in the logical qubits available
export function getQuantumFeasible(
    year,
    roadmap,
    physicalLogicalQubitsRatio,
    ratioImprovementRate,
    qubitsNeeded,
    roadmapUnit,
    extrapolationType
) {
    // logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = getLogicalQubits(
        year,
        roadmap,
        physicalLogicalQubitsRatio,
        ratioImprovementRate,
        roadmapUnit,
        extrapolationType
    )
    return utils.problemSizeForQubits(qubitsNeeded, logLogicalQubits)
}

// log10 of the hardware slowdown in a given year. It changes by
// quantumImprovementRate percent a year and never goes below 0.
export function slowdownFunction(model) {
    const slowdown = Number(model.hardwareSlowdown);
    const rate = Math.log10(utils.percentageToFraction(Number(model.quantumImprovementRate)));
    return year => Math.max(slowdown + (year === currentYear ? 0 : (year - currentYear) * rate), 0);
}

// null (or an empty input) means the cost factor is computed; a number is
// one the user set.
export function isComputedCostFactor(costFactor) {
    return costFactor == null || costFactor === '';
}

// log10 of what one logical operation costs, in classical operations, in a
// given year. The computed value is the machine's price for one logical step
// (it costs as much as 10^processors classical cores) shared by its logical
// qubits. A value the user set changes by costImprovementRate percent a year.
export function costFactorFunction(model) {
    if (!isComputedCostFactor(model.costFactor)) {
        const costFactor = Number(model.costFactor);
        const rate = Math.log10(utils.percentageToFraction(Number(model.costImprovementRate)));
        return year => costFactor + (year === currentYear ? 0 : (year - currentYear) * rate);
    }
    const slowdownAt = slowdownFunction(model);
    const processors = Number(model.processors);
    const ratio = Number(model.physicalLogicalQubitsRatio);
    const ratioRate = utils.percentageToFraction(Number(model.ratioImprovementRate));
    return year => {
        let logLogicalQubits = getLogicalQubits(year, model.roadmap, ratio, ratioRate, model.roadmapUnit, model.extrapolationType);
        if (!Number.isFinite(logLogicalQubits)) logLogicalQubits = 0;
        return slowdownAt(year) + processors - Math.max(logLogicalQubits, 0);
    };
}

// The feasibility and advantage curves for a model, and the QEA years where
// they cross: tStar (speed) and tCostStar (cost). A year of 0 means QEA has
// already been reached; Infinity means not before 3000; null means the
// bisection failed.
// fast: log-scale size search and years to ~1 day instead of 1e-7, for the
// hardware comparison (dozens of models at once).
export function quantumEconomicAdvantage(model, { fast = false } = {}) {
    const search = { logScale: fast };
    const yearTolerance = fast ? 1e-3 : 1e-7;

    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = utils.percentageToFraction(Number(model.ratioImprovementRate));
    let qubitsNeeded = utils.modelQubitsNeeded(model);
    let roadmapUnit = model.roadmapUnit;

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = convertQubits(model, model.penaltyInput);


    //lcf = logged classical function
    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);

    //lcfc = logged classical function cost
    let lcfc = utils.createLoggedFunction(model.classicalWork);
    let lqfc = utils.createLoggedFunction(convertQubits(model, model.quantumWork));


    const slowdownAt = slowdownFunction(model);
    const costFactorAt = costFactorFunction(model);
    let processors = Number(model.processors);

    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitsNeeded, roadmapUnit, model.extrapolationType)
    }

    // slowdownOf(year) gives the log10 slowdown, or cost factor, for that year
    function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, slowdownOf) {
        return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, slowdownOf(year), processors, search)
    }


    let quantumFeasible = qf(model.roadmap);

    // If a max compute time cap is set, build a capped feasibility function
    let cappedFeasible = quantumFeasible;
    const hasTimeCap = model.maxComputeTimeLog != null;
    if (hasTimeCap) {
        cappedFeasible = function(year) {
            const qubitFeasible = quantumFeasible(year);

            const adjustedSlowdown = slowdownAt(year);

            // Find max problem size within the time budget for this year
            const timeFeasible = utils.findTimeFeasibleProblemSize(lqf, lpf, model.maxComputeTimeLog, adjustedSlowdown);

            return Math.min(qubitFeasible, timeFeasible);
        };
    }

    let quantumAdvantage = qa(lcf, lqf, lpf, slowdownAt);
    let quantumCostAdvantage = qa(lcfc, lqfc, lpf, costFactorAt);

    // Use capped feasibility for tStar/tCostStar so the QEA point reflects the time constraint
    // Wrap inner functions to return finite values to prevent NaN/Infinity from breaking bisection
    // A null advantage (the formulas can't be evaluated) counts as no advantage
    // that year; subtracting it directly would treat it as 0, i.e. advantage.
    const tStar = utils.bisectionMethod(year => {
        const advantage = quantumAdvantage(year);
        const val = advantage === null ? NaN : cappedFeasible(year) - advantage;
        return Number.isFinite(val) ? val : -1;
    }, currentYear, 3000, "tStar in QEA", yearTolerance);
    const tCostStar = utils.bisectionMethod(year => {
        const advantage = quantumCostAdvantage(year);
        const val = advantage === null ? NaN : cappedFeasible(year) - advantage;
        return Number.isFinite(val) ? val : -1;
    }, currentYear, 3000, "tCostStar in QEA", yearTolerance);

    return {
        tStar,
        tCostStar,
        quantumFeasible,
        cappedFeasible,
        hasTimeCap,
        quantumAdvantage,
        quantumCostAdvantage,
        qubitsNeeded,
        physicalLogicalQubitsRatio,
        ratioImprovementRate,
        roadmapUnit,
    };
}
