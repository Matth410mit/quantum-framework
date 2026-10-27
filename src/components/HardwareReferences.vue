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
        hardwareName: "IBM 2025 (Superconducting)",
        year: 2025,
        link: "https://www.ibm.com/quantum/hardware#roadmap",
    },
    {
        hardwareName: "IQM (Superconducting)",
        year: 2025,
        link: "https://iqm.tech/technology/roadmap/",
    },
    {
        hardwareName: "Quantinuum (Trapped Ion)",
        year: 2025,
        link: "https://www.quantinuum.com/press-releases/quantinuum-unveils-accelerated-roadmap-to-achieve-universal-fault-tolerant-quantum-computing-by-2030",
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
        link: "https://www.pasqal.com/newsroom/pasqal-releases-2025-roadmap/",
        year: 2025,

    },
    {
        hardwareName: "Infleqtion (Neutral Atom)",
        link: "https://thequantuminsider.com/2026/09/24/infleqtion-achieves-30-entangled-logical-qubits-on-its-sqale-quantum-computer/",
        year: 2026,

    },
]
</script>