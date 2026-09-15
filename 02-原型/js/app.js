const roles = ["商务", "开户媒介", "充值媒介", "财务", "老板", "管理员"];
let role = "商务";
let page = "biz";
let bizType = "local";
let nodes = [
  { name: "商务提交", org: "发起人同组织", role: "商务" },
  { name: "开户媒介", org: "沈阳/厦门/天津媒介部", role: "开户媒介" },
  { name: "充值媒介", org: "同城媒介部", role: "充值媒介" },
  { name: "财务", org: "后勤/财务部", role: "财务" }
];

const copy = {
  biz: ["商务工作台", "只处理我发起的单、被驳回的单，以及媒介改过来客/资质后的确认。"],
  open: ["开户媒介工作台", "按企业微信组织收队列。处理页只读带回商务字段，回填账户 ID / 纵横 ID。"],
  recharge: ["充值媒介工作台", "待确认充值、同步失败、供应商余额预警。前返后返默认带出。"],
  finance: ["财务工作台", "现金到账必须指定一类/二类钱包。授信与对账必须有人审，不能自动过。"],
  boss: ["老板看板", "消耗、授信占用、开户时效、各组织积压。只读，越级审批进原单。"],
  apply: ["开户申请", "选客户 / 主体 / 店铺 / 供应商。本地推出直客+来客，非本地推出资质七项。"],
  handle: ["处理开户", "商务字段只读回填。可改来客 ID，必须写原因并通知商务。"],
  customer: ["客户四层", "客户 → 主体 → 店铺(来客) → 广告账户。直客 ID 挂在账户上，主体页汇总。"],
  tpl: ["字段模板", "按媒体产品 × 单据类型配置显示 / 必填 / 只读 / 默认来源，改完即用。"],
  wf: ["工作流配置", "主链商务 → 开户媒介 → 充值媒介 → 财务。组织与颗粒度可改，沈阳走沈阳。"]
};

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 2200);
}

function kpi(label, value, extra) {
  return `<article class="card kpi"><span>${label}</span><b>${value}</b><em>${extra || ""}</em></article>`;
}

function table(headers, rows, action) {
  const body = rows.map((r, i) =>
    `<tr data-i="${i}">${r.map((c) => `<td>${c}</td>`).join("")}</tr>`
  ).join("");
  return `<div class="card"><table class="table"><thead><tr>${
    headers.map((h) => `<th>${h}</th>`).join("")
  }</tr></thead><tbody>${body}</tbody></table></div>`;
}

