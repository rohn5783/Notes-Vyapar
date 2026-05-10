# Notes Vyapar - Complete API Reference

## Base URL
```
http://localhost:3000/api
```

---

## Authentication APIs

### 1. Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (201):
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}

// Token automatically stored in cookies as: notes-vyapar-token
```

### 3. Get Current User
```
GET /auth/me
Authorization: Bearer <token> | Cookie: notes-vyapar-token=<token>

Response (200):
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}

Response (401):
{
  "success": false,
  "message": "Unauthorized"
}
```

### 4. Logout
```
POST /auth/logout

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 5. Verify Email
```
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}

Response (200):
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## Notes APIs

### 1. Upload Note
```
POST /notes/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Fields:
- title (string, required): "Biology Chapter 5"
- subject (string, required): "Biology"
- description (string, required): "Complete notes..."
- price (number): 0 (free) or 99 (paid)
- category (string): "Science"
- file (file, required): PDF file
- thumbnail (file, optional): Image file
- tags (string): "biology,chapter5"
- language (string): "English"
- university (string): "Delhi University"
- isPremium (boolean): false

Response (201):
{
  "success": true,
  "message": "Note created successfully",
  "note": {
    "_id": "note_id",
    "title": "Biology Chapter 5",
    "subject": "Biology",
    "description": "Complete notes...",
    "price": 0,
    "fileUrl": "https://res.cloudinary.com/...",
    "thumbnailUrl": "https://res.cloudinary.com/...",
    "seller": {
      "_id": "user_id",
      "name": "John Doe"
    }
  }
}
```

### 2. Get All Notes (Marketplace)
```
GET /notes/get-all?search=biology&sort=-createdAt&limit=10&skip=0

Query Parameters:
- search (string): Search in title/subject/description
- sort (string): Sort field (e.g., -createdAt for newest)
- limit (number): Results per page
- skip (number): Offset for pagination

Response (200):
{
  "success": true,
  "notes": [
    {
      "_id": "note_id",
      "title": "Biology Chapter 5",
      "description": "...",
      "price": 0,
      "thumbnailUrl": "...",
      "seller": {
        "_id": "user_id",
        "name": "John Doe"
      }
    }
  ],
  "total": 42,
  "page": 1
}
```

### 3. Get Single Note
```
GET /notes/[noteId]

Response (200):
{
  "success": true,
  "note": {
    "_id": "note_id",
    "title": "Biology Chapter 5",
    "subject": "Biology",
    "description": "...",
    "price": 99,
    "fileUrl": "https://...",
    "thumbnailUrl": "https://...",
    "category": "Science",
    "tags": ["biology", "chapter5"],
    "language": "English",
    "seller": {
      "_id": "user_id",
      "name": "John Doe"
    }
  }
}

Response (404):
{
  "error": "Note not found"
}
```

### 4. Update Note (Owner Only)
```
PUT /notes/[noteId]
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Fields (same as upload, all optional):
- title, subject, description, price, file, thumbnail, etc.

Response (200):
{
  "success": true,
  "note": { /* updated note */ }
}

Response (403):
{
  "error": "Unauthorized"
}
```

### 5. Delete Note (Owner Only)
```
DELETE /notes/[noteId]
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Note deleted successfully"
}

Response (403):
{
  "error": "Unauthorized"
}
```

---

## Payment APIs

### 1. Create Payment Link
```
POST /payment/create-order
Content-Type: application/json
Authorization: Bearer <token>

{
  "noteId": "note_id"
}

Response (200):
{
  "success": true,
  "message": "Payment link created successfully",
  "paymentLink": {
    "id": "plink_EAznOHT0K56Kbb",
    "short_url": "https://rzp.io/i/w2CEwQ2",
    "url": "https://checkout.razorpay.com/i/..."
  }
}

// Frontend redirects user to paymentLink.url
```

### 2. Payment Callback Handler
```
GET /payment/callback?razorpay_link_reference_id=plink_&razorpay_payment_id=pay_&razorpay_link_status=paid&noteId=note_

Response (200):
{
  "success": true,
  "message": "Payment verified successfully",
  "payment": {
    "_id": "payment_id",
    "status": "paid",
    "razorpay_payment_id": "pay_..."
  }
}

Response (400):
{
  "success": false,
  "message": "Payment status is cancelled"
}
```

### 3. Check Payment Status
```
GET /payment/status?noteId=note_id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "notePrice": 99,
  "hasPurchased": true,
  "isFree": false
}

// hasPurchased = true if:
//   - User is owner, OR
//   - Note is free (price = 0), OR
//   - Payment.status = "paid"
```

### 4. Verify Payment (Manual)
```
POST /payment/verify
Content-Type: application/json
Authorization: Bearer <token>

{
  "razorpay_order_id": "plink_...",
  "razorpay_payment_id": "pay_...",
  "razorpay_signature": "signature_..."
}

Response (200):
{
  "success": true,
  "message": "Payment verified successfully",
  "paymentId": "payment_id"
}
```

---

## Download API

### Download PDF (Secure)
```
GET /payment/download-pdf?noteId=note_id
Authorization: Bearer <token>

Response (307 Redirect to signed Cloudinary URL):
Location: https://res.cloudinary.com/.../d_auto/...?expires=1620345600&...

Response (403):
{
  "success": false,
  "message": "You don't have access to download this note"
}

Response (401):
{
  "success": false,
  "message": "Please log in to download"
}

// Signed URL is time-limited and only works with valid signature
// Direct PDF URL not exposed to maintain security
```

---

## User APIs

### 1. Get User Profile
```
GET /user/profile
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "role": "user"
  }
}
```

### 2. Update User Profile
```
PUT /user/update
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Jane Doe",
  "avatar": "https://..."
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user */ }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields or invalid data",
  "error": "Details about what went wrong"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Please log in to access this resource"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Unauthorized - You don't have permission"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Note not found",
  "error": "Resource does not exist"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An error occurred on the server",
  "error": "Details for debugging"
}
```

---

## Request Headers

### With Bearer Token
```
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### With Cookie (Automatic)
```
GET /api/auth/me
Cookie: notes-vyapar-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## Common Use Cases

### 1. Display Marketplace (Get All Notes)
```javascript
fetch('/api/notes/get-all?limit=12&sort=-createdAt')
  .then(r => r.json())
  .then(data => {
    // data.notes = array of notes
    // data.total = total count
  })
```

### 2. Check If User Can Download Note
```javascript
fetch(`/api/payment/status?noteId=${noteId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(data => {
    if (data.isFree || data.hasPurchased) {
      // Show download button
    } else {
      // Show buy button
    }
  })
```

### 3. Initiate Payment
```javascript
fetch('/api/payment/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ noteId: 'note_123' })
})
  .then(r => r.json())
  .then(data => {
    // Redirect to payment link
    window.location.href = data.paymentLink.url
  })
```

### 4. Download PDF (with Auth)
```javascript
fetch(`/api/payment/download-pdf?noteId=${noteId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  // Returns 307 redirect with signed Cloudinary URL
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'
```

### Get All Notes
```bash
curl -X GET "http://localhost:3000/api/notes/get-all?limit=10" \
  -H "Content-Type: application/json"
```

### Create Payment Link (with token)
```bash
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"noteId":"NOTE_ID_HERE"}'
```

---

## Rate Limiting

Current rate limiting (if enabled):
- Login/Register: 5 requests per 15 minutes per IP
- Payment: 10 requests per minute per user
- General APIs: 100 requests per minute per IP

---

**Last Updated**: May 10, 2026
**Status**: ✅ All APIs tested and working
