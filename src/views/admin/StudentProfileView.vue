<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { getNumberOfCourses } from '@/composables/useCountCourse'
import { formatGPA } from '@/composables/use-gpa'

import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import Card from 'primevue/card';
import Fieldset from 'primevue/fieldset';
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from "primevue/useconfirm";
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import useFileUpload from '@/composables/use-firebase-upload'
const { uploadFile, deleteFile } = useFileUpload();


const confirm = useConfirm()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const loading = ref({})
let data = ref(await getStudentProfile())

async function getStudentProfile() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/admin/student/${route.params.id}`, {
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

//Groups the registered courses into semesters
const groupedCourses = computed(() => {
    return data.value.registeredCourses.reduce((acc, record) => {
        // Find the index of the existing session and level in the grouped array
        const existingIndex = acc.findIndex(
            (group) => group.session === record.session && group.level === record.level
        );

        // If the session and level combination exists, add the course to that group
        if (existingIndex !== -1) {
            acc[existingIndex].courses.push(...record.courses);
        } else {
            // Otherwise, create a new group for the session and level
            acc.push({
                session: record.session,
                level: record.level,
                courses: [...record.courses],
            });
        }

        return acc;
    }, []);
})


//Confirm and reset password
const confirmReset = (student) => {
    confirm.require({
        message: `This will reset this student's username and password to the value of their registration number: ${student.regNumber}`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Cancel',
        acceptClass: 'p-button-warning',
        acceptLabel: 'Reset',
        accept: () => {
            resetLogin(student)
        }
    });
}

async function resetLogin(student) {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/reset-student-login/${student._id}`, {
            method: 'PUT',
            credentials: 'include'
        })
        const dat = await res.json()
        if (dat.success) {
            toast.add({ severity: 'success', summary: 'Successful', detail: dat.message, life: 5000 })
            data.value.username.username = data.value.student.regNumber
            //data.value = await getStudentProfile()
        } else if (data.info) {
            toast.add({ severity: 'error', summary: 'Error', detail: dat.message, life: 5000 })
        }
        return
    } catch (error) {
        console.error(error)
    }
}

//Confirm and delete student
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

    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/delete-student/${student.userId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        const data = await res.json()
        if (data.success) {
            toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })

            router.push({
                name: 'admin-students'
            })
        }
        return
    } catch (error) {
        console.error(error)
    }
}

function viewCourseRegDetails(session) {
    router.push({
        name: 'student-course-registration-details',
        params: {
            studentId: route.params.id,
            session: session
        }
    })
}

//Editing profile
const isEditing = ref(false)
let file = ref(null);
let label = ref(null);
let imageUrl = ref(data.value.student.imageURL)
function onSelect(event) {

    if (!event.target.files.length) {
        return;
    }

    file.value = event.target.files[0];
    label.value.style.padding = 0;
    label.value.style.height = 0;


    const reader = new FileReader();

    // Set up the FileReader onload event to update the image preview
    reader.onload = function (event) {
        imageUrl.value = event.target.result; // Set the src attribute of the image to the data URL
    };

    // Read the selected file as a data URL
    reader.readAsDataURL(file.value);
}

function cancelSelect() {
    file.value = null;
    label.value.style.padding = '0.6rem';
    label.value.style.height = 'auto';
    imageUrl.value = data.value.student.imageURL
}

let isPhotoValid = computed(() => {
    let size = file.value?.size ?? 0
    return (size / 1024) <= 500
})


async function uploadPicture() {
    loading.value.isUploadingPicture = true;
    let tempURL = '';
    try {
        // Delete previous image if it exists
        if (data.value.student.imageURL) {
            await deleteFile(data.value.student.imageURL);
            console.log('Previous image deleted');
        }

        // Upload new image and get its URL
        const url = await uploadFile(file.value, data.value.student);
        if (!url) {
            loading.value.isUploadingPicture = false;
            toast.add({ severity: 'error', summary: 'Error', message: 'Failed to upload the photo', life: 5000 })
            throw new Error('Failed to upload the photo');
        }

        tempURL = url;

        // Send URL to backend
        const res = await fetch(`${import.meta.env.VITE_API}/admin/change-user-picture`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: 'STUDENT',
                id: data.value.student._id,
                url: url
            })
        });

        // Handle response from backend
        const json = await res.json();

        if (res.status === 200) {
            // Update user profile with new image URL
            toast.add({ severity: 'success', summary: 'Done', message: 'Profile picture updated successfully', life: 5000 })
            data.value.student.imageURL = json.imageURL;
            file.value = null

            isEditing.value = false;
            return;
        }
        await deleteFile(url);

        toast.add({ severity: 'error', summary: 'Error', message: 'Failed to update profile picture', life: 5000 })

        throw new Error(json.message || 'Failed to update profile picture');

    } catch (error) {
        console.error(error);
        await deleteFile(tempURL); // Cleanup on failure
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || error, life: 5000 });
    } finally {
        loading.value.isUploadingPicture = false;
    }
}

const updated = ref({
    studentId: data.value.student._id,
    name: data.value.student.name,
    regNumber: data.value.student.regNumber
})

const originalDetails = {
    name: data.value.student.name,
    regNumber: data.value.student.regNumber
}

const isChanged = computed(() => {
    return originalDetails.name !== updated.value.name || originalDetails.regNumber !== updated.value.regNumber;
})


async function updateNameAndRegNumber() {
    if (updated.value.name === '' || updated.value.regNumber === '') {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Name or registration number cannot be empty', life: 5000 })
        return;
    }
    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/update-name-and-reg-number`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json'
        },
            body: JSON.stringify(updated.value)
        });
    const json = await res.json();
    if (res.status === 200) {
        toast.add({ severity: 'success', summary: 'Done', detail: json.message, life: 5000 })
        data.value.student.name = updated.value.name;
        data.value.student.regNumber = updated.value.regNumber;
        originalDetails.name = updated.value.name;
        originalDetails.regNumber = updated.value.regNumber;

        isEditing.value = false;
    }
} catch (error) {
    console.error(error)
    toast.add({ severity: 'error', summary: 'Error', detail: error.message || error, life: 5000 })
}
}

