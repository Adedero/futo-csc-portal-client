<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import Menu from 'primevue/menu'
import Button from 'primevue/button'
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast'


const router = useRouter()
const toast = useToast()

const results = ref(await getResults())


async function getResults() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/dean/pending-results`, {
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

const approvedResults = computed(() => {
    return results.value.filter(result => result.isApprovedByDean)
})

const pendingResults = computed(() => {
    return results.value.filter(result => !result.isApprovedByDean)
})

//Search functionality for results
let valueToSearch = ref('')
let valueToSearchApproved = ref('')

let isDisabled = computed(() => {
    return !valueToSearch.value.trim()
})

let isDisabledApproved = computed(() => {
    return !valueToSearchApproved.value.trim()
})

const filteredPendingResults = computed(() => {
    return pendingResults.value.filter(result => {
        return result.course.toLowerCase().includes(valueToSearch.value.toLowerCase()) || result.staff.toLowerCase().includes(valueToSearch.value.toLowerCase()) || result.level == valueToSearch.value
    })
})

const filteredApprovedResults = computed(() => {
    return approvedResults.value.filter(result => {
        return result.course.toLowerCase().includes(valueToSearchApproved.value.toLowerCase()) || result.staff.toLowerCase().includes(valueToSearchApproved.value.toLowerCase()) || result.level == valueToSearchApproved.value
    })
})

function showDate(date) {
    let updatedAt = new Date(date)
    return `${updatedAt.getDate()} / ${updatedAt.getMonth() + 1} / ${updatedAt.getFullYear()}`
}

//VIEWING, APPROVING, AND DISAPPROIVNG RESULTS
function viewResult(result) {
    return router.push({
        name: 'dean-result-ogr',
        params: {
            resultId: result._id
        }
    })
}


async function approveResult(result) {
    result.loading = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/dean/approve-result/${result._id}`, {
            method: 'PUT',
            credentials: 'include'
        })
        const data = await res.json()
        console.log(data)
        if (res.status === 200) {
            result.isApprovedByDean = true
            toast.add({ severity: 'success', summary: 'Approved', detail: data.message, life: 5000 })
        }
    } catch (error) {
        console.error(error)
    } finally {
        result.loading = false
    }
}


