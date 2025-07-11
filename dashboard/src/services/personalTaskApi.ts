import { apiRequest } from './authApi';

export interface PersonalTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export const personalTaskApi = {
  // Get all personal tasks
  getTasks: async (): Promise<PersonalTask[]> => {
    return apiRequest('/personalTasks', {
      method: 'GET'
    });
  },

  // Create a new task
  createTask: async (taskData: CreateTaskData): Promise<PersonalTask> => {
    return apiRequest('/personalTasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  // Update a task
  updateTask: async (id: string, taskData: UpdateTaskData): Promise<PersonalTask> => {
    return apiRequest(`/personalTasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  },

  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    return apiRequest(`/personalTasks/${id}`, {
      method: 'DELETE'
    });
  },

  // Toggle task completion
  toggleTask: async (id: string): Promise<PersonalTask> => {
    return apiRequest(`/personalTasks/${id}/toggle`, {
      method: 'PATCH'
    });
  }
}; 