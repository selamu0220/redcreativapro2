import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

const DATA_DIR = process.env.DATA_DIR
  ? process.env.DATA_DIR
  : (process.env.VERCEL ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data'));

// Read path from bundle (read-only in serverless). Write path may be /tmp in Vercel.
const READ_DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const USERS_FILE_READ = path.join(READ_DATA_DIR, 'users.json');
const USAGE_FILE = path.join(DATA_DIR, 'usage.json');
const USAGE_FILE_READ = path.join(READ_DATA_DIR, 'usage.json');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
const DOCUMENTS_FILE_READ = path.join(READ_DATA_DIR, 'documents.json');
const FOLDERS_FILE = path.join(DATA_DIR, 'folders.json');
const FOLDERS_FILE_READ = path.join(READ_DATA_DIR, 'folders.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const CONTACTS_FILE_READ = path.join(READ_DATA_DIR, 'contacts.json');

const EMAIL_PAGES_FILE = path.join(DATA_DIR, 'email-pages.json');
const EMAIL_PAGES_FILE_READ = path.join(READ_DATA_DIR, 'email-pages.json');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
const TEMPLATES_FILE_READ = path.join(READ_DATA_DIR, 'templates.json');

// New simplified data files
const COLLECTED_EMAILS_FILE = path.join(DATA_DIR, 'collected-emails.json');
const COLLECTED_EMAILS_FILE_READ = path.join(READ_DATA_DIR, 'collected-emails.json');
const USER_PAGE_SETTINGS_FILE = path.join(DATA_DIR, 'user-page-settings.json');
const USER_PAGE_SETTINGS_FILE_READ = path.join(READ_DATA_DIR, 'user-page-settings.json');

// Ensure data directory exists (fallback local FS)
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Web3Forms settings management (simple email notifications)
// Web3Forms doesn't require user-specific settings, just a global access key

// Helpers KV
const hasKV = !!process.env.KV_URL || !!process.env.KV_REST_API_URL;

async function kvGet<T>(key: string, fallback: () => T): Promise<T> {
  try {
    if (!hasKV) return fallback();
    const value = await kv.get<T>(key);
    return (value as T) ?? fallback();
  } catch {
    return fallback();
  }
}

async function kvSet<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  try {
    if (!hasKV) return;
    await kv.set(key, value, ttlSeconds ? { ex: ttlSeconds } : undefined);
  } catch {
    // ignore
  }
}

export interface UserData {
  email: string;
  subscriptionStatus: 'free' | 'trial' | 'pro' | 'premium';
  subscriptionId?: string;
  customerId?: string;
  trialStartDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  aiStudioApiKey?: string;
  gmailUser?: string;
  gmailPassword?: string;
  gmailConfigNotified?: boolean; // Para rastrear si ya se notificó sobre configurar Gmail
  // Nuevas propiedades para proveedores de email
  emailProvider?: 'gmail' | 'web3forms' | 'resend';
  emailProviderConfig?: {
    gmailUser?: string;
    gmailPassword?: string;
    web3formsKey?: string;
    senderEmail?: string;
    resendApiKey?: string;
    resendFromEmail?: string;
  };
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
  // Web3Forms integration
  web3formsAccessKey?: string;
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
  return kvGet<UserData[]>('users', () => {
    try {
      const pathToRead = fs.existsSync(USERS_FILE) ? USERS_FILE : USERS_FILE_READ;
      if (!fs.existsSync(pathToRead)) return [];
      const data = fs.readFileSync(pathToRead, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  });
}

export function saveUsers(users: UserData[]): void { throw new Error('Use async saveUsersAsync()'); }
export async function saveUsersAsync(users: UserData[]): Promise<void> {
  await kvSet('users', users);
  try { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); } catch {}
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
      gmailUser: userData.gmailUser,
      gmailPassword: userData.gmailPassword,
      gmailConfigNotified: userData.gmailConfigNotified || false,
    };
    // Auto-create default page settings for new user
    await createDefaultPageSettingsForUserAsync(userData.email);
    
    return newUser;
  }
}

