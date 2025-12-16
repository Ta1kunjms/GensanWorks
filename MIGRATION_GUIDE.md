# Database Migration Guide - Application Status Cleanup
**Date:** December 14, 2025  
**Impact:** Schema change - removes duplicate enum values

---

## Changes Made

### Application Status Enum - Consolidated

**Old Schema** (had duplicates):
```typescript
status: ["pending", "reviewed", "shortlisted", "accepted", "rejected", 
         "hired", "for_interview", "interview", "withdrawn"]
```

**New Schema** (clean):
```typescript
status: ["pending", "reviewed", "shortlisted", "interview", "hired", 
         "rejected", "withdrawn"]
```

### Removed Values
- ❌ `"accepted"` → Use `"hired"` instead
- ❌ `"for_interview"` → Use `"interview"` instead

---

## Migration SQL

### For Existing Data

Run this SQL to migrate existing records:

```sql
-- Migrate 'accepted' to 'hired'
UPDATE applications 
SET status = 'hired' 
WHERE status = 'accepted';

-- Migrate 'for_interview' to 'interview'
UPDATE applications 
SET status = 'interview' 
WHERE status = 'for_interview';

-- Verify no orphaned statuses remain
SELECT status, COUNT(*) 
FROM applications 
GROUP BY status;
```

Expected output:
```
pending     | 45
reviewed    | 12
shortlisted | 8
interview   | 3
hired       | 5
rejected    | 7
withdrawn   | 2
```

---

## Files Modified

```
server/unified-schema.ts - Line 752 (SQLite)
server/unified-schema.ts - Line 767 (PostgreSQL)
server/constants.ts - APPLICATION_STATUS enum
```

---

## Testing Checklist

### Pre-Migration
- [ ] Backup `applications` table
- [ ] Count existing records with old statuses:
  ```sql
  SELECT COUNT(*) FROM applications WHERE status IN ('accepted', 'for_interview');
  ```

### Post-Migration
- [ ] Verify all records migrated:
  ```sql
  SELECT COUNT(*) FROM applications WHERE status IN ('accepted', 'for_interview');
  -- Should return 0
  ```
- [ ] Test application status updates in UI
- [ ] Verify notifications still trigger correctly

---

## Rollback Plan

If issues occur, revert schema:

```typescript
// In unified-schema.ts - add back removed values
status: ["pending", "reviewed", "shortlisted", "accepted", "rejected", 
         "hired", "for_interview", "interview", "withdrawn"]
```

Then run:
```bash
npm run db:push
```

---

## Impact Assessment

### Breaking Changes
- ✅ None - backend code uses constants now (automatically compatible)
- ✅ Frontend unaffected - displays status strings as-is

### Non-Breaking Changes
- Old status values automatically mapped by database migration
- Constants file provides single source of truth

---

## Deployment Steps

1. **Backup database**
   ```bash
   cp app.db app.db.backup_$(date +%Y%m%d_%H%M%S)
   ```

2. **Apply schema changes**
   ```bash
   npm run db:push
   ```

3. **Run migration SQL** (see above)

4. **Verify migration**
   ```bash
   npm run dev
   # Test creating and updating applications
   ```

5. **Deploy to production**
   - Follow same steps on production database
   - Monitor error logs for any status validation failures

---

## Monitoring

After deployment, monitor:

```sql
-- Check for any unexpected status values
SELECT DISTINCT status FROM applications WHERE status NOT IN 
('pending', 'reviewed', 'shortlisted', 'interview', 'hired', 'rejected', 'withdrawn');

-- Should return 0 rows
```

---

**Status: Ready for deployment ✅**
**Estimated downtime: < 1 minute for migration SQL**
