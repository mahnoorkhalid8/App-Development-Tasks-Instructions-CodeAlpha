import './style.css';

interface Quote {
  text: string;
  author: string;
}

const quotes: Quote[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
  { text: "You learn more from failure than from success.", author: "Unknown" },
  { text: "If you are working on something exciting, it will keep you motivated.", author: "Steve Jobs" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "Opportunities don't happen, you create them.", author: "Chris Grosser" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
];

function $<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element with id "${id}" not found`);
  return el as T;
}

function template(): string {
  return `
    <div class="w-full max-w-[620px] text-center">
      <div class="animate-[fadeIn_0.4s_ease] bg-white/5 border border-white/10 backdrop-blur-sm rounded-[20px] px-6 py-9 sm:px-10 sm:py-12 shadow-2xl">
        <div class="text-5xl text-sky-400 leading-none mb-2.5 opacity-80">❝</div>
        <p id="quoteText" class="text-xl sm:text-2xl leading-relaxed text-slate-100 font-medium m-0 mb-5 min-h-[110px] sm:min-h-[90px] flex items-center justify-center transition-opacity duration-200">Loading quote...</p>
        <p id="quoteAuthor" class="text-base sm:text-lg text-sky-400 font-semibold m-0 mb-7 transition-opacity duration-200">—</p>

        <div class="flex justify-center">
          <button id="newQuoteBtn" class="bg-sky-400 text-slate-900 border-0 px-8 py-3.5 text-base font-bold rounded-full cursor-pointer shadow-[0_8px_24px_rgba(56,189,248,0.35)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(56,189,248,0.45)] active:translate-y-0">🔄 New Quote</button>
        </div>
      </div>

      <p class="mt-6 text-slate-400 text-sm">Click the button for a fresh dose of inspiration</p>
    </div>
  `;
}

$<HTMLDivElement>('app').innerHTML = template();

const quoteText = $<HTMLParagraphElement>('quoteText');
const quoteAuthor = $<HTMLParagraphElement>('quoteAuthor');
const newQuoteBtn = $<HTMLButtonElement>('newQuoteBtn');

let lastIndex = -1;

function getRandomIndex(): number {
  if (quotes.length === 1) return 0;
  let index: number;
  do {
    index = Math.floor(Math.random() * quotes.length);
  } while (index === lastIndex);
  return index;
}

function displayQuote(): void {
  const index = getRandomIndex();
  lastIndex = index;
  const quote = quotes[index];

  quoteText.classList.add('opacity-0');
  quoteAuthor.classList.add('opacity-0');

  setTimeout(() => {
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `— ${quote.author}`;
    quoteText.classList.remove('opacity-0');
    quoteAuthor.classList.remove('opacity-0');
  }, 180);
}

newQuoteBtn.addEventListener('click', displayQuote);

displayQuote();
