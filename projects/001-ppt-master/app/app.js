(() => {
  'use strict';
  const pages = [
    {file:'01-cover',name:'文字与版式',label:'TYPOGRAPHY',description:'标题、说明和分隔线分别保存。封面在 PPT 中保留文本对象，可直接选中文字修改。',action:'选中标题，修改为你的项目名称；再调整字号与颜色。'},
    {file:'02-workflow',name:'流程图与形状',label:'DIAGRAM',description:'流程节点、文字、直线与箭头由独立对象构成，适合继续修改结构和视觉样式。',action:'选中流程节点并移动，修改节点文字。连接线为独立几何对象，不会自动吸附。'},
    {file:'03-chart',name:'数据图表',label:'NATIVE CHART',description:'同一份虚构季度数据，在两个版本中分别成为原生图表与独立柱形。切换版本可以比较排版差异。',action:'在原生数据版中，右键图表 → 编辑数据，将 Q4 的 80 改成 90。',shapeAction:'选择一个柱形，改变填充颜色。形状版不含图表数据工作簿。'},
    {file:'04-table',name:'原生表格',label:'NATIVE TABLE',description:'原生数据版保留 5 行 × 3 列的表格结构；形状版保留由矩形和文字组成的外观。',action:'点击单元格修改文字，拖动列边界调整宽度。',shapeAction:'分别选中文字或底色矩形进行修改；这些对象不是原生单元格。'},
    {file:'05-formula',name:'数学公式',label:'OFFICE MATH',description:'两种导出版本都把 LaTeX 转为 Office Math。分数、根号与上下标保留结构，展示图为实际公式渲染。',action:'双击公式，修改根号内的表达式。建议使用 Microsoft PowerPoint。'}
  ];
  const $ = id => document.getElementById(id);
  let current = 0;
  let variant = 'native-data';
  const evidence = window.PPT_EVIDENCE;
  const dialog = $('zoom-dialog');
  pages.forEach((page, index) => {
    const button = document.createElement('button');
    button.className = 'thumbnail';
    button.type = 'button';
    button.setAttribute('aria-label', `第 ${index+1} 页：${page.name}`);
    button.innerHTML = `<img src="previews/native-data/slide-${index+1}.png" width="1600" height="900" alt="" loading="lazy"><span><b>0${index+1}</b>${page.name}</span>`;
    button.addEventListener('click', () => { current = index; render(); });
    $('thumbnails').appendChild(button);
  });
  function render() {
    const page = pages[current];
    const number = current + 1;
    const file = `${variant}.pptx`;
    const objects = evidence.exports.find(item => item.file === file).slides[current];
    $('slide-image').src = `previews/${variant}/slide-${number}.png`;
    $('slide-image').alt = `${variant === 'native-data' ? '原生数据版' : '形状版'}第 ${number} 页：${page.name}，PowerPoint 实际渲染`;
    $('slide-kicker').textContent = `0${number} / ${page.label}`;
    $('slide-title').textContent = page.name;
    $('slide-description').textContent = page.description;
    $('slide-action').textContent = variant === 'editable-shapes' && page.shapeAction ? page.shapeAction : page.action;
    $('page-indicator').textContent = `0${number} / 05`;
    $('source-link').href = `sources/${page.file}.svg`;
    $('object-counts').replaceChildren();
    const counts = [['shapes','文字 / 形状'],['charts','原生图表'],['tables','原生表格'],['formulas','数学公式']];
    counts.forEach(([key,label]) => {
      if (!objects[key]) return;
      const span = document.createElement('span');
      const strong = document.createElement('b');
      strong.textContent = objects[key];
      span.append(strong, label);
      $('object-counts').append(span);
    });
    $('prev').disabled = current === 0;
    $('next').disabled = current === pages.length - 1;
    document.querySelectorAll('[data-variant]').forEach(button => button.setAttribute('aria-pressed', button.dataset.variant === variant));
    document.querySelectorAll('.thumbnail').forEach((button,index) => {
      button.setAttribute('aria-pressed', index === current);
      button.querySelector('img').src = `previews/${variant}/slide-${index+1}.png`;
    });
    $('zoom-image').src = $('slide-image').src;
    $('zoom-image').alt = $('slide-image').alt;
    $('zoom-caption').textContent = `${number} / 5 · ${page.name} · ${variant === 'native-data' ? '原生数据版' : '形状版'}`;
  }
  document.querySelectorAll('[data-variant]').forEach(button => button.addEventListener('click', () => { variant = button.dataset.variant; render(); }));
  $('prev').addEventListener('click', () => { if (current > 0) {current--;render();} });
  $('next').addEventListener('click', () => { if (current < pages.length-1) {current++;render();} });
  $('zoom').addEventListener('click', () => dialog.showModal());
  $('close-zoom').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  $('slide-image').addEventListener('error', () => { $('image-error').hidden = false; });
  $('slide-image').addEventListener('load', () => { $('image-error').hidden = true; });
  document.addEventListener('keydown', event => {
    const rect = $('showcase').getBoundingClientRect();
    if (!dialog.open && (rect.bottom <= 0 || rect.top >= window.innerHeight)) return;
    if (['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)) return;
    if (event.key === 'ArrowRight' && current < pages.length-1) {event.preventDefault();current++;render();}
    if (event.key === 'ArrowLeft' && current > 0) {event.preventDefault();current--;render();}
  });
  render();
})();
