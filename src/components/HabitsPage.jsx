import { useState } from 'react';
import { Ban, Edit3, Plus, Repeat, Target, Trash2, X } from 'lucide-react';

const intentOptions = ['Build', 'Break'];
const dayOptions = [
  { key: 'sun', label: 'S', name: 'Sun' },
  { key: 'mon', label: 'M', name: 'Mon' },
  { key: 'tue', label: 'T', name: 'Tue' },
  { key: 'wed', label: 'W', name: 'Wed' },
  { key: 'thu', label: 'T', name: 'Thu' },
  { key: 'fri', label: 'F', name: 'Fri' },
  { key: 'sat', label: 'S', name: 'Sat' }
];
const allDays = dayOptions.map((day) => day.key);
const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
const weekends = ['sun', 'sat'];

const blankHabit = {
  name: '',
  intent: 'Build',
  days: allDays,
  streak: 0,
  notes: ''
};

function sameDays(a, b) {
  return a.length === b.length && a.every((item) => b.includes(item));
}

function formatFrequency(days = []) {
  const safe = days.length ? days : allDays;
  if (sameDays(safe, allDays)) return 'Daily';
  if (sameDays(safe, weekdays)) return 'Weekdays';
  if (sameDays(safe, weekends)) return 'Weekend';
  return dayOptions.filter((day) => safe.includes(day.key)).map((day) => day.name).join(', ');
}

function normalizeHabit(form, existingId) {
  const days = form.days.length ? form.days : allDays;
  return {
    id: existingId || crypto?.randomUUID?.() || String(Date.now()),
    name: form.name.trim(),
    intent: form.intent,
    days,
    streak: Number(form.streak) || 0,
    progress: Math.min(100, Math.max(18, (Number(form.streak) || 1) * 14)),
    notes: form.notes.trim()
  };
}

