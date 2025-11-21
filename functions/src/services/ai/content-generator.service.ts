import {GeminiService} from "./gemini.service";

export class ContentGeneratorService {
  static async generateInvitationCaption(payload: any): Promise<{ caption: string }> {
    const caption = await GeminiService.generateInvitationCaption(payload);
    return {caption};
  }

  static async generateMemoryCaption(eventType: string, description: string): Promise<{ caption: string }> {
    const caption = await GeminiService.generateMemoryCaption(eventType, description);
    return {caption};
  }

  static async suggestVendors(payload: any): Promise<any> {
    return GeminiService.suggestVendors(payload);
  }
}
