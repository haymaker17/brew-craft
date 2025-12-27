import { useState, useEffect } from 'react';
import { Recipe, RecipeIngredient, MashStep } from '../types/brewing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { IngredientSelector } from './ingredient-selector';
import { ProcessTracker } from './process-tracker';
import { StyleIdentifier } from './style-identifier';
import { ShoppingList } from './shopping-list';
import { ArrowLeft, Save, Printer, GitBranch, ArrowUpRight, Star, ShoppingCart, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { calculateRecipeValues, getSRMColor } from '../utils/brewing-calculations';

interface RecipeBuilderProps {
  recipe: Recipe;
  onSave: (recipe: Recipe) => void;
  onBack: () => void;
  onPrint: (recipe: Recipe) => void;
  onClone: (recipe: Recipe) => void;
  allRecipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

export function RecipeBuilder({ recipe, onSave, onBack, onPrint, onClone, allRecipes, onSelectRecipe }: RecipeBuilderProps) {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(recipe);
  const [savedRecipe, setSavedRecipe] = useState<Recipe>(recipe);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);

  // Sync with incoming recipe prop changes (for navigation between recipes)
  useEffect(() => {
    setCurrentRecipe(recipe);
    setSavedRecipe(recipe);
  }, [recipe.id]); // Only update when the recipe ID changes

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return JSON.stringify(savedRecipe) !== JSON.stringify(currentRecipe);
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedDialog(true);
    } else {
      onBack();
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    onBack();
  };

  const handleSaveAndExit = () => {
    if (!currentRecipe.name.trim()) {
      setShowUnsavedDialog(false);
      toast.error('Please enter a recipe name');
      return;
    }
    if (currentRecipe.ingredients.length === 0) {
      setShowUnsavedDialog(false);
      toast.error('Please add at least one ingredient');
      return;
    }
    try {
      onSave(currentRecipe);
      toast.success('Recipe saved successfully!');
      setSavedRecipe(currentRecipe);
      setShowUnsavedDialog(false);
      onBack();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save recipe');
      }
    }
  };

  const updateRecipe = (updates: Partial<Recipe>) => {
    setCurrentRecipe(prev => ({ ...prev, ...updates }));
  };

  const addIngredient = (ingredient: RecipeIngredient) => {
    updateRecipe({
      ingredients: [...currentRecipe.ingredients, ingredient],
    });
  };

  const removeIngredient = (index: number) => {
    updateRecipe({
      ingredients: currentRecipe.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, ingredient: RecipeIngredient) => {
    const newIngredients = [...currentRecipe.ingredients];
    newIngredients[index] = ingredient;
    updateRecipe({ ingredients: newIngredients });
  };

  const addStep = (step: Omit<MashStep, 'id'>) => {
    const newStep: MashStep = {
      ...step,
      id: `step-${Date.now()}-${Math.random()}`,
    };
    updateRecipe({
      mashSteps: [...(currentRecipe.mashSteps || []), newStep],
    });
  };

  const updateStep = (id: string, step: Omit<MashStep, 'id'>) => {
    updateRecipe({
      mashSteps: (currentRecipe.mashSteps || []).map(s => 
        s.id === id ? { ...step, id } : s
      ),
    });
  };

  const removeStep = (id: string) => {
    updateRecipe({
      mashSteps: (currentRecipe.mashSteps || []).filter(s => s.id !== id),
    });
  };

  const handleSave = () => {
    if (!currentRecipe.name.trim()) {
      toast.error('Please enter a recipe name');
      return;
    }
    if (currentRecipe.ingredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }
    try {
      onSave(currentRecipe);
      toast.success('Recipe saved successfully!');
      setSavedRecipe(currentRecipe);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save recipe');
      }
    }
  };

  // Navigation helper with toast for clone relationships
  const navigateToRelatedRecipe = (recipe: Recipe, relationship: 'parent' | 'clone') => {
    if (relationship === 'parent') {
      toast.info(`Now viewing: ${recipe.name}`, {
        description: 'Original recipe',
      });
    } else {
      toast.info(`Now viewing: ${recipe.name}`, {
        description: `Clone of ${currentRecipe.name}`,
      });
    }
    onSelectRecipe(recipe);
  };

  const toggleFavorite = () => {
    updateRecipe({ isFavorite: !currentRecipe.isFavorite });
    toast.success(currentRecipe.isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentImages = currentRecipe.images || [];
    if (currentImages.length >= 2) {
      toast.error('Maximum 2 images allowed');
      return;
    }

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Limit file size to 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateRecipe({
        images: [...currentImages, base64],
      });
      toast.success('Image added successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = (currentRecipe.images || []).filter((_, i) => i !== index);
    updateRecipe({
      images: newImages.length > 0 ? newImages : undefined,
    });
    toast.success('Image removed');
  };

  const handlePromoteToMaster = () => {
    if (!currentRecipe.parentRecipeId) return;
    
    const parentRecipe = allRecipes.find(r => r.id === currentRecipe.parentRecipeId);
    if (!parentRecipe) {
      toast.error('Parent recipe not found');
      return;
    }

    // Confirmation dialog
    if (!confirm(`Promote "${currentRecipe.name}" to master recipe?\n\n"${parentRecipe.name}" will become a clone of this recipe, and all sibling clones will be re-parented.`)) {
      return;
    }

    // Get all sibling clones
    const siblingCloneIds = (parentRecipe.cloneIds || []).filter(id => id !== currentRecipe.id);

    // Create the promoted recipe (remove parent references, inherit old parent's clones)
    const promotedRecipe: Recipe = {
      ...currentRecipe,
      parentRecipeId: undefined,
      parentRecipeName: undefined,
      cloneIds: [parentRecipe.id, ...siblingCloneIds],
      updatedAt: new Date(),
    };

    // Convert old parent to a clone
    const demotedParent: Recipe = {
      ...parentRecipe,
      parentRecipeId: currentRecipe.id,
      parentRecipeName: currentRecipe.name,
      cloneIds: undefined,
      updatedAt: new Date(),
    };

    // Save the promoted recipe and demoted parent
    onSave(promotedRecipe);
    onSave(demotedParent);

    // Update all sibling clones to point to the new master
    siblingCloneIds.forEach(cloneId => {
      const siblingClone = allRecipes.find(r => r.id === cloneId);
      if (siblingClone) {
        const updatedSibling: Recipe = {
          ...siblingClone,
          parentRecipeId: currentRecipe.id,
          parentRecipeName: currentRecipe.name,
          updatedAt: new Date(),
        };
        onSave(updatedSibling);
      }
    });

    toast.success(`"${currentRecipe.name}" is now the master recipe!`);
    
    // Navigate to the promoted recipe (refresh to show updated state)
    onSelectRecipe(promotedRecipe);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBackClick}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recipes
        </Button>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={currentRecipe.isFavorite ? "default" : "outline"} 
            onClick={toggleFavorite}
          >
            <Star className={`w-4 h-4 mr-2 ${currentRecipe.isFavorite ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{currentRecipe.isFavorite ? 'Favorited' : 'Favorite'}</span>
          </Button>
          <Button variant="outline" onClick={() => setShowShoppingList(true)} disabled={currentRecipe.ingredients.length === 0}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Shopping List</span>
          </Button>
          <Button variant="outline" onClick={() => onClone(currentRecipe)}>
            <GitBranch className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Clone</span>
          </Button>
          <Button variant="outline" onClick={() => onPrint(currentRecipe)}>
            <Printer className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Save Recipe</span>
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Recipe Details</CardTitle>
          <CardDescription>Basic information about your brew</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Recipe Name</Label>
              <Input
                value={currentRecipe.name}
                onChange={(e) => updateRecipe({ name: e.target.value })}
                placeholder="My Awesome IPA"
              />
            </div>
            <div className="space-y-2">
              <Label>Style (Optional)</Label>
              <Input
                value={currentRecipe.style || ''}
                onChange={(e) => updateRecipe({ style: e.target.value })}
                placeholder="American IPA"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Batch Size (gallons)</Label>
              <Input
                type="number"
                step="0.5"
                value={currentRecipe.batchSize}
                onChange={(e) => updateRecipe({ batchSize: parseFloat(e.target.value) || 5 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Boil Time (minutes)</Label>
              <Input
                type="number"
                value={currentRecipe.boilTime}
                onChange={(e) => updateRecipe({ boilTime: parseInt(e.target.value) || 60 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Brew Date (Optional)</Label>
            <Input
              type="date"
              value={
                currentRecipe.brewDate 
                  ? (() => {
                      const date = new Date(currentRecipe.brewDate);
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    })()
                  : ''
              }
              onChange={(e) => {
                if (e.target.value) {
                  // Parse the date string as local date (not UTC)
                  const [year, month, day] = e.target.value.split('-').map(Number);
                  const localDate = new Date(year, month - 1, day);
                  updateRecipe({ brewDate: localDate });
                } else {
                  updateRecipe({ brewDate: undefined });
                }
              }}
              placeholder="Select brew date"
            />
          </div>
          
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Photos (Optional, max 2)</Label>
            {currentRecipe.images && currentRecipe.images.length > 0 ? (
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                {currentRecipe.images.map((image, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                    <img 
                      src={image} 
                      alt={`Recipe photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {currentRecipe.images.length < 2 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 bg-muted/20 hover:bg-muted/30">
                    <ImagePlus className="w-8 h-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer transition-colors bg-muted/20 hover:bg-muted/30">
                <ImagePlus className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recipe Stats - Live Calculated Values */}
      {currentRecipe.ingredients.length > 0 && (() => {
        const calculated = calculateRecipeValues(currentRecipe);
        const beerColor = getSRMColor(calculated.srm || 0);
        
        // Use actual values if set, otherwise use calculated estimates
        const displayOG = currentRecipe.actualOG ?? calculated.originalGravity;
        const displayFG = currentRecipe.actualFG ?? calculated.finalGravity;
        const displayABV = currentRecipe.actualOG && currentRecipe.actualFG 
          ? ((currentRecipe.actualOG - currentRecipe.actualFG) * 131.25)
          : calculated.abv;
        
        return (
          <Card>
            <CardHeader>
              <CardTitle>Recipe Stats</CardTitle>
              <CardDescription>
                {currentRecipe.actualOG || currentRecipe.actualFG 
                  ? 'Using actual measurements (edit to update)' 
                  : 'Estimated values (click to enter actual measurements)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">OG</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={displayOG && !isNaN(displayOG) ? displayOG.toFixed(3) : ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : undefined;
                      updateRecipe({ actualOG: value });
                    }}
                    placeholder={calculated.originalGravity?.toFixed(3) || '1.050'}
                    className="h-9 text-center font-bold"
                  />
                  {!currentRecipe.actualOG && calculated.originalGravity && (
                    <span className="text-xs text-muted-foreground">Est.</span>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">FG</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={displayFG && !isNaN(displayFG) ? displayFG.toFixed(3) : ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : undefined;
                      updateRecipe({ actualFG: value });
                    }}
                    placeholder={calculated.finalGravity?.toFixed(3) || '1.010'}
                    className="h-9 text-center font-bold"
                  />
                  {!currentRecipe.actualFG && calculated.finalGravity && (
                    <span className="text-xs text-muted-foreground">Est.</span>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">ABV</div>
                  <div className="font-bold text-lg">{displayABV?.toFixed(1)}%</div>
                  {!(currentRecipe.actualOG && currentRecipe.actualFG) && (
                    <span className="text-xs text-muted-foreground">Est.</span>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">IBU</div>
                  <div className="font-bold text-lg">{calculated.ibu}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">SRM</div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="font-bold text-lg">{calculated.srm?.toFixed(1)}</div>
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                      style={{ backgroundColor: beerColor }}
                      title={`SRM: ${calculated.srm?.toFixed(1)}`}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Calories</div>
                  <div className="font-bold text-lg">{calculated.caloriesPer12oz}</div>
                  <div className="text-xs text-muted-foreground">per 12oz</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Carbs</div>
                  <div className="font-bold text-lg">{calculated.carbsPer12oz?.toFixed(1)}g</div>
                  <div className="text-xs text-muted-foreground">per 12oz</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Main Tabs */}
      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className={`grid w-full ${
          currentRecipe.parentRecipeId || (currentRecipe.cloneIds && currentRecipe.cloneIds.length > 0)
            ? 'grid-cols-4'
            : 'grid-cols-3'
        }`}>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          {(currentRecipe.parentRecipeId || (currentRecipe.cloneIds && currentRecipe.cloneIds.length > 0)) && (
            <TabsTrigger value="clones">
              <GitBranch className="w-4 h-4 mr-1.5" />
              Clones
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="ingredients" className="mt-6">
          <IngredientSelector
            ingredients={currentRecipe.ingredients}
            onAddIngredient={addIngredient}
            onRemoveIngredient={removeIngredient}
            onUpdateIngredient={updateIngredient}
          />
        </TabsContent>

        <TabsContent value="process" className="mt-6">
          <ProcessTracker
            mashSteps={currentRecipe.mashSteps || []}
            yeastPitchDate={currentRecipe.yeastPitchDate}
            bottlingDate={currentRecipe.bottlingDate}
            finalYield={currentRecipe.finalYield}
            processNotes={currentRecipe.processNotes}
            onAddMashStep={addStep}
            onUpdateMashStep={updateStep}
            onRemoveMashStep={removeStep}
            onUpdateYeastPitchDate={(date) => updateRecipe({ yeastPitchDate: date })}
            onUpdateBottlingDate={(date) => updateRecipe({ bottlingDate: date })}
            onUpdateFinalYield={(yields) => updateRecipe({ finalYield: yields })}
            onUpdateProcessNotes={(notes) => updateRecipe({ processNotes: notes })}
          />
        </TabsContent>

        <TabsContent value="style" className="mt-6">
          {currentRecipe.ingredients.length > 0 ? (
            <StyleIdentifier recipe={currentRecipe} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Add ingredients to see style analysis
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Clones Tab */}
        <TabsContent value="clones" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Recipe Clones
              </CardTitle>
              <CardDescription>Manage recipe variations and clones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parent Recipe Link */}
              {currentRecipe.parentRecipeId && (() => {
                const parentRecipe = allRecipes.find(r => r.id === currentRecipe.parentRecipeId);
                return (
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Cloned from</p>
                          <p className="font-medium flex items-center gap-2">
                            {currentRecipe.parentRecipeName || 'Original Recipe'}
                            {parentRecipe?.isFavorite && (
                              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                            )}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (parentRecipe) {
                              navigateToRelatedRecipe(parentRecipe, 'parent');
                            } else {
                              toast.error('Parent recipe not found');
                            }
                          }}
                        >
                          View Original
                          <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handlePromoteToMaster}
                    >
                      <GitBranch className="w-4 h-4 mr-2" />
                      Promote to Master Recipe
                    </Button>
                  </div>
                );
              })()}

              {/* Clones List */}
              {currentRecipe.cloneIds && currentRecipe.cloneIds.length > 0 && (() => {
                // Get the latest recipe data from allRecipes to ensure we have current cloneIds
                const latestRecipeData = allRecipes.find(r => r.id === currentRecipe.id);
                const activeCloneIds = (latestRecipeData?.cloneIds || currentRecipe.cloneIds).filter(cloneId => 
                  allRecipes.some(r => r.id === cloneId)
                );
                
                if (activeCloneIds.length === 0) return null;
                
                return (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {activeCloneIds.length} {activeCloneIds.length === 1 ? 'clone' : 'clones'} of this recipe
                    </p>
                    <div className="space-y-2">
                      {activeCloneIds.map(cloneId => {
                        const clone = allRecipes.find(r => r.id === cloneId);
                        if (!clone) return null;
                        return (
                          <div key={cloneId} className="p-3 border rounded-lg flex items-center justify-between">
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {clone.name}
                                {clone.isFavorite && (
                                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {clone.brewDate ? new Date(clone.brewDate).toLocaleDateString() : 'No brew date'}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToRelatedRecipe(clone, 'clone')}
                            >
                              View Clone
                              <ArrowUpRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges}>Discard</AlertDialogAction>
            <AlertDialogAction onClick={handleSaveAndExit}>Save and Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Shopping List Modal */}
      <ShoppingList 
        recipe={currentRecipe} 
        open={showShoppingList} 
        onClose={() => setShowShoppingList(false)} 
      />
    </div>
  );
}