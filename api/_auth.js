import crypto from 'node:crypto';
export const COOKIE='khbd_session';
const secret=()=>process.env.AUTH_SESSION_SECRET||'',safe=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)},sign=v=>crypto.createHmac('sha256',secret()).update(v).digest('base64url');
export const configured=()=>secret().length>=32&&process.env.ADMIN_USERNAME&&process.env.ADMIN_PASSWORD&&process.env.TEACHER_USERNAME&&process.env.TEACHER_PASSWORD;
export const credentials=r=>r==='admin'?{user:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD}:{user:process.env.TEACHER_USERNAME,password:process.env.TEACHER_PASSWORD};
export const match=(i,s)=>safe(i.user,s.user)&&safe(i.password,s.password);
export function token(role,user){const body=Buffer.from(JSON.stringify({role,user,exp:Date.now()+28800000})).toString('base64url');return body+'.'+sign(body)}
export function verify(v){if(!v||!secret())return null;const [b,s]=String(v).split('.');if(!b||!s||!safe(s,sign(b)))return null;try{const d=JSON.parse(Buffer.from(b,'base64url').toString());return d.exp>Date.now()?d:null}catch(_){return null}}
export function read(req){const x=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='));return x?decodeURIComponent(x.slice(COOKIE.length+1)):''}
export const cookie=(v,age=28800)=>COOKIE+'='+encodeURIComponent(v)+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+age+(process.env.NODE_ENV==='production'?'; Secure':'');