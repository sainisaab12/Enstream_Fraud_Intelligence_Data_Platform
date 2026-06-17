# EnStream Fraud Intelligence Platform - Speaker Presentation Script

**Demonstration Duration**: 30 Minutes
**Structure**: Phased Roadmap Walkthrough with live prototype clicks, spoken narratives, and acceptance criteria verifications.

---

## [00:00 - 03:00] Segment 1: Opening Screen & Context

### Spoken Narrative
"Welcome, everyone. Thank you for joining today's deep-dive demonstration of the EnStream Fraud Intelligence Platform. 

As we begin, you are looking at our live control panel, specifically configured to show our **Transition Roadmap: Path to Northstar Architecture**. EnStream operates as a real-time trust and fraud intelligence clearinghouse for carrier networks and financial institutions. Our primary objective is to compute risk scoring features, detect fraudulent behaviors—such as SIM swapping and device-churning fraud rings—and return a dynamic, explainable trust score.

However, building a large-scale data platform for telco volumes cannot happen in a single, massive deployment. It requires a carefully phased transition from legacy databases to a high-performance, real-time, medallion-based data lakehouse. We have structured this evolution into five distinct phases, which you can see outlined on the screen: 
1. **Phase 1: Batch Operationalized**: Building the baseline ingestion and promoción architecture.
2. **Phase 2: Batch Automated**: Adding robust orchestration, quality gates, and drift analytics.
3. **Phase 3: Interim Real-Time**: Exposing developer sandbox endpoints compliant with our partner integration guides.
4. **Phase 4: Source-Direct Real-Time**: Implementing direct carrier streaming feeds and point-lookup cache layers.
5. **Phase 5: Continuous Everything**: Operationalizing automated retraining loops and multi-sector fraud exchange hubs.

In this 30-minute demonstration, we will walk through this evolutionary lifecycle. To make this clear, we have built an interactive **Architecture Evolution console** in the prototype. We will select each phase, inspect the corresponding architectural diagrams and technology stacks, and then jump directly to the conformed working panels to verify that our acceptance gates are fully satisfied."

### Speaker Action Log
*   **Visual Direction**: Load the prototype in your browser.
*   **Click Action**: Click on **Technical Working** in the left sidebar.
*   **Subtab Action**: Click on the **Phase Roadmap** subtab.
*   **Gesture**: Point to the horizontal timeline showing Phases 1 to 5.

---

## [03:00 - 08:00] Segment 2: Phase 1 & 2 - Batch Baseline

### Spoken Narrative
"Let's open the **Architecture Evolution** console and click on **Phase 1-2 (Batch)**. 

This diagram visualizes our batch baseline. In this phase, our data flow extracts event telemetry from a legacy **1.0 Terabyte MySQL database** growing at **7 Gigabytes every day**. At peak, this database receives **400 raw records per second** excluding Rogers, which drops batch files every two minutes. 

To move this data, we run nightly **EMR Spark** and **AWS Glue** jobs scheduled by **AWS Managed Workflows for Apache Airflow (MWAA)**. Spark writes the raw telemetry to S3 Bronze in Parquet format, validates formats, promotes conformed events to S3 Silver, and loads analytical features into Redshift Serverless Gold tables. The serving path is batch-only: API queries read pre-calculated scores directly from the analytical Gold tables, resolving within normal database latencies of over 150 milliseconds.

Let's look at the conformed data mapping under the **Medallion Spec** tab. Here, you see how we map this legacy schema. Our Bronze layer lands raw JSON strings directly from the event streams to guarantee data persistence. We limit our integration scope to the precise tables defined in the vendor brief: records of customer API requests and customer journey events.

In the **Ops Center**, we can see these batch promotion runs in progress. As you can see, our Spark promotion jobs run incrementally, reading raw records from the Bronze table, running initial schema validations, promoting them to conformed formats in the Silver table, and building our analytical Gold tables.

**Phase 1 Acceptance Criteria Fulfillment:**
How do we prove that Phase 1 is successfully completed? The criteria require that our score outputs match the PoC holdout data exactly and that database reads are fully idempotent. In the terminal log, you can see that each Spark promotion task utilizes partition-level overwrites based on event timestamps. This ensures that even if a pipeline runs twice, the destination database remains conformed and duplicate rows are prevented. With the baseline batch pipeline running stably, we can proceed to automate and govern the data lifecycle in Phase 2."

### Speaker Action Log
*   **Click Action**: Click on the **Architecture Evolution** subtab.
*   **Click Action**: Click on the **Phase 1-2 (Batch)** selector button.
*   **Visual Direction**: Point to the Phase 1-2 diagram on the right, and key technologies/criteria on the left.
*   **Click Action**: Click on **Medallion Spec** in the sidebar. Scroll to the MySQL tables scope.
*   **Click Action**: Click on **Ops Center** in the sidebar. Point to the Spark logs.

