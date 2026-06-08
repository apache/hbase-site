import{j as e}from"./chunk-QUQL4437-Bywy9pC_.js";let n=`## *hbase-site.xml* and *hbase-default.xml*

Just as in Hadoop where you add site-specific HDFS configuration to the *hdfs-site.xml* file, for HBase, site specific customizations go into the file *conf/hbase-site.xml*. For the list of configurable properties, see [hbase default configurations](/docs/configuration/default#configuration-default-hbase-default-configuration) below or view the raw *hbase-default.xml* source file in the HBase source code at *src/main/resources*.

Not all configuration options make it out to *hbase-default.xml*. Some configurations would only appear in source code; the only way to identify these changes are through code review.

Currently, changes here will require a cluster restart for HBase to notice the change.

## HBase Default configuration

The documentation below is generated using the default hbase configuration file, *hbase-default.xml*, as source.

#### \`hbase.tmp.dir\` \\[!toc]

**Description:** Temporary directory on the local filesystem. Change this setting to point to a location more permanent than '/tmp', the usual resolve for java.io.tmpdir, as the '/tmp' directory is cleared on machine restart.\\
**Default:** \`\${java.io.tmpdir}/hbase-\${user.name}\`

#### \`hbase.rootdir\` \\[!toc]

**Description:** The directory shared by region servers and into which HBase persists. The URL should be 'fully-qualified' to include the filesystem scheme. For example, to specify the HDFS directory '/hbase' where the HDFS instance's namenode is running at namenode.example.org on port 9000, set this value to: hdfs\\://namenode.example.org:9000/hbase. By default, we write to whatever $\\{hbase.tmp.dir} is set too -- usually /tmp -- so change this configuration or else all data will be lost on machine restart.\\
**Default:** \`\${hbase.tmp.dir}/hbase\`

#### \`hbase.cluster.distributed\` \\[!toc]

**Description:** The mode the cluster will be in. Possible values are false for standalone mode and true for distributed mode. If false, startup will run all HBase and ZooKeeper daemons together in the one JVM.\\
**Default:** \`false\`

#### \`hbase.zookeeper.quorum\` \\[!toc]

**Description:** Comma separated list of servers in the ZooKeeper ensemble (This config. should have been named hbase.zookeeper.ensemble). For example, "host1.mydomain.com,host2.mydomain.com,host3.mydomain.com". By default this is set to localhost for local and pseudo-distributed modes of operation. For a fully-distributed setup, this should be set to a full list of ZooKeeper ensemble servers. If HBASE\\_MANAGES\\_ZK is set in hbase-env.sh this is the list of servers which hbase will start/stop ZooKeeper on as part of cluster start/stop. Client-side, we will take this list of ensemble members and put it together with the hbase.zookeeper.property.clientPort config. and pass it into zookeeper constructor as the connectString parameter.\\
**Default:** \`127.0.0.1\`

#### \`zookeeper.recovery.retry.maxsleeptime\` \\[!toc]

**Description:** Max sleep time before retry zookeeper operations in milliseconds, a max time is needed here so that sleep time won't grow unboundedly\\
**Default:** \`60000\`

#### \`hbase.local.dir\` \\[!toc]

**Description:** Directory on the local filesystem to be used as a local storage.\\
**Default:** \`\${hbase.tmp.dir}/local/\`

#### \`hbase.master.port\` \\[!toc]

**Description:** The port the HBase Master should bind to.\\
**Default:** \`16000\`

#### \`hbase.master.info.port\` \\[!toc]

**Description:** The port for the HBase Master web UI. Set to -1 if you do not want a UI instance run.\\
**Default:** \`16010\`

#### \`hbase.master.info.bindAddress\` \\[!toc]

**Description:** The bind address for the HBase Master web UI\\
**Default:** \`0.0.0.0\`

#### \`hbase.master.logcleaner.plugins\` \\[!toc]

**Description:** A comma-separated list of BaseLogCleanerDelegate invoked by the LogsCleaner service. These WAL cleaners are called in order, so put the cleaner that prunes the most files in front. To implement your own BaseLogCleanerDelegate, just put it in HBase's classpath and add the fully qualified class name here. Always add the above default log cleaners in the list.\\
**Default:** \`org.apache.hadoop.hbase.master.cleaner.TimeToLiveLogCleaner,org.apache.hadoop.hbase.master.cleaner.TimeToLiveProcedureWALCleaner,org.apache.hadoop.hbase.master.cleaner.TimeToLiveMasterLocalStoreWALCleaner\`

#### \`hbase.master.logcleaner.ttl\` \\[!toc]

**Description:** How long a WAL remain in the archive (\\{hbase.rootdir}/oldWALs) directory, after which it will be cleaned by a Master thread. The value is in milliseconds.\\
**Default:** \`600000\`

#### \`hbase.master.hfilecleaner.plugins\` \\[!toc]

**Description:** A comma-separated list of BaseHFileCleanerDelegate invoked by the HFileCleaner service. These HFiles cleaners are called in order, so put the cleaner that prunes the most files in front. To implement your own BaseHFileCleanerDelegate, just put it in HBase's classpath and add the fully qualified class name here. Always add the above default hfile cleaners in the list as they will be overwritten in hbase-site.xml.\\
**Default:** \`org.apache.hadoop.hbase.master.cleaner.TimeToLiveHFileCleaner,org.apache.hadoop.hbase.master.cleaner.TimeToLiveMasterLocalStoreHFileCleaner\`

#### \`hbase.master.infoserver.redirect\` \\[!toc]

**Description:** Whether or not the Master listens to the Master web UI port (hbase.master.info.port) and redirects requests to the web UI server shared by the Master and RegionServer. Config. makes sense when Master is serving Regions (not the default).\\
**Default:** \`true\`

#### \`hbase.master.fileSplitTimeout\` \\[!toc]

**Description:** Splitting a region, how long to wait on the file-splitting step before aborting the attempt. Default: 600000. This setting used to be known as hbase.regionserver.fileSplitTimeout in hbase-1.x. Split is now run master-side hence the rename (If a 'hbase.master.fileSplitTimeout' setting found, will use it to prime the current 'hbase.master.fileSplitTimeout' Configuration.\\
**Default:** \`600000\`

#### \`hbase.regionserver.port\` \\[!toc]

**Description:** The port the HBase RegionServer binds to.\\
**Default:** \`16020\`

#### \`hbase.regionserver.info.port\` \\[!toc]

**Description:** The port for the HBase RegionServer web UI Set to -1 if you do not want the RegionServer UI to run.\\
**Default:** \`16030\`

#### \`hbase.regionserver.info.bindAddress\` \\[!toc]

**Description:** The address for the HBase RegionServer web UI\\
**Default:** \`0.0.0.0\`

#### \`hbase.regionserver.info.port.auto\` \\[!toc]

**Description:** Whether or not the Master or RegionServer UI should search for a port to bind to. Enables automatic port search if hbase.regionserver.info.port is already in use. Useful for testing, turned off by default.\\
**Default:** \`false\`

#### \`hbase.regionserver.handler.count\` \\[!toc]

**Description:** Count of RPC Listener instances spun up on RegionServers. Same property is used by the Master for count of master handlers. Too many handlers can be counter-productive. Make it a multiple of CPU count. If mostly read-only, handlers count close to cpu count does well. Start with twice the CPU count and tune from there.\\
**Default:** \`30\`

#### \`hbase.ipc.server.callqueue.handler.factor\` \\[!toc]

**Description:** Factor to determine the number of call queues. A value of 0 means a single queue shared between all the handlers. A value of 1 means that each handler has its own queue.\\
**Default:** \`0.1\`

#### \`hbase.ipc.server.callqueue.read.ratio\` \\[!toc]

**Description:** Split the call queues into read and write queues. The specified interval (which should be between 0.0 and 1.0) will be multiplied by the number of call queues. A value of 0 indicate to not split the call queues, meaning that both read and write requests will be pushed to the same set of queues. A value lower than 0.5 means that there will be less read queues than write queues. A value of 0.5 means there will be the same number of read and write queues. A value greater than 0.5 means that there will be more read queues than write queues. A value of 1.0 means that all the queues except one are used to dispatch read requests. Example: Given the total number of call queues being 10 a read.ratio of 0 means that: the 10 queues will contain both read/write requests. a read.ratio of 0.3 means that: 3 queues will contain only read requests and 7 queues will contain only write requests. a read.ratio of 0.5 means that: 5 queues will contain only read requests and 5 queues will contain only write requests. a read.ratio of 0.8 means that: 8 queues will contain only read requests and 2 queues will contain only write requests. a read.ratio of 1 means that: 9 queues will contain only read requests and 1 queues will contain only write requests.\\
**Default:** \`0\`

#### \`hbase.ipc.server.callqueue.scan.ratio\` \\[!toc]

**Description:** Given the number of read call queues, calculated from the total number of call queues multiplied by the callqueue.read.ratio, the scan.ratio property will split the read call queues into small-read and long-read queues. A value lower than 0.5 means that there will be less long-read queues than short-read queues. A value of 0.5 means that there will be the same number of short-read and long-read queues. A value greater than 0.5 means that there will be more long-read queues than short-read queues A value of 0 or 1 indicate to use the same set of queues for gets and scans. Example: Given the total number of read call queues being 8 a scan.ratio of 0 or 1 means that: 8 queues will contain both long and short read requests. a scan.ratio of 0.3 means that: 2 queues will contain only long-read requests and 6 queues will contain only short-read requests. a scan.ratio of 0.5 means that: 4 queues will contain only long-read requests and 4 queues will contain only short-read requests. a scan.ratio of 0.8 means that: 6 queues will contain only long-read requests and 2 queues will contain only short-read requests.\\
**Default:** \`0\`

#### \`hbase.regionserver.msginterval\` \\[!toc]

**Description:** Interval between messages from the RegionServer to Master in milliseconds.\\
**Default:** \`3000\`

#### \`hbase.regionserver.logroll.period\` \\[!toc]

**Description:** Period at which we will roll the commit log regardless of how many edits it has.\\
**Default:** \`3600000\`

#### \`hbase.regionserver.logroll.errors.tolerated\` \\[!toc]

**Description:** The number of consecutive WAL close errors we will allow before triggering a server abort. A setting of 0 will cause the region server to abort if closing the current WAL writer fails during log rolling. Even a small value (2 or 3) will allow a region server to ride over transient HDFS errors.\\
**Default:** \`2\`

#### \`hbase.regionserver.free.heap.min.memory.size\` \\[!toc]

**Description:** Defines the minimum amount of heap memory that must remain free for the RegionServer to start, specified in bytes or human-readable formats like '512m' for megabytes or '4g' for gigabytes. If not set, the default is 20% of the total heap size. To disable the check entirely, set this value to 0. If the combined memory usage of memstore and block cache exceeds (total heap - this value), the RegionServer will fail to start.\\
**Default:** \`(empty)\`

#### \`hbase.regionserver.global.memstore.size\` \\[!toc]

**Description:** Maximum size of all memstores in a region server before new updates are blocked and flushes are forced. Defaults to 40% of heap (0.4). Updates are blocked and flushes are forced until size of all memstores in a region server hits hbase.regionserver.global.memstore.size.lower.limit. The default value in this configuration has been intentionally left empty in order to honor the old hbase.regionserver.global.memstore.upperLimit property if present.\\
**Default:** \`(empty)\`

#### \`hbase.regionserver.global.memstore.memory.size\` \\[!toc]

**Description:** Maximum size of all memstores in a region server before new updates are blocked and flushes are forced, specified in bytes or human-readable formats like '10m' for megabytes or '10g' for gigabytes. This configuration allows setting an absolute memory size instead of a percentage of the maximum heap. Takes precedence over hbase.regionserver.global.memstore.size if both are specified.\\
**Default:** \`(empty)\`

#### \`hbase.regionserver.global.memstore.size.lower.limit\` \\[!toc]

**Description:** Maximum size of all memstores in a region server before flushes are forced. Defaults to 95% of hbase.regionserver.global.memstore.size (0.95). A 100% value for this value causes the minimum possible flushing to occur when updates are blocked due to memstore limiting. The default value in this configuration has been intentionally left empty in order to honor the old hbase.regionserver.global.memstore.lowerLimit property if present.\\
**Default:** \`(empty)\`

#### \`hbase.systemtables.compacting.memstore.type\` \\[!toc]

**Description:** Determines the type of memstore to be used for system tables like META, namespace tables etc. By default NONE is the type and hence we use the default memstore for all the system tables. If we need to use compacting memstore for system tables then set this property to BASIC/EAGER\\
**Default:** \`NONE\`

#### \`hbase.regionserver.optionalcacheflushinterval\` \\[!toc]

**Description:** Maximum amount of time an edit lives in memory before being automatically flushed. Default 1 hour. Set it to 0 to disable automatic flushing.\\
**Default:** \`3600000\`

#### \`hbase.regionserver.dns.interface\` \\[!toc]

**Description:** The name of the Network Interface from which a region server should report its IP address.\\
**Default:** \`default\`

#### \`hbase.regionserver.dns.nameserver\` \\[!toc]

**Description:** The host name or IP address of the name server (DNS) which a region server should use to determine the host name used by the master for communication and display purposes.\\
**Default:** \`default\`

#### \`hbase.regionserver.region.split.policy\` \\[!toc]

**Description:** A split policy determines when a region should be split. The various other split policies that are available currently are BusyRegionSplitPolicy, ConstantSizeRegionSplitPolicy, DisabledRegionSplitPolicy, DelimitedKeyPrefixRegionSplitPolicy, KeyPrefixRegionSplitPolicy, and SteppingSplitPolicy. DisabledRegionSplitPolicy blocks manual region splitting.\\
**Default:** \`org.apache.hadoop.hbase.regionserver.SteppingSplitPolicy\`

#### \`hbase.regionserver.regionSplitLimit\` \\[!toc]

**Description:** Limit for the number of regions after which no more region splitting should take place. This is not hard limit for the number of regions but acts as a guideline for the regionserver to stop splitting after a certain limit. Default is set to 1000.\\
**Default:** \`1000\`

#### \`zookeeper.session.timeout\` \\[!toc]

**Description:** ZooKeeper session timeout in milliseconds. It is used in two different ways. First, this value is used in the ZK client that HBase uses to connect to the ensemble. It is also used by HBase when it starts a ZK server and it is passed as the 'maxSessionTimeout'. See [https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#ch\\_zkSessions](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#ch_zkSessions). For example, if an HBase region server connects to a ZK ensemble that's also managed by HBase, then the session timeout will be the one specified by this configuration. But, a region server that connects to an ensemble managed with a different configuration will be subjected that ensemble's maxSessionTimeout. So, even though HBase might propose using 90 seconds, the ensemble can have a max timeout lower than this and it will take precedence. The current default maxSessionTimeout that ZK ships with is 40 seconds, which is lower than HBase's.\\
**Default:** \`90000\`

#### \`zookeeper.znode.parent\` \\[!toc]

**Description:** Root ZNode for HBase in ZooKeeper. All of HBase's ZooKeeper files that are configured with a relative path will go under this node. By default, all of HBase's ZooKeeper file paths are configured with a relative path, so they will all go under this directory unless changed.\\
**Default:** \`/hbase\`

#### \`zookeeper.znode.acl.parent\` \\[!toc]

**Description:** Root ZNode for access control lists.\\
**Default:** \`acl\`

#### \`hbase.zookeeper.dns.interface\` \\[!toc]

**Description:** The name of the Network Interface from which a ZooKeeper server should report its IP address.\\
**Default:** \`default\`

#### \`hbase.zookeeper.dns.nameserver\` \\[!toc]

**Description:** The host name or IP address of the name server (DNS) which a ZooKeeper server should use to determine the host name used by the master for communication and display purposes.\\
**Default:** \`default\`

#### \`hbase.zookeeper.peerport\` \\[!toc]

**Description:** Port used by ZooKeeper peers to talk to each other. See [https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html#sc\\_RunningReplicatedZooKeeper](https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html#sc_RunningReplicatedZooKeeper) for more information.\\
**Default:** \`2888\`

#### \`hbase.zookeeper.leaderport\` \\[!toc]

**Description:** Port used by ZooKeeper for leader election. See [https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html#sc\\_RunningReplicatedZooKeeper](https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html#sc_RunningReplicatedZooKeeper) for more information.\\
**Default:** \`3888\`

#### \`hbase.zookeeper.property.initLimit\` \\[!toc]

**Description:** Property from ZooKeeper's config zoo.cfg. The number of ticks that the initial synchronization phase can take.\\
**Default:** \`10\`

#### \`hbase.zookeeper.property.syncLimit\` \\[!toc]

**Description:** Property from ZooKeeper's config zoo.cfg. The number of ticks that can pass between sending a request and getting an acknowledgment.\\
**Default:** \`5\`

#### \`hbase.zookeeper.property.dataDir\` \\[!toc]

**Description:** Property from ZooKeeper's config zoo.cfg. The directory where the snapshot is stored.\\
**Default:** \`\${hbase.tmp.dir}/zookeeper\`

#### \`hbase.zookeeper.property.clientPort\` \\[!toc]

**Description:** Property from ZooKeeper's config zoo.cfg. The port at which the clients will connect.\\
**Default:** \`2181\`

#### \`hbase.zookeeper.property.maxClientCnxns\` \\[!toc]

**Description:** Property from ZooKeeper's config zoo.cfg. Limit on number of concurrent connections (at the socket level) that a single client, identified by IP address, may make to a single member of the ZooKeeper ensemble. Set high to avoid zk connection issues running standalone and pseudo-distributed.\\
**Default:** \`300\`

#### \`hbase.client.write.buffer\` \\[!toc]

**Description:** Default size of the BufferedMutator write buffer in bytes. A bigger buffer takes more memory -- on both the client and server side since server instantiates the passed write buffer to process it -- but a larger buffer size reduces the number of RPCs made. For an estimate of server-side memory-used, evaluate hbase.client.write.buffer \\* hbase.regionserver.handler.count\\
**Default:** \`2097152\`

#### \`hbase.client.pause\` \\[!toc]

**Description:** General client pause value. Used mostly as value to wait before running a retry of a failed get, region lookup, etc. See hbase.client.retries.number for description of how we backoff from this initial pause amount and how this pause works w/ retries.\\
**Default:** \`100\`

#### \`hbase.client.pause.server.overloaded\` \\[!toc]

**Description:** Pause time when encountering an exception indicating a server is overloaded, CallQueueTooBigException or CallDroppedException. Set this property to a higher value than hbase.client.pause if you observe frequent CallQueueTooBigException or CallDroppedException from the same RegionServer and the call queue there keeps filling up. This config used to be called hbase.client.pause.cqtbe, which has been deprecated as of 2.5.0.\\
**Default:** \`(empty)\`

#### \`hbase.client.retries.number\` \\[!toc]

**Description:** Maximum retries. Used as maximum for all retryable operations such as the getting of a cell's value, starting a row update, etc. Retry interval is a rough function based on hbase.client.pause. At first we retry at this interval but then with backoff, we pretty quickly reach retrying every ten seconds. See HConstants#RETRY\\_BACKOFF for how the backup ramps up. Change this setting and hbase.client.pause to suit your workload.\\
**Default:** \`15\`

#### \`hbase.client.max.total.tasks\` \\[!toc]

**Description:** The maximum number of concurrent mutation tasks a single HTable instance will send to the cluster.\\
**Default:** \`100\`

#### \`hbase.client.max.perserver.tasks\` \\[!toc]

**Description:** The maximum number of concurrent mutation tasks a single HTable instance will send to a single region server.\\
**Default:** \`2\`

#### \`hbase.client.max.perregion.tasks\` \\[!toc]

**Description:** The maximum number of concurrent mutation tasks the client will maintain to a single Region. That is, if there is already hbase.client.max.perregion.tasks writes in progress for this region, new puts won't be sent to this region until some writes finishes.\\
**Default:** \`1\`

#### \`hbase.client.perserver.requests.threshold\` \\[!toc]

**Description:** The max number of concurrent pending requests for one server in all client threads (process level). Exceeding requests will be thrown ServerTooBusyException immediately to prevent user's threads being occupied and blocked by only one slow region server. If you use a fix number of threads to access HBase in a synchronous way, set this to a suitable value which is related to the number of threads will help you. See [https://issues.apache.org/jira/browse/HBASE-16388](https://issues.apache.org/jira/browse/HBASE-16388) for details.\\
**Default:** \`2147483647\`

#### \`hbase.client.scanner.caching\` \\[!toc]

**Description:** Number of rows that we try to fetch when calling next on a scanner if it is not served from (local, client) memory. This configuration works together with hbase.client.scanner.max.result.size to try and use the network efficiently. The default value is Integer.MAX\\_VALUE by default so that the network will fill the chunk size defined by hbase.client.scanner.max.result.size rather than be limited by a particular number of rows since the size of rows varies table to table. If you know ahead of time that you will not require more than a certain number of rows from a scan, this configuration should be set to that row limit via Scan#setCaching. Higher caching values will enable faster scanners but will eat up more memory and some calls of next may take longer and longer times when the cache is empty. Do not set this value such that the time between invocations is greater than the scanner timeout; i.e. hbase.client.scanner.timeout.period\\
**Default:** \`2147483647\`

#### \`hbase.client.keyvalue.maxsize\` \\[!toc]

**Description:** Specifies the combined maximum allowed size of a KeyValue instance. This is to set an upper boundary for a single entry saved in a storage file. Since they cannot be split it helps avoiding that a region cannot be split any further because the data is too large. It seems wise to set this to a fraction of the maximum region size. Setting it to zero or less disables the check.\\
**Default:** \`10485760\`

#### \`hbase.server.keyvalue.maxsize\` \\[!toc]

**Description:** Maximum allowed size of an individual cell, inclusive of value and all key components. A value of 0 or less disables the check. The default value is 10MB. This is a safety setting to protect the server from OOM situations.\\
**Default:** \`10485760\`

#### \`hbase.client.scanner.timeout.period\` \\[!toc]

**Description:** Client scanner lease period in milliseconds.\\
**Default:** \`60000\`

#### \`hbase.client.localityCheck.threadPoolSize\` \\[!toc]

**Description:**\\
**Default:** \`2\`

#### \`hbase.bulkload.retries.number\` \\[!toc]

**Description:** Maximum retries. This is maximum number of iterations to atomic bulk loads are attempted in the face of splitting operations 0 means never give up.\\
**Default:** \`10\`

#### \`hbase.compaction.after.bulkload.enable\` \\[!toc]

**Description:** Request Compaction after bulkload immediately. If bulkload is continuous, the triggered compactions may increase load, bring about performance side effect.\\
**Default:** \`false\`

#### \`hbase.master.balancer.maxRitPercent\` \\[!toc]

**Description:** The max percent of regions in transition when balancing. The default value is 1.0. So there are no balancer throttling. If set this config to 0.01, It means that there are at most 1% regions in transition when balancing. Then the cluster's availability is at least 99% when balancing.\\
**Default:** \`1.0\`

#### \`hbase.balancer.period\` \\[!toc]

**Description:** Period at which the region balancer runs in the Master, in milliseconds.\\
**Default:** \`300000\`

#### \`hbase.master.oldwals.dir.updater.period\` \\[!toc]

**Description:** Period at which the oldWALs directory size calculator/updater will run in the Master, in milliseconds.\\
**Default:** \`300000\`

#### \`hbase.regions.slop\` \\[!toc]

**Description:** The load balancer can trigger for several reasons. This value controls one of those reasons. Run the balancer if any regionserver has a region count outside the range of average +/- (average \\* slop) regions. If the value of slop is negative, disable sloppiness checks. The balancer can still run for other reasons, but sloppiness will not be one of them. If the value of slop is 0, run the balancer if any server has a region count more than 1 from the average. If the value of slop is 100, run the balancer if any server has a region count greater than 101 times the average. The default value of this parameter is 0.2, which runs the balancer if any server has a region count less than 80% of the average, or greater than 120% of the average. Note that for the default StochasticLoadBalancer, this does not guarantee any balancing actions will be taken, but only that the balancer will attempt to run.\\
**Default:** \`0.2\`

#### \`hbase.normalizer.period\` \\[!toc]

**Description:** Period at which the region normalizer runs in the Master, in milliseconds.\\
**Default:** \`300000\`

#### \`hbase.normalizer.split.enabled\` \\[!toc]

**Description:** Whether to split a region as part of normalization.\\
**Default:** \`true\`

#### \`hbase.normalizer.merge.enabled\` \\[!toc]

**Description:** Whether to merge a region as part of normalization.\\
**Default:** \`true\`

#### \`hbase.normalizer.merge.min.region.count\` \\[!toc]

**Description:** The minimum number of regions in a table to consider it for merge normalization.\\
**Default:** \`3\`

#### \`hbase.normalizer.merge.min_region_age.days\` \\[!toc]

**Description:** The minimum age for a region to be considered for a merge, in days.\\
**Default:** \`3\`

#### \`hbase.normalizer.merge.min_region_size.mb\` \\[!toc]

**Description:** The minimum size for a region to be considered for a merge, in whole MBs.\\
**Default:** \`1\`

#### \`hbase.normalizer.merge.merge_request_max_number_of_regions\` \\[!toc]

**Description:** The maximum number of region count in a merge request for merge normalization.\\
**Default:** \`100\`

#### \`hbase.table.normalization.enabled\` \\[!toc]

**Description:** This config is used to set default behaviour of normalizer at table level. To override this at table level one can set NORMALIZATION\\_ENABLED at table descriptor level and that property will be honored\\
**Default:** \`false\`

#### \`hbase.server.thread.wakefrequency\` \\[!toc]

**Description:** In master side, this config is the period used for FS related behaviors: checking if hdfs is out of safe mode, setting or checking hbase.version file, setting or checking hbase.id file. Using default value should be fine. In regionserver side, this config is used in several places: flushing check interval, compaction check interval, wal rolling check interval. Specially, admin can tune flushing and compaction check interval by hbase.regionserver.flush.check.period and hbase.regionserver.compaction.check.period. (in milliseconds)\\
**Default:** \`10000\`

#### \`hbase.regionserver.flush.check.period\` \\[!toc]

**Description:** It determines the flushing check period of PeriodicFlusher in regionserver. If unset, it uses hbase.server.thread.wakefrequency as default value. (in milliseconds)\\
**Default:** \`\${hbase.server.thread.wakefrequency}\`

#### \`hbase.regionserver.compaction.check.period\` \\[!toc]

**Description:** It determines the compaction check period of CompactionChecker in regionserver. If unset, it uses hbase.server.thread.wakefrequency as default value. (in milliseconds)\\
**Default:** \`\${hbase.server.thread.wakefrequency}\`

#### \`hbase.server.versionfile.writeattempts\` \\[!toc]

**Description:** How many times to retry attempting to write a version file before just aborting. Each attempt is separated by the hbase.server.thread.wakefrequency milliseconds.\\
**Default:** \`3\`

#### \`hbase.hregion.memstore.flush.size\` \\[!toc]

**Description:** Memstore will be flushed to disk if size of the memstore exceeds this number of bytes. Value is checked by a thread that runs every hbase.server.thread.wakefrequency.\\
**Default:** \`134217728\`

#### \`hbase.hregion.percolumnfamilyflush.size.lower.bound.min\` \\[!toc]

**Description:** If FlushLargeStoresPolicy is used and there are multiple column families, then every time that we hit the total memstore limit, we find out all the column families whose memstores exceed a "lower bound" and only flush them while retaining the others in memory. The "lower bound" will be "hbase.hregion.memstore.flush.size / column\\_family\\_number" by default unless value of this property is larger than that. If none of the families have their memstore size more than lower bound, all the memstores will be flushed (just as usual).\\
**Default:** \`16777216\`

#### \`hbase.hregion.preclose.flush.size\` \\[!toc]

**Description:** If the memstores in a region are this size or larger when we go to close, run a "pre-flush" to clear out memstores before we put up the region closed flag and take the region offline. On close, a flush is run under the close flag to empty memory. During this time the region is offline and we are not taking on any writes. If the memstore content is large, this flush could take a long time to complete. The preflush is meant to clean out the bulk of the memstore before putting up the close flag and taking the region offline so the flush that runs under the close flag has little to do.\\
**Default:** \`5242880\`

#### \`hbase.hregion.memstore.block.multiplier\` \\[!toc]

**Description:** Block updates if memstore has hbase.hregion.memstore.block.multiplier times hbase.hregion.memstore.flush.size bytes. Useful preventing runaway memstore during spikes in update traffic. Without an upper-bound, memstore fills such that when it flushes the resultant flush files take a long time to compact or split, or worse, we OOME.\\
**Default:** \`4\`

#### \`hbase.hregion.memstore.mslab.enabled\` \\[!toc]

**Description:** Enables the MemStore-Local Allocation Buffer, a feature which works to prevent heap fragmentation under heavy write loads. This can reduce the frequency of stop-the-world GC pauses on large heaps.\\
**Default:** \`true\`

#### \`hbase.hregion.memstore.mslab.chunksize\` \\[!toc]

**Description:** The maximum byte size of a chunk in the MemStoreLAB. Unit: bytes\\
**Default:** \`2097152\`

#### \`hbase.regionserver.offheap.global.memstore.size\` \\[!toc]

**Description:** The amount of off-heap memory all MemStores in a RegionServer may use. A value of 0 means that no off-heap memory will be used and all chunks in MSLAB will be HeapByteBuffer, otherwise the non-zero value means how many megabyte of off-heap memory will be used for chunks in MSLAB and all chunks in MSLAB will be DirectByteBuffer. Unit: megabytes.\\
**Default:** \`0\`

#### \`hbase.hregion.memstore.mslab.max.allocation\` \\[!toc]

**Description:** The maximal size of one allocation in the MemStoreLAB, if the desired byte size exceed this threshold then it will be just allocated from JVM heap rather than MemStoreLAB.\\
**Default:** \`262144\`

#### \`hbase.hregion.max.filesize\` \\[!toc]

**Description:** Maximum file size. If the sum of the sizes of a region's HFiles has grown to exceed this value, the region is split in two. There are two choices of how this option works, the first is when any store's size exceed the threshold then split, and the other is overall region's size exceed the threshold then split, it can be configed by hbase.hregion.split.overallfiles.\\
**Default:** \`10737418240\`

#### \`hbase.hregion.split.overallfiles\` \\[!toc]

**Description:** If we should sum overall region files size when check to split.\\
**Default:** \`true\`

#### \`hbase.hregion.majorcompaction\` \\[!toc]

**Description:** Time between major compactions, expressed in milliseconds. Set to 0 to disable time-based automatic major compactions. User-requested and size-based major compactions will still run. This value is multiplied by hbase.hregion.majorcompaction.jitter to cause compaction to start at a somewhat-random time during a given window of time. The default value is 7 days, expressed in milliseconds. If major compactions are causing disruption in your environment, you can configure them to run at off-peak times for your deployment, or disable time-based major compactions by setting this parameter to 0, and run major compactions in a cron job or by another external mechanism.\\
**Default:** \`604800000\`

#### \`hbase.hregion.majorcompaction.jitter\` \\[!toc]

**Description:** A multiplier applied to hbase.hregion.majorcompaction to cause compaction to occur a given amount of time either side of hbase.hregion.majorcompaction. The smaller the number, the closer the compactions will happen to the hbase.hregion.majorcompaction interval.\\
**Default:** \`0.50\`

#### \`hbase.hstore.compactionThreshold\` \\[!toc]

**Description:** If more than or equal to this number of StoreFiles exist in any one Store (one StoreFile is written per flush of MemStore), a compaction is run to rewrite all StoreFiles into a single StoreFile. Larger values delay compaction, but when compaction does occur, it takes longer to complete.\\
**Default:** \`3\`

#### \`hbase.regionserver.compaction.enabled\` \\[!toc]

**Description:** Enable/disable compactions on by setting true/false. We can further switch compactions dynamically with the compaction\\_switch shell command.\\
**Default:** \`true\`

#### \`hbase.hstore.flusher.count\` \\[!toc]

**Description:** The number of flush threads. With fewer threads, the MemStore flushes will be queued. With more threads, the flushes will be executed in parallel, increasing the load on HDFS, and potentially causing more compactions.\\
**Default:** \`2\`

#### \`hbase.hstore.blockingStoreFiles\` \\[!toc]

**Description:** If more than this number of StoreFiles exist in any one Store (one StoreFile is written per flush of MemStore), updates are blocked for this region until a compaction is completed, or until hbase.hstore.blockingWaitTime has been exceeded.\\
**Default:** \`16\`

#### \`hbase.hstore.blockingWaitTime\` \\[!toc]

**Description:** The time for which a region will block updates after reaching the StoreFile limit defined by hbase.hstore.blockingStoreFiles. After this time has elapsed, the region will stop blocking updates even if a compaction has not been completed.\\
**Default:** \`90000\`

#### \`hbase.hstore.compaction.min\` \\[!toc]

**Description:** The minimum number of StoreFiles which must be eligible for compaction before compaction can run. The goal of tuning hbase.hstore.compaction.min is to avoid ending up with too many tiny StoreFiles to compact. Setting this value to 2 would cause a minor compaction each time you have two StoreFiles in a Store, and this is probably not appropriate. If you set this value too high, all the other values will need to be adjusted accordingly. For most cases, the default value is appropriate (empty value here, results in 3 by code logic). In previous versions of HBase, the parameter hbase.hstore.compaction.min was named hbase.hstore.compactionThreshold.\\
**Default:** \`(empty)\`

#### \`hbase.hstore.compaction.max\` \\[!toc]

**Description:** The maximum number of StoreFiles which will be selected for a single minor compaction, regardless of the number of eligible StoreFiles. Effectively, the value of hbase.hstore.compaction.max controls the length of time it takes a single compaction to complete. Setting it larger means that more StoreFiles are included in a compaction. For most cases, the default value is appropriate.\\
**Default:** \`10\`

#### \`hbase.hstore.compaction.min.size\` \\[!toc]

**Description:** A StoreFile (or a selection of StoreFiles, when using ExploringCompactionPolicy) smaller than this size will always be eligible for minor compaction. HFiles this size or larger are evaluated by hbase.hstore.compaction.ratio to determine if they are eligible. Because this limit represents the "automatic include" limit for all StoreFiles smaller than this value, this value may need to be reduced in write-heavy environments where many StoreFiles in the 1-2 MB range are being flushed, because every StoreFile will be targeted for compaction and the resulting StoreFiles may still be under the minimum size and require further compaction. If this parameter is lowered, the ratio check is triggered more quickly. This addressed some issues seen in earlier versions of HBase but changing this parameter is no longer necessary in most situations. Default: 128 MB expressed in bytes.\\
**Default:** \`134217728\`

#### \`hbase.hstore.compaction.max.size\` \\[!toc]

**Description:** A StoreFile (or a selection of StoreFiles, when using ExploringCompactionPolicy) larger than this size will be excluded from compaction. The effect of raising hbase.hstore.compaction.max.size is fewer, larger StoreFiles that do not get compacted often. If you feel that compaction is happening too often without much benefit, you can try raising this value. Default: the value of LONG.MAX\\_VALUE, expressed in bytes.\\
**Default:** \`9223372036854775807\`

#### \`hbase.hstore.compaction.ratio\` \\[!toc]

**Description:** For minor compaction, this ratio is used to determine whether a given StoreFile which is larger than hbase.hstore.compaction.min.size is eligible for compaction. Its effect is to limit compaction of large StoreFiles. The value of hbase.hstore.compaction.ratio is expressed as a floating-point decimal. A large ratio, such as 10, will produce a single giant StoreFile. Conversely, a low value, such as .25, will produce behavior similar to the BigTable compaction algorithm, producing four StoreFiles. A moderate value of between 1.0 and 1.4 is recommended. When tuning this value, you are balancing write costs with read costs. Raising the value (to something like 1.4) will have more write costs, because you will compact larger StoreFiles. However, during reads, HBase will need to seek through fewer StoreFiles to accomplish the read. Consider this approach if you cannot take advantage of Bloom filters. Otherwise, you can lower this value to something like 1.0 to reduce the background cost of writes, and use Bloom filters to control the number of StoreFiles touched during reads. For most cases, the default value is appropriate.\\
**Default:** \`1.2F\`

#### \`hbase.hstore.compaction.ratio.offpeak\` \\[!toc]

**Description:** Allows you to set a different (by default, more aggressive) ratio for determining whether larger StoreFiles are included in compactions during off-peak hours. Works in the same way as hbase.hstore.compaction.ratio. Only applies if hbase.offpeak.start.hour and hbase.offpeak.end.hour are also enabled.\\
**Default:** \`5.0F\`

#### \`hbase.hstore.time.to.purge.deletes\` \\[!toc]

**Description:** The amount of time to delay purging of delete markers with future timestamps. If unset, or set to 0, all delete markers, including those with future timestamps, are purged during the next major compaction. Otherwise, a delete marker is kept until the major compaction which occurs after the marker's timestamp plus the value of this setting, in milliseconds.\\
**Default:** \`0\`

#### \`hbase.offpeak.start.hour\` \\[!toc]

**Description:** The start of off-peak hours, expressed as an integer between 0 and 23, inclusive. Set to -1 to disable off-peak.\\
**Default:** \`-1\`

#### \`hbase.offpeak.end.hour\` \\[!toc]

**Description:** The end of off-peak hours, expressed as an integer between 0 and 23, inclusive. Set to -1 to disable off-peak.\\
**Default:** \`-1\`

#### \`hbase.regionserver.thread.compaction.throttle\` \\[!toc]

**Description:** There are two different thread pools for compactions, one for large compactions and the other for small compactions. This helps to keep compaction of lean tables (such as hbase:meta) fast. If a compaction is larger than this threshold, it goes into the large compaction pool. In most cases, the default value is appropriate. Default: 2 x hbase.hstore.compaction.max x hbase.hregion.memstore.flush.size (which defaults to 128MB). The value field assumes that the value of hbase.hregion.memstore.flush.size is unchanged from the default.\\
**Default:** \`2684354560\`

#### \`hbase.regionserver.majorcompaction.pagecache.drop\` \\[!toc]

**Description:** Specifies whether to drop pages read/written into the system page cache by major compactions. Setting it to true helps prevent major compactions from polluting the page cache, which is almost always required, especially for clusters with low/moderate memory to storage ratio.\\
**Default:** \`true\`

#### \`hbase.regionserver.minorcompaction.pagecache.drop\` \\[!toc]

**Description:** Specifies whether to drop pages read/written into the system page cache by minor compactions. Setting it to true helps prevent minor compactions from polluting the page cache, which is most beneficial on clusters with low memory to storage ratio or very write heavy clusters. You may want to set it to false under moderate to low write workload when bulk of the reads are on the most recently written data.\\
**Default:** \`true\`

#### \`hbase.hstore.compaction.kv.max\` \\[!toc]

**Description:** The maximum number of KeyValues to read and then write in a batch when flushing or compacting. Set this lower if you have big KeyValues and problems with Out Of Memory Exceptions Set this higher if you have wide, small rows.\\
**Default:** \`10\`

#### \`hbase.storescanner.parallel.seek.enable\` \\[!toc]

**Description:** Enables StoreFileScanner parallel-seeking in StoreScanner, a feature which can reduce response latency under special conditions.\\
**Default:** \`false\`

#### \`hbase.storescanner.parallel.seek.threads\` \\[!toc]

**Description:** The default thread pool size if parallel-seeking feature enabled.\\
**Default:** \`10\`

#### \`hfile.block.cache.policy\` \\[!toc]

**Description:** The eviction policy for the L1 block cache (LRU or TinyLFU).\\
**Default:** \`LRU\`

#### \`hfile.block.cache.size\` \\[!toc]

**Description:** Percentage of maximum heap (-Xmx setting) to allocate to block cache used by a StoreFile. Default of 0.4 means allocate 40%. Set to 0 to disable but it's not recommended; you need at least enough cache to hold the storefile indices.\\
**Default:** \`0.4\`

#### \`hfile.block.cache.memory.size\` \\[!toc]

**Description:** Defines the maximum heap memory allocated for the HFile block cache, specified in bytes or human-readable formats like '10m' for megabytes or '10g' for gigabytes. This configuration allows setting an absolute memory size instead of a percentage of the maximum heap. Takes precedence over hfile.block.cache.size if both are specified.\\
**Default:** \`(empty)\`

#### \`hfile.block.index.cacheonwrite\` \\[!toc]

**Description:** This allows to put non-root multi-level index blocks into the block cache at the time the index is being written.\\
**Default:** \`false\`

#### \`hfile.index.block.max.size\` \\[!toc]

**Description:** When the size of a leaf-level, intermediate-level, or root-level index block in a multi-level block index grows to this size, the block is written out and a new block is started.\\
**Default:** \`131072\`

#### \`hbase.bucketcache.ioengine\` \\[!toc]

**Description:** Where to store the contents of the bucketcache. One of: offheap, file, files, mmap or pmem. If a file or files, set it to file(s):PATH\\_TO\\_FILE. mmap means the content will be in an mmaped file. Use mmap:PATH\\_TO\\_FILE. 'pmem' is bucket cache over a file on the persistent memory device. Use pmem:PATH\\_TO\\_FILE. See [https://hbase.apache.org/docs/architecture/regionserver#off-heap-block-cache](https://hbase.apache.org/docs/architecture/regionserver#off-heap-block-cache) for more information.\\
**Default:** \`(empty)\`

#### \`hbase.hstore.compaction.throughput.lower.bound\` \\[!toc]

**Description:** The target lower bound on aggregate compaction throughput, in bytes/sec. Allows you to tune the minimum available compaction throughput when the PressureAwareCompactionThroughputController throughput controller is active. (It is active by default.)\\
**Default:** \`52428800\`

#### \`hbase.hstore.compaction.throughput.higher.bound\` \\[!toc]

**Description:** The target upper bound on aggregate compaction throughput, in bytes/sec. Allows you to control aggregate compaction throughput demand when the PressureAwareCompactionThroughputController throughput controller is active. (It is active by default.) The maximum throughput will be tuned between the lower and upper bounds when compaction pressure is within the range \\[0.0, 1.0]. If compaction pressure is 1.0 or greater the higher bound will be ignored until pressure returns to the normal range.\\
**Default:** \`104857600\`

#### \`hbase.bucketcache.size\` \\[!toc]

**Description:** It is the total capacity in megabytes of BucketCache. Default: 0.0\\
**Default:** \`(empty)\`

#### \`hbase.bucketcache.bucket.sizes\` \\[!toc]

**Description:** A comma-separated list of sizes for buckets for the bucketcache. Can be multiple sizes. List block sizes in order from smallest to largest. The sizes you use will depend on your data access patterns. Must be a multiple of 256 else you will run into 'java.io.IOException: Invalid HFile block magic' when you go to read from cache. If you specify no values here, then you pick up the default bucketsizes set in code (See BucketAllocator#DEFAULT\\_BUCKET\\_SIZES).\\
**Default:** \`(empty)\`

#### \`hfile.format.version\` \\[!toc]

**Description:** The HFile format version to use for new files. Version 3 adds support for tags in hfiles (See [https://hbase.apache.org/docs/security/data-access#tags](https://hbase.apache.org/docs/security/data-access#tags)). Also see the configuration 'hbase.replication.rpc.codec'.\\
**Default:** \`3\`

#### \`hfile.block.bloom.cacheonwrite\` \\[!toc]

**Description:** Enables cache-on-write for inline blocks of a compound Bloom filter.\\
**Default:** \`false\`

#### \`io.storefile.bloom.block.size\` \\[!toc]

**Description:** The size in bytes of a single block ("chunk") of a compound Bloom filter. This size is approximate, because Bloom blocks can only be inserted at data block boundaries, and the number of keys per data block varies.\\
**Default:** \`131072\`

#### \`hbase.rs.cacheblocksonwrite\` \\[!toc]

**Description:** Whether an HFile block should be added to the block cache when the block is finished.\\
**Default:** \`false\`

#### \`hbase.rpc.timeout\` \\[!toc]

**Description:** This is for the RPC layer to define how long (millisecond) HBase client applications take for a remote call to time out. It uses pings to check connections but will eventually throw a TimeoutException.\\
**Default:** \`60000\`

#### \`hbase.client.operation.timeout\` \\[!toc]

**Description:** Operation timeout is a top-level restriction (millisecond) that makes sure a blocking operation in Table will not be blocked more than this. In each operation, if rpc request fails because of timeout or other reason, it will retry until success or throw RetriesExhaustedException. But if the total time being blocking reach the operation timeout before retries exhausted, it will break early and throw SocketTimeoutException.\\
**Default:** \`1200000\`

#### \`hbase.client.connection.metacache.invalidate-interval.ms\` \\[!toc]

**Description:** Interval in milliseconds of checking and invalidating meta cache when table disabled or dropped, when set to zero means disable checking, suggest set it to 24h or a higher value, because disable/delete table usually not very frequently.\\
**Default:** \`0\`

#### \`hbase.cells.scanned.per.heartbeat.check\` \\[!toc]

**Description:** The number of cells scanned in between heartbeat checks. Heartbeat checks occur during the processing of scans to determine whether or not the server should stop scanning in order to send back a heartbeat message to the client. Heartbeat messages are used to keep the client-server connection alive during long running scans. Small values mean that the heartbeat checks will occur more often and thus will provide a tighter bound on the execution time of the scan. Larger values mean that the heartbeat checks occur less frequently\\
**Default:** \`10000\`

#### \`hbase.rpc.shortoperation.timeout\` \\[!toc]

**Description:** This is another version of "hbase.rpc.timeout". For those RPC operation within cluster, we rely on this configuration to set a short timeout limitation for short operation. For example, short rpc timeout for region server's trying to report to active master can benefit quicker master failover process.\\
**Default:** \`10000\`

#### \`hbase.ipc.client.tcpnodelay\` \\[!toc]

**Description:** Set no delay on rpc socket connections. See [http://docs.oracle.com/javase/1.5.0/docs/api/java/net/Socket.html#getTcpNoDelay()](http://docs.oracle.com/javase/1.5.0/docs/api/java/net/Socket.html#getTcpNoDelay\\(\\))\\
**Default:** \`true\`

#### \`hbase.unsafe.regionserver.hostname\` \\[!toc]

**Description:** This config is for experts: don't set its value unless you really know what you are doing. When set to a non-empty value, this represents the (external facing) hostname for the underlying server. See [https://issues.apache.org/jira/browse/HBASE-12954](https://issues.apache.org/jira/browse/HBASE-12954) for details.\\
**Default:** \`(empty)\`

#### \`hbase.unsafe.regionserver.hostname.disable.master.reversedns\` \\[!toc]

**Description:** This config is for experts: don't set its value unless you really know what you are doing. When set to true, regionserver will use the current node hostname for the servername and HMaster will skip reverse DNS lookup and use the hostname sent by regionserver instead. Note that this config and hbase.unsafe.regionserver.hostname are mutually exclusive. See [https://issues.apache.org/jira/browse/HBASE-18226](https://issues.apache.org/jira/browse/HBASE-18226) for more details.\\
**Default:** \`false\`

#### \`hbase.master.keytab.file\` \\[!toc]

**Description:** Full path to the kerberos keytab file to use for logging in the configured HMaster server principal.\\
**Default:** \`(empty)\`

#### \`hbase.master.kerberos.principal\` \\[!toc]

**Description:** Ex. "hbase/\\_[HOST@EXAMPLE.COM](mailto:HOST@EXAMPLE.COM)". The kerberos principal name that should be used to run the HMaster process. The principal name should be in the form: user/hostname\\@DOMAIN. If "\\_HOST" is used as the hostname portion, it will be replaced with the actual hostname of the running instance.\\
**Default:** \`(empty)\`

#### \`hbase.regionserver.keytab.file\` \\[!toc]

**Description:** Full path to the kerberos keytab file to use for logging in the configured HRegionServer server principal.\\
**Default:** \`(empty)\`

#### \`hbase.regionserver.kerberos.principal\` \\[!toc]

**Description:** Ex. "hbase/\\_[HOST@EXAMPLE.COM](mailto:HOST@EXAMPLE.COM)". The kerberos principal name that should be used to run the HRegionServer process. The principal name should be in the form: user/hostname\\@DOMAIN. If "\\_HOST" is used as the hostname portion, it will be replaced with the actual hostname of the running instance. An entry for this principal must exist in the file specified in hbase.regionserver.keytab.file\\
**Default:** \`(empty)\`

#### \`hadoop.policy.file\` \\[!toc]

**Description:** The policy configuration file used by RPC servers to make authorization decisions on client requests. Only used when HBase security is enabled.\\
**Default:** \`hbase-policy.xml\`

#### \`hbase.superuser\` \\[!toc]

**Description:** List of users or groups (comma-separated), who are allowed full privileges, regardless of stored ACLs, across the cluster. Only used when HBase security is enabled. Group names should be prefixed with "@".\\
**Default:** \`(empty)\`

#### \`hbase.auth.key.update.interval\` \\[!toc]

**Description:** The update interval for master key for authentication tokens in servers in milliseconds. Only used when HBase security is enabled.\\
**Default:** \`86400000\`

#### \`hbase.auth.token.max.lifetime\` \\[!toc]

**Description:** The maximum lifetime in milliseconds after which an authentication token expires. Only used when HBase security is enabled.\\
**Default:** \`604800000\`

#### \`hbase.ipc.client.fallback-to-simple-auth-allowed\` \\[!toc]

**Description:** When a client is configured to attempt a secure connection, but attempts to connect to an insecure server, that server may instruct the client to switch to SASL SIMPLE (unsecure) authentication. This setting controls whether or not the client will accept this instruction from the server. When false (the default), the client will not allow the fallback to SIMPLE authentication, and will abort the connection.\\
**Default:** \`false\`

#### \`hbase.ipc.server.fallback-to-simple-auth-allowed\` \\[!toc]

**Description:** When a server is configured to require secure connections, it will reject connection attempts from clients using SASL SIMPLE (unsecure) authentication. This setting allows secure servers to accept SASL SIMPLE connections from clients when the client requests. When false (the default), the server will not allow the fallback to SIMPLE authentication, and will reject the connection. WARNING: This setting should ONLY be used as a temporary measure while converting clients over to secure authentication. It MUST BE DISABLED for secure operation.\\
**Default:** \`false\`

#### \`hbase.unsafe.client.kerberos.hostname.disable.reversedns\` \\[!toc]

**Description:** This config is for experts: don't set its value unless you really know what you are doing. When set to true, HBase client using SASL Kerberos will skip reverse DNS lookup and use provided hostname of the destination for the principal instead. See [https://issues.apache.org/jira/browse/HBASE-25665](https://issues.apache.org/jira/browse/HBASE-25665) for more details.\\
**Default:** \`false\`

#### \`hbase.display.keys\` \\[!toc]

**Description:** When this is set to true the webUI and such will display all start/end keys as part of the table details, region names, etc. When this is set to false, the keys are hidden.\\
**Default:** \`true\`

#### \`hbase.coprocessor.enabled\` \\[!toc]

**Description:** Enables or disables coprocessor loading. If 'false' (disabled), any other coprocessor related configuration will be ignored.\\
**Default:** \`true\`

#### \`hbase.coprocessor.user.enabled\` \\[!toc]

**Description:** Enables or disables user (aka. table) coprocessor loading. If 'false' (disabled), any table coprocessor attributes in table descriptors will be ignored. If "hbase.coprocessor.enabled" is 'false' this setting has no effect.\\
**Default:** \`true\`

#### \`hbase.coprocessor.region.classes\` \\[!toc]

**Description:** A comma-separated list of region observer or endpoint coprocessors that are loaded by default on all tables. For any override coprocessor method, these classes will be called in order. After implementing your own Coprocessor, add it to HBase's classpath and add the fully qualified class name here. A coprocessor can also be loaded on demand by setting HTableDescriptor or the HBase shell.\\
**Default:** \`(empty)\`

#### \`hbase.coprocessor.master.classes\` \\[!toc]

**Description:** A comma-separated list of org.apache.hadoop.hbase.coprocessor.MasterObserver coprocessors that are loaded by default on the active HMaster process. For any implemented coprocessor methods, the listed classes will be called in order. After implementing your own MasterObserver, just put it in HBase's classpath and add the fully qualified class name here.\\
**Default:** \`(empty)\`

#### \`hbase.coprocessor.abortonerror\` \\[!toc]

**Description:** Set to true to cause the hosting server (master or regionserver) to abort if a coprocessor fails to load, fails to initialize, or throws an unexpected Throwable object. Setting this to false will allow the server to continue execution but the system wide state of the coprocessor in question will become inconsistent as it will be properly executing in only a subset of servers, so this is most useful for debugging only.\\
**Default:** \`true\`

#### \`hbase.rest.port\` \\[!toc]

**Description:** The port for the HBase REST server.\\
**Default:** \`8080\`

#### \`hbase.rest.readonly\` \\[!toc]

**Description:** Defines the mode the REST server will be started in. Possible values are: false: All HTTP methods are permitted - GET/PUT/POST/DELETE. true: Only the GET method is permitted.\\
**Default:** \`false\`

#### \`hbase.rest.threads.max\` \\[!toc]

**Description:** The maximum number of threads of the REST server thread pool. Threads in the pool are reused to process REST requests. This controls the maximum number of requests processed concurrently. It may help to control the memory used by the REST server to avoid OOM issues. If the thread pool is full, incoming requests will be queued up and wait for some free threads.\\
**Default:** \`100\`

#### \`hbase.rest.threads.min\` \\[!toc]

**Description:** The minimum number of threads of the REST server thread pool. The thread pool always has at least these number of threads so the REST server is ready to serve incoming requests.\\
**Default:** \`2\`

#### \`hbase.rest.support.proxyuser\` \\[!toc]

**Description:** Enables running the REST server to support proxy-user mode.\\
**Default:** \`false\`

#### \`hbase.defaults.for.version.skip\` \\[!toc]

**Description:** Set to true to skip the 'hbase.defaults.for.version' check. Setting this to true can be useful in contexts other than the other side of a maven generation; i.e. running in an IDE. You'll want to set this boolean to true to avoid seeing the RuntimeException complaint: "hbase-default.xml file seems to be for and old version of HBase ($\\{hbase.version}), this version is X.X.X-SNAPSHOT"\\
**Default:** \`false\`

#### \`hbase.table.lock.enable\` \\[!toc]

**Description:** Set to true to enable locking the table in zookeeper for schema change operations. Table locking from master prevents concurrent schema modifications to corrupt table state.\\
**Default:** \`true\`

#### \`hbase.table.max.rowsize\` \\[!toc]

**Description:** Maximum size of single row in bytes (default is 1 Gb) for Get'ting or Scan'ning without in-row scan flag set. If row size exceeds this limit RowTooBigException is thrown to client.\\
**Default:** \`1073741824\`

#### \`hbase.thrift.minWorkerThreads\` \\[!toc]

**Description:** The "core size" of the thread pool. New threads are created on every connection until this many threads are created.\\
**Default:** \`16\`

#### \`hbase.thrift.maxWorkerThreads\` \\[!toc]

**Description:** The maximum size of the thread pool. When the pending request queue overflows, new threads are created until their number reaches this number. After that, the server starts dropping connections.\\
**Default:** \`1000\`

#### \`hbase.thrift.maxQueuedRequests\` \\[!toc]

**Description:** The maximum number of pending Thrift connections waiting in the queue. If there are no idle threads in the pool, the server queues requests. Only when the queue overflows, new threads are added, up to hbase.thrift.maxQueuedRequests threads.\\
**Default:** \`1000\`

#### \`hbase.regionserver.thrift.framed\` \\[!toc]

**Description:** Use Thrift TFramedTransport on the server side. This is the recommended transport for thrift servers and requires a similar setting on the client side. Changing this to false will select the default transport, vulnerable to DoS when malformed requests are issued due to THRIFT-601.\\
**Default:** \`false\`

#### \`hbase.regionserver.thrift.framed.max_frame_size_in_mb\` \\[!toc]

**Description:** Default frame size when using framed transport, in MB\\
**Default:** \`2\`

#### \`hbase.regionserver.thrift.compact\` \\[!toc]

**Description:** Use Thrift TCompactProtocol binary serialization protocol.\\
**Default:** \`false\`

#### \`hbase.rootdir.perms\` \\[!toc]

**Description:** FS Permissions for the root data subdirectory in a secure (kerberos) setup. When master starts, it creates the rootdir with this permissions or sets the permissions if it does not match.\\
**Default:** \`700\`

#### \`hbase.wal.dir.perms\` \\[!toc]

**Description:** FS Permissions for the root WAL directory in a secure(kerberos) setup. When master starts, it creates the WAL dir with this permissions or sets the permissions if it does not match.\\
**Default:** \`700\`

#### \`hbase.data.umask.enable\` \\[!toc]

**Description:** Enable, if true, that file permissions should be assigned to the files written by the regionserver\\
**Default:** \`false\`

#### \`hbase.data.umask\` \\[!toc]

**Description:** File permissions that should be used to write data files when hbase.data.umask.enable is true\\
**Default:** \`000\`

#### \`hbase.snapshot.enabled\` \\[!toc]

**Description:** Set to true to allow snapshots to be taken / restored / cloned.\\
**Default:** \`true\`

#### \`hbase.snapshot.restore.take.failsafe.snapshot\` \\[!toc]

**Description:** Set to true to take a snapshot before the restore operation. The snapshot taken will be used in case of failure, to restore the previous state. At the end of the restore operation this snapshot will be deleted\\
**Default:** \`true\`

#### \`hbase.snapshot.restore.failsafe.name\` \\[!toc]

**Description:** Name of the failsafe snapshot taken by the restore operation. You can use the \\{snapshot.name}, \\{table.name} and \\{restore.timestamp} variables to create a name based on what you are restoring.\\
**Default:** \`hbase-failsafe-{snapshot.name}-{restore.timestamp}\`

#### \`hbase.snapshot.working.dir\` \\[!toc]

**Description:** Location where the snapshotting process will occur. The location of the completed snapshots will not change, but the temporary directory where the snapshot process occurs will be set to this location. This can be a separate filesystem than the root directory, for performance increase purposes. See HBASE-21098 for more information\\
**Default:** \`(empty)\`

#### \`hbase.server.compactchecker.interval.multiplier\` \\[!toc]

**Description:** The number that determines how often we scan to see if compaction is necessary. Normally, compactions are done after some events (such as memstore flush), but if region didn't receive a lot of writes for some time, or due to different compaction policies, it may be necessary to check it periodically. The interval between checks is hbase.server.compactchecker.interval.multiplier multiplied by hbase.server.thread.wakefrequency.\\
**Default:** \`1000\`

#### \`hbase.lease.recovery.timeout\` \\[!toc]

**Description:** How long we wait on dfs lease recovery in total before giving up.\\
**Default:** \`900000\`

#### \`hbase.lease.recovery.dfs.timeout\` \\[!toc]

**Description:** How long between dfs recover lease invocations. Should be larger than the sum of the time it takes for the namenode to issue a block recovery command as part of datanode; dfs.heartbeat.interval and the time it takes for the primary datanode, performing block recovery to timeout on a dead datanode; usually dfs.client.socket-timeout. See the end of HBASE-8389 for more.\\
**Default:** \`64000\`

#### \`hbase.column.max.version\` \\[!toc]

**Description:** New column family descriptors will use this value as the default number of versions to keep.\\
**Default:** \`1\`

#### \`dfs.client.read.shortcircuit\` \\[!toc]

**Description:** If set to true, this configuration parameter enables short-circuit local reads.\\
**Default:** \`(empty)\`

#### \`dfs.domain.socket.path\` \\[!toc]

**Description:** This is a path to a UNIX domain socket that will be used for communication between the DataNode and local HDFS clients, if dfs.client.read.shortcircuit is set to true. If the string "\\_PORT" is present in this path, it will be replaced by the TCP port of the DataNode. Be careful about permissions for the directory that hosts the shared domain socket; dfsclient will complain if open to other users than the HBase user.\\
**Default:** \`(empty)\`

#### \`hbase.dfs.client.read.shortcircuit.buffer.size\` \\[!toc]

**Description:** If the DFSClient configuration dfs.client.read.shortcircuit.buffer.size is unset, we will use what is configured here as the short circuit read default direct byte buffer size. DFSClient native default is 1MB; HBase keeps its HDFS files open so number of file blocks \\* 1MB soon starts to add up and threaten OOME because of a shortage of direct memory. So, we set it down from the default. Make it > the default hbase block size set in the HColumnDescriptor which is usually 64k.\\
**Default:** \`131072\`

#### \`hbase.regionserver.checksum.verify\` \\[!toc]

**Description:** If set to true (the default), HBase verifies the checksums for hfile blocks. HBase writes checksums inline with the data when it writes out hfiles. HDFS (as of this writing) writes checksums to a separate file than the data file necessitating extra seeks. Setting this flag saves some on i/o. Checksum verification by HDFS will be internally disabled on hfile streams when this flag is set. If the hbase-checksum verification fails, we will switch back to using HDFS checksums (so do not disable HDFS checksums! And besides this feature applies to hfiles only, not to WALs). If this parameter is set to false, then hbase will not verify any checksums, instead it will depend on checksum verification being done in the HDFS client.\\
**Default:** \`true\`

#### \`hbase.hstore.bytes.per.checksum\` \\[!toc]

**Description:** Number of bytes in a newly created checksum chunk for HBase-level checksums in hfile blocks.\\
**Default:** \`16384\`

#### \`hbase.hstore.checksum.algorithm\` \\[!toc]

**Description:** Name of an algorithm that is used to compute checksums. Possible values are NULL, CRC32, CRC32C.\\
**Default:** \`CRC32C\`

#### \`hbase.client.scanner.max.result.size\` \\[!toc]

**Description:** Maximum number of bytes returned when calling a scanner's next method. Note that when a single row is larger than this limit the row is still returned completely. The default value is 2MB, which is good for 1ge networks. With faster and/or high latency networks this value should be increased.\\
**Default:** \`2097152\`

#### \`hbase.server.scanner.max.result.size\` \\[!toc]

**Description:** Maximum number of bytes returned when calling a scanner's next method. Note that when a single row is larger than this limit the row is still returned completely. The default value is 100MB. This is a safety setting to protect the server from OOM situations.\\
**Default:** \`104857600\`

#### \`hbase.status.published\` \\[!toc]

**Description:** This setting activates the publication by the master of the status of the region server. When a region server dies and its recovery starts, the master will push this information to the client application, to let them cut the connection immediately instead of waiting for a timeout.\\
**Default:** \`false\`

#### \`hbase.status.publisher.class\` \\[!toc]

**Description:** Implementation of the status publication with a multicast message.\\
**Default:** \`org.apache.hadoop.hbase.master.ClusterStatusPublisher$MulticastPublisher\`

#### \`hbase.status.listener.class\` \\[!toc]

**Description:** Implementation of the status listener with a multicast message.\\
**Default:** \`org.apache.hadoop.hbase.client.ClusterStatusListener$MulticastListener\`

#### \`hbase.status.multicast.address.ip\` \\[!toc]

**Description:** Multicast address to use for the status publication by multicast.\\
**Default:** \`226.1.1.3\`

#### \`hbase.status.multicast.address.port\` \\[!toc]

**Description:** Multicast port to use for the status publication by multicast.\\
**Default:** \`16100\`

#### \`hbase.dynamic.jars.dir\` \\[!toc]

**Description:** The directory from which the custom filter JARs can be loaded dynamically by the region server without the need to restart. However, an already loaded filter/co-processor class would not be un-loaded. See HBASE-1936 for more details. Does not apply to coprocessors.\\
**Default:** \`\${hbase.rootdir}/lib\`

#### \`hbase.security.authentication\` \\[!toc]

**Description:** Controls whether or not secure authentication is enabled for HBase. Possible values are 'simple' (no authentication), and 'kerberos'.\\
**Default:** \`simple\`

#### \`hbase.rest.filter.classes\` \\[!toc]

**Description:** Servlet filters for REST service.\\
**Default:** \`org.apache.hadoop.hbase.rest.filter.GzipFilter\`

#### \`hbase.master.loadbalancer.class\` \\[!toc]

**Description:** Class used to execute the regions balancing when the period occurs. See the class comment for more on how it works [http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/master/balancer/StochasticLoadBalancer.html](http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/master/balancer/StochasticLoadBalancer.html) It replaces the DefaultLoadBalancer as the default (since renamed as the SimpleLoadBalancer).\\
**Default:** \`org.apache.hadoop.hbase.master.balancer.StochasticLoadBalancer\`

#### \`hbase.master.loadbalance.bytable\` \\[!toc]

**Description:** Factor Table name when the balancer runs. Default: false.\\
**Default:** \`false\`

#### \`hbase.master.normalizer.class\` \\[!toc]

**Description:** Class used to execute the region normalization when the period occurs. See the class comment for more on how it works [http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/master/normalizer/SimpleRegionNormalizer.html](http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/master/normalizer/SimpleRegionNormalizer.html)\\
**Default:** \`org.apache.hadoop.hbase.master.normalizer.SimpleRegionNormalizer\`

#### \`hbase.rest.csrf.enabled\` \\[!toc]

**Description:** Set to true to enable protection against cross-site request forgery (CSRF)\\
**Default:** \`false\`

#### \`hbase.rest-csrf.browser-useragents-regex\` \\[!toc]

**Description:** A comma-separated list of regular expressions used to match against an HTTP request's User-Agent header when protection against cross-site request forgery (CSRF) is enabled for REST server by setting hbase.rest.csrf.enabled to true. If the incoming User-Agent matches any of these regular expressions, then the request is considered to be sent by a browser, and therefore CSRF prevention is enforced. If the request's User-Agent does not match any of these regular expressions, then the request is considered to be sent by something other than a browser, such as scripted automation. In this case, CSRF is not a potential attack vector, so the prevention is not enforced. This helps achieve backwards-compatibility with existing automation that has not been updated to send the CSRF prevention header.\\
**Default:** \`^Mozilla.*,^Opera.*\`

#### \`hbase.security.exec.permission.checks\` \\[!toc]

**Description:** If this setting is enabled and ACL based access control is active (the AccessController coprocessor is installed either as a system coprocessor or on a table as a table coprocessor) then you must grant all relevant users EXEC privilege if they require the ability to execute coprocessor endpoint calls. EXEC privilege, like any other permission, can be granted globally to a user, or to a user on a per table or per namespace basis. For more information on coprocessor endpoints, see the coprocessor section of the HBase online manual. For more information on granting or revoking permissions using the AccessController, see the security section of the HBase online manual.\\
**Default:** \`false\`

#### \`hbase.procedure.regionserver.classes\` \\[!toc]

**Description:** A comma-separated list of org.apache.hadoop.hbase.procedure.RegionServerProcedureManager procedure managers that are loaded by default on the active HRegionServer process. The lifecycle methods (init/start/stop) will be called by the active HRegionServer process to perform the specific globally barriered procedure. After implementing your own RegionServerProcedureManager, just put it in HBase's classpath and add the fully qualified class name here.\\
**Default:** \`(empty)\`

#### \`hbase.procedure.master.classes\` \\[!toc]

**Description:** A comma-separated list of org.apache.hadoop.hbase.procedure.MasterProcedureManager procedure managers that are loaded by default on the active HMaster process. A procedure is identified by its signature and users can use the signature and an instant name to trigger an execution of a globally barriered procedure. After implementing your own MasterProcedureManager, just put it in HBase's classpath and add the fully qualified class name here.\\
**Default:** \`(empty)\`

#### \`hbase.coordinated.state.manager.class\` \\[!toc]

**Description:** Fully qualified name of class implementing coordinated state manager.\\
**Default:** \`org.apache.hadoop.hbase.coordination.ZkCoordinatedStateManager\`

#### \`hbase.regionserver.storefile.refresh.period\` \\[!toc]

**Description:** The period (in milliseconds) for refreshing the store files for the secondary regions. 0 means this feature is disabled. Secondary regions sees new files (from flushes and compactions) from primary once the secondary region refreshes the list of files in the region (there is no notification mechanism). But too frequent refreshes might cause extra Namenode pressure. If the files cannot be refreshed for longer than HFile TTL (hbase.master.hfilecleaner.ttl) the requests are rejected. Configuring HFile TTL to a larger value is also recommended with this setting.\\
**Default:** \`0\`

#### \`hbase.region.replica.replication.enabled\` \\[!toc]

**Description:** Whether asynchronous WAL replication to the secondary region replicas is enabled or not. We have a separated implementation for replicating the WAL without using the general inter-cluster replication framework, so now we will not add any replication peers.\\
**Default:** \`false\`

#### \`hbase.http.filter.initializers\` \\[!toc]

**Description:** A comma separated list of class names. Each class in the list must extend org.apache.hadoop.hbase.http.FilterInitializer. The corresponding Filter will be initialized. Then, the Filter will be applied to all user facing jsp and servlet web pages. The ordering of the list defines the ordering of the filters. The default StaticUserWebFilter add a user principal as defined by the hbase.http.staticuser.user property.\\
**Default:** \`org.apache.hadoop.hbase.http.lib.StaticUserWebFilter\`

#### \`hbase.security.visibility.mutations.checkauths\` \\[!toc]

**Description:** This property if enabled, will check whether the labels in the visibility expression are associated with the user issuing the mutation\\
**Default:** \`false\`

#### \`hbase.http.max.threads\` \\[!toc]

**Description:** The maximum number of threads that the HTTP Server will create in its ThreadPool.\\
**Default:** \`16\`

#### \`hbase.http.metrics.servlets\` \\[!toc]

**Description:** Comma separated list of servlet names to enable for metrics collection. Supported servlets are jmx, metrics, prometheus\\
**Default:** \`jmx,metrics,prometheus\`

#### \`hbase.replication.rpc.codec\` \\[!toc]

**Description:** The codec that is to be used when replication is enabled so that the tags are also replicated. This is used along with HFileV3 which supports tags in them. If tags are not used or if the hfile version used is HFileV2 then KeyValueCodec can be used as the replication codec. Note that using KeyValueCodecWithTags for replication when there are no tags causes no harm.\\
**Default:** \`org.apache.hadoop.hbase.codec.KeyValueCodecWithTags\`

#### \`hbase.replication.source.maxthreads\` \\[!toc]

**Description:** The maximum number of threads any replication source will use for shipping edits to the sinks in parallel. This also limits the number of chunks each replication batch is broken into. Larger values can improve the replication throughput between the master and slave clusters. The default of 10 will rarely need to be changed.\\
**Default:** \`10\`

#### \`hbase.http.staticuser.user\` \\[!toc]

**Description:** The user name to filter as, on static web filters while rendering content. An example use is the HDFS web UI (user to be used for browsing files).\\
**Default:** \`dr.stack\`

#### \`hbase.regionserver.handler.abort.on.error.percent\` \\[!toc]

**Description:** The percent of region server RPC threads failed to abort RS. -1 Disable aborting; 0 Abort if even a single handler has died; 0.x Abort only when this percent of handlers have died; 1 Abort only all of the handers have died.\\
**Default:** \`0.5\`

#### \`hbase.mob.file.cache.size\` \\[!toc]

**Description:** Number of opened file handlers to cache. A larger value will benefit reads by providing more file handlers per mob file cache and would reduce frequent file opening and closing. However, if this is set too high, this could lead to a "too many opened file handlers" The default value is 1000.\\
**Default:** \`1000\`

#### \`hbase.mob.cache.evict.period\` \\[!toc]

**Description:** The amount of time in seconds before the mob cache evicts cached mob files. The default value is 3600 seconds.\\
**Default:** \`3600\`

#### \`hbase.mob.cache.evict.remain.ratio\` \\[!toc]

**Description:** The ratio (between 0.0 and 1.0) of files that remains cached after an eviction is triggered when the number of cached mob files exceeds the hbase.mob.file.cache.size. The default value is 0.5f.\\
**Default:** \`0.5f\`

#### \`hbase.master.mob.cleaner.period\` \\[!toc]

**Description:** The period that MobFileCleanerChore runs. The unit is second. The default value is one day. The MOB file name uses only the date part of the file creation time in it. We use this time for deciding TTL expiry of the files. So the removal of TTL expired files might be delayed. The max delay might be 24 hrs.\\
**Default:** \`86400\`

#### \`hbase.mob.major.compaction.region.batch.size\` \\[!toc]

**Description:** The max number of a MOB table regions that is allowed in a batch of the mob compaction. By setting this number to a custom value, users can control the overall effect of a major compaction of a large MOB-enabled table. Default is 0 - means no limit - all regions of a MOB table will be compacted at once\\
**Default:** \`0\`

#### \`hbase.mob.compaction.chore.period\` \\[!toc]

**Description:** The period that MobCompactionChore runs. The unit is second. The default value is one week.\\
**Default:** \`604800\`

#### \`hbase.snapshot.master.timeout.millis\` \\[!toc]

**Description:** Timeout for master for the snapshot procedure execution.\\
**Default:** \`300000\`

#### \`hbase.snapshot.region.timeout\` \\[!toc]

**Description:** Timeout for regionservers to keep threads in snapshot request pool waiting.\\
**Default:** \`300000\`

#### \`hbase.rpc.rows.warning.threshold\` \\[!toc]

**Description:** Number of rows in a batch operation above which a warning will be logged. If hbase.client.write.buffer.maxmutations is not set, this will be used as fallback for that setting.\\
**Default:** \`5000\`

#### \`hbase.master.wait.on.service.seconds\` \\[!toc]

**Description:** Default is 5 minutes. Make it 30 seconds for tests. See HBASE-19794 for some context.\\
**Default:** \`30\`

#### \`hbase.master.cleaner.snapshot.interval\` \\[!toc]

**Description:** Snapshot Cleanup chore interval in milliseconds. The cleanup thread keeps running at this interval to find all snapshots that are expired based on TTL and delete them.\\
**Default:** \`1800000\`

#### \`hbase.master.snapshot.ttl\` \\[!toc]

**Description:** Default Snapshot TTL to be considered when the user does not specify TTL while creating snapshot. Default value 0 indicates FOREVERE - snapshot should not be automatically deleted until it is manually deleted\\
**Default:** \`0\`

#### \`hbase.master.regions.recovery.check.interval\` \\[!toc]

**Description:** Regions Recovery Chore interval in milliseconds. This chore keeps running at this interval to find all regions with configurable max store file ref count and reopens them.\\
**Default:** \`1200000\`

#### \`hbase.regions.recovery.store.file.ref.count\` \\[!toc]

**Description:** Very large number of ref count on a compacted store file indicates that it is a ref leak on that object(compacted store file). Such files can not be removed after it is invalidated via compaction. Only way to recover in such scenario is to reopen the region which can release all resources, like the refcount, leases, etc. This config represents Store files Ref Count threshold value considered for reopening regions. Any region with compacted store files ref count > this value would be eligible for reopening by master. Here, we get the max refCount among all refCounts on all compacted away store files that belong to a particular region. Default value -1 indicates this feature is turned off. Only positive integer value should be provided to enable this feature.\\
**Default:** \`-1\`

#### \`hbase.regionserver.slowlog.ringbuffer.size\` \\[!toc]

**Description:** Default size of ringbuffer to be maintained by each RegionServer in order to store online slowlog responses. This is an in-memory ring buffer of requests that were judged to be too slow in addition to the responseTooSlow logging. The in-memory representation would be complete. For more details, please look into Doc Section: Get Slow Response Log from shell\\
**Default:** \`256\`

#### \`hbase.regionserver.slowlog.buffer.enabled\` \\[!toc]

**Description:** Indicates whether RegionServers have ring buffer running for storing Online Slow logs in FIFO manner with limited entries. The size of the ring buffer is indicated by config: hbase.regionserver.slowlog.ringbuffer.size The default value is false, turn this on and get latest slowlog responses with complete data.\\
**Default:** \`false\`

#### \`hbase.regionserver.slowlog.systable.enabled\` \\[!toc]

**Description:** Should be enabled only if hbase.regionserver.slowlog.buffer.enabled is enabled. If enabled (true), all slow/large RPC logs would be persisted to system table hbase:slowlog (in addition to in-memory ring buffer at each RegionServer). The records are stored in increasing order of time. Operators can scan the table with various combination of ColumnValueFilter. More details are provided in the doc section: "Get Slow/Large Response Logs from System table hbase:slowlog"\\
**Default:** \`false\`

#### \`hbase.master.metafixer.max.merge.count\` \\[!toc]

**Description:** Maximum regions to merge at a time when we fix overlaps noted in CJ consistency report, but avoid merging 100 regions in one go!\\
**Default:** \`64\`

#### \`hbase.rpc.rows.size.threshold.reject\` \\[!toc]

**Description:** If value is true, RegionServer will abort batch requests of Put/Delete with number of rows in a batch operation exceeding threshold defined by value of config: hbase.rpc.rows.warning.threshold. The default value is false and hence, by default, only warning will be logged. This config should be turned on to prevent RegionServer from serving very large batch size of rows and this way we can improve CPU usages by discarding too large batch request.\\
**Default:** \`false\`

#### \`hbase.namedqueue.provider.classes\` \\[!toc]

**Description:** Default values for NamedQueueService implementors. This comma separated full class names represent all implementors of NamedQueueService that we would like to be invoked by LogEvent handler service. One example of NamedQueue service is SlowLogQueueService which is used to store slow/large RPC logs in ringbuffer at each RegionServer. All implementors of NamedQueueService should be found under package: "org.apache.hadoop.hbase.namequeues.impl"\\
**Default:** \`org.apache.hadoop.hbase.namequeues.impl.SlowLogQueueService,org.apache.hadoop.hbase.namequeues.impl.BalancerDecisionQueueService,org.apache.hadoop.hbase.namequeues.impl.BalancerRejectionQueueService,org.apache.hadoop.hbase.namequeues.WALEventTrackerQueueService\`

#### \`hbase.master.balancer.decision.buffer.enabled\` \\[!toc]

**Description:** Indicates whether active HMaster has ring buffer running for storing balancer decisions in FIFO manner with limited entries. The size of the ring buffer is indicated by config: hbase.master.balancer.decision.queue.size\\
**Default:** \`false\`

#### \`hbase.master.balancer.rejection.buffer.enabled\` \\[!toc]

**Description:** Indicates whether active HMaster has ring buffer running for storing balancer rejection in FIFO manner with limited entries. The size of the ring buffer is indicated by config: hbase.master.balancer.rejection.queue.size\\
**Default:** \`false\`

#### \`hbase.locality.inputstream.derive.enabled\` \\[!toc]

**Description:** If true, derive StoreFile locality metrics from the underlying DFSInputStream backing reads for that StoreFile. This value will update as the DFSInputStream's block locations are updated over time. Otherwise, locality is computed on StoreFile open, and cached until the StoreFile is closed.\\
**Default:** \`false\`

#### \`hbase.locality.inputstream.derive.cache.period\` \\[!toc]

**Description:** If deriving StoreFile locality metrics from the underlying DFSInputStream, how long should the derived values be cached for. The derivation process may involve hitting the namenode, if the DFSInputStream's block list is incomplete.\\
**Default:** \`60000\`

## hbase-env.sh

Set HBase environment variables in this file. Examples include options to pass the JVM on start of an HBase daemon such as heap size and garbage collector configs. You can also set configurations for HBase configuration, log directories, niceness, ssh options, where to locate process pid files, etc. Open the file at *conf/hbase-env.sh* and peruse its content. Each option is fairly well documented. Add your own environment variables here if you want them read by HBase daemons on startup.

Changes here will require a cluster restart for HBase to notice the change.

## *log4j2.properties*

Since version 2.5.0, HBase has upgraded to Log4j2, so the configuration file name and format has changed. Read more in [Apache Log4j2](https://logging.apache.org/log4j/2.x/index.html).

Edit this file to change rate at which HBase files are rolled and to change the level at which HBase logs messages.

Changes here will require a cluster restart for HBase to notice the change though log levels can be changed for particular daemons via the HBase UI.

## Client configuration and dependencies connecting to an HBase cluster

If you are running HBase in standalone mode, you don't need to configure anything for your client to work provided that they are all on the same machine.

Starting release 3.0.0, the default connection registry has been switched to a rpc based implementation. Refer to [Rpc Connection Registry (new as of 2.5.0)](/docs/architecture/client#rpc-connection-registry-new-as-of-250). Depending on your HBase version, following is the expected minimal client configuration.

### Up until 2.x.y releases

In 2.x.y releases, the default connection registry was based on ZooKeeper as the source of truth. This means that the clients always looked up ZooKeeper znodes to fetch the required metadata. For example, if an active master crashed and the a new master is elected, clients looked up the master znode to fetch the active master address (similarly for meta locations). This meant that the clients needed to have access to ZooKeeper and need to know the ZooKeeper ensemble information before they can do anything. This can be configured in the client configuration xml as follows:

\`\`\`xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <property>
    <name>hbase.zookeeper.quorum</name>
    <value>example1,example2,example3</value>
    <description>Zookeeper ensemble information</description>
  </property>
</configuration>
\`\`\`

### Starting from 3.0.0 release

The default implementation was switched to a rpc based connection registry. With this implementation, by default clients contact the active or stand-by master RPC end points to fetch the connection registry information. This means that the clients should have access to the list of active and master end points before they can do anything. This can be configured in the client configuration xml as follows:

\`\`\`xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <property>
    <name>hbase.masters</name>
    <value>example1,example2,example3</value>
    <description>List of master rpc end points for the hbase cluster.</description>
  </property>
</configuration>
\`\`\`

The configuration value for *hbase.masters* is a comma separated list of *host:port* values. If no port value is specified, the default of *16000* is assumed.

Of course you are free to specify bootstrap nodes other than masters, like:

\`\`\`xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<property>
  <name>hbase.client.bootstrap.servers</name>
  <value>server1:16020,server2:16020,server3:16020</value>
</property>
\`\`\`

The configuration value for *hbase.client.bootstrap.servers* is a comma separated list of *host:port* values. Notice that port must be specified here.

Usually these configurations are kept out in the *hbase-site.xml* and is picked up by the client from the \`CLASSPATH\`.

If you are configuring an IDE to run an HBase client, you should include the *conf/* directory on your classpath so *hbase-site.xml* settings can be found (or add *src/test/resources* to pick up the hbase-site.xml used by tests).

For Java applications using Maven, including the hbase-shaded-client module is the recommended dependency when connecting to a cluster:

\`\`\`xml
<dependency>
  <groupId>org.apache.hbase</groupId>
  <artifactId>hbase-shaded-client</artifactId>
  <version>2.0.0</version>
</dependency>
\`\`\`

### Java client configuration

The configuration used by a Java client is kept in an [HBaseConfiguration](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/HBaseConfiguration) instance.

The factory method on HBaseConfiguration, \`HBaseConfiguration.create();\`, on invocation, will read in the content of the first *hbase-site.xml* found on the client's \`CLASSPATH\`, if one is present (Invocation will also factor in any *hbase-default.xml* found; an *hbase-default.xml* ships inside the *hbase.X.X.X.jar*). It is also possible to specify configuration directly without having to read from a *hbase-site.xml*.

For example, to set the ZooKeeper ensemble or bootstrap nodes for the cluster programmatically do as follows:

\`\`\`java
Configuration config = HBaseConfiguration.create();
config.set("hbase.zookeeper.quorum", "localhost");  // Until 2.x.y versions
// ---- or ----
config.set("hbase.client.bootstrap.servers", "localhost:1234"); // Starting 3.0.0 version
\`\`\`

## Timeout settings

HBase provides a wide variety of timeout settings to limit the execution time of various remote operations.

* hbase.rpc.timeout
* hbase.rpc.read.timeout
* hbase.rpc.write.timeout
* hbase.client.operation.timeout
* hbase.client.meta.operation.timeout
* hbase.client.scanner.timeout.period

The \`hbase.rpc.timeout\` property limits how long a single RPC call can run before timing out. To fine tune read or write related RPC timeouts set \`hbase.rpc.read.timeout\` and \`hbase.rpc.write.timeout\` configuration properties. In the absence of these properties \`hbase.rpc.timeout\` will be used.

A higher-level timeout is \`hbase.client.operation.timeout\` which is valid for each client call. When an RPC call fails for instance for a timeout due to \`hbase.rpc.timeout\` it will be retried until \`hbase.client.operation.timeout\` is reached. Client operation timeout for system tables can be fine tuned by setting \`hbase.client.meta.operation.timeout\` configuration value. When this is not set its value will use \`hbase.client.operation.timeout\`.

Timeout for scan operations is controlled differently. Use \`hbase.client.scanner.timeout.period\` property to set this timeout.
`,r={title:"Default Configuration",description:"HBase default configuration properties and how to customize them via hbase-site.xml for site-specific settings."},a=[{href:"/docs/configuration/default#configuration-default-hbase-default-configuration"},{href:"https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#ch_zkSessions"},{href:"https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html#sc_RunningReplicatedZooKeeper"},{href:"https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html#sc_RunningReplicatedZooKeeper"},{href:"https://issues.apache.org/jira/browse/HBASE-16388"},{href:"https://hbase.apache.org/docs/architecture/regionserver#off-heap-block-cache"},{href:"https://hbase.apache.org/docs/security/data-access#tags"},{href:"http://docs.oracle.com/javase/1.5.0/docs/api/java/net/Socket.html#getTcpNoDelay()"},{href:"https://issues.apache.org/jira/browse/HBASE-12954"},{href:"https://issues.apache.org/jira/browse/HBASE-18226"},{href:"mailto:HOST@EXAMPLE.COM"},{href:"mailto:HOST@EXAMPLE.COM"},{href:"https://issues.apache.org/jira/browse/HBASE-25665"},{href:"http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/master/balancer/StochasticLoadBalancer.html"},{href:"http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/master/normalizer/SimpleRegionNormalizer.html"},{href:"https://logging.apache.org/log4j/2.x/index.html"},{href:"/docs/architecture/client#rpc-connection-registry-new-as-of-250"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/HBaseConfiguration"}],l={contents:[{heading:"hbase-sitexml-and-hbase-defaultxml",content:"Just as in Hadoop where you add site-specific HDFS configuration to the hdfs-site.xml file, for HBase, site specific customizations go into the file conf/hbase-site.xml. For the list of configurable properties, see hbase default configurations below or view the raw hbase-default.xml source file in the HBase source code at src/main/resources."},{heading:"hbase-sitexml-and-hbase-defaultxml",content:"Not all configuration options make it out to hbase-default.xml. Some configurations would only appear in source code; the only way to identify these changes are through code review."},{heading:"hbase-sitexml-and-hbase-defaultxml",content:"Currently, changes here will require a cluster restart for HBase to notice the change."},{heading:"configuration-default-hbase-default-configuration",content:"The documentation below is generated using the default hbase configuration file, hbase-default.xml, as source."},{heading:"hbasetmpdir-toc",content:"Description: Temporary directory on the local filesystem. Change this setting to point to a location more permanent than '/tmp', the usual resolve for java.io.tmpdir, as the '/tmp' directory is cleared on machine restart.Default: ${java.io.tmpdir}/hbase-${user.name}"},{heading:"hbaserootdir-toc",content:"Description: The directory shared by region servers and into which HBase persists. The URL should be 'fully-qualified' to include the filesystem scheme. For example, to specify the HDFS directory '/hbase' where the HDFS instance's namenode is running at namenode.example.org on port 9000, set this value to: hdfs://namenode.example.org:9000/hbase. By default, we write to whatever ${hbase.tmp.dir} is set too -- usually /tmp -- so change this configuration or else all data will be lost on machine restart.Default: ${hbase.tmp.dir}/hbase"},{heading:"hbaseclusterdistributed-toc",content:"Description: The mode the cluster will be in. Possible values are false for standalone mode and true for distributed mode. If false, startup will run all HBase and ZooKeeper daemons together in the one JVM.Default: false"},{heading:"hbasezookeeperquorum-toc",content:'Description: Comma separated list of servers in the ZooKeeper ensemble (This config. should have been named hbase.zookeeper.ensemble). For example, "host1.mydomain.com,host2.mydomain.com,host3.mydomain.com". By default this is set to localhost for local and pseudo-distributed modes of operation. For a fully-distributed setup, this should be set to a full list of ZooKeeper ensemble servers. If HBASE_MANAGES_ZK is set in hbase-env.sh this is the list of servers which hbase will start/stop ZooKeeper on as part of cluster start/stop. Client-side, we will take this list of ensemble members and put it together with the hbase.zookeeper.property.clientPort config. and pass it into zookeeper constructor as the connectString parameter.Default: 127.0.0.1'},{heading:"zookeeperrecoveryretrymaxsleeptime-toc",content:"Description: Max sleep time before retry zookeeper operations in milliseconds, a max time is needed here so that sleep time won't grow unboundedlyDefault: 60000"},{heading:"hbaselocaldir-toc",content:"Description: Directory on the local filesystem to be used as a local storage.Default: ${hbase.tmp.dir}/local/"},{heading:"hbasemasterport-toc",content:"Description: The port the HBase Master should bind to.Default: 16000"},{heading:"hbasemasterinfoport-toc",content:"Description: The port for the HBase Master web UI. Set to -1 if you do not want a UI instance run.Default: 16010"},{heading:"hbasemasterinfobindaddress-toc",content:"Description: The bind address for the HBase Master web UIDefault: 0.0.0.0"},{heading:"hbasemasterlogcleanerplugins-toc",content:"Description: A comma-separated list of BaseLogCleanerDelegate invoked by the LogsCleaner service. These WAL cleaners are called in order, so put the cleaner that prunes the most files in front. To implement your own BaseLogCleanerDelegate, just put it in HBase's classpath and add the fully qualified class name here. Always add the above default log cleaners in the list.Default: org.apache.hadoop.hbase.master.cleaner.TimeToLiveLogCleaner,org.apache.hadoop.hbase.master.cleaner.TimeToLiveProcedureWALCleaner,org.apache.hadoop.hbase.master.cleaner.TimeToLiveMasterLocalStoreWALCleaner"},{heading:"hbasemasterlogcleanerttl-toc",content:"Description: How long a WAL remain in the archive ({hbase.rootdir}/oldWALs) directory, after which it will be cleaned by a Master thread. The value is in milliseconds.Default: 600000"},{heading:"hbasemasterhfilecleanerplugins-toc",content:"Description: A comma-separated list of BaseHFileCleanerDelegate invoked by the HFileCleaner service. These HFiles cleaners are called in order, so put the cleaner that prunes the most files in front. To implement your own BaseHFileCleanerDelegate, just put it in HBase's classpath and add the fully qualified class name here. Always add the above default hfile cleaners in the list as they will be overwritten in hbase-site.xml.Default: org.apache.hadoop.hbase.master.cleaner.TimeToLiveHFileCleaner,org.apache.hadoop.hbase.master.cleaner.TimeToLiveMasterLocalStoreHFileCleaner"},{heading:"hbasemasterinfoserverredirect-toc",content:"Description: Whether or not the Master listens to the Master web UI port (hbase.master.info.port) and redirects requests to the web UI server shared by the Master and RegionServer. Config. makes sense when Master is serving Regions (not the default).Default: true"},{heading:"hbasemasterfilesplittimeout-toc",content:"Description: Splitting a region, how long to wait on the file-splitting step before aborting the attempt. Default: 600000. This setting used to be known as hbase.regionserver.fileSplitTimeout in hbase-1.x. Split is now run master-side hence the rename (If a 'hbase.master.fileSplitTimeout' setting found, will use it to prime the current 'hbase.master.fileSplitTimeout' Configuration.Default: 600000"},{heading:"hbaseregionserverport-toc",content:"Description: The port the HBase RegionServer binds to.Default: 16020"},{heading:"hbaseregionserverinfoport-toc",content:"Description: The port for the HBase RegionServer web UI Set to -1 if you do not want the RegionServer UI to run.Default: 16030"},{heading:"hbaseregionserverinfobindaddress-toc",content:"Description: The address for the HBase RegionServer web UIDefault: 0.0.0.0"},{heading:"hbaseregionserverinfoportauto-toc",content:"Description: Whether or not the Master or RegionServer UI should search for a port to bind to. Enables automatic port search if hbase.regionserver.info.port is already in use. Useful for testing, turned off by default.Default: false"},{heading:"hbaseregionserverhandlercount-toc",content:"Description: Count of RPC Listener instances spun up on RegionServers. Same property is used by the Master for count of master handlers. Too many handlers can be counter-productive. Make it a multiple of CPU count. If mostly read-only, handlers count close to cpu count does well. Start with twice the CPU count and tune from there.Default: 30"},{heading:"hbaseipcservercallqueuehandlerfactor-toc",content:"Description: Factor to determine the number of call queues. A value of 0 means a single queue shared between all the handlers. A value of 1 means that each handler has its own queue.Default: 0.1"},{heading:"hbaseipcservercallqueuereadratio-toc",content:"Description: Split the call queues into read and write queues. The specified interval (which should be between 0.0 and 1.0) will be multiplied by the number of call queues. A value of 0 indicate to not split the call queues, meaning that both read and write requests will be pushed to the same set of queues. A value lower than 0.5 means that there will be less read queues than write queues. A value of 0.5 means there will be the same number of read and write queues. A value greater than 0.5 means that there will be more read queues than write queues. A value of 1.0 means that all the queues except one are used to dispatch read requests. Example: Given the total number of call queues being 10 a read.ratio of 0 means that: the 10 queues will contain both read/write requests. a read.ratio of 0.3 means that: 3 queues will contain only read requests and 7 queues will contain only write requests. a read.ratio of 0.5 means that: 5 queues will contain only read requests and 5 queues will contain only write requests. a read.ratio of 0.8 means that: 8 queues will contain only read requests and 2 queues will contain only write requests. a read.ratio of 1 means that: 9 queues will contain only read requests and 1 queues will contain only write requests.Default: 0"},{heading:"hbaseipcservercallqueuescanratio-toc",content:"Description: Given the number of read call queues, calculated from the total number of call queues multiplied by the callqueue.read.ratio, the scan.ratio property will split the read call queues into small-read and long-read queues. A value lower than 0.5 means that there will be less long-read queues than short-read queues. A value of 0.5 means that there will be the same number of short-read and long-read queues. A value greater than 0.5 means that there will be more long-read queues than short-read queues A value of 0 or 1 indicate to use the same set of queues for gets and scans. Example: Given the total number of read call queues being 8 a scan.ratio of 0 or 1 means that: 8 queues will contain both long and short read requests. a scan.ratio of 0.3 means that: 2 queues will contain only long-read requests and 6 queues will contain only short-read requests. a scan.ratio of 0.5 means that: 4 queues will contain only long-read requests and 4 queues will contain only short-read requests. a scan.ratio of 0.8 means that: 6 queues will contain only long-read requests and 2 queues will contain only short-read requests.Default: 0"},{heading:"hbaseregionservermsginterval-toc",content:"Description: Interval between messages from the RegionServer to Master in milliseconds.Default: 3000"},{heading:"hbaseregionserverlogrollperiod-toc",content:"Description: Period at which we will roll the commit log regardless of how many edits it has.Default: 3600000"},{heading:"hbaseregionserverlogrollerrorstolerated-toc",content:"Description: The number of consecutive WAL close errors we will allow before triggering a server abort. A setting of 0 will cause the region server to abort if closing the current WAL writer fails during log rolling. Even a small value (2 or 3) will allow a region server to ride over transient HDFS errors.Default: 2"},{heading:"hbaseregionserverfreeheapminmemorysize-toc",content:"Description: Defines the minimum amount of heap memory that must remain free for the RegionServer to start, specified in bytes or human-readable formats like '512m' for megabytes or '4g' for gigabytes. If not set, the default is 20% of the total heap size. To disable the check entirely, set this value to 0. If the combined memory usage of memstore and block cache exceeds (total heap - this value), the RegionServer will fail to start.Default: (empty)"},{heading:"hbaseregionserverglobalmemstoresize-toc",content:"Description: Maximum size of all memstores in a region server before new updates are blocked and flushes are forced. Defaults to 40% of heap (0.4). Updates are blocked and flushes are forced until size of all memstores in a region server hits hbase.regionserver.global.memstore.size.lower.limit. The default value in this configuration has been intentionally left empty in order to honor the old hbase.regionserver.global.memstore.upperLimit property if present.Default: (empty)"},{heading:"hbaseregionserverglobalmemstorememorysize-toc",content:"Description: Maximum size of all memstores in a region server before new updates are blocked and flushes are forced, specified in bytes or human-readable formats like '10m' for megabytes or '10g' for gigabytes. This configuration allows setting an absolute memory size instead of a percentage of the maximum heap. Takes precedence over hbase.regionserver.global.memstore.size if both are specified.Default: (empty)"},{heading:"hbaseregionserverglobalmemstoresizelowerlimit-toc",content:"Description: Maximum size of all memstores in a region server before flushes are forced. Defaults to 95% of hbase.regionserver.global.memstore.size (0.95). A 100% value for this value causes the minimum possible flushing to occur when updates are blocked due to memstore limiting. The default value in this configuration has been intentionally left empty in order to honor the old hbase.regionserver.global.memstore.lowerLimit property if present.Default: (empty)"},{heading:"hbasesystemtablescompactingmemstoretype-toc",content:"Description: Determines the type of memstore to be used for system tables like META, namespace tables etc. By default NONE is the type and hence we use the default memstore for all the system tables. If we need to use compacting memstore for system tables then set this property to BASIC/EAGERDefault: NONE"},{heading:"hbaseregionserveroptionalcacheflushinterval-toc",content:"Description: Maximum amount of time an edit lives in memory before being automatically flushed. Default 1 hour. Set it to 0 to disable automatic flushing.Default: 3600000"},{heading:"hbaseregionserverdnsinterface-toc",content:"Description: The name of the Network Interface from which a region server should report its IP address.Default: default"},{heading:"hbaseregionserverdnsnameserver-toc",content:"Description: The host name or IP address of the name server (DNS) which a region server should use to determine the host name used by the master for communication and display purposes.Default: default"},{heading:"hbaseregionserverregionsplitpolicy-toc",content:"Description: A split policy determines when a region should be split. The various other split policies that are available currently are BusyRegionSplitPolicy, ConstantSizeRegionSplitPolicy, DisabledRegionSplitPolicy, DelimitedKeyPrefixRegionSplitPolicy, KeyPrefixRegionSplitPolicy, and SteppingSplitPolicy. DisabledRegionSplitPolicy blocks manual region splitting.Default: org.apache.hadoop.hbase.regionserver.SteppingSplitPolicy"},{heading:"hbaseregionserverregionsplitlimit-toc",content:"Description: Limit for the number of regions after which no more region splitting should take place. This is not hard limit for the number of regions but acts as a guideline for the regionserver to stop splitting after a certain limit. Default is set to 1000.Default: 1000"},{heading:"zookeepersessiontimeout-toc",content:"Description: ZooKeeper session timeout in milliseconds. It is used in two different ways. First, this value is used in the ZK client that HBase uses to connect to the ensemble. It is also used by HBase when it starts a ZK server and it is passed as the 'maxSessionTimeout'. See https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#ch_zkSessions. For example, if an HBase region server connects to a ZK ensemble that's also managed by HBase, then the session timeout will be the one specified by this configuration. But, a region server that connects to an ensemble managed with a different configuration will be subjected that ensemble's maxSessionTimeout. So, even though HBase might propose using 90 seconds, the ensemble can have a max timeout lower than this and it will take precedence. The current default maxSessionTimeout that ZK ships with is 40 seconds, which is lower than HBase's.Default: 90000"},{heading:"zookeeperznodeparent-toc",content:"Description: Root ZNode for HBase in ZooKeeper. All of HBase's ZooKeeper files that are configured with a relative path will go under this node. By default, all of HBase's ZooKeeper file paths are configured with a relative path, so they will all go under this directory unless changed.Default: /hbase"},{heading:"zookeeperznodeaclparent-toc",content:"Description: Root ZNode for access control lists.Default: acl"},{heading:"hbasezookeeperdnsinterface-toc",content:"Description: The name of the Network Interface from which a ZooKeeper server should report its IP address.Default: default"},{heading:"hbasezookeeperdnsnameserver-toc",content:"Description: The host name or IP address of the name server (DNS) which a ZooKeeper server should use to determine the host name used by the master for communication and display purposes.Default: default"},{heading:"hbasezookeeperpeerport-toc",content:"Description: Port used by ZooKeeper peers to talk to each other. See https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html#sc_RunningReplicatedZooKeeper for more information.Default: 2888"},{heading:"hbasezookeeperleaderport-toc",content:"Description: Port used by ZooKeeper for leader election. See https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html#sc_RunningReplicatedZooKeeper for more information.Default: 3888"},{heading:"hbasezookeeperpropertyinitlimit-toc",content:"Description: Property from ZooKeeper's config zoo.cfg. The number of ticks that the initial synchronization phase can take.Default: 10"},{heading:"hbasezookeeperpropertysynclimit-toc",content:"Description: Property from ZooKeeper's config zoo.cfg. The number of ticks that can pass between sending a request and getting an acknowledgment.Default: 5"},{heading:"hbasezookeeperpropertydatadir-toc",content:"Description: Property from ZooKeeper's config zoo.cfg. The directory where the snapshot is stored.Default: ${hbase.tmp.dir}/zookeeper"},{heading:"hbasezookeeperpropertyclientport-toc",content:"Description: Property from ZooKeeper's config zoo.cfg. The port at which the clients will connect.Default: 2181"},{heading:"hbasezookeeperpropertymaxclientcnxns-toc",content:"Description: Property from ZooKeeper's config zoo.cfg. Limit on number of concurrent connections (at the socket level) that a single client, identified by IP address, may make to a single member of the ZooKeeper ensemble. Set high to avoid zk connection issues running standalone and pseudo-distributed.Default: 300"},{heading:"hbaseclientwritebuffer-toc",content:"Description: Default size of the BufferedMutator write buffer in bytes. A bigger buffer takes more memory -- on both the client and server side since server instantiates the passed write buffer to process it -- but a larger buffer size reduces the number of RPCs made. For an estimate of server-side memory-used, evaluate hbase.client.write.buffer * hbase.regionserver.handler.countDefault: 2097152"},{heading:"hbaseclientpause-toc",content:"Description: General client pause value. Used mostly as value to wait before running a retry of a failed get, region lookup, etc. See hbase.client.retries.number for description of how we backoff from this initial pause amount and how this pause works w/ retries.Default: 100"},{heading:"hbaseclientpauseserveroverloaded-toc",content:"Description: Pause time when encountering an exception indicating a server is overloaded, CallQueueTooBigException or CallDroppedException. Set this property to a higher value than hbase.client.pause if you observe frequent CallQueueTooBigException or CallDroppedException from the same RegionServer and the call queue there keeps filling up. This config used to be called hbase.client.pause.cqtbe, which has been deprecated as of 2.5.0.Default: (empty)"},{heading:"hbaseclientretriesnumber-toc",content:"Description: Maximum retries. Used as maximum for all retryable operations such as the getting of a cell's value, starting a row update, etc. Retry interval is a rough function based on hbase.client.pause. At first we retry at this interval but then with backoff, we pretty quickly reach retrying every ten seconds. See HConstants#RETRY_BACKOFF for how the backup ramps up. Change this setting and hbase.client.pause to suit your workload.Default: 15"},{heading:"hbaseclientmaxtotaltasks-toc",content:"Description: The maximum number of concurrent mutation tasks a single HTable instance will send to the cluster.Default: 100"},{heading:"hbaseclientmaxperservertasks-toc",content:"Description: The maximum number of concurrent mutation tasks a single HTable instance will send to a single region server.Default: 2"},{heading:"hbaseclientmaxperregiontasks-toc",content:"Description: The maximum number of concurrent mutation tasks the client will maintain to a single Region. That is, if there is already hbase.client.max.perregion.tasks writes in progress for this region, new puts won't be sent to this region until some writes finishes.Default: 1"},{heading:"hbaseclientperserverrequeststhreshold-toc",content:"Description: The max number of concurrent pending requests for one server in all client threads (process level). Exceeding requests will be thrown ServerTooBusyException immediately to prevent user's threads being occupied and blocked by only one slow region server. If you use a fix number of threads to access HBase in a synchronous way, set this to a suitable value which is related to the number of threads will help you. See https://issues.apache.org/jira/browse/HBASE-16388 for details.Default: 2147483647"},{heading:"hbaseclientscannercaching-toc",content:"Description: Number of rows that we try to fetch when calling next on a scanner if it is not served from (local, client) memory. This configuration works together with hbase.client.scanner.max.result.size to try and use the network efficiently. The default value is Integer.MAX_VALUE by default so that the network will fill the chunk size defined by hbase.client.scanner.max.result.size rather than be limited by a particular number of rows since the size of rows varies table to table. If you know ahead of time that you will not require more than a certain number of rows from a scan, this configuration should be set to that row limit via Scan#setCaching. Higher caching values will enable faster scanners but will eat up more memory and some calls of next may take longer and longer times when the cache is empty. Do not set this value such that the time between invocations is greater than the scanner timeout; i.e. hbase.client.scanner.timeout.periodDefault: 2147483647"},{heading:"hbaseclientkeyvaluemaxsize-toc",content:"Description: Specifies the combined maximum allowed size of a KeyValue instance. This is to set an upper boundary for a single entry saved in a storage file. Since they cannot be split it helps avoiding that a region cannot be split any further because the data is too large. It seems wise to set this to a fraction of the maximum region size. Setting it to zero or less disables the check.Default: 10485760"},{heading:"hbaseserverkeyvaluemaxsize-toc",content:"Description: Maximum allowed size of an individual cell, inclusive of value and all key components. A value of 0 or less disables the check. The default value is 10MB. This is a safety setting to protect the server from OOM situations.Default: 10485760"},{heading:"hbaseclientscannertimeoutperiod-toc",content:"Description: Client scanner lease period in milliseconds.Default: 60000"},{heading:"hbaseclientlocalitycheckthreadpoolsize-toc",content:"Description:Default: 2"},{heading:"hbasebulkloadretriesnumber-toc",content:"Description: Maximum retries. This is maximum number of iterations to atomic bulk loads are attempted in the face of splitting operations 0 means never give up.Default: 10"},{heading:"hbasecompactionafterbulkloadenable-toc",content:"Description: Request Compaction after bulkload immediately. If bulkload is continuous, the triggered compactions may increase load, bring about performance side effect.Default: false"},{heading:"hbasemasterbalancermaxritpercent-toc",content:"Description: The max percent of regions in transition when balancing. The default value is 1.0. So there are no balancer throttling. If set this config to 0.01, It means that there are at most 1% regions in transition when balancing. Then the cluster's availability is at least 99% when balancing.Default: 1.0"},{heading:"hbasebalancerperiod-toc",content:"Description: Period at which the region balancer runs in the Master, in milliseconds.Default: 300000"},{heading:"hbasemasteroldwalsdirupdaterperiod-toc",content:"Description: Period at which the oldWALs directory size calculator/updater will run in the Master, in milliseconds.Default: 300000"},{heading:"hbaseregionsslop-toc",content:"Description: The load balancer can trigger for several reasons. This value controls one of those reasons. Run the balancer if any regionserver has a region count outside the range of average +/- (average * slop) regions. If the value of slop is negative, disable sloppiness checks. The balancer can still run for other reasons, but sloppiness will not be one of them. If the value of slop is 0, run the balancer if any server has a region count more than 1 from the average. If the value of slop is 100, run the balancer if any server has a region count greater than 101 times the average. The default value of this parameter is 0.2, which runs the balancer if any server has a region count less than 80% of the average, or greater than 120% of the average. Note that for the default StochasticLoadBalancer, this does not guarantee any balancing actions will be taken, but only that the balancer will attempt to run.Default: 0.2"},{heading:"hbasenormalizerperiod-toc",content:"Description: Period at which the region normalizer runs in the Master, in milliseconds.Default: 300000"},{heading:"hbasenormalizersplitenabled-toc",content:"Description: Whether to split a region as part of normalization.Default: true"},{heading:"hbasenormalizermergeenabled-toc",content:"Description: Whether to merge a region as part of normalization.Default: true"},{heading:"hbasenormalizermergeminregioncount-toc",content:"Description: The minimum number of regions in a table to consider it for merge normalization.Default: 3"},{heading:"hbasenormalizermergemin_region_agedays-toc",content:"Description: The minimum age for a region to be considered for a merge, in days.Default: 3"},{heading:"hbasenormalizermergemin_region_sizemb-toc",content:"Description: The minimum size for a region to be considered for a merge, in whole MBs.Default: 1"},{heading:"hbasenormalizermergemerge_request_max_number_of_regions-toc",content:"Description: The maximum number of region count in a merge request for merge normalization.Default: 100"},{heading:"hbasetablenormalizationenabled-toc",content:"Description: This config is used to set default behaviour of normalizer at table level. To override this at table level one can set NORMALIZATION_ENABLED at table descriptor level and that property will be honoredDefault: false"},{heading:"hbaseserverthreadwakefrequency-toc",content:"Description: In master side, this config is the period used for FS related behaviors: checking if hdfs is out of safe mode, setting or checking hbase.version file, setting or checking hbase.id file. Using default value should be fine. In regionserver side, this config is used in several places: flushing check interval, compaction check interval, wal rolling check interval. Specially, admin can tune flushing and compaction check interval by hbase.regionserver.flush.check.period and hbase.regionserver.compaction.check.period. (in milliseconds)Default: 10000"},{heading:"hbaseregionserverflushcheckperiod-toc",content:"Description: It determines the flushing check period of PeriodicFlusher in regionserver. If unset, it uses hbase.server.thread.wakefrequency as default value. (in milliseconds)Default: ${hbase.server.thread.wakefrequency}"},{heading:"hbaseregionservercompactioncheckperiod-toc",content:"Description: It determines the compaction check period of CompactionChecker in regionserver. If unset, it uses hbase.server.thread.wakefrequency as default value. (in milliseconds)Default: ${hbase.server.thread.wakefrequency}"},{heading:"hbaseserverversionfilewriteattempts-toc",content:"Description: How many times to retry attempting to write a version file before just aborting. Each attempt is separated by the hbase.server.thread.wakefrequency milliseconds.Default: 3"},{heading:"hbasehregionmemstoreflushsize-toc",content:"Description: Memstore will be flushed to disk if size of the memstore exceeds this number of bytes. Value is checked by a thread that runs every hbase.server.thread.wakefrequency.Default: 134217728"},{heading:"hbasehregionpercolumnfamilyflushsizelowerboundmin-toc",content:'Description: If FlushLargeStoresPolicy is used and there are multiple column families, then every time that we hit the total memstore limit, we find out all the column families whose memstores exceed a "lower bound" and only flush them while retaining the others in memory. The "lower bound" will be "hbase.hregion.memstore.flush.size / column_family_number" by default unless value of this property is larger than that. If none of the families have their memstore size more than lower bound, all the memstores will be flushed (just as usual).Default: 16777216'},{heading:"hbasehregionprecloseflushsize-toc",content:'Description: If the memstores in a region are this size or larger when we go to close, run a "pre-flush" to clear out memstores before we put up the region closed flag and take the region offline. On close, a flush is run under the close flag to empty memory. During this time the region is offline and we are not taking on any writes. If the memstore content is large, this flush could take a long time to complete. The preflush is meant to clean out the bulk of the memstore before putting up the close flag and taking the region offline so the flush that runs under the close flag has little to do.Default: 5242880'},{heading:"hbasehregionmemstoreblockmultiplier-toc",content:"Description: Block updates if memstore has hbase.hregion.memstore.block.multiplier times hbase.hregion.memstore.flush.size bytes. Useful preventing runaway memstore during spikes in update traffic. Without an upper-bound, memstore fills such that when it flushes the resultant flush files take a long time to compact or split, or worse, we OOME.Default: 4"},{heading:"hbasehregionmemstoremslabenabled-toc",content:"Description: Enables the MemStore-Local Allocation Buffer, a feature which works to prevent heap fragmentation under heavy write loads. This can reduce the frequency of stop-the-world GC pauses on large heaps.Default: true"},{heading:"hbasehregionmemstoremslabchunksize-toc",content:"Description: The maximum byte size of a chunk in the MemStoreLAB. Unit: bytesDefault: 2097152"},{heading:"hbaseregionserveroffheapglobalmemstoresize-toc",content:"Description: The amount of off-heap memory all MemStores in a RegionServer may use. A value of 0 means that no off-heap memory will be used and all chunks in MSLAB will be HeapByteBuffer, otherwise the non-zero value means how many megabyte of off-heap memory will be used for chunks in MSLAB and all chunks in MSLAB will be DirectByteBuffer. Unit: megabytes.Default: 0"},{heading:"hbasehregionmemstoremslabmaxallocation-toc",content:"Description: The maximal size of one allocation in the MemStoreLAB, if the desired byte size exceed this threshold then it will be just allocated from JVM heap rather than MemStoreLAB.Default: 262144"},{heading:"hbasehregionmaxfilesize-toc",content:"Description: Maximum file size. If the sum of the sizes of a region's HFiles has grown to exceed this value, the region is split in two. There are two choices of how this option works, the first is when any store's size exceed the threshold then split, and the other is overall region's size exceed the threshold then split, it can be configed by hbase.hregion.split.overallfiles.Default: 10737418240"},{heading:"hbasehregionsplitoverallfiles-toc",content:"Description: If we should sum overall region files size when check to split.Default: true"},{heading:"hbasehregionmajorcompaction-toc",content:"Description: Time between major compactions, expressed in milliseconds. Set to 0 to disable time-based automatic major compactions. User-requested and size-based major compactions will still run. This value is multiplied by hbase.hregion.majorcompaction.jitter to cause compaction to start at a somewhat-random time during a given window of time. The default value is 7 days, expressed in milliseconds. If major compactions are causing disruption in your environment, you can configure them to run at off-peak times for your deployment, or disable time-based major compactions by setting this parameter to 0, and run major compactions in a cron job or by another external mechanism.Default: 604800000"},{heading:"hbasehregionmajorcompactionjitter-toc",content:"Description: A multiplier applied to hbase.hregion.majorcompaction to cause compaction to occur a given amount of time either side of hbase.hregion.majorcompaction. The smaller the number, the closer the compactions will happen to the hbase.hregion.majorcompaction interval.Default: 0.50"},{heading:"hbasehstorecompactionthreshold-toc",content:"Description: If more than or equal to this number of StoreFiles exist in any one Store (one StoreFile is written per flush of MemStore), a compaction is run to rewrite all StoreFiles into a single StoreFile. Larger values delay compaction, but when compaction does occur, it takes longer to complete.Default: 3"},{heading:"hbaseregionservercompactionenabled-toc",content:"Description: Enable/disable compactions on by setting true/false. We can further switch compactions dynamically with the compaction_switch shell command.Default: true"},{heading:"hbasehstoreflushercount-toc",content:"Description: The number of flush threads. With fewer threads, the MemStore flushes will be queued. With more threads, the flushes will be executed in parallel, increasing the load on HDFS, and potentially causing more compactions.Default: 2"},{heading:"hbasehstoreblockingstorefiles-toc",content:"Description: If more than this number of StoreFiles exist in any one Store (one StoreFile is written per flush of MemStore), updates are blocked for this region until a compaction is completed, or until hbase.hstore.blockingWaitTime has been exceeded.Default: 16"},{heading:"hbasehstoreblockingwaittime-toc",content:"Description: The time for which a region will block updates after reaching the StoreFile limit defined by hbase.hstore.blockingStoreFiles. After this time has elapsed, the region will stop blocking updates even if a compaction has not been completed.Default: 90000"},{heading:"hbasehstorecompactionmin-toc",content:"Description: The minimum number of StoreFiles which must be eligible for compaction before compaction can run. The goal of tuning hbase.hstore.compaction.min is to avoid ending up with too many tiny StoreFiles to compact. Setting this value to 2 would cause a minor compaction each time you have two StoreFiles in a Store, and this is probably not appropriate. If you set this value too high, all the other values will need to be adjusted accordingly. For most cases, the default value is appropriate (empty value here, results in 3 by code logic). In previous versions of HBase, the parameter hbase.hstore.compaction.min was named hbase.hstore.compactionThreshold.Default: (empty)"},{heading:"hbasehstorecompactionmax-toc",content:"Description: The maximum number of StoreFiles which will be selected for a single minor compaction, regardless of the number of eligible StoreFiles. Effectively, the value of hbase.hstore.compaction.max controls the length of time it takes a single compaction to complete. Setting it larger means that more StoreFiles are included in a compaction. For most cases, the default value is appropriate.Default: 10"},{heading:"hbasehstorecompactionminsize-toc",content:'Description: A StoreFile (or a selection of StoreFiles, when using ExploringCompactionPolicy) smaller than this size will always be eligible for minor compaction. HFiles this size or larger are evaluated by hbase.hstore.compaction.ratio to determine if they are eligible. Because this limit represents the "automatic include" limit for all StoreFiles smaller than this value, this value may need to be reduced in write-heavy environments where many StoreFiles in the 1-2 MB range are being flushed, because every StoreFile will be targeted for compaction and the resulting StoreFiles may still be under the minimum size and require further compaction. If this parameter is lowered, the ratio check is triggered more quickly. This addressed some issues seen in earlier versions of HBase but changing this parameter is no longer necessary in most situations. Default: 128 MB expressed in bytes.Default: 134217728'},{heading:"hbasehstorecompactionmaxsize-toc",content:"Description: A StoreFile (or a selection of StoreFiles, when using ExploringCompactionPolicy) larger than this size will be excluded from compaction. The effect of raising hbase.hstore.compaction.max.size is fewer, larger StoreFiles that do not get compacted often. If you feel that compaction is happening too often without much benefit, you can try raising this value. Default: the value of LONG.MAX_VALUE, expressed in bytes.Default: 9223372036854775807"},{heading:"hbasehstorecompactionratio-toc",content:"Description: For minor compaction, this ratio is used to determine whether a given StoreFile which is larger than hbase.hstore.compaction.min.size is eligible for compaction. Its effect is to limit compaction of large StoreFiles. The value of hbase.hstore.compaction.ratio is expressed as a floating-point decimal. A large ratio, such as 10, will produce a single giant StoreFile. Conversely, a low value, such as .25, will produce behavior similar to the BigTable compaction algorithm, producing four StoreFiles. A moderate value of between 1.0 and 1.4 is recommended. When tuning this value, you are balancing write costs with read costs. Raising the value (to something like 1.4) will have more write costs, because you will compact larger StoreFiles. However, during reads, HBase will need to seek through fewer StoreFiles to accomplish the read. Consider this approach if you cannot take advantage of Bloom filters. Otherwise, you can lower this value to something like 1.0 to reduce the background cost of writes, and use Bloom filters to control the number of StoreFiles touched during reads. For most cases, the default value is appropriate.Default: 1.2F"},{heading:"hbasehstorecompactionratiooffpeak-toc",content:"Description: Allows you to set a different (by default, more aggressive) ratio for determining whether larger StoreFiles are included in compactions during off-peak hours. Works in the same way as hbase.hstore.compaction.ratio. Only applies if hbase.offpeak.start.hour and hbase.offpeak.end.hour are also enabled.Default: 5.0F"},{heading:"hbasehstoretimetopurgedeletes-toc",content:"Description: The amount of time to delay purging of delete markers with future timestamps. If unset, or set to 0, all delete markers, including those with future timestamps, are purged during the next major compaction. Otherwise, a delete marker is kept until the major compaction which occurs after the marker's timestamp plus the value of this setting, in milliseconds.Default: 0"},{heading:"hbaseoffpeakstarthour-toc",content:"Description: The start of off-peak hours, expressed as an integer between 0 and 23, inclusive. Set to -1 to disable off-peak.Default: -1"},{heading:"hbaseoffpeakendhour-toc",content:"Description: The end of off-peak hours, expressed as an integer between 0 and 23, inclusive. Set to -1 to disable off-peak.Default: -1"},{heading:"hbaseregionserverthreadcompactionthrottle-toc",content:"Description: There are two different thread pools for compactions, one for large compactions and the other for small compactions. This helps to keep compaction of lean tables (such as hbase:meta) fast. If a compaction is larger than this threshold, it goes into the large compaction pool. In most cases, the default value is appropriate. Default: 2 x hbase.hstore.compaction.max x hbase.hregion.memstore.flush.size (which defaults to 128MB). The value field assumes that the value of hbase.hregion.memstore.flush.size is unchanged from the default.Default: 2684354560"},{heading:"hbaseregionservermajorcompactionpagecachedrop-toc",content:"Description: Specifies whether to drop pages read/written into the system page cache by major compactions. Setting it to true helps prevent major compactions from polluting the page cache, which is almost always required, especially for clusters with low/moderate memory to storage ratio.Default: true"},{heading:"hbaseregionserverminorcompactionpagecachedrop-toc",content:"Description: Specifies whether to drop pages read/written into the system page cache by minor compactions. Setting it to true helps prevent minor compactions from polluting the page cache, which is most beneficial on clusters with low memory to storage ratio or very write heavy clusters. You may want to set it to false under moderate to low write workload when bulk of the reads are on the most recently written data.Default: true"},{heading:"hbasehstorecompactionkvmax-toc",content:"Description: The maximum number of KeyValues to read and then write in a batch when flushing or compacting. Set this lower if you have big KeyValues and problems with Out Of Memory Exceptions Set this higher if you have wide, small rows.Default: 10"},{heading:"hbasestorescannerparallelseekenable-toc",content:"Description: Enables StoreFileScanner parallel-seeking in StoreScanner, a feature which can reduce response latency under special conditions.Default: false"},{heading:"hbasestorescannerparallelseekthreads-toc",content:"Description: The default thread pool size if parallel-seeking feature enabled.Default: 10"},{heading:"hfileblockcachepolicy-toc",content:"Description: The eviction policy for the L1 block cache (LRU or TinyLFU).Default: LRU"},{heading:"hfileblockcachesize-toc",content:"Description: Percentage of maximum heap (-Xmx setting) to allocate to block cache used by a StoreFile. Default of 0.4 means allocate 40%. Set to 0 to disable but it's not recommended; you need at least enough cache to hold the storefile indices.Default: 0.4"},{heading:"hfileblockcachememorysize-toc",content:"Description: Defines the maximum heap memory allocated for the HFile block cache, specified in bytes or human-readable formats like '10m' for megabytes or '10g' for gigabytes. This configuration allows setting an absolute memory size instead of a percentage of the maximum heap. Takes precedence over hfile.block.cache.size if both are specified.Default: (empty)"},{heading:"hfileblockindexcacheonwrite-toc",content:"Description: This allows to put non-root multi-level index blocks into the block cache at the time the index is being written.Default: false"},{heading:"hfileindexblockmaxsize-toc",content:"Description: When the size of a leaf-level, intermediate-level, or root-level index block in a multi-level block index grows to this size, the block is written out and a new block is started.Default: 131072"},{heading:"hbasebucketcacheioengine-toc",content:"Description: Where to store the contents of the bucketcache. One of: offheap, file, files, mmap or pmem. If a file or files, set it to file(s):PATH_TO_FILE. mmap means the content will be in an mmaped file. Use mmap:PATH_TO_FILE. 'pmem' is bucket cache over a file on the persistent memory device. Use pmem:PATH_TO_FILE. See https://hbase.apache.org/docs/architecture/regionserver#off-heap-block-cache for more information.Default: (empty)"},{heading:"hbasehstorecompactionthroughputlowerbound-toc",content:"Description: The target lower bound on aggregate compaction throughput, in bytes/sec. Allows you to tune the minimum available compaction throughput when the PressureAwareCompactionThroughputController throughput controller is active. (It is active by default.)Default: 52428800"},{heading:"hbasehstorecompactionthroughputhigherbound-toc",content:"Description: The target upper bound on aggregate compaction throughput, in bytes/sec. Allows you to control aggregate compaction throughput demand when the PressureAwareCompactionThroughputController throughput controller is active. (It is active by default.) The maximum throughput will be tuned between the lower and upper bounds when compaction pressure is within the range [0.0, 1.0]. If compaction pressure is 1.0 or greater the higher bound will be ignored until pressure returns to the normal range.Default: 104857600"},{heading:"hbasebucketcachesize-toc",content:"Description: It is the total capacity in megabytes of BucketCache. Default: 0.0Default: (empty)"},{heading:"hbasebucketcachebucketsizes-toc",content:"Description: A comma-separated list of sizes for buckets for the bucketcache. Can be multiple sizes. List block sizes in order from smallest to largest. The sizes you use will depend on your data access patterns. Must be a multiple of 256 else you will run into 'java.io.IOException: Invalid HFile block magic' when you go to read from cache. If you specify no values here, then you pick up the default bucketsizes set in code (See BucketAllocator#DEFAULT_BUCKET_SIZES).Default: (empty)"},{heading:"hfileformatversion-toc",content:"Description: The HFile format version to use for new files. Version 3 adds support for tags in hfiles (See https://hbase.apache.org/docs/security/data-access#tags). Also see the configuration 'hbase.replication.rpc.codec'.Default: 3"},{heading:"hfileblockbloomcacheonwrite-toc",content:"Description: Enables cache-on-write for inline blocks of a compound Bloom filter.Default: false"},{heading:"iostorefilebloomblocksize-toc",content:'Description: The size in bytes of a single block ("chunk") of a compound Bloom filter. This size is approximate, because Bloom blocks can only be inserted at data block boundaries, and the number of keys per data block varies.Default: 131072'},{heading:"hbaserscacheblocksonwrite-toc",content:"Description: Whether an HFile block should be added to the block cache when the block is finished.Default: false"},{heading:"hbaserpctimeout-toc",content:"Description: This is for the RPC layer to define how long (millisecond) HBase client applications take for a remote call to time out. It uses pings to check connections but will eventually throw a TimeoutException.Default: 60000"},{heading:"hbaseclientoperationtimeout-toc",content:"Description: Operation timeout is a top-level restriction (millisecond) that makes sure a blocking operation in Table will not be blocked more than this. In each operation, if rpc request fails because of timeout or other reason, it will retry until success or throw RetriesExhaustedException. But if the total time being blocking reach the operation timeout before retries exhausted, it will break early and throw SocketTimeoutException.Default: 1200000"},{heading:"hbaseclientconnectionmetacacheinvalidate-intervalms-toc",content:"Description: Interval in milliseconds of checking and invalidating meta cache when table disabled or dropped, when set to zero means disable checking, suggest set it to 24h or a higher value, because disable/delete table usually not very frequently.Default: 0"},{heading:"hbasecellsscannedperheartbeatcheck-toc",content:"Description: The number of cells scanned in between heartbeat checks. Heartbeat checks occur during the processing of scans to determine whether or not the server should stop scanning in order to send back a heartbeat message to the client. Heartbeat messages are used to keep the client-server connection alive during long running scans. Small values mean that the heartbeat checks will occur more often and thus will provide a tighter bound on the execution time of the scan. Larger values mean that the heartbeat checks occur less frequentlyDefault: 10000"},{heading:"hbaserpcshortoperationtimeout-toc",content:`Description: This is another version of "hbase.rpc.timeout". For those RPC operation within cluster, we rely on this configuration to set a short timeout limitation for short operation. For example, short rpc timeout for region server's trying to report to active master can benefit quicker master failover process.Default: 10000`},{heading:"hbaseipcclienttcpnodelay-toc",content:"Description: Set no delay on rpc socket connections. See http://docs.oracle.com/javase/1.5.0/docs/api/java/net/Socket.html#getTcpNoDelay()Default: true"},{heading:"hbaseunsaferegionserverhostname-toc",content:"Description: This config is for experts: don't set its value unless you really know what you are doing. When set to a non-empty value, this represents the (external facing) hostname for the underlying server. See https://issues.apache.org/jira/browse/HBASE-12954 for details.Default: (empty)"},{heading:"hbaseunsaferegionserverhostnamedisablemasterreversedns-toc",content:"Description: This config is for experts: don't set its value unless you really know what you are doing. When set to true, regionserver will use the current node hostname for the servername and HMaster will skip reverse DNS lookup and use the hostname sent by regionserver instead. Note that this config and hbase.unsafe.regionserver.hostname are mutually exclusive. See https://issues.apache.org/jira/browse/HBASE-18226 for more details.Default: false"},{heading:"hbasemasterkeytabfile-toc",content:"Description: Full path to the kerberos keytab file to use for logging in the configured HMaster server principal.Default: (empty)"},{heading:"hbasemasterkerberosprincipal-toc",content:'Description: Ex. "hbase/_HOST@EXAMPLE.COM". The kerberos principal name that should be used to run the HMaster process. The principal name should be in the form: user/hostname@DOMAIN. If "_HOST" is used as the hostname portion, it will be replaced with the actual hostname of the running instance.Default: (empty)'},{heading:"hbaseregionserverkeytabfile-toc",content:"Description: Full path to the kerberos keytab file to use for logging in the configured HRegionServer server principal.Default: (empty)"},{heading:"hbaseregionserverkerberosprincipal-toc",content:'Description: Ex. "hbase/_HOST@EXAMPLE.COM". The kerberos principal name that should be used to run the HRegionServer process. The principal name should be in the form: user/hostname@DOMAIN. If "_HOST" is used as the hostname portion, it will be replaced with the actual hostname of the running instance. An entry for this principal must exist in the file specified in hbase.regionserver.keytab.fileDefault: (empty)'},{heading:"hadooppolicyfile-toc",content:"Description: The policy configuration file used by RPC servers to make authorization decisions on client requests. Only used when HBase security is enabled.Default: hbase-policy.xml"},{heading:"hbasesuperuser-toc",content:'Description: List of users or groups (comma-separated), who are allowed full privileges, regardless of stored ACLs, across the cluster. Only used when HBase security is enabled. Group names should be prefixed with "@".Default: (empty)'},{heading:"hbaseauthkeyupdateinterval-toc",content:"Description: The update interval for master key for authentication tokens in servers in milliseconds. Only used when HBase security is enabled.Default: 86400000"},{heading:"hbaseauthtokenmaxlifetime-toc",content:"Description: The maximum lifetime in milliseconds after which an authentication token expires. Only used when HBase security is enabled.Default: 604800000"},{heading:"hbaseipcclientfallback-to-simple-auth-allowed-toc",content:"Description: When a client is configured to attempt a secure connection, but attempts to connect to an insecure server, that server may instruct the client to switch to SASL SIMPLE (unsecure) authentication. This setting controls whether or not the client will accept this instruction from the server. When false (the default), the client will not allow the fallback to SIMPLE authentication, and will abort the connection.Default: false"},{heading:"hbaseipcserverfallback-to-simple-auth-allowed-toc",content:"Description: When a server is configured to require secure connections, it will reject connection attempts from clients using SASL SIMPLE (unsecure) authentication. This setting allows secure servers to accept SASL SIMPLE connections from clients when the client requests. When false (the default), the server will not allow the fallback to SIMPLE authentication, and will reject the connection. WARNING: This setting should ONLY be used as a temporary measure while converting clients over to secure authentication. It MUST BE DISABLED for secure operation.Default: false"},{heading:"hbaseunsafeclientkerberoshostnamedisablereversedns-toc",content:"Description: This config is for experts: don't set its value unless you really know what you are doing. When set to true, HBase client using SASL Kerberos will skip reverse DNS lookup and use provided hostname of the destination for the principal instead. See https://issues.apache.org/jira/browse/HBASE-25665 for more details.Default: false"},{heading:"hbasedisplaykeys-toc",content:"Description: When this is set to true the webUI and such will display all start/end keys as part of the table details, region names, etc. When this is set to false, the keys are hidden.Default: true"},{heading:"hbasecoprocessorenabled-toc",content:"Description: Enables or disables coprocessor loading. If 'false' (disabled), any other coprocessor related configuration will be ignored.Default: true"},{heading:"hbasecoprocessoruserenabled-toc",content:`Description: Enables or disables user (aka. table) coprocessor loading. If 'false' (disabled), any table coprocessor attributes in table descriptors will be ignored. If "hbase.coprocessor.enabled" is 'false' this setting has no effect.Default: true`},{heading:"hbasecoprocessorregionclasses-toc",content:"Description: A comma-separated list of region observer or endpoint coprocessors that are loaded by default on all tables. For any override coprocessor method, these classes will be called in order. After implementing your own Coprocessor, add it to HBase's classpath and add the fully qualified class name here. A coprocessor can also be loaded on demand by setting HTableDescriptor or the HBase shell.Default: (empty)"},{heading:"hbasecoprocessormasterclasses-toc",content:"Description: A comma-separated list of org.apache.hadoop.hbase.coprocessor.MasterObserver coprocessors that are loaded by default on the active HMaster process. For any implemented coprocessor methods, the listed classes will be called in order. After implementing your own MasterObserver, just put it in HBase's classpath and add the fully qualified class name here.Default: (empty)"},{heading:"hbasecoprocessorabortonerror-toc",content:"Description: Set to true to cause the hosting server (master or regionserver) to abort if a coprocessor fails to load, fails to initialize, or throws an unexpected Throwable object. Setting this to false will allow the server to continue execution but the system wide state of the coprocessor in question will become inconsistent as it will be properly executing in only a subset of servers, so this is most useful for debugging only.Default: true"},{heading:"hbaserestport-toc",content:"Description: The port for the HBase REST server.Default: 8080"},{heading:"hbaserestreadonly-toc",content:"Description: Defines the mode the REST server will be started in. Possible values are: false: All HTTP methods are permitted - GET/PUT/POST/DELETE. true: Only the GET method is permitted.Default: false"},{heading:"hbaserestthreadsmax-toc",content:"Description: The maximum number of threads of the REST server thread pool. Threads in the pool are reused to process REST requests. This controls the maximum number of requests processed concurrently. It may help to control the memory used by the REST server to avoid OOM issues. If the thread pool is full, incoming requests will be queued up and wait for some free threads.Default: 100"},{heading:"hbaserestthreadsmin-toc",content:"Description: The minimum number of threads of the REST server thread pool. The thread pool always has at least these number of threads so the REST server is ready to serve incoming requests.Default: 2"},{heading:"hbaserestsupportproxyuser-toc",content:"Description: Enables running the REST server to support proxy-user mode.Default: false"},{heading:"hbasedefaultsforversionskip-toc",content:`Description: Set to true to skip the 'hbase.defaults.for.version' check. Setting this to true can be useful in contexts other than the other side of a maven generation; i.e. running in an IDE. You'll want to set this boolean to true to avoid seeing the RuntimeException complaint: "hbase-default.xml file seems to be for and old version of HBase (\${hbase.version}), this version is X.X.X-SNAPSHOT"Default: false`},{heading:"hbasetablelockenable-toc",content:"Description: Set to true to enable locking the table in zookeeper for schema change operations. Table locking from master prevents concurrent schema modifications to corrupt table state.Default: true"},{heading:"hbasetablemaxrowsize-toc",content:"Description: Maximum size of single row in bytes (default is 1 Gb) for Get'ting or Scan'ning without in-row scan flag set. If row size exceeds this limit RowTooBigException is thrown to client.Default: 1073741824"},{heading:"hbasethriftminworkerthreads-toc",content:'Description: The "core size" of the thread pool. New threads are created on every connection until this many threads are created.Default: 16'},{heading:"hbasethriftmaxworkerthreads-toc",content:"Description: The maximum size of the thread pool. When the pending request queue overflows, new threads are created until their number reaches this number. After that, the server starts dropping connections.Default: 1000"},{heading:"hbasethriftmaxqueuedrequests-toc",content:"Description: The maximum number of pending Thrift connections waiting in the queue. If there are no idle threads in the pool, the server queues requests. Only when the queue overflows, new threads are added, up to hbase.thrift.maxQueuedRequests threads.Default: 1000"},{heading:"hbaseregionserverthriftframed-toc",content:"Description: Use Thrift TFramedTransport on the server side. This is the recommended transport for thrift servers and requires a similar setting on the client side. Changing this to false will select the default transport, vulnerable to DoS when malformed requests are issued due to THRIFT-601.Default: false"},{heading:"hbaseregionserverthriftframedmax_frame_size_in_mb-toc",content:"Description: Default frame size when using framed transport, in MBDefault: 2"},{heading:"hbaseregionserverthriftcompact-toc",content:"Description: Use Thrift TCompactProtocol binary serialization protocol.Default: false"},{heading:"hbaserootdirperms-toc",content:"Description: FS Permissions for the root data subdirectory in a secure (kerberos) setup. When master starts, it creates the rootdir with this permissions or sets the permissions if it does not match.Default: 700"},{heading:"hbasewaldirperms-toc",content:"Description: FS Permissions for the root WAL directory in a secure(kerberos) setup. When master starts, it creates the WAL dir with this permissions or sets the permissions if it does not match.Default: 700"},{heading:"hbasedataumaskenable-toc",content:"Description: Enable, if true, that file permissions should be assigned to the files written by the regionserverDefault: false"},{heading:"hbasedataumask-toc",content:"Description: File permissions that should be used to write data files when hbase.data.umask.enable is trueDefault: 000"},{heading:"hbasesnapshotenabled-toc",content:"Description: Set to true to allow snapshots to be taken / restored / cloned.Default: true"},{heading:"hbasesnapshotrestoretakefailsafesnapshot-toc",content:"Description: Set to true to take a snapshot before the restore operation. The snapshot taken will be used in case of failure, to restore the previous state. At the end of the restore operation this snapshot will be deletedDefault: true"},{heading:"hbasesnapshotrestorefailsafename-toc",content:"Description: Name of the failsafe snapshot taken by the restore operation. You can use the {snapshot.name}, {table.name} and {restore.timestamp} variables to create a name based on what you are restoring.Default: hbase-failsafe-{snapshot.name}-{restore.timestamp}"},{heading:"hbasesnapshotworkingdir-toc",content:"Description: Location where the snapshotting process will occur. The location of the completed snapshots will not change, but the temporary directory where the snapshot process occurs will be set to this location. This can be a separate filesystem than the root directory, for performance increase purposes. See HBASE-21098 for more informationDefault: (empty)"},{heading:"hbaseservercompactcheckerintervalmultiplier-toc",content:"Description: The number that determines how often we scan to see if compaction is necessary. Normally, compactions are done after some events (such as memstore flush), but if region didn't receive a lot of writes for some time, or due to different compaction policies, it may be necessary to check it periodically. The interval between checks is hbase.server.compactchecker.interval.multiplier multiplied by hbase.server.thread.wakefrequency.Default: 1000"},{heading:"hbaseleaserecoverytimeout-toc",content:"Description: How long we wait on dfs lease recovery in total before giving up.Default: 900000"},{heading:"hbaseleaserecoverydfstimeout-toc",content:"Description: How long between dfs recover lease invocations. Should be larger than the sum of the time it takes for the namenode to issue a block recovery command as part of datanode; dfs.heartbeat.interval and the time it takes for the primary datanode, performing block recovery to timeout on a dead datanode; usually dfs.client.socket-timeout. See the end of HBASE-8389 for more.Default: 64000"},{heading:"hbasecolumnmaxversion-toc",content:"Description: New column family descriptors will use this value as the default number of versions to keep.Default: 1"},{heading:"dfsclientreadshortcircuit-toc",content:"Description: If set to true, this configuration parameter enables short-circuit local reads.Default: (empty)"},{heading:"dfsdomainsocketpath-toc",content:'Description: This is a path to a UNIX domain socket that will be used for communication between the DataNode and local HDFS clients, if dfs.client.read.shortcircuit is set to true. If the string "_PORT" is present in this path, it will be replaced by the TCP port of the DataNode. Be careful about permissions for the directory that hosts the shared domain socket; dfsclient will complain if open to other users than the HBase user.Default: (empty)'},{heading:"hbasedfsclientreadshortcircuitbuffersize-toc",content:"Description: If the DFSClient configuration dfs.client.read.shortcircuit.buffer.size is unset, we will use what is configured here as the short circuit read default direct byte buffer size. DFSClient native default is 1MB; HBase keeps its HDFS files open so number of file blocks * 1MB soon starts to add up and threaten OOME because of a shortage of direct memory. So, we set it down from the default. Make it > the default hbase block size set in the HColumnDescriptor which is usually 64k.Default: 131072"},{heading:"hbaseregionserverchecksumverify-toc",content:"Description: If set to true (the default), HBase verifies the checksums for hfile blocks. HBase writes checksums inline with the data when it writes out hfiles. HDFS (as of this writing) writes checksums to a separate file than the data file necessitating extra seeks. Setting this flag saves some on i/o. Checksum verification by HDFS will be internally disabled on hfile streams when this flag is set. If the hbase-checksum verification fails, we will switch back to using HDFS checksums (so do not disable HDFS checksums! And besides this feature applies to hfiles only, not to WALs). If this parameter is set to false, then hbase will not verify any checksums, instead it will depend on checksum verification being done in the HDFS client.Default: true"},{heading:"hbasehstorebytesperchecksum-toc",content:"Description: Number of bytes in a newly created checksum chunk for HBase-level checksums in hfile blocks.Default: 16384"},{heading:"hbasehstorechecksumalgorithm-toc",content:"Description: Name of an algorithm that is used to compute checksums. Possible values are NULL, CRC32, CRC32C.Default: CRC32C"},{heading:"hbaseclientscannermaxresultsize-toc",content:"Description: Maximum number of bytes returned when calling a scanner's next method. Note that when a single row is larger than this limit the row is still returned completely. The default value is 2MB, which is good for 1ge networks. With faster and/or high latency networks this value should be increased.Default: 2097152"},{heading:"hbaseserverscannermaxresultsize-toc",content:"Description: Maximum number of bytes returned when calling a scanner's next method. Note that when a single row is larger than this limit the row is still returned completely. The default value is 100MB. This is a safety setting to protect the server from OOM situations.Default: 104857600"},{heading:"hbasestatuspublished-toc",content:"Description: This setting activates the publication by the master of the status of the region server. When a region server dies and its recovery starts, the master will push this information to the client application, to let them cut the connection immediately instead of waiting for a timeout.Default: false"},{heading:"hbasestatuspublisherclass-toc",content:"Description: Implementation of the status publication with a multicast message.Default: org.apache.hadoop.hbase.master.ClusterStatusPublisher$MulticastPublisher"},{heading:"hbasestatuslistenerclass-toc",content:"Description: Implementation of the status listener with a multicast message.Default: org.apache.hadoop.hbase.client.ClusterStatusListener$MulticastListener"},{heading:"hbasestatusmulticastaddressip-toc",content:"Description: Multicast address to use for the status publication by multicast.Default: 226.1.1.3"},{heading:"hbasestatusmulticastaddressport-toc",content:"Description: Multicast port to use for the status publication by multicast.Default: 16100"},{heading:"hbasedynamicjarsdir-toc",content:"Description: The directory from which the custom filter JARs can be loaded dynamically by the region server without the need to restart. However, an already loaded filter/co-processor class would not be un-loaded. See HBASE-1936 for more details. Does not apply to coprocessors.Default: ${hbase.rootdir}/lib"},{heading:"hbasesecurityauthentication-toc",content:"Description: Controls whether or not secure authentication is enabled for HBase. Possible values are 'simple' (no authentication), and 'kerberos'.Default: simple"},{heading:"hbaserestfilterclasses-toc",content:"Description: Servlet filters for REST service.Default: org.apache.hadoop.hbase.rest.filter.GzipFilter"},{heading:"hbasemasterloadbalancerclass-toc",content:"Description: Class used to execute the regions balancing when the period occurs. See the class comment for more on how it works http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/master/balancer/StochasticLoadBalancer.html It replaces the DefaultLoadBalancer as the default (since renamed as the SimpleLoadBalancer).Default: org.apache.hadoop.hbase.master.balancer.StochasticLoadBalancer"},{heading:"hbasemasterloadbalancebytable-toc",content:"Description: Factor Table name when the balancer runs. Default: false.Default: false"},{heading:"hbasemasternormalizerclass-toc",content:"Description: Class used to execute the region normalization when the period occurs. See the class comment for more on how it works http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/master/normalizer/SimpleRegionNormalizer.htmlDefault: org.apache.hadoop.hbase.master.normalizer.SimpleRegionNormalizer"},{heading:"hbaserestcsrfenabled-toc",content:"Description: Set to true to enable protection against cross-site request forgery (CSRF)Default: false"},{heading:"hbaserest-csrfbrowser-useragents-regex-toc",content:"Description: A comma-separated list of regular expressions used to match against an HTTP request's User-Agent header when protection against cross-site request forgery (CSRF) is enabled for REST server by setting hbase.rest.csrf.enabled to true. If the incoming User-Agent matches any of these regular expressions, then the request is considered to be sent by a browser, and therefore CSRF prevention is enforced. If the request's User-Agent does not match any of these regular expressions, then the request is considered to be sent by something other than a browser, such as scripted automation. In this case, CSRF is not a potential attack vector, so the prevention is not enforced. This helps achieve backwards-compatibility with existing automation that has not been updated to send the CSRF prevention header.Default: ^Mozilla.*,^Opera.*"},{heading:"hbasesecurityexecpermissionchecks-toc",content:"Description: If this setting is enabled and ACL based access control is active (the AccessController coprocessor is installed either as a system coprocessor or on a table as a table coprocessor) then you must grant all relevant users EXEC privilege if they require the ability to execute coprocessor endpoint calls. EXEC privilege, like any other permission, can be granted globally to a user, or to a user on a per table or per namespace basis. For more information on coprocessor endpoints, see the coprocessor section of the HBase online manual. For more information on granting or revoking permissions using the AccessController, see the security section of the HBase online manual.Default: false"},{heading:"hbaseprocedureregionserverclasses-toc",content:"Description: A comma-separated list of org.apache.hadoop.hbase.procedure.RegionServerProcedureManager procedure managers that are loaded by default on the active HRegionServer process. The lifecycle methods (init/start/stop) will be called by the active HRegionServer process to perform the specific globally barriered procedure. After implementing your own RegionServerProcedureManager, just put it in HBase's classpath and add the fully qualified class name here.Default: (empty)"},{heading:"hbaseproceduremasterclasses-toc",content:"Description: A comma-separated list of org.apache.hadoop.hbase.procedure.MasterProcedureManager procedure managers that are loaded by default on the active HMaster process. A procedure is identified by its signature and users can use the signature and an instant name to trigger an execution of a globally barriered procedure. After implementing your own MasterProcedureManager, just put it in HBase's classpath and add the fully qualified class name here.Default: (empty)"},{heading:"hbasecoordinatedstatemanagerclass-toc",content:"Description: Fully qualified name of class implementing coordinated state manager.Default: org.apache.hadoop.hbase.coordination.ZkCoordinatedStateManager"},{heading:"hbaseregionserverstorefilerefreshperiod-toc",content:"Description: The period (in milliseconds) for refreshing the store files for the secondary regions. 0 means this feature is disabled. Secondary regions sees new files (from flushes and compactions) from primary once the secondary region refreshes the list of files in the region (there is no notification mechanism). But too frequent refreshes might cause extra Namenode pressure. If the files cannot be refreshed for longer than HFile TTL (hbase.master.hfilecleaner.ttl) the requests are rejected. Configuring HFile TTL to a larger value is also recommended with this setting.Default: 0"},{heading:"hbaseregionreplicareplicationenabled-toc",content:"Description: Whether asynchronous WAL replication to the secondary region replicas is enabled or not. We have a separated implementation for replicating the WAL without using the general inter-cluster replication framework, so now we will not add any replication peers.Default: false"},{heading:"hbasehttpfilterinitializers-toc",content:"Description: A comma separated list of class names. Each class in the list must extend org.apache.hadoop.hbase.http.FilterInitializer. The corresponding Filter will be initialized. Then, the Filter will be applied to all user facing jsp and servlet web pages. The ordering of the list defines the ordering of the filters. The default StaticUserWebFilter add a user principal as defined by the hbase.http.staticuser.user property.Default: org.apache.hadoop.hbase.http.lib.StaticUserWebFilter"},{heading:"hbasesecurityvisibilitymutationscheckauths-toc",content:"Description: This property if enabled, will check whether the labels in the visibility expression are associated with the user issuing the mutationDefault: false"},{heading:"hbasehttpmaxthreads-toc",content:"Description: The maximum number of threads that the HTTP Server will create in its ThreadPool.Default: 16"},{heading:"hbasehttpmetricsservlets-toc",content:"Description: Comma separated list of servlet names to enable for metrics collection. Supported servlets are jmx, metrics, prometheusDefault: jmx,metrics,prometheus"},{heading:"hbasereplicationrpccodec-toc",content:"Description: The codec that is to be used when replication is enabled so that the tags are also replicated. This is used along with HFileV3 which supports tags in them. If tags are not used or if the hfile version used is HFileV2 then KeyValueCodec can be used as the replication codec. Note that using KeyValueCodecWithTags for replication when there are no tags causes no harm.Default: org.apache.hadoop.hbase.codec.KeyValueCodecWithTags"},{heading:"hbasereplicationsourcemaxthreads-toc",content:"Description: The maximum number of threads any replication source will use for shipping edits to the sinks in parallel. This also limits the number of chunks each replication batch is broken into. Larger values can improve the replication throughput between the master and slave clusters. The default of 10 will rarely need to be changed.Default: 10"},{heading:"hbasehttpstaticuseruser-toc",content:"Description: The user name to filter as, on static web filters while rendering content. An example use is the HDFS web UI (user to be used for browsing files).Default: dr.stack"},{heading:"hbaseregionserverhandlerabortonerrorpercent-toc",content:"Description: The percent of region server RPC threads failed to abort RS. -1 Disable aborting; 0 Abort if even a single handler has died; 0.x Abort only when this percent of handlers have died; 1 Abort only all of the handers have died.Default: 0.5"},{heading:"hbasemobfilecachesize-toc",content:'Description: Number of opened file handlers to cache. A larger value will benefit reads by providing more file handlers per mob file cache and would reduce frequent file opening and closing. However, if this is set too high, this could lead to a "too many opened file handlers" The default value is 1000.Default: 1000'},{heading:"hbasemobcacheevictperiod-toc",content:"Description: The amount of time in seconds before the mob cache evicts cached mob files. The default value is 3600 seconds.Default: 3600"},{heading:"hbasemobcacheevictremainratio-toc",content:"Description: The ratio (between 0.0 and 1.0) of files that remains cached after an eviction is triggered when the number of cached mob files exceeds the hbase.mob.file.cache.size. The default value is 0.5f.Default: 0.5f"},{heading:"hbasemastermobcleanerperiod-toc",content:"Description: The period that MobFileCleanerChore runs. The unit is second. The default value is one day. The MOB file name uses only the date part of the file creation time in it. We use this time for deciding TTL expiry of the files. So the removal of TTL expired files might be delayed. The max delay might be 24 hrs.Default: 86400"},{heading:"hbasemobmajorcompactionregionbatchsize-toc",content:"Description: The max number of a MOB table regions that is allowed in a batch of the mob compaction. By setting this number to a custom value, users can control the overall effect of a major compaction of a large MOB-enabled table. Default is 0 - means no limit - all regions of a MOB table will be compacted at onceDefault: 0"},{heading:"hbasemobcompactionchoreperiod-toc",content:"Description: The period that MobCompactionChore runs. The unit is second. The default value is one week.Default: 604800"},{heading:"hbasesnapshotmastertimeoutmillis-toc",content:"Description: Timeout for master for the snapshot procedure execution.Default: 300000"},{heading:"hbasesnapshotregiontimeout-toc",content:"Description: Timeout for regionservers to keep threads in snapshot request pool waiting.Default: 300000"},{heading:"hbaserpcrowswarningthreshold-toc",content:"Description: Number of rows in a batch operation above which a warning will be logged. If hbase.client.write.buffer.maxmutations is not set, this will be used as fallback for that setting.Default: 5000"},{heading:"hbasemasterwaitonserviceseconds-toc",content:"Description: Default is 5 minutes. Make it 30 seconds for tests. See HBASE-19794 for some context.Default: 30"},{heading:"hbasemastercleanersnapshotinterval-toc",content:"Description: Snapshot Cleanup chore interval in milliseconds. The cleanup thread keeps running at this interval to find all snapshots that are expired based on TTL and delete them.Default: 1800000"},{heading:"hbasemastersnapshotttl-toc",content:"Description: Default Snapshot TTL to be considered when the user does not specify TTL while creating snapshot. Default value 0 indicates FOREVERE - snapshot should not be automatically deleted until it is manually deletedDefault: 0"},{heading:"hbasemasterregionsrecoverycheckinterval-toc",content:"Description: Regions Recovery Chore interval in milliseconds. This chore keeps running at this interval to find all regions with configurable max store file ref count and reopens them.Default: 1200000"},{heading:"hbaseregionsrecoverystorefilerefcount-toc",content:"Description: Very large number of ref count on a compacted store file indicates that it is a ref leak on that object(compacted store file). Such files can not be removed after it is invalidated via compaction. Only way to recover in such scenario is to reopen the region which can release all resources, like the refcount, leases, etc. This config represents Store files Ref Count threshold value considered for reopening regions. Any region with compacted store files ref count > this value would be eligible for reopening by master. Here, we get the max refCount among all refCounts on all compacted away store files that belong to a particular region. Default value -1 indicates this feature is turned off. Only positive integer value should be provided to enable this feature.Default: -1"},{heading:"hbaseregionserverslowlogringbuffersize-toc",content:"Description: Default size of ringbuffer to be maintained by each RegionServer in order to store online slowlog responses. This is an in-memory ring buffer of requests that were judged to be too slow in addition to the responseTooSlow logging. The in-memory representation would be complete. For more details, please look into Doc Section: Get Slow Response Log from shellDefault: 256"},{heading:"hbaseregionserverslowlogbufferenabled-toc",content:"Description: Indicates whether RegionServers have ring buffer running for storing Online Slow logs in FIFO manner with limited entries. The size of the ring buffer is indicated by config: hbase.regionserver.slowlog.ringbuffer.size The default value is false, turn this on and get latest slowlog responses with complete data.Default: false"},{heading:"hbaseregionserverslowlogsystableenabled-toc",content:'Description: Should be enabled only if hbase.regionserver.slowlog.buffer.enabled is enabled. If enabled (true), all slow/large RPC logs would be persisted to system table hbase:slowlog (in addition to in-memory ring buffer at each RegionServer). The records are stored in increasing order of time. Operators can scan the table with various combination of ColumnValueFilter. More details are provided in the doc section: "Get Slow/Large Response Logs from System table hbase:slowlog"Default: false'},{heading:"hbasemastermetafixermaxmergecount-toc",content:"Description: Maximum regions to merge at a time when we fix overlaps noted in CJ consistency report, but avoid merging 100 regions in one go!Default: 64"},{heading:"hbaserpcrowssizethresholdreject-toc",content:"Description: If value is true, RegionServer will abort batch requests of Put/Delete with number of rows in a batch operation exceeding threshold defined by value of config: hbase.rpc.rows.warning.threshold. The default value is false and hence, by default, only warning will be logged. This config should be turned on to prevent RegionServer from serving very large batch size of rows and this way we can improve CPU usages by discarding too large batch request.Default: false"},{heading:"hbasenamedqueueproviderclasses-toc",content:'Description: Default values for NamedQueueService implementors. This comma separated full class names represent all implementors of NamedQueueService that we would like to be invoked by LogEvent handler service. One example of NamedQueue service is SlowLogQueueService which is used to store slow/large RPC logs in ringbuffer at each RegionServer. All implementors of NamedQueueService should be found under package: "org.apache.hadoop.hbase.namequeues.impl"Default: org.apache.hadoop.hbase.namequeues.impl.SlowLogQueueService,org.apache.hadoop.hbase.namequeues.impl.BalancerDecisionQueueService,org.apache.hadoop.hbase.namequeues.impl.BalancerRejectionQueueService,org.apache.hadoop.hbase.namequeues.WALEventTrackerQueueService'},{heading:"hbasemasterbalancerdecisionbufferenabled-toc",content:"Description: Indicates whether active HMaster has ring buffer running for storing balancer decisions in FIFO manner with limited entries. The size of the ring buffer is indicated by config: hbase.master.balancer.decision.queue.sizeDefault: false"},{heading:"hbasemasterbalancerrejectionbufferenabled-toc",content:"Description: Indicates whether active HMaster has ring buffer running for storing balancer rejection in FIFO manner with limited entries. The size of the ring buffer is indicated by config: hbase.master.balancer.rejection.queue.sizeDefault: false"},{heading:"hbaselocalityinputstreamderiveenabled-toc",content:"Description: If true, derive StoreFile locality metrics from the underlying DFSInputStream backing reads for that StoreFile. This value will update as the DFSInputStream's block locations are updated over time. Otherwise, locality is computed on StoreFile open, and cached until the StoreFile is closed.Default: false"},{heading:"hbaselocalityinputstreamderivecacheperiod-toc",content:"Description: If deriving StoreFile locality metrics from the underlying DFSInputStream, how long should the derived values be cached for. The derivation process may involve hitting the namenode, if the DFSInputStream's block list is incomplete.Default: 60000"},{heading:"configuration-default-hbase-env-sh",content:"Set HBase environment variables in this file. Examples include options to pass the JVM on start of an HBase daemon such as heap size and garbage collector configs. You can also set configurations for HBase configuration, log directories, niceness, ssh options, where to locate process pid files, etc. Open the file at conf/hbase-env.sh and peruse its content. Each option is fairly well documented. Add your own environment variables here if you want them read by HBase daemons on startup."},{heading:"configuration-default-hbase-env-sh",content:"Changes here will require a cluster restart for HBase to notice the change."},{heading:"log4j2properties",content:"Since version 2.5.0, HBase has upgraded to Log4j2, so the configuration file name and format has changed. Read more in Apache Log4j2."},{heading:"log4j2properties",content:"Edit this file to change rate at which HBase files are rolled and to change the level at which HBase logs messages."},{heading:"log4j2properties",content:"Changes here will require a cluster restart for HBase to notice the change though log levels can be changed for particular daemons via the HBase UI."},{heading:"client-configuration-and-dependencies-connecting-to-an-hbase-cluster",content:"If you are running HBase in standalone mode, you don't need to configure anything for your client to work provided that they are all on the same machine."},{heading:"client-configuration-and-dependencies-connecting-to-an-hbase-cluster",content:"Starting release 3.0.0, the default connection registry has been switched to a rpc based implementation. Refer to Rpc Connection Registry (new as of 2.5.0). Depending on your HBase version, following is the expected minimal client configuration."},{heading:"up-until-2xy-releases",content:"In 2.x.y releases, the default connection registry was based on ZooKeeper as the source of truth. This means that the clients always looked up ZooKeeper znodes to fetch the required metadata. For example, if an active master crashed and the a new master is elected, clients looked up the master znode to fetch the active master address (similarly for meta locations). This meant that the clients needed to have access to ZooKeeper and need to know the ZooKeeper ensemble information before they can do anything. This can be configured in the client configuration xml as follows:"},{heading:"starting-from-300-release",content:"The default implementation was switched to a rpc based connection registry. With this implementation, by default clients contact the active or stand-by master RPC end points to fetch the connection registry information. This means that the clients should have access to the list of active and master end points before they can do anything. This can be configured in the client configuration xml as follows:"},{heading:"starting-from-300-release",content:"The configuration value for hbase.masters is a comma separated list of host:port values. If no port value is specified, the default of 16000 is assumed."},{heading:"starting-from-300-release",content:"Of course you are free to specify bootstrap nodes other than masters, like:"},{heading:"starting-from-300-release",content:"The configuration value for hbase.client.bootstrap.servers is a comma separated list of host:port values. Notice that port must be specified here."},{heading:"starting-from-300-release",content:"Usually these configurations are kept out in the hbase-site.xml and is picked up by the client from the CLASSPATH."},{heading:"starting-from-300-release",content:"If you are configuring an IDE to run an HBase client, you should include the conf/ directory on your classpath so hbase-site.xml settings can be found (or add src/test/resources to pick up the hbase-site.xml used by tests)."},{heading:"starting-from-300-release",content:"For Java applications using Maven, including the hbase-shaded-client module is the recommended dependency when connecting to a cluster:"},{heading:"java-client-configuration",content:"The configuration used by a Java client is kept in an HBaseConfiguration instance."},{heading:"java-client-configuration",content:"The factory method on HBaseConfiguration, HBaseConfiguration.create();, on invocation, will read in the content of the first hbase-site.xml found on the client's CLASSPATH, if one is present (Invocation will also factor in any hbase-default.xml found; an hbase-default.xml ships inside the hbase.X.X.X.jar). It is also possible to specify configuration directly without having to read from a hbase-site.xml."},{heading:"java-client-configuration",content:"For example, to set the ZooKeeper ensemble or bootstrap nodes for the cluster programmatically do as follows:"},{heading:"timeout-settings",content:"HBase provides a wide variety of timeout settings to limit the execution time of various remote operations."},{heading:"timeout-settings",content:"hbase.rpc.timeout"},{heading:"timeout-settings",content:"hbase.rpc.read.timeout"},{heading:"timeout-settings",content:"hbase.rpc.write.timeout"},{heading:"timeout-settings",content:"hbase.client.operation.timeout"},{heading:"timeout-settings",content:"hbase.client.meta.operation.timeout"},{heading:"timeout-settings",content:"hbase.client.scanner.timeout.period"},{heading:"timeout-settings",content:"The hbase.rpc.timeout property limits how long a single RPC call can run before timing out. To fine tune read or write related RPC timeouts set hbase.rpc.read.timeout and hbase.rpc.write.timeout configuration properties. In the absence of these properties hbase.rpc.timeout will be used."},{heading:"timeout-settings",content:"A higher-level timeout is hbase.client.operation.timeout which is valid for each client call. When an RPC call fails for instance for a timeout due to hbase.rpc.timeout it will be retried until hbase.client.operation.timeout is reached. Client operation timeout for system tables can be fine tuned by setting hbase.client.meta.operation.timeout configuration value. When this is not set its value will use hbase.client.operation.timeout."},{heading:"timeout-settings",content:"Timeout for scan operations is controlled differently. Use hbase.client.scanner.timeout.period property to set this timeout."}],headings:[{id:"hbase-sitexml-and-hbase-defaultxml",content:"hbase-site.xml and hbase-default.xml"},{id:"configuration-default-hbase-default-configuration",content:"HBase Default configuration"},{id:"hbasetmpdir-toc",content:"hbase.tmp.dir [!toc]"},{id:"hbaserootdir-toc",content:"hbase.rootdir [!toc]"},{id:"hbaseclusterdistributed-toc",content:"hbase.cluster.distributed [!toc]"},{id:"hbasezookeeperquorum-toc",content:"hbase.zookeeper.quorum [!toc]"},{id:"zookeeperrecoveryretrymaxsleeptime-toc",content:"zookeeper.recovery.retry.maxsleeptime [!toc]"},{id:"hbaselocaldir-toc",content:"hbase.local.dir [!toc]"},{id:"hbasemasterport-toc",content:"hbase.master.port [!toc]"},{id:"hbasemasterinfoport-toc",content:"hbase.master.info.port [!toc]"},{id:"hbasemasterinfobindaddress-toc",content:"hbase.master.info.bindAddress [!toc]"},{id:"hbasemasterlogcleanerplugins-toc",content:"hbase.master.logcleaner.plugins [!toc]"},{id:"hbasemasterlogcleanerttl-toc",content:"hbase.master.logcleaner.ttl [!toc]"},{id:"hbasemasterhfilecleanerplugins-toc",content:"hbase.master.hfilecleaner.plugins [!toc]"},{id:"hbasemasterinfoserverredirect-toc",content:"hbase.master.infoserver.redirect [!toc]"},{id:"hbasemasterfilesplittimeout-toc",content:"hbase.master.fileSplitTimeout [!toc]"},{id:"hbaseregionserverport-toc",content:"hbase.regionserver.port [!toc]"},{id:"hbaseregionserverinfoport-toc",content:"hbase.regionserver.info.port [!toc]"},{id:"hbaseregionserverinfobindaddress-toc",content:"hbase.regionserver.info.bindAddress [!toc]"},{id:"hbaseregionserverinfoportauto-toc",content:"hbase.regionserver.info.port.auto [!toc]"},{id:"hbaseregionserverhandlercount-toc",content:"hbase.regionserver.handler.count [!toc]"},{id:"hbaseipcservercallqueuehandlerfactor-toc",content:"hbase.ipc.server.callqueue.handler.factor [!toc]"},{id:"hbaseipcservercallqueuereadratio-toc",content:"hbase.ipc.server.callqueue.read.ratio [!toc]"},{id:"hbaseipcservercallqueuescanratio-toc",content:"hbase.ipc.server.callqueue.scan.ratio [!toc]"},{id:"hbaseregionservermsginterval-toc",content:"hbase.regionserver.msginterval [!toc]"},{id:"hbaseregionserverlogrollperiod-toc",content:"hbase.regionserver.logroll.period [!toc]"},{id:"hbaseregionserverlogrollerrorstolerated-toc",content:"hbase.regionserver.logroll.errors.tolerated [!toc]"},{id:"hbaseregionserverfreeheapminmemorysize-toc",content:"hbase.regionserver.free.heap.min.memory.size [!toc]"},{id:"hbaseregionserverglobalmemstoresize-toc",content:"hbase.regionserver.global.memstore.size [!toc]"},{id:"hbaseregionserverglobalmemstorememorysize-toc",content:"hbase.regionserver.global.memstore.memory.size [!toc]"},{id:"hbaseregionserverglobalmemstoresizelowerlimit-toc",content:"hbase.regionserver.global.memstore.size.lower.limit [!toc]"},{id:"hbasesystemtablescompactingmemstoretype-toc",content:"hbase.systemtables.compacting.memstore.type [!toc]"},{id:"hbaseregionserveroptionalcacheflushinterval-toc",content:"hbase.regionserver.optionalcacheflushinterval [!toc]"},{id:"hbaseregionserverdnsinterface-toc",content:"hbase.regionserver.dns.interface [!toc]"},{id:"hbaseregionserverdnsnameserver-toc",content:"hbase.regionserver.dns.nameserver [!toc]"},{id:"hbaseregionserverregionsplitpolicy-toc",content:"hbase.regionserver.region.split.policy [!toc]"},{id:"hbaseregionserverregionsplitlimit-toc",content:"hbase.regionserver.regionSplitLimit [!toc]"},{id:"zookeepersessiontimeout-toc",content:"zookeeper.session.timeout [!toc]"},{id:"zookeeperznodeparent-toc",content:"zookeeper.znode.parent [!toc]"},{id:"zookeeperznodeaclparent-toc",content:"zookeeper.znode.acl.parent [!toc]"},{id:"hbasezookeeperdnsinterface-toc",content:"hbase.zookeeper.dns.interface [!toc]"},{id:"hbasezookeeperdnsnameserver-toc",content:"hbase.zookeeper.dns.nameserver [!toc]"},{id:"hbasezookeeperpeerport-toc",content:"hbase.zookeeper.peerport [!toc]"},{id:"hbasezookeeperleaderport-toc",content:"hbase.zookeeper.leaderport [!toc]"},{id:"hbasezookeeperpropertyinitlimit-toc",content:"hbase.zookeeper.property.initLimit [!toc]"},{id:"hbasezookeeperpropertysynclimit-toc",content:"hbase.zookeeper.property.syncLimit [!toc]"},{id:"hbasezookeeperpropertydatadir-toc",content:"hbase.zookeeper.property.dataDir [!toc]"},{id:"hbasezookeeperpropertyclientport-toc",content:"hbase.zookeeper.property.clientPort [!toc]"},{id:"hbasezookeeperpropertymaxclientcnxns-toc",content:"hbase.zookeeper.property.maxClientCnxns [!toc]"},{id:"hbaseclientwritebuffer-toc",content:"hbase.client.write.buffer [!toc]"},{id:"hbaseclientpause-toc",content:"hbase.client.pause [!toc]"},{id:"hbaseclientpauseserveroverloaded-toc",content:"hbase.client.pause.server.overloaded [!toc]"},{id:"hbaseclientretriesnumber-toc",content:"hbase.client.retries.number [!toc]"},{id:"hbaseclientmaxtotaltasks-toc",content:"hbase.client.max.total.tasks [!toc]"},{id:"hbaseclientmaxperservertasks-toc",content:"hbase.client.max.perserver.tasks [!toc]"},{id:"hbaseclientmaxperregiontasks-toc",content:"hbase.client.max.perregion.tasks [!toc]"},{id:"hbaseclientperserverrequeststhreshold-toc",content:"hbase.client.perserver.requests.threshold [!toc]"},{id:"hbaseclientscannercaching-toc",content:"hbase.client.scanner.caching [!toc]"},{id:"hbaseclientkeyvaluemaxsize-toc",content:"hbase.client.keyvalue.maxsize [!toc]"},{id:"hbaseserverkeyvaluemaxsize-toc",content:"hbase.server.keyvalue.maxsize [!toc]"},{id:"hbaseclientscannertimeoutperiod-toc",content:"hbase.client.scanner.timeout.period [!toc]"},{id:"hbaseclientlocalitycheckthreadpoolsize-toc",content:"hbase.client.localityCheck.threadPoolSize [!toc]"},{id:"hbasebulkloadretriesnumber-toc",content:"hbase.bulkload.retries.number [!toc]"},{id:"hbasecompactionafterbulkloadenable-toc",content:"hbase.compaction.after.bulkload.enable [!toc]"},{id:"hbasemasterbalancermaxritpercent-toc",content:"hbase.master.balancer.maxRitPercent [!toc]"},{id:"hbasebalancerperiod-toc",content:"hbase.balancer.period [!toc]"},{id:"hbasemasteroldwalsdirupdaterperiod-toc",content:"hbase.master.oldwals.dir.updater.period [!toc]"},{id:"hbaseregionsslop-toc",content:"hbase.regions.slop [!toc]"},{id:"hbasenormalizerperiod-toc",content:"hbase.normalizer.period [!toc]"},{id:"hbasenormalizersplitenabled-toc",content:"hbase.normalizer.split.enabled [!toc]"},{id:"hbasenormalizermergeenabled-toc",content:"hbase.normalizer.merge.enabled [!toc]"},{id:"hbasenormalizermergeminregioncount-toc",content:"hbase.normalizer.merge.min.region.count [!toc]"},{id:"hbasenormalizermergemin_region_agedays-toc",content:"hbase.normalizer.merge.min_region_age.days [!toc]"},{id:"hbasenormalizermergemin_region_sizemb-toc",content:"hbase.normalizer.merge.min_region_size.mb [!toc]"},{id:"hbasenormalizermergemerge_request_max_number_of_regions-toc",content:"hbase.normalizer.merge.merge_request_max_number_of_regions [!toc]"},{id:"hbasetablenormalizationenabled-toc",content:"hbase.table.normalization.enabled [!toc]"},{id:"hbaseserverthreadwakefrequency-toc",content:"hbase.server.thread.wakefrequency [!toc]"},{id:"hbaseregionserverflushcheckperiod-toc",content:"hbase.regionserver.flush.check.period [!toc]"},{id:"hbaseregionservercompactioncheckperiod-toc",content:"hbase.regionserver.compaction.check.period [!toc]"},{id:"hbaseserverversionfilewriteattempts-toc",content:"hbase.server.versionfile.writeattempts [!toc]"},{id:"hbasehregionmemstoreflushsize-toc",content:"hbase.hregion.memstore.flush.size [!toc]"},{id:"hbasehregionpercolumnfamilyflushsizelowerboundmin-toc",content:"hbase.hregion.percolumnfamilyflush.size.lower.bound.min [!toc]"},{id:"hbasehregionprecloseflushsize-toc",content:"hbase.hregion.preclose.flush.size [!toc]"},{id:"hbasehregionmemstoreblockmultiplier-toc",content:"hbase.hregion.memstore.block.multiplier [!toc]"},{id:"hbasehregionmemstoremslabenabled-toc",content:"hbase.hregion.memstore.mslab.enabled [!toc]"},{id:"hbasehregionmemstoremslabchunksize-toc",content:"hbase.hregion.memstore.mslab.chunksize [!toc]"},{id:"hbaseregionserveroffheapglobalmemstoresize-toc",content:"hbase.regionserver.offheap.global.memstore.size [!toc]"},{id:"hbasehregionmemstoremslabmaxallocation-toc",content:"hbase.hregion.memstore.mslab.max.allocation [!toc]"},{id:"hbasehregionmaxfilesize-toc",content:"hbase.hregion.max.filesize [!toc]"},{id:"hbasehregionsplitoverallfiles-toc",content:"hbase.hregion.split.overallfiles [!toc]"},{id:"hbasehregionmajorcompaction-toc",content:"hbase.hregion.majorcompaction [!toc]"},{id:"hbasehregionmajorcompactionjitter-toc",content:"hbase.hregion.majorcompaction.jitter [!toc]"},{id:"hbasehstorecompactionthreshold-toc",content:"hbase.hstore.compactionThreshold [!toc]"},{id:"hbaseregionservercompactionenabled-toc",content:"hbase.regionserver.compaction.enabled [!toc]"},{id:"hbasehstoreflushercount-toc",content:"hbase.hstore.flusher.count [!toc]"},{id:"hbasehstoreblockingstorefiles-toc",content:"hbase.hstore.blockingStoreFiles [!toc]"},{id:"hbasehstoreblockingwaittime-toc",content:"hbase.hstore.blockingWaitTime [!toc]"},{id:"hbasehstorecompactionmin-toc",content:"hbase.hstore.compaction.min [!toc]"},{id:"hbasehstorecompactionmax-toc",content:"hbase.hstore.compaction.max [!toc]"},{id:"hbasehstorecompactionminsize-toc",content:"hbase.hstore.compaction.min.size [!toc]"},{id:"hbasehstorecompactionmaxsize-toc",content:"hbase.hstore.compaction.max.size [!toc]"},{id:"hbasehstorecompactionratio-toc",content:"hbase.hstore.compaction.ratio [!toc]"},{id:"hbasehstorecompactionratiooffpeak-toc",content:"hbase.hstore.compaction.ratio.offpeak [!toc]"},{id:"hbasehstoretimetopurgedeletes-toc",content:"hbase.hstore.time.to.purge.deletes [!toc]"},{id:"hbaseoffpeakstarthour-toc",content:"hbase.offpeak.start.hour [!toc]"},{id:"hbaseoffpeakendhour-toc",content:"hbase.offpeak.end.hour [!toc]"},{id:"hbaseregionserverthreadcompactionthrottle-toc",content:"hbase.regionserver.thread.compaction.throttle [!toc]"},{id:"hbaseregionservermajorcompactionpagecachedrop-toc",content:"hbase.regionserver.majorcompaction.pagecache.drop [!toc]"},{id:"hbaseregionserverminorcompactionpagecachedrop-toc",content:"hbase.regionserver.minorcompaction.pagecache.drop [!toc]"},{id:"hbasehstorecompactionkvmax-toc",content:"hbase.hstore.compaction.kv.max [!toc]"},{id:"hbasestorescannerparallelseekenable-toc",content:"hbase.storescanner.parallel.seek.enable [!toc]"},{id:"hbasestorescannerparallelseekthreads-toc",content:"hbase.storescanner.parallel.seek.threads [!toc]"},{id:"hfileblockcachepolicy-toc",content:"hfile.block.cache.policy [!toc]"},{id:"hfileblockcachesize-toc",content:"hfile.block.cache.size [!toc]"},{id:"hfileblockcachememorysize-toc",content:"hfile.block.cache.memory.size [!toc]"},{id:"hfileblockindexcacheonwrite-toc",content:"hfile.block.index.cacheonwrite [!toc]"},{id:"hfileindexblockmaxsize-toc",content:"hfile.index.block.max.size [!toc]"},{id:"hbasebucketcacheioengine-toc",content:"hbase.bucketcache.ioengine [!toc]"},{id:"hbasehstorecompactionthroughputlowerbound-toc",content:"hbase.hstore.compaction.throughput.lower.bound [!toc]"},{id:"hbasehstorecompactionthroughputhigherbound-toc",content:"hbase.hstore.compaction.throughput.higher.bound [!toc]"},{id:"hbasebucketcachesize-toc",content:"hbase.bucketcache.size [!toc]"},{id:"hbasebucketcachebucketsizes-toc",content:"hbase.bucketcache.bucket.sizes [!toc]"},{id:"hfileformatversion-toc",content:"hfile.format.version [!toc]"},{id:"hfileblockbloomcacheonwrite-toc",content:"hfile.block.bloom.cacheonwrite [!toc]"},{id:"iostorefilebloomblocksize-toc",content:"io.storefile.bloom.block.size [!toc]"},{id:"hbaserscacheblocksonwrite-toc",content:"hbase.rs.cacheblocksonwrite [!toc]"},{id:"hbaserpctimeout-toc",content:"hbase.rpc.timeout [!toc]"},{id:"hbaseclientoperationtimeout-toc",content:"hbase.client.operation.timeout [!toc]"},{id:"hbaseclientconnectionmetacacheinvalidate-intervalms-toc",content:"hbase.client.connection.metacache.invalidate-interval.ms [!toc]"},{id:"hbasecellsscannedperheartbeatcheck-toc",content:"hbase.cells.scanned.per.heartbeat.check [!toc]"},{id:"hbaserpcshortoperationtimeout-toc",content:"hbase.rpc.shortoperation.timeout [!toc]"},{id:"hbaseipcclienttcpnodelay-toc",content:"hbase.ipc.client.tcpnodelay [!toc]"},{id:"hbaseunsaferegionserverhostname-toc",content:"hbase.unsafe.regionserver.hostname [!toc]"},{id:"hbaseunsaferegionserverhostnamedisablemasterreversedns-toc",content:"hbase.unsafe.regionserver.hostname.disable.master.reversedns [!toc]"},{id:"hbasemasterkeytabfile-toc",content:"hbase.master.keytab.file [!toc]"},{id:"hbasemasterkerberosprincipal-toc",content:"hbase.master.kerberos.principal [!toc]"},{id:"hbaseregionserverkeytabfile-toc",content:"hbase.regionserver.keytab.file [!toc]"},{id:"hbaseregionserverkerberosprincipal-toc",content:"hbase.regionserver.kerberos.principal [!toc]"},{id:"hadooppolicyfile-toc",content:"hadoop.policy.file [!toc]"},{id:"hbasesuperuser-toc",content:"hbase.superuser [!toc]"},{id:"hbaseauthkeyupdateinterval-toc",content:"hbase.auth.key.update.interval [!toc]"},{id:"hbaseauthtokenmaxlifetime-toc",content:"hbase.auth.token.max.lifetime [!toc]"},{id:"hbaseipcclientfallback-to-simple-auth-allowed-toc",content:"hbase.ipc.client.fallback-to-simple-auth-allowed [!toc]"},{id:"hbaseipcserverfallback-to-simple-auth-allowed-toc",content:"hbase.ipc.server.fallback-to-simple-auth-allowed [!toc]"},{id:"hbaseunsafeclientkerberoshostnamedisablereversedns-toc",content:"hbase.unsafe.client.kerberos.hostname.disable.reversedns [!toc]"},{id:"hbasedisplaykeys-toc",content:"hbase.display.keys [!toc]"},{id:"hbasecoprocessorenabled-toc",content:"hbase.coprocessor.enabled [!toc]"},{id:"hbasecoprocessoruserenabled-toc",content:"hbase.coprocessor.user.enabled [!toc]"},{id:"hbasecoprocessorregionclasses-toc",content:"hbase.coprocessor.region.classes [!toc]"},{id:"hbasecoprocessormasterclasses-toc",content:"hbase.coprocessor.master.classes [!toc]"},{id:"hbasecoprocessorabortonerror-toc",content:"hbase.coprocessor.abortonerror [!toc]"},{id:"hbaserestport-toc",content:"hbase.rest.port [!toc]"},{id:"hbaserestreadonly-toc",content:"hbase.rest.readonly [!toc]"},{id:"hbaserestthreadsmax-toc",content:"hbase.rest.threads.max [!toc]"},{id:"hbaserestthreadsmin-toc",content:"hbase.rest.threads.min [!toc]"},{id:"hbaserestsupportproxyuser-toc",content:"hbase.rest.support.proxyuser [!toc]"},{id:"hbasedefaultsforversionskip-toc",content:"hbase.defaults.for.version.skip [!toc]"},{id:"hbasetablelockenable-toc",content:"hbase.table.lock.enable [!toc]"},{id:"hbasetablemaxrowsize-toc",content:"hbase.table.max.rowsize [!toc]"},{id:"hbasethriftminworkerthreads-toc",content:"hbase.thrift.minWorkerThreads [!toc]"},{id:"hbasethriftmaxworkerthreads-toc",content:"hbase.thrift.maxWorkerThreads [!toc]"},{id:"hbasethriftmaxqueuedrequests-toc",content:"hbase.thrift.maxQueuedRequests [!toc]"},{id:"hbaseregionserverthriftframed-toc",content:"hbase.regionserver.thrift.framed [!toc]"},{id:"hbaseregionserverthriftframedmax_frame_size_in_mb-toc",content:"hbase.regionserver.thrift.framed.max_frame_size_in_mb [!toc]"},{id:"hbaseregionserverthriftcompact-toc",content:"hbase.regionserver.thrift.compact [!toc]"},{id:"hbaserootdirperms-toc",content:"hbase.rootdir.perms [!toc]"},{id:"hbasewaldirperms-toc",content:"hbase.wal.dir.perms [!toc]"},{id:"hbasedataumaskenable-toc",content:"hbase.data.umask.enable [!toc]"},{id:"hbasedataumask-toc",content:"hbase.data.umask [!toc]"},{id:"hbasesnapshotenabled-toc",content:"hbase.snapshot.enabled [!toc]"},{id:"hbasesnapshotrestoretakefailsafesnapshot-toc",content:"hbase.snapshot.restore.take.failsafe.snapshot [!toc]"},{id:"hbasesnapshotrestorefailsafename-toc",content:"hbase.snapshot.restore.failsafe.name [!toc]"},{id:"hbasesnapshotworkingdir-toc",content:"hbase.snapshot.working.dir [!toc]"},{id:"hbaseservercompactcheckerintervalmultiplier-toc",content:"hbase.server.compactchecker.interval.multiplier [!toc]"},{id:"hbaseleaserecoverytimeout-toc",content:"hbase.lease.recovery.timeout [!toc]"},{id:"hbaseleaserecoverydfstimeout-toc",content:"hbase.lease.recovery.dfs.timeout [!toc]"},{id:"hbasecolumnmaxversion-toc",content:"hbase.column.max.version [!toc]"},{id:"dfsclientreadshortcircuit-toc",content:"dfs.client.read.shortcircuit [!toc]"},{id:"dfsdomainsocketpath-toc",content:"dfs.domain.socket.path [!toc]"},{id:"hbasedfsclientreadshortcircuitbuffersize-toc",content:"hbase.dfs.client.read.shortcircuit.buffer.size [!toc]"},{id:"hbaseregionserverchecksumverify-toc",content:"hbase.regionserver.checksum.verify [!toc]"},{id:"hbasehstorebytesperchecksum-toc",content:"hbase.hstore.bytes.per.checksum [!toc]"},{id:"hbasehstorechecksumalgorithm-toc",content:"hbase.hstore.checksum.algorithm [!toc]"},{id:"hbaseclientscannermaxresultsize-toc",content:"hbase.client.scanner.max.result.size [!toc]"},{id:"hbaseserverscannermaxresultsize-toc",content:"hbase.server.scanner.max.result.size [!toc]"},{id:"hbasestatuspublished-toc",content:"hbase.status.published [!toc]"},{id:"hbasestatuspublisherclass-toc",content:"hbase.status.publisher.class [!toc]"},{id:"hbasestatuslistenerclass-toc",content:"hbase.status.listener.class [!toc]"},{id:"hbasestatusmulticastaddressip-toc",content:"hbase.status.multicast.address.ip [!toc]"},{id:"hbasestatusmulticastaddressport-toc",content:"hbase.status.multicast.address.port [!toc]"},{id:"hbasedynamicjarsdir-toc",content:"hbase.dynamic.jars.dir [!toc]"},{id:"hbasesecurityauthentication-toc",content:"hbase.security.authentication [!toc]"},{id:"hbaserestfilterclasses-toc",content:"hbase.rest.filter.classes [!toc]"},{id:"hbasemasterloadbalancerclass-toc",content:"hbase.master.loadbalancer.class [!toc]"},{id:"hbasemasterloadbalancebytable-toc",content:"hbase.master.loadbalance.bytable [!toc]"},{id:"hbasemasternormalizerclass-toc",content:"hbase.master.normalizer.class [!toc]"},{id:"hbaserestcsrfenabled-toc",content:"hbase.rest.csrf.enabled [!toc]"},{id:"hbaserest-csrfbrowser-useragents-regex-toc",content:"hbase.rest-csrf.browser-useragents-regex [!toc]"},{id:"hbasesecurityexecpermissionchecks-toc",content:"hbase.security.exec.permission.checks [!toc]"},{id:"hbaseprocedureregionserverclasses-toc",content:"hbase.procedure.regionserver.classes [!toc]"},{id:"hbaseproceduremasterclasses-toc",content:"hbase.procedure.master.classes [!toc]"},{id:"hbasecoordinatedstatemanagerclass-toc",content:"hbase.coordinated.state.manager.class [!toc]"},{id:"hbaseregionserverstorefilerefreshperiod-toc",content:"hbase.regionserver.storefile.refresh.period [!toc]"},{id:"hbaseregionreplicareplicationenabled-toc",content:"hbase.region.replica.replication.enabled [!toc]"},{id:"hbasehttpfilterinitializers-toc",content:"hbase.http.filter.initializers [!toc]"},{id:"hbasesecurityvisibilitymutationscheckauths-toc",content:"hbase.security.visibility.mutations.checkauths [!toc]"},{id:"hbasehttpmaxthreads-toc",content:"hbase.http.max.threads [!toc]"},{id:"hbasehttpmetricsservlets-toc",content:"hbase.http.metrics.servlets [!toc]"},{id:"hbasereplicationrpccodec-toc",content:"hbase.replication.rpc.codec [!toc]"},{id:"hbasereplicationsourcemaxthreads-toc",content:"hbase.replication.source.maxthreads [!toc]"},{id:"hbasehttpstaticuseruser-toc",content:"hbase.http.staticuser.user [!toc]"},{id:"hbaseregionserverhandlerabortonerrorpercent-toc",content:"hbase.regionserver.handler.abort.on.error.percent [!toc]"},{id:"hbasemobfilecachesize-toc",content:"hbase.mob.file.cache.size [!toc]"},{id:"hbasemobcacheevictperiod-toc",content:"hbase.mob.cache.evict.period [!toc]"},{id:"hbasemobcacheevictremainratio-toc",content:"hbase.mob.cache.evict.remain.ratio [!toc]"},{id:"hbasemastermobcleanerperiod-toc",content:"hbase.master.mob.cleaner.period [!toc]"},{id:"hbasemobmajorcompactionregionbatchsize-toc",content:"hbase.mob.major.compaction.region.batch.size [!toc]"},{id:"hbasemobcompactionchoreperiod-toc",content:"hbase.mob.compaction.chore.period [!toc]"},{id:"hbasesnapshotmastertimeoutmillis-toc",content:"hbase.snapshot.master.timeout.millis [!toc]"},{id:"hbasesnapshotregiontimeout-toc",content:"hbase.snapshot.region.timeout [!toc]"},{id:"hbaserpcrowswarningthreshold-toc",content:"hbase.rpc.rows.warning.threshold [!toc]"},{id:"hbasemasterwaitonserviceseconds-toc",content:"hbase.master.wait.on.service.seconds [!toc]"},{id:"hbasemastercleanersnapshotinterval-toc",content:"hbase.master.cleaner.snapshot.interval [!toc]"},{id:"hbasemastersnapshotttl-toc",content:"hbase.master.snapshot.ttl [!toc]"},{id:"hbasemasterregionsrecoverycheckinterval-toc",content:"hbase.master.regions.recovery.check.interval [!toc]"},{id:"hbaseregionsrecoverystorefilerefcount-toc",content:"hbase.regions.recovery.store.file.ref.count [!toc]"},{id:"hbaseregionserverslowlogringbuffersize-toc",content:"hbase.regionserver.slowlog.ringbuffer.size [!toc]"},{id:"hbaseregionserverslowlogbufferenabled-toc",content:"hbase.regionserver.slowlog.buffer.enabled [!toc]"},{id:"hbaseregionserverslowlogsystableenabled-toc",content:"hbase.regionserver.slowlog.systable.enabled [!toc]"},{id:"hbasemastermetafixermaxmergecount-toc",content:"hbase.master.metafixer.max.merge.count [!toc]"},{id:"hbaserpcrowssizethresholdreject-toc",content:"hbase.rpc.rows.size.threshold.reject [!toc]"},{id:"hbasenamedqueueproviderclasses-toc",content:"hbase.namedqueue.provider.classes [!toc]"},{id:"hbasemasterbalancerdecisionbufferenabled-toc",content:"hbase.master.balancer.decision.buffer.enabled [!toc]"},{id:"hbasemasterbalancerrejectionbufferenabled-toc",content:"hbase.master.balancer.rejection.buffer.enabled [!toc]"},{id:"hbaselocalityinputstreamderiveenabled-toc",content:"hbase.locality.inputstream.derive.enabled [!toc]"},{id:"hbaselocalityinputstreamderivecacheperiod-toc",content:"hbase.locality.inputstream.derive.cache.period [!toc]"},{id:"configuration-default-hbase-env-sh",content:"hbase-env.sh"},{id:"log4j2properties",content:"log4j2.properties"},{id:"client-configuration-and-dependencies-connecting-to-an-hbase-cluster",content:"Client configuration and dependencies connecting to an HBase cluster"},{id:"up-until-2xy-releases",content:"Up until 2.x.y releases"},{id:"starting-from-300-release",content:"Starting from 3.0.0 release"},{id:"java-client-configuration",content:"Java client configuration"},{id:"timeout-settings",content:"Timeout settings"}]};const c=[{depth:2,url:"#hbase-sitexml-and-hbase-defaultxml",title:e.jsxs(e.Fragment,{children:[e.jsx("em",{children:"hbase-site.xml"})," and ",e.jsx("em",{children:"hbase-default.xml"})]})},{depth:2,url:"#configuration-default-hbase-default-configuration",title:e.jsx(e.Fragment,{children:"HBase Default configuration"})},{depth:2,url:"#configuration-default-hbase-env-sh",title:e.jsx(e.Fragment,{children:"hbase-env.sh"})},{depth:2,url:"#log4j2properties",title:e.jsx(e.Fragment,{children:e.jsx("em",{children:"log4j2.properties"})})},{depth:2,url:"#client-configuration-and-dependencies-connecting-to-an-hbase-cluster",title:e.jsx(e.Fragment,{children:"Client configuration and dependencies connecting to an HBase cluster"})},{depth:3,url:"#up-until-2xy-releases",title:e.jsx(e.Fragment,{children:"Up until 2.x.y releases"})},{depth:3,url:"#starting-from-300-release",title:e.jsx(e.Fragment,{children:"Starting from 3.0.0 release"})},{depth:3,url:"#java-client-configuration",title:e.jsx(e.Fragment,{children:"Java client configuration"})},{depth:2,url:"#timeout-settings",title:e.jsx(e.Fragment,{children:"Timeout settings"})}];function o(s){const t={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(t.h2,{id:"hbase-sitexml-and-hbase-defaultxml",children:[e.jsx(t.em,{children:"hbase-site.xml"})," and ",e.jsx(t.em,{children:"hbase-default.xml"})]}),`
`,e.jsxs(t.p,{children:["Just as in Hadoop where you add site-specific HDFS configuration to the ",e.jsx(t.em,{children:"hdfs-site.xml"})," file, for HBase, site specific customizations go into the file ",e.jsx(t.em,{children:"conf/hbase-site.xml"}),". For the list of configurable properties, see ",e.jsx(t.a,{href:"/docs/configuration/default#configuration-default-hbase-default-configuration",children:"hbase default configurations"})," below or view the raw ",e.jsx(t.em,{children:"hbase-default.xml"})," source file in the HBase source code at ",e.jsx(t.em,{children:"src/main/resources"}),"."]}),`
`,e.jsxs(t.p,{children:["Not all configuration options make it out to ",e.jsx(t.em,{children:"hbase-default.xml"}),". Some configurations would only appear in source code; the only way to identify these changes are through code review."]}),`
`,e.jsx(t.p,{children:"Currently, changes here will require a cluster restart for HBase to notice the change."}),`
`,e.jsx(t.h2,{id:"configuration-default-hbase-default-configuration",children:"HBase Default configuration"}),`
`,e.jsxs(t.p,{children:["The documentation below is generated using the default hbase configuration file, ",e.jsx(t.em,{children:"hbase-default.xml"}),", as source."]}),`
`,e.jsxs(e.Fragment,{children:[e.jsx(t.h4,{id:"hbasetmpdir-toc",children:e.jsx(t.code,{children:"hbase.tmp.dir"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Temporary directory on the local filesystem. Change this setting to point to a location more permanent than '/tmp', the usual resolve for java.io.tmpdir, as the '/tmp' directory is cleared on machine restart.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"${java.io.tmpdir}/hbase-${user.name}"})]}),`
`,e.jsx(t.h4,{id:"hbaserootdir-toc",children:e.jsx(t.code,{children:"hbase.rootdir"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The directory shared by region servers and into which HBase persists. The URL should be 'fully-qualified' to include the filesystem scheme. For example, to specify the HDFS directory '/hbase' where the HDFS instance's namenode is running at namenode.example.org on port 9000, set this value to: hdfs://namenode.example.org:9000/hbase. By default, we write to whatever ${hbase.tmp.dir} is set too -- usually /tmp -- so change this configuration or else all data will be lost on machine restart.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"${hbase.tmp.dir}/hbase"})]}),`
`,e.jsx(t.h4,{id:"hbaseclusterdistributed-toc",children:e.jsx(t.code,{children:"hbase.cluster.distributed"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The mode the cluster will be in. Possible values are false for standalone mode and true for distributed mode. If false, startup will run all HBase and ZooKeeper daemons together in the one JVM.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasezookeeperquorum-toc",children:e.jsx(t.code,{children:"hbase.zookeeper.quorum"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' Comma separated list of servers in the ZooKeeper ensemble (This config. should have been named hbase.zookeeper.ensemble). For example, "host1.mydomain.com,host2.mydomain.com,host3.mydomain.com". By default this is set to localhost for local and pseudo-distributed modes of operation. For a fully-distributed setup, this should be set to a full list of ZooKeeper ensemble servers. If HBASE_MANAGES_ZK is set in hbase-env.sh this is the list of servers which hbase will start/stop ZooKeeper on as part of cluster start/stop. Client-side, we will take this list of ensemble members and put it together with the hbase.zookeeper.property.clientPort config. and pass it into zookeeper constructor as the connectString parameter.',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"127.0.0.1"})]}),`
`,e.jsx(t.h4,{id:"zookeeperrecoveryretrymaxsleeptime-toc",children:e.jsx(t.code,{children:"zookeeper.recovery.retry.maxsleeptime"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Max sleep time before retry zookeeper operations in milliseconds, a max time is needed here so that sleep time won't grow unboundedly",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"60000"})]}),`
`,e.jsx(t.h4,{id:"hbaselocaldir-toc",children:e.jsx(t.code,{children:"hbase.local.dir"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Directory on the local filesystem to be used as a local storage.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"${hbase.tmp.dir}/local/"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterport-toc",children:e.jsx(t.code,{children:"hbase.master.port"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The port the HBase Master should bind to.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"16000"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterinfoport-toc",children:e.jsx(t.code,{children:"hbase.master.info.port"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The port for the HBase Master web UI. Set to -1 if you do not want a UI instance run.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"16010"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterinfobindaddress-toc",children:e.jsx(t.code,{children:"hbase.master.info.bindAddress"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The bind address for the HBase Master web UI",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0.0.0.0"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterlogcleanerplugins-toc",children:e.jsx(t.code,{children:"hbase.master.logcleaner.plugins"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," A comma-separated list of BaseLogCleanerDelegate invoked by the LogsCleaner service. These WAL cleaners are called in order, so put the cleaner that prunes the most files in front. To implement your own BaseLogCleanerDelegate, just put it in HBase's classpath and add the fully qualified class name here. Always add the above default log cleaners in the list.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"org.apache.hadoop.hbase.master.cleaner.TimeToLiveLogCleaner,org.apache.hadoop.hbase.master.cleaner.TimeToLiveProcedureWALCleaner,org.apache.hadoop.hbase.master.cleaner.TimeToLiveMasterLocalStoreWALCleaner"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterlogcleanerttl-toc",children:e.jsx(t.code,{children:"hbase.master.logcleaner.ttl"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," How long a WAL remain in the archive ({hbase.rootdir}/oldWALs) directory, after which it will be cleaned by a Master thread. The value is in milliseconds.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"600000"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterhfilecleanerplugins-toc",children:e.jsx(t.code,{children:"hbase.master.hfilecleaner.plugins"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," A comma-separated list of BaseHFileCleanerDelegate invoked by the HFileCleaner service. These HFiles cleaners are called in order, so put the cleaner that prunes the most files in front. To implement your own BaseHFileCleanerDelegate, just put it in HBase's classpath and add the fully qualified class name here. Always add the above default hfile cleaners in the list as they will be overwritten in hbase-site.xml.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"org.apache.hadoop.hbase.master.cleaner.TimeToLiveHFileCleaner,org.apache.hadoop.hbase.master.cleaner.TimeToLiveMasterLocalStoreHFileCleaner"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterinfoserverredirect-toc",children:e.jsx(t.code,{children:"hbase.master.infoserver.redirect"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Whether or not the Master listens to the Master web UI port (hbase.master.info.port) and redirects requests to the web UI server shared by the Master and RegionServer. Config. makes sense when Master is serving Regions (not the default).",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterfilesplittimeout-toc",children:e.jsx(t.code,{children:"hbase.master.fileSplitTimeout"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Splitting a region, how long to wait on the file-splitting step before aborting the attempt. Default: 600000. This setting used to be known as hbase.regionserver.fileSplitTimeout in hbase-1.x. Split is now run master-side hence the rename (If a 'hbase.master.fileSplitTimeout' setting found, will use it to prime the current 'hbase.master.fileSplitTimeout' Configuration.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"600000"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverport-toc",children:e.jsx(t.code,{children:"hbase.regionserver.port"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The port the HBase RegionServer binds to.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"16020"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverinfoport-toc",children:e.jsx(t.code,{children:"hbase.regionserver.info.port"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The port for the HBase RegionServer web UI Set to -1 if you do not want the RegionServer UI to run.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"16030"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverinfobindaddress-toc",children:e.jsx(t.code,{children:"hbase.regionserver.info.bindAddress"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The address for the HBase RegionServer web UI",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0.0.0.0"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverinfoportauto-toc",children:e.jsx(t.code,{children:"hbase.regionserver.info.port.auto"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Whether or not the Master or RegionServer UI should search for a port to bind to. Enables automatic port search if hbase.regionserver.info.port is already in use. Useful for testing, turned off by default.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverhandlercount-toc",children:e.jsx(t.code,{children:"hbase.regionserver.handler.count"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Count of RPC Listener instances spun up on RegionServers. Same property is used by the Master for count of master handlers. Too many handlers can be counter-productive. Make it a multiple of CPU count. If mostly read-only, handlers count close to cpu count does well. Start with twice the CPU count and tune from there.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"30"})]}),`
`,e.jsx(t.h4,{id:"hbaseipcservercallqueuehandlerfactor-toc",children:e.jsx(t.code,{children:"hbase.ipc.server.callqueue.handler.factor"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Factor to determine the number of call queues. A value of 0 means a single queue shared between all the handlers. A value of 1 means that each handler has its own queue.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0.1"})]}),`
`,e.jsx(t.h4,{id:"hbaseipcservercallqueuereadratio-toc",children:e.jsx(t.code,{children:"hbase.ipc.server.callqueue.read.ratio"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Split the call queues into read and write queues. The specified interval (which should be between 0.0 and 1.0) will be multiplied by the number of call queues. A value of 0 indicate to not split the call queues, meaning that both read and write requests will be pushed to the same set of queues. A value lower than 0.5 means that there will be less read queues than write queues. A value of 0.5 means there will be the same number of read and write queues. A value greater than 0.5 means that there will be more read queues than write queues. A value of 1.0 means that all the queues except one are used to dispatch read requests. Example: Given the total number of call queues being 10 a read.ratio of 0 means that: the 10 queues will contain both read/write requests. a read.ratio of 0.3 means that: 3 queues will contain only read requests and 7 queues will contain only write requests. a read.ratio of 0.5 means that: 5 queues will contain only read requests and 5 queues will contain only write requests. a read.ratio of 0.8 means that: 8 queues will contain only read requests and 2 queues will contain only write requests. a read.ratio of 1 means that: 9 queues will contain only read requests and 1 queues will contain only write requests.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0"})]}),`
`,e.jsx(t.h4,{id:"hbaseipcservercallqueuescanratio-toc",children:e.jsx(t.code,{children:"hbase.ipc.server.callqueue.scan.ratio"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Given the number of read call queues, calculated from the total number of call queues multiplied by the callqueue.read.ratio, the scan.ratio property will split the read call queues into small-read and long-read queues. A value lower than 0.5 means that there will be less long-read queues than short-read queues. A value of 0.5 means that there will be the same number of short-read and long-read queues. A value greater than 0.5 means that there will be more long-read queues than short-read queues A value of 0 or 1 indicate to use the same set of queues for gets and scans. Example: Given the total number of read call queues being 8 a scan.ratio of 0 or 1 means that: 8 queues will contain both long and short read requests. a scan.ratio of 0.3 means that: 2 queues will contain only long-read requests and 6 queues will contain only short-read requests. a scan.ratio of 0.5 means that: 4 queues will contain only long-read requests and 4 queues will contain only short-read requests. a scan.ratio of 0.8 means that: 6 queues will contain only long-read requests and 2 queues will contain only short-read requests.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionservermsginterval-toc",children:e.jsx(t.code,{children:"hbase.regionserver.msginterval"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Interval between messages from the RegionServer to Master in milliseconds.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"3000"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverlogrollperiod-toc",children:e.jsx(t.code,{children:"hbase.regionserver.logroll.period"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Period at which we will roll the commit log regardless of how many edits it has.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"3600000"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverlogrollerrorstolerated-toc",children:e.jsx(t.code,{children:"hbase.regionserver.logroll.errors.tolerated"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The number of consecutive WAL close errors we will allow before triggering a server abort. A setting of 0 will cause the region server to abort if closing the current WAL writer fails during log rolling. Even a small value (2 or 3) will allow a region server to ride over transient HDFS errors.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverfreeheapminmemorysize-toc",children:e.jsx(t.code,{children:"hbase.regionserver.free.heap.min.memory.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Defines the minimum amount of heap memory that must remain free for the RegionServer to start, specified in bytes or human-readable formats like '512m' for megabytes or '4g' for gigabytes. If not set, the default is 20% of the total heap size. To disable the check entirely, set this value to 0. If the combined memory usage of memstore and block cache exceeds (total heap - this value), the RegionServer will fail to start.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverglobalmemstoresize-toc",children:e.jsx(t.code,{children:"hbase.regionserver.global.memstore.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Maximum size of all memstores in a region server before new updates are blocked and flushes are forced. Defaults to 40% of heap (0.4). Updates are blocked and flushes are forced until size of all memstores in a region server hits hbase.regionserver.global.memstore.size.lower.limit. The default value in this configuration has been intentionally left empty in order to honor the old hbase.regionserver.global.memstore.upperLimit property if present.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverglobalmemstorememorysize-toc",children:e.jsx(t.code,{children:"hbase.regionserver.global.memstore.memory.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Maximum size of all memstores in a region server before new updates are blocked and flushes are forced, specified in bytes or human-readable formats like '10m' for megabytes or '10g' for gigabytes. This configuration allows setting an absolute memory size instead of a percentage of the maximum heap. Takes precedence over hbase.regionserver.global.memstore.size if both are specified.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverglobalmemstoresizelowerlimit-toc",children:e.jsx(t.code,{children:"hbase.regionserver.global.memstore.size.lower.limit"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Maximum size of all memstores in a region server before flushes are forced. Defaults to 95% of hbase.regionserver.global.memstore.size (0.95). A 100% value for this value causes the minimum possible flushing to occur when updates are blocked due to memstore limiting. The default value in this configuration has been intentionally left empty in order to honor the old hbase.regionserver.global.memstore.lowerLimit property if present.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbasesystemtablescompactingmemstoretype-toc",children:e.jsx(t.code,{children:"hbase.systemtables.compacting.memstore.type"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Determines the type of memstore to be used for system tables like META, namespace tables etc. By default NONE is the type and hence we use the default memstore for all the system tables. If we need to use compacting memstore for system tables then set this property to BASIC/EAGER",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"NONE"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserveroptionalcacheflushinterval-toc",children:e.jsx(t.code,{children:"hbase.regionserver.optionalcacheflushinterval"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Maximum amount of time an edit lives in memory before being automatically flushed. Default 1 hour. Set it to 0 to disable automatic flushing.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"3600000"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverdnsinterface-toc",children:e.jsx(t.code,{children:"hbase.regionserver.dns.interface"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The name of the Network Interface from which a region server should report its IP address.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"default"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverdnsnameserver-toc",children:e.jsx(t.code,{children:"hbase.regionserver.dns.nameserver"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The host name or IP address of the name server (DNS) which a region server should use to determine the host name used by the master for communication and display purposes.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"default"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverregionsplitpolicy-toc",children:e.jsx(t.code,{children:"hbase.regionserver.region.split.policy"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," A split policy determines when a region should be split. The various other split policies that are available currently are BusyRegionSplitPolicy, ConstantSizeRegionSplitPolicy, DisabledRegionSplitPolicy, DelimitedKeyPrefixRegionSplitPolicy, KeyPrefixRegionSplitPolicy, and SteppingSplitPolicy. DisabledRegionSplitPolicy blocks manual region splitting.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"org.apache.hadoop.hbase.regionserver.SteppingSplitPolicy"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverregionsplitlimit-toc",children:e.jsx(t.code,{children:"hbase.regionserver.regionSplitLimit"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Limit for the number of regions after which no more region splitting should take place. This is not hard limit for the number of regions but acts as a guideline for the regionserver to stop splitting after a certain limit. Default is set to 1000.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1000"})]}),`
`,e.jsx(t.h4,{id:"zookeepersessiontimeout-toc",children:e.jsx(t.code,{children:"zookeeper.session.timeout"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," ZooKeeper session timeout in milliseconds. It is used in two different ways. First, this value is used in the ZK client that HBase uses to connect to the ensemble. It is also used by HBase when it starts a ZK server and it is passed as the 'maxSessionTimeout'. See ",e.jsx(t.a,{href:"https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#ch_zkSessions",children:"https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#ch_zkSessions"}),". For example, if an HBase region server connects to a ZK ensemble that's also managed by HBase, then the session timeout will be the one specified by this configuration. But, a region server that connects to an ensemble managed with a different configuration will be subjected that ensemble's maxSessionTimeout. So, even though HBase might propose using 90 seconds, the ensemble can have a max timeout lower than this and it will take precedence. The current default maxSessionTimeout that ZK ships with is 40 seconds, which is lower than HBase's.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"90000"})]}),`
`,e.jsx(t.h4,{id:"zookeeperznodeparent-toc",children:e.jsx(t.code,{children:"zookeeper.znode.parent"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Root ZNode for HBase in ZooKeeper. All of HBase's ZooKeeper files that are configured with a relative path will go under this node. By default, all of HBase's ZooKeeper file paths are configured with a relative path, so they will all go under this directory unless changed.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"/hbase"})]}),`
`,e.jsx(t.h4,{id:"zookeeperznodeaclparent-toc",children:e.jsx(t.code,{children:"zookeeper.znode.acl.parent"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Root ZNode for access control lists.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"acl"})]}),`
`,e.jsx(t.h4,{id:"hbasezookeeperdnsinterface-toc",children:e.jsx(t.code,{children:"hbase.zookeeper.dns.interface"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The name of the Network Interface from which a ZooKeeper server should report its IP address.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"default"})]}),`
`,e.jsx(t.h4,{id:"hbasezookeeperdnsnameserver-toc",children:e.jsx(t.code,{children:"hbase.zookeeper.dns.nameserver"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The host name or IP address of the name server (DNS) which a ZooKeeper server should use to determine the host name used by the master for communication and display purposes.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"default"})]}),`
`,e.jsx(t.h4,{id:"hbasezookeeperpeerport-toc",children:e.jsx(t.code,{children:"hbase.zookeeper.peerport"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Port used by ZooKeeper peers to talk to each other. See ",e.jsx(t.a,{href:"https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html#sc_RunningReplicatedZooKeeper",children:"https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html#sc_RunningReplicatedZooKeeper"})," for more information.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2888"})]}),`
`,e.jsx(t.h4,{id:"hbasezookeeperleaderport-toc",children:e.jsx(t.code,{children:"hbase.zookeeper.leaderport"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Port used by ZooKeeper for leader election. See ",e.jsx(t.a,{href:"https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html#sc_RunningReplicatedZooKeeper",children:"https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html#sc_RunningReplicatedZooKeeper"})," for more information.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"3888"})]}),`
`,e.jsx(t.h4,{id:"hbasezookeeperpropertyinitlimit-toc",children:e.jsx(t.code,{children:"hbase.zookeeper.property.initLimit"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Property from ZooKeeper's config zoo.cfg. The number of ticks that the initial synchronization phase can take.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"10"})]}),`
`,e.jsx(t.h4,{id:"hbasezookeeperpropertysynclimit-toc",children:e.jsx(t.code,{children:"hbase.zookeeper.property.syncLimit"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Property from ZooKeeper's config zoo.cfg. The number of ticks that can pass between sending a request and getting an acknowledgment.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"5"})]}),`
`,e.jsx(t.h4,{id:"hbasezookeeperpropertydatadir-toc",children:e.jsx(t.code,{children:"hbase.zookeeper.property.dataDir"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Property from ZooKeeper's config zoo.cfg. The directory where the snapshot is stored.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"${hbase.tmp.dir}/zookeeper"})]}),`
`,e.jsx(t.h4,{id:"hbasezookeeperpropertyclientport-toc",children:e.jsx(t.code,{children:"hbase.zookeeper.property.clientPort"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Property from ZooKeeper's config zoo.cfg. The port at which the clients will connect.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2181"})]}),`
`,e.jsx(t.h4,{id:"hbasezookeeperpropertymaxclientcnxns-toc",children:e.jsx(t.code,{children:"hbase.zookeeper.property.maxClientCnxns"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Property from ZooKeeper's config zoo.cfg. Limit on number of concurrent connections (at the socket level) that a single client, identified by IP address, may make to a single member of the ZooKeeper ensemble. Set high to avoid zk connection issues running standalone and pseudo-distributed.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"300"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientwritebuffer-toc",children:e.jsx(t.code,{children:"hbase.client.write.buffer"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Default size of the BufferedMutator write buffer in bytes. A bigger buffer takes more memory -- on both the client and server side since server instantiates the passed write buffer to process it -- but a larger buffer size reduces the number of RPCs made. For an estimate of server-side memory-used, evaluate hbase.client.write.buffer * hbase.regionserver.handler.count",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2097152"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientpause-toc",children:e.jsx(t.code,{children:"hbase.client.pause"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," General client pause value. Used mostly as value to wait before running a retry of a failed get, region lookup, etc. See hbase.client.retries.number for description of how we backoff from this initial pause amount and how this pause works w/ retries.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"100"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientpauseserveroverloaded-toc",children:e.jsx(t.code,{children:"hbase.client.pause.server.overloaded"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Pause time when encountering an exception indicating a server is overloaded, CallQueueTooBigException or CallDroppedException. Set this property to a higher value than hbase.client.pause if you observe frequent CallQueueTooBigException or CallDroppedException from the same RegionServer and the call queue there keeps filling up. This config used to be called hbase.client.pause.cqtbe, which has been deprecated as of 2.5.0.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientretriesnumber-toc",children:e.jsx(t.code,{children:"hbase.client.retries.number"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Maximum retries. Used as maximum for all retryable operations such as the getting of a cell's value, starting a row update, etc. Retry interval is a rough function based on hbase.client.pause. At first we retry at this interval but then with backoff, we pretty quickly reach retrying every ten seconds. See HConstants#RETRY_BACKOFF for how the backup ramps up. Change this setting and hbase.client.pause to suit your workload.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"15"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientmaxtotaltasks-toc",children:e.jsx(t.code,{children:"hbase.client.max.total.tasks"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum number of concurrent mutation tasks a single HTable instance will send to the cluster.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"100"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientmaxperservertasks-toc",children:e.jsx(t.code,{children:"hbase.client.max.perserver.tasks"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum number of concurrent mutation tasks a single HTable instance will send to a single region server.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientmaxperregiontasks-toc",children:e.jsx(t.code,{children:"hbase.client.max.perregion.tasks"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum number of concurrent mutation tasks the client will maintain to a single Region. That is, if there is already hbase.client.max.perregion.tasks writes in progress for this region, new puts won't be sent to this region until some writes finishes.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientperserverrequeststhreshold-toc",children:e.jsx(t.code,{children:"hbase.client.perserver.requests.threshold"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The max number of concurrent pending requests for one server in all client threads (process level). Exceeding requests will be thrown ServerTooBusyException immediately to prevent user's threads being occupied and blocked by only one slow region server. If you use a fix number of threads to access HBase in a synchronous way, set this to a suitable value which is related to the number of threads will help you. See ",e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/HBASE-16388",children:"https://issues.apache.org/jira/browse/HBASE-16388"})," for details.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2147483647"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientscannercaching-toc",children:e.jsx(t.code,{children:"hbase.client.scanner.caching"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Number of rows that we try to fetch when calling next on a scanner if it is not served from (local, client) memory. This configuration works together with hbase.client.scanner.max.result.size to try and use the network efficiently. The default value is Integer.MAX_VALUE by default so that the network will fill the chunk size defined by hbase.client.scanner.max.result.size rather than be limited by a particular number of rows since the size of rows varies table to table. If you know ahead of time that you will not require more than a certain number of rows from a scan, this configuration should be set to that row limit via Scan#setCaching. Higher caching values will enable faster scanners but will eat up more memory and some calls of next may take longer and longer times when the cache is empty. Do not set this value such that the time between invocations is greater than the scanner timeout; i.e. hbase.client.scanner.timeout.period",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2147483647"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientkeyvaluemaxsize-toc",children:e.jsx(t.code,{children:"hbase.client.keyvalue.maxsize"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Specifies the combined maximum allowed size of a KeyValue instance. This is to set an upper boundary for a single entry saved in a storage file. Since they cannot be split it helps avoiding that a region cannot be split any further because the data is too large. It seems wise to set this to a fraction of the maximum region size. Setting it to zero or less disables the check.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"10485760"})]}),`
`,e.jsx(t.h4,{id:"hbaseserverkeyvaluemaxsize-toc",children:e.jsx(t.code,{children:"hbase.server.keyvalue.maxsize"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Maximum allowed size of an individual cell, inclusive of value and all key components. A value of 0 or less disables the check. The default value is 10MB. This is a safety setting to protect the server from OOM situations.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"10485760"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientscannertimeoutperiod-toc",children:e.jsx(t.code,{children:"hbase.client.scanner.timeout.period"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Client scanner lease period in milliseconds.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"60000"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientlocalitycheckthreadpoolsize-toc",children:e.jsx(t.code,{children:"hbase.client.localityCheck.threadPoolSize"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2"})]}),`
`,e.jsx(t.h4,{id:"hbasebulkloadretriesnumber-toc",children:e.jsx(t.code,{children:"hbase.bulkload.retries.number"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Maximum retries. This is maximum number of iterations to atomic bulk loads are attempted in the face of splitting operations 0 means never give up.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"10"})]}),`
`,e.jsx(t.h4,{id:"hbasecompactionafterbulkloadenable-toc",children:e.jsx(t.code,{children:"hbase.compaction.after.bulkload.enable"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Request Compaction after bulkload immediately. If bulkload is continuous, the triggered compactions may increase load, bring about performance side effect.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterbalancermaxritpercent-toc",children:e.jsx(t.code,{children:"hbase.master.balancer.maxRitPercent"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The max percent of regions in transition when balancing. The default value is 1.0. So there are no balancer throttling. If set this config to 0.01, It means that there are at most 1% regions in transition when balancing. Then the cluster's availability is at least 99% when balancing.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1.0"})]}),`
`,e.jsx(t.h4,{id:"hbasebalancerperiod-toc",children:e.jsx(t.code,{children:"hbase.balancer.period"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Period at which the region balancer runs in the Master, in milliseconds.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"300000"})]}),`
`,e.jsx(t.h4,{id:"hbasemasteroldwalsdirupdaterperiod-toc",children:e.jsx(t.code,{children:"hbase.master.oldwals.dir.updater.period"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Period at which the oldWALs directory size calculator/updater will run in the Master, in milliseconds.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"300000"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionsslop-toc",children:e.jsx(t.code,{children:"hbase.regions.slop"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The load balancer can trigger for several reasons. This value controls one of those reasons. Run the balancer if any regionserver has a region count outside the range of average +/- (average * slop) regions. If the value of slop is negative, disable sloppiness checks. The balancer can still run for other reasons, but sloppiness will not be one of them. If the value of slop is 0, run the balancer if any server has a region count more than 1 from the average. If the value of slop is 100, run the balancer if any server has a region count greater than 101 times the average. The default value of this parameter is 0.2, which runs the balancer if any server has a region count less than 80% of the average, or greater than 120% of the average. Note that for the default StochasticLoadBalancer, this does not guarantee any balancing actions will be taken, but only that the balancer will attempt to run.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0.2"})]}),`
`,e.jsx(t.h4,{id:"hbasenormalizerperiod-toc",children:e.jsx(t.code,{children:"hbase.normalizer.period"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Period at which the region normalizer runs in the Master, in milliseconds.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"300000"})]}),`
`,e.jsx(t.h4,{id:"hbasenormalizersplitenabled-toc",children:e.jsx(t.code,{children:"hbase.normalizer.split.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Whether to split a region as part of normalization.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasenormalizermergeenabled-toc",children:e.jsx(t.code,{children:"hbase.normalizer.merge.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Whether to merge a region as part of normalization.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasenormalizermergeminregioncount-toc",children:e.jsx(t.code,{children:"hbase.normalizer.merge.min.region.count"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The minimum number of regions in a table to consider it for merge normalization.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"3"})]}),`
`,e.jsx(t.h4,{id:"hbasenormalizermergemin_region_agedays-toc",children:e.jsx(t.code,{children:"hbase.normalizer.merge.min_region_age.days"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The minimum age for a region to be considered for a merge, in days.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"3"})]}),`
`,e.jsx(t.h4,{id:"hbasenormalizermergemin_region_sizemb-toc",children:e.jsx(t.code,{children:"hbase.normalizer.merge.min_region_size.mb"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The minimum size for a region to be considered for a merge, in whole MBs.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1"})]}),`
`,e.jsx(t.h4,{id:"hbasenormalizermergemerge_request_max_number_of_regions-toc",children:e.jsx(t.code,{children:"hbase.normalizer.merge.merge_request_max_number_of_regions"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum number of region count in a merge request for merge normalization.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"100"})]}),`
`,e.jsx(t.h4,{id:"hbasetablenormalizationenabled-toc",children:e.jsx(t.code,{children:"hbase.table.normalization.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," This config is used to set default behaviour of normalizer at table level. To override this at table level one can set NORMALIZATION_ENABLED at table descriptor level and that property will be honored",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaseserverthreadwakefrequency-toc",children:e.jsx(t.code,{children:"hbase.server.thread.wakefrequency"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," In master side, this config is the period used for FS related behaviors: checking if hdfs is out of safe mode, setting or checking hbase.version file, setting or checking hbase.id file. Using default value should be fine. In regionserver side, this config is used in several places: flushing check interval, compaction check interval, wal rolling check interval. Specially, admin can tune flushing and compaction check interval by hbase.regionserver.flush.check.period and hbase.regionserver.compaction.check.period. (in milliseconds)",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"10000"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverflushcheckperiod-toc",children:e.jsx(t.code,{children:"hbase.regionserver.flush.check.period"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," It determines the flushing check period of PeriodicFlusher in regionserver. If unset, it uses hbase.server.thread.wakefrequency as default value. (in milliseconds)",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"${hbase.server.thread.wakefrequency}"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionservercompactioncheckperiod-toc",children:e.jsx(t.code,{children:"hbase.regionserver.compaction.check.period"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," It determines the compaction check period of CompactionChecker in regionserver. If unset, it uses hbase.server.thread.wakefrequency as default value. (in milliseconds)",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"${hbase.server.thread.wakefrequency}"})]}),`
`,e.jsx(t.h4,{id:"hbaseserverversionfilewriteattempts-toc",children:e.jsx(t.code,{children:"hbase.server.versionfile.writeattempts"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," How many times to retry attempting to write a version file before just aborting. Each attempt is separated by the hbase.server.thread.wakefrequency milliseconds.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"3"})]}),`
`,e.jsx(t.h4,{id:"hbasehregionmemstoreflushsize-toc",children:e.jsx(t.code,{children:"hbase.hregion.memstore.flush.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Memstore will be flushed to disk if size of the memstore exceeds this number of bytes. Value is checked by a thread that runs every hbase.server.thread.wakefrequency.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"134217728"})]}),`
`,e.jsx(t.h4,{id:"hbasehregionpercolumnfamilyflushsizelowerboundmin-toc",children:e.jsx(t.code,{children:"hbase.hregion.percolumnfamilyflush.size.lower.bound.min"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' If FlushLargeStoresPolicy is used and there are multiple column families, then every time that we hit the total memstore limit, we find out all the column families whose memstores exceed a "lower bound" and only flush them while retaining the others in memory. The "lower bound" will be "hbase.hregion.memstore.flush.size / column_family_number" by default unless value of this property is larger than that. If none of the families have their memstore size more than lower bound, all the memstores will be flushed (just as usual).',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"16777216"})]}),`
`,e.jsx(t.h4,{id:"hbasehregionprecloseflushsize-toc",children:e.jsx(t.code,{children:"hbase.hregion.preclose.flush.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' If the memstores in a region are this size or larger when we go to close, run a "pre-flush" to clear out memstores before we put up the region closed flag and take the region offline. On close, a flush is run under the close flag to empty memory. During this time the region is offline and we are not taking on any writes. If the memstore content is large, this flush could take a long time to complete. The preflush is meant to clean out the bulk of the memstore before putting up the close flag and taking the region offline so the flush that runs under the close flag has little to do.',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"5242880"})]}),`
`,e.jsx(t.h4,{id:"hbasehregionmemstoreblockmultiplier-toc",children:e.jsx(t.code,{children:"hbase.hregion.memstore.block.multiplier"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Block updates if memstore has hbase.hregion.memstore.block.multiplier times hbase.hregion.memstore.flush.size bytes. Useful preventing runaway memstore during spikes in update traffic. Without an upper-bound, memstore fills such that when it flushes the resultant flush files take a long time to compact or split, or worse, we OOME.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"4"})]}),`
`,e.jsx(t.h4,{id:"hbasehregionmemstoremslabenabled-toc",children:e.jsx(t.code,{children:"hbase.hregion.memstore.mslab.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Enables the MemStore-Local Allocation Buffer, a feature which works to prevent heap fragmentation under heavy write loads. This can reduce the frequency of stop-the-world GC pauses on large heaps.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasehregionmemstoremslabchunksize-toc",children:e.jsx(t.code,{children:"hbase.hregion.memstore.mslab.chunksize"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum byte size of a chunk in the MemStoreLAB. Unit: bytes",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2097152"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserveroffheapglobalmemstoresize-toc",children:e.jsx(t.code,{children:"hbase.regionserver.offheap.global.memstore.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The amount of off-heap memory all MemStores in a RegionServer may use. A value of 0 means that no off-heap memory will be used and all chunks in MSLAB will be HeapByteBuffer, otherwise the non-zero value means how many megabyte of off-heap memory will be used for chunks in MSLAB and all chunks in MSLAB will be DirectByteBuffer. Unit: megabytes.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0"})]}),`
`,e.jsx(t.h4,{id:"hbasehregionmemstoremslabmaxallocation-toc",children:e.jsx(t.code,{children:"hbase.hregion.memstore.mslab.max.allocation"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximal size of one allocation in the MemStoreLAB, if the desired byte size exceed this threshold then it will be just allocated from JVM heap rather than MemStoreLAB.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"262144"})]}),`
`,e.jsx(t.h4,{id:"hbasehregionmaxfilesize-toc",children:e.jsx(t.code,{children:"hbase.hregion.max.filesize"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Maximum file size. If the sum of the sizes of a region's HFiles has grown to exceed this value, the region is split in two. There are two choices of how this option works, the first is when any store's size exceed the threshold then split, and the other is overall region's size exceed the threshold then split, it can be configed by hbase.hregion.split.overallfiles.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"10737418240"})]}),`
`,e.jsx(t.h4,{id:"hbasehregionsplitoverallfiles-toc",children:e.jsx(t.code,{children:"hbase.hregion.split.overallfiles"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," If we should sum overall region files size when check to split.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasehregionmajorcompaction-toc",children:e.jsx(t.code,{children:"hbase.hregion.majorcompaction"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Time between major compactions, expressed in milliseconds. Set to 0 to disable time-based automatic major compactions. User-requested and size-based major compactions will still run. This value is multiplied by hbase.hregion.majorcompaction.jitter to cause compaction to start at a somewhat-random time during a given window of time. The default value is 7 days, expressed in milliseconds. If major compactions are causing disruption in your environment, you can configure them to run at off-peak times for your deployment, or disable time-based major compactions by setting this parameter to 0, and run major compactions in a cron job or by another external mechanism.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"604800000"})]}),`
`,e.jsx(t.h4,{id:"hbasehregionmajorcompactionjitter-toc",children:e.jsx(t.code,{children:"hbase.hregion.majorcompaction.jitter"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," A multiplier applied to hbase.hregion.majorcompaction to cause compaction to occur a given amount of time either side of hbase.hregion.majorcompaction. The smaller the number, the closer the compactions will happen to the hbase.hregion.majorcompaction interval.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0.50"})]}),`
`,e.jsx(t.h4,{id:"hbasehstorecompactionthreshold-toc",children:e.jsx(t.code,{children:"hbase.hstore.compactionThreshold"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," If more than or equal to this number of StoreFiles exist in any one Store (one StoreFile is written per flush of MemStore), a compaction is run to rewrite all StoreFiles into a single StoreFile. Larger values delay compaction, but when compaction does occur, it takes longer to complete.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"3"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionservercompactionenabled-toc",children:e.jsx(t.code,{children:"hbase.regionserver.compaction.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Enable/disable compactions on by setting true/false. We can further switch compactions dynamically with the compaction_switch shell command.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasehstoreflushercount-toc",children:e.jsx(t.code,{children:"hbase.hstore.flusher.count"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The number of flush threads. With fewer threads, the MemStore flushes will be queued. With more threads, the flushes will be executed in parallel, increasing the load on HDFS, and potentially causing more compactions.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2"})]}),`
`,e.jsx(t.h4,{id:"hbasehstoreblockingstorefiles-toc",children:e.jsx(t.code,{children:"hbase.hstore.blockingStoreFiles"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," If more than this number of StoreFiles exist in any one Store (one StoreFile is written per flush of MemStore), updates are blocked for this region until a compaction is completed, or until hbase.hstore.blockingWaitTime has been exceeded.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"16"})]}),`
`,e.jsx(t.h4,{id:"hbasehstoreblockingwaittime-toc",children:e.jsx(t.code,{children:"hbase.hstore.blockingWaitTime"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The time for which a region will block updates after reaching the StoreFile limit defined by hbase.hstore.blockingStoreFiles. After this time has elapsed, the region will stop blocking updates even if a compaction has not been completed.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"90000"})]}),`
`,e.jsx(t.h4,{id:"hbasehstorecompactionmin-toc",children:e.jsx(t.code,{children:"hbase.hstore.compaction.min"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The minimum number of StoreFiles which must be eligible for compaction before compaction can run. The goal of tuning hbase.hstore.compaction.min is to avoid ending up with too many tiny StoreFiles to compact. Setting this value to 2 would cause a minor compaction each time you have two StoreFiles in a Store, and this is probably not appropriate. If you set this value too high, all the other values will need to be adjusted accordingly. For most cases, the default value is appropriate (empty value here, results in 3 by code logic). In previous versions of HBase, the parameter hbase.hstore.compaction.min was named hbase.hstore.compactionThreshold.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbasehstorecompactionmax-toc",children:e.jsx(t.code,{children:"hbase.hstore.compaction.max"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum number of StoreFiles which will be selected for a single minor compaction, regardless of the number of eligible StoreFiles. Effectively, the value of hbase.hstore.compaction.max controls the length of time it takes a single compaction to complete. Setting it larger means that more StoreFiles are included in a compaction. For most cases, the default value is appropriate.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"10"})]}),`
`,e.jsx(t.h4,{id:"hbasehstorecompactionminsize-toc",children:e.jsx(t.code,{children:"hbase.hstore.compaction.min.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' A StoreFile (or a selection of StoreFiles, when using ExploringCompactionPolicy) smaller than this size will always be eligible for minor compaction. HFiles this size or larger are evaluated by hbase.hstore.compaction.ratio to determine if they are eligible. Because this limit represents the "automatic include" limit for all StoreFiles smaller than this value, this value may need to be reduced in write-heavy environments where many StoreFiles in the 1-2 MB range are being flushed, because every StoreFile will be targeted for compaction and the resulting StoreFiles may still be under the minimum size and require further compaction. If this parameter is lowered, the ratio check is triggered more quickly. This addressed some issues seen in earlier versions of HBase but changing this parameter is no longer necessary in most situations. Default: 128 MB expressed in bytes.',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"134217728"})]}),`
`,e.jsx(t.h4,{id:"hbasehstorecompactionmaxsize-toc",children:e.jsx(t.code,{children:"hbase.hstore.compaction.max.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," A StoreFile (or a selection of StoreFiles, when using ExploringCompactionPolicy) larger than this size will be excluded from compaction. The effect of raising hbase.hstore.compaction.max.size is fewer, larger StoreFiles that do not get compacted often. If you feel that compaction is happening too often without much benefit, you can try raising this value. Default: the value of LONG.MAX_VALUE, expressed in bytes.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"9223372036854775807"})]}),`
`,e.jsx(t.h4,{id:"hbasehstorecompactionratio-toc",children:e.jsx(t.code,{children:"hbase.hstore.compaction.ratio"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," For minor compaction, this ratio is used to determine whether a given StoreFile which is larger than hbase.hstore.compaction.min.size is eligible for compaction. Its effect is to limit compaction of large StoreFiles. The value of hbase.hstore.compaction.ratio is expressed as a floating-point decimal. A large ratio, such as 10, will produce a single giant StoreFile. Conversely, a low value, such as .25, will produce behavior similar to the BigTable compaction algorithm, producing four StoreFiles. A moderate value of between 1.0 and 1.4 is recommended. When tuning this value, you are balancing write costs with read costs. Raising the value (to something like 1.4) will have more write costs, because you will compact larger StoreFiles. However, during reads, HBase will need to seek through fewer StoreFiles to accomplish the read. Consider this approach if you cannot take advantage of Bloom filters. Otherwise, you can lower this value to something like 1.0 to reduce the background cost of writes, and use Bloom filters to control the number of StoreFiles touched during reads. For most cases, the default value is appropriate.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1.2F"})]}),`
`,e.jsx(t.h4,{id:"hbasehstorecompactionratiooffpeak-toc",children:e.jsx(t.code,{children:"hbase.hstore.compaction.ratio.offpeak"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Allows you to set a different (by default, more aggressive) ratio for determining whether larger StoreFiles are included in compactions during off-peak hours. Works in the same way as hbase.hstore.compaction.ratio. Only applies if hbase.offpeak.start.hour and hbase.offpeak.end.hour are also enabled.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"5.0F"})]}),`
`,e.jsx(t.h4,{id:"hbasehstoretimetopurgedeletes-toc",children:e.jsx(t.code,{children:"hbase.hstore.time.to.purge.deletes"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The amount of time to delay purging of delete markers with future timestamps. If unset, or set to 0, all delete markers, including those with future timestamps, are purged during the next major compaction. Otherwise, a delete marker is kept until the major compaction which occurs after the marker's timestamp plus the value of this setting, in milliseconds.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0"})]}),`
`,e.jsx(t.h4,{id:"hbaseoffpeakstarthour-toc",children:e.jsx(t.code,{children:"hbase.offpeak.start.hour"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The start of off-peak hours, expressed as an integer between 0 and 23, inclusive. Set to -1 to disable off-peak.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"-1"})]}),`
`,e.jsx(t.h4,{id:"hbaseoffpeakendhour-toc",children:e.jsx(t.code,{children:"hbase.offpeak.end.hour"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The end of off-peak hours, expressed as an integer between 0 and 23, inclusive. Set to -1 to disable off-peak.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"-1"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverthreadcompactionthrottle-toc",children:e.jsx(t.code,{children:"hbase.regionserver.thread.compaction.throttle"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," There are two different thread pools for compactions, one for large compactions and the other for small compactions. This helps to keep compaction of lean tables (such as hbase:meta) fast. If a compaction is larger than this threshold, it goes into the large compaction pool. In most cases, the default value is appropriate. Default: 2 x hbase.hstore.compaction.max x hbase.hregion.memstore.flush.size (which defaults to 128MB). The value field assumes that the value of hbase.hregion.memstore.flush.size is unchanged from the default.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2684354560"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionservermajorcompactionpagecachedrop-toc",children:e.jsx(t.code,{children:"hbase.regionserver.majorcompaction.pagecache.drop"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Specifies whether to drop pages read/written into the system page cache by major compactions. Setting it to true helps prevent major compactions from polluting the page cache, which is almost always required, especially for clusters with low/moderate memory to storage ratio.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverminorcompactionpagecachedrop-toc",children:e.jsx(t.code,{children:"hbase.regionserver.minorcompaction.pagecache.drop"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Specifies whether to drop pages read/written into the system page cache by minor compactions. Setting it to true helps prevent minor compactions from polluting the page cache, which is most beneficial on clusters with low memory to storage ratio or very write heavy clusters. You may want to set it to false under moderate to low write workload when bulk of the reads are on the most recently written data.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasehstorecompactionkvmax-toc",children:e.jsx(t.code,{children:"hbase.hstore.compaction.kv.max"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum number of KeyValues to read and then write in a batch when flushing or compacting. Set this lower if you have big KeyValues and problems with Out Of Memory Exceptions Set this higher if you have wide, small rows.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"10"})]}),`
`,e.jsx(t.h4,{id:"hbasestorescannerparallelseekenable-toc",children:e.jsx(t.code,{children:"hbase.storescanner.parallel.seek.enable"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Enables StoreFileScanner parallel-seeking in StoreScanner, a feature which can reduce response latency under special conditions.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasestorescannerparallelseekthreads-toc",children:e.jsx(t.code,{children:"hbase.storescanner.parallel.seek.threads"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The default thread pool size if parallel-seeking feature enabled.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"10"})]}),`
`,e.jsx(t.h4,{id:"hfileblockcachepolicy-toc",children:e.jsx(t.code,{children:"hfile.block.cache.policy"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The eviction policy for the L1 block cache (LRU or TinyLFU).",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"LRU"})]}),`
`,e.jsx(t.h4,{id:"hfileblockcachesize-toc",children:e.jsx(t.code,{children:"hfile.block.cache.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Percentage of maximum heap (-Xmx setting) to allocate to block cache used by a StoreFile. Default of 0.4 means allocate 40%. Set to 0 to disable but it's not recommended; you need at least enough cache to hold the storefile indices.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0.4"})]}),`
`,e.jsx(t.h4,{id:"hfileblockcachememorysize-toc",children:e.jsx(t.code,{children:"hfile.block.cache.memory.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Defines the maximum heap memory allocated for the HFile block cache, specified in bytes or human-readable formats like '10m' for megabytes or '10g' for gigabytes. This configuration allows setting an absolute memory size instead of a percentage of the maximum heap. Takes precedence over hfile.block.cache.size if both are specified.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hfileblockindexcacheonwrite-toc",children:e.jsx(t.code,{children:"hfile.block.index.cacheonwrite"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," This allows to put non-root multi-level index blocks into the block cache at the time the index is being written.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hfileindexblockmaxsize-toc",children:e.jsx(t.code,{children:"hfile.index.block.max.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," When the size of a leaf-level, intermediate-level, or root-level index block in a multi-level block index grows to this size, the block is written out and a new block is started.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"131072"})]}),`
`,e.jsx(t.h4,{id:"hbasebucketcacheioengine-toc",children:e.jsx(t.code,{children:"hbase.bucketcache.ioengine"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Where to store the contents of the bucketcache. One of: offheap, file, files, mmap or pmem. If a file or files, set it to file(s):PATH_TO_FILE. mmap means the content will be in an mmaped file. Use mmap:PATH_TO_FILE. 'pmem' is bucket cache over a file on the persistent memory device. Use pmem:PATH_TO_FILE. See ",e.jsx(t.a,{href:"https://hbase.apache.org/docs/architecture/regionserver#off-heap-block-cache",children:"https://hbase.apache.org/docs/architecture/regionserver#off-heap-block-cache"})," for more information.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbasehstorecompactionthroughputlowerbound-toc",children:e.jsx(t.code,{children:"hbase.hstore.compaction.throughput.lower.bound"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The target lower bound on aggregate compaction throughput, in bytes/sec. Allows you to tune the minimum available compaction throughput when the PressureAwareCompactionThroughputController throughput controller is active. (It is active by default.)",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"52428800"})]}),`
`,e.jsx(t.h4,{id:"hbasehstorecompactionthroughputhigherbound-toc",children:e.jsx(t.code,{children:"hbase.hstore.compaction.throughput.higher.bound"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The target upper bound on aggregate compaction throughput, in bytes/sec. Allows you to control aggregate compaction throughput demand when the PressureAwareCompactionThroughputController throughput controller is active. (It is active by default.) The maximum throughput will be tuned between the lower and upper bounds when compaction pressure is within the range [0.0, 1.0]. If compaction pressure is 1.0 or greater the higher bound will be ignored until pressure returns to the normal range.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"104857600"})]}),`
`,e.jsx(t.h4,{id:"hbasebucketcachesize-toc",children:e.jsx(t.code,{children:"hbase.bucketcache.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," It is the total capacity in megabytes of BucketCache. Default: 0.0",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbasebucketcachebucketsizes-toc",children:e.jsx(t.code,{children:"hbase.bucketcache.bucket.sizes"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," A comma-separated list of sizes for buckets for the bucketcache. Can be multiple sizes. List block sizes in order from smallest to largest. The sizes you use will depend on your data access patterns. Must be a multiple of 256 else you will run into 'java.io.IOException: Invalid HFile block magic' when you go to read from cache. If you specify no values here, then you pick up the default bucketsizes set in code (See BucketAllocator#DEFAULT_BUCKET_SIZES).",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hfileformatversion-toc",children:e.jsx(t.code,{children:"hfile.format.version"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The HFile format version to use for new files. Version 3 adds support for tags in hfiles (See ",e.jsx(t.a,{href:"https://hbase.apache.org/docs/security/data-access#tags",children:"https://hbase.apache.org/docs/security/data-access#tags"}),"). Also see the configuration 'hbase.replication.rpc.codec'.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"3"})]}),`
`,e.jsx(t.h4,{id:"hfileblockbloomcacheonwrite-toc",children:e.jsx(t.code,{children:"hfile.block.bloom.cacheonwrite"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Enables cache-on-write for inline blocks of a compound Bloom filter.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"iostorefilebloomblocksize-toc",children:e.jsx(t.code,{children:"io.storefile.bloom.block.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' The size in bytes of a single block ("chunk") of a compound Bloom filter. This size is approximate, because Bloom blocks can only be inserted at data block boundaries, and the number of keys per data block varies.',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"131072"})]}),`
`,e.jsx(t.h4,{id:"hbaserscacheblocksonwrite-toc",children:e.jsx(t.code,{children:"hbase.rs.cacheblocksonwrite"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Whether an HFile block should be added to the block cache when the block is finished.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaserpctimeout-toc",children:e.jsx(t.code,{children:"hbase.rpc.timeout"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," This is for the RPC layer to define how long (millisecond) HBase client applications take for a remote call to time out. It uses pings to check connections but will eventually throw a TimeoutException.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"60000"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientoperationtimeout-toc",children:e.jsx(t.code,{children:"hbase.client.operation.timeout"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Operation timeout is a top-level restriction (millisecond) that makes sure a blocking operation in Table will not be blocked more than this. In each operation, if rpc request fails because of timeout or other reason, it will retry until success or throw RetriesExhaustedException. But if the total time being blocking reach the operation timeout before retries exhausted, it will break early and throw SocketTimeoutException.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1200000"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientconnectionmetacacheinvalidate-intervalms-toc",children:e.jsx(t.code,{children:"hbase.client.connection.metacache.invalidate-interval.ms"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Interval in milliseconds of checking and invalidating meta cache when table disabled or dropped, when set to zero means disable checking, suggest set it to 24h or a higher value, because disable/delete table usually not very frequently.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0"})]}),`
`,e.jsx(t.h4,{id:"hbasecellsscannedperheartbeatcheck-toc",children:e.jsx(t.code,{children:"hbase.cells.scanned.per.heartbeat.check"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The number of cells scanned in between heartbeat checks. Heartbeat checks occur during the processing of scans to determine whether or not the server should stop scanning in order to send back a heartbeat message to the client. Heartbeat messages are used to keep the client-server connection alive during long running scans. Small values mean that the heartbeat checks will occur more often and thus will provide a tighter bound on the execution time of the scan. Larger values mean that the heartbeat checks occur less frequently",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"10000"})]}),`
`,e.jsx(t.h4,{id:"hbaserpcshortoperationtimeout-toc",children:e.jsx(t.code,{children:"hbase.rpc.shortoperation.timeout"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),` This is another version of "hbase.rpc.timeout". For those RPC operation within cluster, we rely on this configuration to set a short timeout limitation for short operation. For example, short rpc timeout for region server's trying to report to active master can benefit quicker master failover process.`,e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"10000"})]}),`
`,e.jsx(t.h4,{id:"hbaseipcclienttcpnodelay-toc",children:e.jsx(t.code,{children:"hbase.ipc.client.tcpnodelay"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Set no delay on rpc socket connections. See ",e.jsx(t.a,{href:"http://docs.oracle.com/javase/1.5.0/docs/api/java/net/Socket.html#getTcpNoDelay()",children:"http://docs.oracle.com/javase/1.5.0/docs/api/java/net/Socket.html#getTcpNoDelay()"}),e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbaseunsaferegionserverhostname-toc",children:e.jsx(t.code,{children:"hbase.unsafe.regionserver.hostname"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," This config is for experts: don't set its value unless you really know what you are doing. When set to a non-empty value, this represents the (external facing) hostname for the underlying server. See ",e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/HBASE-12954",children:"https://issues.apache.org/jira/browse/HBASE-12954"})," for details.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbaseunsaferegionserverhostnamedisablemasterreversedns-toc",children:e.jsx(t.code,{children:"hbase.unsafe.regionserver.hostname.disable.master.reversedns"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," This config is for experts: don't set its value unless you really know what you are doing. When set to true, regionserver will use the current node hostname for the servername and HMaster will skip reverse DNS lookup and use the hostname sent by regionserver instead. Note that this config and hbase.unsafe.regionserver.hostname are mutually exclusive. See ",e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/HBASE-18226",children:"https://issues.apache.org/jira/browse/HBASE-18226"})," for more details.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterkeytabfile-toc",children:e.jsx(t.code,{children:"hbase.master.keytab.file"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Full path to the kerberos keytab file to use for logging in the configured HMaster server principal.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterkerberosprincipal-toc",children:e.jsx(t.code,{children:"hbase.master.kerberos.principal"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' Ex. "hbase/_',e.jsx(t.a,{href:"mailto:HOST@EXAMPLE.COM",children:"HOST@EXAMPLE.COM"}),'". The kerberos principal name that should be used to run the HMaster process. The principal name should be in the form: user/hostname@DOMAIN. If "_HOST" is used as the hostname portion, it will be replaced with the actual hostname of the running instance.',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverkeytabfile-toc",children:e.jsx(t.code,{children:"hbase.regionserver.keytab.file"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Full path to the kerberos keytab file to use for logging in the configured HRegionServer server principal.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverkerberosprincipal-toc",children:e.jsx(t.code,{children:"hbase.regionserver.kerberos.principal"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' Ex. "hbase/_',e.jsx(t.a,{href:"mailto:HOST@EXAMPLE.COM",children:"HOST@EXAMPLE.COM"}),'". The kerberos principal name that should be used to run the HRegionServer process. The principal name should be in the form: user/hostname@DOMAIN. If "_HOST" is used as the hostname portion, it will be replaced with the actual hostname of the running instance. An entry for this principal must exist in the file specified in hbase.regionserver.keytab.file',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hadooppolicyfile-toc",children:e.jsx(t.code,{children:"hadoop.policy.file"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The policy configuration file used by RPC servers to make authorization decisions on client requests. Only used when HBase security is enabled.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"hbase-policy.xml"})]}),`
`,e.jsx(t.h4,{id:"hbasesuperuser-toc",children:e.jsx(t.code,{children:"hbase.superuser"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' List of users or groups (comma-separated), who are allowed full privileges, regardless of stored ACLs, across the cluster. Only used when HBase security is enabled. Group names should be prefixed with "@".',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbaseauthkeyupdateinterval-toc",children:e.jsx(t.code,{children:"hbase.auth.key.update.interval"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The update interval for master key for authentication tokens in servers in milliseconds. Only used when HBase security is enabled.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"86400000"})]}),`
`,e.jsx(t.h4,{id:"hbaseauthtokenmaxlifetime-toc",children:e.jsx(t.code,{children:"hbase.auth.token.max.lifetime"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum lifetime in milliseconds after which an authentication token expires. Only used when HBase security is enabled.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"604800000"})]}),`
`,e.jsx(t.h4,{id:"hbaseipcclientfallback-to-simple-auth-allowed-toc",children:e.jsx(t.code,{children:"hbase.ipc.client.fallback-to-simple-auth-allowed"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," When a client is configured to attempt a secure connection, but attempts to connect to an insecure server, that server may instruct the client to switch to SASL SIMPLE (unsecure) authentication. This setting controls whether or not the client will accept this instruction from the server. When false (the default), the client will not allow the fallback to SIMPLE authentication, and will abort the connection.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaseipcserverfallback-to-simple-auth-allowed-toc",children:e.jsx(t.code,{children:"hbase.ipc.server.fallback-to-simple-auth-allowed"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," When a server is configured to require secure connections, it will reject connection attempts from clients using SASL SIMPLE (unsecure) authentication. This setting allows secure servers to accept SASL SIMPLE connections from clients when the client requests. When false (the default), the server will not allow the fallback to SIMPLE authentication, and will reject the connection. WARNING: This setting should ONLY be used as a temporary measure while converting clients over to secure authentication. It MUST BE DISABLED for secure operation.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaseunsafeclientkerberoshostnamedisablereversedns-toc",children:e.jsx(t.code,{children:"hbase.unsafe.client.kerberos.hostname.disable.reversedns"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," This config is for experts: don't set its value unless you really know what you are doing. When set to true, HBase client using SASL Kerberos will skip reverse DNS lookup and use provided hostname of the destination for the principal instead. See ",e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/HBASE-25665",children:"https://issues.apache.org/jira/browse/HBASE-25665"})," for more details.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasedisplaykeys-toc",children:e.jsx(t.code,{children:"hbase.display.keys"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," When this is set to true the webUI and such will display all start/end keys as part of the table details, region names, etc. When this is set to false, the keys are hidden.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasecoprocessorenabled-toc",children:e.jsx(t.code,{children:"hbase.coprocessor.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Enables or disables coprocessor loading. If 'false' (disabled), any other coprocessor related configuration will be ignored.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasecoprocessoruserenabled-toc",children:e.jsx(t.code,{children:"hbase.coprocessor.user.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),` Enables or disables user (aka. table) coprocessor loading. If 'false' (disabled), any table coprocessor attributes in table descriptors will be ignored. If "hbase.coprocessor.enabled" is 'false' this setting has no effect.`,e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasecoprocessorregionclasses-toc",children:e.jsx(t.code,{children:"hbase.coprocessor.region.classes"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," A comma-separated list of region observer or endpoint coprocessors that are loaded by default on all tables. For any override coprocessor method, these classes will be called in order. After implementing your own Coprocessor, add it to HBase's classpath and add the fully qualified class name here. A coprocessor can also be loaded on demand by setting HTableDescriptor or the HBase shell.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbasecoprocessormasterclasses-toc",children:e.jsx(t.code,{children:"hbase.coprocessor.master.classes"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," A comma-separated list of org.apache.hadoop.hbase.coprocessor.MasterObserver coprocessors that are loaded by default on the active HMaster process. For any implemented coprocessor methods, the listed classes will be called in order. After implementing your own MasterObserver, just put it in HBase's classpath and add the fully qualified class name here.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbasecoprocessorabortonerror-toc",children:e.jsx(t.code,{children:"hbase.coprocessor.abortonerror"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Set to true to cause the hosting server (master or regionserver) to abort if a coprocessor fails to load, fails to initialize, or throws an unexpected Throwable object. Setting this to false will allow the server to continue execution but the system wide state of the coprocessor in question will become inconsistent as it will be properly executing in only a subset of servers, so this is most useful for debugging only.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbaserestport-toc",children:e.jsx(t.code,{children:"hbase.rest.port"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The port for the HBase REST server.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"8080"})]}),`
`,e.jsx(t.h4,{id:"hbaserestreadonly-toc",children:e.jsx(t.code,{children:"hbase.rest.readonly"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Defines the mode the REST server will be started in. Possible values are: false: All HTTP methods are permitted - GET/PUT/POST/DELETE. true: Only the GET method is permitted.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaserestthreadsmax-toc",children:e.jsx(t.code,{children:"hbase.rest.threads.max"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum number of threads of the REST server thread pool. Threads in the pool are reused to process REST requests. This controls the maximum number of requests processed concurrently. It may help to control the memory used by the REST server to avoid OOM issues. If the thread pool is full, incoming requests will be queued up and wait for some free threads.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"100"})]}),`
`,e.jsx(t.h4,{id:"hbaserestthreadsmin-toc",children:e.jsx(t.code,{children:"hbase.rest.threads.min"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The minimum number of threads of the REST server thread pool. The thread pool always has at least these number of threads so the REST server is ready to serve incoming requests.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2"})]}),`
`,e.jsx(t.h4,{id:"hbaserestsupportproxyuser-toc",children:e.jsx(t.code,{children:"hbase.rest.support.proxyuser"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Enables running the REST server to support proxy-user mode.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasedefaultsforversionskip-toc",children:e.jsx(t.code,{children:"hbase.defaults.for.version.skip"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),` Set to true to skip the 'hbase.defaults.for.version' check. Setting this to true can be useful in contexts other than the other side of a maven generation; i.e. running in an IDE. You'll want to set this boolean to true to avoid seeing the RuntimeException complaint: "hbase-default.xml file seems to be for and old version of HBase (\${hbase.version}), this version is X.X.X-SNAPSHOT"`,e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasetablelockenable-toc",children:e.jsx(t.code,{children:"hbase.table.lock.enable"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Set to true to enable locking the table in zookeeper for schema change operations. Table locking from master prevents concurrent schema modifications to corrupt table state.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasetablemaxrowsize-toc",children:e.jsx(t.code,{children:"hbase.table.max.rowsize"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Maximum size of single row in bytes (default is 1 Gb) for Get'ting or Scan'ning without in-row scan flag set. If row size exceeds this limit RowTooBigException is thrown to client.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1073741824"})]}),`
`,e.jsx(t.h4,{id:"hbasethriftminworkerthreads-toc",children:e.jsx(t.code,{children:"hbase.thrift.minWorkerThreads"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' The "core size" of the thread pool. New threads are created on every connection until this many threads are created.',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"16"})]}),`
`,e.jsx(t.h4,{id:"hbasethriftmaxworkerthreads-toc",children:e.jsx(t.code,{children:"hbase.thrift.maxWorkerThreads"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum size of the thread pool. When the pending request queue overflows, new threads are created until their number reaches this number. After that, the server starts dropping connections.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1000"})]}),`
`,e.jsx(t.h4,{id:"hbasethriftmaxqueuedrequests-toc",children:e.jsx(t.code,{children:"hbase.thrift.maxQueuedRequests"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum number of pending Thrift connections waiting in the queue. If there are no idle threads in the pool, the server queues requests. Only when the queue overflows, new threads are added, up to hbase.thrift.maxQueuedRequests threads.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1000"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverthriftframed-toc",children:e.jsx(t.code,{children:"hbase.regionserver.thrift.framed"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Use Thrift TFramedTransport on the server side. This is the recommended transport for thrift servers and requires a similar setting on the client side. Changing this to false will select the default transport, vulnerable to DoS when malformed requests are issued due to THRIFT-601.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverthriftframedmax_frame_size_in_mb-toc",children:e.jsx(t.code,{children:"hbase.regionserver.thrift.framed.max_frame_size_in_mb"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Default frame size when using framed transport, in MB",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverthriftcompact-toc",children:e.jsx(t.code,{children:"hbase.regionserver.thrift.compact"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Use Thrift TCompactProtocol binary serialization protocol.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaserootdirperms-toc",children:e.jsx(t.code,{children:"hbase.rootdir.perms"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," FS Permissions for the root data subdirectory in a secure (kerberos) setup. When master starts, it creates the rootdir with this permissions or sets the permissions if it does not match.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"700"})]}),`
`,e.jsx(t.h4,{id:"hbasewaldirperms-toc",children:e.jsx(t.code,{children:"hbase.wal.dir.perms"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," FS Permissions for the root WAL directory in a secure(kerberos) setup. When master starts, it creates the WAL dir with this permissions or sets the permissions if it does not match.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"700"})]}),`
`,e.jsx(t.h4,{id:"hbasedataumaskenable-toc",children:e.jsx(t.code,{children:"hbase.data.umask.enable"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Enable, if true, that file permissions should be assigned to the files written by the regionserver",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasedataumask-toc",children:e.jsx(t.code,{children:"hbase.data.umask"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," File permissions that should be used to write data files when hbase.data.umask.enable is true",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"000"})]}),`
`,e.jsx(t.h4,{id:"hbasesnapshotenabled-toc",children:e.jsx(t.code,{children:"hbase.snapshot.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Set to true to allow snapshots to be taken / restored / cloned.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasesnapshotrestoretakefailsafesnapshot-toc",children:e.jsx(t.code,{children:"hbase.snapshot.restore.take.failsafe.snapshot"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Set to true to take a snapshot before the restore operation. The snapshot taken will be used in case of failure, to restore the previous state. At the end of the restore operation this snapshot will be deleted",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasesnapshotrestorefailsafename-toc",children:e.jsx(t.code,{children:"hbase.snapshot.restore.failsafe.name"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Name of the failsafe snapshot taken by the restore operation. You can use the {snapshot.name}, {table.name} and {restore.timestamp} variables to create a name based on what you are restoring.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"hbase-failsafe-{snapshot.name}-{restore.timestamp}"})]}),`
`,e.jsx(t.h4,{id:"hbasesnapshotworkingdir-toc",children:e.jsx(t.code,{children:"hbase.snapshot.working.dir"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Location where the snapshotting process will occur. The location of the completed snapshots will not change, but the temporary directory where the snapshot process occurs will be set to this location. This can be a separate filesystem than the root directory, for performance increase purposes. See HBASE-21098 for more information",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbaseservercompactcheckerintervalmultiplier-toc",children:e.jsx(t.code,{children:"hbase.server.compactchecker.interval.multiplier"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The number that determines how often we scan to see if compaction is necessary. Normally, compactions are done after some events (such as memstore flush), but if region didn't receive a lot of writes for some time, or due to different compaction policies, it may be necessary to check it periodically. The interval between checks is hbase.server.compactchecker.interval.multiplier multiplied by hbase.server.thread.wakefrequency.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1000"})]}),`
`,e.jsx(t.h4,{id:"hbaseleaserecoverytimeout-toc",children:e.jsx(t.code,{children:"hbase.lease.recovery.timeout"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," How long we wait on dfs lease recovery in total before giving up.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"900000"})]}),`
`,e.jsx(t.h4,{id:"hbaseleaserecoverydfstimeout-toc",children:e.jsx(t.code,{children:"hbase.lease.recovery.dfs.timeout"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," How long between dfs recover lease invocations. Should be larger than the sum of the time it takes for the namenode to issue a block recovery command as part of datanode; dfs.heartbeat.interval and the time it takes for the primary datanode, performing block recovery to timeout on a dead datanode; usually dfs.client.socket-timeout. See the end of HBASE-8389 for more.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"64000"})]}),`
`,e.jsx(t.h4,{id:"hbasecolumnmaxversion-toc",children:e.jsx(t.code,{children:"hbase.column.max.version"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," New column family descriptors will use this value as the default number of versions to keep.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1"})]}),`
`,e.jsx(t.h4,{id:"dfsclientreadshortcircuit-toc",children:e.jsx(t.code,{children:"dfs.client.read.shortcircuit"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," If set to true, this configuration parameter enables short-circuit local reads.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"dfsdomainsocketpath-toc",children:e.jsx(t.code,{children:"dfs.domain.socket.path"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' This is a path to a UNIX domain socket that will be used for communication between the DataNode and local HDFS clients, if dfs.client.read.shortcircuit is set to true. If the string "_PORT" is present in this path, it will be replaced by the TCP port of the DataNode. Be careful about permissions for the directory that hosts the shared domain socket; dfsclient will complain if open to other users than the HBase user.',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbasedfsclientreadshortcircuitbuffersize-toc",children:e.jsx(t.code,{children:"hbase.dfs.client.read.shortcircuit.buffer.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," If the DFSClient configuration dfs.client.read.shortcircuit.buffer.size is unset, we will use what is configured here as the short circuit read default direct byte buffer size. DFSClient native default is 1MB; HBase keeps its HDFS files open so number of file blocks * 1MB soon starts to add up and threaten OOME because of a shortage of direct memory. So, we set it down from the default. Make it > the default hbase block size set in the HColumnDescriptor which is usually 64k.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"131072"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverchecksumverify-toc",children:e.jsx(t.code,{children:"hbase.regionserver.checksum.verify"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," If set to true (the default), HBase verifies the checksums for hfile blocks. HBase writes checksums inline with the data when it writes out hfiles. HDFS (as of this writing) writes checksums to a separate file than the data file necessitating extra seeks. Setting this flag saves some on i/o. Checksum verification by HDFS will be internally disabled on hfile streams when this flag is set. If the hbase-checksum verification fails, we will switch back to using HDFS checksums (so do not disable HDFS checksums! And besides this feature applies to hfiles only, not to WALs). If this parameter is set to false, then hbase will not verify any checksums, instead it will depend on checksum verification being done in the HDFS client.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"true"})]}),`
`,e.jsx(t.h4,{id:"hbasehstorebytesperchecksum-toc",children:e.jsx(t.code,{children:"hbase.hstore.bytes.per.checksum"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Number of bytes in a newly created checksum chunk for HBase-level checksums in hfile blocks.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"16384"})]}),`
`,e.jsx(t.h4,{id:"hbasehstorechecksumalgorithm-toc",children:e.jsx(t.code,{children:"hbase.hstore.checksum.algorithm"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Name of an algorithm that is used to compute checksums. Possible values are NULL, CRC32, CRC32C.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"CRC32C"})]}),`
`,e.jsx(t.h4,{id:"hbaseclientscannermaxresultsize-toc",children:e.jsx(t.code,{children:"hbase.client.scanner.max.result.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Maximum number of bytes returned when calling a scanner's next method. Note that when a single row is larger than this limit the row is still returned completely. The default value is 2MB, which is good for 1ge networks. With faster and/or high latency networks this value should be increased.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"2097152"})]}),`
`,e.jsx(t.h4,{id:"hbaseserverscannermaxresultsize-toc",children:e.jsx(t.code,{children:"hbase.server.scanner.max.result.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Maximum number of bytes returned when calling a scanner's next method. Note that when a single row is larger than this limit the row is still returned completely. The default value is 100MB. This is a safety setting to protect the server from OOM situations.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"104857600"})]}),`
`,e.jsx(t.h4,{id:"hbasestatuspublished-toc",children:e.jsx(t.code,{children:"hbase.status.published"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," This setting activates the publication by the master of the status of the region server. When a region server dies and its recovery starts, the master will push this information to the client application, to let them cut the connection immediately instead of waiting for a timeout.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasestatuspublisherclass-toc",children:e.jsx(t.code,{children:"hbase.status.publisher.class"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Implementation of the status publication with a multicast message.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"org.apache.hadoop.hbase.master.ClusterStatusPublisher$MulticastPublisher"})]}),`
`,e.jsx(t.h4,{id:"hbasestatuslistenerclass-toc",children:e.jsx(t.code,{children:"hbase.status.listener.class"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Implementation of the status listener with a multicast message.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"org.apache.hadoop.hbase.client.ClusterStatusListener$MulticastListener"})]}),`
`,e.jsx(t.h4,{id:"hbasestatusmulticastaddressip-toc",children:e.jsx(t.code,{children:"hbase.status.multicast.address.ip"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Multicast address to use for the status publication by multicast.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"226.1.1.3"})]}),`
`,e.jsx(t.h4,{id:"hbasestatusmulticastaddressport-toc",children:e.jsx(t.code,{children:"hbase.status.multicast.address.port"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Multicast port to use for the status publication by multicast.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"16100"})]}),`
`,e.jsx(t.h4,{id:"hbasedynamicjarsdir-toc",children:e.jsx(t.code,{children:"hbase.dynamic.jars.dir"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The directory from which the custom filter JARs can be loaded dynamically by the region server without the need to restart. However, an already loaded filter/co-processor class would not be un-loaded. See HBASE-1936 for more details. Does not apply to coprocessors.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"${hbase.rootdir}/lib"})]}),`
`,e.jsx(t.h4,{id:"hbasesecurityauthentication-toc",children:e.jsx(t.code,{children:"hbase.security.authentication"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Controls whether or not secure authentication is enabled for HBase. Possible values are 'simple' (no authentication), and 'kerberos'.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"simple"})]}),`
`,e.jsx(t.h4,{id:"hbaserestfilterclasses-toc",children:e.jsx(t.code,{children:"hbase.rest.filter.classes"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Servlet filters for REST service.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"org.apache.hadoop.hbase.rest.filter.GzipFilter"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterloadbalancerclass-toc",children:e.jsx(t.code,{children:"hbase.master.loadbalancer.class"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Class used to execute the regions balancing when the period occurs. See the class comment for more on how it works ",e.jsx(t.a,{href:"http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/master/balancer/StochasticLoadBalancer.html",children:"http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/master/balancer/StochasticLoadBalancer.html"})," It replaces the DefaultLoadBalancer as the default (since renamed as the SimpleLoadBalancer).",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"org.apache.hadoop.hbase.master.balancer.StochasticLoadBalancer"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterloadbalancebytable-toc",children:e.jsx(t.code,{children:"hbase.master.loadbalance.bytable"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Factor Table name when the balancer runs. Default: false.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasemasternormalizerclass-toc",children:e.jsx(t.code,{children:"hbase.master.normalizer.class"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Class used to execute the region normalization when the period occurs. See the class comment for more on how it works ",e.jsx(t.a,{href:"http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/master/normalizer/SimpleRegionNormalizer.html",children:"http://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/master/normalizer/SimpleRegionNormalizer.html"}),e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"org.apache.hadoop.hbase.master.normalizer.SimpleRegionNormalizer"})]}),`
`,e.jsx(t.h4,{id:"hbaserestcsrfenabled-toc",children:e.jsx(t.code,{children:"hbase.rest.csrf.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Set to true to enable protection against cross-site request forgery (CSRF)",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaserest-csrfbrowser-useragents-regex-toc",children:e.jsx(t.code,{children:"hbase.rest-csrf.browser-useragents-regex"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," A comma-separated list of regular expressions used to match against an HTTP request's User-Agent header when protection against cross-site request forgery (CSRF) is enabled for REST server by setting hbase.rest.csrf.enabled to true. If the incoming User-Agent matches any of these regular expressions, then the request is considered to be sent by a browser, and therefore CSRF prevention is enforced. If the request's User-Agent does not match any of these regular expressions, then the request is considered to be sent by something other than a browser, such as scripted automation. In this case, CSRF is not a potential attack vector, so the prevention is not enforced. This helps achieve backwards-compatibility with existing automation that has not been updated to send the CSRF prevention header.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"^Mozilla.*,^Opera.*"})]}),`
`,e.jsx(t.h4,{id:"hbasesecurityexecpermissionchecks-toc",children:e.jsx(t.code,{children:"hbase.security.exec.permission.checks"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," If this setting is enabled and ACL based access control is active (the AccessController coprocessor is installed either as a system coprocessor or on a table as a table coprocessor) then you must grant all relevant users EXEC privilege if they require the ability to execute coprocessor endpoint calls. EXEC privilege, like any other permission, can be granted globally to a user, or to a user on a per table or per namespace basis. For more information on coprocessor endpoints, see the coprocessor section of the HBase online manual. For more information on granting or revoking permissions using the AccessController, see the security section of the HBase online manual.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaseprocedureregionserverclasses-toc",children:e.jsx(t.code,{children:"hbase.procedure.regionserver.classes"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," A comma-separated list of org.apache.hadoop.hbase.procedure.RegionServerProcedureManager procedure managers that are loaded by default on the active HRegionServer process. The lifecycle methods (init/start/stop) will be called by the active HRegionServer process to perform the specific globally barriered procedure. After implementing your own RegionServerProcedureManager, just put it in HBase's classpath and add the fully qualified class name here.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbaseproceduremasterclasses-toc",children:e.jsx(t.code,{children:"hbase.procedure.master.classes"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," A comma-separated list of org.apache.hadoop.hbase.procedure.MasterProcedureManager procedure managers that are loaded by default on the active HMaster process. A procedure is identified by its signature and users can use the signature and an instant name to trigger an execution of a globally barriered procedure. After implementing your own MasterProcedureManager, just put it in HBase's classpath and add the fully qualified class name here.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"(empty)"})]}),`
`,e.jsx(t.h4,{id:"hbasecoordinatedstatemanagerclass-toc",children:e.jsx(t.code,{children:"hbase.coordinated.state.manager.class"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Fully qualified name of class implementing coordinated state manager.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"org.apache.hadoop.hbase.coordination.ZkCoordinatedStateManager"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverstorefilerefreshperiod-toc",children:e.jsx(t.code,{children:"hbase.regionserver.storefile.refresh.period"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The period (in milliseconds) for refreshing the store files for the secondary regions. 0 means this feature is disabled. Secondary regions sees new files (from flushes and compactions) from primary once the secondary region refreshes the list of files in the region (there is no notification mechanism). But too frequent refreshes might cause extra Namenode pressure. If the files cannot be refreshed for longer than HFile TTL (hbase.master.hfilecleaner.ttl) the requests are rejected. Configuring HFile TTL to a larger value is also recommended with this setting.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionreplicareplicationenabled-toc",children:e.jsx(t.code,{children:"hbase.region.replica.replication.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Whether asynchronous WAL replication to the secondary region replicas is enabled or not. We have a separated implementation for replicating the WAL without using the general inter-cluster replication framework, so now we will not add any replication peers.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasehttpfilterinitializers-toc",children:e.jsx(t.code,{children:"hbase.http.filter.initializers"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," A comma separated list of class names. Each class in the list must extend org.apache.hadoop.hbase.http.FilterInitializer. The corresponding Filter will be initialized. Then, the Filter will be applied to all user facing jsp and servlet web pages. The ordering of the list defines the ordering of the filters. The default StaticUserWebFilter add a user principal as defined by the hbase.http.staticuser.user property.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"org.apache.hadoop.hbase.http.lib.StaticUserWebFilter"})]}),`
`,e.jsx(t.h4,{id:"hbasesecurityvisibilitymutationscheckauths-toc",children:e.jsx(t.code,{children:"hbase.security.visibility.mutations.checkauths"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," This property if enabled, will check whether the labels in the visibility expression are associated with the user issuing the mutation",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasehttpmaxthreads-toc",children:e.jsx(t.code,{children:"hbase.http.max.threads"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum number of threads that the HTTP Server will create in its ThreadPool.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"16"})]}),`
`,e.jsx(t.h4,{id:"hbasehttpmetricsservlets-toc",children:e.jsx(t.code,{children:"hbase.http.metrics.servlets"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Comma separated list of servlet names to enable for metrics collection. Supported servlets are jmx, metrics, prometheus",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"jmx,metrics,prometheus"})]}),`
`,e.jsx(t.h4,{id:"hbasereplicationrpccodec-toc",children:e.jsx(t.code,{children:"hbase.replication.rpc.codec"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The codec that is to be used when replication is enabled so that the tags are also replicated. This is used along with HFileV3 which supports tags in them. If tags are not used or if the hfile version used is HFileV2 then KeyValueCodec can be used as the replication codec. Note that using KeyValueCodecWithTags for replication when there are no tags causes no harm.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"org.apache.hadoop.hbase.codec.KeyValueCodecWithTags"})]}),`
`,e.jsx(t.h4,{id:"hbasereplicationsourcemaxthreads-toc",children:e.jsx(t.code,{children:"hbase.replication.source.maxthreads"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The maximum number of threads any replication source will use for shipping edits to the sinks in parallel. This also limits the number of chunks each replication batch is broken into. Larger values can improve the replication throughput between the master and slave clusters. The default of 10 will rarely need to be changed.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"10"})]}),`
`,e.jsx(t.h4,{id:"hbasehttpstaticuseruser-toc",children:e.jsx(t.code,{children:"hbase.http.staticuser.user"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The user name to filter as, on static web filters while rendering content. An example use is the HDFS web UI (user to be used for browsing files).",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"dr.stack"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverhandlerabortonerrorpercent-toc",children:e.jsx(t.code,{children:"hbase.regionserver.handler.abort.on.error.percent"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The percent of region server RPC threads failed to abort RS. -1 Disable aborting; 0 Abort if even a single handler has died; 0.x Abort only when this percent of handlers have died; 1 Abort only all of the handers have died.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0.5"})]}),`
`,e.jsx(t.h4,{id:"hbasemobfilecachesize-toc",children:e.jsx(t.code,{children:"hbase.mob.file.cache.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' Number of opened file handlers to cache. A larger value will benefit reads by providing more file handlers per mob file cache and would reduce frequent file opening and closing. However, if this is set too high, this could lead to a "too many opened file handlers" The default value is 1000.',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1000"})]}),`
`,e.jsx(t.h4,{id:"hbasemobcacheevictperiod-toc",children:e.jsx(t.code,{children:"hbase.mob.cache.evict.period"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The amount of time in seconds before the mob cache evicts cached mob files. The default value is 3600 seconds.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"3600"})]}),`
`,e.jsx(t.h4,{id:"hbasemobcacheevictremainratio-toc",children:e.jsx(t.code,{children:"hbase.mob.cache.evict.remain.ratio"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The ratio (between 0.0 and 1.0) of files that remains cached after an eviction is triggered when the number of cached mob files exceeds the hbase.mob.file.cache.size. The default value is 0.5f.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0.5f"})]}),`
`,e.jsx(t.h4,{id:"hbasemastermobcleanerperiod-toc",children:e.jsx(t.code,{children:"hbase.master.mob.cleaner.period"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The period that MobFileCleanerChore runs. The unit is second. The default value is one day. The MOB file name uses only the date part of the file creation time in it. We use this time for deciding TTL expiry of the files. So the removal of TTL expired files might be delayed. The max delay might be 24 hrs.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"86400"})]}),`
`,e.jsx(t.h4,{id:"hbasemobmajorcompactionregionbatchsize-toc",children:e.jsx(t.code,{children:"hbase.mob.major.compaction.region.batch.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The max number of a MOB table regions that is allowed in a batch of the mob compaction. By setting this number to a custom value, users can control the overall effect of a major compaction of a large MOB-enabled table. Default is 0 - means no limit - all regions of a MOB table will be compacted at once",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0"})]}),`
`,e.jsx(t.h4,{id:"hbasemobcompactionchoreperiod-toc",children:e.jsx(t.code,{children:"hbase.mob.compaction.chore.period"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," The period that MobCompactionChore runs. The unit is second. The default value is one week.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"604800"})]}),`
`,e.jsx(t.h4,{id:"hbasesnapshotmastertimeoutmillis-toc",children:e.jsx(t.code,{children:"hbase.snapshot.master.timeout.millis"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Timeout for master for the snapshot procedure execution.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"300000"})]}),`
`,e.jsx(t.h4,{id:"hbasesnapshotregiontimeout-toc",children:e.jsx(t.code,{children:"hbase.snapshot.region.timeout"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Timeout for regionservers to keep threads in snapshot request pool waiting.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"300000"})]}),`
`,e.jsx(t.h4,{id:"hbaserpcrowswarningthreshold-toc",children:e.jsx(t.code,{children:"hbase.rpc.rows.warning.threshold"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Number of rows in a batch operation above which a warning will be logged. If hbase.client.write.buffer.maxmutations is not set, this will be used as fallback for that setting.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"5000"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterwaitonserviceseconds-toc",children:e.jsx(t.code,{children:"hbase.master.wait.on.service.seconds"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Default is 5 minutes. Make it 30 seconds for tests. See HBASE-19794 for some context.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"30"})]}),`
`,e.jsx(t.h4,{id:"hbasemastercleanersnapshotinterval-toc",children:e.jsx(t.code,{children:"hbase.master.cleaner.snapshot.interval"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Snapshot Cleanup chore interval in milliseconds. The cleanup thread keeps running at this interval to find all snapshots that are expired based on TTL and delete them.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1800000"})]}),`
`,e.jsx(t.h4,{id:"hbasemastersnapshotttl-toc",children:e.jsx(t.code,{children:"hbase.master.snapshot.ttl"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Default Snapshot TTL to be considered when the user does not specify TTL while creating snapshot. Default value 0 indicates FOREVERE - snapshot should not be automatically deleted until it is manually deleted",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"0"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterregionsrecoverycheckinterval-toc",children:e.jsx(t.code,{children:"hbase.master.regions.recovery.check.interval"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Regions Recovery Chore interval in milliseconds. This chore keeps running at this interval to find all regions with configurable max store file ref count and reopens them.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"1200000"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionsrecoverystorefilerefcount-toc",children:e.jsx(t.code,{children:"hbase.regions.recovery.store.file.ref.count"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Very large number of ref count on a compacted store file indicates that it is a ref leak on that object(compacted store file). Such files can not be removed after it is invalidated via compaction. Only way to recover in such scenario is to reopen the region which can release all resources, like the refcount, leases, etc. This config represents Store files Ref Count threshold value considered for reopening regions. Any region with compacted store files ref count > this value would be eligible for reopening by master. Here, we get the max refCount among all refCounts on all compacted away store files that belong to a particular region. Default value -1 indicates this feature is turned off. Only positive integer value should be provided to enable this feature.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"-1"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverslowlogringbuffersize-toc",children:e.jsx(t.code,{children:"hbase.regionserver.slowlog.ringbuffer.size"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Default size of ringbuffer to be maintained by each RegionServer in order to store online slowlog responses. This is an in-memory ring buffer of requests that were judged to be too slow in addition to the responseTooSlow logging. The in-memory representation would be complete. For more details, please look into Doc Section: Get Slow Response Log from shell",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"256"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverslowlogbufferenabled-toc",children:e.jsx(t.code,{children:"hbase.regionserver.slowlog.buffer.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Indicates whether RegionServers have ring buffer running for storing Online Slow logs in FIFO manner with limited entries. The size of the ring buffer is indicated by config: hbase.regionserver.slowlog.ringbuffer.size The default value is false, turn this on and get latest slowlog responses with complete data.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaseregionserverslowlogsystableenabled-toc",children:e.jsx(t.code,{children:"hbase.regionserver.slowlog.systable.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' Should be enabled only if hbase.regionserver.slowlog.buffer.enabled is enabled. If enabled (true), all slow/large RPC logs would be persisted to system table hbase:slowlog (in addition to in-memory ring buffer at each RegionServer). The records are stored in increasing order of time. Operators can scan the table with various combination of ColumnValueFilter. More details are provided in the doc section: "Get Slow/Large Response Logs from System table hbase:slowlog"',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasemastermetafixermaxmergecount-toc",children:e.jsx(t.code,{children:"hbase.master.metafixer.max.merge.count"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Maximum regions to merge at a time when we fix overlaps noted in CJ consistency report, but avoid merging 100 regions in one go!",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"64"})]}),`
`,e.jsx(t.h4,{id:"hbaserpcrowssizethresholdreject-toc",children:e.jsx(t.code,{children:"hbase.rpc.rows.size.threshold.reject"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," If value is true, RegionServer will abort batch requests of Put/Delete with number of rows in a batch operation exceeding threshold defined by value of config: hbase.rpc.rows.warning.threshold. The default value is false and hence, by default, only warning will be logged. This config should be turned on to prevent RegionServer from serving very large batch size of rows and this way we can improve CPU usages by discarding too large batch request.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasenamedqueueproviderclasses-toc",children:e.jsx(t.code,{children:"hbase.namedqueue.provider.classes"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"}),' Default values for NamedQueueService implementors. This comma separated full class names represent all implementors of NamedQueueService that we would like to be invoked by LogEvent handler service. One example of NamedQueue service is SlowLogQueueService which is used to store slow/large RPC logs in ringbuffer at each RegionServer. All implementors of NamedQueueService should be found under package: "org.apache.hadoop.hbase.namequeues.impl"',e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"org.apache.hadoop.hbase.namequeues.impl.SlowLogQueueService,org.apache.hadoop.hbase.namequeues.impl.BalancerDecisionQueueService,org.apache.hadoop.hbase.namequeues.impl.BalancerRejectionQueueService,org.apache.hadoop.hbase.namequeues.WALEventTrackerQueueService"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterbalancerdecisionbufferenabled-toc",children:e.jsx(t.code,{children:"hbase.master.balancer.decision.buffer.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Indicates whether active HMaster has ring buffer running for storing balancer decisions in FIFO manner with limited entries. The size of the ring buffer is indicated by config: hbase.master.balancer.decision.queue.size",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbasemasterbalancerrejectionbufferenabled-toc",children:e.jsx(t.code,{children:"hbase.master.balancer.rejection.buffer.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," Indicates whether active HMaster has ring buffer running for storing balancer rejection in FIFO manner with limited entries. The size of the ring buffer is indicated by config: hbase.master.balancer.rejection.queue.size",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaselocalityinputstreamderiveenabled-toc",children:e.jsx(t.code,{children:"hbase.locality.inputstream.derive.enabled"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," If true, derive StoreFile locality metrics from the underlying DFSInputStream backing reads for that StoreFile. This value will update as the DFSInputStream's block locations are updated over time. Otherwise, locality is computed on StoreFile open, and cached until the StoreFile is closed.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"false"})]}),`
`,e.jsx(t.h4,{id:"hbaselocalityinputstreamderivecacheperiod-toc",children:e.jsx(t.code,{children:"hbase.locality.inputstream.derive.cache.period"})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Description:"})," If deriving StoreFile locality metrics from the underlying DFSInputStream, how long should the derived values be cached for. The derivation process may involve hitting the namenode, if the DFSInputStream's block list is incomplete.",e.jsx(t.br,{}),`
`,e.jsx(t.strong,{children:"Default:"})," ",e.jsx(t.code,{children:"60000"})]})]}),`
`,e.jsx(t.h2,{id:"configuration-default-hbase-env-sh",children:"hbase-env.sh"}),`
`,e.jsxs(t.p,{children:["Set HBase environment variables in this file. Examples include options to pass the JVM on start of an HBase daemon such as heap size and garbage collector configs. You can also set configurations for HBase configuration, log directories, niceness, ssh options, where to locate process pid files, etc. Open the file at ",e.jsx(t.em,{children:"conf/hbase-env.sh"})," and peruse its content. Each option is fairly well documented. Add your own environment variables here if you want them read by HBase daemons on startup."]}),`
`,e.jsx(t.p,{children:"Changes here will require a cluster restart for HBase to notice the change."}),`
`,e.jsx(t.h2,{id:"log4j2properties",children:e.jsx(t.em,{children:"log4j2.properties"})}),`
`,e.jsxs(t.p,{children:["Since version 2.5.0, HBase has upgraded to Log4j2, so the configuration file name and format has changed. Read more in ",e.jsx(t.a,{href:"https://logging.apache.org/log4j/2.x/index.html",children:"Apache Log4j2"}),"."]}),`
`,e.jsx(t.p,{children:"Edit this file to change rate at which HBase files are rolled and to change the level at which HBase logs messages."}),`
`,e.jsx(t.p,{children:"Changes here will require a cluster restart for HBase to notice the change though log levels can be changed for particular daemons via the HBase UI."}),`
`,e.jsx(t.h2,{id:"client-configuration-and-dependencies-connecting-to-an-hbase-cluster",children:"Client configuration and dependencies connecting to an HBase cluster"}),`
`,e.jsx(t.p,{children:"If you are running HBase in standalone mode, you don't need to configure anything for your client to work provided that they are all on the same machine."}),`
`,e.jsxs(t.p,{children:["Starting release 3.0.0, the default connection registry has been switched to a rpc based implementation. Refer to ",e.jsx(t.a,{href:"/docs/architecture/client#rpc-connection-registry-new-as-of-250",children:"Rpc Connection Registry (new as of 2.5.0)"}),". Depending on your HBase version, following is the expected minimal client configuration."]}),`
`,e.jsx(t.h3,{id:"up-until-2xy-releases",children:"Up until 2.x.y releases"}),`
`,e.jsx(t.p,{children:"In 2.x.y releases, the default connection registry was based on ZooKeeper as the source of truth. This means that the clients always looked up ZooKeeper znodes to fetch the required metadata. For example, if an active master crashed and the a new master is elected, clients looked up the master znode to fetch the active master address (similarly for meta locations). This meant that the clients needed to have access to ZooKeeper and need to know the ZooKeeper ensemble information before they can do anything. This can be configured in the client configuration xml as follows:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<?"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"xml"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" version"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1.0"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?>"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<?"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"xml-stylesheet"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" type"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"text/xsl"'}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" href"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"configuration.xsl"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?>"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"configuration"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.zookeeper.quorum</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">example1,example2,example3</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">Zookeeper ensemble information</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"configuration"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(t.h3,{id:"starting-from-300-release",children:"Starting from 3.0.0 release"}),`
`,e.jsx(t.p,{children:"The default implementation was switched to a rpc based connection registry. With this implementation, by default clients contact the active or stand-by master RPC end points to fetch the connection registry information. This means that the clients should have access to the list of active and master end points before they can do anything. This can be configured in the client configuration xml as follows:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<?"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"xml"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" version"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1.0"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?>"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<?"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"xml-stylesheet"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" type"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"text/xsl"'}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" href"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"configuration.xsl"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?>"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"configuration"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.masters</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">example1,example2,example3</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">List of master rpc end points for the hbase cluster.</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"configuration"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsxs(t.p,{children:["The configuration value for ",e.jsx(t.em,{children:"hbase.masters"})," is a comma separated list of ",e.jsx(t.em,{children:"host:port"})," values. If no port value is specified, the default of ",e.jsx(t.em,{children:"16000"})," is assumed."]}),`
`,e.jsx(t.p,{children:"Of course you are free to specify bootstrap nodes other than masters, like:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<?"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"xml"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" version"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1.0"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?>"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<?"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"xml-stylesheet"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" type"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"text/xsl"'}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" href"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"configuration.xsl"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?>"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.client.bootstrap.servers</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">server1:16020,server2:16020,server3:16020</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsxs(t.p,{children:["The configuration value for ",e.jsx(t.em,{children:"hbase.client.bootstrap.servers"})," is a comma separated list of ",e.jsx(t.em,{children:"host:port"})," values. Notice that port must be specified here."]}),`
`,e.jsxs(t.p,{children:["Usually these configurations are kept out in the ",e.jsx(t.em,{children:"hbase-site.xml"})," and is picked up by the client from the ",e.jsx(t.code,{children:"CLASSPATH"}),"."]}),`
`,e.jsxs(t.p,{children:["If you are configuring an IDE to run an HBase client, you should include the ",e.jsx(t.em,{children:"conf/"})," directory on your classpath so ",e.jsx(t.em,{children:"hbase-site.xml"})," settings can be found (or add ",e.jsx(t.em,{children:"src/test/resources"})," to pick up the hbase-site.xml used by tests)."]}),`
`,e.jsx(t.p,{children:"For Java applications using Maven, including the hbase-shaded-client module is the recommended dependency when connecting to a cluster:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hbase</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase-shaded-client</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">2.0.0</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(t.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(t.h3,{id:"java-client-configuration",children:"Java client configuration"}),`
`,e.jsxs(t.p,{children:["The configuration used by a Java client is kept in an ",e.jsx(t.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/HBaseConfiguration",children:"HBaseConfiguration"})," instance."]}),`
`,e.jsxs(t.p,{children:["The factory method on HBaseConfiguration, ",e.jsx(t.code,{children:"HBaseConfiguration.create();"}),", on invocation, will read in the content of the first ",e.jsx(t.em,{children:"hbase-site.xml"})," found on the client's ",e.jsx(t.code,{children:"CLASSPATH"}),", if one is present (Invocation will also factor in any ",e.jsx(t.em,{children:"hbase-default.xml"})," found; an ",e.jsx(t.em,{children:"hbase-default.xml"})," ships inside the ",e.jsx(t.em,{children:"hbase.X.X.X.jar"}),"). It is also possible to specify configuration directly without having to read from a ",e.jsx(t.em,{children:"hbase-site.xml"}),"."]}),`
`,e.jsx(t.p,{children:"For example, to set the ZooKeeper ensemble or bootstrap nodes for the cluster programmatically do as follows:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Configuration config "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBaseConfiguration."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"config."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"set"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"hbase.zookeeper.quorum"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"localhost"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");  "}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Until 2.x.y versions"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ---- or ----"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"config."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"set"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"hbase.client.bootstrap.servers"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"localhost:1234"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"); "}),e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Starting 3.0.0 version"})]})]})})}),`
`,e.jsx(t.h2,{id:"timeout-settings",children:"Timeout settings"}),`
`,e.jsx(t.p,{children:"HBase provides a wide variety of timeout settings to limit the execution time of various remote operations."}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"hbase.rpc.timeout"}),`
`,e.jsx(t.li,{children:"hbase.rpc.read.timeout"}),`
`,e.jsx(t.li,{children:"hbase.rpc.write.timeout"}),`
`,e.jsx(t.li,{children:"hbase.client.operation.timeout"}),`
`,e.jsx(t.li,{children:"hbase.client.meta.operation.timeout"}),`
`,e.jsx(t.li,{children:"hbase.client.scanner.timeout.period"}),`
`]}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.code,{children:"hbase.rpc.timeout"})," property limits how long a single RPC call can run before timing out. To fine tune read or write related RPC timeouts set ",e.jsx(t.code,{children:"hbase.rpc.read.timeout"})," and ",e.jsx(t.code,{children:"hbase.rpc.write.timeout"})," configuration properties. In the absence of these properties ",e.jsx(t.code,{children:"hbase.rpc.timeout"})," will be used."]}),`
`,e.jsxs(t.p,{children:["A higher-level timeout is ",e.jsx(t.code,{children:"hbase.client.operation.timeout"})," which is valid for each client call. When an RPC call fails for instance for a timeout due to ",e.jsx(t.code,{children:"hbase.rpc.timeout"})," it will be retried until ",e.jsx(t.code,{children:"hbase.client.operation.timeout"})," is reached. Client operation timeout for system tables can be fine tuned by setting ",e.jsx(t.code,{children:"hbase.client.meta.operation.timeout"})," configuration value. When this is not set its value will use ",e.jsx(t.code,{children:"hbase.client.operation.timeout"}),"."]}),`
`,e.jsxs(t.p,{children:["Timeout for scan operations is controlled differently. Use ",e.jsx(t.code,{children:"hbase.client.scanner.timeout.period"})," property to set this timeout."]})]})}function h(s={}){const{wrapper:t}=s.components||{};return t?e.jsx(t,{...s,children:e.jsx(o,{...s})}):o(s)}export{n as _markdown,h as default,a as extractedReferences,r as frontmatter,l as structuredData,c as toc};
