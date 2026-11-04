/*
 * Block-Palette: jeder Eintrag entspricht genau einem Minecraft-Block (Java Edition ID).
 * shape: full (ganzer Block), slab (untere Stufe), carpet (Teppich/Schiene),
 *        fence (Zaun/Gitter/Pfosten), plant (Pflanze/Blume), small (Laterne o. ä.)
 * Farben sind eigene Annäherungen – es werden keine Original-Texturen verwendet.
 */
const BLOCKS = {
  // Stein
  stone:                 { n: 'Stein',                      id: 'stone',                      c: '#7f7f7f' },
  stone_bricks:          { n: 'Steinziegel',                id: 'stone_bricks',               c: '#77777a' },
  chiseled_stone_bricks: { n: 'Gemeißelte Steinziegel',     id: 'chiseled_stone_bricks',      c: '#6f6f72' },
  cobblestone:           { n: 'Bruchstein',                 id: 'cobblestone',                c: '#6a6a6a' },
  mossy_cobblestone:     { n: 'Bemooster Bruchstein',       id: 'mossy_cobblestone',          c: '#5f7352' },
  andesite:              { n: 'Andesit',                    id: 'andesite',                   c: '#8a8a8c' },
  polished_andesite:     { n: 'Polierter Andesit',          id: 'polished_andesite',          c: '#8f9493' },
  smooth_stone:          { n: 'Glatter Stein',              id: 'smooth_stone',               c: '#a3a3a3' },
  smooth_stone_slab:     { n: 'Glatte Steinstufe',          id: 'smooth_stone_slab',          c: '#adadad', shape: 'slab' },
  stone_brick_slab:      { n: 'Steinziegelstufe',           id: 'stone_brick_slab',           c: '#7d7d80', shape: 'slab' },
  deepslate_bricks:      { n: 'Tiefenschieferziegel',       id: 'deepslate_bricks',           c: '#4a4a4f' },
  deepslate_tiles:       { n: 'Tiefenschieferfliesen',      id: 'deepslate_tiles',            c: '#38383c' },
  deepslate_tile_slab:   { n: 'Tiefenschieferfliesenstufe', id: 'deepslate_tile_slab',        c: '#3d3d41', shape: 'slab' },
  polished_blackstone:   { n: 'Polierter Schwarzstein',     id: 'polished_blackstone',        c: '#36313b' },
  snow_block:            { n: 'Schneeblock',                id: 'snow_block',                 c: '#f3f8f8' },

  // Quarz & Beton
  quartz_block:          { n: 'Quarzblock',                 id: 'quartz_block',               c: '#ebe6df' },
  quartz_pillar:         { n: 'Quarzsäule',                 id: 'quartz_pillar',              c: '#e2dcd2' },
  chiseled_quartz_block: { n: 'Gemeißelter Quarzblock',     id: 'chiseled_quartz_block',      c: '#ddd6ca' },
  smooth_quartz:         { n: 'Glatter Quarz',              id: 'smooth_quartz',              c: '#f1ede7' },
  smooth_quartz_slab:    { n: 'Glatte Quarzstufe',          id: 'smooth_quartz_slab',         c: '#f4f0ea', shape: 'slab' },
  white_concrete:        { n: 'Weißer Beton',               id: 'white_concrete',             c: '#d3d8d9' },
  light_gray_concrete:   { n: 'Hellgrauer Beton',           id: 'light_gray_concrete',        c: '#8e8e86' },
  gray_concrete:         { n: 'Grauer Beton',               id: 'gray_concrete',              c: '#45484d' },
  black_concrete:        { n: 'Schwarzer Beton',            id: 'black_concrete',             c: '#16181d' },
  red_concrete:          { n: 'Roter Beton',                id: 'red_concrete',               c: '#912424' },
  yellow_concrete:       { n: 'Gelber Beton',               id: 'yellow_concrete',            c: '#eeb11a' },
  cyan_concrete:         { n: 'Türkiser Beton',             id: 'cyan_concrete',              c: '#167885' },

  // Metall & Edel
  gold_block:            { n: 'Goldblock',                  id: 'gold_block',                 c: '#f3cf3d' },
  iron_block:            { n: 'Eisenblock',                 id: 'iron_block',                 c: '#d9d9d9' },
  diamond_block:         { n: 'Diamantblock',               id: 'diamond_block',              c: '#62dcd3' },
  emerald_block:         { n: 'Smaragdblock',               id: 'emerald_block',              c: '#2bc062' },
  redstone_block:        { n: 'Redstone-Block',             id: 'redstone_block',             c: '#a8190c' },
  coal_block:            { n: 'Kohleblock',                 id: 'coal_block',                 c: '#1b1b1b' },
  coal_ore:              { n: 'Steinkohle',                 id: 'coal_ore',                   c: '#4f4f4f' },
  cut_copper:            { n: 'Geschnittener Kupferblock',  id: 'cut_copper',                 c: '#bf6c50' },
  iron_bars:             { n: 'Eisengitter',                id: 'iron_bars',                  c: '#6c6e70', shape: 'fence' },
  chain:                 { n: 'Kette',                      id: 'chain',                      c: '#3c4049', shape: 'fence' },
  rail:                  { n: 'Schiene',                    id: 'rail',                       c: '#8b7b5e', shape: 'carpet' },

  // Glas & Wasser (durchsichtig)
  glass:                 { n: 'Glas',                       id: 'glass',                      c: '#cfe8f2', t: true },
  light_blue_stained_glass: { n: 'Hellblau gefärbtes Glas', id: 'light_blue_stained_glass',   c: '#6aa7dc', t: true },
  gray_stained_glass:    { n: 'Grau gefärbtes Glas',        id: 'gray_stained_glass',         c: '#5a5f66', t: true },
  water:                 { n: 'Wasser',                     id: 'water',                      c: '#3a6fd8', t: true },

  // Holz
  oak_planks:            { n: 'Eichenholzbretter',          id: 'oak_planks',                 c: '#a8874f' },
  oak_log:               { n: 'Eichenstamm',                id: 'oak_log',                    c: '#6b5332' },
  oak_slab:              { n: 'Eichenholzstufe',            id: 'oak_slab',                   c: '#ae8d55', shape: 'slab' },
  oak_fence:             { n: 'Eichenholzzaun',             id: 'oak_fence',                  c: '#a8874f', shape: 'fence' },
  oak_leaves:            { n: 'Eichenlaub',                 id: 'oak_leaves',                 c: '#4a8a2c' },
  spruce_planks:         { n: 'Fichtenholzbretter',         id: 'spruce_planks',              c: '#6f5233' },
  spruce_log:            { n: 'Fichtenstamm',               id: 'spruce_log',                 c: '#3d2b18' },
  spruce_slab:           { n: 'Fichtenholzstufe',           id: 'spruce_slab',                c: '#735637', shape: 'slab' },
  spruce_fence:          { n: 'Fichtenholzzaun',            id: 'spruce_fence',               c: '#6f5233', shape: 'fence' },
  spruce_leaves:         { n: 'Fichtennadeln',              id: 'spruce_leaves',              c: '#365a37' },
  stripped_spruce_log:   { n: 'Entrindeter Fichtenstamm',   id: 'stripped_spruce_log',        c: '#80653f' },
  dark_oak_planks:       { n: 'Schwarzeichenholzbretter',   id: 'dark_oak_planks',            c: '#45301a' },
  dark_oak_log:          { n: 'Schwarzeichenstamm',         id: 'dark_oak_log',               c: '#3a2c1a' },
  dark_oak_slab:         { n: 'Schwarzeichenholzstufe',     id: 'dark_oak_slab',              c: '#4a341d', shape: 'slab' },
  birch_planks:          { n: 'Birkenholzbretter',          id: 'birch_planks',               c: '#c7b67d' },
  barrel:                { n: 'Fass',                       id: 'barrel',                     c: '#87633a' },
  hay_block:             { n: 'Strohballen',                id: 'hay_block',                  c: '#b89e2c' },
  bookshelf:             { n: 'Bücherregal',                id: 'bookshelf',                  c: '#7a5a37' },

  // Ziegel & Lehm
  bricks:                { n: 'Ziegelsteine',               id: 'bricks',                     c: '#96543f' },
  brick_slab:            { n: 'Ziegelstufe',                id: 'brick_slab',                 c: '#9c5944', shape: 'slab' },
  terracotta:            { n: 'Keramik',                    id: 'terracotta',                 c: '#985e43' },
  red_terracotta:        { n: 'Rote Keramik',               id: 'red_terracotta',             c: '#8f3d2e' },
  white_terracotta:      { n: 'Weiße Keramik',              id: 'white_terracotta',           c: '#d1b2a1' },

  // Natur
  grass_block:           { n: 'Grasblock',                  id: 'grass_block',                c: '#62a03c' },
  dirt:                  { n: 'Erde',                       id: 'dirt',                       c: '#866043' },
  coarse_dirt:           { n: 'Grobe Erde',                 id: 'coarse_dirt',                c: '#77553b' },
  dirt_path:             { n: 'Trampelpfad',                id: 'dirt_path',                  c: '#9a7d45' },
  farmland:              { n: 'Ackerboden',                 id: 'farmland',                   c: '#5b3b1f' },
  gravel:                { n: 'Kies',                       id: 'gravel',                     c: '#85807e' },
  sand:                  { n: 'Sand',                       id: 'sand',                       c: '#dccfa0' },
  sandstone:             { n: 'Sandstein',                  id: 'sandstone',                  c: '#d6c78f' },
  wheat:                 { n: 'Weizen (Pflanze)',           id: 'wheat',                      c: '#cdb54a', shape: 'plant' },
  white_tulip:           { n: 'Weiße Tulpe',                id: 'white_tulip',                c: '#f2f2ee', shape: 'plant' },
  rose_bush:             { n: 'Rosenstrauch',               id: 'rose_bush',                  c: '#c22a2a', shape: 'plant' },
  sea_lantern:           { n: 'Seelaterne',                 id: 'sea_lantern',                c: '#bcdcd2' },
  glowstone:             { n: 'Leuchtstein',                id: 'glowstone',                  c: '#e9c47a' },
  lantern:               { n: 'Laterne',                    id: 'lantern',                    c: '#e2a94a', shape: 'small' },
  prismarine:            { n: 'Prismarin',                  id: 'prismarine',                 c: '#62a291' },
  dark_prismarine:       { n: 'Dunkler Prismarin',          id: 'dark_prismarine',            c: '#355d4f' },

  // Wolle
  white_wool:            { n: 'Weiße Wolle',                id: 'white_wool',                 c: '#e8ecec' },
  red_wool:              { n: 'Rote Wolle',                 id: 'red_wool',                   c: '#a2282a' },
  blue_wool:             { n: 'Blaue Wolle',                id: 'blue_wool',                  c: '#3d45a8' },
  yellow_wool:           { n: 'Gelbe Wolle',                id: 'yellow_wool',                c: '#f2c22c' },
  green_wool:            { n: 'Grüne Wolle',                id: 'green_wool',                 c: '#566f1d' },
  purple_wool:           { n: 'Violette Wolle',             id: 'purple_wool',                c: '#7a2aad' },
  red_carpet:            { n: 'Roter Teppich',              id: 'red_carpet',                 c: '#a2282a', shape: 'carpet' },
};
