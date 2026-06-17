# EnStream Fraud Intelligence Platform - 30-Minute Demonstration Narrative (Roadmap-Centric)

This document provides a detailed, step-by-step presentation outline and narrative for a **30-minute live demonstration** of the **EnStream Fraud Intelligence Platform** prototype. The demo is structured directly around the **5-Phase Transition Roadmap**, taking the audience through the entire project lifecycle.

---

## 30-Minute Demo Segment Breakdown

| Roadmap Phase | Demo Segment | Key Prototype View / Clicks | Focus Area | Duration |
| :--- | :--- | :--- | :--- | :--- |
| **Setup** | Opening Screen & Context | `Technical Working` -> `Phase Roadmap` subtab | Project context, objectives, legacy setup | 3 Mins |
| **Phase 1** | Batch Operationalized | `Medallion Spec` -> `Technical Working` -> `Vendor Brief` -> `Ops Center` | Legacy MySQL reporting scope, Spark aggregations, MWAA | 5 Mins |
| **Phase 2** | Batch Automated | `DQ Monitor` -> `Pipeline Self-Healing` -> `ML Registry` | SLA Rules Ledger, automated self-healing, Drift monitor (PSI) | 5 Mins |
| **Phase 3** | Interim Real-Time | `Technical Working` -> `Partner API Sandbox` | 13 standard APIs, Basic Auth, Jakarta Agent, JWS/JWE wraps | 5 Mins |
| **Phase 4** | Source-Direct Real-Time | `Partner API Sandbox` -> `Live Cache Monitor` -> `Event Ingress` -> `Query Investigator` | Caching visualizer (sub-10ms), live streams, BFS Graph walk, Iceberg time-travel | 6 Mins |
| **Phase 5** | Continuous Everything | `Exchange Hub` -> `Executive Desk` | contribution ledger, PII masking, fraud rings, aggregates | 4 Mins |
| **Summary** | Demo Conclusion & Q&A | `Technical Working` -> `Vendor Brief` | Competitive parity (vs Subex/Fraudzap), open-table advantages | 2 Mins |

---

## Segment 1: Opening Screen & Platform Context (3 Mins)

### Spoken Word Target: ~400 words
### Visual Setup: 
- Load the web application.
- In the left sidebar navigation, click on the **Technical Working** tab.
- Select the **Phase Roadmap** subtab at the top of the pane.

### Walkthrough & Script:
> **Speaker Spoken Script:**
> "Welcome, everyone. Thank you for joining today's deep-dive demonstration of the EnStream Fraud Intelligence Platform. 
> 
> As we begin, you are looking at our live control panel, specifically configured to show our **Transition Roadmap: Path to Northstar Architecture**. EnStream operates as a real-time trust and fraud intelligence clearinghouse for carrier networks and financial institutions. Our primary objective is to compute risk scoring features, detect fraudulent behaviors—such as SIM swapping and device-churning fraud rings—and return a dynamic, explainable trust score.
> 
> However, building a large-scale data platform for telco volumes cannot happen in a single, massive deployment. It requires a carefully phased transition from legacy databases to a high-performance, real-time, medallion-based data lakehouse. We have structured this evolution into five distinct phases, which you can see outlined on the screen: 
> 1. **Phase 1: Batch Operationalized**: Building the baseline ingestion and promoción architecture.
> 2. **Phase 2: Batch Automated**: Adding robust orchestration, quality gates, and drift analytics.
> 3. **Phase 3: Interim Real-Time**: Exposing developer sandbox endpoints compliant with our partner integration guides.
> 4. **Phase 4: Source-Direct Real-Time**: Implementing direct carrier streaming feeds and point-lookup cache layers.
> 5. **Phase 5: Continuous Everything**: Operationalizing automated retraining loops and multi-sector fraud exchange hubs.
> 
> In this 30-minute demonstration, we will walk through each phase one by one. I will navigate to the relevant consoles in the prototype to show you the exact code execution, pipeline flows, and dashboards that satisfy the strict acceptance criteria for each milestone. Let's begin with Phase 1."

