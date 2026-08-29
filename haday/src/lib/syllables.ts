/** Public-domain Masoretic examples. Rules are original teaching notes, not a textbook reprint. */

export type SyllableVerse = { ref: string; he: string; en: string; hit: string };

export type SyllableSample = {
  word: string;
  split: string;
  note: string;
};

export type SyllableQuiz = {
  q: string;
  he?: string;
  choices: string[];
  answer: string;
  why: string;
};

export type SyllableUnit = {
  id: number;
  title: string;
  short: string;
  rule: string;
  samples: SyllableSample[];
  verse: SyllableVerse;
  quiz: SyllableQuiz[];
};

export const SYLLABLE_UNITS: SyllableUnit[] = [
  {
    id: 1,
    title: "Open and closed",
    short: "One vowel",
    rule:
      "A Hebrew syllable starts with a consonant and holds one vowel. It is open if it ends in a vowel, closed if it ends in a consonant. Split the word so each slice obeys that.",
    samples: [
      { word: "דָּבָר", split: "דָּ | בָר", note: "דָּ is open (ends in a vowel). בָר is closed (ends in a consonant)." },
      { word: "מֶלֶךְ", split: "מֶ | לֶךְ", note: "Two syllables, each with one vowel. The second is closed." },
    ],
    verse: {
      ref: "Gen 15:1",
      he: "אַחַר הַדְּבָרִים הָאֵלֶּה הָיָה דְבַר־יְהוָה אֶל־אַבְרָם",
      en: "After these things, the word of YHWH came to Abram.",
      hit: "הַדְּבָרִים",
    },
    quiz: [
      { q: "Does a Hebrew syllable normally begin with a vowel?", choices: ["No — it begins with a consonant", "Yes — vowels can start a syllable", "Only in closed syllables"], answer: "No — it begins with a consonant", why: "Each syllable starts with a consonant and carries one vowel." },
      { q: "In דָּ | בָר, what is דָּ?", he: "דָּבָר", choices: ["Open — ends in a vowel", "Closed — ends in a consonant", "Not a syllable"], answer: "Open — ends in a vowel", why: "Open syllables end with a vowel." },
      { q: "In דָּ | בָר, what is בָר?", he: "דָּבָר", choices: ["Closed — ends in a consonant", "Open — ends in a vowel", "A diphthong"], answer: "Closed — ends in a consonant", why: "Closed syllables end with a consonant." },
      { q: "How many vowels may a syllable hold?", choices: ["One", "Two", "As many as the letters"], answer: "One", why: "One vowel per syllable — that is how you find the cuts." },
      { q: "How should מֶלֶךְ split?", he: "מֶלֶךְ", choices: ["מֶ | לֶךְ", "מֶל | ֶךְ", "מֶלֶךְ (one slice)"], answer: "מֶ | לֶךְ", why: "Two vowels, so two syllables. The second ends with a consonant." },
    ],
  },
  {
    id: 2,
    title: "Dagesh forte and lene",
    short: "Begadkephat",
    rule:
      "The six letters ב ג ד כ פ ת can take a dagesh. After a vowel it is forte (the letter doubles, and you split through it). After a consonant — or at the start of a word unless the previous word ended in a vowel — it is lene (a hard sound, not a double). Gutturals and ר never take dagesh.",
    samples: [
      { word: "אַתָּה", split: "אַתְ | תָּה", note: "The dagesh in ת follows a vowel (pathach), so it is forte — the ת is doubled in the split." },
      { word: "מַלְכָּה", split: "מַלְ | כָּה", note: "The dagesh in כ follows a consonant (ל with silent shewa), so it is lene — hard k, not a double." },
    ],
    verse: {
      ref: "Gen 49:8",
      he: "יְהוּדָה אַתָּה יוֹדוּךָ אַחֶיךָ",
      en: "Judah, you — your brothers will praise you.",
      hit: "אַתָּה",
    },
    quiz: [
      { q: "In אַתָּה, the dagesh in ת is…", he: "אַתָּה", choices: ["Forte — a vowel stands before it", "Lene — a consonant stands before it", "Neither; ת cannot take dagesh"], answer: "Forte — a vowel stands before it", why: "Pathach under א is a vowel, so the dagesh is forte and the ת doubles." },
      { q: "In מַלְכָּה, the dagesh in כ is…", he: "מַלְכָּה", choices: ["Lene — silent shewa stands before it", "Forte — it follows a vowel", "Forte — every begadkephat dagesh is forte"], answer: "Lene — silent shewa stands before it", why: "A consonant with silent shewa precedes it, so the dagesh is lene." },
      { q: "Which letters never take dagesh?", choices: ["Gutturals and ר", "Begadkephat only", "Final forms only"], answer: "Gutturals and ר", why: "א ה ח ע and ר refuse both lene and forte." },
      { q: "Forte in a begadkephat doubles which sound?", choices: ["The hard sound", "The soft sound", "Neither — it only marks a vowel"], answer: "The hard sound", why: "You double the stop (b, g, d, k, p, t), not the spirant." },
      { q: "How does אַתָּה split once the ת is forte?", he: "אַתָּה", choices: ["אַתְ | תָּה", "אַ | תָּה", "אַתָּה (one slice)"], answer: "אַתְ | תָּה", why: "Forte doubles the consonant, so the split runs through the ת." },
    ],
  },
  {
    id: 3,
    title: "Silent and vocal shewa",
    short: "Shewa",
    rule:
      "Shewa is silent when a short vowel stands immediately before it — it then closes that syllable. Shewa is vocal in every other case: at the start of a word, as the second of two shewas in a row, under a letter with dagesh forte, or after an unaccented long vowel. A shewa, silent or vocal, marks a syllable boundary. Gutturals do not take vocal shewa (they take a hateph instead); ר may.",
    samples: [
      { word: "פַּרְעֹה", split: "פַּרְ | עֹה", note: "Shewa under ר follows short pathach, so it is silent and closes the first syllable." },
      { word: "בְּרָכָה", split: "בְּ | רָ | כָה", note: "Initial shewa is always vocal." },
      { word: "מִשְׁפְּטֵי", split: "מִשְׁ | פְּ | טֵי", note: "First of two shewas is silent; the second is vocal." },
    ],
    verse: {
      ref: "Exod 5:1",
      he: "וְאַחַר בָּאוּ מֹשֶׁה וְאַהֲרֹן וַיֹּאמְרוּ אֶל־פַּרְעֹה",
      en: "Afterward Moses and Aaron came and said to Pharaoh.",
      hit: "פַּרְעֹה",
    },
    quiz: [
      { q: "Shewa after a short vowel is…", choices: ["Silent — it closes the syllable", "Vocal — it opens the next syllable", "Always hateph"], answer: "Silent — it closes the syllable", why: "Short vowel + shewa = closed syllable, silent shewa." },
      { q: "In פַּרְעֹה, the shewa under ר is…", he: "פַּרְעֹה", choices: ["Silent", "Vocal", "Hateph pathach"], answer: "Silent", why: "It follows short pathach under פּ." },
      { q: "A shewa at the beginning of a word is…", choices: ["Always vocal", "Always silent", "Forte"], answer: "Always vocal", why: "Nothing short stands before it, so it is vocal." },
      { q: "Two shewas side by side inside a word: which is vocal?", choices: ["The second", "The first", "Both silent"], answer: "The second", why: "The first is silent (closes); the second is vocal (opens)." },
      { q: "Shewa under a letter with dagesh forte is…", choices: ["Vocal", "Silent", "Not allowed"], answer: "Vocal", why: "The doubled letter begins a new syllable, so its shewa is vocal." },
    ],
  },
  {
    id: 4,
    title: "Qamets and qamets hatuf",
    short: "Long a / short o",
    rule:
      "The same sign ָ is qamets (long a) in an open pretonic syllable or a closed accented syllable. It is qamets hatuf (short o) only in a closed, unaccented syllable. A metheg (small vertical stroke) beside the sign marks qamets, not hatuf. Reduced vowels (hatephs) always sit in open syllables and are never silent.",
    samples: [
      { word: "חָכְמָה", split: "חָכְ | מָה", note: "First ָ is hatuf (closed, unaccented). Second ָ is qamets (accented)." },
      { word: "כָּל־", split: "כָּל", note: "The frequent construct “all of” is hatuf — closed and unaccented." },
      { word: "דָּבָר", split: "דָּ | בָר", note: "Both signs are qamets: first open-pretonic, second closed-accented." },
    ],
    verse: {
      ref: "Prov 1:7",
      he: "יִרְאַת יְהוָה רֵאשִׁית דָּעַת חָכְמָה וּמוּסָר אֱוִילִים בָּזוּ",
      en: "The fear of YHWH is the beginning of knowledge; fools despise wisdom and instruction.",
      hit: "חָכְמָה",
    },
    quiz: [
      { q: "Qamets hatuf (short o) lives in…", choices: ["A closed, unaccented syllable", "An open, pretonic syllable", "Any syllable with ָ"], answer: "A closed, unaccented syllable", why: "That is the only seat of hatuf." },
      { q: "In חָכְמָה, the first ָ is…", he: "חָכְמָה", choices: ["Qamets hatuf (short o)", "Qamets (long a)", "Hateph qamets"], answer: "Qamets hatuf (short o)", why: "Closed and unaccented, with silent shewa after it." },
      { q: "A metheg beside ָ tells you it is…", choices: ["Qamets (long a)", "Qamets hatuf", "Shewa"], answer: "Qamets (long a)", why: "Metheg is written with qamets, not with hatuf." },
      { q: "Hateph vowels (ֲ ֱ ֳ) are…", choices: ["Always in open syllables, never silent", "Silent like shewa", "Only in closed syllables"], answer: "Always in open syllables, never silent", why: "Reduced vowels open a syllable; they do not close one." },
      { q: "The construct כָּל “all of” has…", he: "כָּל", choices: ["Qamets hatuf", "Qamets (long a)", "Pathach"], answer: "Qamets hatuf", why: "Closed, unaccented — the most common hatuf word." },
    ],
  },
  {
    id: 5,
    title: "Furtive pathach",
    short: "Before ח / ע",
    rule:
      "A vowel is spoken after its consonant — except at the end of a word, when ח or ע may carry a pathach that is spoken before the guttural. That pathach is furtive: you pronounce it, but you do not count it as a syllable of its own.",
    samples: [
      { word: "רוּחַ", split: "רוּחַ", note: "One syllable. Say ru-ach — the pathach is heard before ח, but the word is not two slices." },
      { word: "רָקִיעַ", split: "רָ | קִיעַ", note: "Two syllables. The pathach under ע is furtive, not a third vowel-seat." },
    ],
    verse: {
      ref: "Gen 1:2",
      he: "וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם",
      en: "And the spirit of God was hovering over the face of the waters.",
      hit: "וְרוּחַ",
    },
    quiz: [
      { q: "Furtive pathach is pronounced…", choices: ["Before the final ח or ע", "After the guttural", "Not at all"], answer: "Before the final ח or ע", why: "It is the one pathach you say before its letter." },
      { q: "Does furtive pathach add a syllable?", choices: ["No", "Yes — always a new open syllable", "Only if the word is long"], answer: "No", why: "You hear it, but you do not split on it." },
      { q: "How many syllables in רוּחַ?", he: "רוּחַ", choices: ["One", "Two", "Three"], answer: "One", why: "Furtive pathach is not a second vowel-seat." },
      { q: "Which finals can take furtive pathach?", choices: ["ח and ע", "א and ר", "Any guttural"], answer: "ח and ע", why: "Those two at word-end may carry the extra pathach." },
      { q: "Split of רָקִיעַ?", he: "רָקִיעַ", choices: ["רָ | קִיעַ", "רָ | קִי | עַ", "רָקִיעַ (one)"], answer: "רָ | קִיעַ", why: "Two real vowels. The pathach under ע is furtive." },
    ],
  },
  {
    id: 6,
    title: "Quiescent alef",
    short: "Silent א",
    rule:
      "When א has no vowel of its own, it is quiescent: present in the spelling, silent in the mouth, and not treated as a consonant when you split the word.",
    samples: [
      { word: "חַטָּאת", split: "חַטְ | טָאת", note: "The last א is quiescent. Forte in ט still doubles, so the split runs through ט." },
    ],
    verse: {
      ref: "Ps 51:5",
      he: "כִּי־פְשָׁעַי אֲנִי אֵדָע וְחַטָּאתִי נֶגְדִּי תָמִיד",
      en: "For I know my transgressions, and my sin is ever before me.",
      hit: "וְחַטָּאתִי",
    },
    quiz: [
      { q: "A vowel-less א is…", choices: ["Quiescent — silent, ignored in the split", "Always a new syllable", "Read as a glottal stop that counts"], answer: "Quiescent — silent, ignored in the split", why: "No vowel on א means it does not start or fill a syllable." },
      { q: "Split of חַטָּאת?", he: "חַטָּאת", choices: ["חַטְ | טָאת", "חַ | טָּאת", "חַטָּ | את"], answer: "חַטְ | טָאת", why: "Forte doubles ט; the final א is quiescent." },
      { q: "Does quiescent א count as the consonant that starts a syllable?", choices: ["No", "Yes", "Only at the end of a word"], answer: "No", why: "The split treats it as quiet, not as a new onset." },
      { q: "In חַטָּאת the dagesh in ט is…", he: "חַטָּאת", choices: ["Forte (after a vowel)", "Lene (after a consonant)", "Not a dagesh"], answer: "Forte (after a vowel)", why: "Pathach precedes it, so ט doubles." },
      { q: "Which letter can go quiet like this?", choices: ["א without a vowel", "Any guttural", "Only ה"], answer: "א without a vowel", why: "Quiescence is the א that has lost its vowel." },
    ],
  },
  {
    id: 7,
    title: "Diphthongs",
    short: "ay / aw",
    rule:
      "Two tight clusters act as one sound: the ay-group (ַ֫יִ) and the aw-group (ָ֫וֶ). A syllable that holds one of them is closed, because it still ends with a consonant. Some words are a single closed syllable for that reason (בַּ֫יִת, מָ֫וֶת).",
    samples: [
      { word: "שָׁמַיִם", split: "שָׁ | מַיִם", note: "The second slice holds the ay cluster and is closed." },
      { word: "בַּיִת", split: "בַּיִת", note: "One closed syllable — the ay group is not cut." },
      { word: "מָוֶת", split: "מָוֶת", note: "One closed syllable — the aw group stays together." },
    ],
    verse: {
      ref: "Gen 1:1",
      he: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
      en: "In the beginning God created the heavens and the earth.",
      hit: "הַשָּׁמַיִם",
    },
    quiz: [
      { q: "A syllable with the ay cluster is…", choices: ["Closed — it ends with a consonant", "Open — yod is a vowel letter here", "Not a syllable"], answer: "Closed — it ends with a consonant", why: "The cluster still finishes on a consonant." },
      { q: "Split of שָׁמַיִם?", he: "שָׁמַיִם", choices: ["שָׁ | מַיִם", "שָׁמַ | יִם", "שָׁ | מַ | יִם"], answer: "שָׁ | מַיִם", why: "Do not cut the ay group." },
      { q: "בַּיִת is…", he: "בַּיִת", choices: ["One closed syllable", "Two syllables בַּ | יִת", "Open then closed"], answer: "One closed syllable", why: "The whole ay cluster stays in one slice." },
      { q: "מָוֶת holds which cluster?", he: "מָוֶת", choices: ["aw", "ay", "Neither — two full vowels"], answer: "aw", why: "The ָוֶ group is the aw diphthong." },
      { q: "May you split inside ַיִ?", choices: ["No — keep the cluster", "Yes — yod always starts a new syllable", "Only if the word is plural"], answer: "No — keep the cluster", why: "The diphthong is one unit." },
    ],
  },
  {
    id: 8,
    title: "Gutturals and vowel seats",
    short: "Advanced",
    rule:
      "Short vowels prefer a closed unaccented seat or an open accented seat. Long vowels prefer a closed accented seat or an open pretonic seat. Vocal shewa and hatephs prefer an open propretonic seat (hatephs with gutturals). Gutturals refuse dagesh forte, refuse vocal shewa (hateph instead), and lean toward a-class vowels. ר refuses dagesh but may take vocal shewa.",
    samples: [
      { word: "עֶבֶד", split: "עֶ | בֶד", note: "Short e in an open accented first slice, and short e in a closed unaccented second." },
      { word: "אֱלֹהִים", split: "אֱ | לֹ | הִים", note: "Hateph under guttural א in an open propretonic syllable." },
      { word: "דְּבָרִים", split: "דְּ | בָ | רִים", note: "Vocal shewa in the open propretonic slice." },
    ],
    verse: {
      ref: "Gen 1:1",
      he: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
      en: "In the beginning God created the heavens and the earth.",
      hit: "אֱלֹהִים",
    },
    quiz: [
      { q: "Long vowels prefer…", choices: ["Closed-accented or open-pretonic", "Only closed unaccented", "Only hateph seats"], answer: "Closed-accented or open-pretonic", why: "That is their usual home." },
      { q: "Vocal shewa and hatephs prefer…", choices: ["Open, propretonic syllables", "Closed, accented syllables", "The end of the word"], answer: "Open, propretonic syllables", why: "Two seats back from the accent, and open." },
      { q: "Gutturals cannot take…", choices: ["Dagesh forte", "Pathach", "Any a-class vowel"], answer: "Dagesh forte", why: "They (and ר) refuse the dot that doubles." },
      { q: "Instead of vocal shewa, a guttural takes…", choices: ["A hateph (reduced) vowel", "Silent shewa only", "Qamets hatuf"], answer: "A hateph (reduced) vowel", why: "Hatephs are the guttural’s vocal shewa." },
      { q: "ר is unlike the other gutturals in that it…", choices: ["May take vocal shewa", "Takes dagesh forte freely", "Never appears with a-class vowels"], answer: "May take vocal shewa", why: "ר refuses dagesh, but vocal shewa is allowed." },
    ],
  },
];

export function syllableUnit(id: number): SyllableUnit | undefined {
  return SYLLABLE_UNITS.find((u) => u.id === id);
}

export function shuffleQuiz(unit: SyllableUnit): SyllableQuiz[] {
  const items = unit.quiz.map((q) => ({
    ...q,
    choices: [...q.choices].sort(() => Math.random() - 0.5),
  }));
  return items.sort(() => Math.random() - 0.5);
}

export function starsFromSyllableScore(pct: number): number {
  if (pct >= 90) return 3;
  if (pct >= 70) return 2;
  return 1;
}

export function highlightParts(he: string, hit: string): { before: string; hit: string; after: string } {
  const i = he.indexOf(hit);
  if (i < 0) return { before: he, hit: "", after: "" };
  return { before: he.slice(0, i), hit, after: he.slice(i + hit.length) };
}
