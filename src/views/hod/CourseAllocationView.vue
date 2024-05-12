<script setup>
import { ref, computed } from 'vue'

import Card from 'primevue/card'
import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const details = ref(await getCourseAllocationDetails())
let staffs = ref(details.value.staffs)

async function getCourseAllocationDetails() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/hod/staff-and-courses`, { credentials: 'include' })
        const data = await res.json()
        //console.log(data)
        if (res.status === 200) {
            return data
        }
        return toast.add({ severity: 'error', summary: data.info, detail: data.message, life: 5000 })
    } catch (error) {
        console.error(error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'Internal server error', life: 5000 })
    }
}

//Turn the array of staff to an array of courses
const allCourses = computed(() => {
    return staffs.value.reduce((courses, staff) => {
        staff.courses.forEach(course => {
            const existingCourse = courses.find(c => c.code === course.code);

            if (existingCourse) {
                // If the course already exists, add the staff to its staff list
                existingCourse.staff.push(staff.name);
            } else {
                // If the course doesn't exist, create a new course object
                courses.push({
                    code: course.code,
                    title: course.title,
                    level: course.level,
                    staff: [staff.name],
                });
            }
        });
        courses.sort((a, b) => a.level - b.level)
        return courses;
    }, []);
})

let valueToSearch = ref('')

const filteredCourses = computed(() => {
    return allCourses.value.filter(course => {
        return (
            course.title.toLowerCase().includes(valueToSearch.value.toLowerCase()) ||
            course.code.toLowerCase().includes(valueToSearch.value.toLowerCase()) ||
            course.level == valueToSearch.value ||
            course.staff.some(item => item.toLowerCase().includes(valueToSearch.value.toLowerCase()))
        );
    });
});

function printAllocation() {
    window.print()
}

</script>

<template>
    <main class="w-full h-full overflow-y-scroll">
        <section class="p-5 w-dvw md:w-full">
            <Card>
                <template #title>
                    <div class="details">
                        <div class="flex items-center justify-between">
                            <h1>Course Allocation</h1>
                            <Button @click="printAllocation" label="Print" class="print-btn" />
                        </div>
                        <div class="text-base font-normal flex items-center gap-5 flex-wrap">
                            <p>Session: <span class="font-semibold">{{ details.currentSession.name }}</span></p>
                            <p>Semester: <span class="font-semibold">{{ details.currentSemester.name }}</span></p>
                        </div>
                    </div>
                </template>
                <template #content>
                    <div class="search-bar flex items-center justify-between gap-3 pb-3">
                        <InputGroup class="max-w-72">
                            <InputText v-model="valueToSearch" placeholder="Search..." />

                            <Button icon="pi pi-search" severity="primary" />
                        </InputGroup>
                    </div>
                    <div style="height: calc(100dvh - 18rem);" class="allocation overflow-scroll">
                        <table class="my-table">
                            <thead>
                                <tr>
                                    <th class="w-10">Level</th>
                                    <th class="w-40">Course Code</th>
                                    <th>Course Title</th>
                                    <th>Staff</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr v-for="course in filteredCourses" :key="course.code">
                                    <td>{{ course.level }}</td>
                                    <td>{{ course.code }}</td>
                                    <td>{{ course.title }}</td>
                                    <td>
                                        <ul class="list-disc">
                                            <li v-for="staff in course.staff" :key="staff">{{ staff }}</li>
                                        </ul>
                                    </td>
                                </tr>
                            </tbody>

                        </table>
                    </div>
                </template>
            </Card>
        </section>
    </main>
</template>

<style>
@media print {

    body {
        visibility: hidden;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    .details {
        visibility: visible;
        border-radius: 0;
        border: 0;
        box-shadow: none;
        padding: 0;
        position: absolute;
        top: 0;
        left: 0;
    }

    .allocation {
        overflow: visible;
        display: grid;
        break-inside: avoid;
        visibility: visible;
        border-radius: 0;
        border: 0;
        box-shadow: none;
        padding: 0;
        position: absolute;
        top: 5rem;
        left: 0;
        width: 210mm;
        height: 297mm;
    }

    title,
    .search-bar,
    .print-btn {
        display: none;
    }

}
</style>