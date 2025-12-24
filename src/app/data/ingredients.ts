import { Ingredient } from '../types/brewing';

export const MALTS: Ingredient[] = [
  // Base Malts
  { id: 'm1', name: '2-Row Pale Malt', type: 'malt', lovibond: 1.8, ppg: 37 },
  { id: 'm2', name: 'Pilsner Malt', type: 'malt', lovibond: 1.4, ppg: 37 },
  { id: 'm3', name: 'Munich Malt', type: 'malt', lovibond: 9, ppg: 35 },
  { id: 'm4', name: 'Vienna Malt', type: 'malt', lovibond: 3.5, ppg: 35 },
  { id: 'm5', name: 'Maris Otter', type: 'malt', lovibond: 3, ppg: 38 },
  { id: 'm6', name: 'Golden Promise', type: 'malt', lovibond: 2.5, ppg: 37 },
  { id: 'm7', name: 'Pale Ale Malt', type: 'malt', lovibond: 3.5, ppg: 37 },
  { id: 'm8', name: 'Wheat Malt', type: 'malt', lovibond: 2, ppg: 38 },
  { id: 'm9', name: 'Rye Malt', type: 'malt', lovibond: 3.5, ppg: 29 },
  { id: 'm10', name: 'Munich Malt (Dark)', type: 'malt', lovibond: 20, ppg: 33 },
  
  // Crystal/Caramel Malts
  { id: 'm11', name: 'Caramel/Crystal 10L', type: 'malt', lovibond: 10, ppg: 35 },
  { id: 'm12', name: 'Caramel/Crystal 20L', type: 'malt', lovibond: 20, ppg: 35 },
  { id: 'm13', name: 'Caramel/Crystal 40L', type: 'malt', lovibond: 40, ppg: 34 },
  { id: 'm14', name: 'Caramel/Crystal 60L', type: 'malt', lovibond: 60, ppg: 34 },
  { id: 'm15', name: 'Caramel/Crystal 80L', type: 'malt', lovibond: 80, ppg: 34 },
  { id: 'm16', name: 'Caramel/Crystal 120L', type: 'malt', lovibond: 120, ppg: 33 },
  { id: 'm17', name: 'Special B', type: 'malt', lovibond: 180, ppg: 30 },
  
  // Roasted Malts
  { id: 'm18', name: 'Chocolate Malt', type: 'malt', lovibond: 350, ppg: 28 },
  { id: 'm19', name: 'Pale Chocolate', type: 'malt', lovibond: 200, ppg: 30 },
  { id: 'm20', name: 'Roasted Barley', type: 'malt', lovibond: 500, ppg: 25 },
  { id: 'm21', name: 'Black Patent Malt', type: 'malt', lovibond: 500, ppg: 28 },
  { id: 'm22', name: 'Carafa I', type: 'malt', lovibond: 337, ppg: 30 },
  { id: 'm23', name: 'Carafa II', type: 'malt', lovibond: 412, ppg: 30 },
  { id: 'm24', name: 'Carafa III', type: 'malt', lovibond: 470, ppg: 30 },
  
  // Specialty Malts
  { id: 'm25', name: 'Victory Malt', type: 'malt', lovibond: 28, ppg: 34 },
  { id: 'm26', name: 'Biscuit Malt', type: 'malt', lovibond: 23, ppg: 35 },
  { id: 'm27', name: 'Aromatic Malt', type: 'malt', lovibond: 26, ppg: 36 },
  { id: 'm28', name: 'Melanoidin Malt', type: 'malt', lovibond: 28, ppg: 37 },
  { id: 'm29', name: 'Brown Malt', type: 'malt', lovibond: 65, ppg: 32 },
  { id: 'm30', name: 'Amber Malt', type: 'malt', lovibond: 30, ppg: 35 },
  { id: 'm31', name: 'Honey Malt', type: 'malt', lovibond: 25, ppg: 37 },
  { id: 'm32', name: 'Acidulated Malt', type: 'malt', lovibond: 2, ppg: 27 },
  
  // Flaked & Other
  { id: 'm33', name: 'Flaked Oats', type: 'malt', lovibond: 1, ppg: 33 },
  { id: 'm34', name: 'Flaked Wheat', type: 'malt', lovibond: 1.6, ppg: 35 },
  { id: 'm35', name: 'Flaked Barley', type: 'malt', lovibond: 1.7, ppg: 32 },
  { id: 'm36', name: 'Torrified Wheat', type: 'malt', lovibond: 1.5, ppg: 36 },
];

