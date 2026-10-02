import logoBranco from './logo-branco.png'
import logoEscuro from './logo-escuro.png'

const LOGOS = { escuro: logoEscuro, branco: logoBranco }

// <img> em vez de next/image: o next/image injeta style inline, que a CSP bloqueia (ADR 0020).
export function Logo({ alt, variant = 'escuro' }: { alt: string; variant?: keyof typeof LOGOS }) {
  const logo = LOGOS[variant]
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ver comentário acima
    <img src={logo.src} width={logo.width} height={logo.height} alt={alt} className="h-7 w-auto" />
  )
}
