import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBFaiqoMVfTqLHsC8dNwDP4G0IoS-HVOwM",
    authDomain: "csc-portal-4d2d8.firebaseapp.com",
    projectId: "csc-portal-4d2d8",
    storageBucket: "csc-portal-4d2d8.appspot.com",
    messagingSenderId: "192148399398",
    appId: "1:192148399398:web:82295895a0b8ea6f944de7",
    measurementId: "G-HJQ9ZL55FX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, app };