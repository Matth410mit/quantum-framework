# Model decisions

Modelling choices that change the calculator's answers, why they were made, and
what to keep in mind if they are revisited. Newest first.

## 6. Cost factor computed from the hardware; classical machine fixed (Nov 19, 2026)

**Decision.** The cost factor is computed for each hardware and year unless the
user sets one with the slider. In log10:

    cf(t) = hws(t) + p - log10 L(t)

`hws(t)` is the hardware slowdown that year, `p` the processors setting and
`L(t)` the logical qubits available that year (at least 1). One logical step
costs the whole machine's price for that step, and its logical qubits share it.
The machine's price is `p`: it costs as much as 10^p classical cores. A value
the user sets works as before, changing by the cost improvement rate each year.

The comparably priced classical machine (10^p processors) is now the same size
every year. The cost improvement rate used to shrink it too, by 10% a year, in
both the speed and cost comparisons.

**Before.** 10^8 for every preset, falling 10% a year. It had no source. It
started as 1,000 in June 2024, became 10^8 in July 2024 when the input moved to
powers of ten, and was kept when the cost comparison moved from machine steps
to logical-qubit steps in Nov 2024.

**Why.** IBM's list price was $1.60 a second in April 2022 for a 27-qubit
machine and is still $1.60 a second ($96 a minute) in 2026 for 156 qubits.
- The machine's price hasn't moved, so the classical machine priced like it
  shouldn't shrink. $1.60 a second buys about 130,000 cloud vCPUs at $0.0446
  per vCPU-hour (AWS c7i), which matches the default of 10^5.
- The price per qubit fell about 30% a year as machines grew, which the
  formula follows through `L(t)`. A fixed 10% a year did not.

**Where.** `costFactorFunction` and `slowdownFunction` in `src/store/qea.js`.
`costFactor: null` in the presets and the starting model means computed. The
cost slider in `Form.vue` shows this year's computed value without saving it;
moving the slider or typing a value saves it (an edit to the hardware), and
"Use computed" goes back. The cost improvement rate box is disabled while the
value is computed.

**Values.** Computed cost factor in 2026 / 2033 / 2041: IBM 11.0 / 8.7 / 6.7,
IonQ 13.5 / 12.1 / 10.1, QuEra 11.4 / 9.7 / 7.7.

**Effect.** With decisions 3 to 5, factoring speed / cost QEA:

| Hardware | Before | After |
|---|---|---|
| IBM 2025 | 2032.6 / 2032.1 | 2039.1 / 2038.0 |
| Google | 2041.1 / 2040.3 | 2044.6 / 2043.5 |
| Rigetti | 2041.4 / 2040.7 | 2045.1 / 2043.9 |
| IQM | 2031.0 / 2030.7 | 2034.2 / 2033.1 |
| IonQ | 2032.9 / 2031.7 | 2044.0 / 2042.9 |
| Quantinuum | 2033.5 / 2032.4 | 2045.0 / 2044.0 |
| QuEra | 2029.5 / 2028.9 | 2036.9 / 2035.9 |
| Pasqal | 2034.3 / 2033.6 | 2039.3 / 2038.3 |
| Infleqtion | 2031.0 / 2030.2 | 2044.1 / 2043.1 |

Over the 9 presets and 21 problems with recommended algorithms, speed QEA by
2041 goes from 58 pairs to 44 and cost QEA from 52 to 41. Speed QEA before 3000
goes from 117 to 105: with the classical machine no longer shrinking, problems
with a small speedup (Nearest Neighbor Search on superconducting, Sorting on
IonQ) no longer reach it.

**Keep in mind.**

- Speed and cost QEA now land close together for most problems. When quantum
  work is runtime x qubits, a problem that fills the machine costs the
  machine's price for its runtime, just like the classical machine. They differ
  where the work formulas differ (Time Dependent Hartree-Fock: cost much later).
- A machine with fewer logical qubits than 1 counts as 1, so until the roadmap
  passes 1,000 physical qubits (IBM: about 2028) the cost factor falls only
  with the slowdown.
- The price evidence is IBM's list price from 2022 to 2026. Every vendor uses
  the same 10^5 for now; the others price per shot or per gate.
- Hardware saved before this change keeps its typed cost factor (8) and shows
  "Use computed".

## 5. Neutral-atom hardware slowdown: 10^7.4 (Nov 19, 2026)

**Decision.** QuEra, Pasqal and Infleqtion use 10^7.4 instead of 10^5.1.

**Why.** An error-corrected computer is paced by its correction rounds, not a
single laser pulse. Harvard and QuEra's 2025 experiment (arXiv 2506.20661)
measured 4.45 ms per round and 0.655 ms per transversal CNOT. A logical gate is
about one round plus one CNOT, 5 ms, which is 2.5 x 10^7 cycles of a 5 GHz CPU.
Transversal gates need about one round each, so there is no extra gate
overhead. The authors estimate their logical steps are 10 to 20 times slower
than a superconducting chip's, which gives 10^7.0 to 10^7.3 next to 10^6, so
the two estimates agree.

