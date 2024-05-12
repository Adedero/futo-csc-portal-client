<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import VTab from '@/components/VTab.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputMask from 'primevue/inputmask'
import MultiSelect from 'primevue/multiselect'
import InputGroup from 'primevue/inputgroup';
import Sidebar from 'primevue/sidebar';
import Panel from 'primevue/panel';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from "primevue/useconfirm";
import Chip from 'primevue/chip'
import AdminStudentListLoader from '@/components/AdminStudentListLoader.vue'

const $router = useRouter()

const toast = useToast();
const confirm = useConfirm();


let loading = ref(false)


let staffLoading = ref(false)
let errorLoadingStaff = ref(false)
let staff = ref(await getStaff())

let valueToSearch = ref('')

const filteredStaff = computed(() => {
    return staff.value.filter((staff) => !staff.isHOD && (staff.name.toLowerCase().includes(valueToSearch.value.toLowerCase()) || staff.staffId.toLowerCase().includes(valueToSearch.value.toLowerCase())))
})

let newStaff = reactive({
    name: null,
    title: null,
    staffId: null,
    username: null,
    password: null,
    email: null,
    phoneNumber: null,
    role: 'STAFF',
    isAdvisor: false,
    isDean: false,
    isHOD: false,
})

let listOfCourses = ref([])
let courses = ref([])

let coursesId = computed(() => {
    return courses.value.map((course) => {
        return course._id
    })
})


async function getAllCourses() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/courses`, {
            credentials: 'include'
        })
        const data = await res.json()
        listOfCourses.value = data
    } catch (error) {
        console.log(error)
    }
}

async function addStaff() {

    let isWarningShown = false;

    for (let key in newStaff) {

        if (typeof newStaff[key] === 'string') {
            const originalValue = newStaff[key];
            newStaff[key] = originalValue.trim();

            if (originalValue !== '' && newStaff[key] === '' && !isWarningShown) {
                toast.add({ severity: 'warn', summary: 'Empty Values', detail: 'Required or optional fields cannot contain empty spaces.', life: 5000 });
                isWarningShown = true;
            }
        }
    }

    loading.value = true
    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/add-staff`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
        },
            credentials: 'include',
            body: JSON.stringify({
                ...newStaff,
                courses: coursesId.value
            })
        })
    const data = await res.json()
    //console.log(data)
    if (data.info) {
        toast.add({ severity: 'warn', summary: data.info, detail: data.message, life: 5000 })
        return
    }

    if (data.success) {
        toast.add({ severity: 'success', summary: 'Successful', detail: data.message, life: 5000 })

        //staff.value = await getStaff()
        staff.value.push(data.staff)
        staff.value.sort((a, b) => a.name.localeCompare(b.name))

        courses.value = []
        newStaff.name = ''
        newStaff.staffId = ''
        newStaff.title = ''
        newStaff.username = ''
        newStaff.password = ''
        newStaff.email = ''
        newStaff.phoneNumber = ''
    }

} catch (error) {
    toast.add({ severity: 'error', summary: 'Error adding staff', detail: error, life: 5000 });
    console.log(error)
} finally {
    loading.value = false
}
}

