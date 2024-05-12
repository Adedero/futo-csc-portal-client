<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import Sidebar from 'primevue/sidebar'
import Panel from 'primevue/panel'
import Dropdown from 'primevue/dropdown'

const router = useRouter()

const staffs = ref(await getStaff())
const filteredStaff = computed(() => {
    return staffs.value.filter((staff) => {
        return staff.name.toLowerCase().includes(valueToSearch.value.toLowerCase()) || staff.staffId.toLowerCase().includes(valueToSearch.value.toLowerCase())
    })
})
//Gets all the staff
async function getStaff() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/hod/staff`, {
            credentials: 'include'
        })
        const data = await res.json()
        //console.log(data)
        if (res.status === 200) {
            data.sort((a, b) => a.name.localeCompare(b.name))
            return data
        }
    } catch (error) {
        console.log(error)
    }
}

//Go to profile
function goToProfile(staff) {
    return router.push({
        name: 'hod-staff-profile',
        params: {
            id: staff._id
        }
    })
}

//Search functionality for staff
let valueToSearch = ref('')

</script>

<template>
    <main class="w-full h-full overflow-y-scroll">
        <section class="p-5">
            <Card>
                <template #title>
                    <div class="flex items-center gap-5">
                        <h1>Staff</h1>
                        <p class="text-[1rem] text-[--primary-color]">{{ filteredStaff.length }}</p>
                    </div>
                </template>
                <template #content>
                    <div class="flex items-center gap-3 pb-3">
                        <InputGroup class="max-w-72">
                            <InputText v-model="valueToSearch" placeholder="Search" />
                            <Button icon="pi pi-search" severity="primary" />
                        </InputGroup>
                    </div>

                    <div class="list">
                        <Panel v-for="staff in filteredStaff" :key="staff._id" @click="goToProfile(staff)"
                            class="cursor-pointer hover:shadow hover:bg-[--surface-100] transition-all">
                            <template #header>
                                <div class="flex items-center gap-3">
                                    <img v-if="staff.imageURL" :src="staff.imageURL" alt="staff"
                                        class="w-12 aspect-square rounded-full object-cover">

                                    <img v-else src="../../assets/images/user.jpg" alt="staff"
                                        class="w-12 aspect-square rounded-full object-cover">
                                    <h1 class="font-bold">{{ staff.name }}</h1>
                                </div>
                            </template>
                            <div class="flex items-center justify-between">
                                <p class="-mt-3">{{ staff.staffId }}</p>
                                <p v-if="staff.isAdvisor" class="font-semibold text-xs text-[--primary-color]">ADVISOR
                                </p>
                            </div>
                        </Panel>
                    </div>
                </template>
            </Card>
        </section>
    </main>
</template>

<style scoped>
.list {
    height: calc(100dvh - 16rem);
    overflow-y: scroll;
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    place-content: start;
}
</style>