<script setup>
import Button from 'primevue/button';
import LogoComp from '../components/LogoComp.vue'
import { ref } from 'vue'

const props = defineProps({
    headerColor: String,
    isOpen: Boolean,
})

const emits = defineEmits(['close-nav', 'toggle-nav'])


const opened = 'w-72 md:w-60 xl:w-72 transition-all'
const baseClasses = 'text-nowrap bg-inherit h-full fixed z-50 left-0 top-0 overflow-hidden z-20 shadow-lg lg:relative lg:shadow transition-all shrink-0 text-xs leading-[1.4rem]'
</script>

<template>
    <main class="h-dvh flex">
        <nav :class="[
            baseClasses,
            isOpen ? opened : 'w-0',
        ]">

            <slot name="app-bar"></slot>

        </nav>

        <div
        @click="$emit('close-nav')"
        id="nav-overlay"
        :class="[
            'lg-hidden bg-slate-900 h-full w-full fixed overflow-hidden lg:hidden',
            isOpen ? 'z-10 opacity-10' : 'opacity-0 -z-20'
        ]"></div>

        <section class="grow w-96">
            <header
            :class="[
                'flex items-center gap-5 w-full h-16 max-h-16 overflow-hidden px-5 top-0 shadow',
                headerColor
            ]">

                <div class="flex items-center gap-2">
                    <Button
                    class="h-8"
                    @click="$emit('toggle-nav')"
                    icon="pi pi-bars"
                    outlined />

                    <LogoComp />
                </div>

                

                <div class="w-full">

                    <slot name="app-header"></slot>

                </div>
            </header>

            <div class="app-main w-full max-w-full overflow-hidden">

                <slot name="app-main"></slot>

            </div>
        </section>

    </main>
</template>

<style scoped>
.app-main {
    height: calc(100% - 4rem);
}
</style>