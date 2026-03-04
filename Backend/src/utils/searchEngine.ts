import { IVendorProfile } from "../models/VendorProfile";

/**
 * AI-assisted search using keyword matching and rule-based logic
 * Processes natural language queries and converts them to structured search filters
 */

// Common service/category keywords mapping
const SERVICE_KEYWORDS: Record<string, string[]> = {
  laptop: ["laptop", "computer", "pc", "macbook"],
  repair: ["repair", "fix", "service", "maintenance"],
  food: ["food", "restaurant", "catering", "meal", "cook"],
  phone: ["phone", "mobile", "smartphone", "iphone", "android"],
  clothing: ["clothing", "clothes", "fashion", "apparel", "wear"],
  electronics: ["electronics", "gadget", "device"],
  books: ["book", "textbook", "novel"],
  printing: ["print", "printing", "photocopy", "scan"],
  delivery: ["delivery", "deliver", "courier"],
  wholesale: ["wholesale", "bulk", "wholesaler"],
};

// Location keywords for KNUST area
const LOCATION_KEYWORDS: Record<string, string[]> = {
  commercial: ["commercial", "commercial area", "commercial zone"],
  ayeduase: ["ayeduase", "ayedu"],
  kotei: ["kotei"],
  gaza: ["gaza"],
  bomso: ["bomso"],
  kejetia: ["kejetia", "kejet"],
  adum: ["adum"],
  campus: ["campus", "knust"],
};

// Quality/trust keywords
const QUALITY_KEYWORDS = ["reliable", "trusted", "verified", "good", "best", "quality"];

// Time-related keywords
const TIME_KEYWORDS = ["weekend", "weekends", "saturday", "sunday", "24/7", "24 hours"];

interface ParsedQuery {
  serviceKeywords: string[];
  locationKeywords: string[];
  qualityKeywords: string[];
  timeKeywords: string[];
  rawKeywords: string[];
}

/**
 * Extract keywords from query using rule-based logic
 */
export function parseQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase().trim();
  const words = lowerQuery.split(/\s+/);
  
  const serviceKeywords: string[] = [];
  const locationKeywords: string[] = [];
  const qualityKeywords: string[] = [];
  const timeKeywords: string[] = [];
  const rawKeywords: string[] = [];

  // Extract service keywords
  for (const [category, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        serviceKeywords.push(category);
        rawKeywords.push(keyword);
        break;
      }
    }
  }

  // Extract location keywords
  for (const [location, keywords] of Object.entries(LOCATION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        locationKeywords.push(location);
        rawKeywords.push(keyword);
        break;
      }
    }
  }

  // Extract quality keywords
  for (const keyword of QUALITY_KEYWORDS) {
    if (lowerQuery.includes(keyword)) {
      qualityKeywords.push(keyword);
      rawKeywords.push(keyword);
    }
  }

  // Extract time keywords
  for (const keyword of TIME_KEYWORDS) {
    if (lowerQuery.includes(keyword)) {
      timeKeywords.push(keyword);
      rawKeywords.push(keyword);
    }
  }

  // Add remaining significant words as raw keywords (ignore common stop words)
  const stopWords = new Set([
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "should",
    "could", "may", "might", "must", "can", "find", "me", "my", "i", "who",
    "works", "on", "in", "at", "to", "for", "of", "with", "by", "from"
  ]);

  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, "");
    if (cleanWord.length > 2 && !stopWords.has(cleanWord) && !rawKeywords.includes(cleanWord)) {
      rawKeywords.push(cleanWord);
    }
  }

  return {
    serviceKeywords,
    locationKeywords,
    qualityKeywords,
    timeKeywords,
    rawKeywords
  };
}

/**
 * Build MongoDB filter based on parsed query
 * Uses flexible matching: vendors matching any relevant keywords will be returned
 */
