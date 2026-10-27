# Hardware comparison graph

The "Hardware Comparison" section under each model shows, for that model's
problem, when every quantum algorithm reaches quantum economic advantage (QEA)
on every hardware preset.

- **x-axis:** the hardware presets (and imported roadmaps), plus a "Current
  inputs" column when the model's hardware settings no longer match the preset
  it started from.
- **y-axis:** the quantum algorithm's asymptotic runtime, from slowest-growing
  (bottom) to fastest-growing (top).
- **Dots:** one per quantum algorithm. The ringed dot is the algorithm that
  reaches QEA earliest on that hardware, labelled with its year. Colour shows
  how many years later than that the other algorithms get there (0 to 10+).
  Hollow grey dots never reach QEA before 3000.
- **Dashed line:** the complexity of the fastest classical algorithm, which is
  the classical side of every comparison.
- **Speed / Cost:** which QEA year ranks the algorithms (runtime with hardware
  slowdown, or work with the cost factor). Speed is the default.

Code: `src/store/hardwareComparison.js` (calculation),
`src/components/HardwareComparisonGraph.vue` (graph),
`src/store/qea.js` (QEA math shared with the other graphs).

## Modelling choices

These are kept out of the UI on purpose.

- **Quantum candidates:** the problem's quantum algorithms that the calculator
  can evaluate, minus approximate and heuristic-based ones. The calculator's
  default is always included. If the model's quantum formula isn't one of
  them (typed by hand), it's added as "Your formula", with the model's
  qubits-needed formula.
- **Classical baseline:** the single classical algorithm whose runtime grows
  slowest as n grows (with p = 1). The pool is the problem's classical
  algorithms minus approximate, heuristic-based and parallel ones, limited to
  the problem's own variation when it has one (so special cases such as planar
  graphs or non-comparison sorts don't win). The default is always included,
  and so is the model's own formula if typed by hand.
- **Hardware columns:** each column is a copy of the model with that preset's
  fields applied, exactly as picking it in the hardware dropdown does. The
  rest of the model (max compute time, ...) is kept.
- **Qubits:** each quantum algorithm uses its own qubits-needed formula from
  the sheet, falling back to the problem's.
- **Rows:** algorithms share a row when their runtimes are within a constant
  factor of each other (compared at n = 10^150 and 10^300), or when their
  Big-O labels are the same. Labels drop constant factors and lower-order
  terms (0.3 n³ + 0.005 n³ log n → O(n³ log n)); constants inside an exponent
  are kept, since they change the class.
- **"Already":** an algorithm that has QEA today is plotted at the current
  year.

## Speed

The comparison runs every candidate on every hardware (up to ~150 QEA
calculations for Integer Factorization), in a web worker so the page stays
responsive. It uses a faster search than the main QEA graph: problem size is
searched in log10(n) from the bottom up, and the year to about a day. Across
all problems and presets this matches the main graph's calculation to within
0.05 years in 631 of 634 checks (622 within 0.01). Of the other three, one is
off by 0.06 years and two are cases where quantum and classical differ only by
a constant factor (below), where neither calculation is meaningful.

## Known limitations

- **Constant-factor "speedups":** when the quantum and classical runtimes have
  the same growth (e.g. Sorting, n log n on both sides), the result depends on
  the slowdown and processor terms shrinking over time until the two are
  exactly equal, and the year that comes out is floating-point noise. This
  affects the main QEA graph the same way.
- **Sheet data:** the graph shows whatever the sheet says. For Integer
  Factorization, the "Brenner et al. (2025)" row is O((log n)²) with n = bits,
  which wins on every hardware. That looks like n meaning the integer itself
  (so log n = bits); worth checking with the sheet owner.
