# Model decisions

Modelling choices that change the calculator's answers, why they were made, and
what to keep in mind if they are revisited. Newest first.

## 3. Physical-to-logical qubit ratio (open)

Not decided yet. The question: should the ratio of physical to logical qubits
start near 1,000 and stay there, as in the framework paper (arXiv 2310.15505,
"no systematic changes over time"), or start lower and shrink every year, as
the presets do now (IBM 264 and IQM, IonQ, Quantinuum and QuEra 100 or less,
shrinking 23% a year down to the floor of 3)?

Under today's presets most hardware reaches the floor of 3 by 2041, which no
error-correction scheme published so far supports (IBM's gross code is 288
physical for 12 logical, 24:1; surface codes are several hundred to 1,000+).
Recommendation: 1,000, fixed. With it, factoring QEA moves to IBM 2037.3,
IQM 2033.2, IonQ 2036.9, Quantinuum 2038.1 and QuEra 2030.0 (before decisions
1 and 2 below).

## 2. Superconducting hardware slowdown: 10^6 (Nov 17, 2026)

**Decision.** The superconducting presets (IBM 2025, Google, Rigetti, IQM) and
the calculator's starting model use a hardware slowdown of 10^6, the paper's
base case: a speed ratio of 10^4 times 100 physical gates per logical gate
(Sec. III-C). The paper takes IBM's 555 ns gate, about 2,800 cycles of a 5 GHz
CPU, and rounds the ratio up to 10^4.

**Before.** 10^3.78: a 12 ns gate (Google's 2019 Sycamore gate) at 5 GHz is a
ratio of 60, times 100.

**Where.** `hardwareSlowdown: 6` in `src/store/hardwarePresets.js` and
`src/store/models.js`; `defaultAdvancedSlowdown.superconducting` is
`{ gateTime: 555, cpuGHz: 5, speed: 10000, gateOverhead: 100 }`. The model
template must stay identical to the IBM 2025 preset, or the starting model
shows as an "(edited)" copy.

**Effect.** Small for most problems because the qubit roadmap decides QEA, but
not everywhere (IBM, with the 1.6x growth of decision 1):

| Problem | 10^3.78 | 10^6 |
|---|---|---|
| Integer Factorization | 2032.3 | 2032.6 |
| Database Search | 2028.9 | 2029.0 |
| Traveling Salesman | 2029.7 | 2030.0 |
| Subset Sum | 2029.1 | 2029.4 |
| Clique | 2035.6 | 2036.2 |
| Hartree-Fock (Quantum Chemistry) | 2030.3 | 2034.2 |
| Maximum Cut | 2043.7 | 2045.8 |
| Nearest Neighbor Search | 2135.3 | 2157.1 |
| Maximum Flow | 2126.3 | 2143.1 |

Problems with a small quantum speedup (Hartree-Fock, Maximum Cut, the
polynomial ones at the bottom) are the ones that move.

**Keep in mind.**

- **Manual mode disagrees.** In the slowdown dialog, Simple mode uses the
  10^4 ratio and gives 10^6. Manual mode multiplies gate time by CPU speed,
  555 ns x 5 GHz = 2,775, and gives 10^5.44. Someone switching to Manual will
  see the slowdown drop. Rounding up is the paper's choice; we kept the real
  gate time rather than invent one that multiplies out to 10^4.
- **It is conservative for today's machines.** IBM Heron r2 two-qubit gates
  are about 68 ns and Google's about 32 ns. Using error-correction cycles
  instead (Willow's 1.1 µs surface-code cycle) gives about 10^5 to 10^6. If the
  paper's number is later dropped, a gate-time estimate for 2025 hardware
  lands near 10^4.5 to 10^5.
- **It still shrinks.** `quantumImprovementRate` (-10% a year) lowers the
  slowdown every year from the current year, as before.
- **The other modalities were not changed.** Trapped ions use 600,000 ns
  (10^8.48) and neutral atoms 250 ns (10^5.1), both from gate times. Next to
  superconducting's rounded-up number, neutral atoms may now look better than
  they should; if they get the same treatment, it should be from their
  error-correction cycle.
- **Cost is separate.** `costFactor` (10^8 for superconducting) was not
  changed.
- **Saved and shared hardware.** Hardware the user saved or edited before the
  change keeps 10^3.78 in the browser. Share links name presets, so an old
  link opens with 10^6; a link carrying the user's own hardware keeps its
  values.
- **Dead code.** `freeInput.js`, `newAnalysis.js`, `toy.js`,
  `problemAnalysis.js`, `analysis.js` and `graph.js` in `src/store` still say
  3.78. Nothing imports them.

## 1. Roadmap growth after the last point: 1.6x a year (Nov 17, 2026)

**Decision.** Past a roadmap's last point, every exponential roadmap grows by
the same 1.6x a year (`ROADMAP_GROWTH_PER_YEAR` in `src/store/utils.js`).
Between points nothing changed: exponential roadmaps interpolate in log space.
Linear roadmaps still continue their last step.

**Before.** Each roadmap continued the growth of its last two points. The last
step varied from 1.15x a year (Google) to 4.6x (IQM), and that one step set the
hardware's pace for decades, so the comparison ranked vendors by how their
roadmap happened to end.

**Why 1.6.** It is the paper's IBM projection (10^5 qubits in 2033 and 10^8 in
2049, 1.54x to 1.74x a year), and close to the largest machine's growth from
2016 to 2026 (1.73x a year).

**Backtest.** From each vendor's largest machine per year (Wikipedia list of
quantum processors, 6 vendors with 3 or more years, 55 predictions), each rule
predicted later years from the years before. Errors in orders of magnitude:

