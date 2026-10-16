/**
 * Shareable links: the problem, algorithms and hardware of every model are kept
 * in the page URL (?setup=...), so copying the address shares the setup.
 *
 * Only those choices are stored. Sliders and other parameters start from the
 * hardware preset when a link is opened.
 */

import { findProblem, getDefaultAlgorithm } from './problemCatalog';

const PARAM = 'setup';

// The model fields a hardware preset sets (Form.vue applies the same ones
// when the hardware dropdown changes).
export function applyHardwareToModel(model, hardware) {
    model.hardwareName = hardware.hardwareName;
    model.penaltyInput = hardware.penaltyInput;
    model.processors = hardware.processors;
    model.hardwareSlowdown = hardware.hardwareSlowdown;
    model.physicalLogicalQubitsRatio = hardware.physicalLogicalQubitsRatio;
    model.quantumImprovementRate = hardware.quantumImprovementRate;
    model.roadmap = JSON.parse(JSON.stringify(hardware.roadmap));
    model.dataPointTypes = JSON.parse(JSON.stringify(hardware.dataPointTypes || {}));
    model.roadmapUnit = hardware.roadmapUnit;
    model.extrapolationType = hardware.extrapolationType;
    model.ratioImprovementRate = hardware.ratioImprovementRate;
    model.costFactor = hardware.costFactor;
    model.costImprovementRate = hardware.costImprovementRate;
    model.advancedSlowdown = hardware.advancedSlowdown;
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

// Formulas are stored only when they differ from the problem's recommended ones.
function encodeAlgorithm(problem, model, type) {
    const runtime = type === 'classical' ? model.classicalRuntimeInput : model.quantumRuntimeInput;
    const work = type === 'classical' ? model.classicalWork : model.quantumWork;
    const d = getDefaultAlgorithm(problem, type);
    if (d && d.runtimeFormula === runtime && d.workFormula === work) return undefined;
    return [runtime, work];
}

export function encodeSetup(models) {
    return toBase64Url(JSON.stringify(models.map(m => {
        const problem = findProblem(m.problemName);
        return {
            p: m.problemName,
            h: m.hardwareName,
            c: encodeAlgorithm(problem, m, 'classical'),
            q: encodeAlgorithm(problem, m, 'quantum'),
        };
    })));
}

// Rebuild models from a setup string. Unknown problems or hardware fall back
// to the template's. Returns null when the string can't be read.
export function decodeSetup(text, template, hardwares) {
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

        const hardware = hardwares.find(h => h.hardwareName === entry?.h);
        if (hardware) applyHardwareToModel(model, hardware);

        const problem = findProblem(entry?.p);
        if (problem) {
            model.problemName = problem.problemName;
            model.qubitToProblemSize = problem.qubitToProblemSize;
            const c = getDefaultAlgorithm(problem, 'classical');
            const q = getDefaultAlgorithm(problem, 'quantum');
            if (c) [model.classicalRuntimeInput, model.classicalWork] = [c.runtimeFormula, c.workFormula];
            if (q) [model.quantumRuntimeInput, model.quantumWork] = [q.runtimeFormula, q.workFormula];
        }
        if (Array.isArray(entry?.c) && entry.c.length === 2) {
            [model.classicalRuntimeInput, model.classicalWork] = entry.c.map(String);
        }
        if (Array.isArray(entry?.q) && entry.q.length === 2) {
            [model.quantumRuntimeInput, model.quantumWork] = entry.q.map(String);
        }
        return model;
    });
}

export function readSetupFromUrl(template, hardwares) {
    const text = new URLSearchParams(window.location.search).get(PARAM);
    return text ? decodeSetup(text, template, hardwares) : null;
}

// Keeps the URL in step with the models. The untouched starting setup gets a
// clean URL with no parameter.
export function writeSetupToUrl(models, template) {
    const url = new URL(window.location.href);
    const setup = encodeSetup(models);
    if (setup === encodeSetup([template])) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, setup);
    if (url.href !== window.location.href) {
        window.history.replaceState(window.history.state, '', url);
    }
}

export function shareLink(models) {
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM, encodeSetup(models));
    url.hash = '';
    return url.href;
}
