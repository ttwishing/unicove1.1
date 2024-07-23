// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;
// fixme: kurt ReferenceError: indexedDB is not defined 
export const ssr = false;
