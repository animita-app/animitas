export const AUTH_COPY = {
  page: {
    footer: 'Al continuar, aceptas nuestros términos y condiciones.',
  },
  steps: {
    1: {
      title: 'Pon tu número',
      description: 'Te enviaremos un código de verificación por SMS',
    },
    2: {
      title: 'Ingresa el código por SMS',
      description: 'Revisa tu teléfono para ver el código',
    },
    3: {
      title: 'Ingresa tu nombre',
      description: 'Este será tu nombre público en la plataforma',
    },
    4: {
      title: 'Elige un nombre de usuario',
      description: 'Tu identificador único, no podrás cambiarlo después',
    },
  },
  phone: {
    label: 'Número de Teléfono',
    placeholder: '9 1234 5678',
    addon: '+56',
    description: 'Revisa tu SMS',
    button: 'Enviar Código',
    buttonLoading: 'Enviando...',
    error: {
      minDigits: 'El teléfono debe tener al menos 9 dígitos',
      maxDigits: 'El teléfono debe tener 9 dígitos',
      invalidFormat: 'Solo se permiten números',
    },
  },
  code: {
    label: 'Código de Verificación',
    description: (phone: string) => `Ingresa el código que recibiste en ${phone}`,
    button: 'Verificar',
    buttonLoading: 'Verificando...',
    backButton: 'Volver',
    error: {
      invalidCode: 'Código de verificación inválido',
      length: 'El código debe tener 6 dígitos',
      invalidFormat: 'El código debe contener solo números',
    },
  },
  onboarding: {
    displayName: {
      label: 'Nombre',
      placeholder: 'Tu nombre completo',
      description: 'Tu nombre aparecerá en tu perfil',
      error: {
        required: 'El nombre es requerido',
        minLength: 'El nombre debe tener al menos 2 caracteres',
      },
    },
    username: {
      label: 'Nombre de Usuario',
      placeholder: 'usuario',
      addon: '@',
      description: 'Tu identificador único en la plataforma',
      available: 'Disponible',
      unavailable: 'No disponible',
      checking: 'Verificando disponibilidad...',
      error: {
        minLength: 'El nombre de usuario debe tener al menos 3 caracteres',
        maxLength: 'El nombre de usuario no puede exceder 20 caracteres',
        invalidFormat: 'Solo se permiten letras minúsculas, números, guiones y guiones bajos',
        notAvailable: 'El nombre de usuario ya está en uso',
      },
    },
    profilePicture: {
      button: 'Subir foto',
      buttonChange: 'Cambiar foto',
      buttonUploading: 'Subiendo...',
    },
    button: 'Completar Registro',
    buttonLoading: 'Completando...',
    footer: 'Puedes cambiar estos datos después en tu perfil',
  },
  stepFormat: (current: number, total: number) => `Paso ${current} de ${total}`,
}
