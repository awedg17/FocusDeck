import { useRef, useState } from 'react';
import { Download, RefreshCw, Upload } from 'lucide-react';

const accentOptions = ['indigo', 'teal', 'purple', 'green'];
const tabs = ['Appearance', 'Notifications', 'Focus Mode', 'Review Preferences', 'Data'];

function Toggle({ checked, onChange }) {
  return (
    <button type="button" className={`toggle ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <i />
    </button>
  );
}

function SettingRow({ title, hint, children }) {
  return (
    <div className="setting-row">
      <div>
        <span>{title}</span>
        <small>{hint}</small>
      </div>
      {children}
    </div>
  );
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function SettingsPage({ settings, setSettings, tasks, setTasks, habits, setHabits, onResetAll }) {
  const [activeTab, setActiveTab] = useState('Appearance');
  const [saved, setSaved] = useState(false);
  const [dataNote, setDataNote] = useState('');
  const fileInputRef = useRef(null);

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function exportData() {
    downloadJson({ exportedAt: new Date().toISOString(), settings, tasks, habits }, 'focusdeck-backup.json');
    setDataNote('Exported a JSON backup. Keep it somewhere safe before switching device.');
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.habits) || typeof parsed.settings !== 'object') {
          throw new Error('Invalid FocusDeck backup file.');
        }
        setTasks(parsed.tasks);
        setHabits(parsed.habits);
        setSettings((prev) => ({ ...prev, ...parsed.settings }));
        setDataNote('Import complete. Your local tasks, habits, review data, and settings were replaced.');
      } catch (error) {
        setDataNote(error.message || 'Import failed.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  function resetData() {
    const ok = window.confirm('Reset FocusDeck local data? This will restore the example task, example habit, settings, and performance stats.');
    if (!ok) return;
    onResetAll();
    setDataNote('FocusDeck has been reset to the clean starter data.');
  }

  return (
    <div className="page settings-page wide-settings-page">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">Make it yours</p>
          <h1>Settings</h1>
          <p>Change preferences, export local data, import backups, or reset FocusDeck when you need a clean start.</p>
        </div>
      </header>

      <div className="settings-tabs-top">
        {tabs.map((tab) => (
          <button type="button" key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <section className="settings-layout clickable-settings-layout">
        <aside className="glass-card settings-nav-card settings-side-tabs">
          {tabs.map((tab) => (
            <button type="button" key={tab} className={`settings-nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </aside>

        <section className="glass-card settings-card live-settings-panel">
          <div className="settings-panel-head">
            <div className="settings-profile no-border">
              <div className="avatar large">D</div>
              <div>
                <h3>Dewa</h3>
                <p>Local prototype account</p>
              </div>
            </div>
            <span className="active-tab-pill">{activeTab}</span>
          </div>

          {activeTab === 'Appearance' && (
            <div className="settings-section-block">
              <h3>Appearance</h3>
              <SettingRow title="Theme" hint="Choose how FocusDeck should look.">
                <div className="segment-switch mini-segment">
                  <button type="button" className={settings.theme === 'dark' ? 'active' : ''} onClick={() => updateSetting('theme', 'dark')}>Dark</button>
                  <button type="button" className={settings.theme === 'system' ? 'active' : ''} onClick={() => updateSetting('theme', 'system')}>System</button>
                </div>
              </SettingRow>
              <SettingRow title="Accent Color" hint="Pick the color vibe you want to see every morning.">
                <div className="accent-picker">
                  {accentOptions.map((item) => (
                    <button type="button" key={item} aria-label={item} title={item} className={`accent-dot ${item} ${settings.accentColor === item ? 'selected' : ''}`} onClick={() => updateSetting('accentColor', item)} />
                  ))}
                </div>
              </SettingRow>
              <SettingRow title="Compact Mode" hint="Show more content in less space.">
                <Toggle checked={settings.compactMode} onChange={(value) => updateSetting('compactMode', value)} />
              </SettingRow>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="settings-section-block">
              <h3>Notifications</h3>
              <SettingRow title="Daily Reminder" hint="Remind me to open the daily dashboard.">
                <Toggle checked={settings.reminders} onChange={(value) => updateSetting('reminders', value)} />
              </SettingRow>
              <SettingRow title="Notifications" hint="Task updates and review reminders.">
                <Toggle checked={settings.notifications} onChange={(value) => updateSetting('notifications', value)} />
              </SettingRow>
              <SettingRow title="Review Reminder Time" hint="Type the time on desktop or use the native mobile time picker.">
                <input type="time" step="300" value={settings.reviewReminder} onChange={(event) => updateSetting('reviewReminder', event.target.value)} />
              </SettingRow>
            </div>
          )}

          {activeTab === 'Focus Mode' && (
            <div className="settings-section-block">
              <h3>Focus Mode</h3>
              <SettingRow title="Focus Sound" hint="Play a subtle sound when a focus session starts.">
                <Toggle checked={settings.focusSound} onChange={(value) => updateSetting('focusSound', value)} />
              </SettingRow>
              <SettingRow title="Focus Duration" hint="Default length for focus sessions.">
                <select value={settings.focusDuration} onChange={(event) => updateSetting('focusDuration', event.target.value)}>
                  <option>25 min</option>
                  <option>50 min</option>
                  <option>90 min</option>
                </select>
              </SettingRow>
              <SettingRow title="Default Task View" hint="Open Tasks in your preferred view.">
                <div className="segment-switch mini-segment">
                  <button type="button" className={settings.defaultTaskView === 'list' ? 'active' : ''} onClick={() => updateSetting('defaultTaskView', 'list')}>List</button>
                  <button type="button" className={settings.defaultTaskView === 'calendar' ? 'active' : ''} onClick={() => updateSetting('defaultTaskView', 'calendar')}>Calendar</button>
                </div>
              </SettingRow>
            </div>
          )}

          {activeTab === 'Review Preferences' && (
            <div className="settings-section-block">
              <h3>Review Preferences</h3>
              <SettingRow title="Show Momentum Insights" hint="Display progress and risk hints on the dashboard.">
                <Toggle checked={settings.showMomentum} onChange={(value) => updateSetting('showMomentum', value)} />
              </SettingRow>
              <SettingRow title="Review Reminder Time" hint="Pick the time for your end-of-day check-in.">
                <input type="time" step="300" value={settings.reviewReminder} onChange={(event) => updateSetting('reviewReminder', event.target.value)} />
              </SettingRow>
              <SettingRow title="Default Review Tone" hint="Choose how direct the review prompts should feel.">
                <select defaultValue="Balanced">
                  <option>Gentle</option>
                  <option>Balanced</option>
                  <option>Direct</option>
                </select>
              </SettingRow>
            </div>
          )}

          {activeTab === 'Data' && (
            <div className="settings-section-block data-settings-block">
              <h3>Data</h3>
              <SettingRow title="Export Data" hint="Download a JSON backup of your localStorage data so you can move to another device.">
                <button type="button" className="secondary-btn" onClick={exportData}><Download size={16} /> Export</button>
              </SettingRow>
              <SettingRow title="Import Data" hint="Replace this browser's local data with a FocusDeck JSON backup.">
                <input ref={fileInputRef} className="hidden-file-input" type="file" accept="application/json,.json" onChange={importData} />
                <button type="button" className="secondary-btn" onClick={() => fileInputRef.current?.click()}><Upload size={16} /> Import</button>
              </SettingRow>
              <SettingRow title="Restart Progress" hint="Reset tasks, habits, performance stats, and settings back to starter data.">
                <button type="button" className="danger-btn" onClick={resetData}><RefreshCw size={16} /> Reset</button>
              </SettingRow>
              {dataNote ? <p className="data-note">{dataNote}</p> : null}
            </div>
          )}

          <div className="settings-save-row">
            <button type="button" className="primary-btn" onClick={() => setSaved(true)}>Save Changes</button>
            {saved && <span className="saved-note">Saved locally.</span>}
          </div>
        </section>
      </section>
    </div>
  );
}
