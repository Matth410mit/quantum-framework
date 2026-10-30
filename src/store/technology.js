// Hardware technologies, used to group and colour hardware. The technology
// comes from the hardware's `technology` field if it has one, and otherwise
// from its name, like "IonQ (Trapped Ion)".

const TECHNOLOGIES = [
    { key: 'superconducting', label: 'Superconducting', match: /supercond/i },
    { key: 'trappedIon', label: 'Trapped ion', match: /trapped|ion trap/i },
    { key: 'neutralAtom', label: 'Neutral atom', match: /neutral|atom/i },
    { key: 'semiconductor', label: 'Semiconductor', match: /semicond|silicon|spin/i },
];

// Maps roadmap file modalities (MODALITIES in roadmapSchema.js) to technology keys.
const FROM_MODALITY = {
    superconducting: 'superconducting',
    'trapped-ion': 'trappedIon',
    'neutral-atom': 'neutralAtom',
    semiconductor: 'semiconductor',
};

export const TECHNOLOGY_ORDER = [...TECHNOLOGIES.map(t => t.key), 'other'];

// hardware can be a preset or just its name.
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

// Removes the technology from a name, so "IBM 2025 (Superconducting)" becomes
// "IBM 2025". Other notes in brackets, like "(edited)", stay.
export function nameWithoutTechnology(name = '') {
    const match = /\s*\(([^)]*)\)\s*$/.exec(name);
    if (!match || !TECHNOLOGIES.some(t => t.match.test(match[1]))) return name;
    return name.slice(0, match.index) || name;
}
