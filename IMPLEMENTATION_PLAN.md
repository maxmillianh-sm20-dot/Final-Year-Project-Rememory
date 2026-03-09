# Implementation Plan: Three Major Features

## Feature 1: Persona Image Upload + Profile Picture

### Backend Changes Required:
1. **Firebase Storage Setup**
   - Configure storage bucket
   - Set up security rules for image uploads
   - Create upload endpoint

2. **Database Schema Updates**
   - Add `imageUrl` field to persona documents
   - Update persona creation/update endpoints

3. **API Endpoints**
   - `POST /api/persona/upload-image` - Upload image to Firebase Storage
   - Update existing `POST /api/persona` to accept imageUrl
   - Update existing `PUT /api/persona/:id` to accept imageUrl

### Frontend Changes Required:
1. **PersonaSetup Page**
   - Add image upload component
   - Image preview functionality
   - File validation (size, type)
   - Upload progress indicator

2. **Chat Interface**
   - Update avatar display to use uploaded image
   - Fallback to default if no image

3. **Dashboard**
   - Display persona image

4. **Types**
   - Update Persona interface to include imageUrl

---

## Feature 2: 5-Day Grief Progression System

### Backend Changes Required:
1. **Database Schema**
   - Add `progressionDays` field to user/persona document
   - Add `lastLoginDate` field
   - Add `chatInteractionsToday` counter
   - Add `validLoginSessions` counter

2. **API Endpoints**
   - `POST /api/progression/check-login` - Validate login session
   - `POST /api/progression/track-interaction` - Track chat interactions
   - `GET /api/progression/status` - Get current progression status

3. **Business Logic**
   - Track login sessions
   - Count chat interactions (minimum 2)
   - Increment progression days by 5 on valid session
   - Reset daily interaction counter

### Frontend Changes Required:
1. **Background Color System**
   - Create color progression palette (Day 0 → Day 30)
   - Dynamic background based on progression days
   - Smooth transitions between colors

2. **AppContext Updates**
   - Add progression state management
   - Track chat interactions
   - Update progression on login

3. **UI Updates**
   - Apply dynamic background colors
   - Show progression indicator (optional)

4. **Color Palette Design**
   ```
   Day 0:  #F5F3FF (light lavender)
   Day 5:  #EDE9FE (soft purple)
   Day 10: #DDD6FE (medium purple)
   Day 15: #C4B5FD (deeper purple)
   Day 20: #A78BFA (rich purple)
   Day 25: #8B5CF6 (vibrant purple)
   Day 30: #7C3AED (deep purple/indigo)
   ```

---

## Feature 3: Terms & Conditions + Privacy Policy

### Backend Changes Required:
1. **Database Schema**
   - Add `agreedToTerms` boolean to user document
   - Add `termsAgreedAt` timestamp
   - Add `termsVersion` string (for future updates)

2. **API Endpoints**
   - `POST /api/user/accept-terms` - Record terms acceptance
   - `GET /api/user/terms-status` - Check if user accepted terms

3. **Validation**
   - Block persona creation if terms not accepted
   - Middleware to check terms acceptance

### Frontend Changes Required:
1. **Terms & Privacy Documents**
   - Create Terms of Service page/modal
   - Create Privacy Policy page/modal
   - Professional, legally sound content

2. **PersonaSetup Page**
   - Add checkbox for terms acceptance
   - Link to view terms
   - Block "Create Persona" button until checked

3. **Landing Page**
   - Add Terms & Privacy links in footer

4. **User Settings**
   - Show terms acceptance status
   - Link to view terms again

5. **Modal Component**
   - Scrollable modal for reading full terms
   - Accept/Decline buttons

6. **AppContext Updates**
   - Track terms acceptance status
   - Function to accept terms

---

## Implementation Priority

### Phase 1 (Highest Priority)
1. **Terms & Conditions** - Legal requirement, blocks persona creation
2. **Persona Image Upload** - Core UX improvement

### Phase 2 (Medium Priority)
3. **5-Day Progression System** - Complex feature, requires careful design

---

## Estimated Complexity

- **Feature 1 (Image Upload)**: Medium - 2-3 hours
- **Feature 2 (Progression System)**: High - 4-6 hours
- **Feature 3 (Terms & Conditions)**: Low-Medium - 1-2 hours

**Total**: 7-11 hours of development

---

## Next Steps

Which feature would you like me to implement first?

1. Terms & Conditions (quickest, legal requirement)
2. Persona Image Upload (better UX)
3. 5-Day Progression System (most complex)

Or should I implement them in the order listed above?
