// Shared chart style for qubit roadmaps, used by all the graphs:
// - Filled dots are demonstrated machines that exist.
// - Hollow dots are projected points from the vendor's roadmap.
// - Lines turn bold after the last roadmap point, where values are
//   extrapolated. The hardware comparison makes them bold after the QEA year.
// - A grey band shades the years after the roadmap.
// - Physical qubits are light red and logical qubits are dark red.
// Values are stored as log10 of the qubit count.
import * as utils from './utils'

export const QUBIT_COLORS = { physical: '#E57373', logical: '#a32035' }
const BAND_COLOR = 'rgba(17, 24, 39, 0.04)'
const BAND_TEXT = '#6b7280'

// CSS classes for the bold part of a line. Highcharts can't change the line
// width here, so style.css does it.
export const BOLD = 'line-bold'
export const BOLD_THIN = 'line-bold-thin'

// Highcharts zones that make a line bold from x onward. If x is null or not
// finite, the line is never bold.
export function boldAfterZones(x, from = -Infinity, className = BOLD) {
    if (x === null || x === undefined || !Number.isFinite(x)) return []
    if (x <= from) return [{ className }]
    return [{ value: x }, { className }]
}

export function qubitColor(unit) {
    return unit === 'logical' ? QUBIT_COLORS.logical : QUBIT_COLORS.physical
}

export function qubitUnitLabel(unit) {
    return unit === 'logical' ? 'Logical qubits' : 'Physical qubits'
}

// Turns a roadmap { year: qubits } into [year, log10 qubits] pairs, sorted by year.
export function roadmapPoints(roadmap) {
    return Object.entries(roadmap || {})
        .map(([year, count]) => [Number(year), Math.log10(Number(count))])
        .filter(([year, log]) => Number.isFinite(year) && Number.isFinite(log))
        .sort((a, b) => a[0] - b[0])
}

// Whether a point is demonstrated or projected. Points default to projected.
export function pointType(dataPointTypes, year) {
    return dataPointTypes?.[year] === 'demonstrated' ? 'demonstrated' : 'projected'
}

// Chart series for the roadmap's demonstrated and projected points.
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
        // Dots only, no line.
        lineWidth: 0,
        data: points.filter(([year]) => pointType(dataPointTypes, year) === type),
        marker: { enabled: true, symbol: 'circle', radius: 4, fillColor, lineColor: color, lineWidth: 2 },
        dataLabels,
        zIndex: 5,
    })
    return [series('demonstrated', color), series('projected', '#ffffff')]
}

// First and last roadmap years, or null if there are no points.
export function roadmapSpan(roadmap) {
    const points = roadmapPoints(roadmap)
    return points.length ? [points[0][0], points.at(-1)[0]] : null
}

// Zones that make a line bold after the last roadmap year.
export function roadmapZones(roadmap, className = BOLD) {
    const span = roadmapSpan(roadmap)
    return span ? boldAfterZones(span[1], -Infinity, className) : []
}

// Grey bands that shade the years outside the roadmap.
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
    const after = { from: span[1], to: span[1] + 1000, color: BAND_COLOR, label }
    return span[0] > axisStart ? [{ from: axisStart - 1000, to: span[0], color: BAND_COLOR }, after] : [after]
}

// Tick spacing for a year axis: whole years, with at most about eight labels.
export function yearTickInterval(range) {
    return Math.max(1, Math.ceil(range / 8))
}

// Whether a year's value is a roadmap point, interpolated or extrapolated.
export function yearKind(roadmap, dataPointTypes, year) {
    const points = roadmapPoints(roadmap)
    if (points.some(([y]) => y === year)) return pointType(dataPointTypes, year)
    if (!points.length || year < points[0][0] || year > points.at(-1)[0]) return 'extrapolated'
    return 'interpolated'
}
