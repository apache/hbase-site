import{j as s}from"./components-BCHf_v1I.js";let h=`HBase Coprocessors are modeled after Google BigTable's coprocessor implementation
([http://research.google.com/people/jeff/SOCC2010-keynote-slides.pdf](http://research.google.com/people/jeff/SOCC2010-keynote-slides.pdf) pages 41-42.).
Efforts are ongoing to bridge gaps between HBase's
implementation and BigTable's architecture. For more information see
[HBASE-4047](https://issues.apache.org/jira/browse/HBASE-4047).

The information in this chapter is primarily sourced and heavily reused from the following
resources:

1. Mingjie Lai's blog post
   [Coprocessor Introduction](https://blogs.apache.org/hbase/entry/coprocessor_introduction).
2. Gaurav Bhardwaj's blog post
   [The How To Of HBase Coprocessors](http://www.3pillarglobal.com/insights/hbase-coprocessors).

<Callout type="warn" title="Use Coprocessors At Your Own Risk">
  Coprocessors are an advanced feature of HBase and are intended to be used by system
  developers only. Because coprocessor code runs directly on the RegionServer and has
  direct access to your data, they introduce the risk of data corruption, man-in-the-middle
  attacks, or other malicious data access. Currently, there is no mechanism to prevent
  data corruption by coprocessors, though work is underway on
  [HBASE-4047](https://issues.apache.org/jira/browse/HBASE-4047).

  In addition, there is no resource isolation, so a well-intentioned but misbehaving
  coprocessor can severely degrade cluster performance and stability.
</Callout>

## Coprocessor Overview

In HBase, you fetch data using a \`Get\` or \`Scan\`, whereas in an RDBMS you use a SQL
query. In order to fetch only the relevant data, you filter it using a HBase
[Filter](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/filter/Filter.html)
, whereas in an RDBMS you use a \`WHERE\` predicate.

After fetching the data, you perform computations on it. This paradigm works well
for "small data" with a few thousand rows and several columns. However, when you scale
to billions of rows and millions of columns, moving large amounts of data across your
network will create bottlenecks at the network layer, and the client needs to be powerful
enough and have enough memory to handle the large amounts of data and the computations.
In addition, the client code can grow large and complex.

In this scenario, coprocessors might make sense. You can put the business computation
code into a coprocessor which runs on the RegionServer, in the same location as the
data, and returns the result to the client.

This is only one scenario where using coprocessors can provide benefit. Following
are some analogies which may help to explain some of the benefits of coprocessors.

### Coprocessor Analogies

**Triggers and Stored Procedure**\\
An Observer coprocessor is similar to a trigger in a RDBMS in that it executes
your code either before or after a specific event (such as a \`Get\` or \`Put\`)
occurs. An endpoint coprocessor is similar to a stored procedure in a RDBMS
because it allows you to perform custom computations on the data on the
RegionServer itself, rather than on the client.

**MapReduce**\\
MapReduce operates on the principle of moving the computation to the location of
the data. Coprocessors operate on the same principal.

**AOP**\\
If you are familiar with Aspect Oriented Programming (AOP), you can think of a coprocessor
as applying advice by intercepting a request and then running some custom code,
before passing the request on to its final destination (or even changing the destination).

### Coprocessor Implementation Overview

1. Your class should implement one of the Coprocessor interfaces -
   [Coprocessor](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/Coprocessor.html),
   [RegionObserver](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html),
   [CoprocessorService](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/CoprocessorService.html) - to name a few.
2. Load the coprocessor, either statically (from the configuration) or dynamically,
   using HBase Shell. For more details see [Loading Coprocessors](/docs/cp#loading-coprocessors).
3. Call the coprocessor from your client-side code. HBase handles the coprocessor
   transparently.

The framework API is provided in the
[coprocessor](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/package-summary.html)
package.

## Types of Coprocessors

### Observer Coprocessors

Observer coprocessors are triggered either before or after a specific event occurs.
Observers that happen before an event use methods that start with a \`pre\` prefix,
such as [\`prePut\`](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html#prePut\\(org.apache.hadoop.hbase.coprocessor.ObserverContext,org.apache.hadoop.hbase.client.Put,org.apache.hadoop.hbase.wal.WALEdit\\)). Observers that happen just after an event override methods that start
with a \`post\` prefix, such as [\`postPut\`](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html#postPut\\(org.apache.hadoop.hbase.coprocessor.ObserverContext,org.apache.hadoop.hbase.client.Put,org.apache.hadoop.hbase.wal.WALEdit\\)).

#### Use Cases for Observer Coprocessors

**Security**\\
Before performing a \`Get\` or \`Put\` operation, you can check for permission using
\`preGet\` or \`prePut\` methods.

**Referential Integrity**\\
HBase does not directly support the RDBMS concept of refential integrity, also known
as foreign keys. You can use a coprocessor to enforce such integrity. For instance,
if you have a business rule that every insert to the \`users\` table must be followed
by a corresponding entry in the \`user_daily_attendance\` table, you could implement
a coprocessor to use the \`prePut\` method on \`user\` to insert a record into \`user_daily_attendance\`.

**Secondary Indexes**\\
You can use a coprocessor to maintain secondary indexes. For more information, see
[SecondaryIndexing](https://cwiki.apache.org/confluence/display/HADOOP2/Hbase+SecondaryIndexing).

#### Types of Observer Coprocessor

**RegionObserver**\\
A RegionObserver coprocessor allows you to observe events on a region, such as \`Get\`
and \`Put\` operations. See
[RegionObserver](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html).

**RegionServerObserver**\\
A RegionServerObserver allows you to observe events related to the RegionServer's
operation, such as starting, stopping, or performing merges, commits, or rollbacks.
See
[RegionServerObserver](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionServerObserver.html).

**MasterObserver**\\
A MasterObserver allows you to observe events related to the HBase Master, such
as table creation, deletion, or schema modification. See
[MasterObserver](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/MasterObserver.html).

**WalObserver**\\
A WalObserver allows you to observe events related to writes to the Write-Ahead
Log (WAL). See
[WALObserver](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/WALObserver.html).

[Examples](/docs/cp#cp-examples) provides working examples of observer coprocessors.

### Endpoint Coprocessor

Endpoint processors allow you to perform computation at the location of the data.
See [Coprocessor Analogy](/docs/cp#coprocessor-analogies). An example is the need to calculate a running
average or summation for an entire table which spans hundreds of regions.

In contrast to observer coprocessors, where your code is run transparently, endpoint
coprocessors must be explicitly invoked using the
[CoprocessorService()](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/AsyncTable.html#coprocessorService\\(java.util.function.Function,org.apache.hadoop.hbase.client.ServiceCaller,byte%5B%5D\\))
method available in
[AsyncTable](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/AsyncTable.html).

<Callout type="warn" title="On using coprocessorService method with sync client">
  The coprocessorService method in [Table](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html)
  has been deprecated.

  In [HBASE-21512](https://issues.apache.org/jira/browse/HBASE-21512)
  we reimplement the sync client based on the async client. The coprocessorService
  method defined in \`Table\` interface directly references a method from protobuf's
  \`BlockingInterface\`, which means we need to use a separate thread pool to execute
  the method so we avoid blocking the async client(We want to avoid blocking calls in
  our async implementation).

  Since coprocessor is an advanced feature, we believe it is OK for coprocessor users to
  instead switch over to use \`AsyncTable\`. There is a lightweight
  [toAsyncConnection](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Connection.html#toAsyncConnection\\(\\))
  method to get an \`AsyncConnection\` from \`Connection\` if needed.
</Callout>

Starting with HBase 0.96, endpoint coprocessors are implemented using Google Protocol
Buffers (protobuf). For more details on protobuf, see Google's
[Protocol Buffer Guide](https://developers.google.com/protocol-buffers/docs/proto).
Endpoints Coprocessor written in version 0.94 are not compatible with version 0.96 or later.
See
[HBASE-5448](https://issues.apache.org/jira/browse/HBASE-5448)). To upgrade your
HBase cluster from 0.94 or earlier to 0.96 or later, you need to reimplement your
coprocessor.

In HBase 2.x, we made use of a shaded version of protobuf 3.x, but kept the
protobuf for coprocessors on 2.5.0. In HBase 3.0.0, we removed all dependencies on
non-shaded protobuf so you need to reimplement your coprocessor to make use of the
shaded protobuf version provided in hbase-thirdparty. Please see
the [protobuf](/docs/protobuf) section for more details.

Coprocessor Endpoints should make no use of HBase internals and
only avail of public APIs; ideally a CPEP should depend on Interfaces
and data structures only. This is not always possible but beware
that doing so makes the Endpoint brittle, liable to breakage as HBase
internals evolve. HBase internal APIs annotated as private or evolving
do not have to respect semantic versioning rules or general java rules on
deprecation before removal. While generated protobuf files are
absent the hbase audience annotations — they are created by the
protobuf protoc tool which knows nothing of how HBase works —
they should be consided \`@InterfaceAudience.Private\` so are liable to
change.

[Examples](/docs/cp#cp-examples) provides working examples of endpoint coprocessors.

## Loading Coprocessors

To make your coprocessor available to HBase, it must be *loaded*, either statically
(through the HBase configuration) or dynamically (using HBase Shell or the Java API).

### Static Loading

Follow these steps to statically load your coprocessor. Keep in mind that you must
restart HBase to unload a coprocessor that has been loaded statically.

1. Define the Coprocessor in *hbase-site.xml*, with a \`<property>\` element with a \`<name>\`
   and a \`<value>\` sub-element. The \`<name>\` should be one of the following:

   * \`hbase.coprocessor.region.classes\` for RegionObservers and Endpoints.
   * \`hbase.coprocessor.wal.classes\` for WALObservers.
   * \`hbase.coprocessor.master.classes\` for MasterObservers.

     \`<value>\` must contain the fully-qualified class name of your coprocessor's implementation
     class.

     For example to load a Coprocessor (implemented in class SumEndPoint.java) you have to create
     following entry in RegionServer's 'hbase-site.xml' file (generally located under 'conf' directory):

     \`\`\`xml
     <property>
         <name>hbase.coprocessor.region.classes</name>
         <value>org.myname.hbase.coprocessor.endpoint.SumEndPoint</value>
     </property>
     \`\`\`

     If multiple classes are specified for loading, the class names must be comma-separated.
     The framework attempts to load all the configured classes using the default class loader.
     Therefore, the jar file must reside on the server-side HBase classpath.

     Coprocessors which are loaded in this way will be active on all regions of all tables.
     These are also called system Coprocessor.
     The first listed Coprocessors will be assigned the priority \`Coprocessor.Priority.SYSTEM\`.
     Each subsequent coprocessor in the list will have its priority value incremented by one (which
     reduces its priority, because priorities have the natural sort order of Integers).

     These priority values can be manually overriden in hbase-site.xml. This can be useful if you
     want to guarantee that a coprocessor will execute after another. For example, in the following
     configuration \`SumEndPoint\` would be guaranteed to go last, except in the case of a tie with
     another coprocessor:

     \`\`\`xml
     <property>
         <name>hbase.coprocessor.region.classes</name>
         <value>org.myname.hbase.coprocessor.endpoint.SumEndPoint|2147483647</value>
     </property>
     \`\`\`

   When calling out to registered observers, the framework executes their callbacks methods in the
   sorted order of their priority.
   Ties are broken arbitrarily.

2. Put your code on HBase's classpath. One easy way to do this is to drop the jar
   (containing you code and all the dependencies) into the \`lib/\` directory in the
   HBase installation.

3. Restart HBase.

### Static Unloading

1. Delete the coprocessor's \`<property>\` element, including sub-elements, from \`hbase-site.xml\`.
2. Restart HBase.
3. Optionally, remove the coprocessor's JAR file from the classpath or HBase's \`lib/\`
   directory.

### Dynamic Loading

You can also load a coprocessor dynamically, without restarting HBase. This may seem
preferable to static loading, but dynamically loaded coprocessors are loaded on a
per-table basis, and are only available to the table for which they were loaded. For
this reason, dynamically loaded tables are sometimes called **Table Coprocessor**.

In addition, dynamically loading a coprocessor acts as a schema change on the table,
and the table must be taken offline to load the coprocessor.

There are three ways to dynamically load Coprocessor.

<Callout type="info" title="Assumptions">
  The below mentioned instructions makes the following assumptions:

  * A JAR called \`coprocessor.jar\` contains the Coprocessor implementation along with all of its
    dependencies.
  * The JAR is available in HDFS in some location like
    \`hdfs://NAMENODE:PORT/user/HADOOP_USER/coprocessor.jar\`.
</Callout>

#### Using HBase Shell

1. Load the Coprocessor, using a command like the following:

   \`\`\`ruby
   hbase alter 'users', METHOD => 'table_att', 'Coprocessor'=>'hdfs://NAMENODE:PORT/user/HADOOP_USER/coprocessor.jar|org.myname.hbase.Coprocessor.RegionObserverExample|1073741823|arg1=1,arg2=2'
   \`\`\`

   The Coprocessor framework will try to read the class information from the coprocessor table
   attribute value.
   The value contains four pieces of information which are separated by the pipe (\`|\`) character.

   * File path: The jar file containing the Coprocessor implementation must be in a location where
     all region servers can read it.
     You could copy the file onto the local disk on each region server, but it is recommended to store
     it in HDFS.
     [HBASE-14548](https://issues.apache.org/jira/browse/HBASE-14548) allows a directory containing the jars
     or some wildcards to be specified, such as: \`hdfs://NAMENODE:PORT/user/HADOOP_USER/\` or
     \`hdfs://NAMENODE:PORT/user/HADOOP_USER/*.jar\`. Please note that if a directory is specified,
     all jar files(.jar) in the directory are added. It does not search for files in sub-directories.
     Do not use a wildcard if you would like to specify a directory. This enhancement applies to the
     usage via the JAVA API as well.
   * Class name: The full class name of the Coprocessor.
   * Priority: An integer. The framework will determine the execution sequence of all configured
     observers registered at the same hook using priorities. This field can be left blank. In that
     case the framework will assign a default priority value.
   * Arguments (Optional): This field is passed to the Coprocessor implementation. This is optional.

2. Verify that the coprocessor loaded:

   \`\`\`ruby
   hbase(main):04:0> describe 'users'
   \`\`\`

   The coprocessor should be listed in the \`TABLE_ATTRIBUTES\`.

#### Using the Java API (all HBase versions)

The following Java code shows how to use the \`setValue()\` method of \`HTableDescriptor\`
to load a coprocessor on the \`users\` table.

\`\`\`java
TableName tableName = TableName.valueOf("users");
String path = "hdfs://<namenode>:<port>/user/<hadoop-user>/coprocessor.jar";
Configuration conf = HBaseConfiguration.create();
Connection connection = ConnectionFactory.createConnection(conf);
Admin admin = connection.getAdmin();
HTableDescriptor hTableDescriptor = new HTableDescriptor(tableName);
HColumnDescriptor columnFamily1 = new HColumnDescriptor("personalDet");
columnFamily1.setMaxVersions(3);
hTableDescriptor.addFamily(columnFamily1);
HColumnDescriptor columnFamily2 = new HColumnDescriptor("salaryDet");
columnFamily2.setMaxVersions(3);
hTableDescriptor.addFamily(columnFamily2);
hTableDescriptor.setValue("COPROCESSOR$1", path + "|"
+ RegionObserverExample.class.getCanonicalName() + "|"
+ Coprocessor.PRIORITY_USER);
admin.modifyTable(tableName, hTableDescriptor);
\`\`\`

#### Using the Java API (HBase 0.96+ only)

In HBase 0.96 and newer, the \`addCoprocessor()\` method of \`HTableDescriptor\` provides
an easier way to load a coprocessor dynamically.

\`\`\`java
TableName tableName = TableName.valueOf("users");
Path path = new Path("hdfs://<namenode>:<port>/user/<hadoop-user>/coprocessor.jar");
Configuration conf = HBaseConfiguration.create();
Connection connection = ConnectionFactory.createConnection(conf);
Admin admin = connection.getAdmin();
HTableDescriptor hTableDescriptor = new HTableDescriptor(tableName);
HColumnDescriptor columnFamily1 = new HColumnDescriptor("personalDet");
columnFamily1.setMaxVersions(3);
hTableDescriptor.addFamily(columnFamily1);
HColumnDescriptor columnFamily2 = new HColumnDescriptor("salaryDet");
columnFamily2.setMaxVersions(3);
hTableDescriptor.addFamily(columnFamily2);
hTableDescriptor.addCoprocessor(RegionObserverExample.class.getCanonicalName(), path,
Coprocessor.PRIORITY_USER, null);
admin.modifyTable(tableName, hTableDescriptor);
\`\`\`

<Callout type="warn">
  There is no guarantee that the framework will load a given Coprocessor successfully. For example,
  the shell command neither guarantees a jar file exists at a particular location nor verifies
  whether the given class is actually contained in the jar file.
</Callout>

### Dynamic Unloading

#### Using HBase Shell

1. Alter the table to remove the coprocessor with \`table_att_unset\`.

   \`\`\`ruby
   hbase> alter 'users', METHOD => 'table_att_unset', NAME => 'coprocessor$1'
   \`\`\`

2. Alter the table to remove the coprocessor with \`table_remove_coprocessor\` introduced in
   [HBASE-26524](https://issues.apache.org/jira/browse/HBASE-26524) by specifying an explicit
   classname

   \`\`\`ruby
   hbase> alter 'users', METHOD => 'table_remove_coprocessor', CLASSNAME => \\
       'org.myname.hbase.Coprocessor.RegionObserverExample'
   \`\`\`

#### Using the Java API

Reload the table definition without setting the value of the coprocessor either by
using \`setValue()\` or \`addCoprocessor()\` methods. This will remove any coprocessor
attached to the table.

\`\`\`java
TableName tableName = TableName.valueOf("users");
String path = "hdfs://<namenode>:<port>/user/<hadoop-user>/coprocessor.jar";
Configuration conf = HBaseConfiguration.create();
Connection connection = ConnectionFactory.createConnection(conf);
Admin admin = connection.getAdmin();
HTableDescriptor hTableDescriptor = new HTableDescriptor(tableName);
HColumnDescriptor columnFamily1 = new HColumnDescriptor("personalDet");
columnFamily1.setMaxVersions(3);
hTableDescriptor.addFamily(columnFamily1);
HColumnDescriptor columnFamily2 = new HColumnDescriptor("salaryDet");
columnFamily2.setMaxVersions(3);
hTableDescriptor.addFamily(columnFamily2);
admin.modifyTable(tableName, hTableDescriptor);
\`\`\`

In HBase 0.96 and newer, you can instead use the \`removeCoprocessor()\` method of the
\`HTableDescriptor\` class.

## Examples

HBase ships examples for Observer Coprocessor.

A more detailed example is given below.

These examples assume a table called \`users\`, which has two column families \`personalDet\`
and \`salaryDet\`, containing personal and salary details. Below is the graphical representation
of the \`users\` table.

**Users Table**

|            | **personalDet** |              |            | **salaryDet** |         |                |
| ---------- | --------------- | ------------ | ---------- | ------------- | ------- | -------------- |
| **rowkey** | **name**        | **lastname** | **dob**    | **gross**     | **net** | **allowances** |
| admin      | Admin           | Admin        |            |               |         |                |
| cdickens   | Charles         | Dickens      | 02/07/1812 | 10000         | 8000    | 2000           |
| jverne     | Jules           | Verne        | 02/08/1828 | 12000         | 9000    | 3000           |

### Observer Example

The following Observer coprocessor prevents the details of the user \`admin\` from being
returned in a \`Get\` or \`Scan\` of the \`users\` table.

1. Write a class that implements the
   [RegionCoprocessor](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionCoprocessor.html),
   [RegionObserver](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html)
   class.
2. Override the \`preGetOp()\` method (the \`preGet()\` method is deprecated) to check
   whether the client has queried for the rowkey with value \`admin\`. If so, return an
   empty result. Otherwise, process the request as normal.
3. Put your code and dependencies in a JAR file.
4. Place the JAR in HDFS where HBase can locate it.
5. Load the Coprocessor.
6. Write a simple program to test it.

Following are the implementation of the above steps:

\`\`\`java
public class RegionObserverExample implements RegionCoprocessor, RegionObserver {

    private static final byte[] ADMIN = Bytes.toBytes("admin");
    private static final byte[] COLUMN_FAMILY = Bytes.toBytes("details");
    private static final byte[] COLUMN = Bytes.toBytes("Admin_det");
    private static final byte[] VALUE = Bytes.toBytes("You can't see Admin details");

    @Override
    public Optional<RegionObserver> getRegionObserver() {
      return Optional.of(this);
    }

    @Override
    public void preGetOp(final ObserverContext<RegionCoprocessorEnvironment> e, final Get get, final List<Cell> results)
    throws IOException {

        if (Bytes.equals(get.getRow(),ADMIN)) {
            Cell c = CellUtil.createCell(get.getRow(),COLUMN_FAMILY, COLUMN,
            System.currentTimeMillis(), (byte)4, VALUE);
            results.add(c);
            e.bypass();
        }
    }
}
\`\`\`

Overriding the \`preGetOp()\` will only work for \`Get\` operations. You also need to override
the \`preScannerOpen()\` method to filter the \`admin\` row from scan results.

\`\`\`java
@Override
public RegionScanner preScannerOpen(final ObserverContext<RegionCoprocessorEnvironment> e, final Scan scan,
final RegionScanner s) throws IOException {

    Filter filter = new RowFilter(CompareOp.NOT_EQUAL, new BinaryComparator(ADMIN));
    scan.setFilter(filter);
    return s;
}
\`\`\`

This method works but there is a *side effect*. If the client has used a filter in
its scan, that filter will be replaced by this filter. Instead, you can explicitly
remove any \`admin\` results from the scan:

\`\`\`java
@Override
public boolean postScannerNext(final ObserverContext<RegionCoprocessorEnvironment> e, final InternalScanner s,
final List<Result> results, final int limit, final boolean hasMore) throws IOException {
        Result result = null;
    Iterator<Result> iterator = results.iterator();
    while (iterator.hasNext()) {
    result = iterator.next();
        if (Bytes.equals(result.getRow(), ROWKEY)) {
            iterator.remove();
            break;
        }
    }
    return hasMore;
}
\`\`\`

### Endpoint Example

Still using the \`users\` table, this example implements a coprocessor to calculate
the sum of all employee salaries, using an endpoint coprocessor.

1. Create a '.proto' file defining your service.

   \`\`\`protobuf
   option java_package = "org.myname.hbase.coprocessor.autogenerated";
   option java_outer_classname = "Sum";
   option java_generic_services = true;
   option java_generate_equals_and_hash = true;
   option optimize_for = SPEED;
   message SumRequest {
       required string family = 1;
       required string column = 2;
   }

   message SumResponse {
   required int64 sum = 1 [default = 0];
   }

   service SumService {
   rpc getSum(SumRequest)
       returns (SumResponse);
   }
   \`\`\`

2. Execute the \`protoc\` command to generate the Java code from the above .proto' file.

   \`\`\`bash
   $ mkdir src
   $ protoc --java_out=src ./sum.proto
   \`\`\`

   This will generate a class call \`Sum.java\`.

3. Write a class that extends the generated service class, implement the \`Coprocessor\`
   and \`CoprocessorService\` classes, and override the service method.

   <Callout type="warn">
     If you load a coprocessor from \`hbase-site.xml\` and then load the same coprocessor
     again using HBase Shell, it will be loaded a second time. The same class will
     exist twice, and the second instance will have a higher ID (and thus a lower priority).
     The effect is that the duplicate coprocessor is effectively ignored.
   </Callout>

   \`\`\`java
   public class SumEndPoint extends Sum.SumService implements Coprocessor, CoprocessorService {

       private RegionCoprocessorEnvironment env;

       @Override
       public Service getService() {
           return this;
       }

       @Override
       public void start(CoprocessorEnvironment env) throws IOException {
           if (env instanceof RegionCoprocessorEnvironment) {
               this.env = (RegionCoprocessorEnvironment)env;
           } else {
               throw new CoprocessorException("Must be loaded on a table region!");
           }
       }

       @Override
       public void stop(CoprocessorEnvironment env) throws IOException {
           // do nothing
       }

       @Override
       public void getSum(RpcController controller, Sum.SumRequest request, RpcCallback<Sum.SumResponse> done) {
           Scan scan = new Scan();
           scan.addFamily(Bytes.toBytes(request.getFamily()));
           scan.addColumn(Bytes.toBytes(request.getFamily()), Bytes.toBytes(request.getColumn()));

           Sum.SumResponse response = null;
           InternalScanner scanner = null;

           try {
               scanner = env.getRegion().getScanner(scan);
               List<Cell> results = new ArrayList<>();
               boolean hasMore = false;
               long sum = 0L;

               do {
                   hasMore = scanner.next(results);
                   for (Cell cell : results) {
                       sum = sum + Bytes.toLong(CellUtil.cloneValue(cell));
                   }
                   results.clear();
               } while (hasMore);

               response = Sum.SumResponse.newBuilder().setSum(sum).build();
           } catch (IOException ioe) {
               ResponseConverter.setControllerException(controller, ioe);
           } finally {
               if (scanner != null) {
                   try {
                       scanner.close();
                   } catch (IOException ignored) {}
               }
           }

           done.run(response);
       }
   }
   \`\`\`

   \`\`\`java
   Configuration conf = HBaseConfiguration.create();
   Connection connection = ConnectionFactory.createConnection(conf);
   TableName tableName = TableName.valueOf("users");
   Table table = connection.getTable(tableName);

   final Sum.SumRequest request = Sum.SumRequest.newBuilder().setFamily("salaryDet").setColumn("gross").build();
   try {
       Map<byte[], Long> results = table.coprocessorService(
           Sum.SumService.class,
           null,  /* start key */
           null,  /* end   key */
           new Batch.Call<Sum.SumService, Long>() {
               @Override
               public Long call(Sum.SumService aggregate) throws IOException {
                   BlockingRpcCallback<Sum.SumResponse> rpcCallback = new BlockingRpcCallback<>();
                   aggregate.getSum(null, request, rpcCallback);
                   Sum.SumResponse response = rpcCallback.get();

                   return response.hasSum() ? response.getSum() : 0L;
               }
           }
       );

       for (Long sum : results.values()) {
           System.out.println("Sum = " + sum);
       }
   } catch (ServiceException e) {
       e.printStackTrace();
   } catch (Throwable e) {
       e.printStackTrace();
   }
   \`\`\`

4. Load the Coprocessor.

5. Write a client code to call the Coprocessor.

## Guidelines For Deploying A Coprocessor

**Bundling Coprocessors**\\
You can bundle all classes for a coprocessor into a
single JAR on the RegionServer's classpath, for easy deployment. Otherwise,
place all dependencies on the RegionServer's classpath so that they can be
loaded during RegionServer start-up. The classpath for a RegionServer is set
in the RegionServer's \`hbase-env.sh\` file.

**Automating Deployment**\\
You can use a tool such as Puppet, Chef, or
Ansible to ship the JAR for the coprocessor to the required location on your
RegionServers' filesystems and restart each RegionServer, to automate
coprocessor deployment. Details for such set-ups are out of scope of this
document.

**Updating a Coprocessor**\\
Deploying a new version of a given coprocessor is not as simple as disabling it,
replacing the JAR, and re-enabling the coprocessor. This is because you cannot
reload a class in a JVM unless you delete all the current references to it.
Since the current JVM has reference to the existing coprocessor, you must restart
the JVM, by restarting the RegionServer, in order to replace it. This behavior
is not expected to change.

**Coprocessor Logging**\\
The Coprocessor framework does not provide an API for logging beyond standard Java
logging.

**Coprocessor Configuration**\\
If you do not want to load coprocessors from the HBase Shell, you can add their configuration
properties to \`hbase-site.xml\`. In [Using HBase Shell](/docs/cp#using-hbase-shell), two arguments are
set: \`arg1=1,arg2=2\`. These could have been added to \`hbase-site.xml\` as follows:

\`\`\`xml
<property>
  <name>arg1</name>
  <value>1</value>
</property>
<property>
  <name>arg2</name>
  <value>2</value>
</property>
\`\`\`

Then you can read the configuration using code like the following:

\`\`\`java
Configuration conf = HBaseConfiguration.create();
Connection connection = ConnectionFactory.createConnection(conf);
TableName tableName = TableName.valueOf("users");
Table table = connection.getTable(tableName);

Get get = new Get(Bytes.toBytes("admin"));
Result result = table.get(get);
for (Cell c : result.rawCells()) {
    System.out.println(Bytes.toString(CellUtil.cloneRow(c))
        + "==> " + Bytes.toString(CellUtil.cloneFamily(c))
        + "{" + Bytes.toString(CellUtil.cloneQualifier(c))
        + ":" + Bytes.toLong(CellUtil.cloneValue(c)) + "}");
}
Scan scan = new Scan();
ResultScanner scanner = table.getScanner(scan);
for (Result res : scanner) {
    for (Cell c : res.rawCells()) {
        System.out.println(Bytes.toString(CellUtil.cloneRow(c))
        + " ==> " + Bytes.toString(CellUtil.cloneFamily(c))
        + " {" + Bytes.toString(CellUtil.cloneQualifier(c))
        + ":" + Bytes.toLong(CellUtil.cloneValue(c))
        + "}");
    }
}
\`\`\`

## Restricting Coprocessor Usage

Restricting arbitrary user coprocessors can be a big concern in multitenant environments. HBase provides a continuum of options for ensuring only expected coprocessors are running:

* \`hbase.coprocessor.enabled\`: Enables or disables all coprocessors. This will limit the functionality of HBase, as disabling all coprocessors will disable some security providers. An example coproccessor so affected is \`org.apache.hadoop.hbase.security.access.AccessController\`.
  * \`hbase.coprocessor.user.enabled\`: Enables or disables loading coprocessors on tables (i.e. user coprocessors).
  * One can statically load coprocessors, and optionally tune their priorities, via the following tunables in \`hbase-site.xml\`:
    * \`hbase.coprocessor.regionserver.classes\`: A comma-separated list of coprocessors that are loaded by region servers
    * \`hbase.coprocessor.region.classes\`: A comma-separated list of RegionObserver and Endpoint coprocessors
    * \`hbase.coprocessor.user.region.classes\`: A comma-separated list of coprocessors that are loaded by all regions
    * \`hbase.coprocessor.master.classes\`: A comma-separated list of coprocessors that are loaded by the master (MasterObserver coprocessors)
    * \`hbase.coprocessor.wal.classes\`: A comma-separated list of WALObserver coprocessors to load
  * \`hbase.coprocessor.abortonerror\`: Whether to abort the daemon which has loaded the coprocessor if the coprocessor should error other than \`IOError\`. If this is set to false and an access controller coprocessor should have a fatal error the coprocessor will be circumvented, as such in secure installations this is advised to be \`true\`; however, one may override this on a per-table basis for user coprocessors, to ensure they do not abort their running region server and are instead unloaded on error.
  * \`hbase.coprocessor.region.whitelist.paths\`: A comma separated list available for those loading \`org.apache.hadoop.hbase.security.access.CoprocessorWhitelistMasterObserver\` whereby one can use the following options to white-list paths from which coprocessors may be loaded.
    * Coprocessors on the classpath are implicitly white-listed
    * \`*\` to wildcard all coprocessor paths
    * An entire filesystem (e.g. \`hdfs://my-cluster/\`)
    * A wildcard path to be evaluated by [FilenameUtils.wildcardMatch](https://commons.apache.org/proper/commons-io/javadocs/api-release/org/apache/commons/io/FilenameUtils.html)
    * Note: Path can specify scheme or not (e.g. \`file:///usr/hbase/lib/coprocessors\` or for all filesystems \`/usr/hbase/lib/coprocessors\`)
`,t={title:"Apache HBase Coprocessors",description:"The coprocessor framework provides mechanisms for running your custom code directly on the RegionServers managing your data."},o=[{href:"http://research.google.com/people/jeff/SOCC2010-keynote-slides.pdf"},{href:"https://issues.apache.org/jira/browse/HBASE-4047"},{href:"https://blogs.apache.org/hbase/entry/coprocessor_introduction"},{href:"http://www.3pillarglobal.com/insights/hbase-coprocessors"},{href:"https://issues.apache.org/jira/browse/HBASE-4047"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/filter/Filter.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/Coprocessor.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/CoprocessorService.html"},{href:"/docs/cp#loading-coprocessors"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/package-summary.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html#prePut(org.apache.hadoop.hbase.coprocessor.ObserverContext,org.apache.hadoop.hbase.client.Put,org.apache.hadoop.hbase.wal.WALEdit)"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html#postPut(org.apache.hadoop.hbase.coprocessor.ObserverContext,org.apache.hadoop.hbase.client.Put,org.apache.hadoop.hbase.wal.WALEdit)"},{href:"https://cwiki.apache.org/confluence/display/HADOOP2/Hbase+SecondaryIndexing"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionServerObserver.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/MasterObserver.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/WALObserver.html"},{href:"/docs/cp#cp-examples"},{href:"/docs/cp#coprocessor-analogies"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/AsyncTable.html#coprocessorService(java.util.function.Function,org.apache.hadoop.hbase.client.ServiceCaller,byte%5B%5D)"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/AsyncTable.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html"},{href:"https://issues.apache.org/jira/browse/HBASE-21512"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Connection.html#toAsyncConnection()"},{href:"https://developers.google.com/protocol-buffers/docs/proto"},{href:"https://issues.apache.org/jira/browse/HBASE-5448"},{href:"/docs/protobuf"},{href:"/docs/cp#cp-examples"},{href:"https://issues.apache.org/jira/browse/HBASE-14548"},{href:"https://issues.apache.org/jira/browse/HBASE-26524"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionCoprocessor.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html"},{href:"/docs/cp#using-hbase-shell"},{href:"https://commons.apache.org/proper/commons-io/javadocs/api-release/org/apache/commons/io/FilenameUtils.html"}],c={contents:[{heading:void 0,content:`HBase Coprocessors are modeled after Google BigTable's coprocessor implementation
(http\\://research.google.com/people/jeff/SOCC2010-keynote-slides.pdf pages 41-42.).
Efforts are ongoing to bridge gaps between HBase's
implementation and BigTable's architecture. For more information see
HBASE-4047.`},{heading:void 0,content:`The information in this chapter is primarily sourced and heavily reused from the following
resources:`},{heading:void 0,content:`Mingjie Lai's blog post
Coprocessor Introduction.`},{heading:void 0,content:`Gaurav Bhardwaj's blog post
The How To Of HBase Coprocessors.`},{heading:void 0,content:`Coprocessors are an advanced feature of HBase and are intended to be used by system
developers only. Because coprocessor code runs directly on the RegionServer and has
direct access to your data, they introduce the risk of data corruption, man-in-the-middle
attacks, or other malicious data access. Currently, there is no mechanism to prevent
data corruption by coprocessors, though work is underway on
HBASE-4047.`},{heading:void 0,content:`In addition, there is no resource isolation, so a well-intentioned but misbehaving
coprocessor can severely degrade cluster performance and stability.`},{heading:"coprocessor-overview",content:"In HBase, you fetch data using a `Get` or `Scan`, whereas in an RDBMS you use a SQL\nquery. In order to fetch only the relevant data, you filter it using a HBase\nFilter\n, whereas in an RDBMS you use a `WHERE` predicate."},{heading:"coprocessor-overview",content:`After fetching the data, you perform computations on it. This paradigm works well
for "small data" with a few thousand rows and several columns. However, when you scale
to billions of rows and millions of columns, moving large amounts of data across your
network will create bottlenecks at the network layer, and the client needs to be powerful
enough and have enough memory to handle the large amounts of data and the computations.
In addition, the client code can grow large and complex.`},{heading:"coprocessor-overview",content:`In this scenario, coprocessors might make sense. You can put the business computation
code into a coprocessor which runs on the RegionServer, in the same location as the
data, and returns the result to the client.`},{heading:"coprocessor-overview",content:`This is only one scenario where using coprocessors can provide benefit. Following
are some analogies which may help to explain some of the benefits of coprocessors.`},{heading:"coprocessor-analogies",content:`**Triggers and Stored Procedure**\\
An Observer coprocessor is similar to a trigger in a RDBMS in that it executes
your code either before or after a specific event (such as a \`Get\` or \`Put\`)
occurs. An endpoint coprocessor is similar to a stored procedure in a RDBMS
because it allows you to perform custom computations on the data on the
RegionServer itself, rather than on the client.`},{heading:"coprocessor-analogies",content:`**MapReduce**\\
MapReduce operates on the principle of moving the computation to the location of
the data. Coprocessors operate on the same principal.`},{heading:"coprocessor-analogies",content:`**AOP**\\
If you are familiar with Aspect Oriented Programming (AOP), you can think of a coprocessor
as applying advice by intercepting a request and then running some custom code,
before passing the request on to its final destination (or even changing the destination).`},{heading:"coprocessor-implementation-overview",content:`Your class should implement one of the Coprocessor interfaces -
Coprocessor,
RegionObserver,
CoprocessorService - to name a few.`},{heading:"coprocessor-implementation-overview",content:`Load the coprocessor, either statically (from the configuration) or dynamically,
using HBase Shell. For more details see Loading Coprocessors.`},{heading:"coprocessor-implementation-overview",content:`Call the coprocessor from your client-side code. HBase handles the coprocessor
transparently.`},{heading:"coprocessor-implementation-overview",content:`The framework API is provided in the
coprocessor
package.`},{heading:"observer-coprocessors",content:"Observer coprocessors are triggered either before or after a specific event occurs.\nObservers that happen before an event use methods that start with a `pre` prefix,\nsuch as `prePut`. Observers that happen just after an event override methods that start\nwith a `post` prefix, such as `postPut`."},{heading:"use-cases-for-observer-coprocessors",content:"**Security**\\\nBefore performing a `Get` or `Put` operation, you can check for permission using\n`preGet` or `prePut` methods."},{heading:"use-cases-for-observer-coprocessors",content:"**Referential Integrity**\\\nHBase does not directly support the RDBMS concept of refential integrity, also known\nas foreign keys. You can use a coprocessor to enforce such integrity. For instance,\nif you have a business rule that every insert to the `users` table must be followed\nby a corresponding entry in the `user_daily_attendance` table, you could implement\na coprocessor to use the `prePut` method on `user` to insert a record into `user_daily_attendance`."},{heading:"use-cases-for-observer-coprocessors",content:`**Secondary Indexes**\\
You can use a coprocessor to maintain secondary indexes. For more information, see
SecondaryIndexing.`},{heading:"types-of-observer-coprocessor",content:"**RegionObserver**\\\nA RegionObserver coprocessor allows you to observe events on a region, such as `Get`\nand `Put` operations. See\nRegionObserver."},{heading:"types-of-observer-coprocessor",content:`**RegionServerObserver**\\
A RegionServerObserver allows you to observe events related to the RegionServer's
operation, such as starting, stopping, or performing merges, commits, or rollbacks.
See
RegionServerObserver.`},{heading:"types-of-observer-coprocessor",content:`**MasterObserver**\\
A MasterObserver allows you to observe events related to the HBase Master, such
as table creation, deletion, or schema modification. See
MasterObserver.`},{heading:"types-of-observer-coprocessor",content:`**WalObserver**\\
A WalObserver allows you to observe events related to writes to the Write-Ahead
Log (WAL). See
WALObserver.`},{heading:"types-of-observer-coprocessor",content:"Examples provides working examples of observer coprocessors."},{heading:"endpoint-coprocessor",content:`Endpoint processors allow you to perform computation at the location of the data.
See Coprocessor Analogy. An example is the need to calculate a running
average or summation for an entire table which spans hundreds of regions.`},{heading:"endpoint-coprocessor",content:`In contrast to observer coprocessors, where your code is run transparently, endpoint
coprocessors must be explicitly invoked using the
CoprocessorService()
method available in
AsyncTable.`},{heading:"endpoint-coprocessor",content:`The coprocessorService method in Table
has been deprecated.`},{heading:"endpoint-coprocessor",content:`In HBASE-21512
we reimplement the sync client based on the async client. The coprocessorService
method defined in \`Table\` interface directly references a method from protobuf's
\`BlockingInterface\`, which means we need to use a separate thread pool to execute
the method so we avoid blocking the async client(We want to avoid blocking calls in
our async implementation).`},{heading:"endpoint-coprocessor",content:"Since coprocessor is an advanced feature, we believe it is OK for coprocessor users to\ninstead switch over to use `AsyncTable`. There is a lightweight\ntoAsyncConnection\nmethod to get an `AsyncConnection` from `Connection` if needed."},{heading:"endpoint-coprocessor",content:`Starting with HBase 0.96, endpoint coprocessors are implemented using Google Protocol
Buffers (protobuf). For more details on protobuf, see Google's
Protocol Buffer Guide.
Endpoints Coprocessor written in version 0.94 are not compatible with version 0.96 or later.
See
HBASE-5448). To upgrade your
HBase cluster from 0.94 or earlier to 0.96 or later, you need to reimplement your
coprocessor.`},{heading:"endpoint-coprocessor",content:`In HBase 2.x, we made use of a shaded version of protobuf 3.x, but kept the
protobuf for coprocessors on 2.5.0. In HBase 3.0.0, we removed all dependencies on
non-shaded protobuf so you need to reimplement your coprocessor to make use of the
shaded protobuf version provided in hbase-thirdparty. Please see
the protobuf section for more details.`},{heading:"endpoint-coprocessor",content:`Coprocessor Endpoints should make no use of HBase internals and
only avail of public APIs; ideally a CPEP should depend on Interfaces
and data structures only. This is not always possible but beware
that doing so makes the Endpoint brittle, liable to breakage as HBase
internals evolve. HBase internal APIs annotated as private or evolving
do not have to respect semantic versioning rules or general java rules on
deprecation before removal. While generated protobuf files are
absent the hbase audience annotations — they are created by the
protobuf protoc tool which knows nothing of how HBase works —
they should be consided \`@InterfaceAudience.Private\` so are liable to
change.`},{heading:"endpoint-coprocessor",content:"Examples provides working examples of endpoint coprocessors."},{heading:"loading-coprocessors",content:`To make your coprocessor available to HBase, it must be *loaded*, either statically
(through the HBase configuration) or dynamically (using HBase Shell or the Java API).`},{heading:"static-loading",content:`Follow these steps to statically load your coprocessor. Keep in mind that you must
restart HBase to unload a coprocessor that has been loaded statically.`},{heading:"static-loading",content:"Define the Coprocessor in *hbase-site.xml*, with a `<property>` element with a `<name>`\nand a `<value>` sub-element. The `<name>` should be one of the following:"},{heading:"static-loading",content:"`hbase.coprocessor.region.classes` for RegionObservers and Endpoints."},{heading:"static-loading",content:"`hbase.coprocessor.wal.classes` for WALObservers."},{heading:"static-loading",content:"`hbase.coprocessor.master.classes` for MasterObservers."},{heading:"static-loading",content:"`<value>` must contain the fully-qualified class name of your coprocessor's implementation\nclass."},{heading:"static-loading",content:`For example to load a Coprocessor (implemented in class SumEndPoint.java) you have to create
following entry in RegionServer's 'hbase-site.xml' file (generally located under 'conf' directory):`},{heading:"static-loading",content:`If multiple classes are specified for loading, the class names must be comma-separated.
The framework attempts to load all the configured classes using the default class loader.
Therefore, the jar file must reside on the server-side HBase classpath.`},{heading:"static-loading",content:`Coprocessors which are loaded in this way will be active on all regions of all tables.
These are also called system Coprocessor.
The first listed Coprocessors will be assigned the priority \`Coprocessor.Priority.SYSTEM\`.
Each subsequent coprocessor in the list will have its priority value incremented by one (which
reduces its priority, because priorities have the natural sort order of Integers).`},{heading:"static-loading",content:`These priority values can be manually overriden in hbase-site.xml. This can be useful if you
want to guarantee that a coprocessor will execute after another. For example, in the following
configuration \`SumEndPoint\` would be guaranteed to go last, except in the case of a tie with
another coprocessor:`},{heading:"static-loading",content:`When calling out to registered observers, the framework executes their callbacks methods in the
sorted order of their priority.
Ties are broken arbitrarily.`},{heading:"static-loading",content:"Put your code on HBase's classpath. One easy way to do this is to drop the jar\n(containing you code and all the dependencies) into the `lib/` directory in the\nHBase installation."},{heading:"static-loading",content:"Restart HBase."},{heading:"static-unloading",content:"Delete the coprocessor's `<property>` element, including sub-elements, from `hbase-site.xml`."},{heading:"static-unloading",content:"Restart HBase."},{heading:"static-unloading",content:"Optionally, remove the coprocessor's JAR file from the classpath or HBase's `lib/`\ndirectory."},{heading:"dynamic-loading",content:`You can also load a coprocessor dynamically, without restarting HBase. This may seem
preferable to static loading, but dynamically loaded coprocessors are loaded on a
per-table basis, and are only available to the table for which they were loaded. For
this reason, dynamically loaded tables are sometimes called **Table Coprocessor**.`},{heading:"dynamic-loading",content:`In addition, dynamically loading a coprocessor acts as a schema change on the table,
and the table must be taken offline to load the coprocessor.`},{heading:"dynamic-loading",content:"There are three ways to dynamically load Coprocessor."},{heading:"dynamic-loading",content:"The below mentioned instructions makes the following assumptions:"},{heading:"dynamic-loading",content:"A JAR called `coprocessor.jar` contains the Coprocessor implementation along with all of its\ndependencies."},{heading:"dynamic-loading",content:"The JAR is available in HDFS in some location like\n`hdfs://NAMENODE:PORT/user/HADOOP_USER/coprocessor.jar`."},{heading:"using-hbase-shell",content:"Load the Coprocessor, using a command like the following:"},{heading:"using-hbase-shell",content:"The Coprocessor framework will try to read the class information from the coprocessor table\nattribute value.\nThe value contains four pieces of information which are separated by the pipe (`|`) character."},{heading:"using-hbase-shell",content:`File path: The jar file containing the Coprocessor implementation must be in a location where
all region servers can read it.
You could copy the file onto the local disk on each region server, but it is recommended to store
it in HDFS.
HBASE-14548 allows a directory containing the jars
or some wildcards to be specified, such as: \`hdfs://NAMENODE:PORT/user/HADOOP_USER/\` or
\`hdfs://NAMENODE:PORT/user/HADOOP_USER/*.jar\`. Please note that if a directory is specified,
all jar files(.jar) in the directory are added. It does not search for files in sub-directories.
Do not use a wildcard if you would like to specify a directory. This enhancement applies to the
usage via the JAVA API as well.`},{heading:"using-hbase-shell",content:"Class name: The full class name of the Coprocessor."},{heading:"using-hbase-shell",content:`Priority: An integer. The framework will determine the execution sequence of all configured
observers registered at the same hook using priorities. This field can be left blank. In that
case the framework will assign a default priority value.`},{heading:"using-hbase-shell",content:"Arguments (Optional): This field is passed to the Coprocessor implementation. This is optional."},{heading:"using-hbase-shell",content:"Verify that the coprocessor loaded:"},{heading:"using-hbase-shell",content:"The coprocessor should be listed in the `TABLE_ATTRIBUTES`."},{heading:"using-the-java-api-all-hbase-versions",content:"The following Java code shows how to use the `setValue()` method of `HTableDescriptor`\nto load a coprocessor on the `users` table."},{heading:"using-the-java-api-hbase-096-only",content:"In HBase 0.96 and newer, the `addCoprocessor()` method of `HTableDescriptor` provides\nan easier way to load a coprocessor dynamically."},{heading:"using-the-java-api-hbase-096-only",content:`There is no guarantee that the framework will load a given Coprocessor successfully. For example,
the shell command neither guarantees a jar file exists at a particular location nor verifies
whether the given class is actually contained in the jar file.`},{heading:"using-hbase-shell-1",content:"Alter the table to remove the coprocessor with `table_att_unset`."},{heading:"using-hbase-shell-1",content:"Alter the table to remove the coprocessor with `table_remove_coprocessor` introduced in\nHBASE-26524 by specifying an explicit\nclassname"},{heading:"using-the-java-api",content:"Reload the table definition without setting the value of the coprocessor either by\nusing `setValue()` or `addCoprocessor()` methods. This will remove any coprocessor\nattached to the table."},{heading:"using-the-java-api",content:"In HBase 0.96 and newer, you can instead use the `removeCoprocessor()` method of the\n`HTableDescriptor` class."},{heading:"cp-examples",content:"HBase ships examples for Observer Coprocessor."},{heading:"cp-examples",content:"A more detailed example is given below."},{heading:"cp-examples",content:"These examples assume a table called `users`, which has two column families `personalDet`\nand `salaryDet`, containing personal and salary details. Below is the graphical representation\nof the `users` table."},{heading:"cp-examples",content:"**Users Table**"},{heading:"cp-examples",content:"**personalDet**"},{heading:"cp-examples",content:"**salaryDet**"},{heading:"cp-examples",content:"**rowkey**"},{heading:"cp-examples",content:"**name**"},{heading:"cp-examples",content:"**lastname**"},{heading:"cp-examples",content:"**dob**"},{heading:"cp-examples",content:"**gross**"},{heading:"cp-examples",content:"**net**"},{heading:"cp-examples",content:"**allowances**"},{heading:"cp-examples",content:"admin"},{heading:"cp-examples",content:"Admin"},{heading:"cp-examples",content:"Admin"},{heading:"cp-examples",content:"cdickens"},{heading:"cp-examples",content:"Charles"},{heading:"cp-examples",content:"Dickens"},{heading:"cp-examples",content:"02/07/1812"},{heading:"cp-examples",content:"10000"},{heading:"cp-examples",content:"8000"},{heading:"cp-examples",content:"2000"},{heading:"cp-examples",content:"jverne"},{heading:"cp-examples",content:"Jules"},{heading:"cp-examples",content:"Verne"},{heading:"cp-examples",content:"02/08/1828"},{heading:"cp-examples",content:"12000"},{heading:"cp-examples",content:"9000"},{heading:"cp-examples",content:"3000"},{heading:"observer-example",content:"The following Observer coprocessor prevents the details of the user `admin` from being\nreturned in a `Get` or `Scan` of the `users` table."},{heading:"observer-example",content:`Write a class that implements the
RegionCoprocessor,
RegionObserver
class.`},{heading:"observer-example",content:"Override the `preGetOp()` method (the `preGet()` method is deprecated) to check\nwhether the client has queried for the rowkey with value `admin`. If so, return an\nempty result. Otherwise, process the request as normal."},{heading:"observer-example",content:"Put your code and dependencies in a JAR file."},{heading:"observer-example",content:"Place the JAR in HDFS where HBase can locate it."},{heading:"observer-example",content:"Load the Coprocessor."},{heading:"observer-example",content:"Write a simple program to test it."},{heading:"observer-example",content:"Following are the implementation of the above steps:"},{heading:"observer-example",content:"Overriding the `preGetOp()` will only work for `Get` operations. You also need to override\nthe `preScannerOpen()` method to filter the `admin` row from scan results."},{heading:"observer-example",content:"This method works but there is a *side effect*. If the client has used a filter in\nits scan, that filter will be replaced by this filter. Instead, you can explicitly\nremove any `admin` results from the scan:"},{heading:"endpoint-example",content:"Still using the `users` table, this example implements a coprocessor to calculate\nthe sum of all employee salaries, using an endpoint coprocessor."},{heading:"endpoint-example",content:"Create a '.proto' file defining your service."},{heading:"endpoint-example",content:"Execute the `protoc` command to generate the Java code from the above .proto' file."},{heading:"endpoint-example",content:"This will generate a class call `Sum.java`."},{heading:"endpoint-example",content:"Write a class that extends the generated service class, implement the `Coprocessor`\nand `CoprocessorService` classes, and override the service method."},{heading:"endpoint-example",content:`If you load a coprocessor from \`hbase-site.xml\` and then load the same coprocessor
again using HBase Shell, it will be loaded a second time. The same class will
exist twice, and the second instance will have a higher ID (and thus a lower priority).
The effect is that the duplicate coprocessor is effectively ignored.`},{heading:"endpoint-example",content:"Load the Coprocessor."},{heading:"endpoint-example",content:"Write a client code to call the Coprocessor."},{heading:"guidelines-for-deploying-a-coprocessor",content:`**Bundling Coprocessors**\\
You can bundle all classes for a coprocessor into a
single JAR on the RegionServer's classpath, for easy deployment. Otherwise,
place all dependencies on the RegionServer's classpath so that they can be
loaded during RegionServer start-up. The classpath for a RegionServer is set
in the RegionServer's \`hbase-env.sh\` file.`},{heading:"guidelines-for-deploying-a-coprocessor",content:`**Automating Deployment**\\
You can use a tool such as Puppet, Chef, or
Ansible to ship the JAR for the coprocessor to the required location on your
RegionServers' filesystems and restart each RegionServer, to automate
coprocessor deployment. Details for such set-ups are out of scope of this
document.`},{heading:"guidelines-for-deploying-a-coprocessor",content:`**Updating a Coprocessor**\\
Deploying a new version of a given coprocessor is not as simple as disabling it,
replacing the JAR, and re-enabling the coprocessor. This is because you cannot
reload a class in a JVM unless you delete all the current references to it.
Since the current JVM has reference to the existing coprocessor, you must restart
the JVM, by restarting the RegionServer, in order to replace it. This behavior
is not expected to change.`},{heading:"guidelines-for-deploying-a-coprocessor",content:`**Coprocessor Logging**\\
The Coprocessor framework does not provide an API for logging beyond standard Java
logging.`},{heading:"guidelines-for-deploying-a-coprocessor",content:"**Coprocessor Configuration**\\\nIf you do not want to load coprocessors from the HBase Shell, you can add their configuration\nproperties to `hbase-site.xml`. In Using HBase Shell, two arguments are\nset: `arg1=1,arg2=2`. These could have been added to `hbase-site.xml` as follows:"},{heading:"guidelines-for-deploying-a-coprocessor",content:"Then you can read the configuration using code like the following:"},{heading:"restricting-coprocessor-usage",content:"Restricting arbitrary user coprocessors can be a big concern in multitenant environments. HBase provides a continuum of options for ensuring only expected coprocessors are running:"},{heading:"restricting-coprocessor-usage",content:"`hbase.coprocessor.enabled`: Enables or disables all coprocessors. This will limit the functionality of HBase, as disabling all coprocessors will disable some security providers. An example coproccessor so affected is `org.apache.hadoop.hbase.security.access.AccessController`."},{heading:"restricting-coprocessor-usage",content:"`hbase.coprocessor.user.enabled`: Enables or disables loading coprocessors on tables (i.e. user coprocessors)."},{heading:"restricting-coprocessor-usage",content:"One can statically load coprocessors, and optionally tune their priorities, via the following tunables in `hbase-site.xml`:"},{heading:"restricting-coprocessor-usage",content:"`hbase.coprocessor.regionserver.classes`: A comma-separated list of coprocessors that are loaded by region servers"},{heading:"restricting-coprocessor-usage",content:"`hbase.coprocessor.region.classes`: A comma-separated list of RegionObserver and Endpoint coprocessors"},{heading:"restricting-coprocessor-usage",content:"`hbase.coprocessor.user.region.classes`: A comma-separated list of coprocessors that are loaded by all regions"},{heading:"restricting-coprocessor-usage",content:"`hbase.coprocessor.master.classes`: A comma-separated list of coprocessors that are loaded by the master (MasterObserver coprocessors)"},{heading:"restricting-coprocessor-usage",content:"`hbase.coprocessor.wal.classes`: A comma-separated list of WALObserver coprocessors to load"},{heading:"restricting-coprocessor-usage",content:"`hbase.coprocessor.abortonerror`: Whether to abort the daemon which has loaded the coprocessor if the coprocessor should error other than `IOError`. If this is set to false and an access controller coprocessor should have a fatal error the coprocessor will be circumvented, as such in secure installations this is advised to be `true`; however, one may override this on a per-table basis for user coprocessors, to ensure they do not abort their running region server and are instead unloaded on error."},{heading:"restricting-coprocessor-usage",content:"`hbase.coprocessor.region.whitelist.paths`: A comma separated list available for those loading `org.apache.hadoop.hbase.security.access.CoprocessorWhitelistMasterObserver` whereby one can use the following options to white-list paths from which coprocessors may be loaded."},{heading:"restricting-coprocessor-usage",content:"Coprocessors on the classpath are implicitly white-listed"},{heading:"restricting-coprocessor-usage",content:"`*` to wildcard all coprocessor paths"},{heading:"restricting-coprocessor-usage",content:"An entire filesystem (e.g. `hdfs://my-cluster/`)"},{heading:"restricting-coprocessor-usage",content:"A wildcard path to be evaluated by FilenameUtils.wildcardMatch"},{heading:"restricting-coprocessor-usage",content:"Note: Path can specify scheme or not (e.g. `file:///usr/hbase/lib/coprocessors` or for all filesystems `/usr/hbase/lib/coprocessors`)"}],headings:[{id:"coprocessor-overview",content:"Coprocessor Overview"},{id:"coprocessor-analogies",content:"Coprocessor Analogies"},{id:"coprocessor-implementation-overview",content:"Coprocessor Implementation Overview"},{id:"types-of-coprocessors",content:"Types of Coprocessors"},{id:"observer-coprocessors",content:"Observer Coprocessors"},{id:"use-cases-for-observer-coprocessors",content:"Use Cases for Observer Coprocessors"},{id:"types-of-observer-coprocessor",content:"Types of Observer Coprocessor"},{id:"endpoint-coprocessor",content:"Endpoint Coprocessor"},{id:"loading-coprocessors",content:"Loading Coprocessors"},{id:"static-loading",content:"Static Loading"},{id:"static-unloading",content:"Static Unloading"},{id:"dynamic-loading",content:"Dynamic Loading"},{id:"using-hbase-shell",content:"Using HBase Shell"},{id:"using-the-java-api-all-hbase-versions",content:"Using the Java API (all HBase versions)"},{id:"using-the-java-api-hbase-096-only",content:"Using the Java API (HBase 0.96+ only)"},{id:"dynamic-unloading",content:"Dynamic Unloading"},{id:"using-hbase-shell-1",content:"Using HBase Shell"},{id:"using-the-java-api",content:"Using the Java API"},{id:"cp-examples",content:"Examples"},{id:"observer-example",content:"Observer Example"},{id:"endpoint-example",content:"Endpoint Example"},{id:"guidelines-for-deploying-a-coprocessor",content:"Guidelines For Deploying A Coprocessor"},{id:"restricting-coprocessor-usage",content:"Restricting Coprocessor Usage"}]},d=[{depth:2,url:"#coprocessor-overview",title:s.jsx(s.Fragment,{children:"Coprocessor Overview"})},{depth:3,url:"#coprocessor-analogies",title:s.jsx(s.Fragment,{children:"Coprocessor Analogies"})},{depth:3,url:"#coprocessor-implementation-overview",title:s.jsx(s.Fragment,{children:"Coprocessor Implementation Overview"})},{depth:2,url:"#types-of-coprocessors",title:s.jsx(s.Fragment,{children:"Types of Coprocessors"})},{depth:3,url:"#observer-coprocessors",title:s.jsx(s.Fragment,{children:"Observer Coprocessors"})},{depth:4,url:"#use-cases-for-observer-coprocessors",title:s.jsx(s.Fragment,{children:"Use Cases for Observer Coprocessors"})},{depth:4,url:"#types-of-observer-coprocessor",title:s.jsx(s.Fragment,{children:"Types of Observer Coprocessor"})},{depth:3,url:"#endpoint-coprocessor",title:s.jsx(s.Fragment,{children:"Endpoint Coprocessor"})},{depth:2,url:"#loading-coprocessors",title:s.jsx(s.Fragment,{children:"Loading Coprocessors"})},{depth:3,url:"#static-loading",title:s.jsx(s.Fragment,{children:"Static Loading"})},{depth:3,url:"#static-unloading",title:s.jsx(s.Fragment,{children:"Static Unloading"})},{depth:3,url:"#dynamic-loading",title:s.jsx(s.Fragment,{children:"Dynamic Loading"})},{depth:4,url:"#using-hbase-shell",title:s.jsx(s.Fragment,{children:"Using HBase Shell"})},{depth:4,url:"#using-the-java-api-all-hbase-versions",title:s.jsx(s.Fragment,{children:"Using the Java API (all HBase versions)"})},{depth:4,url:"#using-the-java-api-hbase-096-only",title:s.jsx(s.Fragment,{children:"Using the Java API (HBase 0.96+ only)"})},{depth:3,url:"#dynamic-unloading",title:s.jsx(s.Fragment,{children:"Dynamic Unloading"})},{depth:4,url:"#using-hbase-shell-1",title:s.jsx(s.Fragment,{children:"Using HBase Shell"})},{depth:4,url:"#using-the-java-api",title:s.jsx(s.Fragment,{children:"Using the Java API"})},{depth:2,url:"#cp-examples",title:s.jsx(s.Fragment,{children:"Examples"})},{depth:3,url:"#observer-example",title:s.jsx(s.Fragment,{children:"Observer Example"})},{depth:3,url:"#endpoint-example",title:s.jsx(s.Fragment,{children:"Endpoint Example"})},{depth:2,url:"#guidelines-for-deploying-a-coprocessor",title:s.jsx(s.Fragment,{children:"Guidelines For Deploying A Coprocessor"})},{depth:2,url:"#restricting-coprocessor-usage",title:s.jsx(s.Fragment,{children:"Restricting Coprocessor Usage"})}];function r(i){const e={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Callout:n}=e;return n||a("Callout"),s.jsxs(s.Fragment,{children:[s.jsxs(e.p,{children:[`HBase Coprocessors are modeled after Google BigTable's coprocessor implementation
(`,s.jsx(e.a,{href:"http://research.google.com/people/jeff/SOCC2010-keynote-slides.pdf",children:"http://research.google.com/people/jeff/SOCC2010-keynote-slides.pdf"}),` pages 41-42.).
Efforts are ongoing to bridge gaps between HBase's
implementation and BigTable's architecture. For more information see
`,s.jsx(e.a,{href:"https://issues.apache.org/jira/browse/HBASE-4047",children:"HBASE-4047"}),"."]}),`
`,s.jsx(e.p,{children:`The information in this chapter is primarily sourced and heavily reused from the following
resources:`}),`
`,s.jsxs(e.ol,{children:[`
`,s.jsxs(e.li,{children:[`Mingjie Lai's blog post
`,s.jsx(e.a,{href:"https://blogs.apache.org/hbase/entry/coprocessor_introduction",children:"Coprocessor Introduction"}),"."]}),`
`,s.jsxs(e.li,{children:[`Gaurav Bhardwaj's blog post
`,s.jsx(e.a,{href:"http://www.3pillarglobal.com/insights/hbase-coprocessors",children:"The How To Of HBase Coprocessors"}),"."]}),`
`]}),`
`,s.jsxs(n,{type:"warn",title:"Use Coprocessors At Your Own Risk",children:[s.jsxs(e.p,{children:[`Coprocessors are an advanced feature of HBase and are intended to be used by system
developers only. Because coprocessor code runs directly on the RegionServer and has
direct access to your data, they introduce the risk of data corruption, man-in-the-middle
attacks, or other malicious data access. Currently, there is no mechanism to prevent
data corruption by coprocessors, though work is underway on
`,s.jsx(e.a,{href:"https://issues.apache.org/jira/browse/HBASE-4047",children:"HBASE-4047"}),"."]}),s.jsx(e.p,{children:`In addition, there is no resource isolation, so a well-intentioned but misbehaving
coprocessor can severely degrade cluster performance and stability.`})]}),`
`,s.jsx(e.h2,{id:"coprocessor-overview",children:"Coprocessor Overview"}),`
`,s.jsxs(e.p,{children:["In HBase, you fetch data using a ",s.jsx(e.code,{children:"Get"})," or ",s.jsx(e.code,{children:"Scan"}),`, whereas in an RDBMS you use a SQL
query. In order to fetch only the relevant data, you filter it using a HBase
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/filter/Filter.html",children:"Filter"}),`
, whereas in an RDBMS you use a `,s.jsx(e.code,{children:"WHERE"})," predicate."]}),`
`,s.jsx(e.p,{children:`After fetching the data, you perform computations on it. This paradigm works well
for "small data" with a few thousand rows and several columns. However, when you scale
to billions of rows and millions of columns, moving large amounts of data across your
network will create bottlenecks at the network layer, and the client needs to be powerful
enough and have enough memory to handle the large amounts of data and the computations.
In addition, the client code can grow large and complex.`}),`
`,s.jsx(e.p,{children:`In this scenario, coprocessors might make sense. You can put the business computation
code into a coprocessor which runs on the RegionServer, in the same location as the
data, and returns the result to the client.`}),`
`,s.jsx(e.p,{children:`This is only one scenario where using coprocessors can provide benefit. Following
are some analogies which may help to explain some of the benefits of coprocessors.`}),`
`,s.jsx(e.h3,{id:"coprocessor-analogies",children:"Coprocessor Analogies"}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"Triggers and Stored Procedure"}),s.jsx(e.br,{}),`
`,`An Observer coprocessor is similar to a trigger in a RDBMS in that it executes
your code either before or after a specific event (such as a `,s.jsx(e.code,{children:"Get"})," or ",s.jsx(e.code,{children:"Put"}),`)
occurs. An endpoint coprocessor is similar to a stored procedure in a RDBMS
because it allows you to perform custom computations on the data on the
RegionServer itself, rather than on the client.`]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"MapReduce"}),s.jsx(e.br,{}),`
`,`MapReduce operates on the principle of moving the computation to the location of
the data. Coprocessors operate on the same principal.`]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"AOP"}),s.jsx(e.br,{}),`
`,`If you are familiar with Aspect Oriented Programming (AOP), you can think of a coprocessor
as applying advice by intercepting a request and then running some custom code,
before passing the request on to its final destination (or even changing the destination).`]}),`
`,s.jsx(e.h3,{id:"coprocessor-implementation-overview",children:"Coprocessor Implementation Overview"}),`
`,s.jsxs(e.ol,{children:[`
`,s.jsxs(e.li,{children:[`Your class should implement one of the Coprocessor interfaces -
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/Coprocessor.html",children:"Coprocessor"}),`,
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html",children:"RegionObserver"}),`,
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/CoprocessorService.html",children:"CoprocessorService"})," - to name a few."]}),`
`,s.jsxs(e.li,{children:[`Load the coprocessor, either statically (from the configuration) or dynamically,
using HBase Shell. For more details see `,s.jsx(e.a,{href:"/docs/cp#loading-coprocessors",children:"Loading Coprocessors"}),"."]}),`
`,s.jsx(e.li,{children:`Call the coprocessor from your client-side code. HBase handles the coprocessor
transparently.`}),`
`]}),`
`,s.jsxs(e.p,{children:[`The framework API is provided in the
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/package-summary.html",children:"coprocessor"}),`
package.`]}),`
`,s.jsx(e.h2,{id:"types-of-coprocessors",children:"Types of Coprocessors"}),`
`,s.jsx(e.h3,{id:"observer-coprocessors",children:"Observer Coprocessors"}),`
`,s.jsxs(e.p,{children:[`Observer coprocessors are triggered either before or after a specific event occurs.
Observers that happen before an event use methods that start with a `,s.jsx(e.code,{children:"pre"}),` prefix,
such as `,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html#prePut(org.apache.hadoop.hbase.coprocessor.ObserverContext,org.apache.hadoop.hbase.client.Put,org.apache.hadoop.hbase.wal.WALEdit)",children:s.jsx(e.code,{children:"prePut"})}),`. Observers that happen just after an event override methods that start
with a `,s.jsx(e.code,{children:"post"})," prefix, such as ",s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html#postPut(org.apache.hadoop.hbase.coprocessor.ObserverContext,org.apache.hadoop.hbase.client.Put,org.apache.hadoop.hbase.wal.WALEdit)",children:s.jsx(e.code,{children:"postPut"})}),"."]}),`
`,s.jsx(e.h4,{id:"use-cases-for-observer-coprocessors",children:"Use Cases for Observer Coprocessors"}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"Security"}),s.jsx(e.br,{}),`
`,"Before performing a ",s.jsx(e.code,{children:"Get"})," or ",s.jsx(e.code,{children:"Put"}),` operation, you can check for permission using
`,s.jsx(e.code,{children:"preGet"})," or ",s.jsx(e.code,{children:"prePut"})," methods."]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"Referential Integrity"}),s.jsx(e.br,{}),`
`,`HBase does not directly support the RDBMS concept of refential integrity, also known
as foreign keys. You can use a coprocessor to enforce such integrity. For instance,
if you have a business rule that every insert to the `,s.jsx(e.code,{children:"users"}),` table must be followed
by a corresponding entry in the `,s.jsx(e.code,{children:"user_daily_attendance"}),` table, you could implement
a coprocessor to use the `,s.jsx(e.code,{children:"prePut"})," method on ",s.jsx(e.code,{children:"user"})," to insert a record into ",s.jsx(e.code,{children:"user_daily_attendance"}),"."]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"Secondary Indexes"}),s.jsx(e.br,{}),`
`,`You can use a coprocessor to maintain secondary indexes. For more information, see
`,s.jsx(e.a,{href:"https://cwiki.apache.org/confluence/display/HADOOP2/Hbase+SecondaryIndexing",children:"SecondaryIndexing"}),"."]}),`
`,s.jsx(e.h4,{id:"types-of-observer-coprocessor",children:"Types of Observer Coprocessor"}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"RegionObserver"}),s.jsx(e.br,{}),`
`,"A RegionObserver coprocessor allows you to observe events on a region, such as ",s.jsx(e.code,{children:"Get"}),`
and `,s.jsx(e.code,{children:"Put"}),` operations. See
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html",children:"RegionObserver"}),"."]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"RegionServerObserver"}),s.jsx(e.br,{}),`
`,`A RegionServerObserver allows you to observe events related to the RegionServer's
operation, such as starting, stopping, or performing merges, commits, or rollbacks.
See
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionServerObserver.html",children:"RegionServerObserver"}),"."]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"MasterObserver"}),s.jsx(e.br,{}),`
`,`A MasterObserver allows you to observe events related to the HBase Master, such
as table creation, deletion, or schema modification. See
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/MasterObserver.html",children:"MasterObserver"}),"."]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"WalObserver"}),s.jsx(e.br,{}),`
`,`A WalObserver allows you to observe events related to writes to the Write-Ahead
Log (WAL). See
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/WALObserver.html",children:"WALObserver"}),"."]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.a,{href:"/docs/cp#cp-examples",children:"Examples"})," provides working examples of observer coprocessors."]}),`
`,s.jsx(e.h3,{id:"endpoint-coprocessor",children:"Endpoint Coprocessor"}),`
`,s.jsxs(e.p,{children:[`Endpoint processors allow you to perform computation at the location of the data.
See `,s.jsx(e.a,{href:"/docs/cp#coprocessor-analogies",children:"Coprocessor Analogy"}),`. An example is the need to calculate a running
average or summation for an entire table which spans hundreds of regions.`]}),`
`,s.jsxs(e.p,{children:[`In contrast to observer coprocessors, where your code is run transparently, endpoint
coprocessors must be explicitly invoked using the
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/AsyncTable.html#coprocessorService(java.util.function.Function,org.apache.hadoop.hbase.client.ServiceCaller,byte%5B%5D)",children:"CoprocessorService()"}),`
method available in
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/AsyncTable.html",children:"AsyncTable"}),"."]}),`
`,s.jsxs(n,{type:"warn",title:"On using coprocessorService method with sync client",children:[s.jsxs(e.p,{children:["The coprocessorService method in ",s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html",children:"Table"}),`
has been deprecated.`]}),s.jsxs(e.p,{children:["In ",s.jsx(e.a,{href:"https://issues.apache.org/jira/browse/HBASE-21512",children:"HBASE-21512"}),`
we reimplement the sync client based on the async client. The coprocessorService
method defined in `,s.jsx(e.code,{children:"Table"}),` interface directly references a method from protobuf's
`,s.jsx(e.code,{children:"BlockingInterface"}),`, which means we need to use a separate thread pool to execute
the method so we avoid blocking the async client(We want to avoid blocking calls in
our async implementation).`]}),s.jsxs(e.p,{children:[`Since coprocessor is an advanced feature, we believe it is OK for coprocessor users to
instead switch over to use `,s.jsx(e.code,{children:"AsyncTable"}),`. There is a lightweight
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Connection.html#toAsyncConnection()",children:"toAsyncConnection"}),`
method to get an `,s.jsx(e.code,{children:"AsyncConnection"})," from ",s.jsx(e.code,{children:"Connection"})," if needed."]})]}),`
`,s.jsxs(e.p,{children:[`Starting with HBase 0.96, endpoint coprocessors are implemented using Google Protocol
Buffers (protobuf). For more details on protobuf, see Google's
`,s.jsx(e.a,{href:"https://developers.google.com/protocol-buffers/docs/proto",children:"Protocol Buffer Guide"}),`.
Endpoints Coprocessor written in version 0.94 are not compatible with version 0.96 or later.
See
`,s.jsx(e.a,{href:"https://issues.apache.org/jira/browse/HBASE-5448",children:"HBASE-5448"}),`). To upgrade your
HBase cluster from 0.94 or earlier to 0.96 or later, you need to reimplement your
coprocessor.`]}),`
`,s.jsxs(e.p,{children:[`In HBase 2.x, we made use of a shaded version of protobuf 3.x, but kept the
protobuf for coprocessors on 2.5.0. In HBase 3.0.0, we removed all dependencies on
non-shaded protobuf so you need to reimplement your coprocessor to make use of the
shaded protobuf version provided in hbase-thirdparty. Please see
the `,s.jsx(e.a,{href:"/docs/protobuf",children:"protobuf"})," section for more details."]}),`
`,s.jsxs(e.p,{children:[`Coprocessor Endpoints should make no use of HBase internals and
only avail of public APIs; ideally a CPEP should depend on Interfaces
and data structures only. This is not always possible but beware
that doing so makes the Endpoint brittle, liable to breakage as HBase
internals evolve. HBase internal APIs annotated as private or evolving
do not have to respect semantic versioning rules or general java rules on
deprecation before removal. While generated protobuf files are
absent the hbase audience annotations — they are created by the
protobuf protoc tool which knows nothing of how HBase works —
they should be consided `,s.jsx(e.code,{children:"@InterfaceAudience.Private"}),` so are liable to
change.`]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.a,{href:"/docs/cp#cp-examples",children:"Examples"})," provides working examples of endpoint coprocessors."]}),`
`,s.jsx(e.h2,{id:"loading-coprocessors",children:"Loading Coprocessors"}),`
`,s.jsxs(e.p,{children:["To make your coprocessor available to HBase, it must be ",s.jsx(e.em,{children:"loaded"}),`, either statically
(through the HBase configuration) or dynamically (using HBase Shell or the Java API).`]}),`
`,s.jsx(e.h3,{id:"static-loading",children:"Static Loading"}),`
`,s.jsx(e.p,{children:`Follow these steps to statically load your coprocessor. Keep in mind that you must
restart HBase to unload a coprocessor that has been loaded statically.`}),`
`,s.jsxs(e.ol,{children:[`
`,s.jsxs(e.li,{children:[`
`,s.jsxs(e.p,{children:["Define the Coprocessor in ",s.jsx(e.em,{children:"hbase-site.xml"}),", with a ",s.jsx(e.code,{children:"<property>"})," element with a ",s.jsx(e.code,{children:"<name>"}),`
and a `,s.jsx(e.code,{children:"<value>"})," sub-element. The ",s.jsx(e.code,{children:"<name>"})," should be one of the following:"]}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[`
`,s.jsxs(e.p,{children:[s.jsx(e.code,{children:"hbase.coprocessor.region.classes"})," for RegionObservers and Endpoints."]}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsxs(e.p,{children:[s.jsx(e.code,{children:"hbase.coprocessor.wal.classes"})," for WALObservers."]}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsxs(e.p,{children:[s.jsx(e.code,{children:"hbase.coprocessor.master.classes"})," for MasterObservers."]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.code,{children:"<value>"}),` must contain the fully-qualified class name of your coprocessor's implementation
class.`]}),`
`,s.jsx(e.p,{children:`For example to load a Coprocessor (implemented in class SumEndPoint.java) you have to create
following entry in RegionServer's 'hbase-site.xml' file (generally located under 'conf' directory):`}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.coprocessor.region.classes</"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.myname.hbase.coprocessor.endpoint.SumEndPoint</"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,s.jsx(e.p,{children:`If multiple classes are specified for loading, the class names must be comma-separated.
The framework attempts to load all the configured classes using the default class loader.
Therefore, the jar file must reside on the server-side HBase classpath.`}),`
`,s.jsxs(e.p,{children:[`Coprocessors which are loaded in this way will be active on all regions of all tables.
These are also called system Coprocessor.
The first listed Coprocessors will be assigned the priority `,s.jsx(e.code,{children:"Coprocessor.Priority.SYSTEM"}),`.
Each subsequent coprocessor in the list will have its priority value incremented by one (which
reduces its priority, because priorities have the natural sort order of Integers).`]}),`
`,s.jsxs(e.p,{children:[`These priority values can be manually overriden in hbase-site.xml. This can be useful if you
want to guarantee that a coprocessor will execute after another. For example, in the following
configuration `,s.jsx(e.code,{children:"SumEndPoint"}),` would be guaranteed to go last, except in the case of a tie with
another coprocessor:`]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.coprocessor.region.classes</"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.myname.hbase.coprocessor.endpoint.SumEndPoint|2147483647</"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`]}),`
`]}),`
`,s.jsx(e.p,{children:`When calling out to registered observers, the framework executes their callbacks methods in the
sorted order of their priority.
Ties are broken arbitrarily.`}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsxs(e.p,{children:[`Put your code on HBase's classpath. One easy way to do this is to drop the jar
(containing you code and all the dependencies) into the `,s.jsx(e.code,{children:"lib/"}),` directory in the
HBase installation.`]}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsx(e.p,{children:"Restart HBase."}),`
`]}),`
`]}),`
`,s.jsx(e.h3,{id:"static-unloading",children:"Static Unloading"}),`
`,s.jsxs(e.ol,{children:[`
`,s.jsxs(e.li,{children:["Delete the coprocessor's ",s.jsx(e.code,{children:"<property>"})," element, including sub-elements, from ",s.jsx(e.code,{children:"hbase-site.xml"}),"."]}),`
`,s.jsx(e.li,{children:"Restart HBase."}),`
`,s.jsxs(e.li,{children:["Optionally, remove the coprocessor's JAR file from the classpath or HBase's ",s.jsx(e.code,{children:"lib/"}),`
directory.`]}),`
`]}),`
`,s.jsx(e.h3,{id:"dynamic-loading",children:"Dynamic Loading"}),`
`,s.jsxs(e.p,{children:[`You can also load a coprocessor dynamically, without restarting HBase. This may seem
preferable to static loading, but dynamically loaded coprocessors are loaded on a
per-table basis, and are only available to the table for which they were loaded. For
this reason, dynamically loaded tables are sometimes called `,s.jsx(e.strong,{children:"Table Coprocessor"}),"."]}),`
`,s.jsx(e.p,{children:`In addition, dynamically loading a coprocessor acts as a schema change on the table,
and the table must be taken offline to load the coprocessor.`}),`
`,s.jsx(e.p,{children:"There are three ways to dynamically load Coprocessor."}),`
`,s.jsxs(n,{type:"info",title:"Assumptions",children:[s.jsx(e.p,{children:"The below mentioned instructions makes the following assumptions:"}),s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:["A JAR called ",s.jsx(e.code,{children:"coprocessor.jar"}),` contains the Coprocessor implementation along with all of its
dependencies.`]}),`
`,s.jsxs(e.li,{children:[`The JAR is available in HDFS in some location like
`,s.jsx(e.code,{children:"hdfs://NAMENODE:PORT/user/HADOOP_USER/coprocessor.jar"}),"."]}),`
`]})]}),`
`,s.jsx(e.h4,{id:"using-hbase-shell",children:"Using HBase Shell"}),`
`,s.jsxs(e.ol,{children:[`
`,s.jsxs(e.li,{children:[`
`,s.jsx(e.p,{children:"Load the Coprocessor, using a command like the following:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:s.jsx(e.code,{children:s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase alter "}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'users'"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"METHOD"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'table_att'"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'Coprocessor'"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=>"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'hdfs://NAMENODE:PORT/user/HADOOP_USER/coprocessor.jar|org.myname.hbase.Coprocessor.RegionObserverExample|1073741823|arg1=1,arg2=2'"})]})})})}),`
`,s.jsxs(e.p,{children:[`The Coprocessor framework will try to read the class information from the coprocessor table
attribute value.
The value contains four pieces of information which are separated by the pipe (`,s.jsx(e.code,{children:"|"}),") character."]}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[`File path: The jar file containing the Coprocessor implementation must be in a location where
all region servers can read it.
You could copy the file onto the local disk on each region server, but it is recommended to store
it in HDFS.
`,s.jsx(e.a,{href:"https://issues.apache.org/jira/browse/HBASE-14548",children:"HBASE-14548"}),` allows a directory containing the jars
or some wildcards to be specified, such as: `,s.jsx(e.code,{children:"hdfs://NAMENODE:PORT/user/HADOOP_USER/"}),` or
`,s.jsx(e.code,{children:"hdfs://NAMENODE:PORT/user/HADOOP_USER/*.jar"}),`. Please note that if a directory is specified,
all jar files(.jar) in the directory are added. It does not search for files in sub-directories.
Do not use a wildcard if you would like to specify a directory. This enhancement applies to the
usage via the JAVA API as well.`]}),`
`,s.jsx(e.li,{children:"Class name: The full class name of the Coprocessor."}),`
`,s.jsx(e.li,{children:`Priority: An integer. The framework will determine the execution sequence of all configured
observers registered at the same hook using priorities. This field can be left blank. In that
case the framework will assign a default priority value.`}),`
`,s.jsx(e.li,{children:"Arguments (Optional): This field is passed to the Coprocessor implementation. This is optional."}),`
`]}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsx(e.p,{children:"Verify that the coprocessor loaded:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:s.jsx(e.code,{children:s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"04"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" describe "}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'users'"})]})})})}),`
`,s.jsxs(e.p,{children:["The coprocessor should be listed in the ",s.jsx(e.code,{children:"TABLE_ATTRIBUTES"}),"."]}),`
`]}),`
`]}),`
`,s.jsx(e.h4,{id:"using-the-java-api-all-hbase-versions",children:"Using the Java API (all HBase versions)"}),`
`,s.jsxs(e.p,{children:["The following Java code shows how to use the ",s.jsx(e.code,{children:"setValue()"})," method of ",s.jsx(e.code,{children:"HTableDescriptor"}),`
to load a coprocessor on the `,s.jsx(e.code,{children:"users"})," table."]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TableName tableName "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TableName."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"valueOf"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"users"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"String path "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "hdfs://<namenode>:<port>/user/<hadoop-user>/coprocessor.jar"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Configuration conf "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBaseConfiguration."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Connection connection "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ConnectionFactory."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createConnection"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(conf);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Admin admin "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" connection."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAdmin"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HTableDescriptor hTableDescriptor "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HTableDescriptor"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HColumnDescriptor columnFamily1 "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HColumnDescriptor"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"personalDet"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"columnFamily1."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setMaxVersions"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hTableDescriptor."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addFamily"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(columnFamily1);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HColumnDescriptor columnFamily2 "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HColumnDescriptor"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"salaryDet"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"columnFamily2."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setMaxVersions"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hTableDescriptor."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addFamily"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(columnFamily2);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hTableDescriptor."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setValue"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"COPROCESSOR$1"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", path "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "|"'})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" RegionObserverExample.class."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getCanonicalName"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "|"'})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Coprocessor.PRIORITY_USER);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"admin."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"modifyTable"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName, hTableDescriptor);"})]})]})})}),`
`,s.jsx(e.h4,{id:"using-the-java-api-hbase-096-only",children:"Using the Java API (HBase 0.96+ only)"}),`
`,s.jsxs(e.p,{children:["In HBase 0.96 and newer, the ",s.jsx(e.code,{children:"addCoprocessor()"})," method of ",s.jsx(e.code,{children:"HTableDescriptor"}),` provides
an easier way to load a coprocessor dynamically.`]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TableName tableName "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TableName."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"valueOf"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"users"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Path path "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Path"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"hdfs://<namenode>:<port>/user/<hadoop-user>/coprocessor.jar"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Configuration conf "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBaseConfiguration."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Connection connection "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ConnectionFactory."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createConnection"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(conf);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Admin admin "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" connection."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAdmin"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HTableDescriptor hTableDescriptor "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HTableDescriptor"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HColumnDescriptor columnFamily1 "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HColumnDescriptor"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"personalDet"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"columnFamily1."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setMaxVersions"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hTableDescriptor."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addFamily"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(columnFamily1);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HColumnDescriptor columnFamily2 "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HColumnDescriptor"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"salaryDet"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"columnFamily2."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setMaxVersions"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hTableDescriptor."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addFamily"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(columnFamily2);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hTableDescriptor."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addCoprocessor"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(RegionObserverExample.class."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getCanonicalName"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(), path,"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Coprocessor.PRIORITY_USER, "}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"null"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"admin."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"modifyTable"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName, hTableDescriptor);"})]})]})})}),`
`,s.jsx(n,{type:"warn",children:s.jsx(e.p,{children:`There is no guarantee that the framework will load a given Coprocessor successfully. For example,
the shell command neither guarantees a jar file exists at a particular location nor verifies
whether the given class is actually contained in the jar file.`})}),`
`,s.jsx(e.h3,{id:"dynamic-unloading",children:"Dynamic Unloading"}),`
`,s.jsx(e.h4,{id:"using-hbase-shell-1",children:"Using HBase Shell"}),`
`,s.jsxs(e.ol,{children:[`
`,s.jsxs(e.li,{children:[`
`,s.jsxs(e.p,{children:["Alter the table to remove the coprocessor with ",s.jsx(e.code,{children:"table_att_unset"}),"."]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:s.jsx(e.code,{children:s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" alter "}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'users'"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"METHOD"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'table_att_unset'"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"NAME"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'coprocessor$1'"})]})})})}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsxs(e.p,{children:["Alter the table to remove the coprocessor with ",s.jsx(e.code,{children:"table_remove_coprocessor"}),` introduced in
`,s.jsx(e.a,{href:"https://issues.apache.org/jira/browse/HBASE-26524",children:"HBASE-26524"}),` by specifying an explicit
classname`]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" alter "}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'users'"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"METHOD"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'table_remove_coprocessor'"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"CLASSNAME"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => \\"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"    'org.myname.hbase.Coprocessor.RegionObserverExample'"})})]})})}),`
`]}),`
`]}),`
`,s.jsx(e.h4,{id:"using-the-java-api",children:"Using the Java API"}),`
`,s.jsxs(e.p,{children:[`Reload the table definition without setting the value of the coprocessor either by
using `,s.jsx(e.code,{children:"setValue()"})," or ",s.jsx(e.code,{children:"addCoprocessor()"}),` methods. This will remove any coprocessor
attached to the table.`]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TableName tableName "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TableName."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"valueOf"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"users"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"String path "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "hdfs://<namenode>:<port>/user/<hadoop-user>/coprocessor.jar"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Configuration conf "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBaseConfiguration."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Connection connection "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ConnectionFactory."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createConnection"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(conf);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Admin admin "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" connection."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAdmin"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HTableDescriptor hTableDescriptor "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HTableDescriptor"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HColumnDescriptor columnFamily1 "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HColumnDescriptor"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"personalDet"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"columnFamily1."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setMaxVersions"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hTableDescriptor."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addFamily"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(columnFamily1);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HColumnDescriptor columnFamily2 "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HColumnDescriptor"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"salaryDet"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"columnFamily2."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setMaxVersions"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hTableDescriptor."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addFamily"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(columnFamily2);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"admin."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"modifyTable"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName, hTableDescriptor);"})]})]})})}),`
`,s.jsxs(e.p,{children:["In HBase 0.96 and newer, you can instead use the ",s.jsx(e.code,{children:"removeCoprocessor()"}),` method of the
`,s.jsx(e.code,{children:"HTableDescriptor"})," class."]}),`
`,s.jsx(e.h2,{id:"cp-examples",children:"Examples"}),`
`,s.jsx(e.p,{children:"HBase ships examples for Observer Coprocessor."}),`
`,s.jsx(e.p,{children:"A more detailed example is given below."}),`
`,s.jsxs(e.p,{children:["These examples assume a table called ",s.jsx(e.code,{children:"users"}),", which has two column families ",s.jsx(e.code,{children:"personalDet"}),`
and `,s.jsx(e.code,{children:"salaryDet"}),`, containing personal and salary details. Below is the graphical representation
of the `,s.jsx(e.code,{children:"users"})," table."]}),`
`,s.jsx(e.p,{children:s.jsx(e.strong,{children:"Users Table"})}),`
`,s.jsxs(e.table,{children:[s.jsx(e.thead,{children:s.jsxs(e.tr,{children:[s.jsx(e.th,{}),s.jsx(e.th,{children:s.jsx(e.strong,{children:"personalDet"})}),s.jsx(e.th,{}),s.jsx(e.th,{}),s.jsx(e.th,{children:s.jsx(e.strong,{children:"salaryDet"})}),s.jsx(e.th,{}),s.jsx(e.th,{})]})}),s.jsxs(e.tbody,{children:[s.jsxs(e.tr,{children:[s.jsx(e.td,{children:s.jsx(e.strong,{children:"rowkey"})}),s.jsx(e.td,{children:s.jsx(e.strong,{children:"name"})}),s.jsx(e.td,{children:s.jsx(e.strong,{children:"lastname"})}),s.jsx(e.td,{children:s.jsx(e.strong,{children:"dob"})}),s.jsx(e.td,{children:s.jsx(e.strong,{children:"gross"})}),s.jsx(e.td,{children:s.jsx(e.strong,{children:"net"})}),s.jsx(e.td,{children:s.jsx(e.strong,{children:"allowances"})})]}),s.jsxs(e.tr,{children:[s.jsx(e.td,{children:"admin"}),s.jsx(e.td,{children:"Admin"}),s.jsx(e.td,{children:"Admin"}),s.jsx(e.td,{}),s.jsx(e.td,{}),s.jsx(e.td,{}),s.jsx(e.td,{})]}),s.jsxs(e.tr,{children:[s.jsx(e.td,{children:"cdickens"}),s.jsx(e.td,{children:"Charles"}),s.jsx(e.td,{children:"Dickens"}),s.jsx(e.td,{children:"02/07/1812"}),s.jsx(e.td,{children:"10000"}),s.jsx(e.td,{children:"8000"}),s.jsx(e.td,{children:"2000"})]}),s.jsxs(e.tr,{children:[s.jsx(e.td,{children:"jverne"}),s.jsx(e.td,{children:"Jules"}),s.jsx(e.td,{children:"Verne"}),s.jsx(e.td,{children:"02/08/1828"}),s.jsx(e.td,{children:"12000"}),s.jsx(e.td,{children:"9000"}),s.jsx(e.td,{children:"3000"})]})]})]}),`
`,s.jsx(e.h3,{id:"observer-example",children:"Observer Example"}),`
`,s.jsxs(e.p,{children:["The following Observer coprocessor prevents the details of the user ",s.jsx(e.code,{children:"admin"}),` from being
returned in a `,s.jsx(e.code,{children:"Get"})," or ",s.jsx(e.code,{children:"Scan"})," of the ",s.jsx(e.code,{children:"users"})," table."]}),`
`,s.jsxs(e.ol,{children:[`
`,s.jsxs(e.li,{children:[`Write a class that implements the
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionCoprocessor.html",children:"RegionCoprocessor"}),`,
`,s.jsx(e.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/coprocessor/RegionObserver.html",children:"RegionObserver"}),`
class.`]}),`
`,s.jsxs(e.li,{children:["Override the ",s.jsx(e.code,{children:"preGetOp()"})," method (the ",s.jsx(e.code,{children:"preGet()"}),` method is deprecated) to check
whether the client has queried for the rowkey with value `,s.jsx(e.code,{children:"admin"}),`. If so, return an
empty result. Otherwise, process the request as normal.`]}),`
`,s.jsx(e.li,{children:"Put your code and dependencies in a JAR file."}),`
`,s.jsx(e.li,{children:"Place the JAR in HDFS where HBase can locate it."}),`
`,s.jsx(e.li,{children:"Load the Coprocessor."}),`
`,s.jsx(e.li,{children:"Write a simple program to test it."}),`
`]}),`
`,s.jsx(e.p,{children:"Following are the implementation of the above steps:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RegionObserverExample"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" implements"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RegionCoprocessor"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"RegionObserver"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] ADMIN "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"admin"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] COLUMN_FAMILY "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"details"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] COLUMN "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Admin_det"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] VALUE "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"You can't see Admin details"`}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Override"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    public"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Optional<"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"RegionObserver"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getRegionObserver"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      return"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Optional."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"of"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"this"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Override"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    public"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" preGetOp"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ObserverContext<"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"RegionCoprocessorEnvironment"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"e"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Get "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"get"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" List<"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Cell"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"results"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    throws"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException {"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        if"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"equals"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(get."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getRow"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(),ADMIN)) {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            Cell c "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" CellUtil."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createCell"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(get."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getRow"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(),COLUMN_FAMILY, COLUMN,"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            System."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"currentTimeMillis"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(), ("}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"byte"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"4"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", VALUE);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            results."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(c);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            e."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bypass"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(e.p,{children:["Overriding the ",s.jsx(e.code,{children:"preGetOp()"})," will only work for ",s.jsx(e.code,{children:"Get"}),` operations. You also need to override
the `,s.jsx(e.code,{children:"preScannerOpen()"})," method to filter the ",s.jsx(e.code,{children:"admin"})," row from scan results."]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"@"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Override"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" RegionScanner "}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"preScannerOpen"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ObserverContext"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"RegionCoprocessorEnvironment"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" e, "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Scan scan,"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" RegionScanner s) throws IOException {"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Filter filter "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RowFilter"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CompareOp.NOT_EQUAL, "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BinaryComparator"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ADMIN));"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    scan."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setFilter"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(filter);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" s;"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(e.p,{children:["This method works but there is a ",s.jsx(e.em,{children:"side effect"}),`. If the client has used a filter in
its scan, that filter will be replaced by this filter. Instead, you can explicitly
remove any `,s.jsx(e.code,{children:"admin"})," results from the scan:"]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"@"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Override"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" boolean"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" postScannerNext"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ObserverContext"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"RegionCoprocessorEnvironment"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" e, "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" InternalScanner s,"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" List"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Result"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" results, "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" int"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" limit, "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" boolean"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" hasMore) throws IOException {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        Result result "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Iterator<"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Result"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> iterator "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" results."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"iterator"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    while"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (iterator."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hasNext"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    result "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" iterator."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"next"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        if"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"equals"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(result."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getRow"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(), ROWKEY)) {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            iterator."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"remove"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            break"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" hasMore;"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsx(e.h3,{id:"endpoint-example",children:"Endpoint Example"}),`
`,s.jsxs(e.p,{children:["Still using the ",s.jsx(e.code,{children:"users"}),` table, this example implements a coprocessor to calculate
the sum of all employee salaries, using an endpoint coprocessor.`]}),`
`,s.jsxs(e.ol,{children:[`
`,s.jsxs(e.li,{children:[`
`,s.jsx(e.p,{children:"Create a '.proto' file defining your service."}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"option"}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" java_package"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "org.myname.hbase.coprocessor.autogenerated"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"option"}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" java_outer_classname"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Sum"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"option"}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" java_generic_services"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"option"}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" java_generate_equals_and_hash"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"option"}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" optimize_for"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" SPEED"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"message"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SumRequest"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    required"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" string"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" family "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    required"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" string"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" column "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"message"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SumResponse"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"required"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" int64"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" sum "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ["}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"default"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"];"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"service"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SumService"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"rpc"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getSum"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SumRequest"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    returns"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SumResponse"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsxs(e.p,{children:["Execute the ",s.jsx(e.code,{children:"protoc"})," command to generate the Java code from the above .proto' file."]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mkdir"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" src"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" protoc"}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --java_out=src"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./sum.proto"})]})]})})}),`
`,s.jsxs(e.p,{children:["This will generate a class call ",s.jsx(e.code,{children:"Sum.java"}),"."]}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsxs(e.p,{children:["Write a class that extends the generated service class, implement the ",s.jsx(e.code,{children:"Coprocessor"}),`
and `,s.jsx(e.code,{children:"CoprocessorService"})," classes, and override the service method."]}),`
`,s.jsx(n,{type:"warn",children:s.jsxs(e.p,{children:["If you load a coprocessor from ",s.jsx(e.code,{children:"hbase-site.xml"}),` and then load the same coprocessor
again using HBase Shell, it will be loaded a second time. The same class will
exist twice, and the second instance will have a higher ID (and thus a lower priority).
The effect is that the duplicate coprocessor is effectively ignored.`]})}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SumEndPoint"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" extends"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Sum.SumService"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" implements"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Coprocessor"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CoprocessorService"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" RegionCoprocessorEnvironment env;"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Override"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    public"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Service "}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getService"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        return"}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" this"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Override"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    public"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" start"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CoprocessorEnvironment "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"env"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        if"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (env "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"instanceof"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" RegionCoprocessorEnvironment) {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"            this"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".env "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (RegionCoprocessorEnvironment)env;"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        } "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"else"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            throw"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" CoprocessorException"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Must be loaded on a table region!"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Override"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    public"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" stop"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CoprocessorEnvironment "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"env"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException {"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // do nothing"})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Override"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    public"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getSum"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(RpcController "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"controller"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Sum.SumRequest "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"request"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", RpcCallback<"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Sum"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SumResponse"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"done"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        Scan scan "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Scan"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        scan."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addFamily"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(request."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getFamily"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()));"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        scan."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addColumn"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(request."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getFamily"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()), Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(request."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getColumn"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()));"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        Sum.SumResponse response "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        InternalScanner scanner "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        try"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            scanner "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" env."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getRegion"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getScanner"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(scan);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            List<"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Cell"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> results "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ArrayList<>();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            boolean"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" hasMore "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" false"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            long"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" sum "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0L"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            do"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                hasMore "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" scanner."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"next"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(results);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                for"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Cell cell "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" results) {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                    sum "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" sum "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toLong"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CellUtil."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cloneValue"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(cell));"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                }"})}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                results."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"clear"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            } "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"while"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (hasMore);"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            response "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Sum.SumResponse."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"newBuilder"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setSum"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(sum)."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"build"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        } "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"catch"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (IOException "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"ioe"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ResponseConverter."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setControllerException"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(controller, ioe);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        } "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"finally"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            if"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (scanner "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!="}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                try"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                    scanner."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"close"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                } "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"catch"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (IOException "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"ignored"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {}"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            }"})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        done."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"run"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(response);"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Configuration conf "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBaseConfiguration."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Connection connection "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ConnectionFactory."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createConnection"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(conf);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TableName tableName "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TableName."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"valueOf"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"users"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Table table "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" connection."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getTable"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName);"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Sum.SumRequest request "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Sum.SumRequest."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"newBuilder"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setFamily"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"salaryDet"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setColumn"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gross"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"build"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"try"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Map<"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"byte"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[], "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Long"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> results "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"coprocessorService"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        Sum.SumService.class,"})}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"        null"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",  "}),s.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/* start key */"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"        null"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",  "}),s.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/* end   key */"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        new"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Batch.Call<"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Sum"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SumService"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Long"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">() {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            @"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Override"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            public"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Long "}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"call"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Sum.SumService "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"aggregate"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                BlockingRpcCallback<"}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Sum"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SumResponse"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> rpcCallback "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" BlockingRpcCallback<>();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                aggregate."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getSum"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"null"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", request, rpcCallback);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                Sum.SumResponse response "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" rpcCallback."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                return"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" response."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hasSum"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"?"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" response."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getSum"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0L"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            }"})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    );"})}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    for"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Long sum "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" results."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"values"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        System.out."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"println"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Sum = "'}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" sum);"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"} "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"catch"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (ServiceException "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"e"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    e."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"printStackTrace"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"} "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"catch"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Throwable "}),s.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"e"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    e."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"printStackTrace"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsx(e.p,{children:"Load the Coprocessor."}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsx(e.p,{children:"Write a client code to call the Coprocessor."}),`
`]}),`
`]}),`
`,s.jsx(e.h2,{id:"guidelines-for-deploying-a-coprocessor",children:"Guidelines For Deploying A Coprocessor"}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"Bundling Coprocessors"}),s.jsx(e.br,{}),`
`,`You can bundle all classes for a coprocessor into a
single JAR on the RegionServer's classpath, for easy deployment. Otherwise,
place all dependencies on the RegionServer's classpath so that they can be
loaded during RegionServer start-up. The classpath for a RegionServer is set
in the RegionServer's `,s.jsx(e.code,{children:"hbase-env.sh"})," file."]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"Automating Deployment"}),s.jsx(e.br,{}),`
`,`You can use a tool such as Puppet, Chef, or
Ansible to ship the JAR for the coprocessor to the required location on your
RegionServers' filesystems and restart each RegionServer, to automate
coprocessor deployment. Details for such set-ups are out of scope of this
document.`]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"Updating a Coprocessor"}),s.jsx(e.br,{}),`
`,`Deploying a new version of a given coprocessor is not as simple as disabling it,
replacing the JAR, and re-enabling the coprocessor. This is because you cannot
reload a class in a JVM unless you delete all the current references to it.
Since the current JVM has reference to the existing coprocessor, you must restart
the JVM, by restarting the RegionServer, in order to replace it. This behavior
is not expected to change.`]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"Coprocessor Logging"}),s.jsx(e.br,{}),`
`,`The Coprocessor framework does not provide an API for logging beyond standard Java
logging.`]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"Coprocessor Configuration"}),s.jsx(e.br,{}),`
`,`If you do not want to load coprocessors from the HBase Shell, you can add their configuration
properties to `,s.jsx(e.code,{children:"hbase-site.xml"}),". In ",s.jsx(e.a,{href:"/docs/cp#using-hbase-shell",children:"Using HBase Shell"}),`, two arguments are
set: `,s.jsx(e.code,{children:"arg1=1,arg2=2"}),". These could have been added to ",s.jsx(e.code,{children:"hbase-site.xml"})," as follows:"]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">arg1</"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">1</"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">arg2</"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">2</"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),s.jsx(e.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,s.jsx(e.p,{children:"Then you can read the configuration using code like the following:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Configuration conf "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBaseConfiguration."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Connection connection "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ConnectionFactory."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createConnection"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(conf);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TableName tableName "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TableName."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"valueOf"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"users"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Table table "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" connection."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getTable"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName);"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Get get "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Get"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"admin"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Result result "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(get);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"for"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Cell c "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" result."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"rawCells"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    System.out."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"println"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CellUtil."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cloneRow"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(c))"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        +"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "==> "'}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CellUtil."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cloneFamily"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(c))"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        +"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "{"'}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CellUtil."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cloneQualifier"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(c))"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        +"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' ":"'}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toLong"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CellUtil."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cloneValue"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(c)) "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "}"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Scan scan "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Scan"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"ResultScanner scanner "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getScanner"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(scan);"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"for"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Result res "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" scanner) {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    for"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Cell c "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" res."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"rawCells"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        System.out."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"println"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CellUtil."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cloneRow"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(c))"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        +"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' " ==> "'}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CellUtil."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cloneFamily"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(c))"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        +"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' " {"'}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CellUtil."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cloneQualifier"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(c))"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        +"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' ":"'}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toLong"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CellUtil."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cloneValue"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(c))"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        +"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "}"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsx(e.h2,{id:"restricting-coprocessor-usage",children:"Restricting Coprocessor Usage"}),`
`,s.jsx(e.p,{children:"Restricting arbitrary user coprocessors can be a big concern in multitenant environments. HBase provides a continuum of options for ensuring only expected coprocessors are running:"}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"hbase.coprocessor.enabled"}),": Enables or disables all coprocessors. This will limit the functionality of HBase, as disabling all coprocessors will disable some security providers. An example coproccessor so affected is ",s.jsx(e.code,{children:"org.apache.hadoop.hbase.security.access.AccessController"}),".",`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"hbase.coprocessor.user.enabled"}),": Enables or disables loading coprocessors on tables (i.e. user coprocessors)."]}),`
`,s.jsxs(e.li,{children:["One can statically load coprocessors, and optionally tune their priorities, via the following tunables in ",s.jsx(e.code,{children:"hbase-site.xml"}),":",`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"hbase.coprocessor.regionserver.classes"}),": A comma-separated list of coprocessors that are loaded by region servers"]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"hbase.coprocessor.region.classes"}),": A comma-separated list of RegionObserver and Endpoint coprocessors"]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"hbase.coprocessor.user.region.classes"}),": A comma-separated list of coprocessors that are loaded by all regions"]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"hbase.coprocessor.master.classes"}),": A comma-separated list of coprocessors that are loaded by the master (MasterObserver coprocessors)"]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"hbase.coprocessor.wal.classes"}),": A comma-separated list of WALObserver coprocessors to load"]}),`
`]}),`
`]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"hbase.coprocessor.abortonerror"}),": Whether to abort the daemon which has loaded the coprocessor if the coprocessor should error other than ",s.jsx(e.code,{children:"IOError"}),". If this is set to false and an access controller coprocessor should have a fatal error the coprocessor will be circumvented, as such in secure installations this is advised to be ",s.jsx(e.code,{children:"true"}),"; however, one may override this on a per-table basis for user coprocessors, to ensure they do not abort their running region server and are instead unloaded on error."]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"hbase.coprocessor.region.whitelist.paths"}),": A comma separated list available for those loading ",s.jsx(e.code,{children:"org.apache.hadoop.hbase.security.access.CoprocessorWhitelistMasterObserver"})," whereby one can use the following options to white-list paths from which coprocessors may be loaded.",`
`,s.jsxs(e.ul,{children:[`
`,s.jsx(e.li,{children:"Coprocessors on the classpath are implicitly white-listed"}),`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"*"})," to wildcard all coprocessor paths"]}),`
`,s.jsxs(e.li,{children:["An entire filesystem (e.g. ",s.jsx(e.code,{children:"hdfs://my-cluster/"}),")"]}),`
`,s.jsxs(e.li,{children:["A wildcard path to be evaluated by ",s.jsx(e.a,{href:"https://commons.apache.org/proper/commons-io/javadocs/api-release/org/apache/commons/io/FilenameUtils.html",children:"FilenameUtils.wildcardMatch"})]}),`
`,s.jsxs(e.li,{children:["Note: Path can specify scheme or not (e.g. ",s.jsx(e.code,{children:"file:///usr/hbase/lib/coprocessors"})," or for all filesystems ",s.jsx(e.code,{children:"/usr/hbase/lib/coprocessors"}),")"]}),`
`]}),`
`]}),`
`]}),`
`]}),`
`]})]})}function p(i={}){const{wrapper:e}=i.components||{};return e?s.jsx(e,{...i,children:s.jsx(r,{...i})}):r(i)}function a(i,e){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{h as _markdown,p as default,o as extractedReferences,t as frontmatter,c as structuredData,d as toc};
