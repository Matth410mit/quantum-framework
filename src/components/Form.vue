<script setup>
import Multiselect from 'vue-multiselect'
import HardwareSlowdownAdvanced from './HardwareSlowdownAdvanced.vue';
import { useModelsStore } from '../store/models';
import { Switch } from '@headlessui/vue'
import MappingPreview from './MappingPreview.vue'

import { onMounted, ref, watch, computed } from 'vue';
import EditRoadmap from './EditRoadmap.vue';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import ReferenceDialog from './ReferenceDialog.vue';
import HardwareReferences from './HardwareReferences.vue';
import ProblemReferences from './ProblemReferences.vue';
import ProblemRuntimeAdvanced from './ProblemRuntimeAdvanced.vue';
import * as math from 'mathjs';
import * as utils from '../store/utils';
import { algorithmVariants, getBestAlgorithm, getAvailableAlgorithms } from '../store/algorithmVariants';


const models = useModelsStore();

const props = defineProps({
    modelId: Number
});

/**
 * Order of importance when auto-picking a default algorithm for a problem.
 * Edit this array to change priorities.
 * Earlier entries are more important.
 */
const ALGO_PRIORITY_ORDER = ['speed', 'span', 'work', 'space']

/**
 * Optional per-problem algorithm variants.
 * Each problem gets at least two variants:
 *  "Minimise runtime (default)" or "Minimise total work"
 */

const selectedClassicalAlgorithm = ref(null);

const selectedQuantumAlgorithm = ref(null);

/** Test whether a formula string can actually be parsed by mathjs */
function isFormulaValid(formula) {
    if (!formula || typeof formula !== 'string') return false;
    try {
        const compiled = math.compile(formula);
        // Try evaluating with a dummy scope to catch undefined-variable errors
        compiled.evaluate({ n: 2, p: 1, q: 1 });
        return true;
    } catch {
        return false;
    }
}

/** Check if an algorithm has valid, parseable runtime and work formulas */
function hasValidFormulas(algo) {
    if (!algo || !algo.available) return false;
    return isFormulaValid(algo.runtimeFormula) && isFormulaValid(algo.workFormula);
}

/** available classical algorithms for current problem (only those with valid formulas) */
const availableClassicalAlgorithms = computed(() => {
    if (!selectedProblem.value) return [];
    const problemVariants = algorithmVariants[selectedProblem.value.problemName];
    if (!problemVariants) return [];
    return problemVariants.classical.filter(a => hasValidFormulas(a));
});

/** available quantum algorithms for current problem (only those with valid formulas) */
const availableQuantumAlgorithms = computed(() => {
    if (!selectedProblem.value) return [];
    const problemVariants = algorithmVariants[selectedProblem.value.problemName];
    if (!problemVariants) return [];
    return problemVariants.quantum.filter(a => hasValidFormulas(a));
});

// Helper function to apply algs, with fallback to hardcoded problem defaults
function applyAlgorithmsToModel(classicalAlgo, quantumAlgo, problemDefaults) {
    if (!model.value) return;

    // Apply classical algorithm if it has valid formulas
    if (hasValidFormulas(classicalAlgo)) {
        model.value.classicalRuntimeInput = classicalAlgo.runtimeFormula;
        model.value.classicalWork = classicalAlgo.workFormula;
    } else if (problemDefaults) {
        model.value.classicalRuntimeInput = problemDefaults.classicalRuntimeInput;
        model.value.classicalWork = problemDefaults.classicalWork;
    }

    // Apply quantum algorithm if it has valid formulas
    if (hasValidFormulas(quantumAlgo)) {
        model.value.quantumRuntimeInput = quantumAlgo.runtimeFormula;
        model.value.quantumWork = quantumAlgo.workFormula;
    } else if (problemDefaults) {
        model.value.quantumRuntimeInput = problemDefaults.quantumRuntimeInput;
        model.value.quantumWork = problemDefaults.quantumWork;
    }
}

/** Format a raw qubit count as scientific notation HTML */
function formatQubitCount(value) {
    if (value <= 0) return '0';
    return utils.toBase10HTML(Math.log10(value));
}

/** Safely render a math expression as KaTeX HTML; returns fallback text on error */
function safeRenderKaTeX(input) {
    try {
        const expression = math.parse(input).toTex();
        return katex.renderToString(expression, { throwOnError: false });
    } catch {
        return `<code>${input || ''}</code>`;
    }
}

