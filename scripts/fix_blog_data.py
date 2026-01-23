
import os

file_path = r'c:\Users\programar\Documents\GitHub\redcreativapro2\lib\blog-data.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Adjust indices for 0-based list (lines are 1-based in tool view)
# We want to keep line 9996 (index 9996, which is line 9997 in 1-based)
# Wait, line 9997 in 1-based is index 9996.
# We want to keep 9997 (index 9996) but modify it.
# We want to delete 9998 to 12238 (indices 9997 to 12237).
# We want to keep 12239 (index 12238) but modify it.

# Let's double check lines.
# 9997: excerpt: '... {
# 12239:   }M ARR ...

start_line_1based = 9997
end_line_1based = 12239

index_start = start_line_1based - 1
index_end = end_line_1based - 1

# line 9997
line_start = lines[index_start]
# line 12239
line_end = lines[index_end]

# Verify content
if "escaló de 0 a {" not in line_start:
    print(f"Error: Start line content mismatch: {line_start}")
    exit(1)

if "}M ARR" not in line_end:
    print(f"Error: End line content mismatch: {line_end}")
    exit(1)

# Construct new line
# part1: everything up to '{'
part1 = line_start.rsplit('{', 1)[0]
# part2: everything after '}'
part2 = line_end.split('}', 1)[1]

new_line = part1 + part2

# New content:
# lines before 9997
# new_line
# lines after 12239

new_lines = lines[:index_start] + [new_line] + lines[index_end+1:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully fixed the file.")
