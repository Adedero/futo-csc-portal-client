<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import Panel from 'primevue/panel'
import AdminDashboardCard from '@/components/AdminDashboardCard.vue';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Divider from 'primevue/divider';
import Button from 'primevue/button'
import Sidebar from 'primevue/sidebar';


import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const router = useRouter();

let dashboard = ref(await getDashboardDetails())

let sidebarVisible = ref(false)

async function getDashboardDetails() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/staff/dashboard`, {
            credentials: 'include',
        });
        const data = await response.json();
        //console.log(data)
        return data
    } catch (error) {
        toast.add({ severity: 'warn', summary: 'Error', detail: 'Something went wrong. Please try logging in again.', life: 5000 })
        router.push('/')
        console.log(error)
    }
}

let courseToShow = ref({})

function showCourseDetails(course) {
    courseToShow.value = course
    sidebarVisible.value = true
}

function goToResults(course) {
    router.push({
        name: 'staff-add-result',
        params: {
            staffId: dashboard.value.staff._id,
            session: dashboard.value.currentSession.name,
            semester: dashboard.value.currentSemester.name,
            level: course.level,
            course: course.code.split(' ').join('-')
        }
    })
}

</script>

<template>
    <Toast class="w-[70dvw] md:w-72" />
    <main class="w-full h-full overflow-y-scroll md:flex">
        <section
            class="h-full p-5 cursor-context-menu w-full md:max-w-96 lg:max-w-[25rem] overflow-y-scroll flex flex-col justify-between gap-5 ">
            <div>
                <Panel>
                    <template #header>
                        <div>
                            <img v-if="dashboard.staff.imageURL" :src="dashboard.staff.imageURL" alt="user-img"
                                class="aspect-square w-20 rounded-full object-cover">

                            <img v-else src="../../assets/images/user.jpg" alt="user-img"
                                class="aspect-square w-20 rounded-full object-cover">
                            <div>
                                <p class="font-semibold text-2xl">{{ dashboard.staff?.name ?? 'staff' }}</p>
                                <p class="font-medium text-[--primary-700]">{{ dashboard.staff?.staffId ?? '' }}</p>
                                <p class="text-sm">STAFF</p>
                            </div>
                        </div>
                    </template>
                </Panel>
            </div>

            <div class="mt-3 lg:mt-0">
                <Card class="h-full">
                    <template #title>Overview</template>
                    <template #content>
                        <section class="grid gap-4">
                            <AdminDashboardCard header="results uploaded" icon="book_2" :content="dashboard.results" />

                            <AdminDashboardCard header="general info" icon="info" not-admin
                                :current-session="dashboard.currentSession?.name ?? 'Session'"
                                :current-semester="dashboard.currentSemester?.name ?? 'Semester'"
                                bg-color="bg-[--yellow-200]" />
                        </section>
                    </template>
                </Card>
            </div>
        </section>

        <section class="h-full w-dvw p-5 cursor-context-menu md:w-full md:flex-grow overflow-hidden">
            <Card class="h-full">
                <template #title>
                    <h1>Your Courses: <span class="text-lg text-[--primary-color]">{{ dashboard.staff.courses.length ??
                        0
                            }}</span></h1>
                </template>
                <template #content>

                    <div style="height: calc(100dvh - 12.5rem)" class="overflow-y-scroll">
                        <div class="list">
                            <Card v-for="course in dashboard.staff.courses" :key="course._id" class="border w-full">
                                <template #title>
                                    <div class="flex items-center gap-1 w-full">
                                        <Avatar :label="course.code[0]" size="large" class="shrink-0"
                                            style="background-color: #dee9fc; color: #1a2551" shape="circle" />
                                        <h1 title="course-title"
                                            class="text-[--highlight-text-color] text-lg w-full whitespace-nowrap text-ellipsis overflow-hidden">
                                            {{ course.title }}</h1>
                                    </div>
                                </template>
                                <template #subtitle>
                                    <div class="flex items-center flex-wrap">
                                        <p>{{ course.code }}</p>
                                        <Divider layout="vertical" />
                                        <p>{{ course.unit }} Units</p>
                                        <Divider layout="vertical" />
                                        <p>{{ course.isElective ? 'ELECTIVE' : 'COMPULSORY' }}</p>
                                    </div>
                                </template>
                                <template #content>
                                    <div class="flex flex-wrap items-center gap-3">
                                        <Button label="Add result" @click="goToResults(course)"
                                            class="text-sm md:text-base" />
                                        <Button @click="showCourseDetails(course)" severity="secondary"
                                            label="View details" class="text-sm md:text-base" />
                                    </div>
                                </template>
                            </Card>
                        </div>
                    </div>

                </template>
            </Card>


            <Sidebar v-model:visible="sidebarVisible" position="right" header="Course Details"
                class="w-dvw md:w-[22rem] lg:w-[24rem]">
                <div class="h-full">
                    <h1 title="course-title" class="text-[--highlight-text-color] font-bold text-lg">{{
                        courseToShow.title
                    }}</h1>

                    <div class="flex items-center flex-wrap text-sm mt-2">
                        <p class="p-1 font-medium text-[--highlight-text-color] bg-[--highlight-bg]">{{
                            courseToShow.code }}
                        </p>
                        <Divider layout="vertical" />
                        <p class="p-1 font-medium text-[--highlight-text-color] bg-[--highlight-bg]">{{
                            courseToShow.unit }}
                            Units</p>
                        <Divider layout="vertical" />
                        <p class="p-1 font-medium text-[--highlight-text-color] bg-[--highlight-bg]">{{
                            courseToShow.isElective ? 'ELECTIVE' : 'COMPULSORY' }}</p>
                    </div>

                    <p class="mt-6 font-bold text-sm">Marks Distribution</p>

                    <div :class="[
                        'mt-2 h-11 rounded-r-full overflow-hidden grid',
                        courseToShow.hasPractical ? 'grid-cols-5' : 'grid-cols-10'
                    ]">
                        <div :class="[
                            'bg-[--yellow-200] grid place-content-center text-sm font-bold',
                            courseToShow.hasPractical ? 'col-span-1' : 'col-span-3'
                        ]">
                            {{ courseToShow.hasPractical ? '20%' : '30%' }}
                        </div>
                        <div v-if="courseToShow.hasPractical"
                            class="bg-[--orange-200] grid place-content-center text-sm font-bold col-span-1">
                            20%
                        </div>
                        <div :class="[
                            'bg-[--primary-200] grid place-content-center text-sm font-bold',
                            courseToShow.hasPractical ? 'col-span-3' : 'col-span-7'
                        ]">
                            {{ courseToShow.hasPractical ? '60%' : '70%' }}
                        </div>
                    </div>

                    <div class="mt-3 flex items-center gap-3">
                        <div class="flex items-center gap-1">
                            <div class="aspect-square w-3 rounded-full shrink-0 bg-[--yellow-200]"></div>
                            <p class="text-xs font-bold">test</p>
                        </div>

                        <div v-if="courseToShow.hasPractical" class="flex items-center gap-1">
                            <div class="aspect-square w-3 rounded-full shrink-0 bg-[--orange-200]"></div>
                            <p class="text-xs font-bold">practical</p>
                        </div>

                        <div class="flex items-center gap-1">
                            <div class="aspect-square w-3 rounded-full shrink-0 bg-[--primary-200]"></div>
                            <p class="text-xs font-bold">exam</p>
                        </div>
                    </div>

                    <p class="mt-6 font-bold text-sm">Course Description</p>

                    <div
                        class="mt-3 border-2 border-[--surface-200] text-sm rounded-md h-[55%] py-2 px-4 overflow-y-scroll">
                        {{ courseToShow.description }}
                    </div>
                </div>
            </Sidebar>
        </section>
    </main>
</template>

<style scoped>
.list {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr))
}

@media screen and (min-width: 768px) {
    .list {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
    }
}
</style>