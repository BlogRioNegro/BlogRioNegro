'use client'

import { Alert, Button, Dialog, DialogContent, DialogTrigger, TextField } from '@rio-negro/ui'
import { Download } from '@rio-negro/ui/icons'
import { useId, useState, type FormEvent } from 'react'
import { requestArticleDownload } from '@/app/artigos/[slug]/actions'
import { LEAD_ERROR_MESSAGE, leadSchema } from '@/lib/domain/lead'
import { maskPhone } from '@/lib/domain/phone-mask'
import { Turnstile } from './turnstile'

// LEAD-001 · Modal de lead (spec 04, UI). O estado vive só enquanto o modal está aberto: fechar
// desmonta o formulário e descarta os dados (LEAD-011). Nada vai para storage, URL ou console.

type Field = 'name' | 'email' | 'phone' | 'consent'
const FIELD_ORDER: Field[] = ['name', 'email', 'phone', 'consent']

type Values = {
  name: string
  email: string
  phone: string
  consent: boolean
  marketingOptIn: boolean
}
const EMPTY: Values = { name: '', email: '', phone: '', consent: false, marketingOptIn: false }

export type LeadArticle = { id: string; title: string; format: 'PDF' | 'Texto' }

type Props = { article: LeadArticle; turnstileSiteKey: string }

function isField(key: PropertyKey | undefined): key is Field {
  return FIELD_ORDER.some((field) => field === key)
}

function startDownload(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()
}

function LeadForm({ article, turnstileSiteKey }: Props) {
  const id = useId()
  const fieldId = (field: Field) => `${id}-${field}`
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [token, setToken] = useState('')
  const [turnstileReset, setTurnstileReset] = useState(0)

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    if (isField(key)) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function failSubmit(message: string) {
    setFormError(message)
    setTurnstileReset((count) => count + 1)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const input = { articleId: article.id, ...values, turnstileToken: token }
    const parsed = leadSchema.safeParse(input)
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (isField(key)) next[key] ??= issue.message
      }
      setErrors(next)
      const first = FIELD_ORDER.find((field) => next[field])
      if (first) document.getElementById(fieldId(first))?.focus()
      else failSubmit(LEAD_ERROR_MESSAGE)
      return
    }

    setErrors({})
    setFormError(null)
    setSubmitting(true)
    const result = await requestArticleDownload(input).catch(() => null)
    setSubmitting(false)

    if (!result?.ok) return failSubmit(result?.error ?? LEAD_ERROR_MESSAGE)
    startDownload(result.data.url)
  }

  return (
    <DialogContent
      title="Baixe o artigo completo"
      description={`${article.title} · ${article.format}`}
      onOpenAutoFocus={(event) => {
        event.preventDefault()
        document.getElementById(fieldId('name'))?.focus()
      }}
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <TextField
          id={fieldId('name')}
          label="Nome"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          disabled={submitting}
          onChange={(event) => update('name', event.target.value)}
        />
        <TextField
          id={fieldId('email')}
          label="E-mail"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          disabled={submitting}
          onChange={(event) => update('email', event.target.value)}
        />
        <TextField
          id={fieldId('phone')}
          label="Telefone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="(99) 99999-9999"
          help="Com DDD. Ex.: (11) 91234-5678"
          value={values.phone}
          error={errors.phone}
          disabled={submitting}
          onChange={(event) => update('phone', maskPhone(event.target.value))}
        />
        <Turnstile siteKey={turnstileSiteKey} resetKey={turnstileReset} onToken={setToken} />
        {formError ? <Alert variant="error" title={formError} /> : null}
        {/* Mobile: o botão fica fixo no rodapé enquanto o corpo rola (spec 04, Layout). */}
        <div className="sticky -bottom-6 -mx-6 mt-auto border-t border-border bg-surface p-4 md:static md:mx-0 md:border-0 md:p-0">
          <Button type="submit" block loading={submitting}>
            {submitting ? 'Enviando…' : 'Baixar artigo completo'}
            {submitting ? null : <Download aria-hidden className="size-5" />}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}

/** Botão "Baixar artigo completo" da página do artigo e o modal que ele abre. */
export function LeadDialog(props: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          Baixar artigo completo
          <Download aria-hidden className="size-5" />
        </Button>
      </DialogTrigger>
      {open ? <LeadForm {...props} /> : null}
    </Dialog>
  )
}
