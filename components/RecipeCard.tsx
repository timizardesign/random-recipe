import React, { useEffect, useState } from 'react';
import { RandomRecipe } from '../types';
import { Youtube, Loader2, PlayCircle } from 'lucide-react';
import { generateDishImage, getRecipeVideo } from '../services/geminiService';

interface RecipeCardProps {
  recipe: RandomRecipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoadingImage(true);
      setLoadingVideo(true);

      // Fallback placeholder
      const placeholder = `https://placehold.co/600x400?text=${encodeURIComponent(recipe.strMeal)}`;
      
      try {
        // Fetch image and video in parallel
        const [aiImage, foundVideoUrl] = await Promise.all([
          generateDishImage(recipe.strMeal),
          getRecipeVideo(recipe.strMeal)
        ]);

        if (isMounted) {
          setImageUrl(aiImage || placeholder);
          setVideoUrl(foundVideoUrl);
        }
      } catch (e) {
        console.error("Error loading assets", e);
        if (isMounted) setImageUrl(placeholder);
      } finally {
        if (isMounted) {
          setLoadingImage(false);
          setLoadingVideo(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [recipe.strMeal]);

  // Helper to extract YouTube ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = videoUrl ? getYoutubeId(videoUrl) : null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 animate-slideUp">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Image and Title for Mobile */}
        <div className="space-y-6">
           <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {loadingImage ? (
              <div className="w-full aspect-square md:aspect-video lg:aspect-square bg-gray-100 flex flex-col items-center justify-center text-gray-400 animate-pulse">
                <Loader2 size={48} className="mb-2 animate-spin" />
                <span className="text-sm font-medium">Cooking up the image...</span>
              </div>
            ) : (
              <img
                src={imageUrl || "https://placehold.co/600x400"}
                alt={recipe.strMeal}
                className="w-full h-full object-cover"
              />
            )}
           </div>
           
           {/* Metadata visible on mobile/desktop */}
           <div className="space-y-2">
             <h2 className="text-3xl font-bold text-gray-800">{recipe.strMeal}</h2>
             <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
                <p><span className="font-bold text-gray-900">Category:</span> {recipe.strCategory}</p>
                <p><span className="font-bold text-gray-900">Area:</span> {recipe.strArea}</p>
             </div>
             {recipe.strTags && (
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">Tags:</span> {recipe.strTags}
                </p>
             )}
           </div>
        </div>

        {/* Right Column: Ingredients and Details */}
        <div className="space-y-8">
          
          {/* Ingredients */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Ingredients</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
              {recipe.ingredients.map((item, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-gray-700 border-b border-dashed border-gray-200 pb-1 last:border-0">
                  <span className="font-medium">{item.ingredient}</span>
                  <span className="text-gray-500 text-sm">{item.measure}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Instructions below - Increased margin top for better separation */}
      <div className="mt-24 space-y-12">
        <div className="prose prose-orange max-w-none">
          <h3 className="text-3xl font-bold text-gray-800 mb-8">Instructions</h3>
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 text-gray-700 leading-loose whitespace-pre-wrap text-lg">
            {recipe.strInstructions}
          </div>
        </div>

        {/* Video Section */}
        <div className="pt-8 pb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Video Recipe</h3>
          
          <div className="w-full max-w-4xl mx-auto">
            {loadingVideo ? (
               <div className="aspect-video bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 animate-pulse">
                  <Loader2 size={48} className="mb-2 animate-spin" />
                  <span className="text-sm font-medium">Finding the best video tutorial...</span>
               </div>
            ) : videoId ? (
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg bg-black">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 mb-4">We couldn't embed the video directly, but you can still watch it on YouTube.</p>
                <a 
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.youtubeQuery || recipe.strMeal + ' recipe')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg font-bold text-lg"
                >
                  <Youtube size={28} />
                  Watch on YouTube
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;