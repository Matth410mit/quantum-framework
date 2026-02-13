<script setup>

import Highcharts, { Legend, color } from 'highcharts'
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
    const logicalQubits = problemSize.map(point => [point[0], utils.problemSizeToQubits(point[1], data.qubitToProblemSize)])
    const physicalQubits = problemSize.map(point => [point[0], utils.getPhysicalQubits(point[0], data.roadmap, data.extrapolationType)])

    const maxY = Math.max(...problemSize.map(point => point[1]), Math.max(...logicalQubits.map(point => point[1])), Math.max(...physicalQubits.map(point => point[1])))
    
    const roadmap = Object.entries(data.roadmap).map(entry => [Number(entry[0]), Math.log10(entry[1])])
    
    const lastRoadmapPoint = Object.keys(data.roadmap).at(-1);
    
    // console.log(maxX, maxY)
    // console.log(roadmap)
    // console.log(physicalQubits)

    return { problemSize, logicalQubits, tStar, nStar, tCostStar, nCostStar, maxY, maxX, lastRoadmapPoint, physicalQubits, roadmap }
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
        }, {
            value: data.lastRoadmapPoint,
            color: 'lightgray',
            width: 2,
            label: {
                text: 'Last Roadmap Data',
                style: {
                    color: 'lightgray'
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
    }, {
        value: data.lastRoadmapPoint,
        color: 'lightgray',
        width: 2,
        label: {
            rotation: 0,
            text: 'Last Roadmap<br> Data',
            style: {
                color: 'lightgray'
            }
        }
    },
    ]



    chartOptions.series = [
    {
            name: 'Logical Qubits',
            data: [...data.logicalQubits, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: false,
                    crop: false,
                    color: 'indigo',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    // breakline
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Logical Qubits</div>';
                    }

                },
                x: data.logicalQubits[data.logicalQubits.length - 1][0],
                y: data.logicalQubits[data.logicalQubits.length - 1][1],

            })],
            color: 'indigo',
            dashStyle: 'solid',
            zoneAxis: 'x',
            zones: [{
                value: data.lastRoadmapPoint,
            }, {
                dashStyle: 'dash'
            }],
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },
        {
            name: 'Physical Qubits',
            data: [...data.physicalQubits, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: false,
                    crop: false,
                    color: 'teal',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    // breakline
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Physical Qubits</div>';
                    }

                },
                x: data.physicalQubits[data.physicalQubits.length - 1][0],
                y: data.physicalQubits[data.physicalQubits.length - 1][1],

            })],
            color: 'teal',
            dashStyle: 'solid',
            zoneAxis: 'x',
            zones: [{
                value: data.lastRoadmapPoint,
            }, {
                dashStyle: 'dash'
            }],
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },
        {
            name: 'Problem Size',
            data: [...data.problemSize, ({
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
                    // breakline
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Problem Size</div>';
                    }

                },
                x: data.problemSize[data.problemSize.length - 1][0],
                y: data.problemSize[data.problemSize.length - 1][1],

            })],
            color: 'darkred',
            dashStyle: 'solid',
            zoneAxis: 'x',
            zones: [{
                value: data.lastRoadmapPoint,
            }, {
                dashStyle: 'dash'
            }],
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },
        

        {
            name: 'Roadmap',
            data: data.roadmap,
            color: 'teal',
            type: 'scatter',
            maxPointWidth: 2,
            dataLabels: {
                enabled: true,
                align: 'right',
                useHTML: true,
                formatter: function () {
                    return `
                    <p class="text-gray-700 mb-1 font-bold" style="color: ${this.series.color};">${utils.toBase10HTML(this.y)}</p>
                    `
                },
            },
            marker: {
                enabled: true,
                symbol: 'circle'
            },
            showInLegend: false

        },
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