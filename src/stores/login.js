import { ref } from "vue"
import { defineStore } from "pinia"

export const useLoginDataStore = defineStore('loginData', () => {
  const loginData = ref('')
  const setLoginData = (newValue) => {
    loginData.value = newValue
  }
  const removeLoginData = () => {
    loginData.value = ''
  }

  return { loginData, setLoginData, removeLoginData }
}, { persist: true })