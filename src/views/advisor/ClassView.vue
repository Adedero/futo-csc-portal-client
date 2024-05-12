<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Dropdown from 'primevue/dropdown'
import Card from 'primevue/card'
import Panel from 'primevue/panel'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import Button from 'primevue/button'
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

//Constants
const router = useRouter()
const toast = useToast()
//Get students

let errorLoadingStudents = ref(false)

let students = ref(await getStudents())

async function getStudents() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/advisor/students`, {
            credentials: 'include'
        })
        const data = await response.json()

        if (response.status === 200) {
            errorLoadingStudents.value = false
            data.sort((a, b) => a.name.localeCompare(b.name));
            return data
        } else {
            errorLoadingStudents.value = true
            return []
        }
    } catch (error) {
        console.error(error);
        errorLoadingStudents.value = true
    }
}

//Search functionality for students
let valueToSearch = ref('')

const filteredStudents = computed(() => {
    return students.value.filter(student => {
        return student.name.toLowerCase().includes(valueToSearch.value.toLowerCase()) || student.regNumber.includes(valueToSearch.value)
    })
})

//Visits the student's profile
function goToStudentProfile(student) {
    router.push({
        name: 'advisor-student-profile',
        params: {
            id: student._id
        }
    })
}

//Viewing and adding results
//First get all available sessions, and courses
let details = ref(await getSessionsAndCourses())

async function getSessionsAndCourses() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/advisor/sessions-and-courses`, {
            credentials: 'include'
        })
        const data = await response.json()
        console.log(data)
        if (response.status === 200) {
            data.sessions.sort((a, b) => {
                return parseInt(b.name.split('-')[0]) - parseInt(a.name.split('-')[0])
            })
            return data
        }
    } catch (error) {
        console.error(error)
    }
}


let selectedSession = ref({})
let selectedSemester = ref('')
let selectedCourse = ref(null)
let selectedCourseToAddResult = ref(null)
let selectedLevel = ref(null)

const semesters = ref(['HARMATTAN', 'RAIN'])
const levels = ref([100, 200, 300, 400, 500])
const courses = ref([
    { _id: 1, code: 'ALL COURSES', semester: 'HARMATTAN RAIN', level: "ALL" },
    ...details.value.courses])
const filteredCourses = computed(() => {
    return courses.value.filter((course) => {
        return course.semester.toLowerCase().includes(selectedSemester.value.toLowerCase()) && (course.level == selectedLevel.value || course.level === "ALL")
    })
})

const filteredCoursesTwo = computed(() => {
    return details.value.courses.filter((course) => {
        return course.semester.toLowerCase().includes(selectedSemester.value.toLowerCase()) && course.level == selectedLevel.value
    })
})

function goToResults() {
    router.push({
        name: 'advisor-add-result',
        params: {
            staffId: details.value.advisor._id,
            session: selectedSession.value.name,
            semester: selectedSemester.value,
            level: selectedLevel.value,
            course: selectedCourseToAddResult.value.code.split(' ').join('-'),
            scoped: true
        }
    })
}

function viewResult() {
    if (selectedCourse.value.code == 'ALL COURSES') {
        router.push({
            name: 'class-result-all-courses',
            params: {
                classId: details.value.advisor.classId,
                session: selectedSession.value.name,
                semester: selectedSemester.value,
                level: selectedLevel.value,
            }
        })
    } else {
        router.push({
            name: 'class-result-ogr',
            params: {
                session: selectedSession.value.name,
                semester: selectedSemester.value,
                level: selectedLevel.value,
                course: selectedCourse.value.code.split(' ').join('-')
            }
        })
    }
}

</script>

