import { Recipe } from '../types/brewing';

const STORAGE_KEY = 'homebrewing-recipes';

export function saveRecipe(recipe: Recipe): void {
  const recipes = loadRecipes();
  const existingIndex = recipes.findIndex(r => r.id === recipe.id);
  
  if (existingIndex >= 0) {
    recipes[existingIndex] = { ...recipe, updatedAt: new Date() };
  } else {
    recipes.push({ ...recipe, createdAt: new Date(), updatedAt: new Date() });
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof Error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      throw new Error('Storage limit exceeded. Try removing some recipe images or deleting old recipes.');
    }
    throw error;
  }
}

export function loadRecipes(): Recipe[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    const recipes = JSON.parse(data);
    // Convert date strings back to Date objects
    return recipes.map((r: any) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
      steps: r.steps.map((s: any) => ({
        ...s,
        timestamp: s.timestamp ? new Date(s.timestamp) : undefined,
      })),
    }));
  } catch {
    return [];
  }
}

export function deleteRecipe(id: string): void {
  const recipes = loadRecipes().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function getRecipe(id: string): Recipe | undefined {
  return loadRecipes().find(r => r.id === id);
}