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
        <div class="sticky top-0 z-[99999] bg-white shadow-[0_2px_5px_0_rgba(0,0,0,0.2)]" style="height: 60px;">
            <div class="max-w-7xl mx-auto pl-0 pr-2 header-container">
                <a href="https://futuretech.mit.edu" target="_blank" class="brand w-nav-brand" aria-label="home">
                    <img src="/FutureTech logo.png" loading="lazy" alt="FutureTech" class="image">
                </a>
                <nav role="navigation" class="nav-menu w-nav-menu">
                    <a href="#" class="nav-link w-nav-link">Calculator</a>
                    <a href="#documentation" class="nav-link w-nav-link">How does it work?</a>
                    <a href="#team" class="nav-link w-nav-link">Team</a>
                </nav>
            </div>
        </div>
        <div class="flex-1" v-if="currentView === views.index">
            <p class="max-w-7xl mx-auto pl-0 pr-2 text-gray=900 text-lg text-justify my-4"> The Quantum Economic Advantage
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
        <!-- Footer -->
        <footer class="bg-[#f3f4f6] text-[#333] mt-16 pb-10">
            <div class="max-w-[940px] mx-auto px-[10px] pt-10">
                <!-- 3-column grid -->
                <div class="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr] gap-x-[75px] gap-y-[80px]">
                    <!-- Column 1: Logos -->
                    <div class="flex flex-col gap-8">
                        <a href="https://futuretech.mit.edu" target="_blank">
                            <img src="/FutureTech logo.png" alt="MIT FutureTech" class="h-16">
                        </a>
                        <div class="flex items-center gap-8">
                            <img src="/logo-mit-csail.svg" alt="MIT CSAIL" class="h-16">
                            <img src="/logo-mit-sloan.svg" alt="MIT Sloan" class="h-16">
                        </div>
                    </div>
                    <!-- Column 2: Contact info + social icons -->
                    <div class="flex flex-col gap-4">
                        <p class="text-gray-500 text-base leading-relaxed">
                            <strong>MIT FutureTech</strong><br>
                            MIT Computer Science and<br>
                            Artificial Intelligence Laboratory<br>
                            32 Vassar Street, Office 386,<br>
                            Cambridge, MA 02139<br>
                            <a href="tel:+6172585030" class="text-[#a32035] hover:underline">617-258-5030</a>
                        </p>
                        <div class="flex gap-4 mt-2">
                            <a href="https://twitter.com/MITFutureTech" target="_blank" class="text-gray-500 hover:text-[#a32035] transition-colors">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                            <a href="https://www.linkedin.com/company/mitfuturetech/" target="_blank" class="text-gray-500 hover:text-[#a32035] transition-colors">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </a>
                            <a href="https://mitfuturetech.substack.com/" target="_blank" class="text-gray-500 hover:text-[#a32035] transition-colors">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>
                            </a>
                            <a href="https://www.youtube.com/@MITFutureTech" target="_blank" class="text-gray-500 hover:text-[#a32035] transition-colors">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            </a>
                        </div>
                    </div>
                    <!-- Column 3: Copyright + accessibility -->
                    <div class="flex flex-col gap-2">
                        <p class="text-[#a32035] text-sm">© {{ new Date().getFullYear() }} FutureTech.<br>All rights reserved.</p>
                        <a href="https://accessibility.mit.edu" target="_blank" class="text-[#a32035] text-sm hover:underline transition-colors">MIT Accessibility</a>
                    </div>
                </div>
            </div>
        </footer>
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

.header-container {
    display: flex;
    height: 60px;
    align-items: center;
    justify-content: space-between;
}

.brand {
    display: flex;
    align-items: center;
    text-decoration: none;
    margin-left: -12px;
}

.brand .image {
    height: 40px;
    width: auto;
}

.nav-menu {
    display: flex;
    align-items: center;
    gap: 24px;
}

.nav-link {
    font-family: 'Open Sans', sans-serif;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: #1f2937;
    text-decoration: none;
    transition: color 0.2s ease;
}

.nav-link:hover {
    color: #a32035;
}

@media (max-width: 767px) {
    .nav-menu {
        gap: 16px;
    }
    
    .nav-link {
        font-size: 13px;
    }
}
</style>