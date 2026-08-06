import{j as e}from"./components-BCHf_v1I.js";import{_ as l,a as h,b as c,c as d,d as g,e as m,f as p,g as u}from"./empty-snapshots-CrCCrRVe.js";let b=`















## HBase Metrics

HBase emits metrics which adhere to the [Hadoop Metrics](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/Metrics.html) API. Starting with HBase 0.95 [^5], HBase is configured to emit a default set of metrics with a default sampling period of every 10 seconds. You can use HBase metrics in conjunction with Ganglia. You can also filter which metrics are emitted and extend the metrics framework to capture custom metrics appropriate for your environment.

### Metric Setup

For HBase 0.95 and newer, HBase ships with a default metrics configuration, or ***sink***. This includes a wide variety of individual metrics, and emits them every 10 seconds by default. To configure metrics for a given region server, edit the *conf/hadoop-metrics2-hbase.properties* file. Restart the region server for the changes to take effect.

To change the sampling rate for the default sink, edit the line beginning with \`*.period\`. To filter which metrics are emitted or to extend the metrics framework, see [https://hadoop.apache.org/docs/current/api/org/apache/hadoop/metrics2/package-summary.html](https://hadoop.apache.org/docs/current/api/org/apache/hadoop/metrics2/package-summary.html)

<Callout type="info" title="HBase Metrics and Ganglia">
  By default, HBase emits a large number of metrics per region server. Ganglia may have difficulty
  processing all these metrics. Consider increasing the capacity of the Ganglia server or reducing
  the number of metrics emitted by HBase. See [Metrics
  Filtering](https://hadoop.apache.org/docs/current/api/org/apache/hadoop/metrics2/package-summary.html#filtering).
</Callout>

### Disabling Metrics

To disable metrics for a region server, edit the *conf/hadoop-metrics2-hbase.properties* file and comment out any uncommented lines. Restart the region server for the changes to take effect.

### Enabling Metrics Servlets

HBase exposes the metrics in many formats such as JSON, prometheus-format through different servlets (\`/jmx\`, \`/metrics\`, \`/prometheus\`). Any of these servlets can be enabled or disabled by the configuration property \`hbase.http.metrics.servlets\`. The value for the property should be a comma separated list of the servlet aliases which are \`{jmx, metrics, prometheus}\`. \`/jmx\`, \`/metrics\`, \`/prometheus\` are enabled by default. To get metrics using these servlets access the URL \`http://SERVER_HOSTNAME:SERVER_WEB_UI_PORT/endpoint\`. Where endpoint is one of \`/jmx\`, \`/metrics\`, or \`/prometheus\`. Eg. \`http://my.rs.xyz.com:16030/prometheus\`

### Prometheus servlets

HBase exposes the metrics in prometheus friendly format through a servlet, \`/prometheus\`. Currently \`/prometheus\` exposes all the available metrics.

### Discovering Available Metrics

Rather than listing each metric which HBase emits by default, you can browse through the available metrics, either as a JSON output or via JMX. Different metrics are exposed for the Master process and each region server process.

**Procedure: Access a JSON Output of Available Metrics**

<Steps>
  <Step>
    After starting HBase, access the region server's web UI, at http\\://REGIONSERVER\\_HOSTNAME:16030 by default.
  </Step>

  <Step>
    Click the **Metrics Dump** link near the top. The metrics for the region server are presented as a dump of the JMX bean in JSON format. This will dump out all metrics names and their values. To include metrics descriptions in the listing — this can be useful when you are exploring what is available — add a query string of \`?description=true\` so your URL becomes http\\://REGIONSERVER\\_HOSTNAME:16030/jmx?description=true. Not all beans and attributes have descriptions.
  </Step>

  <Step>
    To view metrics for the Master, connect to the Master's web UI instead (defaults to [http://localhost:16010](http://localhost:16010)) and click its **Metrics Dump** link. To include metrics descriptions in the listing — this can be useful when you are exploring what is available — add a query string of \`?description=true\` so your URL becomes http\\://REGIONSERVER\\_HOSTNAME:16010/jmx?description=true. Not all beans and attributes have descriptions.
  </Step>
</Steps>

You can use many different tools to view JMX content by browsing MBeans. This procedure uses \`jvisualvm\`, which is an application usually available in the JDK.

**Procedure: Browse the JMX Output of Available Metrics**

<Steps>
  <Step>
    Start HBase, if it is not already running.
  </Step>

  <Step>
    Run the command \`jvisualvm\` command on a host with a GUI display. You can launch it from the command line or another method appropriate for your operating system.
  </Step>

  <Step>
    Be sure the **VisualVM-MBeans** plugin is installed. Browse to **Tools → Plugins**. Click **Installed** and check whether the plugin is listed. If not, click **Available Plugins**, select it, and click Install. When finished, click Close.
  </Step>

  <Step>
    To view details for a given HBase process, double-click the process in the **Local** sub-tree in the left-hand panel. A detailed view opens in the right-hand panel. Click the **MBeans** tab which appears as a tab in the top of the right-hand panel.
  </Step>

  <Step>
    To access the HBase metrics, navigate to the appropriate sub-bean: .\\* Master: .\\* RegionServer:
  </Step>

  <Step>
    The name of each metric and its current value is displayed in the **Attributes** tab. For a view which includes more details, including the description of each attribute, click the **Metadata** tab.
  </Step>
</Steps>

### Units of Measure for Metrics

Different metrics are expressed in different units, as appropriate. Often, the unit of measure is in the name (as in the metric \`shippedKBs\`). Otherwise, use the following guidelines. When in doubt, you may need to examine the source for a given metric.

* Metrics that refer to a point in time are usually expressed as a timestamp.
* Metrics that refer to an age (such as \`ageOfLastShippedOp\`) are usually expressed in milliseconds.
* Metrics that refer to memory sizes are in bytes.
* Sizes of queues (such as \`sizeOfLogQueue\`) are expressed as the number of items in the queue. Determine the size by multiplying by the block size (default is 64 MB in HDFS).
* Metrics that refer to things like the number of a given type of operations (such as \`logEditsRead\`) are expressed as an integer.

### Most Important Master Metrics

Note: Counts are usually over the last metrics reporting interval.

**hbase.master.numRegionServers**\\
Number of live regionservers

**hbase.master.numDeadRegionServers**\\
Number of dead regionservers

**hbase.master.ritCount**\\
The number of regions in transition

**hbase.master.ritCountOverThreshold**\\
The number of regions that have been in transition longer than a threshold time (default: 60 seconds)

**hbase.master.ritOldestAge**\\
The age of the longest region in transition, in milliseconds

### Most Important RegionServer Metrics

Note: Counts are usually over the last metrics reporting interval.

**hbase.regionserver.regionCount**\\
The number of regions hosted by the regionserver

**hbase.regionserver.storeFileCount**\\
The number of store files on disk currently managed by the regionserver

**hbase.regionserver.storeFileSize**\\
Aggregate size of the store files on disk

**hbase.regionserver.hlogFileCount**\\
The number of write ahead logs not yet archived

**hbase.regionserver.totalRequestCount**\\
The total number of requests received

**hbase.regionserver.readRequestCount**\\
The number of read requests received

**hbase.regionserver.writeRequestCount**\\
The number of write requests received

**hbase.regionserver.numOpenConnections**\\
The number of open connections at the RPC layer

**hbase.regionserver.numActiveHandler**\\
The number of RPC handlers actively servicing requests

**hbase.regionserver.numCallsInGeneralQueue**\\
The number of currently enqueued user requests

**hbase.regionserver.numCallsInReplicationQueue**\\
The number of currently enqueued operations received from replication

**hbase.regionserver.numCallsInPriorityQueue**\\
The number of currently enqueued priority (internal housekeeping) requests

**hbase.regionserver.flushQueueLength**\\
Current depth of the memstore flush queue. If increasing, we are falling behind with clearing memstores out to HDFS.

**hbase.regionserver.updatesBlockedTime**\\
Number of milliseconds updates have been blocked so the memstore can be flushed

**hbase.regionserver.compactionQueueLength**\\
Current depth of the compaction request queue. If increasing, we are falling behind with storefile compaction.

**hbase.regionserver.blockCacheHitCount**\\
The number of block cache hits

**hbase.regionserver.blockCacheMissCount**\\
The number of block cache misses

**hbase.regionserver.blockCacheExpressHitPercent**\\
The percent of the time that requests with the cache turned on hit the cache

**hbase.regionserver.percentFilesLocal**\\
Percent of store file data that can be read from the local DataNode, 0-100

**hbase.regionserver.\\<op>\\_\\<measure>**\\
Operation latencies, where \\<op> is one of Append, Delete, Mutate, Get, Replay, Increment; and where \\<measure> is one of min, max, mean, median, 75th\\_percentile, 95th\\_percentile, 99th\\_percentile

**hbase.regionserver.slow\\<op>Count**\\
The number of operations we thought were slow, where \\<op> is one of the list above

**hbase.regionserver.GcTimeMillis**\\
Time spent in garbage collection, in milliseconds

**hbase.regionserver.GcTimeMillisParNew**\\
Time spent in garbage collection of the young generation, in milliseconds

**hbase.regionserver.GcTimeMillisConcurrentMarkSweep**\\
Time spent in garbage collection of the old generation, in milliseconds

**hbase.regionserver.authenticationSuccesses**\\
Number of client connections where authentication succeeded

**hbase.regionserver.authenticationFailures**\\
Number of client connection authentication failures

**hbase.regionserver.mutationsWithoutWALCount**\\
Count of writes submitted with a flag indicating they should bypass the write ahead log

### Meta Table Load Metrics

HBase meta table metrics collection feature is available in HBase 1.4+ but it is disabled by default, as it can affect the performance of the cluster. When it is enabled, it helps to monitor client access patterns by collecting the following statistics:

* number of get, put and delete operations on the \`hbase:meta\` table
* number of get, put and delete operations made by the top-N clients
* number of operations related to each table
* number of operations related to the top-N regions\\
  **When to use the feature**\\
  This feature can help to identify hot spots in the meta table by showing the regions or tables where the meta info is modified (e.g. by create, drop, split or move tables) or retrieved most frequently. It can also help to find misbehaving client applications by showing which clients are using the meta table most heavily, which can for example suggest the lack of meta table buffering or the lack of re-using open client connections in the client application.

<Callout type="warn" title="Possible side-effects of enabling this feature">
  Having large number of clients and regions in the cluster can cause the registration and tracking
  of a large amount of metrics, which can increase the memory and CPU footprint of the HBase region
  server handling the \`hbase:meta\` table. It can also cause the significant increase of the JMX dump
  size, which can affect the monitoring or log aggregation system you use beside HBase. It is
  recommended to turn on this feature only during debugging.
</Callout>

**Where to find the metrics in JMX**\\
Each metric attribute name will start with the ‘MetaTable\\_' prefix. For all the metrics you will see five different JMX attributes: count, mean rate, 1 minute rate, 5 minute rate and 15 minute rate. You will find these metrics in JMX under the following MBean: \`Hadoop → HBase → RegionServer → Coprocessor.Region.CP_org.apache.hadoop.hbase.coprocessor.MetaTableMetrics\`.

**Examples: some Meta Table metrics you can see in your JMX dump**

\`\`\`json
{
  "MetaTable_get_request_count": 77309,
  "MetaTable_put_request_mean_rate": 0.06339092997186495,
  "MetaTable_table_MyTestTable_request_15min_rate": 1.1020599841623246,
  "MetaTable_client_/172.30.65.42_lossy_request_count": 1786
  "MetaTable_client_/172.30.65.45_put_request_5min_rate": 0.6189810954855728,
  "MetaTable_region_1561131112259.c66e4308d492936179352c80432ccfe0._lossy_request_count": 38342,
  "MetaTable_region_1561131043640.5bdffe4b9e7e334172065c853cf0caa6._lossy_request_1min_rate": 0.04925099917433935,
}
\`\`\`

**Configuration**\\
To turn on this feature, you have to enable a custom coprocessor by adding the following section to hbase-site.xml. This coprocessor will run on all the HBase RegionServers, but will be active (i.e. consume memory / CPU) only on the server, where the \`hbase:meta\` table is located. It will produce JMX metrics which can be downloaded from the web UI of the given RegionServer or by a simple REST call. These metrics will not be present in the JMX dump of the other RegionServers.

**Enabling the Meta Table Metrics feature**

\`\`\`xml
<property>
    <name>hbase.coprocessor.region.classes</name>
    <value>org.apache.hadoop.hbase.coprocessor.MetaTableMetrics</value>
</property>
\`\`\`

<Callout type="info" title="How the top-N metrics are calculated?">
  The 'top-N' type of metrics will be counted using the Lossy Counting Algorithm (as defined in [Motwani, R; Manku, G.S (2002). "Approximate frequency counts over data streams"](http://www.vldb.org/conf/2002/S10P03.pdf)), which is designed to identify elements in a data stream whose frequency count exceed a user-given threshold. The frequency computed by this algorithm is not always accurate but has an error threshold that can be specified by the user as a configuration parameter. The run time space required by the algorithm is inversely proportional to the specified error threshold, hence larger the error parameter, the smaller the footprint and the less accurate are the metrics.

  You can specify the error rate of the algorithm as a floating-point value between 0 and 1 (exclusive), it's default value is 0.02. Having the error rate set to \`E\` and having \`N\` as the total number of meta table operations, then (assuming the uniform distribution of the activity of low frequency elements) at most \`7 / E\` meters will be kept and each kept element will have a frequency higher than \`E * N\`.

  An example: Let's assume we are interested in the HBase clients that are most active in accessing the meta table. When there was 1,000,000 operations on the meta table so far and the error rate parameter is set to 0.02, then we can assume that only at most 350 client IP address related counters will be present in JMX and each of these clients accessed the meta table at least 20,000 times.

  \`\`\`xml
  <property>
      <name>hbase.util.default.lossycounting.errorrate</name>
      <value>0.02</value>
  </property>
  \`\`\`
</Callout>

## HBase Monitoring

### Overview

The following metrics are arguably the most important to monitor for each RegionServer for "macro monitoring", preferably with a system like [OpenTSDB](http://opentsdb.net/). If your cluster is having performance issues it's likely that you'll see something unusual with this group.

#### HBase \\[!toc]

* See [rs metrics](/docs/operational-management/metrics-and-monitoring#most-important-regionserver-metrics)

#### OS \\[!toc]

* IO Wait
* User CPU

#### Java \\[!toc]

* GC

### Slow Query Log

The HBase slow query log consists of parseable JSON structures describing the properties of those client operations (Gets, Puts, Deletes, etc.) that either took too long to run, or produced too much output. The thresholds for "too long to run" and "too much output" are configurable, as described below. The output is produced inline in the main region server logs so that it is easy to discover further details from context with other logged events. It is also prepended with identifying tags \`(responseTooSlow)\`, \`(responseTooLarge)\`, \`(operationTooSlow)\`, and \`(operationTooLarge)\` in order to enable easy filtering with grep, in case the user desires to see only slow queries.

#### Configuration

There are four configuration knobs that can be used to adjust the thresholds for when queries are logged. Two of these knobs control the size and time thresholds for all queries. Because Scans can often be larger and slower than other types of queries, there are two additional knobs which can control size and time thresholds for Scans specifically.

* \`hbase.ipc.warn.response.time\` Maximum number of milliseconds that a query can be run without being logged. Defaults to 10000, or 10 seconds. Can be set to -1 to disable logging by time.
* \`hbase.ipc.warn.response.size\` Maximum byte size of response that a query can return without being logged. Defaults to 100 megabytes. Can be set to -1 to disable logging by size.
* \`hbase.ipc.warn.response.time.scan\` Maximum number of milliseconds that a Scan can be run without being logged. Defaults to the \`hbase.ipc.warn.response.time\` value. Can be set to -1 to disable logging by time.
* \`hbase.ipc.warn.response.size.scan\` Maximum byte size of response that a Scan can return without being logged. Defaults to the \`hbase.ipc.warn.response.size\` value. Can be set to -1 to disable logging by size.

#### Metrics

The slow query log exposes to metrics to JMX.

* \`hadoop.regionserver_rpc_slowResponse\` a global metric reflecting the durations of all responses that triggered logging.
* \`hadoop.regionserver_rpc_methodName.aboveOneSec\` A metric reflecting the durations of all responses that lasted for more than one second.

#### Output

The output is tagged with operation e.g. \`(operationTooSlow)\` if the call was a client operation, such as a Put, Get, or Delete, which we expose detailed fingerprint information for. If not, it is tagged \`(responseTooSlow)\` and still produces parseable JSON output, but with less verbose information solely regarding its duration and size in the RPC itself. \`TooLarge\` is substituted for \`TooSlow\` if the response size triggered the logging, with \`TooLarge\` appearing even in the case that both size and duration triggered logging.

#### Example

\`\`\`text
2011-09-08 10:01:25,824 WARN org.apache.hadoop.ipc.HBaseServer: (operationTooSlow): {"tables":{"riley2":{"puts":[{"totalColumns":11,"families":{"actions":[{"timestamp":1315501284459,"qualifier":"0","vlen":9667580},{"timestamp":1315501284459,"qualifier":"1","vlen":10122412},{"timestamp":1315501284459,"qualifier":"2","vlen":11104617},{"timestamp":1315501284459,"qualifier":"3","vlen":13430635}]},"row":"cfcd208495d565ef66e7dff9f98764da:0"}],"families":["actions"]}},"processingtimems":956,"client":"10.47.34.63:33623","starttimems":1315501284456,"queuetimems":0,"totalPuts":1,"class":"HRegionServer","responsesize":0,"method":"multiPut"}
\`\`\`

Note that everything inside the "tables" structure is output produced by MultiPut's fingerprint, while the rest of the information is RPC-specific, such as processing time and client IP/port. Other client operations follow the same pattern and the same general structure, with necessary differences due to the nature of the individual operations. In the case that the call is not a client operation, that detailed fingerprint information will be completely absent.

This particular example, for example, would indicate that the likely cause of slowness is simply a very large (on the order of 100MB) multiput, as we can tell by the "vlen," or value length, fields of each put in the multiPut.

#### Get Slow Response Log from shell

When an individual RPC exceeds a configurable time bound we log a complaint by way of the logging subsystem

e.g.

\`\`\`text
2019-10-02 10:10:22,195 WARN [,queue=15,port=60020] ipc.RpcServer - (responseTooSlow):
{"call":"Scan(org.apache.hadoop.hbase.protobuf.generated.ClientProtos$ScanRequest)",
"starttimems":1567203007549,
"responsesize":6819737,
"method":"Scan",
"param":"region { type: REGION_NAME value: \\"t1,\\\\000\\\\000\\\\215\\\\f)o\\\\\\\\\\\\024\\\\302\\\\220\\\\000\\\\000\\\\000\\\\000\\\\000\\\\001\\\\000\\\\000\\\\000\\\\000\\\\000\\\\006\\\\000\\\\000\\\\000\\\\000\\\\000\\\\005\\\\000\\\\000<TRUNCATED>",
"processingtimems":28646,
"client":"10.253.196.215:41116",
"queuetimems":22453,
"class":"HRegionServer"}
\`\`\`

Unfortunately often the request parameters are truncated as per above Example. The truncation is unfortunate because it eliminates much of the utility of the warnings. For example, the region name, the start and end keys, and the filter hierarchy are all important clues for debugging performance problems caused by moderate to low selectivity queries or queries made at a high rate.

HBASE-22978 introduces maintaining an in-memory ring buffer of requests that were judged to be too slow in addition to the responseTooSlow logging. The in-memory representation can be complete. There is some chance a high rate of requests will cause information on other interesting requests to be overwritten before it can be read. This is an acceptable trade off.

In order to enable the in-memory ring buffer at RegionServers, we need to enable config:

\`\`\`text
hbase.regionserver.slowlog.buffer.enabled
\`\`\`

One more config determines the size of the ring buffer:

\`\`\`text
hbase.regionserver.slowlog.ringbuffer.size
\`\`\`

Check the config section for the detailed description.

This config would be disabled by default. Turn it on and these shell commands would provide expected results from the ring-buffers.

shell commands to retrieve slowlog responses from RegionServers:

\`\`\`text
Retrieve latest SlowLog Responses maintained by each or specific RegionServers.
Specify '*' to include all RS otherwise array of server names for specific
RS. A server name is the host, port plus startcode of a RegionServer.
e.g.: host187.example.com,60020,1289493121758 (find servername in
master ui or when you do detailed status in shell)

Provide optional filter parameters as Hash.
Default Limit of each server for providing no of slow log records is 10. User can specify
more limit by 'LIMIT' param in case more than 10 records should be retrieved.

Examples:

  hbase> get_slowlog_responses '*'                                 => get slowlog responses from all RS
  hbase> get_slowlog_responses '*', {'LIMIT' => 50}                => get slowlog responses from all RS
                                                                      with 50 records limit (default limit: 10)
  hbase> get_slowlog_responses ['SERVER_NAME1', 'SERVER_NAME2']    => get slowlog responses from SERVER_NAME1,
                                                                      SERVER_NAME2
  hbase> get_slowlog_responses '*', {'REGION_NAME' => 'hbase:meta,,1'}
                                                                   => get slowlog responses only related to meta
                                                                      region
  hbase> get_slowlog_responses '*', {'TABLE_NAME' => 't1'}         => get slowlog responses only related to t1 table
  hbase> get_slowlog_responses '*', {'CLIENT_IP' => '192.162.1.40:60225', 'LIMIT' => 100}
                                                                   => get slowlog responses with given client
                                                                      IP address and get 100 records limit
                                                                      (default limit: 10)
  hbase> get_slowlog_responses '*', {'REGION_NAME' => 'hbase:meta,,1', 'TABLE_NAME' => 't1'}
                                                                   => get slowlog responses with given region name
                                                                      or table name
  hbase> get_slowlog_responses '*', {'USER' => 'user_name', 'CLIENT_IP' => '192.162.1.40:60225'}
                                                                   => get slowlog responses that match either
                                                                      provided client IP address or user name
\`\`\`

All of above queries with filters have default OR operation applied i.e. all records with any of the provided filters applied will be returned. However, we can also apply AND operator i.e. all records that match all (not any) of the provided filters should be returned.

\`\`\`ruby
  hbase> get_slowlog_responses '*', {'REGION_NAME' => 'hbase:meta,,1', 'TABLE_NAME' => 't1', 'FILTER_BY_OP' => 'AND'}
                                                                   => get slowlog responses with given region name
                                                                      and table name, both should match

  hbase> get_slowlog_responses '*', {'REGION_NAME' => 'hbase:meta,,1', 'TABLE_NAME' => 't1', 'FILTER_BY_OP' => 'OR'}
                                                                   => get slowlog responses with given region name
                                                                      or table name, any one can match

  hbase> get_slowlog_responses '*', {'TABLE_NAME' => 't1', 'CLIENT_IP' => '192.163.41.53:52781', 'FILTER_BY_OP' => 'AND'}
                                                                   => get slowlog responses with given region name
                                                                      and client IP address, both should match
\`\`\`

Since OR is the default filter operator, without providing 'FILTER\\_BY\\_OP', query will have same result as providing 'FILTER\\_BY\\_OP' ⇒ 'OR'.

Sometimes output can be long pretty printed json for user to scroll in a single screen and hence user might prefer redirecting output of get\\_slowlog\\_responses to a file.

Example:

\`\`\`bash
echo "get_slowlog_responses '*'" | hbase shell > xyz.out 2>&1
\`\`\`

Similar to slow RPC logs, client can also retrieve large RPC logs. Sometimes, slow logs important to debug perf issues turn out to be larger in size.

\`\`\`ruby
  hbase> get_largelog_responses '*'                                 => get largelog responses from all RS
  hbase> get_largelog_responses '*', {'LIMIT' => 50}                => get largelog responses from all RS
                                                                       with 50 records limit (default limit: 10)
  hbase> get_largelog_responses ['SERVER_NAME1', 'SERVER_NAME2']    => get largelog responses from SERVER_NAME1,
                                                                       SERVER_NAME2
  hbase> get_largelog_responses '*', {'REGION_NAME' => 'hbase:meta,,1'}
                                                                    => get largelog responses only related to meta
                                                                       region
  hbase> get_largelog_responses '*', {'TABLE_NAME' => 't1'}         => get largelog responses only related to t1 table
  hbase> get_largelog_responses '*', {'CLIENT_IP' => '192.162.1.40:60225', 'LIMIT' => 100}
                                                                    => get largelog responses with given client
                                                                       IP address and get 100 records limit
                                                                       (default limit: 10)
  hbase> get_largelog_responses '*', {'REGION_NAME' => 'hbase:meta,,1', 'TABLE_NAME' => 't1'}
                                                                    => get largelog responses with given region name
                                                                       or table name
  hbase> get_largelog_responses '*', {'USER' => 'user_name', 'CLIENT_IP' => '192.162.1.40:60225'}
                                                                    => get largelog responses that match either
                                                                       provided client IP address or user name

  hbase> get_largelog_responses '*', {'REGION_NAME' => 'hbase:meta,,1', 'TABLE_NAME' => 't1', 'FILTER_BY_OP' => 'AND'}
                                                                   => get largelog responses with given region name
                                                                      and table name, both should match

  hbase> get_largelog_responses '*', {'REGION_NAME' => 'hbase:meta,,1', 'TABLE_NAME' => 't1', 'FILTER_BY_OP' => 'OR'}
                                                                   => get largelog responses with given region name
                                                                      or table name, any one can match

  hbase> get_largelog_responses '*', {'TABLE_NAME' => 't1', 'CLIENT_IP' => '192.163.41.53:52781', 'FILTER_BY_OP' => 'AND'}
                                                                   => get largelog responses with given region name
                                                                      and client IP address, both should match
\`\`\`

shell command to clear slow/largelog responses from RegionServer:

\`\`\`
Clears SlowLog Responses maintained by each or specific RegionServers.
Specify array of server names for specific RS. A server name is
the host, port plus startcode of a RegionServer.
e.g.: host187.example.com,60020,1289493121758 (find servername in
master ui or when you do detailed status in shell)

Examples:

  hbase> clear_slowlog_responses                                     => clears slowlog responses from all RS
  hbase> clear_slowlog_responses ['SERVER_NAME1', 'SERVER_NAME2']    => clears slowlog responses from SERVER_NAME1,
                                                                        SERVER_NAME2
\`\`\`

#### Get Slow/Large Response Logs from System table hbase:slowlog

The above section provides details about Admin APIs:

* get\\_slowlog\\_responses
* get\\_largelog\\_responses
* clear\\_slowlog\\_responses

All of the above APIs access online in-memory ring buffers from individual RegionServers and accumulate logs from ring buffers to display to end user. However, since the logs are stored in memory, after RegionServer is restarted, all the objects held in memory of that RegionServer will be cleaned up and previous logs are lost. What if we want to persist all these logs forever? What if we want to store them in such a manner that operator can get all historical records with some filters? e.g get me all large/slow RPC logs that are triggered by user1 and are related to region: cluster\\_test,cccccccc,1589635796466.aa45e1571d533f5ed0bb31cdccaaf9cf. ?

If we have a system table that stores such logs in increasing (not so strictly though) order of time, it can definitely help operators debug some historical events (scan, get, put, compaction, flush etc) with detailed inputs.

Config which enabled system table to be created and store all log events is \`hbase.regionserver.slowlog.systable.enabled\`.

The default value for this config is \`false\`. If provided \`true\` (Note: \`hbase.regionserver.slowlog.buffer.enabled\` should also be \`true\`), a cron job running in every RegionServer will persist the slow/large logs into table hbase:slowlog. By default cron job runs every 10 min. Duration can be configured with key: \`hbase.slowlog.systable.chore.duration\`. By default, RegionServer will store upto 1000(config key: \`hbase.regionserver.slowlog.systable.queue.size\`) slow/large logs in an internal queue and the chore will retrieve these logs from the queue and perform batch insertion in hbase:slowlog.

hbase:slowlog has single ColumnFamily: \`info\` \`info\` contains multiple qualifiers which are the same attributes present as part of \`get_slowlog_responses\` API response.

* info:call\\_details
* info:client\\_address
* info:method\\_name
* info:param
* info:processing\\_time
* info:queue\\_time
* info:region\\_name
* info:response\\_size
* info:server\\_class
* info:start\\_time
* info:type
* info:username

And example of 2 rows from hbase:slowlog scan result:

\`\`\`text
 \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:call_details, timestamp=2020-05-16T14:58:14.211Z, value=Scan(org.apache.hadoop.hbase.shaded.protobuf.generated.ClientProtos$ScanRequest)
 \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:client_address, timestamp=2020-05-16T14:58:14.211Z, value=172.20.10.2:57347
 \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:method_name, timestamp=2020-05-16T14:58:14.211Z, value=Scan
 \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:param, timestamp=2020-05-16T14:58:14.211Z, value=region { type: REGION_NAME value: "hbase:meta,,1" } scan { column { family: "info" } attribute { name: "_isolationle
                                                             vel_" value: "\\x5C000" } start_row: "cluster_test,33333333,99999999999999" stop_row: "cluster_test,," time_range { from: 0 to: 9223372036854775807 } max_versions: 1 cache_blocks
                                                             : true max_result_size: 2097152 reversed: true caching: 10 include_stop_row: true readType: PREAD } number_of_rows: 10 close_scanner: false client_handles_partials: true client_
                                                             handles_heartbeats: true track_scan_metrics: false
 \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:processing_time, timestamp=2020-05-16T14:58:14.211Z, value=18
 \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:queue_time, timestamp=2020-05-16T14:58:14.211Z, value=0
 \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:region_name, timestamp=2020-05-16T14:58:14.211Z, value=hbase:meta,,1
 \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:response_size, timestamp=2020-05-16T14:58:14.211Z, value=1575
 \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:server_class, timestamp=2020-05-16T14:58:14.211Z, value=HRegionServer
 \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:start_time, timestamp=2020-05-16T14:58:14.211Z, value=1589640743732
 \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:type, timestamp=2020-05-16T14:58:14.211Z, value=ALL
 \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:username, timestamp=2020-05-16T14:58:14.211Z, value=user2
 \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:call_details, timestamp=2020-05-16T14:59:58.764Z, value=Scan(org.apache.hadoop.hbase.shaded.protobuf.generated.ClientProtos$ScanRequest)
 \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:client_address, timestamp=2020-05-16T14:59:58.764Z, value=172.20.10.2:57348
 \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:method_name, timestamp=2020-05-16T14:59:58.764Z, value=Scan
 \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:param, timestamp=2020-05-16T14:59:58.764Z, value=region { type: REGION_NAME value: "cluster_test,cccccccc,1589635796466.aa45e1571d533f5ed0bb31cdccaaf9cf." } scan { a
                                                             ttribute { name: "_isolationlevel_" value: "\\x5C000" } start_row: "cccccccc" time_range { from: 0 to: 9223372036854775807 } max_versions: 1 cache_blocks: true max_result_size: 2
                                                             097152 caching: 2147483647 include_stop_row: false } number_of_rows: 2147483647 close_scanner: false client_handles_partials: true client_handles_heartbeats: true track_scan_met
                                                             rics: false
 \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:processing_time, timestamp=2020-05-16T14:59:58.764Z, value=24
 \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:queue_time, timestamp=2020-05-16T14:59:58.764Z, value=0
 \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:region_name, timestamp=2020-05-16T14:59:58.764Z, value=cluster_test,cccccccc,1589635796466.aa45e1571d533f5ed0bb31cdccaaf9cf.
 \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:response_size, timestamp=2020-05-16T14:59:58.764Z, value=211227
 \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:server_class, timestamp=2020-05-16T14:59:58.764Z, value=HRegionServer
 \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:start_time, timestamp=2020-05-16T14:59:58.764Z, value=1589640743932
 \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:type, timestamp=2020-05-16T14:59:58.764Z, value=ALL
 \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:username, timestamp=2020-05-16T14:59:58.764Z, value=user1
\`\`\`

Operator can use ColumnValueFilter to filter records based on region\\_name, username, client\\_address etc.

Time range based queries will also be very useful. Example:

\`\`\`bash
scan 'hbase:slowlog', { TIMERANGE => [1589621394000, 1589637999999] }
\`\`\`

### Block Cache Monitoring

Starting with HBase 0.98, the HBase Web UI includes the ability to monitor and report on the performance of the block cache. To view the block cache reports, see the Block Cache section of the region server UI. Following are a few examples of the reporting capabilities.

***Basic Info shows the cache implementation.***
<img alt="bc basic" src={__img0} />

***Config shows all cache configuration options.***
<img alt="bc config" src={__img1} />

***Stats shows statistics about the performance of the cache.***
<img alt="bc stats" src={__img2} />

***L1 and L2 show information about the L1 and L2 caches.***
<img alt="bc l1" src={__img3} />

This is not an exhaustive list of all the screens and reports available. Have a look in the Web UI.

### Snapshot Space Usage Monitoring

Starting with HBase 0.95, Snapshot usage information on individual snapshots was shown in the HBase Master Web UI. This was further enhanced starting with HBase 1.3 to show the total Storefile size of the Snapshot Set. The following metrics are shown in the Master Web UI with HBase 1.3 and later.

* Shared Storefile Size is the Storefile size shared between snapshots and active tables.
* Mob Storefile Size is the Mob Storefile size shared between snapshots and active tables.
* Archived Storefile Size is the Storefile size in Archive.

The format of Archived Storefile Size is NNN(MMM). NNN is the total Storefile size in Archive, MMM is the total Storefile size in Archive that is specific to the snapshot (not shared with other snapshots and tables).

***Master Snapshot Overview***
<img alt="master-snapshot" src={__img4} />

***Snapshot Storefile Stats Example 1***
<img alt="1 snapshot" src={__img5} />

***Snapshot Storefile Stats Example 2***
<img alt="2 snapshot" src={__img6} />

***Empty Snapshot Storfile Stats Example***
<img alt="empty snapshots" src={__img7} />

[^5]: The Metrics system was redone in HBase 0.96. See Migration to the New Metrics Hotness – Metrics2 by Elliot Clark for detail.
`,k={title:"Metrics & Monitoring",description:"HBase metrics system configuration, JMX monitoring, master and RegionServer metrics, and integration with monitoring tools."},E=[{href:"https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/Metrics.html"},{href:"https://hadoop.apache.org/docs/current/api/org/apache/hadoop/metrics2/package-summary.html"},{href:"https://hadoop.apache.org/docs/current/api/org/apache/hadoop/metrics2/package-summary.html#filtering"},{href:"http://localhost:16010"},{href:"http://www.vldb.org/conf/2002/S10P03.pdf"},{href:"http://opentsdb.net/"},{href:"/docs/operational-management/metrics-and-monitoring#most-important-regionserver-metrics"}],j={contents:[{heading:"hbase-metrics",content:"HBase emits metrics which adhere to the Hadoop Metrics API. Starting with HBase 0.95 [^5], HBase is configured to emit a default set of metrics with a default sampling period of every 10 seconds. You can use HBase metrics in conjunction with Ganglia. You can also filter which metrics are emitted and extend the metrics framework to capture custom metrics appropriate for your environment."},{heading:"metric-setup",content:"For HBase 0.95 and newer, HBase ships with a default metrics configuration, or &#x2A;**sink***. This includes a wide variety of individual metrics, and emits them every 10 seconds by default. To configure metrics for a given region server, edit the *conf/hadoop-metrics2-hbase.properties* file. Restart the region server for the changes to take effect."},{heading:"metric-setup",content:"To change the sampling rate for the default sink, edit the line beginning with `*.period`. To filter which metrics are emitted or to extend the metrics framework, see https\\://hadoop.apache.org/docs/current/api/org/apache/hadoop/metrics2/package-summary.html"},{heading:"metric-setup",content:`By default, HBase emits a large number of metrics per region server. Ganglia may have difficulty
processing all these metrics. Consider increasing the capacity of the Ganglia server or reducing
the number of metrics emitted by HBase. See Metrics
Filtering.`},{heading:"disabling-metrics",content:"To disable metrics for a region server, edit the *conf/hadoop-metrics2-hbase.properties* file and comment out any uncommented lines. Restart the region server for the changes to take effect."},{heading:"enabling-metrics-servlets",content:"HBase exposes the metrics in many formats such as JSON, prometheus-format through different servlets (`/jmx`, `/metrics`, `/prometheus`). Any of these servlets can be enabled or disabled by the configuration property `hbase.http.metrics.servlets`. The value for the property should be a comma separated list of the servlet aliases which are `{jmx, metrics, prometheus}`. `/jmx`, `/metrics`, `/prometheus` are enabled by default. To get metrics using these servlets access the URL `http://SERVER_HOSTNAME:SERVER_WEB_UI_PORT/endpoint`. Where endpoint is one of `/jmx`, `/metrics`, or `/prometheus`. Eg. `http://my.rs.xyz.com:16030/prometheus`"},{heading:"prometheus-servlets",content:"HBase exposes the metrics in prometheus friendly format through a servlet, `/prometheus`. Currently `/prometheus` exposes all the available metrics."},{heading:"discovering-available-metrics",content:"Rather than listing each metric which HBase emits by default, you can browse through the available metrics, either as a JSON output or via JMX. Different metrics are exposed for the Master process and each region server process."},{heading:"discovering-available-metrics",content:"**Procedure: Access a JSON Output of Available Metrics**"},{heading:"discovering-available-metrics",content:"After starting HBase, access the region server's web UI, at http\\://REGIONSERVER\\_HOSTNAME:16030 by default."},{heading:"discovering-available-metrics",content:"Click the **Metrics Dump** link near the top. The metrics for the region server are presented as a dump of the JMX bean in JSON format. This will dump out all metrics names and their values. To include metrics descriptions in the listing — this can be useful when you are exploring what is available — add a query string of `?description=true` so your URL becomes http\\://REGIONSERVER\\_HOSTNAME:16030/jmx?description=true. Not all beans and attributes have descriptions."},{heading:"discovering-available-metrics",content:"To view metrics for the Master, connect to the Master's web UI instead (defaults to http\\://localhost:16010) and click its **Metrics Dump** link. To include metrics descriptions in the listing — this can be useful when you are exploring what is available — add a query string of `?description=true` so your URL becomes http\\://REGIONSERVER\\_HOSTNAME:16010/jmx?description=true. Not all beans and attributes have descriptions."},{heading:"discovering-available-metrics",content:"You can use many different tools to view JMX content by browsing MBeans. This procedure uses `jvisualvm`, which is an application usually available in the JDK."},{heading:"discovering-available-metrics",content:"**Procedure: Browse the JMX Output of Available Metrics**"},{heading:"discovering-available-metrics",content:"Start HBase, if it is not already running."},{heading:"discovering-available-metrics",content:"Run the command `jvisualvm` command on a host with a GUI display. You can launch it from the command line or another method appropriate for your operating system."},{heading:"discovering-available-metrics",content:"Be sure the **VisualVM-MBeans** plugin is installed. Browse to **Tools → Plugins**. Click **Installed** and check whether the plugin is listed. If not, click **Available Plugins**, select it, and click Install. When finished, click Close."},{heading:"discovering-available-metrics",content:"To view details for a given HBase process, double-click the process in the **Local** sub-tree in the left-hand panel. A detailed view opens in the right-hand panel. Click the **MBeans** tab which appears as a tab in the top of the right-hand panel."},{heading:"discovering-available-metrics",content:"To access the HBase metrics, navigate to the appropriate sub-bean: .\\* Master: .\\* RegionServer:"},{heading:"discovering-available-metrics",content:"The name of each metric and its current value is displayed in the **Attributes** tab. For a view which includes more details, including the description of each attribute, click the **Metadata** tab."},{heading:"units-of-measure-for-metrics",content:"Different metrics are expressed in different units, as appropriate. Often, the unit of measure is in the name (as in the metric `shippedKBs`). Otherwise, use the following guidelines. When in doubt, you may need to examine the source for a given metric."},{heading:"units-of-measure-for-metrics",content:"Metrics that refer to a point in time are usually expressed as a timestamp."},{heading:"units-of-measure-for-metrics",content:"Metrics that refer to an age (such as `ageOfLastShippedOp`) are usually expressed in milliseconds."},{heading:"units-of-measure-for-metrics",content:"Metrics that refer to memory sizes are in bytes."},{heading:"units-of-measure-for-metrics",content:"Sizes of queues (such as `sizeOfLogQueue`) are expressed as the number of items in the queue. Determine the size by multiplying by the block size (default is 64 MB in HDFS)."},{heading:"units-of-measure-for-metrics",content:"Metrics that refer to things like the number of a given type of operations (such as `logEditsRead`) are expressed as an integer."},{heading:"most-important-master-metrics",content:"Note: Counts are usually over the last metrics reporting interval."},{heading:"most-important-master-metrics",content:`**hbase.master.numRegionServers**\\
Number of live regionservers`},{heading:"most-important-master-metrics",content:`**hbase.master.numDeadRegionServers**\\
Number of dead regionservers`},{heading:"most-important-master-metrics",content:`**hbase.master.ritCount**\\
The number of regions in transition`},{heading:"most-important-master-metrics",content:`**hbase.master.ritCountOverThreshold**\\
The number of regions that have been in transition longer than a threshold time (default: 60 seconds)`},{heading:"most-important-master-metrics",content:`**hbase.master.ritOldestAge**\\
The age of the longest region in transition, in milliseconds`},{heading:"most-important-regionserver-metrics",content:"Note: Counts are usually over the last metrics reporting interval."},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.regionCount**\\
The number of regions hosted by the regionserver`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.storeFileCount**\\
The number of store files on disk currently managed by the regionserver`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.storeFileSize**\\
Aggregate size of the store files on disk`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.hlogFileCount**\\
The number of write ahead logs not yet archived`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.totalRequestCount**\\
The total number of requests received`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.readRequestCount**\\
The number of read requests received`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.writeRequestCount**\\
The number of write requests received`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.numOpenConnections**\\
The number of open connections at the RPC layer`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.numActiveHandler**\\
The number of RPC handlers actively servicing requests`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.numCallsInGeneralQueue**\\
The number of currently enqueued user requests`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.numCallsInReplicationQueue**\\
The number of currently enqueued operations received from replication`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.numCallsInPriorityQueue**\\
The number of currently enqueued priority (internal housekeeping) requests`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.flushQueueLength**\\
Current depth of the memstore flush queue. If increasing, we are falling behind with clearing memstores out to HDFS.`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.updatesBlockedTime**\\
Number of milliseconds updates have been blocked so the memstore can be flushed`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.compactionQueueLength**\\
Current depth of the compaction request queue. If increasing, we are falling behind with storefile compaction.`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.blockCacheHitCount**\\
The number of block cache hits`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.blockCacheMissCount**\\
The number of block cache misses`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.blockCacheExpressHitPercent**\\
The percent of the time that requests with the cache turned on hit the cache`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.percentFilesLocal**\\
Percent of store file data that can be read from the local DataNode, 0-100`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.\\<op>\\_\\<measure>**\\
Operation latencies, where \\<op> is one of Append, Delete, Mutate, Get, Replay, Increment; and where \\<measure> is one of min, max, mean, median, 75th\\_percentile, 95th\\_percentile, 99th\\_percentile`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.slow\\<op>Count**\\
The number of operations we thought were slow, where \\<op> is one of the list above`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.GcTimeMillis**\\
Time spent in garbage collection, in milliseconds`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.GcTimeMillisParNew**\\
Time spent in garbage collection of the young generation, in milliseconds`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.GcTimeMillisConcurrentMarkSweep**\\
Time spent in garbage collection of the old generation, in milliseconds`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.authenticationSuccesses**\\
Number of client connections where authentication succeeded`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.authenticationFailures**\\
Number of client connection authentication failures`},{heading:"most-important-regionserver-metrics",content:`**hbase.regionserver.mutationsWithoutWALCount**\\
Count of writes submitted with a flag indicating they should bypass the write ahead log`},{heading:"meta-table-load-metrics",content:"HBase meta table metrics collection feature is available in HBase 1.4+ but it is disabled by default, as it can affect the performance of the cluster. When it is enabled, it helps to monitor client access patterns by collecting the following statistics:"},{heading:"meta-table-load-metrics",content:"number of get, put and delete operations on the `hbase:meta` table"},{heading:"meta-table-load-metrics",content:"number of get, put and delete operations made by the top-N clients"},{heading:"meta-table-load-metrics",content:"number of operations related to each table"},{heading:"meta-table-load-metrics",content:`number of operations related to the top-N regions\\
**When to use the feature**\\
This feature can help to identify hot spots in the meta table by showing the regions or tables where the meta info is modified (e.g. by create, drop, split or move tables) or retrieved most frequently. It can also help to find misbehaving client applications by showing which clients are using the meta table most heavily, which can for example suggest the lack of meta table buffering or the lack of re-using open client connections in the client application.`},{heading:"meta-table-load-metrics",content:`Having large number of clients and regions in the cluster can cause the registration and tracking
of a large amount of metrics, which can increase the memory and CPU footprint of the HBase region
server handling the \`hbase:meta\` table. It can also cause the significant increase of the JMX dump
size, which can affect the monitoring or log aggregation system you use beside HBase. It is
recommended to turn on this feature only during debugging.`},{heading:"meta-table-load-metrics",content:"**Where to find the metrics in JMX**\\\nEach metric attribute name will start with the ‘MetaTable\\_' prefix. For all the metrics you will see five different JMX attributes: count, mean rate, 1 minute rate, 5 minute rate and 15 minute rate. You will find these metrics in JMX under the following MBean: `Hadoop → HBase → RegionServer → Coprocessor.Region.CP_org.apache.hadoop.hbase.coprocessor.MetaTableMetrics`."},{heading:"meta-table-load-metrics",content:"**Examples: some Meta Table metrics you can see in your JMX dump**"},{heading:"meta-table-load-metrics",content:"**Configuration**\\\nTo turn on this feature, you have to enable a custom coprocessor by adding the following section to hbase-site.xml. This coprocessor will run on all the HBase RegionServers, but will be active (i.e. consume memory / CPU) only on the server, where the `hbase:meta` table is located. It will produce JMX metrics which can be downloaded from the web UI of the given RegionServer or by a simple REST call. These metrics will not be present in the JMX dump of the other RegionServers."},{heading:"meta-table-load-metrics",content:"**Enabling the Meta Table Metrics feature**"},{heading:"meta-table-load-metrics",content:`The 'top-N' type of metrics will be counted using the Lossy Counting Algorithm (as defined in Motwani, R; Manku, G.S (2002). "Approximate frequency counts over data streams"), which is designed to identify elements in a data stream whose frequency count exceed a user-given threshold. The frequency computed by this algorithm is not always accurate but has an error threshold that can be specified by the user as a configuration parameter. The run time space required by the algorithm is inversely proportional to the specified error threshold, hence larger the error parameter, the smaller the footprint and the less accurate are the metrics.`},{heading:"meta-table-load-metrics",content:"You can specify the error rate of the algorithm as a floating-point value between 0 and 1 (exclusive), it's default value is 0.02. Having the error rate set to `E` and having `N` as the total number of meta table operations, then (assuming the uniform distribution of the activity of low frequency elements) at most `7 / E` meters will be kept and each kept element will have a frequency higher than `E * N`."},{heading:"meta-table-load-metrics",content:"An example: Let's assume we are interested in the HBase clients that are most active in accessing the meta table. When there was 1,000,000 operations on the meta table so far and the error rate parameter is set to 0.02, then we can assume that only at most 350 client IP address related counters will be present in JMX and each of these clients accessed the meta table at least 20,000 times."},{heading:"hbase-monitoring-overview",content:`The following metrics are arguably the most important to monitor for each RegionServer for "macro monitoring", preferably with a system like OpenTSDB. If your cluster is having performance issues it's likely that you'll see something unusual with this group.`},{heading:"hbase-toc",content:"See rs metrics"},{heading:"os-toc",content:"IO Wait"},{heading:"os-toc",content:"User CPU"},{heading:"java-toc",content:"GC"},{heading:"slow-query-log",content:'The HBase slow query log consists of parseable JSON structures describing the properties of those client operations (Gets, Puts, Deletes, etc.) that either took too long to run, or produced too much output. The thresholds for "too long to run" and "too much output" are configurable, as described below. The output is produced inline in the main region server logs so that it is easy to discover further details from context with other logged events. It is also prepended with identifying tags `(responseTooSlow)`, `(responseTooLarge)`, `(operationTooSlow)`, and `(operationTooLarge)` in order to enable easy filtering with grep, in case the user desires to see only slow queries.'},{heading:"operational-management-metrics-and-monitoring-overview-configuration",content:"There are four configuration knobs that can be used to adjust the thresholds for when queries are logged. Two of these knobs control the size and time thresholds for all queries. Because Scans can often be larger and slower than other types of queries, there are two additional knobs which can control size and time thresholds for Scans specifically."},{heading:"operational-management-metrics-and-monitoring-overview-configuration",content:"`hbase.ipc.warn.response.time` Maximum number of milliseconds that a query can be run without being logged. Defaults to 10000, or 10 seconds. Can be set to -1 to disable logging by time."},{heading:"operational-management-metrics-and-monitoring-overview-configuration",content:"`hbase.ipc.warn.response.size` Maximum byte size of response that a query can return without being logged. Defaults to 100 megabytes. Can be set to -1 to disable logging by size."},{heading:"operational-management-metrics-and-monitoring-overview-configuration",content:"`hbase.ipc.warn.response.time.scan` Maximum number of milliseconds that a Scan can be run without being logged. Defaults to the `hbase.ipc.warn.response.time` value. Can be set to -1 to disable logging by time."},{heading:"operational-management-metrics-and-monitoring-overview-configuration",content:"`hbase.ipc.warn.response.size.scan` Maximum byte size of response that a Scan can return without being logged. Defaults to the `hbase.ipc.warn.response.size` value. Can be set to -1 to disable logging by size."},{heading:"operational-management-hbase-monitoring-slow-query-log-metrics",content:"The slow query log exposes to metrics to JMX."},{heading:"operational-management-hbase-monitoring-slow-query-log-metrics",content:"`hadoop.regionserver_rpc_slowResponse` a global metric reflecting the durations of all responses that triggered logging."},{heading:"operational-management-hbase-monitoring-slow-query-log-metrics",content:"`hadoop.regionserver_rpc_methodName.aboveOneSec` A metric reflecting the durations of all responses that lasted for more than one second."},{heading:"output",content:"The output is tagged with operation e.g. `(operationTooSlow)` if the call was a client operation, such as a Put, Get, or Delete, which we expose detailed fingerprint information for. If not, it is tagged `(responseTooSlow)` and still produces parseable JSON output, but with less verbose information solely regarding its duration and size in the RPC itself. `TooLarge` is substituted for `TooSlow` if the response size triggered the logging, with `TooLarge` appearing even in the case that both size and duration triggered logging."},{heading:"operational-management-hbase-monitoring-slow-query-log-example",content:`Note that everything inside the "tables" structure is output produced by MultiPut's fingerprint, while the rest of the information is RPC-specific, such as processing time and client IP/port. Other client operations follow the same pattern and the same general structure, with necessary differences due to the nature of the individual operations. In the case that the call is not a client operation, that detailed fingerprint information will be completely absent.`},{heading:"operational-management-hbase-monitoring-slow-query-log-example",content:'This particular example, for example, would indicate that the likely cause of slowness is simply a very large (on the order of 100MB) multiput, as we can tell by the "vlen," or value length, fields of each put in the multiPut.'},{heading:"get-slow-response-log-from-shell",content:"When an individual RPC exceeds a configurable time bound we log a complaint by way of the logging subsystem"},{heading:"get-slow-response-log-from-shell",content:"e.g."},{heading:"get-slow-response-log-from-shell",content:"Unfortunately often the request parameters are truncated as per above Example. The truncation is unfortunate because it eliminates much of the utility of the warnings. For example, the region name, the start and end keys, and the filter hierarchy are all important clues for debugging performance problems caused by moderate to low selectivity queries or queries made at a high rate."},{heading:"get-slow-response-log-from-shell",content:"HBASE-22978 introduces maintaining an in-memory ring buffer of requests that were judged to be too slow in addition to the responseTooSlow logging. The in-memory representation can be complete. There is some chance a high rate of requests will cause information on other interesting requests to be overwritten before it can be read. This is an acceptable trade off."},{heading:"get-slow-response-log-from-shell",content:"In order to enable the in-memory ring buffer at RegionServers, we need to enable config:"},{heading:"get-slow-response-log-from-shell",content:"One more config determines the size of the ring buffer:"},{heading:"get-slow-response-log-from-shell",content:"Check the config section for the detailed description."},{heading:"get-slow-response-log-from-shell",content:"This config would be disabled by default. Turn it on and these shell commands would provide expected results from the ring-buffers."},{heading:"get-slow-response-log-from-shell",content:"shell commands to retrieve slowlog responses from RegionServers:"},{heading:"get-slow-response-log-from-shell",content:"All of above queries with filters have default OR operation applied i.e. all records with any of the provided filters applied will be returned. However, we can also apply AND operator i.e. all records that match all (not any) of the provided filters should be returned."},{heading:"get-slow-response-log-from-shell",content:"Since OR is the default filter operator, without providing 'FILTER\\_BY\\_OP', query will have same result as providing 'FILTER\\_BY\\_OP' ⇒ 'OR'."},{heading:"get-slow-response-log-from-shell",content:"Sometimes output can be long pretty printed json for user to scroll in a single screen and hence user might prefer redirecting output of get\\_slowlog\\_responses to a file."},{heading:"get-slow-response-log-from-shell",content:"Example:"},{heading:"get-slow-response-log-from-shell",content:"Similar to slow RPC logs, client can also retrieve large RPC logs. Sometimes, slow logs important to debug perf issues turn out to be larger in size."},{heading:"get-slow-response-log-from-shell",content:"shell command to clear slow/largelog responses from RegionServer:"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"The above section provides details about Admin APIs:"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"get\\_slowlog\\_responses"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"get\\_largelog\\_responses"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"clear\\_slowlog\\_responses"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"All of the above APIs access online in-memory ring buffers from individual RegionServers and accumulate logs from ring buffers to display to end user. However, since the logs are stored in memory, after RegionServer is restarted, all the objects held in memory of that RegionServer will be cleaned up and previous logs are lost. What if we want to persist all these logs forever? What if we want to store them in such a manner that operator can get all historical records with some filters? e.g get me all large/slow RPC logs that are triggered by user1 and are related to region: cluster\\_test,cccccccc,1589635796466.aa45e1571d533f5ed0bb31cdccaaf9cf. ?"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"If we have a system table that stores such logs in increasing (not so strictly though) order of time, it can definitely help operators debug some historical events (scan, get, put, compaction, flush etc) with detailed inputs."},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"Config which enabled system table to be created and store all log events is `hbase.regionserver.slowlog.systable.enabled`."},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"The default value for this config is `false`. If provided `true` (Note: `hbase.regionserver.slowlog.buffer.enabled` should also be `true`), a cron job running in every RegionServer will persist the slow/large logs into table hbase:slowlog. By default cron job runs every 10 min. Duration can be configured with key: `hbase.slowlog.systable.chore.duration`. By default, RegionServer will store upto 1000(config key: `hbase.regionserver.slowlog.systable.queue.size`) slow/large logs in an internal queue and the chore will retrieve these logs from the queue and perform batch insertion in hbase:slowlog."},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"hbase:slowlog has single ColumnFamily: `info` `info` contains multiple qualifiers which are the same attributes present as part of `get_slowlog_responses` API response."},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"info:call\\_details"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"info:client\\_address"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"info:method\\_name"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"info:param"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"info:processing\\_time"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"info:queue\\_time"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"info:region\\_name"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"info:response\\_size"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"info:server\\_class"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"info:start\\_time"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"info:type"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"info:username"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"And example of 2 rows from hbase:slowlog scan result:"},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"Operator can use ColumnValueFilter to filter records based on region\\_name, username, client\\_address etc."},{heading:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"Time range based queries will also be very useful. Example:"},{heading:"block-cache-monitoring",content:"Starting with HBase 0.98, the HBase Web UI includes the ability to monitor and report on the performance of the block cache. To view the block cache reports, see the Block Cache section of the region server UI. Following are a few examples of the reporting capabilities."},{heading:"block-cache-monitoring",content:"***Basic Info shows the cache implementation.***"},{heading:"block-cache-monitoring",content:"***Config shows all cache configuration options.***"},{heading:"block-cache-monitoring",content:"***Stats shows statistics about the performance of the cache.***"},{heading:"block-cache-monitoring",content:"***L1 and L2 show information about the L1 and L2 caches.***"},{heading:"block-cache-monitoring",content:"This is not an exhaustive list of all the screens and reports available. Have a look in the Web UI."},{heading:"snapshot-space-usage-monitoring",content:"Starting with HBase 0.95, Snapshot usage information on individual snapshots was shown in the HBase Master Web UI. This was further enhanced starting with HBase 1.3 to show the total Storefile size of the Snapshot Set. The following metrics are shown in the Master Web UI with HBase 1.3 and later."},{heading:"snapshot-space-usage-monitoring",content:"Shared Storefile Size is the Storefile size shared between snapshots and active tables."},{heading:"snapshot-space-usage-monitoring",content:"Mob Storefile Size is the Mob Storefile size shared between snapshots and active tables."},{heading:"snapshot-space-usage-monitoring",content:"Archived Storefile Size is the Storefile size in Archive."},{heading:"snapshot-space-usage-monitoring",content:"The format of Archived Storefile Size is NNN(MMM). NNN is the total Storefile size in Archive, MMM is the total Storefile size in Archive that is specific to the snapshot (not shared with other snapshots and tables)."},{heading:"snapshot-space-usage-monitoring",content:"***Master Snapshot Overview***"},{heading:"snapshot-space-usage-monitoring",content:"***Snapshot Storefile Stats Example 1***"},{heading:"snapshot-space-usage-monitoring",content:"***Snapshot Storefile Stats Example 2***"},{heading:"snapshot-space-usage-monitoring",content:"***Empty Snapshot Storfile Stats Example***"},{heading:"snapshot-space-usage-monitoring",content:"The Metrics system was redone in HBase 0.96. See Migration to the New Metrics Hotness – Metrics2 by Elliot Clark for detail."}],headings:[{id:"hbase-metrics",content:"HBase Metrics"},{id:"metric-setup",content:"Metric Setup"},{id:"disabling-metrics",content:"Disabling Metrics"},{id:"enabling-metrics-servlets",content:"Enabling Metrics Servlets"},{id:"prometheus-servlets",content:"Prometheus servlets"},{id:"discovering-available-metrics",content:"Discovering Available Metrics"},{id:"units-of-measure-for-metrics",content:"Units of Measure for Metrics"},{id:"most-important-master-metrics",content:"Most Important Master Metrics"},{id:"most-important-regionserver-metrics",content:"Most Important RegionServer Metrics"},{id:"meta-table-load-metrics",content:"Meta Table Load Metrics"},{id:"hbase-monitoring",content:"HBase Monitoring"},{id:"hbase-monitoring-overview",content:"Overview"},{id:"hbase-toc",content:"HBase [!toc]"},{id:"os-toc",content:"OS [!toc]"},{id:"java-toc",content:"Java [!toc]"},{id:"slow-query-log",content:"Slow Query Log"},{id:"operational-management-metrics-and-monitoring-overview-configuration",content:"Configuration"},{id:"operational-management-hbase-monitoring-slow-query-log-metrics",content:"Metrics"},{id:"output",content:"Output"},{id:"operational-management-hbase-monitoring-slow-query-log-example",content:"Example"},{id:"get-slow-response-log-from-shell",content:"Get Slow Response Log from shell"},{id:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",content:"Get Slow/Large Response Logs from System table hbase:slowlog"},{id:"block-cache-monitoring",content:"Block Cache Monitoring"},{id:"snapshot-space-usage-monitoring",content:"Snapshot Space Usage Monitoring"}]},y=[{depth:2,url:"#hbase-metrics",title:e.jsx(e.Fragment,{children:"HBase Metrics"})},{depth:3,url:"#metric-setup",title:e.jsx(e.Fragment,{children:"Metric Setup"})},{depth:3,url:"#disabling-metrics",title:e.jsx(e.Fragment,{children:"Disabling Metrics"})},{depth:3,url:"#enabling-metrics-servlets",title:e.jsx(e.Fragment,{children:"Enabling Metrics Servlets"})},{depth:3,url:"#prometheus-servlets",title:e.jsx(e.Fragment,{children:"Prometheus servlets"})},{depth:3,url:"#discovering-available-metrics",title:e.jsx(e.Fragment,{children:"Discovering Available Metrics"})},{depth:3,url:"#units-of-measure-for-metrics",title:e.jsx(e.Fragment,{children:"Units of Measure for Metrics"})},{depth:3,url:"#most-important-master-metrics",title:e.jsx(e.Fragment,{children:"Most Important Master Metrics"})},{depth:3,url:"#most-important-regionserver-metrics",title:e.jsx(e.Fragment,{children:"Most Important RegionServer Metrics"})},{depth:3,url:"#meta-table-load-metrics",title:e.jsx(e.Fragment,{children:"Meta Table Load Metrics"})},{depth:2,url:"#hbase-monitoring",title:e.jsx(e.Fragment,{children:"HBase Monitoring"})},{depth:3,url:"#hbase-monitoring-overview",title:e.jsx(e.Fragment,{children:"Overview"})},{depth:3,url:"#slow-query-log",title:e.jsx(e.Fragment,{children:"Slow Query Log"})},{depth:4,url:"#operational-management-metrics-and-monitoring-overview-configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:4,url:"#operational-management-hbase-monitoring-slow-query-log-metrics",title:e.jsx(e.Fragment,{children:"Metrics"})},{depth:4,url:"#output",title:e.jsx(e.Fragment,{children:"Output"})},{depth:4,url:"#operational-management-hbase-monitoring-slow-query-log-example",title:e.jsx(e.Fragment,{children:"Example"})},{depth:4,url:"#get-slow-response-log-from-shell",title:e.jsx(e.Fragment,{children:"Get Slow Response Log from shell"})},{depth:4,url:"#get-slowlarge-response-logs-from-system-table-hbaseslowlog",title:e.jsx(e.Fragment,{children:"Get Slow/Large Response Logs from System table hbase:slowlog"})},{depth:3,url:"#block-cache-monitoring",title:e.jsx(e.Fragment,{children:"Block Cache Monitoring"})},{depth:3,url:"#snapshot-space-usage-monitoring",title:e.jsx(e.Fragment,{children:"Snapshot Space Usage Monitoring"})},{depth:2,url:"#footnote-label",title:e.jsx(e.Fragment,{children:"Footnotes"})}];function o(n){const s={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",section:"section",span:"span",strong:"strong",sup:"sup",ul:"ul",...n.components},{Callout:t,Step:i,Steps:r}=s;return t||a("Callout"),i||a("Step"),r||a("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(s.h2,{id:"hbase-metrics",children:"HBase Metrics"}),`
`,e.jsxs(s.p,{children:["HBase emits metrics which adhere to the ",e.jsx(s.a,{href:"https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/Metrics.html",children:"Hadoop Metrics"})," API. Starting with HBase 0.95 ",e.jsx(s.sup,{children:e.jsx(s.a,{href:"#user-content-fn-5",id:"user-content-fnref-5","data-footnote-ref":!0,"aria-describedby":"footnote-label",children:"1"})}),", HBase is configured to emit a default set of metrics with a default sampling period of every 10 seconds. You can use HBase metrics in conjunction with Ganglia. You can also filter which metrics are emitted and extend the metrics framework to capture custom metrics appropriate for your environment."]}),`
`,e.jsx(s.h3,{id:"metric-setup",children:"Metric Setup"}),`
`,e.jsxs(s.p,{children:["For HBase 0.95 and newer, HBase ships with a default metrics configuration, or ",e.jsx(s.strong,{children:e.jsx(s.em,{children:"sink"})}),". This includes a wide variety of individual metrics, and emits them every 10 seconds by default. To configure metrics for a given region server, edit the ",e.jsx(s.em,{children:"conf/hadoop-metrics2-hbase.properties"})," file. Restart the region server for the changes to take effect."]}),`
`,e.jsxs(s.p,{children:["To change the sampling rate for the default sink, edit the line beginning with ",e.jsx(s.code,{children:"*.period"}),". To filter which metrics are emitted or to extend the metrics framework, see ",e.jsx(s.a,{href:"https://hadoop.apache.org/docs/current/api/org/apache/hadoop/metrics2/package-summary.html",children:"https://hadoop.apache.org/docs/current/api/org/apache/hadoop/metrics2/package-summary.html"})]}),`
`,e.jsx(t,{type:"info",title:"HBase Metrics and Ganglia",children:e.jsxs(s.p,{children:[`By default, HBase emits a large number of metrics per region server. Ganglia may have difficulty
processing all these metrics. Consider increasing the capacity of the Ganglia server or reducing
the number of metrics emitted by HBase. See `,e.jsx(s.a,{href:"https://hadoop.apache.org/docs/current/api/org/apache/hadoop/metrics2/package-summary.html#filtering",children:`Metrics
Filtering`}),"."]})}),`
`,e.jsx(s.h3,{id:"disabling-metrics",children:"Disabling Metrics"}),`
`,e.jsxs(s.p,{children:["To disable metrics for a region server, edit the ",e.jsx(s.em,{children:"conf/hadoop-metrics2-hbase.properties"})," file and comment out any uncommented lines. Restart the region server for the changes to take effect."]}),`
`,e.jsx(s.h3,{id:"enabling-metrics-servlets",children:"Enabling Metrics Servlets"}),`
`,e.jsxs(s.p,{children:["HBase exposes the metrics in many formats such as JSON, prometheus-format through different servlets (",e.jsx(s.code,{children:"/jmx"}),", ",e.jsx(s.code,{children:"/metrics"}),", ",e.jsx(s.code,{children:"/prometheus"}),"). Any of these servlets can be enabled or disabled by the configuration property ",e.jsx(s.code,{children:"hbase.http.metrics.servlets"}),". The value for the property should be a comma separated list of the servlet aliases which are ",e.jsx(s.code,{children:"{jmx, metrics, prometheus}"}),". ",e.jsx(s.code,{children:"/jmx"}),", ",e.jsx(s.code,{children:"/metrics"}),", ",e.jsx(s.code,{children:"/prometheus"})," are enabled by default. To get metrics using these servlets access the URL ",e.jsx(s.code,{children:"http://SERVER_HOSTNAME:SERVER_WEB_UI_PORT/endpoint"}),". Where endpoint is one of ",e.jsx(s.code,{children:"/jmx"}),", ",e.jsx(s.code,{children:"/metrics"}),", or ",e.jsx(s.code,{children:"/prometheus"}),". Eg. ",e.jsx(s.code,{children:"http://my.rs.xyz.com:16030/prometheus"})]}),`
`,e.jsx(s.h3,{id:"prometheus-servlets",children:"Prometheus servlets"}),`
`,e.jsxs(s.p,{children:["HBase exposes the metrics in prometheus friendly format through a servlet, ",e.jsx(s.code,{children:"/prometheus"}),". Currently ",e.jsx(s.code,{children:"/prometheus"})," exposes all the available metrics."]}),`
`,e.jsx(s.h3,{id:"discovering-available-metrics",children:"Discovering Available Metrics"}),`
`,e.jsx(s.p,{children:"Rather than listing each metric which HBase emits by default, you can browse through the available metrics, either as a JSON output or via JMX. Different metrics are exposed for the Master process and each region server process."}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Procedure: Access a JSON Output of Available Metrics"})}),`
`,e.jsxs(r,{children:[e.jsx(i,{children:e.jsx(s.p,{children:"After starting HBase, access the region server's web UI, at http://REGIONSERVER_HOSTNAME:16030 by default."})}),e.jsx(i,{children:e.jsxs(s.p,{children:["Click the ",e.jsx(s.strong,{children:"Metrics Dump"})," link near the top. The metrics for the region server are presented as a dump of the JMX bean in JSON format. This will dump out all metrics names and their values. To include metrics descriptions in the listing — this can be useful when you are exploring what is available — add a query string of ",e.jsx(s.code,{children:"?description=true"})," so your URL becomes http://REGIONSERVER_HOSTNAME:16030/jmx?description=true. Not all beans and attributes have descriptions."]})}),e.jsx(i,{children:e.jsxs(s.p,{children:["To view metrics for the Master, connect to the Master's web UI instead (defaults to ",e.jsx(s.a,{href:"http://localhost:16010",children:"http://localhost:16010"}),") and click its ",e.jsx(s.strong,{children:"Metrics Dump"})," link. To include metrics descriptions in the listing — this can be useful when you are exploring what is available — add a query string of ",e.jsx(s.code,{children:"?description=true"})," so your URL becomes http://REGIONSERVER_HOSTNAME:16010/jmx?description=true. Not all beans and attributes have descriptions."]})})]}),`
`,e.jsxs(s.p,{children:["You can use many different tools to view JMX content by browsing MBeans. This procedure uses ",e.jsx(s.code,{children:"jvisualvm"}),", which is an application usually available in the JDK."]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Procedure: Browse the JMX Output of Available Metrics"})}),`
`,e.jsxs(r,{children:[e.jsx(i,{children:e.jsx(s.p,{children:"Start HBase, if it is not already running."})}),e.jsx(i,{children:e.jsxs(s.p,{children:["Run the command ",e.jsx(s.code,{children:"jvisualvm"})," command on a host with a GUI display. You can launch it from the command line or another method appropriate for your operating system."]})}),e.jsx(i,{children:e.jsxs(s.p,{children:["Be sure the ",e.jsx(s.strong,{children:"VisualVM-MBeans"})," plugin is installed. Browse to ",e.jsx(s.strong,{children:"Tools → Plugins"}),". Click ",e.jsx(s.strong,{children:"Installed"})," and check whether the plugin is listed. If not, click ",e.jsx(s.strong,{children:"Available Plugins"}),", select it, and click Install. When finished, click Close."]})}),e.jsx(i,{children:e.jsxs(s.p,{children:["To view details for a given HBase process, double-click the process in the ",e.jsx(s.strong,{children:"Local"})," sub-tree in the left-hand panel. A detailed view opens in the right-hand panel. Click the ",e.jsx(s.strong,{children:"MBeans"})," tab which appears as a tab in the top of the right-hand panel."]})}),e.jsx(i,{children:e.jsx(s.p,{children:"To access the HBase metrics, navigate to the appropriate sub-bean: .* Master: .* RegionServer:"})}),e.jsx(i,{children:e.jsxs(s.p,{children:["The name of each metric and its current value is displayed in the ",e.jsx(s.strong,{children:"Attributes"})," tab. For a view which includes more details, including the description of each attribute, click the ",e.jsx(s.strong,{children:"Metadata"})," tab."]})})]}),`
`,e.jsx(s.h3,{id:"units-of-measure-for-metrics",children:"Units of Measure for Metrics"}),`
`,e.jsxs(s.p,{children:["Different metrics are expressed in different units, as appropriate. Often, the unit of measure is in the name (as in the metric ",e.jsx(s.code,{children:"shippedKBs"}),"). Otherwise, use the following guidelines. When in doubt, you may need to examine the source for a given metric."]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Metrics that refer to a point in time are usually expressed as a timestamp."}),`
`,e.jsxs(s.li,{children:["Metrics that refer to an age (such as ",e.jsx(s.code,{children:"ageOfLastShippedOp"}),") are usually expressed in milliseconds."]}),`
`,e.jsx(s.li,{children:"Metrics that refer to memory sizes are in bytes."}),`
`,e.jsxs(s.li,{children:["Sizes of queues (such as ",e.jsx(s.code,{children:"sizeOfLogQueue"}),") are expressed as the number of items in the queue. Determine the size by multiplying by the block size (default is 64 MB in HDFS)."]}),`
`,e.jsxs(s.li,{children:["Metrics that refer to things like the number of a given type of operations (such as ",e.jsx(s.code,{children:"logEditsRead"}),") are expressed as an integer."]}),`
`]}),`
`,e.jsx(s.h3,{id:"most-important-master-metrics",children:"Most Important Master Metrics"}),`
`,e.jsx(s.p,{children:"Note: Counts are usually over the last metrics reporting interval."}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.master.numRegionServers"}),e.jsx(s.br,{}),`
`,"Number of live regionservers"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.master.numDeadRegionServers"}),e.jsx(s.br,{}),`
`,"Number of dead regionservers"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.master.ritCount"}),e.jsx(s.br,{}),`
`,"The number of regions in transition"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.master.ritCountOverThreshold"}),e.jsx(s.br,{}),`
`,"The number of regions that have been in transition longer than a threshold time (default: 60 seconds)"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.master.ritOldestAge"}),e.jsx(s.br,{}),`
`,"The age of the longest region in transition, in milliseconds"]}),`
`,e.jsx(s.h3,{id:"most-important-regionserver-metrics",children:"Most Important RegionServer Metrics"}),`
`,e.jsx(s.p,{children:"Note: Counts are usually over the last metrics reporting interval."}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.regionCount"}),e.jsx(s.br,{}),`
`,"The number of regions hosted by the regionserver"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.storeFileCount"}),e.jsx(s.br,{}),`
`,"The number of store files on disk currently managed by the regionserver"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.storeFileSize"}),e.jsx(s.br,{}),`
`,"Aggregate size of the store files on disk"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.hlogFileCount"}),e.jsx(s.br,{}),`
`,"The number of write ahead logs not yet archived"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.totalRequestCount"}),e.jsx(s.br,{}),`
`,"The total number of requests received"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.readRequestCount"}),e.jsx(s.br,{}),`
`,"The number of read requests received"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.writeRequestCount"}),e.jsx(s.br,{}),`
`,"The number of write requests received"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.numOpenConnections"}),e.jsx(s.br,{}),`
`,"The number of open connections at the RPC layer"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.numActiveHandler"}),e.jsx(s.br,{}),`
`,"The number of RPC handlers actively servicing requests"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.numCallsInGeneralQueue"}),e.jsx(s.br,{}),`
`,"The number of currently enqueued user requests"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.numCallsInReplicationQueue"}),e.jsx(s.br,{}),`
`,"The number of currently enqueued operations received from replication"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.numCallsInPriorityQueue"}),e.jsx(s.br,{}),`
`,"The number of currently enqueued priority (internal housekeeping) requests"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.flushQueueLength"}),e.jsx(s.br,{}),`
`,"Current depth of the memstore flush queue. If increasing, we are falling behind with clearing memstores out to HDFS."]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.updatesBlockedTime"}),e.jsx(s.br,{}),`
`,"Number of milliseconds updates have been blocked so the memstore can be flushed"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.compactionQueueLength"}),e.jsx(s.br,{}),`
`,"Current depth of the compaction request queue. If increasing, we are falling behind with storefile compaction."]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.blockCacheHitCount"}),e.jsx(s.br,{}),`
`,"The number of block cache hits"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.blockCacheMissCount"}),e.jsx(s.br,{}),`
`,"The number of block cache misses"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.blockCacheExpressHitPercent"}),e.jsx(s.br,{}),`
`,"The percent of the time that requests with the cache turned on hit the cache"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.percentFilesLocal"}),e.jsx(s.br,{}),`
`,"Percent of store file data that can be read from the local DataNode, 0-100"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.<op>_<measure>"}),e.jsx(s.br,{}),`
`,"Operation latencies, where <op> is one of Append, Delete, Mutate, Get, Replay, Increment; and where <measure> is one of min, max, mean, median, 75th_percentile, 95th_percentile, 99th_percentile"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.slow<op>Count"}),e.jsx(s.br,{}),`
`,"The number of operations we thought were slow, where <op> is one of the list above"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.GcTimeMillis"}),e.jsx(s.br,{}),`
`,"Time spent in garbage collection, in milliseconds"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.GcTimeMillisParNew"}),e.jsx(s.br,{}),`
`,"Time spent in garbage collection of the young generation, in milliseconds"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.GcTimeMillisConcurrentMarkSweep"}),e.jsx(s.br,{}),`
`,"Time spent in garbage collection of the old generation, in milliseconds"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.authenticationSuccesses"}),e.jsx(s.br,{}),`
`,"Number of client connections where authentication succeeded"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.authenticationFailures"}),e.jsx(s.br,{}),`
`,"Number of client connection authentication failures"]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"hbase.regionserver.mutationsWithoutWALCount"}),e.jsx(s.br,{}),`
`,"Count of writes submitted with a flag indicating they should bypass the write ahead log"]}),`
`,e.jsx(s.h3,{id:"meta-table-load-metrics",children:"Meta Table Load Metrics"}),`
`,e.jsx(s.p,{children:"HBase meta table metrics collection feature is available in HBase 1.4+ but it is disabled by default, as it can affect the performance of the cluster. When it is enabled, it helps to monitor client access patterns by collecting the following statistics:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["number of get, put and delete operations on the ",e.jsx(s.code,{children:"hbase:meta"})," table"]}),`
`,e.jsx(s.li,{children:"number of get, put and delete operations made by the top-N clients"}),`
`,e.jsx(s.li,{children:"number of operations related to each table"}),`
`,e.jsxs(s.li,{children:["number of operations related to the top-N regions",e.jsx(s.br,{}),`
`,e.jsx(s.strong,{children:"When to use the feature"}),e.jsx(s.br,{}),`
`,"This feature can help to identify hot spots in the meta table by showing the regions or tables where the meta info is modified (e.g. by create, drop, split or move tables) or retrieved most frequently. It can also help to find misbehaving client applications by showing which clients are using the meta table most heavily, which can for example suggest the lack of meta table buffering or the lack of re-using open client connections in the client application."]}),`
`]}),`
`,e.jsx(t,{type:"warn",title:"Possible side-effects of enabling this feature",children:e.jsxs(s.p,{children:[`Having large number of clients and regions in the cluster can cause the registration and tracking
of a large amount of metrics, which can increase the memory and CPU footprint of the HBase region
server handling the `,e.jsx(s.code,{children:"hbase:meta"}),` table. It can also cause the significant increase of the JMX dump
size, which can affect the monitoring or log aggregation system you use beside HBase. It is
recommended to turn on this feature only during debugging.`]})}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Where to find the metrics in JMX"}),e.jsx(s.br,{}),`
`,"Each metric attribute name will start with the ‘MetaTable_' prefix. For all the metrics you will see five different JMX attributes: count, mean rate, 1 minute rate, 5 minute rate and 15 minute rate. You will find these metrics in JMX under the following MBean: ",e.jsx(s.code,{children:"Hadoop → HBase → RegionServer → Coprocessor.Region.CP_org.apache.hadoop.hbase.coprocessor.MetaTableMetrics"}),"."]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Examples: some Meta Table metrics you can see in your JMX dump"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "MetaTable_get_request_count"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"77309"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "MetaTable_put_request_mean_rate"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0.06339092997186495"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "MetaTable_table_MyTestTable_request_15min_rate"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1.1020599841623246"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "MetaTable_client_/172.30.65.42_lossy_request_count"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1786"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "MetaTable_client_/172.30.65.45_put_request_5min_rate"'}),e.jsx(s.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.6189810954855728"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "MetaTable_region_1561131112259.c66e4308d492936179352c80432ccfe0._lossy_request_count"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"38342"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "MetaTable_region_1561131043640.5bdffe4b9e7e334172065c853cf0caa6._lossy_request_1min_rate"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0.04925099917433935"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Configuration"}),e.jsx(s.br,{}),`
`,"To turn on this feature, you have to enable a custom coprocessor by adding the following section to hbase-site.xml. This coprocessor will run on all the HBase RegionServers, but will be active (i.e. consume memory / CPU) only on the server, where the ",e.jsx(s.code,{children:"hbase:meta"})," table is located. It will produce JMX metrics which can be downloaded from the web UI of the given RegionServer or by a simple REST call. These metrics will not be present in the JMX dump of the other RegionServers."]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Enabling the Meta Table Metrics feature"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.coprocessor.region.classes</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.coprocessor.MetaTableMetrics</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsxs(t,{type:"info",title:"How the top-N metrics are calculated?",children:[e.jsxs(s.p,{children:["The 'top-N' type of metrics will be counted using the Lossy Counting Algorithm (as defined in ",e.jsx(s.a,{href:"http://www.vldb.org/conf/2002/S10P03.pdf",children:'Motwani, R; Manku, G.S (2002). "Approximate frequency counts over data streams"'}),"), which is designed to identify elements in a data stream whose frequency count exceed a user-given threshold. The frequency computed by this algorithm is not always accurate but has an error threshold that can be specified by the user as a configuration parameter. The run time space required by the algorithm is inversely proportional to the specified error threshold, hence larger the error parameter, the smaller the footprint and the less accurate are the metrics."]}),e.jsxs(s.p,{children:["You can specify the error rate of the algorithm as a floating-point value between 0 and 1 (exclusive), it's default value is 0.02. Having the error rate set to ",e.jsx(s.code,{children:"E"})," and having ",e.jsx(s.code,{children:"N"})," as the total number of meta table operations, then (assuming the uniform distribution of the activity of low frequency elements) at most ",e.jsx(s.code,{children:"7 / E"})," meters will be kept and each kept element will have a frequency higher than ",e.jsx(s.code,{children:"E * N"}),"."]}),e.jsx(s.p,{children:"An example: Let's assume we are interested in the HBase clients that are most active in accessing the meta table. When there was 1,000,000 operations on the meta table so far and the error rate parameter is set to 0.02, then we can assume that only at most 350 client IP address related counters will be present in JMX and each of these clients accessed the meta table at least 20,000 times."}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.util.default.lossycounting.errorrate</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">0.02</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})})]}),`
`,e.jsx(s.h2,{id:"hbase-monitoring",children:"HBase Monitoring"}),`
`,e.jsx(s.h3,{id:"hbase-monitoring-overview",children:"Overview"}),`
`,e.jsxs(s.p,{children:['The following metrics are arguably the most important to monitor for each RegionServer for "macro monitoring", preferably with a system like ',e.jsx(s.a,{href:"http://opentsdb.net/",children:"OpenTSDB"}),". If your cluster is having performance issues it's likely that you'll see something unusual with this group."]}),`
`,e.jsx(s.h4,{id:"hbase-toc",children:"HBase"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["See ",e.jsx(s.a,{href:"/docs/operational-management/metrics-and-monitoring#most-important-regionserver-metrics",children:"rs metrics"})]}),`
`]}),`
`,e.jsx(s.h4,{id:"os-toc",children:"OS"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"IO Wait"}),`
`,e.jsx(s.li,{children:"User CPU"}),`
`]}),`
`,e.jsx(s.h4,{id:"java-toc",children:"Java"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"GC"}),`
`]}),`
`,e.jsx(s.h3,{id:"slow-query-log",children:"Slow Query Log"}),`
`,e.jsxs(s.p,{children:['The HBase slow query log consists of parseable JSON structures describing the properties of those client operations (Gets, Puts, Deletes, etc.) that either took too long to run, or produced too much output. The thresholds for "too long to run" and "too much output" are configurable, as described below. The output is produced inline in the main region server logs so that it is easy to discover further details from context with other logged events. It is also prepended with identifying tags ',e.jsx(s.code,{children:"(responseTooSlow)"}),", ",e.jsx(s.code,{children:"(responseTooLarge)"}),", ",e.jsx(s.code,{children:"(operationTooSlow)"}),", and ",e.jsx(s.code,{children:"(operationTooLarge)"})," in order to enable easy filtering with grep, in case the user desires to see only slow queries."]}),`
`,e.jsx(s.h4,{id:"operational-management-metrics-and-monitoring-overview-configuration",children:"Configuration"}),`
`,e.jsx(s.p,{children:"There are four configuration knobs that can be used to adjust the thresholds for when queries are logged. Two of these knobs control the size and time thresholds for all queries. Because Scans can often be larger and slower than other types of queries, there are two additional knobs which can control size and time thresholds for Scans specifically."}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"hbase.ipc.warn.response.time"})," Maximum number of milliseconds that a query can be run without being logged. Defaults to 10000, or 10 seconds. Can be set to -1 to disable logging by time."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"hbase.ipc.warn.response.size"})," Maximum byte size of response that a query can return without being logged. Defaults to 100 megabytes. Can be set to -1 to disable logging by size."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"hbase.ipc.warn.response.time.scan"})," Maximum number of milliseconds that a Scan can be run without being logged. Defaults to the ",e.jsx(s.code,{children:"hbase.ipc.warn.response.time"})," value. Can be set to -1 to disable logging by time."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"hbase.ipc.warn.response.size.scan"})," Maximum byte size of response that a Scan can return without being logged. Defaults to the ",e.jsx(s.code,{children:"hbase.ipc.warn.response.size"})," value. Can be set to -1 to disable logging by size."]}),`
`]}),`
`,e.jsx(s.h4,{id:"operational-management-hbase-monitoring-slow-query-log-metrics",children:"Metrics"}),`
`,e.jsx(s.p,{children:"The slow query log exposes to metrics to JMX."}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"hadoop.regionserver_rpc_slowResponse"})," a global metric reflecting the durations of all responses that triggered logging."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"hadoop.regionserver_rpc_methodName.aboveOneSec"})," A metric reflecting the durations of all responses that lasted for more than one second."]}),`
`]}),`
`,e.jsx(s.h4,{id:"output",children:"Output"}),`
`,e.jsxs(s.p,{children:["The output is tagged with operation e.g. ",e.jsx(s.code,{children:"(operationTooSlow)"})," if the call was a client operation, such as a Put, Get, or Delete, which we expose detailed fingerprint information for. If not, it is tagged ",e.jsx(s.code,{children:"(responseTooSlow)"})," and still produces parseable JSON output, but with less verbose information solely regarding its duration and size in the RPC itself. ",e.jsx(s.code,{children:"TooLarge"})," is substituted for ",e.jsx(s.code,{children:"TooSlow"})," if the response size triggered the logging, with ",e.jsx(s.code,{children:"TooLarge"})," appearing even in the case that both size and duration triggered logging."]}),`
`,e.jsx(s.h4,{id:"operational-management-hbase-monitoring-slow-query-log-example",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'2011-09-08 10:01:25,824 WARN org.apache.hadoop.ipc.HBaseServer: (operationTooSlow): {"tables":{"riley2":{"puts":[{"totalColumns":11,"families":{"actions":[{"timestamp":1315501284459,"qualifier":"0","vlen":9667580},{"timestamp":1315501284459,"qualifier":"1","vlen":10122412},{"timestamp":1315501284459,"qualifier":"2","vlen":11104617},{"timestamp":1315501284459,"qualifier":"3","vlen":13430635}]},"row":"cfcd208495d565ef66e7dff9f98764da:0"}],"families":["actions"]}},"processingtimems":956,"client":"10.47.34.63:33623","starttimems":1315501284456,"queuetimems":0,"totalPuts":1,"class":"HRegionServer","responsesize":0,"method":"multiPut"}'})})})})}),`
`,e.jsx(s.p,{children:`Note that everything inside the "tables" structure is output produced by MultiPut's fingerprint, while the rest of the information is RPC-specific, such as processing time and client IP/port. Other client operations follow the same pattern and the same general structure, with necessary differences due to the nature of the individual operations. In the case that the call is not a client operation, that detailed fingerprint information will be completely absent.`}),`
`,e.jsx(s.p,{children:'This particular example, for example, would indicate that the likely cause of slowness is simply a very large (on the order of 100MB) multiput, as we can tell by the "vlen," or value length, fields of each put in the multiPut.'}),`
`,e.jsx(s.h4,{id:"get-slow-response-log-from-shell",children:"Get Slow Response Log from shell"}),`
`,e.jsx(s.p,{children:"When an individual RPC exceeds a configurable time bound we log a complaint by way of the logging subsystem"}),`
`,e.jsx(s.p,{children:"e.g."}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"2019-10-02 10:10:22,195 WARN [,queue=15,port=60020] ipc.RpcServer - (responseTooSlow):"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'{"call":"Scan(org.apache.hadoop.hbase.protobuf.generated.ClientProtos$ScanRequest)",'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'"starttimems":1567203007549,'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'"responsesize":6819737,'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'"method":"Scan",'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'"param":"region { type: REGION_NAME value: \\"t1,\\\\000\\\\000\\\\215\\\\f)o\\\\\\\\\\\\024\\\\302\\\\220\\\\000\\\\000\\\\000\\\\000\\\\000\\\\001\\\\000\\\\000\\\\000\\\\000\\\\000\\\\006\\\\000\\\\000\\\\000\\\\000\\\\000\\\\005\\\\000\\\\000<TRUNCATED>",'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'"processingtimems":28646,'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'"client":"10.253.196.215:41116",'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'"queuetimems":22453,'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'"class":"HRegionServer"}'})})]})})}),`
`,e.jsx(s.p,{children:"Unfortunately often the request parameters are truncated as per above Example. The truncation is unfortunate because it eliminates much of the utility of the warnings. For example, the region name, the start and end keys, and the filter hierarchy are all important clues for debugging performance problems caused by moderate to low selectivity queries or queries made at a high rate."}),`
`,e.jsx(s.p,{children:"HBASE-22978 introduces maintaining an in-memory ring buffer of requests that were judged to be too slow in addition to the responseTooSlow logging. The in-memory representation can be complete. There is some chance a high rate of requests will cause information on other interesting requests to be overwritten before it can be read. This is an acceptable trade off."}),`
`,e.jsx(s.p,{children:"In order to enable the in-memory ring buffer at RegionServers, we need to enable config:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"hbase.regionserver.slowlog.buffer.enabled"})})})})}),`
`,e.jsx(s.p,{children:"One more config determines the size of the ring buffer:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"hbase.regionserver.slowlog.ringbuffer.size"})})})})}),`
`,e.jsx(s.p,{children:"Check the config section for the detailed description."}),`
`,e.jsx(s.p,{children:"This config would be disabled by default. Turn it on and these shell commands would provide expected results from the ring-buffers."}),`
`,e.jsx(s.p,{children:"shell commands to retrieve slowlog responses from RegionServers:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Retrieve latest SlowLog Responses maintained by each or specific RegionServers."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Specify '*' to include all RS otherwise array of server names for specific"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"RS. A server name is the host, port plus startcode of a RegionServer."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"e.g.: host187.example.com,60020,1289493121758 (find servername in"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"master ui or when you do detailed status in shell)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Provide optional filter parameters as Hash."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Default Limit of each server for providing no of slow log records is 10. User can specify"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"more limit by 'LIMIT' param in case more than 10 records should be retrieved."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Examples:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  hbase> get_slowlog_responses '*'                                 => get slowlog responses from all RS"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  hbase> get_slowlog_responses '*', {'LIMIT' => 50}                => get slowlog responses from all RS"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                                      with 50 records limit (default limit: 10)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  hbase> get_slowlog_responses ['SERVER_NAME1', 'SERVER_NAME2']    => get slowlog responses from SERVER_NAME1,"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                                      SERVER_NAME2"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  hbase> get_slowlog_responses '*', {'REGION_NAME' => 'hbase:meta,,1'}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                                   => get slowlog responses only related to meta"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                                      region"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  hbase> get_slowlog_responses '*', {'TABLE_NAME' => 't1'}         => get slowlog responses only related to t1 table"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  hbase> get_slowlog_responses '*', {'CLIENT_IP' => '192.162.1.40:60225', 'LIMIT' => 100}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                                   => get slowlog responses with given client"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                                      IP address and get 100 records limit"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                                      (default limit: 10)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  hbase> get_slowlog_responses '*', {'REGION_NAME' => 'hbase:meta,,1', 'TABLE_NAME' => 't1'}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                                   => get slowlog responses with given region name"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                                      or table name"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  hbase> get_slowlog_responses '*', {'USER' => 'user_name', 'CLIENT_IP' => '192.162.1.40:60225'}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                                   => get slowlog responses that match either"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                                      provided client IP address or user name"})})]})})}),`
`,e.jsx(s.p,{children:"All of above queries with filters have default OR operation applied i.e. all records with any of the provided filters applied will be returned. However, we can also apply AND operator i.e. all records that match all (not any) of the provided filters should be returned."}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_slowlog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'REGION_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'hbase:meta,,1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'TABLE_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'FILTER_BY_OP'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'AND'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                   => get slowlog responses with given region name"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                                                                      and"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table name, both should match"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_slowlog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'REGION_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'hbase:meta,,1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'TABLE_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'FILTER_BY_OP'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'OR'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                   => get slowlog responses with given region name"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                                                                      or"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table name, any one can match"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_slowlog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'TABLE_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'CLIENT_IP'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'192.163.41.53:52781'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'FILTER_BY_OP'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'AND'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                   => get slowlog responses with given region name"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                                                                      and"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" client "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"IP"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" address, both should match"})]})]})})}),`
`,e.jsx(s.p,{children:"Since OR is the default filter operator, without providing 'FILTER_BY_OP', query will have same result as providing 'FILTER_BY_OP' ⇒ 'OR'."}),`
`,e.jsx(s.p,{children:"Sometimes output can be long pretty printed json for user to scroll in a single screen and hence user might prefer redirecting output of get_slowlog_responses to a file."}),`
`,e.jsx(s.p,{children:"Example:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:` "get_slowlog_responses '*'"`}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" shell"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" >"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" xyz.out"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" 2>&1"})]})})})}),`
`,e.jsx(s.p,{children:"Similar to slow RPC logs, client can also retrieve large RPC logs. Sometimes, slow logs important to debug perf issues turn out to be larger in size."}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_largelog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                 => get largelog responses from all "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"RS"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_largelog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'LIMIT'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"50"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}                => get largelog responses from all "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"RS"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                       with "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"50"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" records limit (default "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"limit:"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 10"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_largelog_responses ["}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'SERVER_NAME1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'SERVER_NAME2'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]    => get largelog responses from "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"SERVER_NAME1"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"                                                                       SERVER_NAME2"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_largelog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'REGION_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'hbase:meta,,1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                    => get largelog responses only related to meta"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                       region"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_largelog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'TABLE_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}         => get largelog responses only related to t1 table"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_largelog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'CLIENT_IP'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'192.162.1.40:60225'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'LIMIT'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"100"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                    => get largelog responses with given client"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"                                                                       IP"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" address "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"and"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"100"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" records limit"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                       (default "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"limit:"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 10"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_largelog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'REGION_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'hbase:meta,,1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'TABLE_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                    => get largelog responses with given region name"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                                                                       or"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table name"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_largelog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'USER'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'user_name'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'CLIENT_IP'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'192.162.1.40:60225'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                    => get largelog responses that match either"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                       provided client "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"IP"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" address "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"or"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" user name"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_largelog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'REGION_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'hbase:meta,,1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'TABLE_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'FILTER_BY_OP'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'AND'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                   => get largelog responses with given region name"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                                                                      and"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table name, both should match"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_largelog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'REGION_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'hbase:meta,,1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'TABLE_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'FILTER_BY_OP'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'OR'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                   => get largelog responses with given region name"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                                                                      or"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table name, any one can match"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get_largelog_responses "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'*'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'TABLE_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t1'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'CLIENT_IP'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'192.163.41.53:52781'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'FILTER_BY_OP'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'AND'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                                                                   => get largelog responses with given region name"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                                                                      and"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" client "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"IP"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" address, both should match"})]})]})})}),`
`,e.jsx(s.p,{children:"shell command to clear slow/largelog responses from RegionServer:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Clears SlowLog Responses maintained by each or specific RegionServers."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Specify array of server names for specific RS. A server name is"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"the host, port plus startcode of a RegionServer."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"e.g.: host187.example.com,60020,1289493121758 (find servername in"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"master ui or when you do detailed status in shell)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Examples:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  hbase> clear_slowlog_responses                                     => clears slowlog responses from all RS"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  hbase> clear_slowlog_responses ['SERVER_NAME1', 'SERVER_NAME2']    => clears slowlog responses from SERVER_NAME1,"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                                        SERVER_NAME2"})})]})})}),`
`,e.jsx(s.h4,{id:"get-slowlarge-response-logs-from-system-table-hbaseslowlog",children:"Get Slow/Large Response Logs from System table hbase:slowlog"}),`
`,e.jsx(s.p,{children:"The above section provides details about Admin APIs:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"get_slowlog_responses"}),`
`,e.jsx(s.li,{children:"get_largelog_responses"}),`
`,e.jsx(s.li,{children:"clear_slowlog_responses"}),`
`]}),`
`,e.jsx(s.p,{children:"All of the above APIs access online in-memory ring buffers from individual RegionServers and accumulate logs from ring buffers to display to end user. However, since the logs are stored in memory, after RegionServer is restarted, all the objects held in memory of that RegionServer will be cleaned up and previous logs are lost. What if we want to persist all these logs forever? What if we want to store them in such a manner that operator can get all historical records with some filters? e.g get me all large/slow RPC logs that are triggered by user1 and are related to region: cluster_test,cccccccc,1589635796466.aa45e1571d533f5ed0bb31cdccaaf9cf. ?"}),`
`,e.jsx(s.p,{children:"If we have a system table that stores such logs in increasing (not so strictly though) order of time, it can definitely help operators debug some historical events (scan, get, put, compaction, flush etc) with detailed inputs."}),`
`,e.jsxs(s.p,{children:["Config which enabled system table to be created and store all log events is ",e.jsx(s.code,{children:"hbase.regionserver.slowlog.systable.enabled"}),"."]}),`
`,e.jsxs(s.p,{children:["The default value for this config is ",e.jsx(s.code,{children:"false"}),". If provided ",e.jsx(s.code,{children:"true"})," (Note: ",e.jsx(s.code,{children:"hbase.regionserver.slowlog.buffer.enabled"})," should also be ",e.jsx(s.code,{children:"true"}),"), a cron job running in every RegionServer will persist the slow/large logs into table hbase:slowlog. By default cron job runs every 10 min. Duration can be configured with key: ",e.jsx(s.code,{children:"hbase.slowlog.systable.chore.duration"}),". By default, RegionServer will store upto 1000(config key: ",e.jsx(s.code,{children:"hbase.regionserver.slowlog.systable.queue.size"}),") slow/large logs in an internal queue and the chore will retrieve these logs from the queue and perform batch insertion in hbase:slowlog."]}),`
`,e.jsxs(s.p,{children:["hbase:slowlog has single ColumnFamily: ",e.jsx(s.code,{children:"info"})," ",e.jsx(s.code,{children:"info"})," contains multiple qualifiers which are the same attributes present as part of ",e.jsx(s.code,{children:"get_slowlog_responses"})," API response."]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"info:call_details"}),`
`,e.jsx(s.li,{children:"info:client_address"}),`
`,e.jsx(s.li,{children:"info:method_name"}),`
`,e.jsx(s.li,{children:"info:param"}),`
`,e.jsx(s.li,{children:"info:processing_time"}),`
`,e.jsx(s.li,{children:"info:queue_time"}),`
`,e.jsx(s.li,{children:"info:region_name"}),`
`,e.jsx(s.li,{children:"info:response_size"}),`
`,e.jsx(s.li,{children:"info:server_class"}),`
`,e.jsx(s.li,{children:"info:start_time"}),`
`,e.jsx(s.li,{children:"info:type"}),`
`,e.jsx(s.li,{children:"info:username"}),`
`]}),`
`,e.jsx(s.p,{children:"And example of 2 rows from hbase:slowlog scan result:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:call_details, timestamp=2020-05-16T14:58:14.211Z, value=Scan(org.apache.hadoop.hbase.shaded.protobuf.generated.ClientProtos$ScanRequest)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:client_address, timestamp=2020-05-16T14:58:14.211Z, value=172.20.10.2:57347"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:method_name, timestamp=2020-05-16T14:58:14.211Z, value=Scan"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:' \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:param, timestamp=2020-05-16T14:58:14.211Z, value=region { type: REGION_NAME value: "hbase:meta,,1" } scan { column { family: "info" } attribute { name: "_isolationle'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                                                             vel_" value: "\\x5C000" } start_row: "cluster_test,33333333,99999999999999" stop_row: "cluster_test,," time_range { from: 0 to: 9223372036854775807 } max_versions: 1 cache_blocks'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                             : true max_result_size: 2097152 reversed: true caching: 10 include_stop_row: true readType: PREAD } number_of_rows: 10 close_scanner: false client_handles_partials: true client_"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                             handles_heartbeats: true track_scan_metrics: false"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:processing_time, timestamp=2020-05-16T14:58:14.211Z, value=18"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:queue_time, timestamp=2020-05-16T14:58:14.211Z, value=0"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:region_name, timestamp=2020-05-16T14:58:14.211Z, value=hbase:meta,,1"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:response_size, timestamp=2020-05-16T14:58:14.211Z, value=1575"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:server_class, timestamp=2020-05-16T14:58:14.211Z, value=HRegionServer"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:start_time, timestamp=2020-05-16T14:58:14.211Z, value=1589640743732"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:type, timestamp=2020-05-16T14:58:14.211Z, value=ALL"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x03\\xE9\\x04\\xF5@                                  column=info:username, timestamp=2020-05-16T14:58:14.211Z, value=user2"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:call_details, timestamp=2020-05-16T14:59:58.764Z, value=Scan(org.apache.hadoop.hbase.shaded.protobuf.generated.ClientProtos$ScanRequest)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:client_address, timestamp=2020-05-16T14:59:58.764Z, value=172.20.10.2:57348"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:method_name, timestamp=2020-05-16T14:59:58.764Z, value=Scan"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:' \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:param, timestamp=2020-05-16T14:59:58.764Z, value=region { type: REGION_NAME value: "cluster_test,cccccccc,1589635796466.aa45e1571d533f5ed0bb31cdccaaf9cf." } scan { a'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                                                             ttribute { name: "_isolationlevel_" value: "\\x5C000" } start_row: "cccccccc" time_range { from: 0 to: 9223372036854775807 } max_versions: 1 cache_blocks: true max_result_size: 2'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                             097152 caching: 2147483647 include_stop_row: false } number_of_rows: 2147483647 close_scanner: false client_handles_partials: true client_handles_heartbeats: true track_scan_met"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                                                             rics: false"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:processing_time, timestamp=2020-05-16T14:59:58.764Z, value=24"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:queue_time, timestamp=2020-05-16T14:59:58.764Z, value=0"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:region_name, timestamp=2020-05-16T14:59:58.764Z, value=cluster_test,cccccccc,1589635796466.aa45e1571d533f5ed0bb31cdccaaf9cf."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:response_size, timestamp=2020-05-16T14:59:58.764Z, value=211227"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:server_class, timestamp=2020-05-16T14:59:58.764Z, value=HRegionServer"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:start_time, timestamp=2020-05-16T14:59:58.764Z, value=1589640743932"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:type, timestamp=2020-05-16T14:59:58.764Z, value=ALL"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:" \\x024\\xC1\\x06X\\x81\\xF6\\xEC                                  column=info:username, timestamp=2020-05-16T14:59:58.764Z, value=user1"})})]})})}),`
`,e.jsx(s.p,{children:"Operator can use ColumnValueFilter to filter records based on region_name, username, client_address etc."}),`
`,e.jsx(s.p,{children:"Time range based queries will also be very useful. Example:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"scan"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'hbase:slowlog',"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TIMERANGE"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [1589621394000, "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"1589637999999]"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" }"})]})})})}),`
`,e.jsx(s.h3,{id:"block-cache-monitoring",children:"Block Cache Monitoring"}),`
`,e.jsx(s.p,{children:"Starting with HBase 0.98, the HBase Web UI includes the ability to monitor and report on the performance of the block cache. To view the block cache reports, see the Block Cache section of the region server UI. Following are a few examples of the reporting capabilities."}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:e.jsx(s.em,{children:"Basic Info shows the cache implementation."})}),`
`,e.jsx(s.img,{alt:"bc basic",src:l})]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:e.jsx(s.em,{children:"Config shows all cache configuration options."})}),`
`,e.jsx(s.img,{alt:"bc config",src:h})]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:e.jsx(s.em,{children:"Stats shows statistics about the performance of the cache."})}),`
`,e.jsx(s.img,{alt:"bc stats",src:c})]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:e.jsx(s.em,{children:"L1 and L2 show information about the L1 and L2 caches."})}),`
`,e.jsx(s.img,{alt:"bc l1",src:d})]}),`
`,e.jsx(s.p,{children:"This is not an exhaustive list of all the screens and reports available. Have a look in the Web UI."}),`
`,e.jsx(s.h3,{id:"snapshot-space-usage-monitoring",children:"Snapshot Space Usage Monitoring"}),`
`,e.jsx(s.p,{children:"Starting with HBase 0.95, Snapshot usage information on individual snapshots was shown in the HBase Master Web UI. This was further enhanced starting with HBase 1.3 to show the total Storefile size of the Snapshot Set. The following metrics are shown in the Master Web UI with HBase 1.3 and later."}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Shared Storefile Size is the Storefile size shared between snapshots and active tables."}),`
`,e.jsx(s.li,{children:"Mob Storefile Size is the Mob Storefile size shared between snapshots and active tables."}),`
`,e.jsx(s.li,{children:"Archived Storefile Size is the Storefile size in Archive."}),`
`]}),`
`,e.jsx(s.p,{children:"The format of Archived Storefile Size is NNN(MMM). NNN is the total Storefile size in Archive, MMM is the total Storefile size in Archive that is specific to the snapshot (not shared with other snapshots and tables)."}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:e.jsx(s.em,{children:"Master Snapshot Overview"})}),`
`,e.jsx(s.img,{alt:"master-snapshot",src:g})]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:e.jsx(s.em,{children:"Snapshot Storefile Stats Example 1"})}),`
`,e.jsx(s.img,{alt:"1 snapshot",src:m})]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:e.jsx(s.em,{children:"Snapshot Storefile Stats Example 2"})}),`
`,e.jsx(s.img,{alt:"2 snapshot",src:p})]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:e.jsx(s.em,{children:"Empty Snapshot Storfile Stats Example"})}),`
`,e.jsx(s.img,{alt:"empty snapshots",src:u})]}),`
`,e.jsxs(s.section,{"data-footnotes":!0,className:"footnotes",children:[e.jsx(s.h2,{className:"sr-only",id:"footnote-label",children:"Footnotes"}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{id:"user-content-fn-5",children:[`
`,e.jsxs(s.p,{children:["The Metrics system was redone in HBase 0.96. See Migration to the New Metrics Hotness – Metrics2 by Elliot Clark for detail. ",e.jsx(s.a,{href:"#user-content-fnref-5","data-footnote-backref":"","aria-label":"Back to reference 1",className:"data-footnote-backref",children:"↩"})]}),`
`]}),`
`]}),`
`]})]})}function v(n={}){const{wrapper:s}=n.components||{};return s?e.jsx(s,{...n,children:e.jsx(o,{...n})}):o(n)}function a(n,s){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{b as _markdown,v as default,E as extractedReferences,k as frontmatter,j as structuredData,y as toc};
