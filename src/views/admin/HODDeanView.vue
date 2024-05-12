<script setup>
import { ref, computed, onMounted } from 'vue';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import VTab from '@/components/VTab.vue';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";
import { validateEmail } from '@/composables/use-email';


//Constants
const toast = useToast();
const confirm = useConfirm();

const loading = ref({});
const newHod = ref({});
const newDean = ref({});

const data = ref(null);

async function getHodAndDean() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/hod-dean`, { credentials: 'include' });
        const json = await res.json();
        console.log(json);
        if (res.status === 200) {
            return json;
        }
        toast.add({
            severity: 'error',
            summary: json.info,
            detail: json.message
        });
        return null;
    } catch (error) {
        loading.value.error = true;
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message
        });
    }
}


//Changing the HOD
async function changeHod() {
    loading.value.isChangingHOD = true;
    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/change-hod`, {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json'
        },
            body: JSON.stringify({ newHod: newHod.value, oldHodUserId: data.value.hod.userId }),
            credentials: 'include'
        });
    const json = await res.json();

    if (res.status === 200) {
        data.value.hod = json.hod;
        data.value.hod.imageURL = json.hod.imageURL;
        data.value.staff = json.staffs;
        return
    }
    toast.add({
        severity: 'warning',
        summary: json.info,
        detail: json.message
    });
} catch (error) {
    console.error(error);
    toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message
    });
} finally {
    loading.value.isChangingHOD = false;
}
}

const confirmChangeHod = () => {
    confirm.require({
        message: `Are you sure you want to make ${newHod.value.name ?? ''} the new HOD?`,
        header: 'Confirmation',
        icon: 'pi pi-info-circle',
        rejectClass: 'p-button-secondary p-button-text',
        acceptClass: 'p-button',
        rejectLabel: 'Cancel',
        acceptLabel: 'Proceed',
        accept: changeHod,
    });
}


//Resetting login
async function resetLogin(user, loader) {
    let loading = loader
    loading = true
    try {
        const res = await fetch(`${import.meta.env.VITE_API}/admin/reset-hod-dean-login`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: user.userId, password: user.staffId }),
            credentials: 'include'
        });
        const json = await res.json();
        if (res.status === 200) {
            return toast.add({
                severity: 'success',
                summary: 'Success',
                detail: json.message
            })
        }
        return toast.add({
            severity: 'error',
            summary: json.info,
            detail: json.message
        })
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message
        });
    } finally {
        loading = false;
    }
}

const confirmHodReset = () => {
    confirm.require({
        message: 'Are you sure you want to proceed?',
        header: 'Confirmation',
        icon: 'pi pi-info-circle',
        rejectClass: 'p-button-secondary p-button-text',
        acceptClass: 'p-button',
        rejectLabel: 'Cancel',
        acceptLabel: 'Proceed',
        accept: () => resetLogin(data.value.hod, loading.value.isResetingHOD),
    });
}

const confirmDeanReset = () => {
    confirm.require({
        message: 'Are you sure you want to proceed?',
        header: 'Confirmation',
        icon: 'pi pi-info-circle',
        rejectClass: 'p-button-secondary p-button-text',
        acceptClass: 'p-button',
        rejectLabel: 'Cancel',
        acceptLabel: 'Proceed',
        accept: () => resetLogin(data.value.dean, loading.value.isResetingDean),
    });
}



//Creating a new dean
//Disables button is no name, title or staffId is provided
const isNewDeanDisabled = computed(() => !newDean.value.title || !newDean.value.name || !newDean.value.staffId);

async function addNewDean() {
    loading.value.isChangingDean = true;
    if (newDean.email) {
        if (!validateEmail(newDean.email)) {
            loading.value.isChangingDean = false;
            return toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please enter a valid email'
            })
        }
    }

    try {
        const res = await fetch(`${ import.meta.env.VITE_API }/admin/change-dean`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
        },
            body: JSON.stringify({ newDean: newDean.value }),
            credentials: 'include'
        });
    const json = await res.json();
    if (res.status === 200) {
        data.value.dean = json.dean;
        return toast.add({
            severity: 'success',
            summary: 'Success',
            detail: json.message
        })
    }
} catch (error) {
    console.error(error);
    toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message
    });
} finally {
    loading.value.isChangingDean = false;
}
}

