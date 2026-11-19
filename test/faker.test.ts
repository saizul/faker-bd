import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createFaker,
  DISTRICTS,
  Faker,
  generate,
  isFakeId,
  isValidMobile,
  parseMobile,
} from '../src/index.js';
import { BANGLA } from './helpers.js';

describe('determinism', () => {
  it('the same seed gives exactly the same people', () => {
    const a = createFaker({ seed: 42 }).many(200, (f) => f.person());
    const b = createFaker({ seed: 42 }).many(200, (f) => f.person());
    assert.deepEqual(a, b);
  });

  it('every dataset is reproducible and seeds differ', () => {
    for (const name of ['people', 'names', 'phones', 'addresses', 'companies', 'transactions', 'ids']) {
      const a = generate(new Faker({ seed: 'x' }), name, 25);
      const b = generate(new Faker({ seed: 'x' }), name, 25);
      const c = generate(new Faker({ seed: 'y' }), name, 25);
      assert.deepEqual(a, b, name);
      assert.notDeepEqual(a, c, name);
    }
  });

  it('pins the first person for seed 42 (a change here is a breaking change)', () => {
    const p = createFaker({ seed: 42 }).person();
    assert.equal(p.name.en, 'Shirin Rahman');
    assert.equal(p.name.bn, 'শিরিন রহমান');
    assert.equal(p.dateOfBirth, '1959-08-15');
    assert.equal(p.phone, '01890337750');
    assert.equal(p.address.district.en, 'Mymensingh');
  });

  it('does not depend on the current date', () => {
    const f = createFaker({ seed: 1 });
    const p = f.person();
    assert.equal(f.referenceDate.toISOString(), '2025-12-31T18:00:00.000Z');
    assert.ok(p.age >= 18 && p.age <= 75);
  });

  it('a random seed is reported and can be replayed', () => {
    const f = createFaker();
    const again = createFaker({ seed: f.seed });
    assert.deepEqual(f.person(), again.person());
  });
});

describe('names', () => {
  const f = createFaker({ seed: 'names' });

  it('respect gender and come in both scripts', () => {
    for (let i = 0; i < 300; i++) {
      for (const gender of ['male', 'female', 'neutral'] as const) {
        const n = f.name({ gender });
        assert.equal(n.gender, gender);
        assert.match(n.full.en, /^(Md\. )?[A-Z][a-z]+ [A-Z][a-z]+$/);
        assert.match(n.full.bn, BANGLA);
        if (gender !== 'male') assert.ok(!n.full.en.startsWith('Md.'));
        if (gender === 'male')
          assert.ok(!['Akter', 'Begum', 'Khatun', 'Sultana', 'Rani'].includes(n.last.en));
        if (gender === 'female') assert.ok(!['Uddin', 'Miah'].includes(n.last.en));
      }
    }
  });

  it('keep naming traditions together', () => {
    for (let i = 0; i < 200; i++) {
      const n = f.name({ tradition: 'hindu', gender: 'male' });
      assert.ok(!['Hossain', 'Rahman', 'Uddin'].includes(n.last.en), n.full.en);
      assert.ok(!n.full.en.startsWith('Md.'));
    }
  });

  it('can turn the Md. prefix off', () => {
    for (let i = 0; i < 200; i++)
      assert.ok(!f.name({ gender: 'male', prefix: false }).full.en.startsWith('Md.'));
  });
});

describe('phones', () => {
  const f = createFaker({ seed: 'phones' });

  it('have a valid operator prefix in local, E.164 and Bangla forms', () => {
    const operators = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      const p = f.phone();
      assert.match(p.local, /^01[3-9]\d{8}$/);
      assert.equal(p.e164, `+88${p.local}`);
      assert.match(p.bn, /^০১[৩-৯][০-৯]{8}$/);
      assert.equal(parseMobile(p.e164)?.operator, p.operator);
      operators.add(p.operator);
    }
    assert.equal(operators.size, 5);
  });

  it('can be limited to one operator', () => {
    for (let i = 0; i < 100; i++) {
      assert.match(f.phone({ operator: 'grameenphone' }).local, /^01[37]/);
      assert.match(f.phone({ operator: 'teletalk' }).local, /^015/);
    }
  });

  it('parseMobile() accepts common spellings and rejects invalid numbers', () => {
    for (const input of [
      '01712345678',
      '+8801712345678',
      '8801712345678',
      '+880 1712-345678',
      '০১৭১২৩৪৫৬৭৮',
    ]) {
      assert.deepEqual(parseMobile(input), {
        local: '01712345678',
        e164: '+8801712345678',
        operator: 'grameenphone',
      });
    }
    assert.equal(parseMobile('01612345678')?.operator, 'airtel');
    for (const bad of ['01212345678', '0171234567', '017123456789', '+911712345678', 'abc', '']) {
      assert.equal(isValidMobile(bad), false, bad);
    }
  });
});

