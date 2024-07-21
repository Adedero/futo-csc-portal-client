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


let records = ref([])
let courseToInput = ref({})

async function getRegisteredStudents() {
    const { staffId, session, semester, level, course } = route.params
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/staff/resgistered-students?staffId=${staffId}&session=${session}&semester=${semester}&level=${level}&course=${course}`, {
            credentials: 'include'
        })
        const data = await response.json()
        //console.log(data)
        if (response.status == 200) {
            if (data.info) {
                router.push({ name: 'result-ogr', })
            } else {
                if (data.records.length === 0) {
                    toast.add({ severity: 'info', summary: 'Info', detail: 'No students have registered for this course yet.' })
                }
                data.records.sort((a, b) => a.name.localeCompare(b.name))
                records.value = data.records
                courseToInput.value = data.course
            }
        }
    } catch (error) {
        console.error(error)
    }
}

//Creates a new result
let newResult = ref({
    staffId: route.params.staffId,
    session: route.params.session,
    semester: route.params.semester,
    level: parseInt(route.params.level),
    students: []
})

//Computes the total from test, lab and exam scores
function studentTotal(student) {
    let total = 0
    let testScore = parseFloat(student.testScore) || 0;
    let labScore = parseFloat(student.labScore) || 0;
    let examScore = parseFloat(student.examScore) || 0;

    if (courseToInput.value.hasPractical) {

        total = testScore + labScore + examScore
        student.total = total
        return total
    } else {
        total = testScore + examScore
        student.total = total
        return total
    }
}
//Computes the grade from the total score
function studentGrade(student) {
    let total = studentTotal(student)
    if (total < 40 || (courseToInput.value.hasPractical && !student.labScore)) {
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


//Saving result input 
/* function saveInput(student) {
    const studentId = student._id;

    // Create an entry for the student in local storage
    const localStorageKey = `studentResult_${studentId}`;

    // Prepare the data to be saved
    const savedData = {
        testScore: student.testScore,
        labScore: student.labScore,
        examScore: student.examScore,
        // Add any other relevant data you want to save
    };

    // Save the data to local storage
    localStorage.setItem(localStorageKey, JSON.stringify(savedData));

    // Optionally, you can show a success message using the toast
    toast.add({ severity: 'success', summary: 'Success', detail: 'Student result saved successfully', life: 3000 });
} */
function saveInput(student) {
    const localStorageKey = `result_${courseToInput.value._id}`;
    const storedData = JSON.parse(localStorage.getItem(localStorageKey)) || { course: courseToInput.value.code, students: [] };

    // Check if the student already exists in the stored data
    const existingStudentIndex = storedData.students.findIndex(item => item.studentId === student._id);

    if (existingStudentIndex !== -1) {
        // If the student exists, update the existing record
        storedData.students[existingStudentIndex].testScore = student.testScore;
        storedData.students[existingStudentIndex].labScore = student.labScore;
        storedData.students[existingStudentIndex].examScore = student.examScore;
    } else {
        // If the student doesn't exist, add a new record
        const newRecord = {
            studentId: student._id,
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

/* function saveInput(student) {

    const studentId = student._id;

    // Create an entry for the student in local storage
    const localStorageKey = `studentResult_${studentId}`;

    // Retrieve existing saved data from local storage
    const existingData = localStorage.getItem(localStorageKey);
    const savedData = existingData ? JSON.parse(existingData) : {};

    // Check if there are changes in the scores
    const isTestScoreChanged = student.testScore !== savedData.testScore;
    const isLabScoreChanged = student.labScore !== savedData.labScore;
    const isExamScoreChanged = student.examScore !== savedData.examScore;

    // If no changes, exit the function
    if (!isTestScoreChanged && !isLabScoreChanged && !isExamScoreChanged) {
        return;
    }

    // Update the original scores to track changes
    student.originalTestScore = student.testScore;
    student.originalLabScore = student.labScore;
    student.originalExamScore = student.examScore;

    // Prepare the data to be saved
    const updatedData = {
        testScore: student.testScore,
        labScore: student.labScore,
        examScore: student.examScore,
        // Add any other relevant data you want to save
    };

    // Save the updated data to local storage
    localStorage.setItem(localStorageKey, JSON.stringify(updatedData));

    // Optionally, you can show a success message using the toast
    toast.add({ severity: 'success', summary: 'Success', detail: 'Saved', life: 2000 });
} */

//Adds the result
async function addResult() {
    const studentRecords = records.value.map((record) => {
        return {
            studentId: record._id,
            studentClassId: record.classId._id,
            regNumber: record.regNumber,
            name: record.name,
            testScore: record.testScore,
            labScore: record.labScore,
            examScore: record.examScore,
            totalScore: record.total,
            grade: record.grade,
            remark: record.remark,
            year: record.year,
        }
    })
    newResult.value.course = {
        code: courseToInput.value.code,
        title: courseToInput.value.title,
        unit: courseToInput.value.unit,
        level: courseToInput.value.level,
        schoolOfferingCourse: courseToInput.value.schoolOfferingCourse,
        isElective: courseToInput.value.isElective,
        hasPractical: courseToInput.value.hasPractical
    }
    newResult.value.students = studentRecords
    console.log(newResult.value)
    //Send newResult to the database

    try {
        const response = await fetch(`${import.meta.env.VITE_API}/staff/save-result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(newResult.value)
        })

        const data = await response.json()
        console.log(data)
        if (response.status === 200) {
            toast.add({ severity: 'success', summary: 'Success', detail: 'Result saved successfully', life: 3000 })
            localStorage.removeItem(`result_${courseToInput.value._id}`)
            router.push({ name: 'result-ogr' })
        }

    } catch (error) {
        console.error(error)
    }
}

