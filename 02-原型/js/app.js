"use strict";

const SNAPSHOT = {
  capturedAt: "2026-09-15 16:14 CST",
  dataThrough: "2026-09-14 15:24",
  tables: 119,
  users: 48,
  rolesActive: 15,
  rolesWithUsers: 11,
  customers: 319,
  subjects: 1812,
  shops: 8244,
  accounts: 12614,
  suppliers: 20,
  suppliersUsed: 17,
  openApplies: 189,
  openDone: 173,
  openReturned: 16,
  openAvgAgent: "3.2h",
  openAvgExternal: "10.9h",
  recharges: 1283,
  rechargeDone: 1280,
  rechargeRobot: 1020,
  rechargePc: 248,
  cashReceipts: 144,
  cashPending: 142,
  cashPendingAmount: "¥380.54万",
  statements: 225,
  statementsDone: 19,
  laikeValidInShops: 32,
  shopsSameAsSubject: 5628
};

const ROLES = [
  { id: "dx", name: "商务岗位", users: 15, scope: "仅本人", menus: 111, routeNodes: 30, home: "biz", usage: "120 单开户申请；15 人仅 3 人登录", org: "以沈阳商务一/二部为主", interactive: true },
  { id: "DYYUNY", name: "抖音运营", users: 8, scope: "全部", menus: 195, routeNodes: 41, home: "ops", usage: "客户运营与消耗相关；近日日志 97 次", org: "沈阳运营一/二部为主", interactive: true },
  { id: "dymj", name: "开户媒介", users: 5, scope: "全部", menus: 75, routeNodes: 21, home: "open", usage: "处理开户申请与维护账户；4 人近期登录", org: "厦门 4 人、天津 1 人", interactive: true },
  { id: "zhijiekh", name: "充值媒介", users: 2, scope: "全部", menus: 248, routeNodes: 51, home: "recharge", usage: "充值、转户、退币与现金收款", org: "厦门 1 人、天津 1 人", interactive: true },
  { id: "AESJ", name: "AE数据", users: 1, scope: "全部", menus: 409, routeNodes: 88, home: "data", usage: "中央建档；近期 2,641 次操作", org: "中央数据维护", interactive: true },
  { id: "Financial", name: "财务", users: 3, scope: "全部", menus: 308, routeNodes: 69, home: "finance", usage: "现金、对账、授信与供应商付款；近期仅 1 人登录", org: "跨城市财务", interactive: true },
  { id: "zjl", name: "总经理", users: 5, scope: "本部门", menus: 399, routeNodes: 86, home: "boss", usage: "本部门经营查看；近期操作 14 次", org: "厦门、天津、沈阳", interactive: true },
  { id: "dsz", name: "董事长", users: 2, scope: "全部", menus: 404, routeNodes: 85, home: "boss", usage: "总审批权限；近期 1 人登录", org: "全公司", interactive: true },
  { id: "hr", name: "人事行政", users: 3, scope: "全部", menus: 203, routeNodes: 43, home: "access", usage: "用户与组织维护；近期 1 人登录", org: "厦门、天津、沈阳各 1 人", interactive: true },
  { id: "system_admin", name: "系统管理员", users: 4, scope: "全部", menus: 412, routeNodes: 88, home: "template", usage: "系统与业务配置；多人兼任 AE/媒介/董事长", org: "系统治理", interactive: true },
  { id: "rpa", name: "RPA机器人", users: 5, scope: "服务身份", menus: 0, routeNodes: 0, home: "automation", usage: "微信机器人 / RPA 服务账号，无人工登录", org: "非人工工作台", interactive: false },
  { id: "external", name: "外部账号", users: 0, scope: "本部门", menus: 162, routeNodes: 0, home: "access", usage: "启用但无人使用；渠道自助不在本期", org: "待清理/待决策", interactive: false },
  { id: "finance_assistant", name: "财务助理", users: 0, scope: "本部门及以下", menus: 260, routeNodes: 0, home: "access", usage: "启用但无人使用", org: "待清理", interactive: false },
  { id: "ops_manager", name: "抖音运营经理", users: 0, scope: "自定义", menus: 85, routeNodes: 0, home: "access", usage: "关联 8 个部门且含已删除部门", org: "权限脏数据", interactive: false },
  { id: "super_admin", name: "超级管理员", users: 0, scope: "全部", menus: 5, routeNodes: 0, home: "access", usage: "启用但无用户；另有 user_id=1 硬编码管理员", org: "特殊身份", interactive: false }
];

const ACCESS = {
  dx: ["biz", "apply", "customer", "feedback"],
  DYYUNY: ["ops", "apply", "customer", "recharge", "feedback"],
  dymj: ["open", "handle", "customer", "supplier", "feedback"],
  zhijiekh: ["recharge", "customer", "supplier", "feedback"],
  AESJ: ["data", "customer", "supplier", "feedback"],
  Financial: ["finance", "customer", "supplier", "feedback"],
  zjl: ["boss", "customer", "feedback"],
  dsz: ["boss", "finance", "customer", "feedback"],
  hr: ["access", "feedback"],
  system_admin: ["*"],
  rpa: ["automation"]
};

const PAGE_META = {
  biz: ["我的工作台", "商务工作台", "只显示我发起、被退回、待补资料和待确认的业务，不再进入全公司大表。"],
  ops: ["我的工作台", "运营工作台", "聚合客户运营、消耗异常和需要协同的数据，不复制媒体事业部菜单树。"],
  open: ["我的工作台", "开户媒介工作台", "按组织领取开户队列，支持批量账户结果、部分成功和来客纠错闭环。"],
  recharge: ["我的工作台", "充值媒介工作台", "区分机器人、PC 与外转记账；sync_state=0 不再一律判为失败。"],
  finance: ["我的工作台", "财务工作台", "用真实积压口径呈现现金到账、对账和授信规则异常。"],
  boss: ["经营总览", "管理层看板", "总经理按本部门、董事长看全公司；看板只读，审批回到原单。"],
  data: ["数据运营", "AE 数据工作台", "集中处理主数据缺失、重复和导入异常，避免用管理员权限代录。"],
  automation: ["服务身份", "机器人链路", "RPA 是服务身份，不放进人工角色切换；展示解析、幂等与人工接管。"],
  apply: ["业务办理", "开户申请", "媒体产品与供货渠道分轴；从客户到主体再到账户需求明细，名称由 ID 带出。"],
  handle: ["业务办理", "处理开户", "商务字段只读带回；批量回填账户，并逐行显示成功、失败或待补录。"],
  customer: ["主数据", "客户档案", "客户 → 主体 → 店铺 → 广告账户四层不变；平台 ID 与内部编号分开。"],
  supplier: ["主数据", "供应商档案", "AGENT 自有端口和 NOAGENT 外部代理分开管理，账户只引用。"],
  template: ["配置治理", "字段与表单规则", "字段字典与表单模板分层，先校验、预览、发布，再影响新单。"],
  workflow: ["配置治理", "工作流与组织路由", "表达城市组织、条件分支、退回、SLA 与无人处理兜底。"],
  access: ["配置治理", "角色与数据范围", "生产角色用于取证；重构权限按岗位、组织、任务来源重新收敛。"],
  feedback: ["需求共创", "字段调整清单", "通过全局加号提交字段问题；仅保存到本机原型，不直接修改生产。"]
};

const NAV = [
  { label: "工作台", items: [
    ["biz", "商务工作台"], ["ops", "运营工作台"], ["open", "开户媒介工作台"],
    ["recharge", "充值媒介工作台"], ["finance", "财务工作台"], ["boss", "管理层看板"], ["data", "AE 数据工作台"]
  ]},
  { label: "业务与主数据", items: [
    ["apply", "开户申请"], ["customer", "客户档案"], ["supplier", "供应商档案"], ["automation", "机器人链路"]
  ]},
  { label: "配置治理", items: [
    ["template", "字段与表单规则"], ["workflow", "工作流与组织"], ["access", "角色与数据范围"]
  ]},
  { label: "需求共创", items: [["feedback", "字段调整清单"]]}
];

const BASE_FIELDS = [
  { id: "customer_id", name: "客户", code: "customer_id", owner: "开户申请", media: ["all"], stage: "apply", role: "商务", visible: true, required: true, source: "客户主数据（按 ID 选择）", condition: "所有开户", validation: "客户未删除且有访问权", correction: "退回商务修改", version: "v0.2" },
  { id: "subject_id", name: "主体 / 直客名称", code: "subject_id", owner: "主体", media: ["all"], stage: "apply", role: "商务", visible: true, required: true, source: "主体主数据（名称自动带出）", condition: "所有开户", validation: "归属所选客户；同名提示", correction: "退回商务修改", version: "v0.2" },
  { id: "supplier_id", name: "供应商", code: "supplier_id", owner: "供应商", media: ["all"], stage: "apply", role: "商务", visible: true, required: true, source: "供应商主数据（按产品过滤）", condition: "所有开户", validation: "状态有效且支持产品", correction: "媒介可退回", version: "v0.2" },
  { id: "direct_customer_id", name: "巨量直客 ID", code: "direct_customer_id", owner: "申请 → 账户", media: ["102", "100"], stage: "apply", role: "商务 / 开户媒介", visible: true, required: false, source: "主体历史多值可选或当次补录", condition: "巨量产品；允许待媒介补", validation: "数字；唯一范围待业务确认", correction: "改动留痕并通知商务", version: "v0.2" },
  { id: "laike_name", name: "来客名称", code: "laike_name", owner: "店铺", media: ["102"], stage: "apply", role: "商务", visible: true, required: true, source: "店铺主数据 / 新建", condition: "仅巨量本地推", validation: "禁止与内部店铺编号混用", correction: "媒介可纠错", version: "v0.2" },
  { id: "laike_id", name: "来客 ID", code: "laike_id", owner: "店铺新字段", media: ["102"], stage: "apply", role: "商务", visible: true, required: true, source: "来客档案 / 当次手填", condition: "仅巨量本地推", validation: "19 位数字；不复用 shop_no", correction: "原因 + 前后值 + 商务确认", version: "v0.2" },
  { id: "industry", name: "行业", code: "industry_code", owner: "主体资质", media: ["all"], stage: "apply", role: "商务", visible: true, required: false, source: "主体主数据", condition: "按产品/行业资质规则", validation: "标准行业字典码", correction: "主体变更留痕", version: "v0.2" },
  { id: "uscc", name: "统一社会信用代码", code: "uscc", owner: "主体资质", media: ["all"], stage: "apply", role: "商务", visible: true, required: false, source: "新主数据字段", condition: "巨量 AD 必填；本地推待规则确认", validation: "18 位；仅新数据强校验", correction: "主体变更留痕", version: "v0.2" },
  { id: "bank_account", name: "主体开户行与账号", code: "subject_bank_account", owner: "主体资质", media: ["100"], stage: "apply", role: "商务", visible: true, required: true, source: "新主数据字段", condition: "巨量 AD；历史数据允许待补", validation: "账号脱敏展示", correction: "主体变更留痕", version: "v0.2" },
  { id: "account_name", name: "广告账户名称", code: "account_name", owner: "广告账户", media: ["all"], stage: "reply", role: "开户媒介", visible: true, required: true, source: "媒介回填 / 批量导入", condition: "每个账户结果行", validation: "客户内重复提示", correction: "处理节点可改", version: "v0.2" },
  { id: "account_id", name: "广告账户 ID", code: "account_id", owner: "广告账户", media: ["all"], stage: "reply", role: "开户媒介", visible: true, required: true, source: "平台返回 / 批量粘贴", condition: "开户成功行", validation: "巨量 16 位；腾讯按产品规则", correction: "修改需审计", version: "v0.2" },
  { id: "zongheng_id", name: "纵横 ID", code: "zongheng_id", owner: "广告账户新字段", media: ["102", "100"], stage: "reply", role: "开户媒介", visible: true, required: false, source: "媒介补录", condition: "仅巨量且业务需要；允许待补", validation: "不得以“来源为空+硬必填”发布", correction: "修改需审计", version: "v0.2" },
  { id: "asset_owner", name: "上游资产归属", code: "asset_owner_type", owner: "广告账户", media: ["all"], stage: "reply", role: "开户媒介", visible: true, required: true, source: "申请需求默认", condition: "广告主自有 / 渠道代管", validation: "不等同任务经办人", correction: "需说明原因", version: "v0.2" },
  { id: "cash_amount", name: "现金充值金额", code: "cash_recharge", owner: "充值单快照", media: ["all"], stage: "recharge", role: "商务 / 充值媒介", visible: true, required: true, source: "当次输入", condition: "账户充值", validation: "大于 0", correction: "完成后走调整单", version: "v0.2" },
  { id: "before_ratio", name: "前返", code: "before_ratio", owner: "充值单快照", media: ["all"], stage: "recharge", role: "商务 / 充值媒介", visible: true, required: true, source: "合同 / 报价规则快照", condition: "账户充值", validation: "不能直接取客户当前值当交易事实", correction: "偏离默认需说明", version: "v0.2" },
  { id: "wallet_key", name: "客户钱包", code: "wallet_key", owner: "充值单快照", media: ["all"], stage: "recharge", role: "商务 / 财务", visible: true, required: true, source: "账户 → 客户钱包", condition: "现金或授信拆分", validation: "一类 / 二类必须明确", correction: "完成后走调整单", version: "v0.2" }
];

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (error) { return false; }
}

const initialFeedbackDraft = readJson("xinhuo.feedbackDraft", {});

const state = {
  roleId: localStorage.getItem("xinhuo.role") || "dx",
  page: localStorage.getItem("xinhuo.page") || "biz",
  media: localStorage.getItem("xinhuo.media") || "102",
  channel: localStorage.getItem("xinhuo.channel") || "AGENT",
  stage: localStorage.getItem("xinhuo.stage") || "apply",
  taskTab: "todo",
  demandRows: 1,
  fields: readJson("xinhuo.fields", BASE_FIELDS),
  feedbacks: readJson("xinhuo.feedbacks", []),
  feedbackComposerOpen: false,
  feedbackPrefill: "",
  feedbackDraft: initialFeedbackDraft && typeof initialFeedbackDraft === "object" ? initialFeedbackDraft : {},
  pageEdits: readJson("xinhuo.pageEdits.v1", { version: 1, pages: {} }),
  pageEditMode: false,
  pageEditDraft: null,
  workflowNodes: readJson("xinhuo.workflow", [
    { name: "商务提交", rule: "发起人身份 + 数据权", sla: "草稿不计时" },
    { name: "城市开户媒介", rule: "按发起人组织逐级匹配", sla: "4 小时" },
    { name: "充值媒介", rule: "仅有首充或资金动作时进入", sla: "2 小时" },
    { name: "财务", rule: "现金 / 授信 / 超限条件触发", sla: "4 小时" }
  ])
};