export const HOPS: Ingredient[] = [
  // American Hops
  { id: 'h1', name: 'Cascade', type: 'hop', alphaAcid: 5.5 },
  { id: 'h2', name: 'Centennial', type: 'hop', alphaAcid: 10 },
  { id: 'h3', name: 'Chinook', type: 'hop', alphaAcid: 13 },
  { id: 'h4', name: 'Citra', type: 'hop', alphaAcid: 12 },
  { id: 'h5', name: 'Mosaic', type: 'hop', alphaAcid: 12.25 },
  { id: 'h6', name: 'Simcoe', type: 'hop', alphaAcid: 13 },
  { id: 'h7', name: 'Amarillo', type: 'hop', alphaAcid: 8.5 },
  { id: 'h8', name: 'Columbus', type: 'hop', alphaAcid: 15 },
  { id: 'h9', name: 'Warrior', type: 'hop', alphaAcid: 16 },
  { id: 'h10', name: 'Magnum', type: 'hop', alphaAcid: 14 },
  { id: 'h11', name: 'Nugget', type: 'hop', alphaAcid: 13 },
  { id: 'h12', name: 'Willamette', type: 'hop', alphaAcid: 5 },
  { id: 'h13', name: 'Cluster', type: 'hop', alphaAcid: 7 },
  { id: 'h14', name: 'Liberty', type: 'hop', alphaAcid: 4 },
  { id: 'h15', name: 'Mount Hood', type: 'hop', alphaAcid: 6 },
  { id: 'h16', name: 'Sterling', type: 'hop', alphaAcid: 7.5 },
  { id: 'h17', name: 'Idaho 7', type: 'hop', alphaAcid: 13 },
  { id: 'h18', name: 'Azacca', type: 'hop', alphaAcid: 14.5 },
  { id: 'h19', name: 'El Dorado', type: 'hop', alphaAcid: 15 },
  { id: 'h20', name: 'Ekuanot', type: 'hop', alphaAcid: 14.5 },
  { id: 'h21', name: 'Falconer\'s Flight', type: 'hop', alphaAcid: 10.5 },
  { id: 'h22', name: 'Loral', type: 'hop', alphaAcid: 11.5 },
  { id: 'h23', name: 'Comet', type: 'hop', alphaAcid: 10 },
  { id: 'h24', name: 'CTZ (Columbus/Tomahawk/Zeus)', type: 'hop', alphaAcid: 15.5 },
  
  // European Hops
  { id: 'h25', name: 'Hallertau Mittelfrüh', type: 'hop', alphaAcid: 4 },
  { id: 'h26', name: 'Hallertau Tradition', type: 'hop', alphaAcid: 5.5 },
  { id: 'h27', name: 'Tettnang', type: 'hop', alphaAcid: 4.5 },
  { id: 'h28', name: 'Saaz', type: 'hop', alphaAcid: 3.5 },
  { id: 'h29', name: 'Spalter', type: 'hop', alphaAcid: 4.5 },
  { id: 'h30', name: 'Perle', type: 'hop', alphaAcid: 8 },
  { id: 'h31', name: 'Northern Brewer', type: 'hop', alphaAcid: 9 },
  { id: 'h32', name: 'Magnum (German)', type: 'hop', alphaAcid: 14 },
  { id: 'h33', name: 'Hersbrucker', type: 'hop', alphaAcid: 3.5 },
  { id: 'h34', name: 'Mandarina Bavaria', type: 'hop', alphaAcid: 8.5 },
  { id: 'h35', name: 'Hüll Melon', type: 'hop', alphaAcid: 7 },
  { id: 'h36', name: 'Polaris', type: 'hop', alphaAcid: 18 },
  
  // UK Hops
  { id: 'h37', name: 'East Kent Goldings', type: 'hop', alphaAcid: 5 },
  { id: 'h38', name: 'Fuggle', type: 'hop', alphaAcid: 4.5 },
  { id: 'h39', name: 'Target', type: 'hop', alphaAcid: 10.5 },
  { id: 'h40', name: 'Challenger', type: 'hop', alphaAcid: 7.5 },
  { id: 'h41', name: 'Progress', type: 'hop', alphaAcid: 6.5 },
  { id: 'h42', name: 'Bramling Cross', type: 'hop', alphaAcid: 6 },
  { id: 'h43', name: 'Admiral', type: 'hop', alphaAcid: 14 },
  { id: 'h44', name: 'Jester', type: 'hop', alphaAcid: 5.5 },
  
  // Australian/New Zealand Hops
  { id: 'h45', name: 'Galaxy', type: 'hop', alphaAcid: 14 },
  { id: 'h46', name: 'Nelson Sauvin', type: 'hop', alphaAcid: 12 },
  { id: 'h47', name: 'Motueka', type: 'hop', alphaAcid: 7 },
  { id: 'h48', name: 'Riwaka', type: 'hop', alphaAcid: 5.5 },
  { id: 'h49', name: 'Wakatu', type: 'hop', alphaAcid: 8 },
  { id: 'h50', name: 'Pacific Jade', type: 'hop', alphaAcid: 13 },
  { id: 'h51', name: 'Rakau', type: 'hop', alphaAcid: 11 },
  { id: 'h52', name: 'Enigma', type: 'hop', alphaAcid: 17 },
  { id: 'h53', name: 'Vic Secret', type: 'hop', alphaAcid: 16 },
  { id: 'h54', name: 'Ella', type: 'hop', alphaAcid: 15 },
  
  // Belgian/French Hops
  { id: 'h55', name: 'Styrian Goldings', type: 'hop', alphaAcid: 5 },
  { id: 'h56', name: 'Strisselspalt', type: 'hop', alphaAcid: 3 },
  { id: 'h57', name: 'Aramis', type: 'hop', alphaAcid: 7.5 },
  { id: 'h58', name: 'Mistral', type: 'hop', alphaAcid: 8 },
];

