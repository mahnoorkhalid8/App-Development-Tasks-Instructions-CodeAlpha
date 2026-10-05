import './style.css';

interface ActivityLog {
  id: string;
  date: string;
  type: string;
  duration: number;
  calories: number;
  steps: number;
}

type MetricKey = 'steps' | 'calories' | 'minutes';

const STORAGE_KEY = 'fitness-tracker-app-logs';

const GOALS = {
  steps: 10000,
  calories: 500,
  minutes: 60,
  workouts: 1,
};

let logs: ActivityLog[] = [];
let activeMetric: MetricKey = 'steps';

function $<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element with id "${id}" not found`);
  return el as T;
}

const STAT_CARD = 'bg-white rounded-2xl p-5 flex flex-col items-center text-center shadow-lg';
const PROGRESS_TRACK = 'w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5';
const PROGRESS_FILL = 'h-full w-0 rounded-full transition-[width] duration-400';
const PANEL = 'bg-white rounded-2xl p-[22px] mb-5 shadow-lg';
const FORM_ROW = 'grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3';
const FORM_GROUP = 'flex flex-col gap-1.5';
const FORM_LABEL = 'text-xs font-semibold text-gray-500';
const FORM_INPUT = 'px-3 py-2.5 rounded-lg border border-gray-300 text-sm font-sans';

function template(): string {
  return `
    <div class="max-w-[900px] mx-auto">
      <header class="text-center text-white mb-6">
        <h1 class="m-0 mb-1 text-3xl">🏃 Fitness Tracker</h1>
        <p class="m-0 opacity-85">Log your activities and track your progress</p>
      </header>

      <section class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">
        <div class="${STAT_CARD}">
          <span class="text-3xl mb-1.5">👣</span>
          <span id="statSteps" class="text-3xl font-extrabold text-gray-900">0</span>
          <span class="text-xs text-gray-500 mb-2.5">Steps Today</span>
          <div class="${PROGRESS_TRACK}"><div id="progressSteps" class="${PROGRESS_FILL} bg-emerald-500"></div></div>
          <span class="text-[0.72rem] text-gray-500">Goal: 10,000</span>
        </div>

        <div class="${STAT_CARD}">
          <span class="text-3xl mb-1.5">🔥</span>
          <span id="statCalories" class="text-3xl font-extrabold text-gray-900">0</span>
          <span class="text-xs text-gray-500 mb-2.5">Calories Burned</span>
          <div class="${PROGRESS_TRACK}"><div id="progressCalories" class="${PROGRESS_FILL} bg-amber-500"></div></div>
          <span class="text-[0.72rem] text-gray-500">Goal: 500</span>
        </div>

        <div class="${STAT_CARD}">
          <span class="text-3xl mb-1.5">⏱️</span>
          <span id="statMinutes" class="text-3xl font-extrabold text-gray-900">0</span>
          <span class="text-xs text-gray-500 mb-2.5">Active Minutes</span>
          <div class="${PROGRESS_TRACK}"><div id="progressMinutes" class="${PROGRESS_FILL} bg-blue-500"></div></div>
          <span class="text-[0.72rem] text-gray-500">Goal: 60</span>
        </div>

        <div class="${STAT_CARD}">
          <span class="text-3xl mb-1.5">💪</span>
          <span id="statWorkouts" class="text-3xl font-extrabold text-gray-900">0</span>
          <span class="text-xs text-gray-500 mb-2.5">Workouts Today</span>
          <div class="${PROGRESS_TRACK}"><div id="progressWorkouts" class="${PROGRESS_FILL} bg-rose-600"></div></div>
          <span class="text-[0.72rem] text-gray-500">Goal: 1</span>
        </div>
      </section>

      <section class="${PANEL}">
        <div class="flex items-center justify-between flex-wrap gap-2.5 mb-4">
          <h2 class="m-0 text-gray-900 text-[1.15rem] font-semibold">Weekly Progress</h2>
          <div class="flex gap-1.5 bg-gray-100 p-1 rounded-full">
            <button class="chart-toggle-btn border-0 px-3.5 py-1.5 text-xs font-semibold rounded-full cursor-pointer bg-emerald-500 text-white" data-metric="steps">Steps</button>
            <button class="chart-toggle-btn border-0 px-3.5 py-1.5 text-xs font-semibold rounded-full cursor-pointer bg-transparent text-gray-500" data-metric="calories">Calories</button>
            <button class="chart-toggle-btn border-0 px-3.5 py-1.5 text-xs font-semibold rounded-full cursor-pointer bg-transparent text-gray-500" data-metric="minutes">Minutes</button>
          </div>
        </div>
        <div id="weeklyChart" class="flex items-end justify-between gap-2.5 h-[180px] pt-2.5"></div>
      </section>

      <section class="${PANEL}">
        <h2 class="m-0 mb-4 text-gray-900 text-[1.15rem] font-semibold">Log Activity</h2>
        <form id="logForm" class="flex flex-col gap-3.5">
          <div class="${FORM_ROW}">
            <div class="${FORM_GROUP}">
              <label for="inputDate" class="${FORM_LABEL}">Date</label>
              <input type="date" id="inputDate" required class="${FORM_INPUT}">
            </div>
            <div class="${FORM_GROUP}">
              <label for="inputType" class="${FORM_LABEL}">Exercise Type</label>
              <select id="inputType" required class="${FORM_INPUT}">
                <option value="Walking">🚶 Walking</option>
                <option value="Running">🏃 Running</option>
                <option value="Cycling">🚴 Cycling</option>
                <option value="Swimming">🏊 Swimming</option>
                <option value="Yoga">🧘 Yoga</option>
                <option value="Weight Training">🏋️ Weight Training</option>
                <option value="Other">✨ Other</option>
              </select>
            </div>
          </div>
          <div class="${FORM_ROW}">
            <div class="${FORM_GROUP}">
              <label for="inputDuration" class="${FORM_LABEL}">Duration (min)</label>
              <input type="number" id="inputDuration" min="0" placeholder="30" required class="${FORM_INPUT}">
            </div>
            <div class="${FORM_GROUP}">
              <label for="inputCalories" class="${FORM_LABEL}">Calories Burned</label>
              <input type="number" id="inputCalories" min="0" placeholder="150" required class="${FORM_INPUT}">
            </div>
            <div class="${FORM_GROUP}">
              <label for="inputSteps" class="${FORM_LABEL}">Steps</label>
              <input type="number" id="inputSteps" min="0" placeholder="3000" class="${FORM_INPUT}">
            </div>
          </div>
          <button type="submit" class="self-start bg-emerald-500 text-white border-0 px-6 py-3 rounded-[10px] font-bold text-[0.95rem] cursor-pointer transition-transform duration-150 hover:-translate-y-0.5">+ Log Activity</button>
        </form>
      </section>

      <section class="${PANEL}">
        <h2 class="m-0 mb-4 text-gray-900 text-[1.15rem] font-semibold">Activity History</h2>
        <div class="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto" id="historyList">
          <p class="text-center text-gray-500 py-5">No activities logged yet. Add your first one above!</p>
        </div>
      </section>
    </div>
  `;
}

$<HTMLDivElement>('app').innerHTML = template();

const inputDate = $<HTMLInputElement>('inputDate');
const inputType = $<HTMLSelectElement>('inputType');
const inputDuration = $<HTMLInputElement>('inputDuration');
const inputCalories = $<HTMLInputElement>('inputCalories');
const inputSteps = $<HTMLInputElement>('inputSteps');
const logForm = $<HTMLFormElement>('logForm');
const historyList = $<HTMLDivElement>('historyList');
const weeklyChart = $<HTMLDivElement>('weeklyChart');
const toggleButtons = document.querySelectorAll<HTMLButtonElement>('.chart-toggle-btn');

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadLogs(): void {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      logs = (JSON.parse(saved) as ActivityLog[]) || [];
    } catch {
      logs = [];
    }
  }
}

function saveLogs(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function addLog(entry: ActivityLog): void {
  logs.unshift(entry);
  saveLogs();
  renderAll();
}

function deleteLog(id: string): void {
  logs = logs.filter((l) => l.id !== id);
  saveLogs();
  renderAll();
}

function getLogsForDate(dateStr: string): ActivityLog[] {
  return logs.filter((l) => l.date === dateStr);
}

function sumField(entries: ActivityLog[], field: keyof ActivityLog): number {
  return entries.reduce((sum, e) => sum + (Number(e[field]) || 0), 0);
}

function renderSummary(): void {
  const today = todayStr();
  const todaysLogs = getLogsForDate(today);

  const steps = sumField(todaysLogs, 'steps');
  const calories = sumField(todaysLogs, 'calories');
  const minutes = sumField(todaysLogs, 'duration');
  const workouts = todaysLogs.length;

  $<HTMLSpanElement>('statSteps').textContent = steps.toLocaleString();
  $<HTMLSpanElement>('statCalories').textContent = calories.toLocaleString();
  $<HTMLSpanElement>('statMinutes').textContent = minutes.toLocaleString();
  $<HTMLSpanElement>('statWorkouts').textContent = String(workouts);

  setProgress('progressSteps', steps, GOALS.steps);
  setProgress('progressCalories', calories, GOALS.calories);
  setProgress('progressMinutes', minutes, GOALS.minutes);
  setProgress('progressWorkouts', workouts, GOALS.workouts);
}

function setProgress(elId: string, value: number, goal: number): void {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  $<HTMLDivElement>(elId).style.width = `${pct}%`;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function renderChart(): void {
  const days = getLast7Days();
  const fieldMap: Record<MetricKey, keyof ActivityLog> = {
    steps: 'steps',
    calories: 'calories',
    minutes: 'duration',
  };
  const field = fieldMap[activeMetric];

  const values = days.map((d) => sumField(getLogsForDate(d), field));
  const max = Math.max(...values, 1);

  weeklyChart.innerHTML = '';
  days.forEach((d, i) => {
    const value = values[i];
    const heightPct = Math.max(2, Math.round((value / max) * 100));
    const label = new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' });

    const wrap = document.createElement('div');
    wrap.className = 'flex-1 flex flex-col items-center h-full justify-end';
    wrap.innerHTML = `
      <span class="text-[0.7rem] text-gray-500 mb-1 font-semibold">${value.toLocaleString()}</span>
      <div class="w-full max-w-9 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-t-md min-h-[3px] transition-[height] duration-400" style="height:${heightPct}%"></div>
      <span class="mt-2 text-xs text-gray-500 font-semibold">${label}</span>
    `;
    weeklyChart.appendChild(wrap);
  });
}

function renderHistory(): void {
  if (!logs.length) {
    historyList.innerHTML = '<p class="text-center text-gray-500 py-5">No activities logged yet. Add your first one above!</p>';
    return;
  }

  const typeIcons: Record<string, string> = {
    Walking: '🚶', Running: '🏃', Cycling: '🚴',
    Swimming: '🏊', Yoga: '🧘', 'Weight Training': '🏋️', Other: '✨',
  };

  historyList.innerHTML = logs.map((log) => `
    <div class="flex items-center justify-between gap-2.5 bg-gray-50 rounded-[10px] px-3.5 py-3 flex-wrap">
      <div class="flex flex-col gap-0.5">
        <span class="font-bold text-gray-900 text-[0.92rem]">${typeIcons[log.type] || '✨'} ${log.type}</span>
        <span class="text-xs text-gray-500">${log.date}</span>
      </div>
      <div class="flex gap-3 text-sm text-gray-500 flex-wrap">
        <span>⏱️ ${log.duration} min</span>
        <span>🔥 ${log.calories} cal</span>
        ${log.steps ? `<span>👣 ${log.steps} steps</span>` : ''}
      </div>
      <button class="history-delete bg-transparent border-0 text-red-500 cursor-pointer text-base p-1.5" data-id="${log.id}" title="Delete">🗑</button>
    </div>
  `).join('');

  historyList.querySelectorAll<HTMLButtonElement>('.history-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (id) deleteLog(id);
    });
  });
}

function renderAll(): void {
  renderSummary();
  renderChart();
  renderHistory();
}

logForm.addEventListener('submit', (e: SubmitEvent) => {
  e.preventDefault();

  const entry: ActivityLog = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    date: inputDate.value || todayStr(),
    type: inputType.value,
    duration: Number(inputDuration.value) || 0,
    calories: Number(inputCalories.value) || 0,
    steps: Number(inputSteps.value) || 0,
  };

  addLog(entry);
  logForm.reset();
  inputDate.value = todayStr();
});

toggleButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    toggleButtons.forEach((b) => {
      b.classList.remove('bg-emerald-500', 'text-white');
      b.classList.add('bg-transparent', 'text-gray-500');
    });
    btn.classList.remove('bg-transparent', 'text-gray-500');
    btn.classList.add('bg-emerald-500', 'text-white');
    activeMetric = btn.dataset.metric as MetricKey;
    renderChart();
  });
});

inputDate.value = todayStr();
loadLogs();
renderAll();
