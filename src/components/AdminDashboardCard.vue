<script setup>
const props = defineProps({
    header: String,
    icon: String,
    content: Number,
    contentText: String,
    bgColor: {
        type: String,
        default: 'bg-[--primary-200]'
    },
    notAdmin: Boolean,
    currentSession: String,
    currentSemester: String,
    advisor: Boolean,
    className: String,
    numberOfStudents: Number
})
</script>

<template>
    <div :class="[
        bgColor,
        'p-4 flex flex-col justify-between overflow-hidden rounded-md min-h-32'
        ]">
        <header class="w-full flex items-center justify-between">
            <p class="font-medium uppercase">{{ header }}</p>
            <span class="material-symbols-rounded">{{ icon }}</span>
        </header>
        <div>
            <h1 class="font-medium text-4xl">{{ content }}</h1>
            <h1 class="font-medium text-4xl">{{ contentText }}</h1>
        </div>

        <div v-if="notAdmin">
            <p class="text-sm">Session: <span class="text-lg font-medium">{{ currentSession }}</span></p>
            <p class="text-sm">Semester: <span class="text-lg font-medium">{{ currentSemester }}</span></p>
        </div>

        <div v-if="advisor">
            <p class="text-sm">Class: <span class="text-lg font-medium">{{ className }}</span></p>
            <p class="text-sm">Students: <span class="text-lg font-medium">{{ numberOfStudents }}</span></p>
        </div>
    </div>
</template>