const confirmUpdate = () => {
    if (updated.value.regNumber === originalDetails.regNumber) {
        updateNameAndRegNumber()
        return
    }
    confirm.require({
        message: "Changing this student's registration number might affect their other records.",
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Cancel',
        acceptClass: 'p-button-primary',
        acceptLabel: 'Proceed',
        accept: () => {
            updateNameAndRegNumber()
        }
    });
}
</script>

<template>
    <Toast class="w-[70dvw] md:w-[30rem]" />
    <ConfirmDialog class="max-w-[30rem]"></ConfirmDialog>
    <main class="w-full h-full md:flex overflow-y-scroll">
        <section class="h-full p-5 md:max-w-[32rem]">
            <Card class="h-full overflow-y-scroll">
                <template #title>
                    <div class="flex items-center justify-between">
                        <h1>Student Profile</h1>
                        <Button @click="isEditing = !isEditing" rounded
                            :icon="isEditing ? 'pi pi-times' : 'pi pi-user-edit'"
                            :severity="isEditing ? 'secondary' : 'primary'" />
                    </div>
                </template>
                <template #content>
                    <Fieldset>
                        <template #legend>
                            <div class="flex items-center">
                                <span class="material-symbols-rounded">person</span>
                                <p>Student Details</p>
                            </div>
                        </template>

                        <div v-if="isEditing" class="max-w-[22rem] flex flex-col items-center justify-center">
                            <img :src="imageUrl" alt="student-img" class="w-24 aspect-square object-cover rounded-md" />

                            <div class="mt-2">
                                <label ref="label" for="profile-picture"
                                    class="overflow-hidden bg-[--primary-color] p-[0.6rem] gap-x-2 rounded-[--border-radius] flex flex-wrap items-center justify-center text-white cursor-pointer hover:bg-[--primary-700] transition-colors">
                                    <span class="pi pi-file-import"></span>
                                    <p>Upload</p>
                                    <input id="profile-picture" class="opacity-0 w-full h-0" type="file"
                                        accept=".jpg, .png, .jpeg" name="file" @input="onSelect">
                                </label>

                                <Button v-show="file" :loading="loading.isUploadingPicture" @click="uploadPicture"
                                    type="submit" icon="pi pi-upload" :label="file?.name"
                                    class="mt-3 w-full text-sm lg:text-base" :disabled="!isPhotoValid" />

                                <Button v-show="file" @click="cancelSelect" severity="secondary" label="Cancel" text
                                    class="h-9 w-full" :disabled="loading.isUploadingPicture" />
                            </div>

                            <small class="text-red-500 mt-1">Upload only .jpg, .jpeg, and .png files not more than
                                500KB.</small>

                            <div class="w-full mt-3">
                                <div class="flex flex-col">
                                    <label class="text-sm font-medium">Name</label>
                                    <InputText v-model.trim="updated.name" />
                                </div>

                                <div class="flex flex-col mt-2">
                                    <label class="text-sm font-medium">Reg. Number</label>
                                    <InputMask v-model="updated.regNumber" mask="99999999999" />
                                </div>

                                <Button @click="confirmUpdate" label="Save" :disabled="!isChanged"
                                    class="mt-5 w-full" />
                            </div>
                        </div>

                        <div v-else class="md:flex md:items-center md:gap-2 md:flex-wrap">
                            <img v-if="data.student.imageURL" :src="data.student.imageURL" alt="student-img"
                                class="w-28 aspect-square object-cover rounded-md" />

                            <img v-else src="../../assets/images/user.jpg" alt="student-img"
                                class="w-28 aspect-square rounded-md" />
                            <div class="flex flex-col gap-2">
                                <h1 class="font-bold lg:text-lg">{{ data.student.name }}</h1>
                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Reg. Number: <span class="font-bold">{{ data.student.regNumber }}</span></p>

                                <p
                                    class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                    Level: <span class="font-bold">{{ data.student.classId.currentLevel }}</span></p>
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
                                Date of Birth: <span class="font-bold">{{ data.student.dateOfBirth ?? '' }}</span></p>

                            <p
                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                Sex: <span class="font-bold">{{ data.student.sex ?? '' }}</span></p>

                            <p
                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                Nationality: <span class="font-bold">{{ data.student.nationality ?? '' }}</span></p>

                            <p
                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                State of Origin: <span class="font-bold">{{ data.student.stateOfOrigin ?? '' }}</span>
                            </p>

                            <p
                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                address: <span class="font-bold">{{ data.student.address ?? '' }}</span></p>

                            <p
                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                Username: <span class="font-bold">{{ data.username.username }}</span></p>

                            <p
                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                Email: <span class="font-bold">{{ data.student.email ?? '' }}</span></p>

                            <p
                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                Phone: <span class="font-bold">{{ data.student.phoneNumber ?? '' }}</span></p>
                        </div>
                    </Fieldset>
                </template>
            </Card>

        </section>
        <section class="h-full md:grow p-5">
            <Card class="h-full overflow-y-scroll">
                <template #content>
                    <section class="lg:grid lg:grid-cols-2 lg:grid-rows-2 lg:gap-5 lg:content-start">
                        <Fieldset class="">
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">school</span>
                                    <p>School Records</p>
                                </div>
                            </template>

                            <div class="flex flex-col gap-2 mt-2 md:mt-0">
                                <p class="border border-[--primary-color] rounded-md py-2 px-3">
                                    Entry Mode: <span class="font-bold">{{ data.student.entryMode ?? '' }}</span></p>

                                <p class="border border-[--primary-color] rounded-md py-2 px-3">
                                    Class: <span class="font-bold">{{ data.student.classId.className }}</span></p>

                                <p class="border border-[--primary-color] rounded-md py-2 px-3">
                                    Class Advisor: <span class="font-bold">{{ data.advisor.name }}</span></p>

                                <p class="border border-[--primary-color] rounded-md py-2 px-3">
                                    CGPA: <span class="font-bold">{{ formatGPA(data.CGPA) }}</span></p>
                            </div>

                        </Fieldset>

                        <Fieldset class="lg:row-span-2">
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">book_2</span>
                                    <p>Registered Courses</p>
                                </div>
                            </template>
                            <div style="height:calc(100dvh - 14rem)"
                                class="flex flex-col gap-2 mt-2 md:mt-0 overflow-y-scroll">
                                <Fieldset v-for="(history, index) in groupedCourses" :key="index">
                                    <template #legend>
                                        <div class="flex flex-col">
                                            <p>Session:<span>{{ history.session }}</span></p>
                                            <p class="font-medium text-sm">{{ history.level }} LEVEL</p>
                                        </div>
                                    </template>

                                    <div class="flex items-center justify-between flex-wrap">
                                        <div class="flex items-center gap-3">
                                            <p
                                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                                Harmattan:
                                                <span class="font-bold">
                                                    {{ getNumberOfCourses(history.courses).har }}
                                                </span>
                                            </p>

                                            <p
                                                class="text-sm lg:text-base bg-[--highlight-bg] text-[--highlight-text-color] rounded-full py-1 px-3">
                                                Rain:
                                                <span class="font-bold">
                                                    {{ getNumberOfCourses(history.courses).rain }}
                                                </span>
                                            </p>
                                        </div>
                                        <Button @click="viewCourseRegDetails(history.session)" text
                                            label="View Details" />
                                    </div>
                                </Fieldset>
                            </div>
                        </Fieldset>

                        <Fieldset>
                            <template #legend>
                                <div class="flex items-center">
                                    <span class="material-symbols-rounded">lock_reset</span>
                                    <p>Settings</p>
                                </div>
                            </template>

                            <div>
                                <p>Reset student login details.</p>
                                <Button @click="confirmReset(data.student)" severity="help" label="Reset login" />
                            </div>

                            <div class="mt-5">
                                <p>Delete student's records from database.</p>
                                <Button @click="confirmDelete(data.student)" severity="danger" label="Delete" />
                            </div>
                        </Fieldset>
                    </section>

                </template>

            </Card>
        </section>
    </main>
</template>