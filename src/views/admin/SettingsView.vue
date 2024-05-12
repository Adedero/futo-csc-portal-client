<script setup>
import { ref, computed } from 'vue'
import Card from 'primevue/card';
import Fieldset from 'primevue/fieldset';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import ToggleButton from 'primevue/togglebutton';
import InputGroup from 'primevue/inputgroup';
import InputMask from 'primevue/inputmask';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Chip from 'primevue/chip';
import Message from 'primevue/message';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

//Constants
const toast = useToast()

//Toggles editing states
let isEditing = ref({
    currentSession: false,
    currentSemester: false,
    courseRegStatus: false,
    openSessions: false,
    openSemesters: false,
    openLevels: false
})

//Toggles info states
let info = ref({
    currentSession: false
})

//Toggles loading states for buttons
let loading = ref({
    currentSession: false,
    currentSemester: false,
    courseRegStatus: false,
    openSemesters: false,
    openSessions: false,
    openLevels: false
})

let newSettings = ref({
    currentSession: {},
    currentSemester: {},
    moveClassesUp: true,
    courseRegStatus: true,
    openSessions: [],
    openSemesters: [],
    openLevels: []
})

//NEW VALUES FOR CHANGE
let newCurrentSessionId = computed(() => {
    return newSettings.value.currentSession._id
})

let newCurrentSemesterId = computed(() => {
    return newSettings.value.currentSemester._id
})

let newOpenSessionsId = computed(() => {
    return newSettings.value.openSessions.map((session) => session._id)
})

let newOpenSemestersId = computed(() => {
    return newSettings.value.openSemesters.map((semester) => semester._id)
})

let newOpenLevelsId = computed(() => {
    return newSettings.value.openLevels.map((level) => level._id)
})



//Gets all the details necessary for this page
let details = ref(await getSettingsDetails())
async function getSettingsDetails() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/settings`, {
            credentials: 'include'
        })
        const data = await res.json()
        //console.log(data)
        if (res.status === 200) {
            data.sessions.sort((a, b) => {
                return parseInt(b.name.split('-')[0]) - parseInt(a.name.split('-')[0])
            })
            return data
        } else {
            return {}
        }
    } catch (error) {
        console.error(error)
    }
}
//Formating data to display
let currentSession = computed(() => {
    return details.value.sessions.find((session) => session.isCurrent)
})

let currentSemester = computed(() => {
    return details.value.semesters.find((semester) => semester.isCurrent)
})

//Settings changes
//Changes the current session
async function changeCurrentSession() {
    loading.value.currentSession = true
    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/change-current-session`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json'
        },
            body: JSON.stringify({
                sessionId: newCurrentSessionId.value,
                moveClassesUp: newSettings.value.moveClassesUp
            })
        })
    const data = await res.json()
    //console.log(data)
    if (res.status === 200) {
        toast.add({ severity: 'success', summary: 'Success', detail: 'Current session changed successfully', life: 5000 })

        details.value = await getSettingsDetails()
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: data.message, life: 5000 })
    }
} catch (error) {
    console.log(error)
    toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
} finally {
    loading.value.currentSession = false
    isEditing.value.currentSession = false
}
}

//Changes the current semester
async function changeCurrentSemester() {
    loading.value.currentSemester = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/change-current-semester`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ semesterId: newCurrentSemesterId.value })
        })
        const data = await res.json()
        //console.log(data)
        if (res.status === 200) {
            toast.add({ severity: 'success', summary: 'Success', detail: 'Current session changed successfully', life: 5000 })

            details.value = await getSettingsDetails()
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: data.message, life: 5000 })
        }
    } catch (error) {
        console.log(error)
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
    } finally {
        loading.value.currentSemester = false
        isEditing.value.currentSemester = false
    }
}

//Closes or opens course registration
async function changeCourseRegStatus() {
    loading.value.courseRegStatus = true
    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/change-course-reg-status`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json'
        },
            body: JSON.stringify({ status: newSettings.value.courseRegStatus })
        })
    const data = await res.json()
    //console.log(data)
    if (res.status === 200) {
        toast.add({ severity: 'success', summary: 'Success', detail: 'Course regisration status changed successfully', life: 5000 })

        details.value = await getSettingsDetails()
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: data.message, life: 5000 })
    }
} catch (error) {
    console.log(error)
    toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
} finally {
    loading.value.courseRegStatus = false
    isEditing.value.courseRegStatus = false
}
}

