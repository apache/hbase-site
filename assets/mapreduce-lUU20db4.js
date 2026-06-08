import{j as e}from"./chunk-QUQL4437-Bywy9pC_.js";let l=`Apache MapReduce is a software framework used to analyze large amounts of data. It is provided by [Apache Hadoop](https://hadoop.apache.org/).
MapReduce itself is out of the scope of this document.
A good place to get started with MapReduce is [https://hadoop.apache.org/docs/r2.6.0/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html](https://hadoop.apache.org/docs/r2.6.0/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html).
MapReduce version 2 (MR2)is now part of [YARN](https://hadoop.apache.org/docs/r2.6.0/hadoop-yarn/hadoop-yarn-site/).

This chapter discusses specific configuration steps you need to take to use MapReduce on data within HBase.
In addition, it discusses other interactions and issues between HBase and MapReduce jobs.

<Callout type="info" title="mapred and mapreduce">
  There are two mapreduce packages in HBase as in MapReduce itself: *org.apache.hadoop.hbase.mapred*
  and *org.apache.hadoop.hbase.mapreduce*. The former does old-style API and the latter the new
  mode. The latter has more facility though you can usually find an equivalent in the older package.
  Pick the package that goes with your MapReduce deploy. When in doubt or starting over, pick
  *org.apache.hadoop.hbase.mapreduce*. In the notes below, we refer to *o.a.h.h.mapreduce* but
  replace with *o.a.h.h.mapred* if that is what you are using.
</Callout>

## HBase, MapReduce, and the CLASSPATH

By default, MapReduce jobs deployed to a MapReduce cluster do not have access to
either the HBase configuration under \`$HBASE_CONF_DIR\` or the HBase classes.

To give the MapReduce jobs the access they need, you could add \\_hbase-site.xml\\_to \\_\\$HADOOP*HOME/conf* and add HBase jars to the *\\$HADOOP\\_HOME/lib* directory.
You would then need to copy these changes across your cluster. Or you could edit *\\$HADOOP\\_HOME/conf/hadoop-env.sh* and add hbase dependencies to the \`HADOOP_CLASSPATH\` variable.
Neither of these approaches is recommended because it will pollute your Hadoop install with HBase references.
It also requires you restart the Hadoop cluster before Hadoop can use the HBase data.

The recommended approach is to let HBase add its dependency jars and use \`HADOOP_CLASSPATH\` or \`-libjars\`.

Since HBase \`0.90.x\`, HBase adds its dependency JARs to the job configuration itself.
The dependencies only need to be available on the local \`CLASSPATH\` and from here they'll be picked
up and bundled into the fat job jar deployed to the MapReduce cluster. A basic trick just passes
the full hbase classpath — all hbase and dependent jars as well as configurations — to the mapreduce
job runner letting hbase utility pick out from the full-on classpath what it needs adding them to the
MapReduce job configuration (See the source at \`TableMapReduceUtil#addDependencyJars(org.apache.hadoop.mapreduce.Job)\` for how this is done).

The following example runs the bundled HBase [RowCounter](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/RowCounter.html) MapReduce job against a table named \`usertable\`.
It sets into \`HADOOP_CLASSPATH\` the jars hbase needs to run in an MapReduce context (including configuration files such as hbase-site.xml).
Be sure to use the correct version of the HBase JAR for your system; replace the VERSION string in the below command line w/ the version of
your local hbase install. The backticks (\\\`\\\`\\\`) cause the shell to execute the sub-commands, setting the output of \`hbase classpath\` into \`HADOOP_CLASSPATH\`.
This example assumes you use a BASH-compatible shell.

\`\`\`bash
$ HADOOP_CLASSPATH=\`\${HBASE_HOME}/bin/hbase classpath\` \\
  \${HADOOP_HOME}/bin/hadoop jar \${HBASE_HOME}/lib/hbase-mapreduce-VERSION.jar \\
  org.apache.hadoop.hbase.mapreduce.RowCounter usertable
\`\`\`

The above command will launch a row counting mapreduce job against the hbase cluster that is pointed to by your local configuration on a cluster that the hadoop configs are pointing to.

The main for the \`hbase-mapreduce.jar\` is a Driver that lists a few basic mapreduce tasks that ship with hbase.
For example, presuming your install is hbase \`2.0.0-SNAPSHOT\`:

\`\`\`bash
$ HADOOP_CLASSPATH=\`\${HBASE_HOME}/bin/hbase classpath\` \\
  \${HADOOP_HOME}/bin/hadoop jar \${HBASE_HOME}/lib/hbase-mapreduce-2.0.0-SNAPSHOT.jar
An example program must be given as the first argument.
Valid program names are:
  CellCounter: Count cells in HBase table.
  WALPlayer: Replay WAL files.
  completebulkload: Complete a bulk data load.
  copytable: Export a table from local cluster to peer cluster.
  export: Write table data to HDFS.
  exportsnapshot: Export the specific snapshot to a given FileSystem.
  import: Import data written by Export.
  importtsv: Import data in TSV format.
  rowcounter: Count rows in HBase table.
  verifyrep: Compare the data from tables in two different clusters. WARNING: It doesn't work for incrementColumnValues'd cells since the timestamp is changed after being appended to the log.
\`\`\`

You can use the above listed shortnames for mapreduce jobs as in the below re-run of the row counter job (again, presuming your install is hbase \`2.0.0-SNAPSHOT\`):

\`\`\`bash
$ HADOOP_CLASSPATH=\`\${HBASE_HOME}/bin/hbase classpath\` \\
  \${HADOOP_HOME}/bin/hadoop jar \${HBASE_HOME}/lib/hbase-mapreduce-2.0.0-SNAPSHOT.jar \\
  rowcounter usertable
\`\`\`

You might find the more selective \`hbase mapredcp\` tool output of interest; it lists the minimum set of jars needed
to run a basic mapreduce job against an hbase install. It does not include configuration. You'll probably need to add
these if you want your MapReduce job to find the target cluster. You'll probably have to also add pointers to extra jars
once you start to do anything of substance. Just specify the extras by passing the system propery \`-Dtmpjars\` when
you run \`hbase mapredcp\`.

For jobs that do not package their dependencies or call \`TableMapReduceUtil#addDependencyJars\`, the following command structure is necessary:

\`\`\`bash
$ HADOOP_CLASSPATH=\`\${HBASE_HOME}/bin/hbase mapredcp\`:\${HBASE_HOME}/conf hadoop jar MyApp.jar MyJobMainClass -libjars $(\${HBASE_HOME}/bin/hbase mapredcp | tr ':' ',') ...
\`\`\`

<Callout type="info">
  The example may not work if you are running HBase from its build directory rather than an installed location.
  You may see an error like the following:

  \`\`\`text
  java.lang.RuntimeException: java.lang.ClassNotFoundException: org.apache.hadoop.hbase.mapreduce.RowCounter$RowCounterMapper
  \`\`\`

  If this occurs, try modifying the command as follows, so that it uses the HBase JARs from the *target/* directory within the build environment.

  \`\`\`bash
  $ HADOOP_CLASSPATH=\${HBASE_BUILD_HOME}/hbase-mapreduce/target/hbase-mapreduce-VERSION-SNAPSHOT.jar:\`\${HBASE_BUILD_HOME}/bin/hbase classpath\` \${HADOOP_HOME}/bin/hadoop jar \${HBASE_BUILD_HOME}/hbase-mapreduce/target/hbase-mapreduce-VERSION-SNAPSHOT.jar rowcounter usertable
  \`\`\`
</Callout>

<Callout type="warn" title="Notice to MapReduce users of HBase between 0.96.1 and 0.98.4">
  Some MapReduce jobs that use HBase fail to launch.
  The symptom is an exception similar to the following:

  \`\`\`text
  Exception in thread "main" java.lang.IllegalAccessError: class
      com.google.protobuf.ZeroCopyLiteralByteString cannot access its superclass
      com.google.protobuf.LiteralByteString
      at java.lang.ClassLoader.defineClass1(Native Method)
      at java.lang.ClassLoader.defineClass(ClassLoader.java:792)
      at java.security.SecureClassLoader.defineClass(SecureClassLoader.java:142)
      at java.net.URLClassLoader.defineClass(URLClassLoader.java:449)
      at java.net.URLClassLoader.access$100(URLClassLoader.java:71)
      at java.net.URLClassLoader$1.run(URLClassLoader.java:361)
      at java.net.URLClassLoader$1.run(URLClassLoader.java:355)
      at java.security.AccessController.doPrivileged(Native Method)
      at java.net.URLClassLoader.findClass(URLClassLoader.java:354)
      at java.lang.ClassLoader.loadClass(ClassLoader.java:424)
      at java.lang.ClassLoader.loadClass(ClassLoader.java:357)
      at
      org.apache.hadoop.hbase.protobuf.ProtobufUtil.toScan(ProtobufUtil.java:818)
      at
      org.apache.hadoop.hbase.mapreduce.TableMapReduceUtil.convertScanToString(TableMapReduceUtil.java:433)
      at
      org.apache.hadoop.hbase.mapreduce.TableMapReduceUtil.initTableMapperJob(TableMapReduceUtil.java:186)
      at
      org.apache.hadoop.hbase.mapreduce.TableMapReduceUtil.initTableMapperJob(TableMapReduceUtil.java:147)
      at
      org.apache.hadoop.hbase.mapreduce.TableMapReduceUtil.initTableMapperJob(TableMapReduceUtil.java:270)
      at
      org.apache.hadoop.hbase.mapreduce.TableMapReduceUtil.initTableMapperJob(TableMapReduceUtil.java:100)
  ...
  \`\`\`

  This is caused by an optimization introduced in [HBASE-9867](https://issues.apache.org/jira/browse/HBASE-9867) that inadvertently introduced a classloader dependency.

  This affects both jobs using the \`-libjars\` option and "fat jar," those which package their runtime dependencies in a nested \`lib\` folder.

  In order to satisfy the new classloader requirements, \`hbase-protocol.jar\` must be included in Hadoop's classpath.
  See [HBase, MapReduce, and the CLASSPATH](/docs/mapreduce#hbase-mapreduce-and-the-classpath) for current recommendations for resolving classpath errors.
  The following is included for historical purposes.

  This can be resolved system-wide by including a reference to the \`hbase-protocol.jar\` in Hadoop's lib directory, via a symlink or by copying the jar into the new location.

  This can also be achieved on a per-job launch basis by including it in the \`HADOOP_CLASSPATH\` environment variable at job submission time.
  When launching jobs that package their dependencies, all three of the following job launching commands satisfy this requirement:

  \`\`\`bash
  $ HADOOP_CLASSPATH=/path/to/hbase-protocol.jar:/path/to/hbase/conf hadoop jar MyJob.jar MyJobMainClass
  $ HADOOP_CLASSPATH=$(hbase mapredcp):/path/to/hbase/conf hadoop jar MyJob.jar MyJobMainClass
  $ HADOOP_CLASSPATH=$(hbase classpath) hadoop jar MyJob.jar MyJobMainClass
  \`\`\`

  For jars that do not package their dependencies, the following command structure is necessary:

  \`\`\`bash
  $ HADOOP_CLASSPATH=$(hbase mapredcp):/etc/hbase/conf hadoop jar MyApp.jar MyJobMainClass -libjars $(hbase mapredcp | tr ':' ',') ...
  \`\`\`

  See also [HBASE-10304](https://issues.apache.org/jira/browse/HBASE-10304) for further discussion of this issue.
</Callout>

## MapReduce Scan Caching

TableMapReduceUtil now restores the option to set scanner caching (the number of rows which are cached before returning the result to the client) on the Scan object that is passed in.
This functionality was lost due to a bug in HBase 0.95 ([HBASE-11558](https://issues.apache.org/jira/browse/HBASE-11558)), which is fixed for HBase 0.98.5 and 0.96.3.
The priority order for choosing the scanner caching is as follows:

1. Caching settings which are set on the scan object.
2. Caching settings which are specified via the configuration option \`hbase.client.scanner.caching\`, which can either be set manually in *hbase-site.xml* or via the helper method \`TableMapReduceUtil.setScannerCaching()\`.
3. The default value \`HConstants.DEFAULT_HBASE_CLIENT_SCANNER_CACHING\`, which is set to \`100\`.

Optimizing the caching settings is a balance between the time the client waits for a result and the number of sets of results the client needs to receive.
If the caching setting is too large, the client could end up waiting for a long time or the request could even time out.
If the setting is too small, the scan needs to return results in several pieces.
If you think of the scan as a shovel, a bigger cache setting is analogous to a bigger shovel, and a smaller cache setting is equivalent to more shoveling in order to fill the bucket.

The list of priorities mentioned above allows you to set a reasonable default, and override it for specific operations.

See the API documentation for [Scan](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html) for more details.

## Bundled HBase MapReduce Jobs

The HBase JAR also serves as a Driver for some bundled MapReduce jobs.
To learn about the bundled MapReduce jobs, run the following command.

\`\`\`bash
$ \${HADOOP_HOME}/bin/hadoop jar \${HBASE_HOME}/hbase-mapreduce-VERSION.jar
An example program must be given as the first argument.
Valid program names are:
  copytable: Export a table from local cluster to peer cluster
  completebulkload: Complete a bulk data load.
  export: Write table data to HDFS.
  import: Import data written by Export.
  importtsv: Import data in TSV format.
  rowcounter: Count rows in HBase table
\`\`\`

Each of the valid program names are bundled MapReduce jobs.
To run one of the jobs, model your command after the following example.

\`\`\`bash
$ \${HADOOP_HOME}/bin/hadoop jar \${HBASE_HOME}/hbase-mapreduce-VERSION.jar rowcounter myTable
\`\`\`

## HBase as a MapReduce Job Data Source and Data Sink

HBase can be used as a data source, [TableInputFormat](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableInputFormat.html), and data sink, [TableOutputFormat](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableOutputFormat.html) or [MultiTableOutputFormat](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/MultiTableOutputFormat.html), for MapReduce jobs.
Writing MapReduce jobs that read or write HBase, it is advisable to subclass [TableMapper](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableMapper.html) and/or [TableReducer](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableReducer.html).
See the do-nothing pass-through classes [IdentityTableMapper](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/IdentityTableMapper.html) and [IdentityTableReducer](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/IdentityTableReducer.html) for basic usage.
For a more involved example, see [RowCounter](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/RowCounter.html) or review the \`org.apache.hadoop.hbase.mapreduce.TestTableMapReduce\` unit test.

If you run MapReduce jobs that use HBase as source or sink, need to specify source and sink table and column names in your configuration.

When you read from HBase, the \`TableInputFormat\` requests the list of regions from HBase and makes a map, which is either a \`map-per-region\` or \`mapreduce.job.maps\` map, whichever is smaller.
If your job only has two maps, raise \`mapreduce.job.maps\` to a number greater than the number of regions.
Maps will run on the adjacent TaskTracker/NodeManager if you are running a TaskTracer/NodeManager and RegionServer per node.
When writing to HBase, it may make sense to avoid the Reduce step and write back into HBase from within your map.
This approach works when your job does not need the sort and collation that MapReduce does on the map-emitted data.
On insert, HBase 'sorts' so there is no point double-sorting (and shuffling data around your MapReduce cluster) unless you need to.
If you do not need the Reduce, your map might emit counts of records processed for reporting at the end of the job, or set the number of Reduces to zero and use TableOutputFormat.
If running the Reduce step makes sense in your case, you should typically use multiple reducers so that load is spread across the HBase cluster.

A new HBase partitioner, the [HRegionPartitioner](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/HRegionPartitioner.html), can run as many reducers the number of existing regions.
The HRegionPartitioner is suitable when your table is large and your upload will not greatly alter the number of existing regions upon completion.
Otherwise use the default partitioner.

## Writing HFiles Directly During Bulk Import

If you are importing into a new table, you can bypass the HBase API and write your content directly to the filesystem, formatted into HBase data files (HFiles). Your import will run faster, perhaps an order of magnitude faster.
For more on how this mechanism works, see [Bulk Load](/docs/architecture/bulk-loading).

## RowCounter Example

The included [RowCounter](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/RowCounter.html) MapReduce job uses \`TableInputFormat\` and does a count of all rows in the specified table.
To run it, use the following command:

\`\`\`bash
$ ./bin/hadoop jar hbase-X.X.X.jar
\`\`\`

This will invoke the HBase MapReduce Driver class.
Select \`rowcounter\` from the choice of jobs offered.
This will print rowcounter usage advice to standard output.
Specify the tablename, column to count, and output directory.
If you have classpath errors, see [HBase, MapReduce, and the CLASSPATH](/docs/mapreduce#hbase-mapreduce-and-the-classpath).

## Map-Task Splitting

### The Default HBase MapReduce Splitter

When [TableInputFormat](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableInputFormat.html) is used to source an HBase table in a MapReduce job, its splitter will make a map task for each region of the table.
Thus, if there are 100 regions in the table, there will be 100 map-tasks for the job - regardless of how many column families are selected in the Scan.

### Custom Splitters

For those interested in implementing custom splitters, see the method \`getSplits\` in [TableInputFormatBase](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableInputFormatBase.html).
That is where the logic for map-task assignment resides.

## HBase MapReduce Examples

### HBase MapReduce Read Example

The following is an example of using HBase as a MapReduce source in read-only manner.
Specifically, there is a Mapper instance but no Reducer, and nothing is being emitted from the Mapper.
The job would be defined as follows...

\`\`\`java
Configuration config = HBaseConfiguration.create();
Job job = new Job(config, "ExampleRead");
job.setJarByClass(MyReadJob.class);     // class that contains mapper

Scan scan = new Scan();
scan.setCaching(500);        // 1 is the default in Scan, which will be bad for MapReduce jobs
scan.setCacheBlocks(false);  // don't set to true for MR jobs
// set other scan attrs
...

TableMapReduceUtil.initTableMapperJob(
  tableName,        // input HBase table name
  scan,             // Scan instance to control CF and attribute selection
  MyMapper.class,   // mapper
  null,             // mapper output key
  null,             // mapper output value
  job);
job.setOutputFormatClass(NullOutputFormat.class);   // because we aren't emitting anything from mapper

boolean b = job.waitForCompletion(true);
if (!b) {
  throw new IOException("error with job!");
}
\`\`\`

...and the mapper instance would extend [TableMapper](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableMapper.html)...

\`\`\`java
public static class MyMapper extends TableMapper<Text, Text> {

  public void map(ImmutableBytesWritable row, Result value, Context context) throws InterruptedException, IOException {
    // process data for the row from the Result instance.
   }
}
\`\`\`

### HBase MapReduce Read/Write Example

The following is an example of using HBase both as a source and as a sink with MapReduce.
This example will simply copy data from one table to another.

\`\`\`java
Configuration config = HBaseConfiguration.create();
Job job = new Job(config,"ExampleReadWrite");
job.setJarByClass(MyReadWriteJob.class);    // class that contains mapper

Scan scan = new Scan();
scan.setCaching(500);        // 1 is the default in Scan, which will be bad for MapReduce jobs
scan.setCacheBlocks(false);  // don't set to true for MR jobs
// set other scan attrs

TableMapReduceUtil.initTableMapperJob(
  sourceTable,      // input table
  scan,             // Scan instance to control CF and attribute selection
  MyMapper.class,   // mapper class
  null,             // mapper output key
  null,             // mapper output value
  job);
TableMapReduceUtil.initTableReducerJob(
  targetTable,      // output table
  null,             // reducer class
  job);
job.setNumReduceTasks(0);

boolean b = job.waitForCompletion(true);
if (!b) {
  throw new IOException("error with job!");
}
\`\`\`

An explanation is required of what \`TableMapReduceUtil\` is doing, especially with the reducer. [TableOutputFormat](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableOutputFormat.html) is being used as the outputFormat class, and several parameters are being set on the config (e.g., \`TableOutputFormat.OUTPUT_TABLE\`), as well as setting the reducer output key to \`ImmutableBytesWritable\` and reducer value to \`Writable\`.
These could be set by the programmer on the job and conf, but \`TableMapReduceUtil\` tries to make things easier.

The following is the example mapper, which will create a \`Put\` and matching the input \`Result\` and emit it.
Note: this is what the CopyTable utility does.

\`\`\`java
public static class MyMapper extends TableMapper<ImmutableBytesWritable, Put>  {

  public void map(ImmutableBytesWritable row, Result value, Context context) throws IOException, InterruptedException {
    // this example is just copying the data from the source table...
      context.write(row, resultToPut(row,value));
    }

    private static Put resultToPut(ImmutableBytesWritable key, Result result) throws IOException {
      Put put = new Put(key.get());
      for (Cell cell : result.listCells()) {
        put.add(cell);
      }
      return put;
    }
}
\`\`\`

There isn't actually a reducer step, so \`TableOutputFormat\` takes care of sending the \`Put\` to the target table.

This is just an example, developers could choose not to use \`TableOutputFormat\` and connect to the target table themselves.

### HBase MapReduce Read/Write Example With Multi-Table Output

TODO: example for \`MultiTableOutputFormat\`.

### HBase MapReduce Summary to HBase Example

The following example uses HBase as a MapReduce source and sink with a summarization step.
This example will count the number of distinct instances of a value in a table and write those summarized counts in another table.

\`\`\`java
Configuration config = HBaseConfiguration.create();
Job job = new Job(config,"ExampleSummary");
job.setJarByClass(MySummaryJob.class);     // class that contains mapper and reducer

Scan scan = new Scan();
scan.setCaching(500);        // 1 is the default in Scan, which will be bad for MapReduce jobs
scan.setCacheBlocks(false);  // don't set to true for MR jobs
// set other scan attrs

TableMapReduceUtil.initTableMapperJob(
  sourceTable,        // input table
  scan,               // Scan instance to control CF and attribute selection
  MyMapper.class,     // mapper class
  Text.class,         // mapper output key
  IntWritable.class,  // mapper output value
  job);
TableMapReduceUtil.initTableReducerJob(
  targetTable,        // output table
  MyTableReducer.class,    // reducer class
  job);
job.setNumReduceTasks(1);   // at least one, adjust as required

boolean b = job.waitForCompletion(true);
if (!b) {
  throw new IOException("error with job!");
}
\`\`\`

In this example mapper a column with a String-value is chosen as the value to summarize upon.
This value is used as the key to emit from the mapper, and an \`IntWritable\` represents an instance counter.

\`\`\`java
public static class MyMapper extends TableMapper<Text, IntWritable>  {
  public static final byte[] CF = "cf".getBytes();
  public static final byte[] ATTR1 = "attr1".getBytes();

  private final IntWritable ONE = new IntWritable(1);
  private Text text = new Text();

  public void map(ImmutableBytesWritable row, Result value, Context context) throws IOException, InterruptedException {
    String val = new String(value.getValue(CF, ATTR1));
    text.set(val);     // we can only emit Writables...
    context.write(text, ONE);
  }
}
\`\`\`

In the reducer, the "ones" are counted (just like any other MR example that does this), and then emits a \`Put\`.

\`\`\`java
public static class MyTableReducer extends TableReducer<Text, IntWritable, ImmutableBytesWritable>  {
  public static final byte[] CF = "cf".getBytes();
  public static final byte[] COUNT = "count".getBytes();

  public void reduce(Text key, Iterable<IntWritable> values, Context context) throws IOException, InterruptedException {
    int i = 0;
    for (IntWritable val : values) {
      i += val.get();
    }
    Put put = new Put(Bytes.toBytes(key.toString()));
    put.add(CF, COUNT, Bytes.toBytes(i));

    context.write(null, put);
  }
}
\`\`\`

### HBase MapReduce Summary to File Example

This very similar to the summary example above, with exception that this is using HBase as a MapReduce source but HDFS as the sink.
The differences are in the job setup and in the reducer.
The mapper remains the same.

\`\`\`java
Configuration config = HBaseConfiguration.create();
Job job = new Job(config,"ExampleSummaryToFile");
job.setJarByClass(MySummaryFileJob.class);     // class that contains mapper and reducer

Scan scan = new Scan();
scan.setCaching(500);        // 1 is the default in Scan, which will be bad for MapReduce jobs
scan.setCacheBlocks(false);  // don't set to true for MR jobs
// set other scan attrs

TableMapReduceUtil.initTableMapperJob(
  sourceTable,        // input table
  scan,               // Scan instance to control CF and attribute selection
  MyMapper.class,     // mapper class
  Text.class,         // mapper output key
  IntWritable.class,  // mapper output value
  job);
job.setReducerClass(MyReducer.class);    // reducer class
job.setNumReduceTasks(1);    // at least one, adjust as required
FileOutputFormat.setOutputPath(job, new Path("/tmp/mr/mySummaryFile"));  // adjust directories as required

boolean b = job.waitForCompletion(true);
if (!b) {
  throw new IOException("error with job!");
}
\`\`\`

As stated above, the previous Mapper can run unchanged with this example.
As for the Reducer, it is a "generic" Reducer instead of extending TableMapper and emitting Puts.

\`\`\`java
public static class MyReducer extends Reducer<Text, IntWritable, Text, IntWritable>  {

  public void reduce(Text key, Iterable<IntWritable> values, Context context) throws IOException, InterruptedException {
    int i = 0;
    for (IntWritable val : values) {
      i += val.get();
    }
    context.write(key, new IntWritable(i));
  }
}
\`\`\`

### HBase MapReduce Summary to HBase Without Reducer

It is also possible to perform summaries without a reducer - if you use HBase as the reducer.

An HBase target table would need to exist for the job summary.
The Table method \`incrementColumnValue\` would be used to atomically increment values.
From a performance perspective, it might make sense to keep a Map of values with their values to be incremented for each map-task, and make one update per key at during the \`cleanup\` method of the mapper.
However, your mileage may vary depending on the number of rows to be processed and unique keys.

In the end, the summary results are in HBase.

### HBase MapReduce Summary to RDBMS

Sometimes it is more appropriate to generate summaries to an RDBMS.
For these cases, it is possible to generate summaries directly to an RDBMS via a custom reducer.
The \`setup\` method can connect to an RDBMS (the connection information can be passed via custom parameters in the context) and the cleanup method can close the connection.

It is critical to understand that number of reducers for the job affects the summarization implementation, and you'll have to design this into your reducer.
Specifically, whether it is designed to run as a singleton (one reducer) or multiple reducers.
Neither is right or wrong, it depends on your use-case.
Recognize that the more reducers that are assigned to the job, the more simultaneous connections to the RDBMS will be created - this will scale, but only to a point.

\`\`\`java
public static class MyRdbmsReducer extends Reducer<Text, IntWritable, Text, IntWritable>  {

  private Connection c = null;

  public void setup(Context context) {
    // create DB connection...
  }

  public void reduce(Text key, Iterable<IntWritable> values, Context context) throws IOException, InterruptedException {
    // do summarization
    // in this example the keys are Text, but this is just an example
  }

  public void cleanup(Context context) {
    // close db connection
  }

}
\`\`\`

In the end, the summary results are written to your RDBMS table/s.

## Accessing Other HBase Tables in a MapReduce Job

Although the framework currently allows one HBase table as input to a MapReduce job, other HBase tables can be accessed as lookup tables, etc., in a MapReduce job via creating an Table instance in the setup method of the Mapper.

\`\`\`java
public class MyMapper extends TableMapper<Text, LongWritable> {
  private Table myOtherTable;

  public void setup(Context context) {
    // In here create a Connection to the cluster and save it or use the Connection
    // from the existing table
    myOtherTable = connection.getTable("myOtherTable");
  }

  public void map(ImmutableBytesWritable row, Result value, Context context) throws IOException, InterruptedException {
    // process Result...
    // use 'myOtherTable' for lookups
  }
\`\`\`

## Speculative Execution

It is generally advisable to turn off speculative execution for MapReduce jobs that use HBase as a source.
This can either be done on a per-Job basis through properties, or on the entire cluster.
Especially for longer running jobs, speculative execution will create duplicate map-tasks which will double-write your data to HBase; this is probably not what you want.

See [Speculative Execution](/docs/configuration/important#configuration-important-recommended-configurations-speculative-execution) for more information.
`,r={title:"HBase and MapReduce",description:"Guide to using Apache HBase with MapReduce including configuration, examples, and best practices."},d=[{href:"https://hadoop.apache.org/"},{href:"https://hadoop.apache.org/docs/r2.6.0/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html"},{href:"https://hadoop.apache.org/docs/r2.6.0/hadoop-yarn/hadoop-yarn-site/"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/RowCounter.html"},{href:"https://issues.apache.org/jira/browse/HBASE-9867"},{href:"/docs/mapreduce#hbase-mapreduce-and-the-classpath"},{href:"https://issues.apache.org/jira/browse/HBASE-10304"},{href:"https://issues.apache.org/jira/browse/HBASE-11558"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableInputFormat.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableOutputFormat.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/MultiTableOutputFormat.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableMapper.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableReducer.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/IdentityTableMapper.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/IdentityTableReducer.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/RowCounter.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/HRegionPartitioner.html"},{href:"/docs/architecture/bulk-loading"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/RowCounter.html"},{href:"/docs/mapreduce#hbase-mapreduce-and-the-classpath"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableInputFormat.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableInputFormatBase.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableMapper.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableOutputFormat.html"},{href:"/docs/configuration/important#configuration-important-recommended-configurations-speculative-execution"}],c={contents:[{heading:void 0,content:`Apache MapReduce is a software framework used to analyze large amounts of data. It is provided by Apache Hadoop.
MapReduce itself is out of the scope of this document.
A good place to get started with MapReduce is https://hadoop.apache.org/docs/r2.6.0/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html.
MapReduce version 2 (MR2)is now part of YARN.`},{heading:void 0,content:`This chapter discusses specific configuration steps you need to take to use MapReduce on data within HBase.
In addition, it discusses other interactions and issues between HBase and MapReduce jobs.`},{heading:void 0,content:"type: info"},{heading:void 0,content:"title: mapred and mapreduce"},{heading:void 0,content:`There are two mapreduce packages in HBase as in MapReduce itself: org.apache.hadoop.hbase.mapred
and org.apache.hadoop.hbase.mapreduce. The former does old-style API and the latter the new
mode. The latter has more facility though you can usually find an equivalent in the older package.
Pick the package that goes with your MapReduce deploy. When in doubt or starting over, pick
org.apache.hadoop.hbase.mapreduce. In the notes below, we refer to o.a.h.h.mapreduce but
replace with o.a.h.h.mapred if that is what you are using.`},{heading:"hbase-mapreduce-and-the-classpath",content:`By default, MapReduce jobs deployed to a MapReduce cluster do not have access to
either the HBase configuration under $HBASE_CONF_DIR or the HBase classes.`},{heading:"hbase-mapreduce-and-the-classpath",content:`To give the MapReduce jobs the access they need, you could add _hbase-site.xml_to _$HADOOPHOME/conf and add HBase jars to the $HADOOP_HOME/lib directory.
You would then need to copy these changes across your cluster. Or you could edit $HADOOP_HOME/conf/hadoop-env.sh and add hbase dependencies to the HADOOP_CLASSPATH variable.
Neither of these approaches is recommended because it will pollute your Hadoop install with HBase references.
It also requires you restart the Hadoop cluster before Hadoop can use the HBase data.`},{heading:"hbase-mapreduce-and-the-classpath",content:"The recommended approach is to let HBase add its dependency jars and use HADOOP_CLASSPATH or -libjars."},{heading:"hbase-mapreduce-and-the-classpath",content:`Since HBase 0.90.x, HBase adds its dependency JARs to the job configuration itself.
The dependencies only need to be available on the local CLASSPATH and from here they'll be picked
up and bundled into the fat job jar deployed to the MapReduce cluster. A basic trick just passes
the full hbase classpath — all hbase and dependent jars as well as configurations — to the mapreduce
job runner letting hbase utility pick out from the full-on classpath what it needs adding them to the
MapReduce job configuration (See the source at TableMapReduceUtil#addDependencyJars(org.apache.hadoop.mapreduce.Job) for how this is done).`},{heading:"hbase-mapreduce-and-the-classpath",content:`The following example runs the bundled HBase RowCounter MapReduce job against a table named usertable.
It sets into HADOOP_CLASSPATH the jars hbase needs to run in an MapReduce context (including configuration files such as hbase-site.xml).
Be sure to use the correct version of the HBase JAR for your system; replace the VERSION string in the below command line w/ the version of
your local hbase install. The backticks (\`\`\`) cause the shell to execute the sub-commands, setting the output of hbase classpath into HADOOP_CLASSPATH.
This example assumes you use a BASH-compatible shell.`},{heading:"hbase-mapreduce-and-the-classpath",content:"The above command will launch a row counting mapreduce job against the hbase cluster that is pointed to by your local configuration on a cluster that the hadoop configs are pointing to."},{heading:"hbase-mapreduce-and-the-classpath",content:`The main for the hbase-mapreduce.jar is a Driver that lists a few basic mapreduce tasks that ship with hbase.
For example, presuming your install is hbase 2.0.0-SNAPSHOT:`},{heading:"hbase-mapreduce-and-the-classpath",content:"You can use the above listed shortnames for mapreduce jobs as in the below re-run of the row counter job (again, presuming your install is hbase 2.0.0-SNAPSHOT):"},{heading:"hbase-mapreduce-and-the-classpath",content:`You might find the more selective hbase mapredcp tool output of interest; it lists the minimum set of jars needed
to run a basic mapreduce job against an hbase install. It does not include configuration. You'll probably need to add
these if you want your MapReduce job to find the target cluster. You'll probably have to also add pointers to extra jars
once you start to do anything of substance. Just specify the extras by passing the system propery -Dtmpjars when
you run hbase mapredcp.`},{heading:"hbase-mapreduce-and-the-classpath",content:"For jobs that do not package their dependencies or call TableMapReduceUtil#addDependencyJars, the following command structure is necessary:"},{heading:"hbase-mapreduce-and-the-classpath",content:"type: info"},{heading:"hbase-mapreduce-and-the-classpath",content:`The example may not work if you are running HBase from its build directory rather than an installed location.
You may see an error like the following:`},{heading:"hbase-mapreduce-and-the-classpath",content:"If this occurs, try modifying the command as follows, so that it uses the HBase JARs from the target/ directory within the build environment."},{heading:"hbase-mapreduce-and-the-classpath",content:"type: warn"},{heading:"hbase-mapreduce-and-the-classpath",content:"title: Notice to MapReduce users of HBase between 0.96.1 and 0.98.4"},{heading:"hbase-mapreduce-and-the-classpath",content:`Some MapReduce jobs that use HBase fail to launch.
The symptom is an exception similar to the following:`},{heading:"hbase-mapreduce-and-the-classpath",content:"This is caused by an optimization introduced in HBASE-9867 that inadvertently introduced a classloader dependency."},{heading:"hbase-mapreduce-and-the-classpath",content:'This affects both jobs using the -libjars option and "fat jar," those which package their runtime dependencies in a nested lib folder.'},{heading:"hbase-mapreduce-and-the-classpath",content:`In order to satisfy the new classloader requirements, hbase-protocol.jar must be included in Hadoop's classpath.
See HBase, MapReduce, and the CLASSPATH for current recommendations for resolving classpath errors.
The following is included for historical purposes.`},{heading:"hbase-mapreduce-and-the-classpath",content:"This can be resolved system-wide by including a reference to the hbase-protocol.jar in Hadoop's lib directory, via a symlink or by copying the jar into the new location."},{heading:"hbase-mapreduce-and-the-classpath",content:`This can also be achieved on a per-job launch basis by including it in the HADOOP_CLASSPATH environment variable at job submission time.
When launching jobs that package their dependencies, all three of the following job launching commands satisfy this requirement:`},{heading:"hbase-mapreduce-and-the-classpath",content:"For jars that do not package their dependencies, the following command structure is necessary:"},{heading:"hbase-mapreduce-and-the-classpath",content:"See also HBASE-10304 for further discussion of this issue."},{heading:"mapreduce-scan-caching",content:`TableMapReduceUtil now restores the option to set scanner caching (the number of rows which are cached before returning the result to the client) on the Scan object that is passed in.
This functionality was lost due to a bug in HBase 0.95 (HBASE-11558), which is fixed for HBase 0.98.5 and 0.96.3.
The priority order for choosing the scanner caching is as follows:`},{heading:"mapreduce-scan-caching",content:"Caching settings which are set on the scan object."},{heading:"mapreduce-scan-caching",content:"Caching settings which are specified via the configuration option hbase.client.scanner.caching, which can either be set manually in hbase-site.xml or via the helper method TableMapReduceUtil.setScannerCaching()."},{heading:"mapreduce-scan-caching",content:"The default value HConstants.DEFAULT_HBASE_CLIENT_SCANNER_CACHING, which is set to 100."},{heading:"mapreduce-scan-caching",content:`Optimizing the caching settings is a balance between the time the client waits for a result and the number of sets of results the client needs to receive.
If the caching setting is too large, the client could end up waiting for a long time or the request could even time out.
If the setting is too small, the scan needs to return results in several pieces.
If you think of the scan as a shovel, a bigger cache setting is analogous to a bigger shovel, and a smaller cache setting is equivalent to more shoveling in order to fill the bucket.`},{heading:"mapreduce-scan-caching",content:"The list of priorities mentioned above allows you to set a reasonable default, and override it for specific operations."},{heading:"mapreduce-scan-caching",content:"See the API documentation for Scan for more details."},{heading:"bundled-hbase-mapreduce-jobs",content:`The HBase JAR also serves as a Driver for some bundled MapReduce jobs.
To learn about the bundled MapReduce jobs, run the following command.`},{heading:"bundled-hbase-mapreduce-jobs",content:`Each of the valid program names are bundled MapReduce jobs.
To run one of the jobs, model your command after the following example.`},{heading:"hbase-as-a-mapreduce-job-data-source-and-data-sink",content:`HBase can be used as a data source, TableInputFormat, and data sink, TableOutputFormat or MultiTableOutputFormat, for MapReduce jobs.
Writing MapReduce jobs that read or write HBase, it is advisable to subclass TableMapper and/or TableReducer.
See the do-nothing pass-through classes IdentityTableMapper and IdentityTableReducer for basic usage.
For a more involved example, see RowCounter or review the org.apache.hadoop.hbase.mapreduce.TestTableMapReduce unit test.`},{heading:"hbase-as-a-mapreduce-job-data-source-and-data-sink",content:"If you run MapReduce jobs that use HBase as source or sink, need to specify source and sink table and column names in your configuration."},{heading:"hbase-as-a-mapreduce-job-data-source-and-data-sink",content:`When you read from HBase, the TableInputFormat requests the list of regions from HBase and makes a map, which is either a map-per-region or mapreduce.job.maps map, whichever is smaller.
If your job only has two maps, raise mapreduce.job.maps to a number greater than the number of regions.
Maps will run on the adjacent TaskTracker/NodeManager if you are running a TaskTracer/NodeManager and RegionServer per node.
When writing to HBase, it may make sense to avoid the Reduce step and write back into HBase from within your map.
This approach works when your job does not need the sort and collation that MapReduce does on the map-emitted data.
On insert, HBase 'sorts' so there is no point double-sorting (and shuffling data around your MapReduce cluster) unless you need to.
If you do not need the Reduce, your map might emit counts of records processed for reporting at the end of the job, or set the number of Reduces to zero and use TableOutputFormat.
If running the Reduce step makes sense in your case, you should typically use multiple reducers so that load is spread across the HBase cluster.`},{heading:"hbase-as-a-mapreduce-job-data-source-and-data-sink",content:`A new HBase partitioner, the HRegionPartitioner, can run as many reducers the number of existing regions.
The HRegionPartitioner is suitable when your table is large and your upload will not greatly alter the number of existing regions upon completion.
Otherwise use the default partitioner.`},{heading:"writing-hfiles-directly-during-bulk-import",content:`If you are importing into a new table, you can bypass the HBase API and write your content directly to the filesystem, formatted into HBase data files (HFiles). Your import will run faster, perhaps an order of magnitude faster.
For more on how this mechanism works, see Bulk Load.`},{heading:"rowcounter-example",content:`The included RowCounter MapReduce job uses TableInputFormat and does a count of all rows in the specified table.
To run it, use the following command:`},{heading:"rowcounter-example",content:`This will invoke the HBase MapReduce Driver class.
Select rowcounter from the choice of jobs offered.
This will print rowcounter usage advice to standard output.
Specify the tablename, column to count, and output directory.
If you have classpath errors, see HBase, MapReduce, and the CLASSPATH.`},{heading:"the-default-hbase-mapreduce-splitter",content:`When TableInputFormat is used to source an HBase table in a MapReduce job, its splitter will make a map task for each region of the table.
Thus, if there are 100 regions in the table, there will be 100 map-tasks for the job - regardless of how many column families are selected in the Scan.`},{heading:"custom-splitters",content:`For those interested in implementing custom splitters, see the method getSplits in TableInputFormatBase.
That is where the logic for map-task assignment resides.`},{heading:"hbase-mapreduce-read-example",content:`The following is an example of using HBase as a MapReduce source in read-only manner.
Specifically, there is a Mapper instance but no Reducer, and nothing is being emitted from the Mapper.
The job would be defined as follows...`},{heading:"hbase-mapreduce-read-example",content:"...and the mapper instance would extend TableMapper..."},{heading:"hbase-mapreduce-readwrite-example",content:`The following is an example of using HBase both as a source and as a sink with MapReduce.
This example will simply copy data from one table to another.`},{heading:"hbase-mapreduce-readwrite-example",content:`An explanation is required of what TableMapReduceUtil is doing, especially with the reducer. TableOutputFormat is being used as the outputFormat class, and several parameters are being set on the config (e.g., TableOutputFormat.OUTPUT_TABLE), as well as setting the reducer output key to ImmutableBytesWritable and reducer value to Writable.
These could be set by the programmer on the job and conf, but TableMapReduceUtil tries to make things easier.`},{heading:"hbase-mapreduce-readwrite-example",content:`The following is the example mapper, which will create a Put and matching the input Result and emit it.
Note: this is what the CopyTable utility does.`},{heading:"hbase-mapreduce-readwrite-example",content:"There isn't actually a reducer step, so TableOutputFormat takes care of sending the Put to the target table."},{heading:"hbase-mapreduce-readwrite-example",content:"This is just an example, developers could choose not to use TableOutputFormat and connect to the target table themselves."},{heading:"hbase-mapreduce-readwrite-example-with-multi-table-output",content:"TODO: example for MultiTableOutputFormat."},{heading:"hbase-mapreduce-summary-to-hbase-example",content:`The following example uses HBase as a MapReduce source and sink with a summarization step.
This example will count the number of distinct instances of a value in a table and write those summarized counts in another table.`},{heading:"hbase-mapreduce-summary-to-hbase-example",content:`In this example mapper a column with a String-value is chosen as the value to summarize upon.
This value is used as the key to emit from the mapper, and an IntWritable represents an instance counter.`},{heading:"hbase-mapreduce-summary-to-hbase-example",content:'In the reducer, the "ones" are counted (just like any other MR example that does this), and then emits a Put.'},{heading:"hbase-mapreduce-summary-to-file-example",content:`This very similar to the summary example above, with exception that this is using HBase as a MapReduce source but HDFS as the sink.
The differences are in the job setup and in the reducer.
The mapper remains the same.`},{heading:"hbase-mapreduce-summary-to-file-example",content:`As stated above, the previous Mapper can run unchanged with this example.
As for the Reducer, it is a "generic" Reducer instead of extending TableMapper and emitting Puts.`},{heading:"hbase-mapreduce-summary-to-hbase-without-reducer",content:"It is also possible to perform summaries without a reducer - if you use HBase as the reducer."},{heading:"hbase-mapreduce-summary-to-hbase-without-reducer",content:`An HBase target table would need to exist for the job summary.
The Table method incrementColumnValue would be used to atomically increment values.
From a performance perspective, it might make sense to keep a Map of values with their values to be incremented for each map-task, and make one update per key at during the cleanup method of the mapper.
However, your mileage may vary depending on the number of rows to be processed and unique keys.`},{heading:"hbase-mapreduce-summary-to-hbase-without-reducer",content:"In the end, the summary results are in HBase."},{heading:"hbase-mapreduce-summary-to-rdbms",content:`Sometimes it is more appropriate to generate summaries to an RDBMS.
For these cases, it is possible to generate summaries directly to an RDBMS via a custom reducer.
The setup method can connect to an RDBMS (the connection information can be passed via custom parameters in the context) and the cleanup method can close the connection.`},{heading:"hbase-mapreduce-summary-to-rdbms",content:`It is critical to understand that number of reducers for the job affects the summarization implementation, and you'll have to design this into your reducer.
Specifically, whether it is designed to run as a singleton (one reducer) or multiple reducers.
Neither is right or wrong, it depends on your use-case.
Recognize that the more reducers that are assigned to the job, the more simultaneous connections to the RDBMS will be created - this will scale, but only to a point.`},{heading:"hbase-mapreduce-summary-to-rdbms",content:"In the end, the summary results are written to your RDBMS table/s."},{heading:"accessing-other-hbase-tables-in-a-mapreduce-job",content:"Although the framework currently allows one HBase table as input to a MapReduce job, other HBase tables can be accessed as lookup tables, etc., in a MapReduce job via creating an Table instance in the setup method of the Mapper."},{heading:"mapreduce-speculative-execution",content:`It is generally advisable to turn off speculative execution for MapReduce jobs that use HBase as a source.
This can either be done on a per-Job basis through properties, or on the entire cluster.
Especially for longer running jobs, speculative execution will create duplicate map-tasks which will double-write your data to HBase; this is probably not what you want.`},{heading:"mapreduce-speculative-execution",content:"See Speculative Execution for more information."}],headings:[{id:"hbase-mapreduce-and-the-classpath",content:"HBase, MapReduce, and the CLASSPATH"},{id:"mapreduce-scan-caching",content:"MapReduce Scan Caching"},{id:"bundled-hbase-mapreduce-jobs",content:"Bundled HBase MapReduce Jobs"},{id:"hbase-as-a-mapreduce-job-data-source-and-data-sink",content:"HBase as a MapReduce Job Data Source and Data Sink"},{id:"writing-hfiles-directly-during-bulk-import",content:"Writing HFiles Directly During Bulk Import"},{id:"rowcounter-example",content:"RowCounter Example"},{id:"map-task-splitting",content:"Map-Task Splitting"},{id:"the-default-hbase-mapreduce-splitter",content:"The Default HBase MapReduce Splitter"},{id:"custom-splitters",content:"Custom Splitters"},{id:"hbase-mapreduce-examples",content:"HBase MapReduce Examples"},{id:"hbase-mapreduce-read-example",content:"HBase MapReduce Read Example"},{id:"hbase-mapreduce-readwrite-example",content:"HBase MapReduce Read/Write Example"},{id:"hbase-mapreduce-readwrite-example-with-multi-table-output",content:"HBase MapReduce Read/Write Example With Multi-Table Output"},{id:"hbase-mapreduce-summary-to-hbase-example",content:"HBase MapReduce Summary to HBase Example"},{id:"hbase-mapreduce-summary-to-file-example",content:"HBase MapReduce Summary to File Example"},{id:"hbase-mapreduce-summary-to-hbase-without-reducer",content:"HBase MapReduce Summary to HBase Without Reducer"},{id:"hbase-mapreduce-summary-to-rdbms",content:"HBase MapReduce Summary to RDBMS"},{id:"accessing-other-hbase-tables-in-a-mapreduce-job",content:"Accessing Other HBase Tables in a MapReduce Job"},{id:"mapreduce-speculative-execution",content:"Speculative Execution"}]};const o=[{depth:2,url:"#hbase-mapreduce-and-the-classpath",title:e.jsx(e.Fragment,{children:"HBase, MapReduce, and the CLASSPATH"})},{depth:2,url:"#mapreduce-scan-caching",title:e.jsx(e.Fragment,{children:"MapReduce Scan Caching"})},{depth:2,url:"#bundled-hbase-mapreduce-jobs",title:e.jsx(e.Fragment,{children:"Bundled HBase MapReduce Jobs"})},{depth:2,url:"#hbase-as-a-mapreduce-job-data-source-and-data-sink",title:e.jsx(e.Fragment,{children:"HBase as a MapReduce Job Data Source and Data Sink"})},{depth:2,url:"#writing-hfiles-directly-during-bulk-import",title:e.jsx(e.Fragment,{children:"Writing HFiles Directly During Bulk Import"})},{depth:2,url:"#rowcounter-example",title:e.jsx(e.Fragment,{children:"RowCounter Example"})},{depth:2,url:"#map-task-splitting",title:e.jsx(e.Fragment,{children:"Map-Task Splitting"})},{depth:3,url:"#the-default-hbase-mapreduce-splitter",title:e.jsx(e.Fragment,{children:"The Default HBase MapReduce Splitter"})},{depth:3,url:"#custom-splitters",title:e.jsx(e.Fragment,{children:"Custom Splitters"})},{depth:2,url:"#hbase-mapreduce-examples",title:e.jsx(e.Fragment,{children:"HBase MapReduce Examples"})},{depth:3,url:"#hbase-mapreduce-read-example",title:e.jsx(e.Fragment,{children:"HBase MapReduce Read Example"})},{depth:3,url:"#hbase-mapreduce-readwrite-example",title:e.jsx(e.Fragment,{children:"HBase MapReduce Read/Write Example"})},{depth:3,url:"#hbase-mapreduce-readwrite-example-with-multi-table-output",title:e.jsx(e.Fragment,{children:"HBase MapReduce Read/Write Example With Multi-Table Output"})},{depth:3,url:"#hbase-mapreduce-summary-to-hbase-example",title:e.jsx(e.Fragment,{children:"HBase MapReduce Summary to HBase Example"})},{depth:3,url:"#hbase-mapreduce-summary-to-file-example",title:e.jsx(e.Fragment,{children:"HBase MapReduce Summary to File Example"})},{depth:3,url:"#hbase-mapreduce-summary-to-hbase-without-reducer",title:e.jsx(e.Fragment,{children:"HBase MapReduce Summary to HBase Without Reducer"})},{depth:3,url:"#hbase-mapreduce-summary-to-rdbms",title:e.jsx(e.Fragment,{children:"HBase MapReduce Summary to RDBMS"})},{depth:2,url:"#accessing-other-hbase-tables-in-a-mapreduce-job",title:e.jsx(e.Fragment,{children:"Accessing Other HBase Tables in a MapReduce Job"})},{depth:2,url:"#mapreduce-speculative-execution",title:e.jsx(e.Fragment,{children:"Speculative Execution"})}];function n(i){const s={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",...i.components},{Callout:a}=s;return a||t("Callout"),e.jsxs(e.Fragment,{children:[e.jsxs(s.p,{children:["Apache MapReduce is a software framework used to analyze large amounts of data. It is provided by ",e.jsx(s.a,{href:"https://hadoop.apache.org/",children:"Apache Hadoop"}),`.
MapReduce itself is out of the scope of this document.
A good place to get started with MapReduce is `,e.jsx(s.a,{href:"https://hadoop.apache.org/docs/r2.6.0/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html",children:"https://hadoop.apache.org/docs/r2.6.0/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html"}),`.
MapReduce version 2 (MR2)is now part of `,e.jsx(s.a,{href:"https://hadoop.apache.org/docs/r2.6.0/hadoop-yarn/hadoop-yarn-site/",children:"YARN"}),"."]}),`
`,e.jsx(s.p,{children:`This chapter discusses specific configuration steps you need to take to use MapReduce on data within HBase.
In addition, it discusses other interactions and issues between HBase and MapReduce jobs.`}),`
`,e.jsx(a,{type:"info",title:"mapred and mapreduce",children:e.jsxs(s.p,{children:["There are two mapreduce packages in HBase as in MapReduce itself: ",e.jsx(s.em,{children:"org.apache.hadoop.hbase.mapred"}),`
and `,e.jsx(s.em,{children:"org.apache.hadoop.hbase.mapreduce"}),`. The former does old-style API and the latter the new
mode. The latter has more facility though you can usually find an equivalent in the older package.
Pick the package that goes with your MapReduce deploy. When in doubt or starting over, pick
`,e.jsx(s.em,{children:"org.apache.hadoop.hbase.mapreduce"}),". In the notes below, we refer to ",e.jsx(s.em,{children:"o.a.h.h.mapreduce"}),` but
replace with `,e.jsx(s.em,{children:"o.a.h.h.mapred"})," if that is what you are using."]})}),`
`,e.jsx(s.h2,{id:"hbase-mapreduce-and-the-classpath",children:"HBase, MapReduce, and the CLASSPATH"}),`
`,e.jsxs(s.p,{children:[`By default, MapReduce jobs deployed to a MapReduce cluster do not have access to
either the HBase configuration under `,e.jsx(s.code,{children:"$HBASE_CONF_DIR"})," or the HBase classes."]}),`
`,e.jsxs(s.p,{children:["To give the MapReduce jobs the access they need, you could add _hbase-site.xml_to _$HADOOP",e.jsx(s.em,{children:"HOME/conf"})," and add HBase jars to the ",e.jsx(s.em,{children:"$HADOOP_HOME/lib"}),` directory.
You would then need to copy these changes across your cluster. Or you could edit `,e.jsx(s.em,{children:"$HADOOP_HOME/conf/hadoop-env.sh"})," and add hbase dependencies to the ",e.jsx(s.code,{children:"HADOOP_CLASSPATH"}),` variable.
Neither of these approaches is recommended because it will pollute your Hadoop install with HBase references.
It also requires you restart the Hadoop cluster before Hadoop can use the HBase data.`]}),`
`,e.jsxs(s.p,{children:["The recommended approach is to let HBase add its dependency jars and use ",e.jsx(s.code,{children:"HADOOP_CLASSPATH"})," or ",e.jsx(s.code,{children:"-libjars"}),"."]}),`
`,e.jsxs(s.p,{children:["Since HBase ",e.jsx(s.code,{children:"0.90.x"}),`, HBase adds its dependency JARs to the job configuration itself.
The dependencies only need to be available on the local `,e.jsx(s.code,{children:"CLASSPATH"}),` and from here they'll be picked
up and bundled into the fat job jar deployed to the MapReduce cluster. A basic trick just passes
the full hbase classpath — all hbase and dependent jars as well as configurations — to the mapreduce
job runner letting hbase utility pick out from the full-on classpath what it needs adding them to the
MapReduce job configuration (See the source at `,e.jsx(s.code,{children:"TableMapReduceUtil#addDependencyJars(org.apache.hadoop.mapreduce.Job)"})," for how this is done)."]}),`
`,e.jsxs(s.p,{children:["The following example runs the bundled HBase ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/RowCounter.html",children:"RowCounter"})," MapReduce job against a table named ",e.jsx(s.code,{children:"usertable"}),`.
It sets into `,e.jsx(s.code,{children:"HADOOP_CLASSPATH"})," the jars hbase needs to run in an MapReduce context (including configuration files such as hbase-site.xml).\nBe sure to use the correct version of the HBase JAR for your system; replace the VERSION string in the below command line w/ the version of\nyour local hbase install. The backticks (```) cause the shell to execute the sub-commands, setting the output of ",e.jsx(s.code,{children:"hbase classpath"})," into ",e.jsx(s.code,{children:"HADOOP_CLASSPATH"}),`.
This example assumes you use a BASH-compatible shell.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HADOOP_CLASSPATH=`${"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HBASE_HOME"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}/bin/hbase classpath`"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ${HADOOP_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"/bin/hadoop"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/lib/hbase-mapreduce-VERSION.jar"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  org.apache.hadoop.hbase.mapreduce.RowCounter"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" usertable"})]})]})})}),`
`,e.jsx(s.p,{children:"The above command will launch a row counting mapreduce job against the hbase cluster that is pointed to by your local configuration on a cluster that the hadoop configs are pointing to."}),`
`,e.jsxs(s.p,{children:["The main for the ",e.jsx(s.code,{children:"hbase-mapreduce.jar"}),` is a Driver that lists a few basic mapreduce tasks that ship with hbase.
For example, presuming your install is hbase `,e.jsx(s.code,{children:"2.0.0-SNAPSHOT"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HADOOP_CLASSPATH=`${"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HBASE_HOME"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}/bin/hbase classpath`"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ${HADOOP_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"/bin/hadoop"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/lib/hbase-mapreduce-2.0.0-SNAPSHOT.jar"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"An"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" example"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" program"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" must"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" be"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" given"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" as"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" first"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" argument."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Valid"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" program"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" names"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" are:"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  CellCounter:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Count"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cells"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HBase"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  WALPlayer:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Replay"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" WAL"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" files."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  completebulkload:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Complete"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" a"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bulk"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" load."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  copytable:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Export"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" a"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" local"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cluster"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" peer"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cluster."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  export:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Write"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HDFS."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  exportsnapshot:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Export"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" specific"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" snapshot"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" a"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" given"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" FileSystem."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  import:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Import"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" written"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" by"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Export."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  importtsv:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Import"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TSV"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" format."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  rowcounter:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Count"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" rows"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HBase"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  verifyrep:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Compare"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tables"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" two"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" different"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clusters."}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" WARNING:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" It"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" doesn't work for incrementColumnValues'd"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cells"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" since"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" is"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" changed"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" after"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" being"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" appended"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" log."})]})]})})}),`
`,e.jsxs(s.p,{children:["You can use the above listed shortnames for mapreduce jobs as in the below re-run of the row counter job (again, presuming your install is hbase ",e.jsx(s.code,{children:"2.0.0-SNAPSHOT"}),"):"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HADOOP_CLASSPATH=`${"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HBASE_HOME"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}/bin/hbase classpath`"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ${HADOOP_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"/bin/hadoop"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/lib/hbase-mapreduce-2.0.0-SNAPSHOT.jar"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  rowcounter"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" usertable"})]})]})})}),`
`,e.jsxs(s.p,{children:["You might find the more selective ",e.jsx(s.code,{children:"hbase mapredcp"}),` tool output of interest; it lists the minimum set of jars needed
to run a basic mapreduce job against an hbase install. It does not include configuration. You'll probably need to add
these if you want your MapReduce job to find the target cluster. You'll probably have to also add pointers to extra jars
once you start to do anything of substance. Just specify the extras by passing the system propery `,e.jsx(s.code,{children:"-Dtmpjars"}),` when
you run `,e.jsx(s.code,{children:"hbase mapredcp"}),"."]}),`
`,e.jsxs(s.p,{children:["For jobs that do not package their dependencies or call ",e.jsx(s.code,{children:"TableMapReduceUtil#addDependencyJars"}),", the following command structure is necessary:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HADOOP_CLASSPATH=`${"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HBASE_HOME"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}/bin/hbase mapredcp`"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"${HBASE_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"/conf"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hadoop"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MyApp.jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MyJobMainClass"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -libjars"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $(${HBASE_HOME}/bin/hbase mapredcp "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"|"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" tr"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ':'"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ','"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"..."})]})})})}),`
`,e.jsxs(a,{type:"info",children:[e.jsx(s.p,{children:`The example may not work if you are running HBase from its build directory rather than an installed location.
You may see an error like the following:`}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"java.lang.RuntimeException: java.lang.ClassNotFoundException: org.apache.hadoop.hbase.mapreduce.RowCounter$RowCounterMapper"})})})})}),e.jsxs(s.p,{children:["If this occurs, try modifying the command as follows, so that it uses the HBase JARs from the ",e.jsx(s.em,{children:"target/"})," directory within the build environment."]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HADOOP_CLASSPATH="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"${HBASE_BUILD_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/hbase-mapreduce/target/hbase-mapreduce-VERSION-SNAPSHOT.jar:`${"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HBASE_BUILD_HOME"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}/bin/hbase classpath`"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HADOOP_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"/bin/hadoop"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_BUILD_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/hbase-mapreduce/target/hbase-mapreduce-VERSION-SNAPSHOT.jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" rowcounter"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" usertable"})]})})})})]}),`
`,e.jsxs(a,{type:"warn",title:"Notice to MapReduce users of HBase between 0.96.1 and 0.98.4",children:[e.jsx(s.p,{children:`Some MapReduce jobs that use HBase fail to launch.
The symptom is an exception similar to the following:`}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'Exception in thread "main" java.lang.IllegalAccessError: class'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    com.google.protobuf.ZeroCopyLiteralByteString cannot access its superclass"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    com.google.protobuf.LiteralByteString"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at java.lang.ClassLoader.defineClass1(Native Method)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at java.lang.ClassLoader.defineClass(ClassLoader.java:792)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at java.security.SecureClassLoader.defineClass(SecureClassLoader.java:142)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at java.net.URLClassLoader.defineClass(URLClassLoader.java:449)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at java.net.URLClassLoader.access$100(URLClassLoader.java:71)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at java.net.URLClassLoader$1.run(URLClassLoader.java:361)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at java.net.URLClassLoader$1.run(URLClassLoader.java:355)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at java.security.AccessController.doPrivileged(Native Method)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at java.net.URLClassLoader.findClass(URLClassLoader.java:354)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at java.lang.ClassLoader.loadClass(ClassLoader.java:424)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at java.lang.ClassLoader.loadClass(ClassLoader.java:357)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    org.apache.hadoop.hbase.protobuf.ProtobufUtil.toScan(ProtobufUtil.java:818)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    org.apache.hadoop.hbase.mapreduce.TableMapReduceUtil.convertScanToString(TableMapReduceUtil.java:433)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    org.apache.hadoop.hbase.mapreduce.TableMapReduceUtil.initTableMapperJob(TableMapReduceUtil.java:186)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    org.apache.hadoop.hbase.mapreduce.TableMapReduceUtil.initTableMapperJob(TableMapReduceUtil.java:147)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    org.apache.hadoop.hbase.mapreduce.TableMapReduceUtil.initTableMapperJob(TableMapReduceUtil.java:270)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    at"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    org.apache.hadoop.hbase.mapreduce.TableMapReduceUtil.initTableMapperJob(TableMapReduceUtil.java:100)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"..."})})]})})}),e.jsxs(s.p,{children:["This is caused by an optimization introduced in ",e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HBASE-9867",children:"HBASE-9867"})," that inadvertently introduced a classloader dependency."]}),e.jsxs(s.p,{children:["This affects both jobs using the ",e.jsx(s.code,{children:"-libjars"}),' option and "fat jar," those which package their runtime dependencies in a nested ',e.jsx(s.code,{children:"lib"})," folder."]}),e.jsxs(s.p,{children:["In order to satisfy the new classloader requirements, ",e.jsx(s.code,{children:"hbase-protocol.jar"}),` must be included in Hadoop's classpath.
See `,e.jsx(s.a,{href:"/docs/mapreduce#hbase-mapreduce-and-the-classpath",children:"HBase, MapReduce, and the CLASSPATH"}),` for current recommendations for resolving classpath errors.
The following is included for historical purposes.`]}),e.jsxs(s.p,{children:["This can be resolved system-wide by including a reference to the ",e.jsx(s.code,{children:"hbase-protocol.jar"})," in Hadoop's lib directory, via a symlink or by copying the jar into the new location."]}),e.jsxs(s.p,{children:["This can also be achieved on a per-job launch basis by including it in the ",e.jsx(s.code,{children:"HADOOP_CLASSPATH"}),` environment variable at job submission time.
When launching jobs that package their dependencies, all three of the following job launching commands satisfy this requirement:`]}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HADOOP_CLASSPATH=/path/to/hbase-protocol.jar:/path/to/hbase/conf"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hadoop"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MyJob.jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MyJobMainClass"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HADOOP_CLASSPATH="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapredcp"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:":/path/to/hbase/conf"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hadoop"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MyJob.jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MyJobMainClass"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HADOOP_CLASSPATH="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" classpath"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"hadoop"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MyJob.jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MyJobMainClass"})]})]})})}),e.jsx(s.p,{children:"For jars that do not package their dependencies, the following command structure is necessary:"}),e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HADOOP_CLASSPATH="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapredcp"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:":/etc/hbase/conf"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hadoop"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MyApp.jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MyJobMainClass"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -libjars"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapredcp"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" tr"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ':'"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ','"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"..."})]})})})}),e.jsxs(s.p,{children:["See also ",e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HBASE-10304",children:"HBASE-10304"})," for further discussion of this issue."]})]}),`
`,e.jsx(s.h2,{id:"mapreduce-scan-caching",children:"MapReduce Scan Caching"}),`
`,e.jsxs(s.p,{children:[`TableMapReduceUtil now restores the option to set scanner caching (the number of rows which are cached before returning the result to the client) on the Scan object that is passed in.
This functionality was lost due to a bug in HBase 0.95 (`,e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HBASE-11558",children:"HBASE-11558"}),`), which is fixed for HBase 0.98.5 and 0.96.3.
The priority order for choosing the scanner caching is as follows:`]}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsx(s.li,{children:"Caching settings which are set on the scan object."}),`
`,e.jsxs(s.li,{children:["Caching settings which are specified via the configuration option ",e.jsx(s.code,{children:"hbase.client.scanner.caching"}),", which can either be set manually in ",e.jsx(s.em,{children:"hbase-site.xml"})," or via the helper method ",e.jsx(s.code,{children:"TableMapReduceUtil.setScannerCaching()"}),"."]}),`
`,e.jsxs(s.li,{children:["The default value ",e.jsx(s.code,{children:"HConstants.DEFAULT_HBASE_CLIENT_SCANNER_CACHING"}),", which is set to ",e.jsx(s.code,{children:"100"}),"."]}),`
`]}),`
`,e.jsx(s.p,{children:`Optimizing the caching settings is a balance between the time the client waits for a result and the number of sets of results the client needs to receive.
If the caching setting is too large, the client could end up waiting for a long time or the request could even time out.
If the setting is too small, the scan needs to return results in several pieces.
If you think of the scan as a shovel, a bigger cache setting is analogous to a bigger shovel, and a smaller cache setting is equivalent to more shoveling in order to fill the bucket.`}),`
`,e.jsx(s.p,{children:"The list of priorities mentioned above allows you to set a reasonable default, and override it for specific operations."}),`
`,e.jsxs(s.p,{children:["See the API documentation for ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html",children:"Scan"})," for more details."]}),`
`,e.jsx(s.h2,{id:"bundled-hbase-mapreduce-jobs",children:"Bundled HBase MapReduce Jobs"}),`
`,e.jsx(s.p,{children:`The HBase JAR also serves as a Driver for some bundled MapReduce jobs.
To learn about the bundled MapReduce jobs, run the following command.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HADOOP_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/bin/hadoop"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/hbase-mapreduce-VERSION.jar"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"An"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" example"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" program"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" must"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" be"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" given"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" as"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" first"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" argument."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Valid"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" program"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" names"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" are:"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  copytable:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Export"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" a"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" local"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cluster"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" peer"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cluster"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  completebulkload:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Complete"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" a"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bulk"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" load."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  export:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Write"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HDFS."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  import:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Import"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" written"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" by"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Export."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  importtsv:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Import"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TSV"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" format."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  rowcounter:"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Count"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" rows"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HBase"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table"})]})]})})}),`
`,e.jsx(s.p,{children:`Each of the valid program names are bundled MapReduce jobs.
To run one of the jobs, model your command after the following example.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HADOOP_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/bin/hadoop"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ${HBASE_HOME}"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/hbase-mapreduce-VERSION.jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" rowcounter"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" myTable"})]})})})}),`
`,e.jsx(s.h2,{id:"hbase-as-a-mapreduce-job-data-source-and-data-sink",children:"HBase as a MapReduce Job Data Source and Data Sink"}),`
`,e.jsxs(s.p,{children:["HBase can be used as a data source, ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableInputFormat.html",children:"TableInputFormat"}),", and data sink, ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableOutputFormat.html",children:"TableOutputFormat"})," or ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/MultiTableOutputFormat.html",children:"MultiTableOutputFormat"}),`, for MapReduce jobs.
Writing MapReduce jobs that read or write HBase, it is advisable to subclass `,e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableMapper.html",children:"TableMapper"})," and/or ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableReducer.html",children:"TableReducer"}),`.
See the do-nothing pass-through classes `,e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/IdentityTableMapper.html",children:"IdentityTableMapper"})," and ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/IdentityTableReducer.html",children:"IdentityTableReducer"}),` for basic usage.
For a more involved example, see `,e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/RowCounter.html",children:"RowCounter"})," or review the ",e.jsx(s.code,{children:"org.apache.hadoop.hbase.mapreduce.TestTableMapReduce"})," unit test."]}),`
`,e.jsx(s.p,{children:"If you run MapReduce jobs that use HBase as source or sink, need to specify source and sink table and column names in your configuration."}),`
`,e.jsxs(s.p,{children:["When you read from HBase, the ",e.jsx(s.code,{children:"TableInputFormat"})," requests the list of regions from HBase and makes a map, which is either a ",e.jsx(s.code,{children:"map-per-region"})," or ",e.jsx(s.code,{children:"mapreduce.job.maps"}),` map, whichever is smaller.
If your job only has two maps, raise `,e.jsx(s.code,{children:"mapreduce.job.maps"}),` to a number greater than the number of regions.
Maps will run on the adjacent TaskTracker/NodeManager if you are running a TaskTracer/NodeManager and RegionServer per node.
When writing to HBase, it may make sense to avoid the Reduce step and write back into HBase from within your map.
This approach works when your job does not need the sort and collation that MapReduce does on the map-emitted data.
On insert, HBase 'sorts' so there is no point double-sorting (and shuffling data around your MapReduce cluster) unless you need to.
If you do not need the Reduce, your map might emit counts of records processed for reporting at the end of the job, or set the number of Reduces to zero and use TableOutputFormat.
If running the Reduce step makes sense in your case, you should typically use multiple reducers so that load is spread across the HBase cluster.`]}),`
`,e.jsxs(s.p,{children:["A new HBase partitioner, the ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/HRegionPartitioner.html",children:"HRegionPartitioner"}),`, can run as many reducers the number of existing regions.
The HRegionPartitioner is suitable when your table is large and your upload will not greatly alter the number of existing regions upon completion.
Otherwise use the default partitioner.`]}),`
`,e.jsx(s.h2,{id:"writing-hfiles-directly-during-bulk-import",children:"Writing HFiles Directly During Bulk Import"}),`
`,e.jsxs(s.p,{children:[`If you are importing into a new table, you can bypass the HBase API and write your content directly to the filesystem, formatted into HBase data files (HFiles). Your import will run faster, perhaps an order of magnitude faster.
For more on how this mechanism works, see `,e.jsx(s.a,{href:"/docs/architecture/bulk-loading",children:"Bulk Load"}),"."]}),`
`,e.jsx(s.h2,{id:"rowcounter-example",children:"RowCounter Example"}),`
`,e.jsxs(s.p,{children:["The included ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/RowCounter.html",children:"RowCounter"})," MapReduce job uses ",e.jsx(s.code,{children:"TableInputFormat"}),` and does a count of all rows in the specified table.
To run it, use the following command:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./bin/hadoop"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase-X.X.X.jar"})]})})})}),`
`,e.jsxs(s.p,{children:[`This will invoke the HBase MapReduce Driver class.
Select `,e.jsx(s.code,{children:"rowcounter"}),` from the choice of jobs offered.
This will print rowcounter usage advice to standard output.
Specify the tablename, column to count, and output directory.
If you have classpath errors, see `,e.jsx(s.a,{href:"/docs/mapreduce#hbase-mapreduce-and-the-classpath",children:"HBase, MapReduce, and the CLASSPATH"}),"."]}),`
`,e.jsx(s.h2,{id:"map-task-splitting",children:"Map-Task Splitting"}),`
`,e.jsx(s.h3,{id:"the-default-hbase-mapreduce-splitter",children:"The Default HBase MapReduce Splitter"}),`
`,e.jsxs(s.p,{children:["When ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableInputFormat.html",children:"TableInputFormat"}),` is used to source an HBase table in a MapReduce job, its splitter will make a map task for each region of the table.
Thus, if there are 100 regions in the table, there will be 100 map-tasks for the job - regardless of how many column families are selected in the Scan.`]}),`
`,e.jsx(s.h3,{id:"custom-splitters",children:"Custom Splitters"}),`
`,e.jsxs(s.p,{children:["For those interested in implementing custom splitters, see the method ",e.jsx(s.code,{children:"getSplits"})," in ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableInputFormatBase.html",children:"TableInputFormatBase"}),`.
That is where the logic for map-task assignment resides.`]}),`
`,e.jsx(s.h2,{id:"hbase-mapreduce-examples",children:"HBase MapReduce Examples"}),`
`,e.jsx(s.h3,{id:"hbase-mapreduce-read-example",children:"HBase MapReduce Read Example"}),`
`,e.jsx(s.p,{children:`The following is an example of using HBase as a MapReduce source in read-only manner.
Specifically, there is a Mapper instance but no Reducer, and nothing is being emitted from the Mapper.
The job would be defined as follows...`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Configuration config "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBaseConfiguration."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Job job "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Job"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(config, "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ExampleRead"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setJarByClass"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(MyReadJob.class);     "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// class that contains mapper"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Scan scan "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Scan"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"scan."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setCaching"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"500"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");        "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// 1 is the default in Scan, which will be bad for MapReduce jobs"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"scan."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setCacheBlocks"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");  "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// don't set to true for MR jobs"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// set other scan attrs"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TableMapReduceUtil."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"initTableMapperJob"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  tableName,        "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// input HBase table name"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  scan,             "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Scan instance to control CF and attribute selection"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  MyMapper.class,   "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// mapper"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  null"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",             "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// mapper output key"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  null"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",             "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// mapper output value"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  job);"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setOutputFormatClass"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(NullOutputFormat.class);   "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// because we aren't emitting anything from mapper"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"boolean"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"waitForCompletion"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"true"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"if"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"b) {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  throw"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IOException"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"error with job!"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["...and the mapper instance would extend ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableMapper.html",children:"TableMapper"}),"..."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MyMapper"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" extends"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TableMapper"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Text"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Text"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> {"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" map"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ImmutableBytesWritable "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"row"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Result "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Context "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"context"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" InterruptedException, IOException {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // process data for the row from the Result instance."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.h3,{id:"hbase-mapreduce-readwrite-example",children:"HBase MapReduce Read/Write Example"}),`
`,e.jsx(s.p,{children:`The following is an example of using HBase both as a source and as a sink with MapReduce.
This example will simply copy data from one table to another.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Configuration config "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBaseConfiguration."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Job job "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Job"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(config,"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ExampleReadWrite"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setJarByClass"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(MyReadWriteJob.class);    "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// class that contains mapper"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Scan scan "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Scan"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"scan."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setCaching"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"500"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");        "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// 1 is the default in Scan, which will be bad for MapReduce jobs"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"scan."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setCacheBlocks"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");  "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// don't set to true for MR jobs"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// set other scan attrs"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TableMapReduceUtil."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"initTableMapperJob"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  sourceTable,      "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// input table"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  scan,             "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Scan instance to control CF and attribute selection"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  MyMapper.class,   "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// mapper class"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  null"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",             "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// mapper output key"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  null"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",             "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// mapper output value"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  job);"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TableMapReduceUtil."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"initTableReducerJob"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  targetTable,      "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// output table"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  null"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",             "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// reducer class"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  job);"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setNumReduceTasks"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"boolean"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"waitForCompletion"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"true"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"if"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"b) {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  throw"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IOException"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"error with job!"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["An explanation is required of what ",e.jsx(s.code,{children:"TableMapReduceUtil"})," is doing, especially with the reducer. ",e.jsx(s.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/mapreduce/TableOutputFormat.html",children:"TableOutputFormat"})," is being used as the outputFormat class, and several parameters are being set on the config (e.g., ",e.jsx(s.code,{children:"TableOutputFormat.OUTPUT_TABLE"}),"), as well as setting the reducer output key to ",e.jsx(s.code,{children:"ImmutableBytesWritable"})," and reducer value to ",e.jsx(s.code,{children:"Writable"}),`.
These could be set by the programmer on the job and conf, but `,e.jsx(s.code,{children:"TableMapReduceUtil"})," tries to make things easier."]}),`
`,e.jsxs(s.p,{children:["The following is the example mapper, which will create a ",e.jsx(s.code,{children:"Put"})," and matching the input ",e.jsx(s.code,{children:"Result"}),` and emit it.
Note: this is what the CopyTable utility does.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MyMapper"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" extends"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TableMapper"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ImmutableBytesWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Put"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">  {"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" map"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ImmutableBytesWritable "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"row"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Result "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Context "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"context"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException, InterruptedException {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // this example is just copying the data from the source table..."})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      context."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"write"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(row, "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"resultToPut"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(row,value));"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Put "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"resultToPut"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ImmutableBytesWritable "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"key"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Result "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"result"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      Put put "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Put"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"());"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      for"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Cell cell "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" result."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"listCells"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        put."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(cell);"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      }"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      return"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" put;"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["There isn't actually a reducer step, so ",e.jsx(s.code,{children:"TableOutputFormat"})," takes care of sending the ",e.jsx(s.code,{children:"Put"})," to the target table."]}),`
`,e.jsxs(s.p,{children:["This is just an example, developers could choose not to use ",e.jsx(s.code,{children:"TableOutputFormat"})," and connect to the target table themselves."]}),`
`,e.jsx(s.h3,{id:"hbase-mapreduce-readwrite-example-with-multi-table-output",children:"HBase MapReduce Read/Write Example With Multi-Table Output"}),`
`,e.jsxs(s.p,{children:["TODO: example for ",e.jsx(s.code,{children:"MultiTableOutputFormat"}),"."]}),`
`,e.jsx(s.h3,{id:"hbase-mapreduce-summary-to-hbase-example",children:"HBase MapReduce Summary to HBase Example"}),`
`,e.jsx(s.p,{children:`The following example uses HBase as a MapReduce source and sink with a summarization step.
This example will count the number of distinct instances of a value in a table and write those summarized counts in another table.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Configuration config "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBaseConfiguration."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Job job "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Job"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(config,"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ExampleSummary"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setJarByClass"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(MySummaryJob.class);     "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// class that contains mapper and reducer"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Scan scan "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Scan"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"scan."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setCaching"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"500"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");        "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// 1 is the default in Scan, which will be bad for MapReduce jobs"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"scan."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setCacheBlocks"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");  "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// don't set to true for MR jobs"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// set other scan attrs"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TableMapReduceUtil."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"initTableMapperJob"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  sourceTable,        "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// input table"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  scan,               "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Scan instance to control CF and attribute selection"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  MyMapper.class,     "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// mapper class"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  Text.class,         "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// mapper output key"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  IntWritable.class,  "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// mapper output value"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  job);"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TableMapReduceUtil."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"initTableReducerJob"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  targetTable,        "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// output table"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  MyTableReducer.class,    "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// reducer class"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  job);"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setNumReduceTasks"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");   "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// at least one, adjust as required"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"boolean"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"waitForCompletion"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"true"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"if"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"b) {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  throw"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IOException"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"error with job!"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:[`In this example mapper a column with a String-value is chosen as the value to summarize upon.
This value is used as the key to emit from the mapper, and an `,e.jsx(s.code,{children:"IntWritable"})," represents an instance counter."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MyMapper"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" extends"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TableMapper"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Text"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"IntWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">  {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] CF "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "cf"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] ATTR1 "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "attr1"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  private"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IntWritable ONE "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  private"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Text text "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Text"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" map"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ImmutableBytesWritable "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"row"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Result "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Context "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"context"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException, InterruptedException {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    String val "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" String"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(value."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getValue"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CF, ATTR1));"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    text."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"set"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(val);     "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// we can only emit Writables..."})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    context."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"write"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(text, ONE);"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:['In the reducer, the "ones" are counted (just like any other MR example that does this), and then emits a ',e.jsx(s.code,{children:"Put"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MyTableReducer"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" extends"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TableReducer"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Text"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"IntWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ImmutableBytesWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">  {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] CF "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "cf"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] COUNT "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "count"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" reduce"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Text "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"key"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Iterable<"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"IntWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"values"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Context "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"context"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException, InterruptedException {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    int"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" i "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    for"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (IntWritable val "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" values) {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      i "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" val."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Put put "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Put"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()));"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    put."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CF, COUNT, Bytes."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(i));"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    context."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"write"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"null"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", put);"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.h3,{id:"hbase-mapreduce-summary-to-file-example",children:"HBase MapReduce Summary to File Example"}),`
`,e.jsx(s.p,{children:`This very similar to the summary example above, with exception that this is using HBase as a MapReduce source but HDFS as the sink.
The differences are in the job setup and in the reducer.
The mapper remains the same.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Configuration config "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBaseConfiguration."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Job job "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Job"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(config,"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ExampleSummaryToFile"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setJarByClass"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(MySummaryFileJob.class);     "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// class that contains mapper and reducer"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Scan scan "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Scan"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"scan."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setCaching"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"500"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");        "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// 1 is the default in Scan, which will be bad for MapReduce jobs"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"scan."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setCacheBlocks"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");  "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// don't set to true for MR jobs"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// set other scan attrs"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TableMapReduceUtil."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"initTableMapperJob"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  sourceTable,        "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// input table"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  scan,               "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Scan instance to control CF and attribute selection"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  MyMapper.class,     "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// mapper class"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  Text.class,         "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// mapper output key"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  IntWritable.class,  "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// mapper output value"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  job);"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setReducerClass"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(MyReducer.class);    "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// reducer class"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setNumReduceTasks"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");    "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// at least one, adjust as required"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"FileOutputFormat."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setOutputPath"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(job, "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Path"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"/tmp/mr/mySummaryFile"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));  "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// adjust directories as required"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"boolean"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" job."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"waitForCompletion"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"true"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"if"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"b) {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  throw"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IOException"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"error with job!"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.p,{children:`As stated above, the previous Mapper can run unchanged with this example.
As for the Reducer, it is a "generic" Reducer instead of extending TableMapper and emitting Puts.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MyReducer"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" extends"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Reducer"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Text"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"IntWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Text"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"IntWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">  {"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" reduce"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Text "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"key"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Iterable<"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"IntWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"values"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Context "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"context"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException, InterruptedException {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    int"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" i "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    for"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (IntWritable val "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" values) {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      i "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" val."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    context."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"write"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key, "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"new"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(i));"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.h3,{id:"hbase-mapreduce-summary-to-hbase-without-reducer",children:"HBase MapReduce Summary to HBase Without Reducer"}),`
`,e.jsx(s.p,{children:"It is also possible to perform summaries without a reducer - if you use HBase as the reducer."}),`
`,e.jsxs(s.p,{children:[`An HBase target table would need to exist for the job summary.
The Table method `,e.jsx(s.code,{children:"incrementColumnValue"}),` would be used to atomically increment values.
From a performance perspective, it might make sense to keep a Map of values with their values to be incremented for each map-task, and make one update per key at during the `,e.jsx(s.code,{children:"cleanup"}),` method of the mapper.
However, your mileage may vary depending on the number of rows to be processed and unique keys.`]}),`
`,e.jsx(s.p,{children:"In the end, the summary results are in HBase."}),`
`,e.jsx(s.h3,{id:"hbase-mapreduce-summary-to-rdbms",children:"HBase MapReduce Summary to RDBMS"}),`
`,e.jsxs(s.p,{children:[`Sometimes it is more appropriate to generate summaries to an RDBMS.
For these cases, it is possible to generate summaries directly to an RDBMS via a custom reducer.
The `,e.jsx(s.code,{children:"setup"})," method can connect to an RDBMS (the connection information can be passed via custom parameters in the context) and the cleanup method can close the connection."]}),`
`,e.jsx(s.p,{children:`It is critical to understand that number of reducers for the job affects the summarization implementation, and you'll have to design this into your reducer.
Specifically, whether it is designed to run as a singleton (one reducer) or multiple reducers.
Neither is right or wrong, it depends on your use-case.
Recognize that the more reducers that are assigned to the job, the more simultaneous connections to the RDBMS will be created - this will scale, but only to a point.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MyRdbmsReducer"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" extends"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Reducer"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Text"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"IntWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Text"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"IntWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">  {"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  private"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Connection c "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" setup"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Context "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"context"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // create DB connection..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" reduce"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Text "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"key"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Iterable<"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"IntWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"values"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Context "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"context"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException, InterruptedException {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // do summarization"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // in this example the keys are Text, but this is just an example"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" cleanup"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Context "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"context"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // close db connection"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.p,{children:"In the end, the summary results are written to your RDBMS table/s."}),`
`,e.jsx(s.h2,{id:"accessing-other-hbase-tables-in-a-mapreduce-job",children:"Accessing Other HBase Tables in a MapReduce Job"}),`
`,e.jsx(s.p,{children:"Although the framework currently allows one HBase table as input to a MapReduce job, other HBase tables can be accessed as lookup tables, etc., in a MapReduce job via creating an Table instance in the setup method of the Mapper."}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MyMapper"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" extends"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TableMapper"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Text"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"LongWritable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  private"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Table myOtherTable;"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" setup"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Context "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"context"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // In here create a Connection to the cluster and save it or use the Connection"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // from the existing table"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    myOtherTable "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" connection."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getTable"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"myOtherTable"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" map"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ImmutableBytesWritable "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"row"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Result "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Context "}),e.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"context"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException, InterruptedException {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // process Result..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // use 'myOtherTable' for lookups"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})})]})})}),`
`,e.jsx(s.h2,{id:"mapreduce-speculative-execution",children:"Speculative Execution"}),`
`,e.jsx(s.p,{children:`It is generally advisable to turn off speculative execution for MapReduce jobs that use HBase as a source.
This can either be done on a per-Job basis through properties, or on the entire cluster.
Especially for longer running jobs, speculative execution will create duplicate map-tasks which will double-write your data to HBase; this is probably not what you want.`}),`
`,e.jsxs(s.p,{children:["See ",e.jsx(s.a,{href:"/docs/configuration/important#configuration-important-recommended-configurations-speculative-execution",children:"Speculative Execution"})," for more information."]})]})}function p(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}function t(i,s){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{l as _markdown,p as default,d as extractedReferences,r as frontmatter,c as structuredData,o as toc};