let lastFocus = null;
let toastTimer = null;
let pageEditUnits = new Map();
let pageEditZones = new Map();
let pageEditTexts = new Map();
let pageEditControls = new Map();

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function roleById(id) { return ROLES.find(function (item) { return item.id === id; }) || ROLES[0]; }
function currentRole() { return roleById(state.roleId); }
function isAllowed(page) {
  const list = ACCESS[state.roleId] || [];
  return list.indexOf("*") >= 0 || list.indexOf(page) >= 0;
}
function persistRoute() {
  localStorage.setItem("xinhuo.role", state.roleId);
  localStorage.setItem("xinhuo.page", state.page);
  localStorage.setItem("xinhuo.media", state.media);
  localStorage.setItem("xinhuo.channel", state.channel);
  localStorage.setItem("xinhuo.stage", state.stage);
}

function tag(text, tone) { return "<span class=\"tag " + esc(tone || "") + "\">" + esc(text) + "</span>"; }
function metric(label, value, detail, kind) {
  return [
    "<article class=\"card metric-card ", esc(kind || "fact"), "\">",
    "<div class=\"metric-label\">", esc(label), "</div>",
    "<div class=\"metric-value\">", esc(value), "</div>",
    "<div class=\"metric-detail\">", esc(detail || ""), "</div>",
    "</article>"
  ].join("");
}
function card(title, subtitle, body, footer) {
  return [
    "<article class=\"card\">",
    "<div class=\"card-head\"><div><h3>", title, "</h3>", subtitle ? "<p>" + subtitle + "</p>" : "", "</div></div>",
    "<div class=\"card-body\">", body, "</div>",
    footer ? "<div class=\"card-foot\">" + footer + "</div>" : "",
    "</article>"
  ].join("");
}
function dataTable(headers, rows, minWidth) {
  return [
    "<div class=\"table-wrap\"><table class=\"data-table\" style=\"min-width:", esc(minWidth || "720px"), "\">",
    "<thead><tr>", headers.map(function (h) { return "<th>" + h + "</th>"; }).join(""), "</tr></thead>",
    "<tbody>", rows.map(function (row) {
      return "<tr>" + row.map(function (cell) { return "<td>" + cell + "</td>"; }).join("") + "</tr>";
    }).join(""), "</tbody></table></div>"
  ].join("");
}
function factBanner(text) {
  return [
    "<div class=\"fact-banner\"><div><strong>生产聚合事实</strong><p>", text,
    "</p></div><span class=\"source-label\">本轮只读核验 · ", esc(SNAPSHOT.capturedAt), "</span></div>"
  ].join("");
}
function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
}

function showModal(options) {
  lastFocus = document.activeElement;
  const overlay = document.getElementById("overlay");
  const modal = overlay.querySelector(".modal");
  modal.classList.toggle("wide", Boolean(options.wide));
  document.getElementById("modalEyebrow").textContent = options.eyebrow || "需求共创";
  document.getElementById("modalTitle").textContent = options.title;
  document.getElementById("modalBody").innerHTML = options.body;
  document.getElementById("modalFoot").innerHTML = options.footer || "";
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  const first = overlay.querySelector("input, select, textarea, button");
  if (first) first.focus();
}

function closeModal() {
  document.getElementById("overlay").hidden = true;
  document.body.style.overflow = "";
  if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
}

function buildBusiness() {
  const tasks = [
    ["danger", "开户申请被退回", "KH-240914-016 · 材料不全 / ID 名称不符 · 需修正后重提", "立即处理"],
    ["warn", "媒介纠正来客 ID，待我确认", "KH-240915-002 · 已记录改前改后与原因", "查看差异"],
    ["info", "主体资质待补齐", "示例主体乙 · 巨量 AD · 历史数据缺统一信用代码", "补齐资料"]
  ];
  const taskHtml = tasks.map(function (item) {
    return [
      "<div class=\"task-item\"><span class=\"task-indicator ", item[0], "\"></span>",
      "<div><div class=\"task-title\">", item[1], "</div><div class=\"task-meta\">", item[2], "</div></div>",
      "<button class=\"button small secondary\" data-demo-action=\"", item[3], "\">", item[3], "</button></div>"
    ].join("");
  }).join("");
  const table = dataTable(
    ["单据", "客户 / 主体", "媒体产品", "供货渠道", "当前节点", "停留", "动作"],
    [
      ["<strong>KH-240915-021</strong>", "示例客户甲 / 示例主体甲", tag("巨量本地推", "brand"), tag("AGENT 自有", "success"), tag("开户媒介", "warn"), "3.1h", "<button class=\"button small quiet\" data-demo-action=\"查看进度\">查看进度</button>"],
      ["<strong>KH-240915-018</strong>", "示例客户乙 / 示例主体乙", tag("巨量 AD", "info"), tag("NOAGENT 外转", "info"), tag("待我补资料", "danger"), "1.0h", "<button class=\"button small quiet\" data-go=\"apply\">继续填写</button>"],
      ["<strong>SX-240915-002</strong>", "示例客户丙", tag("授信", ""), "—", tag("财务规则复核", "warn"), "0.5h", "<button class=\"button small quiet\" data-demo-action=\"打开原单\">打开原单</button>"]
    ],
    "900px"
  );
  const quick = [
    "<div class=\"quick-actions\">",
    "<button class=\"quick-action\" data-go=\"apply\"><strong>新建开户申请</strong><span>先选客户与主体，再加账户需求行</span></button>",
    "<button class=\"quick-action\" data-go=\"customer\"><strong>查客户档案</strong><span>查看四层对象、流程和变更</span></button>",
    "<button class=\"quick-action\" data-open-feedback><strong>提交字段问题</strong><span>自动带上当前角色与页面</span></button>",
    "<button class=\"quick-action\" data-demo-action=\"新建客户提报\"><strong>新建客户提报</strong><span>由数据治理去重后落主数据</span></button>",
    "</div>"
  ].join("");
  return [
    "<div class=\"stack\">",
    factBanner("有效商务岗位 15 人，但近期只有 3 人登录；189 单开户申请中，商务岗位提交 120 单、申请 1,853 个账户。工作台要服务批量提单与退回修正，而不是展示全公司消耗。"),
    "<div class=\"grid grid-4\">",
    metric("待我补资料", "1", "演示待办 · 点击回原单", "todo"),
    metric("被退回", "1", "演示待办 · 保留原申请号", "todo"),
    metric("我发起进行中", "6", "演示待办 · 显示当前节点", "todo"),
    metric("数据变更待确认", "2", "演示待办 · 来客 / 资质", "todo"),
    "</div>",
    "<div class=\"grid grid-main\">",
    card("待我处理", "任务口径来自工作流实例；以下为脱敏演示单", taskHtml),
    card("快捷发起", "只保留商务高频动作", quick),
    "</div>",
    card("我发起的业务", "媒体产品与供货渠道分别展示，避免“本地推·外转”混成一个类型", table),
    "</div>"
  ].join("");
}

function buildOps() {
  const table = dataTable(
    ["任务来源", "客户", "问题", "可见性来源", "状态", "动作"],
    [
      [tag("消耗接口", "info"), "示例客户甲", "连续 2 日消耗为 0", "本部门共享", tag("待核对", "warn"), "<button class=\"button small secondary\" data-demo-action=\"分派核对\">分派</button>"],
      [tag("账户标签", ""), "示例客户乙", "媒体状态与 CRM 生命周期不一致", "协作给我", tag("数据异常", "danger"), "<button class=\"button small secondary\" data-go=\"customer\">查账户</button>"],
      [tag("开户完成", "success"), "示例客户丙", "新账户待运营分配", "部门及以下", tag("待分配", "warn"), "<button class=\"button small secondary\" data-demo-action=\"分配运营\">处理</button>"]
    ],
    "820px"
  );
  return [
    "<div class=\"stack\">",
    factBanner("抖音运营 8 人、仅 2 人近期登录；生产权限含 195 个节点，且残留停用媒体树。目标态按消耗、分配和协作任务收敛，不复刻整棵菜单。"),
    "<div class=\"grid grid-4\">",
    metric("待分配账户", "7", "演示队列", "todo"),
    metric("消耗异常", "3", "演示队列", "todo"),
    metric("协作给我", "5", "来自 refuser / refdep", "todo"),
    metric("生产账户总量", "12,614", "聚合事实 · 不是我的待办", "fact"),
    "</div>",
    card("运营任务队列", "区分本人、本部门、部门及以下、自定义与协作共享", table),
    "</div>"
  ].join("");
}

function buildOpen() {
  const queue = dataTable(
    ["优先级", "申请", "发起组织", "主体", "媒体产品", "渠道", "需求户数", "等待", "动作"],
    [
      [tag("超时", "danger"), "<strong>KH-240915-021</strong>", "沈阳事业二部", "示例主体甲", tag("巨量本地推", "brand"), tag("AGENT", "success"), "12", "5.2h", "<button class=\"button small primary\" data-go=\"handle\">领取处理</button>"],
      [tag("普通", ""), "<strong>KH-240915-019</strong>", "沈阳事业一部", "示例主体乙", tag("巨量 AD", "info"), tag("NOAGENT", "info"), "3", "2.1h", "<button class=\"button small secondary\" data-go=\"handle\">查看</button>"],
      [tag("资料缺失", "warn"), "<strong>KH-240915-016</strong>", "厦门抖音事业部", "示例主体丙", tag("巨量本地推", "brand"), tag("NOAGENT", "info"), "1", "1.4h", "<button class=\"button small secondary\" data-demo-action=\"退回补资料\">退回</button>"]
    ],
    "980px"
  );
  return [
    "<div class=\"stack\">",
    factBanner("开户申请共 189 单：173 已处理、16 退回/取消。已处理的 AGENT 平均 3.2h，NOAGENT 平均 10.9h；只有 155 单的账户结果数量与申请数量一致。"),
    "<div class=\"grid grid-4\">",
    metric("历史申请", "189", "173 已处理 · 16 退回/取消", "fact"),
    metric("近 30 日", "90 单", "合计申请 1,358 户", "fact"),
    metric("AGENT 均响", SNAPSHOT.openAvgAgent, "生产历史口径", "fact"),
    metric("NOAGENT 均响", SNAPSHOT.openAvgExternal, "生产历史口径", "fact"),
    "</div>",
    "<div class=\"card\"><div class=\"card-head\"><div><h3>组织开户队列</h3><p>演示队列 · 真实产品需由工作流任务表驱动</p></div>",
    "<div class=\"segmented\"><button class=\"active\">可领取</button><button>我处理中</button><button>退回待回流</button><button>已完成</button></div></div>",
    "<div class=\"card-body\">", queue, "</div></div>",
    "<div class=\"prototype-note\"><strong>已补的关键维度：</strong> 批量户数、逐账户结果、部分成功、材料退回、AGENT / NOAGENT 分支、组织队列和 SLA；不再用整单“处理/未处理”二态覆盖所有情况。</div>",
    "</div>"
  ].join("");
}

function buildRecharge() {
  const rows = dataTable(
    ["来源", "单号", "账户", "现金", "渠道", "平台同步", "业务状态", "动作"],
    [
      [tag("机器人", "info"), "CZ-240915-088", "示例账户 A", "¥30,000", tag("AGENT", "success"), tag("成功", "success"), tag("已完成", "success"), "<button class=\"button small secondary\" data-demo-action=\"查看回群回执\">查看回执</button>"],
      [tag("PC", ""), "CZ-240915-091", "示例账户 B", "¥8,000", tag("NOAGENT", "info"), tag("无需 API", ""), tag("待线下凭证", "warn"), "<button class=\"button small primary\" data-demo-action=\"登记凭证\">登记</button>"],
      [tag("机器人", "info"), "CZ-240915-093", "示例账户 C", "¥5,000", tag("AGENT", "success"), tag("结果不确定", "danger"), tag("人工接管", "danger"), "<button class=\"button small primary\" data-demo-action=\"核对幂等键\">核对</button>"]
    ],
    "900px"
  );
  const calc = [
    "<div class=\"form-grid\">",
    "<div class=\"field\"><label for=\"cashInput\">现金金额</label><input id=\"cashInput\" type=\"number\" min=\"0\" value=\"30000\"></div>",
    "<div class=\"field\"><label for=\"ratioInput\">前返快照 %</label><input id=\"ratioInput\" type=\"number\" step=\"0.01\" value=\"14\"><div class=\"field-help\">来自合同 / 报价规则，不直接取客户当前值</div></div>",
    "<div class=\"field\"><label for=\"walletInput\">客户钱包</label><select id=\"walletInput\"><option>一类钱包</option><option>二类钱包</option></select></div>",
    "<div class=\"field\"><label for=\"currencyOutput\">货币预览</label><input id=\"currencyOutput\" value=\"34200\" readonly></div>",
    "</div>"
  ].join("");
  return [
    "<div class=\"stack\">",
    factBanner("有效充值 1,283 笔：1,280 完成、3 拒回；机器人来源 1,020、PC 248、来源空 15。sync_state=0 的 199 笔主要是外部代理记账，不能一律标成同步失败。"),
    "<div class=\"grid grid-4\">",
    metric("有效充值", "1,283", "1,280 完成 · 3 拒回", "fact"),
    metric("机器人来源", "1,020", "自动入口，不是人工角色", "fact"),
    metric("近 30 日现金", "¥932.41万", "货币 ¥1,057.26万", "fact"),
    metric("待人工处理", "3", "演示：凭证 / 不确定结果", "todo"),
    "</div>",
    card("人工接管队列", "将“无需同步”“同步失败”“结果不确定”分开", rows),
    card("充值规则演示", "前返必须留交易快照；319 个客户中仅 7 个当前前返非零，不能作为历史交易事实", calc,
      "<button class=\"button secondary\" data-demo-action=\"保存草稿\">保存草稿</button><button class=\"button primary\" id=\"recalc\">重算并校验</button>"),
    "</div>"
  ].join("");
}

function buildFinance() {
  const rows = dataTable(
    ["任务", "生产数量", "金额 / 范围", "风险", "目标动作"],
    [
      ["现金到账确认", "<strong>142 / 144 待确认</strong>", SNAPSHOT.cashPendingAmount, tag("真实积压", "danger"), "选择一类/二类钱包后确认"],
      ["客户对账单", "<strong>206 / 225 未完成</strong>", "按客户与账期", tag("闭环率低", "danger"), "差异处理后人工锁定"],
      ["授信申请", "<strong>254 笔历史全部完成</strong>", "现有金额规则存在空档", tag("疑似跳过审批", "warn"), "规则命中预览 + 原单审批"],
      ["供应商付款", "<strong>282 条供应商账单</strong>", "按供应商与账期", tag("需归口", ""), "付款凭证与账户遮罩"]
    ],
    "860px"
  );
  return [
    "<div class=\"stack\">",
    factBanner("现金收款有效 144 笔，其中 142 笔待确认、待确认金额 380.54 万；225 张对账单仅 19 张完成。原型不再用“待确认 8 / 待对账 12”的无来源数字。"),
    "<div class=\"grid grid-4\">",
    metric("现金到账待确认", "142", SNAPSHOT.cashPendingAmount, "fact"),
    metric("对账单未完成", "206", "225 张仅 19 完成", "fact"),
    metric("授信规则", "需复核", "历史 254 笔均为完成态", "fact"),
    metric("我的优先任务", "12", "演示队列 · 非生产数", "todo"),
    "</div>",
    card("财务任务口径", "生产聚合事实与目标工作台动作对照", rows),
    "<div class=\"prototype-note\"><strong>规则冲突：</strong> 现有审批金额区间有缺口，授信历史数据又全部处于完成态。上线前必须用回放数据验证每一档金额会命中谁，不能只把审批人画在流程图里。</div>",
    "</div>"
  ].join("");
}

