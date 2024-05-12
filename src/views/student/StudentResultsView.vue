<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useDate } from '@/composables/use-date';
import { roundGPA } from '@/composables/use-gpa';

import Card from 'primevue/card'
import Button from 'primevue/button'
import Badge from 'primevue/badge';
import Message from 'primevue/message';

const router = useRouter()

let results = ref(await getStudentResults())
async function getStudentResults() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/student/results`, { credentials: 'include' })
        const data = await res.json()
        console.log(data)
        if (res.status === 200) {
            return data
        }
        return
    } catch (error) {
        console.error(error)
    }
}

function viewResult(result) {
    return router.push({
        name: 'student-result-details',
        params: {
            id: result._id
        }
    })
}
</script>

<template>
    <main v-if="results" class="w-full h-full overflow-y-scroll p-5">
        <Card>
            <template #title>
                <div class="flex gap-1">
                    <h1>Results</h1>
                    <Badge class="-translate-y-2" :value="results.length" />
                </div>
            </template>
            <template #content>
                <div style="max-height: calc(100dvh - 13rem)" class="overflow-scroll rounded-md ">
                    <table class="my-table">
                        <thead>
                            <tr>
                                <th>Session</th>
                                <th>Semester</th>
                                <th>Level</th>
                                <th>Courses</th>
                                <th>GPA</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="result in results" :key="result._id">
                                <td>{{ result.session }}</td>
                                <td>{{ result.semester }}</td>
                                <td>{{ result.level }}</td>
                                <td>{{ result.courses }}</td>
                                <td>{{ roundGPA(result.GPA) }}</td>
                                <td>{{ useDate(result.timestamp) }}</td>
                                <td>
                                    <Button @click="viewResult(result)" severity="secondary" label="View"
                                        icon="pi pi-eye" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </Card>
    </main>

    <main v-else>
        <Message icon="pi pi-info-circle" class="p-3" :closable="false">
            You have no results yet
        </Message>
    </main>
</template>