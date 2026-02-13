<template>
    <div>
        <div class="table-responsive">
            <table class="min-w-full divide-y divide-gray-300 text-xs">
                <thead class="bg-gray-50">
                    <tr class="divide-x divide-gray-200 font-medium text-gray-500 text-xs">
                        <th class="p-2">Roadmap</th>
                        <th class="p-2">Year</th>
                        <th class="p-2">Reference</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                    <tr class="divide-x divide-gray-200" v-for="reference in references" :key="reference.hardwareName">
                        <td class="p-2">{{ reference.hardwareName }}</td>
                        <td class="p-2">{{ reference.year }}</td>
                        <td class="p-2"><a target="_blank" rel="noopener noreferrer" class="hover:underline"
                                :href="reference.link"> reference link</a></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>

const references = [
    {
        hardwareName: "IBM (Superconducting)",
        year: 2024,
        link: "https://www.ibm.com/roadmaps/quantum/2024/",

    },
    {
        hardwareName: "IonQ (Trapped Ion)",
        year: 2024,
        link: "https://ionq.com/posts/how-we-achieved-our-2024-performance-target-of-aq-35",
    },
    {
        hardwareName: "QuEra (Neutral Atom)",
        year: 2024,
        link: "https://www.quera.com/qec",
    },
    {
        hardwareName: "Rigetti (Superconducting)",
        year: 2024,
        link: "https://www.globenewswire.com/news-release/2022/05/16/2444311/0/en/Rigetti-Computing-Reports-First-Quarter-2022-Financial-Results-and-Provides-Business-Update.html",
        year: 2024,
    },
    {
        hardwareName: "Google (Superconducting)",
        link: "https://quantumai.google/static/site-assets/images/marketing/misc/roadmap.png",
        year: 2024,

    },
    {
        hardwareName: "Pasqal (Neutral Atom)",
        link: "https://www.hpcwire.com/2024/03/13/pasqal-issues-roadmap-to-10000-qubits-in-2026-and-fault-tolerance-in-2028/",
        year: 2024,

    },
    {
        hardwareName: "Infleqtion (Neutral Atom)",
        link: "https://www.nextbigfuture.com/2024/02/infleqtion-1600-qubit-array-today-and-five-year-roadmap-to-fault-tolerant-quantum-computers.html",
        year: 2024,

    },
    {
        hardwareName: "Quantum Silicon (Semiconductors)",
        link: "https://www.eetimes.eu/cea-leti-details-silicon-based-quantum-computing-roadmap/",
        year: 2024,
    }
]
</script>