export const formatMoney = (value: number | string): string => {
  const amount = Number(value || 0);
  return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
};

export const formatDate = (value: string): string => {
  if (!value) return '';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-CO');
};
