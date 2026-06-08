import{j as e}from"./chunk-QUQL4437-Bywy9pC_.js";let o=`Lars Hofhansl wrote a great [blog post](http://hadoop-hbase.blogspot.com/2013/01/hbase-region-server-memory-sizing.html) about RegionServer memory sizing. The upshot is that you probably need more memory than you think you need. He goes into the impact of region size, memstore size, HDFS replication factor, and other things to check.

> Personally I would place the maximum disk space per machine that can be served exclusively with HBase around 6T, unless you have a very read-heavy workload. In that case the Java heap should be 32GB (20G regions, 128M memstores, the rest defaults).
>
> — Lars Hofhansl [http://hadoop-hbase.blogspot.com/2013/01/hbase-region-server-memory-sizing.html](http://hadoop-hbase.blogspot.com/2013/01/hbase-region-server-memory-sizing.html)

## On the number of column families

HBase currently does not do well with anything above two or three column families so keep the number of column families in your schema low. Currently, flushing is done on a per Region basis so if one column family is carrying the bulk of the data bringing on flushes, the adjacent families will also be flushed even though the amount of data they carry is small. When many column families exist the flushing interaction can make for a bunch of needless i/o (To be addressed by changing flushing to work on a per column family basis). In addition, compactions triggered at table/region level will happen per store too.

Try to make do with one column family if you can in your schemas. Only introduce a second and third column family in the case where data access is usually column scoped; i.e. you query one column family or the other but usually not both at the one time.

### Cardinality of ColumnFamilies

Where multiple ColumnFamilies exist in a single table, be aware of the cardinality (i.e., number of rows). If ColumnFamilyA has 1 million rows and ColumnFamilyB has 1 billion rows, ColumnFamilyA's data will likely be spread across many, many regions (and RegionServers). This makes mass scans for ColumnFamilyA less efficient.

## Rowkey Design

### Hotspotting

Rows in HBase are sorted lexicographically by row key. This design optimizes for scans, allowing you to store related rows, or rows that will be read together, near each other. However, poorly designed row keys are a common source of **hotspotting**. Hotspotting occurs when a large amount of client traffic is directed at one node, or only a few nodes, of a cluster. This traffic may represent reads, writes, or other operations. The traffic overwhelms the single machine responsible for hosting that region, causing performance degradation and potentially leading to region unavailability. This can also have adverse effects on other regions hosted by the same region server as that host is unable to service the requested load. It is important to design data access patterns such that the cluster is fully and evenly utilized.

To prevent hotspotting on writes, design your row keys such that rows that truly do need to be in the same region are, but in the bigger picture, data is being written to multiple regions across the cluster, rather than one at a time. Some common techniques for avoiding hotspotting are described below, along with some of their advantages and drawbacks.

#### Salting \\[!toc]

Salting in this sense has nothing to do with cryptography, but refers to adding random data to the start of a row key. In this case, salting refers to adding a randomly-assigned prefix to the row key to cause it to sort differently than it otherwise would. The number of possible prefixes correspond to the number of regions you want to spread the data across. Salting can be helpful if you have a few "hot" row key patterns which come up over and over amongst other more evenly-distributed rows. Consider the following example, which shows that salting can spread write load across multiple RegionServers, and illustrates some of the negative implications for reads.

#### Salting Example: \\[!toc]

Suppose you have the following list of row keys, and your table is split such that there is one region for each letter of the alphabet. Prefix 'a' is one region, prefix 'b' is another. In this table, all rows starting with 'f' are in the same region. This example focuses on rows with keys like the following:

\`\`\`text
foo0001
foo0002
foo0003
foo0004
\`\`\`

Now, imagine that you would like to spread these across four different regions. You decide to use four different salts: \`a\`, \`b\`, \`c\`, and \`d\`. In this scenario, each of these letter prefixes will be on a different region. After applying the salts, you have the following rowkeys instead. Since you can now write to four separate regions, you theoretically have four times the throughput when writing that you would have if all the writes were going to the same region.

\`\`\`text
a-foo0003
b-foo0001
c-foo0004
d-foo0002
\`\`\`

Then, if you add another row, it will randomly be assigned one of the four possible salt values and end up near one of the existing rows.

\`\`\`text
a-foo0003
b-foo0001
c-foo0003
c-foo0004
d-foo0002
\`\`\`

Since this assignment will be random, you will need to do more work if you want to retrieve the rows in lexicographic order. In this way, salting attempts to increase throughput on writes, but has a cost during reads.

#### Hashing \\[!toc]

Instead of a random assignment, you could use a one-way **hash** that would cause a given row to always be "salted" with the same prefix, in a way that would spread the load across the RegionServers, but allow for predictability during reads. Using a deterministic hash allows the client to reconstruct the complete rowkey and use a Get operation to retrieve that row as normal.

#### Hashing Example: \\[!toc]

Given the same situation in the salting example above, you could instead apply a one-way hash that would cause the row with key \`foo0003\` to always, and predictably, receive the \`a\` prefix. Then, to retrieve that row, you would already know the key. You could also optimize things so that certain pairs of keys were always in the same region, for instance.

#### Reversing the Key \\[!toc]

A third common trick for preventing hotspotting is to reverse a fixed-width or numeric row key so that the part that changes the most often (the least significant digit) is first. This effectively randomizes row keys, but sacrifices row ordering properties.

See [https://communities.intel.com/community/itpeernetwork/datastack/blog/2013/11/10/discussion-on-designing-hbase-tables](https://communities.intel.com/community/itpeernetwork/datastack/blog/2013/11/10/discussion-on-designing-hbase-tables), and [article on Salted Tables](https://phoenix.apache.org/salted.html) from the Phoenix project, and the discussion in the comments of [HBASE-11682](https://issues.apache.org/jira/browse/HBASE-11682) for more information about avoiding hotspotting.

### Monotonically Increasing Row Keys/Timeseries Data

In the HBase chapter of Tom White's book [Hadoop: The Definitive Guide](http://oreilly.com/catalog/9780596521981) (O'Reilly) there is a an optimization note on watching out for a phenomenon where an import process walks in lock-step with all clients in concert pounding one of the table's regions (and thus, a single node), then moving onto the next region, etc. With monotonically increasing row-keys (i.e., using a timestamp), this will happen. See this comic by IKai Lan on why monotonically increasing row keys are problematic in BigTable-like datastores: [monotonically increasing values are bad](http://ikaisays.com/2011/01/25/app-engine-datastore-tip-monotonically-increasing-values-are-bad/). The pile-up on a single region brought on by monotonically increasing keys can be mitigated by randomizing the input records to not be in sorted order, but in general it's best to avoid using a timestamp or a sequence (e.g. 1, 2, 3) as the row-key.

If you do need to upload time series data into HBase, you should study [OpenTSDB](http://opentsdb.net/) as a successful example. It has a page describing the [schema](http://opentsdb.net/schema.html) it uses in HBase. The key format in OpenTSDB is effectively \\[metric\\_type]\\[event\\_timestamp], which would appear at first glance to contradict the previous advice about not using a timestamp as the key. However, the difference is that the timestamp is not in the *lead* position of the key, and the design assumption is that there are dozens or hundreds (or more) of different metric types. Thus, even with a continual stream of input data with a mix of metric types, the Puts are distributed across various points of regions in the table.

See [schema.casestudies](/docs/regionserver-sizing#schema-design-case-studies) for some rowkey design examples.

### Try to minimize row and column sizes

In HBase, values are always freighted with their coordinates; as a cell value passes through the system, it'll be accompanied by its row, column name, and timestamp - always. If your rows and column names are large, especially compared to the size of the cell value, then you may run up against some interesting scenarios. One such is the case described by Marc Limotte at the tail of [HBASE-3551](https://issues.apache.org/jira/browse/HBASE-3551?page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel\\&focusedCommentId=13005272#comment-13005272) (recommended!). Therein, the indices that are kept on HBase storefiles (see [HFile Format](/docs/hfile-format)) to facilitate random access may end up occupying large chunks of the HBase allotted RAM because the cell value coordinates are large. Mark in the above cited comment suggests upping the block size so entries in the store file index happen at a larger interval or modify the table schema so it makes for smaller rows and column names. Compression will also make for larger indices. See the thread [a question storefileIndexSize](https://lists.apache.org/thread.html/b158eae5d8888d3530be378298bca90c17f80982fdcdfa01d0844c3d%401306240189%40%3Cuser.hbase.apache.org%3E) up on the user mailing list.

Most of the time small inefficiencies don't matter all that much. Unfortunately, this is a case where they do. Whatever patterns are selected for ColumnFamilies, attributes, and rowkeys they could be repeated several billion times in your data.

See [keyvalue](/docs/architecture/regions#keyvalue) for more information on HBase stores data internally to see why this is important.

#### Column Families

Try to keep the ColumnFamily names as small as possible, preferably one character (e.g. "d" for data/default).

See [KeyValue](/docs/architecture/regions#keyvalue) for more information on how HBase stores data internally.

#### Attributes

Although verbose attribute names (e.g., "myVeryImportantAttribute") are easier to read, prefer shorter attribute names (e.g., "via") to store in HBase.

See [keyvalue](/docs/architecture/regions#keyvalue) for more information on HBase stores data internally to see why this is important.

#### Rowkey Length

Keep them as short as is reasonable such that they can still be useful for required data access (e.g. Get vs. Scan). A short key that is useless for data access is not better than a longer key with better get/scan properties. Expect tradeoffs when designing rowkeys.

#### Byte Patterns

A long is 8 bytes. You can store an unsigned number up to 18,446,744,073,709,551,615 in those eight bytes. If you stored this number as a String — presuming a byte per character — you need nearly 3x the bytes.

Not convinced? Below is some sample code that you can run on your own.

\`\`\`java
// long
//
long l = 1234567890L;
byte[] lb = Bytes.toBytes(l);
System.out.println("long bytes length: " + lb.length);   // returns 8

String s = String.valueOf(l);
byte[] sb = Bytes.toBytes(s);
System.out.println("long as string length: " + sb.length);    // returns 10

// hash
//
MessageDigest md = MessageDigest.getInstance("MD5");
byte[] digest = md.digest(Bytes.toBytes(s));
System.out.println("md5 digest bytes length: " + digest.length);    // returns 16

String sDigest = new String(digest);
byte[] sbDigest = Bytes.toBytes(sDigest);
System.out.println("md5 digest as string length: " + sbDigest.length);    // returns 26
\`\`\`

Unfortunately, using a binary representation of a type will make your data harder to read outside of your code. For example, this is what you will see in the shell when you increment a value:

\`\`\`bash
hbase(main):001:0> incr 't', 'r', 'f:q', 1
COUNTER VALUE = 1

hbase(main):002:0> get 't', 'r'
COLUMN                                        CELL
 f:q                                          timestamp=1369163040570, value=\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x01
1 row(s) in 0.0310 seconds
\`\`\`

The shell makes a best effort to print a string, and it this case it decided to just print the hex. The same will happen to your row keys inside the region names. It can be okay if you know what's being stored, but it might also be unreadable if arbitrary data can be put in the same cells. This is the main trade-off.

### Reverse Timestamps

<Callout type="info">
  [HBASE-4811](https://issues.apache.org/jira/browse/HBASE-4811) implements an API to scan a table
  or a range within a table in reverse, reducing the need to optimize your schema for forward or
  reverse scanning. This feature is available in HBase 0.98 and later. See
  [Scan.setReversed()](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html#setReversed\\(boolean\\))
  for more information.
</Callout>

A common problem in database processing is quickly finding the most recent version of a value. A technique using reverse timestamps as a part of the key can help greatly with a special case of this problem. Also found in the HBase chapter of Tom White's book Hadoop: The Definitive Guide (O'Reilly), the technique involves appending (\`Long.MAX_VALUE - timestamp\`) to the end of any key, e.g. \\[key]\\[reverse\\_timestamp].

The most recent value for \\[key] in a table can be found by performing a Scan for \\[key] and obtaining the first record. Since HBase keys are in sorted order, this key sorts before any older row-keys for \\[key] and thus is first.

This technique would be used instead of using [Number of Versions](/docs/regionserver-sizing#number-of-versions) where the intent is to hold onto all versions "forever" (or a very long time) and at the same time quickly obtain access to any other version by using the same Scan technique.

### Rowkeys and ColumnFamilies

Rowkeys are scoped to ColumnFamilies. Thus, the same rowkey could exist in each ColumnFamily that exists in a table without collision.

### Immutability of Rowkeys

Rowkeys cannot be changed. The only way they can be "changed" in a table is if the row is deleted and then re-inserted. This is a fairly common question on the HBase dist-list so it pays to get the rowkeys right the first time (and/or before you've inserted a lot of data).

### Relationship Between RowKeys and Region Splits

If you pre-split your table, it is *critical* to understand how your rowkey will be distributed across the region boundaries. As an example of why this is important, consider the example of using displayable hex characters as the lead position of the key (e.g., "0000000000000000" to "ffffffffffffffff"). Running those key ranges through \`Bytes.split\` (which is the split strategy used when creating regions in \`Admin.createTable(byte[] startKey, byte[] endKey, numRegions)\` for 10 regions will generate the following splits...

\`\`\`text
48 48 48 48 48 48 48 48 48 48 48 48 48 48 48 48                                // 0
54 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10                 // 6
61 -67 -67 -67 -67 -67 -67 -67 -67 -67 -67 -67 -67 -67 -67 -68                 // =
68 -124 -124 -124 -124 -124 -124 -124 -124 -124 -124 -124 -124 -124 -124 -126  // D
75 75 75 75 75 75 75 75 75 75 75 75 75 75 75 72                                // K
82 18 18 18 18 18 18 18 18 18 18 18 18 18 18 14                                // R
88 -40 -40 -40 -40 -40 -40 -40 -40 -40 -40 -40 -40 -40 -40 -44                 // X
95 -97 -97 -97 -97 -97 -97 -97 -97 -97 -97 -97 -97 -97 -97 -102                // _
102 102 102 102 102 102 102 102 102 102 102 102 102 102 102 102                // f
\`\`\`

(note: the lead byte is listed to the right as a comment.) Given that the first split is a '0' and the last split is an 'f', everything is great, right? Not so fast.

The problem is that all the data is going to pile up in the first 2 regions and the last region thus creating a "lumpy" (and possibly "hot") region problem. To understand why, refer to an [ASCII Table](http://www.asciitable.com). '0' is byte 48, and 'f' is byte 102, but there is a huge gap in byte values (bytes 58 to 96) that will *never appear in this keyspace* because the only values are \\[0-9] and \\[a-f]. Thus, the middle regions will never be used. To make pre-splitting work with this example keyspace, a custom definition of splits (i.e., and not relying on the built-in split method) is required.

Lesson #1: Pre-splitting tables is generally a best practice, but you need to pre-split them in such a way that all the regions are accessible in the keyspace. While this example demonstrated the problem with a hex-key keyspace, the same problem can happen with *any* keyspace. Know your data.

Lesson #2: While generally not advisable, using hex-keys (and more generally, displayable data) can still work with pre-split tables as long as all the created regions are accessible in the keyspace.

To conclude this example, the following is an example of how appropriate splits can be pre-created for hex-keys:

\`\`\`java
public static boolean createTable(Admin admin, HTableDescriptor table, byte[][] splits)
throws IOException {
  try {
    admin.createTable( table, splits );
    return true;
  } catch (TableExistsException e) {
    logger.info("table " + table.getNameAsString() + " already exists");
    // the table already exists...
    return false;
  }
}

public static byte[][] getHexSplits(String startKey, String endKey, int numRegions) {
  byte[][] splits = new byte[numRegions-1][];
  BigInteger lowestKey = new BigInteger(startKey, 16);
  BigInteger highestKey = new BigInteger(endKey, 16);
  BigInteger range = highestKey.subtract(lowestKey);
  BigInteger regionIncrement = range.divide(BigInteger.valueOf(numRegions));
  lowestKey = lowestKey.add(regionIncrement);
  for(int i=0; i < numRegions-1;i++) {
    BigInteger key = lowestKey.add(regionIncrement.multiply(BigInteger.valueOf(i)));
    byte[] b = String.format("%016x", key).getBytes();
    splits[i] = b;
  }
  return splits;
}
\`\`\`

## Number of Versions

### Maximum Number of Versions

The maximum number of row versions to store is configured per column family via [HColumnDescriptor](https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/HColumnDescriptor.html). The default for max versions is 1. This is an important parameter because as described in [Data Model](/docs/datamodel) section HBase does *not* overwrite row values, but rather stores different values per row by time (and qualifier). Excess versions are removed during major compactions. The number of max versions may need to be increased or decreased depending on application needs.

It is not recommended setting the number of max versions to an exceedingly high level (e.g., hundreds or more) unless those old values are very dear to you because this will greatly increase StoreFile size.

### Minimum Number of Versions

Like maximum number of row versions, the minimum number of row versions to keep is configured per column family via [ColumnFamilyDescriptorBuilder](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/ColumnFamilyDescriptorBuilder.html). The default for min versions is 0, which means the feature is disabled. The minimum number of row versions parameter is used together with the time-to-live parameter and can be combined with the number of row versions parameter to allow configurations such as "keep the last T minutes worth of data, at most N versions, *but keep at least M versions around*" (where M is the value for minimum number of row versions, M\\<N). This parameter should only be set when time-to-live is enabled for a column family and must be less than the number of row versions.

## Supported Datatypes

HBase supports a "bytes-in/bytes-out" interface via [Put](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Put.html) and [Result](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Result.html), so anything that can be converted to an array of bytes can be stored as a value. Input could be strings, numbers, complex objects, or even images as long as they can rendered as bytes.

There are practical limits to the size of values (e.g., storing 10-50MB objects in HBase would probably be too much to ask); search the mailing list for conversations on this topic. All rows in HBase conform to the [Data Model](/docs/datamodel), and that includes versioning. Take that into consideration when making your design, as well as block size for the ColumnFamily.

### Counters

One supported datatype that deserves special mention are "counters" (i.e., the ability to do atomic increments of numbers). See [Increment](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#increment\\(org.apache.hadoop.hbase.client.Increment\\)) in \`Table\`.

Synchronization on counters are done on the RegionServer, not in the client.

## Joins

If you have multiple tables, don't forget to factor in the potential for [Joins](/docs/datamodel#datamodel-joins) into the schema design.

## Time To Live (TTL)

ColumnFamilies can set a TTL length in seconds, and HBase will automatically delete rows once the expiration time is reached. This applies to *all* versions of a row - even the current one. The TTL time encoded in the HBase for the row is specified in UTC.

Store files which contains only expired rows are deleted on minor compaction. Setting \`hbase.store.delete.expired.storefile\` to \`false\` disables this feature. Setting minimum number of versions to other than 0 also disables this.

See [HColumnDescriptor](https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/HColumnDescriptor.html) for more information.

Recent versions of HBase also support setting time to live on a per cell basis. See [HBASE-10560](https://issues.apache.org/jira/browse/HBASE-10560) for more information. Cell TTLs are submitted as an attribute on mutation requests (Appends, Increments, Puts, etc.) using Mutation#setTTL. If the TTL attribute is set, it will be applied to all cells updated on the server by the operation. There are two notable differences between cell TTL handling and ColumnFamily TTLs:

* Cell TTLs are expressed in units of milliseconds instead of seconds.

* A cell TTLs cannot extend the effective lifetime of a cell beyond a ColumnFamily level TTL setting.

## Keeping Deleted Cells

By default, delete markers extend back to the beginning of time. Therefore, [Get](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html) or [Scan](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html) operations will not see a deleted cell (row or column), even when the Get or Scan operation indicates a time range before the delete marker was placed.

ColumnFamilies can optionally keep deleted cells. In this case, deleted cells can still be retrieved, as long as these operations specify a time range that ends before the timestamp of any delete that would affect the cells. This allows for point-in-time queries even in the presence of deletes.

Deleted cells are still subject to TTL and there will never be more than "maximum number of versions" deleted cells. A new "raw" scan options returns all deleted rows and the delete markers.

#### Change the Value of \`KEEP_DELETED_CELLS\` Using HBase Shell: \\[!toc]

\`\`\`bash
hbase> hbase> alter 't1', NAME => 'f1', KEEP_DELETED_CELLS => true
\`\`\`

#### Change the Value of \`KEEP_DELETED_CELLS\` Using the API: \\[!toc]

\`\`\`java
...
HColumnDescriptor.setKeepDeletedCells(true);
...
\`\`\`

Let us illustrate the basic effect of setting the \`KEEP_DELETED_CELLS\` attribute on a table.

First, without:

\`\`\`bash
create 'test', {NAME=>'e', VERSIONS=>2147483647}
put 'test', 'r1', 'e:c1', 'value', 10
put 'test', 'r1', 'e:c1', 'value', 12
put 'test', 'r1', 'e:c1', 'value', 14
delete 'test', 'r1', 'e:c1',  11

hbase(main):017:0> scan 'test', {RAW=>true, VERSIONS=>1000}
ROW                                              COLUMN+CELL
 r1                                              column=e:c1, timestamp=14, value=value
 r1                                              column=e:c1, timestamp=12, value=value
 r1                                              column=e:c1, timestamp=11, type=DeleteColumn
 r1                                              column=e:c1, timestamp=10, value=value
1 row(s) in 0.0120 seconds

hbase(main):018:0> flush 'test'
0 row(s) in 0.0350 seconds

hbase(main):019:0> scan 'test', {RAW=>true, VERSIONS=>1000}
ROW                                              COLUMN+CELL
 r1                                              column=e:c1, timestamp=14, value=value
 r1                                              column=e:c1, timestamp=12, value=value
 r1                                              column=e:c1, timestamp=11, type=DeleteColumn
1 row(s) in 0.0120 seconds

hbase(main):020:0> major_compact 'test'
0 row(s) in 0.0260 seconds

hbase(main):021:0> scan 'test', {RAW=>true, VERSIONS=>1000}
ROW                                              COLUMN+CELL
 r1                                              column=e:c1, timestamp=14, value=value
 r1                                              column=e:c1, timestamp=12, value=value
1 row(s) in 0.0120 seconds
\`\`\`

Notice how delete cells are let go.

Now let's run the same test only with \`KEEP_DELETED_CELLS\` set on the table (you can do table or per-column-family):

\`\`\`bash
hbase(main):005:0> create 'test', {NAME=>'e', VERSIONS=>2147483647, KEEP_DELETED_CELLS => true}
0 row(s) in 0.2160 seconds

=> Hbase::Table - test
hbase(main):006:0> put 'test', 'r1', 'e:c1', 'value', 10
0 row(s) in 0.1070 seconds

hbase(main):007:0> put 'test', 'r1', 'e:c1', 'value', 12
0 row(s) in 0.0140 seconds

hbase(main):008:0> put 'test', 'r1', 'e:c1', 'value', 14
0 row(s) in 0.0160 seconds

hbase(main):009:0> delete 'test', 'r1', 'e:c1',  11
0 row(s) in 0.0290 seconds

hbase(main):010:0> scan 'test', {RAW=>true, VERSIONS=>1000}
ROW                                                                                          COLUMN+CELL
 r1                                                                                          column=e:c1, timestamp=14, value=value
 r1                                                                                          column=e:c1, timestamp=12, value=value
 r1                                                                                          column=e:c1, timestamp=11, type=DeleteColumn
 r1                                                                                          column=e:c1, timestamp=10, value=value
1 row(s) in 0.0550 seconds

hbase(main):011:0> flush 'test'
0 row(s) in 0.2780 seconds

hbase(main):012:0> scan 'test', {RAW=>true, VERSIONS=>1000}
ROW                                                                                          COLUMN+CELL
 r1                                                                                          column=e:c1, timestamp=14, value=value
 r1                                                                                          column=e:c1, timestamp=12, value=value
 r1                                                                                          column=e:c1, timestamp=11, type=DeleteColumn
 r1                                                                                          column=e:c1, timestamp=10, value=value
1 row(s) in 0.0620 seconds

hbase(main):013:0> major_compact 'test'
0 row(s) in 0.0530 seconds

hbase(main):014:0> scan 'test', {RAW=>true, VERSIONS=>1000}
ROW                                                                                          COLUMN+CELL
 r1                                                                                          column=e:c1, timestamp=14, value=value
 r1                                                                                          column=e:c1, timestamp=12, value=value
 r1                                                                                          column=e:c1, timestamp=11, type=DeleteColumn
 r1                                                                                          column=e:c1, timestamp=10, value=value
1 row(s) in 0.0650 seconds
\`\`\`

KEEP*DELETED\\_CELLS is to avoid removing Cells from HBase when the \\_only* reason to remove them is the delete marker. So with KEEP\\_DELETED\\_CELLS enabled deleted cells would get removed if either you write more versions than the configured max, or you have a TTL and Cells are in excess of the configured timeout, etc.

## Secondary Indexes and Alternate Query Paths

This section could also be titled "what if my table rowkey looks like *this* but I also want to query my table like *that*." A common example on the dist-list is where a row-key is of the format "user-timestamp" but there are reporting requirements on activity across users for certain time ranges. Thus, selecting by user is easy because it is in the lead position of the key, but time is not.

There is no single answer on the best way to handle this because it depends on...

* Number of users
* Data size and data arrival rate
* Flexibility of reporting requirements (e.g., completely ad-hoc date selection vs. pre-configured ranges)
* Desired execution speed of query (e.g., 90 seconds may be reasonable to some for an ad-hoc report, whereas it may be too long for others)

and solutions are also influenced by the size of the cluster and how much processing power you have to throw at the solution. Common techniques are in sub-sections below. This is a comprehensive, but not exhaustive, list of approaches.

It should not be a surprise that secondary indexes require additional cluster space and processing. This is precisely what happens in an RDBMS because the act of creating an alternate index requires both space and processing cycles to update. RDBMS products are more advanced in this regard to handle alternative index management out of the box. However, HBase scales better at larger data volumes, so this is a feature trade-off.

Pay attention to [Apache HBase Performance Tuning](/docs/performance) when implementing any of these approaches.

Additionally, see the David Butler response in this dist-list thread [HBase, mail # user - Stargate+hbase](https://lists.apache.org/thread.html/b0ca33407f010d5b1be67a20d1708e8d8bb1e147770f2cb7182a2e37%401300972712%40%3Cuser.hbase.apache.org%3E)

### Filter Query

Depending on the case, it may be appropriate to use [Client Request Filters](/docs/architecture/client-request-filters). In this case, no secondary index is created. However, don't try a full-scan on a large table like this from an application (i.e., single-threaded client).

### Periodic-Update Secondary Index

A secondary index could be created in another table which is periodically updated via a MapReduce job. The job could be executed intra-day, but depending on load-strategy it could still potentially be out of sync with the main data table.

See [mapreduce.example.readwrite](/docs/mapreduce#hbase-mapreduce-read-example) for more information.

### Dual-Write Secondary Index

Another strategy is to build the secondary index while publishing data to the cluster (e.g., write to data table, write to index table). If this is approach is taken after a data table already exists, then bootstrapping will be needed for the secondary index with a MapReduce job (see [secondary.indexes.periodic](/docs/regionserver-sizing#periodic-update-secondary-index)).

### Summary Tables

Where time-ranges are very wide (e.g., year-long report) and where the data is voluminous, summary tables are a common approach. These would be generated with MapReduce jobs into another table.

See [mapreduce.example.summary](/docs/mapreduce#hbase-mapreduce-summary-to-hbase-example) for more information.

### Coprocessor Secondary Index

Coprocessors act like RDBMS triggers. These were added in 0.92. For more information, see [coprocessors](/docs/cp)

## Constraints

HBase currently supports 'constraints' in traditional (SQL) database parlance. The advised usage for Constraints is in enforcing business rules for attributes in the table (e.g. make sure values are in the range 1-10). Constraints could also be used to enforce referential integrity, but this is strongly discouraged as it will dramatically decrease the write throughput of the tables where integrity checking is enabled. Extensive documentation on using Constraints can be found at [Constraint](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/constraint/Constraint.html) since version 0.94.

## Schema Design Case Studies

The following will describe some typical data ingestion use-cases with HBase, and how the rowkey design and construction can be approached. Note: this is just an illustration of potential approaches, not an exhaustive list. Know your data, and know your processing requirements.

It is highly recommended that you read the rest of the [HBase and Schema Design](/docs/schema-design) first, before reading these case studies.

The following case studies are described:

* Log Data / Timeseries Data
* Log Data / Timeseries on Steroids
* Customer/Order
* Tall/Wide/Middle Schema Design
* List Data

### Case Study - Log Data and Timeseries Data

Assume that the following data elements are being collected.

* Hostname
* Timestamp
* Log event
* Value/message

We can store them in an HBase table called LOG\\_DATA, but what will the rowkey be? From these attributes the rowkey will be some combination of hostname, timestamp, and log-event - but what specifically?

#### Timestamp In The Rowkey Lead Position

The rowkey \`[timestamp][hostname][log-event]\` suffers from the monotonically increasing rowkey problem described in [Monotonically Increasing Row Keys/Timeseries Data](/docs/regionserver-sizing#monotonically-increasing-row-keystimeseries-data).

There is another pattern frequently mentioned in the dist-lists about "bucketing" timestamps, by performing a mod operation on the timestamp. If time-oriented scans are important, this could be a useful approach. Attention must be paid to the number of buckets, because this will require the same number of scans to return results.

\`\`\`java
long bucket = timestamp % numBuckets;
\`\`\`

to construct:

\`\`\`text
[bucket][timestamp][hostname][log-event]
\`\`\`

As stated above, to select data for a particular timerange, a Scan will need to be performed for each bucket. 100 buckets, for example, will provide a wide distribution in the keyspace but it will require 100 Scans to obtain data for a single timestamp, so there are trade-offs.

#### Host In The Rowkey Lead Position

The rowkey \`[hostname][log-event][timestamp]\` is a candidate if there is a large-ish number of hosts to spread the writes and reads across the keyspace. This approach would be useful if scanning by hostname was a priority.

#### Timestamp, or Reverse Timestamp?

If the most important access path is to pull most recent events, then storing the timestamps as reverse-timestamps (e.g., \`timestamp = Long.MAX_VALUE – timestamp\`) will create the property of being able to do a Scan on \`[hostname][log-event]\` to obtain the most recently captured events.

Neither approach is wrong, it just depends on what is most appropriate for the situation.

<Callout type="info">
  [HBASE-4811](https://issues.apache.org/jira/browse/HBASE-4811) implements an API to scan a table
  or a range within a table in reverse, reducing the need to optimize your schema for forward or
  reverse scanning. This feature is available in HBase 0.98 and later. See
  [Scan.setReversed()](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html#setReversed\\(boolean\\))
  for more information.
</Callout>

#### Variable Length or Fixed Length Rowkeys?

It is critical to remember that rowkeys are stamped on every column in HBase. If the hostname is \`a\` and the event type is \`e1\` then the resulting rowkey would be quite small. However, what if the ingested hostname is \`myserver1.mycompany.com\` and the event type is \`com.package1.subpackage2.subsubpackage3.ImportantService\`?

It might make sense to use some substitution in the rowkey. There are at least two approaches: hashed and numeric. In the Hostname In The Rowkey Lead Position example, it might look like this:

Composite Rowkey With Hashes:

* \\[MD5 hash of hostname] = 16 bytes
* \\[MD5 hash of event-type] = 16 bytes
* \\[timestamp] = 8 bytes

Composite Rowkey With Numeric Substitution:

For this approach another lookup table would be needed in addition to LOG\\_DATA, called LOG\\_TYPES. The rowkey of LOG\\_TYPES would be:

* \`[type]\` (e.g., byte indicating hostname vs. event-type)
* \`[bytes]\` variable length bytes for raw hostname or event-type.

A column for this rowkey could be a long with an assigned number, which could be obtained by using an [HBase counter](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#incrementColumnValue\\(byte%5B%5D,byte%5B%5D,byte%5B%5D,long\\))

So the resulting composite rowkey would be:

* \\[substituted long for hostname] = 8 bytes
* \\[substituted long for event type] = 8 bytes
* \\[timestamp] = 8 bytes

In either the Hash or Numeric substitution approach, the raw values for hostname and event-type can be stored as columns.

### Case Study - Log Data and Timeseries Data on Steroids

This effectively is the OpenTSDB approach. What OpenTSDB does is re-write data and pack rows into columns for certain time-periods. For a detailed explanation, see: [http://opentsdb.net/schema.html](http://opentsdb.net/schema.html), and [Lessons Learned from OpenTSDB](https://www.slideshare.net/cloudera/4-opentsdb-hbasecon) from HBaseCon2012.

But this is how the general concept works: data is ingested, for example, in this manner...

\`\`\`text
[hostname][log-event][timestamp1]
[hostname][log-event][timestamp2]
[hostname][log-event][timestamp3]
\`\`\`

with separate rowkeys for each detailed event, but is re-written like this...

\`\`\`text
[hostname][log-event][timerange]
\`\`\`

and each of the above events are converted into columns stored with a time-offset relative to the beginning timerange (e.g., every 5 minutes). This is obviously a very advanced processing technique, but HBase makes this possible.

### Case Study - Customer/Order

Assume that HBase is used to store customer and order information. There are two core record-types being ingested: a Customer record type, and Order record type.

The Customer record type would include all the things that you'd typically expect:

* Customer number
* Customer name
* Address (e.g., city, state, zip)
* Phone numbers, etc.

The Order record type would include things like:

* Customer number
* Order number
* Sales date
* A series of nested objects for shipping locations and line-items (see [Order Object Design](/docs/regionserver-sizing#order-object-design) for details)

Assuming that the combination of customer number and sales order uniquely identify an order, these two attributes will compose the rowkey, and specifically a composite key such as:

\`\`\`text
[customer number][order number]
\`\`\`

for an ORDER table. However, there are more design decisions to make: are the *raw* values the best choices for rowkeys?

The same design questions in the Log Data use-case confront us here. What is the keyspace of the customer number, and what is the format (e.g., numeric? alphanumeric?) As it is advantageous to use fixed-length keys in HBase, as well as keys that can support a reasonable spread in the keyspace, similar options appear:

Composite Rowkey With Hashes:

* \\[MD5 of customer number] = 16 bytes
* \\[MD5 of order number] = 16 bytes

Composite Numeric/Hash Combo Rowkey:

* \\[substituted long for customer number] = 8 bytes
* \\[MD5 of order number] = 16 bytes

#### Single Table? Multiple Tables?

A traditional design approach would have separate tables for CUSTOMER and SALES. Another option is to pack multiple record types into a single table (e.g., CUSTOMER++).

Customer Record Type Rowkey:

* \\[customer-id]
* \\[type] = type indicating \`1\` for customer record type

Order Record Type Rowkey:

* \\[customer-id]
* \\[type] = type indicating \`2\` for order record type
* \\[order]

The advantage of this particular CUSTOMER++ approach is that organizes many different record-types by customer-id (e.g., a single scan could get you everything about that customer). The disadvantage is that it's not as easy to scan for a particular record-type.

#### Order Object Design

Now we need to address how to model the Order object. Assume that the class structure is as follows:

#### Order \\[!toc]

an Order can have multiple ShippingLocations

#### LineItem \\[!toc]

a ShippingLocation can have multiple LineItems

there are multiple options on storing this data.

##### Completely Normalized

With this approach, there would be separate tables for ORDER, SHIPPING\\_LOCATION, and LINE\\_ITEM.

The ORDER table's rowkey was described above: [schema.casestudies.custorder](/docs/regionserver-sizing#case-study---customerorder)

The SHIPPING\\_LOCATION's composite rowkey would be something like this:

* \`[order-rowkey]\`
* \`[shipping location number]\` (e.g., 1st location, 2nd, etc.)

The LINE\\_ITEM table's composite rowkey would be something like this:

* \`[order-rowkey]\`
* \`[shipping location number]\` (e.g., 1st location, 2nd, etc.)
* \`[line item number]\` (e.g., 1st lineitem, 2nd, etc.)

Such a normalized model is likely to be the approach with an RDBMS, but that's not your only option with HBase. The cons of such an approach is that to retrieve information about any Order, you will need:

* Get on the ORDER table for the Order
* Scan on the SHIPPING\\_LOCATION table for that order to get the ShippingLocation instances
* Scan on the LINE\\_ITEM for each ShippingLocation

granted, this is what an RDBMS would do under the covers anyway, but since there are no joins in HBase you're just more aware of this fact.

#### Single Table With Record Types

With this approach, there would exist a single table ORDER that would contain

The Order rowkey was described above: [schema.casestudies.custorder](/docs/regionserver-sizing#case-study---customerorder)

* \`[order-rowkey]\`
* \`[ORDER record type]\`

The ShippingLocation composite rowkey would be something like this:

* \`[order-rowkey]\`
* \`[SHIPPING record type]\`
* \`[shipping location number]\` (e.g., 1st location, 2nd, etc.)

The LineItem composite rowkey would be something like this:

* \`[order-rowkey]\`
* \`[LINE record type]\`
* \`[shipping location number]\` (e.g., 1st location, 2nd, etc.)
* \`[line item number]\` (e.g., 1st lineitem, 2nd, etc.)

#### Denormalized

A variant of the Single Table With Record Types approach is to denormalize and flatten some of the object hierarchy, such as collapsing the ShippingLocation attributes onto each LineItem instance.

The LineItem composite rowkey would be something like this:

* \`[order-rowkey]\`
* \`[LINE record type]\`
* \`[line item number]\` (e.g., 1st lineitem, 2nd, etc., care must be taken that there are unique across the entire order)

and the LineItem columns would be something like this:

* itemNumber
* quantity
* price
* shipToLine1 (denormalized from ShippingLocation)
* shipToLine2 (denormalized from ShippingLocation)
* shipToCity (denormalized from ShippingLocation)
* shipToState (denormalized from ShippingLocation)
* shipToZip (denormalized from ShippingLocation)

The pros of this approach include a less complex object hierarchy, but one of the cons is that updating gets more complicated in case any of this information changes.

#### Object BLOB

With this approach, the entire Order object graph is treated, in one way or another, as a BLOB. For example, the ORDER table's rowkey was described above: [schema.casestudies.custorder](/docs/regionserver-sizing#case-study---customerorder), and a single column called "order" would contain an object that could be deserialized that contained a container Order, ShippingLocations, and LineItems.

There are many options here: JSON, XML, Java Serialization, Avro, Hadoop Writables, etc. All of them are variants of the same approach: encode the object graph to a byte-array. Care should be taken with this approach to ensure backward compatibility in case the object model changes such that older persisted structures can still be read back out of HBase.

Pros are being able to manage complex object graphs with minimal I/O (e.g., a single HBase Get per Order in this example), but the cons include the aforementioned warning about backward compatibility of serialization, language dependencies of serialization (e.g., Java Serialization only works with Java clients), the fact that you have to deserialize the entire object to get any piece of information inside the BLOB, and the difficulty in getting frameworks like Hive to work with custom objects like this.

### Case Study - "Tall/Wide/Middle" Schema Design Smackdown

This section will describe additional schema design questions that appear on the dist-list, specifically about tall and wide tables. These are general guidelines and not laws - each application must consider its own needs.

#### Rows vs. Versions

A common question is whether one should prefer rows or HBase's built-in-versioning. The context is typically where there are "a lot" of versions of a row to be retained (e.g., where it is significantly above the HBase default of 1 max versions). The rows-approach would require storing a timestamp in some portion of the rowkey so that they would not overwrite with each successive update.

Preference: Rows (generally speaking).

#### Rows vs. Columns

Another common question is whether one should prefer rows or columns. The context is typically in extreme cases of wide tables, such as having 1 row with 1 million attributes, or 1 million rows with 1 columns apiece.

Preference: Rows (generally speaking). To be clear, this guideline is in the context is in extremely wide cases, not in the standard use-case where one needs to store a few dozen or hundred columns. But there is also a middle path between these two options, and that is "Rows as Columns."

#### Rows as Columns

The middle path between Rows vs. Columns is packing data that would be a separate row into columns, for certain rows. OpenTSDB is the best example of this case where a single row represents a defined time-range, and then discrete events are treated as columns. This approach is often more complex, and may require the additional complexity of re-writing your data, but has the advantage of being I/O efficient. For an overview of this approach, see [schema.casestudies.log-steroids](#schema.casestudies.log_steroids).

### Case Study - List Data

The following is an exchange from the user dist-list regarding a fairly common question: how to handle per-user list data in Apache HBase.

* QUESTION \\*

We're looking at how to store a large amount of (per-user) list data in HBase, and we were trying to figure out what kind of access pattern made the most sense. One option is store the majority of the data in a key, so we could have something like:

\`\`\`text
<FixedWidthUserName><FixedWidthValueId1>:"" (no value)
<FixedWidthUserName><FixedWidthValueId2>:"" (no value)
<FixedWidthUserName><FixedWidthValueId3>:"" (no value)
\`\`\`

The other option we had was to do this entirely using:

\`\`\`text
<FixedWidthUserName><FixedWidthPageNum0>:<FixedWidthLength><FixedIdNextPageNum><ValueId1><ValueId2><ValueId3>...
<FixedWidthUserName><FixedWidthPageNum1>:<FixedWidthLength><FixedIdNextPageNum><ValueId1><ValueId2><ValueId3>...
\`\`\`

where each row would contain multiple values. So in one case reading the first thirty values would be:

\`\`\`bash
scan { STARTROW => 'FixedWidthUsername' LIMIT => 30}
\`\`\`

And in the second case it would be

\`\`\`bash
get 'FixedWidthUserName\\x00\\x00\\x00\\x00'
\`\`\`

The general usage pattern would be to read only the first 30 values of these lists, with infrequent access reading deeper into the lists. Some users would have ⇐ 30 total values in these lists, and some users would have millions (i.e. power-law distribution)

The single-value format seems like it would take up more space on HBase, but would offer some improved retrieval / pagination flexibility. Would there be any significant performance advantages to be able to paginate via gets vs paginating with scans?

My initial understanding was that doing a scan should be faster if our paging size is unknown (and caching is set appropriately), but that gets should be faster if we'll always need the same page size. I've ended up hearing different people tell me opposite things about performance. I assume the page sizes would be relatively consistent, so for most use cases we could guarantee that we only wanted one page of data in the fixed-page-length case. I would also assume that we would have infrequent updates, but may have inserts into the middle of these lists (meaning we'd need to update all subsequent rows).

Thanks for help / suggestions / follow-up questions.

* ANSWER \\*

If I understand you correctly, you're ultimately trying to store triples in the form "user, valueid, value", right? E.g., something like:

\`\`\`text
"user123, firstname, Paul",
"user234, lastname, Smith"
\`\`\`

(But the usernames are fixed width, and the valueids are fixed width).

And, your access pattern is along the lines of: "for user X, list the next 30 values, starting with valueid Y". Is that right? And these values should be returned sorted by valueid?

The tl;dr version is that you should probably go with one row per user+value, and not build a complicated intra-row pagination scheme on your own unless you're really sure it is needed.

Your two options mirror a common question people have when designing HBase schemas: should I go "tall" or "wide"? Your first schema is "tall": each row represents one value for one user, and so there are many rows in the table for each user; the row key is user + valueid, and there would be (presumably) a single column qualifier that means "the value". This is great if you want to scan over rows in sorted order by row key (thus my question above, about whether these ids are sorted correctly). You can start a scan at any user+valueid, read the next 30, and be done. What you're giving up is the ability to have transactional guarantees around all the rows for one user, but it doesn't sound like you need that. Doing it this way is generally recommended (see [here](/docs/regionserver-sizing#case-study---tallwidemiddle-schema-design-smackdown)).

Your second option is "wide": you store a bunch of values in one row, using different qualifiers (where the qualifier is the valueid). The simple way to do that would be to just store ALL values for one user in a single row. I'm guessing you jumped to the "paginated" version because you're assuming that storing millions of columns in a single row would be bad for performance, which may or may not be true; as long as you're not trying to do too much in a single request, or do things like scanning over and returning all of the cells in the row, it shouldn't be fundamentally worse. The client has methods that allow you to get specific slices of columns.

Note that neither case fundamentally uses more disk space than the other; you're just "shifting" part of the identifying information for a value either to the left (into the row key, in option one) or to the right (into the column qualifiers in option 2). Under the covers, every key/value still stores the whole row key, and column family name. (If this is a bit confusing, take an hour and watch Lars George's excellent video about understanding HBase schema design: [http://www.youtube.com/watch?v=\\_HLoH\\_PgrLk](http://www.youtube.com/watch?v=_HLoH_PgrLk)).

A manually paginated version has lots more complexities, as you note, like having to keep track of how many things are in each page, re-shuffling if new values are inserted, etc. That seems significantly more complex. It might have some slight speed advantages (or disadvantages!) at extremely high throughput, and the only way to really know that would be to try it out. If you don't have time to build it both ways and compare, my advice would be to start with the simplest option (one row per user+value). Start simple and iterate! :)

## Operational and Performance Configuration Options

### Tune HBase Server RPC Handling

* Set \`hbase.regionserver.handler.count\` (in \`hbase-site.xml\`) to cores x spindles for concurrency.
* Optionally, split the call queues into separate read and write queues for differentiated service. The parameter \`hbase.ipc.server.callqueue.handler.factor\` specifies the number of call queues:
  * \`0\` means a single shared queue
  * \`1\` means one queue for each handler.
  * A value between \`0\` and \`1\` allocates the number of queues proportionally to the number of handlers. For instance, a value of \`.5\` shares one queue between each two handlers.
* Use \`hbase.ipc.server.callqueue.read.ratio\` (\`hbase.ipc.server.callqueue.read.share\` in 0.98) to split the call queues into read and write queues:
  * \`0.5\` means there will be the same number of read and write queues
  * \`< 0.5\` for more write than read
  * \`> 0.5\` for more read than write
* Set \`hbase.ipc.server.callqueue.scan.ratio\` (HBase 1.0+) to split read call queues into small-read and long-read queues:
  * 0.5 means that there will be the same number of short-read and long-read queues
  * \`< 0.5\` for more short-read
  * \`> 0.5\` for more long-read

### Disable Nagle for RPC

Disable Nagle's algorithm. Delayed ACKs can add up to \\~200ms to RPC round trip time. Set the following parameters:

* In Hadoop's \`core-site.xml\`:
  * \`ipc.server.tcpnodelay = true\`
  * \`ipc.client.tcpnodelay = true\`
* In HBase's \`hbase-site.xml\`:
  * \`hbase.ipc.client.tcpnodelay = true\`
  * \`hbase.ipc.server.tcpnodelay = true\`

### Limit Server Failure Impact

Detect regionserver failure as fast as reasonable. Set the following parameters:

* In \`hbase-site.xml\`, set \`zookeeper.session.timeout\` to 30 seconds or less to bound failure detection (20-30 seconds is a good start).
  * Note: Zookeeper clients negotiate a session timeout with the server during client init. Server enforces this timeout to be in the range \\[\`minSessionTimeout\`, \`maxSessionTimeout\`] and both these timeouts (measured in milliseconds) are configurable in Zookeeper service configuration. If not configured, these default to 2 \\* \`tickTime\` and 20 \\* \`tickTime\` respectively (\`tickTime\` is the basic time unit used by ZooKeeper, as measured in milliseconds. It is used to regulate heartbeats, timeouts etc.). Refer to Zookeeper documentation for additional details.
* Detect and avoid unhealthy or failed HDFS DataNodes: in \`hdfs-site.xml\` and \`hbase-site.xml\`, set the following parameters:
  * \`dfs.namenode.avoid.read.stale.datanode = true\`
  * \`dfs.namenode.avoid.write.stale.datanode = true\`

### Optimize on the Server Side for Low Latency

Skip the network for local blocks when the RegionServer goes to read from HDFS by exploiting HDFS's [Short-Circuit Local Reads](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/ShortCircuitLocalReads.html) facility. Note how setup must be done both at the datanode and on the dfsclient ends of the conneciton — i.e. at the RegionServer and how both ends need to have loaded the hadoop native \`.so\` library. After configuring your hadoop setting *dfs.client.read.shortcircuit* to *true* and configuring the *dfs.domain.socket.path* path for the datanode and dfsclient to share and restarting, next configure the regionserver/dfsclient side.

* In \`hbase-site.xml\`, set the following parameters:
  * \`dfs.client.read.shortcircuit = true\`
  * \`dfs.client.read.shortcircuit.skip.checksum = true\` so we don't double checksum (HBase does its own checksumming to save on i/os).
  * \`dfs.domain.socket.path\` to match what was set for the datanodes.
  * \`dfs.client.read.shortcircuit.buffer.size = 131072\` Important to avoid OOME — hbase has a default it uses if unset, see \`hbase.dfs.client.read.shortcircuit.buffer.size\`; its default is 131072.
* Ensure data locality. In \`hbase-site.xml\`, set \`hbase.hstore.min.locality.to.skip.major.compact = 0.7\` (Meaning that 0.7 \\<= n \\<= 1)
* Make sure DataNodes have enough handlers for block transfers. In \`hdfs-site.xml\`, set the following parameters:
  * \`dfs.datanode.max.xcievers >= 8192\`
  * \`dfs.datanode.handler.count =\` number of spindles

Check the RegionServer logs after restart. You should only see complaint if misconfiguration. Otherwise, shortcircuit read operates quietly in background. It does not provide metrics so no optics on how effective it is but read latencies should show a marked improvement, especially if good data locality, lots of random reads, and dataset is larger than available cache.

Other advanced configurations that you might play with, especially if shortcircuit functionality is complaining in the logs, include \`dfs.client.read.shortcircuit.streams.cache.size\` and \`dfs.client.socketcache.capacity\`. Documentation is sparse on these options. You'll have to read source code.

RegionServer metric system exposes HDFS short circuit read metrics \`shortCircuitBytesRead\`. Other HDFS read metrics, including \`totalBytesRead\` (The total number of bytes read from HDFS), \`localBytesRead\` (The number of bytes read from the local HDFS DataNode), \`zeroCopyBytesRead\` (The number of bytes read through HDFS zero copy) are available and can be used to troubleshoot short-circuit read issues.

For more on short-circuit reads, see Colin's old blog on rollout, [How Improved Short-Circuit Local Reads Bring Better Performance and Security to Hadoop](http://blog.cloudera.com/blog/2013/08/how-improved-short-circuit-local-reads-bring-better-performance-and-security-to-hadoop/). The [HDFS-347](https://issues.apache.org/jira/browse/HDFS-347) issue also makes for an interesting read showing the HDFS community at its best (caveat a few comments).

### JVM Tuning

#### Tune JVM GC for low collection latencies

* Use the CMS collector: \`-XX:+UseConcMarkSweepGC\`
* Keep eden space as small as possible to minimize average collection time. Example:
  \`\`\`text
  -XX:CMSInitiatingOccupancyFraction=70
  \`\`\`
* Optimize for low collection latency rather than throughput: \`-Xmn512m\`
* Collect eden in parallel: \`-XX:+UseParNewGC\`
* Avoid collection under pressure: \`-XX:+UseCMSInitiatingOccupancyOnly\`
* Limit per request scanner result sizing so everything fits into survivor space but doesn't tenure. In \`hbase-site.xml\`, set \`hbase.client.scanner.max.result.size\` to 1/8th of eden space (with -\`Xmn512m\` this is \\~51MB )
* Set \`max.result.size\` x \`handler.count\` less than survivor space

#### OS-Level Tuning

* Turn transparent huge pages (THP) off:
  \`\`\`bash
  echo never > /sys/kernel/mm/transparent_hugepage/enabled
  echo never > /sys/kernel/mm/transparent_hugepage/defrag
  \`\`\`
* Set \`vm.swappiness = 0\`
* Set \`vm.min_free_kbytes\` to at least 1GB (8GB on larger memory systems)
* Disable NUMA zone reclaim with \`vm.zone_reclaim_mode = 0\`

## Special Cases

### For applications where failing quickly is better than waiting

* In \`hbase-site.xml\` on the client side, set the following parameters:
  * Set \`hbase.client.pause = 1000\`
  * Set \`hbase.client.retries.number = 3\`
  * If you want to ride over splits and region moves, increase \`hbase.client.retries.number\` substantially (>= 20)
  * Set the RecoverableZookeeper retry count: \`zookeeper.recovery.retry = 1\` (no retry)
* In \`hbase-site.xml\` on the server side, set the Zookeeper session timeout for detecting server failures: \`zookeeper.session.timeout\` ⇐ 30 seconds (20-30 is good).

### For applications that can tolerate slightly out of date information

**HBase timeline consistency (HBASE-10070)** With read replicas enabled, read-only copies of regions (replicas) are distributed over the cluster. One RegionServer services the default or primary replica, which is the only replica that can service writes. Other RegionServers serve the secondary replicas, follow the primary RegionServer, and only see committed updates. The secondary replicas are read-only, but can serve reads immediately while the primary is failing over, cutting read availability blips from seconds to milliseconds. Phoenix supports timeline consistency as of 4.4.0 Tips:

* Deploy HBase 1.0.0 or later.
* Enable timeline consistent replicas on the server side.
* Use one of the following methods to set timeline consistency:
  * Use \`ALTER SESSION SET CONSISTENCY = 'TIMELINE'\`
  * Set the connection property \`Consistency\` to \`timeline\` in the JDBC connect string

### More Information

See the Performance section [perf.schema](/docs/case-studies#case-studies-schema-design) for more information about operational and performance schema design options, such as Bloom Filters, Table-configured regionsizes, compression, and blocksizes.
`,l={title:"RegionServer Sizing Rules of Thumb",description:"Memory sizing guidelines, rowkey design patterns, schema case studies, and performance optimization tips for HBase RegionServers."},h=[{href:"http://hadoop-hbase.blogspot.com/2013/01/hbase-region-server-memory-sizing.html"},{href:"http://hadoop-hbase.blogspot.com/2013/01/hbase-region-server-memory-sizing.html"},{href:"https://communities.intel.com/community/itpeernetwork/datastack/blog/2013/11/10/discussion-on-designing-hbase-tables"},{href:"https://phoenix.apache.org/salted.html"},{href:"https://issues.apache.org/jira/browse/HBASE-11682"},{href:"http://oreilly.com/catalog/9780596521981"},{href:"http://ikaisays.com/2011/01/25/app-engine-datastore-tip-monotonically-increasing-values-are-bad/"},{href:"http://opentsdb.net/"},{href:"http://opentsdb.net/schema.html"},{href:"/docs/regionserver-sizing#schema-design-case-studies"},{href:"https://issues.apache.org/jira/browse/HBASE-3551?page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel&focusedCommentId=13005272#comment-13005272"},{href:"/docs/hfile-format"},{href:"https://lists.apache.org/thread.html/b158eae5d8888d3530be378298bca90c17f80982fdcdfa01d0844c3d%401306240189%40%3Cuser.hbase.apache.org%3E"},{href:"/docs/architecture/regions#keyvalue"},{href:"/docs/architecture/regions#keyvalue"},{href:"/docs/architecture/regions#keyvalue"},{href:"https://issues.apache.org/jira/browse/HBASE-4811"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html#setReversed(boolean)"},{href:"/docs/regionserver-sizing#number-of-versions"},{href:"http://www.asciitable.com"},{href:"https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/HColumnDescriptor.html"},{href:"/docs/datamodel"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/ColumnFamilyDescriptorBuilder.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Put.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Result.html"},{href:"/docs/datamodel"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#increment(org.apache.hadoop.hbase.client.Increment)"},{href:"/docs/datamodel#datamodel-joins"},{href:"https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/HColumnDescriptor.html"},{href:"https://issues.apache.org/jira/browse/HBASE-10560"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html"},{href:"/docs/performance"},{href:"https://lists.apache.org/thread.html/b0ca33407f010d5b1be67a20d1708e8d8bb1e147770f2cb7182a2e37%401300972712%40%3Cuser.hbase.apache.org%3E"},{href:"/docs/architecture/client-request-filters"},{href:"/docs/mapreduce#hbase-mapreduce-read-example"},{href:"/docs/regionserver-sizing#periodic-update-secondary-index"},{href:"/docs/mapreduce#hbase-mapreduce-summary-to-hbase-example"},{href:"/docs/cp"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/constraint/Constraint.html"},{href:"/docs/schema-design"},{href:"/docs/regionserver-sizing#monotonically-increasing-row-keystimeseries-data"},{href:"https://issues.apache.org/jira/browse/HBASE-4811"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html#setReversed(boolean)"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#incrementColumnValue(byte%5B%5D,byte%5B%5D,byte%5B%5D,long)"},{href:"http://opentsdb.net/schema.html"},{href:"https://www.slideshare.net/cloudera/4-opentsdb-hbasecon"},{href:"/docs/regionserver-sizing#order-object-design"},{href:"/docs/regionserver-sizing#case-study---customerorder"},{href:"/docs/regionserver-sizing#case-study---customerorder"},{href:"/docs/regionserver-sizing#case-study---customerorder"},{href:"#schema.casestudies.log_steroids"},{href:"/docs/regionserver-sizing#case-study---tallwidemiddle-schema-design-smackdown"},{href:"http://www.youtube.com/watch?v=_HLoH_PgrLk"},{href:"https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/ShortCircuitLocalReads.html"},{href:"http://blog.cloudera.com/blog/2013/08/how-improved-short-circuit-local-reads-bring-better-performance-and-security-to-hadoop/"},{href:"https://issues.apache.org/jira/browse/HDFS-347"},{href:"/docs/case-studies#case-studies-schema-design"}],d={contents:[{heading:void 0,content:"Lars Hofhansl wrote a great blog post about RegionServer memory sizing. The upshot is that you probably need more memory than you think you need. He goes into the impact of region size, memstore size, HDFS replication factor, and other things to check."},{heading:void 0,content:"Personally I would place the maximum disk space per machine that can be served exclusively with HBase around 6T, unless you have a very read-heavy workload. In that case the Java heap should be 32GB (20G regions, 128M memstores, the rest defaults).— Lars Hofhansl http://hadoop-hbase.blogspot.com/2013/01/hbase-region-server-memory-sizing.html"},{heading:"on-the-number-of-column-families",content:"HBase currently does not do well with anything above two or three column families so keep the number of column families in your schema low. Currently, flushing is done on a per Region basis so if one column family is carrying the bulk of the data bringing on flushes, the adjacent families will also be flushed even though the amount of data they carry is small. When many column families exist the flushing interaction can make for a bunch of needless i/o (To be addressed by changing flushing to work on a per column family basis). In addition, compactions triggered at table/region level will happen per store too."},{heading:"on-the-number-of-column-families",content:"Try to make do with one column family if you can in your schemas. Only introduce a second and third column family in the case where data access is usually column scoped; i.e. you query one column family or the other but usually not both at the one time."},{heading:"cardinality-of-columnfamilies",content:"Where multiple ColumnFamilies exist in a single table, be aware of the cardinality (i.e., number of rows). If ColumnFamilyA has 1 million rows and ColumnFamilyB has 1 billion rows, ColumnFamilyA's data will likely be spread across many, many regions (and RegionServers). This makes mass scans for ColumnFamilyA less efficient."},{heading:"hotspotting",content:"Rows in HBase are sorted lexicographically by row key. This design optimizes for scans, allowing you to store related rows, or rows that will be read together, near each other. However, poorly designed row keys are a common source of hotspotting. Hotspotting occurs when a large amount of client traffic is directed at one node, or only a few nodes, of a cluster. This traffic may represent reads, writes, or other operations. The traffic overwhelms the single machine responsible for hosting that region, causing performance degradation and potentially leading to region unavailability. This can also have adverse effects on other regions hosted by the same region server as that host is unable to service the requested load. It is important to design data access patterns such that the cluster is fully and evenly utilized."},{heading:"hotspotting",content:"To prevent hotspotting on writes, design your row keys such that rows that truly do need to be in the same region are, but in the bigger picture, data is being written to multiple regions across the cluster, rather than one at a time. Some common techniques for avoiding hotspotting are described below, along with some of their advantages and drawbacks."},{heading:"salting-toc",content:'Salting in this sense has nothing to do with cryptography, but refers to adding random data to the start of a row key. In this case, salting refers to adding a randomly-assigned prefix to the row key to cause it to sort differently than it otherwise would. The number of possible prefixes correspond to the number of regions you want to spread the data across. Salting can be helpful if you have a few "hot" row key patterns which come up over and over amongst other more evenly-distributed rows. Consider the following example, which shows that salting can spread write load across multiple RegionServers, and illustrates some of the negative implications for reads.'},{heading:"salting-example-toc",content:"Suppose you have the following list of row keys, and your table is split such that there is one region for each letter of the alphabet. Prefix 'a' is one region, prefix 'b' is another. In this table, all rows starting with 'f' are in the same region. This example focuses on rows with keys like the following:"},{heading:"salting-example-toc",content:"Now, imagine that you would like to spread these across four different regions. You decide to use four different salts: a, b, c, and d. In this scenario, each of these letter prefixes will be on a different region. After applying the salts, you have the following rowkeys instead. Since you can now write to four separate regions, you theoretically have four times the throughput when writing that you would have if all the writes were going to the same region."},{heading:"salting-example-toc",content:"Then, if you add another row, it will randomly be assigned one of the four possible salt values and end up near one of the existing rows."},{heading:"salting-example-toc",content:"Since this assignment will be random, you will need to do more work if you want to retrieve the rows in lexicographic order. In this way, salting attempts to increase throughput on writes, but has a cost during reads."},{heading:"hashing-toc",content:'Instead of a random assignment, you could use a one-way hash that would cause a given row to always be "salted" with the same prefix, in a way that would spread the load across the RegionServers, but allow for predictability during reads. Using a deterministic hash allows the client to reconstruct the complete rowkey and use a Get operation to retrieve that row as normal.'},{heading:"hashing-example-toc",content:"Given the same situation in the salting example above, you could instead apply a one-way hash that would cause the row with key foo0003 to always, and predictably, receive the a prefix. Then, to retrieve that row, you would already know the key. You could also optimize things so that certain pairs of keys were always in the same region, for instance."},{heading:"reversing-the-key-toc",content:"A third common trick for preventing hotspotting is to reverse a fixed-width or numeric row key so that the part that changes the most often (the least significant digit) is first. This effectively randomizes row keys, but sacrifices row ordering properties."},{heading:"reversing-the-key-toc",content:"See https://communities.intel.com/community/itpeernetwork/datastack/blog/2013/11/10/discussion-on-designing-hbase-tables, and article on Salted Tables from the Phoenix project, and the discussion in the comments of HBASE-11682 for more information about avoiding hotspotting."},{heading:"monotonically-increasing-row-keystimeseries-data",content:"In the HBase chapter of Tom White's book Hadoop: The Definitive Guide (O'Reilly) there is a an optimization note on watching out for a phenomenon where an import process walks in lock-step with all clients in concert pounding one of the table's regions (and thus, a single node), then moving onto the next region, etc. With monotonically increasing row-keys (i.e., using a timestamp), this will happen. See this comic by IKai Lan on why monotonically increasing row keys are problematic in BigTable-like datastores: monotonically increasing values are bad. The pile-up on a single region brought on by monotonically increasing keys can be mitigated by randomizing the input records to not be in sorted order, but in general it's best to avoid using a timestamp or a sequence (e.g. 1, 2, 3) as the row-key."},{heading:"monotonically-increasing-row-keystimeseries-data",content:"If you do need to upload time series data into HBase, you should study OpenTSDB as a successful example. It has a page describing the schema it uses in HBase. The key format in OpenTSDB is effectively [metric_type][event_timestamp], which would appear at first glance to contradict the previous advice about not using a timestamp as the key. However, the difference is that the timestamp is not in the lead position of the key, and the design assumption is that there are dozens or hundreds (or more) of different metric types. Thus, even with a continual stream of input data with a mix of metric types, the Puts are distributed across various points of regions in the table."},{heading:"monotonically-increasing-row-keystimeseries-data",content:"See schema.casestudies for some rowkey design examples."},{heading:"try-to-minimize-row-and-column-sizes",content:"In HBase, values are always freighted with their coordinates; as a cell value passes through the system, it'll be accompanied by its row, column name, and timestamp - always. If your rows and column names are large, especially compared to the size of the cell value, then you may run up against some interesting scenarios. One such is the case described by Marc Limotte at the tail of HBASE-3551 (recommended!). Therein, the indices that are kept on HBase storefiles (see HFile Format) to facilitate random access may end up occupying large chunks of the HBase allotted RAM because the cell value coordinates are large. Mark in the above cited comment suggests upping the block size so entries in the store file index happen at a larger interval or modify the table schema so it makes for smaller rows and column names. Compression will also make for larger indices. See the thread a question storefileIndexSize up on the user mailing list."},{heading:"try-to-minimize-row-and-column-sizes",content:"Most of the time small inefficiencies don't matter all that much. Unfortunately, this is a case where they do. Whatever patterns are selected for ColumnFamilies, attributes, and rowkeys they could be repeated several billion times in your data."},{heading:"try-to-minimize-row-and-column-sizes",content:"See keyvalue for more information on HBase stores data internally to see why this is important."},{heading:"column-families",content:'Try to keep the ColumnFamily names as small as possible, preferably one character (e.g. "d" for data/default).'},{heading:"column-families",content:"See KeyValue for more information on how HBase stores data internally."},{heading:"attributes",content:'Although verbose attribute names (e.g., "myVeryImportantAttribute") are easier to read, prefer shorter attribute names (e.g., "via") to store in HBase.'},{heading:"attributes",content:"See keyvalue for more information on HBase stores data internally to see why this is important."},{heading:"rowkey-length",content:"Keep them as short as is reasonable such that they can still be useful for required data access (e.g. Get vs. Scan). A short key that is useless for data access is not better than a longer key with better get/scan properties. Expect tradeoffs when designing rowkeys."},{heading:"byte-patterns",content:"A long is 8 bytes. You can store an unsigned number up to 18,446,744,073,709,551,615 in those eight bytes. If you stored this number as a String — presuming a byte per character — you need nearly 3x the bytes."},{heading:"byte-patterns",content:"Not convinced? Below is some sample code that you can run on your own."},{heading:"byte-patterns",content:"Unfortunately, using a binary representation of a type will make your data harder to read outside of your code. For example, this is what you will see in the shell when you increment a value:"},{heading:"byte-patterns",content:"The shell makes a best effort to print a string, and it this case it decided to just print the hex. The same will happen to your row keys inside the region names. It can be okay if you know what's being stored, but it might also be unreadable if arbitrary data can be put in the same cells. This is the main trade-off."},{heading:"reverse-timestamps",content:"type: info"},{heading:"reverse-timestamps",content:`HBASE-4811 implements an API to scan a table
or a range within a table in reverse, reducing the need to optimize your schema for forward or
reverse scanning. This feature is available in HBase 0.98 and later. See
Scan.setReversed()
for more information.`},{heading:"reverse-timestamps",content:"A common problem in database processing is quickly finding the most recent version of a value. A technique using reverse timestamps as a part of the key can help greatly with a special case of this problem. Also found in the HBase chapter of Tom White's book Hadoop: The Definitive Guide (O'Reilly), the technique involves appending (Long.MAX_VALUE - timestamp) to the end of any key, e.g. [key][reverse_timestamp]."},{heading:"reverse-timestamps",content:"The most recent value for [key] in a table can be found by performing a Scan for [key] and obtaining the first record. Since HBase keys are in sorted order, this key sorts before any older row-keys for [key] and thus is first."},{heading:"reverse-timestamps",content:'This technique would be used instead of using Number of Versions where the intent is to hold onto all versions "forever" (or a very long time) and at the same time quickly obtain access to any other version by using the same Scan technique.'},{heading:"rowkeys-and-columnfamilies",content:"Rowkeys are scoped to ColumnFamilies. Thus, the same rowkey could exist in each ColumnFamily that exists in a table without collision."},{heading:"immutability-of-rowkeys",content:`Rowkeys cannot be changed. The only way they can be "changed" in a table is if the row is deleted and then re-inserted. This is a fairly common question on the HBase dist-list so it pays to get the rowkeys right the first time (and/or before you've inserted a lot of data).`},{heading:"relationship-between-rowkeys-and-region-splits",content:'If you pre-split your table, it is critical to understand how your rowkey will be distributed across the region boundaries. As an example of why this is important, consider the example of using displayable hex characters as the lead position of the key (e.g., "0000000000000000" to "ffffffffffffffff"). Running those key ranges through Bytes.split (which is the split strategy used when creating regions in Admin.createTable(byte[] startKey, byte[] endKey, numRegions) for 10 regions will generate the following splits...'},{heading:"relationship-between-rowkeys-and-region-splits",content:"(note: the lead byte is listed to the right as a comment.) Given that the first split is a '0' and the last split is an 'f', everything is great, right? Not so fast."},{heading:"relationship-between-rowkeys-and-region-splits",content:`The problem is that all the data is going to pile up in the first 2 regions and the last region thus creating a "lumpy" (and possibly "hot") region problem. To understand why, refer to an ASCII Table. '0' is byte 48, and 'f' is byte 102, but there is a huge gap in byte values (bytes 58 to 96) that will never appear in this keyspace because the only values are [0-9] and [a-f]. Thus, the middle regions will never be used. To make pre-splitting work with this example keyspace, a custom definition of splits (i.e., and not relying on the built-in split method) is required.`},{heading:"relationship-between-rowkeys-and-region-splits",content:"Lesson #1: Pre-splitting tables is generally a best practice, but you need to pre-split them in such a way that all the regions are accessible in the keyspace. While this example demonstrated the problem with a hex-key keyspace, the same problem can happen with any keyspace. Know your data."},{heading:"relationship-between-rowkeys-and-region-splits",content:"Lesson #2: While generally not advisable, using hex-keys (and more generally, displayable data) can still work with pre-split tables as long as all the created regions are accessible in the keyspace."},{heading:"relationship-between-rowkeys-and-region-splits",content:"To conclude this example, the following is an example of how appropriate splits can be pre-created for hex-keys:"},{heading:"maximum-number-of-versions",content:"The maximum number of row versions to store is configured per column family via HColumnDescriptor. The default for max versions is 1. This is an important parameter because as described in Data Model section HBase does not overwrite row values, but rather stores different values per row by time (and qualifier). Excess versions are removed during major compactions. The number of max versions may need to be increased or decreased depending on application needs."},{heading:"maximum-number-of-versions",content:"It is not recommended setting the number of max versions to an exceedingly high level (e.g., hundreds or more) unless those old values are very dear to you because this will greatly increase StoreFile size."},{heading:"minimum-number-of-versions",content:'Like maximum number of row versions, the minimum number of row versions to keep is configured per column family via ColumnFamilyDescriptorBuilder. The default for min versions is 0, which means the feature is disabled. The minimum number of row versions parameter is used together with the time-to-live parameter and can be combined with the number of row versions parameter to allow configurations such as "keep the last T minutes worth of data, at most N versions, but keep at least M versions around" (where M is the value for minimum number of row versions, M<N). This parameter should only be set when time-to-live is enabled for a column family and must be less than the number of row versions.'},{heading:"supported-datatypes",content:'HBase supports a "bytes-in/bytes-out" interface via Put and Result, so anything that can be converted to an array of bytes can be stored as a value. Input could be strings, numbers, complex objects, or even images as long as they can rendered as bytes.'},{heading:"supported-datatypes",content:"There are practical limits to the size of values (e.g., storing 10-50MB objects in HBase would probably be too much to ask); search the mailing list for conversations on this topic. All rows in HBase conform to the Data Model, and that includes versioning. Take that into consideration when making your design, as well as block size for the ColumnFamily."},{heading:"counters",content:'One supported datatype that deserves special mention are "counters" (i.e., the ability to do atomic increments of numbers). See Increment in Table.'},{heading:"counters",content:"Synchronization on counters are done on the RegionServer, not in the client."},{heading:"regionserver-sizing-joins",content:"If you have multiple tables, don't forget to factor in the potential for Joins into the schema design."},{heading:"time-to-live-ttl",content:"ColumnFamilies can set a TTL length in seconds, and HBase will automatically delete rows once the expiration time is reached. This applies to all versions of a row - even the current one. The TTL time encoded in the HBase for the row is specified in UTC."},{heading:"time-to-live-ttl",content:"Store files which contains only expired rows are deleted on minor compaction. Setting hbase.store.delete.expired.storefile to false disables this feature. Setting minimum number of versions to other than 0 also disables this."},{heading:"time-to-live-ttl",content:"See HColumnDescriptor for more information."},{heading:"time-to-live-ttl",content:"Recent versions of HBase also support setting time to live on a per cell basis. See HBASE-10560 for more information. Cell TTLs are submitted as an attribute on mutation requests (Appends, Increments, Puts, etc.) using Mutation#setTTL. If the TTL attribute is set, it will be applied to all cells updated on the server by the operation. There are two notable differences between cell TTL handling and ColumnFamily TTLs:"},{heading:"time-to-live-ttl",content:"Cell TTLs are expressed in units of milliseconds instead of seconds."},{heading:"time-to-live-ttl",content:"A cell TTLs cannot extend the effective lifetime of a cell beyond a ColumnFamily level TTL setting."},{heading:"keeping-deleted-cells",content:"By default, delete markers extend back to the beginning of time. Therefore, Get or Scan operations will not see a deleted cell (row or column), even when the Get or Scan operation indicates a time range before the delete marker was placed."},{heading:"keeping-deleted-cells",content:"ColumnFamilies can optionally keep deleted cells. In this case, deleted cells can still be retrieved, as long as these operations specify a time range that ends before the timestamp of any delete that would affect the cells. This allows for point-in-time queries even in the presence of deletes."},{heading:"keeping-deleted-cells",content:'Deleted cells are still subject to TTL and there will never be more than "maximum number of versions" deleted cells. A new "raw" scan options returns all deleted rows and the delete markers.'},{heading:"change-the-value-of-keep_deleted_cells-using-the-api-toc",content:"Let us illustrate the basic effect of setting the KEEP_DELETED_CELLS attribute on a table."},{heading:"change-the-value-of-keep_deleted_cells-using-the-api-toc",content:"First, without:"},{heading:"change-the-value-of-keep_deleted_cells-using-the-api-toc",content:"Notice how delete cells are let go."},{heading:"change-the-value-of-keep_deleted_cells-using-the-api-toc",content:"Now let's run the same test only with KEEP_DELETED_CELLS set on the table (you can do table or per-column-family):"},{heading:"change-the-value-of-keep_deleted_cells-using-the-api-toc",content:"KEEPDELETED_CELLS is to avoid removing Cells from HBase when the _only reason to remove them is the delete marker. So with KEEP_DELETED_CELLS enabled deleted cells would get removed if either you write more versions than the configured max, or you have a TTL and Cells are in excess of the configured timeout, etc."},{heading:"secondary-indexes-and-alternate-query-paths",content:'This section could also be titled "what if my table rowkey looks like this but I also want to query my table like that." A common example on the dist-list is where a row-key is of the format "user-timestamp" but there are reporting requirements on activity across users for certain time ranges. Thus, selecting by user is easy because it is in the lead position of the key, but time is not.'},{heading:"secondary-indexes-and-alternate-query-paths",content:"There is no single answer on the best way to handle this because it depends on..."},{heading:"secondary-indexes-and-alternate-query-paths",content:"Number of users"},{heading:"secondary-indexes-and-alternate-query-paths",content:"Data size and data arrival rate"},{heading:"secondary-indexes-and-alternate-query-paths",content:"Flexibility of reporting requirements (e.g., completely ad-hoc date selection vs. pre-configured ranges)"},{heading:"secondary-indexes-and-alternate-query-paths",content:"Desired execution speed of query (e.g., 90 seconds may be reasonable to some for an ad-hoc report, whereas it may be too long for others)"},{heading:"secondary-indexes-and-alternate-query-paths",content:"and solutions are also influenced by the size of the cluster and how much processing power you have to throw at the solution. Common techniques are in sub-sections below. This is a comprehensive, but not exhaustive, list of approaches."},{heading:"secondary-indexes-and-alternate-query-paths",content:"It should not be a surprise that secondary indexes require additional cluster space and processing. This is precisely what happens in an RDBMS because the act of creating an alternate index requires both space and processing cycles to update. RDBMS products are more advanced in this regard to handle alternative index management out of the box. However, HBase scales better at larger data volumes, so this is a feature trade-off."},{heading:"secondary-indexes-and-alternate-query-paths",content:"Pay attention to Apache HBase Performance Tuning when implementing any of these approaches."},{heading:"secondary-indexes-and-alternate-query-paths",content:"Additionally, see the David Butler response in this dist-list thread HBase, mail # user - Stargate+hbase"},{heading:"filter-query",content:"Depending on the case, it may be appropriate to use Client Request Filters. In this case, no secondary index is created. However, don't try a full-scan on a large table like this from an application (i.e., single-threaded client)."},{heading:"periodic-update-secondary-index",content:"A secondary index could be created in another table which is periodically updated via a MapReduce job. The job could be executed intra-day, but depending on load-strategy it could still potentially be out of sync with the main data table."},{heading:"periodic-update-secondary-index",content:"See mapreduce.example.readwrite for more information."},{heading:"dual-write-secondary-index",content:"Another strategy is to build the secondary index while publishing data to the cluster (e.g., write to data table, write to index table). If this is approach is taken after a data table already exists, then bootstrapping will be needed for the secondary index with a MapReduce job (see secondary.indexes.periodic)."},{heading:"summary-tables",content:"Where time-ranges are very wide (e.g., year-long report) and where the data is voluminous, summary tables are a common approach. These would be generated with MapReduce jobs into another table."},{heading:"summary-tables",content:"See mapreduce.example.summary for more information."},{heading:"coprocessor-secondary-index",content:"Coprocessors act like RDBMS triggers. These were added in 0.92. For more information, see coprocessors"},{heading:"regionserver-sizing-constraints",content:"HBase currently supports 'constraints' in traditional (SQL) database parlance. The advised usage for Constraints is in enforcing business rules for attributes in the table (e.g. make sure values are in the range 1-10). Constraints could also be used to enforce referential integrity, but this is strongly discouraged as it will dramatically decrease the write throughput of the tables where integrity checking is enabled. Extensive documentation on using Constraints can be found at Constraint since version 0.94."},{heading:"schema-design-case-studies",content:"The following will describe some typical data ingestion use-cases with HBase, and how the rowkey design and construction can be approached. Note: this is just an illustration of potential approaches, not an exhaustive list. Know your data, and know your processing requirements."},{heading:"schema-design-case-studies",content:"It is highly recommended that you read the rest of the HBase and Schema Design first, before reading these case studies."},{heading:"schema-design-case-studies",content:"The following case studies are described:"},{heading:"schema-design-case-studies",content:"Log Data / Timeseries Data"},{heading:"schema-design-case-studies",content:"Log Data / Timeseries on Steroids"},{heading:"schema-design-case-studies",content:"Customer/Order"},{heading:"schema-design-case-studies",content:"Tall/Wide/Middle Schema Design"},{heading:"schema-design-case-studies",content:"List Data"},{heading:"case-study---log-data-and-timeseries-data",content:"Assume that the following data elements are being collected."},{heading:"case-study---log-data-and-timeseries-data",content:"Hostname"},{heading:"case-study---log-data-and-timeseries-data",content:"Timestamp"},{heading:"case-study---log-data-and-timeseries-data",content:"Log event"},{heading:"case-study---log-data-and-timeseries-data",content:"Value/message"},{heading:"case-study---log-data-and-timeseries-data",content:"We can store them in an HBase table called LOG_DATA, but what will the rowkey be? From these attributes the rowkey will be some combination of hostname, timestamp, and log-event - but what specifically?"},{heading:"timestamp-in-the-rowkey-lead-position",content:"The rowkey [timestamp][hostname][log-event] suffers from the monotonically increasing rowkey problem described in Monotonically Increasing Row Keys/Timeseries Data."},{heading:"timestamp-in-the-rowkey-lead-position",content:'There is another pattern frequently mentioned in the dist-lists about "bucketing" timestamps, by performing a mod operation on the timestamp. If time-oriented scans are important, this could be a useful approach. Attention must be paid to the number of buckets, because this will require the same number of scans to return results.'},{heading:"timestamp-in-the-rowkey-lead-position",content:"to construct:"},{heading:"timestamp-in-the-rowkey-lead-position",content:"As stated above, to select data for a particular timerange, a Scan will need to be performed for each bucket. 100 buckets, for example, will provide a wide distribution in the keyspace but it will require 100 Scans to obtain data for a single timestamp, so there are trade-offs."},{heading:"host-in-the-rowkey-lead-position",content:"The rowkey [hostname][log-event][timestamp] is a candidate if there is a large-ish number of hosts to spread the writes and reads across the keyspace. This approach would be useful if scanning by hostname was a priority."},{heading:"timestamp-or-reverse-timestamp",content:"If the most important access path is to pull most recent events, then storing the timestamps as reverse-timestamps (e.g., timestamp = Long.MAX_VALUE – timestamp) will create the property of being able to do a Scan on [hostname][log-event] to obtain the most recently captured events."},{heading:"timestamp-or-reverse-timestamp",content:"Neither approach is wrong, it just depends on what is most appropriate for the situation."},{heading:"timestamp-or-reverse-timestamp",content:"type: info"},{heading:"timestamp-or-reverse-timestamp",content:`HBASE-4811 implements an API to scan a table
or a range within a table in reverse, reducing the need to optimize your schema for forward or
reverse scanning. This feature is available in HBase 0.98 and later. See
Scan.setReversed()
for more information.`},{heading:"variable-length-or-fixed-length-rowkeys",content:"It is critical to remember that rowkeys are stamped on every column in HBase. If the hostname is a and the event type is e1 then the resulting rowkey would be quite small. However, what if the ingested hostname is myserver1.mycompany.com and the event type is com.package1.subpackage2.subsubpackage3.ImportantService?"},{heading:"variable-length-or-fixed-length-rowkeys",content:"It might make sense to use some substitution in the rowkey. There are at least two approaches: hashed and numeric. In the Hostname In The Rowkey Lead Position example, it might look like this:"},{heading:"variable-length-or-fixed-length-rowkeys",content:"Composite Rowkey With Hashes:"},{heading:"variable-length-or-fixed-length-rowkeys",content:"[MD5 hash of hostname] = 16 bytes"},{heading:"variable-length-or-fixed-length-rowkeys",content:"[MD5 hash of event-type] = 16 bytes"},{heading:"variable-length-or-fixed-length-rowkeys",content:"[timestamp] = 8 bytes"},{heading:"variable-length-or-fixed-length-rowkeys",content:"Composite Rowkey With Numeric Substitution:"},{heading:"variable-length-or-fixed-length-rowkeys",content:"For this approach another lookup table would be needed in addition to LOG_DATA, called LOG_TYPES. The rowkey of LOG_TYPES would be:"},{heading:"variable-length-or-fixed-length-rowkeys",content:"[type] (e.g., byte indicating hostname vs. event-type)"},{heading:"variable-length-or-fixed-length-rowkeys",content:"[bytes] variable length bytes for raw hostname or event-type."},{heading:"variable-length-or-fixed-length-rowkeys",content:"A column for this rowkey could be a long with an assigned number, which could be obtained by using an HBase counter"},{heading:"variable-length-or-fixed-length-rowkeys",content:"So the resulting composite rowkey would be:"},{heading:"variable-length-or-fixed-length-rowkeys",content:"[substituted long for hostname] = 8 bytes"},{heading:"variable-length-or-fixed-length-rowkeys",content:"[substituted long for event type] = 8 bytes"},{heading:"variable-length-or-fixed-length-rowkeys",content:"[timestamp] = 8 bytes"},{heading:"variable-length-or-fixed-length-rowkeys",content:"In either the Hash or Numeric substitution approach, the raw values for hostname and event-type can be stored as columns."},{heading:"case-study---log-data-and-timeseries-data-on-steroids",content:"This effectively is the OpenTSDB approach. What OpenTSDB does is re-write data and pack rows into columns for certain time-periods. For a detailed explanation, see: http://opentsdb.net/schema.html, and Lessons Learned from OpenTSDB from HBaseCon2012."},{heading:"case-study---log-data-and-timeseries-data-on-steroids",content:"But this is how the general concept works: data is ingested, for example, in this manner..."},{heading:"case-study---log-data-and-timeseries-data-on-steroids",content:"with separate rowkeys for each detailed event, but is re-written like this..."},{heading:"case-study---log-data-and-timeseries-data-on-steroids",content:"and each of the above events are converted into columns stored with a time-offset relative to the beginning timerange (e.g., every 5 minutes). This is obviously a very advanced processing technique, but HBase makes this possible."},{heading:"case-study---customerorder",content:"Assume that HBase is used to store customer and order information. There are two core record-types being ingested: a Customer record type, and Order record type."},{heading:"case-study---customerorder",content:"The Customer record type would include all the things that you'd typically expect:"},{heading:"case-study---customerorder",content:"Customer number"},{heading:"case-study---customerorder",content:"Customer name"},{heading:"case-study---customerorder",content:"Address (e.g., city, state, zip)"},{heading:"case-study---customerorder",content:"Phone numbers, etc."},{heading:"case-study---customerorder",content:"The Order record type would include things like:"},{heading:"case-study---customerorder",content:"Customer number"},{heading:"case-study---customerorder",content:"Order number"},{heading:"case-study---customerorder",content:"Sales date"},{heading:"case-study---customerorder",content:"A series of nested objects for shipping locations and line-items (see Order Object Design for details)"},{heading:"case-study---customerorder",content:"Assuming that the combination of customer number and sales order uniquely identify an order, these two attributes will compose the rowkey, and specifically a composite key such as:"},{heading:"case-study---customerorder",content:"for an ORDER table. However, there are more design decisions to make: are the raw values the best choices for rowkeys?"},{heading:"case-study---customerorder",content:"The same design questions in the Log Data use-case confront us here. What is the keyspace of the customer number, and what is the format (e.g., numeric? alphanumeric?) As it is advantageous to use fixed-length keys in HBase, as well as keys that can support a reasonable spread in the keyspace, similar options appear:"},{heading:"case-study---customerorder",content:"Composite Rowkey With Hashes:"},{heading:"case-study---customerorder",content:"[MD5 of customer number] = 16 bytes"},{heading:"case-study---customerorder",content:"[MD5 of order number] = 16 bytes"},{heading:"case-study---customerorder",content:"Composite Numeric/Hash Combo Rowkey:"},{heading:"case-study---customerorder",content:"[substituted long for customer number] = 8 bytes"},{heading:"case-study---customerorder",content:"[MD5 of order number] = 16 bytes"},{heading:"single-table-multiple-tables",content:"A traditional design approach would have separate tables for CUSTOMER and SALES. Another option is to pack multiple record types into a single table (e.g., CUSTOMER++)."},{heading:"single-table-multiple-tables",content:"Customer Record Type Rowkey:"},{heading:"single-table-multiple-tables",content:"[customer-id]"},{heading:"single-table-multiple-tables",content:"[type] = type indicating 1 for customer record type"},{heading:"single-table-multiple-tables",content:"Order Record Type Rowkey:"},{heading:"single-table-multiple-tables",content:"[customer-id]"},{heading:"single-table-multiple-tables",content:"[type] = type indicating 2 for order record type"},{heading:"single-table-multiple-tables",content:"[order]"},{heading:"single-table-multiple-tables",content:"The advantage of this particular CUSTOMER++ approach is that organizes many different record-types by customer-id (e.g., a single scan could get you everything about that customer). The disadvantage is that it's not as easy to scan for a particular record-type."},{heading:"order-object-design",content:"Now we need to address how to model the Order object. Assume that the class structure is as follows:"},{heading:"order-toc",content:"an Order can have multiple ShippingLocations"},{heading:"lineitem-toc",content:"a ShippingLocation can have multiple LineItems"},{heading:"lineitem-toc",content:"there are multiple options on storing this data."},{heading:"completely-normalized",content:"With this approach, there would be separate tables for ORDER, SHIPPING_LOCATION, and LINE_ITEM."},{heading:"completely-normalized",content:"The ORDER table's rowkey was described above: schema.casestudies.custorder"},{heading:"completely-normalized",content:"The SHIPPING_LOCATION's composite rowkey would be something like this:"},{heading:"completely-normalized",content:"[order-rowkey]"},{heading:"completely-normalized",content:"[shipping location number] (e.g., 1st location, 2nd, etc.)"},{heading:"completely-normalized",content:"The LINE_ITEM table's composite rowkey would be something like this:"},{heading:"completely-normalized",content:"[order-rowkey]"},{heading:"completely-normalized",content:"[shipping location number] (e.g., 1st location, 2nd, etc.)"},{heading:"completely-normalized",content:"[line item number] (e.g., 1st lineitem, 2nd, etc.)"},{heading:"completely-normalized",content:"Such a normalized model is likely to be the approach with an RDBMS, but that's not your only option with HBase. The cons of such an approach is that to retrieve information about any Order, you will need:"},{heading:"completely-normalized",content:"Get on the ORDER table for the Order"},{heading:"completely-normalized",content:"Scan on the SHIPPING_LOCATION table for that order to get the ShippingLocation instances"},{heading:"completely-normalized",content:"Scan on the LINE_ITEM for each ShippingLocation"},{heading:"completely-normalized",content:"granted, this is what an RDBMS would do under the covers anyway, but since there are no joins in HBase you're just more aware of this fact."},{heading:"single-table-with-record-types",content:"With this approach, there would exist a single table ORDER that would contain"},{heading:"single-table-with-record-types",content:"The Order rowkey was described above: schema.casestudies.custorder"},{heading:"single-table-with-record-types",content:"[order-rowkey]"},{heading:"single-table-with-record-types",content:"[ORDER record type]"},{heading:"single-table-with-record-types",content:"The ShippingLocation composite rowkey would be something like this:"},{heading:"single-table-with-record-types",content:"[order-rowkey]"},{heading:"single-table-with-record-types",content:"[SHIPPING record type]"},{heading:"single-table-with-record-types",content:"[shipping location number] (e.g., 1st location, 2nd, etc.)"},{heading:"single-table-with-record-types",content:"The LineItem composite rowkey would be something like this:"},{heading:"single-table-with-record-types",content:"[order-rowkey]"},{heading:"single-table-with-record-types",content:"[LINE record type]"},{heading:"single-table-with-record-types",content:"[shipping location number] (e.g., 1st location, 2nd, etc.)"},{heading:"single-table-with-record-types",content:"[line item number] (e.g., 1st lineitem, 2nd, etc.)"},{heading:"denormalized",content:"A variant of the Single Table With Record Types approach is to denormalize and flatten some of the object hierarchy, such as collapsing the ShippingLocation attributes onto each LineItem instance."},{heading:"denormalized",content:"The LineItem composite rowkey would be something like this:"},{heading:"denormalized",content:"[order-rowkey]"},{heading:"denormalized",content:"[LINE record type]"},{heading:"denormalized",content:"[line item number] (e.g., 1st lineitem, 2nd, etc., care must be taken that there are unique across the entire order)"},{heading:"denormalized",content:"and the LineItem columns would be something like this:"},{heading:"denormalized",content:"itemNumber"},{heading:"denormalized",content:"quantity"},{heading:"denormalized",content:"price"},{heading:"denormalized",content:"shipToLine1 (denormalized from ShippingLocation)"},{heading:"denormalized",content:"shipToLine2 (denormalized from ShippingLocation)"},{heading:"denormalized",content:"shipToCity (denormalized from ShippingLocation)"},{heading:"denormalized",content:"shipToState (denormalized from ShippingLocation)"},{heading:"denormalized",content:"shipToZip (denormalized from ShippingLocation)"},{heading:"denormalized",content:"The pros of this approach include a less complex object hierarchy, but one of the cons is that updating gets more complicated in case any of this information changes."},{heading:"object-blob",content:`With this approach, the entire Order object graph is treated, in one way or another, as a BLOB. For example, the ORDER table's rowkey was described above: schema.casestudies.custorder, and a single column called "order" would contain an object that could be deserialized that contained a container Order, ShippingLocations, and LineItems.`},{heading:"object-blob",content:"There are many options here: JSON, XML, Java Serialization, Avro, Hadoop Writables, etc. All of them are variants of the same approach: encode the object graph to a byte-array. Care should be taken with this approach to ensure backward compatibility in case the object model changes such that older persisted structures can still be read back out of HBase."},{heading:"object-blob",content:"Pros are being able to manage complex object graphs with minimal I/O (e.g., a single HBase Get per Order in this example), but the cons include the aforementioned warning about backward compatibility of serialization, language dependencies of serialization (e.g., Java Serialization only works with Java clients), the fact that you have to deserialize the entire object to get any piece of information inside the BLOB, and the difficulty in getting frameworks like Hive to work with custom objects like this."},{heading:"case-study---tallwidemiddle-schema-design-smackdown",content:"This section will describe additional schema design questions that appear on the dist-list, specifically about tall and wide tables. These are general guidelines and not laws - each application must consider its own needs."},{heading:"rows-vs-versions",content:`A common question is whether one should prefer rows or HBase's built-in-versioning. The context is typically where there are "a lot" of versions of a row to be retained (e.g., where it is significantly above the HBase default of 1 max versions). The rows-approach would require storing a timestamp in some portion of the rowkey so that they would not overwrite with each successive update.`},{heading:"rows-vs-versions",content:"Preference: Rows (generally speaking)."},{heading:"rows-vs-columns",content:"Another common question is whether one should prefer rows or columns. The context is typically in extreme cases of wide tables, such as having 1 row with 1 million attributes, or 1 million rows with 1 columns apiece."},{heading:"rows-vs-columns",content:'Preference: Rows (generally speaking). To be clear, this guideline is in the context is in extremely wide cases, not in the standard use-case where one needs to store a few dozen or hundred columns. But there is also a middle path between these two options, and that is "Rows as Columns."'},{heading:"rows-as-columns",content:"The middle path between Rows vs. Columns is packing data that would be a separate row into columns, for certain rows. OpenTSDB is the best example of this case where a single row represents a defined time-range, and then discrete events are treated as columns. This approach is often more complex, and may require the additional complexity of re-writing your data, but has the advantage of being I/O efficient. For an overview of this approach, see schema.casestudies.log-steroids."},{heading:"case-study---list-data",content:"The following is an exchange from the user dist-list regarding a fairly common question: how to handle per-user list data in Apache HBase."},{heading:"case-study---list-data",content:"QUESTION *"},{heading:"case-study---list-data",content:"We're looking at how to store a large amount of (per-user) list data in HBase, and we were trying to figure out what kind of access pattern made the most sense. One option is store the majority of the data in a key, so we could have something like:"},{heading:"case-study---list-data",content:"The other option we had was to do this entirely using:"},{heading:"case-study---list-data",content:"where each row would contain multiple values. So in one case reading the first thirty values would be:"},{heading:"case-study---list-data",content:"And in the second case it would be"},{heading:"case-study---list-data",content:"The general usage pattern would be to read only the first 30 values of these lists, with infrequent access reading deeper into the lists. Some users would have ⇐ 30 total values in these lists, and some users would have millions (i.e. power-law distribution)"},{heading:"case-study---list-data",content:"The single-value format seems like it would take up more space on HBase, but would offer some improved retrieval / pagination flexibility. Would there be any significant performance advantages to be able to paginate via gets vs paginating with scans?"},{heading:"case-study---list-data",content:"My initial understanding was that doing a scan should be faster if our paging size is unknown (and caching is set appropriately), but that gets should be faster if we'll always need the same page size. I've ended up hearing different people tell me opposite things about performance. I assume the page sizes would be relatively consistent, so for most use cases we could guarantee that we only wanted one page of data in the fixed-page-length case. I would also assume that we would have infrequent updates, but may have inserts into the middle of these lists (meaning we'd need to update all subsequent rows)."},{heading:"case-study---list-data",content:"Thanks for help / suggestions / follow-up questions."},{heading:"case-study---list-data",content:"ANSWER *"},{heading:"case-study---list-data",content:`If I understand you correctly, you're ultimately trying to store triples in the form "user, valueid, value", right? E.g., something like:`},{heading:"case-study---list-data",content:"(But the usernames are fixed width, and the valueids are fixed width)."},{heading:"case-study---list-data",content:'And, your access pattern is along the lines of: "for user X, list the next 30 values, starting with valueid Y". Is that right? And these values should be returned sorted by valueid?'},{heading:"case-study---list-data",content:"The tl;dr version is that you should probably go with one row per user+value, and not build a complicated intra-row pagination scheme on your own unless you're really sure it is needed."},{heading:"case-study---list-data",content:`Your two options mirror a common question people have when designing HBase schemas: should I go "tall" or "wide"? Your first schema is "tall": each row represents one value for one user, and so there are many rows in the table for each user; the row key is user + valueid, and there would be (presumably) a single column qualifier that means "the value". This is great if you want to scan over rows in sorted order by row key (thus my question above, about whether these ids are sorted correctly). You can start a scan at any user+valueid, read the next 30, and be done. What you're giving up is the ability to have transactional guarantees around all the rows for one user, but it doesn't sound like you need that. Doing it this way is generally recommended (see here).`},{heading:"case-study---list-data",content:`Your second option is "wide": you store a bunch of values in one row, using different qualifiers (where the qualifier is the valueid). The simple way to do that would be to just store ALL values for one user in a single row. I'm guessing you jumped to the "paginated" version because you're assuming that storing millions of columns in a single row would be bad for performance, which may or may not be true; as long as you're not trying to do too much in a single request, or do things like scanning over and returning all of the cells in the row, it shouldn't be fundamentally worse. The client has methods that allow you to get specific slices of columns.`},{heading:"case-study---list-data",content:`Note that neither case fundamentally uses more disk space than the other; you're just "shifting" part of the identifying information for a value either to the left (into the row key, in option one) or to the right (into the column qualifiers in option 2). Under the covers, every key/value still stores the whole row key, and column family name. (If this is a bit confusing, take an hour and watch Lars George's excellent video about understanding HBase schema design: http://www.youtube.com/watch?v=_HLoH_PgrLk).`},{heading:"case-study---list-data",content:"A manually paginated version has lots more complexities, as you note, like having to keep track of how many things are in each page, re-shuffling if new values are inserted, etc. That seems significantly more complex. It might have some slight speed advantages (or disadvantages!) at extremely high throughput, and the only way to really know that would be to try it out. If you don't have time to build it both ways and compare, my advice would be to start with the simplest option (one row per user+value). Start simple and iterate! :)"},{heading:"tune-hbase-server-rpc-handling",content:"Set hbase.regionserver.handler.count (in hbase-site.xml) to cores x spindles for concurrency."},{heading:"tune-hbase-server-rpc-handling",content:"Optionally, split the call queues into separate read and write queues for differentiated service. The parameter hbase.ipc.server.callqueue.handler.factor specifies the number of call queues:"},{heading:"tune-hbase-server-rpc-handling",content:"0 means a single shared queue"},{heading:"tune-hbase-server-rpc-handling",content:"1 means one queue for each handler."},{heading:"tune-hbase-server-rpc-handling",content:"A value between 0 and 1 allocates the number of queues proportionally to the number of handlers. For instance, a value of .5 shares one queue between each two handlers."},{heading:"tune-hbase-server-rpc-handling",content:"Use hbase.ipc.server.callqueue.read.ratio (hbase.ipc.server.callqueue.read.share in 0.98) to split the call queues into read and write queues:"},{heading:"tune-hbase-server-rpc-handling",content:"0.5 means there will be the same number of read and write queues"},{heading:"tune-hbase-server-rpc-handling",content:"< 0.5 for more write than read"},{heading:"tune-hbase-server-rpc-handling",content:"> 0.5 for more read than write"},{heading:"tune-hbase-server-rpc-handling",content:"Set hbase.ipc.server.callqueue.scan.ratio (HBase 1.0+) to split read call queues into small-read and long-read queues:"},{heading:"tune-hbase-server-rpc-handling",content:"0.5 means that there will be the same number of short-read and long-read queues"},{heading:"tune-hbase-server-rpc-handling",content:"< 0.5 for more short-read"},{heading:"tune-hbase-server-rpc-handling",content:"> 0.5 for more long-read"},{heading:"disable-nagle-for-rpc",content:"Disable Nagle's algorithm. Delayed ACKs can add up to ~200ms to RPC round trip time. Set the following parameters:"},{heading:"disable-nagle-for-rpc",content:"In Hadoop's core-site.xml:"},{heading:"disable-nagle-for-rpc",content:"ipc.server.tcpnodelay = true"},{heading:"disable-nagle-for-rpc",content:"ipc.client.tcpnodelay = true"},{heading:"disable-nagle-for-rpc",content:"In HBase's hbase-site.xml:"},{heading:"disable-nagle-for-rpc",content:"hbase.ipc.client.tcpnodelay = true"},{heading:"disable-nagle-for-rpc",content:"hbase.ipc.server.tcpnodelay = true"},{heading:"limit-server-failure-impact",content:"Detect regionserver failure as fast as reasonable. Set the following parameters:"},{heading:"limit-server-failure-impact",content:"In hbase-site.xml, set zookeeper.session.timeout to 30 seconds or less to bound failure detection (20-30 seconds is a good start)."},{heading:"limit-server-failure-impact",content:"Note: Zookeeper clients negotiate a session timeout with the server during client init. Server enforces this timeout to be in the range [minSessionTimeout, maxSessionTimeout] and both these timeouts (measured in milliseconds) are configurable in Zookeeper service configuration. If not configured, these default to 2 * tickTime and 20 * tickTime respectively (tickTime is the basic time unit used by ZooKeeper, as measured in milliseconds. It is used to regulate heartbeats, timeouts etc.). Refer to Zookeeper documentation for additional details."},{heading:"limit-server-failure-impact",content:"Detect and avoid unhealthy or failed HDFS DataNodes: in hdfs-site.xml and hbase-site.xml, set the following parameters:"},{heading:"limit-server-failure-impact",content:"dfs.namenode.avoid.read.stale.datanode = true"},{heading:"limit-server-failure-impact",content:"dfs.namenode.avoid.write.stale.datanode = true"},{heading:"optimize-on-the-server-side-for-low-latency",content:"Skip the network for local blocks when the RegionServer goes to read from HDFS by exploiting HDFS's Short-Circuit Local Reads facility. Note how setup must be done both at the datanode and on the dfsclient ends of the conneciton — i.e. at the RegionServer and how both ends need to have loaded the hadoop native .so library. After configuring your hadoop setting dfs.client.read.shortcircuit to true and configuring the dfs.domain.socket.path path for the datanode and dfsclient to share and restarting, next configure the regionserver/dfsclient side."},{heading:"optimize-on-the-server-side-for-low-latency",content:"In hbase-site.xml, set the following parameters:"},{heading:"optimize-on-the-server-side-for-low-latency",content:"dfs.client.read.shortcircuit = true"},{heading:"optimize-on-the-server-side-for-low-latency",content:"dfs.client.read.shortcircuit.skip.checksum = true so we don't double checksum (HBase does its own checksumming to save on i/os)."},{heading:"optimize-on-the-server-side-for-low-latency",content:"dfs.domain.socket.path to match what was set for the datanodes."},{heading:"optimize-on-the-server-side-for-low-latency",content:"dfs.client.read.shortcircuit.buffer.size = 131072 Important to avoid OOME — hbase has a default it uses if unset, see hbase.dfs.client.read.shortcircuit.buffer.size; its default is 131072."},{heading:"optimize-on-the-server-side-for-low-latency",content:"Ensure data locality. In hbase-site.xml, set hbase.hstore.min.locality.to.skip.major.compact = 0.7 (Meaning that 0.7 <= n <= 1)"},{heading:"optimize-on-the-server-side-for-low-latency",content:"Make sure DataNodes have enough handlers for block transfers. In hdfs-site.xml, set the following parameters:"},{heading:"optimize-on-the-server-side-for-low-latency",content:"dfs.datanode.max.xcievers >= 8192"},{heading:"optimize-on-the-server-side-for-low-latency",content:"dfs.datanode.handler.count = number of spindles"},{heading:"optimize-on-the-server-side-for-low-latency",content:"Check the RegionServer logs after restart. You should only see complaint if misconfiguration. Otherwise, shortcircuit read operates quietly in background. It does not provide metrics so no optics on how effective it is but read latencies should show a marked improvement, especially if good data locality, lots of random reads, and dataset is larger than available cache."},{heading:"optimize-on-the-server-side-for-low-latency",content:"Other advanced configurations that you might play with, especially if shortcircuit functionality is complaining in the logs, include dfs.client.read.shortcircuit.streams.cache.size and dfs.client.socketcache.capacity. Documentation is sparse on these options. You'll have to read source code."},{heading:"optimize-on-the-server-side-for-low-latency",content:"RegionServer metric system exposes HDFS short circuit read metrics shortCircuitBytesRead. Other HDFS read metrics, including totalBytesRead (The total number of bytes read from HDFS), localBytesRead (The number of bytes read from the local HDFS DataNode), zeroCopyBytesRead (The number of bytes read through HDFS zero copy) are available and can be used to troubleshoot short-circuit read issues."},{heading:"optimize-on-the-server-side-for-low-latency",content:"For more on short-circuit reads, see Colin's old blog on rollout, How Improved Short-Circuit Local Reads Bring Better Performance and Security to Hadoop. The HDFS-347 issue also makes for an interesting read showing the HDFS community at its best (caveat a few comments)."},{heading:"tune-jvm-gc-for-low-collection-latencies",content:"Use the CMS collector: -XX:+UseConcMarkSweepGC"},{heading:"tune-jvm-gc-for-low-collection-latencies",content:"Keep eden space as small as possible to minimize average collection time. Example:"},{heading:"tune-jvm-gc-for-low-collection-latencies",content:"Optimize for low collection latency rather than throughput: -Xmn512m"},{heading:"tune-jvm-gc-for-low-collection-latencies",content:"Collect eden in parallel: -XX:+UseParNewGC"},{heading:"tune-jvm-gc-for-low-collection-latencies",content:"Avoid collection under pressure: -XX:+UseCMSInitiatingOccupancyOnly"},{heading:"tune-jvm-gc-for-low-collection-latencies",content:"Limit per request scanner result sizing so everything fits into survivor space but doesn't tenure. In hbase-site.xml, set hbase.client.scanner.max.result.size to 1/8th of eden space (with -Xmn512m this is ~51MB )"},{heading:"tune-jvm-gc-for-low-collection-latencies",content:"Set max.result.size x handler.count less than survivor space"},{heading:"os-level-tuning",content:"Turn transparent huge pages (THP) off:"},{heading:"os-level-tuning",content:"Set vm.swappiness = 0"},{heading:"os-level-tuning",content:"Set vm.min_free_kbytes to at least 1GB (8GB on larger memory systems)"},{heading:"os-level-tuning",content:"Disable NUMA zone reclaim with vm.zone_reclaim_mode = 0"},{heading:"for-applications-where-failing-quickly-is-better-than-waiting",content:"In hbase-site.xml on the client side, set the following parameters:"},{heading:"for-applications-where-failing-quickly-is-better-than-waiting",content:"Set hbase.client.pause = 1000"},{heading:"for-applications-where-failing-quickly-is-better-than-waiting",content:"Set hbase.client.retries.number = 3"},{heading:"for-applications-where-failing-quickly-is-better-than-waiting",content:"If you want to ride over splits and region moves, increase hbase.client.retries.number substantially (>= 20)"},{heading:"for-applications-where-failing-quickly-is-better-than-waiting",content:"Set the RecoverableZookeeper retry count: zookeeper.recovery.retry = 1 (no retry)"},{heading:"for-applications-where-failing-quickly-is-better-than-waiting",content:"In hbase-site.xml on the server side, set the Zookeeper session timeout for detecting server failures: zookeeper.session.timeout ⇐ 30 seconds (20-30 is good)."},{heading:"for-applications-that-can-tolerate-slightly-out-of-date-information",content:"HBase timeline consistency (HBASE-10070) With read replicas enabled, read-only copies of regions (replicas) are distributed over the cluster. One RegionServer services the default or primary replica, which is the only replica that can service writes. Other RegionServers serve the secondary replicas, follow the primary RegionServer, and only see committed updates. The secondary replicas are read-only, but can serve reads immediately while the primary is failing over, cutting read availability blips from seconds to milliseconds. Phoenix supports timeline consistency as of 4.4.0 Tips:"},{heading:"for-applications-that-can-tolerate-slightly-out-of-date-information",content:"Deploy HBase 1.0.0 or later."},{heading:"for-applications-that-can-tolerate-slightly-out-of-date-information",content:"Enable timeline consistent replicas on the server side."},{heading:"for-applications-that-can-tolerate-slightly-out-of-date-information",content:"Use one of the following methods to set timeline consistency:"},{heading:"for-applications-that-can-tolerate-slightly-out-of-date-information",content:"Use ALTER SESSION SET CONSISTENCY = 'TIMELINE'"},{heading:"for-applications-that-can-tolerate-slightly-out-of-date-information",content:"Set the connection property Consistency to timeline in the JDBC connect string"},{heading:"more-information",content:"See the Performance section perf.schema for more information about operational and performance schema design options, such as Bloom Filters, Table-configured regionsizes, compression, and blocksizes."}],headings:[{id:"on-the-number-of-column-families",content:"On the number of column families"},{id:"cardinality-of-columnfamilies",content:"Cardinality of ColumnFamilies"},{id:"rowkey-design",content:"Rowkey Design"},{id:"hotspotting",content:"Hotspotting"},{id:"salting-toc",content:"Salting [!toc]"},{id:"salting-example-toc",content:"Salting Example: [!toc]"},{id:"hashing-toc",content:"Hashing [!toc]"},{id:"hashing-example-toc",content:"Hashing Example: [!toc]"},{id:"reversing-the-key-toc",content:"Reversing the Key [!toc]"},{id:"monotonically-increasing-row-keystimeseries-data",content:"Monotonically Increasing Row Keys/Timeseries Data"},{id:"try-to-minimize-row-and-column-sizes",content:"Try to minimize row and column sizes"},{id:"column-families",content:"Column Families"},{id:"attributes",content:"Attributes"},{id:"rowkey-length",content:"Rowkey Length"},{id:"byte-patterns",content:"Byte Patterns"},{id:"reverse-timestamps",content:"Reverse Timestamps"},{id:"rowkeys-and-columnfamilies",content:"Rowkeys and ColumnFamilies"},{id:"immutability-of-rowkeys",content:"Immutability of Rowkeys"},{id:"relationship-between-rowkeys-and-region-splits",content:"Relationship Between RowKeys and Region Splits"},{id:"number-of-versions",content:"Number of Versions"},{id:"maximum-number-of-versions",content:"Maximum Number of Versions"},{id:"minimum-number-of-versions",content:"Minimum Number of Versions"},{id:"supported-datatypes",content:"Supported Datatypes"},{id:"counters",content:"Counters"},{id:"regionserver-sizing-joins",content:"Joins"},{id:"time-to-live-ttl",content:"Time To Live (TTL)"},{id:"keeping-deleted-cells",content:"Keeping Deleted Cells"},{id:"change-the-value-of-keep_deleted_cells-using-hbase-shell-toc",content:"Change the Value of KEEP_DELETED_CELLS Using HBase Shell: [!toc]"},{id:"change-the-value-of-keep_deleted_cells-using-the-api-toc",content:"Change the Value of KEEP_DELETED_CELLS Using the API: [!toc]"},{id:"secondary-indexes-and-alternate-query-paths",content:"Secondary Indexes and Alternate Query Paths"},{id:"filter-query",content:"Filter Query"},{id:"periodic-update-secondary-index",content:"Periodic-Update Secondary Index"},{id:"dual-write-secondary-index",content:"Dual-Write Secondary Index"},{id:"summary-tables",content:"Summary Tables"},{id:"coprocessor-secondary-index",content:"Coprocessor Secondary Index"},{id:"regionserver-sizing-constraints",content:"Constraints"},{id:"schema-design-case-studies",content:"Schema Design Case Studies"},{id:"case-study---log-data-and-timeseries-data",content:"Case Study - Log Data and Timeseries Data"},{id:"timestamp-in-the-rowkey-lead-position",content:"Timestamp In The Rowkey Lead Position"},{id:"host-in-the-rowkey-lead-position",content:"Host In The Rowkey Lead Position"},{id:"timestamp-or-reverse-timestamp",content:"Timestamp, or Reverse Timestamp?"},{id:"variable-length-or-fixed-length-rowkeys",content:"Variable Length or Fixed Length Rowkeys?"},{id:"case-study---log-data-and-timeseries-data-on-steroids",content:"Case Study - Log Data and Timeseries Data on Steroids"},{id:"case-study---customerorder",content:"Case Study - Customer/Order"},{id:"single-table-multiple-tables",content:"Single Table? Multiple Tables?"},{id:"order-object-design",content:"Order Object Design"},{id:"order-toc",content:"Order [!toc]"},{id:"lineitem-toc",content:"LineItem [!toc]"},{id:"completely-normalized",content:"Completely Normalized"},{id:"single-table-with-record-types",content:"Single Table With Record Types"},{id:"denormalized",content:"Denormalized"},{id:"object-blob",content:"Object BLOB"},{id:"case-study---tallwidemiddle-schema-design-smackdown",content:'Case Study - "Tall/Wide/Middle" Schema Design Smackdown'},{id:"rows-vs-versions",content:"Rows vs. Versions"},{id:"rows-vs-columns",content:"Rows vs. Columns"},{id:"rows-as-columns",content:"Rows as Columns"},{id:"case-study---list-data",content:"Case Study - List Data"},{id:"operational-and-performance-configuration-options",content:"Operational and Performance Configuration Options"},{id:"tune-hbase-server-rpc-handling",content:"Tune HBase Server RPC Handling"},{id:"disable-nagle-for-rpc",content:"Disable Nagle for RPC"},{id:"limit-server-failure-impact",content:"Limit Server Failure Impact"},{id:"optimize-on-the-server-side-for-low-latency",content:"Optimize on the Server Side for Low Latency"},{id:"jvm-tuning",content:"JVM Tuning"},{id:"tune-jvm-gc-for-low-collection-latencies",content:"Tune JVM GC for low collection latencies"},{id:"os-level-tuning",content:"OS-Level Tuning"},{id:"special-cases",content:"Special Cases"},{id:"for-applications-where-failing-quickly-is-better-than-waiting",content:"For applications where failing quickly is better than waiting"},{id:"for-applications-that-can-tolerate-slightly-out-of-date-information",content:"For applications that can tolerate slightly out of date information"},{id:"more-information",content:"More Information"}]};const c=[{depth:2,url:"#on-the-number-of-column-families",title:e.jsx(e.Fragment,{children:"On the number of column families"})},{depth:3,url:"#cardinality-of-columnfamilies",title:e.jsx(e.Fragment,{children:"Cardinality of ColumnFamilies"})},{depth:2,url:"#rowkey-design",title:e.jsx(e.Fragment,{children:"Rowkey Design"})},{depth:3,url:"#hotspotting",title:e.jsx(e.Fragment,{children:"Hotspotting"})},{depth:3,url:"#monotonically-increasing-row-keystimeseries-data",title:e.jsx(e.Fragment,{children:"Monotonically Increasing Row Keys/Timeseries Data"})},{depth:3,url:"#try-to-minimize-row-and-column-sizes",title:e.jsx(e.Fragment,{children:"Try to minimize row and column sizes"})},{depth:4,url:"#column-families",title:e.jsx(e.Fragment,{children:"Column Families"})},{depth:4,url:"#attributes",title:e.jsx(e.Fragment,{children:"Attributes"})},{depth:4,url:"#rowkey-length",title:e.jsx(e.Fragment,{children:"Rowkey Length"})},{depth:4,url:"#byte-patterns",title:e.jsx(e.Fragment,{children:"Byte Patterns"})},{depth:3,url:"#reverse-timestamps",title:e.jsx(e.Fragment,{children:"Reverse Timestamps"})},{depth:3,url:"#rowkeys-and-columnfamilies",title:e.jsx(e.Fragment,{children:"Rowkeys and ColumnFamilies"})},{depth:3,url:"#immutability-of-rowkeys",title:e.jsx(e.Fragment,{children:"Immutability of Rowkeys"})},{depth:3,url:"#relationship-between-rowkeys-and-region-splits",title:e.jsx(e.Fragment,{children:"Relationship Between RowKeys and Region Splits"})},{depth:2,url:"#number-of-versions",title:e.jsx(e.Fragment,{children:"Number of Versions"})},{depth:3,url:"#maximum-number-of-versions",title:e.jsx(e.Fragment,{children:"Maximum Number of Versions"})},{depth:3,url:"#minimum-number-of-versions",title:e.jsx(e.Fragment,{children:"Minimum Number of Versions"})},{depth:2,url:"#supported-datatypes",title:e.jsx(e.Fragment,{children:"Supported Datatypes"})},{depth:3,url:"#counters",title:e.jsx(e.Fragment,{children:"Counters"})},{depth:2,url:"#regionserver-sizing-joins",title:e.jsx(e.Fragment,{children:"Joins"})},{depth:2,url:"#time-to-live-ttl",title:e.jsx(e.Fragment,{children:"Time To Live (TTL)"})},{depth:2,url:"#keeping-deleted-cells",title:e.jsx(e.Fragment,{children:"Keeping Deleted Cells"})},{depth:2,url:"#secondary-indexes-and-alternate-query-paths",title:e.jsx(e.Fragment,{children:"Secondary Indexes and Alternate Query Paths"})},{depth:3,url:"#filter-query",title:e.jsx(e.Fragment,{children:"Filter Query"})},{depth:3,url:"#periodic-update-secondary-index",title:e.jsx(e.Fragment,{children:"Periodic-Update Secondary Index"})},{depth:3,url:"#dual-write-secondary-index",title:e.jsx(e.Fragment,{children:"Dual-Write Secondary Index"})},{depth:3,url:"#summary-tables",title:e.jsx(e.Fragment,{children:"Summary Tables"})},{depth:3,url:"#coprocessor-secondary-index",title:e.jsx(e.Fragment,{children:"Coprocessor Secondary Index"})},{depth:2,url:"#regionserver-sizing-constraints",title:e.jsx(e.Fragment,{children:"Constraints"})},{depth:2,url:"#schema-design-case-studies",title:e.jsx(e.Fragment,{children:"Schema Design Case Studies"})},{depth:3,url:"#case-study---log-data-and-timeseries-data",title:e.jsx(e.Fragment,{children:"Case Study - Log Data and Timeseries Data"})},{depth:4,url:"#timestamp-in-the-rowkey-lead-position",title:e.jsx(e.Fragment,{children:"Timestamp In The Rowkey Lead Position"})},{depth:4,url:"#host-in-the-rowkey-lead-position",title:e.jsx(e.Fragment,{children:"Host In The Rowkey Lead Position"})},{depth:4,url:"#timestamp-or-reverse-timestamp",title:e.jsx(e.Fragment,{children:"Timestamp, or Reverse Timestamp?"})},{depth:4,url:"#variable-length-or-fixed-length-rowkeys",title:e.jsx(e.Fragment,{children:"Variable Length or Fixed Length Rowkeys?"})},{depth:3,url:"#case-study---log-data-and-timeseries-data-on-steroids",title:e.jsx(e.Fragment,{children:"Case Study - Log Data and Timeseries Data on Steroids"})},{depth:3,url:"#case-study---customerorder",title:e.jsx(e.Fragment,{children:"Case Study - Customer/Order"})},{depth:4,url:"#single-table-multiple-tables",title:e.jsx(e.Fragment,{children:"Single Table? Multiple Tables?"})},{depth:4,url:"#order-object-design",title:e.jsx(e.Fragment,{children:"Order Object Design"})},{depth:5,url:"#completely-normalized",title:e.jsx(e.Fragment,{children:"Completely Normalized"})},{depth:4,url:"#single-table-with-record-types",title:e.jsx(e.Fragment,{children:"Single Table With Record Types"})},{depth:4,url:"#denormalized",title:e.jsx(e.Fragment,{children:"Denormalized"})},{depth:4,url:"#object-blob",title:e.jsx(e.Fragment,{children:"Object BLOB"})},{depth:3,url:"#case-study---tallwidemiddle-schema-design-smackdown",title:e.jsx(e.Fragment,{children:'Case Study - "Tall/Wide/Middle" Schema Design Smackdown'})},{depth:4,url:"#rows-vs-versions",title:e.jsx(e.Fragment,{children:"Rows vs. Versions"})},{depth:4,url:"#rows-vs-columns",title:e.jsx(e.Fragment,{children:"Rows vs. Columns"})},{depth:4,url:"#rows-as-columns",title:e.jsx(e.Fragment,{children:"Rows as Columns"})},{depth:3,url:"#case-study---list-data",title:e.jsx(e.Fragment,{children:"Case Study - List Data"})},{depth:2,url:"#operational-and-performance-configuration-options",title:e.jsx(e.Fragment,{children:"Operational and Performance Configuration Options"})},{depth:3,url:"#tune-hbase-server-rpc-handling",title:e.jsx(e.Fragment,{children:"Tune HBase Server RPC Handling"})},{depth:3,url:"#disable-nagle-for-rpc",title:e.jsx(e.Fragment,{children:"Disable Nagle for RPC"})},{depth:3,url:"#limit-server-failure-impact",title:e.jsx(e.Fragment,{children:"Limit Server Failure Impact"})},{depth:3,url:"#optimize-on-the-server-side-for-low-latency",title:e.jsx(e.Fragment,{children:"Optimize on the Server Side for Low Latency"})},{depth:3,url:"#jvm-tuning",title:e.jsx(e.Fragment,{children:"JVM Tuning"})},{depth:4,url:"#tune-jvm-gc-for-low-collection-latencies",title:e.jsx(e.Fragment,{children:"Tune JVM GC for low collection latencies"})},{depth:4,url:"#os-level-tuning",title:e.jsx(e.Fragment,{children:"OS-Level Tuning"})},{depth:2,url:"#special-cases",title:e.jsx(e.Fragment,{children:"Special Cases"})},{depth:3,url:"#for-applications-where-failing-quickly-is-better-than-waiting",title:e.jsx(e.Fragment,{children:"For applications where failing quickly is better than waiting"})},{depth:3,url:"#for-applications-that-can-tolerate-slightly-out-of-date-information",title:e.jsx(e.Fragment,{children:"For applications that can tolerate slightly out of date information"})},{depth:3,url:"#more-information",title:e.jsx(e.Fragment,{children:"More Information"})}];function n(s){const i={a:"a",blockquote:"blockquote",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",h5:"h5",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components},{Callout:t}=i;return t||a("Callout"),e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["Lars Hofhansl wrote a great ",e.jsx(i.a,{href:"http://hadoop-hbase.blogspot.com/2013/01/hbase-region-server-memory-sizing.html",children:"blog post"})," about RegionServer memory sizing. The upshot is that you probably need more memory than you think you need. He goes into the impact of region size, memstore size, HDFS replication factor, and other things to check."]}),`
`,e.jsxs(i.blockquote,{children:[`
`,e.jsx(i.p,{children:"Personally I would place the maximum disk space per machine that can be served exclusively with HBase around 6T, unless you have a very read-heavy workload. In that case the Java heap should be 32GB (20G regions, 128M memstores, the rest defaults)."}),`
`,e.jsxs(i.p,{children:["— Lars Hofhansl ",e.jsx(i.a,{href:"http://hadoop-hbase.blogspot.com/2013/01/hbase-region-server-memory-sizing.html",children:"http://hadoop-hbase.blogspot.com/2013/01/hbase-region-server-memory-sizing.html"})]}),`
`]}),`
`,e.jsx(i.h2,{id:"on-the-number-of-column-families",children:"On the number of column families"}),`
`,e.jsx(i.p,{children:"HBase currently does not do well with anything above two or three column families so keep the number of column families in your schema low. Currently, flushing is done on a per Region basis so if one column family is carrying the bulk of the data bringing on flushes, the adjacent families will also be flushed even though the amount of data they carry is small. When many column families exist the flushing interaction can make for a bunch of needless i/o (To be addressed by changing flushing to work on a per column family basis). In addition, compactions triggered at table/region level will happen per store too."}),`
`,e.jsx(i.p,{children:"Try to make do with one column family if you can in your schemas. Only introduce a second and third column family in the case where data access is usually column scoped; i.e. you query one column family or the other but usually not both at the one time."}),`
`,e.jsx(i.h3,{id:"cardinality-of-columnfamilies",children:"Cardinality of ColumnFamilies"}),`
`,e.jsx(i.p,{children:"Where multiple ColumnFamilies exist in a single table, be aware of the cardinality (i.e., number of rows). If ColumnFamilyA has 1 million rows and ColumnFamilyB has 1 billion rows, ColumnFamilyA's data will likely be spread across many, many regions (and RegionServers). This makes mass scans for ColumnFamilyA less efficient."}),`
`,e.jsx(i.h2,{id:"rowkey-design",children:"Rowkey Design"}),`
`,e.jsx(i.h3,{id:"hotspotting",children:"Hotspotting"}),`
`,e.jsxs(i.p,{children:["Rows in HBase are sorted lexicographically by row key. This design optimizes for scans, allowing you to store related rows, or rows that will be read together, near each other. However, poorly designed row keys are a common source of ",e.jsx(i.strong,{children:"hotspotting"}),". Hotspotting occurs when a large amount of client traffic is directed at one node, or only a few nodes, of a cluster. This traffic may represent reads, writes, or other operations. The traffic overwhelms the single machine responsible for hosting that region, causing performance degradation and potentially leading to region unavailability. This can also have adverse effects on other regions hosted by the same region server as that host is unable to service the requested load. It is important to design data access patterns such that the cluster is fully and evenly utilized."]}),`
`,e.jsx(i.p,{children:"To prevent hotspotting on writes, design your row keys such that rows that truly do need to be in the same region are, but in the bigger picture, data is being written to multiple regions across the cluster, rather than one at a time. Some common techniques for avoiding hotspotting are described below, along with some of their advantages and drawbacks."}),`
`,e.jsx(i.h4,{id:"salting-toc",children:"Salting"}),`
`,e.jsx(i.p,{children:'Salting in this sense has nothing to do with cryptography, but refers to adding random data to the start of a row key. In this case, salting refers to adding a randomly-assigned prefix to the row key to cause it to sort differently than it otherwise would. The number of possible prefixes correspond to the number of regions you want to spread the data across. Salting can be helpful if you have a few "hot" row key patterns which come up over and over amongst other more evenly-distributed rows. Consider the following example, which shows that salting can spread write load across multiple RegionServers, and illustrates some of the negative implications for reads.'}),`
`,e.jsx(i.h4,{id:"salting-example-toc",children:"Salting Example:"}),`
`,e.jsx(i.p,{children:"Suppose you have the following list of row keys, and your table is split such that there is one region for each letter of the alphabet. Prefix 'a' is one region, prefix 'b' is another. In this table, all rows starting with 'f' are in the same region. This example focuses on rows with keys like the following:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"foo0001"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"foo0002"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"foo0003"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"foo0004"})})]})})}),`
`,e.jsxs(i.p,{children:["Now, imagine that you would like to spread these across four different regions. You decide to use four different salts: ",e.jsx(i.code,{children:"a"}),", ",e.jsx(i.code,{children:"b"}),", ",e.jsx(i.code,{children:"c"}),", and ",e.jsx(i.code,{children:"d"}),". In this scenario, each of these letter prefixes will be on a different region. After applying the salts, you have the following rowkeys instead. Since you can now write to four separate regions, you theoretically have four times the throughput when writing that you would have if all the writes were going to the same region."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"a-foo0003"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"b-foo0001"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"c-foo0004"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"d-foo0002"})})]})})}),`
`,e.jsx(i.p,{children:"Then, if you add another row, it will randomly be assigned one of the four possible salt values and end up near one of the existing rows."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"a-foo0003"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"b-foo0001"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"c-foo0003"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"c-foo0004"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"d-foo0002"})})]})})}),`
`,e.jsx(i.p,{children:"Since this assignment will be random, you will need to do more work if you want to retrieve the rows in lexicographic order. In this way, salting attempts to increase throughput on writes, but has a cost during reads."}),`
`,e.jsx(i.h4,{id:"hashing-toc",children:"Hashing"}),`
`,e.jsxs(i.p,{children:["Instead of a random assignment, you could use a one-way ",e.jsx(i.strong,{children:"hash"}),' that would cause a given row to always be "salted" with the same prefix, in a way that would spread the load across the RegionServers, but allow for predictability during reads. Using a deterministic hash allows the client to reconstruct the complete rowkey and use a Get operation to retrieve that row as normal.']}),`
`,e.jsx(i.h4,{id:"hashing-example-toc",children:"Hashing Example:"}),`
`,e.jsxs(i.p,{children:["Given the same situation in the salting example above, you could instead apply a one-way hash that would cause the row with key ",e.jsx(i.code,{children:"foo0003"})," to always, and predictably, receive the ",e.jsx(i.code,{children:"a"})," prefix. Then, to retrieve that row, you would already know the key. You could also optimize things so that certain pairs of keys were always in the same region, for instance."]}),`
`,e.jsx(i.h4,{id:"reversing-the-key-toc",children:"Reversing the Key"}),`
`,e.jsx(i.p,{children:"A third common trick for preventing hotspotting is to reverse a fixed-width or numeric row key so that the part that changes the most often (the least significant digit) is first. This effectively randomizes row keys, but sacrifices row ordering properties."}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"https://communities.intel.com/community/itpeernetwork/datastack/blog/2013/11/10/discussion-on-designing-hbase-tables",children:"https://communities.intel.com/community/itpeernetwork/datastack/blog/2013/11/10/discussion-on-designing-hbase-tables"}),", and ",e.jsx(i.a,{href:"https://phoenix.apache.org/salted.html",children:"article on Salted Tables"})," from the Phoenix project, and the discussion in the comments of ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-11682",children:"HBASE-11682"})," for more information about avoiding hotspotting."]}),`
`,e.jsx(i.h3,{id:"monotonically-increasing-row-keystimeseries-data",children:"Monotonically Increasing Row Keys/Timeseries Data"}),`
`,e.jsxs(i.p,{children:["In the HBase chapter of Tom White's book ",e.jsx(i.a,{href:"http://oreilly.com/catalog/9780596521981",children:"Hadoop: The Definitive Guide"})," (O'Reilly) there is a an optimization note on watching out for a phenomenon where an import process walks in lock-step with all clients in concert pounding one of the table's regions (and thus, a single node), then moving onto the next region, etc. With monotonically increasing row-keys (i.e., using a timestamp), this will happen. See this comic by IKai Lan on why monotonically increasing row keys are problematic in BigTable-like datastores: ",e.jsx(i.a,{href:"http://ikaisays.com/2011/01/25/app-engine-datastore-tip-monotonically-increasing-values-are-bad/",children:"monotonically increasing values are bad"}),". The pile-up on a single region brought on by monotonically increasing keys can be mitigated by randomizing the input records to not be in sorted order, but in general it's best to avoid using a timestamp or a sequence (e.g. 1, 2, 3) as the row-key."]}),`
`,e.jsxs(i.p,{children:["If you do need to upload time series data into HBase, you should study ",e.jsx(i.a,{href:"http://opentsdb.net/",children:"OpenTSDB"})," as a successful example. It has a page describing the ",e.jsx(i.a,{href:"http://opentsdb.net/schema.html",children:"schema"})," it uses in HBase. The key format in OpenTSDB is effectively [metric_type][event_timestamp], which would appear at first glance to contradict the previous advice about not using a timestamp as the key. However, the difference is that the timestamp is not in the ",e.jsx(i.em,{children:"lead"})," position of the key, and the design assumption is that there are dozens or hundreds (or more) of different metric types. Thus, even with a continual stream of input data with a mix of metric types, the Puts are distributed across various points of regions in the table."]}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/regionserver-sizing#schema-design-case-studies",children:"schema.casestudies"})," for some rowkey design examples."]}),`
`,e.jsx(i.h3,{id:"try-to-minimize-row-and-column-sizes",children:"Try to minimize row and column sizes"}),`
`,e.jsxs(i.p,{children:["In HBase, values are always freighted with their coordinates; as a cell value passes through the system, it'll be accompanied by its row, column name, and timestamp - always. If your rows and column names are large, especially compared to the size of the cell value, then you may run up against some interesting scenarios. One such is the case described by Marc Limotte at the tail of ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-3551?page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel&focusedCommentId=13005272#comment-13005272",children:"HBASE-3551"})," (recommended!). Therein, the indices that are kept on HBase storefiles (see ",e.jsx(i.a,{href:"/docs/hfile-format",children:"HFile Format"}),") to facilitate random access may end up occupying large chunks of the HBase allotted RAM because the cell value coordinates are large. Mark in the above cited comment suggests upping the block size so entries in the store file index happen at a larger interval or modify the table schema so it makes for smaller rows and column names. Compression will also make for larger indices. See the thread ",e.jsx(i.a,{href:"https://lists.apache.org/thread.html/b158eae5d8888d3530be378298bca90c17f80982fdcdfa01d0844c3d%401306240189%40%3Cuser.hbase.apache.org%3E",children:"a question storefileIndexSize"})," up on the user mailing list."]}),`
`,e.jsx(i.p,{children:"Most of the time small inefficiencies don't matter all that much. Unfortunately, this is a case where they do. Whatever patterns are selected for ColumnFamilies, attributes, and rowkeys they could be repeated several billion times in your data."}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/architecture/regions#keyvalue",children:"keyvalue"})," for more information on HBase stores data internally to see why this is important."]}),`
`,e.jsx(i.h4,{id:"column-families",children:"Column Families"}),`
`,e.jsx(i.p,{children:'Try to keep the ColumnFamily names as small as possible, preferably one character (e.g. "d" for data/default).'}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/architecture/regions#keyvalue",children:"KeyValue"})," for more information on how HBase stores data internally."]}),`
`,e.jsx(i.h4,{id:"attributes",children:"Attributes"}),`
`,e.jsx(i.p,{children:'Although verbose attribute names (e.g., "myVeryImportantAttribute") are easier to read, prefer shorter attribute names (e.g., "via") to store in HBase.'}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/architecture/regions#keyvalue",children:"keyvalue"})," for more information on HBase stores data internally to see why this is important."]}),`
`,e.jsx(i.h4,{id:"rowkey-length",children:"Rowkey Length"}),`
`,e.jsx(i.p,{children:"Keep them as short as is reasonable such that they can still be useful for required data access (e.g. Get vs. Scan). A short key that is useless for data access is not better than a longer key with better get/scan properties. Expect tradeoffs when designing rowkeys."}),`
`,e.jsx(i.h4,{id:"byte-patterns",children:"Byte Patterns"}),`
`,e.jsx(i.p,{children:"A long is 8 bytes. You can store an unsigned number up to 18,446,744,073,709,551,615 in those eight bytes. If you stored this number as a String — presuming a byte per character — you need nearly 3x the bytes."}),`
`,e.jsx(i.p,{children:"Not convinced? Below is some sample code that you can run on your own."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// long"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"long"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" l "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1234567890L"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] lb "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(l);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"System.out."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"println"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"long bytes length: "'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" lb.length);   "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// returns 8"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"String s "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" String."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"valueOf"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(l);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] sb "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(s);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"System.out."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"println"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"long as string length: "'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" sb.length);    "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// returns 10"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// hash"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"MessageDigest md "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" MessageDigest."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getInstance"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"MD5"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] digest "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" md."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"digest"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(s));"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"System.out."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"println"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"md5 digest bytes length: "'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" digest.length);    "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// returns 16"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"String sDigest "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(digest);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] sbDigest "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(sDigest);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"System.out."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"println"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"md5 digest as string length: "'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" sbDigest.length);    "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// returns 26"})]})]})})}),`
`,e.jsx(i.p,{children:"Unfortunately, using a binary representation of a type will make your data harder to read outside of your code. For example, this is what you will see in the shell when you increment a value:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):001:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" incr "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'r'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'f:q'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", 1"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"COUNTER"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" VALUE"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):002:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" get "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'t'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'r'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"COLUMN"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                        CELL"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" f:q"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                          timestamp=1369163040570,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\x"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"00"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\x"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"00"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\x"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"00"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\x"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"00"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\x"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"00"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\x"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"00"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\x"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"00"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\x"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"01"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0310"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]})]})})}),`
`,e.jsx(i.p,{children:"The shell makes a best effort to print a string, and it this case it decided to just print the hex. The same will happen to your row keys inside the region names. It can be okay if you know what's being stored, but it might also be unreadable if arbitrary data can be put in the same cells. This is the main trade-off."}),`
`,e.jsx(i.h3,{id:"reverse-timestamps",children:"Reverse Timestamps"}),`
`,e.jsx(t,{type:"info",children:e.jsxs(i.p,{children:[e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-4811",children:"HBASE-4811"}),` implements an API to scan a table
or a range within a table in reverse, reducing the need to optimize your schema for forward or
reverse scanning. This feature is available in HBase 0.98 and later. See
`,e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html#setReversed(boolean)",children:"Scan.setReversed()"}),`
for more information.`]})}),`
`,e.jsxs(i.p,{children:["A common problem in database processing is quickly finding the most recent version of a value. A technique using reverse timestamps as a part of the key can help greatly with a special case of this problem. Also found in the HBase chapter of Tom White's book Hadoop: The Definitive Guide (O'Reilly), the technique involves appending (",e.jsx(i.code,{children:"Long.MAX_VALUE - timestamp"}),") to the end of any key, e.g. [key][reverse_timestamp]."]}),`
`,e.jsx(i.p,{children:"The most recent value for [key] in a table can be found by performing a Scan for [key] and obtaining the first record. Since HBase keys are in sorted order, this key sorts before any older row-keys for [key] and thus is first."}),`
`,e.jsxs(i.p,{children:["This technique would be used instead of using ",e.jsx(i.a,{href:"/docs/regionserver-sizing#number-of-versions",children:"Number of Versions"}),' where the intent is to hold onto all versions "forever" (or a very long time) and at the same time quickly obtain access to any other version by using the same Scan technique.']}),`
`,e.jsx(i.h3,{id:"rowkeys-and-columnfamilies",children:"Rowkeys and ColumnFamilies"}),`
`,e.jsx(i.p,{children:"Rowkeys are scoped to ColumnFamilies. Thus, the same rowkey could exist in each ColumnFamily that exists in a table without collision."}),`
`,e.jsx(i.h3,{id:"immutability-of-rowkeys",children:"Immutability of Rowkeys"}),`
`,e.jsx(i.p,{children:`Rowkeys cannot be changed. The only way they can be "changed" in a table is if the row is deleted and then re-inserted. This is a fairly common question on the HBase dist-list so it pays to get the rowkeys right the first time (and/or before you've inserted a lot of data).`}),`
`,e.jsx(i.h3,{id:"relationship-between-rowkeys-and-region-splits",children:"Relationship Between RowKeys and Region Splits"}),`
`,e.jsxs(i.p,{children:["If you pre-split your table, it is ",e.jsx(i.em,{children:"critical"}),' to understand how your rowkey will be distributed across the region boundaries. As an example of why this is important, consider the example of using displayable hex characters as the lead position of the key (e.g., "0000000000000000" to "ffffffffffffffff"). Running those key ranges through ',e.jsx(i.code,{children:"Bytes.split"})," (which is the split strategy used when creating regions in ",e.jsx(i.code,{children:"Admin.createTable(byte[] startKey, byte[] endKey, numRegions)"})," for 10 regions will generate the following splits..."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"48 48 48 48 48 48 48 48 48 48 48 48 48 48 48 48                                // 0"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"54 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10                 // 6"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"61 -67 -67 -67 -67 -67 -67 -67 -67 -67 -67 -67 -67 -67 -67 -68                 // ="})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"68 -124 -124 -124 -124 -124 -124 -124 -124 -124 -124 -124 -124 -124 -124 -126  // D"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"75 75 75 75 75 75 75 75 75 75 75 75 75 75 75 72                                // K"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"82 18 18 18 18 18 18 18 18 18 18 18 18 18 18 14                                // R"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"88 -40 -40 -40 -40 -40 -40 -40 -40 -40 -40 -40 -40 -40 -40 -44                 // X"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"95 -97 -97 -97 -97 -97 -97 -97 -97 -97 -97 -97 -97 -97 -97 -102                // _"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"102 102 102 102 102 102 102 102 102 102 102 102 102 102 102 102                // f"})})]})})}),`
`,e.jsx(i.p,{children:"(note: the lead byte is listed to the right as a comment.) Given that the first split is a '0' and the last split is an 'f', everything is great, right? Not so fast."}),`
`,e.jsxs(i.p,{children:['The problem is that all the data is going to pile up in the first 2 regions and the last region thus creating a "lumpy" (and possibly "hot") region problem. To understand why, refer to an ',e.jsx(i.a,{href:"http://www.asciitable.com",children:"ASCII Table"}),". '0' is byte 48, and 'f' is byte 102, but there is a huge gap in byte values (bytes 58 to 96) that will ",e.jsx(i.em,{children:"never appear in this keyspace"})," because the only values are [0-9] and [a-f]. Thus, the middle regions will never be used. To make pre-splitting work with this example keyspace, a custom definition of splits (i.e., and not relying on the built-in split method) is required."]}),`
`,e.jsxs(i.p,{children:["Lesson #1: Pre-splitting tables is generally a best practice, but you need to pre-split them in such a way that all the regions are accessible in the keyspace. While this example demonstrated the problem with a hex-key keyspace, the same problem can happen with ",e.jsx(i.em,{children:"any"})," keyspace. Know your data."]}),`
`,e.jsx(i.p,{children:"Lesson #2: While generally not advisable, using hex-keys (and more generally, displayable data) can still work with pre-split tables as long as all the created regions are accessible in the keyspace."}),`
`,e.jsx(i.p,{children:"To conclude this example, the following is an example of how appropriate splits can be pre-created for hex-keys:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" boolean"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" createTable"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Admin admin, HTableDescriptor table, "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[][] splits)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"throws IOException {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  try"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    admin."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createTable"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"( table, splits );"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"catch"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (TableExistsException "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    logger."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"info"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"table "'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getNameAsString"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' " already exists"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // the table already exists..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" false"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[][] "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getHexSplits"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(String startKey, String endKey, "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" numRegions) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[][] splits "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[numRegions"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"][];"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  BigInteger lowestKey "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BigInteger"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(startKey, "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"16"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  BigInteger highestKey "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BigInteger"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(endKey, "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"16"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  BigInteger range "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" highestKey."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"subtract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(lowestKey);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  BigInteger regionIncrement "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" range."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"divide"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(BigInteger."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"valueOf"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(numRegions));"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  lowestKey "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" lowestKey."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(regionIncrement);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  for"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" i"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; i "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" numRegions"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";i"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"++"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    BigInteger key "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" lowestKey."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(regionIncrement."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"multiply"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(BigInteger."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"valueOf"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(i)));"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] b "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" String."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"format"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"%016x"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", key)."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    splits[i] "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b;"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" splits;"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.h2,{id:"number-of-versions",children:"Number of Versions"}),`
`,e.jsx(i.h3,{id:"maximum-number-of-versions",children:"Maximum Number of Versions"}),`
`,e.jsxs(i.p,{children:["The maximum number of row versions to store is configured per column family via ",e.jsx(i.a,{href:"https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/HColumnDescriptor.html",children:"HColumnDescriptor"}),". The default for max versions is 1. This is an important parameter because as described in ",e.jsx(i.a,{href:"/docs/datamodel",children:"Data Model"})," section HBase does ",e.jsx(i.em,{children:"not"})," overwrite row values, but rather stores different values per row by time (and qualifier). Excess versions are removed during major compactions. The number of max versions may need to be increased or decreased depending on application needs."]}),`
`,e.jsx(i.p,{children:"It is not recommended setting the number of max versions to an exceedingly high level (e.g., hundreds or more) unless those old values are very dear to you because this will greatly increase StoreFile size."}),`
`,e.jsx(i.h3,{id:"minimum-number-of-versions",children:"Minimum Number of Versions"}),`
`,e.jsxs(i.p,{children:["Like maximum number of row versions, the minimum number of row versions to keep is configured per column family via ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/ColumnFamilyDescriptorBuilder.html",children:"ColumnFamilyDescriptorBuilder"}),'. The default for min versions is 0, which means the feature is disabled. The minimum number of row versions parameter is used together with the time-to-live parameter and can be combined with the number of row versions parameter to allow configurations such as "keep the last T minutes worth of data, at most N versions, ',e.jsx(i.em,{children:"but keep at least M versions around"}),'" (where M is the value for minimum number of row versions, M<N). This parameter should only be set when time-to-live is enabled for a column family and must be less than the number of row versions.']}),`
`,e.jsx(i.h2,{id:"supported-datatypes",children:"Supported Datatypes"}),`
`,e.jsxs(i.p,{children:['HBase supports a "bytes-in/bytes-out" interface via ',e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Put.html",children:"Put"})," and ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Result.html",children:"Result"}),", so anything that can be converted to an array of bytes can be stored as a value. Input could be strings, numbers, complex objects, or even images as long as they can rendered as bytes."]}),`
`,e.jsxs(i.p,{children:["There are practical limits to the size of values (e.g., storing 10-50MB objects in HBase would probably be too much to ask); search the mailing list for conversations on this topic. All rows in HBase conform to the ",e.jsx(i.a,{href:"/docs/datamodel",children:"Data Model"}),", and that includes versioning. Take that into consideration when making your design, as well as block size for the ColumnFamily."]}),`
`,e.jsx(i.h3,{id:"counters",children:"Counters"}),`
`,e.jsxs(i.p,{children:['One supported datatype that deserves special mention are "counters" (i.e., the ability to do atomic increments of numbers). See ',e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#increment(org.apache.hadoop.hbase.client.Increment)",children:"Increment"})," in ",e.jsx(i.code,{children:"Table"}),"."]}),`
`,e.jsx(i.p,{children:"Synchronization on counters are done on the RegionServer, not in the client."}),`
`,e.jsx(i.h2,{id:"regionserver-sizing-joins",children:"Joins"}),`
`,e.jsxs(i.p,{children:["If you have multiple tables, don't forget to factor in the potential for ",e.jsx(i.a,{href:"/docs/datamodel#datamodel-joins",children:"Joins"})," into the schema design."]}),`
`,e.jsx(i.h2,{id:"time-to-live-ttl",children:"Time To Live (TTL)"}),`
`,e.jsxs(i.p,{children:["ColumnFamilies can set a TTL length in seconds, and HBase will automatically delete rows once the expiration time is reached. This applies to ",e.jsx(i.em,{children:"all"})," versions of a row - even the current one. The TTL time encoded in the HBase for the row is specified in UTC."]}),`
`,e.jsxs(i.p,{children:["Store files which contains only expired rows are deleted on minor compaction. Setting ",e.jsx(i.code,{children:"hbase.store.delete.expired.storefile"})," to ",e.jsx(i.code,{children:"false"})," disables this feature. Setting minimum number of versions to other than 0 also disables this."]}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/HColumnDescriptor.html",children:"HColumnDescriptor"})," for more information."]}),`
`,e.jsxs(i.p,{children:["Recent versions of HBase also support setting time to live on a per cell basis. See ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-10560",children:"HBASE-10560"})," for more information. Cell TTLs are submitted as an attribute on mutation requests (Appends, Increments, Puts, etc.) using Mutation#setTTL. If the TTL attribute is set, it will be applied to all cells updated on the server by the operation. There are two notable differences between cell TTL handling and ColumnFamily TTLs:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:"Cell TTLs are expressed in units of milliseconds instead of seconds."}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:"A cell TTLs cannot extend the effective lifetime of a cell beyond a ColumnFamily level TTL setting."}),`
`]}),`
`]}),`
`,e.jsx(i.h2,{id:"keeping-deleted-cells",children:"Keeping Deleted Cells"}),`
`,e.jsxs(i.p,{children:["By default, delete markers extend back to the beginning of time. Therefore, ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html",children:"Get"})," or ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html",children:"Scan"})," operations will not see a deleted cell (row or column), even when the Get or Scan operation indicates a time range before the delete marker was placed."]}),`
`,e.jsx(i.p,{children:"ColumnFamilies can optionally keep deleted cells. In this case, deleted cells can still be retrieved, as long as these operations specify a time range that ends before the timestamp of any delete that would affect the cells. This allows for point-in-time queries even in the presence of deletes."}),`
`,e.jsx(i.p,{children:'Deleted cells are still subject to TTL and there will never be more than "maximum number of versions" deleted cells. A new "raw" scan options returns all deleted rows and the delete markers.'}),`
`,e.jsxs(i.h4,{id:"change-the-value-of-keep_deleted_cells-using-hbase-shell-toc",children:["Change the Value of ",e.jsx(i.code,{children:"KEEP_DELETED_CELLS"})," Using HBase Shell:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"hbas"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" alter"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 't1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'f1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" KEEP_DELETED_CELLS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"})]})})})}),`
`,e.jsxs(i.h4,{id:"change-the-value-of-keep_deleted_cells-using-the-api-toc",children:["Change the Value of ",e.jsx(i.code,{children:"KEEP_DELETED_CELLS"})," Using the API:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HColumnDescriptor."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setKeepDeletedCells"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"true"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})})]})})}),`
`,e.jsxs(i.p,{children:["Let us illustrate the basic effect of setting the ",e.jsx(i.code,{children:"KEEP_DELETED_CELLS"})," attribute on a table."]}),`
`,e.jsx(i.p,{children:"First, without:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'test',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'e',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"2147483647}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"put"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'test',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'r1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'e:c1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'value',"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 10"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"put"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'test',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'r1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'e:c1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'value',"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 12"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"put"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'test',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'r1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'e:c1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'value',"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 14"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"delete"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'test',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'r1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'e:c1',"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  11"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):017:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" scan "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {RAW"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"true,"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"1000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ROW"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                              COLUMN+CELL"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                              column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=14,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                              column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=12,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                              column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=11,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" type=DeleteColumn"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                              column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=10,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0120"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):018:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" flush "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0350"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):019:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" scan "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {RAW"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"true,"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"1000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ROW"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                              COLUMN+CELL"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                              column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=14,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                              column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=12,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                              column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=11,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" type=DeleteColumn"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0120"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):020:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" major_compact "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0260"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):021:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" scan "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {RAW"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"true,"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"1000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ROW"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                              COLUMN+CELL"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                              column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=14,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                              column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=12,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0120"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]})]})})}),`
`,e.jsx(i.p,{children:"Notice how delete cells are let go."}),`
`,e.jsxs(i.p,{children:["Now let's run the same test only with ",e.jsx(i.code,{children:"KEEP_DELETED_CELLS"})," set on the table (you can do table or per-column-family):"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):005:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" create "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'e',"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"2147483647,"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" KEEP_DELETED_CELLS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.2160"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"Hbase::Table"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):006:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" put "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'r1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'e:c1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'value'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", 10"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.1070"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):007:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" put "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'r1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'e:c1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'value'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", 12"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0140"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):008:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" put "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'r1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'e:c1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'value'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", 14"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0160"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):009:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" delete "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'r1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'e:c1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",  11"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0290"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):010:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" scan "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {RAW"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"true,"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"1000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ROW"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          COLUMN+CELL"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=14,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=12,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=11,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" type=DeleteColumn"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=10,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0550"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):011:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" flush "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.2780"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):012:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" scan "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {RAW"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"true,"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"1000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ROW"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          COLUMN+CELL"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=14,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=12,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=11,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" type=DeleteColumn"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=10,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0620"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):013:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" major_compact "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0530"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase(main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):014:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"0>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" scan "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {RAW"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"true,"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"1000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ROW"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          COLUMN+CELL"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=14,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=12,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=11,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" type=DeleteColumn"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" r1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                                                                                          column=e:c1,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" timestamp=10,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" value=value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0650"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" seconds"})]})]})})}),`
`,e.jsxs(i.p,{children:["KEEP",e.jsx(i.em,{children:"DELETED_CELLS is to avoid removing Cells from HBase when the _only"})," reason to remove them is the delete marker. So with KEEP_DELETED_CELLS enabled deleted cells would get removed if either you write more versions than the configured max, or you have a TTL and Cells are in excess of the configured timeout, etc."]}),`
`,e.jsx(i.h2,{id:"secondary-indexes-and-alternate-query-paths",children:"Secondary Indexes and Alternate Query Paths"}),`
`,e.jsxs(i.p,{children:['This section could also be titled "what if my table rowkey looks like ',e.jsx(i.em,{children:"this"})," but I also want to query my table like ",e.jsx(i.em,{children:"that"}),'." A common example on the dist-list is where a row-key is of the format "user-timestamp" but there are reporting requirements on activity across users for certain time ranges. Thus, selecting by user is easy because it is in the lead position of the key, but time is not.']}),`
`,e.jsx(i.p,{children:"There is no single answer on the best way to handle this because it depends on..."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Number of users"}),`
`,e.jsx(i.li,{children:"Data size and data arrival rate"}),`
`,e.jsx(i.li,{children:"Flexibility of reporting requirements (e.g., completely ad-hoc date selection vs. pre-configured ranges)"}),`
`,e.jsx(i.li,{children:"Desired execution speed of query (e.g., 90 seconds may be reasonable to some for an ad-hoc report, whereas it may be too long for others)"}),`
`]}),`
`,e.jsx(i.p,{children:"and solutions are also influenced by the size of the cluster and how much processing power you have to throw at the solution. Common techniques are in sub-sections below. This is a comprehensive, but not exhaustive, list of approaches."}),`
`,e.jsx(i.p,{children:"It should not be a surprise that secondary indexes require additional cluster space and processing. This is precisely what happens in an RDBMS because the act of creating an alternate index requires both space and processing cycles to update. RDBMS products are more advanced in this regard to handle alternative index management out of the box. However, HBase scales better at larger data volumes, so this is a feature trade-off."}),`
`,e.jsxs(i.p,{children:["Pay attention to ",e.jsx(i.a,{href:"/docs/performance",children:"Apache HBase Performance Tuning"})," when implementing any of these approaches."]}),`
`,e.jsxs(i.p,{children:["Additionally, see the David Butler response in this dist-list thread ",e.jsx(i.a,{href:"https://lists.apache.org/thread.html/b0ca33407f010d5b1be67a20d1708e8d8bb1e147770f2cb7182a2e37%401300972712%40%3Cuser.hbase.apache.org%3E",children:"HBase, mail # user - Stargate+hbase"})]}),`
`,e.jsx(i.h3,{id:"filter-query",children:"Filter Query"}),`
`,e.jsxs(i.p,{children:["Depending on the case, it may be appropriate to use ",e.jsx(i.a,{href:"/docs/architecture/client-request-filters",children:"Client Request Filters"}),". In this case, no secondary index is created. However, don't try a full-scan on a large table like this from an application (i.e., single-threaded client)."]}),`
`,e.jsx(i.h3,{id:"periodic-update-secondary-index",children:"Periodic-Update Secondary Index"}),`
`,e.jsx(i.p,{children:"A secondary index could be created in another table which is periodically updated via a MapReduce job. The job could be executed intra-day, but depending on load-strategy it could still potentially be out of sync with the main data table."}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/mapreduce#hbase-mapreduce-read-example",children:"mapreduce.example.readwrite"})," for more information."]}),`
`,e.jsx(i.h3,{id:"dual-write-secondary-index",children:"Dual-Write Secondary Index"}),`
`,e.jsxs(i.p,{children:["Another strategy is to build the secondary index while publishing data to the cluster (e.g., write to data table, write to index table). If this is approach is taken after a data table already exists, then bootstrapping will be needed for the secondary index with a MapReduce job (see ",e.jsx(i.a,{href:"/docs/regionserver-sizing#periodic-update-secondary-index",children:"secondary.indexes.periodic"}),")."]}),`
`,e.jsx(i.h3,{id:"summary-tables",children:"Summary Tables"}),`
`,e.jsx(i.p,{children:"Where time-ranges are very wide (e.g., year-long report) and where the data is voluminous, summary tables are a common approach. These would be generated with MapReduce jobs into another table."}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/mapreduce#hbase-mapreduce-summary-to-hbase-example",children:"mapreduce.example.summary"})," for more information."]}),`
`,e.jsx(i.h3,{id:"coprocessor-secondary-index",children:"Coprocessor Secondary Index"}),`
`,e.jsxs(i.p,{children:["Coprocessors act like RDBMS triggers. These were added in 0.92. For more information, see ",e.jsx(i.a,{href:"/docs/cp",children:"coprocessors"})]}),`
`,e.jsx(i.h2,{id:"regionserver-sizing-constraints",children:"Constraints"}),`
`,e.jsxs(i.p,{children:["HBase currently supports 'constraints' in traditional (SQL) database parlance. The advised usage for Constraints is in enforcing business rules for attributes in the table (e.g. make sure values are in the range 1-10). Constraints could also be used to enforce referential integrity, but this is strongly discouraged as it will dramatically decrease the write throughput of the tables where integrity checking is enabled. Extensive documentation on using Constraints can be found at ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/constraint/Constraint.html",children:"Constraint"})," since version 0.94."]}),`
`,e.jsx(i.h2,{id:"schema-design-case-studies",children:"Schema Design Case Studies"}),`
`,e.jsx(i.p,{children:"The following will describe some typical data ingestion use-cases with HBase, and how the rowkey design and construction can be approached. Note: this is just an illustration of potential approaches, not an exhaustive list. Know your data, and know your processing requirements."}),`
`,e.jsxs(i.p,{children:["It is highly recommended that you read the rest of the ",e.jsx(i.a,{href:"/docs/schema-design",children:"HBase and Schema Design"})," first, before reading these case studies."]}),`
`,e.jsx(i.p,{children:"The following case studies are described:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Log Data / Timeseries Data"}),`
`,e.jsx(i.li,{children:"Log Data / Timeseries on Steroids"}),`
`,e.jsx(i.li,{children:"Customer/Order"}),`
`,e.jsx(i.li,{children:"Tall/Wide/Middle Schema Design"}),`
`,e.jsx(i.li,{children:"List Data"}),`
`]}),`
`,e.jsx(i.h3,{id:"case-study---log-data-and-timeseries-data",children:"Case Study - Log Data and Timeseries Data"}),`
`,e.jsx(i.p,{children:"Assume that the following data elements are being collected."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Hostname"}),`
`,e.jsx(i.li,{children:"Timestamp"}),`
`,e.jsx(i.li,{children:"Log event"}),`
`,e.jsx(i.li,{children:"Value/message"}),`
`]}),`
`,e.jsx(i.p,{children:"We can store them in an HBase table called LOG_DATA, but what will the rowkey be? From these attributes the rowkey will be some combination of hostname, timestamp, and log-event - but what specifically?"}),`
`,e.jsx(i.h4,{id:"timestamp-in-the-rowkey-lead-position",children:"Timestamp In The Rowkey Lead Position"}),`
`,e.jsxs(i.p,{children:["The rowkey ",e.jsx(i.code,{children:"[timestamp][hostname][log-event]"})," suffers from the monotonically increasing rowkey problem described in ",e.jsx(i.a,{href:"/docs/regionserver-sizing#monotonically-increasing-row-keystimeseries-data",children:"Monotonically Increasing Row Keys/Timeseries Data"}),"."]}),`
`,e.jsx(i.p,{children:'There is another pattern frequently mentioned in the dist-lists about "bucketing" timestamps, by performing a mod operation on the timestamp. If time-oriented scans are important, this could be a useful approach. Attention must be paid to the number of buckets, because this will require the same number of scans to return results.'}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"long"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" bucket "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" timestamp "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"%"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" numBuckets;"})]})})})}),`
`,e.jsx(i.p,{children:"to construct:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"[bucket][timestamp][hostname][log-event]"})})})})}),`
`,e.jsx(i.p,{children:"As stated above, to select data for a particular timerange, a Scan will need to be performed for each bucket. 100 buckets, for example, will provide a wide distribution in the keyspace but it will require 100 Scans to obtain data for a single timestamp, so there are trade-offs."}),`
`,e.jsx(i.h4,{id:"host-in-the-rowkey-lead-position",children:"Host In The Rowkey Lead Position"}),`
`,e.jsxs(i.p,{children:["The rowkey ",e.jsx(i.code,{children:"[hostname][log-event][timestamp]"})," is a candidate if there is a large-ish number of hosts to spread the writes and reads across the keyspace. This approach would be useful if scanning by hostname was a priority."]}),`
`,e.jsx(i.h4,{id:"timestamp-or-reverse-timestamp",children:"Timestamp, or Reverse Timestamp?"}),`
`,e.jsxs(i.p,{children:["If the most important access path is to pull most recent events, then storing the timestamps as reverse-timestamps (e.g., ",e.jsx(i.code,{children:"timestamp = Long.MAX_VALUE – timestamp"}),") will create the property of being able to do a Scan on ",e.jsx(i.code,{children:"[hostname][log-event]"})," to obtain the most recently captured events."]}),`
`,e.jsx(i.p,{children:"Neither approach is wrong, it just depends on what is most appropriate for the situation."}),`
`,e.jsx(t,{type:"info",children:e.jsxs(i.p,{children:[e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-4811",children:"HBASE-4811"}),` implements an API to scan a table
or a range within a table in reverse, reducing the need to optimize your schema for forward or
reverse scanning. This feature is available in HBase 0.98 and later. See
`,e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html#setReversed(boolean)",children:"Scan.setReversed()"}),`
for more information.`]})}),`
`,e.jsx(i.h4,{id:"variable-length-or-fixed-length-rowkeys",children:"Variable Length or Fixed Length Rowkeys?"}),`
`,e.jsxs(i.p,{children:["It is critical to remember that rowkeys are stamped on every column in HBase. If the hostname is ",e.jsx(i.code,{children:"a"})," and the event type is ",e.jsx(i.code,{children:"e1"})," then the resulting rowkey would be quite small. However, what if the ingested hostname is ",e.jsx(i.code,{children:"myserver1.mycompany.com"})," and the event type is ",e.jsx(i.code,{children:"com.package1.subpackage2.subsubpackage3.ImportantService"}),"?"]}),`
`,e.jsx(i.p,{children:"It might make sense to use some substitution in the rowkey. There are at least two approaches: hashed and numeric. In the Hostname In The Rowkey Lead Position example, it might look like this:"}),`
`,e.jsx(i.p,{children:"Composite Rowkey With Hashes:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"[MD5 hash of hostname] = 16 bytes"}),`
`,e.jsx(i.li,{children:"[MD5 hash of event-type] = 16 bytes"}),`
`,e.jsx(i.li,{children:"[timestamp] = 8 bytes"}),`
`]}),`
`,e.jsx(i.p,{children:"Composite Rowkey With Numeric Substitution:"}),`
`,e.jsx(i.p,{children:"For this approach another lookup table would be needed in addition to LOG_DATA, called LOG_TYPES. The rowkey of LOG_TYPES would be:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"[type]"})," (e.g., byte indicating hostname vs. event-type)"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"[bytes]"})," variable length bytes for raw hostname or event-type."]}),`
`]}),`
`,e.jsxs(i.p,{children:["A column for this rowkey could be a long with an assigned number, which could be obtained by using an ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#incrementColumnValue(byte%5B%5D,byte%5B%5D,byte%5B%5D,long)",children:"HBase counter"})]}),`
`,e.jsx(i.p,{children:"So the resulting composite rowkey would be:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"[substituted long for hostname] = 8 bytes"}),`
`,e.jsx(i.li,{children:"[substituted long for event type] = 8 bytes"}),`
`,e.jsx(i.li,{children:"[timestamp] = 8 bytes"}),`
`]}),`
`,e.jsx(i.p,{children:"In either the Hash or Numeric substitution approach, the raw values for hostname and event-type can be stored as columns."}),`
`,e.jsx(i.h3,{id:"case-study---log-data-and-timeseries-data-on-steroids",children:"Case Study - Log Data and Timeseries Data on Steroids"}),`
`,e.jsxs(i.p,{children:["This effectively is the OpenTSDB approach. What OpenTSDB does is re-write data and pack rows into columns for certain time-periods. For a detailed explanation, see: ",e.jsx(i.a,{href:"http://opentsdb.net/schema.html",children:"http://opentsdb.net/schema.html"}),", and ",e.jsx(i.a,{href:"https://www.slideshare.net/cloudera/4-opentsdb-hbasecon",children:"Lessons Learned from OpenTSDB"})," from HBaseCon2012."]}),`
`,e.jsx(i.p,{children:"But this is how the general concept works: data is ingested, for example, in this manner..."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"[hostname][log-event][timestamp1]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"[hostname][log-event][timestamp2]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"[hostname][log-event][timestamp3]"})})]})})}),`
`,e.jsx(i.p,{children:"with separate rowkeys for each detailed event, but is re-written like this..."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"[hostname][log-event][timerange]"})})})})}),`
`,e.jsx(i.p,{children:"and each of the above events are converted into columns stored with a time-offset relative to the beginning timerange (e.g., every 5 minutes). This is obviously a very advanced processing technique, but HBase makes this possible."}),`
`,e.jsx(i.h3,{id:"case-study---customerorder",children:"Case Study - Customer/Order"}),`
`,e.jsx(i.p,{children:"Assume that HBase is used to store customer and order information. There are two core record-types being ingested: a Customer record type, and Order record type."}),`
`,e.jsx(i.p,{children:"The Customer record type would include all the things that you'd typically expect:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Customer number"}),`
`,e.jsx(i.li,{children:"Customer name"}),`
`,e.jsx(i.li,{children:"Address (e.g., city, state, zip)"}),`
`,e.jsx(i.li,{children:"Phone numbers, etc."}),`
`]}),`
`,e.jsx(i.p,{children:"The Order record type would include things like:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Customer number"}),`
`,e.jsx(i.li,{children:"Order number"}),`
`,e.jsx(i.li,{children:"Sales date"}),`
`,e.jsxs(i.li,{children:["A series of nested objects for shipping locations and line-items (see ",e.jsx(i.a,{href:"/docs/regionserver-sizing#order-object-design",children:"Order Object Design"})," for details)"]}),`
`]}),`
`,e.jsx(i.p,{children:"Assuming that the combination of customer number and sales order uniquely identify an order, these two attributes will compose the rowkey, and specifically a composite key such as:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"[customer number][order number]"})})})})}),`
`,e.jsxs(i.p,{children:["for an ORDER table. However, there are more design decisions to make: are the ",e.jsx(i.em,{children:"raw"})," values the best choices for rowkeys?"]}),`
`,e.jsx(i.p,{children:"The same design questions in the Log Data use-case confront us here. What is the keyspace of the customer number, and what is the format (e.g., numeric? alphanumeric?) As it is advantageous to use fixed-length keys in HBase, as well as keys that can support a reasonable spread in the keyspace, similar options appear:"}),`
`,e.jsx(i.p,{children:"Composite Rowkey With Hashes:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"[MD5 of customer number] = 16 bytes"}),`
`,e.jsx(i.li,{children:"[MD5 of order number] = 16 bytes"}),`
`]}),`
`,e.jsx(i.p,{children:"Composite Numeric/Hash Combo Rowkey:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"[substituted long for customer number] = 8 bytes"}),`
`,e.jsx(i.li,{children:"[MD5 of order number] = 16 bytes"}),`
`]}),`
`,e.jsx(i.h4,{id:"single-table-multiple-tables",children:"Single Table? Multiple Tables?"}),`
`,e.jsx(i.p,{children:"A traditional design approach would have separate tables for CUSTOMER and SALES. Another option is to pack multiple record types into a single table (e.g., CUSTOMER++)."}),`
`,e.jsx(i.p,{children:"Customer Record Type Rowkey:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"[customer-id]"}),`
`,e.jsxs(i.li,{children:["[type] = type indicating ",e.jsx(i.code,{children:"1"})," for customer record type"]}),`
`]}),`
`,e.jsx(i.p,{children:"Order Record Type Rowkey:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"[customer-id]"}),`
`,e.jsxs(i.li,{children:["[type] = type indicating ",e.jsx(i.code,{children:"2"})," for order record type"]}),`
`,e.jsx(i.li,{children:"[order]"}),`
`]}),`
`,e.jsx(i.p,{children:"The advantage of this particular CUSTOMER++ approach is that organizes many different record-types by customer-id (e.g., a single scan could get you everything about that customer). The disadvantage is that it's not as easy to scan for a particular record-type."}),`
`,e.jsx(i.h4,{id:"order-object-design",children:"Order Object Design"}),`
`,e.jsx(i.p,{children:"Now we need to address how to model the Order object. Assume that the class structure is as follows:"}),`
`,e.jsx(i.h4,{id:"order-toc",children:"Order"}),`
`,e.jsx(i.p,{children:"an Order can have multiple ShippingLocations"}),`
`,e.jsx(i.h4,{id:"lineitem-toc",children:"LineItem"}),`
`,e.jsx(i.p,{children:"a ShippingLocation can have multiple LineItems"}),`
`,e.jsx(i.p,{children:"there are multiple options on storing this data."}),`
`,e.jsx(i.h5,{id:"completely-normalized",children:"Completely Normalized"}),`
`,e.jsx(i.p,{children:"With this approach, there would be separate tables for ORDER, SHIPPING_LOCATION, and LINE_ITEM."}),`
`,e.jsxs(i.p,{children:["The ORDER table's rowkey was described above: ",e.jsx(i.a,{href:"/docs/regionserver-sizing#case-study---customerorder",children:"schema.casestudies.custorder"})]}),`
`,e.jsx(i.p,{children:"The SHIPPING_LOCATION's composite rowkey would be something like this:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"[order-rowkey]"})}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"[shipping location number]"})," (e.g., 1st location, 2nd, etc.)"]}),`
`]}),`
`,e.jsx(i.p,{children:"The LINE_ITEM table's composite rowkey would be something like this:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"[order-rowkey]"})}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"[shipping location number]"})," (e.g., 1st location, 2nd, etc.)"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"[line item number]"})," (e.g., 1st lineitem, 2nd, etc.)"]}),`
`]}),`
`,e.jsx(i.p,{children:"Such a normalized model is likely to be the approach with an RDBMS, but that's not your only option with HBase. The cons of such an approach is that to retrieve information about any Order, you will need:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Get on the ORDER table for the Order"}),`
`,e.jsx(i.li,{children:"Scan on the SHIPPING_LOCATION table for that order to get the ShippingLocation instances"}),`
`,e.jsx(i.li,{children:"Scan on the LINE_ITEM for each ShippingLocation"}),`
`]}),`
`,e.jsx(i.p,{children:"granted, this is what an RDBMS would do under the covers anyway, but since there are no joins in HBase you're just more aware of this fact."}),`
`,e.jsx(i.h4,{id:"single-table-with-record-types",children:"Single Table With Record Types"}),`
`,e.jsx(i.p,{children:"With this approach, there would exist a single table ORDER that would contain"}),`
`,e.jsxs(i.p,{children:["The Order rowkey was described above: ",e.jsx(i.a,{href:"/docs/regionserver-sizing#case-study---customerorder",children:"schema.casestudies.custorder"})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"[order-rowkey]"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"[ORDER record type]"})}),`
`]}),`
`,e.jsx(i.p,{children:"The ShippingLocation composite rowkey would be something like this:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"[order-rowkey]"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"[SHIPPING record type]"})}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"[shipping location number]"})," (e.g., 1st location, 2nd, etc.)"]}),`
`]}),`
`,e.jsx(i.p,{children:"The LineItem composite rowkey would be something like this:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"[order-rowkey]"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"[LINE record type]"})}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"[shipping location number]"})," (e.g., 1st location, 2nd, etc.)"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"[line item number]"})," (e.g., 1st lineitem, 2nd, etc.)"]}),`
`]}),`
`,e.jsx(i.h4,{id:"denormalized",children:"Denormalized"}),`
`,e.jsx(i.p,{children:"A variant of the Single Table With Record Types approach is to denormalize and flatten some of the object hierarchy, such as collapsing the ShippingLocation attributes onto each LineItem instance."}),`
`,e.jsx(i.p,{children:"The LineItem composite rowkey would be something like this:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"[order-rowkey]"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"[LINE record type]"})}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"[line item number]"})," (e.g., 1st lineitem, 2nd, etc., care must be taken that there are unique across the entire order)"]}),`
`]}),`
`,e.jsx(i.p,{children:"and the LineItem columns would be something like this:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"itemNumber"}),`
`,e.jsx(i.li,{children:"quantity"}),`
`,e.jsx(i.li,{children:"price"}),`
`,e.jsx(i.li,{children:"shipToLine1 (denormalized from ShippingLocation)"}),`
`,e.jsx(i.li,{children:"shipToLine2 (denormalized from ShippingLocation)"}),`
`,e.jsx(i.li,{children:"shipToCity (denormalized from ShippingLocation)"}),`
`,e.jsx(i.li,{children:"shipToState (denormalized from ShippingLocation)"}),`
`,e.jsx(i.li,{children:"shipToZip (denormalized from ShippingLocation)"}),`
`]}),`
`,e.jsx(i.p,{children:"The pros of this approach include a less complex object hierarchy, but one of the cons is that updating gets more complicated in case any of this information changes."}),`
`,e.jsx(i.h4,{id:"object-blob",children:"Object BLOB"}),`
`,e.jsxs(i.p,{children:["With this approach, the entire Order object graph is treated, in one way or another, as a BLOB. For example, the ORDER table's rowkey was described above: ",e.jsx(i.a,{href:"/docs/regionserver-sizing#case-study---customerorder",children:"schema.casestudies.custorder"}),', and a single column called "order" would contain an object that could be deserialized that contained a container Order, ShippingLocations, and LineItems.']}),`
`,e.jsx(i.p,{children:"There are many options here: JSON, XML, Java Serialization, Avro, Hadoop Writables, etc. All of them are variants of the same approach: encode the object graph to a byte-array. Care should be taken with this approach to ensure backward compatibility in case the object model changes such that older persisted structures can still be read back out of HBase."}),`
`,e.jsx(i.p,{children:"Pros are being able to manage complex object graphs with minimal I/O (e.g., a single HBase Get per Order in this example), but the cons include the aforementioned warning about backward compatibility of serialization, language dependencies of serialization (e.g., Java Serialization only works with Java clients), the fact that you have to deserialize the entire object to get any piece of information inside the BLOB, and the difficulty in getting frameworks like Hive to work with custom objects like this."}),`
`,e.jsx(i.h3,{id:"case-study---tallwidemiddle-schema-design-smackdown",children:'Case Study - "Tall/Wide/Middle" Schema Design Smackdown'}),`
`,e.jsx(i.p,{children:"This section will describe additional schema design questions that appear on the dist-list, specifically about tall and wide tables. These are general guidelines and not laws - each application must consider its own needs."}),`
`,e.jsx(i.h4,{id:"rows-vs-versions",children:"Rows vs. Versions"}),`
`,e.jsx(i.p,{children:`A common question is whether one should prefer rows or HBase's built-in-versioning. The context is typically where there are "a lot" of versions of a row to be retained (e.g., where it is significantly above the HBase default of 1 max versions). The rows-approach would require storing a timestamp in some portion of the rowkey so that they would not overwrite with each successive update.`}),`
`,e.jsx(i.p,{children:"Preference: Rows (generally speaking)."}),`
`,e.jsx(i.h4,{id:"rows-vs-columns",children:"Rows vs. Columns"}),`
`,e.jsx(i.p,{children:"Another common question is whether one should prefer rows or columns. The context is typically in extreme cases of wide tables, such as having 1 row with 1 million attributes, or 1 million rows with 1 columns apiece."}),`
`,e.jsx(i.p,{children:'Preference: Rows (generally speaking). To be clear, this guideline is in the context is in extremely wide cases, not in the standard use-case where one needs to store a few dozen or hundred columns. But there is also a middle path between these two options, and that is "Rows as Columns."'}),`
`,e.jsx(i.h4,{id:"rows-as-columns",children:"Rows as Columns"}),`
`,e.jsxs(i.p,{children:["The middle path between Rows vs. Columns is packing data that would be a separate row into columns, for certain rows. OpenTSDB is the best example of this case where a single row represents a defined time-range, and then discrete events are treated as columns. This approach is often more complex, and may require the additional complexity of re-writing your data, but has the advantage of being I/O efficient. For an overview of this approach, see ",e.jsx(i.a,{href:"#schema.casestudies.log_steroids",children:"schema.casestudies.log-steroids"}),"."]}),`
`,e.jsx(i.h3,{id:"case-study---list-data",children:"Case Study - List Data"}),`
`,e.jsx(i.p,{children:"The following is an exchange from the user dist-list regarding a fairly common question: how to handle per-user list data in Apache HBase."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"QUESTION *"}),`
`]}),`
`,e.jsx(i.p,{children:"We're looking at how to store a large amount of (per-user) list data in HBase, and we were trying to figure out what kind of access pattern made the most sense. One option is store the majority of the data in a key, so we could have something like:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:'<FixedWidthUserName><FixedWidthValueId1>:"" (no value)'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:'<FixedWidthUserName><FixedWidthValueId2>:"" (no value)'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:'<FixedWidthUserName><FixedWidthValueId3>:"" (no value)'})})]})})}),`
`,e.jsx(i.p,{children:"The other option we had was to do this entirely using:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"<FixedWidthUserName><FixedWidthPageNum0>:<FixedWidthLength><FixedIdNextPageNum><ValueId1><ValueId2><ValueId3>..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"<FixedWidthUserName><FixedWidthPageNum1>:<FixedWidthLength><FixedIdNextPageNum><ValueId1><ValueId2><ValueId3>..."})})]})})}),`
`,e.jsx(i.p,{children:"where each row would contain multiple values. So in one case reading the first thirty values would be:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"scan"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" STARTROW"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'FixedWidthUsername'"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" LIMIT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 30"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}"})]})})})}),`
`,e.jsx(i.p,{children:"And in the second case it would be"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'FixedWidthUserName\\x00\\x00\\x00\\x00'"})]})})})}),`
`,e.jsx(i.p,{children:"The general usage pattern would be to read only the first 30 values of these lists, with infrequent access reading deeper into the lists. Some users would have ⇐ 30 total values in these lists, and some users would have millions (i.e. power-law distribution)"}),`
`,e.jsx(i.p,{children:"The single-value format seems like it would take up more space on HBase, but would offer some improved retrieval / pagination flexibility. Would there be any significant performance advantages to be able to paginate via gets vs paginating with scans?"}),`
`,e.jsx(i.p,{children:"My initial understanding was that doing a scan should be faster if our paging size is unknown (and caching is set appropriately), but that gets should be faster if we'll always need the same page size. I've ended up hearing different people tell me opposite things about performance. I assume the page sizes would be relatively consistent, so for most use cases we could guarantee that we only wanted one page of data in the fixed-page-length case. I would also assume that we would have infrequent updates, but may have inserts into the middle of these lists (meaning we'd need to update all subsequent rows)."}),`
`,e.jsx(i.p,{children:"Thanks for help / suggestions / follow-up questions."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"ANSWER *"}),`
`]}),`
`,e.jsx(i.p,{children:`If I understand you correctly, you're ultimately trying to store triples in the form "user, valueid, value", right? E.g., something like:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:'"user123, firstname, Paul",'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:'"user234, lastname, Smith"'})})]})})}),`
`,e.jsx(i.p,{children:"(But the usernames are fixed width, and the valueids are fixed width)."}),`
`,e.jsx(i.p,{children:'And, your access pattern is along the lines of: "for user X, list the next 30 values, starting with valueid Y". Is that right? And these values should be returned sorted by valueid?'}),`
`,e.jsx(i.p,{children:"The tl;dr version is that you should probably go with one row per user+value, and not build a complicated intra-row pagination scheme on your own unless you're really sure it is needed."}),`
`,e.jsxs(i.p,{children:[`Your two options mirror a common question people have when designing HBase schemas: should I go "tall" or "wide"? Your first schema is "tall": each row represents one value for one user, and so there are many rows in the table for each user; the row key is user + valueid, and there would be (presumably) a single column qualifier that means "the value". This is great if you want to scan over rows in sorted order by row key (thus my question above, about whether these ids are sorted correctly). You can start a scan at any user+valueid, read the next 30, and be done. What you're giving up is the ability to have transactional guarantees around all the rows for one user, but it doesn't sound like you need that. Doing it this way is generally recommended (see `,e.jsx(i.a,{href:"/docs/regionserver-sizing#case-study---tallwidemiddle-schema-design-smackdown",children:"here"}),")."]}),`
`,e.jsx(i.p,{children:`Your second option is "wide": you store a bunch of values in one row, using different qualifiers (where the qualifier is the valueid). The simple way to do that would be to just store ALL values for one user in a single row. I'm guessing you jumped to the "paginated" version because you're assuming that storing millions of columns in a single row would be bad for performance, which may or may not be true; as long as you're not trying to do too much in a single request, or do things like scanning over and returning all of the cells in the row, it shouldn't be fundamentally worse. The client has methods that allow you to get specific slices of columns.`}),`
`,e.jsxs(i.p,{children:[`Note that neither case fundamentally uses more disk space than the other; you're just "shifting" part of the identifying information for a value either to the left (into the row key, in option one) or to the right (into the column qualifiers in option 2). Under the covers, every key/value still stores the whole row key, and column family name. (If this is a bit confusing, take an hour and watch Lars George's excellent video about understanding HBase schema design: `,e.jsx(i.a,{href:"http://www.youtube.com/watch?v=_HLoH_PgrLk",children:"http://www.youtube.com/watch?v=_HLoH_PgrLk"}),")."]}),`
`,e.jsx(i.p,{children:"A manually paginated version has lots more complexities, as you note, like having to keep track of how many things are in each page, re-shuffling if new values are inserted, etc. That seems significantly more complex. It might have some slight speed advantages (or disadvantages!) at extremely high throughput, and the only way to really know that would be to try it out. If you don't have time to build it both ways and compare, my advice would be to start with the simplest option (one row per user+value). Start simple and iterate! :)"}),`
`,e.jsx(i.h2,{id:"operational-and-performance-configuration-options",children:"Operational and Performance Configuration Options"}),`
`,e.jsx(i.h3,{id:"tune-hbase-server-rpc-handling",children:"Tune HBase Server RPC Handling"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Set ",e.jsx(i.code,{children:"hbase.regionserver.handler.count"})," (in ",e.jsx(i.code,{children:"hbase-site.xml"}),") to cores x spindles for concurrency."]}),`
`,e.jsxs(i.li,{children:["Optionally, split the call queues into separate read and write queues for differentiated service. The parameter ",e.jsx(i.code,{children:"hbase.ipc.server.callqueue.handler.factor"})," specifies the number of call queues:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"0"})," means a single shared queue"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"1"})," means one queue for each handler."]}),`
`,e.jsxs(i.li,{children:["A value between ",e.jsx(i.code,{children:"0"})," and ",e.jsx(i.code,{children:"1"})," allocates the number of queues proportionally to the number of handlers. For instance, a value of ",e.jsx(i.code,{children:".5"})," shares one queue between each two handlers."]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["Use ",e.jsx(i.code,{children:"hbase.ipc.server.callqueue.read.ratio"})," (",e.jsx(i.code,{children:"hbase.ipc.server.callqueue.read.share"})," in 0.98) to split the call queues into read and write queues:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"0.5"})," means there will be the same number of read and write queues"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"< 0.5"})," for more write than read"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"> 0.5"})," for more read than write"]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["Set ",e.jsx(i.code,{children:"hbase.ipc.server.callqueue.scan.ratio"})," (HBase 1.0+) to split read call queues into small-read and long-read queues:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"0.5 means that there will be the same number of short-read and long-read queues"}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"< 0.5"})," for more short-read"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"> 0.5"})," for more long-read"]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(i.h3,{id:"disable-nagle-for-rpc",children:"Disable Nagle for RPC"}),`
`,e.jsx(i.p,{children:"Disable Nagle's algorithm. Delayed ACKs can add up to ~200ms to RPC round trip time. Set the following parameters:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["In Hadoop's ",e.jsx(i.code,{children:"core-site.xml"}),":",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"ipc.server.tcpnodelay = true"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"ipc.client.tcpnodelay = true"})}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["In HBase's ",e.jsx(i.code,{children:"hbase-site.xml"}),":",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hbase.ipc.client.tcpnodelay = true"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hbase.ipc.server.tcpnodelay = true"})}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(i.h3,{id:"limit-server-failure-impact",children:"Limit Server Failure Impact"}),`
`,e.jsx(i.p,{children:"Detect regionserver failure as fast as reasonable. Set the following parameters:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["In ",e.jsx(i.code,{children:"hbase-site.xml"}),", set ",e.jsx(i.code,{children:"zookeeper.session.timeout"})," to 30 seconds or less to bound failure detection (20-30 seconds is a good start).",`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Note: Zookeeper clients negotiate a session timeout with the server during client init. Server enforces this timeout to be in the range [",e.jsx(i.code,{children:"minSessionTimeout"}),", ",e.jsx(i.code,{children:"maxSessionTimeout"}),"] and both these timeouts (measured in milliseconds) are configurable in Zookeeper service configuration. If not configured, these default to 2 * ",e.jsx(i.code,{children:"tickTime"})," and 20 * ",e.jsx(i.code,{children:"tickTime"})," respectively (",e.jsx(i.code,{children:"tickTime"})," is the basic time unit used by ZooKeeper, as measured in milliseconds. It is used to regulate heartbeats, timeouts etc.). Refer to Zookeeper documentation for additional details."]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["Detect and avoid unhealthy or failed HDFS DataNodes: in ",e.jsx(i.code,{children:"hdfs-site.xml"})," and ",e.jsx(i.code,{children:"hbase-site.xml"}),", set the following parameters:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"dfs.namenode.avoid.read.stale.datanode = true"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"dfs.namenode.avoid.write.stale.datanode = true"})}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(i.h3,{id:"optimize-on-the-server-side-for-low-latency",children:"Optimize on the Server Side for Low Latency"}),`
`,e.jsxs(i.p,{children:["Skip the network for local blocks when the RegionServer goes to read from HDFS by exploiting HDFS's ",e.jsx(i.a,{href:"https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/ShortCircuitLocalReads.html",children:"Short-Circuit Local Reads"})," facility. Note how setup must be done both at the datanode and on the dfsclient ends of the conneciton — i.e. at the RegionServer and how both ends need to have loaded the hadoop native ",e.jsx(i.code,{children:".so"})," library. After configuring your hadoop setting ",e.jsx(i.em,{children:"dfs.client.read.shortcircuit"})," to ",e.jsx(i.em,{children:"true"})," and configuring the ",e.jsx(i.em,{children:"dfs.domain.socket.path"})," path for the datanode and dfsclient to share and restarting, next configure the regionserver/dfsclient side."]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["In ",e.jsx(i.code,{children:"hbase-site.xml"}),", set the following parameters:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"dfs.client.read.shortcircuit = true"})}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"dfs.client.read.shortcircuit.skip.checksum = true"})," so we don't double checksum (HBase does its own checksumming to save on i/os)."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"dfs.domain.socket.path"})," to match what was set for the datanodes."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"dfs.client.read.shortcircuit.buffer.size = 131072"})," Important to avoid OOME — hbase has a default it uses if unset, see ",e.jsx(i.code,{children:"hbase.dfs.client.read.shortcircuit.buffer.size"}),"; its default is 131072."]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["Ensure data locality. In ",e.jsx(i.code,{children:"hbase-site.xml"}),", set ",e.jsx(i.code,{children:"hbase.hstore.min.locality.to.skip.major.compact = 0.7"})," (Meaning that 0.7 <= n <= 1)"]}),`
`,e.jsxs(i.li,{children:["Make sure DataNodes have enough handlers for block transfers. In ",e.jsx(i.code,{children:"hdfs-site.xml"}),", set the following parameters:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"dfs.datanode.max.xcievers >= 8192"})}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"dfs.datanode.handler.count ="})," number of spindles"]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(i.p,{children:"Check the RegionServer logs after restart. You should only see complaint if misconfiguration. Otherwise, shortcircuit read operates quietly in background. It does not provide metrics so no optics on how effective it is but read latencies should show a marked improvement, especially if good data locality, lots of random reads, and dataset is larger than available cache."}),`
`,e.jsxs(i.p,{children:["Other advanced configurations that you might play with, especially if shortcircuit functionality is complaining in the logs, include ",e.jsx(i.code,{children:"dfs.client.read.shortcircuit.streams.cache.size"})," and ",e.jsx(i.code,{children:"dfs.client.socketcache.capacity"}),". Documentation is sparse on these options. You'll have to read source code."]}),`
`,e.jsxs(i.p,{children:["RegionServer metric system exposes HDFS short circuit read metrics ",e.jsx(i.code,{children:"shortCircuitBytesRead"}),". Other HDFS read metrics, including ",e.jsx(i.code,{children:"totalBytesRead"})," (The total number of bytes read from HDFS), ",e.jsx(i.code,{children:"localBytesRead"})," (The number of bytes read from the local HDFS DataNode), ",e.jsx(i.code,{children:"zeroCopyBytesRead"})," (The number of bytes read through HDFS zero copy) are available and can be used to troubleshoot short-circuit read issues."]}),`
`,e.jsxs(i.p,{children:["For more on short-circuit reads, see Colin's old blog on rollout, ",e.jsx(i.a,{href:"http://blog.cloudera.com/blog/2013/08/how-improved-short-circuit-local-reads-bring-better-performance-and-security-to-hadoop/",children:"How Improved Short-Circuit Local Reads Bring Better Performance and Security to Hadoop"}),". The ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HDFS-347",children:"HDFS-347"})," issue also makes for an interesting read showing the HDFS community at its best (caveat a few comments)."]}),`
`,e.jsx(i.h3,{id:"jvm-tuning",children:"JVM Tuning"}),`
`,e.jsx(i.h4,{id:"tune-jvm-gc-for-low-collection-latencies",children:"Tune JVM GC for low collection latencies"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Use the CMS collector: ",e.jsx(i.code,{children:"-XX:+UseConcMarkSweepGC"})]}),`
`,e.jsxs(i.li,{children:["Keep eden space as small as possible to minimize average collection time. Example:",`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"-XX:CMSInitiatingOccupancyFraction=70"})})})})}),`
`]}),`
`,e.jsxs(i.li,{children:["Optimize for low collection latency rather than throughput: ",e.jsx(i.code,{children:"-Xmn512m"})]}),`
`,e.jsxs(i.li,{children:["Collect eden in parallel: ",e.jsx(i.code,{children:"-XX:+UseParNewGC"})]}),`
`,e.jsxs(i.li,{children:["Avoid collection under pressure: ",e.jsx(i.code,{children:"-XX:+UseCMSInitiatingOccupancyOnly"})]}),`
`,e.jsxs(i.li,{children:["Limit per request scanner result sizing so everything fits into survivor space but doesn't tenure. In ",e.jsx(i.code,{children:"hbase-site.xml"}),", set ",e.jsx(i.code,{children:"hbase.client.scanner.max.result.size"})," to 1/8th of eden space (with -",e.jsx(i.code,{children:"Xmn512m"})," this is ~51MB )"]}),`
`,e.jsxs(i.li,{children:["Set ",e.jsx(i.code,{children:"max.result.size"})," x ",e.jsx(i.code,{children:"handler.count"})," less than survivor space"]}),`
`]}),`
`,e.jsx(i.h4,{id:"os-level-tuning",children:"OS-Level Tuning"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Turn transparent huge pages (THP) off:",`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" never"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" >"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /sys/kernel/mm/transparent_hugepage/enabled"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" never"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" >"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /sys/kernel/mm/transparent_hugepage/defrag"})]})]})})}),`
`]}),`
`,e.jsxs(i.li,{children:["Set ",e.jsx(i.code,{children:"vm.swappiness = 0"})]}),`
`,e.jsxs(i.li,{children:["Set ",e.jsx(i.code,{children:"vm.min_free_kbytes"})," to at least 1GB (8GB on larger memory systems)"]}),`
`,e.jsxs(i.li,{children:["Disable NUMA zone reclaim with ",e.jsx(i.code,{children:"vm.zone_reclaim_mode = 0"})]}),`
`]}),`
`,e.jsx(i.h2,{id:"special-cases",children:"Special Cases"}),`
`,e.jsx(i.h3,{id:"for-applications-where-failing-quickly-is-better-than-waiting",children:"For applications where failing quickly is better than waiting"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["In ",e.jsx(i.code,{children:"hbase-site.xml"})," on the client side, set the following parameters:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Set ",e.jsx(i.code,{children:"hbase.client.pause = 1000"})]}),`
`,e.jsxs(i.li,{children:["Set ",e.jsx(i.code,{children:"hbase.client.retries.number = 3"})]}),`
`,e.jsxs(i.li,{children:["If you want to ride over splits and region moves, increase ",e.jsx(i.code,{children:"hbase.client.retries.number"})," substantially (>= 20)"]}),`
`,e.jsxs(i.li,{children:["Set the RecoverableZookeeper retry count: ",e.jsx(i.code,{children:"zookeeper.recovery.retry = 1"})," (no retry)"]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["In ",e.jsx(i.code,{children:"hbase-site.xml"})," on the server side, set the Zookeeper session timeout for detecting server failures: ",e.jsx(i.code,{children:"zookeeper.session.timeout"})," ⇐ 30 seconds (20-30 is good)."]}),`
`]}),`
`,e.jsx(i.h3,{id:"for-applications-that-can-tolerate-slightly-out-of-date-information",children:"For applications that can tolerate slightly out of date information"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"HBase timeline consistency (HBASE-10070)"})," With read replicas enabled, read-only copies of regions (replicas) are distributed over the cluster. One RegionServer services the default or primary replica, which is the only replica that can service writes. Other RegionServers serve the secondary replicas, follow the primary RegionServer, and only see committed updates. The secondary replicas are read-only, but can serve reads immediately while the primary is failing over, cutting read availability blips from seconds to milliseconds. Phoenix supports timeline consistency as of 4.4.0 Tips:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Deploy HBase 1.0.0 or later."}),`
`,e.jsx(i.li,{children:"Enable timeline consistent replicas on the server side."}),`
`,e.jsxs(i.li,{children:["Use one of the following methods to set timeline consistency:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Use ",e.jsx(i.code,{children:"ALTER SESSION SET CONSISTENCY = 'TIMELINE'"})]}),`
`,e.jsxs(i.li,{children:["Set the connection property ",e.jsx(i.code,{children:"Consistency"})," to ",e.jsx(i.code,{children:"timeline"})," in the JDBC connect string"]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(i.h3,{id:"more-information",children:"More Information"}),`
`,e.jsxs(i.p,{children:["See the Performance section ",e.jsx(i.a,{href:"/docs/case-studies#case-studies-schema-design",children:"perf.schema"})," for more information about operational and performance schema design options, such as Bloom Filters, Table-configured regionsizes, compression, and blocksizes."]})]})}function p(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}function a(s,i){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}export{o as _markdown,p as default,h as extractedReferences,l as frontmatter,d as structuredData,c as toc};
