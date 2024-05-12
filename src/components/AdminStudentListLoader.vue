<script setup>
import Panel from 'primevue/panel';
import Skeleton from 'primevue/skeleton';
</script>

<template>
    <Panel>
        <template #header>
            <div class="flex items-center gap-2">
                <Skeleton shape="circle" size="2.5rem"></Skeleton>
                <Skeleton width="15rem" height="1.5rem" borderRadius="50px"></Skeleton>
            </div>
        </template>

        <template #icons>
            <div class="flex items-center gap-5 mr-2">
                <Skeleton v-for="i in 2" :key="i" shape="circle" size="1.2rem"></Skeleton>
            </div>
        </template>

        <div class=" flex items-center justify-between -mt-3">
            <Skeleton v-for="i in 3" :key="i" width="8rem" border-radius="50px" height="1rem"></Skeleton>
        </div>
    </Panel>
</template>