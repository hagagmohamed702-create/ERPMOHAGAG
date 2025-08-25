"use client";
import {useEffect} from "react";

export default function GlobalError({error, reset}:{error: Error & {digest?: string}, reset: ()=>void}) {
  useEffect(()=>{ console.error("[global-error]", error); },[error]);
  const isDev = process.env.NODE_ENV !== "production";
  
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          direction: 'rtl'
        }}>
          <div style={{
            maxWidth: '32rem',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              حدث خطأ في التطبيق
            </h1>
            
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              نعتذر عن هذا الخطأ. يرجى إعادة تحميل الصفحة.
            </p>
            
            {isDev && error && (
              <pre style={{
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: '16rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(0,0,0,0.05)',
                marginBottom: '1rem',
                textAlign: 'left',
                direction: 'ltr'
              }}>
                {String(error?.message)}{"\n"}{String((error as any)?.stack ?? "")}
              </pre>
            )}
            
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                إعادة المحاولة
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                الصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}