import React from "react";

export const BLOG_ORIGIN="https://www.safamarwah.my";
export const FALLBACK_IMAGE="https://raw.githubusercontent.com/shahridzansihan/SafaMarwah-App/safamarwah-v2-foundation/kaaba.jpg";
export type ArticleBlock={kind:"p"|"h2"|"h3"|"img"|"ul"|"ol"|"quote";text:string;src?:string;items?:string[]};
export type FeedArticle={id:string;title:string;url:string;description:string;image:string;published:string;author:string;avatar:string;labels:string[];paragraphs:string[];blocks:ArticleBlock[];slug:string};
type BloggerEntry={category?:{term:string}[];id?:{$t:string};title?:{$t:string};content?:{$t:string};summary?:{$t:string};published?:{$t:string};media$thumbnail?:{url:string};author?:{name?:{$t:string};gd$image?:{src:string}}[];link?:{rel:string;href:string}[]};
type BloggerResponse={feed?:{entry?:BloggerEntry[]}};
function highResolutionBloggerImage(src:string):string{
 if(!src)return FALLBACK_IMAGE;
 try{
  const url=new URL(src,BLOG_ORIGIN);
  if(url.protocol!=="https:")return FALLBACK_IMAGE;
  if(url.hostname==="blogger.googleusercontent.com"||url.hostname.endsWith(".bp.blogspot.com")||/^lh[3-6]\.googleusercontent\.com$/.test(url.hostname)){
   url.pathname=url.pathname.replace(/\/s\d+(?:-c)?\//g,"/s1200/").replace(/=s\d+(?:-c)?$/,"=s1200");
  }
  return url.href;
 }catch{return FALLBACK_IMAGE;}
}
function parseFeed(data:BloggerResponse):FeedArticle[]{return (data.feed?.entry||[]).map((entry,index)=>{
 const html=entry.content?.$t||entry.summary?.$t||"";
 const doc=new DOMParser().parseFromString(html,"text/html");
 const description=(doc.body.textContent||"").trim().split(/\s+/).filter(Boolean).slice(0,15).join(" ");
 const paragraphs=Array.from(doc.body.querySelectorAll("p, h2, h3, li")).map(node=>(node.textContent||"").trim()).filter(Boolean);
 if(!paragraphs.length&&doc.body.textContent?.trim())paragraphs.push(doc.body.textContent.trim());
 const blocks:ArticleBlock[]=[];
 const container=doc.body;
 function collect(parent:Element){for(const node of Array.from(parent.children)){const tag=node.tagName.toLowerCase();if(["script","style","iframe","form","button","svg","object","embed"].includes(tag))continue;
 if(tag==="img"){const src=node.getAttribute("data-src")||node.getAttribute("src")||"";if(src)blocks.push({kind:"img",text:node.getAttribute("alt")||"",src:highResolutionBloggerImage(src)});continue;}
 if(tag==="h2"||tag==="h3"||tag==="p"||tag==="blockquote"){const text=(node.textContent||"").trim();if(text)blocks.push({kind:(tag==="blockquote"?"quote":tag) as ArticleBlock["kind"],text});if(tag==="p"){for(const img of Array.from(node.querySelectorAll("img"))){const src=img.getAttribute("data-src")||img.getAttribute("src");if(src)blocks.push({kind:"img",text:img.getAttribute("alt")||"",src:highResolutionBloggerImage(src)});}}continue;}
 if(tag==="ul"||tag==="ol"){const items=Array.from(node.children).filter(x=>x.tagName.toLowerCase()==="li").map(x=>(x.textContent||"").trim()).filter(Boolean);if(items.length)blocks.push({kind:tag,text:"",items});continue;}
 collect(node);
 }}
 collect(container);
 if(!blocks.length&&doc.body.textContent?.trim())blocks.push({kind:"p",text:doc.body.textContent.trim()});
 const contentImage=doc.querySelector("img")?.getAttribute("data-src")||doc.querySelector("img")?.getAttribute("src")||"";
 const rawImage=contentImage||entry.media$thumbnail?.url||"";
 const image=highResolutionBloggerImage(rawImage);
 const link=entry.link?.find(x=>x.rel==="alternate")?.href||"";
 let safeUrl="";try{const url=new URL(link);if(url.protocol==="https:"&&(url.hostname==="safamarwah.my"||url.hostname==="www.safamarwah.my"))safeUrl=url.href;}catch{}
 return {id:entry.id?.$t||String(index),title:entry.title?.$t||"Artikel SafaMarwah",url:safeUrl,description,image,published:entry.published?.$t||"",author:entry.author?.[0]?.name?.$t||"SafaMarwah",avatar:entry.author?.[0]?.["gd$image"]?.src||"",labels:(entry.category||[]).map(c=>c.term).filter(Boolean),paragraphs,blocks,slug:safeUrl?new URL(safeUrl).pathname.split("/").pop()?.replace(/\.html$/,"")||"":""};
}).filter(x=>Boolean(x.url));}
export function useBloggerFeed(limit=12){const[items,setItems]=React.useState<FeedArticle[]>([]);const[loading,setLoading]=React.useState(true);const[error,setError]=React.useState(false);
 React.useEffect(()=>{let active=true;const callback="safamarwahFeed"+Math.random().toString(36).slice(2);const globalCallbacks=window as unknown as Record<string,unknown>;const script=document.createElement("script");
 const timer=window.setTimeout(()=>finish(false),12000);
 function finish(ok:boolean,data?:BloggerResponse){if(!active)return;window.clearTimeout(timer);if(ok&&data){setItems(parseFeed(data));setError(false);}else{setError(true);}setLoading(false);script.remove();delete globalCallbacks[callback];}
 globalCallbacks[callback]=(data:BloggerResponse)=>finish(true,data);
 script.src=BLOG_ORIGIN+"/feeds/posts/default?alt=json-in-script&max-results="+limit+"&callback="+callback;
 script.async=true;script.onerror=()=>finish(false);document.head.appendChild(script);
 return()=>{active=false;window.clearTimeout(timer);script.remove();delete globalCallbacks[callback];};
 },[limit]);return {items,loading,error};}
