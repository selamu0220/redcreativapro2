declare interface QuestionnaireQuestion {
  id: string
  label: string
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea'
  placeholder?: string
  options?: string[]
  required: boolean
}

declare interface Questionnaire {
  id: string
  title: string
  description: string
  isActive: boolean
  questions: QuestionnaireQuestion[]
  userEmail?: string
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}
