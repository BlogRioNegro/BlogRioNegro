-- Seed local (DATA-008): 3 artigos de exemplo. Os arquivos citados nos caminhos não existem no Storage.
-- Cada artigo e seu conteúdo entram no mesmo statement, porque a F3-005 checa o 1:1 no commit.

with article as (
  insert into public.articles (id, slug, title, summary, cover_path, content_type, preview_json, published_at)
  values (
    '11111111-1111-4111-8111-111111111111',
    'renda-fixa-em-2026',
    'Renda fixa em 2026: o que muda para o investidor',
    'Um panorama dos títulos públicos e privados diante da nova trajetória de juros.',
    '11111111-1111-4111-8111-111111111111/a1b2c3d4-0000-4000-8000-000000000001.jpg',
    'rich_text',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Com a nova trajetória da Selic, a renda fixa volta ao centro das carteiras."}]}]}',
    now() - interval '2 days'
  )
  returning id
)
insert into public.article_contents (article_id, body_json, full_pdf_path)
select
  id,
  '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Com a nova trajetória da Selic, a renda fixa volta ao centro das carteiras."}]},{"type":"paragraph","content":[{"type":"text","text":"Texto completo de exemplo, disponível só após o cadastro."}]}]}',
  id || '/a1b2c3d4-0000-4000-8000-000000000002.pdf'
from article;

with article as (
  insert into public.articles (id, slug, title, summary, cover_path, content_type, preview_pdf_path, published_at)
  values (
    '22222222-2222-4222-8222-222222222222',
    'carteira-recomendada-outubro',
    'Carteira recomendada de outubro',
    'Alocação sugerida por perfil de risco para o próximo mês.',
    '22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000001.jpg',
    'pdf',
    '22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000002.pdf',
    now() - interval '1 day'
  )
  returning id
)
insert into public.article_contents (article_id, full_pdf_path)
select id, id || '/b1b2c3d4-0000-4000-8000-000000000003.pdf'
from article;

with article as (
  insert into public.articles (id, slug, title, summary, cover_path, content_type, preview_pdf_path, published_at)
  values (
    '33333333-3333-4333-8333-333333333333',
    'guia-de-previdencia-privada',
    'Guia de previdência privada: PGBL ou VGBL?',
    'Como escolher o plano certo de acordo com a sua declaração de IR.',
    '33333333-3333-4333-8333-333333333333/c1b2c3d4-0000-4000-8000-000000000001.jpg',
    'pdf',
    '33333333-3333-4333-8333-333333333333/c1b2c3d4-0000-4000-8000-000000000002.pdf',
    now()
  )
  returning id
)
insert into public.article_contents (article_id, full_pdf_path)
select id, id || '/c1b2c3d4-0000-4000-8000-000000000003.pdf'
from article;
