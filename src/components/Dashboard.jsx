import { CalendarDays, Plus, Sun } from 'lucide-react';
import { classByValue, todayDateString } from '../utils/helpers.js';
import {
  HabitPreview,
  MomentumCard,
  ReviewCard,
  StatCard
} from './Cards.jsx';

export default function Dashboard({ setActivePage, tasks, habits }) {
  const todayTasks = tasks.filter((task) => task.date === todayDateString());
  const quickTasks = tasks.slice(0, 4);
  const breakHabit = habits.find((habit) => habit.intent === 'Break');
  const topFocus = todayTasks.slice(0, 3);

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Personal operating dashboard</p>
          <h1>Good morning, Dewa</h1>
          <p>Here’s your command center for today.</p>
        </div>
        <div className="date-pill">
          <CalendarDays size={18} />
          <span>May 20, 2025</span>
          <small>Tuesday</small>
        </div>
      </header>

      <section className="dashboard-grid">
        <StatCard icon={<Sun size={16} />} title="Today Status" className="status-card">
          <h2>{todayTasks.length > 2 ? 'Heavy, but still manageable' : 'Light enough to control'}</h2>
          <p>{todayTasks.length > 0 ? `You have ${todayTasks.length} task${todayTasks.length === 1 ? '' : 's'} scheduled today.` : 'No task scheduled for today yet. Add one when you are ready.'}</p>
        </StatCard>

        <MomentumCard />

        <StatCard title="Top Focus" className="top-focus-card">
          {topFocus.length > 0 ? (
            <ol className="focus-list">
              {topFocus.map((task) => <li key={task.id}>{task.title}</li>)}
            </ol>
          ) : (
            <p className="muted empty-copy">No focus picked yet. Add a task for today first.</p>
          )}
        </StatCard>

        <StatCard title="Task Quality">
          <h2 className="purple-text">{tasks.length > 0 ? 'Simple enough to start' : 'No task data yet'}</h2>
          <ul className="mini-list">
            <li><span className="dot danger" />{tasks.filter((task) => task.size === 'Heavy').length} heavy tasks</li>
            <li><span className="dot warning" />{todayTasks.length} due today</li>
            <li><span className="dot success" />{tasks.filter((task) => task.size === 'Light').length} light wins</li>
          </ul>
          <p className="muted">Keep the list honest. Too many heavy tasks will make the day feel fake.</p>
        </StatCard>

        <StatCard title="Suggested Adjustment" className="suggest-card">
          <p>{todayTasks.length > 0 ? 'Finish the first scheduled task before adding anything new. Keep the calendar clean.' : 'Add one realistic task first. Do not build a huge list just to feel productive.'}</p>
        </StatCard>

        <StatCard title="Habit Direction" className="risk-card">
          {breakHabit ? (
            <>
              <h2>{breakHabit.name} is a habit to break.</h2>
              <p>Make the cue harder and the better choice easier.</p>
            </>
          ) : (
            <>
              <h2>Your habits are mostly build-focused.</h2>
              <p>Keep the frequency realistic so the streak stays honest.</p>
            </>
          )}
        </StatCard>

        <section className="glass-card quick-task-card">
          <div className="section-head">
            <h3>Quick Task Preview</h3>
            <button onClick={() => setActivePage('Tasks')}>{tasks.length ? 'Open tasks' : 'Add task'}</button>
          </div>
          <div className="task-preview-list">
            {quickTasks.length > 0 ? quickTasks.map((task) => (
              <div className="task-preview-row" key={task.id}>
                <span className="checkbox" />
                <strong>{task.title}</strong>
                <span className={`chip ${classByValue(task.priority)}`}>{task.priority}</span>
                <span className={`chip ${classByValue(task.size)}`}>{task.size}</span>
                <span className="due-chip">{task.dueLabel}</span>
              </div>
            )) : (
              <button className="empty-action" type="button" onClick={() => setActivePage('Tasks')}>
                <Plus size={18} /> Add your first task
              </button>
            )}
          </div>
        </section>

        <HabitPreview habits={habits} />
      </section>

      <aside className="right-dock">
        <ReviewCard />
        <section className="glass-card mini-calendar-callout">
          <h3>Schedule clarity</h3>
          <p>{todayTasks.length > 0 ? `Today has ${todayTasks.length} task${todayTasks.length === 1 ? '' : 's'}. Check Calendar view before adding more.` : 'Your calendar is clean today. Add one meaningful task first.'}</p>
          <button onClick={() => setActivePage('Tasks')}>View calendar</button>
        </section>
      </aside>
    </div>
  );
}
