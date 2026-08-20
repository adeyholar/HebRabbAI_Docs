export type HebrewLetter = {
  id: string;
  letter: string;
  final?: string;
  name: string;
  sound: string;
};

export const CONSONANTS: HebrewLetter[] = [
  { id: "alef", letter: "א", name: "Alef", sound: "silent / glottal stop" },
  { id: "bet", letter: "ב", name: "Bet", sound: "b / v" },
  { id: "gimel", letter: "ג", name: "Gimel", sound: "g" },
  { id: "dalet", letter: "ד", name: "Dalet", sound: "d" },
  { id: "he", letter: "ה", name: "He", sound: "h" },
  { id: "vav", letter: "ו", name: "Vav", sound: "v / w" },
  { id: "zayin", letter: "ז", name: "Zayin", sound: "z" },
  { id: "het", letter: "ח", name: "Het", sound: "ch (Bach)" },
  { id: "tet", letter: "ט", name: "Tet", sound: "t" },
  { id: "yod", letter: "י", name: "Yod", sound: "y" },
  { id: "kaf", letter: "כ", final: "ך", name: "Kaf", sound: "k / kh" },
  { id: "lamed", letter: "ל", name: "Lamed", sound: "l" },
  { id: "mem", letter: "מ", final: "ם", name: "Mem", sound: "m" },
  { id: "nun", letter: "נ", final: "ן", name: "Nun", sound: "n" },
  { id: "samekh", letter: "ס", name: "Samekh", sound: "s" },
  { id: "ayin", letter: "ע", name: "Ayin", sound: "silent / pharyngeal" },
  { id: "pe", letter: "פ", final: "ף", name: "Pe", sound: "p / f" },
  { id: "tsade", letter: "צ", final: "ץ", name: "Tsade", sound: "ts" },
  { id: "qof", letter: "ק", name: "Qof", sound: "q / k" },
  { id: "resh", letter: "ר", name: "Resh", sound: "r" },
  { id: "sin-shin", letter: "ש", name: "Sin / Shin", sound: "s / sh" },
  { id: "tav", letter: "ת", name: "Tav", sound: "t" },
];

export type HebrewVowel = {
  id: string;
  mark: string;
  name: string;
  sound: string;
  class: "short" | "long" | "reduced" | "other";
};

export const VOWELS: HebrewVowel[] = [
  { id: "patah", mark: "בַ", name: "Patah", sound: "a as in father", class: "short" },
  { id: "qamets", mark: "בָ", name: "Qamets", sound: "ā as in father", class: "long" },
  { id: "segol", mark: "בֶ", name: "Segol", sound: "e as in met", class: "short" },
  { id: "tsere", mark: "בֵ", name: "Tsere", sound: "ē as in they", class: "long" },
  { id: "hireq", mark: "בִ", name: "Hireq", sound: "i as in machine", class: "short" },
  { id: "hireq-yod", mark: "בִי", name: "Hireq Yod", sound: "ī as in machine", class: "long" },
  { id: "qamets-hatuf", mark: "בָ", name: "Qamets Hatuf", sound: "o as in cost", class: "short" },
  { id: "holem", mark: "בֹ", name: "Holem", sound: "ō as in role", class: "long" },
  { id: "holem-vav", mark: "בוֹ", name: "Holem Vav", sound: "ō as in role", class: "long" },
  { id: "qibbuts", mark: "בֻ", name: "Qibbuts", sound: "u as in rule", class: "short" },
  { id: "shureq", mark: "בּוּ", name: "Shureq", sound: "ū as in rule", class: "long" },
  { id: "shewa", mark: "בְ", name: "Shewa", sound: "silent or brief ə", class: "reduced" },
  { id: "hatef-patah", mark: "בֲ", name: "Hatef Patah", sound: "brief a", class: "reduced" },
  { id: "hatef-segol", mark: "בֱ", name: "Hatef Segol", sound: "brief e", class: "reduced" },
  { id: "hatef-qamets", mark: "בֳ", name: "Hatef Qamets", sound: "brief o", class: "reduced" },
];
