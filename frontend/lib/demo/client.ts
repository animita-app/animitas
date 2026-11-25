import type { SupabaseClient } from '@supabase/supabase-js'
import { DEMO_USER } from './flag'
import { adopt, loadDemo, saveDemo, seedSite, type DemoData } from './store'

// A stand-in for the Supabase browser client in demo mode. It answers the queries the app makes: the
// animitas themselves come from the real database (read only); candles, recuerdos, profiles and
// anything the visitor adds or edits live in their browser.

type Row = Record<string, any>
type Filter = (row: Row) => boolean
type Call = [method: string, args: any[]]

const LOCAL_TABLES: Record<string, keyof DemoData> = {
  heritage_site_reactions: 'velas',
  heritage_site_comments: 'comments',
  user_profiles: 'profiles',
}

const uuid = () => crypto.randomUUID()

function expand(row: Row, select: string, data: DemoData, sites: Row[]) {
  const out = { ...row }
  if (select.includes('user_profiles')) {
    const p = data.profiles.find(x => x.id === row.user_id)
    out.user_profiles = p ? { display_name: p.display_name, image: p.image } : null
  }
  if (select.includes('heritage_sites(')) {
    const s = sites.find(x => x.id === row.site_id)
    out.heritage_sites = s ? { title: s.title, slug: s.slug } : null
  }
  return out
}

class Query implements PromiseLike<any> {
  private calls: Call[] = []
  private filters: Filter[] = []
  private op: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select'
  private payload: any = null
  private selectCols = '*'
  private orderBy: [string, boolean] | null = null
  private max: number | null = null
  private one: 'single' | 'maybe' | null = null

  constructor(private table: string, private real: SupabaseClient) {}

  select(cols = '*') { if (this.op === 'select') this.selectCols = cols; this.calls.push(['select', [cols]]); return this }
  insert(rows: any) { this.op = 'insert'; this.payload = rows; return this }
  update(patch: any) { this.op = 'update'; this.payload = patch; return this }
  upsert(row: any) { this.op = 'upsert'; this.payload = row; return this }
  delete() { this.op = 'delete'; return this }
  eq(col: string, val: any) { this.filters.push(r => r[col] === val); this.calls.push(['eq', [col, val]]); return this }
  neq(col: string, val: any) { this.filters.push(r => r[col] !== val); this.calls.push(['neq', [col, val]]); return this }
  in(col: string, vals: any[]) { this.filters.push(r => vals.includes(r[col])); this.calls.push(['in', [col, vals]]); return this }
  order(col: string, opts?: { ascending?: boolean }) { this.orderBy = [col, opts?.ascending ?? true]; this.calls.push(['order', [col, opts]]); return this }
  limit(n: number) { this.max = n; this.calls.push(['limit', [n]]); return this }
  single() { this.one = 'single'; return this }
  maybeSingle() { this.one = 'maybe'; return this }

  then<A = any, B = never>(ok?: ((v: any) => A | PromiseLike<A>) | null, fail?: ((e: any) => B | PromiseLike<B>) | null) {
    return this.run().then(ok, fail)
  }

