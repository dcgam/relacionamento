"use client"

export type Language = "pt" | "es"

export interface Translations {
  // Login Page
  welcome: string
  welcomeSubtitle: string
  startTransformation: string
  enterEmail: string
  emailPlaceholder: string
  password: string
  passwordPlaceholder: string
  confirmPassword: string
  confirmPasswordPlaceholder: string
  securityNotice: string
  startButton: string
  sending: string
  tempPasswordSent: string
  termsNotice: string
  createAccount: string
  alreadyHaveAccount: string
  loginHere: string
  dontHaveAccount: string
  registerHere: string
  passwordMismatch: string
  registering: string
  accountCreated: string
  forgotPassword: string
  forgotPasswordTitle: string
  forgotPasswordDescription: string
  sendResetLink: string
  resetLinkSent: string
  backToLogin: string

  // Dashboard
  hello: string
  logout: string
  renewalProtocol: string
  protocolSubtitle: string
  yourProgress: string
  completedOf: string
  needSupport: string
  supportMessage: string
  contactSupport: string

  // Protocol Status
  new: string
  inProgress: string
  completed: string

  // Protocol Titles
  protocol1Title: string
  protocol1Description: string
  protocol2Title: string
  protocol2Description: string
  protocol3Title: string
  protocol3Description: string
  protocol4Title: string
  protocol4Description: string
  protocol5Title: string
  protocol5Description: string
  protocol6Title: string
  protocol6Description: string

  // Protocol Content
  back: string
  previous: string
  next: string
  markCompleted: string
  finishProtocol: string
  sectionOf: string
  percentCompleted: string
  sectionCompleted: string
  loading: string

  // Time
  minutes: string
}

