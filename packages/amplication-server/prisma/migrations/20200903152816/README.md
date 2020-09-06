# Migration `20200903152816`

This migration has been generated by Yuval Hazaz at 9/3/2020, 6:28:17 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
Begin;
CREATE TYPE "EnumDataType_new" AS ENUM ('SingleLineText', 'MultiLineText', 'Email', 'AutoNumber', 'WholeNumber', 'DateTime', 'DecimalNumber', 'Lookup', 'MultiSelectOptionSet', 'OptionSet', 'Boolean', 'GeographicAddress', 'Id', 'CreatedAt', 'UpdatedAt');
ALTER TABLE "public"."EntityField" ALTER COLUMN "dataType" DROP DEFAULT,
                            ALTER COLUMN "dataType" TYPE "EnumDataType_new" USING ("dataType"::text::"EnumDataType_new"),
                            ALTER COLUMN "dataType" SET DEFAULT 'SingleLineText';
ALTER TYPE "EnumDataType" RENAME TO "EnumDataType_old";
ALTER TYPE "EnumDataType_new" RENAME TO "EnumDataType";
DROP TYPE "EnumDataType_old";
Commit

DROP INDEX "public"."EntityPermissionField.entityPermissionId_fieldId_unique"

ALTER TABLE "public"."EntityPermissionField" DROP CONSTRAINT "EntityPermissionField_fieldId_fkey"

ALTER TABLE "public"."EntityPermissionField" DROP COLUMN "fieldId",
ADD COLUMN "fieldPermanentId" text   NOT NULL ,
ADD COLUMN "entityVersionId" text   NOT NULL 

CREATE UNIQUE INDEX "EntityField.entityVersionId_fieldPermanentId_unique" ON "public"."EntityField"("entityVersionId", "fieldPermanentId")

CREATE UNIQUE INDEX "EntityPermissionField.entityPermissionId_fieldPermanentId_unique" ON "public"."EntityPermissionField"("entityPermissionId", "fieldPermanentId")

ALTER TABLE "public"."EntityPermissionField" ADD FOREIGN KEY ("fieldPermanentId", "entityVersionId")REFERENCES "public"."EntityField"("fieldPermanentId","entityVersionId") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200831155129..20200903152816
--- datamodel.dml
+++ datamodel.dml
@@ -1,12 +1,12 @@
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 generator client {
   provider        = "prisma-client-js"
-  previewFeatures = ["transactionApi"]
+  previewFeatures = ["insensitiveFilters"]
 }
 generator typegraphql {
@@ -199,13 +199,14 @@
 model EntityPermissionField {
   id                   String                 @default(cuid()) @id
   entityPermission     EntityPermission       @relation(fields: [entityPermissionId], references: [id])
   entityPermissionId   String
-  field                EntityField            @relation(fields: [fieldId], references: [id])
-  fieldId              String
+  field                EntityField            @relation(fields: [fieldPermanentId, entityVersionId], references: [fieldPermanentId, entityVersionId])
+  fieldPermanentId     String
+  entityVersionId      String
   permissionFieldRoles EntityPermissionRole[]
-  @@unique([entityPermissionId, fieldId])
+  @@unique([entityPermissionId, fieldPermanentId])
 }
 model EntityField {
   id               String        @default(cuid()) @id
@@ -222,8 +223,9 @@
   // TBD
   searchable       Boolean
   description      String
+  @@unique([entityVersionId, fieldPermanentId])
   @@unique([entityVersionId, name])
   @@unique([entityVersionId, displayName])
   EntityPermissionField EntityPermissionField[]
 }
@@ -231,19 +233,15 @@
 enum EnumDataType {
   SingleLineText
   MultiLineText
   Email
-  State
   AutoNumber
   WholeNumber
   DateTime
   DecimalNumber
-  File
-  Image
   Lookup
   MultiSelectOptionSet
   OptionSet
-  TwoOptions
   Boolean
   GeographicAddress
   Id
   CreatedAt
```