---

## Segment 2: Phase 1 - Batch Operationalized (5 Mins)

### Spoken Word Target: ~680 words
### Visual Clicks & Console Actions:
1. Navigate to the **Medallion Spec** tab in the sidebar.
2. Scroll to the bottom to display the **MySQL Reporting Database Integration Scope**.
3. Point out the conformed data tables: Customer Events (`api_requests`) and Customer Journey Events (`lineage_updates`).
4. Click on the **Technical Working** tab in the sidebar, and select the **Vendor Brief & Feedback** subtab.
5. Highlight the **MySQL Database & Volume Specs** card: 1.0 TB size, growing at 7 GB/day, ingress rate of 400 records/second.
6. Navigate to the **Ops Center** tab in the sidebar. Show the live scrolling CLI logs demonstrating the Spark batch promotions.

### Walkthrough & Script:
> **Speaker Spoken Script:**
> "Phase 1 represents the 'As-Is' legacy infrastructure that our vendor teams inherit. The baseline starting point is a **1.0 Terabyte MySQL reporting database** growing at **7 Gigabytes every single day**, carrying records of API requests and customer-specific events from Rogers, Bell, and Telus. At peak, this database receives **400 raw records per second** excluding Rogers, which drops batch files every two minutes.
> 
> Let's look at the **Medallion Spec** tab. Here, you see how we map this legacy schema to a conformed Medallion lakehouse. Our Bronze layer lands raw JSON strings directly from the event streams to guarantee data persistence. We limit the scope of our database promotion effort to the precise tables defined in the vendor brief: records of customer API requests and customer journey events.
> 
> Under Phase 1, our primary goal is to operationalize this batch data flow. We move data incrementally from the MySQL reporting database to an S3 Parquet landing zone using Spark batch runs. In our **Vendor Brief** subtab under Technical Working, you can see our orchestration assessment: we utilize **AWS Managed Workflows for Apache Airflow (MWAA)** to schedule these batch promotion jobs. MWAA gives us the Python-native flexibility to trace retries and manage complex DAG schedules.
> 
> Now, let's inspect the **Ops Center**. This terminal console simulates the live execution log of these batch runs. As you can see, our Spark promotion jobs run incrementally, reading raw records from the Bronze table, running initial schema validations, promoting them to conformed formats in the Silver table, and building our analytical Gold tables.
> 
> **Phase 1 Acceptance Criteria Fulfillment:**
> How do we prove that Phase 1 is successfully completed? The criteria require that our score outputs match the PoC holdout data exactly and that database reads are fully idempotent. In the terminal log, you can see that each Spark promotion task utilizes partition-level overwrites based on event timestamps. This ensures that even if a pipeline runs twice, the destination database remains conformed and duplicate rows are prevented. With the baseline batch pipeline running stably, we can proceed to automate and govern the data lifecycle in Phase 2."

---

## Segment 3: Phase 2 - Batch Automated & DQ SLAs (5 Mins)

### Spoken Word Target: ~700 words
### Visual Clicks & Console Actions:
1. Navigate to the **DQ Monitor** tab in the sidebar.
2. Direct attention to the **Ingestion Latency SLAs** cards (Bell: 1.2s, Telus: 1.5s, Rogers: 1.9s) and explain the live indicators.
3. Review the **SLA Rules Audit Ledger** table, showing conformed checks like `CHECK_MSISDN_FORMAT`, `CHECK_IMEI_LENGTH`, `CHECK_FRESHNESS_SLA`, and `CHECK_SCHEMA_COMPLETENESS` all showing a green `PASS` state.
4. Go to the **Pipeline Self-Healing & Reconciliation Console** at the bottom. Click **"Trigger Manual Reconciliation Audit"**. Watch the self-healing log execute: scanning, detecting missing records, backfilling, and promoting.
5. Click on the **ML Registry** tab in the sidebar. Point out the Drift Monitoring panel showing the Population Stability Index (PSI) graph and the model registry champion metadata.

