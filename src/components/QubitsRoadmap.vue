
<script setup>
// The Edit roadmap chart. Same notation as Quantum Timelines
// (store/roadmapNotation.js): filled dots demonstrated, hollow dots projected,
// line bold past the roadmap, grey band past it, colour by physical or
// logical qubits.
import { Chart } from 'highcharts-vue'
import { computed } from 'vue';
import * as utils from "../store/utils"
import {
    qubitColor, qubitUnitLabel, roadmapPoints, roadmapPointSeries,
    roadmapZones, beyondRoadmapBands, yearKind,
} from '../store/roadmapNotation'

const currentYear = new Date().getFullYear();

const props = defineProps({
    data: Object,
    extrapolationType: String,
    // Maps year to "demonstrated" or "projected"; points without one are projected.
    dataPointTypes: {
        type: Object,
        default: () => ({})
    },
    roadmapUnit: {
        type: String,
        default: 'physical'
    }
});

const KIND_LABELS = {
    demonstrated: 'demonstrated',
    projected: 'projected',
    interpolated: 'between roadmap points',
    extrapolated: 'extrapolated',
};

// Every year from the first roadmap year (or this year) to at least ten years out.
const line = computed(() => {
    const points = roadmapPoints(props.data);
    if (!points.length) return [];
    const first = Math.min(points[0][0], currentYear);
    const last = Math.max(points.at(-1)[0], currentYear + 10);
    return Array.from({ length: last - first + 1 }, (_, i) => [
        first + i,
        utils.getPhysicalQubits(first + i, props.data, props.extrapolationType)
    ]).filter(([, log]) => Number.isFinite(log));
});

const chartOptions = computed(() => {
    const color = qubitColor(props.roadmapUnit);
    const unit = qubitUnitLabel(props.roadmapUnit);
    return {
        chart: {
            zooming: { type: 'xy' },
        },
        title: { text: null },
        credits: { enabled: false },
        tooltip: {
            useHTML: true,
            formatter() {
                const kind = yearKind(props.data, props.dataPointTypes, this.x);
                return `<b>${this.x}</b><br>${utils.toBase10HTML(this.y)} ${unit.toLowerCase()} (${KIND_LABELS[kind]})`;
            }
        },
        legend: { enabled: true },
        xAxis: {
            title: { text: 'Year' },
            allowDecimals: false,
            plotBands: beyondRoadmapBands(props.data),
        },
        yAxis: {
            title: { text: unit },
            allowDecimals: false,
            labels: {
                useHTML: true,
                formatter() { return utils.toBase10HTML(this.value); },
            },
        },
        plotOptions: {
            series: { animation: false },
        },
        series: [
            {
                name: unit,
                type: 'line',
                data: line.value,
                color,
                lineWidth: 2,
                zoneAxis: 'x',
                zones: roadmapZones(props.data),
                marker: { enabled: false, states: { hover: { enabled: true } } },
            },
            ...roadmapPointSeries(props.data, props.dataPointTypes, color),
        ],
    };
});
</script>

<template>
    <div>
        <Chart :options="chartOptions" />
    </div>
</template>
