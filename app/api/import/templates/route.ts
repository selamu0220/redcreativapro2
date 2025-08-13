import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { createTemplateAsync, TemplateData } from '../../../lib/database';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userEmail = request.headers.get('x-user-email');
  if (!userEmail) {
    return NextResponse.json({ error: 'User email required' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileContent = await file.text();

    return new Promise<NextResponse>((resolve) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const importedTemplates: TemplateData[] = [];
          const errors: string[] = [];

          for (const row of results.data) {
            // Basic validation and mapping
            const templateName = (row as any).name || (row as any).Name;
            const templateSubject = (row as any).subject || (row as any).Subject;
            const templateContent = (row as any).content || (row as any).Content;

            if (!templateName || !templateSubject || !templateContent) {
              errors.push(`Row missing name, subject, or content: ${JSON.stringify(row)}`);
              continue;
            }

            try {
              const newTemplate: Omit<TemplateData, 'id' | 'createdAt' | 'updatedAt'> = {
                userEmail: userEmail,
                name: templateName,
                subject: templateSubject,
                content: templateContent,
                category: (row as any).category || (row as any).Category || '',
                tags: ((row as any).tags || (row as any).Tags || '').split(',').map((tag: string) => tag.trim()).filter(Boolean),
                isActive: true, // Default to active on import
              };
              const createdTemplate = await createTemplateAsync(newTemplate);
              importedTemplates.push(createdTemplate);
            } catch (e: any) {
              errors.push(`Error processing template ${templateName}: ${e.message}`);
            }
          }

          if (errors.length > 0) {
            resolve(NextResponse.json({ message: `Import completed with ${importedTemplates.length} templates imported and ${errors.length} errors.`, importedCount: importedTemplates.length, errors }, { status: 200 }));
          } else {
            resolve(NextResponse.json({ message: `Successfully imported ${importedTemplates.length} templates.`, importedCount: importedTemplates.length }, { status: 200 }));
          }
        },
        error: (err: any) => {
          resolve(NextResponse.json({ error: `CSV parsing error: ${err.message}` }, { status: 500 }));
        },
      });
    });
  } catch (error: any) {
    console.error('Error importing templates:', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
