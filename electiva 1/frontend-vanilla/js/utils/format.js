export const formatMoney = (value) => Number(value || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
export const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('es-CO');
};
export const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
