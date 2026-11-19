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
//
// The slowdown stays the same every year (quantumImprovementRate: 0).
// Error-correction cycles have not been getting faster: Google's took 921 ns in
// 2023 and 1,100 ns in 2024. Users can still set a yearly change.
const defaultAdvancedSlowdown = {
    superconducting: { gateTime: 555, cpuGHz: 5, speed: 10000, gateOverhead: 100, algorithmConstant: 1 },
    // Trapped ions: a logical gate takes about one error-correction round, so
    // there is no extra gate overhead. Rounds take from a few ms (arXiv
    // 2611.21906) to about 200 ms (Quantinuum H1, arXiv 2107.07505). 60 ms is
    // 3 x 10^8 cycles of a 5 GHz CPU, 10^8.48, the same value as before, when it
    // was a 0.6 ms gate x 100.
    trappedIon: { gateTime: 60000000, cpuGHz: 5, speed: 300000000, gateOverhead: 1, algorithmConstant: 1 },
    // Neutral atoms: a logical gate takes about one error-correction round
    // (4.45 ms) plus a transversal CNOT (0.655 ms) in Harvard/QuEra's 2025
    // experiment (arXiv 2506.20661). About 5 ms, so 2.5 x 10^7 cycles of a
    // 5 GHz CPU and no extra gate overhead: 10^7.4. Was a 250 ns gate x 100.
    neutralAtom: { gateTime: 5000000, cpuGHz: 5, speed: 25000000, gateOverhead: 1, algorithmConstant: 1 },
};

// Roadmaps hold the machines each vendor has built, the largest one running
// in 2026 (the year these were checked), and its targets up to 2028. Vendors
// have mostly met their one- and two-year targets and mostly missed longer
// ones, so later targets are left out (listed in the comments). Past the last
// point every roadmap grows 1.6x a year (utils.js). See docs/model-decisions.md.
const BUILT_UP_TO = 2026;

// No step may grow faster than 3.4x a year, about the fastest any vendor has
// grown its largest machine (IBM, 127 to 433 qubits in 2022; Atom Computing,
// 100 to 1,180 from 2021 to 2023). A target above that is lowered to it,
// counting from the point before.
const MAX_GROWTH_PER_YEAR = 3.4;

function capGrowth(roadmap) {
    const out = {};
    let previous = null;
    for (const year of Object.keys(roadmap).map(Number).sort((a, b) => a - b)) {
        let qubits = roadmap[year];
        if (previous) {
            const limit = Math.round(previous.qubits * MAX_GROWTH_PER_YEAR ** (year - previous.year));
            qubits = Math.min(qubits, limit);
        }
        out[year] = qubits;
        previous = { year, qubits };
    }
    return out;
}

// Heron (156 qubits) is still IBM's largest in 2026. Two linked 520-qubit
// Nighthawk r3 chips (1,040) are planned for 2027, capped to 530. Left out:
// Starling (2029) and Blue Jay (2033).
const ibm2025Roadmap = capGrowth({
    2024: 156,
    2025: 156,
    2026: 156,
    2027: 1040,
});

// Sycamore (2019) and Willow (2024). Google gives no dated qubit targets.
const googleRoadmap = {
    2019: 53,
    2024: 105,
    2026: 105,
};

// Euro-Q-Exa (54 qubits, Feb 2026). Targets 300 (2027) and 1,000 (2028),
// capped to 184 and 626. Left out: 10,000 (2030) and 1,000,000 (2033).
const iqmRoadmap = capGrowth({
    2024: 20,
    2026: 54,
    2027: 300,
    2028: 1000,
});

// H2 (56, 2024), Helios (98, 2025), Sol (192, 2027). Left out: Apollo (2029).
const quantinuumRoadmap = capGrowth({
    2024: 56,
    2025: 98,
    2026: 98,
    2027: 192,
});

// Aria (25, 2022), Forte (36, 2024), Tempo (100, 2025, still the largest in
// 2026; Superion 256 ships in 2027). Targets 10,000 (2027) and 20,000 (2028),
// capped to 340 and 1,156. Physical qubits; these points used to be
// algorithmic qubits (#AQ). Left out: 200,000 (2029) and 2,000,000 (2030).
const ionqRoadmap = capGrowth({
    2022: 25,
    2024: 36,
    2025: 100,
    2026: 100,
    2027: 10000,
    2028: 20000,
});

