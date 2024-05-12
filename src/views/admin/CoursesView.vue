<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

import Avatar from 'primevue/avatar';
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputMask from 'primevue/inputmask'
import InputGroup from 'primevue/inputgroup';
import ToggleButton from 'primevue/togglebutton';
import Sidebar from 'primevue/sidebar';
import Textarea from 'primevue/textarea';
import Panel from 'primevue/panel';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from "primevue/useconfirm";



import AdminStudentListLoader from '@/components/AdminStudentListLoader.vue'

const $router = useRouter()

const toast = useToast();
const confirm = useConfirm();


let loading = ref(false)
let visible = ref(false)


let coursesLoading = ref(false)
let errorLoadingCourses = ref(false)
let courses = ref(await getCourses())

let newCourse = reactive({
    title: '',
    code: '',
    unit: null,
    level: null,
    semester: '',
    schoolOfferingCourse: '',
    isElective: false,
    hasPractical: false,
    description: ''
})

function checkFields() {
    for (let key in newCourse) {
        if ((typeof newCourse[key] === 'string' && newCourse[key].trim() === '') || newCourse[key] === null || newCourse[key] === undefined) {
            return true;
        }
    }
    return false;
}

let schools = ['SICT', 'SEET', 'SOPS', 'SOBS', 'DGS', 'SAAT', 'SOHT', 'SLIT', 'SESET', 'SBMS', 'SOES']


let searchByValue = ref(null)
let valueToSearch = ref(null)
let searchCriteria = ['Course code', 'Course title', 'Level', 'Semester']
let searchedCourses = ref([])

async function getCourses() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/courses`, {
            credentials: 'include'
        })
        let data = await res.json()
        //data = data.sort((a, b) => a.title.localeCompare(b.title))
        data = data.sort((a, b) => a.level - b.level)
        return data
    } catch (error) {
        console.log(error)
    }
}

async function addCourse() {

    let isWarningShown = false;

    for (let key in newCourse) {

        if (typeof newCourse[key] === 'string') {
            const originalValue = newCourse[key];
            newCourse[key] = originalValue.trim();

            if (originalValue !== '' && newCourse[key] === '' && !isWarningShown) {
                toast.add({ severity: 'warn', summary: 'Empty Values', detail: 'Required or optional fields cannot contain empty spaces.', life: 5000 });
                isWarningShown = true;
            }
        }
    }

    newCourse.code = newCourse.code.toUpperCase()

    loading.value = true
    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/add-course`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
        },
            credentials: 'include',
            body: JSON.stringify(newCourse)
        })
    const data = await res.json()
    if (data.info) {
        toast.add({ severity: 'warn', summary: data.info, detail: data.message, life: 5000 })
        return
    }

    if (data.success) {
        toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })

        //courses.value = await getCourses()
        courses.value.push(data.course)
        //courses.value.sort((a, b) => a.title.localeCompare(b.title))
        courses.value.sort((a, b) => a.level - b.level)

        newCourse.title = '',
            newCourse.code = '',
            newCourse.unit = null,
            newCourse.level = null,
            newCourse.semester = '',
            newCourse.isElective = false,
            newCourse.hasPractical = false,
            newCourse.description = ''
    }

} catch (error) {
    toast.add({ severity: 'error', summary: 'Error adding staff', detail: error, life: 5000 });
    console.log(error)
} finally {
    loading.value = false
}
}


async function searchCourses() {
    visible.value = true;

    if (searchByValue.value === searchCriteria[0]) {

        searchedCourses.value = courses.value.filter((course) => course.code.toLowerCase().includes(valueToSearch.value.toLowerCase()))
        return
    }

    if (searchByValue.value === searchCriteria[1]) {

        searchedCourses.value = courses.value.filter((course) => course.title.toLowerCase().includes(valueToSearch.value.toLowerCase()))
        return
    }

    if (searchByValue.value === searchCriteria[2]) {

        searchedCourses.value = courses.value.filter((course) => course.level == valueToSearch.value)
        return
    }

    if (searchByValue.value === searchCriteria[3]) {

        searchedCourses.value = courses.value.filter((course) => course.semester.toLowerCase() == valueToSearch.value.toLowerCase())
        return
    }

}


