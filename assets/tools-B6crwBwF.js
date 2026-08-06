import{j as e}from"./components-BCHf_v1I.js";let r=`HBase provides several tools for administration, analysis, and debugging of your cluster. The entry-point to most of these tools is the *bin/hbase* command, though some tools are available in the *dev-support/* directory.

To see usage instructions for *bin/hbase* command, run it with no arguments, or with the \`-h\` argument. These are the usage instructions for HBase 0.98.x. Some commands, such as \`version\`, \`pe\`, \`ltt\`, \`clean\`, are not available in previous versions.

\`\`\`text
$ bin/hbase
Usage: hbase [<options>] <command> [<args>]
Options:
  --config DIR     Configuration direction to use. Default: ./conf
  --hosts HOSTS    Override the list in 'regionservers' file
  --auth-as-server Authenticate to ZooKeeper using servers configuration

Commands:
Some commands take arguments. Pass no args or -h for usage.
  shell           Run the HBase shell
  hbck            Run the HBase 'fsck' tool. Defaults read-only hbck1.
                  Pass '-j /path/to/HBCK2.jar' to run hbase-2.x HBCK2.
  snapshot        Tool for managing snapshots
  wal             Write-ahead-log analyzer
  hfile           Store file analyzer
  zkcli           Run the ZooKeeper shell
  master          Run an HBase HMaster node
  regionserver    Run an HBase HRegionServer node
  zookeeper       Run a ZooKeeper server
  rest            Run an HBase REST server
  thrift          Run the HBase Thrift server
  thrift2         Run the HBase Thrift2 server
  clean           Run the HBase clean up script
  jshell          Run a jshell with HBase on the classpath
  classpath       Dump hbase CLASSPATH
  mapredcp        Dump CLASSPATH entries required by mapreduce
  pe              Run PerformanceEvaluation
  ltt             Run LoadTestTool
  canary          Run the Canary tool
  version         Print the version
  backup          Backup tables for recovery
  restore         Restore tables from existing backup image
  regionsplitter  Run RegionSplitter tool
  rowcounter      Run RowCounter tool
  cellcounter     Run CellCounter tool
  CLASSNAME       Run the class named CLASSNAME

\`\`\`

Some of the tools and utilities below are Java classes which are passed directly to the *bin/hbase* command, as referred to in the last line of the usage instructions. Others, such as \`hbase shell\` ([The Apache HBase Shell](/docs/shell)), \`hbase upgrade\` ([Upgrading](/docs/upgrading)), and \`hbase thrift\` ([Thrift API and Filter Language](/docs/thrift-filter-language)), are documented elsewhere in this guide.

## Canary

The Canary tool can help users "canary-test" the HBase cluster status. The default "region mode" fetches a row from every column-family of every regions. In "regionserver mode", the Canary tool will fetch a row from a random region on each of the cluster's RegionServers. In "zookeeper mode", the Canary will read the root znode on each member of the zookeeper ensemble.

To see usage, pass the \`-help\` parameter (if you pass no parameters, the Canary tool starts executing in the default region "mode" fetching a row from every region in the cluster).

\`\`\`text
2018-10-16 13:11:27,037 INFO  [main] tool.Canary: Execution thread count=16
Usage: canary [OPTIONS] [<TABLE1> [<TABLE2]...] | [<REGIONSERVER1> [<REGIONSERVER2]..]
Where [OPTIONS] are:
 -h,-help        show this help and exit.
 -regionserver   set 'regionserver mode'; gets row from random region on server
 -allRegions     get from ALL regions when 'regionserver mode', not just random one.
 -zookeeper      set 'zookeeper mode'; grab zookeeper.znode.parent on each ensemble member
 -daemon         continuous check at defined intervals.
 -interval <N>   interval between checks in seconds
 -e              consider table/regionserver argument as regular expression
 -f <B>          exit on first error; default=true
 -failureAsError treat read/write failure as error
 -t <N>          timeout for canary-test run; default=600000ms
 -writeSniffing  enable write sniffing
 -writeTable     the table used for write sniffing; default=hbase:canary
 -writeTableTimeout <N>  timeout for writeTable; default=600000ms
 -readTableTimeouts <tableName>=<read timeout>,<tableName>=<read timeout>,...
            comma-separated list of table read timeouts (no spaces);
            logs 'ERROR' if takes longer. default=600000ms
 -permittedZookeeperFailures <N>  Ignore first N failures attempting to
            connect to individual zookeeper nodes in ensemble

 -D<configProperty>=<value> to assign or override configuration params
 -Dhbase.canary.read.raw.enabled=<true/false> Set to enable/disable raw scan; default=false

Canary runs in one of three modes: region (default), regionserver, or zookeeper.
To sniff/probe all regions, pass no arguments.
To sniff/probe all regions of a table, pass tablename.
To sniff/probe regionservers, pass -regionserver, etc.
See https://hbase.apache.org/docs/operational-management/tools#canary for Canary documentation.
\`\`\`

<Callout type="info">
  The \`Sink\` class is instantiated using the \`hbase.canary.sink.class\` configuration property.
</Callout>

This tool will return non zero error codes to user for collaborating with other monitoring tools, such as Nagios. The error code definitions are:

\`\`\`java
private static final int USAGE_EXIT_CODE = 1;
private static final int INIT_ERROR_EXIT_CODE = 2;
private static final int TIMEOUT_ERROR_EXIT_CODE = 3;
private static final int ERROR_EXIT_CODE = 4;
private static final int FAILURE_EXIT_CODE = 5;
\`\`\`

Here are some examples based on the following given case: given two Table objects called test-01 and test-02 each with two column family cf1 and cf2 respectively, deployed on 3 RegionServers. See the following table.

| RegionServer | test-01 | test-02 |
| ------------ | ------- | ------- |
| rs1          | r1      | r2      |
| rs2          | r2      |         |
| rs3          | r2      | r1      |

Following are some example outputs based on the previous given case.

### Canary test for every column family (store) of every region of every table

\`\`\`bash
$ \${HBASE_HOME}/bin/hbase canary

3/12/09 03:26:32 INFO tool.Canary: read from region test-01,,1386230156732.0e3c7d77ffb6361ea1b996ac1042ca9a. column family cf1 in 2ms
13/12/09 03:26:32 INFO tool.Canary: read from region test-01,,1386230156732.0e3c7d77ffb6361ea1b996ac1042ca9a. column family cf2 in 2ms
13/12/09 03:26:32 INFO tool.Canary: read from region test-01,0004883,1386230156732.87b55e03dfeade00f441125159f8ca87. column family cf1 in 4ms
13/12/09 03:26:32 INFO tool.Canary: read from region test-01,0004883,1386230156732.87b55e03dfeade00f441125159f8ca87. column family cf2 in 1ms
...
13/12/09 03:26:32 INFO tool.Canary: read from region test-02,,1386559511167.aa2951a86289281beee480f107bb36ee. column family cf1 in 5ms
13/12/09 03:26:32 INFO tool.Canary: read from region test-02,,1386559511167.aa2951a86289281beee480f107bb36ee. column family cf2 in 3ms
13/12/09 03:26:32 INFO tool.Canary: read from region test-02,0004883,1386559511167.cbda32d5e2e276520712d84eaaa29d84. column family cf1 in 31ms
13/12/09 03:26:32 INFO tool.Canary: read from region test-02,0004883,1386559511167.cbda32d5e2e276520712d84eaaa29d84. column family cf2 in 8ms

\`\`\`

So you can see, table test-01 has two regions and two column families, so the Canary tool in the default "region mode" will pick 4 small piece of data from 4 (2 region \\* 2 store) different stores. This is a default behavior.

### Canary test for every column family (store) of every region of a specific table(s)

You can also test one or more specific tables by passing table names.

\`\`\`bash
$ \${HBASE_HOME}/bin/hbase canary test-01 test-02

\`\`\`

### Canary test with RegionServer granularity

In "regionserver mode", the Canary tool will pick one small piece of data from each RegionServer (You can also pass one or more RegionServer names as arguments to the canary-test when in "regionserver mode").

\`\`\`bash
$ \${HBASE_HOME}/bin/hbase canary -regionserver

13/12/09 06:05:17 INFO tool.Canary: Read from table:test-01 on region server:rs2 in 72ms
13/12/09 06:05:17 INFO tool.Canary: Read from table:test-02 on region server:rs3 in 34ms
13/12/09 06:05:17 INFO tool.Canary: Read from table:test-01 on region server:rs1 in 56ms

\`\`\`

### Canary test with regular expression pattern

You can pass regexes for table names when in "region mode" or for servernames when in "regionserver mode". The below will test both table test-01 and test-02.

\`\`\`bash
$ \${HBASE_HOME}/bin/hbase canary -e test-0[1-2]

\`\`\`

### Run canary test as a "daemon"

Run repeatedly with an interval defined via the option \`-interval\` (default value is 60 seconds). This daemon will stop itself and return non-zero error code if any error occur. To have the daemon keep running across errors, pass the -f flag with its value set to false (see usage above).

\`\`\`bash
$ \${HBASE_HOME}/bin/hbase canary -daemon

\`\`\`

To run repeatedly with 5 second intervals and not stop on errors, do the following.

\`\`\`bash
$ \${HBASE_HOME}/bin/hbase canary -daemon -interval 5 -f false

\`\`\`

### Force timeout if canary test stuck

In some cases the request is stuck and no response is sent back to the client. This can happen with dead RegionServers which the master has not yet noticed. Because of this we provide a timeout option to kill the canary test and return a non-zero error code. The below sets the timeout value to 60 seconds (the default value is 600 seconds).

\`\`\`bash
$ \${HBASE_HOME}/bin/hbase canary -t 60000

\`\`\`

### Enable write sniffing in canary

By default, the canary tool only checks read operations. To enable the write sniffing, you can run the canary with the \`-writeSniffing\` option set. When write sniffing is enabled, the canary tool will create an hbase table and make sure the regions of the table are distributed to all region servers. In each sniffing period, the canary will try to put data to these regions to check the write availability of each region server.

\`\`\`bash
$ \${HBASE_HOME}/bin/hbase canary -writeSniffing

\`\`\`

The default write table is \`hbase:canary\` and can be specified with the option \`-writeTable\`.

\`\`\`bash
$ \${HBASE_HOME}/bin/hbase canary -writeSniffing -writeTable ns:canary

\`\`\`

The default value size of each put is 10 bytes. You can set it via the config key: \`hbase.canary.write.value.size\`.

### Treat read / write failure as error

By default, the canary tool only logs read failures — due to e.g. RetriesExhaustedException, etc. — and will return the 'normal' exit code. To treat read/write failure as errors, you can run canary with the \`-treatFailureAsError\` option. When enabled, read/write failures will result in an error exit code.

\`\`\`bash
$ \${HBASE_HOME}/bin/hbase canary -treatFailureAsError

\`\`\`

### Running Canary in a Kerberos-enabled Cluster

To run the Canary in a Kerberos-enabled cluster, configure the following two properties in *hbase-site.xml*:

* \`hbase.client.keytab.file\`
* \`hbase.client.kerberos.principal\`

Kerberos credentials are refreshed every 30 seconds when Canary runs in daemon mode.

To configure the DNS interface for the client, configure the following optional properties in *hbase-site.xml*.

* \`hbase.client.dns.interface\`
* \`hbase.client.dns.nameserver\`

**Example Canary in a Kerberos-Enabled Cluster**\\
This example shows each of the properties with valid values.

\`\`\`xml
<property>
  <name>hbase.client.kerberos.principal</name>
  <value>hbase/_HOST@YOUR-REALM.COM</value>
</property>
<property>
  <name>hbase.client.keytab.file</name>
  <value>/etc/hbase/conf/keytab.krb5</value>
</property>

<property>
  <name>hbase.client.dns.interface</name>
  <value>default</value>
</property>
<property>
  <name>hbase.client.dns.nameserver</name>
  <value>default</value>
</property>
\`\`\`

## RegionSplitter

\`\`\`text
usage: bin/hbase regionsplitter <TABLE> <SPLITALGORITHM>
SPLITALGORITHM is the java class name of a class implementing
                      SplitAlgorithm, or one of the special strings
                      HexStringSplit or DecimalStringSplit or
                      UniformSplit, which are built-in split algorithms.
                      HexStringSplit treats keys as hexadecimal ASCII, and
                      DecimalStringSplit treats keys as decimal ASCII, and
                      UniformSplit treats keys as arbitrary bytes.
 -c <region count>        Create a new table with a pre-split number of
                          regions
 -D <property=value>      Override HBase Configuration Settings
 -f <family:family:...>   Column Families to create with new table.
                          Required with -c
    --firstrow <arg>      First Row in Table for Split Algorithm
 -h                       Print this usage help
    --lastrow <arg>       Last Row in Table for Split Algorithm
 -o <count>               Max outstanding splits that have unfinished
                          major compactions
 -r                       Perform a rolling split of an existing region
    --risky               Skip verification steps to complete
                          quickly. STRONGLY DISCOURAGED for production
                          systems.
\`\`\`

For additional detail, see [Manual Region Splitting](/docs/architecture/regions#manual-region-splitting).

## Health Checker

You can configure HBase to run a script periodically and if it fails N times (configurable), have the server exit. See *HBASE-7351 Periodic health check script* for configurations and detail.

## Driver

Several frequently-accessed utilities are provided as \`Driver\` classes, and executed by the *bin/hbase* command. These utilities represent MapReduce jobs which run on your cluster. They are run in the following way, replacing *UtilityName* with the utility you want to run. This command assumes you have set the environment variable \`HBASE_HOME\` to the directory where HBase is unpacked on your server.

\`\`\`bash
\${HBASE_HOME}/bin/hbase org.apache.hadoop.hbase.mapreduce.UtilityName
\`\`\`

The following utilities are available:

\`LoadIncrementalHFiles\`\\
Complete a bulk data load.

\`CopyTable\`\\
Export a table from the local cluster to a peer cluster.

\`Export\`\\
Write table data to HDFS.

\`Import\`\\
Import data written by a previous \`Export\` operation.

\`ImportTsv\`\\
Import data in TSV format.

\`RowCounter\`\\
Count rows in an HBase table.

\`CellCounter\`\\
Count cells in an HBase table.

\`replication.VerifyReplication\`\\
Compare the data from tables in two different clusters. WARNING: It doesn't work for incrementColumnValues'd cells since the timestamp is changed. Note that this command is in a different package than the others.

Each command except \`RowCounter\` and \`CellCounter\` accept a single \`--help\` argument to print usage instructions.

## HBase \`hbck\`

The \`hbck\` tool that shipped with hbase-1.x has been made read-only in hbase-2.x. It is not able to repair hbase-2.x clusters as hbase internals have changed. Nor should its assessments in read-only mode be trusted as it does not understand hbase-2.x operation.

A new tool, [HBase \`HBCK2\`](/docs/operational-management/tools#hbase-hbck2), described in the next section, replaces \`hbck\`.

## HBase \`HBCK2\`

\`HBCK2\` is the successor to [HBase \`HBCK\`](/docs/operational-management/tools#hbase-hbck), the hbase-1.x fix tool (A.K.A \`hbck1\`). Use it in place of \`hbck1\` making repairs against hbase-2.x installs.

\`HBCK2\` does not ship as part of hbase. It can be found as a subproject of the companion [hbase-operator-tools](https://github.com/apache/hbase-operator-tools) repository at [Apache HBase HBCK2 Tool](https://github.com/apache/hbase-operator-tools/tree/master/hbase-hbck2). \`HBCK2\` was moved out of hbase so it could evolve at a cadence apart from that of hbase core.

See the [HBCK2](https://github.com/apache/hbase-operator-tools/tree/master/hbase-hbck2) Home Page for how \`HBCK2\` differs from \`hbck1\`, and for how to build and use it.

Once built, you can run \`HBCK2\` as follows:

\`\`\`bash
$ hbase hbck -j /path/to/HBCK2.jar

\`\`\`

This will generate \`HBCK2\` usage describing commands and options.

## HFile Tool

See [HFile Tool](/docs/architecture/regions#architecture-regions-store-hfile-tool).

## WAL Tools

For bulk replaying WAL files or *recovered.edits* files, see [WALPlayer](/docs/operational-management/tools#walplayer). For reading/verifying individual files, read on.

### WALPrettyPrinter

The \`WALPrettyPrinter\` is a tool with configurable options to print the contents of a WAL or a *recovered.edits* file. You can invoke it via the HBase cli with the 'wal' command.

\`\`\`bash
 $ ./bin/hbase wal hdfs://example.org:9000/hbase/WALs/example.org,60020,1283516293161/10.10.21.10%3A60020.1283973724012
\`\`\`

<Callout type="info" title="WAL Printing in older versions of HBase">
  Prior to version 2.0, the \`WALPrettyPrinter\` was called the \`HLogPrettyPrinter\`, after an internal name for HBase's write ahead log. In those versions, you can print the contents of a WAL using the same configuration as above, but with the 'hlog' command.

  \`\`\`bash
   $ ./bin/hbase hlog hdfs://example.org:9000/hbase/.logs/example.org,60020,1283516293161/10.10.21.10%3A60020.1283973724012
  \`\`\`
</Callout>

## Compression Tool

See [compression.test](/docs/compression#compressiontest).

## CopyTable

CopyTable is a utility that can copy part or of all of a table, either to the same cluster or another cluster. The target table must first exist. The usage is as follows:

\`\`\`bash
$ ./bin/hbase org.apache.hadoop.hbase.mapreduce.CopyTable --help
/bin/hbase org.apache.hadoop.hbase.mapreduce.CopyTable --help
Usage: CopyTable [general options] [--starttime=X] [--endtime=Y] [--new.name=NEW] [--peer.adr=ADR] <tablename>

Options:
 rs.class     hbase.regionserver.class of the peer cluster,
              specify if different from current cluster
 rs.impl      hbase.regionserver.impl of the peer cluster,
 startrow     the start row
 stoprow      the stop row
 starttime    beginning of the time range (unixtime in millis)
              without endtime means from starttime to forever
 endtime      end of the time range.  Ignored if no starttime specified.
 versions     number of cell versions to copy
 new.name     new table's name
 peer.uri     The URI of the peer cluster
 peer.adr     Address of the peer cluster given in the format
              hbase.zookeeer.quorum:hbase.zookeeper.client.port:zookeeper.znode.parent
              Do not take effect if peer.uri is specified
              Deprecated, please use peer.uri instead
 families     comma-separated list of families to copy
              To copy from cf1 to cf2, give sourceCfName:destCfName.
              To keep the same name, just give "cfName"
 all.cells    also copy delete markers and deleted cells

Args:
 tablename    Name of the table to copy

Examples:
 To copy 'TestTable' to a cluster that uses replication for a 1 hour window:
 $ bin/hbase org.apache.hadoop.hbase.mapreduce.CopyTable --starttime=1265875194289 --endtime=1265878794289 --peer.adr=server1,server2,server3:2181:/hbase --families=myOldCf:myNewCf,cf2,cf3 TestTable

For performance consider the following general options:
  It is recommended that you set the following to >=100. A higher value uses more memory but
  decreases the round trip time to the server and may increase performance.
    -Dhbase.client.scanner.caching=100
  The following should always be set to false, to prevent writing data twice, which may produce
  inaccurate results.
    -Dmapred.map.tasks.speculative.execution=false
\`\`\`

Starting from 3.0.0, we introduce a \`peer.uri\` option so the \`peer.adr\` option is deprecated. Please use connection URI for specifying HBase clusters. For all previous versions, you should still use the \`peer.adr\` option.

<Callout type="info" title="Scanner Caching">
  Caching for the input Scan is configured via \`hbase.client.scanner.caching\` in the job
  configuration.
</Callout>

<Callout type="info" title="Versions">
  By default, CopyTable utility only copies the latest version of row cells unless \`--versions=n\` is
  explicitly specified in the command.
</Callout>

<Callout type="info" title="Data Load">
  CopyTable does not perform a diff, it copies all Cells in between the specified startrow/stoprow
  starttime/endtime range. This means that already existing cells with same values will still be
  copied.
</Callout>

See Jonathan Hsieh's [Online HBase Backups with CopyTable](https://blog.cloudera.com/blog/2012/06/online-hbase-backups-with-copytable-2/) blog post for more on \`CopyTable\`.

## HashTable/SyncTable

HashTable/SyncTable is a two steps tool for synchronizing table data, where each of the steps are implemented as MapReduce jobs. Similarly to CopyTable, it can be used for partial or entire table data syncing, under same or remote cluster. However, it performs the sync in a more efficient way than CopyTable. Instead of copying all cells in specified row key/time period range, HashTable (the first step) creates hashed indexes for batch of cells on source table and output those as results. On the next stage, SyncTable scans the source table and now calculates hash indexes for table cells, compares these hashes with the outputs of HashTable, then it just scans (and compares) cells for diverging hashes, only updating mismatching cells. This results in less network traffic/data transfers, which can be impacting when syncing large tables on remote clusters.

### Step 1, HashTable

First, run HashTable on the source table cluster (this is the table whose state will be copied to its counterpart).

Usage:

\`\`\`bash
$ ./bin/hbase org.apache.hadoop.hbase.mapreduce.HashTable --help
Usage: HashTable [options] <tablename> <outputpath>

Options:
 batchsize         the target amount of bytes to hash in each batch
                   rows are added to the batch until this size is reached
                   (defaults to 8000 bytes)
 numhashfiles      the number of hash files to create
                   if set to fewer than number of regions then
                   the job will create this number of reducers
                   (defaults to 1/100 of regions — at least 1)
 startrow          the start row
 stoprow           the stop row
 starttime         beginning of the time range (unixtime in millis)
                   without endtime means from starttime to forever
 endtime           end of the time range.  Ignored if no starttime specified.
 scanbatch         scanner batch size to support intra row scans
 versions          number of cell versions to include
 families          comma-separated list of families to include
 ignoreTimestamps  if true, ignores cell timestamps

Args:
 tablename     Name of the table to hash
 outputpath    Filesystem path to put the output data

Examples:
 To hash 'TestTable' in 32kB batches for a 1 hour window into 50 files:
 $ bin/hbase org.apache.hadoop.hbase.mapreduce.HashTable --batchsize=32000 --numhashfiles=50 --starttime=1265875194289 --endtime=1265878794289 --families=cf2,cf3 TestTable /hashes/testTable
\`\`\`

The **batchsize** property defines how much cell data for a given region will be hashed together in a single hash value. Sizing this properly has a direct impact on the sync efficiency, as it may lead to less scans executed by mapper tasks of SyncTable (the next step in the process). The rule of thumb is that, the smaller the number of cells out of sync (lower probability of finding a diff), larger batch size values can be determined.

### Step 2, SyncTable

Once HashTable has completed on source cluster, SyncTable can be ran on target cluster. Just like replication and other synchronization jobs, it requires that all RegionServers/DataNodes on source cluster be accessible by NodeManagers on the target cluster (where SyncTable job tasks will be running).

Usage:

\`\`\`bash
$ ./bin/hbase org.apache.hadoop.hbase.mapreduce.SyncTable --help
Usage: SyncTable [options] <sourcehashdir> <sourcetable> <targettable>

Options:
 sourceuri        Cluster connection uri of the source table
                  (defaults to cluster in classpath's config)
 sourcezkcluster  ZK cluster key of the source table
                  (defaults to cluster in classpath's config)
                  Do not take effect if sourceuri is specifie
                  Deprecated, please use sourceuri instead
 targeturi        Cluster connection uri of the target table
                  (defaults to cluster in classpath's config)
 targetzkcluster  ZK cluster key of the target table
                  (defaults to cluster in classpath's config)
                  Do not take effect if targeturi is specified
                  Deprecated, please use targeturi instead
 dryrun           if true, output counters but no writes
                  (defaults to false)
 doDeletes        if false, does not perform deletes
                  (defaults to true)
 doPuts           if false, does not perform puts
                  (defaults to true)
 ignoreTimestamps if true, ignores cells timestamps while comparing
                  cell values. Any missing cell on target then gets
                  added with current time as timestamp
                  (defaults to false)

Args:
 sourcehashdir    path to HashTable output dir for source table
                  (see org.apache.hadoop.hbase.mapreduce.HashTable)
 sourcetable      Name of the source table to sync from
 targettable      Name of the target table to sync to

Examples:
 For a dry run SyncTable of tableA from a remote source cluster
 to a local target cluster:
 $ bin/hbase org.apache.hadoop.hbase.mapreduce.SyncTable --dryrun=true --sourcezkcluster=zk1.example.com,zk2.example.com,zk3.example.com:2181:/hbase hdfs://nn:9000/hashes/tableA tableA tableA
\`\`\`

Starting from 3.0.0, we introduce \`sourceuri\` and \`targeturi\` options so \`sourcezkcluster\` and \`targetzkcluster\` are deprecated. Please use connection URI for specifying HBase clusters. For all previous versions, you should still use \`sourcezkcluster\` and \`targetzkcluster\`.

Cell comparison takes ROW/FAMILY/QUALIFIER/TIMESTAMP/VALUE into account for equality. When syncing at the target, missing cells will be added with original timestamp value from source. That may cause unexpected results after SyncTable completes, for example, if missing cells on target have a delete marker with a timestamp T2 (say, a bulk delete performed by mistake), but source cells timestamps have an older value T1, then those cells would still be unavailable at target because of the newer delete marker timestamp. Since cell timestamps might not be relevant to all use cases, *ignoreTimestamps* option adds the flexibility to avoid using cells timestamp in the comparison. When using *ignoreTimestamps* set to true, this option must be specified for both HashTable and SyncTable steps.

The **dryrun** option is useful when a read only, diff report is wanted, as it will produce only COUNTERS indicating the differences, but will not perform any actual changes. It can be used as an alternative to VerifyReplication tool.

By default, SyncTable will cause target table to become an exact copy of source table (at least, for the specified startrow/stoprow or/and starttime/endtime).

Setting doDeletes to false modifies default behaviour to not delete target cells that are missing on source. Similarly, setting doPuts to false modifies default behaviour to not add missing cells on target. Setting both doDeletes and doPuts to false would give same effect as setting dryrun to true.

<Callout type="info" title="Additional info on doDeletes/doPuts">
  "doDeletes/doPuts" were only added by
  [HBASE-20305](https://issues.apache.org/jira/browse/HBASE-20305), so these may not be available on
  all released versions. For major 1.x versions, minimum minor release including it is **1.4.10**.
  For major 2.x versions, minimum minor release including it is **2.1.5**.
</Callout>

<Callout type="info" title="Additional info on ignoreTimestamps">
  "ignoreTimestamps" was only added by
  [HBASE-24302](https://issues.apache.org/jira/browse/HBASE-24302), so it may not be available on
  all released versions. For major 1.x versions, minimum minor release including it is **1.4.14**.
  For major 2.x versions, minimum minor release including it is **2.2.5**.
</Callout>

<Callout type="info" title="Set doDeletes to false on Two-Way Replication scenarios">
  On Two-Way Replication or other scenarios where both source and target clusters can have data
  ingested, it's advisable to always set doDeletes option to false, as any additional cell inserted
  on SyncTable target cluster and not yet replicated to source would be deleted, and potentially
  lost permanently.
</Callout>

<Callout type="info" title="Set sourcezkcluster to the actual source cluster ZK quorum">
  Although not required, if sourcezkcluster is not set, SyncTable will connect to local HBase
  cluster for both source and target, which does not give any meaningful result.
</Callout>

<Callout type="info" title="Remote Clusters on different Kerberos Realms">
  Often, remote clusters may be deployed on different Kerberos Realms.
  [HBASE-20586](https://issues.apache.org/jira/browse/HBASE-20586) added SyncTable support for cross
  realm authentication, allowing a SyncTable process running on target cluster to connect to source
  cluster and read both HashTable output files and the given HBase table when performing the
  required comparisons.
</Callout>

## Export

Export is a utility that will dump the contents of table to HDFS in a sequence file. The Export can be run via a Coprocessor Endpoint or MapReduce. Invoke via:

**mapreduce-based Export**

\`\`\`bash
$ bin/hbase org.apache.hadoop.hbase.mapreduce.Export TABLENAME OUTPUTDIR [VERSIONS [STARTTIME [ENDTIME]]]
\`\`\`

**endpoint-based Export**

<Callout type="info">
  Make sure the Export coprocessor is enabled by adding \`org.apache.hadoop.hbase.coprocessor.Export\`
  to \`hbase.coprocessor.region.classes\`.
</Callout>

\`\`\`bash
$ bin/hbase org.apache.hadoop.hbase.coprocessor.Export TABLENAME OUTPUTDIR [VERSIONS [STARTTIME [ENDTIME]]]
\`\`\`

The outputdir is a HDFS directory that does not exist prior to the export. When done, the exported files will be owned by the user invoking the export command.

**The Comparison of Endpoint-based Export And Mapreduce-based Export**

|                           | Endpoint-based Export                                           | Mapreduce-based Export                                           |
| ------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| HBase version requirement | 2.0+                                                            | 0.2.1+                                                           |
| Maven dependency          | hbase-endpoint                                                  | hbase-mapreduce (2.0+), hbase-server(prior to 2.0)               |
| Requirement before dump   | mount the endpoint.Export on the target table                   | deploy the MapReduce framework                                   |
| Read latency              | low, directly read the data from region                         | normal, traditional RPC scan                                     |
| Read Scalability          | depend on number of regions                                     | depend on number of mappers (see TableInputFormatBase#getSplits) |
| Timeout                   | operation timeout. configured by hbase.client.operation.timeout | scan timeout. configured by hbase.client.scanner.timeout.period  |
| Permission requirement    | READ, EXECUTE                                                   | READ                                                             |
| Fault tolerance           | no                                                              | depend on MapReduce                                              |

<Callout type="info">
  To see usage instructions, run the command with no options. Available options include specifying
  column families and applying filters during the export.
</Callout>

By default, the \`Export\` tool only exports the newest version of a given cell, regardless of the number of versions stored. To export more than one version, replace ***\\<versions>*** with the desired number of versions.

For mapreduce based Export, if you want to export cell tags then set the following config property \`hbase.client.rpc.codec\` to \`org.apache.hadoop.hbase.codec.KeyValueCodecWithTags\`

Note: caching for the input Scan is configured via \`hbase.client.scanner.caching\` in the job configuration.

## Import

Import is a utility that will load data that has been exported back into HBase. Invoke via:

\`\`\`bash
$ bin/hbase -Dhbase.import.version=0.94 org.apache.hadoop.hbase.mapreduce.Import <tablename> <inputdir>
\`\`\`

<Callout type="info">
  To see usage instructions, run the command with no options.
</Callout>

To import 0.94 exported files in a 0.96 cluster or onwards, you need to set system property "hbase.import.version" when running the import command as below:

\`\`\`bash
$ bin/hbase -Dhbase.import.version=0.94 org.apache.hadoop.hbase.mapreduce.Import TABLENAME INPUTDIR
\`\`\`

If you want to import cell tags then set the following config property \`hbase.client.rpc.codec\` to \`org.apache.hadoop.hbase.codec.KeyValueCodecWithTags\`

## ImportTsv

ImportTsv is a utility that will load data in TSV format into HBase. It has two distinct usages: loading data from TSV format in HDFS into HBase via Puts, and preparing StoreFiles to be loaded via the \`completebulkload\`.

To load data via Puts (i.e., non-bulk loading):

\`\`\`bash
$ bin/hbase org.apache.hadoop.hbase.mapreduce.ImportTsv -Dimporttsv.columns=a,b,c <tablename> <hdfs-inputdir>
\`\`\`

To generate StoreFiles for bulk-loading:

\`\`\`bash
$ bin/hbase org.apache.hadoop.hbase.mapreduce.ImportTsv -Dimporttsv.columns=a,b,c -Dimporttsv.bulk.output=hdfs://storefile-outputdir <tablename> <hdfs-data-inputdir>
\`\`\`

These generated StoreFiles can be loaded into HBase via [completebulkload](/docs/operational-management/tools#completebulkload).

### ImportTsv Options

Running \`ImportTsv\` with no arguments prints brief usage information:

\`\`\`text
Usage: importtsv -Dimporttsv.columns=a,b,c TABLENAME INPUTDIR

Imports the given input directory of TSV data into the specified table.

The column names of the TSV data must be specified using the -Dimporttsv.columns
option. This option takes the form of comma-separated column names, where each
column name is either a simple column family, or a columnfamily:qualifier. The special
column name HBASE_ROW_KEY is used to designate that this column should be used
as the row key for each imported record. You must specify exactly one column
to be the row key, and you must specify a column name for every column that exists in the
input data.

By default importtsv will load data directly into HBase. To instead generate
HFiles of data to prepare for a bulk data load, pass the option:
  -Dimporttsv.bulk.output=/path/for/output
  Note: the target table will be created with default column family descriptors if it does not already exist.

Other options that may be specified with -D include:
  -Dimporttsv.skip.bad.lines=false - fail if encountering an invalid line
  '-Dimporttsv.separator=|' - eg separate on pipes instead of tabs
  -Dimporttsv.timestamp=currentTimeAsLong - use the specified timestamp for the import
  -Dimporttsv.mapper.class=my.Mapper - A user-defined Mapper to use instead of org.apache.hadoop.hbase.mapreduce.TsvImporterMapper

\`\`\`

### ImportTsv Example

For example, assume that we are loading data into a table called 'datatsv' with a ColumnFamily called 'd' with two columns "c1" and "c2".

Assume that an input file exists as follows:

\`\`\`text
row1    c1  c2
row2    c1  c2
row3    c1  c2
row4    c1  c2
row5    c1  c2
row6    c1  c2
row7    c1  c2
row8    c1  c2
row9    c1  c2
row10   c1  c2

\`\`\`

For ImportTsv to use this input file, the command line needs to look like this:

\`\`\`bash
 HADOOP_CLASSPATH=\`\${HBASE_HOME}/bin/hbase classpath\` \${HADOOP_HOME}/bin/hadoop jar \${HBASE_HOME}/hbase-mapreduce-VERSION.jar importtsv -Dimporttsv.columns=HBASE_ROW_KEY,d:c1,d:c2 -Dimporttsv.bulk.output=hdfs://storefileoutput datatsv hdfs://inputfile

\`\`\`

... and in this example the first column is the rowkey, which is why the HBASE\\_ROW\\_KEY is used. The second and third columns in the file will be imported as "d:c1" and "d:c2", respectively.

### ImportTsv Warning

If you have preparing a lot of data for bulk loading, make sure the target HBase table is pre-split appropriately.

### See Also

For more information about bulk-loading HFiles into HBase, see [arch.bulk.load](/docs/architecture/bulk-loading)

## CompleteBulkLoad

The \`completebulkload\` utility will move generated StoreFiles into an HBase table. This utility is often used in conjunction with output from [importtsv](/docs/operational-management/tools#importtsv).

There are two ways to invoke this utility, with explicit classname and via the driver:

**Explicit Classname**

\`\`\`bash
$ bin/hbase org.apache.hadoop.hbase.tool.LoadIncrementalHFiles hdfs://storefileoutput TABLENAME

\`\`\`

**Driver**

\`\`\`bash
HADOOP_CLASSPATH=\`\${HBASE_HOME}/bin/hbase classpath\` \${HADOOP_HOME}/bin/hadoop jar \${HBASE_HOME}/hbase-mapreduce-VERSION.jar completebulkload hdfs://storefileoutput TABLENAME

\`\`\`

### CompleteBulkLoad Warning

Data generated via MapReduce is often created with file permissions that are not compatible with the running HBase process. Assuming you're running HDFS with permissions enabled, those permissions will need to be updated before you run CompleteBulkLoad.

For more information about bulk-loading HFiles into HBase, see [arch.bulk.load](/docs/architecture/bulk-loading).

## WALPlayer

WALPlayer is a utility to replay WAL files into HBase.

The WAL can be replayed for a set of tables or all tables, and a timerange can be provided (in milliseconds). The WAL is filtered to this set of tables. The output can optionally be mapped to another set of tables.

WALPlayer can also generate HFiles for later bulk importing, in that case only a single table and no mapping can be specified.

Finally, you can use WALPlayer to replay the content of a Regions \`recovered.edits\` directory (the files under \`recovered.edits\` directory have the same format as WAL files).

<Callout type="info" title="WALPrettyPrinter">
  To read or verify single WAL files or *recovered.edits* files, since they share the WAL format,
  see [WAL Tools](/docs/operational-management/tools#wal-tools).
</Callout>

Invoke via:

\`\`\`bash
$ bin/hbase org.apache.hadoop.hbase.mapreduce.WALPlayer [options] <WAL inputdir> [<tables> <tableMappings>]>
\`\`\`

For example:

\`\`\`bash
$ bin/hbase org.apache.hadoop.hbase.mapreduce.WALPlayer /backuplogdir oldTable1,oldTable2 newTable1,newTable2
\`\`\`

WALPlayer, by default, runs as a mapreduce job. To NOT run WALPlayer as a mapreduce job on your cluster, force it to run all in the local process by adding the flags \`-Dmapreduce.jobtracker.address=local\` on the command line.

### WALPlayer Options

Running \`WALPlayer\` with no arguments prints brief usage information:

\`\`\`text
Usage: WALPlayer [options] <WAL inputdir> [<tables> <tableMappings>]
 <WAL inputdir>   directory of WALs to replay.
 <tables>         comma separated list of tables. If no tables specified,
                  all are imported (even hbase:meta if present).
 <tableMappings>  WAL entries can be mapped to a new set of tables by passing
                  <tableMappings>, a comma separated list of target tables.
                  If specified, each table in <tables> must have a mapping.
To generate HFiles to bulk load instead of loading HBase directly, pass:
 -Dwal.bulk.output=/path/for/output
 Only one table can be specified, and no mapping allowed!
To specify a time range, pass:
 -Dwal.start.time=[date|ms]
 -Dwal.end.time=[date|ms]
 The start and the end date of timerange (inclusive). The dates can be
 expressed in milliseconds-since-epoch or yyyy-MM-dd'T'HH:mm:ss.SS format.
 E.g. 1234567890120 or 2009-02-13T23:32:30.12
Other options:
 -Dmapreduce.job.name=jobName
 Use the specified mapreduce job name for the wal player
 -Dwal.input.separator=' '
 Change WAL filename separator (WAL dir names use default ','.)
For performance also consider the following options:
  -Dmapreduce.map.speculative=false
  -Dmapreduce.reduce.speculative=false
\`\`\`

## RowCounter

[RowCounter](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/RowCounter.html) is a mapreduce job to count all the rows of a table. This is a good utility to use as a sanity check to ensure that HBase can read all the blocks of a table if there are any concerns of metadata inconsistency. It will run the mapreduce all in a single process but it will run faster if you have a MapReduce cluster in place for it to exploit. It is possible to limit the time range of data to be scanned by using the \`--starttime=[starttime]\` and \`--endtime=[endtime]\` flags. The scanned data can be limited based on keys using the \`--range=[startKey],[endKey][;[startKey],[endKey]...]\` option.

\`\`\`bash
$ bin/hbase rowcounter [options] <tablename> [--starttime=<start> --endtime=<end>] [--range=[startKey],[endKey][;[startKey],[endKey]...]] [<column1> <column2>...]
\`\`\`

RowCounter only counts one version per cell.

For performance consider to use \`-Dhbase.client.scanner.caching=100\` and \`-Dmapreduce.map.speculative=false\` options.

## CellCounter

HBase ships another diagnostic mapreduce job called [CellCounter](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/CellCounter.html). Like RowCounter, it gathers more fine-grained statistics about your table. The statistics gathered by CellCounter are more fine-grained and include:

* Total number of rows in the table.
* Total number of CFs across all rows.
* Total qualifiers across all rows.
* Total occurrence of each CF.
* Total occurrence of each qualifier.
* Total number of versions of each qualifier.

The program allows you to limit the scope of the run. Provide a row regex or prefix to limit the rows to analyze. Specify a time range to scan the table by using the \`--starttime=<starttime>\` and \`--endtime=<endtime>\` flags.

Use \`hbase.mapreduce.scan.column.family\` to specify scanning a single column family.

\`\`\`bash
$ bin/hbase cellcounter TABLENAME OUTPUT_DIR [reportSeparator] [regex or prefix] [--starttime=STARTTIME --endtime=ENDTIME]
\`\`\`

Note: just like RowCounter, caching for the input Scan is configured via \`hbase.client.scanner.caching\` in the job configuration.

## mlockall

It is possible to optionally pin your servers in physical memory making them less likely to be swapped out in oversubscribed environments by having the servers call [mlockall](http://linux.die.net/man/2/mlockall) on startup. See [HBASE-4391 Add ability to start RS as root and call mlockall](https://issues.apache.org/jira/browse/HBASE-4391) for how to build the optional library and have it run on startup.

## Offline Compaction Tool

**CompactionTool** provides a way of running compactions (either minor or major) as an independent process from the RegionServer. It reuses same internal implementation classes executed by RegionServer compaction feature. However, since this runs on a complete separate independent java process, it releases RegionServers from the overhead involved in rewrite a set of hfiles, which can be critical for latency sensitive use cases.

Usage:

\`\`\`
$ ./bin/hbase org.apache.hadoop.hbase.regionserver.CompactionTool

Usage: java org.apache.hadoop.hbase.regionserver.CompactionTool \\
  [-compactOnce] [-major] [-mapred] [-D<property=value>]* files...

Options:
 mapred         Use MapReduce to run compaction.
 compactOnce    Execute just one compaction step. (default: while needed)
 major          Trigger major compaction.

Note: -D properties will be applied to the conf used.
For example:
 To stop delete of compacted file, pass -Dhbase.compactiontool.delete=false
 To set tmp dir, pass -Dhbase.tmp.dir=ALTERNATE_DIR

Examples:
 To compact the full 'TestTable' using MapReduce:
 $ hbase org.apache.hadoop.hbase.regionserver.CompactionTool -mapred hdfs://hbase/data/default/TestTable

 To compact column family 'x' of the table 'TestTable' region 'abc':
 $ hbase org.apache.hadoop.hbase.regionserver.CompactionTool hdfs://hbase/data/default/TestTable/abc/x
\`\`\`

As shown by usage options above, **CompactionTool** can run as a standalone client or a mapreduce job. When running as mapreduce job, each family dir is handled as an input split, and is processed by a separate map task.

The **compactionOnce** parameter controls how many compaction cycles will be performed until **CompactionTool** program decides to finish its work. If omitted, it will assume it should keep running compactions on each specified family as determined by the given compaction policy configured. For more info on compaction policy, see [compaction](/docs/architecture/regions#compaction).

If a major compaction is desired, **major** flag can be specified. If omitted, **CompactionTool** will assume minor compaction is wanted by default.

It also allows for configuration overrides with \`-D\` flag. In the usage section above, for example, \`-Dhbase.compactiontool.delete=false\` option will instruct compaction engine to not delete original files from temp folder.

Files targeted for compaction must be specified as parent hdfs dirs. It allows for multiple dirs definition, as long as each for these dirs are either a **family**, a **region**, or a **table** dir. If a table or region dir is passed, the program will recursively iterate through related sub-folders, effectively running compaction for each family found below the table/region level.

Since these dirs are nested under **hbase** hdfs directory tree, **CompactionTool** requires hbase super user permissions in order to have access to required hfiles.

<Callout type="info" title="Running in MapReduce mode">
  MapReduce mode offers the ability to process each family dir in parallel, as a separate map task.
  Generally, it would make sense to run in this mode when specifying one or more table dirs as
  targets for compactions. The caveat, though, is that if number of families to be compacted become
  too large, the related mapreduce job may have indirect impacts on **RegionServers** performance .
  Since **NodeManagers** are normally co-located with RegionServers, such large jobs could compete
  for IO/Bandwidth resources with the **RegionServers**.
</Callout>

<Callout type="info" title="MajorCompaction completely disabled on RegionServers due performance impacts">
  **Major compactions** can be a costly operation (see
  [compaction](/docs/architecture/regions#compaction)), and can indeed impact performance on
  RegionServers, leading operators to completely disable it for critical low latency application.
  **CompactionTool** could be used as an alternative in such scenarios, although, additional custom
  application logic would need to be implemented, such as deciding scheduling and selection of
  tables/regions/families target for a given compaction run.
</Callout>

For additional details about CompactionTool, see also [CompactionTool](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/regionserver/CompactionTool.html).

## \`hbase clean\`

The \`hbase clean\` command cleans HBase data from ZooKeeper, HDFS, or both. It is appropriate to use for testing. Run it with no options for usage instructions. The \`hbase clean\` command was introduced in HBase 0.98.

\`\`\`text
$ bin/hbase clean
Usage: hbase clean (--cleanZk|--cleanHdfs|--cleanAll)
Options:
    --cleanZk   cleans hbase related data from zookeeper.
    --cleanHdfs cleans hbase related data from hdfs.
    --cleanAll  cleans hbase related data from both zookeeper and hdfs.
\`\`\`

## \`hbase pe\`

The \`hbase pe\` command runs the PerformanceEvaluation tool, which is used for testing.

The PerformanceEvaluation tool accepts many different options and commands. For usage instructions, run the command with no options.

The PerformanceEvaluation tool has received many updates in recent HBase releases, including support for namespaces, support for tags, cell-level ACLs and visibility labels, multiget support for RPC calls, increased sampling sizes, an option to randomly sleep during testing, and ability to "warm up" the cluster before testing starts.

## \`hbase ltt\`

The \`hbase ltt\` command runs the LoadTestTool utility, which is used for testing.

You must specify either \`-init_only\` or at least one of \`-write\`, \`-update\`, or \`-read\`. For general usage instructions, pass the \`-h\` option.

The LoadTestTool has received many updates in recent HBase releases, including support for namespaces, support for tags, cell-level ACLS and visibility labels, testing security-related features, ability to specify the number of regions per server, tests for multi-get RPC calls, and tests relating to replication.

## Pre-Upgrade validator

Pre-Upgrade validator tool can be used to check the cluster for known incompatibilities before upgrading from HBase 1 to HBase 2.

\`\`\`bash
$ bin/hbase pre-upgrade command ...
\`\`\`

### Coprocessor validation

HBase supports co-processors for a long time, but the co-processor API can be changed between major releases. Co-processor validator tries to determine whether the old co-processors are still compatible with the actual HBase version.

\`\`\`bash
$ bin/hbase pre-upgrade validate-cp [-jar ...] [-class ... | -table ... | -config]
Options:
 -e            Treat warnings as errors.
 -jar <arg>    Jar file/directory of the coprocessor.
 -table <arg>  Table coprocessor(s) to check.
 -class <arg>  Coprocessor class(es) to check.
 -config         Scan jar for observers.
\`\`\`

The co-processor classes can be explicitly declared by \`-class\` option, or they can be obtained from HBase configuration by \`-config\` option. Table level co-processors can be also checked by \`-table\` option. The tool searches for co-processors on its classpath, but it can be extended by the \`-jar\` option. It is possible to test multiple classes with multiple \`-class\`, multiple tables with multiple \`-table\` options as well as adding multiple jars to the classpath with multiple \`-jar\` options.

The tool can report errors and warnings. Errors mean that HBase won't be able to load the coprocessor, because it is incompatible with the current version of HBase. Warnings mean that the co-processors can be loaded, but they won't work as expected. If \`-e\` option is given, then the tool will also fail for warnings.

Please note that this tool cannot validate every aspect of jar files, it just does some static checks.

For example:

\`\`\`bash
$ bin/hbase pre-upgrade validate-cp -jar my-coprocessor.jar -class MyMasterObserver -class MyRegionObserver
\`\`\`

It validates \`MyMasterObserver\` and \`MyRegionObserver\` classes which are located in \`my-coprocessor.jar\`.

\`\`\`bash
$ bin/hbase pre-upgrade validate-cp -table .*
\`\`\`

It validates every table level co-processors where the table name matches to \`.*\` regular expression.

### DataBlockEncoding validation

HBase 2.0 removed \`PREFIX_TREE\` Data Block Encoding from column families. For further information please check [*prefix-tree* encoding removed](/docs/upgrading/paths#prefix-tree-encoding-removed-toc). To verify that none of the column families are using incompatible Data Block Encodings in the cluster run the following command.

\`\`\`bash
$ bin/hbase pre-upgrade validate-dbe
\`\`\`

This check validates all column families and print out any incompatibilities. For example:

\`\`\`
2018-07-13 09:58:32,028 WARN  [main] tool.DataBlockEncodingValidator: Incompatible DataBlockEncoding for table: t, cf: f, encoding: PREFIX_TREE
\`\`\`

Which means that Data Block Encoding of table \`t\`, column family \`f\` is incompatible. To fix, use \`alter\` command in HBase shell:

\`\`\`ruby
alter 't', { NAME => 'f', DATA_BLOCK_ENCODING => 'FAST_DIFF' }
\`\`\`

Please also validate HFiles, which is described in the next section.

### HFile Content validation

Even though Data Block Encoding is changed from \`PREFIX_TREE\` it is still possible to have HFiles that contain data encoded that way. To verify that HFiles are readable with HBase 2 please use *HFile content validator*.

\`\`\`bash
$ bin/hbase pre-upgrade validate-hfile
\`\`\`

The tool will log the corrupt HFiles and details about the root cause. If the problem is about PREFIX\\_TREE encoding it is necessary to change encodings before upgrading to HBase 2.

The following log message shows an example of incorrect HFiles.

\`\`\`text
2018-06-05 16:20:46,976 WARN  [hfilevalidator-pool1-t3] hbck.HFileCorruptionChecker: Found corrupt HFile hdfs://example.com:9000/hbase/data/default/t/72ea7f7d625ee30f959897d1a3e2c350/prefix/7e6b3d73263c4851bf2b8590a9b3791e
org.apache.hadoop.hbase.io.hfile.CorruptHFileException: Problem reading HFile Trailer from file hdfs://example.com:9000/hbase/data/default/t/72ea7f7d625ee30f959897d1a3e2c350/prefix/7e6b3d73263c4851bf2b8590a9b3791e
    ...
Caused by: java.io.IOException: Invalid data block encoding type in file info: PREFIX_TREE
    ...
Caused by: java.lang.IllegalArgumentException: No enum constant org.apache.hadoop.hbase.io.encoding.DataBlockEncoding.PREFIX_TREE
    ...
2018-06-05 16:20:47,322 INFO  [main] tool.HFileContentValidator: Corrupted file: hdfs://example.com:9000/hbase/data/default/t/72ea7f7d625ee30f959897d1a3e2c350/prefix/7e6b3d73263c4851bf2b8590a9b3791e
2018-06-05 16:20:47,383 INFO  [main] tool.HFileContentValidator: Corrupted file: hdfs://example.com:9000/hbase/archive/data/default/t/56be41796340b757eb7fff1eb5e2a905/f/29c641ae91c34fc3bee881f45436b6d1
\`\`\`

#### Fixing PREFIX\\_TREE errors

It's possible to get \`PREFIX_TREE\` errors after changing Data Block Encoding to a supported one. It can happen because there are some HFiles which still encoded with \`PREFIX_TREE\` or there are still some snapshots.

For fixing HFiles, please run a major compaction on the table (it was \`default:t\` according to the log message):

\`\`\`ruby
major_compact 't'
\`\`\`

HFiles can be referenced from snapshots, too. It's the case when the HFile is located under \`archive/data\`. The first step is to determine which snapshot references that HFile (the name of the file was \`29c641ae91c34fc3bee881f45436b6d1\` according to the logs):

\`\`\`bash
for snapshot in $(hbase snapshotinfo -list-snapshots 2> /dev/null | tail -n -1 | cut -f 1 -d \\|);
do
  echo "checking snapshot named '\${snapshot}'";
  hbase snapshotinfo -snapshot "\${snapshot}" -files 2> /dev/null | grep 29c641ae91c34fc3bee881f45436b6d1;
done
\`\`\`

The output of this shell script is:

\`\`\`text
checking snapshot named 't_snap'
   1.0 K t/56be41796340b757eb7fff1eb5e2a905/f/29c641ae91c34fc3bee881f45436b6d1 (archive)
\`\`\`

Which means \`t_snap\` snapshot references the incompatible HFile. If the snapshot is still needed, then it has to be recreated with HBase shell:

\`\`\`text
# creating a new namespace for the cleanup process
create_namespace 'pre_upgrade_cleanup'

# creating a new snapshot
clone_snapshot 't_snap', 'pre_upgrade_cleanup:t'
alter 'pre_upgrade_cleanup:t', { NAME => 'f', DATA_BLOCK_ENCODING => 'FAST_DIFF' }
major_compact 'pre_upgrade_cleanup:t'

# removing the invalid snapshot
delete_snapshot 't_snap'

# creating a new snapshot
snapshot 'pre_upgrade_cleanup:t', 't_snap'

# removing temporary table
disable 'pre_upgrade_cleanup:t'
drop 'pre_upgrade_cleanup:t'
drop_namespace 'pre_upgrade_cleanup'
\`\`\`

For further information, please refer to [HBASE-20649](https://issues.apache.org/jira/browse/HBASE-20649?focusedCommentId=16535476#comment-16535476).

## Data Block Encoding Tool

Tests various compression algorithms with different data block encoder for key compression on an existing HFile. Useful for testing, debugging and benchmarking.

You must specify \`-f\` which is the full path of the HFile.

The result shows both the performance (MB/s) of compression/decompression and encoding/decoding, and the data savings on the HFile.

\`\`\`bash
$ bin/hbase org.apache.hadoop.hbase.regionserver.DataBlockEncodingTool
Usages: hbase org.apache.hadoop.hbase.regionserver.DataBlockEncodingTool
Options:
        -f HFile to analyse (REQUIRED)
        -n Maximum number of key/value pairs to process in a single benchmark run.
        -b Whether to run a benchmark to measure read throughput.
        -c If this is specified, no correctness testing will be done.
        -a What kind of compression algorithm use for test. Default value: GZ.
        -t Number of times to run each benchmark. Default value: 12.
        -omit Number of first runs of every benchmark to omit from statistics. Default value: 2.
\`\`\`

## HBase Conf Tool

HBase Conf tool can be used to print out the current value of a configuration. It can be used by passing the configuration key on the command-line.

\`\`\`bash
$ bin/hbase org.apache.hadoop.hbase.util.HBaseConfTool <configuration_key>
\`\`\`
`,h={title:"HBase Tools and Utilities",description:"Command-line tools for HBase administration, analysis, and debugging including canary, HBCK2, WAL tools, and MapReduce utilities."},o=[{href:"/docs/shell"},{href:"/docs/upgrading"},{href:"/docs/thrift-filter-language"},{href:"/docs/architecture/regions#manual-region-splitting"},{href:"/docs/operational-management/tools#hbase-hbck2"},{href:"/docs/operational-management/tools#hbase-hbck"},{href:"https://github.com/apache/hbase-operator-tools"},{href:"https://github.com/apache/hbase-operator-tools/tree/master/hbase-hbck2"},{href:"https://github.com/apache/hbase-operator-tools/tree/master/hbase-hbck2"},{href:"/docs/architecture/regions#architecture-regions-store-hfile-tool"},{href:"/docs/operational-management/tools#walplayer"},{href:"/docs/compression#compressiontest"},{href:"https://blog.cloudera.com/blog/2012/06/online-hbase-backups-with-copytable-2/"},{href:"https://issues.apache.org/jira/browse/HBASE-20305"},{href:"https://issues.apache.org/jira/browse/HBASE-24302"},{href:"https://issues.apache.org/jira/browse/HBASE-20586"},{href:"/docs/operational-management/tools#completebulkload"},{href:"/docs/architecture/bulk-loading"},{href:"/docs/operational-management/tools#importtsv"},{href:"/docs/architecture/bulk-loading"},{href:"/docs/operational-management/tools#wal-tools"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/RowCounter.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/CellCounter.html"},{href:"http://linux.die.net/man/2/mlockall"},{href:"https://issues.apache.org/jira/browse/HBASE-4391"},{href:"/docs/architecture/regions#compaction"},{href:"/docs/architecture/regions#compaction"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/regionserver/CompactionTool.html"},{href:"/docs/upgrading/paths#prefix-tree-encoding-removed-toc"},{href:"https://issues.apache.org/jira/browse/HBASE-20649?focusedCommentId=16535476#comment-16535476"}],c={contents:[{heading:void 0,content:"HBase provides several tools for administration, analysis, and debugging of your cluster. The entry-point to most of these tools is the *bin/hbase* command, though some tools are available in the &#x2A;dev-support/* directory."},{heading:void 0,content:"To see usage instructions for *bin/hbase* command, run it with no arguments, or with the `-h` argument. These are the usage instructions for HBase 0.98.x. Some commands, such as `version`, `pe`, `ltt`, `clean`, are not available in previous versions."},{heading:void 0,content:"Some of the tools and utilities below are Java classes which are passed directly to the *bin/hbase* command, as referred to in the last line of the usage instructions. Others, such as `hbase shell` (The Apache HBase Shell), `hbase upgrade` (Upgrading), and `hbase thrift` (Thrift API and Filter Language), are documented elsewhere in this guide."},{heading:"canary",content:`The Canary tool can help users "canary-test" the HBase cluster status. The default "region mode" fetches a row from every column-family of every regions. In "regionserver mode", the Canary tool will fetch a row from a random region on each of the cluster's RegionServers. In "zookeeper mode", the Canary will read the root znode on each member of the zookeeper ensemble.`},{heading:"canary",content:'To see usage, pass the `-help` parameter (if you pass no parameters, the Canary tool starts executing in the default region "mode" fetching a row from every region in the cluster).'},{heading:"canary",content:"The `Sink` class is instantiated using the `hbase.canary.sink.class` configuration property."},{heading:"canary",content:"This tool will return non zero error codes to user for collaborating with other monitoring tools, such as Nagios. The error code definitions are:"},{heading:"canary",content:"Here are some examples based on the following given case: given two Table objects called test-01 and test-02 each with two column family cf1 and cf2 respectively, deployed on 3 RegionServers. See the following table."},{heading:"canary",content:"RegionServer"},{heading:"canary",content:"test-01"},{heading:"canary",content:"test-02"},{heading:"canary",content:"rs1"},{heading:"canary",content:"r1"},{heading:"canary",content:"r2"},{heading:"canary",content:"rs2"},{heading:"canary",content:"r2"},{heading:"canary",content:"rs3"},{heading:"canary",content:"r2"},{heading:"canary",content:"r1"},{heading:"canary",content:"Following are some example outputs based on the previous given case."},{heading:"canary-test-for-every-column-family-store-of-every-region-of-every-table",content:'So you can see, table test-01 has two regions and two column families, so the Canary tool in the default "region mode" will pick 4 small piece of data from 4 (2 region \\* 2 store) different stores. This is a default behavior.'},{heading:"canary-test-for-every-column-family-store-of-every-region-of-a-specific-tables",content:"You can also test one or more specific tables by passing table names."},{heading:"canary-test-with-regionserver-granularity",content:'In "regionserver mode", the Canary tool will pick one small piece of data from each RegionServer (You can also pass one or more RegionServer names as arguments to the canary-test when in "regionserver mode").'},{heading:"canary-test-with-regular-expression-pattern",content:'You can pass regexes for table names when in "region mode" or for servernames when in "regionserver mode". The below will test both table test-01 and test-02.'},{heading:"run-canary-test-as-a-daemon",content:"Run repeatedly with an interval defined via the option `-interval` (default value is 60 seconds). This daemon will stop itself and return non-zero error code if any error occur. To have the daemon keep running across errors, pass the -f flag with its value set to false (see usage above)."},{heading:"run-canary-test-as-a-daemon",content:"To run repeatedly with 5 second intervals and not stop on errors, do the following."},{heading:"force-timeout-if-canary-test-stuck",content:"In some cases the request is stuck and no response is sent back to the client. This can happen with dead RegionServers which the master has not yet noticed. Because of this we provide a timeout option to kill the canary test and return a non-zero error code. The below sets the timeout value to 60 seconds (the default value is 600 seconds)."},{heading:"enable-write-sniffing-in-canary",content:"By default, the canary tool only checks read operations. To enable the write sniffing, you can run the canary with the `-writeSniffing` option set. When write sniffing is enabled, the canary tool will create an hbase table and make sure the regions of the table are distributed to all region servers. In each sniffing period, the canary will try to put data to these regions to check the write availability of each region server."},{heading:"enable-write-sniffing-in-canary",content:"The default write table is `hbase:canary` and can be specified with the option `-writeTable`."},{heading:"enable-write-sniffing-in-canary",content:"The default value size of each put is 10 bytes. You can set it via the config key: `hbase.canary.write.value.size`."},{heading:"treat-read--write-failure-as-error",content:"By default, the canary tool only logs read failures — due to e.g. RetriesExhaustedException, etc. — and will return the 'normal' exit code. To treat read/write failure as errors, you can run canary with the `-treatFailureAsError` option. When enabled, read/write failures will result in an error exit code."},{heading:"running-canary-in-a-kerberos-enabled-cluster",content:"To run the Canary in a Kerberos-enabled cluster, configure the following two properties in *hbase-site.xml*:"},{heading:"running-canary-in-a-kerberos-enabled-cluster",content:"`hbase.client.keytab.file`"},{heading:"running-canary-in-a-kerberos-enabled-cluster",content:"`hbase.client.kerberos.principal`"},{heading:"running-canary-in-a-kerberos-enabled-cluster",content:"Kerberos credentials are refreshed every 30 seconds when Canary runs in daemon mode."},{heading:"running-canary-in-a-kerberos-enabled-cluster",content:"To configure the DNS interface for the client, configure the following optional properties in *hbase-site.xml*."},{heading:"running-canary-in-a-kerberos-enabled-cluster",content:"`hbase.client.dns.interface`"},{heading:"running-canary-in-a-kerberos-enabled-cluster",content:"`hbase.client.dns.nameserver`"},{heading:"running-canary-in-a-kerberos-enabled-cluster",content:`**Example Canary in a Kerberos-Enabled Cluster**\\
This example shows each of the properties with valid values.`},{heading:"regionsplitter",content:"For additional detail, see Manual Region Splitting."},{heading:"health-checker",content:"You can configure HBase to run a script periodically and if it fails N times (configurable), have the server exit. See *HBASE-7351 Periodic health check script* for configurations and detail."},{heading:"driver",content:"Several frequently-accessed utilities are provided as `Driver` classes, and executed by the *bin/hbase* command. These utilities represent MapReduce jobs which run on your cluster. They are run in the following way, replacing *UtilityName* with the utility you want to run. This command assumes you have set the environment variable `HBASE_HOME` to the directory where HBase is unpacked on your server."},{heading:"driver",content:"The following utilities are available:"},{heading:"driver",content:"`LoadIncrementalHFiles`\\\nComplete a bulk data load."},{heading:"driver",content:"`CopyTable`\\\nExport a table from the local cluster to a peer cluster."},{heading:"driver",content:"`Export`\\\nWrite table data to HDFS."},{heading:"driver",content:"`Import`\\\nImport data written by a previous `Export` operation."},{heading:"driver",content:"`ImportTsv`\\\nImport data in TSV format."},{heading:"driver",content:"`RowCounter`\\\nCount rows in an HBase table."},{heading:"driver",content:"`CellCounter`\\\nCount cells in an HBase table."},{heading:"driver",content:"`replication.VerifyReplication`\\\nCompare the data from tables in two different clusters. WARNING: It doesn't work for incrementColumnValues'd cells since the timestamp is changed. Note that this command is in a different package than the others."},{heading:"driver",content:"Each command except `RowCounter` and `CellCounter` accept a single `--help` argument to print usage instructions."},{heading:"hbase-hbck",content:"The `hbck` tool that shipped with hbase-1.x has been made read-only in hbase-2.x. It is not able to repair hbase-2.x clusters as hbase internals have changed. Nor should its assessments in read-only mode be trusted as it does not understand hbase-2.x operation."},{heading:"hbase-hbck",content:"A new tool, HBase `HBCK2`, described in the next section, replaces `hbck`."},{heading:"hbase-hbck2",content:"`HBCK2` is the successor to HBase `HBCK`, the hbase-1.x fix tool (A.K.A `hbck1`). Use it in place of `hbck1` making repairs against hbase-2.x installs."},{heading:"hbase-hbck2",content:"`HBCK2` does not ship as part of hbase. It can be found as a subproject of the companion hbase-operator-tools repository at Apache HBase HBCK2 Tool. `HBCK2` was moved out of hbase so it could evolve at a cadence apart from that of hbase core."},{heading:"hbase-hbck2",content:"See the HBCK2 Home Page for how `HBCK2` differs from `hbck1`, and for how to build and use it."},{heading:"hbase-hbck2",content:"Once built, you can run `HBCK2` as follows:"},{heading:"hbase-hbck2",content:"This will generate `HBCK2` usage describing commands and options."},{heading:"operational-management-tools-hfile-tool",content:"See HFile Tool."},{heading:"wal-tools",content:"For bulk replaying WAL files or *recovered.edits* files, see WALPlayer. For reading/verifying individual files, read on."},{heading:"walprettyprinter",content:"The `WALPrettyPrinter` is a tool with configurable options to print the contents of a WAL or a *recovered.edits* file. You can invoke it via the HBase cli with the 'wal' command."},{heading:"walprettyprinter",content:"Prior to version 2.0, the `WALPrettyPrinter` was called the `HLogPrettyPrinter`, after an internal name for HBase's write ahead log. In those versions, you can print the contents of a WAL using the same configuration as above, but with the 'hlog' command."},{heading:"compression-tool",content:"See compression.test."},{heading:"copytable",content:"CopyTable is a utility that can copy part or of all of a table, either to the same cluster or another cluster. The target table must first exist. The usage is as follows:"},{heading:"copytable",content:"Starting from 3.0.0, we introduce a `peer.uri` option so the `peer.adr` option is deprecated. Please use connection URI for specifying HBase clusters. For all previous versions, you should still use the `peer.adr` option."},{heading:"copytable",content:"Caching for the input Scan is configured via `hbase.client.scanner.caching` in the job\nconfiguration."},{heading:"copytable",content:"By default, CopyTable utility only copies the latest version of row cells unless `--versions=n` is\nexplicitly specified in the command."},{heading:"copytable",content:`CopyTable does not perform a diff, it copies all Cells in between the specified startrow/stoprow
starttime/endtime range. This means that already existing cells with same values will still be
copied.`},{heading:"copytable",content:"See Jonathan Hsieh's Online HBase Backups with CopyTable blog post for more on `CopyTable`."},{heading:"hashtablesynctable",content:"HashTable/SyncTable is a two steps tool for synchronizing table data, where each of the steps are implemented as MapReduce jobs. Similarly to CopyTable, it can be used for partial or entire table data syncing, under same or remote cluster. However, it performs the sync in a more efficient way than CopyTable. Instead of copying all cells in specified row key/time period range, HashTable (the first step) creates hashed indexes for batch of cells on source table and output those as results. On the next stage, SyncTable scans the source table and now calculates hash indexes for table cells, compares these hashes with the outputs of HashTable, then it just scans (and compares) cells for diverging hashes, only updating mismatching cells. This results in less network traffic/data transfers, which can be impacting when syncing large tables on remote clusters."},{heading:"step-1-hashtable",content:"First, run HashTable on the source table cluster (this is the table whose state will be copied to its counterpart)."},{heading:"step-1-hashtable",content:"Usage:"},{heading:"step-1-hashtable",content:"The **batchsize** property defines how much cell data for a given region will be hashed together in a single hash value. Sizing this properly has a direct impact on the sync efficiency, as it may lead to less scans executed by mapper tasks of SyncTable (the next step in the process). The rule of thumb is that, the smaller the number of cells out of sync (lower probability of finding a diff), larger batch size values can be determined."},{heading:"step-2-synctable",content:"Once HashTable has completed on source cluster, SyncTable can be ran on target cluster. Just like replication and other synchronization jobs, it requires that all RegionServers/DataNodes on source cluster be accessible by NodeManagers on the target cluster (where SyncTable job tasks will be running)."},{heading:"step-2-synctable",content:"Usage:"},{heading:"step-2-synctable",content:"Starting from 3.0.0, we introduce `sourceuri` and `targeturi` options so `sourcezkcluster` and `targetzkcluster` are deprecated. Please use connection URI for specifying HBase clusters. For all previous versions, you should still use `sourcezkcluster` and `targetzkcluster`."},{heading:"step-2-synctable",content:"Cell comparison takes ROW/FAMILY/QUALIFIER/TIMESTAMP/VALUE into account for equality. When syncing at the target, missing cells will be added with original timestamp value from source. That may cause unexpected results after SyncTable completes, for example, if missing cells on target have a delete marker with a timestamp T2 (say, a bulk delete performed by mistake), but source cells timestamps have an older value T1, then those cells would still be unavailable at target because of the newer delete marker timestamp. Since cell timestamps might not be relevant to all use cases, *ignoreTimestamps* option adds the flexibility to avoid using cells timestamp in the comparison. When using *ignoreTimestamps* set to true, this option must be specified for both HashTable and SyncTable steps."},{heading:"step-2-synctable",content:"The **dryrun** option is useful when a read only, diff report is wanted, as it will produce only COUNTERS indicating the differences, but will not perform any actual changes. It can be used as an alternative to VerifyReplication tool."},{heading:"step-2-synctable",content:"By default, SyncTable will cause target table to become an exact copy of source table (at least, for the specified startrow/stoprow or/and starttime/endtime)."},{heading:"step-2-synctable",content:"Setting doDeletes to false modifies default behaviour to not delete target cells that are missing on source. Similarly, setting doPuts to false modifies default behaviour to not add missing cells on target. Setting both doDeletes and doPuts to false would give same effect as setting dryrun to true."},{heading:"step-2-synctable",content:`"doDeletes/doPuts" were only added by
HBASE-20305, so these may not be available on
all released versions. For major 1.x versions, minimum minor release including it is **1.4.10**.
For major 2.x versions, minimum minor release including it is **2.1.5**.`},{heading:"step-2-synctable",content:`"ignoreTimestamps" was only added by
HBASE-24302, so it may not be available on
all released versions. For major 1.x versions, minimum minor release including it is **1.4.14**.
For major 2.x versions, minimum minor release including it is **2.2.5**.`},{heading:"step-2-synctable",content:`On Two-Way Replication or other scenarios where both source and target clusters can have data
ingested, it's advisable to always set doDeletes option to false, as any additional cell inserted
on SyncTable target cluster and not yet replicated to source would be deleted, and potentially
lost permanently.`},{heading:"step-2-synctable",content:`Although not required, if sourcezkcluster is not set, SyncTable will connect to local HBase
cluster for both source and target, which does not give any meaningful result.`},{heading:"step-2-synctable",content:`Often, remote clusters may be deployed on different Kerberos Realms.
HBASE-20586 added SyncTable support for cross
realm authentication, allowing a SyncTable process running on target cluster to connect to source
cluster and read both HashTable output files and the given HBase table when performing the
required comparisons.`},{heading:"export",content:"Export is a utility that will dump the contents of table to HDFS in a sequence file. The Export can be run via a Coprocessor Endpoint or MapReduce. Invoke via:"},{heading:"export",content:"**mapreduce-based Export**"},{heading:"export",content:"**endpoint-based Export**"},{heading:"export",content:"Make sure the Export coprocessor is enabled by adding `org.apache.hadoop.hbase.coprocessor.Export`\nto `hbase.coprocessor.region.classes`."},{heading:"export",content:"The outputdir is a HDFS directory that does not exist prior to the export. When done, the exported files will be owned by the user invoking the export command."},{heading:"export",content:"**The Comparison of Endpoint-based Export And Mapreduce-based Export**"},{heading:"export",content:"Endpoint-based Export"},{heading:"export",content:"Mapreduce-based Export"},{heading:"export",content:"HBase version requirement"},{heading:"export",content:"2.0+"},{heading:"export",content:"0.2.1+"},{heading:"export",content:"Maven dependency"},{heading:"export",content:"hbase-endpoint"},{heading:"export",content:"hbase-mapreduce (2.0+), hbase-server(prior to 2.0)"},{heading:"export",content:"Requirement before dump"},{heading:"export",content:"mount the endpoint.Export on the target table"},{heading:"export",content:"deploy the MapReduce framework"},{heading:"export",content:"Read latency"},{heading:"export",content:"low, directly read the data from region"},{heading:"export",content:"normal, traditional RPC scan"},{heading:"export",content:"Read Scalability"},{heading:"export",content:"depend on number of regions"},{heading:"export",content:"depend on number of mappers (see TableInputFormatBase#getSplits)"},{heading:"export",content:"Timeout"},{heading:"export",content:"operation timeout. configured by hbase.client.operation.timeout"},{heading:"export",content:"scan timeout. configured by hbase.client.scanner.timeout.period"},{heading:"export",content:"Permission requirement"},{heading:"export",content:"READ, EXECUTE"},{heading:"export",content:"READ"},{heading:"export",content:"Fault tolerance"},{heading:"export",content:"no"},{heading:"export",content:"depend on MapReduce"},{heading:"export",content:`To see usage instructions, run the command with no options. Available options include specifying
column families and applying filters during the export.`},{heading:"export",content:"By default, the `Export&#x60; tool only exports the newest version of a given cell, regardless of the number of versions stored. To export more than one version, replace &#x2A;**\\<versions>*** with the desired number of versions."},{heading:"export",content:"For mapreduce based Export, if you want to export cell tags then set the following config property `hbase.client.rpc.codec` to `org.apache.hadoop.hbase.codec.KeyValueCodecWithTags`"},{heading:"export",content:"Note: caching for the input Scan is configured via `hbase.client.scanner.caching` in the job configuration."},{heading:"import",content:"Import is a utility that will load data that has been exported back into HBase. Invoke via:"},{heading:"import",content:'To import 0.94 exported files in a 0.96 cluster or onwards, you need to set system property "hbase.import.version" when running the import command as below:'},{heading:"import",content:"If you want to import cell tags then set the following config property `hbase.client.rpc.codec` to `org.apache.hadoop.hbase.codec.KeyValueCodecWithTags`"},{heading:"importtsv",content:"ImportTsv is a utility that will load data in TSV format into HBase. It has two distinct usages: loading data from TSV format in HDFS into HBase via Puts, and preparing StoreFiles to be loaded via the `completebulkload`."},{heading:"importtsv",content:"To load data via Puts (i.e., non-bulk loading):"},{heading:"importtsv",content:"To generate StoreFiles for bulk-loading:"},{heading:"importtsv",content:"These generated StoreFiles can be loaded into HBase via completebulkload."},{heading:"importtsv-options",content:"Running `ImportTsv` with no arguments prints brief usage information:"},{heading:"importtsv-example",content:`For example, assume that we are loading data into a table called 'datatsv' with a ColumnFamily called 'd' with two columns "c1" and "c2".`},{heading:"importtsv-example",content:"Assume that an input file exists as follows:"},{heading:"importtsv-example",content:"For ImportTsv to use this input file, the command line needs to look like this:"},{heading:"importtsv-example",content:'... and in this example the first column is the rowkey, which is why the HBASE\\_ROW\\_KEY is used. The second and third columns in the file will be imported as "d:c1" and "d:c2", respectively.'},{heading:"importtsv-warning",content:"If you have preparing a lot of data for bulk loading, make sure the target HBase table is pre-split appropriately."},{heading:"importtsv-see-also",content:"For more information about bulk-loading HFiles into HBase, see arch.bulk.load"},{heading:"completebulkload",content:"The `completebulkload` utility will move generated StoreFiles into an HBase table. This utility is often used in conjunction with output from importtsv."},{heading:"completebulkload",content:"There are two ways to invoke this utility, with explicit classname and via the driver:"},{heading:"completebulkload",content:"**Explicit Classname**"},{heading:"completebulkload",content:"**Driver**"},{heading:"completebulkload-warning",content:"Data generated via MapReduce is often created with file permissions that are not compatible with the running HBase process. Assuming you're running HDFS with permissions enabled, those permissions will need to be updated before you run CompleteBulkLoad."},{heading:"completebulkload-warning",content:"For more information about bulk-loading HFiles into HBase, see arch.bulk.load."},{heading:"walplayer",content:"WALPlayer is a utility to replay WAL files into HBase."},{heading:"walplayer",content:"The WAL can be replayed for a set of tables or all tables, and a timerange can be provided (in milliseconds). The WAL is filtered to this set of tables. The output can optionally be mapped to another set of tables."},{heading:"walplayer",content:"WALPlayer can also generate HFiles for later bulk importing, in that case only a single table and no mapping can be specified."},{heading:"walplayer",content:"Finally, you can use WALPlayer to replay the content of a Regions `recovered.edits` directory (the files under `recovered.edits` directory have the same format as WAL files)."},{heading:"walplayer",content:`To read or verify single WAL files or *recovered.edits* files, since they share the WAL format,
see WAL Tools.`},{heading:"walplayer",content:"Invoke via:"},{heading:"walplayer",content:"For example:"},{heading:"walplayer",content:"WALPlayer, by default, runs as a mapreduce job. To NOT run WALPlayer as a mapreduce job on your cluster, force it to run all in the local process by adding the flags `-Dmapreduce.jobtracker.address=local` on the command line."},{heading:"walplayer-options",content:"Running `WALPlayer` with no arguments prints brief usage information:"},{heading:"rowcounter",content:"RowCounter is a mapreduce job to count all the rows of a table. This is a good utility to use as a sanity check to ensure that HBase can read all the blocks of a table if there are any concerns of metadata inconsistency. It will run the mapreduce all in a single process but it will run faster if you have a MapReduce cluster in place for it to exploit. It is possible to limit the time range of data to be scanned by using the `--starttime=[starttime]` and `--endtime=[endtime]` flags. The scanned data can be limited based on keys using the `--range=[startKey],[endKey][;[startKey],[endKey]...]` option."},{heading:"rowcounter",content:"RowCounter only counts one version per cell."},{heading:"rowcounter",content:"For performance consider to use `-Dhbase.client.scanner.caching=100` and `-Dmapreduce.map.speculative=false` options."},{heading:"cellcounter",content:"HBase ships another diagnostic mapreduce job called CellCounter. Like RowCounter, it gathers more fine-grained statistics about your table. The statistics gathered by CellCounter are more fine-grained and include:"},{heading:"cellcounter",content:"Total number of rows in the table."},{heading:"cellcounter",content:"Total number of CFs across all rows."},{heading:"cellcounter",content:"Total qualifiers across all rows."},{heading:"cellcounter",content:"Total occurrence of each CF."},{heading:"cellcounter",content:"Total occurrence of each qualifier."},{heading:"cellcounter",content:"Total number of versions of each qualifier."},{heading:"cellcounter",content:"The program allows you to limit the scope of the run. Provide a row regex or prefix to limit the rows to analyze. Specify a time range to scan the table by using the `--starttime=<starttime>` and `--endtime=<endtime>` flags."},{heading:"cellcounter",content:"Use `hbase.mapreduce.scan.column.family` to specify scanning a single column family."},{heading:"cellcounter",content:"Note: just like RowCounter, caching for the input Scan is configured via `hbase.client.scanner.caching` in the job configuration."},{heading:"mlockall",content:"It is possible to optionally pin your servers in physical memory making them less likely to be swapped out in oversubscribed environments by having the servers call mlockall on startup. See HBASE-4391 Add ability to start RS as root and call mlockall for how to build the optional library and have it run on startup."},{heading:"offline-compaction-tool",content:"**CompactionTool** provides a way of running compactions (either minor or major) as an independent process from the RegionServer. It reuses same internal implementation classes executed by RegionServer compaction feature. However, since this runs on a complete separate independent java process, it releases RegionServers from the overhead involved in rewrite a set of hfiles, which can be critical for latency sensitive use cases."},{heading:"offline-compaction-tool",content:"Usage:"},{heading:"offline-compaction-tool",content:"As shown by usage options above, **CompactionTool** can run as a standalone client or a mapreduce job. When running as mapreduce job, each family dir is handled as an input split, and is processed by a separate map task."},{heading:"offline-compaction-tool",content:"The **compactionOnce** parameter controls how many compaction cycles will be performed until **CompactionTool** program decides to finish its work. If omitted, it will assume it should keep running compactions on each specified family as determined by the given compaction policy configured. For more info on compaction policy, see compaction."},{heading:"offline-compaction-tool",content:"If a major compaction is desired, **major** flag can be specified. If omitted, **CompactionTool** will assume minor compaction is wanted by default."},{heading:"offline-compaction-tool",content:"It also allows for configuration overrides with `-D` flag. In the usage section above, for example, `-Dhbase.compactiontool.delete=false` option will instruct compaction engine to not delete original files from temp folder."},{heading:"offline-compaction-tool",content:"Files targeted for compaction must be specified as parent hdfs dirs. It allows for multiple dirs definition, as long as each for these dirs are either a **family**, a **region**, or a **table** dir. If a table or region dir is passed, the program will recursively iterate through related sub-folders, effectively running compaction for each family found below the table/region level."},{heading:"offline-compaction-tool",content:"Since these dirs are nested under **hbase** hdfs directory tree, **CompactionTool** requires hbase super user permissions in order to have access to required hfiles."},{heading:"offline-compaction-tool",content:`MapReduce mode offers the ability to process each family dir in parallel, as a separate map task.
Generally, it would make sense to run in this mode when specifying one or more table dirs as
targets for compactions. The caveat, though, is that if number of families to be compacted become
too large, the related mapreduce job may have indirect impacts on **RegionServers** performance .
Since **NodeManagers** are normally co-located with RegionServers, such large jobs could compete
for IO/Bandwidth resources with the **RegionServers**.`},{heading:"offline-compaction-tool",content:`**Major compactions** can be a costly operation (see
compaction), and can indeed impact performance on
RegionServers, leading operators to completely disable it for critical low latency application.
**CompactionTool** could be used as an alternative in such scenarios, although, additional custom
application logic would need to be implemented, such as deciding scheduling and selection of
tables/regions/families target for a given compaction run.`},{heading:"offline-compaction-tool",content:"For additional details about CompactionTool, see also CompactionTool."},{heading:"hbase-clean",content:"The `hbase clean` command cleans HBase data from ZooKeeper, HDFS, or both. It is appropriate to use for testing. Run it with no options for usage instructions. The `hbase clean` command was introduced in HBase 0.98."},{heading:"hbase-pe",content:"The `hbase pe` command runs the PerformanceEvaluation tool, which is used for testing."},{heading:"hbase-pe",content:"The PerformanceEvaluation tool accepts many different options and commands. For usage instructions, run the command with no options."},{heading:"hbase-pe",content:'The PerformanceEvaluation tool has received many updates in recent HBase releases, including support for namespaces, support for tags, cell-level ACLs and visibility labels, multiget support for RPC calls, increased sampling sizes, an option to randomly sleep during testing, and ability to "warm up" the cluster before testing starts.'},{heading:"hbase-ltt",content:"The `hbase ltt` command runs the LoadTestTool utility, which is used for testing."},{heading:"hbase-ltt",content:"You must specify either `-init_only` or at least one of `-write`, `-update`, or `-read`. For general usage instructions, pass the `-h` option."},{heading:"hbase-ltt",content:"The LoadTestTool has received many updates in recent HBase releases, including support for namespaces, support for tags, cell-level ACLS and visibility labels, testing security-related features, ability to specify the number of regions per server, tests for multi-get RPC calls, and tests relating to replication."},{heading:"pre-upgrade-validator",content:"Pre-Upgrade validator tool can be used to check the cluster for known incompatibilities before upgrading from HBase 1 to HBase 2."},{heading:"coprocessor-validation",content:"HBase supports co-processors for a long time, but the co-processor API can be changed between major releases. Co-processor validator tries to determine whether the old co-processors are still compatible with the actual HBase version."},{heading:"coprocessor-validation",content:"The co-processor classes can be explicitly declared by `-class` option, or they can be obtained from HBase configuration by `-config` option. Table level co-processors can be also checked by `-table` option. The tool searches for co-processors on its classpath, but it can be extended by the `-jar` option. It is possible to test multiple classes with multiple `-class`, multiple tables with multiple `-table` options as well as adding multiple jars to the classpath with multiple `-jar` options."},{heading:"coprocessor-validation",content:"The tool can report errors and warnings. Errors mean that HBase won't be able to load the coprocessor, because it is incompatible with the current version of HBase. Warnings mean that the co-processors can be loaded, but they won't work as expected. If `-e` option is given, then the tool will also fail for warnings."},{heading:"coprocessor-validation",content:"Please note that this tool cannot validate every aspect of jar files, it just does some static checks."},{heading:"coprocessor-validation",content:"For example:"},{heading:"coprocessor-validation",content:"It validates `MyMasterObserver` and `MyRegionObserver` classes which are located in `my-coprocessor.jar`."},{heading:"coprocessor-validation",content:"It validates every table level co-processors where the table name matches to `.*` regular expression."},{heading:"datablockencoding-validation",content:"HBase 2.0 removed `PREFIX_TREE` Data Block Encoding from column families. For further information please check *prefix-tree* encoding removed. To verify that none of the column families are using incompatible Data Block Encodings in the cluster run the following command."},{heading:"datablockencoding-validation",content:"This check validates all column families and print out any incompatibilities. For example:"},{heading:"datablockencoding-validation",content:"Which means that Data Block Encoding of table `t`, column family `f` is incompatible. To fix, use `alter` command in HBase shell:"},{heading:"datablockencoding-validation",content:"Please also validate HFiles, which is described in the next section."},{heading:"hfile-content-validation",content:"Even though Data Block Encoding is changed from `PREFIX_TREE` it is still possible to have HFiles that contain data encoded that way. To verify that HFiles are readable with HBase 2 please use *HFile content validator*."},{heading:"hfile-content-validation",content:"The tool will log the corrupt HFiles and details about the root cause. If the problem is about PREFIX\\_TREE encoding it is necessary to change encodings before upgrading to HBase 2."},{heading:"hfile-content-validation",content:"The following log message shows an example of incorrect HFiles."},{heading:"fixing-prefix_tree-errors",content:"It's possible to get `PREFIX_TREE` errors after changing Data Block Encoding to a supported one. It can happen because there are some HFiles which still encoded with `PREFIX_TREE` or there are still some snapshots."},{heading:"fixing-prefix_tree-errors",content:"For fixing HFiles, please run a major compaction on the table (it was `default:t` according to the log message):"},{heading:"fixing-prefix_tree-errors",content:"HFiles can be referenced from snapshots, too. It's the case when the HFile is located under `archive/data`. The first step is to determine which snapshot references that HFile (the name of the file was `29c641ae91c34fc3bee881f45436b6d1` according to the logs):"},{heading:"fixing-prefix_tree-errors",content:"The output of this shell script is:"},{heading:"fixing-prefix_tree-errors",content:"Which means `t_snap` snapshot references the incompatible HFile. If the snapshot is still needed, then it has to be recreated with HBase shell:"},{heading:"fixing-prefix_tree-errors",content:"For further information, please refer to HBASE-20649."},{heading:"data-block-encoding-tool",content:"Tests various compression algorithms with different data block encoder for key compression on an existing HFile. Useful for testing, debugging and benchmarking."},{heading:"data-block-encoding-tool",content:"You must specify `-f` which is the full path of the HFile."},{heading:"data-block-encoding-tool",content:"The result shows both the performance (MB/s) of compression/decompression and encoding/decoding, and the data savings on the HFile."},{heading:"hbase-conf-tool",content:"HBase Conf tool can be used to print out the current value of a configuration. It can be used by passing the configuration key on the command-line."}],headings:[{id:"canary",content:"Canary"},{id:"canary-test-for-every-column-family-store-of-every-region-of-every-table",content:"Canary test for every column family (store) of every region of every table"},{id:"canary-test-for-every-column-family-store-of-every-region-of-a-specific-tables",content:"Canary test for every column family (store) of every region of a specific table(s)"},{id:"canary-test-with-regionserver-granularity",content:"Canary test with RegionServer granularity"},{id:"canary-test-with-regular-expression-pattern",content:"Canary test with regular expression pattern"},{id:"run-canary-test-as-a-daemon",content:'Run canary test as a "daemon"'},{id:"force-timeout-if-canary-test-stuck",content:"Force timeout if canary test stuck"},{id:"enable-write-sniffing-in-canary",content:"Enable write sniffing in canary"},{id:"treat-read--write-failure-as-error",content:"Treat read / write failure as error"},{id:"running-canary-in-a-kerberos-enabled-cluster",content:"Running Canary in a Kerberos-enabled Cluster"},{id:"regionsplitter",content:"RegionSplitter"},{id:"health-checker",content:"Health Checker"},{id:"driver",content:"Driver"},{id:"hbase-hbck",content:"HBase `hbck`"},{id:"hbase-hbck2",content:"HBase `HBCK2`"},{id:"operational-management-tools-hfile-tool",content:"HFile Tool"},{id:"wal-tools",content:"WAL Tools"},{id:"walprettyprinter",content:"WALPrettyPrinter"},{id:"compression-tool",content:"Compression Tool"},{id:"copytable",content:"CopyTable"},{id:"hashtablesynctable",content:"HashTable/SyncTable"},{id:"step-1-hashtable",content:"Step 1, HashTable"},{id:"step-2-synctable",content:"Step 2, SyncTable"},{id:"export",content:"Export"},{id:"import",content:"Import"},{id:"importtsv",content:"ImportTsv"},{id:"importtsv-options",content:"ImportTsv Options"},{id:"importtsv-example",content:"ImportTsv Example"},{id:"importtsv-warning",content:"ImportTsv Warning"},{id:"importtsv-see-also",content:"See Also"},{id:"completebulkload",content:"CompleteBulkLoad"},{id:"completebulkload-warning",content:"CompleteBulkLoad Warning"},{id:"walplayer",content:"WALPlayer"},{id:"walplayer-options",content:"WALPlayer Options"},{id:"rowcounter",content:"RowCounter"},{id:"cellcounter",content:"CellCounter"},{id:"mlockall",content:"mlockall"},{id:"offline-compaction-tool",content:"Offline Compaction Tool"},{id:"hbase-clean",content:"`hbase clean`"},{id:"hbase-pe",content:"`hbase pe`"},{id:"hbase-ltt",content:"`hbase ltt`"},{id:"pre-upgrade-validator",content:"Pre-Upgrade validator"},{id:"coprocessor-validation",content:"Coprocessor validation"},{id:"datablockencoding-validation",content:"DataBlockEncoding validation"},{id:"hfile-content-validation",content:"HFile Content validation"},{id:"fixing-prefix_tree-errors",content:"Fixing PREFIX_TREE errors"},{id:"data-block-encoding-tool",content:"Data Block Encoding Tool"},{id:"hbase-conf-tool",content:"HBase Conf Tool"}]},d=[{depth:2,url:"#canary",title:e.jsx(e.Fragment,{children:"Canary"})},{depth:3,url:"#canary-test-for-every-column-family-store-of-every-region-of-every-table",title:e.jsx(e.Fragment,{children:"Canary test for every column family (store) of every region of every table"})},{depth:3,url:"#canary-test-for-every-column-family-store-of-every-region-of-a-specific-tables",title:e.jsx(e.Fragment,{children:"Canary test for every column family (store) of every region of a specific table(s)"})},{depth:3,url:"#canary-test-with-regionserver-granularity",title:e.jsx(e.Fragment,{children:"Canary test with RegionServer granularity"})},{depth:3,url:"#canary-test-with-regular-expression-pattern",title:e.jsx(e.Fragment,{children:"Canary test with regular expression pattern"})},{depth:3,url:"#run-canary-test-as-a-daemon",title:e.jsx(e.Fragment,{children:'Run canary test as a "daemon"'})},{depth:3,url:"#force-timeout-if-canary-test-stuck",title:e.jsx(e.Fragment,{children:"Force timeout if canary test stuck"})},{depth:3,url:"#enable-write-sniffing-in-canary",title:e.jsx(e.Fragment,{children:"Enable write sniffing in canary"})},{depth:3,url:"#treat-read--write-failure-as-error",title:e.jsx(e.Fragment,{children:"Treat read / write failure as error"})},{depth:3,url:"#running-canary-in-a-kerberos-enabled-cluster",title:e.jsx(e.Fragment,{children:"Running Canary in a Kerberos-enabled Cluster"})},{depth:2,url:"#regionsplitter",title:e.jsx(e.Fragment,{children:"RegionSplitter"})},{depth:2,url:"#health-checker",title:e.jsx(e.Fragment,{children:"Health Checker"})},{depth:2,url:"#driver",title:e.jsx(e.Fragment,{children:"Driver"})},{depth:2,url:"#hbase-hbck",title:e.jsxs(e.Fragment,{children:["HBase ",e.jsx("code",{children:"hbck"})]})},{depth:2,url:"#hbase-hbck2",title:e.jsxs(e.Fragment,{children:["HBase ",e.jsx("code",{children:"HBCK2"})]})},{depth:2,url:"#operational-management-tools-hfile-tool",title:e.jsx(e.Fragment,{children:"HFile Tool"})},{depth:2,url:"#wal-tools",title:e.jsx(e.Fragment,{children:"WAL Tools"})},{depth:3,url:"#walprettyprinter",title:e.jsx(e.Fragment,{children:"WALPrettyPrinter"})},{depth:2,url:"#compression-tool",title:e.jsx(e.Fragment,{children:"Compression Tool"})},{depth:2,url:"#copytable",title:e.jsx(e.Fragment,{children:"CopyTable"})},{depth:2,url:"#hashtablesynctable",title:e.jsx(e.Fragment,{children:"HashTable/SyncTable"})},{depth:3,url:"#step-1-hashtable",title:e.jsx(e.Fragment,{children:"Step 1, HashTable"})},{depth:3,url:"#step-2-synctable",title:e.jsx(e.Fragment,{children:"Step 2, SyncTable"})},{depth:2,url:"#export",title:e.jsx(e.Fragment,{children:"Export"})},{depth:2,url:"#import",title:e.jsx(e.Fragment,{children:"Import"})},{depth:2,url:"#importtsv",title:e.jsx(e.Fragment,{children:"ImportTsv"})},{depth:3,url:"#importtsv-options",title:e.jsx(e.Fragment,{children:"ImportTsv Options"})},{depth:3,url:"#importtsv-example",title:e.jsx(e.Fragment,{children:"ImportTsv Example"})},{depth:3,url:"#importtsv-warning",title:e.jsx(e.Fragment,{children:"ImportTsv Warning"})},{depth:3,url:"#importtsv-see-also",title:e.jsx(e.Fragment,{children:"See Also"})},{depth:2,url:"#completebulkload",title:e.jsx(e.Fragment,{children:"CompleteBulkLoad"})},{depth:3,url:"#completebulkload-warning",title:e.jsx(e.Fragment,{children:"CompleteBulkLoad Warning"})},{depth:2,url:"#walplayer",title:e.jsx(e.Fragment,{children:"WALPlayer"})},{depth:3,url:"#walplayer-options",title:e.jsx(e.Fragment,{children:"WALPlayer Options"})},{depth:2,url:"#rowcounter",title:e.jsx(e.Fragment,{children:"RowCounter"})},{depth:2,url:"#cellcounter",title:e.jsx(e.Fragment,{children:"CellCounter"})},{depth:2,url:"#mlockall",title:e.jsx(e.Fragment,{children:"mlockall"})},{depth:2,url:"#offline-compaction-tool",title:e.jsx(e.Fragment,{children:"Offline Compaction Tool"})},{depth:2,url:"#hbase-clean",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"hbase clean"})})},{depth:2,url:"#hbase-pe",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"hbase pe"})})},{depth:2,url:"#hbase-ltt",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"hbase ltt"})})},{depth:2,url:"#pre-upgrade-validator",title:e.jsx(e.Fragment,{children:"Pre-Upgrade validator"})},{depth:3,url:"#coprocessor-validation",title:e.jsx(e.Fragment,{children:"Coprocessor validation"})},{depth:3,url:"#datablockencoding-validation",title:e.jsx(e.Fragment,{children:"DataBlockEncoding validation"})},{depth:3,url:"#hfile-content-validation",title:e.jsx(e.Fragment,{children:"HFile Content validation"})},{depth:4,url:"#fixing-prefix_tree-errors",title:e.jsx(e.Fragment,{children:"Fixing PREFIX_TREE errors"})},{depth:2,url:"#data-block-encoding-tool",title:e.jsx(e.Fragment,{children:"Data Block Encoding Tool"})},{depth:2,url:"#hbase-conf-tool",title:e.jsx(e.Fragment,{children:"HBase Conf Tool"})}];function a(n){const i={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components},{Callout:s}=i;return s||t("Callout"),e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["HBase provides several tools for administration, analysis, and debugging of your cluster. The entry-point to most of these tools is the ",e.jsx(i.em,{children:"bin/hbase"})," command, though some tools are available in the ",e.jsx(i.em,{children:"dev-support/"})," directory."]}),`
`,e.jsxs(i.p,{children:["To see usage instructions for ",e.jsx(i.em,{children:"bin/hbase"})," command, run it with no arguments, or with the ",e.jsx(i.code,{children:"-h"})," argument. These are the usage instructions for HBase 0.98.x. Some commands, such as ",e.jsx(i.code,{children:"version"}),", ",e.jsx(i.code,{children:"pe"}),", ",e.jsx(i.code,{children:"ltt"}),", ",e.jsx(i.code,{children:"clean"}),", are not available in previous versions."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"$ bin/hbase"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Usage: hbase [<options>] <command> [<args>]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Options:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  --config DIR     Configuration direction to use. Default: ./conf"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  --hosts HOSTS    Override the list in 'regionservers' file"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  --auth-as-server Authenticate to ZooKeeper using servers configuration"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Commands:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Some commands take arguments. Pass no args or -h for usage."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  shell           Run the HBase shell"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  hbck            Run the HBase 'fsck' tool. Defaults read-only hbck1."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                  Pass '-j /path/to/HBCK2.jar' to run hbase-2.x HBCK2."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  snapshot        Tool for managing snapshots"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  wal             Write-ahead-log analyzer"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  hfile           Store file analyzer"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  zkcli           Run the ZooKeeper shell"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  master          Run an HBase HMaster node"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  regionserver    Run an HBase HRegionServer node"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  zookeeper       Run a ZooKeeper server"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  rest            Run an HBase REST server"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  thrift          Run the HBase Thrift server"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  thrift2         Run the HBase Thrift2 server"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  clean           Run the HBase clean up script"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  jshell          Run a jshell with HBase on the classpath"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  classpath       Dump hbase CLASSPATH"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  mapredcp        Dump CLASSPATH entries required by mapreduce"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  pe              Run PerformanceEvaluation"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  ltt             Run LoadTestTool"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  canary          Run the Canary tool"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  version         Print the version"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  backup          Backup tables for recovery"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  restore         Restore tables from existing backup image"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  regionsplitter  Run RegionSplitter tool"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  rowcounter      Run RowCounter tool"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  cellcounter     Run CellCounter tool"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  CLASSNAME       Run the class named CLASSNAME"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})})]})})}),`
`,e.jsxs(i.p,{children:["Some of the tools and utilities below are Java classes which are passed directly to the ",e.jsx(i.em,{children:"bin/hbase"})," command, as referred to in the last line of the usage instructions. Others, such as ",e.jsx(i.code,{children:"hbase shell"})," (",e.jsx(i.a,{href:"/docs/shell",children:"The Apache HBase Shell"}),"), ",e.jsx(i.code,{children:"hbase upgrade"})," (",e.jsx(i.a,{href:"/docs/upgrading",children:"Upgrading"}),"), and ",e.jsx(i.code,{children:"hbase thrift"})," (",e.jsx(i.a,{href:"/docs/thrift-filter-language",children:"Thrift API and Filter Language"}),"), are documented elsewhere in this guide."]}),`
`,e.jsx(i.h2,{id:"canary",children:"Canary"}),`
`,e.jsx(i.p,{children:`The Canary tool can help users "canary-test" the HBase cluster status. The default "region mode" fetches a row from every column-family of every regions. In "regionserver mode", the Canary tool will fetch a row from a random region on each of the cluster's RegionServers. In "zookeeper mode", the Canary will read the root znode on each member of the zookeeper ensemble.`}),`
`,e.jsxs(i.p,{children:["To see usage, pass the ",e.jsx(i.code,{children:"-help"}),' parameter (if you pass no parameters, the Canary tool starts executing in the default region "mode" fetching a row from every region in the cluster).']}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"2018-10-16 13:11:27,037 INFO  [main] tool.Canary: Execution thread count=16"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Usage: canary [OPTIONS] [<TABLE1> [<TABLE2]...] | [<REGIONSERVER1> [<REGIONSERVER2]..]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Where [OPTIONS] are:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -h,-help        show this help and exit."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -regionserver   set 'regionserver mode'; gets row from random region on server"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -allRegions     get from ALL regions when 'regionserver mode', not just random one."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -zookeeper      set 'zookeeper mode'; grab zookeeper.znode.parent on each ensemble member"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -daemon         continuous check at defined intervals."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -interval <N>   interval between checks in seconds"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -e              consider table/regionserver argument as regular expression"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -f <B>          exit on first error; default=true"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -failureAsError treat read/write failure as error"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -t <N>          timeout for canary-test run; default=600000ms"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -writeSniffing  enable write sniffing"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -writeTable     the table used for write sniffing; default=hbase:canary"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -writeTableTimeout <N>  timeout for writeTable; default=600000ms"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -readTableTimeouts <tableName>=<read timeout>,<tableName>=<read timeout>,..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"            comma-separated list of table read timeouts (no spaces);"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"            logs 'ERROR' if takes longer. default=600000ms"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -permittedZookeeperFailures <N>  Ignore first N failures attempting to"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"            connect to individual zookeeper nodes in ensemble"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -D<configProperty>=<value> to assign or override configuration params"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -Dhbase.canary.read.raw.enabled=<true/false> Set to enable/disable raw scan; default=false"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Canary runs in one of three modes: region (default), regionserver, or zookeeper."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"To sniff/probe all regions, pass no arguments."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"To sniff/probe all regions of a table, pass tablename."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"To sniff/probe regionservers, pass -regionserver, etc."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"See https://hbase.apache.org/docs/operational-management/tools#canary for Canary documentation."})})]})})}),`
`,e.jsx(s,{type:"info",children:e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"Sink"})," class is instantiated using the ",e.jsx(i.code,{children:"hbase.canary.sink.class"})," configuration property."]})}),`
`,e.jsx(i.p,{children:"This tool will return non zero error codes to user for collaborating with other monitoring tools, such as Nagios. The error code definitions are:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"private"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" USAGE_EXIT_CODE "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"private"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" INIT_ERROR_EXIT_CODE "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"private"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TIMEOUT_ERROR_EXIT_CODE "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 3"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"private"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ERROR_EXIT_CODE "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 4"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"private"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" FAILURE_EXIT_CODE "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 5"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(i.p,{children:"Here are some examples based on the following given case: given two Table objects called test-01 and test-02 each with two column family cf1 and cf2 respectively, deployed on 3 RegionServers. See the following table."}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"RegionServer"}),e.jsx(i.th,{children:"test-01"}),e.jsx(i.th,{children:"test-02"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"rs1"}),e.jsx(i.td,{children:"r1"}),e.jsx(i.td,{children:"r2"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"rs2"}),e.jsx(i.td,{children:"r2"}),e.jsx(i.td,{})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"rs3"}),e.jsx(i.td,{children:"r2"}),e.jsx(i.td,{children:"r1"})]})]})]}),`
`,e.jsx(i.p,{children:"Following are some example outputs based on the previous given case."}),`
`,e.jsx(i.h3,{id:"canary-test-for-every-column-family-store-of-every-region-of-every-table",children:"Canary test for every column family (store) of every region of every table"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" canary"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"3/12/09"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 03:26:32"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tool.Canary:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" region"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test-01,,1386230156732.0e3c7d77ffb6361ea1b996ac1042ca9a."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" column"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" family"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cf1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 2ms"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"13/12/09"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 03:26:32"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tool.Canary:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" region"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test-01,,1386230156732.0e3c7d77ffb6361ea1b996ac1042ca9a."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" column"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" family"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cf2"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 2ms"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"13/12/09"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 03:26:32"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tool.Canary:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" region"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test-01,0004883,1386230156732.87b55e03dfeade00f441125159f8ca87."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" column"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" family"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cf1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 4ms"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"13/12/09"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 03:26:32"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tool.Canary:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" region"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test-01,0004883,1386230156732.87b55e03dfeade00f441125159f8ca87."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" column"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" family"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cf2"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 1ms"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"13/12/09"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 03:26:32"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tool.Canary:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" region"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test-02,,1386559511167.aa2951a86289281beee480f107bb36ee."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" column"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" family"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cf1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 5ms"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"13/12/09"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 03:26:32"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tool.Canary:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" region"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test-02,,1386559511167.aa2951a86289281beee480f107bb36ee."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" column"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" family"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cf2"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 3ms"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"13/12/09"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 03:26:32"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tool.Canary:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" region"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test-02,0004883,1386559511167.cbda32d5e2e276520712d84eaaa29d84."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" column"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" family"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cf1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 31ms"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"13/12/09"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 03:26:32"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tool.Canary:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" region"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test-02,0004883,1386559511167.cbda32d5e2e276520712d84eaaa29d84."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" column"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" family"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cf2"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 8ms"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsx(i.p,{children:'So you can see, table test-01 has two regions and two column families, so the Canary tool in the default "region mode" will pick 4 small piece of data from 4 (2 region * 2 store) different stores. This is a default behavior.'}),`
`,e.jsx(i.h3,{id:"canary-test-for-every-column-family-store-of-every-region-of-a-specific-tables",children:"Canary test for every column family (store) of every region of a specific table(s)"}),`
`,e.jsx(i.p,{children:"You can also test one or more specific tables by passing table names."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" canary"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test-01"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test-02"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsx(i.h3,{id:"canary-test-with-regionserver-granularity",children:"Canary test with RegionServer granularity"}),`
`,e.jsx(i.p,{children:'In "regionserver mode", the Canary tool will pick one small piece of data from each RegionServer (You can also pass one or more RegionServer names as arguments to the canary-test when in "regionserver mode").'}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" canary"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -regionserver"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"13/12/09"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 06:05:17"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tool.Canary:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table:test-01"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" on"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" region"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" server:rs2"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 72ms"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"13/12/09"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 06:05:17"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tool.Canary:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table:test-02"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" on"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" region"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" server:rs3"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 34ms"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"13/12/09"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 06:05:17"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tool.Canary:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table:test-01"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" on"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" region"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" server:rs1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 56ms"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsx(i.h3,{id:"canary-test-with-regular-expression-pattern",children:"Canary test with regular expression pattern"}),`
`,e.jsx(i.p,{children:'You can pass regexes for table names when in "region mode" or for servernames when in "regionserver mode". The below will test both table test-01 and test-02.'}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" canary"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -e"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test-0[1-2]"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsx(i.h3,{id:"run-canary-test-as-a-daemon",children:'Run canary test as a "daemon"'}),`
`,e.jsxs(i.p,{children:["Run repeatedly with an interval defined via the option ",e.jsx(i.code,{children:"-interval"})," (default value is 60 seconds). This daemon will stop itself and return non-zero error code if any error occur. To have the daemon keep running across errors, pass the -f flag with its value set to false (see usage above)."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" canary"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -daemon"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsx(i.p,{children:"To run repeatedly with 5 second intervals and not stop on errors, do the following."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" canary"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -daemon"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -interval"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 5"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -f"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" false"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsx(i.h3,{id:"force-timeout-if-canary-test-stuck",children:"Force timeout if canary test stuck"}),`
`,e.jsx(i.p,{children:"In some cases the request is stuck and no response is sent back to the client. This can happen with dead RegionServers which the master has not yet noticed. Because of this we provide a timeout option to kill the canary test and return a non-zero error code. The below sets the timeout value to 60 seconds (the default value is 600 seconds)."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" canary"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -t"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 60000"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsx(i.h3,{id:"enable-write-sniffing-in-canary",children:"Enable write sniffing in canary"}),`
`,e.jsxs(i.p,{children:["By default, the canary tool only checks read operations. To enable the write sniffing, you can run the canary with the ",e.jsx(i.code,{children:"-writeSniffing"})," option set. When write sniffing is enabled, the canary tool will create an hbase table and make sure the regions of the table are distributed to all region servers. In each sniffing period, the canary will try to put data to these regions to check the write availability of each region server."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" canary"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -writeSniffing"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsxs(i.p,{children:["The default write table is ",e.jsx(i.code,{children:"hbase:canary"})," and can be specified with the option ",e.jsx(i.code,{children:"-writeTable"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" canary"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -writeSniffing"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -writeTable"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ns:canary"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsxs(i.p,{children:["The default value size of each put is 10 bytes. You can set it via the config key: ",e.jsx(i.code,{children:"hbase.canary.write.value.size"}),"."]}),`
`,e.jsx(i.h3,{id:"treat-read--write-failure-as-error",children:"Treat read / write failure as error"}),`
`,e.jsxs(i.p,{children:["By default, the canary tool only logs read failures — due to e.g. RetriesExhaustedException, etc. — and will return the 'normal' exit code. To treat read/write failure as errors, you can run canary with the ",e.jsx(i.code,{children:"-treatFailureAsError"})," option. When enabled, read/write failures will result in an error exit code."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" canary"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -treatFailureAsError"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsx(i.h3,{id:"running-canary-in-a-kerberos-enabled-cluster",children:"Running Canary in a Kerberos-enabled Cluster"}),`
`,e.jsxs(i.p,{children:["To run the Canary in a Kerberos-enabled cluster, configure the following two properties in ",e.jsx(i.em,{children:"hbase-site.xml"}),":"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hbase.client.keytab.file"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hbase.client.kerberos.principal"})}),`
`]}),`
`,e.jsx(i.p,{children:"Kerberos credentials are refreshed every 30 seconds when Canary runs in daemon mode."}),`
`,e.jsxs(i.p,{children:["To configure the DNS interface for the client, configure the following optional properties in ",e.jsx(i.em,{children:"hbase-site.xml"}),"."]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hbase.client.dns.interface"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hbase.client.dns.nameserver"})}),`
`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Example Canary in a Kerberos-Enabled Cluster"}),e.jsx(i.br,{}),`
`,"This example shows each of the properties with valid values."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.client.kerberos.principal</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase/_HOST@YOUR-REALM.COM</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.client.keytab.file</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">/etc/hbase/conf/keytab.krb5</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.client.dns.interface</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">default</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.client.dns.nameserver</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">default</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(i.h2,{id:"regionsplitter",children:"RegionSplitter"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"usage: bin/hbase regionsplitter <TABLE> <SPLITALGORITHM>"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"SPLITALGORITHM is the java class name of a class implementing"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                      SplitAlgorithm, or one of the special strings"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                      HexStringSplit or DecimalStringSplit or"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                      UniformSplit, which are built-in split algorithms."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                      HexStringSplit treats keys as hexadecimal ASCII, and"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                      DecimalStringSplit treats keys as decimal ASCII, and"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                      UniformSplit treats keys as arbitrary bytes."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -c <region count>        Create a new table with a pre-split number of"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                          regions"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -D <property=value>      Override HBase Configuration Settings"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -f <family:family:...>   Column Families to create with new table."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                          Required with -c"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"    --firstrow <arg>      First Row in Table for Split Algorithm"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -h                       Print this usage help"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"    --lastrow <arg>       Last Row in Table for Split Algorithm"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -o <count>               Max outstanding splits that have unfinished"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                          major compactions"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -r                       Perform a rolling split of an existing region"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"    --risky               Skip verification steps to complete"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                          quickly. STRONGLY DISCOURAGED for production"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                          systems."})})]})})}),`
`,e.jsxs(i.p,{children:["For additional detail, see ",e.jsx(i.a,{href:"/docs/architecture/regions#manual-region-splitting",children:"Manual Region Splitting"}),"."]}),`
`,e.jsx(i.h2,{id:"health-checker",children:"Health Checker"}),`
`,e.jsxs(i.p,{children:["You can configure HBase to run a script periodically and if it fails N times (configurable), have the server exit. See ",e.jsx(i.em,{children:"HBASE-7351 Periodic health check script"})," for configurations and detail."]}),`
`,e.jsx(i.h2,{id:"driver",children:"Driver"}),`
`,e.jsxs(i.p,{children:["Several frequently-accessed utilities are provided as ",e.jsx(i.code,{children:"Driver"})," classes, and executed by the ",e.jsx(i.em,{children:"bin/hbase"})," command. These utilities represent MapReduce jobs which run on your cluster. They are run in the following way, replacing ",e.jsx(i.em,{children:"UtilityName"})," with the utility you want to run. This command assumes you have set the environment variable ",e.jsx(i.code,{children:"HBASE_HOME"})," to the directory where HBase is unpacked on your server."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"${HBASE_HOME}/bin/hbase org.apache.hadoop.hbase.mapreduce.UtilityName"})})})})}),`
`,e.jsx(i.p,{children:"The following utilities are available:"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"LoadIncrementalHFiles"}),e.jsx(i.br,{}),`
`,"Complete a bulk data load."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"CopyTable"}),e.jsx(i.br,{}),`
`,"Export a table from the local cluster to a peer cluster."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"Export"}),e.jsx(i.br,{}),`
`,"Write table data to HDFS."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"Import"}),e.jsx(i.br,{}),`
`,"Import data written by a previous ",e.jsx(i.code,{children:"Export"})," operation."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"ImportTsv"}),e.jsx(i.br,{}),`
`,"Import data in TSV format."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"RowCounter"}),e.jsx(i.br,{}),`
`,"Count rows in an HBase table."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"CellCounter"}),e.jsx(i.br,{}),`
`,"Count cells in an HBase table."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"replication.VerifyReplication"}),e.jsx(i.br,{}),`
`,"Compare the data from tables in two different clusters. WARNING: It doesn't work for incrementColumnValues'd cells since the timestamp is changed. Note that this command is in a different package than the others."]}),`
`,e.jsxs(i.p,{children:["Each command except ",e.jsx(i.code,{children:"RowCounter"})," and ",e.jsx(i.code,{children:"CellCounter"})," accept a single ",e.jsx(i.code,{children:"--help"})," argument to print usage instructions."]}),`
`,e.jsxs(i.h2,{id:"hbase-hbck",children:["HBase ",e.jsx(i.code,{children:"hbck"})]}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"hbck"})," tool that shipped with hbase-1.x has been made read-only in hbase-2.x. It is not able to repair hbase-2.x clusters as hbase internals have changed. Nor should its assessments in read-only mode be trusted as it does not understand hbase-2.x operation."]}),`
`,e.jsxs(i.p,{children:["A new tool, ",e.jsxs(i.a,{href:"/docs/operational-management/tools#hbase-hbck2",children:["HBase ",e.jsx(i.code,{children:"HBCK2"})]}),", described in the next section, replaces ",e.jsx(i.code,{children:"hbck"}),"."]}),`
`,e.jsxs(i.h2,{id:"hbase-hbck2",children:["HBase ",e.jsx(i.code,{children:"HBCK2"})]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"HBCK2"})," is the successor to ",e.jsxs(i.a,{href:"/docs/operational-management/tools#hbase-hbck",children:["HBase ",e.jsx(i.code,{children:"HBCK"})]}),", the hbase-1.x fix tool (A.K.A ",e.jsx(i.code,{children:"hbck1"}),"). Use it in place of ",e.jsx(i.code,{children:"hbck1"})," making repairs against hbase-2.x installs."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"HBCK2"})," does not ship as part of hbase. It can be found as a subproject of the companion ",e.jsx(i.a,{href:"https://github.com/apache/hbase-operator-tools",children:"hbase-operator-tools"})," repository at ",e.jsx(i.a,{href:"https://github.com/apache/hbase-operator-tools/tree/master/hbase-hbck2",children:"Apache HBase HBCK2 Tool"}),". ",e.jsx(i.code,{children:"HBCK2"})," was moved out of hbase so it could evolve at a cadence apart from that of hbase core."]}),`
`,e.jsxs(i.p,{children:["See the ",e.jsx(i.a,{href:"https://github.com/apache/hbase-operator-tools/tree/master/hbase-hbck2",children:"HBCK2"})," Home Page for how ",e.jsx(i.code,{children:"HBCK2"})," differs from ",e.jsx(i.code,{children:"hbck1"}),", and for how to build and use it."]}),`
`,e.jsxs(i.p,{children:["Once built, you can run ",e.jsx(i.code,{children:"HBCK2"})," as follows:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbck"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -j"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /path/to/HBCK2.jar"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsxs(i.p,{children:["This will generate ",e.jsx(i.code,{children:"HBCK2"})," usage describing commands and options."]}),`
`,e.jsx(i.h2,{id:"operational-management-tools-hfile-tool",children:"HFile Tool"}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/architecture/regions#architecture-regions-store-hfile-tool",children:"HFile Tool"}),"."]}),`
`,e.jsx(i.h2,{id:"wal-tools",children:"WAL Tools"}),`
`,e.jsxs(i.p,{children:["For bulk replaying WAL files or ",e.jsx(i.em,{children:"recovered.edits"})," files, see ",e.jsx(i.a,{href:"/docs/operational-management/tools#walplayer",children:"WALPlayer"}),". For reading/verifying individual files, read on."]}),`
`,e.jsx(i.h3,{id:"walprettyprinter",children:"WALPrettyPrinter"}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"WALPrettyPrinter"})," is a tool with configurable options to print the contents of a WAL or a ",e.jsx(i.em,{children:"recovered.edits"})," file. You can invoke it via the HBase cli with the 'wal' command."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" $"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" wal"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hdfs://example.org:9000/hbase/WALs/example.org,60020,1283516293161/10.10.21.10%3A60020.1283973724012"})]})})})}),`
`,e.jsxs(s,{type:"info",title:"WAL Printing in older versions of HBase",children:[e.jsxs(i.p,{children:["Prior to version 2.0, the ",e.jsx(i.code,{children:"WALPrettyPrinter"})," was called the ",e.jsx(i.code,{children:"HLogPrettyPrinter"}),", after an internal name for HBase's write ahead log. In those versions, you can print the contents of a WAL using the same configuration as above, but with the 'hlog' command."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" $"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hlog"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hdfs://example.org:9000/hbase/.logs/example.org,60020,1283516293161/10.10.21.10%3A60020.1283973724012"})]})})})})]}),`
`,e.jsx(i.h2,{id:"compression-tool",children:"Compression Tool"}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/compression#compressiontest",children:"compression.test"}),"."]}),`
`,e.jsx(i.h2,{id:"copytable",children:"CopyTable"}),`
`,e.jsx(i.p,{children:"CopyTable is a utility that can copy part or of all of a table, either to the same cluster or another cluster. The target table must first exist. The usage is as follows:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.CopyTable"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --help"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"/bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.CopyTable"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --help"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Usage:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" CopyTable"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [general "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"options]"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [--starttime=X] [--endtime"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Y] [--new.name"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"NEW] [--peer.adr"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"ADR] "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"tablename"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Options:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" rs.class"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"     hbase.regionserver.class"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" peer"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cluster,"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"              specify"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" if"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" different"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" current"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cluster"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" rs.impl"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"      hbase.regionserver.impl"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" peer"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cluster,"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" startrow"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"     the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" start"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" stoprow"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"      the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" stop"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" starttime"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"    beginning"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" time"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" range"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (unixtime "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" millis"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"              without"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" endtime"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" means"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" starttime"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" forever"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" endtime"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"      end"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" time"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" range."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  Ignored"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" if"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" no"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" starttime"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" specified."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" versions"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"     number"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cell"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" versions"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" copy"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" new.name"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"     new"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table's name"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" peer.uri     The URI of the peer cluster"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" peer.adr     Address of the peer cluster given in the format"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"              hbase.zookeeer.quorum:hbase.zookeeper.client.port:zookeeper.znode.parent"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"              Do not take effect if peer.uri is specified"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"              Deprecated, please use peer.uri instead"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" families     comma-separated list of families to copy"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"              To copy from cf1 to cf2, give sourceCfName:destCfName."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'              To keep the same name, just give "cfName"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" all.cells    also copy delete markers and deleted cells"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"Args:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tablename    Name of the table to copy"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"Examples:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" To copy 'TestTable' to a cluster that uses replication for a 1 hour window:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" $ bin/hbase org.apache.hadoop.hbase.mapreduce.CopyTable --starttime=1265875194289 --endtime=1265878794289 --peer.adr=server1,server2,server3:2181:/hbase --families=myOldCf:myNewCf,cf2,cf3 TestTable"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"For performance consider the following general options:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  It is recommended that you set the following to >=100. A higher value uses more memory but"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  decreases the round trip time to the server and may increase performance."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"    -Dhbase.client.scanner.caching=100"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  The following should always be set to false, to prevent writing data twice, which may produce"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  inaccurate results."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"    -Dmapred.map.tasks.speculative.execution=false"})})]})})}),`
`,e.jsxs(i.p,{children:["Starting from 3.0.0, we introduce a ",e.jsx(i.code,{children:"peer.uri"})," option so the ",e.jsx(i.code,{children:"peer.adr"})," option is deprecated. Please use connection URI for specifying HBase clusters. For all previous versions, you should still use the ",e.jsx(i.code,{children:"peer.adr"})," option."]}),`
`,e.jsx(s,{type:"info",title:"Scanner Caching",children:e.jsxs(i.p,{children:["Caching for the input Scan is configured via ",e.jsx(i.code,{children:"hbase.client.scanner.caching"}),` in the job
configuration.`]})}),`
`,e.jsx(s,{type:"info",title:"Versions",children:e.jsxs(i.p,{children:["By default, CopyTable utility only copies the latest version of row cells unless ",e.jsx(i.code,{children:"--versions=n"}),` is
explicitly specified in the command.`]})}),`
`,e.jsx(s,{type:"info",title:"Data Load",children:e.jsx(i.p,{children:`CopyTable does not perform a diff, it copies all Cells in between the specified startrow/stoprow
starttime/endtime range. This means that already existing cells with same values will still be
copied.`})}),`
`,e.jsxs(i.p,{children:["See Jonathan Hsieh's ",e.jsx(i.a,{href:"https://blog.cloudera.com/blog/2012/06/online-hbase-backups-with-copytable-2/",children:"Online HBase Backups with CopyTable"})," blog post for more on ",e.jsx(i.code,{children:"CopyTable"}),"."]}),`
`,e.jsx(i.h2,{id:"hashtablesynctable",children:"HashTable/SyncTable"}),`
`,e.jsx(i.p,{children:"HashTable/SyncTable is a two steps tool for synchronizing table data, where each of the steps are implemented as MapReduce jobs. Similarly to CopyTable, it can be used for partial or entire table data syncing, under same or remote cluster. However, it performs the sync in a more efficient way than CopyTable. Instead of copying all cells in specified row key/time period range, HashTable (the first step) creates hashed indexes for batch of cells on source table and output those as results. On the next stage, SyncTable scans the source table and now calculates hash indexes for table cells, compares these hashes with the outputs of HashTable, then it just scans (and compares) cells for diverging hashes, only updating mismatching cells. This results in less network traffic/data transfers, which can be impacting when syncing large tables on remote clusters."}),`
`,e.jsx(i.h3,{id:"step-1-hashtable",children:"Step 1, HashTable"}),`
`,e.jsx(i.p,{children:"First, run HashTable on the source table cluster (this is the table whose state will be copied to its counterpart)."}),`
`,e.jsx(i.p,{children:"Usage:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.HashTable"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --help"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Usage:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HashTable"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [options] "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"tablename"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"outputpath"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Options:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" batchsize"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"         the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" target"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" amount"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bytes"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hash"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" each"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" batch"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                   rows"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" are"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" added"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" batch"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" until"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" this"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" size"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" is"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reached"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                   ("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"defaults"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 8000"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" numhashfiles"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"      the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" number"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hash"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" files"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" create"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                   if"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" set"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" fewer"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" than"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" number"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" regions"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" then"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                   the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" job"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" will"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" create"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" this"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" number"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reducers"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                   ("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"defaults"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 1/100"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" regions"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" —"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" at"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" least"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" startrow"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"          the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" start"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" stoprow"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"           the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" stop"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" starttime"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"         beginning"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" time"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" range"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (unixtime "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" millis"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                   without"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" endtime"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" means"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" starttime"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" forever"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" endtime"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"           end"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" time"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" range."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  Ignored"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" if"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" no"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" starttime"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" specified."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" scanbatch"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"         scanner"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" batch"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" size"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" support"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" intra"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" scans"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" versions"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"          number"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cell"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" versions"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" include"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" families"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"          comma-separated"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" list"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" families"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" include"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ignoreTimestamps"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  if"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ignores"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cell"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamps"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Args:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" tablename"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"     Name"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hash"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" outputpath"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"    Filesystem"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" path"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" put"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" output"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Examples:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" To"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hash"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'TestTable'"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 32kB"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" batches"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" a"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hour"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" window"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" into"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 50"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" files:"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" $"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.HashTable"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --batchsize=32000"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --numhashfiles=50"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --starttime=1265875194289"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --endtime=1265878794289"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --families=cf2,cf3"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TestTable"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /hashes/testTable"})]})]})})}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.strong,{children:"batchsize"})," property defines how much cell data for a given region will be hashed together in a single hash value. Sizing this properly has a direct impact on the sync efficiency, as it may lead to less scans executed by mapper tasks of SyncTable (the next step in the process). The rule of thumb is that, the smaller the number of cells out of sync (lower probability of finding a diff), larger batch size values can be determined."]}),`
`,e.jsx(i.h3,{id:"step-2-synctable",children:"Step 2, SyncTable"}),`
`,e.jsx(i.p,{children:"Once HashTable has completed on source cluster, SyncTable can be ran on target cluster. Just like replication and other synchronization jobs, it requires that all RegionServers/DataNodes on source cluster be accessible by NodeManagers on the target cluster (where SyncTable job tasks will be running)."}),`
`,e.jsx(i.p,{children:"Usage:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.SyncTable"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --help"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Usage:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" SyncTable"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [options] "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"sourcehashdir"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"sourcetable"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"targettable"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Options:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" sourceuri"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"        Cluster"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" connection"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" uri"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" source"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                  ("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"defaults"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cluster"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" classpath's config)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sourcezkcluster  ZK cluster key of the source table"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                  (defaults to cluster in classpath's"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                  Do"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" not"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" take"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" effect"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" if"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sourceuri"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" is"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" specifie"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                  Deprecated,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" please"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" use"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sourceuri"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" instead"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" targeturi"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"        Cluster"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" connection"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" uri"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" target"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                  ("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"defaults"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cluster"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" classpath's config)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" targetzkcluster  ZK cluster key of the target table"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                  (defaults to cluster in classpath's"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                  Do"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" not"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" take"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" effect"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" if"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" targeturi"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" is"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" specified"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                  Deprecated,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" please"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" use"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" targeturi"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" instead"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" dryrun"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"           if"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" output"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" counters"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" but"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" no"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" writes"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                  ("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"defaults"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" false"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" doDeletes"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"        if"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" false"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" does"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" not"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" perform"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" deletes"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                  ("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"defaults"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" doPuts"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"           if"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" false"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" does"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" not"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" perform"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" puts"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                  ("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"defaults"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ignoreTimestamps"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" if"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ignores"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cells"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamps"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" while"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" comparing"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                  cell"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" values."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Any"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" missing"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cell"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" on"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" target"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" then"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" gets"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                  added"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" with"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" current"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" time"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" as"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                  ("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"defaults"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" false"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Args:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" sourcehashdir"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"    path"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HashTable"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" output"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dir"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" source"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                  ("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"see"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.HashTable"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" sourcetable"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"      Name"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" source"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sync"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" targettable"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"      Name"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" target"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sync"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Examples:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" For"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" a"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dry"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" SyncTable"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tableA"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" a"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" remote"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" source"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cluster"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" a"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" local"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" target"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cluster:"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" $"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.SyncTable"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --dryrun=true"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --sourcezkcluster=zk1.example.com,zk2.example.com,zk3.example.com:2181:/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hdfs://nn:9000/hashes/tableA"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tableA"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tableA"})]})]})})}),`
`,e.jsxs(i.p,{children:["Starting from 3.0.0, we introduce ",e.jsx(i.code,{children:"sourceuri"})," and ",e.jsx(i.code,{children:"targeturi"})," options so ",e.jsx(i.code,{children:"sourcezkcluster"})," and ",e.jsx(i.code,{children:"targetzkcluster"})," are deprecated. Please use connection URI for specifying HBase clusters. For all previous versions, you should still use ",e.jsx(i.code,{children:"sourcezkcluster"})," and ",e.jsx(i.code,{children:"targetzkcluster"}),"."]}),`
`,e.jsxs(i.p,{children:["Cell comparison takes ROW/FAMILY/QUALIFIER/TIMESTAMP/VALUE into account for equality. When syncing at the target, missing cells will be added with original timestamp value from source. That may cause unexpected results after SyncTable completes, for example, if missing cells on target have a delete marker with a timestamp T2 (say, a bulk delete performed by mistake), but source cells timestamps have an older value T1, then those cells would still be unavailable at target because of the newer delete marker timestamp. Since cell timestamps might not be relevant to all use cases, ",e.jsx(i.em,{children:"ignoreTimestamps"})," option adds the flexibility to avoid using cells timestamp in the comparison. When using ",e.jsx(i.em,{children:"ignoreTimestamps"})," set to true, this option must be specified for both HashTable and SyncTable steps."]}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.strong,{children:"dryrun"})," option is useful when a read only, diff report is wanted, as it will produce only COUNTERS indicating the differences, but will not perform any actual changes. It can be used as an alternative to VerifyReplication tool."]}),`
`,e.jsx(i.p,{children:"By default, SyncTable will cause target table to become an exact copy of source table (at least, for the specified startrow/stoprow or/and starttime/endtime)."}),`
`,e.jsx(i.p,{children:"Setting doDeletes to false modifies default behaviour to not delete target cells that are missing on source. Similarly, setting doPuts to false modifies default behaviour to not add missing cells on target. Setting both doDeletes and doPuts to false would give same effect as setting dryrun to true."}),`
`,e.jsx(s,{type:"info",title:"Additional info on doDeletes/doPuts",children:e.jsxs(i.p,{children:[`"doDeletes/doPuts" were only added by
`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-20305",children:"HBASE-20305"}),`, so these may not be available on
all released versions. For major 1.x versions, minimum minor release including it is `,e.jsx(i.strong,{children:"1.4.10"}),`.
For major 2.x versions, minimum minor release including it is `,e.jsx(i.strong,{children:"2.1.5"}),"."]})}),`
`,e.jsx(s,{type:"info",title:"Additional info on ignoreTimestamps",children:e.jsxs(i.p,{children:[`"ignoreTimestamps" was only added by
`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-24302",children:"HBASE-24302"}),`, so it may not be available on
all released versions. For major 1.x versions, minimum minor release including it is `,e.jsx(i.strong,{children:"1.4.14"}),`.
For major 2.x versions, minimum minor release including it is `,e.jsx(i.strong,{children:"2.2.5"}),"."]})}),`
`,e.jsx(s,{type:"info",title:"Set doDeletes to false on Two-Way Replication scenarios",children:e.jsx(i.p,{children:`On Two-Way Replication or other scenarios where both source and target clusters can have data
ingested, it's advisable to always set doDeletes option to false, as any additional cell inserted
on SyncTable target cluster and not yet replicated to source would be deleted, and potentially
lost permanently.`})}),`
`,e.jsx(s,{type:"info",title:"Set sourcezkcluster to the actual source cluster ZK quorum",children:e.jsx(i.p,{children:`Although not required, if sourcezkcluster is not set, SyncTable will connect to local HBase
cluster for both source and target, which does not give any meaningful result.`})}),`
`,e.jsx(s,{type:"info",title:"Remote Clusters on different Kerberos Realms",children:e.jsxs(i.p,{children:[`Often, remote clusters may be deployed on different Kerberos Realms.
`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-20586",children:"HBASE-20586"}),` added SyncTable support for cross
realm authentication, allowing a SyncTable process running on target cluster to connect to source
cluster and read both HashTable output files and the given HBase table when performing the
required comparisons.`]})}),`
`,e.jsx(i.h2,{id:"export",children:"Export"}),`
`,e.jsx(i.p,{children:"Export is a utility that will dump the contents of table to HDFS in a sequence file. The Export can be run via a Coprocessor Endpoint or MapReduce. Invoke via:"}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"mapreduce-based Export"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.Export"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TABLENAME"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" OUTPUTDIR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [VERSIONS [STARTTIME [ENDTIME]]]"})]})})})}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"endpoint-based Export"})}),`
`,e.jsx(s,{type:"info",children:e.jsxs(i.p,{children:["Make sure the Export coprocessor is enabled by adding ",e.jsx(i.code,{children:"org.apache.hadoop.hbase.coprocessor.Export"}),`
to `,e.jsx(i.code,{children:"hbase.coprocessor.region.classes"}),"."]})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.coprocessor.Export"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TABLENAME"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" OUTPUTDIR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [VERSIONS [STARTTIME [ENDTIME]]]"})]})})})}),`
`,e.jsx(i.p,{children:"The outputdir is a HDFS directory that does not exist prior to the export. When done, the exported files will be owned by the user invoking the export command."}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"The Comparison of Endpoint-based Export And Mapreduce-based Export"})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{}),e.jsx(i.th,{children:"Endpoint-based Export"}),e.jsx(i.th,{children:"Mapreduce-based Export"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"HBase version requirement"}),e.jsx(i.td,{children:"2.0+"}),e.jsx(i.td,{children:"0.2.1+"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Maven dependency"}),e.jsx(i.td,{children:"hbase-endpoint"}),e.jsx(i.td,{children:"hbase-mapreduce (2.0+), hbase-server(prior to 2.0)"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Requirement before dump"}),e.jsx(i.td,{children:"mount the endpoint.Export on the target table"}),e.jsx(i.td,{children:"deploy the MapReduce framework"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Read latency"}),e.jsx(i.td,{children:"low, directly read the data from region"}),e.jsx(i.td,{children:"normal, traditional RPC scan"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Read Scalability"}),e.jsx(i.td,{children:"depend on number of regions"}),e.jsx(i.td,{children:"depend on number of mappers (see TableInputFormatBase#getSplits)"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Timeout"}),e.jsx(i.td,{children:"operation timeout. configured by hbase.client.operation.timeout"}),e.jsx(i.td,{children:"scan timeout. configured by hbase.client.scanner.timeout.period"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Permission requirement"}),e.jsx(i.td,{children:"READ, EXECUTE"}),e.jsx(i.td,{children:"READ"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Fault tolerance"}),e.jsx(i.td,{children:"no"}),e.jsx(i.td,{children:"depend on MapReduce"})]})]})]}),`
`,e.jsx(s,{type:"info",children:e.jsx(i.p,{children:`To see usage instructions, run the command with no options. Available options include specifying
column families and applying filters during the export.`})}),`
`,e.jsxs(i.p,{children:["By default, the ",e.jsx(i.code,{children:"Export"})," tool only exports the newest version of a given cell, regardless of the number of versions stored. To export more than one version, replace ",e.jsx(i.strong,{children:e.jsx(i.em,{children:"<versions>"})})," with the desired number of versions."]}),`
`,e.jsxs(i.p,{children:["For mapreduce based Export, if you want to export cell tags then set the following config property ",e.jsx(i.code,{children:"hbase.client.rpc.codec"})," to ",e.jsx(i.code,{children:"org.apache.hadoop.hbase.codec.KeyValueCodecWithTags"})]}),`
`,e.jsxs(i.p,{children:["Note: caching for the input Scan is configured via ",e.jsx(i.code,{children:"hbase.client.scanner.caching"})," in the job configuration."]}),`
`,e.jsx(i.h2,{id:"import",children:"Import"}),`
`,e.jsx(i.p,{children:"Import is a utility that will load data that has been exported back into HBase. Invoke via:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhbase.import.version=0.94"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.Import"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"tablenam"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"inputdi"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsx(s,{type:"info",children:"To see usage instructions, run the command with no options."}),`
`,e.jsx(i.p,{children:'To import 0.94 exported files in a 0.96 cluster or onwards, you need to set system property "hbase.import.version" when running the import command as below:'}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhbase.import.version=0.94"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.Import"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TABLENAME"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INPUTDIR"})]})})})}),`
`,e.jsxs(i.p,{children:["If you want to import cell tags then set the following config property ",e.jsx(i.code,{children:"hbase.client.rpc.codec"})," to ",e.jsx(i.code,{children:"org.apache.hadoop.hbase.codec.KeyValueCodecWithTags"})]}),`
`,e.jsx(i.h2,{id:"importtsv",children:"ImportTsv"}),`
`,e.jsxs(i.p,{children:["ImportTsv is a utility that will load data in TSV format into HBase. It has two distinct usages: loading data from TSV format in HDFS into HBase via Puts, and preparing StoreFiles to be loaded via the ",e.jsx(i.code,{children:"completebulkload"}),"."]}),`
`,e.jsx(i.p,{children:"To load data via Puts (i.e., non-bulk loading):"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.ImportTsv"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dimporttsv.columns=a,b,c"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"tablenam"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"hdfs-inputdi"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsx(i.p,{children:"To generate StoreFiles for bulk-loading:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.ImportTsv"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dimporttsv.columns=a,b,c"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dimporttsv.bulk.output=hdfs://storefile-outputdir"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"tablenam"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"hdfs-data-inputdi"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsxs(i.p,{children:["These generated StoreFiles can be loaded into HBase via ",e.jsx(i.a,{href:"/docs/operational-management/tools#completebulkload",children:"completebulkload"}),"."]}),`
`,e.jsx(i.h3,{id:"importtsv-options",children:"ImportTsv Options"}),`
`,e.jsxs(i.p,{children:["Running ",e.jsx(i.code,{children:"ImportTsv"})," with no arguments prints brief usage information:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Usage: importtsv -Dimporttsv.columns=a,b,c TABLENAME INPUTDIR"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Imports the given input directory of TSV data into the specified table."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"The column names of the TSV data must be specified using the -Dimporttsv.columns"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"option. This option takes the form of comma-separated column names, where each"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"column name is either a simple column family, or a columnfamily:qualifier. The special"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"column name HBASE_ROW_KEY is used to designate that this column should be used"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"as the row key for each imported record. You must specify exactly one column"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"to be the row key, and you must specify a column name for every column that exists in the"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"input data."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"By default importtsv will load data directly into HBase. To instead generate"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"HFiles of data to prepare for a bulk data load, pass the option:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  -Dimporttsv.bulk.output=/path/for/output"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  Note: the target table will be created with default column family descriptors if it does not already exist."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Other options that may be specified with -D include:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  -Dimporttsv.skip.bad.lines=false - fail if encountering an invalid line"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  '-Dimporttsv.separator=|' - eg separate on pipes instead of tabs"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  -Dimporttsv.timestamp=currentTimeAsLong - use the specified timestamp for the import"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  -Dimporttsv.mapper.class=my.Mapper - A user-defined Mapper to use instead of org.apache.hadoop.hbase.mapreduce.TsvImporterMapper"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})})]})})}),`
`,e.jsx(i.h3,{id:"importtsv-example",children:"ImportTsv Example"}),`
`,e.jsx(i.p,{children:`For example, assume that we are loading data into a table called 'datatsv' with a ColumnFamily called 'd' with two columns "c1" and "c2".`}),`
`,e.jsx(i.p,{children:"Assume that an input file exists as follows:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"row1    c1  c2"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"row2    c1  c2"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"row3    c1  c2"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"row4    c1  c2"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"row5    c1  c2"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"row6    c1  c2"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"row7    c1  c2"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"row8    c1  c2"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"row9    c1  c2"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"row10   c1  c2"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})})]})})}),`
`,e.jsx(i.p,{children:"For ImportTsv to use this input file, the command line needs to look like this:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HADOOP_CLASSPATH"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HBASE_HOME"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}/bin/hbase classpath`"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HADOOP_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"/bin/hadoop"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/hbase-mapreduce-VERSION.jar"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" importtsv"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dimporttsv.columns=HBASE_ROW_KEY,d:c1,d:c2"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dimporttsv.bulk.output=hdfs://storefileoutput"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" datatsv"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hdfs://inputfile"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsx(i.p,{children:'... and in this example the first column is the rowkey, which is why the HBASE_ROW_KEY is used. The second and third columns in the file will be imported as "d:c1" and "d:c2", respectively.'}),`
`,e.jsx(i.h3,{id:"importtsv-warning",children:"ImportTsv Warning"}),`
`,e.jsx(i.p,{children:"If you have preparing a lot of data for bulk loading, make sure the target HBase table is pre-split appropriately."}),`
`,e.jsx(i.h3,{id:"importtsv-see-also",children:"See Also"}),`
`,e.jsxs(i.p,{children:["For more information about bulk-loading HFiles into HBase, see ",e.jsx(i.a,{href:"/docs/architecture/bulk-loading",children:"arch.bulk.load"})]}),`
`,e.jsx(i.h2,{id:"completebulkload",children:"CompleteBulkLoad"}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"completebulkload"})," utility will move generated StoreFiles into an HBase table. This utility is often used in conjunction with output from ",e.jsx(i.a,{href:"/docs/operational-management/tools#importtsv",children:"importtsv"}),"."]}),`
`,e.jsx(i.p,{children:"There are two ways to invoke this utility, with explicit classname and via the driver:"}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Explicit Classname"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.tool.LoadIncrementalHFiles"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hdfs://storefileoutput"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TABLENAME"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Driver"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HADOOP_CLASSPATH"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HBASE_HOME"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}/bin/hbase classpath`"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HADOOP_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"/bin/hadoop"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/hbase-mapreduce-VERSION.jar"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" completebulkload"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hdfs://storefileoutput"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TABLENAME"})]}),`
`,e.jsx(i.span,{className:"line"})]})})}),`
`,e.jsx(i.h3,{id:"completebulkload-warning",children:"CompleteBulkLoad Warning"}),`
`,e.jsx(i.p,{children:"Data generated via MapReduce is often created with file permissions that are not compatible with the running HBase process. Assuming you're running HDFS with permissions enabled, those permissions will need to be updated before you run CompleteBulkLoad."}),`
`,e.jsxs(i.p,{children:["For more information about bulk-loading HFiles into HBase, see ",e.jsx(i.a,{href:"/docs/architecture/bulk-loading",children:"arch.bulk.load"}),"."]}),`
`,e.jsx(i.h2,{id:"walplayer",children:"WALPlayer"}),`
`,e.jsx(i.p,{children:"WALPlayer is a utility to replay WAL files into HBase."}),`
`,e.jsx(i.p,{children:"The WAL can be replayed for a set of tables or all tables, and a timerange can be provided (in milliseconds). The WAL is filtered to this set of tables. The output can optionally be mapped to another set of tables."}),`
`,e.jsx(i.p,{children:"WALPlayer can also generate HFiles for later bulk importing, in that case only a single table and no mapping can be specified."}),`
`,e.jsxs(i.p,{children:["Finally, you can use WALPlayer to replay the content of a Regions ",e.jsx(i.code,{children:"recovered.edits"})," directory (the files under ",e.jsx(i.code,{children:"recovered.edits"})," directory have the same format as WAL files)."]}),`
`,e.jsx(s,{type:"info",title:"WALPrettyPrinter",children:e.jsxs(i.p,{children:["To read or verify single WAL files or ",e.jsx(i.em,{children:"recovered.edits"}),` files, since they share the WAL format,
see `,e.jsx(i.a,{href:"/docs/operational-management/tools#wal-tools",children:"WAL Tools"}),"."]})}),`
`,e.jsx(i.p,{children:"Invoke via:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.WALPlayer"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [options] "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"WAL inputdir"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ["}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"tables"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"tableMappings"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsx(i.p,{children:"For example:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.mapreduce.WALPlayer"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /backuplogdir"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" oldTable1,oldTable2"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" newTable1,newTable2"})]})})})}),`
`,e.jsxs(i.p,{children:["WALPlayer, by default, runs as a mapreduce job. To NOT run WALPlayer as a mapreduce job on your cluster, force it to run all in the local process by adding the flags ",e.jsx(i.code,{children:"-Dmapreduce.jobtracker.address=local"})," on the command line."]}),`
`,e.jsx(i.h3,{id:"walplayer-options",children:"WALPlayer Options"}),`
`,e.jsxs(i.p,{children:["Running ",e.jsx(i.code,{children:"WALPlayer"})," with no arguments prints brief usage information:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Usage: WALPlayer [options] <WAL inputdir> [<tables> <tableMappings>]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" <WAL inputdir>   directory of WALs to replay."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" <tables>         comma separated list of tables. If no tables specified,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                  all are imported (even hbase:meta if present)."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" <tableMappings>  WAL entries can be mapped to a new set of tables by passing"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                  <tableMappings>, a comma separated list of target tables."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"                  If specified, each table in <tables> must have a mapping."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"To generate HFiles to bulk load instead of loading HBase directly, pass:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -Dwal.bulk.output=/path/for/output"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" Only one table can be specified, and no mapping allowed!"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"To specify a time range, pass:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -Dwal.start.time=[date|ms]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -Dwal.end.time=[date|ms]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" The start and the end date of timerange (inclusive). The dates can be"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" expressed in milliseconds-since-epoch or yyyy-MM-dd'T'HH:mm:ss.SS format."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" E.g. 1234567890120 or 2009-02-13T23:32:30.12"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Other options:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -Dmapreduce.job.name=jobName"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" Use the specified mapreduce job name for the wal player"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" -Dwal.input.separator=' '"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" Change WAL filename separator (WAL dir names use default ','.)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"For performance also consider the following options:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  -Dmapreduce.map.speculative=false"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  -Dmapreduce.reduce.speculative=false"})})]})})}),`
`,e.jsx(i.h2,{id:"rowcounter",children:"RowCounter"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/RowCounter.html",children:"RowCounter"})," is a mapreduce job to count all the rows of a table. This is a good utility to use as a sanity check to ensure that HBase can read all the blocks of a table if there are any concerns of metadata inconsistency. It will run the mapreduce all in a single process but it will run faster if you have a MapReduce cluster in place for it to exploit. It is possible to limit the time range of data to be scanned by using the ",e.jsx(i.code,{children:"--starttime=[starttime]"})," and ",e.jsx(i.code,{children:"--endtime=[endtime]"})," flags. The scanned data can be limited based on keys using the ",e.jsx(i.code,{children:"--range=[startKey],[endKey][;[startKey],[endKey]...]"})," option."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" rowcounter"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [options] "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"tablename"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [--starttime"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"start"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" --endtime"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"end"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] [--range"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[startKey],[endKey][;[startKey],[endKey]...]] ["}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"column1"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"column2"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"...]"})]})})})}),`
`,e.jsx(i.p,{children:"RowCounter only counts one version per cell."}),`
`,e.jsxs(i.p,{children:["For performance consider to use ",e.jsx(i.code,{children:"-Dhbase.client.scanner.caching=100"})," and ",e.jsx(i.code,{children:"-Dmapreduce.map.speculative=false"})," options."]}),`
`,e.jsx(i.h2,{id:"cellcounter",children:"CellCounter"}),`
`,e.jsxs(i.p,{children:["HBase ships another diagnostic mapreduce job called ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/CellCounter.html",children:"CellCounter"}),". Like RowCounter, it gathers more fine-grained statistics about your table. The statistics gathered by CellCounter are more fine-grained and include:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Total number of rows in the table."}),`
`,e.jsx(i.li,{children:"Total number of CFs across all rows."}),`
`,e.jsx(i.li,{children:"Total qualifiers across all rows."}),`
`,e.jsx(i.li,{children:"Total occurrence of each CF."}),`
`,e.jsx(i.li,{children:"Total occurrence of each qualifier."}),`
`,e.jsx(i.li,{children:"Total number of versions of each qualifier."}),`
`]}),`
`,e.jsxs(i.p,{children:["The program allows you to limit the scope of the run. Provide a row regex or prefix to limit the rows to analyze. Specify a time range to scan the table by using the ",e.jsx(i.code,{children:"--starttime=<starttime>"})," and ",e.jsx(i.code,{children:"--endtime=<endtime>"})," flags."]}),`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.code,{children:"hbase.mapreduce.scan.column.family"})," to specify scanning a single column family."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cellcounter"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TABLENAME"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" OUTPUT_DIR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [reportSeparator] [regex or prefix] [--starttime"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"STARTTIME --endtime"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"ENDTIME]"})]})})})}),`
`,e.jsxs(i.p,{children:["Note: just like RowCounter, caching for the input Scan is configured via ",e.jsx(i.code,{children:"hbase.client.scanner.caching"})," in the job configuration."]}),`
`,e.jsx(i.h2,{id:"mlockall",children:"mlockall"}),`
`,e.jsxs(i.p,{children:["It is possible to optionally pin your servers in physical memory making them less likely to be swapped out in oversubscribed environments by having the servers call ",e.jsx(i.a,{href:"http://linux.die.net/man/2/mlockall",children:"mlockall"})," on startup. See ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-4391",children:"HBASE-4391 Add ability to start RS as root and call mlockall"})," for how to build the optional library and have it run on startup."]}),`
`,e.jsx(i.h2,{id:"offline-compaction-tool",children:"Offline Compaction Tool"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"CompactionTool"})," provides a way of running compactions (either minor or major) as an independent process from the RegionServer. It reuses same internal implementation classes executed by RegionServer compaction feature. However, since this runs on a complete separate independent java process, it releases RegionServers from the overhead involved in rewrite a set of hfiles, which can be critical for latency sensitive use cases."]}),`
`,e.jsx(i.p,{children:"Usage:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"$ ./bin/hbase org.apache.hadoop.hbase.regionserver.CompactionTool"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Usage: java org.apache.hadoop.hbase.regionserver.CompactionTool \\"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  [-compactOnce] [-major] [-mapred] [-D<property=value>]* files..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Options:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" mapred         Use MapReduce to run compaction."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" compactOnce    Execute just one compaction step. (default: while needed)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" major          Trigger major compaction."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Note: -D properties will be applied to the conf used."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"For example:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" To stop delete of compacted file, pass -Dhbase.compactiontool.delete=false"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" To set tmp dir, pass -Dhbase.tmp.dir=ALTERNATE_DIR"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Examples:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" To compact the full 'TestTable' using MapReduce:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" $ hbase org.apache.hadoop.hbase.regionserver.CompactionTool -mapred hdfs://hbase/data/default/TestTable"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" To compact column family 'x' of the table 'TestTable' region 'abc':"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:" $ hbase org.apache.hadoop.hbase.regionserver.CompactionTool hdfs://hbase/data/default/TestTable/abc/x"})})]})})}),`
`,e.jsxs(i.p,{children:["As shown by usage options above, ",e.jsx(i.strong,{children:"CompactionTool"})," can run as a standalone client or a mapreduce job. When running as mapreduce job, each family dir is handled as an input split, and is processed by a separate map task."]}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.strong,{children:"compactionOnce"})," parameter controls how many compaction cycles will be performed until ",e.jsx(i.strong,{children:"CompactionTool"})," program decides to finish its work. If omitted, it will assume it should keep running compactions on each specified family as determined by the given compaction policy configured. For more info on compaction policy, see ",e.jsx(i.a,{href:"/docs/architecture/regions#compaction",children:"compaction"}),"."]}),`
`,e.jsxs(i.p,{children:["If a major compaction is desired, ",e.jsx(i.strong,{children:"major"})," flag can be specified. If omitted, ",e.jsx(i.strong,{children:"CompactionTool"})," will assume minor compaction is wanted by default."]}),`
`,e.jsxs(i.p,{children:["It also allows for configuration overrides with ",e.jsx(i.code,{children:"-D"})," flag. In the usage section above, for example, ",e.jsx(i.code,{children:"-Dhbase.compactiontool.delete=false"})," option will instruct compaction engine to not delete original files from temp folder."]}),`
`,e.jsxs(i.p,{children:["Files targeted for compaction must be specified as parent hdfs dirs. It allows for multiple dirs definition, as long as each for these dirs are either a ",e.jsx(i.strong,{children:"family"}),", a ",e.jsx(i.strong,{children:"region"}),", or a ",e.jsx(i.strong,{children:"table"})," dir. If a table or region dir is passed, the program will recursively iterate through related sub-folders, effectively running compaction for each family found below the table/region level."]}),`
`,e.jsxs(i.p,{children:["Since these dirs are nested under ",e.jsx(i.strong,{children:"hbase"})," hdfs directory tree, ",e.jsx(i.strong,{children:"CompactionTool"})," requires hbase super user permissions in order to have access to required hfiles."]}),`
`,e.jsx(s,{type:"info",title:"Running in MapReduce mode",children:e.jsxs(i.p,{children:[`MapReduce mode offers the ability to process each family dir in parallel, as a separate map task.
Generally, it would make sense to run in this mode when specifying one or more table dirs as
targets for compactions. The caveat, though, is that if number of families to be compacted become
too large, the related mapreduce job may have indirect impacts on `,e.jsx(i.strong,{children:"RegionServers"}),` performance .
Since `,e.jsx(i.strong,{children:"NodeManagers"}),` are normally co-located with RegionServers, such large jobs could compete
for IO/Bandwidth resources with the `,e.jsx(i.strong,{children:"RegionServers"}),"."]})}),`
`,e.jsx(s,{type:"info",title:"MajorCompaction completely disabled on RegionServers due performance impacts",children:e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Major compactions"}),` can be a costly operation (see
`,e.jsx(i.a,{href:"/docs/architecture/regions#compaction",children:"compaction"}),`), and can indeed impact performance on
RegionServers, leading operators to completely disable it for critical low latency application.
`,e.jsx(i.strong,{children:"CompactionTool"}),` could be used as an alternative in such scenarios, although, additional custom
application logic would need to be implemented, such as deciding scheduling and selection of
tables/regions/families target for a given compaction run.`]})}),`
`,e.jsxs(i.p,{children:["For additional details about CompactionTool, see also ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/regionserver/CompactionTool.html",children:"CompactionTool"}),"."]}),`
`,e.jsx(i.h2,{id:"hbase-clean",children:e.jsx(i.code,{children:"hbase clean"})}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"hbase clean"})," command cleans HBase data from ZooKeeper, HDFS, or both. It is appropriate to use for testing. Run it with no options for usage instructions. The ",e.jsx(i.code,{children:"hbase clean"})," command was introduced in HBase 0.98."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"$ bin/hbase clean"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Usage: hbase clean (--cleanZk|--cleanHdfs|--cleanAll)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Options:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"    --cleanZk   cleans hbase related data from zookeeper."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"    --cleanHdfs cleans hbase related data from hdfs."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"    --cleanAll  cleans hbase related data from both zookeeper and hdfs."})})]})})}),`
`,e.jsx(i.h2,{id:"hbase-pe",children:e.jsx(i.code,{children:"hbase pe"})}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"hbase pe"})," command runs the PerformanceEvaluation tool, which is used for testing."]}),`
`,e.jsx(i.p,{children:"The PerformanceEvaluation tool accepts many different options and commands. For usage instructions, run the command with no options."}),`
`,e.jsx(i.p,{children:'The PerformanceEvaluation tool has received many updates in recent HBase releases, including support for namespaces, support for tags, cell-level ACLs and visibility labels, multiget support for RPC calls, increased sampling sizes, an option to randomly sleep during testing, and ability to "warm up" the cluster before testing starts.'}),`
`,e.jsx(i.h2,{id:"hbase-ltt",children:e.jsx(i.code,{children:"hbase ltt"})}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"hbase ltt"})," command runs the LoadTestTool utility, which is used for testing."]}),`
`,e.jsxs(i.p,{children:["You must specify either ",e.jsx(i.code,{children:"-init_only"})," or at least one of ",e.jsx(i.code,{children:"-write"}),", ",e.jsx(i.code,{children:"-update"}),", or ",e.jsx(i.code,{children:"-read"}),". For general usage instructions, pass the ",e.jsx(i.code,{children:"-h"})," option."]}),`
`,e.jsx(i.p,{children:"The LoadTestTool has received many updates in recent HBase releases, including support for namespaces, support for tags, cell-level ACLS and visibility labels, testing security-related features, ability to specify the number of regions per server, tests for multi-get RPC calls, and tests relating to replication."}),`
`,e.jsx(i.h2,{id:"pre-upgrade-validator",children:"Pre-Upgrade validator"}),`
`,e.jsx(i.p,{children:"Pre-Upgrade validator tool can be used to check the cluster for known incompatibilities before upgrading from HBase 1 to HBase 2."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pre-upgrade"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" command"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ..."})]})})})}),`
`,e.jsx(i.h3,{id:"coprocessor-validation",children:"Coprocessor validation"}),`
`,e.jsx(i.p,{children:"HBase supports co-processors for a long time, but the co-processor API can be changed between major releases. Co-processor validator tries to determine whether the old co-processors are still compatible with the actual HBase version."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pre-upgrade"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" validate-cp"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [-jar "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"...]"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [-class "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"..."}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -table"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ..."}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -config]"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Options:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -e"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"            Treat"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" warnings"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" as"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" errors."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -jar"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"ar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"g"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"    Jar"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" file/directory"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" coprocessor."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -table"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"ar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"g"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  Table"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" coprocessor"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" check."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -class"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"ar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"g"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  Coprocessor"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" class"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"es"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" check."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -config"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"         Scan"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" observers."})]})]})})}),`
`,e.jsxs(i.p,{children:["The co-processor classes can be explicitly declared by ",e.jsx(i.code,{children:"-class"})," option, or they can be obtained from HBase configuration by ",e.jsx(i.code,{children:"-config"})," option. Table level co-processors can be also checked by ",e.jsx(i.code,{children:"-table"})," option. The tool searches for co-processors on its classpath, but it can be extended by the ",e.jsx(i.code,{children:"-jar"})," option. It is possible to test multiple classes with multiple ",e.jsx(i.code,{children:"-class"}),", multiple tables with multiple ",e.jsx(i.code,{children:"-table"})," options as well as adding multiple jars to the classpath with multiple ",e.jsx(i.code,{children:"-jar"})," options."]}),`
`,e.jsxs(i.p,{children:["The tool can report errors and warnings. Errors mean that HBase won't be able to load the coprocessor, because it is incompatible with the current version of HBase. Warnings mean that the co-processors can be loaded, but they won't work as expected. If ",e.jsx(i.code,{children:"-e"})," option is given, then the tool will also fail for warnings."]}),`
`,e.jsx(i.p,{children:"Please note that this tool cannot validate every aspect of jar files, it just does some static checks."}),`
`,e.jsx(i.p,{children:"For example:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pre-upgrade"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" validate-cp"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -jar"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" my-coprocessor.jar"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -class"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MyMasterObserver"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -class"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MyRegionObserver"})]})})})}),`
`,e.jsxs(i.p,{children:["It validates ",e.jsx(i.code,{children:"MyMasterObserver"})," and ",e.jsx(i.code,{children:"MyRegionObserver"})," classes which are located in ",e.jsx(i.code,{children:"my-coprocessor.jar"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pre-upgrade"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" validate-cp"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -table"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ."}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"*"})]})})})}),`
`,e.jsxs(i.p,{children:["It validates every table level co-processors where the table name matches to ",e.jsx(i.code,{children:".*"})," regular expression."]}),`
`,e.jsx(i.h3,{id:"datablockencoding-validation",children:"DataBlockEncoding validation"}),`
`,e.jsxs(i.p,{children:["HBase 2.0 removed ",e.jsx(i.code,{children:"PREFIX_TREE"})," Data Block Encoding from column families. For further information please check ",e.jsxs(i.a,{href:"/docs/upgrading/paths#prefix-tree-encoding-removed-toc",children:[e.jsx(i.em,{children:"prefix-tree"})," encoding removed"]}),". To verify that none of the column families are using incompatible Data Block Encodings in the cluster run the following command."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pre-upgrade"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" validate-dbe"})]})})})}),`
`,e.jsx(i.p,{children:"This check validates all column families and print out any incompatibilities. For example:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"2018-07-13 09:58:32,028 WARN  [main] tool.DataBlockEncodingValidator: Incompatible DataBlockEncoding for table: t, cf: f, encoding: PREFIX_TREE"})})})})}),`
`,e.jsxs(i.p,{children:["Which means that Data Block Encoding of table ",e.jsx(i.code,{children:"t"}),", column family ",e.jsx(i.code,{children:"f"})," is incompatible. To fix, use ",e.jsx(i.code,{children:"alter"})," command in HBase shell:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"alter "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", { "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'f'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"DATA_BLOCK_ENCODING"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'FAST_DIFF'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]})})})}),`
`,e.jsx(i.p,{children:"Please also validate HFiles, which is described in the next section."}),`
`,e.jsx(i.h3,{id:"hfile-content-validation",children:"HFile Content validation"}),`
`,e.jsxs(i.p,{children:["Even though Data Block Encoding is changed from ",e.jsx(i.code,{children:"PREFIX_TREE"})," it is still possible to have HFiles that contain data encoded that way. To verify that HFiles are readable with HBase 2 please use ",e.jsx(i.em,{children:"HFile content validator"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pre-upgrade"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" validate-hfile"})]})})})}),`
`,e.jsx(i.p,{children:"The tool will log the corrupt HFiles and details about the root cause. If the problem is about PREFIX_TREE encoding it is necessary to change encodings before upgrading to HBase 2."}),`
`,e.jsx(i.p,{children:"The following log message shows an example of incorrect HFiles."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"2018-06-05 16:20:46,976 WARN  [hfilevalidator-pool1-t3] hbck.HFileCorruptionChecker: Found corrupt HFile hdfs://example.com:9000/hbase/data/default/t/72ea7f7d625ee30f959897d1a3e2c350/prefix/7e6b3d73263c4851bf2b8590a9b3791e"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"org.apache.hadoop.hbase.io.hfile.CorruptHFileException: Problem reading HFile Trailer from file hdfs://example.com:9000/hbase/data/default/t/72ea7f7d625ee30f959897d1a3e2c350/prefix/7e6b3d73263c4851bf2b8590a9b3791e"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"    ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Caused by: java.io.IOException: Invalid data block encoding type in file info: PREFIX_TREE"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"    ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Caused by: java.lang.IllegalArgumentException: No enum constant org.apache.hadoop.hbase.io.encoding.DataBlockEncoding.PREFIX_TREE"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"    ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"2018-06-05 16:20:47,322 INFO  [main] tool.HFileContentValidator: Corrupted file: hdfs://example.com:9000/hbase/data/default/t/72ea7f7d625ee30f959897d1a3e2c350/prefix/7e6b3d73263c4851bf2b8590a9b3791e"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"2018-06-05 16:20:47,383 INFO  [main] tool.HFileContentValidator: Corrupted file: hdfs://example.com:9000/hbase/archive/data/default/t/56be41796340b757eb7fff1eb5e2a905/f/29c641ae91c34fc3bee881f45436b6d1"})})]})})}),`
`,e.jsx(i.h4,{id:"fixing-prefix_tree-errors",children:"Fixing PREFIX_TREE errors"}),`
`,e.jsxs(i.p,{children:["It's possible to get ",e.jsx(i.code,{children:"PREFIX_TREE"})," errors after changing Data Block Encoding to a supported one. It can happen because there are some HFiles which still encoded with ",e.jsx(i.code,{children:"PREFIX_TREE"})," or there are still some snapshots."]}),`
`,e.jsxs(i.p,{children:["For fixing HFiles, please run a major compaction on the table (it was ",e.jsx(i.code,{children:"default:t"})," according to the log message):"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"major_compact "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t'"})]})})})}),`
`,e.jsxs(i.p,{children:["HFiles can be referenced from snapshots, too. It's the case when the HFile is located under ",e.jsx(i.code,{children:"archive/data"}),". The first step is to determine which snapshot references that HFile (the name of the file was ",e.jsx(i.code,{children:"29c641ae91c34fc3bee881f45436b6d1"})," according to the logs):"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"for"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" snapshot "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" snapshotinfo"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -list-snapshots"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" 2>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /dev/null"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" tail"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -1"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" cut"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -f"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -d"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\|"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"do"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  echo"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" \"checking snapshot named '${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"snapshot"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`}'"`}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" snapshotinfo"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -snapshot"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "${'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"snapshot"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'}"'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -files"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" 2>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /dev/null"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" grep"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 29c641ae91c34fc3bee881f45436b6d1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"done"})})]})})}),`
`,e.jsx(i.p,{children:"The output of this shell script is:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"checking snapshot named 't_snap'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"   1.0 K t/56be41796340b757eb7fff1eb5e2a905/f/29c641ae91c34fc3bee881f45436b6d1 (archive)"})})]})})}),`
`,e.jsxs(i.p,{children:["Which means ",e.jsx(i.code,{children:"t_snap"})," snapshot references the incompatible HFile. If the snapshot is still needed, then it has to be recreated with HBase shell:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"# creating a new namespace for the cleanup process"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"create_namespace 'pre_upgrade_cleanup'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"# creating a new snapshot"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"clone_snapshot 't_snap', 'pre_upgrade_cleanup:t'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"alter 'pre_upgrade_cleanup:t', { NAME => 'f', DATA_BLOCK_ENCODING => 'FAST_DIFF' }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"major_compact 'pre_upgrade_cleanup:t'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"# removing the invalid snapshot"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"delete_snapshot 't_snap'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"# creating a new snapshot"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"snapshot 'pre_upgrade_cleanup:t', 't_snap'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"# removing temporary table"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"disable 'pre_upgrade_cleanup:t'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"drop 'pre_upgrade_cleanup:t'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"drop_namespace 'pre_upgrade_cleanup'"})})]})})}),`
`,e.jsxs(i.p,{children:["For further information, please refer to ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-20649?focusedCommentId=16535476#comment-16535476",children:"HBASE-20649"}),"."]}),`
`,e.jsx(i.h2,{id:"data-block-encoding-tool",children:"Data Block Encoding Tool"}),`
`,e.jsx(i.p,{children:"Tests various compression algorithms with different data block encoder for key compression on an existing HFile. Useful for testing, debugging and benchmarking."}),`
`,e.jsxs(i.p,{children:["You must specify ",e.jsx(i.code,{children:"-f"})," which is the full path of the HFile."]}),`
`,e.jsx(i.p,{children:"The result shows both the performance (MB/s) of compression/decompression and encoding/decoding, and the data savings on the HFile."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.regionserver.DataBlockEncodingTool"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Usages:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.regionserver.DataBlockEncodingTool"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Options:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        -f"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HFile"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" analyse"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (REQUIRED)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        -n"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Maximum"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" number"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" key/value"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pairs"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" process"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" a"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" single"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" benchmark"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        -b"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Whether"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" a"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" benchmark"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" measure"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" throughput."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        -c"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" If"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" this"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" is"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" specified,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" no"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" correctness"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" testing"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" will"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" be"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" done."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        -a"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" What"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" kind"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" compression"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" algorithm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" use"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Default"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" GZ."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        -t"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Number"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" times"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" each"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" benchmark."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Default"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 12."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        -omit"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Number"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" first"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" runs"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" every"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" benchmark"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" omit"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" statistics."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Default"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 2."})]})]})})}),`
`,e.jsx(i.h2,{id:"hbase-conf-tool",children:"HBase Conf Tool"}),`
`,e.jsx(i.p,{children:"HBase Conf tool can be used to print out the current value of a configuration. It can be used by passing the configuration key on the command-line."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.util.HBaseConfTool"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"configuration_ke"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"y"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})})]})}function p(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(a,{...n})}):a(n)}function t(n,i){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{r as _markdown,p as default,o as extractedReferences,h as frontmatter,c as structuredData,d as toc};