### Walkthrough & Script:
> **Speaker Spoken Script:**
> "Once the batch pipeline is operational, Phase 2 focuses on automation, quality SLA governance, and continuous model monitoring. Real-time telco fraud detection requires strict data quality checks before any record can be used to update a subscriber's risk profile.
> 
> If we navigate to the **DQ Monitor** tab, we can see the automated governance system in action. First, look at the **Ingestion Latency SLA** cards. Because Rogers drops event files every 2 minutes while Bell and Telus stream live, our pipeline monitor tracks the latency of raw inputs. You can see Rogers average latency is 1.9 seconds, which complies with our target 2-minute SLA.
> 
> Directly below, the **SLA Rules Audit Ledger** displays conformed validations running on the promotion schedules. Each event is evaluated against structural constraints: verifying E.164 phone number formatting, checking that carrier activations include a valid 15-digit device IMEI, and enforcing freshness thresholds of less than 2 hours. If a record violates any of these, it is instantly routed to a Quarantine log.
> 
> Let's look at the **Pipeline Self-Healing Console**. In any distributed architecture, network outages or carrier sync failures will occur, leading to missing data. I will click **"Trigger Manual Reconciliation Audit"** to simulate a carrier sync failure. You can see the system scan the historical sequence counts, detect a gap of 1,200 records from Rogers, execute an automated backfill query, and run reconciliation promotions to merge the conformed data back into the Silver Iceberg tables.
> 
> Additionally, our automated batch system must ensure that the ML models scoring these events do not drift. Let's look at the **ML Registry** tab. Here, the platform monitors our champion model's feature inputs. The **Population Stability Index (PSI)** chart tracks input distributions. If a carrier changes its activation format and our feature distributions shift, the PSI value rises. If it exceeds 0.2, an automated alert triggers to initiate retraining.
> 
> **Phase 2 Acceptance Criteria Fulfillment:**
> Phase 2 is completed when ingestion pipelines run on schedule, data quality meets SLA rules, and we run successful rollback drills. The self-healing audit ledger and drift dashboard prove that the platform maintains zero score drift and can dynamically heal itself during carrier outages without human intervention. This brings us to Phase 3, where we expose the data via REST interfaces."

---

## Segment 4: Phase 3 - Interim Real-Time & Partner API Sandbox (5 Mins)

### Spoken Word Target: ~700 words
### Visual Clicks & Console Actions:
1. Navigate to the **Technical Working** tab in the sidebar.
2. Select the **Partner API Sandbox** subtab at the top.
3. Show the **Select Guide Rest API** sidebar list containing all 13 standard APIs. Select a few to show the JSON requests changing:
   - Click `A1: Basic Identity Verification (IDV) API` (shows name/address matching).
   - Click `A3: Account Type API` (shows prepaid/postpaid and consumer/business parameters).
   - Click `D3M: Recent Service Changes API (Multi)` (shows multiple MSISDN input arrays).
4. Direct attention to the **Security Configuration** checkbox. Check the box **"Enable JOSE JWS/JWE Protection (RFC7515/7516)"** and show the JWS protected headers display.
5. Click **"Send Rest API Request"** with `Security JOSE` enabled. Point out the terminal log displaying signature algorithms (`RS256`), client key identifiers (`kid`), and encrypted wire envelopes.
6. Scroll down to review the **Response Code Explanation Ledger** showing conformed mappings for Codes 0, 1, 2, 3, 4, 7, 14, 15, 16, 18, 28, 400, 500.

