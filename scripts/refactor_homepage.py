import re
import os

FILE_PATH = r'c:\Users\programar\Documents\GitHub\redcreativapro2\app\components\HomePageClient.tsx'

def main():
    if not os.path.exists(FILE_PATH):
        print(f"Error: File not found at {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Imports
    # Look for the simple-translations import and replace it
    new_imports = "import * as m from '@/paraglide/messages'\nimport { languageTag } from '@/paraglide/runtime'"
    content = re.sub(
        r"import \{ useSimpleTranslations \} from '\.\./lib/simple-translations'",
        new_imports,
        content
    )

    # 2. Variable declaration
    # Remove const { t, currentLang } = useSimpleTranslations()
    # Add const currentLang = languageTag() for usage in the component
    # We must ensure we insert it where the hook was called
    content = re.sub(
        r"const \{ t, currentLang \} = useSimpleTranslations\(\)",
        "const currentLang = languageTag()",
        content
    )
    
    # 2b. Also handle cases where user might have destructured differently or used spacing
    # (The grep showed "const { t, currentLang } = useSimpleTranslations()")
    
    # 3. Replacements t('key') -> m.key()
    def replace_t(match):
        key = match.group(1)
        # Sanitize key same as migration script
        clean_key = key.replace('.', '_')
        return f"m.{clean_key}()"

    # Regex for t('...') or t("...")
    content = re.sub(r"t\(['\"]([\w\.]+)['\"]\)", replace_t, content)
    
    # 4. Update SimpleLanguageSlider usage to pass currentLocale
    # This ensures the slider reflects the Paraglide state
    content = re.sub(
        r"<SimpleLanguageSlider />",
        "<SimpleLanguageSlider currentLocale={currentLang as any} />",
        content
    )

    # Write back
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Refactoring complete.")

if __name__ == '__main__':
    main()
