<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import Button from 'primevue/button';
import Card from 'primevue/card';

const route = useRoute()

let details = ref(await getCourseRegDetails()) //course registration details

async function getCourseRegDetails() {
    const courseRegId = route.params.id

    try {
        const res = await fetch(`${import.meta.env.VITE_API}/student/course-registration-details/${courseRegId}`, {
            credentials: 'include'
        })
        const data = await res.json()

        if (res.status === 200) {
            return data
        }
        console.log(data)
        return {}
    } catch (error) {
        console.log(error)
    }
}

function printDetails() {
    window.print()
}

</script>

<template>
    <main class="w-full h-full overflow-y-scroll p-5">
        <Card class="overflow-scroll">
            <template #title>
                <div class="flex gap-3 justify-between item-center max-w-[210mm]">
                    <h1>Courses</h1>
                    <Button @click="printDetails" label="Print" />
                </div>
            </template>

            <template #content>
                <div style="height: calc(100dvh - 14rem)" class="overflow-scroll mt-4">

                    <div
                        class="reg-courses-details overflow-y-scroll bg-white text-slate-700 rounded p-2 pb-10 md:gap-2 w-[210mm] border-2">

                        <div class="flex flex-col items-center justify-center shrink-0">
                            <img src="../../assets/images/futo-log.png" alt="futo-logo"
                                class="w-9 h-auto shrink-0 mb-4">

                            <h1 class="text font-semibold">
                                FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI
                            </h1>

                            <p class="text-sm font-semibold">DEPARTMENT OF COMPUTER SCIENCE (SICT)</p>
                        </div>

                        <div class="gap-2 mt-4 w-full grid grid-cols-5 p-5">
                            <img v-if="!details.student.imageURL" src="../../assets/images/user.jpg" alt="user"
                                class="rounded-full w-20 h-20 object-cover col-span-1">
                            <img v-else :src="details.student.imageURL" alt="user"
                                class="rounded-full w-20 aspect-square object-cover col-span-1">

                            <div class="text-[0.8rem] w-full items-center gap-2 p grid grid-cols-2 col-span-4">

                                <div class="grid grid-cols-3 gap-2 w-full">
                                    <p class="text-left">Full Name:</p>
                                    <span class="col-span-2 uppercase font-semibold">{{ details.student.name }}</span>
                                </div>

                                <div class="grid grid-cols-2 gap-2 w-full">
                                    <p class="text-left">Registration Number:</p>
                                    <span class="uppercase font-semibold">{{ details.student.regNumber }}</span>
                                </div>

                                <div class="grid grid-cols-3 gap-2 w-full">
                                    <p class="text-left">School:</p>
                                    <span class="col-span-2 uppercase font-semibold">SICT</span>
                                </div>

                                <div class="grid grid-cols-2 gap-1 w-full">
                                    <p class="text-left">Department:</p>
                                    <span class="uppercase font-semibold">Computer Science</span>
                                </div>

                                <div class="grid grid-cols-3 gap-2 w-full">
                                    <p class="text-left">Entry Mode:</p>
                                    <span class="col-span-2 uppercase font-semibold">{{ details.student.entryMode ?? ''
                                        }}</span>
                                </div>

                                <div class="grid grid-cols-2 gap-2 w-full">
                                    <p class="text-left">Level:</p>
                                    <span class="uppercase font-semibold">{{ details.level }}</span>
                                </div>

                                <div class="grid grid-cols-3 gap-2 w-full">
                                    <p class="text-left">Session:</p>
                                    <span class="col-span-2 uppercase font-semibold">{{ details.session }}</span>
                                </div>

                                <div class="grid grid-cols-2 gap-2 w-full">
                                    <p class="text-left">Semester:</p>
                                    <span class="uppercase font-semibold">{{ details.semester }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <table class="table w-full text-[0.8rem]">
                                <thead>
                                    <th>Course_Code</th>
                                    <th>Course_Title</th>
                                    <th>Units</th>
                                    <th>Type</th>
                                </thead>
                                <tbody>
                                    <tr v-for="course in details.courses" :key="course._id">
                                        <td>{{ course.code }}</td>
                                        <td>{{ course.title }}</td>
                                        <td>{{ course.unit }}</td>
                                        <td>{{ course.isElective ? 'ELECTIVE' : 'COMPULSORY' }}</td>
                                    </tr>

                                    <tr class="font-bold">
                                        <td></td>
                                        <td class="uppercase">Total</td>
                                        <td>{{ details.totalUnits }}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="mt-20 grid grid-cols-2 gap-y-16 text-[0.8rem] justify-items-center mx-auto">
                            <div
                                class="w-[70%] font-semibold p-1 border-t-2 border-t-slate-900 border-dashed text-center">
                                Student's Signature
                            </div>
                            <div
                                class="w-[70%] font-semibold p-1 border-t-2 border-t-slate-900 border-dashed text-center">
                                Date
                            </div>
                            <div
                                class="w-[70%] font-semibold p-1 border-t-2 border-t-slate-900 border-dashed text-center">
                                Advisor's Signature
                            </div>
                            <div
                                class="w-[70%] font-semibold p-1 border-t-2 border-t-slate-900 border-dashed text-center">
                                HOD's Signature
                            </div>
                        </div>
                    </div>

                </div>
            </template>
        </Card>
    </main>
</template>

<style>
@media print {
    body {
        visibility: hidden;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    .reg-courses-details {
        visibility: visible;
        border-radius: 0;
        border: 0;
        box-shadow: none;
        width: 100dvw;
        padding: 0;
        position: absolute;
        top: 0;
        left: 0;
    }

    title {
        display: none;
    }
}
</style>