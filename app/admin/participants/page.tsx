"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
// increment を使用して統計を安全に更新
import { collection, query, onSnapshot, orderBy, updateDoc, doc, getDoc, deleteDoc, increment } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ParticipantsListPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState("areaNumber");
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "participants"), orderBy(sortKey, sortKey === "createdAt" ? "desc" : "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setParticipants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [sortKey]);

  // 景品受取フラグの更新ロジック
  const togglePrize = async (userId: string, currentStatus: boolean, isBingo: boolean) => {
    if (!isBingo) {
      alert("このユーザーはまだビンゴしていません。");
      return;
    }

    try {
      // 1. 個人のステータスを更新
      await updateDoc(doc(db, "participants", userId), {
        prizeClaimed: !currentStatus
      });

      // 2. 統計ドキュメントと「配列内のデータ」を両方更新
      const gameRef = doc(db, "gameStatus", "current");
      const gameSnap = await getDoc(gameRef); // import に getDoc を追加してください

      if (gameSnap.exists()) {
        const list = gameSnap.data().participantList || [];
        // 配列内の自分のフラグを書き換える
        const newList = list.map((p: any) => 
          p.uid === userId ? { ...p, prizeClaimed: !currentStatus } : p
        );

        await updateDoc(gameRef, {
          participantList: newList,
          receivedCount: increment(currentStatus ? -1 : 1)
        });
      }

    } catch (error) {
      console.error("更新エラー:", error);
      alert("通信に失敗しました。");
    }
  };

  // 個別強制初期化ロジック
  const handleDelete = async (userId: string, nickname: string) => {
    if (!confirm(`【警告】${nickname} さんのデータを完全に消去しますか？\n統計データも自動的に差し引かれます。`)) return;
    
    try {
      const p = participants.find(part => part.id === userId);
      await deleteDoc(doc(db, "participants", userId));

      const gameRef = doc(db, "gameStatus", "current");
      const gameSnap = await getDoc(gameRef);

      if (gameSnap.exists()) {
        const list = gameSnap.data().participantList || [];
        // 配列から削除
        const newList = list.filter((p: any) => p.uid !== userId);

        await updateDoc(gameRef, {
          participantList: newList,
          totalParticipants: increment(-1),
          bingoCount: p?.isBingo ? increment(-1) : increment(0),
          receivedCount: p?.prizeClaimed ? increment(-1) : increment(0)
        });
      }
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  // CSVエクスポート（ここを復活させました）
  const exportCSV = () => {
    const headers = ["区画番号", "ニックネーム", "ビンゴ状態", "景品受取", "参加日時"];
    const rows = participants.map(p => [
      p.areaNumber,
      p.nickname,
      p.isBingo ? "当選" : "未",
      p.prizeClaimed ? "受取済" : "未",
      p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : ""
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bingo_participants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8 text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black">参加者名簿・景品管理</h1>
            <p className="text-sm text-slate-500">参加者数: {participants.length}名</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCSV} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700">
              CSV出力
            </button>
            <Link 
              href="/admin" 
              className="bg-white border px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 flex items-center justify-center"
            >
              管理者画面へ
            </Link>
          </div>
        </div>

        {/* ソートボタンエリア */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-slate-400 self-center mr-2">並び替え:</span>
          {[
            { label: "区画順", key: "areaNumber" },
            { label: "参加順", key: "createdAt" },
            { label: "ビンゴ順", key: "isBingo" }
          ].map(btn => (
            <button 
              key={btn.key}
              onClick={() => setSortKey(btn.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all
                ${sortKey === btn.key ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200"}`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-black">
                  <th className="p-4">区画</th>
                  <th className="p-4">ニックネーム</th>
                  <th className="p-4">参加日時</th>
                  <th className="p-4">ビンゴ</th>
                  <th className="p-4">景品受取</th>
                  <th className="p-4 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${p.prizeClaimed ? "bg-slate-50/50" : ""}`}>
                    <td className="p-4 font-mono font-bold">{p.areaNumber}</td>
                    <td className="p-4 font-bold">{p.nickname}</td>
                    <td className="p-4 text-xs text-slate-500">
                      {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : "---"}
                    </td>
                    <td className="p-4">
                      {p.isBingo ? (
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black">BINGO!</span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => togglePrize(p.id, p.prizeClaimed, p.isBingo)}
                        disabled={!p.isBingo}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border
                          ${!p.isBingo 
                            ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" 
                            : p.prizeClaimed 
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                              : "bg-white text-slate-400 border-slate-200 hover:border-blue-400 hover:text-blue-600"}`}
                      >
                        {p.prizeClaimed ? "✓ 受取済" : "未受取"}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(p.id, p.nickname)}
                        className="text-xs text-red-300 hover:text-red-600 font-bold transition-colors"
                      >
                        強制初期化
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {participants.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-bold">参加者がまだいません。</div>
          )}
        </div>
      </div>
    </main>
  );
}