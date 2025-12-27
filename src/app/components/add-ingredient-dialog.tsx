import { useState } from 'react';
import { Ingredient, IngredientType } from '../types/brewing';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface AddIngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: IngredientType;
  onAdd: (ingredient: Ingredient) => void;
}

export function AddIngredientDialog({ open, onOpenChange, type, onAdd }: AddIngredientDialogProps) {
  const [name, setName] = useState('');
  // Malt properties
  const [lovibond, setLovibond] = useState('');
  const [ppg, setPpg] = useState('');
  // Hop properties
  const [alphaAcid, setAlphaAcid] = useState('');
  // Yeast properties
  const [attenuation, setAttenuation] = useState('');
  const [flocculation, setFlocculation] = useState<'low' | 'medium' | 'high'>('medium');
  const [tempMin, setTempMin] = useState('');
  const [tempMax, setTempMax] = useState('');

  const resetForm = () => {
    setName('');
    setLovibond('');
    setPpg('');
    setAlphaAcid('');
    setAttenuation('');
    setFlocculation('medium');
    setTempMin('');
    setTempMax('');
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Please enter an ingredient name');
      return;
    }

    const ingredient: Ingredient = {
      id: `custom-${type}-${Date.now()}`,
      name: name.trim(),
      type,
    };

    // Add type-specific properties
    if (type === 'malt') {
      if (lovibond) ingredient.lovibond = parseFloat(lovibond);
      if (ppg) ingredient.ppg = parseFloat(ppg);
    } else if (type === 'hop') {
      if (alphaAcid) ingredient.alphaAcid = parseFloat(alphaAcid);
    } else if (type === 'yeast') {
      if (attenuation) ingredient.attenuation = parseFloat(attenuation);
      ingredient.flocculation = flocculation;
      if (tempMin && tempMax) {
        ingredient.tempRange = [parseFloat(tempMin), parseFloat(tempMax)];
      }
    }

    onAdd(ingredient);
    resetForm();
    onOpenChange(false);
    toast.success(`${name} added successfully!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Ingredient'}</DialogTitle>
          <DialogDescription>
            Create a custom ingredient to add to your library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g., ${type === 'malt' ? 'Custom Pale Malt' : type === 'hop' ? 'Custom Hop Variety' : type === 'yeast' ? 'Custom Yeast Strain' : 'Custom Adjunct'}`}
            />
          </div>

          {type === 'malt' && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lovibond (Color)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={lovibond}
                    onChange={(e) => setLovibond(e.target.value)}
                    placeholder="e.g., 2.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>PPG (Extract)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={ppg}
                    onChange={(e) => setPpg(e.target.value)}
                    placeholder="e.g., 37"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Lovibond: color contribution (1-500). PPG: points per pound per gallon (typically 25-38).
              </p>
            </>
          )}

          {type === 'hop' && (
            <>
              <div className="space-y-2">
                <Label>Alpha Acid %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={alphaAcid}
                  onChange={(e) => setAlphaAcid(e.target.value)}
                  placeholder="e.g., 12.5"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Alpha acid percentage for IBU calculations (typically 3-15%).
              </p>
            </>
          )}

          {type === 'yeast' && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Attenuation %</Label>
                  <Input
                    type="number"
                    step="1"
                    value={attenuation}
                    onChange={(e) => setAttenuation(e.target.value)}
                    placeholder="e.g., 75"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Flocculation</Label>
                  <Select value={flocculation} onValueChange={(v: any) => setFlocculation(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Temp Min (°F)</Label>
                  <Input
                    type="number"
                    value={tempMin}
                    onChange={(e) => setTempMin(e.target.value)}
                    placeholder="e.g., 65"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Temp Max (°F)</Label>
                  <Input
                    type="number"
                    value={tempMax}
                    onChange={(e) => setTempMax(e.target.value)}
                    placeholder="e.g., 75"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Attenuation: expected fermentation % (typically 65-85%).
              </p>
            </>
          )}

          {type === 'adjunct' && (
            <p className="text-sm text-muted-foreground">
              Adjuncts don't require additional properties. Just enter a name.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Ingredient</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}