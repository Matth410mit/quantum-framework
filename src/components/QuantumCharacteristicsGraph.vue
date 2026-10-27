<script setup>

import Highcharts, { Legend, color } from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more';
import highchartsAnnotations from 'highcharts/modules/annotations';
highchartsAnnotations(Highcharts);
highchartsMore(Highcharts);
import { Chart } from 'highcharts-vue'
import { ref, defineProps, watch } from 'vue';
import * as utils from "../store/utils"
import {
    QUBIT_COLORS, qubitColor, qubitUnitLabel, roadmapPointSeries, extrapolatedLegendSeries, extrapolationZones,
    beyondRoadmapBands, yearTickInterval,
} from '../store/roadmapNotation'

const currentYear = new Date().getFullYear();
const PROBLEM_SIZE_COLOR = '#8b0000' // darkred

const props = defineProps({
    data: Object,
})

function processDataToGraph(data) {
    // data contains classicalCostSteps, classicalSteps, quantumCostSteps, quantumSteps, stepCostStar, nCostStar, stepStar, nStar
    // the steps ara list of lists of the form [problem size, step]
    // I want to round the problem sizes to 2 decimal places, and remove duplicates
    let nStar = utils.round(data.nStar, 2)
    let nCostStar = utils.round(data.nCostStar, 2)
    let tStar = utils.round(data.tStar, 2)
    let tCostStar = utils.round(data.tCostStar, 2)


    const maxX = Math.max(tCostStar, tStar) + 1

    let problemSize = data.quantumFeasible.filter(step => step[0] <= maxX)
    const logQubitsNeeded = utils.createLogQubitsNeeded(data.qubitsNeeded)
    const logicalQubits = problemSize.map(point => [point[0], Math.max(logQubitsNeeded(point[1]), 0)])
    // A logical-qubit roadmap says nothing about physical qubits.
    const roadmapUnit = data.roadmapUnit === 'logical' ? 'logical' : 'physical'
    const physicalQubits = roadmapUnit === 'physical'
        ? problemSize.map(point => [point[0], utils.getPhysicalQubits(point[0], data.roadmap, data.extrapolationType)])
        : []

    const maxY = Math.max(...problemSize.map(point => point[1]), ...logicalQubits.map(point => point[1]), ...physicalQubits.map(point => point[1]))


    return {
        problemSize, logicalQubits, tStar, nStar, tCostStar, nCostStar, maxY, maxX, physicalQubits,
        roadmap: data.roadmap, dataPointTypes: data.dataPointTypes || {}, roadmapUnit,
    }
}

let data = processDataToGraph(props.data)

const key = ref(0);



const chartOptions = {
    chart: {
        zooming: {
            type: 'xy',

        },

        marginRight: 180,
    },
    credits: {
        enabled: false
    },
    title: {
        text: 'Quantum Timelines',
        style: {
            fontSize: '14px'
        }
    },
    // legend: false,
    tooltip: {
        useHTML: true,
        shared: true,
        crosshairs: true,
        shadow: false,
        backgroundColor: 'transparent',
        positioner: function (labelWidth, labelHeight, point) {
            const chart = this.chart;
            const x = Math.max(chart.plotLeft, Math.min(
                point.plotX + chart.plotLeft - labelWidth / 2,
                chart.plotLeft + chart.plotWidth - labelWidth
            ));
            const y = chart.plotTop + chart.plotHeight + 10;
            return { x, y };
        },
        formatter: function () {

            const year = utils.round(this.points[0].x, data.maxX - currentYear <= 5 ? 1 : 0)


            return `
            <div class="flex flex-col gap-1 bg-white p-2 rounded-lg shadow-md">
                <p class="text-gray-700 mb-1 font-bold"><span >${year}</span></p>
                ${this.points.map(point => `<div class="flex items-center gap-1">
                        <span class="w-4 h-[2px]" style="background-color: ${point.series.color};"></span>
                        <span class="flex-1 gap-1 flex justify-between" >${point.series.name === 'Classical' ? 'Classical Steps/Cost' : point.series.name}: <span class="min-w-[5ch] text-gray-700 font-bold">${utils.toBase10HTML(point.y)}</span></span>
                        </div>`).join('')
                }
            </div>
            `
        }
    },
    xAxis: {
        title: {
            text: 'Year'
        },
        type: 'linear',
        labels: {

            useHTML: true,
            formatter: function () {
                return this.value.toFixed(2);
            }
        },
        min: currentYear,
        max: data.maxX,
        plotLines: [{
            value: data.tStar,
            color: 'rgba(0,45,157,1)',
            width: 2,
            label: {
                text: 'Quantum faster',
                style: {
                    color: 'rgba(0,45,157,1)'
                }
            }
        },
        {
            value: data.tCostStar,
            color: 'rgba(48,158,244,1)',
            width: 2,
            align: 'left',

            label: {
                text: 'Quantum cheaper',
                align: 'left',

                style: {
                    color: 'rgba(48,158,244,1)'
                }
            }
        },
        ]
    },
    yAxis: {
        title: {
            text: ''
        },
        type: 'linear',
        labels: {

            useHTML: true,
            formatter: function () {
                // return `10<sup>${this.value}</sup>`;
                return utils.toBase10HTML(this.value);
            }
        },
        min: 0,
        gridLineWidth: 1,
        gridLineColor: 'rgba(250,250,250,1)',
        gridZIndex: -1,
        endOnTick: false,
        maxPadding: 0.2,

    },
    plotOptions: {
        areaspline: {
            fillOpacity: 0.5,
            threshold: 20
        },
        series: {
            labels: {
                connectorAllowed: false
            },
            lineWidth: 2,
            animation: false,

        },
        scatter: {
            dataLabels: {
                color: 'black',
                verticalAlign: 'bottom',
                enabled: true
            },
            enableMouseTracking: false,
            marker: {
                enabled: true
            }
        }
    },
    series: [

    ]
}

