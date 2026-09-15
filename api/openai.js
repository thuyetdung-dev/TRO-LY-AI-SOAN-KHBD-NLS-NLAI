import {read,verify} from './_auth.js';
/* Vercel Serverless Function — OpenAI key chỉ tồn tại ở máy chủ. */
const WINDOW_MS=60_000, MAX_REQUESTS=6, buckets=new Map();
function allow(ip){const now=Date.now(),b=buckets.get(ip)||{start:now,count:0};if(now-b.start>WINDOW_MS){b.start=now;b.count=0}b.count++;buckets.set(ip,b);return b.count<=MAX_REQUESTS}
function textFrom(data){if(typeof data.output_text==='string')return data.output_text;return (data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text||'').join('\n')}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Chỉ hỗ trợ POST'});\n if(!verify(read(req)))return res.status(401).json({error:'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.'});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'Máy chủ chưa cấu hình OPENAI_API_KEY'});
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
 if(!allow(ip))return res.status(429).json({error:'Bạn thao tác quá nhanh. Hãy chờ một phút rồi thử lại.'});
 try{
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  const prompt=String(body.prompt||'');
  if(!prompt||prompt.length>180000)return res.status(400).json({error:'Nội dung yêu cầu trống hoặc quá dài'});
  const files=Array.isArray(body.files)?body.files:[];
  const total=files.reduce((n,f)=>n+String(f.data||'').length,0);
  if(files.length>5||total>4_000_000)return res.status(413).json({error:'Tài liệu gửi qua OpenAI tối đa 5 tệp và khoảng 3 MB. Hãy giảm hoặc dán nội dung cần thiết vào ô Nội dung bổ sung.'});
  const content=[{type:'input_text',text:prompt}];
  for(const f of files){
   if(!/^(application\/pdf|text\/plain|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|image\/(png|jpeg|webp))$/.test(String(f.type||'')))continue;
   content.push({type:'input_file',filename:String(f.name||'tai-lieu').slice(0,120),file_data:'data:'+f.type+';base64,'+f.data});
  }
  const upstream=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5-mini',input:[{role:'user',content}],max_output_tokens:32000})});
  const data=await upstream.json().catch(()=>({}));
  if(!upstream.ok)return res.status(upstream.status===401?503:upstream.status).json({error:upstream.status===401?'Khóa OpenAI trên máy chủ không hợp lệ hoặc đã hết hiệu lực.':data?.error?.message||'OpenAI chưa phản hồi'});
  const text=textFrom(data);
  if(!text)return res.status(502).json({error:'OpenAI không trả về nội dung văn bản'});
  return res.status(200).json({text,model:data.model||process.env.OPENAI_MODEL||'gpt-5-mini'});
 }catch(e){return res.status(500).json({error:'Không xử lý được yêu cầu OpenAI'})}
}