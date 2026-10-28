<script setup>
// One line per hardware over time, in two graphs: how far the largest problem
// it can run is past the smallest problem where quantum wins, speed or cost
// (crosses 1× in the QEA year), and below it the largest problem it can run.
// Lines are bold from the hardware's QEA year on. The calculation is in
// store/hardwareComparison.js; the page around it is HardwareComparisonPage.vue,
// which owns the choices (mode, hidden hardware) so it can put them in links.
import { Chart } from 'highcharts-vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import * as utils from '../store/utils'
import { useHardwaresStore } from '../store/hardwares'
import { findProblem } from '../store/problemCatalog'
import { compareHardwareOverTime, technologyLabel, TECHNOLOGY_ORDER, YEARS_SHOWN } from '../store/hardwareComparison'
import { nameWithoutTechnology } from '../store/technology'
import { boldAfterZones } from '../store/roadmapNotation'

const props = defineProps({
    // The problem and algorithms; each line applies one hardware to a copy.
    model: Object,
    // An algorithm key, or null for the automatic choice.
    quantumKey: { type: String, default: null },
    classicalKey: { type: String, default: null },
    // 'speed' | 'cost'
    mode: { type: String, default: 'speed' },
    // Names of the hardware not drawn.
    hidden: { type: Array, default: () => [] },
})
// recommended: the recommended quantum algorithm's key, once calculated.
const emit = defineEmits(['update:mode', 'update:hidden', 'recommended'])

const hardwaresStore = useHardwaresStore()
const currentYear = new Date().getFullYear()
const lastYear = currentYear + YEARS_SHOWN

const mode = computed({
    get: () => props.mode,
    set: value => emit('update:mode', value),
})
const result = ref(null)
const loading = ref(false)
const failed = ref(false)
const showTable = ref(false)
// Lines the reader unticked, by hardware name. Kept as "hidden" so hardware
// added later (an import, an edited preset) shows up ticked.
const hidden = computed(() => new Set(props.hidden))

// Colour = technology (categorical slots 1-4), dash = vendor within it.
const TECH_COLORS = {
    superconducting: '#2a78d6',
    trappedIon: '#eb6834',
    neutralAtom: '#1baf7a',
    semiconductor: '#eda100',
    other: '#6b7280',
}
const DASHES = ['Solid', 'Dash', 'ShortDot', 'DashDot', 'LongDash', 'ShortDash', 'LongDashDot']
const INK = '#111827'        // gray-900
const MUTED = '#6b7280'      // gray-500
const GRID = '#f3f4f6'       // gray-100

// Lines leave the plot above this (Database Search reaches 10^19,000,000×).
const Y_CAP = 12
const Y_FLOOR = -40
// The problem size graph's axis goes at least to 10^12 and a little past the
// highest QEA dot (Database Search, where n = 2^qubits, reaches 10^30 at QEA).
const SIZE_CAP = 12
const SIZE_HEADROOM = 2

// ---------------------------------------------------------------------------
// Calculation (in a worker when available, newest request wins)

let worker = null
let requestId = 0
let debounce = null

function startWorker() {
    try {
        worker = new Worker(new URL('../store/hardwareComparison.worker.js', import.meta.url), { type: 'module' })
        worker.onmessage = ({ data }) => {
            if (data.id !== requestId) return
            loading.value = false
            failed.value = !!data.error
            result.value = data.error ? null : data.result
            if (data.error) console.warn('Hardware comparison failed:', data.error)
        }
    } catch {
        worker = null
    }
}

function recalculate() {
    if (!props.model) return
    const id = ++requestId
    const model = JSON.parse(JSON.stringify(props.model))
    const hardwares = JSON.parse(JSON.stringify(hardwaresStore.all))
    const options = { quantumKey: props.quantumKey, classicalKey: props.classicalKey }
    loading.value = true
    if (!worker) startWorker()
    if (worker) {
        worker.postMessage({ id, model, hardwares, options })
        return
    }
    // No worker support: calculate on the main thread.
    setTimeout(() => {
        if (id !== requestId) return
        try {
            result.value = compareHardwareOverTime(model, findProblem(model.problemName), hardwares, options)
            failed.value = false
        } catch (err) {
            console.warn('Hardware comparison failed:', err)
            result.value = null
            failed.value = true
        }
        loading.value = false
    }, 0)
}

