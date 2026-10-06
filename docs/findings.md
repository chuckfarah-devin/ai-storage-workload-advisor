# Findings

Findings are produced in milestone M4 after verification. **Nothing is claimed yet.**

## Known model boundaries already established

From `technical-spec.md` §Backend (bounded V1 model), the following are outside the backend calculation:

- Full-stripe writes
- Modern distributed erasure coding
- Compression / deduplication
- Metadata IO
- Flash internal write amplification
- Replication overhead
- Rebuild / degraded-state load

Additionally: **post-addition latency is unknown in V1** — there is no validated response curve, so the latency dimension can never return *modeled ready*, and the overall result is never an unconditional *modeled ready*.