async function getStaff() {
    staffLoading.value = true
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/admin/staff`, {
            credentials: 'include'
        })
        const data = await response.json()
        errorLoadingStaff.value = false
        data.sort((a, b) => a.name.localeCompare(b.name))
        //console.log(data)
        return data
    } catch (error) {
        console.error(error);
        errorLoadingStaff.value = true
    } finally {
        staffLoading.value = false
    }
}


function pageReload() {
    window.location.reload()
}

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

            staff.value = staff.value.filter((item) => item.userId !== staffToDelete.userId)

            searchedStaff.value = searchedStaff.value.filter((item) => item.userId !== staffToDelete.userId)
        }
        return
    } catch (error) {
        console.error(error)
    } finally {
        staffToDelete.loading = false
    }
}

function goToProfile(staff) {

    $router.push({
        name: 'staff-profile',
        params: {
            id: staff._id
        }
    })
}

onMounted(() => {
    //Populates the list of courses
    getAllCourses()
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
                <template #title>New Staff</template>
                <template #content>
                    <div class="flex flex-col gap-3">

                        <p class="text-[--red-500] font-medium text-sm">Required Fields</p>

                        <div class="w-full">
                            <label class="text-sm font-semibold">Title</label>
                            <InputText v-model="newStaff.title" placeholder="Title e.g. Mr., Dr." class="w-full" />
                        </div>

                        <div class="w-full">
                            <label class="text-sm font-semibold">Full Name</label>
                            <InputText v-model="newStaff.name" placeholder="Full Name" class="w-full" />
                        </div>

                        <div class="w-full">
                            <label class="text-sm font-semibold">Staff ID</label>
                            <InputMask v-model="newStaff.staffId" mask="9999aa" placeholder="Staff ID" class="w-full" />
                        </div>

                        <div class="w-full">
                            <label class="text-sm font-semibold">Courses</label>
                            <MultiSelect v-model="courses" :options="listOfCourses" optionLabel="code"
                                placeholder="Select Courses" filter display="chip" class="w-full" />
                        </div>

                        <div class="w-full">
                            <label class="text-sm font-semibold">Username</label>
                            <InputText v-model="newStaff.username" placeholder="Username" class="w-full" />
                        </div>

                        <div class="relative w-full">
                            <label class="text-sm font-semibold">Password</label>
                            <input v-model="newStaff.password" class="v-password w-full"
                                :type="passwordVisible ? 'text' : 'password'" placeholder="Password" />
                            <span @click="passwordVisible = !passwordVisible"
                                :class="[passwordIcon, 'text-[--surface-400] absolute top-9 right-3']"></span>
                        </div>

                        <v-tab header="Optional Fields">
                            <div class="flex flex-col gap-3">

                                <div class="w-full">
                                    <label class="text-sm font-semibold">Email</label>
                                    <InputText v-model="newStaff.email" placeholder="Email" class="w-full" />
                                </div>

                                <div class="w-full">
                                    <label class="text-sm font-semibold">Phone Number</label>
                                    <InputMask v-model="newStaff.phoneNumber" mask="09099999999"
                                        placeholder="Phone Number" class="w-full" />
                                </div>

                            </div>
                        </v-tab>

                        <Button @click="addStaff" label="Add" :loading="loading"
                            :disabled="newStaff.name === '' || newStaff.name === null || newStaff.staffId === '' || newStaff.className === '' || newStaff.username === '' || newStaff.password === '' || newStaff.staffId === null || newStaff.className === null || newStaff.username === null || newStaff.password === null || !coursesId.length" />
                    </div>
                </template>
            </Card>

            <!-- <Card class="h-40">
                <template #title>Settings</template>
                <template #content>
                    <div>
                        <p class="text-sm font-semibold text-[--red-500]">Delete all staff</p>
                        <Button label="Delete" severity="danger" outlined class="w-full mt-1" />
                    </div>
                </template>
            </Card> -->
        </section>

        <section class="h-full w-full md:w-[60%] lg:flex-grow overflow-x-hidden p-5 relative">
            <Card class="h-full">
                <template #title>
                    <div class="flex gap-2 items-center">
                        <h1>Staff:</h1>
                        <p class="font-bold text-[--primary-color]">{{ filteredStaff.length }}</p>
                    </div>
                </template>
                <template #content>
                    <div class="h-full mt-5">
                        <div class="flex items-center -mt-5 gap-3 pb-3">

                            <InputGroup class="max-w-72">
                                <InputText v-model="valueToSearch" placeholder="Search" />
                                <Button icon="pi pi-search" severity="primary" />
                            </InputGroup>
                        </div>

                        <div class="overflow-y-scroll" style="height: calc(100dvh - 15.2rem)">
                            <div v-if="!staffLoading" class="list">
                                <Panel v-for="item in filteredStaff" :key="item._id" class="cursor-context-menu">
                                    <template #header>
                                        <div class="flex items-center gap-2">
                                            <img v-if="item.imageURL" :src="item.imageURL" alt="student"
                                                class="w-9 aspect-square rounded-full object-cover object-center">

                                            <img v-else src="../../assets/images/user.jpg" alt="student"
                                                class="w-9 aspect-square rounded-full object-cover object-center">
                                            <span class="font-bold">{{ item.name }}</span>
                                        </div>
                                    </template>

                                    <template #icons>
                                        <div class="flex items-center gap-2 flex-nowrap">
                                            <Button @click="goToProfile(item)" icon="pi pi-user-edit" rounded text
                                                title="Edit staff profile" />

                                            <Button @click="confirmDelete(item)" icon="pi pi-trash" severity="danger"
                                                rounded text title="Delete staff" :loading="item.loading" />
                                        </div>


                                    </template>

                                    <div
                                        class="text-sm w-fit -mt-3 flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] py-1 px-3 rounded-full">
                                        <p>Staff ID: <span class="font-bold">{{ item.staffId }}</span></p>
                                    </div>
                                    <div class="mt-2 text-sm">
                                        <p class="font-medium">Courses:</p>
                                        <div class="flex gap-2 flex-wrap">
                                            <Chip v-for="course in item.courses" :key="course.code" :label="course.code"
                                                class="text-sm font-medium" />
                                        </div>
                                    </div>

                                </Panel>

                            </div>

                            <div v-if="staffLoading" class="flex flex-col gap-3">
                                <AdminStudentListLoader />
                                <AdminStudentListLoader />
                                <AdminStudentListLoader />
                                <AdminStudentListLoader />
                            </div>

                            <Panel v-if="errorLoadingStaff" class="bg-red-500">
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