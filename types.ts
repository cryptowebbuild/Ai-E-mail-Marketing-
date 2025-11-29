export enum AppView {
  CAMPAIGN = 'CAMPAIGN',
  CHAT = 'CHAT',
}

export type ImageSize = '1K' | '2K' | '4K';

export interface CampaignData {
  subjectLines: string[];
  bodyCopy: string;
  imagePrompt: string;
}

export interface GeneratedImage {
  url: string;
  size: ImageSize;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