async function disapproveResult(result) {
    result.loading = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/dean/disapprove-result/${result._id}`, {
            method: 'PUT',
            credentials: 'include'
        })
        const data = await res.json()
        console.log(data)
        if (res.status === 200) {
            result.isApprovedByDean = false
            toast.add({ severity: 'warn', summary: 'Disapproved', detail: data.message, life: 5000 })
        }
    } catch (error) {
        console.error(error)
    } finally {
        result.loading = false
    }
}

//Sorting functionality
const menu = ref();
const items = ref([
    {
        label: 'Newest to oldest',
        icon: 'pi pi-sort-numeric-down-alt'
    },
    {
        label: 'Oldest to newest',
        icon: 'pi pi-sort-numeric-up'
    },
    {
        label: 'Courses: A-Z',
        icon: 'pi pi-sort-alpha-down'
    },
    {
        label: 'Courses: Z-A',
        icon: 'pi pi-sort-alpha-up-alt'
    },
    {
        label: 'Level: 500-100',
        icon: 'pi pi-sort-amount-up'
    },
    {
        label: 'Level: 100-500',
        icon: 'pi pi-sort-amount-down-alt'
    }
]);

const toggle = (event) => {
    menu.value.toggle(event);
};

</script>

<template>
    <Toast class="w-60 md:max-w-[30rem]" />
    <main class="w-dvw lg:w-full h-full overflow-y-scroll">
        <section class="p-5 w-dvw md:w-full">
            <TabView>
                <TabPanel>
                    <template #header>
                        <h1>Pending</h1>
                        <Badge :value="pendingResults.length" severity="danger" class="-mt-4" />
                    </template>
                    <Card>

                        <template #title>
                            <div class="flex items-center gap-5">
                                <h1 class="">Pending Results</h1>
                                <p class="text-[1rem] text-[--primary-color]">{{ pendingResults.length }}</p>
                            </div>
                        </template>

                        <template #content>
                            <div class="flex items-center justify-between gap-3 pb-3">
                                <InputGroup class="max-w-72">
                                    <InputText v-model="valueToSearch" placeholder="Search..." />

                                    <Button icon="pi pi-search" severity="primary" :disabled="isDisabled" />
                                </InputGroup>

                                <div class="card flex justify-content-center">
                                    <Button type="button" icon="pi pi-sort" @click="toggle" aria-haspopup="true"
                                        aria-controls="overlay_menu" />

                                    <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
                                </div>
                            </div>

                            <div style="height: calc(100dvh - 21rem)" class="table-container overflow-scroll">
                                <table class="my-table">
                                    <thead>
                                        <tr>
                                            <th>Course</th>
                                            <th>Staff</th>
                                            <th>Session</th>
                                            <th>Semester</th>
                                            <th>Level</th>
                                            <th>Date</th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr v-for="result in filteredPendingResults" :key="result._id">
                                            <td>{{ result.course }}</td>
                                            <td>{{ result.staff }}</td>
                                            <td>{{ result.session }}</td>
                                            <td>{{ result.semester }}</td>
                                            <td>{{ result.level }}</td>
                                            <td>{{ showDate(result.updatedAt) }}</td>
                                            <td class="flex items-center justify-between gap-2">
                                                <Button @click="viewResult(result)" severity="secondary"
                                                    icon="pi pi-eye" label="View" />

                                                <Button @click="approveResult(result)" icon="pi pi-check"
                                                    label="Approve" :loading="result.loading" />

                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </template>
                    </Card>
                </TabPanel>

                <TabPanel>

                    <template #header>
                        <h1>Approved</h1>
                        <Badge :value="approvedResults.length" class="-mt-4" />
                    </template>
                    <Card>

                        <template #title>
                            <div class="flex items-center gap-5">
                                <h1>Approved Results</h1>
                                <p class="text-[1rem] text-[--primary-color]">{{ approvedResults.length }}</p>
                            </div>
                        </template>

                        <template #content>
                            <div class="flex items-center justify-between gap-3 pb-3">
                                <InputGroup class="max-w-72">
                                    <InputText v-model="valueToSearchApproved" placeholder="Search..." />

                                    <Button icon="pi pi-search" severity="primary" :disabled="isDisabledApproved" />
                                </InputGroup>

                                <div class="card flex justify-content-center">
                                    <Button type="button" icon="pi pi-sort" @click="toggle" aria-haspopup="true"
                                        aria-controls="overlay_menu" />

                                    <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
                                </div>
                            </div>

                            <div style="height: calc(100dvh - 21rem)" class="table-container overflow-scroll">
                                <table class="my-table">
                                    <thead>
                                        <tr>
                                            <th>Course</th>
                                            <th>Staff</th>
                                            <th>Session</th>
                                            <th>Semester</th>
                                            <th>Level</th>
                                            <th>Date</th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr v-for="result in filteredApprovedResults" :key="result._id">
                                            <td>{{ result.course }}</td>
                                            <td>{{ result.staff }}</td>
                                            <td>{{ result.session }}</td>
                                            <td>{{ result.semester }}</td>
                                            <td>{{ result.level }}</td>
                                            <td>{{ showDate(result.updatedAt) }}</td>
                                            <td class="flex items-center justify-between gap-2">
                                                <Button @click="viewResult(result)" label="View" icon="pi pi-eye" />
                                                <Button @click="disapproveResult(result)" severity="secondary"
                                                    label="Disapprove" icon="pi pi-times" :loading="result.loading" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </template>
                    </Card>
                </TabPanel>
            </TabView>
        </section>
    </main>
</template>
