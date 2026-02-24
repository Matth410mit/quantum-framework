<script setup>
import MappingPreview from './MappingPreview.vue'
import { re } from 'mathjs';
import { watch, ref, defineAsyncComponent } from 'vue';
import * as utils from "../store/utils"

import * as math from 'mathjs';

const QuantumAdvantageGraph = defineAsyncComponent(() => import('./QuantumAdvantageGraph.vue'));
const QuantumEconomicAdvantageGraph = defineAsyncComponent(() => import('./QuantumEconomicAdvantageGraph.vue'));
const QuantumCharacteristicsGraph = defineAsyncComponent(() => import('./QuantumCharacteristicsGraph.vue'));
const Form = defineAsyncComponent(() => import('./Form.vue'));

const currentYear = new Date().getFullYear();

const props = defineProps({
    model: Object,
    modelIndex: Number
});

import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/vue'
import { get } from '@vueuse/core';

// returns log_10 of the problem size where qa is reached
// processors only apply if the variable p is used in the classical function
function getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year) {
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
    let lastValue = evaluate(lowerBound);
    while (lowerBound < 50 && lastValue >= 0) {
        lowerBound += 0.25;
        let nextValue = evaluate(lowerBound);

        lastValue = nextValue;
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

// converts expression with q (qubits) to expression with n (problem size)
// by using the inverse of the mapping. Supports BOTH legacy "{q}" strings
// and the new "q" strings.
function convertQubits(model, expression) {
    const kind = utils.classifyQubitMapping(model.qubitToProblemSize); // 'exp', 'doubleexp', 'linear', 'log', 'custom'
    let replacement = "";

    if (kind === 'exp') {   // n = 2^q   ->  q = log2(n)
        replacement = "(log(n, 2))";
    } else if (kind === 'log') { // n = log2(q)  ->  q = 2^n
        replacement = "(2^n)";
    } else if (kind === 'linear') { // n = q   ->  q = n
        replacement = "n";
    } else {
        // Arbitrary mapping: don’t attempt a symbolic inverse
        return expression;
    }

    // Replace any occurrence of q (or {q}) in the math expression safely
    return utils.replaceVariable(expression, "q", replacement);
}


function calculateCurrentAdvantage(model) {
    let hardwareSlowdown = Number(model.hardwareSlowdown);
    let quantumImprovementRate = utils.percentageToFraction(Number(model.quantumImprovementRate));
    let costFactor = Number(model.costFactor)
    let costImprovementRate = utils.percentageToFraction(Number(model.costImprovementRate));
    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;

    let penaltyInput = convertQubits(model, model.penaltyInput);

    let processors = model.processors;

    //lcf = logged classical function
    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);

    //ccf = converted classical function
    let ccf = utils.createConvertedFunction(classicalRuntimeInput);
    let cqf = utils.createConvertedFunction(quantumRuntimeInput);
    let cpf = utils.createConvertedFunction(penaltyInput);

    //lcfc = logged classical function cost
    let lcfc = utils.createLoggedFunction(model.classicalWork);
    let quantumWork = convertQubits(model, model.quantumWork);
    let lqfc = utils.createLoggedFunction(quantumWork);

    //ccfc = converted classical function cost
    let ccfc = utils.createConvertedFunction(model.classicalWork);
    let cqfc = utils.createConvertedFunction(quantumWork);

    let advantage = getQuantumAdvantage(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, currentYear);
    let costAdvantage = getQuantumAdvantage(lcfc, lqfc, lpf, costFactor, costImprovementRate, processors, costImprovementRate, currentYear); //should be refactored to avoid using same parameter twice

    // range from 0 to double of the advantage with 200 ticks
    let range = []
    let currentAdvantageDataAux = {}
    let xMax = 0;
    let defaultMax = 100;

    if (advantage === null || costAdvantage === null) {
        // show error message to user
        console.log("Error: advantage or costAdvantage is null");
        console.log(`advantage: ${advantage}, costAdvantage: ${costAdvantage}`);
        return;
    }

    if (advantage === Infinity && costAdvantage === Infinity) {
        console.log("both advantages are infinity");
        xMax = defaultMax;
        currentAdvantageDataAux = {
            nStar: -1,
            stepStar: -1,
            nCostStar: -1,
            stepCostStar: -1,
        }
    }
    else if (advantage === Infinity) {
        console.log("speed advantage is infinity");
        if (costAdvantage == 0) {
            console.log("and cost advantage is zero");
            xMax = defaultMax;
        }
        else {
            xMax = costAdvantage * 2;
        }
        currentAdvantageDataAux = {
            nStar: -1,
            stepStar: -1,
            nCostStar: costAdvantage,
            stepCostStar: ccfc(costAdvantage),
        }
    }
    else if (costAdvantage == Infinity) {
        console.log("cost advantage is infinity");
        if (advantage == 0) {
            console.log("and speed advantage is zero");
            xMax = defaultMax;
        }
        else {
            xMax = advantage * 2;
        }
        currentAdvantageDataAux = {
            nStar: advantage,
            stepStar: ccf(advantage, { n: advantage, p: Math.pow(10, processors) }),
            nCostStar: -1,
            stepCostStar: -1,
        }
    }
    else {
        if (advantage == 0 && costAdvantage == 0) {
            console.log("both advantages are zero");
            xMax = defaultMax;
        }
        else if (advantage == 0) {
            console.log("only speed advantage is zero");
            xMax = costAdvantage * 2;
        }
        else if (costAdvantage == 0) {
            console.log("only cost advantage is zero");
            xMax = advantage * 2;
        }
        else {
            xMax = advantage + costAdvantage;
        }

        currentAdvantageDataAux = {
            nStar: advantage,
            stepStar: ccf(advantage, { n: advantage, p: Math.pow(10, processors) }),
            nCostStar: costAdvantage,
            stepCostStar: ccfc(costAdvantage),
        }
    }

    for (let i = 0; i < xMax; i += xMax / 200) {
        range.push(i);
    }

    currentAdvantageDataAux = {
        ...currentAdvantageDataAux,
        quantumSteps: range.map((i) => [i, cqf(i) + cpf(i) + hardwareSlowdown]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
        classicalSteps: range.map((i) => [i, ccf(i, { n: i, p: Math.pow(10, processors) })]).map(([x, y]) => [x, isNaN(y) ? -1 : y]),
        quantumCostSteps: range.map((i) => [i, cqfc(i) + cpf(i) + costFactor]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
        classicalCostSteps: range.map((i) => [i, ccfc(i)]).map(([x, y]) => [x, isNaN(y) ? -1 : y])
    }


    // console.log("printing current advantages");
    // console.log(advantage, costAdvantage);

    currentAdvantageData.value = {
        ...currentAdvantageDataAux,
        problemName: model.problemName,
    }
}


function calculateQuantumEconomicAdvantage(model) {
    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = utils.percentageToFraction(Number(model.ratioImprovementRate));
    let quantumImprovementRate = utils.percentageToFraction(Number(model.quantumImprovementRate));
    let qubitToProblemSize = model.qubitToProblemSize;
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
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
    }

    function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate) {
        //should probably be refactored eventually
        return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year)
    }


    let quantumFeasible = qf(model.roadmap);

    // If a max compute time cap is set, build a capped feasibility function
    let cappedFeasible = quantumFeasible;
    const hasTimeCap = model.maxComputeTimeLog != null;
    if (hasTimeCap) {
        cappedFeasible = function(year) {
            const qubitFeasible = quantumFeasible(year);

            // Compute the year-adjusted hardware slowdown (same formula as getQuantumAdvantage)
            let adjustedSlowdown = Number(hardwareSlowdown) + (year - currentYear) * Math.log10(quantumImprovementRate);
            adjustedSlowdown = Math.max(adjustedSlowdown, 0);

            // Find max problem size within the time budget for this year
            const timeFeasible = utils.findTimeFeasibleProblemSize(lqf, lpf, model.maxComputeTimeLog, adjustedSlowdown);

            return Math.min(qubitFeasible, timeFeasible);
        };
    }

    let quantumAdvantage = qa(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate);
    let quantumCostAdvantage = qa(lcfc, lqfc, lpf, costFactor, costImprovementRate);

    let quantumEconomicAdvantageDataAux = {}

    // Use capped feasibility for tStar/tCostStar so the QEA point reflects the time constraint
    const tStar = utils.bisectionMethod(year => cappedFeasible(year) - quantumAdvantage(year), currentYear, 3000, "tStar in QEA");
    const tCostStar = utils.bisectionMethod(year => cappedFeasible(year) - quantumCostAdvantage(year), currentYear, 3000, "tCostStar in QEA");

    console.log("printing stuff");
    console.log(cappedFeasible(currentYear), quantumAdvantage(currentYear));
    console.log(cappedFeasible(3000), quantumAdvantage(3000));

    let yearRadius = 0; //({last year on the QEA graph} - currentYear) / 2; used to populate ranges
    let defaultRadius = 5;
    if (tStar === null || tCostStar === null) {
        // show error message to user
        console.log("Error: tStar or tCostStar is null");
        return;
    }

    if (tStar === Infinity && tCostStar === Infinity) {
        console.log("QEA never happens (neither speed nor cost)");
        yearRadius = defaultRadius;
        quantumEconomicAdvantageDataAux = {
            tStar: Infinity,
            nStar: Infinity,
            tCostStar: Infinity,
            nCostStar: Infinity,
        }
    }
    else if (tStar === Infinity) {
        console.log("speed QEA never happens");
        if (tCostStar == 0) {
            console.log("and already QEA for cost");
            yearRadius = defaultRadius;
        }
        else {
            yearRadius = tCostStar - currentYear;
        }
        quantumEconomicAdvantageDataAux = {
            tStar: Infinity,
            nStar: Infinity,
            tCostStar: tCostStar,
            nCostStar: cappedFeasible(tCostStar),
        }
    }
    else if (tCostStar == Infinity) {
        console.log("cost QEA never happens");
        if (tStar == 0) {
            console.log("and already QEA for speed");
            yearRadius = defaultRadius;
        }
        else {
            yearRadius = tStar - currentYear;
        }
        quantumEconomicAdvantageDataAux = {
            tStar: tStar,
            nStar: cappedFeasible(tStar),
            tCostStar: Infinity,
            nCostStar: Infinity,
        }
    }
    else {
        if (tStar == 0 && tCostStar == 0) {
            console.log("already QEA for both speed and cost");
            yearRadius = defaultRadius;
        }
        else if (tStar == 0) {
            console.log("already QEA for speed");
            yearRadius = tCostStar - currentYear;
        }
        else if (tCostStar == 0) {
            console.log("already QEA for cost");
            yearRadius = tStar - currentYear;
        }
        else {
            yearRadius = (tStar + tCostStar) / 2 - currentYear;
        }

        quantumEconomicAdvantageDataAux = {
            tStar: tStar,
            nStar: cappedFeasible(tStar),
            tCostStar: tCostStar,
            nCostStar: cappedFeasible(tCostStar),
        }
    }

    let range = [];
    for (let i = 0; i < yearRadius * 2; i += yearRadius / 100) {
        // for (let i = 0; i < yearRadius * 250; i += yearRadius / 100) {
        // for (let i = 0; i < yearRadius * 250; i += yearRadius / 10) {
        range.push(i);
    }

    let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    let quantumAdvantageList = range.map(i => [currentYear + i, quantumAdvantage(currentYear + i)])
    let quantumCostAdvantageList = range.map(i => [currentYear + i, quantumCostAdvantage(currentYear + i)])

    // Build capped feasibility list when time cap is enabled
    let quantumFeasibleCappedList = hasTimeCap
        ? range.map(i => [currentYear + i, cappedFeasible(currentYear + i)])
        : null;

    quantumEconomicAdvantageDataAux = {
        ...quantumEconomicAdvantageDataAux,
        quantumFeasible: quantumFeasibleList,
        quantumFeasibleCapped: quantumFeasibleCappedList,
        quantumAdvantage: quantumAdvantageList,
        quantumCostAdvantage: quantumCostAdvantageList,
    }

    console.log("tStar is ", tStar, "tCostStar is ", tCostStar);
    console.log("nStar is", cappedFeasible(tStar), "nCostStar is", cappedFeasible(tCostStar));

    // // when there is no quantum advantage
    // if (quantumAdvantage(currentYear) >= 99999) {
    //     console.log("probably never prints: problem size for QA is too large (> 10 ** 99999)")

    //     let range = []

    //     for (let i = 0; i < (2030 - currentYear) * 2; i += (2030 - currentYear) / 100) {
    //         range.push(i);
    //     }
    //     let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    //     quantumEconomicAdvantageDataAux = {
    //         tStar: -1,
    //         nStar: -1,
    //         quantumFeasible: quantumFeasibleList,
    //         quantumAdvantage: range.map(i => [currentYear + i, Infinity])
    //     }
    // } 
    // else {
    //     let range = []

    //     if (tStar != null) {
    //         for (let i = 0; i < ((tStar + tCostStar) / 2 - currentYear) * 2; i += ((tStar + tCostStar) / 2 - currentYear) / 100) {
    //             range.push(i);
    //         }
    //         let nStar = quantumFeasible(tStar)

    //         let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    //         let quantumAdvantageList = range.map(i => [currentYear + i, quantumAdvantage(currentYear + i)])

    //         quantumEconomicAdvantageDataAux = {
    //             tStar: tStar,
    //             nStar: nStar,
    //             quantumFeasible: quantumFeasibleList,
    //             quantumAdvantage: quantumAdvantageList
    //         }

    //     } else {
    //         console.log("tstar is null")
    //         for (let i = 0; i < (2030 - currentYear) * 2; i += (2030 - currentYear) / 100) {
    //             range.push(i);
    //         }
    //         let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    //         let quantumAdvantageList = range.map(i => [currentYear + i, quantumAdvantage(currentYear + i)])
    //         quantumEconomicAdvantageDataAux = {
    //             tStar: 0,
    //             nStar: 0,
    //             quantumFeasible: quantumFeasibleList,
    //             quantumAdvantage: quantumAdvantageList
    //         }

    //     }
    // }

    // if (quantumCostAdvantage(2024) >= 99999) {
    //     let range = []

    //     for (let i = 0; i < (2030 - currentYear) * 2; i += (2030 - currentYear) / 100) {
    //         range.push(i);
    //     }
    //     let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    //     quantumEconomicAdvantageDataAux = {
    //         ...quantumEconomicAdvantageDataAux,
    //         tCostStar: -1,
    //         nCostStar: -1,
    //         quantumCostFeasible: quantumFeasibleList,

    //         quantumCostAdvantage: range.map(i => [currentYear + i, Infinity])
    //     }
    // } 
    // else {
    //     let range = []

    //     if (tCostStar != null) {
    //         for (let i = 0; i < ((tStar + tCostStar) / 2 - currentYear) * 2; i += ((tStar + tCostStar) / 2 - currentYear) / 100) {
    //             range.push(i);
    //         }
    //         let nCostStar = quantumFeasible(tCostStar)

    //         let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    //         let quantumCostAdvantageList = range.map(i => [currentYear + i, quantumCostAdvantage(currentYear + i)])

    //         quantumEconomicAdvantageDataAux = {
    //             ...quantumEconomicAdvantageDataAux,
    //             tCostStar: tCostStar,
    //             nCostStar: nCostStar,
    //             quantumCostFeasible: quantumFeasibleList,

    //             quantumCostAdvantage: quantumCostAdvantageList
    //         }
    //     } else {
    //         console.log("tCoststar is null")
    //         for (let i = 0; i < (2030 - currentYear) * 2; i += (2030 - currentYear) / 100) {
    //             range.push(i);
    //         }
    //         let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    //         let quantumCostAdvantageList = range.map(i => [currentYear + i, quantumCostAdvantage(currentYear + i)])
    //         quantumEconomicAdvantageDataAux = {
    //             ...quantumEconomicAdvantageDataAux,
    //             tCostStar: 0,
    //             nCostStar: 0,
    //             quantumCostFeasible: quantumFeasibleList,

    //             quantumCostAdvantage: quantumCostAdvantageList
    //         }
    //     }
    // }


    quantumEconomicAdvantageData.value = {
        ...quantumEconomicAdvantageDataAux,
        problemName: model.problemName,
    }

    roadmapCharacteristicsData.value = {
        roadmapUnit: roadmapUnit,
        tCostStar: quantumEconomicAdvantageDataAux.tCostStar,
        tStar: quantumEconomicAdvantageDataAux.tStar,
        roadmap: model.roadmap,
        extrapolationType: model.extrapolationType,
        physicalLogicalQubitsRatio: physicalLogicalQubitsRatio,
        ratioImprovementRate: ratioImprovementRate,
        qubitToProblemSize: qubitToProblemSize,
        quantumFeasible: quantumEconomicAdvantageDataAux.quantumFeasible,
    }
}


