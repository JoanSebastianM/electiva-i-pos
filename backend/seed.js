import { initSchema, seedIfEmpty, getDb, dbPath } from './db.js';

initSchema();
seedIfEmpty();

const tablas = getDb()
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all()
  .map((t) => t.name);

console.log('Base de datos lista en:', dbPath);
console.log('Tablas creadas:', tablas.join(', '));

for (const tabla of tablas) {
  const n = getDb().prepare(`SELECT COUNT(*) AS n FROM "${tabla}"`).get().n;
  console.log(`  - ${tabla}: ${n} registro(s)`);
}