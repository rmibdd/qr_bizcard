'use strict';
const columns=['First Name','Last Name','Middle Name','Suffix','Display Name','Job Title','Company','Email','Mobile','Street','City','Region','Postal Code','Country','Website'];
const columnIds=['first','last','middle','suffix','display','title','org','email','mobile','street','city','region','postal','country','website'];
const aliases={firstname:'first',givenname:'first',lastname:'last',familyname:'last',middlename:'middle',middleinitial:'middle',suffix:'suffix',displayname:'display',fullname:'display',name:'display',jobtitle:'title',title:'title',company:'org',organization:'org',email:'email',workemail:'email',emailaddress:'email',mobile:'mobile',mobilenumber:'mobile',phone:'mobile',phonenumber:'mobile',street:'street',address:'street',workaddress:'street',city:'city',region:'region',province:'region',postalcode:'postal',zipcode:'postal',country:'country',website:'website',url:'website'};
let batchContacts=[];
function downloadBytes(bytes,filename,type){const url=URL.createObjectURL(new Blob([bytes],{type}));const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function parseTable(text){
 text=text.replace(/^\uFEFF/,'');if(!text.trim())throw new Error('Paste a table or upload a CSV first.');
 // Detect tabs outside quoted cells in the header, so commas in names do not affect TSV parsing.
 let quoted=false,delimiter=',';for(let i=0;i<text.length;i++){if(text[i]==='"'){if(quoted&&text[i+1]==='"')i++;else quoted=!quoted;}if(!quoted&&text[i]==='\t'){delimiter='\t';break;}if(!quoted&&/[\r\n]/.test(text[i]))break;}
 const rows=[];let row=[],cell='',inQuotes=false,closed=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(inQuotes){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{inQuotes=false;closed=true;}}else cell+=c;continue;}
 if(c==='"'){if(cell.length||closed)throw new Error('Unexpected quote in table. Use a CSV export or paste directly from Excel.');inQuotes=true;}
 else if(c===delimiter){row.push(cell);cell='';closed=false;}
 else if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';closed=false;}
 else{if(closed&&!/\s/.test(c))throw new Error('Unexpected text after a quoted cell.');if(!closed)cell+=c;}
 }
 if(inQuotes)throw new Error('An opening quote has no closing quote.');if(cell.length||row.length||closed){row.push(cell);rows.push(row);}
 return rows.filter(r=>r.some(c=>c.trim()));
}
function prepareContacts(text,defaults){
 const rows=parseTable(text);if(rows.length<2)throw new Error('Include a header row and at least one contact.');
 const headers=rows[0].map(h=>aliases[h.toLowerCase().replace(/[^a-z0-9]/g,'')]);
 const known=headers.filter(Boolean);if(!known.includes('first')&&!known.includes('display'))throw new Error('Use a First Name or Display Name column in the header.');
 if(new Set(known).size!==known.length)throw new Error('Two columns map to the same field. Remove the duplicate column.');
 const unknown=rows[0].filter((h,i)=>!headers[i]);if(unknown.length)throw new Error('Unrecognized column(s): '+unknown.join(', ')+'. Use the template headers.');
 return rows.slice(1).map((row,index)=>{
 const v=Object.fromEntries(columnIds.map(id=>[id,'']));for(const id of ['org','street','city','region','postal','country','website'])v[id]=defaults[id]||'';
 row.forEach((cell,i)=>{if(headers[i]&&cell.trim())v[headers[i]]=cell.trim();});
 const errors=[];if(row.length!==headers.length)errors.push('Column count differs from header');if(!fullName(v))errors.push('Missing name');
 if(v.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))errors.push('Invalid email');
 if(v.mobile&&(/[\r\n]/.test(v.mobile)||!/^\+?[0-9\s().-]+$/.test(v.mobile)||v.mobile.replace(/\D/g,'').length<7))errors.push('Check mobile number');
 if(v.website){try{const u=new URL(websiteURL(v.website));if(!['http:','https:'].includes(u.protocol)||!u.hostname||/\s/.test(v.website))throw Error();}catch{errors.push('Invalid website');}}
 return {row:index+2,v,errors};
 });
}
function safeFilename(name){return name.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'').replace(/[. ]+$/g,'').slice(0,100)||'Contact';}
function contactFiles(contacts){const used=new Set();return contacts.map(({v})=>{const base=safeFilename(fullName(v));let name=base+'.vcf',n=2;while(used.has(name.toLowerCase()))name=base+' ('+(n++)+').vcf';used.add(name.toLowerCase());return {name,bytes:new TextEncoder().encode(buildVCF(v))};});}
function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function createZip(files){
 const chunks=[],central=[];let offset=0;const enc=new TextEncoder();const now=new Date();const time=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1);const date=((Math.max(1980,now.getFullYear())-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
 for(const f of files){const name=enc.encode(f.name),crc=crc32(f.bytes);const h=new Uint8Array(30+name.length);const d=new DataView(h.buffer);d.setUint32(0,0x04034b50,true);d.setUint16(4,20,true);d.setUint16(6,0x800,true);d.setUint16(10,time,true);d.setUint16(12,date,true);d.setUint32(14,crc,true);d.setUint32(18,f.bytes.length,true);d.setUint32(22,f.bytes.length,true);d.setUint16(26,name.length,true);h.set(name,30);chunks.push(h,f.bytes);
 const c=new Uint8Array(46+name.length),v=new DataView(c.buffer);v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint16(8,0x800,true);v.setUint16(12,time,true);v.setUint16(14,date,true);v.setUint32(16,crc,true);v.setUint32(20,f.bytes.length,true);v.setUint32(24,f.bytes.length,true);v.setUint16(28,name.length,true);v.setUint32(42,offset,true);c.set(name,46);central.push(c);offset+=h.length+f.bytes.length;}
 const centralSize=central.reduce((n,c)=>n+c.length,0);const end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,centralSize,true);e.setUint32(16,offset,true);const output=new Uint8Array(offset+centralSize+22);let pos=0;for(const chunk of [...chunks,...central,end]){output.set(chunk,pos);pos+=chunk.length;}return output;
}
function invalidateBatch(){batchContacts=[];el('batchDownload').disabled=true;el('batchPreview').replaceChildren();el('batchStatus').textContent='';}
el('batchOpen').addEventListener('click',()=>{el('singleView').hidden=true;el('batchView').hidden=false;el('batchOpen').setAttribute('aria-pressed','true');el('singleOpen').setAttribute('aria-pressed','false');});
el('singleOpen').addEventListener('click',()=>{el('singleView').hidden=false;el('batchView').hidden=true;el('batchOpen').setAttribute('aria-pressed','false');el('singleOpen').setAttribute('aria-pressed','true');});
el('batchText').addEventListener('input',invalidateBatch);
form.addEventListener('input',invalidateBatch);el('reset').addEventListener('click',invalidateBatch);el('sample').addEventListener('click',invalidateBatch);
el('csvFile').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;invalidateBatch();try{if(file.size>5*1024*1024)throw Error('Please use a CSV smaller than 5 MB.');el('batchText').value=await file.text();el('batchStatus').textContent='CSV loaded. Click Review contacts.';}catch(error){el('batchStatus').textContent=error.message;}event.target.value='';});
el('templateDownload').addEventListener('click',()=>downloadBytes('\uFEFF'+columns.join(',')+'\r\nJuan,Dela Cruz,,,Juan Dela Cruz,Example Job Title,,juan@example.com,,,,,,,\r\n','Contacts-Template.csv','text/csv;charset=utf-8'));
el('batchReview').addEventListener('click',()=>{invalidateBatch();try{batchContacts=prepareContacts(el('batchText').value,values());if(batchContacts.length>5000)throw Error('Please split this into batches of 5,000 contacts or fewer.');const table=document.createElement('table');const header=document.createElement('tr');for(const title of ['Row','Name','Company','Email','Mobile','Status']){const cell=document.createElement('th');cell.textContent=title;header.appendChild(cell);}table.appendChild(header);for(const item of batchContacts){const row=document.createElement('tr');for(const text of [item.row,fullName(item.v),item.v.org,item.v.email,item.v.mobile,item.errors.join('; ')||'Ready']){const cell=document.createElement('td');cell.textContent=text;row.appendChild(cell);}if(item.errors.length)row.className='invalid';table.appendChild(row);}el('batchPreview').appendChild(table);const bad=batchContacts.filter(c=>c.errors.length).length;el('batchStatus').textContent=batchContacts.length+' contacts reviewed. '+(bad?bad+' row(s) need correction. Edit the table and review again.':'All ready. Download your ZIP.');el('batchDownload').disabled=bad>0;}catch(error){batchContacts=[];el('batchStatus').textContent=error.message;}});
el('batchDownload').addEventListener('click',()=>{if(!batchContacts.length||batchContacts.some(c=>c.errors.length))return;try{downloadBytes(createZip(contactFiles(batchContacts)),'Contact-VCFs.zip','application/zip');el('batchStatus').textContent='Downloaded '+batchContacts.length+' individual VCF files in Contact-VCFs.zip.';}catch(error){el('batchStatus').textContent='Could not create ZIP: '+error.message;}});
