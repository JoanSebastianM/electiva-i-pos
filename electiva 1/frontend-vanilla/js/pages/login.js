import { esc } from '../utils/format.js';

export function renderLogin(state) {
  return `<div class="login"><div class="panel"><div class="brand"><span class="badge">POS GRANIZADOS</span><h1>Iniciar sesion</h1><div class="muted">Ingresa con tu usuario asignado</div></div>${state.err ? `<div class="msg error">${esc(state.err)}</div>` : ''}
  <form id="loginForm"><label>Usuario<input name="username" autocomplete="username" required></label><label>Contrasena<input name="password" type="password" autocomplete="current-password" required></label><button class="btn primary" style="width:100%">Entrar</button></form></div></div>`;
}
