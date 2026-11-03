import {unlockKey,decryptArchive} from './vault-crypto.mjs';
const form=document.querySelector('#inviteForm'),input=document.querySelector('#code'),button=document.querySelector('#enter'),message=document.querySelector('#message'),reveal=document.querySelector('#reveal');
let busy=false;
reveal.addEventListener('click',()=>{const show=input.type==='password';input.type=show?'text':'password';reveal.setAttribute('aria-label',show?'隐藏邀请码':'显示邀请码');reveal.setAttribute('aria-pressed',String(show));});
function status(text,error=false){message.textContent=text;message.classList.toggle('error',error);}
async function fetchFile(path){
 const response=await fetch(new URL(path,location.href),{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('FETCH_FAILED');return response;
}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;
 if(!isSecureContext||!crypto.subtle||typeof DecompressionStream==='undefined'){status('请使用新版 Chrome、Edge 或 Safari 打开 HTTPS 网址。',true);return;}
 busy=true;button.disabled=true;button.textContent='正在打开…';form.setAttribute('aria-busy','true');
 try{
  status('正在验证邀请码…');
  const vault=await (await fetchFile('./vault.json')).json();
  if(Date.parse(vault.expiresAt)<=Date.now())throw Error('EXPIRED');
  const key=await unlockKey(input.value,vault);
  input.value='';status('验证通过，正在载入工作档案…');
  const ciphertext=await (await fetchFile('./payload.bin')).arrayBuffer();
  const packed=await decryptArchive(key,vault,ciphertext);
  const stream=new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'));
  const html=await new Response(stream).text();
  if(!html.startsWith('<!DOCTYPE html>')&&!html.startsWith('<!doctype html>'))throw Error('BAD_DOCUMENT');
  const exit='<a href="./" style="position:fixed;left:16px;bottom:12px;z-index:10000;padding:8px 12px;border:1px solid #a58a6b66;border-radius:4px;background:#211d18;color:#e1c2a1;font:12px sans-serif;text-decoration:none" aria-label="退出并锁定工作台">退出并锁定 ↗</a>';
  document.open();document.write(html.replace('</body>',exit+'</body>'));document.close();
 }catch(error){
  const text=error.message==='INVALID_CODE'?'邀请码不正确，请检查后重试。':error.message==='EXPIRED'?'当前分享已到期，请联系分享者。':error.message==='FETCH_FAILED'||error.name==='TimeoutError'||error instanceof TypeError?'网络未能完整加载文件，请稍后重试。':'文件无法解密，请联系分享者检查发布版本。';
  status(text,true);busy=false;button.disabled=false;button.textContent='进入工作台 ↗';form.removeAttribute('aria-busy');
 }
});
