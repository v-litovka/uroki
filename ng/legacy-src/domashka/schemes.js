/* ===== общая часть: рисование схем (отрезков) как в учебнике ===== */
/* desc = {rows:[{name:'Г.',segs:[{v:5,dash:0}],note:''}], up:[{r,a,b,t}], down:[{r,a,b,t}], right:'?'}
   a..b — номера отрезков в строке (включительно) */
function plural(n,a,b,c){const m=n%10,h=n%100;return m===1&&h!==11?a:(m>=2&&m<=4&&(h<12||h>14)?b:c)}
function nf(n,f){return n+' '+plural(n,f[0],f[1],f[2])}
function raza(k){return plural(k,'раз','раза','раз')}
function drawScheme(d,opt){
  opt=opt||{};
  const X0=d.rows.some(r=>r.name)?34:8,MAXW=opt.w||230,MIN=24;
  const maxV=Math.max(...d.rows.map(r=>r.segs.reduce((s,g)=>s+g.v,0)));
  const k=MAXW/maxV;
  const rows=d.rows.map((r,ri)=>{let x=X0;const xs=[x];r.segs.forEach(g=>{x+=Math.max(MIN,g.v*k);xs.push(x)});return {r,xs,ri};});
  let y=0;const parts=[];
  const lbl=(x,yy,t)=>{const q=/\?/.test(t);return `<text x="${x}" y="${yy}" text-anchor="middle" class="${q?'sq':'sl'}">${t}</text>`};
  const brace=(x1,x2,yy,dir,t)=>{
    if(t===''||t==null)return '';
    const s=dir; /* -1 вверх, 1 вниз */
    const y0=yy+s*5,yb=yy+s*11,yp=yy+s*16,m=(x1+x2)/2;
    let p;
    if(x2-x1<26)p=`M${x1} ${y0}V${yb}H${x2}V${y0}`;
    else p=`M${x1} ${y0}Q${x1} ${yb} ${x1+6} ${yb}H${m-6}Q${m} ${yb} ${m} ${yp}Q${m} ${yb} ${m+6} ${yb}H${x2-6}Q${x2} ${yb} ${x2} ${y0}`;
    return `<path d="${p}" class="br${/\?/.test(t)?' bq':''}"/>`+lbl(m,s<0?yy-21:yy+33,t);
  };
  const lineY=[];
  rows.forEach(R=>{
    const hasUp=(d.up||[]).some(b=>b.r===R.ri),hasDown=(d.down||[]).some(b=>b.r===R.ri);
    y+=hasUp?36:18;const ly=y;lineY.push(ly);
    if(R.r.name)parts.push(`<text x="2" y="${ly+5}" class="nm">${R.r.name}</text>`);
    R.r.segs.forEach((g,i)=>{parts.push(`<line x1="${R.xs[i]}" y1="${ly}" x2="${R.xs[i+1]}" y2="${ly}" class="sg${g.dash?' ds':''}"/>`)});
    R.xs.forEach((x,i)=>{const dash=(i>0&&R.r.segs[i-1].dash)&&(i===R.xs.length-1);parts.push(`<circle cx="${x}" cy="${ly}" r="3.6" class="${dash?'dt ho':'dt'}"/>`)});
    (d.up||[]).filter(b=>b.r===R.ri).forEach(b=>parts.push(brace(R.xs[b.a]+1,R.xs[b.b+1]-1,ly,-1,b.t)));
    (d.down||[]).filter(b=>b.r===R.ri).forEach(b=>parts.push(brace(R.xs[b.a]+1,R.xs[b.b+1]-1,ly,1,b.t)));
    if(R.r.note)parts.push(`<text x="${R.xs[R.xs.length-1]+10}" y="${ly+5}" class="sq" text-anchor="start">${R.r.note}</text>`);
    y+=hasDown?38:14;
  });
  let maxX=Math.max(...rows.map(R=>R.xs[R.xs.length-1]+(R.r.note?70:0)));
  if(d.right){
    const xr=Math.max(...rows.map(R=>R.xs[R.xs.length-1]))+12,y1=lineY[0]-6,y2=lineY[lineY.length-1]+6,m=(y1+y2)/2;
    parts.push(`<path d="M${xr} ${y1}Q${xr+6} ${y1} ${xr+6} ${y1+6}V${m-6}Q${xr+6} ${m} ${xr+12} ${m}Q${xr+6} ${m} ${xr+6} ${m+6}V${y2-6}Q${xr+6} ${y2} ${xr} ${y2}" class="br bq"/>`);
    parts.push(`<text x="${xr+17}" y="${m+6}" class="sq" text-anchor="start">${d.right}</text>`);
    maxX=Math.max(maxX,xr+40);
  }
  const H=y+2,W=maxX+8;
  return `<svg class="scheme" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="схема">${parts.join('')}</svg>`;
}
const SCHEME_CSS=`.scheme{display:block;max-width:100%;height:auto;margin:0 auto;overflow:visible}
.scheme .sg{stroke:#2B3A9E;stroke-width:4;stroke-linecap:round}
.scheme .ds{stroke-dasharray:6 5;stroke-width:3}
.scheme .dt{fill:#2B3A9E}.scheme .dt.ho{fill:#fff;stroke:#2B3A9E;stroke-width:2}
.scheme .br{fill:none;stroke:#26224F;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.scheme .br.bq{stroke:#E8452C}
.scheme text{font-family:'Nunito',system-ui,sans-serif;font-weight:900;font-size:17px;fill:#26224F}
.scheme .sq{fill:#E8452C;font-size:19px}
.scheme .nm{font-size:15px;fill:#5B5785}`;

