import { create } from 'zustand'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export const useTasksStore = create((set, get) => ({
  sessions: [],
  tasks: [],
  loading: true,
  unsubscribe: null,

  // Subscribe to sessions
  subscribeToSessions: (userId) => {
    const sessionsRef = collection(db, `users/${userId}/sessions`)
    const q = query(sessionsRef, orderBy('timestamp', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = []
      snapshot.forEach((doc) => {
        sessions.push({ id: doc.id, ...doc.data() })
      })

      // Extract all tasks from sessions
      const tasks = []
      sessions.forEach((session) => {
        if (session.tasks) {
          session.tasks.forEach((task, idx) => {
            tasks.push({
              ...task,
              sessionId: session.id,
              taskIndex: idx,
              date: session.date
            })
          })
        }
      })

      set({ sessions, tasks, loading: false })
    })

    set({ unsubscribe })
  },

  // Unsubscribe
  unsubscribeFromSessions: () => {
    const { unsubscribe } = get()
    if (unsubscribe) unsubscribe()
  },

  // Add new session
  addSession: async (userId, sessionData) => {
    const sessionsRef = collection(db, `users/${userId}/sessions`)
    return await addDoc(sessionsRef, sessionData)
  },

  // Toggle task completion
  toggleTask: async (userId, sessionId, taskIndex) => {
    const { sessions } = get()
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return

    const updatedTasks = [...session.tasks]
    updatedTasks[taskIndex].completed = !updatedTasks[taskIndex].completed

    await updateDoc(doc(db, `users/${userId}/sessions`, sessionId), {
      tasks: updatedTasks
    })
  },

  // Update a specific task
  updateTask: async (userId, sessionId, taskIndex, updatedTaskData) => {
    const { sessions } = get()
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return

    const updatedTasks = [...session.tasks]
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updatedTaskData }

    await updateDoc(doc(db, `users/${userId}/sessions`, sessionId), {
      tasks: updatedTasks
    })
  },

  // Delete a specific task
  deleteTask: async (userId, sessionId, taskIndex) => {
    const { sessions } = get()
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return

    const updatedTasks = session.tasks.filter((_, idx) => idx !== taskIndex)

    if (updatedTasks.length === 0) {
      // If no tasks left, delete the entire session
      await deleteDoc(doc(db, `users/${userId}/sessions`, sessionId))
    } else {
      await updateDoc(doc(db, `users/${userId}/sessions`, sessionId), {
        tasks: updatedTasks
      })
    }
  },

  // Delete session
  deleteSession: async (userId, sessionId) => {
    await deleteDoc(doc(db, `users/${userId}/sessions`, sessionId))
  },

  // Get active tasks
  getActiveTasks: () => {
    return get().tasks.filter(t => !t.completed)
  },

  // Get completed tasks
  getCompletedTasks: () => {
    return get().tasks.filter(t => t.completed)
  },

  // Get tasks by priority
  getTasksByPriority: (priority) => {
    return get().tasks.filter(t => !t.completed && t.urgency === priority)
  },

  // Get tasks by responsible
  getTasksByResponsible: (name) => {
    return get().tasks.filter(t => !t.completed && t.responsibles?.includes(name))
  }
}))
