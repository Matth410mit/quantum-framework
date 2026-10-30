<template>
  <p class="text-xs mt-1">
    <!-- valid -->
    <span v-if="result.ok" class="text-green-600">
      Example: {{ sampleQ.toLocaleString() }} logical qubits → largest n ≈ {{ pretty(result.value) }}
    </span>

    <!-- invalid -->
    <span v-else class="text-red-600">
      {{ result.error }}
    </span>
  </p>
</template>

<script setup>
import { computed } from 'vue'
import * as math from 'mathjs'
import { problemSizeForQubits } from '../store/utils'

// expr is the number of logical qubits needed, as a function of n.
const props = defineProps({
  expr: String,
  roadmap: Object
})

const sampleQ = 1000

const result = computed(() => {
  const expr = String(props.expr || '').trim()
  if (!expr) return { ok: false, error: 'Enter an expression in n.' }
  try {
    const symbols = math.parse(expr).filter(node => node.isSymbolNode && !(node.name in math) && node.name !== 'n')
    if (symbols.length) return { ok: false, error: `Unknown name "${symbols[0].name}". Use n for the problem size.` }
    math.evaluate(expr, { n: 10 })
  } catch (err) {
    return { ok: false, error: `Couldn't read the expression: ${err.message}` }
  }
  return { ok: true, value: Math.pow(10, problemSizeForQubits(expr, Math.log10(sampleQ))) }
})

function pretty(n) {
  if (!Number.isFinite(n)) return '—'
  // show compact sci notation for huge values
  return n >= 1e6 ? n.toExponential(2) : Math.round(n * 100) / 100
}
</script>
