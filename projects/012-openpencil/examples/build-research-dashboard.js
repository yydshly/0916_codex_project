// Original demonstration authored by the research agent for OpenPencil v0.8.4.
// Run with: op design @build-research-dashboard.js
// All figures and project rows below are synthetic demonstration data.
const palette = {bg:'#F5F5F0',ink:'#20352B',muted:'#778078',green:'#315E45',lime:'#DCEAC7',line:'#E7EAE2',white:'#FFFFFF'};
function box(parent,name,x,y,w,h,color,r=0) {
  return I(parent,{type:'frame',name,x,y,width:w,height:h,layout:'none',cornerRadius:r,fill:color,children:[]});
}
function text(parent,name,content,x,y,w,size=16,color=palette.ink,weight=400) {
  return I(parent,{type:'text',name,content,x,y,width:w,fontFamily:'Microsoft YaHei',fontSize:size,fontWeight:weight,lineHeight:1.35,textGrowth:'fixed-width',fill:color});
}
const root=box(null,'研究工作台 · Agent 实测',0,0,1320,840,palette.bg);
const sidebar=box(root,'侧边导航',0,0,214,840,palette.ink);
const brand=box(sidebar,'品牌标记',28,30,34,34,palette.lime,10);
text(brand,'品牌缩写','R',10,4,22,20,palette.ink,700);
text(sidebar,'品牌名称','RESEARCH',74,34,130,19,palette.white,700);
text(sidebar,'工作区提示','我的研究空间',28,107,160,12,'#A8B5AD');
const nav=['总览','项目资料库','实验与复现','设计与产物','研究笔记'];
nav.forEach((label,i)=>{
  const y=145+i*53;
  const entry=box(sidebar,'导航项 '+label,16,y-8,182,43,i===0?'#35513F':palette.ink,8);
  box(entry,'导航符号',14,13,10,10,i===0?'#DCEAC7':'#91A397',3);
  text(entry,'导航 '+label,label,38,8,144,15,i===0?'#F2F8EC':'#B7C4BC',i===0?600:400);
});
const principle=box(sidebar,'研究原则卡',18,630,178,114,'#2C4636',12);
text(principle,'原则标题','让想法有据可查',16,18,153,14,'#E5EDD8',600);
text(principle,'原则说明','阅读源码，运行验证。\n把每次探索变成积累。',16,50,149,12,'#B0C0B3');
text(sidebar,'空间身份','个人工作区  /  LOCAL',28,787,176,11,'#A6B9AB');
text(root,'面包屑','工作空间  /  总览',250,30,400,13,palette.muted);
const search=box(root,'搜索框',919,20,264,36,'#EBEDE6',8);
text(search,'搜索提示','搜索项目、笔记或产物',14,9,236,12,palette.muted);
const avatar=box(root,'头像',1241,21,34,34,palette.lime,17);
text(avatar,'头像文字','研',8,8,23,13,palette.green,600);
box(root,'顶部分割',250,72,1032,1,palette.line);
text(root,'主标题','把探索，变成看得见的进展。',250,97,800,30,palette.ink,700);
text(root,'副标题','从阅读源码到运行验证，在一个工作台里沉淀研究。',251,146,810,14,palette.muted);
const button=box(root,'新建项目按钮',1153,105,128,40,palette.green,9);
text(button,'新建按钮文字','＋ 新建项目',15,10,105,14,palette.white,600);
const metrics=[['收录项目','12','本周新增  +3'],['已验证实验','28','运行记录持续积累'],['可复用产物','36','设计、代码与演示'],['待探索方向','05','下一次发现，从这里开始']];
metrics.forEach((m,i)=>{
  const x=250+i*264;
  const card=box(root,'指标卡 '+m[0],x,198,240,136,i===0?palette.green:palette.white,12);
  text(card,'指标标签',m[0],20,17,204,13,i===0?'#D7E4D8':palette.muted);
  text(card,'指标数值',m[1],20,43,200,37,i===0?palette.white:palette.ink,700);
  text(card,'指标变化',m[2],20,101,210,11,i===0?'#DCEAC7':palette.muted);
});
const activity=box(root,'实验趋势',250,358,663,250,palette.white,12);
text(activity,'趋势标题','每一次验证，都在向前',22,19,430,17,palette.ink,600);
text(activity,'趋势周期','近 7 天',558,24,90,11,palette.muted);
[0,1,2].forEach(i=>box(activity,'趋势网格',24,86+i*40,613,1,'#EEF0EA'));
const heights=[47,72,61,107,89,130,113];
heights.forEach((h,i)=>{
  box(activity,'实验次数柱 '+i,43+i*85,208-h,38,h,i===5?palette.green:'#DCE7D2',6);
  text(activity,'日期 '+i,['周一','周二','周三','周四','周五','周六','周日'][i],43+i*85,218,55,10,palette.muted);
});
const focus=box(root,'当前实验',937,358,345,250,'#E4EDD9',12);
text(focus,'实验标记','正在验证  /  OPENPENCIL',20,21,310,11,palette.green,600);
text(focus,'实验名称','让 Agent\n直接操作设计画布',20,57,302,25,palette.ink,700);
text(focus,'实验描述','创建节点 → 修改样式 → 保存文档\n由真实编辑器完成排版与导出。',20,143,307,12,'#5D705E');
text(focus,'实验状态','●  本地编辑器已连接',20,210,290,12,palette.green,600);
const table=box(root,'最近项目',250,632,1032,153,palette.white,12);
text(table,'列表标题','最近探索',20,16,500,16,palette.ink,600);
text(table,'全部项目入口','查看全部 →',920,21,100,11,palette.muted);
const rows=[['OpenPencil','AI 设计编辑器','运行实测'],['Design Extract','网页设计提取','已完成']];
rows.forEach((row,i)=>{
  const y=57+i*44;
  box(table,'项目分隔',20,y-3,992,1,'#EEF0EA');
  text(table,'项目名称 '+i,row[0],22,y+9,310,13,palette.ink,600);
  text(table,'项目方向 '+i,row[1],349,y+9,320,12,palette.muted);
  const badge=box(table,'状态背景 '+i,791,y+5,96,28,i===0?'#EDF2E5':'#EEF0EA',7);
  text(badge,'状态 '+i,row[2],16,6,82,11,palette.green);
  text(table,'打开项目 '+i,'打开 →',935,y+11,75,11,palette.muted);
});
text(root,'真实性说明','OpenPencil 原生画布 · Agent 通过 CLI 创建 · 所有数字均为演示数据',250,809,1040,11,palette.muted);
