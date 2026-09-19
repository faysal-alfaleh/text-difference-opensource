const isDevelopment = process.env.NODE_ENV === "development"

const contentSecurityPolicy = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", ...(isDevelopment ? ["'unsafe-eval'"] : [])],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:"],
  "font-src": ["'self'"],
  "connect-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'none'"],
  "frame-ancestors": ["'none'"],
}

export const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: Object.entries(contentSecurityPolicy)
      .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
      .join("; "),
  },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
]
