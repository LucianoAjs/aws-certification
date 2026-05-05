# Add AWS EC2 Fundamentals Practice Exam

### Added

- AWS EC2 Fundamentals timed practice exam with 85 original questions split into five blocks of 17.
- EC2 review table covering instance categories, pricing models, security groups, user data, SSH/Session Manager, IAM roles, and instance profiles.

## Context

The user requested questions for the May 2 study plan: Secao 5 EC2 Fundamentals, following the course order of budget, EC2 basics, user data, instance types, security groups, SSH, roles, purchasing options, and quiz.

The expected delivery included an EC2 table for types, pricing, security groups, and user data, plus 85 timed questions.

## Changes Made

- Added `aws-study/aws-ec2-fundamentals-timed-exam-85.md`.
- Added the EC2 exam to the backend Markdown seed flow so it is inserted like the IAM default theme.
- Structured the exam into 5 timed blocks of 17 questions each for a 2-hour timed session.
- Added a review table before the questions for quick caderno/mapa mental use.
- Added a commented answer key with 85 entries.
- Added official AWS documentation links consulted through the AWS Docs MCP.
- Used local materials as style and topic references:
  - `/home/lucksanjos/Downloads/AWS Certified Solutions Architect Associate SAA-C03.pdf`
  - `/home/lucksanjos/Downloads/AWS SAA-03 Solution.txt`
  - `aws-study/aws-iam-security-basic-timed-exam-60.md`
  - `2026-05-01-add-aws-iam-security-practice-exam/journal.md`

## Verification

- Used AWS Docs MCP `search_documentation`, `read_sections`, and `read_documentation` for EC2 concepts, instance types, user data, security groups, IAM roles for EC2, instance metadata/IMDS, Session Manager, AWS Budgets, and Capacity Reservations.
- Count validation passed: 85 questions, 85 answer key entries, and 5 timed blocks.
- Option validation passed: every question has A, B, C, and D alternatives.
- Answer distribution validation passed: A=22, B=22, C=21, D=20.
- Backend build passed with `npm run build`.
- Backend tests passed with `npm test -- --runInBand`.
- Database seed verification passed: `aws-ec2-fundamentals-85` exists as a shared system Markdown theme with 85 questions, split into 5 blocks of 17, each with a 24-minute time limit.
