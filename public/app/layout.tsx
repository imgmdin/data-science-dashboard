import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Society Portal — Data Science Society",
  description: "Find and register for Data Science Society events, and download your certificates.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="bg-[#220668] text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/DSS_Logo.png" alt="Data Science Society" width={64} height={64} priority className="h-14 w-14 object-contain" />
              <span className="leading-tight">
                <span className="block whitespace-nowrap text-lg font-semibold">Society Portal</span>
                <span className="hidden text-sm text-brand-300 sm:block">Data Science Society</span>
              </span>
            </Link>
            <nav aria-label="Main" className="flex items-center gap-1 text-sm font-medium">
              <Link href="/" className="rounded-lg px-3 py-2 text-brand-100 hover:bg-white/10 hover:text-white">
                Events
              </Link>
              <Link href="/certificates" className="rounded-lg px-3 py-2 text-brand-100 hover:bg-white/10 hover:text-white">
                Certificates
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-brand-100 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-6 text-sm text-slate-600">
            <span>Data Science Society · University of Agriculture Multan</span>
            <span>
              <Link href="/past" className="hover:text-brand-800">
                Past events
              </Link>
              {" · "}
              <Link href="/certificates" className="hover:text-brand-800">
                Certificates
              </Link>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
