<template>
    <slot :openModal="openModal" />
    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="closeModal" class="relative z-10">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/25" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="duration-200 ease-in"
                        leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                        <DialogPanel
                            class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                                Browse problems
                            </DialogTitle>

                            <!-- Search and filters -->
                            <div class="mt-3 flex flex-col gap-3">
                                <input v-model="query" type="search"
                                    class="w-full border rounded-lg p-2 text-sm"
                                    placeholder="Search problems" />

                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="text-xs font-medium text-gray-600">Domain</span>
                                    <button v-for="domain in domainOptions" :key="domain" type="button"
                                        class="rounded-full border px-2 py-0.5 text-xs"
                                        :class="selectedDomains.includes(domain)
                                            ? 'bg-[#a32035] border-[#a32035] text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'"
                                        @click="toggleDomain(domain)">
                                        {{ domain }}
                                    </button>
                                </div>

                                <div class="flex flex-wrap items-center gap-4 text-sm">
                                    <label class="flex items-center gap-2 text-xs">
                                        <input type="checkbox" v-model="showWithoutQuantum" />
                                        Show problems with no quantum algorithm yet
                                    </label>
                                    <button v-if="filtersActive" type="button"
                                        class="text-xs text-blue-900 hover:underline" @click="clearFilters">
                                        Clear filters
                                    </button>
                                </div>
                            </div>

                            <!-- Results -->
                            <div class="mt-3 max-h-[60vh] overflow-y-auto border rounded-lg">
                                <table class="w-full table-auto text-sm">
                                    <thead class="bg-gray-100 text-left text-xs text-gray-600 sticky top-0">
                                        <tr>
                                            <th class="p-2">Problem</th>
                                            <th class="p-2">Domain</th>
                                            <th class="p-2">Default classical</th>
                                            <th class="p-2">Default quantum</th>
                                            <th class="p-2 text-right">Algorithms</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="row in rows" :key="row.problem.problemName"
                                            class="border-t"
                                            :class="row.hasQuantum
                                                ? 'cursor-pointer hover:bg-red-50'
                                                : 'text-gray-400 cursor-not-allowed'"
                                            :aria-disabled="!row.hasQuantum"
                                            @click="choose(row)">
                                            <td class="p-2">
                                                <div class="font-medium">
                                                    {{ row.problem.problemName }}
                                                    <span v-if="row.problem.problemName === selected?.problemName"
                                                        class="ml-1 rounded bg-gray-200 px-1 text-xs text-gray-700">Selected</span>
                                                    <span v-if="row.problem.popularRank != null"
                                                        class="ml-1 rounded bg-amber-100 px-1 text-xs text-amber-800">Popular</span>
                                                </div>
                                                <div v-if="row.problem.description" class="text-xs text-gray-600">{{ row.problem.description }}</div>
                                                <div v-if="row.problem.sizeParameter" class="text-xs text-gray-500 italic">{{ row.problem.sizeParameter }}</div>
                                                <div v-if="!row.hasQuantum" class="text-xs">No quantum algorithm yet</div>
                                            </td>
                                            <td class="p-2 text-xs">{{ problemDomain(row.problem) }}</td>
                                            <td v-for="(algo, i) in [row.classical, row.quantum]" :key="i" class="p-2 text-xs">
                                                <a v-if="algo?.reference?.url" :href="algo.reference.url" target="_blank"
                                                    rel="noopener" class="text-blue-900 hover:underline" @click.stop
                                                    :title="algo.reference.citation">{{ label(algo) }}</a>
                                                <span v-else :title="algo?.reference?.citation">{{ label(algo) }}</span>
                                            </td>
                                            <td class="p-2 text-xs text-right whitespace-nowrap">
                                                {{ row.classicalCount }} classical · {{ row.quantumCount }} quantum
                                                <div v-if="row.hiddenCount" class="text-gray-500"
                                                    title="In the algorithm sheet, but their formulas can't be calculated yet">
                                                    {{ row.hiddenCount }} hidden
                                                </div>
                                            </td>
                                        </tr>
                                        <tr v-if="rows.length === 0">
                                            <td colspan="5" class="p-4 text-center text-sm text-gray-500">
                                                No problems match these filters.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="mt-4 flex justify-between items-center">
                                <span class="text-xs text-gray-500">{{ rows.length }} of {{ problemCatalog.length }} problems</span>
                                <button type="button"
                                    class="inline-flex justify-center rounded-md border border-transparent bg-red-50 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    @click="closeModal">
                                    Close
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import { ref, computed } from 'vue';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import {
    problemCatalog, domainsInUse, problemDomain, matchesQuery, getAlgorithmOptions,
    getDefaultAlgorithm, getHiddenAlgorithmCount,
} from '../store/problemCatalog';

defineProps({
    selected: { type: Object, default: null },
});
const emit = defineEmits(['select']);

const isOpen = ref(false);
const query = ref('');
const selectedDomains = ref([]);
const showWithoutQuantum = ref(true);

function openModal() {
    isOpen.value = true;
}
function closeModal() {
    isOpen.value = false;
}
defineExpose({ openModal, closeModal });

const allRows = computed(() => problemCatalog.map(problem => {
    const classicalOptions = getAlgorithmOptions(problem, 'classical');
    const quantumOptions = getAlgorithmOptions(problem, 'quantum');
    return {
        problem,
        classical: getDefaultAlgorithm(problem, 'classical'),
        quantum: getDefaultAlgorithm(problem, 'quantum'),
        classicalCount: classicalOptions.length,
        quantumCount: quantumOptions.length,
        hiddenCount: getHiddenAlgorithmCount(problem, 'classical') + getHiddenAlgorithmCount(problem, 'quantum'),
        hasQuantum: quantumOptions.length > 0,
    };
}));

const domainOptions = computed(() => domainsInUse());

const filtersActive = computed(() =>
    query.value || selectedDomains.value.length || !showWithoutQuantum.value);

// Usable problems first, then by domain order and name.
const rows = computed(() => allRows.value
    .filter(r => matchesQuery(r.problem, query.value))
    .filter(r => !selectedDomains.value.length || selectedDomains.value.includes(problemDomain(r.problem)))
    .filter(r => showWithoutQuantum.value || r.hasQuantum)
    .sort((a, b) => (b.hasQuantum - a.hasQuantum)
        || domainOptions.value.indexOf(problemDomain(a.problem)) - domainOptions.value.indexOf(problemDomain(b.problem))
        || a.problem.problemName.localeCompare(b.problem.problemName)));

function toggleDomain(domain) {
    const i = selectedDomains.value.indexOf(domain);
    if (i === -1) selectedDomains.value.push(domain);
    else selectedDomains.value.splice(i, 1);
}

function clearFilters() {
    query.value = '';
    selectedDomains.value = [];
    showWithoutQuantum.value = true;
}

function label(algo) {
    if (!algo) return '—';
    return algo.year ? `${algo.name} (${algo.year})` : algo.name;
}

function choose(row) {
    if (!row.hasQuantum) return;
    emit('select', row.problem);
    closeModal();
}
</script>
