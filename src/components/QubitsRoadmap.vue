
<script setup>
import { Chart } from 'highcharts-vue'
import { number } from 'mathjs';
import { defineProps, ref, watch } from 'vue';
import * as utils from "../store/utils"

const currentYear = new Date().getFullYear();

const props = defineProps({
    data: Object,
    extrapolationType: String
});

const physicalQubits = ref(Array.from({
    length: Math.max(Math.max(...Object.keys(props.data)) + 10, currentYear + 10) - currentYear
}, (_, i) => [
    i + currentYear,
    utils.getPhysicalQubits(i + currentYear, props.data, props.extrapolationType)
]))

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
    series: [
        {
            data: physicalQubits.value,
            type: 'line',
            color: '#002D9D55',
            enableMouseTracking: false,
            // hide on legend 
            showInLegend: false,
        },
        {
            name: 'Roadmap',
            // if value is not a key in the roadmap, then it is a linear interpolation
            data: physicalQubits.value.filter(([year, qubits]) => props.data.hasOwnProperty(year)),
            type: 'scatter',
            color: 'blue',
            marker: {
                symbol: 'circle'
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
        {
            name: 'Extrapolated',
            data: physicalQubits.value.filter(([year, qubits]) => !props.data.hasOwnProperty(year)),
            type: 'scatter',
            color: 'red',
            marker: {
                symbol: 'circle'
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

    ],

}

const key = ref(0);

watch(() => [props.data, props.extrapolationType],
    () => {

        physicalQubits.value = Array.from({
            length: Math.max(Math.max(...Object.keys(props.data)), currentYear + 10) - currentYear + 1
        }, (_, i) => [
            i + currentYear,
            utils.getPhysicalQubits(i + currentYear, props.data, props.extrapolationType)
        ])
        chartOptions.series[0].data = physicalQubits.value;
        chartOptions.series[1].data = physicalQubits.value.filter(([year, qubits]) => props.data.hasOwnProperty(year));
        chartOptions.series[2].data = physicalQubits.value.filter(([year, qubits]) => !props.data.hasOwnProperty(year));
        key.value += 1;

        // console.log(regressionMap)
        // console.log(regressionMap.size)
    }, { deep: true });


</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>