import { defineStore } from 'pinia'
import { ref } from 'vue'



export const useDialogInputStore = defineStore('dialogInput', () => {
  
    const hardwareSlowdownAdvancedOptions = ref({
      speed: 10000,
      gateOverhead: 100,
      algorithmConstant: 1,
      gateTime: 100,
      cpuGHz: 5,
    })

  return {  hardwareSlowdownAdvancedOptions }
})