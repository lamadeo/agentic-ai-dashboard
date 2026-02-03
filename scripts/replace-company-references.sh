#!/bin/bash

# Replace company references in code
# AbsenceSoft → TechCo Inc
# absencesoft → techco

echo "🔄 Replacing company references in code..."

# Directories to process
DIRS="app scripts docs .claude public __tests__ backups"

# File extensions to process
EXTENSIONS="js jsx json md txt ts tsx css html"

# Build find command for extensions
FIND_ARGS=""
for ext in $EXTENSIONS; do
  FIND_ARGS="$FIND_ARGS -name '*.$ext' -o"
done
FIND_ARGS=${FIND_ARGS% -o}  # Remove trailing -o

# Count before
echo "📊 Counting references before replacement..."
BEFORE=$(grep -r "AbsenceSoft\|absencesoft" $DIRS 2>/dev/null | wc -l | tr -d ' ')
echo "   Found: $BEFORE references"

# Perform replacements
echo ""
echo "🔄 Performing replacements..."

find $DIRS -type f \( $FIND_ARGS \) 2>/dev/null | while read file; do
  # Skip if file doesn't exist or is binary
  [ ! -f "$file" ] && continue

  # Perform replacements (macOS compatible)
  sed -i '' \
    -e 's/AbsenceSoft/TechCo Inc/g' \
    -e 's/Absencesoft/TechCo Inc/g' \
    -e 's/absencesoft/techco/g' \
    -e 's/ABSENCESOFT/TECHCO/g' \
    "$file" 2>/dev/null
done

# Count after
echo ""
echo "📊 Counting references after replacement..."
AFTER=$(grep -r "AbsenceSoft\|absencesoft" $DIRS 2>/dev/null | wc -l | tr -d ' ')
echo "   Remaining: $AFTER references"

echo ""
echo "✅ Replacement complete!"
echo "   Replaced: $((BEFORE - AFTER)) references"
