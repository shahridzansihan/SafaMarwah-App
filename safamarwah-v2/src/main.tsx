import React from "react";
import {createRoot} from "react-dom/client";
import {HashRouter,Routes,Route} from "react-router-dom";
import "./styles.css";
import {Home,Page,Article,NotFound} from "./pages/AppPages";
function App(){return <HashRouter><Routes><Route path="/" element={<Home/>}/><Route path="/blog/:articleSlug" element={<Article/>}/><Route path="/:slug/:subslug" element={<Page subpage/>}/><Route path="/:slug" element={<Page/>}/><Route path="*" element={<NotFound/>}/></Routes></HashRouter>}
if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register(new URL("sw.js",document.baseURI).toString()).catch(()=>{/* Online mode remains available if registration fails */})})}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
