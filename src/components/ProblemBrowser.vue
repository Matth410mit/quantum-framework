<template>
    <slot :openModal="openModal" />
    <TransitionRoot appear :show="isOpenModal" as="template">
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
                                    <button v-if="grouped && groups.length > 1 && !searching" type="button"
                                        class="ml-auto text-xs text-blue-900 hover:underline" @click="toggleAll">
                                        {{ allOpen ? 'Collapse all' : 'Expand all' }}
                                    </button>
                                </div>
                            </div>

                            <!-- Results -->
                            <div class="mt-3 max-h-[60vh] overflow-y-auto border rounded-lg">
                                <table class="w-full table-auto text-sm">
                                    <thead class="bg-gray-100 text-left text-xs text-gray-600 sticky top-0 z-10">
                                        <tr>
                                            <th v-for="col in columns" :key="col.key" class="p-0"
                                                :class="{ 'text-right': col.key === 'count' }"
                                                :aria-sort="sortKey === col.key ? (sortAsc ? 'ascending' : 'descending') : 'none'">
                                                <button type="button" class="flex w-full items-center gap-1 p-2 font-semibold hover:text-gray-900"
                                                    :class="{ 'justify-end': col.key === 'count', 'text-gray-900': sortKey === col.key }"
                                                    :title="col.hint" @click="sortBy(col.key)">
                                                    {{ col.label }}
                                                    <span class="w-2" aria-hidden="true">{{ sortKey === col.key ? (sortAsc ? '▲' : '▼') : '' }}</span>
                                                </button>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <template v-for="group in groups" :key="group.label">
                                            <tr v-if="grouped" class="border-t bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                :aria-expanded="isOpen(group.label)" @click="toggleGroup(group.label)">
                                                <td colspan="5" class="p-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
                                                    <span class="inline-block w-3 transition-transform" :class="{ 'rotate-90': isOpen(group.label) }">▸</span>
                                                    {{ group.label }}
                                                    <span class="font-normal normal-case text-gray-500">({{ group.rows.length }})</span>
                                                </td>
                                            </tr>
                                            <template v-if="!grouped || isOpen(group.label)">
                                                <tr v-for="row in group.rows" :key="row.problem.problemName"
                                                    class="border-t"
                                                    :class="row.hasQuantum
                                                        ? 'cursor-pointer hover:bg-red-50'
                                                        : 'text-gray-400 cursor-not-allowed'"
                                                    :aria-disabled="!row.hasQuantum"
                                                    @click="choose(row)">
                                                    <td class="p-2" :class="{ 'pl-6': grouped }">
                                                        <div class="font-medium">
                                                            {{ row.problem.problemName }}
                                                            <span v-if="row.problem.problemName === selected?.problemName"
                                                                class="ml-1 rounded bg-gray-200 px-1 text-xs text-gray-700">Selected</span>
                                                            <span v-if="row.problem.noSpeedup"
                                                                class="ml-1 rounded bg-amber-100 px-1 text-xs text-amber-800"
                                                                title="The best quantum algorithm in the sheet grows no slower than the best classical one">No known speedup</span>
                                                        </div>
                                                        <div v-if="row.problem.description" class="text-xs text-gray-600">{{ row.problem.description }}</div>
                                                        <div v-if="row.problem.sizeParameter" class="text-xs text-gray-500 italic">{{ row.problem.sizeParameter }}</div>
                                                        <div v-if="!row.hasQuantum" class="text-xs">No quantum algorithm yet</div>
                                                    </td>
                                                    <td class="p-2 text-xs">{{ problemDomain(row.problem) }}</td>
                                                    <td v-for="(algo, i) in [row.classical, row.quantum]" :key="i" class="p-2 text-xs">
                                                        <a v-if="algo?.url" :href="algo.url" target="_blank"
                                                            rel="noopener" class="text-blue-900 hover:underline" @click.stop
                                                            :title="algorithmCredit(algo)">{{ label(algo) }}</a>
                                                        <span v-else :title="algorithmCredit(algo)">{{ label(algo) }}</span>
                                                    </td>
                                                    <td class="p-2 text-xs text-right whitespace-nowrap">
                                                        {{ row.classicalCount }} classical · {{ row.quantumCount }} quantum
                                                    </td>
                                                </tr>
                                            </template>
                                        </template>
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
    getDefaultAlgorithm, algorithmCredit,
} from '../store/problemCatalog';

