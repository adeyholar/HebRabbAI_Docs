export type Pos = "noun" | "verb" | "adj" | "prep" | "particle" | "name" | "pron";

export type VocabItem = {
  id: string;
  hebrew: string;
  translit: string;
  gloss: string;
  alts: string[];
  pos: Pos;
  chapter: number;
  freq: number;
};

export const VOCAB: VocabItem[] = [
  // Ch 2 — frequent names
  { id: "yhwh", hebrew: "יהוה", translit: "YHWH", gloss: "Yahweh, the LORD", alts: ["the lord", "yahweh", "lord", "hashem"], pos: "name", chapter: 2, freq: 6828 },
  { id: "israel", hebrew: "יִשְׂרָאֵל", translit: "yiśrāʾēl", gloss: "Israel", alts: [], pos: "name", chapter: 2, freq: 2507 },
  { id: "david", hebrew: "דָּוִד", translit: "dāwīd", gloss: "David", alts: [], pos: "name", chapter: 2, freq: 1075 },
  { id: "judah", hebrew: "יְהוּדָה", translit: "yəhûdâ", gloss: "Judah", alts: [], pos: "name", chapter: 2, freq: 820 },
  { id: "moses", hebrew: "מֹשֶׁה", translit: "mōšeh", gloss: "Moses", alts: [], pos: "name", chapter: 2, freq: 766 },
  { id: "egypt", hebrew: "מִצְרַיִם", translit: "miṣrayim", gloss: "Egypt", alts: [], pos: "name", chapter: 2, freq: 682 },
  { id: "jerusalem", hebrew: "יְרוּשָׁלַ͏ִם", translit: "yərûšālayim", gloss: "Jerusalem", alts: [], pos: "name", chapter: 2, freq: 643 },
  { id: "aaron", hebrew: "אַהֲרֹן", translit: "ʾahărōn", gloss: "Aaron", alts: [], pos: "name", chapter: 2, freq: 347 },
  { id: "jacob", hebrew: "יַעֲקֹב", translit: "yaʿăqōb", gloss: "Jacob", alts: [], pos: "name", chapter: 2, freq: 349 },
  { id: "joshua", hebrew: "יְהוֹשׁוּעַ", translit: "yəhôšûaʿ", gloss: "Joshua", alts: [], pos: "name", chapter: 2, freq: 218 },
  { id: "joseph", hebrew: "יוֹסֵף", translit: "yôsēp", gloss: "Joseph", alts: [], pos: "name", chapter: 2, freq: 213 },
  { id: "abraham", hebrew: "אַבְרָהָם", translit: "ʾabrāhām", gloss: "Abraham", alts: [], pos: "name", chapter: 2, freq: 175 },
  { id: "jeremiah", hebrew: "יִרְמְיָהוּ", translit: "yirməyāhû", gloss: "Jeremiah", alts: ["yirmeyahu"], pos: "name", chapter: 2, freq: 147 },
  { id: "isaac", hebrew: "יִצְחָק", translit: "yiṣḥāq", gloss: "Isaac", alts: [], pos: "name", chapter: 2, freq: 108 },
  { id: "canaan", hebrew: "כְּנַעַן", translit: "kənaʿan", gloss: "Canaan", alts: [], pos: "name", chapter: 2, freq: 93 },
  { id: "samuel", hebrew: "שְׁמוּאֵל", translit: "šəmûʾēl", gloss: "Samuel", alts: [], pos: "name", chapter: 2, freq: 140 },

  // Ch 3 — core nouns
  { id: "elohim", hebrew: "אֱלֹהִים", translit: "ʾĕlōhîm", gloss: "God, gods", alts: ["god", "gods"], pos: "noun", chapter: 3, freq: 2602 },
  { id: "ben", hebrew: "בֵּן", translit: "bēn", gloss: "son", alts: ["child"], pos: "noun", chapter: 3, freq: 4941 },
  { id: "melek", hebrew: "מֶלֶךְ", translit: "melek", gloss: "king", alts: ["ruler"], pos: "noun", chapter: 3, freq: 2526 },
  { id: "erets", hebrew: "אֶרֶץ", translit: "ʾereṣ", gloss: "land, earth", alts: ["earth", "land", "ground"], pos: "noun", chapter: 3, freq: 2505 },
  { id: "yom", hebrew: "יוֹם", translit: "yôm", gloss: "day", alts: [], pos: "noun", chapter: 3, freq: 2301 },
  { id: "ish", hebrew: "אִישׁ", translit: "ʾîš", gloss: "man, husband", alts: ["man", "husband", "person"], pos: "noun", chapter: 3, freq: 2188 },
  { id: "bayit", hebrew: "בַּיִת", translit: "bayit", gloss: "house, household", alts: ["house", "household", "home"], pos: "noun", chapter: 3, freq: 2047 },
  { id: "am", hebrew: "עַם", translit: "ʿam", gloss: "people", alts: ["nation"], pos: "noun", chapter: 3, freq: 1867 },
  { id: "dabar", hebrew: "דָּבָר", translit: "dābār", gloss: "word, matter, thing", alts: ["word", "matter", "thing", "affair"], pos: "noun", chapter: 3, freq: 1442 },
  { id: "ab", hebrew: "אָב", translit: "ʾāb", gloss: "father", alts: [], pos: "noun", chapter: 3, freq: 1210 },
  { id: "ir", hebrew: "עִיר", translit: "ʿîr", gloss: "city", alts: ["town"], pos: "noun", chapter: 3, freq: 1090 },
  { id: "shem", hebrew: "שֵׁם", translit: "šēm", gloss: "name", alts: [], pos: "noun", chapter: 3, freq: 864 },
  { id: "ishah", hebrew: "אִשָּׁה", translit: "ʾiššâ", gloss: "woman, wife", alts: ["woman", "wife"], pos: "noun", chapter: 3, freq: 781 },
  { id: "ah", hebrew: "אָח", translit: "ʾāḥ", gloss: "brother", alts: [], pos: "noun", chapter: 3, freq: 629 },
  { id: "bat", hebrew: "בַּת", translit: "bat", gloss: "daughter", alts: [], pos: "noun", chapter: 3, freq: 588 },
  { id: "em", hebrew: "אֵם", translit: "ʾēm", gloss: "mother", alts: [], pos: "noun", chapter: 3, freq: 220 },
  { id: "adamah", hebrew: "אֲדָמָה", translit: "ʾădāmâ", gloss: "ground, land", alts: ["ground", "soil", "land"], pos: "noun", chapter: 3, freq: 225 },
  { id: "laylah", hebrew: "לַיְלָה", translit: "laylâ", gloss: "night", alts: [], pos: "noun", chapter: 3, freq: 233 },
  { id: "rosh", hebrew: "רֹאשׁ", translit: "rōš", gloss: "head, beginning", alts: ["head", "beginning", "chief"], pos: "noun", chapter: 3, freq: 600 },
  { id: "panim", hebrew: "פָּנִים", translit: "pānîm", gloss: "face, presence", alts: ["face", "presence"], pos: "noun", chapter: 3, freq: 2100 },
  { id: "et-time", hebrew: "עֵת", translit: "ʿēt", gloss: "time, season", alts: ["time", "season"], pos: "noun", chapter: 3, freq: 296 },
  { id: "shanah", hebrew: "שָׁנָה", translit: "šānâ", gloss: "year", alts: [], pos: "noun", chapter: 3, freq: 877 },
  { id: "hodesh", hebrew: "חֹדֶשׁ", translit: "ḥōdeš", gloss: "month, new moon", alts: ["month", "new moon"], pos: "noun", chapter: 3, freq: 283 },
  { id: "shaar", hebrew: "שַׁעַר", translit: "šaʿar", gloss: "gate", alts: [], pos: "noun", chapter: 3, freq: 375 },
  { id: "sadeh", hebrew: "שָׂדֶה", translit: "śādeh", gloss: "field", alts: [], pos: "noun", chapter: 3, freq: 329 },
  { id: "yam", hebrew: "יָם", translit: "yām", gloss: "sea", alts: [], pos: "noun", chapter: 3, freq: 396 },
  { id: "kesef", hebrew: "כֶּסֶף", translit: "kesep", gloss: "silver, money", alts: ["silver", "money"], pos: "noun", chapter: 3, freq: 403 },
  { id: "zahav", hebrew: "זָהָב", translit: "zāhāb", gloss: "gold", alts: [], pos: "noun", chapter: 3, freq: 389 },

  // Ch 4 — adjectives & related
  { id: "tov", hebrew: "טוֹב", translit: "ṭôb", gloss: "good", alts: ["pleasant"], pos: "adj", chapter: 4, freq: 559 },
  { id: "gadol", hebrew: "גָּדוֹל", translit: "gādôl", gloss: "great, large", alts: ["great", "large", "big"], pos: "adj", chapter: 4, freq: 527 },
  { id: "ra", hebrew: "רַע", translit: "raʿ", gloss: "evil, bad", alts: ["evil", "bad", "wicked"], pos: "adj", chapter: 4, freq: 312 },
  { id: "qadosh", hebrew: "קָדוֹשׁ", translit: "qādôš", gloss: "holy", alts: ["sacred"], pos: "adj", chapter: 4, freq: 171 },
  { id: "rasha", hebrew: "רָשָׁע", translit: "rāšāʿ", gloss: "wicked", alts: ["guilty"], pos: "adj", chapter: 4, freq: 263 },
  { id: "tsaddiq", hebrew: "צַדִּיק", translit: "ṣaddîq", gloss: "righteous", alts: ["just"], pos: "adj", chapter: 4, freq: 206 },
  { id: "hakam", hebrew: "חָכָם", translit: "ḥākām", gloss: "wise", alts: [], pos: "adj", chapter: 4, freq: 138 },
  { id: "qaton", hebrew: "קָטֹן", translit: "qāṭōn", gloss: "small", alts: ["little", "young"], pos: "adj", chapter: 4, freq: 54 },
  { id: "hadash", hebrew: "חָדָשׁ", translit: "ḥādāš", gloss: "new", alts: [], pos: "adj", chapter: 4, freq: 53 },
  { id: "hay", hebrew: "חַי", translit: "ḥay", gloss: "living, alive", alts: ["living", "alive", "live"], pos: "adj", chapter: 4, freq: 248 },
  { id: "rab", hebrew: "רַב", translit: "rab", gloss: "many, great", alts: ["many", "much", "great", "abundant"], pos: "adj", chapter: 4, freq: 429 },
  { id: "zakar", hebrew: "זָכָר", translit: "zākār", gloss: "male", alts: [], pos: "noun", chapter: 4, freq: 82 },
  { id: "neqebah", hebrew: "נְקֵבָה", translit: "nəqēbâ", gloss: "female", alts: [], pos: "noun", chapter: 4, freq: 22 },
  { id: "naar", hebrew: "נַעַר", translit: "naʿar", gloss: "boy, youth, servant", alts: ["boy", "youth", "lad", "servant"], pos: "noun", chapter: 4, freq: 239 },

  // Ch 5 — particles & prepositions
  { id: "we", hebrew: "וְ", translit: "wə", gloss: "and, but, also", alts: ["and", "but", "also", "then"], pos: "particle", chapter: 5, freq: 50200 },
  { id: "ha", hebrew: "הַ", translit: "ha", gloss: "the", alts: ["definite article"], pos: "particle", chapter: 5, freq: 30000 },
  { id: "lo", hebrew: "לֹא", translit: "lōʾ", gloss: "not, no", alts: ["not", "no"], pos: "particle", chapter: 5, freq: 5184 },
  { id: "kol", hebrew: "כֹּל", translit: "kōl", gloss: "all, every", alts: ["all", "every", "whole", "each"], pos: "noun", chapter: 5, freq: 5403 },
  { id: "asher", hebrew: "אֲשֶׁר", translit: "ʾăšer", gloss: "who, which, that", alts: ["who", "which", "that", "whom"], pos: "particle", chapter: 5, freq: 5503 },
  { id: "ki", hebrew: "כִּי", translit: "kî", gloss: "that, because", alts: ["because", "that", "for", "when"], pos: "particle", chapter: 5, freq: 4484 },
  { id: "le", hebrew: "לְ", translit: "lə", gloss: "to, for", alts: ["to", "for", "toward"], pos: "prep", chapter: 5, freq: 20000 },
  { id: "be", hebrew: "בְּ", translit: "bə", gloss: "in, at, with", alts: ["in", "at", "with", "by"], pos: "prep", chapter: 5, freq: 15500 },
  { id: "et", hebrew: "אֵת", translit: "ʾēt", gloss: "direct object marker / with", alts: ["with", "object marker", "direct object"], pos: "particle", chapter: 5, freq: 11000 },
  { id: "min", hebrew: "מִן", translit: "min", gloss: "from, out of", alts: ["from", "out of", "than"], pos: "prep", chapter: 5, freq: 2700 },
  { id: "al", hebrew: "עַל", translit: "ʿal", gloss: "on, upon, concerning", alts: ["on", "upon", "over", "concerning", "against"], pos: "prep", chapter: 5, freq: 5700 },
  { id: "el", hebrew: "אֶל", translit: "ʾel", gloss: "to, toward", alts: ["to", "toward", "unto"], pos: "prep", chapter: 5, freq: 5518 },
  { id: "im", hebrew: "עִם", translit: "ʿim", gloss: "with", alts: [], pos: "prep", chapter: 5, freq: 1100 },
  { id: "ad", hebrew: "עַד", translit: "ʿad", gloss: "until, as far as", alts: ["until", "as far as", "up to"], pos: "prep", chapter: 5, freq: 1263 },
  { id: "gam", hebrew: "גַּם", translit: "gam", gloss: "also, even", alts: ["also", "even", "moreover"], pos: "particle", chapter: 5, freq: 769 },
  { id: "tahat", hebrew: "תַּחַת", translit: "taḥat", gloss: "under, instead of", alts: ["under", "beneath", "instead of"], pos: "prep", chapter: 5, freq: 512 },
  { id: "lifne", hebrew: "לִפְנֵי", translit: "lipnê", gloss: "before, in front of", alts: ["before", "in front of", "in the presence of"], pos: "prep", chapter: 5, freq: 1100 },
  { id: "ben-prep", hebrew: "בֵּין", translit: "bên", gloss: "between", alts: [], pos: "prep", chapter: 5, freq: 409 },
  { id: "hinneh", hebrew: "הִנֵּה", translit: "hinnēh", gloss: "behold, here is", alts: ["behold", "look", "here"], pos: "particle", chapter: 5, freq: 1061 },
  { id: "attah-now", hebrew: "עַתָּה", translit: "ʿattâ", gloss: "now", alts: ["now", "at this time"], pos: "particle", chapter: 5, freq: 435 },
  { id: "sham", hebrew: "שָׁם", translit: "šām", gloss: "there", alts: [], pos: "particle", chapter: 5, freq: 833 },
  { id: "mah", hebrew: "מָה", translit: "mâ", gloss: "what", alts: ["what", "how"], pos: "particle", chapter: 5, freq: 745 },
  { id: "mi", hebrew: "מִי", translit: "mî", gloss: "who", alts: [], pos: "particle", chapter: 5, freq: 422 },
  { id: "ein", hebrew: "אֵין", translit: "ʾên", gloss: "there is not", alts: ["there is not", "none", "without"], pos: "particle", chapter: 5, freq: 789 },
  { id: "yesh", hebrew: "יֵשׁ", translit: "yēš", gloss: "there is", alts: ["there is", "there are"], pos: "particle", chapter: 5, freq: 138 },
  { id: "od", hebrew: "עוֹד", translit: "ʿôd", gloss: "still, yet, again", alts: ["still", "yet", "again", "more"], pos: "particle", chapter: 5, freq: 491 },
  { id: "raq", hebrew: "רַק", translit: "raq", gloss: "only", alts: ["only", "except"], pos: "particle", chapter: 5, freq: 109 },
  { id: "im-if", hebrew: "אִם", translit: "ʾim", gloss: "if", alts: ["if", "whether"], pos: "particle", chapter: 5, freq: 1060 },
  { id: "al-neg", hebrew: "אַל", translit: "ʾal", gloss: "do not", alts: ["do not", "not", "don't"], pos: "particle", chapter: 5, freq: 730 },
  { id: "na", hebrew: "נָא", translit: "nāʾ", gloss: "please, now", alts: ["please", "now", "I pray"], pos: "particle", chapter: 5, freq: 405 },
  { id: "o", hebrew: "אוֹ", translit: "ʾô", gloss: "or", alts: [], pos: "particle", chapter: 5, freq: 321 },
  { id: "ken", hebrew: "כֵּן", translit: "kēn", gloss: "thus, so", alts: ["thus", "so", "yes"], pos: "particle", chapter: 5, freq: 769 },
  { id: "lama", hebrew: "לָמָּה", translit: "lāmmâ", gloss: "why", alts: ["why"], pos: "particle", chapter: 5, freq: 178 },
  { id: "ani", hebrew: "אֲנִי", translit: "ʾănî", gloss: "I", alts: ["i", "me"], pos: "pron", chapter: 5, freq: 870 },
  { id: "anoki", hebrew: "אָנֹכִי", translit: "ʾānōkî", gloss: "I (emphatic)", alts: ["i", "i myself"], pos: "pron", chapter: 5, freq: 359 },
  { id: "attah", hebrew: "אַתָּה", translit: "ʾattâ", gloss: "you (m.s.)", alts: ["you", "thou"], pos: "pron", chapter: 5, freq: 743 },
  { id: "at", hebrew: "אַתְּ", translit: "ʾatt", gloss: "you (f.s.)", alts: ["you"], pos: "pron", chapter: 5, freq: 74 },
  { id: "hu", hebrew: "הוּא", translit: "hûʾ", gloss: "he, that", alts: ["he", "that", "it"], pos: "pron", chapter: 5, freq: 1400 },
  { id: "hi", hebrew: "הִיא", translit: "hîʾ", gloss: "she, that", alts: ["she", "that", "it"], pos: "pron", chapter: 5, freq: 490 },
  { id: "anahnu", hebrew: "אֲנַחְנוּ", translit: "ʾănaḥnû", gloss: "we", alts: ["we", "us"], pos: "pron", chapter: 5, freq: 121 },
  { id: "attem", hebrew: "אַתֶּם", translit: "ʾattem", gloss: "you (m.p.)", alts: ["you", "you all"], pos: "pron", chapter: 5, freq: 283 },
  { id: "hem", hebrew: "הֵם", translit: "hēm", gloss: "they (m.)", alts: ["they"], pos: "pron", chapter: 5, freq: 500 },
  { id: "zeh", hebrew: "זֶה", translit: "zeh", gloss: "this (m.)", alts: ["this"], pos: "pron", chapter: 5, freq: 1178 },
  { id: "zot", hebrew: "זֹאת", translit: "zōʾt", gloss: "this (f.)", alts: ["this"], pos: "pron", chapter: 5, freq: 604 },
  { id: "elleh", hebrew: "אֵלֶּה", translit: "ʾēlleh", gloss: "these", alts: ["these"], pos: "pron", chapter: 5, freq: 745 },

  // Ch 6 — world / body / cult
  { id: "shamayim", hebrew: "שָׁמַיִם", translit: "šāmayim", gloss: "heaven, sky", alts: ["heavens", "sky", "heaven"], pos: "noun", chapter: 6, freq: 421 },
  { id: "mayim", hebrew: "מַיִם", translit: "mayim", gloss: "water", alts: ["waters"], pos: "noun", chapter: 6, freq: 582 },
  { id: "ruah", hebrew: "רוּחַ", translit: "rûaḥ", gloss: "spirit, wind, breath", alts: ["spirit", "wind", "breath"], pos: "noun", chapter: 6, freq: 378 },
  { id: "nephesh", hebrew: "נֶפֶשׁ", translit: "nepeš", gloss: "soul, life, person", alts: ["soul", "life", "person", "self"], pos: "noun", chapter: 6, freq: 754 },
  { id: "leb", hebrew: "לֵב", translit: "lēb", gloss: "heart", alts: ["mind"], pos: "noun", chapter: 6, freq: 851 },
  { id: "yad", hebrew: "יָד", translit: "yād", gloss: "hand", alts: ["power"], pos: "noun", chapter: 6, freq: 1617 },
  { id: "ayin", hebrew: "עַיִן", translit: "ʿayin", gloss: "eye, spring", alts: ["eye", "spring"], pos: "noun", chapter: 6, freq: 883 },
  { id: "peh", hebrew: "פֶּה", translit: "peh", gloss: "mouth", alts: [], pos: "noun", chapter: 6, freq: 498 },
  { id: "qol", hebrew: "קוֹל", translit: "qôl", gloss: "voice, sound", alts: ["voice", "sound"], pos: "noun", chapter: 6, freq: 506 },
  { id: "derek", hebrew: "דֶּרֶךְ", translit: "derek", gloss: "way, road", alts: ["way", "road", "path"], pos: "noun", chapter: 6, freq: 712 },
  { id: "har", hebrew: "הַר", translit: "har", gloss: "mountain", alts: ["hill"], pos: "noun", chapter: 6, freq: 558 },
  { id: "midbar", hebrew: "מִדְבָּר", translit: "midbār", gloss: "wilderness, desert", alts: ["wilderness", "desert"], pos: "noun", chapter: 6, freq: 271 },
  { id: "ets", hebrew: "עֵץ", translit: "ʿēṣ", gloss: "tree, wood", alts: ["tree", "wood"], pos: "noun", chapter: 6, freq: 330 },
  { id: "lehem", hebrew: "לֶחֶם", translit: "leḥem", gloss: "bread, food", alts: ["bread", "food"], pos: "noun", chapter: 6, freq: 296 },
  { id: "basar", hebrew: "בָּשָׂר", translit: "bāśār", gloss: "flesh, meat", alts: ["flesh", "meat", "body"], pos: "noun", chapter: 6, freq: 269 },
  { id: "dam", hebrew: "דָּם", translit: "dām", gloss: "blood", alts: [], pos: "noun", chapter: 6, freq: 360 },
  { id: "kohen", hebrew: "כֹּהֵן", translit: "kōhēn", gloss: "priest", alts: [], pos: "noun", chapter: 6, freq: 750 },
  { id: "nabi", hebrew: "נָבִיא", translit: "nābîʾ", gloss: "prophet", alts: [], pos: "noun", chapter: 6, freq: 317 },
  { id: "mizbeah", hebrew: "מִזְבֵּחַ", translit: "mizbēaḥ", gloss: "altar", alts: [], pos: "noun", chapter: 6, freq: 401 },
  { id: "ohel", hebrew: "אֹהֶל", translit: "ʾōhel", gloss: "tent", alts: [], pos: "noun", chapter: 6, freq: 348 },

  // Ch 7 — theological nouns
  { id: "shalom", hebrew: "שָׁלוֹם", translit: "šālôm", gloss: "peace, welfare", alts: ["peace", "welfare", "wholeness"], pos: "noun", chapter: 7, freq: 237 },
  { id: "hesed", hebrew: "חֶסֶד", translit: "ḥesed", gloss: "loyalty, steadfast love", alts: ["steadfast love", "kindness", "loyalty", "mercy"], pos: "noun", chapter: 7, freq: 249 },
  { id: "emet", hebrew: "אֱמֶת", translit: "ʾĕmet", gloss: "truth, faithfulness", alts: ["truth", "faithfulness"], pos: "noun", chapter: 7, freq: 127 },
  { id: "mishpat", hebrew: "מִשְׁפָּט", translit: "mišpāṭ", gloss: "justice, judgment", alts: ["justice", "judgment", "ordinance"], pos: "noun", chapter: 7, freq: 421 },
  { id: "tsedaqah", hebrew: "צְדָקָה", translit: "ṣədāqâ", gloss: "righteousness", alts: ["justice"], pos: "noun", chapter: 7, freq: 157 },
  { id: "torah", hebrew: "תּוֹרָה", translit: "tôrâ", gloss: "instruction, law", alts: ["law", "instruction", "teaching"], pos: "noun", chapter: 7, freq: 223 },
  { id: "berit", hebrew: "בְּרִית", translit: "bərît", gloss: "covenant", alts: ["treaty"], pos: "noun", chapter: 7, freq: 287 },
  { id: "hattat", hebrew: "חַטָּאת", translit: "ḥaṭṭāʾt", gloss: "sin, sin offering", alts: ["sin", "sin offering"], pos: "noun", chapter: 7, freq: 294 },
  { id: "kavod", hebrew: "כָּבוֹד", translit: "kābôd", gloss: "glory, honor", alts: ["glory", "honor"], pos: "noun", chapter: 7, freq: 200 },
  { id: "or", hebrew: "אוֹר", translit: "ʾôr", gloss: "light", alts: [], pos: "noun", chapter: 7, freq: 120 },
  { id: "hoshek", hebrew: "חֹשֶׁךְ", translit: "ḥōšek", gloss: "darkness", alts: [], pos: "noun", chapter: 7, freq: 80 },
  { id: "hayyim", hebrew: "חַיִּים", translit: "ḥayyîm", gloss: "life", alts: [], pos: "noun", chapter: 7, freq: 150 },
  { id: "mavet", hebrew: "מָוֶת", translit: "māwet", gloss: "death", alts: [], pos: "noun", chapter: 7, freq: 160 },
  { id: "ebed", hebrew: "עֶבֶד", translit: "ʿebed", gloss: "servant, slave", alts: ["servant", "slave"], pos: "noun", chapter: 7, freq: 800 },
  { id: "adon", hebrew: "אָדוֹן", translit: "ʾādôn", gloss: "lord, master", alts: ["lord", "master"], pos: "noun", chapter: 7, freq: 335 },
  { id: "esh", hebrew: "אֵשׁ", translit: "ʾēš", gloss: "fire", alts: [], pos: "noun", chapter: 7, freq: 378 },
  { id: "olam", hebrew: "עוֹלָם", translit: "ʿôlām", gloss: "forever, eternity", alts: ["forever", "eternity", "ancient time"], pos: "noun", chapter: 7, freq: 439 },
  { id: "mitsvah", hebrew: "מִצְוָה", translit: "miṣwâ", gloss: "commandment", alts: ["commandment", "command"], pos: "noun", chapter: 7, freq: 181 },
  { id: "milhamah", hebrew: "מִלְחָמָה", translit: "milḥāmâ", gloss: "war, battle", alts: ["war", "battle"], pos: "noun", chapter: 7, freq: 319 },
  { id: "hereb", hebrew: "חֶרֶב", translit: "ḥereb", gloss: "sword", alts: [], pos: "noun", chapter: 7, freq: 413 },
  { id: "zera", hebrew: "זֶרַע", translit: "zeraʿ", gloss: "seed, offspring", alts: ["seed", "offspring", "descendants"], pos: "noun", chapter: 7, freq: 229 },
  { id: "qodesh", hebrew: "קֹדֶשׁ", translit: "qōdeš", gloss: "holiness, holy thing", alts: ["holiness", "sanctuary", "holy"], pos: "noun", chapter: 7, freq: 470 },
  { id: "hekal", hebrew: "הֵיכָל", translit: "hêkāl", gloss: "temple, palace", alts: ["temple", "palace"], pos: "noun", chapter: 7, freq: 80 },
  { id: "shabbat", hebrew: "שַׁבָּת", translit: "šabbāt", gloss: "Sabbath", alts: ["sabbath"], pos: "noun", chapter: 7, freq: 111 },
  { id: "ehad", hebrew: "אֶחָד", translit: "ʾeḥād", gloss: "one", alts: ["1", "first"], pos: "adj", chapter: 7, freq: 970 },
  { id: "shenayim", hebrew: "שְׁנַיִם", translit: "šənayim", gloss: "two", alts: ["2"], pos: "noun", chapter: 7, freq: 769 },
  { id: "shalosh", hebrew: "שָׁלֹשׁ", translit: "šālōš", gloss: "three", alts: ["3"], pos: "noun", chapter: 7, freq: 430 },
  { id: "arba", hebrew: "אַרְבַּע", translit: "ʾarbaʿ", gloss: "four", alts: ["4"], pos: "noun", chapter: 7, freq: 318 },
  { id: "hamesh", hebrew: "חָמֵשׁ", translit: "ḥāmēš", gloss: "five", alts: ["5"], pos: "noun", chapter: 7, freq: 343 },
  { id: "shesh", hebrew: "שֵׁשׁ", translit: "šēš", gloss: "six", alts: ["6"], pos: "noun", chapter: 7, freq: 273 },
  { id: "sheba", hebrew: "שֶׁבַע", translit: "šebaʿ", gloss: "seven", alts: ["7"], pos: "noun", chapter: 7, freq: 394 },
  { id: "eser", hebrew: "עֶשֶׂר", translit: "ʿeśer", gloss: "ten", alts: ["10"], pos: "noun", chapter: 7, freq: 316 },
  { id: "meah", hebrew: "מֵאָה", translit: "mēʾâ", gloss: "hundred", alts: ["100"], pos: "noun", chapter: 7, freq: 583 },
  { id: "eleph", hebrew: "אֶלֶף", translit: "ʾelep", gloss: "thousand", alts: ["1000"], pos: "noun", chapter: 7, freq: 505 },

  // Ch 8 — core verbs
  { id: "amar", hebrew: "אָמַר", translit: "ʾāmar", gloss: "to say", alts: ["say", "speak"], pos: "verb", chapter: 8, freq: 5316 },
  { id: "hayah", hebrew: "הָיָה", translit: "hāyâ", gloss: "to be, become", alts: ["be", "become", "happen"], pos: "verb", chapter: 8, freq: 3576 },
  { id: "asah", hebrew: "עָשָׂה", translit: "ʿāśâ", gloss: "to do, make", alts: ["do", "make"], pos: "verb", chapter: 8, freq: 2632 },
  { id: "bo", hebrew: "בּוֹא", translit: "bôʾ", gloss: "to come, go in", alts: ["come", "enter", "go in"], pos: "verb", chapter: 8, freq: 2570 },
  { id: "natan", hebrew: "נָתַן", translit: "nātan", gloss: "to give", alts: ["give", "put", "set"], pos: "verb", chapter: 8, freq: 2014 },
  { id: "halak", hebrew: "הָלַךְ", translit: "hālak", gloss: "to walk, go", alts: ["walk", "go"], pos: "verb", chapter: 8, freq: 1554 },
  { id: "raah", hebrew: "רָאָה", translit: "rāʾâ", gloss: "to see", alts: ["see", "look"], pos: "verb", chapter: 8, freq: 1303 },
  { id: "shama", hebrew: "שָׁמַע", translit: "šāmaʿ", gloss: "to hear, obey", alts: ["hear", "listen", "obey"], pos: "verb", chapter: 8, freq: 1168 },
  { id: "diber", hebrew: "דִּבֶּר", translit: "dibber", gloss: "to speak", alts: ["speak"], pos: "verb", chapter: 8, freq: 1136 },
  { id: "yashab", hebrew: "יָשַׁב", translit: "yāšab", gloss: "to sit, dwell", alts: ["sit", "dwell", "inhabit"], pos: "verb", chapter: 8, freq: 1088 },
  { id: "yatsa", hebrew: "יָצָא", translit: "yāṣāʾ", gloss: "to go out", alts: ["go out", "come out", "exit"], pos: "verb", chapter: 8, freq: 1069 },
  { id: "shub", hebrew: "שׁוּב", translit: "šûb", gloss: "to return", alts: ["return", "turn back", "repent"], pos: "verb", chapter: 8, freq: 1056 },
  { id: "yada", hebrew: "יָדַע", translit: "yādaʿ", gloss: "to know", alts: ["know"], pos: "verb", chapter: 8, freq: 956 },
  { id: "laqah", hebrew: "לָקַח", translit: "lāqaḥ", gloss: "to take", alts: ["take", "receive"], pos: "verb", chapter: 8, freq: 967 },
  { id: "alah", hebrew: "עָלָה", translit: "ʿālâ", gloss: "to go up", alts: ["go up", "ascend", "offer up"], pos: "verb", chapter: 8, freq: 894 },
  { id: "qara", hebrew: "קָרָא", translit: "qārāʾ", gloss: "to call, read", alts: ["call", "read", "proclaim"], pos: "verb", chapter: 8, freq: 736 },
  { id: "shalach", hebrew: "שָׁלַח", translit: "šālaḥ", gloss: "to send", alts: ["send"], pos: "verb", chapter: 8, freq: 847 },
  { id: "qum", hebrew: "קוּם", translit: "qûm", gloss: "to arise, stand", alts: ["arise", "stand up", "rise"], pos: "verb", chapter: 8, freq: 627 },

  // Ch 9 — more verbs
  { id: "akol", hebrew: "אָכַל", translit: "ʾākal", gloss: "to eat", alts: ["eat"], pos: "verb", chapter: 9, freq: 810 },
  { id: "mut", hebrew: "מוּת", translit: "mût", gloss: "to die", alts: ["die"], pos: "verb", chapter: 9, freq: 835 },
  { id: "natsa", hebrew: "מָצָא", translit: "māṣāʾ", gloss: "to find", alts: ["find"], pos: "verb", chapter: 9, freq: 457 },
  { id: "shamar", hebrew: "שָׁמַר", translit: "šāmar", gloss: "to keep, guard", alts: ["keep", "guard", "watch", "observe"], pos: "verb", chapter: 9, freq: 468 },
  { id: "natan-nasa", hebrew: "נָשָׂא", translit: "nāśāʾ", gloss: "to lift, carry, bear", alts: ["lift", "carry", "bear", "raise"], pos: "verb", chapter: 9, freq: 659 },
  { id: "naphal", hebrew: "נָפַל", translit: "nāpal", gloss: "to fall", alts: ["fall"], pos: "verb", chapter: 9, freq: 435 },
  { id: "yare", hebrew: "יָרֵא", translit: "yārēʾ", gloss: "to fear", alts: ["fear", "be afraid", "revere"], pos: "verb", chapter: 9, freq: 334 },
  { id: "ahab", hebrew: "אָהַב", translit: "ʾāhēb", gloss: "to love", alts: ["love"], pos: "verb", chapter: 9, freq: 217 },
  { id: "barak", hebrew: "בָּרַךְ", translit: "bārak", gloss: "to bless", alts: ["bless", "kneel"], pos: "verb", chapter: 9, freq: 330 },
  { id: "bara", hebrew: "בָּרָא", translit: "bārāʾ", gloss: "to create", alts: ["create"], pos: "verb", chapter: 9, freq: 54 },
  { id: "banah", hebrew: "בָּנָה", translit: "bānâ", gloss: "to build", alts: ["build"], pos: "verb", chapter: 9, freq: 377 },
  { id: "katab", hebrew: "כָּתַב", translit: "kātab", gloss: "to write", alts: ["write"], pos: "verb", chapter: 9, freq: 225 },
  { id: "zakar-v", hebrew: "זָכַר", translit: "zākar", gloss: "to remember", alts: ["remember"], pos: "verb", chapter: 9, freq: 235 },
  { id: "abad", hebrew: "עָבַד", translit: "ʿābad", gloss: "to serve, work", alts: ["serve", "work", "worship"], pos: "verb", chapter: 9, freq: 289 },
  { id: "malak", hebrew: "מָלַךְ", translit: "mālak", gloss: "to reign", alts: ["reign", "be king", "rule"], pos: "verb", chapter: 9, freq: 348 },
  { id: "hata", hebrew: "חָטָא", translit: "ḥāṭāʾ", gloss: "to sin", alts: ["sin", "miss"], pos: "verb", chapter: 9, freq: 240 },

  // Ch 10
  { id: "yarad", hebrew: "יָרַד", translit: "yārad", gloss: "to go down", alts: ["go down", "descend"], pos: "verb", chapter: 10, freq: 380 },
  { id: "amad", hebrew: "עָמַד", translit: "ʿāmad", gloss: "to stand", alts: ["stand"], pos: "verb", chapter: 10, freq: 524 },
  { id: "hayah-live", hebrew: "חָיָה", translit: "ḥāyâ", gloss: "to live", alts: ["live", "revive"], pos: "verb", chapter: 10, freq: 283 },
  { id: "gadal", hebrew: "גָּדַל", translit: "gādal", gloss: "to be great, grow", alts: ["be great", "grow", "magnify"], pos: "verb", chapter: 10, freq: 117 },
  { id: "hazaq", hebrew: "חָזַק", translit: "ḥāzaq", gloss: "to be strong", alts: ["be strong", "strengthen", "seize"], pos: "verb", chapter: 10, freq: 290 },
  { id: "yakol", hebrew: "יָכֹל", translit: "yākōl", gloss: "to be able", alts: ["be able", "prevail", "can"], pos: "verb", chapter: 10, freq: 193 },
  { id: "qarab", hebrew: "קָרַב", translit: "qārab", gloss: "to draw near", alts: ["draw near", "approach", "offer"], pos: "verb", chapter: 10, freq: 280 },
  { id: "lamad", hebrew: "לָמַד", translit: "lāmad", gloss: "to learn, teach", alts: ["learn", "teach"], pos: "verb", chapter: 10, freq: 87 },
  { id: "shaphat", hebrew: "שָׁפַט", translit: "šāpaṭ", gloss: "to judge", alts: ["judge", "govern"], pos: "verb", chapter: 10, freq: 204 },
  { id: "male", hebrew: "מָלֵא", translit: "mālēʾ", gloss: "to be full, fill", alts: ["be full", "fill"], pos: "verb", chapter: 10, freq: 252 },
  { id: "rabah", hebrew: "רָבָה", translit: "rābâ", gloss: "to be many, multiply", alts: ["multiply", "increase", "be many"], pos: "verb", chapter: 10, freq: 229 },
  { id: "bahar", hebrew: "בָּחַר", translit: "bāḥar", gloss: "to choose", alts: ["choose"], pos: "verb", chapter: 10, freq: 164 },
  { id: "paqad", hebrew: "פָּקַד", translit: "pāqad", gloss: "to visit, appoint, number", alts: ["visit", "appoint", "number", "attend to"], pos: "verb", chapter: 10, freq: 304 },
  { id: "yalad", hebrew: "יָלַד", translit: "yālad", gloss: "to bear, beget", alts: ["bear", "beget", "give birth"], pos: "verb", chapter: 10, freq: 499 },
  { id: "shatah", hebrew: "שָׁתָה", translit: "šātâ", gloss: "to drink", alts: ["drink"], pos: "verb", chapter: 10, freq: 217 },
  { id: "sane", hebrew: "שָׂנֵא", translit: "śānēʾ", gloss: "to hate", alts: ["hate"], pos: "verb", chapter: 10, freq: 148 },

  // Ch 11
  { id: "yasha", hebrew: "יָשַׁע", translit: "yāšaʿ", gloss: "to save", alts: ["save", "deliver"], pos: "verb", chapter: 11, freq: 205 },
  { id: "azar", hebrew: "עָזַר", translit: "ʿāzar", gloss: "to help", alts: ["help"], pos: "verb", chapter: 11, freq: 82 },
  { id: "baqash", hebrew: "בִּקֵּשׁ", translit: "biqqēš", gloss: "to seek", alts: ["seek"], pos: "verb", chapter: 11, freq: 225 },
  { id: "darash", hebrew: "דָּרַשׁ", translit: "dāraš", gloss: "to inquire, seek", alts: ["inquire", "seek", "require"], pos: "verb", chapter: 11, freq: 165 },
  { id: "hithpallel", hebrew: "הִתְפַּלֵּל", translit: "hitpallēl", gloss: "to pray", alts: ["pray"], pos: "verb", chapter: 11, freq: 84 },
  { id: "hishtahawah", hebrew: "הִשְׁתַּחֲוָה", translit: "hištaḥăwâ", gloss: "to bow down, worship", alts: ["bow down", "worship", "prostrate"], pos: "verb", chapter: 11, freq: 172 },
  { id: "hallel", hebrew: "הִלֵּל", translit: "hillēl", gloss: "to praise", alts: ["praise"], pos: "verb", chapter: 11, freq: 146 },
  { id: "bakah", hebrew: "בָּכָה", translit: "bākâ", gloss: "to weep", alts: ["weep", "cry"], pos: "verb", chapter: 11, freq: 114 },
  { id: "gaal", hebrew: "גָּאַל", translit: "gāʾal", gloss: "to redeem", alts: ["redeem"], pos: "verb", chapter: 11, freq: 104 },
  { id: "salah", hebrew: "סָלַח", translit: "sālaḥ", gloss: "to forgive", alts: ["forgive", "pardon"], pos: "verb", chapter: 11, freq: 47 },
  { id: "shakah", hebrew: "שָׁכַח", translit: "šākaḥ", gloss: "to forget", alts: ["forget"], pos: "verb", chapter: 11, freq: 102 },
  { id: "tsaaq", hebrew: "צָעַק", translit: "ṣāʿaq", gloss: "to cry out", alts: ["cry out", "call out"], pos: "verb", chapter: 11, freq: 55 },
  { id: "nathan-natsal", hebrew: "נָצַל", translit: "nāṣal", gloss: "to deliver, snatch", alts: ["deliver", "rescue", "snatch"], pos: "verb", chapter: 11, freq: 213 },
  { id: "qadash", hebrew: "קָדַשׁ", translit: "qādaš", gloss: "to be holy, consecrate", alts: ["be holy", "consecrate", "sanctify"], pos: "verb", chapter: 11, freq: 171 },

  // Ch 12
  { id: "patah", hebrew: "פָּתַח", translit: "pātaḥ", gloss: "to open", alts: ["open"], pos: "verb", chapter: 12, freq: 136 },
  { id: "sagar", hebrew: "סָגַר", translit: "sāgar", gloss: "to close, shut", alts: ["close", "shut"], pos: "verb", chapter: 12, freq: 91 },
  { id: "kasah", hebrew: "כָּסָה", translit: "kāsâ", gloss: "to cover", alts: ["cover", "conceal"], pos: "verb", chapter: 12, freq: 153 },
  { id: "galah", hebrew: "גָּלָה", translit: "gālâ", gloss: "to uncover, go into exile", alts: ["uncover", "reveal", "exile", "go into exile"], pos: "verb", chapter: 12, freq: 187 },
  { id: "asaph", hebrew: "אָסַף", translit: "ʾāsap", gloss: "to gather", alts: ["gather", "collect"], pos: "verb", chapter: 12, freq: 200 },
  { id: "karat", hebrew: "כָּרַת", translit: "kārat", gloss: "to cut, cut off", alts: ["cut", "cut off", "make a covenant"], pos: "verb", chapter: 12, freq: 289 },
  { id: "zabah", hebrew: "זָבַח", translit: "zābaḥ", gloss: "to sacrifice", alts: ["sacrifice", "slaughter"], pos: "verb", chapter: 12, freq: 134 },
  { id: "mashah", hebrew: "מָשַׁח", translit: "māšaḥ", gloss: "to anoint", alts: ["anoint"], pos: "verb", chapter: 12, freq: 70 },
  { id: "taher", hebrew: "טָהֵר", translit: "ṭāhēr", gloss: "to be clean", alts: ["be clean", "purify"], pos: "verb", chapter: 12, freq: 94 },
  { id: "tame", hebrew: "טָמֵא", translit: "ṭāmēʾ", gloss: "to be unclean", alts: ["be unclean", "defile"], pos: "verb", chapter: 12, freq: 162 },
  { id: "labash", hebrew: "לָבַשׁ", translit: "lābaš", gloss: "to put on, wear", alts: ["wear", "put on", "clothe"], pos: "verb", chapter: 12, freq: 112 },
  { id: "qabar", hebrew: "קָבַר", translit: "qābar", gloss: "to bury", alts: ["bury"], pos: "verb", chapter: 12, freq: 133 },
  { id: "yarash", hebrew: "יָרַשׁ", translit: "yāraš", gloss: "to inherit, possess", alts: ["inherit", "possess", "dispossess"], pos: "verb", chapter: 12, freq: 232 },
  { id: "nata", hebrew: "נָטַע", translit: "nāṭaʿ", gloss: "to plant", alts: ["plant"], pos: "verb", chapter: 12, freq: 59 },

  // Ch 13
  { id: "laham", hebrew: "לָחַם", translit: "lāḥam", gloss: "to fight", alts: ["fight", "wage war"], pos: "verb", chapter: 13, freq: 177 },
  { id: "nakah", hebrew: "נָכָה", translit: "nākâ", gloss: "to strike", alts: ["strike", "smite", "hit"], pos: "verb", chapter: 13, freq: 501 },
  { id: "harag", hebrew: "הָרַג", translit: "hārag", gloss: "to kill", alts: ["kill", "slay"], pos: "verb", chapter: 13, freq: 167 },
  { id: "abad-perish", hebrew: "אָבַד", translit: "ʾābad", gloss: "to perish, destroy", alts: ["perish", "destroy", "be lost"], pos: "verb", chapter: 13, freq: 185 },
  { id: "shabar", hebrew: "שָׁבַר", translit: "šābar", gloss: "to break", alts: ["break"], pos: "verb", chapter: 13, freq: 148 },
  { id: "radaph", hebrew: "רָדַף", translit: "rādap", gloss: "to pursue", alts: ["pursue", "chase"], pos: "verb", chapter: 13, freq: 144 },
  { id: "nus", hebrew: "נוּס", translit: "nûs", gloss: "to flee", alts: ["flee"], pos: "verb", chapter: 13, freq: 160 },
  { id: "lakad", hebrew: "לָכַד", translit: "lākad", gloss: "to capture", alts: ["capture", "catch"], pos: "verb", chapter: 13, freq: 121 },
  { id: "shaal", hebrew: "שָׁאַל", translit: "šāʾal", gloss: "to ask", alts: ["ask", "inquire", "request"], pos: "verb", chapter: 13, freq: 176 },
  { id: "anah", hebrew: "עָנָה", translit: "ʿānâ", gloss: "to answer, afflict", alts: ["answer", "reply", "afflict"], pos: "verb", chapter: 13, freq: 316 },
  { id: "ganab", hebrew: "גָּנַב", translit: "gānab", gloss: "to steal", alts: ["steal"], pos: "verb", chapter: 13, freq: 40 },
  { id: "shamad", hebrew: "שָׁמַד", translit: "šāmad", gloss: "to destroy", alts: ["destroy", "annihilate"], pos: "verb", chapter: 13, freq: 90 },
  { id: "asar", hebrew: "אָסַר", translit: "ʾāsar", gloss: "to bind, imprison", alts: ["bind", "imprison", "tie"], pos: "verb", chapter: 13, freq: 73 },
  { id: "natsar", hebrew: "נָצַר", translit: "nāṣar", gloss: "to watch, guard", alts: ["watch", "guard", "keep"], pos: "verb", chapter: 13, freq: 63 },

  // Ch 14
  { id: "kalah", hebrew: "כָּלָה", translit: "kālâ", gloss: "to finish, be complete", alts: ["finish", "complete", "consume"], pos: "verb", chapter: 14, freq: 207 },
  { id: "yasaph", hebrew: "יָסַף", translit: "yāsap", gloss: "to add, continue", alts: ["add", "continue", "do again"], pos: "verb", chapter: 14, freq: 213 },
  { id: "makar", hebrew: "מָכַר", translit: "mākar", gloss: "to sell", alts: ["sell"], pos: "verb", chapter: 14, freq: 80 },
  { id: "qanah", hebrew: "קָנָה", translit: "qānâ", gloss: "to acquire, buy", alts: ["buy", "acquire", "get"], pos: "verb", chapter: 14, freq: 85 },
  { id: "saphar", hebrew: "סָפַר", translit: "sāpar", gloss: "to count, recount", alts: ["count", "tell", "recount"], pos: "verb", chapter: 14, freq: 107 },
  { id: "hashab", hebrew: "חָשַׁב", translit: "ḥāšab", gloss: "to think, reckon", alts: ["think", "reckon", "plan", "consider"], pos: "verb", chapter: 14, freq: 124 },
  { id: "naba", hebrew: "נָבָא", translit: "nābāʾ", gloss: "to prophesy", alts: ["prophesy"], pos: "verb", chapter: 14, freq: 115 },
  { id: "halam", hebrew: "חָלַם", translit: "ḥālam", gloss: "to dream", alts: ["dream"], pos: "verb", chapter: 14, freq: 55 },
  { id: "zaqen", hebrew: "זָקֵן", translit: "zāqēn", gloss: "to be old", alts: ["be old", "grow old"], pos: "verb", chapter: 14, freq: 27 },
  { id: "hadal", hebrew: "חָדַל", translit: "ḥādal", gloss: "to cease", alts: ["cease", "stop"], pos: "verb", chapter: 14, freq: 55 },
  { id: "madad", hebrew: "מָדַד", translit: "mādad", gloss: "to measure", alts: ["measure"], pos: "verb", chapter: 14, freq: 52 },
  { id: "yaats", hebrew: "יָעַץ", translit: "yāʿaṣ", gloss: "to advise", alts: ["advise", "counsel"], pos: "verb", chapter: 14, freq: 80 },

  // Ch 15
  { id: "nagash", hebrew: "נָגַשׁ", translit: "nāgaš", gloss: "to draw near", alts: ["draw near", "approach"], pos: "verb", chapter: 15, freq: 125 },
  { id: "naga", hebrew: "נָגַע", translit: "nāgaʿ", gloss: "to touch, strike", alts: ["touch", "strike", "reach"], pos: "verb", chapter: 15, freq: 150 },
  { id: "abar", hebrew: "עָבַר", translit: "ʿābar", gloss: "to pass over, through", alts: ["pass", "cross", "pass over"], pos: "verb", chapter: 15, freq: 553 },
  { id: "haphak", hebrew: "הָפַךְ", translit: "hāpak", gloss: "to turn, overturn", alts: ["turn", "overturn", "change"], pos: "verb", chapter: 15, freq: 94 },
  { id: "sabab", hebrew: "סָבַב", translit: "sābab", gloss: "to go around", alts: ["surround", "go around", "turn"], pos: "verb", chapter: 15, freq: 163 },
  { id: "azab", hebrew: "עָזַב", translit: "ʿāzab", gloss: "to leave, forsake", alts: ["leave", "forsake", "abandon"], pos: "verb", chapter: 15, freq: 214 },
  { id: "shakan", hebrew: "שָׁכַן", translit: "šākan", gloss: "to dwell", alts: ["dwell", "settle", "abide"], pos: "verb", chapter: 15, freq: 129 },
  { id: "dabaq", hebrew: "דָּבַק", translit: "dābaq", gloss: "to cling", alts: ["cling", "cleave", "stick"], pos: "verb", chapter: 15, freq: 54 },
  { id: "parad", hebrew: "פָּרַד", translit: "pārad", gloss: "to separate", alts: ["separate", "divide"], pos: "verb", chapter: 15, freq: 26 },
  { id: "qarah", hebrew: "קָרָה", translit: "qārâ", gloss: "to happen, meet", alts: ["happen", "meet", "befall"], pos: "verb", chapter: 15, freq: 37 },
  { id: "nuah", hebrew: "נוּחַ", translit: "nûaḥ", gloss: "to rest", alts: ["rest", "settle"], pos: "verb", chapter: 15, freq: 140 },
  { id: "shakab", hebrew: "שָׁכַב", translit: "šākab", gloss: "to lie down", alts: ["lie down", "sleep"], pos: "verb", chapter: 15, freq: 212 },

  // Ch 16
  { id: "tsiwwah", hebrew: "צִוָּה", translit: "ṣiwwâ", gloss: "to command", alts: ["command", "charge"], pos: "verb", chapter: 16, freq: 496 },
  { id: "higgid", hebrew: "הִגִּיד", translit: "higgîd", gloss: "to tell, declare", alts: ["tell", "declare", "report"], pos: "verb", chapter: 16, freq: 371 },
  { id: "nishba", hebrew: "נִשְׁבַּע", translit: "nišbaʿ", gloss: "to swear", alts: ["swear", "take an oath"], pos: "verb", chapter: 16, freq: 186 },
  { id: "nadar", hebrew: "נָדַר", translit: "nādar", gloss: "to vow", alts: ["vow"], pos: "verb", chapter: 16, freq: 31 },
  { id: "shillem", hebrew: "שִׁלֵּם", translit: "šillēm", gloss: "to repay, complete", alts: ["repay", "complete", "make peace"], pos: "verb", chapter: 16, freq: 116 },
  { id: "qillel", hebrew: "קִלֵּל", translit: "qillēl", gloss: "to curse", alts: ["curse"], pos: "verb", chapter: 16, freq: 40 },
  { id: "arar", hebrew: "אָרַר", translit: "ʾārar", gloss: "to curse", alts: ["curse"], pos: "verb", chapter: 16, freq: 63 },
  { id: "kipper", hebrew: "כִּפֶּר", translit: "kipper", gloss: "to atone", alts: ["atone", "make atonement", "cover"], pos: "verb", chapter: 16, freq: 102 },
  { id: "hodia", hebrew: "הוֹדִיעַ", translit: "hôdîaʿ", gloss: "to make known", alts: ["make known", "inform"], pos: "verb", chapter: 16, freq: 71 },
  { id: "sipper", hebrew: "סִפֵּר", translit: "sipper", gloss: "to tell, recount", alts: ["tell", "recount", "narrate"], pos: "verb", chapter: 16, freq: 107 },
  { id: "yadah", hebrew: "יָדָה", translit: "yādâ", gloss: "to give thanks, praise", alts: ["give thanks", "praise", "confess"], pos: "verb", chapter: 16, freq: 111 },
  { id: "anah-sing", hebrew: "עָנָה", translit: "ʿānâ", gloss: "to sing, answer", alts: ["sing", "answer"], pos: "verb", chapter: 16, freq: 15 },

  // Ch 17
  { id: "batah", hebrew: "בָּטַח", translit: "bāṭaḥ", gloss: "to trust", alts: ["trust", "feel secure"], pos: "verb", chapter: 17, freq: 120 },
  { id: "hasah", hebrew: "חָסָה", translit: "ḥāsâ", gloss: "to take refuge", alts: ["take refuge", "seek refuge"], pos: "verb", chapter: 17, freq: 37 },
  { id: "qawah", hebrew: "קָוָה", translit: "qāwâ", gloss: "to wait, hope", alts: ["wait", "hope", "look for"], pos: "verb", chapter: 17, freq: 49 },
  { id: "bin", hebrew: "בִּין", translit: "bîn", gloss: "to understand", alts: ["understand", "discern"], pos: "verb", chapter: 17, freq: 171 },
  { id: "sakal", hebrew: "שָׂכַל", translit: "śākal", gloss: "to be prudent, understand", alts: ["understand", "prosper", "be prudent"], pos: "verb", chapter: 17, freq: 63 },
  { id: "pachad", hebrew: "פָּחַד", translit: "pāḥad", gloss: "to dread", alts: ["dread", "be afraid"], pos: "verb", chapter: 17, freq: 25 },
  { id: "kashal", hebrew: "כָּשַׁל", translit: "kāšal", gloss: "to stumble", alts: ["stumble", "stagger"], pos: "verb", chapter: 17, freq: 65 },
  { id: "taah", hebrew: "תָּעָה", translit: "tāʿâ", gloss: "to wander, err", alts: ["wander", "err", "go astray"], pos: "verb", chapter: 17, freq: 50 },
  { id: "ragaz", hebrew: "רָגַז", translit: "rāgaz", gloss: "to tremble", alts: ["tremble", "quake", "be agitated"], pos: "verb", chapter: 17, freq: 41 },
  { id: "hakam-v", hebrew: "חָכַם", translit: "ḥākam", gloss: "to be wise", alts: ["be wise"], pos: "verb", chapter: 17, freq: 27 },
  { id: "yahal", hebrew: "יָחַל", translit: "yāḥal", gloss: "to wait, hope", alts: ["wait", "hope"], pos: "verb", chapter: 17, freq: 42 },
  { id: "shaqad", hebrew: "שָׁקַד", translit: "šāqad", gloss: "to watch, be alert", alts: ["watch", "be alert"], pos: "verb", chapter: 17, freq: 12 },

  // Ch 18
  { id: "haphets", hebrew: "חָפֵץ", translit: "ḥāpēṣ", gloss: "to delight", alts: ["delight", "take pleasure"], pos: "verb", chapter: 18, freq: 75 },
  { id: "ratsah", hebrew: "רָצָה", translit: "rāṣâ", gloss: "to be pleased", alts: ["be pleased", "accept"], pos: "verb", chapter: 18, freq: 56 },
  { id: "hanan", hebrew: "חָנַן", translit: "ḥānan", gloss: "to be gracious", alts: ["be gracious", "show favor"], pos: "verb", chapter: 18, freq: 78 },
  { id: "raham", hebrew: "רִחַם", translit: "riḥam", gloss: "to have compassion", alts: ["have compassion", "show mercy"], pos: "verb", chapter: 18, freq: 47 },
  { id: "naham", hebrew: "נָחַם", translit: "nāḥam", gloss: "to comfort, relent", alts: ["comfort", "relent", "repent"], pos: "verb", chapter: 18, freq: 108 },
  { id: "samah", hebrew: "שָׂמַח", translit: "śāmaḥ", gloss: "to rejoice", alts: ["rejoice", "be glad"], pos: "verb", chapter: 18, freq: 156 },
  { id: "qana", hebrew: "קָנָא", translit: "qānāʾ", gloss: "to be jealous", alts: ["be jealous", "be zealous"], pos: "verb", chapter: 18, freq: 34 },
  { id: "harah", hebrew: "חָרָה", translit: "ḥārâ", gloss: "to burn with anger", alts: ["be angry", "burn"], pos: "verb", chapter: 18, freq: 93 },
  { id: "abal", hebrew: "אָבַל", translit: "ʾābal", gloss: "to mourn", alts: ["mourn"], pos: "verb", chapter: 18, freq: 39 },
  { id: "shir", hebrew: "שִׁיר", translit: "šîr", gloss: "to sing", alts: ["sing"], pos: "verb", chapter: 18, freq: 87 },
  { id: "gil", hebrew: "גִּיל", translit: "gîl", gloss: "to rejoice, exult", alts: ["rejoice", "exult"], pos: "verb", chapter: 18, freq: 45 },
  { id: "ranan", hebrew: "רָנַן", translit: "rānan", gloss: "to shout for joy", alts: ["shout", "sing for joy"], pos: "verb", chapter: 18, freq: 53 },

  // Ch 19
  { id: "mashal", hebrew: "מָשַׁל", translit: "māšal", gloss: "to rule", alts: ["rule", "have dominion"], pos: "verb", chapter: 19, freq: 81 },
  { id: "nahag", hebrew: "נָהַג", translit: "nāhag", gloss: "to lead, drive", alts: ["lead", "drive"], pos: "verb", chapter: 19, freq: 31 },
  { id: "nahah", hebrew: "נָחָה", translit: "nāḥâ", gloss: "to lead, guide", alts: ["lead", "guide"], pos: "verb", chapter: 19, freq: 39 },
  { id: "kun", hebrew: "כּוּן", translit: "kûn", gloss: "to establish, be firm", alts: ["establish", "prepare", "be firm"], pos: "verb", chapter: 19, freq: 219 },
  { id: "haras", hebrew: "הָרַס", translit: "hāras", gloss: "to tear down", alts: ["tear down", "destroy"], pos: "verb", chapter: 19, freq: 43 },
  { id: "samak", hebrew: "סָמַךְ", translit: "sāmak", gloss: "to support, lay (hands)", alts: ["support", "lay hands", "lean"], pos: "verb", chapter: 19, freq: 48 },
  { id: "yasad", hebrew: "יָסַד", translit: "yāsad", gloss: "to found", alts: ["found", "establish", "lay a foundation"], pos: "verb", chapter: 19, freq: 42 },
  { id: "radah", hebrew: "רָדָה", translit: "rādâ", gloss: "to have dominion", alts: ["have dominion", "rule", "tread"], pos: "verb", chapter: 19, freq: 27 },
  { id: "amets", hebrew: "אָמֵץ", translit: "ʾāmēṣ", gloss: "to be strong, courageous", alts: ["be strong", "be courageous"], pos: "verb", chapter: 19, freq: 41 },
  { id: "sabal", hebrew: "סָבַל", translit: "sābal", gloss: "to bear, carry a load", alts: ["bear", "carry"], pos: "verb", chapter: 19, freq: 18 },
  { id: "nathats", hebrew: "נָתַץ", translit: "nātaṣ", gloss: "to break down", alts: ["break down", "tear down"], pos: "verb", chapter: 19, freq: 42 },
  { id: "shakan-mishkan", hebrew: "מִשְׁכָּן", translit: "miškān", gloss: "tabernacle, dwelling", alts: ["tabernacle", "dwelling"], pos: "noun", chapter: 19, freq: 139 },
];

