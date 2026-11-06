/**
 * Centralized Business Configuration for The Sprouts Spot
 * All components, footers, headers, checkout defaults, and contact links
 * reference this single source of truth.
 */

export const BUSINESS_INFO = {
  name: "The Sprouts Spot",
  tagline: "Eat Healthy, Live Happy",
  city: "Nimbahera",
  district: "Chittorgarh",
  state: "Rajasthan",
  country: "India",
  kitchenAddress: "Maheshwari Mohalla, Near Lakhara Gali, Nimbahera, Rajasthan, India.",
  cookPhone: "+91 7878794401",
  supportContactName: "Nilam Sharma",
  supportPhone: "+91 7878794401",
  whatsappNumber: "917878794401",
  rawPhone: "7878794401",
  serviceableLocalities: [
    "Maheshwari Mohalla",
    "Near Lakhara Gali",
    "Station Road",
    "Mandi Road",
    "Jawahar Nagar",
    "Adarsh Nagar",
    "Kailash Nagar",
    "Bus Stand Area",
  ],
  googleMapsUrl:
    "https://maps.google.com/?q=Maheshwari+Mohalla,+Near+Lakhara+Gali,+Nimbahera,+Rajasthan",
} as const;

