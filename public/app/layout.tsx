import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import "./community.css";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata: Metadata = { title: "Data Science Society", description: "Events, discussions and resources from the Data Science Society." };
const nav = [{href:"/",label:"Home"},{href:"/#events",label:"Events"},{href:"/forum",label:"Forum"},{href:"/resources",label:"Resources"},{href:"/certificates",label:"Certificates"}];
export default function RootLayout({ children }: LayoutProps<"/">) {
 return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}><body className="portal-body">
 <header className="site-header"><div className="site-header-inner"><Link href="/" className="brand"><Image src="/DSS_Logo.png" alt="" width={80} height={80} sizes="80px" className="brand-logo" priority/><Image src="/university-logo-transparent.png" alt="Muhammad Nawaz Shareef University of Agriculture Multan" width={68} height={60} sizes="68px" className="university-brand-logo" priority/><span className="brand-copy"><strong>DATA SCIENCE SOCIETY</strong><small>University of Agriculture Multan</small></span></Link>
 <nav className="desktop-nav" aria-label="Main navigation">{nav.map(x=><Link key={x.label} href={x.href}>{x.label}</Link>)}</nav>
 <details className="mobile-menu"><summary>Menu <span aria-hidden="true">☰</span></summary><nav aria-label="Mobile navigation">{nav.map(x=><Link key={x.label} href={x.href}>{x.label}</Link>)}</nav></details></div></header>
 <div className="site-main">{children}</div><footer className="site-footer"><div><strong>Data Science Society</strong><span>University of Agriculture Multan</span></div><div><Link href="/past">Past events</Link><Link href="/resources">Resources</Link><Link href="/certificates">Certificates</Link></div></footer></body></html>;
}
