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
// Keep the logo and settings button below the transparent Android status bar.
// Apply only to the bundled native snapshot; do not alter the public website.
const nativeInsetStyle=`<style id="sm-android-status-safe">html.sm-native-android body:has(.sm53-hero) .app > header.top.home-top{padding-top:calc(env(safe-area-inset-top, 24px) + 30px)!important;min-height:calc(97px + env(safe-area-inset-top, 24px))!important}html.sm-native-android body:not(:has(.sm53-hero)) .app > header.top.home-top{padding-top:calc(env(safe-area-inset-top, 24px) + 18px)!important}</style>`;
html=html.replace('</head>',nativeInsetStyle+'</head>');
// A native APK must not retain an old web service worker that could obscure new releases.
html=html.replace(/if\('serviceWorker' in navigator\)\{window\.addEventListener\('load',\(\)=>navigator\.serviceWorker\.register\('\.\/sw\.js'\)\.catch\(err=>console\.warn\('PWA cache unavailable',err\)\)\)\}/g,'');
// Android-only status-bar clearance for every route, including article lists and posts.
// Reserve the inset on the native document, independent of page-specific headers.
const allPagesSafeArea=`<style id="sm-native-all-pages-safe-area">html.sm-native-android{--sm-android-top-inset:env(safe-area-inset-top, 24px)}html.sm-native-android body{padding-top:var(--sm-android-top-inset)!important}html.sm-native-android .app{min-height:calc(100dvh - var(--sm-android-top-inset))}html.sm-native-android .top.home-top{top:var(--sm-android-top-inset)}html.sm-native-android body:has(.sm53-hero) .app > header.top.home-top,html.sm-native-android body:not(:has(.sm53-hero)) .app > header.top.home-top{padding-top:18px!important;min-height:80px!important}</style>`;
html=html.replace('</head>',allPagesSafeArea+'</head>');
// Android homepage only: reduce unused hero space without moving its header.
// Keep the logo/settings position and all inner-page layouts unchanged.
const nativeHomeCompact=`<style id="sm-native-home-compact">@media(max-width:767px){html.sm-native-android body:has(.sm53-hero) .app #main .sm53-hero{height:clamp(325px,47dvh,445px)!important}html.sm-native-android body:has(.sm53-hero) .app #main .sm53-hero-copy{transform:translateY(-18px)!important}html.sm-native-android body:has(.sm53-hero) .app #main .sm53-search{margin-top:-12px!important}}</style>`;
html=html.replace('</head>',nativeHomeCompact+'</head>');
// Bundle a local copy for loss of connectivity and use the online-first shell as entry point.
fs.writeFileSync(path.join(out,'offline.html'),html);
const shell=path.resolve(process.cwd(),'hybrid-shell.html');
if(!fs.existsSync(shell))throw Error('Missing hybrid-shell.html');
fs.writeFileSync(index,fs.readFileSync(shell,'utf8'));
console.log('Prepared online-first shell and bundled offline content in',out);
