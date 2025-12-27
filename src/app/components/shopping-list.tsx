import { Recipe, RecipeIngredient } from '../types/brewing';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { X, Printer, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ShoppingListProps {
  recipe: Recipe;
  open: boolean;
  onClose: () => void;
}

interface ShoppingItem {
  name: string;
  amount: number;
  unit: string;
  type: string;
  checked: boolean;
}

export function ShoppingList({ recipe, open, onClose }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  // Generate shopping list items from recipe
  const generateShoppingList = (): ShoppingItem[] => {
    const shoppingItems: ShoppingItem[] = [];

    recipe.ingredients.forEach((recipeIng: RecipeIngredient) => {
      const item: ShoppingItem = {
        name: recipeIng.ingredient.name,
        amount: recipeIng.amount,
        unit: recipeIng.unit,
        type: recipeIng.ingredient.type,
        checked: false,
      };
      shoppingItems.push(item);
    });

    return shoppingItems;
  };

  // Initialize items when modal opens or recipe changes
  useEffect(() => {
    if (open) {
      setItems(generateShoppingList());
    }
  }, [open, recipe.id]);

  const toggleItem = (index: number) => {
    setItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Group items by type
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const typeLabels: Record<string, string> = {
    malt: 'Malts & Grains',
    hop: 'Hops',
    yeast: 'Yeast',
    adjunct: 'Adjuncts & Other',
  };

  const typeOrder = ['malt', 'hop', 'yeast', 'adjunct'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto shopping-list-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Shopping List</DialogTitle>
              <DialogDescription>
                {recipe.name} - {recipe.batchSize} gallon batch
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="no-print">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No ingredients in this recipe yet.
            </p>
          ) : (
            <>
              {typeOrder.map(type => {
                const itemsOfType = groupedItems[type];
                if (!itemsOfType || itemsOfType.length === 0) return null;

                return (
                  <div key={type}>
                    <h3 className="mb-3 pb-2 border-b">{typeLabels[type]}</h3>
                    <div className="space-y-2">
                      {itemsOfType.map((item, index) => {
                        const globalIndex = items.findIndex(i => i === item);
                        return (
                          <div
                            key={globalIndex}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => toggleItem(globalIndex)}
                          >
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                item.checked
                                  ? 'bg-orange-600 border-orange-600'
                                  : 'border-gray-300'
                              }`}
                            >
                              {item.checked && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                                {item.name}
                              </span>
                            </div>
                            <div className="text-sm font-medium">
                              {item.amount} {item.unit}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Print-only header */}
        <div className="print-only hidden">
          <div className="mb-6 pb-4 border-b-2">
            <h1 className="text-2xl font-bold">Shopping List</h1>
            <p className="text-lg mt-2">{recipe.name}</p>
            <p className="text-sm text-gray-600">{recipe.batchSize} gallon batch</p>
          </div>
        </div>

        {/* Print-only checklist */}
        <div className="print-only hidden space-y-6">
          {typeOrder.map(type => {
            const itemsOfType = groupedItems[type];
            if (!itemsOfType || itemsOfType.length === 0) return null;

            return (
              <div key={type}>
                <h2 className="text-lg font-semibold mb-3 pb-2 border-b">{typeLabels[type]}</h2>
                <div className="space-y-2">
                  {itemsOfType.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 py-2">
                      <div className="w-5 h-5 mt-0.5 rounded border-2 border-gray-400 flex-shrink-0"></div>
                      <div className="flex-1">
                        <span>{item.name}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {item.amount} {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}