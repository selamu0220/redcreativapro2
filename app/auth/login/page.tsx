import { redirect } from 'next/navigation'

export default function LoginRedirectPage({ searchParams }: { searchParams?: { redirect?: string } }) {
  const targetUrl = searchParams?.redirect ? `/auth?redirect=${encodeURIComponent(searchParams.redirect)}` : '/auth'
  redirect(targetUrl)
}
