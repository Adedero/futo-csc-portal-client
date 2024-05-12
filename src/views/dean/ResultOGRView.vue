<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import ResultOGR from '@/components/ResultOGR.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

let result = ref(await getResultForOGR())

async function getResultForOGR() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/dean/result-ogr?resultId=${route.params.resultId}`, {
            credentials: 'include'
        })
        const data = await response.json()
        console.log(data)
        if (response.status == 200) {
            data.students.sort((a, b) => a.name.localeCompare(b.name))
            return data
        } else {
            router.push({ name: 'hod-results' })
        }
    } catch (error) {
        console.error(error)
    }
}

const paginatedStudents = computed(() => {
    const students = result.value.students;
    const pageSize = 40;
    const pageCount = Math.ceil(students.length / pageSize);

    const paginatedArray = Array.from({ length: pageCount }, (_, index) => {
        const start = index * pageSize;
        const end = start + pageSize;
        return result.value.students.slice(start, end);
    });
    return paginatedArray;
});

//Computes the number of students who got A, B, C, D, E, and F
const numberOfGrades = computed(() => {
    const gradeA = result.value.students.filter(student => student.grade.toLowerCase() === "a").length
    const gradeB = result.value.students.filter(student => student.grade.toLowerCase() === "b").length
    const gradeC = result.value.students.filter(student => student.grade.toLowerCase() === "c").length
    const gradeD = result.value.students.filter(student => student.grade.toLowerCase() === "d").length
    const gradeE = result.value.students.filter(student => student.grade.toLowerCase() === "e").length
    const gradeF = result.value.students.filter(student => student.grade.toLowerCase() === "f").length
    return { gradeA, gradeB, gradeC, gradeD, gradeE, gradeF }
})
//Computes the grade percentage
const percentageGrades = computed(() => {
    const pA = Math.round(((numberOfGrades.value.gradeA / result.value.students.length) * 100) * 100) / 100
    const pB = Math.round(((numberOfGrades.value.gradeB / result.value.students.length) * 100) * 100) / 100
    const pC = Math.round(((numberOfGrades.value.gradeC / result.value.students.length) * 100) * 100) / 100
    const pD = Math.round(((numberOfGrades.value.gradeD / result.value.students.length) * 100) * 100) / 100
    const pE = Math.round(((numberOfGrades.value.gradeE / result.value.students.length) * 100) * 100) / 100
    const pF = Math.round(((numberOfGrades.value.gradeF / result.value.students.length) * 100) * 100) / 100
    return { pA, pB, pC, pD, pE, pF }
})

function printDetails() {
    window.print()
}

//APPROVING OR DISAPPROVING A RESULT
let approveResultLoading = ref(false)

async function approveResult() {
    approveResultLoading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/hod/approve-result/${route.params.resultId}`, {
            method: 'PUT',
            credentials: 'include'
        })
        const data = await res.json()
        //console.log(data)
        if (res.status === 200) {
            result.isApprovedByHOD = true
            toast.add({ severity: 'success', summary: 'Approved', detail: data.message, life: 5000 })
        }
    } catch (error) {
        console.error(error)
    } finally {
        approveResultLoading.value = false
    }
}

let disapproveResultLoading = ref(false)

async function disapproveResult(result) {
    disapproveResultLoading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/hod/disapprove-result/${route.params.resultId}`, {
            method: 'PUT',
            credentials: 'include'
        })
        const data = await res.json()
        //console.log(data)
        if (res.status === 200) {
            result.isApprovedByHOD = false
            toast.add({ severity: 'warn', summary: 'Disapproved', detail: data.message, life: 5000 })
        }
    } catch (error) {
        console.error(error)
    } finally {
        disapproveResultLoading.value = false
    }
}
</script>

<template>
    <Toast class="w-80 md:max-w-[30rem]" />
    <main class="w-full h-full md:flex overflow-y-scroll p-5">
        <Card class="overflow-scroll">
            <template #title>
                <div class="flex gap-3 justify-between item-center max-w-[210mm]">
                    <h1>{{ result.course.code }} OGR</h1>
                    <div class="flex gap-4">
                        <Button v-if="result.isApprovedByHOD" @click="disapproveResult" severity="secondary"
                            label="Disapprove" />
                        <Button v-else @click="approveResult" label="Approve" />
                        <Button @click="printDetails" text icon="pi pi-print" label="Print" />
                    </div>
                </div>
            </template>

            <template #content>
                <ResultOGR :paginated-students="paginatedStudents" :result="result" :number-of-grades="numberOfGrades"
                    :percentage-grades="percentageGrades" />

            </template>
        </Card>
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