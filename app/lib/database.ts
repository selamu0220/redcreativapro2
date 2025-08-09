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

// Ensure data directory exists (fallback local FS)
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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
  return users.find(user => user.email === email) || null;
}

export function createOrUpdateUser(_: Partial<UserData> & { email: string }): UserData { throw new Error('Use async createOrUpdateUserAsync()'); }
export async function createOrUpdateUserAsync(userData: Partial<UserData> & { email: string }): Promise<UserData> {
  const users = await getUsersAsync();
  const existingUserIndex = users.findIndex(user => user.email === userData.email);
  
  const now = new Date().toISOString();
  
  if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex] = {
      ...users[existingUserIndex],
      ...userData,
      lastActiveAt: now,
    };
    await saveUsersAsync(users);
    return users[existingUserIndex];
  } else {
    // Create new user with 7-day trial
    const newUser: UserData = {
      subscriptionStatus: 'trial',
      trialStartDate: now,
      createdAt: now,
      lastActiveAt: now,
      ...userData,
      email: userData.email,
    };
    users.push(newUser);
    await saveUsersAsync(users);
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

export function updateUserSubscriptionStatus(email: string, status: UserData['subscriptionStatus'], subscriptionData?: Partial<UserData>): UserData | null {
  const users = getUsers();
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
    
    saveUsers(users);
    return users[userIndex];
  }
  
  return null;
}

export function updateUserAiStudioApiKey(email: string, apiKey: string): UserData | null {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.email === email);
  
  if (userIndex >= 0) {
    users[userIndex] = {
      ...users[userIndex],
      aiStudioApiKey: apiKey,
      lastActiveAt: new Date().toISOString(),
    };
    
    saveUsers(users);
    return users[userIndex];
  }
  
  return null;
}

export function getUserAiStudioApiKey(email: string): string | null {
  const user = getUserByEmail(email);
  return user?.aiStudioApiKey || null;
}

// Admin management functions
const ADMIN_EMAILS = ['selamu.garcia@gmail.com'];

