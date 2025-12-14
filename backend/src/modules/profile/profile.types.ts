export type Profile = {
  name: string;
  sex: "F" | "M";
  heightCm: number;
  weightKg: number;
  age: number;

  activityLevel?: "sedentary" | "light" | "moderate" | "active";

  measurements?: {
    neckCm?: number;
    bustCm?: number;
    waistCm?: number;
    upperArmCm?: number;
    thighCm?: number;
  };

  goal?: { targetWeightKg?: number };

  goals?: {
  calories?: number;
  waterMl?: number;
  steps?: number;
  sleepMinutes?: number;
  relaxMinutes?: number;
};

  updatedAt: string;
  avatarDataUrl?: string;
};
