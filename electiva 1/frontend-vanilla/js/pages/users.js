import { api } from '../api/client.js';
import { esc } from '../utils/format.js';

export async function renderUsers({ setMsg }) {
  const users = await api.users.list();
  return {
    html: `<div class="grid grid-2"><div class="panel"><h3>Nuevo usuario</h3><form id="userForm">
      <label>Usuario<input name="username" required></label><label>Nombre<input name="name" required></label>
      <label>Contrasena<input name="password" type="password" required></label><label>Rol<select name="role"><option value="admin">admin</option><option value="cajero">cajero</option></select></label>
      <button class="btn primary">Crear</button></form></div>
      <div class="panel"><h3>Usuarios</h3><table><thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th></th></tr></thead><tbody>
      ${users.map((u) => `<tr><td>${esc(u.username)}</td><td>${esc(u.name)}</td><td>${esc(u.role)}</td><td><button class="btn danger" data-user-del="${u.id}">Eliminar</button></td></tr>`).join('')}
      </tbody></table></div></div>`,
    bind() {
      document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try { await api.users.create({ username: fd.get('username'), name: fd.get('name'), password: fd.get('password'), role: fd.get('role') }); setMsg('Usuario creado'); }
        catch (err) { setMsg('', err.message); }
      });
      document.querySelectorAll('[data-user-del]').forEach((b) => b.addEventListener('click', async () => {
        if (!confirm('Eliminar usuario?')) return;
        try { await api.users.remove(b.dataset.userDel); setMsg('Usuario eliminado'); } catch (err) { setMsg('', err.message); }
      }));
    }
  };
}
