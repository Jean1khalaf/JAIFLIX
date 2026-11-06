import Link from "next/link";
export default function Pagination({page,totalPages,baseUrl,lang}:{page:number,totalPages:number,baseUrl:string,lang:"en"|"ar"}){
 if(totalPages<=1)return null;
 const prev=Math.max(1,page-1),next=Math.min(totalPages,page+1);
 return <nav className="pagination" aria-label={lang==="ar"?"التنقل بين الصفحات":"Pagination"} dir={lang==="ar"?"rtl":"ltr"}>
  {page>1?<Link href={`${baseUrl}${baseUrl.includes("?")?"&":"?"}page=${prev}`}>{lang==="ar"?"السابق":"Previous"}</Link>:<span className="disabled">{lang==="ar"?"السابق":"Previous"}</span>}
  <strong>{lang==="ar"?`صفحة ${page} من ${totalPages}`:`Page ${page} of ${totalPages}`}</strong>
  {page<totalPages?<Link href={`${baseUrl}${baseUrl.includes("?")?"&":"?"}page=${next}`}>{lang==="ar"?"التالي":"Next"}</Link>:<span className="disabled">{lang==="ar"?"التالي":"Next"}</span>}
 </nav>;
}
