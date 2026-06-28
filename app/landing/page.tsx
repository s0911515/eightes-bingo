"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const events = [
  {
    icon: "🎯",
    title: "的当て",
    subtitle: "輪ゴム銃を自分で作ろう！",
    description: "まずは輪ゴム銃をDIY。完成したら腕試し！小さい子にはスタッフがサポートします。",
    color: "from-red-500 to-orange-500",
    badge: "手作り体験",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    icon: "🎣",
    title: "お菓子釣り",
    subtitle: "釣竿も自分で作ろう！",
    description: "オリジナル釣竿を作って、美味しいお菓子を釣り上げよう！",
    color: "from-blue-500 to-cyan-500",
    badge: "手作り体験",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    icon: "⭕",
    title: "輪投げ",
    subtitle: "輪っかも自分で作ろう！",
    description: "新聞紙を丸めて輪っかをDIY。自分で作った輪を使って輪投げに挑戦！うまく入れられるかな？",
    color: "from-green-500 to-teal-500",
    badge: "手作り体験",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    icon: "🔥",
    title: "マシュマロ焼き",
    subtitle: "集会所テラスの炭火で♪",
    description: "本物の炭火でじっくり焼くとろとろマシュマロ。最高の甘さをどうぞ！",
    color: "from-amber-500 to-yellow-400",
    badge: "炭火体験",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: "🎱",
    title: "オンラインビンゴ",
    subtitle: "先着20名に景品をプレゼント！",
    description: "大人も子どもも楽しめるビンゴ大会！商品券などちょっとした景品をご用意。",
    color: "from-purple-600 to-indigo-500",
    badge: "景品あり",
    badgeColor: "bg-purple-100 text-purple-700",
    link: true,
  },
];

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { label: "日", value: timeLeft.days },
    { label: "時間", value: timeLeft.hours },
    { label: "分", value: timeLeft.minutes },
    { label: "秒", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center bg-white/15 backdrop-blur rounded-2xl px-4 py-3 min-w-[68px]">
          <span className="text-3xl sm:text-4xl font-black text-white tabular-nums leading-none">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-white/70 text-xs mt-1 font-bold">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* Floating decoration dots — static values, no Math.random() */
const DOTS = [
  { size: 10, top: "8%", left: "5%", delay: "0s", color: "#FFD700" },
  { size: 7, top: "18%", left: "88%", delay: "0.4s", color: "#FF6B6B" },
  { size: 12, top: "72%", left: "3%", delay: "0.8s", color: "#7FDBFF" },
  { size: 6, top: "85%", left: "90%", delay: "1.2s", color: "#B10DC9" },
  { size: 9, top: "50%", left: "95%", delay: "0.6s", color: "#FFD700" },
  { size: 5, top: "35%", left: "1%", delay: "1.5s", color: "#FF851B" },
];

function FloatingDots() {
  return (
    <>
      {DOTS.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-60 animate-bounce"
          style={{
            width: d.size,
            height: d.size,
            top: d.top,
            left: d.left,
            animationDelay: d.delay,
            background: d.color,
            animationDuration: "2.5s",
          }}
        />
      ))}
    </>
  );
}

const FESTIVAL_DATE = new Date("2026-08-29T00:00:00+09:00");

