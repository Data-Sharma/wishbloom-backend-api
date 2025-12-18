import {FirestoreService} from "./database/firestore.service";
import {COLLECTIONS} from "../config/constants";
import {logger} from "../utils/logger.util";

export interface EngagementMetrics {
  eventId: string;
  totalGuests: number;
  rsvpData: {
    totalInvited: number;
    accepted: number;
    declined: number;
    pending: number;
    responseRate: number;
  };
  memoryData: {
    totalMemories: number;
    photoCount: number;
    videoCount: number;
    noteCount: number;
    uniqueContributors: number;
  };
  giftData: {
    totalGifts: number;
    purchasedGifts: number;
    totalValue: number;
    averageValue: number;
  };
  activityData: {
    lastActivity: string | null;
    activeGuests: number;
    activityScore: number;
  };
  timeData: {
    daysUntilEvent: number | null;
    daysSinceCreation: number;
    eventDate: string | null;
  };
  overallEngagementScore: number;
}

/**
 * Analytics service for calculating event engagement metrics
 */
export class AnalyticsService {
  /**
   * Get comprehensive engagement metrics for an event
   */
  static async getEventEngagementMetrics(eventId: string): Promise<EngagementMetrics> {
    try {
      // Get event data
      const event = await FirestoreService.getDocument(COLLECTIONS.EVENTS, eventId);
      
      // Get guests, memories, and gifts in parallel
      const [guests, memories, gifts] = await Promise.all([
        FirestoreService.getSubcollection(COLLECTIONS.EVENTS, eventId, COLLECTIONS.GUESTS),
        FirestoreService.getSubcollection(COLLECTIONS.EVENTS, eventId, COLLECTIONS.MEMORIES),
        FirestoreService.getSubcollection(COLLECTIONS.EVENTS, eventId, COLLECTIONS.GIFTS)
      ]);

      // Calculate metrics
      const rsvpData = this.calculateRSVPMetrics(guests);
      const memoryData = this.calculateMemoryMetrics(memories);
      const giftData = this.calculateGiftMetrics(gifts);
      const activityData = this.calculateActivityMetrics(guests, memories, gifts);
      const timeData = this.calculateTimeMetrics(event);
      const overallEngagementScore = this.calculateOverallEngagementScore({
        rsvpData,
        memoryData,
        giftData,
        activityData,
        totalGuests: guests.length
      });

      return {
        eventId,
        totalGuests: guests.length,
        rsvpData,
        memoryData,
        giftData,
        activityData,
        timeData,
        overallEngagementScore
      };
    } catch (error) {
      logger.error("Error calculating engagement metrics", {eventId, error});
      throw error;
    }
  }

  /**
   * Calculate RSVP metrics
   */
  private static calculateRSVPMetrics(guests: any[]) {
    const totalInvited = guests.length;
    const accepted = guests.filter(g => g.rsvpStatus === 'accepted').length;
    const declined = guests.filter(g => g.rsvpStatus === 'declined').length;
    const pending = guests.filter(g => g.rsvpStatus === 'pending' || !g.rsvpStatus).length;
    const responseRate = totalInvited > 0 ? ((accepted + declined) / totalInvited) * 100 : 0;

    return {
      totalInvited,
      accepted,
      declined,
      pending,
      responseRate: Math.round(responseRate * 100) / 100
    };
  }

  /**
   * Calculate memory metrics
   */
  private static calculateMemoryMetrics(memories: any[]) {
    const totalMemories = memories.length;
    const photoCount = memories.filter(m => m.type === 'photo').length;
    const videoCount = memories.filter(m => m.type === 'video').length;
    const noteCount = memories.filter(m => m.type === 'note').length;
    const uniqueContributors = new Set(memories.map(m => m.createdBy)).size;

    return {
      totalMemories,
      photoCount,
      videoCount,
      noteCount,
      uniqueContributors
    };
  }

