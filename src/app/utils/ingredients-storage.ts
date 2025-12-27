import { Ingredient } from '../types/brewing';
import { MALTS, HOPS, YEASTS, ADJUNCTS } from '../data/ingredients';

const INGREDIENTS_KEY = 'brewcraft-ingredients';
const MIGRATION_KEY = 'brewcraft-ingredients-migrated';

// Get all default ingredients
function getDefaultIngredients(): Ingredient[] {
  return [...MALTS, ...HOPS, ...YEASTS, ...ADJUNCTS];
}

// Initialize ingredients on first load (migrate defaults to localStorage)
function initializeIngredients(): void {
  const hasMigrated = localStorage.getItem(MIGRATION_KEY);
  
  if (!hasMigrated) {
    // First time - load all default ingredients into localStorage
    const defaultIngredients = getDefaultIngredients();
    localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(defaultIngredients));
    localStorage.setItem(MIGRATION_KEY, 'true');
  }
}

// Load all ingredients from localStorage
export function loadIngredients(): Ingredient[] {
  initializeIngredients();
  
  const data = localStorage.getItem(INGREDIENTS_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Get ingredients by type
export function getIngredientsByType(type: string): Ingredient[] {
  return loadIngredients().filter(i => i.type === type);
}

// Save or update an ingredient
export function saveIngredient(ingredient: Ingredient): void {
  const allIngredients = loadIngredients();
  const existingIndex = allIngredients.findIndex(i => i.id === ingredient.id);
  
  if (existingIndex >= 0) {
    allIngredients[existingIndex] = ingredient;
  } else {
    allIngredients.push(ingredient);
  }
  
  localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(allIngredients));
}

// Delete an ingredient
export function deleteIngredient(id: string): void {
  const allIngredients = loadIngredients().filter(i => i.id !== id);
  localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(allIngredients));
}

// Get a single ingredient by ID
export function getIngredientById(id: string): Ingredient | undefined {
  return loadIngredients().find(i => i.id === id);
}

// Check if an ingredient exists
export function ingredientExists(id: string): boolean {
  return loadIngredients().some(i => i.id === id);
}
