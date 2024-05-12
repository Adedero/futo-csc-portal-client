<script setup>
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

import Card from 'primevue/card'
import Menu from 'primevue/menu'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import InputMask from 'primevue/inputmask'
import Password from 'primevue/password'
import Panel from 'primevue/panel'
import ConfirmDialog from 'primevue/confirmdialog';
import VTab from '@/components/VTab.vue'
import Dialog from 'primevue/dialog';
import Sidebar from 'primevue/sidebar';
import { useConfirm } from "primevue/useconfirm";
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

let readonly = ref(true)

//Gets classDetails and list of students in class
async function getClassDetails() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/class-profile/${route.params.id}`, {
            credentials: 'include'
        })
        const data = await res.json()
        //console.log(data)
        if (res.status === 200) {
            data.students.sort((a, b) => a.name.localeCompare(b.name))
            return data
        }
    } catch (error) {
        console.log(error)
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
    }
}

//Getting the class details onMounted
let classDetails = ref(await getClassDetails())
let advisor = ref(null)


let model = ref({ ...classDetails.value.studentClass })
let originalClass = ref({ ...model.value })
//Editing class details
let editLoading = ref(false)
function toggleEdit() {
    if (!readonly.value) {
        model.value = { ...classDetails.value.studentClass }
    }

    readonly.value = !readonly.value

}

function checkEditFields() {
    // Check for empty or null/undefined values
    if (!model.value.className || !model.value.enrolmentYear || !model.value.currentLevel) {
        return true
    }

    // Check if the course being edited has not changed
    for (let key in model.value) {
        if (originalClass.value[key] != model.value[key]) {
            return false; // If any value is different, return false
        }
    }

    return true; // All values are either empty or unchanged
}

//Saves the edit
async function saveClassEdit() {
    if (model.value.isActive && model.value.currentLevel > 500) {
        return toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Current level of an active class cannot be greater than 500',
            life: 5000
        })
    }

    if (!model.value.isActive && model.value.currentLevel <= 500) {
        return toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Current level of an inactive class cannot be less than 500',
            life: 5000
        })
    }

    editLoading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/update-class/${route.params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(model.value)
        })
        const data = await res.json()
        if (data.info) {
            return toast.add({ severity: 'error', summary: data.info, detail: data.message, life: 5000 })
        }

        if (data.success) {
            readonly.value = true
            toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })
            console.log(data)
            model.value = data.updatedClass
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
        console.log(error)
    } finally {
        editLoading.value = false
    }
}

function validateFields() {
    const firstYear = parseInt(model.value.className.split('-')[0])
    const secondYear = parseInt(model.value.className.split('-')[1])

    if (firstYear >= secondYear || secondYear - firstYear !== 1) {
        return toast.add({ severity: 'warn', summary: 'Invalid Input', detail: `${model.value.className} is not a valid class name`, life: 5000 })
    }

    /* if (model.value.currentLevel > 500) {
        return toast.add({ severity: 'warn', summary: 'Invalid Input', detail: `${model.value.currentLevel} is not a valid level`, life: 5000 })
    } */

    saveClassEdit()
}



//Change Advisor
let isEditingAdvisor = ref(false)
let changeAdvisorLoading = ref(false)

async function changeAdvisor() {
    const classId = route.params.id
    const staffId = advisor.value._id

    changeAdvisorLoading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/change-advisor`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ classId: classId, staffId: staffId })
        })
        const data = await res.json()
        console.log(data)
        if (res.status === 200) {
            classDetails.value.studentClass.advisor = data.newAdvisor
            toast.add({ severity: 'success', summary: 'Success', detail: data.message, life: 5000 })
            isEditingAdvisor.value = false
        }
    } catch (error) {
        console.log(error)
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
    } finally {
        changeAdvisorLoading.value = false
    }
}

const confirmChangeAdvisor = () => {
    confirm.require({
        message: `${ advisor.value.name } is already an advisor.This action would remove them from the old class and add them to the new class.Proceed ? `,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Cancel',
        acceptLabel: 'Proceed',
        accept: () => {
            changeAdvisor();
        }
    });
}

function checkAdvisor() {
    if (classDetails.value.studentClass.advisor._id === advisor.value._id) {
        return
    }

    if (advisor.value.isAdvisor) {
        return confirmChangeAdvisor()
    } else {
        changeAdvisor()
    }
}

//Add advisor
let isAddingAdvisor = ref(false)

function checkNewAdvisor() {
    if (advisor.value.isAdvisor) {
        return confirmChangeAdvisor()
    } else {
        changeAdvisor()
    }
}