const props = defineProps({
    selected: { type: Object, default: null },
});
const emit = defineEmits(['select']);

const isOpenModal = ref(false);
const query = ref('');
const selectedDomains = ref([]);
const showWithoutQuantum = ref(true);

// Domain groups start collapsed, except the selected problem's.
const openGroups = ref(new Set());

function openModal() {
    openGroups.value = new Set(props.selected ? [problemDomain(props.selected)] : []);
    isOpenModal.value = true;
}
function closeModal() {
    isOpenModal.value = false;
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
        hasQuantum: quantumOptions.length > 0,
    };
}));

const domainOptions = computed(() => domainsInUse());

const filtersActive = computed(() =>
    query.value || selectedDomains.value.length || !showWithoutQuantum.value);
const searching = computed(() => query.value.trim() !== '');

// Sorting. Domain keeps the rows in collapsible domain groups; any other
// column shows one flat list.
const columns = [
    { key: 'problem', label: 'Problem', hint: 'Sort by name' },
    { key: 'domain', label: 'Domain', hint: 'Group by domain' },
    { key: 'classical', label: 'Default classical', hint: 'Sort by year' },
    { key: 'quantum', label: 'Default quantum', hint: 'Sort by year' },
    { key: 'count', label: 'Algorithms', hint: 'Sort by number of algorithms' },
];
const sortKey = ref('domain');
const sortAsc = ref(true);
const grouped = computed(() => sortKey.value === 'domain');

function sortBy(key) {
    if (sortKey.value === key) sortAsc.value = !sortAsc.value;
    else {
        sortKey.value = key;
        // Years and counts read best newest/largest first.
        sortAsc.value = key === 'problem' || key === 'domain';
    }
}

const byName = (a, b) => a.problem.problemName.localeCompare(b.problem.problemName);
// Missing values sort last in either direction.
function compareValues(a, b, asc) {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    return asc ? a - b : b - a;
}

const rows = computed(() => {
    const filtered = allRows.value
        .filter(r => matchesQuery(r.problem, query.value))
        .filter(r => !selectedDomains.value.length || selectedDomains.value.includes(problemDomain(r.problem)))
        .filter(r => showWithoutQuantum.value || r.hasQuantum);
    const dir = sortAsc.value ? 1 : -1;
    const domainIndex = r => domainOptions.value.indexOf(problemDomain(r.problem));
    const comparators = {
        problem: (a, b) => dir * byName(a, b),
        domain: (a, b) => dir * (domainIndex(a) - domainIndex(b)) || (b.hasQuantum - a.hasQuantum) || byName(a, b),
        classical: (a, b) => compareValues(a.classical?.year, b.classical?.year, sortAsc.value) || byName(a, b),
        quantum: (a, b) => compareValues(a.quantum?.year, b.quantum?.year, sortAsc.value) || byName(a, b),
        count: (a, b) => dir * ((a.classicalCount + a.quantumCount) - (b.classicalCount + b.quantumCount)) || byName(a, b),
    };
    return [...filtered].sort(comparators[sortKey.value]);
});

const groups = computed(() => {
    if (!grouped.value) return [{ label: 'All', rows: rows.value }];
    const result = [];
    for (const row of rows.value) {
        const label = problemDomain(row.problem);
        let group = result.find(g => g.label === label);
        if (!group) result.push(group = { label, rows: [] });
        group.rows.push(row);
    }
    return result;
});

// A search or domain filter opens every matching group.
function isOpen(label) {
    return searching.value || selectedDomains.value.length > 0 || openGroups.value.has(label);
}
const allOpen = computed(() => groups.value.every(g => isOpen(g.label)));

function toggleGroup(label) {
    if (searching.value || selectedDomains.value.length) return;
    const next = new Set(openGroups.value);
    next.has(label) ? next.delete(label) : next.add(label);
    openGroups.value = next;
}

function toggleAll() {
    openGroups.value = allOpen.value ? new Set() : new Set(groups.value.map(g => g.label));
}

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