const qubitSizeOptions = ref([
    "2^{q}",
    "{q}",
    "log({q})",
]);

const problems = ref([

    {
        problemName: "Integer Factorization",
        classicalRuntimeInput: "e^((64/9 * n)^(1/3) * log(n, e)^(2/3)) / p",
        classicalWork: "e^((64/9 * n)^(1/3) * log(n, e)^(2/3))",
        quantumRuntimeInput: "n^(2) * log(n, e)",
        quantumWork: "n^(2) * log(n, e) * q",
        qubitToProblemSize: "{q}",
    },
    {
        problemName: "Database Search",
        classicalRuntimeInput: "n / p",
        classicalWork: "n",
        quantumRuntimeInput: "sqrt(n)",
        quantumWork: "sqrt(n) * q",
        qubitToProblemSize: "2^{q}",
    },
    {
        problemName: "Traveling Salesman",
        classicalRuntimeInput: "n^3 * 2^n / p",
        classicalWork: "n^3 * 2^n",
        quantumRuntimeInput: "n * 1.78^n",
        quantumWork: "n * 1.78^n * q",
        qubitToProblemSize: "{q}",
    },
    {
        problemName: "Time Dependent Hartree-Fock Approximation (Quantum Chemistry)",
        classicalRuntimeInput: "n^3",
        classicalWork: "n^3",
        quantumRuntimeInput: "n",
        quantumWork: "n * q",
        qubitToProblemSize: "{q}",
    },
    {
        problemName: "Full Configuration Interaction (Quantum Chemistry)",
        classicalRuntimeInput: "(2 * pi * n)^(1/2) * (n / e)^n",
        classicalWork: "(2 * pi * n)^(1/2) * (n / e)^n",
        quantumRuntimeInput: "n^5",
        quantumWork: "n^5 * q",
        qubitToProblemSize: "{q}",
    },
]);


