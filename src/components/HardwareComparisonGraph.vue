<script setup>
// For the model's problem: when each quantum algorithm reaches quantum
// economic advantage on each hardware preset. x = hardware, y = the
// algorithm's asymptotic runtime, colour = years behind the earliest on that
// hardware, ring = the earliest. The calculation is in store/hardwareComparison.js.
import { Chart } from 'highcharts-vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useHardwaresStore } from '../store/hardwares'
import { algorithmCredit, findProblem } from '../store/problemCatalog'
import { compareHardware } from '../store/hardwareComparison'

const props = defineProps({
    model: Object,
})

const hardwaresStore = useHardwaresStore()

const mode = ref('speed') // 'speed' | 'cost'
const result = ref(null)
const loading = ref(false)
const failed = ref(false)
const showTable = ref(false)

// Sequential blue, light -> dark (steps 250-700). Earlier QEA = darker.
const RAMP = ['#86b6ef', '#6da7ec', '#5598e7', '#3987e5', '#2a78d6', '#256abf', '#1c5cab', '#184f95', '#104281', '#0d366b']
const INK = '#111827'        // gray-900
const MUTED = '#6b7280'      // gray-500
const NEVER = '#9ca3af'      // gray-400
const GRID = '#f3f4f6'       // gray-100

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
    loading.value = true
    if (!worker) startWorker()
    if (worker) {
        worker.postMessage({ id, model, hardwares })
        return
    }
    // No worker support: calculate on the main thread.
    setTimeout(() => {
        if (id !== requestId) return
        try {
            result.value = compareHardware(model, findProblem(model.problemName), hardwares)
            failed.value = false
        } catch (err) {
            console.warn('Hardware comparison failed:', err)
            result.value = null
            failed.value = true
        }
        loading.value = false
    }, 0)
}

watch(() => [props.model, hardwaresStore.all], () => {
    clearTimeout(debounce)
    // A newer request makes a running one useless: stop it.
    if (worker && loading.value) {
        worker.terminate()
        worker = null
    }
    debounce = setTimeout(recalculate, 300)
}, { immediate: true, deep: true })

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

function formatYear(year) {
    if (year === null || year === undefined) return 'Could not be calculated'
    if (year === Infinity) return 'Not before 3000'
    return year.toFixed(1)
}

// "IonQ (Trapped Ion)" -> ["IonQ", "Trapped Ion"]
function splitHardwareName(column) {
    if (column.current) return ['Current inputs', column.basedOn ? `based on ${column.basedOn}` : '']
    const match = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(column.name)
    return match ? [match[1], match[2]] : [column.name, '']
}

// Colour = how far behind the earliest algorithm on the same hardware, so
// close runners-up stand out (absolute years mostly differ by hardware,
// which the x-axis already shows).
const YEARS_BEHIND_CAP = 10

const earliestByColumn = computed(() => {
    const earliest = new Map()
    for (const p of result.value?.points || []) {
        const year = p[mode.value]
        if (Number.isFinite(year) && !(year >= earliest.get(p.column))) earliest.set(p.column, year)
    }
    return earliest
})

function colorForPoint(p) {
    const behind = p[mode.value] - earliestByColumn.value.get(p.column)
    const t = Math.min(Math.max(behind, 0) / YEARS_BEHIND_CAP, 1) // 0 = earliest (darkest)
    return RAMP[Math.round((1 - t) * (RAMP.length - 1))]
}

const winnerSet = computed(() => new Set((result.value?.winners?.[mode.value] || []).flat()))
// Tied winners share one year label.
const labelledWinners = computed(() => new Set((result.value?.winners?.[mode.value] || []).map(ids => ids[0])))

// Points that share a hardware column and a row are spread side by side, in
// the same order on every hardware.
function columnOffsets(points) {
    const groups = new Map()
    points.forEach((p, i) => {
        const key = `${p.column}|${p.row}`
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key).push(i)
    })
    const offsets = new Array(points.length).fill(0)
    for (const members of groups.values()) {
        const step = Math.min(0.12, 0.7 / members.length)
        members.forEach((i, j) => { offsets[i] = (j - (members.length - 1) / 2) * step })
    }
    return offsets
}

const chartHeight = computed(() => Math.max(320, (result.value?.rows.length || 0) * 44 + 150))

