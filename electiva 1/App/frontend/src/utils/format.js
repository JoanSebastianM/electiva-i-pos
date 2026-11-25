export function formatMoney(n) {
  return '$ ' + Number(n ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 });
}
