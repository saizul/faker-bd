/**
 * Common Bangladeshi given names and family names, in English spelling and
 * Bangla script. `tradition` keeps given names and family names from the
 * same naming tradition together, so you do not get "Sourav Hossain" or
 * "Fatema Chakraborty" by accident.
 *
 * Spellings follow the most common English transliteration; many names have
 * several (Hossain / Hussain / Hosen). Pull requests that add names or
 * variants are welcome.
 */

export type Tradition = 'muslim' | 'hindu';

/** [English, Bangla] */
export type NamePair = readonly [string, string];

export const MALE_GIVEN: Readonly<Record<Tradition, readonly NamePair[]>> = {
  muslim: [
    ['Rahim', 'রহিম'],
    ['Karim', 'করিম'],
    ['Tanvir', 'তানভীর'],
    ['Arif', 'আরিফ'],
    ['Sakib', 'সাকিব'],
    ['Rakib', 'রাকিব'],
    ['Hasan', 'হাসান'],
    ['Imran', 'ইমরান'],
    ['Fahim', 'ফাহিম'],
    ['Nayeem', 'নাঈম'],
    ['Rafi', 'রাফি'],
    ['Sabbir', 'সাব্বির'],
    ['Mehedi', 'মেহেদী'],
    ['Riaz', 'রিয়াজ'],
    ['Tamim', 'তামিম'],
    ['Mahmud', 'মাহমুদ'],
    ['Kamal', 'কামাল'],
    ['Jamal', 'জামাল'],
    ['Habib', 'হাবিব'],
    ['Faisal', 'ফয়সাল'],
    ['Shafiq', 'শফিক'],
    ['Rashed', 'রাশেদ'],
    ['Ashraf', 'আশরাফ'],
    ['Zahid', 'জাহিদ'],
    ['Mizan', 'মিজান'],
    ['Sohel', 'সোহেল'],
    ['Masud', 'মাসুদ'],
    ['Shahid', 'শহীদ'],
    ['Nasir', 'নাসির'],
    ['Ayan', 'আয়ান'],
  ],
  hindu: [
    ['Sourav', 'সৌরভ'],
    ['Pritom', 'প্রীতম'],
    ['Arnob', 'অর্ণব'],
    ['Anik', 'অনিক'],
    ['Subrata', 'সুব্রত'],
    ['Prosenjit', 'প্রসেনজিৎ'],
    ['Tapos', 'তাপস'],
    ['Dipankar', 'দীপঙ্কর'],
    ['Ratan', 'রতন'],
    ['Bijoy', 'বিজয়'],
    ['Sujon', 'সুজন'],
    ['Amit', 'অমিত'],
  ],
};

export const FEMALE_GIVEN: Readonly<Record<Tradition, readonly NamePair[]>> = {
  muslim: [
    ['Fatema', 'ফাতেমা'],
    ['Ayesha', 'আয়েশা'],
    ['Nusrat', 'নুসরাত'],
    ['Sadia', 'সাদিয়া'],
    ['Tasnim', 'তাসনিম'],
    ['Farzana', 'ফারজানা'],
    ['Sumaiya', 'সুমাইয়া'],
    ['Mim', 'মিম'],
    ['Tania', 'তানিয়া'],
    ['Nasrin', 'নাসরিন'],
    ['Rumana', 'রুমানা'],
    ['Shirin', 'শিরিন'],
    ['Jannat', 'জান্নাত'],
    ['Lamia', 'লামিয়া'],
    ['Sharmin', 'শারমিন'],
    ['Afroza', 'আফরোজা'],
    ['Nadia', 'নাদিয়া'],
    ['Sabrina', 'সাবরিনা'],
    ['Tahmina', 'তাহমিনা'],
    ['Sanjida', 'সানজিদা'],
    ['Farhana', 'ফারহানা'],
    ['Maliha', 'মালিহা'],
    ['Raisa', 'রাইসা'],
    ['Nabila', 'নাবিলা'],
  ],
  hindu: [
    ['Puja', 'পূজা'],
    ['Priya', 'প্রিয়া'],
    ['Rina', 'রিনা'],
    ['Moushumi', 'মৌসুমী'],
    ['Shampa', 'শম্পা'],
    ['Rupa', 'রূপা'],
    ['Dipa', 'দীপা'],
    ['Anjali', 'অঞ্জলি'],
    ['Mitali', 'মিতালী'],
    ['Sraboni', 'শ্রাবণী'],
    ['Anika', 'অনিকা'],
    ['Bristy', 'বৃষ্টি'],
  ],
};

/** Given names that Bangladeshi parents use for children of any gender. */
export const NEUTRAL_GIVEN: readonly NamePair[] = [
  ['Badhon', 'বাঁধন'],
  ['Megh', 'মেঘ'],
  ['Mukti', 'মুক্তি'],
  ['Shanto', 'শান্ত'],
  ['Srabon', 'শ্রাবণ'],
  ['Dipto', 'দীপ্ত'],
  ['Rimjhim', 'রিমঝিম'],
  ['Turjo', 'তূর্য'],
];

export interface FamilyNames {
  /** Used for any gender. */
  any: readonly NamePair[];
  /** Used mostly by men. */
  male: readonly NamePair[];
  /** Used mostly by women. */
  female: readonly NamePair[];
}

export const FAMILY: Readonly<Record<Tradition, FamilyNames>> = {
  muslim: {
    any: [
      ['Hossain', 'হোসেন'],
      ['Rahman', 'রহমান'],
      ['Ahmed', 'আহমেদ'],
      ['Islam', 'ইসলাম'],
      ['Khan', 'খান'],
      ['Chowdhury', 'চৌধুরী'],
      ['Alam', 'আলম'],
      ['Haque', 'হক'],
      ['Kabir', 'কবির'],
      ['Siddique', 'সিদ্দিকী'],
      ['Sheikh', 'শেখ'],
      ['Talukder', 'তালুকদার'],
      ['Bhuiyan', 'ভূঁইয়া'],
      ['Sarkar', 'সরকার'],
      ['Mollah', 'মোল্লা'],
    ],
    male: [
      ['Uddin', 'উদ্দিন'],
      ['Miah', 'মিয়া'],
    ],
    female: [
      ['Akter', 'আক্তার'],
      ['Begum', 'বেগম'],
      ['Sultana', 'সুলতানা'],
      ['Khatun', 'খাতুন'],
    ],
  },
  hindu: {
    any: [
      ['Das', 'দাস'],
      ['Saha', 'সাহা'],
      ['Roy', 'রায়'],
      ['Dey', 'দে'],
      ['Ghosh', 'ঘোষ'],
      ['Paul', 'পাল'],
      ['Sen', 'সেন'],
      ['Chakraborty', 'চক্রবর্তী'],
      ['Mondal', 'মণ্ডল'],
      ['Biswas', 'বিশ্বাস'],
      ['Majumder', 'মজুমদার'],
      ['Sarkar', 'সরকার'],
      ['Datta', 'দত্ত'],
      ['Bhattacharjee', 'ভট্টাচার্য'],
    ],
    male: [],
    female: [['Rani', 'রানী']],
  },
};

/** Rough share of each tradition in randomly generated people. */
export const TRADITION_WEIGHTS: readonly (readonly [Tradition, number])[] = [
  ['muslim', 90],
  ['hindu', 10],
];

/** The "Md." prefix many Bangladeshi men carry in official documents. */
export const MOHAMMAD_PREFIX: NamePair = ['Md.', 'মোঃ'];
