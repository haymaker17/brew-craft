import { useState, useEffect } from 'react';
import { Ingredient, IngredientType } from '../types/brewing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Pencil, Trash2, Plus, ArrowLeft, Search } from 'lucide-react';
import { loadIngredients, deleteIngredient, saveIngredient } from '../utils/ingredients-storage';
import { toast } from 'sonner';
import { AddIngredientDialog } from './add-ingredient-dialog';

interface IngredientManagementPageProps {
  onBack: () => void;
}

export function IngredientManagementPage({ onBack }: IngredientManagementPageProps) {
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogType, setAddDialogType] = useState<IngredientType>('malt');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    refreshIngredients();
  }, []);

  const refreshIngredients = () => {
    setAllIngredients(loadIngredients());
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteIngredient(id);
      refreshIngredients();
      toast.success('Ingredient deleted');
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
  };

  const handleSaveEdit = () => {
    if (editingIngredient) {
      saveIngredient(editingIngredient);
      refreshIngredients();
      setEditingIngredient(null);
      toast.success('Ingredient updated');
    }
  };

  const handleCancelEdit = () => {
    setEditingIngredient(null);
  };

  const handleAddNewIngredient = (type: IngredientType) => {
    setAddDialogType(type);
    setAddDialogOpen(true);
  };

  const handleAddIngredient = (ingredient: Ingredient) => {
    saveIngredient(ingredient);
    refreshIngredients();
  };

  const getByType = (type: IngredientType) => {
    let ingredients = allIngredients.filter(i => i.type === type);
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      ingredients = ingredients.filter(i => 
        i.name.toLowerCase().includes(query)
      );
    }
    
    return ingredients;
  };

  const renderIngredientList = (type: IngredientType) => {
    const ingredients = getByType(type);

    if (ingredients.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No {type}s in your database</p>
          <Button onClick={() => handleAddNewIngredient(type)}>
            <Plus className="w-4 h-4 mr-2" />
            Add {type}
          </Button>
        </div>
      );
    }

    // Sort: custom ingredients first, then default
    const sortedIngredients = [...ingredients].sort((a, b) => {
      const aIsCustom = a.id.startsWith('custom-') ? 1 : 0;
      const bIsCustom = b.id.startsWith('custom-') ? 1 : 0;
      return bIsCustom - aIsCustom;
    });

    return (
      <div className="space-y-4">
        <Button onClick={() => handleAddNewIngredient(type)} className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add {type}
        </Button>
        
        <div className="space-y-2">
          {sortedIngredients.map((ingredient) => {
            const isCustom = ingredient.id.startsWith('custom-');
            const isEditing = editingIngredient?.id === ingredient.id;

            if (isEditing) {
              return (
                <Card key={ingredient.id} className="border-2 border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Edit {type}</CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={editingIngredient.name}
                        onChange={(e) => setEditingIngredient({ ...editingIngredient, name: e.target.value })}
                      />
                    </div>

                    {type === 'malt' && (
                      <>
                        <div>
                          <Label>Lovibond (Color)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={editingIngredient.lovibond || ''}
                            onChange={(e) => setEditingIngredient({ ...editingIngredient, lovibond: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>PPG (Extract Potential)</Label>
                          <Input
                            type="number"
                            value={editingIngredient.ppg || ''}
                            onChange={(e) => setEditingIngredient({ ...editingIngredient, ppg: parseInt(e.target.value) })}
                          />
                        </div>
                      </>
                    )}

                    {type === 'hop' && (
                      <div>
                        <Label>Alpha Acid %</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editingIngredient.alphaAcid || ''}
                          onChange={(e) => setEditingIngredient({ ...editingIngredient, alphaAcid: parseFloat(e.target.value) })}
                        />
                      </div>
                    )}

                    {type === 'yeast' && (
                      <>
                        <div>
                          <Label>Attenuation %</Label>
                          <Input
                            type="number"
                            value={editingIngredient.attenuation || ''}
                            onChange={(e) => setEditingIngredient({ ...editingIngredient, attenuation: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Flocculation</Label>
                          <Input
                            value={editingIngredient.flocculation || ''}
                            onChange={(e) => setEditingIngredient({ ...editingIngredient, flocculation: e.target.value })}
                            placeholder="Low, Medium, or High"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Min Temp (°F)</Label>
                            <Input
                              type="number"
                              value={editingIngredient.tempRange?.[0] || ''}
                              onChange={(e) => {
                                const min = parseInt(e.target.value);
                                const max = editingIngredient.tempRange?.[1] || 75;
                                setEditingIngredient({ ...editingIngredient, tempRange: [min, max] });
                              }}
                            />
                          </div>
                          <div>
                            <Label>Max Temp (°F)</Label>
                            <Input
                              type="number"
                              value={editingIngredient.tempRange?.[1] || ''}
                              onChange={(e) => {
                                const min = editingIngredient.tempRange?.[0] || 60;
                                const max = parseInt(e.target.value);
                                setEditingIngredient({ ...editingIngredient, tempRange: [min, max] });
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            }

            return (
              <div
                key={ingredient.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{ingredient.name}</span>
                    {isCustom ? (
                      <Badge variant="secondary" className="text-xs">Custom</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {type === 'malt' && (
                      <>
                        {ingredient.lovibond && `${ingredient.lovibond}°L`}
                        {ingredient.lovibond && ingredient.ppg && ' • '}
                        {ingredient.ppg && `${ingredient.ppg} PPG`}
                      </>
                    )}
                    {type === 'hop' && ingredient.alphaAcid && `${ingredient.alphaAcid}% AA`}
                    {type === 'yeast' && (
                      <>
                        {ingredient.attenuation && `${ingredient.attenuation}% attenuation`}
                        {ingredient.flocculation && ` • ${ingredient.flocculation} flocculation`}
                        {ingredient.tempRange && ` • ${ingredient.tempRange[0]}-${ingredient.tempRange[1]}°F`}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(ingredient)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(ingredient.id, ingredient.name)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recipes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingredient Database</CardTitle>
          <CardDescription>
            Manage all ingredients in your brewing database. Edit or delete any ingredient, or add new ones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Found {allIngredients.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).length} ingredient(s)
              </p>
            )}
          </div>

          <Tabs defaultValue="malt" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="malt">
                Malts ({getByType('malt').length})
              </TabsTrigger>
              <TabsTrigger value="hop">
                Hops ({getByType('hop').length})
              </TabsTrigger>
              <TabsTrigger value="yeast">
                Yeast ({getByType('yeast').length})
              </TabsTrigger>
              <TabsTrigger value="adjunct">
                Adjuncts ({getByType('adjunct').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="malt" className="mt-6">
              {renderIngredientList('malt')}
            </TabsContent>
            <TabsContent value="hop" className="mt-6">
              {renderIngredientList('hop')}
            </TabsContent>
            <TabsContent value="yeast" className="mt-6">
              {renderIngredientList('yeast')}
            </TabsContent>
            <TabsContent value="adjunct" className="mt-6">
              {renderIngredientList('adjunct')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddIngredientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        type={addDialogType}
        onAdd={handleAddIngredient}
      />
    </div>
  );
}