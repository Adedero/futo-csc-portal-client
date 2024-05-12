<script setup>
import LogoItem from '@/components/LogoItem.vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

import { ref, computed, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'


//Constants
const router = useRouter();
const route = useRoute();
const toast = useToast();

const password = ref(null);
const confirmPassword = ref(null);

const isMatched = computed(() => {
    if (password.value && confirmPassword.value) {
        return password.value.trim() === confirmPassword.value.trim();
    }
    return false;
})
//Loading state for the login button
let loading = ref(false)

async function resetPassword() {
    if (password.value.length < 8) {
        toast.add({ severity: 'info', summary: 'Info', detail: 'Password must be at least 8 characters.', life: 5000 })
    }
    loading.value = true;
    password.value.trim();
    confirmPassword.value.trim();
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/auth/reset-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                password: password.value,
                confirmPassword: confirmPassword.value,
                token: route.params.token,
                userId: route.params.userId,
            })
        });
        const data = await res.json();
        if (res.status === 200) {
            sessionStorage.removeItem('reset_token')
            toast.add({ severity: 'success', summary: 'Success', detail: data.message, life: 3000 });
            setTimeout(() => {
                router.push('/');
            }, 3000);
            return
        }
        return toast.add({
            severity: 'error',
            summary: data.info,
            detail: data.message,
            life: 3000
        })
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: error.message });
    } finally {
        loading.value = false;
    }
}

onBeforeMount(() => {
    sessionStorage.removeItem('reset_token');
})


</script>

<template>
    <main class="min-h-dvh py-10">
        <Toast class="w-[70dvw] md:w-[30rem]" />
        <header>
            <LogoItem />
        </header>

        <div class="w-full max-w-96 h-fit bg-white p-8 pb-10 mt-10 overflow-hidden mx-auto shadow-md rounded-md">
            <h1 class="font-bold text-2xl text-center">Reset Password</h1>

            <form class="mt-5">
                <div class="mt-6">
                    <label>New Password</label>
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-lock"></i>
                        </InputGroupAddon>
                        <Password v-model="password" placeholder="New Password" toggleMask :feedback="false" />
                    </InputGroup>
                </div>

                <div class="mt-6">
                    <label>Confirm Password</label>
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-lock"></i>
                        </InputGroupAddon>
                        <Password v-model="confirmPassword" placeholder="Confirm Password" toggleMask
                            :feedback="false" />
                    </InputGroup>
                    <small v-show="!isMatched" class="text-[--red-500]">Passwords do not match.</small>
                </div>

                <div class="mt-6 w-full">
                    <Button @click="resetPassword" class="w-full" label="Reset password" :loading="loading"
                        :disabled="!isMatched" />
                </div>
            </form>
        </div>
    </main>
</template>