---

## [08:00 - 13:00] Segment 3: Phase 2 - Batch Automated & DQ SLAs

### Spoken Narrative
"Under Phase 2, we automate this scheduled batch execution and enforce strict data quality gates. 

If we navigate to the **DQ Monitor** tab, we can see the automated governance system in action. First, look at the **Ingestion Latency SLA** cards. Because Rogers drops event files every 2 minutes while Bell and Telus stream live, our pipeline monitor tracks the latency of raw inputs. You can see Rogers average latency is 1.9 seconds, which complies with our target 2-minute SLA.

Directly below, the **SLA Rules Audit Ledger** displays conformed validations running on the promotion schedules. Each event is evaluated against structural constraints: verifying E.164 phone number formatting, checking that carrier activations include a valid 15-digit device IMEI, and enforcing freshness thresholds of less than 2 hours. If a record violates any of these, it is instantly routed to a Quarantine log.

Let's look at the **Pipeline Self-Healing Console**. In any distributed architecture, network outages or carrier sync failures will occur, leading to missing data. I will click **"Trigger Manual Reconciliation Audit"** to simulate a carrier sync failure. You can see the system scan the historical sequence counts, detect a gap of 1,200 records from Rogers, execute an automated backfill query, and run reconciliation promotions to merge the conformed data back into the Silver Iceberg tables.

Additionally, our automated batch system must ensure that the ML models scoring these events do not drift. Let's look at the **ML Registry** tab. Here, the platform monitors our champion model's feature inputs. The **Population Stability Index (PSI)** chart tracks input distributions. If a carrier changes its activation format and our feature distributions shift, the PSI value rises. If it exceeds 0.2, an automated alert triggers to initiate retraining.

**Phase 2 Acceptance Criteria Fulfillment:**
Phase 2 is completed when ingestion pipelines run on schedule, data quality meets SLA rules, and we run successful rollback drills. The self-healing audit ledger and drift dashboard prove that the platform maintains zero score drift and can dynamically heal itself during carrier outages without human intervention. This brings us to Phase 3, where we expose the data via REST interfaces."

### Speaker Action Log
*   **Click Action**: Click on **Technical Working** -> **Architecture Evolution** to show automation metrics.
*   **Click Action**: Click on **DQ Monitor** in the left sidebar. Point to Ingestion latency cards.
*   **Scroll**: Scroll down to the **SLA Rules Audit Ledger** table.
*   **Click Action**: Click the **"Trigger Manual Reconciliation Audit"** button at the bottom.
*   **Click Action**: Click on **ML Registry** in the sidebar. Point to the PSI drift line chart.

---

## [13:00 - 18:00] Segment 4: Phase 3 - Interim Real-Time & Partner API Sandbox

### Spoken Narrative
"Let's return to the **Architecture Evolution** console and click on **Phase 3 (Serverless Stream)**.

This diagram shows our serverless streaming path. Telco CRM updates and webhooks are published to **Amazon Kinesis Data Streams**. An **AWS Lambda function** reads the shards, writes the raw telemetry to the S3 Bronze table, updates conformed feature attributes in **Amazon DynamoDB** (acting as our Active Feature Store), and evicts cached entries in **ElastiCache Redis**. API Gateway and Step Functions serve our REST APIs directly from Redis (< 10ms) or fall back to DynamoDB (< 50ms).

This is a highly cost-effective and scalable pattern for our 400 events/second ingress. It handles our real-time query load with sub-50ms execution times for a fraction of the cost of running a full streaming cluster.

Now, let's open the **Partner API Sandbox** subtab. This playground exposes all 13 standard REST APIs defined in the integration guide. In the sidebar list, I can select any operation. For instance, selecting **A1 Basic IDV** displays the exact request schema for validating customer names and conformed carrier address fields. Selecting **A3 Account Type** retrieves prepaid/postpaid flags, business class preferences, and language codes. Selecting **D3M Multi recent changes** allows partners to query up to five subscriber numbers in a single batch array to check for SIM swaps.

Furthermore, security is paramount. The integration guide mandates strict cryptographic envelopes. I will check the box to **'Enable JOSE JWS/JWE Protection'**. When enabled, the system wraps our request in an RFC7515/7516 compliant signature and encryption layer. Clicking **'Send Rest API Request'** executes a simulated VPN call. The terminal log displays the HTTP Basic Authentication headers and Jakarta User-Agent tags, then shows the JWS protected header—complete with RS256 algorithm signatures, partner key identifiers, expiration timestamps, and operation tags. The request payload is encrypted using AES-256-GCM, matching the carrier's production security profile.

