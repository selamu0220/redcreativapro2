
import os

file_path = r'c:\Users\programar\Documents\GitHub\redcreativapro2\lib\blog-data.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1-based indices to 0-based
start_keep_index = 11175 # Keep up to line 11175 (0-indexed 11174)
end_skip_index = 13447 # Skip up to line 13447 (0-indexed 13446)

# Lines are 0-indexed in list
# We want lines[0] to lines[11174] (which is line 11175)
part1 = lines[:11175]

replacement = """| **Microsoft Azure AI** | Consultar | Alta (Azure)  | Máxima        | Sí           |

## Guía Definitiva para Implementar Agentes de IA

Los agentes de IA son una **inversión estratégica** para modernizar operaciones empresariales.

### Pasos para Implementar
1. **Identificar procesos repetitivos**
2. **Evaluar plataformas**
3. **Desarrollar prototipos**

### Opinión Experta
> "La clave para una implementación exitosa es comenzar con proyectos pequeños y escalables."

### Conclusión
Los agentes de IA ofrecen eficiencia y ventajas competitivas.`,
    seoTitle: 'Guía Definitiva para Implementar Agentes de IA',
    seoDescription: 'Descubre cómo implementar agentes de IA para automatizar procesos empresariales.',
  },
"""

# We want lines starting from 13447 (0-indexed) which is line 13448 in 1-based
# Wait, if we want to skip up to 13447 inclusive.
# Next line is 13448.
# 0-indexed: 13448 is index 13447.
part2 = lines[13447:]

new_content = "".join(part1) + replacement + "".join(part2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("File spliced successfully.")
