# Research

Copied verbatim from `docs/devin-initial-review.md` §7 (pages verified October 6, 2026).

### Research basis — sourced facts vs. derived vs. assumptions

**Sourced facts** (official/primary documents; pages verified by downloading the PDFs and extracting text on October 6, 2026):

1. IBM Redpaper **REDP-4484**, *Considerations for RAID-6 Availability and Format/Rebuild Performance on the DS5000* (2009, updated 2010), https://www.redbooks.ibm.com/redpapers/pdfs/redp4484.pdf, **printed page 3**, section "Writing one strip": "This results in a total of four I/O operations to the HDDs. Read and write the data and read and write the parity." and "Reading and writing two parity disks instead of one requires four operations. RAID-6 requires six operations in total (read and write two parity disks plus the data)." The same page notes that for sequential operations full strips are often already in cache and the arithmetic changes — which is why the spec confines the model to small random writes.
2. IBM Redbook **SG24-7808**, *End to End Performance Management on IBM i* (November 2009), https://www.redbooks.ibm.com/redbooks/pdfs/sg247808.pdf, Appendix A "Understanding disk performance metrics", **printed pages 249–250**: "It takes four disk accesses to perform a write to a RAID 5 protected disk device. It takes six disk accesses for RAID 6. But with a write cache, an application does not care about all these disk accesses." This is the document the current spec links; the title should be corrected (E-9). Its write-cache remark also supports the spec's statement that write-back cache changes *latency* perception, not sustained backend operation count.
3. Dell Technologies Info Hub, *OneFS Writes*, https://infohub.delltechnologies.com/en-us/p/onefs-writes/: "Failure-safe buffering using a write coalescer is used to ensure that writes are efficient and read-modify-write operations are avoided." Supports the spec's boundary that RAID level alone cannot determine load on coalescing/erasure-coded systems. (Page fetched via search excerpt; the Info Hub returned HTTP 403 to direct fetch, so the quote should be re-confirmed in a browser during M0.)

Both IBM documents are marked "for reference only; product withdrawn or replaced" — they are used for the general read-modify-write arithmetic, not for any product claim.

**Derived calculations:** everything marked [D] in the profile proposal (usable capacity from raw and layout, budgets, weighted block sizes, throughput, backend operations, projections, percentiles, bucket means). Each is reproducible by hand and is mapped to a test above.

**Synthetic assumptions:** all limits, demand schedules, growth rates, latency values, cache fraction, block sizes and protection capabilities in the profile proposal. No vendor benchmark, VMware or RAG measurement, or industry survey was consulted or is implied. No vendor API research was performed (consistent with the spec's "future adapters only").

### Not researched

- Vendor APIs (PowerMax REST, ONTAP REST) — deferred to future adapter work.
- VMware or RAG storage benchmarks — no measurements consulted; workload numbers are synthetic assumptions.
- Industry surveys — none consulted.