function buildBoss() {
  const organization = dataTable(
    ["组织", "启用用户", "主要人群", "数据范围", "关注点"],
    [
      ["沈阳事业部子树", "23", "商务 / 运营 / 总经办", "多层部门", "批量开户、队列 SLA"],
      ["厦门", "15", "媒介 / 财务 / 管理", "跨角色兼职", "资金与开户协同"],
      ["天津", "4", "商务 / 媒介 / 人事", "小团队", "无人处理兜底"],
      ["根组织直挂", "5", "管理 / 系统", "全局或特殊", "权限收敛"]
    ],
    "760px"
  );
  return [
    "<div class=\"stack\">",
    factBanner("管理层不再合并成“老板”角色：总经理 5 人、data_scope=本部门；董事长 2 人、data_scope=全部。看板范围必须跟角色和组织同时变化。"),
    "<div class=\"grid grid-4\">",
    metric("有效客户", "319", "统一客户树目标", "fact"),
    metric("广告账户", "12,614", "35 个客户拥有 100+ 账户", "fact"),
    metric("开户近 30 日", "90 单", "1,358 户 · 均响 6.8h", "fact"),
    metric("充值近 30 日", "¥932.41万", "现金 → 货币 ¥1,057.26万", "fact"),
    "</div>",
    "<div class=\"grid grid-main\">",
    card("组织视角", "生产组织并非“城市 = 角色”，沈阳还有事业一/二部等多层级", organization),
    card("权限提示", "当前模拟角色：" + esc(currentRole().name),
      "<div class=\"summary-list\"><div class=\"summary-row\"><span>数据范围</span><strong>" + esc(currentRole().scope) + "</strong></div><div class=\"summary-row\"><span>审批方式</span><strong>从待办回原单</strong></div><div class=\"summary-row\"><span>看板操作</span><strong>只读，不直接改单</strong></div></div>"),
    "</div>",
    "</div>"
  ].join("");
}

function buildData() {
  const rows = dataTable(
    ["问题", "真实数量", "影响", "治理动作"],
    [
      ["跨旧媒体树同名客户", "54 个名称", "一客多档、数据权混乱", "统一客户树 + 去重合并"],
      ["跨类型重复广告账户 ID", "146 组", "同一账户出现两份", "账户 ID 唯一校验 + 合并映射"],
      ["店铺编号不是来客 ID", "8,244 中仅 32 个是 19 位", "来客信息在落库时丢失", "新增 laike_id，保留 shop_no"],
      ["账户结果数量不一致", "173 已处理中仅 155 匹配", "整单完成掩盖部分失败", "逐账户结果与部分成功"],
      ["申请客户 ID / 名称漂移", "8 单不一致；3 个指向删除客户", "错误关联", "只选 ID，名称自动带出"]
    ],
    "880px"
  );
  return [
    "<div class=\"stack\">",
    factBanner("AE 数据仅 1 人，却有 409 个权限节点和近期 2,641 次操作；目标是独立的数据治理工作台，不再默认等于系统管理员。"),
    "<div class=\"grid grid-4\">",
    metric("有效客户", "319", "旧树合并前", "fact"),
    metric("有效主体", "1,812", "65 个名称跨客户类型重复", "fact"),
    metric("有效店铺", "8,244", "5,628 与主体同名", "fact"),
    metric("广告账户", "12,614", "146 组跨树重复 ID", "fact"),
    "</div>",
    card("数据质量队列", "只展示能采取治理动作的事实，不把空字段机械当问题", rows),
    "</div>"
  ].join("");
}

function qualificationFields() {
  if (state.media === "102") {
    return [
      "<div class=\"field\"><label for=\"laikeName\">来客名称 <span class=\"required\">必填</span></label><input id=\"laikeName\" value=\"示例来客门店\"><div class=\"field-help\"><span class=\"field-source\">来源：来客档案 / 新建</span></div></div>",
      "<div class=\"field\"><label for=\"laikeId\">来客 ID <span class=\"required\">必填</span></label><input id=\"laikeId\" inputmode=\"numeric\" placeholder=\"19 位数字\"><div class=\"field-help\">独立新字段 laike_id，不复用现有 shop_no</div></div>",
      "<div class=\"field\"><label for=\"directId\">巨量直客 ID <span class=\"muted\">可后补</span></label><input id=\"directId\" inputmode=\"numeric\" placeholder=\"选择主体历史值或本次输入\"><div class=\"field-help\">落申请与账户；主体页只做多值汇总</div></div>",
      "<div class=\"field\"><label for=\"localQualification\">主体资质状态</label><select id=\"localQualification\"><option>已通过来客资质，待规则确认是否复用</option><option>需补主体资质</option><option>历史数据缺失</option></select><div class=\"field-help\">本地推是否免执照/银行资料尚未确认，不能硬隐藏</div></div>"
    ].join("");
  }
  if (state.media === "100") {
    return [
      "<div class=\"field\"><label for=\"industry\">行业 <span class=\"required\">必填</span></label><select id=\"industry\"><option>生活服务 / 美容美体</option><option>餐饮服务</option></select><div class=\"field-help\"><span class=\"field-source\">来源：主体资质新字段</span></div></div>",
      "<div class=\"field\"><label for=\"uscc\">统一社会信用代码 <span class=\"required\">必填</span></label><input id=\"uscc\" maxlength=\"18\" placeholder=\"18 位\"><div class=\"field-help\">历史缺失允许补录；新数据强校验</div></div>",
      "<div class=\"field\"><label for=\"subjectBank\">主体开户银行 <span class=\"required\">必填</span></label><input id=\"subjectBank\" placeholder=\"新主数据字段\"></div>",
      "<div class=\"field\"><label for=\"subjectBankAccount\">主体银行账号 <span class=\"required\">必填</span></label><input id=\"subjectBankAccount\" placeholder=\"保存后按权限遮罩\"></div>",
      "<div class=\"field full\"><label for=\"subjectAddress\">住所 <span class=\"required\">必填</span></label><input id=\"subjectAddress\" placeholder=\"营业执照住所\"></div>"
    ].join("");
  }
  if (state.media === "1002") {
    return [
      "<div class=\"field full\"><div class=\"prototype-note\"><strong>腾讯广告模板：</strong> 不显示巨量直客 ID、来客与纵横 ID；账户 ID 使用腾讯产品规则，不能继续套用巨量 16 位校验。</div></div>"
    ].join("");
  }
  return [
    "<div class=\"field full\"><div class=\"prototype-note\"><strong>历史产品：</strong> 快手已停用。原型仅保留迁移兼容查看，不允许新建开户申请。</div></div>"
  ].join("");
}

function demandRows() {
  const product = state.media === "102" ? "巨量本地推" : state.media === "100" ? "巨量 AD" : state.media === "1002" ? "腾讯广告" : "快手（停用）";
  const channel = state.channel === "AGENT" ? "AGENT 自有端口" : "NOAGENT 外部代理";
  const rows = [];
  for (let i = 0; i < state.demandRows; i += 1) {
    rows.push([
      "<strong>需求 " + (i + 1) + "</strong>",
      tag(product, state.media === "102" ? "brand" : "info"),
      tag(channel, state.channel === "AGENT" ? "success" : "info"),
      "<input aria-label=\"开户数量\" type=\"number\" min=\"1\" value=\"" + (i === 0 ? "10" : "1") + "\" style=\"min-width:76px\">",
      state.media === "102" || state.media === "100" ? "<input aria-label=\"巨量直客 ID\" placeholder=\"可待媒介补\" style=\"min-width:130px\">" : "不适用",
      "<select aria-label=\"首充需求\" style=\"min-width:120px\"><option>无首充</option><option>开户后首充</option></select>",
      state.demandRows > 1 ? "<button class=\"button small danger\" data-remove-demand=\"" + i + "\">移除</button>" : "<span class=\"muted\">—</span>"
    ]);
  }
  return dataTable(["明细", "媒体产品", "供货渠道", "开户数量", "平台直客 ID", "首充", "操作"], rows, "860px");
}

function buildApply() {
  const disabled = state.media === "1003";
  return [
    "<div class=\"stack\">",
    factBanner("189 张旧申请只有 customer_id；主体、店铺、供应商仍是名称文本，已出现 8 单客户 ID 与名称不一致、3 单指向已删除客户。新原型坚持“选 ID、名称带出”。"),
    "<div class=\"object-path\">",
    "<div class=\"object-node\"><span>第一层 · 合作/付款方</span><strong>客户</strong><small>319 个有效客户</small></div>",
    "<div class=\"object-node\"><span>第二层 · 营业执照公司</span><strong>主体</strong><small>1,812 个有效主体</small></div>",
    "<div class=\"object-node\"><span>第三层 · 业务门店</span><strong>店铺 / 来客</strong><small>shop_no 与 laike_id 分开</small></div>",
    "<div class=\"object-node\"><span>第四层 · 媒体投放资产</span><strong>广告账户</strong><small>产品与渠道落在此层</small></div>",
    "</div>",
    "<article class=\"card\"><div class=\"card-head\"><div><h3>1. 选择主数据与开户维度</h3><p>媒体产品和供货渠道是两个正交维度，不能再用“本地推 / 非本地推”混合控制。</p></div></div>",
    "<div class=\"card-body\"><div class=\"form-grid\">",
    "<div class=\"field\"><label for=\"customerSelect\">客户 <span class=\"required\">必填</span></label><select id=\"customerSelect\"><option value=\"c001\">示例客户甲（合作方）</option><option value=\"c002\">示例客户乙（合作方）</option></select><div class=\"field-help\"><span class=\"field-source\">保存 customer_id；名称只读带出</span></div></div>",
    "<div class=\"field\"><label for=\"subjectSelect\">主体 / 业务称“直客名称” <span class=\"required\">必填</span></label><select id=\"subjectSelect\"><option value=\"s001\">示例主体甲有限公司</option><option value=\"s002\">示例主体乙有限公司</option></select><div class=\"field-help\">避免“直接客户”和“巨量直客 ID”混词</div></div>",
    "<div class=\"field\"><label for=\"applyMedia\">媒体产品 <span class=\"required\">必填</span></label><select id=\"applyMedia\"><option value=\"102\"" + (state.media === "102" ? " selected" : "") + ">102 · 巨量本地推</option><option value=\"100\"" + (state.media === "100" ? " selected" : "") + ">100 · 巨量 AD</option><option value=\"1002\"" + (state.media === "1002" ? " selected" : "") + ">1002 · 腾讯广告</option><option value=\"1003\"" + (state.media === "1003" ? " selected" : "") + ">1003 · 快手（停用）</option></select><div class=\"field-help\">保存稳定字典码；中文只用于显示</div></div>",
    "<div class=\"field\"><label for=\"applyChannel\">供货渠道 <span class=\"required\">必填</span></label><select id=\"applyChannel\"><option value=\"AGENT\"" + (state.channel === "AGENT" ? " selected" : "") + ">AGENT · 自有端口 / API</option><option value=\"NOAGENT\"" + (state.channel === "NOAGENT" ? " selected" : "") + ">NOAGENT · 外部代理 / 记账</option></select><div class=\"field-help\">供应商再按产品 + 渠道过滤</div></div>",
    "<div class=\"field full\"><label for=\"supplierSelect\">供应商 <span class=\"required\">必填</span></label><select id=\"supplierSelect\"><option>示例供应商 · " + esc(state.channel) + " · 支持当前产品</option></select></div>",
    "</div></div></article>",
    "<article class=\"card\"><div class=\"card-head\"><div><h3>2. 按产品补齐资质</h3><p>字段由模板条件驱动，历史缺失与新单必填策略分开。</p></div><button class=\"button small secondary\" data-open-feedback data-field=\"资质字段\">字段不对？</button></div>",
    "<div class=\"card-body\"><div class=\"form-grid\">", qualificationFields(), "</div></div></article>",
    "<article class=\"card\"><div class=\"card-head\"><div><h3>3. 账户需求明细</h3><p>一张申请常含多账户；每行保留独立结果和平台 ID，支持部分成功。</p></div><button class=\"button secondary\" id=\"addDemand\">＋ 增加账户需求</button></div>",
    "<div class=\"card-body\"><div id=\"demandTable\">", demandRows(), "</div></div></article>",
    "<article class=\"card\"><div class=\"card-head\"><div><h3>4. 路由与提交</h3><p>目标态：按组织和条件路由；企业微信组织尚未在现网配置，不能假装已接入。</p></div></div>",
    "<div class=\"card-body\"><div class=\"grid grid-2\"><div class=\"summary-list\">",
    "<div class=\"summary-row\"><span>发起组织（演示）</span><strong>沈阳事业二部 / 商务二部</strong></div>",
    "<div class=\"summary-row\"><span>目标队列</span><strong>沈阳开户媒介候选人</strong></div>",
    "<div class=\"summary-row\"><span>无匹配兜底</span><strong>上级组织 → 系统管理员</strong></div>",
    "</div><div class=\"prototype-note\"><strong>提交前检查：</strong> 主数据引用、产品字典码、条件必填、重复账户、历史缺失策略和路由候选人均通过后才允许提交。</div></div></div>",
    "<div class=\"card-foot\"><button class=\"button secondary\" data-demo-action=\"已保存草稿\">保存草稿</button><button class=\"button primary\" id=\"submitApply\"" + (disabled ? " disabled" : "") + ">提交开户申请</button></div></article>",
    "</div>"
  ].join("");
}

