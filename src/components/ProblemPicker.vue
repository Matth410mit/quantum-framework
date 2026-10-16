<script setup>
// Problem dropdown, grouped by domain. Groups are collapsed except the one
// holding the selected problem; typing a search opens every group.
import Multiselect from 'vue-multiselect'
import { computed, ref, watch } from 'vue';
import {
    groupedProblemOptions, getDefaultAlgorithm, problemDomain, algorithmCredit,
} from '../store/problemCatalog';

const props = defineProps({
    modelValue: Object,
});
const emit = defineEmits(['update:modelValue']);

const query = ref('');
const searching = computed(() => query.value.trim() !== '');

const openGroups = ref(new Set(props.modelValue ? [problemDomain(props.modelValue)] : []));
watch(() => props.modelValue, (problem) => {
    if (problem) openGroups.value = new Set([...openGroups.value, problemDomain(problem)]);
});

const groups = computed(() => groupedProblemOptions(query.value));
const groupInfo = computed(() => Object.fromEntries(groups.value.map(g => [g.label, {
    count: g.problems.length,
    open: searching.value || openGroups.value.has(g.label),
}])));
const allOpen = computed(() => groups.value.every(g => groupInfo.value[g.label].open));

// vue-multiselect drops empty groups, so a collapsed group keeps one hidden
// placeholder to keep its header in the list.
const options = computed(() => groups.value.map(g => groupInfo.value[g.label].open ? g : {
    label: g.label,
    problems: [{ problemName: `__collapsed__${g.label}`, $isDisabled: true, $collapsed: true }],
}));

function toggleGroup(label) {
    const next = new Set(openGroups.value);
    next.has(label) ? next.delete(label) : next.add(label);
    openGroups.value = next;
}

function toggleAll() {
    openGroups.value = allOpen.value ? new Set() : new Set(groups.value.map(g => g.label));
}

// Clicking a group header makes vue-multiselect try to select the whole
// group (an array); only single problems are accepted.
const selected = computed({
    get: () => props.modelValue,
    set: (value) => {
        if (value && !Array.isArray(value) && !value.$isDisabled) emit('update:modelValue', value);
    },
});

function label(algo) {
    return algo ? (algo.year ? `${algo.name} (${algo.year})` : algo.name) : '—';
}

function subtitle(problem) {
    return `${label(getDefaultAlgorithm(problem, 'classical'))} vs ${label(getDefaultAlgorithm(problem, 'quantum'))}`;
}

function credits(problem) {
    return ['classical', 'quantum']
        .map(type => {
            const credit = algorithmCredit(getDefaultAlgorithm(problem, type));
            return credit ? `${type === 'classical' ? 'Classical' : 'Quantum'}: ${credit}` : null;
        })
        .filter(Boolean)
        .join('\n\n');
}
</script>

<template>
    <multiselect class="custom-multiselect problem-picker mt-1" track-by="problemName" label="problemName"
        v-model="selected" :options="options" group-values="problems" group-label="label"
        :group-select="false" :searchable="true" :internal-search="false" @search-change="query = $event"
        @close="query = ''" :close-on-select="true" :allowEmpty="false" :show-labels="false"
        placeholder="Search problems">
        <template #beforeList>
            <div v-if="!searching && groups.length > 1" class="flex justify-end border-b px-3 py-1">
                <button type="button" class="text-xs text-blue-900 hover:underline" @mousedown.prevent.stop="toggleAll">
                    {{ allOpen ? 'Collapse all' : 'Expand all' }}
                </button>
            </div>
        </template>
        <template #option="{ option }">
            <span v-if="option.$collapsed" class="collapsed-placeholder"></span>
            <button v-else-if="option.$isLabel" type="button"
                class="group-toggle flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide"
                :aria-expanded="groupInfo[option.$groupLabel]?.open"
                @mousedown.prevent.stop="!searching && toggleGroup(option.$groupLabel)">
                <span class="inline-block w-3 transition-transform" :class="{ 'rotate-90': groupInfo[option.$groupLabel]?.open }">▸</span>
                <span>{{ option.$groupLabel }}</span>
                <span class="font-normal normal-case opacity-70">({{ groupInfo[option.$groupLabel]?.count }})</span>
            </button>
            <div v-else :title="credits(option)">
                <div>{{ option.problemName }}</div>
                <div class="text-xs opacity-70">{{ subtitle(option) }}</div>
            </div>
        </template>
        <template #noResult>No matching problems. Try Browse for the full list.</template>
    </multiselect>
</template>

<style>
/* The header button fills the row, so a click anywhere on it toggles the group. */
.problem-picker .multiselect__option--group,
.problem-picker .multiselect__option--disabled {
    padding: 0 !important;
    min-height: 0 !important;
    color: #374151 !important;
    background: #f3f4f6 !important;
}
.problem-picker .multiselect__element:has(.collapsed-placeholder) {
    display: none;
}
</style>
