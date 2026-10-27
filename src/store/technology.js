// Hardware technologies, for grouping and colouring hardware. A preset's
// technology is its `technology` field when it has one (edited presets and
// imported roadmaps), otherwise read from its name: "IonQ (Trapped Ion)".

const TECHNOLOGIES = [
    { key: 'superconducting', label: 'Superconducting', match: /supercond/i },
    { key: 'trappedIon', label: 'Trapped ion', match: /trapped|ion trap/i },
    { key: 'neutralAtom', label: 'Neutral atom', match: /neutral|atom/i },
    { key: 'semiconductor', label: 'Semiconductor', match: /semicond|silicon|spin/i },
];

// Roadmap file modalities (roadmapSchema.js MODALITIES) -> technology keys.
const FROM_MODALITY = {
    superconducting: 'superconducting',
    'trapped-ion': 'trappedIon',
    'neutral-atom': 'neutralAtom',
    semiconductor: 'semiconductor',
};

// Superconducting, trapped ion, neutral atom, semiconductor, other.
export const TECHNOLOGY_ORDER = [...TECHNOLOGIES.map(t => t.key), 'other'];

// hardware: a preset, or just its name.
export function hardwareTechnology(hardware = '') {
    if (hardware && typeof hardware === 'object') {
        if (TECHNOLOGY_ORDER.includes(hardware.technology)) return hardware.technology;
        hardware = hardware.hardwareName || '';
    }
    const kind = /\(([^)]*)\)\s*$/.exec(hardware)?.[1] || hardware;
    return TECHNOLOGIES.find(t => t.match.test(kind))?.key || 'other';
}

export function technologyLabel(key) {
    return TECHNOLOGIES.find(t => t.key === key)?.label || 'Other';
}

export function technologyFromModality(modality) {
    return FROM_MODALITY[modality] || 'other';
}

// "IBM 2025 (Superconducting)" -> "IBM 2025". Other notes in brackets stay:
// "IBM 2025 (edited)".
export function nameWithoutTechnology(name = '') {
    const match = /\s*\(([^)]*)\)\s*$/.exec(name);
    if (!match || !TECHNOLOGIES.some(t => t.match.test(match[1]))) return name;
    return name.slice(0, match.index) || name;
}
