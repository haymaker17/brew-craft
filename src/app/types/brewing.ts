export type IngredientType = 'malt' | 'hop' | 'yeast' | 'adjunct';

export interface Ingredient {
  id: string;
  name: string;
  type: IngredientType;
  // Malt properties
  lovibond?: number; // Color contribution
  ppg?: number; // Points per pound per gallon (extract potential)
  // Hop properties
  alphaAcid?: number; // AA% for IBU calculation
  // Yeast properties
  attenuation?: number; // Expected attenuation %
  flocculation?: 'low' | 'medium' | 'high';
  tempRange?: [number, number]; // Fermentation temp range
}

export interface RecipeIngredient {
  ingredient: Ingredient;
  amount: number; // lbs for grain, oz for hops
  unit: 'lb' | 'oz' | 'g' | 'kg' | 'packet';
  // Hop specific
  boilTime?: number; // minutes
  hopUse?: 'boil' | 'whirlpool' | 'dry-hop';
  customAlphaAcid?: number; // Override AA% for this specific batch
  dryHopDays?: number; // Duration in days for dry hopping
}

export interface BrewingStep {
  id: string;
  name: string;
  duration: number; // minutes
  temperature?: number; // Fahrenheit
  notes: string;
  completed: boolean;
  timestamp?: Date;
}

export interface MashStep {
  id: string;
  name: string;
  temperature: number; // Fahrenheit
  duration: number; // minutes
}

export interface YieldEntry {
  id: string;
  type: 'gallons' | 'bottles-22oz' | 'bottles-12oz' | 'cornelius-keg';
  amount: number;
}

export interface Recipe {
  id: string;
  name: string;
  style?: string;
  batchSize: number; // gallons
  boilTime: number; // minutes
  ingredients: RecipeIngredient[];
  steps: BrewingStep[];
  mashSteps: MashStep[];
  brewDate?: Date; // User-editable brew date
  yeastPitchDate?: Date;
  bottlingDate?: Date;
  finalYield?: YieldEntry[]; // Multiple yield formats
  processNotes?: string;
  // Calculated values
  originalGravity?: number;
  finalGravity?: number;
  abv?: number;
  ibu?: number;
  srm?: number;
  caloriesPer12oz?: number;
  carbsPer12oz?: number;
  // Actual measurements
  actualOG?: number;
  actualFG?: number;
  actualABV?: number; // Calculated from actual gravity readings
  // Clone tracking
  parentRecipeId?: string; // If this is a clone, ID of the original
  parentRecipeName?: string; // Name of the parent recipe for display
  cloneIds?: string[]; // If this is a parent, IDs of all clones
  isFavorite?: boolean; // Mark the best version of a recipe
  createdAt: Date;
  updatedAt: Date;
}

export interface BeerStyle {
  name: string;
  category: string;
  ogRange: [number, number];
  fgRange: [number, number];
  abvRange: [number, number];
  ibuRange: [number, number];
  srmRange: [number, number];
  description: string;
}