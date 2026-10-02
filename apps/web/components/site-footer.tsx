import { Phone } from '@rio-negro/ui/icons'
import { Logo } from './logo'
import { FacebookIcon, InstagramIcon, LinkedinIcon } from './social-icons'

// PUB-013 · Cópia do rodapé de rionegroinvestimentos.com.br (2026-10-01). Não editar à mão.
const DISCLAIMER =
  'A Rio Negro Assessoria de Investimentos Ltda, inscrita sob o CNPJ 33.457.321/0001-79 é uma empresa de Assessoria de Investimento devidamente registrada na Comissão de Valores Mobiliários na forma da Resolução CVM 178/23 (“Sociedade”), que mantém contrato de distribuição de produtos financeiros com a XP Investimentos Corretora de Câmbio, Títulos e Valores Mobiliários S.A. (“XP”) e pode, por conta e ordem dos seus clientes, operar no mercado de capitais segundo a legislação vigente. Na forma da legislação da CVM, o Assessor de Investimento não pode administrar ou gerir o patrimônio de investidores. O investimento em ações é um investimento de risco e rentabilidade passada não é garantia de rentabilidade futura. Na realização de operações com derivativos existe a possibilidade de perdas superiores aos valores investidos, podendo resultar em significativas perdas patrimoniais. A Sociedade poderá exercer atividades complementares relacionadas aos mercados financeiro, securitário, de previdência e capitalização, desde que não conflitem com a atividade de assessoria de investimentos, podendo ser realizada por meio da pessoa jurídica acima descrita ou por meio de pessoa jurídica terceira. Todas as atividades são prestadas mantendo a devida segregação e em cumprimento ao quanto previsto nas regras da CVM ou de outros órgãos reguladores e autorreguladores. Para informações e dúvidas sobre produtos contacte seu assessor de investimentos. Para reclamações, contacte a Ouvidoria da XP pelo telefone 0800 722 3730.'

const SITE_URL = 'https://rionegroinvestimentos.com.br'

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/Rio-Negro-Investimentos-1539096529556165/',
    icon: <FacebookIcon />,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/rionegroinvestimentos/',
    icon: <InstagramIcon />,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/rio-negro-investimentos/',
    icon: <LinkedinIcon />,
  },
]

const FOCUS = 'focus-visible:outline-footer-text'
const LINK = `underline-offset-4 hover:underline ${FOCUS}`

export function SiteFooter() {
  return (
    <footer className="bg-footer-bg text-footer-text">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 md:px-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <Logo alt="Rio Negro Investimentos" variant="branco" />
            <ul className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex size-8 items-center justify-center rounded-full bg-footer-accent text-footer-bg hover:bg-footer-accent-hover ${FOCUS}`}
                  >
                    {icon}
                    <span className="sr-only">{label} (abre em nova aba)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[11px] leading-normal uppercase lg:whitespace-nowrap">
            © {new Date().getFullYear()} Copyright Rio Negro Investimentos • Todos os direitos
            reservados
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <nav
            aria-label="Contato e links institucionais"
            className="flex flex-wrap justify-between gap-x-8 gap-y-3 font-serif text-sm uppercase"
          >
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <li>
                <a href="tel:+556733048380" className={`inline-flex items-center gap-2 ${LINK}`}>
                  <Phone aria-hidden className="size-4 text-footer-accent" />
                  (67) 3304-8380
                </a>
              </li>
              <li>
                <a href="tel:08007223730" className={LINK}>
                  Ouvidoria XP: 0800 722 3730
                </a>
              </li>
            </ul>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <li>
                <a
                  href={`${SITE_URL}/contato/#trabalhe_conosco`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  Trabalhe conosco
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </li>
              <li>
                <a
                  href={`${SITE_URL}/politica-de-privacidade/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  Política de privacidade
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </li>
            </ul>
          </nav>
          <p className="text-[11px] leading-[1.4]">{DISCLAIMER}</p>
        </div>
      </div>
    </footer>
  )
}
