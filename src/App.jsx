import { useState, useCallback, useRef, useEffect } from "react";
const PALETTE = [
  "#A89282","#8B7D6B","#9C8478","#A08C72","#7A6E5E","#B8A696",
  "#BDB0C4","#A8A0BE","#9B9EB8","#C4ADAD","#8E8AAE","#B8ADBA",
  "#D4A030","#C08A3C","#B8862E","#D4B044","#C4963A","#D49840",
  "#3DAD7C","#4A9E7A","#388E72","#7FAABE","#6E9AAE","#5B8FA8",
  "#C75D5D","#B8646A","#D4787E","#C46E78","#A85B6A","#D48A8A",
];
let COLORS = { work:"#B8646A",school:"#A89282",obligations:"#BDB0C4",creative:"#D4A030",leisure:"#3DAD7C",sport:"#7FAABE",hobby:"#D4A030" };
let CAT_LABELS = { work:"Work",school:"School",obligations:"Obligations",creative:"Creative",leisure:"Leisure",sport:"Sport",hobby:"Hobby" };
let ALL_CATS = Object.keys(CAT_LABELS);
const clone = o => JSON.parse(JSON.stringify(o));
const d2r = d => d*Math.PI/180;
const pol = (a,r) => ({x:r*Math.cos(d2r(a)),y:r*Math.sin(d2r(a))});
const arcP = (sa,ea,ir,or) => {const s1=pol(sa,ir),s2=pol(sa,or),e1=pol(ea,ir),e2=pol(ea,or),lg=ea-sa>180?1:0;return "M"+s2.x+" "+s2.y+"A"+or+" "+or+" 0 "+lg+" 1 "+e2.x+" "+e2.y+"L"+e1.x+" "+e1.y+"A"+ir+" "+ir+" 0 "+lg+" 0 "+s1.x+" "+s1.y+"Z";};
const EMOJIS = ["\ud83d\udc64","\ud83d\udc69","\ud83d\udc68","\ud83d\udc67","\ud83d\udc66","\ud83e\uddd2","\ud83d\udc76","\ud83e\uddd1","\ud83d\udc75","\ud83d\udc74","\ud83c\udfc3","\ud83c\udfa8","\ud83c\udf93","\ud83c\udfe2","\ud83c\udfe0","\ud83d\udcbb","\ud83e\udd4b","\ud83e\ude70","\u26bd","\ud83c\udfb5","\ud83d\udc3e","\ud83c\udf1f","\ud83d\udcaa","\ud83d\udcda","\ud83c\udf92"];
const Ac = (cat,hours,label,loc,w,energy) => ({cat,hours,label,loc,with:w||[],energy:energy||.5,note:""});
const Dy = (name,short,isW,acts,hap) => ({name,short,isWeekend:!!isW,activities:acts,happiness:hap});
const PERSONAS = {
  office_ft:{label:"Office job (full-time)",emoji:"\ud83c\udfe2",categories:["work","obligations","creative","leisure","sport"],days:[
    Dy("Monday","Mo",0,[Ac("work",8,"Office day","Office",["Colleagues"]),Ac("leisure",4,"Evening","Home")],[.45,.5,.57,.6]),
    Dy("Tuesday","Tu",0,[Ac("work",8,"Work from home","Home"),Ac("sport",1.5,"Exercise","Gym"),Ac("leisure",2.5,"Free","Home")],[.5,.55,.65,.7]),
    Dy("Wednesday","We",0,[Ac("work",8,"Office day","Office",["Colleagues"]),Ac("obligations",2,"Groceries","Out"),Ac("leisure",2,"Evening","Home")],[.5,.5,.55,.6]),
    Dy("Thursday","Th",0,[Ac("work",8,"Work from home","Home"),Ac("leisure",4,"Free","Home")],[.5,.53,.6,.65]),
    Dy("Friday","Fr",0,[Ac("work",7,"Office day","Office",["Colleagues"]),Ac("leisure",5,"Weekend","Home",["Family"])],[.5,.55,.68,.75]),
    Dy("Saturday","Sa",1,[Ac("obligations",2,"Groceries","Out"),Ac("leisure",6,"Free","Home",["Family"]),Ac("creative",3,"Hobby","Home")],[.7,.7,.68,.65]),
    Dy("Sunday","Su",1,[Ac("leisure",7,"Relaxing","Home",["Family"]),Ac("obligations",2,"Prep","Home"),Ac("leisure",3,"Evening","Home")],[.7,.68,.63,.6])]},
  office_pt:{label:"Office job (part-time)",emoji:"\ud83c\udfe0",categories:["work","obligations","creative","leisure","sport"],days:[
    Dy("Monday","Mo",0,[Ac("work",6,"Working","Office",["Colleagues"]),Ac("obligations",2,"Household","Home"),Ac("leisure",4,"Free","Home")],[.5,.53,.57,.6]),
    Dy("Tuesday","Tu",0,[Ac("work",6,"Work from home","Home"),Ac("sport",1.5,"Exercise","Gym"),Ac("leisure",4.5,"Free","Home")],[.55,.57,.65,.7]),
    Dy("Wednesday","We",0,[Ac("obligations",3,"Household","Home"),Ac("creative",3,"Hobby","Home"),Ac("leisure",4,"Free","Home",["Family"])],[.6,.65,.68,.65]),
    Dy("Thursday","Th",0,[Ac("work",6,"Working","Office",["Colleagues"]),Ac("leisure",4,"Free","Home")],[.5,.53,.57,.6]),
    Dy("Friday","Fr",0,[Ac("work",4,"Half day","Home"),Ac("leisure",6,"Weekend","Home",["Family"])],[.55,.6,.7,.75]),
    Dy("Saturday","Sa",1,[Ac("leisure",6,"Free","Home",["Family"]),Ac("obligations",2,"Groceries","Out"),Ac("creative",3,"Hobby","Home")],[.7,.7,.68,.65]),
    Dy("Sunday","Su",1,[Ac("leisure",8,"Relaxing","Home",["Family"]),Ac("leisure",4,"Evening","Home")],[.7,.7,.7,.7])]},
  freelancer:{label:"Freelancer",emoji:"\ud83d\udcbb",categories:["work","obligations","creative","leisure","sport"],days:[
    Dy("Monday","Mo",0,[Ac("work",6,"Client work","Home"),Ac("work",2,"Admin","Home"),Ac("leisure",4,"Free","Home")],[.5,.55,.6,.6]),
    Dy("Tuesday","Tu",0,[Ac("work",7,"At client","Client",["Client"]),Ac("sport",1.5,"Exercise","Gym"),Ac("leisure",3.5,"Free","Home")],[.55,.57,.65,.7]),
    Dy("Wednesday","We",0,[Ac("creative",4,"Own project","Home"),Ac("work",3,"Client work","Home"),Ac("leisure",5,"Free","Home")],[.7,.65,.63,.65]),
    Dy("Thursday","Th",0,[Ac("work",7,"Co-working","Co-working",["Colleagues"]),Ac("leisure",5,"Free","Home")],[.55,.57,.63,.65]),
    Dy("Friday","Fr",0,[Ac("work",5,"Wrapping up","Home"),Ac("creative",2,"Side project","Home"),Ac("leisure",5,"Weekend","Home")],[.55,.6,.7,.75]),
    Dy("Saturday","Sa",1,[Ac("leisure",7,"Free","Home",["Family"]),Ac("creative",3,"Creative","Home"),Ac("sport",2,"Outdoors","Outside")],[.7,.7,.68,.65]),
    Dy("Sunday","Su",1,[Ac("leisure",9,"Relaxing","Home",["Family"]),Ac("obligations",2,"Prep","Home")],[.7,.68,.63,.6])]},
  stay_home:{label:"Stay-at-home parent",emoji:"\ud83c\udfe1",categories:["obligations","leisure","creative","sport"],days:[
    Dy("Monday","Mo",0,[Ac("obligations",3,"Kids & house","Home",["Kids"]),Ac("obligations",2,"Groceries","Out"),Ac("leisure",3,"Own time","Home"),Ac("creative",2,"Hobby","Home")],[.55,.57,.63,.65]),
    Dy("Tuesday","Tu",0,[Ac("obligations",4,"Kids & house","Home",["Kids"]),Ac("sport",1.5,"Exercise","Gym"),Ac("leisure",4.5,"Free","Home")],[.55,.6,.63,.6]),
    Dy("Wednesday","We",0,[Ac("obligations",5,"Activities","Out",["Kids"]),Ac("obligations",2,"Cooking","Home"),Ac("leisure",3,"Free","Home")],[.5,.5,.55,.6]),
    Dy("Thursday","Th",0,[Ac("obligations",3,"Household","Home"),Ac("creative",3,"Hobby","Home"),Ac("leisure",4,"Free","Home")],[.55,.6,.63,.6]),
    Dy("Friday","Fr",0,[Ac("obligations",3,"Groceries","Out"),Ac("leisure",5,"Family","Home",["Family"]),Ac("leisure",2,"Evening","Home")],[.55,.63,.7,.7]),
    Dy("Saturday","Sa",1,[Ac("leisure",6,"Family","Home",["Family"]),Ac("obligations",2,"House","Home"),Ac("leisure",4,"Free","Home")],[.7,.68,.63,.6]),
    Dy("Sunday","Su",1,[Ac("leisure",8,"Relaxing","Home",["Family"]),Ac("obligations",2,"Prep","Home"),Ac("leisure",2,"Evening","Home")],[.7,.7,.68,.65])]},
  student:{label:"Student",emoji:"\ud83c\udf93",categories:["school","obligations","leisure","sport"],days:[
    Dy("Monday","Mo",0,[Ac("school",6,"Lectures","Uni",["Classmates"]),Ac("obligations",2,"Studying","Library"),Ac("leisure",4,"Free","Home")],[.5,.53,.6,.65]),
    Dy("Tuesday","Tu",0,[Ac("school",4,"Lectures","Uni",["Classmates"]),Ac("obligations",3,"Studying","Library"),Ac("sport",1.5,"Exercise","Gym"),Ac("leisure",3.5,"Free","Home")],[.5,.53,.63,.7]),
    Dy("Wednesday","We",0,[Ac("school",6,"Practical","Uni",["Classmates"]),Ac("obligations",2,"Studying","Home"),Ac("leisure",4,"Free","Home")],[.5,.5,.55,.6]),
    Dy("Thursday","Th",0,[Ac("school",4,"Lectures","Uni",["Classmates"]),Ac("work",4,"Part-time job","Work",["Colleagues"]),Ac("leisure",4,"Free","Home")],[.5,.5,.55,.6]),
    Dy("Friday","Fr",0,[Ac("obligations",4,"Studying","Library"),Ac("leisure",8,"Going out","Home",["Friends"])],[.45,.53,.7,.8]),
    Dy("Saturday","Sa",1,[Ac("work",5,"Part-time job","Work",["Colleagues"]),Ac("leisure",7,"Free","Home")],[.5,.57,.68,.7]),
    Dy("Sunday","Su",1,[Ac("leisure",6,"Sleeping in","Home"),Ac("obligations",4,"Studying","Home"),Ac("leisure",2,"Evening","Home")],[.65,.57,.53,.55])]},
  primary_lower:{label:"Primary school (lower)",emoji:"\ud83c\udf92",categories:["school","leisure","hobby"],days:[
    Dy("Monday","Mo",0,[Ac("school",5.5,"School 8:30-14:00","School",["Classmates"]),Ac("leisure",6.5,"Playing","Home",["Family"])],[.65,.68,.68,.65]),
    Dy("Tuesday","Tu",0,[Ac("school",5.5,"School","School",["Classmates"]),Ac("hobby",1,"Swimming","Pool"),Ac("leisure",5.5,"Playing","Home")],[.65,.7,.68,.6]),
    Dy("Wednesday","We",0,[Ac("school",4,"School 8:30-12:30","School",["Classmates"]),Ac("leisure",8,"Free play","Home",["Family"])],[.6,.7,.73,.65]),
    Dy("Thursday","Th",0,[Ac("school",5.5,"School","School",["Classmates"]),Ac("hobby",1.5,"Football","Club"),Ac("leisure",5,"Playing","Home")],[.65,.68,.65,.6]),
    Dy("Friday","Fr",0,[Ac("school",5.5,"School","School",["Classmates"]),Ac("leisure",6.5,"Weekend starts","Home",["Family"])],[.65,.7,.75,.7]),
    Dy("Saturday","Sa",1,[Ac("sport",2,"Football match","Club"),Ac("leisure",9,"Free","Home",["Family"])],[.7,.75,.73,.7]),
    Dy("Sunday","Su",1,[Ac("leisure",10,"Free","Home",["Family"]),Ac("obligations",1,"Reading","Home")],[.75,.73,.7,.68])]},
  blanco:{label:"Blank",emoji:"\ud83c\udf1f",categories:["work","obligations","leisure"],days:[
    Dy("Monday","Mo",0,[Ac("work",8,"Work","Office"),Ac("leisure",4,"Evening","Home")],[.5,.5,.5,.5]),
    Dy("Tuesday","Tu",0,[Ac("work",8,"Work","Office"),Ac("leisure",4,"Evening","Home")],[.5,.5,.5,.5]),
    Dy("Wednesday","We",0,[Ac("work",8,"Work","Office"),Ac("leisure",4,"Evening","Home")],[.5,.5,.5,.5]),
    Dy("Thursday","Th",0,[Ac("work",8,"Work","Office"),Ac("leisure",4,"Evening","Home")],[.5,.5,.5,.5]),
    Dy("Friday","Fr",0,[Ac("work",8,"Work","Office"),Ac("leisure",4,"Evening","Home")],[.5,.5,.5,.5]),
    Dy("Saturday","Sa",1,[Ac("leisure",12,"Free","Home")],[.6,.6,.6,.6]),
    Dy("Sunday","Su",1,[Ac("leisure",12,"Free","Home")],[.6,.6,.6,.6])]},
};
const PERSONA_GROUPS=[
  {title:"Adults",items:["office_ft","office_pt","freelancer","stay_home"]},
  {title:"Education",items:["student","primary_lower"]},
  {title:"Other",items:["blanco"]},
];
const INIT_MEMBERS={
  ik:{emoji:"\ud83d\udc68",label:"Me",centerText:["Me"],bio:"38 · 2 days office, 3 days home · running & hobbies",categories:["work","obligations","creative","leisure","sport"],days:[
    Dy("Monday","Mo",0,[Ac("obligations",1,"Morning routine","Home",["Family"]),Ac("work",4,"Office (morning)","Office",["Colleagues"]),Ac("work",.5,"Lunch","Office"),Ac("work",3.5,"Office (afternoon)","Office",["Colleagues"]),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("obligations",.5,"Kids to bed","Home",["Kids"]),Ac("sport",1,"Running","Outside"),Ac("leisure",1.5,"Evening","Home")],[.5,.53,.6,.65]),
    Dy("Tuesday","Tu",0,[Ac("obligations",1,"Morning routine","Home",["Family"]),Ac("work",4,"Work from home (morning)","Home"),Ac("work",.5,"Lunch","Home"),Ac("work",3.5,"Work from home (afternoon)","Home"),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("obligations",.5,"Kids to bed","Home",["Kids"]),Ac("creative",2,"Creative time","Home"),Ac("leisure",1,"Evening","Home")],[.5,.55,.6,.7]),
    Dy("Wednesday","We",0,[Ac("obligations",1,"Morning routine","Home",["Family"]),Ac("work",4,"Office (morning)","Office",["Colleagues"]),Ac("work",.5,"Lunch","Office"),Ac("work",3.5,"Office (afternoon)","Office",["Colleagues"]),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("obligations",.5,"Kids to bed","Home",["Kids"]),Ac("leisure",2.5,"Free evening","Home")],[.5,.5,.55,.6]),
    Dy("Thursday","Th",0,[Ac("obligations",1,"Morning routine","Home",["Family"]),Ac("work",4,"Work from home (morning)","Home"),Ac("work",.5,"Lunch","Home"),Ac("work",3.5,"Work from home (afternoon)","Home"),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("obligations",.5,"Kids to bed","Home",["Kids"]),Ac("sport",1,"Running","Outside"),Ac("leisure",1.5,"Evening","Home")],[.5,.53,.6,.65]),
    Dy("Friday","Fr",0,[Ac("obligations",1,"Morning routine","Home",["Family"]),Ac("work",4,"Office (morning)","Office",["Colleagues"]),Ac("work",.5,"Lunch","Office"),Ac("work",2.5,"Office (afternoon)","Office",["Colleagues"]),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("obligations",.5,"Kids to bed","Home",["Kids"]),Ac("leisure",3,"Movie night with family","Home",["Family"]),Ac("leisure",1,"Evening","Home")],[.55,.6,.7,.8]),
    Dy("Saturday","Sa",1,[Ac("leisure",1.5,"Sleep in & breakfast","Home",["Family"]),Ac("sport",1,"Running","Outside"),Ac("obligations",1.5,"Groceries","Supermarket"),Ac("leisure",3,"Family outing","Out",["Family"]),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("creative",1.5,"Creative / garden","Home"),Ac("leisure",2.5,"Evening with partner","Home",["Partner"])],[.7,.75,.78,.75]),
    Dy("Sunday","Su",1,[Ac("leisure",2.5,"Sleep in & brunch","Home",["Family"]),Ac("leisure",3,"Family time","Home",["Family"]),Ac("obligations",1.5,"House & laundry","Home"),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("leisure",2,"Free time","Home"),Ac("creative",2,"Reading / hobby","Home")],[.7,.7,.68,.65])]},
  partner:{emoji:"\ud83d\udc69",label:"Partner",centerText:["Partner"],bio:"36 · 2 days office, 2 days home · yoga & reading",categories:["work","obligations","creative","leisure","sport"],days:[
    Dy("Monday","Mo",0,[Ac("obligations",1,"Morning routine","Home",["Family"]),Ac("work",4,"Office (morning)","Office",["Colleagues"]),Ac("work",.5,"Lunch","Office"),Ac("work",3.5,"Office (afternoon)","Office",["Colleagues"]),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("obligations",.5,"Kids to bed","Home",["Kids"]),Ac("leisure",2.5,"Free evening","Home")],[.5,.5,.57,.6]),
    Dy("Tuesday","Tu",0,[Ac("obligations",1,"Morning routine","Home",["Family"]),Ac("work",4,"Office (morning)","Office",["Colleagues"]),Ac("work",.5,"Lunch","Office"),Ac("work",3.5,"Office (afternoon)","Office",["Colleagues"]),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("obligations",.5,"Kids to bed","Home",["Kids"]),Ac("sport",1,"Yoga","Yoga studio"),Ac("leisure",1,"Free evening","Home")],[.5,.53,.65,.75]),
    Dy("Wednesday","We",0,[Ac("obligations",1,"Morning routine","Home",["Family"]),Ac("work",4,"Work from home (morning)","Home"),Ac("work",.5,"Lunch","Home"),Ac("work",2.5,"Work from home (afternoon)","Home"),Ac("obligations",1.5,"Pick up kids & activities","Out",["Kids"]),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("obligations",.5,"Kids to bed","Home",["Kids"]),Ac("leisure",1.5,"Free evening","Home")],[.5,.5,.57,.65]),
    Dy("Thursday","Th",0,[Ac("obligations",1,"Morning routine","Home",["Family"]),Ac("work",4,"Office (morning)","Office",["Colleagues"]),Ac("work",.5,"Lunch","Office"),Ac("work",3.5,"Office (afternoon)","Office",["Colleagues"]),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("obligations",.5,"Kids to bed","Home",["Kids"]),Ac("leisure",2.5,"Free evening","Home")],[.5,.53,.6,.65]),
    Dy("Friday","Fr",0,[Ac("obligations",1,"Morning routine","Home",["Family"]),Ac("work",3,"Work from home (morning)","Home"),Ac("work",.5,"Lunch","Home"),Ac("obligations",1.5,"Groceries","Supermarket"),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("obligations",.5,"Kids to bed","Home",["Kids"]),Ac("leisure",3,"Movie night with family","Home",["Family"]),Ac("creative",1.5,"Reading / series","Home")],[.55,.57,.7,.8]),
    Dy("Saturday","Sa",1,[Ac("leisure",1.5,"Sleep in & breakfast","Home",["Family"]),Ac("sport",1,"Running","Outside"),Ac("obligations",1.5,"Groceries","Supermarket"),Ac("leisure",3,"Family outing","Out",["Family"]),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("creative",1.5,"Creative / garden","Home"),Ac("leisure",2.5,"Evening with partner","Home",["Partner"])],[.7,.75,.78,.75]),
    Dy("Sunday","Su",1,[Ac("leisure",2.5,"Sleep in & brunch","Home",["Family"]),Ac("leisure",3,"Family time","Home",["Family"]),Ac("obligations",1.5,"House & laundry","Home"),Ac("obligations",1,"Dinner with family","Home",["Family"]),Ac("leisure",2,"Free time","Home"),Ac("creative",2,"Reading / hobby","Home")],[.7,.7,.68,.65])]},
  son:{emoji:"\ud83d\udc66",label:"Son",centerText:["Son"],bio:"8 · primary school · football & lego",categories:["school","leisure","hobby"],days:[
    Dy("Monday","Mo",0,[Ac("school",5.5,"School","School",["Classmates"]),Ac("leisure",6.5,"Playing","Home",["Family"])],[.65,.68,.65,.6]),
    Dy("Tuesday","Tu",0,[Ac("school",5.5,"School","School",["Classmates"]),Ac("hobby",1.5,"Football practice","Club"),Ac("leisure",5,"Playing","Home")],[.65,.7,.68,.6]),
    Dy("Wednesday","We",0,[Ac("school",4,"School (half day)","School",["Classmates"]),Ac("leisure",8,"Free play","Home",["Family"])],[.6,.7,.73,.65]),
    Dy("Thursday","Th",0,[Ac("school",5.5,"School","School",["Classmates"]),Ac("leisure",6.5,"Playing","Home",["Family"])],[.65,.65,.63,.6]),
    Dy("Friday","Fr",0,[Ac("school",5.5,"School","School",["Classmates"]),Ac("leisure",6.5,"Weekend!","Home",["Family"])],[.65,.7,.75,.7]),
    Dy("Saturday","Sa",1,[Ac("sport",2,"Football match","Club"),Ac("leisure",9,"Free","Home",["Family"])],[.7,.75,.73,.7]),
    Dy("Sunday","Su",1,[Ac("leisure",10,"Free","Home",["Family"]),Ac("obligations",1,"Reading","Home")],[.75,.73,.7,.65])]},
  daughter:{emoji:"\ud83d\udc67",label:"Daughter",centerText:["Daughter"],bio:"6 · primary school · dancing & drawing",categories:["school","leisure","hobby"],days:[
    Dy("Monday","Mo",0,[Ac("school",5.5,"School","School",["Classmates"]),Ac("leisure",6.5,"Playing","Home",["Family"])],[.7,.72,.68,.65]),
    Dy("Tuesday","Tu",0,[Ac("school",5.5,"School","School",["Classmates"]),Ac("hobby",1,"Dance class","Dance studio"),Ac("leisure",5.5,"Playing","Home")],[.7,.72,.7,.65]),
    Dy("Wednesday","We",0,[Ac("school",4,"School (half day)","School",["Classmates"]),Ac("leisure",8,"Free play","Home",["Family"])],[.65,.72,.75,.68]),
    Dy("Thursday","Th",0,[Ac("school",5.5,"School","School",["Classmates"]),Ac("leisure",6.5,"Playing","Home",["Family"])],[.7,.7,.68,.65]),
    Dy("Friday","Fr",0,[Ac("school",5.5,"School","School",["Classmates"]),Ac("leisure",6.5,"Weekend!","Home",["Family"])],[.7,.72,.75,.72]),
    Dy("Saturday","Sa",1,[Ac("leisure",10,"Free","Home",["Family"]),Ac("hobby",2,"Drawing","Home")],[.75,.75,.73,.7]),
    Dy("Sunday","Su",1,[Ac("leisure",10,"Free","Home",["Family"]),Ac("obligations",1,"Reading","Home")],[.75,.73,.7,.68])]},
};

