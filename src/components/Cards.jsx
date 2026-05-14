import { AlertTriangle, CheckCircle2, Dumbbell, Flame, Scale, Sparkles, Target, Zap } from 'lucide-react';
import { reviewOptions } from '../data/seedData.js';

export function StatCard({ icon, title, children, className = '' }) {
  return (
    <section className={`glass-card stat-card ${className}`}>
      <div className="card-title-row">
        {icon}
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function MomentumCard() {
  return (
    <StatCard icon={<Zap size={16} />} title="Momentum">
      <div className="momentum-content">
        <div className="progress-ring" style={{ '--value': '68%' }}>
          <span>68%</span>
        </div>
        <p>Your progress is solid this week.</p>
      </div>
    </StatCard>
  );
}

export function TaskQualityCard() {
  return (
    <StatCard icon={<Scale size={16} />} title="Task Quality">
      <h2 className="purple-text">Not balanced yet</h2>
      <ul className="mini-list">
        <li><span className="dot danger" />3 heavy tasks</li>
        <li><span className="dot warning" />2 close deadlines</li>
        <li><span className="dot success" />0 easy wins</li>
      </ul>
      <p className="muted">Today’s list is too heavy.</p>
    </StatCard>
  );
}

export function HabitRiskCard() {
  return (
    <StatCard icon={<AlertTriangle size={16} />} title="Habit Risk" className="risk-card">
      <h2>Your gym streak is at risk today.</h2>
      <p>You can still save it with minimum mode.</p>
      <Flame className="floating-icon" size={28} />
    </StatCard>
  );
}

export function SuggestedAdjustmentCard() {
  return (
    <StatCard icon={<Sparkles size={16} />} title="Suggested Adjustment" className="suggest-card">
      <p>Postpone the UI revision. Finish the report first, debug after that, then run the minimum workout to protect your streak.</p>
    </StatCard>
  );
}

export function TopFocusCard() {
  return (
    <StatCard icon={<Target size={16} />} title="Top 3 Focus">
      <ol className="focus-list">
        <li>Finish MBD Lab Report</li>
        <li>Debug Java PBO assignment</li>
        <li>Minimum workout for 15 minutes</li>
      </ol>
    </StatCard>
  );
}

export function ReviewCard() {
  return (
    <StatCard icon={<CheckCircle2 size={16} />} title="End of Day Review">
      <div className="review-options">
        {reviewOptions.map((item) => (
          <button key={item}>{item}</button>
        ))}
      </div>
      <p className="muted small-copy">Today is heavy, but not chaos yet.</p>
    </StatCard>
  );
}

export function HabitPreview({ habits }) {
  return (
    <StatCard icon={<Dumbbell size={16} />} title="Habit Preview">
      <div className="habit-preview-list">
        {habits.map((habit) => (
          <div className="habit-preview-row" key={habit.id}>
            <span>{habit.name}</span>
            <small>streak {habit.streak} days</small>
          </div>
        ))}
      </div>
    </StatCard>
  );
}
