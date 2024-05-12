<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
    placeholder: {
        type: String,
        default: ''
    },
    modelValue: {
        type: String,
        default: ''
    }
})
const emits = defineEmits(['update:modelValue', 'change'])

let internalValue = ref(props.modelValue)

const handleChange = (event) => {
    internalValue.value = event.target.value
    emits('update:modelValue', internalValue.value)
}

let visible = ref(false)

const icon = computed(() => {
    return visible.value ? 'pi pi-eye-slash' : 'pi pi-eye'
})



</script>

<template>
    <div class="relative w-full">
        <input :value="internalValue" class="v-password" :type="visible ? 'text' : 'password'" :placeholder="placeholder"
            @input="handleChange" @change="$emit('change')" />
        <span @click="visible = !visible" :class="[icon, 'text-[--surface-400] absolute top-3 right-3']"></span>
    </div>
</template>


<style scoped>
.v-password {
    @apply border-[1.5px] border-[--surface-300] hover:border-[--surface-400] focus:border-[--primary-color] focus:shadow-none shadow-sm rounded-[--border-radius] outline-none transition-[border] p-2 pr-10 w-full
}
</style>