import { createI18n } from "@inlang/paraglide-next"
import type { AvailableLanguageTag } from "@/paraglide/runtime"
import * as m from "@/paraglide/messages"
import * as runtime from "@/paraglide/runtime"

export const { Link, middleware, useRouter, usePathname, redirect, permanentRedirect, useTranslation } = createI18n({
    messages: m,
    pathnames: {}
})
