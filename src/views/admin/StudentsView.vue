<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useInfiniteScroll } from "@vueuse/core"

import { states } from '@/data/states'

import VTab from '@/components/VTab.vue'

import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputMask from 'primevue/inputmask'
import Dropdown from 'primevue/dropdown'
import InputGroup from 'primevue/inputgroup';
import Sidebar from 'primevue/sidebar';
import Panel from 'primevue/panel';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from "primevue/useconfirm";
import Skeleton from 'primevue/skeleton';
import Calendar from 'primevue/calendar'



import AdminStudentListLoader from '@/components/AdminStudentListLoader.vue'

const $router = useRouter()

const toast = useToast();
const confirm = useConfirm();

let loading = ref(false)

let visible = ref(false)

let listOfClasses = ref([])

let classDetails = ref(null)

let listEl = ref(null)

let studentsLoading = ref(false)

let errorLoadingStudents = ref(false)

let students = ref(await getStudents(20, 0))

let searchedStudents = ref([])

let newStudent = ref({
    name: '',
    regNumber: '',
    entryMode: '',
    role: 'STUDENT'
})

let username = computed(() => newStudent.value.regNumber)
let password = computed(() => newStudent.value.regNumber)


let entryModes = ['UTME', 'DE', 'JUPEB']

let searchByValue = ref(null)
let valueToSearch = ref(null)
let searchCriteria = ['Name', 'Reg. Number']
let studentSearchLoading = ref(false)

async function getAllClasses() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/student-classes`, {
            credentials: 'include'
        })
        const data = await res.json()
        listOfClasses.value = data
    } catch (error) {
        console.log(error)
    }
}

async function addStudent() {
    let isWarningShown = false;
    newStudent.value.username = username.value;
    newStudent.value.password = password.value;

    console.log(newStudent.value)

    for (let key in newStudent.value) {

        if (typeof newStudent.value[key] === 'string') {
            const originalValue = newStudent.value[key];
            newStudent.value[key] = originalValue.trim();

            if (originalValue !== '' && newStudent.value[key] === '' && !isWarningShown) {
                toast.add({ severity: 'warn', summary: 'Empty Values', detail: 'Required or optional fields cannot contain empty spaces.', life: 5000 });
                isWarningShown = true;
            }
        }
    }

    let className = classDetails.value.className
    loading.value = true
    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/add-student`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
        },
            credentials: 'include',
            body: JSON.stringify({ ...newStudent.value, className })
        })
    const data = await res.json()
    console.log(data)
    if (data.info) {
        toast.add({ severity: 'warn', summary: data.info, detail: data.message, life: 5000 })
        return
    }

    if (data.success) {
        toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })

        students.value = await getStudents(20, 0)

        classDetails.value = null
        newStudent.value.name = ''
        newStudent.value.regNumber = ''
        newStudent.entryMode = ''
        newStudent.value.email = null
        newStudent.value.phoneNumber = null
        newStudent.value.dateOfBirth = null
        newStudent.value.nationality = null
        newStudent.value.sex = null
        newStudent.value.stateOfOrigin = null
    }
} catch (error) {
    toast.add({ severity: 'error', summary: 'Error adding student', detail: error, life: 5000 });
    console.log(error)
} finally {
    loading.value = false
}
}

async function getStudents(max, omit) {
    studentsLoading.value = true
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/admin/students?limit=${max}&skip=${omit}`, {
            credentials: 'include'
        })
        const data = await response.json()
        errorLoadingStudents.value = false
        /* data.sort((a, b) => {
            // Compare by year first
            if (a.classId.currentLevel !== b.classId.currentLevel) {
                return a.classId.currentLevel - b.classId.currentLevel;
            }

            // If currentLevels are equal, compare by name
            return a.name.localeCompare(b.name);
        }); */
        return data
    } catch (error) {
        console.error(error);
        errorLoadingStudents.value = true
    } finally {
        studentsLoading.value = false
    }
}

async function getMoreStudents() {
    const additionalStudents = await getStudents(20, students.value.length)
    students.value.push(...additionalStudents)
    /* students.value.sort((a, b) => {
        if (a.classId.currentLevel !== b.classId.currentLevel) {
            return a.classId.currentLevel - b.classId.currentLevel;
        }
        return a.name.localeCompare(b.name);
    }) */
}

async function searchStudents() {
    visible.value = true;
    studentSearchLoading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/search-students?criteria=${searchByValue.value}&value=${valueToSearch.value}`, {
            credentials: 'include'
        })
        const data = await res.json()
        searchedStudents.value = data
        return data
    } catch (error) {
        console.error(error)
        toast.add({ severity: 'error', summary: 'Error searching students. Try again', detail: error, life: 5000 });
    } finally {
        studentSearchLoading.value = false
    }

}