const chartOptions = computed(() => {
    const data = result.value
    if (!data) return null
    const key = mode.value
    const winners = winnerSet.value
    const offsets = columnOffsets(data.points)

    const points = data.points.map((p, i) => {
        const year = p[key]
        const reached = Number.isFinite(year)
        const isWinner = winners.has(i)
        return {
            x: p.column + offsets[i],
            y: p.row,
            index: i,
            marker: reached
                ? {
                    radius: isWinner ? 7 : 5,
                    fillColor: colorForPoint(p),
                    lineColor: isWinner ? INK : '#ffffff',
                    lineWidth: 2,
                }
                : { radius: 5, fillColor: '#ffffff', lineColor: NEVER, lineWidth: 1.5 },
            dataLabels: {
                enabled: labelledWinners.value.has(i),
                format: formatYear(year),
                y: -10,
                style: { color: INK, fontSize: '10px', fontWeight: '600', textOutline: '2px #ffffff' },
            },
        }
    })

    const classicalName = data.classical.algorithm.name || 'Classical'

    return {
        chart: {
            type: 'scatter',
            height: chartHeight.value,
            backgroundColor: 'transparent',
            spacingTop: 16,
            style: { fontFamily: 'inherit' },
        },
        credits: { enabled: false },
        exporting: { enabled: false },
        title: { text: null },
        legend: { enabled: false },
        xAxis: {
            categories: data.columns.map(c => c.name),
            min: -0.5,
            max: data.columns.length - 0.5,
            startOnTick: false,
            endOnTick: false,
            title: { text: 'Hardware', style: { color: MUTED } },
            lineColor: '#e5e7eb',
            tickLength: 0,
            gridLineWidth: 1,
            gridLineColor: GRID,
            tickInterval: 1,
            labels: {
                useHTML: true,
                autoRotation: false,
                style: { textOverflow: 'none' },
                formatter() {
                    const column = data.columns[this.pos]
                    if (!column) return ''
                    let [name, kind] = splitHardwareName(column)
                    // Narrow columns: shorten the long technology names so neighbours don't touch.
                    if (this.axis.len / data.columns.length < 100) {
                        kind = kind.replace('Superconducting', 'Supercond.').replace('Semiconductors', 'Semicond.')
                    }
                    return `<div style="text-align:center;line-height:1.2;width:84px;white-space:normal;color:${INK};font-size:11px">${escapeHtml(name)}`
                        + (kind ? `<div style="color:${MUTED};font-size:9px">${escapeHtml(kind)}</div>` : '')
                        + '</div>'
                },
            },
        },
        yAxis: {
            categories: data.rows.map(r => r.tex),
            min: -0.5,
            max: data.rows.length - 0.5,
            startOnTick: false,
            endOnTick: false,
            tickInterval: 1,
            title: { text: 'Asymptotic time complexity', style: { color: MUTED } },
            gridLineWidth: 1,
            gridLineColor: GRID,
            labels: {
                useHTML: true,
                formatter() {
                    const row = data.rows[this.pos]
                    return row ? `<span style="color:${INK};font-size:12px">${tex(row.tex)}</span>` : ''
                },
            },
            plotLines: [{
                value: data.classical.rowIndex,
                color: MUTED,
                width: 2,
                dashStyle: 'Dash',
                zIndex: 2,
                label: {
                    text: `Fastest classical: ${escapeHtml(classicalName)}`,
                    align: 'right',
                    x: -4,
                    y: -6,
                    style: { color: MUTED, fontSize: '11px' },
                },
            }],
        },
        tooltip: {
            useHTML: true,
            shadow: false,
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            formatter() {
                const p = data.points[this.point.index]
                const column = data.columns[p.column]
                const credit = algorithmCredit(p.algorithm).split('\n')[0]
                const line = (label, value, active) =>
                    `<div style="display:flex;justify-content:space-between;gap:12px;${active ? `color:${INK};font-weight:600` : `color:${MUTED}`}">`
                    + `<span>${label}</span><span>${formatYear(value)}</span></div>`
                return `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 10px;min-width:220px;max-width:320px;white-space:normal;font-size:12px">`
                    + `<div style="color:${INK};font-weight:600">${escapeHtml(p.algorithm.name || 'Quantum algorithm')}</div>`
                    + (credit && credit !== p.algorithm.name ? `<div style="color:${MUTED}">${escapeHtml(credit)}</div>` : '')
                    + `<div style="margin:4px 0">${tex(data.rows[p.row].tex)}</div>`
                    + `<div style="color:${MUTED};margin-bottom:2px">${escapeHtml(column.name)}</div>`
                    + line('Speed QEA', p.speed, key === 'speed')
                    + line('Cost QEA', p.cost, key === 'cost')
                    + (winnerSet.value.has(this.point.index) ? `<div style="margin-top:4px;color:${INK}">Earliest on this hardware</div>` : '')
                    + '</div>'
            },
        },
        plotOptions: {
            series: {
                animation: false,
                stickyTracking: false,
                states: { inactive: { opacity: 1 } },
            },
            scatter: {
                marker: { symbol: 'circle', states: { hover: { radiusPlus: 2, lineWidthPlus: 0 } } },
            },
        },
        series: [{ name: 'Quantum algorithms', data: points, color: RAMP[RAMP.length - 1] }],
    }
})

