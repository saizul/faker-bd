// Run after `npm run build`: node examples/basic.mjs
import { createFaker, formatBdt, formatBengaliDate, isValidMobile } from '../dist/esm/index.js';

const faker = createFaker({ seed: 42 });

const person = faker.person();
console.log(person.name.en, '/', person.name.bn);
console.log(person.phone, isValidMobile(person.phone) ? '(valid prefix)' : '(invalid)');
console.log(person.address.full.bn);

console.log(faker.phone({ operator: 'teletalk' }).e164);
console.log(faker.transaction({ provider: 'bkash' }).trxId);
console.log(formatBdt(1234567.5));
console.log(formatBengaliDate(new Date('2026-04-14T00:00:00+06:00')));
