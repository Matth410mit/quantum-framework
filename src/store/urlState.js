/**
 * Share links. Each model's problem, algorithms and hardware are saved in the
 * page URL (?setup=...), so copying the address shares the setup. The hardware
 * comparison page does the same with ?compare=...
 *
 * Only those choices are saved. Other settings come from the hardware preset
 * when the link is opened. Hardware the user made isn't on the other person's
 * computer, so its settings are included in the link.
 */

import { findProblem, getDefaultAlgorithm, qubitsNeededFor } from './problemCatalog';
import { PRESET_NAMES } from './hardwarePresets';
import { modelQubitsNeeded } from './utils';

const PARAM = 'setup';
const COMPARE_PARAM = 'compare';

// The model fields that come from a hardware preset. Changing any of them in
// the calculator makes an edited copy of the preset.
export const HARDWARE_MODEL_FIELDS = [
    'penaltyInput', 'processors', 'hardwareSlowdown', 'physicalLogicalQubitsRatio',
    'quantumImprovementRate', 'roadmap', 'dataPointTypes', 'roadmapUnit', 'extrapolationType',
    'ratioImprovementRate', 'costFactor', 'costImprovementRate', 'advancedSlowdown',
];

const OBJECT_FIELDS = new Set(['roadmap', 'dataPointTypes', 'advancedSlowdown']);

function copy(value) {
    return value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
}

export function applyHardwareToModel(model, hardware) {
    model.hardwareName = hardware.hardwareName;
    for (const field of HARDWARE_MODEL_FIELDS) {
        model[field] = copy(OBJECT_FIELDS.has(field) && field !== 'roadmap' ? hardware[field] || {} : hardware[field]);
    }
}

// Returns a copy of the hardware settings of a model or preset.
export function hardwareFieldsOf(source) {
    return Object.fromEntries(HARDWARE_MODEL_FIELDS.map(field => [field, copy(source?.[field])]));
}

// Inputs can hold numbers as text, like "3.5" from a slider.
function sameValue(a, b) {
    if (a === b) return true;
    if (a == null || b == null || a === '' || b === '') return false;
    const x = Number(a), y = Number(b);
    return Number.isFinite(x) && x === y;
}

function sameObject(a, b) {
    const x = a || {}, y = b || {};
    const keys = Object.keys(x);
    return keys.length === Object.keys(y).length && keys.every(k => sameValue(x[k], y[k]));
}

// True when two models or presets have the same hardware settings.
export function sameHardwareFields(a, b) {
    return !!a && !!b && HARDWARE_MODEL_FIELDS.every(field => OBJECT_FIELDS.has(field)
        ? sameObject(a[field], b[field])
        : sameValue(a[field], b[field]));
}

// What a link includes for hardware the user made: its settings and the
// preset it came from.
function shareableHardware(saved, model = saved) {
    const fields = hardwareFieldsOf(model);
    for (const key of ['technology', 'basedOn', 'reference', 'provenance']) {
        if (saved?.[key] != null) fields[key] = saved[key];
    }
    return fields;
}

function isSharedHardware(value) {
    return !!value && typeof value === 'object' && !!value.roadmap && typeof value.roadmap === 'object';
}