  /**
   * Calculate gift metrics
   */
  private static calculateGiftMetrics(gifts: any[]) {
    const totalGifts = gifts.length;
    const purchasedGifts = gifts.filter(g => g.status === 'purchased').length;
    const totalValue = gifts
      .filter(g => g.status === 'purchased' && g.price)
      .reduce((sum, gift) => sum + (gift.price || 0), 0);
    const averageValue = purchasedGifts > 0 ? totalValue / purchasedGifts : 0;

    return {
      totalGifts,
      purchasedGifts,
      totalValue: Math.round(totalValue * 100) / 100,
      averageValue: Math.round(averageValue * 100) / 100
    };
  }

  /**
   * Calculate activity metrics
   */
  private static calculateActivityMetrics(guests: any[], memories: any[], gifts: any[]) {
    // Find last activity timestamp
    const allTimestamps = [
      ...guests.map(g => g.updatedAt || g.createdAt),
      ...memories.map(m => m.createdAt),
      ...gifts.map(g => g.updatedAt || g.createdAt)
    ].filter(Boolean);

    const lastActivity = allTimestamps.length > 0 
      ? new Date(Math.max(...allTimestamps.map(ts => new Date(ts).getTime()))).toISOString()
      : null;

    // Calculate active guests (guests who RSVP'd, added memories, or purchased gifts)
    const activeGuestIds = new Set([
      ...guests.filter(g => g.rsvpStatus && g.rsvpStatus !== 'pending').map(g => g.id),
      ...memories.map(m => m.createdBy),
      ...gifts.filter(g => g.purchasedBy).map(g => g.purchasedBy)
    ]);

    const activeGuests = activeGuestIds.size;
    const activityScore = guests.length > 0 ? (activeGuests / guests.length) * 100 : 0;

    return {
      lastActivity,
      activeGuests,
      activityScore: Math.round(activityScore * 100) / 100
    };
  }

  /**
   * Calculate time-based metrics
   */
  private static calculateTimeMetrics(event: any) {
    const now = new Date();
    const eventDate = event.eventDate ? new Date(event.eventDate) : null;
    const createdAt = event.createdAt ? new Date(event.createdAt) : now;

    const daysUntilEvent = eventDate ? Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const daysSinceCreation = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    return {
      daysUntilEvent,
      daysSinceCreation,
      eventDate: event.eventDate || null
    };
  }

  /**
   * Calculate overall engagement score (0-100)
   */
  private static calculateOverallEngagementScore(metrics: {
    rsvpData: any;
    memoryData: any;
    giftData: any;
    activityData: any;
    totalGuests: number;
  }): number {
    const weights = {
      rsvp: 30,      // RSVP response rate and acceptance
      memories: 25,  // Memory contributions
      gifts: 20,     // Gift purchases
      activity: 25   // Overall activity engagement
    };

    let score = 0;

    // RSVP score (30% weight)
    score += metrics.rsvpData.responseRate * (weights.rsvp / 100);

    // Memory score (25% weight) - based on memories per guest
    const memoryScore = metrics.totalGuests > 0 
      ? Math.min((metrics.memoryData.totalMemories / metrics.totalGuests) * 20, 100)
      : 0;
    score += memoryScore * (weights.memories / 100);

    // Gift score (20% weight) - based on gift purchase rate
    const giftScore = metrics.giftData.totalGifts > 0 
      ? (metrics.giftData.purchasedGifts / metrics.giftData.totalGifts) * 100
      : 0;
    score += giftScore * (weights.gifts / 100);

    // Activity score (25% weight)
    score += metrics.activityData.activityScore * (weights.activity / 100);

    return Math.round(Math.min(score, 100));
  }

  /**
   * Get engagement trends over time
   */
  static async getEngagementTrends(eventId: string, days: number = 30): Promise<any> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // This would require more complex queries to aggregate by date
      // For now, return basic trend data
      const metrics = await this.getEventEngagementMetrics(eventId);
      
      return {
        eventId,
        period: `${days} days`,
        current: metrics,
        // TODO: Implement historical data comparison
        trend: 'stable' // 'improving', 'declining', 'stable'
      };
    } catch (error) {
      logger.error("Error getting engagement trends", {eventId, error});
      throw error;
    }
  }
}