//returns the log_10 of the amount of logical qubits available with the given parameters
function getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, roadmapUnit) {
    const logOfPhysicalQubits = utils.getPhysicalQubits(year, roadmap, props.model.extrapolationType)
    if (roadmapUnit === "logical") {
        return logOfPhysicalQubits
    }

    //log_10 of the PLQR including the ratio improvement rate
    let adjustedPLQR = Math.log10(physicalLogicalQubitsRatio) + (year - currentYear) * Math.log10(ratioImprovementRate);
    const minimumPLQR = Math.log10(3); //minimum PLQR is 3
    adjustedPLQR = Math.max(adjustedPLQR, minimumPLQR);

    //logLogicalQubits has the log_10 of the number of logical qubits
    let logLogicalQubits = logOfPhysicalQubits - adjustedPLQR

    return logLogicalQubits
}


// returns the (base-10) log of the problem size solvable for a given year
function getQuantumFeasible(
    year,
    roadmap,
    physicalLogicalQubitsRatio,
    ratioImprovementRate,
    qubitToProblemSize,
    roadmapUnit
) {
    // logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = getLogicalQubits(
        year,
        roadmap,
        physicalLogicalQubitsRatio,
        ratioImprovementRate,
        roadmapUnit
    )

    // Classify the mapping (supports both old "{q}" and new "q" forms)
    const kind = utils.classifyQubitMapping(qubitToProblemSize)

    if (kind === 'exp') {
        // n = 2^q  (return log10(n))
        // log10(n) = q * log10(2) = (10^logLogicalQubits) * log10(2)  [this would explode]
        // Careful: logLogicalQubits = log10(q). We want log10(n) = (2^q) in base10 -> too big.
        // Use exact same behavior as your previous implementation:
        let problemSize = (logLogicalQubits + Math.log10(Math.log10(2)))
        return 10 ** problemSize
    }

    if (kind === 'doubleexp') {
        // n = 2^(2^q)
        let problemSize = Math.pow(2, Math.pow(10, logLogicalQubits)) * Math.log10(2)
        return problemSize
    }

    if (kind === 'linear') {
        // n = q
        return logLogicalQubits
    }

    if (kind === 'log') {
        // n = log2(q)
        let problemSize = Math.log10(logLogicalQubits) - Math.log10(Math.log10(2))
        if (isNaN(problemSize)) return 0
        return problemSize
    }

    // Custom expression n(q): evaluate numerically with the number of logical qubits
    const logicalQubits = Math.pow(10, logLogicalQubits)
    const mapped = utils.evaluateQubitMapping(qubitToProblemSize, logicalQubits, { clamp: 1e300 })

    if (!mapped.ok) {
        console.log("Custom qubit→problem mapping could not be evaluated:", mapped.error)
        return 0
    }
    return mapped.value
}


