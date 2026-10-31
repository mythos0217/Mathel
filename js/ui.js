// アイコン・効果音・テーマ・アプリの亀「ゼノ」
export const FILE_VERSION = '0.6.0';

// ---------------------------------------------------------------- アイコン（線画、currentColor）
const S = (body, extra = '') => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" ${extra}>${body}</svg>`;
export const ICON = {
  // 自信度：自信なし（?）・たぶん（半分の円）・確実（チェック付きの円）
  low: S('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="3 3"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16.9" r="1.1" fill="currentColor"/>'),
  mid: S('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" opacity=".55"/>'),
  high: S('<circle cx="12" cy="12" r="9" fill="currentColor" opacity=".18"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7.8 12.4l2.8 2.8 5.6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'),
  // 採点：完答（二重丸）・一部正解（三角）・不正解（×）
  full: S('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.6" fill="none" stroke="currentColor" stroke-width="2"/>'),
  part: S('<path d="M12 3.8l8.6 15.4H3.4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'),
  none: S('<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
  ok: S('<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.2"/>'),
  ng: S('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
  self: S('<path d="M4 20l4-1 10.5-10.5a2.1 2.1 0 0 0-3-3L5 16z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M13.5 7.5l3 3" stroke="currentColor" stroke-width="1.8"/>'),
  hint: S('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'),
  cases: S('<path d="M5 4v16M5 7h4M5 17h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 7h7M12 17h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  sound: S('<path d="M4 9h4l5-4v14l-5-4H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
};

// ---------------------------------------------------------------- 効果音（音声ファイルを使わず合成）
let ctx = null;
let soundOn = true;
export function setSound(on) { soundOn = on; }
function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function tone(freq, start, dur, { type = 'sine', gain = 0.16, glide = null } = {}) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + start;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
export function play(name) {
  if (!soundOn) return;
  try {
    switch (name) {
      case 'correct': tone(1046.5, 0, 0.16); tone(1318.5, 0.09, 0.32); break;            // ド→ミ
      case 'full': tone(784, 0, 0.14); tone(1046.5, 0.08, 0.16); tone(1318.5, 0.16, 0.42); break;
      case 'part': tone(659.3, 0, 0.18, { gain: 0.12 }); tone(784, 0.1, 0.3, { gain: 0.12 }); break;
      case 'wrong': tone(233, 0, 0.26, { type: 'triangle', gain: 0.2, glide: 175 }); break;
      case 'tap': tone(1600, 0, 0.04, { gain: 0.05 }); break;
      case 'finish': [523.3, 659.3, 784, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.4, { gain: 0.12 })); break;
      case 'bird': tone(660, 0, 0.12, { gain: 0.05, glide: 880 }); tone(880, 0.12, 0.16, { gain: 0.045, glide: 620 }); break;   // ぽこ
    }
  } catch { /* 音が出せない環境 */ }
}

// ---------------------------------------------------------------- テーマ（自動・ライト・ダーク）
export function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'light' || mode === 'dark') root.dataset.theme = mode; else delete root.dataset.theme;
  const dark = mode === 'dark' || (mode !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', dark ? '#16171b' : '#f6f4ee'));
}

// ---------------------------------------------------------------- 亀「ゼノ」（ゼノンの「アキレスと亀」から）
// まるい甲羅の亀（オリジナル）。色はテーマに合わせて CSS 変数から（変数名は受験数学版の鳥のまま）
export const BIRD_SVG = `<svg viewBox="0 -2 64 64" class="bird-svg" aria-hidden="true">
  <path d="M53 44c4 0 6 1.5 6 3" stroke="var(--bird-body)" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  <rect x="18" y="45" width="7" height="10" rx="3.5" fill="var(--bird-body)"/>
  <rect x="44" y="45" width="7" height="10" rx="3.5" fill="var(--bird-body)"/>
  <rect x="25" y="47" width="6" height="9" rx="3" fill="var(--bird-dark)" opacity=".55"/>
  <rect x="38" y="47" width="6" height="9" rx="3" fill="var(--bird-dark)" opacity=".55"/>
  <path d="M15 47c0-14 9-24 20-24s20 10 20 24z" fill="var(--shell)"/>
  <path d="M15 47h40" stroke="var(--shell-dark)" stroke-width="2.4" stroke-linecap="round"/>
  <g fill="none" stroke="var(--shell-dark)" stroke-width="1.5" stroke-linejoin="round" opacity=".85">
    <path d="M29 30l6-3.5 6 3.5v6l-6 3.5-6-3.5z"/>
    <path d="M29 30l-5.5-2M41 30l5.5-2M29 36l-7 4M41 36l7 4M35 39.5V47M35 26.5V23.5"/>
  </g>
  <path d="M19 38c3-8 8-12 13-13" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".45"/>
  <circle cx="11.5" cy="35" r="9.5" fill="var(--bird-body)"/>
  <ellipse cx="9" cy="33.5" rx="2" ry="2.5" fill="var(--bird-eye)"/><circle cx="9.7" cy="32.6" r=".8" fill="#fff"/>
  <ellipse cx="15.5" cy="33.5" rx="2" ry="2.5" fill="var(--bird-eye)"/><circle cx="16.2" cy="32.6" r=".8" fill="#fff"/>
  <path d="M10.5 38c1 1.2 3 1.2 4 0" stroke="var(--bird-beak)" stroke-width="1.1" stroke-linecap="round" fill="none"/>
  <ellipse cx="6.3" cy="37.5" rx="2" ry="1.3" fill="var(--bird-cheek)" opacity=".7"/><ellipse cx="18.3" cy="37.5" rx="2" ry="1.3" fill="var(--bird-cheek)" opacity=".7"/>
</svg>`;

export const BIRD_NAME = 'ゼノ';

const HEALTH = [
  'お身体は大丈夫ですか？ 肩に力が入っていたら、一度深呼吸しましょう。',
  '水分はとっていますか？ のどが渇く前に一口どうぞ。',
  '20分ごとに、20秒ほど遠くを見ると目が楽になります。',
  '背中が丸まっていませんか？ 画面は目の高さに近づけて。',
  '眠気が強いときは、5〜15分の短い仮眠も手です。',
  'ゆっくりでも、止まらなければアキレスにも負けません。',
];
const ADVICE = [
  '解説を読み返すより、閉じてもう一度解いてみる方が記憶に残ります（想起練習）。',
  '同じ問題を一気にやるより、日をあけて解き直す方が長持ちします（分散学習）。',
  '分野を混ぜて解くと「どの定理を使うか」を選ぶ力がつきます。',
  '間違えた問題は宝です。どこで道を誤ったか、1行で書いておこう。',
  '答えを見る前に「なぜその方針か」を説明してみると、理解が深まります。',
  '自信があったのに外した問題は、検算の習慣で防げます。',
  '解けない問題は、条件を1つ外した易しい問題から考えてみよう。',
  '眠っている間に記憶は整理されます。夜ふかしより、早めに寝る方が得です。',
  '詰まったら定義に戻ろう。定義をそのまま書き下すだけで道が開けることは多いです。',
  '一般の場合で詰まったら、n=1, 2, 3 や 2×2 行列など小さな例で試してみよう。',
  '証明を書き終えたら、仮定をすべて使ったか確認しよう。使っていない仮定は誤りのサインかもしれません。',
  '定理を覚えたら、仮定を1つ外した反例も一緒に覚えると忘れにくくなります。',
  '「逆は成り立つか？」と問うと、定理の意味がはっきりします。',
  '計算はスピードより正確さから。正確になれば速さは後からついてきます。',
  '図やグラフを描くと、式だけでは見えない構造が見えてきます。',
];
const QUOTES = [
  ['数学の本質は、その自由性にある。', 'ゲオルク・カントール'],
  ['数学において問いを立てる技術は、それを解くことよりも価値がある。', 'ゲオルク・カントール'],
  ['我々は知らねばならない。我々は知るであろう。', 'ダフィット・ヒルベルト'],
  ['数学とは、異なるものを同じものとみなす技術である。', 'アンリ・ポアンカレ'],
  ['論理によって証明し、直観によって発見する。', 'アンリ・ポアンカレ（趣意）'],
  ['数学は科学の女王であり、数論は数学の女王である。', 'カール・フリードリヒ・ガウス'],
  ['少なく、しかし熟したもの。', 'カール・フリードリヒ・ガウス（座右の銘）'],
  ['オイラーを読め、オイラーを読め。彼こそ我々すべての師である。', 'ピエール＝シモン・ラプラス（とされる）'],
  ['神は整数を作った。それ以外はすべて人間の業である。', 'レオポルト・クロネッカー'],
  ['美しくない数学に、この世で永続する場所はない。', 'G. H. ハーディ'],
  ['幾何学に王道なし。', 'ユークリッド（とされる）'],
  ['数学では物事を理解するのではない。ただ慣れるだけだ。', 'ジョン・フォン・ノイマン'],
  ['解けない問題があるなら、それより易しくて解ける問題がある。それを見つけよ。', 'ジョージ・ポリア'],
  ['一つの問題を三通りに解く方が、三つの問題を一通りずつ解くより良い。', 'ジョージ・ポリア（とされる）'],
  ['数学者とは、コーヒーを定理に変える装置である。', 'アルフレッド・レーニ（とされる）'],
  ['数学は情緒である。', '岡潔（趣意）'],
  ['数学は、数覚によって見えるものを記述する学問である。', '小平邦彦（趣意）'],
  ['私は見た。だが信じられない。', 'ゲオルク・カントール（デデキントへの手紙）'],
  ['代数は気前がいい。求めた以上のものを与えてくれることがよくある。', 'ジャン・ル・ロン・ダランベール（とされる）'],
  ['学びて思わざれば則ち罔し、思いて学ばざれば則ち殆し。', '孔子『論語』'],
];

export function birdMessage(kind, ctxInfo = {}) {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const h = new Date().getHours();
  if (kind === 'late') return 'もう遅い時間です。今日はここまでにして、ぐっすり眠ろう。睡眠中に記憶が整理されます。';
  if (kind === 'break') return ctxInfo.min >= 50
    ? `${ctxInfo.min}分続けて勉強しています。お身体は大丈夫ですか？ 5〜10分、立って体を伸ばしましょう。`
    : `${ctxInfo.min}分たちました。少し目を閉じて休憩しませんか？`;
  if (kind === 'summary') {
    const { solo = 0, missed = 0, n = 0 } = ctxInfo;
    if (n && solo === n) return '全部自力で解けました！ 次は難易度を1つ上げてみては？';
    if (n && missed >= n / 2) return '難しかったですね。でも、難しく感じた日の方があとで伸びます。間違えた問題は近いうちにまた出します。';
    return 'おつかれさま。間違えたところは、復習で必ず取り返せます。';
  }
  if (kind === 'greet') {
    const g = h < 5 ? 'こんばんは。夜遅くまでおつかれさま。' : h < 11 ? 'おはようございます。' : h < 18 ? 'こんにちは。' : 'こんばんは。';
    const r = Math.random();
    if (r < 0.3) return g + pick(HEALTH);
    if (r < 0.7) return g + pick(ADVICE);
    const q = pick(QUOTES); return `${g}今日のことば：「${q[0]}」（${q[1]}）`;
  }
  const r = Math.random();
  if (r < 0.3) return pick(HEALTH);
  if (r < 0.65) return pick(ADVICE);
  const q = pick(QUOTES); return `「${q[0]}」\n― ${q[1]}`;
}
