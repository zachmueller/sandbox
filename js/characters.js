/**
 * Stroke-Order Game - Character Data
 * Each entry is a Chinese character with exactly 7 strokes, including stroke-order data.
 * Stroke types use standard Chinese calligraphy terminology.
 */

const CHARACTER_LIST = [
    { character: "你", pinyin: "nǐ", meaning: "you", strokeCount: 7, strokes: ["撇", "竖", "撇", "横折钩", "竖", "横", "竖钩"] },
    { character: "花", pinyin: "huā", meaning: "flower", strokeCount: 7, strokes: ["横", "竖", "竖", "撇", "竖", "撇", "竖弯钩"] },
    { character: "我", pinyin: "wǒ", meaning: "I; me", strokeCount: 7, strokes: ["撇", "横", "竖钩", "提", "斜钩", "撇", "点"] },
    { character: "完", pinyin: "wán", meaning: "complete; finish", strokeCount: 7, strokes: ["点", "点", "横撇", "横", "横", "撇", "竖弯钩"] },
    { character: "还", pinyin: "hái", meaning: "still; yet", strokeCount: 7, strokes: ["横", "竖", "横", "撇", "点", "横折折撇", "捺"] },
    { character: "进", pinyin: "jìn", meaning: "enter; advance", strokeCount: 7, strokes: ["横", "横", "撇", "竖", "横折折撇", "捺", "点"] },
    { character: "近", pinyin: "jìn", meaning: "near; close", strokeCount: 7, strokes: ["撇", "撇", "横", "竖", "横折折撇", "捺", "点"] },
    { character: "运", pinyin: "yùn", meaning: "transport; luck", strokeCount: 7, strokes: ["横", "横", "撇", "捺", "横折折撇", "捺", "点"] },
    { character: "远", pinyin: "yuǎn", meaning: "far; distant", strokeCount: 7, strokes: ["横", "横", "撇", "竖弯钩", "横折折撇", "捺", "点"] },
    { character: "连", pinyin: "lián", meaning: "connect; link", strokeCount: 7, strokes: ["横", "撇折", "横", "竖", "横折折撇", "捺", "点"] },
    { character: "别", pinyin: "bié", meaning: "don't; other", strokeCount: 7, strokes: ["竖", "横折", "横", "撇", "竖", "竖钩", "撇"] },
    { character: "利", pinyin: "lì", meaning: "benefit; sharp", strokeCount: 7, strokes: ["撇", "横", "竖", "撇", "竖", "竖钩", "撇"] },
    { character: "体", pinyin: "tǐ", meaning: "body; form", strokeCount: 7, strokes: ["撇", "竖", "横", "竖", "撇", "捺", "横"] },
    { character: "住", pinyin: "zhù", meaning: "live; reside", strokeCount: 7, strokes: ["撇", "竖", "点", "横", "横", "竖", "横"] },
    { character: "作", pinyin: "zuò", meaning: "do; make", strokeCount: 7, strokes: ["撇", "竖", "撇", "横", "竖", "撇", "横"] },
    { character: "但", pinyin: "dàn", meaning: "but; however", strokeCount: 7, strokes: ["撇", "竖", "竖", "横折", "横", "横", "横"] },
    { character: "低", pinyin: "dī", meaning: "low", strokeCount: 7, strokes: ["撇", "竖", "撇", "横折", "竖", "横撇", "捺"] },
    { character: "每", pinyin: "měi", meaning: "every; each", strokeCount: 7, strokes: ["撇", "横", "竖折", "横", "竖", "横", "捺"] },
    { character: "快", pinyin: "kuài", meaning: "fast; happy", strokeCount: 7, strokes: ["点", "点", "竖", "横", "撇", "捺", "竖"] },
    { character: "冷", pinyin: "lěng", meaning: "cold", strokeCount: 7, strokes: ["点", "提", "撇", "捺", "点", "横撇", "点"] },
    { character: "找", pinyin: "zhǎo", meaning: "look for; find", strokeCount: 7, strokes: ["横", "竖钩", "提", "撇", "横", "撇", "捺"] },
    { character: "把", pinyin: "bǎ", meaning: "hold; handle", strokeCount: 7, strokes: ["横", "竖钩", "提", "横折", "竖", "横", "竖弯钩"] },
    { character: "报", pinyin: "bào", meaning: "report; newspaper", strokeCount: 7, strokes: ["横", "竖钩", "提", "横折钩", "竖", "横撇", "捺"] },
    { character: "走", pinyin: "zǒu", meaning: "walk; go", strokeCount: 7, strokes: ["横", "竖", "横", "竖", "横", "撇", "捺"] },
    { character: "足", pinyin: "zú", meaning: "foot; enough", strokeCount: 7, strokes: ["竖", "横折", "横", "竖", "横", "撇", "捺"] },
    { character: "时", pinyin: "shí", meaning: "time", strokeCount: 7, strokes: ["竖", "横折", "横", "横", "横", "竖钩", "点"] },
    { character: "告", pinyin: "gào", meaning: "tell; inform", strokeCount: 7, strokes: ["撇", "横", "竖", "横", "竖", "横折", "横"] },
    { character: "声", pinyin: "shēng", meaning: "sound; voice", strokeCount: 7, strokes: ["横", "竖", "横", "横折", "竖", "横", "撇"] },
    { character: "男", pinyin: "nán", meaning: "male; man", strokeCount: 7, strokes: ["竖", "横折", "横", "竖", "横", "横折钩", "竖"] },
    { character: "园", pinyin: "yuán", meaning: "garden; park", strokeCount: 7, strokes: ["竖", "横折", "横", "横", "撇", "竖弯钩", "竖"] },
    { character: "忘", pinyin: "wàng", meaning: "forget", strokeCount: 7, strokes: ["点", "横", "竖折", "竖", "点", "斜钩", "点"] },
    { character: "张", pinyin: "zhāng", meaning: "open; sheet (measure word)", strokeCount: 7, strokes: ["横折", "横", "竖折", "竖", "撇", "横", "竖弯钩"] },
    { character: "坐", pinyin: "zuò", meaning: "sit", strokeCount: 7, strokes: ["撇", "捺", "撇", "捺", "横", "竖", "横"] },
    { character: "词", pinyin: "cí", meaning: "word; phrase", strokeCount: 7, strokes: ["点", "横折", "横", "竖", "横折", "横", "竖钩"] },
    { character: "步", pinyin: "bù", meaning: "step; walk", strokeCount: 7, strokes: ["竖", "横", "竖", "横", "竖", "撇", "撇"] },
    { character: "际", pinyin: "jì", meaning: "border; occasion", strokeCount: 7, strokes: ["横折折撇", "竖", "撇", "横撇", "捺", "横", "横"] },
    { character: "层", pinyin: "céng", meaning: "layer; floor", strokeCount: 7, strokes: ["横折", "横", "撇", "横", "竖", "横折", "横"] },
    { character: "弟", pinyin: "dì", meaning: "younger brother", strokeCount: 7, strokes: ["点", "撇", "横折钩", "竖", "撇", "竖弯钩", "竖"] },
    { character: "李", pinyin: "lǐ", meaning: "plum; surname Li", strokeCount: 7, strokes: ["横", "竖", "撇", "捺", "横折钩", "竖", "横"] },
    { character: "村", pinyin: "cūn", meaning: "village", strokeCount: 7, strokes: ["横", "竖", "撇", "捺", "横", "竖钩", "点"] },
    { character: "医", pinyin: "yī", meaning: "medicine; doctor", strokeCount: 7, strokes: ["横", "撇", "横", "横", "撇", "横折钩", "横"] },
    { character: "决", pinyin: "jué", meaning: "decide; determine", strokeCount: 7, strokes: ["点", "提", "横折", "横", "撇", "捺", "点"] },
    { character: "护", pinyin: "hù", meaning: "protect; guard", strokeCount: 7, strokes: ["横", "竖钩", "提", "横折", "横", "竖弯钩", "点"] },
    { character: "改", pinyin: "gǎi", meaning: "change; correct", strokeCount: 7, strokes: ["横折", "横", "竖", "横", "撇", "横", "捺"] },
    { character: "希", pinyin: "xī", meaning: "hope; rare", strokeCount: 7, strokes: ["撇", "捺", "竖", "横折", "横", "撇", "竖弯钩"] },
];

