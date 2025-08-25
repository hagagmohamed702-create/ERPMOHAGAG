export function installClientLogger() {
  if (typeof window === "undefined") return;
  if ((window as any).__logger_installed) return;
  (window as any).__logger_installed = true;

  window.addEventListener("error", (e) => {
    // لا ترسل لشبكة؛ فقط console في النسخة الحالية
    console.error("[window.onerror]", e?.error ?? e?.message ?? e);
  });

  window.addEventListener("unhandledrejection", (e) => {
    console.error("[unhandledrejection]", e?.reason ?? e);
  });
}