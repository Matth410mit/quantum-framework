# Hardware comparison page

The "Hardware Comparison" page (top bar, `#hardware`) compares every hardware
over time on one problem, in two graphs: how far the largest problem each
hardware can run is past the smallest problem where quantum wins, and under
it the largest problem each hardware can run. The controls apply to both.

- **Problem:** starts on the calculator's first problem and follows it until a
  problem is picked on this page.
- **Quantum algorithm:** one algorithm, used on every hardware. It starts on
  the recommended one, which is listed first and marked "Recommended".
- **Classical algorithm:** starts on the recommended one (the fastest
  classical algorithm), also listed first and marked.
- **Hardware:** a checkbox list grouped by technology, all ticked to start,
  with Select all and Clear. Clicking a legend entry unticks that hardware.
- **Speed / Cost:** whether "beats classical" means faster (runtime with the
  hardware slowdown) or cheaper (work with the cost factor). Speed is the
  default.
- **x-axis:** years, from this year to 15 years out (2026–2041 in 2026).
- **One line per hardware:** every preset and the user's own hardware (see
  below). Colour shows the technology (superconducting, trapped ion, neutral
  atom, semiconductor, other) and the dash pattern shows the vendor.
- **First graph's y-axis:** the largest problem the hardware can run that
  year, divided by the smallest problem where quantum beats classical (log
  scale). It's the gap between the feasibility line and the advantage line on
  the QEA graph, and crosses 1× in the QEA year.
- **Second graph's y-axis:** the largest problem the hardware can run that
  year with its qubits and the chosen quantum algorithm (log scale), with no
  maximum compute time. It's the feasibility line of the QEA graph, one per
  hardware. It doesn't depend on Speed / Cost or the classical algorithm;
  those move the QEA dots. The tooltip also gives the size from which quantum
  wins that year.
- **QEA:** a dot marks each hardware's QEA year in both graphs, and the
  legend gives it. Lines are bold from it on (see Roadmap notation).
- **Table view:** hardware, algorithm, its complexity, the QEA year and the
  largest problem it can run in the last year.
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

The calculator's graphs (Edit roadmap, Quantum Timelines, Quantum Economic
Advantage) and the comparison draw roadmaps the same way
(`src/store/roadmapNotation.js`):

- **Filled dot:** demonstrated, a machine that exists.
- **Hollow dot:** projected, on the vendor's roadmap.
- **Bold line:** extrapolated past the last roadmap point. The years past
  the roadmap also have a grey "Beyond roadmap" background. Lines are not
  faded anywhere.
- **Colour:** physical qubits light red, logical qubits dark red.
- **Labels:** counts as powers of ten (10^4), years as whole years.

Dashes are not used for projections, so that in the comparison they can
mark the vendor. The Quantum Economic Advantage graph's lines used to be
dashed before the QEA year; they are solid now, and the shaded area shows
where quantum wins. Its time-capped view draws the uncapped feasibility as
a thin green line instead of a dashed one.

The comparison bolds lines from the QEA year instead: each line is bold from
its hardware's QEA year on, and never when the hardware doesn't reach QEA in
the period. The calculator's graphs keep the roadmap end, since the QEA graph
has two QEA years (speed and cost). In the comparison, a QEA year past the
hardware's roadmap is a hollow dot, is marked "beyond roadmap" in the table
and the tooltip, and rests on the extrapolation. The bold width is set in
`src/style.css`, because Highcharts zones can't change a line's width.

A roadmap counted in logical qubits has no physical qubits line in Quantum
Timelines. It used to draw its logical counts as a "Physical Qubits" line.

## Why these y-axes

The first graph puts every hardware's QEA on one line (1×), so the QEA years
can be compared at a glance. The second was asked for directly: it shows what
each hardware can do, and the QEA dot shows when that becomes worth it. Two
other options were considered for the first:

- **The QEA graph's own speed and cost lines** (the problem size where quantum
  starts to win). On their own, they depend only on the hardware's slowdown
  and penalty, not its qubit roadmap. All four superconducting presets would
  draw the same line, and the line wouldn't show when QEA happens. Dividing the
  feasible size by that line's size keeps the QEA graph's quantities and puts
  them on one line per hardware.
- **How many times faster or cheaper quantum is on the largest problem it can
  run.** This grows far too fast to read on one axis. For Integer
  Factorization it reaches 10^39,663× on QuEra by 2041.

The first graph's y-axis is capped at 10^12×. The second graph's y-axis goes to 10^12
or two orders of magnitude past the highest QEA dot, whichever is higher.
Lines that go past the cap (e.g. Database Search, where n = 2^qubits and the
largest size reaches 10^19,660,800) leave the top of the plot.

## Modelling choices

These are kept out of the UI on purpose.

- **One quantum algorithm for every hardware:** the recommended one is the
  algorithm that does best on the most hardware, counting speed and cost
  separately. Doing best on a hardware means reaching QEA first, or if none
  does, having the most headroom at the end of the period. Ties go to the
  calculator's default, then the newest. On the presets, the best algorithm
  is the same on every hardware for 19 of 21 problems. The exceptions are
  Shortest Path and String Search. It matches the calculator's default in 18
  of 21; the third exception is Integer Factorization, where Brenner et al.
  (2025) wins (see Known limitations). Picking the best algorithm year by
  year was checked for every problem, preset, speed and cost (198 cases). It
  changes in two: String Search on IonQ and Quantinuum around 2040, where
  two algorithms are within 0.03 orders of magnitude of each other, far
  below 1×.
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
- **Classical baseline:** the recommended one is the single classical
  algorithm whose runtime grows slowest as n grows (with p = 1). It matches
  the calculator's default in 19 of 21 problems (not Minimum Spanning Tree
  or Shortest Path). The pool is
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
