# UI Authentication & Login Specification

This document defines the exact payloads, requirements, and logic flows that Frontend or Mobile developers must implement when building UI screens for Authentication within the **Infopath Society Savings** platform.

---

## 1. Login Logic flow (The `/auth/login` endpoint)

When building a Login UI, the following details must be captured and structured into an HTTP POST request to `/api/v1/auth/login`.

### **Login Payload Interface**
```typescript
{
  "username": "user123",              // Required: (String)
  "password": "mySecurePassword",     // Required: (String)
  "societyCode": "SOC-HO",            // Optional: (String) Except for Superadmins
  "expectedRole": "CLIENT",           // Optional: (Enum: "SUPER_USER", "AGENT", "CLIENT", "PLATFORM_ADMIN")
  "aadhaarLast4": "1234"              // Optional conditionally: Required if the user's DB record has an Aadhaar attached.
}
```

### **Aadhaar Verification Rule**
- **Trigger**: The backend API will strictly verify the `aadhaarLast4` argument if the user's account possesses an Aadhaar number internally.
- **UI Error Capture**: If the user submits without it, the API responds with a `401 Unauthorized` HTTP error stating: `"Aadhaar verification required: please enter the valid last 4 digits of your Aadhaar card"`.
- **UI Responsibility**: The UI must display an input for "Aadhaar Verification (Last 4 Digits)". If the 401 error is received, the form should gracefully prompt the user to input the Aadhaar digits and re-submit the password.

### **Returns**
On success, the API returns a `LoginResponse`:
```typescript
{
  "accessToken": "ey...", // JWT Token
  "user": {
    "role": "CLIENT",
    "username": "client1",
    "fullName": "Demo Client",
    "requiresPasswordChange": false,
    ...
  }
}
```

---

## 2. Client-Side Session Management

All downstream authenticated requests require the Authorization header:
```http
Authorization: Bearer <accessToken>
```

**Next.js Implementation Note:**
In `apps/web/shared/auth/session.ts`, we handle this using `server-only` compatible secure cookies or lightweight localStorage (depending on the client component scope). 
- Always save the `accessToken` upon login success.
- Map the user to their correct dashboard portal path depending on `response.user.role`:
  - `SUPER_USER`: `/dashboard/society`
  - `AGENT`: `/dashboard/agent`
  - `CLIENT`: `/dashboard/client`
  - `PLATFORM_ADMIN`: `/admin`

---

## 3. Registration Payloads

The platform supports 3 different registration endpoints. Each registration UI form MUST adhere strictly to these structures.

### **A. Society Enrollment (`POST /auth/register/society`)**
Used strictly on the `/register` route for onboarding a fresh tenant organisation.
```typescript
{
  "societyName": "Skyline Credit Union", // Required
  "fullName": "John Doe",                // Required (Becomes the 1st admin's name)
  "password": "SecurePassword123",       // Required (8+ chars)
  "aadhaarNumber": "123456789012",       // Required (Strictly 12 digits)
  "planId": "FREE"                       // Required ("FREE" | "PREMIUM")
}
```
*Note: This automatically provisions the first `SUPER_USER` (admin) account. The `societyCode` and `username` act as outputs.*

### **B. Agent Registration (`POST /auth/register/agent/self`)**
Executed in the Society-specific `/agentlogin?mode=register` portal.
```typescript
{
  "societyCode": "SOC-HO", 
  "fullName": "Jane Agent",
  "username": "jane_field",
  "password": "PasswordEx1!"
}
```

### **C. Client Registration (`POST /auth/register/client`)**
Executed in the Society-specific `/clientlogin?mode=register` portal.
```typescript
{
  "societyCode": "SOC-HO", 
  "fullName": "Customer Name",
  "username": "cust01",
  "password": "Customer@123",
  "phone": "9999999999",     // Optional
  "address": "123 Street"    // Optional
}
```

---

## 4. UI Best Practices for Forms

1. **Role Context**: Do not show a "Select Role" dropdown on the general login screens. The system routes the user based on which sub-portal they visit (`/login`, `/admin`, `/[societyCode]/clientlogin`). 
2. **Rate Limits**: Catch `Failed to fetch` errors in the Society Lookup dropdowns. Always offer a fallback plain-text input for the `societyCode` inside your React login component.
3. **Password Security**: Forms must implement a toggle for `<VisibilityIcon />` and enforce minimum length visuals.
4. **Error Handling**: Bubble backend strings via toast notifications (`toast.error()`). The backend generates robust and safe error constants.
