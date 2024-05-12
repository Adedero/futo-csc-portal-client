<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import InputGroup from 'primevue/inputgroup';
import Button from 'primevue/button';
import Panel from 'primevue/panel';
import Skeleton from 'primevue/skeleton';

const router = useRouter();
let loading = ref(false);
let errors = ref(false);
let search = ref('');

const advisors = ref(await getAdvisors())

const filteredAdvisors = computed(() => {
    return advisors.value.filter(advisor => advisor.name.toLowerCase().includes(search.value.toLowerCase()))
})

async function getAdvisors() {
    loading.value = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/advisors`, { credentials: 'include' });
        const data = await res.json();
        console.log(data);
        if (res.status === 200) {
            data.sort((a, b) => a.name.localeCompare(b.name));
            return data;
        }
        return [];
    } catch (error) {
        errors.value = true;
        console.error(error);
    } finally {
        loading.value = false;
    }
}

function goToClassProfile(id) {
    return router.push({
        name: 'class-profile',
        params: {
            id: id
        }
    })
}

function goToAdvisorProfile(id) {
    return router.push({
        name: 'staff-profile',
        params: {
            id: id
        }
    })
}
</script>

<template>
    <main class="w-dvw lg:w-full h-full p-5 overflow-y-scroll">
        <Card>
            <template #title>Advisors <span class="font-bold text-[--primary-color]">{{ filteredAdvisors.length
                    }}</span></template>

            <template #content>

                <InputGroup class="max-w-96">
                    <InputText v-model="search" placeholder="Search" />
                    <Button icon="pi pi-search" />
                </InputGroup>

                <section v-if="!loading && !errors" class="list">
                    <Panel v-for="advisor in filteredAdvisors" :key="advisor._id">
                        <template #header>
                            <div class="flex items-center gap-2">
                                <img v-if="advisor.imageURL" :src="advisor.imageURL" alt="advisor"
                                    class="w-10 rounded-full object-cover">

                                <img v-else src="../../assets/images/user.jpg" alt="advisor"
                                    class="w-10 rounded-full object-cover">
                                <h1 class="text-lg font-semibold">{{ advisor.name }}</h1>
                            </div>
                        </template>

                        <div class="-mt-4 flex items-center gap-2">
                            <div class="flex items-center gap-1">
                                <p>Class:</p>
                                <span class="font-medium">{{ advisor.classId.className }}</span>
                            </div>

                            <Button @click="goToClassProfile(advisor.classId._id)" severity="info"
                                icon="pi pi-external-link" rounded text />
                        </div>

                        <template #footer>
                            <Button @click="goToAdvisorProfile(advisor._id)" class="-mt-3" label="Visit profile"
                                icon="pi pi-user" />
                        </template>
                    </Panel>
                </section>

                <section v-if="loading" class="list">
                    <Skeleton v-for="i in 6" height="10rem" />
                </section>

                <section v-if="errors">
                </section>
            </template>
        </Card>
    </main>
</template>

<style scoped>
.list {
    margin-top: 1.5rem;
    display: grid;
    align-content: start;
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
    gap: 1rem;
    height: calc(100dvh - 18rem);
    overflow-y: scroll;
}

@media screen and (min-width: 768px) {
    .list {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
    }
}
</style>