function buildHandle() {
  const resultRows = dataTable(
    ["序号", "账户 ID", "账户名称", "直客 ID", "纵横 ID", "结果"],
    [
      ["1", "1750000000000001", "示例主体甲-01", "790000001", "1760000000000001", tag("校验通过", "success")],
      ["2", "1750000000000002", "示例主体甲-02", "790000001", "—", tag("纵横待补", "warn")],
      ["3", "—", "示例主体甲-03", "790000002", "—", tag("部分失败", "danger")]
    ],
    "760px"
  );
  return [
    "<div class=\"stack\">",
    factBanner("173 个已处理申请中只有 155 个账户结果数量与申请数量一致；AGENT 申请平均 10.6 户/单、NOAGENT 16.6 户/单。处理页必须支持批量和逐行结果。"),
    "<div class=\"grid grid-aside\">",
    card("申请快照 · 只读", "KH-240915-021 · 模板版本 v0.2",
      "<div class=\"summary-list\"><div class=\"summary-row\"><span>客户</span><strong>示例客户甲</strong></div><div class=\"summary-row\"><span>主体</span><strong>示例主体甲有限公司</strong></div><div class=\"summary-row\"><span>产品 / 渠道</span><strong>巨量本地推 / AGENT</strong></div><div class=\"summary-row\"><span>来客 ID</span><strong>7669638049290012726</strong></div><div class=\"summary-row\"><span>需求数量</span><strong>12 户</strong></div></div>"),
    card("批量回填账户", "粘贴或导入后逐行校验；不再回复一次、另一菜单重录一次",
      "<div class=\"field\"><label for=\"batchAccounts\">批量数据（账户ID,账户名称,直客ID,纵横ID）</label><textarea id=\"batchAccounts\" placeholder=\"每行一个账户；可先粘贴三行演示数据\"></textarea><div class=\"field-help\">巨量账户按 16 位校验；腾讯按产品模板校验。</div></div>",
      "<button class=\"button secondary\" id=\"loadSampleAccounts\">填入演示数据</button><button class=\"button primary\" id=\"parseAccounts\">校验并预览</button>"),
    "</div>",
    card("逐账户处理结果", "允许成功、待补、失败并存；整单状态由明细汇总", "<div id=\"accountResults\">" + resultRows + "</div>"),
    "<div class=\"grid grid-2\">",
    card("来客纠错闭环", "修改前后、原因、证据和商务确认均留痕",
      "<div class=\"form-grid\"><div class=\"field\"><label for=\"oldLaike\">原来客 ID</label><input id=\"oldLaike\" value=\"7669638049290012726\" readonly></div><div class=\"field\"><label for=\"newLaike\">改正后 ID</label><input id=\"newLaike\" placeholder=\"不改可留空\"></div><div class=\"field full\"><label for=\"changeReason\">修改原因</label><textarea id=\"changeReason\" placeholder=\"改来客 ID 时必填\"></textarea></div></div>"),
    card("完成规则", "不把整单二态当作真实结果",
      "<div class=\"rule-list\"><div class=\"rule-item\"><strong>全部成功：</strong> 账户数与需求数一致，进入完成。</div><div class=\"rule-item\"><strong>部分成功：</strong> 已落账户可用，其余保留待补。</div><div class=\"rule-item\"><strong>退回：</strong> 材料或主数据问题回到商务，保留原申请号与版本。</div></div>",
      "<button class=\"button primary\" id=\"completeOpen\">保存本次处理</button>"),
    "</div>",
    "</div>"
  ].join("");
}

function buildCustomer() {
  const accounts = dataTable(
    ["账户 ID", "产品", "供货渠道", "供应商", "生命周期", "媒体状态", "直客 ID"],
    [
      ["1750…0001", tag("巨量本地推", "brand"), tag("AGENT", "success"), "示例自有端口", tag("有效", "success"), "接口待同步", "790000001"],
      ["1750…0002", tag("巨量本地推", "brand"), tag("NOAGENT", "info"), "示例外部代理", tag("已转户", "warn"), "外部维护", "790000002"],
      ["1200…0312", tag("腾讯广告", "info"), tag("NOAGENT", "info"), "示例外部代理", tag("有效", "success"), "不适用", "不适用"]
    ],
    "900px"
  );
  return [
    "<div class=\"stack\">",
    factBanner("有效客户 319、主体 1,812、店铺 8,244、账户 12,614。35 个客户拥有 100+ 账户，详情必须默认汇总并分页，不能一次平铺。"),
    "<div class=\"object-path\">",
    "<div class=\"object-node\"><span>客户</span><strong>示例客户甲</strong><small>关系：直接合作客户</small></div>",
    "<div class=\"object-node\"><span>主体</span><strong>示例主体甲有限公司</strong><small>巨量直客 ID 汇总：2 个</small></div>",
    "<div class=\"object-node\"><span>店铺</span><strong>示例来客门店</strong><small>来客 ID 与内部编号分列</small></div>",
    "<div class=\"object-node\"><span>广告账户</span><strong>153 个</strong><small>默认汇总 + 筛选 + 分页</small></div>",
    "</div>",
    "<div class=\"grid grid-main\">",
    card("主体与平台 ID", "业务称谓和技术字段分开",
      "<div class=\"summary-list\"><div class=\"summary-row\"><span>主体名称（业务称直客名称）</span><strong>示例主体甲有限公司</strong></div><div class=\"summary-row\"><span>巨量直客 ID（多值汇总）</span><strong>790000001 · 790000002</strong></div><div class=\"summary-row\"><span>店铺内部编号 shop_no</span><strong>WZ-EXAMPLE-001</strong></div><div class=\"summary-row\"><span>独立来客 ID laike_id</span><strong>7669638049290012726</strong></div></div>"),
    card("数据可见性", "不是角色或部门二选一",
      "<div class=\"rule-list\"><div class=\"rule-item\"><strong>本人：</strong> sale_id / service_id。</div><div class=\"rule-item\"><strong>组织：</strong> 本部门、部门及以下、自定义、全部。</div><div class=\"rule-item\"><strong>协作：</strong> 共享给我、共享给部门、流程经办。</div></div>"),
    "</div>",
    card("广告账户", "CRM 生命周期与媒体在投状态分开；run_status 全 0 不能当作真实状态", accounts),
    "<div class=\"prototype-note\"><strong>主数据冲突：</strong> 旧两棵树造成 54 个同名客户、65 个同名主体和 146 组重复账户 ID。合并时保留媒体特有能力，但只保留一份客户/主体/账户身份。</div>",
    "</div>"
  ].join("");
}

function buildSupplier() {
  const rows = dataTable(
    ["供应商", "类型", "适用产品", "被账户引用", "付款资料", "端口余额", "状态"],
    [
      ["示例自有端口 A", tag("AGENT", "success"), "巨量本地推", "是", "不适用", "接口余额 / 阈值", tag("有效", "success")],
      ["示例自有端口 B", tag("AGENT", "success"), "巨量 AD", "是", "不适用", "接口余额 / 阈值", tag("有效", "success")],
      ["示例外部代理甲", tag("NOAGENT", "info"), "巨量本地推 / AD", "是", "户名、银行、账号、支行地址", "不适用", tag("有效", "success")],
      ["示例未使用供应商", tag("NOAGENT", "info"), "历史", "否", "历史缺失", "不适用", tag("待停用", "warn")]
    ],
    "860px"
  );
  return [
    "<div class=\"stack\">",
    factBanner("有效供应商 20 家，其中 17 家被账户实际引用。供应商银行字段当前无可信列，不能在模板里标“默认从供应商带出”后假装已经具备。"),
    "<div class=\"grid grid-4\">",
    metric("有效供应商", "20", "17 家被账户引用", "fact"),
    metric("AGENT 自有端口", "2", "通过平台 API 处理", "fact"),
    metric("NOAGENT 外部代理", "15", "线下划款 + CRM 记账", "fact"),
    metric("未使用", "3", "需确认停用 / 合并", "fact"),
    "</div>",
    card("供应商主数据", "付款资料仅 NOAGENT 条件必填；敏感账号按角色遮罩", rows,
      "<button class=\"button secondary\" data-open-feedback data-field=\"供应商付款资料\">＋ 提交字段调整</button>"),
    "</div>"
  ].join("");
}

function buildAutomation() {
  const rows = dataTable(
    ["步骤", "示例状态", "控制点", "异常动作"],
    [
      ["接收群指令", tag("已接收", "success"), "原始消息哈希 + 客户群绑定", "无法识别则不建单"],
      ["解析账户与金额", tag("已匹配", "success"), "账户必须属于该群客户", "歧义转人工"],
      ["幂等检查", tag("无重复", "success"), "外部单号 / 指令哈希", "重复只回执不重充"],
      ["平台或记账", tag("结果不确定", "warn"), "AGENT 调 API；NOAGENT 只记账", "核查平台流水后再重试"],
      ["回群回执", tag("待人工确认", "warn"), "业务结果与系统单号", "失败回执可追踪"]
    ],
    "820px"
  );
  return [
    "<div class=\"stack\">",
    factBanner("RPA 绑定 5 个服务账号，无菜单、无人工登录；有效充值 1,283 笔中 1,020 笔来自机器人，转户全部来自机器人。它是来源与执行身份，不是人工工作台角色。"),
    "<div class=\"grid grid-4\">",
    metric("RPA 服务账号", "5", "不进入人工角色切换", "fact"),
    metric("机器人充值", "1,020", "占有效充值约 79.5%", "fact"),
    metric("机器人转户", "86", "全部同客户双向同步", "fact"),
    metric("人工接管", "3", "演示：歧义 / 不确定结果", "todo"),
    "</div>",
    card("机器人交易链路", "展示原始指令、解析、幂等、平台结果与回执", rows),
    "</div>"
  ].join("");
}

const MEDIA_NAMES = { all: "全部产品", "102": "巨量本地推", "100": "巨量 AD", "1002": "腾讯广告", "1003": "快手（停用）" };
const STAGE_NAMES = { apply: "商务申请", reply: "开户回复", recharge: "账户充值" };

function filteredFields() {
  return state.fields.filter(function (field) {
    const productMatch = field.media.indexOf("all") >= 0 || field.media.indexOf(state.media) >= 0;
    return productMatch && field.stage === state.stage;
  });
}

function validateTemplate() {
  const issues = [];
  const visible = filteredFields();
  visible.forEach(function (field) {
    if (field.required && !field.visible) issues.push(field.name + "：必填字段不能隐藏");
    if (field.required && (/^空$|来源为空|无来源/.test(field.source))) issues.push(field.name + "：来源为空时不能直接硬必填");
    if (field.id === "laike_id" && field.source.indexOf("shop_no") >= 0) issues.push("来客 ID：不能复用 shop_no");
    if (field.id === "direct_customer_id" && field.owner === "主体") issues.push("巨量直客 ID：不能作为主体单值字段");
    if (field.id === "before_ratio" && field.source.indexOf("客户当前值") >= 0) issues.push("前返：不能把客户当前值当交易事实");
  });
  if (state.stage === "apply" && (state.media === "102")) {
    const laike = visible.find(function (field) { return field.id === "laike_id"; });
    if (!laike || !laike.visible || !laike.required) issues.push("巨量本地推申请：来客 ID 必须显示并按新数据规则必填");
  }
  if (state.stage === "reply") {
    const account = visible.find(function (field) { return field.id === "account_id"; });
    if (!account || !account.required) issues.push("开户回复：成功账户行必须有账户 ID");
  }
  if (state.stage === "recharge") {
    ["cash_amount", "before_ratio", "wallet_key"].forEach(function (id) {
      const item = visible.find(function (field) { return field.id === id; });
      if (!item || !item.required) issues.push("账户充值：缺少必要字段 " + id);
    });
  }
  return issues;
}

function buildTemplate() {
  const fields = filteredFields();
  const issues = validateTemplate();
  const rows = fields.map(function (field) {
    return [
      "<div class=\"field-name\"><strong>" + esc(field.name) + "</strong><span>" + esc(field.code) + " · " + esc(field.version || "草稿") + "</span></div>",
      esc(field.owner),
      esc(field.role),
      field.visible ? tag("显示", "success") : tag("隐藏", ""),
      field.required ? tag("条件必填", "warn") : tag("可选", ""),
      "<span class=\"muted-cell\">" + esc(field.source) + "</span>",
      "<span class=\"muted-cell\">" + esc(field.condition) + "<br>" + esc(field.validation) + "</span>",
      "<div class=\"row-action\"><button class=\"button small secondary\" data-edit-field=\"" + esc(field.id) + "\">编辑</button> <button class=\"button small quiet\" data-open-feedback data-field=\"" + esc(field.name) + "\">反馈</button></div>"
    ];
  });
  const issueHtml = issues.length
    ? issues.map(function (issue) { return "<div class=\"rule-item\"><strong>冲突：</strong> " + esc(issue) + "</div>"; }).join("")
    : "<div class=\"rule-item\"><strong>当前组合通过：</strong> 未发现隐藏必填、空来源硬必填、字段归属或产品阶段冲突。</div>";
  const table = dataTable(["字段 / 编码", "归属对象", "录入 / 修改角色", "显隐", "必填策略", "来源方式", "条件与校验", "操作"], rows, "1180px");
  return [
    "<div class=\"stack\">",
    factBanner("生产库尚无字段模板或字段反馈表。以下是目标态配置原型：草稿只保存在本机；发布前必须做冲突校验、影响预览和版本冻结，不会直接改生产字段。"),
    "<article class=\"card\"><div class=\"card-head\"><div><h3>模板作用域</h3><p>三个维度独立：媒体产品 × 业务阶段 × 供应商渠道；角色是字段编辑权，不是产品维度。</p></div></div>",
    "<div class=\"card-body\"><div class=\"template-toolbar\">",
    "<div class=\"field\"><label for=\"tplMedia\">媒体产品</label><select id=\"tplMedia\"><option value=\"102\"" + (state.media === "102" ? " selected" : "") + ">巨量本地推</option><option value=\"100\"" + (state.media === "100" ? " selected" : "") + ">巨量 AD</option><option value=\"1002\"" + (state.media === "1002" ? " selected" : "") + ">腾讯广告</option><option value=\"1003\"" + (state.media === "1003" ? " selected" : "") + ">快手（停用）</option></select></div>",
    "<div class=\"field\"><label for=\"tplStage\">业务阶段</label><select id=\"tplStage\"><option value=\"apply\"" + (state.stage === "apply" ? " selected" : "") + ">商务申请</option><option value=\"reply\"" + (state.stage === "reply" ? " selected" : "") + ">开户回复</option><option value=\"recharge\"" + (state.stage === "recharge" ? " selected" : "") + ">账户充值</option></select></div>",
    "<div class=\"field\"><label for=\"tplChannel\">供应商渠道</label><select id=\"tplChannel\"><option value=\"AGENT\"" + (state.channel === "AGENT" ? " selected" : "") + ">AGENT 自有端口</option><option value=\"NOAGENT\"" + (state.channel === "NOAGENT" ? " selected" : "") + ">NOAGENT 外部代理</option></select></div>",
    "<button class=\"button primary\" id=\"addField\">＋ 新增字段草稿</button>",
    "</div></div></article>",
    "<div class=\"template-health\">",
    "<div class=\"health-item\"><strong>" + fields.length + "</strong><span>当前组合字段</span></div>",
    "<div class=\"health-item " + (issues.length ? "warn" : "ok") + "\"><strong>" + issues.length + "</strong><span>规则冲突</span></div>",
    "<div class=\"health-item\"><strong>v0.2</strong><span>当前草稿版本</span></div>",
    "<div class=\"health-item\"><strong>新单</strong><span>发布仅影响新建单据</span></div>",
    "</div>",
    "<article class=\"card\"><div class=\"card-head\"><div><h3>" + esc(MEDIA_NAMES[state.media]) + " · " + esc(STAGE_NAMES[state.stage]) + "</h3><p>点击编辑可调整字段字典与表单规则；生产字段仍需技术评审和迁移。</p></div>",
    "<button class=\"button secondary\" data-open-feedback data-field=\"当前字段模板\">＋ 提交修改建议</button></div><div class=\"card-body\">",
    table || "<div class=\"empty-state\"><strong>当前组合暂无字段</strong><span>可新增字段草稿。</span></div>",
    "</div><div class=\"card-foot\"><button class=\"button secondary\" id=\"previewTemplate\">预览表单</button><button class=\"button secondary\" id=\"saveTemplate\">保存草稿</button><button class=\"button primary\" id=\"publishTemplate\"" + (issues.length ? " disabled" : "") + ">发布 v0.2</button></div></article>",
    card("发布前冲突校验", issues.length ? "有 " + issues.length + " 项需要修正" : "当前组合可进入影响预览", "<div class=\"rule-list\">" + issueHtml + "</div>"),
    "<div class=\"prototype-note\"><strong>已修正的口径：</strong> 纵横 ID 只在开户回复；巨量直客 ID 是申请 → 账户多值；来客 ID 使用独立字段；前返来自合同/报价快照；社会信用代码和银行资料标为“新主数据字段”，不假装现网已经能带出。</div>",
    "</div>"
  ].join("");
}

