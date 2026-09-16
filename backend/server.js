import app, { dbPath } from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('==============================================');
  console.log('  API Embriagados lidsta');
  console.log(`  Servidor:  http://localhost:${PORT}`);
  console.log(`  Health:    http://localhost:${PORT}/api/health`);
  console.log(`  DB:        ${dbPath}`);
  console.log('==============================================');
});