<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import Card from 'primevue/card'
import Button from 'primevue/button';
import InputMask from 'primevue/inputmask';
import ToggleButton from 'primevue/togglebutton';
import Dropdown from 'primevue/dropdown';
import InputGroup from 'primevue/inputgroup';
import Sidebar from 'primevue/sidebar';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast';

//Constants
const router = useRouter()
const toast = useToast()
const confirm = useConfirm();

let loading = ref(false)


//Initial data
let studentClasses = ref([])
let staff = ref([])
//Gets the initial data needed to populate the list of classes and list of staff
async function getClassesAndStaff() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/classes-and-staff`, {
            credentials: 'include'
        })
        const data = await res.json()
        //console.log(data)
        if (res.status === 200) {
            studentClasses.value = data.studentClasses
            studentClasses.value.sort((a, b) => a.currentLevel - b.currentLevel)
            staff.value = data.staff
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
        console.log(error)
    }
}

onMounted(() => getClassesAndStaff())

//Adding a new class
//needed data
let newClass = reactive({
    className: '',
    currentLevel: '',
    isActive: true,
})
let classAdvisor = ref(null)

let enrolmentYear = computed(() => {
    return newClass.className.split('-')[0]
})



async function addClass() {

    if (newClass.isActive && newClass.currentLevel > 500) {
        return toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Current level of an active class cannot be greater than 500',
            life: 5000
        })
    }

    if (!newClass.isActive && newClass.currentLevel <= 500) {
        return toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Current level of an inactive class cannot be less than 500',
            life: 5000
        })
    }

    const staffId = classAdvisor.value?._id ?? null

    newClass.enrolmentYear = enrolmentYear.value

    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/add-class`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
        },
            credentials: 'include',
            body: JSON.stringify({ ...newClass, staffId: staffId })
        })
    const data = await res.json()
    if (data.info) {
        return toast.add({ severity: 'error', summary: data.info, detail: data.message, life: 5000 })
    }

    if (data.success) {
        toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })
        //studentClasses.value.push(data.newClass)
        //studentClasses.value.sort((a, b) => b.currentLevel - a.currentLevel)

        newClass.className = ''
        newClass.currentLevel = ''

        getClassesAndStaff()


        /* if (classAdvisor.value !== null) {
            classAdvisor.value.isAdvisor = true
        } */

    }
} catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
    console.log(error)
}
}

