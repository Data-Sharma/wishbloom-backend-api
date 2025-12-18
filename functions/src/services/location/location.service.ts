import {logger} from "../../utils/logger.util";
import {config} from "../../config/env.config";
import {AppError, createBadRequestError, createInternalError} from "../../utils/error.util";

export interface LocationData {
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId: string;
  mapsUrl: string;
}

export interface GooglePlacesDetailsResponse {
  result: {
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
  };
  status: string;
  error_message?: string;
}

/**
 * Location service for resolving Google Place IDs to normalized location data
 */
export class LocationService {
  /**
   * Resolve a Google Place ID to normalized location data
   */
  static async resolvePlaceId(placeId: string): Promise<LocationData> {
    try {
      // Validate input
      if (!placeId || typeof placeId !== "string" || placeId.trim().length === 0) {
        throw createBadRequestError("Valid placeId is required");
      }

      // Get Google Maps API key from config
      const apiKey = config.googleMapsApiKey;
      if (!apiKey) {
        logger.error("Google Maps API key not configured");
        throw createInternalError("Google Maps service not available");
      }

      // Call Google Places Details API
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,formatted_address,geometry,place_id&key=${apiKey}`;
      
      logger.info("Resolving place ID", { placeId });

      const response = await fetch(url);
      const data: GooglePlacesDetailsResponse = await response.json();

      if (!response.ok) {
        logger.error("Google Places API request failed", { 
          placeId, 
          status: response.status, 
          statusText: response.statusText 
        });
        throw createInternalError("Failed to resolve location");
      }

      // Check API response status
      if (data.status !== "OK") {
        logger.error("Google Places API returned error", { 
          placeId, 
          status: data.status, 
          errorMessage: data.error_message 
        });
        
        switch (data.status) {
          case "INVALID_REQUEST":
            throw createBadRequestError("Invalid placeId provided");
          case "NOT_FOUND":
            throw createBadRequestError("Place not found");
          case "OVER_DAILY_LIMIT":
          case "OVER_QUOTA_LIMIT":
            throw createInternalError("Location service temporarily unavailable");
          case "REQUEST_DENIED":
            logger.error("Google Places API access denied", { errorMessage: data.error_message });
            throw createInternalError("Location service configuration error");
          default:
            throw createInternalError("Failed to resolve location");
        }
      }

      // Validate response data structure
      const result = data.result;
      if (!result || !result.name || !result.formatted_address || !result.geometry || !result.geometry.location || !result.place_id) {
        logger.error("Invalid Google Places API response structure", { placeId, result });
        throw createInternalError("Invalid location data received");
      }

      // Create normalized location data
      const locationData: LocationData = {
        name: result.name,
        formattedAddress: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        placeId: result.place_id,
        mapsUrl: `https://maps.google.com/?q=${result.geometry.location.lat},${result.geometry.location.lng}`
      };

      logger.info("Successfully resolved place ID", { 
        placeId, 
        name: locationData.name,
        address: locationData.formattedAddress 
      });

      return locationData;

    } catch (error) {
      // If it's already an AppError, just re-throw it
      if (error instanceof AppError) {
        throw error;
      }

      // Log unexpected errors and throw internal error
      logger.error("Unexpected error in resolvePlaceId", { placeId, error });
      throw createInternalError("Failed to resolve location");
    }
  }
}
