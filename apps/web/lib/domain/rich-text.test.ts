import { describe, expect, it } from 'vitest'
import { parseRichText } from './rich-text'

const doc = (...content: unknown[]) => ({ type: 'doc', content })
const paragraph = (...content: unknown[]) => ({ type: 'paragraph', content })
const textNode = (text: string, marks?: unknown[]) => ({ type: 'text', text, marks })
const link = (href: unknown) => ({ type: 'link', attrs: { href } })

describe('parseRichText', () => {
  it('mantém os nós e marcas de ADM-005', () => {
    const blocks = parseRichText(
      doc(
        { type: 'heading', attrs: { level: 2 }, content: [textNode('Título')] },
        { type: 'heading', attrs: { level: 3 }, content: [textNode('Subtítulo')] },
        paragraph(
          textNode('negrito', [{ type: 'bold' }]),
          { type: 'hardBreak' },
          textNode('itálico', [{ type: 'italic' }]),
        ),
        {
          type: 'bulletList',
          content: [{ type: 'listItem', content: [paragraph(textNode('item'))] }],
        },
        {
          type: 'orderedList',
          attrs: { start: 3 },
          content: [{ type: 'listItem', content: [paragraph(textNode('passo'))] }],
        },
        { type: 'blockquote', content: [paragraph(textNode('citação'))] },
        { type: 'image', attrs: { src: 'https://cdn.example/a.png', alt: 'Gráfico' } },
      ),
    )

    expect(blocks.map((block) => block.type)).toEqual([
      'heading',
      'heading',
      'paragraph',
      'bulletList',
      'orderedList',
      'blockquote',
      'image',
    ])
    expect(blocks[2]).toEqual({
      type: 'paragraph',
      content: [
        { type: 'text', text: 'negrito', marks: [{ type: 'bold' }] },
        { type: 'hardBreak' },
        { type: 'text', text: 'itálico', marks: [{ type: 'italic' }] },
      ],
    })
    expect(blocks[4]).toMatchObject({ type: 'orderedList', start: 3 })
    expect(blocks[6]).toEqual({ type: 'image', src: 'https://cdn.example/a.png', alt: 'Gráfico' })
  })

  it('descarta nós e marcas fora da allowlist', () => {
    const blocks = parseRichText(
      doc(
        { type: 'table', content: [paragraph(textNode('célula'))] },
        { type: 'codeBlock', content: [textNode('<script>alert(1)</script>')] },
        { type: 'script', attrs: { src: 'https://evil.example/x.js' } },
        paragraph(
          textNode('texto', [{ type: 'code' }, { type: 'textStyle', attrs: { color: 'red' } }]),
        ),
      ),
    )

    expect(blocks).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'texto', marks: [] }] },
    ])
  })

  it('limita títulos a H2 e H3', () => {
    const levels = [1, 2, 3, 4, 'x'].map((level) => {
      const [block] = parseRichText(doc({ type: 'heading', attrs: { level }, content: [] }))
      return block?.type === 'heading' ? block.level : null
    })

    expect(levels).toEqual([2, 2, 3, 3, 2])
  })

  it.each([
    'javascript:alert(1)',
    ' JavaScript:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '//evil.example',
    '/\\evil.example',
    '',
    42,
  ])('remove o link inseguro %j e mantém o texto', (href) => {
    const [block] = parseRichText(doc(paragraph(textNode('clique', [link(href)]))))

    expect(block).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'clique', marks: [] }],
    })
  })

  it('marca links http(s) como externos e aceita caminhos do site e mailto', () => {
    const marks = ['https://xp.com.br/a', '/artigos/outro', 'mailto:contato@rionegro.example'].map(
      (href) => {
        const [block] = parseRichText(doc(paragraph(textNode('x', [link(href)]))))
        return block?.type === 'paragraph' ? block.content[0] : null
      },
    )

    expect(marks).toEqual([
      {
        type: 'text',
        text: 'x',
        marks: [{ type: 'link', href: 'https://xp.com.br/a', external: true }],
      },
      {
        type: 'text',
        text: 'x',
        marks: [{ type: 'link', href: '/artigos/outro', external: false }],
      },
      {
        type: 'text',
        text: 'x',
        marks: [{ type: 'link', href: 'mailto:contato@rionegro.example', external: false }],
      },
    ])
  })

  it.each(['javascript:alert(1)', 'data:image/svg+xml,<svg onload=alert(1)>', '/relativa.png'])(
    'descarta imagem com src %j',
    (src) => {
      expect(parseRichText(doc({ type: 'image', attrs: { src } }))).toEqual([])
    },
  )

  it.each([null, undefined, 'texto', [], { type: 'paragraph' }, { type: 'doc', content: 'x' }])(
    'entrada que não é um doc (%j) vira lista vazia',
    (json) => {
      expect(parseRichText(json)).toEqual([])
    },
  )
})
