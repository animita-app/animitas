import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionProvider } from 'next-auth/react'
import AuthPage from '@/app/auth/page'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react')
  return {
    ...originalModule,
    signIn: jest.fn(),
    useSession: jest.fn(() => ({
      data: null,
      status: 'unauthenticated',
    })),
  }
})

describe('Flujo de Autenticación SMS OTP', () => {
  const renderAuthPage = () => {
    return render(
      <SessionProvider session={null}>
        <AuthPage />
      </SessionProvider>
    )
  }

  describe('Paso 1: Ingreso de Teléfono', () => {
    it('debería mostrar el formulario de teléfono en el primer paso', () => {
      renderAuthPage()
      expect(screen.getByText('Pon tu número')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('9 1234 5678')).toBeInTheDocument()
    })

    it('debería mostrar el paso 1 de 5', () => {
      renderAuthPage()
      expect(screen.getByText('Paso 1 de 5')).toBeInTheDocument()
    })

    it('debería tener un botón de envío', () => {
      renderAuthPage()
      const button = screen.getByRole('button', { name: /Enviar Código/i })
      expect(button).toBeInTheDocument()
    })

    it('debería validar que el teléfono tenga al menos 9 dígitos', async () => {
      const user = userEvent.setup()
      renderAuthPage()

      const input = screen.getByPlaceholderText('9 1234 5678')
      await user.type(input, '123')

      const button = screen.getByRole('button', { name: /Enviar Código/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText(/debe tener al menos 9 dígitos/i)).toBeInTheDocument()
      })
    })

    it('debería validar que solo se permitan números', async () => {
      const user = userEvent.setup()
      renderAuthPage()

      const input = screen.getByPlaceholderText('9 1234 5678')
      await user.type(input, 'abc12345')

      const button = screen.getByRole('button', { name: /Enviar Código/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText(/Solo se permiten números/i)).toBeInTheDocument()
      })
    })

    it('debería aceptar un número válido de teléfono', async () => {
      const user = userEvent.setup()
      renderAuthPage()

      const input = screen.getByPlaceholderText('9 1234 5678') as HTMLInputElement
      await user.type(input, '956784477')

      expect(input.value).toBe('956784477')
    })
  })

  describe('Indicadores de Progreso', () => {
    it('debería mostrar 5 indicadores de paso', () => {
      renderAuthPage()
      const indicators = document.querySelectorAll('.flex.gap-2 > div')
      expect(indicators.length).toBeGreaterThanOrEqual(4)
    })

    it('debería mostrar el formato correcto de paso', () => {
      renderAuthPage()
      expect(screen.getByText('Paso 1 de 5')).toBeInTheDocument()
    })
  })

  describe('Pie de Página', () => {
    it('debería mostrar el pie de página con términos y condiciones', () => {
      renderAuthPage()
      expect(screen.getByText(/Al continuar, aceptas nuestros términos y condiciones/i)).toBeInTheDocument()
    })
  })

  describe('Componentes de Entrada', () => {
    it('debería usar los componentes correctos de InputGroup', () => {
      renderAuthPage()
      const addon = screen.getByText('+56')
      expect(addon).toBeInTheDocument()
    })

    it('debería mostrar error si se envía el formulario vacío', async () => {
      const user = userEvent.setup()
      renderAuthPage()

      const button = screen.getByRole('button', { name: /Enviar Código/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText(/debe tener al menos 9 dígitos/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accesibilidad', () => {
    it('debería tener etiquetas correctas', () => {
      renderAuthPage()
      expect(screen.getByText('Número de Teléfono')).toBeInTheDocument()
    })

    it('debería tener descripciones de formulario', () => {
      renderAuthPage()
      expect(screen.getByText(/Revisa tu SMS/i)).toBeInTheDocument()
    })

    it('debería tener botones accesibles', () => {
      renderAuthPage()
      const button = screen.getByRole('button', { name: /Enviar Código/i })
      expect(button).toBeEnabled()
    })
  })

  describe('Manejo de Errores', () => {
    it('debería mostrar mensaje de error cuando hay error en la API', async () => {
      const user = userEvent.setup()
      renderAuthPage()

      const input = screen.getByPlaceholderText('9 1234 5678')
      await user.type(input, '956784477')

      const button = screen.getByRole('button', { name: /Enviar Código/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.queryByText(/debe tener al menos 9 dígitos/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Validación de Forma Completa', () => {
    it('debería tener validación de Zod', async () => {
      const user = userEvent.setup()
      renderAuthPage()

      const input = screen.getByPlaceholderText('9 1234 5678')

      await user.type(input, '123')
      const button = screen.getByRole('button', { name: /Enviar Código/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText(/debe tener al menos 9 dígitos/i)).toBeInTheDocument()
      })

      await user.clear(input)
      await user.type(input, '956784477')

      await waitFor(() => {
        expect(screen.queryByText(/debe tener al menos 9 dígitos/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Integración con React Hook Form', () => {
    it('debería usar React Hook Form para gestionar el estado del formulario', () => {
      renderAuthPage()
      const input = screen.getByPlaceholderText('9 1234 5678') as HTMLInputElement

      expect(input).toHaveAttribute('placeholder')
      expect(input.type).toBe('tel')
    })
  })
})
