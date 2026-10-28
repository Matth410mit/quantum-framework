import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useHardwaresStore } from './hardwares'
import { useModelsStore } from './models'
import { findProblem, getDefaultAlgorithm, qubitsNeededFor } from './problemCatalog'
import { applyHardwareToModel, comparisonLink, readComparisonFromUrl, writeComparisonToUrl } from './urlState'

// The hardware comparison page's choices. Until the reader picks a problem
// there, it shows the calculator's first one.
export const useComparisonStore = defineStore('comparison', () => {
    const hardwares = useHardwaresStore()
    const models = useModelsStore()
    const names = () => hardwares.all.map(h => h.hardwareName)

    const saved = readComparisonFromUrl(hardwares.adoptShared)
    const problemChoice = ref(findProblem(saved?.problemName)?.problemName || null)
    // An algorithm key, or null for the automatic choice.
    const quantumKey = ref(saved?.quantumKey || null)
    const classicalKey = ref(saved?.classicalKey || null)
    const mode = ref(saved?.mode || 'speed')
    // 'size': the largest problem each hardware can run; 'ratio': that ÷ the
    // smallest problem where quantum wins.
    const view = ref(saved?.view || 'size')
    // Names of the hardware not drawn, so hardware added later starts ticked.
    const hidden = ref(saved?.shown ? names().filter(name => !saved.shown.includes(name)) : [])

    const problemName = computed(() => problemChoice.value
        || findProblem(models.models[0]?.problemName)?.problemName
        || 'Integer Factorization')

    // Algorithm keys belong to one problem.
    watch(problemName, () => {
        quantumKey.value = null
        classicalKey.value = null
    })

    function setProblem(name) {
        problemChoice.value = name
    }

    // The problem with its recommended algorithms; each line of the graph puts
    // one hardware on a copy.
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

    // null when every hardware is drawn.
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
            view: view.value,
            shown: shownNames(),
        }
    }

    // Also rewrites the URL read above, dropping the hardware it carried (now
    // saved in the browser).
    watch(() => [problemChoice.value, quantumKey.value, classicalKey.value, mode.value, view.value, hidden.value, names()],
        () => writeComparisonToUrl(state()), { immediate: true, deep: true })

    function link() {
        return comparisonLink(state(true), hardwares.all)
    }

    return { problemName, quantumKey, classicalKey, mode, view, hidden, model, setProblem, link }
})
