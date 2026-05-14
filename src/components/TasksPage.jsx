import { useMemo, useState } from 'react';
import { Bell, BellOff, CalendarClock, Edit3, LayoutGrid, ListTodo, Plus, Trash2, X } from 'lucide-react';
import { classByValue, formatDateLabel, formatReminder, groupTasksByDate, todayDateString } from '../utils/helpers.js';
import CalendarHeatmap from './CalendarHeatmap.jsx';

const filters = ['All', 'Today', 'Upcoming', 'Completed'];
const categories = ['All', 'Deep Work', 'Study', 'Admin', 'Health', 'Creative'];
const priorities = ['Low', 'Medium', 'High'];
const sizes = ['Light', 'Medium', 'Heavy'];
const types = ['Deep Work', 'Study', 'Admin', 'Health', 'Creative'];
const priorityRank = { Low: 1, Medium: 2, High: 3 };
const sizeRank = { Light: 1, Medium: 2, Heavy: 3 };

function defaultReminder(date) {
  return `${date}T09:00`;
}

function splitDateTime(value, fallbackDate) {
  const safe = value && value.includes('T') ? value : defaultReminder(fallbackDate);
  const [date, time = '09:00'] = safe.split('T');
  return { date: date || fallbackDate, time: time.slice(0, 5) || '09:00' };
}

const blankTask = {
  title: '',
  date: todayDateString(),
  priority: 'Medium',
  size: 'Medium',
  type: 'Deep Work',
  reminders: [defaultReminder(todayDateString())]
};

function buildTask(form, existingId) {
  const reminders = form.reminders
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index)
    .sort();

  return {
    id: existingId || crypto?.randomUUID?.() || String(Date.now()),
    title: form.title.trim(),
    date: form.date,
    dueLabel: form.date === todayDateString() ? 'Today' : formatDateLabel(form.date),
    priority: form.priority,
    size: form.size,
    type: form.type,
    done: Boolean(form.done),
    reminders,
    reminderHistory: form.reminderHistory || []
  };
}

function NotificationStrip({ permission, onRequest }) {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const title = !isSupported
    ? 'Browser notifications are not supported here'
    : permission === 'granted'
      ? 'Notifications are enabled'
      : permission === 'denied'
        ? 'Notifications are blocked'
        : 'Task reminders can use browser notifications';

  const body = !isSupported
    ? 'Tasks still work, but browser reminder popups will not show.'
    : permission === 'granted'
      ? 'Reminder popups can appear while FocusDeck is open in this browser.'
      : permission === 'denied'
        ? 'FocusDeck will keep the reminders in-app. Change permission from browser settings if needed.'
        : 'Allow once, then each task can have one or more custom reminder times.';

  return (
    <section className={`glass-card notification-strip ${permission === 'granted' ? 'success' : permission === 'denied' ? 'warning' : ''}`}>
      {permission === 'denied' || !isSupported ? <BellOff size={18} /> : <Bell size={18} />}
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      {isSupported && permission === 'default' ? (
        <button className="secondary-btn" type="button" onClick={onRequest}>Allow Notifications</button>
      ) : null}
    </section>
  );
}