function buildWorkflow() {
  const flow = state.workflowNodes.map(function (node, index) {
    return [
      "<div class=\"workflow-node ", index === 1 ? "active" : "", "\"><span>节点 ", index + 1, "</span><strong>", esc(node.name), "</strong><span>", esc(node.rule), "</span><span>SLA：", esc(node.sla), "</span></div>",
      index < state.workflowNodes.length - 1 ? "<span class=\"workflow-connector\" aria-hidden=\"true\"></span>" : ""
    ].join("");
  }).join("");
  const rules = dataTable(
    ["条件", "路径", "数据范围", "兜底 / 退回"],
    [
      ["发起人属于沈阳任意下级组织", "沈阳开户媒介候选人", "发起人组织树 + 角色", "上级组织 → 系统管理员"],
      ["开户无首充", "开户完成 → 结束", "原申请参与人", "资料问题退回商务"],
      ["开户含首充", "开户完成 → 充值媒介", "同城或配置组织", "超 SLA 升级城市负责人"],
      ["NOAGENT 外部代理", "待线下开通 / 凭证", "供应商权限遮罩", "人工确认，不调用 API"],
      ["现金、授信或超限", "财务 / 审批人", "金额区间 + 组织", "区间未命中禁止提交"]
    ],
    "900px"
  );
  return [
    "<div class=\"stack\">",
    factBanner("生产仅有 10 条审批主配置和 11 条明细，尚无通用工作流表；企业微信配置也未形成可验证的线上路由。这里明确标为目标态，不冒充已部署能力。"),
    card("目标主链", "充值与财务是条件节点，不是每张开户单必经直线", "<div class=\"workflow\">" + flow + "</div>",
      "<button class=\"button secondary\" id=\"addWorkflowNode\">＋ 增加条件节点</button><button class=\"button primary\" id=\"saveWorkflow\">保存流程草稿</button>"),
    card("条件分支与组织路由", "覆盖多层组织、退回、SLA 和无人处理兜底", rules),
    "<div class=\"prototype-note\"><strong>组织迁移校验：</strong> 48 个启用用户中有 1 个引用不存在的部门；流程发布前必须把“未归属 / 异常归属”作为阻断项，不能把单据静默丢进空队列。</div>",
    "</div>"
  ].join("");
}

function buildAccess() {
  const roleCards = ROLES.filter(function (role) { return role.users > 0; }).map(function (role) {
    return [
      "<article class=\"role-card ", role.id === state.roleId ? "active" : "", "\">",
      "<div class=\"role-card-head\"><div><h4>", esc(role.name), "</h4><span class=\"role-key\">", esc(role.id), "</span></div>", tag(role.scope, role.scope === "仅本人" ? "warn" : role.scope === "本部门" ? "info" : role.scope === "服务身份" ? "" : "success"), "</div>",
      "<div class=\"role-stat\">", role.users, "<span>启用账户</span></div>",
      "<p>", esc(role.usage), "</p>",
      "<p style=\"margin-top:6px\">生产关联：", role.menus, " 个菜单/按钮节点；目标态不照搬。</p>",
      "</article>"
    ].join("");
  }).join("");
  const zeroRoles = ROLES.filter(function (role) { return role.users === 0; }).map(function (role) {
    return [esc(role.name), esc(role.id), esc(role.scope), esc(role.usage)];
  });
  const combinations = dataTable(
    ["多角色组合", "人数", "设计含义"],
    [
      ["AE数据 + 系统管理员", "1", "数据治理与系统配置应拆权"],
      ["充值媒介 + 商务岗位 + 开户媒介", "1", "一人多角色；导航为权限并集"],
      ["开户媒介 + 系统管理员", "1", "历史用管理员绕过范围"],
      ["总经理 + 董事长", "1", "本部门与全局范围需显式切换"],
      ["系统管理员 + 董事长", "1", "配置权与审批权应分离"]
    ],
    "700px"
  );
  return [
    "<div class=\"stack\">",
    factBanner("生产共有 48 个启用用户、15 个启用角色，其中 11 个角色有用户。顶部只提供 10 个人工角色模拟；RPA 单列为服务身份，4 个零用户角色进入清理清单。"),
    "<div class=\"grid grid-4\">",
    metric("启用用户", "48", "49 总账户；1 个启用用户缺角色关系", "fact"),
    metric("启用角色", "15", "11 有用户 · 4 零用户", "fact"),
    metric("多角色用户", "5", "五种组合各 1 人", "fact"),
    metric("菜单节点", "650", "21 目录 · 135 页面 · 494 按钮", "fact"),
    "</div>",
    card("真实在用角色", "账户数不等于当前在职人数；日志仅覆盖 2026-07-06 至 2026-09-15", "<div class=\"role-grid\">" + roleCards + "</div>"),
    "<div class=\"grid grid-2\">",
    card("多角色用户", "角色 ≠ 部门；实际权限是组合并集", combinations),
    card("三层数据范围", "不能只做静态角色切换",
      "<div class=\"rule-list\"><div class=\"rule-item\"><strong>功能权：</strong> 页面、按钮、接口。</div><div class=\"rule-item\"><strong>组织权：</strong> 本人、本部门、部门及以下、自定义、全部。</div><div class=\"rule-item\"><strong>协作权：</strong> 共享给我、共享给部门、流程经办。</div><div class=\"rule-item\"><strong>特殊身份：</strong> user_id=1 为代码硬编码管理员，迁移时必须显式处理。</div></div>"),
    "</div>",
    card("启用但零用户角色", "不进入人工角色切换器，需清理或确认未来用途",
      dataTable(["角色", "key", "data_scope", "现状"], zeroRoles, "640px")),
    "<div class=\"prototype-note\"><strong>权限合并原则：</strong> 抖音与其他媒体启用权限码并非完全相同（共享 46，抖音独有 16，其他媒体独有 11）。导航可以合并，但必须保留“共享对象能力 + 媒体特有能力”，不能全量粗暴折叠。</div>",
    "</div>"
  ].join("");
}

function inlineFeedbackForm() {
  const role = currentRole();
  const draft = state.feedbackDraft || {};
  const optionList = function (items, selected) {
    return items.map(function (item) {
      const value = typeof item === "string" ? item : item[0];
      const label = typeof item === "string" ? item : item[1];
      return "<option value=\"" + esc(value) + "\"" + (value === selected ? " selected" : "") + ">" + esc(label) + "</option>";
    }).join("");
  };
  const selectedObject = draft.feedbackObject || "客户";
  const selectedType = draft.feedbackType || "新增字段";
  const selectedMedia = draft.feedbackMedia || MEDIA_NAMES[state.media] || "全部产品";
  const selectedPage = PAGE_META[draft.feedbackPage] ? draft.feedbackPage : state.page;
  return [
    "<article class=\"card inline-composer\" id=\"inlineFeedbackComposer\">",
    "<div class=\"card-head\"><div><span class=\"eyebrow\">页面内填写</span><h3>新增字段调整建议</h3><p>填写后直接追加在本页下方；仅保存到当前浏览器。</p></div></div>",
    "<div class=\"card-body\"><form id=\"feedbackForm\" class=\"form-grid three\">",
    "<div class=\"field\"><label for=\"feedbackObject\">业务对象</label><select id=\"feedbackObject\">", optionList(["客户", "主体", "主体资质", "店铺 / 来客", "广告账户", "供应商", "开户申请", "充值单", "工作流 / 权限"], selectedObject), "</select></div>",
    "<div class=\"field\"><label for=\"feedbackField\">字段名称 <span class=\"required\">必填</span></label><input id=\"feedbackField\" value=\"", esc(draft.feedbackField || state.feedbackPrefill), "\" placeholder=\"例如：来客 ID\"></div>",
    "<div class=\"field\"><label for=\"feedbackType\">希望怎么改</label><select id=\"feedbackType\">", optionList(["新增字段", "修改字段含义", "修改必填规则", "修改默认来源", "修改可见 / 编辑角色", "删除或合并字段", "数据校验冲突"], selectedType), "</select></div>",
    "<div class=\"field\"><label for=\"feedbackMedia\">适用媒体产品</label><select id=\"feedbackMedia\">", optionList(["全部产品", "巨量本地推", "巨量 AD", "腾讯广告"], selectedMedia), "</select></div>",
    "<div class=\"field\"><label for=\"feedbackRole\">影响角色</label><input id=\"feedbackRole\" value=\"", esc(role.name), "\" readonly></div>",
    "<div class=\"field\"><label for=\"feedbackPage\">所在页面</label><select id=\"feedbackPage\">",
    optionList(Object.keys(PAGE_META).map(function (key) { return [key, PAGE_META[key][1]]; }), selectedPage),
    "</select></div>",
    "<div class=\"field full\"><label for=\"feedbackCurrent\">当前字段 / 规则 / 数据是什么</label><textarea id=\"feedbackCurrent\" placeholder=\"请写当前值、当前来源或遇到的冲突\">", esc(draft.feedbackCurrent || ""), "</textarea></div>",
    "<div class=\"field full\"><label for=\"feedbackExpected\">期望修改成什么 <span class=\"required\">必填</span></label><textarea id=\"feedbackExpected\" placeholder=\"请给出期望字段、条件、来源或交互\">", esc(draft.feedbackExpected || ""), "</textarea></div>",
    "<div class=\"field full\"><label for=\"feedbackReason\">为什么要改 <span class=\"required\">必填</span></label><textarea id=\"feedbackReason\" placeholder=\"说明真实业务场景、影响和不改的后果\">", esc(draft.feedbackReason || ""), "</textarea></div>",
    "<div class=\"field full\"><label for=\"feedbackExample\">脱敏示例</label><textarea id=\"feedbackExample\" placeholder=\"请勿填写真实客户姓名、电话、银行账号或密码\">", esc(draft.feedbackExample || ""), "</textarea></div>",
    "</form></div>",
    "<div class=\"card-foot\"><button class=\"button danger\" id=\"cancelInlineFeedback\">放弃草稿</button><button class=\"button secondary\" id=\"stashInlineFeedback\">暂存并收起</button><button class=\"button primary\" id=\"submitFeedback\">保存并显示在本页</button></div>",
    "</article>"
  ].join("");
}

function buildFeedback() {
  const list = state.feedbacks.length
    ? state.feedbacks.slice().reverse().map(function (item) {
        return [
          "<article class=\"submission-card\"><div><h4>", esc(item.field || "未命名字段"), " · ", esc(item.changeType), "</h4>",
          "<p>", esc(item.expected), "</p><div class=\"submission-meta\">", tag(item.status || "待评审", "warn"), tag(item.object || "未选对象", ""), tag(item.media || "全部产品", "info"), tag(item.roleName || "未知角色", ""), "</div>",
          "<p style=\"margin-top:8px\">原因：", esc(item.reason), "</p><p>页面：", esc(item.pageTitle), " · 提交时间：", esc(item.createdAt), "</p></div>",
          "<button class=\"button small secondary\" data-open-feedback data-field=\"", esc(item.field), "\">补充说明</button></article>"
        ].join("");
      }).join("")
    : "<div class=\"empty-state\"><strong>填写后会在这里继续展示</strong><span>每条建议保留字段、对象、角色、期望、原因和提交时间。</span></div>";
  const draftLabel = state.feedbackDraft && state.feedbackDraft.feedbackField ? "继续填写草稿：“" + esc(state.feedbackDraft.feedbackField) + "”" : "点击＋，直接在页面填写";
  const composer = state.feedbackComposerOpen
    ? inlineFeedbackForm()
    : "<button class=\"inline-add\" data-open-feedback><span class=\"inline-add-plus\" aria-hidden=\"true\">＋</span><strong>" + draftLabel + "</strong><small>不用弹窗；保存后继续显示在当前页面</small></button>";
  return [
    "<div class=\"stack\">",
    "<div class=\"fact-banner\"><div><strong>这是需求反馈单，不是生产改字段</strong><p>提交后保存在当前浏览器 localStorage，可导出 JSON 交给产品、开发和数据人员评审。</p></div><span class=\"source-label\">本机原型数据</span></div>",
    "<div class=\"toolbar\"><div><strong>共 ", state.feedbacks.length, " 条建议</strong><div class=\"muted small\">状态流：待评审 → 已确认 → 排期 → 已发布 / 不采纳</div></div><div class=\"filters\"><button class=\"button secondary\" id=\"exportFeedback\" ", state.feedbacks.length ? "" : "disabled", ">导出 JSON</button><button class=\"button primary\" data-open-feedback>＋ 直接填写</button></div></div>",
    composer,
    "<div class=\"submission-list\">", list, "</div>",
    "</div>"
  ].join("");
}