export const CHAPTERS = Array.from({ length: 18 }, (_, i) => i + 2);

export function weekForChapter(chapter: number): number {
  if (chapter <= 2) return 1;
  if (chapter === 3) return 2;
  if (chapter <= 5) return 3;
  if (chapter <= 7) return 4;
  if (chapter <= 9) return 5;
  if (chapter <= 11) return 6;
  if (chapter <= 13) return 8;
  if (chapter === 14) return 9;
  if (chapter === 15) return 10;
  if (chapter === 16) return 11;
  if (chapter === 17) return 12;
  if (chapter === 18) return 13;
  return 14;
}

export const COURSE_WEEKS = [
  { week: 1, label: "Week 1", chapters: [1, 2], hint: "Alphabet + names" },
  { week: 2, label: "Week 2", chapters: [3], hint: "Core nouns" },
  { week: 3, label: "Week 3", chapters: [4, 5], hint: "Adjectives & particles" },
  { week: 4, label: "Week 4", chapters: [6, 7], hint: "World & theology" },
  { week: 5, label: "Week 5", chapters: [8, 9], hint: "Core verbs" },
  { week: 6, label: "Week 6", chapters: [10, 11], hint: "More verbs — midterm prep" },
  { week: 7, label: "Week 7", chapters: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11], hint: "Midterm · Ch. 1–11" },
  { week: 8, label: "Week 8", chapters: [12, 13], hint: "Cult & conflict verbs" },
  { week: 9, label: "Week 9", chapters: [14], hint: "Finish, count, buy" },
  { week: 10, label: "Week 10", chapters: [15], hint: "Move & dwell" },
  { week: 11, label: "Week 11", chapters: [16], hint: "Command & declare" },
  { week: 12, label: "Week 12", chapters: [17], hint: "Trust & understand" },
  { week: 13, label: "Week 13", chapters: [18], hint: "Affective verbs" },
  { week: 14, label: "Week 14", chapters: [19], hint: "Rule & establish" },
  { week: 15, label: "Week 15", chapters: CHAPTERS, hint: "Cumulative final" },
] as const;

