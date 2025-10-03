import { kv } from '@vercel/kv';
import { createClient } from '@supabase/supabase-js';

// Edge runtime compatible storage system
// Uses KV when available, in-memory storage as fallback for edge runtime

const hasKV = !!process.env.KV_URL || !!process.env.KV_REST_API_URL;

// In-memory storage for edge runtime compatibility
const memoryStorage = new Map<string, any>();

// Edge-compatible storage functions
async function kvGet<T>(key: string, fallback: () => T): Promise<T> {
  try {
    if (hasKV) {
      const value = await kv.get<T>(key);
      return (value as T) ?? fallback();
    } else {
      // Use in-memory storage for edge runtime
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
      // Use in-memory storage for edge runtime
      memoryStorage.set(key, value);
      // Note: TTL not implemented for in-memory storage
    }
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
  }
}

// Supabase client for server-side operations (with service role key)
function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase server environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Supabase client for client-side operations (with anon key)
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase client environment variables');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

export interface UserData {
  email: string;
  subscriptionStatus: 'free' | 'trial' | 'pro' | 'premium';
  subscriptionId?: string;
  customerId?: string;
  trialStartDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  // Stripe subscription data
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeProductId?: string;
  subscriptionPlan?: 'monthly' | 'yearly' | 'lifetime';
  subscriptionActive?: boolean;
  subscriptionCancelAtPeriodEnd?: boolean;
  subscriptionCurrentPeriodStart?: string;
  subscriptionCurrentPeriodEnd?: string;
  subscriptionCanceledAt?: string;
  subscriptionCreated?: string;
  lastPaymentStatus?: 'succeeded' | 'failed' | 'pending' | 'canceled';
  nextBillingDate?: string;
  isPremium?: boolean; // Computed field for UI theming
  aiStudioApiKey?: string;
  // Propiedades del sistema de correos antiguo eliminadas
  createdAt: string;
  lastActiveAt: string;
}

export interface UsageData {
  email: string;
  date: string; // YYYY-MM-DD format
  escritorIA: number;
  correosIA: number;
  prompts: number;
}

export interface DocumentData {
  id: string;
  title: string;
  content: string;
  userEmail: string;
  folderId?: string; // null for root level documents
  createdAt: string;
  updatedAt: string;
  type: 'escritor-ia' | 'correos-ia' | 'prompts' | 'other';
}

export interface FolderData {
  id: string;
  name: string;
  userEmail: string;
  parentFolderId?: string; // null for root level folders
  createdAt: string;
  updatedAt: string;
}

// New simplified data models for user email collection pages
export interface CollectedEmail {
  id: string;
  email: string;
  name?: string; // Optional name field
  collectedAt: string;
  userEmail: string; // Owner of the collection page
  source: 'collection-page' | string; // Allow lead magnet sources like 'lead-magnet-{source}'
  ipAddress?: string; // For basic analytics
  // Lead magnet data
  leadMagnetId?: string; // ID of the lead magnet they downloaded
  preferences?: SubscriptionPreferences;
  // Questionnaire data
  customFields?: Record<string, string>; // Questionnaire responses
}

