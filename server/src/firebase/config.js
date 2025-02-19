// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBdb45eEIejqGSWKjWWw0yHavvvN3M-y7o",
    authDomain: "travel-3e0e5.firebaseapp.com",
    projectId: "travel-3e0e5",
    storageBucket: "travel-3e0e5.appspot.com",
    messagingSenderId: "575393964676",
    appId: "1:575393964676:web:a3884d86b8164884b818d1"
};

// initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage();