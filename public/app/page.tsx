import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { eventStatus, formatDate, formatTime } from "@/lib/event-status";
import { listEvents, type PublicEvent } from "@/lib/events";
import { resources } from "@/lib/community-content";
import { HomeCommunity } from './components/home-community';
import { placeOf } from "./components/event-ui";
import { EventBrowser, type Groups } from "./event-browser";
export default function Home(){return <Suspense fallback={<main className="shell loading">Loading events…</main>}><Portal/></Suspense>}
async function Portal(){
 await connection();
 let events:PublicEvent[]=[],unavailable=false;
 try{events=await listEvents()}catch{unavailable=true}
 const pick=(phase:string)=>events.filter(e=>eventStatus(e).phase===phase);
 const groups:Groups={now:pick("ongoing"),open:pick("open"),later:pick("scheduled"),recent:pick("concluded").reverse().slice(0,3)};
 const featured=groups.now[0]??groups.open[0]??groups.later[0];
 return <main className="shell home-page"><div className="home-top"><section className="home-hero"><div className="hero-copy"><h1>Learn, build,<br/>and share.</h1><p>Your events, projects and community in one place.</p><div className="actions"><a href="#events" className="primary">Explore events →</a><Link href="/forum" className="outline-btn">Visit forum</Link></div></div><div className="hero-art"><img src="/illustrations/community.png" alt="Members working together on data visualisations"/></div></section><section className="event-feature">{featured?<><h2>{featured.title}</h2><div className="event-meta"><span>{formatDate(featured.startAt)} · {formatTime(featured.startAt)}</span><span>{placeOf(featured)}</span></div><Link className="feature-link" href={`/events/${featured.slug}`}>View event →</Link></>:<><h2>{unavailable?"Events unavailable":"No upcoming events"}</h2><Link href="/past" className="feature-link">Browse past events →</Link></>}</section></div>
 <div className="home-content"><HomeCommunity/><aside className="home-side"><section className="home-resource"><div className="section-heading"><h2>Resource library</h2><Link href="/resources">Browse →</Link></div><div className="resource-peek"><img src="/illustrations/resources.png" alt=""/><div><Link href="/resources">{resources[0].title} ↗</Link><span>Python · Beginner</span></div></div></section><section className="certificate-box"><h2>Find your certificate.</h2><Link className="outline-btn" href="/certificates">Open certificates →</Link></section></aside></div>
 <section id="events" className="event-section"><div className="section-heading"><h2>Events</h2><Link href="/past">Past events →</Link></div>{unavailable?<div className="empty-state"><p>Couldn’t load events. Please try again shortly.</p><a href="/#events" className="outline-btn">Try again</a></div>:<EventBrowser groups={groups}/>}</section></main>
}