export function itemsForChapters(chapters: number[]): VocabItem[] {
  const set = new Set(chapters);
  return VOCAB.filter((v) => set.has(v.chapter));
}

export function itemsForWeek(week: number): VocabItem[] {
  const w = COURSE_WEEKS.find((x) => x.week === week);
  if (!w) return [];
  if (week === 7) return VOCAB.filter((v) => v.chapter <= 11);
  if (week === 15) return VOCAB;
  return itemsForChapters([...w.chapters]);
}

export function normalizeGloss(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function glossMatches(item: VocabItem, input: string): boolean {
  const n = normalizeGloss(input);
  if (!n) return false;
  const pool = [item.gloss, ...item.alts].map(normalizeGloss);
  if (pool.includes(n)) return true;
  return pool.some((g) => g.split(/,|\/|\s+or\s+/).map((p) => p.trim()).includes(n));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function quizChoices(item: VocabItem, pool: VocabItem[], n = 4): string[] {
  const same = pool.filter((x) => x.id !== item.id && x.pos === item.pos);
  const rest = pool.filter((x) => x.id !== item.id && x.pos !== item.pos);
  const distractors = shuffle([...same, ...rest])
    .map((x) => x.gloss)
    .filter((g, i, arr) => g !== item.gloss && arr.indexOf(g) === i)
    .slice(0, n - 1);
  return shuffle([item.gloss, ...distractors]);
}

export const POS_LABEL: Record<Pos, string> = {
  noun: "Noun",
  verb: "Verb",
  adj: "Adjective",
  prep: "Preposition",
  particle: "Particle",
  name: "Name",
  pron: "Pronoun",
};
