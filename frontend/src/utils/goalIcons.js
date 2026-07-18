import {
  Laptop,
  Plane,
  ShieldCheck,
  Home,
  Car,
  CreditCard,
  Target,
  GraduationCap,
  Heart,
  Building2,
  PiggyBank,
  Wallet,
  TrendingUp,
  Umbrella,
  Gem,
  Bike,
  Ship,
  Tv,
  Smartphone,
  Music,
  Camera,
  Dumbbell,
  BookOpen,
  Briefcase,
  Landmark,
  Tag,
} from 'lucide-react';

const keywordMap = [
  { keywords: ['notebook', 'computador', 'laptop', 'pc', 'macbook'], Icon: Laptop },
  { keywords: ['viagem', 'passagem', 'hotel', 'férias', 'ferias', 'turismo', 'mochilão'], Icon: Plane },
  { keywords: ['reserva', 'resgate', 'fundo', 'emergência', 'emergencia'], Icon: ShieldCheck },
  { keywords: ['casa', 'imóvel', 'imovel', 'moradia', 'apartamento', 'entrada'], Icon: Home },
  { keywords: ['carro', 'veículo', 'veiculo', 'automóvel', 'automovel', 'auto'], Icon: Car },
  { keywords: ['dívida', 'divida', 'quitar', 'empréstimo', 'emprestimo', 'financiamento'], Icon: CreditCard },
  { keywords: ['educação', 'educacao', 'faculdade', 'universidade', 'curso', 'estudo'], Icon: GraduationCap },
  { keywords: ['saúde', 'saude', 'academia', 'exercício', 'exercicio', 'treino'], Icon: Heart },
  { keywords: ['investimento', 'investir', 'ação', 'acao', 'renda fixa', 'cripto'], Icon: TrendingUp },
  { keywords: ['poupança', 'poupanca', 'guardar', 'economizar'], Icon: PiggyBank },
  { keywords: ['casamento', 'noivado', 'festas'], Icon: Gem },
  { keywords: ['bike', 'bicicleta', '自行车'], Icon: Bike },
  { keywords: ['barco', 'embarcação', 'embarcacao', 'iate'], Icon: Ship },
  { keywords: ['tv', 'televisão', 'televisao', 'smart tv', 'monitor'], Icon: Tv },
  { keywords: ['celular', 'telefone', 'smartphone', 'iphone', 'android'], Icon: Smartphone },
  { keywords: ['música', 'musica', 'instrumento', 'guitarra', 'piano'], Icon: Music },
  { keywords: ['câmera', 'camera', 'fotografia', 'lente', 'dslr'], Icon: Camera },
  { keywords: ['academia', 'musculação', 'musculacao', 'crossfit', 'personal'], Icon: Dumbbell },
  { keywords: ['livro', 'livros', 'leitura', 'cursos online', 'certificação'], Icon: BookOpen },
  { keywords: ['freelance', 'trabalho', 'negócio', 'negocio', 'startup', 'empresa'], Icon: Briefcase },
  { keywords: ['imposto', 'impostos', 'tributo', 'ipva', 'iptu'], Icon: Landmark },
  { keywords: ['seguro', 'seguro auto', 'seguro vida', 'seguro residencial'], Icon: Umbrella },
];

export function getGoalIcon(goalName) {
  if (!goalName) return Target;
  const lower = goalName.toLowerCase();
  for (const { keywords, Icon } of keywordMap) {
    if (keywords.some((kw) => lower.includes(kw))) return Icon;
  }
  return Target;
}
