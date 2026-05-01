# Add AWS IAM Security Practice Exam

### Added

- AWS IAM and basic security timed practice exam with 60 original questions split into three blocks of 20.

## Context

The user requested a timed 60-question IAM/basic security practice exam, split into blocks of 20, using local SAA-C03 sample files as a format reference and AWS documentation for accuracy.

## Changes Made

- Added an original Markdown practice exam under `docs/reference/aws-study/`.
- Structured the exam into three timed blocks of 20 questions each.
- Added an answer key with short explanations and links to official AWS documentation consulted.

## Verification

- Used the locally configured AWS Docs MCP server through the MCP stdio client to call `search_documentation`, `read_sections`, and `read_documentation` for IAM best practices, IAM policy evaluation, EC2 roles, S3 Block Public Access, AWS KMS key policies, and Secrets Manager replication.
- Verified the configured AWS Serverless MCP server starts and exposes 25 tools, including `sam_build`, `sam_deploy`, `sam_logs`, and guidance tools.
- Count validation passed: 60 questions, 60 answer key entries, and 3 timed blocks.
- Answer distribution validation passed: A=10, B=18, C=16, D=16.
