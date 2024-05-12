<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router';

import Card from 'primevue/card';
import Fieldset from 'primevue/fieldset';
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import InputGroup from 'primevue/inputgroup';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from "primevue/useconfirm";
import Chip from 'primevue/chip';
import Dialog from 'primevue/dialog';



const loading = ref({})
const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

let coursesLoading = ref(false)
let listOfCourses = ref(await getAllCourses())
let courses = ref([])

let coursesId = computed(() => {
    return courses.value.map((course) => {
        return course._id
    })
})

let staffData = ref(await getStaffProfile())

async function getStaffProfile() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/admin/staff/${route.params.id}`, {
            credentials: 'include'
        })
        const data = await response.json()
        console.log(data)
        if (response.status === 200) {
            return data
        }
    } catch (error) {
        console.log(error)
    }
}

async function getAllCourses() {
    coursesLoading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/courses`, {
            credentials: 'include'
        })
        const data = await res.json()
        return data
    } catch (error) {
        console.log(error)
    } finally {
        coursesLoading.value = false
    }
}

let changeCourseLoading = ref(false)
async function changeStaffCourse() {
    changeCourseLoading.value = true

    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/staff/course-change${ route.params.id }`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courses: coursesId.value
            })
        })

        const data = await res.json()

        if (data.info) {
            toast.add({ severity: 'warn', summary: data.info, detail: data.message, life: 5000 })
            console.log(data)
            return
        }

        if (data.success) {
            toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })
            staffData.value.staff.courses = data.newCourses
            courses.value = []
            return
        }

    } catch (error) {
        console.error(error)
        toast.add({ severity: 'error', summary: 'Server Error', detail: error, life: 5000 })
    } finally {
        changeCourseLoading.value = false
    }
}


//Removes all staff courses
let removeAllCoursesLoading = ref(false)
async function removeAllCourses() {
    removeAllCoursesLoading.value = true

    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/remove-all-courses${ route.params.id }`, {
            method: 'PUT',
            credentials: 'include'
        })

        const data = await res.json()

        if (data.success) {
            toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })
            staffData.value.staff.courses = []
            return
        }

    } catch (error) {
        console.error(error)
        toast.add({ severity: 'error', summary: 'Failed', detail: error, life: 5000 })
    } finally {
        removeAllCoursesLoading.value = false
    }
}


//Confirm and reset password
const confirmReset = (staff) => {
    confirm.require({
        message: `This will reset this staff's username and password to the value of their staffId: ${staff.staffId}`,
        header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            rejectClass: 'p-button-secondary p-button-outlined',
            rejectLabel: 'Cancel',
            acceptClass: 'p-button-warning',
            acceptLabel: 'Reset',
            accept: () => {
                resetLogin(staff)
            }
    });
}

