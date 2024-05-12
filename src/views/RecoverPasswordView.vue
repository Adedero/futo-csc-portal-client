<script setup>
import LogoItem from '@/components/LogoItem.vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

import { computed, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { maskEmail } from '@/composables/use-email'

const router = useRouter();
const toast = useToast()

let loading = ref(false);


const identifier = ref('')

let userId = ref(null)
let username = ref(null)
let email = ref('')
let message = ref('')

const userExists = computed(() => username.value !== null);

async function verify() {
    loading.value = true;
    identifier.value.trim();
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/auth/verify-identity?identifier=${identifier.value}`, {
            method: 'POST',
            credentials: 'include'
        });
        const data = await res.json();
        console.log(data)
        if (res.status === 200) {
            userId.value = data.userId;
            username.value = data.username;
            email.value = data.email;
            message.value = data.message;
            return
        }
        toast.add({
            severity: 'error',
            summary: data.info,
            detail: data.message,
            life: 5000
        })
    } catch (error) {
        console.error(error)
        toast.add({ severity: 'error', summary: 'Error', detail: error.message })
    } finally {
        loading.value = false;
    }
}

let isResendDisabled = ref(false)
let timer = ref(0)


let countdown = () => {
    let intervalId = setInterval(() => {
        timer.value--;
        if (timer.value <= 0) {
            clearInterval(intervalId);
        }
    }, 1000);
};

async function resendEmail() {
    loading.value = true;
    email.value.trim();
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/auth/resend-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                userId: userId.value,
                email: email.value
            })
        });
        const data = await res.json();
        console.log(data)
        if (res.status !== 200) {
            toast.add({
                severity: 'error',
                summary: data.info,
                detail: data.message,
                life: 5000
            })
            return
        }
        toast.add({
            severity: 'success',
            summary: data.info,
            detail: data.message,
            life: 5000
        })

        isResendDisabled.value = true;

        timer.value = 10;

        countdown();

        setTimeout(() => {
            isResendDisabled.value = false;
            timer.value = 0;
        }, 10000);

        return
    } catch (error) {
        console.error(error)
        toast.add({ severity: 'error', summary: 'Error', detail: error.message })
    } finally {
        loading.value = false;
    }
}

//Token verification
const token = ref(null);
const isVerifying = ref(false);


async function verifyToken() {
    isVerifying.value = true;
    token.value.trim();
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/auth/verify-token?userId=${userId.value}&token=${token.value}`, { credentials: 'include' });
        const data = await res.json();
        if (res.status === 200) {
            sessionStorage.setItem('reset_token', token.value);
            router.push({
                name: 'password-reset',
                params: {
                    userId: data.userId,
                    token: data.token,
                }
            })
            return
        }
        return toast.add({
            severity: 'error',
            summary: data.info,
            detail: data.message,
            life: 5000
        })
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: error.message })
    } finally {
        isVerifying.value = false;
    }
}
</script>

<template>
    <main class="min-h-dvh py-10">
        <Toast class="w-[70dvw] md:w-[30rem]" />
        <header>
            <LogoItem />
        </header>

        <div class="w-full max-w-96 h-fit bg-white p-8 pb-10 mt-10 overflow-hidden mx-auto shadow-md rounded-md">
            <h1 class="font-bold text-2xl text-center">{{ username ? 'Email Sent' : 'Password Recovery' }}</h1>

            <section v-if="!userExists" class="mt-5">
                <div class="mt-6">
                    <label class="font-thin">Enter your username, registration number or staff ID</label>
                    <InputGroup class="mt-3">
                        <InputGroupAddon>
                            <i class="pi pi-user"></i>
                        </InputGroupAddon>
                        <InputText v-model="identifier" />
                    </InputGroup>
                </div>

                <div class="mt-6 w-full">
                    <Button @click="verify" class="w-full" label="Verify" :loading="loading"
                        :disabled="!identifier.trim()" />
                </div>
            </section>



            <section v-else class="mt-5">
                <p>Username: <span class="font-semibold text-[--primary-color]">{{ username ?? '' }}</span></p>
                <p>Email: <span class="font-semibold text-[--primary-color]">{{ maskEmail(email) }}</span></p>

                <div class="mt-4 font-thin">
                    <p>Copy and paste the token sent to your email.</p>

                    <InputGroup class="mt-3">
                        <InputGroupAddon>
                            <i class="pi pi-lock"></i>
                        </InputGroupAddon>
                        <InputText v-model="token" />
                    </InputGroup>

                    <div class="mt-4 w-full">
                        <Button @click="verifyToken" class="w-full" label="Verify token" :loading="isVerifying"
                            :disabled="!token || !token.trim()" />
                    </div>

                    <Divider />
                    <p>Didn't get the email? Check your spam folder.</p>
                </div>

                <div class="mt-6 w-full">
                    <Button severity="secondary" @click="resendEmail" class="w-full"
                        :label="`Resend email ${timer !== 0 ? timer + 's' : ''}`" :loading="loading"
                        :disabled="isResendDisabled" />
                </div>
            </section>
        </div>

        <div class="mt-4 font-medium text-center">
            <router-link to="/" class="hover:text-[--blue-500] hover:underline">
                Log in <span class="pi pi-sign-in"></span>
            </router-link>
        </div>
    </main>
</template>
