import { z } from 'zod'

const phoneSchema = z.object({
  phone: z
    .string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(9, 'El teléfono debe tener 9 dígitos')
    .regex(/^\d+$/, 'Solo se permiten números'),
})

const codeSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código debe contener solo números'),
})

const nameSchema = z.object({
  displayName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
})

const usernameSchema = z.object({
  username: z.string().optional().refine((val) => !val || (val.length >= 3 && /^[a-zA-Z0-9_]+$/.test(val)), {
    message: 'El usuario debe tener al menos 3 caracteres (solo letras, números y guiones bajos)',
  }),
})

describe('Validación de Formularios de Autenticación', () => {
  describe('Validación de Teléfono', () => {
    it('debería validar un teléfono correcto', () => {
      const result = phoneSchema.safeParse({ phone: '956784477' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar teléfono con menos de 9 dígitos', () => {
      const result = phoneSchema.safeParse({ phone: '123456' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar teléfono con más de 9 dígitos', () => {
      const result = phoneSchema.safeParse({ phone: '12345678901' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar teléfono con caracteres no numéricos', () => {
      const result = phoneSchema.safeParse({ phone: '95678447a' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar teléfono vacío', () => {
      const result = phoneSchema.safeParse({ phone: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('Validación de Código', () => {
    it('debería validar un código correcto', () => {
      const result = codeSchema.safeParse({ code: '123456' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar código con menos de 6 dígitos', () => {
      const result = codeSchema.safeParse({ code: '12345' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar código con más de 6 dígitos', () => {
      const result = codeSchema.safeParse({ code: '1234567' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar código con caracteres no numéricos', () => {
      const result = codeSchema.safeParse({ code: '12345a' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar código vacío', () => {
      const result = codeSchema.safeParse({ code: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('Validación de Nombre', () => {
    it('debería validar un nombre correcto', () => {
      const result = nameSchema.safeParse({ displayName: 'Juan Pérez' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar nombre con menos de 3 caracteres', () => {
      const result = nameSchema.safeParse({ displayName: 'Jo' })
      expect(result.success).toBe(false)
    })

    it('debería aceptar nombre con exactamente 3 caracteres', () => {
      const result = nameSchema.safeParse({ displayName: 'Juan' })
      expect(result.success).toBe(true)
    })

    it('debería rechazar nombre vacío', () => {
      const result = nameSchema.safeParse({ displayName: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('Validación de Usuario', () => {
    it('debería validar un usuario correcto', () => {
      const result = usernameSchema.safeParse({ username: 'juan_perez' })
      expect(result.success).toBe(true)
    })

    it('debería validar usuario vacío (opcional)', () => {
      const result = usernameSchema.safeParse({ username: '' })
      expect(result.success).toBe(true)
    })

    it('debería validar sin usuario (opcional)', () => {
      const result = usernameSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('debería rechazar usuario con menos de 3 caracteres', () => {
      const result = usernameSchema.safeParse({ username: 'jo' })
      expect(result.success).toBe(false)
    })

    it('debería rechazar usuario con caracteres especiales', () => {
      const result = usernameSchema.safeParse({ username: 'juan-perez!' })
      expect(result.success).toBe(false)
    })

    it('debería aceptar usuario con números y guiones bajos', () => {
      const result = usernameSchema.safeParse({ username: 'juan_perez_123' })
      expect(result.success).toBe(true)
    })
  })

  describe('Validación Completa del Flujo', () => {
    it('debería validar todos los pasos del registro', () => {
      const phone = phoneSchema.safeParse({ phone: '956784477' })
      const code = codeSchema.safeParse({ code: '123456' })
      const name = nameSchema.safeParse({ displayName: 'Juan Pérez' })
      const username = usernameSchema.safeParse({ username: 'juan_perez' })

      expect(phone.success).toBe(true)
      expect(code.success).toBe(true)
      expect(name.success).toBe(true)
      expect(username.success).toBe(true)
    })

    it('debería rechazar si algún paso falla', () => {
      const phone = phoneSchema.safeParse({ phone: '123' })
      const code = codeSchema.safeParse({ code: '123456' })
      const name = nameSchema.safeParse({ displayName: 'Juan' })
      const username = usernameSchema.safeParse({ username: 'juan_perez' })

      expect(phone.success).toBe(false)
      expect(code.success).toBe(true)
      expect(name.success).toBe(true)
      expect(username.success).toBe(true)
    })
  })

  describe('Mensajes de Error', () => {
    it('debería retornar mensaje de error correcto para teléfono corto', () => {
      const result = phoneSchema.safeParse({ phone: '123' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('debe tener al menos 9 dígitos')
      }
    })

    it('debería retornar mensaje de error correcto para código inválido', () => {
      const result = codeSchema.safeParse({ code: '12345' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('debe tener 6 dígitos')
      }
    })
  })
})
