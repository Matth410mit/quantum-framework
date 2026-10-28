<script setup>
// The hardware comparison page: one problem, every hardware. The choices live
// in store/comparison.js so they survive switching pages and go into links.
import Multiselect from 'vue-multiselect'
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import ProblemPicker from './ProblemPicker.vue'
import { useComparisonStore } from '../store/comparison'
import { algorithmCredit, findProblem } from '../store/problemCatalog'
import { classicalCandidates, fastestClassical, quantumCandidates } from '../store/hardwareComparison'

const HardwareComparisonGraph = defineAsyncComponent(() => import('./HardwareComparisonGraph.vue'))

const comparison = useComparisonStore()

const problem = computed({
    get: () => findProblem(comparison.problemName),
    set: value => comparison.setProblem(value.problemName),
})

// The recommended algorithms are the defaults: on the quantum side the one
// that does best on the most hardware (found by the graph's calculation), on
// the classical side the one whose runtime grows slowest.
const recommendedQuantumKey = ref(null)
watch(() => [comparison.problemName, comparison.classicalKey], () => { recommendedQuantumKey.value = null })

const recommendedClassicalKey = computed(() =>
    problem.value ? fastestClassical(problem.value, comparison.model)?.key || null : null)

// The recommended algorithm first, marked; then the rest in the calculator's order.
function algorithmOptions(candidates, recommendedKey) {
    const options = candidates.filter(a => a.key).map(a => ({ ...a, recommended: a.key === recommendedKey }))
    return [...options.filter(a => a.recommended), ...options.filter(a => !a.recommended)]
}

const quantumOptions = computed(() => algorithmOptions(
    problem.value ? quantumCandidates(problem.value, comparison.model) : [], recommendedQuantumKey.value))

const classicalOptions = computed(() => algorithmOptions(
    problem.value ? classicalCandidates(problem.value, comparison.model) : [], recommendedClassicalKey.value))

// The store keeps null for "the recommended one", which keeps links short.
function algorithmModel(options, key, recommendedKey) {
    return computed({
        get: () => options.value.find(o => o.key === (comparison[key] || recommendedKey.value)) || null,
        set: value => { comparison[key] = !value || value.key === recommendedKey.value ? null : value.key },
    })
}

const quantumAlgorithm = algorithmModel(quantumOptions, 'quantumKey', recommendedQuantumKey)
const classicalAlgorithm = algorithmModel(classicalOptions, 'classicalKey', recommendedClassicalKey)

function byline(option) {
    return [option.variation, option.authorsLabel || option.description].filter(Boolean).join(' · ')
}

const linkCopied = ref(false)
async function copyLink() {
    const link = comparison.link()
    try {
        await navigator.clipboard.writeText(link)
    } catch {
        window.prompt('Copy this link to share the comparison:', link)
        return
    }
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 2000)
}
</script>