watch(() => props.data, async () => {
    // console.log(props.data)
    data = processDataToGraph(props.data)
    updateGraph()

    key.value += 1;
}, { immediate: true, deep: true })


function updateGraph() {
    if (data.tStar <= 0) {
        chartOptions.yAxis.max = 100
    } else {
    }
    chartOptions.xAxis.max = data.maxX
    const currentYear = new Date().getFullYear()
    const lastYear = data.maxX
    const mid = parseInt((data.maxX - currentYear) / 2) + currentYear
    // Whole years when the range allows (as in the Edit roadmap chart), so a
    // roadmap point sits on its year's tick.
    if (lastYear - currentYear > 3) {
        chartOptions.xAxis.tickPositions = undefined
        chartOptions.xAxis.tickInterval = yearTickInterval(lastYear - currentYear)
    } else {
        chartOptions.xAxis.tickInterval = undefined
        chartOptions.xAxis.tickPositions = [
            currentYear,
            (currentYear + mid) / 2,
            mid,
            (mid + lastYear) / 2,
            lastYear
        ]
    }
    chartOptions.xAxis.labels = {

        useHTML: true,
        formatter: function () {
            if (lastYear - currentYear > 3)
                return this.value.toFixed(0);
            if (lastYear - currentYear > 1)
                return utils.yearToQuarter(this.value);
            return utils.yearToMonth(this.value);
        }
    }
    chartOptions.xAxis.plotLines = [{
        value: data.tStar,
        color: 'rgba(0,45,157,1)',
        width: 2,
        label: {
            align: (data.tStar < data.tCostStar && (Math.abs(data.tCostStar - data.tStar) / data.maxX) < 0.0006) ? 'right' : 'left',
            x: (data.tStar < data.tCostStar && (Math.abs(data.tCostStar - data.tStar) / data.maxX) < 0.0006) ? -5 : 5,
            rotation: 0,
            text: (data.tStar < data.tCostStar ? '<br>Quantum<br>Faster' : '<br>Quantum<br>Faster and Cheaper'),
            style: {
                color: 'rgba(0,45,157,1)',
                textAlign: (data.tStar < data.tCostStar && (Math.abs(data.tCostStar - data.tStar) / data.maxX) < 0.0006) ? 'right' : 'left',
            }
        }
    },
    {
        value: data.tCostStar,
        color: 'rgba(48,158,244,1)',
        width: 2,
        label: {
            align: (data.tStar >= data.tCostStar && (Math.abs(data.tCostStar - data.tStar) / data.maxX) < 0.0006) ? 'right' : 'left',
            x: (data.tStar >= data.tCostStar && (Math.abs(data.tCostStar - data.tStar) / data.maxX) < 0.0006) ? -5 : 5,
            rotation: 0,
            text: (data.tStar >= data.tCostStar ? '<br>Quantum<br>Cheaper' : '<br>Quantum<br>Faster and Cheaper'),
            style: {
                textAlign: (data.tStar >= data.tCostStar && (Math.abs(data.tCostStar - data.tStar) / data.maxX) < 0.0006) ? 'right' : 'left',
                color: 'rgba(48,158,244,1)'
            }
        }
    },
    ]
    // The years past the last roadmap point are shaded (and the lines faded)
    // instead of marked with a line.
    chartOptions.xAxis.plotBands = beyondRoadmapBands(data.roadmap)



    // An end-of-line label naming the series.
    function withEndLabel(points, name, color) {
        const last = points.at(-1)
        if (!last) return points
        return [...points, {
            x: last[0],
            y: last[1],
            dataLabels: {
                enabled: true,
                align: 'left',
                x: 3,
                verticalAlign: 'middle',
                overflow: false,
                crop: false,
                color,
                shadow: false,
                style: { fontSize: '12px', fontWeight: 'bold', textOutline: 'none' },
                formatter: () => name,
            },
        }]
    }

    function lineSeries(name, points, color) {
        return {
            name,
            data: withEndLabel(points, name, color),
            color,
            zoneAxis: 'x',
            zones: extrapolationZones(data.roadmap, color),
            marker: { enabled: false, symbol: 'circle' },
        }
    }

    chartOptions.series = [
        lineSeries(qubitUnitLabel('logical'), data.logicalQubits, QUBIT_COLORS.logical),
        ...(data.physicalQubits.length ? [lineSeries(qubitUnitLabel('physical'), data.physicalQubits, QUBIT_COLORS.physical)] : []),
        lineSeries('Problem size', data.problemSize, PROBLEM_SIZE_COLOR),
        // The roadmap's own points, on the qubit line they count.
        ...roadmapPointSeries(data.roadmap, data.dataPointTypes, qubitColor(data.roadmapUnit)),
        extrapolatedLegendSeries(),
    ]
    chartOptions.annotations = [
    ]
}

</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>