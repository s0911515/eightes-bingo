"use client";

import { useEffect, useState, useRef, useReducer } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, query, orderBy, limit, onSnapshot, 
  addDoc, serverTimestamp, updateDoc, doc, deleteDoc, 
  getDoc, Timestamp 
} from "firebase/firestore";
import { useRouter } from "next/navigation";

type TimestampValue = Timestamp | Date | null;

type Participant = {
  uid: string;
  nickname: string;
  areaNumber: string;
  isBingo: boolean;
  prizeClaimed: boolean;
  updatedAt: TimestampValue;
};

type UserData = {
  nickname: string;
  address?: string;
  areaNumber: string;
  isBingo?: boolean;
  prizeClaimed?: boolean;
  card: number[];
  createdAt?: TimestampValue;
  checkedNumbers?: number[];
};

type ChatMessage = {
  id: string;
  text: string;
  senderName: string;
  senderId?: string;
  isAdmin: boolean;
  createdAt?: TimestampValue;
};

export default function GamePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [stats, setStats] = useState({ total: 0, bingo: 0, received: 0 });
  const [isStarted, setIsStarted] = useState(false);
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const isResettingRef = useRef(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showNumberOverlay, setShowNumberOverlay] = useState(false);
  const [lastDrawnNumber, setLastDrawnNumber] = useState<number | null>(null);
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const [showGameStartOverlay, setShowGameStartOverlay] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ローディング状態を追加

  const isChatEnabled = false;

  const previousIsStartedRef = useRef(false);
  const showStartOverlayRef = useRef(showStartOverlay);

  useEffect(() => {
    showStartOverlayRef.current = showStartOverlay;
  }, [showStartOverlay]);

  useEffect(() => {
    if (!previousIsStartedRef.current && isStarted && !showStartOverlayRef.current) {
      setShowGameStartOverlay(true);
      const timer = setTimeout(() => setShowGameStartOverlay(false), 3200);
      return () => clearTimeout(timer);
    }
    previousIsStartedRef.current = isStarted;
  }, [isStarted]);

  const dedupeParticipantList = (list: Participant[]) => {
    return list.reduce((acc: Participant[], participant: Participant) => {
      if (!acc.some((item) => item.uid === participant.uid)) {
        acc.push(participant);
      }
      return acc;
    }, []);
  };

  const calculateGameStats = (list: Participant[]) => ({
    totalParticipants: list.length,
    bingoCount: list.filter((p) => p.isBingo).length,
    receivedCount: list.filter((p) => p.prizeClaimed).length,
  });

  // --- カードのリセット（初期化）処理 ---
  const handleReset = async () => {
    if (!confirm("カードを捨てて、最初からやり直しますか？")) return;
    isResettingRef.current = true;
    try {
      const user = auth.currentUser;
      if (!user) return;

      const gameRef = doc(db, "gameStatus", "current");
      const gameSnap = await getDoc(gameRef);

      if (gameSnap.exists()) {
        const list = (gameSnap.data().participantList || []) as Participant[];
        const newList = list.filter((p) => p.uid !== user.uid);
        const stats = calculateGameStats(newList);

        await updateDoc(gameRef, {
          participantList: newList,
          totalParticipants: stats.totalParticipants,
          bingoCount: stats.bingoCount,
          receivedCount: stats.receivedCount,
        });
      }

      await deleteDoc(doc(db, "participants", user.uid));
      await auth.signOut(); 
      router.push("/");
    } catch (error) {
      console.error("リセットエラー:", error);
    } finally {
      isResettingRef.current = false;
    }
  };

  // --- ビンゴ判定・演出の状態管理 ---
  interface State { showOverlay: boolean; hasNotifiedBingo: boolean; }
  interface Action { type: 'BINGO' | 'CLOSE_OVERLAY'; }
  const initialState: State = { showOverlay: false, hasNotifiedBingo: false };
  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case 'BINGO': return { showOverlay: true, hasNotifiedBingo: true };
      case 'CLOSE_OVERLAY': return { ...state, showOverlay: false };
      default: return state;
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState);

  const isHit = (index: number) => {
    if (!userData?.card) return false;
    const num = userData.card[index];
    return num === 0 || drawnNumbers.includes(num);
  };

  const lines = [
    [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
    [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
    [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
  ];

  const currentIsBingo = lines.some(line => line.every(index => isHit(index)));

  const latestAnnouncement = messages.length > 0 ? messages[messages.length - 1] : null;
  const [announcePulse, setAnnouncePulse] = useState(false);
  const latestAnnouncementIdRef = useRef<string | null>(null);

  const formatChatTime = (value?: TimestampValue) => {
    if (!value) return "";
    if (value instanceof Timestamp) return value.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (value instanceof Date) return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return "";
  };

  useEffect(() => {
    const latestId = latestAnnouncement?.id ?? null;
    if (latestAnnouncementIdRef.current && latestId && latestId !== latestAnnouncementIdRef.current) {
      setAnnouncePulse(true);
      const timer = setTimeout(() => setAnnouncePulse(false), 900);
      return () => clearTimeout(timer);
    }
    latestAnnouncementIdRef.current = latestId;
  }, [latestAnnouncement?.id]);

  const truncateText = (text: string, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
  };

  // --- ビンゴ達成時のデータ更新ロジック ---
  useEffect(() => {
    const updateBingoStatus = async () => {
      if (currentIsBingo && !state.hasNotifiedBingo) {
        dispatch({ type: 'BINGO' });
        const user = auth.currentUser;
        if (!user) return;

        // 1. 個別ドキュメントの更新
        await updateDoc(doc(db, "participants", user.uid), { 
          isBingo: true,
          updatedAt: serverTimestamp()
        });

        // 2. 集約ドキュメント（gameStatus）の配列内ステータスを更新
        const gameRef = doc(db, "gameStatus", "current");
        const gameSnap = await getDoc(gameRef);
        if (gameSnap.exists()) {
          const list = gameSnap.data().participantList || [];
          const newList = list.map((p: Participant) => 
            p.uid === user.uid ? { ...p, isBingo: true, updatedAt: new Date() } : p
          );
          const stats = calculateGameStats(newList);
          await updateDoc(gameRef, {
            participantList: newList,
            bingoCount: stats.bingoCount
          });
        }
      }
    };
    updateBingoStatus();
  }, [currentIsBingo, state.hasNotifiedBingo]);

  // --- チャットメッセージの監視 ---
  useEffect(() => {
    const q = query(collection(db, "chatMessages"), orderBy("createdAt", "asc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...(docSnapshot.data() as Omit<ChatMessage, 'id'>) } as ChatMessage)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isChatOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) {
      scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !userData) return;
    await addDoc(collection(db, "chatMessages"), {
      text: inputText,
      senderName: userData.nickname,
      senderId: auth.currentUser?.uid,
      isAdmin: false,
      createdAt: serverTimestamp(),
    });
    setInputText("");
  };

  // --- 認証状態の監視 ---
  useEffect(() => {
    console.log("Setting up auth listener");
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "logged in" : "not logged in");
      setIsLoading(false); // 認証状態が確定したらローディングを終了
      if (!user) {
        console.log("No user, redirecting to /");
        router.push("/");
        return;
      }
      console.log("User exists:", user.uid);

      // ユーザーデータの監視を開始
      const userRef = doc(db, "participants", user.uid);
      console.log("Setting up user data listener for:", user.uid);
      const unsubscribeUser = onSnapshot(userRef, async (docSnap) => {
        console.log("User data snapshot received, exists:", docSnap.exists());
        if (isResettingRef.current) return;
        if (!docSnap.exists()) {
          console.log("User data does not exist, signing out");
          auth.signOut(); 
          router.push("/");
          return;
        }
        const data = docSnap.data() as UserData;
        console.log("Setting userData:", data);
        setUserData(data);

        const gameRef = doc(db, "gameStatus", "current");
        const gameSnap = await getDoc(gameRef);
        if (gameSnap.exists()) {
          const list = (gameSnap.data().participantList || []) as Participant[];
          const dedupedList = dedupeParticipantList(list);
          const currentParticipant: Participant = {
            uid: user.uid,
            nickname: data.nickname,
            areaNumber: data.areaNumber,
            isBingo: data.isBingo || false,
            prizeClaimed: data.prizeClaimed || false,
            updatedAt: new Date()
          };

          const existingParticipant = dedupedList.find((p) => p.uid === user.uid);
          let normalizedList = dedupedList;
          let shouldUpdate = false;

          if (!existingParticipant) {
            normalizedList = [...dedupedList, currentParticipant];
            shouldUpdate = true;
          } else {
            const shouldSync = existingParticipant.nickname !== currentParticipant.nickname
              || existingParticipant.areaNumber !== currentParticipant.areaNumber
              || existingParticipant.isBingo !== currentParticipant.isBingo
              || existingParticipant.prizeClaimed !== currentParticipant.prizeClaimed;

            if (shouldSync) {
              normalizedList = dedupedList.map((p: Participant) =>
                p.uid === user.uid ? currentParticipant : p
              );
              shouldUpdate = true;
            }

            if (dedupedList.length !== list.length) {
              shouldUpdate = true;
            }
          }

          if (shouldUpdate) {
            const stats = calculateGameStats(normalizedList);
            await updateDoc(gameRef, {
              participantList: normalizedList,
              totalParticipants: stats.totalParticipants,
              bingoCount: stats.bingoCount,
              receivedCount: stats.receivedCount,
            });
          }
        }
      });

      // クリーンアップ関数を返す
      return () => {
        console.log("Cleaning up user data listener");
        unsubscribeUser();
      };
    });
    return () => unsubscribeAuth();
  }, [router]);

  // --- ゲームデータの監視（受取人数更新を含む） ---
  useEffect(() => {
    const gameRef = doc(db, "gameStatus", "current");
    const unsubscribeGame = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newDrawnNumbers = data.drawnNumbers || [];
        setIsStarted(data.isStarted || false);
        setIsEnded(data.isEnded || false);
        setDrawnNumbers((prev) => {
          if (newDrawnNumbers.length > prev.length) {
            const nextNum = newDrawnNumbers[newDrawnNumbers.length - 1];
            setLastDrawnNumber(nextNum);
            setShowNumberOverlay(true);
            setTimeout(() => setShowNumberOverlay(false), 3000);
          }
          return newDrawnNumbers;
        });

        setStats({
          total: data.totalParticipants || 0,
          bingo: data.bingoCount || 0,
          received: data.receivedCount || 0
        });
      }
    });

    return () => unsubscribeGame();
  }, []);

  if (isLoading || !userData) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-bold">読み込み中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 text-gray-900 font-sans overflow-hidden">
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[20%] w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl" />
      </div>

      <div className={`flex-1 flex flex-col items-center p-4 sm:p-8 z-10 transition-all duration-300 lg:mr-96`}>
        <header className={`w-full max-w-xl mb-6 text-center bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border-2 transition-all duration-500 ${currentIsBingo ? "border-yellow-400 scale-105 shadow-yellow-400/20" : "border-white/20"}`}>
          {currentIsBingo && (
            <div className="mb-2 inline-block bg-red-600 text-white px-4 py-1 rounded-full text-xs font-black animate-bounce shadow-lg">
              🎊 BINGO達成済み 🎊
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-black text-blue-800 leading-tight mb-4">
            エイテスタウン自治会<br></br>夏祭りビンゴ大会
          </h1>
          <div className="mb-4 rounded-3xl border border-blue-200 bg-blue-50/80 p-4 text-left text-sm text-blue-900 shadow-sm">
            <button
              type="button"
              onClick={() => setShowRules((prev) => !prev)}
              className="flex w-full items-center justify-between font-bold text-blue-800"
            >
              <span>ゲームのルール</span>
              <span className="text-xl">{showRules ? "−" : "+"}</span>
            </button>
            {showRules && (
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>・運営スタッフが番号を引くとパネルが自動で開きます。</li>
                <li>・BINGOした方は集会所にいる運営スタッフへお声がけください。景品には限りがありますのでご了承ください。</li>
                <li>・運営からのお知らせはチャットをご確認ください。</li>
              </ul>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 border-t border-blue-100 pt-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-blue-400 uppercase">区画</p>
              <p className="text-xl font-black text-blue-700 leading-none">{userData?.areaNumber || "--"}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase">参加者</p>
              <p className="text-xl font-bold text-gray-800 leading-none">{userData?.nickname}</p>
            </div>
          </div>
          {isEnded ? (
            <div className="mt-4 inline-block bg-slate-200 text-slate-800 px-4 py-3 rounded-3xl text-sm font-bold border border-slate-300">
              ゲームは終了しました。ご参加ありがとうございました。
            </div>
          ) : isStarted ? (
            <div className="mt-4 inline-block bg-emerald-200 text-emerald-800 px-4 py-3 rounded-3xl text-sm font-bold border border-emerald-300">
              ゲームは開始されています。<br />番号が更新され次第、カードに反映されます。
            </div>
          ) : (
            <div className="mt-4 inline-block bg-yellow-200 text-yellow-800 px-4 py-3 rounded-3xl text-sm font-bold border border-yellow-300">
              ゲームはまだ開始されていません。<br />運営の「ゲーム開始」をお待ちください。
            </div>
          )}
        </header>

        <div className="w-full max-w-xl mx-auto mb-6 p-5 rounded-[2rem] bg-white/95 border border-slate-200 shadow-xl shadow-slate-500/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className={`flex-1 rounded-3xl border border-amber-200 bg-amber-100/90 p-4 shadow-sm transition-all duration-700 ${announcePulse ? "animate-[pulse_0.9s_ease-out] ring-2 ring-amber-300/70" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">最新お知らせ</p>
                  <p className="mt-2 text-sm font-bold text-amber-900">{latestAnnouncement?.senderName || "運営"}</p>
                </div>
                {latestAnnouncement && (
                  <span className="text-[11px] text-slate-500">{formatChatTime(latestAnnouncement.createdAt)}</span>
                )}
              </div>
              <div className="mt-3 text-sm leading-relaxed text-slate-700">
                {latestAnnouncement ? (
                  <p>{truncateText(latestAnnouncement.text, 50)}</p>
                ) : (
                  <p className="text-slate-500">現在お知らせはありません。</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`w-full max-w-[400px] aspect-square bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-2xl border-4 grid grid-cols-5 gap-2 sm:gap-3 mb-6 transition-all duration-500 ${currentIsBingo ? "border-yellow-400 ring-8 ring-yellow-400/10" : "border-white/20"}`}>
          {userData.card.map((num: number, i: number) => {
            const isDrawn = drawnNumbers.includes(num) || num === 0;
            return (
              <div key={i} className={`relative flex items-center justify-center text-xl sm:text-3xl font-black rounded-xl aspect-square shadow-md transition-colors duration-500
                ${num === 0 ? "bg-yellow-400 text-yellow-900 scale-105" : isDrawn ? "bg-red-600 text-white" : "bg-white text-gray-800 border border-gray-100"}`}>
                {num === 0 ? "FREE" : num}
              </div>
            );
          })}
        </div>

        <div className="w-full max-w-[400px] grid grid-cols-3 gap-2 mb-8">
          <div className="bg-white/40 backdrop-blur-sm p-3 rounded-2xl border border-white/30 text-center">
            <p className="text-[9px] font-bold text-white/70 uppercase tracking-tighter">参加人数</p>
            <p className="text-lg font-black text-white">{stats.total}<span className="text-[10px] ml-0.5">名</span></p>
          </div>
          <div className="bg-red-500/80 backdrop-blur-sm p-3 rounded-2xl border border-red-400/30 text-center shadow-lg shadow-red-900/20">
            <p className="text-[9px] font-bold text-red-100 uppercase tracking-tighter">ビンゴ！</p>
            <p className="text-lg font-black text-white">{stats.bingo}<span className="text-[10px] ml-0.5">名</span></p>
          </div>
          <div className="bg-yellow-400/80 backdrop-blur-sm p-3 rounded-2xl border border-yellow-300/30 text-center shadow-lg shadow-yellow-900/20">
            <p className="text-[9px] font-bold text-yellow-900 uppercase tracking-tighter">景品受取</p>
            <p className="text-lg font-black text-yellow-950">{stats.received}<span className="text-[10px] ml-0.5">名</span></p>
          </div>
        </div>

        <div className="w-full max-w-xl bg-white/70 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/20">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">これまでの当選番号</h2>
          <div className="flex flex-wrap gap-2">
            {drawnNumbers.slice().reverse().map((n, i) => (
              <span key={i} className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs ${i === 0 ? "bg-red-600 text-white animate-pulse" : "bg-white text-gray-500"}`}>
                {n}
              </span>
            ))}
          </div>
        </div>

        <button onClick={handleReset} className="mt-12 text-[10px] text-white/50 underline">情報を初期化してやり直す</button>
      </div>

      <div className={`fixed top-0 right-0 h-full w-full lg:w-96 bg-white shadow-2xl z-40 transition-transform duration-300 ease-in-out transform 
        ${isChatOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0`}>
        
        <div className="flex flex-col h-full">
          <div className="p-4 border-b bg-blue-600 text-white flex justify-between items-center">
            <span className="font-black">会場チャット</span>
            <button onClick={() => setIsChatOpen(false)} className="lg:hidden text-white hover:bg-blue-700 p-1 rounded">
              ✕ 閉じる
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m) => {
              const isMe = m.senderId === auth.currentUser?.uid;
              const isAdmin = m.isAdmin; 
              const time = m.createdAt
                ? (m.createdAt instanceof Timestamp
                    ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : m.createdAt instanceof Date
                      ? m.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '')
                : '';
              
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className={`text-[10px] mb-1 font-bold ${isAdmin ? "text-amber-600 flex items-center gap-1" : "text-gray-400"}`}>
                    {isAdmin && <span>📢</span>}
                    {isAdmin ? "運営事務局" : m.senderName}
                  </span>

                  <div className="flex items-end gap-2 max-w-[90%]">
                    {isMe && <span className="text-[9px] text-gray-400 mb-1 whitespace-nowrap">{time}</span>}
                    <div className={`p-3 rounded-2xl text-sm shadow-sm transition-all
                      ${isAdmin 
                        ? "bg-amber-200/95 text-amber-950 border border-amber-300 rounded-tl-none font-bold shadow-amber-200/60" 
                        : isMe 
                          ? "bg-blue-600 text-white rounded-br-none" 
                          : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                      }`}>
                      {m.text}
                    </div>
                    {!isMe && <span className="text-[9px] text-gray-400 mb-1 whitespace-nowrap">{time}</span>}
                  </div>
                </div>
              );
            })}
            <div ref={scrollEndRef} />
          </div>

          <form onSubmit={sendMessage} className={`p-4 border-t ${isChatEnabled ? "bg-white" : "bg-gray-100"}`}>
            <div className="flex flex-col gap-2">
              {!isChatEnabled && (
                <span className="text-[9px] text-gray-400 font-bold ml-2 italic">※現在は運営からのお知らせ専用です</span>
              )}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)} 
                  placeholder={isChatEnabled ? "メッセージ..." : "送信は制限されています"} 
                  disabled={!isChatEnabled}
                  className={`flex-1 border rounded-full px-4 py-2 text-sm outline-none transition-all
                    ${isChatEnabled ? "bg-white focus:border-blue-500" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`} 
                />
                <button disabled={!isChatEnabled} className={`px-5 py-2 rounded-full text-sm font-bold shadow-md ${isChatEnabled ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
                  送る
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {showStartOverlay && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-md">
          <div className="bg-white/95 rounded-[2rem] p-8 max-w-md w-full text-center shadow-[0_0_60px_rgba(0,0,0,0.25)]">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-3xl font-black text-blue-800 mb-3">ビンゴ大会へようこそ！</h2>
            <p className="text-sm text-gray-600 mb-6">
              {isEnded
                ? "ゲームは終了しました。お疲れ様でした。"
                : isStarted
                  ? "ゲームはすでに開始されています。発表済みの番号はカードに反映されているので、そのままビンゴを目指してください。"
                  : "ゲーム開始をお待ちください。開始後に番号がオープンされ、カードに反映されます。"
              }
            </p>
            <button
              onClick={() => setShowStartOverlay(false)}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white px-6 py-3 text-sm font-bold shadow-lg hover:bg-blue-700 transition-colors"
            >
              さあ、始めましょう
            </button>
          </div>
        </div>
      )}

      {showGameStartOverlay && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-blue-950/70 backdrop-blur-lg overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute left-10 top-16 w-8 h-8 rounded-full bg-yellow-300/80 animate-ping" />
            <span className="absolute right-16 top-24 w-6 h-6 rounded-full bg-pink-300/80 animate-bounce" />
            <span className="absolute left-20 bottom-24 w-10 h-10 rounded-full bg-cyan-300/60 animate-pulse" />
            <span className="absolute right-12 bottom-20 w-16 h-16 rounded-full bg-amber-300/50 animate-ping" />
          </div>
          <div className="relative rounded-[2rem] bg-gradient-to-br from-cyan-100 via-white to-slate-100 p-8 text-center shadow-[0_0_80px_rgba(59,130,246,0.35)] border border-blue-200 transform animate-[bounce_1.1s_ease-in-out_infinite]">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-white text-5xl shadow-[0_0_40px_rgba(59,130,246,0.45)] animate-bounce">🚀</div>
            <h2 className="text-3xl sm:text-4xl font-black text-blue-800 mb-2">ゲーム開始！</h2>
            <p className="text-sm text-slate-600">番号がこれから続々発表されます。カードを見逃さないでください！</p>
          </div>
        </div>
      )}

      {showNumberOverlay && lastDrawnNumber && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-blue-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="text-center transform animate-in zoom-in-50 duration-500">
            <p className="text-white font-black text-2xl mb-2 drop-shadow-lg uppercase tracking-widest">Next Number is...</p>
            <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center border-[12px] border-yellow-400 shadow-[0_0_50px_rgba(255,255,0,0.5)]">
              <span className="text-[120px] font-black text-blue-900 leading-none">{lastDrawnNumber}</span>
            </div>
          </div>
        </div>
      )}

      {state.showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute left-8 top-14 w-4 h-4 rounded-full bg-yellow-300 animate-ping" />
            <span className="absolute right-8 top-24 w-5 h-5 rounded-full bg-pink-400 animate-bounce" />
            <span className="absolute left-24 bottom-20 w-6 h-6 rounded-full bg-cyan-300 animate-pulse" />
            <span className="absolute right-24 bottom-16 w-3 h-3 rounded-full bg-orange-300 animate-ping" />
          </div>
          <div className="relative bg-gradient-to-br from-amber-100 via-white to-red-100 rounded-[2rem] p-8 max-sm:w-full max-w-sm text-center shadow-[0_0_70px_rgba(234,88,12,0.35)] border border-amber-200 ring-4 ring-amber-200/40 transform animate-[pulse_1.1s_ease-in-out_infinite]">
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-4xl sm:text-5xl font-black text-red-600 italic tracking-tighter mb-2">BINGO!</h2>
            <p className="text-gray-700 font-bold mb-6 leading-relaxed">おめでとうございます！<br/>ビンゴ達成です！</p>
            <div className="flex justify-center gap-2 mb-6">
              {['💥','🎊','✨'].map((icon, idx) => {
                const delays = ['delay-0', 'delay-75', 'delay-150'];
                return (
                  <span key={idx} className={`text-2xl animate-bounce ${delays[idx]}`}>{icon}</span>
                );
              })}
            </div>
            <p className="text-xs text-blue-500 mb-8 bg-blue-50 py-2 rounded-lg font-bold">
              ※集会所のスタッフへこの画面を見せてください
            </p>
            <button 
              onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })}
              className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-2xl shadow-red-500/30 hover:bg-red-700 transition-all duration-300"
            >
              カードに戻る
            </button>
          </div>
        </div>
      )}

      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-yellow-400 text-yellow-900 rounded-full shadow-2xl z-30 flex items-center justify-center text-2xl animate-bounce border-2 border-white"
        >
          💬
        </button>
      )}

      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-35 lg:hidden"
          onClick={() => setIsChatOpen(false)}
        />
      )}

    </main>
  );
}