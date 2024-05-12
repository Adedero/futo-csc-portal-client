<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

import Menu from 'primevue/menu';
import InputGroup from 'primevue/inputgroup';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';


import VApp from '@/layouts/VApp.vue'
import { useNav } from '@/composables/use-nav'



let admin = ref({})

let { isOpen, closeNav, toggleNav, checkWindowWidth } = useNav()

const router = useRouter()

function logout() {
    fetch(`${import.meta.env.VITE_API}/auth/logout`)
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.log(error))

    sessionStorage.removeItem('user')

    router.push('/')
}

const items = ref([
    {
        separator: true
    },
    {
        label: 'Home',
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-th-large',
                route: '/admin'
            }
        ]
    },
    {
        separator: true
    },
    {
        label: 'Users',
        items: [
            {
                label: 'Students',
                icon: 'pi pi-users',
                route: { name: 'admin-students' }
            },
            {
                label: 'Staff',
                icon: 'pi pi-briefcase',
                route: { name: 'admin-staff' }
            },
            {
                label: 'Advisors',
                icon: 'pi pi-id-card',
                route: { name: 'admin-advisors' }
            },
            {
                label: 'HOD & Dean',
                icon: 'pi pi-user',
                route: { name: 'hod-dean' }
            }
        ]
    },
    {
        separator: true
    },
    {
        label: 'Items',
        items: [
            {
                label: 'Classes',
                icon: 'pi pi-table',
                route: { name: 'admin-classes' }
            },
            {
                label: 'Courses',
                icon: 'pi pi-book',
                route: { name: 'admin-courses' }
            },
            /* {
                label: 'Results',
                icon: 'pi pi-chart-line',
                route: '/'
            } */
        ]
    },
    {
        separator: true
    },
    {
        label: 'Admin',
        items: [
            {
                label: 'Settings',
                icon: 'pi pi-cog',
                route: { name: 'admin-settings' }
            },
            {
                label: 'Account',
                icon: 'pi pi-shield',
                route: { name: 'admin-account' }
            },
            {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                url: '#',
                command: () => {
                    localStorage.removeItem('user')
                    logout()
                    router.push('/')
                }
            }
        ]
    }
])



async function getAdminNameAndEmail() {
    try {
        const response = await fetch(`${ import.meta.env.VITE_API }/admin/admin-header`, {
            credentials: 'include'
        })
const data = await response.json();
if (data.info) {
    router.push('/')
    return
}
admin.value = data
    } catch (error) {
    console.log(error)
    router.push('/')
}
}

onMounted(() => getAdminNameAndEmail())
</script>

<template>
    <v-app :is-open="isOpen" @close-nav="closeNav()" @toggle-nav="toggleNav()" header-color="bg-white">

        <template #app-bar>
            <Menu :model="items" class="h-full overflow-y-scroll">
                <template #start>
                    <div class="py-2">
                        <InputGroup>
                            <InputText placeholder="Search..." />
                            <Button icon="pi pi-search" severity="primary" />
                        </InputGroup>
                    </div>
                </template>
                <template #submenuheader="{ item }">
                    <span class="text-[--primary-color] font-bold">{{ item.label }}</span>
                </template>
                <template #item="{ item, props }">
                    <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                        <span @click="checkWindowWidth()">
                            <a :href="href" v-bind="props.action" @click="navigate">
                                <span :class="item.icon" />
                                <span class="ml-2">{{ item.label }}</span>
                            </a>
                        </span>
                    </router-link>
                    <a v-else :href="item.url" v-bind="props.action">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                    </a>
                </template>
            </Menu>
        </template>

        <template #app-header>
            <div class="flex items-center justify-end gap-2">
                <div class="hidden md:block text-right">
                    <p class="text-xs font-bold">{{ admin.name }}</p>
                    <p class="text-[0.65rem]">{{ admin.email ?? '' }}</p>
                </div>
                <div>
                    <img v-if="admin.imageURL" class="w-9 h-9 object-cover rounded-md" :src="admin.imageURL"
                        alt="user-image">
                    <img v-else class="w-9 h-9 object-cover rounded-md" src="../../assets/images/user.jpg"
                        alt="user-image">
                </div>
            </div>
        </template>

        <template #app-main>
            <Suspense>
                <template #default>
                    <RouterView />
                </template>
                <template #fallback>
                    <div id="overlay"
                        class="fixed top-0 left-0 h-dvh w-dvw z-50 bg-white flex items-center justify-center">
                        <div class="flex items-center justify-center">
                            <img src="../../assets/images/logo.svg" alt="">
                            <div class="spinner"> </div>
                        </div>
                    </div>
                </template>
            </Suspense>

        </template>
    </v-app>
</template>

<style>
a:hover {
    @apply bg-[--highlight-bg]
}

a.router-link-exact-active {
    @apply bg-[--primary-color] text-[--primary-color-text]
}


#overlay .spinner {
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 4px solid var(--green-700);
    width: 100px;
    height: 100px;
    animation: spin 1s linear infinite;
    position: absolute;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>