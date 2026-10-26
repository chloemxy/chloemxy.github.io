// What is in the drawers: one herb per drawer, filled along each row from
// the top left. Each drawer holds a specimen card, painted for you in
// src/paint.js: a pressed-plant drawing and the names on the front, notes
// on the back. The same text is read out to screen readers.
//
// `label` is the old pharmacopoeia name lettered on the drawer front
// (Fol. = leaves, Flor. = flowers, Herb. = the whole herb, Rad. = root,
// Rhiz. = rhizome, Fruct. = fruit or seed).
//
// `plant` describes the drawing:
//   leaf: shape (oval, lance, reed, heart, toothed, lobed, needle, small,
//         feather, thread, compound), len and wid as fractions of the
//         drawing's height, and colour
//   arrange: 'opposite' or 'alternate' up the stem; rosette: leaves from
//         the base instead
//   flower: type (spike, whorl, daisy, umbel, star, scatter, catkin, tilia,
//         none), colour, and disc for daisies
//   root: taproot, fibrous or rhizome, drawn below the ground line
//   heads: how many flowering branches

export const herbs = [
  {
    id: 'sage', label: 'Fol. Salviae', latin: 'Salvia officinalis', common: 'Common sage', family: 'Lamiaceae',
    part: 'Leaves', gathered: 'Early summer, before the flowers open',
    use: 'Long kept for sore throats and used as a gargle. The old herbals ask why a man should die who has sage growing in his garden.',
    prep: 'Infused in hot water, or steeped in vinegar to make a rinse.',
    plant: { leaf: { shape: 'oval', len: 0.2, wid: 0.05, colour: '#8f9f84' }, arrange: 'opposite', nodes: 5, flower: { type: 'spike', colour: '#8467b5' } },
  },
  {
    id: 'lavender', label: 'Flor. Lavand.', latin: 'Lavandula angustifolia', common: 'Lavender', family: 'Lamiaceae',
    part: 'Flower spikes', gathered: 'July, as the first buds open',
    use: 'Sewn into linen sachets to keep moths out of the wardrobe and to scent the sheets; strewn on floors in the sickroom.',
    prep: 'Cut with long stalks and hung head down in bunches, in a dark and airy room.',
    plant: { leaf: { shape: 'needle', len: 0.15, wid: 0.012, colour: '#98a796' }, arrange: 'opposite', nodes: 6, heads: 3, flower: { type: 'spike', colour: '#7461c0' } },
  },
  {
    id: 'chamomile', label: 'Flor. Chamom.', latin: 'Matricaria chamomilla', common: 'German chamomile', family: 'Asteraceae',
    part: 'Flower heads', gathered: 'Midsummer, on a dry morning',
    use: 'A mild tea for the end of the day, and a rinse said to brighten fair hair.',
    prep: 'The heads are dried whole on paper, then infused, covered, for ten minutes.',
    plant: { leaf: { shape: 'feather', len: 0.15, wid: 0.035, colour: '#7f9f5c' }, arrange: 'alternate', nodes: 6, heads: 4, flower: { type: 'daisy', colour: '#fbf8ef', disc: '#e8b62c', size: 0.05 } },
  },
  {
    id: 'peppermint', label: 'Fol. Menth. Pip.', latin: 'Mentha × piperita', common: 'Peppermint', family: 'Lamiaceae',
    part: 'Leaves', gathered: 'Just before flowering, in the morning',
    use: 'Taken after heavy meals; its oil went into the lozenges sold by every chemist.',
    prep: 'Dried quickly in the shade, so the leaves keep their green.',
    plant: { leaf: { shape: 'toothed', len: 0.17, wid: 0.055, colour: '#5f8f4e' }, arrange: 'opposite', nodes: 5, flower: { type: 'spike', colour: '#bfa6d9' } },
  },
  {
    id: 'rosemary', label: 'Fol. Rosmarin.', latin: 'Salvia rosmarinus', common: 'Rosemary', family: 'Lamiaceae',
    part: 'Leaves and young tops', gathered: 'Any time of year, best in spring',
    use: 'For remembrance: carried at weddings and funerals, and burned to sweeten the air of a sickroom.',
    prep: 'Stripped from the woody stems once dry. Formerly named Rosmarinus officinalis.',
    plant: { leaf: { shape: 'needle', len: 0.11, wid: 0.012, colour: '#56735a' }, arrange: 'alternate', nodes: 16, heads: 2, flower: { type: 'scatter', colour: '#9db3df' } },
  },
  {
    id: 'thyme', label: 'Herb. Thymi', latin: 'Thymus vulgaris', common: 'Garden thyme', family: 'Lamiaceae',
    part: 'Leafy tops', gathered: 'Early summer, in flower',
    use: 'A cough remedy of long standing, and a keeper of meat in the kitchen.',
    prep: 'Bunched and dried, then rubbed from the stems through a sieve.',
    plant: { leaf: { shape: 'small', len: 0.04, wid: 0.014, colour: '#6f8a5e' }, arrange: 'opposite', nodes: 12, heads: 4, flower: { type: 'whorl', colour: '#d9aac6' } },
  },
  {
    id: 'calendula', label: 'Flor. Calendul.', latin: 'Calendula officinalis', common: 'Pot marigold', family: 'Asteraceae',
    part: 'Petals', gathered: 'All summer, as the flowers open fully',
    use: 'Petals in salves for chapped skin, and a cheap stand-in for saffron to colour butter and cheese.',
    prep: 'Petals pulled and dried on paper, out of the sun, so they keep their orange.',
    plant: { leaf: { shape: 'lance', len: 0.17, wid: 0.04, colour: '#7f9e57' }, arrange: 'alternate', nodes: 6, heads: 2, flower: { type: 'daisy', colour: '#ee8a1c', disc: '#a8520f', size: 0.075 } },
  },
  {
    id: 'elder', label: 'Flor. Sambuc.', latin: 'Sambucus nigra', common: 'Elder', family: 'Adoxaceae',
    part: 'Flowers and berries', gathered: 'Flowers in June, berries in September',
    use: 'Flowers for cordial and a hot tea taken for colds; the berries made into a winter syrup, always cooked first.',
    prep: 'Flower heads shaken over paper as they dry, and the stalks sifted out.',
    plant: { leaf: { shape: 'compound', leaflet: 'toothed', len: 0.24, wid: 0.035, colour: '#5d8248' }, arrange: 'opposite', nodes: 3, flower: { type: 'umbel', colour: '#f3ecd2', size: 0.17 } },
  },
  {
    id: 'yarrow', label: 'Herb. Millefol.', latin: 'Achillea millefolium', common: 'Yarrow', family: 'Asteraceae',
    part: 'Flowering tops', gathered: 'High summer, in full flower',
    use: 'Called soldier’s woundwort, and pressed onto cuts to stop the bleeding, as Achilles was said to have done.',
    prep: 'The tops dried in bunches and crumbled.',
    plant: { leaf: { shape: 'feather', len: 0.18, wid: 0.03, colour: '#6f9050' }, arrange: 'alternate', nodes: 7, flower: { type: 'umbel', colour: '#f6f0ea', flat: true, size: 0.15 } },
  },
  {
    id: 'stjohns', label: 'Herb. Hyperic.', latin: 'Hypericum perforatum', common: 'St John’s wort', family: 'Hypericaceae',
    part: 'Flowering tops', gathered: 'Around 24 June, St John’s Day',
    use: 'Steeped in oil, which turns blood red, for bruises and burns. Hold a leaf to the light to see the tiny clear dots that give it its name.',
    prep: 'Fresh tops packed into a jar of oil and left in the sun for six weeks.',
    plant: { leaf: { shape: 'oval', len: 0.07, wid: 0.018, colour: '#6d8f4d' }, arrange: 'opposite', nodes: 8, heads: 4, flower: { type: 'star', colour: '#f3c22c', size: 0.035 } },
  },
  {
    id: 'balm', label: 'Fol. Meliss.', latin: 'Melissa officinalis', common: 'Lemon balm', family: 'Lamiaceae',
    part: 'Leaves', gathered: 'Just as the flowers form',
    use: 'Planted by beekeepers to keep a swarm close to home, and taken as a tea to lift the spirits.',
    prep: 'Dried gently, since the lemon scent is quickly lost to heat.',
    plant: { leaf: { shape: 'toothed', len: 0.13, wid: 0.06, colour: '#79a35a' }, arrange: 'opposite', nodes: 6, flower: { type: 'whorl', colour: '#f1ede2' } },
  },
  {
    id: 'nettle', label: 'Herb. Urtic.', latin: 'Urtica dioica', common: 'Stinging nettle', family: 'Urticaceae',
    part: 'Young tops', gathered: 'Spring, wearing gloves',
    use: 'A spring tonic and a soup; the fibres of the stems were once spun and woven into cloth.',
    prep: 'Wilted or dried, which takes away the sting.',
    plant: { leaf: { shape: 'toothed', len: 0.19, wid: 0.06, colour: '#4f7a3c' }, arrange: 'opposite', nodes: 5, flower: { type: 'catkin', colour: '#9fb27a' } },
  },
  {
    id: 'dandelion', label: 'Rad. Taraxac.', latin: 'Taraxacum officinale', common: 'Dandelion', family: 'Asteraceae',
    part: 'Root and leaves', gathered: 'Leaves in spring, roots in autumn',
    use: 'Called pissenlit in French, for good reason. The roasted root was ground as a coffee substitute.',
    prep: 'Roots scrubbed, split lengthways and dried slowly.',
    plant: { leaf: { shape: 'lobed', len: 0.32, wid: 0.06, colour: '#6c9a48' }, rosette: true, nodes: 7, flower: { type: 'daisy', colour: '#f4c430', disc: '#e9a919', size: 0.07, ray: 'fine' }, root: 'taproot' },
  },
  {
    id: 'valerian', label: 'Rad. Valerian.', latin: 'Valeriana officinalis', common: 'Valerian', family: 'Caprifoliaceae',
    part: 'Root', gathered: 'Autumn of the second year',
    use: 'A sleeping draught with a famously unpleasant smell, which cats adore.',
    prep: 'Roots washed and dried quickly, kept in a tin away from the cat.',
    plant: { leaf: { shape: 'compound', leaflet: 'lance', len: 0.22, wid: 0.022, colour: '#6a8f50' }, arrange: 'opposite', nodes: 3, flower: { type: 'umbel', colour: '#efd5df', size: 0.13 }, root: 'fibrous' },
  },
  {
    id: 'fennel', label: 'Fruct. Foenic.', latin: 'Foeniculum vulgare', common: 'Fennel', family: 'Apiaceae',
    part: 'Seeds', gathered: 'Early autumn, as the seed heads brown',
    use: 'Chewed after meals to sweeten the breath, and given to babies in gripe water.',
    prep: 'Heads cut and hung in paper bags, which catch the seed as it falls.',
    plant: { leaf: { shape: 'thread', len: 0.2, wid: 0.05, colour: '#7da35d' }, arrange: 'alternate', nodes: 5, flower: { type: 'umbel', colour: '#e2c43a', size: 0.16 } },
  },
  {
    id: 'ginger', label: 'Rhiz. Zingib.', latin: 'Zingiber officinale', common: 'Ginger', family: 'Zingiberaceae',
    part: 'Rhizome', gathered: 'Imported dried, in “hands”',
    use: 'For travel sickness and cold hands; candied, it was a sailor’s sweet.',
    prep: 'Scraped, sliced and dried, or kept whole and grated as needed.',
    plant: { leaf: { shape: 'reed', len: 0.4, wid: 0.022, colour: '#6f9a4f' }, rosette: true, reeds: true, nodes: 7, flower: { type: 'none' }, root: 'rhizome' },
  },
  {
    id: 'liquorice', label: 'Rad. Liquirit.', latin: 'Glycyrrhiza glabra', common: 'Liquorice', family: 'Fabaceae',
    part: 'Root', gathered: 'Autumn, after the third or fourth year',
    use: 'Chewed as a sweet stick, and boiled down into black lozenges for coughs. Grown at Pontefract in Yorkshire for centuries.',
    prep: 'Roots washed, cut into lengths and dried; the juice boiled to a black paste.',
    plant: { leaf: { shape: 'compound', leaflet: 'oval', len: 0.22, wid: 0.02, colour: '#6c9152' }, arrange: 'alternate', nodes: 4, flower: { type: 'spike', colour: '#b5a3dc' }, root: 'taproot' },
  },
  {
    id: 'hyssop', label: 'Herb. Hyssop.', latin: 'Hyssopus officinalis', common: 'Hyssop', family: 'Lamiaceae',
    part: 'Flowering tops', gathered: 'Late summer',
    use: 'A cleansing herb in the Psalms; later one of the flavours of absinthe and Chartreuse.',
    prep: 'Cut in flower and dried in bunches.',
    plant: { leaf: { shape: 'lance', len: 0.1, wid: 0.016, colour: '#617f53' }, arrange: 'opposite', nodes: 9, heads: 2, flower: { type: 'spike', colour: '#4f5db8' } },
  },
  {
    id: 'lime', label: 'Flor. Tiliae', latin: 'Tilia cordata', common: 'Small-leaved lime', family: 'Malvaceae',
    part: 'Flowers with their bracts', gathered: 'July, when the trees hum with bees',
    use: 'Tilleul, the French evening tea: mild, and scented of honey.',
    prep: 'Flowers dried with the pale bract still attached.',
    plant: { leaf: { shape: 'heart', len: 0.15, wid: 0.065, colour: '#7aa255' }, arrange: 'alternate', nodes: 4, heads: 3, flower: { type: 'tilia', colour: '#f2e7b4' } },
  },
  {
    id: 'rosehip', label: 'Fruct. Cynosb.', latin: 'Rosa canina', common: 'Dog rose', family: 'Rosaceae',
    part: 'Hips', gathered: 'After the first frost',
    use: 'Picked by schoolchildren in wartime Britain and made into a syrup for its vitamin C.',
    prep: 'Hips split and the hairy seeds scraped out, since they itch.',
    plant: { leaf: { shape: 'compound', leaflet: 'toothed', len: 0.17, wid: 0.03, colour: '#5e8a4a' }, arrange: 'alternate', nodes: 4, heads: 3, flower: { type: 'star', colour: '#f0b5c3', size: 0.06, hips: true } },
  },
].map((h, i) => ({ ...h, no: i + 1 }));

