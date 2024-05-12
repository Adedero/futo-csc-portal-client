<script setup>
import { onMounted, ref, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Sidebar from 'primevue/sidebar'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const route = useRoute()
const router = useRouter()

let loading = ref(false)

let isOpen = ref(false)

let courses = ref([])
let session = ref({})
let levelDetails = ref({})
let yearDetails = ref(0)
let semesters = ['HARMATTAN', 'RAIN']



let selectedCourses = computed(() => {
    return courses.value
        .filter(course => course.isSelected)
        .map(course => ({
            code: course.code,
            title: course.title,
            isElective: course.isElective,
            unit: course.unit,
        }))
})

//CHECKS FOR THE APPROPRIATE SEMESTER
function checkSemester() {
    if (route.params.semester === semesters[0]) {
        return { minUnits: levelDetails.value.harmattanMinCreditUnits, maxUnits: levelDetails.value.harmattanMaxCreditUnits }
    } else if (route.params.semester === semesters[1]) {
        return { minUnits: levelDetails.value.rainMinCreditUnits, maxUnits: levelDetails.value.rainMaxCreditUnits }
    }
}

//COMPUTED THE TOTAL UNITS OF SELECTED COURSES
let totalUnits = computed(() => {
    return courses.value.reduce((count, course) => {
        return course.isSelected ? count + course.unit : count;
    }, 0)
})

//GETS THE CORRECT COLOR FOR THE TOTAL SELECTED UNITS
let totalUnitsColor = computed(() => {
    if (totalUnits.value < checkSemester().minUnits || totalUnits.value > checkSemester().maxUnits) {
        return 'text-red-500'
    }
    return 'text-green-500'
})

//GETS THE COURSES TO SHOW
async function getCoursesToRegister() {
    let { sessionId, semester, level } = route.params

    try {
        const res = await fetch(`${import.meta.env.VITE_API}/student/courses-to-register?sessionId=${sessionId}&semester=${semester}&level=${level}`, {
            credentials: 'include'
        })
        const data = await res.json()
        console.log(data)
        if (res.status === 200) {
            courses.value = data.courses
            session.value = data.session
            levelDetails.value = data.level
            yearDetails.value = data.year
        } else {
            toast.add({ severity: 'warn', summary: data.info, detail: data.message, life: 5000 })
            setTimeout(() => {
                router.push({ name: 'registered-courses' })
            }, 5000);
        }

    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
    }
}

//REGISTERS THE COURSES
async function registerCourses() {
    if (totalUnits.value < checkSemester().minUnits) {
        return toast.add({ severity: 'warn', summary: 'Warning', detail: 'You must register at least ' + checkSemester().minUnits + ' units', life: 5000 })
    }
    if (totalUnits.value > checkSemester().maxUnits) {
        return toast.add({ severity: 'warn', summary: 'Warning', detail: 'You cannot register more than ' + checkSemester().maxUnits + ' units', life: 5000 })
    }

    let courseRegDetails = {
        courses: selectedCourses.value,
        session: session.value.name,
        semester: route.params.semester,
        level: levelDetails.value.name,
        year: yearDetails.value,
        totalUnits: totalUnits.value,
    }

    loading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/student/register-courses`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseRegDetails)
        })
        const data = await res.json()

        if (data.success) {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Courses registered successfully', life: 5000 })

            setTimeout(() => {
                router.push({ name: 'registered-courses' })
            }, 2000);
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
        console.log(error)

    } finally {
        loading.value = false
    }
}

let isVisible = ref(false)
let levelToBorrow = ref('')
let borrowLoading = ref(false)
let coursesToBorrow = ref([])

//Gets courses to borrow from the supplied level
async function getBorrowedCourses() {
    borrowLoading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/student/borrow-courses?level=${levelToBorrow.value}&semester=${route.params.semester}`, {
            credentials: 'include'
        })

        const data = await res.json()
        if (res.status === 200) {
            coursesToBorrow.value = data

            isVisible.value = true
            isOpen.value = false
        }
    } catch (error) {
        console.log(error)
    } finally {
        borrowLoading.value = false
    }
}

