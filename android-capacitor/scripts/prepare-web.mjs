import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.cwd(),'..');
const out=path.resolve(process.cwd(),'www');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const skip=new Set(['.git','.github','android-capacitor','node_modules','.DS_Store']);
for(const entry of fs.readdirSync(root,{withFileTypes:true})){
 if(skip.has(entry.name))continue;
 if(entry.isFile() && /\.(html?|css|js|mjs|json|webmanifest|png|jpe?g|webp|svg|gif|ico|woff2?|ttf|mp3|mp4|pdf)$/i.test(entry.name))fs.copyFileSync(path.join(root,entry.name),path.join(out,entry.name));
 if(entry.isDirectory() && ['assets','images','fonts','audio','media','icons','data'].includes(entry.name))fs.cpSync(path.join(root,entry.name),path.join(out,entry.name),{recursive:true});
}
const index=path.join(out,'index.html');if(!fs.existsSync(index))throw Error('Missing repository index.html');
let html=fs.readFileSync(index,'utf8');
const addon=`<script src="capacitor.js"></script><script>document.documentElement.classList.add('sm-native-android');document.addEventListener('DOMContentLoaded',function(){if(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()){document.documentElement.classList.add('sm-native-android');}});</script><style>html.sm-native-android{background:#002b23}html.sm-native-android body:has(.sm53-hero) .app::before{top:calc(-1 * env(safe-area-inset-top,0px))!important;height:calc(max(100dvh,850px) + env(safe-area-inset-top,0px))!important}html.sm-native-android body:has(.sm53-hero) .top.home-top{padding-top:max(18px,env(safe-area-inset-top,24px))!important}</style>`;
html=html.replace('</head>',addon+'</head>');
// A native APK must not retain an old web service worker that could obscure new releases.
html=html.replace(/if\('serviceWorker' in navigator\)\{window\.addEventListener\('load',\(\)=>navigator\.serviceWorker\.register\('\.\/sw\.js'\)\.catch\(err=>console\.warn\('PWA cache unavailable',err\)\)\)\}/g,'');
fs.writeFileSync(index,html);
console.log('Prepared offline-capable local web assets in',out);
