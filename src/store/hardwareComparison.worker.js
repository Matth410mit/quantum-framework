// Runs the hardware comparison off the main thread (it evaluates every
// quantum algorithm on every hardware preset for every half year, which takes
// a few seconds for problems with many algorithms).

import { compareHardwareOverTime } from './hardwareComparison';
import { findProblem } from './problemCatalog';

self.onmessage = ({ data }) => {
    const { id, model, hardwares } = data;
    try {
        const result = compareHardwareOverTime(model, findProblem(model.problemName), hardwares);
        self.postMessage({ id, result });
    } catch (err) {
        self.postMessage({ id, error: String(err?.message || err) });
    }
};
