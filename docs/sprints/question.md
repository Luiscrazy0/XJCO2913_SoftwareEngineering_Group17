# Sprint 3 Plan Review - Questions for Scrum Master

After reviewing the current project state and Sprint 3 plan, I've identified several critical areas that need clarification from the development team/scrum master. Here's my analysis and questions:

## Current Project Analysis

**Existing Implementation:**
- No feedback/damage report functionality currently exists in the codebase
- Backend modules: Booking, Scooter, Station, Payment, Auth, and Statistics are implemented
- Frontend has basic booking flow, map integration, and admin views
- Prisma Schema shows recent additions for stations, extensions, and P3 features

**Sprint 3 Plan Coverage:**
The plan is comprehensive and includes:
- ID 13: Submit Feedback (Fault/Damage Report)
- ID 14: Prioritize Feedback (Manager Only)
- ID 15: View High Priority Issues
- Additional features: Battery charging fees, insurance acknowledgment, return check integration

## Critical Questions & Uncertainties

### 1. **Backend Architecture & Module Organization**
- **Question**: Should the Feedback module be a new standalone module (`backend/src/modules/feedback/`) or integrated into an existing module (e.g., Booking or Scooter)?
- **Context**: The plan suggests new APIs (`/api/feedbacks`) but doesn't specify module structure. Given existing patterns (BookingModule, ScooterModule, StationModule), a dedicated `FeedbackModule` seems appropriate.

### 2. **User Role & Permission System**
- **Question**: What are the exact roles and permissions in the system?
- **Current State**: Code shows `MANAGER` and `CUSTOMER` roles, but the plan mentions "admin" and "manager" interchangeably
- **Specific Need**: Clarify role hierarchy for feedback management permissions

### 3. **Image Upload Implementation**
- **Question**: What's the planned approach for image upload in damage reports?
- **Plan States**: "基础版可使用 `imageUrl`" (basic version can use imageUrl)
- **Need Details**: 
  - Should we implement file upload to local storage or cloud (S3, etc.)?
  - Is there a budget/resource constraint for image hosting?
  - Can we use placeholder URLs for MVP?

### 4. **Booking Status Flow Integration**
- **Question**: How does the feedback system integrate with existing booking statuses?
- **Current Booking Statuses**: `PENDING_PAYMENT`, `CONFIRMED`, `EXTENDED`, `CANCELLED`
- **Missing Status**: No explicit "RETURNED" or "COMPLETED" status for post-ride feedback
- **Need**: Clarify when users can submit feedback (during ride vs after return)

### 5. **Battery Level Tracking Implementation**
- **Question**: How is battery level data captured in the current system?
- **Plan Requires**: `startBatteryLevel` and `endBatteryLevel` fields
- **Technical Gap**: No evidence of IoT integration or manual battery input mechanism
- **Question**: Is this manual user input, employee verification, or automated?

### 6. **Priority Escalation Rules**
- **Question**: What are the business rules for automatic priority escalation?
- **Plan Mentions**: `DAMAGE` reports automatically get `HIGH` priority
- **Need Details**: 
  - Are there time-based escalation rules (e.g., URGENT after 24h unaddressed)?
  - What triggers `ESCALATED` vs `CHARGEABLE` status?

### 7. **Payment Integration for Chargeable Damage**
- **Question**: How does the `CHARGEABLE` status integrate with existing payment system?
- **Current Payment**: Basic PaymentModule exists with success/failed statuses
- **Need**: Clarify workflow from `CHARGEABLE` feedback to actual payment collection

### 8. **Frontend Scope & Page Structure**
- **Question**: What frontend pages are priority for Sprint 3?
- **Sprint 3 Steps Document**: Lists multiple pages (`/feedback/new`, `/my-feedbacks`, `/admin/feedbacks`, etc.)
- **Question**: Given time constraints, which pages are MVP vs nice-to-have?

### 9. **Audit Trail Requirements**
- **Question**: What level of audit tracking is required?
- **Plan Mentions**: `updatedBy` and `updatedAt` timestamps
- **Question**: Do we need full action history (create, update, status changes) or just latest update?

### 10. **Insurance Disclaimer Content**
- **Question**: What's the exact insurance disclaimer text and legal requirements?
- **Plan States**: Add insurance acknowledgment checkbox
- **Need**: Legal/compliance text for disclaimer and storage requirements

### 11. **Testing & Quality Assurance**
- **Question**: What are the testing expectations for Sprint 3?
- **Current State**: Limited test coverage observed
- **Need**: Clarify if unit tests, integration tests, or manual testing is acceptable

### 12. **Data Migration Strategy**
- **Question**: How to handle existing bookings without battery/insurance data?
- **New Fields**: `startBatteryLevel`, `endBatteryLevel`, `insuranceAcknowledged`
- **Need**: Backfill strategy for historical data vs. new bookings only

## Recommendation

**I suggest a 15-minute scrum meeting to discuss:**
1. Technical architecture decisions (module structure, image upload)
2. Business rule clarifications (priority escalation, payment workflow)
3. MVP scope prioritization given Sprint 3 timeline
4. Resource/budget constraints for cloud services (image hosting, email, etc.)

This will ensure the implementation aligns with team standards and business requirements before proceeding with development.

<task_progress>
- [x] Analyze current project state
- [x] Review Sprint 3 plan for gaps
- [x] Identify questions for scrum master
- [x] Prepare feedback report
</task_progress>