**Phase 3 Acceptance Criteria Fulfillment:**
The acceptance criteria for Phase 3 require that our APIs conform to the integration guide and deliver P95 latency under 2 seconds. The Sandbox sandbox proves that our endpoints, payload headers, cryptographic envelopes, and response ledgers are 100% conformed to the carrier specifications, setting the stage for full real-time streaming in Phase 4."

### Speaker Action Log
*   **Click Action**: Click on **Technical Working** -> **Architecture Evolution** in the sidebar.
*   **Click Action**: Click on the **Phase 3 (Serverless Stream)** selector button.
*   **Subtab Action**: Click on the **Partner API Sandbox** subtab.
*   **Click Action**: Select **A1: Basic Identity Verification** in the list, then select **D3M: Recent Changes Multi**.
*   **Check Action**: Check the **Enable JOSE JWS/JWE Protection** checkbox.
*   **Click Action**: Click the blue **"Send Rest API Request"** button. Point to headers in logs.

---

## [18:00 - 24:00] Segment 5: Phase 4 - Source-Direct Real-Time & Caching Performance

### Spoken Narrative
"Let's return to the **Architecture Evolution** console and click on **Phase 4 (Stateful Stream)**.

Here, you see the deployment of direct carrier streaming feeds. **Apache Flink (Kinesis Data Analytics)** replaces Lambda for the streaming path. Flink maintains rolling time windows in-memory using its RocksDB state backend. This allows Flink to execute complex, stateful Event Processing—such as checking SIM swap velocities (counting card updates $\ge 3$ within a 2-hour window) and graph ring network sizes across shared hardware—in under 10 milliseconds. Flink writes verified feature aggregates to DynamoDB and evicts expired keys from Redis.

Let's scroll to the **Low-Latency Cache & Performance Monitor** at the bottom of the sandbox page to see how we handle these queries.

I will select the **Auto (Redis Hit)** mode and click **'Send Rest API Request'**. Look at the query latency speedometer: it resolves in just **4.8 milliseconds**, marked in bright green with a `HIT (Redis)` status. The lookup is resolved entirely in-memory using an Amazon ElastiCache Redis cluster, returning cached subscriber scores in single-digit milliseconds.

But what happens when fresh telemetry arrives? When a carrier streams a SIM swap or device update, it raises a 'dirty flag' for that MSISDN. I will select **Bypass (Dirty Flag)** and send a request. The latency speedometer increases to **56.5 milliseconds**, marked in amber. In the logs, you can see the cache bypass: the query goes directly to our active **Amazon DynamoDB Feature Store** to retrieve the conformed profile details. This ensures the scoring engine uses fresh data, recalculates the score, and updates the Redis cache.

If the key is not found, we trigger a **Cold DB Fallback**. Selecting this mode and sending a request simulates a cold start. The query falls back to scan our conformed Apache Iceberg Gold tables in Redshift. The latency speedometer registers **192.8 milliseconds**, showing a cache miss.

You can also see our live-drifting cache metrics: our **Cache Hit Ratio is stable at 98.7%**, meaning that over 98% of queries resolve in under 10 milliseconds. Our simulated peak capacity is over **5,800 QPS**, easily handling our 5M query/day target.

Let's see how this works in real-time. I will go to the **Event Ingress** tab. Here, we can trigger raw events. I will click to simulate a SIM Swap from Rogers. As the telemetry pulses through the event bus, the Flink streaming engine processes the event, raises a dirty flag in our cache keyspace, and triggers a score recalculation.

Let's inspect the results in the **Query Investigator**. When we query `14165559001`, the system displays the conformed profile. On the screen, you see our **Bipartite Graph Network Visualizer**. It maps MSISDNs to device IMEIs. This allows analysts to instantly identify fraud ring nodes where multiple phone numbers share a single burner device. Below, the **SHAP explanation bars** detail exactly why the score was adjusted, and the **Apache Iceberg Time-Travel Explorer** lets analysts inspect conformed data snapshots from previous hours.

**Phase 4 Acceptance Criteria Fulfillment:**
Phase 4 is completed when raw event transit latency is under 2 seconds and queries resolve under 100ms. The latency simulator, live metrics dashboard, and query investigator prove that the platform easily handles high volumes at single-digit millisecond speeds, resolving all latency concerns."

### Speaker Action Log
*   **Click Action**: Click on **Technical Working** -> **Architecture Evolution**.
*   **Click Action**: Click on the **Phase 4 (Stateful Stream)** selector button.
*   **Subtab Action**: Click on **Partner API Sandbox** subtab.
*   **Scroll**: Scroll down to the **Low-Latency Cache & Performance Monitor** widget.
*   **Radio Select**: Select **Auto (Redis Hit)**. Click **"Send Rest API Request"**. Point to **~4.8 ms**.
*   **Radio Select**: Select **Bypass (Dirty Flag)**. Click **"Send Rest API Request"**. Point to **~56.5 ms**.
*   **Radio Select**: Select **Cold DB Fallback**. Click **"Send Rest API Request"**. Point to **~192.8 ms**.
*   **Click Action**: Click on **Event Ingress** in the left sidebar. Click **"Simulate SIM Swap"** under Rogers.
*   **Click Action**: Click on **Query Investigator** in the sidebar. Select `14165559001` or `14165559013`. Point to the Bipartite Graph, SHAP chart, and Iceberg Snapshot table.

