<script setup>
import Multiselect from 'vue-multiselect'
import HardwareSlowdownAdvanced from './HardwareSlowdownAdvanced.vue';
import { useModelsStore } from '../store/models';
import { useHardwaresStore } from '../store/hardwares';
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
import ProblemBrowser from './ProblemBrowser.vue';
import {
    findProblem, groupedProblemOptions, hasValidFormulas,
    getAlgorithmOptions, getDefaultAlgorithm, getHiddenAlgorithmCount,
    isModifiedFromDefaults,
} from '../store/problemCatalog';
import { hardwareToRoadmap, roadmapToQubitSeries } from '../store/roadmapSchema.js';
import { applyHardwareToModel } from '../store/urlState';


const models = useModelsStore();
const hardwaresStore = useHardwaresStore();

const props = defineProps({
    modelId: Number
});

const selectedClassicalAlgorithm = ref(null);

const selectedQuantumAlgorithm = ref(null);

// Recommended (best-known) algorithm first, then the rest newest-first.
const availableClassicalAlgorithms = computed(() => getAlgorithmOptions(selectedProblem.value, 'classical'));
const availableQuantumAlgorithms = computed(() => getAlgorithmOptions(selectedProblem.value, 'quantum'));

function formatQubitCount(value) {
    if (value <= 0) return '0';
    return utils.toBase10HTML(Math.log10(value));
}

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

// Problem dropdown: "Popular" first (if any are ranked), then grouped by domain.
// Search matches names, categories and aliases (e.g. "RSA", "Grover", "TSP").
const problemQuery = ref('');
const problemOptions = computed(() => groupedProblemOptions(problemQuery.value));

const hiddenClassicalCount = computed(() => getHiddenAlgorithmCount(selectedProblem.value, 'classical'));
const hiddenQuantumCount = computed(() => getHiddenAlgorithmCount(selectedProblem.value, 'quantum'));

// The recommended algorithms for the selected problem, with their papers.
const defaultReferences = computed(() => ['classical', 'quantum']
    .map(type => ({ type, algo: getDefaultAlgorithm(selectedProblem.value, type) }))
    .filter(r => r.algo));

const algorithmsModified = computed(() => isModifiedFromDefaults(selectedProblem.value, model.value));

function resetToRecommended() {
    const classical = getDefaultAlgorithm(selectedProblem.value, 'classical');
    const quantum = getDefaultAlgorithm(selectedProblem.value, 'quantum');
    if (classical) onAlgorithmChange('classical', classical);
    if (quantum) onAlgorithmChange('quantum', quantum);
}

function problemSubtitle(problem) {
    const c = getDefaultAlgorithm(problem, 'classical');
    const q = getDefaultAlgorithm(problem, 'quantum');
    const label = (a) => a ? (a.year ? `${a.name} (${a.year})` : a.name) : '—';
    return `${label(c)} vs ${label(q)}`;
}


const hardwares = computed(() => hardwaresStore.all);



const model = ref(models.models.find(m => m.id === props.modelId));

function updateSlowdown(hwSlowdown, advancedSlowdown) {
    model.value.hardwareSlowdown = hwSlowdown;
    model.value.advancedSlowdown = advancedSlowdown;
}

const selectedProblem = ref(findProblem(model.value.problemName));
const selectedHardware = ref(hardwares.value.find(h => h.hardwareName === model.value.hardwareName));

// Mark the defaults as selected on first load when the model still uses them.
function matchingAlgorithm(options, runtime, work) {
    return options.find(a => a.runtimeFormula === runtime && a.workFormula === work) || null;
}
selectedClassicalAlgorithm.value = matchingAlgorithm(availableClassicalAlgorithms.value,
    model.value.classicalRuntimeInput, model.value.classicalWork);
selectedQuantumAlgorithm.value = matchingAlgorithm(availableQuantumAlgorithms.value,
    model.value.quantumRuntimeInput, model.value.quantumWork);

onMounted(() => {
    model.value = Object.assign({}, models.models.find(m => m.id === props.modelId))
});

watch(() => selectedHardware.value, (hardware) => {
    applyHardwareToModel(model.value, hardware);
}, { deep: true });

