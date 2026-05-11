import React, { useEffect, useMemo, useRef, useState } from "react";

const BR = String.fromCharCode(10);
const STORAGE_KEY = "ai-exhibition-projects-v2";

const zoneTypes = {
  brand: { label: "品牌形象区", color: "bg-emerald-600", text: "text-white", border: "border-emerald-300" },
  reception: { label: "接待区", color: "bg-lime-500", text: "text-white", border: "border-lime-300" },
  product: { label: "产品展示区", color: "bg-emerald-100", text: "text-emerald-950", border: "border-emerald-300" },
  meeting: { label: "会议室", color: "bg-sky-100", text: "text-sky-950", border: "border-sky-300" },
  talk: { label: "开放洽谈区", color: "bg-white", text: "text-slate-900", border: "border-slate-300" },
  bar: { label: "吧台/茶歇区", color: "bg-amber-100", text: "text-amber-950", border: "border-amber-300" },
  storage: { label: "储藏/后勤区", color: "bg-slate-200", text: "text-slate-800", border: "border-slate-300" },
  screen: { label: "屏幕/多媒体区", color: "bg-indigo-500", text: "text-white", border: "border-indigo-300" },
  custom: { label: "自定义区域", color: "bg-fuchsia-100", text: "text-fuchsia-950", border: "border-fuchsia-300" },
};

const options = {
  boothType: ["展台/展位", "企业展厅", "发布会舞台", "快闪空间", "会议主视觉空间"],
  openSides: ["四面开口", "三面开口", "两面开口", "单面开口", "封闭式", "自定义"],
  topStructure: ["无吊顶", "TRUSS吊顶", "轻量化吊楣", "局部吊顶", "格栅吊顶", "自定义"],
  secondFloor: ["无二层", "有二层", "局部二层", "不可做二层"],
  promptLang: ["中文", "英文", "中英双语"],
  outputModel: ["Nano Banana", "Midjourney", "通用AI绘图", "图生图修改", "白模推敲", "高清修复"],
  imageRatio: ["16:9", "4:3", "1:1", "3:4", "9:16", "21:9", "A4竖版", "A4横版"],
  styleTags: ["现代简约", "高级商务", "国际化", "科技感", "新能源风格", "医疗学术", "轻奢", "自然环保", "极简白模", "通透开放", "施工可落地"],
  layoutTags: ["开放通透", "中岛布局", "环形动线", "沿墙叙事", "中心展品", "主入口强识别", "三面可视", "左右不封死", "动线留白"],
  functionTags: ["接待台", "吧台", "开放洽谈", "圆桌洽谈", "封闭会议室", "储藏室", "主LED屏", "产品电视", "互动屏", "灯箱画面", "产品展示台", "实物展品", "模型展示"],
  materialTags: ["白色烤漆地面", "白色淋油板", "灰色地毯", "木纹地板", "烤漆墙面", "灯箱画面", "软膜灯箱", "玻璃隔断", "金属板", "木饰面", "亚克力", "发光灯带"],
  colorTags: ["白色", "绿色", "蓝色", "红色", "黑白灰", "银灰", "木色", "品牌标准色", "金色点缀", "少量科技蓝", "避免大面积黑色"],
  cameraTags: ["主入口45度", "正面主视角", "左侧视角", "右侧视角", "顶部鸟瞰", "人眼高度", "接待台细节", "产品区细节", "会议室细节", "屏幕区细节"],
  outputTags: ["布局白模", "平面布局图", "主视角效果图", "左侧视角", "右侧视角", "顶部鸟瞰", "细节图", "整套多角度", "高清修复", "小红书展示图"],
  qualityTags: ["4K高清", "3ds Max质感", "V-Ray商业渲染", "真实施工可落地", "高清材质", "无AI雾感", "比例准确", "灯光明亮", "画面干净"],
  avoidTags: ["不要AI雾感", "不要比例失真", "不要错误LOGO", "不要模糊文字", "不要不合理结构", "不要封闭两侧", "不要过度科幻", "不要超大屏", "不要杂乱背景", "不要遮挡主屏"],
};

const defaultData = {
  projectName: "",
  brand: "",
  industry: "",
  boothType: "展台/展位",
  width: 18,
  depth: 12,
  area: 216,
  openSides: "三面开口",
  closedSide: "一侧封闭",
  heightLimit: "限高6m",
  topStructure: "无吊顶",
  secondFloor: "无二层",
  promptLang: "中文",
  outputModel: "Nano Banana",
  imageRatio: "16:9",
  styleTags: ["现代简约", "高级商务", "通透开放", "施工可落地"],
  layoutTags: ["开放通透", "三面可视", "动线留白"],
  functionTags: ["接待台", "开放洽谈", "主LED屏", "产品展示台"],
  materialTags: ["白色烤漆地面", "烤漆墙面", "灯箱画面"],
  colorTags: ["品牌标准色", "白色"],
  cameraTags: ["主入口45度"],
  outputTags: ["主视角效果图"],
  qualityTags: ["4K高清", "3ds Max质感", "V-Ray商业渲染", "真实施工可落地", "无AI雾感"],
  avoidTags: ["不要AI雾感", "不要比例失真", "不要错误LOGO", "不要模糊文字"],
  reference: "",
  mustHave: "",
  customNeed: "",
};

