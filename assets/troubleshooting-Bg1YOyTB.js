import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let r=`## General Guidelines

Always start with the master log (TODO: Which lines?). Normally it's just printing the same lines over and over again. If not, then there's an issue. Google should return some hits for those exceptions you're seeing.

An error rarely comes alone in Apache HBase, usually when something gets screwed up what will follow may be hundreds of exceptions and stack traces coming from all over the place. The best way to approach this type of problem is to walk the log up to where it all began, for example one trick with RegionServers is that they will print some metrics when aborting so grepping for *Dump* should get you around the start of the problem.

RegionServer suicides are 'normal', as this is what they do when something goes wrong. For example, if ulimit and max transfer threads (the two most important initial settings, see [\\[ulimit\\]](/docs/configuration/basic-prerequisites#limits-on-number-of-files-and-processes-ulimit) and [\`dfs.datanode.max.transfer.threads\`](/docs/configuration/basic-prerequisites#dfsdatanodemaxtransferthreads)) aren't changed, it will make it impossible at some point for DataNodes to create new threads that from the HBase point of view is seen as if HDFS was gone. Think about what would happen if your MySQL database was suddenly unable to access files on your local file system, well it's the same with HBase and HDFS. Another very common reason to see RegionServers committing seppuku is when they enter prolonged garbage collection pauses that last longer than the default ZooKeeper session timeout. For more information on GC pauses, see the [3 part blog post](https://blog.cloudera.com/blog/2011/02/avoiding-full-gcs-in-hbase-with-memstore-local-allocation-buffers-part-1/) by Todd Lipcon and [Long GC pauses](/docs/performance#long-gc-pauses) above.

## Logs

The key process logs are as follows... (replace \`<user>\` with the user that started the service, and \`<hostname>\` for the machine name)

NameNode: *\\$HADOOP\\_HOME/logs/hadoop-\\<user>-namenode-\\<hostname>.log*

DataNode: *\\$HADOOP\\_HOME/logs/hadoop-\\<user>-datanode-\\<hostname>.log*

JobTracker: *\\$HADOOP\\_HOME/logs/hadoop-\\<user>-jobtracker-\\<hostname>.log*

TaskTracker: *\\$HADOOP\\_HOME/logs/hadoop-\\<user>-tasktracker-\\<hostname>.log*

HMaster: *\\$HBASE\\_HOME/logs/hbase-\\<user>-master-\\<hostname>.log*

RegionServer: *\\$HBASE\\_HOME/logs/hbase-\\<user>-regionserver-\\<hostname>.log*

ZooKeeper: *TODO*

## Log Locations

For stand-alone deployments the logs are obviously going to be on a single machine, however this is a development configuration only. Production deployments need to run on a cluster.

### NameNode

The NameNode log is on the NameNode server. The HBase Master is typically run on the NameNode server, and well as ZooKeeper.

For smaller clusters the JobTracker/ResourceManager is typically run on the NameNode server as well.

### DataNode

Each DataNode server will have a DataNode log for HDFS, as well as a RegionServer log for HBase.

Additionally, each DataNode server will also have a TaskTracker/NodeManager log for MapReduce task execution.

## Log Levels

### Enabling RPC-level logging

Enabling the RPC-level logging on a RegionServer can often give insight on timings at the server. Once enabled, the amount of log spewed is voluminous. It is not recommended that you leave this logging on for more than short bursts of time. To enable RPC-level logging, browse to the RegionServer UI and click on *Log Level*. Set the log level to \`TRACE\` for the package \`org.apache.hadoop.hbase.ipc\`, then tail the RegionServers log. Analyze.

To disable, set the logging level back to \`INFO\` level.

The same log settings also work on Master and for the client.

## Handling Multiple SLF4J Bindings to Prevent Overridden Log Configurations

If you have a local installation of Hadoop (e.g., installed via Homebrew on macOS), you may encounter a "multiple SLF4J bindings" warning when starting HBase in standalone mode using \`bin/start-hbase.sh\`. For example, you may see the following when starting HBase on your machine:

\`\`\`text
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/opt/homebrew/Cellar/hadoop/3.4.1/libexec/share/hadoop/common/lib/slf4j-reload4j-1.7.36.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:$HOME/.m2/repository/org/apache/logging/log4j/log4j-slf4j-impl/2.25.3/log4j-slf4j-impl-2.25.3.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [org.slf4j.impl.Reload4jLoggerFactory]
\`\`\`

This is happening because the \`bin/hbase\` script automatically detects local Hadoop installations and adds their classpath to HBase. If your Hadoop installation uses the legacy Reload4j (or Log4j 1.2) binder, SLF4J may prioritize it over the HBase Log4j2 binder. When this happens, your \`conf/log4j2.properties\` file and \`HBASE_ROOT_LOGGER\` environment variable are completely ignored.

To get around this issue, you can set \`HBASE_DISABLE_HADOOP_CLASSPATH_LOOKUP\` to \`true\`. You can modify this directly in \`conf/hbase-env.sh\` by uncommenting the following line:

\`\`\`bash
export HBASE_DISABLE_HADOOP_CLASSPATH_LOOKUP="true"
\`\`\`

Note: Setting \`HBASE_DISABLE_HADOOP_CLASSPATH_LOOKUP\` does not fix the issue when HBase is in distributed mode. There may be a different warning instead.

## JVM Garbage Collection Logs

<Callout type="info">
  All example Garbage Collection logs in this section are based on Java 8 output. The introduction
  of Unified Logging in Java 9 and newer will result in very different looking logs.
</Callout>

HBase is memory intensive, and using the default GC you can see long pauses in all threads including the *Juliet Pause* aka "GC of Death". To help debug this or confirm this is happening GC logging can be turned on in the Java virtual machine.

To enable, in *hbase-env.sh*, uncomment one of the below lines :

\`\`\`bash
# This enables basic gc logging to the .out file.
# export SERVER_GC_OPTS="-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps"

# This enables basic gc logging to its own file.
# export SERVER_GC_OPTS="-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:<FILE-PATH>"

# This enables basic GC logging to its own file with automatic log rolling. Only applies to jdk 1.6.0_34+ and 1.7.0_2+.
# export SERVER_GC_OPTS="-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:<FILE-PATH> -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=1 -XX:GCLogFileSize=512M"

# If <FILE-PATH> is not replaced, the log file(.gc) would be generated in the HBASE_LOG_DIR.
\`\`\`

At this point you should see logs like so:

\`\`\`text
64898.952: [GC [1 CMS-initial-mark: 2811538K(3055704K)] 2812179K(3061272K), 0.0007360 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]
64898.953: [CMS-concurrent-mark-start]
64898.971: [GC 64898.971: [ParNew: 5567K->576K(5568K), 0.0101110 secs] 2817105K->2812715K(3061272K), 0.0102200 secs] [Times: user=0.07 sys=0.00, real=0.01 secs]
\`\`\`

In this section, the first line indicates a 0.0007360 second pause for the CMS to initially mark. This pauses the entire VM, all threads for that period of time.

The third line indicates a "minor GC", which pauses the VM for 0.0101110 seconds - aka 10 milliseconds. It has reduced the "ParNew" from about 5.5m to 576k. Later on in this cycle we see:

\`\`\`text
64901.445: [CMS-concurrent-mark: 1.542/2.492 secs] [Times: user=10.49 sys=0.33, real=2.49 secs]
64901.445: [CMS-concurrent-preclean-start]
64901.453: [GC 64901.453: [ParNew: 5505K->573K(5568K), 0.0062440 secs] 2868746K->2864292K(3061272K), 0.0063360 secs] [Times: user=0.05 sys=0.00, real=0.01 secs]
64901.476: [GC 64901.476: [ParNew: 5563K->575K(5568K), 0.0072510 secs] 2869283K->2864837K(3061272K), 0.0073320 secs] [Times: user=0.05 sys=0.01, real=0.01 secs]
64901.500: [GC 64901.500: [ParNew: 5517K->573K(5568K), 0.0120390 secs] 2869780K->2865267K(3061272K), 0.0121150 secs] [Times: user=0.09 sys=0.00, real=0.01 secs]
64901.529: [GC 64901.529: [ParNew: 5507K->569K(5568K), 0.0086240 secs] 2870200K->2865742K(3061272K), 0.0087180 secs] [Times: user=0.05 sys=0.00, real=0.01 secs]
64901.554: [GC 64901.555: [ParNew: 5516K->575K(5568K), 0.0107130 secs] 2870689K->2866291K(3061272K), 0.0107820 secs] [Times: user=0.06 sys=0.00, real=0.01 secs]
64901.578: [CMS-concurrent-preclean: 0.070/0.133 secs] [Times: user=0.48 sys=0.01, real=0.14 secs]
64901.578: [CMS-concurrent-abortable-preclean-start]
64901.584: [GC 64901.584: [ParNew: 5504K->571K(5568K), 0.0087270 secs] 2871220K->2866830K(3061272K), 0.0088220 secs] [Times: user=0.05 sys=0.00, real=0.01 secs]
64901.609: [GC 64901.609: [ParNew: 5512K->569K(5568K), 0.0063370 secs] 2871771K->2867322K(3061272K), 0.0064230 secs] [Times: user=0.06 sys=0.00, real=0.01 secs]
64901.615: [CMS-concurrent-abortable-preclean: 0.007/0.037 secs] [Times: user=0.13 sys=0.00, real=0.03 secs]
64901.616: [GC[YG occupancy: 645 K (5568 K)]64901.616: [Rescan (parallel) , 0.0020210 secs]64901.618: [weak refs processing, 0.0027950 secs] [1 CMS-remark: 2866753K(3055704K)] 2867399K(3061272K), 0.0049380 secs] [Times: user=0.00 sys=0.01, real=0.01 secs]
64901.621: [CMS-concurrent-sweep-start]
\`\`\`

The first line indicates that the CMS concurrent mark (finding garbage) has taken 2.4 seconds. But this is a *concurrent* 2.4 seconds, Java has not been paused at any point in time.

There are a few more minor GCs, then there is a pause at the 2nd last line:

\`\`\`text
64901.616: [GC[YG occupancy: 645 K (5568 K)]64901.616: [Rescan (parallel) , 0.0020210 secs]64901.618: [weak refs processing, 0.0027950 secs] [1 CMS-remark: 2866753K(3055704K)] 2867399K(3061272K), 0.0049380 secs] [Times: user=0.00 sys=0.01, real=0.01 secs]
\`\`\`

The pause here is 0.0049380 seconds (aka 4.9 milliseconds) to 'remark' the heap.

At this point the sweep starts, and you can watch the heap size go down:

\`\`\`text
64901.637: [GC 64901.637: [ParNew: 5501K->569K(5568K), 0.0097350 secs] 2871958K->2867441K(3061272K), 0.0098370 secs] [Times: user=0.05 sys=0.00, real=0.01 secs]
...  lines removed ...
64904.936: [GC 64904.936: [ParNew: 5532K->568K(5568K), 0.0070720 secs] 1365024K->1360689K(3061272K), 0.0071930 secs] [Times: user=0.05 sys=0.00, real=0.01 secs]
64904.953: [CMS-concurrent-sweep: 2.030/3.332 secs] [Times: user=9.57 sys=0.26, real=3.33 secs]
\`\`\`

At this point, the CMS sweep took 3.332 seconds, and heap went from about \\~ 2.8 GB to 1.3 GB (approximate).

The key points here is to keep all these pauses low. CMS pauses are always low, but if your ParNew starts growing, you can see minor GC pauses approach 100ms, exceed 100ms and hit as high at 400ms.

This can be due to the size of the ParNew, which should be relatively small. If your ParNew is very large after running HBase for a while, in one example a ParNew was about 150MB, then you might have to constrain the size of ParNew (The larger it is, the longer the collections take but if it's too small, objects are promoted to old gen too quickly). In the below we constrain new gen size to 64m.

Add the below line in *hbase-env.sh*:

\`\`\`bash
export SERVER_GC_OPTS="$SERVER_GC_OPTS -XX:NewSize=64m -XX:MaxNewSize=64m"
\`\`\`

Similarly, to enable GC logging for client processes, uncomment one of the below lines in *hbase-env.sh*:

\`\`\`bash
# This enables basic gc logging to the .out file.
# export CLIENT_GC_OPTS="-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps"

# This enables basic gc logging to its own file.
# export CLIENT_GC_OPTS="-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:<FILE-PATH>"

# This enables basic GC logging to its own file with automatic log rolling. Only applies to jdk 1.6.0_34+ and 1.7.0_2+.
# export CLIENT_GC_OPTS="-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:<FILE-PATH> -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=1 -XX:GCLogFileSize=512M"

# If <FILE-PATH> is not replaced, the log file(.gc) would be generated in the HBASE_LOG_DIR .
\`\`\`

For more information on GC pauses, see the [3 part blog post](https://blog.cloudera.com/blog/2011/02/avoiding-full-gcs-in-hbase-with-memstore-local-allocation-buffers-part-1/) by Todd Lipcon and [Long GC pauses](/docs/performance#long-gc-pauses) above.

## Resources

### Mailing Lists

Ask a question on the [Apache HBase mailing lists](https://hbase.apache.org/mailing-lists.html). The 'dev' mailing list is aimed at the community of developers actually building Apache HBase and for features currently under development, and 'user' is generally used for questions on released versions of Apache HBase. Before going to the mailing list, make sure your question has not already been answered by searching the mailing list archives first. For those who prefer to communicate in Chinese, they can use the 'user-zh' mailing list instead of the 'user' list. Take some time crafting your question. See [Getting Answers](http://www.mikeash.com/getting_answers.html) for ideas on crafting good questions. A quality question that includes all context and exhibits evidence the author has tried to find answers in the manual and out on lists is more likely to get a prompt response.

### Slack

\\#hbase on [https://the-asf.slack.com/](https://the-asf.slack.com/)

### IRC

(You will probably get a more prompt response on the Slack channel)

\\#hbase on irc.freenode.net

### JIRA

[JIRA](https://issues.apache.org/jira/browse/HBASE) is also really helpful when looking for Hadoop/HBase-specific issues.

## Tools

### Builtin Tools

#### Master Web Interface

The Master starts a web-interface on port 16010 by default.

The Master web UI lists created tables and their definition (e.g., ColumnFamilies, blocksize, etc.). Additionally, the available RegionServers in the cluster are listed along with selected high-level metrics (requests, number of regions, usedHeap, maxHeap). The Master web UI allows navigation to each RegionServer's web UI.

#### RegionServer Web Interface

RegionServers starts a web-interface on port 16030 by default.

The RegionServer web UI lists online regions and their start/end keys, as well as point-in-time RegionServer metrics (requests, regions, storeFileIndexSize, compactionQueueSize, etc.).

See [HBase Metrics](/docs/operational-management/metrics-and-monitoring) for more information in metric definitions.

#### zkcli

\`zkcli\` is a very useful tool for investigating ZooKeeper-related issues. To invoke:

\`\`\`bash
./hbase zkcli -server host:port <cmd> <args>
\`\`\`

The commands (and arguments) are:

\`\`\`text
  connect host:port
  get path [watch]
  ls path [watch]
  set path data [version]
  delquota [-n|-b] path
  quit
  printwatches on|off
  create [-s] [-e] path data acl
  stat path [watch]
  close
  ls2 path [watch]
  history
  listquota path
  setAcl path acl
  getAcl path
  sync path
  redo cmdno
  addauth scheme auth
  delete path [version]
  setquota -n|-b val path
\`\`\`

#### Maintenance Mode

If the cluster has gotten stuck in some state and the standard techniques aren't making progress, it is possible to restart the cluster in "maintenance mode." This mode features drastically reduced capabilities and surface area, making it easier to enact very low-level changes such as repairing/recovering the \`hbase:meta\` table.

To enter maintenance mode, set \`hbase.master.maintenance_mode\` to \`true\` either in your \`hbase-site.xml\` or via system propery when starting the master process (\`-D...=true\`). Entering and exiting this mode requires a service restart, however the typical use will be when HBase Master is already facing startup difficulties.

When maintenance mode is enabled, the master will host all system tables - ensure that it has enough memory to do so. RegionServers will not be assigned any regions from user-space tables; in fact, they will go completely unused while in maintenance mode. Additionally, the master will not load any coprocessors, will not run any normalization or merge/split operations, and will not enforce quotas.

### External Tools

#### tail

\`tail\` is the command line tool that lets you look at the end of a file. Add the \`-f\` option and it will refresh when new data is available. It's useful when you are wondering what's happening, for example, when a cluster is taking a long time to shutdown or startup as you can just fire a new terminal and tail the master log (and maybe a few RegionServers).

#### top

\`top\` is probably one of the most important tools when first trying to see what's running on a machine and how the resources are consumed. Here's an example from production system:

\`\`\`text
top - 14:46:59 up 39 days, 11:55,  1 user,  load average: 3.75, 3.57, 3.84
Tasks: 309 total,   1 running, 308 sleeping,   0 stopped,   0 zombie
Cpu(s):  4.5%us,  1.6%sy,  0.0%ni, 91.7%id,  1.4%wa,  0.1%hi,  0.6%si,  0.0%st
Mem:  24414432k total, 24296956k used,   117476k free,     7196k buffers
Swap: 16008732k total,  14348k used, 15994384k free, 11106908k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM  TIME+  COMMAND
15558 hadoop    18  -2 3292m 2.4g 3556 S   79 10.4   6523:52 java
13268 hadoop    18  -2 8967m 8.2g 4104 S   21 35.1   5170:30 java
 8895 hadoop    18  -2 1581m 497m 3420 S   11  2.1   4002:32 java
...
\`\`\`

Here we can see that the system load average during the last five minutes is 3.75, which very roughly means that on average 3.75 threads were waiting for CPU time during these 5 minutes. In general, the *perfect* utilization equals to the number of cores, under that number the machine is under utilized and over that the machine is over utilized. This is an important concept, see this article to understand it more: [http://www.linuxjournal.com/article/9001](http://www.linuxjournal.com/article/9001).

Apart from load, we can see that the system is using almost all its available RAM but most of it is used for the OS cache (which is good). The swap only has a few KBs in it and this is wanted, high numbers would indicate swapping activity which is the nemesis of performance of Java systems. Another way to detect swapping is when the load average goes through the roof (although this could also be caused by things like a dying disk, among others).

The list of processes isn't super useful by default, all we know is that 3 java processes are using about 111% of the CPUs. To know which is which, simply type \`c\` and each line will be expanded. Typing \`1\` will give you the detail of how each CPU is used instead of the average for all of them like shown here.

#### jps

\`jps\` is shipped with every JDK and gives the java process ids for the current user (if root, then it gives the ids for all users). Example:

\`\`\`bash
hadoop@sv4borg12:~$ jps
1322 TaskTracker
17789 HRegionServer
27862 Child
1158 DataNode
25115 HQuorumPeer
2950 Jps
19750 ThriftServer
18776 jmx
\`\`\`

In order, we see a:

* Hadoop TaskTracker, manages the local Childs
* HBase RegionServer, serves regions
* Child, its MapReduce task, cannot tell which type exactly
* Hadoop TaskTracker, manages the local Childs
* Hadoop DataNode, serves blocks
* HQuorumPeer, a ZooKeeper ensemble member
* Jps, well... it's the current process
* ThriftServer, it's a special one will be running only if thrift was started
* jmx, this is a local process that's part of our monitoring platform ( poorly named maybe). You probably don't have that.

You can then do stuff like checking out the full command line that started the process:

\`\`\`bash
hadoop@sv4borg12:~$ ps aux | grep HRegionServer
hadoop   17789  155 35.2 9067824 8604364 ?     S<l  Mar04 9855:48 /usr/java/jdk1.6.0_14/bin/java -Xmx8000m -XX:+DoEscapeAnalysis -XX:+AggressiveOpts -XX:+UseConcMarkSweepGC -XX:NewSize=64m -XX:MaxNewSize=64m -XX:CMSInitiatingOccupancyFraction=88 -verbose:gc -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -Xloggc:/export1/hadoop/logs/gc-hbase.log -Dcom.sun.management.jmxremote.port=10102 -Dcom.sun.management.jmxremote.authenticate=true -Dcom.sun.management.jmxremote.ssl=false -Dcom.sun.management.jmxremote.password.file=/home/hadoop/hbase/conf/jmxremote.password -Dcom.sun.management.jmxremote -Dhbase.log.dir=/export1/hadoop/logs -Dhbase.log.file=hbase-hadoop-regionserver-sv4borg12.log -Dhbase.home.dir=/home/hadoop/hbase -Dhbase.id.str=hadoop -Dhbase.root.logger=INFO,DRFA -Djava.library.path=/home/hadoop/hbase/lib/native/Linux-amd64-64 -classpath /home/hadoop/hbase/bin/../conf:[many jars]:/home/hadoop/hadoop/conf org.apache.hadoop.hbase.regionserver.HRegionServer start
\`\`\`

#### jstack

\`jstack\` is one of the most important tools when trying to figure out what a java process is doing apart from looking at the logs. It has to be used in conjunction with jps in order to give it a process id. It shows a list of threads, each one has a name, and they appear in the order that they were created (so the top ones are the most recent threads). Here are a few example:

The main thread of a RegionServer waiting for something to do from the master:

\`\`\`text
"regionserver60020" prio=10 tid=0x0000000040ab4000 nid=0x45cf waiting on condition [0x00007f16b6a96000..0x00007f16b6a96a70]
java.lang.Thread.State: TIMED_WAITING (parking)
    at sun.misc.Unsafe.park(Native Method)
        - parking to wait for  <0x00007f16cd5c2f30> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
    at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:198)
    at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:1963)
    at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:395)
    at org.apache.hadoop.hbase.regionserver.HRegionServer.run(HRegionServer.java:647)
    at java.lang.Thread.run(Thread.java:619)
\`\`\`

The MemStore flusher thread that is currently flushing to a file:

\`\`\`text
"regionserver60020.cacheFlusher" daemon prio=10 tid=0x0000000040f4e000 nid=0x45eb in Object.wait() [0x00007f16b5b86000..0x00007f16b5b87af0]
java.lang.Thread.State: WAITING (on object monitor)
    at java.lang.Object.wait(Native Method)
    at java.lang.Object.wait(Object.java:485)
    at org.apache.hadoop.ipc.Client.call(Client.java:803)
        - locked <0x00007f16cb14b3a8> (a org.apache.hadoop.ipc.Client$Call)
    at org.apache.hadoop.ipc.RPC$Invoker.invoke(RPC.java:221)
    at $Proxy1.complete(Unknown Source)
    at sun.reflect.GeneratedMethodAccessor38.invoke(Unknown Source)
    at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)
    at java.lang.reflect.Method.invoke(Method.java:597)
    at org.apache.hadoop.io.retry.RetryInvocationHandler.invokeMethod(RetryInvocationHandler.java:82)
    at org.apache.hadoop.io.retry.RetryInvocationHandler.invoke(RetryInvocationHandler.java:59)
    at $Proxy1.complete(Unknown Source)
    at org.apache.hadoop.hdfs.DFSClient$DFSOutputStream.closeInternal(DFSClient.java:3390)
        - locked <0x00007f16cb14b470> (a org.apache.hadoop.hdfs.DFSClient$DFSOutputStream)
    at org.apache.hadoop.hdfs.DFSClient$DFSOutputStream.close(DFSClient.java:3304)
    at org.apache.hadoop.fs.FSDataOutputStream$PositionCache.close(FSDataOutputStream.java:61)
    at org.apache.hadoop.fs.FSDataOutputStream.close(FSDataOutputStream.java:86)
    at org.apache.hadoop.hbase.io.hfile.HFile$Writer.close(HFile.java:650)
    at org.apache.hadoop.hbase.regionserver.StoreFile$Writer.close(StoreFile.java:853)
    at org.apache.hadoop.hbase.regionserver.Store.internalFlushCache(Store.java:467)
        - locked <0x00007f16d00e6f08> (a java.lang.Object)
    at org.apache.hadoop.hbase.regionserver.Store.flushCache(Store.java:427)
    at org.apache.hadoop.hbase.regionserver.Store.access$100(Store.java:80)
    at org.apache.hadoop.hbase.regionserver.Store$StoreFlusherImpl.flushCache(Store.java:1359)
    at org.apache.hadoop.hbase.regionserver.HRegion.internalFlushcache(HRegion.java:907)
    at org.apache.hadoop.hbase.regionserver.HRegion.internalFlushcache(HRegion.java:834)
    at org.apache.hadoop.hbase.regionserver.HRegion.flushcache(HRegion.java:786)
    at org.apache.hadoop.hbase.regionserver.MemStoreFlusher.flushRegion(MemStoreFlusher.java:250)
    at org.apache.hadoop.hbase.regionserver.MemStoreFlusher.flushRegion(MemStoreFlusher.java:224)
    at org.apache.hadoop.hbase.regionserver.MemStoreFlusher.run(MemStoreFlusher.java:146)
\`\`\`

A handler thread that's waiting for stuff to do (like put, delete, scan, etc.):

\`\`\`text
"IPC Server handler 16 on 60020" daemon prio=10 tid=0x00007f16b011d800 nid=0x4a5e waiting on condition [0x00007f16afefd000..0x00007f16afefd9f0]
   java.lang.Thread.State: WAITING (parking)
          at sun.misc.Unsafe.park(Native Method)
              - parking to wait for  <0x00007f16cd3f8dd8> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
          at java.util.concurrent.locks.LockSupport.park(LockSupport.java:158)
          at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:1925)
          at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:358)
          at org.apache.hadoop.hbase.ipc.HBaseServer$Handler.run(HBaseServer.java:1013)
\`\`\`

And one that's busy doing an increment of a counter (it's in the phase where it's trying to create a scanner in order to read the last value):

\`\`\`text
"IPC Server handler 66 on 60020" daemon prio=10 tid=0x00007f16b006e800 nid=0x4a90 runnable [0x00007f16acb77000..0x00007f16acb77cf0]
   java.lang.Thread.State: RUNNABLE
          at org.apache.hadoop.hbase.regionserver.KeyValueHeap.<init>(KeyValueHeap.java:56)
          at org.apache.hadoop.hbase.regionserver.StoreScanner.<init>(StoreScanner.java:79)
          at org.apache.hadoop.hbase.regionserver.Store.getScanner(Store.java:1202)
          at org.apache.hadoop.hbase.regionserver.HRegion$RegionScanner.<init>(HRegion.java:2209)
          at org.apache.hadoop.hbase.regionserver.HRegion.instantiateInternalScanner(HRegion.java:1063)
          at org.apache.hadoop.hbase.regionserver.HRegion.getScanner(HRegion.java:1055)
          at org.apache.hadoop.hbase.regionserver.HRegion.getScanner(HRegion.java:1039)
          at org.apache.hadoop.hbase.regionserver.HRegion.getLastIncrement(HRegion.java:2875)
          at org.apache.hadoop.hbase.regionserver.HRegion.incrementColumnValue(HRegion.java:2978)
          at org.apache.hadoop.hbase.regionserver.HRegionServer.incrementColumnValue(HRegionServer.java:2433)
          at sun.reflect.GeneratedMethodAccessor20.invoke(Unknown Source)
          at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)
          at java.lang.reflect.Method.invoke(Method.java:597)
          at org.apache.hadoop.hbase.ipc.HBaseRPC$Server.call(HBaseRPC.java:560)
          at org.apache.hadoop.hbase.ipc.HBaseServer$Handler.run(HBaseServer.java:1027)
\`\`\`

A thread that receives data from HDFS:

\`\`\`text
"IPC Client (47) connection to sv4borg9/10.4.24.40:9000 from hadoop" daemon prio=10 tid=0x00007f16a02d0000 nid=0x4fa3 runnable [0x00007f16b517d000..0x00007f16b517dbf0]
   java.lang.Thread.State: RUNNABLE
          at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
          at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:215)
          at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:65)
          at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:69)
              - locked <0x00007f17d5b68c00> (a sun.nio.ch.Util$1)
              - locked <0x00007f17d5b68be8> (a java.util.Collections$UnmodifiableSet)
              - locked <0x00007f1877959b50> (a sun.nio.ch.EPollSelectorImpl)
          at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:80)
          at org.apache.hadoop.net.SocketIOWithTimeout$SelectorPool.select(SocketIOWithTimeout.java:332)
          at org.apache.hadoop.net.SocketIOWithTimeout.doIO(SocketIOWithTimeout.java:157)
          at org.apache.hadoop.net.SocketInputStream.read(SocketInputStream.java:155)
          at org.apache.hadoop.net.SocketInputStream.read(SocketInputStream.java:128)
          at java.io.FilterInputStream.read(FilterInputStream.java:116)
          at org.apache.hadoop.ipc.Client$Connection$PingInputStream.read(Client.java:304)
          at java.io.BufferedInputStream.fill(BufferedInputStream.java:218)
          at java.io.BufferedInputStream.read(BufferedInputStream.java:237)
              - locked <0x00007f1808539178> (a java.io.BufferedInputStream)
          at java.io.DataInputStream.readInt(DataInputStream.java:370)
          at org.apache.hadoop.ipc.Client$Connection.receiveResponse(Client.java:569)
          at org.apache.hadoop.ipc.Client$Connection.run(Client.java:477)
\`\`\`

And here is a master trying to recover a lease after a RegionServer died:

\`\`\`text
"LeaseChecker" daemon prio=10 tid=0x00000000407ef800 nid=0x76cd waiting on condition [0x00007f6d0eae2000..0x00007f6d0eae2a70]
--
   java.lang.Thread.State: WAITING (on object monitor)
          at java.lang.Object.wait(Native Method)
          at java.lang.Object.wait(Object.java:485)
          at org.apache.hadoop.ipc.Client.call(Client.java:726)
          - locked <0x00007f6d1cd28f80> (a org.apache.hadoop.ipc.Client$Call)
          at org.apache.hadoop.ipc.RPC$Invoker.invoke(RPC.java:220)
          at $Proxy1.recoverBlock(Unknown Source)
          at org.apache.hadoop.hdfs.DFSClient$DFSOutputStream.processDatanodeError(DFSClient.java:2636)
          at org.apache.hadoop.hdfs.DFSClient$DFSOutputStream.<init>(DFSClient.java:2832)
          at org.apache.hadoop.hdfs.DFSClient.append(DFSClient.java:529)
          at org.apache.hadoop.hdfs.DistributedFileSystem.append(DistributedFileSystem.java:186)
          at org.apache.hadoop.fs.FileSystem.append(FileSystem.java:530)
          at org.apache.hadoop.hbase.util.FSUtils.recoverFileLease(FSUtils.java:619)
          at org.apache.hadoop.hbase.regionserver.wal.HLog.splitLog(HLog.java:1322)
          at org.apache.hadoop.hbase.regionserver.wal.HLog.splitLog(HLog.java:1210)
          at org.apache.hadoop.hbase.master.HMaster.splitLogAfterStartup(HMaster.java:648)
          at org.apache.hadoop.hbase.master.HMaster.joinCluster(HMaster.java:572)
          at org.apache.hadoop.hbase.master.HMaster.run(HMaster.java:503)
\`\`\`

#### OpenTSDB

[OpenTSDB](http://opentsdb.net) is an excellent alternative to Ganglia as it uses Apache HBase to store all the time series and doesn't have to downsample. Monitoring your own HBase cluster that hosts OpenTSDB is a good exercise.

Here's an example of a cluster that's suffering from hundreds of compactions launched almost all around the same time, which severely affects the IO performance: (TODO: insert graph plotting compactionQueueSize)

It's a good practice to build dashboards with all the important graphs per machine and per cluster so that debugging issues can be done with a single quick look. For example, at StumbleUpon there's one dashboard per cluster with the most important metrics from both the OS and Apache HBase. You can then go down at the machine level and get even more detailed metrics.

#### clusterssh+top

clusterssh+top, it's like a poor man's monitoring system and it can be quite useful when you have only a few machines as it's very easy to setup. Starting clusterssh will give you one terminal per machine and another terminal in which whatever you type will be retyped in every window. This means that you can type \`top\` once and it will start it for all of your machines at the same time giving you full view of the current state of your cluster. You can also tail all the logs at the same time, edit files, etc.

## Client

For more information on the HBase client, see [client](/docs/architecture/client).

### ScannerTimeoutException or UnknownScannerException \\[!toc]

This is thrown if the time between RPC calls from the client to RegionServer exceeds the scan timeout. For example, if \`Scan.setCaching\` is set to 500, then there will be an RPC call to fetch the next batch of rows every 500 \`.next()\` calls on the ResultScanner because data is being transferred in blocks of 500 rows to the client. Reducing the setCaching value may be an option, but setting this value too low makes for inefficient processing on numbers of rows.

See [Scan Caching](/docs/performance#scan-caching).

### Performance Differences in Thrift and Java APIs \\[!toc]

Poor performance, or even \`ScannerTimeoutExceptions\`, can occur if \`Scan.setCaching\` is too high, as discussed in [ScannerTimeoutException or UnknownScannerException](/docs/troubleshooting#scannertimeoutexception-or-unknownscannerexception). If the Thrift client uses the wrong caching settings for a given workload, performance can suffer compared to the Java API. To set caching for a given scan in the Thrift client, use the \`scannerGetList(scannerId, numRows)\` method, where \`numRows\` is an integer representing the number of rows to cache. In one case, it was found that reducing the cache for Thrift scans from 1000 to 100 increased performance to near parity with the Java API given the same queries.

See also Jesse Andersen's [blog post](http://blog.cloudera.com/blog/2014/04/how-to-use-the-hbase-thrift-interface-part-3-using-scans/) about using Scans with Thrift.

### \`LeaseException\` when calling \`Scanner.next\` \\[!toc]

In some situations clients that fetch data from a RegionServer get a LeaseException instead of the usual [ScannerTimeoutException or UnknownScannerException](/docs/troubleshooting#scannertimeoutexception-or-unknownscannerexception). Usually the source of the exception is \`org.apache.hadoop.hbase.regionserver.Leases.removeLease(Leases.java:230)\` (line number may vary). It tends to happen in the context of a slow/freezing \`RegionServer#next\` call. It can be prevented by having \`hbase.rpc.timeout\` > \`hbase.client.scanner.timeout.period\`. Harsh J investigated the issue as part of the mailing list thread [HBase, mail # user - Lease does not exist exceptions](https://mail-archives.apache.org/mod_mbox/hbase-user/201209.mbox/%3CCAOcnVr3R-LqtKhFsk8Bhrm-YW2i9O6J6Fhjz2h7q6_sxvwd2yw%40mail.gmail.com%3E)

### Shell or client application throws lots of scary exceptions during normal operation \\[!toc]

Since 0.20.0 the default log level for \`org.apache.hadoop.hbase.*\` is DEBUG.

On your clients, edit *\\$HBASE\\_HOME/conf/log4j.properties* and change this: \`log4j.logger.org.apache.hadoop.hbase=DEBUG\` to this: \`log4j.logger.org.apache.hadoop.hbase=INFO\`, or even \`log4j.logger.org.apache.hadoop.hbase=WARN\`.

### Long Client Pauses With Compression \\[!toc]

This is a fairly frequent question on the Apache HBase dist-list. The scenario is that a client is typically inserting a lot of data into a relatively un-optimized HBase cluster. Compression can exacerbate the pauses, although it is not the source of the problem.

See [Table Creation: Pre-Creating Regions](/docs/performance#table-creation-pre-creating-regions) on the pattern for pre-creating regions and confirm that the table isn't starting with a single region.

See [HBase Configurations](/docs/performance#hbase-configurations) for cluster configuration, particularly \`hbase.hstore.blockingStoreFiles\`, \`hbase.hregion.memstore.block.multiplier\`, \`MAX_FILESIZE\` (region size), and \`MEMSTORE_FLUSHSIZE.\`

A slightly longer explanation of why pauses can happen is as follows: Puts are sometimes blocked on the MemStores which are blocked by the flusher thread which is blocked because there are too many files to compact because the compactor is given too many small files to compact and has to compact the same data repeatedly. This situation can occur even with minor compactions. Compounding this situation, Apache HBase doesn't compress data in memory. Thus, the 64MB that lives in the MemStore could become a 6MB file after compression - which results in a smaller StoreFile. The upside is that more data is packed into the same region, but performance is achieved by being able to write larger files - which is why HBase waits until the flushsize before writing a new StoreFile. And smaller StoreFiles become targets for compaction. Without compression the files are much bigger and don't need as much compaction, however this is at the expense of I/O.

### Secure Client Connect (\\[Caused by GSSException: No valid credentials provided...]) \\[!toc]

You may encounter the following error:

\`\`\`text
Secure Client Connect ([Caused by GSSException: No valid credentials provided
        (Mechanism level: Request is a replay (34) V PROCESS_TGS)])
\`\`\`

This issue is caused by bugs in the MIT Kerberos replay\\_cache component, [#1201](http://krbdev.mit.edu/rt/Ticket/Display.html?id=1201) and [#5924](http://krbdev.mit.edu/rt/Ticket/Display.html?id=5924). These bugs caused the old version of krb5-server to erroneously block subsequent requests sent from a Principal. This caused krb5-server to block the connections sent from one Client (one HTable instance with multi-threading connection instances for each RegionServer); Messages, such as \`Request is a replay (34)\`, are logged in the client log You can ignore the messages, because HTable will retry 5 \\* 10 (50) times for each failed connection by default. HTable will throw IOException if any connection to the RegionServer fails after the retries, so that the user client code for HTable instance can handle it further. NOTE: \`HTable\` is deprecated in HBase 1.0, in favor of \`Table\`.

Alternatively, update krb5-server to a version which solves these issues, such as krb5-server-1.10.3. See JIRA [HBASE-10379](https://issues.apache.org/jira/browse/HBASE-10379) for more details.

### ZooKeeper Client Connection Errors \\[!toc]

Errors like this...

\`\`\`text
11/07/05 11:26:41 WARN zookeeper.ClientCnxn: Session 0x0 for server null,
 unexpected error, closing socket connection and attempting reconnect
 java.net.ConnectException: Connection refused: no further information
        at sun.nio.ch.SocketChannelImpl.checkConnect(Native Method)
        at sun.nio.ch.SocketChannelImpl.finishConnect(Unknown Source)
        at org.apache.zookeeper.ClientCnxn$SendThread.run(ClientCnxn.java:1078)
 11/07/05 11:26:43 INFO zookeeper.ClientCnxn: Opening socket connection to
 server localhost/127.0.0.1:2181
 11/07/05 11:26:44 WARN zookeeper.ClientCnxn: Session 0x0 for server null,
 unexpected error, closing socket connection and attempting reconnect
 java.net.ConnectException: Connection refused: no further information
        at sun.nio.ch.SocketChannelImpl.checkConnect(Native Method)
        at sun.nio.ch.SocketChannelImpl.finishConnect(Unknown Source)
        at org.apache.zookeeper.ClientCnxn$SendThread.run(ClientCnxn.java:1078)
 11/07/05 11:26:45 INFO zookeeper.ClientCnxn: Opening socket connection to
 server localhost/127.0.0.1:2181
\`\`\`

...are either due to ZooKeeper being down, or unreachable due to network issues.

The utility [zkcli](/docs/troubleshooting#zkcli) may help investigate ZooKeeper issues.

### Client running out of memory though heap size seems to be stable (but the off-heap/direct heap keeps growing) \\[!toc]

You are likely running into the issue that is described and worked through in the mail thread [HBase, mail # user - Suspected memory leak](https://lists.apache.org/thread.html/d12bbe56be95cf68478d1528263042730670ff39159a01eaf06d8bc8%401322622090%40%3Cuser.hbase.apache.org%3E) and continued over in [HBase, mail # dev - FeedbackRe: Suspected memory leak](https://lists.apache.org/thread.html/621dde35479215f0b07b23af93b8fac52ff4729949b5c9af18e3a85b%401322971078%40%3Cuser.hbase.apache.org%3E). A workaround is passing your client-side JVM a reasonable value for \`-XX:MaxDirectMemorySize\`. By default, the \`MaxDirectMemorySize\` is equal to your \`-Xmx\` max heapsize setting (if \`-Xmx\` is set). Try setting it to something smaller (for example, one user had success setting it to \`1g\` when they had a client-side heap of \`12g\`). If you set it too small, it will bring on \`FullGCs\` so keep it a bit hefty. You want to make this setting client-side only especially if you are running the new experimental server-side off-heap cache since this feature depends on being able to use big direct buffers (You may have to keep separate client-side and server-side config dirs).

### Secure Client Cannot Connect (\\[Caused by GSSException: No valid credentials provided(Mechanism level: Failed to find any Kerberos tgt)]) \\[!toc]

There can be several causes that produce this symptom.

First, check that you have a valid Kerberos ticket. One is required in order to set up communication with a secure Apache HBase cluster. Examine the ticket currently in the credential cache, if any, by running the \`klist\` command line utility. If no ticket is listed, you must obtain a ticket by running the \`kinit\` command with either a keytab specified, or by interactively entering a password for the desired principal.

Then, consult the [Java Security Guide troubleshooting section](http://docs.oracle.com/javase/1.5.0/docs/guide/security/jgss/tutorials/Troubleshooting.html). The most common problem addressed there is resolved by setting \`javax.security.auth.useSubjectCredsOnly\` system property value to \`false\`.

Because of a change in the format in which MIT Kerberos writes its credentials cache, there is a bug in the Oracle JDK 6 Update 26 and earlier that causes Java to be unable to read the Kerberos credentials cache created by versions of MIT Kerberos 1.8.1 or higher. If you have this problematic combination of components in your environment, to work around this problem, first log in with \`kinit\` and then immediately refresh the credential cache with \`kinit -R\`. The refresh will rewrite the credential cache without the problematic formatting.

Prior to JDK 1.4, the JCE was an unbundled product, and as such, the JCA and JCE were regularly referred to as separate, distinct components. As JCE is now bundled in the JDK 7.0, the distinction is becoming less apparent. Since the JCE uses the same architecture as the JCA, the JCE should be more properly thought of as a part of the JCA.

You may need to install the [Java Cryptography Extension](https://docs.oracle.com/javase/1.5.0/docs/guide/security/jce/JCERefGuide.html), or JCE because of JDK 1.5 or earlier version. Insure the JCE jars are on the classpath on both server and client systems.

You may also need to download the [unlimited strength JCE policy files](http://www.oracle.com/technetwork/java/javase/downloads/jce-6-download-429243.html). Uncompress and extract the downloaded file, and install the policy jars into *\\<java-home>/lib/security*.

### Trouble shooting master registry issues \\[!toc]

* For connectivity issues, usually an exception like "MasterRegistryFetchException: Exception making rpc to masters..." is logged in the client logs. The logging includes the list of master end points that were attempted by the client. The bottom part of the stack trace should include the underlying reason. If you suspect connectivity issues (ConnectionRefused?), make sure the master end points are accessible from client.
* If there is a suspicion of higher load on the masters due to hedging of RPCs, it can be controlled by either reducing the hedging fan out (via *hbase.rpc.hedged.fanout*) or by restricting the set of masters that clients can access for the master registry purposes (via *hbase.masters*).

Refer to [Master Registry (new as of 2.3.0)](/docs/architecture/client#masterregistry-rpc-hedging) and [Client configuration and dependencies connecting to an HBase cluster](/docs/configuration/default#client-configuration-and-dependencies-connecting-to-an-hbase-cluster) for more details.

## MapReduce

### You Think You're On The Cluster, But You're Actually Local \\[!toc]

This following stacktrace happened using \`ImportTsv\`, but things like this can happen on any job with a mis-configuration.

\`\`\`text
    WARN mapred.LocalJobRunner: job_local_0001
java.lang.IllegalArgumentException: Can't read partitions file
       at org.apache.hadoop.hbase.mapreduce.hadoopbackport.TotalOrderPartitioner.setConf(TotalOrderPartitioner.java:111)
       at org.apache.hadoop.util.ReflectionUtils.setConf(ReflectionUtils.java:62)
       at org.apache.hadoop.util.ReflectionUtils.newInstance(ReflectionUtils.java:117)
       at org.apache.hadoop.mapred.MapTask$NewOutputCollector.<init>(MapTask.java:560)
       at org.apache.hadoop.mapred.MapTask.runNewMapper(MapTask.java:639)
       at org.apache.hadoop.mapred.MapTask.run(MapTask.java:323)
       at org.apache.hadoop.mapred.LocalJobRunner$Job.run(LocalJobRunner.java:210)
Caused by: java.io.FileNotFoundException: File _partition.lst does not exist.
       at org.apache.hadoop.fs.RawLocalFileSystem.getFileStatus(RawLocalFileSystem.java:383)
       at org.apache.hadoop.fs.FilterFileSystem.getFileStatus(FilterFileSystem.java:251)
       at org.apache.hadoop.fs.FileSystem.getLength(FileSystem.java:776)
       at org.apache.hadoop.io.SequenceFile$Reader.<init>(SequenceFile.java:1424)
       at org.apache.hadoop.io.SequenceFile$Reader.<init>(SequenceFile.java:1419)
       at org.apache.hadoop.hbase.mapreduce.hadoopbackport.TotalOrderPartitioner.readPartitions(TotalOrderPartitioner.java:296)
\`\`\`

...see the critical portion of the stack? It's...

\`\`\`text
at org.apache.hadoop.mapred.LocalJobRunner$Job.run(LocalJobRunner.java:210)
\`\`\`

LocalJobRunner means the job is running locally, not on the cluster.

To solve this problem, you should run your MR job with your \`HADOOP_CLASSPATH\` set to include the HBase dependencies. The "hbase classpath" utility can be used to do this easily. For example (substitute VERSION with your HBase version):

\`\`\`bash
HADOOP_CLASSPATH=\`hbase classpath\` hadoop jar $HBASE_HOME/hbase-mapreduce-VERSION.jar rowcounter usertable
\`\`\`

See [HBase, MapReduce, and the CLASSPATH](/docs/mapreduce#hbase-mapreduce-and-the-classpath) for more information on HBase MapReduce jobs and classpaths.

### Launching a job, you get java.lang.IllegalAccessError: com/google/protobuf/HBaseZeroCopyByteString or class com.google.protobuf.ZeroCopyLiteralByteString cannot access its superclass com.google.protobuf.LiteralByteString \\[!toc]

See [HBASE-10304 Running an hbase job jar: IllegalAccessError: class com.google.protobuf.ZeroCopyLiteralByteString cannot access its superclass com.google.protobuf.LiteralByteString](https://issues.apache.org/jira/browse/HBASE-10304) and [HBASE-11118 non environment variable solution for "IllegalAccessError: class com.google.protobuf.ZeroCopyLiteralByteString cannot access its superclass com.google.protobuf.LiteralByteString"](https://issues.apache.org/jira/browse/HBASE-11118). The issue can also show up when trying to run spark jobs. See [HBASE-10877 HBase non-retriable exception list should be expanded](https://issues.apache.org/jira/browse/HBASE-10877).

## NameNode

For more information on the NameNode, see [HDFS](/docs/architecture/hdfs).

### HDFS Utilization of Tables and Regions

To determine how much space HBase is using on HDFS use the \`hadoop\` shell commands from the NameNode. For example...

\`\`\`bash
hadoop fs -dus /hbase/
\`\`\`

...returns the summarized disk utilization for all HBase objects.

\`\`\`bash
hadoop fs -dus /hbase/myTable
\`\`\`

...returns the summarized disk utilization for the HBase table 'myTable'.

\`\`\`bash
hadoop fs -du /hbase/myTable
\`\`\`

...returns a list of the regions under the HBase table 'myTable' and their disk utilization.

For more information on HDFS shell commands, see the [HDFS FileSystem Shell documentation](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/FileSystemShell.html).

### Browsing HDFS for HBase Objects

Sometimes it will be necessary to explore the HBase objects that exist on HDFS. These objects could include the WALs (Write Ahead Logs), tables, regions, StoreFiles, etc. The easiest way to do this is with the NameNode web application that runs on port 50070. The NameNode web application will provide links to the all the DataNodes in the cluster so that they can be browsed seamlessly.

The HDFS directory structure of HBase tables in the cluster is...

\`\`\`text
/hbase
    /data
        /<Namespace>                    (Namespaces in the cluster)
            /<Table>                    (Tables in the cluster)
                /<Region>               (Regions for the table)
                    /<ColumnFamily>     (ColumnFamilies for the Region for the table)
                        /<StoreFile>    (StoreFiles for the ColumnFamily for the Regions for the table)
\`\`\`

The HDFS directory structure of HBase WAL is..

\`\`\`text
/hbase
    /WALs
        /<RegionServer>    (RegionServers)
            /<WAL>         (WAL files for the RegionServer)
\`\`\`

See the [HDFS User Guide](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsUserGuide.html) for other non-shell diagnostic utilities like \`fsck\`.

#### Zero size WALs with data in them \\[!toc]

Problem: when getting a listing of all the files in a RegionServer's *WALs* directory, one file has a size of 0 but it contains data.

Answer: It's an HDFS quirk. A file that's currently being written to will appear to have a size of 0 but once it's closed it will show its true size

#### Use Cases \\[!toc]

Two common use-cases for querying HDFS for HBase objects is research the degree of uncompaction of a table. If there are a large number of StoreFiles for each ColumnFamily it could indicate the need for a major compaction. Additionally, after a major compaction if the resulting StoreFile is "small" it could indicate the need for a reduction of ColumnFamilies for the table.

### Unexpected Filesystem Growth

If you see an unexpected spike in filesystem usage by HBase, two possible culprits are snapshots and WALs.

**Snapshots**\\
When you create a snapshot, HBase retains everything it needs to recreate the table's state at that time of the snapshot. This includes deleted cells or expired versions. For this reason, your snapshot usage pattern should be well-planned, and you should prune snapshots that you no longer need. Snapshots are stored in \`/hbase/.hbase-snapshot\`, and archives needed to restore snapshots are stored in \`/hbase/archive/<tablename>/<region>/<column_family>/\`.

<Callout type="warn">
  **Do not** manage snapshots or archives manually via HDFS. HBase provides APIs and HBase Shell
  commands for managing them. For more information, see
  [ops.snapshots](/docs/operational-management/backup-and-snapshots#hbase-snapshots).
</Callout>

**WAL**\\
Write-ahead logs (WALs) are stored in subdirectories of the HBase root directory, typically \`/hbase/\`, depending on their status. Already-processed WALs are stored in \`/hbase/oldWALs/\` and corrupt WALs are stored in \`/hbase/.corrupt/\` for examination. If the size of one of these subdirectories is growing, examine the HBase server logs to find the root cause for why WALs are not being processed correctly.\\
If you use replication and \`/hbase/oldWALs/\` is using more space than you expect, remember that WALs are saved when replication is disabled, as long as there are peers.

**Do not** manage WALs manually via HDFS.

## Network

### Network Spikes

If you are seeing periodic network spikes you might want to check the \`compactionQueues\` to see if major compactions are happening.

See [Managed Compactions](/docs/configuration/important#managed-compactions) for more information on managing compactions.

### Loopback IP

HBase expects the loopback IP Address to be 127.0.0.1.

### Network Interfaces

Are all the network interfaces functioning correctly? Are you sure? See the Troubleshooting Case Study in [Case Studies](/docs/troubleshooting#troubleshooting-case-studies).

## RegionServer

For more information on the RegionServers, see [RegionServer](/docs/architecture/regionserver).

### Startup Errors

#### Master Starts, But RegionServers Do Not \\[!toc]

The Master believes the RegionServers have the IP of 127.0.0.1 - which is localhost and resolves to the master's own localhost.

The RegionServers are erroneously informing the Master that their IP addresses are 127.0.0.1.

Modify */etc/hosts* on the region servers, from...

\`\`\`text
# Do not remove the following line, or various programs
# that require network functionality will fail.
127.0.0.1               fully.qualified.regionservername regionservername  localhost.localdomain localhost
::1             localhost6.localdomain6 localhost6
\`\`\`

... to (removing the master node's name from localhost)...

\`\`\`text
# Do not remove the following line, or various programs
# that require network functionality will fail.
127.0.0.1               localhost.localdomain localhost
::1             localhost6.localdomain6 localhost6
\`\`\`

#### Compression Link Errors \\[!toc]

Since compression algorithms such as LZO need to be installed and configured on each cluster this is a frequent source of startup error. If you see messages like this...

\`\`\`text
11/02/20 01:32:15 ERROR lzo.GPLNativeCodeLoader: Could not load native gpl library
java.lang.UnsatisfiedLinkError: no gplcompression in java.library.path
        at java.lang.ClassLoader.loadLibrary(ClassLoader.java:1734)
        at java.lang.Runtime.loadLibrary0(Runtime.java:823)
        at java.lang.System.loadLibrary(System.java:1028)
\`\`\`

... then there is a path issue with the compression libraries. See the Configuration section on [LZO compression configuration](/docs/compression#configure-hbase-for-compressors).

#### RegionServer aborts due to lack of hsync for filesystem \\[!toc]

In order to provide data durability for writes to the cluster HBase relies on the ability to durably save state in a write ahead log. When using a version of Apache Hadoop Common's filesystem API that supports checking on the availability of needed calls, HBase will proactively abort the cluster if it finds it can't operate safely.

For RegionServer roles, the failure will show up in logs like this:

\`\`\`text
2018-04-05 11:36:22,785 ERROR [regionserver/192.168.1.123:16020] wal.AsyncFSWALProvider: The RegionServer async write ahead log provider relies on the ability to call hflush and hsync for proper operation during component failures, but the current FileSystem does not support doing so. Please check the config value of 'hbase.wal.dir' and ensure it points to a FileSystem mount that has suitable capabilities for output streams.
2018-04-05 11:36:22,799 ERROR [regionserver/192.168.1.123:16020] regionserver.HRegionServer: ***** ABORTING region server 192.168.1.123,16020,1522946074234: Unhandled: cannot get log writer *****
java.io.IOException: cannot get log writer
        at org.apache.hadoop.hbase.wal.AsyncFSWALProvider.createAsyncWriter(AsyncFSWALProvider.java:112)
        at org.apache.hadoop.hbase.regionserver.wal.AsyncFSWAL.createWriterInstance(AsyncFSWAL.java:612)
        at org.apache.hadoop.hbase.regionserver.wal.AsyncFSWAL.createWriterInstance(AsyncFSWAL.java:124)
        at org.apache.hadoop.hbase.regionserver.wal.AbstractFSWAL.rollWriter(AbstractFSWAL.java:759)
        at org.apache.hadoop.hbase.regionserver.wal.AbstractFSWAL.rollWriter(AbstractFSWAL.java:489)
        at org.apache.hadoop.hbase.regionserver.wal.AsyncFSWAL.<init>(AsyncFSWAL.java:251)
        at org.apache.hadoop.hbase.wal.AsyncFSWALProvider.createWAL(AsyncFSWALProvider.java:69)
        at org.apache.hadoop.hbase.wal.AsyncFSWALProvider.createWAL(AsyncFSWALProvider.java:44)
        at org.apache.hadoop.hbase.wal.AbstractFSWALProvider.getWAL(AbstractFSWALProvider.java:138)
        at org.apache.hadoop.hbase.wal.AbstractFSWALProvider.getWAL(AbstractFSWALProvider.java:57)
        at org.apache.hadoop.hbase.wal.WALFactory.getWAL(WALFactory.java:252)
        at org.apache.hadoop.hbase.regionserver.HRegionServer.getWAL(HRegionServer.java:2105)
        at org.apache.hadoop.hbase.regionserver.HRegionServer.buildServerLoad(HRegionServer.java:1326)
        at org.apache.hadoop.hbase.regionserver.HRegionServer.tryRegionServerReport(HRegionServer.java:1191)
        at org.apache.hadoop.hbase.regionserver.HRegionServer.run(HRegionServer.java:1007)
        at java.lang.Thread.run(Thread.java:745)
Caused by: org.apache.hadoop.hbase.util.CommonFSUtils$StreamLacksCapabilityException: hflush and hsync
        at org.apache.hadoop.hbase.io.asyncfs.AsyncFSOutputHelper.createOutput(AsyncFSOutputHelper.java:69)
        at org.apache.hadoop.hbase.regionserver.wal.AsyncProtobufLogWriter.initOutput(AsyncProtobufLogWriter.java:168)
        at org.apache.hadoop.hbase.regionserver.wal.AbstractProtobufLogWriter.init(AbstractProtobufLogWriter.java:167)
        at org.apache.hadoop.hbase.wal.AsyncFSWALProvider.createAsyncWriter(AsyncFSWALProvider.java:99)
        ... 15 more
\`\`\`

If you are attempting to run in standalone mode and see this error, please walk back through the section [Quick Start - Standalone HBase](/docs/getting-started#quick-start---standalone-hbase) and ensure you have included **all** the given configuration settings.

#### RegionServer aborts due to can not initialize access to HDFS \\[!toc]

We will try to use *AsyncFSWAL* for HBase-2.x as it has better performance while consuming less resources. But the problem for *AsyncFSWAL* is that it hacks into the internal of the DFSClient implementation, so it will easily be broken when upgrading hadoop, even for a simple patch release.

If you do not specify the wal provider, we will try to fall back to the old *FSHLog* if we fail to initialize *AsyncFSWAL*, but it may not always work. The failure will show up in logs like this:

\`\`\`text
18/07/02 18:51:06 WARN concurrent.DefaultPromise: An exception was
thrown by org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputHelper$13.operationComplete()
java.lang.Error: Couldn't properly initialize access to HDFS
internals. Please update your WAL Provider to not make use of the
'asyncfs' provider. See HBASE-16110 for more information.
     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputSaslHelper.<clinit>(FanOutOneBlockAsyncDFSOutputSaslHelper.java:268)
     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputHelper.initialize(FanOutOneBlockAsyncDFSOutputHelper.java:661)
     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputHelper.access$300(FanOutOneBlockAsyncDFSOutputHelper.java:118)
     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputHelper$13.operationComplete(FanOutOneBlockAsyncDFSOutputHelper.java:720)
     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputHelper$13.operationComplete(FanOutOneBlockAsyncDFSOutputHelper.java:715)
     at org.apache.hbase.thirdparty.io.netty.util.concurrent.DefaultPromise.notifyListener0(DefaultPromise.java:507)
     at org.apache.hbase.thirdparty.io.netty.util.concurrent.DefaultPromise.notifyListeners0(DefaultPromise.java:500)
     at org.apache.hbase.thirdparty.io.netty.util.concurrent.DefaultPromise.notifyListenersNow(DefaultPromise.java:479)
     at org.apache.hbase.thirdparty.io.netty.util.concurrent.DefaultPromise.notifyListeners(DefaultPromise.java:420)
     at org.apache.hbase.thirdparty.io.netty.util.concurrent.DefaultPromise.trySuccess(DefaultPromise.java:104)
     at org.apache.hbase.thirdparty.io.netty.channel.DefaultChannelPromise.trySuccess(DefaultChannelPromise.java:82)
     at org.apache.hbase.thirdparty.io.netty.channel.epoll.AbstractEpollChannel$AbstractEpollUnsafe.fulfillConnectPromise(AbstractEpollChannel.java:638)
     at org.apache.hbase.thirdparty.io.netty.channel.epoll.AbstractEpollChannel$AbstractEpollUnsafe.finishConnect(AbstractEpollChannel.java:676)
     at org.apache.hbase.thirdparty.io.netty.channel.epoll.AbstractEpollChannel$AbstractEpollUnsafe.epollOutReady(AbstractEpollChannel.java:552)
     at org.apache.hbase.thirdparty.io.netty.channel.epoll.EpollEventLoop.processReady(EpollEventLoop.java:394)
     at org.apache.hbase.thirdparty.io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:304)
     at org.apache.hbase.thirdparty.io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:858)
     at org.apache.hbase.thirdparty.io.netty.util.concurrent.DefaultThreadFactory$DefaultRunnableDecorator.run(DefaultThreadFactory.java:138)
     at java.lang.Thread.run(Thread.java:748)
 Caused by: java.lang.NoSuchMethodException:
org.apache.hadoop.hdfs.DFSClient.decryptEncryptedDataEncryptionKey(org.apache.hadoop.fs.FileEncryptionInfo)
     at java.lang.Class.getDeclaredMethod(Class.java:2130)
     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputSaslHelper.createTransparentCryptoHelper(FanOutOneBlockAsyncDFSOutputSaslHelper.java:232)
     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputSaslHelper.<clinit>(FanOutOneBlockAsyncDFSOutputSaslHelper.java:262)
     ... 18 more
\`\`\`

If you hit this error, please specify *FSHLog*, i.e, *filesystem*, explicitly in your config file.

\`\`\`xml
<property>
  <name>hbase.wal.provider</name>
  <value>filesystem</value>
</property>
\`\`\`

And do not forget to send an email to the \`user@hbase.apache.org\` or \`dev@hbase.apache.org\` to report the failure and also your hadoop version, we will try to fix the problem ASAP in the next release.

### Runtime Errors

#### RegionServer Hanging \\[!toc]

Are you running an old JVM (\`< \`1.6.0*u21?)? When you look at a thread dump, does it look like threads are BLOCKED but no one holds the lock all are blocked on? See [HBASE 3622 Deadlock in HBaseServer (JVM bug?)](https://issues.apache.org/jira/browse/HBASE-3622). Adding \`-XX:+UseMembar\` to the HBase \`HBASE_OPTS\` in \\_conf/hbase-env.sh* may fix it.

#### java.io.IOException...(Too many open files) \\[!toc]

If you see log messages like this...

\`\`\`text
2010-09-13 01:24:17,336 WARN org.apache.hadoop.hdfs.server.datanode.DataNode:
Disk-related IOException in BlockReceiver constructor. Cause is java.io.IOException: Too many open files
        at java.io.UnixFileSystem.createFileExclusively(Native Method)
        at java.io.File.createNewFile(File.java:883)
\`\`\`

... see the Getting Started section on [ulimit and nproc configuration](/docs/configuration/basic-prerequisites#example-ulimit-settings-on-ubuntu-toc).

#### xceiverCount 258 exceeds the limit of concurrent xcievers 256 \\[!toc]

This typically shows up in the DataNode logs.

TODO: add link.
See the Getting Started section on xceivers configuration.

#### System instability, and the presence of "java.lang.OutOfMemoryError: unable to createnew native thread in exceptions" HDFS DataNode logs or that of any system daemon \\[!toc]

See the Getting Started section on ulimit and nproc configuration. The default on recent Linux distributions is 1024 - which is far too low for HBase.

#### DFS instability and/or RegionServer lease timeouts \\[!toc]

If you see warning messages like this...

\`\`\`text
2009-02-24 10:01:33,516 WARN org.apache.hadoop.hbase.util.Sleeper: We slept xxx ms, ten times longer than scheduled: 10000
2009-02-24 10:01:33,516 WARN org.apache.hadoop.hbase.util.Sleeper: We slept xxx ms, ten times longer than scheduled: 15000
2009-02-24 10:01:36,472 WARN org.apache.hadoop.hbase.regionserver.HRegionServer: unable to report to master for xxx milliseconds - retrying
\`\`\`

... or see full GC compactions then you may be experiencing full GC's.

#### "No live nodes contain current block" and/or YouAreDeadException \\[!toc]

These errors can happen either when running out of OS file handles or in periods of severe network problems where the nodes are unreachable.

See the Getting Started section on ulimit and nproc configuration and check your network.

#### ZooKeeper SessionExpired events \\[!toc]

Master or RegionServers shutting down with messages like those in the logs:

\`\`\`text
WARN org.apache.zookeeper.ClientCnxn: Exception
closing session 0x278bd16a96000f to sun.nio.ch.SelectionKeyImpl@355811ec
java.io.IOException: TIMED OUT
       at org.apache.zookeeper.ClientCnxn$SendThread.run(ClientCnxn.java:906)
WARN org.apache.hadoop.hbase.util.Sleeper: We slept 79410ms, ten times longer than scheduled: 5000
INFO org.apache.zookeeper.ClientCnxn: Attempting connection to server hostname/IP:PORT
INFO org.apache.zookeeper.ClientCnxn: Priming connection to java.nio.channels.SocketChannel[connected local=/IP:PORT remote=hostname/IP:PORT]
INFO org.apache.zookeeper.ClientCnxn: Server connection successful
WARN org.apache.zookeeper.ClientCnxn: Exception closing session 0x278bd16a96000d to sun.nio.ch.SelectionKeyImpl@3544d65e
java.io.IOException: Session Expired
       at org.apache.zookeeper.ClientCnxn$SendThread.readConnectResult(ClientCnxn.java:589)
       at org.apache.zookeeper.ClientCnxn$SendThread.doIO(ClientCnxn.java:709)
       at org.apache.zookeeper.ClientCnxn$SendThread.run(ClientCnxn.java:945)
ERROR org.apache.hadoop.hbase.regionserver.HRegionServer: ZooKeeper session expired
\`\`\`

The JVM is doing a long running garbage collecting which is pausing every threads (aka "stop the world"). Since the RegionServer's local ZooKeeper client cannot send heartbeats, the session times out. By design, we shut down any node that isn't able to contact the ZooKeeper ensemble after getting a timeout so that it stops serving data that may already be assigned elsewhere.

* Make sure you give plenty of RAM (in *hbase-env.sh*), the default of 1GB won't be able to sustain long running imports.
* Make sure you don't swap, the JVM never behaves well under swapping.
* Make sure you are not CPU starving the RegionServer thread. For example, if you are running a MapReduce job using 6 CPU-intensive tasks on a machine with 4 cores, you are probably starving the RegionServer enough to create longer garbage collection pauses.
* Increase the ZooKeeper session timeout

If you wish to increase the session timeout, add the following to your *hbase-site.xml* to increase the timeout from the default of 60 seconds to 120 seconds.

\`\`\`xml
<property>
  <name>zookeeper.session.timeout</name>
  <value>120000</value>
</property>
<property>
  <name>hbase.zookeeper.property.tickTime</name>
  <value>6000</value>
</property>
\`\`\`

Be aware that setting a higher timeout means that the regions served by a failed RegionServer will take at least that amount of time to be transferred to another RegionServer. For a production system serving live requests, we would instead recommend setting it lower than 1 minute and over-provision your cluster in order the lower the memory load on each machines (hence having less garbage to collect per machine).

If this is happening during an upload which only happens once (like initially loading all your data into HBase), consider bulk loading.

See [ZooKeeper, The Cluster Canary](/docs/troubleshooting#zookeeper-the-cluster-canary) for other general information about ZooKeeper troubleshooting.

#### NotServingRegionException \\[!toc]

This exception is "normal" when found in the RegionServer logs at DEBUG level. This exception is returned back to the client and then the client goes back to \`hbase:meta\` to find the new location of the moved region.

However, if the NotServingRegionException is logged ERROR, then the client ran out of retries and something probably wrong.

#### Logs flooded with '2011-01-10 12:40:48,407 INFO org.apache.hadoop.io.compress.CodecPool: Gotbrand-new compressor' messages \\[!toc]

We are not using the native versions of compression libraries. See [HBASE-1900 Put back native support when hadoop 0.21 is released](https://issues.apache.org/jira/browse/HBASE-1900). Copy the native libs from hadoop under HBase lib dir or symlink them into place and the message should go away.

#### Server handler X on 60020 caught: java.nio.channels.ClosedChannelException \\[!toc]

If you see this type of message it means that the region server was trying to read/send data from/to a client but it already went away. Typical causes for this are if the client was killed (you see a storm of messages like this when a MapReduce job is killed or fails) or if the client receives a SocketTimeoutException. It's harmless, but you should consider digging in a bit more if you aren't doing something to trigger them.

### Snapshot Errors Due to Reverse DNS

Several operations within HBase, including snapshots, rely on properly configured reverse DNS. Some environments, such as Amazon EC2, have trouble with reverse DNS. If you see errors like the following on your RegionServers, check your reverse DNS configuration:

\`\`\`text
2013-05-01 00:04:56,356 DEBUG org.apache.hadoop.hbase.procedure.Subprocedure: Subprocedure 'backup1'
coordinator notified of 'acquire', waiting on 'reached' or 'abort' from coordinator.
\`\`\`

In general, the hostname reported by the RegionServer needs to be the same as the hostname the Master is trying to reach. You can see a hostname mismatch by looking for the following type of message in the RegionServer's logs at start-up.

\`\`\`text
2013-05-01 00:03:00,614 INFO org.apache.hadoop.hbase.regionserver.HRegionServer: Master passed us hostname
to use. Was=myhost-1234, Now=ip-10-55-88-99.ec2.internal
\`\`\`

### Shutdown Errors

## Master

For more information on the Master, see [master](/docs/architecture/master).

### Startup Errors

#### Master says that you need to run the HBase migrations script \\[!toc]

Upon running that, the HBase migrations script says no files in root directory.

HBase expects the root directory to either not exist, or to have already been initialized by HBase running a previous time. If you create a new directory for HBase using Hadoop DFS, this error will occur. Make sure the HBase root directory does not currently exist or has been initialized by a previous run of HBase. Sure fire solution is to just use Hadoop dfs to delete the HBase root and let HBase create and initialize the directory itself.

#### Packet len6080218 is out of range! \\[!toc]

If you have many regions on your cluster and you see an error like that reported above in this sections title in your logs, see [HBASE-4246 Cluster with too many regions cannot withstand some master failover scenarios](https://issues.apache.org/jira/browse/HBASE-4246).

#### Master fails to become active due to lack of hsync for filesystem \\[!toc]

HBase's internal framework for cluster operations requires the ability to durably save state in a write ahead log. When using a version of Apache Hadoop Common's filesystem API that supports checking on the availability of needed calls, HBase will proactively abort the cluster if it finds it can't operate safely.

For Master roles, the failure will show up in logs like this:

\`\`\`text
2018-04-05 11:18:44,653 ERROR [Thread-21] master.HMaster: Failed to become active master
java.lang.IllegalStateException: The procedure WAL relies on the ability to hsync for proper operation during component failures, but the underlying filesystem does not support doing so. Please check the config value of 'hbase.procedure.store.wal.use.hsync' to set the desired level of robustness and ensure the config value of 'hbase.wal.dir' points to a FileSystem mount that can provide it.
        at org.apache.hadoop.hbase.procedure2.store.wal.WALProcedureStore.rollWriter(WALProcedureStore.java:1034)
        at org.apache.hadoop.hbase.procedure2.store.wal.WALProcedureStore.recoverLease(WALProcedureStore.java:374)
        at org.apache.hadoop.hbase.procedure2.ProcedureExecutor.start(ProcedureExecutor.java:530)
        at org.apache.hadoop.hbase.master.HMaster.startProcedureExecutor(HMaster.java:1267)
        at org.apache.hadoop.hbase.master.HMaster.startServiceThreads(HMaster.java:1173)
        at org.apache.hadoop.hbase.master.HMaster.finishActiveMasterInitialization(HMaster.java:881)
        at org.apache.hadoop.hbase.master.HMaster.startActiveMasterManager(HMaster.java:2048)
        at org.apache.hadoop.hbase.master.HMaster.lambda$run$0(HMaster.java:568)
        at java.lang.Thread.run(Thread.java:745)
\`\`\`

If you are attempting to run in standalone mode and see this error, please walk back through the section [Quick Start - Standalone HBase](/docs/getting-started#quick-start---standalone-hbase) and ensure you have included **all** the given configuration settings.

### Shutdown Errors

## ZooKeeper

### Startup Errors

#### Could not find my address: xyz in list of ZooKeeper quorum servers \\[!toc]

A ZooKeeper server wasn't able to start, throws that error. xyz is the name of your server.

This is a name lookup problem. HBase tries to start a ZooKeeper server on some machine but that machine isn't able to find itself in the \`hbase.zookeeper.quorum\` configuration.

Use the hostname presented in the error message instead of the value you used. If you have a DNS server, you can set \`hbase.zookeeper.dns.interface\` and \`hbase.zookeeper.dns.nameserver\` in *hbase-site.xml* to make sure it resolves to the correct FQDN.

### ZooKeeper, The Cluster Canary

ZooKeeper is the cluster's "canary in the mineshaft". It'll be the first to notice issues if any so making sure its happy is the short-cut to a humming cluster.

See the [ZooKeeper Operating Environment Troubleshooting](https://cwiki.apache.org/confluence/display/HADOOP2/ZooKeeper+Troubleshooting) page. It has suggestions and tools for checking disk and networking performance; i.e. the operating environment your ZooKeeper and HBase are running in.

Additionally, the utility [zkcli](/docs/troubleshooting#zkcli) may help investigate ZooKeeper issues.

## Amazon EC2

### ZooKeeper does not seem to work on Amazon EC2

HBase does not start when deployed as Amazon EC2 instances. Exceptions like the below appear in the Master and/or RegionServer logs:

\`\`\`text
  2009-10-19 11:52:27,030 INFO org.apache.zookeeper.ClientCnxn: Attempting
  connection to server ec2-174-129-15-236.compute-1.amazonaws.com/10.244.9.171:2181
  2009-10-19 11:52:27,032 WARN org.apache.zookeeper.ClientCnxn: Exception
  closing session 0x0 to sun.nio.ch.SelectionKeyImpl@656dc861
  java.net.ConnectException: Connection refused
\`\`\`

Security group policy is blocking the ZooKeeper port on a public address. Use the internal EC2 host names when configuring the ZooKeeper quorum peer list.

### Instability on Amazon EC2

Questions on HBase and Amazon EC2 come up frequently on the HBase dist-list.

### Remote Java Connection into EC2 Cluster Not Working

See Andrew's answer here, up on the user list: [Remote Java client connection into EC2 instance](https://lists.apache.org/thread.html/666bfa863bc2eb2ec7bbe5ecfbee345e0cbf1d58aaa6c1636dfcb527%401269010842%40%3Cuser.hbase.apache.org%3E).

## HBase and Hadoop version issues

### ...cannot communicate with client version...

If you see something like the following in your logs ... 2012-09-24 10:20:52,168 FATAL org.apache.hadoop.hbase.master.HMaster: Unhandled exception. Starting shutdown. org.apache.hadoop.ipc.RemoteException: Server IPC version 7 cannot communicate with client version 4 ... ...are you trying to talk to an Hadoop 2.0.x from an HBase that has an Hadoop 1.0.x client? Use the HBase built against Hadoop 2.0 or rebuild your HBase passing the -Dhadoop.profile=2.0 attribute to Maven (See [Building against various Hadoop versions](/docs/building-and-developing/building#building-against-various-hadoop-versions) for more).

## HBase and HDFS

General configuration guidance for Apache HDFS is out of the scope of this guide. Refer to the documentation available at [https://hadoop.apache.org/](https://hadoop.apache.org/) for extensive information about configuring HDFS. This section deals with HDFS in terms of HBase.

In most cases, HBase stores its data in Apache HDFS. This includes the HFiles containing the data, as well as the write-ahead logs (WALs) which store data before it is written to the HFiles and protect against RegionServer crashes. HDFS provides reliability and protection to data in HBase because it is distributed. To operate with the most efficiency, HBase needs data to be available locally. Therefore, it is a good practice to run an HDFS DataNode on each RegionServer.

### Important Information and Guidelines for HBase and HDFS

**HBase is a client of HDFS.**\\
HBase is an HDFS client, using the HDFS \`DFSClient\` class, and references to this class appear in HBase logs with other HDFS client log messages.

**Configuration is necessary in multiple places.**\\
Some HDFS configurations relating to HBase need to be done at the HDFS (server) side. Others must be done within HBase (at the client side). Other settings need to be set at both the server and client side.

**Write errors which affect HBase may be logged in the HDFS logs rather than HBase logs.**\\
When writing, HDFS pipelines communications from one DataNode to another. HBase communicates to both the HDFS NameNode and DataNode, using the HDFS client classes. Communication problems between DataNodes are logged in the HDFS logs, not the HBase logs.

**HBase communicates with HDFS using two different ports.**\\
HBase communicates with DataNodes using the \`ipc.Client\` interface and the \`DataNode\` class. References to these will appear in HBase logs. Each of these communication channels use a different port (50010 and 50020 by default). The ports are configured in the HDFS configuration, via the \`dfs.datanode.address\` and \`dfs.datanode.ipc.address\` parameters.

**Errors may be logged in HBase, HDFS, or both.**\\
When troubleshooting HDFS issues in HBase, check logs in both places for errors.

**HDFS takes a while to mark a node as dead. You can configure HDFS to avoid using stale DataNodes.**\\
By default, HDFS does not mark a node as dead until it is unreachable for 630 seconds. In Hadoop 1.1 and Hadoop 2.x, this can be alleviated by enabling checks for stale DataNodes, though this check is disabled by default. You can enable the check for reads and writes separately, via \`dfs.namenode.avoid.read.stale.datanode\` and \`dfs.namenode.avoid.write.stale.datanode settings\`. A stale DataNode is one that has not been reachable for \`dfs.namenode.stale.datanode.interval\` (default is 30 seconds). Stale datanodes are avoided, and marked as the last possible target for a read or write operation. For configuration details, see the HDFS documentation.

**Settings for HDFS retries and timeouts are important to HBase.**\\
You can configure settings for various retries and timeouts. Always refer to the HDFS documentation for current recommendations and defaults. Some of the settings important to HBase are listed here. Defaults are current as of Hadoop 2.3. Check the Hadoop documentation for the most current values and recommendations.

**The HBase Balancer and HDFS Balancer are incompatible**\\
The HDFS balancer attempts to spread HDFS blocks evenly among DataNodes. HBase relies on compactions to restore locality after a region split or failure. These two types of balancing do not work well together.

In the past, the generally accepted advice was to turn off the HDFS load balancer and rely on the HBase balancer, since the HDFS balancer would degrade locality. This advice is still valid if your HDFS version is lower than 2.7.1.

[HDFS-6133](https://issues.apache.org/jira/browse/HDFS-6133) provides the ability to exclude favored-nodes (pinned) blocks from the HDFS load balancer, by setting the \`dfs.datanode.block-pinning.enabled\` property to \`true\` in the HDFS service configuration.

HBase can be enabled to use the HDFS favored-nodes feature by switching the HBase balancer class (conf: \`hbase.master.loadbalancer.class\`) to \`org.apache.hadoop.hbase.favored.FavoredNodeLoadBalancer\` which is documented [here](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/favored/FavoredNodeLoadBalancer.html).

<Callout type="info">
  HDFS-6133 is available in HDFS 2.7.0 and higher, but HBase does not support running on HDFS 2.7.0,
  so you must be using HDFS 2.7.1 or higher to use this feature with HBase.
</Callout>

### Connection Timeouts

Connection timeouts occur between the client (HBASE) and the HDFS DataNode. They may occur when establishing a connection, attempting to read, or attempting to write. The two settings below are used in combination, and affect connections between the DFSClient and the DataNode, the ipc.cClient and the DataNode, and communication between two DataNodes.

\`dfs.client.socket-timeout\` (default: 60000)\\
The amount of time before a client connection times out when establishing a connection or reading. The value is expressed in milliseconds, so the default is 60 seconds.

\`dfs.datanode.socket.write.timeout\` (default: 480000)\\
The amount of time before a write operation times out. The default is 8 minutes, expressed as milliseconds.

### Typical Error Logs

The following types of errors are often seen in the logs.

\`INFO HDFS.DFSClient: Failed to connect to /xxx50010, add to deadNodes and continue java.net.SocketTimeoutException: 60000 millis timeout while waiting for channel to be ready for connect. ch : java.nio.channels.SocketChannel[connection-pending remote=/region-server-1:50010]\`:: All DataNodes for a block are dead, and recovery is not possible. Here is the sequence of events that leads to this error:

\`INFO org.apache.hadoop.HDFS.DFSClient: Exception in createBlockOutputStream java.net.SocketTimeoutException: 69000 millis timeout while waiting for channel to be ready for connect. ch : java.nio.channels.SocketChannel[connection-pending remote=/ xxx:50010]\`:: This type of error indicates a write issue. In this case, the master wants to split the log. It does not have a local DataNodes so it tries to connect to a remote DataNode, but the DataNode is dead.

## Running unit or integration tests

### Runtime exceptions from MiniDFSCluster when running tests

If you see something like the following

\`\`\`text
...
java.lang.NullPointerException: null
at org.apache.hadoop.hdfs.MiniDFSCluster.startDataNodes
at org.apache.hadoop.hdfs.MiniDFSCluster.<init>
at org.apache.hadoop.hbase.MiniHBaseCluster.<init>
at org.apache.hadoop.hbase.HBaseTestingUtility.startMiniDFSCluster
at org.apache.hadoop.hbase.HBaseTestingUtility.startMiniCluster
...
\`\`\`

or

\`\`\`text
...
java.io.IOException: Shutting down
at org.apache.hadoop.hbase.MiniHBaseCluster.init
at org.apache.hadoop.hbase.MiniHBaseCluster.<init>
at org.apache.hadoop.hbase.MiniHBaseCluster.<init>
at org.apache.hadoop.hbase.HBaseTestingUtility.startMiniHBaseCluster
at org.apache.hadoop.hbase.HBaseTestingUtility.startMiniCluster
...
\`\`\`

... then try issuing the command umask 022 before launching tests. This is a workaround for [HDFS-2556](https://issues.apache.org/jira/browse/HDFS-2556)

## Case Studies

For Performance and Troubleshooting Case Studies, see [Apache HBase Case Studies](/docs/case-studies).

## Cryptographic Features

### sun.security.pkcs11.wrapper.PKCS11Exception: CKR\\_ARGUMENTS\\_BAD \\[!toc]

This problem manifests as exceptions ultimately caused by:

\`\`\`text
Caused by: sun.security.pkcs11.wrapper.PKCS11Exception: CKR_ARGUMENTS_BAD
  at sun.security.pkcs11.wrapper.PKCS11.C_DecryptUpdate(Native Method)
  at sun.security.pkcs11.P11Cipher.implDoFinal(P11Cipher.java:795)
\`\`\`

This problem appears to affect some versions of OpenJDK 7 shipped by some Linux vendors. NSS is configured as the default provider. If the host has an x86\\_64 architecture, depending on if the vendor packages contain the defect, the NSS provider will not function correctly.

To work around this problem, find the JRE home directory and edit the file *lib/security/java.security*. Edit the file to comment out the line:

\`\`\`text
security.provider.1=sun.security.pkcs11.SunPKCS11 \${java.home}/lib/security/nss.cfg
\`\`\`

Then renumber the remaining providers accordingly.

## Operating System Specific Issues

### Page Allocation Failure \\[!toc]

<Callout type="info">
  This issue is known to affect CentOS 6.2 and possibly CentOS 6.5. It may also affect some versions
  of Red Hat Enterprise Linux, according to
  [https://bugzilla.redhat.com/show\\_bug.cgi?id=770545](https://bugzilla.redhat.com/show_bug.cgi?id=770545).
</Callout>

Some users have reported seeing the following error:

\`\`\`text
kernel: java: page allocation failure. order:4, mode:0x20
\`\`\`

Raising the value of \`min_free_kbytes\` was reported to fix this problem. This parameter is set to a percentage of the amount of RAM on your system, and is described in more detail at [https://docs.kernel.org/admin-guide/sysctl/vm.html#min-free-kbytes](https://docs.kernel.org/admin-guide/sysctl/vm.html#min-free-kbytes).

To find the current value on your system, run the following command:

\`\`\`bash
[user@host]# cat /proc/sys/vm/min_free_kbytes
\`\`\`

Next, raise the value. Try doubling, then quadrupling the value. Note that setting the value too low or too high could have detrimental effects on your system. Consult your operating system vendor for specific recommendations.

Use the following command to modify the value of \`min_free_kbytes\`, substituting *VALUE* with your intended value:

\`\`\`bash
[user@host]# echo <value> > /proc/sys/vm/min_free_kbytes
\`\`\`

## JDK Issues

### NoSuchMethodError: java.util.concurrent.ConcurrentHashMap.keySet \\[!toc]

If you see this in your logs:

\`\`\`text
Caused by: java.lang.NoSuchMethodError: java.util.concurrent.ConcurrentHashMap.keySet()Ljava/util/concurrent/ConcurrentHashMap$KeySetView;
  at org.apache.hadoop.hbase.master.ServerManager.findServerWithSameHostnamePortWithLock(ServerManager.java:393)
  at org.apache.hadoop.hbase.master.ServerManager.checkAndRecordNewServer(ServerManager.java:307)
  at org.apache.hadoop.hbase.master.ServerManager.regionServerStartup(ServerManager.java:244)
  at org.apache.hadoop.hbase.master.MasterRpcServices.regionServerStartup(MasterRpcServices.java:304)
  at org.apache.hadoop.hbase.protobuf.generated.RegionServerStatusProtos$RegionServerStatusService$2.callBlockingMethod(RegionServerStatusProtos.java:7910)
  at org.apache.hadoop.hbase.ipc.RpcServer.call(RpcServer.java:2020)
  ... 4 more
\`\`\`

then check if you compiled with jdk8 and tried to run it on jdk7. If so, this won't work. Run on jdk8 or recompile with jdk7. See [HBASE-10607 JDK8 NoSuchMethodError involving ConcurrentHashMap.keySet if running on JRE 7](https://issues.apache.org/jira/browse/HBASE-10607).

### Full gc caused by mslab when using G1 \\[!toc]

The default size of chunk used by mslab is 2MB, when using G1, if heapRegionSize equals 4MB, these chunks are allocated as humongous objects, exclusively allocating one region, then the remaining 2MB become memory fragment.

Lots of memory fragment may lead to full gc even if the percent of used heap not high enough.

The G1HeapRegionSize calculated by initial\\_heap\\_size and max\\_heap\\_size, here are some cases for better understand:

* xmx=10G -> region size 2M
* xms=10G, xmx=10G -> region size 4M
* xmx=20G -> region size 4M
* xms=20G, xmx=20G -> region size 8M
* xmx=30G -> region size 4M
* xmx=32G -> region size 8M

You can avoid this problem by reducing the chunk size a bit to 2047KB as below.

\`\`\`properties
hbase.hregion.memstore.mslab.chunksize 2096128
\`\`\`
`,l={title:"Troubleshooting and Debugging Apache HBase",description:"Comprehensive guide to troubleshooting and debugging HBase issues including logs, tools, common problems, and solutions."},h=[{href:"/docs/configuration/basic-prerequisites#limits-on-number-of-files-and-processes-ulimit"},{href:"/docs/configuration/basic-prerequisites#dfsdatanodemaxtransferthreads"},{href:"https://blog.cloudera.com/blog/2011/02/avoiding-full-gcs-in-hbase-with-memstore-local-allocation-buffers-part-1/"},{href:"/docs/performance#long-gc-pauses"},{href:"https://blog.cloudera.com/blog/2011/02/avoiding-full-gcs-in-hbase-with-memstore-local-allocation-buffers-part-1/"},{href:"/docs/performance#long-gc-pauses"},{href:"https://hbase.apache.org/mailing-lists.html"},{href:"http://www.mikeash.com/getting_answers.html"},{href:"https://the-asf.slack.com/"},{href:"https://issues.apache.org/jira/browse/HBASE"},{href:"/docs/operational-management/metrics-and-monitoring"},{href:"http://www.linuxjournal.com/article/9001"},{href:"http://opentsdb.net"},{href:"/docs/architecture/client"},{href:"/docs/performance#scan-caching"},{href:"/docs/troubleshooting#scannertimeoutexception-or-unknownscannerexception"},{href:"http://blog.cloudera.com/blog/2014/04/how-to-use-the-hbase-thrift-interface-part-3-using-scans/"},{href:"/docs/troubleshooting#scannertimeoutexception-or-unknownscannerexception"},{href:"https://mail-archives.apache.org/mod_mbox/hbase-user/201209.mbox/%3CCAOcnVr3R-LqtKhFsk8Bhrm-YW2i9O6J6Fhjz2h7q6_sxvwd2yw%40mail.gmail.com%3E"},{href:"/docs/performance#table-creation-pre-creating-regions"},{href:"/docs/performance#hbase-configurations"},{href:"http://krbdev.mit.edu/rt/Ticket/Display.html?id=1201"},{href:"http://krbdev.mit.edu/rt/Ticket/Display.html?id=5924"},{href:"https://issues.apache.org/jira/browse/HBASE-10379"},{href:"/docs/troubleshooting#zkcli"},{href:"https://lists.apache.org/thread.html/d12bbe56be95cf68478d1528263042730670ff39159a01eaf06d8bc8%401322622090%40%3Cuser.hbase.apache.org%3E"},{href:"https://lists.apache.org/thread.html/621dde35479215f0b07b23af93b8fac52ff4729949b5c9af18e3a85b%401322971078%40%3Cuser.hbase.apache.org%3E"},{href:"http://docs.oracle.com/javase/1.5.0/docs/guide/security/jgss/tutorials/Troubleshooting.html"},{href:"https://docs.oracle.com/javase/1.5.0/docs/guide/security/jce/JCERefGuide.html"},{href:"http://www.oracle.com/technetwork/java/javase/downloads/jce-6-download-429243.html"},{href:"/docs/architecture/client#masterregistry-rpc-hedging"},{href:"/docs/configuration/default#client-configuration-and-dependencies-connecting-to-an-hbase-cluster"},{href:"/docs/mapreduce#hbase-mapreduce-and-the-classpath"},{href:"https://issues.apache.org/jira/browse/HBASE-10304"},{href:"https://issues.apache.org/jira/browse/HBASE-11118"},{href:"https://issues.apache.org/jira/browse/HBASE-10877"},{href:"/docs/architecture/hdfs"},{href:"https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/FileSystemShell.html"},{href:"https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsUserGuide.html"},{href:"/docs/operational-management/backup-and-snapshots#hbase-snapshots"},{href:"/docs/configuration/important#managed-compactions"},{href:"/docs/troubleshooting#troubleshooting-case-studies"},{href:"/docs/architecture/regionserver"},{href:"/docs/compression#configure-hbase-for-compressors"},{href:"/docs/getting-started#quick-start---standalone-hbase"},{href:"https://issues.apache.org/jira/browse/HBASE-3622"},{href:"/docs/configuration/basic-prerequisites#example-ulimit-settings-on-ubuntu-toc"},{href:"/docs/troubleshooting#zookeeper-the-cluster-canary"},{href:"https://issues.apache.org/jira/browse/HBASE-1900"},{href:"/docs/architecture/master"},{href:"https://issues.apache.org/jira/browse/HBASE-4246"},{href:"/docs/getting-started#quick-start---standalone-hbase"},{href:"https://cwiki.apache.org/confluence/display/HADOOP2/ZooKeeper+Troubleshooting"},{href:"/docs/troubleshooting#zkcli"},{href:"https://lists.apache.org/thread.html/666bfa863bc2eb2ec7bbe5ecfbee345e0cbf1d58aaa6c1636dfcb527%401269010842%40%3Cuser.hbase.apache.org%3E"},{href:"/docs/building-and-developing/building#building-against-various-hadoop-versions"},{href:"https://hadoop.apache.org/"},{href:"https://issues.apache.org/jira/browse/HDFS-6133"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/favored/FavoredNodeLoadBalancer.html"},{href:"https://issues.apache.org/jira/browse/HDFS-2556"},{href:"/docs/case-studies"},{href:"https://bugzilla.redhat.com/show_bug.cgi?id=770545"},{href:"https://docs.kernel.org/admin-guide/sysctl/vm.html#min-free-kbytes"},{href:"https://issues.apache.org/jira/browse/HBASE-10607"}],c={contents:[{heading:"general-guidelines",content:"Always start with the master log (TODO: Which lines?). Normally it's just printing the same lines over and over again. If not, then there's an issue. Google should return some hits for those exceptions you're seeing."},{heading:"general-guidelines",content:"An error rarely comes alone in Apache HBase, usually when something gets screwed up what will follow may be hundreds of exceptions and stack traces coming from all over the place. The best way to approach this type of problem is to walk the log up to where it all began, for example one trick with RegionServers is that they will print some metrics when aborting so grepping for Dump should get you around the start of the problem."},{heading:"general-guidelines",content:"RegionServer suicides are 'normal', as this is what they do when something goes wrong. For example, if ulimit and max transfer threads (the two most important initial settings, see [ulimit] and dfs.datanode.max.transfer.threads) aren't changed, it will make it impossible at some point for DataNodes to create new threads that from the HBase point of view is seen as if HDFS was gone. Think about what would happen if your MySQL database was suddenly unable to access files on your local file system, well it's the same with HBase and HDFS. Another very common reason to see RegionServers committing seppuku is when they enter prolonged garbage collection pauses that last longer than the default ZooKeeper session timeout. For more information on GC pauses, see the 3 part blog post by Todd Lipcon and Long GC pauses above."},{heading:"logs",content:"The key process logs are as follows... (replace <user> with the user that started the service, and <hostname> for the machine name)"},{heading:"logs",content:"NameNode: $HADOOP_HOME/logs/hadoop-<user>-namenode-<hostname>.log"},{heading:"logs",content:"DataNode: $HADOOP_HOME/logs/hadoop-<user>-datanode-<hostname>.log"},{heading:"logs",content:"JobTracker: $HADOOP_HOME/logs/hadoop-<user>-jobtracker-<hostname>.log"},{heading:"logs",content:"TaskTracker: $HADOOP_HOME/logs/hadoop-<user>-tasktracker-<hostname>.log"},{heading:"logs",content:"HMaster: $HBASE_HOME/logs/hbase-<user>-master-<hostname>.log"},{heading:"logs",content:"RegionServer: $HBASE_HOME/logs/hbase-<user>-regionserver-<hostname>.log"},{heading:"logs",content:"ZooKeeper: TODO"},{heading:"log-locations",content:"For stand-alone deployments the logs are obviously going to be on a single machine, however this is a development configuration only. Production deployments need to run on a cluster."},{heading:"troubleshooting-logs-namenode",content:"The NameNode log is on the NameNode server. The HBase Master is typically run on the NameNode server, and well as ZooKeeper."},{heading:"troubleshooting-logs-namenode",content:"For smaller clusters the JobTracker/ResourceManager is typically run on the NameNode server as well."},{heading:"troubleshooting-log-locations-datanode",content:"Each DataNode server will have a DataNode log for HDFS, as well as a RegionServer log for HBase."},{heading:"troubleshooting-log-locations-datanode",content:"Additionally, each DataNode server will also have a TaskTracker/NodeManager log for MapReduce task execution."},{heading:"enabling-rpc-level-logging",content:"Enabling the RPC-level logging on a RegionServer can often give insight on timings at the server. Once enabled, the amount of log spewed is voluminous. It is not recommended that you leave this logging on for more than short bursts of time. To enable RPC-level logging, browse to the RegionServer UI and click on Log Level. Set the log level to TRACE for the package org.apache.hadoop.hbase.ipc, then tail the RegionServers log. Analyze."},{heading:"enabling-rpc-level-logging",content:"To disable, set the logging level back to INFO level."},{heading:"enabling-rpc-level-logging",content:"The same log settings also work on Master and for the client."},{heading:"handling-multiple-slf4j-bindings-to-prevent-overridden-log-configurations",content:'If you have a local installation of Hadoop (e.g., installed via Homebrew on macOS), you may encounter a "multiple SLF4J bindings" warning when starting HBase in standalone mode using bin/start-hbase.sh. For example, you may see the following when starting HBase on your machine:'},{heading:"handling-multiple-slf4j-bindings-to-prevent-overridden-log-configurations",content:"This is happening because the bin/hbase script automatically detects local Hadoop installations and adds their classpath to HBase. If your Hadoop installation uses the legacy Reload4j (or Log4j 1.2) binder, SLF4J may prioritize it over the HBase Log4j2 binder. When this happens, your conf/log4j2.properties file and HBASE_ROOT_LOGGER environment variable are completely ignored."},{heading:"handling-multiple-slf4j-bindings-to-prevent-overridden-log-configurations",content:"To get around this issue, you can set HBASE_DISABLE_HADOOP_CLASSPATH_LOOKUP to true. You can modify this directly in conf/hbase-env.sh by uncommenting the following line:"},{heading:"handling-multiple-slf4j-bindings-to-prevent-overridden-log-configurations",content:"Note: Setting HBASE_DISABLE_HADOOP_CLASSPATH_LOOKUP does not fix the issue when HBase is in distributed mode. There may be a different warning instead."},{heading:"jvm-garbage-collection-logs",content:"type: info"},{heading:"jvm-garbage-collection-logs",content:`All example Garbage Collection logs in this section are based on Java 8 output. The introduction
of Unified Logging in Java 9 and newer will result in very different looking logs.`},{heading:"jvm-garbage-collection-logs",content:'HBase is memory intensive, and using the default GC you can see long pauses in all threads including the Juliet Pause aka "GC of Death". To help debug this or confirm this is happening GC logging can be turned on in the Java virtual machine.'},{heading:"jvm-garbage-collection-logs",content:"To enable, in hbase-env.sh, uncomment one of the below lines :"},{heading:"jvm-garbage-collection-logs",content:"At this point you should see logs like so:"},{heading:"jvm-garbage-collection-logs",content:"In this section, the first line indicates a 0.0007360 second pause for the CMS to initially mark. This pauses the entire VM, all threads for that period of time."},{heading:"jvm-garbage-collection-logs",content:'The third line indicates a "minor GC", which pauses the VM for 0.0101110 seconds - aka 10 milliseconds. It has reduced the "ParNew" from about 5.5m to 576k. Later on in this cycle we see:'},{heading:"jvm-garbage-collection-logs",content:"The first line indicates that the CMS concurrent mark (finding garbage) has taken 2.4 seconds. But this is a concurrent 2.4 seconds, Java has not been paused at any point in time."},{heading:"jvm-garbage-collection-logs",content:"There are a few more minor GCs, then there is a pause at the 2nd last line:"},{heading:"jvm-garbage-collection-logs",content:"The pause here is 0.0049380 seconds (aka 4.9 milliseconds) to 'remark' the heap."},{heading:"jvm-garbage-collection-logs",content:"At this point the sweep starts, and you can watch the heap size go down:"},{heading:"jvm-garbage-collection-logs",content:"At this point, the CMS sweep took 3.332 seconds, and heap went from about ~ 2.8 GB to 1.3 GB (approximate)."},{heading:"jvm-garbage-collection-logs",content:"The key points here is to keep all these pauses low. CMS pauses are always low, but if your ParNew starts growing, you can see minor GC pauses approach 100ms, exceed 100ms and hit as high at 400ms."},{heading:"jvm-garbage-collection-logs",content:"This can be due to the size of the ParNew, which should be relatively small. If your ParNew is very large after running HBase for a while, in one example a ParNew was about 150MB, then you might have to constrain the size of ParNew (The larger it is, the longer the collections take but if it's too small, objects are promoted to old gen too quickly). In the below we constrain new gen size to 64m."},{heading:"jvm-garbage-collection-logs",content:"Add the below line in hbase-env.sh:"},{heading:"jvm-garbage-collection-logs",content:"Similarly, to enable GC logging for client processes, uncomment one of the below lines in hbase-env.sh:"},{heading:"jvm-garbage-collection-logs",content:"For more information on GC pauses, see the 3 part blog post by Todd Lipcon and Long GC pauses above."},{heading:"troubleshooting-resources-mailing-lists",content:"Ask a question on the Apache HBase mailing lists. The 'dev' mailing list is aimed at the community of developers actually building Apache HBase and for features currently under development, and 'user' is generally used for questions on released versions of Apache HBase. Before going to the mailing list, make sure your question has not already been answered by searching the mailing list archives first. For those who prefer to communicate in Chinese, they can use the 'user-zh' mailing list instead of the 'user' list. Take some time crafting your question. See Getting Answers for ideas on crafting good questions. A quality question that includes all context and exhibits evidence the author has tried to find answers in the manual and out on lists is more likely to get a prompt response."},{heading:"troubleshooting-resources-slack",content:"#hbase on https://the-asf.slack.com/"},{heading:"irc",content:"(You will probably get a more prompt response on the Slack channel)"},{heading:"irc",content:"#hbase on irc.freenode.net"},{heading:"troubleshooting-resources-jira",content:"JIRA is also really helpful when looking for Hadoop/HBase-specific issues."},{heading:"master-web-interface",content:"The Master starts a web-interface on port 16010 by default."},{heading:"master-web-interface",content:"The Master web UI lists created tables and their definition (e.g., ColumnFamilies, blocksize, etc.). Additionally, the available RegionServers in the cluster are listed along with selected high-level metrics (requests, number of regions, usedHeap, maxHeap). The Master web UI allows navigation to each RegionServer's web UI."},{heading:"regionserver-web-interface",content:"RegionServers starts a web-interface on port 16030 by default."},{heading:"regionserver-web-interface",content:"The RegionServer web UI lists online regions and their start/end keys, as well as point-in-time RegionServer metrics (requests, regions, storeFileIndexSize, compactionQueueSize, etc.)."},{heading:"regionserver-web-interface",content:"See HBase Metrics for more information in metric definitions."},{heading:"zkcli",content:"zkcli is a very useful tool for investigating ZooKeeper-related issues. To invoke:"},{heading:"zkcli",content:"The commands (and arguments) are:"},{heading:"maintenance-mode",content:`If the cluster has gotten stuck in some state and the standard techniques aren't making progress, it is possible to restart the cluster in "maintenance mode." This mode features drastically reduced capabilities and surface area, making it easier to enact very low-level changes such as repairing/recovering the hbase:meta table.`},{heading:"maintenance-mode",content:"To enter maintenance mode, set hbase.master.maintenance_mode to true either in your hbase-site.xml or via system propery when starting the master process (-D...=true). Entering and exiting this mode requires a service restart, however the typical use will be when HBase Master is already facing startup difficulties."},{heading:"maintenance-mode",content:"When maintenance mode is enabled, the master will host all system tables - ensure that it has enough memory to do so. RegionServers will not be assigned any regions from user-space tables; in fact, they will go completely unused while in maintenance mode. Additionally, the master will not load any coprocessors, will not run any normalization or merge/split operations, and will not enforce quotas."},{heading:"tail",content:"tail is the command line tool that lets you look at the end of a file. Add the -f option and it will refresh when new data is available. It's useful when you are wondering what's happening, for example, when a cluster is taking a long time to shutdown or startup as you can just fire a new terminal and tail the master log (and maybe a few RegionServers)."},{heading:"top",content:"top is probably one of the most important tools when first trying to see what's running on a machine and how the resources are consumed. Here's an example from production system:"},{heading:"top",content:"Here we can see that the system load average during the last five minutes is 3.75, which very roughly means that on average 3.75 threads were waiting for CPU time during these 5 minutes. In general, the perfect utilization equals to the number of cores, under that number the machine is under utilized and over that the machine is over utilized. This is an important concept, see this article to understand it more: http://www.linuxjournal.com/article/9001."},{heading:"top",content:"Apart from load, we can see that the system is using almost all its available RAM but most of it is used for the OS cache (which is good). The swap only has a few KBs in it and this is wanted, high numbers would indicate swapping activity which is the nemesis of performance of Java systems. Another way to detect swapping is when the load average goes through the roof (although this could also be caused by things like a dying disk, among others)."},{heading:"top",content:"The list of processes isn't super useful by default, all we know is that 3 java processes are using about 111% of the CPUs. To know which is which, simply type c and each line will be expanded. Typing 1 will give you the detail of how each CPU is used instead of the average for all of them like shown here."},{heading:"jps",content:"jps is shipped with every JDK and gives the java process ids for the current user (if root, then it gives the ids for all users). Example:"},{heading:"jps",content:"In order, we see a:"},{heading:"jps",content:"Hadoop TaskTracker, manages the local Childs"},{heading:"jps",content:"HBase RegionServer, serves regions"},{heading:"jps",content:"Child, its MapReduce task, cannot tell which type exactly"},{heading:"jps",content:"Hadoop TaskTracker, manages the local Childs"},{heading:"jps",content:"Hadoop DataNode, serves blocks"},{heading:"jps",content:"HQuorumPeer, a ZooKeeper ensemble member"},{heading:"jps",content:"Jps, well... it's the current process"},{heading:"jps",content:"ThriftServer, it's a special one will be running only if thrift was started"},{heading:"jps",content:"jmx, this is a local process that's part of our monitoring platform ( poorly named maybe). You probably don't have that."},{heading:"jps",content:"You can then do stuff like checking out the full command line that started the process:"},{heading:"jstack",content:"jstack is one of the most important tools when trying to figure out what a java process is doing apart from looking at the logs. It has to be used in conjunction with jps in order to give it a process id. It shows a list of threads, each one has a name, and they appear in the order that they were created (so the top ones are the most recent threads). Here are a few example:"},{heading:"jstack",content:"The main thread of a RegionServer waiting for something to do from the master:"},{heading:"jstack",content:"The MemStore flusher thread that is currently flushing to a file:"},{heading:"jstack",content:"A handler thread that's waiting for stuff to do (like put, delete, scan, etc.):"},{heading:"jstack",content:"And one that's busy doing an increment of a counter (it's in the phase where it's trying to create a scanner in order to read the last value):"},{heading:"jstack",content:"A thread that receives data from HDFS:"},{heading:"jstack",content:"And here is a master trying to recover a lease after a RegionServer died:"},{heading:"opentsdb",content:"OpenTSDB is an excellent alternative to Ganglia as it uses Apache HBase to store all the time series and doesn't have to downsample. Monitoring your own HBase cluster that hosts OpenTSDB is a good exercise."},{heading:"opentsdb",content:"Here's an example of a cluster that's suffering from hundreds of compactions launched almost all around the same time, which severely affects the IO performance: (TODO: insert graph plotting compactionQueueSize)"},{heading:"opentsdb",content:"It's a good practice to build dashboards with all the important graphs per machine and per cluster so that debugging issues can be done with a single quick look. For example, at StumbleUpon there's one dashboard per cluster with the most important metrics from both the OS and Apache HBase. You can then go down at the machine level and get even more detailed metrics."},{heading:"clustersshtop",content:"clusterssh+top, it's like a poor man's monitoring system and it can be quite useful when you have only a few machines as it's very easy to setup. Starting clusterssh will give you one terminal per machine and another terminal in which whatever you type will be retyped in every window. This means that you can type top once and it will start it for all of your machines at the same time giving you full view of the current state of your cluster. You can also tail all the logs at the same time, edit files, etc."},{heading:"troubleshooting-client",content:"For more information on the HBase client, see client."},{heading:"scannertimeoutexception-or-unknownscannerexception-toc",content:"This is thrown if the time between RPC calls from the client to RegionServer exceeds the scan timeout. For example, if Scan.setCaching is set to 500, then there will be an RPC call to fetch the next batch of rows every 500 .next() calls on the ResultScanner because data is being transferred in blocks of 500 rows to the client. Reducing the setCaching value may be an option, but setting this value too low makes for inefficient processing on numbers of rows."},{heading:"scannertimeoutexception-or-unknownscannerexception-toc",content:"See Scan Caching."},{heading:"performance-differences-in-thrift-and-java-apis-toc",content:"Poor performance, or even ScannerTimeoutExceptions, can occur if Scan.setCaching is too high, as discussed in ScannerTimeoutException or UnknownScannerException. If the Thrift client uses the wrong caching settings for a given workload, performance can suffer compared to the Java API. To set caching for a given scan in the Thrift client, use the scannerGetList(scannerId, numRows) method, where numRows is an integer representing the number of rows to cache. In one case, it was found that reducing the cache for Thrift scans from 1000 to 100 increased performance to near parity with the Java API given the same queries."},{heading:"performance-differences-in-thrift-and-java-apis-toc",content:"See also Jesse Andersen's blog post about using Scans with Thrift."},{heading:"leaseexception-when-calling-scannernext-toc",content:"In some situations clients that fetch data from a RegionServer get a LeaseException instead of the usual ScannerTimeoutException or UnknownScannerException. Usually the source of the exception is org.apache.hadoop.hbase.regionserver.Leases.removeLease(Leases.java:230) (line number may vary). It tends to happen in the context of a slow/freezing RegionServer#next call. It can be prevented by having hbase.rpc.timeout > hbase.client.scanner.timeout.period. Harsh J investigated the issue as part of the mailing list thread HBase, mail # user - Lease does not exist exceptions"},{heading:"shell-or-client-application-throws-lots-of-scary-exceptions-during-normal-operation-toc",content:"Since 0.20.0 the default log level for org.apache.hadoop.hbase.* is DEBUG."},{heading:"shell-or-client-application-throws-lots-of-scary-exceptions-during-normal-operation-toc",content:"On your clients, edit $HBASE_HOME/conf/log4j.properties and change this: log4j.logger.org.apache.hadoop.hbase=DEBUG to this: log4j.logger.org.apache.hadoop.hbase=INFO, or even log4j.logger.org.apache.hadoop.hbase=WARN."},{heading:"long-client-pauses-with-compression-toc",content:"This is a fairly frequent question on the Apache HBase dist-list. The scenario is that a client is typically inserting a lot of data into a relatively un-optimized HBase cluster. Compression can exacerbate the pauses, although it is not the source of the problem."},{heading:"long-client-pauses-with-compression-toc",content:"See Table Creation: Pre-Creating Regions on the pattern for pre-creating regions and confirm that the table isn't starting with a single region."},{heading:"long-client-pauses-with-compression-toc",content:"See HBase Configurations for cluster configuration, particularly hbase.hstore.blockingStoreFiles, hbase.hregion.memstore.block.multiplier, MAX_FILESIZE (region size), and MEMSTORE_FLUSHSIZE."},{heading:"long-client-pauses-with-compression-toc",content:"A slightly longer explanation of why pauses can happen is as follows: Puts are sometimes blocked on the MemStores which are blocked by the flusher thread which is blocked because there are too many files to compact because the compactor is given too many small files to compact and has to compact the same data repeatedly. This situation can occur even with minor compactions. Compounding this situation, Apache HBase doesn't compress data in memory. Thus, the 64MB that lives in the MemStore could become a 6MB file after compression - which results in a smaller StoreFile. The upside is that more data is packed into the same region, but performance is achieved by being able to write larger files - which is why HBase waits until the flushsize before writing a new StoreFile. And smaller StoreFiles become targets for compaction. Without compression the files are much bigger and don't need as much compaction, however this is at the expense of I/O."},{heading:"secure-client-connect-caused-by-gssexception-no-valid-credentials-provided-toc",content:"You may encounter the following error:"},{heading:"secure-client-connect-caused-by-gssexception-no-valid-credentials-provided-toc",content:"This issue is caused by bugs in the MIT Kerberos replay_cache component, #1201 and #5924. These bugs caused the old version of krb5-server to erroneously block subsequent requests sent from a Principal. This caused krb5-server to block the connections sent from one Client (one HTable instance with multi-threading connection instances for each RegionServer); Messages, such as Request is a replay (34), are logged in the client log You can ignore the messages, because HTable will retry 5 * 10 (50) times for each failed connection by default. HTable will throw IOException if any connection to the RegionServer fails after the retries, so that the user client code for HTable instance can handle it further. NOTE: HTable is deprecated in HBase 1.0, in favor of Table."},{heading:"secure-client-connect-caused-by-gssexception-no-valid-credentials-provided-toc",content:"Alternatively, update krb5-server to a version which solves these issues, such as krb5-server-1.10.3. See JIRA HBASE-10379 for more details."},{heading:"zookeeper-client-connection-errors-toc",content:"Errors like this..."},{heading:"zookeeper-client-connection-errors-toc",content:"...are either due to ZooKeeper being down, or unreachable due to network issues."},{heading:"zookeeper-client-connection-errors-toc",content:"The utility zkcli may help investigate ZooKeeper issues."},{heading:"client-running-out-of-memory-though-heap-size-seems-to-be-stable-but-the-off-heapdirect-heap-keeps-growing-toc",content:"You are likely running into the issue that is described and worked through in the mail thread HBase, mail # user - Suspected memory leak and continued over in HBase, mail # dev - FeedbackRe: Suspected memory leak. A workaround is passing your client-side JVM a reasonable value for -XX:MaxDirectMemorySize. By default, the MaxDirectMemorySize is equal to your -Xmx max heapsize setting (if -Xmx is set). Try setting it to something smaller (for example, one user had success setting it to 1g when they had a client-side heap of 12g). If you set it too small, it will bring on FullGCs so keep it a bit hefty. You want to make this setting client-side only especially if you are running the new experimental server-side off-heap cache since this feature depends on being able to use big direct buffers (You may have to keep separate client-side and server-side config dirs)."},{heading:"secure-client-cannot-connect-caused-by-gssexception-no-valid-credentials-providedmechanism-level-failed-to-find-any-kerberos-tgt-toc",content:"There can be several causes that produce this symptom."},{heading:"secure-client-cannot-connect-caused-by-gssexception-no-valid-credentials-providedmechanism-level-failed-to-find-any-kerberos-tgt-toc",content:"First, check that you have a valid Kerberos ticket. One is required in order to set up communication with a secure Apache HBase cluster. Examine the ticket currently in the credential cache, if any, by running the klist command line utility. If no ticket is listed, you must obtain a ticket by running the kinit command with either a keytab specified, or by interactively entering a password for the desired principal."},{heading:"secure-client-cannot-connect-caused-by-gssexception-no-valid-credentials-providedmechanism-level-failed-to-find-any-kerberos-tgt-toc",content:"Then, consult the Java Security Guide troubleshooting section. The most common problem addressed there is resolved by setting javax.security.auth.useSubjectCredsOnly system property value to false."},{heading:"secure-client-cannot-connect-caused-by-gssexception-no-valid-credentials-providedmechanism-level-failed-to-find-any-kerberos-tgt-toc",content:"Because of a change in the format in which MIT Kerberos writes its credentials cache, there is a bug in the Oracle JDK 6 Update 26 and earlier that causes Java to be unable to read the Kerberos credentials cache created by versions of MIT Kerberos 1.8.1 or higher. If you have this problematic combination of components in your environment, to work around this problem, first log in with kinit and then immediately refresh the credential cache with kinit -R. The refresh will rewrite the credential cache without the problematic formatting."},{heading:"secure-client-cannot-connect-caused-by-gssexception-no-valid-credentials-providedmechanism-level-failed-to-find-any-kerberos-tgt-toc",content:"Prior to JDK 1.4, the JCE was an unbundled product, and as such, the JCA and JCE were regularly referred to as separate, distinct components. As JCE is now bundled in the JDK 7.0, the distinction is becoming less apparent. Since the JCE uses the same architecture as the JCA, the JCE should be more properly thought of as a part of the JCA."},{heading:"secure-client-cannot-connect-caused-by-gssexception-no-valid-credentials-providedmechanism-level-failed-to-find-any-kerberos-tgt-toc",content:"You may need to install the Java Cryptography Extension, or JCE because of JDK 1.5 or earlier version. Insure the JCE jars are on the classpath on both server and client systems."},{heading:"secure-client-cannot-connect-caused-by-gssexception-no-valid-credentials-providedmechanism-level-failed-to-find-any-kerberos-tgt-toc",content:"You may also need to download the unlimited strength JCE policy files. Uncompress and extract the downloaded file, and install the policy jars into <java-home>/lib/security."},{heading:"trouble-shooting-master-registry-issues-toc",content:'For connectivity issues, usually an exception like "MasterRegistryFetchException: Exception making rpc to masters..." is logged in the client logs. The logging includes the list of master end points that were attempted by the client. The bottom part of the stack trace should include the underlying reason. If you suspect connectivity issues (ConnectionRefused?), make sure the master end points are accessible from client.'},{heading:"trouble-shooting-master-registry-issues-toc",content:"If there is a suspicion of higher load on the masters due to hedging of RPCs, it can be controlled by either reducing the hedging fan out (via hbase.rpc.hedged.fanout) or by restricting the set of masters that clients can access for the master registry purposes (via hbase.masters)."},{heading:"trouble-shooting-master-registry-issues-toc",content:"Refer to Master Registry (new as of 2.3.0) and Client configuration and dependencies connecting to an HBase cluster for more details."},{heading:"you-think-youre-on-the-cluster-but-youre-actually-local-toc",content:"This following stacktrace happened using ImportTsv, but things like this can happen on any job with a mis-configuration."},{heading:"you-think-youre-on-the-cluster-but-youre-actually-local-toc",content:"...see the critical portion of the stack? It's..."},{heading:"you-think-youre-on-the-cluster-but-youre-actually-local-toc",content:"LocalJobRunner means the job is running locally, not on the cluster."},{heading:"you-think-youre-on-the-cluster-but-youre-actually-local-toc",content:'To solve this problem, you should run your MR job with your HADOOP_CLASSPATH set to include the HBase dependencies. The "hbase classpath" utility can be used to do this easily. For example (substitute VERSION with your HBase version):'},{heading:"you-think-youre-on-the-cluster-but-youre-actually-local-toc",content:"See HBase, MapReduce, and the CLASSPATH for more information on HBase MapReduce jobs and classpaths."},{heading:"launching-a-job-you-get-javalangillegalaccesserror-comgoogleprotobufhbasezerocopybytestring-or-class-comgoogleprotobufzerocopyliteralbytestring-cannot-access-its-superclass-comgoogleprotobufliteralbytestring-toc",content:'See HBASE-10304 Running an hbase job jar: IllegalAccessError: class com.google.protobuf.ZeroCopyLiteralByteString cannot access its superclass com.google.protobuf.LiteralByteString and HBASE-11118 non environment variable solution for "IllegalAccessError: class com.google.protobuf.ZeroCopyLiteralByteString cannot access its superclass com.google.protobuf.LiteralByteString". The issue can also show up when trying to run spark jobs. See HBASE-10877 HBase non-retriable exception list should be expanded.'},{heading:"troubleshooting-namenode",content:"For more information on the NameNode, see HDFS."},{heading:"hdfs-utilization-of-tables-and-regions",content:"To determine how much space HBase is using on HDFS use the hadoop shell commands from the NameNode. For example..."},{heading:"hdfs-utilization-of-tables-and-regions",content:"...returns the summarized disk utilization for all HBase objects."},{heading:"hdfs-utilization-of-tables-and-regions",content:"...returns the summarized disk utilization for the HBase table 'myTable'."},{heading:"hdfs-utilization-of-tables-and-regions",content:"...returns a list of the regions under the HBase table 'myTable' and their disk utilization."},{heading:"hdfs-utilization-of-tables-and-regions",content:"For more information on HDFS shell commands, see the HDFS FileSystem Shell documentation."},{heading:"browsing-hdfs-for-hbase-objects",content:"Sometimes it will be necessary to explore the HBase objects that exist on HDFS. These objects could include the WALs (Write Ahead Logs), tables, regions, StoreFiles, etc. The easiest way to do this is with the NameNode web application that runs on port 50070. The NameNode web application will provide links to the all the DataNodes in the cluster so that they can be browsed seamlessly."},{heading:"browsing-hdfs-for-hbase-objects",content:"The HDFS directory structure of HBase tables in the cluster is..."},{heading:"browsing-hdfs-for-hbase-objects",content:"The HDFS directory structure of HBase WAL is.."},{heading:"browsing-hdfs-for-hbase-objects",content:"See the HDFS User Guide for other non-shell diagnostic utilities like fsck."},{heading:"zero-size-wals-with-data-in-them-toc",content:"Problem: when getting a listing of all the files in a RegionServer's WALs directory, one file has a size of 0 but it contains data."},{heading:"zero-size-wals-with-data-in-them-toc",content:"Answer: It's an HDFS quirk. A file that's currently being written to will appear to have a size of 0 but once it's closed it will show its true size"},{heading:"use-cases-toc",content:'Two common use-cases for querying HDFS for HBase objects is research the degree of uncompaction of a table. If there are a large number of StoreFiles for each ColumnFamily it could indicate the need for a major compaction. Additionally, after a major compaction if the resulting StoreFile is "small" it could indicate the need for a reduction of ColumnFamilies for the table.'},{heading:"unexpected-filesystem-growth",content:"If you see an unexpected spike in filesystem usage by HBase, two possible culprits are snapshots and WALs."},{heading:"unexpected-filesystem-growth",content:"SnapshotsWhen you create a snapshot, HBase retains everything it needs to recreate the table's state at that time of the snapshot. This includes deleted cells or expired versions. For this reason, your snapshot usage pattern should be well-planned, and you should prune snapshots that you no longer need. Snapshots are stored in /hbase/.hbase-snapshot, and archives needed to restore snapshots are stored in /hbase/archive/<tablename>/<region>/<column_family>/."},{heading:"unexpected-filesystem-growth",content:"type: warn"},{heading:"unexpected-filesystem-growth",content:`Do not manage snapshots or archives manually via HDFS. HBase provides APIs and HBase Shell
commands for managing them. For more information, see
ops.snapshots.`},{heading:"unexpected-filesystem-growth",content:"WALWrite-ahead logs (WALs) are stored in subdirectories of the HBase root directory, typically /hbase/, depending on their status. Already-processed WALs are stored in /hbase/oldWALs/ and corrupt WALs are stored in /hbase/.corrupt/ for examination. If the size of one of these subdirectories is growing, examine the HBase server logs to find the root cause for why WALs are not being processed correctly.If you use replication and /hbase/oldWALs/ is using more space than you expect, remember that WALs are saved when replication is disabled, as long as there are peers."},{heading:"unexpected-filesystem-growth",content:"Do not manage WALs manually via HDFS."},{heading:"network-spikes",content:"If you are seeing periodic network spikes you might want to check the compactionQueues to see if major compactions are happening."},{heading:"network-spikes",content:"See Managed Compactions for more information on managing compactions."},{heading:"loopback-ip",content:"HBase expects the loopback IP Address to be 127.0.0.1."},{heading:"troubleshooting-network-interfaces",content:"Are all the network interfaces functioning correctly? Are you sure? See the Troubleshooting Case Study in Case Studies."},{heading:"troubleshooting-regionserver",content:"For more information on the RegionServers, see RegionServer."},{heading:"master-starts-but-regionservers-do-not-toc",content:"The Master believes the RegionServers have the IP of 127.0.0.1 - which is localhost and resolves to the master's own localhost."},{heading:"master-starts-but-regionservers-do-not-toc",content:"The RegionServers are erroneously informing the Master that their IP addresses are 127.0.0.1."},{heading:"master-starts-but-regionservers-do-not-toc",content:"Modify /etc/hosts on the region servers, from..."},{heading:"master-starts-but-regionservers-do-not-toc",content:"... to (removing the master node's name from localhost)..."},{heading:"compression-link-errors-toc",content:"Since compression algorithms such as LZO need to be installed and configured on each cluster this is a frequent source of startup error. If you see messages like this..."},{heading:"compression-link-errors-toc",content:"... then there is a path issue with the compression libraries. See the Configuration section on LZO compression configuration."},{heading:"regionserver-aborts-due-to-lack-of-hsync-for-filesystem-toc",content:"In order to provide data durability for writes to the cluster HBase relies on the ability to durably save state in a write ahead log. When using a version of Apache Hadoop Common's filesystem API that supports checking on the availability of needed calls, HBase will proactively abort the cluster if it finds it can't operate safely."},{heading:"regionserver-aborts-due-to-lack-of-hsync-for-filesystem-toc",content:"For RegionServer roles, the failure will show up in logs like this:"},{heading:"regionserver-aborts-due-to-lack-of-hsync-for-filesystem-toc",content:"If you are attempting to run in standalone mode and see this error, please walk back through the section Quick Start - Standalone HBase and ensure you have included all the given configuration settings."},{heading:"regionserver-aborts-due-to-can-not-initialize-access-to-hdfs-toc",content:"We will try to use AsyncFSWAL for HBase-2.x as it has better performance while consuming less resources. But the problem for AsyncFSWAL is that it hacks into the internal of the DFSClient implementation, so it will easily be broken when upgrading hadoop, even for a simple patch release."},{heading:"regionserver-aborts-due-to-can-not-initialize-access-to-hdfs-toc",content:"If you do not specify the wal provider, we will try to fall back to the old FSHLog if we fail to initialize AsyncFSWAL, but it may not always work. The failure will show up in logs like this:"},{heading:"regionserver-aborts-due-to-can-not-initialize-access-to-hdfs-toc",content:"If you hit this error, please specify FSHLog, i.e, filesystem, explicitly in your config file."},{heading:"regionserver-aborts-due-to-can-not-initialize-access-to-hdfs-toc",content:"And do not forget to send an email to the user@hbase.apache.org or dev@hbase.apache.org to report the failure and also your hadoop version, we will try to fix the problem ASAP in the next release."},{heading:"regionserver-hanging-toc",content:"Are you running an old JVM (< 1.6.0u21?)? When you look at a thread dump, does it look like threads are BLOCKED but no one holds the lock all are blocked on? See HBASE 3622 Deadlock in HBaseServer (JVM bug?). Adding -XX:+UseMembar to the HBase HBASE_OPTS in _conf/hbase-env.sh may fix it."},{heading:"javaioioexceptiontoo-many-open-files-toc",content:"If you see log messages like this..."},{heading:"javaioioexceptiontoo-many-open-files-toc",content:"... see the Getting Started section on ulimit and nproc configuration."},{heading:"xceivercount-258-exceeds-the-limit-of-concurrent-xcievers-256-toc",content:"This typically shows up in the DataNode logs."},{heading:"xceivercount-258-exceeds-the-limit-of-concurrent-xcievers-256-toc",content:`TODO: add link.
See the Getting Started section on xceivers configuration.`},{heading:"system-instability-and-the-presence-of-javalangoutofmemoryerror-unable-to-createnew-native-thread-in-exceptions-hdfs-datanode-logs-or-that-of-any-system-daemon-toc",content:"See the Getting Started section on ulimit and nproc configuration. The default on recent Linux distributions is 1024 - which is far too low for HBase."},{heading:"dfs-instability-andor-regionserver-lease-timeouts-toc",content:"If you see warning messages like this..."},{heading:"dfs-instability-andor-regionserver-lease-timeouts-toc",content:"... or see full GC compactions then you may be experiencing full GC's."},{heading:"no-live-nodes-contain-current-block-andor-youaredeadexception-toc",content:"These errors can happen either when running out of OS file handles or in periods of severe network problems where the nodes are unreachable."},{heading:"no-live-nodes-contain-current-block-andor-youaredeadexception-toc",content:"See the Getting Started section on ulimit and nproc configuration and check your network."},{heading:"zookeeper-sessionexpired-events-toc",content:"Master or RegionServers shutting down with messages like those in the logs:"},{heading:"zookeeper-sessionexpired-events-toc",content:`The JVM is doing a long running garbage collecting which is pausing every threads (aka "stop the world"). Since the RegionServer's local ZooKeeper client cannot send heartbeats, the session times out. By design, we shut down any node that isn't able to contact the ZooKeeper ensemble after getting a timeout so that it stops serving data that may already be assigned elsewhere.`},{heading:"zookeeper-sessionexpired-events-toc",content:"Make sure you give plenty of RAM (in hbase-env.sh), the default of 1GB won't be able to sustain long running imports."},{heading:"zookeeper-sessionexpired-events-toc",content:"Make sure you don't swap, the JVM never behaves well under swapping."},{heading:"zookeeper-sessionexpired-events-toc",content:"Make sure you are not CPU starving the RegionServer thread. For example, if you are running a MapReduce job using 6 CPU-intensive tasks on a machine with 4 cores, you are probably starving the RegionServer enough to create longer garbage collection pauses."},{heading:"zookeeper-sessionexpired-events-toc",content:"Increase the ZooKeeper session timeout"},{heading:"zookeeper-sessionexpired-events-toc",content:"If you wish to increase the session timeout, add the following to your hbase-site.xml to increase the timeout from the default of 60 seconds to 120 seconds."},{heading:"zookeeper-sessionexpired-events-toc",content:"Be aware that setting a higher timeout means that the regions served by a failed RegionServer will take at least that amount of time to be transferred to another RegionServer. For a production system serving live requests, we would instead recommend setting it lower than 1 minute and over-provision your cluster in order the lower the memory load on each machines (hence having less garbage to collect per machine)."},{heading:"zookeeper-sessionexpired-events-toc",content:"If this is happening during an upload which only happens once (like initially loading all your data into HBase), consider bulk loading."},{heading:"zookeeper-sessionexpired-events-toc",content:"See ZooKeeper, The Cluster Canary for other general information about ZooKeeper troubleshooting."},{heading:"notservingregionexception-toc",content:'This exception is "normal" when found in the RegionServer logs at DEBUG level. This exception is returned back to the client and then the client goes back to hbase:meta to find the new location of the moved region.'},{heading:"notservingregionexception-toc",content:"However, if the NotServingRegionException is logged ERROR, then the client ran out of retries and something probably wrong."},{heading:"logs-flooded-with-2011-01-10-124048407-info-orgapachehadoopiocompresscodecpool-gotbrand-new-compressor-messages-toc",content:"We are not using the native versions of compression libraries. See HBASE-1900 Put back native support when hadoop 0.21 is released. Copy the native libs from hadoop under HBase lib dir or symlink them into place and the message should go away."},{heading:"server-handler-x-on-60020-caught-javaniochannelsclosedchannelexception-toc",content:"If you see this type of message it means that the region server was trying to read/send data from/to a client but it already went away. Typical causes for this are if the client was killed (you see a storm of messages like this when a MapReduce job is killed or fails) or if the client receives a SocketTimeoutException. It's harmless, but you should consider digging in a bit more if you aren't doing something to trigger them."},{heading:"snapshot-errors-due-to-reverse-dns",content:"Several operations within HBase, including snapshots, rely on properly configured reverse DNS. Some environments, such as Amazon EC2, have trouble with reverse DNS. If you see errors like the following on your RegionServers, check your reverse DNS configuration:"},{heading:"snapshot-errors-due-to-reverse-dns",content:"In general, the hostname reported by the RegionServer needs to be the same as the hostname the Master is trying to reach. You can see a hostname mismatch by looking for the following type of message in the RegionServer's logs at start-up."},{heading:"troubleshooting-master",content:"For more information on the Master, see master."},{heading:"master-says-that-you-need-to-run-the-hbase-migrations-script-toc",content:"Upon running that, the HBase migrations script says no files in root directory."},{heading:"master-says-that-you-need-to-run-the-hbase-migrations-script-toc",content:"HBase expects the root directory to either not exist, or to have already been initialized by HBase running a previous time. If you create a new directory for HBase using Hadoop DFS, this error will occur. Make sure the HBase root directory does not currently exist or has been initialized by a previous run of HBase. Sure fire solution is to just use Hadoop dfs to delete the HBase root and let HBase create and initialize the directory itself."},{heading:"packet-len6080218-is-out-of-range-toc",content:"If you have many regions on your cluster and you see an error like that reported above in this sections title in your logs, see HBASE-4246 Cluster with too many regions cannot withstand some master failover scenarios."},{heading:"master-fails-to-become-active-due-to-lack-of-hsync-for-filesystem-toc",content:"HBase's internal framework for cluster operations requires the ability to durably save state in a write ahead log. When using a version of Apache Hadoop Common's filesystem API that supports checking on the availability of needed calls, HBase will proactively abort the cluster if it finds it can't operate safely."},{heading:"master-fails-to-become-active-due-to-lack-of-hsync-for-filesystem-toc",content:"For Master roles, the failure will show up in logs like this:"},{heading:"master-fails-to-become-active-due-to-lack-of-hsync-for-filesystem-toc",content:"If you are attempting to run in standalone mode and see this error, please walk back through the section Quick Start - Standalone HBase and ensure you have included all the given configuration settings."},{heading:"could-not-find-my-address-xyz-in-list-of-zookeeper-quorum-servers-toc",content:"A ZooKeeper server wasn't able to start, throws that error. xyz is the name of your server."},{heading:"could-not-find-my-address-xyz-in-list-of-zookeeper-quorum-servers-toc",content:"This is a name lookup problem. HBase tries to start a ZooKeeper server on some machine but that machine isn't able to find itself in the hbase.zookeeper.quorum configuration."},{heading:"could-not-find-my-address-xyz-in-list-of-zookeeper-quorum-servers-toc",content:"Use the hostname presented in the error message instead of the value you used. If you have a DNS server, you can set hbase.zookeeper.dns.interface and hbase.zookeeper.dns.nameserver in hbase-site.xml to make sure it resolves to the correct FQDN."},{heading:"zookeeper-the-cluster-canary",content:`ZooKeeper is the cluster's "canary in the mineshaft". It'll be the first to notice issues if any so making sure its happy is the short-cut to a humming cluster.`},{heading:"zookeeper-the-cluster-canary",content:"See the ZooKeeper Operating Environment Troubleshooting page. It has suggestions and tools for checking disk and networking performance; i.e. the operating environment your ZooKeeper and HBase are running in."},{heading:"zookeeper-the-cluster-canary",content:"Additionally, the utility zkcli may help investigate ZooKeeper issues."},{heading:"zookeeper-does-not-seem-to-work-on-amazon-ec2",content:"HBase does not start when deployed as Amazon EC2 instances. Exceptions like the below appear in the Master and/or RegionServer logs:"},{heading:"zookeeper-does-not-seem-to-work-on-amazon-ec2",content:"Security group policy is blocking the ZooKeeper port on a public address. Use the internal EC2 host names when configuring the ZooKeeper quorum peer list."},{heading:"instability-on-amazon-ec2",content:"Questions on HBase and Amazon EC2 come up frequently on the HBase dist-list."},{heading:"remote-java-connection-into-ec2-cluster-not-working",content:"See Andrew's answer here, up on the user list: Remote Java client connection into EC2 instance."},{heading:"cannot-communicate-with-client-version",content:"If you see something like the following in your logs ... 2012-09-24 10:20:52,168 FATAL org.apache.hadoop.hbase.master.HMaster: Unhandled exception. Starting shutdown. org.apache.hadoop.ipc.RemoteException: Server IPC version 7 cannot communicate with client version 4 ... ...are you trying to talk to an Hadoop 2.0.x from an HBase that has an Hadoop 1.0.x client? Use the HBase built against Hadoop 2.0 or rebuild your HBase passing the -Dhadoop.profile=2.0 attribute to Maven (See Building against various Hadoop versions for more)."},{heading:"hbase-and-hdfs",content:"General configuration guidance for Apache HDFS is out of the scope of this guide. Refer to the documentation available at https://hadoop.apache.org/ for extensive information about configuring HDFS. This section deals with HDFS in terms of HBase."},{heading:"hbase-and-hdfs",content:"In most cases, HBase stores its data in Apache HDFS. This includes the HFiles containing the data, as well as the write-ahead logs (WALs) which store data before it is written to the HFiles and protect against RegionServer crashes. HDFS provides reliability and protection to data in HBase because it is distributed. To operate with the most efficiency, HBase needs data to be available locally. Therefore, it is a good practice to run an HDFS DataNode on each RegionServer."},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:"HBase is a client of HDFS.HBase is an HDFS client, using the HDFS DFSClient class, and references to this class appear in HBase logs with other HDFS client log messages."},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:"Configuration is necessary in multiple places.Some HDFS configurations relating to HBase need to be done at the HDFS (server) side. Others must be done within HBase (at the client side). Other settings need to be set at both the server and client side."},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:"Write errors which affect HBase may be logged in the HDFS logs rather than HBase logs.When writing, HDFS pipelines communications from one DataNode to another. HBase communicates to both the HDFS NameNode and DataNode, using the HDFS client classes. Communication problems between DataNodes are logged in the HDFS logs, not the HBase logs."},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:"HBase communicates with HDFS using two different ports.HBase communicates with DataNodes using the ipc.Client interface and the DataNode class. References to these will appear in HBase logs. Each of these communication channels use a different port (50010 and 50020 by default). The ports are configured in the HDFS configuration, via the dfs.datanode.address and dfs.datanode.ipc.address parameters."},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:"Errors may be logged in HBase, HDFS, or both.When troubleshooting HDFS issues in HBase, check logs in both places for errors."},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:"HDFS takes a while to mark a node as dead. You can configure HDFS to avoid using stale DataNodes.By default, HDFS does not mark a node as dead until it is unreachable for 630 seconds. In Hadoop 1.1 and Hadoop 2.x, this can be alleviated by enabling checks for stale DataNodes, though this check is disabled by default. You can enable the check for reads and writes separately, via dfs.namenode.avoid.read.stale.datanode and dfs.namenode.avoid.write.stale.datanode settings. A stale DataNode is one that has not been reachable for dfs.namenode.stale.datanode.interval (default is 30 seconds). Stale datanodes are avoided, and marked as the last possible target for a read or write operation. For configuration details, see the HDFS documentation."},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:"Settings for HDFS retries and timeouts are important to HBase.You can configure settings for various retries and timeouts. Always refer to the HDFS documentation for current recommendations and defaults. Some of the settings important to HBase are listed here. Defaults are current as of Hadoop 2.3. Check the Hadoop documentation for the most current values and recommendations."},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:"The HBase Balancer and HDFS Balancer are incompatibleThe HDFS balancer attempts to spread HDFS blocks evenly among DataNodes. HBase relies on compactions to restore locality after a region split or failure. These two types of balancing do not work well together."},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:"In the past, the generally accepted advice was to turn off the HDFS load balancer and rely on the HBase balancer, since the HDFS balancer would degrade locality. This advice is still valid if your HDFS version is lower than 2.7.1."},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:"HDFS-6133 provides the ability to exclude favored-nodes (pinned) blocks from the HDFS load balancer, by setting the dfs.datanode.block-pinning.enabled property to true in the HDFS service configuration."},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:"HBase can be enabled to use the HDFS favored-nodes feature by switching the HBase balancer class (conf: hbase.master.loadbalancer.class) to org.apache.hadoop.hbase.favored.FavoredNodeLoadBalancer which is documented here."},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:"type: info"},{heading:"important-information-and-guidelines-for-hbase-and-hdfs",content:`HDFS-6133 is available in HDFS 2.7.0 and higher, but HBase does not support running on HDFS 2.7.0,
so you must be using HDFS 2.7.1 or higher to use this feature with HBase.`},{heading:"connection-timeouts",content:"Connection timeouts occur between the client (HBASE) and the HDFS DataNode. They may occur when establishing a connection, attempting to read, or attempting to write. The two settings below are used in combination, and affect connections between the DFSClient and the DataNode, the ipc.cClient and the DataNode, and communication between two DataNodes."},{heading:"connection-timeouts",content:"dfs.client.socket-timeout (default: 60000)The amount of time before a client connection times out when establishing a connection or reading. The value is expressed in milliseconds, so the default is 60 seconds."},{heading:"connection-timeouts",content:"dfs.datanode.socket.write.timeout (default: 480000)The amount of time before a write operation times out. The default is 8 minutes, expressed as milliseconds."},{heading:"typical-error-logs",content:"The following types of errors are often seen in the logs."},{heading:"typical-error-logs",content:"INFO HDFS.DFSClient: Failed to connect to /xxx50010, add to deadNodes and continue java.net.SocketTimeoutException: 60000 millis timeout while waiting for channel to be ready for connect. ch : java.nio.channels.SocketChannel[connection-pending remote=/region-server-1:50010]:: All DataNodes for a block are dead, and recovery is not possible. Here is the sequence of events that leads to this error:"},{heading:"typical-error-logs",content:"INFO org.apache.hadoop.HDFS.DFSClient: Exception in createBlockOutputStream java.net.SocketTimeoutException: 69000 millis timeout while waiting for channel to be ready for connect. ch : java.nio.channels.SocketChannel[connection-pending remote=/ xxx:50010]:: This type of error indicates a write issue. In this case, the master wants to split the log. It does not have a local DataNodes so it tries to connect to a remote DataNode, but the DataNode is dead."},{heading:"runtime-exceptions-from-minidfscluster-when-running-tests",content:"If you see something like the following"},{heading:"runtime-exceptions-from-minidfscluster-when-running-tests",content:"or"},{heading:"runtime-exceptions-from-minidfscluster-when-running-tests",content:"... then try issuing the command umask 022 before launching tests. This is a workaround for HDFS-2556"},{heading:"troubleshooting-case-studies",content:"For Performance and Troubleshooting Case Studies, see Apache HBase Case Studies."},{heading:"sunsecuritypkcs11wrapperpkcs11exception-ckr_arguments_bad-toc",content:"This problem manifests as exceptions ultimately caused by:"},{heading:"sunsecuritypkcs11wrapperpkcs11exception-ckr_arguments_bad-toc",content:"This problem appears to affect some versions of OpenJDK 7 shipped by some Linux vendors. NSS is configured as the default provider. If the host has an x86_64 architecture, depending on if the vendor packages contain the defect, the NSS provider will not function correctly."},{heading:"sunsecuritypkcs11wrapperpkcs11exception-ckr_arguments_bad-toc",content:"To work around this problem, find the JRE home directory and edit the file lib/security/java.security. Edit the file to comment out the line:"},{heading:"sunsecuritypkcs11wrapperpkcs11exception-ckr_arguments_bad-toc",content:"Then renumber the remaining providers accordingly."},{heading:"page-allocation-failure-toc",content:"type: info"},{heading:"page-allocation-failure-toc",content:`This issue is known to affect CentOS 6.2 and possibly CentOS 6.5. It may also affect some versions
of Red Hat Enterprise Linux, according to
https://bugzilla.redhat.com/show_bug.cgi?id=770545.`},{heading:"page-allocation-failure-toc",content:"Some users have reported seeing the following error:"},{heading:"page-allocation-failure-toc",content:"Raising the value of min_free_kbytes was reported to fix this problem. This parameter is set to a percentage of the amount of RAM on your system, and is described in more detail at https://docs.kernel.org/admin-guide/sysctl/vm.html#min-free-kbytes."},{heading:"page-allocation-failure-toc",content:"To find the current value on your system, run the following command:"},{heading:"page-allocation-failure-toc",content:"Next, raise the value. Try doubling, then quadrupling the value. Note that setting the value too low or too high could have detrimental effects on your system. Consult your operating system vendor for specific recommendations."},{heading:"page-allocation-failure-toc",content:"Use the following command to modify the value of min_free_kbytes, substituting VALUE with your intended value:"},{heading:"nosuchmethoderror-javautilconcurrentconcurrenthashmapkeyset-toc",content:"If you see this in your logs:"},{heading:"nosuchmethoderror-javautilconcurrentconcurrenthashmapkeyset-toc",content:"then check if you compiled with jdk8 and tried to run it on jdk7. If so, this won't work. Run on jdk8 or recompile with jdk7. See HBASE-10607 JDK8 NoSuchMethodError involving ConcurrentHashMap.keySet if running on JRE 7."},{heading:"full-gc-caused-by-mslab-when-using-g1-toc",content:"The default size of chunk used by mslab is 2MB, when using G1, if heapRegionSize equals 4MB, these chunks are allocated as humongous objects, exclusively allocating one region, then the remaining 2MB become memory fragment."},{heading:"full-gc-caused-by-mslab-when-using-g1-toc",content:"Lots of memory fragment may lead to full gc even if the percent of used heap not high enough."},{heading:"full-gc-caused-by-mslab-when-using-g1-toc",content:"The G1HeapRegionSize calculated by initial_heap_size and max_heap_size, here are some cases for better understand:"},{heading:"full-gc-caused-by-mslab-when-using-g1-toc",content:"xmx=10G -> region size 2M"},{heading:"full-gc-caused-by-mslab-when-using-g1-toc",content:"xms=10G, xmx=10G -> region size 4M"},{heading:"full-gc-caused-by-mslab-when-using-g1-toc",content:"xmx=20G -> region size 4M"},{heading:"full-gc-caused-by-mslab-when-using-g1-toc",content:"xms=20G, xmx=20G -> region size 8M"},{heading:"full-gc-caused-by-mslab-when-using-g1-toc",content:"xmx=30G -> region size 4M"},{heading:"full-gc-caused-by-mslab-when-using-g1-toc",content:"xmx=32G -> region size 8M"},{heading:"full-gc-caused-by-mslab-when-using-g1-toc",content:"You can avoid this problem by reducing the chunk size a bit to 2047KB as below."}],headings:[{id:"general-guidelines",content:"General Guidelines"},{id:"logs",content:"Logs"},{id:"log-locations",content:"Log Locations"},{id:"troubleshooting-logs-namenode",content:"NameNode"},{id:"troubleshooting-log-locations-datanode",content:"DataNode"},{id:"log-levels",content:"Log Levels"},{id:"enabling-rpc-level-logging",content:"Enabling RPC-level logging"},{id:"handling-multiple-slf4j-bindings-to-prevent-overridden-log-configurations",content:"Handling Multiple SLF4J Bindings to Prevent Overridden Log Configurations"},{id:"jvm-garbage-collection-logs",content:"JVM Garbage Collection Logs"},{id:"troubleshooting-resources",content:"Resources"},{id:"troubleshooting-resources-mailing-lists",content:"Mailing Lists"},{id:"troubleshooting-resources-slack",content:"Slack"},{id:"irc",content:"IRC"},{id:"troubleshooting-resources-jira",content:"JIRA"},{id:"troubleshooting-tools",content:"Tools"},{id:"builtin-tools",content:"Builtin Tools"},{id:"master-web-interface",content:"Master Web Interface"},{id:"regionserver-web-interface",content:"RegionServer Web Interface"},{id:"zkcli",content:"zkcli"},{id:"maintenance-mode",content:"Maintenance Mode"},{id:"external-tools",content:"External Tools"},{id:"tail",content:"tail"},{id:"top",content:"top"},{id:"jps",content:"jps"},{id:"jstack",content:"jstack"},{id:"opentsdb",content:"OpenTSDB"},{id:"clustersshtop",content:"clusterssh+top"},{id:"troubleshooting-client",content:"Client"},{id:"scannertimeoutexception-or-unknownscannerexception-toc",content:"ScannerTimeoutException or UnknownScannerException [!toc]"},{id:"performance-differences-in-thrift-and-java-apis-toc",content:"Performance Differences in Thrift and Java APIs [!toc]"},{id:"leaseexception-when-calling-scannernext-toc",content:"LeaseException when calling Scanner.next [!toc]"},{id:"shell-or-client-application-throws-lots-of-scary-exceptions-during-normal-operation-toc",content:"Shell or client application throws lots of scary exceptions during normal operation [!toc]"},{id:"long-client-pauses-with-compression-toc",content:"Long Client Pauses With Compression [!toc]"},{id:"secure-client-connect-caused-by-gssexception-no-valid-credentials-provided-toc",content:"Secure Client Connect ([Caused by GSSException: No valid credentials provided...]) [!toc]"},{id:"zookeeper-client-connection-errors-toc",content:"ZooKeeper Client Connection Errors [!toc]"},{id:"client-running-out-of-memory-though-heap-size-seems-to-be-stable-but-the-off-heapdirect-heap-keeps-growing-toc",content:"Client running out of memory though heap size seems to be stable (but the off-heap/direct heap keeps growing) [!toc]"},{id:"secure-client-cannot-connect-caused-by-gssexception-no-valid-credentials-providedmechanism-level-failed-to-find-any-kerberos-tgt-toc",content:"Secure Client Cannot Connect ([Caused by GSSException: No valid credentials provided(Mechanism level: Failed to find any Kerberos tgt)]) [!toc]"},{id:"trouble-shooting-master-registry-issues-toc",content:"Trouble shooting master registry issues [!toc]"},{id:"troubleshooting-mapreduce",content:"MapReduce"},{id:"you-think-youre-on-the-cluster-but-youre-actually-local-toc",content:"You Think You're On The Cluster, But You're Actually Local [!toc]"},{id:"launching-a-job-you-get-javalangillegalaccesserror-comgoogleprotobufhbasezerocopybytestring-or-class-comgoogleprotobufzerocopyliteralbytestring-cannot-access-its-superclass-comgoogleprotobufliteralbytestring-toc",content:"Launching a job, you get java.lang.IllegalAccessError: com/google/protobuf/HBaseZeroCopyByteString or class com.google.protobuf.ZeroCopyLiteralByteString cannot access its superclass com.google.protobuf.LiteralByteString [!toc]"},{id:"troubleshooting-namenode",content:"NameNode"},{id:"hdfs-utilization-of-tables-and-regions",content:"HDFS Utilization of Tables and Regions"},{id:"browsing-hdfs-for-hbase-objects",content:"Browsing HDFS for HBase Objects"},{id:"zero-size-wals-with-data-in-them-toc",content:"Zero size WALs with data in them [!toc]"},{id:"use-cases-toc",content:"Use Cases [!toc]"},{id:"unexpected-filesystem-growth",content:"Unexpected Filesystem Growth"},{id:"troubleshooting-network",content:"Network"},{id:"network-spikes",content:"Network Spikes"},{id:"loopback-ip",content:"Loopback IP"},{id:"troubleshooting-network-interfaces",content:"Network Interfaces"},{id:"troubleshooting-regionserver",content:"RegionServer"},{id:"startup-errors",content:"Startup Errors"},{id:"master-starts-but-regionservers-do-not-toc",content:"Master Starts, But RegionServers Do Not [!toc]"},{id:"compression-link-errors-toc",content:"Compression Link Errors [!toc]"},{id:"regionserver-aborts-due-to-lack-of-hsync-for-filesystem-toc",content:"RegionServer aborts due to lack of hsync for filesystem [!toc]"},{id:"regionserver-aborts-due-to-can-not-initialize-access-to-hdfs-toc",content:"RegionServer aborts due to can not initialize access to HDFS [!toc]"},{id:"runtime-errors",content:"Runtime Errors"},{id:"regionserver-hanging-toc",content:"RegionServer Hanging [!toc]"},{id:"javaioioexceptiontoo-many-open-files-toc",content:"java.io.IOException...(Too many open files) [!toc]"},{id:"xceivercount-258-exceeds-the-limit-of-concurrent-xcievers-256-toc",content:"xceiverCount 258 exceeds the limit of concurrent xcievers 256 [!toc]"},{id:"system-instability-and-the-presence-of-javalangoutofmemoryerror-unable-to-createnew-native-thread-in-exceptions-hdfs-datanode-logs-or-that-of-any-system-daemon-toc",content:'System instability, and the presence of "java.lang.OutOfMemoryError: unable to createnew native thread in exceptions" HDFS DataNode logs or that of any system daemon [!toc]'},{id:"dfs-instability-andor-regionserver-lease-timeouts-toc",content:"DFS instability and/or RegionServer lease timeouts [!toc]"},{id:"no-live-nodes-contain-current-block-andor-youaredeadexception-toc",content:'"No live nodes contain current block" and/or YouAreDeadException [!toc]'},{id:"zookeeper-sessionexpired-events-toc",content:"ZooKeeper SessionExpired events [!toc]"},{id:"notservingregionexception-toc",content:"NotServingRegionException [!toc]"},{id:"logs-flooded-with-2011-01-10-124048407-info-orgapachehadoopiocompresscodecpool-gotbrand-new-compressor-messages-toc",content:"Logs flooded with '2011-01-10 12:40:48,407 INFO org.apache.hadoop.io.compress.CodecPool: Gotbrand-new compressor' messages [!toc]"},{id:"server-handler-x-on-60020-caught-javaniochannelsclosedchannelexception-toc",content:"Server handler X on 60020 caught: java.nio.channels.ClosedChannelException [!toc]"},{id:"snapshot-errors-due-to-reverse-dns",content:"Snapshot Errors Due to Reverse DNS"},{id:"shutdown-errors",content:"Shutdown Errors"},{id:"troubleshooting-master",content:"Master"},{id:"startup-errors-1",content:"Startup Errors"},{id:"master-says-that-you-need-to-run-the-hbase-migrations-script-toc",content:"Master says that you need to run the HBase migrations script [!toc]"},{id:"packet-len6080218-is-out-of-range-toc",content:"Packet len6080218 is out of range! [!toc]"},{id:"master-fails-to-become-active-due-to-lack-of-hsync-for-filesystem-toc",content:"Master fails to become active due to lack of hsync for filesystem [!toc]"},{id:"shutdown-errors-1",content:"Shutdown Errors"},{id:"troubleshooting-zookeeper",content:"ZooKeeper"},{id:"startup-errors-2",content:"Startup Errors"},{id:"could-not-find-my-address-xyz-in-list-of-zookeeper-quorum-servers-toc",content:"Could not find my address: xyz in list of ZooKeeper quorum servers [!toc]"},{id:"zookeeper-the-cluster-canary",content:"ZooKeeper, The Cluster Canary"},{id:"troubleshooting-amazon-ec2",content:"Amazon EC2"},{id:"zookeeper-does-not-seem-to-work-on-amazon-ec2",content:"ZooKeeper does not seem to work on Amazon EC2"},{id:"instability-on-amazon-ec2",content:"Instability on Amazon EC2"},{id:"remote-java-connection-into-ec2-cluster-not-working",content:"Remote Java Connection into EC2 Cluster Not Working"},{id:"hbase-and-hadoop-version-issues",content:"HBase and Hadoop version issues"},{id:"cannot-communicate-with-client-version",content:"...cannot communicate with client version..."},{id:"hbase-and-hdfs",content:"HBase and HDFS"},{id:"important-information-and-guidelines-for-hbase-and-hdfs",content:"Important Information and Guidelines for HBase and HDFS"},{id:"connection-timeouts",content:"Connection Timeouts"},{id:"typical-error-logs",content:"Typical Error Logs"},{id:"running-unit-or-integration-tests",content:"Running unit or integration tests"},{id:"runtime-exceptions-from-minidfscluster-when-running-tests",content:"Runtime exceptions from MiniDFSCluster when running tests"},{id:"troubleshooting-case-studies",content:"Case Studies"},{id:"cryptographic-features",content:"Cryptographic Features"},{id:"sunsecuritypkcs11wrapperpkcs11exception-ckr_arguments_bad-toc",content:"sun.security.pkcs11.wrapper.PKCS11Exception: CKR_ARGUMENTS_BAD [!toc]"},{id:"operating-system-specific-issues",content:"Operating System Specific Issues"},{id:"page-allocation-failure-toc",content:"Page Allocation Failure [!toc]"},{id:"jdk-issues",content:"JDK Issues"},{id:"nosuchmethoderror-javautilconcurrentconcurrenthashmapkeyset-toc",content:"NoSuchMethodError: java.util.concurrent.ConcurrentHashMap.keySet [!toc]"},{id:"full-gc-caused-by-mslab-when-using-g1-toc",content:"Full gc caused by mslab when using G1 [!toc]"}]};const d=[{depth:2,url:"#general-guidelines",title:e.jsx(e.Fragment,{children:"General Guidelines"})},{depth:2,url:"#logs",title:e.jsx(e.Fragment,{children:"Logs"})},{depth:2,url:"#log-locations",title:e.jsx(e.Fragment,{children:"Log Locations"})},{depth:3,url:"#troubleshooting-logs-namenode",title:e.jsx(e.Fragment,{children:"NameNode"})},{depth:3,url:"#troubleshooting-log-locations-datanode",title:e.jsx(e.Fragment,{children:"DataNode"})},{depth:2,url:"#log-levels",title:e.jsx(e.Fragment,{children:"Log Levels"})},{depth:3,url:"#enabling-rpc-level-logging",title:e.jsx(e.Fragment,{children:"Enabling RPC-level logging"})},{depth:2,url:"#handling-multiple-slf4j-bindings-to-prevent-overridden-log-configurations",title:e.jsx(e.Fragment,{children:"Handling Multiple SLF4J Bindings to Prevent Overridden Log Configurations"})},{depth:2,url:"#jvm-garbage-collection-logs",title:e.jsx(e.Fragment,{children:"JVM Garbage Collection Logs"})},{depth:2,url:"#troubleshooting-resources",title:e.jsx(e.Fragment,{children:"Resources"})},{depth:3,url:"#troubleshooting-resources-mailing-lists",title:e.jsx(e.Fragment,{children:"Mailing Lists"})},{depth:3,url:"#troubleshooting-resources-slack",title:e.jsx(e.Fragment,{children:"Slack"})},{depth:3,url:"#irc",title:e.jsx(e.Fragment,{children:"IRC"})},{depth:3,url:"#troubleshooting-resources-jira",title:e.jsx(e.Fragment,{children:"JIRA"})},{depth:2,url:"#troubleshooting-tools",title:e.jsx(e.Fragment,{children:"Tools"})},{depth:3,url:"#builtin-tools",title:e.jsx(e.Fragment,{children:"Builtin Tools"})},{depth:4,url:"#master-web-interface",title:e.jsx(e.Fragment,{children:"Master Web Interface"})},{depth:4,url:"#regionserver-web-interface",title:e.jsx(e.Fragment,{children:"RegionServer Web Interface"})},{depth:4,url:"#zkcli",title:e.jsx(e.Fragment,{children:"zkcli"})},{depth:4,url:"#maintenance-mode",title:e.jsx(e.Fragment,{children:"Maintenance Mode"})},{depth:3,url:"#external-tools",title:e.jsx(e.Fragment,{children:"External Tools"})},{depth:4,url:"#tail",title:e.jsx(e.Fragment,{children:"tail"})},{depth:4,url:"#top",title:e.jsx(e.Fragment,{children:"top"})},{depth:4,url:"#jps",title:e.jsx(e.Fragment,{children:"jps"})},{depth:4,url:"#jstack",title:e.jsx(e.Fragment,{children:"jstack"})},{depth:4,url:"#opentsdb",title:e.jsx(e.Fragment,{children:"OpenTSDB"})},{depth:4,url:"#clustersshtop",title:e.jsx(e.Fragment,{children:"clusterssh+top"})},{depth:2,url:"#troubleshooting-client",title:e.jsx(e.Fragment,{children:"Client"})},{depth:2,url:"#troubleshooting-mapreduce",title:e.jsx(e.Fragment,{children:"MapReduce"})},{depth:2,url:"#troubleshooting-namenode",title:e.jsx(e.Fragment,{children:"NameNode"})},{depth:3,url:"#hdfs-utilization-of-tables-and-regions",title:e.jsx(e.Fragment,{children:"HDFS Utilization of Tables and Regions"})},{depth:3,url:"#browsing-hdfs-for-hbase-objects",title:e.jsx(e.Fragment,{children:"Browsing HDFS for HBase Objects"})},{depth:3,url:"#unexpected-filesystem-growth",title:e.jsx(e.Fragment,{children:"Unexpected Filesystem Growth"})},{depth:2,url:"#troubleshooting-network",title:e.jsx(e.Fragment,{children:"Network"})},{depth:3,url:"#network-spikes",title:e.jsx(e.Fragment,{children:"Network Spikes"})},{depth:3,url:"#loopback-ip",title:e.jsx(e.Fragment,{children:"Loopback IP"})},{depth:3,url:"#troubleshooting-network-interfaces",title:e.jsx(e.Fragment,{children:"Network Interfaces"})},{depth:2,url:"#troubleshooting-regionserver",title:e.jsx(e.Fragment,{children:"RegionServer"})},{depth:3,url:"#startup-errors",title:e.jsx(e.Fragment,{children:"Startup Errors"})},{depth:3,url:"#runtime-errors",title:e.jsx(e.Fragment,{children:"Runtime Errors"})},{depth:3,url:"#snapshot-errors-due-to-reverse-dns",title:e.jsx(e.Fragment,{children:"Snapshot Errors Due to Reverse DNS"})},{depth:3,url:"#shutdown-errors",title:e.jsx(e.Fragment,{children:"Shutdown Errors"})},{depth:2,url:"#troubleshooting-master",title:e.jsx(e.Fragment,{children:"Master"})},{depth:3,url:"#startup-errors-1",title:e.jsx(e.Fragment,{children:"Startup Errors"})},{depth:3,url:"#shutdown-errors-1",title:e.jsx(e.Fragment,{children:"Shutdown Errors"})},{depth:2,url:"#troubleshooting-zookeeper",title:e.jsx(e.Fragment,{children:"ZooKeeper"})},{depth:3,url:"#startup-errors-2",title:e.jsx(e.Fragment,{children:"Startup Errors"})},{depth:3,url:"#zookeeper-the-cluster-canary",title:e.jsx(e.Fragment,{children:"ZooKeeper, The Cluster Canary"})},{depth:2,url:"#troubleshooting-amazon-ec2",title:e.jsx(e.Fragment,{children:"Amazon EC2"})},{depth:3,url:"#zookeeper-does-not-seem-to-work-on-amazon-ec2",title:e.jsx(e.Fragment,{children:"ZooKeeper does not seem to work on Amazon EC2"})},{depth:3,url:"#instability-on-amazon-ec2",title:e.jsx(e.Fragment,{children:"Instability on Amazon EC2"})},{depth:3,url:"#remote-java-connection-into-ec2-cluster-not-working",title:e.jsx(e.Fragment,{children:"Remote Java Connection into EC2 Cluster Not Working"})},{depth:2,url:"#hbase-and-hadoop-version-issues",title:e.jsx(e.Fragment,{children:"HBase and Hadoop version issues"})},{depth:3,url:"#cannot-communicate-with-client-version",title:e.jsx(e.Fragment,{children:"...cannot communicate with client version..."})},{depth:2,url:"#hbase-and-hdfs",title:e.jsx(e.Fragment,{children:"HBase and HDFS"})},{depth:3,url:"#important-information-and-guidelines-for-hbase-and-hdfs",title:e.jsx(e.Fragment,{children:"Important Information and Guidelines for HBase and HDFS"})},{depth:3,url:"#connection-timeouts",title:e.jsx(e.Fragment,{children:"Connection Timeouts"})},{depth:3,url:"#typical-error-logs",title:e.jsx(e.Fragment,{children:"Typical Error Logs"})},{depth:2,url:"#running-unit-or-integration-tests",title:e.jsx(e.Fragment,{children:"Running unit or integration tests"})},{depth:3,url:"#runtime-exceptions-from-minidfscluster-when-running-tests",title:e.jsx(e.Fragment,{children:"Runtime exceptions from MiniDFSCluster when running tests"})},{depth:2,url:"#troubleshooting-case-studies",title:e.jsx(e.Fragment,{children:"Case Studies"})},{depth:2,url:"#cryptographic-features",title:e.jsx(e.Fragment,{children:"Cryptographic Features"})},{depth:2,url:"#operating-system-specific-issues",title:e.jsx(e.Fragment,{children:"Operating System Specific Issues"})},{depth:2,url:"#jdk-issues",title:e.jsx(e.Fragment,{children:"JDK Issues"})}];function t(a){const n={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...a.components},{Callout:s}=n;return s||i("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"general-guidelines",children:"General Guidelines"}),`
`,e.jsx(n.p,{children:"Always start with the master log (TODO: Which lines?). Normally it's just printing the same lines over and over again. If not, then there's an issue. Google should return some hits for those exceptions you're seeing."}),`
`,e.jsxs(n.p,{children:["An error rarely comes alone in Apache HBase, usually when something gets screwed up what will follow may be hundreds of exceptions and stack traces coming from all over the place. The best way to approach this type of problem is to walk the log up to where it all began, for example one trick with RegionServers is that they will print some metrics when aborting so grepping for ",e.jsx(n.em,{children:"Dump"})," should get you around the start of the problem."]}),`
`,e.jsxs(n.p,{children:["RegionServer suicides are 'normal', as this is what they do when something goes wrong. For example, if ulimit and max transfer threads (the two most important initial settings, see ",e.jsx(n.a,{href:"/docs/configuration/basic-prerequisites#limits-on-number-of-files-and-processes-ulimit",children:"[ulimit]"})," and ",e.jsx(n.a,{href:"/docs/configuration/basic-prerequisites#dfsdatanodemaxtransferthreads",children:e.jsx(n.code,{children:"dfs.datanode.max.transfer.threads"})}),") aren't changed, it will make it impossible at some point for DataNodes to create new threads that from the HBase point of view is seen as if HDFS was gone. Think about what would happen if your MySQL database was suddenly unable to access files on your local file system, well it's the same with HBase and HDFS. Another very common reason to see RegionServers committing seppuku is when they enter prolonged garbage collection pauses that last longer than the default ZooKeeper session timeout. For more information on GC pauses, see the ",e.jsx(n.a,{href:"https://blog.cloudera.com/blog/2011/02/avoiding-full-gcs-in-hbase-with-memstore-local-allocation-buffers-part-1/",children:"3 part blog post"})," by Todd Lipcon and ",e.jsx(n.a,{href:"/docs/performance#long-gc-pauses",children:"Long GC pauses"})," above."]}),`
`,e.jsx(n.h2,{id:"logs",children:"Logs"}),`
`,e.jsxs(n.p,{children:["The key process logs are as follows... (replace ",e.jsx(n.code,{children:"<user>"})," with the user that started the service, and ",e.jsx(n.code,{children:"<hostname>"})," for the machine name)"]}),`
`,e.jsxs(n.p,{children:["NameNode: ",e.jsx(n.em,{children:"$HADOOP_HOME/logs/hadoop-<user>-namenode-<hostname>.log"})]}),`
`,e.jsxs(n.p,{children:["DataNode: ",e.jsx(n.em,{children:"$HADOOP_HOME/logs/hadoop-<user>-datanode-<hostname>.log"})]}),`
`,e.jsxs(n.p,{children:["JobTracker: ",e.jsx(n.em,{children:"$HADOOP_HOME/logs/hadoop-<user>-jobtracker-<hostname>.log"})]}),`
`,e.jsxs(n.p,{children:["TaskTracker: ",e.jsx(n.em,{children:"$HADOOP_HOME/logs/hadoop-<user>-tasktracker-<hostname>.log"})]}),`
`,e.jsxs(n.p,{children:["HMaster: ",e.jsx(n.em,{children:"$HBASE_HOME/logs/hbase-<user>-master-<hostname>.log"})]}),`
`,e.jsxs(n.p,{children:["RegionServer: ",e.jsx(n.em,{children:"$HBASE_HOME/logs/hbase-<user>-regionserver-<hostname>.log"})]}),`
`,e.jsxs(n.p,{children:["ZooKeeper: ",e.jsx(n.em,{children:"TODO"})]}),`
`,e.jsx(n.h2,{id:"log-locations",children:"Log Locations"}),`
`,e.jsx(n.p,{children:"For stand-alone deployments the logs are obviously going to be on a single machine, however this is a development configuration only. Production deployments need to run on a cluster."}),`
`,e.jsx(n.h3,{id:"troubleshooting-logs-namenode",children:"NameNode"}),`
`,e.jsx(n.p,{children:"The NameNode log is on the NameNode server. The HBase Master is typically run on the NameNode server, and well as ZooKeeper."}),`
`,e.jsx(n.p,{children:"For smaller clusters the JobTracker/ResourceManager is typically run on the NameNode server as well."}),`
`,e.jsx(n.h3,{id:"troubleshooting-log-locations-datanode",children:"DataNode"}),`
`,e.jsx(n.p,{children:"Each DataNode server will have a DataNode log for HDFS, as well as a RegionServer log for HBase."}),`
`,e.jsx(n.p,{children:"Additionally, each DataNode server will also have a TaskTracker/NodeManager log for MapReduce task execution."}),`
`,e.jsx(n.h2,{id:"log-levels",children:"Log Levels"}),`
`,e.jsx(n.h3,{id:"enabling-rpc-level-logging",children:"Enabling RPC-level logging"}),`
`,e.jsxs(n.p,{children:["Enabling the RPC-level logging on a RegionServer can often give insight on timings at the server. Once enabled, the amount of log spewed is voluminous. It is not recommended that you leave this logging on for more than short bursts of time. To enable RPC-level logging, browse to the RegionServer UI and click on ",e.jsx(n.em,{children:"Log Level"}),". Set the log level to ",e.jsx(n.code,{children:"TRACE"})," for the package ",e.jsx(n.code,{children:"org.apache.hadoop.hbase.ipc"}),", then tail the RegionServers log. Analyze."]}),`
`,e.jsxs(n.p,{children:["To disable, set the logging level back to ",e.jsx(n.code,{children:"INFO"})," level."]}),`
`,e.jsx(n.p,{children:"The same log settings also work on Master and for the client."}),`
`,e.jsx(n.h2,{id:"handling-multiple-slf4j-bindings-to-prevent-overridden-log-configurations",children:"Handling Multiple SLF4J Bindings to Prevent Overridden Log Configurations"}),`
`,e.jsxs(n.p,{children:['If you have a local installation of Hadoop (e.g., installed via Homebrew on macOS), you may encounter a "multiple SLF4J bindings" warning when starting HBase in standalone mode using ',e.jsx(n.code,{children:"bin/start-hbase.sh"}),". For example, you may see the following when starting HBase on your machine:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"SLF4J: Class path contains multiple SLF4J bindings."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"SLF4J: Found binding in [jar:file:/opt/homebrew/Cellar/hadoop/3.4.1/libexec/share/hadoop/common/lib/slf4j-reload4j-1.7.36.jar!/org/slf4j/impl/StaticLoggerBinder.class]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"SLF4J: Found binding in [jar:file:$HOME/.m2/repository/org/apache/logging/log4j/log4j-slf4j-impl/2.25.3/log4j-slf4j-impl-2.25.3.jar!/org/slf4j/impl/StaticLoggerBinder.class]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"SLF4J: Actual binding is of type [org.slf4j.impl.Reload4jLoggerFactory]"})})]})})}),`
`,e.jsxs(n.p,{children:["This is happening because the ",e.jsx(n.code,{children:"bin/hbase"})," script automatically detects local Hadoop installations and adds their classpath to HBase. If your Hadoop installation uses the legacy Reload4j (or Log4j 1.2) binder, SLF4J may prioritize it over the HBase Log4j2 binder. When this happens, your ",e.jsx(n.code,{children:"conf/log4j2.properties"})," file and ",e.jsx(n.code,{children:"HBASE_ROOT_LOGGER"})," environment variable are completely ignored."]}),`
`,e.jsxs(n.p,{children:["To get around this issue, you can set ",e.jsx(n.code,{children:"HBASE_DISABLE_HADOOP_CLASSPATH_LOOKUP"})," to ",e.jsx(n.code,{children:"true"}),". You can modify this directly in ",e.jsx(n.code,{children:"conf/hbase-env.sh"})," by uncommenting the following line:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBASE_DISABLE_HADOOP_CLASSPATH_LOOKUP"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"true"'})]})})})}),`
`,e.jsxs(n.p,{children:["Note: Setting ",e.jsx(n.code,{children:"HBASE_DISABLE_HADOOP_CLASSPATH_LOOKUP"})," does not fix the issue when HBase is in distributed mode. There may be a different warning instead."]}),`
`,e.jsx(n.h2,{id:"jvm-garbage-collection-logs",children:"JVM Garbage Collection Logs"}),`
`,e.jsx(s,{type:"info",children:e.jsx(n.p,{children:`All example Garbage Collection logs in this section are based on Java 8 output. The introduction
of Unified Logging in Java 9 and newer will result in very different looking logs.`})}),`
`,e.jsxs(n.p,{children:["HBase is memory intensive, and using the default GC you can see long pauses in all threads including the ",e.jsx(n.em,{children:"Juliet Pause"}),' aka "GC of Death". To help debug this or confirm this is happening GC logging can be turned on in the Java virtual machine.']}),`
`,e.jsxs(n.p,{children:["To enable, in ",e.jsx(n.em,{children:"hbase-env.sh"}),", uncomment one of the below lines :"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# This enables basic gc logging to the .out file."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'# export SERVER_GC_OPTS="-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps"'})}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# This enables basic gc logging to its own file."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'# export SERVER_GC_OPTS="-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:<FILE-PATH>"'})}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# This enables basic GC logging to its own file with automatic log rolling. Only applies to jdk 1.6.0_34+ and 1.7.0_2+."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'# export SERVER_GC_OPTS="-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:<FILE-PATH> -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=1 -XX:GCLogFileSize=512M"'})}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# If <FILE-PATH> is not replaced, the log file(.gc) would be generated in the HBASE_LOG_DIR."})})]})})}),`
`,e.jsx(n.p,{children:"At this point you should see logs like so:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64898.952: [GC [1 CMS-initial-mark: 2811538K(3055704K)] 2812179K(3061272K), 0.0007360 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64898.953: [CMS-concurrent-mark-start]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64898.971: [GC 64898.971: [ParNew: 5567K->576K(5568K), 0.0101110 secs] 2817105K->2812715K(3061272K), 0.0102200 secs] [Times: user=0.07 sys=0.00, real=0.01 secs]"})})]})})}),`
`,e.jsx(n.p,{children:"In this section, the first line indicates a 0.0007360 second pause for the CMS to initially mark. This pauses the entire VM, all threads for that period of time."}),`
`,e.jsx(n.p,{children:'The third line indicates a "minor GC", which pauses the VM for 0.0101110 seconds - aka 10 milliseconds. It has reduced the "ParNew" from about 5.5m to 576k. Later on in this cycle we see:'}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.445: [CMS-concurrent-mark: 1.542/2.492 secs] [Times: user=10.49 sys=0.33, real=2.49 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.445: [CMS-concurrent-preclean-start]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.453: [GC 64901.453: [ParNew: 5505K->573K(5568K), 0.0062440 secs] 2868746K->2864292K(3061272K), 0.0063360 secs] [Times: user=0.05 sys=0.00, real=0.01 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.476: [GC 64901.476: [ParNew: 5563K->575K(5568K), 0.0072510 secs] 2869283K->2864837K(3061272K), 0.0073320 secs] [Times: user=0.05 sys=0.01, real=0.01 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.500: [GC 64901.500: [ParNew: 5517K->573K(5568K), 0.0120390 secs] 2869780K->2865267K(3061272K), 0.0121150 secs] [Times: user=0.09 sys=0.00, real=0.01 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.529: [GC 64901.529: [ParNew: 5507K->569K(5568K), 0.0086240 secs] 2870200K->2865742K(3061272K), 0.0087180 secs] [Times: user=0.05 sys=0.00, real=0.01 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.554: [GC 64901.555: [ParNew: 5516K->575K(5568K), 0.0107130 secs] 2870689K->2866291K(3061272K), 0.0107820 secs] [Times: user=0.06 sys=0.00, real=0.01 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.578: [CMS-concurrent-preclean: 0.070/0.133 secs] [Times: user=0.48 sys=0.01, real=0.14 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.578: [CMS-concurrent-abortable-preclean-start]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.584: [GC 64901.584: [ParNew: 5504K->571K(5568K), 0.0087270 secs] 2871220K->2866830K(3061272K), 0.0088220 secs] [Times: user=0.05 sys=0.00, real=0.01 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.609: [GC 64901.609: [ParNew: 5512K->569K(5568K), 0.0063370 secs] 2871771K->2867322K(3061272K), 0.0064230 secs] [Times: user=0.06 sys=0.00, real=0.01 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.615: [CMS-concurrent-abortable-preclean: 0.007/0.037 secs] [Times: user=0.13 sys=0.00, real=0.03 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.616: [GC[YG occupancy: 645 K (5568 K)]64901.616: [Rescan (parallel) , 0.0020210 secs]64901.618: [weak refs processing, 0.0027950 secs] [1 CMS-remark: 2866753K(3055704K)] 2867399K(3061272K), 0.0049380 secs] [Times: user=0.00 sys=0.01, real=0.01 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.621: [CMS-concurrent-sweep-start]"})})]})})}),`
`,e.jsxs(n.p,{children:["The first line indicates that the CMS concurrent mark (finding garbage) has taken 2.4 seconds. But this is a ",e.jsx(n.em,{children:"concurrent"})," 2.4 seconds, Java has not been paused at any point in time."]}),`
`,e.jsx(n.p,{children:"There are a few more minor GCs, then there is a pause at the 2nd last line:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.616: [GC[YG occupancy: 645 K (5568 K)]64901.616: [Rescan (parallel) , 0.0020210 secs]64901.618: [weak refs processing, 0.0027950 secs] [1 CMS-remark: 2866753K(3055704K)] 2867399K(3061272K), 0.0049380 secs] [Times: user=0.00 sys=0.01, real=0.01 secs]"})})})})}),`
`,e.jsx(n.p,{children:"The pause here is 0.0049380 seconds (aka 4.9 milliseconds) to 'remark' the heap."}),`
`,e.jsx(n.p,{children:"At this point the sweep starts, and you can watch the heap size go down:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64901.637: [GC 64901.637: [ParNew: 5501K->569K(5568K), 0.0097350 secs] 2871958K->2867441K(3061272K), 0.0098370 secs] [Times: user=0.05 sys=0.00, real=0.01 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"...  lines removed ..."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64904.936: [GC 64904.936: [ParNew: 5532K->568K(5568K), 0.0070720 secs] 1365024K->1360689K(3061272K), 0.0071930 secs] [Times: user=0.05 sys=0.00, real=0.01 secs]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"64904.953: [CMS-concurrent-sweep: 2.030/3.332 secs] [Times: user=9.57 sys=0.26, real=3.33 secs]"})})]})})}),`
`,e.jsx(n.p,{children:"At this point, the CMS sweep took 3.332 seconds, and heap went from about ~ 2.8 GB to 1.3 GB (approximate)."}),`
`,e.jsx(n.p,{children:"The key points here is to keep all these pauses low. CMS pauses are always low, but if your ParNew starts growing, you can see minor GC pauses approach 100ms, exceed 100ms and hit as high at 400ms."}),`
`,e.jsx(n.p,{children:"This can be due to the size of the ParNew, which should be relatively small. If your ParNew is very large after running HBase for a while, in one example a ParNew was about 150MB, then you might have to constrain the size of ParNew (The larger it is, the longer the collections take but if it's too small, objects are promoted to old gen too quickly). In the below we constrain new gen size to 64m."}),`
`,e.jsxs(n.p,{children:["Add the below line in ",e.jsx(n.em,{children:"hbase-env.sh"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" SERVER_GC_OPTS"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$SERVER_GC_OPTS"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' -XX:NewSize=64m -XX:MaxNewSize=64m"'})]})})})}),`
`,e.jsxs(n.p,{children:["Similarly, to enable GC logging for client processes, uncomment one of the below lines in ",e.jsx(n.em,{children:"hbase-env.sh"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# This enables basic gc logging to the .out file."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'# export CLIENT_GC_OPTS="-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps"'})}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# This enables basic gc logging to its own file."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'# export CLIENT_GC_OPTS="-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:<FILE-PATH>"'})}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# This enables basic GC logging to its own file with automatic log rolling. Only applies to jdk 1.6.0_34+ and 1.7.0_2+."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'# export CLIENT_GC_OPTS="-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:<FILE-PATH> -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=1 -XX:GCLogFileSize=512M"'})}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# If <FILE-PATH> is not replaced, the log file(.gc) would be generated in the HBASE_LOG_DIR ."})})]})})}),`
`,e.jsxs(n.p,{children:["For more information on GC pauses, see the ",e.jsx(n.a,{href:"https://blog.cloudera.com/blog/2011/02/avoiding-full-gcs-in-hbase-with-memstore-local-allocation-buffers-part-1/",children:"3 part blog post"})," by Todd Lipcon and ",e.jsx(n.a,{href:"/docs/performance#long-gc-pauses",children:"Long GC pauses"})," above."]}),`
`,e.jsx(n.h2,{id:"troubleshooting-resources",children:"Resources"}),`
`,e.jsx(n.h3,{id:"troubleshooting-resources-mailing-lists",children:"Mailing Lists"}),`
`,e.jsxs(n.p,{children:["Ask a question on the ",e.jsx(n.a,{href:"https://hbase.apache.org/mailing-lists.html",children:"Apache HBase mailing lists"}),". The 'dev' mailing list is aimed at the community of developers actually building Apache HBase and for features currently under development, and 'user' is generally used for questions on released versions of Apache HBase. Before going to the mailing list, make sure your question has not already been answered by searching the mailing list archives first. For those who prefer to communicate in Chinese, they can use the 'user-zh' mailing list instead of the 'user' list. Take some time crafting your question. See ",e.jsx(n.a,{href:"http://www.mikeash.com/getting_answers.html",children:"Getting Answers"})," for ideas on crafting good questions. A quality question that includes all context and exhibits evidence the author has tried to find answers in the manual and out on lists is more likely to get a prompt response."]}),`
`,e.jsx(n.h3,{id:"troubleshooting-resources-slack",children:"Slack"}),`
`,e.jsxs(n.p,{children:["#hbase on ",e.jsx(n.a,{href:"https://the-asf.slack.com/",children:"https://the-asf.slack.com/"})]}),`
`,e.jsx(n.h3,{id:"irc",children:"IRC"}),`
`,e.jsx(n.p,{children:"(You will probably get a more prompt response on the Slack channel)"}),`
`,e.jsx(n.p,{children:"#hbase on irc.freenode.net"}),`
`,e.jsx(n.h3,{id:"troubleshooting-resources-jira",children:"JIRA"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HBASE",children:"JIRA"})," is also really helpful when looking for Hadoop/HBase-specific issues."]}),`
`,e.jsx(n.h2,{id:"troubleshooting-tools",children:"Tools"}),`
`,e.jsx(n.h3,{id:"builtin-tools",children:"Builtin Tools"}),`
`,e.jsx(n.h4,{id:"master-web-interface",children:"Master Web Interface"}),`
`,e.jsx(n.p,{children:"The Master starts a web-interface on port 16010 by default."}),`
`,e.jsx(n.p,{children:"The Master web UI lists created tables and their definition (e.g., ColumnFamilies, blocksize, etc.). Additionally, the available RegionServers in the cluster are listed along with selected high-level metrics (requests, number of regions, usedHeap, maxHeap). The Master web UI allows navigation to each RegionServer's web UI."}),`
`,e.jsx(n.h4,{id:"regionserver-web-interface",children:"RegionServer Web Interface"}),`
`,e.jsx(n.p,{children:"RegionServers starts a web-interface on port 16030 by default."}),`
`,e.jsx(n.p,{children:"The RegionServer web UI lists online regions and their start/end keys, as well as point-in-time RegionServer metrics (requests, regions, storeFileIndexSize, compactionQueueSize, etc.)."}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/operational-management/metrics-and-monitoring",children:"HBase Metrics"})," for more information in metric definitions."]}),`
`,e.jsx(n.h4,{id:"zkcli",children:"zkcli"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"zkcli"})," is a very useful tool for investigating ZooKeeper-related issues. To invoke:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./hbase"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" zkcli"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -server"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" host:port"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"cm"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"d"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"arg"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"s"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsx(n.p,{children:"The commands (and arguments) are:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  connect host:port"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  get path [watch]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  ls path [watch]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  set path data [version]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  delquota [-n|-b] path"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  quit"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  printwatches on|off"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  create [-s] [-e] path data acl"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  stat path [watch]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  close"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  ls2 path [watch]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  history"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  listquota path"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  setAcl path acl"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  getAcl path"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  sync path"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  redo cmdno"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  addauth scheme auth"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  delete path [version]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  setquota -n|-b val path"})})]})})}),`
`,e.jsx(n.h4,{id:"maintenance-mode",children:"Maintenance Mode"}),`
`,e.jsxs(n.p,{children:[`If the cluster has gotten stuck in some state and the standard techniques aren't making progress, it is possible to restart the cluster in "maintenance mode." This mode features drastically reduced capabilities and surface area, making it easier to enact very low-level changes such as repairing/recovering the `,e.jsx(n.code,{children:"hbase:meta"})," table."]}),`
`,e.jsxs(n.p,{children:["To enter maintenance mode, set ",e.jsx(n.code,{children:"hbase.master.maintenance_mode"})," to ",e.jsx(n.code,{children:"true"})," either in your ",e.jsx(n.code,{children:"hbase-site.xml"})," or via system propery when starting the master process (",e.jsx(n.code,{children:"-D...=true"}),"). Entering and exiting this mode requires a service restart, however the typical use will be when HBase Master is already facing startup difficulties."]}),`
`,e.jsx(n.p,{children:"When maintenance mode is enabled, the master will host all system tables - ensure that it has enough memory to do so. RegionServers will not be assigned any regions from user-space tables; in fact, they will go completely unused while in maintenance mode. Additionally, the master will not load any coprocessors, will not run any normalization or merge/split operations, and will not enforce quotas."}),`
`,e.jsx(n.h3,{id:"external-tools",children:"External Tools"}),`
`,e.jsx(n.h4,{id:"tail",children:"tail"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"tail"})," is the command line tool that lets you look at the end of a file. Add the ",e.jsx(n.code,{children:"-f"})," option and it will refresh when new data is available. It's useful when you are wondering what's happening, for example, when a cluster is taking a long time to shutdown or startup as you can just fire a new terminal and tail the master log (and maybe a few RegionServers)."]}),`
`,e.jsx(n.h4,{id:"top",children:"top"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"top"})," is probably one of the most important tools when first trying to see what's running on a machine and how the resources are consumed. Here's an example from production system:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"top - 14:46:59 up 39 days, 11:55,  1 user,  load average: 3.75, 3.57, 3.84"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Tasks: 309 total,   1 running, 308 sleeping,   0 stopped,   0 zombie"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Cpu(s):  4.5%us,  1.6%sy,  0.0%ni, 91.7%id,  1.4%wa,  0.1%hi,  0.6%si,  0.0%st"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Mem:  24414432k total, 24296956k used,   117476k free,     7196k buffers"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Swap: 16008732k total,  14348k used, 15994384k free, 11106908k cached"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM  TIME+  COMMAND"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"15558 hadoop    18  -2 3292m 2.4g 3556 S   79 10.4   6523:52 java"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"13268 hadoop    18  -2 8967m 8.2g 4104 S   21 35.1   5170:30 java"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:" 8895 hadoop    18  -2 1581m 497m 3420 S   11  2.1   4002:32 java"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"..."})})]})})}),`
`,e.jsxs(n.p,{children:["Here we can see that the system load average during the last five minutes is 3.75, which very roughly means that on average 3.75 threads were waiting for CPU time during these 5 minutes. In general, the ",e.jsx(n.em,{children:"perfect"})," utilization equals to the number of cores, under that number the machine is under utilized and over that the machine is over utilized. This is an important concept, see this article to understand it more: ",e.jsx(n.a,{href:"http://www.linuxjournal.com/article/9001",children:"http://www.linuxjournal.com/article/9001"}),"."]}),`
`,e.jsx(n.p,{children:"Apart from load, we can see that the system is using almost all its available RAM but most of it is used for the OS cache (which is good). The swap only has a few KBs in it and this is wanted, high numbers would indicate swapping activity which is the nemesis of performance of Java systems. Another way to detect swapping is when the load average goes through the roof (although this could also be caused by things like a dying disk, among others)."}),`
`,e.jsxs(n.p,{children:["The list of processes isn't super useful by default, all we know is that 3 java processes are using about 111% of the CPUs. To know which is which, simply type ",e.jsx(n.code,{children:"c"})," and each line will be expanded. Typing ",e.jsx(n.code,{children:"1"})," will give you the detail of how each CPU is used instead of the average for all of them like shown here."]}),`
`,e.jsx(n.h4,{id:"jps",children:"jps"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"jps"})," is shipped with every JDK and gives the java process ids for the current user (if root, then it gives the ids for all users). Example:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hadoop@sv4borg12:~$"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jps"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1322"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TaskTracker"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"17789"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HRegionServer"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"27862"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Child"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1158"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" DataNode"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"25115"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HQuorumPeer"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"2950"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Jps"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19750"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ThriftServer"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"18776"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jmx"})]})]})})}),`
`,e.jsx(n.p,{children:"In order, we see a:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Hadoop TaskTracker, manages the local Childs"}),`
`,e.jsx(n.li,{children:"HBase RegionServer, serves regions"}),`
`,e.jsx(n.li,{children:"Child, its MapReduce task, cannot tell which type exactly"}),`
`,e.jsx(n.li,{children:"Hadoop TaskTracker, manages the local Childs"}),`
`,e.jsx(n.li,{children:"Hadoop DataNode, serves blocks"}),`
`,e.jsx(n.li,{children:"HQuorumPeer, a ZooKeeper ensemble member"}),`
`,e.jsx(n.li,{children:"Jps, well... it's the current process"}),`
`,e.jsx(n.li,{children:"ThriftServer, it's a special one will be running only if thrift was started"}),`
`,e.jsx(n.li,{children:"jmx, this is a local process that's part of our monitoring platform ( poorly named maybe). You probably don't have that."}),`
`]}),`
`,e.jsx(n.p,{children:"You can then do stuff like checking out the full command line that started the process:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hadoop@sv4borg12:~$"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ps"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" aux"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" grep"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HRegionServer"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hadoop"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"   17789"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  155"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 35.2"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 9067824"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 8604364"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ?"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"     S"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"l"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  Mar04"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 9855:48"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /usr/java/jdk1.6.0_14/bin/java"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Xmx8000m"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -XX:+DoEscapeAnalysis"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -XX:+AggressiveOpts"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -XX:+UseConcMarkSweepGC"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -XX:NewSize=64m"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -XX:MaxNewSize=64m"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -XX:CMSInitiatingOccupancyFraction=88"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -verbose:gc"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -XX:+PrintGCDetails"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -XX:+PrintGCTimeStamps"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Xloggc:/export1/hadoop/logs/gc-hbase.log"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dcom.sun.management.jmxremote.port=10102"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dcom.sun.management.jmxremote.authenticate=true"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dcom.sun.management.jmxremote.ssl=false"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dcom.sun.management.jmxremote.password.file=/home/hadoop/hbase/conf/jmxremote.password"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dcom.sun.management.jmxremote"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhbase.log.dir=/export1/hadoop/logs"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhbase.log.file=hbase-hadoop-regionserver-sv4borg12.log"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhbase.home.dir=/home/hadoop/hbase"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhbase.id.str=hadoop"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhbase.root.logger=INFO,DRFA"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Djava.library.path=/home/hadoop/hbase/lib/native/Linux-amd64-64"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -classpath"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /home/hadoop/hbase/bin/../conf:[many"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jars]:/home/hadoop/hadoop/conf"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.regionserver.HRegionServer"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" start"})]})]})})}),`
`,e.jsx(n.h4,{id:"jstack",children:"jstack"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"jstack"})," is one of the most important tools when trying to figure out what a java process is doing apart from looking at the logs. It has to be used in conjunction with jps in order to give it a process id. It shows a list of threads, each one has a name, and they appear in the order that they were created (so the top ones are the most recent threads). Here are a few example:"]}),`
`,e.jsx(n.p,{children:"The main thread of a RegionServer waiting for something to do from the master:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'"regionserver60020" prio=10 tid=0x0000000040ab4000 nid=0x45cf waiting on condition [0x00007f16b6a96000..0x00007f16b6a96a70]'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"java.lang.Thread.State: TIMED_WAITING (parking)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at sun.misc.Unsafe.park(Native Method)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        - parking to wait for  <0x00007f16cd5c2f30> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:198)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:1963)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:395)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.regionserver.HRegionServer.run(HRegionServer.java:647)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at java.lang.Thread.run(Thread.java:619)"})})]})})}),`
`,e.jsx(n.p,{children:"The MemStore flusher thread that is currently flushing to a file:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'"regionserver60020.cacheFlusher" daemon prio=10 tid=0x0000000040f4e000 nid=0x45eb in Object.wait() [0x00007f16b5b86000..0x00007f16b5b87af0]'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"java.lang.Thread.State: WAITING (on object monitor)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at java.lang.Object.wait(Native Method)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at java.lang.Object.wait(Object.java:485)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.ipc.Client.call(Client.java:803)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        - locked <0x00007f16cb14b3a8> (a org.apache.hadoop.ipc.Client$Call)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.ipc.RPC$Invoker.invoke(RPC.java:221)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at $Proxy1.complete(Unknown Source)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at sun.reflect.GeneratedMethodAccessor38.invoke(Unknown Source)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at java.lang.reflect.Method.invoke(Method.java:597)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.io.retry.RetryInvocationHandler.invokeMethod(RetryInvocationHandler.java:82)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.io.retry.RetryInvocationHandler.invoke(RetryInvocationHandler.java:59)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at $Proxy1.complete(Unknown Source)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hdfs.DFSClient$DFSOutputStream.closeInternal(DFSClient.java:3390)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        - locked <0x00007f16cb14b470> (a org.apache.hadoop.hdfs.DFSClient$DFSOutputStream)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hdfs.DFSClient$DFSOutputStream.close(DFSClient.java:3304)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.fs.FSDataOutputStream$PositionCache.close(FSDataOutputStream.java:61)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.fs.FSDataOutputStream.close(FSDataOutputStream.java:86)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.io.hfile.HFile$Writer.close(HFile.java:650)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.regionserver.StoreFile$Writer.close(StoreFile.java:853)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.regionserver.Store.internalFlushCache(Store.java:467)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        - locked <0x00007f16d00e6f08> (a java.lang.Object)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.regionserver.Store.flushCache(Store.java:427)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.regionserver.Store.access$100(Store.java:80)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.regionserver.Store$StoreFlusherImpl.flushCache(Store.java:1359)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.regionserver.HRegion.internalFlushcache(HRegion.java:907)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.regionserver.HRegion.internalFlushcache(HRegion.java:834)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.regionserver.HRegion.flushcache(HRegion.java:786)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.regionserver.MemStoreFlusher.flushRegion(MemStoreFlusher.java:250)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.regionserver.MemStoreFlusher.flushRegion(MemStoreFlusher.java:224)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    at org.apache.hadoop.hbase.regionserver.MemStoreFlusher.run(MemStoreFlusher.java:146)"})})]})})}),`
`,e.jsx(n.p,{children:"A handler thread that's waiting for stuff to do (like put, delete, scan, etc.):"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'"IPC Server handler 16 on 60020" daemon prio=10 tid=0x00007f16b011d800 nid=0x4a5e waiting on condition [0x00007f16afefd000..0x00007f16afefd9f0]'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"   java.lang.Thread.State: WAITING (parking)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at sun.misc.Unsafe.park(Native Method)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"              - parking to wait for  <0x00007f16cd3f8dd8> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at java.util.concurrent.locks.LockSupport.park(LockSupport.java:158)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:1925)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:358)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.ipc.HBaseServer$Handler.run(HBaseServer.java:1013)"})})]})})}),`
`,e.jsx(n.p,{children:"And one that's busy doing an increment of a counter (it's in the phase where it's trying to create a scanner in order to read the last value):"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'"IPC Server handler 66 on 60020" daemon prio=10 tid=0x00007f16b006e800 nid=0x4a90 runnable [0x00007f16acb77000..0x00007f16acb77cf0]'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"   java.lang.Thread.State: RUNNABLE"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.regionserver.KeyValueHeap.<init>(KeyValueHeap.java:56)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.regionserver.StoreScanner.<init>(StoreScanner.java:79)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.regionserver.Store.getScanner(Store.java:1202)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.regionserver.HRegion$RegionScanner.<init>(HRegion.java:2209)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.regionserver.HRegion.instantiateInternalScanner(HRegion.java:1063)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.regionserver.HRegion.getScanner(HRegion.java:1055)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.regionserver.HRegion.getScanner(HRegion.java:1039)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.regionserver.HRegion.getLastIncrement(HRegion.java:2875)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.regionserver.HRegion.incrementColumnValue(HRegion.java:2978)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.regionserver.HRegionServer.incrementColumnValue(HRegionServer.java:2433)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at sun.reflect.GeneratedMethodAccessor20.invoke(Unknown Source)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at java.lang.reflect.Method.invoke(Method.java:597)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.ipc.HBaseRPC$Server.call(HBaseRPC.java:560)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.ipc.HBaseServer$Handler.run(HBaseServer.java:1027)"})})]})})}),`
`,e.jsx(n.p,{children:"A thread that receives data from HDFS:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'"IPC Client (47) connection to sv4borg9/10.4.24.40:9000 from hadoop" daemon prio=10 tid=0x00007f16a02d0000 nid=0x4fa3 runnable [0x00007f16b517d000..0x00007f16b517dbf0]'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"   java.lang.Thread.State: RUNNABLE"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:215)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:65)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:69)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"              - locked <0x00007f17d5b68c00> (a sun.nio.ch.Util$1)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"              - locked <0x00007f17d5b68be8> (a java.util.Collections$UnmodifiableSet)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"              - locked <0x00007f1877959b50> (a sun.nio.ch.EPollSelectorImpl)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:80)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.net.SocketIOWithTimeout$SelectorPool.select(SocketIOWithTimeout.java:332)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.net.SocketIOWithTimeout.doIO(SocketIOWithTimeout.java:157)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.net.SocketInputStream.read(SocketInputStream.java:155)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.net.SocketInputStream.read(SocketInputStream.java:128)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at java.io.FilterInputStream.read(FilterInputStream.java:116)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.ipc.Client$Connection$PingInputStream.read(Client.java:304)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at java.io.BufferedInputStream.fill(BufferedInputStream.java:218)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at java.io.BufferedInputStream.read(BufferedInputStream.java:237)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"              - locked <0x00007f1808539178> (a java.io.BufferedInputStream)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at java.io.DataInputStream.readInt(DataInputStream.java:370)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.ipc.Client$Connection.receiveResponse(Client.java:569)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.ipc.Client$Connection.run(Client.java:477)"})})]})})}),`
`,e.jsx(n.p,{children:"And here is a master trying to recover a lease after a RegionServer died:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'"LeaseChecker" daemon prio=10 tid=0x00000000407ef800 nid=0x76cd waiting on condition [0x00007f6d0eae2000..0x00007f6d0eae2a70]'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"--"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"   java.lang.Thread.State: WAITING (on object monitor)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at java.lang.Object.wait(Native Method)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at java.lang.Object.wait(Object.java:485)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.ipc.Client.call(Client.java:726)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          - locked <0x00007f6d1cd28f80> (a org.apache.hadoop.ipc.Client$Call)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.ipc.RPC$Invoker.invoke(RPC.java:220)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at $Proxy1.recoverBlock(Unknown Source)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hdfs.DFSClient$DFSOutputStream.processDatanodeError(DFSClient.java:2636)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hdfs.DFSClient$DFSOutputStream.<init>(DFSClient.java:2832)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hdfs.DFSClient.append(DFSClient.java:529)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hdfs.DistributedFileSystem.append(DistributedFileSystem.java:186)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.fs.FileSystem.append(FileSystem.java:530)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.util.FSUtils.recoverFileLease(FSUtils.java:619)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.regionserver.wal.HLog.splitLog(HLog.java:1322)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.regionserver.wal.HLog.splitLog(HLog.java:1210)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.master.HMaster.splitLogAfterStartup(HMaster.java:648)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.master.HMaster.joinCluster(HMaster.java:572)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"          at org.apache.hadoop.hbase.master.HMaster.run(HMaster.java:503)"})})]})})}),`
`,e.jsx(n.h4,{id:"opentsdb",children:"OpenTSDB"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.a,{href:"http://opentsdb.net",children:"OpenTSDB"})," is an excellent alternative to Ganglia as it uses Apache HBase to store all the time series and doesn't have to downsample. Monitoring your own HBase cluster that hosts OpenTSDB is a good exercise."]}),`
`,e.jsx(n.p,{children:"Here's an example of a cluster that's suffering from hundreds of compactions launched almost all around the same time, which severely affects the IO performance: (TODO: insert graph plotting compactionQueueSize)"}),`
`,e.jsx(n.p,{children:"It's a good practice to build dashboards with all the important graphs per machine and per cluster so that debugging issues can be done with a single quick look. For example, at StumbleUpon there's one dashboard per cluster with the most important metrics from both the OS and Apache HBase. You can then go down at the machine level and get even more detailed metrics."}),`
`,e.jsx(n.h4,{id:"clustersshtop",children:"clusterssh+top"}),`
`,e.jsxs(n.p,{children:["clusterssh+top, it's like a poor man's monitoring system and it can be quite useful when you have only a few machines as it's very easy to setup. Starting clusterssh will give you one terminal per machine and another terminal in which whatever you type will be retyped in every window. This means that you can type ",e.jsx(n.code,{children:"top"})," once and it will start it for all of your machines at the same time giving you full view of the current state of your cluster. You can also tail all the logs at the same time, edit files, etc."]}),`
`,e.jsx(n.h2,{id:"troubleshooting-client",children:"Client"}),`
`,e.jsxs(n.p,{children:["For more information on the HBase client, see ",e.jsx(n.a,{href:"/docs/architecture/client",children:"client"}),"."]}),`
`,e.jsx(n.h3,{id:"scannertimeoutexception-or-unknownscannerexception-toc",children:"ScannerTimeoutException or UnknownScannerException"}),`
`,e.jsxs(n.p,{children:["This is thrown if the time between RPC calls from the client to RegionServer exceeds the scan timeout. For example, if ",e.jsx(n.code,{children:"Scan.setCaching"})," is set to 500, then there will be an RPC call to fetch the next batch of rows every 500 ",e.jsx(n.code,{children:".next()"})," calls on the ResultScanner because data is being transferred in blocks of 500 rows to the client. Reducing the setCaching value may be an option, but setting this value too low makes for inefficient processing on numbers of rows."]}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/performance#scan-caching",children:"Scan Caching"}),"."]}),`
`,e.jsx(n.h3,{id:"performance-differences-in-thrift-and-java-apis-toc",children:"Performance Differences in Thrift and Java APIs"}),`
`,e.jsxs(n.p,{children:["Poor performance, or even ",e.jsx(n.code,{children:"ScannerTimeoutExceptions"}),", can occur if ",e.jsx(n.code,{children:"Scan.setCaching"})," is too high, as discussed in ",e.jsx(n.a,{href:"/docs/troubleshooting#scannertimeoutexception-or-unknownscannerexception",children:"ScannerTimeoutException or UnknownScannerException"}),". If the Thrift client uses the wrong caching settings for a given workload, performance can suffer compared to the Java API. To set caching for a given scan in the Thrift client, use the ",e.jsx(n.code,{children:"scannerGetList(scannerId, numRows)"})," method, where ",e.jsx(n.code,{children:"numRows"})," is an integer representing the number of rows to cache. In one case, it was found that reducing the cache for Thrift scans from 1000 to 100 increased performance to near parity with the Java API given the same queries."]}),`
`,e.jsxs(n.p,{children:["See also Jesse Andersen's ",e.jsx(n.a,{href:"http://blog.cloudera.com/blog/2014/04/how-to-use-the-hbase-thrift-interface-part-3-using-scans/",children:"blog post"})," about using Scans with Thrift."]}),`
`,e.jsxs(n.h3,{id:"leaseexception-when-calling-scannernext-toc",children:[e.jsx(n.code,{children:"LeaseException"})," when calling ",e.jsx(n.code,{children:"Scanner.next"})]}),`
`,e.jsxs(n.p,{children:["In some situations clients that fetch data from a RegionServer get a LeaseException instead of the usual ",e.jsx(n.a,{href:"/docs/troubleshooting#scannertimeoutexception-or-unknownscannerexception",children:"ScannerTimeoutException or UnknownScannerException"}),". Usually the source of the exception is ",e.jsx(n.code,{children:"org.apache.hadoop.hbase.regionserver.Leases.removeLease(Leases.java:230)"})," (line number may vary). It tends to happen in the context of a slow/freezing ",e.jsx(n.code,{children:"RegionServer#next"})," call. It can be prevented by having ",e.jsx(n.code,{children:"hbase.rpc.timeout"})," > ",e.jsx(n.code,{children:"hbase.client.scanner.timeout.period"}),". Harsh J investigated the issue as part of the mailing list thread ",e.jsx(n.a,{href:"https://mail-archives.apache.org/mod_mbox/hbase-user/201209.mbox/%3CCAOcnVr3R-LqtKhFsk8Bhrm-YW2i9O6J6Fhjz2h7q6_sxvwd2yw%40mail.gmail.com%3E",children:"HBase, mail # user - Lease does not exist exceptions"})]}),`
`,e.jsx(n.h3,{id:"shell-or-client-application-throws-lots-of-scary-exceptions-during-normal-operation-toc",children:"Shell or client application throws lots of scary exceptions during normal operation"}),`
`,e.jsxs(n.p,{children:["Since 0.20.0 the default log level for ",e.jsx(n.code,{children:"org.apache.hadoop.hbase.*"})," is DEBUG."]}),`
`,e.jsxs(n.p,{children:["On your clients, edit ",e.jsx(n.em,{children:"$HBASE_HOME/conf/log4j.properties"})," and change this: ",e.jsx(n.code,{children:"log4j.logger.org.apache.hadoop.hbase=DEBUG"})," to this: ",e.jsx(n.code,{children:"log4j.logger.org.apache.hadoop.hbase=INFO"}),", or even ",e.jsx(n.code,{children:"log4j.logger.org.apache.hadoop.hbase=WARN"}),"."]}),`
`,e.jsx(n.h3,{id:"long-client-pauses-with-compression-toc",children:"Long Client Pauses With Compression"}),`
`,e.jsx(n.p,{children:"This is a fairly frequent question on the Apache HBase dist-list. The scenario is that a client is typically inserting a lot of data into a relatively un-optimized HBase cluster. Compression can exacerbate the pauses, although it is not the source of the problem."}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/performance#table-creation-pre-creating-regions",children:"Table Creation: Pre-Creating Regions"})," on the pattern for pre-creating regions and confirm that the table isn't starting with a single region."]}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/performance#hbase-configurations",children:"HBase Configurations"})," for cluster configuration, particularly ",e.jsx(n.code,{children:"hbase.hstore.blockingStoreFiles"}),", ",e.jsx(n.code,{children:"hbase.hregion.memstore.block.multiplier"}),", ",e.jsx(n.code,{children:"MAX_FILESIZE"})," (region size), and ",e.jsx(n.code,{children:"MEMSTORE_FLUSHSIZE."})]}),`
`,e.jsx(n.p,{children:"A slightly longer explanation of why pauses can happen is as follows: Puts are sometimes blocked on the MemStores which are blocked by the flusher thread which is blocked because there are too many files to compact because the compactor is given too many small files to compact and has to compact the same data repeatedly. This situation can occur even with minor compactions. Compounding this situation, Apache HBase doesn't compress data in memory. Thus, the 64MB that lives in the MemStore could become a 6MB file after compression - which results in a smaller StoreFile. The upside is that more data is packed into the same region, but performance is achieved by being able to write larger files - which is why HBase waits until the flushsize before writing a new StoreFile. And smaller StoreFiles become targets for compaction. Without compression the files are much bigger and don't need as much compaction, however this is at the expense of I/O."}),`
`,e.jsx(n.h3,{id:"secure-client-connect-caused-by-gssexception-no-valid-credentials-provided-toc",children:"Secure Client Connect ([Caused by GSSException: No valid credentials provided...])"}),`
`,e.jsx(n.p,{children:"You may encounter the following error:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Secure Client Connect ([Caused by GSSException: No valid credentials provided"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        (Mechanism level: Request is a replay (34) V PROCESS_TGS)])"})})]})})}),`
`,e.jsxs(n.p,{children:["This issue is caused by bugs in the MIT Kerberos replay_cache component, ",e.jsx(n.a,{href:"http://krbdev.mit.edu/rt/Ticket/Display.html?id=1201",children:"#1201"})," and ",e.jsx(n.a,{href:"http://krbdev.mit.edu/rt/Ticket/Display.html?id=5924",children:"#5924"}),". These bugs caused the old version of krb5-server to erroneously block subsequent requests sent from a Principal. This caused krb5-server to block the connections sent from one Client (one HTable instance with multi-threading connection instances for each RegionServer); Messages, such as ",e.jsx(n.code,{children:"Request is a replay (34)"}),", are logged in the client log You can ignore the messages, because HTable will retry 5 * 10 (50) times for each failed connection by default. HTable will throw IOException if any connection to the RegionServer fails after the retries, so that the user client code for HTable instance can handle it further. NOTE: ",e.jsx(n.code,{children:"HTable"})," is deprecated in HBase 1.0, in favor of ",e.jsx(n.code,{children:"Table"}),"."]}),`
`,e.jsxs(n.p,{children:["Alternatively, update krb5-server to a version which solves these issues, such as krb5-server-1.10.3. See JIRA ",e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HBASE-10379",children:"HBASE-10379"})," for more details."]}),`
`,e.jsx(n.h3,{id:"zookeeper-client-connection-errors-toc",children:"ZooKeeper Client Connection Errors"}),`
`,e.jsx(n.p,{children:"Errors like this..."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"11/07/05 11:26:41 WARN zookeeper.ClientCnxn: Session 0x0 for server null,"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:" unexpected error, closing socket connection and attempting reconnect"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:" java.net.ConnectException: Connection refused: no further information"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at sun.nio.ch.SocketChannelImpl.checkConnect(Native Method)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at sun.nio.ch.SocketChannelImpl.finishConnect(Unknown Source)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.zookeeper.ClientCnxn$SendThread.run(ClientCnxn.java:1078)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:" 11/07/05 11:26:43 INFO zookeeper.ClientCnxn: Opening socket connection to"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:" server localhost/127.0.0.1:2181"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:" 11/07/05 11:26:44 WARN zookeeper.ClientCnxn: Session 0x0 for server null,"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:" unexpected error, closing socket connection and attempting reconnect"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:" java.net.ConnectException: Connection refused: no further information"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at sun.nio.ch.SocketChannelImpl.checkConnect(Native Method)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at sun.nio.ch.SocketChannelImpl.finishConnect(Unknown Source)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.zookeeper.ClientCnxn$SendThread.run(ClientCnxn.java:1078)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:" 11/07/05 11:26:45 INFO zookeeper.ClientCnxn: Opening socket connection to"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:" server localhost/127.0.0.1:2181"})})]})})}),`
`,e.jsx(n.p,{children:"...are either due to ZooKeeper being down, or unreachable due to network issues."}),`
`,e.jsxs(n.p,{children:["The utility ",e.jsx(n.a,{href:"/docs/troubleshooting#zkcli",children:"zkcli"})," may help investigate ZooKeeper issues."]}),`
`,e.jsx(n.h3,{id:"client-running-out-of-memory-though-heap-size-seems-to-be-stable-but-the-off-heapdirect-heap-keeps-growing-toc",children:"Client running out of memory though heap size seems to be stable (but the off-heap/direct heap keeps growing)"}),`
`,e.jsxs(n.p,{children:["You are likely running into the issue that is described and worked through in the mail thread ",e.jsx(n.a,{href:"https://lists.apache.org/thread.html/d12bbe56be95cf68478d1528263042730670ff39159a01eaf06d8bc8%401322622090%40%3Cuser.hbase.apache.org%3E",children:"HBase, mail # user - Suspected memory leak"})," and continued over in ",e.jsx(n.a,{href:"https://lists.apache.org/thread.html/621dde35479215f0b07b23af93b8fac52ff4729949b5c9af18e3a85b%401322971078%40%3Cuser.hbase.apache.org%3E",children:"HBase, mail # dev - FeedbackRe: Suspected memory leak"}),". A workaround is passing your client-side JVM a reasonable value for ",e.jsx(n.code,{children:"-XX:MaxDirectMemorySize"}),". By default, the ",e.jsx(n.code,{children:"MaxDirectMemorySize"})," is equal to your ",e.jsx(n.code,{children:"-Xmx"})," max heapsize setting (if ",e.jsx(n.code,{children:"-Xmx"})," is set). Try setting it to something smaller (for example, one user had success setting it to ",e.jsx(n.code,{children:"1g"})," when they had a client-side heap of ",e.jsx(n.code,{children:"12g"}),"). If you set it too small, it will bring on ",e.jsx(n.code,{children:"FullGCs"})," so keep it a bit hefty. You want to make this setting client-side only especially if you are running the new experimental server-side off-heap cache since this feature depends on being able to use big direct buffers (You may have to keep separate client-side and server-side config dirs)."]}),`
`,e.jsx(n.h3,{id:"secure-client-cannot-connect-caused-by-gssexception-no-valid-credentials-providedmechanism-level-failed-to-find-any-kerberos-tgt-toc",children:"Secure Client Cannot Connect ([Caused by GSSException: No valid credentials provided(Mechanism level: Failed to find any Kerberos tgt)])"}),`
`,e.jsx(n.p,{children:"There can be several causes that produce this symptom."}),`
`,e.jsxs(n.p,{children:["First, check that you have a valid Kerberos ticket. One is required in order to set up communication with a secure Apache HBase cluster. Examine the ticket currently in the credential cache, if any, by running the ",e.jsx(n.code,{children:"klist"})," command line utility. If no ticket is listed, you must obtain a ticket by running the ",e.jsx(n.code,{children:"kinit"})," command with either a keytab specified, or by interactively entering a password for the desired principal."]}),`
`,e.jsxs(n.p,{children:["Then, consult the ",e.jsx(n.a,{href:"http://docs.oracle.com/javase/1.5.0/docs/guide/security/jgss/tutorials/Troubleshooting.html",children:"Java Security Guide troubleshooting section"}),". The most common problem addressed there is resolved by setting ",e.jsx(n.code,{children:"javax.security.auth.useSubjectCredsOnly"})," system property value to ",e.jsx(n.code,{children:"false"}),"."]}),`
`,e.jsxs(n.p,{children:["Because of a change in the format in which MIT Kerberos writes its credentials cache, there is a bug in the Oracle JDK 6 Update 26 and earlier that causes Java to be unable to read the Kerberos credentials cache created by versions of MIT Kerberos 1.8.1 or higher. If you have this problematic combination of components in your environment, to work around this problem, first log in with ",e.jsx(n.code,{children:"kinit"})," and then immediately refresh the credential cache with ",e.jsx(n.code,{children:"kinit -R"}),". The refresh will rewrite the credential cache without the problematic formatting."]}),`
`,e.jsx(n.p,{children:"Prior to JDK 1.4, the JCE was an unbundled product, and as such, the JCA and JCE were regularly referred to as separate, distinct components. As JCE is now bundled in the JDK 7.0, the distinction is becoming less apparent. Since the JCE uses the same architecture as the JCA, the JCE should be more properly thought of as a part of the JCA."}),`
`,e.jsxs(n.p,{children:["You may need to install the ",e.jsx(n.a,{href:"https://docs.oracle.com/javase/1.5.0/docs/guide/security/jce/JCERefGuide.html",children:"Java Cryptography Extension"}),", or JCE because of JDK 1.5 or earlier version. Insure the JCE jars are on the classpath on both server and client systems."]}),`
`,e.jsxs(n.p,{children:["You may also need to download the ",e.jsx(n.a,{href:"http://www.oracle.com/technetwork/java/javase/downloads/jce-6-download-429243.html",children:"unlimited strength JCE policy files"}),". Uncompress and extract the downloaded file, and install the policy jars into ",e.jsx(n.em,{children:"<java-home>/lib/security"}),"."]}),`
`,e.jsx(n.h3,{id:"trouble-shooting-master-registry-issues-toc",children:"Trouble shooting master registry issues"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:'For connectivity issues, usually an exception like "MasterRegistryFetchException: Exception making rpc to masters..." is logged in the client logs. The logging includes the list of master end points that were attempted by the client. The bottom part of the stack trace should include the underlying reason. If you suspect connectivity issues (ConnectionRefused?), make sure the master end points are accessible from client.'}),`
`,e.jsxs(n.li,{children:["If there is a suspicion of higher load on the masters due to hedging of RPCs, it can be controlled by either reducing the hedging fan out (via ",e.jsx(n.em,{children:"hbase.rpc.hedged.fanout"}),") or by restricting the set of masters that clients can access for the master registry purposes (via ",e.jsx(n.em,{children:"hbase.masters"}),")."]}),`
`]}),`
`,e.jsxs(n.p,{children:["Refer to ",e.jsx(n.a,{href:"/docs/architecture/client#masterregistry-rpc-hedging",children:"Master Registry (new as of 2.3.0)"})," and ",e.jsx(n.a,{href:"/docs/configuration/default#client-configuration-and-dependencies-connecting-to-an-hbase-cluster",children:"Client configuration and dependencies connecting to an HBase cluster"})," for more details."]}),`
`,e.jsx(n.h2,{id:"troubleshooting-mapreduce",children:"MapReduce"}),`
`,e.jsx(n.h3,{id:"you-think-youre-on-the-cluster-but-youre-actually-local-toc",children:"You Think You're On The Cluster, But You're Actually Local"}),`
`,e.jsxs(n.p,{children:["This following stacktrace happened using ",e.jsx(n.code,{children:"ImportTsv"}),", but things like this can happen on any job with a mis-configuration."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    WARN mapred.LocalJobRunner: job_local_0001"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"java.lang.IllegalArgumentException: Can't read partitions file"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.hbase.mapreduce.hadoopbackport.TotalOrderPartitioner.setConf(TotalOrderPartitioner.java:111)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.util.ReflectionUtils.setConf(ReflectionUtils.java:62)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.util.ReflectionUtils.newInstance(ReflectionUtils.java:117)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.mapred.MapTask$NewOutputCollector.<init>(MapTask.java:560)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.mapred.MapTask.runNewMapper(MapTask.java:639)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.mapred.MapTask.run(MapTask.java:323)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.mapred.LocalJobRunner$Job.run(LocalJobRunner.java:210)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Caused by: java.io.FileNotFoundException: File _partition.lst does not exist."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.fs.RawLocalFileSystem.getFileStatus(RawLocalFileSystem.java:383)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.fs.FilterFileSystem.getFileStatus(FilterFileSystem.java:251)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.fs.FileSystem.getLength(FileSystem.java:776)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.io.SequenceFile$Reader.<init>(SequenceFile.java:1424)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.io.SequenceFile$Reader.<init>(SequenceFile.java:1419)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.hadoop.hbase.mapreduce.hadoopbackport.TotalOrderPartitioner.readPartitions(TotalOrderPartitioner.java:296)"})})]})})}),`
`,e.jsx(n.p,{children:"...see the critical portion of the stack? It's..."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"at org.apache.hadoop.mapred.LocalJobRunner$Job.run(LocalJobRunner.java:210)"})})})})}),`
`,e.jsx(n.p,{children:"LocalJobRunner means the job is running locally, not on the cluster."}),`
`,e.jsxs(n.p,{children:["To solve this problem, you should run your MR job with your ",e.jsx(n.code,{children:"HADOOP_CLASSPATH"}),' set to include the HBase dependencies. The "hbase classpath" utility can be used to do this easily. For example (substitute VERSION with your HBase version):']}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HADOOP_CLASSPATH"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" classpath`"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" hadoop"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $HBASE_HOME"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/hbase-mapreduce-VERSION.jar"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" rowcounter"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" usertable"})]})})})}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/mapreduce#hbase-mapreduce-and-the-classpath",children:"HBase, MapReduce, and the CLASSPATH"})," for more information on HBase MapReduce jobs and classpaths."]}),`
`,e.jsx(n.h3,{id:"launching-a-job-you-get-javalangillegalaccesserror-comgoogleprotobufhbasezerocopybytestring-or-class-comgoogleprotobufzerocopyliteralbytestring-cannot-access-its-superclass-comgoogleprotobufliteralbytestring-toc",children:"Launching a job, you get java.lang.IllegalAccessError: com/google/protobuf/HBaseZeroCopyByteString or class com.google.protobuf.ZeroCopyLiteralByteString cannot access its superclass com.google.protobuf.LiteralByteString"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HBASE-10304",children:"HBASE-10304 Running an hbase job jar: IllegalAccessError: class com.google.protobuf.ZeroCopyLiteralByteString cannot access its superclass com.google.protobuf.LiteralByteString"})," and ",e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HBASE-11118",children:'HBASE-11118 non environment variable solution for "IllegalAccessError: class com.google.protobuf.ZeroCopyLiteralByteString cannot access its superclass com.google.protobuf.LiteralByteString"'}),". The issue can also show up when trying to run spark jobs. See ",e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HBASE-10877",children:"HBASE-10877 HBase non-retriable exception list should be expanded"}),"."]}),`
`,e.jsx(n.h2,{id:"troubleshooting-namenode",children:"NameNode"}),`
`,e.jsxs(n.p,{children:["For more information on the NameNode, see ",e.jsx(n.a,{href:"/docs/architecture/hdfs",children:"HDFS"}),"."]}),`
`,e.jsx(n.h3,{id:"hdfs-utilization-of-tables-and-regions",children:"HDFS Utilization of Tables and Regions"}),`
`,e.jsxs(n.p,{children:["To determine how much space HBase is using on HDFS use the ",e.jsx(n.code,{children:"hadoop"})," shell commands from the NameNode. For example..."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hadoop"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" fs"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -dus"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /hbase/"})]})})})}),`
`,e.jsx(n.p,{children:"...returns the summarized disk utilization for all HBase objects."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hadoop"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" fs"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -dus"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /hbase/myTable"})]})})})}),`
`,e.jsx(n.p,{children:"...returns the summarized disk utilization for the HBase table 'myTable'."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hadoop"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" fs"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -du"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /hbase/myTable"})]})})})}),`
`,e.jsx(n.p,{children:"...returns a list of the regions under the HBase table 'myTable' and their disk utilization."}),`
`,e.jsxs(n.p,{children:["For more information on HDFS shell commands, see the ",e.jsx(n.a,{href:"https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/FileSystemShell.html",children:"HDFS FileSystem Shell documentation"}),"."]}),`
`,e.jsx(n.h3,{id:"browsing-hdfs-for-hbase-objects",children:"Browsing HDFS for HBase Objects"}),`
`,e.jsx(n.p,{children:"Sometimes it will be necessary to explore the HBase objects that exist on HDFS. These objects could include the WALs (Write Ahead Logs), tables, regions, StoreFiles, etc. The easiest way to do this is with the NameNode web application that runs on port 50070. The NameNode web application will provide links to the all the DataNodes in the cluster so that they can be browsed seamlessly."}),`
`,e.jsx(n.p,{children:"The HDFS directory structure of HBase tables in the cluster is..."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"/hbase"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    /data"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        /<Namespace>                    (Namespaces in the cluster)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"            /<Table>                    (Tables in the cluster)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"                /<Region>               (Regions for the table)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"                    /<ColumnFamily>     (ColumnFamilies for the Region for the table)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"                        /<StoreFile>    (StoreFiles for the ColumnFamily for the Regions for the table)"})})]})})}),`
`,e.jsx(n.p,{children:"The HDFS directory structure of HBase WAL is.."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"/hbase"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    /WALs"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        /<RegionServer>    (RegionServers)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"            /<WAL>         (WAL files for the RegionServer)"})})]})})}),`
`,e.jsxs(n.p,{children:["See the ",e.jsx(n.a,{href:"https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsUserGuide.html",children:"HDFS User Guide"})," for other non-shell diagnostic utilities like ",e.jsx(n.code,{children:"fsck"}),"."]}),`
`,e.jsx(n.h4,{id:"zero-size-wals-with-data-in-them-toc",children:"Zero size WALs with data in them"}),`
`,e.jsxs(n.p,{children:["Problem: when getting a listing of all the files in a RegionServer's ",e.jsx(n.em,{children:"WALs"})," directory, one file has a size of 0 but it contains data."]}),`
`,e.jsx(n.p,{children:"Answer: It's an HDFS quirk. A file that's currently being written to will appear to have a size of 0 but once it's closed it will show its true size"}),`
`,e.jsx(n.h4,{id:"use-cases-toc",children:"Use Cases"}),`
`,e.jsx(n.p,{children:'Two common use-cases for querying HDFS for HBase objects is research the degree of uncompaction of a table. If there are a large number of StoreFiles for each ColumnFamily it could indicate the need for a major compaction. Additionally, after a major compaction if the resulting StoreFile is "small" it could indicate the need for a reduction of ColumnFamilies for the table.'}),`
`,e.jsx(n.h3,{id:"unexpected-filesystem-growth",children:"Unexpected Filesystem Growth"}),`
`,e.jsx(n.p,{children:"If you see an unexpected spike in filesystem usage by HBase, two possible culprits are snapshots and WALs."}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Snapshots"}),e.jsx(n.br,{}),`
`,"When you create a snapshot, HBase retains everything it needs to recreate the table's state at that time of the snapshot. This includes deleted cells or expired versions. For this reason, your snapshot usage pattern should be well-planned, and you should prune snapshots that you no longer need. Snapshots are stored in ",e.jsx(n.code,{children:"/hbase/.hbase-snapshot"}),", and archives needed to restore snapshots are stored in ",e.jsx(n.code,{children:"/hbase/archive/<tablename>/<region>/<column_family>/"}),"."]}),`
`,e.jsx(s,{type:"warn",children:e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Do not"}),` manage snapshots or archives manually via HDFS. HBase provides APIs and HBase Shell
commands for managing them. For more information, see
`,e.jsx(n.a,{href:"/docs/operational-management/backup-and-snapshots#hbase-snapshots",children:"ops.snapshots"}),"."]})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"WAL"}),e.jsx(n.br,{}),`
`,"Write-ahead logs (WALs) are stored in subdirectories of the HBase root directory, typically ",e.jsx(n.code,{children:"/hbase/"}),", depending on their status. Already-processed WALs are stored in ",e.jsx(n.code,{children:"/hbase/oldWALs/"})," and corrupt WALs are stored in ",e.jsx(n.code,{children:"/hbase/.corrupt/"})," for examination. If the size of one of these subdirectories is growing, examine the HBase server logs to find the root cause for why WALs are not being processed correctly.",e.jsx(n.br,{}),`
`,"If you use replication and ",e.jsx(n.code,{children:"/hbase/oldWALs/"})," is using more space than you expect, remember that WALs are saved when replication is disabled, as long as there are peers."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Do not"})," manage WALs manually via HDFS."]}),`
`,e.jsx(n.h2,{id:"troubleshooting-network",children:"Network"}),`
`,e.jsx(n.h3,{id:"network-spikes",children:"Network Spikes"}),`
`,e.jsxs(n.p,{children:["If you are seeing periodic network spikes you might want to check the ",e.jsx(n.code,{children:"compactionQueues"})," to see if major compactions are happening."]}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/configuration/important#managed-compactions",children:"Managed Compactions"})," for more information on managing compactions."]}),`
`,e.jsx(n.h3,{id:"loopback-ip",children:"Loopback IP"}),`
`,e.jsx(n.p,{children:"HBase expects the loopback IP Address to be 127.0.0.1."}),`
`,e.jsx(n.h3,{id:"troubleshooting-network-interfaces",children:"Network Interfaces"}),`
`,e.jsxs(n.p,{children:["Are all the network interfaces functioning correctly? Are you sure? See the Troubleshooting Case Study in ",e.jsx(n.a,{href:"/docs/troubleshooting#troubleshooting-case-studies",children:"Case Studies"}),"."]}),`
`,e.jsx(n.h2,{id:"troubleshooting-regionserver",children:"RegionServer"}),`
`,e.jsxs(n.p,{children:["For more information on the RegionServers, see ",e.jsx(n.a,{href:"/docs/architecture/regionserver",children:"RegionServer"}),"."]}),`
`,e.jsx(n.h3,{id:"startup-errors",children:"Startup Errors"}),`
`,e.jsx(n.h4,{id:"master-starts-but-regionservers-do-not-toc",children:"Master Starts, But RegionServers Do Not"}),`
`,e.jsx(n.p,{children:"The Master believes the RegionServers have the IP of 127.0.0.1 - which is localhost and resolves to the master's own localhost."}),`
`,e.jsx(n.p,{children:"The RegionServers are erroneously informing the Master that their IP addresses are 127.0.0.1."}),`
`,e.jsxs(n.p,{children:["Modify ",e.jsx(n.em,{children:"/etc/hosts"})," on the region servers, from..."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"# Do not remove the following line, or various programs"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"# that require network functionality will fail."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"127.0.0.1               fully.qualified.regionservername regionservername  localhost.localdomain localhost"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"::1             localhost6.localdomain6 localhost6"})})]})})}),`
`,e.jsx(n.p,{children:"... to (removing the master node's name from localhost)..."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"# Do not remove the following line, or various programs"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"# that require network functionality will fail."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"127.0.0.1               localhost.localdomain localhost"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"::1             localhost6.localdomain6 localhost6"})})]})})}),`
`,e.jsx(n.h4,{id:"compression-link-errors-toc",children:"Compression Link Errors"}),`
`,e.jsx(n.p,{children:"Since compression algorithms such as LZO need to be installed and configured on each cluster this is a frequent source of startup error. If you see messages like this..."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"11/02/20 01:32:15 ERROR lzo.GPLNativeCodeLoader: Could not load native gpl library"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"java.lang.UnsatisfiedLinkError: no gplcompression in java.library.path"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at java.lang.ClassLoader.loadLibrary(ClassLoader.java:1734)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at java.lang.Runtime.loadLibrary0(Runtime.java:823)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at java.lang.System.loadLibrary(System.java:1028)"})})]})})}),`
`,e.jsxs(n.p,{children:["... then there is a path issue with the compression libraries. See the Configuration section on ",e.jsx(n.a,{href:"/docs/compression#configure-hbase-for-compressors",children:"LZO compression configuration"}),"."]}),`
`,e.jsx(n.h4,{id:"regionserver-aborts-due-to-lack-of-hsync-for-filesystem-toc",children:"RegionServer aborts due to lack of hsync for filesystem"}),`
`,e.jsx(n.p,{children:"In order to provide data durability for writes to the cluster HBase relies on the ability to durably save state in a write ahead log. When using a version of Apache Hadoop Common's filesystem API that supports checking on the availability of needed calls, HBase will proactively abort the cluster if it finds it can't operate safely."}),`
`,e.jsx(n.p,{children:"For RegionServer roles, the failure will show up in logs like this:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"2018-04-05 11:36:22,785 ERROR [regionserver/192.168.1.123:16020] wal.AsyncFSWALProvider: The RegionServer async write ahead log provider relies on the ability to call hflush and hsync for proper operation during component failures, but the current FileSystem does not support doing so. Please check the config value of 'hbase.wal.dir' and ensure it points to a FileSystem mount that has suitable capabilities for output streams."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"2018-04-05 11:36:22,799 ERROR [regionserver/192.168.1.123:16020] regionserver.HRegionServer: ***** ABORTING region server 192.168.1.123,16020,1522946074234: Unhandled: cannot get log writer *****"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"java.io.IOException: cannot get log writer"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.wal.AsyncFSWALProvider.createAsyncWriter(AsyncFSWALProvider.java:112)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.regionserver.wal.AsyncFSWAL.createWriterInstance(AsyncFSWAL.java:612)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.regionserver.wal.AsyncFSWAL.createWriterInstance(AsyncFSWAL.java:124)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.regionserver.wal.AbstractFSWAL.rollWriter(AbstractFSWAL.java:759)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.regionserver.wal.AbstractFSWAL.rollWriter(AbstractFSWAL.java:489)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.regionserver.wal.AsyncFSWAL.<init>(AsyncFSWAL.java:251)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.wal.AsyncFSWALProvider.createWAL(AsyncFSWALProvider.java:69)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.wal.AsyncFSWALProvider.createWAL(AsyncFSWALProvider.java:44)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.wal.AbstractFSWALProvider.getWAL(AbstractFSWALProvider.java:138)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.wal.AbstractFSWALProvider.getWAL(AbstractFSWALProvider.java:57)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.wal.WALFactory.getWAL(WALFactory.java:252)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.regionserver.HRegionServer.getWAL(HRegionServer.java:2105)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.regionserver.HRegionServer.buildServerLoad(HRegionServer.java:1326)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.regionserver.HRegionServer.tryRegionServerReport(HRegionServer.java:1191)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.regionserver.HRegionServer.run(HRegionServer.java:1007)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at java.lang.Thread.run(Thread.java:745)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Caused by: org.apache.hadoop.hbase.util.CommonFSUtils$StreamLacksCapabilityException: hflush and hsync"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.io.asyncfs.AsyncFSOutputHelper.createOutput(AsyncFSOutputHelper.java:69)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.regionserver.wal.AsyncProtobufLogWriter.initOutput(AsyncProtobufLogWriter.java:168)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.regionserver.wal.AbstractProtobufLogWriter.init(AbstractProtobufLogWriter.java:167)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.wal.AsyncFSWALProvider.createAsyncWriter(AsyncFSWALProvider.java:99)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        ... 15 more"})})]})})}),`
`,e.jsxs(n.p,{children:["If you are attempting to run in standalone mode and see this error, please walk back through the section ",e.jsx(n.a,{href:"/docs/getting-started#quick-start---standalone-hbase",children:"Quick Start - Standalone HBase"})," and ensure you have included ",e.jsx(n.strong,{children:"all"})," the given configuration settings."]}),`
`,e.jsx(n.h4,{id:"regionserver-aborts-due-to-can-not-initialize-access-to-hdfs-toc",children:"RegionServer aborts due to can not initialize access to HDFS"}),`
`,e.jsxs(n.p,{children:["We will try to use ",e.jsx(n.em,{children:"AsyncFSWAL"})," for HBase-2.x as it has better performance while consuming less resources. But the problem for ",e.jsx(n.em,{children:"AsyncFSWAL"})," is that it hacks into the internal of the DFSClient implementation, so it will easily be broken when upgrading hadoop, even for a simple patch release."]}),`
`,e.jsxs(n.p,{children:["If you do not specify the wal provider, we will try to fall back to the old ",e.jsx(n.em,{children:"FSHLog"})," if we fail to initialize ",e.jsx(n.em,{children:"AsyncFSWAL"}),", but it may not always work. The failure will show up in logs like this:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"18/07/02 18:51:06 WARN concurrent.DefaultPromise: An exception was"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"thrown by org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputHelper$13.operationComplete()"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"java.lang.Error: Couldn't properly initialize access to HDFS"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"internals. Please update your WAL Provider to not make use of the"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"'asyncfs' provider. See HBASE-16110 for more information."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputSaslHelper.<clinit>(FanOutOneBlockAsyncDFSOutputSaslHelper.java:268)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputHelper.initialize(FanOutOneBlockAsyncDFSOutputHelper.java:661)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputHelper.access$300(FanOutOneBlockAsyncDFSOutputHelper.java:118)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputHelper$13.operationComplete(FanOutOneBlockAsyncDFSOutputHelper.java:720)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputHelper$13.operationComplete(FanOutOneBlockAsyncDFSOutputHelper.java:715)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.util.concurrent.DefaultPromise.notifyListener0(DefaultPromise.java:507)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.util.concurrent.DefaultPromise.notifyListeners0(DefaultPromise.java:500)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.util.concurrent.DefaultPromise.notifyListenersNow(DefaultPromise.java:479)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.util.concurrent.DefaultPromise.notifyListeners(DefaultPromise.java:420)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.util.concurrent.DefaultPromise.trySuccess(DefaultPromise.java:104)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.channel.DefaultChannelPromise.trySuccess(DefaultChannelPromise.java:82)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.channel.epoll.AbstractEpollChannel$AbstractEpollUnsafe.fulfillConnectPromise(AbstractEpollChannel.java:638)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.channel.epoll.AbstractEpollChannel$AbstractEpollUnsafe.finishConnect(AbstractEpollChannel.java:676)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.channel.epoll.AbstractEpollChannel$AbstractEpollUnsafe.epollOutReady(AbstractEpollChannel.java:552)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.channel.epoll.EpollEventLoop.processReady(EpollEventLoop.java:394)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:304)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:858)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hbase.thirdparty.io.netty.util.concurrent.DefaultThreadFactory$DefaultRunnableDecorator.run(DefaultThreadFactory.java:138)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at java.lang.Thread.run(Thread.java:748)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:" Caused by: java.lang.NoSuchMethodException:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"org.apache.hadoop.hdfs.DFSClient.decryptEncryptedDataEncryptionKey(org.apache.hadoop.fs.FileEncryptionInfo)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at java.lang.Class.getDeclaredMethod(Class.java:2130)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputSaslHelper.createTransparentCryptoHelper(FanOutOneBlockAsyncDFSOutputSaslHelper.java:232)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     at org.apache.hadoop.hbase.io.asyncfs.FanOutOneBlockAsyncDFSOutputSaslHelper.<clinit>(FanOutOneBlockAsyncDFSOutputSaslHelper.java:262)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"     ... 18 more"})})]})})}),`
`,e.jsxs(n.p,{children:["If you hit this error, please specify ",e.jsx(n.em,{children:"FSHLog"}),", i.e, ",e.jsx(n.em,{children:"filesystem"}),", explicitly in your config file."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.wal.provider</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">filesystem</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsxs(n.p,{children:["And do not forget to send an email to the ",e.jsx(n.code,{children:"user@hbase.apache.org"})," or ",e.jsx(n.code,{children:"dev@hbase.apache.org"})," to report the failure and also your hadoop version, we will try to fix the problem ASAP in the next release."]}),`
`,e.jsx(n.h3,{id:"runtime-errors",children:"Runtime Errors"}),`
`,e.jsx(n.h4,{id:"regionserver-hanging-toc",children:"RegionServer Hanging"}),`
`,e.jsxs(n.p,{children:["Are you running an old JVM (",e.jsx(n.code,{children:"< "}),"1.6.0",e.jsxs(n.em,{children:["u21?)? When you look at a thread dump, does it look like threads are BLOCKED but no one holds the lock all are blocked on? See ",e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HBASE-3622",children:"HBASE 3622 Deadlock in HBaseServer (JVM bug?)"}),". Adding ",e.jsx(n.code,{children:"-XX:+UseMembar"})," to the HBase ",e.jsx(n.code,{children:"HBASE_OPTS"})," in _conf/hbase-env.sh"]})," may fix it."]}),`
`,e.jsx(n.h4,{id:"javaioioexceptiontoo-many-open-files-toc",children:"java.io.IOException...(Too many open files)"}),`
`,e.jsx(n.p,{children:"If you see log messages like this..."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"2010-09-13 01:24:17,336 WARN org.apache.hadoop.hdfs.server.datanode.DataNode:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Disk-related IOException in BlockReceiver constructor. Cause is java.io.IOException: Too many open files"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at java.io.UnixFileSystem.createFileExclusively(Native Method)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at java.io.File.createNewFile(File.java:883)"})})]})})}),`
`,e.jsxs(n.p,{children:["... see the Getting Started section on ",e.jsx(n.a,{href:"/docs/configuration/basic-prerequisites#example-ulimit-settings-on-ubuntu-toc",children:"ulimit and nproc configuration"}),"."]}),`
`,e.jsx(n.h4,{id:"xceivercount-258-exceeds-the-limit-of-concurrent-xcievers-256-toc",children:"xceiverCount 258 exceeds the limit of concurrent xcievers 256"}),`
`,e.jsx(n.p,{children:"This typically shows up in the DataNode logs."}),`
`,e.jsx(n.p,{children:`TODO: add link.
See the Getting Started section on xceivers configuration.`}),`
`,e.jsx(n.h4,{id:"system-instability-and-the-presence-of-javalangoutofmemoryerror-unable-to-createnew-native-thread-in-exceptions-hdfs-datanode-logs-or-that-of-any-system-daemon-toc",children:'System instability, and the presence of "java.lang.OutOfMemoryError: unable to createnew native thread in exceptions" HDFS DataNode logs or that of any system daemon'}),`
`,e.jsx(n.p,{children:"See the Getting Started section on ulimit and nproc configuration. The default on recent Linux distributions is 1024 - which is far too low for HBase."}),`
`,e.jsx(n.h4,{id:"dfs-instability-andor-regionserver-lease-timeouts-toc",children:"DFS instability and/or RegionServer lease timeouts"}),`
`,e.jsx(n.p,{children:"If you see warning messages like this..."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"2009-02-24 10:01:33,516 WARN org.apache.hadoop.hbase.util.Sleeper: We slept xxx ms, ten times longer than scheduled: 10000"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"2009-02-24 10:01:33,516 WARN org.apache.hadoop.hbase.util.Sleeper: We slept xxx ms, ten times longer than scheduled: 15000"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"2009-02-24 10:01:36,472 WARN org.apache.hadoop.hbase.regionserver.HRegionServer: unable to report to master for xxx milliseconds - retrying"})})]})})}),`
`,e.jsx(n.p,{children:"... or see full GC compactions then you may be experiencing full GC's."}),`
`,e.jsx(n.h4,{id:"no-live-nodes-contain-current-block-andor-youaredeadexception-toc",children:'"No live nodes contain current block" and/or YouAreDeadException'}),`
`,e.jsx(n.p,{children:"These errors can happen either when running out of OS file handles or in periods of severe network problems where the nodes are unreachable."}),`
`,e.jsx(n.p,{children:"See the Getting Started section on ulimit and nproc configuration and check your network."}),`
`,e.jsx(n.h4,{id:"zookeeper-sessionexpired-events-toc",children:"ZooKeeper SessionExpired events"}),`
`,e.jsx(n.p,{children:"Master or RegionServers shutting down with messages like those in the logs:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"WARN org.apache.zookeeper.ClientCnxn: Exception"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"closing session 0x278bd16a96000f to sun.nio.ch.SelectionKeyImpl@355811ec"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"java.io.IOException: TIMED OUT"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.zookeeper.ClientCnxn$SendThread.run(ClientCnxn.java:906)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"WARN org.apache.hadoop.hbase.util.Sleeper: We slept 79410ms, ten times longer than scheduled: 5000"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"INFO org.apache.zookeeper.ClientCnxn: Attempting connection to server hostname/IP:PORT"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"INFO org.apache.zookeeper.ClientCnxn: Priming connection to java.nio.channels.SocketChannel[connected local=/IP:PORT remote=hostname/IP:PORT]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"INFO org.apache.zookeeper.ClientCnxn: Server connection successful"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"WARN org.apache.zookeeper.ClientCnxn: Exception closing session 0x278bd16a96000d to sun.nio.ch.SelectionKeyImpl@3544d65e"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"java.io.IOException: Session Expired"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.zookeeper.ClientCnxn$SendThread.readConnectResult(ClientCnxn.java:589)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.zookeeper.ClientCnxn$SendThread.doIO(ClientCnxn.java:709)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"       at org.apache.zookeeper.ClientCnxn$SendThread.run(ClientCnxn.java:945)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"ERROR org.apache.hadoop.hbase.regionserver.HRegionServer: ZooKeeper session expired"})})]})})}),`
`,e.jsx(n.p,{children:`The JVM is doing a long running garbage collecting which is pausing every threads (aka "stop the world"). Since the RegionServer's local ZooKeeper client cannot send heartbeats, the session times out. By design, we shut down any node that isn't able to contact the ZooKeeper ensemble after getting a timeout so that it stops serving data that may already be assigned elsewhere.`}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Make sure you give plenty of RAM (in ",e.jsx(n.em,{children:"hbase-env.sh"}),"), the default of 1GB won't be able to sustain long running imports."]}),`
`,e.jsx(n.li,{children:"Make sure you don't swap, the JVM never behaves well under swapping."}),`
`,e.jsx(n.li,{children:"Make sure you are not CPU starving the RegionServer thread. For example, if you are running a MapReduce job using 6 CPU-intensive tasks on a machine with 4 cores, you are probably starving the RegionServer enough to create longer garbage collection pauses."}),`
`,e.jsx(n.li,{children:"Increase the ZooKeeper session timeout"}),`
`]}),`
`,e.jsxs(n.p,{children:["If you wish to increase the session timeout, add the following to your ",e.jsx(n.em,{children:"hbase-site.xml"})," to increase the timeout from the default of 60 seconds to 120 seconds."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">zookeeper.session.timeout</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">120000</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.zookeeper.property.tickTime</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">6000</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(n.p,{children:"Be aware that setting a higher timeout means that the regions served by a failed RegionServer will take at least that amount of time to be transferred to another RegionServer. For a production system serving live requests, we would instead recommend setting it lower than 1 minute and over-provision your cluster in order the lower the memory load on each machines (hence having less garbage to collect per machine)."}),`
`,e.jsx(n.p,{children:"If this is happening during an upload which only happens once (like initially loading all your data into HBase), consider bulk loading."}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/troubleshooting#zookeeper-the-cluster-canary",children:"ZooKeeper, The Cluster Canary"})," for other general information about ZooKeeper troubleshooting."]}),`
`,e.jsx(n.h4,{id:"notservingregionexception-toc",children:"NotServingRegionException"}),`
`,e.jsxs(n.p,{children:['This exception is "normal" when found in the RegionServer logs at DEBUG level. This exception is returned back to the client and then the client goes back to ',e.jsx(n.code,{children:"hbase:meta"})," to find the new location of the moved region."]}),`
`,e.jsx(n.p,{children:"However, if the NotServingRegionException is logged ERROR, then the client ran out of retries and something probably wrong."}),`
`,e.jsx(n.h4,{id:"logs-flooded-with-2011-01-10-124048407-info-orgapachehadoopiocompresscodecpool-gotbrand-new-compressor-messages-toc",children:"Logs flooded with '2011-01-10 12:40:48,407 INFO org.apache.hadoop.io.compress.CodecPool: Gotbrand-new compressor' messages"}),`
`,e.jsxs(n.p,{children:["We are not using the native versions of compression libraries. See ",e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HBASE-1900",children:"HBASE-1900 Put back native support when hadoop 0.21 is released"}),". Copy the native libs from hadoop under HBase lib dir or symlink them into place and the message should go away."]}),`
`,e.jsx(n.h4,{id:"server-handler-x-on-60020-caught-javaniochannelsclosedchannelexception-toc",children:"Server handler X on 60020 caught: java.nio.channels.ClosedChannelException"}),`
`,e.jsx(n.p,{children:"If you see this type of message it means that the region server was trying to read/send data from/to a client but it already went away. Typical causes for this are if the client was killed (you see a storm of messages like this when a MapReduce job is killed or fails) or if the client receives a SocketTimeoutException. It's harmless, but you should consider digging in a bit more if you aren't doing something to trigger them."}),`
`,e.jsx(n.h3,{id:"snapshot-errors-due-to-reverse-dns",children:"Snapshot Errors Due to Reverse DNS"}),`
`,e.jsx(n.p,{children:"Several operations within HBase, including snapshots, rely on properly configured reverse DNS. Some environments, such as Amazon EC2, have trouble with reverse DNS. If you see errors like the following on your RegionServers, check your reverse DNS configuration:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"2013-05-01 00:04:56,356 DEBUG org.apache.hadoop.hbase.procedure.Subprocedure: Subprocedure 'backup1'"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"coordinator notified of 'acquire', waiting on 'reached' or 'abort' from coordinator."})})]})})}),`
`,e.jsx(n.p,{children:"In general, the hostname reported by the RegionServer needs to be the same as the hostname the Master is trying to reach. You can see a hostname mismatch by looking for the following type of message in the RegionServer's logs at start-up."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"2013-05-01 00:03:00,614 INFO org.apache.hadoop.hbase.regionserver.HRegionServer: Master passed us hostname"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"to use. Was=myhost-1234, Now=ip-10-55-88-99.ec2.internal"})})]})})}),`
`,e.jsx(n.h3,{id:"shutdown-errors",children:"Shutdown Errors"}),`
`,e.jsx(n.h2,{id:"troubleshooting-master",children:"Master"}),`
`,e.jsxs(n.p,{children:["For more information on the Master, see ",e.jsx(n.a,{href:"/docs/architecture/master",children:"master"}),"."]}),`
`,e.jsx(n.h3,{id:"startup-errors-1",children:"Startup Errors"}),`
`,e.jsx(n.h4,{id:"master-says-that-you-need-to-run-the-hbase-migrations-script-toc",children:"Master says that you need to run the HBase migrations script"}),`
`,e.jsx(n.p,{children:"Upon running that, the HBase migrations script says no files in root directory."}),`
`,e.jsx(n.p,{children:"HBase expects the root directory to either not exist, or to have already been initialized by HBase running a previous time. If you create a new directory for HBase using Hadoop DFS, this error will occur. Make sure the HBase root directory does not currently exist or has been initialized by a previous run of HBase. Sure fire solution is to just use Hadoop dfs to delete the HBase root and let HBase create and initialize the directory itself."}),`
`,e.jsx(n.h4,{id:"packet-len6080218-is-out-of-range-toc",children:"Packet len6080218 is out of range!"}),`
`,e.jsxs(n.p,{children:["If you have many regions on your cluster and you see an error like that reported above in this sections title in your logs, see ",e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HBASE-4246",children:"HBASE-4246 Cluster with too many regions cannot withstand some master failover scenarios"}),"."]}),`
`,e.jsx(n.h4,{id:"master-fails-to-become-active-due-to-lack-of-hsync-for-filesystem-toc",children:"Master fails to become active due to lack of hsync for filesystem"}),`
`,e.jsx(n.p,{children:"HBase's internal framework for cluster operations requires the ability to durably save state in a write ahead log. When using a version of Apache Hadoop Common's filesystem API that supports checking on the availability of needed calls, HBase will proactively abort the cluster if it finds it can't operate safely."}),`
`,e.jsx(n.p,{children:"For Master roles, the failure will show up in logs like this:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"2018-04-05 11:18:44,653 ERROR [Thread-21] master.HMaster: Failed to become active master"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"java.lang.IllegalStateException: The procedure WAL relies on the ability to hsync for proper operation during component failures, but the underlying filesystem does not support doing so. Please check the config value of 'hbase.procedure.store.wal.use.hsync' to set the desired level of robustness and ensure the config value of 'hbase.wal.dir' points to a FileSystem mount that can provide it."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.procedure2.store.wal.WALProcedureStore.rollWriter(WALProcedureStore.java:1034)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.procedure2.store.wal.WALProcedureStore.recoverLease(WALProcedureStore.java:374)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.procedure2.ProcedureExecutor.start(ProcedureExecutor.java:530)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.master.HMaster.startProcedureExecutor(HMaster.java:1267)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.master.HMaster.startServiceThreads(HMaster.java:1173)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.master.HMaster.finishActiveMasterInitialization(HMaster.java:881)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.master.HMaster.startActiveMasterManager(HMaster.java:2048)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at org.apache.hadoop.hbase.master.HMaster.lambda$run$0(HMaster.java:568)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"        at java.lang.Thread.run(Thread.java:745)"})})]})})}),`
`,e.jsxs(n.p,{children:["If you are attempting to run in standalone mode and see this error, please walk back through the section ",e.jsx(n.a,{href:"/docs/getting-started#quick-start---standalone-hbase",children:"Quick Start - Standalone HBase"})," and ensure you have included ",e.jsx(n.strong,{children:"all"})," the given configuration settings."]}),`
`,e.jsx(n.h3,{id:"shutdown-errors-1",children:"Shutdown Errors"}),`
`,e.jsx(n.h2,{id:"troubleshooting-zookeeper",children:"ZooKeeper"}),`
`,e.jsx(n.h3,{id:"startup-errors-2",children:"Startup Errors"}),`
`,e.jsx(n.h4,{id:"could-not-find-my-address-xyz-in-list-of-zookeeper-quorum-servers-toc",children:"Could not find my address: xyz in list of ZooKeeper quorum servers"}),`
`,e.jsx(n.p,{children:"A ZooKeeper server wasn't able to start, throws that error. xyz is the name of your server."}),`
`,e.jsxs(n.p,{children:["This is a name lookup problem. HBase tries to start a ZooKeeper server on some machine but that machine isn't able to find itself in the ",e.jsx(n.code,{children:"hbase.zookeeper.quorum"})," configuration."]}),`
`,e.jsxs(n.p,{children:["Use the hostname presented in the error message instead of the value you used. If you have a DNS server, you can set ",e.jsx(n.code,{children:"hbase.zookeeper.dns.interface"})," and ",e.jsx(n.code,{children:"hbase.zookeeper.dns.nameserver"})," in ",e.jsx(n.em,{children:"hbase-site.xml"})," to make sure it resolves to the correct FQDN."]}),`
`,e.jsx(n.h3,{id:"zookeeper-the-cluster-canary",children:"ZooKeeper, The Cluster Canary"}),`
`,e.jsx(n.p,{children:`ZooKeeper is the cluster's "canary in the mineshaft". It'll be the first to notice issues if any so making sure its happy is the short-cut to a humming cluster.`}),`
`,e.jsxs(n.p,{children:["See the ",e.jsx(n.a,{href:"https://cwiki.apache.org/confluence/display/HADOOP2/ZooKeeper+Troubleshooting",children:"ZooKeeper Operating Environment Troubleshooting"})," page. It has suggestions and tools for checking disk and networking performance; i.e. the operating environment your ZooKeeper and HBase are running in."]}),`
`,e.jsxs(n.p,{children:["Additionally, the utility ",e.jsx(n.a,{href:"/docs/troubleshooting#zkcli",children:"zkcli"})," may help investigate ZooKeeper issues."]}),`
`,e.jsx(n.h2,{id:"troubleshooting-amazon-ec2",children:"Amazon EC2"}),`
`,e.jsx(n.h3,{id:"zookeeper-does-not-seem-to-work-on-amazon-ec2",children:"ZooKeeper does not seem to work on Amazon EC2"}),`
`,e.jsx(n.p,{children:"HBase does not start when deployed as Amazon EC2 instances. Exceptions like the below appear in the Master and/or RegionServer logs:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  2009-10-19 11:52:27,030 INFO org.apache.zookeeper.ClientCnxn: Attempting"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  connection to server ec2-174-129-15-236.compute-1.amazonaws.com/10.244.9.171:2181"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  2009-10-19 11:52:27,032 WARN org.apache.zookeeper.ClientCnxn: Exception"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  closing session 0x0 to sun.nio.ch.SelectionKeyImpl@656dc861"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  java.net.ConnectException: Connection refused"})})]})})}),`
`,e.jsx(n.p,{children:"Security group policy is blocking the ZooKeeper port on a public address. Use the internal EC2 host names when configuring the ZooKeeper quorum peer list."}),`
`,e.jsx(n.h3,{id:"instability-on-amazon-ec2",children:"Instability on Amazon EC2"}),`
`,e.jsx(n.p,{children:"Questions on HBase and Amazon EC2 come up frequently on the HBase dist-list."}),`
`,e.jsx(n.h3,{id:"remote-java-connection-into-ec2-cluster-not-working",children:"Remote Java Connection into EC2 Cluster Not Working"}),`
`,e.jsxs(n.p,{children:["See Andrew's answer here, up on the user list: ",e.jsx(n.a,{href:"https://lists.apache.org/thread.html/666bfa863bc2eb2ec7bbe5ecfbee345e0cbf1d58aaa6c1636dfcb527%401269010842%40%3Cuser.hbase.apache.org%3E",children:"Remote Java client connection into EC2 instance"}),"."]}),`
`,e.jsx(n.h2,{id:"hbase-and-hadoop-version-issues",children:"HBase and Hadoop version issues"}),`
`,e.jsx(n.h3,{id:"cannot-communicate-with-client-version",children:"...cannot communicate with client version..."}),`
`,e.jsxs(n.p,{children:["If you see something like the following in your logs ... 2012-09-24 10:20:52,168 FATAL org.apache.hadoop.hbase.master.HMaster: Unhandled exception. Starting shutdown. org.apache.hadoop.ipc.RemoteException: Server IPC version 7 cannot communicate with client version 4 ... ...are you trying to talk to an Hadoop 2.0.x from an HBase that has an Hadoop 1.0.x client? Use the HBase built against Hadoop 2.0 or rebuild your HBase passing the -Dhadoop.profile=2.0 attribute to Maven (See ",e.jsx(n.a,{href:"/docs/building-and-developing/building#building-against-various-hadoop-versions",children:"Building against various Hadoop versions"})," for more)."]}),`
`,e.jsx(n.h2,{id:"hbase-and-hdfs",children:"HBase and HDFS"}),`
`,e.jsxs(n.p,{children:["General configuration guidance for Apache HDFS is out of the scope of this guide. Refer to the documentation available at ",e.jsx(n.a,{href:"https://hadoop.apache.org/",children:"https://hadoop.apache.org/"})," for extensive information about configuring HDFS. This section deals with HDFS in terms of HBase."]}),`
`,e.jsx(n.p,{children:"In most cases, HBase stores its data in Apache HDFS. This includes the HFiles containing the data, as well as the write-ahead logs (WALs) which store data before it is written to the HFiles and protect against RegionServer crashes. HDFS provides reliability and protection to data in HBase because it is distributed. To operate with the most efficiency, HBase needs data to be available locally. Therefore, it is a good practice to run an HDFS DataNode on each RegionServer."}),`
`,e.jsx(n.h3,{id:"important-information-and-guidelines-for-hbase-and-hdfs",children:"Important Information and Guidelines for HBase and HDFS"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"HBase is a client of HDFS."}),e.jsx(n.br,{}),`
`,"HBase is an HDFS client, using the HDFS ",e.jsx(n.code,{children:"DFSClient"})," class, and references to this class appear in HBase logs with other HDFS client log messages."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Configuration is necessary in multiple places."}),e.jsx(n.br,{}),`
`,"Some HDFS configurations relating to HBase need to be done at the HDFS (server) side. Others must be done within HBase (at the client side). Other settings need to be set at both the server and client side."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Write errors which affect HBase may be logged in the HDFS logs rather than HBase logs."}),e.jsx(n.br,{}),`
`,"When writing, HDFS pipelines communications from one DataNode to another. HBase communicates to both the HDFS NameNode and DataNode, using the HDFS client classes. Communication problems between DataNodes are logged in the HDFS logs, not the HBase logs."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"HBase communicates with HDFS using two different ports."}),e.jsx(n.br,{}),`
`,"HBase communicates with DataNodes using the ",e.jsx(n.code,{children:"ipc.Client"})," interface and the ",e.jsx(n.code,{children:"DataNode"})," class. References to these will appear in HBase logs. Each of these communication channels use a different port (50010 and 50020 by default). The ports are configured in the HDFS configuration, via the ",e.jsx(n.code,{children:"dfs.datanode.address"})," and ",e.jsx(n.code,{children:"dfs.datanode.ipc.address"})," parameters."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Errors may be logged in HBase, HDFS, or both."}),e.jsx(n.br,{}),`
`,"When troubleshooting HDFS issues in HBase, check logs in both places for errors."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"HDFS takes a while to mark a node as dead. You can configure HDFS to avoid using stale DataNodes."}),e.jsx(n.br,{}),`
`,"By default, HDFS does not mark a node as dead until it is unreachable for 630 seconds. In Hadoop 1.1 and Hadoop 2.x, this can be alleviated by enabling checks for stale DataNodes, though this check is disabled by default. You can enable the check for reads and writes separately, via ",e.jsx(n.code,{children:"dfs.namenode.avoid.read.stale.datanode"})," and ",e.jsx(n.code,{children:"dfs.namenode.avoid.write.stale.datanode settings"}),". A stale DataNode is one that has not been reachable for ",e.jsx(n.code,{children:"dfs.namenode.stale.datanode.interval"})," (default is 30 seconds). Stale datanodes are avoided, and marked as the last possible target for a read or write operation. For configuration details, see the HDFS documentation."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Settings for HDFS retries and timeouts are important to HBase."}),e.jsx(n.br,{}),`
`,"You can configure settings for various retries and timeouts. Always refer to the HDFS documentation for current recommendations and defaults. Some of the settings important to HBase are listed here. Defaults are current as of Hadoop 2.3. Check the Hadoop documentation for the most current values and recommendations."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"The HBase Balancer and HDFS Balancer are incompatible"}),e.jsx(n.br,{}),`
`,"The HDFS balancer attempts to spread HDFS blocks evenly among DataNodes. HBase relies on compactions to restore locality after a region split or failure. These two types of balancing do not work well together."]}),`
`,e.jsx(n.p,{children:"In the past, the generally accepted advice was to turn off the HDFS load balancer and rely on the HBase balancer, since the HDFS balancer would degrade locality. This advice is still valid if your HDFS version is lower than 2.7.1."}),`
`,e.jsxs(n.p,{children:[e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HDFS-6133",children:"HDFS-6133"})," provides the ability to exclude favored-nodes (pinned) blocks from the HDFS load balancer, by setting the ",e.jsx(n.code,{children:"dfs.datanode.block-pinning.enabled"})," property to ",e.jsx(n.code,{children:"true"})," in the HDFS service configuration."]}),`
`,e.jsxs(n.p,{children:["HBase can be enabled to use the HDFS favored-nodes feature by switching the HBase balancer class (conf: ",e.jsx(n.code,{children:"hbase.master.loadbalancer.class"}),") to ",e.jsx(n.code,{children:"org.apache.hadoop.hbase.favored.FavoredNodeLoadBalancer"})," which is documented ",e.jsx(n.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/favored/FavoredNodeLoadBalancer.html",children:"here"}),"."]}),`
`,e.jsx(s,{type:"info",children:e.jsx(n.p,{children:`HDFS-6133 is available in HDFS 2.7.0 and higher, but HBase does not support running on HDFS 2.7.0,
so you must be using HDFS 2.7.1 or higher to use this feature with HBase.`})}),`
`,e.jsx(n.h3,{id:"connection-timeouts",children:"Connection Timeouts"}),`
`,e.jsx(n.p,{children:"Connection timeouts occur between the client (HBASE) and the HDFS DataNode. They may occur when establishing a connection, attempting to read, or attempting to write. The two settings below are used in combination, and affect connections between the DFSClient and the DataNode, the ipc.cClient and the DataNode, and communication between two DataNodes."}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"dfs.client.socket-timeout"})," (default: 60000)",e.jsx(n.br,{}),`
`,"The amount of time before a client connection times out when establishing a connection or reading. The value is expressed in milliseconds, so the default is 60 seconds."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"dfs.datanode.socket.write.timeout"})," (default: 480000)",e.jsx(n.br,{}),`
`,"The amount of time before a write operation times out. The default is 8 minutes, expressed as milliseconds."]}),`
`,e.jsx(n.h3,{id:"typical-error-logs",children:"Typical Error Logs"}),`
`,e.jsx(n.p,{children:"The following types of errors are often seen in the logs."}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"INFO HDFS.DFSClient: Failed to connect to /xxx50010, add to deadNodes and continue java.net.SocketTimeoutException: 60000 millis timeout while waiting for channel to be ready for connect. ch : java.nio.channels.SocketChannel[connection-pending remote=/region-server-1:50010]"}),":: All DataNodes for a block are dead, and recovery is not possible. Here is the sequence of events that leads to this error:"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"INFO org.apache.hadoop.HDFS.DFSClient: Exception in createBlockOutputStream java.net.SocketTimeoutException: 69000 millis timeout while waiting for channel to be ready for connect. ch : java.nio.channels.SocketChannel[connection-pending remote=/ xxx:50010]"}),":: This type of error indicates a write issue. In this case, the master wants to split the log. It does not have a local DataNodes so it tries to connect to a remote DataNode, but the DataNode is dead."]}),`
`,e.jsx(n.h2,{id:"running-unit-or-integration-tests",children:"Running unit or integration tests"}),`
`,e.jsx(n.h3,{id:"runtime-exceptions-from-minidfscluster-when-running-tests",children:"Runtime exceptions from MiniDFSCluster when running tests"}),`
`,e.jsx(n.p,{children:"If you see something like the following"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"..."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"java.lang.NullPointerException: null"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"at org.apache.hadoop.hdfs.MiniDFSCluster.startDataNodes"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"at org.apache.hadoop.hdfs.MiniDFSCluster.<init>"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"at org.apache.hadoop.hbase.MiniHBaseCluster.<init>"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"at org.apache.hadoop.hbase.HBaseTestingUtility.startMiniDFSCluster"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"at org.apache.hadoop.hbase.HBaseTestingUtility.startMiniCluster"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"..."})})]})})}),`
`,e.jsx(n.p,{children:"or"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"..."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"java.io.IOException: Shutting down"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"at org.apache.hadoop.hbase.MiniHBaseCluster.init"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"at org.apache.hadoop.hbase.MiniHBaseCluster.<init>"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"at org.apache.hadoop.hbase.MiniHBaseCluster.<init>"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"at org.apache.hadoop.hbase.HBaseTestingUtility.startMiniHBaseCluster"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"at org.apache.hadoop.hbase.HBaseTestingUtility.startMiniCluster"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"..."})})]})})}),`
`,e.jsxs(n.p,{children:["... then try issuing the command umask 022 before launching tests. This is a workaround for ",e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HDFS-2556",children:"HDFS-2556"})]}),`
`,e.jsx(n.h2,{id:"troubleshooting-case-studies",children:"Case Studies"}),`
`,e.jsxs(n.p,{children:["For Performance and Troubleshooting Case Studies, see ",e.jsx(n.a,{href:"/docs/case-studies",children:"Apache HBase Case Studies"}),"."]}),`
`,e.jsx(n.h2,{id:"cryptographic-features",children:"Cryptographic Features"}),`
`,e.jsx(n.h3,{id:"sunsecuritypkcs11wrapperpkcs11exception-ckr_arguments_bad-toc",children:"sun.security.pkcs11.wrapper.PKCS11Exception: CKR_ARGUMENTS_BAD"}),`
`,e.jsx(n.p,{children:"This problem manifests as exceptions ultimately caused by:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Caused by: sun.security.pkcs11.wrapper.PKCS11Exception: CKR_ARGUMENTS_BAD"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  at sun.security.pkcs11.wrapper.PKCS11.C_DecryptUpdate(Native Method)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  at sun.security.pkcs11.P11Cipher.implDoFinal(P11Cipher.java:795)"})})]})})}),`
`,e.jsx(n.p,{children:"This problem appears to affect some versions of OpenJDK 7 shipped by some Linux vendors. NSS is configured as the default provider. If the host has an x86_64 architecture, depending on if the vendor packages contain the defect, the NSS provider will not function correctly."}),`
`,e.jsxs(n.p,{children:["To work around this problem, find the JRE home directory and edit the file ",e.jsx(n.em,{children:"lib/security/java.security"}),". Edit the file to comment out the line:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"security.provider.1=sun.security.pkcs11.SunPKCS11 ${java.home}/lib/security/nss.cfg"})})})})}),`
`,e.jsx(n.p,{children:"Then renumber the remaining providers accordingly."}),`
`,e.jsx(n.h2,{id:"operating-system-specific-issues",children:"Operating System Specific Issues"}),`
`,e.jsx(n.h3,{id:"page-allocation-failure-toc",children:"Page Allocation Failure"}),`
`,e.jsx(s,{type:"info",children:e.jsxs(n.p,{children:[`This issue is known to affect CentOS 6.2 and possibly CentOS 6.5. It may also affect some versions
of Red Hat Enterprise Linux, according to
`,e.jsx(n.a,{href:"https://bugzilla.redhat.com/show_bug.cgi?id=770545",children:"https://bugzilla.redhat.com/show_bug.cgi?id=770545"}),"."]})}),`
`,e.jsx(n.p,{children:"Some users have reported seeing the following error:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"kernel: java: page allocation failure. order:4, mode:0x20"})})})})}),`
`,e.jsxs(n.p,{children:["Raising the value of ",e.jsx(n.code,{children:"min_free_kbytes"})," was reported to fix this problem. This parameter is set to a percentage of the amount of RAM on your system, and is described in more detail at ",e.jsx(n.a,{href:"https://docs.kernel.org/admin-guide/sysctl/vm.html#min-free-kbytes",children:"https://docs.kernel.org/admin-guide/sysctl/vm.html#min-free-kbytes"}),"."]}),`
`,e.jsx(n.p,{children:"To find the current value on your system, run the following command:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[user@host]# cat /proc/sys/vm/min_free_kbytes"})})})})}),`
`,e.jsx(n.p,{children:"Next, raise the value. Try doubling, then quadrupling the value. Note that setting the value too low or too high could have detrimental effects on your system. Consult your operating system vendor for specific recommendations."}),`
`,e.jsxs(n.p,{children:["Use the following command to modify the value of ",e.jsx(n.code,{children:"min_free_kbytes"}),", substituting ",e.jsx(n.em,{children:"VALUE"})," with your intended value:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[user@host]# echo "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" >"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" /proc/sys/vm/min_free_kbytes"})]})})})}),`
`,e.jsx(n.h2,{id:"jdk-issues",children:"JDK Issues"}),`
`,e.jsx(n.h3,{id:"nosuchmethoderror-javautilconcurrentconcurrenthashmapkeyset-toc",children:"NoSuchMethodError: java.util.concurrent.ConcurrentHashMap.keySet"}),`
`,e.jsx(n.p,{children:"If you see this in your logs:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Caused by: java.lang.NoSuchMethodError: java.util.concurrent.ConcurrentHashMap.keySet()Ljava/util/concurrent/ConcurrentHashMap$KeySetView;"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  at org.apache.hadoop.hbase.master.ServerManager.findServerWithSameHostnamePortWithLock(ServerManager.java:393)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  at org.apache.hadoop.hbase.master.ServerManager.checkAndRecordNewServer(ServerManager.java:307)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  at org.apache.hadoop.hbase.master.ServerManager.regionServerStartup(ServerManager.java:244)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  at org.apache.hadoop.hbase.master.MasterRpcServices.regionServerStartup(MasterRpcServices.java:304)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  at org.apache.hadoop.hbase.protobuf.generated.RegionServerStatusProtos$RegionServerStatusService$2.callBlockingMethod(RegionServerStatusProtos.java:7910)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  at org.apache.hadoop.hbase.ipc.RpcServer.call(RpcServer.java:2020)"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  ... 4 more"})})]})})}),`
`,e.jsxs(n.p,{children:["then check if you compiled with jdk8 and tried to run it on jdk7. If so, this won't work. Run on jdk8 or recompile with jdk7. See ",e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HBASE-10607",children:"HBASE-10607 JDK8 NoSuchMethodError involving ConcurrentHashMap.keySet if running on JRE 7"}),"."]}),`
`,e.jsx(n.h3,{id:"full-gc-caused-by-mslab-when-using-g1-toc",children:"Full gc caused by mslab when using G1"}),`
`,e.jsx(n.p,{children:"The default size of chunk used by mslab is 2MB, when using G1, if heapRegionSize equals 4MB, these chunks are allocated as humongous objects, exclusively allocating one region, then the remaining 2MB become memory fragment."}),`
`,e.jsx(n.p,{children:"Lots of memory fragment may lead to full gc even if the percent of used heap not high enough."}),`
`,e.jsx(n.p,{children:"The G1HeapRegionSize calculated by initial_heap_size and max_heap_size, here are some cases for better understand:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"xmx=10G -> region size 2M"}),`
`,e.jsx(n.li,{children:"xms=10G, xmx=10G -> region size 4M"}),`
`,e.jsx(n.li,{children:"xmx=20G -> region size 4M"}),`
`,e.jsx(n.li,{children:"xms=20G, xmx=20G -> region size 8M"}),`
`,e.jsx(n.li,{children:"xmx=30G -> region size 4M"}),`
`,e.jsx(n.li,{children:"xmx=32G -> region size 8M"}),`
`]}),`
`,e.jsx(n.p,{children:"You can avoid this problem by reducing the chunk size a bit to 2047KB as below."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase.hregion.memstore.mslab.chunksize 2096128"})})})})})]})}function p(a={}){const{wrapper:n}=a.components||{};return n?e.jsx(n,{...a,children:e.jsx(t,{...a})}):t(a)}function i(a,n){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}export{r as _markdown,p as default,h as extractedReferences,l as frontmatter,c as structuredData,d as toc};