describe('addresses', () => {
  const f = createFaker({ seed: 'addresses' });

  it('are consistent with the geography dataset', () => {
    for (let i = 0; i < 500; i++) {
      const a = f.address();
      const d = DISTRICTS.find((x) => x.en === a.district.en)!;
      assert.ok(d, a.district.en);
      assert.equal(d.division.en, a.division.en);
      assert.equal(a.postcode, d.postcode);
      assert.ok(d.upazilas.some(([en, bn]) => en === a.upazila.en && bn === a.upazila.bn));
      assert.match(a.full.en, new RegExp(`, ${a.district.en} ${a.postcode}$`));
      assert.match(a.full.bn, BANGLA);
    }
  });

  it('can be limited to a division or a district', () => {
    for (let i = 0; i < 50; i++) {
      assert.equal(f.address({ division: 'sylhet' }).division.en, 'Sylhet');
      assert.equal(f.address({ district: "Cox's Bazar" }).upazila.en.length > 0, true);
    }
    assert.throws(() => f.address({ district: 'Atlantis' }), /unknown district/);
    assert.throws(() => f.address({ division: 'Atlantis' }), /unknown division/);
  });
});

describe('people', () => {
  it('have well-formed fields', () => {
    const f = createFaker({ seed: 'people' });
    const people = f.many(500, (x) => x.person());
    people.forEach((p, i) => {
      assert.equal(p.id, i + 1);
      assert.match(p.dateOfBirth, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(p.dateOfBirthBn, /^[১-৯][০-৯]? \S+ [০-৯]{4}$/);
      assert.ok(p.age >= 18 && p.age <= 75, String(p.age));
      assert.match(p.email, /^[a-z0-9._]+@example\.(com|net|org)$/);
      assert.ok(isValidMobile(p.phone));
      assert.ok(isFakeId(p.nid), p.nid);
      if (p.nid.length === 17) assert.equal(p.nid.slice(0, 4), p.dateOfBirth.slice(0, 4));
      assert.ok(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].includes(p.bloodGroup));
    });
  });

  it('respect age limits', () => {
    const f = createFaker({ seed: 'age' });
    for (let i = 0; i < 300; i++) {
      const p = f.person({ minAge: 30, maxAge: 30 });
      assert.equal(p.age, 30, p.dateOfBirth);
    }
  });
});

describe('companies, money and transactions', () => {
  const f = createFaker({ seed: 'biz' });

  it('companies have names in both scripts and reserved .example domains', () => {
    for (let i = 0; i < 200; i++) {
      const c = f.company();
      assert.match(c.name.bn, BANGLA);
      assert.match(c.website, /^https:\/\/www\.[a-z]+\.example$/);
      assert.match(c.email, /@[a-z]+\.example$/);
      if (c.name.en.includes('Pharmaceuticals')) assert.equal(c.industry.en, 'Pharmaceuticals');
    }
  });

  it('money() stays in range and formats both scripts', () => {
    for (let i = 0; i < 500; i++) {
      const m = f.money({ min: 100, max: 5000 });
      assert.ok(m.value >= 100 && m.value <= 5000);
      assert.match(m.en, /^৳[\d,]+\.\d{2}$/);
      assert.match(m.bn, /^৳[০-৯,]+\.[০-৯]{2}$/);
    }
    assert.equal(f.money({ min: 7, max: 7, decimals: 0 }).bn, '৳৭');
  });

  it('transactions are well-formed and inside the window', () => {
    const from = new Date('2026-03-01T00:00:00+06:00');
    const to = new Date('2026-03-31T23:59:59+06:00');
    for (let i = 0; i < 300; i++) {
      const t = f.transaction({ from, to });
      const when = Date.parse(t.timestamp);
      assert.ok(when >= from.getTime() && when <= to.getTime(), t.timestamp);
      assert.match(t.timestamp, /^2026-03-\d{2}T\d{2}:\d{2}:\d{2}\+06:00$/);
      assert.ok(isValidMobile(t.from) && isValidMobile(t.to));
      if (t.provider === 'bkash') assert.match(t.trxId, /^[A-Z][A-Z0-9]{9}$/);
      if (t.provider === 'nagad') assert.match(t.trxId, /^[A-Z][A-Z0-9]{7}$/);
      if (t.provider === 'rocket') assert.match(t.trxId, /^[1-9]\d{9}$/);
      assert.match(t.amountBn, /^৳[০-৯,]+\.০০$/);
      assert.match(t.bengaliDate, /(ফাল্গুন|চৈত্র) ১৪৩২ বঙ্গাব্দ$/);
    }
  });

  it('many() validates count', () => {
    assert.throws(() => f.many(-1, () => 0), RangeError);
    assert.deepEqual(
      f.many(0, () => 0),
      [],
    );
  });
});