export interface UserPageSettings {
  userEmail: string;
  title: string;
  description: string;
  callToActionText: string;
  successMessage: string;
  customBranding?: {
    primaryColor?: string;
    logoUrl?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Lead magnet settings
  leadMagnetId?: string; // Associated lead magnet
  requiresPreferences?: boolean; // Whether to show preferences form
}

// Lead Magnet interfaces
export interface LeadMagnet {
  id: string;
  userEmail: string; // Owner of the lead magnet
  title: string;
  description: string;
  fileType: 'pdf' | 'audio' | 'video' | 'document' | 'link' | 'other';
  fileName?: string; // Original file name
  filePath?: string; // Path to stored file
  fileUrl?: string; // External URL if it's a link
  fileSize?: number; // File size in bytes
  downloadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Preview/thumbnail
  thumbnailPath?: string;
  previewText?: string;
}

// Subscription preferences
export interface SubscriptionPreferences {
  topics: string[]; // Topics they want to receive emails about
  excludeTopics: string[]; // Topics they don't want
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  emailTypes: ('newsletter' | 'promotions' | 'updates' | 'educational')[];
  language: 'es' | 'en';
  timeZone?: string;
}

// Email topic categories
export interface EmailTopic {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'technology' | 'marketing' | 'design' | 'productivity' | 'other';
  isActive: boolean;
}

// Legacy interface - will be removed in cleanup phase
export interface ContactData {
  id: string;
  email: string;
  name?: string;
  userEmail: string; // Owner of the contact
  isSubscribed: boolean;
  unsubscribeToken?: string;
  source?: string; // Where the contact came from
  tags?: string[];
  // Contexto adicional personalizado para mejorar los correos
  additionalContext?: string;
  // Datos del cuestionario de cualificación
  qualificationData?: {
    responses: Record<string, string | string[]>; // questionId -> response
    interests: string[];
    communicationStyle: string;
    preferredTopics: string[];
    languageStyle: string;
    demographicInfo?: Record<string, string>;
    qualificationScore?: number;
    segment?: string;
    completedAt: string;
  };
  lastQualificationUpdate?: string;
  createdAt: string;
  updatedAt: string;
}



export interface EmailCollectionPageData {
  id: string;
  userEmail: string;
  title: string;
  description: string;
  buttonText: string;
  successMessage: string;
  isActive: boolean;
  collectName: boolean;
  customFields?: { name: string; type: 'text' | 'email' | 'phone'; required: boolean }[];
  // Configuración del cuestionario de cualificación
  qualificationForm?: {
    enabled: boolean;
    questions: {
      id: string;
      type: 'select' | 'multiselect' | 'text' | 'scale';
      question: string;
      options?: string[];
      required: boolean;
      category: 'interests' | 'communication' | 'demographics' | 'preferences';
    }[];
    personalizedGreeting: boolean;
    segmentationEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TemplateData {
  id: string;
  userEmail: string;
  name: string;
  subject: string;
  content: string;
  category?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// User management functions
export function getUsers(): UserData[] { throw new Error('Use async getUsersAsync()'); }
export async function getUsersAsync(): Promise<UserData[]> {
  return kvGet<UserData[]>('users', () => []);
}

export function saveUsers(users: UserData[]): void { throw new Error('Use async saveUsersAsync()'); }
export async function saveUsersAsync(users: UserData[]): Promise<void> {
  await kvSet('users', users);
}

export function getUserByEmail(_: string): UserData | null { throw new Error('Use async getUserByEmailAsync()'); }
export async function getUserByEmailAsync(email: string): Promise<UserData | null> {
  const users = await getUsersAsync();
  const target = (email || '').toLowerCase();
  return users.find(user => (user.email || '').toLowerCase() === target) || null;
}

export function createOrUpdateUser(_: Partial<UserData> & { email: string }): UserData { throw new Error('Use async createOrUpdateUserAsync()'); }
export async function createOrUpdateUserAsync(userData: Partial<UserData> & { email: string }): Promise<UserData> {
  const users = await getUsersAsync();
  const target = (userData.email || '').toLowerCase();
  const existingUserIndex = users.findIndex(user => (user.email || '').toLowerCase() === target);
  
  const now = new Date().toISOString();
  
  if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex] = {
      ...users[existingUserIndex],
      ...userData,
      email: target,
      lastActiveAt: now,
    };
    await saveUsersAsync(users);
    return users[existingUserIndex];
  } else {
    // Create new user
    const newUser: UserData = {
      email: target,
      subscriptionStatus: userData.subscriptionStatus || 'trial',
      trialStartDate: userData.trialStartDate || now,
      createdAt: userData.createdAt || now,
      lastActiveAt: now,
      aiStudioApiKey: userData.aiStudioApiKey,
    };
    
    // Add new user to array and save
    users.push(newUser);
    await saveUsersAsync(users);
    
    // Auto-create default page settings for new user
    await createDefaultPageSettingsForUserAsync(userData.email);
    
    // Auto-create default email collection page for new user
    try {
      await createEmailPageAsync({
        userEmail: target,
        title: 'Únete a mi lista de correos',
        description: 'Suscríbete para recibir contenido exclusivo y actualizaciones.',
        buttonText: 'Suscribirse',
        successMessage: '¡Gracias por suscribirte! Te enviaremos contenido valioso.',
        isActive: true,
        collectName: true,
        customFields: [],
        qualificationForm: undefined
      });
    } catch (error) {
      console.error('Error creating default email collection page:', error);
    }
    
    return newUser;
  }
}

// Usage management functions - deprecated, use async versions
export function getUsageData(): UsageData[] { throw new Error('Use async getUsageDataAsync()'); }
export function saveUsageData(usageData: UsageData[]): void { throw new Error('Use async saveUsageDataAsync()'); }

// Async versions for Edge Runtime compatibility
export async function getUsageDataAsync(): Promise<UsageData[]> {
  return kvGet<UsageData[]>('usage-data', () => []);
}

export async function saveUsageDataAsync(usageData: UsageData[]): Promise<void> {
  await kvSet('usage-data', usageData);
}

export async function getTodayUsageAsync(email: string): Promise<UsageData> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const usageData = await getUsageDataAsync();
  