/* onMounted(() => {
    getRegisteredStudents()

    for (const student of records.value) {
        const localStorageKey = `studentResult_${ student._id }`;
        const savedData = localStorage.getItem(localStorageKey);

        if (savedData) {
            const parsedData = JSON.parse(savedData);
            student.testScore = parsedData.testScore;
            student.labScore = parsedData.labScore;
            student.examScore = parsedData.examScore;
        }
    }
}) */
onMounted(async () => {
    await getRegisteredStudents();

    // Retrieve and display saved results from local storage when the page loads
    const localStorageKey = `result_${courseToInput.value._id}`;
    const storedData = JSON.parse(localStorage.getItem(localStorageKey));

    if (storedData) {
        // Iterate through the stored student records
        storedData.students.forEach((storedStudent) => {
            const matchingStudent = records.value.find(student => student._id === storedStudent.studentId);

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
                <template #title>{{ courseToInput.code }}</template>
                <template #subtitle>
                    <div class="flex items-center flex-wrap">
                        <p>{{ courseToInput.title }}</p>
                        <Divider layout="vertical" />
                        <p>{{ courseToInput.unit }} Units</p>
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
                                    <th v-if="courseToInput.hasPractical" class="w-24 text-center">Practical</th>
                                    <th class="w-16 text-center">Exam</th>
                                    <th class="w-16 text-center">Total</th>
                                    <th class="w-16 text-center">Grade</th>
                                    <th class="w-16 text-center">Remark</th>
                                    <th class="w-16"></th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr v-for="student in records" :key="student._id">
                                    <td>{{ student.name }}</td>
                                    <td>{{ student.regNumber }}</td>
                                    <td>
                                        <input v-model="student.testScore" class="result-input" type="number"
                                            @input="sanitize">
                                    </td>
                                    <td v-if="courseToInput.hasPractical">
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
                                        <Button @click="saveInput(student)" label="Save" class="h-8" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>
                <template #footer>
                    <div class="mt-1">
                        <Button label="Done" @click="addResult" :disabled="!records.length" />
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