<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { formatGPA } from '@/composables/use-gpa';
import { getNumberOfCourses } from '@/composables/useCountCourse'

import Card from 'primevue/card';
import Fieldset from 'primevue/fieldset';
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog';
import InputMask from 'primevue/inputmask';
import Chip from 'primevue/chip';

const toast = useToast()
const route = useRoute()
const router = useRouter()

let data = ref(await getStudentProfile())

async function getStudentProfile() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/advisor/student-profile/${route.params.id}`, {
            credentials: 'include'
        })
        const data = await response.json()
        console.log(data)
        if (response.status === 200) {
            return data
        }
    } catch (error) {
        console.log(error)
    }
}

//Groups the registered courses into semesters
const groupedCourses = computed(() => {
    return data.value.registeredCourses.reduce((acc, record) => {
        // Find the index of the existing session and level in the grouped array
        const existingIndex = acc.findIndex(
            (group) => group.session === record.session && group.level === record.level
        );

        // If the session and level combination exists, add the course to that group
        if (existingIndex !== -1) {
            acc[existingIndex].courses.push(...record.courses);
        } else {
            // Otherwise, create a new group for the session and level
            acc.push({
                session: record.session,
                level: record.level,
                courses: [...record.courses],
            });
        }
        acc.sort((a, b) => a.level - b.level);
        return acc;
    }, []);
})


function viewCourseRegDetails(session) {
    router.push({
        name: 'advisor-student-course-registration-details',
        params: {
            studentId: route.params.id,
            session: session
        }
    })
}

const visible = ref(false);
let loading = ref(false)
async function goToTranscript() {
    loading.value = true

    try {
        const res = await fetch(`${import.meta.env.VITE_API}/advisor/check-transcript-session?studentId=${route.params.id}`, { credentials: 'include' })
        const data = await res.json()
        if (res.status !== 200) {
            toast.add({ severity: 'warn', summary: data.info, detail: data.message, life: 5000 })
            return
        }
        return router.push({
            name: 'student-transcript',
            params: {
                studentId: route.params.id,
            }
        })
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
        console.error(error)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <Toast class="w-[70dvw] md:w-[30rem]" />
    <Dialog v-model:visible="visible" modal header="Transcript Generation" :style="{ width: '25rem' }">
        <p>This will generate official transcripts for the student up to their most current results.</p>
        <br>
        <div class="flex justify-content-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
            <Button :loading="loading" type="button" label="Generate" @click="goToTranscript"></Button>
        </div>
    </Dialog>
    <main class="w-full h-full md:flex overflow-y-scroll">
        <section class="h-full p-5 md:min-w-96 md:w-1/2 md:max-w-[30rem]">
            <Card class="h-full">
                <template #title>Student Profile</template>
                <template #content>
                    <section style="height: calc(100dvh - 12.4rem);" class="overflow-y-scroll">
                        <Fieldset>
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">person</span>
                                    <p>Student Details</p>
                                </div>
                            </template>

                            <div class="md:flex md:items-center md:gap-2 md:flex-wrap">
                                <img v-if="data.student.imageURL" :src="data.student.imageURL" alt="student-img"
                                    class="w-24 aspect-square rounded-md object-cover" />

                                <img v-else src="../../assets/images/user.jpg" alt="student-img"
                                    class="w-24 aspect-square rounded-md" />
                                <div class="flex flex-col gap-2">
                                    <h1 class="font-bold lg:text-lg">{{ data.student.name }}</h1>

                                    <p
                                        class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                        Reg. Number: <span class="font-bold">{{ data.student.regNumber }}</span></p>

                                    <p
                                        class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                        Level: <span class="font-bold">{{ data.student.classId.currentLevel }}</span>
                                    </p>
                                </div>
                            </div>
                        </Fieldset>

                        <Fieldset>
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">book_2</span>
                                    <p>Academic Record</p>
                                </div>
                            </template>
                            <div class="flex flex-col gap-3 mt-2 md:mt-0">
                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    CGPA: <span class="font-bold">{{ formatGPA(data.CGPA) }}</span></p>

                                <Button @click="visible = true" label="Generate Transcripts" />
                                <!--  <Button severity="secondary" label="Performance Summary" /> -->
                            </div>
                        </Fieldset>

                        <Fieldset>
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">info</span>
                                    <p>Personal Info</p>
                                </div>
                            </template>

                            <div class="flex flex-col gap-3 mt-2 md:mt-0">
                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Date of Birth: <span class="font-bold">{{ data.student.dateOfBirth ?? '' }}</span>
                                </p>

                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Sex: <span class="font-bold">{{ data.student.sex ?? '' }}</span>
                                </p>

                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Email: <span class="font-bold">{{ data.student.email ?? '' }}</span>
                                </p>

                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Phone: <span class="font-bold">{{ data.student.phoneNumber ?? '' }}</span>
                                </p>
                            </div>
                        </Fieldset>
                    </section>
                </template>
            </Card>

        </section>

        <section class="h-full md:grow p-5">
            <Card class="h-full overflow-hidden">
                <template #content>
                    <section style="height: calc(100dvh - 9.5rem);"
                        class="flex flex-wrap xl:justify-between gap-3 overflow-y-scroll">
                        <Fieldset class="w-full xl:w-[48%]">
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">book_5</span>
                                    <p>Outstanding Courses</p>
                                </div>
                            </template>
                            <div v-if="data.outstandingCourses.length">
                                <Fieldset v-for="(course, index) in data.outstandingCourses" :key="index" class="mb-4">
                                    <template #legend>{{ course.code }}</template>
                                    <p>{{ course.title }}</p>
                                </Fieldset>
                            </div>

                            <div v-else class="grid place-content-center">
                                <img src="../../assets/images/empty.png" alt="empty_box" class="w-60">
                            </div>
                        </Fieldset>

                        <Fieldset class="w-full xl:w-[48%]">
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">book_2</span>
                                    <p>Registered Courses</p>
                                </div>
                            </template>
                            <div v-if="groupedCourses.length">
                                <Fieldset v-for="(history, index) in groupedCourses" :key="index" class="mb-4">
                                    <template #legend>
                                        <div class="flex flex-col">
                                            <p>Session:<span>{{ history.session }}</span></p>
                                            <p class="font-medium text-sm">{{ history.level }} LEVEL</p>
                                        </div>
                                    </template>

                                    <div class="flex items-center justify-between flex-wrap">
                                        <div class="flex items-center gap-3">
                                            <p
                                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                                Harmattan:
                                                <span class="font-bold">
                                                    {{ getNumberOfCourses(history.courses).har }}
                                                </span>
                                            </p>

                                            <p
                                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                                Rain:
                                                <span class="font-bold">
                                                    {{ getNumberOfCourses(history.courses).rain }}
                                                </span>
                                            </p>
                                        </div>
                                        <Button @click="viewCourseRegDetails(history.session)" text
                                            label="View Details" />
                                    </div>
                                </Fieldset>
                            </div>

                            <div v-else class="grid place-content-center">
                                <img src="../../assets/images/empty.png" alt="empty_box" class="w-60">
                            </div>
                        </Fieldset>
                    </section>
                </template>
            </Card>
        </section>
    </main>
</template>
