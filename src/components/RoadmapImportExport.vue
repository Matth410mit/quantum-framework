<script setup>
import { ref } from 'vue';
import { importRoadmaps, exportRoadmaps } from '../store/roadmapSchema.js';

// Emits an event to the parent component when valid roadmaps are imported
const emit = defineEmits(['import-success']);
const props = defineProps({
  currentRoadmaps: {
    type: Array,
    default: () => []
  }
});

const fileInput = ref(null);
const importErrors = ref([]);

function triggerFileUpload() {
  fileInput.value.click();
}

function handleExport() {
  if (!props.currentRoadmaps.length) {
    alert("No roadmaps to export.");
    return;
  }
  const jsonString = exportRoadmaps(props.currentRoadmaps);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `quantum_roadmaps_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const { valid, roadmaps, errors } = importRoadmaps(e.target.result);
    if (valid) {
      importErrors.value = [];
      emit('import-success', roadmaps);
      alert('Successfully imported roadmaps!');
    } else {
      importErrors.value = errors;
    }
    // Reset input so the same file can be selected again if needed
    event.target.value = '';
  };
  reader.readAsText(file);
}
</script>

<template>
  <div>
    <div class="flex gap-2">
      <button @click="handleExport" class="px-3 py-1.5 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
        Export (JSON)
      </button>
      <button @click="triggerFileUpload" class="px-3 py-1.5 bg-blue-900 text-white text-xs rounded hover:bg-blue-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
        Import
      </button>
      <input type="file" ref="fileInput" @change="handleImport" accept=".json" class="hidden" />
    </div>

    <div v-if="importErrors.length" class="mt-2 p-2 bg-red-50 text-red-700 rounded-md text-xs">
      <p class="font-bold mb-1">Import Errors:</p>
      <ul class="list-disc pl-4">
        <li v-for="(err, idx) in importErrors" :key="idx">{{ err }}</li>
      </ul>
    </div>
  </div>
</template>