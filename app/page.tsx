"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

// 明示的な番地下桁 -> 区画番号マップ（提供された241パターン）
const AREA_NUMBER_MAP: Record<string, string> = {
  "14": "S1",
  "15": "S2",
  "16": "S3",
  "17": "S4",
  "18": "S5",
  "19": "S6",
  "20": "S7",
  "21": "S8",
  "22": "S9",
  "23": "S10",
  "24": "S11",
  "25": "S12",
  "26": "S13",
  "27": "S14",
  "28": "S70",
  "29": "S71",
  "30": "S72",
  "31": "S73",
  "33": "S74",
  "34": "S75",
  "35": "S76",
  "36": "S77",
  "37": "S78",
  "38": "S79",
  "39": "S80",
  "40": "S81",
  "41": "S82",
  "42": "S83",
  "43": "S84",
  "44": "S85",
  "45": "S86",
  "46": "S87",
  "47": "S88",
  "48": "S89",
  "49": "S90",
  "50": "S91",
  "51": "S92",
  "52": "S93",
  "53": "S94",
  "54": "S95",
  "55": "S96",
  "56": "S97",
  "57": "S98",
  "58": "S99",
  "59": "S100",
  "60": "S101",
  "61": "S102",
  "62": "S103",
  "63": "S104",
  "64": "S105",
  "65": "S106",
  "66": "S107",
  "67": "S108",
  "68": "S109",
  "69": "S110",
  "70": "S111",
  "71": "S112",
  "72": "S113",
  "73": "S114",
  "74": "S115",
  "75": "S116",
  "76": "S117",
  "77": "S118",
  "78": "S119",
  "79": "S120",
  "80": "S121",
  "90": "S15",
  "91": "S16",
  "92": "S17",
  "93": "S18",
  "94": "S19",
  "95": "S20",
  "96": "S21",
  "97": "S127",
  "98": "S143",
  "99": "S54",
  "100": "S55",
  "101": "S56",
  "102": "S57",
  "103": "S58",
  "104": "S59",
  "105": "S60",
  "106": "S61",
  "107": "S62",
  "108": "S63",
  "109": "S64",
  "110": "S65",
  "111": "S66",
  "112": "S67",
  "113": "S68",
  "114": "S69",
  "115": "S122",
  "116": "S123",
  "117": "S124",
  "118": "S125",
  "119": "S126",
  "133": "S22",
  "134": "S23",
  "135": "S24",
  "136": "S25",
  "137": "S26",
  "138": "S27",
  "139": "S28",
  "140": "S29",
  "141": "S30",
  "142": "S31",
  "143": "S32",
  "144": "S33",
  "145": "S34",
  "146": "S35",
  "147": "S36",
  "148": "S37",
  "149": "S156",
  "150": "S155",
  "151": "S154",
  "152": "S153",
  "153": "S152",
  "154": "S161",
  "155": "S160",
  "156": "S159",
  "157": "S158",
  "158": "S157",
  "159": "S38",
  "160": "S39",
  "161": "S40",
  "162": "S41",
  "163": "S42",
  "164": "S43",
  "165": "S44",
  "166": "S45",
  "167": "S46",
  "168": "S47",
  "169": "S48",
  "170": "S49",
  "171": "S50",
  "172": "S51",
  "173": "S52",
  "174": "S53",
  "175": "S144",
  "176": "S151",
  "177": "S150",
  "178": "S149",
  "179": "S148",
  "180": "S147",
  "181": "S146",
  "182": "S145",
  "183": "S132",
  "184": "S141",
  "185": "S140",
  "186": "S139",
  "187": "S138",
  "188": "S137",
  "189": "S136",
  "190": "S135",
  "191": "S134",
  "192": "S133",
  "193": "S142",
  "194": "S131",
  "195": "S130",
  "196": "S129",
  "197": "S128",
  "210": "N1",
  "211": "N2",
  "212": "N3",
  "213": "N4",
  "214": "N5",
  "215": "N6",
  "216": "N7",
  "217": "N8",
  "218": "N9",
  "219": "N10",
  "220": "N11",
  "221": "N12",
  "222": "N13",
  "223": "N14",
  "224": "N15",
  "225": "N16",
  "226": "N17",
  "227": "N18",
  "228": "N19",
  "229": "N20",
  "230": "N21",
  "231": "N22",
  "232": "N23",
  "233": "N24",
  "234": "N25",
  "235": "N26",
  "236": "N27",
  "237": "N28",
  "238": "N29",
  "239": "N30",
  "240": "N31",
  "241": "N32",
  "242": "N33",
  "243": "N34",
  "244": "N35",
  "245": "N36",
  "246": "N52",
  "247": "N53",
  "248": "N54",
  "249": "N55",
  "250": "N56",
  "251": "N57",
  "252": "N58",
  "253": "N59",
  "254": "N60",
  "255": "N61",
  "256": "N62",
  "257": "N63",
  "258": "N64",
  "259": "N65",
  "260": "N66",
  "261": "N67",
  "262": "N68",
  "263": "N69",
  "264": "N70",
  "265": "N71",
  "266": "N72",
  "267": "N73",
  "268": "N74",
  "269": "N75",
  "270": "N76",
  "271": "N77",
  "272": "N78",
  "273": "N79",
  "274": "N80",
  "275": "N37",
  "276": "N38",
  "277": "N39",
  "278": "N40",
  "279": "N41",
  "280": "N42",
  "281": "N43",
  "282": "N44",
  "283": "N45",
  "284": "N46",
  "285": "N47",
  "286": "N48",
  "287": "N49",
  "288": "N50",
  "289": "N51",
};

const getAreaNumber = (address: string) => {
  const trimmed = address.trim();
  if (!trimmed) return null;
  if (!/^[0-9]+$/.test(trimmed)) return null;

  // 後方一致による誤判定を防ぐため、マップのキーと「完全一致」するかをダイレクトに判定する
  if (trimmed in AREA_NUMBER_MAP) {
    return AREA_NUMBER_MAP[trimmed];
  }
  
  return null;
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
      setAddressError("対応する区画番号がありません。正しい番地を入力してください。");
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
        <header className="relative text-center mb-8">
          <div className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-widest shadow-sm">
            2026 Special Event
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 leading-tight">
            エイテスタウン自治会<br></br><span className="sm:block">夏祭りビンゴ大会</span>
          </h1>
          <p className="text-gray-500 mt-3 text-sm font-medium">お気軽にご参加ください！</p>
          <img
            src="/img/inzai-kun_festival.gif"
            alt="いんざいくん"
            className="absolute -top-10 -right-10 w-20 h-20 object-contain"
          />
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
                  setAddressError(value.trim() && !mapped ? "対応表にない番地です" : null);
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