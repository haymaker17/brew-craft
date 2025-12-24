import { useState, useEffect } from 'react';
import { Ingredient, IngredientType } from '../types/brewing';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Trash2 } from 'lucide-react';
import { loadCustomIngredients, deleteCustomIngredient } from '../utils/custom-ingredients-storage';
import { toast } from 'sonner';

interface ManageIngredientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ManageIngredientsDialog({ open, onOpenChange, onUpdate }: ManageIngredientsDialogProps) {
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    if (open) {
      setCustomIngredients(loadCustomIngredients());
    }
  }, [open]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteCustomIngredient(id);
      setCustomIngredients(loadCustomIngredients());
      onUpdate();
      toast.success('Ingredient deleted');
    }
  };

  const getByType = (type: IngredientType) => {
    return customIngredients.filter(i => i.type === type);
  };

  const renderIngredientList = (type: IngredientType) => {
    const ingredients = getByType(type);

    if (ingredients.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No custom {type}s added yet
        </div>
      );
    }

    return (
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="flex items-start justify-between p-3 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{ingredient.name}</span>
                  <Badge variant="secondary" className="text-xs">Custom</Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(ingredient.id, ingredient.name)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Custom Ingredients</DialogTitle>
          <DialogDescription>
            View and delete your custom ingredients
          </DialogDescription>
        </DialogHeader>

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

          <TabsContent value="malt" className="mt-4">
            {renderIngredientList('malt')}
          </TabsContent>
          <TabsContent value="hop" className="mt-4">
            {renderIngredientList('hop')}
          </TabsContent>
          <TabsContent value="yeast" className="mt-4">
            {renderIngredientList('yeast')}
          </TabsContent>
          <TabsContent value="adjunct" className="mt-4">
            {renderIngredientList('adjunct')}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
