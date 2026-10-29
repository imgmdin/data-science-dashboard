"use client";
import { useEffect, useRef, type ReactNode } from "react";
export function Overlay({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}) {
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const el=dialog.current;const focused=document.activeElement as HTMLElement|null;el?.showModal();const overflow=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{el?.close();document.body.style.overflow=overflow;focused?.focus()}},[]);
 return <dialog ref={dialog} className="portal-dialog" aria-labelledby="dialog-title" onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="dialog-content"><header><h2 id="dialog-title">{title}</h2><button onClick={onClose} aria-label="Close dialog">×</button></header>{children}</div></dialog>;
}
