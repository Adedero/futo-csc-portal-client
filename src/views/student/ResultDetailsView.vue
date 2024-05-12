<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { formatGPA } from '@/composables/use-gpa'
import Card from 'primevue/card';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const toast = useToast();

let result = ref(await getStudentResult(route.params.id))

async function getStudentResult(id) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/student/single-result?id=${id}`, { credentials: 'include' });
        const data = await res.json();
        console.log(data);
        if (res.status === 200) {
            return data;
        }
        toast.add({
            severity: 'error',
            summary: data.info,
            detail: data.message,
            life: 5000
        });
        return {}
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error,
            life: 5000
        });
    }
}

function print() {
    window.print();
}
</script>

<template>
    <Toast class="w-80 md:w-[30rem]" />
    <main class="w-dvw md:w-full h-full p-5 overflow-y-scroll">
        <Card>
            <template #title>
                <div class="flex items-center justify-between">
                    <h1>{{ `${result.session.split('-').join('/')} ${result.semester} Result` }}</h1>
                    <Button @click="print" label="Print" />
                </div>
                <Message :closable="false">Unoffical result. For personal use only.</Message>
            </template>

            <template #content>
                <div class="student-result-container text-black overflow-scroll lg:flex lg:justify-center">
                    <div class="result border-2 w-[210mm] h-fit shrink-0 px-10 py-20">
                        <header class="text-center">
                            <h1 class="text-lg font-bold">FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI</h1>
                            <p class="font-semibold">UNOFFICIAL STUDENT'S RESULT</p>
                        </header>

                        <div class="subheader mt-16 grid grid-cols-2 gap-3 text-sm font-semibold">

                            <div class="col-span-2 grid grid-cols-4 gap-3">
                                <p class="col-span-2 p-1 border border-black">NAME OF STUDENT</p>
                                <p class="col-span-2 p-1 border border-black">{{ result.student.name }}</p>
                            </div>
                            <div class="border border-black grid grid-cols-2">

                                <p class="p-1 border-b border-b-black border-r border-r-black">REG. NO.</p>
                                <p class="p-1 border-b border-b-black">{{ result.student.regNumber }}</p>
                                <p class="p-1 border-b border-b-black border-r border-r-black">SESSION</p>
                                <p class="p-1 border-b border-b-black">{{ result.session.split('-').join('/') }}</p>
                                <p class="p-1 border-r border-r-black">SEMESTER</p>
                                <p class="p-1">{{ result.semester }}</p>
                            </div>

                            <div class="border border-black grid grid-cols-2">
                                <p class="p-1 border-b border-b-black border-r border-r-black">SCHOOL</p>
                                <p class="p-1 border-b border-b-black">SICT</p>
                                <p class="p-1 border-b border-b-black border-r border-r-black">DEPARTMENT</p>
                                <p class="p-1 border-b border-b-black">CSC</p>
                                <p class="p-1 border-r border-r-black">YEAR</p>
                                <p class="p-1">{{ result.year }}</p>
                            </div>
                        </div>

                        <div class="table-container mt-10">
                            <table class="table-bordered w-full text-sm">
                                <thead>
                                    <th class="p-2">COURSE CODE</th>
                                    <th class="p-2">UNITS</th>
                                    <th class="p-2">LAB</th>
                                    <th class="p-2">TEST</th>
                                    <th class="p-2">EXAM</th>
                                    <th class="p-2">TOTAL</th>
                                    <th class="p-2">GRADE</th>
                                    <th class="p-2">GRADE POINT</th>
                                    <th class="p-2">REMARK</th>
                                </thead>
                                <tbody>
                                    <tr v-for="course in result.courses" :key="course._id" class="text-center">
                                        <td class="p-2 text-left">{{ course.code }}</td>
                                        <td class="p-2">{{ course.unit }}</td>
                                        <td class="p-2">
                                            {{ !course.hasPractical ? 'N/A' : course.labScore ?? '-' }}
                                        </td>
                                        <td class="p-2">{{ course.testScore ?? '-' }}</td>
                                        <td class="p-2">{{ course.examScore ?? '-' }}</td>
                                        <td class="p-2">{{ course.totalScore ?? '-' }}</td>
                                        <td class="p-2">{{ course.grade }}</td>
                                        <td class="p-2">{{ course.gradePoints ?? 0 }}</td>
                                        <td class="p-2">{{ course.remark }}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div class="summary border grid grid-cols-3 text-sm border-black p-3 mt-10">
                                <div class="flex items-center gap-2">
                                    <p>TOTAL GRADE POINTS:</p>
                                    <p class="font-semibold">{{ result.totalGradePoints }}</p>
                                </div>

                                <div class="flex items-center gap-2">
                                    <p>TOTAL UNITS:</p>
                                    <p class="font-semibold">{{ result.totalUnits }}</p>
                                </div>

                                <div class="flex items-center gap-2">
                                    <p>GPA:</p>
                                    <p class="font-semibold">{{ formatGPA(result.GPA) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </template>
        </Card>
    </main>
</template>

<style>
.student-result-container {
    height: calc(100dvh - 20rem);
}

@media screen and (min-width: 312px) {
    .student-result-container {
        height: calc(100dvh - 19.5rem)
    }
}

@media screen and (min-width: 432px) {
    .student-result-container {
        height: calc(100dvh - 18rem)
    }
}

@media print {

    body {
        visibility: hidden;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    .student-result-container {
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
    }

    .result {
        break-inside: avoid;
        visibility: visible;
        border-radius: 0;
        border: 0;
        box-shadow: none;
        width: 210mm;
    }

    title {
        display: none;
    }

}
</style>