// Ankaa-3 (84, 2024), Cepheus-1-108Q (Apr 2026), 300+ by mid-2028. Left out:
// about 1,000 "within three years" (Nov 2026).
const rigettiRoadmap = capGrowth({
    2018: 19,
    2021: 40,
    2024: 84,
    2026: 108,
    2028: 300,
});

// Aquila (256, 2022) and Gemini at AIST (260, 2025). The June 2026 roadmap
// puts 10,000+ in Libra in 2028, capped to 3,006. The Jan 2024 roadmap's
// 3,000 (2025) and 10,000 (2026) were not built.
const queraRoadmap = capGrowth({
    2022: 256,
    2025: 260,
    2026: 260,
    2028: 10000,
});

// Orion Beta (100+, 2024) and a 200-qubit system in Saudi Arabia (H1 2026).
// Targets 1,000 (early 2027) and Centaurus, about 10,000 (2028), capped to
// 680 and 2,312. Its logical-qubit targets are not used.
const pasqalRoadmap = capGrowth({
    2024: 100,
    2026: 200,
    2027: 1000,
    2028: 10000,
});

// Infleqtion's targets are logical qubits: 30 shown in Sept 2026 (on 80
// atoms) and 100 by 2028, converted at that 80:30, the only physical figure it
// gives. Left out: 1,000 logical (2,667 physical) by 2030.
const infleqtionRoadmap = capGrowth({
    2026: 80,
    2028: 267,
});

// provenance: who published the roadmap numbers (see roadmapSchema.js PROVENANCES).
export const PRESETS = [
    {
        hardwareName: "IBM 2025 (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 6,
        costFactor: null,
        quantumImprovementRate: 0,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
        roadmap: ibm2025Roadmap,
        dataPointTypes: typesByYear(ibm2025Roadmap, BUILT_UP_TO),
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
        quantumImprovementRate: 0,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
        roadmap: googleRoadmap,
        dataPointTypes: typesByYear(googleRoadmap, BUILT_UP_TO),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.superconducting,
        reference: "Sycamore (2019) and Willow (2024).",
        provenance: "vendor-published",
    },
    {
        hardwareName: "Rigetti (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 6,
        costFactor: null,
        quantumImprovementRate: 0,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
        roadmap: rigettiRoadmap,
        dataPointTypes: typesByYear(rigettiRoadmap, BUILT_UP_TO),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.superconducting,
        reference: "https://thequantuminsider.com/2026/11/11/rigetti-q3-2026-results-quantum-computing-roadmap/",
        provenance: "vendor-published",
    },
    {
        hardwareName: "IQM (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 6,
        costFactor: null,
        quantumImprovementRate: 0,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
        roadmap: iqmRoadmap,
        dataPointTypes: typesByYear(iqmRoadmap, BUILT_UP_TO),
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
        quantumImprovementRate: 0,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
        roadmap: ionqRoadmap,
        dataPointTypes: typesByYear(ionqRoadmap, BUILT_UP_TO),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.trappedIon,
        reference: "https://www.ionq.com/roadmap",
        provenance: "vendor-published",
    },
    {
        hardwareName: "Quantinuum (Trapped Ion)",
        penaltyInput: "1",
        processors: 5,
        hardwareSlowdown: 8.48,
        costFactor: null,
        quantumImprovementRate: 0,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
        roadmap: quantinuumRoadmap,
        dataPointTypes: typesByYear(quantinuumRoadmap, BUILT_UP_TO),
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
        quantumImprovementRate: 0,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
        roadmap: queraRoadmap,
        dataPointTypes: typesByYear(queraRoadmap, BUILT_UP_TO),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.neutralAtom,
        reference: "https://quantumcomputingreport.com/quera-updates-neutral-atom-quantum-roadmap-with-2028-fault-tolerant-launch-on-amazon-braket/",
        provenance: "vendor-published",
    },
    {
        hardwareName: "Pasqal (Neutral Atom)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 7.4,
        costFactor: null,
        quantumImprovementRate: 0,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
        roadmap: pasqalRoadmap,
        dataPointTypes: typesByYear(pasqalRoadmap, BUILT_UP_TO),
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
        quantumImprovementRate: 0,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 0,
        roadmap: infleqtionRoadmap,
        dataPointTypes: typesByYear(infleqtionRoadmap, BUILT_UP_TO),
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: defaultAdvancedSlowdown.neutralAtom,
        reference: "https://thequantuminsider.com/2026/09/24/infleqtion-achieves-30-entangled-logical-qubits-on-its-sqale-quantum-computer/",
        provenance: "third-party",
    },
];

export const PRESET_NAMES = new Set(PRESETS.map(h => h.hardwareName));