const defaultZones = [
  { id: "z1", type: "brand", name: "品牌形象/主画面", x: 1, y: 1, w: 5.5, h: 2.8, content: "品牌LOGO、主视觉、主LED屏或灯箱画面", qty: 1, screen: "主LED屏1块" },
  { id: "z2", type: "reception", name: "接待区", x: 7, y: 9, w: 4, h: 1.8, content: "接待台、资料摆放、入口识别", qty: 1, screen: "无" },
  { id: "z3", type: "talk", name: "开放洽谈区", x: 6.2, y: 4.5, w: 5.2, h: 3.2, content: "圆桌洽谈、开放交流、动线留白", qty: 4, screen: "无" },
  { id: "z4", type: "product", name: "产品展示区A", x: 1.2, y: 4.5, w: 3.8, h: 2.2, content: "核心产品模型、展台、图文说明", qty: 1, screen: "产品电视1台" },
  { id: "z5", type: "product", name: "产品展示区B", x: 1.2, y: 7.4, w: 3.8, h: 2.2, content: "产品模型、互动屏、灯箱说明", qty: 1, screen: "产品电视1台" },
  { id: "z6", type: "meeting", name: "会议室", x: 12.5, y: 1.1, w: 4.5, h: 2.8, content: "封闭洽谈、玻璃隔断、6-8人会议", qty: 1, screen: "可选壁挂屏" },
  { id: "z7", type: "storage", name: "储藏间", x: 12.5, y: 4.5, w: 4.5, h: 1.8, content: "物料储藏、设备间、隐藏门", qty: 1, screen: "无" },
  { id: "z8", type: "bar", name: "吧台/茶歇", x: 12.5, y: 7, w: 4.5, h: 2, content: "饮水、等候、轻服务", qty: 1, screen: "无" },
];

function safe(v, fallback) {
  return v && String(v).trim() ? v : fallback;
}

function join(list, fallback = "未选择") {
  return Array.isArray(list) && list.length ? list.join("、") : fallback;
}

