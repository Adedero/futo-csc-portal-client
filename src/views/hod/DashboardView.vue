<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import Panel from 'primevue/panel'
import AdminDashboardCard from '@/components/AdminDashboardCard.vue';
import Card from 'primevue/card';

const router = useRouter();

let dashboard = ref(await getDashboardDetails())

async function getDashboardDetails() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/hod/dashboard`, {
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
    <main class="w-dvw lg:w-full h-full grid content-start gap-5 md:grid-cols-2 lg:grid-cols-5 p-5 overflow-y-scroll">
        <Card class="md:col-span-2 lg:col-span-5">
            <template #title>Overview</template>
            <template #content>
                <section class="grid gap-3 md:grid-cols-4">
                    <AdminDashboardCard header="staff" icon="work" :content="dashboard.staffs"
                        bg-color="bg-[--blue-200]" />

                    <AdminDashboardCard header="students" icon="group" :content="dashboard.students"
                        bg-color="bg-[--red-200]" />

                    <AdminDashboardCard header="pending results" icon="school" :content="dashboard.pendingResults" />

                    <AdminDashboardCard header="general info" icon="info" not-admin
                        :current-session="dashboard.currentSession ?? 'Session'"
                        :current-semester="dashboard.currentSemester ?? 'Semester'" bg-color="bg-[--yellow-200]" />
                </section>
            </template>
        </Card>

        <Card class="md:col-span-1 lg:col-span-2">
            <template #title>Profile</template>
            <template #content>
                <div class="flex flex-col gap-2 items-center justify-center md:justify-start md:items-start">
                    <img v-if="dashboard.HOD.imageURL" :src="dashboard.HOD.imageURL" alt="user-img"
                        class="aspect-square w-24 md:w-20 lg:w-28 rounded-full object-cover">

                    <img v-else src="../../assets/images/user.jpg" alt="user-img"
                        class="aspect-square w-24 md:w-20 lg:w-28 rounded-full object-cover">
                    <div class="text-center md:text-left grid gap-2">
                        <p class="font-semibold text-2xl">{{ dashboard.HOD.title }} {{ dashboard?.HOD?.name ?? 'HOD' }}
                        </p>
                        <p class="text-lg">{{ dashboard?.HOD?.staffId ?? '' }}</p>
                        <p>DEPARTMENT OF COMPUTER SCIENCE</p>
                        <p class="uppercase font-medium text-[--red-500]">H.O.D</p>
                    </div>
                </div>
            </template>
        </Card>

        <Card class="md:col-span-1 lg:col-span-3">
            <template #title>Advisors <span class="font-semibold text-[--primary-color]">{{ dashboard.advisors.length
                    }}</span></template>
            <template #content>
                <section class="list grid content-start gap-3 overflow-y-scroll">
                    <div v-for="(advisor, index) in dashboard.advisors" :key="index"
                        class="border rounded-md min-h-20 px-3 py-2">
                        <header class="flex items-center gap-2">
                            <img v-if="advisor.imageURL" :src="advisor.imageURL" alt="advisor"
                                class="aspect-square w-8 rounded-full object-cover">

                            <img v-else src="../../assets/images/user.jpg" alt="advisor"
                                class="aspect-square w-8 rounded-full object-cover">
                            <p class="font-semibold text-lg">{{ advisor.name }}</p>
                        </header>
                        <p class="text-sm mt-1">Class: <span class="font-semibold text-[--primary-color]">{{
                            advisor.classId.className }}</span></p>
                    </div>
                </section>
            </template>
        </Card>
    </main>
    <main class="w-full h-full overflow-y-scroll grid">
        <section class="p-5 cursor-context-menu">
            <Panel>
                <template #header>
                    <div class="md:flex md:flex-row md:items-center md:gap-2">
                        <img v-if="dashboard.HOD.imageURL" :src="dashboard.HOD.imageURL" alt="user-img"
                            class="aspect-square w-16 rounded-full object-cover">

                        <img v-else src="../../assets/images/user.jpg" alt="user-img"
                            class="aspect-square w-16 rounded-full object-cover">
                        <div>
                            <p class="font-semibold text-2xl">{{ dashboard?.HOD?.name ?? 'HOD' }}</p>
                            <p class="font-semibold">{{ dashboard?.HOD?.staffId ?? '' }}</p>
                            <p class="uppercase text-xs font-medium text-[--red-500]">H.O.D</p>
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
                        <AdminDashboardCard header="staff" icon="work" :content="dashboard.staffs"
                            bg-color="bg-[--blue-200]" />

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

<style scoped>
.list {
    height: calc(100dvh - 16rem);
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr))
}

@media screen and (min-width: 768px) {
    .list {
        height: calc(100dvh - 28.5rem);
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
    }
}
</style>