function Wheel({days,highlightIdx,centerText,filterPerson,filterLoc,filterCat,onDayClick}) {
  const N=7,gap=2.8,off=-90,sl=360/N,els=[];
  const hasFilter=!!(filterPerson||filterLoc||filterCat);
  const actMatch=(act)=>{if(!hasFilter)return true;if(filterPerson&&!(act.with||[]).includes(filterPerson))return false;if(filterLoc&&act.loc!==filterLoc)return false;if(filterCat&&act.cat!==filterCat)return false;return true;};
  const dayHasMatch=(day)=>day.activities.some(actMatch);
  days.forEach((day,i)=>{
    const base=off+i*sl,ds=base+gap/2,de=base+sl-gap/2,span=de-ds;
    const dim=highlightIdx!==null&&highlightIdx!==i,bright=highlightIdx===i;
    const dayMatch=dayHasMatch(day);
    const d1=pol(base,55),d2=pol(base,255);
    els.push(<line key={"dv"+i} x1={d1.x} y1={d1.y} x2={d2.x} y2={d2.y} stroke="#E8D5C0" strokeWidth=".7" opacity=".4"/>);
    const tH=day.activities.reduce((s,a)=>s+a.hours,0);let aO=0;
    day.activities.forEach((act,j)=>{const pr=act.hours/tH,aS=ds+aO*span,aE=ds+(aO+pr)*span;aO+=pr;const bO=day.isWeekend?.6:.82;
      const match=actMatch(act);let op=bO;
      if(hasFilter&&!highlightIdx){op=match?1:.1;}else if(dim){op=.12;}else if(bright){op=1;}
      const tip=act.label+(act.note?" - "+act.note:"")+" ("+act.hours+"h)";
      els.push(<path key={"a"+i+"-"+j} d={arcP(aS,aE,70,142)} fill={COLORS[act.cat]||"#ccc"} opacity={op} style={{transition:"opacity .3s",cursor:"default"}}><title>{day.short+": "+tip}</title></path>);});
    const wI=158,wM=196,wR=wM-wI,nP=24;
    const actEnergies=[];{let acc=0;day.activities.forEach(act=>{const s=acc/tH,e=(acc+act.hours)/tH;actEnergies.push({s,e,en:act.energy||.5});acc+=act.hours;});}
    const gE=t=>{for(let k=0;k<actEnergies.length;k++){const a=actEnergies[k];if(t>=a.s&&t<=a.e)return a.en;}return .5;};
    const rawE=[];for(let n=0;n<=nP;n++){rawE.push(gE(n/nP));}
    for(let pass=0;pass<3;pass++){const tmp=[...rawE];for(let n=1;n<nP;n++){tmp[n]=(rawE[n-1]+rawE[n]*2+rawE[n+1])/4;}for(let n=1;n<nP;n++)rawE[n]=tmp[n];}
    let wP=[],bP=[];for(let n=0;n<=nP;n++){const t=n/nP,a=ds+t*span;wP.push(pol(a,wI+rawE[n]*wR));bP.push(pol(a,wI));}
    let pD="M"+bP[0].x+" "+bP[0].y+"L"+wP[0].x+" "+wP[0].y;for(let n=1;n<=nP;n++)pD+="L"+wP[n].x+" "+wP[n].y;for(let n=nP;n>=0;n--)pD+="L"+bP[n].x+" "+bP[n].y;pD+="Z";
    const aE2=rawE.reduce((a,b)=>a+b,0)/rawE.length,cr=Math.round(232-aE2*55),cg=Math.round(210-aE2*105),cb=Math.round(192-aE2*130);
    const wDim=hasFilter&&!dayMatch&&!highlightIdx;
    els.push(<path key={"wf"+i} d={pD} fill={"rgb("+cr+","+cg+","+cb+")"} opacity={wDim?.06:dim?.06:bright?.7:.45} style={{transition:"opacity .3s"}}/>);
    let sD="M"+wP[0].x+" "+wP[0].y;for(let n=1;n<=nP;n++)sD+="L"+wP[n].x+" "+wP[n].y;
    els.push(<path key={"wl"+i} d={sD} fill="none" stroke={"rgb("+Math.max(cr-30,0)+","+Math.max(cg-30,0)+","+Math.max(cb-30,0)+")"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={wDim?.08:dim?.08:bright?.9:.65} style={{transition:"opacity .3s"}}/>);
    const bR2=225,bPos=[.15,.38,.62,.85];
    day.happiness.forEach((hap,k)=>{const bA=ds+bPos[k]*span,pos=pol(bA,bR2),pc=Math.round(3+hap*4),ps=3+hap*8,pts=[];
      for(let p=0;p<pc;p++){const ang=(360/pc)*p,hu=38+hap*12,sa=45+hap*35,li=68-hap*14;pts.push(<ellipse key={p} cx={pos.x} cy={pos.y-ps*.45} rx={ps*.24} ry={ps*.45} transform={"rotate("+ang+","+pos.x+","+pos.y+")"} fill={"hsl("+hu+","+sa+"%,"+li+"%)"} opacity={bright?Math.min(.5+hap*.4+.2,1):.5+hap*.4}/>);}
      pts.push(<circle key="c" cx={pos.x} cy={pos.y} r={1.8+hap*2} fill={"hsl(38,70%,"+(55-hap*12)+"%)"} opacity=".85"/>);
      els.push(<g key={"bl"+i+"-"+k} opacity={wDim?.08:dim?.08:1} style={{transition:"opacity .3s"}}>{pts}</g>);});
    const mid=(ds+de)/2,lp=pol(mid,262);
    els.push(<text key={"lb"+i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central" fontFamily="'Playfair Display',serif" fontSize="12" fontWeight="600" fill={day.isWeekend?"#B8A08A":"#3D2E1F"} opacity={wDim?.2:dim?.2:1} style={{transition:"opacity .3s",pointerEvents:"none"}}>{day.short}</text>);
    els.push(<path key={"hit"+i} d={arcP(ds,de,60,280)} fill="transparent" style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();onDayClick&&onDayClick(i);}}/>);
  });
  return (<svg viewBox="0 0 600 600" style={{width:"100%",height:"100%",maxHeight:"100%"}}>
    <defs><filter id="sh"><feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#3D2E1F" floodOpacity=".07"/></filter></defs>
    <g transform="translate(300,300)">{[250,200,145,90].map((r,i)=>(<circle key={r} r={r} fill="none" stroke="#E8D5C0" strokeWidth=".5" opacity={.4-i*.05}/>))}
      <text textAnchor="middle" y={centerText[1]?"-4":"4"} fontFamily="'Playfair Display',serif" fontSize="16" fill="#3D2E1F" fontWeight="700">{centerText[0]}</text>
      {centerText[1]&&<text textAnchor="middle" y="14" fontFamily="Nunito,sans-serif" fontSize="9" fill="#8A7560" fontWeight="600">{centerText[1]}</text>}
      <g filter="url(#sh)">{els}</g></g></svg>);
}

function TimelineChart({days,cats,highlightIdx,filterCat,centerText,onDayClick}){
  const maxH=Math.max(...days.map(d=>d.activities.reduce((s,a)=>s+a.hours,0)));
  const rowH=80,gap=12,padL=72,padR=64,padT=36,padB=28;
  const W=840,H=padT+days.length*(rowH+gap)+padB;
  const barW=W-padL-padR;const RES=80;
  const interp=(vals,t)=>{if(!vals||vals.length<2)return .5;const n=vals.length-1;const idx=t*n;const lo=Math.max(0,Math.min(n-1,Math.floor(idx)));const hi=lo+1;const lt=idx-lo;const s=lt*lt*(3-2*lt);return vals[lo]+(vals[hi]-vals[lo])*s;};
  const getEnergyCurve=(day)=>{const tH=day.activities.reduce((s,a)=>s+a.hours,0);const rawE=[];let acc=0;day.activities.forEach(act=>{const s=acc/tH,e=(acc+act.hours)/tH;rawE.push({s,e,en:act.energy||.5});acc+=act.hours;});return (t)=>{for(const r of rawE){if(t>=r.s&&t<=r.e)return r.en;}return .5;};};
  const smoothSample=(fn,n)=>{const raw=[];for(let i=0;i<=n;i++)raw.push(fn(i/n));for(let pass=0;pass<3;pass++){const tmp=[...raw];for(let i=1;i<n;i++){tmp[i]=(raw[i-1]+raw[i]*2+raw[i+1])/4;}for(let i=1;i<n;i++)raw[i]=tmp[i];}return raw;};
  const ticks=[];
  for(let h=0;h<=Math.ceil(maxH);h+=2){const x=padL+(h/maxH)*barW;ticks.push(<g key={"t"+h}><line x1={x} y1={padT-2} x2={x} y2={padT+days.length*(rowH+gap)-gap} stroke="#E8D5C0" strokeWidth=".5" opacity=".4"/><text x={x} y={padT+days.length*(rowH+gap)-gap+14} textAnchor="middle" fontFamily="Nunito" fontSize="8" fill="#B8A08A">{h}h</text></g>);}
  const rows=days.map((day,i)=>{
    const y=padT+i*(rowH+gap);const tH=day.activities.reduce((s,a)=>s+a.hours,0);const dayW=(tH/maxH)*barW;
    const dim=highlightIdx!==null&&highlightIdx!==i;const bright=highlightIdx===i;
    const eFn=getEnergyCurve(day);const smoothE=smoothSample(eFn,RES);
    const ranges=[];let acc=0;day.activities.forEach(act=>{const s=acc/tH,e=(acc+act.hours)/tH;ranges.push({s,e,cat:act.cat,label:act.label,hours:act.hours});acc+=act.hours;});
    const actAreas=ranges.map((r,j)=>{
      const xStart=padL+r.s*dayW,xEnd=padL+r.e*dayW;const pts=[];
      const steps=Math.max(2,Math.round((r.e-r.s)*RES));
      for(let n=0;n<=steps;n++){const t=r.s+n/steps*(r.e-r.s);const si=Math.min(RES,Math.round(t*RES));pts.push({x:padL+t*dayW,yTop:y+rowH-(smoothE[si]*rowH*.88)-rowH*.04});}
      const yBase=y+rowH;let d="M"+pts[0].x.toFixed(1)+","+yBase+"L"+pts[0].x.toFixed(1)+","+pts[0].yTop.toFixed(1);
      for(let n=1;n<pts.length;n++)d+="L"+pts[n].x.toFixed(1)+","+pts[n].yTop.toFixed(1);
      d+="L"+pts[pts.length-1].x.toFixed(1)+","+yBase+"Z";
      const matchCat=!filterCat||r.cat===filterCat;
      const op=filterCat?(matchCat?(dim?.3:1):(dim?.03:.08)):(dim?.12:day.isWeekend?.65:.8);
      return(<g key={"a"+j}><path d={d} fill={COLORS[r.cat]||"#ccc"} opacity={op} style={{transition:"opacity .3s"}}><title>{r.label+": "+r.hours+"h"}</title></path>
        {(r.e-r.s)*dayW>32&&<text x={(xStart+xEnd)/2} y={y+rowH-8} textAnchor="middle" fontFamily="Nunito" fontSize={(r.e-r.s)*dayW>70?"8":"6.5"} fill="white" opacity={op>.3?.8:0} style={{pointerEvents:"none"}}>{r.label}</text>}
      </g>);});
    const ePts=[];for(let n=0;n<=RES;n++){ePts.push({x:padL+(n/RES)*dayW,y:y+rowH-(smoothE[n]*rowH*.88)-rowH*.04});}
    const eLineD="M"+ePts.map(p=>p.x.toFixed(1)+","+p.y.toFixed(1)).join("L");
    const hPts=[];for(let n=0;n<=RES;n++){const hVal=interp(day.happiness,n/RES);hPts.push({x:padL+(n/RES)*dayW,y:y+rowH-(hVal*rowH*.88)-rowH*.04});}
    const hLineD="M"+hPts.map(p=>p.x.toFixed(1)+","+p.y.toFixed(1)).join("L");
    const lineOp=dim?.08:bright?1:.6;
    return(<g key={"r"+i}>
      <text x={padL-6} y={y+rowH/2+1} textAnchor="end" dominantBaseline="central" fontFamily="'Playfair Display',serif" fontSize="11" fontWeight="600" fill={day.isWeekend?"#B8A08A":"#3D2E1F"} opacity={dim?.25:1} style={{pointerEvents:"none"}}>{day.short}</text>
      <rect x={padL} y={y} width={dayW} height={rowH} rx={5} fill={bright?"#F9EDE0":"#F5F0EA"} opacity={dim?.1:.2}/>
      {actAreas}
      <path d={eLineD} fill="none" stroke="rgba(61,46,31,.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity={dim?.1:.8} style={{transition:"opacity .3s"}}/>
      <path d={hLineD} fill="none" stroke="#B8860B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3" opacity={lineOp} style={{transition:"opacity .3s"}}/>
      <rect x={0} y={y} width={padL+dayW} height={rowH} fill="transparent" style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();onDayClick&&onDayClick(i);}}/>
    </g>);});
  return(<svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",maxWidth:840}}>
    <text x={W/2} y={16} textAnchor="middle" fontFamily="'Playfair Display',serif" fontSize="14" fontWeight="700" fill="#3D2E1F">{centerText[0]}{centerText[1]?" - "+centerText[1]:""}</text>
    {ticks}
    <rect x={padL} y={H-12} width={12} height={5} rx={2} fill="#E8D5C0" opacity=".6"/>
    <text x={padL+16} y={H-7} fontFamily="Nunito" fontSize="7" fill="#8A7560">Activities (height = energy)</text>
    <line x1={padL+160} y1={H-9} x2={padL+178} y2={H-9} stroke="#B8860B" strokeWidth="2.5" strokeDasharray="5,3"/>
    <text x={padL+182} y={H-7} fontFamily="Nunito" fontSize="7" fill="#8A7560">Happiness</text>
    {rows}
  </svg>);}

