<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Toast from 'primevue/toast'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast';
import { formatGPA } from '@/composables/use-gpa'
const route = useRoute()
const router = useRouter()
const toast = useToast()


let CUR = ['CURRENT TGP', 'CURRENT TNU', 'CURRENT GPA']
let PRE = ['PREVIOUS TGP', 'PREVIOUS TNU', 'PREVIOUS GPA']
let CUM = ['CUM TGP', 'CUM TNU', 'CUM GPA']

let data = ref(await getResultForAllCourses())
async function getResultForAllCourses() {
    let { classId, session, semester, level } = route.params
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/advisor/view-results-all-courses?classId=${classId}&session=${session}&semester=${semester}&level=${level}`, {
            credentials: 'include'
        })
        const data = await response.json()
        console.log(data)
        if (response.status === 200) {
            return data
        }
        return
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error })
        console.error(error)
    }
}

function getGrade(record, course) {
    let grade = ''
    record.courses.forEach(c => {
        if (c.code == course.code) {
            grade = c.grade
        }
    })
    return grade
}

function getRemark(courses) {
    let remark = ''
    let num = 0
    courses.forEach(course => {
        if (course.remark === 'FAIL') {
            num += 1
        }
    })

    if (!num) {
        return 'PASS'
    } else {
        return `${num}F`
    }
}

function print() {
    window.print()
}

</script>

<template>
    <Toast class="w-80 md:w-[30rem]" />
    <main v-if="data" class="w-dvw lg:w-full h-full md:flex overflow-y-scroll p-5">
        <Card class="w-dvw md:w-full">
            <template #title>
                <div class="flex items-center justify-between gap-3 flex-wrap">
                    <h1>{{ `${route.params.session.split('-').join('/')} Session - ${route.params.level} Level -
                        ${route.params.semester} Semester Results` }}</h1>
                    <Button @click="print" label="Print" />
                </div>

            </template>

            <template #content>
                <div style="height: calc(100dvh - 13.5rem)" class="print-content overflow-scroll mt-4">
                    <table class="table-bordered text-[0.6rem] whitespace-nowrap w-full text-black">
                        <thead>
                            <tr>
                                <th>
                                    <br>
                                    <p>SN</p>
                                </th>
                                <th>
                                    <br>
                                    <p>REG. NO.</p>
                                </th>
                                <th v-for="course in data.courses" :key="course.code">
                                    <p>{{ course.code }}</p>
                                    <p>{{ course.unit }}</p>
                                </th>
                                <th v-for="c in CUR">
                                    <p>{{ c.split(" ")[0] }}</p>
                                    <p>{{ c.split(" ")[1] }}</p>
                                </th>
                                <th v-for="p in PRE">
                                    <p>{{ p.split(" ")[0] }}</p>
                                    <p>{{ p.split(" ")[1] }}</p>
                                </th>
                                <th v-for="c in CUM">
                                    <p>{{ c.split(" ")[0] }}</p>
                                    <p>{{ c.split(" ")[1] }}</p>
                                </th>
                                <th>RMK</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(record, index) in data.records" :key="record._id" class="text-center">
                                <td>{{ index + 1 }}</td>
                                <td>{{ record.student.regNumber }}</td>
                                <td v-for="course in data.courses">{{ getGrade(record, course) }}</td>
                                <td>{{ record.totalGradePoints }}</td>
                                <td>{{ record.totalUnits }}</td>
                                <td>{{ formatGPA(record.GPA) }}</td>
                                <td>{{ record.previousTGP ?? '' }}</td>
                                <td>{{ record.previousTNU ?? '' }}</td>
                                <td>{{ !record.previousGPA ? '' : formatGPA(record.previousGPA) }}</td>
                                <td>{{ record.cumTGP ?? record.totalGradePoints }}</td>
                                <td>{{ record.cumTNU ?? record.totalUnits }}</td>
                                <td>{{ formatGPA(record.cumGPA) === NaN ? formatGPA(record.GPA) : formatGPA(record.cumGPA)
                                    }}</td>
                                <td>{{ getRemark(record.courses) }}</td>
                            </tr>
                        </tbody>
                    </table>

                </div>
            </template>
        </Card>
    </main>
    <main v-else class="grid place-content-center">
        <Message class="p-5" icon="pi pi-info-circle" :closable="false">
            No results found for {{ route.params.session }} session, {{ route.params.semester.toLowerCase() }} semester,
            {{
                route.params.level }} level.
        </Message>
    </main>
</template>


<style scoped>
.table-bordered th,
.table-bordered td {
    padding: 0.25rem;
}
</style>
