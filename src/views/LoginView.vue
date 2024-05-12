<script setup>
import { ref, reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '../stores/user.store'

import LogoItem from '@/components/LogoItem.vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';


//Constants
const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

//Login details
const user = reactive({
    username: '',
    password: ''
})

//Loading state for the login button
let loading = ref(false)

//Function that logs the user in and redirects them to the correct route
async function login() {
    loading.value = true

    try {
        const response = await fetch(`${import.meta.env.VITE_API}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })

        const data = await response.json()
        //console.log(data)

        if (data.info) {
            toast.add({ severity: 'warn', summary: 'Warning', detail: data.info.message, life: 5000 })
            return
        }
        //Saves user to localstorage
        userStore.setUser(data.user)

        let role = data.user.role

        switch (role) {
            case 'ADMIN':
                router.push('/admin')
                break
            case 'HOD':
                router.push('/hod')
                break
            case 'DEAN':
                router.push('/dean')
                break   
            case 'ADVISOR':
                router.push('/advisor')
                break
            case 'STAFF':
                router.push('/staff')
                break
            case 'STUDENT':
                router.push('/student')
                break
            default:
                router.push('/')
        }
        user.username = '',
        user.password = ''
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error logging in', detail: error, life: 5000 });
        console.log(error)
    } finally {
        loading.value = false
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
            <h1 class="font-bold text-2xl text-center">Login</h1>

            <form class="mt-5">
                <div class="mt-6">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-user"></i>
                        </InputGroupAddon>
                        <InputText v-model="user.username" placeholder="Username" />
                    </InputGroup>
                </div>

                <div class="mt-6">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-lock"></i>
                        </InputGroupAddon>
                        <Password v-model="user.password" placeholder="Password" toggleMask :feedback="false" />
                    </InputGroup>
                </div>

                <div class="mt-6 text-sm font-medium">
                    <router-link to="/password-recovery" class="hover:text-[--blue-500] hover:underline">
                        Forgot password?
                    </router-link>
                </div>

                <div class="mt-6 w-full">
                    <Button @click="login" class="w-full" label="Login" :loading="loading"
                        :disabled="user.username === '' || user.password === ''" />
                </div>
            </form>
        </div>
    </main>
</template>
