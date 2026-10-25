"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { getTemplate } from "./templates";
import { ornament } from "./ornaments";

export type CertificateData = {
  templateId: string;
  title: string;
  recipient: string;
  statement: string;
  event: string;
  badge: string;
  leftName: string;
  leftRole: string;
  rightName: string;
  rightRole: string;
  leftSignature: string;
  rightSignature: string;
};

// A4 landscape in CSS pixels.
export const PAPER_W = (297 * 96) / 25.4;
export const PAPER_H = (210 * 96) / 25.4;

export function CertificatePaper({
  data,
  paperRef,
}: {
  data: CertificateData;
  paperRef?: Ref<HTMLElement>;
}) {
  const t = getTemplate(data.templateId);
  const layouts = t.layout.split(" ").map((x) => `layout-${x}`).join(" ");
  const recipientSize =
    data.recipient.length > 45 ? "20pt" : data.recipient.length > 32 ? "22pt" : "24pt";
  const eventSize = data.event.length > 70 ? "14pt" : "16pt";

  return (
    <article
      ref={paperRef}
      className={`dss-paper ${t.filled ? "filled" : ""} ${layouts}`}
      aria-label={`${t.name} certificate`}
    >
      <div dangerouslySetInnerHTML={{ __html: ornament(t) }} style={{ display: "contents" }} />
      <header className="dss-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dss-logo society" src="/certificates/society-logo.png" alt="Data Science Society" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dss-logo university" src="/certificates/university-logo.png" alt="University of Agriculture Multan" />
      </header>
      <section className="dss-content">
        <h1 className="dss-title">{data.title}</h1>
        <p className="dss-presented">Presented to</p>
        <h2 className="dss-recipient" style={{ fontSize: recipientSize }}>{data.recipient}</h2>
        <p className="dss-statement">{data.statement}</p>
        <p className="dss-event" style={{ fontSize: eventSize }}>{data.event}</p>
        <p className="dss-badge">{data.badge}</p>
      </section>
      <div className="dss-footer" />
      <section className="dss-signatures" aria-label="Certificate signatories">
        {(["left", "right"] as const).map((side) => {
          const sig = data[`${side}Signature`];
          const name = data[`${side}Name`];
          return (
            <div className="dss-signature" key={side}>
              <div className="dss-sign-space">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {sig ? <img src={sig} alt={`${name} signature`} /> : null}
              </div>
              <div className="dss-sign-rule" />
              <p className="dss-sign-name">{name}</p>
              <p className="dss-sign-role">{data[`${side}Role`]}</p>
            </div>
          );
        })}
      </section>
    </article>
  );
}

/** Scales the fixed-size paper down to the width of its container. */
export function CertificateFrame({
  data,
  paperRef,
  className = "",
}: {
  data: CertificateData;
  paperRef?: Ref<HTMLElement>;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / PAPER_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const s = scale ?? 1;
  return (
    <div
      ref={host}
      className={`dss-stage ${className}`}
      style={{ height: PAPER_H * s, visibility: scale === null ? "hidden" : "visible" }}
    >
      <div style={{ transform: `scale(${s})`, transformOrigin: "top left", width: PAPER_W, height: PAPER_H }}>
        <CertificatePaper data={data} paperRef={paperRef} />
      </div>
    </div>
  );
}