// The bin cabinet (v2) has sixteen pull-out bins, four across and four high,
// filled along each row from the top left. Most hold one herb; four hold a
// related pair. Each bin's cards stand on a bed of the dried herb, `fill`.
export const bins = [
  { id: 'salvia', label: 'Fol. Salviae', name: 'Sage and rosemary', fill: '#7f8c6c', herbs: ['sage', 'rosemary'] },
  { id: 'labiatae', label: 'Fol. Menth. & Meliss.', name: 'Mint and lemon balm', fill: '#5f7d48', herbs: ['peppermint', 'balm'] },
  { id: 'lavender', label: 'Flor. Lavand.', name: 'Lavender', fill: '#8574a8', herbs: ['lavender'] },
  { id: 'chamomile', label: 'Flor. Chamom.', name: 'German chamomile', fill: '#d8c98c', herbs: ['chamomile'] },
  { id: 'thyme', label: 'Herb. Thymi', name: 'Garden thyme', fill: '#76815a', herbs: ['thyme'] },
  { id: 'calendula', label: 'Flor. Calendul.', name: 'Pot marigold', fill: '#d27a26', herbs: ['calendula'] },
  { id: 'arborum', label: 'Flor. Arborum', name: 'Elder and lime blossom', fill: '#cfc08e', herbs: ['elder', 'lime'] },
  { id: 'yarrow', label: 'Herb. Millefol.', name: 'Yarrow', fill: '#8d8c66', herbs: ['yarrow'] },
  { id: 'stjohns', label: 'Herb. Hyperic.', name: 'St John’s wort', fill: '#8a7a3c', herbs: ['stjohns'] },
  { id: 'hyssop', label: 'Herb. Hyssop.', name: 'Hyssop', fill: '#5f6a8a', herbs: ['hyssop'] },
  { id: 'nettle', label: 'Herb. Urtic.', name: 'Stinging nettle', fill: '#56703f', herbs: ['nettle'] },
  { id: 'dandelion', label: 'Rad. Taraxac.', name: 'Dandelion', fill: '#8a6a45', herbs: ['dandelion'] },
  { id: 'valerian', label: 'Rad. Valerian.', name: 'Valerian', fill: '#7c6248', herbs: ['valerian'] },
  { id: 'liquorice', label: 'Rad. Liquirit.', name: 'Liquorice', fill: '#9b7a4e', herbs: ['liquorice'] },
  { id: 'ginger', label: 'Rhiz. Zingib.', name: 'Ginger', fill: '#c4a068', herbs: ['ginger'] },
  { id: 'fructus', label: 'Fructus', name: 'Fennel and rose hips', fill: '#9a5638', herbs: ['fennel', 'rosehip'] },
];

