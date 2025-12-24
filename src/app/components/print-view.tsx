import { Recipe } from '../types/brewing';
import { calculateRecipeValues, getSRMColor } from '../utils/brewing-calculations';
import { Button } from './ui/button';
import { X, Printer } from 'lucide-react';
import { useEffect } from 'react';

interface PrintViewProps {
  recipe: Recipe;
  onClose: () => void;
}

export function PrintView({ recipe, onClose }: PrintViewProps) {
  const calculated = calculateRecipeValues(recipe);
  const beerColor = getSRMColor(calculated.srm || 0);

  useEffect(() => {
    // Prevent body scrolling when print view is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const malts = recipe.ingredients.filter(i => i.ingredient.type === 'malt');
  const hops = recipe.ingredients.filter(i => i.ingredient.type === 'hop').sort((a, b) => {
    // Sort hops by boil time (highest to lowest)
    const getBoilValue = (ing: typeof a) => {
      if (ing.hopUse === 'boil') return ing.boilTime || 0;
      if (ing.hopUse === 'whirlpool') return -1;
      return -2; // dry-hop
    };
    return getBoilValue(b) - getBoilValue(a); // Descending order
  });
  const yeasts = recipe.ingredients.filter(i => i.ingredient.type === 'yeast');
  const adjuncts = recipe.ingredients.filter(i => i.ingredient.type === 'adjunct');

  // Calculate grain bill percentages
  const totalMaltWeight = malts.reduce((sum, ing) => {
    const lbs = ing.unit === 'oz' ? ing.amount / 16 : 
                ing.unit === 'g' ? ing.amount / 453.592 : 
                ing.unit === 'kg' ? ing.amount * 2.20462 : 
                ing.amount;
    return sum + lbs;
  }, 0);

  const getMaltPercentage = (ing: typeof malts[0]) => {
    const lbs = ing.unit === 'oz' ? ing.amount / 16 : 
                ing.unit === 'g' ? ing.amount / 453.592 : 
                ing.unit === 'kg' ? ing.amount * 2.20462 : 
                ing.amount;
    return (lbs / totalMaltWeight) * 100;
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      {/* Screen-only header */}
      <div className="print:hidden sticky top-0 bg-background border-b p-4 flex items-center justify-between">
        <h2>Print Preview</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      {/* Print content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-gray-800"
                style={{ backgroundColor: beerColor }}
              />
              <h1 className="text-3xl">{recipe.name}</h1>
            </div>
            {recipe.style && (
              <p className="text-muted-foreground text-lg">{recipe.style}</p>
            )}
          </div>

          {/* Recipe Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b pb-4">
            {recipe.brewDate && (
              <div className="col-span-2 md:col-span-4 mb-2">
                <div className="text-sm text-muted-foreground">Brew Date</div>
                <div className="text-lg">{new Date(recipe.brewDate).toLocaleDateString()}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Batch Size</div>
              <div className="text-xl font-semibold">{recipe.batchSize} gal</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Boil Time</div>
              <div className="text-xl font-semibold">{recipe.boilTime} min</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">ABV</div>
              <div className="text-xl font-semibold">{calculated.abv?.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">IBU</div>
              <div className="text-xl font-semibold">{calculated.ibu}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">OG</div>
              <div className="text-xl font-semibold">{calculated.originalGravity?.toFixed(3)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">FG</div>
              <div className="text-xl font-semibold">{calculated.finalGravity?.toFixed(3)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">SRM</div>
              <div className="text-xl font-semibold">{calculated.srm?.toFixed(1)}</div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h2 className="text-2xl mb-4">Ingredients</h2>
            
            {malts.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Malts & Grains</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-right py-2">Amount</th>
                      <th className="text-right py-2">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {malts.map((ing, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{ing.ingredient.name}</td>
                        <td className="text-right">{ing.amount} {ing.unit}</td>
                        <td className="text-right">{getMaltPercentage(ing).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {hops.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Hops</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-right py-2">Amount</th>
                      <th className="text-right py-2">Time</th>
                      <th className="text-right py-2">AA%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hops.map((ing, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{ing.ingredient.name}</td>
                        <td className="text-right">{ing.amount} {ing.unit}</td>
                        <td className="text-right">{ing.boilTime || 0} min</td>
                        <td className="text-right">{ing.ingredient.alphaAcid}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {yeasts.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Yeast</h3>
                <ul className="list-disc list-inside text-sm">
                  {yeasts.map((ing, idx) => (
                    <li key={idx}>
                      {ing.ingredient.name} - {ing.amount} {ing.unit}
                      {ing.ingredient.attenuation && ` (${ing.ingredient.attenuation}% attenuation)`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {adjuncts.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Adjuncts</h3>
                <ul className="list-disc list-inside text-sm">
                  {adjuncts.map((ing, idx) => (
                    <li key={idx}>
                      {ing.ingredient.name} - {ing.amount} {ing.unit}
                      {ing.boilTime !== undefined && ` @ ${ing.boilTime} min`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Mash Steps */}
          {recipe.mashSteps && recipe.mashSteps.length > 0 && (
            <div>
              <h2 className="text-2xl mb-4">Mash Schedule</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Step</th>
                    <th className="text-right py-2">Temperature</th>
                    <th className="text-right py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.mashSteps.map((step) => (
                    <tr key={step.id} className="border-b">
                      <td className="py-2">{step.name}</td>
                      <td className="text-right">{step.temperature}°F</td>
                      <td className="text-right">{step.duration} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Process Steps */}
          {recipe.steps && recipe.steps.length > 0 && (
            <div>
              <h2 className="text-2xl mb-4">Brewing Process</h2>
              <ol className="list-decimal list-inside space-y-2">
                {recipe.steps.map((step) => (
                  <li key={step.id} className="text-sm">
                    <span className="font-semibold">{step.name}</span>
                    {step.temperature && ` - ${step.temperature}°F`}
                    {step.duration > 0 && ` for ${step.duration} min`}
                    {step.notes && (
                      <div className="ml-6 mt-1 text-muted-foreground">{step.notes}</div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Process Notes */}
          {recipe.processNotes && (
            <div>
              <h2 className="text-2xl mb-4">Brewing Notes</h2>
              <div className="text-sm whitespace-pre-wrap border-l-4 border-primary pl-4">
                {recipe.processNotes}
              </div>
            </div>
          )}

          {/* Brew Day Checklist */}
          <div className="print:break-before-page">
            <h2 className="text-2xl mb-4">Brew Day Checklist</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Sanitize all equipment</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Heat strike water to proper temperature</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Measure and crush grains</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Complete mash schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Begin boil and add hops at scheduled times</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Cool wort to pitching temperature</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Take OG reading: _______</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Pitch yeast and aerate</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Monitor fermentation temperature</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Take FG reading: _______</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Bottle or keg</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4 mt-8">
            <p>Created with BrewCraft • {new Date(recipe.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}