watch(() => selectedProblem.value, (problem) => {
    if (!problem) return;

    // Always start from the problem's best-known algorithms (catalog defaults).
    const classical = getDefaultAlgorithm(problem, 'classical');
    const quantum = getDefaultAlgorithm(problem, 'quantum');

    selectedClassicalAlgorithm.value = classical;
    selectedQuantumAlgorithm.value = quantum;

    // Batch-apply all model values at once to avoid intermediate states
    model.value.problemName = problem.problemName;
    model.value.qubitToProblemSize = problem.qubitToProblemSize;
    if (classical) {
        model.value.classicalRuntimeInput = classical.runtimeFormula;
        model.value.classicalWork = classical.workFormula;
    }
    if (quantum) {
        model.value.quantumRuntimeInput = quantum.runtimeFormula;
        model.value.quantumWork = quantum.workFormula;
    }
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
    if (value.dataPointTypes) {
        model.value.dataPointTypes = value.dataPointTypes;
    }
}

// The roadmap file records what the source reported. The calculator's own
// assumptions (PLQR, its yearly change, extrapolation) stay in the model and
// are applied here when a roadmap is loaded, not stored in the file.
const currentRoadmapsToExport = computed(() => {
    if (!model.value) return [];
    return [hardwareToRoadmap({
        hardware: selectedHardware.value || { hardwareName: model.value.hardwareName },
        series: model.value.roadmap || {},
        roadmapUnit: model.value.roadmapUnit || 'physical',
        dataPointTypes: model.value.dataPointTypes,
    })];
});

function handleImportSuccess({ roadmaps, settings = [], notes = [] }) {
    if (!Array.isArray(roadmaps) || roadmaps.length === 0) return;

    let firstAdded = null;
    roadmaps.forEach((rm, i) => {
        const m = model.value;
        // Older files carry calculator settings; newer ones use the current model's.
        const fileSettings = settings[i] || {};
        const physicalLogicalQubitsRatio = fileSettings.physicalLogicalQubitsRatio ?? m.physicalLogicalQubitsRatio;
        const ratioImprovementRate = fileSettings.ratioImprovementRate ?? m.ratioImprovementRate;

        const series = roadmapToQubitSeries(rm, {
            physicalLogicalQubitsRatio: Number(physicalLogicalQubitsRatio),
            ratioImprovementRate: Number(ratioImprovementRate),
            baseYear: new Date().getFullYear(),
        });
        notes.push(...series.notes);
        if (Object.keys(series.roadmap).length === 0) {
            notes.push(`${rm.title}: has no physical or logical qubit counts, so it was not added to the hardware list.`);
            return;
        }

        const preset = {
            hardwareName: rm.title || rm.organization || 'Imported Roadmap',
            penaltyInput: m.penaltyInput,
            processors: m.processors,
            hardwareSlowdown: m.hardwareSlowdown,
            costFactor: m.costFactor,
            quantumImprovementRate: m.quantumImprovementRate,
            costImprovementRate: m.costImprovementRate,
            physicalLogicalQubitsRatio,
            ratioImprovementRate,
            roadmap: series.roadmap,
            dataPointTypes: series.dataPointTypes,
            roadmapUnit: series.roadmapUnit,
            extrapolationType: fileSettings.extrapolationType || m.extrapolationType || 'exponential',
            advancedSlowdown: m.advancedSlowdown,
            reference: rm.source?.url || rm.source?.citation || '',
            provenance: rm.provenance,
            // Kept so a re-export writes back exactly what the file reported.
            roadmapRecord: rm,
            importedSeries: series,
        };

        const added = hardwaresStore.addImported(preset);
        if (!firstAdded) firstAdded = added;
    });

    if (firstAdded) {
        selectedHardware.value = firstAdded;
    }
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

</script>

<template>
    <div class="" v-if="model">
        <div class="flex justify-between items-center border-b w-full px-8 py-2 bg-slate-100">
            <h2 class="text-xl text-center font-medium">{{ model.id }}. {{ model.problemName }} on {{
                model.hardwareName }}
                <span v-if="algorithmsModified" class="ml-1 align-middle rounded bg-amber-200 px-1 text-xs font-medium text-amber-900"
                    title="This model uses algorithms other than the recommended ones">Modified</span></h2>

            <div class="flex flex-wrap  items-center gap-4">
                <!-- toogle quantum only -->
                <label class="flex items-center gap-1 cursor-pointer">
                    <Switch v-model="editMode" :class="!editMode ? 'bg-gray-800' : 'bg-gray-400'"
                        class="relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                        <span class="sr-only">Advanced Options</span>
                        <span aria-hidden="true" :class="!editMode ? 'translate-x-4' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out" />

                    </Switch>
                    <span class="text-sm" :class="!editMode ? 'text-gray-800' : 'text-gray-400'">
                        Advanced Options
                    </span>

                </label>
                <button
                    class="flex items-center justify-center rounded-md bg-red-50 ring-1 ring-opacity-50 ring-[#a32035] px-2 py-2 text-sm text-[#a32035] hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a32035] focus-visible:ring-offset-2"
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
                    v-model="selectedProblem" :options="problemOptions" group-values="problems" group-label="label"
                    :group-select="false" :searchable="true" :internal-search="false" @search-change="problemQuery = $event"
                    @close="problemQuery = ''" :close-on-select="true" :allowEmpty="false" :show-labels="false"
                    placeholder="Search problems">
                    <template #option="{ option }">
                        <span v-if="option.$isLabel" class="text-xs font-semibold uppercase tracking-wide">{{ option.$groupLabel }}</span>
                        <div v-else>
                            <div>
                                {{ option.problemName }}
                            </div>
                            <div class="text-xs opacity-70">{{ problemSubtitle(option) }}</div>
                        </div>
                    </template>
                    <template #noResult>No matching problems. Try Browse for the full list.</template>
                </multiselect>
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
            <!-- LEFT HALF: problem, roadmap, penalty, qubits to size -->
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

                        <div class="flex items-center gap-2">
                        <ProblemBrowser :selected="selectedProblem" @select="selectedProblem = $event"
                            v-slot="{ openModal }">
                            <button class="rounded-md bg-gray-500 text-xs p-0.5 px-2 text-white hover:bg-gray-600"
                                @click="openModal">
                                Browse
                            </button>
                        </ProblemBrowser>
                        <!-- Advanced runtime / algorithm modal (only place you can change variant) -->
                        <ProblemRuntimeAdvanced :classicalRuntimeInput="model.classicalRuntimeInput"
                            :quantumRuntimeInput="model.quantumRuntimeInput" :penaltyInput="model.penaltyInput"
                            :classicalWork="model.classicalWork" :quantumWork="model.quantumWork"
                            :processors="model.processors"
                            :maxComputeTimeLog="model.maxComputeTimeLog"
                            :availableClassicalAlgorithms="availableClassicalAlgorithms"
                            :availableQuantumAlgorithms="availableQuantumAlgorithms"
                            :selectedClassicalAlgorithm="selectedClassicalAlgorithm"
                            :selectedQuantumAlgorithm="selectedQuantumAlgorithm"
                            :hiddenClassicalCount="hiddenClassicalCount" :hiddenQuantumCount="hiddenQuantumCount"
                            :sizeParameter="selectedProblem?.sizeParameter"
                            @updateFunctions="updateFunctions"
                            @updateAlgorithmChange="onAlgorithmChange" v-slot="{ openModal }">
                            <button class="rounded-md bg-gray-500 text-xs p-0.5 px-2 text-white hover:bg-gray-600"
                                @click="openModal">
                                Algorithm Options
                            </button>
                        </ProblemRuntimeAdvanced>
                        </div>
                    </div>

                    <!-- Problem selector (same UI as before; no algorithm dropdown here) -->
                    <multiselect class="custom-multiselect mt-1" track-by="problemName" label="problemName"
                        v-model="selectedProblem" :options="problemOptions" group-values="problems" group-label="label"
                        :group-select="false" :searchable="true" :internal-search="false" @search-change="problemQuery = $event"
                        @close="problemQuery = ''" :close-on-select="true" :allowEmpty="false" :show-labels="false"
                        placeholder="Search problems">
                        <template #option="{ option }">
                            <span v-if="option.$isLabel" class="text-xs font-semibold uppercase tracking-wide">{{ option.$groupLabel }}</span>
                            <div v-else>
                                <div>
                                    {{ option.problemName }}
                                </div>
                                <div class="text-xs opacity-70">{{ problemSubtitle(option) }}</div>
                            </div>
                        </template>
                        <template #noResult>No matching problems. Try Browse for the full list.</template>
                    </multiselect>

                    <!-- What the problem is, what n means, and the recommended algorithms' papers -->
                    <div v-if="selectedProblem" class="mt-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-700">
                        <div v-if="selectedProblem.sizeParameter" class="font-medium">{{ selectedProblem.sizeParameter }}</div>
                        <p v-if="selectedProblem.description" class="mt-1">{{ selectedProblem.description }}</p>
                        <ul class="mt-1">
                            <li v-for="r in defaultReferences" :key="r.type">
                                <span class="capitalize">{{ r.type }}</span>:
                                <a v-if="r.algo.reference?.url" :href="r.algo.reference.url" target="_blank"
                                    rel="noopener" class="text-blue-900 hover:underline"
                                    :title="r.algo.reference.citation">{{ r.algo.name }}<span v-if="r.algo.year"> ({{ r.algo.year }})</span></a>
                                <span v-else :title="r.algo.reference?.citation">{{ r.algo.name }}<span v-if="r.algo.year"> ({{ r.algo.year }})</span></span>
                            </li>
                        </ul>
                    </div>

                    <div v-if="algorithmsModified"
                        class="mt-2 flex items-center justify-between gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
                        <span><span class="rounded bg-amber-200 px-1 font-medium">Modified</span>
                            Not the recommended algorithms for this problem.</span>
                        <button type="button" class="shrink-0 font-medium hover:underline" @click="resetToRecommended">
                            Reset to recommended
                        </button>
                    </div>

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
                            :physicalLogicalQubitsRatio="model.physicalLogicalQubitsRatio"
                            :currentRoadmaps="currentRoadmapsToExport" :dataPointTypes="model.dataPointTypes" @import-success="handleImportSuccess"
                            v-slot="{ openModal }">
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
                                        :currentRoadmaps="currentRoadmapsToExport" :dataPointTypes="model.dataPointTypes" @import-success="handleImportSuccess"
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

                <!-- Qubits to Problem Size card -->
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
                                            <a class="text-[#a32035] hover:underline"
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
                        <input class="flex-1 accent-gray-800" type="range" id="hardwareSlowdown" min="0" max="16"
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
                        <input class="flex-1 accent-gray-800" type="range" id="costFactor" min="0" max="16" step="0.5"
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
                        <input class="flex-1 accent-gray-800" type="range" id="physical_logical_ratio"
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
    background-color: #a32035;
    z-index: 999 !important;

}

.custom-multiselect :deep(.multiselect__option) {
    background-color: white;
    color: #a32035;
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
    background-color: #a32035;
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
