import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface CampaignData {
  id: string;
  name: string;
  contacts?: string[];
  [key: string]: any;
}

async function writeCampaignsFile(data: CampaignData[]): Promise<void> {
  const campaignsPath = path.join(process.cwd(), 'data', 'campaigns.json');
  await fs.writeFile(campaignsPath, JSON.stringify(data, null, 2));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  
  try {
    const body = await request.json();
    const { contacts } = body;
    
    // Read campaigns file
    const campaignsPath = path.join(process.cwd(), 'data', 'campaigns.json');
    let campaigns: CampaignData[] = [];
    
    try {
      const data = await fs.readFile(campaignsPath, 'utf8');
      campaigns = JSON.parse(data);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'ENOENT') {
        // File doesn't exist, create it
        campaigns = [];
      } else {
        throw error;
      }
    }
    
    // Find and update the campaign
    const campaignIndex = campaigns.findIndex((c: CampaignData) => c.id === campaignId);
    
    if (campaignIndex === -1) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    
    // Update contacts
    campaigns[campaignIndex].contacts = contacts;
    
    // Save updated campaigns
    await writeCampaignsFile(campaigns);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Contacts updated successfully',
      contactsCount: contacts.length 
    });
    
  } catch (error) {
    console.error('Error updating contacts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  
  try {
    // Read campaigns file
    const campaignsPath = path.join(process.cwd(), 'data', 'campaigns.json');
    
    try {
      const data = await fs.readFile(campaignsPath, 'utf8');
      const campaigns: CampaignData[] = JSON.parse(data);
      
      const campaign = campaigns.find((c: CampaignData) => c.id === campaignId);
      
      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }
      
      return NextResponse.json({ 
        contacts: campaign.contacts || [] 
      });
      
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'ENOENT') {
        return NextResponse.json({ contacts: [] });
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}