'use strict';
const panelThemes = {
  fridge: {description:'靠近原位吸附 · 拖动倾斜 · 松手落定', stamp:'GOOD DAYS, KEPT.', label:'MEMORIES LIVE HERE'},
  cork: {description:'图钉拿起 · 纸张悬摆 · 阻尼停稳', stamp:'COLLECT THE LITTLE THINGS', label:'PIN SOMETHING WORTH KEEPING'},
  blueprint: {description:'移动参考线 · 20px 步进对齐 · 精确落位', stamp:'IDEAS / WORK IN PROGRESS', label:'A PLACE FOR UNFINISHED IDEAS'},
  gallery: {description:'鼠标追光 · 画框悬浮 · 缓缓放下', stamp:'THE PERSONAL COLLECTION', label:'EVERY PIECE HAS A STORY'},
  glass: {description:'立体倾斜 · 游动反光 · 落下涟漪', stamp:'THOUGHTS AFTER HOURS', label:'A LITTLE LIGHT IN THE DARK'},
  play: {description:'拿起拉伸 · 落下挤压 · 弹簧回弹', stamp:'SMALL MOMENTS, BIG JOY', label:'MADE OF HAPPY LITTLE THINGS'}
};
function setPanelTheme(name, announce = true) {
  if (!Object.hasOwn(panelThemes, name)) return;
  const theme = panelThemes[name];
  document.body.dataset.panelTheme = name;
  document.querySelectorAll('[data-theme]').forEach(button => {
    const selected = button.dataset.theme === name;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('#theme-description').textContent = theme.description;
  document.querySelector('.fridge-label > span').textContent = theme.stamp;
  document.querySelector('.fridge-bottom > span:first-child').textContent = theme.label;
  document.dispatchEvent(new CustomEvent('panel-theme-change'));
  if (announce) document.querySelector('#live-status').textContent = `面板已切换：${theme.description}。内容与摆放位置保留。`;
}
document.querySelectorAll('[data-theme]').forEach(button => {
  button.addEventListener('click', () => setPanelTheme(button.dataset.theme));
});
setPanelTheme('fridge', false);