onMounted(async () => {
    data.value = await getHodAndDean();
})

</script>

<template>
    <ConfirmDialog class="max-w-[30rem]" />
    <Toast class="w-[70dvw] md:w-[30rem]" />
    <main v-if="!data" class="w-dvw lg:w-full h-full p-5 grid gap-5 md:grid-cols-2">
        <Skeleton v-for="i in 2" height="85dvh" />
    </main>

    <main v-else class="w-dvw lg:w-full h-full overflow-y-scroll p-5 grid gap-5 md:grid-cols-2">
        <Card>
            <template #title>H.O.D</template>
            <template #content>
                <section style="height: calc(100dvh - 12.5rem);" class="overflow-y-scroll">
                    <div class="flex flex-col gap-3 items-center md:flex-row">
                        <img v-if="data.hod.imageURL" :src="data.hod.imageURL" alt="hod"
                            class="w-28 md:w-24 lg:w-28 aspect-square rounded-md object-cover">
                        <img v-else src="../../assets/images/user.jpg" alt="hod"
                            class="w-28 md:w-24 lg:w-28 aspect-square rounded-md object-cover">
                        <div class="text-center md:text-left">
                            <h1 class="text-2xl font-semibold">{{ data.hod.title }} {{ data.hod.name }}</h1>
                            <p class="mt-1 text-lg px-2 py-1 bg-[--highlight-bg] text-[--highlight-text-color]">HOD, CSC
                            </p>
                        </div>
                    </div>

                    <Divider />

                    <div class="grid grid-cols-5 mt-4">

                        <p class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-1">Staff ID:</p>
                        <p class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-4">{{
                            data.hod.staffId }}</p>

                        <p
                            class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-1 bg-[--highlight-bg] text-[--highlight-text-color]">
                            Sex:</p>
                        <p
                            class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-4 bg-[--highlight-bg] text-[--highlight-text-color] font-semibold">
                            {{ data.hod.sex ?? '' }}</p>

                        <p class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-1">Phone:</p>
                        <p class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-4">{{
                            data.hod.phoneNumber ?? '' }}</p>

                        <p
                            class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-1 bg-[--highlight-bg] text-[--highlight-text-color]">
                            Address:</p>
                        <p
                            class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-4 bg-[--highlight-bg] text-[--highlight-text-color] font-semibold">
                            {{ data.hod.address ?? '' }}</p>

                        <p class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-1">Email:</p>
                        <p class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-4">{{ data.hod.email
                            ?? '' }}</p>
                    </div>

                    <Divider />

                    <div>
                        <label class="text-sm font-semibold">Change H.O.D</label>
                        <Dropdown v-model="newHod" :options="data.staff" option-label="name" placeholder="Select staff"
                            class="w-full mt-1" />

                        <Button @click="confirmChangeHod" label="Make H.O.D" :loading="loading.isChangingHOD"
                            :disabled="!newHod._id" class="mt-4" />
                    </div>

                    <Divider />

                    <div>
                        <label class="text-sm font-semibold">Reset login details</label>

                        <small class="block text-[--red-500]">This will change the HOD's username and password to their
                            staff ID.</small>

                        <Button @click="confirmHodReset" label="Reset" severity="warning"
                            :loading="loading.isResetingHOD" class="mt-4 block" />
                    </div>
                </section>
            </template>
        </Card>

        <Card>
            <template #title>Dean</template>
            <template #content>
                <section style="height: calc(100dvh - 12.5rem);" class="overflow-y-scroll">
                    <div class="flex flex-col gap-3 items-center md:flex-row">
                        <img v-if="data.dean.imageURL" :src="data.dean.imageURL" alt="dean"
                            class="w-28 md:w-24 lg:w-28 aspect-square rounded-md object-cover">
                        <img v-else src="../../assets/images/user.jpg" alt="dean"
                            class="w-28 md:w-24 lg:w-28 aspect-square rounded-md object-cover">
                        <div class="text-center md:text-left">
                            <h1 class="text-2xl font-semibold">{{ data.dean.title }} {{ data.dean.name }}</h1>
                            <p class="mt-1 text-lg px-2 py-1 bg-[--highlight-bg] text-[--highlight-text-color]">Dean,
                                SICT</p>
                        </div>
                    </div>

                    <Divider />

                    <div class="grid grid-cols-5 mt-4">

                        <p class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-1">Staff ID:</p>
                        <p class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-4">{{
                            data.dean.staffId }}</p>

                        <p
                            class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-1 bg-[--highlight-bg] text-[--highlight-text-color]">
                            Sex:</p>
                        <p
                            class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-4 bg-[--highlight-bg] text-[--highlight-text-color] font-semibold">
                            {{ data.dean.sex ?? '' }}</p>

                        <p class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-1">Phone:</p>
                        <p class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-4">{{
                            data.dean.phoneNumber ?? '' }}</p>

                        <p
                            class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-1 bg-[--highlight-bg] text-[--highlight-text-color]">
                            Address:</p>
                        <p
                            class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-4 bg-[--highlight-bg] text-[--highlight-text-color] font-semibold">
                            {{ data.dean.address ?? '' }}</p>

                        <p class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-1">Email:</p>
                        <p class="px-1 py-1 md:py-2 text-center md:text-left col-span-5 md:col-span-4">{{
                            data.dean.email ?? '' }}</p>
                    </div>

                    <Divider />

                    <VTab header="New Dean">
                        <div class="p-2 grid gap-2">
                            <small class="text-red-500">* Required</small>
                            <div>
                                <label class="text-sm font-semibold">Title <span class="text-red-500">*</span></label>
                                <InputText v-model.trim="newDean.title" class="w-full" />
                            </div>

                            <div>
                                <label class="text-sm font-semibold">Name <span class="text-red-500">*</span></label>
                                <InputText v-model.trim="newDean.name" class="w-full" />
                            </div>

                            <div>
                                <label class="text-sm font-semibold">Staff ID <span
                                        class="text-red-500">*</span></label>
                                <InputText v-model.trim="newDean.staffId" class="w-full" />
                            </div>

                            <div>
                                <label class="text-sm font-semibold">Sex</label>
                                <Dropdown v-model="newDean.sex" :options="['MALE', 'FEMALE']" class="w-full" />
                            </div>

                            <div>
                                <label class="text-sm font-semibold">Email</label>
                                <InputText v-model.trim="newDean.email" class="w-full" />
                            </div>

                            <div>
                                <label class="text-sm font-semibold">Phone</label>
                                <InputMask v-model="newDean.phoneNumber" mask="09099999999" class="w-full" />
                            </div>

                            <div>
                                <label class="text-sm font-semibold">Address</label>
                                <InputText v-model.trim="newDean.address" class="w-full" />
                            </div>

                            <small class="text-red-500">Dean's Username and password will automatically be set to the
                                staff ID</small>

                            <Button @click="addNewDean" label="Add Dean" :loading="loading.isChangingDean"
                                :disabled="isNewDeanDisabled" class="mt-3 w-fit" />
                        </div>
                    </VTab>

                    <Divider />

                    <div>
                        <label class="text-sm font-semibold">Reset login details</label>

                        <small class="block text-[--red-500]">This will change the Dean's username and password to their
                            staff ID.</small>

                        <Button @click="confirmDeanReset" label="Reset" severity="warning"
                            :loading="loading.isResetingDean" class="mt-4 block" />
                    </div>
                </section>
            </template>
        </Card>
    </main>
</template>