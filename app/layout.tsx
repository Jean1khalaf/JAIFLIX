import "./globals.css";import type {Metadata} from "next";
export const metadata:Metadata={title:{default:"JAIFLIX",template:"%s | JAIFLIX"},description:"Movies and series from around the world"};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