// Usage management functions
export function getUsageData(): UsageData[] {
  try {
    if (!fs.existsSync(USAGE_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading usage file:', error);
    return [];
  }
}

export function saveUsageData(usageData: UsageData[]): void {
  try {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(usageData, null, 2));
  } catch (error) {
    console.error('Error saving usage file:', error);
  }
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
  const userIndex = users.findIndex(user => user.email === email);
  
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
  const userIndex = users.findIndex(user => user.email === email);
  
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

// Gmail credentials management functions
export function updateUserGmailCredentials(email: string, gmailUser: string, gmailPassword: string): boolean { throw new Error('Use async updateUserGmailCredentialsAsync()'); }
export async function updateUserGmailCredentialsAsync(email: string, gmailUser: string, gmailPassword: string): Promise<boolean> {
  try {
    const users = await getUsersAsync();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      // Create new user if doesn't exist
      const newUser: UserData = {
        email,
        subscriptionStatus: 'free',
        gmailUser,
        gmailPassword,
        gmailConfigNotified: false, // Reset notification status when credentials are set
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      users.push(newUser);
    } else {
      // Update existing user
      users[userIndex].gmailUser = gmailUser;
      users[userIndex].gmailPassword = gmailPassword;
      users[userIndex].gmailConfigNotified = false; // Reset notification status when credentials are updated
      users[userIndex].lastActiveAt = new Date().toISOString();
    }
    
    await saveUsersAsync(users);
    return true;
  } catch (error) {
    console.error('Error updating Gmail credentials:', error);
    return false;
  }
}

export function getUserGmailCredentials(email: string): { gmailUser: string; gmailPassword: string } | null { throw new Error('Use async getUserGmailCredentialsAsync()'); }
export async function getUserGmailCredentialsAsync(email: string): Promise<{ gmailUser: string; gmailPassword: string } | null> {
  try {
    const user = await getUserByEmailAsync(email);
    if (user && user.gmailUser && user.gmailPassword) {
      return {
        gmailUser: user.gmailUser,
        gmailPassword: user.gmailPassword
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting Gmail credentials:', error);
    return null;
  }
}

// Marcar que el usuario ya fue notificado sobre configurar Gmail
export function markGmailConfigNotified(email: string): boolean { throw new Error('Use async markGmailConfigNotifiedAsync()'); }
export async function markGmailConfigNotifiedAsync(email: string): Promise<boolean> {
  try {
    const users = await getUsersAsync();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      // Crear nuevo usuario si no existe
      const newUser: UserData = {
        email,
        subscriptionStatus: 'free',
        gmailConfigNotified: true,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      users.push(newUser);
    } else {
      // Actualizar usuario existente
      users[userIndex].gmailConfigNotified = true;
      users[userIndex].lastActiveAt = new Date().toISOString();
    }
    
    await saveUsersAsync(users);
    return true;
  } catch (error) {
    console.error('Error marking Gmail config notified:', error);
    return false;
  }
}

// Verificar si el usuario necesita ser notificado sobre configurar Gmail
export function shouldNotifyGmailConfig(email: string): boolean { throw new Error('Use async shouldNotifyGmailConfigAsync()'); }
export async function shouldNotifyGmailConfigAsync(email: string): Promise<boolean> {
  try {
    const user = await getUserByEmailAsync(email);
    if (!user) {
      return true; // Usuario nuevo, debe ser notificado
    }
    
    // Si ya tiene credenciales configuradas, no notificar
    if (user.gmailUser && user.gmailPassword) {
      return false;
    }
    
    // Si ya fue notificado anteriormente, no volver a notificar
    if (user.gmailConfigNotified) {
      return false;
    }
    
    return true; // Debe ser notificado
  } catch (error) {
    console.error('Error checking Gmail config notification:', error);
    return false;
  }
}

// Document management functions
export function getDocuments(): DocumentData[] {
  try {
    if (!fs.existsSync(DOCUMENTS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DOCUMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading documents file:', error);
    return [];
  }
}

export function saveDocuments(documents: DocumentData[]): void {
  try {
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(documents, null, 2));
  } catch (error) {
    console.error('Error saving documents file:', error);
  }
}

export async function getDocumentsAsync(): Promise<DocumentData[]> {
  return kvGet<DocumentData[]>('documents', () => {
    try {
      if (!fs.existsSync(DOCUMENTS_FILE)) {
        return [];
      }
      const data = fs.readFileSync(DOCUMENTS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading documents file:', error);
      return [];
    }
  });
}

export async function saveDocumentsAsync(documents: DocumentData[]): Promise<void> {
  await kvSet('documents', documents);
  try {
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(documents, null, 2));
  } catch (error) {
    console.error('Error saving documents file:', error);
  }
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

// Folder management functions
export function getFolders(): FolderData[] {
  try {
    if (!fs.existsSync(FOLDERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(FOLDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading folders file:', error);
    return [];
  }
}

export function saveFolders(folders: FolderData[]): void {
  try {
    fs.writeFileSync(FOLDERS_FILE, JSON.stringify(folders, null, 2));
  } catch (error) {
    console.error('Error saving folders file:', error);
  }
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
  return kvGet<ContactData[]>('contacts', () => {
    try {
      const pathToRead = fs.existsSync(CONTACTS_FILE) ? CONTACTS_FILE : CONTACTS_FILE_READ;
      if (!fs.existsSync(pathToRead)) return [];
      const data = fs.readFileSync(pathToRead, 'utf8');
      return JSON.parse(data);
    } catch { return []; }
  });
}

export function saveContacts(_: ContactData[]): void { throw new Error('Use async saveContactsAsync()'); }
export async function saveContactsAsync(contacts: ContactData[]): Promise<void> {
  await kvSet('contacts', contacts);
  try { fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2)); } catch {}
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



// Email collection page management functions
export async function getEmailPagesAsync(): Promise<Record<string, EmailCollectionPageData[]>> {
  return kvGet<Record<string, EmailCollectionPageData[]>>('email-pages', () => {
    try {
      const pathToRead = fs.existsSync(EMAIL_PAGES_FILE) ? EMAIL_PAGES_FILE : EMAIL_PAGES_FILE_READ;
      if (!fs.existsSync(pathToRead)) return {}; // Return empty object instead of empty array
      const data = fs.readFileSync(pathToRead, 'utf8');
      const parsedData = JSON.parse(data);
      // Ensure it's an object, if it was an array, convert it (for migration)
      if (Array.isArray(parsedData)) {
        const migratedData: Record<string, EmailCollectionPageData[]> = {};
        parsedData.forEach(page => {
          if (page.userEmail) {
            if (!migratedData[page.userEmail]) {
              migratedData[page.userEmail] = [];
            }
            migratedData[page.userEmail].push(page);
          } else {
            // Handle pages without userEmail, perhaps assign to a default user or log
            console.warn('Page found without userEmail, skipping migration:', page);
          }
        });
        return migratedData;
      }
      return parsedData; // Already an object
    } catch { return {}; } // Return empty object on error
  });
}

export function getEmailPages(): EmailCollectionPageData[] { throw new Error('Use async getEmailPagesAsync()'); }
export async function saveEmailPagesAsync(pagesByEmail: Record<string, EmailCollectionPageData[]>): Promise<void> {
  await kvSet('email-pages', pagesByEmail);
  try { fs.writeFileSync(EMAIL_PAGES_FILE, JSON.stringify(pagesByEmail, null, 2)); } catch {}
}

export function saveEmailPages(_: EmailCollectionPageData[]): void { throw new Error('Use async saveEmailPagesAsync()'); }
export function getUserEmailPages(_: string): EmailCollectionPageData[] { throw new Error('Use async getUserEmailPagesAsync()'); }
export async function getUserEmailPagesAsync(email: string): Promise<EmailCollectionPageData[]> {
  const allPages = await getEmailPagesAsync();
  return allPages[email] || [];
}

export function getEmailPageById(_: string): EmailCollectionPageData | null { throw new Error('Use async getEmailPageByIdAsync()'); }
export async function getEmailPageByIdAsync(id: string, userEmail: string): Promise<EmailCollectionPageData | null> {
  const allPagesByUser = await getEmailPagesAsync();
  const userPages = allPagesByUser[userEmail] || [];
  return userPages.find(page => page.id === id) || null;
}

export function createEmailPage(_: Omit<EmailCollectionPageData, 'id' | 'createdAt' | 'updatedAt'>): EmailCollectionPageData { throw new Error('Use async createEmailPageAsync()'); }
export async function createEmailPageAsync(pageData: Omit<EmailCollectionPageData, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailCollectionPageData> {
  const allPages = await getEmailPagesAsync(); // Get the entire object of pages
  const now = new Date().toISOString();
  const id = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const newPage: EmailCollectionPageData = {
    ...pageData,
    id,
    createdAt: now,
    updatedAt: now,
  };

  // Ensure the user's array exists
  if (!allPages[newPage.userEmail]) {
    allPages[newPage.userEmail] = [];
  }

  allPages[newPage.userEmail].push(newPage); // Add to the specific user's array
  await saveEmailPagesAsync(allPages); // Save the entire modified object
  return newPage;
}

export function updateEmailPage(_: string, __: Partial<Omit<EmailCollectionPageData, 'id' | 'createdAt'>>): EmailCollectionPageData | null { throw new Error('Use async updateEmailPageAsync()'); }
export async function updateEmailPageAsync(id: string, updates: Partial<Omit<EmailCollectionPageData, 'id' | 'createdAt'>>, userEmail: string): Promise<EmailCollectionPageData | null> {
  const allPages = await getEmailPagesAsync(); // Get the entire object of pages

  // Get the specific user's pages array
  const userPages = allPages[userEmail];
  if (!userPages) {
    return null; // User has no pages
  }

  const pageIndex = userPages.findIndex(page => page.id === id); // Find page within user's array

  if (pageIndex >= 0) {
    userPages[pageIndex] = {
      ...userPages[pageIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    allPages[userEmail] = userPages; // Update the user's array in the main object
    await saveEmailPagesAsync(allPages); // Save the entire modified object
    return userPages[pageIndex];
  }

  return null;
}

export function deleteEmailPage(_: string): boolean { throw new Error('Use async deleteEmailPageAsync()'); }
export async function deleteEmailPageAsync(id: string, userEmail: string): Promise<boolean> {
  const allPages = await getEmailPagesAsync(); // Get the entire object of pages

  // Get the specific user's pages array
  const userPages = allPages[userEmail];
  if (!userPages) {
    return false; // User has no pages, nothing to delete
  }

  const pageIndex = userPages.findIndex(page => page.id === id); // Find page within user's array

  if (pageIndex >= 0) {
    userPages.splice(pageIndex, 1); // Remove from the specific user's array
    allPages[userEmail] = userPages; // Update the user's array in the main object
    await saveEmailPagesAsync(allPages); // Save the entire modified object
    return true;
  }

  return false;
}

// Template management functions
export async function getTemplatesAsync(): Promise<TemplateData[]> {
  return kvGet<TemplateData[]>('templates', () => {
    try {
      const pathToRead = fs.existsSync(TEMPLATES_FILE) ? TEMPLATES_FILE : TEMPLATES_FILE_READ;
      if (!fs.existsSync(pathToRead)) return [];
      const data = fs.readFileSync(pathToRead, 'utf8');
      return JSON.parse(data);
    } catch { return []; }
  });
}

export function getTemplates(): TemplateData[] { throw new Error('Use async getTemplatesAsync()'); }
export async function saveTemplatesAsync(templates: TemplateData[]): Promise<void> {
  await kvSet('templates', templates);
  try { fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2)); } catch {}
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
  return kvGet<CollectedEmail[]>('collected-emails', () => {
    try {
      const pathToRead = fs.existsSync(COLLECTED_EMAILS_FILE) ? COLLECTED_EMAILS_FILE : COLLECTED_EMAILS_FILE_READ;
      if (!fs.existsSync(pathToRead)) return [];
      const data = fs.readFileSync(pathToRead, 'utf8');
      return JSON.parse(data);
    } catch { return []; }
  });
}

export async function saveCollectedEmailsAsync(emails: CollectedEmail[]): Promise<void> {
  await kvSet('collected-emails', emails);
  try { fs.writeFileSync(COLLECTED_EMAILS_FILE, JSON.stringify(emails, null, 2)); } catch {}
}

// User-specific email collection functions
export async function getUserCollectedEmailsDirectAsync(userEmail: string): Promise<CollectedEmail[]> {
  const userKey = `collected-emails:${userEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
  return kvGet<CollectedEmail[]>(userKey, () => {
    try {
      const userFilePath = path.join(DATA_DIR, `collected-emails-${userEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.json`);
      if (!fs.existsSync(userFilePath)) return [];
      const data = fs.readFileSync(userFilePath, 'utf8');
      return JSON.parse(data);
    } catch { return []; }
  });
}

export async function saveUserCollectedEmailsAsync(userEmail: string, emails: CollectedEmail[]): Promise<void> {
  const userKey = `collected-emails:${userEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
  await kvSet(userKey, emails);
  try {
    const userFilePath = path.join(DATA_DIR, `collected-emails-${userEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.json`);
    fs.writeFileSync(userFilePath, JSON.stringify(emails, null, 2));
  } catch {}
}

export async function getUserCollectedEmailsAsync(userEmail: string): Promise<CollectedEmail[]> {
  // Use user-specific storage; if empty, self-heal from global backup
  const normalized = (userEmail || '').toLowerCase();
  let emails = await getUserCollectedEmailsDirectAsync(normalized);
  const all = await getCollectedEmailsAsync();
  const fromGlobal = all.filter(e => (e.userEmail || '').toLowerCase() === normalized);
  
  // Merge per-user and global lists (keep duplicates; avoid exact same id duplication)
  const byId = new Map<string, CollectedEmail>();
  for (const e of emails) byId.set(e.id, e);
  let added = 0;
  for (const g of fromGlobal) {
    if (!byId.has(g.id)) {
      byId.set(g.id, g);
      added++;
    }
  }
  const merged = Array.from(byId.values())
    .sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime());
  
  if (added > 0 || merged.length !== emails.length) {
    await saveUserCollectedEmailsAsync(normalized, merged);
  }
  return merged;
}

export async function addCollectedEmailAsync(emailData: Omit<CollectedEmail, 'id' | 'collectedAt'>): Promise<CollectedEmail> {
  // Use user-specific storage
  const normalizedUserEmail = (emailData.userEmail || '').toLowerCase();
  const emails = await getUserCollectedEmailsDirectAsync(normalizedUserEmail);
  const now = new Date().toISOString();
  const id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newEmail: CollectedEmail = {
    ...emailData,
    userEmail: normalizedUserEmail,
    id,
    collectedAt: now,
  };
  
  emails.push(newEmail);
  await saveUserCollectedEmailsAsync(normalizedUserEmail, emails);

  // Also append to global backup list to ensure redundancy and future self-heal
  try {
    const all = await getCollectedEmailsAsync();
    all.push(newEmail);
    await saveCollectedEmailsAsync(all);
  } catch {}
  return newEmail;
}

export async function deleteCollectedEmailAsync(id: string, userEmail: string): Promise<boolean> {
  // Use user-specific storage
  const emails = await getUserCollectedEmailsDirectAsync(userEmail);
  const emailIndex = emails.findIndex(email => email.id === id);
  
  if (emailIndex >= 0) {
    emails.splice(emailIndex, 1);
    await saveUserCollectedEmailsAsync(userEmail, emails);
    return true;
  }
  
  return false;
}

// User page settings functions
export async function getUserPageSettingsAsync(): Promise<UserPageSettings[]> {
  return kvGet<UserPageSettings[]>('user-page-settings', () => {
    try {
      const pathToRead = fs.existsSync(USER_PAGE_SETTINGS_FILE) ? USER_PAGE_SETTINGS_FILE : USER_PAGE_SETTINGS_FILE_READ;
      if (!fs.existsSync(pathToRead)) return [];
      const data = fs.readFileSync(pathToRead, 'utf8');
      return JSON.parse(data);
    } catch { return []; }
  });
}

export async function saveUserPageSettingsAsync(settings: UserPageSettings[]): Promise<void> {
  await kvSet('user-page-settings', settings);
  try { fs.writeFileSync(USER_PAGE_SETTINGS_FILE, JSON.stringify(settings, null, 2)); } catch {}
}

export async function getUserPageSettingsByEmailAsync(userEmail: string): Promise<UserPageSettings | null> {
  const settings = await getUserPageSettingsAsync();
  const target = (userEmail || '').toLowerCase();
  const found = settings.find(setting => (setting.userEmail || '').toLowerCase() === target) || null;
  if (found) return found;
  // Auto-provision default settings for this user to ensure public capture works
  try {
    const created = await createDefaultPageSettingsForUserAsync(target);
    return created;
  } catch {
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
  const existingSettings = await getUserPageSettingsByEmailAsync(userEmail);
  
  if (existingSettings) {
    return existingSettings;
  }
  
  return await createOrUpdateUserPageSettingsAsync({
    userEmail,
    title: 'Únete a nuestra lista de correo',
    description: 'Recibe las últimas actualizaciones y contenido exclusivo directamente en tu bandeja de entrada.',
    callToActionText: 'Suscribirse',
    successMessage: '¡Gracias por suscribirte! Te enviaremos contenido valioso muy pronto.',
    isActive: true,
  });
}

// Lead Magnet management functions
const LEAD_MAGNETS_FILE = path.join(DATA_DIR, 'lead-magnets.json');
const LEAD_MAGNETS_FILE_READ = path.join(READ_DATA_DIR, 'lead-magnets.json');
const EMAIL_TOPICS_FILE = path.join(DATA_DIR, 'email-topics.json');
const EMAIL_TOPICS_FILE_READ = path.join(READ_DATA_DIR, 'email-topics.json');

export async function getLeadMagnetsAsync(): Promise<LeadMagnet[]> {
  return kvGet<LeadMagnet[]>('lead-magnets', () => {
    try {
      const pathToRead = fs.existsSync(LEAD_MAGNETS_FILE) ? LEAD_MAGNETS_FILE : LEAD_MAGNETS_FILE_READ;
      if (!fs.existsSync(pathToRead)) return [];
      const data = fs.readFileSync(pathToRead, 'utf8');
      return JSON.parse(data);
    } catch { return []; }
  });
}

export async function saveLeadMagnetsAsync(leadMagnets: LeadMagnet[]): Promise<void> {
  await kvSet('lead-magnets', leadMagnets);
  try { fs.writeFileSync(LEAD_MAGNETS_FILE, JSON.stringify(leadMagnets, null, 2)); } catch {}
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
  return kvGet<EmailTopic[]>('email-topics', () => {
    try {
      const pathToRead = fs.existsSync(EMAIL_TOPICS_FILE) ? EMAIL_TOPICS_FILE : EMAIL_TOPICS_FILE_READ;
      if (!fs.existsSync(pathToRead)) {
        // Return default topics if file doesn't exist
        return [
          { id: 'marketing', name: 'Marketing Digital', description: 'Estrategias y tips de marketing', category: 'marketing', isActive: true },
          { id: 'business', name: 'Negocios', description: 'Consejos para emprendedores', category: 'business', isActive: true },
          { id: 'technology', name: 'Tecnología', description: 'Últimas tendencias tech', category: 'technology', isActive: true },
          { id: 'design', name: 'Diseño', description: 'Tips de diseño y UX', category: 'design', isActive: true },
          { id: 'productivity', name: 'Productividad', description: 'Herramientas y técnicas', category: 'productivity', isActive: true },
        ];
      }
      const data = fs.readFileSync(pathToRead, 'utf8');
      return JSON.parse(data);
    } catch { 
      return [
        { id: 'marketing', name: 'Marketing Digital', description: 'Estrategias y tips de marketing', category: 'marketing', isActive: true },
        { id: 'business', name: 'Negocios', description: 'Consejos para emprendedores', category: 'business', isActive: true },
        { id: 'technology', name: 'Tecnología', description: 'Últimas tendencias tech', category: 'technology', isActive: true },
        { id: 'design', name: 'Diseño', description: 'Tips de diseño y UX', category: 'design', isActive: true },
        { id: 'productivity', name: 'Productividad', description: 'Herramientas y técnicas', category: 'productivity', isActive: true },
      ];
    }
  });
}

export async function saveEmailTopicsAsync(topics: EmailTopic[]): Promise<void> {
  await kvSet('email-topics', topics);
  try { fs.writeFileSync(EMAIL_TOPICS_FILE, JSON.stringify(topics, null, 2)); } catch {}
}

// Email provider configuration management functions
export interface EmailProviderConfig {
  provider: 'gmail' | 'web3forms' | 'resend';
  config: {
    // Gmail
    gmailUser?: string;
    gmailPassword?: string;
    // Web3Forms
    web3formsKey?: string;
    senderEmail?: string;
    // Resend
    resendApiKey?: string;
    resendFromEmail?: string;
  };
}

export async function updateUserEmailProviderAsync(email: string, providerConfig: EmailProviderConfig): Promise<boolean> {
  try {
    const users = await getUsersAsync();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      console.error('User not found for email provider update:', email);
      return false;
    }

    // Update user with email provider configuration
    users[userIndex] = {
      ...users[userIndex],
      emailProvider: providerConfig.provider,
      emailProviderConfig: providerConfig.config,
      lastActiveAt: new Date().toISOString()
    };

    await kvSet('users', users);
    console.log('✅ Email provider configuration updated successfully for:', email);
    return true;
  } catch (error) {
    console.error('Error updating email provider configuration:', error);
    return false;
  }
}

export async function getUserEmailProviderAsync(email: string): Promise<EmailProviderConfig | null> {
  try {
    const user = await getUserByEmailAsync(email);
    
    if (!user) {
      return null;
    }

    // Return email provider configuration or default to Gmail
    return {
      provider: (user as any).emailProvider || 'gmail',
      config: (user as any).emailProviderConfig || {}
    };
  } catch (error) {
    console.error('Error getting email provider configuration:', error);
    return null;
  }
}