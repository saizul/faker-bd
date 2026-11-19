/**
 * Building blocks for plausible Bangladeshi company names: rivers, flowers and
 * other words that local businesses often use, and the usual business types.
 * Combinations are random, so some may match a real company by chance; the
 * output is for test data only.
 */
import type { Pair } from './geo.js';

export const COMPANY_WORDS: readonly Pair[] = [
  ['Padma', 'পদ্মা'],
  ['Meghna', 'মেঘনা'],
  ['Jamuna', 'যমুনা'],
  ['Karnaphuli', 'কর্ণফুলী'],
  ['Surma', 'সুরমা'],
  ['Teesta', 'তিস্তা'],
  ['Rupsha', 'রূপসা'],
  ['Shapla', 'শাপলা'],
  ['Kadam', 'কদম'],
  ['Shimul', 'শিমুল'],
  ['Sonali', 'সোনালী'],
  ['Rupali', 'রূপালী'],
  ['Sabuj', 'সবুজ'],
  ['Nabanna', 'নবান্ন'],
  ['Prottasha', 'প্রত্যাশা'],
  ['Agami', 'আগামী'],
  ['Desh', 'দেশ'],
  ['Bengal', 'বেঙ্গল'],
  ['Delta', 'ডেল্টা'],
  ['Sundarban', 'সুন্দরবন'],
  ['Mohona', 'মোহনা'],
  ['Dhanshiri', 'ধানসিঁড়ি'],
];

export const COMPANY_TYPES: readonly Pair[] = [
  ['Group', 'গ্রুপ'],
  ['Industries', 'ইন্ডাস্ট্রিজ'],
  ['Textiles', 'টেক্সটাইলস'],
  ['Garments', 'গার্মেন্টস'],
  ['Pharmaceuticals', 'ফার্মাসিউটিক্যালস'],
  ['Agro', 'এগ্রো'],
  ['Foods', 'ফুডস'],
  ['Traders', 'ট্রেডার্স'],
  ['Enterprise', 'এন্টারপ্রাইজ'],
  ['Technologies', 'টেকনোলজিস'],
  ['Builders', 'বিল্ডার্স'],
  ['Logistics', 'লজিস্টিকস'],
  ['Fisheries', 'ফিশারিজ'],
  ['Jute Mills', 'জুট মিলস'],
];

export const COMPANY_SUFFIXES: readonly Pair[] = [
  ['Ltd.', 'লিমিটেড'],
  ['Limited', 'লিমিটেড'],
  ['', ''],
];

export const INDUSTRIES: readonly Pair[] = [
  ['Ready-made garments', 'তৈরি পোশাক'],
  ['Pharmaceuticals', 'ওষুধ'],
  ['Agriculture', 'কৃষি'],
  ['Food processing', 'খাদ্য প্রক্রিয়াজাতকরণ'],
  ['Software', 'সফটওয়্যার'],
  ['Construction', 'নির্মাণ'],
  ['Logistics', 'পরিবহন ও লজিস্টিকস'],
  ['Retail', 'খুচরা বিক্রয়'],
  ['Jute', 'পাট'],
  ['Fisheries', 'মৎস্য'],
];

/** The industry implied by a business type; types not listed get a random industry. */
export const TYPE_INDUSTRY: Readonly<Record<string, string>> = {
  Textiles: 'Ready-made garments',
  Garments: 'Ready-made garments',
  Pharmaceuticals: 'Pharmaceuticals',
  Agro: 'Agriculture',
  Foods: 'Food processing',
  Technologies: 'Software',
  Builders: 'Construction',
  Logistics: 'Logistics',
  Fisheries: 'Fisheries',
  'Jute Mills': 'Jute',
  Traders: 'Retail',
};
