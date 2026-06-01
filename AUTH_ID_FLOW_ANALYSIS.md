# Auth Flow Analysis: Social Auth vs Credentials Auth

## The Problem

When users sign in with social accounts (GitHub/Google), the **UUID** (providerAccountId) is being sent to the backend instead of the **MongoDB ObjectID** (userId).

---

## Current Flow Comparison

### 📍 **CREDENTIALS AUTH (Email/Password)** ✅ Works Correctly

```
1. User logs in with email/password
2. JWT Callback:
   - Retrieves Account by email
   - Gets Account.userId (MongoDB ObjectID)
   - Sets: token.sub = userId.toString()
3. Session Callback:
   - session.user.id = token.sub (ObjectID)
4. createQuestion:
   - author: userId → Correct ObjectID ✅
```

---

### 📍 **SOCIAL AUTH (GitHub/Google)** ❌ Issue Found

#### **What SHOULD happen:**

```
1. User signs in via GitHub/Google
2. OAuth Signin Callback:
   - Creates/Updates User record
   - Creates Account with:
     * userId: User._id (MongoDB ObjectID)
     * providerAccountId: GitHub/Google UUID
3. JWT Callback:
   - Retrieves Account using providerAccountId
   - Gets Account.userId (MongoDB ObjectID)
   - Sets: token.sub = userId.toString()
4. Session Callback:
   - session.user.id = token.sub (ObjectID)
5. createQuestion:
   - author: userId → Should be ObjectID ✅
```

#### **What's ACTUALLY happening (based on your issue):**

```
JWT Callback is using the WRONG value:

   ❌ WRONG: token.sub = account.providerAccountId  (UUID)
   ✅ CORRECT: token.sub = existingAccount.userId.toString()  (ObjectID)
```

---

## The Bug Location

### File: `auth.ts` - JWT Callback (Lines 51-67)

**Current Code:**

```typescript
async jwt({ token, account }) {
  if (account) {
    const { data: existingAccount, success } = (await api.accounts.getByProvider(
      account.type === "credentials" ? token.email! : account.providerAccountId
    )) as ActionResponse<IAccountDoc>;

    if (!success || !existingAccount) return token;

    const userId = existingAccount.userId;

    if (userId) token.sub = userId.toString();  // ✅ This SHOULD work
  }
  return token;
}
```

**Potential Issue:**

- The code looks correct, but check if `userId` is being serialized properly
- The `IAccountDoc` might not be including the `userId` field
- Or `getByProvider` API is not returning the full Account document

---

## Solution

### Fix 1: Ensure Account Serialization

In `app/api/accounts/provider/route.ts`, explicitly select the userId field:

```typescript
const account = await Account.findOne({ providerAccountId }).lean();
// .lean() ensures proper serialization
```

### Fix 2: Add Explicit Population (if using references)

```typescript
const account = await Account.findOne({ providerAccountId }).populate("userId").lean();
```

### Fix 3: Validate the JWT Callback

Add console logging to verify what's being stored:

```typescript
async jwt({ token, account }) {
  if (account) {
    const { data: existingAccount, success } = (await api.accounts.getByProvider(
      account.type === "credentials" ? token.email! : account.providerAccountId
    )) as ActionResponse<IAccountDoc>;

    if (!success || !existingAccount) return token;

    const userId = existingAccount.userId;
    console.log("🔍 Account Data:", { userId, type: typeof userId });

    if (userId) {
      token.sub = userId.toString();
      console.log("✅ token.sub set to:", token.sub);
    } else {
      console.error("❌ userId is missing:", existingAccount);
    }
  }
  return token;
}
```

---

## Files Involved

| File                                      | Role                               | Issue                                    |
| ----------------------------------------- | ---------------------------------- | ---------------------------------------- |
| `auth.ts`                                 | JWT & Session callbacks            | Might not be extracting userId correctly |
| `app/api/auth/signin-with-oauth/route.ts` | OAuth account creation             | Creates Account with correct userId ✅   |
| `app/api/accounts/provider/route.ts`      | Fetch Account by providerAccountId | May not serialize userId properly        |
| `lib/action/question.action.ts`           | Creates question with author ID    | Using whatever comes from session        |
| `database/account.model.ts`               | Account schema                     | Structure looks correct                  |
| `database/user.model.ts`                  | User schema                        | Structure looks correct                  |

---

## Debugging Steps

1. **Log what's being stored in session:**

   ```typescript
   // In session callback
   console.log("Session user.id:", session.user.id);
   console.log("Is it UUID or ObjectID?", session.user.id.length);
   // UUID ≈ 36 chars | ObjectID = 24 chars
   ```

2. **Check the database:**

   ```javascript
   // In MongoDB
   db.accounts.findOne({}).pretty();
   // Verify userId field is a valid ObjectID reference
   ```

3. **Verify API response:**
   - Hit `/api/accounts/provider` endpoint with a providerAccountId
   - Check if the returned Account includes `userId` field
