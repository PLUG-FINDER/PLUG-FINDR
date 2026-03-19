# AI Assistant System Integration

## Overview
Your AI chatbox now operates under strict data-driven guidelines. The system enforces that all platform-related responses must be backed by verified database queries.

## Files Created

### 1. **`src/utils/aiPrompt.ts`**
Contains the system prompt that enforces data-driven responses. Includes helper functions:
- `PLATFORM_AI_SYSTEM_PROMPT` - The main system prompt
- `requiresDatabaseVerification()` - Determines if a query needs database lookup
- `NO_DATA_RESPONSE` - Standard response when data is unavailable
- `isResponseCompliant()` - Validates response meets standards

### 2. **`src/utils/aiDatabaseHelpers.ts`**
Database query utilities for the AI to retrieve verified data:
- `getTotalUserCount()` - Total users in system
- `getTotalVendorCount()` - Total vendors
- `getTotalProductCount()` - Total products
- `getTotalReviewCount()` - Total reviews
- `getTotalFeedbackCount()` - Total feedback entries
- `getTotalComplaintCount()` - Total complaints
- `getAverageProductRating()` - Average rating across all products
- `getActiveVendorCount()` - Vendors with active products
- `getSystemStatistics()` - Comprehensive system stats
- `getTopRatedProducts(limit)` - Top rated products

### 3. **Updated `src/controllers/aiController.ts`**
Now uses `PLATFORM_AI_SYSTEM_PROMPT` instead of generic prompt.

## Usage Examples

### Example 1: User asks "How many vendors are on the platform?"

**Current Flow:**
1. User sends message
2. System prompts AI with strict guidelines
3. AI recognizes need for database verification
4. *[Future Enhancement]* AI would call `getTotalVendorCount()`
5. AI responds with verified data from database

### Example 2: User asks for general information
AI will maintain professional tone and refer only to platform data or respond with the standard "I'm sorry, I don't have any information on that within our records."

## Future Enhancements

### 1. Function Calling Integration
Extend the Groq API integration to allow AI to call database helper functions:
```typescript
// In aiController.ts
const tools = [
  {
    name: "get_system_statistics",
    description: "Get system statistics",
    function: getSystemStatistics
  },
  // ... more tools
];
```

### 2. Query Analysis Layer
Add middleware to analyze queries and pre-fetch necessary data before sending to AI:
```typescript
// Check if query requires verification
if (requiresDatabaseVerification(userMessage)) {
  const stats = await getSystemStatistics();
  // Include stats in context
}
```

### 3. Response Validation
Add post-generation validation to ensure responses meet compliance:
```typescript
if (!isResponseCompliant(aiResponse, hasVerifiedData)) {
  return NO_DATA_RESPONSE;
}
```

## Key Principles

✅ **DO**
- Query database before providing numerical data
- Reference data sources ("according to our records")
- Use exact values from database results
- Maintain professional, authoritative tone
- Acknowledge data limitations transparently

❌ **DON'T**
- Estimate or guess numbers
- Use general AI knowledge about platform data
- Provide unverified information
- Use hedge words like "probably," "approximately," "I think"
- Answer questions outside the platform's data scope

## Testing the Implementation

1. **Test Basic Response**
   - Send: "What can you help me with?"
   - Expect: Prompt will guide AI to only answer platform-related questions

2. **Test Data Query** *(after function calling is implemented)*
   - Send: "How many products are listed?"
   - Expect: "There are [X] products according to our records"

3. **Test Unverifiable Query**
   - Send: "What's the weather?"
   - Expect: "I'm sorry, I don't have any information on that within our records."

## Environment Variables

Ensure your `.env` file includes:
```
GROQ_API_KEY=your_api_key
GROQ_MODEL=llama-3.1-8b-instant
```

## Notes

- The system prompt is comprehensive and includes clear guidelines
- Database helpers are ready for integration with AI function calling
- Currently, the system uses Groq LLaMA model which may not support function calling out of the box
- Consider upgrading to models that support tool use (e.g., GPT-4, Claude) for full function calling capability
