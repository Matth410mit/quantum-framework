<template>
    <Dialog title="Runtime Functions & Algorithm Selection" ref="dialog" @save="save" @cancel="cancel" @reset="reset"
        @openModal="reset" classes="max-w-2xl">
        <template v-slot:button="{ openModal }">
            <slot :openModal="openModal" />
        </template>

        <template #content>
            <div class="flex flex-col gap-4">
                <!-- CLASSICAL ALGORITHM SECTION -->
                <div class="border rounded-lg p-4 bg-gray-50">
                    <h3 class="font-semibold text-md mb-3 text-gray-700">Classical Algorithm</h3>

                    <!-- Classical Algorithm Selector -->
                    <div v-if="availableClassicalAlgorithms.length" class="mb-3">
                        <label class="font-medium text-sm" for="classicalAlgorithmVariant">
                            Select Classical Algorithm
                        </label>
                        <Multiselect id="classicalAlgorithmVariant" class="custom-multiselect mt-1" track-by="key"
                            label="name" v-model="localSelectedClassicalAlgorithm"
                            :options="availableClassicalAlgorithms" :searchable="false" :close-on-select="true"
                            :allowEmpty="false" :show-labels="false" placeholder="Choose classical algorithm">
                            <template #option="{ option }">
                                <div>
                                    <div class="font-medium">{{ option.name }}</div>
                                    <div class="text-xs text-gray-600">{{ option.description }}</div>
                                </div>
                            </template>
                            <template #singleLabel="{ option }">
                                <div class="font-medium">{{ option.name }}</div>
                            </template>
                        </Multiselect>
                        <p v-if="localSelectedClassicalAlgorithm" class="text-xs text-gray-600 mt-1">
                            {{ localSelectedClassicalAlgorithm.description }}
                        </p>
                    </div>

                    <div>
                        <label class="font-medium text-sm" for="classicalRuntimeInput">Classical Runtime</label>
                        <input type="text" v-model="classicalRuntimeInput"
                            class="w-full border rounded p-2 font-mono text-sm"
                            @input="validateInput('classicalRuntimeInput')" />
                        <div class="flex items-center justify-center gap-2 bg-white p-2 rounded-lg mt-1">
                            <p v-if="errors.classicalRuntimeInput" class="text-red-500 text-xs">
                                Invalid expression
                            </p>
                            <span v-if="!errors.classicalRuntimeInput"
                                v-html="renderKaTeX(classicalRuntimeInput)"></span>
                        </div>
                    </div>

                    <div class="mt-3">
                        <label class="font-medium text-sm" for="classicalWork">Classical Work</label>
                        <input type="text" v-model="classicalWork" class="w-full border rounded p-2 font-mono text-sm"
                            @input="validateInput('classicalWork')" />
                        <div class="flex items-center justify-center gap-2 bg-white p-2 rounded-lg mt-1">
                            <p v-if="errors.classicalWork" class="text-red-500 text-xs">
                                Invalid expression
                            </p>
                            <span v-if="!errors.classicalWork" v-html="renderKaTeX(classicalWork)"></span>
                        </div>
                    </div>
                </div>

                <!-- QUANTUM ALGORITHM SECTION -->
                <div class="border rounded-lg p-4 bg-blue-50">
                    <h3 class="font-semibold text-md mb-3 text-gray-700">Quantum Algorithm</h3>

                    <!-- Quantum Algorithm Selector -->
                    <div v-if="availableQuantumAlgorithms.length" class="mb-3">
                        <label class="font-medium text-sm" for="quantumAlgorithmVariant">
                            Select Quantum Algorithm
                        </label>
                        <Multiselect id="quantumAlgorithmVariant" class="custom-multiselect mt-1" track-by="key"
                            label="name" v-model="localSelectedQuantumAlgorithm" :options="availableQuantumAlgorithms"
                            :searchable="false" :close-on-select="true" :allowEmpty="false" :show-labels="false"
                            placeholder="Choose quantum algorithm">
                            <template #option="{ option }">
                                <div>
                                    <div class="font-medium">{{ option.name }}</div>
                                    <div class="text-xs text-gray-600">{{ option.description }}</div>
                                </div>
                            </template>
                            <template #singleLabel="{ option }">
                                <div class="font-medium">{{ option.name }}</div>
                            </template>
                        </Multiselect>
                        <p v-if="localSelectedQuantumAlgorithm" class="text-xs text-gray-600 mt-1">
                            {{ localSelectedQuantumAlgorithm.description }}
                        </p>
                    </div>

                    <div>
                        <label class="font-medium text-sm" for="quantumRuntimeInput">Quantum Runtime</label>
                        <input type="text" v-model="quantumRuntimeInput"
                            class="w-full border rounded p-2 font-mono text-sm"
                            @input="validateInput('quantumRuntimeInput')" />
                        <div class="flex items-center justify-center gap-2 bg-white p-2 rounded-lg mt-1">
                            <p v-if="errors.quantumRuntimeInput" class="text-red-500 text-xs">
                                Invalid expression
                            </p>
                            <span v-if="!errors.quantumRuntimeInput" v-html="renderKaTeX(quantumRuntimeInput)"></span>
                        </div>
                    </div>

                    <div class="mt-3">
                        <label class="font-medium text-sm" for="quantumWork">Quantum Work</label>
                        <input type="text" v-model="quantumWork" class="w-full border rounded p-2 font-mono text-sm"
                            @input="validateInput('quantumWork')" />
                        <div class="flex items-center justify-center gap-2 bg-white p-2 rounded-lg mt-1">
                            <p v-if="errors.quantumWork" class="text-red-500 text-xs">
                                Invalid expression
                            </p>
                            <span v-if="!errors.quantumWork" v-html="renderKaTeX(quantumWork)"></span>
                        </div>
                    </div>
                </div>

                <!-- SHARED SETTINGS -->
                <div class="border rounded-lg p-4 bg-gray-50">
                    <h3 class="font-semibold text-md mb-3 text-gray-700">Shared Settings</h3>

                    <div>
                        <label class="font-medium text-sm" for="penaltyInput">Connectivity Penalty</label>
                        <input type="text" v-model="penaltyInput" class="w-full border rounded p-2 font-mono text-sm"
                            @input="validateInput('penaltyInput')" />
                        <div class="flex items-center justify-center gap-2 bg-white p-2 rounded-lg mt-1">
                            <p v-if="errors.penaltyInput" class="text-red-500 text-xs">
                                Invalid expression
                            </p>
                            <span v-if="!errors.penaltyInput" v-html="renderKaTeX(penaltyInput)"></span>
                        </div>
                    </div>

                    <div class="mt-3">
                        <label class="font-medium text-sm" for="processors">Processors</label>
                        <div class="flex items-center justify-between w-full gap-2 mt-2">
                            <input class="flex-1 accent-[#002D9D]" type="range" id="processors" min="0" max="20"
                                step="1" v-model="processors" />
                            <div
                                class="bg-white p-2 rounded-lg text-center w-1/5 flex items-center justify-center relative">
                                <span class="pr-2">10 </span>
                                <input class="w-[6ch] bg-transparent absolute t-0 l-0 ml-14 mb-4 text-xs" type="number"
                                    min="0" max="20" step="1" id="processors" v-model="processors" />
                            </div>
                        </div>
                    </div>

                    <div class="mt-3">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="maxComputeTimeEnabled" v-model="maxComputeTimeEnabled"
                                class="accent-[#002D9D]" />
                            <label class="font-medium text-sm" for="maxComputeTimeEnabled">
                                Max Compute Time Cap
                            </label>
                        </div>
                        <p class="text-xs text-gray-600 mt-1">
                            Set a maximum budget of quantum operations (10<sup>X</sup>). This caps the
                            feasibility line on the QEA graph to show what problem sizes are solvable
                            within the operation budget, accounting for runtime and connectivity penalty.
                        </p>
                        <div v-if="maxComputeTimeEnabled" class="flex items-center justify-between w-full gap-2 mt-2">
                            <input class="flex-1 accent-[#002D9D]" type="range" id="maxComputeTimeLog" min="6" max="30"
                                step="0.5" v-model="maxComputeTimeLogValue" />
                            <div
                                class="bg-white p-2 rounded-lg text-center w-1/4 flex items-center justify-center relative">
                                <span class="pr-2">10 </span>
                                <input class="w-[6ch] bg-transparent absolute t-0 l-0 ml-14 mb-4 text-xs" type="number"
                                    min="6" max="30" step="0.5" id="maxComputeTimeLog" v-model="maxComputeTimeLogValue" />
                            </div>
                            <span class="text-xs text-gray-600 whitespace-nowrap">quantum ops</span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import Dialog from './Dialog.vue';
