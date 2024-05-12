import { ref } from 'vue'

export function useNav() {
    let isOpen = ref(JSON.parse(localStorage.getItem('nav')) || false)


    function closeNav() {
        isOpen.value = false
        localStorage.setItem('nav', JSON.stringify(isOpen.value))
    }

    function toggleNav() {
        isOpen.value = !isOpen.value
        localStorage.setItem('nav', JSON.stringify(isOpen.value))
    }

    function checkWindowWidth() {
        if (window.innerWidth >= 1024) return
        isOpen.value = false
        localStorage.setItem('nav', JSON.stringify(isOpen.value))
    }

    return { isOpen, closeNav, toggleNav, checkWindowWidth}
}