function pages() {
  const applyLocal = bizType === "local";
  return {
    biz: `
      <div class="grid cols-4">
        ${kpi("待提交草稿", "3", "本地推 2 · 巨量AD 1")}
        ${kpi("被驳回", "1", "缺来客 ID")}
        ${kpi("进行中", "6", "平均停留 4.2h")}
        ${kpi("媒介改过待确认", "2", "来客 ID 被改正")}
      </div>
      <div class="grid cols-2" style="margin-top:16px">
        ${table(
          ["单据", "客户/主体", "类型", "节点", "停留"],
          [
            ["KH-0921", "示例美容A / 示例美容A有限公司", "<span class='tag'>本地推</span>", "<span class='tag wait'>开户媒介</span>", "3.1h"],
            ["KH-0918", "渠道客户乙 / 示例家居公司", "<span class='tag blue'>本地推·外转</span>", "<span class='tag wait'>待你确认来客</span>", "1.0h"],
            ["SX-0102", "示例文化C", "<span class='tag'>授信</span>", "<span class='tag'>财务</span>", "0.5h"]
          ]
        )}
        <article class="card">
          <h3 style="margin:0 0 12px">快捷</h3>
          <p class="hint">不进全公司消耗大表。客户是合作方；直客只是 ID。</p>
          <div class="edit-bar" style="justify-content:flex-start">
            <button class="primary" data-go="apply">新建开户</button>
            <button class="ghost" data-go="customer">我的客户</button>
          </div>
        </article>
      </div>`,
    open: `
      <div class="grid cols-4">
        ${kpi("沈阳队列", "4", "你当前组织")}
        ${kpi("缺账户 ID", "2", "自有端口待回填")}
        ${kpi("来客待核", "1", "19 位校验未过")}
        ${kpi("今日已处理", "7", "平均 2.4h")}
      </div>
      <div style="margin-top:16px">
        ${table(
          ["单号", "发起组织", "主体", "产品", "来客 ID", "等待"],
          [
            ["KH-0921", "沈阳", "示例美容A有限公司", "本地推·自有", "7669…12726", "3.1h"],
            ["KH-0919", "沈阳", "示例餐饮D", "巨量AD·外转", "—", "6.0h"],
            ["KH-0915", "厦门（非本队列）", "示例摄影", "本地推", "7472…66794", "灰显"]
          ]
        )}
      </div>
      <div class="edit-bar"><button class="primary" data-go="handle">打开第一条处理</button></div>`,
    recharge: `
      <div class="grid cols-4">
        ${kpi("待确认充值", "5", "默认已带返点")}
        ${kpi("API 同步失败", "1", "sync_state ≠ 30")}
        ${kpi("供应商低于阈值", "2", "自有大钱包")}
        ${kpi("外转待线下", "3", "只记账")}
      </div>
      <div style="margin-top:16px" class="card">
        <h3 style="margin-top:0">充值单 · 演示可改返点</h3>
        <div class="form">
          <div><label>广告账户</label><input value="示例美容A-ss-wj" /></div>
          <div><label>现金金额</label><input value="30000" /></div>
          <div><label>前返 %（默认自客户）</label><input id="before" value="14" /></div>
          <div><label>后返 %</label><input value="0" /></div>
          <div><label>钱包</label><select><option>一类</option><option>二类</option></select></div>
          <div><label>货币预览</label><input id="currency" value="34200" readonly /></div>
        </div>
        <p class="hint">货币 = 现金 × (1 + 前返)。AGENT 调巨量 API，NOAGENT 只记账。与现网一致。</p>
        <div class="edit-bar"><button class="primary" id="calc">重算并确认</button></div>
      </div>`,
    finance: `
      <div class="grid cols-4">
        ${kpi("待确认到账", "8", "须指定钱包")}
        ${kpi("待对账", "12", "禁止自动完成")}
        ${kpi("授信待审", "3", "不可直接过")}
        ${kpi("逾期授信", "1", "回款日已过")}
      </div>
      <div style="margin-top:16px">
        ${table(
          ["类型", "客户", "金额", "钱包", "状态"],
          [
            ["现金收款", "示例美容A", "50,000", "<select><option>一类</option><option selected>二类</option></select>", "<span class='tag wait'>待确认</span>"],
            ["日对账", "渠道客户乙", "8,357", "—", "<span class='tag wait'>待财务点完成</span>"],
            ["授信申请", "示例文化C", "+200,000 永久", "—", "<span class='tag'>待审</span>"]
          ]
        )}
      </div>
      <div class="edit-bar"><button class="primary" id="finok">确认所选到账</button></div>`,
    boss: `
      <div class="grid cols-4">
        ${kpi("本月消耗", "¥ 286万", "自有 61% · 外转 39%")}
        ${kpi("授信占用", "¥ 94万", "额度 480万")}
        ${kpi("开户均时效", "4.8h", "自有 2.5h / 外转 12.9h 对照")}
        ${kpi("队列积压", "沈阳 4 · 厦门 7", "天津 1")}
      </div>
      <div class="grid cols-2" style="margin-top:16px">
        <article class="card">
          <h3 style="margin-top:0">组织积压</h3>
          ${table(["组织", "开户", "充值", "财务"], [["沈阳", "4", "2", "1"], ["厦门", "7", "5", "8"], ["天津", "1", "1", "0"]])}
        </article>
        <article class="card">
          <h3 style="margin-top:0">只读原则</h3>
          <p class="hint">老板不在看板改单。越级审批从待办进入原单。数据权按工作流实例，不按客户 sale_id。</p>
        </article>
      </div>`,
    apply: `
      <article class="card">
        <div class="role-switch" style="margin-bottom:16px">
          <button class="${applyLocal ? "on" : ""}" data-biz="local">本地推</button>
          <button class="${!applyLocal ? "on" : ""}" data-biz="other">非本地推</button>
        </div>
        <div class="form">
          <div><label>客户（合作方，选择）</label><input value="示例美容A" /></div>
          <div><label>主体 / 直客名称（选择或新建）</label><input value="广州示例美容服务有限公司" /></div>
          ${applyLocal ? `
            <div><label>直客 ID（可空，可从主体已有 ID 选）</label><input placeholder="790289820" /></div>
            <div><label>来客名称</label><input value="广州示例美容服务有限公司" /></div>
            <div class="full"><label>来客 ID · 19 位数字</label><input id="laike" placeholder="7669638049290012726" /></div>
          ` : `
            <div><label>行业</label><select><option>生活服务 / 美容美体</option><option>餐饮服务</option></select></div>
            <div><label>社会信用代码</label><input placeholder="18 位" /></div>
            <div><label>开户银行名称</label><input /></div>
            <div><label>开户银行账号</label><input /></div>
            <div class="full"><label>住所</label><input /></div>
            <div><label>联系人</label><input /></div>
            <div><label>电话</label><input /></div>
          `}
          <div><label>供应商（选择）</label><select><option>本地推供应商（自有）</option><option>本地推-迪雾（外转）</option></select></div>
          <div><label>媒体产品</label><select><option>102 巨量本地</option><option>100 巨量AD</option><option>1002 腾讯K4</option></select></div>
          <div class="full"><label>备注</label><textarea placeholder="开几个户、类目、特殊说明"></textarea></div>
        </div>
        <p class="hint">主体、店铺、供应商必须是选择。不再手抄名称。提交后按发起人组织进入开户媒介队列。</p>
        <div class="edit-bar">
          <button class="ghost">存草稿</button>
          <button class="primary" id="submitApply">提交到开户媒介</button>
        </div>
      </article>`,
    handle: `
      <div class="grid cols-2">
        <article class="card">
          <h3 style="margin-top:0">商务已填 · 只读</h3>
          <p>客户：示例美容A<br/>主体：广州示例美容服务有限公司<br/>直客 ID：790289820<br/>来客：同名 · <b id="shownLaike">7669638049290012726</b><br/>供应商：本地推供应商 · 自有端口</p>
        </article>
        <article class="card">
          <h3 style="margin-top:0">媒介回填</h3>
          <div class="form">
            <div><label>广告账户名称</label><input value="广州示例美容服务有限公司-ss-wj" /></div>
            <div><label>广告账户 ID</label><input placeholder="16 位" /></div>
            <div><label>纵横 ID</label><input placeholder="16 位" /></div>
            <div><label>账户所属</label><select><option>商务个人</option><option>渠道公司</option></select></div>
            <div class="full"><label>改正来客 ID（可选）</label><input id="fixLaike" /></div>
            <div class="full"><label>修改原因（改来客时必填）</label><textarea id="fixReason"></textarea></div>
          </div>
          <div class="edit-bar"><button class="primary" id="doneOpen">回填并落账户</button></div>
        </article>
      </div>`,
    customer: `
      <article class="card">
        <p class="hint">点层可改名称。直客 ID 不是主体单列，列在账户上，上方汇总。</p>
        <p><b>客户</b> 示例美容A · 标签 自运营 / 直客（此处直客=合作形态标签，不是巨量 ID）</p>
        <p><b>主体</b> 广州示例美容服务有限公司 · 汇总直客 ID：790289820、790100001</p>
        <p><b>店铺 / 来客</b> 同名 · 7669638049290012726</p>
        <div class="form">
          <div><label>广告账户名称（可编辑）</label><input value="示例美容A-ss-wj" /></div>
          <div><label>账户 type</label><input value="102 巨量本地 · 自有" readonly /></div>
          <div><label>直客 ID（本账户）</label><input value="790289820" /></div>
          <div><label>纵横 ID</label><input /></div>
        </div>
      </article>`,
    tpl: `
      <article class="card">
        <div class="form">
          <div><label>媒体产品</label><select id="tplMedia"><option>本地推</option><option>巨量AD</option><option>腾讯K4</option></select></div>
          <div><label>单据</label><select><option>开户申请</option><option>开户回复</option><option>充值</option></select></div>
        </div>
        ${table(
          ["字段", "显示", "必填", "默认来源"],
          [
            ["直客 ID", "<input type='checkbox' checked>", "<input type='checkbox'>", "主体已有列表"],
            ["来客 ID", "<input type='checkbox' checked class='laikeVis'>", "<input type='checkbox' checked>", "店铺"],
            ["社会信用代码", "<input type='checkbox'>", "<input type='checkbox'>", "主体"],
            ["纵横 ID", "<input type='checkbox' checked>", "<input type='checkbox' checked>", "空"],
            ["前返", "<input type='checkbox' checked>", "<input type='checkbox'>", "客户"]
          ]
        )}
        <div class="edit-bar"><button class="primary" id="saveTpl">保存模板</button></div>
      </article>`,
    wf: `
      <article class="card">
        <p class="hint">可增删节点、改组织范围。演示数据只存在本页，刷新还原。</p>
        <div class="flow" id="flow"></div>
        <div class="form" style="margin-top:18px">
          <div><label>新节点名</label><input id="nName" placeholder="城市负责人" /></div>
          <div><label>组织规则</label><input id="nOrg" placeholder="发起人部门负责人" /></div>
        </div>
        <div class="edit-bar">
          <button class="ghost" id="addNode">增加节点</button>
          <button class="danger" id="popNode">删除末节点</button>
          <button class="primary" id="saveWf">保存流程</button>
        </div>
      </article>`
  };
}

