# Algorithm sheet sync report

Generated 2026-10-16T19:03:27.867Z by `npm run sync` from https://docs.google.com/spreadsheets/d/1c6HTfHQfp7MIg1LFo6_wFOzKLIHA1rzVpDxXIPosRQ0/.

Rows marked ✗ are left out of the calculator. Substitution rules are in `src/store/sheetSync/problems.config.js`.

## Summary

| Problem | Classical usable | Quantum usable | Status |
|---|---|---|---|
| Integer Factorization | 13 of 30 | 13 of 16 | Included (defaults hand-picked in problemCatalog.js; the sheet adds alternatives) |
| Traveling Salesman | 41 of 108 | 0 of 2 | Included (defaults hand-picked in problemCatalog.js; the sheet adds alternatives) |
| Subset Sum | 2 of 13 | 10 of 10 | Included |
| Graph Coloring | 14 of 15 | 2 of 2 | Left out: no Variation has a usable exact algorithm on both sides |
| Set Cover | 1 of 3 | 1 of 2 | Left out: no usable exact classical algorithm |
| Clique | 7 of 9 | 2 of 5 | Included |
| Cycle Detection | 0 of 5 | 1 of 1 | Left out: no usable exact classical algorithm |
| Strongly Connected Components | 13 of 14 | 2 of 3 | Included |
| Longest Common Subsequence | 1 of 15 | 0 of 0 | Left out: no usable exact quantum algorithm |
| Longest Common Substring | 0 of 0 | 3 of 3 | Left out: no usable exact classical algorithm |
| Longest Palindromic Substring | 5 of 5 | 2 of 2 | Included |
| Matrix Chain Multiplication | 6 of 6 | 1 of 2 | Included |
| Optimal Binary Search Trees | 12 of 12 | 1 of 2 | Left out: no Variation has a usable exact algorithm on both sides |
| Maximum Cut | 1 of 3 | 1 of 2 | Included |
| Graph Isomorphism | 6 of 10 | 0 of 0 | Left out: no usable exact quantum algorithm |
| Nearest Neighbor Search | 4 of 4 | 2 of 6 | Included |
| Sorting | 22 of 25 | 5 of 6 | Included |
| Lowest Common Ancestor | 0 of 5 | 1 of 1 | Left out: no usable exact classical algorithm |
| Maximum Cardinality Matching | 8 of 10 | 12 of 13 | Included |
| Minimum Spanning Tree | 12 of 13 | 5 of 5 | Included |
| Shortest Path | 10 of 10 | 9 of 9 | Included |
| All-Pairs Shortest Paths | 7 of 8 | 3 of 4 | Included |
| Maximum Flow | 11 of 20 | 2 of 5 | Included |
| Convex Hull | 10 of 10 | 1 of 1 | Included |
| String Search | 20 of 27 | 8 of 10 | Included |
| Vertex Cover | 10 of 10 | 1 of 1 | Included |

## Family names in the config that the sheet doesn't have

- Sheet1: "Longest Common Substring"

## Integer Factorization


| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Trial division | 1202 | First Category Integer Factoring | `$O(2^{n/2})$` | 975 | `2 ^ (n / 2) / p` |
| ✓ | Classical | Wheel factorization | 1940 | First Category Integer Factoring | `$O(2^{n/2})$` | 975 | `2 ^ (n / 2) / p` |
| ✗ | Classical | Pollard's rho algorithm | 1975 | First Category Integer Factoring | `-` |  | No complexity in the sheet |
| ✗ | Classical | Pollard's p − 1 algorithm | 1974 | First Category Integer Factoring | `$O(B \log(B) \log^2(n))$` | 1000.102 | Uses B (smoothness bound (can be exponential)) |
| ✓ | Classical | Williams' p + 1 algorithm | 1982 | First Category Integer Factoring | `$O(2^n)$` | 1000 | `2 ^ n / p` |
| ✓ | Classical | Lenstra elliptic curve factorization | 1987 | First Category Integer Factoring | `$O(e^{\sqrt{(1+o(1))n\log n}})$` | 910 | `e ^ sqrt(1 * n * log(2) * log(n * log(2))) / p` |
| ✓ | Classical | Fermat's factorization method | 1894 | First Category Integer Factoring | `$O(2^n)$` | 1000 | `2 ^ n / p` |
| ✓ | Classical | Euler's factorization method | 1940 | First Category Integer Factoring | `$O(2^{n/2})$` | 975 | `2 ^ (n / 2) / p` |
| ✓ | Classical | Dixon's algorithm | 1981 | Second Category Integer Factoring | `$O(e^{2 \sqrt{2} \sqrt{n\log n}})$` | 913 | `e ^ (2 * sqrt(2) * sqrt(n * log(2) * log(n * log(2)))) / p` |
| ✓ | Classical | Continued fraction factorization (CFRAC) | 1931 | Second Category Integer Factoring | `$O(e^{\sqrt{2n\log n}})$` | 911 | `e ^ sqrt(2 * n * log(2) * log(n * log(2))) / p` |
| ✓ | Classical | Quadratic sieve | 1981 | Second Category Integer Factoring | `$O(e^{\sqrt{(1+o(1))n \log n}})$, under assumption about numbers in a sequence behaving randomly in a given range` | 910 | `e ^ sqrt(1 * n * log(2) * log(n * log(2))) / p` |
| ✓ | Classical (parallel) | Rational sieve | 1993 | Second Category Integer Factoring | `$O(e^{\sqrt{(2+o(1))n \log n}})$` | 911.1 | `e ^ sqrt(2 * n * log(2) * log(n * log(2)))` |
| ✓ | Classical | Shanks's square forms factorization (SQUFOF) | 2007 | Second Category Integer Factoring | `$O(2^{n/4})$` | 975 | `2 ^ (n / 4) / p` |
| ✓ | Classical | Special number field sieve | 1940 | First Category Integer Factoring | `$O(\exp((1+o(1))(32n/9)^{1/3}(log n)^{2/3})$, under assumption about numbers in a sequence behaving randomly in a given range` |  | `e ^ (1 * (32 * n * log(2) / 9) ^ (1 / 3) * log(n * log(2)) ^ (2 / 3)) / p` |
| ✓ | Classical | General number field sieve | 1996 | Second Category Integer Factoring | `$O(\exp((1+o(1))(64n/9)^{1/3}(log n)^{2/3})$, under assumption about numbers in a sequence behaving randomly in a given range` |  | `e ^ (1 * (64 * n * log(2) / 9) ^ (1 / 3) * log(n * log(2)) ^ (2 / 3)) / p` |
| ✗ | Classical (parallel) | Parallel Lenstra's ECM (Brent) | 1990 | First Category Integer Factoring | `TP = T_1/P + $O(T_1^{1=2+\eps})$, T_1 = $O(exp(c(\log f \log \log f)^{1/2}) * (\log N)^2)$ expected, where c is a constant` |  | Depends on cases or on a helper function |
| ✗ | Classical (parallel) | Yang, Xu, Lin (GNFS with parallel sieving and serial block lanczos) | 2005 | Second Category Integer Factoring | `` |  | No complexity in the sheet |
| ✗ | Classical (parallel) | Yang, Huang, Feng, Pan, Zhu (GNFS with parallel sieving and MPI parallel block lanczos) | 2017 | Second Category Integer Factoring | `` |  | No complexity in the sheet |
| ✗ | Classical (parallel) | Wunderlich (continued fraction factoring) | 1985 | Second Category Integer Factoring | `M^a / (r(a) a^2 log^2 M) / P` |  | Uses M; a; r; P |
| ✗ | Classical (parallel) | Åsbrink, Brynielsson (quadratic sieve with only parallel sieving) | 2000 | Second Category Integer Factoring | `` |  | No complexity in the sheet |
| ✗ | Classical (parallel) | Yan (trial division) | 1993 | Second Category Integer Factoring | `pi(sqrt(n))/p` |  | Couldn't read the formula |
| ✗ | Classical (parallel) | Bahig, Hazber, Al-Utaibi, Nassr | 2022 | Second Category Integer Factoring | `$O(m/t)$` |  | Uses m; t |
| ✗ | Classical (parallel) | Daoud, Gad (GNFS with parallel sieving) | 2014 | Second Category Integer Factoring | `` |  | No complexity in the sheet |
| ✗ | Classical (parallel) | Yang, Xu, Lin, Quinn (GNFS with parallel sieving and serial biorthogonal block lanczos) | 2006 | Second Category Integer Factoring | `` |  | No complexity in the sheet |
| ✗ | Classical (parallel) | Bouillaguet, Zimmermann (GNFS with structured gaussian elimination as dimension/density re | 2021 | Second Category Integer Factoring | `` |  | No complexity in the sheet |
| ✗ | Classical (parallel) | Yang, Huang, Feng, Xu (GNFS with parallel sieving and parallel block wiedemann) | 2017 | Second Category Integer Factoring | `` |  | No complexity in the sheet |
| ✗ | Classical (parallel) | Silverman (multiple polynomial quadratic sieve) | 1987 | Second Category Integer Factoring | `` |  | No complexity in the sheet |
| ✗ | Classical (parallel) | Yang, Xu, Yeo, Hussain (GNFS with parallel sieving and montgomery block lanczos) | 2010 | Second Category Integer Factoring | `` |  | No complexity in the sheet |
| ✗ | Classical (parallel) | Rational sieve | 1993 | Second Category Integer Factoring | `$O(e^{sqrt((2+o(1))n*logn)}/p)$?` |  | Marked uncertain in the sheet (?) |
| ✗ | Classical (parallel) | Sorenson | 1994 | Second Category Integer Factoring | `$O(\log^{2d+2} n)$` |  | Couldn't read the formula |
| ✓ | Quantum | Shor's Algorithm | 1994 | Integer Factoring | `O(poly(n)) more specifically: O(n^2 log n)` |  | `n ^ 2 * log2(n)` |
| ✗ | Quantum | SQIF | 2022 | Integer Factoring | `O(n^2/2p)` |  | Uses p (number of processors, p < floor(n/2)) |
| ✓ | Quantum | Regev's Algorithm | 2023 | Integer Factoring | `O(n^2)` |  | `n ^ 2` |
| ✓ | Quantum | Space-efficient Regev's Algorithm | 2025 | Integer Factoring | `O(n^2)` |  | `n ^ 2` |
| ✓ | Quantum | Chevnigard | 2024 | Integer Factoring | `O(n^3)` |  | `n ^ 3` |
| ✓ | Quantum | Jacobi Factoring | 2024 | Integer Factoring | `O(n^(5/3))` |  | `n ^ (5 / 3)` |
| ✓ | Quantum | Gidney-Ekera | 2021 | Integer Factoring | `0.3*n^3 + 0.005*n^3 * log(n)` |  | `0.3 * n ^ 3 + 0.005 * n ^ 3 * log2(n)` |
| ✓ | Quantum | Bernstein, Biasse, Mosca |  | Integer Factoring | `O(exp(1.387 * n^(1/3) * (log n)^(2/3))` |  | `e ^ (1.387 * (n * log(2)) ^ (1 / 3) * log(n * log(2)) ^ (2 / 3))` |
| ✓ | Quantum | Modified Shor's | 2006 | Integer Factoring | `O(n^2 log n)` |  | `n ^ 2 * log2(n)` |
| ✓ | Quantum | Modified Shor's | 2003 | Integer Factoring | `O(n^3)` |  | `n ^ 3` |
| ✓ | Quantum | Modified Shor's | 2006 | Integer Factoring | `O(n^3 log n)` |  | `n ^ 3 * log2(n)` |
| ✓ | Quantum | Modified Shor's | 2017 | Integer Factoring | `O(n^3 log n)` |  | `n ^ 3 * log2(n)` |
| ✗ | Quantum | Modified Shor's | 2025 | Integer Factoring | `O(m_max * d_u)` |  | Uses m_; max; d_u (depth of unitary gate U) |
| ✓ | Quantum | Brenner et al. | 2025 | Integer Factoring | `O((log n)^2)` |  | `log2(n) ^ 2` |
| ✗ | Quantum | Variational Quantum Factoring | 2018 | Integer Factoring | `O(s^2 n_c^4 n^8)` |  | Uses s (ansatz depth); n_c (for prime factors p, q, number of bits needed to represent p and q) |
| ✓ | Quantum | Grover-based | 2023 | Smallest Factor | `O(n^3 2^n)` |  | `n ^ 3 * 2 ^ n` |

## Traveling Salesman


| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Miller-Tucker-Zemlin (MTZ) formulation | 1960 | Minimum TSP | `$\text{exp}(V)$` | 7500 | `e ^ n / p` |
| ✓ | Classical | Dantzig-Fulkerson-Johnson (DFJ) formulation | 1954 | Minimum TSP | `$O(V!)$` | 9000 | `sqrt(2 * pi * n) * (n / e) ^ n / p` |
| ✓ | Classical (approx.) | Barvinok | 2003 | Geometric Maximum TSP | `$O(V^2 \log\log E)$` |  | `n ^ 2 * log2(log2(n ^ 2)) / p` |
| ✗ | Classical (approx.) | Applegate et al. (Concorde TSP Solver) | 2006 | Minimum TSP | `$O(V^2 2^V)$?` | 850.01 | Marked uncertain in the sheet (?) |
| ✓ | Classical | Held–Karp algorithm | 1962 | Minimum TSP | `$O(V^2 2^V)$` | 1000.2 | `n ^ 2 * 2 ^ n / p` |
| ✓ | Classical (approx.) | Christofides algorithm | 1976 | Approximate TSP | `$O(V^3)$` | 16 | `n ^ 3 / p` |
| ✓ | Classical (approx.) | Applegate et al. | 2006 | Approximate TSP | `O(V^2 E)` |  | `n ^ 2 * n ^ 2 / p` |
| ✗ | Classical (approx.) | Johnson; D. S.; McGeoch; L. A. | 1997 |  | `O(2^{(p(n)})` |  | Uses p |
| ✓ | Classical (approx.) | Greedy |  | Approximate Metric TSP | `O(V^2 log V)` |  | `n ^ 2 * log2(n) / p` |
| ✓ | Classical (approx.) | Clarke-Wright savings heuristic | 1964 | Approximate Metric TSP | `O(V^2 log V)` |  | `n ^ 2 * log2(n) / p` |
| ✗ | Classical (approx.) | Gutina; Gregory; Yeob; Anders; Zverovich; Alexey | 2002 |  | `-` |  | No complexity in the sheet |
| ✓ | Classical (approx.) | Bellmore, Nemhauser | 1968 | Approximate Metric TSP | `O(V^2)` |  | `n ^ 2 / p` |
| ✓ | Classical (approx.) | Nicholson | 1967 | Approximate Metric TSP | `O(V^2 log V)` |  | `n ^ 2 * log2(n) / p` |
| ✓ | Classical (approx.) | Rosenkrantz; D. J.; Stearns; R. E.; Lewis; P. M. | 1974 | Approximate Metric TSP | `O(V^2)` |  | `n ^ 2 / p` |
| ✗ | Classical (approx.) | 2-Opt (Croes) | 1958 | Approximate TSP | `exp(V)?` |  | Marked uncertain in the sheet (?) |
| ✗ | Classical (approx.) | 3-Opt |  | Approximate TSP | `exp(V)?` |  | Marked uncertain in the sheet (?) |
| ✗ | Classical (approx.) | Lin–Kernighan | 1981 | Approximate TSP | `exp(V)??` |  | Marked uncertain in the sheet (?) |
| ✓ | Classical (approx.) | Christofides algorithm [improved by Gabow and Tarjan] | 1991 | Approximate Metric TSP | `$O(V^2.5 (log V)^1.5)$` |  | `n ^ 2.5 * log2(n) ^ 1.5 / p` |
| ✗ | Classical (approx.) | Karlin, Klein, Gharan | 2021 | Approximate Metric TSP | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✓ | Classical (approx.) | Approximation using Euclidean MST | 1974 | Approximate Geometric TSP | `$O(V log V)$` |  | `n * log2(n) / p` |
| ✗ | Classical (approx.) | Karp [Algorithm 1] | 1977 | Approximate Geometric TSP | `O((C^t)/t * V + V log V)` |  | Uses C; t |
| ✗ | Classical (approx.) | Karp [Algorithm 2] | 1977 | Approximate Geometric TSP | `O(e^(O(t))/t * V + V(log V)^2)` |  | Uses t |
| ✗ | Classical (approx.) | Arora | 1996 | Approximate Geometric TSP | `V^(O((log V)^(d-2)*(log log V)^(min(1, d-2)))/eps^(d-1))` |  | Uses d; ε |
| ✗ | Classical (approx.) | Arora | 1998 | Approximate Geometric TSP | `O(V (log V)^(O(c*sqrt(d))^(d-1)))` |  | Uses c; d |
| ✗ | Classical (approx.) | Arora [Derandomized] | 1998 | Approximate Geometric TSP | `O(V^(d+1) (log V)^(O(c*sqrt(d))^(d-1)))` |  | Uses d; c |
| ✓ | Classical (approx.) | Mitchell | 1999 | Approximate Geometric TSP | `O(V^(20m+5))` |  | `n ^ (20 * n ^ 2 + 5) / p` |
| ✗ | Classical (approx.) | Rao, Smith [Monte Carlo Algorithm] | 1998 | Approximate Geometric TSP | `(c*sqrt(d))^(O(d(c*sqrt(d))^(d-1))*V + O(dV log V)` |  | Uses c; d |
| ✗ | Classical (approx.) | Rao, Smith [Las Vegas Algorithm] | 1998 | Approximate Geometric TSP | `2^((cd)^(O(d)))*V+O(dV log V)` |  | Uses c; d |
| ✗ | Classical (approx.) | Rao, Smith [Derandomized Algorithm] | 1998 | Approximate Geometric TSP | `2^((cd)^(O(d)))*V+(cd)^(O(d))*V log V` |  | Uses c; d |
| ✗ | Classical (approx.) | Bartal, Gottlieb | 2013 | Approximate Geometric TSP | `2^((d/eps)^(O(d)))*V` |  | Uses d; ε |
| ✗ | Classical (approx.) | Kisfaludi-Bak, Nederlof, Wegrzycki | 2021 | Approximate Geometric TSP | `2^((poly(d)/eps)^(d-1))*V + poly(1/eps)*V log V` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Grigni, Koutsoupias, Papadimitriou | 1995 | Approximate Unweighted Planar Graph TSP | `V^(O(1/eps))` |  | Uses ε |
| ✗ | Classical (approx.) | Arora, Grigni, Karger, Klein, Woloszyn | 1998 | Approximate Weighted Planar Graph TSP | `V^(O(1/eps^2))` |  | Uses ε |
| ✗ | Classical (approx.) | Klein | 2005 | Approximate Weighted Planar Graph TSP | `e^(O(1/eps^2))*V` |  | Uses ε |
| ✓ | Classical (approx.) | Papadimitriou, Yannakakis | 1993 | Approximate (1,2) Metric TSP | `O(V^2.5)` |  | `n ^ 2.5 / p` |
| ✗ | Classical (approx.) | Papadimitriou, Yannakakis | 1993 | Approximate (1,2) Metric TSP | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✓ | Classical (approx.) | Blaser, Ram | 2005 | Approximate (1,2) Metric TSP | `O(V^3)` |  | `n ^ 3 / p` |
| ✗ | Classical (approx.) | Blaser, Ram | 2005 | Approximate (1,2) Metric TSP | `O(V^3)?` |  | Marked uncertain in the sheet (?) |
| ✗ | Classical (approx.) | Berman, Karpinski | 2006 | Approximate (1,2) Metric TSP | `O(V^9)?` |  | Marked uncertain in the sheet (?) |
| ✓ | Classical (approx.) | Adamaszek, Mnich, Paluch [Section 3] | 2018 | Approximate (1,2) Metric TSP | `O(V^2.5)` |  | `n ^ 2.5 / p` |
| ✓ | Classical (approx.) | Adamaszek, Mnich, Paluch [Section 4] | 2018 | Approximate (1,2) Metric TSP | `O(V^3)` |  | `n ^ 3 / p` |
| ✗ | Classical (approx.) | Chen, Kannan, Khanna | 2020 | Approximate (1,2) Metric TSP | `O(V^1.5 poly(log V)))` |  | Not specific (poly or polylog) |
| ✓ | Classical (approx.) | Frieze, Galbiati, Maffioli | 1982 | Approximate Asymmetric TSP (with triangle ineq) | `O(V^3)` |  | `n ^ 3 / p` |
| ✓ | Classical (approx.) | Kleinberg, Williamson | 1998 | Approximate Asymmetric TSP (with triangle ineq) | `O(V^4)` |  | `n ^ 4 / p` |
| ✗ | Classical (approx.) | Blaser | 2002 | Approximate Asymmetric TSP (with triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Kaplan, Lewenstein, Shafrir, Sviridenko | 2003 | Approximate Asymmetric TSP (with triangle ineq) | `O(poly(V, log D))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Feige, Singh | 2007 | Approximate Asymmetric TSP (with triangle ineq) | `O(poly(V, log D))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Asadpour, Goemans, Madry, Oveis Gharan, Saberi | 2010 | Approximate Asymmetric TSP (with triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Svensson, Tarnawski, Vegh | 2018 | Approximate Asymmetric TSP (with triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Traub, Vygen | 2020 | Approximate Asymmetric TSP (with triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Behrendt et. al. [Relaxed Generalized Christofides] | 2021 | Approximate Asymmetric TSP (with triangle ineq) | `O(V^3 + 2^z * z^2)` |  | Uses z |
| ✗ | Classical (approx.) | Behrendt et. al. [Relaxed Generalized Tree Doubling] | 2021 | Approximate Asymmetric TSP (with triangle ineq) | `O(V^3 + 2^k * k^2)` |  | Uses k |
| ✗ | Classical (approx.) | Andreae, Bandelt | 1995 | Approximate Symmetric TSP (with gamma-parameterized triangle ineq) | `O(V^2)?` |  | Marked uncertain in the sheet (?) |
| ✗ | Classical (approx.) | Bockenhauer et. al. | 2000 | Approximate Symmetric TSP (with gamma-parameterized triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✓ | Classical (approx.) | Bender, Chekuri | 2000 | Approximate Symmetric TSP (with gamma-parameterized triangle ineq) | `O(V^5)` |  | `n ^ 5 / p` |
| ✓ | Classical (approx.) | Andreae | 2001 | Approximate Symmetric TSP (with gamma-parameterized triangle ineq) | `O(V^2)` |  | `n ^ 2 / p` |
| ✓ | Classical (approx.) | Bockenhauer et. al. | 2002 | Approximate Symmetric TSP (with gamma-parameterized triangle ineq) | `O(V^3)` |  | `n ^ 3 / p` |
| ✓ | Classical (approx.) | Chandran, Ram | 2002 | Approximate Asymmetric TSP (with gamma-parameterized triangle ineq) | `O(V^3)` |  | `n ^ 3 / p` |
| ✓ | Classical (approx.) | Blaser | 2003 | Approximate Asymmetric TSP (with gamma-parameterized triangle ineq) | `O(V^3)` |  | `n ^ 3 / p` |
| ✓ | Classical (approx.) | Blaser, Manthey, Sgall | 2006 | Approximate Asymmetric TSP (with gamma-parameterized triangle ineq) | `O(V^3)` |  | `n ^ 3 / p` |
| ✓ | Classical (approx.) | Zhang, Li, Li | 2009 | Approximate Asymmetric TSP (with gamma-parameterized triangle ineq) | `O(V^3)` |  | `n ^ 3 / p` |
| ✗ | Classical (approx.) | Kowalik, Mucha | 2009 | Approximate Asymmetric TSP (with gamma-parameterized triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Hoogeveen | 1990 | Approximate Metric TS Path Problem | `O(V^3)?` |  | Marked uncertain in the sheet (?) |
| ✗ | Classical (approx.) | An, Kleinberg, Shmoys | 2011 | Approximate Metric TS Path Problem | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Sebo | 2012 | Approximate Metric TS Path Problem | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Vygen | 2015 | Approximate Metric TS Path Problem | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Gottschalk, Vygen | 2015 | Approximate Metric TS Path Problem | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Sebo, van Zuylen | 2016 | Approximate Metric TS Path Problem | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Traub, Vygen | 2017 | Approximate Metric TS Path Problem | `O(V^(6*ceil(log_2(1/eps)))*LP(V, ceil(log_2(1/eps))))` |  | Couldn't read the formula |
| ✗ | Classical (approx.) | Zenklusen | 2018 | Approximate Metric TS Path Problem | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Karlin, Klein, Gharan ( + result from Traub, Vygen, Zenklusen [2020]) | 2021 | Approximate Metric TS Path Problem | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Bachrach et. al | 2005 | Approximate Path-Constrained Metric TS Path Problem | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Lam, Newman | 2006 | Approximate Asymmetric TS Path Problem (with triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✓ | Classical (approx.) | Chekuri, Pal | 2006 | Approximate Asymmetric TS Path Problem (with triangle ineq) | `O(V^5)` |  | `n ^ 5 / p` |
| ✗ | Classical (approx.) | Feige, Singh | 2007 | Approximate Asymmetric TS Path Problem (with triangle ineq) | `O(poly(V, log D) + V^(1/eps + O(1)))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Asadpour, Goemans, Madry, Oveis Gharan, Saberi (+ result from Feige, Singh [2007]) | 2010 | Approximate Asymmetric TS Path Problem (with triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Svensson, Tarnawski, Vegh (+ result from Feige, Singh [2007]) | 2018 | Approximate Asymmetric TS Path Problem (with triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Traub, Vygen (+ result from Feige, Singh [2007]) | 2020 | Approximate Asymmetric TS Path Problem (with triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Fisher, Nemhauser, Wolsey | 1979 | Approximate Asymmetric Maximum TSP | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Kosaraju, Park, Stein | 1994 | Approximate Asymmetric Maximum TSP | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Lewenstein, Sviridenko | 2003 | Approximate Asymmetric Maximum TSP | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Paluch, Elbassioni, van Zuylen | 2012 | Approximate Asymmetric Maximum TSP | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Paluch | 2020 | Approximate Asymmetric Maximum TSP | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✓ | Classical (approx.) | Blaser | 2004 | Approximate Asymmetric Maximum TSP | `O(V^3)` |  | `n ^ 3 / p` |
| ✓ | Classical (approx.) | Kostochka, Serdyukov | 1985 | Approximate Asymmetric Maximum TSP (with triangle ineq) | `O(V^3)` |  | `n ^ 3 / p` |
| ✗ | Classical (approx.) | Chen, Nagoya | 2005 | Approximate Asymmetric Maximum TSP (with triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Blaser, Ram, Sviridenko | 2005 | Approximate Asymmetric Maximum TSP (with triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✗ | Classical (approx.) | Kowalik, Mucha | 2007 | Approximate Asymmetric Maximum TSP (with triangle ineq) | `O(poly(V))` |  | Not specific (poly or polylog) |
| ✓ | Classical (approx.) | Serdyukov | 1987 | Approximate Geometric Maximum TSP | `O(V^3)` |  | `n ^ 3 / p` |
| ✗ | Classical (approx.) | Barvinok | 1996 | Approximate Geometric Maximum TSP | `O(poly(V, 1/eps))` |  | Not specific (poly or polylog) |
| ✓ | Classical (approx.) | Hassin, Rubinstein | 2002 | Approximate Metric Maximum TSP | `O(V^3)` |  | `n ^ 3 / p` |
| ✓ | Classical (approx.) | Chen, Okamoto, Wang | 2005 | Approximate Metric Maximum TSP | `O(V^3)` |  | `n ^ 3 / p` |
| ✓ | Classical (approx.) | Chen, Nagoya | 2005 | Approximate Metric Maximum TSP | `O(V^3)` |  | `n ^ 3 / p` |
| ✓ | Classical (approx.) | Zhang, Yin, Li | 2010 | Approximate Maximum TSP (with gamma-parameterized triangle ineq) | `O(V^3)` |  | `n ^ 3 / p` |
| ✓ | Classical (approx.) | Greedy |  | Approximate Maximum TSP | `O(E)` |  | `n ^ 2 / p` |
| ✓ | Classical (approx.) | Best Neighbor (Karg, Thompson) | 1964 | Approximate Maximum TSP | `O(E)` |  | `n ^ 2 / p` |
| ✗ | Classical (approx.) | 2-opt (Lin) | 1965 | Approximate Maximum TSP | `` |  | No complexity in the sheet |
| ✗ | Classical (approx.) | 2-matching (Fisher, Nemhauser, Wolsey) | 1979 | Approximate Maximum TSP | `O(poly(V))?` |  | Marked uncertain in the sheet (?) |
| ✓ | Classical (approx.) | Serdyukov | 1984 | Approximate Maximum TSP | `O(V^3)` |  | `n ^ 3 / p` |
| ✗ | Classical (approx.) | Hassin, Rubinstein | 1998 | Approximate Maximum TSP | `O(V^3+V^2*2^(O(1/eps)))` |  | Uses ε |
| ✗ | Classical (approx.) | Hassin, Rubinstein | 2000 | Approximate Maximum TSP | `O(V^3+V^2*2^(O(1/eps)))` |  | Uses ε |
| ✗ | Classical (approx.) | Chen, Okamoto, Wang | 2005 | Approximate Maximum TSP | `O_eps(V^3)` |  | Uses O_e; p; s |
| ✓ | Classical (approx.) | Paluch, Mucha, Madry | 2009 | Approximate Maximum TSP | `O(V^3)` |  | `n ^ 3 / p` |
| ✓ | Classical (approx.) | Dudycz, Marcinkowski, Paluch, Rybicki | 2016 | Approximate Maximum TSP | `O(V^3)` |  | `n ^ 3 / p` |
| ✗ | Classical (approx.) | Talwar | 2004 | Approximate Maximum Metric TSP with fixed doubling dimension | `V*2^(((k log V)/eps)^(O(k)))` |  | Uses k; ε |
| ✗ | Classical (approx.) | Bartal, Gottlieb, Krauthgamer | 2011 | Approximate Maximum Metric TSP with fixed doubling dimension | `V^(2^(O(k))) * 2^((k/eps)^(O(k))*sqrt(log(V)))` |  | Uses k; ε |
| ✗ | Classical (approx.) | Shenmaier [Theorem 2] | 2021 | Approximate Maximum Metric TSP with fixed doubling dimension | `O(V^3 + 2^((2/eps)^(2k+1)))` |  | Uses ε; k |
| ✓ | Classical (approx.) | Shenmaier [Theorem 3] | 2021 | Approximate Maximum Metric TSP with fixed doubling dimension | `O(V^3)` |  | `n ^ 3 / p` |
| ✗ | Quantum | Srinivasan, Satyajit, Behera, Panigrahi | 2018 | Minimum TSP | `` |  | No complexity in the sheet |
| ✗ | Quantum | Xujun & Yun | 2025 | Minimum TSP | `O(sqrt(2^(logd * N)))` |  | Uses d (maximum degree of a vertex) |

## Subset Sum

Default classical: Horowitz and Sahni (1974)  
Default quantum: Bonnetain, Bricout, Schrottenloher, Shen 1 (2020)  
Variation compared: Subset Sum  
Classical variations: Subset Sum (2 of 13 usable exact)  
Quantum variations: Subset Sum (10 of 10 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✗ | Classical | Pisinger | 2003 | Subset Sum | `$O(nt/\log t)$` | 1000.1 | Uses t (target sum) |
| ✗ | Classical | Faaland | 1973 | Subset Sum | `$O(n' t)$` | 1000.1 | Uses t (target sum) |
| ✗ | Classical | Pferschy | 1999 | Subset Sum | `$O(n' t)$` | 1000.1 | Uses t (target sum) |
| ✗ | Classical | Klinz | 1999 | Subset Sum | `$O(\sigma^{3/2})$` | 1500.15 | Uses σ |
| ✗ | Classical | Eppstein | 1997 | Subset Sum | `$\tilde{O}(n \max(S))$` | 1000.9 | Uses S (the set) |
| ✗ | Classical | Serang | 2014 | Subset Sum | `$\tilde{O}(n \max(S))$` | 1000.9 | Uses S (the set) |
| ✗ | Classical | Serang | 2015 | Subset Sum | `$\tilde{O}(n \max(S))$` | 1000.9 | Uses S (the set) |
| ✗ | Classical | Lokshtanov | 2010 | Subset Sum | `$\tilde{O}(n^3 t)$` | 1000.9 | Uses t (target sum) |
| ✓ | Classical | Horowitz and Sahni | 1974 | Subset Sum | `$O(2^{(n/2)} n)$` | 975.01 | `2 ^ (n / 2) * n / p` |
| ✗ | Classical | Bellman dynamic programming algorithm | 1956 | Subset Sum | `$O(nt)$` | 1000.1 | Uses t (the target sum) |
| ✗ | Classical | Psinger | 1999 | Subset Sum | `$O(n \max(S))$` | 1000.1 | Uses S |
| ✗ | Classical | Koiliaris and Xu | 2019 | Subset Sum | `$\tilde{O}(\min(\sqrt{n'}t, t^{5/4}, \sigma))$` | 1000.9 | Uses t (the target sum); σ |
| ✓ | Classical | Naive algorithm | 1940 | Subset Sum | `$O(n 2^n)$` | 1000.1 | `n * 2 ^ n / p` |
| ✓ | Quantum | Subset Sum Quantum Search | 2009 | Subset Sum | `O(2^(n/2))` |  | `2 ^ (n / 2)` |
| ✓ | Quantum | Subset Sum Quantum Search with a Modulus | 2013 | Subset Sum | `O(2^(3n/8))` |  | `2 ^ (3 * n / 8)` |
| ✓ | Quantum | Subset Sum Quantum Left-Right Split | 2013 | Subset Sum | `O(2^(n/3))` |  | `2 ^ (n / 3)` |
| ✓ | Quantum | Subset Sum Quantum Walk | 2013 | Subset Sum | `O(2^(n/3))` |  | `2 ^ (n / 3)` |
| ✓ | Quantum | Subset Sum Quantum Walk with a Modulus | 2013 | Subset Sum | `O(2^(0.3*n))` |  | `2 ^ (0.3 * n)` |
| ✓ | Quantum | Subset Sum Quantum Walk with Moduli and Representations | 2013 | Subset Sum | `O(2^(0.241*n))` |  | `2 ^ (0.241 * n)` |
| ✓ | Quantum | Becker-Coron-Joux Quantum Walk | 2018 | Subset Sum | `O(2^(0.226*n))` |  | `2 ^ (0.226 * n)` |
| ✓ | Quantum | Quantum Asymetric Howgrave-Graham-Joux | 2020 | Subset Sum | `O(2^(0.236*n))` |  | `2 ^ (0.236 * n)` |
| ✓ | Quantum | Bonnetain, Bricout, Schrottenloher, Shen 1 | 2020 | Subset Sum | `O(2^(0.216*n))` |  | `2 ^ (0.216 * n)` |
| ✓ | Quantum | Bonnetain, Bricout, Schrottenloher, Shen 2 | 2020 | Subset Sum | `O(2^(0.218*n))` |  | `2 ^ (0.218 * n)` |

## Graph Coloring

Assumption: Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.  
Classical variations: 3-Graph Coloring (8 of 10 usable exact); 4-Graph Coloring (4 of 4 usable exact); 3-Coloring a Random 3-Colorable Graph (0 of 1 usable exact)  
Quantum variations: Chromatic Number (2 of 2 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Brute-force search | 1852 | 3-Graph Coloring | `$O((m+n) 3^n)$` | 855.81 | `(n ^ 2 + n) * 3 ^ n / p` |
| ✓ | Classical | Brute force | 1852 | 4-Graph Coloring | `$O((m+n) 4^n)$` | 860.01 | `(n ^ 2 + n) * 4 ^ n / p` |
| ✓ | Classical | Brélaz (DSatur) | 1979 | 3-Graph Coloring | `$O(n^2)$` |  | `n ^ 2 / p` |
| ✓ | Classical | Petford and Welsh | 1989 | 3-Graph Coloring | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical | Fomin; Gaspers & Saurabh | 2007 | 4-Graph Coloring | `$O(1.7272^n)$` | 847.8 | `1.7272 ^ n / p` |
| ✓ | Classical | Lawler | 1976 | 3-Graph Coloring | `$O(mn 3^{n/3}) ~ O(mn(1.445)^n)$` | 845.215 | `n ^ 2 * n * 3 ^ (n / 3) / p` |
| ✓ | Classical | Schiermeyer | 1994 | 3-Graph Coloring | `$O(1.415^n)$` | 845 | `1.415 ^ n / p` |
| ✓ | Classical | Beigel & Eppstein | 1995 | 3-Graph Coloring | `$O(1.3446^n)$` | 844.2 | `1.3446 ^ n / p` |
| ✓ | Classical | Beigel & Eppstein | 2000 | 3-Graph Coloring | `$O(1.3289^n)$` | 844.1 | `1.3289 ^ n / p` |
| ✓ | Classical | Lawler | 1976 | 4-Graph Coloring | `$O((m+n)2^n)$` | 850.01 | `(n ^ 2 + n) * 2 ^ n / p` |
| ✓ | Classical | Byskov | 2004 | 4-Graph Coloring | `$O(1.7504^n)$` | 848 | `1.7504 ^ n / p` |
| ✓ | Classical | Schöning | 1999 | 3-Graph Coloring | `$O(1.333^n)$` |  | `1.333 ^ n / p` |
| ✓ | Classical | Hirsch | 1998 | 3-Graph Coloring | `$O(1.239^n)$` |  | `1.239 ^ n / p` |
| ✓ | Classical | Johnson | 1988 | 3-Graph Coloring | `$O(1.4422^n)$` |  | `1.4422 ^ n / p` |
| ✗ | Classical | Alon and Kahale | 1997 | 3-Coloring a Random 3-Colorable Graph | `$O(\text{poly}(n))$` |  | Not specific (poly or polylog) |
| ✓ | Quantum | Gaspers & Li | 2024 | Chromatic Number | `O^*(1.7956^n)` |  | `1.7956 ^ n` |
| ✓ | Quantum | Shimizu & Mori | 2022 | Chromatic Number | `O(1.9140^n)` |  | `1.914 ^ n` |

## Set Cover

Classical variations: Unweighted Set-Covering (0 of 1 usable exact); Unweighted Set-Covering; Weighted Set-Covering (0 of 1 usable exact); Weighted Set-Covering (0 of 1 usable exact)  
Quantum variations: Set Cover (1 of 1 usable exact); Minimum Set-Cover (0 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical (approx.) | Alon; Moshkovitz & Safra | 2006 | Unweighted Set-Covering | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✗ | Classical (approx.) | Vazirani (ILP, chapters 13-15) | 2001 | Unweighted Set-Covering; Weighted Set-Covering | `$O(\text{poly}(n, d))$` | 400 | Not specific (poly or polylog) |
| ✗ | Classical | Brute force | 1972 | Weighted Set-Covering | `$O(U 2^n)$` | 2000 | Uses U (size of universe) |
| ✓ | Quantum | Ambainis et al. | 2019 | Set Cover | `O^*(1.728^n)` |  | `1.728 ^ n` |
| ✗ | Quantum | Ronagh | 2019 | Minimum Set-Cover | `O(\sqrt{2^n} poly(m\` |  | Not specific (poly or polylog) |

## Clique

Default classical: Tomita; Tanaka & Takahashi (2006)  
Default quantum: Wenmin Han, Shiqi Zheng, Peian Chen, Yukun Wang  
Variation compared: Enumerating Maximal Cliques, arbitrary graph  
Assumption: Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.  
Classical variations: Enumerating Maximal Cliques, arbitrary graph (7 of 9 usable exact)  
Quantum variations: Enumerating Maximal Cliques, arbitrary graph (1 of 1 usable exact); k-Clique (0 of 1 usable exact); Exact k-Clique (0 of 1 usable exact); Max-Weight k-Clique (0 of 1 usable exact); Max-Weight Clique (1 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Bron–Kerbosch algorithm | 1973 | Enumerating Maximal Cliques, arbitrary graph | `$O(3^{n/3})$` | 845.2 | `3 ^ (n / 3) / p` |
| ✓ | Classical | Akkoyunlu; E. A. | 1973 | Enumerating Maximal Cliques, arbitrary graph | `$O(3^{n/3})$` | 845.2 | `3 ^ (n / 3) / p` |
| ✓ | Classical | Tomita; Tanaka & Takahashi | 2006 | Enumerating Maximal Cliques, arbitrary graph | `$O(3^{n/3})$` | 845.2 | `3 ^ (n / 3) / p` |
| ✗ | Classical (parallel) | Segundo; Artieda; Strash Parallel | 2011 | Enumerating Maximal Cliques, arbitrary graph | `$O(3^{n/3})$?` |  | Marked uncertain in the sheet (?) |
| ✓ | Classical | David Eppstein, Maarten Löffler, Darren Strash | 2010 | Enumerating Maximal Cliques, arbitrary graph | `$O(dn 3^{d/3})$` | 845.21 | `n * n * 3 ^ (n / 3) / p` |
| ✗ | Classical | Chiba and Nishizeki | 1985 | Enumerating Maximal Cliques, arbitrary graph | `$O(a(G)m 3^{n/3})$` | 845.215 | Uses a; G |
| ✓ | Classical | M. Chrobak and D. Eppstein | 1989 | Enumerating Maximal Cliques, arbitrary graph | `$O(n d^2 2^d)$` | 850.015 | `n * n ^ 2 * 2 ^ n / p` |
| ✓ | Classical | Shuji Tsukiyama, Mikio Ide, Hiromu Ariyoshi, and Isao Shirakawa | 1977 | Enumerating Maximal Cliques, arbitrary graph | `$O(nm 3^{n/3})$` | 845.215 | `n * n ^ 2 * 3 ^ (n / 3) / p` |
| ✓ | Classical | Kazuhisa Makino, Takeaki Uno; Section 5 | 2004 | Enumerating Maximal Cliques, arbitrary graph | `$O(n^{\omega} 3^{n/3})$` | 845.2118 | `n ^ 2.371552 * 3 ^ (n / 3) / p` |
| ✓ | Quantum | Wenmin Han, Shiqi Zheng, Peian Chen, Yukun Wang |  | Enumerating Maximal Cliques, arbitrary graph | `O(\sqrt{3^{n/3}})` |  | `sqrt(3 ^ (n / 3))` |
| ✗ | Quantum | Childs & Eisenberg |  | k-Clique | `O(n^{k/(k+1)})` |  | Uses k (size of clique) |
| ✗ | Quantum (parallel) | Izumi et al. |  | Exact k-Clique | `O(n^{1-2/(k-1)})` |  | Uses k (size of clique) |
| ✗ | Quantum | Williams et al. |  | Max-Weight k-Clique | `O(n^{k/2})` |  | Uses k (size of clique) |
| ✓ | Quantum | Williams et al. |  | Max-Weight Clique | `O(n^2)` |  | `n ^ 2` |

## Cycle Detection

Assumption: Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.  
Classical variations: Cycle Detection (0 of 2 usable exact); (no variation) (0 of 3 usable exact)  
Quantum variations: Cycle Detection (1 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✗ | Classical | Sedgewick; Szymanski; and Yao | 1982 | Cycle Detection | `$(\mu + \lambda)(1+\Theta(1/\sqrt{M}))$` | 10 | Uses μ; λ; M (number of memory cells available) |
| ✗ | Classical | Nivasch | 2004 | Cycle Detection | `$O(\mu + \lambda)$` | 10 | Uses μ; λ |
| ✗ | Classical | Floyd's tortoise and hare algorithm | 1967 |  | `$O((\lambda + \mu) t_f)$` | 10 | Uses λ; μ; t_f (time to perform one evaluation of f) |
| ✗ | Classical | Brent's algorithm | 1973 |  | `$O((\lambda + \mu) t_f)$` | 10 | Uses λ; μ; t_f (time to perform one evaluation of f) |
| ✗ | Classical | Gosper's algorithm | 1978 |  | `$O((\lambda + \mu) \log(\lambda + \mu) t_f)$` | 11 | Uses λ; μ; t_f (time to perform one evaluation of f) |
| ✓ | Quantum | Cade et al. | 2016 | Cycle Detection | `O(n^{3/2})` |  | `n ^ (3 / 2)` |

## Strongly Connected Components

Default classical: Pearce (2016)  
Default quantum: Beigi & Taghavi (2021)  
Variation compared: SCCs  
Assumption: Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.  
Classical variations: SCCs (7 of 13 usable exact); Transitive Closure (1 of 1 usable exact)  
Quantum variations: Strongly Connected Components (1 of 1 usable exact); Connected Components in an undirected graph (1 of 1 usable exact); Transitive Closure of a symmetric Boolean matrix (0 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Kosaraju's algorithm | 1978 | SCCs | `$O(V+E)$` | 10 | `(n + n ^ 2) / p` |
| ✓ | Classical | Tarjan's strongly connected components algorithm | 1972 | SCCs | `$O(V+E)$` | 10 | `(n + n ^ 2) / p` |
| ✓ | Classical | Path-based strong components algorithm; Dijkstra | 1976 | SCCs | `$O(V+E)$` | 10 | `(n + n ^ 2) / p` |
| ✓ | Classical (parallel) | Fleischer forward-backward (FB) algorithm | 2003 | SCCs | `$O(E\log V+V)$` | 11 | `n ^ 2 * log2(n) + n` |
| ✓ | Classical | Pearce | 2016 | SCCs | `$O(V+E)$` | 10 | `(n + n ^ 2) / p` |
| ✓ | Classical | Path-based depth-first search Gabow | 2000 | SCCs | `$O(V+E)$` | 10 | `(n + n ^ 2) / p` |
| ✓ | Classical | Paul Purdom | 1970 | Transitive Closure | `$O(V^2+VE)$` | 16 | `(n ^ 2 + n * n ^ 2) / p` |
| ✓ | Classical (parallel) | Lowe’s Algorithm | 2014 | SCCs | `$O(V^2)$` | 10 | `n ^ 2` |
| ✗ | Classical (parallel) | Renault’s Algorithm | 2009 | SCCs | `$O(p(V+E) \alpha(V, E))$` |  | Couldn't read the formula |
| ✓ | Classical | Couvreur | 1999 | SCCs | `$O(V+E)$` | 10 | `(n + n ^ 2) / p` |
| ✓ | Classical | Munro’s algorithm | 1971 | SCCs | `$O(E + V \log V)$` | 10 | `(n ^ 2 + n * log2(n)) / p` |
| ✓ | Classical (parallel) | OBF Algorithm | 2011 | SCCs | `$O(V(V+E))$` | 16 | `n * (n + n ^ 2)` |
| ✓ | Classical (parallel) | CH Algorithm | 2004 | SCCs | `$O(VE)$` | 16 | `n * n ^ 2` |
| ✓ | Classical (parallel) | Hong’s algorithm | 2013 | SCCs | `$O(V(V+E))$` | 16 | `n * (n + n ^ 2)` |
| ✓ | Quantum | Beigi & Taghavi | 2021 | Strongly Connected Components | `O(n^(3/2) (log n)^2)` |  | `n ^ (3 / 2) * log2(n) ^ 2` |
| ✓ | Quantum | Dürr et al. | 2004 | Connected Components in an undirected graph | `O(n^(3/2))` |  | `n ^ (3 / 2)` |
| ✗ | Quantum | Le Gall | 2012 | Transitive Closure of a symmetric Boolean matrix | `O(n*sqrt(l) + l*sqrt(n))` |  | Uses l (number of non-zero entries in the transitive closure) |

## Longest Common Subsequence

Assumption: Assumes both strings have length n.  
Classical variations: LCS (1 of 15 usable exact)  
Quantum variations: none

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Wagner and Fischer | 1974 | LCS | `$O(mn)$` | 20 | `n * n / p` |
| ✗ | Classical | Hunt and Szymanski | 1977 | LCS | `$O((n + p) \log n)$` | 21 | Uses p (the number of dominant matches (AKA number of minimal candidates), i.e. the total number of ordered pairs of positions at which the two sequences match) |
| ✗ | Classical | Mukhopadhyay | 1980 | LCS | `$O((n + p) \log n)$` | 21 | Uses p (the number of dominant matches (AKA number of minimal candidates), i.e. the total number of ordered pairs of positions at which the two sequences match) |
| ✗ | Classical | Hsu and Du (Scheme 2) | 1984 | LCS | `$O(rm \log(n/r) + rm)$` | 20 | Uses r (length of the LCS) |
| ✗ | Classical | Apostolico and Guerra (HS1 Algorithm) | 1987 | LCS | `$O(m \log n +p \log(2mn/p))$` | 20 | Uses p (the number of dominant matches (AKA number of minimal candidates), i.e. the total number of ordered pairs of positions at which the two sequences match) |
| ✗ | Classical | Kuo and Cross | 1989 | LCS | `$O(p + n(r+\log n))$` | 20 | Uses p (the number of dominant matches (AKA number of minimal candidates), i.e. the total number of ordered pairs of positions at which the two sequences match); r (length of the LCS) |
| ✗ | Classical | Rick (Algorithm 2) | 1995 | LCS | `$O(sn + \min(r(n - r), rm))$` | 20 | Uses s (size of alphabet); r (length of the LCS) |
| ✗ | Classical | Rick (Section 4) | 1995 | LCS | `$O(sn + \min(sp, rm))$` | 20 | Uses s (size of alphabet); p (the number of dominant matches (AKA number of minimal candidates), i.e. the total number of ordered pairs of positions at which the two sequences match); r (length of the LCS) |
| ✗ | Classical | Hirschberg | 1977 | LCS | `$O(rn + n \log n)$` | 20 | Uses r (length of the LCS) |
| ✗ | Classical | Hsu and Du (Scheme 1) | 1984 | LCS | `$O(rm \log(n/m) + rm)$` | 20 | Uses r (length of the LCS) |
| ✗ | Classical | Apostolico and Guerra (Algorithm 2) | 1987 | LCS | `$O(rm + sn + n \log s)$` | 20 | Uses r (length of the LCS); s (size of alphabet) |
| ✗ | Classical | Chin and Poon | 1991 | LCS | `$O(sn + \min(sp, rm))$` | 20 | Uses s (size of alphabet); p (the number of dominant matches (AKA number of minimal candidates), i.e. the total number of ordered pairs of positions at which the two sequences match); r (length of the LCS) |
| ✗ | Classical | Nakatsu et al. | 1982 | LCS | `$O(n(m-r))$` | 20 | Uses r (length of the LCS) |
| ✗ | Classical | Miller and Myers | 1985 | LCS | `$O(n(m-r))$` | 20 | Uses r (length of the LCS) |
| ✗ | Classical | Wu et al. | 1990 | LCS | `$O(n(m-r))$` | 20 | Uses r (length of the LCS) |

## Longest Common Substring

Assumption: Assumes both strings have length n.  
Classical variations: none  
Quantum variations: Longest Common Subsequence (2 of 2 usable exact); Non-repetitive strings (1 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Quantum | Le Gall, Seddighin | 2020 | Longest Common Subsequence | `Õ(n^(5/6))` |  | `n ^ (5 / 6)` |
| ✓ | Quantum | Akmal, Jin | 2022 | Longest Common Subsequence | `Õ(n^(2/3))` |  | `n ^ (2 / 3)` |
| ✓ | Quantum | Le Gall, Seddighin | 2020 | Non-repetitive strings | `Õ(n^(3/4))` |  | `n ^ (3 / 4)` |

## Longest Palindromic Substring

Default classical: Gusfield (1997)  
Default quantum: Quantum Query Algorithm for LPS (2022)  
Variation compared: Longest Palindromic Substring  
Classical variations: Longest Palindromic Substring (5 of 5 usable exact)  
Quantum variations: Longest Palindrome Substring (2 of 2 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Naive | 1940 | Longest Palindromic Substring | `$O(n^3)$` | 30 | `n ^ 3 / p` |
| ✓ | Classical | Dynamic Programming | 1953 | Longest Palindromic Substring | `$O(n^2)$` | 20 | `n ^ 2 / p` |
| ✓ | Classical | Manacher | 1975 | Longest Palindromic Substring | `$O(n)$` | 10 | `n / p` |
| ✓ | Classical | Jeuring | 1994 | Longest Palindromic Substring | `$O(n)$` | 10 | `n / p` |
| ✓ | Classical | Gusfield | 1997 | Longest Palindromic Substring | `$O(n)$` | 10 | `n / p` |
| ✓ | Quantum | Quantum Circuit Algorithm for LPS | 2023 | Longest Palindrome Substring | `O(sqrt(n)log^4(n))` | 6.24 | `sqrt(n) * log2(n) ^ 4` |
| ✓ | Quantum | Quantum Query Algorithm for LPS | 2022 | Longest Palindrome Substring | `O˜(sqrt(n))` | 6.24 | `sqrt(n)` |

## Matrix Chain Multiplication

Default classical: T. C. Hu ; M. T. Shing (1982)  
Default quantum: Caroppo et al. (2025)  
Variation compared: Matrix Chain Ordering Problem  
Classical variations: Matrix Chain Ordering Problem (3 of 3 usable exact); Approximate MCSP (0 of 1 usable exact); Approximate MCOP (0 of 1 usable exact); Matrix Chain Scheduling Problem (0 of 1 usable exact)  
Quantum variations: Matrix Chain Ordering Problem (1 of 1 usable exact); Successive Matrix Multiplication (0 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Brute Force | 1940 | Matrix Chain Ordering Problem | `$O(4^n)$` | 2000 | `4 ^ n / p` |
| ✓ | Classical | Dynamic Programming Algorithm (S. S. Godbole) | 1953 | Matrix Chain Ordering Problem | `$O(n^3)$` | 30 | `n ^ 3 / p` |
| ✓ | Classical | T. C. Hu ; M. T. Shing | 1982 | Matrix Chain Ordering Problem | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical (approx.) | Heejo Lee; Jong Kim; Sungje Hong; and Sunggu Lee | 1997 | Approximate MCSP | `$O(n^2)$` | 20 | `n ^ 2 / p` |
| ✓ | Classical (parallel) | Prakesh Ramanan | 1996 | Approximate MCOP | `$O(\log^4 n)$` | 4 | `log2(n) ^ 4` |
| ✓ | Classical (parallel) | Czumaj | 1993 | Matrix Chain Scheduling Problem | `$O(\log^3 n)$` | 3 | `log2(n) ^ 3` |
| ✓ | Quantum | Caroppo et al. | 2025 | Matrix Chain Ordering Problem | `\tilde{O}(n^{2.5})` |  | `n ^ 2.5` |
| ✗ | Quantum (approx.) | Li et al. | 2025 | Successive Matrix Multiplication | `O(\sqrt{K} poly(\log N, \kappa))` |  | Not specific (poly or polylog) |

## Optimal Binary Search Trees

Classical variations: Approximate OBST (0 of 5 usable exact); Alphabetic Tree Problem (3 of 3 usable exact); OBST (4 of 4 usable exact)  
Quantum variations: Huffman Encoding (1 of 2 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical (approx.) | Melhorn's Approximation algorithm | 1975 | Approximate OBST | `$O(n)$` | 10 | `n / p` |
| ✓ | Classical (parallel) | Karpinski | 1996 | Approximate OBST | `$O(n^{0.6})$` | 6.5 | `n ^ 0.6` |
| ✓ | Classical | Klawe; Mumey | 1993 | Alphabetic Tree Problem | `$O(n)$` | 10 | `n / p` |
| ✓ | Classical (approx.) | Larmore | 1987 | Approximate OBST | `$O(n^{1.6})$` | 16.4 | `n ^ 1.6 / p` |
| ✓ | Classical | Garsia–Wachs algorithm | 1977 | Alphabetic Tree Problem | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical | Hu–Tucker algorithm | 1971 | Alphabetic Tree Problem | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical | Knuth's DP algorithm | 1971 | OBST | `$O(n^2)$` | 20 | `n ^ 2 / p` |
| ✓ | Classical | DP algorithm (Gilbert, Moore) | 1959 | OBST | `$O(n^3)$` | 30 | `n ^ 3 / p` |
| ✓ | Classical | Naive algorithm | 1940 | OBST | `$O(4^n/n^{3/2})$` | 1999.85 | `4 ^ n / n ^ (3 / 2) / p` |
| ✓ | Classical | Yao | 1982 | OBST | `$O(n^2)$` | 20 | `n ^ 2 / p` |
| ✓ | Classical (approx.) | Levcopoulos; Lingas; Sack | 1989 | Approximate OBST | `$O(n)$` | 10 | `n / p` |
| ✓ | Classical (approx.) | de Prisco | 1993 | Approximate OBST | `$O(n)$` | 10 | `n / p` |
| ✗ | Quantum | Braunstein et al. | 2018 | Huffman Encoding | `O(N^2 * (logN) ^ a)` |  | Uses a |
| ✓ | Quantum | Tolba et al. | 2013 | Huffman Encoding | `O(n(log n)^2)` |  | `n * log2(n) ^ 2` |

## Maximum Cut

Default classical: Brute Force (1975)  
Default quantum: Chang et al. (2023)  
Variation compared: Maximum Cut  
Assumption: Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.  
Assumption: The classical default is brute force, the only exact algorithm in the sheet. Faster exact algorithms exist (Williams 2005, about 1.73ⁿ), so the quantum advantage shown is an upper bound.  
Classical variations: Maximum Cut (1 of 1 usable exact); Maximum Cut for Planar Graphs (0 of 1 usable exact); Maximum Cut, Approximate (0 of 1 usable exact)  
Quantum variations: High-girth graphs (0 of 1 usable exact); (no variation) (1 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Brute Force | 1975 | Maximum Cut | `$O(m 2^n)$` | 1000.2 | `n ^ 2 * 2 ^ n / p` |
| ✗ | Classical | Hadlock | 1975 | Maximum Cut for Planar Graphs | `$O(n^4)$?` | 400 | Marked uncertain in the sheet (?) |
| ✗ | Classical (approx.) | Dunning; Gupta & Silberholz | 2018 | Maximum Cut, Approximate | `$O(\text{poly}(n))$` |  | Not specific (poly or polylog) |
| ✗ | Quantum | QAOA | 2014 | High-girth graphs | `` |  | No complexity in the sheet |
| ✓ | Quantum | Chang et al. | 2023 |  | `O(2^(n/2))` |  | `2 ^ (n / 2)` |

## Graph Isomorphism

Assumption: Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.  
Classical variations: Graph Isomorphism, General Graphs (1 of 1 usable exact); Graph Isomorphism, Bounded Number of Vertices of Each Color (1 of 1 usable exact); Isomorphism of strongly regular graphs (1 of 1 usable exact); (no variation) (2 of 3 usable exact); Subgraph Isomorphism (0 of 1 usable exact); Circulant graphs (1 of 1 usable exact); Partial k-trees (0 of 1 usable exact); Hypergraphs isomorphism (0 of 1 usable exact)  
Quantum variations: none

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Babai and Luks | 1983 | Graph Isomorphism, General Graphs | `$\exp(n^{1/2 + o(1)})$` |  | `e ^ n ^ (1 / 2) / p` |
| ✓ | Classical | Babai | 1980 | Graph Isomorphism, Bounded Number of Vertices of Each Color | `$o(\exp(2n^{1/2}\log^2 n))$` | 770 | `e ^ (2 * n ^ (1 / 2) * log2(n) ^ 2) / p` |
| ✓ | Classical | Spielman | 1996 | Isomorphism of strongly regular graphs | `$n^{O(n^{1/3} \log n)}$` | 806 | `n ^ (n ^ (1 / 3) * log2(n)) / p` |
| ✗ | Classical | McKay | 1981 |  | `$O((m_1 + m_2)n^3 + m_2 n^2 L)$; possibly $O(\exp(O(n\log n))))$?` | 9000 | Marked uncertain in the sheet (?) |
| ✓ | Classical | Schmidt & Druffel | 1976 |  | `$O(n\cdot n!)$` | 925.005 | `n * sqrt(2 * pi * n) * (n / e) ^ n / p` |
| ✗ | Classical (parallel) | Ullman | 1976 | Subgraph Isomorphism | `` |  | No complexity in the sheet |
| ✓ | Classical | Babai | 2017 |  | `$2^{O(\log n)^3}$` | 600 | `2 ^ log2(n) ^ 3 / p` |
| ✓ | Classical | Muzychuk | 2004 | Circulant graphs | `$O(n^2)$` |  | `n ^ 2 / p` |
| ✗ | Classical | Bodlaender | 1990 | Partial k-trees | `$O(n^{k+4.5})$` |  | Uses k (graphs which are partial k-trees) |
| ✗ | Classical | Babai & Codenotti | 2008 | Hypergraphs isomorphism | `$\exp(O(k^2 \sqrt{n}))$` |  | Uses k (rank of hypergraph) |

## Nearest Neighbor Search

Default classical: Linear search (1940)  
Default quantum: Durr & Hoyer (1996)  
Variation compared: Nearest Neighbor Search (NNS)  
Classical variations: k-ANNS (0 of 1 usable exact); Nearest Neighbor Search (NNS) (3 of 3 usable exact)  
Quantum variations: (no variation) (2 of 6 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical (approx.) | Hierarchical Navigable Small World (HNSW) | 2018 | k-ANNS | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical | Linear search | 1940 | Nearest Neighbor Search (NNS) | `$O(n)$` | 10 | `n / p` |
| ✓ | Classical | k-d Tree | 1975 | Nearest Neighbor Search (NNS) | `k-d Tree construction: $O(n \log n)$ NNS: $O(n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical | R-tree | 1984 | Nearest Neighbor Search (NNS) | `R-Tree construction: $O(n \log n)$ NNS: $O(n)$` | 11 | `n * log2(n) / p` |
| ✓ | Quantum | Durr & Hoyer | 1996 |  | `O(sqrt(N))` |  | `sqrt(n)` |
| ✗ | Quantum | Lloyd et al. | 2013 |  | `O(klog(kMN))` |  | Uses k (clusters); M (vectors) |
| ✗ | Quantum | Wiebe et al. | 2014 |  | `O( sqrt(M) * s^2 / epsilon^2 )` |  | Uses M (number of training vectors); s (sparsity of vectors, epsilon: additive error); ε |
| ✗ | Quantum | Kerenidis et al. | 2018 |  | `O~( (k d eta / delta^2) * kappa(V) * ( mu(V) + (k eta / delta) ) ; O~( k^2 d eta^2.5 / delta^3` |  | Couldn't read the formula |
| ✗ | Quantum | Gao et al. | 2024 |  | `O~(sqrt(n*k))` |  | Uses k (number of minimum elements to be found,) |
| ✓ | Quantum | Ruan et al. | 2017 |  | `O(n^3)` |  | `n ^ 3` |

## Sorting

Default classical: Tim Sort (2002)  
Default quantum: Jacokes (2007)  
Variation compared: Comparison Sorting  
Classical variations: Comparison Sorting (13 of 16 usable exact); Non-Comparison Sorting (5 of 9 usable exact)  
Quantum variations: (no variation) (5 of 6 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Insertion Sort | 1940 | Comparison Sorting | `$O(n^2)$` | 20 | `n ^ 2 / p` |
| ✓ | Classical | Selection Sort | 1962 | Comparison Sorting | `$O(n^2)$` | 20 | `n ^ 2 / p` |
| ✓ | Classical | Merge Sort | 1945 | Comparison Sorting | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical | Bubble Sort | 1956 | Comparison Sorting | `$O(n^2)$` | 20 | `n ^ 2 / p` |
| ✓ | Classical | Intro Sort | 1997 | Comparison Sorting | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical | Heap Sort | 1964 | Comparison Sorting | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✗ | Classical | Counting Sort | 1954 | Non-Comparison Sorting | `$O(n+k)$` | 10 | Uses k (range of non-negative key values) |
| ✓ | Classical | Bucket Sort | 1940 | Non-Comparison Sorting | `$O(n^2)$` | 20 | `n ^ 2 / p` |
| ✗ | Classical | Radix Sort | 1940 | Non-Comparison Sorting | `$O(wn)$` | 11 | Uses w (length of word) |
| ✓ | Classical | Tree sort | 1986 | Comparison Sorting | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical | Quick Sort | 1961 | Comparison Sorting | `$O(n^2)$` | 20 | `n ^ 2 / p` |
| ✓ | Classical | Tim Sort | 2002 | Comparison Sorting | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical (parallel) | Cube Sort Parallel Implementation | 1992 | Comparison Sorting | `$O(n \log n)$` | 11 | `n * log2(n)` |
| ✓ | Classical | Shell Sort (Shell) | 1959 | Comparison Sorting | `$O(n^2)$` | 20 | `n ^ 2 / p` |
| ✓ | Classical | Shell Sort (Frank & Lazarus) | 1960 | Comparison Sorting | `$O(n^{1.5})$` | 16 | `n ^ 1.5 / p` |
| ✓ | Classical | Shell Sort (Pratt) | 1971 | Comparison Sorting | `$O(n \log^2 n)$` | 12 | `n * log2(n) ^ 2 / p` |
| ✓ | Classical | Shell Sort (Sedgewick) | 1986 | Comparison Sorting | `$O(n^{1.33})$` | 15.4 | `n ^ 1.33 / p` |
| ✓ | Classical (parallel) | Bitonic Merge Sort Parallel Implementation | 1968 | Comparison Sorting | `$O(\log^2 n)$` |  | `log2(n) ^ 2` |
| ✓ | Classical | Thorup's Sorting Algorithm | 2002 | Non-Comparison Sorting | `$O(n \log \log n)$` | 10.1 | `n * log2(log2(n)) / p` |
| ✓ | Classical | Flash Sort | 1998 | Non-Comparison Sorting | `$O(n^2)$` | 20 | `n ^ 2 / p` |
| ✓ | Classical | Bead Sort | 2002 | Non-Comparison Sorting | `$O(n)$` | 10 | `n / p` |
| ✗ | Classical | Burst Sort | 2004 | Non-Comparison Sorting | `$O(wn)$` | 11 | Uses w (length of word) |
| ✓ | Classical | Spreadsort | 2002 | Non-Comparison Sorting | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical (parallel) | Odd Even Sort Parallel Implementation | 1972 | Comparison Sorting | `$O(n^2)$` | 20 | `n ^ 2` |
| ✓ | Classical (parallel) | Spaghetti Sort Parallel Implementation | 1984 | Non-Comparison Sorting | `$O(n)$` | 10 | `n` |
| ✓ | Quantum | Farhi, Goldstone, Gutmann, Sipser | 1999 |  | `O(n*log(n))` |  | `n * log2(n)` |
| ✓ | Quantum | Høyer, Neerbek, Shi | 2002 |  | `O(n*log(n))` |  | `n * log2(n)` |
| ✓ | Quantum | Jacokes | 2007 |  | `O(n*log(n))` |  | `n * log2(n)` |
| ✓ | Quantum | Childs, Landahl, Parrilo | 2006 |  | `O(n*log(n))` |  | `n * log2(n)` |
| ✗ | Quantum | Ben-Or, Hassidim | 2008 |  | `` |  | No complexity in the sheet |
| ✓ | Quantum | Quantum Merge Sort | 2006 |  | `O(n*log(n))` |  | `n * log2(n)` |

## Lowest Common Ancestor

Classical variations: Off-Line Lowest Common Ancestor (0 of 1 usable exact); Lowest Common Ancestor with Static Trees (0 of 4 usable exact)  
Quantum variations: All-Pairs LCA in DAGs (1 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✗ | Classical | Tarjan's off-line lowest common ancestors algorithm | 1984 | Off-Line Lowest Common Ancestor | `$O(n+m)$` | 10 | Uses m (number of total number of operations (queries, links, and cuts)) |
| ✗ | Classical | Schieber; Vishkin | 1988 | Lowest Common Ancestor with Static Trees | `$O(n+m)$` | 10 | Uses m (number of total number of operations (queries, links, and cuts)) |
| ✗ | Classical | Berkman; Vishkin | 1993 | Lowest Common Ancestor with Static Trees | `$O(n+m)$?` | 10 | Marked uncertain in the sheet (?) |
| ✗ | Classical | Bender; Colton [LCA <=> RMQ] | 2000 | Lowest Common Ancestor with Static Trees | `$O(n+m)$` | 10 | Uses m (number of total number of operations (queries, links, and cuts)) |
| ✗ | Classical | Stephen Alstrup, Cyril Gavoille, Haim Kaplan & Theis Rauhe | 2004 | Lowest Common Ancestor with Static Trees | `$O(n+m)$` | 10 | Uses m (number of total number of operations (queries, links, and cuts)) |
| ✓ | Quantum | Kowaluk & Lingas | 2020 | All-Pairs LCA in DAGs | `\tilde{O}(n^{2.434})` |  | `n ^ 2.434` |

## Maximum Cardinality Matching

Default classical: Mucha, Sankowski (general) (2004)  
Default quantum: Kimmel, Witter (2021)  
Variation compared: General Graph MCM  
Assumption: Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.  
Classical variations: Bipartite Graph MCM (2 of 4 usable exact); Planar Bipartite Graph MCM (1 of 1 usable exact); General Graph MCM (4 of 4 usable exact); Planar Bipartite Graph Perfect Matching (1 of 1 usable exact)  
Quantum variations: General Graphs MCM (Adjacency List Model) (2 of 2 usable exact); General Graphs MCM (Adjacency Matrix Model) (4 of 4 usable exact); Bipartite Graphs MCM (Adjacency List Model) (3 of 3 usable exact); Bipartite Graphs MCM (Adjacency Matrix Model) (3 of 4 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Ford–Fulkerson algorithm | 1956 | Bipartite Graph MCM | `$O(VE)$` | 16 | `n * n ^ 2 / p` |
| ✓ | Classical | Hopcroft–Karp algorithm | 1973 | Bipartite Graph MCM | `$O(V^{0.5} E)$` | 15.25 | `n ^ 0.5 * n ^ 2 / p` |
| ✓ | Classical | Mucha; Sankowski (planar) | 2006 | Planar Bipartite Graph MCM | `$O(V^{\omega/2})$` | 15.097 | `n ^ (2.371552 / 2) / p` |
| ✗ | Classical | Madry's algorithm | 2013 | Bipartite Graph MCM | `$O(E^{10/7} \text{polylog}(V))$` | 15.614 | Not specific (poly or polylog) |
| ✗ | Classical | Chandran and Hochbaum | 2011 | Bipartite Graph MCM | `$O(\min(Vk, E)+\sqrt{k}\min(k^2, E))$` | 30 | Uses k |
| ✓ | Classical | Blum | 1990 | General Graph MCM | `$O(V^{0.5} E)$` | 15.25 | `n ^ 0.5 * n ^ 2 / p` |
| ✓ | Classical | Gabow; Tarjan | 1991 | General Graph MCM | `$O(V^{0.5} E)$` | 15.25 | `n ^ 0.5 * n ^ 2 / p` |
| ✓ | Classical | Mucha, Sankowski (general) | 2004 | General Graph MCM | `$O(V^{\omega})$` | 15.109 | `n ^ 2.371552 / p` |
| ✓ | Classical | Klein (section 5) | 1997 | Planar Bipartite Graph Perfect Matching | `$O(V^{4/3} \log V)$` | 15.41 | `n ^ (4 / 3) * log2(n) / p` |
| ✓ | Classical | Micali; Vazirani | 1980 | General Graph MCM | `$O(E \sqrt{V})$` | 26.5 | `n ^ 2 * sqrt(n) / p` |
| ✓ | Quantum | Dörn 1 | 2009 | General Graphs MCM (Adjacency List Model) | `O(n*sqrt(m)*log^2(n))` |  | `n * sqrt(n ^ 2) * log2(n) ^ 2` |
| ✓ | Quantum | Dörn 1 | 2009 | General Graphs MCM (Adjacency Matrix Model) | `O(n^2*log^2(n))` |  | `n ^ 2 * log2(n) ^ 2` |
| ✓ | Quantum | Ambainis, Spalek 2 | 2005 | General Graphs MCM (Adjacency List Model) | `O(n^2*(sqrt(m/n)+log(n))*log(n))` |  | `n ^ 2 * (sqrt(n ^ 2 / n) + log2(n)) * log2(n)` |
| ✓ | Quantum | Ambainis, Spalek 2 | 2005 | General Graphs MCM (Adjacency Matrix Model) | `O(n^(5/2)*log(n))` |  | `n ^ (5 / 2) * log2(n)` |
| ✓ | Quantum | Kimmel, Witter | 2021 | General Graphs MCM (Adjacency Matrix Model) | `O(n^(7/4))` |  | `n ^ (7 / 4)` |
| ✓ | Quantum | Kimmel, Witter | 2021 | General Graphs MCM (Adjacency Matrix Model) | `O(n^(3/4)*sqrt(m+n))` |  | `n ^ (3 / 4) * sqrt(n ^ 2 + n)` |
| ✓ | Quantum | Ambainis, Spalek 1 | 2005 | Bipartite Graphs MCM (Adjacency List Model) | `O(n*sqrt(n+m)*log(n))` |  | `n * sqrt(n + n ^ 2) * log2(n)` |
| ✓ | Quantum | Ambainis, Spalek 1 | 2005 | Bipartite Graphs MCM (Adjacency Matrix Model) | `O(n^2*log(n))` |  | `n ^ 2 * log2(n)` |
| ✓ | Quantum | Furrow | 2006 | Bipartite Graphs MCM (Adjacency List Model) | `O(n*sqrt((n+m)*log(n)))` |  | `n * sqrt((n + n ^ 2) * log2(n))` |
| ✓ | Quantum | Furrow | 2006 | Bipartite Graphs MCM (Adjacency Matrix Model) | `O(n^2*sqrt(log(n)))` |  | `n ^ 2 * sqrt(log2(n))` |
| ✗ | Quantum | Lin, Lin | 2014 | Bipartite Graphs MCM (Adjacency Matrix Model) | `O(n^(3/2)*p^(1/4))` |  | Uses p |
| ✓ | Quantum | Beighi, Taghavi | 2020 | Bipartite Graphs MCM (Adjacency List Model) | `O(n^(3/4)*sqrt(m+n))` |  | `n ^ (3 / 4) * sqrt(n ^ 2 + n)` |
| ✓ | Quantum | Blikstad, Van Den Brand, Efron, Mukhopaghyay, Nanongkai | 2022 | Bipartite Graphs MCM (Adjacency Matrix Model) | `O(n^(3/2)*log^2(n))` |  | `n ^ (3 / 2) * log2(n) ^ 2` |

## Minimum Spanning Tree

Default classical: Prim's algorithm + Fibonacci heaps; Fredman & Tarjan (1987)  
Default quantum: Dürr, Heiligman, Høyer, Mhalla 2 (2004)  
Variation compared: Undirected, General MST  
Assumption: Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.  
Classical variations: Undirected, General MST (11 of 13 usable exact)  
Quantum variations: Undirected, General MST (Adjacency List Model) (1 of 1 usable exact); Undirected, General MST (Adjacency Matrix Model) (1 of 1 usable exact); Undirected, General MST (1 of 1 usable exact); Undirected, General MST (Quantum Walks) (1 of 1 usable exact); Undirect, Verification (1 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Kruskal’s algorithm with demand-sorting | 1991 | Undirected, General MST | `$O(E \log V)$` | 11 | `n ^ 2 * log2(n) / p` |
| ✓ | Classical | Quick Kruskal algorithm | 2006 | Undirected, General MST | `$O(E \log V)$` | 11 | `n ^ 2 * log2(n) / p` |
| ✓ | Classical | Karger; Klein & Tarjan | 1995 | Undirected, General MST | `$O(\min(V^2, E \log V))$` | 11 | `min(n ^ 2, n ^ 2 * log2(n)) / p` |
| ✓ | Classical | Borůvka's algorithm | 1926 | Undirected, General MST | `$O(E \log V)$` | 11 | `n ^ 2 * log2(n) / p` |
| ✓ | Classical | Prim's algorithm + adjacency matrix searching | 1957 | Undirected, General MST | `$O(V^2)$` | 20 | `n ^ 2 / p` |
| ✓ | Classical | Prim's algorithm + Fibonacci heaps; Fredman & Tarjan | 1987 | Undirected, General MST | `$O(E + V \log V)$` | 10 | `(n ^ 2 + n * log2(n)) / p` |
| ✓ | Classical | Kruskal's algorithm | 1956 | Undirected, General MST | `$O(E \log E)$` | 11 | `n ^ 2 * log2(n ^ 2) / p` |
| ✓ | Classical | Yao's algorithm | 1975 | Undirected, General MST | `$O(E \log \log V)$` | 10.1 | `n ^ 2 * log2(log2(n)) / p` |
| ✓ | Classical | Cheriton-Tarjan Algorithm | 1976 | Undirected, General MST | `$O(E \log \log V)$` | 10.1 | `n ^ 2 * log2(log2(n)) / p` |
| ✓ | Classical | Filter Kruskal algorithm | 2009 | Undirected, General MST | `$O(E \log V)$` | 11 | `n ^ 2 * log2(n) / p` |
| ✗ | Classical | Chazelle's algorithm | 2000 | Undirected, General MST | `$O(E \alpha(E, V))$` | 10.0005 | Couldn't read the formula |
| ✓ | Classical | Thorup (reverse-delete) | 2000 | Undirected, General MST | `$O(E \log V (\log \log V)^3)$` | 11.3 | `n ^ 2 * log2(n) * log2(log2(n)) ^ 3 / p` |
| ✓ | Classical (parallel) | Bader & Cong Parallel Implementation | 2006 | Undirected, General MST | `$O(E \log(V)/p)$` |  | `n ^ 2 * log2(n) / p` |
| ✓ | Quantum | Dürr, Heiligman, Høyer, Mhalla 2 | 2004 | Undirected, General MST (Adjacency List Model) | `O(sqrt(n*m))` |  | `sqrt(n * n ^ 2)` |
| ✓ | Quantum | Dürr, Heiligman, Høyer, Mhalla 2 | 2004 | Undirected, General MST (Adjacency Matrix Model) | `O(n^(3/2))` |  | `n ^ (3 / 2)` |
| ✓ | Quantum | Heiligman | 2003 | Undirected, General MST | `O(n^(7/4))` |  | `n ^ (7 / 4)` |
| ✓ | Quantum | Luiz, Fanchini, de Albuquerque, Papa, de Oliviera | 2025 | Undirected, General MST (Quantum Walks) | `O(n^2)` |  | `n ^ 2` |
| ✓ | Quantum | Heiligman | 2011 | Undirect, Verification | `O(n + sqrt(m) * log(n))` |  | `n + sqrt(n ^ 2) * log2(n)` |

## Shortest Path

Default classical: Dijkstra's algorithm with list (Whiting & Hillier 1960) (1960)  
Default quantum: Heiligman 2 (2003)  
Variation compared: Nonnegative Weights  
Assumption: Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.  
Assumption: Largest edge cost L = 100 (from the sheet).  
Classical variations: general weights (2 of 2 usable exact); Nonnegative Weights (5 of 5 usable exact); Nonnegative Integer Weights (3 of 3 usable exact)  
Quantum variations: General Weights (Adjacency List Model) (1 of 1 usable exact); General Weights (Adjacency Matrix Model) (1 of 1 usable exact); Nonnegative Weights (1 of 1 usable exact); Nonnegative Weights (Adjacency List Model) (2 of 2 usable exact); Nonnegative Weights (Adjacency Matrix Model) (2 of 2 usable exact); Directed Acyclic Graphs (Adjacency List Model) (1 of 1 usable exact); Directed Acyclic Graphs (Adjacency Matrix Model) (1 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Bellman–Ford algorithm (Ford 1956) | 1956 | general weights | `$O(V^2 EL)$` | 1000.02 | `n ^ 2 * n ^ 2 * 100 / p` |
| ✓ | Classical | Bellman–Ford algorithm (Shimbel 1955; Bellman 1958; Moore 1959) | 1959 | general weights | `$O(VE)$` | 16 | `n * n ^ 2 / p` |
| ✓ | Classical | Bellman–Ford algorithm (Dantzig 1960) | 1960 | Nonnegative Weights | `$O(V^2 \log V)$` | 11 | `n ^ 2 * log2(n) / p` |
| ✓ | Classical | Dijkstra's algorithm with list (Whiting & Hillier 1960) | 1960 | Nonnegative Weights | `$O(V^2)$` | 10 | `n ^ 2 / p` |
| ✓ | Classical | Dijkstra's algorithm with binary heap (Johnson 1977) | 1977 | Nonnegative Weights | `$O((E + V) \log V)$` | 11 | `(n ^ 2 + n) * log2(n) / p` |
| ✓ | Classical | Dijkstra's algorithm with Fibonacci heap (Fredman & Tarjan 1984; Fredman & Tarjan 1987) | 1984 | Nonnegative Weights | `$O(E + V \log V)$` | 10 | `(n ^ 2 + n * log2(n)) / p` |
| ✓ | Classical | Dijkstra's algorithm with Fibonacci heap (Johnson 1981; Karlsson & Poblete 1983) | 1981 | Nonnegative Integer Weights | `$O(E \log \log L)$` | 11 | `n ^ 2 * log2(log2(100)) / p` |
| ✓ | Classical | Gabow's algorithm | 1983 | Nonnegative Weights | `$O(E \log L/\log(2+(E/V)))$` | 21 | `n ^ 2 * log2(100) / log2(2 + n ^ 2 / n) / p` |
| ✓ | Classical | Gabow Ahuja Algorithm | 1990 | Nonnegative Integer Weights | `$O(E + V \sqrt{\log(L)} )$` | 10 | `(n ^ 2 + n * sqrt(log2(100))) / p` |
| ✓ | Classical | Thorup's algorithm | 2004 | Nonnegative Integer Weights | `$O(E + V \min(\log \log V, \log \log L))$` | 10 | `(n ^ 2 + n * min(log2(log2(n)), log2(log2(100)))) / p` |
| ✓ | Quantum | Furrow 1 | 2006 | General Weights (Adjacency List Model) | `O(n^(3/2)*m^(1/2)*sqrt(log(n))` |  | `n ^ (3 / 2) * (n ^ 2) ^ (1 / 2) * sqrt(log2(n))` |
| ✓ | Quantum | Furrow 1 | 2006 | General Weights (Adjacency Matrix Model) | `O(n^(5/2)*sqrt(log(n))` |  | `n ^ (5 / 2) * sqrt(log2(n))` |
| ✓ | Quantum | Heiligman 2 | 2003 | Nonnegative Weights | `O(n^(7/4))` |  | `n ^ (7 / 4)` |
| ✓ | Quantum | Dürr, Heiligman, Høyer, Mhalla 1 | 2004 | Nonnegative Weights (Adjacency List Model) | `O(sqrt(n*m)*log^2(n))` |  | `sqrt(n * n ^ 2) * log2(n) ^ 2` |
| ✓ | Quantum | Dürr, Heiligman, Høyer, Mhalla 1 | 2004 | Nonnegative Weights (Adjacency Matrix Model) | `O(n^(3/2)*log^2(n))` |  | `n ^ (3 / 2) * log2(n) ^ 2` |
| ✓ | Quantum | Furrow 2 | 2006 | Nonnegative Weights (Adjacency List Model) | `O(sqrt(n*m)*log(n))` |  | `sqrt(n * n ^ 2) * log2(n)` |
| ✓ | Quantum | Furrow 2 | 2006 | Nonnegative Weights (Adjacency Matrix Model) | `O(n^(3/2)*log(n))` |  | `n ^ (3 / 2) * log2(n)` |
| ✓ | Quantum | Khadiev, Safina | 2019 | Directed Acyclic Graphs (Adjacency List Model) | `O(sqrt(n*m)*log(n))` |  | `sqrt(n * n ^ 2) * log2(n)` |
| ✓ | Quantum | Khadiev, Safina | 2019 | Directed Acyclic Graphs (Adjacency Matrix Model) | `O(n^(3/2)*log(n))` |  | `n ^ (3 / 2) * log2(n)` |

## All-Pairs Shortest Paths

Default classical: Floyd–Warshall algorithm (1962)  
Default quantum: Furrow 3 (2006)  
Variation compared: APSP  
Assumption: Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.  
Classical variations: APSP on Dense Directed Graphs with Arbitrary Weights (2 of 2 usable exact); APSP (1 of 1 usable exact); APSP on Dense Undirected Unweighted Graphs; APSP on Sparse Undirected Unweighted Graphs (1 of 1 usable exact); APSP on Dense Undirected Graphs with Arbitrary Weights; APSP on Sparse Undirected Graphs with Arbitrary Weights (0 of 1 usable exact); APSP on Dense Undirected Graphs with Positive Integer Weights; APSP on Sparse Undirected Graphs with Positive Integer Weights (1 of 1 usable exact); APSP on Geometrically Weighted Graphs (1 of 1 usable exact); APSP on Dense Directed Graphs with Arbitrary Weights; APSP on Dense Undirected Graphs with Arbitrary Weights (1 of 1 usable exact)  
Quantum variations: APSP (Adjacency List Model) (1 of 1 usable exact); APSP (Adjacency Matrix Model) (1 of 1 usable exact); APSP on Geometrically Weighted Graphs (0 of 1 usable exact); APSP on Sparse Directed Graphs with Arbitrary Weights (1 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Shimbel Algorithm | 1953 | APSP on Dense Directed Graphs with Arbitrary Weights | `$O(n^4)$` | 40 | `n ^ 4 / p` |
| ✓ | Classical | Floyd–Warshall algorithm | 1962 | APSP | `$O(n^3)$` | 30 | `n ^ 3 / p` |
| ✓ | Classical | Seidel's algorithm | 1995 | APSP on Dense Undirected Unweighted Graphs; APSP on Sparse Undirected Unweighted Graphs | `$O(n^{2.373} \log n)$` | 26.1 | `n ^ 2.373 * log2(n) / p` |
| ✓ | Classical | Williams | 2014 | APSP on Dense Directed Graphs with Arbitrary Weights | `$O(n^3/2^{\sqrt{\log n}})$` | 29.1 | `n ^ 3 / 2 ^ sqrt(log2(n)) / p` |
| ✗ | Classical | Pettie & Ramachandran | 2002 | APSP on Dense Undirected Graphs with Arbitrary Weights; APSP on Sparse Undirected Graphs with Arbitrary Weights | `$O(mn \log \alpha(m,n))$` |  | Couldn't read the formula |
| ✓ | Classical | Thorup | 1999 | APSP on Dense Undirected Graphs with Positive Integer Weights; APSP on Sparse Undirected Graphs with Positive Integer Weights | `$O(mn)$` | 20 | `n ^ 2 * n / p` |
| ✓ | Classical | Chan (Geometrically Weighted) | 2009 | APSP on Geometrically Weighted Graphs | `$O(n^{2.844})$` | 28.5 | `n ^ 2.844 / p` |
| ✓ | Classical | Chan | 2009 | APSP on Dense Directed Graphs with Arbitrary Weights; APSP on Dense Undirected Graphs with Arbitrary Weights | `$O(n^3 \log^3 \log n / \log^2 n)$` | 29.4 | `n ^ 3 * log2(log2(n)) ^ 3 / log2(n) ^ 2 / p` |
| ✓ | Quantum | Furrow 3 | 2006 | APSP (Adjacency List Model) | `O(sqrt(n^3*m)*log(n) + n^2*log^3(n))` |  | `sqrt(n ^ 3 * n ^ 2) * log2(n) + n ^ 2 * log2(n) ^ 3` |
| ✓ | Quantum | Furrow 3 | 2006 | APSP (Adjacency Matrix Model) | `O(n^(5/2)*log(n))` |  | `n ^ (5 / 2) * log2(n)` |
| ✗ | Quantum | Nayebi, Williams | 2014 | APSP on Geometrically Weighted Graphs | `O(n^(5/2 - ε))` |  | Uses ε |
| ✓ | Quantum | Prasad | 2025 | APSP on Sparse Directed Graphs with Arbitrary Weights | `O(n^5/2 + m)` |  | `n ^ 5 / 2 + n ^ 2` |

## Maximum Flow

Default classical: Cheriyan et al. (1990)  
Default quantum: Apers, Auza, Lee (2024)  
Variation compared: st-Maximum Flow  
Assumption: Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.  
Classical variations: (no variation) (6 of 11 usable exact); st-Maximum Flow (5 of 6 usable exact); Integer Maximum Flow (0 of 3 usable exact)  
Quantum variations: Integer Maximum Flow (0 of 2 usable exact); st-Maximum Flow (2 of 3 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✗ | Classical | Ford & Fulkerson | 1955 |  | `$O(E^2U)$` | 850.02 | Uses U (maximum edge capacity) |
| ✓ | Classical | Dinitz | 1970 |  | `$O(V^2 E)$` | 20 | `n ^ 2 * n ^ 2 / p` |
| ✓ | Classical | Edmonds & Karp | 1972 |  | `$O(E^2 V)$` | 26.5 | `(n ^ 2) ^ 2 * n / p` |
| ✓ | Classical | Karzanov | 1974 |  | `$O(V^3)$` | 16 | `n ^ 3 / p` |
| ✓ | Classical | Galil & Naamad | 1980 |  | `$O(VE \log^2 V)$` | 16.2 | `n * n ^ 2 * log2(n) ^ 2 / p` |
| ✗ | Classical | Dantzig | 1951 |  | `$O(V^2EU)$` | 1000.02 | Uses U (maximum edge capacity) |
| ✗ | Classical | Dinitz (with dynamic trees) | 1973 |  | `$O(VE \log U)$` | 20 | Uses U (maximum edge capacity) |
| ✓ | Classical | Cherkassky | 1977 |  | `$O(V^2E^{0.5})$` | 16 | `n ^ 2 * (n ^ 2) ^ 0.5 / p` |
| ✓ | Classical | Sleator & Tarjan | 1983 |  | `$O(VE \log V)$` | 16.1 | `n * n ^ 2 * log2(n) / p` |
| ✗ | Classical | Goldberg & Tarjan | 1986 |  | `$O(VE \log (V^2/E))$` | 16 | Formula doesn't give a positive number |
| ✗ | Classical | Ahuja & Orlin | 1987 |  | `$O(VE + V^2 \log U)$` | 16 | Uses U (maximum edge capacity) |
| ✓ | Classical | Cheriyan & Hagerup | 1989 | st-Maximum Flow | `$O(VE \log V)$` | 16.1 | `n * n ^ 2 * log2(n) / p` |
| ✓ | Classical | Cheriyan et al. | 1990 | st-Maximum Flow | `$O(V^3 / \log V)$` | 15.95 | `n ^ 3 / log2(n) / p` |
| ✓ | Classical | Alon | 1990 | st-Maximum Flow | `$O(VE + V^{2.66} \log V)$` | 16 | `(n * n ^ 2 + n ^ 2.66 * log2(n)) / p` |
| ✗ | Classical | King et al. (KRT) | 1992 | st-Maximum Flow | `$O(VE + V^{2+\epsilon})$` | 16 | Uses ε (any positive real number) |
| ✓ | Classical | Phillips & Westbrook | 1993 | st-Maximum Flow | `$O(VE(\log(V)/\log(V/E) + (\log V)^2))$` | 16 | `n * n ^ 2 * (log2(n) / log2(n / n ^ 2) + log2(n) ^ 2) / p` |
| ✗ | Classical | Goldberg & Rao | 1997 | Integer Maximum Flow | `$O(E^{1.5} \log(V^2/E) \log U)$` | 20 | Uses U (maximum edge capacity) |
| ✗ | Classical | Goldberg & Rao | 1997 | Integer Maximum Flow | `$O(V^{0.66}E \log(V^2/E) \log U)$` | 16.9 | Uses U (maximum edge capacity) |
| ✓ | Classical | James B Orlin's + KRT (King; Rao; Tarjan)'s algorithm | 2013 | st-Maximum Flow | `$O(VE)$` | 16 | `n * n ^ 2 / p` |
| ✗ | Classical | Ahuja, Orlin, Tarjan | 1987 | Integer Maximum Flow | `$O(VE \log((V \log U)/(E \log \log U) + 2))$` | 16.1 | Uses U (maximum edge capacity) |
| ✗ | Quantum | Krauss, McCollum, Pendery, Litwin, Michaels 1 | 2020 | Integer Maximum Flow | `O(E*D*(log(U))^2)` | 36.5 | Uses U (maximum edge capacity) |
| ✗ | Quantum | Krauss, McCollum, Pendery, Litwin, Michaels 2 | 2020 | st-Maximum Flow | `` |  | No complexity in the sheet |
| ✗ | Quantum | Ambainis, Špalek | 2006 | Integer Maximum Flow | `O(min((V^(7/6) * E^(1/2) * U^(1/3)), (V^(1/2) * U^(1/2) * E)) * log(V))` |  | Uses U (maximum edge capacity) |
| ✓ | Quantum | Yu, Tsai, Chou, Kuo | 2007 | st-Maximum Flow | `O(V^2.5)` |  | `n ^ 2.5` |
| ✓ | Quantum | Apers, Auza, Lee | 2024 | st-Maximum Flow | `O(V^1.83)` |  | `n ^ 1.83` |

## Convex Hull

Default classical: Chan's algorithm (1996)  
Default quantum: Lanzagorta & Uhlmann (2004)  
Variation compared: 2-dimensional  
Assumption: Assumes √n of the points are on the hull (from the sheet).  
Classical variations: 2-dimensional (6 of 7 usable exact); 2-dimensional; 3-dimensional (2 of 2 usable exact); (no variation) (1 of 1 usable exact)  
Quantum variations: 2-dimensional Convex Hull (1 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Brute Force | 1935 | 2-dimensional | `$O(n^3)$` | 30 | `n ^ 3 / p` |
| ✓ | Classical | Jarvis | 1973 | 2-dimensional | `$O(nh)$` | 20 | `n * sqrt(n) / p` |
| ✓ | Classical | Graham | 1972 | 2-dimensional | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical | W. Eddy Quickhull | 1977 | 2-dimensional | `$O(nh)$` | 20 | `n * sqrt(n) / p` |
| ✓ | Classical | Preparata and Hong | 1977 | 2-dimensional; 3-dimensional | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical | Andrew's algorithm | 1979 | 2-dimensional | `$O(n \log n)$` | 11 | `n * log2(n) / p` |
| ✓ | Classical | The ultimate planar convex hull algorithm | 1986 | 2-dimensional | `$O(n \log h)$` | 11 | `n * log2(sqrt(n)) / p` |
| ✓ | Classical | Chan's algorithm | 1996 | 2-dimensional; 3-dimensional | `$O(n \log h)$` | 11 | `n * log2(sqrt(n)) / p` |
| ✓ | Classical (parallel) | Miller; Stout | 1988 | 2-dimensional | `$O(\log n)$ time using $O(n)$ processors` |  | `log2(n)` |
| ✓ | Classical | convex hull algorithm; Preparata and Hong | 1977 |  | `$O(n \log n)$` |  | `n * log2(n) / p` |
| ✓ | Quantum | Lanzagorta & Uhlmann | 2004 | 2-dimensional Convex Hull | `O(N^(1/2) h)` |  | `n ^ (1 / 2) * sqrt(n)` |

## String Search

Default classical: Two-way String-Matching Algorithm (1991)  
Default quantum: bit-parallelism quantum search (2025)  
Variation compared: Single String Search  
Assumption: Assumes the pattern is n/9 characters long (from the sheet).  
Classical variations: Single String Search (9 of 23 usable exact); Multiple String Search (1 of 3 usable exact); (no variation) (0 of 1 usable exact)  
Quantum variations: Single String Search (7 of 7 usable exact); n-dimensional pattern matching (0 of 1 usable exact); Multiple String Search (0 of 1 usable exact); Single String Search but assumes unique occurence of string in text (1 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Naïve string-search algorithm | 1940 | Single String Search | `$O(m(n-m+1))$` | 20 | `n / 9 * (n - n / 9 + 1) / p` |
| ✓ | Classical | Knuth-Morris-Pratt (KMP) algorithm | 1977 | Single String Search | `$O(m+n)$` | 10 | `(n / 9 + n) / p` |
| ✗ | Classical | Boyer-Moore (BM) algorithm | 1977 | Single String Search | `$O(mn + s)$` | 20 | Uses s (size of the alphabet) |
| ✓ | Classical | Rabin-Karp (RK) algorithm | 1987 | Single String Search | `$O(mn)$` | 20 | `n / 9 * n / p` |
| ✓ | Classical | Bitap algorithm | 1964 | Single String Search | `$O(mn)$` | 20 | `n / 9 * n / p` |
| ✓ | Classical | Tuned Boyer-Moore algorithm | 1991 | Single String Search | `$O(mn)$` | 20 | `n / 9 * n / p` |
| ✓ | Classical | Two-way String-Matching Algorithm | 1991 | Single String Search | `$O(n + m)$` | 10 | `(n + n / 9) / p` |
| ✓ | Classical | String-Matching with Finite Automata | 1940 | Single String Search | `$O(mn)$` | 20 | `n / 9 * n / p` |
| ✓ | Classical | Quick-Skip Searching | 2012 | Single String Search | `$O(mn)$` | 20 | `n / 9 * n / p` |
| ✗ | Classical | Fast Hybrid Algorithm | 2017 | Single String Search | `$O(n+m+s)$` | 10 | Uses s (size of the alphabet) |
| ✓ | Classical (parallel) | Backward Non-Deterministic DAWG Matching (BNDM) | 1998 | Single String Search | `$O(n+m)$` | 10 | `n + n / 9` |
| ✓ | Classical | Commentz-Walter Algorithm | 1979 | Multiple String Search | `$O(mn)$` | 20 | `n / 9 * n / p` |
| ✗ | Classical | Aho–Corasick (AC) Algorithm | 1975 | Multiple String Search | `$O(n + m + z)$` | 10 | Uses z (number of matches) |
| ✗ | Classical | Boyer-Moore-Horspool (BMH) | 1980 | Single String Search | `$O(mn + s)$` | 20 | Uses s (size of the alphabet) |
| ✗ | Classical | Raita Algorithm | 1991 | Single String Search | `$O(mn + s)$` | 20 | Uses s (size of the alphabet) |
| ✓ | Classical | BOM (Backward Oracle Matching) | 1999 | Single String Search | `$O(mn)$` | 20 | `n / 9 * n / p` |
| ✗ | Classical | Apostolico–Giancarlo Algorithm | 1986 | Single String Search | `$O(m + s + n)$` | 10 | Uses s (size of the alphabet) |
| ✓ | Classical (parallel) | Kedem et al. | 1989 | Single String Search | `$O(\log n)$` |  | `log2(n)` |
| ✓ | Classical (parallel) | Galil | 1995 | Single String Search | `$O(1)$` |  | `1` |
| ✓ | Classical (parallel) | Berkman et al. | 1989 | Single String Search | `$O(\log \log m)$` |  | `log2(log2(n / 9))` |
| ✓ | Classical (parallel) | Vishkin | 1985 | Single String Search | `$O(\log m)$` |  | `log2(n / 9)` |
| ✓ | Classical (parallel) | Ferragina, Luccio | 1999 | Multiple String Search | `$O((n \log^2 n)/p)$ + $O((gn \log^2 n)/(p \log(n/p)))$ + $O((km/p)+k)$ + $O(kg+(km/p)g)$` |  | `n * log2(n) ^ 2 / p` |
| ✓ | Classical (parallel) | Lee, Erçal | 1997 | Single String Search | `$O(1)$` |  | `1` |
| ✓ | Classical (parallel) | Czumaj, Galil, Gąsieniec, Park, Plandowski (1) | 1995 | Single String Search | `$O(\log n)$` |  | `log2(n)` |
| ✓ | Classical (parallel) | Czumaj, Galil, Gąsieniec, Park, Plandowski (2) | 1995 | Single String Search | `$O(\log n)$` |  | `log2(n)` |
| ✗ | Classical (parallel) | Alzoabi, Alosaimi, Bedaiwi | 2013 | Single String Search | `$O(n/k + m - 1)$` |  | Uses k |
| ✓ | Classical (parallel) | Rasool, Khare (parallel KMP) | 2012 |  | `$O(n/p + n)$` |  | `n / p + n` |
| ✓ | Quantum | Ramesh, Vinay | 2000 | Single String Search | `O(sqrt(n)log(sqrt(n/m))log(m)+sqrt(m)log^2(m))` |  | `sqrt(n) * log2(sqrt(n / (n / 9))) * log2(n / 9) + sqrt(n / 9) * log2(n / 9) ^ 2` |
| ✓ | Quantum | Niroula, Nam | 2021 | Single String Search | `O(sqrt(n)(logn^2+logm))` | 6.21 | `sqrt(n) * (log2(n) ^ 2 + log2(n / 9))` |
| ✓ | Quantum | Montanaro | 2014 | Single String Search | `O(sqrt(n/m)(logm)^(3/2)(logn)2^(3/2sqrt(2log_2(3)log_2(m))))` |  | `sqrt(n / (n / 9)) * log2(n / 9) ^ (3 / 2) * log2(n) * 2 ^ (3 / 2 * sqrt(2 * log2(3) * log2(n / 9)))` |
| ✗ | Quantum | Montanaro | 2014 | n-dimensional pattern matching | `\tildaO((n/m)^{d/2}(2^O(d^3/2sqrt(log(m))))` |  | Uses d (number of dimension) |
| ✓ | Quantum | Ablayev et al. | 2020 | Single String Search | `O(sqrt(n)(logn+sqrt(logn+logm)*(loglogn+loglogm)))` | 6.25 | `sqrt(n) * (log2(n) + sqrt(log2(n) + log2(n / 9)) * (log2(log2(n)) + log2(log2(n / 9))))` |
| ✗ | Quantum | Khadiev, Serov | 2024 | Multiple String Search | `O(n+\sqrt{mLlogn}logb+mlogn)` | 10 | Uses L (total length of patterns); b (maximum length of patterns) |
| ✓ | Quantum | Prousalis, Kydros, Konofaos | 2024 | Single String Search | `O(n^2)` | 20 | `n ^ 2` |
| ✓ | Quantum | COEQUAL | 2020 | Single String Search | `O(nlogn)` | 11 | `n * log2(n)` |
| ✓ | Quantum | de Jesus, Aborot, Adorna | 2013 | Single String Search but assumes unique occurence of string in text | `O(sqrt(n)*logn)` | 6.1 | `sqrt(n) * log2(n)` |
| ✓ | Quantum | bit-parallelism quantum search | 2025 | Single String Search | `\tildaO(sqrt(n))` | 6.1 | `sqrt(n)` |

## Vertex Cover

Default classical: Chen; I. Kanj; and W. Jia. (2006)  
Default quantum: Wang, Liang, Bao, Wu (2023)  
Variation compared: The Vertex Cover Problem  
Assumption: Assumes a dense graph (m = n² edges). On sparse graphs the quantum speedup largely disappears.  
Assumption: Assumes the cover size k equals n, the worst case. This is a placeholder to revisit.  
Classical variations: The Vertex Cover Problem (9 of 9 usable exact); The Vertex Cover Problem, Degrees Bounded By 3 (1 of 1 usable exact)  
Quantum variations: The Vertex Cover Problem (1 of 1 usable exact)

| | Side | Algorithm | Year | Variation | Sheet text | Code | Formula or reason |
|---|---|---|---|---|---|---|---|
| ✓ | Classical | Brute force (backtracking search) | 1940 | The Vertex Cover Problem | `$O(2^k n^{O(1)})$` | 850.09 | `2 ^ n * n ^ 1 / p` |
| ✓ | Classical | Sam Buss | 1993 | The Vertex Cover Problem | `$O(kn + 2^k k^{2k + 2})$` | 940 | `(n * n + 2 ^ n * n ^ (2 * n + 2)) / p` |
| ✓ | Classical | Chen; I. Kanj; and W. Jia. | 2001 | The Vertex Cover Problem | `$O(kn + 1.2852^k)$` | 843.5996 | `(n * n + 1.2852 ^ n) / p` |
| ✓ | Classical | Chandran and F. Grandoni | 2004 | The Vertex Cover Problem | `$O(\min(1.2759^k k^{1.5}, 1.2745^k k^4) + kn)$` | 843.4201 | `(min(1.2759 ^ n * n ^ 1.5, 1.2745 ^ n * n ^ 4) + n * n) / p` |
| ✓ | Classical | Chen; I. Kanj; and W. Jia. | 2006 | The Vertex Cover Problem | `$O(1.2738^k+ kn)$` | 843.4 | `(1.2738 ^ n + n * n) / p` |
| ✓ | Classical | J. Chen; L. Liu; and W. Jia. | 2000 | The Vertex Cover Problem, Degrees Bounded By 3 | `$O(k 1.2192^k)$` | 842.8 | `n * 1.2192 ^ n / p` |
| ✓ | Classical | Balasubramanian; Fellows | 1996 | The Vertex Cover Problem | `$O(kn + 1.324718^k k^2)$` | 844.0101 | `(n * n + 1.324718 ^ n * n ^ 2) / p` |
| ✓ | Classical | Papadimitriou and M Yannakakis | 1996 | The Vertex Cover Problem | `$O(3^k n)$` | 855.805 | `3 ^ n * n / p` |
| ✓ | Classical | Niedermeier, Rossmanith | 1999 | The Vertex Cover Problem | `$O(kn + 1.29175^k k^2)$` | 843.6101 | `(n * n + 1.29175 ^ n * n ^ 2) / p` |
| ✓ | Classical | Downey | 1998 | The Vertex Cover Problem | `$O(kn + 1.31951^k k^2)$` | 844.01 | `(n * n + 1.31951 ^ n * n ^ 2) / p` |
| ✓ | Quantum | Wang, Liang, Bao, Wu | 2023 | The Vertex Cover Problem | `O(n^2*2^(n/2))` |  | `n ^ 2 * 2 ^ (n / 2)` |
