import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let o=`Data comes in many sizes, and saving all of your data in HBase, including binary
data such as images and documents, is ideal. While HBase can technically handle
binary objects with cells that are larger than 100 KB in size, HBase's normal
read and write paths are optimized for values smaller than 100KB in size. When
HBase deals with large numbers of objects over this threshold, referred to here
as medium objects, or MOBs, performance is degraded due to write amplification
caused by splits and compactions. When using MOBs, ideally your objects will be between
100KB and 10MB (see the [faq](/docs/faq)). HBase 2 added special internal handling of MOBs
to maintain performance, consistency, and low operational overhead. MOB support is
provided by the work done in [HBASE-11339](https://issues.apache.org/jira/browse/HBASE-11339).
To take advantage of MOB, you need to use [HFile version 3](/docs/hfile-format#hbase-file-format-with-security-enhancements-version-3). Optionally,
configure the MOB file reader's cache settings for each RegionServer (see
[Configure the MOB Cache](/docs/architecture/hbase-mob#configuring-the-mob-cache)), then configure specific columns to hold MOB data.
Client code does not need to change to take advantage of HBase MOB support. The
feature is transparent to the client.

## Configuring Columns for MOB

You can configure columns to support MOB during table creation or alteration,
either in HBase Shell or via the Java API. The two relevant properties are the
boolean \`IS_MOB\` and the \`MOB_THRESHOLD\`, which is the number of bytes at which
an object is considered to be a MOB. Only \`IS_MOB\` is required. If you do not
specify the \`MOB_THRESHOLD\`, the default threshold value of 100 KB is used.

### Configure a Column for MOB Using HBase Shell

\`\`\`bash
hbase> create 't1', {NAME => 'f1', IS_MOB => true, MOB_THRESHOLD => 102400}
hbase> alter 't1', {NAME => 'f1', IS_MOB => true, MOB_THRESHOLD => 102400}
\`\`\`

### Configure a Column for MOB Using the Java API

\`\`\`java
...
HColumnDescriptor hcd = new HColumnDescriptor("f");
hcd.setMobEnabled(true);
...
hcd.setMobThreshold(102400L);
...
\`\`\`

## Testing MOB

The utility \`org.apache.hadoop.hbase.IntegrationTestIngestWithMOB\` is provided to assist with testing
the MOB feature. The utility is run as follows:

\`\`\`bash
$ sudo -u hbase hbase org.apache.hadoop.hbase.IntegrationTestIngestWithMOB \\
        -threshold 1024 \\
        -minMobDataSize 512 \\
        -maxMobDataSize 5120
\`\`\`

* **\`threshold\`** is the threshold at which cells are considered to be MOBs.
  The default is 1 kB, expressed in bytes.
* **\`minMobDataSize\`** is the minimum value for the size of MOB data.
  The default is 512 B, expressed in bytes.
* **\`maxMobDataSize\`** is the maximum value for the size of MOB data.
  The default is 5 kB, expressed in bytes.

## MOB architecture

This section is derived from information found in
[HBASE-11339](https://issues.apache.org/jira/browse/HBASE-11339), which covered the initial GA
implementation of MOB in HBase and
[HBASE-22749](https://issues.apache.org/jira/browse/HBASE-22749), which improved things by
parallelizing MOB maintenance across the RegionServers. For more information see
the last version of the design doc created during the initial work,
"[HBASE-11339 MOB GA design.pdf](https://github.com/apache/hbase/blob/master/dev-support/design-docs/HBASE-11339%20MOB%20GA%20design.pdf)",
and the design doc for the distributed mob compaction feature,
"[HBASE-22749 MOB distributed compaction.pdf](https://github.com/apache/hbase/blob/master/dev-support/design-docs/HBASE-22749%20MOB%20distributed%20compaction.pdf)".

### Overview

The MOB feature reduces the overall IO load for configured column families by storing values that
are larger than the configured threshold outside of the normal regions to avoid splits, merges, and
most importantly normal compactions.

When a cell is first written to a region it is stored in the WAL and memstore regardless of value
size. When memstores from a column family configured to use MOB are eventually flushed two hfiles
are written simultaneously. Cells with a value smaller than the threshold size are written to a
normal region hfile. Cells with a value larger than the threshold are written into a special MOB
hfile and also have a MOB reference cell written into the normal region HFile. As the Region Server
flushes a MOB enabled memstore and closes a given normal region HFile it appends metadata that lists
each of the special MOB hfiles referenced by the cells within.

MOB reference cells have the same key as the cell they are based on. The value of the reference cell
is made up of two pieces of metadata: the size of the actual value and the MOB hfile that contains
the original cell. In addition to any tags originally written to HBase, the reference cell prepends
two additional tags. The first is a marker tag that says the cell is a MOB reference. This can be
used later to scan specifically just for reference cells. The second stores the namespace and table
at the time the MOB hfile is written out. This tag is used to optimize how the MOB system finds
the underlying value in MOB hfiles after a series of HBase snapshot operations (ref HBASE-12332).
Note that tags are only available within HBase servers and by default are not sent over RPCs.

All MOB hfiles for a given table are managed within a logical region that does not directly serve
requests. When these MOB hfiles are created from a flush or MOB compaction they are placed in a
dedicated mob data area under the hbase root directory specific to the namespace, table, mob
logical region, and column family. In general that means a path structured like:

\`\`\`
%HBase Root Dir%/mobdir/data/%namespace%/%table%/%logical region%/%column family%/
\`\`\`

With default configs, an example table named 'some\\_table' in the
default namespace with a MOB enabled column family named 'foo' this HDFS directory would be

\`\`\`
/hbase/mobdir/data/default/some_table/372c1b27e3dc0b56c3a031926e5efbe9/foo/
\`\`\`

These MOB hfiles are maintained by special chores in the HBase Master and across the individual
Region Servers. Specifically those chores take care of enforcing TTLs and compacting them. Note that
this compaction is primarily a matter of controlling the total number of files in HDFS because our
operational assumptions for MOB data is that it will seldom update or delete.

When a given MOB hfile is no longer needed as a result of our compaction process then a chore in
the Master will take care of moving it to the archive just
like any normal hfile. Because the table's mob region is independent of all the normal regions it
can coexist with them in the regular archive storage area:

\`\`\`
/hbase/archive/data/default/some_table/372c1b27e3dc0b56c3a031926e5efbe9/foo/
\`\`\`

The same hfile cleaning chores that take care of eventually deleting unneeded archived files from
normal regions thus also will take care of these MOB hfiles. As such, if there is a snapshot of a
MOB enabled table then the cleaning system will make sure those MOB files stick around in the
archive area as long as they are needed by a snapshot or a clone of a snapshot.

### MOB compaction

Each time the memstore for a MOB enabled column family performs a flush HBase will write values over
the MOB threshold into MOB specific hfiles. When normal region compaction occurs the Region Server
rewrites the normal data files while maintaining references to these MOB files without rewriting
them. Normal client lookups for MOB values transparently will receive the original values because
the Region Server internals take care of using the reference data to then pull the value out of a
specific MOB file. This indirection means that building up a large number of MOB hfiles doesn't
impact the overall time to retrieve any specific MOB cell. Thus, we need not perform compactions of
the MOB hfiles nearly as often as normal hfiles. As a result, HBase saves IO by not rewriting MOB
hfiles as a part of the periodic compactions a Region Server does on its own.

However, if deletes and updates of MOB cells are frequent then this indirection will begin to waste
space. The only way to stop using the space of a particular MOB hfile is to ensure no cells still
hold references to it. To do that we need to ensure we have written the current values into a new
MOB hfile. If our backing filesystem has a limitation on the number of files that can be present, as
HDFS does, then even if we do not have deletes or updates of MOB cells eventually there will be a
sufficient number of MOB hfiles that we will need to coalesce them.

Periodically a chore in the master coordinates having the region servers
perform a special major compaction that also handles rewriting new MOB files. Like all compactions
the Region Server will create updated hfiles that hold both the cells that are smaller than the MOB
threshold and cells that hold references to the newly rewritten MOB file. Because this rewriting has
the advantage of looking across all active cells for the region our several small MOB files should
end up as a single MOB file per region. The chore defaults to running weekly and can be
configured by setting \`hbase.mob.compaction.chore.period\` to the desired period in seconds.

\`\`\`xml
<property>
  <name>hbase.mob.compaction.chore.period</name>
  <value>2592000</value>
  <description>Example of changing the chore period from a week to a month.</description>
</property>
\`\`\`

By default, the periodic MOB compaction coordination chore will attempt to keep every region
busy doing compactions in parallel in order to maximize the amount of work done on the cluster.
If you need to tune the amount of IO this compaction generates on the underlying filesystem, you
can control how many concurrent region-level compaction requests are allowed by setting
\`hbase.mob.major.compaction.region.batch.size\` to an integer number greater than zero. If you set
the configuration to 0 then you will get the default behavior of attempting to do all regions in
parallel.

\`\`\`xml
<property>
  <name>hbase.mob.major.compaction.region.batch.size</name>
  <value>1</value>
  <description>Example of switching from "as parallel as possible" to "serially"</description>
</property>
\`\`\`

### MOB file archiving

Eventually we will have MOB hfiles that are no longer needed. Either clients will overwrite the
value or a MOB-rewriting compaction will store a reference to a newer larger MOB hfile. Because any
given MOB cell could have originally been written either in the current region or in a parent region
that existed at some prior point in time, individual Region Servers do not decide when it is time
to archive MOB hfiles. Instead a periodic chore in the Master evaluates MOB hfiles for archiving.

A MOB HFile will be subject to archiving under any of the following conditions:

* Any MOB HFile older than the column family's TTL
* Any MOB HFile older than a "too recent" threshold with no references to it from the regular hfiles
  for all regions in a column family

To determine if a MOB HFile meets the second criteria the chore extracts metadata from the regular
HFiles for each MOB enabled column family for a given table. That metadata enumerates the complete
set of MOB HFiles needed to satisfy the references stored in the normal HFile area.

The period of the cleaner chore can be configured by setting \`hbase.master.mob.cleaner.period\` to a
positive integer number of seconds. It defaults to running daily. You should not need to tune it
unless you have a very aggressive TTL or a very high rate of MOB updates with a correspondingly
high rate of non-MOB compactions.

## MOB Optimization Tasks

### Further limiting write amplification

If your MOB workload has few to no updates or deletes then you can opt-in to MOB compactions that
optimize for limiting the amount of write amplification. It achieves this by setting a
size threshold to ignore MOB files during the compaction process. When a given region goes
through MOB compaction it will evaluate the size of the MOB file that currently holds the actual
value and skip rewriting the value if that file is over threshold.

The bound of write amplification in this mode can be approximated as
"Write Amplification" = $\\log_{K}\\!\\left(\\frac{M}{S}\\right)$ where **K** is the number of files in compaction
selection, **M** is the configurable threshold for MOB files size, and **S** is the minmum size of
memstore flushes that create MOB files in the first place. For example given 5 files picked up per
compaction, a threshold of 1 GB, and a flush size of 10MB the write amplification will be
$\\log\\\\_{5}\\!\\left(\\frac{1\\,\\text{GB}}{10\\,\\text{MB}}\\right) = \\log\\\\_{5}(100) \\approx 2.86$.

If we are using an underlying filesystem with a limitation on the number of files, such as HDFS,
and we know our expected data set size we can choose our maximum file size in order to approach
this limit but stay within it in order to minimize write amplification. For example, if we expect to
store a petabyte and we have a conservative limitation of a million files in our HDFS instance, then
$\\frac{1\\,\\text{PB}}{1\\,\\text{M}} = 1\\,\\text{GB}$ gives us a target limitation of a gigabyte per MOB file.

To opt-in to this compaction mode you must set \`hbase.mob.compaction.type\` to \`optimized\`. The
default MOB size threshold in this mode is set to 1GB. It can be changed by setting
\`hbase.mob.compactions.max.file.size\` to a positive integer number of bytes.

\`\`\`xml
<property>
  <name>hbase.mob.compaction.type</name>
  <value>optimized</value>
  <description>opt-in to write amplification optimized mob compaction.</description>
</property>
<property>
  <name>hbase.mob.compactions.max.file.size</name>
  <value>10737418240</value>
  <description>Example of tuning the max mob file size to 10GB</description>
</property>
\`\`\`

Additionally, when operating in this mode the compaction process will seek to avoid writing MOB
files that are over the max file threshold. As it is writing out a additional MOB values into a MOB
hfile it will check to see if the additional data causes the hfile to be over the max file size.
When the hfile of MOB values reaches limit, the MOB hfile is committed to the MOB storage area and
a new one is created. The hfile with reference cells will track the complete set of MOB hfiles it
needs in its metadata.

<Callout type="warn" title="Be mindful of total time to complete compaction of a region">
  When using the write amplification optimized compaction mode you need to watch for the maximum
  time to compact a single region. If it nears an hour you should read through the troubleshooting
  section below [Adjusting the MOB cleaner's tolerance for new
  hfiles](/docs/architecture/hbase-mob#adjusting-the-mob-cleaners-tolerance-for-new-hfiles). Failure
  to make the adjustments discussed there could lead to dataloss.
</Callout>

### Configuring the MOB Cache

Because there can be a large number of MOB files at any time, as compared to the number of HFiles,
MOB files are not always kept open. The MOB file reader cache is a LRU cache which keeps the most
recently used MOB files open. To configure the MOB file reader's cache on each RegionServer, add
the following properties to the RegionServer's \`hbase-site.xml\`, customize the configuration to
suit your environment, and restart or rolling restart the RegionServer.

#### Example MOB Cache Configuration

\`\`\`xml
<property>
  <name>hbase.mob.file.cache.size</name>
  <value>1000</value>
  <description>
    Number of opened file handlers to cache.
    A larger value will benefit reads by providing more file handlers per mob
    file cache and would reduce frequent file opening and closing.
    However, if this is set too high, this could lead to a "too many opened file handers"
    The default value is 1000.
  </description>
</property>
<property>
  <name>hbase.mob.cache.evict.period</name>
  <value>3600</value>
  <description>
    The amount of time in seconds after which an unused file is evicted from the
    MOB cache. The default value is 3600 seconds.
  </description>
</property>
<property>
  <name>hbase.mob.cache.evict.remain.ratio</name>
  <value>0.5f</value>
  <description>
    A multiplier (between 0.0 and 1.0), which determines how many files remain cached
    after the threshold of files that remains cached after a cache eviction occurs
    which is triggered by reaching the \`hbase.mob.file.cache.size\` threshold.
    The default value is 0.5f, which means that half the files (the least-recently-used
    ones) are evicted.
  </description>
</property>
\`\`\`

### Manually Compacting MOB Files

To manually compact MOB files, rather than waiting for the
periodic chore to trigger compaction, use the
\`major_compact\` HBase shell commands. These commands
require the first argument to be the table name, and take a column
family as the second argument. If used with a column family that includes MOB data, then
these operator requests will result in the MOB data being compacted.

\`\`\`bash
hbase> major_compact 't1'
hbase> major_compact 't2', 'c1'
\`\`\`

This same request can be made via the \`Admin.majorCompact\` Java API.

## MOB Troubleshooting

### Adjusting the MOB cleaner's tolerance for new hfiles

The MOB cleaner chore ignores all MOB hfiles that were created more recently than an hour prior to
the start of the chore to ensure we don't miss the reference metadata from the corresponding regular
hfile. Without this safety check it would be possible for the cleaner chore to see a MOB hfile for
an in progress flush or compaction and prematurely archive the MOB data. This default buffer should
be sufficient for normal use.

You will need to adjust the tolerance if you use write amplification optimized MOB compaction and
the combination of your underlying filesystem performance and data shape is such that it could take
more than an hour to complete major compaction of a single region. For example, if your MOB data is
distributed such that your largest region adds 80GB of MOB data between compactions that include
rewriting MOB data and your HDFS cluster is only capable of writing 20MB/s for a single file then
when performing the optimized compaction the Region Server will take about a minute to write the
first 1GB MOB hfile and then another hour and seven minutes to write the remaining seventy-nine 1GB
MOB hfiles before finally committing the new reference hfile at the end of the compaction. Given
this example, you would need a larger tolerance window.

You will also need to adjust the tolerance if Region Server flush operations take longer than an
hour for the two HDFS move operations needed to commit both the MOB hfile and the normal hfile that
references it. Such a delay should not happen with a normally configured and healthy HDFS and HBase.

The cleaner's window for "too recent" is controlled by setting \`hbase.mob.min.age.archive\` to a
positive integer number of milliseconds.

\`\`\`xml
<property>
  <name>hbase.mob.min.age.archive</name>
  <value>86400000</value>
  <description>Example of tuning the cleaner to only archive files older than a day.</description>
</property>
\`\`\`

### Retrieving MOB metadata through the HBase Shell

While working on troubleshooting failures in the MOB system you can retrieve some of the internal
information through the HBase shell by specifying special attributes on a scan.

\`\`\`ruby
hbase(main):112:0> scan 'some_table', {STARTROW => '00012-example-row-key', LIMIT => 1,
hbase(main):113:1*     CACHE_BLOCKS => false, ATTRIBUTES => { 'hbase.mob.scan.raw' => '1',
hbase(main):114:2*     'hbase.mob.scan.ref.only' => '1' } }
\`\`\`

The MOB internal information is stored as four bytes for the size of the underlying cell value and
then a UTF8 string with the name of the MOB HFile that contains the underlying cell value. Note that
by default the entirety of this serialized structure will be passed through the HBase shell's binary
string converter. That means the bytes that make up the value size will most likely be written as
escaped non-printable byte values, e.g. '\\x03', unless they happen to correspond to ASCII
characters.

Let's look at a specific example:

\`\`\`ruby
hbase(main):112:0> scan 'some_table', {STARTROW => '00012-example-row-key', LIMIT => 1,
hbase(main):113:1*     CACHE_BLOCKS => false, ATTRIBUTES => { 'hbase.mob.scan.raw' => '1',
hbase(main):114:2*     'hbase.mob.scan.ref.only' => '1' } }
ROW                        COLUMN+CELL
 00012-example-row-key     column=foo:bar, timestamp=1511179764, value=\\x00\\x02|\\x94d41d8cd98f00b204
                       e9800998ecf8427e19700118ffd9c244fe69488bbc9f2c77d24a3e6a
1 row(s) in 0.0130 seconds
\`\`\`

In this case the first four bytes are \`\\x00\\x02|\\x94\` which corresponds to the bytes
\`[0x00, 0x02, 0x7C, 0x94]\`. (Note that the third byte was printed as the ASCII character '|'.)
Decoded as an integer this gives us an underlying value size of 162,964 bytes.

The remaining bytes give us an HFile name,
'd41d8cd98f00b204e9800998ecf8427e19700118ffd9c244fe69488bbc9f2c77d24a3e6a'. This HFile will most
likely be stored in the designated MOB storage area for this specific table. However, the file could
also be in the archive area if this table is from a restored snapshot. Furthermore, if the table is
from a cloned snapshot of a different table then the file could be in either the active or archive
area of that source table. As mentioned in the explanation of MOB reference cells above, the Region
Server will use a server side tag to optimize looking at the mob and archive area of the correct
original table when finding the MOB HFile. Since your scan is client side it can't retrieve that tag
and you'll either need to already know the lineage of your table or you'll need to search across all
tables.

Assuming you are authenticated as a user with HBase superuser rights, you can search for it:

\`\`\`bash
$> hdfs dfs -find /hbase -name \\
d41d8cd98f00b204e9800998ecf8427e19700118ffd9c244fe69488bbc9f2c77d24a3e6a
/hbase/mobdir/data/default/some_table/372c1b27e3dc0b56c3a031926e5efbe9/foo/d41d8cd98f00b204e9800998ecf8427e19700118ffd9c244fe69488bbc9f2c77d24a3e6a
\`\`\`

### Moving a column family out of MOB

If you want to disable MOB on a column family you must ensure you instruct HBase to migrate the data
out of the MOB system prior to turning the feature off. If you fail to do this HBase will return the
internal MOB metadata to applications because it will not know that it needs to resolve the actual
values.

The following procedure will safely migrate the underlying data without requiring a cluster outage.
Clients will see a number of retries when configuration settings are applied and regions are
reloaded.

#### Procedure: Stop MOB maintenance, change MOB threshold, rewrite data via compaction

<Steps>
  <Step>
    Ensure the MOB compaction chore in the Master is off by setting
    \`hbase.mob.compaction.chore.period\` to \`0\`. Applying this configuration change will require a
    rolling restart of HBase Masters. That will require at least one fail-over of the active master,
    which may cause retries for clients doing HBase administrative operations.
  </Step>

  <Step>
    Ensure no MOB compactions are issued for the table via the HBase shell for the duration of this
    migration.
  </Step>

  <Step>
    ##### Change the MOB size threshold

    Use the HBase shell to change the MOB size threshold for the column family you are migrating to a
    value that is larger than the largest cell present in the column family. E.g. given a table named
    'some\\_table' and a column family named 'foo' we can pick one gigabyte as an arbitrary "bigger than
    what we store" value:

    \`\`\`ruby
     hbase(main):011:0> alter 'some_table', {NAME => 'foo', MOB_THRESHOLD => '1000000000'}
     Updating all regions with the new schema...
     9/25 regions updated.
     25/25 regions updated.
     Done.
     0 row(s) in 3.4940 seconds
    \`\`\`

    Note that if you are still ingesting data you must ensure this threshold is larger than any cell value you might write; MAX\\_INT would be a safe choice.
  </Step>

  <Step>
    ##### Perform a major compaction on the table

    Specifically you are performing a "normal" compaction and not a MOB compaction.

    \`\`\`ruby
    hbase(main):012:0> major_compact 'some_table'
    0 row(s) in 0.2600 seconds
    \`\`\`
  </Step>

  <Step>
    ##### Monitor for the end of the major compaction

    Since compaction is handled asynchronously you'll need to use the shell to first see the compaction start and then see it end.

    HBase should first say that a "MAJOR" compaction is happening.

    \`\`\`ruby
    hbase(main):015:0> @hbase.admin(@formatter).instance_eval do
    hbase(main):016:1*   p @admin.get_compaction_state('some_table').to_string
    hbase(main):017:2* end
    "MAJOR"
    \`\`\`

    When the compaction has finished the result should print out "NONE".

    \`\`\`ruby
    hbase(main):015:0> @hbase.admin(@formatter).instance_eval do
    hbase(main):016:1*   p @admin.get_compaction_state('some_table').to_string
    hbase(main):017:2* end
    "NONE"
    \`\`\`
  </Step>

  <Step>
    Run the *mobrefs* utility to ensure there are no MOB cells. Specifically, the tool will launch a
    Hadoop MapReduce job that will show a job counter of 0 input records when we've successfully
    rewritten all of the data.

    \`\`\`bash
    $> HADOOP_CLASSPATH=/etc/hbase/conf:$(hbase mapredcp) yarn jar \\
    /some/path/to/hbase-shaded-mapreduce.jar mobrefs mobrefs-report-output some_table foo
    ...
    19/12/10 11:38:47 INFO impl.YarnClientImpl: Submitted application application_1575695902338_0004
    19/12/10 11:38:47 INFO mapreduce.Job: The url to track the job: https://rm-2.example.com:8090/proxy application_1575695902338_0004/
    19/12/10 11:38:47 INFO mapreduce.Job: Running job: job_1575695902338_0004
    19/12/10 11:38:57 INFO mapreduce.Job: Job job_1575695902338_0004 running in uber mode : false
    19/12/10 11:38:57 INFO mapreduce.Job:  map 0% reduce 0%
    19/12/10 11:39:07 INFO mapreduce.Job:  map 7% reduce 0%
    19/12/10 11:39:17 INFO mapreduce.Job:  map 13% reduce 0%
    19/12/10 11:39:19 INFO mapreduce.Job:  map 33% reduce 0%
    19/12/10 11:39:21 INFO mapreduce.Job:  map 40% reduce 0%
    19/12/10 11:39:22 INFO mapreduce.Job:  map 47% reduce 0%
    19/12/10 11:39:23 INFO mapreduce.Job:  map 60% reduce 0%
    19/12/10 11:39:24 INFO mapreduce.Job:  map 73% reduce 0%
    19/12/10 11:39:27 INFO mapreduce.Job:  map 100% reduce 0%
    19/12/10 11:39:35 INFO mapreduce.Job:  map 100% reduce 100%
    19/12/10 11:39:35 INFO mapreduce.Job: Job job_1575695902338_0004 completed successfully
    19/12/10 11:39:35 INFO mapreduce.Job: Counters: 54
    ...
           Map-Reduce Framework
                   Map input records=0
    ...
    19/12/09 22:41:28 INFO mapreduce.MobRefReporter: Finished creating report for 'some_table', family='foo'
    \`\`\`

    If the data has not successfully been migrated out, this report will show both a non-zero number
    of input records and a count of mob cells.

    \`\`\`bash
    $> HADOOP_CLASSPATH=/etc/hbase/conf:$(hbase mapredcp) yarn jar \\
    /some/path/to/hbase-shaded-mapreduce.jar mobrefs mobrefs-report-output some_table foo
    ...
    19/12/10 11:44:18 INFO impl.YarnClientImpl: Submitted application application_1575695902338_0005
    19/12/10 11:44:18 INFO mapreduce.Job: The url to track the job: https://busbey-2.gce.cloudera.com:8090 proxy/application_1575695902338_0005/
    19/12/10 11:44:18 INFO mapreduce.Job: Running job: job_1575695902338_0005
    19/12/10 11:44:26 INFO mapreduce.Job: Job job_1575695902338_0005 running in uber mode : false
    19/12/10 11:44:26 INFO mapreduce.Job:  map 0% reduce 0%
    19/12/10 11:44:36 INFO mapreduce.Job:  map 7% reduce 0%
    19/12/10 11:44:45 INFO mapreduce.Job:  map 13% reduce 0%
    19/12/10 11:44:47 INFO mapreduce.Job:  map 27% reduce 0%
    19/12/10 11:44:48 INFO mapreduce.Job:  map 33% reduce 0%
    19/12/10 11:44:50 INFO mapreduce.Job:  map 40% reduce 0%
    19/12/10 11:44:51 INFO mapreduce.Job:  map 53% reduce 0%
    19/12/10 11:44:52 INFO mapreduce.Job:  map 73% reduce 0%
    19/12/10 11:44:54 INFO mapreduce.Job:  map 100% reduce 0%
    19/12/10 11:44:59 INFO mapreduce.Job:  map 100% reduce 100%
    19/12/10 11:45:00 INFO mapreduce.Job: Job job_1575695902338_0005 completed successfully
    19/12/10 11:45:00 INFO mapreduce.Job: Counters: 54
    ...
           Map-Reduce Framework
                   Map input records=1
    ...
           MOB
                   NUM_CELLS=1
    ...
    19/12/10 11:45:00 INFO mapreduce.MobRefReporter: Finished creating report for 'some_table', family='foo'
    \`\`\`

    If this happens you should verify that MOB compactions are disabled, verify that you have picked a sufficiently large MOB threshold, and redo the major compaction step.
  </Step>

  <Step>
    ##### Disable the MOB feature for the column family

    When the *mobrefs* report shows that no more data is stored in the MOB system then you can safely alter the column family configuration so that the MOB feature is disabled.

    \`\`\`ruby
    hbase(main):017:0> alter 'some_table', {NAME => 'foo', IS_MOB => 'false'}
    Updating all regions with the new schema...
    8/25 regions updated.
    25/25 regions updated.
    Done.
    0 row(s) in 2.9370 seconds
    \`\`\`

    The MOB feature will be disabled on a column family only after altering the column family and performing a major compaction. Before performing the major compaction after altering the column family, the MOB cells will still be present in the MOB storage.
  </Step>

  <Step>
    After the column family no longer shows the MOB feature enabled, it is safe to start MOB maintenance chores again. You can allow the default to be used for \`hbase.mob.compaction.chore.period\` by removing it from your configuration files or restore it to whatever custom value you had prior to starting this process.
  </Step>

  <Step>
    ##### Clean up residual MOB data

    Once the MOB feature is disabled for the column family there will be no internal HBase process
    looking for data in the MOB storage area specific to this column family. There will still be data
    present there from prior to the compaction process that rewrote the values into HBase's data area.
    You can check for this residual data directly in HDFS as an HBase superuser.

    \`\`\`bash
    $ hdfs dfs -count /hbase/mobdir/data/default/some_table
               4           54         9063269081 /hbase/mobdir/data/default/some_table
    \`\`\`

    This data is spurious and may be reclaimed. You should sideline it, verify your application's view of the table, and then delete it.
  </Step>
</Steps>

### Data values over than the MOB threshold show up stored in non-MOB hfiles

Bulk load and WAL split-to-HFile don't consider MOB threshold and write data into normal hfile (under /hbase/data directory).

<Callout type="info">
  This won't cause any functional problem, during next compaction such data will be written out to
  the MOB hfiles.
</Callout>

## MOB Upgrade Considerations

Generally, data stored using the MOB feature should transparently continue to work correctly across
HBase upgrades.

### Upgrading to a version with the "distributed MOB compaction" feature

Prior to the work in HBASE-22749, "Distributed MOB compactions", HBase had the Master coordinate all
compaction maintenance of the MOB hfiles. Centralizing management of the MOB data allowed for space
optimizations but safely coordinating that management with Region Servers resulted in edge cases that
caused data loss (ref [HBASE-22075](https://issues.apache.org/jira/browse/HBASE-22075)).

Users of the MOB feature upgrading to a version of HBase that includes HBASE-22749 should be aware
of the following changes:

* The MOB system no longer allows setting "MOB Compaction Policies"
* The MOB system no longer attempts to group MOB values by the date of the original cell's timestamp
  according to said compaction policies, daily or otherwise
* The MOB system no longer needs to track individual cell deletes through the use of special
  files in the MOB storage area with the suffix \`_del\`. After upgrading you should sideline these
  files.
* Under default configuration the MOB system should take much less time to perform a compaction of
  MOB stored values. This is a direct consequence of the fact that HBase will place a much larger
  load on the underlying filesystem when doing compactions of MOB stored values; the additional load
  should be a multiple on the order of magnitude of number of region servers. I.e. for a cluster
  with three region servers and two masters the default configuration should have HBase put three
  times the load on HDFS during major compactions that rewrite MOB data when compared to Master
  handled MOB compaction; it should also be approximately three times as fast.
* When the MOB system detects that a table has hfiles with references to MOB data but the reference
  hfiles do not yet have the needed file level metadata (i.e. from use of the MOB feature prior to
  HBASE-22749) then it will refuse to archive *any* MOB hfiles from that table. The normal course of
  periodic compactions done by Region Servers will update existing hfiles with MOB references, but
  until a given table has been through the needed compactions operators should expect to see an
  increased amount of storage used by the MOB feature.
* Performing a compaction with type "MOB" no longer has special handling to compact specifically the
  MOB hfiles. Instead it will issue a warning and do a compaction of the table. For example using
  the HBase shell as follows will result in a warning in the Master logs followed by a major
  compaction of the 'example' table in its entirety or for the 'big' column respectively.
  \`\`\`ruby
  hbase> major_compact 'example', nil, 'MOB'
  hbase> major_compact 'example', 'big', 'MOB'
  \`\`\`
  The same is true for directly using the Java API for \`admin.majorCompact(TableName.valueOf("example"), CompactType.MOB)\`.
* Similarly, manually performing a major compaction on a table or region will also handle compacting
  the MOB stored values for that table or region respectively.

The following configuration setting has been deprecated and replaced:

* \`hbase.master.mob.ttl.cleaner.period\` has been replaced with \`hbase.master.mob.cleaner.period\`

The following configuration settings are no longer used:

* \`hbase.mob.compaction.mergeable.threshold\`
* \`hbase.mob.delfile.max.count\`
* \`hbase.mob.compaction.batch.size\`
* \`hbase.mob.compactor.class\`
* \`hbase.mob.compaction.threads.max\`
`,d={title:"Storing Medium-sized Objects (MOB)",description:"Optimized storage and handling of medium-sized objects (100KB-10MB) in HBase using the MOB feature for improved performance."},c=[{href:"/docs/faq"},{href:"https://issues.apache.org/jira/browse/HBASE-11339"},{href:"/docs/hfile-format#hbase-file-format-with-security-enhancements-version-3"},{href:"/docs/architecture/hbase-mob#configuring-the-mob-cache"},{href:"https://issues.apache.org/jira/browse/HBASE-11339"},{href:"https://issues.apache.org/jira/browse/HBASE-22749"},{href:"https://github.com/apache/hbase/blob/master/dev-support/design-docs/HBASE-11339%20MOB%20GA%20design.pdf"},{href:"https://github.com/apache/hbase/blob/master/dev-support/design-docs/HBASE-22749%20MOB%20distributed%20compaction.pdf"},{href:"/docs/architecture/hbase-mob#adjusting-the-mob-cleaners-tolerance-for-new-hfiles"},{href:"https://issues.apache.org/jira/browse/HBASE-22075"}],p={contents:[{heading:void 0,content:`Data comes in many sizes, and saving all of your data in HBase, including binary
data such as images and documents, is ideal. While HBase can technically handle
binary objects with cells that are larger than 100 KB in size, HBase's normal
read and write paths are optimized for values smaller than 100KB in size. When
HBase deals with large numbers of objects over this threshold, referred to here
as medium objects, or MOBs, performance is degraded due to write amplification
caused by splits and compactions. When using MOBs, ideally your objects will be between
100KB and 10MB (see the faq). HBase 2 added special internal handling of MOBs
to maintain performance, consistency, and low operational overhead. MOB support is
provided by the work done in HBASE-11339.
To take advantage of MOB, you need to use HFile version 3. Optionally,
configure the MOB file reader's cache settings for each RegionServer (see
Configure the MOB Cache), then configure specific columns to hold MOB data.
Client code does not need to change to take advantage of HBase MOB support. The
feature is transparent to the client.`},{heading:"configuring-columns-for-mob",content:`You can configure columns to support MOB during table creation or alteration,
either in HBase Shell or via the Java API. The two relevant properties are the
boolean IS_MOB and the MOB_THRESHOLD, which is the number of bytes at which
an object is considered to be a MOB. Only IS_MOB is required. If you do not
specify the MOB_THRESHOLD, the default threshold value of 100 KB is used.`},{heading:"testing-mob",content:`The utility org.apache.hadoop.hbase.IntegrationTestIngestWithMOB is provided to assist with testing
the MOB feature. The utility is run as follows:`},{heading:"testing-mob",content:`threshold is the threshold at which cells are considered to be MOBs.
The default is 1 kB, expressed in bytes.`},{heading:"testing-mob",content:`minMobDataSize is the minimum value for the size of MOB data.
The default is 512 B, expressed in bytes.`},{heading:"testing-mob",content:`maxMobDataSize is the maximum value for the size of MOB data.
The default is 5 kB, expressed in bytes.`},{heading:"mob-architecture",content:`This section is derived from information found in
HBASE-11339, which covered the initial GA
implementation of MOB in HBase and
HBASE-22749, which improved things by
parallelizing MOB maintenance across the RegionServers. For more information see
the last version of the design doc created during the initial work,
"HBASE-11339 MOB GA design.pdf",
and the design doc for the distributed mob compaction feature,
"HBASE-22749 MOB distributed compaction.pdf".`},{heading:"hbase-mob-overview",content:`The MOB feature reduces the overall IO load for configured column families by storing values that
are larger than the configured threshold outside of the normal regions to avoid splits, merges, and
most importantly normal compactions.`},{heading:"hbase-mob-overview",content:`When a cell is first written to a region it is stored in the WAL and memstore regardless of value
size. When memstores from a column family configured to use MOB are eventually flushed two hfiles
are written simultaneously. Cells with a value smaller than the threshold size are written to a
normal region hfile. Cells with a value larger than the threshold are written into a special MOB
hfile and also have a MOB reference cell written into the normal region HFile. As the Region Server
flushes a MOB enabled memstore and closes a given normal region HFile it appends metadata that lists
each of the special MOB hfiles referenced by the cells within.`},{heading:"hbase-mob-overview",content:`MOB reference cells have the same key as the cell they are based on. The value of the reference cell
is made up of two pieces of metadata: the size of the actual value and the MOB hfile that contains
the original cell. In addition to any tags originally written to HBase, the reference cell prepends
two additional tags. The first is a marker tag that says the cell is a MOB reference. This can be
used later to scan specifically just for reference cells. The second stores the namespace and table
at the time the MOB hfile is written out. This tag is used to optimize how the MOB system finds
the underlying value in MOB hfiles after a series of HBase snapshot operations (ref HBASE-12332).
Note that tags are only available within HBase servers and by default are not sent over RPCs.`},{heading:"hbase-mob-overview",content:`All MOB hfiles for a given table are managed within a logical region that does not directly serve
requests. When these MOB hfiles are created from a flush or MOB compaction they are placed in a
dedicated mob data area under the hbase root directory specific to the namespace, table, mob
logical region, and column family. In general that means a path structured like:`},{heading:"hbase-mob-overview",content:`With default configs, an example table named 'some_table' in the
default namespace with a MOB enabled column family named 'foo' this HDFS directory would be`},{heading:"hbase-mob-overview",content:`These MOB hfiles are maintained by special chores in the HBase Master and across the individual
Region Servers. Specifically those chores take care of enforcing TTLs and compacting them. Note that
this compaction is primarily a matter of controlling the total number of files in HDFS because our
operational assumptions for MOB data is that it will seldom update or delete.`},{heading:"hbase-mob-overview",content:`When a given MOB hfile is no longer needed as a result of our compaction process then a chore in
the Master will take care of moving it to the archive just
like any normal hfile. Because the table's mob region is independent of all the normal regions it
can coexist with them in the regular archive storage area:`},{heading:"hbase-mob-overview",content:`The same hfile cleaning chores that take care of eventually deleting unneeded archived files from
normal regions thus also will take care of these MOB hfiles. As such, if there is a snapshot of a
MOB enabled table then the cleaning system will make sure those MOB files stick around in the
archive area as long as they are needed by a snapshot or a clone of a snapshot.`},{heading:"mob-compaction",content:`Each time the memstore for a MOB enabled column family performs a flush HBase will write values over
the MOB threshold into MOB specific hfiles. When normal region compaction occurs the Region Server
rewrites the normal data files while maintaining references to these MOB files without rewriting
them. Normal client lookups for MOB values transparently will receive the original values because
the Region Server internals take care of using the reference data to then pull the value out of a
specific MOB file. This indirection means that building up a large number of MOB hfiles doesn't
impact the overall time to retrieve any specific MOB cell. Thus, we need not perform compactions of
the MOB hfiles nearly as often as normal hfiles. As a result, HBase saves IO by not rewriting MOB
hfiles as a part of the periodic compactions a Region Server does on its own.`},{heading:"mob-compaction",content:`However, if deletes and updates of MOB cells are frequent then this indirection will begin to waste
space. The only way to stop using the space of a particular MOB hfile is to ensure no cells still
hold references to it. To do that we need to ensure we have written the current values into a new
MOB hfile. If our backing filesystem has a limitation on the number of files that can be present, as
HDFS does, then even if we do not have deletes or updates of MOB cells eventually there will be a
sufficient number of MOB hfiles that we will need to coalesce them.`},{heading:"mob-compaction",content:`Periodically a chore in the master coordinates having the region servers
perform a special major compaction that also handles rewriting new MOB files. Like all compactions
the Region Server will create updated hfiles that hold both the cells that are smaller than the MOB
threshold and cells that hold references to the newly rewritten MOB file. Because this rewriting has
the advantage of looking across all active cells for the region our several small MOB files should
end up as a single MOB file per region. The chore defaults to running weekly and can be
configured by setting hbase.mob.compaction.chore.period to the desired period in seconds.`},{heading:"mob-compaction",content:`By default, the periodic MOB compaction coordination chore will attempt to keep every region
busy doing compactions in parallel in order to maximize the amount of work done on the cluster.
If you need to tune the amount of IO this compaction generates on the underlying filesystem, you
can control how many concurrent region-level compaction requests are allowed by setting
hbase.mob.major.compaction.region.batch.size to an integer number greater than zero. If you set
the configuration to 0 then you will get the default behavior of attempting to do all regions in
parallel.`},{heading:"mob-file-archiving",content:`Eventually we will have MOB hfiles that are no longer needed. Either clients will overwrite the
value or a MOB-rewriting compaction will store a reference to a newer larger MOB hfile. Because any
given MOB cell could have originally been written either in the current region or in a parent region
that existed at some prior point in time, individual Region Servers do not decide when it is time
to archive MOB hfiles. Instead a periodic chore in the Master evaluates MOB hfiles for archiving.`},{heading:"mob-file-archiving",content:"A MOB HFile will be subject to archiving under any of the following conditions:"},{heading:"mob-file-archiving",content:"Any MOB HFile older than the column family's TTL"},{heading:"mob-file-archiving",content:`Any MOB HFile older than a "too recent" threshold with no references to it from the regular hfiles
for all regions in a column family`},{heading:"mob-file-archiving",content:`To determine if a MOB HFile meets the second criteria the chore extracts metadata from the regular
HFiles for each MOB enabled column family for a given table. That metadata enumerates the complete
set of MOB HFiles needed to satisfy the references stored in the normal HFile area.`},{heading:"mob-file-archiving",content:`The period of the cleaner chore can be configured by setting hbase.master.mob.cleaner.period to a
positive integer number of seconds. It defaults to running daily. You should not need to tune it
unless you have a very aggressive TTL or a very high rate of MOB updates with a correspondingly
high rate of non-MOB compactions.`},{heading:"further-limiting-write-amplification",content:`If your MOB workload has few to no updates or deletes then you can opt-in to MOB compactions that
optimize for limiting the amount of write amplification. It achieves this by setting a
size threshold to ignore MOB files during the compaction process. When a given region goes
through MOB compaction it will evaluate the size of the MOB file that currently holds the actual
value and skip rewriting the value if that file is over threshold.`},{heading:"further-limiting-write-amplification",content:`The bound of write amplification in this mode can be approximated as
"Write Amplification" = \\log_{K}\\!\\left(\\frac{M}{S}\\right) where K is the number of files in compaction
selection, M is the configurable threshold for MOB files size, and S is the minmum size of
memstore flushes that create MOB files in the first place. For example given 5 files picked up per
compaction, a threshold of 1 GB, and a flush size of 10MB the write amplification will be
\\log\\\\_{5}\\!\\left(\\frac{1\\,\\text{GB}}{10\\,\\text{MB}}\\right) = \\log\\\\_{5}(100) \\approx 2.86.`},{heading:"further-limiting-write-amplification",content:`If we are using an underlying filesystem with a limitation on the number of files, such as HDFS,
and we know our expected data set size we can choose our maximum file size in order to approach
this limit but stay within it in order to minimize write amplification. For example, if we expect to
store a petabyte and we have a conservative limitation of a million files in our HDFS instance, then
\\frac{1\\,\\text{PB}}{1\\,\\text{M}} = 1\\,\\text{GB} gives us a target limitation of a gigabyte per MOB file.`},{heading:"further-limiting-write-amplification",content:`To opt-in to this compaction mode you must set hbase.mob.compaction.type to optimized. The
default MOB size threshold in this mode is set to 1GB. It can be changed by setting
hbase.mob.compactions.max.file.size to a positive integer number of bytes.`},{heading:"further-limiting-write-amplification",content:`Additionally, when operating in this mode the compaction process will seek to avoid writing MOB
files that are over the max file threshold. As it is writing out a additional MOB values into a MOB
hfile it will check to see if the additional data causes the hfile to be over the max file size.
When the hfile of MOB values reaches limit, the MOB hfile is committed to the MOB storage area and
a new one is created. The hfile with reference cells will track the complete set of MOB hfiles it
needs in its metadata.`},{heading:"further-limiting-write-amplification",content:"type: warn"},{heading:"further-limiting-write-amplification",content:"title: Be mindful of total time to complete compaction of a region"},{heading:"further-limiting-write-amplification",content:`When using the write amplification optimized compaction mode you need to watch for the maximum
time to compact a single region. If it nears an hour you should read through the troubleshooting
section below Adjusting the MOB cleaner's tolerance for new
hfiles. Failure
to make the adjustments discussed there could lead to dataloss.`},{heading:"configuring-the-mob-cache",content:`Because there can be a large number of MOB files at any time, as compared to the number of HFiles,
MOB files are not always kept open. The MOB file reader cache is a LRU cache which keeps the most
recently used MOB files open. To configure the MOB file reader's cache on each RegionServer, add
the following properties to the RegionServer's hbase-site.xml, customize the configuration to
suit your environment, and restart or rolling restart the RegionServer.`},{heading:"manually-compacting-mob-files",content:`To manually compact MOB files, rather than waiting for the
periodic chore to trigger compaction, use the
major_compact HBase shell commands. These commands
require the first argument to be the table name, and take a column
family as the second argument. If used with a column family that includes MOB data, then
these operator requests will result in the MOB data being compacted.`},{heading:"manually-compacting-mob-files",content:"This same request can be made via the Admin.majorCompact Java API."},{heading:"adjusting-the-mob-cleaners-tolerance-for-new-hfiles",content:`The MOB cleaner chore ignores all MOB hfiles that were created more recently than an hour prior to
the start of the chore to ensure we don't miss the reference metadata from the corresponding regular
hfile. Without this safety check it would be possible for the cleaner chore to see a MOB hfile for
an in progress flush or compaction and prematurely archive the MOB data. This default buffer should
be sufficient for normal use.`},{heading:"adjusting-the-mob-cleaners-tolerance-for-new-hfiles",content:`You will need to adjust the tolerance if you use write amplification optimized MOB compaction and
the combination of your underlying filesystem performance and data shape is such that it could take
more than an hour to complete major compaction of a single region. For example, if your MOB data is
distributed such that your largest region adds 80GB of MOB data between compactions that include
rewriting MOB data and your HDFS cluster is only capable of writing 20MB/s for a single file then
when performing the optimized compaction the Region Server will take about a minute to write the
first 1GB MOB hfile and then another hour and seven minutes to write the remaining seventy-nine 1GB
MOB hfiles before finally committing the new reference hfile at the end of the compaction. Given
this example, you would need a larger tolerance window.`},{heading:"adjusting-the-mob-cleaners-tolerance-for-new-hfiles",content:`You will also need to adjust the tolerance if Region Server flush operations take longer than an
hour for the two HDFS move operations needed to commit both the MOB hfile and the normal hfile that
references it. Such a delay should not happen with a normally configured and healthy HDFS and HBase.`},{heading:"adjusting-the-mob-cleaners-tolerance-for-new-hfiles",content:`The cleaner's window for "too recent" is controlled by setting hbase.mob.min.age.archive to a
positive integer number of milliseconds.`},{heading:"retrieving-mob-metadata-through-the-hbase-shell",content:`While working on troubleshooting failures in the MOB system you can retrieve some of the internal
information through the HBase shell by specifying special attributes on a scan.`},{heading:"retrieving-mob-metadata-through-the-hbase-shell",content:`The MOB internal information is stored as four bytes for the size of the underlying cell value and
then a UTF8 string with the name of the MOB HFile that contains the underlying cell value. Note that
by default the entirety of this serialized structure will be passed through the HBase shell's binary
string converter. That means the bytes that make up the value size will most likely be written as
escaped non-printable byte values, e.g. '\\x03', unless they happen to correspond to ASCII
characters.`},{heading:"retrieving-mob-metadata-through-the-hbase-shell",content:"Let's look at a specific example:"},{heading:"retrieving-mob-metadata-through-the-hbase-shell",content:`In this case the first four bytes are \\x00\\x02|\\x94 which corresponds to the bytes
[0x00, 0x02, 0x7C, 0x94]. (Note that the third byte was printed as the ASCII character '|'.)
Decoded as an integer this gives us an underlying value size of 162,964 bytes.`},{heading:"retrieving-mob-metadata-through-the-hbase-shell",content:`The remaining bytes give us an HFile name,
'd41d8cd98f00b204e9800998ecf8427e19700118ffd9c244fe69488bbc9f2c77d24a3e6a'. This HFile will most
likely be stored in the designated MOB storage area for this specific table. However, the file could
also be in the archive area if this table is from a restored snapshot. Furthermore, if the table is
from a cloned snapshot of a different table then the file could be in either the active or archive
area of that source table. As mentioned in the explanation of MOB reference cells above, the Region
Server will use a server side tag to optimize looking at the mob and archive area of the correct
original table when finding the MOB HFile. Since your scan is client side it can't retrieve that tag
and you'll either need to already know the lineage of your table or you'll need to search across all
tables.`},{heading:"retrieving-mob-metadata-through-the-hbase-shell",content:"Assuming you are authenticated as a user with HBase superuser rights, you can search for it:"},{heading:"moving-a-column-family-out-of-mob",content:`If you want to disable MOB on a column family you must ensure you instruct HBase to migrate the data
out of the MOB system prior to turning the feature off. If you fail to do this HBase will return the
internal MOB metadata to applications because it will not know that it needs to resolve the actual
values.`},{heading:"moving-a-column-family-out-of-mob",content:`The following procedure will safely migrate the underlying data without requiring a cluster outage.
Clients will see a number of retries when configuration settings are applied and regions are
reloaded.`},{heading:"procedure-stop-mob-maintenance-change-mob-threshold-rewrite-data-via-compaction",content:`Ensure the MOB compaction chore in the Master is off by setting
hbase.mob.compaction.chore.period to 0. Applying this configuration change will require a
rolling restart of HBase Masters. That will require at least one fail-over of the active master,
which may cause retries for clients doing HBase administrative operations.`},{heading:"procedure-stop-mob-maintenance-change-mob-threshold-rewrite-data-via-compaction",content:`Ensure no MOB compactions are issued for the table via the HBase shell for the duration of this
migration.`},{heading:"change-the-mob-size-threshold",content:`Use the HBase shell to change the MOB size threshold for the column family you are migrating to a
value that is larger than the largest cell present in the column family. E.g. given a table named
'some_table' and a column family named 'foo' we can pick one gigabyte as an arbitrary "bigger than
what we store" value:`},{heading:"change-the-mob-size-threshold",content:"Note that if you are still ingesting data you must ensure this threshold is larger than any cell value you might write; MAX_INT would be a safe choice."},{heading:"perform-a-major-compaction-on-the-table",content:'Specifically you are performing a "normal" compaction and not a MOB compaction.'},{heading:"monitor-for-the-end-of-the-major-compaction",content:"Since compaction is handled asynchronously you'll need to use the shell to first see the compaction start and then see it end."},{heading:"monitor-for-the-end-of-the-major-compaction",content:'HBase should first say that a "MAJOR" compaction is happening.'},{heading:"monitor-for-the-end-of-the-major-compaction",content:'When the compaction has finished the result should print out "NONE".'},{heading:"monitor-for-the-end-of-the-major-compaction",content:`Run the mobrefs utility to ensure there are no MOB cells. Specifically, the tool will launch a
Hadoop MapReduce job that will show a job counter of 0 input records when we've successfully
rewritten all of the data.`},{heading:"monitor-for-the-end-of-the-major-compaction",content:`If the data has not successfully been migrated out, this report will show both a non-zero number
of input records and a count of mob cells.`},{heading:"monitor-for-the-end-of-the-major-compaction",content:"If this happens you should verify that MOB compactions are disabled, verify that you have picked a sufficiently large MOB threshold, and redo the major compaction step."},{heading:"disable-the-mob-feature-for-the-column-family",content:"When the mobrefs report shows that no more data is stored in the MOB system then you can safely alter the column family configuration so that the MOB feature is disabled."},{heading:"disable-the-mob-feature-for-the-column-family",content:"The MOB feature will be disabled on a column family only after altering the column family and performing a major compaction. Before performing the major compaction after altering the column family, the MOB cells will still be present in the MOB storage."},{heading:"disable-the-mob-feature-for-the-column-family",content:"After the column family no longer shows the MOB feature enabled, it is safe to start MOB maintenance chores again. You can allow the default to be used for hbase.mob.compaction.chore.period by removing it from your configuration files or restore it to whatever custom value you had prior to starting this process."},{heading:"clean-up-residual-mob-data",content:`Once the MOB feature is disabled for the column family there will be no internal HBase process
looking for data in the MOB storage area specific to this column family. There will still be data
present there from prior to the compaction process that rewrote the values into HBase's data area.
You can check for this residual data directly in HDFS as an HBase superuser.`},{heading:"clean-up-residual-mob-data",content:"This data is spurious and may be reclaimed. You should sideline it, verify your application's view of the table, and then delete it."},{heading:"data-values-over-than-the-mob-threshold-show-up-stored-in-non-mob-hfiles",content:"Bulk load and WAL split-to-HFile don't consider MOB threshold and write data into normal hfile (under /hbase/data directory)."},{heading:"data-values-over-than-the-mob-threshold-show-up-stored-in-non-mob-hfiles",content:"type: info"},{heading:"data-values-over-than-the-mob-threshold-show-up-stored-in-non-mob-hfiles",content:`This won't cause any functional problem, during next compaction such data will be written out to
the MOB hfiles.`},{heading:"mob-upgrade-considerations",content:`Generally, data stored using the MOB feature should transparently continue to work correctly across
HBase upgrades.`},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:`Prior to the work in HBASE-22749, "Distributed MOB compactions", HBase had the Master coordinate all
compaction maintenance of the MOB hfiles. Centralizing management of the MOB data allowed for space
optimizations but safely coordinating that management with Region Servers resulted in edge cases that
caused data loss (ref HBASE-22075).`},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:`Users of the MOB feature upgrading to a version of HBase that includes HBASE-22749 should be aware
of the following changes:`},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:'The MOB system no longer allows setting "MOB Compaction Policies"'},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:`The MOB system no longer attempts to group MOB values by the date of the original cell's timestamp
according to said compaction policies, daily or otherwise`},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:`The MOB system no longer needs to track individual cell deletes through the use of special
files in the MOB storage area with the suffix _del. After upgrading you should sideline these
files.`},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:`Under default configuration the MOB system should take much less time to perform a compaction of
MOB stored values. This is a direct consequence of the fact that HBase will place a much larger
load on the underlying filesystem when doing compactions of MOB stored values; the additional load
should be a multiple on the order of magnitude of number of region servers. I.e. for a cluster
with three region servers and two masters the default configuration should have HBase put three
times the load on HDFS during major compactions that rewrite MOB data when compared to Master
handled MOB compaction; it should also be approximately three times as fast.`},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:`When the MOB system detects that a table has hfiles with references to MOB data but the reference
hfiles do not yet have the needed file level metadata (i.e. from use of the MOB feature prior to
HBASE-22749) then it will refuse to archive any MOB hfiles from that table. The normal course of
periodic compactions done by Region Servers will update existing hfiles with MOB references, but
until a given table has been through the needed compactions operators should expect to see an
increased amount of storage used by the MOB feature.`},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:`Performing a compaction with type "MOB" no longer has special handling to compact specifically the
MOB hfiles. Instead it will issue a warning and do a compaction of the table. For example using
the HBase shell as follows will result in a warning in the Master logs followed by a major
compaction of the 'example' table in its entirety or for the 'big' column respectively.`},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:'The same is true for directly using the Java API for admin.majorCompact(TableName.valueOf("example"), CompactType.MOB).'},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:`Similarly, manually performing a major compaction on a table or region will also handle compacting
the MOB stored values for that table or region respectively.`},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:"The following configuration setting has been deprecated and replaced:"},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:"hbase.master.mob.ttl.cleaner.period has been replaced with hbase.master.mob.cleaner.period"},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:"The following configuration settings are no longer used:"},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:"hbase.mob.compaction.mergeable.threshold"},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:"hbase.mob.delfile.max.count"},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:"hbase.mob.compaction.batch.size"},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:"hbase.mob.compactor.class"},{heading:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:"hbase.mob.compaction.threads.max"}],headings:[{id:"configuring-columns-for-mob",content:"Configuring Columns for MOB"},{id:"configure-a-column-for-mob-using-hbase-shell",content:"Configure a Column for MOB Using HBase Shell"},{id:"configure-a-column-for-mob-using-the-java-api",content:"Configure a Column for MOB Using the Java API"},{id:"testing-mob",content:"Testing MOB"},{id:"mob-architecture",content:"MOB architecture"},{id:"hbase-mob-overview",content:"Overview"},{id:"mob-compaction",content:"MOB compaction"},{id:"mob-file-archiving",content:"MOB file archiving"},{id:"mob-optimization-tasks",content:"MOB Optimization Tasks"},{id:"further-limiting-write-amplification",content:"Further limiting write amplification"},{id:"configuring-the-mob-cache",content:"Configuring the MOB Cache"},{id:"example-mob-cache-configuration",content:"Example MOB Cache Configuration"},{id:"manually-compacting-mob-files",content:"Manually Compacting MOB Files"},{id:"mob-troubleshooting",content:"MOB Troubleshooting"},{id:"adjusting-the-mob-cleaners-tolerance-for-new-hfiles",content:"Adjusting the MOB cleaner's tolerance for new hfiles"},{id:"retrieving-mob-metadata-through-the-hbase-shell",content:"Retrieving MOB metadata through the HBase Shell"},{id:"moving-a-column-family-out-of-mob",content:"Moving a column family out of MOB"},{id:"procedure-stop-mob-maintenance-change-mob-threshold-rewrite-data-via-compaction",content:"Procedure: Stop MOB maintenance, change MOB threshold, rewrite data via compaction"},{id:"change-the-mob-size-threshold",content:"Change the MOB size threshold"},{id:"perform-a-major-compaction-on-the-table",content:"Perform a major compaction on the table"},{id:"monitor-for-the-end-of-the-major-compaction",content:"Monitor for the end of the major compaction"},{id:"disable-the-mob-feature-for-the-column-family",content:"Disable the MOB feature for the column family"},{id:"clean-up-residual-mob-data",content:"Clean up residual MOB data"},{id:"data-values-over-than-the-mob-threshold-show-up-stored-in-non-mob-hfiles",content:"Data values over than the MOB threshold show up stored in non-MOB hfiles"},{id:"mob-upgrade-considerations",content:"MOB Upgrade Considerations"},{id:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",content:'Upgrading to a version with the "distributed MOB compaction" feature'}]};const m=[{depth:2,url:"#configuring-columns-for-mob",title:e.jsx(e.Fragment,{children:"Configuring Columns for MOB"})},{depth:3,url:"#configure-a-column-for-mob-using-hbase-shell",title:e.jsx(e.Fragment,{children:"Configure a Column for MOB Using HBase Shell"})},{depth:3,url:"#configure-a-column-for-mob-using-the-java-api",title:e.jsx(e.Fragment,{children:"Configure a Column for MOB Using the Java API"})},{depth:2,url:"#testing-mob",title:e.jsx(e.Fragment,{children:"Testing MOB"})},{depth:2,url:"#mob-architecture",title:e.jsx(e.Fragment,{children:"MOB architecture"})},{depth:3,url:"#hbase-mob-overview",title:e.jsx(e.Fragment,{children:"Overview"})},{depth:3,url:"#mob-compaction",title:e.jsx(e.Fragment,{children:"MOB compaction"})},{depth:3,url:"#mob-file-archiving",title:e.jsx(e.Fragment,{children:"MOB file archiving"})},{depth:2,url:"#mob-optimization-tasks",title:e.jsx(e.Fragment,{children:"MOB Optimization Tasks"})},{depth:3,url:"#further-limiting-write-amplification",title:e.jsx(e.Fragment,{children:"Further limiting write amplification"})},{depth:3,url:"#configuring-the-mob-cache",title:e.jsx(e.Fragment,{children:"Configuring the MOB Cache"})},{depth:4,url:"#example-mob-cache-configuration",title:e.jsx(e.Fragment,{children:"Example MOB Cache Configuration"})},{depth:3,url:"#manually-compacting-mob-files",title:e.jsx(e.Fragment,{children:"Manually Compacting MOB Files"})},{depth:2,url:"#mob-troubleshooting",title:e.jsx(e.Fragment,{children:"MOB Troubleshooting"})},{depth:3,url:"#adjusting-the-mob-cleaners-tolerance-for-new-hfiles",title:e.jsx(e.Fragment,{children:"Adjusting the MOB cleaner's tolerance for new hfiles"})},{depth:3,url:"#retrieving-mob-metadata-through-the-hbase-shell",title:e.jsx(e.Fragment,{children:"Retrieving MOB metadata through the HBase Shell"})},{depth:3,url:"#moving-a-column-family-out-of-mob",title:e.jsx(e.Fragment,{children:"Moving a column family out of MOB"})},{depth:4,url:"#procedure-stop-mob-maintenance-change-mob-threshold-rewrite-data-via-compaction",title:e.jsx(e.Fragment,{children:"Procedure: Stop MOB maintenance, change MOB threshold, rewrite data via compaction"})},{depth:5,url:"#change-the-mob-size-threshold",title:e.jsx(e.Fragment,{children:"Change the MOB size threshold"})},{depth:5,url:"#perform-a-major-compaction-on-the-table",title:e.jsx(e.Fragment,{children:"Perform a major compaction on the table"})},{depth:5,url:"#monitor-for-the-end-of-the-major-compaction",title:e.jsx(e.Fragment,{children:"Monitor for the end of the major compaction"})},{depth:5,url:"#disable-the-mob-feature-for-the-column-family",title:e.jsx(e.Fragment,{children:"Disable the MOB feature for the column family"})},{depth:5,url:"#clean-up-residual-mob-data",title:e.jsx(e.Fragment,{children:"Clean up residual MOB data"})},{depth:3,url:"#data-values-over-than-the-mob-threshold-show-up-stored-in-non-mob-hfiles",title:e.jsx(e.Fragment,{children:"Data values over than the MOB threshold show up stored in non-MOB hfiles"})},{depth:2,url:"#mob-upgrade-considerations",title:e.jsx(e.Fragment,{children:"MOB Upgrade Considerations"})},{depth:3,url:"#upgrading-to-a-version-with-the-distributed-mob-compaction-feature",title:e.jsx(e.Fragment,{children:'Upgrading to a version with the "distributed MOB compaction" feature'})}];function l(n){const i={a:"a",annotation:"annotation",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",h5:"h5",li:"li",math:"math",mfrac:"mfrac",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",mspace:"mspace",msub:"msub",mtext:"mtext",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...n.components},{Callout:a,Step:s,Steps:h}=i;return a||t("Callout"),s||t("Step"),h||t("Steps"),e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:[`Data comes in many sizes, and saving all of your data in HBase, including binary
data such as images and documents, is ideal. While HBase can technically handle
binary objects with cells that are larger than 100 KB in size, HBase's normal
read and write paths are optimized for values smaller than 100KB in size. When
HBase deals with large numbers of objects over this threshold, referred to here
as medium objects, or MOBs, performance is degraded due to write amplification
caused by splits and compactions. When using MOBs, ideally your objects will be between
100KB and 10MB (see the `,e.jsx(i.a,{href:"/docs/faq",children:"faq"}),`). HBase 2 added special internal handling of MOBs
to maintain performance, consistency, and low operational overhead. MOB support is
provided by the work done in `,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-11339",children:"HBASE-11339"}),`.
To take advantage of MOB, you need to use `,e.jsx(i.a,{href:"/docs/hfile-format#hbase-file-format-with-security-enhancements-version-3",children:"HFile version 3"}),`. Optionally,
configure the MOB file reader's cache settings for each RegionServer (see
`,e.jsx(i.a,{href:"/docs/architecture/hbase-mob#configuring-the-mob-cache",children:"Configure the MOB Cache"}),`), then configure specific columns to hold MOB data.
Client code does not need to change to take advantage of HBase MOB support. The
feature is transparent to the client.`]}),`
`,e.jsx(i.h2,{id:"configuring-columns-for-mob",children:"Configuring Columns for MOB"}),`
`,e.jsxs(i.p,{children:[`You can configure columns to support MOB during table creation or alteration,
either in HBase Shell or via the Java API. The two relevant properties are the
boolean `,e.jsx(i.code,{children:"IS_MOB"})," and the ",e.jsx(i.code,{children:"MOB_THRESHOLD"}),`, which is the number of bytes at which
an object is considered to be a MOB. Only `,e.jsx(i.code,{children:"IS_MOB"}),` is required. If you do not
specify the `,e.jsx(i.code,{children:"MOB_THRESHOLD"}),", the default threshold value of 100 KB is used."]}),`
`,e.jsx(i.h3,{id:"configure-a-column-for-mob-using-hbase-shell",children:"Configure a Column for MOB Using HBase Shell"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"create"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 't1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'f1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" IS_MOB"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MOB_THRESHOLD"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 102400"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"alter"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 't1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'f1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" IS_MOB"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MOB_THRESHOLD"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 102400"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}"})]})]})})}),`
`,e.jsx(i.h3,{id:"configure-a-column-for-mob-using-the-java-api",children:"Configure a Column for MOB Using the Java API"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HColumnDescriptor hcd "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HColumnDescriptor"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"f"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hcd."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setMobEnabled"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"true"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hcd."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setMobThreshold"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"102400L"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})})]})})}),`
`,e.jsx(i.h2,{id:"testing-mob",children:"Testing MOB"}),`
`,e.jsxs(i.p,{children:["The utility ",e.jsx(i.code,{children:"org.apache.hadoop.hbase.IntegrationTestIngestWithMOB"}),` is provided to assist with testing
the MOB feature. The utility is run as follows:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sudo"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -u"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.IntegrationTestIngestWithMOB"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"        -threshold"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1024"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"        -minMobDataSize"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 512"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"        -maxMobDataSize"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 5120"})]})]})})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"threshold"})}),` is the threshold at which cells are considered to be MOBs.
The default is 1 kB, expressed in bytes.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"minMobDataSize"})}),` is the minimum value for the size of MOB data.
The default is 512 B, expressed in bytes.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"maxMobDataSize"})}),` is the maximum value for the size of MOB data.
The default is 5 kB, expressed in bytes.`]}),`
`]}),`
`,e.jsx(i.h2,{id:"mob-architecture",children:"MOB architecture"}),`
`,e.jsxs(i.p,{children:[`This section is derived from information found in
`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-11339",children:"HBASE-11339"}),`, which covered the initial GA
implementation of MOB in HBase and
`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-22749",children:"HBASE-22749"}),`, which improved things by
parallelizing MOB maintenance across the RegionServers. For more information see
the last version of the design doc created during the initial work,
"`,e.jsx(i.a,{href:"https://github.com/apache/hbase/blob/master/dev-support/design-docs/HBASE-11339%20MOB%20GA%20design.pdf",children:"HBASE-11339 MOB GA design.pdf"}),`",
and the design doc for the distributed mob compaction feature,
"`,e.jsx(i.a,{href:"https://github.com/apache/hbase/blob/master/dev-support/design-docs/HBASE-22749%20MOB%20distributed%20compaction.pdf",children:"HBASE-22749 MOB distributed compaction.pdf"}),'".']}),`
`,e.jsx(i.h3,{id:"hbase-mob-overview",children:"Overview"}),`
`,e.jsx(i.p,{children:`The MOB feature reduces the overall IO load for configured column families by storing values that
are larger than the configured threshold outside of the normal regions to avoid splits, merges, and
most importantly normal compactions.`}),`
`,e.jsx(i.p,{children:`When a cell is first written to a region it is stored in the WAL and memstore regardless of value
size. When memstores from a column family configured to use MOB are eventually flushed two hfiles
are written simultaneously. Cells with a value smaller than the threshold size are written to a
normal region hfile. Cells with a value larger than the threshold are written into a special MOB
hfile and also have a MOB reference cell written into the normal region HFile. As the Region Server
flushes a MOB enabled memstore and closes a given normal region HFile it appends metadata that lists
each of the special MOB hfiles referenced by the cells within.`}),`
`,e.jsx(i.p,{children:`MOB reference cells have the same key as the cell they are based on. The value of the reference cell
is made up of two pieces of metadata: the size of the actual value and the MOB hfile that contains
the original cell. In addition to any tags originally written to HBase, the reference cell prepends
two additional tags. The first is a marker tag that says the cell is a MOB reference. This can be
used later to scan specifically just for reference cells. The second stores the namespace and table
at the time the MOB hfile is written out. This tag is used to optimize how the MOB system finds
the underlying value in MOB hfiles after a series of HBase snapshot operations (ref HBASE-12332).
Note that tags are only available within HBase servers and by default are not sent over RPCs.`}),`
`,e.jsx(i.p,{children:`All MOB hfiles for a given table are managed within a logical region that does not directly serve
requests. When these MOB hfiles are created from a flush or MOB compaction they are placed in a
dedicated mob data area under the hbase root directory specific to the namespace, table, mob
logical region, and column family. In general that means a path structured like:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"%HBase Root Dir%/mobdir/data/%namespace%/%table%/%logical region%/%column family%/"})})})})}),`
`,e.jsx(i.p,{children:`With default configs, an example table named 'some_table' in the
default namespace with a MOB enabled column family named 'foo' this HDFS directory would be`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"/hbase/mobdir/data/default/some_table/372c1b27e3dc0b56c3a031926e5efbe9/foo/"})})})})}),`
`,e.jsx(i.p,{children:`These MOB hfiles are maintained by special chores in the HBase Master and across the individual
Region Servers. Specifically those chores take care of enforcing TTLs and compacting them. Note that
this compaction is primarily a matter of controlling the total number of files in HDFS because our
operational assumptions for MOB data is that it will seldom update or delete.`}),`
`,e.jsx(i.p,{children:`When a given MOB hfile is no longer needed as a result of our compaction process then a chore in
the Master will take care of moving it to the archive just
like any normal hfile. Because the table's mob region is independent of all the normal regions it
can coexist with them in the regular archive storage area:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"/hbase/archive/data/default/some_table/372c1b27e3dc0b56c3a031926e5efbe9/foo/"})})})})}),`
`,e.jsx(i.p,{children:`The same hfile cleaning chores that take care of eventually deleting unneeded archived files from
normal regions thus also will take care of these MOB hfiles. As such, if there is a snapshot of a
MOB enabled table then the cleaning system will make sure those MOB files stick around in the
archive area as long as they are needed by a snapshot or a clone of a snapshot.`}),`
`,e.jsx(i.h3,{id:"mob-compaction",children:"MOB compaction"}),`
`,e.jsx(i.p,{children:`Each time the memstore for a MOB enabled column family performs a flush HBase will write values over
the MOB threshold into MOB specific hfiles. When normal region compaction occurs the Region Server
rewrites the normal data files while maintaining references to these MOB files without rewriting
them. Normal client lookups for MOB values transparently will receive the original values because
the Region Server internals take care of using the reference data to then pull the value out of a
specific MOB file. This indirection means that building up a large number of MOB hfiles doesn't
impact the overall time to retrieve any specific MOB cell. Thus, we need not perform compactions of
the MOB hfiles nearly as often as normal hfiles. As a result, HBase saves IO by not rewriting MOB
hfiles as a part of the periodic compactions a Region Server does on its own.`}),`
`,e.jsx(i.p,{children:`However, if deletes and updates of MOB cells are frequent then this indirection will begin to waste
space. The only way to stop using the space of a particular MOB hfile is to ensure no cells still
hold references to it. To do that we need to ensure we have written the current values into a new
MOB hfile. If our backing filesystem has a limitation on the number of files that can be present, as
HDFS does, then even if we do not have deletes or updates of MOB cells eventually there will be a
sufficient number of MOB hfiles that we will need to coalesce them.`}),`
`,e.jsxs(i.p,{children:[`Periodically a chore in the master coordinates having the region servers
perform a special major compaction that also handles rewriting new MOB files. Like all compactions
the Region Server will create updated hfiles that hold both the cells that are smaller than the MOB
threshold and cells that hold references to the newly rewritten MOB file. Because this rewriting has
the advantage of looking across all active cells for the region our several small MOB files should
end up as a single MOB file per region. The chore defaults to running weekly and can be
configured by setting `,e.jsx(i.code,{children:"hbase.mob.compaction.chore.period"})," to the desired period in seconds."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.mob.compaction.chore.period</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">2592000</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">Example of changing the chore period from a week to a month.</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsxs(i.p,{children:[`By default, the periodic MOB compaction coordination chore will attempt to keep every region
busy doing compactions in parallel in order to maximize the amount of work done on the cluster.
If you need to tune the amount of IO this compaction generates on the underlying filesystem, you
can control how many concurrent region-level compaction requests are allowed by setting
`,e.jsx(i.code,{children:"hbase.mob.major.compaction.region.batch.size"}),` to an integer number greater than zero. If you set
the configuration to 0 then you will get the default behavior of attempting to do all regions in
parallel.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.mob.major.compaction.region.batch.size</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">1</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:'>Example of switching from "as parallel as possible" to "serially"</'}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(i.h3,{id:"mob-file-archiving",children:"MOB file archiving"}),`
`,e.jsx(i.p,{children:`Eventually we will have MOB hfiles that are no longer needed. Either clients will overwrite the
value or a MOB-rewriting compaction will store a reference to a newer larger MOB hfile. Because any
given MOB cell could have originally been written either in the current region or in a parent region
that existed at some prior point in time, individual Region Servers do not decide when it is time
to archive MOB hfiles. Instead a periodic chore in the Master evaluates MOB hfiles for archiving.`}),`
`,e.jsx(i.p,{children:"A MOB HFile will be subject to archiving under any of the following conditions:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Any MOB HFile older than the column family's TTL"}),`
`,e.jsx(i.li,{children:`Any MOB HFile older than a "too recent" threshold with no references to it from the regular hfiles
for all regions in a column family`}),`
`]}),`
`,e.jsx(i.p,{children:`To determine if a MOB HFile meets the second criteria the chore extracts metadata from the regular
HFiles for each MOB enabled column family for a given table. That metadata enumerates the complete
set of MOB HFiles needed to satisfy the references stored in the normal HFile area.`}),`
`,e.jsxs(i.p,{children:["The period of the cleaner chore can be configured by setting ",e.jsx(i.code,{children:"hbase.master.mob.cleaner.period"}),` to a
positive integer number of seconds. It defaults to running daily. You should not need to tune it
unless you have a very aggressive TTL or a very high rate of MOB updates with a correspondingly
high rate of non-MOB compactions.`]}),`
`,e.jsx(i.h2,{id:"mob-optimization-tasks",children:"MOB Optimization Tasks"}),`
`,e.jsx(i.h3,{id:"further-limiting-write-amplification",children:"Further limiting write amplification"}),`
`,e.jsx(i.p,{children:`If your MOB workload has few to no updates or deletes then you can opt-in to MOB compactions that
optimize for limiting the amount of write amplification. It achieves this by setting a
size threshold to ignore MOB files during the compaction process. When a given region goes
through MOB compaction it will evaluate the size of the MOB file that currently holds the actual
value and skip rewriting the value if that file is over threshold.`}),`
`,e.jsxs(i.p,{children:[`The bound of write amplification in this mode can be approximated as
"Write Amplification" = `,e.jsxs(i.span,{className:"katex",children:[e.jsx(i.span,{className:"katex-mathml",children:e.jsx(i.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(i.semantics,{children:[e.jsxs(i.mrow,{children:[e.jsxs(i.msub,{children:[e.jsxs(i.mrow,{children:[e.jsx(i.mi,{children:"log"}),e.jsx(i.mo,{children:"⁡"})]}),e.jsx(i.mi,{children:"K"})]}),e.jsx(i.mtext,{children:" ⁣"}),e.jsxs(i.mrow,{children:[e.jsx(i.mo,{fence:"true",children:"("}),e.jsxs(i.mfrac,{children:[e.jsx(i.mi,{children:"M"}),e.jsx(i.mi,{children:"S"})]}),e.jsx(i.mo,{fence:"true",children:")"})]})]}),e.jsx(i.annotation,{encoding:"application/x-tex",children:"\\log_{K}\\!\\left(\\frac{M}{S}\\right)"})]})})}),e.jsx(i.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(i.span,{className:"base",children:[e.jsx(i.span,{className:"strut",style:{height:"1.2223em",verticalAlign:"-0.35em"}}),e.jsxs(i.span,{className:"mop",children:[e.jsxs(i.span,{className:"mop",children:["lo",e.jsx(i.span,{style:{marginRight:"0.01389em"},children:"g"})]}),e.jsx(i.span,{className:"msupsub",children:e.jsxs(i.span,{className:"vlist-t vlist-t2",children:[e.jsxs(i.span,{className:"vlist-r",children:[e.jsx(i.span,{className:"vlist",style:{height:"0.2342em"},children:e.jsxs(i.span,{style:{top:"-2.4559em",marginRight:"0.05em"},children:[e.jsx(i.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(i.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(i.span,{className:"mord mtight",children:e.jsx(i.span,{className:"mord mathnormal mtight",style:{marginRight:"0.07153em"},children:"K"})})})]})}),e.jsx(i.span,{className:"vlist-s",children:"​"})]}),e.jsx(i.span,{className:"vlist-r",children:e.jsx(i.span,{className:"vlist",style:{height:"0.2441em"},children:e.jsx(i.span,{})})})]})})]}),e.jsx(i.span,{className:"mspace",style:{marginRight:"-0.1667em"}}),e.jsx(i.span,{className:"mspace",style:{marginRight:"0.1667em"}}),e.jsxs(i.span,{className:"minner",children:[e.jsx(i.span,{className:"mopen delimcenter",style:{top:"0em"},children:e.jsx(i.span,{className:"delimsizing size1",children:"("})}),e.jsxs(i.span,{className:"mord",children:[e.jsx(i.span,{className:"mopen nulldelimiter"}),e.jsx(i.span,{className:"mfrac",children:e.jsxs(i.span,{className:"vlist-t vlist-t2",children:[e.jsxs(i.span,{className:"vlist-r",children:[e.jsxs(i.span,{className:"vlist",style:{height:"0.8723em"},children:[e.jsxs(i.span,{style:{top:"-2.655em"},children:[e.jsx(i.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(i.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(i.span,{className:"mord mtight",children:e.jsx(i.span,{className:"mord mathnormal mtight",style:{marginRight:"0.05764em"},children:"S"})})})]}),e.jsxs(i.span,{style:{top:"-3.23em"},children:[e.jsx(i.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(i.span,{className:"frac-line",style:{borderBottomWidth:"0.04em"}})]}),e.jsxs(i.span,{style:{top:"-3.394em"},children:[e.jsx(i.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(i.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(i.span,{className:"mord mtight",children:e.jsx(i.span,{className:"mord mathnormal mtight",style:{marginRight:"0.10903em"},children:"M"})})})]})]}),e.jsx(i.span,{className:"vlist-s",children:"​"})]}),e.jsx(i.span,{className:"vlist-r",children:e.jsx(i.span,{className:"vlist",style:{height:"0.345em"},children:e.jsx(i.span,{})})})]})}),e.jsx(i.span,{className:"mclose nulldelimiter"})]}),e.jsx(i.span,{className:"mclose delimcenter",style:{top:"0em"},children:e.jsx(i.span,{className:"delimsizing size1",children:")"})})]})]})})]})," where ",e.jsx(i.strong,{children:"K"}),` is the number of files in compaction
selection, `,e.jsx(i.strong,{children:"M"})," is the configurable threshold for MOB files size, and ",e.jsx(i.strong,{children:"S"}),` is the minmum size of
memstore flushes that create MOB files in the first place. For example given 5 files picked up per
compaction, a threshold of 1 GB, and a flush size of 10MB the write amplification will be
`,e.jsxs(i.span,{className:"katex",children:[e.jsx(i.span,{className:"katex-mathml",children:e.jsx(i.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(i.semantics,{children:[e.jsxs(i.mrow,{children:[e.jsx(i.mi,{children:"log"}),e.jsx(i.mo,{children:"⁡"}),e.jsxs(i.msub,{children:[e.jsx(i.mspace,{linebreak:"newline"}),e.jsx(i.mn,{children:"5"})]}),e.jsx(i.mtext,{children:" ⁣"}),e.jsxs(i.mrow,{children:[e.jsx(i.mo,{fence:"true",children:"("}),e.jsxs(i.mfrac,{children:[e.jsxs(i.mrow,{children:[e.jsx(i.mn,{children:"1"}),e.jsx(i.mtext,{children:" "}),e.jsx(i.mtext,{children:"GB"})]}),e.jsxs(i.mrow,{children:[e.jsx(i.mn,{children:"10"}),e.jsx(i.mtext,{children:" "}),e.jsx(i.mtext,{children:"MB"})]})]}),e.jsx(i.mo,{fence:"true",children:")"})]}),e.jsx(i.mo,{children:"="}),e.jsx(i.mi,{children:"log"}),e.jsx(i.mo,{children:"⁡"}),e.jsxs(i.msub,{children:[e.jsx(i.mspace,{linebreak:"newline"}),e.jsx(i.mn,{children:"5"})]}),e.jsx(i.mo,{stretchy:"false",children:"("}),e.jsx(i.mn,{children:"100"}),e.jsx(i.mo,{stretchy:"false",children:")"}),e.jsx(i.mo,{children:"≈"}),e.jsx(i.mn,{children:"2.86"})]}),e.jsx(i.annotation,{encoding:"application/x-tex",children:"\\log\\\\_{5}\\!\\left(\\frac{1\\,\\text{GB}}{10\\,\\text{MB}}\\right) = \\log\\\\_{5}(100) \\approx 2.86"})]})})}),e.jsxs(i.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(i.span,{className:"base",children:[e.jsx(i.span,{className:"strut",style:{height:"1.2223em",verticalAlign:"-0.35em"}}),e.jsxs(i.span,{className:"mop",children:["lo",e.jsx(i.span,{style:{marginRight:"0.01389em"},children:"g"})]}),e.jsx(i.span,{className:"mspace",style:{marginRight:"0.1667em"}}),e.jsxs(i.span,{className:"mord",children:[e.jsx(i.span,{className:"mspace newline"}),e.jsx(i.span,{className:"msupsub",children:e.jsxs(i.span,{className:"vlist-t vlist-t2",children:[e.jsxs(i.span,{className:"vlist-r",children:[e.jsx(i.span,{className:"vlist",style:{height:"0.3011em"},children:e.jsxs(i.span,{style:{top:"-2.55em",marginRight:"0.05em"},children:[e.jsx(i.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(i.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(i.span,{className:"mord mtight",children:e.jsx(i.span,{className:"mord mtight",children:"5"})})})]})}),e.jsx(i.span,{className:"vlist-s",children:"​"})]}),e.jsx(i.span,{className:"vlist-r",children:e.jsx(i.span,{className:"vlist",style:{height:"0.15em"},children:e.jsx(i.span,{})})})]})})]}),e.jsx(i.span,{className:"mspace",style:{marginRight:"-0.1667em"}}),e.jsx(i.span,{className:"mspace",style:{marginRight:"0.1667em"}}),e.jsxs(i.span,{className:"minner",children:[e.jsx(i.span,{className:"mopen delimcenter",style:{top:"0em"},children:e.jsx(i.span,{className:"delimsizing size1",children:"("})}),e.jsxs(i.span,{className:"mord",children:[e.jsx(i.span,{className:"mopen nulldelimiter"}),e.jsx(i.span,{className:"mfrac",children:e.jsxs(i.span,{className:"vlist-t vlist-t2",children:[e.jsxs(i.span,{className:"vlist-r",children:[e.jsxs(i.span,{className:"vlist",style:{height:"0.8723em"},children:[e.jsxs(i.span,{style:{top:"-2.655em"},children:[e.jsx(i.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(i.span,{className:"sizing reset-size6 size3 mtight",children:e.jsxs(i.span,{className:"mord mtight",children:[e.jsx(i.span,{className:"mord mtight",children:"10"}),e.jsx(i.span,{className:"mspace mtight",style:{marginRight:"0.1952em"}}),e.jsx(i.span,{className:"mord text mtight",children:e.jsx(i.span,{className:"mord mtight",children:"MB"})})]})})]}),e.jsxs(i.span,{style:{top:"-3.23em"},children:[e.jsx(i.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(i.span,{className:"frac-line",style:{borderBottomWidth:"0.04em"}})]}),e.jsxs(i.span,{style:{top:"-3.394em"},children:[e.jsx(i.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(i.span,{className:"sizing reset-size6 size3 mtight",children:e.jsxs(i.span,{className:"mord mtight",children:[e.jsx(i.span,{className:"mord mtight",children:"1"}),e.jsx(i.span,{className:"mspace mtight",style:{marginRight:"0.1952em"}}),e.jsx(i.span,{className:"mord text mtight",children:e.jsx(i.span,{className:"mord mtight",children:"GB"})})]})})]})]}),e.jsx(i.span,{className:"vlist-s",children:"​"})]}),e.jsx(i.span,{className:"vlist-r",children:e.jsx(i.span,{className:"vlist",style:{height:"0.345em"},children:e.jsx(i.span,{})})})]})}),e.jsx(i.span,{className:"mclose nulldelimiter"})]}),e.jsx(i.span,{className:"mclose delimcenter",style:{top:"0em"},children:e.jsx(i.span,{className:"delimsizing size1",children:")"})})]}),e.jsx(i.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(i.span,{className:"mrel",children:"="}),e.jsx(i.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(i.span,{className:"base",children:[e.jsx(i.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsxs(i.span,{className:"mop",children:["lo",e.jsx(i.span,{style:{marginRight:"0.01389em"},children:"g"})]}),e.jsx(i.span,{className:"mspace",style:{marginRight:"0.1667em"}}),e.jsxs(i.span,{className:"mord",children:[e.jsx(i.span,{className:"mspace newline"}),e.jsx(i.span,{className:"msupsub",children:e.jsxs(i.span,{className:"vlist-t vlist-t2",children:[e.jsxs(i.span,{className:"vlist-r",children:[e.jsx(i.span,{className:"vlist",style:{height:"0.3011em"},children:e.jsxs(i.span,{style:{top:"-2.55em",marginRight:"0.05em"},children:[e.jsx(i.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(i.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(i.span,{className:"mord mtight",children:e.jsx(i.span,{className:"mord mtight",children:"5"})})})]})}),e.jsx(i.span,{className:"vlist-s",children:"​"})]}),e.jsx(i.span,{className:"vlist-r",children:e.jsx(i.span,{className:"vlist",style:{height:"0.15em"},children:e.jsx(i.span,{})})})]})})]}),e.jsx(i.span,{className:"mopen",children:"("}),e.jsx(i.span,{className:"mord",children:"100"}),e.jsx(i.span,{className:"mclose",children:")"}),e.jsx(i.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(i.span,{className:"mrel",children:"≈"}),e.jsx(i.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(i.span,{className:"base",children:[e.jsx(i.span,{className:"strut",style:{height:"0.6444em"}}),e.jsx(i.span,{className:"mord",children:"2.86"})]})]})]}),"."]}),`
`,e.jsxs(i.p,{children:[`If we are using an underlying filesystem with a limitation on the number of files, such as HDFS,
and we know our expected data set size we can choose our maximum file size in order to approach
this limit but stay within it in order to minimize write amplification. For example, if we expect to
store a petabyte and we have a conservative limitation of a million files in our HDFS instance, then
`,e.jsxs(i.span,{className:"katex",children:[e.jsx(i.span,{className:"katex-mathml",children:e.jsx(i.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(i.semantics,{children:[e.jsxs(i.mrow,{children:[e.jsxs(i.mfrac,{children:[e.jsxs(i.mrow,{children:[e.jsx(i.mn,{children:"1"}),e.jsx(i.mtext,{children:" "}),e.jsx(i.mtext,{children:"PB"})]}),e.jsxs(i.mrow,{children:[e.jsx(i.mn,{children:"1"}),e.jsx(i.mtext,{children:" "}),e.jsx(i.mtext,{children:"M"})]})]}),e.jsx(i.mo,{children:"="}),e.jsx(i.mn,{children:"1"}),e.jsx(i.mtext,{children:" "}),e.jsx(i.mtext,{children:"GB"})]}),e.jsx(i.annotation,{encoding:"application/x-tex",children:"\\frac{1\\,\\text{PB}}{1\\,\\text{M}} = 1\\,\\text{GB}"})]})})}),e.jsxs(i.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(i.span,{className:"base",children:[e.jsx(i.span,{className:"strut",style:{height:"1.2173em",verticalAlign:"-0.345em"}}),e.jsxs(i.span,{className:"mord",children:[e.jsx(i.span,{className:"mopen nulldelimiter"}),e.jsx(i.span,{className:"mfrac",children:e.jsxs(i.span,{className:"vlist-t vlist-t2",children:[e.jsxs(i.span,{className:"vlist-r",children:[e.jsxs(i.span,{className:"vlist",style:{height:"0.8723em"},children:[e.jsxs(i.span,{style:{top:"-2.655em"},children:[e.jsx(i.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(i.span,{className:"sizing reset-size6 size3 mtight",children:e.jsxs(i.span,{className:"mord mtight",children:[e.jsx(i.span,{className:"mord mtight",children:"1"}),e.jsx(i.span,{className:"mspace mtight",style:{marginRight:"0.1952em"}}),e.jsx(i.span,{className:"mord text mtight",children:e.jsx(i.span,{className:"mord mtight",children:"M"})})]})})]}),e.jsxs(i.span,{style:{top:"-3.23em"},children:[e.jsx(i.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(i.span,{className:"frac-line",style:{borderBottomWidth:"0.04em"}})]}),e.jsxs(i.span,{style:{top:"-3.394em"},children:[e.jsx(i.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(i.span,{className:"sizing reset-size6 size3 mtight",children:e.jsxs(i.span,{className:"mord mtight",children:[e.jsx(i.span,{className:"mord mtight",children:"1"}),e.jsx(i.span,{className:"mspace mtight",style:{marginRight:"0.1952em"}}),e.jsx(i.span,{className:"mord text mtight",children:e.jsx(i.span,{className:"mord mtight",children:"PB"})})]})})]})]}),e.jsx(i.span,{className:"vlist-s",children:"​"})]}),e.jsx(i.span,{className:"vlist-r",children:e.jsx(i.span,{className:"vlist",style:{height:"0.345em"},children:e.jsx(i.span,{})})})]})}),e.jsx(i.span,{className:"mclose nulldelimiter"})]}),e.jsx(i.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(i.span,{className:"mrel",children:"="}),e.jsx(i.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(i.span,{className:"base",children:[e.jsx(i.span,{className:"strut",style:{height:"0.6833em"}}),e.jsx(i.span,{className:"mord",children:"1"}),e.jsx(i.span,{className:"mspace",style:{marginRight:"0.1667em"}}),e.jsx(i.span,{className:"mord text",children:e.jsx(i.span,{className:"mord",children:"GB"})})]})]})]})," gives us a target limitation of a gigabyte per MOB file."]}),`
`,e.jsxs(i.p,{children:["To opt-in to this compaction mode you must set ",e.jsx(i.code,{children:"hbase.mob.compaction.type"})," to ",e.jsx(i.code,{children:"optimized"}),`. The
default MOB size threshold in this mode is set to 1GB. It can be changed by setting
`,e.jsx(i.code,{children:"hbase.mob.compactions.max.file.size"})," to a positive integer number of bytes."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.mob.compaction.type</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">optimized</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">opt-in to write amplification optimized mob compaction.</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.mob.compactions.max.file.size</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">10737418240</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">Example of tuning the max mob file size to 10GB</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(i.p,{children:`Additionally, when operating in this mode the compaction process will seek to avoid writing MOB
files that are over the max file threshold. As it is writing out a additional MOB values into a MOB
hfile it will check to see if the additional data causes the hfile to be over the max file size.
When the hfile of MOB values reaches limit, the MOB hfile is committed to the MOB storage area and
a new one is created. The hfile with reference cells will track the complete set of MOB hfiles it
needs in its metadata.`}),`
`,e.jsx(a,{type:"warn",title:"Be mindful of total time to complete compaction of a region",children:e.jsxs(i.p,{children:[`When using the write amplification optimized compaction mode you need to watch for the maximum
time to compact a single region. If it nears an hour you should read through the troubleshooting
section below `,e.jsx(i.a,{href:"/docs/architecture/hbase-mob#adjusting-the-mob-cleaners-tolerance-for-new-hfiles",children:`Adjusting the MOB cleaner's tolerance for new
hfiles`}),`. Failure
to make the adjustments discussed there could lead to dataloss.`]})}),`
`,e.jsx(i.h3,{id:"configuring-the-mob-cache",children:"Configuring the MOB Cache"}),`
`,e.jsxs(i.p,{children:[`Because there can be a large number of MOB files at any time, as compared to the number of HFiles,
MOB files are not always kept open. The MOB file reader cache is a LRU cache which keeps the most
recently used MOB files open. To configure the MOB file reader's cache on each RegionServer, add
the following properties to the RegionServer's `,e.jsx(i.code,{children:"hbase-site.xml"}),`, customize the configuration to
suit your environment, and restart or rolling restart the RegionServer.`]}),`
`,e.jsx(i.h4,{id:"example-mob-cache-configuration",children:"Example MOB Cache Configuration"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.mob.file.cache.size</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">1000</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Number of opened file handlers to cache."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    A larger value will benefit reads by providing more file handlers per mob"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    file cache and would reduce frequent file opening and closing."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:'    However, if this is set too high, this could lead to a "too many opened file handers"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    The default value is 1000."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.mob.cache.evict.period</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">3600</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    The amount of time in seconds after which an unused file is evicted from the"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    MOB cache. The default value is 3600 seconds."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.mob.cache.evict.remain.ratio</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">0.5f</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    A multiplier (between 0.0 and 1.0), which determines how many files remain cached"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    after the threshold of files that remains cached after a cache eviction occurs"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    which is triggered by reaching the `hbase.mob.file.cache.size` threshold."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    The default value is 0.5f, which means that half the files (the least-recently-used"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ones) are evicted."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(i.h3,{id:"manually-compacting-mob-files",children:"Manually Compacting MOB Files"}),`
`,e.jsxs(i.p,{children:[`To manually compact MOB files, rather than waiting for the
periodic chore to trigger compaction, use the
`,e.jsx(i.code,{children:"major_compact"}),` HBase shell commands. These commands
require the first argument to be the table name, and take a column
family as the second argument. If used with a column family that includes MOB data, then
these operator requests will result in the MOB data being compacted.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"major_compact"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 't1'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"major_compact"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 't2',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'c1'"})]})]})})}),`
`,e.jsxs(i.p,{children:["This same request can be made via the ",e.jsx(i.code,{children:"Admin.majorCompact"})," Java API."]}),`
`,e.jsx(i.h2,{id:"mob-troubleshooting",children:"MOB Troubleshooting"}),`
`,e.jsx(i.h3,{id:"adjusting-the-mob-cleaners-tolerance-for-new-hfiles",children:"Adjusting the MOB cleaner's tolerance for new hfiles"}),`
`,e.jsx(i.p,{children:`The MOB cleaner chore ignores all MOB hfiles that were created more recently than an hour prior to
the start of the chore to ensure we don't miss the reference metadata from the corresponding regular
hfile. Without this safety check it would be possible for the cleaner chore to see a MOB hfile for
an in progress flush or compaction and prematurely archive the MOB data. This default buffer should
be sufficient for normal use.`}),`
`,e.jsx(i.p,{children:`You will need to adjust the tolerance if you use write amplification optimized MOB compaction and
the combination of your underlying filesystem performance and data shape is such that it could take
more than an hour to complete major compaction of a single region. For example, if your MOB data is
distributed such that your largest region adds 80GB of MOB data between compactions that include
rewriting MOB data and your HDFS cluster is only capable of writing 20MB/s for a single file then
when performing the optimized compaction the Region Server will take about a minute to write the
first 1GB MOB hfile and then another hour and seven minutes to write the remaining seventy-nine 1GB
MOB hfiles before finally committing the new reference hfile at the end of the compaction. Given
this example, you would need a larger tolerance window.`}),`
`,e.jsx(i.p,{children:`You will also need to adjust the tolerance if Region Server flush operations take longer than an
hour for the two HDFS move operations needed to commit both the MOB hfile and the normal hfile that
references it. Such a delay should not happen with a normally configured and healthy HDFS and HBase.`}),`
`,e.jsxs(i.p,{children:[`The cleaner's window for "too recent" is controlled by setting `,e.jsx(i.code,{children:"hbase.mob.min.age.archive"}),` to a
positive integer number of milliseconds.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.mob.min.age.archive</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">86400000</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">Example of tuning the cleaner to only archive files older than a day.</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(i.h3,{id:"retrieving-mob-metadata-through-the-hbase-shell",children:"Retrieving MOB metadata through the HBase Shell"}),`
`,e.jsx(i.p,{children:`While working on troubleshooting failures in the MOB system you can retrieve some of the internal
information through the HBase shell by specifying special attributes on a scan.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"112"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" scan "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'some_table'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"STARTROW"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'00012-example-row-key'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"LIMIT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"113"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"     CACHE_BLOCKS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"ATTRIBUTES"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => { "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'hbase.mob.scan.raw'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"114"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"     'hbase.mob.scan.ref.only'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" } }"})]})]})})}),`
`,e.jsx(i.p,{children:`The MOB internal information is stored as four bytes for the size of the underlying cell value and
then a UTF8 string with the name of the MOB HFile that contains the underlying cell value. Note that
by default the entirety of this serialized structure will be passed through the HBase shell's binary
string converter. That means the bytes that make up the value size will most likely be written as
escaped non-printable byte values, e.g. '\\x03', unless they happen to correspond to ASCII
characters.`}),`
`,e.jsx(i.p,{children:"Let's look at a specific example:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"112"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" scan "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'some_table'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"STARTROW"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'00012-example-row-key'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"LIMIT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"113"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"     CACHE_BLOCKS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"ATTRIBUTES"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => { "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'hbase.mob.scan.raw'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"114"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"     'hbase.mob.scan.ref.only'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" } }"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"ROW"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"                        COLUMN"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"CELL"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 00012"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"example"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"row"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"key     column"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"foo:"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"bar, timestamp"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1511179764"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", value"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"\\x00\\x02"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"|"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"\\x94d41d8cd98f00b204"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                       e9800998ecf8427e19700118ffd9c244fe69488bbc9f2c77d24a3e6a"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(s) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0130"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" seconds"})]})]})})}),`
`,e.jsxs(i.p,{children:["In this case the first four bytes are ",e.jsx(i.code,{children:"\\x00\\x02|\\x94"}),` which corresponds to the bytes
`,e.jsx(i.code,{children:"[0x00, 0x02, 0x7C, 0x94]"}),`. (Note that the third byte was printed as the ASCII character '|'.)
Decoded as an integer this gives us an underlying value size of 162,964 bytes.`]}),`
`,e.jsx(i.p,{children:`The remaining bytes give us an HFile name,
'd41d8cd98f00b204e9800998ecf8427e19700118ffd9c244fe69488bbc9f2c77d24a3e6a'. This HFile will most
likely be stored in the designated MOB storage area for this specific table. However, the file could
also be in the archive area if this table is from a restored snapshot. Furthermore, if the table is
from a cloned snapshot of a different table then the file could be in either the active or archive
area of that source table. As mentioned in the explanation of MOB reference cells above, the Region
Server will use a server side tag to optimize looking at the mob and archive area of the correct
original table when finding the MOB HFile. Since your scan is client side it can't retrieve that tag
and you'll either need to already know the lineage of your table or you'll need to search across all
tables.`}),`
`,e.jsx(i.p,{children:"Assuming you are authenticated as a user with HBase superuser rights, you can search for it:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"hdfs"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dfs"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -find"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -name"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"d41d8cd98f00b204e9800998ecf8427e19700118ffd9c244fe69488bbc9f2c77d24a3e6a"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"/hbase/mobdir/data/default/some_table/372c1b27e3dc0b56c3a031926e5efbe9/foo/d41d8cd98f00b204e9800998ecf8427e19700118ffd9c244fe69488bbc9f2c77d24a3e6a"})})]})})}),`
`,e.jsx(i.h3,{id:"moving-a-column-family-out-of-mob",children:"Moving a column family out of MOB"}),`
`,e.jsx(i.p,{children:`If you want to disable MOB on a column family you must ensure you instruct HBase to migrate the data
out of the MOB system prior to turning the feature off. If you fail to do this HBase will return the
internal MOB metadata to applications because it will not know that it needs to resolve the actual
values.`}),`
`,e.jsx(i.p,{children:`The following procedure will safely migrate the underlying data without requiring a cluster outage.
Clients will see a number of retries when configuration settings are applied and regions are
reloaded.`}),`
`,e.jsx(i.h4,{id:"procedure-stop-mob-maintenance-change-mob-threshold-rewrite-data-via-compaction",children:"Procedure: Stop MOB maintenance, change MOB threshold, rewrite data via compaction"}),`
`,e.jsxs(h,{children:[e.jsx(s,{children:e.jsxs(i.p,{children:[`Ensure the MOB compaction chore in the Master is off by setting
`,e.jsx(i.code,{children:"hbase.mob.compaction.chore.period"})," to ",e.jsx(i.code,{children:"0"}),`. Applying this configuration change will require a
rolling restart of HBase Masters. That will require at least one fail-over of the active master,
which may cause retries for clients doing HBase administrative operations.`]})}),e.jsx(s,{children:e.jsx(i.p,{children:`Ensure no MOB compactions are issued for the table via the HBase shell for the duration of this
migration.`})}),e.jsxs(s,{children:[e.jsx(i.h5,{id:"change-the-mob-size-threshold",children:"Change the MOB size threshold"}),e.jsx(i.p,{children:`Use the HBase shell to change the MOB size threshold for the column family you are migrating to a
value that is larger than the largest cell present in the column family. E.g. given a table named
'some_table' and a column family named 'foo' we can pick one gigabyte as an arbitrary "bigger than
what we store" value:`}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"011"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" alter "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'some_table'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'foo'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"MOB_THRESHOLD"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1000000000'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" Updating"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" all regions with the "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"new"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" schema..."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 9"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"25"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" regions updated."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 25"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"25"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" regions updated."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" Done"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(s) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 3.4940"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" seconds"})]})]})})}),e.jsx(i.p,{children:"Note that if you are still ingesting data you must ensure this threshold is larger than any cell value you might write; MAX_INT would be a safe choice."})]}),e.jsxs(s,{children:[e.jsx(i.h5,{id:"perform-a-major-compaction-on-the-table",children:"Perform a major compaction on the table"}),e.jsx(i.p,{children:'Specifically you are performing a "normal" compaction and not a MOB compaction.'}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"012"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" major_compact "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'some_table'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(s) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.2600"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" seconds"})]})]})})})]}),e.jsxs(s,{children:[e.jsx(i.h5,{id:"monitor-for-the-end-of-the-major-compaction",children:"Monitor for the end of the major compaction"}),e.jsx(i.p,{children:"Since compaction is handled asynchronously you'll need to use the shell to first see the compaction start and then see it end."}),e.jsx(i.p,{children:'HBase should first say that a "MAJOR" compaction is happening.'}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"015"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" @hbase."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"admin"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(@formatter)."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"instance_eval"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" do"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"016"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"   p"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" @admin."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get_compaction_state"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'some_table'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"to_string"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"017"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" end"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"MAJOR"'})})]})})}),e.jsx(i.p,{children:'When the compaction has finished the result should print out "NONE".'}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"015"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" @hbase."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"admin"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(@formatter)."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"instance_eval"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" do"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"016"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"   p"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" @admin."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get_compaction_state"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'some_table'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"to_string"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"017"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" end"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"NONE"'})})]})})})]}),e.jsxs(s,{children:[e.jsxs(i.p,{children:["Run the ",e.jsx(i.em,{children:"mobrefs"}),` utility to ensure there are no MOB cells. Specifically, the tool will launch a
Hadoop MapReduce job that will show a job counter of 0 input records when we've successfully
rewritten all of the data.`]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"HADOOP_CLASSPATH=/etc/hbase/conf:"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapredcp"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"yarn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/some/path/to/hbase-shaded-mapreduce.jar "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"mobrefs"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mobrefs-report-output"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" some_table"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" foo"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:38:47"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" impl.YarnClientImpl:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Submitted"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" application"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" application_1575695902338_0004"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:38:47"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" The"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" url"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" track"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://rm-2.example.com:8090/proxy"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" application_1575695902338_0004/"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:38:47"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Running"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" job_1575695902338_0004"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:38:57"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Job"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" job_1575695902338_0004"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" running"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" uber"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mode"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" :"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" false"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:38:57"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:39:07"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 7%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:39:17"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 13%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:39:19"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 33%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:39:21"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 40%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:39:22"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 47%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:39:23"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 60%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:39:24"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 73%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:39:27"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 100%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:39:35"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 100%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 100%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:39:35"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Job"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" job_1575695902338_0004"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" completed"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" successfully"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:39:35"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Counters:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 54"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"       Map-Reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Framework"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"               Map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" records="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/09"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 22:41:28"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.MobRefReporter:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Finished"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" creating"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" report"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'some_table',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" family='foo'"})]})]})})}),e.jsx(i.p,{children:`If the data has not successfully been migrated out, this report will show both a non-zero number
of input records and a count of mob cells.`}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"HADOOP_CLASSPATH=/etc/hbase/conf:"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapredcp"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"yarn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/some/path/to/hbase-shaded-mapreduce.jar "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"mobrefs"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mobrefs-report-output"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" some_table"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" foo"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:18"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" impl.YarnClientImpl:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Submitted"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" application"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" application_1575695902338_0005"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:18"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" The"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" url"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" track"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://busbey-2.gce.cloudera.com:8090"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" proxy/application_1575695902338_0005/"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:18"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Running"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" job_1575695902338_0005"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:26"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Job"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" job_1575695902338_0005"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" running"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" uber"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mode"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" :"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" false"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:26"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:36"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 7%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:45"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 13%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:47"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 27%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:48"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 33%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:50"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 40%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:51"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 53%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:52"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 73%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:54"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 100%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 0%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:44:59"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 100%"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 100%"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:45:00"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Job"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" job_1575695902338_0005"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" completed"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" successfully"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:45:00"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.Job:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Counters:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 54"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"       Map-Reduce"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Framework"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"               Map"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" records="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"       MOB"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"               NUM_CELLS"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"1"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"19/12/10"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 11:45:00"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapreduce.MobRefReporter:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Finished"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" creating"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" report"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'some_table',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" family='foo'"})]})]})})}),e.jsx(i.p,{children:"If this happens you should verify that MOB compactions are disabled, verify that you have picked a sufficiently large MOB threshold, and redo the major compaction step."})]}),e.jsxs(s,{children:[e.jsx(i.h5,{id:"disable-the-mob-feature-for-the-column-family",children:"Disable the MOB feature for the column family"}),e.jsxs(i.p,{children:["When the ",e.jsx(i.em,{children:"mobrefs"})," report shows that no more data is stored in the MOB system then you can safely alter the column family configuration so that the MOB feature is disabled."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"017"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" alter "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'some_table'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'foo'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"IS_MOB"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'false'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Updating"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" all regions with the "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"new"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" schema..."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"8"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"25"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" regions updated."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"25"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"25"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" regions updated."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Done"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(s) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2.9370"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" seconds"})]})]})})}),e.jsx(i.p,{children:"The MOB feature will be disabled on a column family only after altering the column family and performing a major compaction. Before performing the major compaction after altering the column family, the MOB cells will still be present in the MOB storage."})]}),e.jsx(s,{children:e.jsxs(i.p,{children:["After the column family no longer shows the MOB feature enabled, it is safe to start MOB maintenance chores again. You can allow the default to be used for ",e.jsx(i.code,{children:"hbase.mob.compaction.chore.period"})," by removing it from your configuration files or restore it to whatever custom value you had prior to starting this process."]})}),e.jsxs(s,{children:[e.jsx(i.h5,{id:"clean-up-residual-mob-data",children:"Clean up residual MOB data"}),e.jsx(i.p,{children:`Once the MOB feature is disabled for the column family there will be no internal HBase process
looking for data in the MOB storage area specific to this column family. There will still be data
present there from prior to the compaction process that rewrote the values into HBase's data area.
You can check for this residual data directly in HDFS as an HBase superuser.`}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hdfs"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dfs"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -count"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /hbase/mobdir/data/default/some_table"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"           4"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"           54"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"         9063269081"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /hbase/mobdir/data/default/some_table"})]})]})})}),e.jsx(i.p,{children:"This data is spurious and may be reclaimed. You should sideline it, verify your application's view of the table, and then delete it."})]})]}),`
`,e.jsx(i.h3,{id:"data-values-over-than-the-mob-threshold-show-up-stored-in-non-mob-hfiles",children:"Data values over than the MOB threshold show up stored in non-MOB hfiles"}),`
`,e.jsx(i.p,{children:"Bulk load and WAL split-to-HFile don't consider MOB threshold and write data into normal hfile (under /hbase/data directory)."}),`
`,e.jsx(a,{type:"info",children:e.jsx(i.p,{children:`This won't cause any functional problem, during next compaction such data will be written out to
the MOB hfiles.`})}),`
`,e.jsx(i.h2,{id:"mob-upgrade-considerations",children:"MOB Upgrade Considerations"}),`
`,e.jsx(i.p,{children:`Generally, data stored using the MOB feature should transparently continue to work correctly across
HBase upgrades.`}),`
`,e.jsx(i.h3,{id:"upgrading-to-a-version-with-the-distributed-mob-compaction-feature",children:'Upgrading to a version with the "distributed MOB compaction" feature'}),`
`,e.jsxs(i.p,{children:[`Prior to the work in HBASE-22749, "Distributed MOB compactions", HBase had the Master coordinate all
compaction maintenance of the MOB hfiles. Centralizing management of the MOB data allowed for space
optimizations but safely coordinating that management with Region Servers resulted in edge cases that
caused data loss (ref `,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-22075",children:"HBASE-22075"}),")."]}),`
`,e.jsx(i.p,{children:`Users of the MOB feature upgrading to a version of HBase that includes HBASE-22749 should be aware
of the following changes:`}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:'The MOB system no longer allows setting "MOB Compaction Policies"'}),`
`,e.jsx(i.li,{children:`The MOB system no longer attempts to group MOB values by the date of the original cell's timestamp
according to said compaction policies, daily or otherwise`}),`
`,e.jsxs(i.li,{children:[`The MOB system no longer needs to track individual cell deletes through the use of special
files in the MOB storage area with the suffix `,e.jsx(i.code,{children:"_del"}),`. After upgrading you should sideline these
files.`]}),`
`,e.jsx(i.li,{children:`Under default configuration the MOB system should take much less time to perform a compaction of
MOB stored values. This is a direct consequence of the fact that HBase will place a much larger
load on the underlying filesystem when doing compactions of MOB stored values; the additional load
should be a multiple on the order of magnitude of number of region servers. I.e. for a cluster
with three region servers and two masters the default configuration should have HBase put three
times the load on HDFS during major compactions that rewrite MOB data when compared to Master
handled MOB compaction; it should also be approximately three times as fast.`}),`
`,e.jsxs(i.li,{children:[`When the MOB system detects that a table has hfiles with references to MOB data but the reference
hfiles do not yet have the needed file level metadata (i.e. from use of the MOB feature prior to
HBASE-22749) then it will refuse to archive `,e.jsx(i.em,{children:"any"}),` MOB hfiles from that table. The normal course of
periodic compactions done by Region Servers will update existing hfiles with MOB references, but
until a given table has been through the needed compactions operators should expect to see an
increased amount of storage used by the MOB feature.`]}),`
`,e.jsxs(i.li,{children:[`Performing a compaction with type "MOB" no longer has special handling to compact specifically the
MOB hfiles. Instead it will issue a warning and do a compaction of the table. For example using
the HBase shell as follows will result in a warning in the Master logs followed by a major
compaction of the 'example' table in its entirety or for the 'big' column respectively.`,`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" major_compact "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'example'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"nil"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'MOB'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" major_compact "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'example'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'big'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'MOB'"})]})]})})}),`
`,"The same is true for directly using the Java API for ",e.jsx(i.code,{children:'admin.majorCompact(TableName.valueOf("example"), CompactType.MOB)'}),"."]}),`
`,e.jsx(i.li,{children:`Similarly, manually performing a major compaction on a table or region will also handle compacting
the MOB stored values for that table or region respectively.`}),`
`]}),`
`,e.jsx(i.p,{children:"The following configuration setting has been deprecated and replaced:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"hbase.master.mob.ttl.cleaner.period"})," has been replaced with ",e.jsx(i.code,{children:"hbase.master.mob.cleaner.period"})]}),`
`]}),`
`,e.jsx(i.p,{children:"The following configuration settings are no longer used:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hbase.mob.compaction.mergeable.threshold"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hbase.mob.delfile.max.count"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hbase.mob.compaction.batch.size"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hbase.mob.compactor.class"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hbase.mob.compaction.threads.max"})}),`
`]})]})}function k(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(l,{...n})}):l(n)}function t(n,i){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{o as _markdown,k as default,c as extractedReferences,d as frontmatter,p as structuredData,m as toc};
