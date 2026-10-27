// One notation for qubit roadmaps, shared by the calculator's graphs (Edit
// roadmap, Quantum Timelines, Quantum Economic Advantage) and the hardware
// comparison:
//   filled dot   demonstrated: a machine that exists
//   hollow dot   projected: on the vendor's roadmap
//   faded line   within the roadmap (between its first and last points)
//   bold line    extrapolated outside the roadmap
//   grey band    the years past the roadmap (graphs of one hardware)
// Dashes are left free: the hardware comparison uses them for vendors.
// Colour says what is counted: physical qubits light red, logical qubits dark
// red. Counts are labelled 10^x. Values are log10 qubits.
import * as utils from './utils'

export const QUBIT_COLORS = { physical: '#E57373', logical: '#a32035' }
export const LEGEND_LINE_COLOR = '#6b7280'
const FADED_OPACITY = 0.35
const BAND_COLOR = 'rgba(17, 24, 39, 0.04)'
const BAND_TEXT = '#6b7280'

// A line colour as drawn within the roadmap. Takes #rrggbb or rgb()/rgba().
export function fadedColor(color, opacity = FADED_OPACITY) {
    let rgb = null
    const hex = /^#([0-9a-f]{6})$/i.exec(color || '')
    if (hex) rgb = [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16))
    const fn = /^rgba?\(([^)]+)\)$/i.exec(color || '')
    if (fn) rgb = fn[1].split(',').slice(0, 3).map(Number)
    return rgb ? `rgba(${rgb.join(', ')}, ${opacity})` : color
}

export function qubitColor(unit) {
    return unit === 'logical' ? QUBIT_COLORS.logical : QUBIT_COLORS.physical
}

export function qubitUnitLabel(unit) {
    return unit === 'logical' ? 'Logical qubits' : 'Physical qubits'
}

// [[year, log10 qubits]] for a roadmap { year: qubits }, in year order.
export function roadmapPoints(roadmap) {
    return Object.entries(roadmap || {})
        .map(([year, count]) => [Number(year), Math.log10(Number(count))])
        .filter(([year, log]) => Number.isFinite(year) && Number.isFinite(log))
        .sort((a, b) => a[0] - b[0])
}

// A roadmap point's kind; points without one are projected, as in the editor.
export function pointType(dataPointTypes, year) {
    return dataPointTypes?.[year] === 'demonstrated' ? 'demonstrated' : 'projected'
}

// Highcharts series for the roadmap's points: demonstrated, then projected.
export function roadmapPointSeries(roadmap, dataPointTypes, color) {
    const points = roadmapPoints(roadmap)
    const dataLabels = {
        enabled: true,
        useHTML: true,
        formatter() { return utils.toBase10HTML(this.y) },
        color,
        style: { fontSize: '10px', fontWeight: 'normal', color, textOutline: 'none' },
    }
    const series = (type, fillColor) => ({
        name: type === 'demonstrated' ? 'Demonstrated' : 'Projected',
        type: 'scatter',
        color,
        // Points only: some charts set a line width for every series.
        lineWidth: 0,
        data: points.filter(([year]) => pointType(dataPointTypes, year) === type),
        marker: { enabled: true, symbol: 'circle', radius: 4, fillColor, lineColor: color, lineWidth: 2 },
        dataLabels,
        zIndex: 5,
    })
    return [series('demonstrated', color), series('projected', '#ffffff')]
}

// A legend entry for the faded line (it has no points of its own).
export function withinRoadmapLegendSeries() {
    return {
        name: 'Within roadmap',
        type: 'line',
        data: [],
        color: fadedColor(LEGEND_LINE_COLOR, 0.5),
        marker: { enabled: false },
        enableMouseTracking: false,
        events: { legendItemClick: () => false },
    }
}

// First and last roadmap years, or null without points.
export function roadmapSpan(roadmap) {
    const points = roadmapPoints(roadmap)
    return points.length ? [points[0][0], points.at(-1)[0]] : null
}

// Line zones (zoneAxis 'x'): faded from the first to the last roadmap year,
// full colour outside. color: the line's colour.
export function roadmapZones(roadmap, color) {
    const span = roadmapSpan(roadmap)
    if (!span) return []
    return [{ value: span[0] }, { value: span[1], color: fadedColor(color) }, {}]
}

// x-axis plot bands shading the years outside the roadmap, on an axis that
// starts in axisStart.
export function beyondRoadmapBands(roadmap, axisStart = new Date().getFullYear()) {
    const span = roadmapSpan(roadmap)
    if (!span) return []
    const label = {
        text: 'Beyond roadmap',
        align: 'left',
        verticalAlign: 'bottom',
        x: 6,
        y: -6,
        style: { color: BAND_TEXT, fontSize: '11px' },
    }
    // Bands are clipped to the axis.
    const after = { from: span[1], to: span[1] + 1000, color: BAND_COLOR, label }
    return span[0] > axisStart ? [{ from: axisStart - 1000, to: span[0], color: BAND_COLOR }, after] : [after]
}

// Tick spacing for a year axis spanning range years: whole years, at most
// about eight labels.
export function yearTickInterval(range) {
    return Math.max(1, Math.ceil(range / 8))
}

// How a year on the line was found.
export function yearKind(roadmap, dataPointTypes, year) {
    const points = roadmapPoints(roadmap)
    if (points.some(([y]) => y === year)) return pointType(dataPointTypes, year)
    if (!points.length || year < points[0][0] || year > points.at(-1)[0]) return 'extrapolated'
    return 'interpolated'
}
