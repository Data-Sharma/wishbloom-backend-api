import {GoogleGenerativeAI} from "@google/generative-ai";
import {config} from "../../config/env.config";
import {logger} from "../../utils/logger.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

/**
 * Initialize Gemini AI
 */
const genAI = new GoogleGenerativeAI(config.geminiApiKey || "");
const model = genAI.getGenerativeModel({model: "gemini-pro"});

export interface EventThemeRequest {
  eventType: string;
  preferences?: string;
  budget?: string;
}

export interface InvitationCaptionRequest {
  eventType: string;
  eventTitle: string;
  eventDate: string;
  tone?: "formal" | "casual" | "fun";
}

export interface VendorSuggestionRequest {
  eventType: string;
  location: string;
  budget?: number;
  services: string[];
}

/**
 * Gemini AI Service - AI-powered features
 */
export class GeminiService {
  /**
   * Generate event theme suggestions
   */
  static async generateEventTheme(request: EventThemeRequest): Promise<any> {
    try {
      const prompt = `
Generate a creative event theme for a ${request.eventType} event.
${request.preferences ? `User preferences: ${request.preferences}` : ""}
${request.budget ? `Budget level: ${request.budget}` : ""}

Please provide:
1. Theme name
2. Color palette (3-5 colors with hex codes)
3. Decoration ideas (5 items)
4. Atmosphere description

Format the response as JSON with these exact keys: themeName, colorPalette (array of objects with name and hex), decorations (array), atmosphere.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new AppError("Failed to parse AI response", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      const themeData = JSON.parse(jsonMatch[0]);
      logger.info("Event theme generated", {eventType: request.eventType});

      return themeData;
    } catch (error) {
      logger.error("Error generating event theme", error);
      throw new AppError("Failed to generate event theme", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Generate invitation caption
   */
  static async generateInvitationCaption(request: InvitationCaptionRequest): Promise<string> {
    try {
      const tone = request.tone || "casual";
      const prompt = `
Write a ${tone} invitation caption for a ${request.eventType} event.
Event title: ${request.eventTitle}
Event date: ${request.eventDate}

Requirements:
- Tone: ${tone}
- Length: 2-3 sentences
- Include a call-to-action
- Make it engaging and memorable

Return only the caption text, no additional formatting.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const caption = response.text().trim();

      logger.info("Invitation caption generated", {eventType: request.eventType});
      return caption;
    } catch (error) {
      logger.error("Error generating invitation caption", error);
      throw new AppError("Failed to generate caption", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Suggest vendors for event
   */
  static async suggestVendors(request: VendorSuggestionRequest): Promise<any> {
    try {
      const prompt = `
Suggest vendors for a ${request.eventType} event in ${request.location}.
${request.budget ? `Budget: $${request.budget}` : ""}
Services needed: ${request.services.join(", ")}

For each service, provide:
1. Vendor category name
2. 3 tips for choosing a vendor
3. Estimated cost range
4. Questions to ask vendors

Format as JSON array with objects containing: category, tips (array), costRange, questions (array).
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new AppError("Failed to parse AI response", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      const vendors = JSON.parse(jsonMatch[0]);
      logger.info("Vendor suggestions generated", {location: request.location});

      return vendors;
    } catch (error) {
      logger.error("Error suggesting vendors", error);
      throw new AppError("Failed to suggest vendors", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Generate memory caption for event photos
   */
  static async generateMemoryCaption(
    eventType: string,
    description: string
  ): Promise<string> {
    try {
      const prompt = `
Write a heartfelt caption for a photo memory from a ${eventType} event.
Photo context: ${description}

Requirements:
- Emotional and memorable
- 1-2 sentences
- Captures the essence of the moment

Return only the caption text.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const caption = response.text().trim();

      logger.info("Memory caption generated", {eventType});
      return caption;
    } catch (error) {
      logger.error("Error generating memory caption", error);
      throw new AppError("Failed to generate memory caption", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Generate event planning checklist
   */
  static async generateEventChecklist(
    eventType: string,
    eventDate: string,
    guestCount = 0
  ): Promise<any> {
    try {
      const prompt = `
Create a comprehensive planning checklist for a ${eventType} event.
Event date: ${eventDate}
Guest count: ${guestCount}

Organize tasks by timeline:
1. 3 months before
2. 2 months before
3. 1 month before
4. 2 weeks before
5. 1 week before
6. Day before
7. Day of event

For each timeline, provide 3-5 specific tasks.

Format as JSON object with timeline keys and task arrays as values.
Example: {"3_months_before": ["Task 1", "Task 2"], ...}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new AppError("Failed to parse AI response", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      const checklist = JSON.parse(jsonMatch[0]);
      logger.info("Event checklist generated", {eventType});

      return checklist;
    } catch (error) {
      logger.error("Error generating event checklist", error);
      throw new AppError("Failed to generate checklist", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
