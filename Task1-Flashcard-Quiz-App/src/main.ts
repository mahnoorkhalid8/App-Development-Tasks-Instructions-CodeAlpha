import './style.css';

interface Flashcard {
  question: string;
  answer: string;
}

type ModalMode = 'add' | 'edit';

const STORAGE_KEY = 'flashcard-quiz-app-cards';

const defaultCards: Flashcard[] = [
  { question: 'What is the capital of France?', answer: 'Paris' },
  { question: 'What does HTML stand for?', answer: 'HyperText Markup Language' },
  { question: 'What is 7 x 8?', answer: '56' },
  { question: 'Who wrote "Romeo and Juliet"?', answer: 'William Shakespeare' },
  { question: 'What planet is known as the Red Planet?', answer: 'Mars' },
];

let cards: Flashcard[] = [];
let currentIndex = 0;
let isFlipped = false;
let modalMode: ModalMode = 'add';

function $<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element with id "${id}" not found`);
  return el as T;
}

const BTN_BASE = 'border-0 rounded-[10px] px-[18px] py-2.5 text-sm font-semibold cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0';

function template(): string {
  return `
    <div class="app w-full max-w-[560px] bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-2xl">
      <header class="text-center mb-5 text-white">
        <h1 class="m-0 mb-1 text-3xl">📚 Flashcard Quiz</h1>
        <p class="m-0 text-sm opacity-85">Study smarter — flip, navigate, and customize your cards</p>
      </header>

      <main>
        <div id="cardCounter" class="text-center text-white font-semibold mb-3.5 opacity-90">Card 1 of 1</div>

        <div class="[perspective:1200px] mb-5">
          <div id="flashcard" class="relative w-full min-h-[260px] sm:min-h-[220px] [transform-style:preserve-3d] transition-transform duration-500 ease-[cubic-bezier(.4,.2,.2,1)] cursor-pointer">
            <div class="card-face absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-7 rounded-2xl [backface-visibility:hidden] text-center shadow-lg bg-white text-slate-800">
              <span class="text-[0.72rem] tracking-wider font-bold text-teal-600">QUESTION</span>
              <p id="questionText" class="text-lg leading-relaxed m-0 break-words">Add your first flashcard to get started!</p>
            </div>
            <div class="card-face absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-7 rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] text-center shadow-lg bg-cyan-50 text-slate-800">
              <span class="text-[0.72rem] tracking-wider font-bold text-teal-600">ANSWER</span>
              <p id="answerText" class="text-lg leading-relaxed m-0 break-words">—</p>
            </div>
          </div>
        </div>

        <div class="flex gap-2.5 justify-center flex-wrap mb-3">
          <button id="prevBtn" class="${BTN_BASE} bg-white/20 text-white">⬅ Previous</button>
          <button id="showAnswerBtn" class="${BTN_BASE} bg-white text-teal-600">Show Answer</button>
          <button id="nextBtn" class="${BTN_BASE} bg-white/20 text-white">Next ➡</button>
        </div>

        <div class="flex gap-2.5 justify-center flex-wrap mb-3">
          <button id="addBtn" class="${BTN_BASE} bg-emerald-500 text-white">+ Add Card</button>
          <button id="editBtn" class="${BTN_BASE} bg-amber-500 text-white">✎ Edit Card</button>
          <button id="deleteBtn" class="${BTN_BASE} bg-red-500 text-white">🗑 Delete Card</button>
        </div>
      </main>

      <footer class="text-center text-white text-sm opacity-85 mt-2">
        <p class="m-0">Total cards: <span id="totalCount">0</span></p>
      </footer>
    </div>

    <div id="modalOverlay" class="hidden fixed inset-0 bg-black/50 items-center justify-center p-5 z-10">
      <div class="bg-white rounded-2xl p-6 w-full max-w-[420px] shadow-2xl">
        <h2 id="modalTitle" class="mt-0 mb-0 text-slate-800 text-xl font-semibold">Add Flashcard</h2>
        <label for="inputQuestion" class="block mt-3 mb-1.5 font-semibold text-gray-500 text-sm">Question</label>
        <textarea id="inputQuestion" rows="3" placeholder="Enter the question" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 font-sans text-[0.95rem] resize-y"></textarea>
        <label for="inputAnswer" class="block mt-3 mb-1.5 font-semibold text-gray-500 text-sm">Answer</label>
        <textarea id="inputAnswer" rows="3" placeholder="Enter the answer" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 font-sans text-[0.95rem] resize-y"></textarea>
        <div class="flex justify-end gap-2.5 mt-5">
          <button id="cancelModalBtn" class="${BTN_BASE} bg-gray-200 text-slate-800">Cancel</button>
          <button id="saveModalBtn" class="${BTN_BASE} bg-teal-600 text-white">Save</button>
        </div>
      </div>
    </div>
  `;
}

$<HTMLDivElement>('app').innerHTML = template();

const flashcard = $<HTMLDivElement>('flashcard');
const questionText = $<HTMLParagraphElement>('questionText');
const answerText = $<HTMLParagraphElement>('answerText');
const cardCounter = $<HTMLDivElement>('cardCounter');
const totalCount = $<HTMLSpanElement>('totalCount');

const prevBtn = $<HTMLButtonElement>('prevBtn');
const nextBtn = $<HTMLButtonElement>('nextBtn');
const showAnswerBtn = $<HTMLButtonElement>('showAnswerBtn');
const addBtn = $<HTMLButtonElement>('addBtn');
const editBtn = $<HTMLButtonElement>('editBtn');
const deleteBtn = $<HTMLButtonElement>('deleteBtn');

const modalOverlay = $<HTMLDivElement>('modalOverlay');
const modalTitle = $<HTMLHeadingElement>('modalTitle');
const inputQuestion = $<HTMLTextAreaElement>('inputQuestion');
const inputAnswer = $<HTMLTextAreaElement>('inputAnswer');
const saveModalBtn = $<HTMLButtonElement>('saveModalBtn');
const cancelModalBtn = $<HTMLButtonElement>('cancelModalBtn');

function loadCards(): void {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Flashcard[];
      cards = Array.isArray(parsed) && parsed.length ? parsed : [...defaultCards];
    } catch {
      cards = [...defaultCards];
    }
  } else {
    cards = [...defaultCards];
  }
}

function saveCards(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function setFlipped(flipped: boolean): void {
  isFlipped = flipped;
  flashcard.style.transform = flipped ? 'rotateY(180deg)' : '';
}

function renderCard(): void {
  const hasCards = cards.length > 0;
  setFlipped(false);

  if (!hasCards) {
    questionText.textContent = 'No flashcards yet. Click "+ Add Card" to create one!';
    answerText.textContent = '—';
    cardCounter.textContent = 'Card 0 of 0';
    totalCount.textContent = '0';
    editBtn.disabled = true;
    deleteBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    showAnswerBtn.disabled = true;
    return;
  }

  editBtn.disabled = false;
  deleteBtn.disabled = false;
  prevBtn.disabled = false;
  nextBtn.disabled = false;
  showAnswerBtn.disabled = false;

  const card = cards[currentIndex];
  questionText.textContent = card.question;
  answerText.textContent = card.answer;
  cardCounter.textContent = `Card ${currentIndex + 1} of ${cards.length}`;
  totalCount.textContent = String(cards.length);
}

function showNext(): void {
  if (!cards.length) return;
  currentIndex = (currentIndex + 1) % cards.length;
  renderCard();
}

function showPrev(): void {
  if (!cards.length) return;
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  renderCard();
}

function toggleFlip(): void {
  if (!cards.length) return;
  setFlipped(!isFlipped);
}

function openModal(mode: ModalMode): void {
  modalMode = mode;
  if (mode === 'add') {
    modalTitle.textContent = 'Add Flashcard';
    inputQuestion.value = '';
    inputAnswer.value = '';
  } else {
    modalTitle.textContent = 'Edit Flashcard';
    const card = cards[currentIndex];
    inputQuestion.value = card.question;
    inputAnswer.value = card.answer;
  }
  modalOverlay.classList.remove('hidden');
  modalOverlay.classList.add('flex');
  inputQuestion.focus();
}

function closeModal(): void {
  modalOverlay.classList.add('hidden');
  modalOverlay.classList.remove('flex');
}

function saveModal(): void {
  const q = inputQuestion.value.trim();
  const a = inputAnswer.value.trim();
  if (!q || !a) {
    alert('Please fill in both question and answer.');
    return;
  }

  if (modalMode === 'add') {
    cards.push({ question: q, answer: a });
    currentIndex = cards.length - 1;
  } else {
    cards[currentIndex] = { question: q, answer: a };
  }

  saveCards();
  renderCard();
  closeModal();
}

function deleteCard(): void {
  if (!cards.length) return;
  const confirmed = confirm('Delete this flashcard?');
  if (!confirmed) return;

  cards.splice(currentIndex, 1);
  if (currentIndex >= cards.length) {
    currentIndex = Math.max(0, cards.length - 1);
  }
  saveCards();
  renderCard();
}

prevBtn.addEventListener('click', showPrev);
nextBtn.addEventListener('click', showNext);
showAnswerBtn.addEventListener('click', toggleFlip);
flashcard.addEventListener('click', toggleFlip);

addBtn.addEventListener('click', () => openModal('add'));
editBtn.addEventListener('click', () => openModal('edit'));
deleteBtn.addEventListener('click', deleteCard);

saveModalBtn.addEventListener('click', saveModal);
cancelModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e: MouseEvent) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (!modalOverlay.classList.contains('hidden')) return;
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === ' ') { e.preventDefault(); toggleFlip(); }
});

loadCards();
renderCard();
