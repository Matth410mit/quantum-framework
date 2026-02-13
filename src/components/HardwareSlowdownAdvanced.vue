<template>
    <Dialog title="Classical Hardware Speed Advantage" button-label="Advanced options" ref="dialog" @save="save" @cancel="cancel"
        @reset="reset" @openModal="reset" classes="max-w-xl">
        <template v-slot:button="{ openModal }">
            <slot :openModal="openModal" />
        </template>


        <template #content>
            <div class="flex flex-col">
                <div class="flex items-center gap-2">

                    <label class="font-medium text-sm " for="speed">Classical/Quantum Speed Ratio</label>
                    <div class="text-xs ">
                        <input hidden type="radio" id="simple" value="simple" v-model="inputType" />
                        <label class="border rounded-sm transition-all text-center p-1" :class="{
                            'bg-[#002D9D] text-white': inputType === 'simple',
                            'bg-gray-100': inputType !== 'simple'
                        }" for="simple">Simple</label>
                        <input hidden type="radio" id="manual" value="manual" v-model="inputType" />
                        <label class="border rounded-sm transition-all text-center p-1" :class="{
                            'bg-[#002D9D] text-white': inputType === 'manual',
                            'bg-gray-100': inputType !== 'manual'
                        }" for="manual">Manual</label>
                    </div>
                </div>
                <p class="text-xs text-gray-600">The ratio of the speed of a classical computer
                    divided by the speed of the quantum computer.</p>


                <div v-if="inputType === 'manual'">
                    <div class="flex items-end mt-2 justify-between w-full gap-2">
                        <div class="flex-1">
                            <div class="flex items-end">
                                <div class="">
                                    <p class="font-medium text-xs ">Average Quantum<br/>Operation Time</p>
                                    <p style="font-size: 9px;">(Default: Two-Qubit Gate Time)</p>
                                    <div class="flex items-center gap-1">
                                        <input class="bg-gray-100 p-1 rounded-lg text-center w-1/2" type="number"
                                            id="gateTime" v-model="gateTime" /> ns
                                    </div>
                                    
                                </div>


                                <div>

                                    <p class="font-medium text-xs ">Classical CPU GHz</p>
                                    <div class="flex items-center gap-1">

                                        <input class="bg-gray-100 p-1 rounded-lg text-center w-1/2" type="number"
                                            id="cpuGHz" v-model="cpuGHz" /> GHz
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div class="w-1/5 ">

                            <p class="font-medium text-xs  ">Speed ratio</p>
                            <div class="bg-gray-100 p-2 rounded-lg text-center w-full">

                                {{ manualSpeed }}
                            </div>
                        </div>


                    </div>


                </div>
                <div v-else>
                    <div class="flex items-center justify-between w-full gap-2">
                        <input class="flex-1 accent-[#002D9D]" type="range" id="speed" v-model="speed" min="1"
                            max="1000000" />
                        <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" id="speed"
                            v-model="speed" />
                    </div>
                </div>


            </div>
            <div class="mt-4">
                <label class="font-medium text-sm" for="gateOverhead">Error Correction Gate Overhead</label>
                <p class="text-xs text-gray-600">The gate overhead (i.e. additional calculations) that a quantum
                    computer
                    needs to take to maintain
                    its error correction.</p>
                <div class="flex items-center justify-between w-full gap-2">
                    <input class="flex-1 accent-[#002D9D]" type="range" id="gateOverhead" v-model="gateOverhead" min="1"
                        max="1000" />
                    <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" id="gateOverhead"
                        v-model="gateOverhead" />
                </div>

            </div>
            <div class="mt-4">
                <label class="font-medium text-sm" for="algorithmConstant">Algorithm Constant Ratio</label>
                <p class="text-xs text-gray-600">
                    The ratio of the multiplicative constant from
                    the classical algorithm's time complexity divided by that
                    from the quantum algorithm's.
                </p>
                <div class="flex items-center justify-between w-full gap-2">
                    <input class="flex-1 accent-[#002D9D]" type="range" id="algorithmConstant"
                        v-model="algorithmConstant" min="0.1" max="2" step="0.1" />
                    <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" id="algorithmConstant"
                        v-model="algorithmConstant" />
                </div>

            </div>
            <div class="mt-4">
                <p class="text-xs text-gray-600">
                    Source: <a href="https://arxiv.org/abs/2310.15505">https://arxiv.org/abs/2310.15505</a>
                </p>

            </div>

            <div class="mt-4 text-center">
                <h2 class="italic font-medium">Speed x Gate Overhead x Alg. Constant =</h2>
                <h2 class="font-medium text-2xl">10<sup>{{ hwSlowdown }}</sup></h2>

            </div>
        </template>
    </Dialog>
</template>

<script setup>
import Dialog from './Dialog.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useDialogInputStore } from '../store/dialogInputs.js';
import * as utils from "../store/utils"

const dialog = ref(null);

const props = defineProps({
    advancedSlowdown: Object,
});

const inputType = ref("simple");

const gateTime = ref(props.advancedSlowdown.gateTime);
const cpuGHz = ref(props.advancedSlowdown.cpuGHz);
const speed = ref(props.advancedSlowdown.speed);
const gateOverhead = ref(props.advancedSlowdown.gateOverhead);
const algorithmConstant = ref(props.advancedSlowdown.algorithmConstant);

const manualSpeed = computed(() => {
    return gateTime.value * cpuGHz.value
})

const hwSlowdown = ref(0); //initial value ignored

watch([() => [inputType.value, manualSpeed.value, speed.value, gateOverhead.value, algorithmConstant.value], () => {
    if (inputType.value === "manual") {
        hwSlowdown.value = utils.round(Math.log10(manualSpeed.value * gateOverhead.value * algorithmConstant.value), 2);
    }
    else {
        hwSlowdown.value = utils.round(Math.log10(speed.value * gateOverhead.value * algorithmConstant.value), 2);
    }
}])

function save() {
    let newAdvancedSlowdown = {
        gateTime: gateTime.value,
        cpuGHz: cpuGHz.value,
        speed: speed.value,
        gateOverhead: gateOverhead.value,
        algorithmConstant: algorithmConstant.value,
    }

    emit("updateSlowdown", hwSlowdown.value, newAdvancedSlowdown);
    dialog.value.closeModal();
}

function cancel() {
    dialog.value.closeModal();
}

function reset() {
    gateTime.value = props.advancedSlowdown.gateTime;
    cpuGHz.value = props.advancedSlowdown.cpuGHz;
    speed.value = props.advancedSlowdown.speed;
    gateOverhead.value = props.advancedSlowdown.gateOverhead;
    algorithmConstant.value = props.advancedSlowdown.algorithmConstant;
}

const emit = defineEmits(['updateSlowdown'])

</script>
