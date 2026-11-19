// The built-in hardware presets. Plain data (no store), so the share-link code
// and the comparison worker can use it. useHardwaresStore (hardwares.js) adds
// the user's own hardware to these.

const currentYear = new Date().getFullYear();

function typesByYear(roadmap, demonstratedUpTo = currentYear) {
    const out = {};
    for (const y of Object.keys(roadmap)) {
        out[Number(y)] = Number(y) <= demonstratedUpTo ? 'demonstrated' : 'projected';
    }
    return out;
}

// Superconducting: the framework paper's base case, 10^6 = speed ratio 10^4 x
// 100 gates per logical gate (arXiv 2310.15505, Sec. III-C). The paper takes
// IBM's 555 ns gate (about 2,800 cycles of a 5 GHz CPU) and rounds the ratio
// up to 10^4, so Manual mode (gate time x GHz) gives less than 10^6. It used
// to be a 12 ns gate (Google's 2019 Sycamore gate), 10^3.78. See
// docs/model-decisions.md.
const defaultAdvancedSlowdown = {
    superconducting: { gateTime: 555, cpuGHz: 5, speed: 10000, gateOverhead: 100, algorithmConstant: 1 },
    trappedIon: { gateTime: 600000, cpuGHz: 5, speed: 3000000, gateOverhead: 100, algorithmConstant: 1 },
    // Neutral atoms: a logical gate takes about one error-correction round
    // (4.45 ms) plus a transversal CNOT (0.655 ms) in Harvard/QuEra's 2025
    // experiment (arXiv 2506.20661). About 5 ms, so 2.5 x 10^7 cycles of a
    // 5 GHz CPU and no extra gate overhead: 10^7.4. Was a 250 ns gate x 100.
    neutralAtom: { gateTime: 5000000, cpuGHz: 5, speed: 25000000, gateOverhead: 1, algorithmConstant: 1 },
};

// 2026: up to three 120-qubit Nighthawk modules (IBM roadmap). 2029 and 2033
// are estimates: IBM gives Starling (200 logical) as "1000s" of physical
// qubits and Blue Jay (2,000 logical) as about 10x that.
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

// provenance: who published the roadmap numbers (see roadmapSchema.js PROVENANCES).
export const PRESETS = [
    {
        hardwareName: "IBM 2025 (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 6,
        costFactor: null,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
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
        hardwareSlowdown: 6,
        costFactor: null,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
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
        hardwareSlowdown: 6,
        costFactor: null,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
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
        hardwareSlowdown: 6,
        costFactor: null,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
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
        costFactor: null,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
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
        costFactor: null,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
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
        hardwareSlowdown: 7.4,
        costFactor: null,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
        // Aquila (2022), then the Jan 2024 roadmap: 3,000 (2025), 10,000 (2026).
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
        hardwareSlowdown: 7.4,
        costFactor: null,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
        // Physical qubits (atoms) from Pasqal's 2025 roadmap: 1,000 in 2025 and
        // 10,000 in 2028. The roadmap contradicts itself elsewhere (140 in 2025,
        // "200+" in 2027); its logical-qubit targets are not used.
        roadmap: {
            2025: 1000,
            2028: 10000,
        },
        dataPointTypes: typesByYear({ 2025: 1000, 2028: 10000 }, 2024),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.neutralAtom,
        reference: "https://www.pasqal.com/newsroom/pasqal-releases-2025-roadmap/",
        provenance: "vendor-published",
    },
    {
        hardwareName: "Infleqtion (Neutral Atom)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 7.4,
        costFactor: null,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
        // Infleqtion's targets are logical qubits: 30 shown in Sept 2026 (on 80
        // atoms), 100 by 2028 and 1,000 by 2030. Converted to physical qubits at
        // that 80:30, the only physical figure it gives.
        roadmap: {
            2026: 80,
            2028: 267,
            2030: 2667,
        },
        dataPointTypes: typesByYear({ 2026: 80, 2028: 267, 2030: 2667 }, 2026),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.neutralAtom,
        reference: "https://thequantuminsider.com/2026/09/24/infleqtion-achieves-30-entangled-logical-qubits-on-its-sqale-quantum-computer/",
        provenance: "third-party",
    },
];

export const PRESET_NAMES = new Set(PRESETS.map(h => h.hardwareName));
