# Implementation Plan - Low-Latency Caching Visualization & Interactive Playground

This plan details how we will enhance the prototype to visually and interactively demonstrate that the platform meets the sub-second and low-latency performance requirements (< 100ms) under a load of 1M to 5M daily queries. 

We will introduce an **Interactive Cache & Latency Simulation Panel** directly within the **Partner API Sandbox** of the web interface.

---

## User Review Required

Please review the proposed design and visual components for the caching demonstration:
> [!IMPORTANT]
> - **Active Cache & Latency Monitor**: Add a live gauge indicating cache hits (Redis, < 10ms) vs feature refreshes (DynamoDB, < 50ms) vs cold database fallback queries (MySQL/Redshift, > 150ms).
> - **Interactive Cache Mode Selector**: Let the user choose between `Auto (Redis Cache Hit)`, `Bypass (Dirty Flag Raised)`, and `Cold DB Fallback (Cache Miss)` to directly test and observe how different pathways affect query latency.
> - **Live Cache Statistics Dashboard**: Display real-time moving metrics (Hit Ratio: ~98.7%, Avg Latency: ~6.4ms, Peak Throughput capacity: ~5,800 QPS, and memory sizes) to prove architectural scalability under 500+ QPS load.
> - **Refined Sandbox Trace Logs**: Update the simulated wire traces in the terminal box to output precise Cache lookup, DynamoDB reads, and Redis keyspace updates.

---

## Proposed Changes

### 1. Frontend Web Prototype Changes

#### [MODIFY] [TechnicalArchitecture.tsx](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/frontend/src/components/TechnicalArchitecture.tsx)
- Add state variables:
  - `cacheMode` (options: `hit`, `dirty_bypass`, `miss`)
  - `simulatedLatency` (number)
  - `simulatedCacheStatus` (string)
  - `liveStats` (dict with Hit Ratio, Avg Latency, Peak QPS, Memory)
- Implement a `useEffect` interval that slightly randomizes the cache stats (e.g., Hit Ratio drifts between 98.4% and 98.9%, throughput dynamically fluctuates) to make the dashboard feel alive.
- Update `handleRunSandbox` to:
  - Respect the selected `cacheMode`.
  - Simulate a precise latency value:
    * `hit`: **3.5ms to 7.8ms**
    * `dirty_bypass`: **45.0ms to 78.0ms**
    * `miss`: **160.0ms to 240.0ms**
  - Append detailed caching-specific telemetry logs to the sandbox terminal output (e.g. key checks, cache bypass indicators, promotion updates).
- Add a **Live Cache & Performance Monitor** widget in the layout next to the "Rest API Sandbox":
  - Renders a horizontal latency speedometer or colored gauge (Green for <10ms, Amber for <100ms, Red for >100ms).
  - Renders Cache Status badges (`HIT (Redis)`, `BYPASS (Dirty Flag)`, `MISS (Cold DB)`).
  - Renders the moving Cache Statistics dashboard (Hit Ratio, Avg Latency, Max QPS capacity, and Active Keyspace Size).

---

### 2. Documentation and Presentation Narratives

#### [MODIFY] [walkthrough.md](file:///C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/walkthrough.md)
- Update the walkthrough to document the interactive caching visualizer, latency meter, and stats widget.

#### [MODIFY] [design_document.md](file:///C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/design_document.md)
- Fully document the low-latency caching design system and cache invalidation flows in Section 7.

#### [MODIFY] [demo_narrative.md](file:///C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/demo_narrative.md)
#### [MODIFY] [presentation_script.md](file:///C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/presentation_script.md)
- Enhance presentation scripts and word-for-word lines to walk through selecting different caching modes in the live demo and demonstrating latency performance under 10ms.

#### [MODIFY] [EnStream_Detailed_Technical_Architecture.docx](file:///C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/EnStream_Detailed_Technical_Architecture.docx)
#### [MODIFY] [EnStream_Fraud_Intelligence_Platform_Demo_Narrative.docx](file:///C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/EnStream_Fraud_Intelligence_Platform_Demo_Narrative.docx)
#### [MODIFY] [EnStream_Prototype_Presentation_Script.docx](file:///C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/EnStream_Prototype_Presentation_Script.docx)
- Regenerate Word docs incorporating the cache visualization changes.

---

## Verification Plan

### Automated Build Verification
- Compile and build the React TypeScript frontend inside `frontend/` to confirm zero static compiler errors:
  ```powershell
  npm.cmd run build
  ```

### Manual Verification
- Test all three cache modes (`Auto`, `Bypass`, `Miss`) inside the sandbox and verify the latency meter matches the expectations (< 10ms for hit, < 100ms for bypass, > 150ms for miss).
- Verify stats widgets update dynamically and look professional.
