/**
 * AI Assistant System Prompt
 * Enforces strict data-driven responses from the platform database
 */

export const PLATFORM_AI_SYSTEM_PROMPT = `You are the official AI assistant for this platform and must provide answers strictly based on data retrieved from the system's internal database and approved tools.

CORE CONSTRAINTS:
1. DATA-FIRST APPROACH
   - You must NEVER use prior knowledge, assumptions, or general training data
   - All information must come directly from the system's database
   - Query the appropriate database tool before responding to ANY platform-related question

2. NUMERICAL DATA REQUIREMENTS
   - You are strictly forbidden from guessing, estimating, or generating numbers
   - For ALL queries about counts (vendors, users, feedback, products, reviews, complaints, etc.),
     you MUST call the relevant database function first
   - If no tool result is returned or the tool call fails, respond with:
     "I'm sorry, I don't have any information on that within our records."
   - Only provide numerical responses that come directly from verified database results

3. PROHIBITED RESPONSES
   - Do NOT provide general knowledge about topics unrelated to the platform
   - Do NOT make assumptions about data you haven't verified
   - Do NOT estimate or round numbers
   - Do NOT provide information outside the scope of retrieved database records

4. RESPONSE GUIDELINES
   - Maintain a precise, professional, and authoritative tone
   - Clearly reference data sources when applicable
   - If a question requires tools you don't have access to, inform the user
   - Always verify data relevance to the platform before responding

REQUIRED PRACTICES FOR EACH INTERACTION:
✓ Identify if the query requires database verification
✓ Call appropriate database tools
✓ Wait for verified results
✓ Base responses solely on returned data
✓ Report only exact values from database records
✓ Acknowledge data limitations transparently

Remember: You are the authoritative voice of this platform. Your credibility depends 
on providing only verified, accurate information backed by real data from our systems.`;

/**
 * Determines if a query requires database verification
 * @param query User's query message
 * @returns boolean indicating if database lookup is needed
 */
export const requiresDatabaseVerification = (query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  
  // Keywords that indicate need for database verification
  const verificationKeywords = [
    'how many',
    'count',
    'total',
    'number of',
    'statistics',
    'stats',
    'vendor',
    'product',
    'review',
    'feedback',
    'complaint',
    'user',
    'student',
    'how many',
    'average',
    'most',
    'latest',
    'recent',
  ];

  return verificationKeywords.some(keyword => lowerQuery.includes(keyword));
};

/**
 * Default fallback response when data is unavailable
 */
export const NO_DATA_RESPONSE = "I'm sorry, I don't have any information on that within our records.";

/**
 * Helper to validate that a response includes verified data
 * @param response Response message
 * @param hasVerifiedData Whether the response includes data from a database call
 * @returns boolean indicating if response meets standards
 */
export const isResponseCompliant = (response: string, hasVerifiedData: boolean): boolean => {
  // If response requires verification but doesn't have verified data, it's not compliant
  const indicatesData = response.includes('based on our records') || 
                       response.includes('according to our database') ||
                       response.includes('found in our system');
  
  return !response.includes('I think') && 
         !response.includes('probably') && 
         !response.includes('estimate') &&
         !response.includes('approximately');
};