watch(() => [props.model, props.quantumKey, props.classicalKey, hardwaresStore.all], () => {
    clearTimeout(debounce)
    // A newer request makes a running one useless: stop it.
    if (worker && loading.value) {
        worker.terminate()
        worker = null
    }
    debounce = setTimeout(recalculate, 300)
}, { immediate: true, deep: true })

watch(result, value => {
    if (value) emit('recommended', value.recommendedKey)
})

onBeforeUnmount(() => {
    clearTimeout(debounce)
    worker?.terminate()
})

// ---------------------------------------------------------------------------
// Presentation

function tex(expression) {
    try {
        // HTML only: Highcharts' sanitizer drops the MathML part.
        return katex.renderToString(expression, { throwOnError: false, output: 'html' })
    } catch {
        return expression
    }
}

function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function formatQea(year) {
    if (year === null || year === undefined) return 'Could not be calculated'
    if (year === Infinity) return 'Not before 3000'
    if (year <= currentYear) return 'Already'
    return year.toFixed(1)
}

// True when year is past the last point of the line's hardware roadmap.
function beyondRoadmap(line, year) {
    return line.roadmapEnd !== null && line.roadmapEnd !== undefined && year > line.roadmapEnd
}

// The legend's QEA wording.
function legendQea(year) {
    if (year === null || year === undefined) return 'QEA could not be calculated'
    if (year === Infinity) return 'no QEA before 3000'
    if (year <= currentYear) return 'QEA already reached'
    return `QEA ${year.toFixed(1)}`
}

// Identifies a line across recalculations; hardware names are unique.
function lineKey(line) {
    return line.name
}

// "IonQ (Trapped Ion)" -> "IonQ"; "IBM 2025 (edited)" stays.
function shortName(line) {
    return nameWithoutTechnology(line.name)
}

// The tooltip's line key in CSS terms.
function borderStyle(dashStyle = 'Solid') {
    if (dashStyle === 'Solid') return 'solid'
    return /Dot$/.test(dashStyle) ? 'dotted' : 'dashed'
}

function algorithmLabel(candidate) {
    if (!candidate) return ''
    const byline = candidate.authors && candidate.authors !== candidate.name ? ` (${candidate.authors}${candidate.year ? ` ${candidate.year}` : ''})` : (candidate.year ? ` (${candidate.year})` : '')
    return candidate.name + byline
}

// Lines grouped by technology, so the legend reads in groups.
const orderedLines = computed(() => {
    const lines = (result.value?.lines || []).map((line, index) => ({ ...line, index }))
    const rank = line => TECHNOLOGY_ORDER.indexOf(line.technology)
    return lines.sort((a, b) => rank(a) - rank(b) || a.index - b.index)
})

const lineStyles = computed(() => {
    const used = {}
    const styles = new Map()
    for (const line of orderedLines.value) {
        const n = used[line.technology] = (used[line.technology] ?? -1) + 1
        styles.set(line.index, { color: TECH_COLORS[line.technology] || TECH_COLORS.other, dashStyle: DASHES[n % DASHES.length], width: 2 })
    }
    return styles
})

const visibleLines = computed(() => orderedLines.value.filter(line => !hidden.value.has(lineKey(line))))

// The checkbox list, grouped by technology like the legend.
const hardwareGroups = computed(() => {
    const groups = []
    for (const line of orderedLines.value) {
        const label = technologyLabel(line.technology)
        let group = groups.at(-1)
        if (!group || group.label !== label) groups.push(group = { label, lines: [] })
        group.lines.push({ key: lineKey(line), name: line.name })
    }
    return groups
})

const shownCount = computed(() => visibleLines.value.length)

function setShown(key, shown) {
    const next = new Set(hidden.value)
    if (shown) next.delete(key)
    else next.add(key)
    emit('update:hidden', [...next])
}

