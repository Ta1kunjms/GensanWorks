const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

(async () => {
  const client = createClient({ url: 'file:./app.db' });
  const email = 'admin@local.test';
  const pass = 'adminpass';
  const name = 'Demo Admin';
  const role = 'admin';

  const existing = await client.execute({
    sql: 'SELECT id, email FROM admins WHERE lower(email) = lower(?)',
    args: [email],
  });

  if (existing.rows && existing.rows.length) {
    console.log('Admin already exists');
    return;
  }

  const hash = await bcrypt.hash(pass, 10);
  const id = randomUUID();
  await client.execute({
    sql: "INSERT INTO admins (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))",
    args: [id, email, hash, name, role],
  });
  console.log('Inserted admin', email);
})();