import { ref, computed, watch } from 'vue';
import Multiselect from 'vue-multiselect';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import * as math from 'mathjs';
import * as utils from '../store/utils';

const emit = defineEmits(['updateFunctions', 'updateAlgorithmChange']);

const dialog = ref(null);

const props = defineProps({
    classicalRuntimeInput: String,
    quantumRuntimeInput: String,
    penaltyInput: String,
    classicalWork: String,
    quantumWork: String,
    processors: Number,
    // NEW: separate classical and quantum algorithm lists
    availableClassicalAlgorithms: {
        type: Array,
        default: () => [],
    },
    availableQuantumAlgorithms: {
        type: Array,
        default: () => [],
    },
    selectedClassicalAlgorithm: {
        type: Object,
        default: null,
    },
    selectedQuantumAlgorithm: {
        type: Object,
        default: null,
    },
    maxComputeTimeLog: {
        type: Number,
        default: null,
    },
});

const classicalRuntimeInput = ref(props.classicalRuntimeInput);
const quantumRuntimeInput = ref(props.quantumRuntimeInput);
const penaltyInput = ref(props.penaltyInput);
const classicalWork = ref(props.classicalWork);
const quantumWork = ref(props.quantumWork);
const processors = ref(props.processors);
const maxComputeTimeEnabled = ref(props.maxComputeTimeLog !== null);
const maxComputeTimeLogValue = ref(props.maxComputeTimeLog !== null ? props.maxComputeTimeLog : 15);