function openFieldEditor(fieldId) {
  const existing = state.fields.find(function (field) { return field.id === fieldId; });
  const field = existing || {
    id: "custom_" + Date.now(),
    name: "",
    code: "",
    owner: "主体资质",
    media: [state.media],
    stage: state.stage,
    role: currentRole().name,
    visible: true,
    required: false,
    source: "新主数据字段",
    condition: "按模板条件",
    validation: "待定义",
    correction: "修改需留痕",
    version: "草稿"
  };
  const body = [
    "<form id=\"fieldForm\" class=\"form-grid\">",
    "<input type=\"hidden\" id=\"fieldId\" value=\"", esc(field.id), "\">",
    "<div class=\"field\"><label for=\"fieldName\">字段名称 <span class=\"required\">必填</span></label><input id=\"fieldName\" value=\"", esc(field.name), "\"></div>",
    "<div class=\"field\"><label for=\"fieldCode\">字段编码 <span class=\"required\">必填</span></label><input id=\"fieldCode\" value=\"", esc(field.code), "\" placeholder=\"lower_snake_case\"></div>",
    "<div class=\"field\"><label for=\"fieldOwner\">归属对象</label><select id=\"fieldOwner\">",
    ["客户", "主体", "主体资质", "店铺", "店铺新字段", "申请 → 账户", "广告账户", "广告账户新字段", "供应商", "充值单快照"].map(function (item) { return "<option" + (item === field.owner ? " selected" : "") + ">" + item + "</option>"; }).join(""),
    "</select></div>",
    "<div class=\"field\"><label for=\"fieldStage\">业务阶段</label><select id=\"fieldStage\">",
    Object.keys(STAGE_NAMES).map(function (key) { return "<option value=\"" + key + "\"" + (key === field.stage ? " selected" : "") + ">" + STAGE_NAMES[key] + "</option>"; }).join(""),
    "</select></div>",
    "<div class=\"field\"><label for=\"fieldMedia\">媒体产品</label><select id=\"fieldMedia\">",
    Object.keys(MEDIA_NAMES).map(function (key) { return "<option value=\"" + key + "\"" + (field.media.indexOf(key) >= 0 ? " selected" : "") + ">" + MEDIA_NAMES[key] + "</option>"; }).join(""),
    "</select></div>",
    "<div class=\"field\"><label for=\"fieldRole\">录入 / 修改角色</label><input id=\"fieldRole\" value=\"", esc(field.role), "\"></div>",
    "<div class=\"field full\"><label for=\"fieldSource\">来源方式 <span class=\"required\">必填字段不可为空来源</span></label><input id=\"fieldSource\" value=\"", esc(field.source), "\"></div>",
    "<div class=\"field\"><label for=\"fieldCondition\">显示 / 必填条件</label><input id=\"fieldCondition\" value=\"", esc(field.condition), "\"></div>",
    "<div class=\"field\"><label for=\"fieldValidation\">校验规则</label><input id=\"fieldValidation\" value=\"", esc(field.validation), "\"></div>",
    "<div class=\"field full\"><label for=\"fieldCorrection\">下游纠错与审计</label><input id=\"fieldCorrection\" value=\"", esc(field.correction), "\"></div>",
    "<label class=\"checkbox-line\"><input type=\"checkbox\" id=\"fieldVisible\"", field.visible ? " checked" : "", "><span>在当前模板显示</span></label>",
    "<label class=\"checkbox-line\"><input type=\"checkbox\" id=\"fieldRequired\"", field.required ? " checked" : "", "><span>满足条件时必填</span></label>",
    "</form>"
  ].join("");
  showModal({
    eyebrow: existing ? "字段字典与模板" : "新增字段草稿",
    title: existing ? "编辑“" + field.name + "”" : "新增字段草稿",
    body: body,
    footer: "<button class=\"button secondary\" data-close-modal>取消</button><button class=\"button primary\" id=\"saveField\">保存并校验</button>",
    wide: true
  });
}

function saveField() {
  const value = {
    id: document.getElementById("fieldId").value,
    name: document.getElementById("fieldName").value.trim(),
    code: document.getElementById("fieldCode").value.trim(),
    owner: document.getElementById("fieldOwner").value,
    media: [document.getElementById("fieldMedia").value],
    stage: document.getElementById("fieldStage").value,
    role: document.getElementById("fieldRole").value.trim(),
    visible: document.getElementById("fieldVisible").checked,
    required: document.getElementById("fieldRequired").checked,
    source: document.getElementById("fieldSource").value.trim(),
    condition: document.getElementById("fieldCondition").value.trim(),
    validation: document.getElementById("fieldValidation").value.trim(),
    correction: document.getElementById("fieldCorrection").value.trim(),
    version: "草稿"
  };
  if (!value.name || !/^[a-z][a-z0-9_]*$/.test(value.code)) {
    toast("请填写字段名称，编码使用小写字母、数字和下划线");
    return;
  }
  if (value.required && !value.visible) {
    toast("规则冲突：必填字段不能隐藏");
    return;
  }
  if (value.required && !value.source) {
    toast("规则冲突：必填字段必须定义来源");
    return;
  }
  const index = state.fields.findIndex(function (field) { return field.id === value.id; });
  if (index >= 0) state.fields[index] = value; else state.fields.push(value);
  writeJson("xinhuo.fields", state.fields);
  state.media = value.media[0] === "all" ? state.media : value.media[0];
  state.stage = value.stage;
  closeModal();
  render();
  toast("字段草稿已保存并完成基础冲突校验");
}

function openFeedback(fieldName) {
  if (fieldName) state.feedbackDraft.feedbackField = fieldName;
  state.feedbackPrefill = fieldName || "";
  state.feedbackComposerOpen = true;
  state.page = "feedback";
  render();
  requestAnimationFrame(function () {
    const input = document.getElementById("feedbackField");
    if (input) input.focus();
    const composer = document.getElementById("inlineFeedbackComposer");
    if (composer) composer.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function captureFeedbackDraft() {
  const form = document.getElementById("feedbackForm");
  if (!form) return state.feedbackDraft || {};
  const ids = ["feedbackObject", "feedbackField", "feedbackType", "feedbackMedia", "feedbackPage", "feedbackCurrent", "feedbackExpected", "feedbackReason", "feedbackExample"];
  const draft = {};
  ids.forEach(function (id) {
    const element = document.getElementById(id);
    if (element) draft[id] = element.value;
  });
  state.feedbackDraft = draft;
  writeJson("xinhuo.feedbackDraft", draft);
  return draft;
}

function submitFeedback() {
  const valueOf = function (id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
  };
  const field = valueOf("feedbackField");
  const expected = valueOf("feedbackExpected");
  const reason = valueOf("feedbackReason");
  if (!field || !expected || !reason) {
    toast("请填写字段名称、期望修改和修改原因");
    return;
  }
  const pageKey = valueOf("feedbackPage") || state.page;
  const item = {
    id: "REQ-" + Date.now(),
    page: pageKey,
    pageTitle: PAGE_META[pageKey][1],
    object: valueOf("feedbackObject") || "未指定对象",
    field: field,
    changeType: valueOf("feedbackType") || "内容调整",
    media: valueOf("feedbackMedia") || "全部产品",
    roleId: state.roleId,
    roleName: currentRole().name,
    current: valueOf("feedbackCurrent"),
    expected: expected,
    reason: reason,
    example: valueOf("feedbackExample"),
    status: "待评审",
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false })
  };
  state.feedbacks.push(item);
  writeJson("xinhuo.feedbacks", state.feedbacks);
  state.feedbackDraft = {};
  localStorage.removeItem("xinhuo.feedbackDraft");
  state.feedbackComposerOpen = false;
  state.feedbackPrefill = "";
  state.page = "feedback";
  render();
  toast("已保存，新建议已显示在当前页面");
}

function buildNav() {
  const html = NAV.map(function (group) {
    const items = group.items.map(function (item) {
      const key = item[0];
      const label = item[1];
      const allowed = isAllowed(key);
      const count = key === "feedback" && state.feedbacks.length ? "<span class=\"nav-count\">" + state.feedbacks.length + "</span>" : "";
      return [
        "<button type=\"button\" class=\"nav-item ", state.page === key ? "active " : "", allowed ? "" : "locked",
        "\" data-page=\"", key, "\" ", allowed ? "" : "disabled aria-disabled=\"true\"", state.page === key ? " aria-current=\"page\"" : "", ">",
        "<span>", esc(label), "</span>", allowed ? count : "<span class=\"nav-note\">无权限</span>", "</button>"
      ].join("");
    }).join("");
    return "<div class=\"nav-group\"><div class=\"nav-label\">" + esc(group.label) + "</div>" + items + "</div>";
  }).join("");
  document.getElementById("nav").innerHTML = html;
}

function buildHeader() {
  const role = currentRole();
  const meta = PAGE_META[state.page] || PAGE_META[role.home];
  document.getElementById("eyebrow").textContent = meta[0];
  document.getElementById("title").textContent = meta[1];
  document.getElementById("desc").textContent = meta[2];
  document.getElementById("roleSelect").innerHTML = ROLES.filter(function (item) {
    return item.interactive;
  }).map(function (item) {
    return "<option value=\"" + esc(item.id) + "\"" + (item.id === state.roleId ? " selected" : "") + ">" + esc(item.name) + " · " + item.users + " 人</option>";
  }).join("");
  document.getElementById("roleContext").innerHTML = [
    "<strong>", esc(role.name), " · ", esc(role.scope), "</strong>",
    "<span>", esc(role.org), "</span>",
    "<span>", esc(role.usage), "</span>"
  ].join("");
  document.getElementById("feedbackCount").textContent = state.feedbacks.length;
  document.getElementById("snapshotDate").textContent = SNAPSHOT.dataThrough;
}

function buildPage() {
  const builders = {
    biz: buildBusiness,
    ops: buildOps,
    open: buildOpen,
    recharge: buildRecharge,
    finance: buildFinance,
    boss: buildBoss,
    data: buildData,
    automation: buildAutomation,
    apply: buildApply,
    handle: buildHandle,
    customer: buildCustomer,
    supplier: buildSupplier,
    template: buildTemplate,
    workflow: buildWorkflow,
    access: buildAccess,
    feedback: buildFeedback
  };
  return builders[state.page] ? builders[state.page]() : buildBusiness();
}

const PAGE_EDIT_TEXT_SELECTOR = [
  "h3", "h4", "p", ".metric-label", ".metric-value", ".metric-detail",
  ".task-title", ".task-meta", ".tag", ".field label", ".field-help",
  ".summary-row > span", ".summary-row > strong", ".object-node > span",
  ".object-node > strong", ".object-node > small", ".health-item > strong",
  ".health-item > span", ".role-card h4", ".role-card p", ".rule-item",
  ".source-label", ".prototype-note", ".data-table th", ".data-table td",
  ".quick-action strong", ".quick-action span", ".submission-card h4",
  ".submission-card p", ".fact-banner strong", ".fact-banner p"
  , "button:not(.page-editor-ui)"
].join(",");

const PAGE_EDIT_UNIT_SELECTORS = [
  [".field", "字段"],
  [".data-table tbody tr", "表格行"],
  [".card", "卡片"],
  [".task-item", "任务"],
  [".object-node", "对象"],
  [".workflow-node", "流程节点"],
  [".summary-row", "信息行"],
  [".rule-item", "规则"],
  [".role-card", "角色卡片"],
  [".submission-card", "建议卡片"],
  [".health-item", "指标卡片"],
  [".fact-banner", "说明"],
  [".prototype-note", "说明"]
];

const PAGE_EDIT_ZONE_SELECTORS = [
  [".form-grid", "field", "＋ 增加字段"],
  [".template-toolbar", "field", "＋ 增加字段"],
  [".table-wrap", "row", "＋ 增加表格行"],
  [".task-list", "task", "＋ 增加任务"],
  [".summary-list", "summary", "＋ 增加信息行"],
  [".rule-list", "rule", "＋ 增加规则"],
  [".workflow", "workflow", "＋ 增加流程节点"],
  [".grid", "card", "＋ 增加卡片"],
  [".role-grid", "card", "＋ 增加卡片"],
  [".submission-list", "card", "＋ 增加卡片"]
];

function pageEditVariantKey() {
  const parts = [state.page];
  if (state.page === "template") parts.push(state.media, state.stage, state.channel);
  if (state.page === "apply") parts.push(state.media, state.channel);
  if (state.page === "feedback") parts.push(state.roleId, state.feedbackComposerOpen ? "composer" : "list");
  if (state.page === "boss" || state.page === "access") parts.push(state.roleId);
  return parts.join("|");
}

function emptyPageEditPatch() {
  return { schema: 1, text: {}, controls: {}, removed: [], additions: {}, updatedAt: null };
}

function savedPageEditPatch() {
  const store = state.pageEdits && state.pageEdits.pages ? state.pageEdits.pages : {};
  return store[pageEditVariantKey()] || null;
}

function clonePageEditPatch(patch) {
  try { return JSON.parse(JSON.stringify(patch || emptyPageEditPatch())); }
  catch (error) { return emptyPageEditPatch(); }
}

function pageElementPath(element, root) {
  const parts = [];
  let current = element;
  while (current && current !== root) {
    const parent = current.parentElement;
    if (!parent) break;
    const index = Array.prototype.indexOf.call(parent.children, current);
    parts.unshift(current.tagName.toLowerCase() + ":" + index);
    current = parent;
  }
  return parts.join("/");
}

function registerPageEditText(element, key) {
  if (!element || element.closest(".page-editor-ui")) return;
  const editKey = key || "text:" + pageElementPath(element, document.getElementById("view"));
  element.dataset.pageEditKey = editKey;
  element.dataset.pageEditBaseText = element.textContent;
  pageEditTexts.set(editKey, element);
}

function registerPageEditControl(element, key) {
  if (!element || element.closest(".page-editor-ui")) return;
  const editKey = key || "control:" + pageElementPath(element, document.getElementById("view"));
  element.dataset.pageEditControlKey = editKey;
  element.dataset.pageEditBaseValue = element.type === "checkbox" ? (element.checked ? "1" : "0") : element.value;
  pageEditControls.set(editKey, element);
}

function registerBasePageEditStructure() {
  const view = document.getElementById("view");
  pageEditUnits = new Map();
  pageEditZones = new Map();
  pageEditTexts = new Map();
  pageEditControls = new Map();

  registerPageEditText(document.getElementById("title"), "header:title");
  registerPageEditText(document.getElementById("desc"), "header:desc");

  const textCandidates = Array.prototype.slice.call(view.querySelectorAll(PAGE_EDIT_TEXT_SELECTOR));
  textCandidates.forEach(function (element) {
    const hasEditableChild = textCandidates.some(function (other) {
      return other !== element && element.contains(other);
    });
    if (!hasEditableChild && !element.querySelector("input, textarea, select, button")) registerPageEditText(element);
  });

  view.querySelectorAll("input:not([type='hidden']), textarea, select").forEach(function (element) {
    registerPageEditControl(element);
  });

  const registeredUnits = new Set();
  PAGE_EDIT_UNIT_SELECTORS.forEach(function (config) {
    view.querySelectorAll(config[0]).forEach(function (element) {
      if (registeredUnits.has(element)) return;
      registeredUnits.add(element);
      const key = "unit:" + pageElementPath(element, view);
      element.dataset.pageEditUnit = key;
      element.dataset.pageEditUnitLabel = config[1];
      pageEditUnits.set(key, element);
    });
  });

  PAGE_EDIT_ZONE_SELECTORS.forEach(function (config) {
    view.querySelectorAll(config[0]).forEach(function (element) {
      const key = "zone:" + pageElementPath(element, view);
      element.dataset.pageEditZone = key;
      element.dataset.pageEditZoneType = config[1];
      element.dataset.pageEditZoneLabel = config[2];
      pageEditZones.set(key, element);
    });
  });

  const pageRoot = view.querySelector(":scope > .stack") || view;
  pageRoot.dataset.pageEditZone = "zone:page-root";
  pageRoot.dataset.pageEditZoneType = "card";
  pageRoot.dataset.pageEditZoneLabel = "＋ 增加内容卡片";
  pageEditZones.set("zone:page-root", pageRoot);
}

function createTextNodeElement(tagName, className, text, key) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  registerPageEditText(element, key);
  return element;
}

