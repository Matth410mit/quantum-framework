// One notation for qubit roadmaps, shared by the Edit roadmap chart
// (QubitsRoadmap.vue) and the Quantum Timelines chart:
//   filled dot   demonstrated: a machine that exists
//   hollow dot   projected: on the vendor's roadmap
//   solid line   between roadmap points
//   dashed line  extrapolated outside the roadmap
// Colour says what is counted: physical qubits light red, logical qubits dark
// red. Counts are labelled 10^x. Values are log10 qubits.
import * as utils from './utils'

export const QUBIT_COLORS = { physical: '#E57373', logical: '#a32035' }
export const EXTRAPOLATED_COLOR = '#6b7280'

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
        data: points.filter(([year]) => pointType(dataPointTypes, year) === type),
        marker: { enabled: true, symbol: 'circle', radius: 4, fillColor, lineColor: color, lineWidth: 2 },
        dataLabels,
        zIndex: 5,
    })
    return [series('demonstrated', color), series('projected', '#ffffff')]
}

// A legend entry for the dashed line (it has no points of its own).
export function extrapolatedLegendSeries() {
    return {
        name: 'Extrapolated',
        type: 'line',
        data: [],
        color: EXTRAPOLATED_COLOR,
        dashStyle: 'Dash',
        marker: { enabled: false },
        enableMouseTracking: false,
        events: { legendItemClick: () => false },
    }
}

// Line zones: dashed before the first and after the last roadmap year.
export function extrapolationZones(roadmap) {
    const points = roadmapPoints(roadmap)
    if (!points.length) return [{ dashStyle: 'Dash' }]
    return [
        { value: points[0][0], dashStyle: 'Dash' },
        { value: points.at(-1)[0] },
        { dashStyle: 'Dash' },
    ]
}

// How a year on the line was found.
export function yearKind(roadmap, dataPointTypes, year) {
    const points = roadmapPoints(roadmap)
    if (points.some(([y]) => y === year)) return pointType(dataPointTypes, year)
    if (!points.length || year < points[0][0] || year > points.at(-1)[0]) return 'extrapolated'
    return 'interpolated'
}
