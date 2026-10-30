// Quantum economic advantage (QEA) math, used by Models.vue and the hardware
// comparison graph. This was moved here from Models.vue.

import * as math from 'mathjs';
import * as utils from './utils';

const currentYear = new Date().getFullYear();

// returns log_10 of the problem size where qa is reached
// processors only apply if the variable p is used in the classical function
// logScale searches over log10(n) instead of n. It gives the same answer in
// fewer steps, which matters for the hardware comparison since it runs this
// many times.
export function getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year, { logScale = false } = {}) {
    let adjustmentFactor = Number(hardwareSlowdown) + (year - currentYear) * Math.log10(quantumImprovementRate);

    if (adjustmentFactor == null || isNaN(adjustmentFactor)) {
        console.log("Adjustment factor is null or NaN");
        console.log(`adjustment factor: ${adjustmentFactor}, hardwareSlowdown: ${hardwareSlowdown}, quantumImprovementRate: ${quantumImprovementRate}, year: ${year}`);
        return 0;
    }

    adjustmentFactor = math.max(adjustmentFactor, 0);

    // console.log("processors: ", processors);
    let effectiveProcessors = processors + (year - currentYear) * Math.log10(costImprovementRate);
    effectiveProcessors = math.max(effectiveProcessors, 0);

    function evaluate(n) {
        let scope = { n: n, p: Math.pow(10, effectiveProcessors) };
        let value = logClassicalFunction(n, scope) - logQuantumFunction(n) - logPenaltyFunction(n) - adjustmentFactor;
        return value;
    }

    let upperBound = 10 ** 100;
    let lowerBound = 2;
    // Start from the first n where both formulas are defined. Some formulas
    // don't work for very small n, which used to make the whole search fail.
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
        console.log(`null returned!!!! year was ${year} and adjustmentFactor was ${adjustmentFactor}`);
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

// log10 of the smallest n between lowerBound and upperBound where evaluate
// becomes positive. Returns 0, Infinity or null like the search above. It steps
// up by a factor of 10 at a time and then narrows down within that step, which
// avoids precision problems at very large n.
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

// Replaces q in a formula with the qubits needed for size n, so the work and
// penalty formulas can use q.
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
    const minimumPLQR = Math.log10(3); //minimum PLQR is 3
    adjustedPLQR = Math.max(adjustedPLQR, minimumPLQR);

    //logLogicalQubits has the log_10 of the number of logical qubits
    let logLogicalQubits = logOfPhysicalQubits - adjustedPLQR

    // Fewer than 1 logical qubit means nothing useful can be computed.
    if (!Number.isFinite(logLogicalQubits)) logLogicalQubits = 0;
    logLogicalQubits = Math.max(logLogicalQubits, 0);

    return logLogicalQubits
}

// Returns log10 of the largest problem size that fits in the logical qubits
// available in a given year.
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

// The feasibility and advantage curves for a model, and the QEA years where
// they cross: tStar for speed and tCostStar for cost. A year of 0 means QEA
// was already reached, Infinity means not before 3000, and null means the
// calculation failed.
// fast trades a little precision for speed. The hardware comparison uses it
// because it runs dozens of models at once.
export function quantumEconomicAdvantage(model, { fast = false } = {}) {
    const search = { logScale: fast };
    const yearTolerance = fast ? 1e-3 : 1e-7;

    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = utils.percentageToFraction(Number(model.ratioImprovementRate));
    let quantumImprovementRate = utils.percentageToFraction(Number(model.quantumImprovementRate));
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


    let costFactor = (Number(model.costFactor))
    let costImprovementRate = utils.percentageToFraction(Number(model.costImprovementRate));

    let processors = model.processors;

    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitsNeeded, roadmapUnit, model.extrapolationType)
    }

    function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate) {
        //should probably be refactored eventually
        return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year, search)
    }


    let quantumFeasible = qf(model.roadmap);

    // If there is a max compute time, also limit feasibility by it.
    let cappedFeasible = quantumFeasible;
    const hasTimeCap = model.maxComputeTimeLog != null;
    if (hasTimeCap) {
        cappedFeasible = function(year) {
            const qubitFeasible = quantumFeasible(year);

            // Hardware slowdown for this year (same formula as getQuantumAdvantage).
            let adjustedSlowdown = Number(hardwareSlowdown) + (year - currentYear) * Math.log10(quantumImprovementRate);
            adjustedSlowdown = Math.max(adjustedSlowdown, 0);

            // Largest problem size that fits in the time limit this year.
            const timeFeasible = utils.findTimeFeasibleProblemSize(lqf, lpf, model.maxComputeTimeLog, adjustedSlowdown);

            return Math.min(qubitFeasible, timeFeasible);
        };
    }

    let quantumAdvantage = qa(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate);
    let quantumCostAdvantage = qa(lcfc, lqfc, lpf, costFactor, costImprovementRate);

    // Use the time-limited feasibility so the QEA year takes the limit into
    // account. Bad values are replaced with -1 so they don't break the search.
    // A null advantage means the formulas couldn't be evaluated, so it counts
    // as no advantage that year.
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