### Walkthrough & Script:
> **Speaker Spoken Script:**
> "With Phase 3, we transition to real-time integration. In this phase, we establish an interim real-time query layer. While carrier streaming streams are being set up, we serve real-time scoring requests via Kinesis MSK indexing and Flink streaming, querying conformed profile tables.
> 
> To enable partner integrations, we must align our interface with the **EnStream Network Subscriber Verification Core - Partner Integration Guide Phase 2.0 v1.38**. Let's open the **Partner API Sandbox** under Technical Working.
> 
> This playground exposes all 13 standard REST APIs defined in the integration guide. In the sidebar list, I can select any operation. For instance, selecting **A1 Basic IDV** displays the exact request schema for validating customer names and conformed carrier address fields. Selecting **A3 Account Type** retrieves prepaid/postpaid flags, business class preferences, and language codes. Selecting **D3M Multi recent changes** allows partners to query up to five subscriber numbers in a single batch array to check for SIM swaps.
> 
> Furthermore, security is paramount. The integration guide mandates strict cryptographic envelopes. I will check the box to **'Enable JOSE JWS/JWE Protection'**. When enabled, the system wraps our request in an RFC7515/7516 compliant signature and encryption layer. Clicking **'Send Rest API Request'** executes a simulated VPN call. The terminal log displays the HTTP Basic Authentication headers and Jakarta User-Agent tags, then shows the JWS protected header—complete with RS256 algorithm signatures, partner key identifiers, expiration timestamps, and operation tags. The request payload is encrypted using AES-256-GCM, matching the carrier's production security profile.
> 
> Directly below, the **Response Code Explanation Ledger** maps the exact response codes defined in the guide. If a lookup is successful, it returns Code 0. If a partner sends a duplicate request ID, it returns Code 2. If VPN access is blocked, it returns Code 4. If the target subscriber is a corporate account or has active carrier blocks, it returns Code 7. If the security token is expired, it returns Code 15.
> 
> **Phase 3 Acceptance Criteria Fulfillment:**
> The acceptance criteria for Phase 3 require that our APIs conform to the integration guide and deliver P95 latency under 2 seconds. The Sandbox sandbox proves that our endpoints, payload headers, cryptographic envelopes, and response ledgers are 100% conformed to the carrier specifications, setting the stage for full real-time streaming in Phase 4."

---

## Segment 5: Phase 4 - Source-Direct Real-Time & Caching Performance (6 Mins)

### Spoken Word Target: ~850 words
### Visual Clicks & Console Actions:
1. Under the **Partner API Sandbox** subtab, scroll down to the **Low-Latency Cache & Performance Simulation Monitor**.
2. Explain the simulated latency metrics. Perform the following clicks and watch the latency meter react:
   - Click the cache mode button: **Auto (Redis Hit)**. Click **"Send Rest API Request"** in the sidebar. Note the latency speedometer registers **~4.8 ms** (green) and shows a `HIT (Redis)` badge.
   - Click the cache mode button: **Bypass (Dirty Flag)**. Click **"Send Rest API Request"**. Note the latency speedometer shifts to **~56.5 ms** (amber) and shows a `BYPASS (Dirty Flag)` badge. Review the logs showing the cache bypass and DynamoDB active store read.
   - Click the cache mode button: **Cold DB Fallback**. Click **"Send Rest API Request"**. Note the latency speedometer shifts to **~192.8 ms** (red) and shows a `MISS (Cold DB read)` badge. Review the logs showing the scan over conformed Gold tables.
3. Point out the live cache metrics dashboard: Hit Ratio (~98.7%), average cache latency (~6.4ms), peak throughput capacity (~540 QPS), active keyspace.
4. Navigate to the **Event Ingress** tab in the sidebar. Show how manual event triggers (e.g. sending a SIM Swap event for `14165559001` from Rogers) launch visual telemetry pulse animations.
5. Navigate to the **Query Investigator** tab in the sidebar. Select `14165559001` or `14165559013`. Explain:
   - The Bipartite hardware-sharing MSISDN-IMEI graph visualization.
   - The SHAP feature contribution charts explaining score deductions.
   - The Apache Iceberg Time-Travel Snapshot Explorer showing database metadata states over time.

