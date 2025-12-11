import ClientLayout from '../components/ClientLayout'
import AuthPageClient from '../components/AuthPageClient'
import { DEFAULT_LANGUAGE } from '../lib/language/config'

export default function AuthPage() {
  return (
    <ClientLayout>
      <AuthPageClient initialLang={DEFAULT_LANGUAGE} />
    </ClientLayout>
  )
}
