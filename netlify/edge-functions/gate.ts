// Google Workspace gate for the whole site.
//
// Every request is intercepted before a file is served. No valid session
// cookie means a redirect to Google; the callback checks the `hd` claim
// against ALLOWED_DOMAIN and only then issues a signed cookie. A visitor
// outside the Workspace never receives a byte of the build.
//
// Required environment variables (set in Netlify, never in the repo):
//   GOOGLE_CLIENT_ID      OAuth 2.0 web client
//   GOOGLE_CLIENT_SECRET  its secret
//   SESSION_SECRET        32+ random bytes, base64 or hex, our own
//   ALLOWED_DOMAIN        the Workspace domain to admit. Do not write
//                         its value here: the build scans the repo for
//                         every environment value and fails on a match.
// Optional:
//   ALLOWED_EMAILS        comma-separated addresses outside the domain
//   SESSION_HOURS         session lifetime, default 12
//   CANONICAL_HOST        the one hostname sign in works on; anything
//                         else is redirected to it first

export const config = { path: '/*' }

const SESSION = '__nff_session'
const STATE = '__nff_state'
const CALLBACK = '/__auth/callback'
const LOGOUT = '/__auth/logout'

const enc = new TextEncoder()
const dec = new TextDecoder()

function env(name: string): string {
  // deno-lint-ignore no-explicit-any
  const g = globalThis as any
  return g.Netlify?.env?.get(name) ?? g.Deno?.env?.get(name) ?? ''
}

function b64url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function unb64url(s: string): Uint8Array {
  const p = s.replace(/-/g, '+').replace(/_/g, '/')
  const padded = p + '='.repeat((4 - (p.length % 4)) % 4)
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

async function sign(key: CryptoKey, data: string): Promise<string> {
  const body = b64url(enc.encode(data))
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  return `${body}.${b64url(new Uint8Array(sig))}`
}

// Returns the original string, or null if the signature does not verify.
// crypto.subtle.verify compares in constant time.
async function unsign(key: CryptoKey, token: string): Promise<string | null> {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  let ok = false
  try {
    ok = await crypto.subtle.verify(
      'HMAC',
      key,
      unb64url(sig),
      enc.encode(body),
    )
  } catch {
    return null
  }
  return ok ? dec.decode(unb64url(body)) : null
}

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get('cookie') ?? ''
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim()
  }
  return null
}

function setCookie(name: string, value: string, maxAge: number): string {
  return [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ].join('; ')
}

function redirect(location: string, cookies: string[] = []): Response {
  const headers = new Headers({ location, 'cache-control': 'no-store' })
  for (const c of cookies) headers.append('set-cookie', c)
  return new Response(null, { status: 302, headers })
}

function deny(message: string): Response {
  return new Response(message, {
    status: 403,
    headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' },
  })
}

// The id_token comes straight from Google's token endpoint over TLS, in
// response to a request signed with our client secret. Google's own
// guidance is that a token obtained that way needs its claims checked but
// not its signature, which keeps a JWKS fetch and an RS256 verify out of
// the hot path.
function claims(idToken: string): Record<string, unknown> | null {
  const parts = idToken.split('.')
  if (parts.length !== 3) return null
  try {
    return JSON.parse(dec.decode(unb64url(parts[1])))
  } catch {
    return null
  }
}

async function startLogin(
  req: Request,
  url: URL,
  key: CryptoKey,
): Promise<Response> {
  // Only a GET can be resumed after the round trip to Google.
  if (req.method !== 'GET') return deny('Sign in required.')

  const nonce = b64url(crypto.getRandomValues(new Uint8Array(16)))
  const state = await sign(
    key,
    JSON.stringify({ n: nonce, r: url.pathname + url.search }),
  )

  const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  auth.searchParams.set('client_id', env('GOOGLE_CLIENT_ID'))
  auth.searchParams.set('redirect_uri', `${url.origin}${CALLBACK}`)
  auth.searchParams.set('response_type', 'code')
  auth.searchParams.set('scope', 'openid email')
  auth.searchParams.set('state', state)
  auth.searchParams.set('prompt', 'select_account')
  // A hint for the account chooser only. The claim is verified below.
  const domain = env('ALLOWED_DOMAIN')
  if (domain) auth.searchParams.set('hd', domain)

  return redirect(auth.toString(), [setCookie(STATE, state, 600)])
}

