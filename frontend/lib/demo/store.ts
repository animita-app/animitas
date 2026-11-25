import { DEMO_USER, readDemoSession } from './flag'

// Everything the visitor does in demo mode, kept in their browser. Each demo session (the cookie's value)
// gets its own store, so "reiniciar" starts clean.

type Row = Record<string, any>

export interface DemoData {
  profiles: Row[]
  velas: Row[]
  comments: Row[]
  animitas: Row[]
  patches: Record<string, Row>
  seeded: Record<string, true>
  adopted: string[]
}

// Fictional neighbours who light candles and leave recuerdos in the demo. Never real people.
const NEIGHBOURS = [
  { id: 'd3e00000-0000-4000-8000-000000000001', display_name: 'Rosa', username: 'rosa' },
  { id: 'd3e00000-0000-4000-8000-000000000002', display_name: 'Don Lucho', username: 'lucho' },
  { id: 'd3e00000-0000-4000-8000-000000000003', display_name: 'Camila', username: 'camila' },
  { id: 'd3e00000-0000-4000-8000-000000000004', display_name: 'Pedro', username: 'pedro' },
  { id: 'd3e00000-0000-4000-8000-000000000005', display_name: 'Inés', username: 'ines' },
  { id: 'd3e00000-0000-4000-8000-000000000006', display_name: 'Tomás', username: 'tomas' },
  { id: 'd3e00000-0000-4000-8000-000000000007', display_name: 'Valentina', username: 'vale' },
  { id: 'd3e00000-0000-4000-8000-000000000008', display_name: 'Jorge', username: 'jorge' },
]

const RECUERDOS = [
  'Pasé a dejarle flores camino al trabajo. Siempre hay alguien que le cambia el agua.',
  'Gracias por cuidarnos en esta curva.',
  'Le prendí una vela por mi abuelo, que le tenía mucha fe.',
  'Mi mamá me traía de chica. Sigue igual de bonita.',
  'Le pedí por mi hijo y se cumplió. Vuelvo cada año a darle las gracias.',
  'Alguien le pintó la casita de nuevo. Quedó preciosa.',
  'Que descanses. Nunca falta una vela prendida.',
]

const KEY = (session: string) => `anima-demo:${session}`

function hash(text: string) {
  let h = 2166136261
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}

function empty(): DemoData {
  return {
    profiles: [{ ...DEMO_USER }, ...NEIGHBOURS.map(n => ({ ...n, image: null, role: 'default' }))],
    velas: [],
    comments: [],
    animitas: [],
    patches: {},
    seeded: {},
    adopted: [],
  }
}

export function loadDemo(): DemoData {
  const session = readDemoSession()
  if (!session) return empty()
  try {
    const raw = localStorage.getItem(KEY(session))
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty()
  } catch {
    return empty()
  }
}

export function saveDemo(data: DemoData) {
  const session = readDemoSession()
  if (!session) return
  try {
    localStorage.setItem(KEY(session), JSON.stringify(data))
  } catch {
    // Full storage (big photos): the demo keeps working for this visit, it just won't remember.
  }
}

// The first time an animita is looked at, its candles and recuerdos are made up, always the same ones.
export function seedSite(data: DemoData, siteId: string) {
  if (data.seeded[siteId]) return
  data.seeded[siteId] = true
  const h = hash(siteId)
  const candles = h % 4 === 0 ? 0 : (h % 17) + 1
  for (let i = 0; i < candles; i++) {
    data.velas.push({ id: `seed-vela-${siteId}-${i}`, site_id: siteId, user_id: NEIGHBOURS[(h + i) % NEIGHBOURS.length].id, emoji: '🕯️', created_at: new Date(Date.now() - (i + 1) * 86400000).toISOString() })
  }
  const notes = (h >> 5) % 4
  for (let i = 0; i < notes; i++) {
    data.comments.push({
      id: `seed-recuerdo-${siteId}-${i}`,
      site_id: siteId,
      user_id: NEIGHBOURS[(h >> (i + 2)) % NEIGHBOURS.length].id,
      content: RECUERDOS[(h + i * 3) % RECUERDOS.length],
      created_at: new Date(Date.now() - (i * 5 + (h % 9) + 1) * 3600000).toISOString(),
    })
  }
}

// So the visitor has animitas of their own (and someone leaving recuerdos on them), the demo
// attributes a couple of real ones to them, only inside this browser.
export function adopt(data: DemoData, ids: string[]) {
  if (data.adopted.length) return
  data.adopted = ids.slice(0, 2)
  for (const id of data.adopted) {
    data.patches[id] = { ...(data.patches[id] ?? {}), creator_id: DEMO_USER.id }
    seedSite(data, id)
    data.comments.push({
      id: `seed-aviso-${id}`,
      site_id: id,
      user_id: NEIGHBOURS[hash(id) % NEIGHBOURS.length].id,
      content: 'Qué bueno que la subiste. Yo paso por ahí todos los días.',
      created_at: new Date(Date.now() - 40 * 60000).toISOString(),
    })
  }
}
