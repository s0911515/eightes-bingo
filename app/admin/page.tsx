"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";
import {
  doc,
  onSnapshot,
  updateDoc,
  writeBatch,
  getDocs,
  arrayUnion,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export default function AdminPage() {
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [winners, setWinners] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [claimedCount, setClaimedCount] = useState(0);
  const [lastDrawnAt, setLastDrawnAt] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    signInAnonymously(auth).catch(() => {});

    // 1. ゲーム状況・統計・参加者リストの統合監視 (1リード / 更新)
    const unsubscribeGame = onSnapshot(doc(db, "gameStatus", "current"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDrawnNumbers(data.drawnNumbers || []);
        setIsStarted(data.isStarted || false);
        setIsEnded(data.isEnded || false);
        
        // 統計情報の更新
        setTotalParticipants(data.totalParticipants || 0);
        setClaimedCount(data.receivedCount || 0);
        const lda = data.lastDrawnAt;
        setLastDrawnAt(lda instanceof Timestamp ? lda.toDate() : null);

        // ビンゴ当選者リストを配列から抽出してソート
        const list = data.participantList || [];
        const bingoWinners = list
          .filter((p: any) => p.isBingo)
          .sort((a: any, b: any) => (a.updatedAt?.toMillis() || 0) - (b.updatedAt?.toMillis() || 0));
        setWinners(bingoWinners);
      }
    });

    // 2. チャットメッセージの監視
    const qChat = query(collection(db, "chatMessages"), orderBy("createdAt", "asc"), limit(50));
    const unsubscribeChat = onSnapshot(qChat, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeGame();
      unsubscribeChat();
    };
  }, []);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSidebarOpen]);

  useEffect(() => {
    const update = () => {
      if (!lastDrawnAt) { setElapsed(""); return; }
      const sec = Math.floor((Date.now() - lastDrawnAt.getTime()) / 1000);
      if (sec < 60) setElapsed(`${sec}秒前`);
      else setElapsed(`${Math.floor(sec / 60)}分${sec % 60}秒前`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lastDrawnAt]);

  // --- ゲームおよび統計のリセット処理 ---
  const handleGameReset = async () => {
    if (!confirm("【警告】参加者全員のデータ（カード・統計・名簿）とチャット履歴を完全に破棄しますか？")) return;
    try {
      const batch = writeBatch(db);
      
      // 1. ゲームステータスと統計・リストの初期化
      const gameStatusRef = doc(db, "gameStatus", "current");
      batch.update(gameStatusRef, {
        drawnNumbers: [],
        isStarted: false,
        isEnded: false,
        participantList: [],      // 名簿配列を空に
        totalParticipants: 0,     // 統計をリセット
        bingoCount: 0,            // 統計をリセット
        receivedCount: 0,         // 統計をリセット
        updatedAt: serverTimestamp(),
      });

      // 2. 参加者個別ドキュメントの全削除
      // ※ここは安全のため、一旦全てのドキュメントを参照して削除
      const participantsSnap = await getDocs(collection(db, "participants"));
      participantsSnap.forEach((userDoc) => batch.delete(userDoc.ref));

      // 3. チャット履歴の全削除
      const chatSnap = await getDocs(collection(db, "chatMessages"));
      chatSnap.forEach((msgDoc) => batch.delete(msgDoc.ref));

      await batch.commit();
      alert("全データのリセットが完了しました");
    } catch (error) {
      console.error("リセットエラー:", error);
      alert("リセットに失敗しました。");
    }
  };

  const handleGameStart = async () => {
    await updateDoc(doc(db, "gameStatus", "current"), {
      isStarted: true,
      isEnded: false,
      updatedAt: serverTimestamp(),
    });
  };

  const handleGameEnd = async () => {
    if (!confirm("ゲームを終了しますか？ 終了後は新たに番号を引くことができません。")) return;
    await updateDoc(doc(db, "gameStatus", "current"), {
      isStarted: false,
      isEnded: true,
      updatedAt: serverTimestamp(),
    });
  };

  const handleDrawNumber = async () => {
    if (isEnded) return alert("ゲームは終了しています。新しい番号は引けません。");
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const availableNumbers = allNumbers.filter(n => !drawnNumbers.includes(n));
    if (availableNumbers.length === 0) return alert("終了です！");

    const nextNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    await updateDoc(doc(db, "gameStatus", "current"), {
      drawnNumbers: arrayUnion(nextNumber),
      lastDrawnAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const sendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await addDoc(collection(db, "chatMessages"), {
      text: inputText,
      senderName: "運営事務局",
      senderId: "admin_master",
      isAdmin: true,
      createdAt: serverTimestamp(),
    });
    setInputText("");
  };

  return (
    <main className="relative min-h-screen flex bg-gradient-to-br from-slate-800 via-slate-900 to-black text-gray-100 font-sans overflow-hidden">
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-emerald-900/20 rounded-full blur-3xl" />
      </div>

      <div className={`flex-1 flex flex-col items-center p-4 sm:p-8 z-10 transition-all duration-300 lg:mr-96 overflow-y-auto`}>
        
        <div className="w-full max-w-2xl flex justify-between items-end mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter border-b-4 border-emerald-500 pb-2">
            BINGO ADMIN
          </h1>
          <a 
            href="/admin/participants" 
            className="text-xs bg-white/10 hover:bg-white/20 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/30 transition-all mb-1"
          >
            参加者名簿を表示 ⮕
          </a>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <button 
            onClick={handleGameStart} 
            disabled={isStarted || isEnded}
            className={`px-6 py-2 rounded-xl font-bold shadow-lg text-white transition-all border
              ${isStarted || isEnded ? "bg-gray-700 border-gray-600 cursor-not-allowed" : "bg-blue-600 border-blue-400 hover:bg-blue-700"}`}
          >
            {isEnded ? "ゲーム終了中" : isStarted ? "ゲーム開始済み" : "ゲーム開始"}
          </button>
          <button onClick={handleGameReset} className="bg-red-600/80 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all border border-red-500/50 backdrop-blur-sm">
            ゲームリセット
          </button>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleDrawNumber}
              disabled={!isStarted || isEnded}
              className={`px-10 py-2 rounded-xl font-black shadow-lg text-white transition-all text-xl border
                ${isStarted && !isEnded ? "bg-emerald-600 border-emerald-400 hover:scale-105 animate-pulse" : "bg-gray-700 border-gray-600 cursor-not-allowed"}`}
            >
              番号を引く！
            </button>
            {elapsed && (
              <span className="text-xs text-gray-400">前回: {elapsed}</span>
            )}
          </div>
          <button
            onClick={handleGameEnd}
            disabled={!isStarted || isEnded}
            className={`px-6 py-2 rounded-xl font-bold shadow-lg text-white transition-all border
              ${isStarted && !isEnded ? "bg-orange-500 border-orange-400 hover:bg-orange-600" : "bg-gray-700 border-gray-600 cursor-not-allowed"}`}
          >
            ゲーム終了
          </button>
        </div>

        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center border border-white/10">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-[0.3em] mb-2">Selected Number</div>
          <div className="text-[10rem] sm:text-[12rem] leading-none font-black text-white my-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            {drawnNumbers.length > 0 ? drawnNumbers[drawnNumbers.length - 1] : "--"}
          </div>

          <div className="border-t border-white/10 pt-6">
            <h2 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-widest">History ({drawnNumbers.length}/75)</h2>
            <div className="grid grid-cols-10 gap-1.5">
              {Array.from({ length: 75 }, (_, i) => i + 1).map(n => (
                <div key={n} className={`text-[10px] py-2 rounded-lg font-black border transition-all
                  ${drawnNumbers.includes(n) ? "bg-emerald-500 text-white border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-black/20 text-gray-600 border-white/5"}`}>
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`fixed top-0 right-0 h-full w-full lg:w-96 bg-white shadow-2xl z-40 transition-transform duration-300 ease-in-out transform 
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0 flex flex-col text-gray-900`}>
        
        <div className="h-1/3 flex flex-col border-b border-gray-200">
          <div className="relative p-4 bg-red-600 text-white font-black flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-lg">🏆 ビンゴ当選者</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mr-8 lg:mr-0">
                {winners.length} / {totalParticipants} 名
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-black/20 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-yellow-400 h-full transition-all duration-500" 
                  style={{ width: `${winners.length > 0 ? (claimedCount / winners.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] whitespace-nowrap text-red-100">
                受取済: {claimedCount}名
              </span>
            </div>
            
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="lg:hidden absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-full transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
            {winners.map((w, i) => (
              <div key={w.uid || i} className={`bg-white p-3 rounded-xl border flex items-center gap-3 shadow-sm transition-all ${w.prizeClaimed ? "opacity-50 border-gray-100" : "border-gray-100"}`}>
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${w.prizeClaimed ? "bg-gray-200 text-gray-500" : "bg-amber-400 text-amber-900"}`}>
                  {i+1}
                </span>
                <div className="flex-1 text-sm">
                  <div className="font-bold">
                    {w.nickname} 
                    {w.prizeClaimed && <span className="ml-2 text-[9px] text-blue-600 font-normal">受取済</span>}
                    <span className="ml-1 text-[10px] font-normal text-gray-400">({w.areaNumber}区画)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-2/3 flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-800 text-white font-bold flex justify-between">
            <span>💬 会場チャット</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
            {messages.map((m) => {
              const isMe = m.isAdmin;
              const time = m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] text-gray-400 mb-1">{isMe ? "📢 管理者" : m.senderName}</span>
                  <div className={`flex items-end gap-1.5 max-w-[90%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${isMe ? "bg-slate-800 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-200"}`}>
                      {m.text}
                    </div>
                    <span className="text-[8px] text-gray-400 mb-1 shrink-0">{time}</span>
                  </div>
                </div>
              );
            })}
            <div ref={scrollEndRef} />
          </div>

          <form onSubmit={sendAdminMessage} className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="管理メッセージ..." className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800" />
              <button className="bg-slate-800 text-white px-5 py-2 rounded-full text-sm font-bold">送信</button>
            </div>
          </form>
        </div>
      </div>

      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-2xl z-30 flex items-center justify-center text-2xl border-2 border-white"
        >
          🏆
        </button>
      )}

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-35 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </main>
  );
}