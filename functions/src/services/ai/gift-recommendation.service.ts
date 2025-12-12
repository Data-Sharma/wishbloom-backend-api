import {EventsService} from "../events.service";
import {WishlistService} from "../storage/wishlist.service";
import {InvitationsService} from "../invitations.service";
import {GeminiService} from "./gemini.service";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

interface GiftRecommendationInput {
  maxItems?: number;
  budgetMin?: number;
  budgetMax?: number;
  categories?: string[];
}

export class GiftRecommendationService {
  static async getHostRecommendations(eventId: string, input: GiftRecommendationInput) {
    const [event, wishlist] = await Promise.all([
      EventsService.getEventById(eventId),
      WishlistService.getWishlistByEvent(eventId),
    ]);

    if (!event) {
      throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
    }

    const items = (wishlist?.items || []) as any[];

    const summaries = items.map((item) => ({
      id: item.id,
      name: item.item_name,
      price: item.price,
      status: item.status,
      target_amount: item.target_amount,
      collected_amount: item.collected_amount,
    }));

    const maxItems = input.maxItems || 10;

    const prompt = `You are an AI gift recommendation assistant for an Indian gifting platform called WishBloom.

Event context:
- Title: ${event.title}
- Type: ${event.eventType || "unknown"}
- Date: ${event.eventDate || "unknown"}
- Location: ${event.location || "unknown"}
- Approximate budget (host perspective): ${event.budget ?? "not specified"}

Existing wishlist items (JSON array):
${JSON.stringify(summaries, null, 2)}

User preferences (for new recommendations):
- Max items: ${maxItems}
- Budget min: ${input.budgetMin ?? "not specified"}
- Budget max: ${input.budgetMax ?? "not specified"}
- Preferred categories: ${(input.categories || []).join(", ") || "any"}

TASK:
Suggest up to ${maxItems} gift ideas for this event.
Combine two kinds of recommendations where appropriate:
1) Highlight suitable EXISTING wishlist items that are not fully funded or purchased.
2) Propose NEW gift ideas that would fit the host and event.

For each recommendation, return an object with the following shape:
{
  "name": string,               // short gift name
  "source": "existing" | "new", // whether this maps to an existing wishlist item or a new idea
  "existingItemId": string | null, // id of existing wishlist item if source=="existing", otherwise null
  "priceHint": number | null,  // suggested price or typical price
  "reason": string,            // why this is a good fit for this host/event
  "category": string | null,   // e.g. home, kitchen, fashion, electronics
  "affiliateHint": string | null // optional short hint for which ecommerce sites/brands to consider
}

Return a JSON object with exactly one key: "recommendations", whose value is an array of such objects.
Do NOT include any other top-level keys or commentary, only valid JSON.`;

    const aiResult = await GeminiService.generateJsonFromPrompt(prompt);

    return {
      eventId,
      context: {
        title: event.title,
        eventType: event.eventType,
        budget: event.budget,
      },
      recommendations: aiResult?.recommendations || [],
    };
  }

  static async getGuestRecommendations(invitationId: string, input: GiftRecommendationInput) {
    const invitation = await InvitationsService.getInvitationById(invitationId);
    if (!invitation) {
      throw new AppError("Invitation not found", HTTP_STATUS.NOT_FOUND);
    }

    const eventId = invitation.eventId;

    const base = await this.getHostRecommendations(eventId, input);

    return {
      invitationId,
      eventId,
      guest: {
        name: invitation.guestName || null,
        email: invitation.guestEmail || null,
      },
      context: base.context,
      recommendations: base.recommendations,
    };
  }
}
