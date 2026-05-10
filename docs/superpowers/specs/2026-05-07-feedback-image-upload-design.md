# Feedback Image Upload Design

**Date:** 2026-05-07
**Author:** Squad
**Status:** Draft

## Overview

Replace the current image URL text input in the feedback submission form with a proper file upload flow. Users should be able to pick an image from their device, see a preview, and upload it to the server.

## Current State

- `CreateFeedbackPage.tsx` has `<input type="url" placeholder="https://example.com/image.jpg">`
- Backend `CreateFeedbackDto` accepts `imageUrl?: string` (a URL string)
- Prisma schema stores `imageUrl String?`
- No multer, no file upload endpoint, no static file serving

## Architecture

```
[Browser] --multipart/form-data--> [Nginx] --proxy--> [NestJS POST /feedbacks]
                                                      ├── multer saves to /uploads/
                                                      ├── static serving via nginx
                                                      └── URL stored in DB
```

## Backend Changes

### 1. Install multer

Add `@types/multer` to backend dependencies (`multer` comes built-in with `@nestjs/platform-express`).

### 2. Create upload module

**`backend/src/modules/upload/upload.module.ts`**
- Registers `MulterModule.register(...)` with disk storage
- File filter: only images (jpg, png, webp)
- Max size: 5MB
- Destination: `./uploads/feedbacks/`
- Filename: `uuid + original extension`

### 3. Create upload controller

**`backend/src/modules/upload/upload.controller.ts`**
- `POST /upload/feedback-image`
- `@UseInterceptors(FileInterceptor('file'))`
- Returns `{ url: "/uploads/feedbacks/<filename>" }`

### 4. Update feedback creation

**`backend/src/modules/feedback/feedback.controller.ts`**
- Add a `POST /feedbacks/with-image` endpoint that accepts `multipart/form-data`
- Or keep the existing JSON endpoint for URL-based images and add file upload separately

Better approach: Create a dedicated upload endpoint so feedback creation stays decoupled:

1. Client uploads image via `POST /upload/feedback-image` → gets back URL
2. Client submits feedback with `imageUrl: returnedUrl`

This keeps the existing feedback DTO unchanged and adds a reusable upload capability.

### 5. Serve static files

**`backend/src/main.ts`**
- Configure NestJS to serve the `./uploads` directory as static files

Or, better, handle it at the **nginx level**:

**`frontend/nginx.conf`**
```nginx
location /uploads/ {
    alias /app/uploads/;
}
```

Since nginx is already proxying `/api/` to the backend, I'll add a similar location for `/uploads/`.

### 6. Docker volume

**`docker-compose.yml`**
Add a volume mount for the uploads directory:
```yaml
services:
  backend:
    volumes:
      - uploads_data:/app/uploads
```

## Frontend Changes

### 1. Update CreateFeedbackPage

Replace `<input type="url">` with:
- `<input type="file" accept="image/*">`
- Image preview (thumbnail shown after selection)
- Upload progress indicator
- Clear/replace button

### 2. Upload API

Add to `frontend/src/api/upload.ts`:
- `uploadImage(file: File): Promise<{ url: string }>`
- Sends `multipart/form-data` via axios
- Note: The existing `axiosClient` has `Content-Type: application/json` hardcoded. For file upload, we need to let axios auto-detect `multipart/form-data`.

### 3. Form flow

```
User selects file → Preview shown → Submit feedback
                                    ↓
                   1. Upload image → get URL → set imageUrl
                   2. Submit feedback JSON with imageUrl
```

## Data Flow

```
1. POST /upload/feedback-image (multipart, file field: "file")
   ← 201 { url: "/uploads/feedbacks/uuid-image.jpg" }

2. POST /feedbacks (JSON, { ..., imageUrl: "/uploads/feedbacks/uuid-image.jpg" })
   ← 201 { id, ..., imageUrl: "/uploads/feedbacks/uuid-image.jpg" }
```

## Error Handling

| Scenario | Handling |
|----------|----------|
| File too large (>5MB) | Frontend validation + backend 413 |
| Wrong file type | Frontend `accept="image/*"` + backend filter |
| Upload fails | Show error toast, keep form data |
| Network error during upload | Toast with retry option |
| No file selected | Submit without image (field stays empty) |

## Security Considerations

- Validate file type on both client and server
- Limit file size to 5MB
- Sanitize filenames (use UUID, never trust user-provided filenames)
- No executable file types allowed
- Add rate limiting to upload endpoint to prevent abuse

## Out of Scope

- Image compression/resizing (client or server)
- Cloud storage (S3, OSS, etc.) — local disk for now
- Multiple image upload
- Drag-and-drop upload (nice-to-have, not MVP)
