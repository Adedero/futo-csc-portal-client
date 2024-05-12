<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { formatGPA } from '@/composables/use-gpa';

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
        const response = await fetch(`${import.meta.env.VITE_API}/advisor/dashboard`, {
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
        name: 'advisor-add-result',
        params: {
            staffId: dashboard.value.advisor._id,
            session: dashboard.value.currentSession.name,
            semester: dashboard.value.currentSemester.name,
            level: course.level,
            course: course.code.split(' ').join('-'),
            scoped: false,
        }
    })
}

function goToStudentProfile(student) {
    router.push({
        name: 'advisor-student-profile',
        params: {
            id: student.studentId,
        }
    })
}

</script>

<template>
    <Toast class="w-[70dvw] md:w-72" />
    <main class="w-dvw lg:w-full h-full p-5 overflow-y-scroll grid gap-5 lg:grid-cols-5">
        <Card class="lg:w-auto lg:h-full cursor-context-menu lg:col-span-5">
            <template #title>Overview</template>
            <template #content>
                <section class="grid gap-3 lg:grid-cols-3">
                    <Panel class="rounded-lg">
                        <template #header>
                            <div class="md:flex flex-wrap md:items-center md:gap-2">
                                <img v-if="dashboard.advisor.imageURL" :src="dashboard.advisor.imageURL" alt="advisor"
                                    class="aspect-square w-12 rounded-full object-cover">
                                <img v-else src="../../assets/images/user.jpg" alt="advisor"
                                    class="aspect-square w-12 rounded-full object-cover">
                                <div>
                                    <p class="font-semibold text-xl">{{ dashboard.advisor?.name ?? 'advisor' }}</p>
                                    <p class="font-medium text-[--primary-700]">{{ dashboard.advisor?.staffId ?? '' }}
                                    </p>
                                </div>
                            </div>
                        </template>
                        <div
                            class="-mt-3 flex text-sm gap-2 bg-[--highlight-bg] text-[--highlight-text-color] py-1 px-3 rounded-full">
                            <p>Status: <span class="font-bold">Advisor</span></p>
                            <p>Class: <span class="font-bold">{{ dashboard.advisor.classId.className }}</span></p>
                        </div>
                    </Panel>

                    <AdminDashboardCard :header="`students (${dashboard.advisor?.classId?.currentLevel} LVL)`"
                        icon="group" :content="dashboard.students ?? 0" bg-color="bg-[--blue-200]" />

                    <AdminDashboardCard header="general info" icon="info" not-admin
                        :current-session="dashboard.currentSession?.name ?? 'Session'"
                        :current-semester="dashboard.currentSemester?.name ?? 'Semester'" />
                </section>
            </template>
        </Card>

        <Card class="cursor-context-menu lg:col-span-2">
            <template #title>Top 5 Students</template>
            <template #content>
                <section style="height:calc(100dvh - 29rem)" class="overflow-y-scroll grid items-start gap-2">

                    <div v-for="student in dashboard.topStudents" :key="student.studentId"
                        class="rounded-md border px-4 py-3 min-h-20">
                        <div class="flex items-center gap-1 w-full">
                            <img v-if="student.imageURL" :src="student.imageURL" alt="student"
                                class="w-7 aspect-square rounded-full object-cover">
                            <img v-else src="../../assets/images/user.jpg" alt="user"
                                class="w-7 aspect-square rounded-full object-cover">
                            <h1 @click="goToStudentProfile(student)"
                                class="text-[--highlight-text-color] hover:text-[--blue-500] hover:cursor-pointer font-semibold w-full">
                                {{ student.name }}
                            </h1>
                        </div>

                        <div class="flex mt-1 text-xs items-center justify-between">
                            <p class="font-medium text-slate-600">{{ student.regNumber }}</p>
                            <p class="text-slate-600">CGPA: <span class="font-bold">{{ formatGPA(student.CGPA) }}</span>
                            </p>
                        </div>
                    </div>
                </section>
            </template>
        </Card>

        <Card class="cursor-context-menu lg:col-span-3">
            <template #title>
                <h1>Your Courses:
                    <span class="text-lg text-[--primary-color]">{{ dashboard.advisor.courses.length ?? 0 }}</span>
                </h1>
            </template>
            <template #content>
                <section style="height:calc(100dvh - 29rem)" class="overflow-y-scroll grid items-start gap-2">
                    <div v-for="course in dashboard.advisor.courses" :key="course._id"
                        class="rounded-md border px-4 py-3 min-h-20">
                        <div class="flex items-center gap-1 w-full">
                            <Avatar :label="course.code[0]" class="shrink-0"
                                style="background-color: #dee9fc; color: #1a2551; font-weight: 500;" shape="circle" />
                            <h1 title="course-title" class="text-[--highlight-text-color] font-semibold w-full">
                                {{ course.title }}
                            </h1>
                        </div>

                        <div class="flex items-center gap-3 justify-between flex-wrap font-medium text-sm">
                            <div class="flex items-center flex-wrap">
                                <p>{{ course.code }}</p>
                                <Divider layout="vertical" />
                                <p>{{ course.unit }} Units</p>
                                <Divider layout="vertical" />
                                <p>{{ course.isElective ? 'ELECTIVE' : 'COMPULSORY' }}</p>
                            </div>

                            <div class="flex flex-wrap items-center gap-3">
                                <Button label="Add result" @click="goToResults(course)"
                                    class="text-sm px-2 py-[0.3rem]" />
                                <Button @click="showCourseDetails(course)" severity="secondary" label="View details"
                                    class="text-sm px-2 py-[0.3rem]" />
                            </div>
                        </div>
                    </div>
                </section>
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
    </main>
</template>
