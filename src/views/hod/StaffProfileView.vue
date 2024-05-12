<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'

import Button from 'primevue/button'
import Fieldset from 'primevue/fieldset'
import Card from 'primevue/card'
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown'
import Chip from 'primevue/chip';
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";

const route = useRoute()
const toast = useToast()
const confirm = useConfirm()

let isEditing = ref(false)

let staffDetails = ref(await getStaffProfile())

async function getStaffProfile() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/hod/staff-profile/${route.params.id}`, {
            credentials: 'include'
        })
        const data = await res.json()
        //console.log(data)
        if (res.status === 200) {
            return data
        }
    } catch (error) {
        console.error(error)
    }
}

const courses = ref(staffDetails.value.courses)
const classes = ref(staffDetails.value.classes)

let selectedCourses = ref([])
let selectedClass = ref({})

let selectedCoursesId = computed(() => {
    return selectedCourses.value.map(course => course._id)
})

let selectedClassId = computed(() => {
    return selectedClass.value._id
})

let changeCourseLoading = ref(false)
async function changeStaffCourse() {
    changeCourseLoading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/hod/change-staff-courses/${staffDetails.value.staff._id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ courses: selectedCoursesId.value })
        })
        const data = await res.json()
        //console.log(data)
        if (res.status === 200) {
            staffDetails.value.staff.courses = data.newCourses
            selectedCourses.value = []
            toast.add({ severity: 'success', summary: 'Success', detail: data.message, life: 5000 })
            return
        }
        return toast.add({ severity: 'warning', summary: 'Oops1', detail: 'Could not change staff courses. Please try again', life: 5000 })
    } catch (error) {
        console.log(error)
    } finally {
        changeCourseLoading.value = false
    }
}

let removeAllCoursesLoading = ref(false)
async function removeAllCourses() {
    removeAllCoursesLoading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/hod/remove-staff-courses/${staffDetails.value.staff._id}`, {
            method: 'PUT',
            credentials: 'include',
        })
        const data = await res.json()
        cosole.log(data)
        if (res.status === 200) {
            staffDetails.value.staff.courses = []
            toast.add({ severity: 'success', summary: 'Success', detail: 'All staff courses removed', life: 5000 })
        }
    } catch (error) {
        console.error(error)
    } finally {
        removeAllCoursesLoading.value = false
    }
}

const confirmRemoveAllCourses = (event) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Remove all courses assigned to this staff?',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
        acceptClass: 'p-button-sm',
        rejectLabel: 'Cancel',
        acceptLabel: 'Proceed',
        accept: () => {
            removeAllCourses()
        }
    });
}