function showAll(shown) {
    emit('update:hidden', shown ? [] : orderedLines.value.map(lineKey))
}

// The values drawn for a line: largest runnable sizes, or ratios to break-even.
function valuesOf(line, sizeView) {
    return sizeView ? line.sizes : line[mode.value].values
}

function hasValues(sizeView) {
    return visibleLines.value.some(line => valuesOf(line, sizeView).some(v => v !== null))
}

const sameAlgorithmEverywhere = computed(() => {
    const lines = visibleLines.value
    const first = lines[0]?.[mode.value].algorithm
    return lines.every(line => line[mode.value].algorithm === first) ? first : null
})

// Every line uses the same quantum algorithm.
const quantumHtml = computed(() => {
    const data = result.value
    const candidate = data?.candidates[data.lines[0]?.speed.algorithm]
    return candidate ? `${escapeHtml(candidate.name)} ${tex(candidate.tex)}` : ''
})

const classicalHtml = computed(() => {
    const c = result.value?.classical
    return c ? `${escapeHtml(c.name)} ${tex(c.tex)}` : ''
})

function yRange(sizeView) {
    const values = visibleLines.value.flatMap(line => valuesOf(line, sizeView)).filter(v => v !== null)
    if (sizeView) {
        if (!values.length) return { min: 0, max: 1 }
        const min = Math.max(Math.floor(Math.min(...values)), 0)
        const qeaSizes = visibleLines.value.map(line => line[mode.value].qeaSize).filter(v => v !== null)
        const cap = Math.max(SIZE_CAP, Math.ceil(Math.max(...qeaSizes, 0)) + SIZE_HEADROOM)
        return { min, max: Math.max(Math.min(Math.ceil(Math.max(...values)), cap), min + 1) }
    }
    if (!values.length) return { min: -1, max: 1 }
    const min = Math.max(Math.floor(Math.min(...values, 0)), Y_FLOOR)
    const max = Math.min(Math.ceil(Math.max(...values, 0)), Y_CAP)
    return { min, max: Math.max(max, 1) }
}

