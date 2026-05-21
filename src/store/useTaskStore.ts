import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export interface TaskItem {
  _id: string;
  text: string;
  completed?: boolean;
  dueDate?: string;
}

interface TaskState {
  tasks: TaskItem[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (text: string, completed: boolean, dueDate: string | null) => Promise<void>;
  updateTask: (id: string, text: string, completed: boolean, dueDate: string | null) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteAllTasks: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,

      fetchTasks: async () => {
        set({ loading: true });
        try {
          const { data } = await axios.get<TaskItem[]>(`${baseURL}`);
          set({ tasks: data, loading: false });
        } catch {
          set({ loading: false });
        }
      },

      addTask: async (text, completed, dueDate) => {
        try {
          await axios.post(`${baseURL}/save`, { text, completed, dueDate });
          await get().fetchTasks();
        } catch (err) {
          console.log(err);
        }
      },

      updateTask: async (id, text, completed, dueDate) => {
        try {
          await axios.post(`${baseURL}/update`, { _id: id, text, completed, dueDate });
          await get().fetchTasks();
        } catch (err) {
          console.log(err);
        }
      },

      deleteTask: async (id) => {
        try {
          await axios.post(`${baseURL}/delete`, { _id: id });
          await get().fetchTasks();
        } catch (err) {
          console.log(err);
        }
      },

      deleteAllTasks: () => {
        set({ tasks: [] });
      },
    }),
    {
      name: 'tasks-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);
