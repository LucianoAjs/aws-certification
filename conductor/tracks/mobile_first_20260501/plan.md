# Implementation Plan: Mobile-First Frontend Refactor

## Phase 1: Global Layout & Navigation
- [ ] Task: Create Bottom Tab Bar Component
  - [ ] Write failing test for `BottomTabBarComponent` verifying navigation links.
  - [ ] Implement `BottomTabBarComponent` using PrimeNG components and PrimeFlex styling.
- [ ] Task: Update App Shell for Mobile
  - [ ] Write failing test verifying sidebar visibility logic based on screen size (or verify structural directives).
  - [ ] Implement responsive behavior in `AppShellComponent` to toggle between Sidebar (desktop) and Bottom Tab Bar (mobile).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Global Layout' (Protocol in workflow.md)

## Phase 2: Dashboard & Theme Management
- [ ] Task: Refactor Dashboard Layout
  - [ ] Write failing test for `DashboardComponent` verifying layout structure classes.
  - [ ] Implement mobile-first flexbox utility classes (e.g., `flex-column md:flex-row`) to stack summary cards and charts vertically on small screens.
- [ ] Task: Refactor Theme Management Layout
  - [ ] Write failing test for `ThemesComponent` ensuring form inputs and lists are responsive.
  - [ ] Apply PrimeFlex responsive classes to forms and list elements, ensuring inputs have sufficient touch areas.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Dashboard & Themes' (Protocol in workflow.md)

## Phase 3: Exam View Optimization
- [ ] Task: Enhance Exam Component for Mobile
  - [ ] Write failing test for `ExamComponent` ensuring the timer and progress bar adapt to narrow widths.
  - [ ] Update HTML to use full width (`w-full`) for multiple-choice options with large touch areas (e.g., min 44x44px).
  - [ ] Ensure the "Next/Previous" buttons are easily accessible at the bottom of the screen.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Exam View' (Protocol in workflow.md)