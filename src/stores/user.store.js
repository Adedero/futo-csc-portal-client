import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref(JSON.parse(sessionStorage.getItem('user')) || {})

  function setUser(value) {
    user.value = sessionStorage.setItem('user', JSON.stringify(value))
  }

  return { user, setUser }
})
