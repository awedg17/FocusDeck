import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateKey, formatDateLabel, getWorkloadLevel, groupTasksByDate, todayDateString } from '../utils/helpers.js';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function monthName(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function parseDate(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function readableLevel(level, count) {
  if (!count) return 'No tasks';
  if (level === 'very-busy') return 'Very Busy';
  if (level === 'busy') return 'Busy';
  if (level === 'medium') return 'Medium';
  return 'Light';
}

export default function CalendarHeatmap({ tasks, selectedDate, onSelectDate }) {
  const [displayDate, setDisplayDate] = useState(() => parseDate(selectedDate || todayDateString()));
  const grouped = groupTasksByDate(tasks);

  useEffect(() => {
    if (selectedDate) setDisplayDate(parseDate(selectedDate));
  }, [selectedDate]);

  const cells = useMemo(() => {
    const year = displayDate.getFullYear();
    const monthIndex = displayDate.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();
    const result = [];

    const prevLast = new Date(year, monthIndex, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const day = prevLast - i;
      const date = new Date(year, monthIndex - 1, day);
      result.push({ day, muted: true, dateKey: formatDateKey(date.getFullYear(), date.getMonth(), day) });
    }

    for (let day = 1; day <= totalDays; day++) {
      result.push({ day, muted: false, dateKey: formatDateKey(year, monthIndex, day) });
    }

    let nextDay = 1;
    while (result.length % 7 !== 0) {
      const date = new Date(year, monthIndex + 1, nextDay);
      result.push({ day: nextDay, muted: true, dateKey: formatDateKey(date.getFullYear(), date.getMonth(), nextDay) });
      nextDay += 1;
    }

    return result;
  }, [displayDate]);

  const selectedTasks = grouped[selectedDate] || [];

  function shiftMonth(delta) {
    setDisplayDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function goToday() {
    onSelectDate(todayDateString());
    setDisplayDate(parseDate(todayDateString()));
  }

  return (
    <section className="glass-card calendar-card">
      <div className="section-head calendar-head">
        <div>
          <h2>{monthName(displayDate)}</h2>
          <p>Scan busy days first, then decide what to execute.</p>
        </div>
        <div className="calendar-actions">
          <button className="icon-btn" type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)}><ChevronLeft size={16} /></button>
          <button className="subtle-pill" type="button" onClick={goToday}>Today</button>
          <button className="icon-btn" type="button" aria-label="Next month" onClick={() => shiftMonth(1)}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="calendar-grid weekdays">
        {weekdays.map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="calendar-grid days">
        {cells.map((cell, index) => {
          const dayTasks = grouped[cell.dateKey] || [];
          const count = dayTasks.length;
          const level = getWorkloadLevel(count);
          const selected = cell.dateKey === selectedDate;
          const dots = Array.from({ length: Math.min(count, 4) });
          return (
            <button
              type="button"
              className={`calendar-day ${cell.muted ? 'muted-day' : ''} ${level} ${selected ? 'selected-day' : ''}`}
              key={`${cell.dateKey}-${index}`}
              title={`${readableLevel(level, count)} • ${count} task${count === 1 ? '' : 's'}`}
              onClick={() => onSelectDate(cell.dateKey)}
            >
              <span>{cell.day}</span>
              <div className="task-dots workload-dots">
                {dots.map((_, dotIndex) => (
                  <i key={`${cell.dateKey}-${dotIndex}`} className={`workload-dot ${level || 'empty'}`} />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="calendar-bottom">
        <div className="legend-row workload-legend">
          <span><i className="legend light" />Light: 1 task</span>
          <span><i className="legend medium" />Medium: 2 tasks</span>
          <span><i className="legend busy" />Busy: 3 tasks</span>
          <span><i className="legend very-busy" />Very Busy: 4+ tasks</span>
        </div>
        <div className="selected-date-card">
          <strong>{formatDateLabel(selectedDate)}</strong>
          <small>{selectedTasks.length} task{selectedTasks.length === 1 ? '' : 's'} scheduled</small>
          <ul>
            {selectedTasks.length > 0 ? selectedTasks.map((task) => <li key={task.id}>{task.title}</li>) : <li>No task for this day</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
