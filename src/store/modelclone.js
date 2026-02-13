/*{ <script setup>
import { re } from 'mathjs';
import { watch, ref, defineAsyncComponent } from 'vue';
import * as utils from "../store/utils"

import * as math from 'mathjs';

const QuantumAdvantageGraph = defineAsyncComponent(() => import('./QuantumAdvantageGraph.vue'));
const QuantumEconomicAdvantageGraph = defineAsyncComponent(() => import('./QuantumEconomicAdvantageGraph.vue'));
const QuantumCharacteristicsGraph = defineAsyncComponent(() => import('./QuantumCharacteristicsGraph.vue'));
const Form = defineAsyncComponent(() => import('./Form.vue'));

const props = defineProps({
    model: Object,
    modelIndex: Number
});

// let free = false;
// let free = true;

import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/vue'

// // returns log_10 of the problem size where qa is reached
// function getQuantumAdvantage(classicalInput, quantumInput, penaltyInput, hardwareSlowdown, quantumImprovementRate = 0.5, year = 2024) {
//     let adjustmentFactor = Number(hardwareSlowdown) + Math.log10(Math.pow(quantumImprovementRate, year - 2024));
//     if (adjustmentFactor <= -5) { //if adjustmentFactor is ever 0, then there is no hardware slowdown, so any problem should be QEA
//         return 0;
//     }

//     console.log(classicalInput)
//     console.log(quantumInput)
//     console.log(penaltyInput)

//     let c = utils.applyLogRules(math.parse(classicalInput)).compile();
//     let q = utils.applyLogRules(math.parse(quantumInput)).compile();
//     let p = utils.applyLogRules(math.parse(penaltyInput)).compile();

//     function evaluate(value) {
//         let scope = {n: value};
//         return c.evaluate(scope) - adjustmentFactor - q.evaluate(scope) - p.evaluate(scope);
//     }

//     let result = utils.bisectionMethod(evaluate, 2,  10**100);
//     if (result === null) {
//         console.log("null returned!!!!");
//         return 0;
//     }
//     return Math.log10(result);

// }


// //returns log_10 of the problem size where qa is reached
function getQuantumAdvantage(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate = 0.5, year = 2024) {
    let adjustmentFactor = Number(hardwareSlowdown) + Math.log10(Math.pow(quantumImprovementRate, year - 2024));
    if (adjustmentFactor <= -5) { //if adjustmentFactor is ever 0, then there is no hardware slowdown, so any problem should be QEA
        return 0;
    }

    //assumes the penalty is log(n) or nothing
    if (problemName === "Database Search") {
        if (penalty === "log(n)") {
            let f = n => Math.log10(n) / 2 - adjustmentFactor - Math.log10(Math.log2(n))
            let result = utils.bisectionMethod(f, 4, 10 ** 100); //starts at 4 because of function behavior
            // if (year > 2100) {
            // console.log(year, adjustmentFactor, result, Math.log10(result))
            // }
            if (result === null) {
                console.log("null returned!!!!")
                return 0
            }
            return Math.log10(result)
        }
        else {
            return 2 * adjustmentFactor
        }
    }
    else if (problemName === "Machine Learning") {
        if (penalty === "log(n)") {
            let f = n => Math.log10(n) / 2 - adjustmentFactor - Math.log10(Math.log2(n))
            let result = utils.bisectionMethod(f, 2, 10 ** 100);
            if (result === null) {
                return 0
            }
            return Math.log10(result)
        }
        else {
            return 2 * adjustmentFactor
        }
    }
    else if (problemName === "Time Dependent Hartree-Fock Approximation (Quantum Chemistry)") {
        if (penalty === "log(n)") {
            let f = n => 2 * Math.log10(n) - adjustmentFactor - Math.log10(Math.log2(n))
            let result = utils.bisectionMethod(f, 2, 10 ** 100);
            if (result === null) {
                return 0
            }
            return Math.log10(result)
        }
        else {
            return 0.5 * adjustmentFactor
        }
    }
    else if (problemName === "Linear Algebra") {
        if (penalty === "log(n)") {
            let f = n => 0.627 * Math.log10(n) - adjustmentFactor - Math.log10(Math.log2(n))
            let result = utils.bisectionMethod(f, 2, 10 ** 100);
            if (result === null) {
                return 0
            }
            return Math.log10(result)
        }
        else {
            return adjustmentFactor / 0.627
        }
    }
    else if (problemName === "Traveling Salesman") {
        let f;
        if (penalty === "log(n)") {
            f = n => 2 * Math.log10(n) - adjustmentFactor - n * Math.log10(0.89) - Math.log10(Math.log2(n))
        }
        else {
            f = n => 2 * Math.log10(n) - adjustmentFactor - n * Math.log10(0.89)
        }
        let result = utils.bisectionMethod(f, 2, 2000); //hardware slowdown of 10 ** (100) would yield an nstar of around 1700, plenty of buffer
        if (result === null) {
            console.log("null returned!!!!")
            return 0
        }
        return Math.log10(result)
    }
    else if (problemName === "Integer Factorization") {
        let f;
        if (penalty === "log(n)") {
            f = n => (64 * n / 9) ** (1 / 3) * (Math.log(n) ** (2 / 3)) * Math.log10(Math.E) - adjustmentFactor - 2 * Math.log10(n) - Math.log10(Math.log(n)) - Math.log10(Math.log2(n))
        }
        else {
            f = n => (64 * n / 9) ** (1 / 3) * (Math.log(n) ** (2 / 3)) * Math.log10(Math.E) - adjustmentFactor - 2 * Math.log10(n) - Math.log10(Math.log(n))
        }
        // let result = utils.bisectionMethod(f, 0, 100000); //100000 is overkill, no realistic slowdown would yield this
        let result = utils.bisectionMethod(f, 2, 1000);
        if (result === null) {
            console.log("null returned!!!!")
            return 0
        }
        // if (result >= 99999) return Infinity
        return Math.log10(result)
    }
    else if (problemName === "Full Configuration Interaction (Quantum Chemistry)") {
        let f;
        if (penalty === "log(n)") {
            f = n => Math.log(n) * (n - 5) - n - adjustmentFactor * Math.log(10) - Math.log(Math.log2(n)) //????????log10???
        }
        else {
            f = n => Math.log(n) * (n - 5) - n - adjustmentFactor * Math.log(10)
        }
        let result = utils.bisectionMethod(f, 2, 60);
        if (result === null) {
            console.log("null returned!!!!")
            return 0
        }
        // if (result >= 99999) return Infinity
        return Math.log10(result)
    }

    console.log("this should never print")

    return 0
}



function calculateCurrentAdvantage(model) {

    let problemName = model.problemName;
    let penalty = model.penalty;
    // let quantumRuntime = model.quantumRuntime;
    let quantumRuntime = addPenalty(model.quantumRuntime, model.penalty);
    let classicalRuntime = model.classicalRuntime;
    let hardwareSlowdown = Number(model.hardwareSlowdown);
    let quantumImprovementRate = ((100 + Number(model.quantumImprovementRate)) / 100)
    let year = new Date().getFullYear();
    let costFactor = Number(model.costFactor)
    let costImprovementRate = ((100 + Number(model.costImprovementRate)) / 100);

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = model.penaltyInput;

    
    let advantage = getQuantumAdvantage(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate, year);
    let costAdvantage = getQuantumAdvantage(problemName, penalty, classicalRuntime, model.quantumRuntime, costFactor, costImprovementRate, year);
    // if (free) {
    //     advantage = getQuantumAdvantage(classicalRuntimeInput, quantumRuntimeInput, penaltyInput, hardwareSlowdown, quantumImprovementRate, year);
    //     costAdvantage = getQuantumAdvantage(classicalRuntimeInput, quantumRuntimeInput, penaltyInput, costFactor, costImprovementRate, year);
    // }

    // console.log(advantage)
    // range from 0 to double of the advantage with 200 ticks
    let range = []
    let currentAdvantageDataAux = {}

    if (advantage === Infinity) {
        for (let i = 0; i < 100; i += 100 / 100) {
            range.push(i);
        }
        currentAdvantageDataAux = {
            nStar: -1,
            stepStar: -1,
            // replace NaN with Infinity
            quantumSteps: range.map((i) => [i, quantumRuntime(i) + hardwareSlowdown]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
            classicalSteps: range.map((i) => [i, classicalRuntime(i)]).map(([x, y]) => [x, isNaN(y) ? -1 : y])
        }
    }
    else if (advantage === 0) {
        for (let i = 0; i < 100; i += 100 / 100) {
            range.push(i);
        }
        currentAdvantageDataAux = {
            nStar: 0,
            stepStar: classicalRuntime(0),
            // replace NaN with Infinity
            quantumSteps: range.map((i) => [i, quantumRuntime(i) + hardwareSlowdown]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
            classicalSteps: range.map((i) => [i, classicalRuntime(i)]).map(([x, y]) => [x, isNaN(y) ? 0 : y])
        }


    } else {

        for (let i = 0; i < ((advantage + costAdvantage) / 2) * 2; i += ((advantage + costAdvantage) / 2) / 100) {
            range.push(i);
        }
        currentAdvantageDataAux = {
            nStar: advantage,
            stepStar: classicalRuntime(advantage),
            quantumSteps: range.map((i) => [i, quantumRuntime(i) + hardwareSlowdown]),
            classicalSteps: range.map((i) => [i, classicalRuntime(i)])
        }
    }


    if (costAdvantage === Infinity) {
        for (let i = 0; i < 100; i += 100 / 100) {
            range.push(i);
        }
        currentAdvantageDataAux = {
            ...currentAdvantageDataAux,
            nCostStar: -1,
            stepCostStar: -1,
            quantumCostSteps: range.map((i) => [i, quantumRuntime(i) + costFactor]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
            classicalCostSteps: range.map((i) => [i, classicalRuntime(i)]).map(([x, y]) => [x, isNaN(y) ? -1 : y])
        }
    }
    else if (costAdvantage === 0) {
        for (let i = 0; i < 100; i += 100 / 100) {
            range.push(i);
        }
        currentAdvantageDataAux = {
            ...currentAdvantageDataAux,
            nCostStar: 0,
            stepCostStar: classicalRuntime(0),
            quantumCostSteps: range.map((i) => [i, quantumRuntime(i) + costFactor]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
            classicalCostSteps: range.map((i) => [i, classicalRuntime(i)]).map(([x, y]) => [x, isNaN(y) ? 0 : y])
        }


    } else {

        for (let i = 0; i < ((advantage + costAdvantage) / 2) * 2; i += ((advantage + costAdvantage) / 2) / 100) {
            range.push(i);
        }
        currentAdvantageDataAux = {
            ...currentAdvantageDataAux,
            nCostStar: costAdvantage,
            stepCostStar: classicalRuntime(costAdvantage),
            quantumCostSteps: range.map((i) => [i, quantumRuntime(i) + costFactor]),
            classicalCostSteps: range.map((i) => [i, classicalRuntime(i)])
        }
    }



    currentAdvantageData.value =  {...currentAdvantageDataAux,
        problemName: model.problemName,
    }
}



function calculateQuantumEconomicAdvantage(model) {

    // let quantumRuntime = model.quantumRuntime;
    let problemName = model.problemName;
    let penalty = model.penalty;
    let quantumRuntime = addPenalty(model.quantumRuntime, model.penalty);
    let classicalRuntime = model.classicalRuntime;
    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = ((100 + Number(model.ratioImprovementRate)) / 100);
    let quantumImprovementRate = ((100 + Number(model.quantumImprovementRate)) / 100);
    let qubitToProblemSize = model.qubitToProblemSize;
    let roadmapUnit = model.roadmapUnit;
    let currentYear = new Date().getFullYear();

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = model.penaltyInput;

    let costFactor = (Number(model.costFactor))
    let costImprovementRate = ((100 + Number(model.costImprovementRate)) / 100);

    console.log('asdasdasd',getLogicalQubits(2032, model.roadmap, physicalLogicalQubitsRatio, ratioImprovementRate , roadmapUnit))

    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
    }


    function qa(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate) {
        return year => getQuantumAdvantage(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate, year)
    }
    
    // if (free) {
    //     function qa(classicalRuntimeInput, quantumRuntimeInput, penaltyInput, hardwareSlowdown, quantumImprovementRate) {
    //         return year => getQuantumAdvantage(classicalRuntimeInput, quantumRuntimeInput, penaltyInput, hardwareSlowdown, quantumImprovementRate, year)
    //     }
    // }

    let quantumFeasible = qf(model.roadmap);
    
    let quantumAdvantage = qa(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate);
    let quantumCostAdvantage = qa(problemName, penalty, classicalRuntime, model.quantumRuntime, costFactor, costImprovementRate);
    // if (free) {
    //     let quantumAdvantage = qa(classicalRuntimeInput, quantumRuntimeInput, penaltyInput, hardwareSlowdown, quantumImprovementRate);
    //     let quantumCostAdvantage = qa(classicalRuntimeInput, quantumRuntimeInput, penaltyInput, costFactor, costImprovementRate);
    // }

    let quantumEconomicAdvantageDataAux = {}

    const tStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumAdvantage(year), 2024, 3000);
    const tCostStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumCostAdvantage(year), 2024, 3000);


    // when there is no quantum advantage
    if (quantumAdvantage(2024) >= 99999) {
        let range = []

        for (let i = 0; i < (2030 - currentYear) * 2; i += (2030 - currentYear) / 100) {
            range.push(i);
        }
        let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
        quantumEconomicAdvantageDataAux = {
            tStar: -1,
            nStar: -1,
            quantumFeasible: quantumFeasibleList,
            quantumAdvantage: range.map(i => [currentYear + i, Infinity])
        }
  


    } else {


        let range = []

        if (tStar != null) {
            for (let i = 0; i < ((tStar + tCostStar) / 2 - currentYear) * 2; i += ((tStar + tCostStar) / 2 - currentYear) / 100) {
                range.push(i);
            }
            let nStar = quantumFeasible(tStar)

            let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
            let quantumAdvantageList = range.map(i => [currentYear + i, quantumAdvantage(currentYear + i)])

            quantumEconomicAdvantageDataAux = {
                tStar: tStar,
                nStar: nStar,
                quantumFeasible: quantumFeasibleList,
                quantumAdvantage: quantumAdvantageList
            }
            
        } else {
            console.log("tstar is null")
            for (let i = 0; i < (2030 - currentYear) * 2; i += (2030 - currentYear) / 100) {
                range.push(i);
            }
            let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
            let quantumAdvantageList = range.map(i => [currentYear + i, quantumAdvantage(currentYear + i)])
            quantumEconomicAdvantageDataAux = {
                tStar: 0,
                nStar: 0,
                quantumFeasible: quantumFeasibleList,
                quantumAdvantage: quantumAdvantageList
            }
           
        }
    }

    if (quantumCostAdvantage(2024) >= 99999) {
        let range = []

        for (let i = 0; i < (2030 - currentYear) * 2; i += (2030 - currentYear) / 100) {
            range.push(i);
        }
        let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
        quantumEconomicAdvantageDataAux = {
            ...quantumEconomicAdvantageDataAux,
            tCostStar: -1,
            nCostStar: -1,
            quantumCostFeasible: quantumFeasibleList,

            quantumCostAdvantage: range.map(i => [currentYear + i, Infinity])
        }


    } else {


        let range = []

        if (tCostStar != null) {
            for (let i = 0; i < ((tStar + tCostStar) / 2 - currentYear) * 2; i += ((tStar + tCostStar) / 2 - currentYear) / 100) {
                range.push(i);
            }
            let nCostStar = quantumFeasible(tCostStar)

            let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
            let quantumCostAdvantageList = range.map(i => [currentYear + i, quantumCostAdvantage(currentYear + i)])

            quantumEconomicAdvantageDataAux = {
                ...quantumEconomicAdvantageDataAux,
                tCostStar: tCostStar,
                nCostStar: nCostStar,
                quantumCostFeasible: quantumFeasibleList,

                quantumCostAdvantage: quantumCostAdvantageList
            }
        } else {
            console.log("tCoststar is null")
            for (let i = 0; i < (2030 - currentYear) * 2; i += (2030 - currentYear) / 100) {
                range.push(i);
            }
            let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
            let quantumCostAdvantageList = range.map(i => [currentYear + i, quantumCostAdvantage(currentYear + i)])
            quantumEconomicAdvantageDataAux = {
                ...quantumEconomicAdvantageDataAux,
                tCostStar: 0,
                nCostStar: 0,
                quantumCostFeasible: quantumFeasibleList,

                quantumCostAdvantage: quantumCostAdvantageList
            }
        }
    }


    quantumEconomicAdvantageData.value = {...quantumEconomicAdvantageDataAux,
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
function getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate , roadmapUnit) {
    const logOfPhysicalQubits = utils.getPhysicalQubits(year, roadmap, props.model.extrapolationType)
    if (roadmapUnit === "logical") {
        return logOfPhysicalQubits
    }
    //log_10 of the PLQR including the ratio improvement rate
    let adjustedPLQR = Math.log10(physicalLogicalQubitsRatio) + (year - 2024) * Math.log10(ratioImprovementRate);
    if (adjustedPLQR < Math.log10(3)) { //minimum PLQR is 3
        adjustedPLQR = Math.log10(3)
    }

    //logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = logOfPhysicalQubits - adjustedPLQR

    return logLogicalQubits
}


//function returns the log of the problem size solvable, even though there is a "10 ** problemSize"
function getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit) {
    //logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate , roadmapUnit)

    if (qubitToProblemSize == "2^{q}") {
        // let problemSize = (logOfPhysicalQubits + Math.log10(Math.log10(2)) - Math.log10(physicalLogicalQubitsRatio))
        let problemSize = (logLogicalQubits + Math.log10(Math.log10(2)))
        return 10 ** problemSize;
    }
    else if (qubitToProblemSize == "2^(2^{q})") {
        // let problemSize = Math.pow(2, Math.pow(10, logOfPhysicalQubits) / physicalLogicalQubitsRatio) * Math.log10(2)
        let problemSize = Math.pow(2, Math.pow(10, logLogicalQubits)) * Math.log10(2)
        return problemSize;
    }
    else if (qubitToProblemSize == "{q}") {
        // let problemSize = logOfPhysicalQubits -  Math.log10(physicalLogicalQubitsRatio)
        let problemSize = logLogicalQubits
        return problemSize;
    }
    else if (qubitToProblemSize == "log({q})") {
        // let problemSize = Math.log10(logOfPhysicalQubits - Math.log10(physicalLogicalQubitsRatio)) - Math.log10(Math.log10(2))
        let problemSize = Math.log10(logLogicalQubits) - Math.log10(Math.log10(2))

        //true if logLogicalQubits is negative
        //(Amount of physical qubits is less than the ratio to achieve a single logical qubit))
        if (isNaN(problemSize)) {
            return 0;
        }

        return problemSize;
    }
}

function addPenalty(quantumRuntime, penalty) {//function is used to generate points but not in getQuantumAdvantage
    // console.log(penalty)

    if (penalty == "log(n)") {
        // console.log('log penalty applied')
        return (n) => quantumRuntime(n) + Math.log10(n) + Math.log10(Math.log2(10)) // Math.log10(Math.log2(10)) = - Math.log10(Math.log10(2))
    }
    else if (penalty == "n") {
        return (n) => quantumRuntime(n) + n;
    }
    else {
        return quantumRuntime;
    }
}

const currentAdvantageData = ref({});
const quantumEconomicAdvantageData = ref({});
const roadmapCharacteristicsData = ref({});



// watch problems and hardwareslowdown
watch(() => props.model, (model) => {

    calculateCurrentAdvantage(props.model);
    calculateQuantumEconomicAdvantage(props.model);
}, { immediate: true, deep: true });

</script>

<template>
    <div class="max-w-7xl mx-auto my-4 border border-gray-100 rounded-lg shadow-lg ">

        <div>
            <Form :modelId="model.id" />
        </div>
        <Disclosure as="div" class="px-8 py-2" v-slot="{ open }" defaultOpen>
            <DisclosureButton class="py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-left px-4 rounded-md flex justify-between w-full border border-gray-200">
                Quantum Economic Advantage
                <span>{{  open ? '-' : '+' }}</span>
            </DisclosureButton>
            <DisclosurePanel class="text-gray-500">
                <div class="lg:flex gap-4 py-2 min-h-[400px]">

                    <QuantumAdvantageGraph :data="currentAdvantageData" />
                    <QuantumEconomicAdvantageGraph :data="quantumEconomicAdvantageData" />
                </div>
            </DisclosurePanel>
        </Disclosure>
        <Disclosure as="div" class="px-8 py-2" v-slot="{ open }" defaultOpen>
            <DisclosureButton class="py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-left px-4 rounded-md flex justify-between w-full border border-gray-200">
                Quantum Timelines
                <span>{{  open ? '-' : '+' }}</span>
            </DisclosureButton>
            <DisclosurePanel class="text-gray-500">
                <QuantumCharacteristicsGraph :data="roadmapCharacteristicsData" />

                        </DisclosurePanel>
        </Disclosure>
       

    </div>
</template> } */

