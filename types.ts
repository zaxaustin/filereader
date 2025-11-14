
export interface UploadedFile {
  name: string;
  content: string;
}

export type AnalysisGoal = 'project-kickstart' | 'code-review' | 'meeting-summary' | 'general-organization';

export interface AnalysisSection {
  title: string;
  content: string[]; // Can be a paragraph (single-element array) or a list of items
}

export interface AnalysisResult {
  title: string;
  sections: AnalysisSection[];
  nextSteps: string[]; // Keep next steps separate for calendar generation
}


export interface CalendarEvent {
  title: string;
  description: string;
  date: string;
  time: string;
}
