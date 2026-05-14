export const navItems = ['Home', 'Tasks', 'Habits', 'Review', 'Settings'];

export const initialTasks = [
  {
    id: crypto?.randomUUID?.() || 'task-1',
    title: 'Example: Finish product concept review',
    date: '2025-05-20',
    dueLabel: 'May 20',
    priority: 'High',
    size: 'Medium',
    type: 'Deep Work',
    done: false,
    reminders: ['2025-05-20T09:00'],
    reminderHistory: []
  }
];

export const initialHabits = [
  {
    id: crypto?.randomUUID?.() || 'habit-1',
    name: 'Example: Morning planning',
    intent: 'Build',
    days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    streak: 3,
    progress: 64,
    notes: 'Pick one priority before opening social media.'
  }
];

export const reviewOptions = ['Smooth', 'Heavy', 'Messy', 'Too ambitious', 'Distracted'];
