<script setup>
import { ref } from 'vue'
const props = defineProps({
    header: String,
})

let isOpen = ref(false)
</script>

<template>
    <div class="overflow-hidden">
        <div @click="isOpen = !isOpen" class="text-[--surface-500] flex items-center justify-between h-[3.2rem] py-4 px-4 cursor-pointer hover:bg-[--highlight-bg] hover:text-[--surface-700] transition-all rounded-[--border-radius]">

            <p v-if="header" class="font-[600]">{{ header }}</p>
            <span :class="isOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></span>

        </div>

        <div :class="['transition-all overflow-hidden', isOpen? 'opened': 'closed']">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.opened {
    max-height: 1000px;
    /* Adjust this value based on your content */
    transition: max-height 0.7s ease-in;
}

.closed {
    max-height: 0;
    transition: max-height 0.5s ease;
    transition-delay: 0;
}

</style>
