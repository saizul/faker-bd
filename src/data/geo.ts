/**
 * Administrative geography of Bangladesh: all 8 divisions and all 64
 * districts, each with three of its upazilas (sub-districts).
 *
 * `postcode` is the code of the district's head post office (for example
 * 1000 for Dhaka GPO, 4000 for Chattogram GPO). Addresses use that code; real
 * upazila post offices have their own codes, which are not in this dataset yet.
 *
 * Source: public administrative and postal information from the Government of
 * Bangladesh (Bangladesh Bureau of Statistics geocodes, Bangladesh Post
 * Office). Names follow the official English spellings adopted in 2018
 * (Chattogram, Cumilla, Barishal, Bogura, Jashore).
 */

/** [English, Bangla] */
export type Pair = readonly [string, string];

export interface District {
  en: string;
  bn: string;
  postcode: string;
  upazilas: readonly Pair[];
}

export interface Division {
  en: string;
  bn: string;
  districts: readonly District[];
}

type RawDistrict = readonly [string, string, string, readonly (Pair | string)[]];

// An upazila given as a plain string 'Sadar' means "<District> Sadar".
const RAW: readonly (readonly [string, string, readonly RawDistrict[]])[] = [
  [
    'Barishal',
    'বরিশাল',
    [
      ['Barishal', 'বরিশাল', '8200', ['Sadar', ['Bakerganj', 'বাকেরগঞ্জ'], ['Gournadi', 'গৌরনদী']]],
      ['Barguna', 'বরগুনা', '8700', ['Sadar', ['Amtali', 'আমতলী'], ['Patharghata', 'পাথরঘাটা']]],
      ['Bhola', 'ভোলা', '8300', ['Sadar', ['Char Fasson', 'চরফ্যাশন'], ['Lalmohan', 'লালমোহন']]],
      ['Jhalokathi', 'ঝালকাঠি', '8400', ['Sadar', ['Nalchity', 'নলছিটি'], ['Rajapur', 'রাজাপুর']]],
      ['Patuakhali', 'পটুয়াখালী', '8600', ['Sadar', ['Kalapara', 'কলাপাড়া'], ['Galachipa', 'গলাচিপা']]],
      ['Pirojpur', 'পিরোজপুর', '8500', ['Sadar', ['Mathbaria', 'মঠবাড়িয়া'], ['Nesarabad', 'নেছারাবাদ']]],
    ],
  ],
  [
    'Chattogram',
    'চট্টগ্রাম',
    [
      [
        'Chattogram',
        'চট্টগ্রাম',
        '4000',
        [
          ['Hathazari', 'হাটহাজারী'],
          ['Patiya', 'পটিয়া'],
          ['Sitakunda', 'সীতাকুণ্ড'],
        ],
      ],
      ['Bandarban', 'বান্দরবান', '4600', ['Sadar', ['Thanchi', 'থানচি'], ['Ruma', 'রুমা']]],
      ['Brahmanbaria', 'ব্রাহ্মণবাড়িয়া', '3400', ['Sadar', ['Ashuganj', 'আশুগঞ্জ'], ['Sarail', 'সরাইল']]],
      ['Chandpur', 'চাঁদপুর', '3600', ['Sadar', ['Hajiganj', 'হাজীগঞ্জ'], ['Matlab Dakshin', 'মতলব দক্ষিণ']]],
      ["Cox's Bazar", 'কক্সবাজার', '4700', ['Sadar', ['Teknaf', 'টেকনাফ'], ['Ukhia', 'উখিয়া']]],
      [
        'Cumilla',
        'কুমিল্লা',
        '3500',
        [
          ['Cumilla Adarsha Sadar', 'কুমিল্লা আদর্শ সদর'],
          ['Chandina', 'চান্দিনা'],
          ['Daudkandi', 'দাউদকান্দি'],
        ],
      ],
      ['Feni', 'ফেনী', '3900', ['Sadar', ['Chhagalnaiya', 'ছাগলনাইয়া'], ['Sonagazi', 'সোনাগাজী']]],
      ['Khagrachhari', 'খাগড়াছড়ি', '4400', ['Sadar', ['Dighinala', 'দীঘিনালা'], ['Ramgarh', 'রামগড়']]],
      ['Lakshmipur', 'লক্ষ্মীপুর', '3700', ['Sadar', ['Raipur', 'রায়পুর'], ['Ramganj', 'রামগঞ্জ']]],
      ['Noakhali', 'নোয়াখালী', '3800', ['Sadar', ['Begumganj', 'বেগমগঞ্জ'], ['Hatiya', 'হাতিয়া']]],
      ['Rangamati', 'রাঙ্গামাটি', '4500', ['Sadar', ['Kaptai', 'কাপ্তাই'], ['Baghaichhari', 'বাঘাইছড়ি']]],
    ],
  ],
  [
    'Dhaka',
    'ঢাকা',
    [
      [
        'Dhaka',
        'ঢাকা',
        '1000',
        [
          ['Savar', 'সাভার'],
          ['Dhamrai', 'ধামরাই'],
          ['Keraniganj', 'কেরানীগঞ্জ'],
        ],
      ],
      ['Faridpur', 'ফরিদপুর', '7800', ['Sadar', ['Boalmari', 'বোয়ালমারী'], ['Bhanga', 'ভাঙ্গা']]],
      ['Gazipur', 'গাজীপুর', '1700', ['Sadar', ['Kaliakair', 'কালিয়াকৈর'], ['Sreepur', 'শ্রীপুর']]],
      ['Gopalganj', 'গোপালগঞ্জ', '8100', ['Sadar', ['Tungipara', 'টুঙ্গিপাড়া'], ['Kotalipara', 'কোটালীপাড়া']]],
      ['Kishoreganj', 'কিশোরগঞ্জ', '2300', ['Sadar', ['Bhairab', 'ভৈরব'], ['Bajitpur', 'বাজিতপুর']]],
      ['Madaripur', 'মাদারীপুর', '7900', ['Sadar', ['Shibchar', 'শিবচর'], ['Kalkini', 'কালকিনি']]],
      ['Manikganj', 'মানিকগঞ্জ', '1800', ['Sadar', ['Singair', 'সিংগাইর'], ['Shibalaya', 'শিবালয়']]],
      ['Munshiganj', 'মুন্সীগঞ্জ', '1500', ['Sadar', ['Sreenagar', 'শ্রীনগর'], ['Tongibari', 'টংগিবাড়ী']]],
      ['Narayanganj', 'নারায়ণগঞ্জ', '1400', ['Sadar', ['Rupganj', 'রূপগঞ্জ'], ['Sonargaon', 'সোনারগাঁও']]],
      ['Narsingdi', 'নরসিংদী', '1600', ['Sadar', ['Palash', 'পলাশ'], ['Shibpur', 'শিবপুর']]],
      ['Rajbari', 'রাজবাড়ী', '7700', ['Sadar', ['Goalanda', 'গোয়ালন্দ'], ['Pangsha', 'পাংশা']]],
      ['Shariatpur', 'শরীয়তপুর', '8000', ['Sadar', ['Naria', 'নড়িয়া'], ['Zajira', 'জাজিরা']]],
      ['Tangail', 'টাঙ্গাইল', '1900', ['Sadar', ['Mirzapur', 'মির্জাপুর'], ['Madhupur', 'মধুপুর']]],
    ],
  ],
  [
    'Khulna',
    'খুলনা',
    [
      [
        'Khulna',
        'খুলনা',
        '9000',
        [
          ['Dumuria', 'ডুমুরিয়া'],
          ['Batiaghata', 'বটিয়াঘাটা'],
          ['Paikgachha', 'পাইকগাছা'],
        ],
      ],
      ['Bagerhat', 'বাগেরহাট', '9300', ['Sadar', ['Mongla', 'মোংলা'], ['Morrelganj', 'মোড়েলগঞ্জ']]],
      ['Chuadanga', 'চুয়াডাঙ্গা', '7200', ['Sadar', ['Alamdanga', 'আলমডাঙ্গা'], ['Damurhuda', 'দামুড়হুদা']]],
      ['Jashore', 'যশোর', '7400', ['Sadar', ['Sharsha', 'শার্শা'], ['Jhikargachha', 'ঝিকরগাছা']]],
      ['Jhenaidah', 'ঝিনাইদহ', '7300', ['Sadar', ['Shailkupa', 'শৈলকুপা'], ['Kaliganj', 'কালীগঞ্জ']]],
      ['Kushtia', 'কুষ্টিয়া', '7000', ['Sadar', ['Kumarkhali', 'কুমারখালী'], ['Bheramara', 'ভেড়ামারা']]],
      ['Magura', 'মাগুরা', '7600', ['Sadar', ['Sreepur', 'শ্রীপুর'], ['Mohammadpur', 'মহম্মদপুর']]],
      ['Meherpur', 'মেহেরপুর', '7100', ['Sadar', ['Gangni', 'গাংনী'], ['Mujibnagar', 'মুজিবনগর']]],
      ['Narail', 'নড়াইল', '7500', ['Sadar', ['Lohagara', 'লোহাগড়া'], ['Kalia', 'কালিয়া']]],
      ['Satkhira', 'সাতক্ষীরা', '9400', ['Sadar', ['Kaliganj', 'কালিগঞ্জ'], ['Shyamnagar', 'শ্যামনগর']]],
    ],
  ],
  [
    'Mymensingh',
    'ময়মনসিংহ',
    [
      ['Mymensingh', 'ময়মনসিংহ', '2200', ['Sadar', ['Muktagachha', 'মুক্তাগাছা'], ['Trishal', 'ত্রিশাল']]],
      ['Jamalpur', 'জামালপুর', '2000', ['Sadar', ['Sarishabari', 'সরিষাবাড়ী'], ['Islampur', 'ইসলামপুর']]],
      ['Netrokona', 'নেত্রকোণা', '2400', ['Sadar', ['Mohanganj', 'মোহনগঞ্জ'], ['Durgapur', 'দুর্গাপুর']]],
      ['Sherpur', 'শেরপুর', '2100', ['Sadar', ['Nalitabari', 'নালিতাবাড়ী'], ['Sreebardi', 'শ্রীবরদী']]],
    ],
  ],
  [
    'Rajshahi',
    'রাজশাহী',
    [
      [
        'Rajshahi',
        'রাজশাহী',
        '6000',
        [
          ['Paba', 'পবা'],
          ['Godagari', 'গোদাগাড়ী'],
          ['Bagha', 'বাঘা'],
        ],
      ],
      ['Bogura', 'বগুড়া', '5800', ['Sadar', ['Sherpur', 'শেরপুর'], ['Shibganj', 'শিবগঞ্জ']]],
      ['Chapai Nawabganj', 'চাঁপাইনবাবগঞ্জ', '6300', ['Sadar', ['Shibganj', 'শিবগঞ্জ'], ['Gomastapur', 'গোমস্তাপুর']]],
      ['Joypurhat', 'জয়পুরহাট', '5900', ['Sadar', ['Panchbibi', 'পাঁচবিবি'], ['Akkelpur', 'আক্কেলপুর']]],
      ['Naogaon', 'নওগাঁ', '6500', ['Sadar', ['Patnitala', 'পত্নীতলা'], ['Mohadevpur', 'মহাদেবপুর']]],
      ['Natore', 'নাটোর', '6400', ['Sadar', ['Singra', 'সিংড়া'], ['Baraigram', 'বড়াইগ্রাম']]],
      ['Pabna', 'পাবনা', '6600', ['Sadar', ['Ishwardi', 'ঈশ্বরদী'], ['Bera', 'বেড়া']]],
      ['Sirajganj', 'সিরাজগঞ্জ', '6700', ['Sadar', ['Shahjadpur', 'শাহজাদপুর'], ['Ullahpara', 'উল্লাপাড়া']]],
    ],
  ],
  [
    'Rangpur',
    'রংপুর',
    [
      ['Rangpur', 'রংপুর', '5400', ['Sadar', ['Mithapukur', 'মিঠাপুকুর'], ['Pirganj', 'পীরগঞ্জ']]],
      ['Dinajpur', 'দিনাজপুর', '5200', ['Sadar', ['Birampur', 'বিরামপুর'], ['Parbatipur', 'পার্বতীপুর']]],
      ['Gaibandha', 'গাইবান্ধা', '5700', ['Sadar', ['Gobindaganj', 'গোবিন্দগঞ্জ'], ['Palashbari', 'পলাশবাড়ী']]],
      ['Kurigram', 'কুড়িগ্রাম', '5600', ['Sadar', ['Ulipur', 'উলিপুর'], ['Nageshwari', 'নাগেশ্বরী']]],
      ['Lalmonirhat', 'লালমনিরহাট', '5500', ['Sadar', ['Patgram', 'পাটগ্রাম'], ['Hatibandha', 'হাতীবান্ধা']]],
      ['Nilphamari', 'নীলফামারী', '5300', ['Sadar', ['Saidpur', 'সৈয়দপুর'], ['Domar', 'ডোমার']]],
      ['Panchagarh', 'পঞ্চগড়', '5000', ['Sadar', ['Tetulia', 'তেঁতুলিয়া'], ['Boda', 'বোদা']]],
      ['Thakurgaon', 'ঠাকুরগাঁও', '5100', ['Sadar', ['Pirganj', 'পীরগঞ্জ'], ['Baliadangi', 'বালিয়াডাঙ্গী']]],
    ],
  ],
  [
    'Sylhet',
    'সিলেট',
    [
      ['Sylhet', 'সিলেট', '3100', ['Sadar', ['Beanibazar', 'বিয়ানীবাজার'], ['Golapganj', 'গোলাপগঞ্জ']]],
      ['Habiganj', 'হবিগঞ্জ', '3300', ['Sadar', ['Chunarughat', 'চুনারুঘাট'], ['Madhabpur', 'মাধবপুর']]],
      ['Moulvibazar', 'মৌলভীবাজার', '3200', ['Sadar', ['Sreemangal', 'শ্রীমঙ্গল'], ['Kulaura', 'কুলাউড়া']]],
      ['Sunamganj', 'সুনামগঞ্জ', '3000', ['Sadar', ['Chhatak', 'ছাতক'], ['Jagannathpur', 'জগন্নাথপুর']]],
    ],
  ],
];

export const DIVISIONS: readonly Division[] = RAW.map(([en, bn, districts]) => ({
  en,
  bn,
  districts: districts.map(([den, dbn, postcode, ups]) => ({
    en: den,
    bn: dbn,
    postcode,
    upazilas: ups.map((u): Pair => (u === 'Sadar' ? [`${den} Sadar`, `${dbn} সদর`] : (u as Pair))),
  })),
}));

/** Every district, alphabetically within its division. */
export const DISTRICTS: readonly (District & { division: Division })[] = DIVISIONS.flatMap((division) =>
  division.districts.map((d) => ({ ...d, division })),
);

/** Approximate population share of each division, used to weight random addresses. */
export const DIVISION_WEIGHTS: Readonly<Record<string, number>> = {
  Dhaka: 26,
  Chattogram: 20,
  Rajshahi: 12,
  Khulna: 11,
  Rangpur: 11,
  Mymensingh: 7,
  Sylhet: 7,
  Barishal: 6,
};

/** Common words in Bangladeshi street addresses. */
export const AREA_WORDS: readonly Pair[] = [
  ['Road', 'রোড'],
  ['Lane', 'লেন'],
  ['Sarak', 'সড়ক'],
];
