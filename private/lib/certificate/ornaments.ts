// Decorative SVG artwork for each certificate template (ported from the template library).
export function ornament(t: { id: string; filled: boolean }): string{
const c=t.filled?'#c0b7fc':'#43228c';
const line=(x1: number,y1: number,x2: number,y2: number,w=1)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke-width="'+w+'"/>';
const rect=(x: number,y: number,w: number,h: number,fill='none')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"/>';
let a='';
function dots(x: number,y: number,cols: number,rows: number,space=13,r=1.5){let v='';for(let i=0;i<cols;i++)for(let j=0;j<rows;j++)v+='<circle cx="'+(x+i*space)+'" cy="'+(y+j*space)+'" r="'+r+'" fill="currentColor" stroke="none"/>';return v;}
if(t.id==='workshop-participation'){
a='<g stroke="none"><rect x="1040" y="0" width="42" height="612" fill="#f8f6ff"/><rect x="1082" y="0" width="24" height="195" fill="#23086c"/><rect x="1048" y="205" width="24" height="250" fill="#23086c"/><rect x="1050" y="480" width="24" height="92" fill="#23086c"/><rect x="1001" y="92" width="22" height="22" fill="#fff"/></g>';
a+='<defs><clipPath id="circle-dots"><circle cx="1040" cy="340" r="95"/></clipPath></defs><g clip-path="url(#circle-dots)" stroke="none">';
for(let x=940;x<1140;x+=8)for(let y=242;y<440;y+=8)a+='<circle cx="'+x+'" cy="'+y+'" r="1.7" fill="'+(x>=1040?'#23086c':'#eee9ff')+'"/>';
a+='</g>'+line(1027,0,1027,605)+line(1113,400,1113,605);
}else if(t.id==='webinar-attendance'){
a=line(65,232,650,232);
for(let y=150;y<600;y+=150)a+='<path d="M 790 '+y+' C 855 '+(y-105)+' 895 '+(y+105)+' 963 '+y+' S 1060 '+(y-80)+' 1130 '+y+'" fill="none" stroke-width="1.8"/>'+line(780,y+70,1122,y+70);
a+=line(1080,90,1080,630);
}else if(t.id==='assessed-achievement'){
a=line(66,265,66,560,2);for(let x=810;x<=1120;x+=62)a+=line(x,120,x,550);for(let y=120;y<=550;y+=61)a+=line(810,y,1122,y);
([[810,181],[934,364],[1058,242],[1058,486]] as number[][]).forEach(p=>a+=rect(p[0],p[1],62,61,'#b5a8ef'));
}else if(t.id==='challenge-participation'){
a=line(65,232,650,232)+line(1090,80,1090,625);
a+='<path d="M1090 120 H800 V250 H960 V340 H1090 M1090 420 H990 V480 H860 V580 H1090" fill="none" stroke-width="1.6"/>';
[120,340,420,580].forEach(y=>a+=rect(1085,y-5,10,10,c));
}else if(t.id==='course-completion'){
a=line(65,232,650,232)+'<circle cx="1090" cy="310" r="273" fill="none" stroke-width="1.5"/>'+line(1060,0,1060,605);
[40,250,312,390,583].forEach(y=>a+=line(760,y,1122,y));a+=dots(955,120,10,7,11,1.4);
}else if(t.id==='competition-award'){
a=rect(24,24,1074,746)+'<path d="M40 72 L65 44 H320 L337 57 H940 L957 44 H1065 L1082 67 V725 L1055 746 H65 L40 723 Z" fill="none"/>';
a+=dots(140,315,6,5,15)+dots(900,315,6,5,15);
}else if(t.id==='speaker-appreciation'){
a=line(70,190,70,750)+line(55,250,130,250)+line(70,750,1080,750)+'<path d="M840 343 A250 250 0 0 1 1090 93 M835 343 H1122 M1090 0 V390" fill="none"/>'+dots(952,181,6,5,16)+dots(38,650,6,4,15);
}else if(t.id==='mentor-judge-recognition'){
a='<path d="M50 34 H780 Q815 34 840 59 L880 85 H1122 M50 750 H980 Q1010 750 1035 733 H1075" fill="none"/>'+line(50,34,50,35,5);a+=dots(995,78,5,1,17);
}else if(t.id==='organizer-volunteer-service'){
a=line(32,224,1090,224);a+=rect(855,290,185,180)+rect(760,385,150,150)+rect(960,430,65,65)+dots(700,300,5,4,16);
}else if(t.id==='cabinet-tenure'){
a='<path d="M34 250 V35 H495 M840 35 H1088 V760 H34 V600" fill="none"/>'+line(34,250,34,600,2)+dots(60,108,4,4,17)+dots(1010,108,4,4,17);
}else if(t.id==='partner-appreciation'){
a='<circle cx="532" cy="598" r="36" fill="none"/><circle cx="581" cy="598" r="36" fill="none"/>'+line(365,598,498,598)+line(616,598,750,598);
}else if(t.id==='research-presentation'){
a=line(45,100,790,100)+line(45,600,1090,600)+line(1090,0,1090,650)+dots(960,530,7,4,15);
}
return '<svg class="ornament" viewBox="0 0 1122.52 793.7" aria-hidden="true" style="color:'+c+'" fill="none" stroke="'+c+'">'+a+'</svg>';
}