| Rule | Median error | Mean error | Bias | Worst |
|---|---|---|---|---|
| Last two points (before) | 0.48 | 0.79 | +0.36 | 4.64 |
| Fit through all points | 0.27 | 0.67 | +0.36 | 4.64 |
| Shared 1.3x | 0.19 | 0.30 | +0.03 | 1.31 |
| Shared 1.45x | 0.28 | 0.36 | +0.19 | 1.45 |
| **Shared 1.6x (chosen)** | 0.34 | 0.45 | +0.34 | 1.58 |
| Shared 2.0x | 0.51 | 0.70 | +0.67 | 1.93 |

A shared rate beats the last step at every rate up to 2x, mostly by never
making the 4.6-order mistakes. History alone favours a slightly lower rate
(1.3x to 1.45x), because qubit counts stalled from 2023 to 2026 while vendors
worked on error rates. 1.6x was kept because it matches the paper and the
longer frontier trend; it overpredicts the last few years by about a third of
an order of magnitude.

**Effect on factoring QEA** (Shor's vs GNFS, calculator defaults, slowdown
10^6):

| Hardware | Last step (before) | 1.3x | 1.45x | **1.6x** | 2.0x |
|---|---|---|---|---|---|
| IBM 2025 | 2032.6 | 2032.6 | 2032.6 | 2032.6 | 2032.6 |
| Google | 2063.4 | 2050.4 | 2044.5 | 2041.1 | 2036.4 |
| Rigetti | 2052.1 | 2051.0 | 2045.0 | 2041.4 | 2036.6 |
| IQM | 2031.0 | 2031.0 | 2031.0 | 2031.0 | 2031.0 |
| IonQ | 2031.2 | 2034.8 | 2033.6 | 2032.9 | 2031.8 |
| Quantinuum | 2032.1 | 2035.5 | 2034.2 | 2033.5 | 2032.5 |
| QuEra | 2027.8 | 2030.8 | 2030.0 | 2029.5 | 2028.7 |
| Pasqal | 2032.9 | 2037.5 | 2035.4 | 2034.3 | 2032.9 |
| Infleqtion | 2030.4 | 2031.7 | 2031.2 | 2031.0 | 2030.7 |

IBM and IQM reach QEA inside their roadmaps, so the rate doesn't matter for
them. Over all 9 presets and the 21 problems with recommended algorithms,
58 problem-hardware pairs reach QEA by 2041 with 1.6x, against 54 before, 46
with 1.3x, 56 with 1.45x and 65 with 2.0x.

**Keep in mind.**

- One rate for every vendor and modality. A vendor whose own roadmap grows
  faster or slower is pulled to 1.6x after its last point.
- The rate starts at each roadmap's last year, so a roadmap ending in 2028
  gets more years at 1.6x than one ending in 2033.
- If qubit counts keep stalling, lower the rate (1.45x is the backtest's best
  rate that is still close to the paper).
- Users can't change the rate in the calculator. Adding a point far in the
  future is the way to give one roadmap its own growth.
