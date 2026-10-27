import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { PRESETS, PRESET_NAMES } from './hardwarePresets'
import { sameHardwareFields } from './urlState'
import { hardwareTechnology, nameWithoutTechnology } from './technology'

// The user's own hardware is kept in this browser.
const STORAGE_KEY = 'qea-calculator:custom-hardware'

function loadSaved() {
    try {
        const list = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
        return Array.isArray(list)
            ? list.filter(h => h && typeof h.hardwareName === 'string' && h.roadmap && !PRESET_NAMES.has(h.hardwareName))
            : []
    } catch {
        return []
    }
}

function save(list) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {
        // Private windows and blocked storage: the hardware lasts for this visit.
    }
}

function copy(value) {
    return JSON.parse(JSON.stringify(value))
}

export const useHardwaresStore = defineStore('hardwares', () => {
    const presets = ref(PRESETS)
    // Hardware the user made: edited copies of presets ("IBM 2025 (edited)")
    // and imported roadmaps. Share links carry the ones they use.
    const custom = ref(loadSaved())
    watch(custom, save, { deep: true })

    const all = computed(() => [...presets.value, ...custom.value])

    function find(name) {
        return all.value.find(h => h.hardwareName === name) || null
    }

    function isCustom(hardware) {
        const name = typeof hardware === 'string' ? hardware : hardware?.hardwareName
        return custom.value.some(h => h.hardwareName === name)
    }

    function uniqueName(name) {
        const existing = new Set(all.value.map(h => h.hardwareName))
        if (!existing.has(name)) return name
        let i = 2
        while (existing.has(`${name} (${i})`)) i++
        return `${name} (${i})`
    }

    // Returns the stored (reactive) copy.
    function addCustom(hardware) {
        custom.value.push({ ...copy(hardware), hardwareName: uniqueName(hardware.hardwareName) })
        return custom.value[custom.value.length - 1]
    }

    function addImported(hardware) {
        return addCustom(hardware)
    }

    // A copy of a preset with the settings in fields, named after it:
    // "IBM 2025 (Superconducting)" -> "IBM 2025 (edited)", "IBM 2025 (edited 2)".
    function addEdited(base, fields) {
        const stem = nameWithoutTechnology(base.hardwareName)
        const taken = new Set(all.value.map(h => h.hardwareName))
        let name = `${stem} (edited)`
        for (let i = 2; taken.has(name); i++) name = `${stem} (edited ${i})`
        return addCustom({
            ...copy(base),
            ...copy(fields),
            hardwareName: name,
            technology: hardwareTechnology(base),
            basedOn: base.hardwareName,
            provenance: 'user-entered',
        })
    }

    function updateCustom(name, fields) {
        const hardware = custom.value.find(h => h.hardwareName === name)
        if (hardware) Object.assign(hardware, copy(fields))
        return hardware || null
    }

    // Returns an error message, or null when renamed.
    function renameCustom(name, newName) {
        const hardware = custom.value.find(h => h.hardwareName === name)
        const trimmed = String(newName ?? '').trim()
        if (!hardware) return 'This hardware can no longer be found.'
        if (!trimmed) return 'Enter a name.'
        if (trimmed !== name && find(trimmed)) return `"${trimmed}" is already taken.`
        hardware.hardwareName = trimmed
        return null
    }

    function removeCustom(name) {
        custom.value = custom.value.filter(h => h.hardwareName !== name)
    }

    // Hardware described in a share link: the saved one with that name when its
    // settings match, otherwise a new copy (renamed if the name is taken).
    function adoptShared(hardware) {
        const existing = find(hardware.hardwareName)
        if (existing && sameHardwareFields(existing, hardware)) return existing
        return addCustom(hardware)
    }

    return {
        presets, custom, all,
        find, isCustom, addCustom, addImported, addEdited, updateCustom, renameCustom, removeCustom, adoptShared,
    }
})
