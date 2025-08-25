"use client";
import {useEffect} from "react";
import Link from "next/link";
export default function Error({error, reset}:{error: Error & {digest?: string}, reset: ()=>void}) {
  useEffect(()=>{ console.error("[app/error]", error); },[error]);
  const isDev = true;
  return (
    <div dir="rtl" className="min-h-[60vh] grid place-items-center p-6">
      <div className="max-w-xl w-full rounded-2xl border border-border/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">حدث خطأ غير متوقع</h1>
        <p className="text-muted-foreground mb-4">عذراً، تعذّر عرض الصفحة.</p>
        {isDev && (
          <pre className="text-xs overflow-auto max-h-64 p-3 rounded-lg bg-black/5 dark:bg-white/5 mb-4">
            {String(error?.message)}{"\n"}{String((error as any)?.stack ?? "")}
          </pre>
        )}
        <div className="flex gap-3">
          <button onClick={()=>reset()} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">إعادة المحاولة</button>
          <Link href="/" className="px-4 py-2 rounded-lg border">العودة للوحة التحكم</Link>
        </div>
      </div>
    </div>
  );
}