  return usageData.find(usage => usage.email === email && usage.date === today) || {
    email,
    date: today,
    escritorIA: 0,
    correosIA: 0,
    prompts: 0,
  };
}

export function getTodayUsage(email: string): UsageData {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const usageData = getUsageData();
  
  return usageData.find(usage => usage.email === email && usage.date === today) || {
    email,
    date: today,
    escritorIA: 0,
    correosIA: 0,
    prompts: 0,
  };
}

export function incrementUsage(email: string, tool: 'escritorIA' | 'correosIA' | 'prompts'): UsageData {
  const today = new Date().toISOString().split('T')[0];
  const usageData = getUsageData();
  
  const existingUsageIndex = usageData.findIndex(
    usage => usage.email === email && usage.date === today
  );
  
  if (existingUsageIndex >= 0) {
    usageData[existingUsageIndex][tool]++;
  } else {
    const newUsage: UsageData = {
      email,
      date: today,
      escritorIA: 0,
      correosIA: 0,
      prompts: 0,
    };
    newUsage[tool] = 1;
    usageData.push(newUsage);
  }
  
  saveUsageData(usageData);
  return getTodayUsage(email);
}

// Helper functions
export function isTrialExpired(user: UserData): boolean {
  if (!user.trialStartDate || user.subscriptionStatus !== 'trial') {
    return false;
  }
  
  const trialStart = new Date(user.trialStartDate);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDiff >= 7;
}

export function updateUserSubscriptionStatus(email: string, status: UserData['subscriptionStatus'], subscriptionData?: Partial<UserData>): UserData | null { throw new Error('Use async updateUserSubscriptionStatusAsync()'); }
export async function updateUserSubscriptionStatusAsync(email: string, status: UserData['subscriptionStatus'], subscriptionData?: Partial<UserData>): Promise<UserData | null> {
  const users = await getUsersAsync();
  const userIndex = users.findIndex(user => user?.email === email);
  
  if (userIndex >= 0) {
    users[userIndex] = {
      ...users[userIndex],
      subscriptionStatus: status,
      lastActiveAt: new Date().toISOString(),
      ...subscriptionData,
    };
    
    // If trial expired, move to free
    if (status === 'trial' && isTrialExpired(users[userIndex])) {
      users[userIndex].subscriptionStatus = 'free';
    }
    
    await saveUsersAsync(users);
    return users[userIndex];
  }
  
  return null;
}

export function updateUserAiStudioApiKey(email: string, apiKey: string): UserData | null { throw new Error('Use async updateUserAiStudioApiKeyAsync()'); }
export async function updateUserAiStudioApiKeyAsync(email: string, apiKey: string): Promise<UserData | null> {
  const users = await getUsersAsync();
  const userIndex = users.findIndex(user => user?.email === email);
  
  if (userIndex >= 0) {
    users[userIndex] = {
      ...users[userIndex],
      aiStudioApiKey: apiKey,
      lastActiveAt: new Date().toISOString(),
    };
    
    await saveUsersAsync(users);
    return users[userIndex];
  }
  
  return null;
}

export function getUserAiStudioApiKey(email: string): string | null { throw new Error('Use async getUserAiStudioApiKeyAsync()'); }
export async function getUserAiStudioApiKeyAsync(email: string): Promise<string | null> {
  const user = await getUserByEmailAsync(email);
  return user?.aiStudioApiKey || null;
}

// Admin management functions
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

// Funciones del sistema de correos antiguo eliminadas

// Document management functions - deprecated, use async versions
export function getDocuments(): DocumentData[] { throw new Error('Use async getDocumentsAsync()'); }
export function saveDocuments(documents: DocumentData[]): void { throw new Error('Use async saveDocumentsAsync()'); }

export async function getDocumentsAsync(): Promise<DocumentData[]> {
  return kvGet<DocumentData[]>('documents', () => []);
}

export async function saveDocumentsAsync(documents: DocumentData[]): Promise<void> {
  await kvSet('documents', documents);
}

export function getUserDocuments(email: string, folderId?: string): DocumentData[] {
  const documents = getDocuments();
  return documents.filter(doc => 
    doc.userEmail === email && 
    (folderId === undefined || doc.folderId === folderId)
  );
}

export function getDocumentById(id: string, userEmail: string): DocumentData | null {
  const documents = getDocuments();
  return documents.find(doc => doc.id === id && doc.userEmail === userEmail) || null;
}

export function createDocument(documentData: Omit<DocumentData, 'id' | 'createdAt' | 'updatedAt'>): DocumentData {
  const documents = getDocuments();
  const now = new Date().toISOString();
  const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newDocument: DocumentData = {
    ...documentData,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  documents.push(newDocument);
  saveDocuments(documents);
  return newDocument;
}

export function updateDocument(_: string, __: Partial<Omit<DocumentData, 'id' | 'createdAt'>>): DocumentData | null { throw new Error('Use async updateDocumentAsync()'); }
export async function updateDocumentAsync(id: string, updates: Partial<Omit<DocumentData, 'id' | 'createdAt'>>, userEmail: string): Promise<DocumentData | null> {
  const documents = await getDocumentsAsync();
  const documentIndex = documents.findIndex(doc => doc.id === id && doc.userEmail === userEmail);
  
  if (documentIndex >= 0) {
    documents[documentIndex] = {
      ...documents[documentIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await saveDocumentsAsync(documents);
    return documents[documentIndex];
  }
  
  return null;
}

export function deleteDocument(_: string): boolean { throw new Error('Use async deleteDocumentAsync()'); }
export async function deleteDocumentAsync(id: string, userEmail: string): Promise<boolean> {
  const documents = await getDocumentsAsync();
  const documentIndex = documents.findIndex(doc => doc.id === id && doc.userEmail === userEmail);
  
  if (documentIndex >= 0) {
    documents.splice(documentIndex, 1);
    await saveDocumentsAsync(documents);
    return true;
  }
  
  return false;
}

// Folder management functions - deprecated, use async versions
export function getFolders(): FolderData[] { throw new Error('Use async getFoldersAsync()'); }
export function saveFolders(folders: FolderData[]): void { throw new Error('Use async saveFoldersAsync()'); }

export async function getFoldersAsync(): Promise<FolderData[]> {
  return kvGet<FolderData[]>('folders', () => []);
}

export async function saveFoldersAsync(folders: FolderData[]): Promise<void> {
  await kvSet('folders', folders);
}

export function getUserFolders(email: string, parentFolderId?: string): FolderData[] {
  const folders = getFolders();
  return folders.filter(folder => 
    folder.userEmail === email && 
    (parentFolderId === undefined || folder.parentFolderId === parentFolderId)
  );
}

export function getFolderById(id: string, userEmail: string): FolderData | null {
  const folders = getFolders();
  return folders.find(folder => folder.id === id && folder.userEmail === userEmail) || null;
}

export function createFolder(folderData: Omit<FolderData, 'id' | 'createdAt' | 'updatedAt'>): FolderData {
  const folders = getFolders();
  const now = new Date().toISOString();
  const id = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newFolder: FolderData = {
    ...folderData,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  folders.push(newFolder);
  saveFolders(folders);
  return newFolder;
}

export function updateFolder(id: string, updates: Partial<Omit<FolderData, 'id' | 'createdAt'>>, userEmail: string): FolderData | null {
  const folders = getFolders();
  const folderIndex = folders.findIndex(folder => folder.id === id && folder.userEmail === userEmail);
  
  if (folderIndex >= 0) {
    folders[folderIndex] = {
      ...folders[folderIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveFolders(folders);
    return folders[folderIndex];
  }
  
  return null;
}

export function deleteFolder(id: string, userEmail: string): boolean {
  const folders = getFolders();
  const folderIndex = folders.findIndex(folder => folder.id === id && folder.userEmail === userEmail);
  
  if (folderIndex >= 0) {
    // Also delete all documents in this folder (only user's documents)
    const documents = getDocuments();
    const updatedDocuments = documents.filter(doc => !(doc.folderId === id && doc.userEmail === userEmail));
    saveDocuments(updatedDocuments);
    
    // Delete all subfolders recursively (only user's subfolders)
    const subfolders = folders.filter(folder => folder.parentFolderId === id && folder.userEmail === userEmail);
    subfolders.forEach(subfolder => deleteFolder(subfolder.id, userEmail));
    
    // Delete the folder itself
    folders.splice(folderIndex, 1);
    saveFolders(folders);
    return true;
  }
  
  return false;
}

// Contact management functions
export function getContacts(): ContactData[] { throw new Error('Use async getContactsAsync()'); }
export async function getContactsAsync(): Promise<ContactData[]> {
  return kvGet<ContactData[]>('contacts', () => []);
}

export function saveContacts(_: ContactData[]): void { throw new Error('Use async saveContactsAsync()'); }
export async function saveContactsAsync(contacts: ContactData[]): Promise<void> {
  await kvSet('contacts', contacts);
}

export function getUserContacts(_: string): ContactData[] { throw new Error('Use async getUserContactsAsync()'); }
export async function getUserContactsAsync(email: string): Promise<ContactData[]> {
  const contacts = await getContactsAsync();
  return contacts.filter(contact => contact.userEmail === email);
}

export function getContactById(id: string, userEmail: string): ContactData | null {
  throw new Error('Use async getContactByIdAsync()');
}

export async function getContactByIdAsync(id: string, userEmail: string): Promise<ContactData | null> {
  const contacts = await getContactsAsync();
  return contacts.find(contact => contact.id === id && contact.userEmail === userEmail) || null;
}

export function createContact(_: Omit<ContactData, 'id' | 'createdAt' | 'updatedAt'>): ContactData { throw new Error('Use async createContactAsync()'); }
export async function createContactAsync(contactData: Omit<ContactData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContactData> {
  const contacts = await getContactsAsync();
  const now = new Date().toISOString();
  const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const unsubscribeToken = Math.random().toString(36).substr(2, 32);
  
  const newContact: ContactData = {
    ...contactData,
    id,
    unsubscribeToken,
    createdAt: now,
    updatedAt: now,
  };
  
  contacts.push(newContact);
  await saveContactsAsync(contacts);
  return newContact;
}

export function updateContact(_: string, __: Partial<Omit<ContactData, 'id' | 'createdAt'>>): ContactData | null { throw new Error('Use async updateContactAsync()'); }
export async function updateContactAsync(id: string, updates: Partial<Omit<ContactData, 'id' | 'createdAt'>>, userEmail: string): Promise<ContactData | null> {
  const contacts = await getContactsAsync();
  const contactIndex = contacts.findIndex(contact => contact.id === id && contact.userEmail === userEmail);
  
  if (contactIndex >= 0) {
    contacts[contactIndex] = {
      ...contacts[contactIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await saveContactsAsync(contacts);
    return contacts[contactIndex];
  }
  
  return null;
}

export function deleteContact(_: string): boolean { throw new Error('Use async deleteContactAsync()'); }
export async function deleteContactAsync(id: string, userEmail: string): Promise<boolean> {
  const contacts = await getContactsAsync();
  const contactIndex = contacts.findIndex(contact => contact.id === id && contact.userEmail === userEmail);
  
  if (contactIndex >= 0) {
    contacts.splice(contactIndex, 1);
    await saveContactsAsync(contacts);
    return true;
  }
  
  return false;
}

export function unsubscribeContact(token: string): boolean {
  throw new Error('Use async unsubscribeContactAsync()');
}

export async function unsubscribeContactAsync(token: string): Promise<boolean> {
  const contacts = await getContactsAsync();
  const contactIndex = contacts.findIndex(contact => contact.unsubscribeToken === token);
  
  if (contactIndex >= 0) {
    contacts[contactIndex].isSubscribed = false;
    contacts[contactIndex].updatedAt = new Date().toISOString();
    await saveContactsAsync(contacts);
    return true;
  }
  
  return false;
}

export function unsubscribeContactByEmail(email: string): boolean {
  throw new Error('Use async unsubscribeContactByEmailAsync()');
}

export async function unsubscribeContactByEmailAsync(email: string): Promise<boolean> {
  const contacts = await getContactsAsync();
  const contactIndex = contacts.findIndex(contact => contact.email === email && contact.isSubscribed);
  
  if (contactIndex >= 0) {
    contacts[contactIndex].isSubscribed = false;
    contacts[contactIndex].updatedAt = new Date().toISOString();
    await saveContactsAsync(contacts);
    return true;
  }
  
  return false;
}

// Función para generar enlace de unsubscribe para un contacto
export function generateUnsubscribeLink(contactEmail: string, baseUrl: string = 'http://localhost:3000'): string | null {
  throw new Error('Use async generateUnsubscribeLinkAsync()');
}

export async function generateUnsubscribeLinkAsync(contactEmail: string, baseUrl: string = 'http://localhost:3000'): Promise<string | null> {
  const contacts = await getContactsAsync();
  const contact = contacts.find(c => c.email === contactEmail && c.isSubscribed);
  
  if (!contact || !contact.unsubscribeToken) {
    return null;
  }
  
  return `${baseUrl}/unsubscribe?token=${contact.unsubscribeToken}`;
}

// Función para obtener el HTML del enlace de unsubscribe
export function getUnsubscribeHtml(contactEmail: string, baseUrl: string = 'http://localhost:3000'): string {
  throw new Error('Use async getUnsubscribeHtmlAsync()');
}

export async function getUnsubscribeHtmlAsync(contactEmail: string, baseUrl: string = 'http://localhost:3000'): Promise<string> {
  const unsubscribeLink = await generateUnsubscribeLinkAsync(contactEmail, baseUrl);
  
  if (!unsubscribeLink) {
    // Enlace alternativo usando email directo
    return `
      <div style="text-align: center; margin-top: 20px; padding: 10px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
        <p>¿No quieres recibir más correos?</p>
        <a href="${baseUrl}/unsubscribe" style="color: #666; text-decoration: underline;">Cancelar suscripción</a>
      </div>
    `;
  }
  
  return `
    <div style="text-align: center; margin-top: 20px; padding: 10px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
      <p>¿No quieres recibir más correos?</p>
      <a href="${unsubscribeLink}" style="color: #666; text-decoration: underline;">Cancelar suscripción</a>
    </div>
  `;
}



// Email collection page management functions using Supabase
export async function getEmailPagesAsync(): Promise<Record<string, EmailCollectionPageData[]>> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('email_collection_pages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching email pages:', error);
    return {};
  }

  // Group pages by user email
  const pagesByEmail: Record<string, EmailCollectionPageData[]> = {};
  data?.forEach(page => {
    const emailCollectionPage: EmailCollectionPageData = {
      id: page.id,
      userEmail: page.user_email,
      title: page.title,
      description: page.description,
      buttonText: page.button_text,
      successMessage: page.success_message,
      isActive: page.is_active,
      collectName: page.collect_name,
      customFields: page.custom_fields || [],
      qualificationForm: page.qualification_form || { enabled: false, questions: [] },
      createdAt: page.created_at,
      updatedAt: page.updated_at
    };
    
    if (!pagesByEmail[page.user_email]) {
      pagesByEmail[page.user_email] = [];
    }
    pagesByEmail[page.user_email].push(emailCollectionPage);
  });

  return pagesByEmail;
}

export function getEmailPages(): EmailCollectionPageData[] { throw new Error('Use async getEmailPagesAsync()'); }
export async function saveEmailPagesAsync(pagesByEmail: Record<string, EmailCollectionPageData[]>): Promise<void> {
  // This function is deprecated when using Supabase - use individual CRUD operations instead
  console.warn('saveEmailPagesAsync is deprecated with Supabase. Use individual CRUD operations.');
}

export function saveEmailPages(_: EmailCollectionPageData[]): void { throw new Error('Use async saveEmailPagesAsync()'); }
export function getUserEmailPages(_: string): EmailCollectionPageData[] { throw new Error('Use async getUserEmailPagesAsync()'); }
export async function getUserEmailPagesAsync(email: string): Promise<EmailCollectionPageData[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('email_collection_pages')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user email pages:', error);
    return [];
  }

  return data?.map(page => ({
    id: page.id,
    userEmail: page.user_email,
    title: page.title,
    description: page.description,
    buttonText: page.button_text,
    successMessage: page.success_message,
    isActive: page.is_active,
    collectName: page.collect_name,
    customFields: page.custom_fields || [],
    qualificationForm: page.qualification_form || { enabled: false, questions: [] },
    createdAt: page.created_at,
    updatedAt: page.updated_at
  })) || [];
}

export function getEmailPageById(_: string): EmailCollectionPageData | null { throw new Error('Use async getEmailPageByIdAsync()'); }
export async function getEmailPageByIdAsync(id: string, userEmail: string): Promise<EmailCollectionPageData | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('email_collection_pages')
    .select('*')
    .eq('id', id)
    .eq('user_email', userEmail)
    .single();

  if (error) {
    console.error('Error fetching email page by ID:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    userEmail: data.user_email,
    title: data.title,
    description: data.description,
    buttonText: data.button_text,
    successMessage: data.success_message,
    isActive: data.is_active,
    collectName: data.collect_name,
    customFields: data.custom_fields || [],
    qualificationForm: data.qualification_form || { enabled: false, questions: [] },
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export function getEmailPageByUserEmail(_: string): EmailCollectionPageData | null { throw new Error('Use async getEmailPageByUserEmailAsync()'); }
export async function getEmailPageByUserEmailAsync(userEmail: string): Promise<EmailCollectionPageData | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('email_collection_pages')
    .select('*')
    .eq('user_email', userEmail)
    .single();

  if (error) {
    console.error('Error fetching email page by user email:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    userEmail: data.user_email,
    title: data.title,
    description: data.description,
    buttonText: data.button_text,
    successMessage: data.success_message,
    isActive: data.is_active,
    collectName: data.collect_name,
    customFields: data.custom_fields || [],
    qualificationForm: data.qualification_form || { enabled: false, questions: [] },
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export function createEmailPage(_: Omit<EmailCollectionPageData, 'id' | 'createdAt' | 'updatedAt'>): EmailCollectionPageData { throw new Error('Use async createEmailPageAsync()'); }
export async function createEmailPageAsync(pageData: Omit<EmailCollectionPageData, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailCollectionPageData> {
  // Check if a page already exists for this user
  const existingPage = await getEmailPageByUserEmailAsync(pageData.userEmail);
  if (existingPage) {
    console.log(`Email page already exists for user: ${pageData.userEmail}`);
    return existingPage;
  }

  const supabase = createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('email_collection_pages')
    .insert({
      user_email: pageData.userEmail,
      title: pageData.title,
      description: pageData.description,
      button_text: pageData.buttonText,
      success_message: pageData.successMessage,
      is_active: pageData.isActive,
      collect_name: pageData.collectName,
      custom_fields: pageData.customFields || [],
      qualification_form: pageData.qualificationForm || { enabled: false, questions: [] }
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating email page:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to create email page: ${error.message || 'Unknown error'}`);
  }
  
  if (!data) {
    console.error('No data returned from Supabase insert');
    throw new Error('Failed to create email page: No data returned');
  }

  return {
    id: data.id,
    userEmail: data.user_email,
    title: data.title,
    description: data.description,
    buttonText: data.button_text,
    successMessage: data.success_message,
    isActive: data.is_active,
    collectName: data.collect_name,
    customFields: data.custom_fields || [],
    qualificationForm: data.qualification_form || { enabled: false, questions: [] },
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export function updateEmailPage(_: string, __: Partial<Omit<EmailCollectionPageData, 'id' | 'createdAt'>>): EmailCollectionPageData | null { throw new Error('Use async updateEmailPageAsync()'); }
export async function updateEmailPageAsync(id: string, updates: Partial<Omit<EmailCollectionPageData, 'id' | 'createdAt'>>, userEmail: string): Promise<EmailCollectionPageData | null> {
  const supabase = createSupabaseServerClient();
  
  const updateData: any = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.buttonText !== undefined) updateData.button_text = updates.buttonText;
  if (updates.successMessage !== undefined) updateData.success_message = updates.successMessage;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.collectName !== undefined) updateData.collect_name = updates.collectName;
  if (updates.customFields !== undefined) updateData.custom_fields = updates.customFields;
  if (updates.qualificationForm !== undefined) updateData.qualification_form = updates.qualificationForm;
  
  const { data, error } = await supabase
    .from('email_collection_pages')
    .update(updateData)
    .eq('id', id)
    .eq('user_email', userEmail)
    .select()
    .single();

  if (error) {
    console.error('Error updating email page:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    userEmail: data.user_email,
    title: data.title,
    description: data.description,
    buttonText: data.button_text,
    successMessage: data.success_message,
    isActive: data.is_active,
    collectName: data.collect_name,
    customFields: data.custom_fields || [],
    qualificationForm: data.qualification_form || { enabled: false, questions: [] },
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export function deleteEmailPage(_: string): boolean { throw new Error('Use async deleteEmailPageAsync()'); }
export async function deleteEmailPageAsync(id: string, userEmail: string): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  
  const { error } = await supabase
    .from('email_collection_pages')
    .delete()
    .eq('id', id)
    .eq('user_email', userEmail);

  if (error) {
    console.error('Error deleting email page:', error);
    return false;
  }

  return true;
}

// Template management functions
export async function getTemplatesAsync(): Promise<TemplateData[]> {
  return kvGet<TemplateData[]>('templates', () => []);
}

export function getTemplates(): TemplateData[] { throw new Error('Use async getTemplatesAsync()'); }
export async function saveTemplatesAsync(templates: TemplateData[]): Promise<void> {
  await kvSet('templates', templates);
}

export function saveTemplates(_: TemplateData[]): void { throw new Error('Use async saveTemplatesAsync()'); }
export function getUserTemplates(_: string): TemplateData[] { throw new Error('Use async getUserTemplatesAsync()'); }
export async function getUserTemplatesAsync(email: string): Promise<TemplateData[]> {
  const templates = await getTemplatesAsync();
  return templates.filter(template => template.userEmail === email);
}

export function getTemplateById(_: string): TemplateData | null { throw new Error('Use async getTemplateByIdAsync()'); }
export async function getTemplateByIdAsync(id: string, userEmail: string): Promise<TemplateData | null> {
  const templates = await getTemplatesAsync();
  return templates.find(template => template.id === id && template.userEmail === userEmail) || null;
}

export function createTemplate(_: Omit<TemplateData, 'id' | 'createdAt' | 'updatedAt'>): TemplateData { throw new Error('Use async createTemplateAsync()'); }
export async function createTemplateAsync(templateData: Omit<TemplateData, 'id' | 'createdAt' | 'updatedAt'>): Promise<TemplateData> {
  const templates = await getTemplatesAsync();
  const now = new Date().toISOString();
  const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newTemplate: TemplateData = {
    ...templateData,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  templates.push(newTemplate);
  await saveTemplatesAsync(templates);
  return newTemplate;
}

export function updateTemplate(_: string, __: Partial<Omit<TemplateData, 'id' | 'createdAt'>>): TemplateData | null { throw new Error('Use async updateTemplateAsync()'); }
export async function updateTemplateAsync(id: string, updates: Partial<Omit<TemplateData, 'id' | 'createdAt'>>, userEmail: string): Promise<TemplateData | null> {
  const templates = await getTemplatesAsync();
  const templateIndex = templates.findIndex(template => template.id === id && template.userEmail === userEmail);
  
  if (templateIndex >= 0) {
    templates[templateIndex] = {
      ...templates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await saveTemplatesAsync(templates);
    return templates[templateIndex];
  }
  
  return null;
}

export function deleteTemplate(_: string): boolean { throw new Error('Use async deleteTemplateAsync()'); }
export async function deleteTemplateAsync(id: string, userEmail: string): Promise<boolean> {
  const templates = await getTemplatesAsync();
  const templateIndex = templates.findIndex(template => template.id === id && template.userEmail === userEmail);
  
  if (templateIndex >= 0) {
    templates.splice(templateIndex, 1);
    await saveTemplatesAsync(templates);
    return true;
  }
  
  return false;
}

// Helper function to get folder structure with documents
export function getFolderStructure(email: string, parentFolderId?: string): {
  folders: FolderData[];
  documents: DocumentData[];
} {
  const folders = getUserFolders(email, parentFolderId);
  const documents = getUserDocuments(email, parentFolderId);
  return { folders, documents };
}

// New simplified email collection functions with user separation
export async function getCollectedEmailsAsync(): Promise<CollectedEmail[]> {
  return kvGet<CollectedEmail[]>('collected-emails', () => []);
}

export async function saveCollectedEmailsAsync(emails: CollectedEmail[]): Promise<void> {
  await kvSet('collected-emails', emails);
}

// User-specific email collection functions
export async function getUserCollectedEmailsDirectAsync(userEmail: string): Promise<CollectedEmail[]> {
  const userKey = `collected-emails:${userEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
  return kvGet<CollectedEmail[]>(userKey, () => []);
}

export async function saveUserCollectedEmailsAsync(userEmail: string, emails: CollectedEmail[]): Promise<void> {
  const userKey = `collected-emails:${userEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
  await kvSet(userKey, emails);
}

export async function getUserCollectedEmailsAsync(userEmail: string): Promise<CollectedEmail[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('collected_emails')
    .select('*')
    .eq('user_email', userEmail)
    .order('collected_at', { ascending: false });

  if (error) {
    console.error('Error fetching collected emails:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    userEmail: item.user_email,
    email: item.email,
    name: item.name,
    collectedAt: item.collected_at,
    source: item.source || 'collection-page',
    customFields: item.custom_data || {},
    ipAddress: item.ip_address,
    leadMagnetId: item.lead_magnet_id,
    preferences: item.preferences
  }));
}

export async function addCollectedEmailAsync(emailData: Omit<CollectedEmail, 'id' | 'collectedAt'>): Promise<CollectedEmail> {
  const supabase = createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('collected_emails')
    .insert({
      user_email: emailData.userEmail,
      email: emailData.email,
      name: emailData.name || null,
      source: emailData.source || 'collection-page',
      custom_data: emailData.customFields || {},
      ip_address: emailData.ipAddress,
      lead_magnet_id: emailData.leadMagnetId,
      preferences: emailData.preferences
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding collected email:', error);
    throw new Error('Failed to add collected email');
  }

  return {
    id: data.id,
    userEmail: data.user_email,
    email: data.email,
    name: data.name,
    collectedAt: data.collected_at,
    source: data.source || 'collection-page',
    customFields: data.custom_data || {},
    ipAddress: data.ip_address,
    leadMagnetId: data.lead_magnet_id,
    preferences: data.preferences
  };
}

export async function deleteCollectedEmailAsync(id: string, userEmail: string): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  
  const { error } = await supabase
    .from('collected_emails')
    .delete()
    .eq('id', id)
    .eq('user_email', userEmail);

  if (error) {
    console.error('Error deleting collected email:', error);
    return false;
  }

  return true;
}

// User page settings functions
export async function getUserPageSettingsAsync(): Promise<UserPageSettings[]> {
  return kvGet<UserPageSettings[]>('user-page-settings', () => []);
}

export async function saveUserPageSettingsAsync(settings: UserPageSettings[]): Promise<void> {
  await kvSet('user-page-settings', settings);
}

export async function getUserPageSettingsByEmailAsync(userEmail: string): Promise<UserPageSettings | null> {
  try {
    const supabase = createSupabaseServerClient();
    const target = (userEmail || '').toLowerCase();
    
    const { data, error } = await supabase
      .from('user_page_settings')
      .select('*')
      .eq('user_email', target)
      .single();
    
    if (error) {
      console.log('[getUserPageSettingsByEmailAsync] No settings found for user:', target);
      return null;
    }
    
    // Map Supabase fields to UserPageSettings interface
    return {
      userEmail: data.user_email,
      title: data.title,
      description: data.description,
      callToActionText: data.button_text,
      successMessage: data.success_message,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('[getUserPageSettingsByEmailAsync] Error:', error);
    return null;
  }
}

export async function createOrUpdateUserPageSettingsAsync(settingsData: Omit<UserPageSettings, 'createdAt' | 'updatedAt'>): Promise<UserPageSettings> {
  const settings = await getUserPageSettingsAsync();
  const emailLower = (settingsData.userEmail || '').toLowerCase();
  const existingIndex = settings.findIndex(s => (s.userEmail || '').toLowerCase() === emailLower);
  
  const now = new Date().toISOString();
  
  if (existingIndex >= 0) {
    // Update existing settings
    settings[existingIndex] = {
      ...settings[existingIndex],
      ...settingsData,
      userEmail: emailLower,
      updatedAt: now,
    };
    await saveUserPageSettingsAsync(settings);
    return settings[existingIndex];
  } else {
    // Create new settings with defaults
    const newSettings: UserPageSettings = {
      ...settingsData,
      userEmail: emailLower,
      title: settingsData.title || 'Únete a nuestra lista de correo',
      description: settingsData.description || 'Recibe las últimas actualizaciones y contenido exclusivo directamente en tu bandeja de entrada.',
      callToActionText: settingsData.callToActionText || 'Suscribirse',
      successMessage: settingsData.successMessage || '¡Gracias por suscribirte! Te enviaremos contenido valioso muy pronto.',
      isActive: settingsData.isActive !== undefined ? settingsData.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    
    settings.push(newSettings);
    await saveUserPageSettingsAsync(settings);
    return newSettings;
  }
}

export async function deleteUserPageSettingsAsync(userEmail: string): Promise<boolean> {
  const settings = await getUserPageSettingsAsync();
  const settingIndex = settings.findIndex(setting => setting.userEmail === userEmail);
  
  if (settingIndex >= 0) {
    settings.splice(settingIndex, 1);
    await saveUserPageSettingsAsync(settings);
    return true;
  }
  
  return false;
}

// Auto-create page settings when user registers
export async function createDefaultPageSettingsForUserAsync(userEmail: string): Promise<UserPageSettings> {
  // Check directly in settings array to avoid infinite recursion
  const settings = await getUserPageSettingsAsync();
  const target = (userEmail || '').toLowerCase();
  const existingSettings = settings.find(setting => (setting.userEmail || '').toLowerCase() === target);
  
  if (existingSettings) {
    return existingSettings;
  }
  
  return await createOrUpdateUserPageSettingsAsync({
    userEmail: target,
    title: 'Únete a nuestra lista de correo',
    description: 'Recibe las últimas actualizaciones y contenido exclusivo directamente en tu bandeja de entrada.',
    callToActionText: 'Suscribirse',
    successMessage: '¡Gracias por suscribirte! Te enviaremos contenido valioso muy pronto.',
    isActive: true,
  });
}

// Lead Magnet management functions - using KV storage only

export async function getLeadMagnetsAsync(): Promise<LeadMagnet[]> {
  return kvGet<LeadMagnet[]>('lead-magnets', () => []);
}

export async function saveLeadMagnetsAsync(leadMagnets: LeadMagnet[]): Promise<void> {
  await kvSet('lead-magnets', leadMagnets);
}

export async function getUserLeadMagnetsAsync(userEmail: string): Promise<LeadMagnet[]> {
  const leadMagnets = await getLeadMagnetsAsync();
  return leadMagnets.filter(magnet => magnet.userEmail === userEmail);
}

export async function getLeadMagnetByIdAsync(id: string): Promise<LeadMagnet | null> {
  const leadMagnets = await getLeadMagnetsAsync();
  return leadMagnets.find(magnet => magnet.id === id) || null;
}

export async function createLeadMagnetAsync(magnetData: Omit<LeadMagnet, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount'>): Promise<LeadMagnet> {
  const leadMagnets = await getLeadMagnetsAsync();
  const now = new Date().toISOString();
  const id = `magnet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newMagnet: LeadMagnet = {
    ...magnetData,
    id,
    downloadCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  
  leadMagnets.push(newMagnet);
  await saveLeadMagnetsAsync(leadMagnets);
  return newMagnet;
}

export async function updateLeadMagnetAsync(id: string, updates: Partial<Omit<LeadMagnet, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LeadMagnet | null> {
  const leadMagnets = await getLeadMagnetsAsync();
  const index = leadMagnets.findIndex(magnet => magnet.id === id);
  
  if (index === -1) return null;
  
  leadMagnets[index] = {
    ...leadMagnets[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await saveLeadMagnetsAsync(leadMagnets);
  return leadMagnets[index];
}

export async function deleteLeadMagnetAsync(id: string): Promise<boolean> {
  const leadMagnets = await getLeadMagnetsAsync();
  const index = leadMagnets.findIndex(magnet => magnet.id === id);
  
  if (index === -1) return false;
  
  leadMagnets.splice(index, 1);
  await saveLeadMagnetsAsync(leadMagnets);
  return true;
}

export async function incrementLeadMagnetDownloadAsync(id: string): Promise<void> {
  const leadMagnets = await getLeadMagnetsAsync();
  const index = leadMagnets.findIndex(magnet => magnet.id === id);
  
  if (index !== -1) {
    leadMagnets[index].downloadCount++;
    leadMagnets[index].updatedAt = new Date().toISOString();
    await saveLeadMagnetsAsync(leadMagnets);
  }
}

// Email Topics management functions
export async function getEmailTopicsAsync(): Promise<EmailTopic[]> {
  return kvGet<EmailTopic[]>('email-topics', () => [
    { id: 'marketing', name: 'Marketing Digital', description: 'Estrategias y tips de marketing', category: 'marketing', isActive: true },
    { id: 'business', name: 'Negocios', description: 'Consejos para emprendedores', category: 'business', isActive: true },
    { id: 'technology', name: 'Tecnología', description: 'Últimas tendencias tech', category: 'technology', isActive: true },
    { id: 'design', name: 'Diseño', description: 'Tips de diseño y UX', category: 'design', isActive: true },
    { id: 'productivity', name: 'Productividad', description: 'Herramientas y técnicas', category: 'productivity', isActive: true },
  ]);
}

export async function saveEmailTopicsAsync(topics: EmailTopic[]): Promise<void> {
  await kvSet('email-topics', topics);
}

// Removed old email system interface and functions: EmailProviderConfig, updateUserEmailProviderAsync, getUserEmailProviderAsync

// Removed old email system function: clearUserEmailProviderAsync

// Async version of incrementUsage for Edge Runtime compatibility
export async function incrementUsageAsync(email: string, tool: 'escritorIA' | 'correosIA' | 'prompts'): Promise<UsageData> {
  const today = new Date().toISOString().split('T')[0];
  const usageData = await getUsageDataAsync();
  
  const existingUsageIndex = usageData.findIndex(
    usage => usage.email === email && usage.date === today
  );
  
  if (existingUsageIndex >= 0) {
    usageData[existingUsageIndex][tool]++;
  } else {
    const newUsage: UsageData = {
      email,
      date: today,
      escritorIA: 0,
      correosIA: 0,
      prompts: 0,
    };
    newUsage[tool] = 1;
    usageData.push(newUsage);
  }
  
  await saveUsageDataAsync(usageData);
  return await getTodayUsageAsync(email);
}

// Stripe subscription management functions
export async function updateUserSubscriptionAsync(email: string, subscriptionData: {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeProductId?: string;
  subscriptionPlan?: 'monthly' | 'yearly' | 'lifetime';
  subscriptionActive?: boolean;
  subscriptionCancelAtPeriodEnd?: boolean;
  subscriptionCurrentPeriodStart?: string;
  subscriptionCurrentPeriodEnd?: string;
  subscriptionCanceledAt?: string;
  subscriptionCreated?: string;
  lastPaymentStatus?: 'succeeded' | 'failed' | 'pending' | 'canceled';
  nextBillingDate?: string;
}): Promise<boolean> {
  try {
    console.log(`🔄 updateUserSubscriptionAsync: Actualizando suscripción para ${email}`);
    console.log(`📝 Datos de suscripción:`, subscriptionData);
    
    const users = await getUsersAsync();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      // Create new user if doesn't exist
      const newUser: UserData = {
        email,
        subscriptionStatus: subscriptionData.subscriptionActive ? 'pro' : 'free',
        ...subscriptionData,
        isPremium: subscriptionData.subscriptionActive || false,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      users.push(newUser);
      console.log('✅ New user created with subscription:', email);
    } else {
      // Update existing user subscription
      users[userIndex] = {
        ...users[userIndex],
        ...subscriptionData,
        subscriptionStatus: subscriptionData.subscriptionActive ? 'pro' : 'free',
        isPremium: subscriptionData.subscriptionActive || false,
        lastActiveAt: new Date().toISOString()
      };
      console.log('✅ Subscription updated for existing user:', email);
    }

    await saveUsersAsync(users);
    console.log('💾 Suscripción guardada exitosamente');
    return true;
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return false;
  }
}

export async function getUserSubscriptionAsync(email: string): Promise<{
  isActive: boolean;
  plan?: 'monthly' | 'yearly' | 'lifetime';
  isPremium: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionEndDate?: string;
  cancelAtPeriodEnd?: boolean;
  subscriptionActive?: boolean;
  subscriptionPlan?: 'monthly' | 'yearly' | 'lifetime';
  subscriptionCancelAtPeriodEnd?: boolean;
  subscriptionCurrentPeriodStart?: string;
  subscriptionCurrentPeriodEnd?: string;
  subscriptionCreated?: string;
  lastPaymentStatus?: 'succeeded' | 'failed' | 'pending' | 'canceled';
  nextBillingDate?: string;
} | null> {
  try {
    const user = await getUserByEmailAsync(email);
    if (!user) return null;

    return {
      isActive: user.subscriptionActive || false,
      plan: user.subscriptionPlan,
      isPremium: user.isPremium || false,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      subscriptionEndDate: user.subscriptionCurrentPeriodEnd,
      cancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd || false,
      subscriptionActive: user.subscriptionActive,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionCancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd,
      subscriptionCurrentPeriodStart: user.subscriptionCurrentPeriodStart,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
      subscriptionCreated: user.subscriptionCreated,
      lastPaymentStatus: user.lastPaymentStatus,
      nextBillingDate: user.nextBillingDate
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

export async function cancelUserSubscriptionAsync(email: string): Promise<boolean> {
  try {
    const users = await getUsersAsync();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) return false;

    users[userIndex] = {
      ...users[userIndex],
      subscriptionActive: false,
      subscriptionCancelAtPeriodEnd: true,
      subscriptionCanceledAt: new Date().toISOString(),
      subscriptionStatus: 'free',
      isPremium: false,
      lastActiveAt: new Date().toISOString()
    };

    await saveUsersAsync(users);
    return true;
  } catch (error) {
    console.error('Error canceling user subscription:', error);
    return false;
  }
}

// Function for middleware subscription check
export async function getUserSubscriptionData(email: string): Promise<{
  isActive: boolean;
  isPremium: boolean;
  subscriptionStatus: string;
  subscriptionPlan?: string;
} | null> {
  try {
    const user = await getUserByEmailAsync(email);
    if (!user) return null;

    return {
      isActive: user.subscriptionActive || false,
      isPremium: user.isPremium || false,
      subscriptionStatus: user.subscriptionStatus || 'free',
      subscriptionPlan: user.subscriptionPlan
    };
  } catch (error) {
    console.error('Error getting user subscription data:', error);
    return null;
  }
}