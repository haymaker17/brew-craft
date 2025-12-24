import { Recipe, RecipeIngredient } from '../types/brewing';
import { BEER_STYLES } from '../data/beer-styles';

// Calculate Original Gravity (OG)
export function calculateOG(ingredients: RecipeIngredient[], batchSize: number): number {
  let totalPoints = 0;
  
  ingredients.forEach(({ ingredient, amount, unit }) => {
    if (ingredient.type === 'malt' && ingredient.ppg) {
      // Convert to lbs if needed
      const lbs = unit === 'oz' ? amount / 16 : unit === 'g' ? amount / 453.592 : unit === 'kg' ? amount * 2.20462 : amount;
      // Points = (PPG × weight in lbs × efficiency) / batch size
      // Assuming 75% efficiency
      const points = (ingredient.ppg * lbs * 0.75) / batchSize;
      totalPoints += points;
    }
  });
  
  // OG = 1 + (points / 1000)
  return 1 + (totalPoints / 1000);
}

// Calculate Final Gravity (FG)
export function calculateFG(og: number, ingredients: RecipeIngredient[]): number {
  // Find yeast and get attenuation
  const yeastIngredient = ingredients.find(ri => ri.ingredient.type === 'yeast');
  const attenuation = yeastIngredient?.ingredient.attenuation || 75;
  
  // FG = OG - ((OG - 1) × attenuation%)
  const fg = og - ((og - 1) * (attenuation / 100));
  return fg;
}

// Calculate ABV
export function calculateABV(og: number, fg: number): number {
  // ABV = (OG - FG) × 131.25
  return (og - fg) * 131.25;
}

// Calculate IBU (International Bitterness Units)
export function calculateIBU(ingredients: RecipeIngredient[], batchSize: number, og: number): number {
  let totalIBU = 0;
  
  ingredients.forEach(({ ingredient, amount, unit, boilTime, hopUse, customAlphaAcid }) => {
    if (ingredient.type === 'hop' && hopUse === 'boil' && boilTime) {
      // Use custom AA% if provided, otherwise use ingredient default
      const alphaAcid = customAlphaAcid || ingredient.alphaAcid;
      
      if (!alphaAcid) return; // Skip if no AA% available
      
      // Convert to oz if needed
      const oz = unit === 'g' ? amount / 28.3495 : unit === 'lb' ? amount * 16 : amount;
      
      // Utilization factor based on boil time and gravity
      const utilization = getUtilization(boilTime, og);
      
      // IBU = (oz × AA% × Utilization × 7490) / (batch size in gallons × (1 + (OG - 1.050) / 0.2))
      const ibu = (oz * alphaAcid * utilization * 7490) / batchSize;
      totalIBU += ibu;
    }
  });
  
  return totalIBU;
}

// Hop utilization based on boil time
function getUtilization(boilTime: number, og: number): number {
  // Bigness factor (gravity adjustment)
  const bignessFactor = 1.65 * Math.pow(0.000125, og - 1);
  
  // Boil time factor
  let boilTimeFactor = (1 - Math.exp(-0.04 * boilTime)) / 4.15;
  
  return bignessFactor * boilTimeFactor;
}

// Calculate SRM (beer color)
export function calculateSRM(ingredients: RecipeIngredient[], batchSize: number): number {
  let totalMCU = 0;
  
  ingredients.forEach(({ ingredient, amount, unit }) => {
    if (ingredient.type === 'malt' && ingredient.lovibond) {
      // Convert to lbs if needed
      const lbs = unit === 'oz' ? amount / 16 : unit === 'g' ? amount / 453.592 : unit === 'kg' ? amount * 2.20462 : amount;
      
      // MCU = (weight in lbs × lovibond) / batch size
      const mcu = (lbs * ingredient.lovibond) / batchSize;
      totalMCU += mcu;
    }
  });
  
  // Morey equation: SRM = 1.4922 × MCU^0.6859
  return 1.4922 * Math.pow(totalMCU, 0.6859);
}

// Calculate calories per 12oz serving
export function calculateCalories(og: number, fg: number, abv: number): number {
  // Real Extract (RE) formula
  const re = (0.1808 * og) + (0.8192 * fg) - 1.0004;
  
  // Calories per 12oz serving
  // Formula: ((6.9 × ABV) + 4.0 × (RE - 0.1)) × FG × 3.55
  const calories = ((6.9 * abv) + 4.0 * (re - 0.1)) * fg * 3.55;
  
  return calories;
}

// Calculate carbohydrates per 12oz serving (in grams)
export function calculateCarbs(og: number, fg: number): number {
  // Convert specific gravity to degrees Plato
  const ogPlato = (og - 1) * 1000 / 4;
  const fgPlato = (fg - 1) * 1000 / 4;
  
  // Real Extract (RE) formula using Plato
  const re = (0.1808 * ogPlato) + (0.8192 * fgPlato);
  
  // Carbs per 12oz serving in grams
  const carbs = re * 3.55;
  
  return carbs;
}

// Calculate all values for a recipe
export function calculateRecipeValues(recipe: Recipe): Partial<Recipe> {
  const og = calculateOG(recipe.ingredients, recipe.batchSize);
  const fg = calculateFG(og, recipe.ingredients);
  const abv = calculateABV(og, fg);
  const ibu = calculateIBU(recipe.ingredients, recipe.batchSize, og);
  const srm = calculateSRM(recipe.ingredients, recipe.batchSize);
  const calories = calculateCalories(og, fg, abv);
  const carbs = calculateCarbs(og, fg);
  
  return {
    originalGravity: Math.round(og * 1000) / 1000,
    finalGravity: Math.round(fg * 1000) / 1000,
    abv: Math.round(abv * 10) / 10,
    ibu: Math.round(ibu),
    srm: Math.round(srm * 10) / 10,
    caloriesPer12oz: Math.round(calories),
    carbsPer12oz: Math.round(carbs * 10) / 10,
  };
}

