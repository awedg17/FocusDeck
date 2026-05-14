import { useEffect, useMemo, useRef, useState } from 'react';
import AppShell from './components/AppShell.jsx';
import Dashboard from './components/Dashboard.jsx';
import TasksPage from './components/TasksPage.jsx';
import HabitsPage from './components/HabitsPage.jsx';
import ReviewPage from './components/ReviewPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import { initialHabits, initialTasks } from './data/seedData.js';

const STORAGE_VERSION = 'v8'; // Keep the same key so existing localhost progress is not lost.

const defaultSettings = {
  theme: 'dark',
  accentColor: 'indigo',
  reminders: true,
  notifications: true,
  focusSound: false,
  compactMode: false,
  focusDuration: '50 min',
  defaultTaskView: 'calendar',
  reviewReminder: '21:00',
  showMomentum: true
};

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function getInitialPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function normalizeStoredTasks(items = []) {
  return items.map((task) => ({
    id: task.id || String(Date.now() + Math.random()),
    title: task.title || 'Untitled task',
    date: task.date || '2025-05-20',
    dueLabel: task.dueLabel || task.date || 'No date',
    priority: task.priority || 'Medium',
    size: task.size || 'Medium',
    type: task.type || 'Deep Work',
    done: Boolean(task.done),
    reminders: Array.isArray(task.reminders) ? task.reminders : [],
    reminderHistory: Array.isArray(task.reminderHistory) ? task.reminderHistory : []
  }));
}

function normalizeStoredHabits(items = []) {
  return items.map((habit) => ({
    id: habit.id || String(Date.now() + Math.random()),
    name: habit.name || 'Untitled habit',
    intent: habit.intent || 'Build',
    days: Array.isArray(habit.days) && habit.days.length ? habit.days : ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    streak: Number(habit.streak) || 0,
    progress: Number(habit.progress) || 60,
    notes: habit.notes || ''
  }));
}

export default function App() {
  const [activePage, setActivePage] = useState('Home');
  const [notificationPermission, setNotificationPermission] = useState(getInitialPermission);
  const notificationTimers = useRef([]);

  const [settings, setSettings] = useState(() => ({
    ...defaultSettings,
    ...loadFromStorage(`focusdeck_settings_${STORAGE_VERSION}`, {})
  }));
  const [tasks, setTasks] = useState(() => normalizeStoredTasks(loadFromStorage(`focusdeck_tasks_${STORAGE_VERSION}`, initialTasks)));
  const [habits, setHabits] = useState(() => normalizeStoredHabits(loadFromStorage(`focusdeck_habits_${STORAGE_VERSION}`, initialHabits)));

  useEffect(() => {
    localStorage.setItem(`focusdeck_settings_${STORAGE_VERSION}`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`focusdeck_tasks_${STORAGE_VERSION}`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`focusdeck_habits_${STORAGE_VERSION}`, JSON.stringify(habits));
  }, [habits]);

  async function requestNotifications() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported');
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      setNotificationPermission('denied');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission;
  }

  useEffect(() => {
    notificationTimers.current.forEach((timer) => clearTimeout(timer));
    notificationTimers.current = [];

    if (!settings.notifications || notificationPermission !== 'granted') return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const maxDelay = 2_147_483_647;

    tasks.forEach((task) => {
      if (task.done || !Array.isArray(task.reminders)) return;

      task.reminders.forEach((reminderAt) => {
        if (!reminderAt || task.reminderHistory?.includes(reminderAt)) return;
        const reminderTime = new Date(reminderAt).getTime();
        const delay = reminderTime - Date.now();
        if (!Number.isFinite(delay) || delay <= 0 || delay > maxDelay) return;

        const timer = setTimeout(() => {
          new Notification(`FocusDeck reminder: ${task.title}`, {
            body: `${task.priority} priority • ${task.type} • due ${task.date}`,
            tag: `focusdeck-${task.id}-${reminderAt}`,
            renotify: true
          });

          setTasks((current) => current.map((item) => (
            item.id === task.id
              ? { ...item, reminderHistory: [...(item.reminderHistory || []), reminderAt] }
              : item
          )));
        }, delay);

        notificationTimers.current.push(timer);
      });
    });

    return () => {
      notificationTimers.current.forEach((timer) => clearTimeout(timer));
      notificationTimers.current = [];
    };
  }, [tasks, settings.notifications, notificationPermission]);

  function resetAllData() {
    setTasks(normalizeStoredTasks(initialTasks));
    setHabits(normalizeStoredHabits(initialHabits));
    setSettings(defaultSettings);
  }

  const pages = useMemo(() => ({
    Home: <Dashboard setActivePage={setActivePage} tasks={tasks} habits={habits} />,
    Tasks: <TasksPage settings={settings} tasks={tasks} setTasks={setTasks} notificationPermission={notificationPermission} onRequestNotifications={requestNotifications} />,
    Habits: <HabitsPage habits={habits} setHabits={setHabits} />,
    Review: <ReviewPage tasks={tasks} habits={habits} />,
    Settings: <SettingsPage settings={settings} setSettings={setSettings} tasks={tasks} setTasks={setTasks} habits={habits} setHabits={setHabits} onResetAll={resetAllData} notificationPermission={notificationPermission} onRequestNotifications={requestNotifications} />
  }), [settings, tasks, habits, notificationPermission]);

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage} settings={settings}>
      {pages[activePage]}
    </AppShell>
  );
}
