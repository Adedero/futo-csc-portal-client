<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import useFileUpload from '@/composables/use-firebase-upload'
import { validateEmail } from '@/composables/use-email';
import EmailAlert from '@/components/EmailAlert.vue'

import Card from 'primevue/card';
import Fieldset from 'primevue/fieldset';
import Message from 'primevue/message';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import Dropdown from 'primevue/dropdown';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const { uploadFile, deleteFile } = useFileUpload();
let loading = ref({});


const account = ref(await getStaffAccount())
const currentUsername = ref(account.value.username)
let originalDetails = reactive({
    name: account.value.staff.name,
    staffId: account.value.staff.staffId,
    title: account.value.staff.title,
    sex: account.value.staff.sex,
    phoneNumber: account.value.staff.phoneNumber,
    email: account.value.staff.email,
    address: account.value.staff.address
})

let isDisabled = computed(() => {
    for (let key of Object.keys(originalDetails)) {
        if (originalDetails[key] !== account.value.staff[key]) {
            return false;
        }
    }

    return true
})

let tempUrl = ref(null)
let messageText = ref('Upload only .jpg, .jpeg, and .png files not more than 500KB.')

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


async function getStaffAccount() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/dean/account-details`, { credentials: 'include' });
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


let file = ref(null);
let label = ref(null);

function onSelect(event) {
    if (!event.target.files.length) {
        return;
    }
    file.value = event.target.files[0];
    label.value.style.padding = 0;
    label.value.style.height = 0;


    const reader = new FileReader();

    // Set up the FileReader onload event to update the image preview
    reader.onload = function (event) {
        tempUrl.value = event.target.result; // Set the src attribute of the image to the data URL
    };

    // Read the selected file as a data URL
    reader.readAsDataURL(file.value);
}

function cancelSelect() {
    file.value = null;
    label.value.style.padding = '0.6rem';
    label.value.style.height = 'auto';
    tempUrl.value = null
    messageText.value = 'Upload only .jpg, .jpeg, and .png files not more than 500KB.'
}

let isPhotoValid = computed(() => {
    let size = file.value?.size ?? 0
    return (size / 1024) <= 500
})


async function uploadPicture() {
    loading.value.isUploadingPicture = true;
    let imageURL = '';
    try {
        // Delete previous image if it exists
        if (account.value.staff.imageURL) {
            await deleteFile(account.value.staff.imageURL);
            console.log('Previous image deleted');
        }

        // Upload new image and get its URL
        const url = await uploadFile(file.value, account.value.staff);
        if (!url) {
            loading.value.isUploadingPicture = false;
            toast.add({ severity: 'error', summary: 'Error', message: 'Failed to upload the photo', life: 5000 })
            throw new Error('Failed to upload the photo');
        }

        imageURL = url;

        // Send URL to backend
        const res = await fetch(`${import.meta.env.VITE_API}/dean/upload-picture`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                staffId: account.value.staff._id,
                url: url
            })
        });

        // Handle response from backend
        const data = await res.json();

        if (res.ok) {
            // Update user profile with new image URL
            toast.add({ severity: 'success', summary: 'Done', message: 'Profile picture updated successfully', life: 5000 })
            account.value.staff.imageURL = data.imageURL;
            file.value = null
            label.value.style.padding = '0.6rem';
            label.value.style.height = 'auto';
            return;
        } else {
            // If backend request fails, delete the uploaded file
            await deleteFile(url);
            toast.add({ severity: 'error', summary: 'Error', message: 'Failed to update profile picture', life: 5000 })
            throw new Error(data.message || 'Failed to update profile picture');
        }
    } catch (error) {
        console.error(error);
        await deleteFile(imageURL); // Cleanup on failure
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || error, life: 5000 });
    } finally {
        loading.value.isUploadingPicture = false;
    }
}

//Change Username
async function changeUsername() {
    loading.value.changeUsername = true;
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/dean/change-username?username=${account.value.username}`, {
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

//Add details to profile
async function updateProfile() {
    loading.value.isUpdatingProfiile = true

    let profile = {}
    for (let key of Object.keys(originalDetails)) {
        profile[key] = account.value.staff[key]
    }
    if (profile.email) {
        profile.email.trim()
        if (!validateEmail(profile.email)) {
            return toast.add({ severity: 'warn', summary: 'Invalid email address', life: 5000 })
        }
    }
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/dean/update-profile?staffId=${account.value.staff._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ profile })
        });
        const data = await res.json();
        if (res.status === 200) {
            toast.add({ severity: 'success', summary: 'Done', detail: 'Profile updated.', life: 5000 })
            for (let key of Object.keys(profile)) {
                account.value.staff[key] = profile[key]
                originalDetails[key] = profile[key]
            }
            return
        }
        toast.add({ severity: 'warn', summary: data.info, detail: data.message, life: 5000 })
        return
    } catch (error) {
        console.error(error)
        toast.add({ severity: 'error', summary: 'Error', detail: error.message })
    } finally {
        loading.value.isUpdatingProfiile = false;
    }
}

