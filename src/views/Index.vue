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
    <div class="flex flex-col h-screen w-full ">
        <div class=" bg-[#002D9D] py-4 px-8">
            <div class="mx-auto flex flex-wrap justify-between gap-4 items-center">
                <a href="#" class="flex  gap-2 items-center">
                    <img src="/quantum-logo.png" class="h-8" alt="">
                    <h1 class=" text-white text-2xl font-medium">Quantum Economic Advantage Calculator</h1>
                </a>
                <div class="space-x-8">
                    <a href="#" class="text-white hover:underline">Calculator</a>
                    <a href="#documentation" class="text-white hover:underline">How does it work?</a>
                    <a href="#team" class="text-white hover:underline">Team</a>
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
                    <button @click="models.addModel" class="bg-[#002D9D] text-white rounded-lg p-2 m-4">Add
                        Model</button>
                </div>
            </div>
        </div>
        <div class="flex-1" v-else>
            <component :is="components[currentView]" />
        </div>
        <div class=" bg-[#002D9D] py-4 px-8 mt-16">
            <div class="mx-auto flex flex-col gap-4 items-center">
                <!-- <div class="flex  gap-2 items-center">
                    <img src="/quantum-logo.png" class="h-6" alt="">
                    <h1 class=" text-white text-lg font-medium">Quantum Economic Advantage Calculator</h1>
                </div> -->
                <hr class="w-full border-white/30">

                <div class="flex gap-8 items-center justify-center">
                    <a class="max-w-[350px] w-full" href="https://futuretech.mit.edu" target="_blank"><img  src="/futuretech.svg" alt=""></a>
                    <a class="max-w-[350px] w-full" href="https://www.accenture.com" target="_blank"><img  src="/Accenture_logo.svg" alt=""></a>
                    
                </div>
                <hr class="w-full border-white/30">
                <div class="text-white text-sm py-3 text-center">
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