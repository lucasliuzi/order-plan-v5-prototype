import { useMemo, useState } from "react";
import {
  ApartmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  FileExcelOutlined,
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
    confirmQty: 2860,
    changedSku: 0,
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
    confirmQty: 6400,
    changedSku: 6,
  },
  {
    id: "RP202606220003",
    date: "2026-06-22",
    region: "华北",
    warehouse: "石家庄RDC",
    category: "酒水",
    method: "区采",
    skuCount: 35,
    status: "部分成功",
    snapshot: "V1",
    external: "2成功 / 1失败",
    updated: "12:10",
    planner: "李四",
    suggestionQty: 2200,
    confirmQty: 2180,
    changedSku: 2,
    bidSnapshot: "B1",
    failureStage: "创建采购订单",
    failureReason: "1 个供应商的结算主体缺失，订单未创建。",
    orders: [
      { no: "PO2606220003", supplier: "河北优选商贸", sku: 16, amount: 23800, status: "可取消" },
      { no: "PO2606220004", supplier: "石家庄华盛供应链", sku: 11, amount: 15100, status: "可取消" },
    ],
  },
  {
    id: "RP202606220004",
    date: "2026-06-22",
    region: "华北",
    warehouse: "太原RDC",
    category: "调味品",
    method: "区采",
    skuCount: 18,
    status: "执行失败",
    snapshot: "V1",
    external: "BID260622004",
    updated: "12:25",
    planner: "李四",
    suggestionQty: 980,
    confirmQty: 960,
    changedSku: 1,
    failureStage: "查询中标结果",
    failureReason: "竞标接口超时，未取得明确结果；系统未自动重试。",
  },
];

const statusStyle = {
  待确认计划: "warning",
  待发起竞标: "warning",
  竞标中: "processing",
  待确认中标: "warning",
  待确认下单: "warning",
  建单中: "processing",
  已建单: "success",
  部分成功: "warning",
  执行失败: "danger",
  部分取消: "muted",
  已取消: "muted",
};

function statusAction(plan) {
  return {
    待确认计划: { label: "确认计划", icon: <CheckCircleOutlined /> },
    待发起竞标: { label: "发起竞标", icon: <SendOutlined /> },
    竞标中: { label: "查看竞标", icon: <FileSearchOutlined /> },
    待确认中标: { label: "确认中标结果", icon: <CheckCircleOutlined /> },
    待确认下单: { label: "确认下单", icon: <ShoppingCartOutlined /> },
    建单中: { label: "查询建单结果", icon: <ReloadOutlined /> },
    已建单: { label: "查看订单", icon: <FileSearchOutlined /> },
    部分成功: { label: "查看处理结果", icon: <FileSearchOutlined /> },
    执行失败: { label: "查看失败原因", icon: <ExclamationCircleOutlined /> },
    部分取消: { label: "查看订单", icon: <FileSearchOutlined /> },
    已取消: { label: "查看取消记录", icon: <UnorderedListOutlined /> },
  }[plan.status];
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("zh-CN");
}

