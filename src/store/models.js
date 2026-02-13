import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'

const modelTemplate = {
    id: 1,
    problemName: "Integer Factorization",
    classicalRuntimeInput: "e^((64/9 * n)^(1/3) * log(n, e)^(2/3)) / p",
    classicalWork: "e^((64/9 * n)^(1/3) * log(n, e)^(2/3))",
    quantumRuntimeInput: "n^(2) * log(n, e)",
    quantumWork: "n^(2) * log(n, e) * q",
    penaltyInput: "sqrt(q)",
    qubitToProblemSize: "q",
    hardwareName: 'IBM (Superconducting)',
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
    const models = ref(
        [

            deepClone(modelTemplate)
        ]
    )

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