function createAddedField(addition) {
  const field = document.createElement("div");
  field.className = "field page-edit-added";
  field.dataset.pageEditUnit = "add:" + addition.id;
  field.dataset.pageEditUnitLabel = "字段";
  field.dataset.pageEditAdditionId = addition.id;
  const label = createTextNodeElement("label", "", "新字段", "add:" + addition.id + ":label");
  const input = document.createElement("input");
  input.type = "text";
  input.value = "点击填写内容";
  registerPageEditControl(input, "add:" + addition.id + ":value");
  field.appendChild(label);
  field.appendChild(input);
  pageEditUnits.set("add:" + addition.id, field);
  return field;
}

function createAddedRow(addition, zone) {
  const table = zone.querySelector(".data-table");
  const headerCount = table ? table.querySelectorAll("thead th:not(.page-editor-ui)").length : 1;
  const row = document.createElement("tr");
  row.className = "page-edit-added";
  row.dataset.pageEditUnit = "add:" + addition.id;
  row.dataset.pageEditUnitLabel = "表格行";
  row.dataset.pageEditAdditionId = addition.id;
  for (let index = 0; index < headerCount; index += 1) {
    const cell = createTextNodeElement("td", "", "新内容", "add:" + addition.id + ":cell:" + index);
    row.appendChild(cell);
  }
  pageEditUnits.set("add:" + addition.id, row);
  return row;
}

function createAddedCard(addition) {
  const card = document.createElement("article");
  card.className = "card page-edit-added";
  card.dataset.pageEditUnit = "add:" + addition.id;
  card.dataset.pageEditUnitLabel = "卡片";
  card.dataset.pageEditAdditionId = addition.id;
  const head = document.createElement("div");
  head.className = "card-head";
  const headInner = document.createElement("div");
  headInner.appendChild(createTextNodeElement("h3", "", "新内容卡片", "add:" + addition.id + ":title"));
  headInner.appendChild(createTextNodeElement("p", "", "点击文字直接修改", "add:" + addition.id + ":subtitle"));
  head.appendChild(headInner);
  const body = document.createElement("div");
  body.className = "card-body";
  body.appendChild(createTextNodeElement("p", "", "在这里填写你希望补充的页面内容。", "add:" + addition.id + ":body"));
  card.appendChild(head);
  card.appendChild(body);
  pageEditUnits.set("add:" + addition.id, card);
  return card;
}

function createAddedTask(addition) {
  const task = document.createElement("div");
  task.className = "task-item page-edit-added";
  task.dataset.pageEditUnit = "add:" + addition.id;
  task.dataset.pageEditUnitLabel = "任务";
  task.dataset.pageEditAdditionId = addition.id;
  const indicator = document.createElement("span");
  indicator.className = "task-indicator";
  const content = document.createElement("div");
  content.appendChild(createTextNodeElement("div", "task-title", "新任务", "add:" + addition.id + ":title"));
  content.appendChild(createTextNodeElement("div", "task-meta", "点击填写任务说明", "add:" + addition.id + ":meta"));
  task.appendChild(indicator);
  task.appendChild(content);
  pageEditUnits.set("add:" + addition.id, task);
  return task;
}

function createAddedSummary(addition) {
  const row = document.createElement("div");
  row.className = "summary-row page-edit-added";
  row.dataset.pageEditUnit = "add:" + addition.id;
  row.dataset.pageEditUnitLabel = "信息行";
  row.dataset.pageEditAdditionId = addition.id;
  row.appendChild(createTextNodeElement("span", "", "新信息", "add:" + addition.id + ":label"));
  row.appendChild(createTextNodeElement("strong", "", "点击填写", "add:" + addition.id + ":value"));
  pageEditUnits.set("add:" + addition.id, row);
  return row;
}

function createAddedRule(addition) {
  const rule = createTextNodeElement("div", "rule-item page-edit-added", "新规则：点击这里填写规则内容。", "add:" + addition.id + ":text");
  rule.dataset.pageEditUnit = "add:" + addition.id;
  rule.dataset.pageEditUnitLabel = "规则";
  rule.dataset.pageEditAdditionId = addition.id;
  pageEditUnits.set("add:" + addition.id, rule);
  return rule;
}

function createAddedWorkflow(addition) {
  const node = document.createElement("div");
  node.className = "workflow-node page-edit-added";
  node.dataset.pageEditUnit = "add:" + addition.id;
  node.dataset.pageEditUnitLabel = "流程节点";
  node.dataset.pageEditAdditionId = addition.id;
  node.appendChild(createTextNodeElement("span", "", "新增节点", "add:" + addition.id + ":index"));
  node.appendChild(createTextNodeElement("strong", "", "节点名称", "add:" + addition.id + ":name"));
  node.appendChild(createTextNodeElement("span", "", "点击填写进入条件", "add:" + addition.id + ":rule"));
  node.appendChild(createTextNodeElement("span", "", "SLA：待定义", "add:" + addition.id + ":sla"));
  pageEditUnits.set("add:" + addition.id, node);
  return node;
}

function createPageEditAddition(addition, zone) {
  if (addition.type === "field") return createAddedField(addition);
  if (addition.type === "row") return createAddedRow(addition, zone);
  if (addition.type === "task") return createAddedTask(addition);
  if (addition.type === "summary") return createAddedSummary(addition);
  if (addition.type === "rule") return createAddedRule(addition);
  if (addition.type === "workflow") return createAddedWorkflow(addition);
  return createAddedCard(addition);
}

function appendPageEditAddition(zone, addition) {
  const element = createPageEditAddition(addition, zone);
  if (addition.type === "row") {
    const body = zone.querySelector(".data-table tbody");
    if (body) body.appendChild(element);
  } else {
    zone.appendChild(element);
  }
}

function applyPageEditPatch(patch) {
  if (!patch) return;
  const removed = new Set(Array.isArray(patch.removed) ? patch.removed : []);
  pageEditUnits.forEach(function (element, key) {
    if (removed.has(key)) element.remove();
  });

  const additions = patch.additions && typeof patch.additions === "object" ? patch.additions : {};
  Object.keys(additions).forEach(function (zoneKey) {
    const zone = pageEditZones.get(zoneKey);
    if (!zone || !zone.isConnected || !Array.isArray(additions[zoneKey])) return;
    additions[zoneKey].forEach(function (addition) {
      if (addition && addition.id && addition.type) appendPageEditAddition(zone, addition);
    });
  });

  const text = patch.text && typeof patch.text === "object" ? patch.text : {};
  Object.keys(text).forEach(function (key) {
    const element = pageEditTexts.get(key);
    if (element && element.isConnected) element.textContent = String(text[key]);
  });

  const controls = patch.controls && typeof patch.controls === "object" ? patch.controls : {};
  Object.keys(controls).forEach(function (key) {
    const element = pageEditControls.get(key);
    if (!element || !element.isConnected) return;
    const saved = controls[key];
    if (element.type === "checkbox") element.checked = Boolean(saved && saved.checked);
    else if (saved && Object.prototype.hasOwnProperty.call(saved, "value")) element.value = String(saved.value);
  });
}

function currentPageEditPatch() {
  return state.pageEditMode ? state.pageEditDraft : savedPageEditPatch();
}

function makePageEditorButton(label, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className + " page-editor-ui";
  button.textContent = label;
  return button;
}

function decoratePageEditMode() {
  document.body.classList.add("page-editing");

  pageEditTexts.forEach(function (element) {
    if (!element.isConnected) return;
    element.contentEditable = "true";
    element.spellcheck = true;
    element.dataset.pageEditText = "true";
  });

  pageEditControls.forEach(function (element) {
    if (!element.isConnected) return;
    element.dataset.pageEditControl = "true";
    if (element.hasAttribute("readonly")) {
      element.dataset.pageEditWasReadonly = "true";
      element.removeAttribute("readonly");
    }
    if (element.disabled) {
      element.dataset.pageEditWasDisabled = "true";
      element.disabled = false;
    }
  });

  document.querySelectorAll("#view .data-table thead tr").forEach(function (row) {
    const head = document.createElement("th");
    head.className = "page-editor-ui page-edit-row-control";
    head.textContent = "编辑";
    row.appendChild(head);
  });

  pageEditUnits.forEach(function (element, key) {
    if (!element.isConnected) return;
    const label = element.dataset.pageEditUnitLabel || "内容";
    const button = makePageEditorButton("－ 移除", "page-edit-remove");
    button.dataset.pageEditRemove = key;
    button.setAttribute("aria-label", "移除" + label);
    if (element.tagName === "TR") {
      const cell = document.createElement("td");
      cell.className = "page-editor-ui page-edit-row-control";
      cell.appendChild(button);
      element.appendChild(cell);
    } else {
      element.appendChild(button);
    }
  });

  pageEditZones.forEach(function (element, key) {
    if (!element.isConnected) return;
    const button = makePageEditorButton(element.dataset.pageEditZoneLabel || "＋ 增加内容", "page-edit-add");
    button.dataset.pageEditAdd = key;
    element.appendChild(button);
  });
}

function updatePageEditToolbar() {
  const trigger = document.getElementById("pageEditToggle");
  const actions = document.getElementById("pageEditActions");
  const hasSaved = Boolean(savedPageEditPatch());
  trigger.hidden = state.pageEditMode;
  trigger.classList.toggle("has-page-edits", hasSaved);
  trigger.textContent = hasSaved ? "编辑页面 · 已自定义" : "编辑页面";
  actions.hidden = !state.pageEditMode;
  if (!state.pageEditMode) document.body.classList.remove("page-editing");
}

function collectPageEditDraft() {
  if (!state.pageEditMode || !state.pageEditDraft) return;
  const draft = state.pageEditDraft;
  if (!draft.text || typeof draft.text !== "object") draft.text = {};
  if (!draft.controls || typeof draft.controls !== "object") draft.controls = {};

  pageEditTexts.forEach(function (element, key) {
    if (!element.isConnected) return;
    const clean = element.cloneNode(true);
    clean.querySelectorAll(".page-editor-ui").forEach(function (item) { item.remove(); });
    const value = clean.textContent;
    const base = element.dataset.pageEditBaseText || "";
    if (value !== base) draft.text[key] = value;
    else delete draft.text[key];
  });

  pageEditControls.forEach(function (element, key) {
    if (!element.isConnected) return;
    const base = element.dataset.pageEditBaseValue || "";
    if (element.type === "checkbox") {
      const value = element.checked ? "1" : "0";
      if (value !== base) draft.controls[key] = { checked: element.checked };
      else delete draft.controls[key];
    } else if (element.value !== base) {
      draft.controls[key] = { value: element.value };
    } else {
      delete draft.controls[key];
    }
  });
  draft.updatedAt = new Date().toISOString();
}

function startPageEdit() {
  if (state.feedbackComposerOpen) {
    toast("请先保存或取消正在填写的字段建议，再编辑整个页面");
    return;
  }
  state.pageEditDraft = clonePageEditPatch(savedPageEditPatch());
  state.pageEditMode = true;
  render();
  const title = document.getElementById("title");
  if (title) title.focus();
  toast("已进入自由编辑：点文字修改，用＋增加、－移除");
}

function saveCurrentPageEdit() {
  collectPageEditDraft();
  if (!state.pageEdits || typeof state.pageEdits !== "object") state.pageEdits = { version: 1, pages: {} };
  if (!state.pageEdits.pages || typeof state.pageEdits.pages !== "object") state.pageEdits.pages = {};
  state.pageEdits.version = 1;
  state.pageEdits.pages[pageEditVariantKey()] = clonePageEditPatch(state.pageEditDraft);
  if (!writeJson("xinhuo.pageEdits.v1", state.pageEdits)) {
    toast("本机存储空间不足，本页尚未保存");
    return;
  }
  state.pageEditMode = false;
  state.pageEditDraft = null;
  render();
  document.getElementById("pageEditToggle").focus();
  toast("本页修改已保存，刷新或切页后仍会保留");
}

function cancelCurrentPageEdit() {
  state.pageEditMode = false;
  state.pageEditDraft = null;
  render();
  document.getElementById("pageEditToggle").focus();
  toast("已取消，本轮未保存修改全部撤销");
}

function requestResetPageEdit() {
  showModal({
    eyebrow: "仅清除本地页面修改",
    title: "恢复当前页面默认内容？",
    body: "<div class=\"prototype-note\"><strong>只影响当前页面和当前视图。</strong>字段模板草稿、工作流、字段建议以及其他页面的自由编辑内容都会保留。</div>",
    footer: "<button class=\"button secondary\" data-close-modal>保留修改</button><button class=\"button danger\" id=\"confirmResetPageEdit\">恢复默认</button>"
  });
}

function resetCurrentPageEdit() {
  if (state.pageEdits && state.pageEdits.pages) delete state.pageEdits.pages[pageEditVariantKey()];
  writeJson("xinhuo.pageEdits.v1", state.pageEdits);
  state.pageEditMode = false;
  state.pageEditDraft = null;
  closeModal();
  render();
  document.getElementById("pageEditToggle").focus();
  toast("当前页面已恢复默认，其他本地数据未改变");
}

function removeAddedPageEditItem(additionId) {
  const additions = state.pageEditDraft.additions || {};
  Object.keys(additions).forEach(function (zoneKey) {
    additions[zoneKey] = additions[zoneKey].filter(function (item) { return item.id !== additionId; });
    if (!additions[zoneKey].length) delete additions[zoneKey];
  });
  Object.keys(state.pageEditDraft.text || {}).forEach(function (key) {
    if (key.indexOf("add:" + additionId + ":") === 0) delete state.pageEditDraft.text[key];
  });
  Object.keys(state.pageEditDraft.controls || {}).forEach(function (key) {
    if (key.indexOf("add:" + additionId + ":") === 0) delete state.pageEditDraft.controls[key];
  });
}

function removePageEditUnit(unitKey) {
  collectPageEditDraft();
  const element = pageEditUnits.get(unitKey);
  if (!element) return;
  const additionId = element.dataset.pageEditAdditionId;
  if (additionId) {
    removeAddedPageEditItem(additionId);
  } else {
    if (!Array.isArray(state.pageEditDraft.removed)) state.pageEditDraft.removed = [];
    if (state.pageEditDraft.removed.indexOf(unitKey) < 0) state.pageEditDraft.removed.push(unitKey);
  }
  render();
  toast("已从当前草稿移除；点击取消可全部恢复");
}

