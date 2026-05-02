# Product Guidelines - AWS Cert Trainer

## Prose & Voice
- **Tone:** Encouraging, professional, and educational.
- **Language:** English (primary for AWS content), but UI should support localization if needed.
- **Clarity:** Exam questions and explanations must be technically accurate and easy to read. Avoid jargon where simpler terms suffice, unless the jargon is part of the AWS exam lexicon.

## User Experience (UX)
- **Simplicity:** The interface should minimize distractions during exams.
- **Feedback:** Provide immediate feedback for practice modes and summary feedback for timed modes.
- **Accessibility:** Ensure high contrast for text and keyboard navigability for exam questions.
- **Consistency:** Use consistent PrimeNG components and PrimeFlex layouts across the dashboard and exam pages.

## Performance & Technical Quality
- **Local First:** Prioritize speed of local data access. Ensure large question banks don't degrade UI responsiveness.
- **Data Integrity:** Validate CSV/Markdown imports strictly to prevent corrupted exam data.
- **Stability:** The exam timer must be robust and persist across page refreshes if possible.

## Branding
- **Color Palette:** Use AWS-inspired colors (Orange, Deep Blue, White) to create a familiar environment for candidates.
- **Typography:** Use clean, sans-serif fonts (e.g., Roboto, Open Sans) for better readability of long technical passages.
