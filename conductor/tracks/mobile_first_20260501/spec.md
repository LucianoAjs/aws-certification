# Specification: Mobile-First Frontend Refactor

## Overview
Refactor the AWS Cert Trainer frontend to follow a "mobile-first" design philosophy, ensuring the application is fully usable and visually appealing on mobile devices (phones and tablets) before scaling up to desktop views.

## Functional Requirements
- **Global Layout & Navigation:**
  - Implement a mobile-first app shell.
  - Introduce a Bottom Tab Bar for main navigation on mobile screens (e.g., `< md` breakpoint).
  - Hide the traditional sidebar on mobile screens and rely on the Bottom Tab Bar.
  - Preserve the traditional sidebar on larger screens.
- **Dashboard:**
  - Ensure all summary statistics, progress bars, and charts stack vertically on small screens and use full width.
- **Exam View:**
  - Ensure the timer, progress bar, and question text are easily readable and tappable on small touch targets.
  - Make multiple-choice options full width with sufficient padding (minimum 44x44px touch targets).
- **Theme Management:**
  - Ensure forms, inputs, and file upload areas are responsive.
  - Tables or lists of themes should become scrollable horizontally or stack vertically.

## Non-Functional Requirements
- **Technology:** Primarily leverage existing PrimeFlex responsive utilities (e.g., `flex-column md:flex-row`, `w-full md:w-auto`). Avoid writing custom media queries in SCSS unless strictly necessary for edge cases.
- **Performance:** Ensure mobile rendering does not introduce layout shifts or performance bottlenecks.
- **UX/UI:** Adhere to standard mobile app patterns (Bottom Tab Bar, large touch targets) and the existing PrimeNG component library.

## Acceptance Criteria
- [ ] Application can be fully navigated on a mobile device (emulated or physical) without zooming or horizontal scrolling.
- [ ] Bottom Tab Bar correctly switches views on mobile, while desktop users see the standard sidebar.
- [ ] Exams can be taken seamlessly on a mobile device.
- [ ] No regressions in the desktop view.

## Out of Scope
- Adding new functional features (e.g., new charts, new exam modes) beyond layout adjustments.
- Changes to the NestJS backend or SQLite database structure.