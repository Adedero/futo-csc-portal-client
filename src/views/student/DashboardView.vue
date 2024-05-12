<script setup>

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import Chart from 'primevue/chart';
import AdminDashboardCard from '@/components/AdminDashboardCard.vue';
import Card from 'primevue/card';
import { formatGPA } from '@/composables/use-gpa';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import Skeleton from 'primevue/skeleton'

const toast = useToast();
const router = useRouter();
let dashboardLoading = ref(false)
let dashboard = ref(await getDashboardDetails())

async function getDashboardDetails() {
    dashboardLoading.value = true;
    try {
        const response = await fetch(`${import.meta.env.VITE_API}/student/dashboard`, {
            credentials: 'include',
        });
        const data = await response.json();
        //console.log(data);
        data.results.sort((a, b) => {
            if (parseInt(a.session.split('-')[0]) === parseInt(b.session.split('-')[0])) {
                return a.semester.localeCompare(b.semester)
            }

            return parseInt(a.session.split('-')[0]) - parseInt(b.session.split('-')[0])
        })
        return data
    } catch (error) {
        toast.add({ severity: 'warn', summary: 'Error', detail: 'Something went wrong. Please try logging in again.', life: 5000 })
        router.push('/')
        console.log(error)
    } finally {
        dashboardLoading.value = false;
    }
}



const chartData = ref();
const chartOptions = ref();
const labels = computed(() => {
    return dashboard.value.results.map((result) => {
        return `${result.level}L: ${result.semester[0]}`
    })
})

const dataset = computed(() => {
    return dashboard.value.results.map((result) => result.GPA)
})


const setChartData = () => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: labels.value,
        datasets: [
            {
                label: 'GPA',
                data: dataset.value,
                fill: false,
                borderColor: documentStyle.getPropertyValue('--blue-500'),
                tension: 0.4
            }
        ]
    };
};
const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});


</script>

<template>
    <Toast class="w-[70dvw] md:w-72" />
    <main v-if="dashboardLoading"
        class="h-full w-dvw  lg:w-full p-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-5">
        <Skeleton height="15rem" class="lg:row-span-2" />
        <Skeleton height="15rem" class="lg:row-span-2" />
        <Skeleton height="15rem" class="lg:row-span-2" />
        <Skeleton height="15rem" class="lg:row-span-2" />
        <Skeleton height="15rem" class="hidden lg:block lg:col-span-2 lg:row-span-3" />
        <Skeleton height="15rem" class="hidden lg:block lg:col-span-2 lg:row-span-3" />
    </main>
    <main class="w-full h-full p-5 overflow-y-scroll grid lg:grid-cols-5 gap-5">
        <Card class="h-fit lg:col-span-5 order-2 lg:order-1">
            <template #title>Overview</template>
            <template #content>
                <section class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AdminDashboardCard header="cgpa" icon="grade" :content="formatGPA(dashboard.GPA)" />

                    <AdminDashboardCard header="registered courses" icon="auto_stories"
                        :content="dashboard.registeredCourses" bg-color="bg-[--blue-200]" />

                    <AdminDashboardCard header="results" icon="bar_chart" :content="dashboard.totalResults"
                        bg-color="bg-[--purple-200]" />

                    <AdminDashboardCard header="general info" icon="info" not-admin
                        :current-session="dashboard.currentSession.name"
                        :current-semester="dashboard.currentSemester.name" bg-color="bg-[--yellow-200]" />
                </section>
            </template>
        </Card>

        <Card class="lg:col-span-2 order-1 lg:order-2">
            <template #title>Profile</template>
            <template #content>
                <div class="md:flex md:flex-row md:items-center md:gap-2">
                    <img v-if="!dashboard.student.imageURL" src="../../assets/images/user.jpg" alt="user-img"
                        class="aspect-square w-20 rounded-full object-cover">
                    <img v-else :src="dashboard.student.imageURL" alt="user-img"
                        class="aspect-square w-20 rounded-full object-cover">
                    <div>
                        <p class="font-semibold text-xl">{{ dashboard?.student?.name ?? 'Student' }}</p>
                        <p class="font-medium text-[--primary-700]">{{ dashboard?.student?.regNumber }}</p>
                    </div>
                </div>

                <div class="mt-5">
                    <div class="grid gap-3">
                        <div class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] p-2">
                            <p>Level:</p>
                            <p class="font-bold">{{ dashboard.student.classId.currentLevel }}</p>
                        </div>
                        <div class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] p-2">
                            <p>Class:</p>
                            <p class="font-bold">{{ dashboard.student.classId.className }}</p>
                        </div>
                        <div class="flex gap-1 bg-[--highlight-bg] text-[--highlight-text-color] p-2">
                            <p>Advisor:</p>
                            <p class="font-bold">{{ dashboard?.advisor ?? 'Advisor' }}</p>
                        </div>
                    </div>
                </div>
            </template>

        </Card>

        <Card class="lg:col-span-3 w-[90dvw] md:w-[95dvw] lg:w-full order-3">
            <template #title>Performance</template>
            <template #content>
                <div style="height: calc(100dvh - 28rem)" class="w-full overflow-x-scroll">
                    <Chart type="line" :data="chartData" :options="chartOptions" class="h-full min-w-96" />
                </div>
            </template>
        </Card>
    </main>
</template>

<style scoped></style>