export const APPS_SCRIPT_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwwcMYCD-cpOGiRS3kzaBJYgKztEgIsgDi0nTRAaNNQMEPr7EJ3Ri6_C8aCd6I_HbZNPg/exec';

export type Q5Choice = 'Yes' | 'Partly' | 'No' | '';

export interface FeedbackFormValues {
  q1: string; // '1' | '2' | '3' | '4' | '5' | ''
  q2: string;
  q3: string; // '0' .. '10' | ''
  q4: string;
  q5: Q5Choice;
  q6: string;
  q7: string; // '1' | '2' | '3' | '4' | '5' | ''
  q8Selected: string[];
  q8Other: string;
  q9: string;
  q10Selection: string;
  q10Other: string;
  q11: string;
  q12: string;
}

export type ValidationErrors = Partial<Record<keyof FeedbackFormValues | 'q10', string>>;

export interface SubmissionPayload {
  requestToken: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  q11: string;
  q12: string;
}

export interface AppsScriptResponse {
  success: boolean;
  message: string;
  requestToken: string;
}

export const INITIAL_FORM_VALUES: FeedbackFormValues = {
  q1: '',
  q2: '',
  q3: '',
  q4: '',
  q5: '',
  q6: '',
  q7: '',
  q8Selected: [],
  q8Other: '',
  q9: '',
  q10Selection: '',
  q10Other: '',
  q11: '',
  q12: '',
};

export const Q1_LABELS: Record<string, string> = {
  '1': 'Very dissatisfied',
  '2': 'Dissatisfied',
  '3': 'Neutral',
  '4': 'Satisfied',
  '5': 'Very satisfied',
};

export const Q7_LABELS: Record<string, string> = {
  '1': 'Very poor value',
  '2': 'Poor value',
  '3': 'Fair value',
  '4': 'Good value',
  '5': 'Excellent value',
};

export const OTHER_PLATFORMS: string[] = [
  'Amazon',
  'Walmart',
  'Etsy',
  'Target',
  'Poshmark',
  'Mercari',
  'Facebook Marketplace',
  'AliExpress',
  'Local / Independent Retailers',
  'None — I primarily use eBay',
];

export const PRIORITY_AREAS: string[] = [
  'Search accuracy & product discovery',
  'Shipping speed, packaging & tracking',
  'Pricing, buyer/seller fees & checkout transparency',
  'Item condition accuracy & seller trustworthiness',
  'Buyer protection, returns & refund speed',
  'Customer service & dispute resolution',
  'Other',
];