async function resetLogin(staff) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/reset-staff-login/${staff._id}`, {
            method: 'PUT',
            credentials: 'include'
        })
        const data = await res.json()
        if (data.success) {
            toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })
            staffData.value.username.username = staffData.value.staff.staffId
            //data.value = await getStudentProfile()
        } else if (data.info) {
            toast.add({ severity: 'error', summary: 'Error', detail: data.message, life: 5000 })
        }
        return
    } catch (error) {
        console.error(error)
    }
}


//Confirm and delete staff
const confirmDelete = (staff) => {
    confirm.require({
        message: 'This staff and all their related details will be removed from the database. \nAre you sure you want to proceed? \nThis cannot be undone.',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Cancel',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Delete',
        accept: () => {
            deleteStaff(staff)
        }
    });
};

async function deleteStaff(staffToDelete) {
    staffToDelete.loading = true;
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/delete-staff/${staffToDelete.userId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        const data = await res.json()
        if (data.success) {
            toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })

            router.push({ name: 'admin-staff' })
        }
        return
    } catch (error) {
        console.error(error)
    } finally {
        staffToDelete.loading = false
    }
}

//Search functionality for searching uploaded results
let valueToSearch = ref('')

let filteredResults = computed(() => {
    return staffData.value.resultsUploaded.filter((result) => {
        return result.course.code.toLowerCase().includes(valueToSearch.value.toLowerCase())
    })
})

//Views the details of the result uploaded by the staff
function viewResultDetails(result) {
    router.push({
        name: 'admin-result-ogr',
        params: {
            staffId: staffData.value.staff._id,
            session: result.session,
            semester: result.semester,
            level: result.level,
            course: result.course.code.split(' ').join('-')
        }
    })
}

let isEditing = ref(false)
const updated = ref({
    id: staffData.value.staff._id,
    title: staffData.value.staff.title,
    name: staffData.value.staff.name,
    staffId: staffData.value.staff.staffId,
})
const originalDetails = {
    title: staffData.value.staff.title,
    name: staffData.value.staff.name,
    staffId: staffData.value.staff.staffId,
}

const isChanged = computed(() => {
    return originalDetails.title !== updated.value.title ||
        originalDetails.name !== updated.value.name ||
        originalDetails.staffId !== updated.value.staffId
})

async function updateStaffDetails() {
    if (updated.value.title === '' || updated.value.name === '' || updated.value.staffId === '') {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all fields', life: 5000 })
        return
    }
    loading.value.isUpdating = true;

    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/update-staff-details`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updated.value)
        });
        const json = await res.json();

        if (res.status === 200) {
            toast.add({ severity: 'success', summary: 'Successful', detail: json.message, life: 5000 })
            staffData.value.staff.title = updated.value.title
            staffData.value.staff.name = updated.value.name
            staffData.value.staff.staffId = updated.value.staffId

            originalDetails.title = updated.value.title
            originalDetails.name = updated.value.name
            originalDetails.staffId = updated.value.staffId

            isEditing.value = false
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 5000 })
    } finally {
        loading.value.isUpdating = false;
    }
}
const confirmUpdate = () => {
    if (updated.value.staffId === originalDetails.staffId) {
        updateStaffDetails()
        return
    }
    confirm.require({
        message: 'Are you sure you want to update this staff?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Cancel',
        acceptClass: 'p-button-warning',
        acceptLabel: 'Update',
        accept: () => {
            updateStaffDetails()
        }
    });
}

</script>

