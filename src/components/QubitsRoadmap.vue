
<script setup>
import { Chart } from 'highcharts-vue'
import { number } from 'mathjs';
import { defineProps, ref, watch } from 'vue';
import * as utils from "../store/utils"

const currentYear = new Date().getFullYear();

const props = defineProps({
    data: Object,
    extrapolationType: String,
    // Maps year (number) to "demonstrated" or "projected". If not provided, all user-entered points are treated as roadmap points.
    dataPointTypes: {
        type: Object,
        default: () => ({})
    },
    roadmapUnit: {
        type: String,
        default: 'physical'
    }
});

const physicalQubits = ref(Array.from({
    length: Math.max(Math.max(...Object.keys(props.data)) + 10, currentYear + 10) - currentYear
}, (_, i) => [
    i + currentYear,
    utils.getPhysicalQubits(i + currentYear, props.data, props.extrapolationType)
]))

function buildSeries() {
    const allPoints = physicalQubits.value;
    const hasTypes = Object.keys(props.dataPointTypes).length > 0;

    // Points that exist in the user's roadmap data
    const userPoints = allPoints.filter(([year]) => props.data.hasOwnProperty(year));
    // Points computed by interpolation/extrapolation (not in original data)
    const extrapolatedPoints = allPoints.filter(([year]) => !props.data.hasOwnProperty(year));

    // Split user points into demonstrated (historical) and projected
    let demonstratedPoints, projectedPoints;
    if (hasTypes) {
        demonstratedPoints = userPoints.filter(([year]) => props.dataPointTypes[year] === 'demonstrated');
        projectedPoints = userPoints.filter(([year]) => props.dataPointTypes[year] !== 'demonstrated');
    } else {
        // Fallback: all user points are "roadmap" (solid blue) like the original behavior
        demonstratedPoints = userPoints;
        projectedPoints = [];
    }

    const symbol = props.roadmapUnit === 'logical' ? 'triangle' : 'circle';
    const lineDashStyle = props.roadmapUnit === 'logical' ? 'Dash' : 'Solid';

    return [
        // Background trend line
        {
            data: allPoints,
            type: 'line',
            color: '#a3203555',
            dashStyle: lineDashStyle,
            enableMouseTracking: false,
            showInLegend: false,
        },
        // Demonstrated (historical): solid filled blue circles
        {
            name: 'Demonstrated',
            data: demonstratedPoints,
            type: 'scatter',
            color: 'blue',
            marker: {
                symbol: symbol,
                fillColor: 'blue',
                lineWidth: 2,
                lineColor: 'blue',
            },
            dataLabels: {
                enabled: true,
                useHTML: true,
                formatter: function () {
                    return utils.toBase10HTML(this.y);
                },
                style: {
                    fontSize: '9px',
                    color: 'blue',
                    fontWeight: 'light',
                    textOutline: false
                }
            }
        },
        // Projected: hollow blue circles (outline only)
        {
            name: 'Projected',
            data: projectedPoints,
            type: 'scatter',
            color: 'blue',
            marker: {
                symbol: symbol,
                fillColor: 'white',
                lineWidth: 2,
                lineColor: 'blue',
            },
            dataLabels: {
                enabled: true,
                useHTML: true,
                formatter: function () {
                    return utils.toBase10HTML(this.y);
                },
                style: {
                    fontSize: '9px',
                    color: 'blue',
                    fontWeight: 'light',
                    textOutline: false
                }
            }
        },
        // Extrapolated: hollow red circles
        {
            name: 'Extrapolated',
            data: extrapolatedPoints,
            type: 'scatter',
            color: 'red',
            marker: {
                symbol: symbol,
                fillColor: 'white',
                lineWidth: 2,
                lineColor: 'red',
            },
            dataLabels: {
                enabled: true,
                useHTML: true,
                formatter: function () {
                    return utils.toBase10HTML(this.y);
                },
                style: {
                    fontSize: '9px',
                    color: 'red',
                    fontWeight: 'light',
                    textOutline: false
                }
            }
        },
    ];
}

const chartOptions = {
    chart: {
        type: 'spline',
        zoomType: 'xy'
    },
    title: {
        // hide title
        text: null
    },
    credits: {
        enabled: false
    },
    tooltip: {
        useHTML: true,
        formatter: function () {
            return `Qubits: ${utils.toBase10HTML(this.y)}<br>Year: ${this.x}`;
        }
    },
    legend: {
        enabled: true,
        align: 'left',
        verticalAlign: 'top',
        layout: 'vertical',
        x: 60,
        y: 0,
        floating: true


    },
    xAxis: {
        title: {
            text: 'Year',
        },
        startOnTick: true,
        min: currentYear,


    },
    yAxis: {
        title: {
            text: 'Qubits'
        },
        logarithmic: true,
        labels: {

            formatter: function () {
                return utils.toBase10HTML(this.value);
            },
            useHTML: true,

        },


    },
    series: buildSeries(),

}

const key = ref(0);

watch(() => [props.data, props.extrapolationType, props.dataPointTypes, props.roadmapUnit],
    () => {

        physicalQubits.value = Array.from({
            length: Math.max(Math.max(...Object.keys(props.data)), currentYear + 10) - currentYear + 1
        }, (_, i) => [
            i + currentYear,
            utils.getPhysicalQubits(i + currentYear, props.data, props.extrapolationType)
        ])

        const newSeries = buildSeries();
        chartOptions.series = newSeries;
        key.value += 1;

    }, { deep: true });


</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>
