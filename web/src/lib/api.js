const API_BASE = '/api';

export const api = {
  tasks: {
    list: async (date) => {
      const url = date !== undefined 
        ? `${API_BASE}/tasks?date=${date === null ? 'null' : date}`
        : `${API_BASE}/tasks`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      return data.tasks;
    },

    create: async (task) => {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },

    update: async (id, updates) => {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
    },
  },

  projects: {
    list: async () => {
      const response = await fetch(`${API_BASE}/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      return data.projects;
    },

    create: async (project) => {
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (!response.ok) throw new Error('Failed to create project');
      return response.json();
    },

    update: async (id, updates) => {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update project');
      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete project');
    },

    getTasks: async (id) => {
      const response = await fetch(`${API_BASE}/projects/${id}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch project tasks');
      const data = await response.json();
      return data.tasks;
    },

    getStats: async (id) => {
      const response = await fetch(`${API_BASE}/projects/${id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch project stats');
      return response.json();
    },
  },

  focus: {
    list: async () => {
      const response = await fetch(`${API_BASE}/focus`);
      if (!response.ok) throw new Error('Failed to fetch focus sessions');
      const data = await response.json();
      return data.sessions;
    },

    start: async (session) => {
      const response = await fetch(`${API_BASE}/focus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
      if (!response.ok) throw new Error('Failed to start focus session');
      return response.json();
    },

    complete: async (id) => {
      const response = await fetch(`${API_BASE}/focus/${id}/complete`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to complete focus session');
      return response.json();
    },

    getStats: async () => {
      const response = await fetch(`${API_BASE}/focus/stats`);
      if (!response.ok) throw new Error('Failed to fetch focus stats');
      return response.json();
    },
  },

  journal: {
    verify: async (password) => {
      const response = await fetch(`${API_BASE}/journal/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error('Failed to verify password');
      return response.json();
    },

    getEntry: async (date, password) => {
      const response = await fetch(`${API_BASE}/journal/entries/by-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, password }),
      });
      if (!response.ok) throw new Error('Failed to fetch journal entry');
      return response.json();
    },

    createEntry: async (date, content, password) => {
      const response = await fetch(`${API_BASE}/journal/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, content, password }),
      });
      if (!response.ok) throw new Error('Failed to create journal entry');
      return response.json();
    },

    updateEntry: async (id, content, password) => {
      const response = await fetch(`${API_BASE}/journal/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, password }),
      });
      if (!response.ok) throw new Error('Failed to update journal entry');
      return response.json();
    },

    deleteEntry: async (id, password) => {
      const response = await fetch(`${API_BASE}/journal/entries/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error('Failed to delete journal entry');
      return response.json();
    },

    getEntriesByMonth: async (year, month, password) => {
      const response = await fetch(`${API_BASE}/journal/entries/month`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, password }),
      });
      if (!response.ok) throw new Error('Failed to fetch journal entries');
      return response.json();
    },
  },

  settings: {
    verifyPassword: async (password) => {
      const response = await fetch(`${API_BASE}/settings/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error('Failed to verify password');
      return response.json();
    },

    changePassword: async (oldPassword, newPassword) => {
      const response = await fetch(`${API_BASE}/settings/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }
      return response.json();
    },

    get: async (key) => {
      const response = await fetch(`${API_BASE}/settings/${key}`);
      if (!response.ok) throw new Error('Failed to fetch setting');
      return response.json();
    },

    set: async (key, value) => {
      const response = await fetch(`${API_BASE}/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!response.ok) throw new Error('Failed to update setting');
      return response.json();
    },
  },

  analytics: {
    get: async (date) => {
      const url = date !== undefined
        ? `${API_BASE}/analytics?date=${date === null ? 'null' : date}`
        : `${API_BASE}/analytics`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  },

  boards: {
    list: async () => {
      const response = await fetch(`${API_BASE}/boards`);
      if (!response.ok) throw new Error('Failed to fetch boards');
      const data = await response.json();
      return data.boards;
    },

    get: async (id) => {
      const response = await fetch(`${API_BASE}/boards/${id}`);
      if (!response.ok) throw new Error('Failed to fetch board');
      return response.json();
    },

    create: async (board) => {
      const response = await fetch(`${API_BASE}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(board),
      });
      if (!response.ok) throw new Error('Failed to create board');
      return response.json();
    },

    update: async (id, updates) => {
      const response = await fetch(`${API_BASE}/boards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update board');
      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE}/boards/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete board');
    },

    // Elements
    addElement: async (boardId, element) => {
      const response = await fetch(`${API_BASE}/boards/${boardId}/elements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(element),
      });
      if (!response.ok) throw new Error('Failed to add element');
      return response.json();
    },

    updateElement: async (boardId, elementId, updates) => {
      const response = await fetch(`${API_BASE}/boards/${boardId}/elements/${elementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update element');
      return response.json();
    },

    deleteElement: async (boardId, elementId) => {
      const response = await fetch(`${API_BASE}/boards/${boardId}/elements/${elementId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete element');
    },

    bringToFront: async (boardId, elementId) => {
      const response = await fetch(`${API_BASE}/boards/${boardId}/elements/${elementId}/bring-to-front`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to bring element to front');
    },

    // Connections
    addConnection: async (boardId, connection) => {
      const response = await fetch(`${API_BASE}/boards/${boardId}/connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connection),
      });
      if (!response.ok) throw new Error('Failed to add connection');
      return response.json();
    },

    updateConnection: async (boardId, connectionId, updates) => {
      const response = await fetch(`${API_BASE}/boards/${boardId}/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update connection');
      return response.json();
    },

    deleteConnection: async (boardId, connectionId) => {
      const response = await fetch(`${API_BASE}/boards/${boardId}/connections/${connectionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete connection');
    },
  },
};
