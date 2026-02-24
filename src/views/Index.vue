<script setup>
// import Models from '../components/Models.vue';
import { e } from 'mathjs';
import { useModelsStore } from '../store/models';
import { defineAsyncComponent, onMounted, ref } from 'vue';


// import async models from '../store/models';
const Models = defineAsyncComponent(() => import('../components/Models.vue'));
const Documentation = defineAsyncComponent(() => import('../components/Documentation.vue'));
const Team = defineAsyncComponent(() => import('../components/Team.vue'));

const models = useModelsStore();
const currentView = ref('index');
const views = {
    index: 'index',
    documentation: 'documentation',
    team: 'team'
}

const components = {
    index: Models,
    documentation: Documentation,
    team: Team
}



// watch hash change
onMounted(() => {
    const hash = window.location.hash;
    if (Object.keys(views).includes(hash.slice(1))) {
        currentView.value = hash.slice(1);
    } else {
        currentView.value = views.index;
    }
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (Object.keys(views).includes(hash.slice(1))) {
            currentView.value = hash.slice(1);
        } else {
            currentView.value = views.index;
        }
    });
});


</script>

<template>
    <div class="flex flex-col h-screen w-full">
        <div class="sticky top-0 z-[99999] bg-white shadow-[0_2px_5px_0_rgba(0,0,0,0.2)] py-0 px-8" style="height:60px;">
            <div class="h-full mx-auto flex flex-wrap justify-between gap-4 items-center">
                <a href="#" class="flex gap-2 items-center">
                    <img src="/FutureTech logo.png" class="h-8" alt="FutureTech">
                    <h1 class="text-[#1f2937] text-xl font-medium font-[Ubuntu,Helvetica,sans-serif] hidden sm:block">Quantum Economic Advantage Calculator</h1>
                </a>
                <div class="space-x-6 font-[Open_Sans,sans-serif]">
                    <a href="#" class="text-[#1f2937] text-sm font-semibold hover:text-[#a32035] transition-colors duration-200">Calculator</a>
                    <a href="#documentation" class="text-[#1f2937] text-sm font-semibold hover:text-[#a32035] transition-colors duration-200">How does it work?</a>
                    <a href="#team" class="text-[#1f2937] text-sm font-semibold hover:text-[#a32035] transition-colors duration-200">Team</a>
                </div>
            </div>
        </div>
        <div class="flex-1" v-if="currentView === views.index">
            <p class="max-w-7xl mx-auto px-2 text-gray=900 text-lg text-justify my-4"> The Quantum Economic Advantage
                Calculator is designed to allow users to explore different
                combinations of algorithmic problems and quantum hardware. Users can freely deviate from known
                projections
                and default parameters to derive their own insights as to the general timeline of when certain scenarios
                may
                become economically advantageous to run on a quantum machine. </p>
            <div class="flex flex-col flex-1">

                <div v-for="(model, modelIndex) in models.models" :key="model.id">
                    <Models :model="model" />
                </div>
                <div class="mx-auto">
                    <button @click="models.addModel" class="bg-[#a32035] text-white rounded-lg p-2 m-4 hover:bg-[#8a1a2c] transition-colors duration-200">Add
                        Model</button>
                </div>
            </div>
        </div>
        <div class="flex-1" v-else>
            <component :is="components[currentView]" />
        </div>
        <div class="bg-[#f3f4f6] py-4 px-8 mt-16">
            <div class="mx-auto flex flex-col gap-4 items-center">
                <hr class="w-full border-[#d1d1d17d]">

                <div class="flex gap-8 items-center justify-center">
                    <a class="max-w-[350px] w-full" href="https://futuretech.mit.edu" target="_blank"><img src="/FutureTech logo.png" alt="MIT FutureTech"></a>
                    <a class="max-w-[200px] w-full" href="https://www.accenture.com" target="_blank"><img src="/Accenture_logo.svg" alt="Accenture"></a>
                </div>
                <hr class="w-full border-[#d1d1d17d]">
                <div class="text-[#6b7280] text-sm py-3 text-center">
                    <p>© {{ new Date().getFullYear() }} Quantum Economic Advantage Calculator</p>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.vertical-container {
    display: flex;
    flex-direction: column;
}

.horizontal-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
}
</style>