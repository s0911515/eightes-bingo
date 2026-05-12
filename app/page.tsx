"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const AREA_NUMBER_MAP = Object.fromEntries(
  Array.from({ length: 255 }, (_, index) => [String(index + 1), `N${index + 1}`])
);

const getAreaNumber = (address: string) => {
  const trimmed = address.trim();
  if (!trimmed) return null;
  if (!/^[0-9]+$/.test(trimmed)) return null;
  return AREA_NUMBER_MAP[trimmed] ?? null;
};

// ビンゴカード（5x5の2次元配列）を生成する関数
const generateBingoCard = () => {
  const card = [];
  const ranges = [
    { min: 1, max: 15 },
    { min: 16, max: 30 },
    { min: 31, max: 45 },
    { min: 46, max: 60 },
    { min: 61, max: 75 },
  ];

  for (let i = 0; i < 5; i++) {
    const { min, max } = ranges[i];
    const numbers = Array.from({ length: max - min + 1 }, (_, k) => k + min);
    
    for (let j = 0; j < 5; j++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      card.push(numbers.splice(randomIndex, 1)[0]);
    }
  }

  // フラットな配列（長さ25）の真ん中（インデックス12）をFREEにする
  card[12] = 0; 
  return card;
};

export default function LoginPage() {
  const [nickname, setNickname] = useState("");
  const [address, setAddress] = useState("");
  const [areaNumber, setAreaNumber] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "participants", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          router.push("/game");
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const mappedAreaNumber = getAreaNumber(address);
    if (!mappedAreaNumber) {
      setAddressError("対応する区画番号がありません。1〜255の番号を入力してください。");
      return;
    }

    setIsLoading(true);
    try {
      const gameSnap = await getDoc(doc(db, "gameStatus", "current"));
      if (gameSnap.exists() && gameSnap.data().isEnded) {
        alert("ゲームは終了しています。新規参加はできません。");
        return;
      }
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      const userRef = doc(db, "participants", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newCard = generateBingoCard();
        await setDoc(userRef, {
          nickname: nickname,
          address: address,
          areaNumber: mappedAreaNumber,
          createdAt: serverTimestamp(),
          isBingo: false,
          card: newCard,
          checkedNumbers: [0],
        });
      }
      router.push("/game");
    } catch (error) {
      console.error("ログインエラー:", error);
      alert("エラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 overflow-hidden">
      
      {/* 背景の装飾図形 */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl animate-pulse delay-700" />
      
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20">
        <header className="text-center mb-8">
          <div className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-widest shadow-sm">
            2026 Special Event
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 leading-tight">
            エイテスタウン自治会<br></br><span className="sm:block">夏祭りビンゴ大会</span>
          </h1>
          <p className="text-gray-500 mt-3 text-sm font-medium">お気軽にご参加ください！</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* ニックネーム入力 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 ml-1">ニックネーム</label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例：たろう"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-800 font-medium placeholder-gray-300"
            />
          </div>

          {/* 番地・区画番号入力 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 ml-1">番地</label>
            <div className="grid grid-cols-[1fr_100px] gap-3">
              <input
                type="text"
                required
                value={address}
                onChange={(e) => {
                  const value = e.target.value;
                  setAddress(value);
                  const mapped = getAreaNumber(value);
                  setAreaNumber(mapped);
                  setAddressError(value.trim() && !mapped ? "1〜255を入力" : null);
                }}
                placeholder="例：233"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-800 font-medium placeholder-gray-300"
              />
              <div className="flex flex-col items-center justify-center bg-blue-50 border-2 border-blue-100 rounded-2xl p-1 shadow-inner">
                <span className="text-[10px] font-bold text-blue-400 leading-none mb-1">区画</span>
                <span className="text-lg font-black text-blue-700 leading-none">
                  {areaNumber || "--"}
                </span>
              </div>
            </div>
            {addressError && (
              <p className="mt-1 text-[11px] text-red-500 font-bold ml-1">{addressError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-gray-400"
          >
            {isLoading ? "準備中..." : "ビンゴに参加する！"}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
            &copy; 2026 エイテスタウン自治会
          </p>
        </footer>
      </div>
    </main>
  );
}