//Changes open sessions
async function changeOpenSessions() {
    loading.value.openSessions = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/change-open-sessions`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionIds: newOpenSessionsId.value })
        })
        const data = await res.json()
        if (res.status === 200) {
            details.value = await getSettingsDetails()

            toast.add({ severity: 'success', summary: 'Success', detail: 'Open sessions changed successfully', life: 5000 })
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: data.message, life: 5000 })
        }
    } catch (error) {
        console.log(error)
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
    } finally {
        loading.value.openSessions = false
        isEditing.value.openSessions = false
    }
}

//Changes open semesters
async function changeOpenSemesters() {
    loading.value.openSemesters = true
    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/change-open-semesters`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json'
        },
            body: JSON.stringify({ semesterIds: newOpenSemestersId.value })
        })
    const data = await res.json()
    if (res.status === 200) {
        details.value = await getSettingsDetails()

        toast.add({ severity: 'success', summary: 'Success', detail: 'Open semesters changed successfully', life: 5000 })
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: data.message, life: 5000 })
    }
} catch (error) {
    console.log(error)
    toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
} finally {
    loading.value.openSemesters = false
    isEditing.value.openSemesters = false
}
}

//Changes open levels
async function changeOpenLevels() {
    loading.value.openLevels = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/change-open-levels`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ levelIds: newOpenLevelsId.value })
        })
        const data = await res.json()
        if (res.status === 200) {
            details.value = await getSettingsDetails()
            toast.add({ severity: 'success', summary: 'Success', detail: 'Open levels changed successfully', life: 5000 })

        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: data.message, life: 5000 })
        }

    } catch (error) {
        console.log(error)
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
    } finally {
        loading.value.openLevels = false
        isEditing.value.openLevels = false
    }
}

//Creating a new session
let createSessionLoading = ref(false)
let sessionName = ref('')
let startYear = computed(() => {
    return sessionName.value.split('-')[0]
})
let currentYear = ref(new Date().getFullYear())

async function createNewSession() {
    let [firstYear, secondYear] = sessionName.value.split('-')

    if (parseInt(firstYear) > parseInt(secondYear)) {
        return toast.add({ severity: 'error', summary: 'Invalid input.', detail: 'Session name is not valid', life: 5000 })
    }

    if (parseInt(secondYear) - parseInt(firstYear) !== 1) {
        return toast.add({ severity: 'error', summary: 'Invalid input.', detail: 'Session name is not valid', life: 5000 })
    }
    createSessionLoading.value = true
    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/create-session`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
        },
            credentials: 'include',
            body: JSON.stringify({
                name: sessionName.value,
                startYear: parseInt(startYear.value),
                currentYear: parseInt(currentYear.value)
            })
        })
    const data = await res.json()
    if (res.status === 200) {
        toast.add({ severity: 'success', summary: 'Success', detail: data.message, life: 5000 })
        details.value = await getSettingsDetails()
        sessionName.value = ''
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: data.message, life: 5000 })
    }
} catch (error) {
    console.error(error)
    toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
} finally {
    createSessionLoading.value = false
}
}


</script>

