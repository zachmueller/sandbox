/**
 * Chinese Wordle - Word List
 * Each entry is a 4-character Chinese idiom (成语) with pinyin and English meaning.
 * Guesses are validated against the characters in VALID_WORDS.
 * The daily answer is picked from WORD_LIST.
 */

const WORD_LIST = [
    { word: "一心一意", pinyin: "yī xīn yī yì", meaning: "wholeheartedly; with undivided attention" },
    { word: "半途而废", pinyin: "bàn tú ér fèi", meaning: "to give up halfway" },
    { word: "不可思议", pinyin: "bù kě sī yì", meaning: "inconceivable; unimaginable" },
    { word: "大公无私", pinyin: "dà gōng wú sī", meaning: "selfless; impartial" },
    { word: "风和日丽", pinyin: "fēng hé rì lì", meaning: "gentle breeze and beautiful sun; fine weather" },
    { word: "光明正大", pinyin: "guāng míng zhèng dà", meaning: "open and aboveboard; fair and honest" },
    { word: "画蛇添足", pinyin: "huà shé tiān zú", meaning: "to draw legs on a snake; to ruin by adding something superfluous" },
    { word: "见义勇为", pinyin: "jiàn yì yǒng wéi", meaning: "to act bravely for a just cause" },
    { word: "刻舟求剑", pinyin: "kè zhōu qiú jiàn", meaning: "to mark the boat to find the sword; clinging to outdated methods" },
    { word: "龙飞凤舞", pinyin: "lóng fēi fèng wǔ", meaning: "lively and vigorous calligraphy; flamboyant" },
    { word: "马到成功", pinyin: "mǎ dào chéng gōng", meaning: "instant success upon arrival" },
    { word: "南辕北辙", pinyin: "nán yuán běi zhé", meaning: "to go south by driving the chariot north; acting against one's purpose" },
    { word: "破釜沉舟", pinyin: "pò fǔ chén zhōu", meaning: "to burn one's boats; total commitment" },
    { word: "千变万化", pinyin: "qiān biàn wàn huà", meaning: "ever-changing; infinitely varied" },
    { word: "日积月累", pinyin: "rì jī yuè lěi", meaning: "accumulated over time; built up day by day" },
    { word: "三心二意", pinyin: "sān xīn èr yì", meaning: "half-hearted; of two minds" },
    { word: "守株待兔", pinyin: "shǒu zhū dài tù", meaning: "to wait by a tree stump for a rabbit; to trust to chance" },
    { word: "天翻地覆", pinyin: "tiān fān dì fù", meaning: "earth-shattering; turned upside down" },
    { word: "万众一心", pinyin: "wàn zhòng yī xīn", meaning: "millions of people all of one mind; united" },
    { word: "心想事成", pinyin: "xīn xiǎng shì chéng", meaning: "may all your wishes come true" },
    { word: "叶公好龙", pinyin: "yè gōng hào lóng", meaning: "to profess love for what one really fears" },
    { word: "自相矛盾", pinyin: "zì xiāng máo dùn", meaning: "self-contradictory" },
    { word: "对牛弹琴", pinyin: "duì niú tán qín", meaning: "to play the lute to a cow; pearls before swine" },
    { word: "入乡随俗", pinyin: "rù xiāng suí sú", meaning: "when in Rome, do as the Romans do" },
    { word: "掩耳盗铃", pinyin: "yǎn ěr dào líng", meaning: "to cover one's ears while stealing a bell; self-deception" },
    { word: "杯弓蛇影", pinyin: "bēi gōng shé yǐng", meaning: "seeing imaginary fears; being paranoid" },
    { word: "亡羊补牢", pinyin: "wáng yáng bǔ láo", meaning: "to mend the pen after a sheep is lost; better late than never" },
    { word: "鹤立鸡群", pinyin: "hè lì jī qún", meaning: "to stand out from the crowd like a crane among chickens" },
    { word: "胸有成竹", pinyin: "xiōng yǒu chéng zhú", meaning: "to have a well-thought-out plan; confident" },
    { word: "画龙点睛", pinyin: "huà lóng diǎn jīng", meaning: "to add the finishing touch; the crowning touch" },
    { word: "井底之蛙", pinyin: "jǐng dǐ zhī wā", meaning: "a frog at the bottom of a well; limited perspective" },
    { word: "狐假虎威", pinyin: "hú jiǎ hǔ wēi", meaning: "the fox borrows the tiger's power; bullying by flaunting connections" },
    { word: "愚公移山", pinyin: "yú gōng yí shān", meaning: "the Foolish Old Man moves mountains; perseverance conquers all" },
    { word: "塞翁失马", pinyin: "sài wēng shī mǎ", meaning: "a blessing in disguise" },
    { word: "卧薪尝胆", pinyin: "wò xīn cháng dǎn", meaning: "to sleep on brushwood and taste gall; to endure hardship for revenge" },
    { word: "百发百中", pinyin: "bǎi fā bǎi zhòng", meaning: "every shot hits the target; infallible" },
    { word: "走马观花", pinyin: "zǒu mǎ guān huā", meaning: "to look at flowers from horseback; a superficial understanding" },
    { word: "指鹿为马", pinyin: "zhǐ lù wéi mǎ", meaning: "to call a deer a horse; deliberate misrepresentation" },
    { word: "班门弄斧", pinyin: "bān mén nòng fǔ", meaning: "to show off before an expert; to teach one's grandmother to suck eggs" },
    { word: "杞人忧天", pinyin: "qǐ rén yōu tiān", meaning: "unnecessary worry; to be a worrywart" },
    { word: "四面楚歌", pinyin: "sì miàn chǔ gē", meaning: "surrounded by enemies on all sides; isolated and besieged" },
    { word: "完璧归赵", pinyin: "wán bì guī zhào", meaning: "to return something intact to its owner" },
    { word: "负荆请罪", pinyin: "fù jīng qǐng zuì", meaning: "to offer a humble apology; carrying thorns to ask for punishment" },
    { word: "纸上谈兵", pinyin: "zhǐ shàng tán bīng", meaning: "armchair strategist; to theorize without practice" },
    { word: "朝三暮四", pinyin: "zhāo sān mù sì", meaning: "to blow hot and cold; fickle" },
    { word: "水落石出", pinyin: "shuǐ luò shí chū", meaning: "the truth comes to light" },
    { word: "前车之鉴", pinyin: "qián chē zhī jiàn", meaning: "lessons drawn from others' mistakes" },
    { word: "悬梁刺股", pinyin: "xuán liáng cì gǔ", meaning: "to study extremely hard; tying hair to a beam and pricking thigh" },
    { word: "闻鸡起舞", pinyin: "wén jī qǐ wǔ", meaning: "to rise at the crow of the rooster to practice sword; diligent self-improvement" },
    { word: "精卫填海", pinyin: "jīng wèi tián hǎi", meaning: "dogged determination; to pursue an impossible task" },
];

// Build a Set of all valid 4-character words for guess validation
// In a full version, this would be a much larger dictionary.
// For now, we accept any 4-character input containing Chinese characters.
const VALID_WORD_SET = new Set(WORD_LIST.map(entry => entry.word));