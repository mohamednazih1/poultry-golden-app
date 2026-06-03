export interface DailyGuideline {
  day: number;
  stageName: 'مرحلة ما قبل البادي (Pre-starter)' | 'مرحلة البادي (Starter)' | 'مرحلة النامي (Grower)' | 'مرحلة الناهي (Finisher)' | 'مرحلة التسمين العملاق (Super-fattening)';
  feedType: string;
  temperature: number; // in Celsius
  ventilationSpeed: string;
  lightingHours: number;
  targetWeight: number; // in grams
  dailyFeedPerBird: number; // in grams
  fcrMetric: number; // Feed Conversion Ratio standard
  instructions: string[];
}

export interface BatchLog {
  id: string;
  date: string;
  dayOfLife: number;
  birdCount: number;
  mortality: number;
  feedConsumedKg: number;
  avgWeightGrams: number;
  tempCelsius: number;
  notes?: string;
}

export interface DiseaseInfo {
  id: string;
  name: string;
  scientificName: string;
  type: 'فيروسي' | 'بكتيري' | 'طفيلي' | 'غذائي/بيئي';
  symptoms: string[];
  spreadFactors: string[];
  treatment: string[];
  vaccinePrevention: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface VaccineScheduleItem {
  ageRange: string;
  vaccineName: string;
  method: string;
  targetDisease: string;
  importance: 'إجباري' | 'اختياري' | 'هام جداً';
}
