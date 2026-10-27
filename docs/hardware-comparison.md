# Hardware comparison page

The "Hardware Comparison" page (top bar, `#hardware`) compares every hardware
over time on one problem.

- **Problem:** starts on the calculator's first problem and follows it until a
  problem is picked on this page.
- **Quantum algorithm:** "Best for each hardware" (the default) or one
  algorithm used on every hardware.
- **Classical algorithm:** "Fastest classical" (the default) or one algorithm.
- **Hardware:** a checkbox list grouped by technology, all ticked to start,
  with Select all and Clear. Clicking a legend entry unticks that hardware.
- **Speed / Cost:** whether "beats classical" means faster (runtime with the
  hardware slowdown) or cheaper (work with the cost factor). Speed is the
  default.
- **x-axis:** years, from this year to 15 years out (2026–2041 in 2026).
- **One line per hardware:** every preset and the user's own hardware (see
  below). Colour shows the technology (superconducting, trapped ion, neutral
  atom, semiconductor, other) and the dash pattern shows the vendor.
- **y-axis:** the largest problem the hardware can run that year, divided by
  the smallest problem where quantum beats classical (log scale). It's the gap
  between the feasibility line and the advantage line on the QEA graph. A line
  crosses 1× in that hardware's QEA year, which is marked with a dot. The
  legend gives each hardware's QEA year.
- **Table view:** hardware, algorithm, its complexity and the QEA year.
- **Links:** the choices are kept in the page address (`?compare=...`), so a
  reload keeps them. "Copy link to this comparison" also carries the user's
  own hardware that is shown, so the person opening it sees the same lines.

Code: `src/components/HardwareComparisonPage.vue` (page and choices),
`src/store/comparison.js` (the choices and the link), `src/store/hardwareComparison.js`
(calculation, run in a web worker), `src/components/HardwareComparisonGraph.vue`
(graph), and `src/store/qea.js` (QEA math shared with the other graphs).

## The user's own hardware

Changing any hardware setting of a preset in the calculator (roadmap,
slowdown, qubit ratio, penalty, cost, ...) makes a copy of it named after it,
"IBM 2025 (edited)", then "(edited 2)", and selects it. Further changes edit
that copy. Imported roadmaps are the user's own hardware too. Under the
hardware dropdown, the user can rename or delete their own hardware. Models
using deleted hardware switch back to the preset it was copied from.

The user's hardware is saved in the browser (`localStorage`), so it is there
after a reload, and appears on the comparison page with the presets. A copy
keeps its preset's technology, so it is grouped and coloured with it. Share
links (calculator and comparison) carry the settings of the user's hardware
they use. Opening one adds that hardware to the receiver's list, renamed if
the name is taken by different hardware.

Code: `src/store/hardwares.js` (the list and its storage),
`src/store/hardwarePresets.js` (the presets), `src/store/urlState.js` (links).

## Roadmap notation

The Edit roadmap chart and the Quantum Timelines chart draw roadmaps the same
way (`src/store/roadmapNotation.js`):

- **Filled dot:** demonstrated, a machine that exists.
- **Hollow dot:** projected, on the vendor's roadmap.
- **Solid line:** between roadmap points.
- **Dashed line:** extrapolated outside the roadmap.
- **Colour:** physical qubits light red, logical qubits dark red.
- **Labels:** counts as powers of ten (10^4), years as whole years.

A roadmap counted in logical qubits has no physical qubits line in Quantum
Timelines. It used to draw its logical counts as a "Physical Qubits" line.

## Why this y-axis

Two other options were considered:

- **The QEA graph's own speed and cost lines** (the problem size where quantum
  starts to win). On their own, they depend only on the hardware's slowdown
  and penalty, not its qubit roadmap. All four superconducting presets would
  draw the same line, and the line wouldn't show when QEA happens. Dividing the
  feasible size by that line's size keeps the QEA graph's quantities and puts
  them on one line per hardware.
- **How many times faster or cheaper quantum is on the largest problem it can
  run.** This grows far too fast to read on one axis. For Integer
  Factorization it reaches 10^39,663× on QuEra by 2041.