export const YEASTS: Ingredient[] = [
  // American Ale Yeasts
  { id: 'y1', name: 'US-05 American Ale', type: 'yeast', attenuation: 78, flocculation: 'medium', tempRange: [59, 75] },
  { id: 'y2', name: 'WLP001 California Ale', type: 'yeast', attenuation: 76, flocculation: 'medium', tempRange: [68, 73] },
  { id: 'y3', name: 'Wyeast 1056 American Ale', type: 'yeast', attenuation: 75, flocculation: 'medium', tempRange: [60, 72] },
  { id: 'y4', name: 'WLP051 California Ale V', type: 'yeast', attenuation: 77, flocculation: 'medium', tempRange: [66, 70] },
  { id: 'y5', name: 'US-04 American Ale', type: 'yeast', attenuation: 75, flocculation: 'medium', tempRange: [54, 77] },
  
  // English Ale Yeasts
  { id: 'y6', name: 'S-04 English Ale', type: 'yeast', attenuation: 75, flocculation: 'high', tempRange: [59, 75] },
  { id: 'y7', name: 'WLP002 English Ale', type: 'yeast', attenuation: 68, flocculation: 'high', tempRange: [65, 68] },
  { id: 'y8', name: 'Wyeast 1968 London ESB', type: 'yeast', attenuation: 70, flocculation: 'high', tempRange: [64, 72] },
  { id: 'y9', name: 'WLP007 Dry English Ale', type: 'yeast', attenuation: 75, flocculation: 'high', tempRange: [65, 70] },
  { id: 'y10', name: 'Wyeast 1318 London Ale III', type: 'yeast', attenuation: 75, flocculation: 'high', tempRange: [64, 74] },
  
  // Belgian Ale Yeasts
  { id: 'y11', name: 'Belgian Strong Ale', type: 'yeast', attenuation: 78, flocculation: 'medium', tempRange: [68, 78] },
  { id: 'y12', name: 'WLP500 Trappist Ale', type: 'yeast', attenuation: 78, flocculation: 'low', tempRange: [65, 72] },
  { id: 'y13', name: 'Wyeast 3787 Trappist High Gravity', type: 'yeast', attenuation: 78, flocculation: 'low', tempRange: [64, 78] },
  { id: 'y14', name: 'WLP530 Abbey Ale', type: 'yeast', attenuation: 77, flocculation: 'medium', tempRange: [66, 72] },
  { id: 'y15', name: 'T-58 Belgian Ale', type: 'yeast', attenuation: 75, flocculation: 'medium', tempRange: [59, 75] },
  { id: 'y16', name: 'WLP550 Belgian Ale', type: 'yeast', attenuation: 78, flocculation: 'medium', tempRange: [68, 78] },
  { id: 'y17', name: 'Wyeast 3942 Belgian Wheat', type: 'yeast', attenuation: 74, flocculation: 'low', tempRange: [62, 75] },
  { id: 'y18', name: 'WLP400 Belgian Wit', type: 'yeast', attenuation: 76, flocculation: 'medium', tempRange: [67, 74] },
  
  // Wheat Beer Yeasts
  { id: 'y19', name: 'WLP300 Hefeweizen', type: 'yeast', attenuation: 74, flocculation: 'low', tempRange: [68, 72] },
  { id: 'y20', name: 'Wyeast 3068 Weihenstephan Weizen', type: 'yeast', attenuation: 77, flocculation: 'low', tempRange: [64, 75] },
  { id: 'y21', name: 'WB-06 Wheat Beer', type: 'yeast', attenuation: 80, flocculation: 'low', tempRange: [59, 75] },
  
  // Lager Yeasts
  { id: 'y22', name: 'Saflager W-34/70', type: 'yeast', attenuation: 83, flocculation: 'high', tempRange: [48, 59] },
  { id: 'y23', name: 'WLP830 German Lager', type: 'yeast', attenuation: 76, flocculation: 'medium', tempRange: [50, 55] },
  { id: 'y24', name: 'Wyeast 2124 Bohemian Lager', type: 'yeast', attenuation: 73, flocculation: 'medium', tempRange: [48, 56] },
  { id: 'y25', name: 'WLP940 Mexican Lager', type: 'yeast', attenuation: 77, flocculation: 'high', tempRange: [50, 55] },
  { id: 'y26', name: 'Wyeast 2206 Bavarian Lager', type: 'yeast', attenuation: 75, flocculation: 'medium', tempRange: [46, 58] },
  { id: 'y27', name: 'S-23 Saflager', type: 'yeast', attenuation: 82, flocculation: 'high', tempRange: [54, 59] },
  
  // Other Specialty Yeasts
  { id: 'y28', name: 'WLP090 San Diego Super Yeast', type: 'yeast', attenuation: 80, flocculation: 'medium', tempRange: [65, 68] },
  { id: 'y29', name: 'Kveik Voss', type: 'yeast', attenuation: 80, flocculation: 'high', tempRange: [68, 98] },
  { id: 'y30', name: 'WLP644 Sacch. Trois', type: 'yeast', attenuation: 85, flocculation: 'medium', tempRange: [68, 85] },
  { id: 'y31', name: 'Wyeast 3711 French Saison', type: 'yeast', attenuation: 85, flocculation: 'low', tempRange: [65, 77] },
  { id: 'y32', name: 'WLP566 Belgian Saison II', type: 'yeast', attenuation: 78, flocculation: 'medium', tempRange: [68, 78] },
  { id: 'y33', name: 'Nottingham Ale Yeast', type: 'yeast', attenuation: 77, flocculation: 'high', tempRange: [57, 70] },
  { id: 'y34', name: 'Windsor Ale Yeast', type: 'yeast', attenuation: 72, flocculation: 'high', tempRange: [59, 75] },
];

