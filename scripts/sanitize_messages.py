import json
import os
import re

FILES = ['messages/en.json', 'messages/es.json']
RESERVED = {
    'export': 'export_action',
    'delete': 'delete_action',
    'import': 'import_action',
    'return': 'return_action',
    'default': 'default_value',
    'class': 'class_name',
    'function': 'function_name',
    'while': 'while_loop',
    'for': 'for_loop',
    'if': 'if_condition',
    'else': 'else_condition',
    'try': 'try_block',
    'catch': 'catch_block',
    'finally': 'finally_block',
    'switch': 'switch_block',
    'case': 'case_block',
    'new': 'new_keyword',
    'this': 'this_keyword',
    'super': 'super_keyword',
    'extends': 'extends_keyword',
    'in': 'in_keyword',
    'instanceof': 'instanceof_keyword',
    'typeof': 'typeof_keyword',
    'void': 'void_keyword',
    'yield': 'yield_keyword',
    'break': 'break_keyword',
    'continue': 'continue_keyword',
    'debugger': 'debugger_keyword',
    'let': 'let_keyword',
    'const': 'const_keyword',
    'var': 'var_keyword',
    'null': 'null_value',
    'true': 'true_value',
    'false': 'false_value',
    'throw': 'throw_keyword',
    'package': 'package_keyword', 
    'await': 'await_keyword',
    'enum': 'enum_keyword'
}

def main():
    changes = {}
    
    for file_path in FILES:
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        new_data = {}
        file_changes = []
        
        for key, value in data.items():
            if key in RESERVED:
                new_key = RESERVED[key]
                new_data[new_key] = value
                file_changes.append((key, new_key))
                changes[key] = new_key # Track global changes
            else:
                new_data[key] = value
                
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=4, ensure_ascii=False)
            
        print(f"Sanitized {file_path}: {len(file_changes)} changes.")

    # Now update HomePageClient.tsx with the changes
    client_path = r'c:\Users\programar\Documents\GitHub\redcreativapro2\app\components\HomePageClient.tsx'
    if os.path.exists(client_path):
        with open(client_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for old_key, new_key in changes.items():
            # Replace m.key() with m.new_key()
            content = re.sub(rf"m\.{old_key}\(\)", f"m.{new_key}()", content)
            
        with open(client_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated HomePageClient.tsx with {len(changes)} key replacements.")

if __name__ == '__main__':
    main()
