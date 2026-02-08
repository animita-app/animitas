import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

interface SeedUser {
  email: string
  password: string
  role: 'default' | 'editor' | 'superadmin'
  fullName: string
}

const REQUIRED_ENV_VARS = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
if (missing.length) {
  console.error(`Missing required env vars for seeding users: ${missing.join(', ')}`)
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const USERS: SeedUser[] = [
  {
    email: 'default@test.dev',
    password: 'password123',
    role: 'default',
    fullName: 'Visitante QA',
  },
  {
    email: 'editor@test.dev',
    password: 'password123',
    role: 'editor',
    fullName: 'Editora Territorio',
  },
  {
    email: 'superadmin@test.dev',
    password: 'password123',
    role: 'superadmin',
    fullName: 'Equipo ÁNIMA',
  },
]

async function upsertProfile(userId: string, seed: SeedUser) {
  const { error } = await adminClient.from('profiles').upsert({
    id: userId,
    role: seed.role,
    full_name: seed.fullName,
    research_mode: seed.role !== 'default',
  })

  if (error) {
    throw error
  }
}

async function seedUser(seed: SeedUser) {
  const { data: list, error: listError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) throw listError

  const existing = list.users.find((user) => user.email === seed.email)

  if (existing) {
    await upsertProfile(existing.id, seed)
    console.log(`✔︎ ${seed.email} already exists; profile ensured`)
    return
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email: seed.email,
    password: seed.password,
    email_confirm: true,
    user_metadata: {
      full_name: seed.fullName,
    },
    app_metadata: {
      role: seed.role,
    },
  })

  if (error || !data?.user) {
    throw error || new Error(`Supabase did not return user for ${seed.email}`)
  }

  await upsertProfile(data.user.id, seed)
  console.log(`✔︎ Created ${seed.email} (${seed.role})`)
}

async function main() {
  for (const seed of USERS) {
    try {
      await seedUser(seed)
    } catch (error) {
      console.error(`✖ Failed to seed ${seed.email}`, error)
      process.exitCode = 1
    }
  }

  if (process.exitCode && process.exitCode !== 0) {
    process.exit(process.exitCode)
  } else {
    console.log('Seed users ready.')
  }
}

main()
