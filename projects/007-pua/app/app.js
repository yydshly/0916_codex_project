(function () {
  'use strict';
  const { scenarios, pressure, Session } = window.PuaLab;
  const session = new Session();
  const $ = id => document.getElementById(id);
  const format = value => typeof value === 'boolean' ? (value ? '计入' : '排除') : JSON.stringify(value);
  function render() {
    const scenario = scenarios[session.scenario];
    const variant = scenario.variants[session.variantId];
    document.querySelectorAll('[data-scenario]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scenario === session.scenario)));
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === session.mode)));
    $('case-title').textContent = scenario.title; $('case-description').textContent = scenario.description; $('case-contract').textContent = scenario.contract;
    $('attempt-no').textContent = `第 ${session.step + 1} / 4 轮 · ${session.step === 0 ? '基线复现，不计修复失败' : (session.mode === 'evidence' ? '按证据排查' : '重复微调')}`;
    const passed = session.results && session.results.every(row => row.passed);
    $('level').textContent = passed ? '当前样例通过' : `${pressure(session.failures)} · 已确认失败 ${session.failures} 次`;
    $('attempt-title').textContent = variant.title; $('attempt-reason').textContent = variant.reason;
    $('code').textContent = variant.fn.toString().replace(/\{ /g, '{\n  ').replace(/; /g, ';\n  ').replace(/ \}/g, '\n}');
    $('test-count').textContent = session.results ? `${session.results.filter(row => row.passed).length} / ${scenario.tests.length} 通过` : `${scenario.tests.length} 项待验证`;
    $('results').replaceChildren();
    scenario.tests.forEach((test, index) => {
      const result = session.results?.[index];
      const row = document.createElement('div'); row.className = 'result-row' + (result ? (result.passed ? ' pass' : ' fail') : '');
      const icon = document.createElement('span'); icon.className = 'result-icon'; icon.textContent = result ? (result.passed ? '✓' : '×') : '·'; icon.setAttribute('aria-hidden', 'true');
      const copy = document.createElement('div');
      const name = document.createElement('div'); name.className = 'result-name'; name.textContent = test.name;
      const detail = document.createElement('div'); detail.className = 'result-detail'; detail.textContent = result ? `期望 ${format(result.expected)} · 实际 ${format(result.actual)}` : `期望 ${format(test.expected)}`;
      copy.append(name, detail);
      const status = document.createElement('span'); status.className = 'result-status'; status.textContent = result ? (result.passed ? '通过' : '失败') : '待运行';
      row.append(icon, copy, status); $('results').append(row);
    });
    $('finding').textContent = session.results ? variant.finding : '先运行验收，让实际结果告诉你哪些假设成立。';
    $('run').firstChild.textContent = session.results ? '重新运行验收 ' : '运行本轮验收 ';
    $('next').disabled = !session.canNext;
    $('next').textContent = session.step === 3 ? '本路径已结束' : '下一种尝试 →';
    $('gate-result').className = 'gate-result';
    if (session.submitted === true) { $('gate-result').textContent = '验收通过：本轮满足全部样例，可交付约定范围内的结果。'; $('gate-result').classList.add('accepted'); }
    else if (session.submitted === false) { $('gate-result').textContent = session.step === 3 ? '完成声明被驳回。本教学路径已达 4 轮上限；请切换“按证据排查”重新实验。' : '完成声明被驳回：仍有失败样例。请依据证据继续尝试。'; $('gate-result').classList.add('rejected'); }
    else $('gate-result').textContent = '提交时会重新执行全部样例；同一方案复跑不重复计数。';
    $('history').replaceChildren();
    if (!session.history.length) { const li = document.createElement('li'); li.className = 'empty-history'; li.textContent = '运行第一轮，开始收集证据。'; $('history').append(li); }
    session.history.forEach(item => { const li = document.createElement('li'); if (item.passed === item.total) li.className = 'passed'; li.textContent = `${item.step === 0 ? '基线' : item.step + ' 次修复'} · ${item.passed}/${item.total} 通过`; $('history').append(li); });
  }
  document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => { session.reset(button.dataset.scenario, session.mode); render(); }));
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { session.reset(session.scenario, button.dataset.mode); render(); }));
  $('run').addEventListener('click', () => { session.run(); render(); });
  $('next').addEventListener('click', () => { session.next(); render(); });
  $('reset').addEventListener('click', () => { session.reset(); render(); });
  $('submit').addEventListener('click', () => { session.submit(); render(); });
  document.querySelectorAll('[data-source]').forEach(link => { link.href = 'https://github.com/tanweai/pua/blob/e6e6cd237ad17750d179674bff52f8184abea8fd/' + link.dataset.source; link.target = '_blank'; link.rel = 'noreferrer'; });
  render();
  // Optional agent access uses the exact same session and actions as the UI.
  const context = document.modelContext;
  if (context?.registerTool) {
    const lifecycle = new AbortController();
    window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
    const snapshot = () => ({ scenario: session.scenario, mode: session.mode, round: session.step + 1, confirmedRepairFailures: session.failures, level: pressure(session.failures), results: session.results, accepted: session.submitted });
    try {
      Promise.resolve(context.registerTool({
        name: 'pua_lab_experiment', title: '运行 PUA 教学实验',
        description: '在当前实验台选择场景和路径、运行当前轮、前进、重置或提交验收。所有方案预设，不调用模型。select 和 reset 会清空实验。',
        inputSchema: { type: 'object', properties: { action: { type: 'string', enum: ['read', 'select', 'run', 'next', 'reset', 'submit'] }, scenario: { type: 'string', enum: ['time', 'page', 'unique'] }, mode: { type: 'string', enum: ['evidence', 'repeat'] } }, required: ['action'], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => !['action', 'scenario', 'mode'].includes(key))) throw new Error('参数不合法');
          if (!['read', 'select', 'run', 'next', 'reset', 'submit'].includes(input.action)) throw new Error('未知动作');
          if (input.action !== 'select' && (input.scenario !== undefined || input.mode !== undefined)) throw new Error('只有 select 接受场景和路径');
          if (input.action === 'select') session.reset(input.scenario ?? session.scenario, input.mode ?? session.mode);
          if (input.action === 'run') session.run();
          if (input.action === 'next' && !session.next()) throw new Error('请先运行本轮；全部通过或已达路径上限时不能前进');
          if (input.action === 'reset') session.reset();
          if (input.action === 'submit') session.submit();
          if (input.action !== 'read') render();
          return snapshot();
        }
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch (_) { /* The interactive page works without this optional API. */ }
  }
})();
