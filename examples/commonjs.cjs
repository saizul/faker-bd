// Run after `npm run build`: node examples/commonjs.cjs
const { createFaker, isFakeId } = require('../dist/cjs/index.js');

const faker = createFaker({ seed: 'checkout-tests' });
for (const p of faker.many(3, (f) => f.person({ gender: 'female' }))) {
  console.log(`${p.name.en} | ${p.phone} | NID ${p.nid} (fake: ${isFakeId(p.nid)})`);
}
