# Chart design addendum — proposed interface requirement

Chuck requested demand/latency correlation charts on October 6, 2026. Carry this into the UI milestone, without expanding the current engine milestone.

- Shared X axis: time, explicit UTC and interval duration.
- Y1 selector: front-end IOPS or front-end bandwidth. Keep backend operations distinctly labeled in the backend evidence view; they are not host IOPS.
- Y2: baseline latency in milliseconds, using a separately labeled scale and dashed line. Do not infer causality from line overlap or label baseline latency as predicted post-addition latency.
- Use stable metric colors, explicit legends, and simultaneous timestamp details in the implemented chart. Demand operating-budget lines belong to Y1. Define any latency-target line separately against Y2 and do not mix mean latency with P95-target semantics.
- Canonical throughput remains bytes/second. Display decimal MB/s below 1,000 MB/s and GB/s at or above 1,000 MB/s (10^6 and 10^9 bytes/second). Select one unit for the whole chart from the largest displayed demand/reference value; never switch units point by point. Include the budget reference when selecting the unit so all chart values share a readable scale.
- Individual value cards may choose units independently, with visible labels. The same 2,400 MiB/s operating budget equals 2.5165824 GB/s; conversion changes presentation, not the assessment. Retain explicit MiB/s labels wherever binary units are used. Never relabel MiB/s as MB/s without conversion.
- Recalculate the displayed unit only when the scenario, metric, or time window changes. Keep it stable during hovering and playback. Tooltips and exports use the chart's chosen unit, with adequate precision.
- Verification: 100,000,000 bytes/s displays 100 MB/s; 2,500,000,000 displays 2.5 GB/s; unit boundary, budget conversion, metric toggle, dual-axis labels, narrow layout, and unchanged assessment results.

The current mockup illustrates this with a front-end demand/latency detail chart. Weekly backend evidence remains separate. Its values are design illustrations pending engine and trace verification.
