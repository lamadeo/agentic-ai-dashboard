# Archived One-Time Fix Scripts

This directory contains scripts that were used for one-time fixes or migrations and are no longer needed in the active codebase. They are archived here for historical reference.

## Scripts

### `restructure-org-chart.js`
**Date**: 2025-12-22
**Purpose**: One-time restructure to separate Professional Services from Customer Success department
**Status**: Completed, no longer needed

### `fix-org-chart-structure.js`
**Date**: 2026-01-21
**Purpose**: One-time fix to correct reporting relationships (Jeff Rivero → Luis Amadeo, Kirmanie Ravariere → Robert Foster)
**Status**: Completed, no longer needed

### `parse-org-chart.js`
**Date**: 2025-12-17
**Purpose**: Legacy PDF parser for extracting org chart from Rippling PDF exports
**Status**: Superseded by `/generate-org-chart` slash command workflow
**Note**: Required manual PDF extraction, now replaced by more flexible text-based workflow

### `list-all-employees.js`
**Date**: Unknown
**Purpose**: Utility to list all employees from org chart PDF
**Status**: Superseded by org chart JSON structure and `show-departments.js` utility
**Note**: Depended on `parse-org-chart.js`

## Current Workflow

For org chart management, use:
- **Generate org chart**: `/generate-org-chart` slash command
- **Update email mappings**: `/setup-org-data` slash command
- **View org structure**: `node scripts/show-org-structure.js`
- **View departments**: `node scripts/show-departments.js`
- **Manage snapshots**: `node scripts/manage-org-chart-snapshot.js`

See `/docs/guides/DATA_REFRESH.md` for complete workflow documentation.
