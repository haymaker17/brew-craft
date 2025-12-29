import { useState, useEffect } from "react";
import { Recipe } from "./types/brewing";
import { RecipeList } from "./components/recipe-list";
import { RecipeBuilder } from "./components/recipe-builder";
import { PrintView } from "./components/print-view";
import { PrimingCalculator } from "./components/priming-calculator";
import { IngredientManagementPage } from "./components/ingredient-management-page";
import { Button } from "./components/ui/button";
import {
  Beer,
  Plus,
  FlaskConical,
  Download,
  Upload,
  Calculator,
  Database,
} from "lucide-react";
import { calculateRecipeValues } from "./utils/brewing-calculations";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

const cleanData = (obj: any): any => {
  const newObj: any = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) return;
    if (
      obj[key] &&
      typeof obj[key] === "object" &&
      !(obj[key] instanceof Date)
    ) {
      newObj[key] = cleanData(obj[key]);
    } else {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [printRecipe, setPrintRecipe] = useState<Recipe | null>(null);
  const [showPrimingCalculator, setShowPrimingCalculator] = useState(false);
  const [view, setView] = useState<"list" | "builder" | "ingredients">("list");

  // 1. SYNC WITH FIREBASE
  useEffect(() => {
    const q = query(collection(db, "recipes"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipeData = snapshot.docs.map((doc) => {
        const data = doc.data();

        // Helper to convert Firestore Timestamps to JS Dates
        const convertDate = (field: any) => {
          if (field && typeof field.toDate === "function") {
            return field.toDate();
          }
          return field; // Return as is if it's already a date or null
        };

        return {
          ...data,
          id: doc.id,
          // Convert all potential date fields here
          createdAt: convertDate(data.createdAt),
          updatedAt: convertDate(data.updatedAt),
          brewDate: convertDate(data.brewDate),
          yeastPitchDate: convertDate(data.yeastPitchDate),
          bottlingDate: convertDate(data.bottlingDate),
        } as Recipe;
      });

      setRecipes(recipeData);
    });

    return () => unsubscribe();
  }, []);

  const createNewRecipe = () => {
    const now = new Date();
    const newRecipe: Recipe = {
      id: `recipe-${Date.now()}`,
      name: "",
      batchSize: 5,
      boilTime: 60,
      ingredients: [],
      steps: [],
      mashSteps: [],
      brewDate: now,
      createdAt: now,
      updatedAt: now,
    };
    setCurrentRecipe(newRecipe);
    setView("builder");
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setView("builder");
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      const calculatedValues = calculateRecipeValues(recipe);

      // 1. Combine all data
      const dataToSave = {
        ...recipe,
        ...calculatedValues,
        updatedAt: new Date(),
      };

      // 2. RECURSIVE CLEANER: This removes any 'undefined' keys
      // so Firestore doesn't complain.
      const cleanData = (obj: any): any => {
        const newObj: any = Array.isArray(obj) ? [] : {};
        Object.keys(obj).forEach((key) => {
          if (obj[key] === undefined) {
            // Skip undefined values entirely
            return;
          }
          if (
            obj[key] &&
            typeof obj[key] === "object" &&
            !(obj[key] instanceof Date)
          ) {
            // If it's a nested object (and not a Date), clean it too
            newObj[key] = cleanData(obj[key]);
          } else {
            newObj[key] = obj[key];
          }
        });
        return newObj;
      };

      const finalData = cleanData(dataToSave);

      // 3. Save the cleaned data
      await setDoc(doc(db, "recipes", recipe.id), finalData, { merge: true });

      toast.success("Recipe saved to cloud!");
      console.log("🔥 Successfully saved to Firestore:", finalData);
    } catch (error) {
      console.error("❌ Firestore Save Error:", error);
      toast.error("Failed to save to Firebase");
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      try {
        await deleteDoc(doc(db, "recipes", id));
        toast.success("Recipe deleted!");
      } catch (error) {
        toast.error("Failed to delete recipe");
      }
    }
  };

  const handleDuplicateRecipe = async (recipe: Recipe) => {
    const now = new Date();
    const newId = `recipe-${Date.now()}`;

    const duplicatedRecipe: Recipe = {
      ...recipe,
      id: newId,
      name: `${recipe.name} (Copy)`,
      brewDate: now,
      createdAt: now,
      updatedAt: now,
      // Reset specific brewing data for the copy
      yeastPitchDate: undefined,
      bottlingDate: undefined,
      actualOG: undefined,
      actualFG: undefined,
      parentRecipeId: undefined,
      parentRecipeName: undefined,
      cloneIds: undefined,
      isFavorite: false,
    };

    try {
      // We use our 'clean' logic here too to avoid the undefined error
      const cleanedData = cleanData(duplicatedRecipe);
      await setDoc(doc(db, "recipes", newId), cleanedData);

      toast.success("Recipe duplicated to cloud!");
      setCurrentRecipe(duplicatedRecipe);
      setView("builder");
    } catch (error) {
      toast.error("Failed to duplicate recipe");
    }
  };

  const handleCloneRecipe = async (recipe: Recipe) => {
    const now = new Date();
    const clonedId = `recipe-${Date.now()}`;

    const clonedRecipe: Recipe = {
      ...recipe,
      id: clonedId,
      name: `${recipe.name} (Clone)`,
      brewDate: now,
      createdAt: now,
      updatedAt: now,
      parentRecipeId: recipe.id,
      parentRecipeName: recipe.name,
      cloneIds: undefined,
    };

    try {
      // 1. Create the new Cloned recipe
      await setDoc(doc(db, "recipes", clonedId), cleanData(clonedRecipe));

      // 2. Update the Parent recipe to include this clone in its list
      const parentRef = doc(db, "recipes", recipe.id);
      await setDoc(
        parentRef,
        {
          cloneIds: [...(recipe.cloneIds || []), clonedId],
          updatedAt: now,
        },
        { merge: true }
      );

      toast.success("Recipe cloned and linked!");
      setCurrentRecipe(clonedRecipe);
      setView("builder");
    } catch (error) {
      console.error("Clone error:", error);
      toast.error("Failed to clone recipe");
    }
  };

  const handleBack = () => {
    setCurrentRecipe(null);
    setView("list");
  };

  // UI RENDERING
  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Header */}
      <header className="border-b bg-gradient-to-r from-orange-600 to-amber-600 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
                <Beer className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-white">BrewCraft</h1>
                <p className="text-sm text-orange-50">
                  Craft Your Perfect Beer
                </p>
              </div>
            </div>
            {view === "list" && (
              <Button
                onClick={createNewRecipe}
                size="lg"
                className="bg-white text-orange-700 hover:bg-orange-50 shadow-md">
                <Plus className="w-5 h-5 mr-2" />
                New Recipe
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {view === "list" ? (
          <>
            {recipes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FlaskConical className="w-12 h-12 text-orange-600" />
                </div>
                <h2 className="mb-2">No Cloud Recipes Yet!</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first recipe to save it to your new Firebase
                  database.
                </p>
                <Button onClick={createNewRecipe} size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Recipe
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2>My Cloud Recipes</h2>
                    <p className="text-muted-foreground">
                      Stored securely in Firebase
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowPrimingCalculator(true)}
                      variant="ghost"
                      size="sm">
                      <Calculator className="w-4 h-4 mr-2" />
                      Priming Calculator
                    </Button>
                    <Button
                      onClick={() => setView("ingredients")}
                      variant="ghost"
                      size="sm">
                      <Database className="w-4 h-4 mr-2" />
                      Ingredients
                    </Button>
                  </div>
                </div>
                <RecipeList
                  recipes={recipes}
                  onSelectRecipe={handleSelectRecipe}
                  onDeleteRecipe={handleDeleteRecipe}
                  onDuplicateRecipe={handleDuplicateRecipe}
                  onCloneRecipe={handleCloneRecipe}
                  onPrintRecipe={setPrintRecipe}
                />
              </>
            )}
          </>
        ) : currentRecipe ? (
          <RecipeBuilder
            recipe={currentRecipe}
            onSave={handleSaveRecipe}
            onBack={handleBack}
            onPrint={setPrintRecipe}
            onClone={handleCloneRecipe}
            allRecipes={recipes}
            onSelectRecipe={handleSelectRecipe}
          />
        ) : view === "ingredients" ? (
          <IngredientManagementPage onBack={handleBack} />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Happy Brewing! (Connected to Firebase 🔥)</p>
        </div>
      </footer>

      {/* Modals */}
      {printRecipe && (
        <PrintView recipe={printRecipe} onClose={() => setPrintRecipe(null)} />
      )}
      {showPrimingCalculator && (
        <PrimingCalculator onClose={() => setShowPrimingCalculator(false)} />
      )}
    </div>
  );
}

export default App;
