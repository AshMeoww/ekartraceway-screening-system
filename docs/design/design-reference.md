# Design Reference

## Product Feel

This is an operational HR screening tool, not a marketing site. The interface should feel focused, trustworthy, and efficient. Prioritize dense but readable information, clear status signals, and calm visual hierarchy.

## Layout Principles

- Public pages should make jobs and application actions easy to find.
- Applicant account pages should emphasize saved applications, profile completeness, and next steps.
- HR pages should emphasize review queues, filters, score explanations, status changes, and audit-friendly context.
- Avoid nested cards and decorative page sections.
- Keep controls stable in size so filters, scores, badges, and buttons do not shift layout.

## Components

- Use buttons for clear commands.
- Use icons in compact tool buttons when the symbol is familiar.
- Use badges for statuses, parsing method, and advisory labels.
- Use tables for HR review lists, with filters above the table.
- Use cards only for distinct content groups, repeated items, and detail panels.

## Score Presentation

- Always place advisory-only language near score outputs.
- Show the breakdown: semantic fit, skills, experience, education, certifications, matched requirements, weak areas, and explanation.
- Do not use copy that implies automated approval, rejection, ranking certainty, or final hiring decisions.

## Accessibility And Responsiveness

- Text must fit within controls at mobile and desktop widths.
- Forms need visible labels and clear validation messages.
- Color cannot be the only way to communicate status.
- Tables should remain usable on small screens through horizontal scroll or responsive alternatives.

## Screenshot References

Approved screenshots live in `docs/design/screenshots/`. Use them as a lightweight design source of truth for important states. Update them when a feature intentionally changes a visual baseline.