<template>
    <Toast class="w-[70%] md:w-[30rem]" />
    <main class="w-full h-full md:flex overflow-y-scroll">
        <section class="p-5 h-full w-dvw md:max-w-96">
            <Card class="h-full overflow-y-scroll">
                <template #title>Class Results</template>
                <template #content>
                    <TabView class="-mt-4">
                        <TabPanel header="View Result">
                            <div class="mt-1 grid gap-3">
                                <div class="grid">
                                    <label class="text-sm font-semibold">Session</label>
                                    <Dropdown v-model="selectedSession" :options="details.sessions" option-label="name"
                                        placeholder="Select Session" />
                                </div>
                                <div class="grid">
                                    <label class="text-sm font-semibold">Semester</label>
                                    <Dropdown v-model="selectedSemester" :options="semesters"
                                        placeholder="Select Semester" />
                                </div>
                                <div class="grid">
                                    <label class="text-sm font-semibold">Level</label>
                                    <Dropdown v-model="selectedLevel" :options="levels" placeholder="Select Level" />
                                </div>
                                <div class="grid">
                                    <label class="text-sm font-semibold">Course</label>
                                    <Dropdown v-model="selectedCourse" :options="filteredCourses" option-label="code"
                                        placeholder="Select Course" editable />
                                </div>
                                <div class="grid">
                                    <Button @click="viewResult" label="View Result"
                                        :disabled="!selectedSession.name || !selectedSemester || !selectedCourse" />
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel header="Add Result">
                            <div class="mt-1 grid gap-3">
                                <div class="grid">
                                    <label class="text-sm font-semibold">Session</label>
                                    <Dropdown v-model="selectedSession" :options="details.sessions" option-label="name"
                                        placeholder="Select Session" />
                                </div>
                                <div class="grid">
                                    <label class="text-sm font-semibold">Semester</label>
                                    <Dropdown v-model="selectedSemester" :options="semesters"
                                        placeholder="Select Semester" />
                                </div>
                                <div class="grid">
                                    <label class="text-sm font-semibold">Level</label>
                                    <Dropdown v-model="selectedLevel" :options="levels" placeholder="Select Level" />
                                </div>
                                <div class="grid">
                                    <label class="text-sm font-semibold">Course</label>
                                    <Dropdown v-model="selectedCourseToAddResult" :options="filteredCoursesTwo"
                                        option-label="code" placeholder="Select Course" editable />
                                </div>
                                <div class="grid">
                                    <Button @click="goToResults" label="Add Result"
                                        :disabled="!selectedSession.name || !selectedSemester || !selectedCourseToAddResult" />
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>

                    <Panel header="Performance Summary">
                        <div class="grid gap-2">
                            <Button disabled severity="secondary" label="Generate" />
                        </div>
                    </Panel>
                </template>
            </Card>

        </section>

        <section class="p-5 h-full w-dvw md:w-auto md:flex-grow">
            <Card class="h-full">
                <template #title>Class 2018-2019</template>
                <template #subtitle>Students:
                    <span class="font-semibold text-[--primary-color]">{{ students.length }}</span>
                </template>
                <template #content>
                    <div>
                        <div class="flex items-center gap-3 pb-3 max-w-96">
                            <InputGroup>
                                <InputText v-model="valueToSearch" placeholder="Search name or reg number" />
                                <Button icon="pi pi-search" severity="primary" />
                            </InputGroup>
                        </div>

                        <div class="list">
                            <Panel v-for="student in filteredStudents" :key="student._id"
                                @click="goToStudentProfile(student)"
                                class="hover:shadow hover:bg-[--surface-50] transition-shadow cursor-pointer">
                                <template #header>
                                    <div class="flex items-center gap-2">
                                        <img v-if="student.imageURL" :src="student.imageURL" alt="student"
                                            class="w-10 aspect-square rounded-full object-cover">

                                        <img v-else src="../../assets/images/user.jpg" alt="student"
                                            class="w-10 aspect-square rounded-full object-cover">
                                        <p class="font-bold md:text-lg">{{ student.name }}</p>
                                    </div>
                                </template>

                                <p
                                    class="text-sm bg-[--highlight-bg] text-[--highlight-text-color] font-bold px-2 py-1 w-fit rounded-full -mt-2">
                                    {{ student.regNumber }}
                                </p>
                            </Panel>
                        </div>
                    </div>
                </template>
            </Card>
        </section>
    </main>
</template>

<style scoped>
.list {
    display: grid;
    align-content: start;
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
    gap: 1rem;
    height: calc(100dvh - 18rem);
    overflow-y: scroll;
}

@media screen and (min-width: 768px) {
    .list {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
    }
}
</style>