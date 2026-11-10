import "./globals.css";import type {Metadata} from "next";
export const metadata:Metadata={title:{default:"JAIFLIX",template:"%s | JAIFLIX"},description:"JAIFLIX — Movies and series from around the world",icons:{icon:"/jaiflix-icon.png",apple:"/jaiflix-icon.png"}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
