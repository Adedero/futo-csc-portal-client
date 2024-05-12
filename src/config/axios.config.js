import axios from 'axios'

export const CSC = axios.create({
    baseURL: 'http://localhost:6060/',
    timeout: 20000,
    withCredentials: true, 
})