//The Student Options

//Searching students in a class
let visible = ref(false)
let searchByValue = ref(null)
let valueToSearch = ref(null)
let searchCriteria = ['Name', 'Reg. Number']
let searchedStudents = ref([])

function searchStudents() {
    visible.value = true;

    if (searchByValue.value === searchCriteria[0]) {

        searchedStudents.value = classDetails.value.students.filter((student) => student.name.toLowerCase().includes(valueToSearch.value.toLowerCase()))
        return
    }

    if (searchByValue.value === searchCriteria[1]) {

        searchedStudents.value = classDetails.value.students.filter((student) => student.regNumber.toLowerCase().includes(valueToSearch.value.toLowerCase()))
        return
    }

    return
}

function viewAdvisorProfile(id) {
    router.push({
        name: 'staff-profile',
        params: {
            id: id
        }
    })
}

function viewStudentProfile(id) {
    router.push({
        name: 'student-profile',
        params: {
            id: id
        }
    })
}

//Adding a single student
let isVisible = ref(false)
let newStudentLoading = ref(false)

let newStudent = ref({
    name: '',
    regNumber: '',
    classId: classDetails.value.studentClass._id,
    username: '',
    password: '',
    entryMode: '',
    role: 'STUDENT',
    email: '',
    phoneNumber: '',
})

let entryModes = ['UTME', 'Direct Entry', 'JUPEB']

watchEffect(() => {
    newStudent.value.username = newStudent.value.regNumber;
    newStudent.value.password = newStudent.value.regNumber;
});

async function addStudent() {
    let isWarningShown = false;

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

    newStudentLoading.value = true

    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/class-add-student`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
        },
            credentials: 'include',
            body: JSON.stringify(newStudent.value)
        })

    const data = await res.json()

    if (data.info) {
        toast.add({ severity: 'warn', summary: data.info, detail: data.message, life: 5000 })
        return
    }

    if (data.success) {
        toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })

        isVisible.value = false
        classDetails.value.students.push(data.newStudent)
        classDetails.value.students.sort((a, b) => a.name.localeCompare(b.name))

        newStudent.value.name = ''
        newStudent.value.regNumber = ''
        newStudent.value.username = '',
            newStudent.value.password = '',
            newStudent.value.entryMode = '',
            newStudent.value.email = '',
            newStudent.value.phoneNumber = ''
    }
} catch (error) {
    toast.add({ severity: 'error', summary: 'Error adding student', detail: error, life: 5000 });
    console.log(error)
} finally {
    newStudentLoading.value = false
}
}

function checkNewStudentFields() {
    if (newStudent.value.name.trim() == '' || newStudent.value.regNumber == '' || newStudent.value.username.trim() == '' || newStudent.value.password.trim() == '' || newStudent.value.entryMode == '') {
        return true
    }
}

//Uploading classlist
let uploadVisible = ref(false)
let uploading = ref(false)

const menu = ref();
const optionItems = ref([
    {
        label: 'Class List',
        items: [
            {
                label: 'Upload',
                icon: 'pi pi-file-import',
                command: () => {
                    uploadVisible.value = true
                }
            },
            {
                label: 'Download',
                icon: 'pi pi-file-export',
                command: () => {
                    downloadClassList()
                }
            }
        ]
    }
]);

const toggleOptions = (event) => {
    menu.value.toggle(event);
}

let file = ref(null)
let label = ref(null)

function onSelect(event) {
    file.value = event.target.files[0]
    label.value.style.padding = 0
    label.value.style.height = 0
}

async function upload() {
    if (!file.value) {
        return toast.add({ severity: 'warn', summary: 'Invalid Input', detail: 'No file selected', life: 5000 })
    }
    uploading.value = true

    const formData = new FormData()

    formData.append("file", file.value)

    console.log(formData)

    try {
        const res = await axios.post(`${import.meta.env.VITE_API}/admin/upload-classlist/${route.params.id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
        });

        const data = res.data;

        if (res.status === 200) {

            if (data.addedStudents.length > 0) {
                toast.add({ severity: 'success', summary: 'Success', detail: data.message, life: 5000 })
                classDetails.value.students = classDetails.value.students.concat(data.addedStudents)
                classDetails.value.students.sort((a, b) => a.name.localeCompare(b.name))
            }

            if (data.duplicates.length > 0) {
                toast.add({ severity: 'warn', summary: `${data.duplicates.length} duplicates found` })
                data.duplicates.forEach(duplicate => {
                    toast.add({
                        severity: 'warn',
                        summary: 'Duplicate Entry',
                        detail: `${duplicate.name} already exists in the database`,
                    })
                })
            }
        }

        if (res.status === 400) {
            toast.add({ severity: 'warn', summary: data.info, detail: data.message, life: 5000 })
        }

        console.log(data)
    } catch (error) {
        console.error(error);
    } finally {
        uploading.value = false
        uploadVisible.value = false
    }
}