function toggle(list, item) {
  const arr = Array.isArray(list) ? list : [];
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

function formatTime(v) {
  try {
    return new Date(v).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "未记录";
  }
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function pct(v, total) {
  return `${(Number(v || 0) / Math.max(Number(total) || 1, 1)) * 100}%`;
}

function clampZone(zone, w, d) {
  const width = Math.max(Number(w) || 1, 1);
  const depth = Math.max(Number(d) || 1, 1);
  const zw = Math.min(Math.max(Number(zone.w) || 1, 0.5), width);
  const zh = Math.min(Math.max(Number(zone.h) || 1, 0.5), depth);
  const zx = Math.min(Math.max(Number(zone.x) || 0, 0), Math.max(width - zw, 0));
  const zy = Math.min(Math.max(Number(zone.y) || 0, 0), Math.max(depth - zh, 0));
  return { ...zone, x: Number(zx.toFixed(1)), y: Number(zy.toFixed(1)), w: Number(zw.toFixed(1)), h: Number(zh.toFixed(1)) };
}

function getZoneLocationLabel(zone, boothWidth, boothDepth, lang = "zh") {
  const cx = Number(zone.x || 0) + Number(zone.w || 0) / 2;
  const cy = Number(zone.y || 0) + Number(zone.h || 0) / 2;
  const width = Math.max(Number(boothWidth) || 1, 1);
  const depth = Math.max(Number(boothDepth) || 1, 1);

  let horizontal = lang === "en" ? "center" : "中部";
  let vertical = lang === "en" ? "middle" : "中部";

  if (cx < width / 3) horizontal = lang === "en" ? "left" : "左侧";
  else if (cx > width * 2 / 3) horizontal = lang === "en" ? "right" : "右侧";

  if (cy < depth / 3) vertical = lang === "en" ? "front" : "前部";
  else if (cy > depth * 2 / 3) vertical = lang === "en" ? "back" : "后部";

  return lang === "en" ? `${vertical}-${horizontal}` : `${horizontal}${vertical}`;
}

function buildLayoutDescription(zones, boothWidth, boothDepth, lang = "zh") {
  if (!zones.length) return lang === "en" ? "No layout zones yet." : "暂无布局功能块。";

  const sortedZones = [...zones].sort((a, b) => {
    const ay = Number(a.y || 0);
    const by = Number(b.y || 0);
    if (ay !== by) return ay - by;
    return Number(a.x || 0) - Number(b.x || 0);
  });

  return sortedZones.map((z, i) => {
    const typeLabel = zoneTypes[z.type]?.label || "自定义区域";
    const location = getZoneLocationLabel(z, boothWidth, boothDepth, lang);
    if (lang === "en") {
      return `${i + 1}. ${safe(z.name, typeLabel)} (${typeLabel}) is placed in the ${location} area of the booth. Coordinates: ${z.x}m from the left, ${z.y}m from the top. Size: ${z.w}m × ${z.h}m. Main content: ${safe(z.content, "to be filled")}. Screen/equipment: ${safe(z.screen, "none")}. Quantity/capacity: ${z.qty || 1}.`;
    }
    return `${i + 1}. ${safe(z.name, typeLabel)}（${typeLabel}）位于展位${location}，坐标为距左${z.x}m、距上${z.y}m，尺寸为${z.w}m × ${z.h}m，主要内容为：${safe(z.content, "待补充")}，设备/屏幕：${safe(z.screen, "无")}，数量/容量：${z.qty || 1}。`;
  }).join(BR);
}

function buildPrompt(data, zones) {
  const layoutText = buildLayoutDescription(zones, data.width, data.depth, "zh");
  const layoutTextEn = buildLayoutDescription(zones, data.width, data.depth, "en");
  const cn = [
    `请为「${safe(data.brand, "待填写品牌")}」生成「${data.boothType}」AI设计图。`,
    "",
    "【项目基础】",
    `项目名称：${safe(data.projectName, "未命名项目")}`,
    `行业属性：${safe(data.industry, "待填写行业")}`,
    `空间尺寸：${data.width}m × ${data.depth}m，约${data.area}㎡`,
    `开口方向：${data.openSides}`,
    `封闭面：${data.closedSide}`,
    `高度限制：${data.heightLimit}`,
    `顶部结构：${data.topStructure}`,
    `二层要求：${data.secondFloor}`,
    "",
    "【设计条件】",
    `风格标签：${join(data.styleTags)}`,
    `布局标签：${join(data.layoutTags)}`,
    `功能需求：${join(data.functionTags)}`,
    `材料选择：${join(data.materialTags)}`,
    `色彩选择：${join(data.colorTags)}`,
    `镜头视角：${join(data.cameraTags)}`,
    `出图内容：${join(data.outputTags)}`,
    `质量要求：${join(data.qualityTags)}`,
    `负面限制：${join(data.avoidTags)}`,
    "",
    "【平面布局布置说明】",
    "请严格参考以下平面布局进行空间布置，不要随意更改各功能区的大致位置关系、尺寸逻辑和前后左右分布。",
    layoutText,
    "",
    "【布局强约束】",
    "生成效果图时，以当前平面布局图为核心约束，功能块的位置、分区逻辑、动线关系必须尽量一致。",
    "不要重新发明布局，不要随意交换功能区位置，不要打乱平面布局图中的前后左右关系。",
    "入口方向需清晰，接待区、产品区、会议区、吧台区、储藏区、品牌形象区等功能分布要与布局图对应。",
    "",
    "【补充要求】",
    `参考方向：${safe(data.reference, "无")}`,
    `必须满足：${safe(data.mustHave, "严格满足功能区、数量、动线和开口方向")}`,
    `其他补充：${safe(data.customNeed, "无")}`,
    "",
    `AI工具：${data.outputModel}`,
    `画面比例：${data.imageRatio}`,
    "请让画面真实、清晰、高级、可施工，像商业展览公司出品的3D效果图，不要只是概念草图。",
  ].join(BR);

  const en = [
    `Create an AI exhibition design image for ${safe(data.brand, "brand to be filled")}.`,
    `Project: ${safe(data.projectName, "Untitled project")}`,
    `Type: ${data.boothType}`,
    `Industry: ${safe(data.industry, "industry to be filled")}`,
    `Size: ${data.width}m x ${data.depth}m, about ${data.area} sqm`,
    `Open sides: ${data.openSides}`,
    `Closed side: ${data.closedSide}`,
    `Height limit: ${data.heightLimit}`,
    `Top structure: ${data.topStructure}`,
    `Second floor: ${data.secondFloor}`,
    `Style tags: ${join(data.styleTags)}`,
    `Layout tags: ${join(data.layoutTags)}`,
    `Functions: ${join(data.functionTags)}`,
    `Materials: ${join(data.materialTags)}`,
    `Colors: ${join(data.colorTags)}`,
    `Camera views: ${join(data.cameraTags)}`,
    `Quality: ${join(data.qualityTags)}`,
    `Avoid: ${join(data.avoidTags)}`,
    "Floor plan layout arrangement:",
    "Strictly follow the following floor plan layout. Do not randomly change the general position, size logic, left-right distribution, front-back order, or circulation relationship of each functional zone.",
    layoutTextEn,
    "",
    "Layout constraints:",
    "Use the current floor plan as the core spatial constraint. The position, zoning logic, circulation relationship, and area proportion of each functional block should remain as consistent as possible.",
    "Do not reinvent the layout, do not swap functional zone positions randomly, and do not break the front/back/left/right relationships shown in the floor plan.",
    `Reference: ${safe(data.reference, "none")}`,
    `Must-have: ${safe(data.mustHave, "follow all zones and quantities")}`,
    `Extra notes: ${safe(data.customNeed, "none")}`,
    "Make it realistic, high-end, clean, buildable and professional, like a commercial 3D exhibition rendering.",
  ].join(BR);

  if (data.promptLang === "英文") return en;
  if (data.promptLang === "中英双语") return `${cn}${BR}${BR}--- English Prompt ---${BR}${en}`;
  return cn;
}

function buildWorkflow(data, zones) {
  const products = zones.filter((z) => z.type === "product").length;
  const meetings = zones.filter((z) => z.type === "meeting").length;
  const screens = zones.filter((z) => z.type === "screen" || String(z.screen || "").includes("屏")).length;
  return [
    { title: "需求整理", text: `整理品牌、尺寸、开口、限高和结构限制。当前尺寸：${data.width}m × ${data.depth}m，约${data.area}㎡。` },
    { title: "条件组合", text: `确认风格、布局、材料、色彩和负面限制，减少AI跑偏。` },
    { title: "悬浮布局调整", text: `在悬浮窗口内新增、拖动、删除并编辑 ${zones.length} 个功能块。` },
    { title: "功能校验", text: `产品区 ${products} 个，会议室 ${meetings} 个，屏幕相关区域 ${screens} 个。` },
    { title: "生成效果图", text: `用底部提示词生成 ${join(data.outputTags, "主视角效果图")}。` },
    { title: "审核修图", text: `按负面限制修正比例、文字、LOGO、清晰度和AI感。` },
  ];
}

function buildAudit(data, zones) {
  return [
    `尺寸是否接近 ${data.width}m × ${data.depth}m，面积约 ${data.area}㎡？`,
    `开口方向是否为「${data.openSides}」，封闭面是否为「${data.closedSide}」？`,
    `顶部是否满足「${data.topStructure}」，二层是否满足「${data.secondFloor}」？`,
    `悬浮布局中的 ${zones.length} 个功能块是否都出现？`,
    `功能需求是否覆盖：${join(data.functionTags)}？`,
    `风格是否符合：${join(data.styleTags)}？`,
    `材料是否符合：${join(data.materialTags)}？`,
    `是否避开：${join(data.avoidTags)}？`,
  ];
}

async function copyText(text, ref) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    ref.current?.focus();
    ref.current?.select();
    return document.execCommand("copy");
  } catch {
    return false;
  }
}

