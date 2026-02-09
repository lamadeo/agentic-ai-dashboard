#!/bin/bash

set -e  # Exit on error

SOURCE_DIR=${1:-"data"}
BACKUP_SUFFIX="_original"

echo "=== ZIP File Anonymization Script ==="
echo "Source: $SOURCE_DIR"
echo

# Function to anonymize a single ZIP file
anonymize_zip() {
    local zip_file=$1
    local zip_dir=$(dirname "$zip_file")
    local zip_name=$(basename "$zip_file")
    local temp_dir="${zip_dir}/.temp_${zip_name%.zip}"
    
    echo "📦 Processing: $zip_name"
    
    # Create temp directory
    mkdir -p "$temp_dir"
    
    # Extract ZIP
    echo "   Extracting..."
    unzip -q "$zip_file" -d "$temp_dir" 2>/dev/null || {
        echo "   ⚠️  Failed to extract, skipping"
        rm -rf "$temp_dir"
        return 1
    }
    
    # Find and process JSON files
    local json_count=0
    while IFS= read -r json_file; do
        if [ -f "$json_file" ]; then
            # Apply anonymization
            sed -i '' \
                -e 's/@absencesoft\.com/@techco.com/g' \
                -e 's/AbsenceSoft/TechCo Inc/g' \
                -e 's/absencesoft/techco/g' \
                "$json_file"
            ((json_count++))
        fi
    done < <(find "$temp_dir" -name "*.json" -type f)
    
    echo "   Anonymized $json_count JSON files"
    
    # Backup original ZIP
    mv "$zip_file" "${zip_file}${BACKUP_SUFFIX}"
    
    # Create new ZIP
    echo "   Re-zipping..."
    (cd "$temp_dir" && zip -r -q "../$zip_name" .)
    
    # Cleanup
    rm -rf "$temp_dir"
    
    echo "   ✅ Complete"
    return 0
}

# Find all ZIP files
echo "Finding ZIP files..."
zip_files=$(find "$SOURCE_DIR" -name "*.zip" -not -name "*${BACKUP_SUFFIX}" -type f)
zip_count=$(echo "$zip_files" | grep -c . || echo "0")

echo "Found $zip_count ZIP files to process"
echo

if [ "$zip_count" -eq 0 ]; then
    echo "No ZIP files to process"
    exit 0
fi

# Process each ZIP
processed=0
failed=0

while IFS= read -r zip_file; do
    if anonymize_zip "$zip_file"; then
        ((processed++))
    else
        ((failed++))
    fi
    echo
done <<< "$zip_files"

echo "=== Summary ==="
echo "Processed: $processed"
echo "Failed: $failed"
echo "Original ZIPs backed up with suffix: ${BACKUP_SUFFIX}"
echo

if [ $failed -gt 0 ]; then
    echo "⚠️  Some ZIPs failed to process"
    exit 1
fi

echo "✅ All ZIPs anonymized successfully"