useInfiniteScroll(
    listEl,
    async () => {
        await getMoreStudents();
    },
    { distance: 10 }
);

function pageReload() {
    window.location.reload()
}

const confirmDelete = (student) => {
    confirm.require({
        message: 'This student and all their related details will be removed from the database. \nAre you sure you want to proceed? \nThis cannot be undone.',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Cancel',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Delete',
        accept: () => {
            deleteStudent(student)
        }
    });
};

async function deleteStudent(student) {
    student.loading = true;
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/delete-student/${student.userId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        const data = await res.json()
        if (data.success) {
            toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })

            students.value = students.value.filter((item) => item.userId !== student.userId)

            searchedStudents.value = searchedStudents.value.filter((item) => item.userId !== student.userId)
        }
        return
    } catch (error) {
        console.error(error)
    } finally {
        student.loading = false
    }
}

function goToProfile(student) {

    $router.push({
        name: 'student-profile',
        params: {
            id: student._id
        }
    })
}

onMounted(() => {
    //Gets list of students

    //Populates the list of classes
    getAllClasses()
})

let passwordVisible = ref(false)

const passwordIcon = computed(() => {
    return passwordVisible.value ? 'pi pi-eye-slash' : 'pi pi-eye'
})


</script>

<template>
    <main class="w-full h-full md:flex overflow-y-scroll">
        <Toast class="w-[70dvw] md:w-72" />
        <ConfirmDialog class="max-w-[30rem]"></ConfirmDialog>
        <section class="flex flex-col gap-3 h-full md:w-[40%] lg:w-96 overflow-x-hidden p-5 overflow-y-scroll">
            <Card class="flex-grow md:flex-grow-0 h-fit overflow-y-scroll overflow-x-hidden">
                <template #title>New Student</template>
                <template #content>
                    <div class="flex flex-col gap-3">

                        <p class="text-[--red-500] font-medium text-sm">Required Fields</p>

                        <div class="w-full">
                            <label class="text-sm font-semibold">Name</label>
                            <InputText v-model="newStudent.name" placeholder="Full Name" class="w-full" />
                        </div>

                        <div class="w-full">
                            <label class="text-sm font-semibold">Reg. Number</label>
                            <InputMask v-model="newStudent.regNumber" mask="99999999999" placeholder="Reg. Number"
                                class="w-full" />
                        </div>

                        <div class="w-full">
                            <label class="text-sm font-semibold">Student Class</label>
                            <Dropdown v-model="classDetails" :options="listOfClasses" optionLabel="className"
                                placeholder="Class" class="w-full" />
                        </div>

                        <div class="w-full">
                            <label class="text-sm font-semibold">Entry Mode</label>
                            <Dropdown v-model="newStudent.entryMode" :options="entryModes"
                                placeholder="Select entry mode" class="w-full" />
                        </div>

                        <div class="w-full">
                            <label class="text-sm font-semibold">Username</label>
                            <InputText :value="username" placeholder="Username" class="w-full" />
                        </div>


                        <div class="relative w-full">
                            <label class="text-sm font-semibold">Password</label>
                            <input :value="password" class="v-password w-full"
                                :type="passwordVisible ? 'text' : 'password'" placeholder="Password" />
                            <span @click="passwordVisible = !passwordVisible"
                                :class="[passwordIcon, 'text-[--surface-400] absolute top-9 right-3']"></span>
                        </div>

                        <v-tab header="Optional Fields">
                            <div class="flex flex-col gap-3">

                                <div class="w-full">
                                    <label class="text-sm font-semibold">Email</label>
                                    <InputText v-model="newStudent.email" placeholder="Email" class="w-full" />
                                </div>

                                <div class="w-full">
                                    <label class="text-sm font-semibold">Phone</label>
                                    <InputMask v-model="newStudent.phoneNumber" mask="09099999999"
                                        placeholder="Phone Number" class="w-full" />
                                </div>

                                <div class="w-full">
                                    <label class="text-sm font-semibold">Date of Birth</label>
                                    <Calendar v-model="newStudent.dateOfBirth" placeholder="Date of Birth"
                                        date-format="dd/mm/yy" class="w-full" />
                                </div>

                                <div class="w-full">
                                    <label class="text-sm font-semibold">Nationality</label>
                                    <InputText v-model="newStudent.nationality" placeholder="Nationality"
                                        class="w-full" />
                                </div>

                                <div class="w-full">
                                    <label class="text-sm font-semibold">Sex</label>
                                    <Dropdown v-model="newStudent.sex" :options="['MALE', 'FEMALE']"
                                        placeholder="Select Sex" class="w-full" />
                                </div>

                                <div class="w-full">
                                    <label class="text-sm font-semibold">State of Origin</label>
                                    <Dropdown v-model="newStudent.stateOfOrigin" :options="states"
                                        placeholder="State of Origin" class="w-full" />
                                </div>

                            </div>
                        </v-tab>

                        <Button @click="addStudent" label="Add" :loading="loading"
                            :disabled="newStudent.name === '' || newStudent.regNumber === '' || username === '' || password === '' || newStudent.entryMode === ''" />
                    </div>
                </template>
            </Card>

            <!-- <Card class="h-40">
                <template #title>Settings</template>
                <template #content>
                    <div>
                        <p class="text-sm font-semibold text-[--red-500]">Delete all students</p>
                        <Button label="Delete" severity="danger" outlined class="w-full mt-1" />
                    </div>
                </template>
            </Card> -->
        </section>

        <section class="h-full w-full md:w-[60%] lg:flex-grow overflow-x-hidden p-5 relative">
            <Card class="h-full">
                <template #title>
                    <div class="flex gap-2 items-center">
                        <h1>Students</h1>
                        <p class="text-sm font-bold">
                            <span class="text-[--primary-color]">{{ students.length }}</span> out of <span>{{
                                students.length }}</span>
                        </p>
                    </div>
                </template>
                <template #content>
                    <div class="h-full mt-5">
                        <div class="flex items-center -mt-5 gap-3 pb-3">
                            <Dropdown v-model="searchByValue" :options="searchCriteria" placeholder="Search by" />
                            <InputGroup class="max-w-72">
                                <InputText v-model="valueToSearch" placeholder="Search" />
                                <Button @click="searchStudents" icon="pi pi-search" severity="primary"
                                    :disabled="searchByValue === null || valueToSearch === null || valueToSearch.trim() === '' || searchByValue.trim() === ''"
                                    :loading="studentSearchLoading" />
                            </InputGroup>
                        </div>

                        <div ref="listEl" class="overflow-y-auto overflow-x-hidden"
                            style="height: calc(100dvh - 15.2rem)">
                            <div v-if="!studentsLoading" class="list">
                                <Panel v-for="student in students" :key="student._id" class="cursor-context-menu">
                                    <template #header>
                                        <div class="flex items-center gap-2">
                                            <img v-if="student.imageURL" :src="student.imageURL" alt="student"
                                                class="w-9 aspect-square rounded-full object-cover object-center">

                                            <img v-else src="../../assets/images/user.jpg" alt="student"
                                                class="w-9 aspect-square rounded-full object-cover object-center">
                                            <span class="font-bold">{{ student.name }}</span>
                                        </div>
                                    </template>

                                    <template #icons>
                                        <div class="flex items-center gap-2 flex-nowrap">
                                            <Button @click="goToProfile(student)" icon="pi pi-user-edit" rounded text
                                                title="Edit student profile" />

                                            <Button @click="confirmDelete(student)" icon="pi pi-trash" severity="danger"
                                                rounded text title="Delete student" :loading="student.loading" />
                                        </div>

                                    </template>

                                    <div class="flex items-center flex-wrap gap-2 justify-between text-sm -mt-3">
                                        <div
                                            class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] py-1 px-3 rounded-full">
                                            <p>Reg. Number: <span class="font-bold">{{ student.regNumber }}</span></p>
                                        </div>

                                        <div
                                            class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] py-1 px-3 rounded-full">
                                            <p>Level: <span class="font-bold">{{ student.classId.currentLevel }}</span>
                                            </p>
                                        </div>

                                        <div
                                            class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] py-1 px-3 rounded-full">
                                            <p>Class: <span class="font-bold">{{ student.classId.className }}</span></p>
                                        </div>
                                    </div>

                                </Panel>
                            </div>


                            <div v-if="studentsLoading" class="flex flex-col gap-3">
                                <AdminStudentListLoader />
                                <AdminStudentListLoader />
                                <AdminStudentListLoader />
                                <AdminStudentListLoader />
                            </div>

                            <Panel v-if="errorLoadingStudents" class="bg-red-500">
                                <template #header>
                                    <div class="flex items-center gap-2 text-white">
                                        <span class="material-symbols-rounded">error</span>
                                        <span class="font-medium md:text-lg">Failed to load students.</span>
                                        <Button @click="pageReload" class="text-white border-white" outlined
                                            label="Try again." />
                                    </div>
                                </template>
                            </Panel>
                        </div>
                    </div>
                </template>
            </Card>

            <Sidebar v-model:visible="visible" position="right" header="Results" class="md:w-[28rem]">
                <div v-if="searchByValue === searchCriteria[0]">
                    <div>
                        <p>Name: <span class="font-bold">{{ valueToSearch }}</span></p>
                        <p class="flex items-center gap-2">Results found: <span
                                class="font-bold text-[--primary-color]">{{
                                    searchedStudents.length }}</span> </p>
                    </div>
                </div>

                <div v-if="searchByValue === searchCriteria[1]">
                    <div>
                        <p>Reg. Number: <span class="font-bold">{{ valueToSearch }}</span></p>
                        <p class="flex items-center gap-2">Results found: <span
                                class="font-bold text-[--primary-color]">{{
                                    searchedStudents.length }}</span> </p>
                    </div>
                </div>

                <div v-if="!studentSearchLoading" class="flex flex-col gap-3 mt-1 cursor-context-menu">

                    <div v-for="student in searchedStudents"
                        class="py-2 px-3 bg-white shadow mt-2 rounded-lg flex flex-col gap-1 overflow-hidden border">
                        <p class="font-bold text-lg">{{ student?.name ?? '' }}</p>
                        <p class="font-medium text-[--surface-500]">{{ student?.regNumber ?? '' }}</p>

                        <div class="flex items-center gap-2 justify-end">
                            <Button @click="goToProfile(student)" text icon="pi pi-user-edit" />
                            <Button @click="confirmDelete(student)" text icon="pi pi-trash" severity="danger" />
                        </div>
                    </div>
                </div>

                <div v-else class="flex flex-col gap-3 mt-2">
                    <Card v-for="i in 3" :key="i">
                        <template #content>
                            <Skeleton height="1.2rem" border-radius="50px"></Skeleton>
                            <Skeleton class="mt-3" width="10rem" height="0.8rem" border-radius="50px"></Skeleton>
                        </template>
                    </Card>
                </div>

            </Sidebar>

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

/* .password {
    position: relative
}

.password::after {
    content: "";
    position: absolute;
    background-color: white;
    width: 2rem;
    height: 100%;
    right: -1.3rem;
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    border-left: 0;
    border-right: 1px solid var(--surface-300);
    border-top: 1px solid var(--surface-300);
    border-bottom: 1px solid var(--surface-300);
    transition: border .3s;
}

.password:hover:after {
    border-right: 1px solid var(--surface-400);
    border-top: 1px solid var(--surface-400);
    border-bottom: 1px solid var(--surface-400);
}

.password:focus-within:after {
    border-right: 1px solid var(--primary-color);
    border-top: 1px solid var(--primary-color);
    border-bottom: 1px solid var(--primary-color);
} */
</style>