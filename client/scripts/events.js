export const emit = (type, detail) => window.dispatchEvent(new CustomEvent(type, { detail }))
export const on = (type, cb) => window.addEventListener(type, e => cb(e.detail))