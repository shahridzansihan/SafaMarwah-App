import {Link} from "react-router-dom";
import {Layout,pages} from "../components/SiteLayout";
import {FeedGrid} from "../components/BlogFeed";

const highlights=[
  {number:"01",title:"Persediaan Umrah",description:"Dokumen, perjalanan dan persediaan sebelum berangkat.",to:"/panduan/persediaan"},
  {number:"02",title:"Panduan Ibadah",description:"Kenali susunan ibadah dan rujukan untuk jemaah.",to:"/panduan/ibadah"},
  {number:"03",title:"Doa Perjalanan",description:"Ruang rujukan doa sebelum dan semasa perjalanan.",to:"/doa/doa-perjalanan"}
];

export function Home(){return <Layout>
  <section className="hero-home hero-home--hybrid" aria-labelledby="home-title">
    <div className="hero-home__content">
      <p className="hero-home__eyebrow">SAFAMARWAH · UMRAH COMPANION</p>
      <h1 id="home-title">Teman perjalanan ibadah Umrah &amp; Haji</h1>
      <p className="hero-home__lead">Panduan, doa dan perkongsian ilmu dalam satu ruang yang mudah diterokai, dari persediaan hingga perjalanan ibadah.</p>
      <div className="hero-home__actions"><Link className="hero-home__primary" to="/panduan">Teroka Panduan <span aria-hidden="true">↗</span></Link><Link className="hero-home__secondary" to="/doa">Doa &amp; Zikir <span aria-hidden="true">→</span></Link></div>
    </div>
    <div className="hero-home__signature" aria-hidden="true">Safa<span>Marwah</span></div>
  </section>
  <nav className="home-quick-nav" aria-label="Akses pantas SafaMarwah"><span className="home-quick-nav__label">AKSES PANTAS</span><div className="home-quick-nav__links"><Link to="/panduan">Panduan Umrah <span aria-hidden="true">↗</span></Link><Link to="/doa">Doa &amp; Zikir <span aria-hidden="true">↗</span></Link><Link to="/blog">Artikel &amp; Ilmu <span aria-hidden="true">↗</span></Link></div></nav>
  <section className="section-gap" aria-labelledby="home-explore"><div className="section-head"><div><p className="section-eyebrow">PANDUAN &amp; ILMU JEMAAH</p><h2 id="home-explore" className="section-heading">Terokai SafaMarwah</h2></div><p className="section-head__description">Pilih ruang rujukan mengikut keperluan anda.</p></div><div className="tools-grid tools-grid--hybrid">{pages.map((p,i)=><Link key={p.slug} to={"/"+p.slug} className="home-tool"><span className="home-tool__index">0{i+1}</span><h3>{p.title}</h3><p>{p.description}</p><span className="home-tool__arrow" aria-hidden="true">↗</span></Link>)}</div></section>
  <section className="section-gap home-guides" aria-labelledby="home-guides"><div className="section-head"><div><p className="section-eyebrow">MULA DI SINI</p><h2 id="home-guides" className="section-heading">Panduan untuk perjalanan anda</h2></div></div><div className="home-guide-grid">{highlights.map(item=><Link key={item.number} className="home-guide" to={item.to}><span className="home-guide__number">{item.number}</span><div><h3>{item.title}</h3><p>{item.description}</p></div><span className="home-guide__arrow" aria-hidden="true">↗</span></Link>)}</div></section>
  <section className="section-gap" aria-labelledby="home-latest"><div className="section-head"><div><p className="section-eyebrow">BACAAN &amp; ILMU</p><h2 id="home-latest" className="section-heading">Artikel Terkini</h2></div><Link className="section-head__link" to="/blog">Semua artikel <span aria-hidden="true">→</span></Link></div><FeedGrid limit={3}/></section>
</Layout>}