// The bin cabinet's curios: sixteen bins, filled along each row from the
// top left, each holding one to three small witchy things on a bed of
// velvet, moss or straw. `type` picks how a curio is modelled (trinkets.js);
// the rest are its options. `name` and `blurb` show when you hold it.
const velvet = (colour) => ({ kind: 'velvet', colour });
const MOSS = { kind: 'moss' }, STRAW = { kind: 'straw' };

export const curios = [
  { id: 'points', name: 'Crystal points', bed: velvet('#3b2a4a'), items: [
    { type: 'point', colour: '#f4b6cb', name: 'Rose quartz point', blurb: 'For soft hearts and gentle mornings. Keep it by the bed.' },
    { type: 'point', colour: '#eef4fa', name: 'Clear quartz point', blurb: 'The amplifier: whatever you bring to it, it makes a little louder.' },
    { type: 'point', colour: '#f3c454', name: 'Citrine point', blurb: 'Bottled sunshine, for grey days and empty purses.' },
  ] },
  { id: 'amethyst', name: 'Amethyst', bed: velvet('#22303f'), items: [
    { type: 'cluster', colour: '#9a68d6', name: 'Amethyst cluster', blurb: 'A tiny geode city. Said to keep dreams calm and wine from going to your head.' },
  ] },
  { id: 'necklaces', name: 'Necklaces', bed: velvet('#4a1f2e'), items: [
    { type: 'necklace', charm: 'moon', metal: 'gold', name: 'Crescent moon necklace', blurb: 'Best worn on a waxing moon, while things are growing.' },
    { type: 'necklace', charm: 'star', metal: 'silver', stone: '#9ec9ff', name: 'Wishing star necklace', blurb: 'One wish a night. Choose carefully.' },
  ] },
  { id: 'bracelets', name: 'Bracelets', bed: velvet('#1f3b3a'), items: [
    { type: 'bracelet', colours: ['#e9eff7', '#d4ddeb'], iridescent: true, name: 'Moonstone bracelet', blurb: 'Milky beads with a blue shimmer, like a moon behind thin cloud.' },
    { type: 'bracelet', colours: ['#8e5cc4', '#5fa47a'], charm: 'star', name: 'Amethyst and jade bracelet', blurb: 'Purple for intuition, green for luck. Wear it on the left wrist.' },
    { type: 'bracelet', colours: ['#a8682a', '#5e3714'], name: 'Tiger’s eye bracelet', blurb: 'Golden stripes that slide about as you turn your wrist. For courage.' },
  ] },
  { id: 'rings', name: 'Rings', bed: velvet('#2b2140'), items: [
    { type: 'ring', gem: '#f6efff', opal: true, metal: 'gold', name: 'Opal ring', blurb: 'A whole sky caught in a stone, changing colour with your mood.' },
    { type: 'ring', gem: '#a3203a', metal: 'silver', name: 'Garnet ring', blurb: 'Deep red, for loyalty. Traditionally given before a long journey.' },
    { type: 'ring', gem: '#3fae7a', metal: 'rose', name: 'Emerald ring', blurb: 'Green as a May morning. Brings luck to new beginnings.' },
  ] },
  { id: 'potions', name: 'Potions', bed: STRAW, items: [
    { type: 'vial', liquid: '#ff7fb2', ribbon: '#f3c6d8', name: 'Love potion', blurb: 'Rosewater, honey and a pinch of pink salt. Shake gently.' },
    { type: 'vial', liquid: '#5a7dff', ribbon: '#c9d4ff', name: 'Sleep tincture', blurb: 'Lavender and chamomile. Three drops on the pillow.' },
    { type: 'vial', liquid: '#c6b4ff', ribbon: '#efe6ff', name: 'Moon water', blurb: 'Left out under a full moon and bottled before sunrise.' },
  ] },
  { id: 'candles', name: 'Candles', bed: STRAW, items: [
    { type: 'candle', colour: '#cbb5e8', name: 'Lavender candle', blurb: 'For quiet evenings. Let it burn all the way down.' },
    { type: 'candle', colour: '#f2c860', name: 'Beeswax candle', blurb: 'Honey-scented and hand-dipped. Burns clean and slow.' },
  ] },
  { id: 'keys', name: 'Old keys', bed: MOSS, items: [
    { type: 'key', metal: 'brass', name: 'Skeleton key', blurb: 'Opens no door anyone can find. Keep it anyway.' },
    { type: 'key', metal: 'iron', name: 'Garden gate key', blurb: 'Rusty and heavy. The gate is long gone; the garden isn’t.' },
  ] },
  { id: 'charms', name: 'Charms', bed: velvet('#40243a'), items: [
    { type: 'charm', shape: 'star', metal: 'gold', name: 'Star charm', blurb: 'For wishes, and for finding your way home in the dark.' },
    { type: 'charm', shape: 'moon', metal: 'silver', name: 'Moon charm', blurb: 'For dreams, tides and changes of heart.' },
    { type: 'charm', shape: 'heart', metal: 'rose', stone: '#ff8fb0', name: 'Heart charm', blurb: 'For love, of every kind. Carry it in a coat pocket.' },
  ] },
  { id: 'tarot', name: 'Tarot cards', bed: velvet('#1d2440'), items: [
    { type: 'tarot', card: 'moon', numeral: 'XVIII', title: 'The Moon', name: 'The Moon', blurb: 'Things are not quite what they seem. Trust your dreams.' },
    { type: 'tarot', card: 'star', numeral: 'XVII', title: 'The Star', name: 'The Star', blurb: 'Hope, healing and a clear night sky after the storm.' },
    { type: 'tarot', card: 'sun', numeral: 'XIX', title: 'The Sun', name: 'The Sun', blurb: 'Warmth, joy and everything going right.' },
  ] },
  { id: 'runes', name: 'Rune stones', bed: MOSS, items: [
    { type: 'rune', glyph: 'fehu', name: 'Fehu', blurb: 'The rune of cattle and wealth: what you have, and how you share it.' },
    { type: 'rune', glyph: 'algiz', name: 'Algiz', blurb: 'Protection: an elk’s antlers raised against harm.' },
    { type: 'rune', glyph: 'berkano', name: 'Berkano', blurb: 'The birch tree: new beginnings and growing things.' },
  ] },
  { id: 'toadstools', name: 'Toadstools', bed: MOSS, items: [
    { type: 'mushroom', cap: '#d6322a', dots: true, small: true, name: 'Fly agaric pair', blurb: 'Fairy-tale toadstools in painted clay. For looking at, never for eating.' },
    { type: 'mushroom', cap: '#9a6a3e', name: 'Little brown mushroom', blurb: 'Found at the foot of an old oak. Shy, like its real cousins.' },
  ] },
  { id: 'bundles', name: 'Herb bundles', bed: STRAW, items: [
    { type: 'bundle', flower: '#8b72c9', name: 'Lavender bundle', blurb: 'Tied with garden twine. Tuck it under the pillow for sweet dreams.' },
    { type: 'bundle', flower: '#a3b493', leaves: true, name: 'Sage bundle', blurb: 'Dried white sage, for clearing the air of a room.' },
  ] },
  { id: 'scrying', name: 'Crystal ball', bed: velvet('#2a1838'), items: [
    { type: 'sphere', name: 'Scrying sphere', blurb: 'Gaze in by candlelight and let your eyes go soft. Something always swirls.' },
  ] },
  { id: 'cauldron', name: 'Cauldron', bed: STRAW, items: [
    { type: 'cauldron', glow: '#7dff8a', name: 'Tiny cauldron', blurb: 'Cast iron, three legs, and always something green bubbling away.' },
  ] },
  { id: 'pendulums', name: 'Pendulums', bed: velvet('#3a2236'), items: [
    { type: 'pendulum', colour: '#a77be0', name: 'Amethyst pendulum', blurb: 'Hold it very still and ask a yes-or-no question.' },
    { type: 'pendulum', colour: '#f3b3c7', name: 'Rose quartz pendulum', blurb: 'Swings gently toward matters of the heart.' },
  ] },
];

