import { Ingredient } from '../types/brewing';

const CUSTOM_INGREDIENTS_KEY = 'homebrewing-custom-ingredients';

export function saveCustomIngredient(ingredient: Ingredient): void {
  const customIngredients = loadCustomIngredients();
  const existingIndex = customIngredients.findIndex(i => i.id === ingredient.id);
  
  if (existingIndex >= 0) {
    customIngredients[existingIndex] = ingredient;
  } else {
    customIngredients.push(ingredient);
  }
  
  localStorage.setItem(CUSTOM_INGREDIENTS_KEY, JSON.stringify(customIngredients));
}

export function loadCustomIngredients(): Ingredient[] {
  const data = localStorage.getItem(CUSTOM_INGREDIENTS_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function deleteCustomIngredient(id: string): void {
  const customIngredients = loadCustomIngredients().filter(i => i.id !== id);
  localStorage.setItem(CUSTOM_INGREDIENTS_KEY, JSON.stringify(customIngredients));
}

export function getCustomIngredientsByType(type: string): Ingredient[] {
  return loadCustomIngredients().filter(i => i.type === type);
}
