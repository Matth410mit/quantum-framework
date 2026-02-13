<!-- <template>
    <div class="max-w-prose mx-auto my-8 px-4">
        <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center" id="Models">Team</h1>
        
        <p class="text-center mb-8">
            The Quantum Economic Advantage Calculator is a collaboration between MIT FutureTech and Accenture. The team is comprised of:
        </p>
        
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="member in teamMembers" :key="member.name" class="flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md">
                <img v-if="member.image" :src="member.image" alt="Team member photo" class="w-24 h-24 rounded-full mb-4 object-cover object-top shadow-lg">
                <div v-else class="w-24 h-24 rounded-full mb-4 bg-gray-200 shadow-lg"></div>
                <h2 class="text-lg font-semibold text-gray-800">{{ member.name }}</h2>
                <p class="text-sm text-gray-600">{{ member.affiliation }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
const teamMembers = [
    {
        name: 'Neil Thompson',
        image: '/650353e37ba6cf9c37b2db67_neil-thompson.jpg',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Jayson Lynch',
        image: '/650353e88fadc59390b6639b_jayson-lynch-p-500.jpg',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Frederick Mejia',
        image: '/654bb5d93f6840c86a2fea17_headshot - Fred Mejia-p-500.png',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Andrew Souza',
        image: '/650353ea2e6029b3cea2ee24_andrew-lucas-p-500.jpg',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Hans Gundlach',
        image: '/660c392f18a635bb348acc70_profilemay2023 - Hans Gundlach-p-500.png',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Hrvoje Kukina',
        image: '/6616978ed50987169fb845b7_hrvoje_picture - Hrvoje Kukina-p-500.jpg',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Eleanor Crane',
        image: "/eleanor_crane.jpeg",
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Johannes Galatsanos-Dueck',
        image: '',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Albert Scerbo',
        image: '',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Carl Dukatz',
        image: '',
        affiliation: 'Accenture',
    },
    {
        name: 'Prashant Shukla',
        image: '',
        affiliation: 'Accenture',
    },
    {
        name: 'KC Hsu',
        image: '',
        affiliation: 'Accenture',
    },
    {
        name: 'Victoria Hazoglou',
        image: '',
        affiliation: 'Accenture',
    }

];
</script> -->

<!-- ////////////////////////// -->

<!-- <template>
    <div class="max-w-5xl mx-auto my-8 px-4">
        <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center" id="Models">Team</h1>

        <p class="text-center mb-8">
            The Quantum Economic Advantage Calculator is a joint effort between MIT FutureTech and Accenture.
        </p>

        <div class="grid gap-8 sm:grid-cols-3">
        Left: MIT FutureTech (Double Column)
        <div class="sm:col-span-2">
            <h2 class="text-xl font-semibold text-gray-700 mb-4 text-center">MIT FutureTech</h2>
            <div class="grid gap-4 sm:grid-cols-2">
                <div v-for="member in mitMembers" :key="member.name" class="flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md">
                    <img v-if="member.image" :src="member.image" alt="Team member photo" class="w-24 h-24 rounded-full mb-4 object-cover object-top shadow-lg">
                    <div v-else class="w-24 h-24 rounded-full mb-4 bg-gray-200 shadow-lg"></div>
                    <h2 class="text-lg font-semibold text-gray-800">{{ member.name }}</h2>
                </div>
            </div>
        </div>

        Right: Accenture (Single Column)
        <div class="border-l border-gray-300 pl-6">
            <h2 class="text-xl font-semibold text-gray-700 mb-4 text-center">Accenture</h2>
            <div class="flex flex-col gap-4">
                <div v-for="member in accentureMembers" :key="member.name" class="flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md">
                    <img v-if="member.image" :src="member.image" alt="Team member photo" class="w-24 h-24 rounded-full mb-4 object-cover object-top shadow-lg">
                    <div v-else class="w-24 h-24 rounded-full mb-4 bg-gray-200 shadow-lg"></div>
                    <h2 class="text-lg font-semibold text-gray-800">{{ member.name }}</h2>
                </div>
            </div>
        </div>
    </div>

    </div>
</template>

<script setup>
import { computed } from "vue";

const teamMembers = [
    { name: 'Neil Thompson', image: '/650353e37ba6cf9c37b2db67_neil-thompson.jpg', affiliation: 'MIT FutureTech' },
    { name: 'Jayson Lynch', image: '/650353e88fadc59390b6639b_jayson-lynch-p-500.jpg', affiliation: 'MIT FutureTech' },
    { name: 'Frederick Mejia', image: '/654bb5d93f6840c86a2fea17_headshot - Fred Mejia-p-500.png', affiliation: 'MIT FutureTech' },
    { name: 'Andrew Souza', image: '/650353ea2e6029b3cea2ee24_andrew-lucas-p-500.jpg', affiliation: 'MIT FutureTech' },
    { name: 'Hans Gundlach', image: '/660c392f18a635bb348acc70_profilemay2023 - Hans Gundlach-p-500.png', affiliation: 'MIT FutureTech' },
    { name: 'Hrvoje Kukina', image: '/6616978ed50987169fb845b7_hrvoje_picture - Hrvoje Kukina-p-500.jpg', affiliation: 'MIT FutureTech' },
    { name: 'Eleanor Crane', image: "/eleanor_crane.jpeg", affiliation: 'MIT FutureTech' },
    { name: 'Johannes Galatsanos-Dueck', image: '', affiliation: 'MIT FutureTech' },
    { name: 'Albert Scerbo', image: '', affiliation: 'MIT FutureTech' },
    { name: 'Carl Dukatz', image: '', affiliation: 'Accenture' },
    { name: 'Prashant Shukla', image: '', affiliation: 'Accenture' },
    { name: 'KC Hsu', image: '', affiliation: 'Accenture' },
    { name: 'Victoria Hazoglou', image: '', affiliation: 'Accenture' }
];

const mitMembers = computed(() => teamMembers.filter(member => member.affiliation === "MIT FutureTech"));
const accentureMembers = computed(() => teamMembers.filter(member => member.affiliation === "Accenture"));
</script> -->

<!-- ////////// -->
<template>
    <div class="max-w-5xl mx-auto my-8 px-4">
        <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center" id="Models">Team</h1>

        <p class="text-center mb-8">
            The Quantum Economic Advantage Calculator is a joint effort between MIT FutureTech and Accenture.
        </p>

        <div class="grid gap-8 sm:grid-cols-3">
            <!-- Left: MIT FutureTech (Double Column) -->
            <div class="sm:col-span-2">
                <h2 class="text-xl font-semibold text-gray-700 mb-4 text-center">MIT FutureTech</h2>
                <div class="grid gap-4 sm:grid-cols-2">
                    <div v-for="member in mitMembers" :key="member.name" class="flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md">
                        <img v-if="member.image" :src="member.image" alt="Team member photo" class="w-24 h-24 rounded-full mb-4 object-cover object-top shadow-lg">
                        <div v-else class="w-24 h-24 rounded-full mb-4 bg-gray-200 shadow-lg"></div>
                        <h2 class="text-lg font-semibold text-gray-800">{{ member.name }}</h2>
                        <p class="text-sm text-gray-600">{{ member.role }}</p>
                    </div>
                </div>
            </div>

            <!-- Right: Accenture (Single Column) -->
            <div class="border-l border-gray-300 pl-6">
                <h2 class="text-xl font-semibold text-gray-700 mb-4 text-center">Accenture</h2>
                <div class="flex flex-col gap-4">
                    <div v-for="member in accentureMembers" :key="member.name" class="flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md">
                        <img v-if="member.image" :src="member.image" alt="Team member photo" class="w-24 h-24 rounded-full mb-4 object-cover object-top shadow-lg">
                        <div v-else class="w-24 h-24 rounded-full mb-4 bg-gray-200 shadow-lg"></div>
                        <h2 class="text-lg font-semibold text-gray-800">{{ member.name }}</h2>
                        <p class="text-sm text-gray-600">{{ member.role }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-12 text-center text-gray-700 text-sm">
            <p>
                If you have any questions or concerns, feel free to contact  
                <a href="mailto:someone@example.com" class="text-blue-600 hover:underline">someone@example.com</a>.
            </p>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const teamMembers = [
    { name: 'Neil Thompson', image: '/650353e37ba6cf9c37b2db67_neil-thompson.jpg', affiliation: 'MIT FutureTech', role: 'Director of FutureTech' },
    { name: 'Jayson Lynch', image: '/650353e88fadc59390b6639b_jayson-lynch-p-500.jpg', affiliation: 'MIT FutureTech', role: 'Head of Algorithms' },
    { name: 'Frederick Mejia', image: '/654bb5d93f6840c86a2fea17_headshot - Fred Mejia-p-500.png', affiliation: 'MIT FutureTech', role: 'MEng Student, Developer' },
    { name: 'Hans Gundlach', image: '/660c392f18a635bb348acc70_profilemay2023 - Hans Gundlach-p-500.png', affiliation: 'MIT FutureTech', role: 'Researcher' },
    { name: 'Hrvoje Kukina', image: '/6616978ed50987169fb845b7_hrvoje_picture - Hrvoje Kukina-p-500.jpg', affiliation: 'MIT FutureTech', role: 'PhD Candidate' },
    { name: 'Eleanor Crane', image: "/eleanor_crane.jpeg", affiliation: 'MIT FutureTech', role: 'Researcher' },
    { name: 'Johannes Galatsanos-Dueck', image: '', affiliation: 'MIT FutureTech', role: 'Title' },
    { name: 'Prashant P. Shukla', image: 'PrashantShukla.jpg', affiliation: 'Accenture', role: 'Accenture Research Lead - MIT IDE' },
    { name: 'Carl Dukatz', image: 'Carl_Dukatz_Profile_Picture 1.jpeg', affiliation: 'Accenture', role: 'Managing Director - Next Gen Compute' },
    { name: 'Kung-Chuan Hsu', image: 'profile_pic_KC.jpg', affiliation: 'Accenture', role: 'Quantum Information Scientist - Next Gen Compute' },
    { name: 'Victoria Hazoglou', image: '', affiliation: 'Accenture', role: 'Title' },
    { name: 'Andrew Souza', image: '/650353ea2e6029b3cea2ee24_andrew-lucas-p-500.jpg', affiliation: 'MIT FutureTech', role: 'Former Developer' },
];

const mitMembers = computed(() => teamMembers.filter(member => member.affiliation === "MIT FutureTech"));
const accentureMembers = computed(() => teamMembers.filter(member => member.affiliation === "Accenture"));
</script>
