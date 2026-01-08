import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDYu8pGr9ceS4vLxCKm2i_QwXaMu-Eq0dU",
  authDomain: "note-taker-ai-8bc38.firebaseapp.com",
  projectId: "note-taker-ai-8bc38",
  storageBucket: "note-taker-ai-8bc38.firebasestorage.app",
  messagingSenderId: "491247346612",
  appId: "1:491247346612:web:848d99e0f9331b897408e1",
  measurementId: "G-K0N0PNGSQD"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