function StatusTag({ status }) {
  return <span className={`status-tag ${statusStyle[status] || "muted"}`}>{status}</span>;
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
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "2026-06-22", dateTo: "2026-06-22", warehouse: "全部", category: "全部", method: "全部", status: "全部", id: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [modal, setModal] = useState(null);
  const [flowOpen, setFlowOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [deadline, setDeadline] = useState("2026-06-22T17:30");
  const [cancelOrder, setCancelOrder] = useState(null);

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

  function openFeishu(plan = selected) {
    notify(`已打开 ${plan.id} 的飞书订货表（原型模拟）`);
  }

  function handlePrimary(plan, keepDrawer = false) {
    setSelectedId(plan.id);
    if (!keepDrawer) setDrawerOpen(false);
    if (plan.status === "待确认计划") setModal("confirm-plan");
    else if (plan.status === "待发起竞标") setModal("start-bid");
    else if (plan.status === "竞标中") setModal("view-bid");
    else if (plan.status === "待确认中标") setModal("confirm-bid");
    else if (plan.status === "待确认下单") setModal("confirm-order");
    else if (plan.status === "建单中") setModal("query-order");
    else if (["已建单", "部分成功", "部分取消", "已取消"].includes(plan.status)) setModal("orders");
    else if (plan.status === "执行失败") setModal("failure");
  }

  function confirmPlan(reconfirm = false) {
    const currentVersion = Number(String(selected.snapshot || "V0").replace("V", "")) || 0;
    const nextVersion = `V${currentVersion + 1}`;
    updatePlan(selected.id, {
      status: reconfirm ? selected.status : selected.method === "区采" ? "待发起竞标" : "待确认下单",
      snapshot: nextVersion,
      updated: "14:32",
    });
    setModal(null);
    notify(`${reconfirm ? "计划重新确认成功" : "计划确认成功"}，已生成快照 ${nextVersion}`);
  }

  const deadlineValid = deadline > "2026-06-22T15:00" && deadline <= "2026-06-22T23:59";

  function startBid() {
    const readableDeadline = deadline.replace("T", " ");
    updatePlan(selected.id, {
      status: "竞标中", external: `BID${selected.id.slice(-6)}`, deadline: readableDeadline, updated: "14:31",
    });
    setModal(null);
    notify("竞标任务创建成功");
  }

  function confirmBid() {
    updatePlan(selected.id, { status: "待确认下单", bidSnapshot: "B1", updated: "16:42", estimatedOrders: selected.suppliers || 6 });
    setModal(null);
    notify("中标结果已确认，生成快照 B1");
  }

  function confirmOrder() {
    const orders = Array.from({ length: Math.min(selected.estimatedOrders || 2, 3) }, (_, index) => ({
      no: `PO26062200${20 + index}`,
      supplier: ["华北优选供应链", "北京兴盛商贸", "天津鲜达供应链"][index],
      sku: Math.max(8, Math.round(selected.skuCount / 3)),
      amount: Math.round((selected.amount || 58300) / Math.min(selected.estimatedOrders || 2, 3)),
      status: "可取消",
    }));
    updatePlan(selected.id, {
      status: "建单中",
      pendingOrders: orders,
      external: `REQ${selected.id.slice(-6)}`,
      updated: "16:50",
    });
    setModal(null);
    notify("建单请求已提交，请查询建单结果");
  }

  function queryOrder() {
    const orders = selected.pendingOrders || [
      { no: "PO2606220026", supplier: "北京冻品直供", sku: 16, amount: 24800, status: "可取消" },
      { no: "PO2606220027", supplier: "华北冷链供应链", sku: 12, amount: 21700, status: "可取消" },
    ];
    updatePlan(selected.id, { status: "已建单", orders, pendingOrders: undefined, external: `${orders.length}个采购订单`, updated: "16:55" });
    setModal(null);
    notify("已取得建单结果，返回 2 个采购订单号");
  }

  function doCancelOrder() {
    const nextOrders = (selected.orders || []).map((order) => order.no === cancelOrder.no ? { ...order, status: "已取消" } : order);
    const allCancelled = nextOrders.every((order) => order.status === "已取消");
    updatePlan(selected.id, { orders: nextOrders, status: allCancelled ? "已取消" : "部分取消", updated: "17:05" });
    setCancelOrder(null);
    setModal("orders");
    notify(`订单 ${cancelOrder.no} 已取消`);
  }

  const action = statusAction(selected);
  const canReconfirm = selected.snapshot !== "—"
    && ((selected.method === "区采" && selected.status === "待发起竞标")
      || (selected.method === "厂家直采" && selected.status === "待确认下单"));

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""} ${drawerOpen ? "drawer-active" : ""}`}>
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
                    <th>计划日期</th><th>计划单号</th><th>仓库</th><th>采购品类</th><th>采购方式</th>
                    <th>SKU数</th><th>当前状态</th><th>飞书表格</th><th>外部单据</th><th>更新时间</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan) => {
                    const rowAction = statusAction(plan);
                    return (
                      <tr key={plan.id} className={plan.id === selectedId ? "selected" : ""} onClick={() => {
                        setSelectedId(plan.id); setDrawerOpen(true);
                      }}>
                        <td>{plan.date}</td>
                        <td><button className="link-button" onClick={(event) => {
                          event.stopPropagation();
                          setSelectedId(plan.id);
                          setDrawerOpen(true);
                        }}>{plan.id}</button></td>
                        <td>{plan.warehouse}</td>
                        <td>{plan.category}</td>
                        <td>{plan.method}</td>
                        <td className="number-cell">{plan.skuCount}</td>
                        <td><StatusTag status={plan.status} /></td>
                        <td><button className="link-button" onClick={(e) => { e.stopPropagation(); openFeishu(plan); }}>打开表格 <ExportOutlined /></button></td>
                        <td>{plan.external}</td>
                        <td>{plan.date} {plan.updated}</td>
                        <td>
                          <div className="row-actions">
                            <button className="row-primary" onClick={(e) => { e.stopPropagation(); handlePrimary(plan); }}>
                              {rowAction.icon}{rowAction.label}
                            </button>
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

      {drawerOpen && selected && (
        <aside className="drawer">
          <header className="drawer-header">
            <h2>计划单　{selected.id}</h2>
            <IconButton title="关闭详情" onClick={() => setDrawerOpen(false)}><CloseOutlined /></IconButton>
          </header>
          <div className="drawer-content">
            <section className="detail-section">
              <h3>基本信息</h3>
              <div className="detail-grid">
                <span>计划日期</span><b>{selected.date}</b><span>仓库</span><b>{selected.warehouse}</b>
                <span>采购品类</span><b>{selected.category}</b><span>采购方式</span><b>{selected.method}</b>
                <span>计划状态</span><b><StatusTag status={selected.status} /></b><span>SKU数</span><b>{selected.skuCount}</b>
                <span>计划员</span><b>{selected.planner}</b><span>更新时间</span><b>{selected.date} {selected.updated}</b>
              </div>
              <button className="button outline wide-link" onClick={() => openFeishu(selected)}><FileExcelOutlined />打开飞书表格 <ExportOutlined /></button>
            </section>
            <section className="detail-section">
              <h3>计划快照 {selected.snapshot !== "—" ? selected.snapshot : ""}</h3>
              {selected.snapshot === "—" ? <p className="muted-copy">计划尚未确认，当前以飞书表格最新内容为准。</p> : (
                <div className="detail-grid">
                  <span>创建时间</span><b>{selected.date} 09:10</b><span>快照版本</span><b>{selected.snapshot}</b>
                  <span>SKU数</span><b>{selected.skuCount}</b><span>改量SKU</span><b>{selected.changedSku}</b>
                  <span>系统建议量</span><b>{formatNumber(selected.suggestionQty)}</b><span>人工确认量</span><b>{formatNumber(selected.confirmQty)}</b>
                </div>
              )}
            </section>
            {selected.method === "区采" && (
              <section className="detail-section">
                <h3>区采信息</h3>
                <div className="detail-grid">
                  <span>竞标任务号</span><b>{selected.external?.startsWith("BID") ? selected.external : "—"}</b>
                  <span>截止时间</span><b>{selected.deadline || "—"}</b>
                  <span>中标供应商</span><b>{selected.suppliers || "—"}</b>
                  <span>中标快照</span><b>{selected.bidSnapshot || "—"}</b>
                </div>
              </section>
            )}
            <section className="detail-section">
              <h3>订单信息</h3>
              {selected.orders?.length ? selected.orders.map((order) => (
                <div className="order-line" key={order.no}>
                  <div><b>{order.no}</b><span>{order.supplier} · {order.sku} SKU</span></div>
                  <StatusTag status={order.status === "已取消" ? "已取消" : "已建单"} />
                </div>
              )) : <p className="muted-copy">尚未创建采购订单</p>}
            </section>
            <section className="detail-section">
              <h3>操作记录</h3>
              <div className="timeline">
                <div><i /><span>{selected.date} 09:00</span><b>系统生成订货计划</b></div>
                {selected.snapshot !== "—" && <div><i /><span>{selected.date} 09:10</span><b>{selected.planner} 确认计划，生成快照 {selected.snapshot}</b></div>}
                {selected.external !== "—" && <div><i /><span>{selected.date} {selected.updated}</span><b>更新至「{selected.status}」</b></div>}
              </div>
            </section>
          </div>
          <footer className="drawer-footer">
            {canReconfirm && (
              <button className="button secondary" onClick={() => setModal("reconfirm-plan")}>
                <ReloadOutlined />重新确认计划
              </button>
            )}
            {action && <button className="button primary drawer-primary" onClick={() => handlePrimary(selected, true)}>{action.icon}{action.label}</button>}
          </footer>
        </aside>
      )}

      {modal === "confirm-plan" && (
        <Modal title="确认计划" confirmText="确认并生成快照" onClose={() => setModal(null)} onConfirm={() => confirmPlan(false)}>
          <div className="modal-notice success-notice"><CheckCircleOutlined />飞书表格读取完成，数据校验通过</div>
          <div className="summary-grid">
            <span>计划单号</span><b>{selected.id}</b><span>待生成快照</span><b>V1</b>
            <span>SKU数</span><b>{selected.skuCount}</b><span>改量SKU</span><b>{selected.changedSku}</b>
            <span>系统建议量</span><b>{formatNumber(selected.suggestionQty)}</b><span>人工确认量</span><b>{formatNumber(selected.confirmQty)}</b>
          </div>
          <button className="inline-link" onClick={() => openFeishu(selected)}>打开飞书表格核对 <ExportOutlined /></button>
          <p className="modal-tip">确认后将保存不可变快照。飞书后续修改不会影响本次执行数据。</p>
        </Modal>
      )}

      {modal === "reconfirm-plan" && (
        <Modal title="重新确认计划" confirmText="确认并生成新版本" onClose={() => setModal(null)} onConfirm={() => confirmPlan(true)}>
          <div className="modal-notice success-notice"><CheckCircleOutlined />飞书表格最新内容读取完成，数据校验通过</div>
          <div className="summary-grid">
            <span>计划单号</span><b>{selected.id}</b><span>当前快照</span><b>{selected.snapshot}</b>
            <span>SKU数</span><b>{selected.skuCount}</b><span>改量SKU</span><b>{selected.changedSku}</b>
            <span>人工确认量</span><b>{formatNumber(selected.confirmQty)}</b>
            <span>新快照版本</span><b>V{(Number(String(selected.snapshot).replace("V", "")) || 0) + 1}</b>
          </div>
          <p className="modal-tip">新版本只替换当前待执行快照，历史快照继续保留。已发起竞标或已提交建单后不允许重新确认。</p>
        </Modal>
      )}

      {modal === "start-bid" && (
        <Modal title="发起竞标" confirmText="确认发起" disabled={!deadlineValid} onClose={() => setModal(null)} onConfirm={startBid}>
          <p className="modal-intro">确认以下信息并设置截止时间，发起竞标后将通知供应商。</p>
          <div className="summary-grid">
            <span>计划单号</span><b>{selected.id}</b><span>计划快照</span><b>{selected.snapshot}</b>
            <span>仓库</span><b>{selected.warehouse}</b><span>采购品类</span><b>{selected.category}</b>
            <span>SKU数</span><b>{selected.skuCount}</b><span>需求数量</span><b>{formatNumber(selected.confirmQty)}</b>
            <span>含税金额（预估）</span><b>￥58,300.00</b><span>服务器时间</span><b>2026-06-22 14:30</b>
          </div>
          <label className="deadline-field">截止时间
            <input type="datetime-local" min="2026-06-22T15:01" max="2026-06-22T23:59" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          <p className={`field-help ${deadlineValid ? "" : "error-text"}`}>
            {deadlineValid ? "晚于当前时间 30 分钟，且不晚于当日 23:59" : "截止时间须晚于 15:00，且不晚于当日 23:59"}
          </p>
        </Modal>
      )}

      {modal === "view-bid" && (
        <Modal title="竞标详情" confirmText="关闭" onClose={() => setModal(null)} onConfirm={() => setModal(null)}>
          <div className="summary-grid">
            <span>竞标任务号</span><b>{selected.external}</b><span>计划单号</span><b>{selected.id}</b>
            <span>截止时间</span><b>{selected.deadline}</b><span>当前阶段</span><b>未截标</b>
            <span>SKU数</span><b>{selected.skuCount}</b><span>竞标数量</span><b>{formatNumber(selected.confirmQty)}</b>
          </div>
          <p className="modal-tip">到达截止时间后，系统自动查询中标结果。查询成功后生成“中标结果”Sheet，并将计划状态更新为“待确认中标”。</p>
        </Modal>
      )}

      {modal === "confirm-bid" && (
        <Modal title="确认中标结果" confirmText="确认并生成快照" disabled={selected.abnormalSku > 0} onClose={() => setModal(null)} onConfirm={confirmBid}>
          <div className="modal-notice success-notice"><CheckCircleOutlined />中标结果 Sheet 读取完成</div>
          <div className="summary-grid">
            <span>竞标任务号</span><b>{selected.external}</b><span>待生成快照</span><b>B1</b>
            <span>中标SKU</span><b>{selected.skuCount - (selected.abnormalSku || 0)}</b><span>供应商数</span><b>{selected.suppliers}</b>
            <span>原始中标总量</span><b>{formatNumber(selected.bidQty)}</b><span>确认中标总量</span><b>{formatNumber(selected.finalBidQty)}</b>
            <span>修改数量SKU</span><b>3</b><span>异常SKU</span><b className="warning-text">{selected.abnormalSku || 0}</b>
          </div>
          <button className="inline-link" onClick={() => openFeishu(selected)}>打开中标结果 Sheet <ExportOutlined /></button>
          <p className="modal-tip">后续下单将使用“确认中标量”。原始中标结果会独立保存。</p>
        </Modal>
      )}

      {modal === "confirm-order" && (
        <Modal title="确认下单" confirmText="确认提交建单" onClose={() => setModal(null)} onConfirm={confirmOrder}>
          <div className="modal-notice success-notice"><CheckCircleOutlined />权限、快照和重复建单校验通过</div>
          <div className="summary-grid">
            <span>计划快照</span><b>{selected.snapshot}</b><span>中标快照</span><b>{selected.method === "区采" ? selected.bidSnapshot || "B1" : "不适用"}</b>
            <span>预计订单数</span><b>{selected.estimatedOrders || 2}</b><span>供应商数</span><b>{selected.suppliers || 2}</b>
            <span>SKU数</span><b>{selected.skuCount}</b><span>订货总量</span><b>{formatNumber(selected.finalBidQty || selected.confirmQty)}</b>
            <span>含税金额（预估）</span><b>￥{formatNumber(selected.amount || 58300)}</b><span>重复订单</span><b className="success-text">0</b>
          </div>
          <p className="modal-tip">订单将按供应商和下游拆单规则创建。提交后请等待明确结果，不要重复操作。</p>
        </Modal>
      )}

      {modal === "query-order" && (
        <Modal title="查询建单结果" confirmText="查询最新结果" onClose={() => setModal(null)} onConfirm={queryOrder}>
          <div className="summary-grid">
            <span>计划单号</span><b>{selected.id}</b><span>请求流水号</span><b>{selected.external}</b>
            <span>提交时间</span><b>{selected.date} {selected.updated}</b><span>当前状态</span><b>建单处理中</b>
            <span>预计订单数</span><b>{selected.estimatedOrders || 2}</b><span>重复提交保护</span><b className="success-text">已启用</b>
          </div>
          <p className="modal-tip">查询只获取最新结果，不会重复提交建单请求。</p>
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
        <Modal title={selected.status === "部分成功" ? "处理结果" : selected.status === "已取消" ? "取消记录" : "采购订单"} confirmText="关闭" onClose={() => setModal(null)} onConfirm={() => setModal(null)}>
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
                  {order.status === "可取消" && <button className="text-danger" onClick={() => { setCancelOrder(order); setModal(null); }}><DeleteOutlined />取消订单</button>}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {cancelOrder && (
        <Modal title="取消采购订单" confirmText="确认取消" danger onClose={() => setCancelOrder(null)} onConfirm={doCancelOrder}>
          <div className="modal-notice danger-notice"><ExclamationCircleOutlined />取消后不可恢复，请确认订单信息</div>
          <div className="summary-grid">
            <span>采购订单号</span><b>{cancelOrder.no}</b><span>当前状态</span><b>可取消</b>
            <span>供应商</span><b>{cancelOrder.supplier}</b><span>SKU数</span><b>{cancelOrder.sku}</b>
            <span>订单金额</span><b>￥{formatNumber(cancelOrder.amount)}</b><span>影响范围</span><b>仅当前订单</b>
          </div>
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
            <div className="flow-image-wrap">
              <img src={`${import.meta.env.BASE_URL}status-flow-v1.png`} alt="订货计划状态流程图" />
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast"><CheckCircleOutlined />{toast}</div>}
    </div>
  );
}