const hardwares = ref([
    {
        hardwareName: "IBM (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 3.78,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 264,
        ratioImprovementRate: -23,
        roadmap: {
            2020: 27,
            // 2022: 127,
            2024: 133,
            2025: 156,
            // 2029: 200,
            // 2033: 2000,
            2028: 1092,
            // 2029: 22974,
            // 2033: 100000
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: {
            gateTime: 12,
            cpuGHz: 5,
            speed: 60,
            gateOverhead: 100,
            algorithmConstant: 1,
        },
        reference: "https://www.ibm.com/roadmaps/quantum.pdf"
    },
    {
        hardwareName: "Google (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 3.78,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: -10,
        roadmap: {
            2019: 53,
            // 2023: 100,
            2024: 105,
            // 2025: 1000,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: {
            gateTime: 12,
            cpuGHz: 5,
            speed: 60,
            gateOverhead: 100,
            algorithmConstant: 1,
        },
        reference: "Sycamore (2019), and Willow (2024).",
    },
    {
        hardwareName: "Rigetti (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 3.78,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: -10,
        roadmap: {
            2018: 19,
            2021: 40,
            2024: 84,
            // 2023: 336,
            // 2025: 1000,
            // 2027: 4000,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: {
            gateTime: 12,
            cpuGHz: 5,
            speed: 60,
            gateOverhead: 100,
            algorithmConstant: 1,
        },
        reference: "19Q (2018), Aspen-M non-modular (2021), Ankaa-3 (2024)",
    },

    {
        hardwareName: "IonQ (Trapped Ion)",
        penaltyInput: "1",
        processors: 5,
        hardwareSlowdown: 8.48,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 32,
        // ratioImprovementRate: -10,
        ratioImprovementRate: -23,
        roadmap: {
            2021: 22,
            // 2022: 25,
            // 2023: 29,
            2024: 35,
            // 2025: 1024,
            // 2026: 4096,
            // 2027: 12288,
            // 2028: 32768,
            2028: 1024,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: {
            gateTime: 600000,
            cpuGHz: 5,
            speed: 3000000,
            gateOverhead: 100,
            algorithmConstant: 1,
        },
        reference: "https://ionq.com/blog/how-we-achieved-our-2024-performance-target-of-aq-35",
    },
    {
        hardwareName: "QuEra (Neutral Atom)",
        penaltyInput: "1",
        processors: 5,
        hardwareSlowdown: 5.1,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 100,
        ratioImprovementRate: -23,
        roadmap: {
            2023: 256,
            2025: 3000,
            2026: 10000,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: {
            gateTime: 250,
            cpuGHz: 5,
            speed: 1250,
            gateOverhead: 100,
            algorithmConstant: 1,
        },
        reference: "https://www.quera.com/qec",
    },
    {
        hardwareName: "Pasqal (Neutral Atom)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 5.1,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 100,
        ratioImprovementRate: -10,
        roadmap: {
            2022: 200,
            2024: 1000,
            2026: 10000,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: {
            gateTime: 250,
            cpuGHz: 5,
            speed: 1250,
            gateOverhead: 100,
            algorithmConstant: 1,
        },
        reference: "https://www.hpcwire.com/2024/03/13/pasqal-issues-roadmap-to-10000-qubits-in-2026-and-fault-tolerance-in-2028/",
    },
    {
        hardwareName: "Infleqtion (Neutral Atom)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 5.1,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 800,
        ratioImprovementRate: -10,
        roadmap: {
            2024: 2,
            2026: 10,
            2028: 100,
        },
        roadmapUnit: "logical",
        extrapolationType: "exponential",
        advancedSlowdown: {
            gateTime: 250,
            cpuGHz: 5,
            speed: 1250,
            gateOverhead: 100,
            algorithmConstant: 1,
        },
        reference: "https://www.nextbigfuture.com/2024/02/infleqtion-1600-qubit-array-today-and-five-year-roadmap-to-fault-tolerant-quantum-computers.html",
    },
    {
        hardwareName: "Quantum Silicon (Semiconductors)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 5.1,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 100,
        ratioImprovementRate: -10,
        roadmap: {
            2018: 1,
            2021: 6,
            2024: 100,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: {
            gateTime: 250,
            cpuGHz: 5,
            speed: 1250,
            gateOverhead: 100,
            algorithmConstant: 1,
        },
        reference: "https://www.eetimes.eu/cea-leti-details-silicon-based-quantum-computing-roadmap/",
    },
]);



const model = ref(models.models.find(m => m.id === props.modelId));

function updateSlowdown(hwSlowdown, advancedSlowdown) {
    model.value.hardwareSlowdown = hwSlowdown;
    model.value.advancedSlowdown = advancedSlowdown;
}

const selectedProblem = ref(problems.value.find(p => p.problemName === model.value.problemName));
const selectedHardware = ref(hardwares.value.find(h => h.hardwareName === model.value.hardwareName));

/** currently selected algorithm (variant) for the chosen problem */
const selectedAlgorithm = ref(null);

/** algorithms available for the currently selected problem */
const availableAlgorithms = computed(() => {
    if (!selectedProblem.value) return [];
    return problemAlgorithms.value[selectedProblem.value.problemName] || [];
});

onMounted(() => {
    model.value = Object.assign({}, models.models.find(m => m.id === props.modelId))
});

/** pick the “best” algorithm by the ALGO_PRIORITY_ORDER over metrics */
function pickBestAlgorithm(algorithms) {
    if (!algorithms || !algorithms.length) return null;
    return [...algorithms].sort((a, b) => {
        const ma = a.metrics || {};
        const mb = b.metrics || {};
        for (const key of ALGO_PRIORITY_ORDER) {
            const av = ma[key] ?? Infinity;
            const bv = mb[key] ?? Infinity;
            if (av < bv) return -1;
            if (av > bv) return 1;
        }
        return 0;
    })[0];
}

/** apply an algorithm’s expressions onto the current model */
function applyAlgorithmToModel(algorithm) {
    if (!algorithm || !model.value) return;
    model.value.classicalRuntimeInput = algorithm.classicalRuntimeInput;
    model.value.classicalWork = algorithm.classicalWork;
    model.value.quantumRuntimeInput = algorithm.quantumRuntimeInput;
    model.value.quantumWork = algorithm.quantumWork;
}

watch(() => selectedHardware.value, (hardware) => {
    model.value.hardwareName = hardware.hardwareName;
    model.value.penaltyInput = hardware.penaltyInput;
    model.value.processors = hardware.processors;
    model.value.hardwareSlowdown = hardware.hardwareSlowdown;
    model.value.physicalLogicalQubitsRatio = hardware.physicalLogicalQubitsRatio;
    model.value.quantumImprovementRate = hardware.quantumImprovementRate;
    model.value.roadmap = hardware.roadmap;
    model.value.roadmapUnit = hardware.roadmapUnit;
    model.value.extrapolationType = hardware.extrapolationType;
    model.value.ratioImprovementRate = hardware.ratioImprovementRate;
    model.value.costFactor = hardware.costFactor;
    model.value.costImprovementRate = hardware.costImprovementRate;
    model.value.advancedSlowdown = hardware.advancedSlowdown;
}, { deep: true });

watch(() => selectedProblem.value, (problem) => {
    if (!problem) return;

    const problemVariants = algorithmVariants[problem.problemName];

    // Determine best valid algorithms (or null if none exist)
    let bestClassical = null, bestQuantum = null;
    if (problemVariants) {
        const validClassical = problemVariants.classical.filter(a => hasValidFormulas(a));
        const validQuantum = problemVariants.quantum.filter(a => hasValidFormulas(a));
        bestClassical = validClassical.length > 0 ? getBestAlgorithm(validClassical) : null;
        bestQuantum = validQuantum.length > 0 ? getBestAlgorithm(validQuantum) : null;
    }

    // Resolve formulas: use algorithm variant if valid, otherwise hardcoded default
    const newClassicalRuntime = bestClassical ? bestClassical.runtimeFormula : problem.classicalRuntimeInput;
    const newClassicalWork = bestClassical ? bestClassical.workFormula : problem.classicalWork;
    const newQuantumRuntime = bestQuantum ? bestQuantum.runtimeFormula : problem.quantumRuntimeInput;
    const newQuantumWork = bestQuantum ? bestQuantum.workFormula : problem.quantumWork;

    // Update algorithm selection refs (won't trigger redundant model writes
    // since we removed the separate algorithm watchers)
    selectedClassicalAlgorithm.value = bestClassical;
    selectedQuantumAlgorithm.value = bestQuantum;

    // Batch-apply all model values at once to avoid intermediate states
    model.value.problemName = problem.problemName;
    model.value.qubitToProblemSize = problem.qubitToProblemSize;
    model.value.classicalRuntimeInput = newClassicalRuntime;
    model.value.classicalWork = newClassicalWork;
    model.value.quantumRuntimeInput = newQuantumRuntime;
    model.value.quantumWork = newQuantumWork;
}, { deep: true });

/** when user manually changes algorithm from the dropdown */
watch(() => selectedAlgorithm.value, (algorithm) => {
    if (!algorithm) return;
    applyAlgorithmToModel(algorithm);
}, { deep: true });

watch(() => model.value, (value) => {
    models.updateModel(props.modelId, value);
}, { deep: true });

const lockPLQR = computed(() => model.value.roadmapUnit !== "physical");



// const editMode = ref(true);
const editMode = ref(false);//misnamed??

function updateRoadmap(value) {
    model.value.roadmap = value.roadmap;
    model.value.extrapolationType = value.extrapolationType;
    model.value.roadmapUnit = value.roadmapUnit;
}

function removeModel() {
    models.removeModel(props.modelId);
}

function duplicateModel() {
    models.duplicateModel(props.modelId);
}

function getRelevantRoadmapPoints(data) {
    const keys = Object.keys(data);
    const result = {};

    if (keys.length <= 3) {
        return data;
    }

    result[keys[0]] = data[keys[0]];
    result[keys[keys.length - 1]] = data[keys[keys.length - 1]];

    const middleIndex = Math.floor((keys.length - 1) / 2);
    result[keys[middleIndex]] = data[keys[middleIndex]];

    return result;
}


function checkLimits() {
    if (model.value.quantumImprovementRate > 90) {
        model.value.quantumImprovementRate = 90;
    }
    else if (model.value.quantumImprovementRate < -90) {
        model.value.quantumImprovementRate = -90;
    }
    if (model.value.costImprovementRate > 90) {
        model.value.costImprovementRate = 90;
    }
    else if (model.value.costImprovementRate < -90) {
        model.value.costImprovementRate = -90;
    }
    if (model.value.ratioImprovementRate > 90) {
        model.value.ratioImprovementRate = 90;
    }
    else if (model.value.ratioImprovementRate < -90) {
        model.value.ratioImprovementRate = -90;
    }

    if (model.physicalLogicalQubitsRatio < 3) {
        model.physicalLogicalQubitsRatio = 3;
    }
}


function updateFunctions(updatedValues) {
    model.value.classicalRuntimeInput = updatedValues.classicalRuntimeInput;
    model.value.quantumRuntimeInput = updatedValues.quantumRuntimeInput;
    model.value.penaltyInput = updatedValues.penaltyInput;
    model.value.classicalWork = updatedValues.classicalWork;
    model.value.quantumWork = updatedValues.quantumWork;
    model.value.processors = Number(updatedValues.processors);
    model.value.maxComputeTimeLog = updatedValues.maxComputeTimeLog;
}

function onAlgorithmChange(type, algorithm) {
    if (!hasValidFormulas(algorithm)) return;
    if (type === 'classical') {
        selectedClassicalAlgorithm.value = algorithm;
        model.value.classicalRuntimeInput = algorithm.runtimeFormula;
        model.value.classicalWork = algorithm.workFormula;
    } else if (type === 'quantum') {
        selectedQuantumAlgorithm.value = algorithm;
        model.value.quantumRuntimeInput = algorithm.runtimeFormula;
        model.value.quantumWork = algorithm.workFormula;
    }
}

// attempt at only using one editroadmap instance
const editRoadmapRef = ref(null);
// const openEditRoadmap = () => {
//   if (editRoadmapRef.value) {
//     editRoadmapRef.value.openModal();
//   }
// };



</script>

<template>
    <div class="" v-if="model">
        <div class="flex justify-between items-center border-b w-full px-8 py-2 bg-slate-100">
            <h2 class="text-xl text-center font-medium">{{ model.id }}. {{ model.problemName }} on {{
                model.hardwareName }}</h2>

            <div class="flex flex-wrap  items-center gap-4">
                <!-- toogle quantum only -->
                <label class="flex items-center gap-1 cursor-pointer">
                    <Switch v-model="editMode" :class="!editMode ? 'bg-[#002D9D]' : 'bg-gray-400'"
                        class="relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                        <span class="sr-only">Advanced Options</span>
                        <span aria-hidden="true" :class="!editMode ? 'translate-x-4' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out" />

                    </Switch>
                    <span class="text-sm" :class="!editMode ? 'text-[#002D9D]' : 'text-gray-400'">
                        Advanced Options
                    </span>

                </label>
                <button
                    class="flex items-center justify-center rounded-md bg-blue-100 ring-1 ring-opacity-50 ring-[#002D9D] px-2 py-2 text-sm text-[#002D9D] hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="duplicateModel">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                    </svg>
                </button>
                <button
                    class="flex items-center justify-center rounded-md bg-red-50  ring-1 ring-opacity-50 ring-red-900 px-2 py-2 text-sm text-red-900 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="removeModel"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>
        </div>


        <!-- transition height -->
        <div class="px-8  py-2  justify-between items-center gap-8 transition-all duration-500 ease-in-out"
            :class="{ 'max-h-96 opacity-100 flex flex-wrap md:flex-nowrap': editMode, 'max-h-0 opacity-0   hidden ': !editMode }">
            <div class="w-full">
                <div class="flex items-center gap-2">
                    <label class="font-medium">Problem </label>
                    <ReferenceDialog title="References" classes="max-w-3xl">
                        <template #content>
                            <ProblemReferences />
                        </template>
                    </ReferenceDialog>
                </div>
                <multiselect class="custom-multiselect mt-1" track-by="problemName" label="problemName"
                    v-model="selectedProblem" :options="problems" :searchable="true" :close-on-select="true"
                    :allowEmpty="false" :show-labels="false" placeholder="Pick a value" />
            </div>

            <div class="w-full">
                <div class="flex items-center gap-2">
                    <label class="font-medium">Roadmap </label>
                    <ReferenceDialog title="References" classes="max-w-lg">
                        <template #content>
                            <HardwareReferences />
                        </template>
                    </ReferenceDialog>
                </div>

                <multiselect class="custom-multiselect" track-by="hardwareName" label="hardwareName"
                    v-model="selectedHardware" :options="hardwares" :searchable="true" :close-on-select="true"
                    :allowEmpty="false" :show-labels="false" placeholder="Pick a hardware provider">
                </multiselect>

            </div>

        </div>


        <div class="px-8 py-2 md:flex justify-between gap-8 transition-all duration-500 ease-in-out" v-show="!editMode"
            :class="{
                'max-h-screen pb-8 opacity-100': !editMode,
                'max-h-0 opacity-0 hidden': editMode
            }">
            <!-- LEFT HALF: problem, roadmap, penalty, qubits → size -->
            <div class="lg:grid grid-cols-2 gap-4 lg:w-2/4">
                <!-- Problem column -->
                <div>
                    <div class="flex justify-between mb-1">
                        <div class="flex items-center gap-2">
                            <label class="font-medium">Problem </label>
                            <ReferenceDialog title="References" classes="max-w-3xl">
                                <template #content>
                                    <ProblemReferences />
                                </template>
                            </ReferenceDialog>
                        </div>

                        <!-- Advanced runtime / algorithm modal (only place you can change variant) -->
                        <ProblemRuntimeAdvanced :classicalRuntimeInput="model.classicalRuntimeInput"
                            :quantumRuntimeInput="model.quantumRuntimeInput" :penaltyInput="model.penaltyInput"
                            :classicalWork="model.classicalWork" :quantumWork="model.quantumWork"
                            :processors="model.processors"
                            :maxComputeTimeLog="model.maxComputeTimeLog"
                            :availableClassicalAlgorithms="availableClassicalAlgorithms"
                            :availableQuantumAlgorithms="availableQuantumAlgorithms"
                            :selectedClassicalAlgorithm="selectedClassicalAlgorithm"
                            :selectedQuantumAlgorithm="selectedQuantumAlgorithm" @updateFunctions="updateFunctions"
                            @updateAlgorithmChange="onAlgorithmChange" v-slot="{ openModal }">
                            <button class="rounded-md bg-gray-500 text-xs p-0.5 px-2 text-white hover:bg-gray-600"
                                @click="openModal">
                                Advanced options
                            </button>
                        </ProblemRuntimeAdvanced>
                    </div>

                    <!-- Problem selector (same UI as before; no algorithm dropdown here) -->
                    <multiselect class="custom-multiselect mt-1" track-by="problemName" label="problemName"
                        v-model="selectedProblem" :options="problems" :searchable="true" :close-on-select="true"
                        :show-labels="false" placeholder="Pick a value"></multiselect>

                    <!-- Classical runtime preview -->
                    <div class="mt-2">
                        <p class="text-sm font-medium">Classical Runtime</p>
                        <div class="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg">
                            <span v-html="safeRenderKaTeX(model.classicalRuntimeInput)"></span>
                        </div>
                    </div>

                    <!-- Quantum runtime preview -->
                    <div class="mt-2">
                        <p class="text-sm font-medium">Quantum Runtime</p>
                        <div class="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg">
                            <span v-html="safeRenderKaTeX(model.quantumRuntimeInput)"></span>
                        </div>
                    </div>
                </div>

                <!-- Roadmap column (same as before) -->
                <div class="">
                    <div class="flex justify-between mb-1">
                        <div class="flex items-center gap-2">
                            <label class="font-medium">Roadmap </label>
                            <ReferenceDialog title="References" classes="max-w-lg">
                                <template #content>
                                    <HardwareReferences />
                                </template>
                            </ReferenceDialog>
                        </div>

                        <EditRoadmap :name="model.hardwareName" :roadmap="model.roadmap"
                            :extrapolationType="model.extrapolationType" @updateRoadmap="updateRoadmap"
                            :roadmapUnit="model.roadmapUnit"
                            :physicalLogicalQubitsRatio="model.physicalLogicalQubitsRatio" v-slot="{ openModal }">
                            <button
                                class="rounded-md bg-gray-500 text-xs   p-0.5 px-2  text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                                @click="openModal">
                                Edit roadmap
                            </button>
                        </EditRoadmap>
                    </div>

                    <multiselect class="custom-multiselect" track-by="hardwareName" label="hardwareName"
                        v-model="selectedHardware" :options="hardwares" :searchable="true" :close-on-select="true"
                        :allowEmpty="false" :show-labels="false" placeholder="Pick a hardware provider">
                    </multiselect>

                    <table class="w-full table-auto mt-4 text-xs">
                        <thead class="bg-gray-100">
                            <tr class="text-left">
                                <th>Year</th>
                                <th># of {{ model.roadmapUnit }} Qubits</th>
                            </tr>
                        </thead>
                        <tbody class="text-left">
                            <tr v-for="(value, key) in getRelevantRoadmapPoints(model.roadmap)" :key="key"
                                class="border-b">
                                <td class="p-1">
                                    {{ key }}
                                </td>
                                <td><span v-html="formatQubitCount(value)"></span></td>
                            </tr>
                            <tr>
                                <td colspan="2" class="p-1 text-center">
                                    <EditRoadmap :name="model.hardwareName" :roadmap="model.roadmap"
                                        :extrapolationType="model.extrapolationType" @updateRoadmap="updateRoadmap"
                                        :roadmapUnit="model.roadmapUnit"
                                        :physicalLogicalQubitsRatio="model.physicalLogicalQubitsRatio"
                                        v-slot="{ openModal }">
                                        <button
                                            class="hover:underline text-xs text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            @click="openModal">
                                            See more
                                        </button>
                                    </EditRoadmap>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <EditRoadmap ref="editRoadmapRef" :name="model.hardwareName" :roadmap="model.roadmap"
                        :extrapolationType="model.extrapolationType" @updateRoadmap="updateRoadmap"
                        :roadmapUnit="model.roadmapUnit" :physicalLogicalQubitsRatio="model.physicalLogicalQubitsRatio">
                    </EditRoadmap>
                </div>

                <!-- Connectivity penalty card -->
                <div class="flex flex-col">
                    <label class="font-medium text-sm">Connectivity Penalty</label>
                    <p class="text-xs text-gray-600">
                        The overhead to embed the quantum circuit in hardware with limited
                        connectivity.
                    </p>
                    <div class="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <span v-html="safeRenderKaTeX(model.penaltyInput)"></span>
                    </div>
                </div>

                <!-- Qubits → Problem Size card -->
                <div class="flex flex-col">
                    <label class="font-medium text-sm" for="qubits_to_size">Qubits to Problem Size</label>
                    <p class="text-xs text-gray-600">
                        The function which correlates maximum problem size solvable with
                        the given number of qubits (q).
                        Use <code>q</code> in your expression. Examples:
                        <code>q</code>, <code>sqrt(q)</code>, <code>q^2</code>,
                        <code>log(q, 2)</code>, <code>2^q</code>.
                    </p>

                    <input class="mt-1 bg-gray-100 p-2 rounded-lg text-sm" v-model="model.qubitToProblemSize"
                        type="text" placeholder="q" />

                    <!-- live preview -->
                    <MappingPreview :expr="model.qubitToProblemSize" :roadmap="model.roadmap" />
                </div>
            </div>

            <!-- RIGHT HALF: hardware slowdown & costs (unchanged content, just moved here) -->
            <div class="flex-1">
                <div>
                    <div class="flex gap-2 items-center justify-between">
                        <div class="flex items-center gap-2">
                            <label class="font-medium text-s" for="hardwareSlowdown">Classical Hardware Speed
                                Advantage</label>
                            <ReferenceDialog title="References" classes="max-w-lg">
                                <template #content>
                                    <h3 class="text-medium text-sm mt-4">
                                        Classical Hardware Speed Advantage
                                    </h3>
                                    <ul class="text-sm">
                                        <li class="ml-4 list-disc">
                                            <a class="text-[#012D9D] hover:underline"
                                                href="https://arxiv.org/pdf/2310.15505.pdf" target="_blank"
                                                rel="noopener noreferrer">
                                                The Quantum Tortoise and the Classical Hare:
                                                A simple framework for understanding which
                                                problems quantum computing will accelerate (and
                                                which it won’t)
                                            </a>
                                        </li>
                                    </ul>
                                </template>
                            </ReferenceDialog>
                        </div>
                        <HardwareSlowdownAdvanced :advancedSlowdown="model.advancedSlowdown"
                            @updateSlowdown="updateSlowdown" v-slot="{ openModal }">
                            <button
                                class="rounded-md bg-gray-500 text-xs   p-0.5 px-2  text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                                @click="openModal">
                                Advanced options
                            </button>
                        </HardwareSlowdownAdvanced>
                    </div>
                    <p class="text-xs text-gray-600">
                        The number of operations a classical computer could perform in the
                        time it takes a quantum computer to perform one.
                    </p>
                    <div class="flex items-center justify-between w-full gap-2 mt-2 mb-4">
                        <input class="flex-1 accent-[#002D9D]" type="range" id="hardwareSlowdown" min="0" max="16"
                            step="0.5" v-model="model.hardwareSlowdown" />
                        <div
                            class="bg-gray-100 p-2 rounded-lg text-center w-1/5 flex items-center justify-center relative">
                            <span class="pr-2">10 </span>
                            <input class="w-[6ch] bg-transparent  absolute t-0 l-0 ml-14 mb-4 text-xs" type="number"
                                min="0" max="16" step="0.5" id="hardwareSlowdown" v-model="model.hardwareSlowdown" />
                        </div>
                        <div
                            class="bg-gray-100 p-2 rounded-lg text-center w-1/3 flex  items-center justify-center relative">
                            <input class="w-[6ch] bg-transparent  text-center" type="number" min="-90" max="90" step="1"
                                id="quantum_improvement_rate" v-model="model.quantumImprovementRate"
                                @input="checkLimits" />
                            <span class="text-xs text-gray-600 text-left">
                                % change per year
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col">
                    <label class="font-medium text-s" for="costFactor">Classical Compute Cost Advantage</label>
                    <p class="text-xs text-gray-600">
                        The cost of doing one quantum operation as compared to one
                        classical operation.
                    </p>
                    <div class="flex items-center justify-between w-full gap-2 mt-2 mb-4">
                        <input class="flex-1 accent-[#002D9D]" type="range" id="costFactor" min="0" max="16" step="0.5"
                            v-model="model.costFactor" />
                        <div
                            class="bg-gray-100 p-2 rounded-lg text-center w-1/5 flex items-center justify-center relative">
                            <span class="pr-2">10 </span>
                            <input class="w-[6ch] bg-transparent  absolute t-0 l-0 ml-14 mb-4 text-xs" type="number"
                                min="0" max="16" step="0.5" id="costFactor" v-model="model.costFactor" />
                        </div>
                        <div
                            class="bg-gray-100 p-2 rounded-lg text-center w-1/3 flex  items-center justify-center relative">
                            <input class="w-[6ch] bg-transparent  text-center" type="number" min="-90" max="90" step="1"
                                id="costImprovementRate" v-model="model.costImprovementRate" @input="checkLimits" />
                            <span class="text-xs text-gray-600 text-left">
                                % change per year
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col relative">
                    <label class="font-medium text-s" for="physical_logical_ratio">Physical-Logical Qubit Ratio</label>
                    <p class="text-xs text-gray-600">
                        Number of physical qubits needed per one error corrected logical
                        qubit.
                    </p>
                    <div class="flex items-center justify-between w-full gap-2 mt-2 mb-4 relative">
                        <!-- Overlay for disabling input fields -->
                        <div v-if="lockPLQR" class="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center 
                                text-gray-800 text-sm font-semibold rounded-lg pointer-events-none 
                                z-10 drop-shadow-lg px-4 text-center">
                            Physical-Logical Qubit Ratio is unused when roadmap is defined
                            in terms of logical qubits.
                        </div>
                        <input class="flex-1 accent-[#002D9D]" type="range" id="physical_logical_ratio"
                            v-model="model.physicalLogicalQubitsRatio" min="3" max="2000" :disabled="lockPLQR" />
                        <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number"
                            id="physical_logical_ratio" v-model="model.physicalLogicalQubitsRatio"
                            :disabled="lockPLQR" />
                        <div
                            class="bg-gray-100 p-2 rounded-lg text-center w-1/3 flex  items-center justify-center relative">
                            <input class="w-[6ch] bg-transparent  text-center" type="number" min="-90" step="1"
                                id="ratio_improvement_rate" v-model="model.ratioImprovementRate" @input="checkLimits"
                                :disabled="lockPLQR" />
                            <span class="text-xs text-gray-600 text-left">
                                % change per year
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>



    </div>
</template>


<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style lang="css" scoped>
.custom-multiselect :deep(.multiselect__tags) .multiselect__tag {
    background-color: #002D9D;
    z-index: 999 !important;

}

.custom-multiselect :deep(.multiselect__option) {
    background-color: white;
    color: #002D9D;
    border-radius: 4px;
    padding: 0.25rem;
    margin: 0.25rem;
    font-size: 1rem;
    line-height: 1.5rem;
    /* height: 1.5rem; */
    box-sizing: border-box;
    outline: none;
    transition: all 0.2s ease-in-out;
    z-index: 999 !important;
    text-wrap: wrap;

}


.custom-multiselect :deep(.multiselect__content)-wrapper {

    z-index: 999 !important;
}

.custom-multiselect :deep(.multiselect__option)--highlight {
    background-color: #002D9D;
    color: white;
    border-radius: 4px;
    padding: 0.25rem;
    margin: 0.25rem;
    font-size: 1rem;
    line-height: 1.5rem;
    /* height: 1.5rem; */
    box-sizing: border-box;
    outline: none;
    transition: all 0.2s ease-in-out;
    z-index: 999 !important;

}

/* Chrome, Safari, Edge, Opera */
.hide-arrow[type="number"]::-webkit-inner-spin-button,
.hide-arrow[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
.hide-arrow[type="number"] {
    -moz-appearance: textfield;
}

/* General fallback for unsupported browsers */
.hide-arrow[type="number"] {
    appearance: textfield;
}
</style>