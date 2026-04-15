# BeolGroup Refactoring Plan

## Objective
Introduce a `BeolGroup` layer between `ProcessPlan` and `BeolOption` to allow sharing master data (PhotoKey, RequestTableMap, etc.) based on BEOL prefixes (e.g., `700000`).

## Target Hierarchy
`ProcessPlan` (1) -> `BeolGroup` (N) -> `BeolOption` (N) -> `Product` (N)
- `BeolGroup.group_name` stores the prefix (e.g., "700000").
- `BeolOption.option_name` stores the full name (e.g., "700000_dismm").

## Database Schema Changes

### FastAPI (SQLAlchemy - models/product.py)
1. Add `BeolGroup` table.
2. Update `BeolOption` to reference `BeolGroup` instead of `ProcessPlan`.
3. Update `PhotoKey`, `RequestTableMap`, `StreamInfo`, `ReticleLayout`, `GdsPathInfo` to reference `BeolGroup`.

### NestJS (Prisma - schema.prisma)
1. Define `BeolGroup` model.
2. Migrate relations for `BeolOption`, `PhotoKey`, etc.

## Backend Logic Changes

### FastAPI Service/Repository
1. **Prefix Parsing**: Extract prefix from `option_name` during BEOL creation.
2. **Auto-Grouping**: Lookup or create `BeolGroup` based on prefix and `process_plan_id`.
3. **Data Association**: Link `PhotoKey` and other operational data to `BeolGroup`.

### NestJS Service
1. Update `MasterDataService` to handle the 4-level hierarchy in `findAllProcessPlans`.

## Frontend & VSTO UI Changes

### React
1. Update `MasterDataForm` and hooks to support `BeolGroup`.

### VSTO (WebView2)
1. Update `DataInquiry` and `MasterData` HTML/JS to reflect the new hierarchy.

## Migration Steps
1. Update DB Schemas (Prisma & SQLAlchemy).
2. Write a migration script to:
    - Extract prefixes from existing `BeolOption.option_name`.
    - Create `BeolGroup` entries.
    - Update `BeolOption.beol_group_id`.
    - Update `PhotoKey.beol_group_id`, etc.
3. Deploy Backend updates.
4. Deploy Frontend updates.
