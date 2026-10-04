# Plan

## How it is used

1. A consultant works at a client and logs hours in the client's system, where the client approves them.
2. The consultant uploads a screenshot of that approved timesheet to the employee site, with the period and hours.
3. An approver at the consulting company compares the screenshot with the entered hours and approves or rejects with a comment.
4. Approved timesheets are locked and exported for invoicing and payroll.

## Phases

- [x] **1. Foundation**: monorepo, schema, Google and password sign-in, role checks.
- [ ] **2. Employee site**: submit a timesheet (project, period, hours, screenshots), list with status, resubmit after rejection.
- [ ] **3. Approver site**: pending queue, screenshot viewer, approve/reject with comment, audit trail.
- [ ] **4. Admin**: add users and send set-password links by email, manage clients, projects and assignments.
- [ ] **5. Polish**: reminders for missing timesheets, CSV export, password reset by email, tests.
- [ ] **6. Deploy**: hosting, two domains, CI.

## Rules

- Screenshots live in a private bucket and are served only through short-lived signed URLs.
- Roles are checked on the server on every request.
- Approvers cannot approve their own timesheets.
- Every decision is recorded in `approvals`.

## Open decisions

- File storage provider (Google Cloud Storage or S3).
- Whether any approver can approve anyone, or each project has assigned approvers.
- Email provider for links and reminders.