function renderFlow() {
  const el = document.getElementById("flow");
  if (!el) return;
  el.innerHTML = nodes.map((n, i) =>
    `<div class="node ${i === 1 ? "active" : ""}"><b>${n.name}</b><div class="hint">${n.role} · ${n.org}</div></div>${
      i < nodes.length - 1 ? "<span class='arrow'>→</span>" : ""
    }`
  ).join("");
}

function render() {
  document.getElementById("title").textContent = copy[page][0];
  document.getElementById("desc").textContent = copy[page][1];
  document.getElementById("roles").innerHTML = roles.map((r) =>
    `<button class="${r === role ? "on" : ""}" data-role="${r}">${r}</button>`
  ).join("");
  document.querySelectorAll(".nav button").forEach((b) => b.classList.toggle("active", b.dataset.page === page));
  document.getElementById("view").innerHTML = pages()[page];
  if (page === "wf") renderFlow();
}

document.body.addEventListener("click", (e) => {
  const t = e.target;
  if (t.dataset.page) { page = t.dataset.page; render(); }
  if (t.dataset.role) { role = t.dataset.role; toast("当前角色：" + role); render(); }
  if (t.dataset.go) { page = t.dataset.go; render(); }
  if (t.dataset.biz) { bizType = t.dataset.biz; render(); }
  if (t.id === "submitApply") {
    const v = document.getElementById("laike");
    if (bizType === "local" && v && !/^\d{19}$/.test(v.value.trim())) {
      toast("本地推：来客 ID 必须是 19 位数字"); return;
    }
    toast("已提交，进入 " + (role === "商务" ? "沈阳开户媒介" : "对应组织") + " 队列");
    page = "open"; render();
  }
  if (t.id === "doneOpen") {
    const fix = document.getElementById("fixLaike");
    const reason = document.getElementById("fixReason");
    if (fix && fix.value && !(reason && reason.value.trim())) {
      toast("改正来客必须填写原因"); return;
    }
    if (fix && fix.value) document.getElementById("shownLaike").textContent = fix.value;
    toast("已落广告账户，并绑定本申请单（自有端口不再去另一菜单重录）");
  }
  if (t.id === "calc") {
    const cash = 30000;
    const before = Number(document.getElementById("before").value || 0);
    document.getElementById("currency").value = String(Math.round(cash * (1 + before / 100)));
    toast("已按现网公式重算，可确认划款");
  }
  if (t.id === "finok") toast("到账已确认，写入一类/二类钱包流水");
  if (t.id === "saveTpl") toast("模板已保存，开户申请即时生效");
  if (t.id === "addNode") {
    const name = document.getElementById("nName").value || "加签节点";
    const org = document.getElementById("nOrg").value || "可配置组织";
    nodes.splice(nodes.length - 1, 0, { name, org, role: "加签" });
    renderFlow(); toast("已插入节点");
  }
  if (t.id === "popNode") {
    if (nodes.length > 2) { nodes.splice(nodes.length - 2, 1); renderFlow(); }
  }
  if (t.id === "saveWf") toast("工作流已保存：按企业微信组织匹配候选人");
});

render();
