import re
import json
import os

# Source file path (relative to repo root)
SOURCE_FILE = 'app/lib/simple-translations.ts'

def parse_translations(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return {}, {}
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find the translations object
    match = re.search(r'const translations = ({[\s\S]*?});', content)
    if not match:
        print("Could not find translations object")
        return {}, {}

    translations_str = match.group(1)
    
    # Parse ES block
    # Looks for "es: {" until "}, en:"
    es_match = re.search(r'es: \{([\s\S]*?)\},\s*en:', translations_str)
    es_content = es_match.group(1) if es_match else ""

    # Parse EN block
    # Looks for "en: {" until "}, fr:"
    en_match = re.search(r'en: \{([\s\S]*?)\},\s*fr:', translations_str)
    en_content = en_match.group(1) if en_match else ""

    return parse_keys(es_content), parse_keys(en_content)

def parse_keys(block):
    result = {}
    # Matches: key: 'value' OR 'key.boxed': 'value'
    # Captures: 1=quoted_key, 2=unquoted_key, 3=value
    pattern = re.compile(r"(?:'([^']*)'|(\w+)):\s*'((?:[^']|\\')*)',")
    
    lines = block.split('\n')
    for line in lines:
        line = line.strip()
        if not line or line.startswith('//'):
            continue
            
        m = pattern.search(line)
        if m:
            key = m.group(1) or m.group(2)
            value = m.group(3).replace("\\'", "'")
            # Sanitize key for Paraglide (replace . with _)
            clean_key = key.replace('.', '_')
            result[clean_key] = value
            
    return result

def main():
    es_data, en_data = parse_translations(SOURCE_FILE)
    
    # Add $schema
    es_data["$schema"] = "https://inlang.com/schema/inlang-message-format"
    en_data["$schema"] = "https://inlang.com/schema/inlang-message-format"
    
    # Write files
    os.makedirs('messages', exist_ok=True)
    
    with open('messages/es.json', 'w', encoding='utf-8') as f:
        json.dump(es_data, f, indent=4, ensure_ascii=False)
        
    with open('messages/en.json', 'w', encoding='utf-8') as f:
        json.dump(en_data, f, indent=4, ensure_ascii=False)
        
    print(f"Migrated {len(es_data)} ES keys and {len(en_data)} EN keys.")

if __name__ == '__main__':
    main()