function chartOptionsFor(sizeView) {
    const data = result.value
    if (!data) return null
    const key = mode.value
    const range = yRange(sizeView)

    // The size from which quantum wins on this line's hardware in that year.
    function advantageText(line, year) {
        const i = data.years.indexOf(year)
        const size = i === -1 ? null : line[key].advantage[i]
        const better = key === 'speed' ? 'faster' : 'cheaper'
        return size === null ? `Quantum not ${better} at any size` : `Quantum ${better} from n = ${utils.toBase10HTML(size)}`
    }

    const series = visibleLines.value.map(line => {
        const style = lineStyles.value.get(line.index)
        const { qea, qeaSize } = line[key]
        const values = valuesOf(line, sizeView)
        const points = data.years.map((year, i) => ({ x: year, y: values[i] }))
        // Mark the QEA year on the line: filled within the hardware's roadmap,
        // hollow when it rests on extrapolation (as projected roadmap points).
        const qeaY = sizeView ? qeaSize : 0
        if (Number.isFinite(qea) && qea <= lastYear && qeaY !== null) {
            const marker = beyondRoadmap(line, qea)
                ? { enabled: true, radius: 4, fillColor: '#ffffff', lineColor: style.color, lineWidth: 2, symbol: 'circle' }
                : { enabled: true, radius: 5, fillColor: style.color, lineColor: '#ffffff', lineWidth: 2, symbol: 'circle' }
            if (qea <= currentYear) {
                if (points[0].y !== null) points[0] = { ...points[0], marker, qea: true }
            } else {
                const at = points.findIndex(p => p.x > qea)
                points.splice(at === -1 ? points.length : at, 0, { x: qea, y: qeaY, marker, qea: true })
            }
        }
        return {
            type: 'line',
            name: shortName(line),
            lineIndex: line.index,
            color: style.color,
            dashStyle: style.dashStyle,
            lineWidth: style.width,
            // Bold from the QEA year on.
            zoneAxis: 'x',
            zones: boldAfterZones(qea, currentYear),
            data: points,
            connectNulls: false,
            marker: { enabled: false, symbol: 'circle', states: { hover: { enabled: false } } },
        }
    })

    return {
        chart: {
            height: 460,
            backgroundColor: 'transparent',
            spacingTop: 16,
            style: { fontFamily: 'inherit' },
        },
        credits: { enabled: false },
        exporting: { enabled: false },
        accessibility: { enabled: false },
        title: { text: null },
        legend: {
            enabled: true,
            align: 'center',
            title: {
                text: `Hardware and the year it reaches QEA (quantum ${key === 'speed' ? 'faster' : 'cheaper'} than classical)`,
                style: { color: MUTED, fontWeight: 'normal', fontSize: '11px' },
            },
            itemStyle: { color: INK, fontWeight: 'normal', fontSize: '11px' },
            itemHiddenStyle: { color: '#d1d5db' },
            symbolWidth: 28,
            labelFormatter() {
                const line = data.lines[this.userOptions.lineIndex]
                return `${escapeHtml(this.name)} <span style="color:${MUTED}">· ${legendQea(line[key].qea)}</span>`
            },
        },
        xAxis: {
            type: 'linear',
            min: currentYear,
            max: lastYear,
            tickInterval: YEARS_SHOWN > 20 ? 5 : 1,
            title: { text: 'Year', style: { color: MUTED } },
            labels: { formatter() { return String(this.value) } },
            lineColor: '#e5e7eb',
            crosshair: { color: '#d1d5db', width: 1 },
        },
        yAxis: sizeView ? {
            min: range.min,
            max: range.max,
            startOnTick: false,
            endOnTick: false,
            allowDecimals: false,
            title: { text: 'Largest problem size it can run (n)', style: { color: MUTED } },
            gridLineColor: GRID,
            labels: {
                useHTML: true,
                formatter() { return utils.toBase10HTML(this.value) },
            },
        } : {
            min: range.min,
            max: range.max,
            startOnTick: false,
            endOnTick: false,
            tickInterval: range.max - range.min > 16 ? 5 : 1,
            title: { text: 'Runnable ÷ break-even problem size', style: { color: MUTED } },
            gridLineColor: GRID,
            labels: {
                useHTML: true,
                formatter() { return `${utils.toBase10HTML(this.value)}×` },
            },
            plotBands: [{ from: 0, to: Y_CAP + 100, color: 'rgba(17, 24, 39, 0.025)' }],
            plotLines: [{
                value: 0,
                color: '#9ca3af',
                width: 1.5,
                zIndex: 3,
                label: {
                    text: 'Quantum economic advantage ↑',
                    align: 'right',
                    x: -4,
                    y: -6,
                    style: { color: MUTED, fontSize: '11px' },
                },
            }],
        },
        tooltip: {
            shared: true,
            useHTML: true,
            shadow: false,
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            formatter() {
                const common = sameAlgorithmEverywhere.value
                const rows = this.points
                    .filter(p => p.y !== null && !p.point.qea)
                    .sort((a, b) => b.y - a.y)
                    .map(p => {
                        const line = data.lines[p.series.userOptions.lineIndex]
                        const algorithm = common === null ? `<div style="color:${MUTED};font-size:10px">${escapeHtml(algorithmLabel(data.candidates[line[key].algorithm]))}</div>` : ''
                        const extrapolated = beyondRoadmap(line, p.x) ? `<div style="color:${MUTED};font-size:10px">Beyond its roadmap (${line.roadmapEnd})</div>` : ''
                        const advantage = sizeView ? `<div style="color:${MUTED};font-size:10px">${advantageText(line, p.x)}</div>` : ''
                        const value = sizeView ? `n = ${utils.toBase10HTML(p.y)}` : `${utils.toBase10HTML(p.y)}×`
                        return `<div style="display:flex;align-items:flex-start;gap:6px;margin-top:2px">`
                            + `<span style="display:inline-block;width:14px;margin-top:7px;border-top:2px ${borderStyle(p.series.options.dashStyle)} ${p.series.color}"></span>`
                            + `<div style="flex:1"><div style="display:flex;justify-content:space-between;gap:12px"><span>${escapeHtml(p.series.name)}</span>`
                            + `<span style="font-weight:600">${value}</span></div>${advantage}${extrapolated}${algorithm}</div></div>`
                    }).join('')
                const header = common !== null
                    ? `<div style="color:${MUTED};margin-bottom:4px">${escapeHtml(algorithmLabel(data.candidates[common]))} ${tex(data.candidates[common].tex)}</div>`
                    : ''
                return `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 10px;min-width:240px;max-width:340px;white-space:normal;font-size:12px;color:${INK}">`
                    + `<div style="font-weight:600">${utils.round(this.x, 1)}</div>`
                    + header
                    + rows
                    + '</div>'
            },
        },
        plotOptions: {
            series: {
                animation: false,
                states: { inactive: { opacity: 0.35 }, hover: { lineWidthPlus: 1 } },
                events: {
                    // Clicking a legend entry unticks it in the hardware list.
                    legendItemClick() {
                        setShown(lineKey(data.lines[this.userOptions.lineIndex]), false)
                        return false
                    },
                },
            },
        },
        series,
    }
}

