<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios';


import Card from 'primevue/card';
import Fieldset from 'primevue/fieldset';
import Message from 'primevue/message';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { states } from '@/data/states';

const router = useRouter();
const toast = useToast();

let loading = ref({});

const account = ref(await getStudentAccount())
const currentUsername = ref(account.value.username)

let usernameError = ref(false)
let usernameHelpText = ref('')
function validateUsername() {
    if (account.value.username.length < 6) {
        usernameError.value = true;
        usernameHelpText.value = 'Username must be at least 6 characters.';
        return false
    }

    if (!/^[a-zA-Z0-9_]+$/.test(account.value.username)) {
        usernameError.value = true;
        usernameHelpText.value = 'Use only letters, numbers, and underscores.';
        return false
    }
    usernameError.value = false;
    usernameHelpText.value = '';
    return true
}

let isUsernameChanged = computed(() => (currentUsername.value !== account.value.username) && validateUsername())


async function getStudentAccount() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/student/account-details`, { credentials: 'include' });
        const data = await res.json();
        console.log(data)
        if (res.status === 200) {
            return data
        }
        return
    } catch (error) {
        console.error(error)
    }
}

const password = ref({})

let old = ref(false)
let newP = ref(false)
let confirm = ref(false)


let file = ref(null);
let label = ref(null);

function onSelect(event) {
    file.value = event.target.files[0];
    label.value.style.padding = 0;
    label.value.style.height = 0;
}

function cancelSelect() {
    file.value = null;
    label.value.style.padding = '0.6rem';
    label.value.style.height = 'auto';
}

let isPhotoValid = computed(() => {
    let size = file.value?.size ?? 0
    return (size / 1024) <= 500
})

async function uploadPicture() {
    loading.value.isUploadingPicture = true
    let imageURL = ''
    try {
        const url = await uploadFile(file.value, account.value.student)
        if (!url) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'There was an error uploading your photo. Please try again', life: 5000 })
            console.log('Error uploading file')
            return
        }
        imageURL = url
        const res = await fetch(`${import.meta.env.VITE_API}/student/upload-picture?studentId=${account.value.student._id}&url=${url}`, {
            method: 'PUT',
            credentials: 'include'
        });

        const data = await res.json();

        if (res.status === 200) {
            account.value.student.imageURL = data.imageURL
            return
        }
        await deleteFile(url)
        toast.add({ severity: 'error', summary: data.info, detail: data.message, life: 5000 })
    } catch (error) {
        console.error(error)
        await deleteFile(imageURL)
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
    } finally {
        loading.value.isUploadingPicture = false
    }
    return
}

//Change Username
async function changeUsername() {
    loading.value.changeUsername = true;
    try {
        const res = await fetch(`${import.meta.env.VITE_API} / student / change - username ? username = ${account.value.username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        const data = await res.json();
        if (res.status === 200) {
            account.value.username = data.username
            currentUsername.value = account.value.username
            toast.add({ severity: 'success', summary: 'Done', detail: 'Username changed. Redirecting to login...' })
            setTimeout(() => {
                router.push('/')
            }, 3000);
            return
        }
        toast.add({ severity: 'error', summary: data.info, detail: data.message, life: 5000 })
    } catch (error) {
        console.error(error)
        toast.add({ severity: 'error', summary: 'Error', detail: error.message })
    } finally {
        loading.value.changeUsername = false;
    }
}

</script>

