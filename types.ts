export interface Ingredient {
  ingredient: string;
  measure: string;
}

export interface RandomRecipe {
  id?: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strTags: string;
  ingredients: Ingredient[];
  youtubeQuery: string;
  strMealThumb?: string; // To be populated by image generation
}