const confirmChangeAdvisor = () => {
    confirm.require({
        message: `${classAdvisor.value.name} is already an advisor. This action would remove them from the old class and add them to the new class. Proceed?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Cancel',
        acceptLabel: 'Save',
        accept: () => {
            addClass();
        }
    });
}

//edits class details
function goToProfile(studentClass) {
    router.push({ name: 'class-profile', params: { id: studentClass._id } })
}

//asks user to confirm before delete
function confirmDelete(studentClass) {
    return
}

//searching through classes
let visible = ref(false)
let searchByValue = ref(null)
let valueToSearch = ref(null)
let searchCriteria = ['Class Name', 'Enrolment Year', 'Current Level', 'Advisor']
let searchedClasses = ref([])

function searchClasses() {
    visible.value = true;

    if (searchByValue.value === searchCriteria[0]) {

        searchedClasses.value = studentClasses.value.filter((item) => item.className.toLowerCase().includes(valueToSearch.value.toLowerCase()))
        return
    }

    if (searchByValue.value === searchCriteria[1]) {

        searchedClasses.value = studentClasses.value.filter((item) => item.enrolmentYear.toLowerCase().includes(valueToSearch.value.toLowerCase()))
        return
    }

    if (searchByValue.value === searchCriteria[2]) {

        searchedClasses.value = studentClasses.value.filter((item) => item.level == valueToSearch.value);
        return;
    }

    if (searchByValue.value === searchCriteria[3]) {

        searchedClasses.value = studentClasses.value.filter((item) => item.advisor && item.advisor.name.toLowerCase().includes(valueToSearch.value.toLowerCase()))
        return
    }
}

//Validation
//Checks field for adding new class
function checkFields() {
    if (newClass.className === '' || enrolmentYear.value === '' || newClass.currentLevel === '') {
        return true
    }
    return false
}

function validateFields() {
    const firstYear = parseInt(newClass.className.split('-')[0])
    const secondYear = parseInt(newClass.className.split('-')[1])

    if (firstYear >= secondYear || secondYear - firstYear !== 1) {
        return toast.add({ severity: 'warn', summary: 'Invalid Input', detail: `${newClass.className} is not a valid class name`, life: 5000 })
    }

    if (newClass.currentLevel > 500) {
        return toast.add({ severity: 'warn', summary: 'Invalid Input', detail: `${newClass.currentLevel} is not a valid level`, life: 5000 })
    }

    if (classAdvisor.value?.isAdvisor) {
        return confirmChangeAdvisor()
    }

    addClass()
}

</script>

<template>
    <ConfirmDialog class="max-w-[30rem]"></ConfirmDialog>
    <Toast class="w-[70dvw] md:w-72" />
    <main class="w-full h-full md:flex overflow-y-scroll">
        <section class="p-5 h-full w-full md:w-[40%] lg:w-96 overflow-x-hidden">
            <Card class="h-full overflow-y-scroll overflow-x-hidden">
                <template #title>New Class</template>
                <template #content>
                    <div class="flex flex-col gap-3">

                        <p class="text-[--red-500] font-medium text-sm">Required Fields</p>

                        <div class="flex flex-col gap-1 mt-2">
                            <label class="font-bold text-sm" for="className">Class Name</label>
                            <InputMask id="className" v-model="newClass.className" placeholder="Class Name"
                                mask="9999-9999" />
                        </div>
                        <div class="flex flex-col gap-1 mt-2">
                            <label class="font-bold text-sm" for="enrolmentYear">Year of Enrolment</label>
                            <InputMask :readonly="true" id="enrolmentYear" :model-value="enrolmentYear"
                                placeholder="Year of Enrolment" mask="9999" />
                        </div>

                        <div class="flex flex-col gap-1 mt-2">
                            <label class="font-bold text-sm" for="currentLevel">Current Level</label>
                            <InputMask id="currentLevel" v-model="newClass.currentLevel" placeholder="Current Level"
                                mask="999" />
                        </div>

                        <div class="flex flex-col gap-1 mt-2">
                            <label class="font-bold text-sm" for="status">Status</label>
                            <ToggleButton id="status" v-model="newClass.isActive" onLabel="Active"
                                offLabel="Graduated" />
                        </div>

                        <div class="flex flex-col gap-1 mt-2">
                            <label class="font-bold text-sm" for="classAdvisor">Class Advisor <span
                                    class="text-xs text-[--primary-color]">optional</span></label>
                            <Dropdown id="classAdvisor" v-model="classAdvisor" :options="staff" optionLabel="name"
                                placeholder="Select an Advisor" />
                        </div>

                        <Button @click="validateFields" class="mt-2" label="Add" :loading="loading"
                            :disabled="checkFields()" />
                    </div>
                </template>
            </Card>
        </section>

        <section class="p-5 h-full w-full md:w-[60%] lg:flex-grow overflow-x-hidden">
            <Card class="h-full">
                <template #title>
                    <div class="flex gap-2 items-center">
                        <h1>Classes:</h1>
                        <p class="font-bold text-[--primary-color]">{{ studentClasses.length }}</p>
                    </div>
                </template>
                <template #content>
                    <div class="h-full mt-5">
                        <div class="flex items-center -mt-5 gap-3 pb-3">
                            <Dropdown v-model="searchByValue" :options="searchCriteria" placeholder="Search by" />
                            <InputGroup class="max-w-72">
                                <InputText v-model="valueToSearch" placeholder="Search" />
                                <Button @click="searchClasses" icon="pi pi-search" severity="primary"
                                    :disabled="searchByValue === null || valueToSearch === null || valueToSearch.trim() === '' || searchByValue.trim() === ''" />
                            </InputGroup>
                        </div>

                        <div class="overflow-y-scroll" style="height: calc(100dvh - 15.2rem)">

                            <div class="list">
                                <Panel v-for="studentClass in studentClasses" :key="studentClass._id"
                                    class="cursor-context-menu">
                                    <template #header>
                                        <div class="flex items-center gap-2 flex-wrap">
                                            <Avatar :label="studentClass.className.split('-')[0]"
                                                class="mr-2 text-sm font-bold" size="large"
                                                style="background-color: #ece9fc; color: #2a1261" shape="circle" />
                                            <span class="font-bold md:text-lg">{{ studentClass.className }}</span>
                                        </div>
                                    </template>

                                    <template #icons>
                                        <div class="flex items-center gap-2 flex-nowrap">
                                            <Button @click="goToProfile(studentClass)" icon="pi pi-file-edit" rounded
                                                text title="Edit class details" />

                                            <Button @click="confirmDelete(studentClass)" icon="pi pi-trash"
                                                severity="danger" rounded text title="Delete class" />
                                        </div>

                                    </template>

                                    <div class="flex items-center flex-wrap gap-2 justify-between text-sm">
                                        <p class="w-full text-base">Advisor: <span class="font-bold">{{
                                            studentClass.advisor?.name ?? '' }}</span>
                                        </p>
                                        <div
                                            class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] py-1 px-3 rounded-full">
                                            <p>Enrolment Year: <span class="font-bold">{{ studentClass.enrolmentYear
                                                    }}</span></p>
                                        </div>

                                        <div
                                            class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] py-1 px-3 rounded-full">
                                            <!-- <p>Level: <span class="font-bold">{{ studentClass.isActive? studentClass.currentLevel: 'N/A' }}</span></p> -->
                                            <p>Level: <span class="font-bold">{{ studentClass.currentLevel }}</span></p>
                                        </div>

                                        <div
                                            class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] py-1 px-3 rounded-full">
                                            <p>Status: <span class="font-bold">{{ studentClass.isActive ? 'Active' :
                                                'Graduated' }}</span></p>
                                        </div>
                                    </div>
                                </Panel>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
        </section>
    </main>

    <Sidebar v-model:visible="visible" position="right" header="Results" class="md:w-[28rem]">
        <div v-for="criteria in searchCriteria">
            <div v-if="searchByValue === criteria">
                <p>{{ searchByValue }}: <span class="font-bold">{{ valueToSearch }}</span></p>
                <p class="flex items-center gap-2">Results found: <span class="font-bold text-[--primary-color]">{{
                    searchedClasses.length }}</span> </p>
            </div>
        </div>

        <div class="flex flex-col gap-3 mt-1 cursor-context-menu">

            <div v-for="studentClass in searchedClasses"
                class="py-2 px-3 bg-white shadow mt-2 rounded-lg flex flex-col gap-1 overflow-hidden border">
                <p class="font-bold text-lg">{{ studentClass.className }}</p>

                <p class="text-[--surface-500]">Advisor: <span class="font-medium ">{{ studentClass.advisor?.name ?? ''
                        }}</span></p>

                <div class="flex items-center gap-2 justify-end">
                    <Button @click="goToProfile(studentClass)" text icon="pi pi-file-edit" />
                    <Button @click="confirmDelete(studentClass)" text icon="pi pi-trash" severity="danger" />
                </div>
            </div>
        </div>

    </Sidebar>
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
</style>
