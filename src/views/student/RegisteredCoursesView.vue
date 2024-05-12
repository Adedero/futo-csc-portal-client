<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Sidebar from 'primevue/sidebar';
import Dropdown from 'primevue/dropdown';
import Avatar from 'primevue/avatar';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const router = useRouter()
const toast = useToast()

let isOpen = ref(false)
let visible = ref(false)
let loading = ref(false)

let selectedSession = ref('')
let selectedSemester = ref('')
let selectedLevel = ref('')

let isCourseRegOpen = ref(false)
let openSessions = ref([])
let openSemesters = ref([])
let openLevels = ref([])

let courseRegHistory = ref([])
let semesterCourses = ref([])

async function getCourseRegDetails() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/student/course-registration-status`, {
            credentials: 'include'
        })
        const data = await res.json()
        if (res.status === 200) {

            let nameOfOpenLevels = data.courseRegStatus.openLevel.map((level) => level.name)

            isCourseRegOpen.value = data.courseRegStatus.isOpen
            openSessions.value = data.courseRegStatus.openSession
            openSemesters.value = data.courseRegStatus.openSemester
            openLevels.value = [...new Set([data.studentClass.currentLevel, ...nameOfOpenLevels])].sort()
            semesterCourses.value = data.semesterCourses

            courseRegHistory.value = data.history
            courseRegHistory.value.sort((a, b) => {
                if (a.level !== b.level) {
                    return a.level - b.level;
                }

                // If levels are equal, compare by name
                return a.semester.localeCompare(b.semester);
            })
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
        console.error(error)
    }
}


function goToRegPage() {
    loading.value = true
    setTimeout(() => {
        loading.value = false
        router.push({
            name: 'course-registration',
            params: {
                sessionId: selectedSession.value._id,
                semester: selectedSemester.value.name,
                level: selectedLevel.value
            }
        })
    }, 1000);
}

function viewRegDetails(id) {
    router.push({
        name: 'course-registration-details',
        params: {
            id: id
        }
    })
}

let sidebarVisible = ref(false)

let courseToShow = ref({})

function showCourseDetails(course) {
    courseToShow.value = course
    sidebarVisible.value = true
}

onMounted(() => {
    getCourseRegDetails()
})
</script>

<template>

    <Toast class="w-[70dvw] md:w-72" />
    <Dialog v-model:visible="isOpen" modal header="Register Courses" :style="{ width: '22rem' }">
        <div class="flex flex-col gap-1">
            <label for="session" class="font-semibold w-6rem">Session</label>
            <Dropdown id="session" v-model="selectedSession" :options="openSessions" optionLabel="name"
                placeholder="Session" class="w-full md:w-14rem" />
        </div>

        <div class="flex flex-col gap-1 mt-5">
            <label for="semester" class="font-semibold w-6rem">Semester</label>
            <Dropdown id="semester" v-model="selectedSemester" :options="openSemesters" optionLabel="name"
                placeholder="Semester" class="w-full md:w-14rem" />
        </div>

        <div class="flex flex-col gap-1 mt-5">
            <label for="level" class="font-semibold w-6rem">Level</label>
            <Dropdown id="level" v-model="selectedLevel" :options="openLevels" placeholder="Level"
                class="w-full md:w-14rem" />
        </div>

        <div class="flex justify-content-end gap-2 mt-5">
            <Button type="button" label="Cancel" severity="secondary" @click="isOpen = false"></Button>
            <Button type="button" label="Submit" @click="goToRegPage" :loading="loading"
                :disabled="!selectedLevel || !selectedSemester || !selectedSession">
            </Button>
        </div>

    </Dialog>

    <Dialog v-model:visible="visible" modal header="Closed" :style="{ width: '20rem' }">
        <div>
            Course registration has been closed for this semester. <br>
            Please, visit the admin office for more information.
        </div>
        <div class="mt-5">
            <Button type="button" label="OK" severity="info" class="w-20" @click="visible = false"></Button>
        </div>
    </Dialog>

    <main class="w-full h-full md:grid md:grid-cols-2 lg:grid-cols-5 overflow-y-scroll">
        <section class="w-dvw md:w-auto lg:col-span-3 p-5">
            <Card class="md:h-full">
                <template #title>
                    <div class="flex gap-3 justify-between items-center">
                        <h1>Registered Courses</h1>
                        <Button @click="isCourseRegOpen ? isOpen = true : visible = true" label="Register Courses" />
                    </div>
                </template>

                <template #content>
                    <div style="max-height: calc(100dvh - 13.3rem)" class="overflow-scroll rounded-md table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Session</th>
                                    <th>Semester</th>
                                    <th>Level</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="record in courseRegHistory" :key="record._id" class="row">
                                    <td class="w-20">{{ record.session }}</td>
                                    <td class="w-20">{{ record.semester }}</td>
                                    <td class="w-20">{{ record.level }}</td>
                                    <td class="w-20">
                                        <Button @click="viewRegDetails(record._id)" class="text-sm" severity="info"
                                            label="Details" />
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </template>
            </Card>
        </section>

        <section class="w-dvw md:w-auto lg:col-span-2 p-5">
            <Card class="h-full">
                <template #title>
                    <h1>Semester Courses: <span class="text-lg text-[--primary-color]">{{ semesterCourses.length
                            }}</span></h1>
                </template>

                <template #content>
                    <div style="height: calc(100dvh - 12.5rem)" class="overflow-y-scroll flex flex-col gap-3 pb-3">
                        <div class="grid gap-3">
                            <Card v-for="course in semesterCourses" :key="course._id" @click="showCourseDetails(course)"
                                class="border hover:cursor-pointer hover:shadow-md transition-[box-shadow]]">
                                <template #title>
                                    <div class="flex items-center gap-1 w-full">
                                        <Avatar :label="course.code[0]" size="large" class="shrink-0"
                                            style="background-color: #dee9fc; color: #1a2551" shape="circle" />
                                        <h1 title="course-title" class="text-[--highlight-text-color] text-lg w-full ">
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
                            </Card>
                        </div>
                    </div>
                </template>
            </Card>

            <Sidebar v-model:visible="sidebarVisible" position="right" header="Course Details"
                class="w-dvw md:w-[22rem] lg:w-[24rem]">
                <div class="h-full">
                    <h1 title="course-title" class="text-[--highlight-text-color] font-bold text-lg">{{
                        courseToShow.title }}
                    </h1>

                    <div class="flex items-center flex-wrap text-sm mt-2">
                        <p class="p-1 font-medium text-[--highlight-text-color] bg-[--highlight-bg]">{{
                            courseToShow.code }}</p>
                        <Divider layout="vertical" />
                        <p class="p-1 font-medium text-[--highlight-text-color] bg-[--highlight-bg]">{{
                            courseToShow.unit }}
                            Units</p>
                        <Divider layout="vertical" />
                        <p class="p-1 font-medium text-[--highlight-text-color] bg-[--highlight-bg]">{{
                            courseToShow.isElective
                                ? 'ELECTIVE' : 'COMPULSORY' }}</p>
                    </div>

                    <p class="mt-6 font-bold text-sm">Marks Distribution</p>

                    <div
                        :class="['mt-2 h-11 rounded-r-full overflow-hidden grid', courseToShow.hasPractical ? 'grid-cols-5' : 'grid-cols-10']">

                        <div
                            :class="['bg-[--yellow-200] grid place-content-center text-sm font-bold', courseToShow.hasPractical ? 'col-span-1' : 'col-span-3']">
                            {{ courseToShow.hasPractical ? '20%' : '30%' }}
                        </div>

                        <div v-if="courseToShow.hasPractical"
                            class="bg-[--orange-200] grid place-content-center text-sm font-bold col-span-1">
                            20%
                        </div>
                        <div
                            :class="['bg-[--primary-200] grid place-content-center text-sm font-bold', courseToShow.hasPractical ? 'col-span-3' : 'col-span-7']">
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
.row:hover {
    background-color: unset;
}
</style>