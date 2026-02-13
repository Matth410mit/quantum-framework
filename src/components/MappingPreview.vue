<template>
  <p class="text-xs mt-1">
    <!-- valid -->
    <span v-if="result.ok" class="text-green-600">
      Example: {{ sampleQ }} qubits → n ≈ {{ pretty(result.value) }}
    </span>

    <!-- invalid -->
    <span v-else class="text-red-600">
      {{ result.error }}
    </span>
  </p>
</template>

<script setup>
import { computed } from 'vue'
import { evaluateQubitMapping } from '../store/utils'   // 👈 fixed path

const props = defineProps({
  expr: String,
  roadmap: Object
})

// pick largest qubit count in roadmap, like before
const sampleQ = computed(() => {
  if (!props.roadmap) return 1000
  const years = Object.keys(props.roadmap).map(Number).sort()
  return props.roadmap[years[years.length - 1]]
})

const result = computed(() =>
  evaluateQubitMapping(props.expr, sampleQ.value, { clamp: 1e300 })
)

function pretty(n) {
  if (!Number.isFinite(n)) return '—'
  // show compact sci notation for huge values
  return n >= 1e6 ? n.toExponential(2) : Math.round(n * 100) / 100
}
</script>
