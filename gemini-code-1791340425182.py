from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict

app = FastAPI(
    title="Motorcycle Manuals & DIY Indexing API",
    description="整合版權路由、多維過濾、術語辭典與 DIY 構造圖解的後端服務",
    version="1.0.0"
)

# 允許跨域請求 (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= 資料模型 (Data Models) =================

class DIYItem(BaseModel):
    item_id: str
    title: str
    difficulty: str
    tools_needed: List[str]
    part_name: str
    diagram_url: str
    steps_summary: str
    torque_specs: Optional[str] = None

class TermDetail(BaseModel):
    id: str
    term: str
    category: str
    summary: str
    full_explanation: str
    image_url: Optional[str] = None

class MotorcycleManual(BaseModel):
    id: int
    brand: str
    model: str
    year: int
    category: str
    displacement: int
    engine_type: str
    cylinders: int
    type: str
    title: str
    is_copyrighted: bool
    official_source_url: str
    direct_pdf_url: Optional[str] = None
    recommendations: List[str]
    diy_items: List[str]  # 關聯到 diy_db 的 key

# ================= 模擬資料庫 (Mock Database) =================

glossary_db: Dict[str, TermDetail] = {
    "4t-water": TermDetail(
        id="4t-water",
        term="4T水冷 (Four-Stroke Water-Cooled)",
        category="引擎系統",
        summary="利用冷卻水循環散熱的四行程引擎，適合長時間高速運轉。",
        full_explanation="四行程引擎經過進氣、壓縮、爆發、排氣四個行程。水冷系統利用水幫浦帶動冷卻液在引擎水套內循環，將熱量帶往前方水箱由風扇與氣流散熱，能精準控制工作溫度並減少熱衰竭。",
        image_url="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80"
    ),
    "ngk-spark": TermDetail(
        id="ngk-spark",
        term="NGK 銥合金火星塞",
        category="點火系統",
        summary="產生電火花以點燃汽缸內混合氣的高效能點火元件。",
        full_explanation="火星塞位於汽缸頂部，利用高壓電在中心電極跳火。銥合金火星塞具有點火集中、耐高溫與點火效率高優點，定期更換可維護燃油效率與冷車發動順暢度。"
    ),
    "cvt": TermDetail(
        id="cvt",
        term="CVT 無段自動變速箱",
        category="傳動系統",
        summary="透過普利盤與皮帶進行連續自動變速的傳動系統。",
        full_explanation="CVT 系統利用引擎轉速產生的離心力推動普利珠，進而改變普利盤離合間距與皮帶工作半徑，實現流暢且無換檔頓挫感平順加速。"
    )
}

diy_db: Dict[str, DIYItem] = {
    "krv-oil": DIYItem(
        item_id="krv-oil",
        title="DIY 機油與洩油螺絲位置",
        difficulty="簡單",
        tools_needed=["17mm 套筒扳手", "廢油盆", "漏斗", "1.0L 新機油"],
        part_name="機油洩油螺絲 & 磁芯",
        diagram_url="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
        steps_summary="1. 發動車輛暖車 2 分鐘讓機油順暢；2. 鬆開車底 17mm 洩油螺絲並排空廢油；3. 清潔螺絲磁芯並更換墊片；4. 依原廠扭力值鎖回。",
        torque_specs="洩油螺絲：24 N·m (2.4 kgf·m)"
    ),
    "cbr-plug": DIYItem(
        item_id="cbr-plug",
        title="DIY 火星塞拆換與高壓導線分解",
        difficulty="中等",
        tools_needed=["16mm 火星塞專用套筒", "萬向轉接桿"],
        part_name="汽缸頭與火星塞構造",
        diagram_url="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
        steps_summary="1. 移除車側飾板與火星塞蓋；2. 逆時針螺紋卸下舊火星塞；3. 新火星塞先以手部導正鎖入避免斜牙；4. 逼緊至標準扭力。",
        torque_specs="火星塞：12 N·m (1.2 kgf·m)"
    )
}

manuals_db: List[MotorcycleManual] = [
    MotorcycleManual(
        id=1,
        brand="KYMCO",
        model="KRV 180",
        year=2023,
        category="速克達",
        displacement=175,
        engine_type="4T水冷",
        cylinders=1,
        type="owner_manual",
        title="KYMCO KRV 180 車主手冊",
        is_copyrighted=False,
        official_source_url="https://www.kymco.com.tw/",
        direct_pdf_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        recommendations=["機油交換量：1.0 L", "每 10,000 km 檢查火星塞", "齒輪油量：110 cc"],
        diy_items=["krv-oil"]
    ),
    MotorcycleManual(
        id=2,
        brand="HONDA",
        model="CBR650R",
        year=2024,
        category="跑車",
        displacement=649,
        engine_type="4T水冷",
        cylinders=4,
        type="service_manual",
        title="HONDA CBR650R 原廠維修服務手冊",
        is_copyrighted=True,
        official_source_url="https://www.hondamotopub.com/",
        direct_pdf_url=None,
        recommendations=["機油交換量：2.9 L", "每 12,000 km 更換火星塞", "前胎壓：2.5 bar"],
        diy_items=["cbr-plug"]
    ),
    MotorcycleManual(
        id=3,
        brand="SYM",
        model="JET SL+ 158",
        year=2024,
        category="速克達",
        displacement=158,
        engine_type="4T水冷",
        cylinders=1,
        type="owner_manual",
        title="SYM JET SL+ 158 車主手冊",
        is_copyrighted=False,
        official_source_url="https://www.sym-global.com/",
        direct_pdf_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        recommendations=["機油交換量：1.0 L", "傳動系統規格：CVT", "胎壓：前 1.75 / 後 2.25 kg/cm²"],
        diy_items=["krv-oil"]
    )
]

# ================= Endpoints =================

@app.get("/api/v1/vehicles/filter")
def filter_vehicles(
    brands: Optional[List[str]] = Query(None),
    category: Optional[str] = Query(None),
    min_cc: Optional[int] = Query(None),
    max_cc: Optional[int] = Query(None),
    engine_type: Optional[str] = Query(None),
    cylinders: Optional[int] = Query(None),
):
    results = manuals_db
    if brands:
        results = [v for v in results if v.brand.upper() in [b.upper() for b in brands]]
    if category:
        results = [v for v in results if v.category == category]
    if min_cc is not None:
        results = [v for v in results if v.displacement >= min_cc]
    if max_cc is not None:
        results = [v for v in results if v.displacement <= max_cc]
    if engine_type:
        results = [v for v in results if v.engine_type == engine_type]
    if cylinders is not None:
        results = [v for v in results if v.cylinders == cylinders]
        
    return {"status": "success", "total": len(results), "data": results}

@app.get("/api/v1/glossary/{term_id}")
def get_glossary_term(term_id: str):
    key = term_id.lower()
    if key not in glossary_db:
        raise HTTPException(status_code=404, detail="Glossary term not found")
    return glossary_db[key]

@app.get("/api/v1/diy-diagrams/{diy_id}")
def get_diy_diagram(diy_id: str):
    if diy_id not in diy_db:
        raise HTTPException(status_code=404, detail="DIY diagram not found")
    return diy_db[diy_id]

# 啟動命令: uvicorn main:app --reload --port 8000