// One row per hardware: the earliest algorithm(s) and their year.
const tableRows = computed(() => {
    const data = result.value
    if (!data) return []
    return data.columns.map((column, c) => {
        const winners = (data.winners[mode.value][c] || []).map(i => data.points[i])
        return {
            hardware: column.name,
            algorithms: winners.map(p => p.algorithm.name).join(', ') || '—',
            complexity: winners.length ? tex(data.rows[winners[0].row].tex) : '',
            year: winners.length ? formatYear(winners[0][mode.value]) : 'Not before 3000',
        }
    })
})

const gradient = `linear-gradient(to right, ${[...RAMP].reverse().join(', ')})`
</script>

<template>
    <div class="py-2">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-2">
            <div class="text-sm text-gray-700">
                Earliest quantum economic advantage for each quantum algorithm, by hardware
            </div>
            <div class="flex items-center gap-3">
                <span v-if="loading" class="text-xs text-gray-500">Calculating…</span>
                <div class="inline-flex rounded-md border border-gray-200 overflow-hidden text-xs" role="group"
                    aria-label="Rank algorithms by">
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

        <div v-if="result" class="flex flex-wrap items-center gap-x-5 gap-y-2 pb-2 text-xs text-gray-600">
            <span class="flex items-center gap-2">
                <span>Years after the earliest on that hardware</span>
                <span>0</span>
                <span class="inline-block h-2 w-24 rounded-sm" :style="{ background: gradient }"></span>
                <span>{{ YEARS_BEHIND_CAP }}+</span>
            </span>
            <span class="flex items-center gap-1.5">
                <span class="inline-block w-3.5 h-3.5 rounded-full border-2 border-gray-900"
                    :style="{ background: RAMP[RAMP.length - 1] }"></span>
                Earliest on that hardware
            </span>
            <span class="flex items-center gap-1.5">
                <span class="inline-block w-2.5 h-2.5 rounded-full border border-gray-400 bg-white"></span>
                No QEA before 3000
            </span>
            <span class="flex items-center gap-1.5">
                <span class="inline-block w-5 border-t-2 border-dashed border-gray-500"></span>
                Fastest classical algorithm
            </span>
        </div>

        <div v-if="result" :class="['transition-opacity', loading ? 'opacity-60' : '']">
            <Chart :options="chartOptions" />
        </div>
        <div v-else-if="!loading" class="py-10 text-center text-sm text-gray-500">
            {{ failed ? 'The comparison could not be calculated for these inputs.' : 'No quantum algorithm to compare for this problem.' }}
        </div>
        <div v-else class="py-10 text-center text-sm text-gray-500">Calculating…</div>

        <div v-if="result" class="pt-1">
            <button type="button" class="text-xs text-gray-600 underline hover:text-gray-800"
                @click="showTable = !showTable">
                {{ showTable ? 'Hide table' : 'Show as table' }}
            </button>
            <table v-if="showTable" class="mt-2 w-full text-xs text-left text-gray-700">
                <thead class="text-gray-500 border-b border-gray-200">
                    <tr>
                        <th class="py-1 pr-3 font-medium">Hardware</th>
                        <th class="py-1 pr-3 font-medium">Earliest algorithm</th>
                        <th class="py-1 pr-3 font-medium">Complexity</th>
                        <th class="py-1 font-medium">{{ mode === 'speed' ? 'Speed' : 'Cost' }} QEA year</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in tableRows" :key="row.hardware" class="border-b border-gray-100">
                        <td class="py-1 pr-3">{{ row.hardware }}</td>
                        <td class="py-1 pr-3">{{ row.algorithms }}</td>
                        <td class="py-1 pr-3" v-html="row.complexity"></td>
                        <td class="py-1">{{ row.year }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
