/* image-editor.js — V27.5: sửa/thay hình hoàn toàn trong trình duyệt. */
(function(){
'use strict';
const $=id=>document.getElementById(id), state=new Map();
let targets=[], selected=-1, pending=null;
const okTypes=new Set(['image/png','image/jpeg','image/webp']);
const xml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function notify(m){if(typeof toast==='function')toast(m);else{const t=$('toast');if(t){t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}}}
function findTargets(){
  targets=[...document.querySelectorAll('#result .mathviz svg, #result img')].filter(el=>!el.closest('mjx-container')&&!el.closest('mjx-assistive-mml'));
  targets.forEach((el,i)=>{el.dataset.imageEditIndex=i;el.classList.add('editable-illustration')});
  return targets;
}
function titleOf(el,i){return el.closest('.mathviz')?.querySelector('.mathviz-title')?.textContent?.trim()||el.getAttribute('alt')||('Hình minh họa '+(i+1))}
function list(){
  findTargets();const sel=$('imageTargetSelect');sel.innerHTML=targets.map((el,i)=>'<option value="'+i+'">'+(i+1)+'. '+titleOf(el,i).replace(/[<>&]/g,'')+'</option>').join('');
  if(!targets.length){sel.innerHTML='<option>Chưa có hình trong bản kế hoạch</option>';$('imageApplyBtn').disabled=true;return}
  $('imageApplyBtn').disabled=false;select(Math.min(Math.max(selected,0),targets.length-1));
}
function select(i){selected=+i;const el=targets[selected];if(!el)return;[...targets].forEach(x=>x.classList.remove('selected-illustration'));el.classList.add('selected-illustration');el.scrollIntoView({behavior:'smooth',block:'center'});
 const saved=state.get(selected);$('imageDescription').value=saved?.description||el.getAttribute('aria-label')||titleOf(el,selected);$('imageCaption').value=saved?.caption||'';$('imageWidth').value=saved?.width||80;$('imageWidthValue').textContent=$('imageWidth').value+'%';pending=saved?.dataUrl||null;preview(pending||snapshot(el));}
function snapshot(el){if(el?.tagName==='IMG')return el.src;if(el?.tagName==='svg'||el?.tagName==='SVG')return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(el));return ''}
function preview(src){const img=$('imagePreview');img.src=src||'';img.hidden=!src;$('imageDropHint').hidden=!!src}
function fileToPng(file){
 return new Promise((resolve,reject)=>{if(!okTypes.has(file.type))return reject(new Error('Chỉ chấp nhận PNG, JPG hoặc WebP.'));if(file.size>20*1024*1024)return reject(new Error('Ảnh không được vượt quá 20 MB.'));
 const reader=new FileReader();reader.onerror=()=>reject(new Error('Không đọc được tệp ảnh.'));reader.onload=()=>{const im=new Image();im.onerror=()=>reject(new Error('Tệp ảnh không hợp lệ.'));im.onload=()=>{const max=2400,scale=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(im.naturalWidth*scale));cv.height=Math.max(1,Math.round(im.naturalHeight*scale));cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);resolve({dataUrl:cv.toDataURL('image/png'),width:cv.width,height:cv.height})};im.src=reader.result};reader.readAsDataURL(file)});
}
async function useFile(file){try{const p=await fileToPng(file);pending=p.dataUrl;preview(pending);$('imagePreview').dataset.w=p.width;$('imagePreview').dataset.h=p.height;notify('Đã nạp ảnh — hãy kiểm tra bản xem trước')}catch(e){notify(e.message)}}
function apply(){
 const el=targets[selected];if(!el||!pending)return notify('Hãy chọn hoặc dán một ảnh trước.');
 const img=new Image();img.onload=()=>{const previous=state.get(selected);const rec={original:previous?.original||el.outerHTML,dataUrl:pending,description:$('imageDescription').value.trim(),caption:$('imageCaption').value.trim(),width:Math.min(100,Math.max(30,+$('imageWidth').value||80)),pixelWidth:img.naturalWidth,pixelHeight:img.naturalHeight};
 state.set(selected,rec);let box=el.closest('.image-replacement');if(!box){box=document.createElement('figure');box.className='image-replacement';el.replaceWith(box)}
 box.innerHTML='<img src="'+rec.dataUrl+'" alt="'+rec.description.replace(/"/g,'&quot;')+'" style="width:'+rec.width+'%"><figcaption '+(rec.caption?'':'hidden')+'>'+rec.caption.replace(/[<>&]/g,s=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[s]))+'</figcaption>';
 targets[selected]=box.querySelector('img');targets[selected].dataset.imageEditIndex=selected;targets[selected].classList.add('editable-illustration','selected-illustration');notify('Đã thay hình trên bản kế hoạch');};img.src=pending;
}
function restore(){const rec=state.get(selected);if(!rec)return notify('Hình này đang là hình tự động ban đầu.');const el=targets[selected],box=el?.closest('.image-replacement');if(box)box.outerHTML=rec.original;else if(el)el.outerHTML=rec.original;state.delete(selected);notify('Đã khôi phục hình tự động ban đầu');setTimeout(list,20)}
$('imageEditBtn')?.addEventListener('click',()=>{list();$('imageEditorDialog').showModal()});
$('imageTargetSelect')?.addEventListener('change',e=>select(e.target.value));
$('imageFile')?.addEventListener('change',e=>e.target.files[0]&&useFile(e.target.files[0]));
$('imageChooseBtn')?.addEventListener('click',()=>$('imageFile').click());
$('imageWidth')?.addEventListener('input',e=>$('imageWidthValue').textContent=e.target.value+'%');
$('imageApplyBtn')?.addEventListener('click',apply);$('imageRestoreBtn')?.addEventListener('click',restore);$('cancelImageEdit')?.addEventListener('click',()=>$('imageEditorDialog').close());
const dz=$('imageDropZone');['dragenter','dragover'].forEach(n=>dz?.addEventListener(n,e=>{e.preventDefault();dz.classList.add('over')}));['dragleave','drop'].forEach(n=>dz?.addEventListener(n,e=>{e.preventDefault();dz.classList.remove('over')}));dz?.addEventListener('drop',e=>e.dataTransfer.files[0]&&useFile(e.dataTransfer.files[0]));dz?.addEventListener('click',e=>{if(e.target.id!=='imageChooseBtn')$('imageFile').click()});
$('imageEditorDialog')?.addEventListener('paste',e=>{const f=[...e.clipboardData.items].find(x=>x.kind==='file'&&okTypes.has(x.type))?.getAsFile();if(f){e.preventDefault();useFile(f)}});
['generateBtn','applySourceEdit','applyMathEdit'].forEach(id=>$(id)?.addEventListener('click',()=>state.clear(),true));
function bytes(data){const b=atob(data.split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function patchDrawing(doc,idx,r){
 const rid='rIdImg'+idx,cx=Math.round(9354*635*r.width/100),cy=Math.round(cx*(r.pixelHeight/r.pixelWidth));
 const blockRe=new RegExp('<w:p(?=[\\s>])[\\s\\S]*?r:embed="'+rid+'"[\\s\\S]*?<\\/w:p>');
 return doc.replace(blockRe,p=>{let q=p.replace(/<wp:extent cx="\d+" cy="\d+"\/>/, '<wp:extent cx="'+cx+'" cy="'+cy+'"/>').replace(/<a:ext cx="\d+" cy="\d+"\/>/, '<a:ext cx="'+cx+'" cy="'+cy+'"/>');q=q.replace(/<wp:docPr([^>]*)\/>/, '<wp:docPr$1 descr="'+xml(r.description)+'"/>');return q+(r.caption?'<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:i/></w:rPr><w:t>'+xml(r.caption)+'</w:t></w:r></w:p>':'')});
}
const original=window.buildDocxParts;
if(typeof original==='function')window.buildDocxParts=async function(md,title){const parts=await original(md,title);for(const [zero,r] of state){const idx=zero+1,key='word/media/image'+idx+'.png';if(parts[key]){parts[key]=bytes(r.dataUrl);parts['word/document.xml']=patchDrawing(parts['word/document.xml'],idx,r)}}return parts};
window.khbdImageReplacements=state;
})();