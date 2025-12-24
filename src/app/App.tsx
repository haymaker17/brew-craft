import { useState, useEffect } from 'react';
import { Recipe } from './types/brewing';
import { RecipeList } from './components/recipe-list';
import { RecipeBuilder } from './components/recipe-builder';
import { PrintView } from './components/print-view';
import { PrimingCalculator } from './components/priming-calculator';
import { Button } from './components/ui/button';
import { Beer, Plus, FlaskConical, Download, Upload, Calculator } from 'lucide-react';
import { saveRecipe, loadRecipes, deleteRecipe } from './utils/storage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [printRecipe, setPrintRecipe] = useState<Recipe | null>(null);
  const [showPrimingCalculator, setShowPrimingCalculator] = useState(false);
  const [view, setView] = useState<'list' | 'builder'>('list');

  useEffect(() => {
    setRecipes(loadRecipes());
  }, []);

  const createNewRecipe = () => {
    const now = new Date();
    const newRecipe: Recipe = {
      id: `recipe-${Date.now()}`,
      name: '',
      batchSize: 5,
      boilTime: 60,
      ingredients: [],
      steps: [],
      mashSteps: [],
      brewDate: now,
      createdAt: now,
      updatedAt: now,
    };
    setCurrentRecipe(newRecipe);
    setView('builder');
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setView('builder');
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    saveRecipe(recipe);
    setRecipes(loadRecipes());
  };

  const handleDeleteRecipe = (id: string) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      // Find the recipe being deleted
      const recipeToDelete = recipes.find(r => r.id === id);
      
      // If it's a clone, remove it from parent's cloneIds
      if (recipeToDelete?.parentRecipeId) {
        const parentRecipe = recipes.find(r => r.id === recipeToDelete.parentRecipeId);
        if (parentRecipe) {
          const updatedParent: Recipe = {
            ...parentRecipe,
            cloneIds: (parentRecipe.cloneIds || []).filter(cloneId => cloneId !== id),
            updatedAt: new Date(),
          };
          saveRecipe(updatedParent);
        }
      }
      
      // If it's a parent recipe, optionally clean up clones' parent references
      if (recipeToDelete?.cloneIds && recipeToDelete.cloneIds.length > 0) {
        recipeToDelete.cloneIds.forEach(cloneId => {
          const cloneRecipe = recipes.find(r => r.id === cloneId);
          if (cloneRecipe) {
            const updatedClone: Recipe = {
              ...cloneRecipe,
              parentRecipeId: undefined,
              parentRecipeName: undefined,
              updatedAt: new Date(),
            };
            saveRecipe(updatedClone);
          }
        });
      }
      
      deleteRecipe(id);
      setRecipes(loadRecipes());
      toast.success('Recipe deleted successfully!');
    }
  };

  const handleDuplicateRecipe = (recipe: Recipe) => {
    const now = new Date();
    const duplicatedRecipe: Recipe = {
      ...recipe,
      id: `recipe-${Date.now()}`,
      name: `${recipe.name} (Copy)`,
      brewDate: now,
      createdAt: now,
      updatedAt: now,
      // Reset brewing dates for the duplicate
      yeastPitchDate: undefined,
      bottlingDate: undefined,
      actualOG: undefined,
      actualFG: undefined,
      // Don't maintain clone relationship for duplicates
      parentRecipeId: undefined,
      parentRecipeName: undefined,
      cloneIds: undefined,
      // Don't inherit favorite status
      isFavorite: false,
    };
    saveRecipe(duplicatedRecipe);
    setRecipes(loadRecipes());
    toast.success('Recipe duplicated successfully!');
    setCurrentRecipe(duplicatedRecipe);
    setView('builder');
  };

  const handleCloneRecipe = (recipe: Recipe) => {
    const now = new Date();
    const clonedRecipe: Recipe = {
      ...recipe,
      id: `recipe-${Date.now()}`,
      name: `${recipe.name} (Clone)`,
      brewDate: now,
      createdAt: now,
      updatedAt: now,
      // Reset brewing dates for the clone
      yeastPitchDate: undefined,
      bottlingDate: undefined,
      actualOG: undefined,
      actualFG: undefined,
      // Set parent relationship
      parentRecipeId: recipe.id,
      parentRecipeName: recipe.name,
      cloneIds: undefined,
      // Don't inherit favorite status
      isFavorite: false,
    };
    
    // Update parent recipe to include this clone
    const updatedParent: Recipe = {
      ...recipe,
      cloneIds: [...(recipe.cloneIds || []), clonedRecipe.id],
      updatedAt: now,
    };
    
    saveRecipe(clonedRecipe);
    saveRecipe(updatedParent);
    setRecipes(loadRecipes());
    toast.success('Recipe cloned successfully!');
    setCurrentRecipe(clonedRecipe);
    setView('builder');
  };

  const handleBack = () => {
    setCurrentRecipe(null);
    setView('list');
    setRecipes(loadRecipes());
  };

  const handleExportAll = () => {
    const dataStr = JSON.stringify(recipes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brewcraft-recipes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Recipes exported successfully!');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedRecipes = JSON.parse(event.target?.result as string) as Recipe[];
          
          if (!Array.isArray(importedRecipes)) {
            toast.error('Invalid recipe file format');
            return;
          }

          // Save all imported recipes
          importedRecipes.forEach(recipe => {
            // Generate new ID to avoid conflicts
            // Clear clone relationships since IDs will be regenerated
            const newRecipe = {
              ...recipe,
              id: `recipe-${Date.now()}-${Math.random()}`,
              createdAt: new Date(recipe.createdAt),
              updatedAt: new Date(),
              parentRecipeId: undefined,
              parentRecipeName: undefined,
              cloneIds: undefined,
            };
            saveRecipe(newRecipe);
          });

          setRecipes(loadRecipes());
          toast.success(`Successfully imported ${importedRecipes.length} recipe(s)!`);
        } catch (error) {
          toast.error('Failed to import recipes. Invalid file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handlePrintRecipe = (recipe: Recipe) => {
    setPrintRecipe(recipe);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-orange-600 to-amber-600 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
                <Beer className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-white">BrewCraft</h1>
                <p className="text-sm text-orange-50">
                  Craft Your Perfect Beer
                </p>
              </div>
            </div>
            {view === 'list' && (
              <Button onClick={createNewRecipe} size="lg" className="bg-white text-orange-700 hover:bg-orange-50 shadow-md">
                <Plus className="w-5 h-5 mr-2" />
                New Recipe
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {view === 'list' ? (
          <>
            {recipes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FlaskConical className="w-12 h-12 text-orange-600" />
                </div>
                <h2 className="mb-2">Welcome to BrewCraft!</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first homebrewing recipe with our comprehensive tools for recipe building, 
                  process tracking, and beer style identification.
                </p>
                <Button onClick={createNewRecipe} size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Recipe
                </Button>
                <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-3xl mx-auto text-left">
                  <div className="p-6 border-2 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="mb-2">Recipe Builder</h3>
                    <p className="text-sm text-muted-foreground">
                      Add malts, hops, yeast, and adjuncts. Get real-time calculations for ABV, IBU, and SRM.
                    </p>
                  </div>
                  <div className="p-6 border-2 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="mb-2">Process Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Document every step from mash to bottle with times, temperatures, and notes.
                    </p>
                  </div>
                  <div className="p-6 border-2 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="mb-2">Style Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover what beer style you've created based on your recipe characteristics.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2>My Recipes</h2>
                    <p className="text-muted-foreground">
                      Manage and track your homebrewing recipes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleImport} variant="ghost" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                    <Button onClick={handleExportAll} variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button onClick={() => setShowPrimingCalculator(true)} variant="ghost" size="sm">
                      <Calculator className="w-4 h-4 mr-2" />
                      Priming Calculator
                    </Button>
                  </div>
                </div>
                <RecipeList
                  recipes={recipes}
                  onSelectRecipe={handleSelectRecipe}
                  onDeleteRecipe={handleDeleteRecipe}
                  onDuplicateRecipe={handleDuplicateRecipe}
                  onPrintRecipe={handlePrintRecipe}
                />

              </>
            )}
          </>
        ) : currentRecipe ? (
          <RecipeBuilder
            recipe={currentRecipe}
            onSave={handleSaveRecipe}
            onBack={handleBack}
            onPrint={handlePrintRecipe}
            onClone={handleCloneRecipe}
            allRecipes={recipes}
            onSelectRecipe={handleSelectRecipe}
          />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Happy Brewing! Remember to brew responsibly and enjoy your craft.</p>
        </div>
      </footer>

      {/* Print View Modal */}
      {printRecipe && (
        <PrintView recipe={printRecipe} onClose={() => setPrintRecipe(null)} />
      )}

      {/* Priming Calculator Modal */}
      {showPrimingCalculator && (
        <PrimingCalculator onClose={() => setShowPrimingCalculator(false)} />
      )}
    </div>
  );
}

export default App;