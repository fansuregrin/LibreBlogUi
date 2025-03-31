import { ref } from "vue"
import { defineStore } from "pinia"

export const useUserStore = defineStore('user', () => {
  const user = ref({})
  const setUser = (newUser) => {
    user.value = newUser
  }
  const removeUser = () => {
    user.value = {}
  }
  return { user, setUser, removeUser }
}, { persist: true })