const ratioOptions = computed(() => chartOptionsFor(false))
const sizeOptions = computed(() => chartOptionsFor(true))

// One row per hardware.
const tableRows = computed(() => {
    const data = result.value
    if (!data) return []
    return visibleLines.value.map(line => {
        const entry = line[mode.value]
        const candidate = data.candidates[entry.algorithm]
        return {
            hardware: line.basedOn ? `${line.name} (copy of ${line.basedOn})` : line.name,
            technology: technologyLabel(line.technology),
            algorithm: algorithmLabel(candidate),
            complexity: candidate ? tex(candidate.tex) : '',
            qea: formatQea(entry.qea) + (Number.isFinite(entry.qea) && beyondRoadmap(line, entry.qea) ? ' (beyond roadmap)' : ''),
            largest: line.sizes.at(-1) === null ? '–' : utils.toBase10HTML(line.sizes.at(-1)),
        }
    })
})
</script>

<template>
    <div class="py-2">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-1">
            <div class="text-sm text-gray-700">
                When each hardware reaches quantum economic advantage
            </div>
            <div class="flex flex-wrap items-center gap-3">
                <span v-if="loading" class="text-xs text-gray-500">Calculating…</span>
                <Popover v-if="result" class="relative">
                    <PopoverButton
                        class="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 hover:bg-gray-100">
                        Hardware: {{ shownCount }} of {{ orderedLines.length }}
                        <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clip-rule="evenodd" />
                        </svg>
                    </PopoverButton>
                    <PopoverPanel
                        class="absolute right-0 z-20 mt-1 w-64 max-h-80 overflow-y-auto rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-700 shadow-lg">
                        <div class="flex gap-3 border-b border-gray-100 pb-1 mb-1">
                            <button type="button" class="underline hover:text-gray-900" @click="showAll(true)">Select all</button>
                            <button type="button" class="underline hover:text-gray-900" @click="showAll(false)">Clear</button>
                        </div>
                        <div v-for="group in hardwareGroups" :key="group.label" class="py-1">
                            <div class="text-[10px] uppercase tracking-wide text-gray-400">{{ group.label }}</div>
                            <label v-for="item in group.lines" :key="item.key"
                                class="flex items-center gap-2 py-0.5 cursor-pointer hover:text-gray-900">
                                <input type="checkbox" class="rounded border-gray-300" :checked="!hidden.has(item.key)"
                                    @change="setShown(item.key, $event.target.checked)" />
                                {{ item.name }}
                            </label>
                        </div>
                    </PopoverPanel>
                </Popover>
                <div class="inline-flex rounded-md border border-gray-200 overflow-hidden text-xs" role="group"
                    aria-label="Compare on">
                    <button type="button" @click="mode = 'speed'" :aria-pressed="mode === 'speed'"
                        :class="['px-3 py-1', mode === 'speed' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100']">
                        Speed
                    </button>
                    <button type="button" @click="mode = 'cost'" :aria-pressed="mode === 'cost'"
                        :class="['px-3 py-1 border-l border-gray-200', mode === 'cost' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100']">
                        Cost
                    </button>
                </div>
            </div>
        </div>
        <div v-if="result" class="pb-2 text-xs text-gray-500 space-y-0.5">
            <div>
                Above 1×, the hardware can run problems bigger than the smallest one where quantum is
                {{ mode === 'speed' ? 'faster' : 'cheaper' }} than classical. Dots mark each hardware's QEA year, and
                lines are bold from it on. A hollow dot is a QEA year past the hardware's roadmap.
            </div>
            <div>Quantum: <span v-html="quantumHtml"></span> · Classical: <span v-html="classicalHtml"></span></div>
        </div>

        <div v-if="result && hasValues(false)" :class="['transition-opacity', loading ? 'opacity-60' : '']">
            <Chart :options="ratioOptions" />
        </div>
        <div v-else-if="result && !shownCount" class="py-10 text-center text-sm text-gray-500">
            No hardware selected. Pick some from the Hardware list above.
        </div>
        <div v-else-if="result" class="py-10 text-center text-sm text-gray-500">
            Quantum is not {{ mode === 'speed' ? 'faster' : 'cheaper' }} than classical at any problem size on {{ hidden.size ? 'the selected' : 'any' }}
            hardware between {{ currentYear }} and {{ lastYear }}.
        </div>
        <div v-else-if="!loading" class="py-10 text-center text-sm text-gray-500">
            {{ failed ? 'The comparison could not be calculated for these inputs.' : 'No quantum algorithm to compare for this problem.' }}
        </div>
        <div v-else class="py-10 text-center text-sm text-gray-500">Calculating…</div>

        <template v-if="result && shownCount">
            <div class="mt-6 text-sm text-gray-700">The largest problem each hardware can run</div>
            <div class="pb-2 text-xs text-gray-500">
                With its qubits and the quantum algorithm above. The dots are the same QEA years, and the tooltip gives
                the size from which quantum is {{ mode === 'speed' ? 'faster' : 'cheaper' }} than classical.
            </div>
            <div v-if="hasValues(true)" :class="['transition-opacity', loading ? 'opacity-60' : '']">
                <Chart :options="sizeOptions" />
            </div>
            <div v-else class="py-10 text-center text-sm text-gray-500">
                The problem sizes could not be calculated for the selected hardware.
            </div>
        </template>

        <div v-if="result" class="pt-1">
            <button type="button" class="text-xs text-gray-600 underline hover:text-gray-800"
                @click="showTable = !showTable">
                {{ showTable ? 'Hide table' : 'Show as table' }}
            </button>
            <table v-if="showTable" class="mt-2 w-full text-xs text-left text-gray-700">
                <thead class="text-gray-500 border-b border-gray-200">
                    <tr>
                        <th class="py-1 pr-3 font-medium">Hardware</th>
                        <th class="py-1 pr-3 font-medium">Technology</th>
                        <th class="py-1 pr-3 font-medium">Algorithm</th>
                        <th class="py-1 pr-3 font-medium">Complexity</th>
                        <th class="py-1 pr-3 font-medium">{{ mode === 'speed' ? 'Speed' : 'Cost' }} QEA year</th>
                        <th class="py-1 font-medium">Largest problem in {{ lastYear }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in tableRows" :key="row.hardware" class="border-b border-gray-100">
                        <td class="py-1 pr-3">{{ row.hardware }}</td>
                        <td class="py-1 pr-3">{{ row.technology }}</td>
                        <td class="py-1 pr-3">{{ row.algorithm }}</td>
                        <td class="py-1 pr-3" v-html="row.complexity"></td>
                        <td class="py-1 pr-3">{{ row.qea }}</td>
                        <td class="py-1" v-html="row.largest"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
