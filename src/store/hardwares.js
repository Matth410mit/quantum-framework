import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const currentYear = new Date().getFullYear();

function typesByYear(roadmap, demonstratedUpTo = currentYear) {
    const out = {};
    for (const y of Object.keys(roadmap)) {
        out[Number(y)] = Number(y) <= demonstratedUpTo ? 'demonstrated' : 'projected';
    }
    return out;
}

const defaultAdvancedSlowdown = {
    superconducting: { gateTime: 12, cpuGHz: 5, speed: 60, gateOverhead: 100, algorithmConstant: 1 },
    trappedIon: { gateTime: 600000, cpuGHz: 5, speed: 3000000, gateOverhead: 100, algorithmConstant: 1 },
    neutralAtom: { gateTime: 250, cpuGHz: 5, speed: 1250, gateOverhead: 100, algorithmConstant: 1 },
};

const ibm2024Roadmap = {
    2020: 27,
    2024: 133,
    2025: 156,
    2028: 1092,
};

const ibm2025Roadmap = {
    2024: 156,
    2025: 156,
    2026: 120,
    2028: 1080,
    2029: 10000,
    2033: 100000,
};

const iqmRoadmap = {
    2024: 20,
    2026: 150,
    2027: 300,
    2028: 1000,
    2030: 10000,
    2033: 1000000,
};

const quantinuumRoadmap = {
    2024: 56,
    2025: 96,
    2027: 192,
    2029: 1000,
};

const initialPresets = [
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
        roadmap: ibm2024Roadmap,
        dataPointTypes: typesByYear(ibm2024Roadmap),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.superconducting,
        reference: "https://www.ibm.com/roadmaps/quantum.pdf",
    },
    {
        hardwareName: "IBM 2025 (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 3.78,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 264,
        ratioImprovementRate: -23,
        roadmap: ibm2025Roadmap,
        dataPointTypes: typesByYear(ibm2025Roadmap),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.superconducting,
        reference: "https://www.ibm.com/quantum/hardware#roadmap",
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
            2024: 105,
        },
        dataPointTypes: typesByYear({ 2019: 53, 2024: 105 }),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.superconducting,
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
        },
        dataPointTypes: typesByYear({ 2018: 19, 2021: 40, 2024: 84 }),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.superconducting,
        reference: "19Q (2018), Aspen-M non-modular (2021), Ankaa-3 (2024)",
    },
    {
        hardwareName: "IQM (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 3.78,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 100,
        ratioImprovementRate: -23,
        roadmap: iqmRoadmap,
        dataPointTypes: typesByYear(iqmRoadmap),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.superconducting,
        reference: "https://iqm.tech/technology/roadmap/",
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
        ratioImprovementRate: -23,
        roadmap: {
            2021: 22,
            2024: 35,
            2028: 1024,
        },
        dataPointTypes: typesByYear({ 2021: 22, 2024: 35, 2028: 1024 }),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.trappedIon,
        reference: "https://ionq.com/blog/how-we-achieved-our-2024-performance-target-of-aq-35",
    },
    {
        hardwareName: "Quantinuum (Trapped Ion)",
        penaltyInput: "1",
        processors: 5,
        hardwareSlowdown: 8.48,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 32,
        ratioImprovementRate: -23,
        roadmap: quantinuumRoadmap,
        dataPointTypes: typesByYear(quantinuumRoadmap),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.trappedIon,
        reference: "https://www.quantinuum.com/press-releases/quantinuum-unveils-accelerated-roadmap-to-achieve-universal-fault-tolerant-quantum-computing-by-2030",
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
        dataPointTypes: typesByYear({ 2023: 256, 2025: 3000, 2026: 10000 }),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.neutralAtom,
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
        dataPointTypes: typesByYear({ 2022: 200, 2024: 1000, 2026: 10000 }),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.neutralAtom,
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
        dataPointTypes: typesByYear({ 2024: 2, 2026: 10, 2028: 100 }),
        roadmapUnit: "logical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.neutralAtom,
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
        dataPointTypes: typesByYear({ 2018: 1, 2021: 6, 2024: 100 }),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.neutralAtom,
        reference: "https://www.eetimes.eu/cea-leti-details-silicon-based-quantum-computing-roadmap/",
    },
];

export const useHardwaresStore = defineStore('hardwares', () => {
    const presets = ref(initialPresets);
    const imported = ref([]);

    const all = computed(() => [...presets.value, ...imported.value]);

    function uniqueName(name) {
        const existing = new Set(all.value.map(h => h.hardwareName));
        if (!existing.has(name)) return name;
        let i = 2;
        while (existing.has(`${name} (${i})`)) i++;
        return `${name} (${i})`;
    }

    function addImported(hardware) {
        const named = { ...hardware, hardwareName: uniqueName(hardware.hardwareName) };
        imported.value.push(named);
        return named;
    }

    return { presets, imported, all, addImported };
});
