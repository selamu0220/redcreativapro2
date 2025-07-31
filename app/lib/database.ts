import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const USAGE_FILE = path.join(DATA_DIR, 'usage.json');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
const FOLDERS_FILE = path.join(DATA_DIR, 'folders.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');
const EMAIL_PAGES_FILE = path.join(DATA_DIR, 'email-pages.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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
  createdAt: string;
  updatedAt: string;
}

export interface CampaignData {
  id: string;
  name: string;
  subject: string;
  content: string;
  userEmail: string; // Owner of the campaign
  status: 'draft' | 'sent' | 'scheduled';
  sentAt?: string;
  scheduledAt?: string;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  unsubscribeCount: number;
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
  createdAt: string;
  updatedAt: string;
}

// User management functions
export function getUsers(): UserData[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

export function saveUsers(users: UserData[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users file:', error);
  }
}

export function getUserByEmail(email: string): UserData | null {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
}

export function createOrUpdateUser(userData: Partial<UserData> & { email: string }): UserData {
  const users = getUsers();
  const existingUserIndex = users.findIndex(user => user.email === userData.email);
  
  const now = new Date().toISOString();
  
  if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex] = {
      ...users[existingUserIndex],
      ...userData,
      lastActiveAt: now,
    };
    saveUsers(users);
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
    saveUsers(users);
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
export function getContacts(): ContactData[] {
  try {
    if (!fs.existsSync(CONTACTS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(CONTACTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading contacts file:', error);
    return [];
  }
}

export function saveContacts(contacts: ContactData[]): void {
  try {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
  } catch (error) {
    console.error('Error saving contacts file:', error);
  }
}

export function getUserContacts(email: string): ContactData[] {
  const contacts = getContacts();
  return contacts.filter(contact => contact.userEmail === email);
}

export function getContactById(id: string): ContactData | null {
  const contacts = getContacts();
  return contacts.find(contact => contact.id === id) || null;
}

export function createContact(contactData: Omit<ContactData, 'id' | 'createdAt' | 'updatedAt'>): ContactData {
  const contacts = getContacts();
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
  saveContacts(contacts);
  return newContact;
}

export function updateContact(id: string, updates: Partial<Omit<ContactData, 'id' | 'createdAt'>>): ContactData | null {
  const contacts = getContacts();
  const contactIndex = contacts.findIndex(contact => contact.id === id);
  
  if (contactIndex >= 0) {
    contacts[contactIndex] = {
      ...contacts[contactIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveContacts(contacts);
    return contacts[contactIndex];
  }
  
  return null;
}

export function deleteContact(id: string): boolean {
  const contacts = getContacts();
  const contactIndex = contacts.findIndex(contact => contact.id === id);
  
  if (contactIndex >= 0) {
    contacts.splice(contactIndex, 1);
    saveContacts(contacts);
    return true;
  }
  
  return false;
}

export function unsubscribeContact(token: string): boolean {
  const contacts = getContacts();
  const contactIndex = contacts.findIndex(contact => contact.unsubscribeToken === token);
  
  if (contactIndex >= 0) {
    contacts[contactIndex].isSubscribed = false;
    contacts[contactIndex].updatedAt = new Date().toISOString();
    saveContacts(contacts);
    return true;
  }
  
  return false;
}

// Campaign management functions
export function getCampaigns(): CampaignData[] {
  try {
    if (!fs.existsSync(CAMPAIGNS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading campaigns file:', error);
    return [];
  }
}

export function saveCampaigns(campaigns: CampaignData[]): void {
  try {
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
  } catch (error) {
    console.error('Error saving campaigns file:', error);
  }
}

export function getUserCampaigns(email: string): CampaignData[] {
  const campaigns = getCampaigns();
  return campaigns.filter(campaign => campaign.userEmail === email);
}

export function getCampaignById(id: string): CampaignData | null {
  const campaigns = getCampaigns();
  return campaigns.find(campaign => campaign.id === id) || null;
}

export function createCampaign(campaignData: Omit<CampaignData, 'id' | 'createdAt' | 'updatedAt'>): CampaignData {
  const campaigns = getCampaigns();
  const now = new Date().toISOString();
  const id = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newCampaign: CampaignData = {
    ...campaignData,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  campaigns.push(newCampaign);
  saveCampaigns(campaigns);
  return newCampaign;
}

export function updateCampaign(id: string, updates: Partial<Omit<CampaignData, 'id' | 'createdAt'>>): CampaignData | null {
  const campaigns = getCampaigns();
  const campaignIndex = campaigns.findIndex(campaign => campaign.id === id);
  
  if (campaignIndex >= 0) {
    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveCampaigns(campaigns);
    return campaigns[campaignIndex];
  }
  
  return null;
}

export function deleteCampaign(id: string): boolean {
  const campaigns = getCampaigns();
  const campaignIndex = campaigns.findIndex(campaign => campaign.id === id);
  
  if (campaignIndex >= 0) {
    campaigns.splice(campaignIndex, 1);
    saveCampaigns(campaigns);
    return true;
  }
  
  return false;
}

// Email collection page management functions
export function getEmailPages(): EmailCollectionPageData[] {
  try {
    if (!fs.existsSync(EMAIL_PAGES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(EMAIL_PAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading email pages file:', error);
    return [];
  }
}

export function saveEmailPages(pages: EmailCollectionPageData[]): void {
  try {
    fs.writeFileSync(EMAIL_PAGES_FILE, JSON.stringify(pages, null, 2));
  } catch (error) {
    console.error('Error saving email pages file:', error);
  }
}

export function getUserEmailPages(email: string): EmailCollectionPageData[] {
  const pages = getEmailPages();
  return pages.filter(page => page.userEmail === email);
}

export function getEmailPageById(id: string): EmailCollectionPageData | null {
  const pages = getEmailPages();
  return pages.find(page => page.id === id) || null;
}

export function createEmailPage(pageData: Omit<EmailCollectionPageData, 'id' | 'createdAt' | 'updatedAt'>): EmailCollectionPageData {
  const pages = getEmailPages();
  const now = new Date().toISOString();
  const id = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newPage: EmailCollectionPageData = {
    ...pageData,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  pages.push(newPage);
  saveEmailPages(pages);
  return newPage;
}

export function updateEmailPage(id: string, updates: Partial<Omit<EmailCollectionPageData, 'id' | 'createdAt'>>): EmailCollectionPageData | null {
  const pages = getEmailPages();
  const pageIndex = pages.findIndex(page => page.id === id);
  
  if (pageIndex >= 0) {
    pages[pageIndex] = {
      ...pages[pageIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveEmailPages(pages);
    return pages[pageIndex];
  }
  
  return null;
}

export function deleteEmailPage(id: string): boolean {
  const pages = getEmailPages();
  const pageIndex = pages.findIndex(page => page.id === id);
  
  if (pageIndex >= 0) {
    pages.splice(pageIndex, 1);
    saveEmailPages(pages);
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