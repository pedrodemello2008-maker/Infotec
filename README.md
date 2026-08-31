# GreenShot — Projeto Unificado (Site + App, HTML/CSS/JS puros)

Este projeto reúne, em um único lugar, o **site institucional** (landing page)
e o **aplicativo** GreenShot, sem nenhum framework, build ou dependência —
apenas HTML, CSS e JavaScript puros. Funciona abrindo direto num navegador e
também é **instalável como PWA** (ícone na tela inicial, tela cheia, uso
offline).

## Estrutura de arquivos

```
index.html          Site institucional (landing page): hero, como funciona,
                     funcionalidades, showcase do app, benefícios, para
                     empresas, comparativo, depoimentos, FAQ, CTA final
app.html             O aplicativo em si: splash, onboarding, login,
                     dashboard, ecossistema 3D, academia, mercado de
                     impacto e perfil — navegação por abas, dados
                     mockados, tudo funcional em uma única página
styles.css           Design system compartilhado (cores da marca, tipografia,
                     dark/light mode, botões, cards) — usado pelas duas páginas
app.css              Estilos exclusivos das telas do app (moldura de
                     dispositivo, tabbar, folha de registrar ação, etc.)
script.js            Interações do site (scroll reveal, contadores, showcase
                     do app, acordeão do FAQ, partículas, floresta do hero)
app.js               Lógica do app (navegação entre telas, gamificação,
                     ecossistema 3D, registro de service worker, banner de
                     instalação, status offline)
ecosystem-3d.js       Motor 3D do ecossistema (Three.js) — 5 estágios, do
                     deserto ao Monte Parnaso, conforme o progresso do usuário
manifest.json        Metadados do PWA (ícone, nome, cor do tema, modo
                     standalone) — abre em app.html ao instalar
service-worker.js     Cache offline (estratégia cache-first) para todos os
                     arquivos do projeto
assets/              Logo, favicon e ícones em vários tamanhos
```

## Como navegar

- **`index.html`** é a porta de entrada pública — o site que apresenta o
  projeto, com um botão **"Abrir App"** no menu e **"Começar Agora"** no CTA
  final, ambos levando a `app.html`.
- **`app.html`** é o aplicativo completo, com sua própria barra de abas
  (Início · Floresta · Academia · Mercado · Perfil) e um link **"← Site"** no
  canto para voltar à landing page.
- Em telas largas, o app aparece dentro de uma moldura de celular decorativa
  (só para visualização); em celulares de verdade ou quando instalado como
  PWA, ele ocupa a tela toda.

## Como testar localmente

PWAs precisam ser servidos por HTTP (o service worker não funciona abrindo o
arquivo direto com duplo clique):

```bash
cd greenshot
python3 -m http.server 8080
```

Depois abra `http://localhost:8080` (site) ou
`http://localhost:8080/app.html` (app direto) no navegador.

## Como publicar e instalar de verdade

Qualquer serviço gratuito de hospedagem estática publica os arquivos como
estão (GitHub Pages, Netlify, Vercel, Firebase Hosting). Depois de publicado,
em HTTPS:

- **Android (Chrome):** visitar `app.html` mostra o banner "Instale o
  GreenShot" automaticamente, ou use o menu ⋮ → "Instalar app".
- **iPhone (Safari):** abra `app.html` → Compartilhar (□↑) → "Adicionar à
  Tela de Início" (o Safari não dispara o banner automático).

## O que foi unido nesta versão

Você enviou, em momentos diferentes, três variações do projeto: o site
institucional completo (`script.js`), uma versão do app com ecossistema 3D em
Three.js (`app.js` + `ecosystem-3d.js`) e uma versão anterior mais simples do
app (floresta em SVG, sem instalação como PWA). Como o HTML e o CSS de cada
uma foram enviados com nomes repetidos, apenas a versão mais recente de cada
arquivo permaneceu acessível — por isso, as telas do app (`app.html` e as
partes de `app.css`) foram **reconstruídas do zero**, usando `app.js`,
`ecosystem-3d.js` e as descrições dos READMEs anteriores como referência, e
seguindo a mesma identidade visual do site (cores, tipografia Clash
Display/Satoshi/IBM Plex Mono, glassmorphism).

## Limitações desta versão

- Os dados do app (XP, tokens, progresso do ecossistema, investimentos)
  ficam só na memória da página — ao recarregar, tudo volta ao estado
  inicial. Para persistir entre sessões, o próximo passo natural é salvar o
  estado em `localStorage` ou `IndexedDB`.
- Não há conexão com um backend real. Dados reais e compartilhados entre
  dispositivos exigiriam um backend + autenticação.
- Notificações push de verdade exigem um servidor de push e permissão do
  usuário — não incluídas aqui (o painel de notificações do app é só uma
  lista estática de demonstração).
- Como o Three.js do ecossistema 3D vem de um CDN externo, é necessário
  estar online no primeiro carregamento da tela "Floresta"; depois disso o
  service worker tenta guardar esse arquivo em cache.