//Computes the selected courses from the list of courses to borrow from
const selectedBorrowedCourses = computed(() => {
    return coursesToBorrow.value
        .filter(course => course.isSelected)
        .map(course => ({
            code: course.code,
            title: course.title,
            isElective: course.isElective,
            hasPractical: course.hasPractical,
            level: course.level,
            unit: course.unit,
            description: course.description
        }))
})

//Adds the selected borrowed courses to the list of courses to register
function addBorrowedCourses() {
    if (!selectedBorrowedCourses.value.length) {
        return
    }
    courses.value.unshift(...selectedBorrowedCourses.value)
    isVisible.value = false
}

onMounted(() => getCoursesToRegister())
</script>

<template>
    <Toast class="w-[70dvw] md:w-[30rem]" />
    <Dialog v-model:visible="isOpen" modal header="Add or Borrow Courses" :style="{ width: '24rem' }">

        <div class="flex flex-col gap-1">
            <label for="level" class="font-semibold w-6rem">Level</label>
            <Dropdown id="level" v-model="levelToBorrow" :options="[100, 200, 300, 400, 500]" placeholder="Level"
                class="w-full md:w-14rem" />
        </div>

        <div class="flex justify-content-end gap-2 mt-5">
            <Button type="button" label="Cancel" severity="secondary" @click="isOpen = false"></Button>
            <Button type="button" label="Submit" @click="getBorrowedCourses" :loading="borrowLoading"
                :disabled="!levelToBorrow">
            </Button>
        </div>

    </Dialog>
    <Sidebar v-model:visible="isVisible" header="Add Courses" position="right" class="md:w-[30rem]">
        <div v-if="!coursesToBorrow.length">
            <p class="font-bold text-red-500">No courses found!</p>
        </div>
        <div v-else>
            <div class="mt-3">
                <Button @click="addBorrowedCourses" label="Add" />
            </div>
            <ul>
                <li v-for="course in coursesToBorrow" class="flex gap-2 border p-2 rounded mt-3">
                    <div>
                        <Checkbox v-model="course.isSelected" :binary="true" />
                    </div>
                    <div>
                        <p class="font-bold">{{ course.code }}</p>
                        <p class="text-sm">{{ course.title }}</p>
                    </div>
                </li>
            </ul>
        </div>
    </Sidebar>
    <main class="w-dvw lg:w-full h-full overflow-y-scroll p-5">
        <Card>
            <template #title>
                <div class="flex gap-3 justify-between items-center">
                    <h1>Course Registration</h1>
                    <Button label="Add/Borrow Courses" @click="isOpen = true" />
                </div>
            </template>

            <template #subtitle>
                <p>Total units selected:
                    <span :class="['font-bold', totalUnitsColor]">{{ totalUnits }}</span>
                    out of
                    <span class="font-bold">{{ checkSemester().maxUnits }}</span>
                    max units
                </p>
            </template>

            <template #content>
                <div style="max-height: calc(100dvh - 18.5rem)" class="overflow-scroll rounded-md table-container">
                    <table class="my-table">
                        <thead class="z-10">
                            <tr>
                                <th>Select</th>
                                <th>Course Code</th>
                                <th>Course Title</th>
                                <th>Units</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="course in courses" :key="course._id">
                                <td class="w-10">
                                    <Checkbox v-model="course.isSelected" :binary="true" />
                                </td>
                                <td class="w-32">{{ course.code }}</td>
                                <td>{{ course.title }}</td>
                                <td class="w-20">{{ course.unit }}</td>
                                <td class="w-20">{{ course.isElective ? 'ELELCTIVE' : 'COMPULSORY' }}</td>
                            </tr>

                        </tbody>
                    </table>
                </div>

                <div class="mt-2">
                    <Button label="Register" @click="registerCourses" :loading="loading" />
                </div>
            </template>
        </Card>
    </main>
</template>

<style scoped>
table.my-table {
    @apply w-full bg-white whitespace-nowrap lg:whitespace-normal rounded border-collapse cursor-context-menu
}

table.my-table thead {
    @apply text-left sticky top-0 bg-[--primary-200]
}


table.my-table tbody tr {
    @apply even:bg-[--surface-100] hover:bg-[--primary-100]
}

table.my-table th, table.my-table tbody td {
    @apply py-2 px-4
}
</style>