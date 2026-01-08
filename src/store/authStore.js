import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize auth listener
  initAuth: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await get().ensureUserProfile(user)
        set({ user, loading: false })
      } else {
        set({ user: null, loading: false })
      }
    })
  },

  // Login
  login: async (email, password) => {
    set({ error: null })
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      set({ error: getErrorMessage(error.code) })
      throw error
    }
  },

  // Register
  register: async (email, password, name) => {
    set({ error: null })
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      if (name) {
        await updateProfile(userCredential.user, { displayName: name })
      }
    } catch (error) {
      set({ error: getErrorMessage(error.code) })
      throw error
    }
  },

  // Logout
  logout: async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  // Ensure user profile exists in Firestore
  ensureUserProfile: async (user) => {
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      })
    } else {
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString()
      })
    }
  },

  clearError: () => set({ error: null })
}))

function getErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'Email inválido',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde'
  }
  return messages[code] || 'Error de autenticación'
}
