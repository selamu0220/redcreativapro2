import os
import re

FILE_PATH = r"c:\Users\programar\Documents\GitHub\redcreativapro2\app\blog\seo-contenido-ia-posicionamiento-google-2025\page.tsx"

def debug_file():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
        
    json_ld_start = content.find('const jsonLd =')
    print(f"JSON LD Start: {json_ld_start}")
    
    matches = list(re.finditer(r'export\s+default\s+function', content))
    for i, m in enumerate(matches):
        print(f"Func Match {i}: {m.start()} - {m.group()}")
        
    if json_ld_start != -1 and matches:
        func_start = matches[0].start()
        print(f"Selected Func Start: {func_start}")
        
        json_ld_sub = content[json_ld_start:func_start]
        print(f"Sub Length: {len(json_ld_sub)}")
        print(f"Sub Endswith: {json_ld_sub[-20:]!r}")
        
        clean_lines = []
        for line in json_ld_sub.split('\n'):
            if line.strip().startswith('export default function'):
                print("Hit break condition!")
                break
            clean_lines.append(line)
            
        print(f"Clean Lines Count: {len(clean_lines)}")
        print(f"Last Clean Line: {clean_lines[-1]!r}")

if __name__ == "__main__":
    debug_file()
