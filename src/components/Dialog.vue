<template>
    <div class="">
        <!-- <button type="button" @click="openModal"
            class="rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
            {{ buttonLabel }}
        </button> -->
        <slot name="button" :openModal="openModal" />
    </div>
    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="closeModal" class="relative z-10">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/25" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel
                            class="w-full  transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                            :class="classes">

                
                            <DialogTitle as="h3" class="flex  gap-2 items-center text-lg font-medium leading-6 text-gray-900">
                                {{ title }} <slot name="reference"/>
                            </DialogTitle>
                            <div class="mt-2">
                                <slot name="content" />
                            </div>

                            <div class="mt-4 flex justify-between">
                                <button type="button"
                                    class="inline-flex justify-center rounded-md border border-transparent bg-red-50 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    @click="emit('cancel')">
                                    Cancel
                                </button>
                                <div class="space-x-8">

                                    <button type="button"
                                        class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-[#002D9D] hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        @click="emit('reset')">
                                        Reset
                                    </button>
                                    <button type="button"
                                        class="inline-flex justify-center rounded-md border border-transparent bg-[#002D9D] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        @click="emit('save')">
                                        Save
                                    </button>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
  
<script setup>
import { ref, watch } from 'vue'
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
} from '@headlessui/vue'


const props = defineProps({
    buttonLabel: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    classes: {
        type: String,
        default: '',
    },
})




const isOpen = ref(false)


function closeModal() {
    isOpen.value = false
}
function openModal() {
    isOpen.value = true
}
defineExpose({
    closeModal,
    openModal
})


const emit = defineEmits(['save', 'reset', 'cancel', 'openModal'])
watch(isOpen, (isOpen) => {
    if (isOpen) {
        emit('openModal', isOpen)
    }
})
</script>
  