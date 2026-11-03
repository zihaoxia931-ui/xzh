const encoder=new TextEncoder();
export const CONTEXT='xzh.workbench.v1';
export const normalize=code=>String(code||'').trim().toUpperCase().replace(/[\s-]/g,'');
export const fromBase64=text=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
export async function unlockKey(code,vault){
 const normalized=normalize(code);
 if(!/^(?:[A-HJ-NP-Z2-9]{12}|XZH[A-F0-9]{32})$/.test(normalized))throw Error('INVALID_CODE');
 if(vault.version!==1||vault.kdf!=='PBKDF2-SHA256'||vault.iterations!==300000||!Array.isArray(vault.slots)||vault.slots.length>12)throw Error('BAD_VAULT');
 const material=await crypto.subtle.importKey('raw',encoder.encode(normalized),'PBKDF2',false,['deriveKey']);
 for(const slot of vault.slots){
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:fromBase64(slot.salt),iterations:vault.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
  try{
   const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromBase64(slot.iv),additionalData:encoder.encode(CONTEXT+':keywrap:'+slot.id)},key,fromBase64(slot.wrappedKey));
   return await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['decrypt']);
  }catch{}
 }
 throw Error('INVALID_CODE');
}
export async function decryptArchive(key,vault,ciphertext){
 return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:fromBase64(vault.payload.iv),additionalData:encoder.encode(CONTEXT+':gzip')},key,ciphertext));
}
