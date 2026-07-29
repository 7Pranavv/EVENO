// API Base URL — sirf yahan change karo kabhi bhi
export const API_BASE = "http://localhost:8080";

// Smart ID function — Spring Boot aur MongoDB dono handle karta hai
export const getId = (obj: any): string => {
  return obj._id || obj.id;
};