function pageReload() {
    window.location.reload()
}

const confirmDelete = (course) => {
    confirm.require({
        message: 'Deleting this course might affect the results of students who have registered for it. Do you want to proceed?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Cancel',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Delete',
        accept: () => {
            deleteCourse(course)
        }
    });
}

async function deleteCourse(course) {
    course.loading = true;
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/delete-course/${course._id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        const data = await res.json()
        if (data.success) {
            toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })

            courses.value = courses.value.filter((item) => item._id !== course._id)

            searchedCourses.value = searchedCourses.value.filter((item) => item._id !== course._id)
        }
        return
    } catch (error) {
        console.error(error)
    } finally {
        course.loading = false
    }
}

let saveEditLoading = ref(false);
let editVisible = ref(false);
let courseToEdit = ref({});
let originalCourse = ref({});

function editCourse(course) {
    courseToEdit.value = { ...course };
    originalCourse.value = { ...course }; // Store a copy of the original course
    visible.value = false;
    editVisible.value = true;
}

function checkEditFields() {
    // Check for empty or null/undefined values
    for (let key in courseToEdit.value) {
        if (
            (typeof courseToEdit.value[key] === 'string' && courseToEdit.value[key].trim() === '') ||
            courseToEdit.value[key] === null ||
            courseToEdit.value[key] === undefined
        ) {
            return true;
        }
    }

    // Check if the course being edited has not changed
    for (let key in courseToEdit.value) {
        if (originalCourse.value[key] !== courseToEdit.value[key]) {
            return false; // If any value is different, return false
        }
    }

    return true; // All values are either empty or unchanged
}

async function saveCourseEdit() {
    saveEditLoading.value = true
    let isWarningShown = false;

    for (let key in courseToEdit.value) {

        if (typeof courseToEdit.value[key] === 'string') {
            const originalValue = courseToEdit.value[key];
            courseToEdit.value[key] = originalValue.trim();

            if (originalValue !== '' && courseToEdit.value[key] === '' && !isWarningShown) {
                toast.add({ severity: 'warn', summary: 'Empty Values', detail: 'Required or optional fields cannot contain empty spaces.', life: 5000 });
                isWarningShown = true;
            }
        }
    }

    courseToEdit.value.code = courseToEdit.value.code.toUpperCase()

    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/edit-course/${courseToEdit.value._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(courseToEdit.value)
        })
        const data = await res.json()
        if (data.info) {
            toast.add({ severity: 'warn', summary: data.info, detail: data.message, life: 5000 })
            return
        }

        if (data.success) {
            toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })

            courses.value = await getCourses()

            courseToEdit.value.title = '',
                courseToEdit.value.code = '',
                courseToEdit.value.unit = null,
                courseToEdit.value.level = null,
                courseToEdit.value.semester = '',
                courseToEdit.value.isElective = false,
                courseToEdit.value.hasPractical = false,
                courseToEdit.value.description = ''
        }

    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error adding staff', detail: error, life: 5000 });
        console.log(error)
    } finally {
        editVisible.value = false;
        saveEditLoading.value = false
    }

}

</script>

