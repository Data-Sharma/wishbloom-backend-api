import {AnalyticsService} from "../../src/services/analytics.service";
import {FirestoreService} from "../../src/services/database/firestore.service";

jest.mock("../../src/services/database/firestore.service");

const mockFirestoreService = FirestoreService as jest.Mocked<typeof FirestoreService>;

describe("Analytics Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getEventEngagementMetrics", () => {
    it("calculates complete engagement metrics", async () => {
      const eventId = "event123";
      
      const mockEvent = {
        id: eventId,
        eventDate: "2026-01-15T00:00:00Z",
        createdAt: "2025-10-15T00:00:00Z"
      };

      const mockGuests = [
        {id: "guest1", rsvpStatus: "accepted", updatedAt: "2025-12-10T00:00:00Z"},
        {id: "guest2", rsvpStatus: "declined", updatedAt: "2025-12-11T00:00:00Z"},
        {id: "guest3", rsvpStatus: "pending", createdAt: "2025-12-01T00:00:00Z"},
        {id: "guest4", rsvpStatus: "accepted", updatedAt: "2025-12-12T00:00:00Z"}
      ];

      const mockMemories = [
        {id: "mem1", type: "photo", createdBy: "guest1", createdAt: "2025-12-05T00:00:00Z"},
        {id: "mem2", type: "video", createdBy: "guest2", createdAt: "2025-12-06T00:00:00Z"},
        {id: "mem3", type: "note", createdBy: "guest1", createdAt: "2025-12-07T00:00:00Z"},
        {id: "mem4", type: "photo", createdBy: "guest3", createdAt: "2025-12-08T00:00:00Z"}
      ];

      const mockGifts = [
        {id: "gift1", status: "purchased", price: 50, purchasedBy: "guest1", createdAt: "2025-12-01T00:00:00Z"},
        {id: "gift2", status: "available", price: 75, createdAt: "2025-12-02T00:00:00Z"},
        {id: "gift3", status: "purchased", price: 100, purchasedBy: "guest2", updatedAt: "2025-12-10T00:00:00Z"},
        {id: "gift4", status: "available", price: 25, createdAt: "2025-12-03T00:00:00Z"}
      ];

      mockFirestoreService.getDocument.mockResolvedValue(mockEvent);
      mockFirestoreService.getSubcollection
        .mockResolvedValueOnce(mockGuests)
        .mockResolvedValueOnce(mockMemories)
        .mockResolvedValueOnce(mockGifts);

      const result = await AnalyticsService.getEventEngagementMetrics(eventId);

      expect(mockFirestoreService.getDocument).toHaveBeenCalledWith("events", eventId);
      expect(mockFirestoreService.getSubcollection).toHaveBeenCalledTimes(3);
      expect(mockFirestoreService.getSubcollection).toHaveBeenCalledWith("events", eventId, "guests");
      expect(mockFirestoreService.getSubcollection).toHaveBeenCalledWith("events", eventId, "memories");
      expect(mockFirestoreService.getSubcollection).toHaveBeenCalledWith("events", eventId, "gifts");

      expect(result).toEqual({
        eventId,
        totalGuests: 4,
        rsvpData: {
          totalInvited: 4,
          accepted: 2,
          declined: 1,
          pending: 1,
          responseRate: 75
        },
        memoryData: {
          totalMemories: 4,
          photoCount: 2,
          videoCount: 1,
          noteCount: 1,
          uniqueContributors: 3
        },
        giftData: {
          totalGifts: 4,
          purchasedGifts: 2,
          totalValue: 150,
          averageValue: 75
        },
        activityData: expect.objectContaining({
          activeGuests: expect.any(Number),
          activityScore: expect.any(Number)
        }),
        timeData: {
          daysUntilEvent: expect.any(Number),
          daysSinceCreation: expect.any(Number),
          eventDate: "2026-01-15T00:00:00Z"
        },
        overallEngagementScore: expect.any(Number)
      });
    });

    it("handles empty data gracefully", async () => {
      const eventId = "empty-event";
      
      const mockEvent = {
        id: eventId,
        eventDate: null,
        createdAt: "2025-12-01T00:00:00Z"
      };

      mockFirestoreService.getDocument.mockResolvedValue(mockEvent);
      mockFirestoreService.getSubcollection
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await AnalyticsService.getEventEngagementMetrics(eventId);

      expect(result).toEqual({
        eventId,
        totalGuests: 0,
        rsvpData: {
          totalInvited: 0,
          accepted: 0,
          declined: 0,
          pending: 0,
          responseRate: 0
        },
        memoryData: {
          totalMemories: 0,
          photoCount: 0,
          videoCount: 0,
          noteCount: 0,
          uniqueContributors: 0
        },
        giftData: {
          totalGifts: 0,
          purchasedGifts: 0,
          totalValue: 0,
          averageValue: 0
        },
        activityData: {
          lastActivity: null,
          activeGuests: 0,
          activityScore: 0
        },
        timeData: {
          daysUntilEvent: null,
          daysSinceCreation: expect.any(Number),
          eventDate: null
        },
        overallEngagementScore: 0
      });
    });

    it("throws error when service fails", async () => {
      const eventId = "error-event";
      
      mockFirestoreService.getDocument.mockRejectedValue(new Error("Firestore error"));

      await expect(AnalyticsService.getEventEngagementMetrics(eventId)).rejects.toThrow("Firestore error");
    });
  });

  describe("getEngagementTrends", () => {
    it("returns trends data with default period", async () => {
      const eventId = "event123";
      
      const mockMetrics = {
        eventId,
        overallEngagementScore: 75,
        totalGuests: 50
      };

      jest.spyOn(AnalyticsService, 'getEventEngagementMetrics').mockResolvedValue(mockMetrics as any);

      const result = await AnalyticsService.getEngagementTrends(eventId);

      expect(AnalyticsService.getEventEngagementMetrics).toHaveBeenCalledWith(eventId);
      expect(result).toEqual({
        eventId,
        period: "30 days",
        current: mockMetrics,
        trend: "stable"
      });
    });

    it("returns trends data with custom period", async () => {
      const eventId = "event123";
      const days = 60;
      
      const mockMetrics = {
        eventId,
        overallEngagementScore: 80,
        totalGuests: 50
      };

      jest.spyOn(AnalyticsService, 'getEventEngagementMetrics').mockResolvedValue(mockMetrics as any);

      const result = await AnalyticsService.getEngagementTrends(eventId, days);

      expect(AnalyticsService.getEventEngagementMetrics).toHaveBeenCalledWith(eventId);
      expect(result).toEqual({
        eventId,
        period: "60 days",
        current: mockMetrics,
        trend: "stable"
      });
    });

    it("throws error when service fails", async () => {
      const eventId = "error-event";
      
      jest.spyOn(AnalyticsService, 'getEventEngagementMetrics').mockRejectedValue(new Error("Service error"));

      await expect(AnalyticsService.getEngagementTrends(eventId)).rejects.toThrow("Service error");
    });
  });
});
