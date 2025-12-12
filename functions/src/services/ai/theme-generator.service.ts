import {GeminiService} from "./gemini.service";

export interface ThemeRequest {
  eventType: string;
  season?: string;
  palettePreferences?: string[];
  mood?: string;
}

export class ThemeGeneratorService {
  static async generateDesign(styleOptions: Record<string, any>): Promise<any> {
    // Minimal implementation: wrap provided style options into a basic theme object.
    return {
      theme: "custom",
      styleOptions,
    };
  }

  static async generateThemeSuggestions(payload: ThemeRequest): Promise<any> {
    return GeminiService.generateEventTheme(payload);
  }

  static async generateChecklist(eventType: string, eventDate: string, guestCount?: number): Promise<any> {
    return GeminiService.generateEventChecklist(eventType, eventDate, guestCount);
  }
}