<template>
    <Toast class="w-[70dvw] md:w-[30rem]" />
    <ConfirmDialog class="max-w-[30rem]"></ConfirmDialog>

    <Dialog v-model:visible="isEditing" modal header="Edit Profile" :style="{ width: '25rem' }">
        <span class="p-text-secondary block mb-5">Update staff information.</span>

        <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">Title:</label>
                <InputText v-model.trim="updated.title" />
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">Full Name:</label>
                <InputText v-model.trim="updated.name" />
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">Staff ID:</label>
                <InputText v-model.trim="updated.staffId" />
            </div>

            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="isEditing = false" />
                <Button type="button" label="Save" @click="confirmUpdate" :loading="loading.isUpdating"
                    :disabled="!isChanged" />
            </div>
        </div>

    </Dialog>

    <main class="w-full h-full overflow-y-scroll">
        <section
            class="w-dvw md:w-full h-full p-5 md:gap-5 md:grid md:grid-cols-2 md:grid-rows-2 lg:grid-rows-5 lg:grid-cols-6">

            <Card class="h-full overflow-y-scroll lg:order-1 md:row-span-2 lg:col-span-4 lg:row-span-2">
                <template #title>
                    <div class="flex items-center gap-2">
                        <h1>Staff Profile</h1>
                        <Button @click="isEditing = true" :icon="isEditing ? 'pi pi-times' : 'pi pi-file-edit'" rounded
                            text />
                    </div>
                </template>
                <template #content>
                    <section>
                        <div class="hidden lg:flex items-center gap-2">
                            <img v-if="staffData.staff.imageURL" :src="staffData.staff.imageURL" alt="student-img"
                                class="w-28 aspect-square object-fill rounded-md" />

                            <img v-else src="../../assets/images/user.jpg" alt="student-img"
                                class="w-28 aspect-square object-fill rounded-md" />

                            <div class="flex flex-col gap-2">
                                <h1 class="font-bold lg:text-lg">
                                    {{ `${staffData.staff.title ?? ''} ${staffData.staff.name}` }}
                                </h1>
                                <p class="bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Staff ID:
                                    <span class="font-bold">{{ staffData.staff.staffId }}</span>
                                </p>

                                <div class="flex gap-x-3 gap-y-2 flex-wrap">
                                    <p class="bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                        Type:
                                        <span class="font-bold">{{ staffData.staff.isAdvisor ? 'Advisor' : 'Regular'
                                            }}</span>
                                    </p>

                                    <p v-if="staffData.staff.isAdvisor"
                                        class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                        Class: <span class="font-bold">{{ staffData.staff.classId.className }}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Fieldset class="lg:hidden">
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">person</span>
                                    <p>Staff Details</p>
                                </div>
                            </template>

                            <div class="flex items-center gap-2 flex-wrap">
                                <img v-if="staffData.staff.imageURL" :src="staffData.staff.imageURL" alt="student-img"
                                    class="w-28 aspect-square object-fill rounded-md" />

                                <img v-else src="../../assets/images/user.jpg" alt="student-img"
                                    class="w-28 aspect-square object-fill rounded-md" />

                                <div class="flex flex-col gap-2">
                                    <h1 class="font-bold lg:text-lg">
                                        {{ `${staffData.staff.title ?? ''} ${staffData.staff.name}` }}
                                    </h1>
                                    <p class="bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                        Staff ID:
                                        <span class="font-bold">{{ staffData.staff.staffId }}</span>
                                    </p>

                                    <p class="bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                        Type:
                                        <span class="font-bold">{{ staffData.staff.isAdvisor ? 'Advisor' : 'Regular'
                                            }}</span>
                                    </p>

                                    <p v-if="staffData.staff.isAdvisor"
                                        class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                        Class: <span class="font-bold">{{ staffData.staff.classId.className }}</span>
                                    </p>
                                </div>
                            </div>
                        </Fieldset>

                        <Fieldset class="lg:hidden">
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">info</span>
                                    <p>Personal Info</p>
                                </div>
                            </template>

                            <div class="flex flex-col gap-2 mt-2 md:mt-0">
                                <div class="flex items-center gap-1  flex-wrap">
                                    <p>Sex: </p>
                                    <span class="text-[--highlight-text-color] font-bold">{{ staffData.staff.sex ?? ''
                                        }}</span>
                                </div>

                                <div class="flex items-center gap-1  flex-wrap">
                                    <p>Address: </p>
                                    <span class="text-[--highlight-text-color] font-bold">{{ staffData.staff.address ??
                                        '' }}</span>
                                </div>

                                <div class="flex items-center gap-1  flex-wrap">
                                    <p>Phone: </p>
                                    <span class="text-[--highlight-text-color] font-bold">{{ staffData.staff.phoneNumber
                                        ?? '' }}</span>
                                </div>

                                <div class="flex items-center gap-1  flex-wrap">
                                    <p>Username: </p>
                                    <span class="text-[--highlight-text-color] font-bold">{{ staffData.username.username
                                        }}</span>
                                </div>

                                <div class="flex items-center gap-1  flex-wrap">
                                    <p>Email: </p>
                                    <span class="text-[--highlight-text-color] font-bold">{{ staffData.staff.email ?? ''
                                        }}</span>
                                </div>
                            </div>
                        </Fieldset>

                        <Fieldset class="lg:hidden">
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">settings</span>
                                    <p>Settings</p>
                                </div>
                            </template>

                            <div>
                                <Button @click="confirmReset(staffData.staff)" class="h-9 text-sm" severity="help"
                                    label="Reset login" />

                                <Button @click="confirmDelete(staffData.staff)" class="h-9 text-sm ml-2"
                                    severity="danger" label="Delete" />
                            </div>
                        </Fieldset>
                    </section>
                </template>
            </Card>

            <Card class="hidden lg:block lg:order-3 lg:col-span-2 lg:row-span-3 overflow-scroll">
                <template #title>Personal Details</template>
                <template #content>
                    <div class="flex flex-col gap-3 mt-2 md:mt-0">
                        <p class="bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                            Sex: <span class="font-bold">{{ staffData.staff.sex }}</span></p>

                        <p class="bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                            Address: <span class="font-bold">{{ staffData.staff.address }}</span></p>

                        <p class="bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                            Phone: <span class="font-bold">{{ staffData.staff.phoneNumber ?? '' }}</span></p>

                        <p class="bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                            Username: <span class="font-bold">{{ staffData.username.username }}</span></p>

                        <p class="bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                            Email: <span class="font-bold">{{ staffData.staff.email ?? '' }}</span></p>


                    </div>

                    <Fieldset class="mt-3">
                        <template #legend>
                            <div class="flex items-center">
                                <span class="material-symbols-rounded">settings</span>
                                <p>Settings</p>
                            </div>
                        </template>

                        <div>
                            <Button @click="confirmReset(staffData.staff)" class="h-9" severity="help"
                                label="Reset login" />

                            <Button @click="confirmDelete(staffData.staff)" class="h-9 ml-2" severity="danger"
                                label="Delete" />
                        </div>
                    </Fieldset>
                </template>
            </Card>

            <Card class="overflow-y-scroll lg:order-4 lg:col-span-2 lg:row-span-3">
                <template #title>Courses</template>
                <template #content>
                    <Fieldset>
                        <template #legend>
                            <div class="flex items-center">
                                <span class="material-symbols-rounded">book_2</span>
                                <p>Change Courses</p>
                            </div>
                        </template>
                        <div class="flex gap-2 w-full">
                            <MultiSelect v-model="courses" :options="listOfCourses" optionLabel="code"
                                placeholder="Course(s)" filter :loading="coursesLoading" display="chip"
                                class="max-w-40" />

                            <Button @click="changeStaffCourse()" label="Save" :disabled="!courses.length"
                                :loading="changeCourseLoading" />
                        </div>

                        <div class="flex flex-wrap items-center mt-2">
                            <span>Click</span> <Button @click="removeAllCourses" class="py-1 px-2" severity="warning"
                                label="here" text :loading="removeAllCoursesLoading" /> <span>
                                <span>to remove all courses.</span>
                            </span>
                        </div>
                    </Fieldset>

                    <div class="rounded-md border p-3 mt-2 flex flex-wrap gap-3">
                        <Chip v-for="course in staffData.staff.courses" :key="course.code" :label="course.code"
                            class="font-medium" />
                    </div>
                </template>
            </Card>

            <Card class="overflow-y-scroll lg:order-2 lg:col-span-2 lg:row-span-5">
                <template #title>Results Uploaded <span class="font-bold text-[--primary-color]">{{
                    filteredResults.length }}</span></template>
                <template #content>
                    <div class="pb-3">
                        <InputGroup class="w-full">
                            <InputText v-model="valueToSearch" placeholder="Search course code" />
                            <Button icon="pi pi-search" severity="primary" />
                        </InputGroup>
                    </div>
                    <div style="height: calc(100dvh - 16rem)"
                        class="flex flex-col gap-2 mt-2 md:mt-0 overflow-y-scroll">
                        <Fieldset v-for="result in filteredResults">
                            <template #legend>
                                <p>{{ result.course.code }}</p>
                            </template>

                            <div class="flex items-center justify-between flex-wrap">
                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Session: <span class="font-bold">{{ result.session }}</span></p>

                                <Button text label="View Details" @click="viewResultDetails(result)" />
                            </div>
                        </Fieldset>
                    </div>
                </template>
            </Card>
        </section>
    </main>
    <!-- <main class="w-full h-full md:flex overflow-y-scroll">

        <section class="h-full p-5 md:max-w-[32rem]">
            <Card class="h-full overflow-y-scroll">
                <template #title>Staff Profile</template>
                <template #content>
                    <Fieldset>
                        <template #legend>
                            <div class="flex items-center">
                                <span class="material-symbols-rounded">person</span>
                                <p>Staff Details</p>
                            </div>
                        </template>

                        <div class="md:flex md:items-center md:gap-2 md:flex-wrap">
                            <img v-if="staffData.staff.imageURL" :src="staffData.staff.imageURL" alt="student-img"
                                class="w-28 aspect-square object-fill rounded-md" />

                            <img v-else src="../../assets/images/user.jpg" alt="student-img"
                                class="w-28 aspect-square object-fill rounded-md" />
                            <div class="flex flex-col gap-2">
                                <h1 class="font-bold lg:text-lg">{{ `${staffData.staff.title ?? ''}
                                    ${staffData.staff.name
                                    }` }}</h1>
                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Staff ID: <span class="font-bold">{{ staffData.staff.staffId }}</span></p>

                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Type: <span class="font-bold">{{ staffData.staff.isAdvisor ? 'Advisor' : 'Regular'
                                        }}</span></p>
                            </div>
                        </div>
                    </Fieldset>

                    <Fieldset>
                        <template #legend>
                            <div class="flex items-center">
                                <span class="material-symbols-rounded">school</span>
                                <p>Class Details</p>
                            </div>
                        </template>

                        <div class="flex flex-col gap-2 mt-2 md:mt-0">
                            <p v-if="staffData.staff.isAdvisor"
                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                Class: <span class="font-bold">{{ staffData.staff.classId.className }}</span></p>

                            <div v-if="staffData.staff.courses">
                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3 w-fit">
                                    Courses:</p>
                                <div>
                                    <Chip v-for="course in staffData.staff.courses" :key="course.code"
                                        :label="course.code" class="mt-2 mr-1 font-medium" />
                                </div>
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

                        <div class="flex flex-col gap-2 mt-2 md:mt-0">
                            <p
                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                Username: <span class="font-bold">{{ staffData.username.username }}</span></p>

                            <p
                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                Email: <span class="font-bold">{{ staffData.staff.email ?? '' }}</span></p>

                            <p
                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                Phone: <span class="font-bold">{{ staffData.staff.phoneNumber ?? '' }}</span></p>
                        </div>

                        <div :class="[staffData.staff.isAdvisor ? 'mt-2' : 'mt-5', 'flex']">
                            <Button @click="confirmReset(staffData.staff)" class="h-9 text-sm" severity="help"
                                label="Reset login" />

                            <Button @click="confirmDelete(staffData.staff)" class="h-9 text-sm ml-2" severity="danger"
                                label="Delete" />
                        </div>
                    </Fieldset>
                </template>
            </Card>

        </section>
        <section class="h-full md:grow p-5">
            <Card class="h-full overflow-y-scroll">
                <template #content>
                    <Fieldset>
                        <template #legend>
                            <div class="flex items-center">
                                <span class="material-symbols-rounded">book_2</span>
                                <p>Change Course(s)</p>
                            </div>
                        </template>
                        <div class="flex gap-2">
                            <MultiSelect v-model="courses" :options="listOfCourses" optionLabel="code"
                                placeholder="Course(s)" filter :loading="coursesLoading" display="chip"
                                class="max-w-60" />

                            <Button @click="changeStaffCourse()" label="Save" :disabled="!courses.length"
                                :loading="changeCourseLoading" />
                        </div>

                        <div class="flex flex-wrap items-center mt-2">
                            <span>Click</span> <Button @click="removeAllCourses" class="py-1 px-2" severity="warning"
                                label="here" text :loading="removeAllCoursesLoading" /> <span>
                                <span>to remove all courses.</span>
                            </span>
                        </div>

                    </Fieldset>

                    <Fieldset>
                        <template #legend>
                            <div class="flex items-center">
                                <span class="material-symbols-rounded">history_edu</span>
                                <p>Results Uploaded</p>
                            </div>
                        </template>
             
                        <div class="pb-3">
                            <InputGroup class="w-full">
                                <InputText v-model="valueToSearch" placeholder="Search course code" />
                                <Button icon="pi pi-search" severity="primary" />
                            </InputGroup>
                        </div>
                        <div style="height: calc(100dvh - 26.2rem)"
                            class="flex flex-col gap-2 mt-2 md:mt-0 overflow-y-scroll">
                            <Fieldset v-for="result in filteredResults">
                                <template #legend>
                                    <p>{{ result.course.code }}</p>
                                </template>

                                <div class="flex items-center justify-between flex-wrap">
                                    <p
                                        class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                        Session: <span class="font-bold">{{ result.session }}</span></p>

                                    <Button text label="View Details" @click="viewResultDetails(result)" />
                                </div>
                            </Fieldset>
                        </div>
                    </Fieldset>
                </template>
            </Card>
        </section>
    </main> -->
</template>