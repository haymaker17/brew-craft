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
import { loadIngredients, deleteIngredient } from '../utils/ingredients-storage';
import { toast } from 'sonner';

interface ManageIngredientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ManageIngredientsDialog({ open, onOpenChange, onUpdate }: ManageIngredientsDialogProps) {
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    if (open) {
      setAllIngredients(loadIngredients());
    }
  }, [open]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteIngredient(id);
      setAllIngredients(loadIngredients());
      onUpdate();
      toast.success('Ingredient deleted');
    }
  };

  const getByType = (type: IngredientType) => {
    return allIngredients.filter(i => i.type === type);
  };

  const renderIngredientList = (type: IngredientType) => {
    const ingredients = getByType(type);

    if (ingredients.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No {type}s available
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
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {sortedIngredients.map((ingredient) => {
            const isCustom = ingredient.id.startsWith('custom-');
            return (
              <div
                key={ingredient.id}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{ingredient.name}</span>
                    {isCustom ? (
                      <Badge variant="secondary" className="text-xs">Custom</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Default</Badge>
                    )}
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
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Ingredients</DialogTitle>
          <DialogDescription>
            View and delete any ingredient from your database
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