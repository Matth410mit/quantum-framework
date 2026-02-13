<script setup>
import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more';
import highchartsAnnotations from 'highcharts/modules/annotations';
highchartsAnnotations(Highcharts);
highchartsMore(Highcharts);
import { Chart } from 'highcharts-vue'
import { ref, defineProps, watch } from 'vue';
import * as utils from "../store/utils"

const currentYear = new Date().getFullYear();

const props = defineProps({
    data: Object,
    // NEW: toggles from parent
    showSteps: {
        type: Boolean,
        default: true
    },
    showCost: {
        type: Boolean,
        default: true
    }
})

function processDataToGraph(data) {
    // Safe defaults so the component can mount when no model is loaded yet
    if (!data || !Array.isArray(data.quantumAdvantage)) {
        const fallbackMaxX = new Date().getFullYear() + 5;
        return {
            graphTitle: 'Quantum Economic Advantage',
            quantumAdvantage: [],
            quantumCostAdvantage: [],
            quantumFeasible: [],
            tStar: 0,
            nStar: 0,
            tCostStar: 0,
            nCostStar: 0,
            maxY: 100,
            maxX: fallbackMaxX,
            quantumAdvantageArea: [],
            quantumCostAdvantageArea: [],
            advantageAreaXMid: 0,
            advantageAreaYMid: 0,
            costAdvantageAreaXMid: 0,
            costAdvantageAreaYMid: 0,
            advantageAreaMid: [0, 0],
            costAdvantageAreaMid: [0, 0],
        };
    }

    let nStar = utils.round(data.nStar, 2);
    let nCostStar = utils.round(data.nCostStar, 2);
    let tStar = utils.round(data.tStar, 2);
    let tCostStar = utils.round(data.tCostStar, 2);

    const midY = (nCostStar + nStar) / 2;
    const midX = (tStar + tCostStar) / 2;

    const maxY = (midY === 0)
        ? Math.min(...[data.quantumAdvantage, data.quantumCostAdvantage, data.quantumFeasible]
            .filter(arr => Array.isArray(arr) && arr.length)
            .map(arr => Math.max(...arr.map(step => step[1]))), 100)
        : midY * 2;

    const maxX = (midX === 0)
        ? Math.min(...[data.quantumAdvantage, data.quantumCostAdvantage, data.quantumFeasible]
            .filter(arr => Array.isArray(arr) && arr.length)
            .map(arr => Math.max(...arr.map(step => step[0]))), new Date().getFullYear() + 5)
        : midX + (midX - currentYear);

    let quantumAdvantage = data.quantumAdvantage.filter(step => step[0] <= maxX && step[1] <= maxY);
    let quantumCostAdvantage = data.quantumCostAdvantage.filter(step => step[0] <= maxX && step[1] <= maxY);
    let quantumFeasible = data.quantumFeasible.filter(step => step[0] <= maxX && step[1] <= maxY);

    // Capped feasibility (when max compute time cap is enabled)
    const hasTimeCap = Array.isArray(data.quantumFeasibleCapped) && data.quantumFeasibleCapped.length > 0;
    let quantumFeasibleCapped = hasTimeCap
        ? data.quantumFeasibleCapped.filter(step => step[0] <= maxX && step[1] <= maxY)
        : null;

    // For advantage area calculations, use capped feasibility if available
    const feasibleForAreas = hasTimeCap ? data.quantumFeasibleCapped : data.quantumFeasible;

    let quantumAdvantageArea = data.quantumAdvantage.filter(step => step[0] >= tStar);
    let quantumCostAdvantageArea = data.quantumCostAdvantage.filter(step => step[0] >= tCostStar);
    const quantumFeasibleAux = Object.fromEntries(feasibleForAreas.map(step => [step[0], step[1]]));
    const quantumCostAdvantageAux = Object.fromEntries(data.quantumCostAdvantage.map(step => [step[0], step[1]]));
    const quantumAdvantageAux = Object.fromEntries(data.quantumAdvantage.map(step => [step[0], step[1]]));

    quantumAdvantageArea = quantumAdvantageArea.map(step => [step[0], step[1], Math.min(
        nStar >= nCostStar ? maxY : quantumCostAdvantageAux[step[0]], quantumFeasibleAux[step[0]])]);
    quantumCostAdvantageArea = quantumCostAdvantageArea.map(step => [step[0], step[1], Math.min(
        nCostStar > nStar ? maxY : quantumAdvantageAux[step[0]], quantumFeasibleAux[step[0]])]);

    const advantageAreaXSum = quantumAdvantageArea.reduce((sum, step) => sum + step[0], 0);
    const advantageAreaYSum = quantumAdvantageArea.reduce((sum, step) => sum + step[1], 0);
    const advantageAreaXMid = quantumAdvantageArea.length ? advantageAreaXSum / quantumAdvantageArea.length : 0;
    const advantageAreaYMid = quantumAdvantageArea.length ? advantageAreaYSum / quantumAdvantageArea.length : 0;

    const costAdvantageAreaXSum = quantumCostAdvantageArea.reduce((sum, step) => sum + step[0], 0);
    const costAdvantageAreaYSum = quantumCostAdvantageArea.reduce((sum, step) => sum + step[1], 0);
    const costAdvantageAreaXMid = quantumCostAdvantageArea.length ? costAdvantageAreaXSum / quantumCostAdvantageArea.length : 0;
    const costAdvantageAreaYMid = quantumCostAdvantageArea.length ? costAdvantageAreaYSum / quantumCostAdvantageArea.length : 0;

    const advantageAreaMid = [advantageAreaXMid, advantageAreaYMid];
    const costAdvantageAreaMid = [costAdvantageAreaXMid, costAdvantageAreaYMid];

    const problemName = props.data.problemName.split('(')[0];
    const graphTitle = 'Quantum Economic Advantage for ' + (problemName.length > 40 ? '<br>' + problemName : problemName);

    return {
        graphTitle,
        quantumAdvantage,
        quantumCostAdvantage,
        quantumFeasible,
        quantumFeasibleCapped,
        hasTimeCap,
        tStar,
        nStar,
        tCostStar,
        nCostStar,
        maxY,
        maxX,
        quantumAdvantageArea,
        quantumCostAdvantageArea,
        advantageAreaXMid,
        advantageAreaYMid,
        costAdvantageAreaXMid,
        costAdvantageAreaYMid,
        advantageAreaMid,
        costAdvantageAreaMid
    };
}

