<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import Panel from 'primevue/panel'
import AdminDashboardCard from '@/components/AdminDashboardCard.vue';
import Card from 'primevue/card';

const router = useRouter();

let dashboard = ref(await getDashboardDetails())

async function getDashboardDetails() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/dean/dashboard`, {
            credentials: 'include',
        });
        const data = await response.json();
        return data
    } catch (error) {
        router.push('/')
        console.log(error)
    }
}

</script>

<template>
    <main class="w-full h-full overflow-y-scroll grid">
        <section class="p-5 cursor-context-menu">
            <Panel>
                <template #header>
                    <div class="md:flex md:flex-row md:items-center md:gap-2">
                        <img v-if="dashboard.dean.imageURL" :src="dashboard.dean.imageURL" alt="user-img"
                            class="aspect-square w-28 rounded-full object-cover">

                        <img v-else src="../../assets/images/user.jpg" alt="user-img"
                            class="aspect-square w-28 rounded-full object-cover">
                        <div>
                            <p class="font-semibold text-2xl">{{ dashboard.dean.title ?? '' }} {{ dashboard.dean.name ??
                                'dean' }}</p>
                            <p class="text-lg">{{ dashboard.dean.staffId ?? '' }}</p>
                            <p class="uppercase font-medium text-[--red-500]">
                                Dean, <span class="font-semibold">SICT</span>
                            </p>
                        </div>
                    </div>
                </template>
            </Panel>
        </section>

        <section class="p-5 cursor-context-menu">
            <Card>

                <template #title>Overview</template>

                <template #content>
                    <section class="grid md:grid-cols-2 gap-4">

                        <AdminDashboardCard header="pending results" icon="school"
                            :content="dashboard.pendingResults" />

                        <AdminDashboardCard header="general info" icon="info" not-admin
                            :current-session="dashboard.currentSession ?? 'Session'"
                            :current-semester="dashboard.currentSemester ?? 'Semester'" bg-color="bg-[--yellow-200]" />
                    </section>
                </template>
            </Card>
        </section>
    </main>
</template>