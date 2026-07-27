import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

import Button from '../components/ui/Button';

const navLinks = [
  { label: 'Recursos', href: '/#recursos' },
  { label: 'Como funciona', href: '/#como-funciona' },
  { label: 'Planos', href: '/#planos' },
  { label: 'Segurança', href: '/#seguranca' },
];

const sections = [
  {
    id: 'introducao',
    title: '1. Introdução',
    content:
      'O Finance AI respeita a privacidade dos seus usuários e está comprometido com a proteção dos dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD). Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações ao utilizar nossa plataforma.',
  },
  {
    id: 'dados-coletados',
    title: '2. Dados coletados',
    content: null,
    items: [
      'Nome',
      'E-mail',
      'Senha criptografada',
      'Dados financeiros cadastrados pelo usuário (contas, cartões, transações, categorias, metas e orçamentos)',
      'Informações técnicas do dispositivo',
      'Endereço IP',
      'Logs de acesso',
    ],
    observation:
      'Ressaltamos que nenhuma informação bancária é acessada sem autorização explícita do usuário. O Finance AI não se conecta diretamente a instituições financeiras sem o seu consentimento.',
  },
  {
    id: 'uso-dados',
    title: '3. Como utilizamos os dados',
    content: null,
    items: [
      'Funcionamento da plataforma',
      'Autenticação e segurança da conta',
      'Sincronização entre dispositivos',
      'Geração de relatórios financeiros',
      'Melhoria da experiência do usuário',
      'Suporte técnico',
      'Prevenção de fraudes',
    ],
  },
  {
    id: 'compartilhamento',
    title: '4. Compartilhamento de dados',
    content:
      'O Finance AI nunca vende dados pessoais dos usuários. Suas informações somente poderão ser compartilhadas quando houver obrigação legal ou quando necessário para a prestação dos serviços, como com provedores de hospedagem e infraestrutura que seguem rigorosos padrões de segurança e confidencialidade.',
  },
  {
    id: 'seguranca',
    title: '5. Segurança das informações',
    content:
      'A segurança dos seus dados é uma prioridade. O Finance AI adota boas práticas de segurança, incluindo:',
    items: [
      'HTTPS em todas as comunicações',
      'Criptografia de ponta a ponta',
      'Senhas armazenadas com hash bcrypt',
      'Autenticação segura via JWT em cookie httpOnly',
      'Controle de acesso baseado em papéis',
      'Monitoramento contínuo de segurança',
    ],
  },
  {
    id: 'cookies',
    title: '6. Cookies',
    content:
      'Utilizamos apenas cookies essenciais para o funcionamento da plataforma, incluindo autenticação, manutenção da sessão e funcionamento correto da aplicação. Não utilizamos cookies para rastreamento, publicidade ou venda de dados pessoais.',
  },
  {
    id: 'direitos',
    title: '7. Direitos do usuário',
    content:
      'Em conformidade com a LGPD, você possui os seguintes direitos sobre seus dados pessoais:',
    items: [
      'Acesso aos dados armazenados',
      'Correção de informações incompletas ou desatualizadas',
      'Exclusão da conta e dados associados',
      'Portabilidade dos dados para outro serviço',
      'Revogação do consentimento a qualquer momento',
      'Informações sobre o tratamento dos dados',
    ],
  },
  {
    id: 'retencao',
    title: '8. Retenção dos dados',
    content:
      'Seus dados permanecerão armazenados enquanto sua conta estiver ativa ou pelo período exigido por lei. Ao solicitar a exclusão da conta, os dados serão removidos ou anonimizados, exceto aqueles que precisam ser mantidos por obrigação legal.',
  },
  {
    id: 'contato',
    title: '9. Contato',
    content: null,
    contact: true,
  },
  {
    id: 'alteracoes',
    title: '10. Alterações nesta política',
    content:
      'Esta Política de Privacidade poderá ser atualizada periodicamente para refletir mudanças em nossas práticas ou na legislação aplicável. A data da última atualização será sempre informada no topo desta página.',
  },
];

const today = new Date();
const lastUpdate = today.toLocaleDateString('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Política de Privacidade | Finance AI';

    const metaDescription = document.querySelector('meta[name="description"]');
    const existingMeta = metaDescription;
    if (existingMeta) {
      existingMeta.setAttribute(
        'content',
        'Conheça como o Finance AI protege seus dados pessoais e financeiros em conformidade com a Lei Geral de Proteção de Dados (LGPD).'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content =
        'Conheça como o Finance AI protege seus dados pessoais e financeiros em conformidade com a Lei Geral de Proteção de Dados (LGPD).';
      document.head.appendChild(meta);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Política de Privacidade | Finance AI');
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = 'Política de Privacidade | Finance AI';
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute(
        'content',
        'Conheça como o Finance AI protege seus dados pessoais e financeiros em conformidade com a Lei Geral de Proteção de Dados (LGPD).'
      );
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content =
        'Conheça como o Finance AI protege seus dados pessoais e financeiros em conformidade com a Lei Geral de Proteção de Dados (LGPD).';
      document.head.appendChild(meta);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://app.financeai.orderup.com.br/privacy');
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      meta.content = 'https://app.financeai.orderup.com.br/privacy';
      document.head.appendChild(meta);
    }

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) {
      ogType.setAttribute('content', 'website');
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:type');
      meta.content = 'website';
      document.head.appendChild(meta);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://app.financeai.orderup.com.br/privacy');
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = 'https://app.financeai.orderup.com.br/privacy';
      document.head.appendChild(link);
    }

    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      robots.setAttribute('content', 'index, follow');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'index, follow';
      document.head.appendChild(meta);
    }

    return () => {
      document.title = 'FinanceAI';
    };
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] transition-colors">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Finance AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex">
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Entrar
              </Button>
            </div>
            <Button as={Link} to="/register" size="sm" className="whitespace-nowrap text-xs sm:text-sm">
              Começar grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Privacy Policy Content */}
        <div className="mx-auto max-w-3xl py-12 sm:py-16">
          {/* Header */}
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
              Legal
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Política de Privacidade
            </h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Última atualização: {lastUpdate}
            </p>
          </div>

          {/* Sections */}
          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {section.title}
                </h2>

                {section.content && (
                  <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">
                    {section.content}
                  </p>
                )}

                {section.items && (
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-base leading-7 text-slate-700 dark:text-slate-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.observation && (
                  <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm leading-6 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                    {section.observation}
                  </p>
                )}

                {section.contact && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-base leading-7 text-slate-700 dark:text-slate-300">
                      Em caso de dúvidas, solicitações ou exercício dos seus direitos, entre em contato conosco:
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                      E-mail:{' '}
                      <a
                        href="mailto:contato@orderup.com.br"
                        className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition dark:text-emerald-400 dark:hover:text-emerald-300"
                      >
                        contato@orderup.com.br
                      </a>
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Back to Home Button */}
          <div className="mt-12 flex justify-center">
            <Button as={Link} to="/" variant="secondary" size="lg">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-10 dark:border-slate-800">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Finance AI
                </span>
              </Link>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Sua plataforma de finanças pessoais inteligente, segura e moderna.
              </p>
            </div>

            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Links
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/#recursos"
                    className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Recursos
                  </Link>
                  <Link
                    to="/#seguranca"
                    className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Segurança
                  </Link>
                  <Link
                    to="/privacy"
                    className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Política de Privacidade
                  </Link>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Produto
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    to="/#como-funciona"
                    className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Como funciona
                  </Link>
                  <Link
                    to="/#planos"
                    className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Planos
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} Finance AI. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