function HabitModal({ habit, onClose, onSave }) {
  const [form, setForm] = useState(() => habit ? { ...blankHabit, ...habit, days: habit.days || allDays } : blankHabit);
  const isEdit = Boolean(habit);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDay(dayKey) {
    setForm((prev) => {
      const exists = prev.days.includes(dayKey);
      const nextDays = exists ? prev.days.filter((item) => item !== dayKey) : [...prev.days, dayKey];
      return { ...prev, days: nextDays.length === allDays.length ? allDays : nextDays };
    });
  }

  function setPreset(days) {
    setForm((prev) => ({ ...prev, days }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    onSave(normalizeHabit(form, habit?.id));
    onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal-card habit-modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">{isEdit ? 'Edit habit' : 'New habit'}</p>
            <h2>{isEdit ? 'Edit Habit' : 'Add Habit'}</h2>
            <p>Choose whether this is a habit to build or a habit to break, then pick active days.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <label>Habit Name
          <input autoFocus value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. Read before bed" />
        </label>

        <div className="form-grid two">
          <label>Habit Direction
            <select value={form.intent} onChange={(event) => update('intent', event.target.value)}>
              {intentOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>Current Streak
            <input type="number" min="0" value={form.streak} onChange={(event) => update('streak', event.target.value)} />
          </label>
        </div>

        <section className="day-picker-block">
          <div className="section-head">
            <div>
              <h3>Frequency</h3>
              <p>Tap every day to make it Daily, or pick only the days you want.</p>
            </div>
            <span className="active-tab-pill">{formatFrequency(form.days)}</span>
          </div>
          <div className="preset-row">
            <button type="button" className={sameDays(form.days, allDays) ? 'active' : ''} onClick={() => setPreset(allDays)}>Daily</button>
            <button type="button" className={sameDays(form.days, weekdays) ? 'active' : ''} onClick={() => setPreset(weekdays)}>Weekdays</button>
            <button type="button" className={sameDays(form.days, weekends) ? 'active' : ''} onClick={() => setPreset(weekends)}>Weekend</button>
          </div>
          <div className="day-toggle-row">
            {dayOptions.map((day) => (
              <button type="button" key={day.key} className={form.days.includes(day.key) ? 'active' : ''} onClick={() => toggleDay(day.key)} title={day.name}>
                {day.label}
              </button>
            ))}
          </div>
        </section>

        <label>Note
          <textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Optional cue, rule, or trigger..." />
        </label>

        <div className="modal-actions">
          <button type="button" className="primary-btn cancel-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn"><Plus size={18} /> {isEdit ? 'Save Changes' : 'Save Habit'}</button>
        </div>
      </form>
    </div>
  );
}

export default function HabitsPage({ habits, setHabits }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  function saveHabit(habit) {
    setHabits((prev) => {
      const exists = prev.some((item) => item.id === habit.id);
      return exists ? prev.map((item) => item.id === habit.id ? habit : item) : [habit, ...prev];
    });
    setEditingHabit(null);
  }

  function removeHabit(id) {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  }

  function openEdit(habit) {
    setEditingHabit(habit);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingHabit(null);
  }

  return (
    <div className="page habits-page floating-action-page">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">Build or break patterns</p>
          <h1>Habits</h1>
          <p>Choose active days, track streaks, and decide whether each habit is something to build or remove.</p>
        </div>
      </header>

      <section className="habit-grid refined-habit-grid simplified-habit-grid">
        {habits.length > 0 ? habits.map((habit) => {
          const Icon = habit.intent === 'Break' ? Ban : Target;
          return (
            <article className="glass-card habit-card refined-habit-card simplified-habit-card" key={habit.id}>
              <div className="habit-card-head">
                <div className="habit-top">
                  <div className={`habit-icon ${habit.intent === 'Break' ? 'break-icon' : ''}`}><Icon size={20} /></div>
                  <div>
                    <h3>{habit.name}</h3>
                    <p>{habit.intent === 'Break' ? 'Pattern to remove' : 'Pattern to build'}</p>
                  </div>
                </div>
                <div className="table-action-row">
                  <button type="button" className="icon-btn tiny-icon" onClick={() => openEdit(habit)} aria-label="Edit habit"><Edit3 size={14} /></button>
                  <button type="button" className="icon-danger" onClick={() => removeHabit(habit.id)} aria-label="Remove habit"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="habit-main-row">
                <div className="habit-ring" style={{ '--value': `${habit.progress || 60}%` }}>
                  <strong>{habit.streak}</strong>
                  <span>days</span>
                </div>
                <div className="habit-info-stack">
                  <div className="habit-detail">
                    <small>Direction</small>
                    <p>{habit.intent}</p>
                  </div>
                  <div className="habit-detail">
                    <small>Frequency</small>
                    <p>{formatFrequency(habit.days)}</p>
                  </div>
                  <div className="habit-days-mini">
                    {(habit.days || allDays).map((dayKey) => {
                      const day = dayOptions.find((item) => item.key === dayKey);
                      return <span key={dayKey}>{day?.label || dayKey[0].toUpperCase()}</span>;
                    })}
                  </div>
                  {habit.notes ? (
                    <div className="habit-detail">
                      <small>Note</small>
                      <p>{habit.notes}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        }) : (
          <section className="glass-card empty-state wide-empty">No habit yet. Tap the plus button to add one.</section>
        )}
      </section>

      <section className="glass-card minimum-mode-card habit-note-card">
        <Repeat size={24} />
        <div>
          <h3>Frequency is day-based</h3>
          <p>Select S M T W T F S manually. If every day is selected, FocusDeck treats it as Daily.</p>
        </div>
      </section>

      <button type="button" className="floating-add-btn" onClick={() => setModalOpen(true)} aria-label="Add habit"><Plus size={26} /></button>
      {modalOpen ? <HabitModal habit={editingHabit} onClose={closeModal} onSave={saveHabit} /> : null}
    </div>
  );
}
