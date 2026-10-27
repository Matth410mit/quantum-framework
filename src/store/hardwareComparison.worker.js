// Runs the hardware comparison off the main thread (it evaluates every
// quantum algorithm on every hardware preset, which takes up to a second).

import { compareHardware } from './hardwareComparison';
import { findProblem } from './problemCatalog';

self.onmessage = ({ data }) => {
    const { id, model, hardwares } = data;
    try {
        const result = compareHardware(model, findProblem(model.problemName), hardwares);
        self.postMessage({ id, result });
    } catch (err) {
        self.postMessage({ id, error: String(err?.message || err) });
    }
};