let removeStaffAsAdvisorLoading = ref(false)
async function removeStaffAsAdvisor() {
    removeStaffAsAdvisorLoading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/hod/remove-staff-as-advisor/${staffDetails.value.staff._id}`, {
            method: 'PUT',
            credentials: 'include'
        })
        const data = await res.json()
        //console.log(data)
        if (res.status === 200) {
            staffDetails.value.staff.isAdvisor = false,
                staffDetails.value.staff.classId = null
            toast.add({ severity: 'success', summary: 'Success', detail: data.message, life: 5000 })
        }
    } catch (error) {
        console.error(error)
    } finally {
        removeStaffAsAdvisorLoading.value = false
    }
}

let makeAdvisorLoading = ref(false)
async function makeAdvisorAndAddClass() {
    makeAdvisorLoading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/hod/create-new-advisor/${staffDetails.value.staff._id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ classId: selectedClassId.value })
        })
        const data = await res.json()
        console.log(data)
        if (res.status === 200) {
            staffDetails.value.staff.isAdvisor = true,
                staffDetails.value.staff.classId = selectedClass.value
            toast.add({ severity: 'success', summary: 'Staff is now an advisor', detail: data.message, life: 5000 })
        }
    } catch (error) {
        console.error(error)
    } finally {
        makeAdvisorLoading.value = false
    }
}

let changeAdvisorClassLoading = ref(false)
async function changeAdvisorClass() {
    changeAdvisorClassLoading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/hod/create-new-advisor/${staffDetails.value.staff._id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ classId: selectedClassId.value })
        })
        const data = await res.json()
        //console.log(data)
        if (res.status === 200) {
            staffDetails.value.staff.isAdvisor = true
            staffDetails.value.staff.classId = selectedClass.value
            toast.add({ severity: 'success', summary: 'Advisor Class Changed', detail: data.message, life: 5000 })
        }
    } catch (error) {
        console.error(error)
    } finally {
        selectedClass.value = {}
        isEditing.value = false
        changeAdvisorClassLoading.value = false
    }
}

const confirmChange = (event) => {
    confirm.require({
        target: event.currentTarget,
        message: `If there is already an advisor for this class, they will be replaced by ${staffDetails.value.staff.name}.`,
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
        acceptClass: 'p-button-sm',
        rejectLabel: 'Cancel',
        acceptLabel: 'Proceed',
        accept: () => {
            changeAdvisorClass()
        }
    });
}

</script>

<template>
    <Toast class="w-full md:max-w-[30rem]" />
    <ConfirmDialog class="max-w-[30rem]"></ConfirmDialog>
    <main class="w-full h-full md:flex overflow-y-scroll">
        <section class="h-full p-5 md:max-w-[34rem] lg:min-w-[26rem] xl:min-w-[30rem]">
            <Card class="h-full overflow-y-scroll">
                <template #title>Staff Profile</template>
                <template #content>
                    <div class="grid gap-4">
                        <Fieldset>
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">person</span>
                                    <p>Staff Details</p>
                                </div>
                            </template>

                            <div class="md:flex md:items-center md:gap-2 md:flex-wrap">
                                <img v-if="staffDetails.staff.imageURL" :src="staffDetails.staff.imageURL"
                                    alt="student-img" class="w-28 aspect-square object-fill rounded-md" />

                                <img v-else src="../../assets/images/user.jpg" alt="student-img"
                                    class="w-28 aspect-square object-fill rounded-md" />

                                <div class="flex flex-col gap-2">

                                    <h1 class="font-bold lg:text-lg">{{ staffDetails.staff.name }}</h1>

                                    <p
                                        class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                        Staff ID:
                                        <span class="font-bold">{{ staffDetails.staff.staffId }}</span>
                                    </p>

                                    <p
                                        class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                        Type:
                                        <span class="font-bold">{{ staffDetails.staff.isAdvisor ? 'Advisor' : 'Regular'
                                            }}</span>
                                    </p>
                                </div>
                            </div>
                        </Fieldset>

                        <Fieldset>

                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">info</span>
                                    <p>Personal Info</p>
                                </div>
                            </template>

                            <div class="flex flex-col gap-3 mt-4 md:mt-0">

                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Titles:
                                    <span class="font-bold">{{ staffDetails.staff.title ?? '' }}</span>
                                </p>

                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Sex:
                                    <span class="font-bold">{{ staffDetails.staff.sex ?? '' }}</span>
                                </p>

                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Address:
                                    <span class="font-bold">{{ staffDetails.staff.address }}</span>
                                </p>

                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Email:
                                    <span class="font-bold">{{ staffDetails.staff.email ?? '' }}</span>
                                </p>

                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Phone:
                                    <span class="font-bold">{{ staffDetails.staff.phoneNumber ?? '' }}</span>
                                </p>
                            </div>
                        </Fieldset>
                    </div>
                </template>
            </Card>

        </section>

        <section class="h-full md:grow p-5">
            <Card class="h-full overflow-y-scroll">

                <template #content>
                    <div class="grid gap-4">
                        <Fieldset>

                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">school</span>
                                    <p>Class Details</p>
                                </div>
                            </template>

                            <div class="flex flex-col gap-2 mt-2 md:mt-0">
                                <p v-if="staffDetails.staff.isAdvisor"
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Class: <span class="font-bold">{{ staffDetails.staff.classId.className }}</span>
                                </p>

                                <div class="text-sm lg:text-base flex items-center flex-wrap gap-2">
                                    <p class="bg-[--highlight-bg] text-[--highlight-text-color]
                                    rounded-full py-1 px-3">Courses:</p>
                                    <Chip v-for="course in staffDetails.staff.courses" :key="course._id"
                                        :label="course.code" class="font-medium" />
                                </div>


                            </div>
                        </Fieldset>


                        <Fieldset>
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">book_2</span>
                                    <p>Change Courses</p>
                                </div>
                            </template>
                            <div class="flex gap-2">
                                <MultiSelect v-model="selectedCourses" :options="courses" optionLabel="code"
                                    placeholder="Course(s)" filter class="max-w-60" />

                                <Button @click="changeStaffCourse" label="Save" :disabled="!selectedCourses.length"
                                    :loading="changeCourseLoading" />
                            </div>

                            <div class="flex flex-wrap items-center mt-2">
                                <span>Click</span>
                                <Button @click="confirmRemoveAllCourses" class="py-1 px-2" severity="warning"
                                    label="here" text :loading="removeAllCoursesLoading" />
                                <span>
                                    <span>to remove all courses.</span>
                                </span>
                            </div>

                        </Fieldset>

                        <Fieldset>

                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">settings</span>
                                    <p>Settings</p>
                                </div>
                            </template>

                            <div>
                                <div v-if="!staffDetails.staff.isAdvisor">
                                    <p class="pb-2">This staff is not an advisor</p>
                                    <Button :label="isEditing ? 'Cancel' : 'Make advisor'"
                                        :severity="isEditing ? 'secondary' : 'primary'"
                                        @click="isEditing = !isEditing" />

                                    <div v-if="isEditing" class="flex gap-2 mt-3">
                                        <Dropdown v-model="selectedClass" :options="staffDetails.classes"
                                            option-label="className" placeholder="Select class" class="max-w-60" />

                                        <Button @click="confirmChange($event)" label="Save"
                                            :disabled="!selectedClass.className" />
                                    </div>
                                </div>

                                <div v-else>
                                    <p class="pb-2">This staff is already an advisor</p>
                                    <div class="flex gap-2">
                                        <Button :label="isEditing ? 'Cancel' : 'Change class'"
                                            :severity="isEditing ? 'secondary' : 'primary'"
                                            @click="isEditing = !isEditing" />

                                        <Button @click="removeStaffAsAdvisor" severity="secondary"
                                            label="Remove as advisor" :disabled="isEditing"
                                            :loading="removeStaffAsAdvisorLoading" />
                                    </div>


                                    <div v-if="isEditing" class="flex gap-2 mt-3">
                                        <Dropdown v-model="selectedClass" :options="staffDetails.classes"
                                            option-label="className" placeholder="Select class" class="max-w-60" />
                                        <Button @click="confirmChange($event)" label="Save"
                                            :loading="changeAdvisorClassLoading" :disabled="!selectedClass.className" />
                                    </div>
                                </div>
                            </div>
                        </Fieldset>
                    </div>
                </template>
            </Card>
        </section>
    </main>
</template>