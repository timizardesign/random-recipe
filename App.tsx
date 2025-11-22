import React, { useState } from 'react';
import { Loader2, UtensilsCrossed } from 'lucide-react';
import { RandomRecipe } from './types';
import { getRandomMeal } from './services/geminiService';
import RecipeCard from './components/RecipeCard';

const App: React.FC = () => {
  const [recipe, setRecipe] = useState<RandomRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetMeal = async () => {
    setError(null);
    setLoading(true);
    setRecipe(null);

    try {
      const result = await getRandomMeal();
      setRecipe(result);
    } catch (e) {
      setError("Oops! The chef dropped the plate. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <main className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center min-h-screen">
        
        <div className="text-center space-y-6 max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Are you feeling hungry?
          </h1>
          <p className="text-xl text-gray-600">
            Get a random meal now by clicking the button below
          </p>
          
          <button
            onClick={handleGetMeal}
            disabled={loading}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#2d2013] text-white rounded-lg hover:bg-[#3e2f20] transition-all transform active:scale-95 shadow-xl font-bold text-lg uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} /> Preparing...
              </>
            ) : (
              <>
                <UtensilsCrossed size={24} /> Get Meal
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
             <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-[#2d2013] rounded-full animate-spin"></div>
                <UtensilsCrossed className="absolute inset-0 m-auto text-gray-400" size={32} />
             </div>
             <p className="mt-6 text-gray-500 font-medium">Finding a delicious meal for you...</p>
          </div>
        )}

        {!loading && recipe && (
          <RecipeCard recipe={recipe} />
        )}
        
      </main>
    </div>
  );
};

export default App;