function toBase64Url(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach(b => { binary += String.fromCharCode(b); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text) {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
}

// Formulas are only saved when they differ from the problem's defaults.
function encodeAlgorithm(problem, model, type) {
    const runtime = type === 'classical' ? model.classicalRuntimeInput : model.quantumRuntimeInput;
    const work = type === 'classical' ? model.classicalWork : model.quantumWork;
    const d = getDefaultAlgorithm(problem, type);
    if (d && d.runtimeFormula === runtime && d.workFormula === work) return undefined;
    return [runtime, work];
}

// Qubits needed is only saved when it differs from the default.
function encodeQubits(problem, model) {
    const qubits = modelQubitsNeeded(model);
    return problem && qubits === qubitsNeededFor(problem, getDefaultAlgorithm(problem, 'quantum')) ? undefined : qubits;
}

// hardwares is all of the user's hardware, so their own can be included.
export function encodeSetup(models, hardwares = []) {
    return toBase64Url(JSON.stringify(models.map(m => {
        const problem = findProblem(m.problemName);
        return {
            p: m.problemName,
            h: m.hardwareName,
            hw: PRESET_NAMES.has(m.hardwareName)
                ? undefined
                : shareableHardware(hardwares.find(h => h.hardwareName === m.hardwareName), m),
            c: encodeAlgorithm(problem, m, 'classical'),
            q: encodeAlgorithm(problem, m, 'quantum'),
            k: encodeQubits(problem, m),
        };
    })));
}

// Rebuilds models from a setup string. Unknown problems or hardware fall back
// to the template. Hardware from the link is passed to adopt, which saves it.
// Returns null if the string can't be read.
export function decodeSetup(text, template, hardwares, adopt = null) {
    let entries;
    try {
        entries = JSON.parse(fromBase64Url(text));
    } catch {
        return null;
    }
    if (!Array.isArray(entries) || entries.length === 0) return null;

    return entries.map((entry, i) => {
        const model = JSON.parse(JSON.stringify(template));
        model.id = i + 1;

        let hardware = hardwares.find(h => h.hardwareName === entry?.h);
        if (adopt && isSharedHardware(entry?.hw) && typeof entry.h === 'string') {
            hardware = adopt({ ...entry.hw, hardwareName: entry.h });
        }
        if (hardware) applyHardwareToModel(model, hardware);

        const problem = findProblem(entry?.p);
        if (problem) {
            model.problemName = problem.problemName;
            const c = getDefaultAlgorithm(problem, 'classical');
            const q = getDefaultAlgorithm(problem, 'quantum');
            model.qubitsNeeded = qubitsNeededFor(problem, q);
            if (c) [model.classicalRuntimeInput, model.classicalWork] = [c.runtimeFormula, c.workFormula];
            if (q) [model.quantumRuntimeInput, model.quantumWork] = [q.runtimeFormula, q.workFormula];
        }
        if (Array.isArray(entry?.c) && entry.c.length === 2) {
            [model.classicalRuntimeInput, model.classicalWork] = entry.c.map(String);
        }
        if (Array.isArray(entry?.q) && entry.q.length === 2) {
            [model.quantumRuntimeInput, model.quantumWork] = entry.q.map(String);
        }
        if (typeof entry?.k === 'string' && entry.k) model.qubitsNeeded = entry.k;
        return model;
    });
}

export function readSetupFromUrl(template, hardwares, adopt = null) {
    const text = new URLSearchParams(window.location.search).get(PARAM);
    return text ? decodeSetup(text, template, hardwares, adopt) : null;
}

// Keeps the URL up to date with the models. If nothing has changed from the
// start, the URL stays clean.
export function writeSetupToUrl(models, template, hardwares = []) {
    const url = new URL(window.location.href);
    const setup = encodeSetup(models, hardwares);
    if (setup === encodeSetup([template])) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, setup);
    if (url.href !== window.location.href) {
        window.history.replaceState(window.history.state, '', url);
    }
}

export function shareLink(models, hardwares = []) {
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM, encodeSetup(models, hardwares));
    url.searchParams.delete(COMPARE_PARAM);
    url.hash = '';
    return url.href;
}

// Hardware comparison page
//
// state holds problemName, quantumKey, classicalKey, mode ('speed' or 'cost')
// and shown (the hardware names shown, or null for all). A null problem or
// algorithm means the default.

function encodeComparison(state, hardwares = []) {
    const shared = hardwares.filter(h => !PRESET_NAMES.has(h.hardwareName)
        && (!state.shown || state.shown.includes(h.hardwareName)));
    return toBase64Url(JSON.stringify({
        p: state.problemName || undefined,
        q: state.quantumKey || undefined,
        c: state.classicalKey || undefined,
        m: state.mode === 'cost' ? 'cost' : undefined,
        s: state.shown || undefined,
        hw: shared.length ? shared.map(h => ({ ...shareableHardware(h), hardwareName: h.hardwareName })) : undefined,
    }));
}

// Returns the state, or null if there is none or it can't be read. Hardware
// from the link is passed to adopt, as in decodeSetup.
export function readComparisonFromUrl(adopt = null) {
    const text = new URLSearchParams(window.location.search).get(COMPARE_PARAM);
    if (!text) return null;
    let entry;
    try {
        entry = JSON.parse(fromBase64Url(text));
    } catch {
        return null;
    }
    if (!entry || typeof entry !== 'object') return null;
    const renamed = new Map();
    if (adopt && Array.isArray(entry.hw)) {
        for (const hw of entry.hw) {
            if (!isSharedHardware(hw) || typeof hw.hardwareName !== 'string') continue;
            renamed.set(hw.hardwareName, adopt(hw).hardwareName);
        }
    }
    const nonEmpty = value => (typeof value === 'string' && value ? value : null);
    return {
        problemName: nonEmpty(entry.p),
        quantumKey: nonEmpty(entry.q),
        classicalKey: nonEmpty(entry.c),
        mode: entry.m === 'cost' ? 'cost' : 'speed',
        shown: Array.isArray(entry.s)
            ? entry.s.filter(name => typeof name === 'string').map(name => renamed.get(name) || name)
            : null,
    };
}

// The page URL only names the hardware, since the user's own hardware is
// saved in the browser. Default choices are left out of the URL.
export function writeComparisonToUrl(state) {
    const url = new URL(window.location.href);
    const empty = !state.problemName && !state.quantumKey && !state.classicalKey && state.mode !== 'cost' && !state.shown;
    if (empty) url.searchParams.delete(COMPARE_PARAM);
    else url.searchParams.set(COMPARE_PARAM, encodeComparison(state));
    if (url.href !== window.location.href) {
        window.history.replaceState(window.history.state, '', url);
    }
}

// A link that opens the comparison with these choices, including any of the
// user's own hardware that it shows.
export function comparisonLink(state, hardwares = []) {
    const url = new URL(window.location.href);
    url.searchParams.set(COMPARE_PARAM, encodeComparison(state, hardwares));
    url.searchParams.delete(PARAM);
    url.hash = 'hardware';
    return url.href;
}
