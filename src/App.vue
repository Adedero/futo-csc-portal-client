<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
    <main id="main">
        <RouterView />
    </main>
</template>

<style>

*::-webkit-scrollbar {
    display: none;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family:  Roboto, sans-serif;
    overflow: hidden;
    color: var(--text-color);
    background-color: var(--surface-50);
}

#app {
    height: 100dvh;
    width: 100dvw;
    overflow-y: scroll;
}

#main {
    min-height: 100dvh;
}
</style>
