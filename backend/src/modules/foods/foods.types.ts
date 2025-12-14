export type Food = {
  id: number;
  name: string;
  brand: string | null;

  caloriesPer100g: number;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;

  servingSizeG: number;
  servingLabel: string;

  imagePrimaryUri?: string | null;
  isVerified?: boolean;
};