async function handleCallback(
  req: Request,
  url: URL,
  key: CryptoKey,
): Promise<Response> {
  if (url.searchParams.get('error')) return deny('Sign in was cancelled.')

  const state = url.searchParams.get('state') ?? ''
  const code = url.searchParams.get('code') ?? ''
  if (!state || !code) return deny('Malformed sign in.')
  if (state !== readCookie(req, STATE)) return deny('Stale sign in. Retry.')

  const raw = await unsign(key, state)
  if (!raw) return deny('Malformed sign in.')
  let back = '/'
  try {
    const parsed = JSON.parse(raw)
    // Only ever resume a path on this origin. One leading slash is not
    // enough: `//evil.com` and `/\evil.com` are protocol-relative URLs,
    // and a browser follows them off the origin entirely. Our own
    // signature is no help, because the path we sign came from the
    // request line, so a crafted link gets its redirect signed for it.
    if (typeof parsed.r === 'string' && /^\/(?![/\\])/.test(parsed.r)) {
      back = parsed.r
    }
  } catch {
    return deny('Malformed sign in.')
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env('GOOGLE_CLIENT_ID'),
      client_secret: env('GOOGLE_CLIENT_SECRET'),
      redirect_uri: `${url.origin}${CALLBACK}`,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) return deny('Google rejected the sign in.')

  const token = (await res.json()).id_token
  const c = typeof token === 'string' ? claims(token) : null
  if (!c) return deny('Google returned no identity.')

  const now = Math.floor(Date.now() / 1000)
  const issuers = ['accounts.google.com', 'https://accounts.google.com']
  if (c.aud !== env('GOOGLE_CLIENT_ID')) return deny('Wrong audience.')
  if (!issuers.includes(String(c.iss))) return deny('Wrong issuer.')
  if (typeof c.exp !== 'number' || c.exp <= now) return deny('Expired token.')
  if (c.email_verified !== true) return deny('Unverified address.')

  const email = String(c.email ?? '').toLowerCase()
  const guests = env('ALLOWED_EMAILS')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  const domain = env('ALLOWED_DOMAIN').toLowerCase()
  const admitted = (domain && c.hd === domain) || guests.includes(email)
  if (!admitted) return deny(`${email} is not on the list.`)

  const hours = Number(env('SESSION_HOURS')) || 12
  const session = await sign(
    key,
    JSON.stringify({ email, exp: now + hours * 3600 }),
  )

  return redirect(back, [
    setCookie(SESSION, session, hours * 3600),
    setCookie(STATE, '', 0),
  ])
}

export default async function gate(req: Request): Promise<Response | void> {
  const url = new URL(req.url)

  // Only one hostname has a registered redirect URI, so sign in can only
  // ever complete there. Send the free Netlify subdomain and any deploy
  // preview to it rather than leaving them on a door that cannot open.
  const canonical = env('CANONICAL_HOST')
  if (canonical && url.hostname !== canonical) {
    url.hostname = canonical
    url.protocol = 'https:'
    url.port = ''
    return redirect(url.toString())
  }

  const missing = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SESSION_SECRET',
    'ALLOWED_DOMAIN',
  ].filter((v) => !env(v))
  // Fail closed. A half-configured gate must not serve the site.
  if (missing.length) return deny(`Gate unconfigured: ${missing.join(', ')}`)

  const key = await hmacKey(env('SESSION_SECRET'))

  if (url.pathname === CALLBACK) return await handleCallback(req, url, key)
  if (url.pathname === LOGOUT) {
    return redirect('/', [setCookie(SESSION, '', 0)])
  }

  const cookie = readCookie(req, SESSION)
  if (cookie) {
    const raw = await unsign(key, cookie)
    if (raw) {
      try {
        const { exp } = JSON.parse(raw)
        if (typeof exp === 'number' && exp > Math.floor(Date.now() / 1000)) {
          return // Signed in. Fall through to the static file.
        }
      } catch {
        // Fall through to a fresh sign in.
      }
    }
  }

  return await startLogin(req, url, key)
}
