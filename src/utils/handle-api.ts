import axios, { AxiosError } from 'axios';
import React from 'react';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export interface TaskItem {
  _id: string;
  text: string;
  completed?: boolean;
  dueDate?: string | null;
}

const requestWithRetry = async <T>(requestFn: () => Promise<T>, retries = 2, delay = 700): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    const err = error as AxiosError;

    if (retries <= 0) throw err;

    const status = err.response?.status;
    if (status === 502 || status === 503 || status === 504) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return requestWithRetry(requestFn, retries - 1, delay * 1.5);
    }

    throw err;
  }
};

export const getAllTasks = async (setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>) => {
  try {
    const response = await requestWithRetry(() => axios.get<TaskItem[]>(`${baseURL}`));
    setTasks(response.data);
  } catch (err) {
    console.log('Erro ao carregar tarefas (retry):', err);
    throw err;
  }
};

export const addTask = async (
  text: string,
  completed: boolean,
  dueDate: string | null,
  setText: React.Dispatch<React.SetStateAction<string>>,
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
) => {
  try {
    await requestWithRetry(() => axios.post(`${baseURL}/save`, { text, completed, dueDate }));
    setText('');
    await getAllTasks(setTasks);
  } catch (err) {
    console.log('Erro ao adicionar tarefa (retry):', err);
    throw err;
  }
};

export const updateTask = async (
  taskId: string,
  text: string,
  completed: boolean,
  dueDate: string | null,
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
  setText: React.Dispatch<React.SetStateAction<string>>,
  setIsUpdating: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  try {
    await requestWithRetry(() => axios.post(`${baseURL}/update`, { _id: taskId, text, completed, dueDate }));
    setText('');
    setIsUpdating(false);
    await getAllTasks(setTasks);
  } catch (err) {
    console.log('Erro ao atualizar tarefa (retry):', err);
    throw err;
  }
};

export const deleteTask = async (
  _id: string,
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
) => {
  try {
    await requestWithRetry(() => axios.post(`${baseURL}/delete`, { _id }));
    await getAllTasks(setTasks);
  } catch (err) {
    console.log('Erro ao deletar tarefa (retry):', err);
    throw err;
  }
};