export function buildSearchFilter(parsedQuery: ParsedQuery, categoryFilter?: string): any {
  const filter: any = {
    approved: true,
    isFrozen: { $ne: true } // Exclude frozen vendors
  };

  const $orConditions: any[] = [];

  // Category matching
  if (categoryFilter) {
    filter.category = { $regex: categoryFilter, $options: "i" };
  }

  // Service/Category matching
  if (parsedQuery.serviceKeywords.length > 0) {
    for (const service of parsedQuery.serviceKeywords) {
      $orConditions.push({ category: { $regex: service, $options: "i" } });
      $orConditions.push({ businessName: { $regex: service, $options: "i" } });
      $orConditions.push({ description: { $regex: service, $options: "i" } });
    }
  }

  // Location matching (hostelName and location fields)
  if (parsedQuery.locationKeywords.length > 0) {
    for (const location of parsedQuery.locationKeywords) {
      $orConditions.push({ location: { $regex: location, $options: "i" } });
      $orConditions.push({ hostelName: { $regex: location, $options: "i" } });
    }
  }

  // Raw keyword matching (business name, description, location, hostelName)
  // These are the extracted keywords that don't fall into specific categories
  if (parsedQuery.rawKeywords.length > 0) {
    for (const keyword of parsedQuery.rawKeywords) {
      $orConditions.push({ businessName: { $regex: keyword, $options: "i" } });
      $orConditions.push({ description: { $regex: keyword, $options: "i" } });
      $orConditions.push({ location: { $regex: keyword, $options: "i" } });
      $orConditions.push({ hostelName: { $regex: keyword, $options: "i" } });
    }
  }

  // If we have any $or conditions, apply them
  if ($orConditions.length > 0) {
    filter.$or = $orConditions;
  } else if ($orConditions.length === 0 && !filter.category && parsedQuery.rawKeywords.length === 0 && parsedQuery.serviceKeywords.length === 0 && parsedQuery.locationKeywords.length === 0) {
    // Fallback: if no keywords were extracted, do a basic text search on the original query
    // This handles edge cases where the query doesn't match any known patterns
    const fallbackQuery = parsedQuery.rawKeywords.length > 0 
      ? parsedQuery.rawKeywords.join("|")
      : "";
    
    if (fallbackQuery) {
      filter.$or = [
        { businessName: { $regex: fallbackQuery, $options: "i" } },
        { description: { $regex: fallbackQuery, $options: "i" } },
        { location: { $regex: fallbackQuery, $options: "i" } },
        { hostelName: { $regex: fallbackQuery, $options: "i" } }
      ];
    }
  }

  return filter;
}

/**
 * Calculate relevance score for a vendor based on query match
 */
export function calculateRelevanceScore(vendor: IVendorProfile, parsedQuery: ParsedQuery): number {
  let score = 0;
  const businessNameLower = (vendor.businessName || "").toLowerCase();
  const descriptionLower = (vendor.description || "").toLowerCase();
  const locationLower = (vendor.location || "").toLowerCase();
  const hostelNameLower = (vendor.hostelName || "").toLowerCase();
  const categoryLower = (vendor.category || "").toLowerCase();

  // Business name match (highest weight)
  for (const keyword of parsedQuery.rawKeywords) {
    if (businessNameLower.includes(keyword)) {
      score += 10;
    }
  }

  // Service keyword match in category or business name
  for (const service of parsedQuery.serviceKeywords) {
    if (categoryLower.includes(service) || businessNameLower.includes(service)) {
      score += 8;
    }
    if (descriptionLower.includes(service)) {
      score += 5;
    }
  }

  // Location match (hostelName gets highest priority)
  for (const location of parsedQuery.locationKeywords) {
    if (hostelNameLower.includes(location)) {
      score += 10; // Hostel name match gets highest priority
    }
    if (locationLower.includes(location)) {
      score += 7;
    }
  }

  // Description match
  for (const keyword of parsedQuery.rawKeywords) {
    if (descriptionLower.includes(keyword)) {
      score += 3;
    }
  }

  // Quality keywords boost (if vendor has good reviews, this could be enhanced)
  if (parsedQuery.qualityKeywords.length > 0) {
    // Could add rating-based boost here if reviews are available
    score += 2;
  }

  return score;
}

/**
 * Sort vendors by relevance score
 */
export function sortByRelevance(vendors: IVendorProfile[], parsedQuery: ParsedQuery): IVendorProfile[] {
  return vendors
    .map(vendor => ({
      vendor,
      score: calculateRelevanceScore(vendor, parsedQuery)
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.vendor);
}

