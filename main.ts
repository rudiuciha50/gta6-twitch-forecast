// Console-family shape forecast for GTA VI Twitch CCU.
// Node 22 | stdlib only | deterministic | offline
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INDIR  = process.env.MAKEFUN_INPUT_DIR  ?? '/input';
const OUTDIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const LEVELS = [0.05, 0.25, 0.5, 0.75, 0.95];
const Z      = [-1.645, -0.674, 0, 0.674, 1.645];
const SHAPE   = [[2,0.82],[3,0.70],[4,0.60],[6,0.62],[8,0.55],[12,0.68],[16,1.05],[20,1.30],[24,1.15]];
const S0=0.24, S1=0.02;

interface C {levels:number[];known:{hour:number;viewers:number}[];forecast:{hour:number}[]}

function sh(h:number):number {
  const a=SHAPE[0],b=SHAPE[SHAPE.length-1];
  if(h<=a[0])return a[1]; if(h>=b[0])return b[1];
  for(let i=0;i<SHAPE.length-1;i++){
    const[h0,r0]=SHAPE[i],[h1,r1]=SHAPE[i+1];
    if(h>=h0&&h<=h1){const t=(Math.log(h)-Math.log(h0))/(Math.log(h1)-Math.log(h0));return Math.exp(Math.log(r0)+t*(Math.log(r1)-Math.log(r0)))}
  }
  return 1;
}
function qs(p1:number,h:number):number[]{
  const m=p1*sh(h),s=S0+S1*(h-1);
  return Z.map(z=>Math.exp(Math.log(m)+z*s)).map(v=>Math.min(1e9,Math.max(1e-6,+((v*100).toFixed(0)))/100));
}

mkdirSync(OUTDIR,{recursive:!0});
for(const f of readdirSync(INDIR).filter(x=>x.endsWith('.in')).sort()){
  const id=f.slice(0,-3),c: C=JSON.parse(readFileSync(join(INDIR,f),'utf8'));
  if(c.levels.length!==LEVELS.length||c.levels.some((t:number,j:number)=>t!==LEVELS[j]))throw Error('levels');
  const h1=c.known.find((k:{hour:number})=>k.hour===1); if(!h1)throw Error('no h1');
  const out=c.forecast.map(({hour}:{hour:number})=>({hour,q:qs(Math.max(1,h1.viewers),hour)}));
  writeFileSync(join(OUTDIR,`${id}.out`),JSON.stringify({hours:out})+'\n');
}