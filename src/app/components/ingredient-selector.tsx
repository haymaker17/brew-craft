import { useState } from 'react';
import { Ingredient, IngredientType, RecipeIngredient } from '../types/brewing';
import { MALTS, HOPS, YEASTS, ADJUNCTS } from '../data/ingredients';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, X, Settings, Check } from 'lucide-react';
import { AddIngredientDialog } from './add-ingredient-dialog';
import { ManageIngredientsDialog } from './manage-ingredients-dialog';
import { saveCustomIngredient, loadCustomIngredients } from '../utils/custom-ingredients-storage';

interface IngredientSelectorProps {
  ingredients: RecipeIngredient[];
  onAddIngredient: (ingredient: RecipeIngredient) => void;
  onRemoveIngredient: (index: number) => void;
  onUpdateIngredient: (index: number, ingredient: RecipeIngredient) => void;
}

interface IngredientFormState {
  selectedIngredient: Ingredient | null;
  amount: string;
  unit: 'lb' | 'oz' | 'g' | 'kg' | 'packet';
  boilTime: string;
  hopUse: 'boil' | 'whirlpool' | 'dry-hop';
  customAlphaAcid: string; // Custom AA% for this batch
  dryHopDays: string; // Duration in days for dry hopping
}

export function IngredientSelector({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredient,
}: IngredientSelectorProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogType, setAddDialogType] = useState<IngredientType>('malt');
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>(loadCustomIngredients());

  // Track which ingredient is being edited (-1 means adding new, null means none)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<IngredientType | null>(null);

  // Single form state for editing/adding
  const [form, setForm] = useState<IngredientFormState>({
    selectedIngredient: null,
    amount: '',
    unit: 'lb',
    boilTime: '60',
    hopUse: 'boil',
    customAlphaAcid: '',
    dryHopDays: '',
  });

  const getIngredientsForType = (type: IngredientType): Ingredient[] => {
    const baseIngredients = (() => {
      switch (type) {
        case 'malt': return MALTS;
        case 'hop': return HOPS;
        case 'yeast': return YEASTS;
        case 'adjunct': return ADJUNCTS;
      }
    })();
    
    const custom = customIngredients.filter(i => i.type === type);
    return [...baseIngredients, ...custom];
  };

  const handleAddCustomIngredient = (ingredient: Ingredient) => {
    saveCustomIngredient(ingredient);
    setCustomIngredients(loadCustomIngredients());
  };

  const handleUpdateCustomIngredients = () => {
    setCustomIngredients(loadCustomIngredients());
  };

  const getIngredientsByType = (type: IngredientType) => {
    return ingredients.filter(ri => ri.ingredient.type === type);
  };

  const openAddDialog = (type: IngredientType) => {
    setAddDialogType(type);
    setAddDialogOpen(true);
  };

  const getDefaultUnit = (type: IngredientType) => {
    switch (type) {
      case 'malt': return 'lb';
      case 'hop': return 'oz';
      case 'yeast': return 'packet';
      case 'adjunct': return 'oz';
    }
  };

  const startAdding = (type: IngredientType) => {
    setEditingIndex(-1);
    setEditingType(type);
    setForm({
      selectedIngredient: null,
      amount: '',
      unit: getDefaultUnit(type),
      boilTime: '60',
      hopUse: 'boil',
      customAlphaAcid: '',
      dryHopDays: '',
    });
  };

  const startEditing = (globalIdx: number, ri: RecipeIngredient) => {
    setEditingIndex(globalIdx);
    setEditingType(ri.ingredient.type);
    setForm({
      selectedIngredient: ri.ingredient,
      amount: ri.amount.toString(),
      unit: ri.unit,
      boilTime: ri.boilTime?.toString() || '60',
      hopUse: ri.hopUse || 'boil',
      customAlphaAcid: ri.customAlphaAcid?.toString() || '',
      dryHopDays: ri.dryHopDays?.toString() || '',
    });
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingType(null);
    setForm({
      selectedIngredient: null,
      amount: '',
      unit: 'lb',
      boilTime: '60',
      hopUse: 'boil',
      customAlphaAcid: '',
      dryHopDays: '',
    });
  };

  const saveIngredient = () => {
    if (!form.selectedIngredient || !form.amount || editingType === null) return;

    const recipeIngredient: RecipeIngredient = {
      ingredient: form.selectedIngredient,
      amount: parseFloat(form.amount),
      unit: form.unit,
      ...(form.selectedIngredient.type === 'hop' && {
        boilTime: form.hopUse === 'boil' ? parseInt(form.boilTime) : undefined,
        hopUse: form.hopUse,
        customAlphaAcid: form.customAlphaAcid ? parseFloat(form.customAlphaAcid) : undefined,
        dryHopDays: form.hopUse === 'dry-hop' && form.dryHopDays ? parseInt(form.dryHopDays) : undefined,
      }),
    };

    if (editingIndex === -1) {
      // Adding new ingredient
      onAddIngredient(recipeIngredient);
    } else if (editingIndex !== null) {
      // Updating existing ingredient
      onUpdateIngredient(editingIndex, recipeIngredient);
    }
    
    cancelEditing();
  };

  const renderIngredientForm = (type: IngredientType) => {
    return (
      <div className="grid gap-4 p-4 border-2 rounded-lg bg-orange-50/50 border-orange-200">
        <div className="flex items-center justify-between">
          <Label>{editingIndex === -1 ? 'Add' : 'Edit'} {type}</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              cancelEditing();
              openAddDialog(type);
            }}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Custom
          </Button>
        </div>
        <Select
          value={form.selectedIngredient?.id || ''}
          onValueChange={(id) => {
            const ingredient = getIngredientsForType(type).find(i => i.id === id);
            setForm({ ...form, selectedIngredient: ingredient || null });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Choose a ${type}`} />
          </SelectTrigger>
          <SelectContent>
            {getIngredientsForType(type).map(ingredient => (
              <SelectItem key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
                {ingredient.type === 'malt' && ingredient.lovibond && ` (${ingredient.lovibond}L)`}
                {ingredient.type === 'hop' && ingredient.alphaAcid && ` (${ingredient.alphaAcid}% AA)`}
                {ingredient.id.startsWith('custom-') && ' ⭐'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={form.unit} onValueChange={(v: any) => setForm({ ...form, unit: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {type === 'hop' && (
                  <>
                    <SelectItem value="oz">oz</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                  </>
                )}
                {type === 'malt' && (
                  <>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </>
                )}
                {type === 'yeast' && (
                  <SelectItem value="packet">packet</SelectItem>
                )}
                {type === 'adjunct' && (
                  <>
                    <SelectItem value="oz">oz</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {type === 'hop' && (
          <>
            <div className="space-y-2">
              <Label>Alpha Acid % (AA%)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.customAlphaAcid}
                onChange={(e) => setForm({ ...form, customAlphaAcid: e.target.value })}
                placeholder={form.selectedIngredient?.alphaAcid?.toString() || '0.0'}
              />
              <p className="text-xs text-muted-foreground">
                {form.selectedIngredient?.alphaAcid 
                  ? `Default: ${form.selectedIngredient.alphaAcid}% AA` 
                  : 'Enter AA% for this batch'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Hop Use</Label>
              <Select value={form.hopUse} onValueChange={(v: any) => setForm({ ...form, hopUse: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boil">Boil</SelectItem>
                  <SelectItem value="whirlpool">Whirlpool</SelectItem>
                  <SelectItem value="dry-hop">Dry Hop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.hopUse === 'boil' && (
              <div className="space-y-2">
                <Label>Boil Time (minutes)</Label>
                <Input
                  type="number"
                  value={form.boilTime}
                  onChange={(e) => setForm({ ...form, boilTime: e.target.value })}
                />
              </div>
            )}
            {form.hopUse === 'dry-hop' && (
              <div className="space-y-2">
                <Label>Dry Hop Duration (days)</Label>
                <Input
                  type="number"
                  value={form.dryHopDays}
                  onChange={(e) => setForm({ ...form, dryHopDays: e.target.value })}
                />
              </div>
            )}
          </>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={saveIngredient} 
            disabled={!form.selectedIngredient || !form.amount}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            {editingIndex === -1 ? 'Add' : 'Update'}
          </Button>
          <Button 
            variant="outline"
            onClick={cancelEditing}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  const renderIngredientSection = (
    type: IngredientType,
    title: string,
  ) => {
    let typeIngredients = getIngredientsByType(type);
    
    // Sort hops by boil time (highest to lowest)
    if (type === 'hop') {
      typeIngredients = [...typeIngredients].sort((a, b) => {
        // Assign sortable values: boil time for boil hops, -1 for whirlpool, -2 for dry-hop
        const getBoilValue = (ri: RecipeIngredient) => {
          if (ri.hopUse === 'boil') return ri.boilTime || 0;
          if (ri.hopUse === 'whirlpool') return -1;
          return -2; // dry-hop
        };
        return getBoilValue(b) - getBoilValue(a); // Descending order
      });
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3>{title}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => startAdding(type)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add {title}
          </Button>
        </div>

        {/* Show add form when adding new for this type */}
        {editingIndex === -1 && editingType === type && renderIngredientForm(type)}

        {/* Display added ingredients */}
        {typeIngredients.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Added {title}</div>
            {typeIngredients.map((ri) => {
              const globalIdx = ingredients.findIndex(i => i === ri);
              const displayAA = ri.customAlphaAcid || ri.ingredient.alphaAcid;
              const isEditing = editingIndex === globalIdx;
              
              return (
                <div key={globalIdx} className="space-y-2">
                  {isEditing ? (
                    renderIngredientForm(type)
                  ) : (
                    <div
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => startEditing(globalIdx, ri)}
                    >
                      <div className="flex-1">
                        <div>{ri.ingredient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ri.amount} {ri.unit}
                          {ri.ingredient.type === 'hop' && displayAA && ` • ${displayAA}% AA`}
                          {ri.hopUse && ` • ${ri.hopUse}`}
                          {ri.boilTime && ` • ${ri.boilTime} min`}
                          {ri.dryHopDays && ` • ${ri.dryHopDays} days`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveIngredient(globalIdx);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>Add malts, hops, yeast, and adjuncts to your recipe</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setManageDialogOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Manage Custom
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {renderIngredientSection('malt', 'Malts')}
          {renderIngredientSection('hop', 'Hops')}
          {renderIngredientSection('yeast', 'Yeast')}
          {renderIngredientSection('adjunct', 'Adjuncts')}
        </CardContent>
      </Card>

      <AddIngredientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        type={addDialogType}
        onAdd={handleAddCustomIngredient}
      />

      <ManageIngredientsDialog
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
        onUpdate={handleUpdateCustomIngredients}
      />
    </>
  );
}