import React from "react";
import {Link} from "react-router-dom";
import {BookOpen,BookOpenText,ClipboardCheck,Search,HelpCircle,Map,Globe,ArrowRight,Settings,Sun,Clock3} from "lucide-react";
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
  React.useEffect(()=>{const id=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(id)},[]);
  const time=new Intl.DateTimeFormat("ms-MY",{timeZone:"Asia/Riyadh",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now);
  const date=new Intl.DateTimeFormat("ms-MY",{timeZone:"Asia/Riyadh",day:"numeric",month:"long",year:"numeric"}).format(now);
  return <section className="home-prayer" aria-labelledby="prayer-heading"><div className="home-prayer__head"><div><p className="section-eyebrow">WAKTU ARAB SAUDI (UTC+3)</p><h2 id="prayer-heading">Waktu Solat</h2></div><Clock3 aria-hidden="true" size={27}/></div><div className="home-prayer__clock"><span>WAKTU SEMASA · ARAB SAUDI</span><strong aria-label={`Waktu semasa Arab Saudi ${time}`}>{time}</strong><small>{date}</small></div><div className="home-prayer__note"><Sun size={19} aria-hidden="true"/><p>Jadual waktu solat Makkah dan Madinah akan dipaparkan selepas integrasi sumber waktu solat disahkan. Jam di atas menunjukkan waktu semasa Arab Saudi.</p></div></section>
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
