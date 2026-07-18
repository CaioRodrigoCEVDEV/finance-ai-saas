import {
  Home,
  ShoppingCart,
  Receipt,
  Heart,
  PawPrint,
  Car,
  Fuel,
  Wifi,
  Lightbulb,
  GraduationCap,
  Baby,
  Plane,
  Dumbbell,
  Dog,
  Shirt,
  UtensilsCrossed,
  Coffee,
  Smartphone,
  Monitor,
  Music,
  Gamepad2,
  Stethoscope,
  Pill,
  Building2,
  Landmark,
  Briefcase,
  Wallet,
  CreditCard,
  Gift,
  Tag,
  MoreHorizontal,
} from 'lucide-react';

const keywordMap = [
  { keywords: ['moradia', 'aluguel', 'condomínio', 'condominio', 'casa', 'imóvel', 'imovel', 'hipoteca'], Icon: Home },
  { keywords: ['mercado', 'supermercado', 'alimentação', 'alimentacao', 'comida', 'grocery'], Icon: ShoppingCart },
  { keywords: ['imposto', 'impostos', 'tributo', 'irpf', 'fsico'], Icon: Receipt },
  { keywords: ['saúde', 'saude', 'médico', 'medico', 'hospital', 'farmácia', 'farmacia', 'plano de saúde'], Icon: Heart },
  { keywords: ['pet', 'pets', 'animal', 'cachorro', 'gato', 'veterinário', 'veterinario'], Icon: PawPrint },
  { keywords: ['carro', 'veículo', 'veiculo', 'automóvel', 'automovel', 'auto'], Icon: Car },
  { keywords: ['combustível', 'combustivel', 'gasolina', 'etanol', ' diesel'], Icon: Fuel },
  { keywords: ['internet', 'wi-fi', 'wifi', 'fibra'], Icon: Wifi },
  { keywords: ['energia', 'elétrica', 'eletrica', 'luz', 'conta de luz'], Icon: Lightbulb },
  { keywords: ['educação', 'educacao', 'escola', 'faculdade', 'universidade', 'curso', 'mensalidade'], Icon: GraduationCap },
  { keywords: ['bébé', 'bebe', 'infantil', 'fralda', 'creche'], Icon: Baby },
  { keywords: ['viagem', 'passagem', 'hotel', 'hospedagem', 'hospedagem'], Icon: Plane },
  { keywords: ['academia', 'exercício', 'exercicio', 'musculação', 'musculacao', 'fitness'], Icon: Dumbbell },
  { keywords: ['dog', 'cachorro', 'gato', 'ração', 'racao', 'petshop'], Icon: Dog },
  { keywords: ['roupa', 'roupas', 'vestuário', 'vestuario', 'moda', 'calçado', 'calcado'], Icon: Shirt },
  { keywords: ['restaurante', 'lanchonete', 'refeição', 'refeicao', 'almoço', 'almoco', 'jantar'], Icon: UtensilsCrossed },
  { keywords: ['café', 'cafe', 'padaria', 'bakery'], Icon: Coffee },
  { keywords: ['celular', 'telefone', 'mobile', 'chip'], Icon: Smartphone },
  { keywords: ['streaming', 'netflix', 'spotify', 'assinatura', 'software', 'sistema'], Icon: Monitor },
  { keywords: ['lazer', 'entretenimento', 'shows', 'cinema', 'música', 'musica'], Icon: Music },
  { keywords: ['jogo', 'jogos', 'games', 'playstation', 'xbox', 'steam'], Icon: Gamepad2 },
  { keywords: ['consulta', 'exame', 'laboratório', 'laboratorio', 'diagnóstico', 'diagnostico'], Icon: Stethoscope },
  { keywords: ['remédio', 'remedio', 'medicamento', 'medicamento'], Icon: Pill },
  { keywords: ['escritório', 'escritorio', 'coworking', 'aluguel de espaço'], Icon: Building2 },
  { keywords: ['bank', 'banco', 'tarifa', 'taxa bancária'], Icon: Landmark },
  { keywords: ['freelance', 'trabalho', 'serviço', 'servico', 'consultoria'], Icon: Briefcase },
  { keywords: ['cartão', 'cartao', 'crédito', 'credito', 'fatura'], Icon: CreditCard },
  { keywords: ['presente', 'presentes', 'gift'], Icon: Gift },
  { keywords: ['desconto', 'cupom', 'promoção', 'promocao'], Icon: Tag },
];

const colorPalette = [
  { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400', bar: 'blue' },
  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-500 dark:text-emerald-400', bar: 'emerald' },
  { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-500 dark:text-rose-400', bar: 'rose' },
  { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-500 dark:text-amber-400', bar: 'amber' },
  { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-500 dark:text-violet-400', bar: 'indigo' },
  { bg: 'bg-sky-50 dark:bg-sky-500/10', text: 'text-sky-500 dark:text-sky-400', bar: 'sky' },
  { bg: 'bg-pink-50 dark:bg-pink-500/10', text: 'text-pink-500 dark:text-pink-400', bar: 'rose' },
  { bg: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-500 dark:text-teal-400', bar: 'emerald' },
];

export function getCategoryIcon(categoryName) {
  if (!categoryName) return Tag;
  const lower = categoryName.toLowerCase();
  for (const { keywords, Icon } of keywordMap) {
    if (keywords.some((kw) => lower.includes(kw))) return Icon;
  }
  return Tag;
}

export function getCategoryColor(categoryName) {
  if (!categoryName) return colorPalette[0];
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
}