export const ADJUNCTS: Ingredient[] = [
  // Sugars
  { id: 'a1', name: 'Corn Sugar (Dextrose)', type: 'adjunct' },
  { id: 'a2', name: 'Table Sugar (Sucrose)', type: 'adjunct' },
  { id: 'a3', name: 'Belgian Candi Sugar (Clear)', type: 'adjunct' },
  { id: 'a4', name: 'Belgian Candi Sugar (Dark)', type: 'adjunct' },
  { id: 'a5', name: 'Belgian Candi Syrup (Dark)', type: 'adjunct' },
  { id: 'a6', name: 'Brown Sugar', type: 'adjunct' },
  { id: 'a7', name: 'Molasses', type: 'adjunct' },
  { id: 'a8', name: 'Honey', type: 'adjunct' },
  { id: 'a9', name: 'Maple Syrup', type: 'adjunct' },
  { id: 'a10', name: 'Turbinado Sugar', type: 'adjunct' },
  { id: 'a11', name: 'Rice Syrup Solids', type: 'adjunct' },
  { id: 'a12', name: 'Invert Sugar', type: 'adjunct' },
  
  // Unfermentables
  { id: 'a13', name: 'Lactose', type: 'adjunct' },
  { id: 'a14', name: 'Maltodextrin', type: 'adjunct' },
  
  // Grains & Flakes
  { id: 'a15', name: 'Oats', type: 'adjunct' },
  { id: 'a16', name: 'Rice Hulls', type: 'adjunct' },
  { id: 'a17', name: 'Corn (Flaked)', type: 'adjunct' },
  { id: 'a18', name: 'Rice (Flaked)', type: 'adjunct' },
  
  // Kettle Additions
  { id: 'a19', name: 'Irish Moss', type: 'adjunct' },
  { id: 'a20', name: 'Whirlfloc Tablet', type: 'adjunct' },
  { id: 'a21', name: 'Yeast Nutrient', type: 'adjunct' },
  { id: 'a22', name: 'Gypsum (Calcium Sulfate)', type: 'adjunct' },
  { id: 'a23', name: 'Calcium Chloride', type: 'adjunct' },
  { id: 'a24', name: 'Lactic Acid', type: 'adjunct' },
  { id: 'a25', name: 'Phosphoric Acid', type: 'adjunct' },
  { id: 'a26', name: 'Baking Soda', type: 'adjunct' },
  { id: 'a27', name: 'Chalk (Calcium Carbonate)', type: 'adjunct' },
  { id: 'a28', name: 'Epsom Salt (Magnesium Sulfate)', type: 'adjunct' },
  
  // Spices & Flavoring
  { id: 'a29', name: 'Coriander Seed', type: 'adjunct' },
  { id: 'a30', name: 'Orange Peel (Bitter)', type: 'adjunct' },
  { id: 'a31', name: 'Orange Peel (Sweet)', type: 'adjunct' },
  { id: 'a32', name: 'Cinnamon Stick', type: 'adjunct' },
  { id: 'a33', name: 'Vanilla Bean', type: 'adjunct' },
  { id: 'a34', name: 'Vanilla Extract', type: 'adjunct' },
  { id: 'a35', name: 'Cacao Nibs', type: 'adjunct' },
  { id: 'a36', name: 'Coffee (Whole Bean)', type: 'adjunct' },
  { id: 'a37', name: 'Coffee (Ground)', type: 'adjunct' },
  { id: 'a38', name: 'Cold Brew Coffee', type: 'adjunct' },
  { id: 'a39', name: 'Ginger Root', type: 'adjunct' },
  { id: 'a40', name: 'Juniper Berries', type: 'adjunct' },
  { id: 'a41', name: 'Star Anise', type: 'adjunct' },
  { id: 'a42', name: 'Cloves', type: 'adjunct' },
  { id: 'a43', name: 'Nutmeg', type: 'adjunct' },
  { id: 'a44', name: 'Allspice', type: 'adjunct' },
  { id: 'a45', name: 'Cardamom', type: 'adjunct' },
  { id: 'a46', name: 'Black Pepper', type: 'adjunct' },
  { id: 'a47', name: 'Grains of Paradise', type: 'adjunct' },
  { id: 'a48', name: 'Chamomile', type: 'adjunct' },
  { id: 'a49', name: 'Hibiscus', type: 'adjunct' },
  { id: 'a50', name: 'Rose Hips', type: 'adjunct' },
  { id: 'a51', name: 'Lavender', type: 'adjunct' },
  
  // Fruits
  { id: 'a52', name: 'Cherry Puree', type: 'adjunct' },
  { id: 'a53', name: 'Raspberry Puree', type: 'adjunct' },
  { id: 'a54', name: 'Blackberry Puree', type: 'adjunct' },
  { id: 'a55', name: 'Blueberry Puree', type: 'adjunct' },
  { id: 'a56', name: 'Strawberry Puree', type: 'adjunct' },
  { id: 'a57', name: 'Peach Puree', type: 'adjunct' },
  { id: 'a58', name: 'Apricot Puree', type: 'adjunct' },
  { id: 'a59', name: 'Mango Puree', type: 'adjunct' },
  { id: 'a60', name: 'Passion Fruit Puree', type: 'adjunct' },
  { id: 'a61', name: 'Pumpkin Puree', type: 'adjunct' },
  { id: 'a62', name: 'Apple Juice/Cider', type: 'adjunct' },
  { id: 'a63', name: 'Lemon Zest', type: 'adjunct' },
  { id: 'a64', name: 'Lime Zest', type: 'adjunct' },
  { id: 'a65', name: 'Grapefruit Zest', type: 'adjunct' },
  
  // Other
  { id: 'a66', name: 'Oak Chips (American)', type: 'adjunct' },
  { id: 'a67', name: 'Oak Chips (French)', type: 'adjunct' },
  { id: 'a68', name: 'Oak Cubes (Toasted)', type: 'adjunct' },
  { id: 'a69', name: 'Coconut (Toasted)', type: 'adjunct' },
  { id: 'a70', name: 'Peanut Butter Powder', type: 'adjunct' },
];

export const ALL_INGREDIENTS = [...MALTS, ...HOPS, ...YEASTS, ...ADJUNCTS];