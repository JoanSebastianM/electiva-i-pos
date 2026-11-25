import { api } from '../api/client.js';
import { esc } from '../utils/format.js';

let editing = null;

export async function renderCustomers({ state, setMsg }) {
  const customers = await api.customers.list();
  const canAdmin = state?.user?.role === 'admin';
  const current = editing ? customers.find((item) => item.id === editing) : null;
  if (editing && !current) editing = null;

  const html = `<div class="grid ${canAdmin ? 'grid-2' : ''}">
    ${canAdmin ? `<div class="panel"><h3>${editing ? 'Editar' : 'Nuevo'} cliente</h3>
      <form id="customerForm">
        <label>Nombre<input name="name" required value="${esc(current?.name || '')}"></label>
        <label>Telefono<input name="phone" value="${esc(current?.phone || '')}"></label>
        <div class="row"><button class="btn primary" type="submit">${editing ? 'Actualizar' : 'Guardar'}</button>
        ${editing ? '<button class="btn" type="button" id="cancelCustomerEdit">Cancelar</button>' : ''}</div>
      </form></div>` : ''}
    <div class="panel"><h3>Clientes</h3><table><thead><tr><th>Nombre</th><th>Telefono</th>${canAdmin ? '<th></th>' : ''}</tr></thead><tbody>
      ${customers.map((item) => `<tr><td>${esc(item.name)}</td><td>${esc(item.phone || '-')}</td>${canAdmin ? `<td class="row"><button class="btn" data-customer-edit="${item.id}">Editar</button><button class="btn danger" data-customer-del="${item.id}">Eliminar</button></td>` : ''}</tr>`).join('')}
    </tbody></table></div>
  </div>`;

  return {
    html,
    bind() {
      if (!canAdmin) return;
      document.getElementById('customerForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const fd = new FormData(event.target);
        const payload = {
          name: String(fd.get('name') || '').trim(),
          phone: String(fd.get('phone') || '').trim() || null
        };
        try {
          if (editing) {
            await api.customers.update(editing, payload);
            editing = null;
            setMsg('Cliente actualizado');
          } else {
            await api.customers.create(payload);
            setMsg('Cliente guardado');
          }
        } catch (error) { setMsg('', error.message); }
      });
      document.getElementById('cancelCustomerEdit')?.addEventListener('click', () => { editing = null; setMsg('Edicion cancelada'); });
      document.querySelectorAll('[data-customer-edit]').forEach((button) => button.addEventListener('click', () => {
        editing = Number(button.dataset.customerEdit);
        setMsg('Editando cliente');
      }));
      document.querySelectorAll('[data-customer-del]').forEach((button) => button.addEventListener('click', async () => {
        if (!confirm('Eliminar cliente?')) return;
        try {
          await api.customers.remove(button.dataset.customerDel);
          if (String(editing) === button.dataset.customerDel) editing = null;
          setMsg('Cliente eliminado');
        } catch (error) { setMsg('', error.message); }
      }));
    }
  };
}