### Walkthrough & Script:
> **Speaker Spoken Script:**
> "Phase 4 represents our core real-time streaming production milestone. In this phase, we deploy direct carrier streaming feeds via Apache Flink and establish our Northstar low-latency query layer. 
> 
> When querying real-time scores, we must support **1 million to 5 million requests per day**—which translates to a steady-state peak of **500 queries per second**. Telco SLAs are extremely strict, requiring response times under 100 milliseconds. If every API request had to query our analytical warehouse, the database would quickly choke, violating the SLA.
> 
> To solve this, we isolate our scoring pathway using an event-driven cache. Let's look at the **Low-Latency Cache & Performance Monitor** at the bottom of the sandbox.
> 
> Here, you can test how our caching layer handles query paths. I will select the **Auto (Redis Hit)** mode and click **'Send Rest API Request'**. Look at the query latency speedometer: it resolves in just **4.8 milliseconds**, marked in bright green with a `HIT (Redis)` status. The lookup is resolved entirely in-memory using an Amazon ElastiCache Redis cluster, returning cached subscriber scores in single-digit milliseconds.
> 
> But what happens when fresh telemetry arrives? When a carrier streams a SIM swap or device update, it raises a 'dirty flag' for that MSISDN. I will select **Bypass (Dirty Flag)** and send a request. The latency speedometer increases to **56.5 milliseconds**, marked in amber. In the logs, you can see the cache bypass: the query goes directly to our active **Amazon DynamoDB Feature Store** to retrieve the conformed profile details. This ensures the scoring engine uses fresh data, recalculates the score, and updates the Redis cache.
> 
> If the key is not found, we trigger a **Cold DB Fallback**. Selecting this mode and sending a request simulates a cold start. The query falls back to scan our conformed Apache Iceberg Gold tables in Redshift. The latency speedometer registers **192.8 milliseconds**, showing a cache miss.
> 
> You can also see our live-drifting cache metrics: our **Cache Hit Ratio is stable at 98.7%**, meaning that over 98% of queries resolve in under 10 milliseconds. Our simulated peak capacity is over **5,800 QPS**, easily handling our 5M query/day target.
> 
> Let's see how this works in real-time. I will go to the **Event Ingress** tab. Here, we can trigger raw events. I will click to simulate a SIM Swap from Rogers. As the telemetry pulses through the event bus, the Flink streaming engine processes the event, raises a dirty flag in our cache keyspace, and triggers a score recalculation.
> 
> Let's inspect the results in the **Query Investigator**. When we query `14165559001`, the system displays the conformed profile. On the screen, you see our **Bipartite Graph Network Visualizer**. It maps MSISDNs to device IMEIs. This allows analysts to instantly identify fraud ring nodes where multiple phone numbers share a single burner device. Below, the **SHAP explanation bars** detail exactly why the score was adjusted, and the **Apache Iceberg Time-Travel Explorer** lets analysts inspect conformed data snapshots from previous hours.
> 
> **Phase 4 Acceptance Criteria Fulfillment:**
> Phase 4 is completed when raw event transit latency is under 2 seconds and queries resolve under 100ms. The latency simulator, live metrics dashboard, and query investigator prove that the platform easily handles high volumes at single-digit millisecond speeds, resolving all latency concerns."

---

## Segment 6: Phase 5 - Continuous Everything & Exchange Hub (4 Mins)

### Spoken Word Target: ~580 words
### Visual Clicks & Console Actions:
1. Navigate to the **Exchange Hub** tab in the sidebar.
2. Direct attention to the **Data Contribution** ledger showing contributions from Incedo, Rogers, Bell, Telus, TransUnion, and Equifax.
3. Go to the **Real-Time Cross-Sector Lookup** card. Perform a lookup:
   - Note the porting checks, TransUnion SPID verification, and PII match score.
   - Change the role selection at the top from `Fraud Analyst` to `Compliance Officer` or `Public User` and observe the PII name and phone number fields instantly mask/redact.
