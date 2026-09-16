(() => {
  'use strict';
  const styles=window.PPT_STYLE_CATALOG.styles;
  const $=id=>document.getElementById(id);
  const categories=['全部',...new Set(styles.map(s=>s.category))];
  let category='全部',query='',selected=null;
  const dialog=$('style-dialog');
  const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  $('category-filters').innerHTML=categories.map(c=>`<button type="button" data-category="${c}" aria-pressed="${c===category}">${c}<small>${c==='全部'?styles.length:styles.filter(s=>s.category===c).length}</small></button>`).join('');
  function render(){
    const visible=styles.filter(s=>(category==='全部'||s.category===category)&&[s.name,s.id,s.category,s.traits,s.uses,s.projectTitle].join(' ').toLowerCase().includes(query));
    $('result-count').textContent=`${String(visible.length).padStart(2,'0')} / 18 种风格`;
    $('empty-state').hidden=visible.length>0;
    $('style-grid').innerHTML=visible.map(s=>`<button type="button" class="style-card" data-style="${s.id}" aria-label="查看${s.name}的封面与内容页"><span class="card-picture"><img src="${s.slides[0].preview}" alt="${escape(s.projectTitle)}官方封面" loading="lazy"></span><span class="card-copy"><span class="card-topline"><span>${s.category}</span><span>${String(styles.indexOf(s)+1).padStart(2,'0')} / 18</span></span><span class="card-title">${s.name}<span aria-hidden="true">↗</span></span><span class="card-traits">${s.traits}</span><span class="card-example">官方案例 · ${escape(s.projectTitle)}</span></span></button>`).join('');
    for(const b of $('category-filters').querySelectorAll('button')) b.setAttribute('aria-pressed',String(b.dataset.category===category));
  }
  function showPage(index){
    const slide=selected.slides[index];
    $('detail-image').src=slide.preview;
    $('detail-image').alt=`${selected.name} · ${selected.projectTitle} · ${slide.label}`;
    $('detail-source').href=slide.source;
    for(const b of dialog.querySelectorAll('[data-page]')) b.setAttribute('aria-pressed',String(Number(b.dataset.page)===index));
  }
  function openStyle(id){
    selected=styles.find(s=>s.id===id);
    if(!selected)return;
    for(const [element,value] of Object.entries({'detail-name':selected.name,'detail-category':`${selected.category} / ${selected.id.toUpperCase()}`,'detail-traits':selected.traits,'detail-uses':selected.uses,'detail-boundary':selected.boundary,'detail-project':selected.projectTitle})) $(element).textContent=value;
    $('detail-viewer').href=selected.viewer;$('detail-pptx').href=selected.pptx;$('detail-spec').href=selected.specification;
    showPage(0);dialog.showModal();document.body.style.overflow='hidden';
  }
  $('category-filters').addEventListener('click',event=>{const b=event.target.closest('[data-category]');if(b){category=b.dataset.category;render();}});
  $('style-search').addEventListener('input',event=>{query=event.target.value.trim().toLowerCase();render();});
  $('reset-filters').addEventListener('click',()=>{category='全部';query='';$('style-search').value='';render();});
  $('style-grid').addEventListener('click',event=>{const card=event.target.closest('[data-style]');if(card)openStyle(card.dataset.style);});
  $('close-detail').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow='';});
  dialog.addEventListener('click',event=>{const button=event.target.closest('[data-page]');if(button)showPage(Number(button.dataset.page));});
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();showPage(event.key==='ArrowRight'?1:0);}});
  render();
  const id=new URLSearchParams(location.search).get('style');if(id)openStyle(id);
})();
