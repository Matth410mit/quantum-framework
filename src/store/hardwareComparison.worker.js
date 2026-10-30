// Runs the hardware comparison in the background so the page doesn't freeze.
// It can take a few seconds for problems with many algorithms.

import { compareHardwareOverTime } from './hardwareComparison';
import { findProblem } from './problemCatalog';

self.onmessage = ({ data }) => {
    const { id, model, hardwares, options } = data;
    try {
        const result = compareHardwareOverTime(model, findProblem(model.problemName), hardwares, options);
        self.postMessage({ id, result });
    } catch (err) {
        self.postMessage({ id, error: String(err?.message || err) });
    }
};