/* ===== готовые схемы по типам задач ===== */
const SCH={
  /* целое из частей: ищем целое */
  sum:(a,b,qWhole,qa,qb)=>({rows:[{segs:[{v:a},{v:b}]}],up:[{r:0,a:0,b:1,t:qWhole}],down:[{r:0,a:0,b:0,t:qa},{r:0,a:1,b:1,t:qb}]}),
  /* сравнение двух: второй больше на d */
  more:(n1,n2,a,d,ta,td,tq)=>({rows:[{name:n1,segs:[{v:a}]},{name:n2,segs:[{v:a},{v:d}]}],up:[{r:0,a:0,b:0,t:ta},{r:1,a:1,b:1,t:td}],down:[{r:1,a:0,b:1,t:tq}]}),
  /* второй меньше на d */
  less:(n1,n2,a,d,ta,td,tq)=>({rows:[{name:n1,segs:[{v:a}]},{name:n2,segs:[{v:a-d},{v:d,dash:1}]}],up:[{r:0,a:0,b:0,t:ta},{r:1,a:1,b:1,t:td}],down:[{r:1,a:0,b:0,t:tq}]}),
  /* второй больше в k раз */
  times:(n1,n2,a,k,ta,tq)=>({rows:[{name:n1,segs:[{v:a}]},{name:n2,segs:Array.from({length:k},()=>({v:a}))}],up:[{r:0,a:0,b:0,t:ta}],down:[{r:1,a:0,b:k-1,t:tq}]}),
  /* второй меньше в k раз */
  part:(n1,n2,b,k,tb,tq)=>({rows:[{name:n1,segs:Array.from({length:k},()=>({v:b/k}))},{name:n2,segs:[{v:b/k}]}],up:[{r:0,a:0,b:k-1,t:tb}],down:[{r:1,a:0,b:0,t:tq}]}),
  /* на сколько больше: ? на разнице */
  diff:(n1,n2,big,small,tb,ts)=>({rows:[{name:n1,segs:[{v:small},{v:big-small}]},{name:n2,segs:[{v:small}]}],up:[{r:0,a:0,b:1,t:tb},{r:1,a:0,b:0,t:ts}],down:[{r:0,a:1,b:1,t:'?'}]}),
  /* во сколько раз: большее делим на кусочки по меньшему */
  ratio:(n1,n2,big,small,k,tb,ts)=>({rows:[{name:n1,segs:Array.from({length:k},()=>({v:small})),note:'? раз'},{name:n2,segs:[{v:small}]}],up:[{r:0,a:0,b:k-1,t:tb},{r:1,a:0,b:0,t:ts}],down:[]}),
  /* две строки + «вместе» справа */
  both:(base,right)=>Object.assign({},base,{right})
};