const currentAdvantageData = ref({});
const quantumEconomicAdvantageData = ref({});
const roadmapCharacteristicsData = ref({});

// toggles for graphs
const showStepLines = ref(true);
const showCostLines = ref(true);


// watch problems and hardwareslowdown
watch(() => props.model, (model) => {
    try {
        calculateCurrentAdvantage(props.model);
    } catch (err) {
        console.warn('Failed to calculate current advantage:', err);
    }
    try {
        calculateQuantumEconomicAdvantage(props.model);
    } catch (err) {
        console.warn('Failed to calculate quantum economic advantage:', err);
    }
}, { immediate: true, deep: true });

</script>

<template>
    <div class="max-w-7xl mx-auto my-4 border border-gray-100 rounded-lg shadow-lg ">

        <div>
            <Form :modelId="model.id" />
        </div>
        <Disclosure as="div" class="px-8 py-2" v-slot="{ open }" defaultOpen>
            <DisclosureButton
                class="py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-left px-4 rounded-md flex justify-between w-full border border-gray-200">
                Quantum Economic Advantage
                <span>{{ open ? '-' : '+' }}</span>
            </DisclosureButton>
            <DisclosurePanel class="text-gray-500">
                <!-- toggle bar -->
                <div class="flex flex-wrap items-center justify-end gap-4 py-2">
                    <!-- steps / speed toggle -->
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-600">Show steps / speed</span>
                        <button type="button" @click="showStepLines = !showStepLines" :class="[
                            'w-10 h-5 rounded-full transition-colors duration-200 flex items-center',
                            showStepLines ? 'bg-[#a32035]/80' : 'bg-gray-300'
                        ]">
                            <span :class="[
                                'w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200',
                                showStepLines ? 'translate-x-5' : 'translate-x-1'
                            ]" />
                        </button>
                    </div>
                    <!-- cost toggle -->
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-600">Show cost</span>
                        <button type="button" @click="showCostLines = !showCostLines" :class="[
                            'w-10 h-5 rounded-full transition-colors duration-200 flex items-center',
                            showCostLines ? 'bg-[#a32035]/80' : 'bg-gray-300'
                        ]">
                            <span :class="[
                                'w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200',
                                showCostLines ? 'translate-x-5' : 'translate-x-1'
                            ]" />
                        </button>
                    </div>
                </div>

                <!-- graphs -->
                <div class="lg:flex gap-4 py-2 min-h-[400px]">
                    <QuantumAdvantageGraph :data="currentAdvantageData" :show-steps="showStepLines"
                        :show-cost="showCostLines" />
                    <QuantumEconomicAdvantageGraph :data="quantumEconomicAdvantageData" :show-steps="showStepLines"
                        :show-cost="showCostLines" />
                </div>
            </DisclosurePanel>
        </Disclosure>
        <Disclosure as="div" class="px-8 py-2" v-slot="{ open }" defaultOpen>
            <DisclosureButton
                class="py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-left px-4 rounded-md flex justify-between w-full border border-gray-200">
                Quantum Timelines
                <span>{{ open ? '-' : '+' }}</span>
            </DisclosureButton>
            <DisclosurePanel class="text-gray-500">
                <QuantumCharacteristicsGraph :data="roadmapCharacteristicsData" />

            </DisclosurePanel>
        </Disclosure>


    </div>
</template>