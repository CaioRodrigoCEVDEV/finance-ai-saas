export function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 0 && hour < 12) {
    return 'Bom dia';
  }
  if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  }
  return 'Boa noite';
}

export function getFirstName(name) {
  if (!name) return '';
  return name.trim().split(' ')[0];
}
