import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const source=path.resolve(here,'../..');
const destination=path.resolve(here,'../public');
fs.mkdirSync(destination,{recursive:true});
const extensions=new Set(['.png','.jpg','.jpeg','.webp','.svg','.gif','.ico','.avif','.woff','.woff2','.ttf','.mp3','.ogg','.wav','.mp4']);
let copied=0;
for(const entry of fs.readdirSync(source,{withFileTypes:true})){
  if(!entry.isFile() || !extensions.has(path.extname(entry.name).toLowerCase())) continue;
  fs.copyFileSync(path.join(source,entry.name),path.join(destination,entry.name));
  copied++;
}
console.log('SafaMarwah React V2: copied '+copied+' original root media assets');
