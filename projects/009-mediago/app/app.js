(() => {
  const activate = (buttons, panels, id) => {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.target === id)));
    panels.forEach(panel => { panel.hidden = panel.id !== id; });
  };
  const scenarioButtons = [...document.querySelectorAll('.scenario-picker button')];
  const scenarios = [...document.querySelectorAll('.scenario')];
  scenarioButtons.forEach(button => button.addEventListener('click', () => activate(scenarioButtons, scenarios, button.dataset.target)));
  activate(scenarioButtons, scenarios, 'scenario-web');
  const stageButtons = [...document.querySelectorAll('.pipeline button')];
  const stages = [...document.querySelectorAll('.stage-panel')];
  stageButtons.forEach(button => button.addEventListener('click', () => activate(stageButtons, stages, button.dataset.target)));
  activate(stageButtons, stages, 'stage-1');
  const filterButtons = [...document.querySelectorAll('.filters button')];
  const sourceRows = [...document.querySelectorAll('#source-table tbody tr')];
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let visible = 0;
    sourceRows.forEach(row => {
      row.hidden = button.dataset.filter !== 'all' && row.dataset.kind !== button.dataset.filter;
      if (!row.hidden) visible++;
    });
    document.querySelector('#source-count').textContent = `显示 ${visible} / ${sourceRows.length} 类来源`;
  }));
  const sections = [...document.querySelectorAll('main>section[id]')];
  const navLinks = [...document.querySelectorAll('.sidebar nav a')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) navLinks.forEach(link => {
        const current = link.hash === `#${entry.target.id}`;
        if (current) link.setAttribute('aria-current','true'); else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
  document.querySelectorAll('[data-scenario-link]').forEach(link => link.addEventListener('click', () => activate(scenarioButtons, scenarios, link.dataset.scenarioLink)));
  const revealEvidence = () => {
    const target = document.getElementById(location.hash.slice(1));
    if (target?.matches('.references details')) target.open = true;
  };
  window.addEventListener('hashchange', revealEvidence);
  revealEvidence();
})();
