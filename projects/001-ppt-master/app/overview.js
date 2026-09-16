(() => {
  const grid=document.getElementById('overview-grid');
  for(const style of window.PPT_STYLE_CATALOG.styles){
    const card=document.createElement('a');card.className='overview-card';card.href=`styles.html?style=${style.id}`;
    const picture=document.createElement('span');picture.className='overview-image';
    const image=document.createElement('img');image.src=style.slides[0].preview;image.alt=`${style.name}：${style.projectTitle}`;
    const caption=document.createElement('span');caption.className='overview-caption';
    const title=document.createElement('strong');title.textContent=style.name;
    const category=document.createElement('span');category.textContent=style.category;
    picture.append(image);caption.append(title,category);card.append(picture,caption);grid.append(card);
  }
})();
