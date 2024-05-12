<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Message from 'primevue/message';
import ResultOGR from '@/components/ResultOGR.vue'
import { useDate } from '@/composables/use-date'

const route = useRoute()
const router = useRouter()
const toast = useToast()

let result = ref(await getResultForClassOGR())

//Data has to come from approved results
async function getResultForClassOGR() {
    let { session, semester, level, course } = route.params
    course = course.split('-').join(' ')
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/advisor/view-result?session=${session}&semester=${semester}&level=${level}&course=${course}`, {
            credentials: 'include'
        })
        const data = await response.json()
        console.log(data)
        if (response.status === 200) {
            data.results.sort((a, b) => a.name.localeCompare(b.name))
            return data
        }
        if (response.status === 404) {
            toast.add({ severity: 'error', summary: data.info, detail: data.message, life: 5000 })
            return {}
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
        console.error(error)
    }
}

const paginatedStudents = computed(() => {
    const students = result.value.results;
    const pageSize = 40;
    const pageCount = Math.ceil(students.length / pageSize);

    const paginatedArray = Array.from({ length: pageCount }, (_, index) => {
        const start = index * pageSize;
        const end = start + pageSize;
        return result.value.results.slice(start, end);
    });
    return paginatedArray;
});

//Computes the number of students who got A, B, C, D, E, and F
const numberOfGrades = computed(() => {
    const gradeA = result.value.results.filter(student => student.grade.toLowerCase() === "a").length
    const gradeB = result.value.results.filter(student => student.grade.toLowerCase() === "b").length
    const gradeC = result.value.results.filter(student => student.grade.toLowerCase() === "c").length
    const gradeD = result.value.results.filter(student => student.grade.toLowerCase() === "d").length
    const gradeE = result.value.results.filter(student => student.grade.toLowerCase() === "e").length
    const gradeF = result.value.results.filter(student => student.grade.toLowerCase() === "f").length
    return { gradeA, gradeB, gradeC, gradeD, gradeE, gradeF }
})
//Computes the grade percentage
const percentageGrades = computed(() => {
    const pA = Math.round(((numberOfGrades.value.gradeA / result.value.results.length) * 100) * 100) / 100
    const pB = Math.round(((numberOfGrades.value.gradeB / result.value.results.length) * 100) * 100) / 100
    const pC = Math.round(((numberOfGrades.value.gradeC / result.value.results.length) * 100) * 100) / 100
    const pD = Math.round(((numberOfGrades.value.gradeD / result.value.results.length) * 100) * 100) / 100
    const pE = Math.round(((numberOfGrades.value.gradeE / result.value.results.length) * 100) * 100) / 100
    const pF = Math.round(((numberOfGrades.value.gradeF / result.value.results.length) * 100) * 100) / 100
    return { pA, pB, pC, pD, pE, pF }
})

function printDetails() {
    window.print()
}

</script>

<template>
    <Toast class="w-80 md:max-w-[30rem]" />
    <main v-if="result.results" class="w-full h-full md:flex overflow-y-scroll p-5">
        <Card class="overflow-scroll">
            <template #title>
                <div class="flex gap-3 justify-between item-center max-w-[210mm]">
                    <h1>{{ result.course.code }} OGR</h1>
                    <Button severity="secondary" @click="printDetails" label="Print" />
                </div>
            </template>
            <template #content>
                <ResultOGR :paginated-students="paginatedStudents" :result="result" :number-of-grades="numberOfGrades"
                    :percentage-grades="percentageGrades" />
                <!-- <div style="height: calc(100dvh - 14rem)" id="ogr" class="print-content overflow-scroll mt-4">

                    <div v-for="(group, index) in paginatedStudents" :key="index"
                        class="result-ogr overflow-y-scroll bg-white text-slate-700 rounded p-5 pb-10 md:gap-2 w-[210mm] h-[297mm] border-2">

                        <div class="flex items-center  gap-2 shrink-0">
                            <img src="../../assets/images/futo-log.png" alt="futo-logo"
                                class="w-12 h-auto shrink-0 mb-4">
                            <div class="mx-auto flex flex-col items-center justify-center">
                                <h1 class="text-[0.9rem] font-semibold">FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI</h1>
                                <p class="text-[0.8rem] font-semibold">OFFICIAL GRADE REPORT</p>
                            </div>
                        </div>


                        <div class="flex items-center gap-16 text-[0.63rem]">
                            <div>
                                <p>School of Student: SICT</p>
                                <p>Department: COMPUTER SCIENCE</p>
                                <p>Title of Course: {{ result.course.title.toUpperCase() }}</p>
                                <p>School Offering Course: SICT</p>
                            </div>

                            <div>
                                <p>Semester: {{ route.params.semester }}</p>
                                <p>Session: {{ route.params.session.split('-').join('/') }}</p>
                                <div class="flex items-center gap-5">
                                    <p>Course Code: {{ result.course.code }}</p>
                                    <p>Units: {{ result.course.unit }}</p>
                                </div>
                                <p>Date: {{ useDate(result.approvalDate) }}</p>
                            </div>
                        </div>

                        <div class="mt-4">
                            <div class="h-[190mm]">
                                <table class="table-bordered text-[0.63rem] w-full">
                                    <thead class="text-center">
                                        <tr>
                                            <th>SN</th>
                                            <th>NAMES</th>
                                            <th>REG. NO.</th>
                                            <th>PROGRAM</th>
                                            <th>TEST</th>
                                            <th>LAB</th>
                                            <th>EXAM</th>
                                            <th>TOTAL</th>
                                            <th>GRADE</th>
                                            <th>RMK</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr v-for="(student, i) in group" :key="student._id" class="text-center">
                                            <td>{{ (index * 40) + i + 1 }}</td>
                                            <td class="text-left uppercase">{{ student.name }}</td>
                                            <td>{{ student.regNumber }}</td>
                                            <td>CSC</td>
                                            <td>{{ student.testScore }}</td>
                                            <td v-if="result.course.hasPractical">{{ student.labScore ?? '-' }}</td>
                                            <td v-else></td>
                                            <td>{{ student.examScore }}</td>
                                            <td>{{ student.totalScore }}</td>
                                            <td>{{ student.grade }}</td>
                                            <td>{{ student.remark }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>


                            <div class="text-[0.63rem] grid grid-cols-3 mt-7">
                                <div class="border-t-2 border-t-black grid place-content-center">Head of Department
                                </div>
                                <div class="border-t-2 border-t-black grid place-content-center mt-5">Dean of School
                                </div>
                                <div class="border-t-2 border-t-black grid place-content-center">Examiner(s)</div>
                            </div>

                            <div class="ml-auto mt-4 text-[0.63rem] w-80 border-2 border-black px-4">
                                <p class="text-center">Grading System:</p>
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p>70% and Above: A</p>
                                        <p>60% - 69%: B</p>
                                        <p>50% - 59%: C</p>
                                    </div>
                                    <div>
                                        <p>45% - 49%: D</p>
                                        <p>40% - 44%: E</p>
                                        <p>Below 40%: F</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-1 text-right text-[0.63rem] italic">page {{ index + 1 }}</div>
                    </div>

                    <div
                        class="result-ogr bg-white text-slate-700 rounded p-5 pb-10 md:gap-2 w-[210mm] h-[297mm] border-2">
                        <div class="flex items-center  gap-2 shrink-0">
                            <img src="../../assets/images/futo-log.png" alt="futo-logo"
                                class="w-12 h-auto shrink-0 mb-4">
                            <div class="mx-auto flex flex-col items-center justify-center">
                                <h1 class="text-[0.9rem] font-semibold">FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI</h1>
                                <p class="text-[0.8rem] font-semibold">OFFICIAL GRADE REPORT</p>
                            </div>
                        </div>


                        <div class="flex items-center gap-16 text-[0.63rem]">
                            <div>
                                <p>School of Student: SICT</p>
                                <p>Department: COMPUTER SCIENCE</p>
                                <p>Title of Course: {{ result.course.title.toUpperCase() }}</p>
                                <p>School Offering Course: SICT</p>
                            </div>

                            <div>
                                <p>Semester: {{ route.params.semester }}</p>
                                <p>Session: {{ route.params.session.split('-').join('/') }}</p>
                                <div class="flex items-center gap-5">
                                    <p>Course Code: {{ result.course.code }}</p>
                                    <p>Units: {{ result.course.unit }}</p>
                                </div>
                                <p>Date: {{ '' }}</p>
                            </div>
                        </div>

                        <div class="mt-4">
                            <div class="h-[190mm]">
                                <h1 class="font-semibold text-[0.8rem]">SUMMARY</h1>
                                <div>
                                    <table class="table-bordered text-[0.63rem] w-1/2">
                                        <thead>
                                            <tr>
                                                <th>Grade</th>
                                                <th>Number of Students</th>
                                                <th>Grade Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody class="text-center">
                                            <tr>
                                                <td>A</td>
                                                <td>{{ numberOfGrades.gradeA }}</td>
                                                <td>{{ percentageGrades.pA }}%</td>
                                            </tr>
                                            <tr>
                                                <td>B</td>
                                                <td>{{ numberOfGrades.gradeB }}</td>
                                                <td>{{ percentageGrades.pB }}%</td>
                                            </tr>
                                            <tr>
                                                <td>C</td>
                                                <td>{{ numberOfGrades.gradeC }}</td>
                                                <td>{{ percentageGrades.pC }}%</td>
                                            </tr>
                                            <tr>
                                                <td>D</td>
                                                <td>{{ numberOfGrades.gradeD }}</td>
                                                <td>{{ percentageGrades.pD }}%</td>
                                            </tr>
                                            <tr>
                                                <td>E</td>
                                                <td>{{ numberOfGrades.gradeE }}</td>
                                                <td>{{ percentageGrades.pE }}%</td>
                                            </tr>
                                            <tr>
                                                <td>F</td>
                                                <td>{{ numberOfGrades.gradeF }}</td>
                                                <td>{{ percentageGrades.pF }}%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="text-[0.63rem] grid grid-cols-3 mt-7">
                                <div class="border-t-2 border-t-black grid place-content-center">Head of Department
                                </div>
                                <div class="border-t-2 border-t-black grid place-content-center mt-5">Dean of School
                                </div>
                                <div class="border-t-2 border-t-black grid place-content-center">Examiner(s)</div>
                            </div>

                            <div class="ml-auto mt-4 text-[0.63rem] w-80 border-2 border-black px-4">
                                <p class="text-center">Grading System:</p>
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p>70% and Above: A</p>
                                        <p>60% - 69%: B</p>
                                        <p>50% - 59%: C</p>
                                    </div>
                                    <div>
                                        <p>45% - 49%: D</p>
                                        <p>40% - 44%: E</p>
                                        <p>Below 40%: F</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-1 text-right text-[0.63rem] italic">page {{ paginatedStudents.length + 1 }}</div>
                    </div>
                </div> -->
            </template>
        </Card>
    </main>

    <main v-else class="h-full flex items-center justify-center">
        <Message severity="info" :closable="false" class="max-w-[30rem]">There are no approved results for this course
            yet</Message>
    </main>
</template>

<style>
@media print {

    body {
        visibility: hidden;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    .print-content {
        overflow: visible;
        display: grid;
        break-inside: avoid;
        visibility: visible;
        border-radius: 0;
        border: 0;
        box-shadow: none;
        padding: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 210mm;
        height: 297mm;
    }

    .result-ogr {
        break-inside: avoid;
        visibility: visible;
        border-radius: 0;
        border: 0;
        box-shadow: none;
        width: 210mm;
        height: 297mm;
    }

    title {
        display: none;
    }

}
</style>