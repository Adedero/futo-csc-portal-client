<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Card from 'primevue/card';
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast';
import Divider from 'primevue/divider';


//Constants
const router = useRouter()
const route = useRoute()
const toast = useToast()


let result = ref(await getExistingResult())

async function getExistingResult() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/staff/result-to-edit?resultId=${route.params.resultId}`, {
            credentials: 'include'
        })
        const data = await response.json()
        //console.log(data)
        if (response.status == 200) {
            return data
        }
        useToast.addEventListener({
            severity: 'error',
            summary: data.info,
            details: data.message,
            life: 5000
        })
        return {}
    } catch (error) {
        console.error(error)
    }
}


//Computes the total from test, lab and exam scores
function studentTotal(student) {
    let total = 0
    let testScore = parseFloat(student.testScore) || 0;
    let labScore = parseFloat(student.labScore) || 0;
    let examScore = parseFloat(student.examScore) || 0;

    if (result.value.course.hasPractical) {

        total = testScore + labScore + examScore
        student.totalScore = total
    } else {
        total = testScore + examScore
        student.totalScore = total
    }
    return total
}
//Computes the grade from the total score
function studentGrade(student) {
    let total = studentTotal(student)
    if (total < 40 || (result.value.course.hasPractical && !student.labScore)) {
        student.grade = "F"
        return "F"
    }
    if (total >= 40 && total <= 44) {
        student.grade = "E"
        return "E"
    }
    if (total >= 45 && total <= 49) {
        student.grade = "D"
        return "D"
    }
    if (total >= 50 && total <= 59) {
        student.grade = "C"
        return "C"
    }
    if (total >= 60 && total <= 69) {
        student.grade = "B"
        return "B"
    }
    if (total >= 70) {
        student.grade = "A"
        return "A"
    }

    return ""
}
//Computes the remark from the grade
function studentRemark(student) {
    let grade = studentGrade(student)
    if (grade == "F") {
        student.remark = "FAIL"
        return "FAIL"
    }

    if (grade == 'E' || grade == 'D' || grade == 'C' || grade == 'B' || grade == 'A') {
        student.remark = "PASS"
        return "PASS"
    }

    return ""
}

function saveInput(student) {
    const localStorageKey = `result_${result.value.course.code.split('-').join('')}`;
    const storedData = JSON.parse(localStorage.getItem(localStorageKey)) || { course: result.value.course.code, students: [] };

    // Check if the student already exists in the stored data
    const existingStudentIndex = storedData.students.findIndex(item => item.studentId === student.studentId);

    if (existingStudentIndex !== -1) {
        // If the student exists, update the existing record
        storedData.students[existingStudentIndex].testScore = student.testScore;
        storedData.students[existingStudentIndex].labScore = student.labScore;
        storedData.students[existingStudentIndex].examScore = student.examScore;
    } else {
        // If the student doesn't exist, add a new record
        const newRecord = {
            studentId: student.studentId,
            testScore: student.testScore,
            labScore: student.labScore,
            examScore: student.examScore,
        };

        storedData.students.push(newRecord);
    }

    localStorage.setItem(localStorageKey, JSON.stringify(storedData));

    // Optionally, you can show a success message using the toast
    toast.add({ severity: 'success', summary: 'Success', detail: 'Saved', life: 2000 });
}


//saves the result
let loading = ref(false)
async function saveEdit() {
    loading.value = true
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/staff/save-result-edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(result.value)
        })

        const data = await response.json()
        //console.log(data)
        if (response.status === 200) {
            toast.add({ severity: 'success', summary: 'Success', detail: 'Result updated successfully', life: 3000 })
            localStorage.removeItem(`result_${result.value.course.code.split('-').join('')}`)
            setTimeout(() => {
                router.push({
                    name: 'result-ogr',
                    params: {
                        staffId: result.value.staffId,
                        session: result.value.session,
                        semester: result.value.semester,
                        level: result.value.level,
                        course: result.value.course.code.split(' ').join('-')
                    }
                })
            }, 3000);
            return
        }
        return toast.add({ severity: 'error', summary: data.info, detail: data.message, life: 5000 })
    } catch (error) {
        console.error(error)
        toast.add({ severity: 'error', summary: 'Error', detail: error })
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    // Retrieve and display saved results from local storage when the page loads
    const localStorageKey = `result_${result.value.course.code.split('-').join('')}`;
    const storedData = JSON.parse(localStorage.getItem(localStorageKey));

    if (storedData) {
        // Iterate through the stored student records
        storedData.students.forEach((storedStudent) => {
            const matchingStudent = result.value.students.find(student => student.studentId === storedStudent.studentId);

            if (matchingStudent) {
                // Update the student record with the saved data
                Object.assign(matchingStudent, storedStudent);
            }
        });
    }
});

//Makes sure only numbers are input
function sanitize(event) {
    if (event.target.value === 'string' || event.target.value === "") {
        event.target.value = event.target.value.slice(0, -1)
    }
}
</script>

<template>
    <Toast class="w-[70dvw] md:max-w-96" />
    <main class="w-full h-full overflow-y-scroll">
        <section class="p-5 w-full h-full">
            <Card class="w-full">
                <template #title>{{ result.course.code }}</template>
                <template #subtitle>
                    <div class="flex items-center flex-wrap">
                        <p>{{ result.course.title }}</p>
                        <Divider layout="vertical" />
                        <p>{{ result.course.unit }} Units</p>
                    </div>
                </template>
                <template #content>
                    <div style="height: calc(100dvh - 19rem)" class="table-container overflow-scroll">
                        <table class="table-edit">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Reg. Number</th>
                                    <th class="w-16 text-center">Test</th>
                                    <th v-if="result.course.hasPractical" class="w-24 text-center">Practical</th>
                                    <th class="w-16 text-center">Exam</th>
                                    <th class="w-16 text-center">Total</th>
                                    <th class="w-16 text-center">Grade</th>
                                    <th class="w-16 text-center">Remark</th>
                                    <th class="w-16"></th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr v-for="student in result.students" :key="student._id">
                                    <td>{{ student.name }}</td>
                                    <td>{{ student.regNumber }}</td>
                                    <td>
                                        <input v-model="student.testScore" class="result-input" type="number"
                                            @input="sanitize">
                                    </td>
                                    <td v-if="result.course.hasPractical">
                                        <input v-model="student.labScore" class="result-input" type="number"
                                            @input="sanitize">
                                    </td>
                                    <td>
                                        <input v-model="student.examScore" class="result-input" type="number"
                                            @input="sanitize">
                                    </td>
                                    <td>
                                        <input :value="studentTotal(student)" readonly
                                            class="outline-none w-full h-8 p-2 bg-transparent">
                                    </td>
                                    <td>
                                        <input :value="studentGrade(student)" readonly
                                            class="outline-none w-full h-8 p-2 bg-transparent" type="text">
                                    </td>
                                    <td>
                                        <input :value="studentRemark(student)" readonly
                                            class="outline-none w-full h-8  p-2 bg-transparent" type="text">
                                    </td>
                                    <td>
                                        <Button @click=saveInput(student) label="Save" class="h-8" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>
                <template #footer>
                    <div class="mt-1">
                        <Button label="Done" @click="saveEdit" :loading="loading" :disabled="!result.students.length" />
                    </div>
                </template>
            </Card>
        </section>

    </main>
</template>

<style>
.result-input {
    outline: none;
    border: 1px solid var(--surface-300);
    min-width: 3rem;
    width: 100%;
    height: 2rem;
    padding: 0.5rem;
    border-radius: 4px;
    transition: border .3s ease;
    text-align: center;
}

.result-input:hover {
    border: 1px solid var(--surface-400)
}

.result-input:focus {
    border: 1px solid var(--primary-color)
}
</style>