---

## [24:00 - 28:00] Segment 6: Phase 5 - Continuous Everything & Exchange Hub

### Spoken Narrative
"Let's return to the **Architecture Evolution** console and click on **Phase 5 (Northstar)**.

This diagram shows the complete continuous operation state. In this final phase, model registries monitor PSI inputs continuously. If PSI > 0.2, an automated retraining pipeline is triggered on SageMaker. We also integrate the **Cross-Sector Bad Actor Data Exchange Hub**, allowing participating networks to share and lookup blacklisted actors via RBAC-masked APIs.

Let's open the **Exchange Hub**. This console allows participating carriers, banks, and credit bureaus to contribute blacklists and run real-time checks on suspected fraud actors. In our **Data Contribution** panel, you can see conformed contributions from Incedo, Rogers, Bell, Telus, and credit networks like TransUnion.

Let's run a **Real-Time Cross-Sector Lookup** for an incoming phone number. As I click search, the exchange validates the MSISDN format, queries the conformed bad actor blacklist, and checks porting records. The system computes a conformed PII Match Score, verifying if the applicant's name matches carrier records.

Privacy is a critical requirement. Our Exchange Hub implements **Role-Based Access Control (RBAC)** to ensure data security. At the top, I will toggle the user role from 'Fraud Analyst' to 'Public User'. Observe how the subscriber's name and MSISDN are instantly masked and redacted in compliance with GDPR and PIPEDA privacy rules.

To prove the value of this exchange, the **Success Metrics** panel tracks lookups, match rates, and fraud prevention ratios. Here, you see that our exchange achieves an **88% conformed match rate** and has successfully prevented over **74% of simulated transaction fraud**.

Finally, let's look at the **Executive Desk**. This is the aggregate control room. It consolidates our operational metrics, displays total ingestion events, tracks active fraud alerts, and visualizes the bad actor nodes on our geographic carrier map.

**Phase 5 Acceptance Criteria Fulfillment:**
Phase 5 is completed when we have automated ML retraining loops, continuous drift checks, and active data exchanges. The Exchange Hub and Executive Desk demonstrate that EnStream operates as a secure, privacy-compliant, multi-carrier clearinghouse, ensuring continuous protection across sectors."

### Speaker Action Log
*   **Click Action**: Click on **Technical Working** -> **Architecture Evolution**.
*   **Click Action**: Click on the **Phase 5 (Northstar)** selector button.
*   **Click Action**: Click on **Exchange Hub** in the left sidebar.
*   **Click Action**: Scroll to the **Cross-Sector Lookup** card and click **"Execute API Lookup Query"**.
*   **Select Action**: Change the **Privacy Role** dropdown from `Fraud Analyst` to `Public User`.
*   **Click Action**: Click on **Executive Desk** in the left sidebar. Point out the live map and high-risk alerts table.

---

## [28:00 - 30:00] Segment 7: Demo Conclusion & Q&A

### Spoken Narrative
"In conclusion, this phased transition roadmap ensures a secure, high-performance path to our target architecture. 

As we wrap up, let's address the competitive advantages of our architecture. Traditional vendors like **Subex** propose moving the carrier's entire database to external systems like **Fraudzap** for offline processing. This exposes sensitive data and introduces latency. EnStream, by contrast, keeps all data securely resident within the carrier's S3 lakehouse and runs ML models directly on open Apache Iceberg tables, ensuring complete data sovereignty.

Furthermore, unlike legacy integrators like **Wipro or Tech Mahindra** who build closed, proprietary databases, our platform utilizes open-table formats. This prevents vendor lock-in and allows other analytical tools to query conformed features. By using selective dirty-flag score recalculations, we reduce operational costs while maintaining sub-second performance.

The interactive sandbox, low-latency caching visualizer, DQ audit ledgers, and graph network walk show that the EnStream Fraud Platform is fully prepared to deliver real-time, governed trust scoring.

I am now happy to open the floor to any questions you may have. Thank you."

### Speaker Action Log
*   **Click Action**: Click on **Technical Working** in the left sidebar.
*   **Subtab Action**: Click on the **Vendor Brief & Feedback** subtab.
*   **Visual Direction**: Direct the audience to the **Competitive Parity (vs Subex)** and **Integrator Trade-offs** cards.
*   **Gesture**: Fold arms, smile, and look at the audience to receive questions.
