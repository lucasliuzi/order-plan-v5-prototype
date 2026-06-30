import { useMemo, useState } from "react";
import {
  ApartmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  FileSearchOutlined,
  InboxOutlined,
  LeftOutlined,
  MenuFoldOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  SendOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";

const initialPlans = [
  {
    id: "RP202606220001",
    date: "2026-06-22",
    region: "华北",
    warehouse: "北京RDC",
    category: "乳品",
    method: "厂家直采",
    skuCount: 46,
    status: "待确认计划",
    snapshot: "—",
    external: "—",
    updated: "09:00",
    planner: "张三",
    suggestionQty: 2860,
    confirmQty: 1860,
    confirmedSku: 28,
    changedSku: 18,
    executionNo: 0,
  },
  {
    id: "RP202606220002",
    date: "2026-06-22",
    region: "华北",
    warehouse: "天津RDC",
    category: "常温饮料",
    method: "区采",
    skuCount: 70,
    status: "待确认计划",
    snapshot: "—",
    external: "—",
    updated: "09:15",
    planner: "张三",
    suggestionQty: 6280,
    confirmQty: 3200,
    confirmedSku: 42,
    changedSku: 42,
    executionNo: 0,
  },
  {
    id: "RP202606220004",
    date: "2026-06-22",
    region: "华北",
    warehouse: "郑州RDC",
    category: "休闲食品",
    method: "区采",
    skuCount: 41,
    status: "已截标",
    snapshot: "V2",
    external: "2个竞标任务",
    updated: "13:40",
    planner: "李四",
    suggestionQty: 2520,
    confirmQty: 2140,
    confirmedSku: 35,
    changedSku: 9,
    bidQty: 2060,
    manualBidQty: 1380,
    manualBidSku: 23,
    suppliers: 4,
    abnormalSku: 0,
    syncStatus: "已同步",
    lastSyncedAt: "2026-06-22 13:40",
    newSkuCount: 2,
    newSkuQty: 120,
    bidBatches: [
      { batch: "FB01", task: "BID260622004A", sku: 35, qty: 2140, deadline: "2026-06-22 11:30", status: "已截标" },
      { batch: "FB02", task: "BID260622004B", sku: 4, qty: 260, deadline: "2026-06-22 12:30", status: "已截标" },
    ],
    executionNo: 0,
  },
  {
    id: "RP202606220005",
    date: "2026-06-22",
    region: "华北",
    warehouse: "石家庄RDC",
    category: "酒水",
    method: "厂家直采",
    skuCount: 35,
    status: "已取消",
    snapshot: "V1",
    external: "执行批次 EX01 已取消",
    updated: "17:05",
    planner: "李四",
    suggestionQty: 2200,
    confirmQty: 0,
    confirmedSku: 0,
    changedSku: 8,
    latestSheetQty: 2460,
    latestSheetSku: 33,
    latestSheetTotalSku: 37,
    resetStatus: "已重置",
    executionNo: 1,
    executionBatch: "EX01",
    orders: [
      { no: "PO2606220003", supplier: "河北优选商贸", sku: 16, amount: 23800, status: "已取消" },
      { no: "PO2606220004", supplier: "石家庄华盛供应链", sku: 15, amount: 21100, status: "已取消" },
    ],
  },
];

const statusStyle = {
  待确认计划: "warning",
  竞标中: "processing",
  已截标: "warning",
  建单中: "processing",
  已建单: "success",
  部分成功: "warning",
  执行失败: "danger",
  部分取消: "muted",
  已取消: "muted",
};

function statusAction(plan) {
  if (plan.status === "待确认计划") {
    return plan.method === "厂家直采"
      ? { label: "确认计划并下单", icon: <ShoppingCartOutlined /> }
      : { label: "确认计划并发起竞标", icon: <SendOutlined /> };
  }
  if (plan.status === "已截标") {
    return plan.syncStatus === "已同步"
      ? { label: "确认中标并下单", icon: <ShoppingCartOutlined /> }
      : { label: plan.syncStatus === "同步失败" ? "重试同步" : "同步中标结果", icon: <ReloadOutlined /> };
  }
  if (plan.status === "已取消") {
    return { label: "再次下单", icon: <ShoppingCartOutlined /> };
  }
  return {
    竞标中: { label: "查看竞标", icon: <FileSearchOutlined /> },
    建单中: { label: "查询建单结果", icon: <ReloadOutlined /> },
    已建单: { label: "查看订单", icon: <FileSearchOutlined /> },
    部分成功: { label: "查看处理结果", icon: <FileSearchOutlined /> },
    执行失败: { label: "查看失败原因", icon: <ExclamationCircleOutlined /> },
    部分取消: { label: "查看订单", icon: <FileSearchOutlined /> },
  }[plan.status];
}

function primaryDisabledReason(plan) {
  return "";
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("zh-CN");
}

function StatusTag({ status }) {
  return <span className={`status-tag ${statusStyle[status] || "muted"}`}>{status}</span>;
}

function hasBidResultSheet(plan) {
  return plan.method === "区采"
    && Boolean(plan.bidSnapshot || plan.bidQty !== undefined || plan.syncStatus === "已同步");
}

function IconButton({ title, children, onClick, className = "" }) {
  return (
    <button className={`icon-button ${className}`} title={title} aria-label={title} onClick={onClick}>
      {children}
    </button>
  );
}

function Modal({ title, children, confirmText, onConfirm, onClose, danger = false, disabled = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <IconButton title="关闭" onClick={onClose}><CloseOutlined /></IconButton>
        </header>
        <div className="modal-body">{children}</div>
        <footer className="modal-footer">
          <button className="button secondary" onClick={onClose}>取消</button>
          <button className={`button ${danger ? "danger-button" : "primary"}`} disabled={disabled} onClick={onConfirm}>
            {confirmText}
          </button>
        </footer>
      </section>
    </div>
  );
}

export function App() {
  const [plans, setPlans] = useState(initialPlans);
  const [selectedId, setSelectedId] = useState(initialPlans[1].id);
  const [collapsed, setCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "2026-06-22", dateTo: "2026-06-22", warehouse: "全部", category: "全部", method: "全部", status: "全部", id: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [modal, setModal] = useState(null);
  const [flowOpen, setFlowOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [deadline, setDeadline] = useState("2026-06-22T17:30");
  const [syncingId, setSyncingId] = useState(null);
  const [readingKey, setReadingKey] = useState(null);

  const selected = plans.find((plan) => plan.id === selectedId) || plans[0];
  const filteredPlans = useMemo(() => plans.filter((plan) => {
    return (!appliedFilters.dateFrom || plan.date >= appliedFilters.dateFrom)
      && (!appliedFilters.dateTo || plan.date <= appliedFilters.dateTo)
      && (appliedFilters.warehouse === "全部" || plan.warehouse === appliedFilters.warehouse)
      && (appliedFilters.category === "全部" || plan.category === appliedFilters.category)
      && (appliedFilters.method === "全部" || plan.method === appliedFilters.method)
      && (appliedFilters.status === "全部" || plan.status === appliedFilters.status)
      && (!appliedFilters.id || plan.id.includes(appliedFilters.id.trim()));
  }), [plans, appliedFilters]);

  function notify(message) {
    setToast(message);
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(""), 2600);
  }

  function updatePlan(id, patch) {
    setPlans((current) => current.map((plan) => plan.id === id ? { ...plan, ...patch } : plan));
  }

  function openFeishu(plan = selected, sheet = "plan") {
    const sheetName = sheet === "bid" ? "中标结果 Sheet" : "计划明细 Sheet";
    notify(`已打开 ${plan.id} 的飞书电子表格 · ${sheetName}（原型模拟）`);
  }

  function readFeishuThen(plan, type, nextModal) {
    const key = `${plan.id}:${type}`;
    if (readingKey) return;
    setSelectedId(plan.id);
    setReadingKey(key);
    window.setTimeout(() => {
      if (type === "plan" && (!plan.confirmedSku || plan.confirmQty <= 0)) {
        setReadingKey(null);
        notify("当前没有可执行的订货商品，请先在飞书表格填写人工确认量");
        return;
      }
      if (type === "bid" && (!plan.manualBidSku || plan.manualBidQty <= 0)) {
        setReadingKey(null);
        notify("当前没有可下单的中标商品，请先在中标结果 Sheet 填写人工确认量");
        return;
      }
      if (type === "rebid" && (!plan.newSkuCount || plan.newSkuCount <= 0)) {
        setReadingKey(null);
        notify("未发现新增待发标 SKU，本次未创建竞标任务");
        return;
      }
      setReadingKey(null);
      setModal(nextModal);
    }, 650);
  }

  function handlePrimary(plan) {
    setSelectedId(plan.id);
    const disabledReason = primaryDisabledReason(plan);
    if (disabledReason) {
      notify(disabledReason);
      return;
    }
    if (plan.status === "待确认计划") {
      readFeishuThen(plan, "plan", plan.method === "厂家直采" ? "confirm-direct" : "confirm-and-bid");
    }
    else if (plan.status === "竞标中") setModal("view-bid");
    else if (plan.status === "已截标" && plan.syncStatus === "已同步") readFeishuThen(plan, "bid", "confirm-bid-and-order");
    else if (plan.status === "已截标") syncBidResult(plan);
    else if (plan.status === "建单中") setModal("query-order");
    else if (plan.status === "已取消") readLatestForReorder(plan);
    else if (["已建单", "部分成功", "部分取消"].includes(plan.status)) setModal("orders");
    else if (plan.status === "执行失败") setModal("failure");
  }

  function nextSnapshot(plan) {
    const currentVersion = Number(String(plan.snapshot || "V0").replace("V", "")) || 0;
    return `V${currentVersion + 1}`;
  }

  function nextExecutionBatch(plan) {
    return `EX${String((plan.executionNo || 0) + 1).padStart(2, "0")}`;
  }

  function nextBidBatch(plan) {
    return `FB${String((plan.bidBatches?.length || 0) + 1).padStart(2, "0")}`;
  }

  function buildPendingOrders(plan, count = 2) {
    return Array.from({ length: Math.min(count, 3) }, (_, index) => ({
      no: `PO26062200${20 + index}`,
      supplier: ["华北优选供应链", "北京兴盛商贸", "天津鲜达供应链"][index],
      sku: Math.max(8, Math.round(plan.skuCount / 3)),
      amount: Math.round((plan.amount || 58300) / Math.min(count, 3)),
      status: "可取消",
    }));
  }

  function confirmDirectOrder() {
    const snapshot = nextSnapshot(selected);
    const executionBatch = nextExecutionBatch(selected);
    const pendingOrders = buildPendingOrders(selected, selected.estimatedOrders || 2);
    updatePlan(selected.id, {
      status: "建单中",
      snapshot,
      executionBatch,
      executionNo: (selected.executionNo || 0) + 1,
      pendingOrders,
      external: `REQ${selected.id.slice(-6)}`,
      updated: "14:32",
    });
    setModal(null);
    notify(`计划快照 ${snapshot} 与执行批次 ${executionBatch} 已保存，建单请求已提交`);
  }

  function confirmPlanAndStartBid() {
    const snapshot = nextSnapshot(selected);
    const batch = nextBidBatch(selected);
    const readableDeadline = deadline.replace("T", " ");
    const task = `BID${selected.id.slice(-6)}${batch.slice(-2)}`;
    const bidBatches = [...(selected.bidBatches || []), {
      batch,
      task,
      sku: selected.confirmedSku,
      qty: selected.confirmQty,
      deadline: readableDeadline,
      status: "竞标中",
    }];
    updatePlan(selected.id, {
      status: "竞标中",
      snapshot,
      external: `${bidBatches.length}个竞标任务`,
      deadline: readableDeadline,
      bidBatches,
      newSkuCount: 0,
      newSkuQty: 0,
      updated: "14:32",
    });
    setModal(null);
    notify(`计划快照 ${snapshot} 与发标批次 ${batch} 已保存，竞标任务创建成功`);
  }

  function rebid() {
    const snapshot = nextSnapshot(selected);
    const batch = nextBidBatch(selected);
    const readableDeadline = deadline.replace("T", " ");
    const task = `BID${selected.id.slice(-6)}${batch.slice(-2)}`;
    const bidBatches = [...(selected.bidBatches || []), {
      batch,
      task,
      sku: selected.newSkuCount,
      qty: selected.newSkuQty,
      deadline: readableDeadline,
      status: "竞标中",
    }];
    updatePlan(selected.id, {
      status: "竞标中",
      snapshot,
      external: `${bidBatches.length}个竞标任务`,
      bidBatches,
      newSkuCount: 0,
      newSkuQty: 0,
      syncStatus: selected.syncStatus === "已同步" ? "待补充同步" : selected.syncStatus,
      updated: "14:45",
    });
    setModal(null);
    notify(`仅新增 SKU 已进入发标批次 ${batch}，历史已发标 SKU 已排除`);
  }

  function syncBidResult(plan = selected) {
    if (syncingId) return;
    setSelectedId(plan.id);
    setSyncingId(plan.id);
    window.setTimeout(() => {
      updatePlan(plan.id, {
        syncStatus: "已同步",
        bidQty: plan.bidQty ?? plan.confirmQty,
        manualBidQty: plan.manualBidQty ?? 0,
        manualBidSku: plan.manualBidSku ?? 0,
        suppliers: plan.suppliers || 5,
        abnormalSku: plan.abnormalSku || 0,
        lastSyncedAt: "2026-06-22 14:40",
        updated: "14:40",
      });
      setSyncingId(null);
      notify("中标结果已同步到同一飞书电子表格的“中标结果”Sheet");
    }, 700);
  }

  function confirmBidAndOrder() {
    const executionBatch = nextExecutionBatch(selected);
    const pendingOrders = buildPendingOrders(selected, selected.suppliers || 2);
    updatePlan(selected.id, {
      status: "建单中",
      bidSnapshot: `B${(selected.executionNo || 0) + 1}`,
      executionBatch,
      executionNo: (selected.executionNo || 0) + 1,
      estimatedOrders: selected.suppliers || 2,
      pendingOrders,
      external: `REQ${selected.id.slice(-6)}`,
      updated: "16:50",
    });
    setModal(null);
    notify(`中标结果快照已保存，执行批次 ${executionBatch} 建单请求已提交`);
  }

  function readLatestForReorder(plan) {
    if (readingKey) return;
    const key = `${plan.id}:reorder`;
    setSelectedId(plan.id);
    setReadingKey(key);
    window.setTimeout(() => {
      setReadingKey(null);
      setModal("reorder");
    }, 650);
  }

  function reorderWithLatest() {
    const plan = selected;
    const executionBatch = nextExecutionBatch(plan);
    const latestSku = plan.latestSheetSku ?? (plan.method === "区采" ? plan.manualBidSku : plan.confirmedSku) ?? 0;
    const latestQty = plan.latestSheetQty ?? (plan.method === "区采" ? plan.manualBidQty : plan.confirmQty) ?? 0;
    const latestTotalSku = plan.latestSheetTotalSku ?? plan.skuCount;
    const snapshot = plan.method === "区采"
      ? `B${(plan.executionNo || 0) + 1}`
      : nextSnapshot(plan);
    const pendingOrders = buildPendingOrders(
      { ...plan, skuCount: latestTotalSku },
      plan.orders?.length || plan.suppliers || 2,
    );
    updatePlan(plan.id, {
      status: "建单中",
      snapshot: plan.method === "厂家直采" ? snapshot : plan.snapshot,
      bidSnapshot: plan.method === "区采" ? snapshot : plan.bidSnapshot,
      skuCount: latestTotalSku,
      confirmQty: plan.method === "厂家直采" ? latestQty : plan.confirmQty,
      confirmedSku: plan.method === "厂家直采" ? latestSku : plan.confirmedSku,
      manualBidQty: plan.method === "区采" ? latestQty : plan.manualBidQty,
      manualBidSku: plan.method === "区采" ? latestSku : plan.manualBidSku,
      executionBatch,
      executionNo: (plan.executionNo || 0) + 1,
      pendingOrders,
      external: `REQ${plan.id.slice(-6)}R${(plan.executionNo || 0) + 1}`,
      updated: "17:20",
    });
    setModal(null);
    notify(`已读取飞书最新数据并保存快照 ${snapshot}，执行批次 ${executionBatch} 建单请求已提交`);
  }

  const deadlineValid = deadline > "2026-06-22T15:00" && deadline <= "2026-06-22T23:59";

  function queryOrder() {
    const orders = selected.pendingOrders || [
      { no: "PO2606220026", supplier: "北京冻品直供", sku: 16, amount: 24800, status: "可取消" },
      { no: "PO2606220027", supplier: "华北冷链供应链", sku: 12, amount: 21700, status: "可取消" },
    ];
    updatePlan(selected.id, {
      status: "已建单",
      orders,
      pendingOrders: undefined,
      external: `${orders.length}个采购订单`,
      updated: "16:55",
    });
    setModal(null);
    notify("已取得建单结果，返回 2 个采购订单号");
  }

  function cancelExecutionBatch() {
    const orders = (selected.orders || []).map((order) => ({ ...order, status: "已取消" }));
    updatePlan(selected.id, {
      orders,
      status: "已取消",
      resetStatus: "已重置",
      confirmQty: selected.method === "厂家直采" ? 0 : selected.confirmQty,
      confirmedSku: selected.method === "厂家直采" ? 0 : selected.confirmedSku,
      manualBidQty: selected.method === "区采" ? 0 : selected.manualBidQty,
      manualBidSku: selected.method === "区采" ? 0 : selected.manualBidSku,
      external: `执行批次 ${selected.executionBatch} 已取消`,
      updated: "17:05",
    });
    setModal(null);
    notify(`执行批次 ${selected.executionBatch} 已全量取消，人工确认量已重置为 0`);
  }

  function showRebid(plan) {
    return plan.method === "区采"
      && ["竞标中", "已截标"].includes(plan.status)
      && (plan.executionNo || 0) === 0;
  }

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <InboxOutlined className="brand-icon" />
          {!collapsed && <span>RDC订货执行台</span>}
        </div>
        <nav>
          <button className="nav-item active">
            <UnorderedListOutlined />
            {!collapsed && <span>订货计划</span>}
          </button>
        </nav>
        <button className="sidebar-toggle" onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? <RightOutlined /> : <LeftOutlined />}
          {!collapsed && <span>收起</span>}
        </button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="page-title">
            <IconButton title="收起侧边栏" onClick={() => setCollapsed((value) => !value)}>
              <MenuFoldOutlined />
            </IconButton>
            <h1>订货计划</h1>
          </div>
          <div className="top-context">
            <button className="context-control"><CalendarOutlined /> 2026-06-22</button>
            <span className="context-control">所属区域：华北</span>
            <button className="context-control">张三（计划员） <DownOutlined /></button>
            <span className="avatar"><UserOutlined /></span>
            <span className="user-name">张三</span>
            <DownOutlined className="tiny" />
          </div>
        </header>

        <div className="content">
          <section className="filter-panel">
            <label className="date-range-filter">计划日期
              <span className="date-range-inputs">
                <input type="date" aria-label="开始日期" value={filters.dateFrom} onInput={(e) => setFilters({ ...filters, dateFrom: e.currentTarget.value })} />
                <span>至</span>
                <input type="date" aria-label="结束日期" value={filters.dateTo} onInput={(e) => setFilters({ ...filters, dateTo: e.currentTarget.value })} />
              </span>
            </label>
            <label>仓库
              <select value={filters.warehouse} onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}>
                <option>全部</option><option>北京RDC</option><option>天津RDC</option><option>石家庄RDC</option>
                <option>太原RDC</option><option>济南RDC</option><option>郑州RDC</option>
              </select>
            </label>
            <label>采购品类
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                <option>全部</option>{[...new Set(initialPlans.map((plan) => plan.category))].map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>采购方式
              <select value={filters.method} onChange={(e) => setFilters({ ...filters, method: e.target.value })}>
                <option>全部</option><option>区采</option><option>厂家直采</option>
              </select>
            </label>
            <label>计划状态
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option>全部</option>{Object.keys(statusStyle).map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="id-filter">计划单号
              <input placeholder="请输入计划单号" value={filters.id} onChange={(e) => setFilters({ ...filters, id: e.target.value })} />
            </label>
            <div className="filter-actions">
              <button className="button primary" onClick={() => {
                if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
                  notify("开始日期不能晚于结束日期");
                  return;
                }
                setAppliedFilters(filters);
              }}><SearchOutlined />查询</button>
              <button className="button secondary" onClick={() => {
                const reset = { dateFrom: "2026-06-22", dateTo: "2026-06-22", warehouse: "全部", category: "全部", method: "全部", status: "全部", id: "" };
                setFilters(reset); setAppliedFilters(reset);
              }}>重置</button>
            </div>
          </section>

          <section className="table-panel">
            <div className="table-toolbar">
              <span>共 {filteredPlans.length} 条计划</span>
              <div>
                <button className="text-button" onClick={() => setFlowOpen(true)}><ApartmentOutlined />状态流程</button>
                <button className="text-button" onClick={() => notify("数据已刷新")}><ReloadOutlined />刷新</button>
                <button className="text-button" onClick={() => notify("当前筛选结果已导出（原型模拟）")}><ExportOutlined />导出</button>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>计划日期</th><th>计划单号</th><th>仓库</th><th>采购方式</th>
                    <th>SKU数</th><th>当前状态</th><th>飞书表格</th><th>外部单据</th><th>更新时间</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan) => {
                    const rowAction = statusAction(plan);
                    const primaryReason = primaryDisabledReason(plan);
                    const primaryReading = readingKey === `${plan.id}:plan`
                      || readingKey === `${plan.id}:bid`
                      || readingKey === `${plan.id}:reorder`;
                    const rebidReading = readingKey === `${plan.id}:rebid`;
                    const rowBusy = syncingId === plan.id || readingKey?.startsWith(`${plan.id}:`);
                    return (
                      <tr key={plan.id}>
                        <td>{plan.date}</td>
                        <td>{plan.id}</td>
                        <td>{plan.warehouse}</td>
                        <td>{plan.method}</td>
                        <td className="number-cell">{plan.skuCount}</td>
                        <td>
                          <div className="status-stack">
                            <StatusTag status={plan.status} />
                            {plan.status === "已截标" && (
                              <small className={`sync-state ${plan.syncStatus === "同步失败" ? "failed" : ""}`}>
                                中标结果：{plan.syncStatus || "未同步"}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <button className="link-button" onClick={(e) => {
                            e.stopPropagation();
                            openFeishu(plan, hasBidResultSheet(plan) ? "bid" : "plan");
                          }}>飞书表格 <ExportOutlined /></button>
                        </td>
                        <td>{plan.external}</td>
                        <td>{plan.date} {plan.updated}</td>
                        <td>
                          <div className="row-actions">
                            <span className="action-wrapper" title={primaryReason || (primaryReading ? "正在读取飞书最新数据" : rowAction.label)}>
                              <button
                                className="row-primary"
                                disabled={rowBusy || Boolean(primaryReason)}
                                onClick={() => handlePrimary(plan)}
                              >
                                {syncingId === plan.id || primaryReading ? <ReloadOutlined /> : rowAction.icon}
                                {syncingId === plan.id ? "同步中" : primaryReading ? "读取中" : rowAction.label}
                              </button>
                            </span>
                            {showRebid(plan) && (
                              <span className="action-wrapper" title={rebidReading ? "正在读取飞书并比对已发标 SKU" : "点击后读取飞书，仅对当日新增且未成功发标的 SKU 发标"}>
                                <button
                                  className="row-secondary"
                                  disabled={rowBusy}
                                  onClick={() => {
                                    readFeishuThen(plan, "rebid", "rebid");
                                  }}
                                >{rebidReading ? <ReloadOutlined /> : <SendOutlined />}{rebidReading ? "读取中" : "再次发标"}</button>
                              </span>
                            )}
                            {plan.status === "已截标" && plan.syncStatus === "已同步" && (
                              <button className="row-secondary" disabled={rowBusy} onClick={() => {
                                setSelectedId(plan.id);
                                syncBidResult(plan);
                              }}><ReloadOutlined />{syncingId === plan.id ? "同步中" : "重新同步中标结果"}</button>
                            )}
                            {plan.status === "已取消" && (
                              <button className="row-secondary" onClick={() => {
                                setSelectedId(plan.id);
                                setModal("orders");
                              }}><FileSearchOutlined />查看已取消订单</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredPlans.length === 0 && <div className="empty-state"><InboxOutlined /><span>没有符合条件的订货计划</span></div>}
            </div>
            <div className="pagination">
              <span>共 {filteredPlans.length} 条</span>
              <IconButton title="上一页"><LeftOutlined /></IconButton>
              <button className="page-current">1</button>
              <IconButton title="下一页"><RightOutlined /></IconButton>
              <select><option>20 条/页</option><option>50 条/页</option></select>
            </div>
          </section>
        </div>
      </main>

      {modal === "confirm-direct" && (
        <Modal
          title="确认计划并下单"
          confirmText="确认计划并下单"
          disabled={!selected.confirmedSku || selected.confirmQty <= 0}
          onClose={() => setModal(null)}
          onConfirm={confirmDirectOrder}
        >
          <div className={`modal-notice ${selected.confirmQty > 0 ? "success-notice" : "danger-notice"}`}>
            {selected.confirmQty > 0 ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
            计划明细 Sheet 初始人工确认量为 0，当前 {selected.confirmedSku || 0} 个 SKU 已填写
          </div>
          <div className="summary-grid">
            <span>计划单号</span><b>{selected.id}</b><span>SKU数</span><b>{selected.skuCount}</b>
            <span>确认SKU</span><b>{selected.confirmedSku || 0}</b><span>系统建议量</span><b>{formatNumber(selected.suggestionQty)}</b>
            <span>人工确认量</span><b>{formatNumber(selected.confirmQty)}</b>
          </div>
          <button className="inline-link" onClick={() => openFeishu(selected, "plan")}>打开订货明细核对 <ExportOutlined /></button>
          <p className="modal-tip">确认后先保存不可变计划快照，再提交建单请求。</p>
        </Modal>
      )}

      {modal === "confirm-and-bid" && (
        <Modal title="确认计划并发起竞标" confirmText="确认计划并发起竞标" disabled={!deadlineValid || !selected.confirmedSku || selected.confirmQty <= 0} onClose={() => setModal(null)} onConfirm={confirmPlanAndStartBid}>
          <div className={`modal-notice ${selected.confirmQty > 0 ? "success-notice" : "danger-notice"}`}>
            {selected.confirmQty > 0 ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
            计划明细 Sheet 初始人工确认量为 0，当前 {selected.confirmedSku || 0} 个 SKU 已填写
          </div>
          <p className="modal-intro">确认计划内容并设置截止时间。提交后保存计划快照并直接发起竞标。</p>
          <div className="summary-grid">
            <span>计划单号</span><b>{selected.id}</b><span>仓库</span><b>{selected.warehouse}</b>
            <span>采购品类</span><b>{selected.category}</b><span>本批SKU</span><b>{selected.confirmedSku || 0}</b>
            <span>发标数量</span><b>{formatNumber(selected.confirmQty)}</b><span>已发标SKU</span><b>0</b>
            <span>服务器时间</span><b>2026-06-22 14:30</b>
          </div>
          <label className="deadline-field">截止时间
            <input type="datetime-local" min="2026-06-22T15:01" max="2026-06-22T23:59" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          <p className={`field-help ${deadlineValid ? "" : "error-text"}`}>
            {deadlineValid ? "晚于当前时间 30 分钟，且不晚于当日 23:59" : "截止时间须晚于 15:00，且不晚于当日 23:59"}
          </p>
          <button className="inline-link" onClick={() => openFeishu(selected, "plan")}>打开计划明细核对 <ExportOutlined /></button>
        </Modal>
      )}

      {modal === "rebid" && (
        <Modal title="再次发标" confirmText="再次发标" disabled={!deadlineValid || !selected.newSkuCount} onClose={() => setModal(null)} onConfirm={rebid}>
          <div className="modal-notice success-notice"><CheckCircleOutlined />已按计划日期和 SKU 排除当日成功发标数据</div>
          <p className="modal-intro">读取飞书最新计划后，仅对本次新增且未成功发标的 SKU 发起竞标。</p>
          <div className="summary-grid">
            <span>计划单号</span><b>{selected.id}</b><span>仓库</span><b>{selected.warehouse}</b>
            <span>采购品类</span><b>{selected.category}</b><span>本批SKU</span><b>{selected.newSkuCount || 0}</b>
            <span>发标数量</span><b>{formatNumber(selected.newSkuQty)}</b><span>已发标SKU</span><b>{selected.confirmedSku || 0}</b>
            <span>服务器时间</span><b>2026-06-22 14:45</b>
          </div>
          <label className="deadline-field">截止时间
            <input type="datetime-local" min="2026-06-22T15:01" max="2026-06-22T23:59" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          <p className="modal-tip">已成功发标 SKU 不会重复提交。计划进入建单中后将永久关闭再次发标入口。</p>
        </Modal>
      )}

      {modal === "view-bid" && (
        <Modal title="竞标详情" confirmText="关闭" onClose={() => setModal(null)} onConfirm={() => setModal(null)}>
          <div className="batch-list">
            {(selected.bidBatches || []).map((batch) => (
              <div className="batch-row" key={batch.batch}>
                <div><b>{batch.batch}</b><span>{batch.task}</span></div>
                <div><span>{batch.sku} SKU · {formatNumber(batch.qty)}</span><small>{batch.deadline}</small></div>
                <StatusTag status={batch.status === "已截标" ? "已截标" : "竞标中"} />
              </div>
            ))}
          </div>
          <p className="modal-tip">任一发标批次尚未截标时，计划保持“竞标中”。全部截标后，计划员再统一同步中标结果。</p>
        </Modal>
      )}

      {modal === "confirm-bid-and-order" && (
        <Modal
          title="确认中标并下单"
          confirmText="确认中标并下单"
          disabled={selected.abnormalSku > 0 || !selected.manualBidSku || selected.manualBidQty <= 0}
          onClose={() => setModal(null)}
          onConfirm={confirmBidAndOrder}
        >
          <div className={`modal-notice ${selected.manualBidQty > 0 ? "success-notice" : "danger-notice"}`}>
            {selected.manualBidQty > 0 ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
            中标结果 Sheet 人工确认量初始为 0，当前 {selected.manualBidSku || 0} 个 SKU 已填写
          </div>
          <div className="summary-grid">
            <span>竞标任务</span><b>{selected.bidBatches?.length || 1} 个</b><span>中标SKU</span><b>{selected.skuCount - (selected.abnormalSku || 0)}</b>
            <span>供应商数</span><b>{selected.suppliers}</b><span>原始中标总量</span><b>{formatNumber(selected.bidQty)}</b>
            <span>人工确认总量</span><b>{formatNumber(selected.manualBidQty)}</b><span>确认SKU</span><b>{selected.manualBidSku || 0}</b>
          </div>
          <button className="inline-link" onClick={() => openFeishu(selected, "bid")}>打开飞书表格 · 中标结果 Sheet <ExportOutlined /></button>
          <p className="modal-tip">确认后保存中标结果快照，并使用人工确认量提交建单请求。</p>
        </Modal>
      )}

      {modal === "query-order" && (
        <Modal title="查询建单结果" confirmText="查询最新结果" onClose={() => setModal(null)} onConfirm={queryOrder}>
          <div className="summary-grid">
            <span>计划单号</span><b>{selected.id}</b><span>提交时间</span><b>{selected.date} {selected.updated}</b>
            <span>当前状态</span><b>建单处理中</b>
          </div>
          <p className="modal-tip">查询只获取最新结果，不会重复提交建单请求。</p>
        </Modal>
      )}

      {modal === "reorder" && (
        <Modal
          title="再次下单"
          confirmText="再次下单"
          onClose={() => setModal(null)}
          onConfirm={reorderWithLatest}
        >
          <div className="modal-notice success-notice">
            <CheckCircleOutlined />
            已读取飞书最新数据，当前展示的是最新人工确认结果
          </div>
          <div className="summary-grid">
            <span>计划单号</span><b>{selected.id}</b><span>SKU数</span><b>{selected.latestSheetTotalSku ?? selected.skuCount}</b>
            <span>确认SKU</span><b>{selected.latestSheetSku ?? selected.confirmedSku ?? 0}</b><span>系统建议量</span><b>{formatNumber(selected.suggestionQty)}</b>
            <span>人工确认量</span><b>{formatNumber(selected.latestSheetQty ?? selected.confirmQty ?? 0)}</b>
          </div>
          <button className="inline-link" onClick={() => openFeishu(selected, selected.method === "区采" ? "bid" : "plan")}>打开飞书表格核对 <ExportOutlined /></button>
          <p className="modal-tip">确认后读取到的最新表格数据将直接用于新一轮下单。</p>
        </Modal>
      )}

      {modal === "failure" && (
        <Modal title="执行失败原因" confirmText="关闭" onClose={() => setModal(null)} onConfirm={() => setModal(null)}>
          <div className="modal-notice danger-notice"><ExclamationCircleOutlined />当前任务未继续推进，请根据失败原因人工排查</div>
          <div className="summary-grid">
            <span>计划单号</span><b>{selected.id}</b><span>失败环节</span><b>{selected.failureStage}</b>
            <span>外部单据</span><b>{selected.external}</b><span>发生时间</span><b>{selected.date} {selected.updated}</b>
          </div>
          <p className="failure-copy">{selected.failureReason}</p>
        </Modal>
      )}

      {modal === "orders" && (
        <Modal
          title={selected.status === "部分成功" ? "处理结果" : selected.status === "已取消" ? "已取消订单" : "采购订单"}
          confirmText={["已建单", "部分成功"].includes(selected.status) ? "全量取消本批次" : "关闭"}
          danger={["已建单", "部分成功"].includes(selected.status)}
          onClose={() => setModal(null)}
          onConfirm={() => setModal(["已建单", "部分成功"].includes(selected.status) ? "cancel-batch" : null)}
        >
          <div className="batch-summary">
            <span>执行批次 {selected.executionBatch || "EX01"}</span>
            <span>{selected.orders?.length || 0} 个采购订单</span>
            <StatusTag status={selected.status} />
          </div>
          {selected.failureReason && <div className="modal-notice danger-notice"><ExclamationCircleOutlined />{selected.failureReason}</div>}
          <div className="orders-list">
            {(selected.orders || []).map((order) => (
              <div className="order-card" key={order.no}>
                <div className="order-card-main">
                  <b>{order.no}</b><span>{order.supplier}</span>
                  <small>{order.sku} SKU · ￥{formatNumber(order.amount)}</small>
                </div>
                <div className="order-card-actions">
                  <span className={`order-state ${order.status === "已取消" ? "cancelled" : ""}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {modal === "cancel-batch" && (
        <Modal title="全量取消本执行批次" confirmText="确认全量取消" danger onClose={() => setModal("orders")} onConfirm={cancelExecutionBatch}>
          <div className="modal-notice danger-notice"><ExclamationCircleOutlined />将整单取消本批次下全部采购订单，不支持按 SKU 部分取消</div>
          <div className="summary-grid">
            <span>执行批次</span><b>{selected.executionBatch || "EX01"}</b><span>订单数量</span><b>{selected.orders?.length || 0}</b>
            <span>SKU数</span><b>{selected.confirmedSku || selected.manualBidSku || selected.skuCount}</b><span>订单金额</span><b>￥{formatNumber((selected.orders || []).reduce((sum, order) => sum + order.amount, 0))}</b>
            <span>取消范围</span><b>本批次全部订单</b><span>取消后状态</span><b>已取消</b>
          </div>
          <p className="modal-tip">取消成功后，对应 Sheet 的人工确认量自动重置为 0。区采保留竞标和中标原始结果，但不允许再次发标。</p>
        </Modal>
      )}

      {flowOpen && (
        <div className="flow-backdrop" onMouseDown={() => setFlowOpen(false)}>
          <section className="flow-modal" onMouseDown={(event) => event.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h2>订货计划状态流程</h2>
                <p>区采与厂家直采的状态路径</p>
              </div>
              <IconButton title="关闭状态流程" onClick={() => setFlowOpen(false)}><CloseOutlined /></IconButton>
            </header>
            <div className="flow-content">
              <section className="flow-lane">
                <header><ShoppingCartOutlined /><div><b>厂家直采</b><span>确认计划后直接提交建单</span></div></header>
                <div className="flow-steps">
                  <FlowStep label="待确认计划" action="人工确认量默认 0 / 填写后确认下单" tone="warning" />
                  <RightOutlined />
                  <FlowStep label="建单中" action="查询建单结果" tone="processing" />
                  <RightOutlined />
                  <FlowResultSteps />
                </div>
                <p className="flow-note">全部订单取消后，再次下单读取计划明细最新内容，不做业务校验并直接创建新执行批次。</p>
              </section>
              <section className="flow-lane">
                <header><SendOutlined /><div><b>区采</b><span>截标后手动同步中标结果</span></div></header>
                <div className="flow-steps flow-steps-regional">
                  <FlowStep label="待确认计划" action="人工确认量默认 0 / 首次发标" tone="warning" />
                  <RightOutlined />
                  <FlowStep label="竞标中" action="等待截标 / 新增 SKU 可再次发标" tone="processing" />
                  <RightOutlined />
                  <FlowStep label="已截标" action="汇总同步 / 人工确认量默认 0" tone="warning" />
                  <RightOutlined />
                  <FlowStep label="建单中" action="查询建单结果" tone="processing" />
                  <RightOutlined />
                  <FlowResultSteps />
                </div>
                <p className="flow-note">建单前只对当日未发标的新增 SKU 再次发标。建单后永久关闭发标入口；全部取消后读取中标结果最新内容并直接下单。</p>
              </section>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast"><CheckCircleOutlined />{toast}</div>}
    </div>
  );
}

function FlowStep({ label, action, tone }) {
  return (
    <div className={`flow-step ${tone}`}>
      <b>{label}</b>
      <span>{action}</span>
    </div>
  );
}

function FlowResultSteps() {
  return (
    <div className="flow-results">
      <FlowStep label="已建单" action="可全量取消执行批次" tone="success" />
      <FlowStep label="部分成功" action="部分订单失败" tone="warning" />
      <FlowStep label="执行失败" action="未创建订单" tone="danger" />
      <FlowStep label="已取消" action="读取最新表格后直接下单" tone="muted" />
    </div>
  );
}