<template>
    <Toast class="w-[70dvw] md:w-96" />
    <Dialog v-model:visible="info.currentSession" modal header="Level Increase" class="w-dvw md:max-w-96">
        <div>
            <p>Moving classes up a level will automatically increase the level of all classes by 100. However, classes
                in final year, i.e. 500 level, will be moved to level 0 and will be marked as graduated.</p>
            <Divider />
            <p>Students with extra years from graduated classes will not be able to register courses until a level has
                been opened for them.</p>
            <Divider />
            <p class="text-red-500">Note: Unchecking this option my cause problems later on. It is advisable to only
                change to the next semester. Not to the previous one.</p>
        </div>
        <div class="mt-3">
            <Button severity="secondary" label="OK" @click="info.currentSession = false" />
        </div>
    </Dialog>
    <main class="w-full h-full overflow-y-scroll">
        <section class="p-5 h-full w-full overflow-y-scroll">
            <Card>
                <template #title>Settings</template>
                <template #content>
                    <section class="md:flex md:gap-5">
                        <div style="height: calc(100dvh - 13rem);"
                            class="grid w-full md:max-w-[26rem] overflow-y-scroll">
                            <Fieldset>
                                <template #legend>
                                    <div class="flex items-center">
                                        <span class="material-symbols-rounded">school</span>
                                        <p>School Details</p>
                                    </div>
                                </template>
                                <div class="flex flex-col gap-2">
                                    <!-- Current Session -->
                                    <div>
                                        <div class="text-sm lg:text-base flex items-center gap-4">
                                            <p>Current Session</p>

                                            <Button @click="isEditing.currentSession = !isEditing.currentSession"
                                                :icon="isEditing.currentSession ? 'pi pi-times' : 'pi pi-file-edit'"
                                                rounded text />
                                        </div>

                                        <Chip :label="currentSession.name" class="font-semibold"
                                            icon="pi pi-calendar" />

                                        <div v-if="isEditing.currentSession" class="mt-3">

                                            <div class="flex items-center gap-2 mb-3">
                                                <Checkbox v-model="newSettings.moveClassesUp" inputId="move-classes"
                                                    :binary="true" />

                                                <div class="flex items-center gap-1">
                                                    <label class="text-sm md:text-base" for="move-classes">Move all
                                                        classes up a level</label>
                                                    <span @click="info.currentSession = true"
                                                        class="material-symbols-rounded cursor-pointer">info</span>
                                                </div>
                                            </div>

                                            <InputGroup>
                                                <Dropdown v-model="newSettings.currentSession"
                                                    :options="details.sessions" option-label="name"
                                                    placeholder="Change Current Session" class="w-20" />

                                                <Button @click="changeCurrentSession" label="Save"
                                                    :loading="loading.currentSession"
                                                    :disabled="!newCurrentSessionId" />
                                            </InputGroup>
                                        </div>
                                    </div>

                                    <!-- Current Semester -->
                                    <div>
                                        <div class="text-sm lg:text-base flex items-center gap-4">
                                            <p>Current Semester:</p>

                                            <Button @click="isEditing.currentSemester = !isEditing.currentSemester"
                                                :icon="isEditing.currentSemester ? 'pi pi-times' : 'pi pi-file-edit'"
                                                rounded text />
                                        </div>

                                        <Chip :label="currentSemester.name" class="font-semibold" icon="pi pi-flag" />

                                        <div v-if="isEditing.currentSemester" class="mt-3">
                                            <InputGroup>
                                                <Dropdown v-model="newSettings.currentSemester"
                                                    :options="details.semesters" option-label="name"
                                                    placeholder="Change Current Semester" class="w-20" />
                                                <Button @click="changeCurrentSemester"
                                                    :loading="loading.currentSemester" label="Save"
                                                    :disabled="!newCurrentSemesterId" />
                                            </InputGroup>
                                        </div>
                                    </div>
                                </div>
                            </Fieldset>

                            <Fieldset>
                                <template #legend>
                                    <div class="flex items-center">
                                        <span class="material-symbols-rounded">edit_calendar</span>
                                        <p>Create New Session</p>
                                    </div>
                                </template>
                                <div class="flex flex-col gap-2">
                                    <div class="flex flex-col text-sm font-medium gap-1">
                                        <span>Name:</span>
                                        <InputMask v-model="sessionName" placeholder="Session Name e.g. 2020-2021"
                                            mask="9999-9999" />
                                    </div>

                                    <div class="flex flex-col text-sm font-medium gap-1">
                                        <span>Start Year:</span>
                                        <InputMask :readonly="true" :model-value="startYear"
                                            placeholder="Enter the current year" mask="9999" />
                                    </div>

                                    <div class="flex flex-col text-sm font-medium gap-1">
                                        <span>Current Year:</span>
                                        <InputMask :readonly="true" :model-value="currentYear"
                                            placeholder="Enter the current year" mask="9999" />
                                    </div>

                                    <div>
                                        <Button @click="createNewSession" label="Submit"
                                            :disabled="!sessionName || !startYear || !currentYear"
                                            :loading="createSessionLoading" />
                                    </div>
                                </div>
                            </Fieldset>
                        </div>

                        <div style="height: calc(100dvh - 13rem);"
                            class="grid w-full md:max-w-[26rem] overflow-y-scroll">
                            <Fieldset>
                                <template #legend>
                                    <div class="flex items-center">
                                        <span class="material-symbols-rounded">history_edu</span>
                                        <p>Course Registration</p>
                                    </div>
                                </template>
                                <div class="flex flex-col gap-2 overflow-y-scroll">
                                    <!-- Course Reg Status -->
                                    <div>
                                        <div class="text-sm lg:text-base flex items-center gap-4">
                                            <p>Status</p>

                                            <Button @click="isEditing.courseRegStatus = !isEditing.courseRegStatus"
                                                :icon="isEditing.courseRegStatus ? 'pi pi-times' : 'pi pi-file-edit'"
                                                rounded text />
                                        </div>
                                        <Chip :label="details.courseRegStatus.isOpen ? 'Open' : 'Closed'"
                                            class="font-semibold"
                                            :icon="details.courseRegStatus.isOpen ? 'pi pi-lock-open' : 'pi pi-lock-closed'" />

                                        <div v-if="isEditing.courseRegStatus" class="mt-3">
                                            <InputGroup>
                                                <ToggleButton v-model="newSettings.courseRegStatus" onLabel="Open"
                                                    offLabel="Closed" onIcon="pi pi-lock-open" offIcon="pi pi-lock"
                                                    class="w-full" />
                                                <Button @click="changeCourseRegStatus"
                                                    :loading="loading.courseRegStatus" label="Save" />
                                            </InputGroup>

                                        </div>
                                    </div>

                                    <!-- Sessions open for course registration -->
                                    <div>
                                        <div>
                                            <div class="text-sm lg:text-base flex items-center gap-4">
                                                <p>Sessions Open:</p>

                                                <Button @click="isEditing.openSessions = !isEditing.openSessions"
                                                    :icon="isEditing.openSessions ? 'pi pi-times' : 'pi pi-file-edit'"
                                                    rounded text />
                                            </div>

                                            <div class="flex flex-wrap items-center gap-2">
                                                <Chip v-for="session in details.courseRegStatus.openSession"
                                                    :label="`${session.name} ${session.isCurrent ? '(current)' : ''}`"
                                                    class="font-semibold" />
                                            </div>
                                        </div>

                                        <div v-if="isEditing.openSessions" class="mt-3">
                                            <InputGroup>
                                                <MultiSelect v-model="newSettings.openSessions"
                                                    :options="details.sessions" option-label="name" display="chip"
                                                    placeholder="Select Sessions" class="w-20" />

                                                <Button @click="changeOpenSessions" :loading="loading.openSessions"
                                                    label="Save" :disabled="!newOpenSessionsId.length" />
                                            </InputGroup>
                                        </div>
                                    </div>

                                    <!-- Semesters open for course registration -->
                                    <div>
                                        <div>
                                            <div class="text-sm lg:text-base flex items-center gap-4">
                                                <p>Semesters Open:</p>

                                                <Button @click="isEditing.openSemesters = !isEditing.openSemesters"
                                                    :icon="isEditing.openSemesters ? 'pi pi-times' : 'pi pi-file-edit'"
                                                    rounded text />
                                            </div>

                                            <div class="flex flex-wrap items-center gap-2">
                                                <Chip v-for="semester in details.courseRegStatus.openSemester"
                                                    :label="`${semester.name} ${semester.isCurrent ? '(current)' : ''}`"
                                                    class="font-semibold" icon="pi pi-flag" />
                                            </div>
                                        </div>

                                        <div v-if="isEditing.openSemesters" class="mt-3">
                                            <InputGroup>
                                                <MultiSelect v-model="newSettings.openSemesters"
                                                    :options="details.semesters" option-label="name"
                                                    placeholder="Select Sessions" class="w-20" />

                                                <Button :loading="loading.openSemesters" @click="changeOpenSemesters"
                                                    label="Save" :disabled="!newOpenSemestersId.length" />
                                            </InputGroup>
                                        </div>
                                    </div>

                                    <!-- Levels open for course registration -->
                                    <div>
                                        <div>
                                            <div class="text-sm lg:text-base flex items-center justify-between">
                                                <p>Levels Open:</p>

                                                <Button @click="isEditing.openLevels = !isEditing.openLevels"
                                                    :icon="isEditing.openLevels ? 'pi pi-times' : 'pi pi-file-edit'"
                                                    rounded text />
                                            </div>

                                            <Message severity="info">By default, the student's current level will always
                                                be open for course
                                                registration.</Message>

                                            <div class="flex flex-wrap items-center gap-2">
                                                <Chip v-for="level in details.courseRegStatus.openLevel"
                                                    :label="level.name.toString()" class="font-semibold"
                                                    icon="pi pi-circle-fill" />
                                            </div>
                                        </div>

                                        <div v-if="isEditing.openLevels" class="mt-3">
                                            <InputGroup>
                                                <MultiSelect v-model="newSettings.openLevels" :options="details.levels"
                                                    option-label="name" placeholder="Select Levels" class="w-20" />

                                                <Button :loading="loading.openLevels" @click="changeOpenLevels"
                                                    label="Save" />
                                            </InputGroup>
                                        </div>
                                    </div>
                                </div>
                            </Fieldset>
                        </div>
                    </section>
                </template>
            </Card>
        </section>
    </main>
</template>