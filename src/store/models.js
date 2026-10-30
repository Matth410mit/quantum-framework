import { defineStore } from 'pinia'
import { ref, toRaw, watch } from 'vue'
import { useHardwaresStore } from './hardwares'
import { readSetupFromUrl, writeSetupToUrl } from './urlState'

const modelTemplate = {
    id: 1,
    problemName: "Integer Factorization",
    // Same as the Integer Factorization defaults in problemCatalog.js.
    classicalRuntimeInput: "e^((64/9 * n * log(2))^(1/3) * log(n * log(2))^(2/3)) / p",
    classicalWork: "e^((64/9 * n * log(2))^(1/3) * log(n * log(2))^(2/3))",
    quantumRuntimeInput: "n^2 * (500 + log(n, 2))",
    quantumWork: "0.3 * n^3 + 0.0005 * n^3 * log(n, 2)",
    penaltyInput: "sqrt(q)",
    // Logical qubits needed for a problem of size n.
    qubitsNeeded: "3 * n + 0.002 * n * log(n, 2)",
    // Same as the IBM 2025 (Superconducting) preset in hardwarePresets.js.
    hardwareName: 'IBM 2025 (Superconducting)',
    roadmap: {
        2024: 156,
        2025: 156,
        2026: 360,
        2028: 1080,
        2029: 10000,
        2033: 100000,
    },
    dataPointTypes: {
        2024: 'demonstrated',
        2025: 'demonstrated',
        2026: 'projected',
        2028: 'projected',
        2029: 'projected',
        2033: 'projected',
    },
    roadmapUnit: "physical",
    extrapolationType: 'exponential',
    hardwareSlowdown: 3.78,
    costFactor: 8,
    quantumImprovementRate: -10,
    physicalLogicalQubitsRatio: 264,
    ratioImprovementRate: -23,
    costImprovementRate: -10,
    processors: 5,
    maxComputeTimeLog: null,
    advancedSlowdown: {
        gateTime: 12,
        cpuGHz: 5,
        speed: 60,
        gateOverhead: 100,
        algorithmConstant: 1,
    },

}

function deepClone(obj) {
    const clone = Array.isArray(obj) ? [] : {};

    Object.keys(obj).forEach(key => {
        const value = obj[key];
        clone[key] = (typeof value === "object" && value !== null) ? deepClone(value) : value;
    });

    return clone;
}

export const useModelsStore = defineStore('models', () => {
    const hardwares = useHardwaresStore()
    // Load the models from a shared link if there is one. Otherwise start with one model.
    const models = ref(
        readSetupFromUrl(modelTemplate, hardwares.all, hardwares.adoptShared) || [deepClone(modelTemplate)]
    )

    watch(models, (value) => writeSetupToUrl(value, modelTemplate, hardwares.all), { deep: true })

    function addModel() {
        const model = deepClone(modelTemplate)
        if (models.value.length === 0) {
            model.id = 1
        } else {
            model.id = Math.max(...models.value.map(m => m.id)) + 1
        }
        models.value.push(model)
        // i = current scroll position
        var i = window.scrollY;
        var int = setInterval(function () {
            window.scrollTo(0, i);
            i += 20;
            if (i >= document.body.scrollHeight) clearInterval(int);
        }, 10);

    }

    function removeModel(id) {
        models.value = models.value.filter(m => m.id !== id)
    }


    function duplicateModel(id) {
        const model = models.value.find(m => m.id === id)
        const clone = deepClone(model)
        clone.id = Math.max(...models.value.map(m => m.id)) + 1
        clone.roadmap = JSON.parse(JSON.stringify(model.roadmap))
        clone.dataPointTypes = JSON.parse(JSON.stringify(model.dataPointTypes || {}))

        models.value.push(clone)
        // scroll to bottom
        var i = window.scrollY;
        var int = setInterval(function () {
            window.scrollTo(0, i);
            i += 20;
            if (i >= document.body.scrollHeight) clearInterval(int);
        }, 10);
    }

    function updateModel(id, model) {
        models.value = models.value.map(m => m.id === id ? model : m)
    }

    return {
        models,
        updateModel,
        addModel,
        removeModel,
        duplicateModel
    }
})