let data = processDataToGraph(props.data)

const key = ref(0);

const chartOptions = {
    chart: {
        marginRight: 80,
    },
    credits: {
        enabled: false
    },
    title: {
        text: data.graphTitle,
        style: {
            fontSize: '14px'
        }
    },
    legend: false,
    tooltip: {
        useHTML: true,
        shared: true,
        crosshairs: true,
        shadow: false,
        backgroundColor: 'transparent',
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
    },
    yAxis: {
        title: {
            text: 'Problem Size'
        },
        type: 'linear',
        labels: {
            useHTML: true,
            formatter: function () {
                return utils.toBase10HTML(this.value);
            }
        },
        min: 0,
        max: data.maxY,
        gridLineWidth: 1,
        gridLineColor: 'rgba(250,250,250,1)',
        endOnTick: false,
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
                enabled: false
            }
        }
    },
    series: []
}

watch(() => props.data, async () => {
    data = processDataToGraph(props.data)
    updateGraph()
    key.value += 1;
}, { immediate: true, deep: true })

// also watch the toggles so hiding a line updates immediately
watch(() => [props.showSteps, props.showCost], () => {
    updateGraph()
    key.value += 1;
})

function updateGraph() {
    if (!data) return;

    if (data.tStar <= 0) {
        chartOptions.yAxis.max = 100
    } else {
        chartOptions.yAxis.max = data.maxY
    }

    chartOptions.title.text = data.graphTitle
    chartOptions.xAxis.max = data.maxX
    const currentYear = new Date().getFullYear()
    const lastYear = data.maxX
    const mid = parseInt((data.maxX - currentYear) / 2) + currentYear
    chartOptions.xAxis.tickPositions = [
        currentYear,
        (currentYear + mid) / 2,
        mid,
        (mid + lastYear) / 2,
        lastYear
    ]
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

    // ******** NEW: build the series with the two guards ********
    const series = []

    // shaded speed area
    if (props.showSteps) {
        series.push({
            name: 'Quantum Speed Advantage',
            type: 'areasplinerange',
            data: data.quantumAdvantageArea,
            showInLegend: false,
            enableMouseTracking: false,
            color: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: data.tStar <= data.tCostStar ? [
                    [0, 'rgba(219,234,254,.2)'],
                    [0.7, 'rgba(0,45,157,.3)'],
                    [1, 'rgba(0,45,157,.3)'],
                ] : [
                    [0, 'rgba(24,102,201,.2)'],
                    [0.2, 'rgba(24,102,201,0.5)'],
                    [1, 'rgba(24,102,201,.2)'],
                ]
            },
            marker: {
                enabled: false,
                symbol: 'circle'
            },
        })
    }

    // shaded cost area
    if (props.showCost) {
        series.push({
            name: 'Quantum Cost Advantage',
            type: 'areasplinerange',
            data: data.quantumCostAdvantageArea,
            showInLegend: false,
            enableMouseTracking: false,
            color: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: data.tStar <= data.tCostStar ? [
                    [0, 'rgba(24,102,201,.2)'],
                    [0.2, 'rgba(24,102,201,0.5)'],
                    [1, 'rgba(24,102,201,0.2)'],
                ] : [
                    [0, 'rgba(219,234,254,.2)'],
                    [0.7, 'rgba(48,158,244,.3)'],
                    [1, 'rgba(48,158,244,.3)'],
                ]
            },
            marker: {
                enabled: false,
                symbol: 'circle'
            },
        })
    }

    // feasibility lines
    if (data.hasTimeCap && data.quantumFeasibleCapped) {
        // When time cap is active: show uncapped as dashed green, capped as solid blue
        series.push({
            name: 'Max Qubits',
            data: [...data.quantumFeasible, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: false,
                    crop: false,
                    color: 'green',
                    shadow: false,
                    style: {
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: center;">Max Qubits<br>(no time cap)</div>';
                    }
                },
                x: data.quantumFeasible[data.quantumFeasible.length - 1][0],
                y: data.quantumFeasible[data.quantumFeasible.length - 1][1],
            })],
            color: 'green',
            dashStyle: 'dash',
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        })

        series.push({
            name: 'Quantum Feasibility',
            data: [...data.quantumFeasibleCapped, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: false,
                    crop: false,
                    color: 'darkred',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: center;">Quantum<br>Feasibility<br>(time-capped)</div>';
                    }
                },
                x: data.quantumFeasibleCapped[data.quantumFeasibleCapped.length - 1][0],
                y: data.quantumFeasibleCapped[data.quantumFeasibleCapped.length - 1][1],
            })],
            color: 'darkred',
            dashStyle: 'solid',
            zoneAxis: 'x',
            zones: [{
                value: data.tStar,
            }, {
                dashStyle: 'solid'
            }],
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        })
    } else {
        // No time cap: single feasibility line (original behavior)
        series.push({
            name: 'Quantum Feasibility',
            data: [...data.quantumFeasible, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: false,
                    crop: false,
                    color: 'darkred',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: center;">Quantum<br>Feasibility</div>';
                    }
                },
                x: data.quantumFeasible[data.quantumFeasible.length - 1][0],
                y: data.quantumFeasible[data.quantumFeasible.length - 1][1],
            })],
            color: 'darkred',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: data.tStar,
            }, {
                dashStyle: 'solid'
            }],
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        })
    }

    // speed line
    if (props.showSteps) {
        series.push({
            name: 'Quantum Advantage',
            data: [...data.quantumAdvantage, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: true,
                    crop: false,
                    color: 'rgba(0,45,157,1)',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Speed<br/>Advantage</div>';
                    }
                },
                x: data.quantumAdvantage[data.quantumAdvantage.length - 1][0],
                y: data.quantumAdvantage[data.quantumAdvantage.length - 1][1],
            })],
            color: 'rgba(0,45,157,1)',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: data.tStar,
            }, {
                dashStyle: 'solid'
            }],
            marker: {
                enabled: false,
                symbol: 'circle'
            },
        })
    }

    // cost line
    if (props.showCost) {
        series.push({
            name: 'Quantum Cost Advantage',
            data: [...data.quantumCostAdvantage, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: true,
                    crop: false,
                    color: 'rgba(48,158,244,1)',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Cost<br/>Advantage</div>';
                    }
                },
                x: data.quantumCostAdvantage[data.quantumCostAdvantage.length - 1][0],
                y: data.quantumCostAdvantage[data.quantumCostAdvantage.length - 1][1],
            })],
            color: 'rgba(48,158,244,1)',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: data.tCostStar,
            }, {
                dashStyle: 'solid'
            }],
            marker: {
                enabled: false,
                symbol: 'circle'
            },
            dataLabels: {
                enabled: true,
                align: 'right',
                x: 5,
                formatter: function () {
                    if (this.point.index === this.series.data.length - 1) {
                        return 'Quantum Cost Advantage';
                    }
                    return null;
                }
            },
        })

        // cost star point
        series.push({
            name: 'Quantum Cost Advantage',
            data: [[data.tCostStar, data.nCostStar,]],
            color: 'rgba(48,158,244,1)',
            type: 'scatter',
            maxPointWidth: 1,
            dataLabels: {
                enabled: true,
                align: 'right',
                useHTML: true,
                formatter: function () {
                    return `
                    <p class="text-gray-700 mb-1 font-bold" style="color: ${this.series.color};">${utils.round(this.x, data.maxX - currentYear <= 5 ? 1 : 0)}</p>
                    `
                },
            },
            marker: {
                enabled: true,
                symbol: 'circle'
            },
            showInLegend: false
        })
    }

    // speed star point
    if (props.showSteps) {
        series.push({
            name: 'Quantum Advantage',
            data: [[data.tStar, data.nStar]],
            color: 'rgba(0,45,157,1)',
            type: 'scatter',
            maxPointWidth: 1,
            dataLabels: {
                enabled: true,
                align: 'right',
                useHTML: true,
                formatter: function () {
                    return `
                    <p class="text-gray-700 mb-1 font-bold" style="color: ${this.series.color};">${utils.round(this.x, data.maxX - currentYear <= 5 ? 1 : 0)}</p>
                    `
                },
            },
            marker: {
                enabled: true,
                symbol: 'circle'
            },
            showInLegend: false
        })
    }

    chartOptions.series = series

    // build annotations only if at least one toggle is on
    if (!props.showSteps && !props.showCost) {
        chartOptions.annotations = [];
        return;
    }

    chartOptions.annotations = [
        {
            allowOverlap: true,
            draggable: "",
            labelrank: props.showCost && data.tStar <= data.tCostStar ? 1 : 0,
            labelOptions: {
                backgroundColor: "transparent",
                borderColor: "transparent",
                color: "black",
                shape: "",
                fontSize: '12px',
                fontColor: 'black',
                rotation: -25
            },
            labels: props.showCost ? [
                {
                    point: { x: data.costAdvantageAreaMid[0], y: data.costAdvantageAreaMid[1], xAxis: 0, yAxis: 0 },
                    color: 'black',
                    x: data.maxX * 0.5,
                    y: data.maxY * 0.1,
                    useHTML: true,
                    text: data.tStar <= data.tCostStar
                        ? '<b class="">Quantum<br>Economic Advantage:</b><br>Faster and Cheaper'
                        : 'Quantum cheaper',
                    style: {
                        color: 'rgba(48,158,244,.9)',
                        fontSize: '12px',
                        fontWeight: '',
                        textAlign: 'center',
                        pointerEvents: 'none'
                    },
                },
            ] : []
        },
        {
            allowOverlap: true,
            draggable: "",
            labelrank: props.showSteps && data.tStar > data.tCostStar ? 1 : 0,
            labelOptions: {
                backgroundColor: "transparent",
                borderColor: "transparent",
                color: "black",
                shape: "",
                fontSize: '12px',
                fontColor: 'black',
            },
            labels: props.showSteps ? [
                {
                    point: { x: data.advantageAreaMid[0], y: data.advantageAreaMid[1], xAxis: 0, yAxis: 0 },
                    x: data.maxX * 0.5,
                    y: data.maxY * 0.1,
                    color: 'black',
                    useHTML: true,
                    text: data.tStar >= data.tCostStar
                        ? '<b class="">Quantum<br>Economic Advantage:</b><br>Faster and Cheaper'
                        : 'Quantum faster',
                    style: {
                        fontSize: '12px',
                        fontWeight: '',
                        textAlign: 'center',
                        color: 'rgba(0,45,157,.9)',
                        pointerEvents: 'none'
                    },
                },
            ] : []
        },
    ].filter(a => a.labels && a.labels.length > 0)
}
</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>