function newPageEditAdditionId() {
  return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function addPageEditItem(zoneKey, forcedType) {
  collectPageEditDraft();
  const zone = pageEditZones.get(zoneKey);
  if (!zone) return;
  const type = forcedType || zone.dataset.pageEditZoneType || "card";
  if (!state.pageEditDraft.additions || typeof state.pageEditDraft.additions !== "object") state.pageEditDraft.additions = {};
  if (!Array.isArray(state.pageEditDraft.additions[zoneKey])) state.pageEditDraft.additions[zoneKey] = [];
  const addition = { id: newPageEditAdditionId(), type: type };
  state.pageEditDraft.additions[zoneKey].push(addition);
  render();
  const added = document.querySelector("[data-page-edit-addition-id='" + addition.id + "']");
  if (added) {
    added.scrollIntoView({ behavior: "smooth", block: "center" });
    const editable = added.querySelector("[contenteditable='true'], input, textarea");
    if (editable) editable.focus();
  }
  toast("已增加" + (type === "row" ? "表格行" : type === "field" ? "字段" : type === "card" ? "内容卡片" : "内容"));
}

function handlePageEditorAction(button) {
  if (button.id === "pageEditToggle") { startPageEdit(); return true; }
  if (button.id === "savePageEdit") { saveCurrentPageEdit(); return true; }
  if (button.id === "cancelPageEdit") { cancelCurrentPageEdit(); return true; }
  if (button.id === "resetPageEdit") { requestResetPageEdit(); return true; }
  if (button.id === "confirmResetPageEdit") { resetCurrentPageEdit(); return true; }
  if (button.id === "addPageCard") { addPageEditItem("zone:page-root", "card"); return true; }
  if (button.dataset.pageEditRemove) { removePageEditUnit(button.dataset.pageEditRemove); return true; }
  if (button.dataset.pageEditAdd) { addPageEditItem(button.dataset.pageEditAdd); return true; }
  return false;
}

function render() {
  if (!ROLES.some(function (role) { return role.id === state.roleId; })) state.roleId = "dx";
  if (!PAGE_META[state.page] || !isAllowed(state.page)) state.page = currentRole().home;
  buildNav();
  buildHeader();
  document.getElementById("view").innerHTML = buildPage();
  registerBasePageEditStructure();
  applyPageEditPatch(currentPageEditPatch());
  if (state.pageEditMode) decoratePageEditMode();
  updatePageEditToolbar();
  persistRoute();
}

function navigate(page) {
  if (!PAGE_META[page]) return;
  if (!isAllowed(page)) {
    toast("当前模拟角色没有此入口；请切换到对应角色查看");
    return;
  }
  state.page = page;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function previewTemplate() {
  const fields = filteredFields().filter(function (field) { return field.visible; });
  const preview = fields.map(function (field) {
    return [
      "<div class=\"field\"><label>", esc(field.name), field.required ? " <span class=\"required\">必填</span>" : "",
      "</label><input placeholder=\"", esc(field.source), "\" ", field.role.indexOf(currentRole().name) < 0 && state.roleId !== "system_admin" ? "readonly" : "",
      "><div class=\"field-help\">", esc(field.condition), " · ", esc(field.validation), "</div></div>"
    ].join("");
  }).join("");
  showModal({
    eyebrow: "表单预览",
    title: MEDIA_NAMES[state.media] + " · " + STAGE_NAMES[state.stage],
    body: "<div class=\"prototype-note\" style=\"margin-bottom:14px\"><strong>预览说明：</strong> 历史单据继续使用原模板版本；当前草稿只模拟新单。</div><div class=\"form-grid\">" + preview + "</div>",
    footer: "<button class=\"button primary\" data-close-modal>关闭预览</button>",
    wide: true
  });
}

function confirmPublish() {
  const issues = validateTemplate();
  if (issues.length) {
    toast("仍有规则冲突，不能进入发布预览");
    return;
  }
  showModal({
    eyebrow: "发布影响预览",
    title: "发布字段模板 v0.2",
    body: [
      "<div class=\"summary-list\">",
      "<div class=\"summary-row\"><span>适用范围</span><strong>", esc(MEDIA_NAMES[state.media]), " · ", esc(STAGE_NAMES[state.stage]), " · ", esc(state.channel), "</strong></div>",
      "<div class=\"summary-row\"><span>影响单据</span><strong>仅发布后的新建单据</strong></div>",
      "<div class=\"summary-row\"><span>在途单据</span><strong>继续冻结原模板版本</strong></div>",
      "<div class=\"summary-row\"><span>生产动作</span><strong>无；这里只记录原型发布</strong></div>",
      "</div><div class=\"prototype-note\" style=\"margin-top:14px\"><strong>真实上线仍需：</strong> 数据库迁移、接口契约、历史缺失策略、回滚版本和权限评审。</div>"
    ].join(""),
    footer: "<button class=\"button secondary\" data-close-modal>返回</button><button class=\"button primary\" id=\"confirmPrototypePublish\">确认原型版本</button>"
  });
}

function openWorkflowEditor() {
  const body = [
    "<form class=\"form-grid\" id=\"workflowForm\">",
    "<div class=\"field\"><label for=\"workflowName\">节点名称</label><input id=\"workflowName\" placeholder=\"例如：城市负责人\"></div>",
    "<div class=\"field\"><label for=\"workflowSla\">SLA</label><input id=\"workflowSla\" value=\"4 小时\"></div>",
    "<div class=\"field full\"><label for=\"workflowRule\">进入条件与组织规则</label><input id=\"workflowRule\" placeholder=\"例如：金额 > 20 万且发起人属于沈阳子树\"></div>",
    "</form>"
  ].join("");
  showModal({
    eyebrow: "工作流草稿",
    title: "增加条件节点",
    body: body,
    footer: "<button class=\"button secondary\" data-close-modal>取消</button><button class=\"button primary\" id=\"saveWorkflowNode\">保存节点</button>"
  });
}

function saveWorkflowNode() {
  const name = document.getElementById("workflowName").value.trim();
  const rule = document.getElementById("workflowRule").value.trim();
  const sla = document.getElementById("workflowSla").value.trim();
  if (!name || !rule) {
    toast("请填写节点名称和进入条件");
    return;
  }
  state.workflowNodes.splice(Math.max(1, state.workflowNodes.length - 1), 0, { name: name, rule: rule, sla: sla || "待定义" });
  writeJson("xinhuo.workflow", state.workflowNodes);
  closeModal();
  render();
  toast("条件节点已加入流程草稿");
}

function submitApply() {
  if (state.media === "102") {
    const laike = document.getElementById("laikeId");
    if (!laike || !/^\d{19}$/.test(laike.value.trim())) {
      if (laike) laike.setAttribute("aria-invalid", "true");
      toast("巨量本地推的新来客 ID 必须是 19 位数字");
      return;
    }
  }
  if (state.media === "100") {
    const uscc = document.getElementById("uscc");
    const bank = document.getElementById("subjectBank");
    const bankAccount = document.getElementById("subjectBankAccount");
    if (!uscc || !bank || !bankAccount || uscc.value.trim().length !== 18 || !bank.value.trim() || !bankAccount.value.trim()) {
      toast("巨量 AD 请补齐 18 位信用代码和主体银行资料");
      return;
    }
  }
  toast("原型校验通过：已生成开户申请并路由到组织候选队列");
}

function parseAccountRows() {
  const area = document.getElementById("batchAccounts");
  const output = document.getElementById("accountResults");
  if (!area || !output) {
    toast("当前页面缺少批量账户区域，可进入编辑页面恢复默认");
    return;
  }
  const text = area.value.trim();
  if (!text) {
    toast("请先粘贴账户数据或填入演示数据");
    return;
  }
  const lines = text.split(/\r?\n/).filter(Boolean);
  const rows = lines.map(function (line, index) {
    const cells = line.split(/[,，\t]/).map(function (item) { return item.trim(); });
    const accountId = cells[0] || "";
    const valid = state.media === "1002" ? /^\d{8,16}$/.test(accountId) : /^\d{16}$/.test(accountId);
    return [
      String(index + 1),
      esc(accountId || "—"),
      esc(cells[1] || "—"),
      esc(cells[2] || "—"),
      esc(cells[3] || "—"),
      valid ? tag("校验通过", "success") : tag("账户 ID 格式错误", "danger")
    ];
  });
  output.innerHTML = dataTable(["序号", "账户 ID", "账户名称", "直客 ID", "纵横 ID", "结果"], rows, "760px");
  toast("已逐行校验 " + rows.length + " 个账户结果");
}

function completeOpen() {
  const newLaikeElement = document.getElementById("newLaike");
  const reasonElement = document.getElementById("changeReason");
  const newLaike = newLaikeElement ? newLaikeElement.value.trim() : "";
  const reason = reasonElement ? reasonElement.value.trim() : "";
  if (newLaike && !/^\d{19}$/.test(newLaike)) {
    toast("改正后的来客 ID 必须是 19 位数字");
    return;
  }
  if (newLaike && !reason) {
    toast("修改来客 ID 必须填写原因");
    return;
  }
  toast(newLaike ? "已保存账户明细，并生成来客变更待商务确认" : "已保存逐账户处理结果");
}

function exportFeedbacks() {
  if (!state.feedbacks.length) return;
  const payload = {
    exportedAt: new Date().toISOString(),
    note: "薪火 CRM 原型字段调整建议；不含生产写入",
    items: state.feedbacks
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "xinhuo-crm-field-feedback.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  toast("已导出字段调整建议 JSON");
}

document.getElementById("roleSelect").addEventListener("change", function (event) {
  if (state.pageEditMode) {
    event.target.value = state.roleId;
    toast("请先保存或取消当前页面编辑");
    return;
  }
  state.roleId = event.target.value;
  state.page = currentRole().home;
  render();
  toast("已切换到 " + currentRole().name + "；导航按目标最小权限收敛");
});

document.body.addEventListener("change", function (event) {
  if (event.target.closest("#feedbackForm") && !state.pageEditMode) captureFeedbackDraft();
  if (state.pageEditMode) return;
  if (event.target.id === "tplMedia") { state.media = event.target.value; render(); }
  if (event.target.id === "tplStage") { state.stage = event.target.value; render(); }
  if (event.target.id === "tplChannel") { state.channel = event.target.value; render(); }
  if (event.target.id === "applyMedia") { state.media = event.target.value; render(); }
  if (event.target.id === "applyChannel") { state.channel = event.target.value; render(); }
});

document.body.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;
  if (handlePageEditorAction(button)) return;
  if (button.hasAttribute("data-close-modal") || button.id === "closeModal") { closeModal(); return; }
  if (state.pageEditMode) {
    event.preventDefault();
    return;
  }
  if (button.hasAttribute("data-open-feedback")) { openFeedback(button.dataset.field || ""); return; }
  if (button.dataset.page) { navigate(button.dataset.page); return; }
  if (button.dataset.go) { navigate(button.dataset.go); return; }
  if (button.dataset.demoAction) { toast("原型演示：" + button.dataset.demoAction); return; }
  if (button.id === "addDemand") {
    state.demandRows += 1;
    document.getElementById("demandTable").innerHTML = demandRows();
    toast("已增加一条账户需求，申请表内容保持不变");
    return;
  }
  if (button.hasAttribute("data-remove-demand")) {
    state.demandRows = Math.max(1, state.demandRows - 1);
    document.getElementById("demandTable").innerHTML = demandRows();
    return;
  }
  if (button.id === "submitApply") { submitApply(); return; }
  if (button.id === "recalc") {
    const cashInput = document.getElementById("cashInput");
    const ratioInput = document.getElementById("ratioInput");
    const output = document.getElementById("currencyOutput");
    if (!cashInput || !ratioInput || !output) {
      toast("当前页面缺少充值计算字段，可通过编辑页面恢复默认");
      return;
    }
    const cash = Number(cashInput.value || 0);
    const ratio = Number(ratioInput.value || 0);
    output.value = String(Math.round(cash * (1 + ratio / 100)));
    toast("已按交易快照重算，偏离合同默认时需说明");
    return;
  }
  if (button.id === "loadSampleAccounts") {
    const area = document.getElementById("batchAccounts");
    if (!area) { toast("当前页面缺少批量账户字段，可通过编辑页面恢复默认"); return; }
    area.value = "1750000000000001,示例主体甲-01,790000001,1760000000000001\n1750000000000002,示例主体甲-02,790000001,\n错误ID,示例主体甲-03,790000002,";
    toast("已填入 3 行脱敏演示数据");
    return;
  }
  if (button.id === "parseAccounts") { parseAccountRows(); return; }
  if (button.id === "completeOpen") { completeOpen(); return; }
  if (button.id === "addField") { openFieldEditor(); return; }
  if (button.dataset.editField) { openFieldEditor(button.dataset.editField); return; }
  if (button.id === "saveField") { saveField(); return; }
  if (button.id === "previewTemplate") { previewTemplate(); return; }
  if (button.id === "saveTemplate") {
    writeJson("xinhuo.fields", state.fields);
    toast("模板草稿已保存在本机；尚未发布，也未修改生产");
    return;
  }
  if (button.id === "publishTemplate") { confirmPublish(); return; }
  if (button.id === "confirmPrototypePublish") {
    closeModal();
    toast("已记录原型版本 v0.2；真实发布仍需技术实施");
    return;
  }
  if (button.id === "addWorkflowNode") { openWorkflowEditor(); return; }
  if (button.id === "saveWorkflowNode") { saveWorkflowNode(); return; }
  if (button.id === "saveWorkflow") {
    writeJson("xinhuo.workflow", state.workflowNodes);
    toast("工作流草稿已保存在本机；未写生产配置");
    return;
  }
  if (button.id === "submitFeedback") { submitFeedback(); return; }
  if (button.id === "cancelInlineFeedback") {
    state.feedbackDraft = {};
    localStorage.removeItem("xinhuo.feedbackDraft");
    state.feedbackComposerOpen = false;
    state.feedbackPrefill = "";
    render();
    return;
  }
  if (button.id === "stashInlineFeedback") {
    captureFeedbackDraft();
    state.feedbackComposerOpen = false;
    state.feedbackPrefill = "";
    render();
    toast("草稿已暂存在本机，可继续编辑其他页面");
    return;
  }
  if (button.id === "exportFeedback") { exportFeedbacks(); return; }
});

document.getElementById("overlay").addEventListener("click", function (event) {
  if (event.target.id === "overlay") closeModal();
});

document.getElementById("overlay").addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = Array.prototype.slice.call(document.querySelectorAll("#overlay button:not([disabled]), #overlay input:not([disabled]), #overlay select:not([disabled]), #overlay textarea:not([disabled])"));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.body.addEventListener("paste", function (event) {
  if (!state.pageEditMode) return;
  const editable = event.target.closest("[contenteditable='true']");
  if (!editable) return;
  event.preventDefault();
  const text = event.clipboardData ? event.clipboardData.getData("text/plain") : "";
  document.execCommand("insertText", false, text);
});

document.body.addEventListener("input", function (event) {
  if (!state.pageEditMode && event.target.closest("#feedbackForm")) captureFeedbackDraft();
});

document.addEventListener("keydown", function (event) {
  if (!state.pageEditMode) return;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveCurrentPageEdit();
  }
});

render();