**Before.** A 250 ns gate times 100 gates of overhead, 10^5.1, which made
neutral atoms look faster than superconducting hardware.

**Where.** `hardwareSlowdown: 7.4` and `defaultAdvancedSlowdown.neutralAtom`
(`gateTime: 5000000`, `speed: 25000000`, `gateOverhead: 1`) in
`src/store/hardwarePresets.js`. Simple and Manual mode in the slowdown dialog
both give 7.4.

**Effect.** Factoring moves about 0.6 years. Problems with a small speedup move
more (QuEra, Time Dependent Hartree-Fock: about 5 years).

**Keep in mind.** It rests on one experiment. Faster atom moves and readout
would lower it; `quantumImprovementRate` already lowers it 10% a year.

The slowdown dialog's speed-ratio slider now moves in powers of ten (0 to 9),
so the trapped-ion (3,000,000) and neutral-atom (25,000,000) ratios are
reachable. The box still holds the exact ratio and the saved format is
unchanged.

## 4. Pasqal and Infleqtion counted in physical qubits (Nov 19, 2026)

**Decision.** Both roadmaps are now physical-qubit roadmaps and get the same
ratio as everyone else.

**Why.** Their published "logical qubits" use very small codes. Infleqtion's 30
logical qubits used 80 atoms, under 3 each, too few to correct errors through a
long algorithm. Counting them as logical qubits made these two the most
optimistic presets once everyone else moved to 1,000:1.

**Where.** `src/store/hardwarePresets.js`.
- Infleqtion: its logical targets converted at its 80:30, giving 80 (2026),
  267 (2028) and 2,667 (2030) physical qubits.
- Pasqal: its roadmap's physical targets, 1,000 in 2025 and 10,000 in 2028.

**Effect.** Factoring speed QEA moves from 2034.3 to 2039.3 for Pasqal and from
2031.0 to 2044.1 for Infleqtion, together with decisions 3, 5 and 6.

**Keep in mind.** Infleqtion's only physical figure is that one demo; if it
moves to stronger codes it will need more atoms per logical qubit, so the 2028
and 2030 counts are estimates. Pasqal's roadmap contradicts itself (140 qubits
in 2025 and "200+" in 2027 elsewhere). Users can still switch either roadmap
back to logical qubits.

## 3. Physical-to-logical qubit ratio: 1,000, fixed (Nov 19, 2026)

**Decision.** Every preset uses 1,000 physical qubits per logical qubit with no
yearly change, as in the framework paper (arXiv 2310.15505, "no systematic
changes over time"). The floor a user-set decline can reach is now 25 instead
of 3.

**Before.** Ratios from 32 to 1,000 with no source, shrinking 10% to 23% a year
down to 3. By 2041 most presets were at the floor of 3.

**Why 1,000.** Published RSA-2048 estimates range from about 700 physical per
logical (Gidney 2025: 1,399 logical in under a million physical) to about 3,200
(Gidney and Ekera 2019: 20 million physical), and a surface code at 0.1% error
needs about 1,000 to 1,500 for large algorithms. **Why 25.** IBM's gross code,
one of the most efficient codes proposed, is 288 physical for 12 logical
(24:1); the smallest code that corrects any error needs 5.

**Where.** `physicalLogicalQubitsRatio: 1000, ratioImprovementRate: 0` in the
presets and `src/store/models.js`; `MINIMUM_PLQR` in `src/store/utils.js`,
used by `getLogicalQubits` (`qea.js`) and the ratio inputs in `Form.vue`.
`getAdjustedPLQR` (`roadmapSchema.js`) has the same 25 written out, since that
file has no imports.

**Effect.** On its own, factoring speed QEA moves from 2032.6 to 2038.9 for
IBM, 2032.9 to 2043.8 for IonQ and 2029.5 to 2036.2 for QuEra.

**Keep in mind.**

- One ratio for every modality. It is pessimistic for small problems and for
  vendors with more efficient codes, and optimistic for the largest ones.
  Working it out from each vendor's error rate and the problem's length would
  be better, and is a bigger change.
- A machine with fewer than 1,000 physical qubits counts as 1 logical qubit.
- Hardware saved before this change keeps its ratio and yearly change, now
  with the floor of 25. Roadmap files in format 1.0 still bring their own
  ratio, also floored at 25.

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
- **The other modalities.** Trapped ions use 600,000 ns (10^8.48). Neutral
  atoms used 250 ns (10^5.1) and looked better than they should; decision 5
  moved them to their error-correction round.
- **Cost.** `costFactor` was not changed here. Decision 6 now computes it
  from the slowdown, so it follows the 10^6.
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
