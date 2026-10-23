import {useMemo,useState} from 'react';
const phrases=[
{category:'Salam',ms:'Assalamualaikum',ar:'السَّلَامُ عَلَيْكُمْ',latin:'As-salamu alaikum'},
{category:'Salam',ms:'Terima kasih',ar:'شُكْرًا',latin:'Syukran'},
{category:'Salam',ms:'Sama-sama',ar:'عَفْوًا',latin:'Afwan'},
{category:'Perjalanan',ms:'Di mana hotel?',ar:'أَيْنَ الْفُنْدُقُ؟',latin:'Aina al-funduq?'},
{category:'Perjalanan',ms:'Di mana tandas?',ar:'أَيْنَ دَوْرَةُ الْمِيَاهِ؟',latin:'Aina dauratul miyah?'},
{category:'Perjalanan',ms:'Saya mahu ke Masjidil Haram',ar:'أُرِيدُ الذَّهَابَ إِلَى الْمَسْجِدِ الْحَرَامِ',latin:'Uridu az-zahaba ila al-masjid al-haram'},
{category:'Bantuan',ms:'Saya perlukan bantuan',ar:'أَحْتَاجُ إِلَى الْمُسَاعَدَةِ',latin:'Ahtaju ila al-musaadah'},
{category:'Bantuan',ms:'Saya tidak faham',ar:'لَا أَفْهَمُ',latin:'La afham'},
{category:'Bantuan',ms:'Tolong hubungi doktor',ar:'مِنْ فَضْلِكَ اتَّصِلْ بِالطَّبِيبِ',latin:'Min fadlika ittasil bit-tabib'},
{category:'Membeli-belah',ms:'Berapakah harganya?',ar:'بِكَمْ هَذَا؟',latin:'Bikam hadha?'},
{category:'Membeli-belah',ms:'Saya mahu air',ar:'أُرِيدُ مَاءً',latin:'Uridu maan'}
] as const;
export default function ArabicPhrases(){
const [query,setQuery]=useState('');const [category,setCategory]=useState('Semua');
const categories=['Semua',...new Set(phrases.map(p=>p.category))];
const filtered=useMemo(()=>phrases.filter(p=>(category==='Semua'||p.category===category)&&[p.ms,p.ar,p.latin].some(t=>t.toLowerCase().includes(query.toLowerCase()))),[category,query]);
return <><section className="inner-hero"><div className="shell"><span className="eyebrow">SAFAMARWAH · PANDUAN JEMAAH</span><h1>Frasa Bahasa Arab</h1><p>Ungkapan praktikal untuk perjalanan Umrah dan urusan harian.</p></div></section><main className="shell inner-main"><div className="phrase-controls"><label>Cari frasa<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari bahasa Melayu, Arab atau sebutan"/></label><label>Kategori<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label></div><div className="grid">{filtered.map(p=><article className="feature-card phrase-card" key={p.ms}><span className="eyebrow dark">{p.category}</span><h3>{p.ms}</h3><p className="phrase-arabic" lang="ar" dir="rtl">{p.ar}</p><p>{p.latin}</p><button type="button" className="phrase-copy" onClick={()=>{if(navigator.clipboard?.writeText)void navigator.clipboard.writeText(p.ar).catch(()=>{})}}>Salin tulisan Arab</button></article>)}</div>{filtered.length===0&&<p>Tiada frasa ditemui.</p>}<p className="faq-note">Sebutan rumi ialah panduan anggaran. Dialek dan cara pertuturan mungkin berbeza.</p></main></>}
