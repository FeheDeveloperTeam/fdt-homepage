import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyBbyBjAPMNSKXn_tzd1h0G2LF2ghy5bjj0",
  authDomain: "fehe-selfintroduction.firebaseapp.com",
  projectId: "fehe-selfintroduction",
  storageBucket: "fehe-selfintroduction.firebasestorage.app",
  messagingSenderId: "84438118334",
  appId: "1:84438118334:web:11ca0cda2cedd670b913ef",
  measurementId: "G-J46TBM80SC",
  databaseURL: "https://fehe-selfintroduction-default-rtdb.firebaseio.com"
}

export const firebaseApp = initializeApp(firebaseConfig)
