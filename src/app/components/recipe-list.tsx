import { Recipe } from '../types/brewing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Beer, Calendar, Trash2, Copy, Search, Printer, MoreVertical, Star } from 'lucide-react';
import { calculateRecipeValues, getSRMColor } from '../utils/brewing-calculations';
import { useState, useMemo } from 'react';

interface RecipeListProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onDuplicateRecipe: (recipe: Recipe) => void;
  onPrintRecipe: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, onSelectRecipe, onDeleteRecipe, onDuplicateRecipe, onPrintRecipe }: RecipeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-newest');

  // Get unique styles from recipes
  const uniqueStyles = useMemo(() => {
    const styles = recipes
      .map(r => r.style)
      .filter((style): style is string => !!style);
    return Array.from(new Set(styles)).sort();
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    let filtered = recipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStyle = styleFilter === 'all' || recipe.style === styleFilter;
      return matchesSearch && matchesStyle;
    });

    // Sort recipes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-newest':
          const dateA = a.brewDate ? new Date(a.brewDate) : new Date(a.createdAt);
          const dateB = b.brewDate ? new Date(b.brewDate) : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        case 'date-oldest':
          const dateA2 = a.brewDate ? new Date(a.brewDate) : new Date(a.createdAt);
          const dateB2 = b.brewDate ? new Date(b.brewDate) : new Date(b.createdAt);
          return dateA2.getTime() - dateB2.getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'abv-high':
          const abvA = a.abv || 0;
          const abvB = b.abv || 0;
          return abvB - abvA;
        case 'abv-low':
          const abvA2 = a.abv || 0;
          const abvB2 = b.abv || 0;
          return abvA2 - abvB2;
        default:
          return 0;
      }
    });

    return filtered;
  }, [recipes, searchTerm, styleFilter, sortBy]);

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <Beer className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-muted-foreground">No recipes yet. Create your first brew!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-newest">Newest First</SelectItem>
            <SelectItem value="date-oldest">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="abv-high">ABV (High-Low)</SelectItem>
            <SelectItem value="abv-low">ABV (Low-High)</SelectItem>
          </SelectContent>
        </Select>
        {uniqueStyles.length > 0 && (
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Styles</SelectItem>
              {uniqueStyles.map(style => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Results */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <Beer className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">No recipes match your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map(recipe => {
            const calculated = calculateRecipeValues(recipe);
            const beerColor = getSRMColor(calculated.srm || 0);
            
            return (
              <Card
                key={recipe.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden border-2 hover:border-orange-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1" onClick={() => onSelectRecipe(recipe)}>
                      <CardTitle className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-lg border-2 border-white shadow-md flex-shrink-0 ring-2 ring-stone-200"
                          style={{ backgroundColor: beerColor }}
                        />
                        <span className="flex-1">{recipe.name}</span>
                        {recipe.isFavorite && (
                          <Star className="w-5 h-5 fill-amber-400 text-amber-500 flex-shrink-0" />
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {(() => {
                          const date = recipe.brewDate ? new Date(recipe.brewDate) : new Date(recipe.createdAt);
                          return date.toLocaleDateString();
                        })()}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onPrintRecipe(recipe);
                          }}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateRecipe(recipe);
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRecipe(recipe.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent onClick={() => onSelectRecipe(recipe)}>
                  {recipe.style && (
                    <Badge variant="secondary" className="mb-3">
                      {recipe.style}
                    </Badge>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">ABV:</span>{' '}
                      <span>{calculated.abv?.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IBU:</span>{' '}
                      <span>{calculated.ibu}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">OG:</span>{' '}
                      <span>{calculated.originalGravity?.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>{' '}
                      <span>{recipe.batchSize} gal</span>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {recipe.ingredients.length} ingredients • {recipe.steps.length} steps
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}