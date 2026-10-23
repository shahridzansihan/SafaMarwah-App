import React from "react";
import {Link} from "react-router-dom";
import {BookOpen,BookOpenText,ClipboardCheck,Search,HelpCircle,Map,Globe,ArrowRight,Settings,Sun,Clock3,RefreshCw} from "lucide-react";
import {Layout} from "../components/SiteLayout";
import {FeedGrid} from "../components/BlogFeed";

const shortcuts=[
  {title:"Panduan Umrah",to:"/panduan",Icon:BookOpen},
  {title:"Doa & Zikir",to:"/doa",Icon:Sun},
  {title:"Checklist Perjalanan",to:"/panduan/persediaan",Icon:ClipboardCheck},
  {title:"Carian",to:"/blog",Icon:Search}
];
const tools=[
  {title:"Panduan",to:"/panduan",Icon:BookOpen},
  {title:"Doa & Zikir",to:"/doa",Icon:BookOpenText},
  {title:"Checklist",to:"/panduan/persediaan",Icon:ClipboardCheck},
  {title:"FAQ Umrah",to:"/panduan",Icon:HelpCircle},
  {title:"Miqat & Peta",to:"/panduan/ibadah",Icon:Map},
  {title:"Bahasa",to:"/panduan",Icon:Globe}
];
function SaudiClock(){
  const [now,setNow]=React.useState(()=>new Date());
  const [city,setCity]=React.useState<"Makkah"|"Madinah">("Makkah");
  const [timings,setTimings]=React.useState<Record<string,string>|null>(null);
  const [loading,setLoading]=React.useState(true);
  const [error,setError]=React.useState(false);
  const [refreshKey,setRefreshKey]=React.useState(0);
  const dateKey=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Riyadh",day:"2-digit",month:"2-digit",year:"numeric"}).format(now).replace(/\//g,"-");
  React.useEffect(()=>{
    const controller=new AbortController();
    setLoading(true);setError(false);setTimings(null);
    const cacheKey="safamarwah-prayer-v2:"+city+":"+dateKey;
    try{
      const saved=localStorage.getItem(cacheKey);
      if(saved){
        const parsed=JSON.parse(saved) as Record<string,string>;
        if(["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(key=>typeof parsed[key]==="string"&&/^\\d{2}:\\d{2}$/.test(parsed[key]))){
          setTimings(parsed);setLoading(false);
        }
      }
    }catch{ /* Browser storage may be unavailable. */ }
    const cityName=city==="Makkah"?"Mecca":"Medina";
    const url=`https://api.aladhan.com/v1/timingsByCity/${dateKey}?city=${cityName}&country=SA&method=4&school=0`;
    fetch(url,{signal:controller.signal}).then(async response=>{
      if(!response.ok)throw new Error("Prayer times unavailable");
      const json=await response.json() as {code?:number;data?:{timings?:Record<string,string>;meta?:{timezone?:string}}};
      if(json.code!==200||json.data?.meta?.timezone!=="Asia/Riyadh"||!json.data.timings)throw new Error("Unexpected prayer data");
      const result:Record<string,string>={};
      for(const key of ["Fajr","Dhuhr","Asr","Maghrib","Isha"]){
        const value=json.data.timings[key];
        if(typeof value!=="string"||!/^\d{2}:\d{2}/.test(value))throw new Error("Invalid prayer time");
        result[key]=value.slice(0,5);
      }
      if(!controller.signal.aborted){setTimings(result);try{localStorage.setItem(cacheKey,JSON.stringify(result));}catch{ /* Private browsing or storage quota. */ }}
    }).catch(()=>{if(!controller.signal.aborted)setError(true)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
    return()=>controller.abort();
  },[city,dateKey,refreshKey]);
  React.useEffect(()=>{const id=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(id)},[]);
  const time=new Intl.DateTimeFormat("ms-MY",{timeZone:"Asia/Riyadh",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now);
  const date=new Intl.DateTimeFormat("ms-MY",{timeZone:"Asia/Riyadh",day:"numeric",month:"long",year:"numeric"}).format(now);
  return <section className="home-prayer" aria-labelledby="prayer-heading"><div className="home-prayer__head"><div><p className="section-eyebrow">WAKTU ARAB SAUDI (UTC+3)</p><h2 id="prayer-heading">Waktu Solat</h2></div><button type="button" className="home-prayer__refresh" onClick={()=>{setNow(new Date());setRefreshKey(value=>value+1)}} aria-label="Segar semula jam Arab Saudi"><RefreshCw size={22} aria-hidden="true"/></button></div><div className="home-prayer__clock"><span>WAKTU SEMASA · ARAB SAUDI</span><strong aria-label={`Waktu semasa Arab Saudi ${time}`}>{time}</strong><small>{date}</small></div><div className="home-prayer__cities" role="group" aria-label="Pilih bandar waktu solat"><button type="button" className={city==="Makkah"?"is-active":""} aria-pressed={city==="Makkah"} onClick={()=>setCity("Makkah")}>Makkah</button><button type="button" className={city==="Madinah"?"is-active":""} aria-pressed={city==="Madinah"} onClick={()=>setCity("Madinah")}>Madinah</button></div>{timings&&<div className="home-prayer__times" aria-label={`Jadual solat ${city}`}>{[["Subuh","Fajr"],["Zohor","Dhuhr"],["Asar","Asr"],["Maghrib","Maghrib"],["Isyak","Isha"]].map(([label,key])=><div key={key}><span>{label}</span><strong>{timings[key]}</strong></div>)}</div>}<div className="home-prayer__note" role="status"><Sun size={19} aria-hidden="true"/><p><strong>{city}</strong> · {loading?"Sedang mendapatkan jadual waktu solat…":error?timings?"Menggunakan jadual tersimpan untuk hari ini kerana sambungan tidak tersedia. Sila sahkan dengan masjid setempat.":"Jadual waktu solat tidak dapat dimuatkan. Cuba segar semula apabila ada sambungan internet.":"Waktu solat hari ini daripada AlAdhan API (kaedah Umm Al-Qura, waktu Arab Saudi). Sila semak dengan jadual masjid setempat kerana waktu pengiraan boleh berbeza."} Jam di atas menunjukkan waktu semasa Arab Saudi.</p></div></section>
}
export function Home(){return <Layout>
  <div className="home-app">
    <section className="home-app__hero" aria-labelledby="home-title">
      <div className="home-app__top"><Link to="/" className="home-app__brand" aria-label="SafaMarwah — Utama"><img src="https://raw.githubusercontent.com/shahridzansihan/SafaMarwah-App/safamarwah-v2-foundation/header-logo.png" alt="SafaMarwah" loading="eager" decoding="async"/></Link><Link to="/panduan" className="home-app__settings" aria-label="Buka panduan"><Settings size={23} aria-hidden="true"/></Link></div>
      <div className="home-app__headline"><p>PERJALANAN UMRAH ANDA</p><h1 id="home-title">Perjalanan Umrah Anda <em>Bermula di Sini</em></h1><p className="home-app__description">Panduan lengkap, sahih dan mudah difahami untuk setiap langkah ibadah anda.</p></div>
      <nav className="home-app__shortcuts" aria-label="Akses pantas">{shortcuts.map(({title,to,Icon})=><Link key={title} to={to}><span className="home-app__shortcut-icon"><Icon size={27} strokeWidth={1.8}/></span><span>{title}</span></Link>)}</nav>
      <SaudiClock/>
    </section>
    <section className="home-app__tools" aria-labelledby="tools-heading"><div className="home-app__section-title"><h2 id="tools-heading">Panduan &amp; Alat Jemaah</h2><Link to="/panduan">Lihat semua <ArrowRight size={15}/></Link></div><div className="home-app__tool-grid">{tools.map(({title,to,Icon})=><Link to={to} key={title}><span className="home-app__tool-icon"><Icon size={25} strokeWidth={1.8}/></span><span>{title}</span></Link>)}</div></section>
    <section className="home-app__articles" aria-labelledby="articles-heading"><div className="home-app__section-title"><h2 id="articles-heading">Artikel Terkini</h2><Link to="/blog">Lihat semua <ArrowRight size={16}/></Link></div><FeedGrid limit={3}/></section>
  </div>
</Layout>}
