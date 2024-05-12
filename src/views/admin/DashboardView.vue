<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import Panel from 'primevue/panel'
import AdminDashboardCard from '@/components/AdminDashboardCard.vue';
import Card from 'primevue/card';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const router = useRouter();

let dashboard = ref(await getDashboardDetails())

async function getDashboardDetails() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/admin/dashboard`, {
            credentials: 'include',
        });
        const data = await response.json();
        return data
    } catch (error) {
        toast.add({ severity: 'warn', summary: 'Error', detail: 'Something went wrong. Please try logging in again.', life: 5000 })
        router.push('/')
        console.log(error)
    }
}


//onMounted(() => getDashboardDetails())

</script>

<template>
    <main class="w-full h-full overflow-y-scroll">
        <Toast class="w-[70dvw] md:w-72" />
        <section class="p-5 cursor-context-menu">
            <Panel toggleable>
                <template #header>
                    <div class="md:flex md:flex-row md:items-center md:gap-2">
                        <img src="../../assets/images/user.jpg" alt="user-img"
                            class="aspect-square w-16 rounded-full object-cover">
                        <div>
                            <p class="font-semibold text-2xl">{{ dashboard?.admin?.name ?? 'Admin' }}</p>
                            <p class="uppercase text-xs font-medium text-[--red-500]">ADMINISTRATOR</p>
                        </div>
                    </div>
                </template>

                <div>
                    <h3 class="font-medium text-[--primary-700] pb-2">School Details</h3>

                    <div class="text-sm flex flex-wrap gap-x-5 gap-y-3">
                        <div class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] p-3 rounded-full">
                            <p>Current Session:</p>
                            <p class="font-bold">{{ dashboard.currentSession }}</p>
                        </div>
                        <div class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] p-3 rounded-full">
                            <p>Current Semester:</p>
                            <p class="font-bold">{{ dashboard.currentSemester }}</p>
                        </div>
                        <div class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] p-3 rounded-full">
                            <p>Course registration:</p>
                            <p class="font-bold">{{ dashboard.courseRegStatus ? 'Open' : 'Closed' }}</p>
                        </div>
                    </div>
                </div>
            </Panel>
        </section>

        <section class="p-5 cursor-context-menu">
            <Card>
                <template #title>Overview</template>
                <template #content>
                    <section class="grid md:grid-cols-3 grid-rows-2 gap-4">
                        <AdminDashboardCard header="classes" icon="school" :content="dashboard.classes" />
                        <AdminDashboardCard header="students" icon="groups" :content="dashboard.students"
                            bg-color="bg-[--blue-200]" />
                        <AdminDashboardCard header="staff" icon="work" :content="dashboard.staffs"
                            bg-color="bg-[--red-200]" />
                        <AdminDashboardCard header="advisors" icon="group" :content="dashboard.advisors"
                            bg-color="bg-[--purple-200]" />
                        <AdminDashboardCard header="h.o.d" icon="shield_person"
                            :contentText="`${dashboard?.hod?.split(' ')[0] ?? ''} ${dashboard?.hod?.split(' ')[1][0] ?? ''}.`"
                            bg-color="bg-[--teal-200]" />
                        <AdminDashboardCard header="courses" icon="book_2" :content="dashboard.courses"
                            bg-color="bg-[--yellow-200]" />
                    </section>
                </template>
            </Card>

        </section>
    </main>
</template>