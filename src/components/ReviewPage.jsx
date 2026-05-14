import { useMemo, useState } from 'react';
import { BarChart3, CalendarRange, CheckCircle2, Flame, Target } from 'lucide-react';
import { dateInRange, formatDateFull, todayDateString } from '../utils/helpers.js';

function addDays(dateString, delta) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + delta);
  return date.toISOString().slice(0, 10);
}

function StatBox({ icon, label, value, hint }) {
  return (
    <section className="glass-card review-stat-box">
      <div className="stat-icon">{icon}</div>
      <div>
        <small>{label}</small>
        <h3>{value}</h3>
        <p>{hint}</p>
      </div>
    </section>
  );
}

function Bars({ data }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <div className="bar-chart" aria-label="Performance chart">
      {data.map((item) => (
        <div className="bar-item" key={item.label}>
          <div className="bar-track"><i style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }} /></div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReviewPage({ tasks = [], habits = [] }) {
  const [startDate, setStartDate] = useState(addDays(todayDateString(), -13));
  const [endDate, setEndDate] = useState(todayDateString());

  const stats = useMemo(() => {
    const rangeTasks = tasks.filter((task) => dateInRange(task.date, startDate, endDate));
    const completed = rangeTasks.filter((task) => task.done).length;
    const high = rangeTasks.filter((task) => task.priority === 'High').length;
    const buildHabits = habits.filter((habit) => habit.intent !== 'Break').length;
    const breakHabits = habits.filter((habit) => habit.intent === 'Break').length;
    const avgStreak = habits.length ? Math.round(habits.reduce((sum, habit) => sum + Number(habit.streak || 0), 0) / habits.length) : 0;
    const completionRate = rangeTasks.length ? Math.round((completed / rangeTasks.length) * 100) : 0;

    const chart = [
      { label: 'Tasks', value: rangeTasks.length },
      { label: 'Done', value: completed },
      { label: 'High', value: high },
      { label: 'Build', value: buildHabits },
      { label: 'Break', value: breakHabits },
      { label: 'Streak', value: avgStreak }
    ];

    const insight = rangeTasks.length === 0
      ? 'No task data in this range yet. Add a few tasks first, then this page becomes useful.'
      : completionRate >= 70
        ? 'You handled this range well. Keep the system light and repeatable.'
        : high > completed
          ? 'The range looks heavy. Too many high priority tasks without enough completed wins.'
          : 'Your workload is visible. The next upgrade is balancing heavy tasks with small wins.';

    return { rangeTasks, completed, high, buildHabits, breakHabits, avgStreak, completionRate, chart, insight };
  }, [tasks, habits, startDate, endDate]);

  return (
    <div className="page review-page performance-page">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">Performance review</p>
          <h1>Review</h1>
          <p>Choose any calendar range: one day, ten days, two weeks, months, or years.</p>
        </div>
      </header>

      <section className="glass-card review-range-card">
        <div>
          <CalendarRange size={22} />
          <div>
            <h3>Review Range</h3>
            <p>{formatDateFull(startDate)} → {formatDateFull(endDate)}</p>
          </div>
        </div>
        <label>From
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>
        <label>To
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </label>
      </section>

      <section className="review-stat-grid">
        <StatBox icon={<Target size={20} />} label="Tasks in range" value={stats.rangeTasks.length} hint="Scheduled workload" />
        <StatBox icon={<CheckCircle2 size={20} />} label="Completion rate" value={`${stats.completionRate}%`} hint={`${stats.completed} completed`} />
        <StatBox icon={<BarChart3 size={20} />} label="High priority" value={stats.high} hint="Needs careful planning" />
        <StatBox icon={<Flame size={20} />} label="Average streak" value={`${stats.avgStreak} days`} hint="Habit consistency" />
      </section>

      <section className="review-main-grid">
        <section className="glass-card performance-chart-card">
          <div className="section-head">
            <div>
              <h3>Performance Chart</h3>
              <p>Simple snapshot from your selected range.</p>
            </div>
          </div>
          <Bars data={stats.chart} />
        </section>

        <aside className="glass-card review-insight-card">
          <p className="eyebrow">Insight</p>
          <h2>{stats.completionRate >= 70 ? 'Strong rhythm' : stats.rangeTasks.length ? 'Needs balance' : 'Waiting for data'}</h2>
          <p>{stats.insight}</p>
          <div className="insight-list">
            <span>Build habits: <strong>{stats.buildHabits}</strong></span>
            <span>Break habits: <strong>{stats.breakHabits}</strong></span>
            <span>Range tasks: <strong>{stats.rangeTasks.length}</strong></span>
          </div>
        </aside>
      </section>
    </div>
  );
}
