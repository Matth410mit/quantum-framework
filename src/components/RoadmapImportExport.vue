<script setup>
import { ref } from 'vue';
import { importRoadmaps, exportRoadmaps, exportRoadmapsCSV, SCHEMA_VERSION } from '../store/roadmapSchema.js';

// Sends { roadmaps, settings } to the parent when a valid file is imported.
// settings[i] holds the calculator settings from an older file, or null.
const emit = defineEmits(['import-success']);
const props = defineProps({
  currentRoadmaps: {
    type: Array,
    default: () => []
  }
});

const fileInput = ref(null);
const importErrors = ref([]);
const importNotes = ref([]);

function triggerFileUpload() {
  fileInput.value.click();
}

function download(contents, type, extension) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `quantum_roadmaps_${new Date().toISOString().split('T')[0]}.${extension}`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleExport(format) {
  if (!props.currentRoadmaps.length) {
    alert("No roadmaps to export.");
    return;
  }
  if (format === 'csv') {
    download(exportRoadmapsCSV(props.currentRoadmaps), 'text/csv', 'csv');
  } else {
    download(exportRoadmaps(props.currentRoadmaps), 'application/json', 'json');
  }
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const { valid, roadmaps, settings, errors, warnings } = importRoadmaps(e.target.result, file.name);
    if (valid) {
      importErrors.value = [];
      const notes = [];
      emit('import-success', { roadmaps, settings, notes });
      importNotes.value = [
        `Imported ${roadmaps.length} roadmap${roadmaps.length === 1 ? '' : 's'}.`,
        ...warnings,
        ...notes,
      ];
    } else {
      importNotes.value = [];
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
      <button @click="handleExport('json')" class="px-3 py-1.5 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
        Export (JSON)
      </button>
      <button @click="handleExport('csv')" class="px-3 py-1.5 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
        Export (CSV)
      </button>
      <button @click="triggerFileUpload" class="px-3 py-1.5 bg-blue-900 text-white text-xs rounded hover:bg-blue-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
        Import
      </button>
      <input type="file" ref="fileInput" @change="handleImport" accept=".json,.csv" class="hidden" />
    </div>
    <p class="mt-1 text-[10px] text-gray-500">
      Roadmap format {{ SCHEMA_VERSION }}. Older files are converted automatically.
    </p>

    <div v-if="importErrors.length" class="mt-2 p-2 bg-red-50 text-red-700 rounded-md text-xs">
      <p class="font-bold mb-1">Import Errors:</p>
      <ul class="list-disc pl-4">
        <li v-for="(err, idx) in importErrors" :key="idx">{{ err }}</li>
      </ul>
    </div>

    <div v-if="importNotes.length" class="mt-2 p-2 bg-blue-50 text-blue-900 rounded-md text-xs">
      <ul class="list-disc pl-4">
        <li v-for="(note, idx) in importNotes" :key="idx">{{ note }}</li>
      </ul>
    </div>
  </div>
</template>