export function isAdminUser(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function hasUnlimitedAccess(email: string): boolean {
  return isAdminUser(email);
}

// Gmail credentials management functions
export function updateUserGmailCredentials(email: string, gmailUser: string, gmailPassword: string): boolean {
  try {
    const users = getUsers();
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
    
    saveUsers(users);
    return true;
  } catch (error) {
    console.error('Error updating Gmail credentials:', error);
    return false;
  }
}

export function getUserGmailCredentials(email: string): { gmailUser: string; gmailPassword: string } | null {
  try {
    const user = getUserByEmail(email);
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
export function markGmailConfigNotified(email: string): boolean {
  try {
    const users = getUsers();
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
    
    saveUsers(users);
    return true;
  } catch (error) {
    console.error('Error marking Gmail config notified:', error);
    return false;
  }
}

// Verificar si el usuario necesita ser notificado sobre configurar Gmail
export function shouldNotifyGmailConfig(email: string): boolean {
  try {
    const user = getUserByEmail(email);
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

export function getUserDocuments(email: string, folderId?: string): DocumentData[] {
  const documents = getDocuments();
  return documents.filter(doc => 
    doc.userEmail === email && 
    (folderId === undefined || doc.folderId === folderId)
  );
}

export function getDocumentById(id: string): DocumentData | null {
  const documents = getDocuments();
  return documents.find(doc => doc.id === id) || null;
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

export function updateDocument(id: string, updates: Partial<Omit<DocumentData, 'id' | 'createdAt'>>): DocumentData | null {
  const documents = getDocuments();
  const documentIndex = documents.findIndex(doc => doc.id === id);
  
  if (documentIndex >= 0) {
    documents[documentIndex] = {
      ...documents[documentIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDocuments(documents);
    return documents[documentIndex];
  }
  
  return null;
}

export function deleteDocument(id: string): boolean {
  const documents = getDocuments();
  const documentIndex = documents.findIndex(doc => doc.id === id);
  
  if (documentIndex >= 0) {
    documents.splice(documentIndex, 1);
    saveDocuments(documents);
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

export function getFolderById(id: string): FolderData | null {
  const folders = getFolders();
  return folders.find(folder => folder.id === id) || null;
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

export function updateFolder(id: string, updates: Partial<Omit<FolderData, 'id' | 'createdAt'>>): FolderData | null {
  const folders = getFolders();
  const folderIndex = folders.findIndex(folder => folder.id === id);
  
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

export function deleteFolder(id: string): boolean {
  const folders = getFolders();
  const folderIndex = folders.findIndex(folder => folder.id === id);
  
  if (folderIndex >= 0) {
    // Also delete all documents in this folder
    const documents = getDocuments();
    const updatedDocuments = documents.filter(doc => doc.folderId !== id);
    saveDocuments(updatedDocuments);
    
    // Delete all subfolders recursively
    const subfolders = folders.filter(folder => folder.parentFolderId === id);
    subfolders.forEach(subfolder => deleteFolder(subfolder.id));
    
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

export function getContactById(id: string): ContactData | null {
  throw new Error('Use async getContactByIdAsync()');
}

export async function getContactByIdAsync(id: string): Promise<ContactData | null> {
  const contacts = await getContactsAsync();
  return contacts.find(contact => contact.id === id) || null;
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
export async function updateContactAsync(id: string, updates: Partial<Omit<ContactData, 'id' | 'createdAt'>>): Promise<ContactData | null> {
  const contacts = await getContactsAsync();
  const contactIndex = contacts.findIndex(contact => contact.id === id);
  
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
export async function deleteContactAsync(id: string): Promise<boolean> {
  const contacts = await getContactsAsync();
  const contactIndex = contacts.findIndex(contact => contact.id === id);
  
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
export async function getEmailPagesAsync(): Promise<EmailCollectionPageData[]> {
  return kvGet<EmailCollectionPageData[]>('email-pages', () => {
    try {
      const pathToRead = fs.existsSync(EMAIL_PAGES_FILE) ? EMAIL_PAGES_FILE : EMAIL_PAGES_FILE_READ;
      if (!fs.existsSync(pathToRead)) return [];
      const data = fs.readFileSync(pathToRead, 'utf8');
      return JSON.parse(data);
    } catch { return []; }
  });
}

export function getEmailPages(): EmailCollectionPageData[] { throw new Error('Use async getEmailPagesAsync()'); }
export async function saveEmailPagesAsync(pages: EmailCollectionPageData[]): Promise<void> {
  await kvSet('email-pages', pages);
  try { fs.writeFileSync(EMAIL_PAGES_FILE, JSON.stringify(pages, null, 2)); } catch {}
}

export function saveEmailPages(_: EmailCollectionPageData[]): void { throw new Error('Use async saveEmailPagesAsync()'); }
export function getUserEmailPages(_: string): EmailCollectionPageData[] { throw new Error('Use async getUserEmailPagesAsync()'); }
export async function getUserEmailPagesAsync(email: string): Promise<EmailCollectionPageData[]> {
  const pages = await getEmailPagesAsync();
  return pages.filter(page => page.userEmail === email);
}

export function getEmailPageById(_: string): EmailCollectionPageData | null { throw new Error('Use async getEmailPageByIdAsync()'); }
export async function getEmailPageByIdAsync(id: string): Promise<EmailCollectionPageData | null> {
  const pages = await getEmailPagesAsync();
  return pages.find(page => page.id === id) || null;
}

export function createEmailPage(_: Omit<EmailCollectionPageData, 'id' | 'createdAt' | 'updatedAt'>): EmailCollectionPageData { throw new Error('Use async createEmailPageAsync()'); }
export async function createEmailPageAsync(pageData: Omit<EmailCollectionPageData, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailCollectionPageData> {
  const pages = await getEmailPagesAsync();
  const now = new Date().toISOString();
  const id = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newPage: EmailCollectionPageData = {
    ...pageData,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  pages.push(newPage);
  await saveEmailPagesAsync(pages);
  return newPage;
}

export function updateEmailPage(_: string, __: Partial<Omit<EmailCollectionPageData, 'id' | 'createdAt'>>): EmailCollectionPageData | null { throw new Error('Use async updateEmailPageAsync()'); }
export async function updateEmailPageAsync(id: string, updates: Partial<Omit<EmailCollectionPageData, 'id' | 'createdAt'>>): Promise<EmailCollectionPageData | null> {
  const pages = await getEmailPagesAsync();
  const pageIndex = pages.findIndex(page => page.id === id);
  
  if (pageIndex >= 0) {
    pages[pageIndex] = {
      ...pages[pageIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await saveEmailPagesAsync(pages);
    return pages[pageIndex];
  }
  
  return null;
}

export function deleteEmailPage(_: string): boolean { throw new Error('Use async deleteEmailPageAsync()'); }
export async function deleteEmailPageAsync(id: string): Promise<boolean> {
  const pages = await getEmailPagesAsync();
  const pageIndex = pages.findIndex(page => page.id === id);
  
  if (pageIndex >= 0) {
    pages.splice(pageIndex, 1);
    await saveEmailPagesAsync(pages);
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
export async function getTemplateByIdAsync(id: string): Promise<TemplateData | null> {
  const templates = await getTemplatesAsync();
  return templates.find(template => template.id === id) || null;
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
export async function updateTemplateAsync(id: string, updates: Partial<Omit<TemplateData, 'id' | 'createdAt'>>): Promise<TemplateData | null> {
  const templates = await getTemplatesAsync();
  const templateIndex = templates.findIndex(template => template.id === id);
  
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
export async function deleteTemplateAsync(id: string): Promise<boolean> {
  const templates = await getTemplatesAsync();
  const templateIndex = templates.findIndex(template => template.id === id);
  
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