/**
 * Derive the set of stroke types actually used in the character list.
 * This determines which buttons appear in the palette.
 */
const STROKE_TYPES_USED = (() => {
    const set = new Set();
    CHARACTER_LIST.forEach(entry => entry.strokes.forEach(s => set.add(s)));
    return set;
})();

/**
 * All fundamental stroke types in display order, grouped by category.
 * Only strokes present in STROKE_TYPES_USED will be shown in the palette.
 */
const ALL_STROKE_TYPES = [
    // Basic strokes
    { name: "横", pinyin: "héng", category: "basic" },
    { name: "竖", pinyin: "shù", category: "basic" },
    { name: "撇", pinyin: "piě", category: "basic" },
    { name: "捺", pinyin: "nà", category: "basic" },
    { name: "点", pinyin: "diǎn", category: "basic" },
    { name: "提", pinyin: "tí", category: "basic" },
    // Compound strokes
    { name: "横折", pinyin: "héngzhé", category: "compound" },
    { name: "竖折", pinyin: "shùzhé", category: "compound" },
    { name: "横撇", pinyin: "héngpiě", category: "compound" },
    { name: "撇折", pinyin: "piězhé", category: "compound" },
    // Hooks
    { name: "横折钩", pinyin: "héngzhégōu", category: "hook" },
    { name: "竖钩", pinyin: "shùgōu", category: "hook" },
    { name: "弯钩", pinyin: "wāngōu", category: "hook" },
    { name: "斜钩", pinyin: "xiégōu", category: "hook" },
    { name: "横折弯钩", pinyin: "héngzhéwāngōu", category: "hook" },
    { name: "竖弯钩", pinyin: "shùwāngōu", category: "hook" },
    // Complex compound
    { name: "横折折撇", pinyin: "héngzhézhépiě", category: "complex" },
];

/**
 * Filtered stroke types: only those that appear in our character data.
 */
const PALETTE_STROKES = ALL_STROKE_TYPES.filter(s => STROKE_TYPES_USED.has(s.name));