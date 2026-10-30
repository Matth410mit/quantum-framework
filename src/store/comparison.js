import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useHardwaresStore } from './hardwares'
import { useModelsStore } from './models'
import { findProblem, getDefaultAlgorithm, qubitsNeededFor } from './problemCatalog'
import { applyHardwareToModel, comparisonLink, readComparisonFromUrl, writeComparisonToUrl } from './urlState'

// Choices on the hardware comparison page. Until the user picks a problem
// there, it shows the calculator's first problem.
export const useComparisonStore = defineStore('comparison', () => {
    const hardwares = useHardwaresStore()
    const models = useModelsStore()
    const names = () => hardwares.all.map(h => h.hardwareName)

    const saved = readComparisonFromUrl(hardwares.adoptShared)
    const problemChoice = ref(findProblem(saved?.problemName)?.problemName || null)
    // An algorithm key, or null to use the recommended one.
    const quantumKey = ref(saved?.quantumKey || null)
    const classicalKey = ref(saved?.classicalKey || null)
    const mode = ref(saved?.mode || 'speed')
    // Names of hidden hardware. Storing hidden ones means new hardware starts ticked.
    const hidden = ref(saved?.shown ? names().filter(name => !saved.shown.includes(name)) : [])

    const problemName = computed(() => problemChoice.value
        || findProblem(models.models[0]?.problemName)?.problemName
        || 'Integer Factorization')

    // Algorithm keys only apply to one problem, so reset them when it changes.
    watch(problemName, () => {
        quantumKey.value = null
        classicalKey.value = null
    })

    function setProblem(name) {
        problemChoice.value = name
    }

    // The problem with its recommended algorithms. Each graph line applies one
    // hardware to a copy of this.
    const model = computed(() => {
        const problem = findProblem(problemName.value)
        const classical = getDefaultAlgorithm(problem, 'classical')
        const quantum = getDefaultAlgorithm(problem, 'quantum')
        const model = {
            problemName: problemName.value,
            classicalRuntimeInput: classical?.runtimeFormula || '',
            classicalWork: classical?.workFormula || '',
            quantumRuntimeInput: quantum?.runtimeFormula || '',
            quantumWork: quantum?.workFormula || '',
            qubitsNeeded: qubitsNeededFor(problem, quantum),
            maxComputeTimeLog: null,
        }
        applyHardwareToModel(model, hardwares.presets[0])
        return model
    })

    // Returns null when all hardware is shown.
    function shownNames() {
        const all = names()
        const shown = all.filter(name => !hidden.value.includes(name))
        return shown.length === all.length ? null : shown
    }

    function state(resolved = false) {
        return {
            problemName: resolved ? problemName.value : problemChoice.value,
            quantumKey: quantumKey.value,
            classicalKey: classicalKey.value,
            mode: mode.value,
            shown: shownNames(),
        }
    }

    // Keep the URL up to date. This also removes hardware settings from a
    // shared link once they are saved in the browser.
    watch(() => [problemChoice.value, quantumKey.value, classicalKey.value, mode.value, hidden.value, names()],
        () => writeComparisonToUrl(state()), { immediate: true, deep: true })

    function link() {
        return comparisonLink(state(true), hardwares.all)
    }

    return { problemName, quantumKey, classicalKey, mode, hidden, model, setProblem, link }
})