  private shape(rows: Row[]) {
    if (this.orderBy) {
      const [col, asc] = this.orderBy
      rows = [...rows].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (asc ? 1 : -1))
    }
    if (this.max !== null) rows = rows.slice(0, this.max)
    if (this.one) {
      const row = rows[0] ?? null
      if (!row && this.one === 'single') return { data: null, error: { message: 'No encontrado', code: 'PGRST116' } }
      return { data: row, error: null }
    }
    return { data: rows, error: null }
  }

  private async realSites(): Promise<Row[]> {
    let q: any = this.real.from('heritage_sites')
    for (const [m, args] of this.calls) if (m !== 'limit' && m !== 'order') q = q[m](...args)
    if (!this.calls.some(([m]) => m === 'select')) q = q.select('*')
    const { data } = await q
    return data ?? []
  }

  private async run() {
    const data = loadDemo()
    const matches = (r: Row) => this.filters.every(f => f(r))

    if (this.table === 'heritage_sites') {
      if (this.op === 'update') {
        const ids = [...data.animitas, ...(await this.realSites())].filter(matches).map(r => r.id)
        for (const id of ids) {
          const local = data.animitas.find(a => a.id === id)
          if (local) Object.assign(local, this.payload)
          else data.patches[id] = { ...(data.patches[id] ?? {}), ...this.payload }
        }
        saveDemo(data)
        return { data: null, error: null }
      }
      if (this.op === 'insert') {
        const row = { id: uuid(), created_at: new Date().toISOString(), status: 'published', creator_id: DEMO_USER.id, ...this.payload }
        data.animitas.push(row)
        saveDemo(data)
        return this.shape([row])
      }
      // Reads: the real animitas with the visitor's edits on top, plus the ones they added. Whatever asks
      // first (the map or the notifications) settles which ones the visitor "owns".
      if (!data.adopted.length) {
        const all = await this.real.from('heritage_sites').select('id, created_at').eq('status', 'published')
        const ids = ((all.data ?? []) as Row[]).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map(r => r.id)
        adopt(data, ids)
        saveDemo(data)
      }
      const realRows = await this.realSitesUnfilteredByCreator(data)
      const rows = [...realRows.map(r => ({ ...r, ...(data.patches[r.id] ?? {}) })), ...data.animitas].filter(matches)
      return this.shape(rows)
    }

    const key = LOCAL_TABLES[this.table]
    if (!key) return this.shape([])
    const rows = data[key] as Row[]

    if (this.op === 'insert' || this.op === 'upsert') {
      const list = Array.isArray(this.payload) ? this.payload : [this.payload]
      const saved = list.map((row: Row) => {
        const existing = this.op === 'upsert' ? rows.find(r => r.id === row.id) : undefined
        if (existing) return Object.assign(existing, row)
        const created = { id: uuid(), created_at: new Date().toISOString(), ...row }
        rows.push(created)
        return created
      })
      saveDemo(data)
      return this.shape(saved)
    }
    if (this.op === 'update') {
      rows.filter(matches).forEach(r => Object.assign(r, this.payload))
      saveDemo(data)
      return { data: null, error: null }
    }
    if (this.op === 'delete') {
      const keep = rows.filter(r => !matches(r))
      ;(data as any)[key] = keep
      saveDemo(data)
      return { data: null, error: null }
    }

    // Reads of candles and recuerdos make up a site's history the first time it is looked at.
    if (key !== 'profiles') {
      const siteCall = this.calls.find(([m, a]) => (m === 'eq' || m === 'in') && a[0] === 'site_id')
      if (siteCall) {
        const ids = siteCall[0] === 'in' ? siteCall[1][1] : [siteCall[1][1]]
        ids.forEach((id: string) => seedSite(data, id))
        saveDemo(data)
      }
    }
    const needsSites = this.selectCols.includes('heritage_sites(')
    const sites = needsSites ? [...(await this.realSitesAll()), ...data.animitas] : []
    return this.shape((data[key] as Row[]).filter(matches).map(r => expand(r, this.selectCols, data, sites)))
  }

  // A creator filter can't go to the real database: in the demo the visitor "owns" sites the database
  // says are someone else's, so filter after applying the visitor's patches.
  private async realSitesUnfilteredByCreator(_data: DemoData) {
    if (!this.calls.some(([m, a]) => m === 'eq' && a[0] === 'creator_id')) return this.realSites()
    return this.realSitesAll()
  }

  private async realSitesAll(): Promise<Row[]> {
    const { data } = await this.real.from('heritage_sites').select('*').eq('status', 'published')
    return data ?? []
  }
}

const uploads = new Map<string, string>()

// Photos are kept in the browser, so they're shrunk to a size its storage can hold.
async function shrink(file: File, max = 1200): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.78)
}

export function createDemoClient(real: SupabaseClient): SupabaseClient {
  const session = { user: { id: DEMO_USER.id, email: 'visita@demo.local' } }
  const demo = {
    from: (table: string) => new Query(table, real),
    auth: {
      getSession: async () => ({ data: { session }, error: null }),
      getUser: async () => ({ data: { user: session.user }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => {
        // Leaving the demo is how a demo visitor signs out.
        window.location.href = '/demo?salir'
        return { error: null }
      },
      signInWithOtp: async () => ({ data: {}, error: null }),
      signInWithOAuth: async () => ({ data: { url: '/map' }, error: null }),
    },
    storage: {
      from: () => ({
        upload: async (path: string, file: File) => {
          uploads.set(path, await shrink(file))
          return { data: { path }, error: null }
        },
        getPublicUrl: (path: string) => ({ data: { publicUrl: uploads.get(path) ?? '' } }),
      }),
    },
  }
  return demo as unknown as SupabaseClient
}
