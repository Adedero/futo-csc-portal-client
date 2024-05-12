<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import Card from 'primevue/card'
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputGroup from 'primevue/inputgroup';
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast';

//Constants
const router = useRouter()
const toast = useToast()

let loading = ref(false)

//Gets courses, sessions, and staff results
let details = ref(await getDetails())

let selectedCourse = ref({})
let selectedSession = ref({})
let selectedSemester = ref('')

async function getDetails() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/advisor/uploaded-results-history`, {
            credentials: 'include'
        })

        const data = await response.json()
        console.log(data)

        if (response.status === 200) {
            return data
        }

        return {}
    } catch (error) {
        console.error(error)
    }
}

//Gathers details for result adding


function goToAddResultPage() {
    router.push({
        name: 'advisor-add-result',
        params: {
            staffId: details.value.staff._id,
            session: selectedSession.value.name,
            semester: selectedSemester.value,
            level: selectedCourse.value.level,
            course: selectedCourse.value.code.split(' ').join('-'),
            scoped: false,
        }
    })
}

function checkFields() {
    if (!selectedCourse.value || !selectedSemester.value || !selectedSession.value) {
        return true
    }
    return false
}

//Viewing and editing results
function viewResult(result) {
    router.push({
        name: 'advisor-result-ogr',
        params: {
            staffId: details.value.staff._id,
            session: result.session,
            semester: result.semester,
            level: result.level,
            course: result.course.code.split(' ').join('-'),
        }
    })
}
function editResult(result) {
    router.push({
        name: 'advisor-edit-result',
        params: {
            resultId: result._id
        }
    })
}



//searching through uploaded results
let valueToSearch = ref('')

const filteredResults = computed(() => {
    return details.value.uploadedResults.filter((result) => {
        return result.course.code.toLowerCase().includes(valueToSearch.value.toLowerCase()) || result.semester.toLowerCase().includes(valueToSearch.value.toLowerCase()) || result.course.title.toLowerCase().includes(valueToSearch.value.toLowerCase())
    })
})

</script>

<template>
    <Toast class="w-[70dvw] md:w-72" />
    <main class="w-full h-full md:flex overflow-y-scroll">
        <section class="p-5 h-max w-full md:w-[40%] lg:w-96 overflow-x-hidden">
            <Card class="h-full overflow-y-scroll overflow-x-hidden">
                <template #title>Add Result</template>
                <template #content>
                    <div class="flex flex-col gap-3">

                        <div class="flex flex-col gap-1 mt-2">
                            <label class="font-bold text-sm text-[--surface-500]" for="course">Course</label>
                            <Dropdown id="course" v-model="selectedCourse" :options="details.staff.courses"
                                optionLabel="code" placeholder="Select a course" />
                        </div>

                        <div class="flex flex-col gap-1 mt-2">
                            <label class="font-bold text-sm text-[--surface-500]" for="session">Session</label>
                            <Dropdown id="session" v-model="selectedSession" :options="details.sessions"
                                optionLabel="name" placeholder="Select a session" />
                        </div>

                        <div class="flex flex-col gap-1 mt-2">
                            <label class="font-bold text-sm text-[--surface-500]" for="semester">Semester</label>
                            <Dropdown id="semester" v-model="selectedSemester" :options="['HARMATTAN', 'RAIN']"
                                placeholder="Select a semester" />
                        </div>

                        <Button @click="goToAddResultPage" class="mt-2" label="Submit" :loading="loading"
                            :disabled="checkFields()" />
                    </div>
                </template>
            </Card>
        </section>

        <section class="p-5 h-full w-full md:w-[60%] lg:flex-grow overflow-x-hidden">
            <Card class="h-full">
                <template #title>
                    <div class="flex gap-2 items-center">
                        <h1>Results Uploaded:</h1>
                        <p class="font-bold text-[--primary-color]">{{ filteredResults.length }}</p>
                    </div>
                </template>
                <template #content>
                    <div class="h-full mt-5">
                        <div class="flex items-center -mt-5 gap-3 pb-3 max-w-96">
                            <InputGroup>
                                <InputText v-model="valueToSearch" placeholder="Search" />
                                <Button icon="pi pi-search" severity="primary" />
                            </InputGroup>
                        </div>

                        <div class="overflow-y-scroll" style="height: calc(100dvh - 15.2rem)">

                            <div class="list">
                                <Card v-for="result in filteredResults" class="border">
                                    <template #title>
                                        <div class="flex items-center gap-1 w-full">
                                            <Avatar label="C" size="large" class="shrink-0"
                                                style="background-color: #dee9fc; color: #1a2551" shape="circle" />
                                            <h1 title="course-title"
                                                class="text-[--highlight-text-color] text-lg w-full whitespace-nowrap text-ellipsis overflow-hidden">
                                                {{ result.course.code }}</h1>
                                        </div>
                                    </template>
                                    <template #subtitle>
                                        <div class="flex items-center flex-wrap">
                                            <p>{{ result.session }}</p>
                                            <Divider layout="vertical" />
                                            <p>{{ result.semester }}</p>
                                            <Divider layout="vertical" />
                                            <p>{{ result.isApprovedByHOD && result.isApprovedByDean ? 'Approved' :
                                                'Pending approval' }}</p>
                                        </div>
                                    </template>
                                    <template #content>
                                        <div class="flex flex-wrap items-center gap-3">
                                            <Button @click="viewResult(result)" label="View" severity="help" outlined />
                                            <Button @click="editResult(result)" label="Edit"
                                                :disabled="result.isApprovedByHOD || result.isApprovedByDean" />
                                        </div>
                                    </template>
                                </Card>
                            </div>
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
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr))
}

@media screen and (min-width: 768px) {
    .list {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
    }
}
</style>