const btnS={width:20,height:20,borderRadius:"50%",border:"1px solid #D4C4B0",background:"#FAFAF7",cursor:"pointer",fontSize:".72rem",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#8A7560",padding:0,fontFamily:"Nunito"};

function DayCard({day,dayIdx,onUpdate,onHover,onPin,highlighted,dimmed,globalEdit,memberCats,allLocs,allPeople,onAddCategory}){
  const[edit,setEdit]=useState(false);
  const[noteOpen,setNoteOpen]=useState(null);
  const[dragIdx,setDragIdx]=useState(null);
  const[overIdx,setOverIdx]=useState(null);
  const[addingLoc,setAddingLoc]=useState(null);
  const[newLocVal,setNewLocVal]=useState("");
  const[addingPerson,setAddingPerson]=useState(null);
  const[newPersonVal,setNewPersonVal]=useState("");
  const listRef=useRef(null);
  const uA=(j,a)=>{const acts=[...day.activities];acts[j]=a;onUpdate(dayIdx,{...day,activities:acts});};
  const rA=j=>{const acts=day.activities.filter((_,k)=>k!==j);if(acts.length)onUpdate(dayIdx,{...day,activities:acts});};
  const addA=()=>onUpdate(dayIdx,{...day,activities:[...day.activities,{cat:"leisure",hours:1,label:"",loc:"Home",with:[],note:"",energy:.5}]});
  const sH=(k,v)=>{const h=[...day.happiness];h[k]=v;onUpdate(dayIdx,{...day,happiness:h});};
  const moveAct=(from,to)=>{if(from===to||from<0||to<0)return;const acts=[...day.activities];const item=acts.splice(from,1)[0];acts.splice(to,0,item);onUpdate(dayIdx,{...day,activities:acts});};
  const handlePointerDown=(e,j)=>{
    if(!edit)return;const el=e.currentTarget;el.setPointerCapture(e.pointerId);setDragIdx(j);setOverIdx(j);
    const items=listRef.current?.querySelectorAll('[data-actidx]');const rects=items?Array.from(items).map(it=>it.getBoundingClientRect()):[];
    const onMove=(ev)=>{let closest=j;let minDist=Infinity;rects.forEach((r,k)=>{const mid=r.top+r.height/2;const d=Math.abs(ev.clientY-mid);if(d<minDist){minDist=d;closest=k;}});setOverIdx(closest);};
    const onUp=()=>{el.removeEventListener('pointermove',onMove);el.removeEventListener('pointerup',onUp);el.removeEventListener('pointercancel',onUp);setDragIdx(prev=>{setOverIdx(ov=>{if(prev!==null&&ov!==null&&prev!==ov)moveAct(prev,ov);return null;});return null;});};
    el.addEventListener('pointermove',onMove);el.addEventListener('pointerup',onUp);el.addEventListener('pointercancel',onUp);};
  const tH=day.activities.reduce((s,a)=>s+a.hours,0);
  return (<div onClick={e=>{e.stopPropagation();onPin(dayIdx);}} onMouseEnter={()=>onHover(dayIdx)} onMouseLeave={()=>onHover(null)} onTouchStart={()=>onHover(null)} style={{background:"white",borderRadius:14,padding:"12px 16px",boxShadow:highlighted?"0 3px 18px rgba(61,46,31,.12)":"0 1px 10px rgba(61,46,31,.05)",borderLeft:"3px solid "+(highlighted?"#C75D3A":"transparent"),transform:highlighted?"translateX(3px)":"none",opacity:dimmed?.3:1,transition:"all .3s ease",cursor:"pointer",overflow:"hidden"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <span style={{fontFamily:"'Playfair Display',serif",fontSize:".93rem",fontWeight:600}}>{day.name}{day.isWeekend&&<span style={{fontSize:".56rem",background:"linear-gradient(135deg,#F0E4D6,#E8D5C0)",color:"#8A7560",padding:"1px 6px",borderRadius:8,marginLeft:5,fontWeight:400,fontFamily:"Nunito"}}>weekend</span>}</span>
      <button onClick={()=>setEdit(!edit)} style={{fontSize:".58rem",padding:"1px 8px",borderRadius:10,border:"1px solid "+(edit?"#C75D3A":"#E8C4B4"),background:edit?"#C75D3A":"#FDF0EB",color:edit?"white":"#C75D3A",cursor:"pointer",fontFamily:"Nunito",fontWeight:600,transition:"all .2s"}}>{edit?"\u2713":"\u270E"}</button>
    </div>
    <div style={{display:"flex",gap:2,height:6,borderRadius:3,overflow:"hidden",marginBottom:6}}>{day.activities.map((a,j)=>(<div key={j} style={{height:"100%",borderRadius:3,width:(a.hours/tH*100)+"%",background:COLORS[a.cat],transition:"width .3s"}}/>))}</div>
    <div ref={listRef}>
    {edit&&<p style={{fontSize:".56rem",color:"#B8A08A",fontStyle:"italic",marginBottom:4,marginTop:0}}>Tap an activity to edit location, category and more</p>}
    {day.activities.map((act,j)=>{const expanded=noteOpen===j;return(<div key={j} data-actidx={j} style={{fontSize:".72rem",color:"#3D2E1F",padding:"3px 0",borderTop:dragIdx!==null&&overIdx===j&&dragIdx!==j?"2px solid #C75D3A":"2px solid transparent",transition:"border-color .1s",opacity:dragIdx===j?.5:1}}>
      {edit?(<div>
        <div style={{display:"flex",alignItems:"center",gap:2,width:"100%",maxWidth:"100%"}}>
          <span onPointerDown={e=>handlePointerDown(e,j)} style={{cursor:"grab",fontSize:".68rem",color:"#D4C4B0",flexShrink:0,touchAction:"none",userSelect:"none"}}>{"\u2630"}</span>
          <div onClick={()=>setNoteOpen(expanded?null:j)} style={{width:16,height:16,borderRadius:"50%",background:COLORS[act.cat],flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}><span style={{fontSize:".4rem",color:"white",transform:expanded?"rotate(180deg)":"none",transition:"transform .2s",lineHeight:1}}>{"\u25BE"}</span></div>
          {expanded
            ?<input value={act.label} onChange={e=>uA(j,{...act,label:e.target.value})} placeholder="Activity..." onClick={e=>e.stopPropagation()} style={{flex:"1 1 0px",minWidth:0,border:"none",borderBottom:"1px dashed #D4C4B0",background:"transparent",fontSize:".65rem",fontFamily:"Nunito",padding:"1px 2px",outline:"none",color:"#3D2E1F"}}/>
            :<span onClick={()=>setNoteOpen(expanded?null:j)} style={{flex:"1 1 0px",minWidth:0,fontSize:".65rem",fontFamily:"Nunito",color:"#3D2E1F",cursor:"pointer",padding:"1px 2px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{act.label||<span style={{color:"#B8A08A"}}>Activity...</span>}</span>
          }
          <div style={{display:"flex",alignItems:"center",gap:0,flexShrink:0}}><button onClick={()=>uA(j,{...act,hours:Math.max(.5,act.hours-.5)})} style={btnS}>-</button><span style={{fontSize:".58rem",width:18,textAlign:"center",color:"#8A7560"}}>{act.hours}h</span><button onClick={()=>uA(j,{...act,hours:act.hours+.5})} style={btnS}>+</button></div>
          <input type="range" min="0" max="100" value={Math.round((act.energy||.5)*100)} onChange={e=>{e.stopPropagation();uA(j,{...act,energy:parseInt(e.target.value)/100});}} onClick={e=>e.stopPropagation()} style={{width:56,height:3,accentColor:"#C75D3A",flexShrink:0}}/>
          <button onClick={()=>rA(j)} style={{...btnS,color:"#C75D3A",border:"1px solid #E8C4B4",fontSize:".5rem",width:16,height:16,flexShrink:0}}>x</button>
        </div>
        {expanded&&<div style={{marginLeft:22,marginTop:4,padding:"8px 10px",background:"#FAFAF7",borderRadius:10,display:"flex",flexDirection:"column",gap:6,border:"1px solid #F0E4D6"}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:".58rem",color:"#8A7560",width:52,flexShrink:0}}>Category</span>
            <div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>{(memberCats||ALL_CATS).map(c=>(<button key={c} onClick={()=>uA(j,{...act,cat:c})} style={{fontSize:".54rem",padding:"2px 7px",borderRadius:8,border:"1px solid "+(act.cat===c?COLORS[c]:"#E8D5C0"),background:act.cat===c?COLORS[c]:"transparent",color:act.cat===c?"white":"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600,transition:"all .15s",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:act.cat===c?"white":COLORS[c],flexShrink:0}}/>{CAT_LABELS[c]}</button>))}
            {onAddCategory&&<button onClick={e=>{e.stopPropagation();onAddCategory();}} style={{fontSize:".5rem",padding:"2px 5px",borderRadius:8,border:"1px dashed rgba(61,46,31,.2)",background:"transparent",color:"#B8A08A",cursor:"pointer",fontFamily:"Nunito",lineHeight:1}}>+</button>}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:".58rem",color:"#8A7560",width:52,flexShrink:0}}>Location</span>
            {addingLoc===j?(<input autoFocus value={newLocVal} onChange={e=>setNewLocVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newLocVal.trim()){uA(j,{...act,loc:newLocVal.trim()});setAddingLoc(null);setNewLocVal("");}if(e.key==="Escape"){setAddingLoc(null);setNewLocVal("");}}} onBlur={()=>{setAddingLoc(null);setNewLocVal("");}} placeholder="New location..." style={{flex:1,border:"none",borderBottom:"1px dashed #C75D3A",background:"transparent",fontSize:".6rem",fontFamily:"Nunito",outline:"none",color:"#3D2E1F",padding:"1px 2px"}}/>):(<div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
              {(allLocs||[]).map(l=>(<button key={l} onClick={()=>uA(j,{...act,loc:l})} style={{fontSize:".54rem",padding:"2px 7px",borderRadius:8,border:"1px solid "+(act.loc===l?"#5B7A6E":"#E8D5C0"),background:act.loc===l?"#5B7A6E":"transparent",color:act.loc===l?"white":"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600,transition:"all .15s"}}>{l}</button>))}
              <button onClick={()=>{setAddingLoc(j);setNewLocVal("");}} style={{fontSize:".5rem",padding:"2px 5px",borderRadius:8,border:"1px dashed rgba(61,46,31,.15)",background:"transparent",color:"#B8A08A",cursor:"pointer",fontFamily:"Nunito"}}>+</button>
            </div>)}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:".58rem",color:"#8A7560",width:52,flexShrink:0}}>With</span>
            <div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
              {(allPeople||[]).map(p=>{const active=(act.with||[]).includes(p);return(<button key={p} onClick={()=>{const w=act.with||[];uA(j,{...act,with:active?w.filter(x=>x!==p):[...w,p]});}} style={{fontSize:".54rem",padding:"2px 7px",borderRadius:8,border:"1px solid "+(active?"#C75D3A":"#E8D5C0"),background:active?"#C75D3A":"transparent",color:active?"white":"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600,transition:"all .15s"}}>{p}</button>);})}
              {addingPerson===j?(<input autoFocus value={newPersonVal} onChange={e=>setNewPersonVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newPersonVal.trim()){const w=[...(act.with||[]),newPersonVal.trim()];uA(j,{...act,with:w});setAddingPerson(null);setNewPersonVal("");}if(e.key==="Escape"){setAddingPerson(null);setNewPersonVal("");}}} onBlur={()=>{setAddingPerson(null);setNewPersonVal("");}} placeholder="Name..." style={{width:55,border:"none",borderBottom:"1px dashed #C75D3A",background:"transparent",fontSize:".54rem",fontFamily:"Nunito",outline:"none",color:"#3D2E1F",padding:"1px 2px"}}/>):(<button onClick={()=>{setAddingPerson(j);setNewPersonVal("");}} style={{fontSize:".5rem",padding:"2px 5px",borderRadius:8,border:"1px dashed rgba(61,46,31,.15)",background:"transparent",color:"#B8A08A",cursor:"pointer",fontFamily:"Nunito"}}>+</button>)}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"flex-start",gap:4}}>
            <span style={{fontSize:".58rem",color:"#8A7560",width:52,flexShrink:0,paddingTop:3}}>Note</span>
            <textarea value={act.note||""} onChange={e=>uA(j,{...act,note:e.target.value})} placeholder="Details..." rows={2} style={{flex:1,border:"1px solid #E8D5C0",borderRadius:8,background:"white",fontSize:".6rem",fontFamily:"Nunito",padding:"4px 8px",outline:"none",color:"#3D2E1F",resize:"vertical"}}/>
          </div>
        </div>}
      </div>):(<div style={{display:"flex",alignItems:"center",gap:6,position:"relative"}} title={act.note||""}>
        <div style={{width:8,height:8,borderRadius:"50%",background:COLORS[act.cat],flexShrink:0}}/>
        <span style={{flex:1}}>{act.label}{act.note&&<span style={{color:"#D4A030",marginLeft:3,fontSize:".6rem"}}>{"\ud83d\udcac"}</span>}</span>
        <span style={{color:"#8A7560",fontSize:".66rem"}}>{act.hours}h</span>
        {act.loc&&<span style={{fontSize:".58rem",background:"#E8DDD2",color:"#6B5D4F",padding:"1px 6px",borderRadius:6,fontWeight:700}}>{act.loc}</span>}
        {(act.with||[]).length>0&&act.with.map((p,k)=>(<span key={k} style={{fontSize:".58rem",background:"#F9EDE0",color:"#3D2E1F",padding:"1px 6px",borderRadius:6,fontWeight:600}}>{p}</span>))}
      </div>)}
    </div>);})}
    </div>
    {edit&&<button onClick={addA} style={{width:"100%",padding:"5px 0",marginTop:4,border:"1.5px dashed #D4C4B0",borderRadius:8,background:"transparent",fontSize:".68rem",color:"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600}}>+ Activity</button>}
    {edit&&<div style={{marginTop:8,padding:"8px 0 0",borderTop:"1px solid #F0E4D6"}}><div style={{fontSize:".6rem",color:"#8A7560",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>Happiness per time of day</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px"}}>{["Morning","Afternoon","Late afternoon","Evening"].map((lbl,k)=>(<div key={k} style={{display:"flex",flexDirection:"column",gap:2}}>
          <span style={{fontSize:".54rem",color:"#8A7560",fontWeight:600}}>{lbl}</span>
          <div style={{display:"flex",alignItems:"center",gap:3}}>
            <input type="range" min="0" max="100" value={Math.round(day.happiness[k]*100)} onChange={e=>sH(k,parseInt(e.target.value)/100)} style={{flex:1,height:4,accentColor:"#B8860B",minWidth:0}}/>
            <span style={{fontSize:".5rem",color:"#B8860B",fontWeight:600,flexShrink:0}}>{Math.round(day.happiness[k]*100)}%</span>
          </div>
        </div>))}</div></div>}
  </div>);}

function AddModal({onAdd,onClose}){
  const[name,setName]=useState("");const[emoji,setEmoji]=useState("\ud83c\udf1f");const[persona,setPersona]=useState("blanco");
  const go=()=>{if(!name.trim())return;const p=PERSONAS[persona];const id="c_"+Date.now();onAdd(id,{emoji,label:name.trim(),centerText:[name.trim()],bio:"",categories:clone(p.categories),days:clone(p.days)});onClose();};
  return (<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(61,46,31,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#FDF6EE",borderRadius:20,padding:"28px 32px",maxWidth:420,width:"90%",boxShadow:"0 20px 60px rgba(61,46,31,.25)",maxHeight:"85vh",overflowY:"auto"}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",marginBottom:16}}>Add family member</h2>
      <div style={{marginBottom:14}}><label style={{fontSize:".68rem",color:"#8A7560",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:4}}>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Grandma, Friend..." autoFocus style={{width:"100%",padding:"8px 12px",borderRadius:10,border:"1.5px solid #D4C4B0",background:"white",fontSize:".85rem",fontFamily:"Nunito",outline:"none"}}/></div>
      <div style={{marginBottom:14}}><label style={{fontSize:".68rem",color:"#8A7560",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:4}}>Emoji</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{EMOJIS.map(e=>(<button key={e} onClick={()=>setEmoji(e)} style={{width:32,height:32,borderRadius:8,border:emoji===e?"2px solid #C75D3A":"2px solid transparent",background:emoji===e?"#C75D3A20":"#F5EDE3",fontSize:"1.1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{e}</button>))}</div></div>
      <div style={{marginBottom:18}}><label style={{fontSize:".68rem",color:"#8A7560",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>Starting profile</label>
        {PERSONA_GROUPS.map(g=>(<div key={g.title} style={{marginBottom:8}}><div style={{fontSize:".6rem",color:"#B8A08A",fontWeight:600,marginBottom:3}}>{g.title}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{g.items.map(pid=>{const p=PERSONAS[pid];return (<button key={pid} onClick={()=>setPersona(pid)} style={{fontSize:".68rem",padding:"4px 12px",borderRadius:12,border:persona===pid?"2px solid #3D2E1F":"1.5px solid rgba(61,46,31,.15)",background:persona===pid?"#3D2E1F":"transparent",color:persona===pid?"#FDF6EE":"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600}}>{p.emoji} {p.label}</button>);})}</div></div>))}</div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{padding:"8px 20px",borderRadius:12,border:"1.5px solid rgba(61,46,31,.15)",background:"transparent",color:"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:700,fontSize:".8rem"}}>Cancel</button>
        <button onClick={go} disabled={!name.trim()} style={{padding:"8px 24px",borderRadius:12,border:"none",background:name.trim()?"#3D2E1F":"#D4C4B0",color:name.trim()?"#FDF6EE":"#A89282",cursor:name.trim()?"pointer":"not-allowed",fontFamily:"Nunito",fontWeight:700,fontSize:".8rem"}}>Add</button>
      </div></div></div>);}

function getMonday(d){const dt=new Date(d||Date.now());const day=dt.getDay();const diff=dt.getDate()-day+(day===0?-6:1);dt.setDate(diff);dt.setHours(0,0,0,0);return dt;}
function fmtMonday(d){const dt=typeof d==='string'?new Date(d):d;const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];const start=new Date(dt.getFullYear(),0,1);const wk=Math.ceil(((dt-start)/86400000+start.getDay()+1)/7);return "Wk "+wk+" \u00b7 "+dt.getDate()+" "+months[dt.getMonth()];}
function toDateStr(d){const dt=typeof d==='string'?new Date(d):d;return dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0");}

export default function App(){
  const[members,setMembers]=useState(()=>clone(INIT_MEMBERS));
  const[order,setOrder]=useState(["ik","partner","son","daughter"]);
  const[member,setMember]=useState("ik");
  const[hoverDay,setHoverDay]=useState(null);
  const[pinnedDay,setPinnedDay]=useState(null);
  const[drawerDay,setDrawerDay]=useState(null);
  const[vizMode,setVizMode]=useState("wheel");
  const wheelRef=useRef(null);
  const exportSVG=()=>{const svg=wheelRef.current?.querySelector("svg");if(!svg)return;const c=svg.cloneNode(true);const style=document.createElementNS("http://www.w3.org/2000/svg","style");style.textContent="@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Nunito:wght@300;400;600;700&display=swap');";c.insertBefore(style,c.firstChild);c.setAttribute("xmlns","http://www.w3.org/2000/svg");const svgStr=new XMLSerializer().serializeToString(c);const isMobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);if(isMobile){const blob=new Blob([svgStr],{type:"image/svg+xml"});const url=URL.createObjectURL(blob);window.open(url,"_blank");setTimeout(()=>URL.revokeObjectURL(url),30000);}else{const blob=new Blob([svgStr],{type:"image/svg+xml"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=(m.label||"weekly-pulse")+"-week.svg";document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(url),5000);}};
  const[fP,setFP]=useState(null);const[fL,setFL]=useState(null);const[fC,setFC]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[tabEdit,setTabEdit]=useState(false);
  const[multiMode,setMultiMode]=useState("enkel");
  const[pageTitle,setPageTitle]=useState("The Weekly Pulse");
  const[undo,setUndo]=useState(null);
  const[snapshots,setSnapshots]=useState(()=>{
    function vary(days){return days.map(d=>{const nd=clone(d);nd.activities=nd.activities.map(a=>{const h=Math.max(.5,a.hours+((Math.random()-.5)*1));const en=Math.min(1,Math.max(.2,(a.energy||.5)+(Math.random()-.5)*.2));return {...a,hours:Math.round(h*2)/2,energy:en};});nd.happiness=nd.happiness.map(h=>Math.min(1,Math.max(.2,h+(Math.random()-.5)*.15)));return nd;});}
    const result={};const today=new Date();
    ["ik","partner","son","daughter"].forEach(id=>{const m=INIT_MEMBERS[id];if(!m)return;result[id]=[];for(let w=1;w<=3;w++){const dt=new Date(today);dt.setDate(dt.getDate()-w*7);const mon=getMonday(dt);result[id].push({id:"snap_init_"+id+"_"+w,monday:toDateStr(mon),label:fmtMonday(mon),days:vary(m.days),categories:clone(m.categories),savedAt:new Date(mon.getTime()+86400000).toISOString()});}result[id].reverse();});
    return result;});
  const[viewSnap,setViewSnap]=useState(null);
  const[viewSnapMonday,setViewSnapMonday]=useState(null);
  const[colors,setColors]=useState(()=>({...COLORS}));
  const[labels,setLabels]=useState(()=>({...CAT_LABELS}));
  const[colorPick,setColorPick]=useState(null);
  const[editCatName,setEditCatName]=useState(null);
  const[editSnapDate,setEditSnapDate]=useState(null);
  const[editMemberName,setEditMemberName]=useState(null);
  COLORS=colors;CAT_LABELS=labels;ALL_CATS=Object.keys(labels);
  const[sticky,setSticky]=useState(false);
  const[isMobile,setIsMobile]=useState(()=>typeof window!=="undefined"&&window.innerWidth<=600);
  useEffect(()=>{const h=()=>setIsMobile(window.innerWidth<=600);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  const titleRef=useRef(null);
  useEffect(()=>{const el=titleRef.current;if(!el)return;const obs=new IntersectionObserver(([e])=>setSticky(!e.isIntersecting),{threshold:0,rootMargin:"-1px 0px 0px 0px"});obs.observe(el);return()=>obs.disconnect();},[]);

  const addCategory=()=>{const id="cat_"+Date.now();setColors(prev=>({...prev,[id]:PALETTE[Object.keys(prev).length%PALETTE.length]}));setLabels(prev=>({...prev,[id]:"New"}));setColorPick(id);};
  const removeCategory=(catId)=>{if(Object.keys(labels).length<=2)return;setColors(prev=>{const n={...prev};delete n[catId];return n;});setLabels(prev=>{const n={...prev};delete n[catId];return n;});const fallback=Object.keys(labels).find(k=>k!==catId);if(fallback){setMembers(prev=>{const n=clone(prev);Object.values(n).forEach(m=>{m.days.forEach(d=>{d.activities.forEach(a=>{if(a.cat===catId)a.cat=fallback;});});});return n;});}if(colorPick===catId)setColorPick(null);};

  const m=members[member]||members[order[0]];
  const memberSnaps=(snapshots[member]||[]);
  const activeSnap=viewSnap?memberSnaps.find(s=>s.id===viewSnap):null;
  const days=activeSnap?activeSnap.days:m.days;
  const cats=activeSnap?activeSnap.categories:m.categories;
  const center=activeSnap?[m.centerText[0],activeSnap.label]:m.centerText;

  const updateDay=useCallback((idx,nd)=>{if(viewSnap){setSnapshots(prev=>{const next=clone(prev);const arr=next[member]||[];const si=arr.findIndex(s=>s.id===viewSnap);if(si>=0){arr[si].days[idx]=nd;next[member]=arr;}return next;});}else{setMembers(prev=>{const next=clone(prev);next[member].days[idx]=nd;return next;});}
  },[member,viewSnap]);

  const addMember=(id,data)=>{setMembers(prev=>({...prev,[id]:data}));setOrder(prev=>[...prev,id]);setMember(id);setFP(null);setFL(null);setFC(null);setViewSnap(null);};
  const removeMember=(id)=>{if(order.length<=1)return;const idx=order.indexOf(id);const backup=clone(members[id]);const nw=order.filter(x=>x!==id);setMembers(prev=>{const n=clone(prev);delete n[id];return n;});setOrder(nw);if(member===id){setMember(nw[0]);setViewSnap(null);}if(undo&&undo.timer)clearTimeout(undo.timer);const timer=setTimeout(()=>setUndo(null),8000);setUndo({id,data:backup,orderIdx:idx,timer});};
  const doUndo=()=>{if(!undo)return;clearTimeout(undo.timer);setMembers(prev=>({...prev,[undo.id]:undo.data}));setOrder(prev=>{const n=[...prev];n.splice(undo.orderIdx,0,undo.id);return n;});setMember(undo.id);setUndo(null);};
  const renameMember=(id,newName)=>{setMembers(prev=>{const n=clone(prev);n[id].label=newName;n[id].centerText=[newName];return n;});};
  const saveSnapshot=()=>{const mon=getMonday();const snap={id:"snap_"+Date.now(),monday:toDateStr(mon),label:fmtMonday(mon),days:clone(m.days),categories:clone(m.categories),savedAt:new Date().toISOString()};setSnapshots(prev=>{const next=clone(prev);if(!next[member])next[member]=[];next[member].push(snap);next[member].sort((a,b)=>a.monday.localeCompare(b.monday));return next;});};
  const updateSnapDate=(snapId,newDateStr)=>{const dt=new Date(newDateStr);const day=dt.getDay();if(day!==1){const diff=dt.getDate()-day+(day===0?-6:1);dt.setDate(diff);}setSnapshots(prev=>{const next=clone(prev);const arr=next[member]||[];const si=arr.findIndex(s=>s.id===snapId);if(si>=0){arr[si].monday=toDateStr(dt);arr[si].label=fmtMonday(dt);}arr.sort((a,b)=>a.monday.localeCompare(b.monday));return next;});};
  const deleteSnapshot=(snapId)=>{setSnapshots(prev=>{const next=clone(prev);next[member]=(next[member]||[]).filter(s=>s.id!==snapId);return next;});if(viewSnap===snapId)setViewSnap(null);};

  const allP=[...new Set(days.flatMap(d=>d.activities.flatMap(a=>a.with||[])))];
  const allL=[...new Set(days.flatMap(d=>d.activities.map(a=>a.loc)).filter(Boolean))];
  const isF=i=>{const d=days[i];if(fP&&!d.activities.some(a=>(a.with||[]).includes(fP)))return true;if(fL&&!d.activities.some(a=>a.loc===fL))return true;if(fC&&!d.activities.some(a=>a.cat===fC))return true;return false;};
  const activeDay=pinnedDay!==null?pinnedDay:hoverDay;
  const hl=activeDay!==null&&!isF(activeDay)?activeDay:null;
  const chip=(active,color)=>({fontSize:".66rem",padding:"2px 10px",borderRadius:14,border:"1.5px solid "+(active?color:"rgba(61,46,31,.15)"),background:active?color:"transparent",color:active?"white":"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600,transition:"all .2s"});
  const displayCats=multiMode==="allen"?[...new Set(order.flatMap(id=>members[id]?.categories||[]))]:cats;

  return (<div onClick={()=>{if(colorPick)setColorPick(null);}} style={{background:"#FDF6EE",minHeight:"100vh",width:"100%",boxSizing:"border-box",fontFamily:"Nunito,sans-serif",color:"#3D2E1F"}}>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Nunito:wght@300;400;600;700&display=swap" rel="stylesheet"/>
    <style>{`*{box-sizing:border-box;}html,body,#root{width:100%;min-height:100vh;margin:0;padding:0;background:#FDF6EE;overflow-x:hidden;}@media(max-width:800px){.wk-wheel{position:static!important;max-width:100%!important;width:100%!important;margin:0 auto 12px;padding:0!important;}.wk-wheel svg{max-width:100%!important;width:100%!important;}.wk-edit-btn button{width:30px!important;height:30px!important;}.wk-edit-btn svg{width:14px!important;height:14px!important;}.wk-pin{width:22px!important;height:22px!important;font-size:.7rem!important;}}@keyframes fadeIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}.snap-scroll::-webkit-scrollbar{display:none}@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}@media(max-width:800px){.wk-outer{padding:20px 10px 40px!important;}}`}</style>
    <div className="wk-outer" style={{width:"100%",minHeight:"100vh",display:"flex",flexDirection:"column",padding:"20px 24px 52px",position:"relative"}}>
      <div style={{position:"absolute",top:36,right:24,zIndex:10,display:"flex",gap:6,alignItems:"center"}} className="wk-edit-btn">
        <button onClick={exportSVG} style={{width:36,height:36,borderRadius:"50%",border:"none",background:"transparent",color:"#8A7560",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s",opacity:.5}} title="Export as SVG">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12v2a1 1 0 001 1h10a1 1 0 001-1v-2"/><path d="M9 3v9"/><path d="M5.5 8.5L9 12l3.5-3.5"/></svg>
        </button>
        <button onClick={()=>setTabEdit(!tabEdit)} style={{width:36,height:36,borderRadius:"50%",border:"none",background:tabEdit?"#C75D3A":"transparent",color:tabEdit?"white":"#8A7560",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s",opacity:tabEdit?1:.5,boxShadow:tabEdit?"0 2px 12px rgba(199,93,58,.3)":"none"}} title="Edit mode">
          {tabEdit?"\u2713":<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="5" x2="15" y2="5"/><line x1="3" y1="9" x2="15" y2="9"/><line x1="3" y1="13" x2="15" y2="13"/><circle cx="6" cy="5" r="1.5" fill="currentColor"/><circle cx="11" cy="9" r="1.5" fill="currentColor"/><circle cx="8" cy="13" r="1.5" fill="currentColor"/></svg>}
        </button>
      </div>
      <div ref={titleRef} style={{textAlign:"center",marginBottom:6}}>
        {tabEdit?(<input value={pageTitle} onChange={e=>setPageTitle(e.target.value)} style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(2rem,5vw,3rem)",fontWeight:700,letterSpacing:"-.02em",marginBottom:4,border:"none",borderBottom:"2px dashed #C75D3A",background:"transparent",textAlign:"center",outline:"none",color:"#3D2E1F",width:"80%",maxWidth:500}}/>):(<h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(2rem,5vw,3rem)",fontWeight:700,letterSpacing:"-.02em",marginBottom:4}}>{pageTitle}</h1>)}
      </div>
      {/* Sticky navbar */}
      {sticky&&<div style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"rgba(253,246,238,.93)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",borderBottom:"1px solid rgba(212,196,176,.4)",padding:"7px 16px",display:"flex",alignItems:"center",gap:8,animation:"slideDown .18s ease"}}>
        <div style={{display:"flex",gap:0,borderRadius:20,overflow:"hidden",border:"1.5px solid rgba(61,46,31,.12)",flexShrink:0}}>
          {order.map((id,i)=>{const mm=members[id];if(!mm)return null;const act=multiMode!=="allen"&&multiMode!=="alleWeken"&&member===id;return(<button key={id} onClick={()=>{setMember(id);setMultiMode("enkel");setFP(null);setFL(null);setFC(null);setViewSnap(null);}} title={mm.label} style={{fontFamily:"Nunito",fontSize:".65rem",fontWeight:700,padding:"4px 10px",border:"none",borderLeft:i===0?"none":"1px solid rgba(61,46,31,.1)",background:act?"#3D2E1F":"transparent",color:act?"#FDF6EE":"#8A7560",cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>{mm.emoji} {mm.label}</button>);})}
          {order.length>1&&<button onClick={()=>{setMultiMode(multiMode==="allen"?"enkel":"allen");setFP(null);setFL(null);setFC(null);}} style={{fontFamily:"Nunito",fontSize:".65rem",fontWeight:700,padding:"4px 10px",border:"none",borderLeft:"1px solid rgba(61,46,31,.1)",background:multiMode==="allen"?"#3D2E1F":"transparent",color:multiMode==="allen"?"#FDF6EE":"#8A7560",cursor:"pointer",transition:"all .2s"}}>All</button>}
        </div>
        <div style={{flex:1,display:"flex",justifyContent:"center"}}>
          {multiMode!=="allen"&&<select value={viewSnap||(multiMode==="alleWeken"?"__allweeks__":"__live__")} onChange={e=>{const v=e.target.value;if(v==="__live__"){setViewSnap(null);setViewSnapMonday(null);setMultiMode("enkel");}else if(v==="__allweeks__"){setMultiMode("alleWeken");setViewSnap(null);setViewSnapMonday(null);}else{const s=memberSnaps.find(x=>x.id===v);if(s){setViewSnap(s.id);setViewSnapMonday(s.monday);setMultiMode("enkel");setFP(null);setFL(null);setFC(null);}}}} style={{fontFamily:"Nunito",fontSize:".65rem",fontWeight:600,padding:"4px 28px 4px 12px",borderRadius:20,border:"1.5px solid rgba(61,46,31,.12)",background:"transparent",color:"#3D2E1F",cursor:"pointer",outline:"none",appearance:"none",WebkitAppearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238A7560' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center",minWidth:80}}>
            <option value="__live__">Live</option>
            {memberSnaps.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
            {memberSnaps.length>0&&<option value="__allweeks__">All weeks</option>}
          </select>}
          {multiMode==="enkel"&&allP.length>0&&<select value={fP||""} onChange={e=>setFP(e.target.value||null)} style={{fontFamily:"Nunito",fontSize:".62rem",fontWeight:600,padding:"4px 24px 4px 10px",borderRadius:20,border:"1.5px solid rgba(61,46,31,.12)",background:"transparent",color:fP?"#3D2E1F":"#B8A08A",cursor:"pointer",outline:"none",appearance:"none",WebkitAppearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238A7560' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center"}}>
            <option value="">With…</option>
            {allP.map(p=><option key={p} value={p}>{p}</option>)}
          </select>}
          {multiMode==="enkel"&&allL.length>0&&<select value={fL||""} onChange={e=>setFL(e.target.value||null)} style={{fontFamily:"Nunito",fontSize:".62rem",fontWeight:600,padding:"4px 24px 4px 10px",borderRadius:20,border:"1.5px solid rgba(61,46,31,.12)",background:"transparent",color:fL?"#3D2E1F":"#B8A08A",cursor:"pointer",outline:"none",appearance:"none",WebkitAppearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238A7560' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center"}}>
            <option value="">Where…</option>
            {allL.map(l=><option key={l} value={l}>{l}</option>)}
          </select>}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",gap:0,borderRadius:20,overflow:"hidden",border:"1.5px solid rgba(61,46,31,.12)"}}>
            <button onClick={()=>setVizMode("wheel")} style={{fontSize:".65rem",padding:"4px 12px",border:"none",background:vizMode==="wheel"?"#3D2E1F":"transparent",color:vizMode==="wheel"?"#FDF6EE":"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600,transition:"all .2s"}}>Wheel</button>
            <button onClick={()=>setVizMode("timeline")} style={{fontSize:".65rem",padding:"4px 12px",border:"none",borderLeft:"1px solid rgba(61,46,31,.1)",background:vizMode==="timeline"?"#3D2E1F":"transparent",color:vizMode==="timeline"?"#FDF6EE":"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600,transition:"all .2s"}}>Timeline</button>
          </div>
          <button onClick={saveSnapshot} style={{width:26,height:26,borderRadius:"50%",border:"1.5px solid rgba(61,46,31,.1)",background:"transparent",color:"#B8A08A",cursor:"pointer",fontSize:".75rem",display:"flex",alignItems:"center",justifyContent:"center"}} title="Save week">📌</button>
          <button onClick={()=>setTabEdit(!tabEdit)} style={{width:26,height:26,borderRadius:"50%",border:"none",background:tabEdit?"#C75D3A":"transparent",color:tabEdit?"white":"#8A7560",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",opacity:tabEdit?1:.5}} title="Edit">
            {tabEdit?"✓":<svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="5" x2="15" y2="5"/><line x1="3" y1="9" x2="15" y2="9"/><line x1="3" y1="13" x2="15" y2="13"/><circle cx="6" cy="5" r="1.5" fill="currentColor"/><circle cx="11" cy="9" r="1.5" fill="currentColor"/><circle cx="8" cy="13" r="1.5" fill="currentColor"/></svg>}
          </button>
        </div>
      {/* Controls — desktop: two rows | mobile: one compact row */}
      {isMobile?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:8,flexWrap:"nowrap",padding:"0 4px"}}>
          {/* Emoji-only persona pills */}
          <div style={{display:"flex",gap:0,borderRadius:20,overflow:"hidden",border:"1.5px solid rgba(61,46,31,.12)",flexShrink:0}}>
            {order.map((id,i)=>{const mm=members[id];if(!mm)return null;const act=multiMode!=="allen"&&multiMode!=="alleWeken"&&member===id;return(
              <button key={id} onClick={()=>{if(tabEdit&&member===id){setEditMemberName(id);}else if(multiMode==="alleWeken"){setMember(id);setFP(null);setFL(null);setFC(null);}else{setMember(id);setMultiMode("enkel");setFP(null);setFL(null);setFC(null);setViewSnap(null);}}} style={{fontFamily:"Nunito",fontSize:".72rem",padding:"4px 8px",border:"none",borderLeft:i===0?"none":"1px solid rgba(61,46,31,.1)",background:act?"#3D2E1F":"transparent",color:act?"#FDF6EE":"#8A7560",cursor:"pointer",transition:"all .2s",lineHeight:1,whiteSpace:"nowrap"}} title={mm.label}>
                {mm.emoji}{act&&<span style={{fontSize:".58rem",marginLeft:3,fontWeight:700}}>{mm.label}</span>}
              </button>
            );})}
            {order.length>1&&<button onClick={()=>{setMultiMode(multiMode==="allen"?"enkel":"allen");setFP(null);setFL(null);setFC(null);}} style={{fontFamily:"Nunito",fontSize:".6rem",fontWeight:700,padding:"4px 7px",border:"none",borderLeft:"1px solid rgba(61,46,31,.1)",background:multiMode==="allen"?"#3D2E1F":"transparent",color:multiMode==="allen"?"#FDF6EE":"#8A7560",cursor:"pointer",transition:"all .2s"}}>All</button>}
          </div>
          {/* Week dropdown */}
          <select value={viewSnap||(multiMode==="alleWeken"?"__allweeks__":"__live__")} onChange={e=>{const v=e.target.value;if(v==="__live__"){setViewSnap(null);setViewSnapMonday(null);setMultiMode("enkel");}else if(v==="__allweeks__"){setMultiMode("alleWeken");setViewSnap(null);setViewSnapMonday(null);}else{const s=memberSnaps.find(x=>x.id===v);if(s){setViewSnap(s.id);setViewSnapMonday(s.monday);setMultiMode("enkel");setFP(null);setFL(null);setFC(null);}}}} style={{fontFamily:"Nunito",fontSize:".62rem",fontWeight:600,padding:"4px 22px 4px 10px",borderRadius:20,border:"1.5px solid rgba(61,46,31,.12)",background:"transparent",color:"#3D2E1F",cursor:"pointer",outline:"none",appearance:"none",WebkitAppearance:"none",flexShrink:1,minWidth:0,maxWidth:90,backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238A7560' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 7px center"}}>
            <option value="__live__">Live</option>
            {memberSnaps.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
            {memberSnaps.length>0&&<option value="__allweeks__">All weeks</option>}
          </select>
          {/* Viz icon toggle */}
          <div style={{display:"flex",gap:0,borderRadius:20,overflow:"hidden",border:"1.5px solid rgba(61,46,31,.12)",flexShrink:0}}>
            <button onClick={()=>setVizMode("wheel")} title="Wheel" style={{padding:"4px 9px",border:"none",background:vizMode==="wheel"?"#3D2E1F":"transparent",color:vizMode==="wheel"?"#FDF6EE":"#8A7560",cursor:"pointer",transition:"all .2s",lineHeight:1,display:"flex",alignItems:"center"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg>
            </button>
            <button onClick={()=>setVizMode("timeline")} title="Timeline" style={{padding:"4px 9px",border:"none",borderLeft:"1px solid rgba(61,46,31,.1)",background:vizMode==="timeline"?"#3D2E1F":"transparent",color:vizMode==="timeline"?"#FDF6EE":"#8A7560",cursor:"pointer",transition:"all .2s",lineHeight:1,display:"flex",alignItems:"center"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
          {/* Save */}
          <button onClick={saveSnapshot} style={{width:26,height:26,borderRadius:"50%",border:"1.5px solid rgba(61,46,31,.1)",background:"transparent",color:"#B8A08A",cursor:"pointer",fontSize:".75rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}} title="Save week">📌</button>
        </div>
      ):(
        <>
        {/* Persona tabs */}
        <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:6,flexWrap:"wrap",alignItems:"center"}}>
          {order.map(id=>{const mm=members[id];if(!mm)return null;return (<div key={id} style={{position:"relative",display:"inline-flex"}}>
              {tabEdit&&editMemberName===id?(<div style={{display:"flex",alignItems:"center",background:member===id?"#3D2E1F":"white",borderRadius:16,border:"1.5px solid "+(member===id?"#3D2E1F":"rgba(61,46,31,.12)"),padding:"2px 8px",gap:3}}>
                <span style={{fontSize:".72rem"}}>{mm.emoji}</span>
                <input autoFocus value={mm.label} onChange={e=>renameMember(id,e.target.value)} onBlur={()=>setEditMemberName(null)} onKeyDown={e=>{if(e.key==="Enter")setEditMemberName(null);}} style={{width:60,border:"none",borderBottom:"1px dashed "+(member===id?"#FDF6EE60":"#C75D3A"),background:"transparent",fontSize:".68rem",fontFamily:"Nunito",fontWeight:700,outline:"none",color:member===id?"#FDF6EE":"#3D2E1F",padding:0}}/>
              </div>):(<button onClick={()=>{if(tabEdit&&member===id){setEditMemberName(id);}else if(multiMode==="alleWeken"){setMember(id);setFP(null);setFL(null);setFC(null);}else{setMember(id);setMultiMode("enkel");setFP(null);setFL(null);setFC(null);setViewSnap(null);}}} style={{fontFamily:"Nunito",fontSize:".68rem",fontWeight:700,padding:"3px 12px",borderRadius:16,border:"1.5px solid "+(multiMode!=="allen"&&multiMode!=="alleWeken"&&member===id?"#3D2E1F":multiMode==="alleWeken"&&member===id?"#5B7A6E":"rgba(61,46,31,.12)"),background:multiMode!=="allen"&&multiMode!=="alleWeken"&&member===id?"#3D2E1F":multiMode==="alleWeken"&&member===id?"#5B7A6E":"transparent",color:(multiMode!=="allen"&&member===id&&multiMode!=="alleWeken")||(multiMode==="alleWeken"&&member===id)?"#FDF6EE":"#8A7560",cursor:"pointer",transition:"all .3s",lineHeight:1.3}}>{mm.emoji} {mm.label}{tabEdit&&member===id&&<span style={{marginLeft:3,fontSize:".5rem",opacity:.6}}>{"✎"}</span>}</button>)}
              {tabEdit&&order.length>1&&<button onClick={e=>{e.stopPropagation();removeMember(id);}} style={{position:"absolute",top:-5,right:-5,width:14,height:14,borderRadius:"50%",border:"1px solid #E0D4C6",background:"white",color:"#C75D3A",fontSize:".5rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Nunito",boxShadow:"0 1px 3px rgba(0,0,0,.1)",animation:"fadeIn .2s ease"}}>x</button>}
            </div>);})}
          {tabEdit&&<button onClick={()=>setShowAdd(true)} style={{width:22,height:22,borderRadius:"50%",border:"1.5px dashed rgba(61,46,31,.15)",background:"transparent",color:"#8A7560",cursor:"pointer",fontSize:".7rem",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .2s ease"}}>+</button>}
          {!tabEdit&&order.length>1&&multiMode!=="alleWeken"&&<button onClick={()=>{setMultiMode(multiMode==="allen"?"enkel":"allen");setFP(null);setFL(null);setFC(null);}} style={{fontFamily:"Nunito",fontSize:".68rem",fontWeight:700,padding:"3px 12px",borderRadius:16,border:"1.5px solid "+(multiMode==="allen"?"#3D2E1F":"rgba(61,46,31,.12)"),background:multiMode==="allen"?"#3D2E1F":"transparent",color:multiMode==="allen"?"#FDF6EE":"#8A7560",cursor:"pointer",transition:"all .3s",lineHeight:1.3}}>All</button>}
        </div>
        {/* Week + viz toolbar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:10,flexWrap:"wrap"}}>
          {memberSnaps.length>0&&<>
            {multiMode!=="allen"&&<button onClick={()=>{if(multiMode==="alleWeken"){setMultiMode("enkel");}else{setMultiMode("alleWeken");setViewSnap(null);setViewSnapMonday(null);setFP(null);setFL(null);setFC(null);}}} style={{fontSize:".62rem",padding:"4px 12px",borderRadius:20,border:"1.5px solid "+(multiMode==="alleWeken"?"#5B7A6E":"rgba(61,46,31,.12)"),background:multiMode==="alleWeken"?"#5B7A6E":"transparent",color:multiMode==="alleWeken"?"white":"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600,transition:"all .2s",whiteSpace:"nowrap"}}>All weeks</button>}
            {memberSnaps.map(s=>(<div key={s.id} style={{position:"relative",flexShrink:0}}>
              {editSnapDate===s.id?(<input type="date" autoFocus value={s.monday||""} onChange={e=>updateSnapDate(s.id,e.target.value)} onBlur={()=>setEditSnapDate(null)} style={{fontSize:".58rem",width:90,padding:"4px 8px",borderRadius:20,border:"1.5px solid #5B7A6E",background:"white",color:"#3D2E1F",fontFamily:"Nunito",outline:"none"}}/>
              ):(<button onClick={()=>{if(tabEdit){setEditSnapDate(s.id);}else{const n=viewSnap===s.id?null:s.id;setViewSnap(n);setViewSnapMonday(n?s.monday:null);setMultiMode("enkel");setFP(null);setFL(null);setFC(null);}}} style={{fontSize:".62rem",padding:"4px 12px",borderRadius:20,border:"1.5px solid "+(viewSnap===s.id?"#5B7A6E":"rgba(61,46,31,.12)"),background:viewSnap===s.id?"#5B7A6E":"transparent",color:viewSnap===s.id?"white":"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600,transition:"all .2s",whiteSpace:"nowrap"}}>{s.label}</button>)}
              {tabEdit&&<button onClick={e=>{e.stopPropagation();deleteSnapshot(s.id);}} style={{position:"absolute",top:-4,right:-4,width:13,height:13,borderRadius:"50%",border:"1px solid #E0D4C6",background:"white",color:"#C75D3A",fontSize:".4rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 2px rgba(0,0,0,.08)"}}>x</button>}
            </div>))}
            <button onClick={()=>{setViewSnap(null);setViewSnapMonday(null);setMultiMode("enkel");}} style={{fontSize:".62rem",padding:"4px 12px",borderRadius:20,border:"1.5px solid "+(multiMode==="enkel"&&!viewSnap?"#3D2E1F":"rgba(61,46,31,.12)"),background:multiMode==="enkel"&&!viewSnap?"#3D2E1F":"transparent",color:multiMode==="enkel"&&!viewSnap?"white":"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600,transition:"all .2s",whiteSpace:"nowrap"}}>Live</button>
            <div style={{width:1,height:16,background:"#D4C4B0",margin:"0 4px",flexShrink:0}}/>
          </>}
          <div style={{display:"flex",gap:0,borderRadius:20,overflow:"hidden",border:"1.5px solid rgba(61,46,31,.12)",flexShrink:0}}>
            <button onClick={()=>setVizMode("wheel")} style={{fontSize:".62rem",padding:"4px 14px",border:"none",background:vizMode==="wheel"?"#3D2E1F":"transparent",color:vizMode==="wheel"?"#FDF6EE":"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600,transition:"all .2s"}}>Wheel</button>
            <button onClick={()=>setVizMode("timeline")} style={{fontSize:".62rem",padding:"4px 14px",border:"none",borderLeft:"1px solid rgba(61,46,31,.1)",background:vizMode==="timeline"?"#3D2E1F":"transparent",color:vizMode==="timeline"?"#FDF6EE":"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600,transition:"all .2s"}}>Timeline</button>
          </div>
          <button onClick={saveSnapshot} style={{width:28,height:28,borderRadius:"50%",border:"1.5px solid rgba(61,46,31,.1)",background:"transparent",color:"#B8A08A",cursor:"pointer",fontSize:".8rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}} title="Save this week">📌</button>
        </div>
        </>
      )}
        <button onClick={saveSnapshot} style={{width:28,height:28,borderRadius:"50%",border:"1.5px solid rgba(61,46,31,.1)",background:"transparent",color:"#B8A08A",cursor:"pointer",fontSize:".8rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}} title="Save this week">📌</button>
      </div>
      {/* Bio */}
      {multiMode!=="allen"&&m.bio!==undefined&&<div style={{textAlign:"center",marginBottom:8}}>
        {tabEdit?(<input value={m.bio||""} onChange={e=>setMembers(prev=>{const n=clone(prev);n[member].bio=e.target.value;return n;})} placeholder="Short description..." style={{border:"none",borderBottom:"1px dashed #C75D3A",background:"transparent",fontSize:".72rem",fontFamily:"Nunito",fontStyle:"italic",color:"#B8A08A",outline:"none",textAlign:"center",width:"60%",maxWidth:400,padding:"2px 0"}}/>):(<p style={{fontSize:".72rem",color:"#B8A08A",fontStyle:"italic",fontWeight:300,margin:0}}>{m.bio}</p>)}
      </div>}
      {/* Visual area */}
      {multiMode==="enkel"?(<div style={{flex:1,display:"flex",justifyContent:"center",alignItems:"center",minHeight:0}}>
        <div ref={wheelRef} style={{width:"100%",maxWidth:vizMode==="wheel"?"min(calc(100vh - 220px),840px)":"840px",maxHeight:vizMode==="wheel"?"calc(100vh - 220px)":undefined,display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center"}}>
          {vizMode==="wheel"?(<Wheel days={days} highlightIdx={drawerDay!==null?drawerDay:hl} centerText={center} filterPerson={fP} filterLoc={fL} filterCat={fC} onDayClick={i=>{setMultiMode("enkel");setDrawerDay(drawerDay===i?null:i);}}/>):(<TimelineChart days={days} cats={cats} highlightIdx={drawerDay!==null?drawerDay:hl} filterCat={fC} centerText={center} onDayClick={i=>{setMultiMode("enkel");setDrawerDay(drawerDay===i?null:i);}}/>)}
        </div>
      </div>):multiMode==="allen"?(<div style={{flex:1,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20,width:"100%",alignContent:"start"}}>
        {order.map(id=>{const mm=members[id];if(!mm)return null;
          const mSnaps=snapshots[id]||[];const mSnap=viewSnapMonday?mSnaps.find(s=>s.monday===viewSnapMonday):null;
          const mDays=mSnap?mSnap.days:mm.days;const mCats=mSnap?mSnap.categories:mm.categories;const mCenter=mSnap?[mm.centerText[0],mSnap.label]:mm.centerText;
          return (<div key={id} style={{borderRadius:14,padding:12,cursor:"pointer",transition:"all .2s"}} onClick={()=>{setMember(id);setMultiMode("enkel");}}>
            <div style={{textAlign:"center",marginBottom:4}}><span style={{fontSize:".72rem",fontFamily:"'Playfair Display',serif",fontWeight:700}}>{mm.emoji} {mm.label}</span></div>
            {vizMode==="wheel"?(<Wheel days={mDays} highlightIdx={null} centerText={mCenter} filterPerson={fP} filterLoc={fL} filterCat={fC} onDayClick={i=>{setMember(id);setMultiMode("enkel");setDrawerDay(i);}}/>):(<TimelineChart days={mDays} cats={mCats} highlightIdx={null} filterCat={fC} centerText={mCenter} onDayClick={i=>{setMember(id);setMultiMode("enkel");setDrawerDay(i);}}/>)}
          </div>);})}
      </div>):(<div style={{flex:1,width:"100%",maxWidth:800,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
        {memberSnaps.map(s=>(<div key={s.id} style={{borderRadius:14,padding:12,cursor:"pointer",transition:"all .2s"}} onClick={()=>{setViewSnap(s.id);setMultiMode("enkel");}}>
          <div style={{textAlign:"center",marginBottom:4}}><span style={{fontSize:".72rem",fontFamily:"'Playfair Display',serif",fontWeight:700}}>{s.label}</span></div>
          {vizMode==="wheel"?(<Wheel days={s.days} highlightIdx={null} centerText={[m.centerText[0],s.label]} filterPerson={null} filterLoc={null} filterCat={fC} onDayClick={()=>{}}/>):(<TimelineChart days={s.days} cats={s.categories||m.categories} highlightIdx={null} filterCat={fC} centerText={[m.centerText[0],s.label]} onDayClick={()=>{}}/>)}
        </div>))}
        <div style={{borderRadius:14,padding:12,cursor:"pointer",transition:"all .2s"}} onClick={()=>{setViewSnap(null);setMultiMode("enkel");}}>
          <div style={{textAlign:"center",marginBottom:4}}><span style={{fontSize:".72rem",fontFamily:"'Playfair Display',serif",fontWeight:700}}>Current</span></div>
          {vizMode==="wheel"?(<Wheel days={m.days} highlightIdx={null} centerText={[m.centerText[0],"Current"]} filterPerson={null} filterLoc={null} filterCat={fC} onDayClick={()=>{}}/>):(<TimelineChart days={m.days} cats={m.categories} highlightIdx={null} filterCat={fC} centerText={[m.centerText[0],"Current"]} onDayClick={()=>{}}/>)}
        </div>
        </div>
        <p style={{fontSize:".72rem",color:"#B8A08A",fontWeight:300,marginTop:10,textAlign:"center"}}>Click a week to zoom in</p>
      </div>)}
      {/* Slide-in drawer */}
      {drawerDay!==null&&<>
        <div onClick={()=>setDrawerDay(null)} style={{position:"fixed",inset:0,background:"rgba(61,46,31,.25)",zIndex:1000,animation:"fadeIn .2s ease"}}/>
        <div style={{position:"fixed",top:0,right:0,bottom:0,width:"min(420px, 88vw)",background:"#FDF6EE",zIndex:1001,boxShadow:"-8px 0 40px rgba(61,46,31,.15)",overflowY:"auto",padding:"20px 16px",animation:"slideIn .25s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:"1.1rem",fontWeight:700}}>{days[drawerDay]?.name}</span>
            <button onClick={()=>setDrawerDay(null)} style={{width:32,height:32,borderRadius:"50%",border:"none",background:"#F0E4D6",color:"#8A7560",cursor:"pointer",fontSize:".9rem",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Nunito"}}>{"\u2715"}</button>
          </div>
          <p style={{fontSize:".62rem",color:"#C75D3A",marginBottom:10,fontFamily:"Nunito",fontWeight:600}}>{"\u270E"} Click the pencil in the card to edit</p>
          {days[drawerDay]&&<DayCard key={member+"-"+(viewSnap||"live")+"-drawer-"+drawerDay} day={days[drawerDay]} dayIdx={drawerDay} onUpdate={updateDay} onHover={()=>{}} onPin={()=>{}} highlighted={false} dimmed={false} globalEdit={tabEdit} memberCats={cats} allLocs={allL} allPeople={allP} onAddCategory={addCategory}/>}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
            <button onClick={()=>setDrawerDay(Math.max(0,drawerDay-1))} disabled={drawerDay===0} style={{fontSize:".68rem",padding:"5px 14px",borderRadius:10,border:"1.5px solid #E8D5C0",background:"white",color:drawerDay===0?"#D4C4B0":"#3D2E1F",cursor:drawerDay===0?"default":"pointer",fontFamily:"Nunito",fontWeight:600}}>{"\u2190"} {drawerDay>0?days[drawerDay-1]?.short:""}</button>
            <button onClick={()=>setDrawerDay(Math.min(6,drawerDay+1))} disabled={drawerDay===6} style={{fontSize:".68rem",padding:"5px 14px",borderRadius:10,border:"1.5px solid #E8D5C0",background:"white",color:drawerDay===6?"#D4C4B0":"#3D2E1F",cursor:drawerDay===6?"default":"pointer",fontFamily:"Nunito",fontWeight:600}}>{drawerDay<6?days[drawerDay+1]?.short:""} {"\u2192"}</button>
          </div>
        </div>
      </>}
    </div>
    {/* Floating legend bar */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:150,background:"rgba(253,246,238,.94)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid rgba(212,196,176,.35)",padding:"6px 16px",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"center",gap:10,minHeight:38}}>
      {displayCats.filter(cat=>labels[cat]).map(cat=>(<div key={cat} style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:".62rem",color:"#8A7560",position:"relative",background:colorPick===cat?"white":"transparent",borderRadius:colorPick===cat?8:0,padding:colorPick===cat?"2px 6px":"0",boxShadow:colorPick===cat?"0 2px 12px rgba(61,46,31,.1)":"none",transition:"all .2s"}}>
        <div onClick={e=>{e.stopPropagation();setColorPick(colorPick===cat?null:cat);setEditCatName(null);}} style={{width:8,height:8,borderRadius:"50%",background:colors[cat]||"#ccc",cursor:"pointer",border:"2px solid "+(colorPick===cat?"#3D2E1F":"transparent"),transition:"all .2s",flexShrink:0}}/>
        {editCatName===cat?(<input autoFocus value={labels[cat]} onChange={e=>setLabels(prev=>({...prev,[cat]:e.target.value}))} onBlur={()=>setEditCatName(null)} onKeyDown={e=>{if(e.key==="Enter")setEditCatName(null);}} style={{width:60,border:"none",borderBottom:"1px dashed #C75D3A",background:"transparent",fontSize:".62rem",fontFamily:"Nunito",outline:"none",color:"#3D2E1F",padding:0}}/>):(<span onClick={e=>{e.stopPropagation();setFC(fC===cat?null:cat);}} style={{cursor:"pointer",borderBottom:fC===cat?"1.5px solid "+(colors[cat]||"#8A7560"):"1.5px solid transparent",paddingBottom:1,transition:"all .2s",color:fC===cat?(colors[cat]||"#3D2E1F"):"#8A7560",fontWeight:fC===cat?700:400}}>{labels[cat]}</span>)}
        {colorPick===cat&&<div style={{position:"absolute",bottom:"100%",left:0,marginBottom:6,background:"white",borderRadius:12,padding:"10px 12px",boxShadow:"0 6px 24px rgba(61,46,31,.2)",zIndex:160,border:"1px solid #E8D5C0",width:210}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:".54rem",color:"#B8A08A",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>Choose color</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>{PALETTE.map(clr=>(<div key={clr} onClick={()=>setColors(prev=>({...prev,[cat]:clr}))} style={{width:20,height:20,borderRadius:"50%",background:clr,cursor:"pointer",border:colors[cat]===clr?"2.5px solid #3D2E1F":"2.5px solid transparent",transition:"all .15s"}}/>))}</div>
          <div style={{display:"flex",gap:6,borderTop:"1px solid #F0E4D6",paddingTop:6}}>
            <button onClick={()=>setEditCatName(cat)} style={{fontSize:".56rem",padding:"2px 8px",borderRadius:8,border:"1px solid #D4C4B0",background:"transparent",color:"#8A7560",cursor:"pointer",fontFamily:"Nunito",fontWeight:600}}>Rename</button>
            <button onClick={()=>removeCategory(cat)} style={{fontSize:".56rem",padding:"2px 8px",borderRadius:8,border:"1px solid #E8C4B4",background:"transparent",color:"#C75D3A",cursor:"pointer",fontFamily:"Nunito",fontWeight:600}}>Remove</button>
          </div>
        </div>}
      </div>))}
      {tabEdit&&<button onClick={e=>{e.stopPropagation();addCategory();}} style={{width:16,height:16,borderRadius:"50%",border:"1.5px dashed rgba(61,46,31,.15)",background:"transparent",color:"#B8A08A",cursor:"pointer",fontSize:".55rem",display:"inline-flex",alignItems:"center",justifyContent:"center"}} title="Add category">+</button>}
      <div style={{width:1,height:12,background:"#D4C4B0",margin:"0 4px"}}/>
      <div style={{display:"flex",alignItems:"center",gap:5,fontSize:".6rem",color:"#B8A08A"}}><div style={{width:28,height:3,borderRadius:2,background:"linear-gradient(to right,#E8D5C0,#C75D3A)"}}/><span>Energy</span></div>
      <div style={{display:"flex",alignItems:"center",gap:5,fontSize:".6rem",color:"#B8A08A"}}><div style={{width:28,height:3,borderRadius:2,background:"linear-gradient(to right,#D1C4B5,#E8B830)"}}/><span>Happiness</span></div>
    </div>
    {showAdd&&<AddModal onAdd={addMember} onClose={()=>setShowAdd(false)}/>}
    {undo&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#3D2E1F",color:"#FDF6EE",borderRadius:14,padding:"10px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 8px 32px rgba(61,46,31,.3)",zIndex:1001,animation:"fadeUp .3s ease"}}>
      <span style={{fontSize:".82rem"}}>{undo.data.emoji} <strong>{undo.data.label}</strong> removed</span>
      <button onClick={doUndo} style={{fontSize:".78rem",padding:"4px 14px",borderRadius:10,border:"1.5px solid rgba(253,246,238,.3)",background:"transparent",color:"#E8B830",cursor:"pointer",fontFamily:"Nunito",fontWeight:700}}>Undo</button>
    </div>}
  </div>);
}