//Change password
const password = ref({
    old: '',
    newP: '',
    confirm: ''
})

let old = ref(false)
let newP = ref(false)
let confirm = ref(false)
let mismatch = computed(() => {
    return password.value.newP !== password.value.confirm
})

async function changePassword() {
    loading.value.isChangingPassword = true
    if (password.value.newP.length < 8) {
        loading.value.isChangingPassword = false
        toast.add({ severity: 'info', summary: 'Info', detail: 'Password must be at least 8 characters.', life: 5000 })
        return
    }
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/dean/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ password: password.value })
        });
        const data = await res.json();
        console.log(data);
        if (res.status === 200) {
            toast.add({ severity: 'success', summary: 'Done', detail: 'Password changed. Redirecting to login', life: 3000 })
            setTimeout(() => {
                router.push('/')
            }, 3000);
            return
        }
        toast.add({ severity: 'warn', summary: data.info, detail: data.message, life: 5000 })
        return
    } catch (error) {
        console.error(error)
        toast.add({ severity: 'error', summary: 'Error', detail: error.message })
    } finally {
        loading.value.isChangingPassword = false
    }
}

</script>

<template>
    <EmailAlert :user="account.staff" />
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
                                    <div v-if="tempUrl || account.staff.imageURL">
                                        <img v-if="tempUrl" :src="tempUrl" alt="user"
                                            class="w-24 h-24 rounded-full object-cover">
                                        <img v-else :src="account.staff.imageURL" alt="user"
                                            class="w-24 h-24 rounded-full object-cover">
                                    </div>

                                    <img v-else src="../../assets/images/user.jpg" alt="user"
                                        class="w-24 h-24 rounded-full object-cover">

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
                                            class="mt-3 w-full text-sm lg:text-base" :disabled="!isPhotoValid" />

                                        <Button v-show="file" @click="cancelSelect" severity="secondary" label="Cancel"
                                            text class="h-9 w-full" :disabled="loading.isUploadingPicture" />
                                    </div>

                                    <Message icon="pi pi-info-circle" :closable="false">
                                        <p class="text-xs">
                                            {{ messageText }}
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
                                        <small class="text-red-500" v-show="usernameError">
                                            {{ usernameHelpText }}
                                        </small>
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
                                        <InputText v-model.trim="account.staff.name" class="w-full" />
                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Staff ID</label>
                                        <InputText v-model.trim="account.staff.staffId" class="w-full" />

                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Faculty</label>
                                        <InputText :value="account.staff.school.acronymn" readonly class="w-full" />
                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Title</label>
                                        <InputText v-model.trim="account.staff.title" class="w-full" />
                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Sex</label>
                                        <Dropdown v-model.trim="account.staff.sex" :options="['MALE', 'FEMALE']"
                                            class="w-full" />
                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Email Address</label>
                                        <InputText v-model.trim="account.staff.email" class="w-full" />
                                    </div>

                                    <div>
                                        <label class="text-sm font-semibold">Phone Number</label>
                                        <InputMask v-model.trim="account.staff.phoneNumber" mask="09099999999"
                                            class="w-full" />
                                    </div>

                                    <div class="lg:col-span-2">
                                        <label class="text-sm font-semibold">House Address</label>
                                        <InputText v-model.trim="account.staff.address" class="w-full" />
                                    </div>

                                    <div>
                                        <Button @click="updateProfile" :loading="loading.isUpdatingProfiile"
                                            label="Save Changes" :disabled="isDisabled" />
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

                                        <input v-model.trim="password.old" class="v-password w-full"
                                            :type="old ? 'text' : 'password'" />

                                        <span @click="old = !old"
                                            :class="[old ? 'pi pi-eye-slash' : 'pi pi-eye', 'text-[--surface-400] absolute top-9 right-3']"></span>
                                    </div>

                                    <div class="relative w-full">
                                        <label class="text-sm font-semibold">New Password</label>

                                        <input v-model.trim="password.newP" class="v-password w-full"
                                            :type="newP ? 'text' : 'password'" />

                                        <span @click="newP = !newP"
                                            :class="[newP ? 'pi pi-eye-slash' : 'pi pi-eye', 'text-[--surface-400] absolute top-9 right-3']"></span>
                                    </div>

                                    <div class="relative w-full">
                                        <label class="text-sm font-semibold">Confirm Password</label>

                                        <input v-model.trim="password.confirm" class="v-password w-full"
                                            :type="confirm ? 'text' : 'password'" />

                                        <span @click="confirm = !confirm"
                                            :class="[confirm ? 'pi pi-eye-slash' : 'pi pi-eye', 'text-[--surface-400] absolute top-9 right-3']"></span>


                                        <small v-if="mismatch"
                                            class="text-red-500 absolute left-0 top-[4.2rem]">Password does not
                                            match.</small>
                                    </div>

                                    <div class="md:col-span-2">
                                        <Button @click="changePassword" :loading="loading.isChangingPassword"
                                            label="Change Password"
                                            :disabled="!password.old.trim() || !password.newP.trim() || !password.confirm.trim() || mismatch || password.old === password.newP" />
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