<template>
    <div class="max-w-7xl mx-auto px-2">
        <h2 class="text-2xl font-semibold text-gray-900 mt-6">Hardware Comparison</h2>
        <p class="text-gray-900 text-lg text-justify my-4">
            When does each quantum computer reach quantum economic advantage on a problem? Pick the problem and,
            if you like, the algorithms to compare. Hardware you edited or imported in the calculator is included.
        </p>

        <div class="my-4 border border-gray-100 rounded-lg shadow-lg px-4 sm:px-8 py-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                    <label class="font-medium text-sm text-gray-900">Problem</label>
                    <ProblemPicker v-model="problem" />
                </div>
                <div>
                    <label class="font-medium text-sm text-gray-900" for="compareQuantumAlgorithm">Quantum algorithm</label>
                    <Multiselect id="compareQuantumAlgorithm" class="custom-multiselect mt-1" track-by="key" label="name"
                        v-model="quantumAlgorithm" :options="quantumOptions" :searchable="true" :close-on-select="true"
                        :allowEmpty="false" :show-labels="false" :placeholder="recommendedQuantumKey ? 'Choose quantum algorithm' : 'Finding the recommended algorithm…'">
                        <template #option="{ option }">
                            <div :title="algorithmCredit(option)">
                                <div class="font-medium">
                                    {{ option.name }}
                                    <span v-if="option.year" class="font-normal opacity-70">({{ option.year }})</span>
                                    <span v-if="option.recommended"
                                        class="ml-1 rounded bg-green-100 px-1 text-xs font-normal text-green-800">Recommended</span>
                                </div>
                                <div class="text-xs opacity-70">{{ byline(option) }}</div>
                            </div>
                        </template>
                        <template #singleLabel="{ option }">
                            <div class="font-medium">
                                {{ option.name }}
                                <span v-if="option.year" class="font-normal text-gray-600">({{ option.year }})</span>
                                <span v-if="option.recommended"
                                    class="ml-1 rounded bg-green-100 px-1 text-xs font-normal text-green-800">Recommended</span>
                            </div>
                        </template>
                    </Multiselect>
                </div>
                <div>
                    <label class="font-medium text-sm text-gray-900" for="compareClassicalAlgorithm">Classical algorithm</label>
                    <Multiselect id="compareClassicalAlgorithm" class="custom-multiselect mt-1" track-by="key" label="name"
                        v-model="classicalAlgorithm" :options="classicalOptions" :searchable="true" :close-on-select="true"
                        :allowEmpty="false" :show-labels="false" placeholder="Choose classical algorithm">
                        <template #option="{ option }">
                            <div :title="algorithmCredit(option)">
                                <div class="font-medium">
                                    {{ option.name }}
                                    <span v-if="option.year" class="font-normal opacity-70">({{ option.year }})</span>
                                    <span v-if="option.recommended"
                                        class="ml-1 rounded bg-green-100 px-1 text-xs font-normal text-green-800">Recommended</span>
                                </div>
                                <div class="text-xs opacity-70">{{ byline(option) }}</div>
                            </div>
                        </template>
                        <template #singleLabel="{ option }">
                            <div class="font-medium">
                                {{ option.name }}
                                <span v-if="option.year" class="font-normal text-gray-600">({{ option.year }})</span>
                                <span v-if="option.recommended"
                                    class="ml-1 rounded bg-green-100 px-1 text-xs font-normal text-green-800">Recommended</span>
                            </div>
                        </template>
                    </Multiselect>
                </div>
            </div>

            <div class="mt-4 text-gray-500">
                <HardwareComparisonGraph :model="comparison.model"
                    :quantum-key="comparison.quantumKey" :classical-key="comparison.classicalKey"
                    v-model:mode="comparison.mode" v-model:hidden="comparison.hidden"
                    @recommended="recommendedQuantumKey = $event" />
            </div>
        </div>

        <div class="flex justify-center">
            <button @click="copyLink" title="Copy a link that opens this comparison"
                class="rounded-lg p-2 m-4 ring-1 ring-[#a32035] text-[#a32035] hover:bg-red-50 transition-colors duration-200">
                {{ linkCopied ? 'Link copied' : 'Copy link to this comparison' }}</button>
        </div>
    </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style scoped>
/* The calculator's dropdown look (Form.vue). */
.custom-multiselect :deep(.multiselect__option) {
    background-color: white;
    color: #a32035;
    border-radius: 4px;
    padding: 0.25rem;
    margin: 0.25rem;
    font-size: 1rem;
    line-height: 1.5rem;
    box-sizing: border-box;
    outline: none;
    transition: all 0.2s ease-in-out;
    z-index: 999 !important;
    text-wrap: wrap;
}

.custom-multiselect :deep(.multiselect__content-wrapper) {
    z-index: 999 !important;
}

.custom-multiselect :deep(.multiselect__option--highlight) {
    background-color: #a32035;
    color: white;
}
</style>
