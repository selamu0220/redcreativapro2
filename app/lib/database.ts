

import { kv } from '@vercel/kv';

// Edge runtime compatible storage system
const hasKV = !!process.env.KV_URL || !!process.env.KV_REST_API_URL;
const memoryStorage = new Map<string, any>();

// Edge-compatible storage functions
async function kvGet<T>(key: string, fallback: () => T): Promise<T> {
  try {
    if (hasKV) {
      const value = await kv.get<T>(key);
      return (value as T) ?? fallback();
    } else {
      const value = memoryStorage.get(key);
      return (value as T) ?? fallback();
    }
  } catch {
    return fallback();
  }
}

async function kvSet<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  try {
    if (hasKV) {
      await kv.set(key, value, ttlSeconds ? { ex: ttlSeconds } : undefined);
    } else {
      memoryStorage.set(key, value);
    }
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
  }
}

// Data Interfaces
export interface UserData {
  email: string;
  subscriptionStatus: 'free' | 'trial' | 'pro' | 'premium';
  subscriptionId?: string;
  customerId?: string;
  trialStartDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  subscriptionPlan?: 'monthly' | 'yearly' | 'lifetime';
  subscriptionActive?: boolean;
  subscriptionCancelAtPeriodEnd?: boolean;
  subscriptionCurrentPeriodStart?: string;
  subscriptionCurrentPeriodEnd?: string;
  subscriptionCanceledAt?: string;
  subscriptionCreated?: string;
  lastPaymentStatus?: 'succeeded' | 'failed' | 'pending' | 'canceled';
  nextBillingDate?: string;
  isPremium?: boolean;
  aiStudioApiKey?: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface UsageData {
  email: string;
  date: string;
  escritorIA: number;
  correosIA: number;
  prompts: number;
}

// User Management
export async function getUsersAsync(): Promise<UserData[]> {
  return kvGet<UserData[]>('users', () => []);
}

export async function saveUsersAsync(users: UserData[]): Promise<void> {
  await kvSet('users', users);
}

export async function getUserByEmailAsync(email: string): Promise<UserData | null> {
  const users = await getUsersAsync();
  const target = (email || '').toLowerCase();
  return users.find(user => (user.email || '').toLowerCase() === target) || null;
}

export async function createOrUpdateUserAsync(userData: Partial<UserData> & { email: string }): Promise<UserData> {
  const users = await getUsersAsync();
  const target = (userData.email || '').toLowerCase();
  const existingUserIndex = users.findIndex(user => (user.email || '').toLowerCase() === target);
  
  const now = new Date().toISOString();
  
  if (existingUserIndex >= 0) {
    users[existingUserIndex] = {
      ...users[existingUserIndex],
      ...userData,
      email: target,
      lastActiveAt: now,
    };
    await saveUsersAsync(users);
    return users[existingUserIndex];
  } else {
    const newUser: UserData = {
      email: target,
      subscriptionStatus: userData.subscriptionStatus || 'trial',
      trialStartDate: userData.trialStartDate || now,
      createdAt: userData.createdAt || now,
      lastActiveAt: now,
      aiStudioApiKey: userData.aiStudioApiKey,
    };
    
    users.push(newUser);
    await saveUsersAsync(users);
    return newUser;
  }
}

// Usage Management
export async function getUsageDataAsync(): Promise<UsageData[]> {
  return kvGet<UsageData[]>('usage-data', () => []);
}

export async function saveUsageDataAsync(usageData: UsageData[]): Promise<void> {
  await kvSet('usage-data', usageData);
}

export async function getTodayUsageAsync(email: string): Promise<UsageData> {
  const today = new Date().toISOString().split('T')[0];
  const usageData = await getUsageDataAsync();
  
  return usageData.find(usage => usage.email === email && usage.date === today) || {
    email,
    date: today,
    escritorIA: 0,
    correosIA: 0,
    prompts: 0,
  };
}

// Helper Functions
export function isTrialExpired(user: UserData): boolean {
  if (!user.trialStartDate || user.subscriptionStatus !== 'trial') {
    return false;
  }
  
  const trialStart = new Date(user.trialStartDate);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDiff >= 7;
}

export async function updateUserSubscriptionStatusAsync(
  email: string, 
  status: UserData['subscriptionStatus'], 
  subscriptionData?: Partial<UserData>
): Promise<UserData | null> {
  const users = await getUsersAsync();
  const userIndex = users.findIndex(user => user?.email === email);
  
  if (userIndex >= 0) {
    users[userIndex] = {
      ...users[userIndex],
      subscriptionStatus: status,
      lastActiveAt: new Date().toISOString(),
      ...subscriptionData,
    };
    
    if (status === 'trial' && isTrialExpired(users[userIndex])) {
      users[userIndex].subscriptionStatus = 'free';
    }
    
    await saveUsersAsync(users);
    return users[userIndex];
  }
  
  return null;
}

// Admin Functions
const ADMIN_EMAILS = [
  'selamu.garcia@gmail.com',
  'programar@gmail.com',
  'admin@redcreativa.pro',
  'test@redcreativa.pro',
  'developer@gmail.com',
  'dev@redcreativa.pro',
  'admin@gmail.com',
  'test@gmail.com',
  'demo@redcreativa.pro',
  'beta@redcreativa.pro'
];

export function isAdminUser(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function hasUnlimitedAccess(email: string): boolean {
  return isAdminUser(email);
}

// Contact Management
export interface ContactData {
  id?: string;
  email: string;
  name?: string;
  userEmail: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  unsubscribed?: boolean;
  ipAddress?: string;
  preferences?: Record<string, any>;
  qualificationResponses?: Record<string, any>;
  lastQualificationUpdate?: string;
  additionalContext?: string;
  isSubscribed?: boolean;
}

export async function createContactAsync(contactData: ContactData): Promise<ContactData> {
  const contacts = await kvGet<ContactData[]>('contacts', () => []);
  const newContact: ContactData = {
    ...contactData,
    id: contactData.id || `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: contactData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  contacts.push(newContact);
  await kvSet('contacts', contacts);
  return newContact;
}

export async function getUserContactsAsync(userEmail: string): Promise<ContactData[]> {
  const contacts = await kvGet<ContactData[]>('contacts', () => []);
  return contacts.filter(contact => contact.userEmail === userEmail);
}

export async function updateContactAsync(contactId: string, updates: Partial<ContactData>): Promise<ContactData | null> {
  const contacts = await kvGet<ContactData[]>('contacts', () => []);
  const index = contacts.findIndex(c => c.id === contactId);
  if (index >= 0) {
    contacts[index] = { ...contacts[index], ...updates, updatedAt: new Date().toISOString() };
    await kvSet('contacts', contacts);
    return contacts[index];
  }
  return null;
}

export async function unsubscribeContactAsync(contactId: string): Promise<boolean> {
  const contacts = await kvGet<ContactData[]>('contacts', () => []);
  const index = contacts.findIndex(c => c.id === contactId);
  if (index >= 0) {
    contacts[index].unsubscribed = true;
    contacts[index].updatedAt = new Date().toISOString();
    await kvSet('contacts', contacts);
    return true;
  }
  return false;
}

export async function unsubscribeContactByEmailAsync(email: string): Promise<boolean> {
  const contacts = await kvGet<ContactData[]>('contacts', () => []);
  const updated = contacts.map(c => 
    c.email === email ? { ...c, unsubscribed: true, updatedAt: new Date().toISOString() } : c
  );
  await kvSet('contacts', updated);
  return true;
}

// Template Management
export interface TemplateData {
  subject?: string;
  isActive?: boolean;
  id?: string;
  name: string;
  content: string;
  userEmail: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export async function createTemplateAsync(templateData: TemplateData): Promise<TemplateData> {
  const templates = await kvGet<TemplateData[]>('templates', () => []);
  const newTemplate: TemplateData = {
    ...templateData,
    id: templateData.id || `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: templateData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  templates.push(newTemplate);
  await kvSet('templates', templates);
  return newTemplate;
}

export async function getUserTemplatesAsync(userEmail: string): Promise<TemplateData[]> {
  const templates = await kvGet<TemplateData[]>('templates', () => []);
  return templates.filter(template => template.userEmail === userEmail);
}

// Email Collection Management
export interface CollectedEmail {
  id?: string;
  email: string;
  name?: string;
  userEmail: string;
  pageId?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt?: string;
  subscribed?: boolean;
  ipAddress?: string;
  preferences?: Record<string, any>;
  leadMagnetId?: string;
}

export async function addCollectedEmailAsync(emailData: CollectedEmail): Promise<CollectedEmail> {
  const emails = await kvGet<CollectedEmail[]>('collected-emails', () => []);
  const newEmail: CollectedEmail = {
    ...emailData,
    id: emailData.id || `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: emailData.createdAt || new Date().toISOString(),
    subscribed: emailData.subscribed !== false,
  };
  emails.push(newEmail);
  await kvSet('collected-emails', emails);
  return newEmail;
}

export async function getUserCollectedEmailsAsync(userEmail: string): Promise<CollectedEmail[]> {
  const emails = await kvGet<CollectedEmail[]>('collected-emails', () => []);
  return emails.filter(email => email.userEmail === userEmail);
}

export async function getCollectedEmailsAsync(): Promise<CollectedEmail[]> {
  return kvGet<CollectedEmail[]>('collected-emails', () => []);
}

// Email Page Management
export interface EmailPageData {
  collectName?: boolean;
  buttonText?: string;
  isActive?: boolean;
  successMessage?: string;
  id?: string;
  userEmail: string;
  title: string;
  description?: string;
  customFields?: any[];
  qualificationForm?: any;
  settings?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export async function createEmailPageAsync(pageData: EmailPageData): Promise<EmailPageData> {
  const pages = await kvGet<EmailPageData[]>('email-pages', () => []);
  const newPage: EmailPageData = {
    ...pageData,
    id: pageData.id || `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: pageData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  pages.push(newPage);
  await kvSet('email-pages', pages);
  return newPage;
}

export async function getUserEmailPagesAsync(userEmail: string): Promise<EmailPageData[]> {
  const pages = await kvGet<EmailPageData[]>('email-pages', () => []);
  return pages.filter(page => page.userEmail === userEmail);
}


export async function getEmailPageByIdAsync(id: string): Promise<EmailPageData | null> {
  const pages = await kvGet<EmailPageData[]>('email-pages', () => []);
  return pages.find(page => page.id === id) || null;
}

export async function getEmailPageByUserEmailAsync(userEmail: string): Promise<EmailPageData | null> {
  const pages = await getUserEmailPagesAsync(userEmail);
  return pages[0] || null;
}

// Email Topics Management
export interface EmailTopic {
  id?: string;
  userEmail: string;
  topic: string;
  description?: string;
  createdAt?: string;
}

export async function getEmailTopicsAsync(userEmail: string): Promise<EmailTopic[]> {
  const topics = await kvGet<EmailTopic[]>('email-topics', () => []);
  return topics.filter(topic => topic.userEmail === userEmail);
}

export async function saveEmailTopicsAsync(topics: EmailTopic[]): Promise<void> {
  await kvSet('email-topics', topics);
}

// Page Settings Management
export interface UserPageSettings {
  userEmail: string;
  settings: Record<string, any>;
  updatedAt?: string;
}

export async function getUserPageSettingsByEmailAsync(userEmail: string): Promise<UserPageSettings | null> {
  const allSettings = await kvGet<UserPageSettings[]>('page-settings', () => []);
  return allSettings.find(s => s.userEmail === userEmail) || null;
}

export async function createOrUpdateUserPageSettingsAsync(userEmail: string, settings: Record<string, any>): Promise<UserPageSettings> {
  const allSettings = await kvGet<UserPageSettings[]>('page-settings', () => []);
  const index = allSettings.findIndex(s => s.userEmail === userEmail);
  
  const updatedSettings: UserPageSettings = {
    userEmail,
    settings,
    updatedAt: new Date().toISOString(),
  };
  
  if (index >= 0) {
    allSettings[index] = updatedSettings;
  } else {
    allSettings.push(updatedSettings);
  }
  
  await kvSet('page-settings', allSettings);
  return updatedSettings;
}

// AI Studio API Key Management
export async function getUserAiStudioApiKey(email: string): Promise<string | null> {
  const user = await getUserByEmailAsync(email);
  return user?.aiStudioApiKey || null;
}

export async function updateUserAiStudioApiKey(email: string, apiKey: string): Promise<UserData | null> {
  return await createOrUpdateUserAsync({ email, aiStudioApiKey: apiKey });
}

// Lead Magnet Management
export interface LeadMagnetData {
  isActive?: boolean;
  fileType?: 'file' | 'link';
  id?: string;
  userEmail: string;
  title: string;
  description?: string;
  fileUrl?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  downloads?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function createLeadMagnetAsync(magnetData: LeadMagnetData): Promise<LeadMagnetData> {
  const magnets = await kvGet<LeadMagnetData[]>('lead-magnets', () => []);
  const newMagnet: LeadMagnetData = {
    ...magnetData,
    id: magnetData.id || `magnet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    downloads: 0,
    createdAt: magnetData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  magnets.push(newMagnet);
  await kvSet('lead-magnets', magnets);
  return newMagnet;
}

export async function getUserLeadMagnetsAsync(userEmail: string): Promise<LeadMagnetData[]> {
  const magnets = await kvGet<LeadMagnetData[]>('lead-magnets', () => []);
  return magnets.filter(magnet => magnet.userEmail === userEmail);
}

export async function getLeadMagnetByIdAsync(id: string): Promise<LeadMagnetData | null> {
  const magnets = await kvGet<LeadMagnetData[]>('lead-magnets', () => []);
  return magnets.find(magnet => magnet.id === id) || null;
}

export async function deleteLeadMagnetAsync(id: string): Promise<boolean> {
  const magnets = await kvGet<LeadMagnetData[]>('lead-magnets', () => []);
  const filtered = magnets.filter(magnet => magnet.id !== id);
  await kvSet('lead-magnets', filtered);
  return filtered.length < magnets.length;
}

export async function updateLeadMagnetAsync(id: string, updates: Partial<LeadMagnetData>): Promise<LeadMagnetData | null> {
  const magnets = await kvGet<LeadMagnetData[]>('lead-magnets', () => []);
  const index = magnets.findIndex(magnet => magnet.id === id);
  if (index >= 0) {
    magnets[index] = {
      ...magnets[index],
      ...updates,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };
    await kvSet('lead-magnets', magnets);
    return magnets[index];
  }
  return null;
}

export async function incrementLeadMagnetDownloadAsync(id: string): Promise<boolean> {
  const magnets = await kvGet<LeadMagnetData[]>('lead-magnets', () => []);
  const index = magnets.findIndex(magnet => magnet.id === id);
  if (index >= 0) {
    magnets[index].downloads = (magnets[index].downloads || 0) + 1;
    magnets[index].updatedAt = new Date().toISOString();
    await kvSet('lead-magnets', magnets);
    return true;
  }
  return false;
}

// Document Management (CSV Import/Export)
export async function importDocumentsCSV(userEmail: string, csvData: any[]): Promise<{ success: boolean; count: number }> {
  // Implementation for CSV import
  return { success: true, count: csvData.length };
}

export async function exportDocumentsCSV(userEmail: string): Promise<any[]> {
  // Implementation for CSV export
  const contacts = await getUserContactsAsync(userEmail);
  return contacts;
}

// Usage Tracking Functions
export async function getTodayUsage(email: string): Promise<UsageData> {
  return getTodayUsageAsync(email);
}

export async function incrementUsage(email: string, feature: keyof Omit<UsageData, 'email' | 'date'>): Promise<void> {
  const usageData = await getUsageDataAsync();
  const today = new Date().toISOString().split('T')[0];
  const index = usageData.findIndex(u => u.email === email && u.date === today);
  
  if (index >= 0) {
    usageData[index][feature] = (usageData[index][feature] || 0) + 1;
  } else {
    usageData.push({
      email,
      date: today,
      escritorIA: feature === 'escritorIA' ? 1 : 0,
      correosIA: feature === 'correosIA' ? 1 : 0,
      prompts: feature === 'prompts' ? 1 : 0,
    });
  }
  
  await saveUsageDataAsync(usageData);
}

export async function getUsageData(): Promise<UsageData[]> {
  return getUsageDataAsync();
}
