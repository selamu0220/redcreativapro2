import os
import re
import glob

# Path to blog directory
BLOG_DIR = r"c:\Users\programar\Documents\GitHub\redcreativapro2\app\blog"

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Idempotency check removed to force fix of corrupted files
    # if "ArticleLayout" in content and "export default function ArticlePage" in content:
    #    return False

    # 1. Extract Metadata
    json_ld_block = ""
    metadata_match = re.search(r'export const metadata: Metadata =', content)
    if not metadata_match:
        print(f"Skipping {file_path}: No metadata found")
        return False

    start_idx = metadata_match.start()
    brace_start = content.find('{', start_idx)
    
    metadata_str = ""
    if brace_start != -1:
        balance = 1
        i = brace_start + 1
        while i < len(content) and balance > 0:
            if content[i] == '{':
                balance += 1
            elif content[i] == '}':
                balance -= 1
            i += 1
        if balance == 0:
            metadata_str = content[brace_start:i]
            
    if not metadata_str:
        print(f"Skipping {file_path}: Invalid metadata syntax")
        return False
    
    # Simple regex extraction for title/desc from metadata string
    title_match = re.search(r"title:\s*'([^']*)'", metadata_str)
    desc_match = re.search(r"description:\s*'([^']*)'", metadata_str)
    
    title = title_match.group(1) if title_match else "Título del Artículo"
    description = desc_match.group(1) if desc_match else "Descripción del artículo"
    
    # 2. Extract JSON-LD
    # Strategy: Find 'const jsonLd =' and take everything until 'export default' or '// SEO Keywords'
    # This is safer than regex matching braces count.
    # 2. Extract JSON-LD
    json_ld_start = content.find('const jsonLd =')
    if json_ld_start != -1:
        # Find the end using regex to handle potential whitespace variations
        func_match = re.search(r'export\s+default\s+function', content)
        
        if func_match:
            func_start = func_match.start()
            # Ensure func_start is AFTER json_ld_start (it should be)
            if func_start > json_ld_start:
                json_ld_sub = content[json_ld_start:func_start]
                json_ld_block = json_ld_sub.strip()
            else:
                # Function starts before JSON-LD? Weird.
                json_ld_block = ""
        else:
            json_ld_block = ""
    # Foolproof cleanup: Line by line
    clean_lines = []
    for line in json_ld_block.split('\n'):
        if 'export default' in line:
            break
        clean_lines.append(line)
    json_ld_block = '\n'.join(clean_lines).strip()
    
    # EXTRA SAFETY: Split by literal 'export default' just in case
    if 'export default' in json_ld_block:
         json_ld_block = json_ld_block.split('export default')[0].strip()

    # 3. Extract Content Body
    # 3. Extract Content Body
    # We want everything inside <article ...> ... </article>
    article_match = re.search(r'<article[^>]*>([\s\S]*?)</article>', content)
    if not article_match:
        # Try finding ArticleWrapper if article tag is missing
        wrapper_match = re.search(r'<ArticleWrapper>([\s\S]*?)</ArticleWrapper>', content)
        if wrapper_match:
             article_body = wrapper_match.group(1)
        else:
             # Try finding ArticleLayout (re-migration case)
             layout_match = re.search(r'<ArticleLayout[^>]*>([\s\S]*?)</ArticleLayout>', content)
             if layout_match:
                 article_body = layout_match.group(1)
             else:
                 print(f"Skipping {file_path}: No content found")
                 return False
    else:
        article_body = article_match.group(1)
        
    # Cleanup duplicate comments
    article_body = article_body.replace('{/* Extracted Content: Start */}', '').replace('{/* Extracted Content: End */}', '')
        
    # Clean up the body: Remove <header>...</header> if it was caught (it shouldn't be inside article, but just in case)
    article_body = re.sub(r'<header[\s\S]*?</header>', '', article_body)
    
    # Remove manual TOC if desired?
    # article_body = re.sub(r'<div[^>]*>[\s\S]*?Índice de Contenidos[\s\S]*?</div>', '', article_body)
    
    # Remove any stray <h1> tags since layout provides one
    article_body = re.sub(r'<h1[\s\S]*?</h1>', '', article_body)
    
    # Remove breadcrumbs specific div/nav if captured inside (usually they are outside article, but let's be safe)
    # The file viewed shows nav and header are BEFORE ArticleWrapper/article. 
    # So article_body contains the actual content? 
    # In 'escritura-academica...', article contains 'Introducción', 'Índice', 'Section 1'...
    
    # Remove "Introducción" div metadata box if it exists? User might want to keep it.
    # User said "Apply layout". New layout has a Header.
    # The existing files have a <header> OUTSIDE <article>. 
    # Example:
    # <header> ... </header>
    # <ArticleWrapper> <article> ... </article> </ArticleWrapper>
    
    # So if we just grab content of <article>, we inherently skip the old header/breadcrumbs!
    # EXCEPT: The "Índice de Contenidos" is inside. We might want to keep or remove it.
    # Let's keep it for now as it maps to the specific content.
    
    # Clean up imports
    imports = """import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, TrendingUp, Settings, Target, Bot, ArrowRight, Star, Clock, Users, Award, Lightbulb, BarChart3 } from 'lucide-react'
import ArticleLayout from '@/app/components/blog/ArticleLayout';
"""

    # Create new file content
    # Create new file content
    json_ld_script = ""
    if json_ld_block:
        json_ld_script = """
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />"""

    new_content = f"""{imports}

export const metadata: Metadata = {metadata_str}

{json_ld_block}

export default function ArticlePage() {{
  const meta = {{
      title: '{title}',
      description: '{description}',
      category: 'Artículos',
      author: {{
          name: 'Selamu',
          role: 'Editor',
          avatar: 'https://github.com/shadcn.png'
      }},
      date: '2025-01-01', // Fallback date
      readTime: '10 min',
      image: 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=4000&auto=format&fit=crop'
  }};

  return (
    <>
      {json_ld_script}
      
      <ArticleLayout meta={{meta}}>
        {{/* Extracted Content: Start */}}
        {article_body}
        {{/* Extracted Content: End */}}
      </ArticleLayout>
    </>
  )
}}
"""
    
    return new_content

def main():
    print(f"Scanning {BLOG_DIR}...")
    count = 0
    for root, dirs, files in os.walk(BLOG_DIR):
        for file in files:
            if file == "page.tsx":
                # Skip the main blog index page
                if root == BLOG_DIR:
                    continue
                
                file_path = os.path.join(root, file)
                # print(f"Processing {file_path}")
                try:
                    new_source = process_file(file_path)
                    if new_source:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_source)
                        print(f"Converted: {os.path.basename(root)}")
                        count += 1
                except Exception as e:
                    print(f"Error processing {file_path}: {str(e)}")
    print(f"Total processed: {count}")

if __name__ == "__main__":
    main()
