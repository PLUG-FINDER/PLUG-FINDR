import { VendorProfile } from '../api/vendor';

/**
 * Formats phone number for WhatsApp link
 * Ensures the number starts with 233 (Ghana country code)
 */
const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // If empty, return empty string
  if (!digits) return '';
  
  // If number already starts with 233 (Ghana country code), use it as is
  if (digits.startsWith('233')) {
    return digits;
  }
  
  // If number starts with 0 (local format like 0244123456), remove the 0 and add 233
  if (digits.startsWith('0')) {
    return '233' + digits.substring(1);
  }
  
  // Otherwise, assume it's a local number and prepend 233
  return '233' + digits;
};

/**
 * Gets WhatsApp link from phone number or WhatsApp field
 * Opens directly to chat with the vendor
 */
export const getWhatsAppLink = (vendor: VendorProfile): string | null => {
  if (vendor.whatsapp) {
    const phone = formatPhoneNumber(vendor.whatsapp);
    if (phone) return `https://wa.me/${phone}`;
  }
  if (vendor.contactPhone) {
    const phone = formatPhoneNumber(vendor.contactPhone);
    if (phone) return `https://wa.me/${phone}`;
  }
  return null;
};

/**
 * Gets Instagram link from handle or URL
 */
export const getInstagramLink = (vendor: VendorProfile): string | null => {
  if (!vendor.instagram) return null;
  const handle = vendor.instagram
    .replace('@', '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .replace(/\/$/, '');
  if (handle) return `https://instagram.com/${handle}`;
  return null;
};

/**
 * Gets Snapchat link from username
 */
export const getSnapchatLink = (vendor: VendorProfile): string | null => {
  if (!vendor.snapchat) return null;
  const username = vendor.snapchat.replace('@', '').trim();
  if (username) return `https://snapchat.com/add/${username}`;
  return null;
};

/**
 * Gets TikTok link from username or URL
 */
export const getTikTokLink = (vendor: VendorProfile): string | null => {
  if (!vendor.tiktok) return null;
  const username = vendor.tiktok
    .replace('@', '')
    .replace(/^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)\//, '')
    .replace(/\/$/, '')
    .trim();
  if (username) return `https://tiktok.com/@${username}`;
  return null;
};

/**
 * Gets Facebook link from username or URL
 */
export const getFacebookLink = (vendor: VendorProfile): string | null => {
  if (!vendor.facebook) return null;
  let username = vendor.facebook.trim();
  
  // If it's already a full URL, return it
  if (username.startsWith('http://') || username.startsWith('https://')) {
    return username;
  }
  
  // Remove common prefixes
  username = username
    .replace(/^https?:\/\/(www\.)?facebook\.com\//, '')
    .replace(/^fb\.com\//, '')
    .replace(/\/$/, '')
    .trim();
    
  if (username) return `https://facebook.com/${username}`;
  return null;
};

/**
 * Gets Twitter/X link from username or URL
 */
export const getTwitterLink = (vendor: VendorProfile): string | null => {
  if (!vendor.twitter) return null;
  let username = vendor.twitter.trim();
  
  // If it's already a full URL, return it
  if (username.startsWith('http://') || username.startsWith('https://')) {
    return username;
  }
  
  // Remove @ and common prefixes
  username = username
    .replace('@', '')
    .replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//, '')
    .replace(/\/$/, '')
    .trim();
    
  if (username) return `https://x.com/${username}`;
  return null;
};