// Local copies of selected algorithms for the modal UI
const localSelectedClassicalAlgorithm = ref(props.selectedClassicalAlgorithm);
const localSelectedQuantumAlgorithm = ref(props.selectedQuantumAlgorithm);

// Watch for prop changes
watch(
    () => props.selectedClassicalAlgorithm,
    (val) => {
        localSelectedClassicalAlgorithm.value = val;
    }
);

watch(
    () => props.selectedQuantumAlgorithm,
    (val) => {
        localSelectedQuantumAlgorithm.value = val;
    }
);

// When user changes classical algorithm in modal
watch(localSelectedClassicalAlgorithm, (alg) => {
    if (!alg || !alg.available) return;

    // Notify parent
    emit('updateAlgorithmChange', 'classical', alg);

    // Update local formulas
    if (alg.runtimeFormula) classicalRuntimeInput.value = alg.runtimeFormula;
    if (alg.workFormula) classicalWork.value = alg.workFormula;

    // Re-validate
    validateInput('classicalRuntimeInput');
    validateInput('classicalWork');
});

// When user changes quantum algorithm in modal
watch(localSelectedQuantumAlgorithm, (alg) => {
    if (!alg || !alg.available) return;

    // Notify parent
    emit('updateAlgorithmChange', 'quantum', alg);

    // Update local formulas
    if (alg.runtimeFormula) quantumRuntimeInput.value = alg.runtimeFormula;
    if (alg.workFormula) quantumWork.value = alg.workFormula;

    // Re-validate
    validateInput('quantumRuntimeInput');
    validateInput('quantumWork');
});

const errors = ref({
    classicalRuntimeInput: false,
    quantumRuntimeInput: false,
    penaltyInput: false,
    classicalWork: false,
    quantumWork: false,
});

const hasErrors = computed(() =>
    Object.values(errors.value).some((error) => error)
);

function reset() {
    classicalRuntimeInput.value = props.classicalRuntimeInput;
    quantumRuntimeInput.value = props.quantumRuntimeInput;
    penaltyInput.value = props.penaltyInput;
    classicalWork.value = props.classicalWork;
    quantumWork.value = props.quantumWork;
    processors.value = props.processors;
    maxComputeTimeEnabled.value = props.maxComputeTimeLog !== null;
    maxComputeTimeLogValue.value = props.maxComputeTimeLog !== null ? props.maxComputeTimeLog : 15;
    localSelectedClassicalAlgorithm.value = props.selectedClassicalAlgorithm;
    localSelectedQuantumAlgorithm.value = props.selectedQuantumAlgorithm;
    validateAllInputs(false);
}

function save() {
    if (!hasErrors.value) {
        emit('updateFunctions', {
            classicalRuntimeInput: classicalRuntimeInput.value,
            quantumRuntimeInput: quantumRuntimeInput.value,
            penaltyInput: penaltyInput.value,
            classicalWork: classicalWork.value,
            quantumWork: quantumWork.value,
            processors: processors.value,
            maxComputeTimeLog: maxComputeTimeEnabled.value ? Number(maxComputeTimeLogValue.value) : null,
        });
        dialog.value.closeModal();
    }
}

function cancel() {
    dialog.value.closeModal();
}

function validateInput(inputName, overrideClassicalWork = true) {
    const scope = { n: 1 };

    try {
        const compiled = math.compile(eval(inputName).value);
        if (inputName == 'classicalRuntimeInput') {
            scope['p'] = 1;
        } else if (inputName == 'quantumWork') {
            scope['q'] = 1;
        } else if (inputName == 'penaltyInput') {
            scope['q'] = 1;
        }

        compiled.evaluate(scope);
        errors.value[inputName] = false;

        if (overrideClassicalWork && inputName == 'classicalRuntimeInput') {
            classicalWork.value = utils.replaceVariable(
                classicalRuntimeInput.value,
                'p',
                '(1)'
            );
            validateInput('classicalWork');
        }
    } catch {
        errors.value[inputName] = true;
    }
}

function validateAllInputs(overrideClassicalWork = true) {
    validateInput('classicalRuntimeInput', overrideClassicalWork);
    validateInput('quantumRuntimeInput');
    validateInput('penaltyInput');
    validateInput('classicalWork');
    validateInput('quantumWork');
}

function renderKaTeX(input) {
    try {
        const expression = math.parse(input).toTex();
        return katex.renderToString(expression, { throwOnError: false });
    } catch {
        return '';
    }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style scoped>
input {
    font-family: monospace;
}
</style>