function TaskModal({ task, onClose, onSave, notificationPermission, onRequestNotifications }) {
  const [form, setForm] = useState(() => task ? { ...blankTask, ...task } : blankTask);
  const isEdit = Boolean(task);

  function update(key, value) {
    setForm((prev) => {
      if (key === 'date') {
        return {
          ...prev,
          date: value,
          reminders: prev.reminders.length
            ? prev.reminders.map((item) => `${value}T${splitDateTime(item, prev.date).time}`)
            : [defaultReminder(value)]
        };
      }
      return { ...prev, [key]: value };
    });
  }

  function updateReminder(index, key, value) {
    setForm((prev) => ({
      ...prev,
      reminders: prev.reminders.map((item, currentIndex) => {
        if (currentIndex !== index) return item;
        const current = splitDateTime(item, prev.date);
        const nextDate = key === 'date' ? value : current.date;
        const nextTime = key === 'time' ? value : current.time;
        return `${nextDate}T${nextTime || '09:00'}`;
      })
    }));
  }

  function addReminder() {
    setForm((prev) => ({ ...prev, reminders: [...prev.reminders, defaultReminder(prev.date)] }));
  }

  function removeReminder(index) {
    setForm((prev) => ({ ...prev, reminders: prev.reminders.filter((_, currentIndex) => currentIndex !== index) }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    if (form.reminders.some(Boolean) && notificationPermission === 'default') await onRequestNotifications();
    onSave(buildTask(form, task?.id));
    onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal-card task-modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">{isEdit ? 'Edit task' : 'New task'}</p>
            <h2>{isEdit ? 'Edit Task' : 'Add Task'}</h2>
            <p>Fix the name, due date, priority, size, type, and custom reminders without deleting the task.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <label>Task Name
          <input autoFocus value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Finish MBD report" />
        </label>

        <div className="form-grid two">
          <label>Due Date
            <input type="date" value={form.date} onChange={(event) => update('date', event.target.value)} />
          </label>
          <label>Priority
            <select value={form.priority} onChange={(event) => update('priority', event.target.value)}>
              {priorities.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>Size
            <select value={form.size} onChange={(event) => update('size', event.target.value)}>
              {sizes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>Type
            <select value={form.type} onChange={(event) => update('type', event.target.value)}>
              {types.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="reminder-editor">
          <div className="section-head">
            <div>
              <h3>Custom Reminders</h3>
              <p>Use separate date and time fields. Desktop users can type the time; mobile uses the native time picker.</p>
            </div>
            <button type="button" className="secondary-btn" onClick={addReminder}><Plus size={16} /> Add Reminder</button>
          </div>
          {form.reminders.length ? form.reminders.map((reminder, index) => {
            const value = splitDateTime(reminder, form.date);
            return (
              <div className="reminder-edit-row split-reminder-row" key={`${index}-${reminder}`}>
                <label>Reminder Date
                  <input type="date" value={value.date} onChange={(event) => updateReminder(index, 'date', event.target.value)} />
                </label>
                <label>Reminder Time
                  <input type="time" step="300" value={value.time} onChange={(event) => updateReminder(index, 'time', event.target.value)} />
                </label>
                <button type="button" className="icon-danger" onClick={() => removeReminder(index)} aria-label="Remove reminder"><Trash2 size={15} /></button>
              </div>
            );
          }) : <p className="muted empty-copy">No reminder. The task will still be saved.</p>}
        </div>

        <div className="modal-actions">
          <button type="button" className="primary-btn cancel-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn"><Plus size={18} /> {isEdit ? 'Save Changes' : 'Save Task'}</button>
        </div>
      </form>
    </div>
  );
}

function compareTasks(a, b, key) {
  if (key === 'priority') return (priorityRank[a.priority] || 0) - (priorityRank[b.priority] || 0);
  if (key === 'size') return (sizeRank[a.size] || 0) - (sizeRank[b.size] || 0);
  if (key === 'reminder') return String(a.reminders?.[0] || '').localeCompare(String(b.reminders?.[0] || ''));
  if (key === 'date') return String(a.date || '').localeCompare(String(b.date || ''));
  return String(a[key] || '').localeCompare(String(b[key] || ''));
}

export default function TasksPage({ settings, tasks, setTasks, notificationPermission, onRequestNotifications }) {
  const [filter, setFilter] = useState('All');
  const [category, setCategory] = useState('All');
  const [view, setView] = useState(settings.defaultTaskView || 'calendar');
  const [selectedDate, setSelectedDate] = useState(todayDateString());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

  const grouped = useMemo(() => groupTasksByDate(tasks), [tasks]);
  const selectedTasks = grouped[selectedDate] || [];
  const busiestDate = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)[0];

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (filter === 'Today') result = result.filter((task) => task.date === todayDateString());
    if (filter === 'Upcoming') result = result.filter((task) => task.date !== todayDateString() && !task.done);
    if (filter === 'Completed') result = result.filter((task) => task.done);
    if (category !== 'All') result = result.filter((task) => task.type === category);
    result.sort((a, b) => {
      const base = compareTasks(a, b, sortConfig.key);
      return sortConfig.direction === 'asc' ? base : -base;
    });
    return result;
  }, [tasks, filter, category, sortConfig]);

  const todayCount = tasks.filter((task) => task.date === todayDateString()).length;
  const highCount = tasks.filter((task) => task.priority === 'High' && !task.done).length;
  const reminderCount = tasks.reduce((sum, task) => sum + (task.reminders?.length || 0), 0);

  function saveTask(task) {
    setTasks((prev) => {
      const exists = prev.some((item) => item.id === task.id);
      return exists ? prev.map((item) => item.id === task.id ? task : item) : [task, ...prev];
    });
    setSelectedDate(task.date);
    setEditingTask(null);
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function toggleDone(id) {
    setTasks((prev) => prev.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function openEdit(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTask(null);
  }

  function changeSort(key) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }

  function sortArrow(key) {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  }

  return (
    <div className="page tasks-page floating-action-page">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">Task flow that breathes</p>
          <h1>Tasks</h1>
          <p>Switch between List and Calendar. Add, edit, complete, remove, and schedule reminders from one clean flow.</p>
        </div>
        <div className="header-actions">
          <div className="view-switch">
            <button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><ListTodo size={16} /> List</button>
            <button type="button" className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}><LayoutGrid size={16} /> Calendar</button>
          </div>
          <button className="subtle-pill" type="button" onClick={() => setSelectedDate(todayDateString())}><CalendarClock size={18} /> Today</button>
        </div>
      </header>

      <NotificationStrip permission={notificationPermission} onRequest={onRequestNotifications} />

      <div className="chip-row">
        {filters.map((item) => (
          <button type="button" className={`filter-chip ${filter === item ? 'active' : ''}`} key={item} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>
      <div className="chip-row category-row">
        {categories.map((item) => (
          <button type="button" className={`category-chip ${category === item ? 'active-category' : ''} ${classByValue(item)}`} key={item} onClick={() => setCategory(item)}>{item}</button>
        ))}
      </div>

      {view === 'calendar' ? (
        <section className="tasks-layout calendar-layout">
          <aside className="glass-card upcoming-card">
            <div className="section-head">
              <h3>Selected Date</h3>
              <span className="subtle-mini">{formatDateLabel(selectedDate)}</span>
            </div>
            <div className="upcoming-groups">
              {selectedTasks.length > 0 ? selectedTasks.map((task) => (
                <div className="upcoming-row static-row reminder-mini-row" key={task.id}>
                  <span className={`mini-dot ${classByValue(task.type)}`} />
                  <span>
                    {task.title}
                    <small>{task.reminders?.length ? `${task.reminders.length} reminder${task.reminders.length === 1 ? '' : 's'}` : 'No reminder'}</small>
                  </span>
                  <div className="mini-action-row">
                    <button type="button" className="icon-btn tiny-icon" onClick={() => openEdit(task)} aria-label="Edit task"><Edit3 size={14} /></button>
                    <button type="button" className="icon-danger" onClick={() => removeTask(task.id)} aria-label="Remove task"><Trash2 size={15} /></button>
                  </div>
                </div>
              )) : <p className="muted empty-copy">No task on this date.</p>}
            </div>
          </aside>

          <CalendarHeatmap tasks={tasks} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

          <aside className="summary-stack">
            <section className="glass-card insight-card danger-gradient">
              <small>Busiest Day</small>
              <h2>{busiestDate ? formatDateLabel(busiestDate[0]) : 'No data'}</h2>
              <p>{busiestDate ? `${busiestDate[1].length} task${busiestDate[1].length === 1 ? '' : 's'} scheduled.` : 'Add tasks to see workload.'}</p>
            </section>
            <section className="glass-card insight-card">
              <small>Reminders</small>
              <h2>{reminderCount} set</h2>
              <p>{notificationPermission === 'granted' ? 'Browser reminders are ready.' : 'Works in-app. Browser permission is optional.'}</p>
            </section>
            <section className="glass-card insight-card purple-gradient">
              <small>Focus Hint</small>
              <h2>{highCount} high priority</h2>
              <p>{selectedTasks.length > 0 ? `${selectedTasks[0].title} can go first.` : 'Pick one task to start.'}</p>
            </section>
          </aside>
        </section>
      ) : (
        <section className="glass-card task-list-shell">
          <div className="task-list-toolbar">
            <div>
              <h3>Task List</h3>
              <p>{filteredTasks.length} visible • click a column header to sort</p>
            </div>
            <div className="list-summary-inline">
              <span><strong>{todayCount}</strong> today</span>
              <span><strong>{highCount}</strong> high</span>
            </div>
          </div>
          <div className="task-table clean-table interactive-table reminder-table sortable-table">
            <div className="task-table-head">
              <button type="button" onClick={() => changeSort('title')}>Task <b>{sortArrow('title')}</b></button>
              <button type="button" onClick={() => changeSort('date')}>Due <b>{sortArrow('date')}</b></button>
              <button type="button" onClick={() => changeSort('priority')}>Priority <b>{sortArrow('priority')}</b></button>
              <button type="button" onClick={() => changeSort('size')}>Size <b>{sortArrow('size')}</b></button>
              <button type="button" onClick={() => changeSort('type')}>Type <b>{sortArrow('type')}</b></button>
              <button type="button" onClick={() => changeSort('reminder')}>Reminder <b>{sortArrow('reminder')}</b></button>
              <span>Action</span>
            </div>
            {filteredTasks.length > 0 ? filteredTasks.map((task) => (
              <div className={`task-table-row ${task.done ? 'done-row' : ''}`} key={task.id}>
                <button type="button" className="task-title task-title-button" onClick={() => toggleDone(task.id)}>
                  <i className={task.done ? 'checked-box' : ''} />{task.title}
                </button>
                <span>{formatDateLabel(task.date)}</span>
                <span className={`chip ${classByValue(task.priority)}`}>{task.priority}</span>
                <span className={`chip ${classByValue(task.size)}`}>{task.size}</span>
                <span className={`chip ${classByValue(task.type)}`}>{task.type}</span>
                <span className="reminder-text">{task.reminders?.length ? formatReminder(task.reminders[0]) : 'Off'}</span>
                <div className="table-action-row">
                  <button type="button" className="icon-btn tiny-icon" onClick={() => openEdit(task)} aria-label="Edit task"><Edit3 size={14} /></button>
                  <button type="button" className="icon-danger" onClick={() => removeTask(task.id)} aria-label="Remove task"><Trash2 size={16} /></button>
                </div>
              </div>
            )) : <div className="empty-state">No matching task. Tap the plus button to add one.</div>}
          </div>
        </section>
      )}

      <button type="button" className="floating-add-btn" onClick={() => setModalOpen(true)} aria-label="Add task"><Plus size={26} /></button>
      {modalOpen ? <TaskModal task={editingTask} onClose={closeModal} onSave={saveTask} notificationPermission={notificationPermission} onRequestNotifications={onRequestNotifications} /> : null}
    </div>
  );
}
