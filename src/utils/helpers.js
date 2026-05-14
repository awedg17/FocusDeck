export function classByValue(value = '') {
  return String(value).toLowerCase().replace(/\s+/g, '-');
}

export function groupTasksByDate(tasks = []) {
  return tasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});
}

export function formatDateKey(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, '0');
  const date = String(day).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

export function getWorkloadLevel(count) {
  if (count >= 4) return 'very-busy';
  if (count >= 3) return 'busy';
  if (count >= 2) return 'medium';
  if (count >= 1) return 'light-workload';
  return '';
}

export function formatDateLabel(dateString) {
  if (!dateString) return 'No date';
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateFull(dateString) {
  if (!dateString) return 'No date';
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function todayDateString() {
  // Static prototype date so the demo stays consistent across devices.
  return '2025-05-20';
}

export function toDateInputValue(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatReminder(reminderAt) {
  if (!reminderAt) return 'No reminder';
  const date = new Date(reminderAt);
  if (Number.isNaN(date.getTime())) return 'Invalid reminder';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function dateInRange(dateString, start, end) {
  if (!dateString || !start || !end) return false;
  return dateString >= start && dateString <= end;
}
