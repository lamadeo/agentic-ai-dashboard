#!/bin/bash

# Safe anonymization: Only replace company name and email domain
# Does NOT touch employee names or any other data

set -e  # Exit on error

SOURCE_DIR="${1:-data-original}"
TARGET_DIR="${2:-data-anonymized}"

echo "=== SAFE DATA ANONYMIZATION ==="
echo "Source: $SOURCE_DIR"
echo "Target: $TARGET_DIR"
echo

# Create target directory
rm -rf "$TARGET_DIR"  # Clean start
mkdir -p "$TARGET_DIR"

# Counters
TOTAL=0
PROCESSED=0
SKIPPED=0

# Process each file
find "$SOURCE_DIR" -type f | while read -r filepath; do
  TOTAL=$((TOTAL + 1))
  
  # Get relative path
  relpath="${filepath#$SOURCE_DIR/}"
  targetpath="$TARGET_DIR/$relpath"
  
  # Create subdirectories if needed
  mkdir -p "$(dirname "$targetpath")"
  
  # Skip binary files and .DS_Store
  if file "$filepath" | grep -q "text\|JSON\|CSV\|ASCII"; then
    echo "🔄 $relpath"
    
    # Perform surgical replacements
    sed \
      -e 's/@absencesoft\.com/@techco.com/g' \
      -e 's/ABSENCESOFT/TECHCO/g' \
      -e 's/AbsenceSoft/TechCo Inc/g' \
      -e 's/Absencesoft/TechCo/g' \
      -e 's/absencesoft/techco/g' \
      -e 's|https\?://[^"[:space:]]*absencesoft[^"[:space:]]*|https://techco.com|g' \
      "$filepath" > "$targetpath" 2>/dev/null || {
        echo "  ⚠️  Skipping (encoding issue)"
        cp "$filepath" "$targetpath"
        continue
      }
    
    # Validate JSON files
    if [[ "$filepath" == *.json ]]; then
      if ! jq empty "$targetpath" 2>/dev/null; then
        echo "  ❌ INVALID JSON - rolling back"
        cp "$filepath" "$targetpath"
      else
        echo "  ✅ Valid"
      fi
    fi
    
    PROCESSED=$((PROCESSED + 1))
  else
    echo "⏭️  $relpath (binary)"
    cp "$filepath" "$targetpath"
    SKIPPED=$((SKIPPED + 1))
  fi
done

echo
echo "=== SUMMARY ==="
echo "Processed: $PROCESSED text files"
echo "Skipped: $SKIPPED binary files"
