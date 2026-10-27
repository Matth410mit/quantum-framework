# Hardware comparison graph

The "Hardware Comparison" section under each model compares the hardware
presets over time for that model's problem.

- **x-axis:** years, from this year to 15 years out (2026–2041 in 2026).
- **One line per hardware:** each preset and imported roadmap, plus a
  "Current inputs" line when the model's hardware settings no longer match the
  preset they came from. Colour shows the technology (superconducting, trapped
  ion, neutral atom, semiconductor, other) and the dash pattern shows the
  vendor. Clicking a legend entry hides that line.
- **y-axis:** the largest problem the hardware can run that year, divided by
  the smallest problem where quantum beats classical (log scale). It's the gap
  between the feasibility line and the advantage line on the QEA graph. A line
  crosses 1× in that hardware's QEA year, which is marked with a dot and shown
  in the legend.
- **Speed / Cost:** whether "beats classical" means faster (runtime with the
  hardware slowdown) or cheaper (work with the cost factor). Speed is the
  default.
- **Table view:** hardware, algorithm, its complexity and the QEA year.

Code: `src/store/hardwareComparison.js` (calculation, run in a web worker),
`src/components/HardwareComparisonGraph.vue` (graph), and `src/store/qea.js`
(QEA math shared with the other graphs).

## Why this y-axis

Two other options were considered:

- **The QEA graph's own speed and cost lines** (the problem size where quantum
  starts to win). On their own, they depend only on the hardware's slowdown
  and penalty, not its qubit roadmap. All five superconducting presets would
  draw the same line, and the line wouldn't show when QEA happens. Dividing the
  feasible size by that line's size keeps the QEA graph's quantities and puts
  them on one line per hardware.
- **How many times faster or cheaper quantum is on the largest problem it can
  run.** This grows far too fast to read on one axis. For Integer
  Factorization it reaches 10^398× (IBM) to 10^39,663× (QuEra) by 2041.

The y-axis is capped at 10^12×. Lines that go past it (e.g. Database Search,
where n = 2^qubits) leave the top of the plot.

## Modelling choices

These are kept out of the UI on purpose.

- **One algorithm per hardware:** the quantum algorithm that reaches QEA first
  on that hardware. If none does, it's the one with the most headroom at the
  end of the period. Picking the best algorithm year by year was checked for
  every problem, preset, speed and cost. On the current sheet it never
  changes within the period, so it would draw the same lines.
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
- **Hardware lines:** each line is a copy of the model with that preset's
  fields applied, exactly as picking it in the hardware dropdown does. The
  rest of the model (max compute time, ...) is kept.
- **Qubits:** each quantum algorithm uses its own qubits-needed formula from
  the sheet, falling back to the problem's.
- **Gaps:** a year where quantum doesn't win at any problem size has no point,
  so the line has a gap.

## Speed

Every candidate is evaluated on every hardware, twice a year, plus its QEA
years: up to a few seconds for Integer Factorization (14 algorithms). It runs
in a web worker so the page stays responsive, and uses a faster search than
the main QEA graph. Problem size is searched in log10(n) from the bottom up,
and the year to about a day. Across all problems and presets, the QEA years
match the main graph's calculation to within 0.05 years in 631 of 634 checks
(622 within 0.01). Of the other three, one is off by 0.06 years. The other two
are cases where quantum and classical differ only by a constant factor
(below), and neither calculation is meaningful there.

## Known limitations

- **Constant-factor "speedups":** when the quantum and classical runtimes have
  the same growth (e.g. Sorting, n log n on both sides), the result is
  floating-point noise. The slowdown and processor terms shrink over time until
  the two sides are exactly equal. This affects the main QEA graph the same way.
- **Sheet data:** the graph shows whatever the sheet says. For Integer
  Factorization, the "Brenner et al. (2025)" row is O((log n)²) with n = bits,
  so it's the best algorithm on every hardware. That looks like n meaning the
  integer itself (so log n = bits). It's worth checking with the sheet owner.