async function downloadClassList() {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API}/admin/download-classlist/${route.params.id}`, {
            responseType: 'arraybuffer',
            withCredentials: true,
        })

        const data = res.data

        if (res.status === 404) {
            toast.add({ severity: 'warn', summary: data.info, detail: data.message, life: 5000 })
        }

        if (res.status === 200) {
            const blob = new Blob(
                [data],
                { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
            )

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `classlist-${route.params.id}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.add({ severity: 'success', summary: 'Class list downloaded', life: 3000 })
        }
    } catch (error) {
        console.error(error)
    }
}

</script>

<template>
    <Toast class="w-[70dvw] md:w-72" />
    <ConfirmDialog class="max-w-[30rem]"></ConfirmDialog>
    <Dialog v-model:visible="isVisible" modal header="Add student" class="max-w-[26rem] h-[32rem]">
        <span class="text-red-500 text-sm font-medium block mb-3">Required fields.</span>
        <div class="flex flex-col align-items-center gap-1 mb-3">
            <label for="name" class="font-semibold text-sm">Name</label>
            <InputText id="name" v-model="newStudent.name" />
        </div>
        <div class="flex flex-col align-items-center gap-1 mb-3">
            <label for="regNumber" class="font-semibold ext-sm">Reg. Number</label>
            <InputMask id="regNumber" v-model="newStudent.regNumber" mask="99999999999" />
        </div>
        <div class="flex flex-col align-items-center gap-1 mb-3">
            <label for="entryMode" class="font-semibold ext-sm">Entry Mode</label>
            <Dropdown id="entryMode" v-model="newStudent.entryMode" :options="entryModes"
                placeholder="Select entry mode" />
        </div>
        <div class="flex flex-col align-items-center gap-1 mb-3">
            <label for="username" class="font-semibold ext-sm">Username</label>
            <InputText id="username" v-model="newStudent.username" />
        </div>
        <div class="flex flex-col align-items-center gap-1 mb-3">
            <label for="password" class="font-semibold ext-sm">Password</label>
            <Password id="password" v-model="newStudent.password" toggle-mask :feedback="false" />
        </div>

        <div class="mb-3">
            <v-tab header="More">
                <span class="text-[--primary-color] text-sm font-medium block mb-3">Optional fields.</span>

                <div class="flex flex-col align-items-center gap-1 mb-3">
                    <label for="email" class="font-semibold ext-sm">Email</label>
                    <InputText id="email" v-model="newStudent.email" />
                </div>
                <div class="flex flex-col align-items-center gap-1 mb-3">
                    <label for="phoneNumber" class="font-semibold ext-sm">Phone Number</label>
                    <InputMask id="phoneNumber" v-model="newStudent.phoneNumber" mask="09099999999" />
                </div>
            </v-tab>
        </div>

        <div class="flex justify-content-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="isVisible = false"></Button>
            <Button type="button" label="Save" :loading="newStudentLoading" @click="addStudent"
                :disabled="checkNewStudentFields()"></Button>
        </div>
    </Dialog>

    <Dialog v-model:visible="uploadVisible" modal header="Upload class list" class="w-80 md:w-96">
        <div>
            <p class="text-red-500 font-medium mb-3">Only excel (.xls, .xlsx) files are allowed.</p>

            <label ref="label" for="excel"
                class="overflow-hidden bg-[--primary-color] p-[0.6rem] gap-x-2 rounded-[--border-radius] flex flex-wrap items-center justify-center text-white cursor-pointer hover:bg-[--primary-700] transition-colors">
                <span class="pi pi-file-import"></span>
                <p>Upload</p>
                <input id="excel" class="opacity-0 w-full h-0" type="file" accept=".xlsx" name="file" @input="onSelect">
            </label>

            <Button v-if="file" @click="upload" type="submit" icon="pi pi-upload" :label="file?.name"
                class="mt-3 w-full" />

        </div>

    </Dialog>
    <main class="w-full h-full lg:flex overflow-y-scroll">
        <section class="h-full w-dvw md:w-full p-5">
            <Card class="w-full h-full overflow-y-scroll  overflow-x-hidden">
                <template #content>
                    <Card>
                        <template #title>
                            <div class="flex items-center justify-between">
                                <h1>Class: {{ classDetails.studentClass.className }}</h1>
                                <Button @click="toggleEdit" severity="primary" outlined rounded
                                    :icon="readonly ? 'pi pi-file-edit' : 'pi pi-times'"
                                    :title="readonly ? 'Edit class details' : 'Cancel edit'" />
                            </div>
                        </template>
                        <template #content>
                            <div class="class-form">
                                <div class="flex flex-col gap-1 mt-2">
                                    <label class="font-bold text-sm" for="className">Class Name</label>
                                    <InputMask v-model="model.className" id="className" :disabled="readonly"
                                        mask="9999-9999" />
                                </div>

                                <div class="flex flex-col gap-1 mt-2">
                                    <label class="font-bold text-sm" for="enrolmentYear">Year of Enrolment</label>
                                    <InputMask v-model="model.enrolmentYear" id="enrolmentYear" :disabled="readonly"
                                        mask="9999" />
                                </div>

                                <div class="flex flex-col gap-1 mt-2">
                                    <label class="font-bold text-sm" for="currentLevel">Current Level</label>
                                    <InputMask v-model="model.currentLevel" id="currentLevel" :disabled="readonly"
                                        mask="999" />
                                </div>

                                <div class="flex flex-col gap-1 mt-2">
                                    <label class="font-bold text-sm" for="status">Status</label>
                                    <ToggleButton v-model="model.isActive" id="status" :disabled="readonly"
                                        onLabel="Active" offLabel="Graduated" />
                                </div>

                                <Button v-if="!readonly" @click="validateFields" class="mt-5 w-full" label="Submit"
                                    :loading="editLoading" :disabled="checkEditFields()" />
                            </div>

                        </template>
                    </Card>

                    <div class="left-bottom w-full gap-5 mt-5">
                        <Card class="">
                            <template #title>
                                <div class="flex items-center justify-between">
                                    <h1>Class Advisor</h1>
                                    <Button @click="isEditingAdvisor = !isEditingAdvisor" outlined
                                        :icon="isEditingAdvisor ? 'pi pi-times' : 'pi pi-user-edit'" rounded />
                                </div>
                            </template>
                            <template #content>
                                <div v-if="!classDetails.studentClass.advisor || classDetails.studentClass.advisor == null"
                                    class="flex flex-col gap-3 items-center justify-center">
                                    <h1 class="text-lg font-bold text-[--surface-500]">No Advisor</h1>

                                    <div v-if="isAddingAdvisor" class="w-full flex flex-col gap-3 mt-2">
                                        <label class="font-bold text-sm" for="newClassAdvisor">Add Class Advisor</label>

                                        <Dropdown v-model="advisor" id="newClassAdvisor" :options="classDetails.staff"
                                            optionLabel="name" />

                                        <Button :loading="changeAdvisorLoading" @click="checkNewAdvisor" label="Add"
                                            :disabled="!advisor" />
                                    </div>

                                    <Button class="w-full" @click="isAddingAdvisor = !isAddingAdvisor"
                                        :icon="isAddingAdvisor ? '' : 'pi pi-user-plus'"
                                        :label="isAddingAdvisor ? 'Cancel' : 'Add'"
                                        :severity="isAddingAdvisor ? 'secondary' : 'primary'" />
                                </div>

                                <div v-else>
                                    <div v-if="!isEditingAdvisor" class="flex items-center gap-2 flex-wrap">
                                        <img v-if="classDetails.studentClass.advisor.imageURL"
                                            :src="classDetails.studentClass.advisor.imageURL" alt="advisor"
                                            class="w-24 aspect-square object-fill rounded-md">

                                        <img v-else src="../../assets/images/user.jpg" alt="advisor"
                                            class="w-24 aspect-square object-fill rounded-md">

                                        <div class="h-24 flex flex-col justify-between">
                                            <h1 class="text-lg font-bold">{{ classDetails.studentClass.advisor.name }}
                                            </h1>
                                            <p>Staff ID: <span class="font-bold">
                                                    {{ classDetails.studentClass.advisor.staffId }}
                                                </span></p>
                                            <Button @click="viewAdvisorProfile(classDetails.studentClass.advisor._id)"
                                                label="View profile" />
                                        </div>
                                    </div>

                                    <div v-else class="flex flex-col gap-3 mt-2">
                                        <label class="font-bold text-sm" for="classAdvisor">Change Class Advisor</label>
                                        <Dropdown v-model="advisor" id="classAdvisor" :options="classDetails.staff"
                                            optionLabel="name" />

                                        <Button :loading="changeAdvisorLoading" @click="checkAdvisor" label="Change"
                                            :disabled="!advisor" />
                                    </div>
                                </div>

                            </template>
                        </Card>

                        <Card class="mt-5 md:mt-0">
                            <template #title>Settings</template>
                            <template #content>
                                <div class="flex flex-col justify-between">
                                    <h1 class="text-red-500 font-bold">Delete Class</h1>
                                    <p class="text-sm">Delete this class and all its students.</p>
                                    <Button class="mt-2" severity="danger" outlined label="Delete" />
                                </div>
                            </template>
                        </Card>
                    </div>

                </template>
            </Card>

        </section>

        <section class="h-full w-full p-5 lg:max-w-[32rem] overflow-x-hidden">
            <Card class="h-full">
                <template #title>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <h1>Students</h1>
                            <p class="text-[--primary-color]">{{ classDetails.students.length }}</p>
                        </div>

                        <div class="flex items-center gap-2">
                            <Button @click="isVisible = true" icon="pi pi-plus" rounded title="Add student"
                                type="button" />

                            <Button text rounded type="button" icon="pi pi-ellipsis-v" @click="toggleOptions" />

                            <Menu ref="menu" :model="optionItems" :popup="true" />
                        </div>
                    </div>
                </template>
                <template #content>
                    <div class="flex items-center gap-3 pb-3">
                        <Dropdown v-model="searchByValue" :options="searchCriteria" placeholder="Search by" />
                        <InputGroup class="max-w-72">
                            <InputText v-model="valueToSearch" placeholder="Search" />
                            <Button @click="searchStudents" icon="pi pi-search" severity="primary"
                                :disabled="searchByValue === null || valueToSearch === null || valueToSearch.trim() === '' || searchByValue.trim() === ''" />
                        </InputGroup>
                    </div>

                    <div style="height: calc(100dvh - 16.5rem)" class="flex flex-col gap-3 overflow-y-scroll">
                        <Panel v-for="student in classDetails.students" class="cursor-context-menu">
                            <template #header>
                                <div class="flex items-center gap-2 w-[68%]">
                                    <img v-if="student.imageURL" :src="student.imageURL" alt="student"
                                        class="w-9 aspect-square rounded-full object-cover object-center">

                                    <img v-else src="../../assets/images/user.jpg" alt="student"
                                        class="w-9 aspect-square rounded-full object-cover object-center">
                                    <span class="w-[100%] font-bold" title="name">{{ student.name }}</span>
                                </div>
                            </template>

                            <template #icons>
                                <Button size="small" @click="viewStudentProfile(student._id)" icon="pi pi-user" text
                                    label="Profile" />
                            </template>

                            <div
                                class="ml-10 -mt-4 bg-[--highlight-bg] text-[--highlight-text-color] py-1 px-3 rounded-full w-max">
                                <p class="text-sm font-bold">{{ student.regNumber }}</p>
                            </div>
                        </Panel>
                    </div>

                    <div v-if="false" class="flex flex-col items-center justify-center gap-3 mt-5">
                        <img class="w-32 opacity-50" src="../../assets/images/empty-folder.png">
                        <h1 class="text-3xl font-bold opacity-50">No Students</h1>
                        <Button type="button" label="Import Excel File" icon="pi pi-file-import" />
                    </div>
                </template>
            </Card>
        </section>

        <Sidebar v-model:visible="visible" position="right" header="Results" class="md:w-[28rem]">
            <div v-for="criteria in searchCriteria">
                <div v-if="searchByValue === criteria">
                    <p>{{ searchByValue }}: <span class="font-bold">{{ valueToSearch }}</span></p>
                    <p class="flex items-center gap-2">Results found: <span class="font-bold text-[--primary-color]">{{
                        searchedStudents.length }}</span> </p>
                </div>
            </div>

            <div class="flex flex-col gap-3 mt-1 cursor-context-menu">

                <div v-for="student in searchedStudents"
                    class="py-2 px-3 bg-white shadow mt-2 rounded-lg flex flex-col gap-1 overflow-hidden border">
                    <p class="font-bold text-lg">{{ student.name }}</p>
                    <p class="font-medium text-[--surface-500]">{{ student.regNumber }}</p>

                    <div class="flex items-center gap-2 justify-end">
                        <Button @click="viewStudentProfile(student._id)" text label="Profile" icon="pi pi-user" />
                    </div>
                </div>
            </div>

        </Sidebar>

    </main>
</template>

<style scoped>
.class-form {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(48%, 1fr));
    gap: 0.75rem;
    align-items: end;
}

.left-bottom {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(48%, 1fr));
}
</style>