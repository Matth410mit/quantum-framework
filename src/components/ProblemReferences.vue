<template>
    <div class="flex flex-col gap-8 text-center">
        <div v-for="reference in references" :key="reference.problemName">
            <h2 class=" text-left font-bold mb-2 text-gray-800">{{ reference.problemName }}</h2>
            <div class="text-left">
                <div class="bg-green-50 p-2 rounded-lg">
                    <p class="text-xs text-green-700  ">Classical</p>
                    <p class="font-medium text-gray-900" >{{ reference.classicalReferenceTitle }} <span class="" v-html="katex.renderToString(reference.classicalRuntimeLabel)"></span></p> 
                    <p class="text-xs text-gray-600">
                        {{ reference.classicalReferenceLink }}
                    </p>
                </div>
            </div>
            <div class="text-left mt-2">
                <div class="bg-blue-50 p-2 rounded-lg">
                    <p class="text-xs text-blue-700 ">Quantum</p>

                    <p class="font-medium text-gray-900">{{ reference.quantumReferenceTitle }} <span class="" v-html="katex.renderToString(reference.quantumRuntimeLabel)"></span></p> 
                    <p class="text-xs text-gray-600">
                        {{ reference.quantumReferenceLink }}
                    </p>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import katex from 'katex';
import 'katex/dist/katex.min.css';

const references = [
    {
        problemName: "Database Search",
        classicalRuntimeLabel: "O(n)",
        classicalReferenceTitle: "Linear Search",
        classicalReferenceLink: "",

        quantumRuntimeLabel: "O(\\sqrt{n})",
        quantumReferenceTitle: "Grover's Algorithm",
        quantumReferenceLink: "Lov K. Grover. 1996. A fast quantum mechanical algorithm for database search. In Proceedings of the twenty-eighth annual ACM symposium on Theory of Computing (STOC '96). Association for Computing Machinery, New York, NY, USA, 212–219. https://doi.org/10.1145/237814.237866",
    },
    {
        problemName: "Integer Factorization",
        classicalRuntimeLabel: "O(e^{(64/9 * n)^{1/3} * \\ln(n)^{2/3}})",
        classicalReferenceTitle: "General Number Field Sieve",
        classicalReferenceLink: `Pomerance, Carl. "A tale of two sieves." Notices of the American Mathematical Society 43.12 (1996): 1473-1485.`,


        quantumRuntimeLabel: "O(n^{2} * \\ln(n))",
        quantumReferenceTitle: "Shor's Algorithm",
        quantumReferenceLink: "Peter Shor Algorithms for Quantum Computation: Discrete Logarithms and Factoring. In Proceedings of FOCS 1994, pg. 124-134.",
    },
    {
        problemName: "Traveling Salesman",
        classicalRuntimeLabel: "O(n^{3} * 2^{n})",
        classicalReferenceTitle: "Dynamic Programming",
        classicalReferenceLink: `Held, Michael, and Richard M. Karp. "A dynamic programming approach to sequencing problems." Journal of the Society for Industrial and Applied mathematics 10.1 (1962): 196-210.`,

        quantumRuntimeLabel: "O(n * 1.78^{n})",
        quantumReferenceTitle: "Quantum Approximate Optimization Algorithm",
        quantumReferenceLink: `A. Ambainis, K. Balodis, J. Iraids, M. Kokainis, K. Prusis, and J. Vihrovs Quantum speedups for exponential-time dynamic programming algorithms Proceedings of the 30th Annual ACM-SIAM Symposium on Discrete Algorithms (SODA 19), pg. 1783-1793, 2019. [arXiv:1807.05209]`,
    },
    {
        problemName: "Time Dependent Hartree-Fock Approximation (Quantum Chemistry)",
        classicalRuntimeLabel: "O(n^{3})",
        classicalReferenceTitle: "Hartree-Fock Approximation",
        classicalReferenceLink: `Galvez Vallejo, Jorge L., et al. "Toward an extreme-scale electronic structure system." The Journal of Chemical Physics 159.4 (2023).`,

        quantumRuntimeLabel: "O(n)",
        quantumReferenceTitle: "Variational Quantum Eigensolver",
        quantumReferenceLink: `Babbush, Ryan, et al. "Encoding electronic spectra in quantum circuits with linear T complexity." Physical Review X 8.4 (2018): 041015.`,
    },
    {
        problemName: "Full Configuration Interaction (Quantum Chemistry)",
        classicalRuntimeLabel: "O(n!)",
        classicalReferenceTitle: "Full Configuration Interaction",
        classicalReferenceLink: `Eriksen, Janus J., and Jürgen Gauss. "Incremental treatments of the full configuration interaction problem." Wiley Interdisciplinary Reviews: Computational Molecular Science 11.5 (2021): e1525.`,

        quantumRuntimeLabel: "O(n^{11})",
        quantumReferenceTitle: "Quantum Phase Estimation",
        quantumReferenceLink: `Sugisaki, Kenji, et al. "Quantum chemistry on quantum computers: A method for preparation of multiconfigurational wave functions on quantum computers without performing post-hartree–fock calculations." ACS central science 5.1 (2018): 167-175.`,
    },
]
</script>