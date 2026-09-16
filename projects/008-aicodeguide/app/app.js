"use strict";

const source = "https://github.com/automata/aicodeguide/blob/ec6046726e750dc56ccbeb12d443fe2bb53fd925/README.md";
const steps = [
  {
    title: "先定义“收藏成功”意味着什么",
    explanation: "把“做一个收藏页”变成可以核对的范围。模糊的问题在这里解决，可以减少实现阶段的猜测。",
    input: "谁来用、需要保存哪些内容、是否跨设备、这次先做什么。",
    output: "需求说明：单人使用；保存标题、HTTPS 链接和标签；支持搜索；本版不做登录或云同步。",
    prompt: "我要做一个个人资料收藏页。请先确认数据保存位置、必需字段和搜索范围，再整理功能范围、非目标和验收条件。暂时不要实现。",
    check: "能明确回答“刷新后数据是否保留”“搜索哪些字段”“输入不合法时怎么办”。",
    lines: "L171-L268"
  },
  {
    title: "按依赖拆开，让每次修改有范围",
    explanation: "一个任务应当有可以观察的结果。先解决后续工作依赖的部分，再逐步组合成功能。",
    input: "已确认的需求、目标数据结构，以及最先要走通的使用流程。",
    output: "任务清单：①收藏数据结构；②新增与保存，依赖①；③列表展示，依赖②；④搜索，依赖③；⑤完整流程检查，依赖②③④。",
    prompt: "按当前需求拆分任务。每项写明输入、输出、依赖和验收条件。优先走通新增收藏到列表展示，不提前增加账号和同步功能。",
    check: "每项任务都能单独判断完成与否；依赖不存在循环；每个必需功能都有对应任务。",
    lines: "L241-L298"
  },
  {
    title: "把团队约定写成 AI 能读取的说明",
    explanation: "规则需要指向项目真实情况。它让后续修改遵守已有约定，也方便接手的人理解项目。",
    input: "项目目录、已有技术栈、运行和检查方式，以及不能改变的范围。",
    output: "项目规则：沿用静态页面；不新增服务端；字段为 title、url、tags；非敏感示例数据仅保存在本机；数据读写集中管理。",
    prompt: "根据现有项目整理 AGENTS.md，记录目录、启动方式、检查步骤和数据约定。保持现有依赖；尚未核实的命令请标记，不能编造。",
    check: "路径和命令真实存在；规则没有互相矛盾；后续任务能找到需要的需求文档。",
    lines: "L359-L394"
  },
  {
    title: "一次实现一个能够检查的变化",
    explanation: "AI 编程工具在这一步读写代码。指南提供组织方式，实际实现仍受所选工具和运行环境影响。",
    input: "本次任务、相关文件、依赖任务的结果和项目规则。",
    output: "本轮只实现新增收藏与本机保存；给出变更说明，并保留可供检查的代码。此处仅解释目标产物，没有实际生成收藏应用。",
    prompt: "阅读需求与规则，只完成新增收藏这一项。处理必填项和 URL 格式错误，保持已有字段不变。完成后列出改动及验证结果。",
    check: "修改范围与任务一致；必要字段有处理；没有擅自增加登录或在线存储。",
    lines: "L275-L304"
  },
  {
    title: "用实际行为检查，避免只看“完成”二字",
    explanation: "程序运行成功与满足需求是两件事。验证应覆盖用户流程，并关注边界情况和已有行为。",
    input: "验收条件、待检查的实现、可复现的输入与环境。",
    output: "检查记录：正常收藏、空标题、错误链接、搜索无结果、刷新后的保存状态。记录真实结果；失败项回到对应任务。",
    prompt: "逐条检查验收条件，记录预期与实际结果。失败时先给出可复现步骤和原因证据，再修复并重测。不能把未执行的检查写成通过。",
    check: "证据能复现；错误路径也被检查；原有功能没有退化；不通过修改验收标准来掩盖问题。",
    lines: "L651-L697"
  },
  {
    title: "留下设计意图，让下一次修改接得上",
    explanation: "上游强调保存提示与设计意图。我们将其扩展为交接记录，帮助后续研究追踪决定及尚未验证的部分。",
    input: "最终改动、验证记录、重要取舍和未解决的问题。",
    output: "研究记录与使用说明：数据保存在本机、适用范围、已验证步骤、尚未支持云同步，以及关键决策的原因。",
    prompt: "汇总本次实现与证据，更新项目说明和任务状态。区分已经验证、已知限制与后续计划，保留关键取舍的理由。",
    check: "接手者能找到运行方法和证据；完成状态与实际一致；日志分享前检查是否包含敏感信息。最后一项是本项目补充。",
    lines: "L417-L453"
  }
];

const fields = ["title", "explanation", "input", "output", "prompt", "check"];
const buttons = [...document.querySelectorAll("[data-step]")];
buttons.forEach(button => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.step);
    const step = steps[index];
    if (!step) return;
    fields.forEach(field => { document.getElementById(`step-${field}`).textContent = step[field]; });
    document.getElementById("step-count").textContent = `STEP ${String(index + 1).padStart(2, "0")} / 06`;
    document.getElementById("step-source").href = `${source}#${step.lines}`;
    buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  });
});

if ("IntersectionObserver" in window) {
  const links = [...document.querySelectorAll(".sidebar nav a")];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        const current = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", current);
        if (current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-18% 0px -60% 0px", threshold: 0 });
  document.querySelectorAll("main section[id]").forEach(section => observer.observe(section));
}
