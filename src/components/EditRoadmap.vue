<template>
    <Dialog :title="'Edit ' + name + ' Roadmap'"
    button-label="Advanced options" ref="dialog" @save="save" @cancel="cancel" @reset="reset"
        classes="max-w-7xl" @openModal="reset">
        <template v-slot:button="{ openModal }">
            <slot :openModal="openModal" />
        </template>

        <template #reference>
            <ReferenceDialog title="References" classes="max-w-lg">
                        <template #content>
                            <HardwareReferences />
                        </template>
                    </ReferenceDialog>
        </template>


        <template #content>

            <div class="flex items-start justify-between gap-4">
                <div class=" flex-[0.5] flex-col gap-4">
                    <div class="w-full mb-4">
                        <p class="text-xs text-justify text-gray-600 ">Adjust the values within the roadmap or incorporate
                            additional data points as needed. Interpolation will be used to address any gaps between
                            existing milestones on the roadmap. For projecting future trends and values beyond the current
                            roadmap, regression analysis will be utilized.</p>
                            

                    </div>
                    <div class="my-2 w-full">
                        <label class="text-xs text-gray-600" for="extrapolationType">Extrapolation Type</label>
                        <select v-model="extrapolationType" class="w-full p-1 ring-1 ring-slate-200">
                            <option value="linear">Linear</option>
                            <option value="exponential">Exponential</option>
                        </select>
                    </div>
                    <div class="my-2 w-full">
                        <label class="text-xs text-gray-600" for="extrapolationType">Roadmap Unit</label>
                        <select v-model="roadmapUnit" class="w-full p-1 ring-1 ring-slate-200">
                            <option value="physical">Physical Qubits</option>
                            <option value="logical">Logical Qubits</option>
                        </select>
                    </div>
                    <label class="text-xs  text-gray-600" for="roadmap">Roadmap</label>
                    <table class=" text-sm  w-full border-collapse border-spacing-2 border border-slate-500">
                        <thead class="border rounded-xl">
                            <tr class="text-gray-700">
                                <th class="border border-slate-200 p-1">Year</th>
                                <th class="border border-slate-200 p-1"># of {{ roadmapUnit}} qubits</th>
                                <th class="border border-slate-200 p-1"></th>
                            </tr>
                        </thead>
                        <tbody class="">
                            <tr v-for="(roadmap, index) in roadmapData" :key="index">
                                <td class="border border-slate-200 p-1">
                                    <input class="p-0.5 ring-1 ring-slate-200 " type="number" v-model="roadmap.year" />
                                </td>
                                <td class="border border-slate-200 p-1">
                                    <input class="p-0.5 ring-1 ring-slate-200 " type="number" v-model="roadmap.qubits" />
                                </td>
                                <td class="border border-slate-200 p-1">
                                    <button class="text-sm text-red-900 hover:text-red-500 transition-all"
                                        @click="roadmapData.splice(index, 1)">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <button @click="roadmapData.push({ year: '', qubits: '' })"
                        class="m-2 mx-auto bg-blue-900 flex text-xs items-center hover:bg-blue-500 text-white transition-all rounded-full p-1 px-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg> Add

                    </button>
                </div>
                <div class="flex-1">
                    <QubitsRoadmap :data="dataToGraph" 
                    :extrapolationType="extrapolationType"
                    />
                </div>

            </div>

        </template>
    </Dialog>
</template>

<script setup>
import Dialog from './Dialog.vue';
import { computed, onMounted, ref, watch } from 'vue';
import QubitsRoadmap from './QubitsRoadmap.vue';
import ReferenceDialog from './ReferenceDialog.vue';
import HardwareReferences from './HardwareReferences.vue';

const dialog = ref(null);
const roadmapData = ref(null);
const props = defineProps({
    name: String,
    roadmap: Object,
    extrapolationType: String,
    roadmapUnit: String,
    physicalLogicalQubitsRatio: Number
});

const dataToGraph = ref([])
const extrapolationType = ref(props.extrapolationType);
const roadmapUnit = ref(props.roadmapUnit);

watch(roadmapData, (newVal) => {
    dataToGraph.value = Object.fromEntries(newVal.filter(roadmap => roadmap.year && roadmap.qubits).map(roadmap => ([Number(roadmap.year), roadmap.qubits])))
}, { deep: true })

function reset() {
    extrapolationType.value = props.extrapolationType;
    roadmapUnit.value = props.roadmapUnit;
    roadmapData.value = Object.entries(props.roadmap).map(([key, value]) => {
        return {
            year: key,
            qubits: value 
        }
    });
}

// Automatically switches the qubit values based on PLQR (This implementation is buggy with how this component appears twice in Form.vue).
// Additionally, users might interpret the converted roadmap to symbolize the same thing as the original roadmap, but because this conversion does not account
// for PLQR-change over time, it does not. 
// watch(() => roadmapUnit.value, (newVal) => {
//     roadmapData.value = roadmapData.value.map(roadmap => {
//         return {
//             year: roadmap.year,
//             qubits: roadmap.qubits * (newVal === 'physical' ? props.physicalLogicalQubitsRatio : 1/(props.physicalLogicalQubitsRatio))
//         }
//     })
// })
   

function save() {
    const newRoadmap = roadmapData.value.sort((a, b) => a.year - b.year)
        .reduce((acc, curr) => {
            if (curr.year && curr.qubits)
                acc[curr.year] = curr.qubits;
            return acc;
        }, {});


    emit("updateRoadmap", {
        roadmap: newRoadmap,
        extrapolationType: extrapolationType.value,
        roadmapUnit: roadmapUnit.value
    });
    dialog.value.closeModal();
}

function cancel() {
    dialog.value.closeModal();
}

const emit = defineEmits(['updateRoadmap'])

</script>
