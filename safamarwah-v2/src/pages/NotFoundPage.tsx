import {Link} from "react-router-dom";
import {Layout,PageHeading} from "../components/SiteLayout";
export function NotFound(){return <Layout><PageHeading title="Halaman tidak ditemui" description="Halaman ini tidak tersedia dalam SafaMarwah v2.0."/><Link className="btn-primary" to="/">Kembali ke Utama</Link></Layout>}