4. Point out the **Exchange Success Metrics** charts (Prevention Ratio: ~74%, Match Rate: ~88%).
5. Navigate to the **Executive Desk** tab in the sidebar. Review the consolidated high-level metrics, fraud alerts, and the interactive map showing the bad actor nodes.

### Walkthrough & Script:
> **Speaker Spoken Script:**
> "Phase 5 represents the continuous operational state of the EnStream platform. In this phase, we expand the platform's capabilities beyond a single carrier to support a **Cross-Sector Bad Actor Data Exchange Hub**.
> 
> Let's open the **Exchange Hub**. This console allows participating carriers, banks, and credit bureaus to contribute blacklists and run real-time checks on suspected fraud actors. In our **Data Contribution** panel, you can see conformed contributions from Incedo, Rogers, Bell, Telus, and credit networks like TransUnion.
> 
> Let's run a **Real-Time Cross-Sector Lookup** for an incoming phone number. As I click search, the exchange validates the MSISDN format, queries the conformed bad actor blacklist, and checks porting records. The system computes a conformed PII Match Score, verifying if the applicant's name matches carrier records.
> 
> Privacy is a critical requirement. Our Exchange Hub implements **Role-Based Access Control (RBAC)** to ensure data security. At the top, I will toggle the user role from 'Fraud Analyst' to 'Public User'. Observe how the subscriber's name and MSISDN are instantly masked and redacted in compliance with GDPR and PIPEDA privacy rules.
> 
> To prove the value of this exchange, the **Success Metrics** panel tracks lookups, match rates, and fraud prevention ratios. Here, you see that our exchange achieves an **88% conformed match rate** and has successfully prevented over **74% of simulated transaction fraud**.
> 
> Finally, let's look at the **Executive Desk**. This is the aggregate control room. It consolidates our operational metrics, displays total ingestion events, tracks active fraud alerts, and visualizes the bad actor nodes on our geographic carrier map.
> 
> **Phase 5 Acceptance Criteria Fulfillment:**
> Phase 5 is completed when we have automated ML retraining loops, continuous drift checks, and active data exchanges. The Exchange Hub and Executive Desk demonstrate that EnStream operates as a secure, privacy-compliant, multi-carrier clearinghouse, ensuring continuous protection across sectors."

---

## Segment 7: Demo Conclusion & Q&A (2 Mins)

### Spoken Word Target: ~300 words
### Visual Clicks & Console Actions:
1. Navigate back to the **Technical Working** tab in the sidebar.
2. Select the **Vendor Brief & Feedback** subtab.
3. Position the viewport to show the **Competitive Parity (vs Subex)** and **Integrator Trade-offs** cards.

### Walkthrough & Script:
> **Speaker Spoken Script:**
> "In conclusion, this phased transition roadmap ensures a secure, high-performance path to our target architecture. 
> 
> As we wrap up, let's address the competitive advantages of our architecture. Traditional vendors like **Subex** propose moving the carrier's entire database to external systems like **Fraudzap** for offline processing. This exposes sensitive data and introduces latency. EnStream, by contrast, keeps all data securely resident within the carrier's S3 lakehouse and runs ML models directly on open Apache Iceberg tables, ensuring complete data sovereignty.
> 
> Furthermore, unlike legacy integrators like **Wipro or Tech Mahindra** who build closed, proprietary databases, our platform utilizes open-table formats. This prevents vendor lock-in and allows other analytical tools to query conformed features. By using selective dirty-flag score recalculations, we reduce operational costs while maintaining sub-second performance.
> 
> The interactive sandbox, low-latency caching visualizer, DQ audit ledgers, and graph network walk show that the EnStream Fraud Platform is fully prepared to deliver real-time, governed trust scoring.
> 
> I am now happy to open the floor to any questions you may have. Thank you."
