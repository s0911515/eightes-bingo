import React from "react";
import Image from "next/image";

export const metadata = {
  title: "システム概要・使い方マニュアル | エイテスタウン自治会ビンゴ大会",
  description: "オンラインビンゴシステムの概要、比較、および構成マニュアル",
};

export default function HowToPage() {
  // 比較表のデータ
const comparisonData = [
    { 
      item: "費用（初期/月額）", 
      own: "0円 （完全無料）", 
      theBingo: "11,000円〜 / イベント", 
      bingoOnline: "5,500円〜 / 30日間" 
    },
    { 
      item: "参加可能人数", 
      own: "制限なし （無料枠内）", 
      theBingo: "200人まで（30人まで無料）", 
      bingoOnline: "1,000人まで（30人まで無料）" 
    },
    { 
      item: "広告表示", 
      own: "なし （完全クリーン）", 
      theBingo: "無料版はあり（有料で非表示）", 
      bingoOnline: "無料版はあり（有料で非表示）" 
    },
    { 
      item: "独自ドメイン運用", 
      own: "可能（自治会専用URL）", 
      theBingo: "不可（サービス共通URL）", 
      bingoOnline: "不可（サービス共通URL）" 
    },
    { 
      item: "カスタマイズ性", 
      own: "無限（独自ルール・画面）", 
      theBingo: "規定デザイン（ロゴ変更は別プラン）", 
      bingoOnline: "既定デザインのみ" 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl overflow-hidden border border-slate-200">
        
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-10 border-b-4 border-amber-500">
          <h1 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
            オンラインビンゴシステム 運営・導入マニュアル
          </h1>
          <p className="mt-2 text-blue-100 text-sm sm:text-base">
            エイテスタウン自治会イベント（親睦ビンゴ大会）システム概要と運用リファレンス
          </p>
        </div>

        <div className="p-8 space-y-10">
          
          {/* 1. 目的と背景 */}
          <section>
            <h2 className="text-xl font-bold text-blue-900 border-l-4 border-blue-600 pl-3 mb-4">
              1. 目的と背景
            </h2>
            <div className="text-base leading-relaxed space-y-4 text-slate-700">
              <p>
                従来のビンゴ大会では、紙カードの配布、番号の読み上げ、リーチ・ビンゴの自己申告および確認など、アナログ特有の運営負荷が大きな課題となっていました。特に大人数が参加する自治会イベントでは、確認作業の遅れや見落としが全体の進行を妨げる要因となります。
              </p>
              <p>
                本システムは、<strong>「参加者・運営双方の負担を最小限にし、誰もがリアルタイムに高揚感を楽しめる環境」</strong>を低コストかつ安全に実現することを目的に独自開発されました。住民が自身のスマートフォン端末から簡単にアクセスできるWebアプリケーションとして設計されています。
              </p>
            </div>
          </section>

          {/* 2. 世間一般のビンゴサービスとの比較 */}
          <section>
            <h2 className="text-xl font-bold text-blue-900 border-l-4 border-blue-600 pl-3 mb-4">
              2. 世間一般のビンゴサービスとの比較
            </h2>
            <p className="text-base text-slate-700 mb-4">
              今回の自前構築（内製システム）の妥当性を検証するため、広く一般に利用されている商用のオンラインビンゴツール2社との具体的な機能・コスト比較を行いました。
            </p>
            
            {/* 比較表 */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg mb-6">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold tracking-wider">比較項目</th>
                    <th className="px-4 py-3 text-left font-bold tracking-wider bg-blue-800 border-x border-blue-900">手作りシステム（これ）</th>
                    <th className="px-4 py-3 text-left font-bold tracking-wider">THE BINGO (ザ・ビンゴ)</th>
                    <th className="px-4 py-3 text-left font-bold tracking-wider">BINGO! Online (ビンゴオンライン)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {comparisonData.map((row, index) => (
                    <tr key={index} className={index === 0 ? "bg-blue-50/50 font-medium" : "hover:bg-slate-50"}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.item}</td>
                      <td className="px-4 py-3 bg-blue-50/30 border-x border-slate-200 text-blue-900 font-bold">{row.own}</td>
                      <td className="px-4 py-3 text-slate-600">{row.theBingo}</td>
                      <td className="px-4 py-3 text-slate-600">{row.bingoOnline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 外部サービスの詳細とリンク */}
            <div className="space-y-4 text-sm text-slate-700 bg-slate-100 p-5 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">🔍 比較対象とした外部サービスの詳細</h3>
              
              <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
                <p className="font-bold text-blue-900">1. THE BINGO（ザ・ビンゴ）</p>
                <p className="mt-1 text-slate-600 text-xs">
                  運営：株式会社アソビズム。オンラインイベント等で広く使われる洗練されたサービス。31人以上で利用する場合、1回使い切りのイベントプラン（11,000円〜）の契約が必要になります。
                </p>
                <p className="mt-2">
                  <a href="https://the-bingo.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">
                    公式リンク: https://the-bingo.jp/
                  </a>
                </p>
              </div>

              <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
                <p className="font-bold text-blue-900">2. BINGO! Online（ビンゴオンライン）</p>
                <p className="mt-1 text-slate-600 text-xs">
                  運営：株式会社ファースト・システム。ブラウザのみで完結する手軽なシステム。こちらも31人以上の参加から有料ライセンス（30日間有効で5,500円〜）の購入が必要です。
                </p>
                <p className="mt-2">
                  <a href="https://www.bingo-online.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">
                    公式リンク: https://www.bingo-online.jp/
                  </a>
                </p>
              </div>

              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                ※各サービスのプラン・料金は2026年時点の調査に基づきます。どちらのサービスも30人までは無料で利用可能ですが、今回の自治会規模（100名前後想定）では、いずれも有料プランの契約が必要となるため、完全に無料で運用可能な自前構築システムがコスト面で極めて優位となります。
              </p>
            </div>
          </section>

          {/* 3. 自前構築したシステムの構成図 */}
          <section>
            <h2 className="text-xl font-bold text-blue-900 border-l-4 border-blue-600 pl-3 mb-4">
              3. 自前構築したシステムの構成図（インフラ構成）
            </h2>
            <p className="text-base text-slate-700 mb-4">
              システムの信頼性と運用の透明性を保証するため、GitHub ActionsによるCI/CD（継続的インテグレーション/デリバリー）パイプラインと、Googleの堅牢なサーバーレスインフラ（Firebase）を組み合わせて構築しています。
            </p>
            <div className="relative w-full border border-slate-200 rounded-lg p-2 bg-slate-100 flex justify-center items-center">
              <Image
                src="/img/infrastructure.jpg"
                alt="システムインフラ構成図"
                width={800}
                height={450}
                className="rounded border border-slate-200 shadow-sm max-w-full h-auto"
                priority
              />
            </div>
          </section>

          {/* 4. 当日の運用フローとアクセスリンク */}
          <section>
            <h2 className="text-xl font-bold text-blue-900 border-l-4 border-blue-600 pl-3 mb-4">
              4. 当日の運用フローとアクセスリンク
            </h2>
            <p className="text-base text-slate-700 leading-relaxed mb-6">
              本システムは、サーバーの運用保守の手間が一切かからない「フルサーバーレス構造」です。クラウドデータベース（Cloud Firestore）とのリアルタイム同期接続により、管理者が番号を抽選した瞬間に、すべての参加者のスマートフォン画面へ反映されます。当日は以下の流れに沿って運営を行います。
            </p>

            {/* 4-1. 当日の大まかな流れ */}
            <div className="mb-8">
              <h3 className="text-md font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-900 rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">1</span>
                当日の大まかな全体の流れ
              </h3>
              <ol className="relative border-l border-slate-200 ml-3 space-y-4 text-sm text-slate-600">
                <li className="pl-4">
                  <span className="absolute w-2 h-2 bg-blue-600 rounded-full -left-[5px] mt-1.5"></span>
                  <strong className="text-slate-900">【開会前】受付・参加登録</strong>：参加者は会場のQRコードからアクセスし、Web上でカードを受け取ります。
                </li>
                <li className="pl-4">
                  <span className="absolute w-2 h-2 bg-blue-600 rounded-full -left-[5px] mt-1.5"></span>
                  <strong className="text-slate-900">【ゲーム中】番号の抽選と同期</strong>：管理者がPCで抽選ボタンを押すと、全員のスマホに自動で反映されます。
                </li>
                <li className="pl-4">
                  <span className="absolute w-2 h-2 bg-blue-600 rounded-full -left-[5px] mt-1.5"></span>
                  <strong className="text-slate-900">【終盤】ビンゴの自動検知</strong>：ビンゴした会員に集会所で景品を授与します。
                </li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 4-2. 管理者向け（PC） */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-md font-bold text-amber-950 flex items-center gap-2 mb-2">
                    <span>💻</span> 管理者向け（PC・タブレット推奨）
                  </h3>
                  <p className="text-xs text-amber-900 mb-3">
                    イベントの進行・抽選を行う「司会・本部スタッフ」用の画面です。
                  </p>
                  <div className="bg-white border border-amber-300 rounded-lg p-2.5 text-center select-all mb-4">
                    <a 
                      href="https://eightes-bingo.web.app/admin" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-amber-700 font-bold hover:underline break-all"
                    >
                      https://eightes-bingo.web.app/admin
                    </a>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1.5">
                    <p className="font-bold text-amber-950">📌 やること：</p>
                    <p>・開会前にアクセスし、参加者が正しくエントリーできているかリストを確認する。</p>
                    <p>・ゲームが始まったら、「抽選ボタン」を押してランダムに番号を引く。</p>
                    <p>・ビンゴした会員に景品を渡し、Web画面から景品受け渡し操作を実行する。</p>
                  </div>
                </div>
              </div>

              {/* 4-3. ユーザー向け（スマホ） */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-md font-bold text-green-950 flex items-center gap-2 mb-2">
                    <span>📱</span> 一般ユーザー向け（スマートフォン専用）
                  </h3>
                  <p className="text-xs text-green-900 mb-3">
                    一般の参加者が自分の手元でビンゴカードとして使用する画面です。
                  </p>
                  <div className="bg-white border border-green-300 rounded-lg p-2.5 text-center select-all mb-4">
                    <a 
                      href="https://eightes-bingo.web.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-green-700 font-bold hover:underline break-all"
                    >
                      https://eightes-bingo.web.app/
                    </a>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1.5">
                    <p className="font-bold text-green-950">📌 やること：</p>
                    <p>・会場掲示のQRコードからトップページ（上記URL）にアクセスする。</p>
                    <p>・ニックネームを入力して「ビンゴに参加する」ボタンを押し、カードを発行する。</p>
                    <p>・司会が番号を引くと、自分のカード内の数字が自動でヒット（色が変わる）するので、ビンゴを目指す。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-slate-100 p-4 rounded-lg text-xs text-slate-500 leading-relaxed">
              <strong>💡 運用の注意点（仕様補足）</strong>：
              参加者の端末はCookie/LocalStorageでセッションが維持されます。そのため、ゲーム中に誤ってブラウザを閉じたり、一時的に通信が途切れたりしても、再度同じURL（またはQRコード）にアクセスすれば、<span className="text-red-600 font-bold">元のカード情報のまま即座に復帰可能</span>です。安心して住民の皆様にご案内ください（個人情報の収集も一切ありません）。
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}