The y-axis is capped at 10^12×. Lines that go past it (e.g. Database Search,
where n = 2^qubits) leave the top of the plot.

## Modelling choices

These are kept out of the UI on purpose.

- **One algorithm per hardware:** the quantum algorithm that reaches QEA first
  on that hardware. If none does, it's the one with the most headroom at the
  end of the period. Picking the best algorithm year by year was checked for
  every problem, preset, speed and cost (198 cases). It changes in two:
  String Search on IonQ and Quantinuum around 2040, where two algorithms are
  within 0.03 orders of magnitude of each other, far below 1×. So it would
  draw the same lines.
- **Same version of the problem on both sides:** candidates on both sides are
  limited to the problem's own Variation or the general problem. Variations
  are compared by meaning, as the sheet sync does
  (`src/store/sheetSync/variations.js`), so "Nonnegative Weights (Adjacency
  List Model)" still matches "Nonnegative Weights". Without this, algorithms
  for easier problems won: Max-Weight Clique for Clique, undirected connected
  components for Strongly Connected Components, MST verification for Minimum
  Spanning Tree, and DAGs for Shortest Path.
- **Quantum candidates:** the problem's quantum algorithms that the calculator
  can evaluate, minus approximate and heuristic-based ones. The calculator's
  default is always included. These are also the choices in the Quantum
  algorithm dropdown.
- **Classical baseline:** "Fastest classical" is the single classical
  algorithm whose runtime grows slowest as n grows (with p = 1). The pool is
  the problem's classical algorithms minus approximate, heuristic-based and
  parallel ones (so special cases such as planar graphs or non-comparison
  sorts don't win). The default is always included. The Classical algorithm
  dropdown offers the same pool.
- **Hardware lines:** each line is the problem with its recommended
  algorithms and that hardware's settings applied, exactly as picking it in
  the calculator's hardware dropdown does. There is no maximum compute time.
- **Qubits:** each quantum algorithm uses its own qubits-needed formula from
  the sheet, falling back to the problem's.
- **Gaps:** a year where quantum doesn't win at any problem size has no point,
  so the line has a gap.

## Speed

Every candidate is evaluated on every hardware, twice a year, plus its QEA
years: up to a few seconds for Integer Factorization (14 algorithms). It runs
in a web worker so the page stays responsive, and uses a faster search than
the main QEA graph. Problem size is searched in log10(n) from the bottom up,
and the year to about a day. Across all problems, presets and candidate
algorithms, the QEA years match the main graph's calculation to within 0.05
years in 597 of 606 checks (576 within 0.01). The other nine are QEA years
after 2070, well past the graph, for algorithms that aren't picked.

## Known limitations

- **Constant-factor "speedups":** when the quantum and classical runtimes have
  the same growth (e.g. Sorting, n log n on both sides), the result is
  floating-point noise. The slowdown and processor terms shrink over time until
  the two sides are exactly equal. This affects the main QEA graph the same way.
- **Sheet data:** the graph shows whatever the sheet says. For Integer
  Factorization, the "Brenner et al. (2025)" row is O((log n)²) with n = bits,
  so it's the best algorithm on every hardware. That looks like n meaning the
  integer itself (so log n = bits). It's worth checking with the sheet owner.
  For String Search, Montanaro (2014) is the best on 6 of 9 presets for
  speed. Its sheet formula has a sqrt(n/m) factor, which is the constant 3
  with the pattern length m = n/9, so it grows slower than any polynomial.
  That paper's result is for average-case (random) text, while the classical
  baseline is worst-case.
- **Formulas undefined for tiny inputs:** the QEA search starts at n = 2. Some
  formulas aren't defined there (log(n/9) is negative below n = 9; 2n − 5
  qubits is negative at n = 2), which used to fail the whole calculation, in
  the main QEA graph too. The search now starts at the first size where both
  formulas are defined. This brought in four String Search algorithms
  (Montanaro, Niroula & Nam, Ramesh & Vinay, Ablayev et al.) and the
  Grover-based factoring algorithm.
