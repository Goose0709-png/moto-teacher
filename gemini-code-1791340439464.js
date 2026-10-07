import React, { useState, useEffect } from 'react';

// API 基礎 URL (請依據實際後端位置調整)
const API_BASE = "http://localhost:8000/api/v1";

// ================= 組件 1: 專有名詞標籤與彈窗 (Glossary Modal) =================
function TermTag({ termId, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [termData, setTermData] = useState(null);

  const handleClick = async () => {
    try {
      const res = await fetch(`${API_BASE}/glossary/${termId}`);
      if (res.ok) {
        const data = await res.json();
        setTermData(data);
        setIsOpen(true);
      }
    } catch (e) {
      console.error("載入術語失敗", e);
    }
  };

  return (
    <>
      <span
        onClick={handleClick}
        className="inline-flex items-center text-blue-600 border-b border-dashed border-blue-500 cursor-pointer hover:bg-blue-50 px-1 rounded transition-colors text-xs font-medium"
      >
        {label} <span className="ml-0.5 text-[10px]">ⓘ</span>
      </span>

      {isOpen && termData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ✕
            </button>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">
              {termData.category}
            </span>
            <h3 className="text-xl font-bold text-gray-800 mt-2">{termData.term}</h3>
            <p className="text-sm font-semibold text-gray-700 mt-3 border-l-4 border-blue-500 pl-2 bg-gray-50 py-1">
              {termData.summary}
            </p>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              {termData.full_explanation}
            </p>
            {termData.image_url && (
              <img
                src={termData.image_url}
                alt={termData.term}
                className="mt-4 rounded-lg border w-full h-40 object-cover"
              />
            )}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-4 py-2 rounded-lg"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ================= 組件 2: DIY 圖解與扭力彈窗 (DIY Diagram Modal) =================
function DIYDiagramButton({ diyId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [diyData, setDiyData] = useState(null);

  const handleOpen = async () => {
    setIsOpen(true);
    try {
      const res = await fetch(`${API_BASE}/diy-diagrams/${diyId}`);
      if (res.ok) {
        const data = await res.json();
        setDiyData(data);
      }
    } catch (e) {
      console.error("載入 DIY 資料失敗", e);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-medium px-2.5 py-1 rounded transition"
      >
        <span>🔧</span>
        <span>檢視 DIY 零件分解圖解</span>
      </button>

      {isOpen && diyData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold">
                難易度：{diyData.difficulty}
              </span>
              <span className="text-xs text-gray-500">對應構造：{diyData.part_name}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">{diyData.title}</h3>

            <div className="bg-gray-900 rounded-lg p-2 mb-3 text-center">
              <img
                src={diyData.diagram_url}
                alt={diyData.part_name}
                className="w-full h-48 object-cover rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs">
                <span className="font-bold text-amber-800 block mb-1">🛠 建議工具：</span>
                <ul className="list-disc list-inside text-amber-900 space-y-0.5">
                  {diyData.tools_needed.map((tool, i) => <li key={i}>{tool}</li>)}
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg text-xs">
                <span className="font-bold text-blue-800 block mb-1">🔩 原廠鎖緊扭力：</span>
                <p className="font-semibold text-blue-900 mt-1">{diyData.torque_specs || "依照標準手感鎖緊"}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-2.5 rounded-lg border text-xs text-gray-700">
              <span className="font-bold text-gray-900 block mb-1">拆解重點：</span>
              <p>{diyData.steps_summary}</p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gray-800 text-white text-xs px-4 py-2 rounded-lg"
              >
                關閉圖解
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ================= 主頁面與索引系統 (Main App Page) =================
export default function App() {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCcRange, setSelectedCcRange] = useState('all');
  const [selectedEngine, setSelectedEngine] = useState('');
  const [selectedCylinders, setSelectedCylinders] = useState('');

  const brandsList = ['KYMCO', 'SYM', 'HONDA', 'YAMAHA', 'SUZUKI'];
  const categories = ['速克達', '跑車', '街車', '巡航車'];

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  useEffect(() => {
    const fetchFilteredManuals = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      selectedBrands.forEach(b => params.append('brands', b));
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedEngine) params.append('engine_type', selectedEngine);
      if (selectedCylinders) params.append('cylinders', selectedCylinders);

      if (selectedCcRange === '0-250') {
        params.append('min_cc', '0'); params.append('max_cc', '250');
      } else if (selectedCcRange === '251-550') {
        params.append('min_cc', '251'); params.append('max_cc', '550');
      } else if (selectedCcRange === '551+') {
        params.append('min_cc', '551');
      }

      try {
        const res = await fetch(`${API_BASE}/vehicles/filter?${params.toString()}`);
        const data = await res.json();
        setManuals(data.data || []);
      } catch (err) {
        console.error("Filter Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredManuals();
  }, [selectedBrands, selectedCategory, selectedCcRange, selectedEngine, selectedCylinders]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          🛵 品牌機車車主與維修手冊自動檢索系統
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          支援版權出處自動引導、多條件排氣量與構造索引、術語彈窗解釋及 DIY 拆解圖解
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 側邊篩選索引欄 */}
        <aside className="bg-white p-5 rounded-xl border shadow-sm space-y-5 md:col-span-1 h-fit">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="font-bold text-gray-800 text-base">索引過濾器</h2>
            <button
              onClick={() => {
                setSelectedBrands([]); setSelectedCategory('');
                setSelectedCcRange('all'); setSelectedEngine(''); setSelectedCylinders('');
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              清空條件
            </button>
          </div>

          {/* 品牌篩選 */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">品牌</label>
            <div className="space-y-1">
              {brandsList.map(b => (
                <label key={b} className="flex items-center text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2 rounded text-blue-600"
                    checked={selectedBrands.includes(b)}
                    onChange={() => handleBrandToggle(b)}
                  />
                  {b}
                </label>
              ))}
            </div>
          </div>

          {/* 車種 */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">車種</label>
            <select
              className="w-full border rounded p-1.5 text-xs bg-gray-50"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">全部分類</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* 排氣量級距 */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">排氣量級距</label>
            <div className="space-y-1 text-xs text-gray-600">
              <label className="block"><input type="radio" name="cc" className="mr-1.5" checked={selectedCcRange === 'all'} onChange={() => setSelectedCcRange('all')}/> 全部</label>
              <label className="block"><input type="radio" name="cc" className="mr-1.5" checked={selectedCcRange === '0-250'} onChange={() => setSelectedCcRange('0-250')}/> 白牌 (250cc 以下)</label>
              <label className="block"><input type="radio" name="cc" className="mr-1.5" checked={selectedCcRange === '251-550'} onChange={() => setSelectedCcRange('251-550')}/> 黃牌 (251cc-550cc)</label>
              <label className="block"><input type="radio" name="cc" className="mr-1.5" checked={selectedCcRange === '551+'} onChange={() => setSelectedCcRange('551+')}/> 紅牌 (551cc 以上)</label>
            </div>
          </div>
        </aside>

        {/* 右側車款列表展示 */}
        <main className="md:col-span-3 space-y-4">
          <div className="bg-white p-3.5 rounded-xl border text-xs text-gray-600 shadow-sm flex justify-between items-center">
            <span>找到 <strong className="text-blue-600">{manuals.length}</strong> 筆手冊與技術資料</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">資料讀取中...</div>
          ) : (
            manuals.map(item => (
              <div key={item.id} className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{item.brand}</span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{item.category}</span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{item.displacement} cc</span>
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">
                        <TermTag termId="4t-water" label={item.engine_type} /> ({item.cylinders}缸)
                      </span>
                    </div>
                  </div>

                  {/* 版權狀態標籤 */}
                  {item.is_copyrighted ? (
                    <span className="bg-amber-100 text-amber-800 text-[11px] px-2.5 py-1 rounded-full font-semibold">
                      受版權保護 (引導至原著)
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-800 text-[11px] px-2.5 py-1 rounded-full font-semibold">
                      免費線上閱讀
                    </span>
                  )}
                </div>

                {/* 原廠保養數據與專業名詞跳轉 */}
                <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1.5">
                  <div className="font-bold text-gray-700">重點保養建議與零件規格：</div>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {item.recommendations.map((rec, i) => (
                      <li key={i}>
                        {rec.includes("火星塞") ? (
                          <span>{rec} — <TermTag termId="ngk-spark" label="查看火星塞規格說明" /></span>
                        ) : rec.includes("CVT") ? (
                          <span>{rec} — <TermTag termId="cvt" label="什麼是 CVT 變速？" /></span>
                        ) : (
                          rec
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DIY 圖解專區 */}
                {item.diy_items && item.diy_items.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-bold text-gray-600">DIY 保養分解圖：</span>
                    {item.diy_items.map(diyId => (
                      <DIYDiagramButton key={diyId} diyId={diyId} />
                    ))}
                  </div>
                )}

                {/* 版權合規按鈕路由 */}
                <div className="pt-3 border-t flex justify-end">
                  {item.is_copyrighted ? (
                    <a
                      href={item.official_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
                    >
                      前往原著 / 官方出處查閱 ↗
                    </a>
                  ) : (
                    <a
                      href={item.direct_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
                    >
                      線上開啟 PDF 手冊
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}