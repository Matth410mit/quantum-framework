// Built-in hardware presets. This is plain data so the share links and the
// comparison worker can use it too. hardwares.js adds the user's own hardware.

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

// 2026 is up to three 120-qubit Nighthawk modules, from IBM's roadmap. 2029 and
// 2033 are estimates. IBM says Starling (200 logical qubits) needs thousands
// of physical qubits, and Blue Jay (2,000 logical) about 10 times that.
const ibm2025Roadmap = {
    2024: 156,
    2025: 156,
    2026: 360,
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
    2025: 98,
    2027: 192,
    2029: 1000,
};

// provenance is who published the roadmap numbers (see PROVENANCES in roadmapSchema.js).
export const PRESETS = [
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
        dataPointTypes: typesByYear(ibm2025Roadmap, 2025),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.superconducting,
        reference: "https://www.ibm.com/quantum/hardware#roadmap",
        provenance: "vendor-published",
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
        provenance: "vendor-published",
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
        provenance: "vendor-published",
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
        dataPointTypes: typesByYear(iqmRoadmap, 2024),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.superconducting,
        reference: "https://iqm.tech/technology/roadmap/",
        provenance: "vendor-published",
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
        provenance: "vendor-published",
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
        dataPointTypes: typesByYear(quantinuumRoadmap, 2025),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.trappedIon,
        reference: "https://www.quantinuum.com/press-releases/quantinuum-unveils-accelerated-roadmap-to-achieve-universal-fault-tolerant-quantum-computing-by-2030",
        provenance: "vendor-published",
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
        // Aquila in 2022, then the January 2024 roadmap: 3,000 in 2025 and 10,000 in 2026.
        roadmap: {
            2022: 256,
            2025: 3000,
            2026: 10000,
        },
        dataPointTypes: typesByYear({ 2022: 256, 2025: 3000, 2026: 10000 }, 2024),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.neutralAtom,
        reference: "https://www.quera.com/qec",
        provenance: "vendor-published",
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
        // Logical qubits from Pasqal's 2025 roadmap. We don't use its physical
        // qubit targets because they contradict each other.
        roadmap: {
            2025: 2,
            2027: 20,
            2029: 100,
            2030: 200,
        },
        dataPointTypes: typesByYear({ 2025: 2, 2027: 20, 2029: 100, 2030: 200 }, 2024),
        roadmapUnit: "logical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.neutralAtom,
        reference: "https://www.pasqal.com/newsroom/pasqal-releases-2025-roadmap/",
        provenance: "vendor-published",
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
        // 30 logical qubits shown in September 2026, with 100 planned by 2028 and 1,000 by 2030.
        roadmap: {
            2026: 30,
            2028: 100,
            2030: 1000,
        },
        dataPointTypes: typesByYear({ 2026: 30, 2028: 100, 2030: 1000 }),
        roadmapUnit: "logical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.neutralAtom,
        reference: "https://thequantuminsider.com/2026/09/24/infleqtion-achieves-30-entangled-logical-qubits-on-its-sqale-quantum-computer/",
        provenance: "third-party",
    },
];

export const PRESET_NAMES = new Set(PRESETS.map(h => h.hardwareName));