<template>
    <main class="w-full h-full md:flex overflow-y-scroll">
        <Toast class="w-[70dvw] md:w-72" />
        <ConfirmDialog class="max-w-[30rem]"></ConfirmDialog>
        <Dialog v-model:visible="editVisible" modal header="Edit Course" class="w-dvw md:w-[28rem]">

            <div class="flex flex-col mb-3">
                <label for="course-title" class="font-semibold w-6rem">Title</label>
                <InputText id="course-title" v-model="courseToEdit.title" placeholder="Course Title" class="mt-3" />
            </div>

            <div class="flex flex-col mb-5">
                <label for="course-code" class="font-semibold w-6rem">Code</label>
                <InputMask id="course-code" v-model="courseToEdit.code" mask="aaa 999" placeholder="Course Code" />
            </div>

            <div class="flex flex-col mb-5">
                <label for="course-units" class="font-semibold w-6rem">Units</label>
                <InputMask id="course-units" v-model="courseToEdit.unit" mask="9" placeholder="Units" />
            </div>

            <div class="flex flex-col mb-3">
                <label for="course-level" class="font-semibold w-6rem">Level</label>
                <Dropdown id="course-level" v-model="courseToEdit.level" :options="[100, 200, 300, 400, 500]"
                    placeholder="Level" />
            </div>

            <div class="flex flex-col mb-5">
                <label for="course-semester" class="font-semibold w-6rem">Semester</label>
                <Dropdown id="course-semester" v-model="courseToEdit.semester" :options="['HARMATTAN', 'RAIN']"
                    placeholder="Semester" />
            </div>

            <div class="flex flex-col mb-5">
                <label for="course-school" class="font-semibold w-6rem">School</label>
                <Dropdown id="course-school" v-model="courseToEdit.schoolOfferingCourse" :options="schools"
                    placeholder="School Offering Course" />
            </div>

            <div class="flex flex-col mb-5">
                <ToggleButton v-model="courseToEdit.isElective" onLabel="ELECTIVE" offLabel="COMPULSORY"
                    onIcon="pi pi-lock-open" offIcon="pi pi-lock" />
            </div>

            <div class="flex flex-col mb-5">
                <ToggleButton v-model="courseToEdit.hasPractical" onLabel="LAB" offLabel="NO LAB" onIcon="pi pi-plus"
                    offIcon="pi pi-minus" />
            </div>

            <div class="flex flex-col mb-5">
                <label for="email" class="font-semibold w-6rem">Description</label>
                <Textarea v-model="courseToEdit.description" auto-resize rows="5" cols="30" placeholder="Description" />
            </div>

            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="editVisible = false"></Button>
                <Button type="button" label="Save" @click="saveCourseEdit" :loading="saveEditLoading"
                    :disabled="checkEditFields()"></Button>
            </div>

        </Dialog>
        <section class="flex flex-col gap-3 h-full md:w-[40%] lg:w-96 overflow-x-hidden p-5 overflow-y-scroll">
            <Card class="flex-grow md:flex-grow-0 h-fit overflow-y-scroll overflow-x-hidden">
                <template #title>New Course</template>
                <template #content>
                    <div class="flex flex-col gap-3">

                        <p class="text-[--red-500] font-medium text-sm">Required Fields</p>

                        <InputText v-model="newCourse.title" placeholder="Course Title" class="mt-3" />


                        <InputMask v-model="newCourse.code" mask="aaa 999" placeholder="Course Code" />

                        <InputMask v-model="newCourse.unit" mask="9" placeholder="Units" />

                        <Dropdown v-model="newCourse.level" :options="[100, 200, 300, 400, 500]" placeholder="Level" />

                        <Dropdown v-model="newCourse.semester" :options="['HARMATTAN', 'RAIN']"
                            placeholder="Semester" />

                        <Dropdown v-model="newCourse.schoolOfferingCourse" :options="schools"
                            placeholder="School Offering Course" />

                        <ToggleButton v-model="newCourse.isElective" onLabel="ELECTIVE" offLabel="COMPULSORY"
                            onIcon="pi pi-lock-open" offIcon="pi pi-lock" />

                        <ToggleButton v-model="newCourse.hasPractical" onLabel="LAB" offLabel="NO LAB"
                            onIcon="pi pi-plus" offIcon="pi pi-minus" />

                        <Textarea v-model="newCourse.description" auto-resize rows="5" cols="30"
                            placeholder="Description" />

                        <Button @click="addCourse" label="Add" :loading="loading" :disabled="checkFields()" />
                    </div>
                </template>
            </Card>

            <!-- <Card class="h-40">
                <template #title>Settings</template>
                <template #content>
                    <div>
                        <p class="text-sm font-semibold text-[--red-500]">Delete all courses</p>
                        <Button label="Delete" severity="danger" outlined class="w-full mt-1" />
                    </div>
                </template>
            </Card> -->
        </section>

        <section class="h-full w-full md:w-[60%] lg:flex-grow overflow-x-hidden p-5 relative">
            <Card class="h-full">
                <template #title>
                    <div class="flex gap-2 items-center">
                        <h1>Courses:</h1>
                        <p class="font-bold text-[--primary-color]">{{ courses.length }}</p>
                    </div>
                </template>
                <template #content>
                    <div class="h-full mt-5">
                        <div class="flex items-center -mt-5 gap-3 pb-3">
                            <Dropdown v-model="searchByValue" :options="searchCriteria" placeholder="Search by" />
                            <InputGroup class="max-w-72">
                                <InputText v-model="valueToSearch" placeholder="Search" />
                                <Button @click="searchCourses" icon="pi pi-search" severity="primary"
                                    :disabled="searchByValue === null || valueToSearch === null || valueToSearch.trim() === '' || searchByValue.trim() === ''" />
                            </InputGroup>
                        </div>

                        <div class="overflow-y-scroll" style="height: calc(100dvh - 15.2rem)">

                            <div v-if="!coursesLoading" class="list">
                                <Panel v-for="course in courses" :key="course._id" class="cursor-context-menu">
                                    <template #header>
                                        <div class="flex items-center gap-2 flex-wrap">
                                            <Avatar :label="course.code[0]" class="mr-2" size="large"
                                                style="background-color: #ece9fc; color: #2a1261" shape="circle" />
                                            <span class="font-bold md:text-lg">{{ course.code }}</span>
                                        </div>
                                    </template>

                                    <template #icons>
                                        <div class="flex items-center gap-2 flex-nowrap">
                                            <Button @click="editCourse(course)" icon="pi pi-file-edit" rounded text
                                                title="Edit staff profile" />

                                            <Button @click="confirmDelete(course)" icon="pi pi-trash" severity="danger"
                                                rounded text title="Delete staff" :loading="course.loading" />
                                        </div>

                                    </template>

                                    <div class="-mt-4">
                                        <p>{{ course.title }}</p>
                                    </div>

                                    <div class="flex items-center flex-wrap gap-2 justify-between  mt-1 text-sm">
                                        <div
                                            class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] py-1 px-3 rounded-full">
                                            <p>Units: <span class="font-bold">{{ course.unit }}</span></p>
                                        </div>

                                        <div
                                            class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] py-1 px-3 rounded-full">
                                            <p>Level: <span class="font-bold">{{ course.level }}</span></p>
                                        </div>

                                        <div
                                            class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] py-1 px-3 rounded-full">
                                            <p>Semester: <span class="font-bold">{{ course.semester }}</span></p>
                                        </div>
                                    </div>
                                </Panel>
                            </div>


                            <div v-if="coursesLoading" class="flex flex-col gap-3">
                                <AdminStudentListLoader />
                                <AdminStudentListLoader />
                                <AdminStudentListLoader />
                                <AdminStudentListLoader />
                            </div>

                            <Panel v-if="errorLoadingCourses" class="bg-red-500">
                                <template #header>
                                    <div class="flex items-center gap-2 text-white">
                                        <span class="material-symbols-rounded">error</span>
                                        <span class="font-medium md:text-lg">Failed to load staff.</span>
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
                <div v-for="criteria in searchCriteria">
                    <div v-if="searchByValue === criteria">
                        <p>{{ searchByValue }}: <span class="font-bold">{{ valueToSearch }}</span></p>
                        <p class="flex items-center gap-2">Results found: <span
                                class="font-bold text-[--primary-color]">{{
                                    searchedCourses.length }}</span> </p>
                    </div>
                </div>

                <div class="flex flex-col gap-3 mt-1 cursor-context-menu">

                    <div v-for="course in searchedCourses"
                        class="py-2 px-3 bg-white shadow mt-2 rounded-lg flex flex-col gap-1 overflow-hidden border">
                        <p class="font-bold text-lg">{{ course.code }}</p>
                        <p class="font-medium text-[--surface-500]">{{ course.title }}</p>

                        <div class="flex items-center gap-2 justify-end">
                            <Button @click="editCourse(course)" text icon="pi pi-file-edit" />
                            <Button @click="confirmDelete(course)" text icon="pi pi-trash" severity="danger" />
                        </div>
                    </div>
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
</style>