// What goes in each bin of the 6 × 5 cabinet: most curios get a bin to
// themselves, named for the piece; the tarot cards, rune stones and rings
// stay together as sets. That fills all thirty.
const SETS = new Set(['tarot', 'runes', 'rings']);
export const binContents = curios.flatMap((group) => (SETS.has(group.id)
  ? [group]
  : group.items.map((item, i) => ({ id: `${group.id}-${i + 1}`, name: item.name, bed: group.bed, items: [item] }))));

// and the jars on top of it
export const curioJars = [
  { label: 'Moon Water', fill: '#b9b6e6', height: 0.19, radius: 0.052, x: -0.3, z: -0.12 },
  { label: 'Star Dust', fill: '#e8d68a', height: 0.15, radius: 0.045, x: -0.17, z: -0.2 },
  { label: 'Rose Petals', fill: '#b5525e', height: 0.22, radius: 0.056, x: 0.28, z: -0.15 },
];

// Glass jars on top of the cabinet, for the look only.
export const jars = [
  { label: 'Flor. Rosae', fill: '#8c4a4a', height: 0.19, radius: 0.052, x: -0.3, z: -0.12 },
  { label: 'Sem. Lini', fill: '#7a5534', height: 0.15, radius: 0.045, x: -0.17, z: -0.2 },
  { label: 'Rad. Althaeae', fill: '#d8c8a2', height: 0.22, radius: 0.056, x: 0.28, z: -0.15 },
];
