<script setup>
import { ref } from 'vue'
import Button from 'primevue/button';

const props = defineProps({
    user: {
        type: Object,
        required: true
    }
})

let visible = ref(true)

</script>

<template>
    <div v-if="!user.email"
        :class="
        !visible? 'hidden' :
        'fixed right-1 top-1 w-[70dvw] md:w-[30rem] bg-[--blue-100] bg-opacity-10 p-4 border-2 border-[--blue-300] text-[--blue-700] rounded-md'">
        <header class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
                <span class="pi pi-exclamation-triangle"></span>
                <p class="font-semibold">Update Email</p>
            </div>

            <Button @click="visible = false" severity="info" icon="pi pi-times" rounded text />
        </header>

        <p>Please update your email address as soon as possible.</p>
    </div>

</template>