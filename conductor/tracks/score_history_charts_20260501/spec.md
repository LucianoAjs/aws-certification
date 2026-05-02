# Specification: Enhance Dashboard with Score History Charts

## Goal
Provide users with a visual representation of their study progress and performance on the dashboard using interactive charts.

## Requirements
- **Score History Chart:** A line chart showing the score percentage of the last 10-20 finished attempts over time.
- **Domain Performance Chart:** A bar chart showing the average score per AWS service/exam domain (based on block titles).
- **Summary Statistics:** Highlight cards for "Average Score", "Best Score", and "Total Exams Completed".
- **Interactivity:** Tooltips on charts to show specific exam details.
- **Responsive Design:** Charts must scale appropriately for mobile and desktop views.

## Technical Details
- **Frontend:** Use PrimeNG `p-chart` which wraps `Chart.js`.
- **Backend:** Update `ProgressService` to include data grouped by date and by block title for chart consumption.
- **Data Source:** Existing `Attempt` table in SQLite.