// Match recipe to beer style
export function matchBeerStyle(recipe: Recipe): { style: string; confidence: number; matches: string[] }[] {
  const calculated = calculateRecipeValues(recipe);
  const og = calculated.originalGravity || 0;
  const fg = calculated.finalGravity || 0;
  const abv = calculated.abv || 0;
  const ibu = calculated.ibu || 0;
  const srm = calculated.srm || 0;
  
  // Helper function to calculate score for a parameter with graduated scoring
  const calculateParamScore = (value: number, range: [number, number], weight: number, tolerance: number = 0.15): number => {
    const [min, max] = range;
    const center = (min + max) / 2;
    const rangeSize = max - min;
    
    // If value is in range
    if (value >= min && value <= max) {
      // Score based on distance from center (closer to center = higher score)
      const distanceFromCenter = Math.abs(value - center);
      const maxDistance = rangeSize / 2;
      const centerScore = 1 - (distanceFromCenter / maxDistance) * 0.3; // 70-100% of weight
      return weight * centerScore;
    }
    
    // If value is outside range but within tolerance
    const toleranceRange = rangeSize * tolerance;
    if (value < min && value >= min - toleranceRange) {
      const distanceOutside = min - value;
      const proximityScore = 1 - (distanceOutside / toleranceRange);
      return weight * proximityScore * 0.5; // Max 50% of weight for near-miss
    }
    if (value > max && value <= max + toleranceRange) {
      const distanceOutside = value - max;
      const proximityScore = 1 - (distanceOutside / toleranceRange);
      return weight * proximityScore * 0.5; // Max 50% of weight for near-miss
    }
    
    // Completely out of range
    return 0;
  };
  
  const matches = BEER_STYLES.map(style => {
    let score = 0;
    let matchedParams: string[] = [];
    
    // Weighted parameters (total = 100)
    // Color (SRM) is most defining - 30 points
    const srmScore = calculateParamScore(srm, style.srmRange, 30);
    if (srmScore > 15) matchedParams.push('SRM');
    score += srmScore;
    
    // ABV is very important - 25 points
    const abvScore = calculateParamScore(abv, style.abvRange, 25);
    if (abvScore > 12.5) matchedParams.push('ABV');
    score += abvScore;
    
    // IBU is important for hop character - 25 points
    const ibuScore = calculateParamScore(ibu, style.ibuRange, 25);
    if (ibuScore > 12.5) matchedParams.push('IBU');
    score += ibuScore;
    
    // OG is moderately important - 10 points
    const ogScore = calculateParamScore(og, style.ogRange, 10);
    if (ogScore > 5) matchedParams.push('OG');
    score += ogScore;
    
    // FG is less critical - 10 points
    const fgScore = calculateParamScore(fg, style.fgRange, 10);
    if (fgScore > 5) matchedParams.push('FG');
    score += fgScore;
    
    // Bonus: Check ingredients for key markers
    let ingredientBonus = 0;
    const ingredientNames = recipe.ingredients.map(i => i.ingredient.name.toLowerCase());
    
    // Wheat beer should have wheat
    if (style.name === 'Wheat Beer' && ingredientNames.some(i => i.includes('wheat'))) {
      ingredientBonus += 10;
    }
    
    // Stouts/Porters should have roasted malts
    if ((style.category === 'Stout' || style.category === 'Porter') && 
        ingredientNames.some(i => i.includes('roasted') || i.includes('black') || i.includes('chocolate'))) {
      ingredientBonus += 10;
    }
    
    // Belgian styles often have Belgian yeast or candi sugar
    if (style.category === 'Belgian' && 
        ingredientNames.some(i => i.includes('belgian') || i.includes('candi'))) {
      ingredientBonus += 5;
    }
    
    // IPAs and Pale Ales should have American hops
    if ((style.category === 'IPA' || style.category === 'Pale Ale') && 
        ingredientNames.some(i => i.includes('cascade') || i.includes('centennial') || 
                                  i.includes('citra') || i.includes('mosaic') || i.includes('amarillo'))) {
      ingredientBonus += 5;
    }
    
    score = Math.min(100, score + ingredientBonus);
    
    return {
      style: style.name,
      confidence: Math.round(score),
      matches: matchedParams,
    };
  });
  
  // Sort by confidence
  return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

// Get color from SRM value
export function getSRMColor(srm: number): string {
  // SRM to RGB approximation
  if (srm <= 2) return '#FFE699';
  if (srm <= 4) return '#FFD878';
  if (srm <= 6) return '#FFCA5A';
  if (srm <= 8) return '#FFBF42';
  if (srm <= 10) return '#FBB123';
  if (srm <= 12) return '#F8A600';
  if (srm <= 14) return '#F39C00';
  if (srm <= 16) return '#EA8F00';
  if (srm <= 18) return '#E58500';
  if (srm <= 20) return '#DE7C00';
  if (srm <= 24) return '#D77200';
  if (srm <= 28) return '#CF6900';
  if (srm <= 32) return '#CB6200';
  if (srm <= 36) return '#C35900';
  if (srm <= 40) return '#BB5100';
  return '#8D4C32';
}