function BingoLink({ className, children }: { className: string; children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (Date.now() >= FESTIVAL_DATE.getTime()) {
      window.location.href = "/";
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        {children}
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative bg-gradient-to-br from-[#1a0a6e] to-[#0d0540] border border-purple-500/40 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_60px_rgba(130,80,255,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-4">🎱</div>
            <h3 className="text-xl font-black text-white mb-2">もうすぐだよ！</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-1">
              ビンゴへの参加登録は<strong className="text-yellow-300">当日 8月29日</strong>からスタートします。
            </p>
            <p className="text-white/50 text-xs mb-6">
              16:00の開始に合わせてアクセスしてね 🏮
            </p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
            >
              とじる
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* Pre-computed star positions to avoid SSR/client Math.random() mismatch */
const STARS = Array.from({ length: 60 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  const r1 = seed / 233280;
  const r2 = ((seed * 9301 + 49297) % 233280) / 233280;
  const r3 = ((seed * 7919 + 13337) % 233280) / 233280;
  const r4 = ((seed * 6271 + 28657) % 233280) / 233280;
  const r5 = ((seed * 4889 + 21943) % 233280) / 233280;
  const r6 = ((seed * 3571 + 17011) % 233280) / 233280;
  return {
    w: r1 * 3 + 1,
    h: r2 * 3 + 1,
    top: `${r3 * 100}%`,
    left: `${r4 * 100}%`,
    opacity: r5 * 0.7 + 0.2,
    duration: `${r6 * 3 + 2}s`,
    delay: `${r1 * 3}s`,
  };
});

export default function LandingPage() {
  const festivalDate = new Date("2026-08-29T16:00:00+09:00");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0540] via-[#1a0a6e] to-[#0d0540] text-white overflow-x-hidden">

      {/* ===== HERO ===== */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 [@media(max-height:700px)]:py-10 text-center overflow-hidden"
      >
        {/* stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {STARS.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: s.w,
                height: s.h,
                top: s.top,
                left: s.left,
                opacity: s.opacity,
                animationDuration: s.duration,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>

        {/* Fireworks decoration */}
        <div className="absolute top-4 right-2 sm:right-10 opacity-80 pointer-events-none">
          <Image src="/img/fireworks.svg" alt="" width={140} height={140} />
        </div>
        <div className="absolute top-10 left-2 sm:left-10 opacity-60 pointer-events-none scale-x-[-1]">
          <Image src="/img/fireworks.svg" alt="" width={110} height={110} />
        </div>

        {/* Lanterns */}
        <div className="absolute top-0 left-[12%] pointer-events-none hidden sm:block">
          <Image src="/img/lantern.svg" alt="" width={50} height={75} />
        </div>
        <div className="absolute top-0 right-[12%] pointer-events-none hidden sm:block">
          <Image src="/img/lantern.svg" alt="" width={50} height={75} />
        </div>

        <FloatingDots />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 font-black text-sm px-5 py-2 rounded-full mb-6 [@media(max-height:700px)]:mb-3 shadow-lg shadow-yellow-400/30 animate-pulse">
          <span>🏮</span> 2026年 夏 開催決定！
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl [@media(max-height:700px)]:text-3xl font-black leading-tight mb-4 [@media(max-height:700px)]:mb-2 drop-shadow-[0_0_30px_rgba(255,200,0,0.5)]">
          <span className="text-yellow-300">Eightes Town</span>
          <br />
          <span className="text-white text-3xl sm:text-5xl lg:text-6xl">みんなで作ろう！</span>
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, #FFD700, #FF6B6B, #FFD700)",
              WebkitBackgroundClip: "text",
            }}
          >
            初めての夏祭り
          </span>
        </h1>

        <p className="text-2xl sm:text-3xl font-bold text-white/90 mt-2 mb-8 [@media(max-height:700px)]:mt-0 [@media(max-height:700px)]:mb-4 tracking-wider">
          🗓 2026年8月29日（土）16:00〜
        </p>

        {/* Countdown */}
        <div className="mb-10 [@media(max-height:700px)]:mb-5">
          <p className="text-white/60 text-sm font-bold mb-3 [@media(max-height:700px)]:mb-2 uppercase tracking-widest">開催まで</p>
          <CountdownTimer targetDate={festivalDate} />
        </div>

        {/* Characters */}
        <div className="flex justify-center gap-4 mb-8 [@media(max-height:700px)]:mb-4">
          <Image
            src="/img/chara2.png"
            alt=""
            width={100}
            height={100}
            className="drop-shadow-[0_0_20px_rgba(255,200,0,0.6)]"
          />
          <Image
            src="/img/chara1.png"
            alt=""
            width={100}
            height={100}
            className="drop-shadow-[0_0_20px_rgba(255,200,0,0.6)]"
          />
        </div>

        {/* Scroll hint */}
        <div className="animate-bounce text-white/50 text-sm">
          <div className="flex flex-col items-center gap-1">
            <span>スクロールして詳細を見る</span>
            <span className="text-xl">↓</span>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="px-4 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-yellow-300 font-bold text-sm uppercase tracking-widest mb-2">About</p>
          <h2 className="text-3xl sm:text-4xl font-black">この夏祭り、なんなの？</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <div className="text-4xl mb-3">🏡</div>
            <h3 className="font-black text-white text-base mb-2">自治会、6年目の挑戦</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              エイテスタウン自治会が発足して6年。回覧板や清掃活動など足回りも整ってきたので、いよいよ&ldquo;お祭り&rdquo;に踏み出すことにしました。
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <div className="text-4xl mb-3">👦</div>
            <h3 className="font-black text-white text-base mb-2">子どもと、ご近所と</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              地域の子どもたちに楽しい夏の思い出を。そして大人同士も「あの人、○○さんね」と顔を知り合えるきっかけになれれば。それだけで十分です。
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <div className="text-4xl mb-3">🪙</div>
            <h3 className="font-black text-white text-base mb-2">予算ゼロ円からの手作り</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              当自治会は会費を徴収していません（管理組合費は別会計）。運営資金は自治体からの補助金のみ。だから全部手作り。逆にそれがおもしろいと思っています。
            </p>
          </div>
        </div>

        <div className="relative rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 px-7 py-6 text-center">
          <p className="text-white/80 text-base leading-relaxed">
            「もっとこうしたら？」「手伝えるよ！」という声、大歓迎です。<br className="hidden sm:block" />
            完璧じゃなくていい。<span className="text-yellow-300 font-bold">みんなで作る</span>から楽しい、それがコンセプトです。
          </p>
        </div>
      </section>

      {/* ===== EVENTS ===== */}
      <section className="relative px-4 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-yellow-300 font-bold text-sm uppercase tracking-widest mb-2">出し物</p>
          <h2 className="text-3xl sm:text-4xl font-black">
            お楽しみ<span className="text-yellow-300">５つ</span>の出し物！
          </h2>
        </div>

        <div className="grid sm:grid-cols-4 lg:grid-cols-6 gap-6 sm:[&>*]:col-span-2 sm:[&>*:nth-child(5)]:col-start-2 lg:[&>*:nth-child(4)]:col-start-2 lg:[&>*:nth-child(5)]:col-start-auto">
          {events.map((ev, i) => (
            <div
              key={i}
              className={`relative rounded-3xl overflow-hidden shadow-2xl group transition-transform hover:-translate-y-1 duration-300 bg-white/5 backdrop-blur border border-white/10`}
            >
              {/* Gradient accent bar */}
              <div className={`h-2 w-full bg-gradient-to-r ${ev.color}`} />

              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`text-5xl leading-none flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300`}>
                    {ev.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-xl font-black text-white">{ev.title}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ev.badgeColor}`}>
                        {ev.badge}
                      </span>
                    </div>
                    <p className="text-yellow-300 text-sm font-bold mb-2">{ev.subtitle}</p>
                    <p className="text-white/70 text-sm leading-relaxed">{ev.description}</p>
                  </div>
                </div>

                {/* {ev.link && (
                  <Link
                    href="/"
                    className={`mt-5 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white bg-gradient-to-r ${ev.color} hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg text-sm`}
                  >
                    🎱 ビンゴに参加する！
                    <span className="text-xs font-normal opacity-80">→ 登録はこちら</span>
                  </Link>
                )} */}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW TO JOIN ===== */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-yellow-300 font-bold text-sm uppercase tracking-widest mb-2">How to join</p>
          <h2 className="text-3xl sm:text-4xl font-black">参加の流れ</h2>
        </div>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-white/15 hidden sm:block" />

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-5 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-yellow-400 text-yellow-900 font-black text-lg flex items-center justify-center shadow-lg shadow-yellow-400/30 z-10">
                1
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
                <p className="font-black text-white text-lg mb-1">当日、集会所へ来てね 🏠</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  会場はいつもの<span className="text-white font-bold">集会所</span>です。<strong className="text-yellow-300">16:00〜19:00頃</strong>スタッフが待機しています。
                  事前申し込みや会費は一切不要。好きなタイミングで、手ぶらでふらっと来てください！
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-5 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-purple-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-purple-500/30 z-10">
                2
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
                <p className="font-black text-white text-lg mb-1">ビンゴは当日中に事前登録を 🎱</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  オンラインビンゴは<strong className="text-yellow-300">16:00スタート</strong>。このページ下部のボタンか上の出し物カードから参加登録できます。
                  ビンゴになったら、スマホの画面を持って集会所のスタッフに見せてください！
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-5 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-pink-500 text-white font-black text-lg flex items-center justify-center z-10 border border-white/30">
                ♡
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
                <p className="font-black text-white text-lg mb-1">ハードルは低めでお願いします 🙏</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  運営スタッフも初めての催しで、みんなで手探りしながらやっています。
                  完璧さよりも<span className="text-white font-bold">手作り感と笑顔</span>を大切に。
                  温かい目で、一緒に楽しんでいただけると嬉しいです！
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BBQ SECTION ===== */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-orange-500/30 bg-gradient-to-br from-orange-900/40 to-red-900/30 backdrop-blur">
          {/* Flame decoration */}
          <div className="absolute top-4 right-6 text-5xl opacity-30 pointer-events-none select-none">🔥</div>
          <div className="absolute bottom-4 left-6 text-4xl opacity-20 pointer-events-none select-none">🍖</div>

          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🍖</span>
              <div>
                <span className="text-xs font-bold text-orange-300 uppercase tracking-widest block mb-1">Special Day</span>
                <h2 className="text-2xl sm:text-3xl font-black text-orange-200">BBQ お楽しみ DAY</h2>
              </div>
            </div>

            <p className="text-orange-100/90 text-base leading-relaxed mb-6">
              「BBQやりたいけどご近所へ声をかけるタイミングが難しい…」そんな声にお応えし、<strong className="text-orange-300">当日は自治会としてBBQ推奨日</strong>とします！
              庭先でのご近所同士の交流もぜひお楽しみください 🌿
            </p>

            <div className="bg-black/20 rounded-2xl p-4 border border-orange-500/20">
              <p className="text-orange-200/70 text-s leading-relaxed font-medium">
                ※ 自宅でのBBQは法律・条例で禁止されているものではありませんが、住宅密集地域での煙・臭い・音によるトラブルが全国的に増えております。住民の皆様一人ひとりの思いやりの心で、楽しい季節を気持ちよく過ごしましょう。<br />
                ※ 当日以外のBBQを規制するものではありません。当日以外でBBQを実施される際は、事前の声掛け・時間帯への配慮・煙や音の対策など、より一層のマナーへのご配慮をお願いいたします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BINGO CTA ===== */}
      <section className="px-4 py-16 text-center">
        <div className="max-w-lg mx-auto">
          <p className="text-purple-300 font-bold text-sm uppercase tracking-widest mb-3">Online Bingo</p>
          <h2 className="text-2xl sm:text-3xl font-black mb-2">ビンゴ大会に参加しよう！</h2>
          <p className="text-white/60 text-sm mb-8">先着20名に商品券などちょっとした景品をプレゼント。<br></br>
          大人も子どもも楽しもう〜！🎁</p>
          <BingoLink className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-black text-lg bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 shadow-[0_0_40px_rgba(130,80,255,0.5)] hover:shadow-[0_0_60px_rgba(130,80,255,0.7)] hover:scale-105 active:scale-95 transition-all duration-200">
            🎱 ビンゴに参加する！
          </BingoLink>
          <p className="text-white/40 text-xs mt-4">参加には番地の入力が必要です</p>
        </div>
      </section>

      {/* ===== NOTICES ===== */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-white/40 font-bold text-sm uppercase tracking-widest mb-2">Notices</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white/80">ご参加にあたってのお願い</h2>
        </div>

        <div className="space-y-5">

          {/* 保護者向け */}
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border-b border-white/10">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
              <h3 className="font-black text-white">保護者の皆様へ</h3>
            </div>
            <ul className="px-6 py-5 space-y-3 text-white/65 text-sm leading-relaxed">
              <li className="flex gap-2">
                <span className="flex-shrink-0 text-yellow-400 font-bold">・</span>
                集会所の周辺は車の往来があります。お子様が急に飛び出さないよう、特にお帰りの際は保護者の方が目を離さないようお願いいたします。
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 text-yellow-400 font-bold">・</span>
                マシュマロ焼きコーナーでは炭火を使用します。小さなお子様が一人で火に近づかないよう、必ず保護者の方が付き添ってください。また、串を持ったまま走り回らないようお声がけをお願いします。
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 text-yellow-400 font-bold">・</span>
                会場で出たゴミは、集会所のゴミ袋をご利用いただくか、各自お持ち帰りください。近隣へのポイ捨ては絶対にご遠慮ください。
              </li>
            </ul>
          </div>

          {/* 近隣向け */}
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border-b border-white/10">
              <span className="text-2xl">🏘️</span>
              <h3 className="font-black text-white">近隣のみなさまへ</h3>
            </div>
            <ul className="px-6 py-5 space-y-3 text-white/65 text-sm leading-relaxed">
              <li className="flex gap-2">
                <span className="flex-shrink-0 text-yellow-400 font-bold">・</span>
                当日は集会所周辺が例年より賑やかになります。地域の交流イベントのため、何卒ご理解とご協力をお願い申し上げます。
              </li>
            </ul>
          </div>

          {/* 雨天 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border-b border-white/10">
              <span className="text-2xl">🌂</span>
              <h3 className="font-black text-white">雨天について</h3>
            </div>
            <ul className="px-6 py-5 space-y-3 text-white/65 text-sm leading-relaxed">
              <li className="flex gap-2">
                <span className="flex-shrink-0 text-yellow-400 font-bold">・</span>
                <span>集会所でのイベントのため小雨程度であれば開催します。中止の場合は本ページおよび<a href="https://eightes-town.pmiweb.jp/resident/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">居住者サイト</a>でお知らせします。</span>
              </li>
            </ul>
          </div>

          {/* 写真撮影 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border-b border-white/10">
              <span className="text-2xl">📷</span>
              <h3 className="font-black text-white">写真・動画の撮影について</h3>
            </div>
            <ul className="px-6 py-5 space-y-3 text-white/65 text-sm leading-relaxed">
              <li className="flex gap-2">
                <span className="flex-shrink-0 text-yellow-400 font-bold">・</span>
                思い出の撮影は大歓迎です！ただし、他の参加者が映り込む写真・動画をSNSに投稿する場合は、必ず事前にご本人の同意を得てください。
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 text-yellow-400 font-bold">・</span>
                運営スタッフが記録写真を撮影し、後日入居者専用サイトに掲載することがあります。撮影をご希望でない方はスタッフにお申し付けください。
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="text-center py-10 border-t border-white/10">
        <p className="text-white/40 text-xs">© 2026 Eightes Town 自治会</p>
      </footer>
    </div>
  );
}
