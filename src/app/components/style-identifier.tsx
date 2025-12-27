import { Recipe } from '../types/brewing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { matchBeerStyle, calculateRecipeValues, getSRMColor } from '../utils/brewing-calculations';
import { BEER_STYLES } from '../data/beer-styles';
import { Sparkles, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface StyleIdentifierProps {
  recipe: Recipe;
}

export function StyleIdentifier({ recipe }: StyleIdentifierProps) {
  const [showOtherMatches, setShowOtherMatches] = useState(false);
  const matches = matchBeerStyle(recipe);
  const calculated = calculateRecipeValues(recipe);
  const beerColor = getSRMColor(calculated.srm || 0);
  
  // Use saved values with priority: actualOG/FG > saved values > calculated values
  const displayOG = recipe.actualOG ?? recipe.originalGravity ?? calculated.originalGravity ?? 0;
  const displayFG = recipe.actualFG ?? recipe.finalGravity ?? calculated.finalGravity ?? 0;
  const displayABV = (recipe.actualOG && recipe.actualFG) 
    ? ((recipe.actualOG - recipe.actualFG) * 131.25)
    : (recipe.abv ?? calculated.abv ?? 0);
  const displayIBU = recipe.ibu ?? calculated.ibu ?? 0;
  const displaySRM = recipe.srm ?? calculated.srm ?? 0;
  const displayCalories = recipe.caloriesPer12oz ?? calculated.caloriesPer12oz ?? 0;
  const displayCarbs = recipe.carbsPer12oz ?? calculated.carbsPer12oz ?? 0;
  
  const isUsingActual = !!(recipe.actualOG && recipe.actualFG);

  const topMatch = matches[0];
  const matchedStyle = BEER_STYLES.find(s => s.name === topMatch.style);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Style Identification
        </CardTitle>
        <CardDescription>
          Based on your recipe's characteristics, here are the closest beer style matches
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipe Vitals */}
        <div className="space-y-4">
          <h4>Recipe Characteristics</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Original Gravity</div>
              <div>{displayOG.toFixed(3)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Final Gravity</div>
              <div>{displayFG.toFixed(3)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">ABV</div>
              <div>{displayABV.toFixed(1)}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">IBU</div>
              <div>{displayIBU}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">SRM (Color)</div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: beerColor }}
                />
                {displaySRM.toFixed(1)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Batch Size</div>
              <div>{recipe.batchSize} gallons</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Calories (per 12oz)</div>
              <div>{displayCalories}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Carbs (per 12oz)</div>
              <div>{displayCarbs}g</div>
            </div>
          </div>
        </div>

        {/* Top Match */}
        {topMatch && matchedStyle && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <h4>Best Match: {matchedStyle.name}</h4>
              </div>
              <Badge variant={topMatch.confidence >= 80 ? 'default' : 'secondary'}>
                {topMatch.confidence}% match
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{matchedStyle.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Category:</span> {matchedStyle.category}
              </div>
              <div>
                <span className="text-muted-foreground">Matching:</span> {topMatch.matches.join(', ')}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">ABV Range:</span> {matchedStyle.abvRange[0]}-{matchedStyle.abvRange[1]}%
                </div>
                <div>
                  <span className="text-muted-foreground">IBU Range:</span> {matchedStyle.ibuRange[0]}-{matchedStyle.ibuRange[1]}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">OG Range:</span> {matchedStyle.ogRange[0].toFixed(3)}-{matchedStyle.ogRange[1].toFixed(3)}
                </div>
                <div>
                  <span className="text-muted-foreground">SRM Range:</span> {matchedStyle.srmRange[0]}-{matchedStyle.srmRange[1]}
                </div>
              </div>
            </div>

            {/* Toggle for Other Matches */}
            {matches.length > 1 && matches.slice(1, 5).some(m => m.confidence > 0) && (
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOtherMatches(!showOtherMatches)}
                  className="w-full justify-between text-muted-foreground hover:text-foreground"
                >
                  <span>Other possible matches</span>
                  {showOtherMatches ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                {/* Other Matches - Collapsible */}
                {showOtherMatches && (
                  <div className="space-y-2 mt-3">
                    {matches.slice(1, 5).map((match) => {
                      const style = BEER_STYLES.find(s => s.name === match.style);
                      if (!style || match.confidence === 0) return null;

                      return (
                        <div key={match.style} className="space-y-2 p-3 border rounded-lg bg-background">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{style.name}</span>
                            <Badge variant="outline">{match.confidence}%</Badge>
                          </div>
                          <Progress value={match.confidence} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            Matching: {match.matches.join(', ') || 'No exact matches'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {topMatch?.confidence === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p>No strong style match found. Your recipe might be a unique experimental brew!</p>
            <p className="text-sm mt-2">Try adjusting ingredients to get closer to a specific style.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}