export const isBrowser = () => typeof window !== "undefined";
export const safeLocalStorage = {
  get(key:string){ if(!isBrowser()) return null; try{ return window.localStorage.getItem(key);}catch{ return null; } },
  set(key:string,v:string){ if(!isBrowser()) return; try{ window.localStorage.setItem(key,v);}catch{} },
};