const translations: Record<Language, Translations> = {
  pt: {
    // Login Page
    welcome: "Renove-se",
    welcomeSubtitle: "Bem-vinda à sua jornada de renovação e fortalecimento dos relacionamentos",
    startTransformation: "Comece sua transformação",
    enterEmail: "Digite seu e-mail para acessar seu protocolo personalizado",
    emailPlaceholder: "seu@email.com",
    password: "Senha",
    passwordPlaceholder: "Sua senha",
    confirmPassword: "Confirmar Senha",
    confirmPasswordPlaceholder: "Digite sua senha novamente",
    securityNotice: "Uma senha temporária será enviada por e-mail para garantir a segurança do seu acesso",
    startButton: "Começar",
    sending: "Enviando...",
    tempPasswordSent: "Uma senha temporária foi enviada para seu e-mail. Verifique sua caixa de entrada.",
    termsNotice: "Ao continuar, você concorda com nossos termos de uso e política de privacidade",
    createAccount: "Criar Conta",
    alreadyHaveAccount: "Já tem uma conta?",
    loginHere: "Entre aqui",
    dontHaveAccount: "Não tem uma conta?",
    registerHere: "Cadastre-se aqui",
    passwordMismatch: "As senhas não coincidem",
    registering: "Criando conta...",
    accountCreated: "Conta criada com sucesso! Redirecionando...",
    forgotPassword: "Esqueci minha senha",
    forgotPasswordTitle: "Recuperar Senha",
    forgotPasswordDescription: "Digite seu e-mail e enviaremos um link para redefinir sua senha",
    sendResetLink: "Enviar link de recuperação",
    resetLinkSent: "Link de recuperação enviado! Verifique seu e-mail.",
    backToLogin: "Voltar ao login",

    // Dashboard
    hello: "Olá",
    logout: "Sair",
    renewalProtocol: "Seu Protocolo de Renovação",
    protocolSubtitle:
      "Siga estas etapas cuidadosamente elaboradas para transformar e fortalecer seu relacionamento. Cada protocolo foi desenvolvido para guiá-la em sua jornada de renovação.",
    yourProgress: "Seu Progresso",
    completedOf: "de 6 concluídos",
    needSupport: "Precisa de apoio adicional?",
    supportMessage: "Lembre-se: cada jornada é única. Vá no seu ritmo e seja gentil consigo mesma.",
    contactSupport: "Falar com Suporte",

    // Protocol Status
    new: "Novo",
    inProgress: "Em andamento",
    completed: "Concluído",

    // Protocol Titles
    protocol1Title: "Etapa 1: Autoconhecimento",
    protocol1Description: "Descubra seus padrões, necessidades e valores fundamentais para relacionamentos saudáveis.",
    protocol2Title: "Etapa 2: Comunicação Consciente",
    protocol2Description: "Aprenda técnicas de comunicação não-violenta e expressão emocional autêntica.",
    protocol3Title: "Etapa 3: Inteligência Emocional",
    protocol3Description: "Desenvolva habilidades para gerenciar emoções e criar conexões mais profundas.",
    protocol4Title: "Etapa 4: Renovação do Vínculo",
    protocol4Description: "Estratégias práticas para reacender a paixão e fortalecer a intimidade.",
    protocol5Title: "Etapa 5: Metas e Compromissos",
    protocol5Description: "Estabeleça objetivos claros e crie um plano de ação para o futuro do relacionamento.",
    protocol6Title: "Recursos Complementares",
    protocol6Description: "Exercícios, meditações guiadas e ferramentas adicionais para sua jornada.",

    // Protocol Content
    back: "Voltar",
    previous: "Anterior",
    next: "Próxima",
    markCompleted: "Marcar como concluída",
    finishProtocol: "Finalizar Protocolo",
    sectionOf: "Seção",
    percentCompleted: "% concluído",
    sectionCompleted: "Seção concluída",
    loading: "Carregando protocolo...",

    // Time
    minutes: "min",
  },
  es: {
    // Login Page
    welcome: "Renové-se",
    welcomeSubtitle: "Bienvenida a tu jornada de renovación y fortalecimiento de las relaciones",
    startTransformation: "Comienza tu transformación",
    enterEmail: "Ingresa tu email para acceder a tu protocolo personalizado",
    emailPlaceholder: "tu@email.com",
    password: "Contraseña",
    passwordPlaceholder: "Tu contraseña",
    confirmPassword: "Confirmar Contraseña",
    confirmPasswordPlaceholder: "Ingresa tu contraseña nuevamente",
    securityNotice: "Se enviará una contraseña temporal por email para garantizar la seguridad de tu acceso",
    startButton: "Comenzar",
    sending: "Enviando...",
    tempPasswordSent: "Se ha enviado una contraseña temporal a tu email. Revisa tu bandeja de entrada.",
    termsNotice: "Al continuar, aceptas nuestros términos de uso y política de privacidade",
    createAccount: "Crear Cuenta",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    loginHere: "Inicia sesión aquí",
    dontHaveAccount: "¿No tienes una cuenta?",
    registerHere: "Regístrate aquí",
    passwordMismatch: "Las contraseñas no coinciden",
    registering: "Creando cuenta...",
    accountCreated: "¡Cuenta creada exitosamente! Redirigiendo...",
    forgotPassword: "Olvidé mi contraseña",
    forgotPasswordTitle: "Recuperar Contraseña",
    forgotPasswordDescription: "Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña",
    sendResetLink: "Enviar enlace de recuperación",
    resetLinkSent: "¡Enlace de recuperación enviado! Revisa tu email.",
    backToLogin: "Volver al login",

    // Dashboard
    hello: "Hola",
    logout: "Salir",
    renewalProtocol: "Tu Protocolo de Renovación",
    protocolSubtitle:
      "Sigue estos pasos cuidadosamente elaborados para transformar y fortalecer tu relación. Cada protocolo fue desarrollado para guiarte en tu jornada de renovación.",
    yourProgress: "Tu Progreso",
    completedOf: "de 6 completados",
    needSupport: "¿Necesitas apoyo adicional?",
    supportMessage: "Recuerda: cada jornada es única. Ve a tu ritmo y sé gentil contigo misma.",
    contactSupport: "Hablar con Soporte",

    // Protocol Status
    new: "Nuevo",
    inProgress: "En progreso",
    completed: "Completado",

    // Protocol Titles
    protocol1Title: "Etapa 1: Autoconocimiento",
    protocol1Description: "Descubre tus patrones, necesidades y valores fundamentales para relaciones saludables.",
    protocol2Title: "Etapa 2: Comunicación Consciente",
    protocol2Description: "Aprende técnicas de comunicación no violenta y expresión emocional auténtica.",
    protocol3Title: "Etapa 3: Inteligencia Emocional",
    protocol3Description: "Desarrolla habilidades para gestionar emociones y crear conexiones más profundas.",
    protocol4Title: "Etapa 4: Renovación del Vínculo",
    protocol4Description: "Estrategias prácticas para reavivar la pasión y fortalecer la intimidad.",
    protocol5Title: "Etapa 5: Metas y Compromisos",
    protocol5Description: "Establece objetivos claros y crea un plan de acción para el futuro de la relación.",
    protocol6Title: "Recursos Complementarios",
    protocol6Description: "Ejercicios, meditaciones guiadas y herramientas adicionales para tu jornada.",

    // Protocol Content
    back: "Volver",
    previous: "Anterior",
    next: "Siguiente",
    markCompleted: "Marcar como completada",
    finishProtocol: "Finalizar Protocolo",
    sectionOf: "Sección",
    percentCompleted: "% completado",
    sectionCompleted: "Sección completada",
    loading: "Cargando protocolo...",

    // Time
    minutes: "min",
  },
}

export function getTranslations(language: Language): Translations {
  return translations[language] || translations.pt
}

export function detectLanguage(): Language {
  if (typeof window === "undefined") return "pt"

  const savedLanguage = localStorage.getItem("userLanguage") as Language
  if (savedLanguage && (savedLanguage === "pt" || savedLanguage === "es")) {
    return savedLanguage
  }

  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith("es")) return "es"
  return "pt"
}

export function useTranslations() {
  const language = detectLanguage()
  return getTranslations(language)
}

export function setLanguage(language: Language) {
  if (typeof window !== "undefined") {
    localStorage.setItem("userLanguage", language)
    window.dispatchEvent(new Event("languageChange"))
  }
}
