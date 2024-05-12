<script setup>
import { useRoute } from 'vue-router'
import { useDate } from '@/composables/use-date';

const route = useRoute();
const props = defineProps({
    paginatedStudents: {
        type: Array,
        required: true,
        default: []
    },
    result: Object,
    numberOfGrades: Object,
    percentageGrades: Object,
})
</script>

<template>
    <div style="height: calc(100dvh - 14rem)" id="ogr" class="print-content overflow-scroll mt-4">

        <div v-for="(group, index) in paginatedStudents" :key="index"
            class="result-ogr overflow-y-scroll bg-white text-slate-700 rounded p-5 pb-10 md:gap-2 w-[210mm] h-[297mm] border-2">

            <div class="flex items-center  gap-2 shrink-0">
                <img src="../assets/images/futo-log.png" alt="futo-logo" class="w-12 h-auto shrink-0 mb-4">
                <div class="mx-auto flex flex-col items-center justify-center">
                    <h1 class="text-[0.9rem] font-semibold">FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI</h1>
                    <p class="text-[0.8rem] font-semibold">OFFICIAL GRADE REPORT</p>
                </div>
            </div>


            <div class="flex items-center gap-16 text-[0.63rem]">
                <div>
                    <p>School of Student: SICT</p>
                    <p>Department: COMPUTER SCIENCE</p>
                    <p>Title of Course: {{ result.course.title.toUpperCase() }}</p>
                    <p>School Offering Course: {{ result.course.schoolOfferingCourse }}</p>
                </div>

                <div>
                    <p>Semester: {{ result.semester?? route.params.semester }}</p>
                    <p>Session: {{ result.session ? result.session.split('-').join('/') :
            route.params.session.split('-').join('/') }}</p>
                    <div class="flex items-center gap-5">
                        <p>Course Code: {{ result.course.code }}</p>
                        <p>Units: {{ result.course.unit }}</p>
                    </div>
                    <p>Date: {{ useDate(result.updatedAt?? result.approvalDate) }}</p>
                </div>
            </div>

            <div class="mt-4">
                <div class="h-[190mm]">
                    <table class="table-bordered text-[0.63rem] w-full">
                        <thead class="text-center">
                            <tr>
                                <th>SN</th>
                                <th>NAMES</th>
                                <th>REG. NO.</th>
                                <th>PROGRAM</th>
                                <th>TEST</th>
                                <th v-if="result.course.hasPractical">LAB</th>
                                <th>EXAM</th>
                                <th>TOTAL</th>
                                <th>GRADE</th>
                                <th>RMK</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(student, i) in group" :key="student._id" class="text-center">
                                <td>{{ (index * 40) + i + 1 }}</td>
                                <td v-if="student" class="text-left uppercase">{{ student.name }}</td>
                                <td v-if="student">{{ student.regNumber }}</td>
                                <td>CSC</td>
                                <td v-if="student">{{ student.testScore }}</td>
                                <td v-if="student && result.course.hasPractical">{{ student.labScore ?? '-' }}</td>
                                <td v-if="student">{{ student.examScore }}</td>
                                <td v-if="student">{{ student.totalScore }}</td>
                                <td v-if="student">{{ student.grade }}</td>
                                <td v-if="student">{{ student.remark }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>


                <div class="text-[0.63rem] grid grid-cols-3 mt-7">
                    <div class="border-t-2 border-t-black grid place-content-center">Head of Department</div>
                    <div class="border-t-2 border-t-black grid place-content-center mt-5">Dean of School</div>
                    <div class="border-t-2 border-t-black grid place-content-center">Examiner(s)</div>
                </div>

                <div class="ml-auto mt-4 text-[0.63rem] w-80 border-2 border-black px-4">
                    <p class="text-center">Grading System:</p>
                    <div class="flex items-center justify-between">
                        <div>
                            <p>70% and Above: A</p>
                            <p>60% - 69%: B</p>
                            <p>50% - 59%: C</p>
                        </div>
                        <div>
                            <p>45% - 49%: D</p>
                            <p>40% - 44%: E</p>
                            <p>Below 40%: F</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-1 text-right text-[0.63rem] italic">page {{ index + 1 }}</div>
        </div>

        <!-- Summary page -->
        <div class="result-ogr bg-white text-slate-700 rounded p-5 pb-10 md:gap-2 w-[210mm] h-[297mm] border-2">
            <div class="flex items-center  gap-2 shrink-0">
                <img src="../assets/images/futo-log.png" alt="futo-logo" class="w-12 h-auto shrink-0 mb-4">
                <div class="mx-auto flex flex-col items-center justify-center">
                    <h1 class="text-[0.9rem] font-semibold">FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI</h1>
                    <p class="text-[0.8rem] font-semibold">OFFICIAL GRADE REPORT</p>
                </div>
            </div>


            <div class="flex items-center gap-16 text-[0.63rem]">
                <div>
                    <p>School of Student: SICT</p>
                    <p>Department: COMPUTER SCIENCE</p>
                    <p>Title of Course: {{ result.course.title.toUpperCase() }}</p>
                    <p>School Offering Course: SICT</p>
                </div>

                <div>
                    <p>Semester: {{ result.semester ?? route.params.semester }}</p>
                    <p>Session: {{ result.session ? result.session.split('-').join('/'):
                        route.params.session.split('-').join('/') }}</p>
                    <div class="flex items-center gap-5">
                        <p>Course Code: {{ result.course.code }}</p>
                        <p>Units: {{ result.course.unit }}</p>
                    </div>
                    <p>Date: {{ useDate(result.updatedAt ?? result.approvalDate) }}</p>
                </div>
            </div>

            <div class="mt-4">
                <div class="h-[190mm]">
                    <h1 class="font-semibold text-[0.8rem]">SUMMARY</h1>
                    <div>
                        <table class="table-bordered text-[0.63rem] w-1/2">
                            <thead>
                                <tr>
                                    <th>Grade</th>
                                    <th>Number of Students</th>
                                    <th>Grade Percentage</th>
                                </tr>
                            </thead>
                            <tbody class="text-center">
                                <tr>
                                    <td>A</td>
                                    <td>{{ numberOfGrades.gradeA }}</td>
                                    <td>{{ percentageGrades.pA }}%</td>
                                </tr>
                                <tr>
                                    <td>B</td>
                                    <td>{{ numberOfGrades.gradeB }}</td>
                                    <td>{{ percentageGrades.pB }}%</td>
                                </tr>
                                <tr>
                                    <td>C</td>
                                    <td>{{ numberOfGrades.gradeC }}</td>
                                    <td>{{ percentageGrades.pC }}%</td>
                                </tr>
                                <tr>
                                    <td>D</td>
                                    <td>{{ numberOfGrades.gradeD }}</td>
                                    <td>{{ percentageGrades.pD }}%</td>
                                </tr>
                                <tr>
                                    <td>E</td>
                                    <td>{{ numberOfGrades.gradeE }}</td>
                                    <td>{{ percentageGrades.pE }}%</td>
                                </tr>
                                <tr>
                                    <td>F</td>
                                    <td>{{ numberOfGrades.gradeF }}</td>
                                    <td>{{ percentageGrades.pF }}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="text-[0.63rem] grid grid-cols-3 mt-7">
                    <div class="border-t-2 border-t-black grid place-content-center">Head of Department</div>
                    <div class="border-t-2 border-t-black grid place-content-center mt-5">Dean of School</div>
                    <div class="border-t-2 border-t-black grid place-content-center">Examiner(s)</div>
                </div>

                <div class="ml-auto mt-4 text-[0.63rem] w-80 border-2 border-black px-4">
                    <p class="text-center">Grading System:</p>
                    <div class="flex items-center justify-between">
                        <div>
                            <p>70% and Above: A</p>
                            <p>60% - 69%: B</p>
                            <p>50% - 59%: C</p>
                        </div>
                        <div>
                            <p>45% - 49%: D</p>
                            <p>40% - 44%: E</p>
                            <p>Below 40%: F</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-1 text-right text-[0.63rem] italic">page {{ paginatedStudents.length + 1 }}</div>
        </div>
    </div>
</template>