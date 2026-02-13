<template>
    <div class="group  flex items-center relative">
        <button type="button" @click="openModal" class=" text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <!-- display tooltip on hover icon  -->
            <span
                class=" transform translate-y-[-1200px] group-hover:translate-y-0 transition-opacity duration-300 delay-500 opacity-0 group-hover:opacity-100 absolute top-6 -left-full z-50 bg-gray-700 rounded-lg text-white p-1">References</span>
        </button>
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


                            <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                                {{ title }}
                            </DialogTitle>
                            <div class="mt-2">
                                <slot name="content" />
                            </div>

                            <div class="mt-4 flex justify-between">
                                <button type="button"
                                    class="inline-flex justify-center rounded-md border border-transparent bg-red-50 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    @click="closeModal">
                                    Close
                                </button>

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