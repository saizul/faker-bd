// Builds SQL INSERT statements for a users table from deterministic fake people.
// Run after `npm run build`: node examples/seed-database.mjs > seed.sql
import { createFaker } from '../dist/esm/index.js';

const faker = createFaker({ seed: 2026 });
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

console.log('-- 20 fake users, regenerate with the same seed to get the same rows');
for (const p of faker.many(20, (f) => f.person())) {
  const values = [
    p.id,
    q(p.name.en),
    q(p.name.bn),
    q(p.phone),
    q(p.email),
    q(p.dateOfBirth),
    q(p.address.district.en),
  ];
  console.log(
    `INSERT INTO users (id, name, name_bn, phone, email, born, district) VALUES (${values.join(', ')});`,
  );
}