<template>
    <Toast class="w-[70dvw] md:w-[30rem]" />
    <main class="w-full h-full overflow-scroll">
        <section class="p-5 w-dvw md:w-full">
            <Card>
                <template #title>Profile</template>
                <template #content>
                    <section style="height: calc(100dvh - 12.5rem)"
                        class="overflow-y-scroll grid gap-3 lg:gap-6 lg:grid-cols-7">
                        <div class="lg:col-span-2">
                            <Fieldset>
                                <template #legend>
                                    <div class="flex items-center">
                                        <span class="material-symbols-rounded">add_a_photo</span>
                                        <p>Profile Image</p>
                                    </div>
                                </template>
                                <div class="flex flex-col items-center justify-center">
                                    <img v-if="account.student.imageURL" :src="account.student.imageURL" alt="user"
                                        class="w-24 h-24 border-rounded object-fill">
                                    <img v-else src="../../assets/images/user.jpg" alt="user"
                                        class="w-24 h-24 border-rounded object-fill">

                                    <div class="mt-2">
                                        <label ref="label" for="profile-picture"
                                            class="overflow-hidden bg-[--primary-color] p-[0.6rem] gap-x-2 rounded-[--border-radius] flex flex-wrap items-center justify-center text-white cursor-pointer hover:bg-[--primary-700] transition-colors">
                                            <span class="pi pi-file-import"></span>
                                            <p>Upload</p>
                                            <input id="profile-picture" class="opacity-0 w-full h-0" type="file"
                                                accept=".jpg, .png, .jpeg" name="file" @input="onSelect">
                                        </label>

                                        <Button v-show="file" :loading="loading.isUploadingPicture"
                                            @click="uploadPicture" type="submit" icon="pi pi-upload" :label="file?.name"
                                            class="mt-3 w-full" :disabled="!isPhotoValid" />

                                        <Button v-show="file" @click="cancelSelect" severity="secondary" label="Cancel"
                                            text class="h-9 w-full" />
                                    </div>

                                    <Message icon="pi pi-info-circle" :closable="false">
                                        <p class="text-xs">
                                            Upload only .jpg, .jpeg, and .png files not more than 500KB.
                                        </p>
                                    </Message>
                                </div>
                            </Fieldset>

                            <Fieldset>
                                <template #legend>
                                    <div class="flex items-center">
                                        <span class="material-symbols-rounded">account_circle</span>
                                        <p>Account</p>
                                    </div>
                                </template>
                                <div class="grid gap-3">
                                    <div>
                                        <label class="text-sm font-semibold">Username</label>
                                        <InputText v-model.trim="account.username" class="w-full" />
                                        <small class="text-red-500" v-show="usernameError">{{ usernameHelpText
                                            }}</small>
                                    </div>

                                    <div>
                                        <Button :loading="loading.changeUsername" @click="changeUsername"
                                            label="Change Username" :disabled="!isUsernameChanged" />
                                    </div>
                                </div>
                            </Fieldset>
                        </div>

                        <div class="lg:col-span-5">
                            <Fieldset>
                                <template #legend>
                                    <div class="flex items-center">
                                        <span class="material-symbols-rounded">person</span>
                                        <p>Basic Information</p>
                                    </div>
                                </template>
                                <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    <div>
                                        <label class="text-sm font-semibold">Full Name</label>
                                        <InputText :value="account.student.name" readonly class="w-full" />
                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Reg. Number</label>
                                        <InputText :value="account.student.regNumber" readonly class="w-full" />

                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Entry Mode</label>
                                        <InputText :value="account.student.entryMode" readonly class="w-full" />
                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Date of Birth</label>
                                        <Calendar v-model.trim="account.student.dateOfBirth" date-format="dd/mm/yy"
                                            class="w-full" />
                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Sex</label>
                                        <Dropdown v-model.trim="account.student.sex" :options="['MALE', 'FEMALE']"
                                            class="w-full" />
                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Email Address</label>
                                        <InputText v-model.trim="account.student.email" class="w-full" />
                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Phone Number</label>
                                        <InputMask v-model.trim="account.student.phoneNumber" mask="09099999999"
                                            class="w-full" />
                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">State of Origin</label>
                                        <Dropdown v-model.trim="account.student.stateOfOrigin" :options="states"
                                            class="w-full" />
                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Nationality</label>
                                        <InputText v-model.trim="account.student.nationality" class="w-full" />
                                    </div>

                                    <div>
                                        <Button label="Save Changes" />
                                    </div>
                                </div>
                            </Fieldset>

                            <Fieldset>
                                <template #legend>
                                    <div class="flex items-center">
                                        <span class="material-symbols-rounded">lock_reset</span>
                                        <p>Change Password</p>
                                    </div>
                                </template>
                                <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">

                                    <div class="relative w-full">
                                        <label class="text-sm font-semibold">Old Password</label>

                                        <input v-model="password.old" class="v-password w-full"
                                            :type="old ? 'text' : 'password'" />

                                        <span @click="old = !old"
                                            :class="[old ? 'pi pi-eye-slash' : 'pi pi-eye', 'text-[--surface-400] absolute top-9 right-3']"></span>
                                    </div>

                                    <div class="relative w-full">
                                        <label class="text-sm font-semibold">New Password</label>

                                        <input v-model="password.newP" class="v-password w-full"
                                            :type="newP ? 'text' : 'password'" />

                                        <span @click="newP = !newP"
                                            :class="[newP ? 'pi pi-eye-slash' : 'pi pi-eye', 'text-[--surface-400] absolute top-9 right-3']"></span>
                                    </div>

                                    <div class="relative w-full">
                                        <label class="text-sm font-semibold">Confirm Password</label>

                                        <input v-model="password.confirm" class="v-password w-full"
                                            :type="confirm ? 'text' : 'password'" />

                                        <span @click="confirm = !confirm"
                                            :class="[confirm ? 'pi pi-eye-slash' : 'pi pi-eye', 'text-[--surface-400] absolute top-9 right-3']"></span>
                                    </div>

                                    <div>
                                        <Button label="Change Password" />
                                    </div>
                                </div>
                            </Fieldset>
                        </div>

                    </section>
                </template>
            </Card>
        </section>
    </main>

</template>