function Field({ label, value, onChange, type = "text", textarea = false, placeholder = "" }) {
  const cls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100";
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-500">{label}</span>
      {textarea ? <textarea rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-none leading-6`} /> : <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)} className={cls} />}
    </label>
  );
}

function SelectField({ label, value, list, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100">
        {list.map((item) => <option key={item} value={item}>{zoneTypes[item]?.label || item}</option>)}
      </select>
    </label>
  );
}

function MultiSelect({ label, value, list, onChange }) {
  const picked = Array.isArray(value) ? value : [];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-black text-slate-500">{label}</span>
        <button type="button" onClick={() => onChange([])} className="text-xs font-bold text-slate-400 hover:text-slate-700">清空</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((item) => {
          const active = picked.includes(item);
          return <button key={item} type="button" onClick={() => onChange(toggle(picked, item))} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${active ? "border-emerald-500 bg-emerald-600 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>{active ? "✓ " : "+ "}{item}</button>;
        })}
      </div>
    </div>
  );
}

function Pill({ label, value }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="text-[11px] font-bold text-slate-400">{label}</div><div className="mt-1 truncate text-sm font-black text-slate-900">{value}</div></div>;
}

function Section({ title, collapsed, onToggle, children, right }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onToggle} className="flex min-w-0 items-center gap-2 text-left"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-black">{collapsed ? "+" : "−"}</span><h2 className="truncate text-lg font-black">{title}</h2></button>
        <div className="flex items-center gap-2">{right}<button type="button" onClick={onToggle} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{collapsed ? "展开" : "收起"}</button></div>
      </div>
      {!collapsed && <div className="mt-4">{children}</div>}
    </div>
  );
}

function ProjectTable({ projects, activeId, onSave, onNew, onLoad, onDelete }) {
  return (
    <section className="mb-5 rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><div className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">Project Library</div><h2 className="mt-1 text-2xl font-black text-slate-950">项目表</h2><p className="mt-1 text-sm text-slate-500">保存当前项目后，可以快速载入历史方案继续编辑。</p></div><div className="flex flex-wrap gap-2"><button onClick={onNew} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700">新建项目</button><button onClick={onSave} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white">保存当前项目</button></div></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr_160px] bg-slate-50 px-4 py-3 text-xs font-black text-slate-500"><div>项目名称</div><div>品牌</div><div>尺寸</div><div>更新时间</div><div className="text-right">操作</div></div>
        {projects.length === 0 ? <div className="px-4 py-8 text-center text-sm text-slate-400">暂无保存项目</div> : projects.map((p) => <div key={p.id} className={`grid grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr_160px] items-center border-t border-slate-100 px-4 py-3 text-sm ${activeId === p.id ? "bg-emerald-50" : "bg-white"}`}><div className="min-w-0"><div className="truncate font-black">{safe(p.data?.projectName, "未命名项目")}</div><div className="text-xs text-slate-400">{p.zones?.length || 0}个功能块</div></div><div className="truncate text-slate-600">{safe(p.data?.brand, "待填写")}</div><div className="text-slate-600">{p.data?.width}×{p.data?.depth}m</div><div className="text-slate-500">{formatTime(p.updatedAt)}</div><div className="flex justify-end gap-2"><button onClick={() => onLoad(p.id)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-black text-white">载入</button><button onClick={() => onDelete(p.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-500">删除</button></div></div>)}
      </div>
    </section>
  );
}

function PlanCanvas({ data, zones, selectedId, onSelect, meterPx, draggable = false, onMoveZone, onOpen }) {
  const width = Math.max(Number(data.width) || 1, 1);
  const depth = Math.max(Number(data.depth) || 1, 1);
  const px = draggable ? meterPx : Math.max(Math.min(660 / width, 340 / depth), 18);
  const [drag, setDrag] = useState(null);
  const start = (e, z) => {
    e.preventDefault();
    onSelect(z.id);
    if (!draggable) {
      onOpen?.();
      return;
    }
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ id: z.id, sx: e.clientX, sy: e.clientY, x: z.x, y: z.y, w: z.w, h: z.h });
  };
  const move = (e) => {
    if (!drag || !draggable || !onMoveZone) return;
    const nx = Math.min(Math.max(drag.x + (e.clientX - drag.sx) / px, 0), Math.max(width - drag.w, 0));
    const ny = Math.min(Math.max(drag.y + (e.clientY - drag.sy) / px, 0), Math.max(depth - drag.h, 0));
    onMoveZone(drag.id, Number(nx.toFixed(1)), Number(ny.toFixed(1)));
  };
  return (
    <div className={`${draggable ? "flex h-full min-h-[540px]" : "flex h-[390px]"} items-center justify-center overflow-auto rounded-2xl bg-slate-900/60 p-5`}>
      <div onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)} className="relative shrink-0 overflow-hidden rounded-2xl border-4 border-emerald-400 bg-slate-50" style={{ width: `${Math.max(width * px, 120)}px`, height: `${Math.max(depth * px, 80)}px`, backgroundImage: "linear-gradient(90deg, rgba(148,163,184,.35) 1px, transparent 1px), linear-gradient(rgba(148,163,184,.35) 1px, transparent 1px)", backgroundSize: `${px}px ${px}px` }}>
        <div className="absolute left-0 right-0 top-0 z-10 bg-slate-800/90 py-1 text-center text-[11px] font-black text-white">封闭面 / 主形象墙参考</div>
        {zones.map((z) => {
          const style = zoneTypes[z.type] || zoneTypes.custom;
          return <button key={z.id} type="button" onPointerDown={(e) => start(e, z)} className={`absolute touch-none overflow-hidden rounded-2xl border-2 p-2 text-left shadow-md ${draggable ? "cursor-move" : "cursor-pointer"} ${style.border} ${style.color} ${style.text} ${selectedId === z.id ? "ring-4 ring-emerald-400" : ""}`} style={{ left: pct(z.x, width), top: pct(z.y, depth), width: pct(z.w, width), height: pct(z.h, depth) }}><div className="truncate text-xs font-black md:text-sm">{z.name}</div><div className="mt-1 hidden text-[11px] opacity-80 md:block">{style.label}</div><div className="mt-1 hidden text-[11px] opacity-70 lg:block">{z.screen}</div><div className="absolute bottom-1 right-2 rounded-full bg-white/75 px-2 py-0.5 text-[10px] font-black text-slate-700">{z.w}m×{z.h}m</div></button>;
        })}
        {zones.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-center text-slate-400"><div><div className="text-lg font-black">暂无功能块</div><div className="mt-2 text-sm">打开悬浮布局调整添加功能块</div></div></div>}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-xs font-black text-slate-700 shadow">入口 / 主视角方向</div>
      </div>
    </div>
  );
}

function ZoneEditor({ data, zone, style, updateZone, deleteZone }) {
  if (!zone) return <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">请先新增或选择一个功能块</div>;
  return <div className="space-y-3"><div className={`rounded-2xl p-4 ${style.color} ${style.text}`}><div className="text-xs font-bold opacity-70">当前选中</div><div className="mt-1 text-lg font-black">{zone.name}</div></div><Field label="区域名称" value={zone.name} onChange={(v) => updateZone("name", v)} /><SelectField label="区域类型" value={zone.type} list={Object.keys(zoneTypes)} onChange={(v) => updateZone("type", v)} /><Field label="数量/容量" type="number" value={zone.qty} onChange={(v) => updateZone("qty", v)} /><Field label="屏幕/设备" value={zone.screen} onChange={(v) => updateZone("screen", v)} /><Field label="区域内容说明" value={zone.content} onChange={(v) => updateZone("content", v)} textarea /><div className="grid grid-cols-2 gap-2"><Field label="距左/m" type="number" value={zone.x} onChange={(v) => updateZone("x", v)} /><Field label="距上/m" type="number" value={zone.y} onChange={(v) => updateZone("y", v)} /><Field label="宽度/m" type="number" value={zone.w} onChange={(v) => updateZone("w", v)} /><Field label="深度/m" type="number" value={zone.h} onChange={(v) => updateZone("h", v)} /></div><button onClick={deleteZone} className="w-full rounded-2xl bg-rose-50 px-4 py-3 text-sm font-black text-rose-600">删除当前功能块</button></div>;
}

function FloatingEditor({ open, onClose, data, zones, selectedId, onSelect, selectedZone, selectedStyle, updateZone, deleteZone, addZone, meterPx, zoom, setZoom, onMoveZone }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 bg-slate-950/70 p-4 backdrop-blur-sm"><div className="mx-auto flex h-full max-w-[1500px] flex-col overflow-hidden rounded-[30px] bg-white"><div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between"><div><div className="text-xs font-black text-emerald-600">FLOATING PLAN EDITOR</div><h2 className="text-2xl font-black">悬浮布局调整</h2><p className="mt-1 text-sm text-slate-500">功能块的新增、删除、拖动、尺寸、内容全部在这里完成。</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600"><span>缩放</span><input type="range" min="0.6" max="1.8" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-24 accent-emerald-600" /><span>{meterPx}px/m</span></div><button onClick={addZone} className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white">新增功能块</button><button onClick={onClose} className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white">关闭</button></div></div><div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_360px]"><div className="min-h-0 overflow-hidden bg-slate-950 p-4"><PlanCanvas data={data} zones={zones} selectedId={selectedId} onSelect={onSelect} meterPx={meterPx} draggable onMoveZone={onMoveZone} /></div><aside className="min-h-0 overflow-auto border-l border-slate-200 bg-white p-5"><h3 className="mb-4 text-lg font-black">功能块参数</h3><ZoneEditor data={data} zone={selectedZone} style={selectedStyle} updateZone={updateZone} deleteZone={deleteZone} /></aside></div></div></div>;
}

function OutputPanel({ tab, setTab, prompt, workflow, audit, promptRef, copyPrompt, copied, copyError }) {
  return <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center justify-between gap-2"><div><h2 className="text-xl font-black">生成结果</h2><p className="mt-1 text-sm text-slate-500">根据输入和悬浮布局实时生成</p></div><button onClick={copyPrompt} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white">{copied ? "已复制" : copyError ? "手动复制" : "复制"}</button></div><div className="mb-3 grid max-w-[520px] grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1 text-sm font-black"><button onClick={() => setTab("prompt")} className={`rounded-xl px-3 py-2 ${tab === "prompt" ? "bg-white" : "text-slate-500"}`}>提示词</button><button onClick={() => setTab("workflow")} className={`rounded-xl px-3 py-2 ${tab === "workflow" ? "bg-white" : "text-slate-500"}`}>工作流</button><button onClick={() => setTab("audit")} className={`rounded-xl px-3 py-2 ${tab === "audit" ? "bg-white" : "text-slate-500"}`}>审核</button></div>{tab === "prompt" && <><textarea ref={promptRef} value={prompt} onClick={(e) => e.currentTarget.select()} readOnly className="h-[420px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none" /><p className="mt-3 text-center text-xs text-slate-500">复制受限时，点击文本框会全选，再按 Ctrl+C。</p></>}{tab === "workflow" && <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{workflow.map((s, i) => <div key={s.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black text-emerald-700">STEP {i + 1}</div><div className="mt-1 font-black">{s.title}</div><p className="mt-2 text-sm leading-6 text-slate-600">{s.text}</p></div>)}</div>}{tab === "audit" && <div className="grid gap-2 md:grid-cols-2">{audit.map((a, i) => <div key={a} className="flex gap-3 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-black text-white">{i + 1}</span><span>{a}</span></div>)}</div>}</section>;
}

export default function AIExhibitionWorkflowTool() {
  const [data, setData] = useState(clone(defaultData));
  const [zones, setZones] = useState(clone(defaultZones));
  const [selectedId, setSelectedId] = useState(defaultZones[0].id);
  const [tab, setTab] = useState("prompt");
  const [zoom, setZoom] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [collapsed, setCollapsed] = useState({ s1: true, s2: true, s3: true, s4: true });
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projects, setProjects] = useState(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const promptRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const selectedZone = zones.find((z) => z.id === selectedId) || null;
  const selectedStyle = selectedZone ? zoneTypes[selectedZone.type] || zoneTypes.custom : zoneTypes.custom;
  const basePx = useMemo(() => {
    const r = Math.max(Number(data.width) || 1, 1) / Math.max(Number(data.depth) || 1, 1);
    if (r >= 3 || r <= 0.35) return 86;
    if (data.width > 24 || data.depth > 18) return 38;
    if (data.width > 18 || data.depth > 14) return 44;
    return 54;
  }, [data.width, data.depth]);
  const meterPx = Math.round(basePx * zoom);
  const prompt = useMemo(() => buildPrompt(data, zones), [data, zones]);
  const workflow = useMemo(() => buildWorkflow(data, zones), [data, zones]);
  const audit = useMemo(() => buildAudit(data, zones), [data, zones]);

  const updateData = (key, value) => {
    let width = key === "width" ? Math.max(Number(value) || 1, 1) : Number(data.width) || 1;
    let depth = key === "depth" ? Math.max(Number(value) || 1, 1) : Number(data.depth) || 1;
    if (key === "area") depth = Number((Math.max(Number(value) || 1, 1) / width).toFixed(1));
    setData((old) => {
      const next = { ...old, [key]: value };
      if (["width", "depth", "area"].includes(key)) {
        next.width = width;
        next.depth = depth;
        next.area = Number((width * depth).toFixed(1));
      }
      return next;
    });
    if (["width", "depth", "area"].includes(key)) setZones((old) => old.map((z) => clampZone(z, width, depth)));
  };

  const updateZone = (key, value) => {
    if (!selectedZone) return;
    setZones((old) => old.map((z) => z.id === selectedZone.id ? clampZone({ ...z, [key]: value }, data.width, data.depth) : z));
  };
  const moveZone = (id, x, y) => setZones((old) => old.map((z) => z.id === id ? clampZone({ ...z, x, y }, data.width, data.depth) : z));
  const addZone = () => {
    const id = `z${Date.now()}`;
    setZones((old) => [...old, clampZone({ id, type: "custom", name: "新功能区", x: 1, y: 1, w: Math.min(3, data.width), h: Math.min(2, data.depth), content: "填写该区域展示内容、功能和设计要求", qty: 1, screen: "按需填写" }, data.width, data.depth)]);
    setSelectedId(id);
    setModalOpen(true);
  };
  const deleteZone = () => {
    if (!selectedZone) return;
    const rest = zones.filter((z) => z.id !== selectedZone.id);
    setZones(rest);
    setSelectedId(rest[0]?.id || "");
  };
  const saveProject = () => {
    const id = activeProjectId || `p${Date.now()}`;
    const item = { id, updatedAt: new Date().toISOString(), data: { ...data, projectName: safe(data.projectName, `未命名项目 ${projects.length + 1}`) }, zones };
    setData(item.data);
    setActiveProjectId(id);
    setProjects((old) => [item, ...old.filter((p) => p.id !== id)]);
  };
  const newProject = () => { setData(clone(defaultData)); setZones(clone(defaultZones)); setSelectedId(defaultZones[0].id); setActiveProjectId(null); setModalOpen(false); };
  const loadProject = (id) => { const p = projects.find((x) => x.id === id); if (!p) return; setData(p.data); setZones(p.zones || []); setSelectedId(p.zones?.[0]?.id || ""); setActiveProjectId(id); };
  const deleteProject = (id) => { setProjects((old) => old.filter((p) => p.id !== id)); if (activeProjectId === id) setActiveProjectId(null); };
  const clearAll = () => { setData(clone(defaultData)); setZones([]); setSelectedId(""); setActiveProjectId(null); };
  const loadStarter = () => { const next = clone(defaultZones).map((z) => clampZone(z, data.width, data.depth)); setZones(next); setSelectedId(next[0]?.id || ""); setModalOpen(true); };
  const doCopy = async () => { const ok = await copyText(prompt, promptRef); setCopied(ok); setCopyError(!ok); setTimeout(() => { setCopied(false); setCopyError(false); }, 1400); };

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6">
        <header className="mb-5 rounded-[24px] border border-slate-200 bg-white p-5 md:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><div><div className="mb-3 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">AI Exhibition Workflow Builder</div><h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">AI 展览工作流工具</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">左侧录入需求，中间只读预览布局，功能块全部进入悬浮布局调整窗口里编辑。</p></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:w-[620px]"><Pill label="项目" value={safe(data.projectName, "未命名")} /><Pill label="品牌" value={safe(data.brand, "待填写")} /><Pill label="面积" value={`${data.area}㎡`} /><Pill label="功能区" value={`${zones.length}个`} /></div></div>
        </header>

        <ProjectTable projects={projects} activeId={activeProjectId} onSave={saveProject} onNew={newProject} onLoad={loadProject} onDelete={deleteProject} />

        <main className="grid min-w-0 gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
          <section className="space-y-5">
            <Section title="1. 项目基础" collapsed={collapsed.s1} onToggle={() => setCollapsed((o) => ({ ...o, s1: !o.s1 }))} right={<button onClick={clearAll} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">清空</button>}><div className="space-y-3"><Field label="项目名称" value={data.projectName} onChange={(v) => updateData("projectName", v)} /><Field label="品牌名称" value={data.brand} onChange={(v) => updateData("brand", v)} /><Field label="行业属性" value={data.industry} onChange={(v) => updateData("industry", v)} /><SelectField label="项目类型" value={data.boothType} list={options.boothType} onChange={(v) => updateData("boothType", v)} /><div className="grid grid-cols-3 gap-2"><Field label="宽/m" type="number" value={data.width} onChange={(v) => updateData("width", v)} /><Field label="深/m" type="number" value={data.depth} onChange={(v) => updateData("depth", v)} /><Field label="面积/㎡" type="number" value={data.area} onChange={(v) => updateData("area", v)} /></div><SelectField label="开口方向" value={data.openSides} list={options.openSides} onChange={(v) => updateData("openSides", v)} /><Field label="封闭面说明" value={data.closedSide} onChange={(v) => updateData("closedSide", v)} /><Field label="高度限制" value={data.heightLimit} onChange={(v) => updateData("heightLimit", v)} /><SelectField label="顶部结构" value={data.topStructure} list={options.topStructure} onChange={(v) => updateData("topStructure", v)} /><SelectField label="二层要求" value={data.secondFloor} list={options.secondFloor} onChange={(v) => updateData("secondFloor", v)} /></div></Section>
            <Section title="2. 多选设计条件" collapsed={collapsed.s2} onToggle={() => setCollapsed((o) => ({ ...o, s2: !o.s2 }))}><div className="space-y-3"><MultiSelect label="风格标签" value={data.styleTags} list={options.styleTags} onChange={(v) => updateData("styleTags", v)} /><MultiSelect label="布局标签" value={data.layoutTags} list={options.layoutTags} onChange={(v) => updateData("layoutTags", v)} /><MultiSelect label="功能需求" value={data.functionTags} list={options.functionTags} onChange={(v) => updateData("functionTags", v)} /><MultiSelect label="材料选择" value={data.materialTags} list={options.materialTags} onChange={(v) => updateData("materialTags", v)} /><MultiSelect label="色彩选择" value={data.colorTags} list={options.colorTags} onChange={(v) => updateData("colorTags", v)} /><MultiSelect label="质量要求" value={data.qualityTags} list={options.qualityTags} onChange={(v) => updateData("qualityTags", v)} /><MultiSelect label="负面限制" value={data.avoidTags} list={options.avoidTags} onChange={(v) => updateData("avoidTags", v)} /></div></Section>
            <Section title="3. 出图设置" collapsed={collapsed.s3} onToggle={() => setCollapsed((o) => ({ ...o, s3: !o.s3 }))}><div className="space-y-3"><SelectField label="AI工具" value={data.outputModel} list={options.outputModel} onChange={(v) => updateData("outputModel", v)} /><SelectField label="提示词语言" value={data.promptLang} list={options.promptLang} onChange={(v) => updateData("promptLang", v)} /><SelectField label="画面比例" value={data.imageRatio} list={options.imageRatio} onChange={(v) => updateData("imageRatio", v)} /><MultiSelect label="镜头视角" value={data.cameraTags} list={options.cameraTags} onChange={(v) => updateData("cameraTags", v)} /><MultiSelect label="出图内容" value={data.outputTags} list={options.outputTags} onChange={(v) => updateData("outputTags", v)} /><Field label="参考方向" value={data.reference} onChange={(v) => updateData("reference", v)} textarea /><Field label="必须满足" value={data.mustHave} onChange={(v) => updateData("mustHave", v)} textarea /><Field label="其他补充" value={data.customNeed} onChange={(v) => updateData("customNeed", v)} textarea /></div></Section>
            <Section title="4. 布局说明" collapsed={collapsed.s4} onToggle={() => setCollapsed((o) => ({ ...o, s4: !o.s4 }))}><div className="space-y-3 text-sm leading-6 text-slate-600"><div className="rounded-2xl bg-emerald-50 p-4 text-emerald-900">功能块编辑已经全部移动到悬浮布局调整里。</div><div className="rounded-2xl bg-slate-50 p-4">主页面只保留布局预览，新增、删除、拖动、改名称、改尺寸、改内容都在悬浮窗口中完成。</div></div></Section>
          </section>

          <section className="min-w-0 space-y-5"><div className="rounded-[24px] border border-slate-200 bg-white p-5"><div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-black">5. 平面布局预览</h2><p className="mt-1 text-sm text-slate-500">这里仅做只读预览；点击任意色块会打开悬浮布局调整窗口。</p></div><div className="flex gap-2"><button onClick={() => setModalOpen(true)} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white">打开悬浮布局调整</button><button onClick={loadStarter} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700">载入通用布局</button></div></div><div className="rounded-[22px] bg-slate-950 p-4"><div className="mb-3 flex items-center justify-between text-xs font-bold text-white/70"><span>预览</span><span>{data.width}m × {data.depth}m / 每格1m × 1m</span><span>{zones.length}个功能块</span></div><PlanCanvas data={data} zones={zones} selectedId={selectedId} onSelect={setSelectedId} meterPx={meterPx} onOpen={() => setModalOpen(true)} /><div className="mt-3 rounded-2xl bg-white/10 p-3 text-xs leading-5 text-white/75">主页面只预览。新增、删除、拖动、改尺寸、改内容都在悬浮布局调整窗口里完成。</div></div></div><div className="rounded-[24px] border border-slate-200 bg-white p-5"><h2 className="mb-4 text-xl font-black">6. 自动工作流</h2><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{workflow.map((s, i) => <div key={s.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">{i + 1}</div><div className="font-black">{s.title}</div><p className="mt-2 text-xs leading-5 text-slate-600">{s.text}</p></div>)}</div></div></section>
        </main>

        <OutputPanel tab={tab} setTab={setTab} prompt={prompt} workflow={workflow} audit={audit} promptRef={promptRef} copyPrompt={doCopy} copied={copied} copyError={copyError} />
      </div>

      <FloatingEditor open={modalOpen} onClose={() => setModalOpen(false)} data={data} zones={zones} selectedId={selectedId} onSelect={setSelectedId} selectedZone={selectedZone} selectedStyle={selectedStyle} updateZone={updateZone} deleteZone={deleteZone} addZone={addZone} meterPx={meterPx} zoom={zoom} setZoom={setZoom} onMoveZone={moveZone} />
    </div>
  );
}
