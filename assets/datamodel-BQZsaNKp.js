import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let o=`## HBase Data Model Terminology

#### Table \\[!toc]

An HBase table consists of multiple rows.

#### Row \\[!toc]

A row in HBase consists of a row key and one or more columns with values associated with them.
Rows are sorted alphabetically by the row key as they are stored.
For this reason, the design of the row key is very important.
The goal is to store data in such a way that related rows are near each other.
A common row key pattern is a website domain.
If your row keys are domains, you should probably store them in reverse (org.apache.www, org.apache.mail, org.apache.jira). This way, all of the Apache domains are near each other in the table, rather than being spread out based on the first letter of the subdomain.

#### Column \\[!toc]

A column in HBase consists of a column family and a column qualifier, which are delimited by a \`:\` (colon) character.

#### Column Family \\[!toc]

Column families physically colocate a set of columns and their values, often for performance reasons.
Each column family has a set of storage properties, such as whether its values should be cached in memory, how its data is compressed or its row keys are encoded, and others.
Each row in a table has the same column families, though a given row might not store anything in a given column family.

#### Column Qualifier \\[!toc]

A column qualifier is added to a column family to provide the index for a given piece of data.
Given a column family \`content\`, a column qualifier might be \`content:html\`, and another might be \`content:pdf\`.
Though column families are fixed at table creation, column qualifiers are mutable and may differ greatly between rows.

#### Cell \\[!toc]

A cell is a combination of row, column family, and column qualifier, and contains a value and a timestamp, which represents the value's version.

#### Timestamp \\[!toc]

A timestamp is written alongside each value, and is the identifier for a given version of a value.
By default, the timestamp represents the time on the RegionServer when the data was written, but you can specify a different timestamp value when you put data into the cell.

## Conceptual View

You can read a very understandable explanation of the HBase data model in the blog post [Understanding HBase and BigTable](https://dzone.com/articles/understanding-hbase-and-bigtab) by Jim R. Wilson.
Another good explanation is available in the PDF [Introduction to Basic Schema Design](http://0b4af6cdc2f0c5998459-c0245c5c937c5dedcca3f1764ecc9b2f.r43.cf2.rackcdn.com/9353-login1210_khurana.pdf) by Amandeep Khurana.

It may help to read different perspectives to get a solid understanding of HBase schema design.
The linked articles cover the same ground as the information in this section.

The following example is a slightly modified form of the one on page 2 of the [BigTable](http://research.google.com/archive/bigtable.html) paper.
There is a table called \`webtable\` that contains two rows (\`com.cnn.www\` and \`com.example.www\`) and three column families named \`contents\`, \`anchor\`, and \`people\`.
In this example, for the first row (\`com.cnn.www\`), \`anchor\` contains two columns (\`anchor:cssnsi.com\`, \`anchor:my.look.ca\`) and \`contents\` contains one column (\`contents:html\`). This example contains 5 versions of the row with the row key \`com.cnn.www\`, and one version of the row with the row key \`com.example.www\`.
The \`contents:html\` column qualifier contains the entire HTML of a given website.
Qualifiers of the \`anchor\` column family each contain the external site which links to the site represented by the row, along with the text it used in the anchor of its link.
The \`people\` column family represents people associated with the site.

<Callout type="info" title="Column Names">
  By convention, a column name is made of its column family prefix and a *qualifier*. For example,
  the column *contents:html* is made up of the column family \`contents\` and the \`html\` qualifier.
  The colon character (\`:\`) delimits the column family from the column family *qualifier*.
</Callout>

#### Table \`webtable\` \\[!toc]

| Row Key           | Time Stamp | ColumnFamily \`contents\`      | ColumnFamily \`anchor\`         | ColumnFamily \`people\`      |
| ----------------- | ---------- | ---------------------------- | ----------------------------- | -------------------------- |
| "com.cnn.www"     | t9         |                              | anchor:cnnsi.com = "CNN"      |                            |
| "com.cnn.www"     | t8         |                              | anchor:my.look.ca = "CNN.com" |                            |
| "com.cnn.www"     | t6         | contents:html = "\\<html>..." |                               |                            |
| "com.cnn.www"     | t5         | contents:html = "\\<html>..." |                               |                            |
| "com.cnn.www"     | t3         | contents:html = "\\<html>..." |                               |                            |
| "com.example.www" | t5         | contents:html = "\\<html>..." |                               | people:author = "John Doe" |

Cells in this table that appear to be empty do not take space, or in fact exist, in HBase.
This is what makes HBase "sparse." A tabular view is not the only possible way to look at data in HBase, or even the most accurate.
The following represents the same information as a multi-dimensional map.
This is only a mock-up for illustrative purposes and may not be strictly accurate.

\`\`\`json
{
  "com.cnn.www": {
    contents: {
      t6: contents:html: "<html>..."
      t5: contents:html: "<html>..."
      t3: contents:html: "<html>..."
    }
    anchor: {
      t9: anchor:cnnsi.com = "CNN"
      t8: anchor:my.look.ca = "CNN.com"
    }
    people: {}
  }
  "com.example.www": {
    contents: {
      t5: contents:html: "<html>..."
    }
    anchor: {}
    people: {
      t5: people:author: "John Doe"
    }
  }
}
\`\`\`

## Physical View

Although at a conceptual level tables may be viewed as a sparse set of rows, they are physically stored by column family.
A new column qualifier (column\\_family:column\\_qualifier) can be added to an existing column family at any time.

#### ColumnFamily \`anchor\` \\[!toc]

| Row Key       | Time Stamp | Column Family \`anchor\`          |
| ------------- | ---------- | ------------------------------- |
| "com.cnn.www" | t9         | \`anchor:cnnsi.com = "CNN"\`      |
| "com.cnn.www" | t8         | \`anchor:my.look.ca = "CNN.com"\` |

#### ColumnFamily \`contents\` \\[!toc]

| Row Key       | Time Stamp | ColumnFamily \`contents:\`     |
| ------------- | ---------- | ---------------------------- |
| "com.cnn.www" | t6         | contents:html = "\\<html>..." |
| "com.cnn.www" | t5         | contents:html = "\\<html>..." |
| "com.cnn.www" | t3         | contents:html = "\\<html>..." |

The empty cells shown in the conceptual view are not stored at all.
Thus a request for the value of the \`contents:html\` column at time stamp \`t8\` would return no value.
Similarly, a request for an \`anchor:my.look.ca\` value at time stamp \`t9\` would return no value.
However, if no timestamp is supplied, the most recent value for a particular column would be returned.
Given multiple versions, the most recent is also the first one found, since timestamps are stored in descending order.
Thus a request for the values of all columns in the row \`com.cnn.www\` if no timestamp is specified would be: the value of \`contents:html\` from timestamp \`t6\`, the value of \`anchor:cnnsi.com\` from timestamp \`t9\`, the value of \`anchor:my.look.ca\` from timestamp \`t8\`.

For more information about the internals of how Apache HBase stores data, see [regions.arch](/docs/architecture/regions).

## Namespace

A namespace is a logical grouping of tables analogous to a database in relation database systems.
This abstraction lays the groundwork for upcoming multi-tenancy related features:

* Quota Management ([HBASE-8410](https://issues.apache.org/jira/browse/HBASE-8410)) - Restrict the amount of resources (i.e. regions, tables) a namespace can consume.
* Namespace Security Administration ([HBASE-9206](https://issues.apache.org/jira/browse/HBASE-9206)) - Provide another level of security administration for tenants.
* Region server groups ([HBASE-6721](https://issues.apache.org/jira/browse/HBASE-6721)) - A namespace/table can be pinned onto a subset of RegionServers thus guaranteeing a coarse level of isolation.

### Namespace management

A namespace can be created, removed or altered.
Namespace membership is determined during table creation by specifying a fully-qualified table name of the form:

\`\`\`xml
<table namespace>:<table qualifier>
\`\`\`

#### Examples

\`\`\`bash
#Create a namespace
create_namespace 'my_ns'
\`\`\`

\`\`\`bash
#create my_table in my_ns namespace
create 'my_ns:my_table', 'fam'
\`\`\`

\`\`\`bash
#drop namespace
drop_namespace 'my_ns'
\`\`\`

\`\`\`bash
#alter namespace
alter_namespace 'my_ns', {METHOD => 'set', 'PROPERTY_NAME' => 'PROPERTY_VALUE'}
\`\`\`

### Predefined namespaces

There are two predefined special namespaces:

* hbase - system namespace, used to contain HBase internal tables
* default - tables with no explicit specified namespace will automatically fall into this namespace

#### Examples #datamodel-predefined-namespaces-examples

\`\`\`bash
#namespace=foo and table qualifier=bar
create 'foo:bar', 'fam'

#namespace=default and table qualifier=bar
create 'bar', 'fam'
\`\`\`

### About hbase:namespace table

We used to have a system table called \`hbase:namespace\` for storing the namespace information.

It introduced some painful bugs in the past, especially that it may hang the master startup thus
hang the whole cluster. This is because meta table also has a namespace, so it depends on namespace
table. But namespace table also depends on meta table as meta table stores the location of all
regions. This is a cyclic dependency so sometimes namespace and meta table will wait for each other
to online and hang the master start up.

It is not easy to fix so in 3.0.0, we decided to completely remove the \`hbase:namespace\` table and
fold its content into the \`ns\` family in \`hbase:meta\` table. When upgrading from 2.x to 3.x, the
migration will be done automatically and the \`hbase:namespace\` table will be disabled after the
migration is done. You are free to leave it there for sometime and finally drop it.

For more tails, please see [https://issues.apache.org/jira/browse/HBASE-21154](https://issues.apache.org/jira/browse/HBASE-21154).

## Table

Tables are declared up front at schema definition time.

## Row

Row keys are uninterpreted bytes.
Rows are lexicographically sorted with the lowest order appearing first in a table.
The empty byte array is used to denote both the start and end of a tables' namespace.

## Column Family

Columns in Apache HBase are grouped into *column families*.
All column members of a column family have the same prefix.
For example, the columns *courses:history* and *courses:math* are both members of the *courses* column family.
The colon character (\`:\`) delimits the column family from the column family qualifier.
The column family prefix must be composed of *printable* characters.
The qualifying tail, the column family *qualifier*, can be made of any arbitrary bytes.
Column families must be declared up front at schema definition time whereas columns do not need to be defined at schema time but can be conjured on the fly while the table is up and running.

Physically, all column family members are stored together on the filesystem.
Because tunings and storage specifications are done at the column family level, it is advised that all column family members have the same general access pattern and size characteristics.

## Cells

A *\\{row, column, version}* tuple exactly specifies a \`cell\` in HBase.
Cell content is uninterpreted bytes

## Data Model Operations

The four primary data model operations are Get, Put, Scan, and Delete.
Operations are applied via [Table](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html) instances.

### Get

[Get](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html) returns attributes for a specified row.
Gets are executed via [Table.get](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#get\\(org.apache.hadoop.hbase.client.Get\\))

### Put

[Put](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Put.html) either adds new rows to a table (if the key is new) or can update existing rows (if the key already exists). Puts are executed via [Table.put](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#put\\(org.apache.hadoop.hbase.client.Put\\)) (non-writeBuffer) or [Table.batch](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#batch\\(java.util.List,java.lang.Object%5B%5D\\)) (non-writeBuffer)

### Scans

[Scan](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html) allow iteration over multiple rows for specified attributes.

The following is an example of a Scan on a Table instance.
Assume that a table is populated with rows with keys "row1", "row2", "row3", and then another set of rows with the keys "abc1", "abc2", and "abc3". The following example shows how to set a Scan instance to return the rows beginning with "row".

\`\`\`java
public static final byte[] CF = "cf".getBytes();
public static final byte[] ATTR = "attr".getBytes();
...

Table table = ...      // instantiate a Table instance

Scan scan = new Scan();
scan.addColumn(CF, ATTR);
scan.setStartStopRowForPrefixScan(Bytes.toBytes("row"));
ResultScanner rs = table.getScanner(scan);
try {
  for (Result r = rs.next(); r != null; r = rs.next()) {
    // process result...
  }
} finally {
  rs.close();  // always close the ResultScanner!
}
\`\`\`

Note that generally the easiest way to specify a specific stop point for a scan is by using the [InclusiveStopFilter](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/filter/InclusiveStopFilter.html) class.

### Delete

[Delete](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Delete.html) removes a row from a table.
Deletes are executed via [Table.delete](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#delete\\(org.apache.hadoop.hbase.client.Delete\\)).

HBase does not modify data in place, and so deletes are handled by creating new markers called *tombstones*.
These tombstones, along with the dead values, are cleaned up on major compactions.

See [version.delete](/docs/datamodel#delete-toc) for more information on deleting versions of columns, and see [compaction](/docs/architecture/regions#compaction) for more information on compactions.

## Versions

A *\\{row, column, version}* tuple exactly specifies a \`cell\` in HBase.
It's possible to have an unbounded number of cells where the row and column are the same but the cell address differs only in its version dimension.

While rows and column keys are expressed as bytes, the version is specified using a long integer.
Typically this long contains time instances such as those returned by \`java.util.Date.getTime()\` or \`System.currentTimeMillis()\`, that is: *the difference, measured in milliseconds, between the current time and midnight, January 1, 1970 UTC*.

The HBase version dimension is stored in decreasing order, so that when reading from a store file, the most recent values are found first.

There is a lot of confusion over the semantics of \`cell\` versions, in HBase.
In particular:

* If multiple writes to a cell have the same version, only the last written is fetchable.
* It is OK to write cells in a non-increasing version order.

Below we describe how the version dimension in HBase currently works.
See [HBASE-2406](https://issues.apache.org/jira/browse/HBASE-2406) for discussion of HBase versions. [Bending time in HBase](https://web.archive.org/web/20160909085951/https://www.ngdata.com/bending-time-in-hbase/) makes for a good read on the version, or time, dimension in HBase.
It has more detail on versioning than is provided here.

As of this writing, the limitation *Overwriting values at existing timestamps* mentioned in the article no longer holds in HBase.
This section is basically a synopsis of this article by Bruno Dumon.

### Specifying the Number of Versions to Store

The maximum number of versions to store for a given column is part of the column schema and is specified at table creation, or via an \`alter\` command, via \`HColumnDescriptor.DEFAULT_VERSIONS\`.
Prior to HBase 0.96, the default number of versions kept was \`3\`, but in 0.96 and newer has been changed to \`1\`.

#### Example: Modify the Maximum Number of Versions for a Column Family \\[!toc]

This example uses HBase Shell to keep a maximum of 5 versions of all columns in column family \`f1\`.
You could also use [ColumnFamilyDescriptorBuilder](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/ColumnFamilyDescriptorBuilder.html).

\`\`\`bash
hbase> alter 't1', NAME => 'f1', VERSIONS => 5
\`\`\`

#### Example: Modify the Minimum Number of Versions for a Column Family \\[!toc]

You can also specify the minimum number of versions to store per column family.
By default, this is set to 0, which means the feature is disabled.
The following example sets the minimum number of versions on all columns in column family \`f1\` to \`2\`, via HBase Shell.
You could also use [ColumnFamilyDescriptorBuilder](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/ColumnFamilyDescriptorBuilder.html).

\`\`\`bash
hbase> alter 't1', NAME => 'f1', MIN_VERSIONS => 2
\`\`\`

Starting with HBase 0.98.2, you can specify a global default for the maximum number of versions kept for all newly-created columns, by setting \`hbase.column.max.version\` in *hbase-site.xml*.
See [hbase.column.max.version](/docs/configuration/default#hbasecolumnmaxversion-toc).

### Versions and HBase Operations

In this section we look at the behavior of the version dimension for each of the core HBase operations.

#### Get/Scan

Gets are implemented on top of Scans.
The below discussion of [Get](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html) applies equally to [Scans](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html).

By default, i.e. if you specify no explicit version, when doing a \`get\`, the cell whose version has the largest value is returned (which may or may not be the latest one written, see later). The default behavior can be modified in the following ways:

* to return more than one version, see [Get.readVersions(int)](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html#readVersions\\(int\\))
* to return versions other than the latest, see [Get.setTimeRange(long,long)](https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html#setTimeRange\\(long,long\\))

To retrieve the latest version that is less than or equal to a given value, thus giving the 'latest' state of the record at a certain point in time, just use a range from 0 to the desired version and set the max versions to 1.

#### Default Get Example

The following Get will only retrieve the current version of the row

\`\`\`java
public static final byte[] CF = "cf".getBytes();
public static final byte[] ATTR = "attr".getBytes();
...
Get get = new Get(Bytes.toBytes("row1"));
Result r = table.get(get);
byte[] b = r.getValue(CF, ATTR);  // returns current version of value
\`\`\`

#### Versioned Get Example

The following Get will return the last 3 versions of the row.

\`\`\`java
public static final byte[] CF = "cf".getBytes();
public static final byte[] ATTR = "attr".getBytes();
...
Get get = new Get(Bytes.toBytes("row1"));
get.setMaxVersions(3);  // will return last 3 versions of row
Result r = table.get(get);
byte[] b = r.getValue(CF, ATTR);  // returns current version of value
List<Cell> cells = r.getColumnCells(CF, ATTR);  // returns all versions of this column
\`\`\`

#### Put

Doing a put always creates a new version of a \`cell\`, at a certain timestamp.
By default the system uses the server's \`currentTimeMillis\`, but you can specify the version (= the long integer) yourself, on a per-column level.
This means you could assign a time in the past or the future, or use the long value for non-time purposes.

To overwrite an existing value, do a put at exactly the same row, column, and version as that of the cell you want to overwrite.

#### Implicit Version Example \\[!toc]

The following Put will be implicitly versioned by HBase with the current time.

\`\`\`java
public static final byte[] CF = "cf".getBytes();
public static final byte[] ATTR = "attr".getBytes();
...
Put put = new Put(Bytes.toBytes(row));
put.add(CF, ATTR, Bytes.toBytes( data));
table.put(put);
\`\`\`

#### Explicit Version Example

The following Put has the version timestamp explicitly set.

\`\`\`java
public static final byte[] CF = "cf".getBytes();
public static final byte[] ATTR = "attr".getBytes();
...
Put put = new Put( Bytes.toBytes(row));
long explicitTimeInMs = 555;  // just an example
put.add(CF, ATTR, explicitTimeInMs, Bytes.toBytes(data));
table.put(put);
\`\`\`

Caution: the version timestamp is used internally by HBase for things like time-to-live calculations.
It's usually best to avoid setting this timestamp yourself.
Prefer using a separate timestamp attribute of the row, or have the timestamp as a part of the row key, or both.

#### Cell Version Example \\[!toc]

The following Put uses a method getCellBuilder() to get a CellBuilder instance
that already has relevant Type and Row set.

\`\`\`java
public static final byte[] CF = "cf".getBytes();
public static final byte[] ATTR = "attr".getBytes();
...

Put put = new Put(Bytes.toBytes(row));
put.add(put.getCellBuilder().setQualifier(ATTR)
   .setFamily(CF)
   .setValue(Bytes.toBytes(data))
   .build());
table.put(put);
\`\`\`

#### Delete \\[!toc]

There are three different types of internal delete markers.
See Lars Hofhansl's blog for discussion of his attempt adding another, [Scanning in HBase: Prefix Delete Marker](http://hadoop-hbase.blogspot.com/2012/01/scanning-in-hbase.html).

* Delete: for a specific version of a column.
* Delete column: for all versions of a column.
* Delete family: for all columns of a particular ColumnFamily

When deleting an entire row, HBase will internally create a tombstone for each ColumnFamily (i.e., not each individual column).

Deletes work by creating *tombstone* markers.
For example, let's suppose we want to delete a row.
For this you can specify a version, or else by default the \`currentTimeMillis\` is used.
What this means is *delete all cells where the version is less than or equal to this version*.
HBase never modifies data in place, so for example a delete will not immediately delete (or mark as deleted) the entries in the storage file that correspond to the delete condition.
Rather, a so-called *tombstone* is written, which will mask the deleted values.
When HBase does a major compaction, the tombstones are processed to actually remove the dead values, together with the tombstones themselves.
If the version you specified when deleting a row is larger than the version of any value in the row, then you can consider the complete row to be deleted.

For an informative discussion on how deletes and versioning interact, see the thread [Put w/timestamp -> Deleteall -> Put w/ timestamp fails](https://lists.apache.org/thread/g6s0fkx74hbmc0pplnf5r3gq5xn4vkyt) up on the user mailing list.

Also see [keyvalue](/docs/architecture/regions#keyvalue) for more information on the internal KeyValue format.

Delete markers are purged during the next major compaction of the store, unless the \`KEEP_DELETED_CELLS\` option is set in the column family (See [Keeping Deleted Cells](/docs/regionserver-sizing#keeping-deleted-cells)).
To keep the deletes for a configurable amount of time, you can set the delete TTL via the \`hbase.hstore.time.to.purge.deletes\` property in *hbase-site.xml*.
If \`hbase.hstore.time.to.purge.deletes\` is not set, or set to 0, all delete markers, including those with timestamps in the future, are purged during the next major compaction.
Otherwise, a delete marker with a timestamp in the future is kept until the major compaction which occurs after the time represented by the marker's timestamp plus the value of \`hbase.hstore.time.to.purge.deletes\`, in milliseconds.

<Callout type="info">
  This behavior represents a fix for an unexpected change that was introduced in HBase 0.94, and was
  fixed in [HBASE-10118](https://issues.apache.org/jira/browse/HBASE-10118). The change has been
  backported to HBase 0.94 and newer branches.
</Callout>

### Optional New Version and Delete behavior in HBase-2.0.0

In \`hbase-2.0.0\`, the operator can specify an alternate version and
delete treatment by setting the column descriptor property
\`NEW_VERSION_BEHAVIOR\` to true (To set a property on a column family
descriptor, you must first disable the table and then alter the
column family descriptor; see [Keeping Deleted Cells](/docs/regionserver-sizing#keeping-deleted-cells) for an example
of editing an attribute on a column family descriptor).

The 'new version behavior', undoes the limitations listed below
whereby a \`Delete\` ALWAYS overshadows a \`Put\` if at the same
location — i.e. same row, column family, qualifier and timestamp
\\-- regardless of which arrived first. Version accounting is also
changed as deleted versions are considered toward total version count.
This is done to ensure results are not changed should a major
compaction intercede. See \`HBASE-15968\` and linked issues for
discussion.

Running with this new configuration currently costs; we factor
the Cell MVCC on every compare so we burn more CPU. The slow
down will depend. In testing we've seen between 0% and 25%
degradation.

If replicating, it is advised that you run with the new
serial replication feature (See \`HBASE-9465\`; the serial
replication feature did NOT make it into \`hbase-2.0.0\` but
should arrive in a subsequent hbase-2.x release) as now
the order in which Mutations arrive is a factor.

### Current Limitations

The below limitations are addressed in hbase-2.0.0. See
the section above, [Optional New Version and Delete behavior in HBase-2.0.0](/docs/datamodel#optional-new-version-and-delete-behavior-in-hbase-200).

#### Deletes mask Puts

Deletes mask puts, even puts that happened after the delete was entered.
See [HBASE-2256](https://issues.apache.org/jira/browse/HBASE-2256).
Remember that a delete writes a tombstone, which only disappears after then next major compaction has run.
Suppose you do a delete of everything \`<= T\`.
After this you do a new put with a timestamp \`<= T\`.
This put, even if it happened after the delete, will be masked by the delete tombstone.
Performing the put will not fail, but when you do a get you will notice the put did have no effect.
It will start working again after the major compaction has run.
These issues should not be a problem if you use always-increasing versions for new puts to a row.
But they can occur even if you do not care about time: just do delete and put immediately after each other, and there is some chance they happen within the same millisecond.

#### Major compactions change query results

*...create three cell versions at t1, t2 and t3, with a maximum-versions
setting of 2. So when getting all versions, only the values at t2 and t3 will be
returned. But if you delete the version at t2 or t3, the one at t1 will appear again.
Obviously, once a major compaction has run, such behavior will not be the case
anymore...* (See *Garbage Collection* in [Bending time in HBase](https://web.archive.org/web/20160909085951/https://www.ngdata.com/bending-time-in-hbase/).)

## Sort Order

All data model operations HBase return data in sorted order.
First by row, then by ColumnFamily, followed by column qualifier, and finally timestamp (sorted in reverse, so newest records are returned first).

## Column Metadata

There is no store of column metadata outside of the internal KeyValue instances for a ColumnFamily.
Thus, while HBase can support not only a wide number of columns per row, but a heterogeneous set of columns between rows as well, it is your responsibility to keep track of the column names.

The only way to get a complete set of columns that exist for a ColumnFamily is to process all the rows.
For more information about how HBase stores data internally, see [keyvalue](/docs/architecture/regions#keyvalue).

## Joins

Whether HBase supports joins is a common question on the dist-list, and there is a simple answer: it doesn't, at not least in the way that RDBMS' support them (e.g., with equi-joins or outer-joins in SQL). As has been illustrated in this chapter, the read data model operations in HBase are Get and Scan.

However, that doesn't mean that equivalent join functionality can't be supported in your application, but you have to do it yourself.
The two primary strategies are either denormalizing the data upon writing to HBase, or to have lookup tables and do the join between HBase tables in your application or MapReduce code (and as RDBMS' demonstrate, there are several strategies for this depending on the size of the tables, e.g., nested loops vs.
hash-joins). So which is the best approach? It depends on what you are trying to do, and as such there isn't a single answer that works for every use case.

## ACID

See [ACID Semantics](/acid-semantics).
Lars Hofhansl has also written a note on [ACID in HBase](http://hadoop-hbase.blogspot.com/2012/03/acid-in-hbase.html).
`,h={title:"Data Model",description:"In HBase, data is stored in tables, which have rows and columns. This is a terminology overlap with relational databases (RDBMSs), but this is not a helpful analogy. Instead, it can be helpful to think of an HBase table as a multi-dimensional map."},r=[{href:"https://dzone.com/articles/understanding-hbase-and-bigtab"},{href:"http://0b4af6cdc2f0c5998459-c0245c5c937c5dedcca3f1764ecc9b2f.r43.cf2.rackcdn.com/9353-login1210_khurana.pdf"},{href:"http://research.google.com/archive/bigtable.html"},{href:"/docs/architecture/regions"},{href:"https://issues.apache.org/jira/browse/HBASE-8410"},{href:"https://issues.apache.org/jira/browse/HBASE-9206"},{href:"https://issues.apache.org/jira/browse/HBASE-6721"},{href:"https://issues.apache.org/jira/browse/HBASE-21154"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#get(org.apache.hadoop.hbase.client.Get)"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Put.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#put(org.apache.hadoop.hbase.client.Put)"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#batch(java.util.List,java.lang.Object%5B%5D)"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/filter/InclusiveStopFilter.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Delete.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#delete(org.apache.hadoop.hbase.client.Delete)"},{href:"/docs/datamodel#delete-toc"},{href:"/docs/architecture/regions#compaction"},{href:"https://issues.apache.org/jira/browse/HBASE-2406"},{href:"https://web.archive.org/web/20160909085951/https://www.ngdata.com/bending-time-in-hbase/"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/ColumnFamilyDescriptorBuilder.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/ColumnFamilyDescriptorBuilder.html"},{href:"/docs/configuration/default#hbasecolumnmaxversion-toc"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html#readVersions(int)"},{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html#setTimeRange(long,long)"},{href:"http://hadoop-hbase.blogspot.com/2012/01/scanning-in-hbase.html"},{href:"https://lists.apache.org/thread/g6s0fkx74hbmc0pplnf5r3gq5xn4vkyt"},{href:"/docs/architecture/regions#keyvalue"},{href:"/docs/regionserver-sizing#keeping-deleted-cells"},{href:"https://issues.apache.org/jira/browse/HBASE-10118"},{href:"/docs/regionserver-sizing#keeping-deleted-cells"},{href:"/docs/datamodel#optional-new-version-and-delete-behavior-in-hbase-200"},{href:"https://issues.apache.org/jira/browse/HBASE-2256"},{href:"https://web.archive.org/web/20160909085951/https://www.ngdata.com/bending-time-in-hbase/"},{href:"/docs/architecture/regions#keyvalue"},{href:"/acid-semantics"},{href:"http://hadoop-hbase.blogspot.com/2012/03/acid-in-hbase.html"}],c={contents:[{heading:"table-toc",content:"An HBase table consists of multiple rows."},{heading:"row-toc",content:`A row in HBase consists of a row key and one or more columns with values associated with them.
Rows are sorted alphabetically by the row key as they are stored.
For this reason, the design of the row key is very important.
The goal is to store data in such a way that related rows are near each other.
A common row key pattern is a website domain.
If your row keys are domains, you should probably store them in reverse (org.apache.www, org.apache.mail, org.apache.jira). This way, all of the Apache domains are near each other in the table, rather than being spread out based on the first letter of the subdomain.`},{heading:"column-toc",content:"A column in HBase consists of a column family and a column qualifier, which are delimited by a : (colon) character."},{heading:"column-family-toc",content:`Column families physically colocate a set of columns and their values, often for performance reasons.
Each column family has a set of storage properties, such as whether its values should be cached in memory, how its data is compressed or its row keys are encoded, and others.
Each row in a table has the same column families, though a given row might not store anything in a given column family.`},{heading:"column-qualifier-toc",content:`A column qualifier is added to a column family to provide the index for a given piece of data.
Given a column family content, a column qualifier might be content:html, and another might be content:pdf.
Though column families are fixed at table creation, column qualifiers are mutable and may differ greatly between rows.`},{heading:"cell-toc",content:"A cell is a combination of row, column family, and column qualifier, and contains a value and a timestamp, which represents the value's version."},{heading:"timestamp-toc",content:`A timestamp is written alongside each value, and is the identifier for a given version of a value.
By default, the timestamp represents the time on the RegionServer when the data was written, but you can specify a different timestamp value when you put data into the cell.`},{heading:"conceptual-view",content:`You can read a very understandable explanation of the HBase data model in the blog post Understanding HBase and BigTable by Jim R. Wilson.
Another good explanation is available in the PDF Introduction to Basic Schema Design by Amandeep Khurana.`},{heading:"conceptual-view",content:`It may help to read different perspectives to get a solid understanding of HBase schema design.
The linked articles cover the same ground as the information in this section.`},{heading:"conceptual-view",content:`The following example is a slightly modified form of the one on page 2 of the BigTable paper.
There is a table called webtable that contains two rows (com.cnn.www and com.example.www) and three column families named contents, anchor, and people.
In this example, for the first row (com.cnn.www), anchor contains two columns (anchor:cssnsi.com, anchor:my.look.ca) and contents contains one column (contents:html). This example contains 5 versions of the row with the row key com.cnn.www, and one version of the row with the row key com.example.www.
The contents:html column qualifier contains the entire HTML of a given website.
Qualifiers of the anchor column family each contain the external site which links to the site represented by the row, along with the text it used in the anchor of its link.
The people column family represents people associated with the site.`},{heading:"conceptual-view",content:"type: info"},{heading:"conceptual-view",content:"title: Column Names"},{heading:"conceptual-view",content:`By convention, a column name is made of its column family prefix and a qualifier. For example,
the column contents:html is made up of the column family contents and the html qualifier.
The colon character (:) delimits the column family from the column family qualifier.`},{heading:"table-webtable-toc",content:"Row Key"},{heading:"table-webtable-toc",content:"Time Stamp"},{heading:"table-webtable-toc",content:"ColumnFamily contents"},{heading:"table-webtable-toc",content:"ColumnFamily anchor"},{heading:"table-webtable-toc",content:"ColumnFamily people"},{heading:"table-webtable-toc",content:'"com.cnn.www"'},{heading:"table-webtable-toc",content:"t9"},{heading:"table-webtable-toc",content:'anchor:cnnsi.com = "CNN"'},{heading:"table-webtable-toc",content:'"com.cnn.www"'},{heading:"table-webtable-toc",content:"t8"},{heading:"table-webtable-toc",content:'anchor:my.look.ca = "CNN.com"'},{heading:"table-webtable-toc",content:'"com.cnn.www"'},{heading:"table-webtable-toc",content:"t6"},{heading:"table-webtable-toc",content:'contents:html = "<html>..."'},{heading:"table-webtable-toc",content:'"com.cnn.www"'},{heading:"table-webtable-toc",content:"t5"},{heading:"table-webtable-toc",content:'contents:html = "<html>..."'},{heading:"table-webtable-toc",content:'"com.cnn.www"'},{heading:"table-webtable-toc",content:"t3"},{heading:"table-webtable-toc",content:'contents:html = "<html>..."'},{heading:"table-webtable-toc",content:'"com.example.www"'},{heading:"table-webtable-toc",content:"t5"},{heading:"table-webtable-toc",content:'contents:html = "<html>..."'},{heading:"table-webtable-toc",content:'people:author = "John Doe"'},{heading:"table-webtable-toc",content:`Cells in this table that appear to be empty do not take space, or in fact exist, in HBase.
This is what makes HBase "sparse." A tabular view is not the only possible way to look at data in HBase, or even the most accurate.
The following represents the same information as a multi-dimensional map.
This is only a mock-up for illustrative purposes and may not be strictly accurate.`},{heading:"physical-view",content:`Although at a conceptual level tables may be viewed as a sparse set of rows, they are physically stored by column family.
A new column qualifier (column_family:column_qualifier) can be added to an existing column family at any time.`},{heading:"columnfamily-anchor-toc",content:"Row Key"},{heading:"columnfamily-anchor-toc",content:"Time Stamp"},{heading:"columnfamily-anchor-toc",content:"Column Family anchor"},{heading:"columnfamily-anchor-toc",content:'"com.cnn.www"'},{heading:"columnfamily-anchor-toc",content:"t9"},{heading:"columnfamily-anchor-toc",content:'anchor:cnnsi.com = "CNN"'},{heading:"columnfamily-anchor-toc",content:'"com.cnn.www"'},{heading:"columnfamily-anchor-toc",content:"t8"},{heading:"columnfamily-anchor-toc",content:'anchor:my.look.ca = "CNN.com"'},{heading:"columnfamily-contents-toc",content:"Row Key"},{heading:"columnfamily-contents-toc",content:"Time Stamp"},{heading:"columnfamily-contents-toc",content:"ColumnFamily contents:"},{heading:"columnfamily-contents-toc",content:'"com.cnn.www"'},{heading:"columnfamily-contents-toc",content:"t6"},{heading:"columnfamily-contents-toc",content:'contents:html = "<html>..."'},{heading:"columnfamily-contents-toc",content:'"com.cnn.www"'},{heading:"columnfamily-contents-toc",content:"t5"},{heading:"columnfamily-contents-toc",content:'contents:html = "<html>..."'},{heading:"columnfamily-contents-toc",content:'"com.cnn.www"'},{heading:"columnfamily-contents-toc",content:"t3"},{heading:"columnfamily-contents-toc",content:'contents:html = "<html>..."'},{heading:"columnfamily-contents-toc",content:`The empty cells shown in the conceptual view are not stored at all.
Thus a request for the value of the contents:html column at time stamp t8 would return no value.
Similarly, a request for an anchor:my.look.ca value at time stamp t9 would return no value.
However, if no timestamp is supplied, the most recent value for a particular column would be returned.
Given multiple versions, the most recent is also the first one found, since timestamps are stored in descending order.
Thus a request for the values of all columns in the row com.cnn.www if no timestamp is specified would be: the value of contents:html from timestamp t6, the value of anchor:cnnsi.com from timestamp t9, the value of anchor:my.look.ca from timestamp t8.`},{heading:"columnfamily-contents-toc",content:"For more information about the internals of how Apache HBase stores data, see regions.arch."},{heading:"namespace",content:`A namespace is a logical grouping of tables analogous to a database in relation database systems.
This abstraction lays the groundwork for upcoming multi-tenancy related features:`},{heading:"namespace",content:"Quota Management (HBASE-8410) - Restrict the amount of resources (i.e. regions, tables) a namespace can consume."},{heading:"namespace",content:"Namespace Security Administration (HBASE-9206) - Provide another level of security administration for tenants."},{heading:"namespace",content:"Region server groups (HBASE-6721) - A namespace/table can be pinned onto a subset of RegionServers thus guaranteeing a coarse level of isolation."},{heading:"namespace-management",content:`A namespace can be created, removed or altered.
Namespace membership is determined during table creation by specifying a fully-qualified table name of the form:`},{heading:"predefined-namespaces",content:"There are two predefined special namespaces:"},{heading:"predefined-namespaces",content:"hbase - system namespace, used to contain HBase internal tables"},{heading:"predefined-namespaces",content:"default - tables with no explicit specified namespace will automatically fall into this namespace"},{heading:"about-hbasenamespace-table",content:"We used to have a system table called hbase:namespace for storing the namespace information."},{heading:"about-hbasenamespace-table",content:`It introduced some painful bugs in the past, especially that it may hang the master startup thus
hang the whole cluster. This is because meta table also has a namespace, so it depends on namespace
table. But namespace table also depends on meta table as meta table stores the location of all
regions. This is a cyclic dependency so sometimes namespace and meta table will wait for each other
to online and hang the master start up.`},{heading:"about-hbasenamespace-table",content:`It is not easy to fix so in 3.0.0, we decided to completely remove the hbase:namespace table and
fold its content into the ns family in hbase:meta table. When upgrading from 2.x to 3.x, the
migration will be done automatically and the hbase:namespace table will be disabled after the
migration is done. You are free to leave it there for sometime and finally drop it.`},{heading:"about-hbasenamespace-table",content:"For more tails, please see https://issues.apache.org/jira/browse/HBASE-21154."},{heading:"table",content:"Tables are declared up front at schema definition time."},{heading:"row",content:`Row keys are uninterpreted bytes.
Rows are lexicographically sorted with the lowest order appearing first in a table.
The empty byte array is used to denote both the start and end of a tables' namespace.`},{heading:"column-family",content:`Columns in Apache HBase are grouped into column families.
All column members of a column family have the same prefix.
For example, the columns courses:history and courses:math are both members of the courses column family.
The colon character (:) delimits the column family from the column family qualifier.
The column family prefix must be composed of printable characters.
The qualifying tail, the column family qualifier, can be made of any arbitrary bytes.
Column families must be declared up front at schema definition time whereas columns do not need to be defined at schema time but can be conjured on the fly while the table is up and running.`},{heading:"column-family",content:`Physically, all column family members are stored together on the filesystem.
Because tunings and storage specifications are done at the column family level, it is advised that all column family members have the same general access pattern and size characteristics.`},{heading:"cells",content:`A {row, column, version} tuple exactly specifies a cell in HBase.
Cell content is uninterpreted bytes`},{heading:"data-model-operations",content:`The four primary data model operations are Get, Put, Scan, and Delete.
Operations are applied via Table instances.`},{heading:"get",content:`Get returns attributes for a specified row.
Gets are executed via Table.get`},{heading:"put",content:"Put either adds new rows to a table (if the key is new) or can update existing rows (if the key already exists). Puts are executed via Table.put (non-writeBuffer) or Table.batch (non-writeBuffer)"},{heading:"data-model-operations-scans",content:"Scan allow iteration over multiple rows for specified attributes."},{heading:"data-model-operations-scans",content:`The following is an example of a Scan on a Table instance.
Assume that a table is populated with rows with keys "row1", "row2", "row3", and then another set of rows with the keys "abc1", "abc2", and "abc3". The following example shows how to set a Scan instance to return the rows beginning with "row".`},{heading:"data-model-operations-scans",content:"Note that generally the easiest way to specify a specific stop point for a scan is by using the InclusiveStopFilter class."},{heading:"delete",content:`Delete removes a row from a table.
Deletes are executed via Table.delete.`},{heading:"delete",content:`HBase does not modify data in place, and so deletes are handled by creating new markers called tombstones.
These tombstones, along with the dead values, are cleaned up on major compactions.`},{heading:"delete",content:"See version.delete for more information on deleting versions of columns, and see compaction for more information on compactions."},{heading:"versions",content:`A {row, column, version} tuple exactly specifies a cell in HBase.
It's possible to have an unbounded number of cells where the row and column are the same but the cell address differs only in its version dimension.`},{heading:"versions",content:`While rows and column keys are expressed as bytes, the version is specified using a long integer.
Typically this long contains time instances such as those returned by java.util.Date.getTime() or System.currentTimeMillis(), that is: the difference, measured in milliseconds, between the current time and midnight, January 1, 1970 UTC.`},{heading:"versions",content:"The HBase version dimension is stored in decreasing order, so that when reading from a store file, the most recent values are found first."},{heading:"versions",content:`There is a lot of confusion over the semantics of cell versions, in HBase.
In particular:`},{heading:"versions",content:"If multiple writes to a cell have the same version, only the last written is fetchable."},{heading:"versions",content:"It is OK to write cells in a non-increasing version order."},{heading:"versions",content:`Below we describe how the version dimension in HBase currently works.
See HBASE-2406 for discussion of HBase versions. Bending time in HBase makes for a good read on the version, or time, dimension in HBase.
It has more detail on versioning than is provided here.`},{heading:"versions",content:`As of this writing, the limitation Overwriting values at existing timestamps mentioned in the article no longer holds in HBase.
This section is basically a synopsis of this article by Bruno Dumon.`},{heading:"specifying-the-number-of-versions-to-store",content:`The maximum number of versions to store for a given column is part of the column schema and is specified at table creation, or via an alter command, via HColumnDescriptor.DEFAULT_VERSIONS.
Prior to HBase 0.96, the default number of versions kept was 3, but in 0.96 and newer has been changed to 1.`},{heading:"example-modify-the-maximum-number-of-versions-for-a-column-family-toc",content:`This example uses HBase Shell to keep a maximum of 5 versions of all columns in column family f1.
You could also use ColumnFamilyDescriptorBuilder.`},{heading:"example-modify-the-minimum-number-of-versions-for-a-column-family-toc",content:`You can also specify the minimum number of versions to store per column family.
By default, this is set to 0, which means the feature is disabled.
The following example sets the minimum number of versions on all columns in column family f1 to 2, via HBase Shell.
You could also use ColumnFamilyDescriptorBuilder.`},{heading:"example-modify-the-minimum-number-of-versions-for-a-column-family-toc",content:`Starting with HBase 0.98.2, you can specify a global default for the maximum number of versions kept for all newly-created columns, by setting hbase.column.max.version in hbase-site.xml.
See hbase.column.max.version.`},{heading:"versions-and-hbase-operations",content:"In this section we look at the behavior of the version dimension for each of the core HBase operations."},{heading:"getscan",content:`Gets are implemented on top of Scans.
The below discussion of Get applies equally to Scans.`},{heading:"getscan",content:"By default, i.e. if you specify no explicit version, when doing a get, the cell whose version has the largest value is returned (which may or may not be the latest one written, see later). The default behavior can be modified in the following ways:"},{heading:"getscan",content:"to return more than one version, see Get.readVersions(int)"},{heading:"getscan",content:"to return versions other than the latest, see Get.setTimeRange(long,long)"},{heading:"getscan",content:"To retrieve the latest version that is less than or equal to a given value, thus giving the 'latest' state of the record at a certain point in time, just use a range from 0 to the desired version and set the max versions to 1."},{heading:"default-get-example",content:"The following Get will only retrieve the current version of the row"},{heading:"versioned-get-example",content:"The following Get will return the last 3 versions of the row."},{heading:"put-1",content:`Doing a put always creates a new version of a cell, at a certain timestamp.
By default the system uses the server's currentTimeMillis, but you can specify the version (= the long integer) yourself, on a per-column level.
This means you could assign a time in the past or the future, or use the long value for non-time purposes.`},{heading:"put-1",content:"To overwrite an existing value, do a put at exactly the same row, column, and version as that of the cell you want to overwrite."},{heading:"implicit-version-example-toc",content:"The following Put will be implicitly versioned by HBase with the current time."},{heading:"explicit-version-example",content:"The following Put has the version timestamp explicitly set."},{heading:"explicit-version-example",content:`Caution: the version timestamp is used internally by HBase for things like time-to-live calculations.
It's usually best to avoid setting this timestamp yourself.
Prefer using a separate timestamp attribute of the row, or have the timestamp as a part of the row key, or both.`},{heading:"cell-version-example-toc",content:`The following Put uses a method getCellBuilder() to get a CellBuilder instance
that already has relevant Type and Row set.`},{heading:"delete-toc",content:`There are three different types of internal delete markers.
See Lars Hofhansl's blog for discussion of his attempt adding another, Scanning in HBase: Prefix Delete Marker.`},{heading:"delete-toc",content:"Delete: for a specific version of a column."},{heading:"delete-toc",content:"Delete column: for all versions of a column."},{heading:"delete-toc",content:"Delete family: for all columns of a particular ColumnFamily"},{heading:"delete-toc",content:"When deleting an entire row, HBase will internally create a tombstone for each ColumnFamily (i.e., not each individual column)."},{heading:"delete-toc",content:`Deletes work by creating tombstone markers.
For example, let's suppose we want to delete a row.
For this you can specify a version, or else by default the currentTimeMillis is used.
What this means is delete all cells where the version is less than or equal to this version.
HBase never modifies data in place, so for example a delete will not immediately delete (or mark as deleted) the entries in the storage file that correspond to the delete condition.
Rather, a so-called tombstone is written, which will mask the deleted values.
When HBase does a major compaction, the tombstones are processed to actually remove the dead values, together with the tombstones themselves.
If the version you specified when deleting a row is larger than the version of any value in the row, then you can consider the complete row to be deleted.`},{heading:"delete-toc",content:"For an informative discussion on how deletes and versioning interact, see the thread Put w/timestamp -> Deleteall -> Put w/ timestamp fails up on the user mailing list."},{heading:"delete-toc",content:"Also see keyvalue for more information on the internal KeyValue format."},{heading:"delete-toc",content:`Delete markers are purged during the next major compaction of the store, unless the KEEP_DELETED_CELLS option is set in the column family (See Keeping Deleted Cells).
To keep the deletes for a configurable amount of time, you can set the delete TTL via the hbase.hstore.time.to.purge.deletes property in hbase-site.xml.
If hbase.hstore.time.to.purge.deletes is not set, or set to 0, all delete markers, including those with timestamps in the future, are purged during the next major compaction.
Otherwise, a delete marker with a timestamp in the future is kept until the major compaction which occurs after the time represented by the marker's timestamp plus the value of hbase.hstore.time.to.purge.deletes, in milliseconds.`},{heading:"delete-toc",content:"type: info"},{heading:"delete-toc",content:`This behavior represents a fix for an unexpected change that was introduced in HBase 0.94, and was
fixed in HBASE-10118. The change has been
backported to HBase 0.94 and newer branches.`},{heading:"optional-new-version-and-delete-behavior-in-hbase-200",content:`In hbase-2.0.0, the operator can specify an alternate version and
delete treatment by setting the column descriptor property
NEW_VERSION_BEHAVIOR to true (To set a property on a column family
descriptor, you must first disable the table and then alter the
column family descriptor; see Keeping Deleted Cells for an example
of editing an attribute on a column family descriptor).`},{heading:"optional-new-version-and-delete-behavior-in-hbase-200",content:`The 'new version behavior', undoes the limitations listed below
whereby a Delete ALWAYS overshadows a Put if at the same
location — i.e. same row, column family, qualifier and timestamp
-- regardless of which arrived first. Version accounting is also
changed as deleted versions are considered toward total version count.
This is done to ensure results are not changed should a major
compaction intercede. See HBASE-15968 and linked issues for
discussion.`},{heading:"optional-new-version-and-delete-behavior-in-hbase-200",content:`Running with this new configuration currently costs; we factor
the Cell MVCC on every compare so we burn more CPU. The slow
down will depend. In testing we've seen between 0% and 25%
degradation.`},{heading:"optional-new-version-and-delete-behavior-in-hbase-200",content:`If replicating, it is advised that you run with the new
serial replication feature (See HBASE-9465; the serial
replication feature did NOT make it into hbase-2.0.0 but
should arrive in a subsequent hbase-2.x release) as now
the order in which Mutations arrive is a factor.`},{heading:"current-limitations",content:`The below limitations are addressed in hbase-2.0.0. See
the section above, Optional New Version and Delete behavior in HBase-2.0.0.`},{heading:"deletes-mask-puts",content:`Deletes mask puts, even puts that happened after the delete was entered.
See HBASE-2256.
Remember that a delete writes a tombstone, which only disappears after then next major compaction has run.
Suppose you do a delete of everything <= T.
After this you do a new put with a timestamp <= T.
This put, even if it happened after the delete, will be masked by the delete tombstone.
Performing the put will not fail, but when you do a get you will notice the put did have no effect.
It will start working again after the major compaction has run.
These issues should not be a problem if you use always-increasing versions for new puts to a row.
But they can occur even if you do not care about time: just do delete and put immediately after each other, and there is some chance they happen within the same millisecond.`},{heading:"major-compactions-change-query-results",content:`...create three cell versions at t1, t2 and t3, with a maximum-versions
setting of 2. So when getting all versions, only the values at t2 and t3 will be
returned. But if you delete the version at t2 or t3, the one at t1 will appear again.
Obviously, once a major compaction has run, such behavior will not be the case
anymore... (See Garbage Collection in Bending time in HBase.)`},{heading:"sort-order",content:`All data model operations HBase return data in sorted order.
First by row, then by ColumnFamily, followed by column qualifier, and finally timestamp (sorted in reverse, so newest records are returned first).`},{heading:"column-metadata",content:`There is no store of column metadata outside of the internal KeyValue instances for a ColumnFamily.
Thus, while HBase can support not only a wide number of columns per row, but a heterogeneous set of columns between rows as well, it is your responsibility to keep track of the column names.`},{heading:"column-metadata",content:`The only way to get a complete set of columns that exist for a ColumnFamily is to process all the rows.
For more information about how HBase stores data internally, see keyvalue.`},{heading:"datamodel-joins",content:"Whether HBase supports joins is a common question on the dist-list, and there is a simple answer: it doesn't, at not least in the way that RDBMS' support them (e.g., with equi-joins or outer-joins in SQL). As has been illustrated in this chapter, the read data model operations in HBase are Get and Scan."},{heading:"datamodel-joins",content:`However, that doesn't mean that equivalent join functionality can't be supported in your application, but you have to do it yourself.
The two primary strategies are either denormalizing the data upon writing to HBase, or to have lookup tables and do the join between HBase tables in your application or MapReduce code (and as RDBMS' demonstrate, there are several strategies for this depending on the size of the tables, e.g., nested loops vs.
hash-joins). So which is the best approach? It depends on what you are trying to do, and as such there isn't a single answer that works for every use case.`},{heading:"acid",content:`See ACID Semantics.
Lars Hofhansl has also written a note on ACID in HBase.`}],headings:[{id:"hbase-data-model-terminology",content:"HBase Data Model Terminology"},{id:"table-toc",content:"Table [!toc]"},{id:"row-toc",content:"Row [!toc]"},{id:"column-toc",content:"Column [!toc]"},{id:"column-family-toc",content:"Column Family [!toc]"},{id:"column-qualifier-toc",content:"Column Qualifier [!toc]"},{id:"cell-toc",content:"Cell [!toc]"},{id:"timestamp-toc",content:"Timestamp [!toc]"},{id:"conceptual-view",content:"Conceptual View"},{id:"table-webtable-toc",content:"Table webtable [!toc]"},{id:"physical-view",content:"Physical View"},{id:"columnfamily-anchor-toc",content:"ColumnFamily anchor [!toc]"},{id:"columnfamily-contents-toc",content:"ColumnFamily contents [!toc]"},{id:"namespace",content:"Namespace"},{id:"namespace-management",content:"Namespace management"},{id:"datamodel-namespace-management-examples",content:"Examples"},{id:"predefined-namespaces",content:"Predefined namespaces"},{id:"examples-datamodel-predefined-namespaces-examples",content:"Examples #datamodel-predefined-namespaces-examples"},{id:"about-hbasenamespace-table",content:"About hbase:namespace table"},{id:"table",content:"Table"},{id:"row",content:"Row"},{id:"column-family",content:"Column Family"},{id:"cells",content:"Cells"},{id:"data-model-operations",content:"Data Model Operations"},{id:"get",content:"Get"},{id:"put",content:"Put"},{id:"data-model-operations-scans",content:"Scans"},{id:"delete",content:"Delete"},{id:"versions",content:"Versions"},{id:"specifying-the-number-of-versions-to-store",content:"Specifying the Number of Versions to Store"},{id:"example-modify-the-maximum-number-of-versions-for-a-column-family-toc",content:"Example: Modify the Maximum Number of Versions for a Column Family [!toc]"},{id:"example-modify-the-minimum-number-of-versions-for-a-column-family-toc",content:"Example: Modify the Minimum Number of Versions for a Column Family [!toc]"},{id:"versions-and-hbase-operations",content:"Versions and HBase Operations"},{id:"getscan",content:"Get/Scan"},{id:"default-get-example",content:"Default Get Example"},{id:"versioned-get-example",content:"Versioned Get Example"},{id:"put-1",content:"Put"},{id:"implicit-version-example-toc",content:"Implicit Version Example [!toc]"},{id:"explicit-version-example",content:"Explicit Version Example"},{id:"cell-version-example-toc",content:"Cell Version Example [!toc]"},{id:"delete-toc",content:"Delete [!toc]"},{id:"optional-new-version-and-delete-behavior-in-hbase-200",content:"Optional New Version and Delete behavior in HBase-2.0.0"},{id:"current-limitations",content:"Current Limitations"},{id:"deletes-mask-puts",content:"Deletes mask Puts"},{id:"major-compactions-change-query-results",content:"Major compactions change query results"},{id:"sort-order",content:"Sort Order"},{id:"column-metadata",content:"Column Metadata"},{id:"datamodel-joins",content:"Joins"},{id:"acid",content:"ACID"}]};const d=[{depth:2,url:"#hbase-data-model-terminology",title:e.jsx(e.Fragment,{children:"HBase Data Model Terminology"})},{depth:2,url:"#conceptual-view",title:e.jsx(e.Fragment,{children:"Conceptual View"})},{depth:2,url:"#physical-view",title:e.jsx(e.Fragment,{children:"Physical View"})},{depth:2,url:"#namespace",title:e.jsx(e.Fragment,{children:"Namespace"})},{depth:3,url:"#namespace-management",title:e.jsx(e.Fragment,{children:"Namespace management"})},{depth:4,url:"#datamodel-namespace-management-examples",title:e.jsx(e.Fragment,{children:"Examples"})},{depth:3,url:"#predefined-namespaces",title:e.jsx(e.Fragment,{children:"Predefined namespaces"})},{depth:4,url:"#examples-datamodel-predefined-namespaces-examples",title:e.jsx(e.Fragment,{children:"Examples #datamodel-predefined-namespaces-examples"})},{depth:3,url:"#about-hbasenamespace-table",title:e.jsx(e.Fragment,{children:"About hbase:namespace table"})},{depth:2,url:"#table",title:e.jsx(e.Fragment,{children:"Table"})},{depth:2,url:"#row",title:e.jsx(e.Fragment,{children:"Row"})},{depth:2,url:"#column-family",title:e.jsx(e.Fragment,{children:"Column Family"})},{depth:2,url:"#cells",title:e.jsx(e.Fragment,{children:"Cells"})},{depth:2,url:"#data-model-operations",title:e.jsx(e.Fragment,{children:"Data Model Operations"})},{depth:3,url:"#get",title:e.jsx(e.Fragment,{children:"Get"})},{depth:3,url:"#put",title:e.jsx(e.Fragment,{children:"Put"})},{depth:3,url:"#data-model-operations-scans",title:e.jsx(e.Fragment,{children:"Scans"})},{depth:3,url:"#delete",title:e.jsx(e.Fragment,{children:"Delete"})},{depth:2,url:"#versions",title:e.jsx(e.Fragment,{children:"Versions"})},{depth:3,url:"#specifying-the-number-of-versions-to-store",title:e.jsx(e.Fragment,{children:"Specifying the Number of Versions to Store"})},{depth:3,url:"#versions-and-hbase-operations",title:e.jsx(e.Fragment,{children:"Versions and HBase Operations"})},{depth:4,url:"#getscan",title:e.jsx(e.Fragment,{children:"Get/Scan"})},{depth:4,url:"#default-get-example",title:e.jsx(e.Fragment,{children:"Default Get Example"})},{depth:4,url:"#versioned-get-example",title:e.jsx(e.Fragment,{children:"Versioned Get Example"})},{depth:4,url:"#put-1",title:e.jsx(e.Fragment,{children:"Put"})},{depth:4,url:"#explicit-version-example",title:e.jsx(e.Fragment,{children:"Explicit Version Example"})},{depth:3,url:"#optional-new-version-and-delete-behavior-in-hbase-200",title:e.jsx(e.Fragment,{children:"Optional New Version and Delete behavior in HBase-2.0.0"})},{depth:3,url:"#current-limitations",title:e.jsx(e.Fragment,{children:"Current Limitations"})},{depth:4,url:"#deletes-mask-puts",title:e.jsx(e.Fragment,{children:"Deletes mask Puts"})},{depth:4,url:"#major-compactions-change-query-results",title:e.jsx(e.Fragment,{children:"Major compactions change query results"})},{depth:2,url:"#sort-order",title:e.jsx(e.Fragment,{children:"Sort Order"})},{depth:2,url:"#column-metadata",title:e.jsx(e.Fragment,{children:"Column Metadata"})},{depth:2,url:"#datamodel-joins",title:e.jsx(e.Fragment,{children:"Joins"})},{depth:2,url:"#acid",title:e.jsx(e.Fragment,{children:"ACID"})}];function n(s){const i={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components},{Callout:t}=i;return t||a("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"hbase-data-model-terminology",children:"HBase Data Model Terminology"}),`
`,e.jsx(i.h4,{id:"table-toc",children:"Table"}),`
`,e.jsx(i.p,{children:"An HBase table consists of multiple rows."}),`
`,e.jsx(i.h4,{id:"row-toc",children:"Row"}),`
`,e.jsx(i.p,{children:`A row in HBase consists of a row key and one or more columns with values associated with them.
Rows are sorted alphabetically by the row key as they are stored.
For this reason, the design of the row key is very important.
The goal is to store data in such a way that related rows are near each other.
A common row key pattern is a website domain.
If your row keys are domains, you should probably store them in reverse (org.apache.www, org.apache.mail, org.apache.jira). This way, all of the Apache domains are near each other in the table, rather than being spread out based on the first letter of the subdomain.`}),`
`,e.jsx(i.h4,{id:"column-toc",children:"Column"}),`
`,e.jsxs(i.p,{children:["A column in HBase consists of a column family and a column qualifier, which are delimited by a ",e.jsx(i.code,{children:":"})," (colon) character."]}),`
`,e.jsx(i.h4,{id:"column-family-toc",children:"Column Family"}),`
`,e.jsx(i.p,{children:`Column families physically colocate a set of columns and their values, often for performance reasons.
Each column family has a set of storage properties, such as whether its values should be cached in memory, how its data is compressed or its row keys are encoded, and others.
Each row in a table has the same column families, though a given row might not store anything in a given column family.`}),`
`,e.jsx(i.h4,{id:"column-qualifier-toc",children:"Column Qualifier"}),`
`,e.jsxs(i.p,{children:[`A column qualifier is added to a column family to provide the index for a given piece of data.
Given a column family `,e.jsx(i.code,{children:"content"}),", a column qualifier might be ",e.jsx(i.code,{children:"content:html"}),", and another might be ",e.jsx(i.code,{children:"content:pdf"}),`.
Though column families are fixed at table creation, column qualifiers are mutable and may differ greatly between rows.`]}),`
`,e.jsx(i.h4,{id:"cell-toc",children:"Cell"}),`
`,e.jsx(i.p,{children:"A cell is a combination of row, column family, and column qualifier, and contains a value and a timestamp, which represents the value's version."}),`
`,e.jsx(i.h4,{id:"timestamp-toc",children:"Timestamp"}),`
`,e.jsx(i.p,{children:`A timestamp is written alongside each value, and is the identifier for a given version of a value.
By default, the timestamp represents the time on the RegionServer when the data was written, but you can specify a different timestamp value when you put data into the cell.`}),`
`,e.jsx(i.h2,{id:"conceptual-view",children:"Conceptual View"}),`
`,e.jsxs(i.p,{children:["You can read a very understandable explanation of the HBase data model in the blog post ",e.jsx(i.a,{href:"https://dzone.com/articles/understanding-hbase-and-bigtab",children:"Understanding HBase and BigTable"}),` by Jim R. Wilson.
Another good explanation is available in the PDF `,e.jsx(i.a,{href:"http://0b4af6cdc2f0c5998459-c0245c5c937c5dedcca3f1764ecc9b2f.r43.cf2.rackcdn.com/9353-login1210_khurana.pdf",children:"Introduction to Basic Schema Design"})," by Amandeep Khurana."]}),`
`,e.jsx(i.p,{children:`It may help to read different perspectives to get a solid understanding of HBase schema design.
The linked articles cover the same ground as the information in this section.`}),`
`,e.jsxs(i.p,{children:["The following example is a slightly modified form of the one on page 2 of the ",e.jsx(i.a,{href:"http://research.google.com/archive/bigtable.html",children:"BigTable"}),` paper.
There is a table called `,e.jsx(i.code,{children:"webtable"})," that contains two rows (",e.jsx(i.code,{children:"com.cnn.www"})," and ",e.jsx(i.code,{children:"com.example.www"}),") and three column families named ",e.jsx(i.code,{children:"contents"}),", ",e.jsx(i.code,{children:"anchor"}),", and ",e.jsx(i.code,{children:"people"}),`.
In this example, for the first row (`,e.jsx(i.code,{children:"com.cnn.www"}),"), ",e.jsx(i.code,{children:"anchor"})," contains two columns (",e.jsx(i.code,{children:"anchor:cssnsi.com"}),", ",e.jsx(i.code,{children:"anchor:my.look.ca"}),") and ",e.jsx(i.code,{children:"contents"})," contains one column (",e.jsx(i.code,{children:"contents:html"}),"). This example contains 5 versions of the row with the row key ",e.jsx(i.code,{children:"com.cnn.www"}),", and one version of the row with the row key ",e.jsx(i.code,{children:"com.example.www"}),`.
The `,e.jsx(i.code,{children:"contents:html"}),` column qualifier contains the entire HTML of a given website.
Qualifiers of the `,e.jsx(i.code,{children:"anchor"}),` column family each contain the external site which links to the site represented by the row, along with the text it used in the anchor of its link.
The `,e.jsx(i.code,{children:"people"})," column family represents people associated with the site."]}),`
`,e.jsx(t,{type:"info",title:"Column Names",children:e.jsxs(i.p,{children:["By convention, a column name is made of its column family prefix and a ",e.jsx(i.em,{children:"qualifier"}),`. For example,
the column `,e.jsx(i.em,{children:"contents:html"})," is made up of the column family ",e.jsx(i.code,{children:"contents"})," and the ",e.jsx(i.code,{children:"html"}),` qualifier.
The colon character (`,e.jsx(i.code,{children:":"}),") delimits the column family from the column family ",e.jsx(i.em,{children:"qualifier"}),"."]})}),`
`,e.jsxs(i.h4,{id:"table-webtable-toc",children:["Table ",e.jsx(i.code,{children:"webtable"})]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Row Key"}),e.jsx(i.th,{children:"Time Stamp"}),e.jsxs(i.th,{children:["ColumnFamily ",e.jsx(i.code,{children:"contents"})]}),e.jsxs(i.th,{children:["ColumnFamily ",e.jsx(i.code,{children:"anchor"})]}),e.jsxs(i.th,{children:["ColumnFamily ",e.jsx(i.code,{children:"people"})]})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:'"com.cnn.www"'}),e.jsx(i.td,{children:"t9"}),e.jsx(i.td,{}),e.jsx(i.td,{children:'anchor:cnnsi.com = "CNN"'}),e.jsx(i.td,{})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:'"com.cnn.www"'}),e.jsx(i.td,{children:"t8"}),e.jsx(i.td,{}),e.jsx(i.td,{children:'anchor:my.look.ca = "CNN.com"'}),e.jsx(i.td,{})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:'"com.cnn.www"'}),e.jsx(i.td,{children:"t6"}),e.jsx(i.td,{children:'contents:html = "<html>..."'}),e.jsx(i.td,{}),e.jsx(i.td,{})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:'"com.cnn.www"'}),e.jsx(i.td,{children:"t5"}),e.jsx(i.td,{children:'contents:html = "<html>..."'}),e.jsx(i.td,{}),e.jsx(i.td,{})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:'"com.cnn.www"'}),e.jsx(i.td,{children:"t3"}),e.jsx(i.td,{children:'contents:html = "<html>..."'}),e.jsx(i.td,{}),e.jsx(i.td,{})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:'"com.example.www"'}),e.jsx(i.td,{children:"t5"}),e.jsx(i.td,{children:'contents:html = "<html>..."'}),e.jsx(i.td,{}),e.jsx(i.td,{children:'people:author = "John Doe"'})]})]})]}),`
`,e.jsx(i.p,{children:`Cells in this table that appear to be empty do not take space, or in fact exist, in HBase.
This is what makes HBase "sparse." A tabular view is not the only possible way to look at data in HBase, or even the most accurate.
The following represents the same information as a multi-dimensional map.
This is only a mock-up for illustrative purposes and may not be strictly accurate.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "com.cnn.www"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"    contents"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"      t6"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"contents:html:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "<html>..."'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"      t"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"5"}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:" contents:html:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "<html>..."'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"      t"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:" contents:html:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "<html>..."'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"    anchor:"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"      t9"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"anchor:cnnsi.com"}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "CNN"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"      t"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"8"}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:" anchor:my.look.ca"}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "CNN.com"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"    people:"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {}"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "com.example.www"'}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"    contents"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"      t5"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"contents:html:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "<html>..."'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"    anchor:"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"    people:"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"      t5"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"people:author:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "John Doe"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.h2,{id:"physical-view",children:"Physical View"}),`
`,e.jsx(i.p,{children:`Although at a conceptual level tables may be viewed as a sparse set of rows, they are physically stored by column family.
A new column qualifier (column_family:column_qualifier) can be added to an existing column family at any time.`}),`
`,e.jsxs(i.h4,{id:"columnfamily-anchor-toc",children:["ColumnFamily ",e.jsx(i.code,{children:"anchor"})]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Row Key"}),e.jsx(i.th,{children:"Time Stamp"}),e.jsxs(i.th,{children:["Column Family ",e.jsx(i.code,{children:"anchor"})]})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:'"com.cnn.www"'}),e.jsx(i.td,{children:"t9"}),e.jsx(i.td,{children:e.jsx(i.code,{children:'anchor:cnnsi.com = "CNN"'})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:'"com.cnn.www"'}),e.jsx(i.td,{children:"t8"}),e.jsx(i.td,{children:e.jsx(i.code,{children:'anchor:my.look.ca = "CNN.com"'})})]})]})]}),`
`,e.jsxs(i.h4,{id:"columnfamily-contents-toc",children:["ColumnFamily ",e.jsx(i.code,{children:"contents"})]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Row Key"}),e.jsx(i.th,{children:"Time Stamp"}),e.jsxs(i.th,{children:["ColumnFamily ",e.jsx(i.code,{children:"contents:"})]})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:'"com.cnn.www"'}),e.jsx(i.td,{children:"t6"}),e.jsx(i.td,{children:'contents:html = "<html>..."'})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:'"com.cnn.www"'}),e.jsx(i.td,{children:"t5"}),e.jsx(i.td,{children:'contents:html = "<html>..."'})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:'"com.cnn.www"'}),e.jsx(i.td,{children:"t3"}),e.jsx(i.td,{children:'contents:html = "<html>..."'})]})]})]}),`
`,e.jsxs(i.p,{children:[`The empty cells shown in the conceptual view are not stored at all.
Thus a request for the value of the `,e.jsx(i.code,{children:"contents:html"})," column at time stamp ",e.jsx(i.code,{children:"t8"}),` would return no value.
Similarly, a request for an `,e.jsx(i.code,{children:"anchor:my.look.ca"})," value at time stamp ",e.jsx(i.code,{children:"t9"}),` would return no value.
However, if no timestamp is supplied, the most recent value for a particular column would be returned.
Given multiple versions, the most recent is also the first one found, since timestamps are stored in descending order.
Thus a request for the values of all columns in the row `,e.jsx(i.code,{children:"com.cnn.www"})," if no timestamp is specified would be: the value of ",e.jsx(i.code,{children:"contents:html"})," from timestamp ",e.jsx(i.code,{children:"t6"}),", the value of ",e.jsx(i.code,{children:"anchor:cnnsi.com"})," from timestamp ",e.jsx(i.code,{children:"t9"}),", the value of ",e.jsx(i.code,{children:"anchor:my.look.ca"})," from timestamp ",e.jsx(i.code,{children:"t8"}),"."]}),`
`,e.jsxs(i.p,{children:["For more information about the internals of how Apache HBase stores data, see ",e.jsx(i.a,{href:"/docs/architecture/regions",children:"regions.arch"}),"."]}),`
`,e.jsx(i.h2,{id:"namespace",children:"Namespace"}),`
`,e.jsx(i.p,{children:`A namespace is a logical grouping of tables analogous to a database in relation database systems.
This abstraction lays the groundwork for upcoming multi-tenancy related features:`}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Quota Management (",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-8410",children:"HBASE-8410"}),") - Restrict the amount of resources (i.e. regions, tables) a namespace can consume."]}),`
`,e.jsxs(i.li,{children:["Namespace Security Administration (",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-9206",children:"HBASE-9206"}),") - Provide another level of security administration for tenants."]}),`
`,e.jsxs(i.li,{children:["Region server groups (",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-6721",children:"HBASE-6721"}),") - A namespace/table can be pinned onto a subset of RegionServers thus guaranteeing a coarse level of isolation."]}),`
`]}),`
`,e.jsx(i.h3,{id:"namespace-management",children:"Namespace management"}),`
`,e.jsx(i.p,{children:`A namespace can be created, removed or altered.
Namespace membership is determined during table creation by specifying a fully-qualified table name of the form:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"table"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" namespace>:<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"table"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" qualifier>"})]})})})}),`
`,e.jsx(i.h4,{id:"datamodel-namespace-management-examples",children:"Examples"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"#Create a namespace"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create_namespace"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'my_ns'"})]})]})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"#create my_table in my_ns namespace"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'my_ns:my_table',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'fam'"})]})]})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"#drop namespace"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"drop_namespace"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'my_ns'"})]})]})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"#alter namespace"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"alter_namespace"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'my_ns',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {METHOD"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'set',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'PROPERTY_NAME'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'PROPERTY_VALUE'}"})]})]})})}),`
`,e.jsx(i.h3,{id:"predefined-namespaces",children:"Predefined namespaces"}),`
`,e.jsx(i.p,{children:"There are two predefined special namespaces:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"hbase - system namespace, used to contain HBase internal tables"}),`
`,e.jsx(i.li,{children:"default - tables with no explicit specified namespace will automatically fall into this namespace"}),`
`]}),`
`,e.jsx(i.h4,{id:"examples-datamodel-predefined-namespaces-examples",children:"Examples #datamodel-predefined-namespaces-examples"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"#namespace=foo and table qualifier=bar"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'foo:bar',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'fam'"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"#namespace=default and table qualifier=bar"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'bar',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'fam'"})]})]})})}),`
`,e.jsx(i.h3,{id:"about-hbasenamespace-table",children:"About hbase:namespace table"}),`
`,e.jsxs(i.p,{children:["We used to have a system table called ",e.jsx(i.code,{children:"hbase:namespace"})," for storing the namespace information."]}),`
`,e.jsx(i.p,{children:`It introduced some painful bugs in the past, especially that it may hang the master startup thus
hang the whole cluster. This is because meta table also has a namespace, so it depends on namespace
table. But namespace table also depends on meta table as meta table stores the location of all
regions. This is a cyclic dependency so sometimes namespace and meta table will wait for each other
to online and hang the master start up.`}),`
`,e.jsxs(i.p,{children:["It is not easy to fix so in 3.0.0, we decided to completely remove the ",e.jsx(i.code,{children:"hbase:namespace"}),` table and
fold its content into the `,e.jsx(i.code,{children:"ns"})," family in ",e.jsx(i.code,{children:"hbase:meta"}),` table. When upgrading from 2.x to 3.x, the
migration will be done automatically and the `,e.jsx(i.code,{children:"hbase:namespace"}),` table will be disabled after the
migration is done. You are free to leave it there for sometime and finally drop it.`]}),`
`,e.jsxs(i.p,{children:["For more tails, please see ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-21154",children:"https://issues.apache.org/jira/browse/HBASE-21154"}),"."]}),`
`,e.jsx(i.h2,{id:"table",children:"Table"}),`
`,e.jsx(i.p,{children:"Tables are declared up front at schema definition time."}),`
`,e.jsx(i.h2,{id:"row",children:"Row"}),`
`,e.jsx(i.p,{children:`Row keys are uninterpreted bytes.
Rows are lexicographically sorted with the lowest order appearing first in a table.
The empty byte array is used to denote both the start and end of a tables' namespace.`}),`
`,e.jsx(i.h2,{id:"column-family",children:"Column Family"}),`
`,e.jsxs(i.p,{children:["Columns in Apache HBase are grouped into ",e.jsx(i.em,{children:"column families"}),`.
All column members of a column family have the same prefix.
For example, the columns `,e.jsx(i.em,{children:"courses:history"})," and ",e.jsx(i.em,{children:"courses:math"})," are both members of the ",e.jsx(i.em,{children:"courses"}),` column family.
The colon character (`,e.jsx(i.code,{children:":"}),`) delimits the column family from the column family qualifier.
The column family prefix must be composed of `,e.jsx(i.em,{children:"printable"}),` characters.
The qualifying tail, the column family `,e.jsx(i.em,{children:"qualifier"}),`, can be made of any arbitrary bytes.
Column families must be declared up front at schema definition time whereas columns do not need to be defined at schema time but can be conjured on the fly while the table is up and running.`]}),`
`,e.jsx(i.p,{children:`Physically, all column family members are stored together on the filesystem.
Because tunings and storage specifications are done at the column family level, it is advised that all column family members have the same general access pattern and size characteristics.`}),`
`,e.jsx(i.h2,{id:"cells",children:"Cells"}),`
`,e.jsxs(i.p,{children:["A ",e.jsx(i.em,{children:"{row, column, version}"})," tuple exactly specifies a ",e.jsx(i.code,{children:"cell"}),` in HBase.
Cell content is uninterpreted bytes`]}),`
`,e.jsx(i.h2,{id:"data-model-operations",children:"Data Model Operations"}),`
`,e.jsxs(i.p,{children:[`The four primary data model operations are Get, Put, Scan, and Delete.
Operations are applied via `,e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html",children:"Table"})," instances."]}),`
`,e.jsx(i.h3,{id:"get",children:"Get"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html",children:"Get"}),` returns attributes for a specified row.
Gets are executed via `,e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#get(org.apache.hadoop.hbase.client.Get)",children:"Table.get"})]}),`
`,e.jsx(i.h3,{id:"put",children:"Put"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Put.html",children:"Put"})," either adds new rows to a table (if the key is new) or can update existing rows (if the key already exists). Puts are executed via ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#put(org.apache.hadoop.hbase.client.Put)",children:"Table.put"})," (non-writeBuffer) or ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#batch(java.util.List,java.lang.Object%5B%5D)",children:"Table.batch"})," (non-writeBuffer)"]}),`
`,e.jsx(i.h3,{id:"data-model-operations-scans",children:"Scans"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html",children:"Scan"})," allow iteration over multiple rows for specified attributes."]}),`
`,e.jsx(i.p,{children:`The following is an example of a Scan on a Table instance.
Assume that a table is populated with rows with keys "row1", "row2", "row3", and then another set of rows with the keys "abc1", "abc2", and "abc3". The following example shows how to set a Scan instance to return the rows beginning with "row".`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] CF "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "cf"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] ATTR "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "attr"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Table table "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ...      "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// instantiate a Table instance"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Scan scan "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Scan"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"scan."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addColumn"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CF, ATTR);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"scan."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setStartStopRowForPrefixScan"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"row"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"ResultScanner rs "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getScanner"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(scan);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"try"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  for"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Result r "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" rs."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"next"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(); r "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; r "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" rs."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"next"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // process result..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"} "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"finally"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  rs."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"close"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();  "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// always close the ResultScanner!"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["Note that generally the easiest way to specify a specific stop point for a scan is by using the ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/filter/InclusiveStopFilter.html",children:"InclusiveStopFilter"})," class."]}),`
`,e.jsx(i.h3,{id:"delete",children:"Delete"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Delete.html",children:"Delete"}),` removes a row from a table.
Deletes are executed via `,e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Table.html#delete(org.apache.hadoop.hbase.client.Delete)",children:"Table.delete"}),"."]}),`
`,e.jsxs(i.p,{children:["HBase does not modify data in place, and so deletes are handled by creating new markers called ",e.jsx(i.em,{children:"tombstones"}),`.
These tombstones, along with the dead values, are cleaned up on major compactions.`]}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/datamodel#delete-toc",children:"version.delete"})," for more information on deleting versions of columns, and see ",e.jsx(i.a,{href:"/docs/architecture/regions#compaction",children:"compaction"})," for more information on compactions."]}),`
`,e.jsx(i.h2,{id:"versions",children:"Versions"}),`
`,e.jsxs(i.p,{children:["A ",e.jsx(i.em,{children:"{row, column, version}"})," tuple exactly specifies a ",e.jsx(i.code,{children:"cell"}),` in HBase.
It's possible to have an unbounded number of cells where the row and column are the same but the cell address differs only in its version dimension.`]}),`
`,e.jsxs(i.p,{children:[`While rows and column keys are expressed as bytes, the version is specified using a long integer.
Typically this long contains time instances such as those returned by `,e.jsx(i.code,{children:"java.util.Date.getTime()"})," or ",e.jsx(i.code,{children:"System.currentTimeMillis()"}),", that is: ",e.jsx(i.em,{children:"the difference, measured in milliseconds, between the current time and midnight, January 1, 1970 UTC"}),"."]}),`
`,e.jsx(i.p,{children:"The HBase version dimension is stored in decreasing order, so that when reading from a store file, the most recent values are found first."}),`
`,e.jsxs(i.p,{children:["There is a lot of confusion over the semantics of ",e.jsx(i.code,{children:"cell"}),` versions, in HBase.
In particular:`]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"If multiple writes to a cell have the same version, only the last written is fetchable."}),`
`,e.jsx(i.li,{children:"It is OK to write cells in a non-increasing version order."}),`
`]}),`
`,e.jsxs(i.p,{children:[`Below we describe how the version dimension in HBase currently works.
See `,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-2406",children:"HBASE-2406"})," for discussion of HBase versions. ",e.jsx(i.a,{href:"https://web.archive.org/web/20160909085951/https://www.ngdata.com/bending-time-in-hbase/",children:"Bending time in HBase"}),` makes for a good read on the version, or time, dimension in HBase.
It has more detail on versioning than is provided here.`]}),`
`,e.jsxs(i.p,{children:["As of this writing, the limitation ",e.jsx(i.em,{children:"Overwriting values at existing timestamps"}),` mentioned in the article no longer holds in HBase.
This section is basically a synopsis of this article by Bruno Dumon.`]}),`
`,e.jsx(i.h3,{id:"specifying-the-number-of-versions-to-store",children:"Specifying the Number of Versions to Store"}),`
`,e.jsxs(i.p,{children:["The maximum number of versions to store for a given column is part of the column schema and is specified at table creation, or via an ",e.jsx(i.code,{children:"alter"})," command, via ",e.jsx(i.code,{children:"HColumnDescriptor.DEFAULT_VERSIONS"}),`.
Prior to HBase 0.96, the default number of versions kept was `,e.jsx(i.code,{children:"3"}),", but in 0.96 and newer has been changed to ",e.jsx(i.code,{children:"1"}),"."]}),`
`,e.jsx(i.h4,{id:"example-modify-the-maximum-number-of-versions-for-a-column-family-toc",children:"Example: Modify the Maximum Number of Versions for a Column Family"}),`
`,e.jsxs(i.p,{children:["This example uses HBase Shell to keep a maximum of 5 versions of all columns in column family ",e.jsx(i.code,{children:"f1"}),`.
You could also use `,e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/ColumnFamilyDescriptorBuilder.html",children:"ColumnFamilyDescriptorBuilder"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"alter"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 't1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'f1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 5"})]})})})}),`
`,e.jsx(i.h4,{id:"example-modify-the-minimum-number-of-versions-for-a-column-family-toc",children:"Example: Modify the Minimum Number of Versions for a Column Family"}),`
`,e.jsxs(i.p,{children:[`You can also specify the minimum number of versions to store per column family.
By default, this is set to 0, which means the feature is disabled.
The following example sets the minimum number of versions on all columns in column family `,e.jsx(i.code,{children:"f1"})," to ",e.jsx(i.code,{children:"2"}),`, via HBase Shell.
You could also use `,e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/ColumnFamilyDescriptorBuilder.html",children:"ColumnFamilyDescriptorBuilder"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"alter"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 't1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'f1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MIN_VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2"})]})})})}),`
`,e.jsxs(i.p,{children:["Starting with HBase 0.98.2, you can specify a global default for the maximum number of versions kept for all newly-created columns, by setting ",e.jsx(i.code,{children:"hbase.column.max.version"})," in ",e.jsx(i.em,{children:"hbase-site.xml"}),`.
See `,e.jsx(i.a,{href:"/docs/configuration/default#hbasecolumnmaxversion-toc",children:"hbase.column.max.version"}),"."]}),`
`,e.jsx(i.h3,{id:"versions-and-hbase-operations",children:"Versions and HBase Operations"}),`
`,e.jsx(i.p,{children:"In this section we look at the behavior of the version dimension for each of the core HBase operations."}),`
`,e.jsx(i.h4,{id:"getscan",children:"Get/Scan"}),`
`,e.jsxs(i.p,{children:[`Gets are implemented on top of Scans.
The below discussion of `,e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html",children:"Get"})," applies equally to ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Scan.html",children:"Scans"}),"."]}),`
`,e.jsxs(i.p,{children:["By default, i.e. if you specify no explicit version, when doing a ",e.jsx(i.code,{children:"get"}),", the cell whose version has the largest value is returned (which may or may not be the latest one written, see later). The default behavior can be modified in the following ways:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["to return more than one version, see ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html#readVersions(int)",children:"Get.readVersions(int)"})]}),`
`,e.jsxs(i.li,{children:["to return versions other than the latest, see ",e.jsx(i.a,{href:"https://hbase.apache.org/devapidocs/org/apache/hadoop/hbase/client/Get.html#setTimeRange(long,long)",children:"Get.setTimeRange(long,long)"})]}),`
`]}),`
`,e.jsx(i.p,{children:"To retrieve the latest version that is less than or equal to a given value, thus giving the 'latest' state of the record at a certain point in time, just use a range from 0 to the desired version and set the max versions to 1."}),`
`,e.jsx(i.h4,{id:"default-get-example",children:"Default Get Example"}),`
`,e.jsx(i.p,{children:"The following Get will only retrieve the current version of the row"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] CF "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "cf"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] ATTR "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "attr"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Get get "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Get"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"row1"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Result r "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(get);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] b "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getValue"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CF, ATTR);  "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// returns current version of value"})]})]})})}),`
`,e.jsx(i.h4,{id:"versioned-get-example",children:"Versioned Get Example"}),`
`,e.jsx(i.p,{children:"The following Get will return the last 3 versions of the row."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] CF "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "cf"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] ATTR "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "attr"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Get get "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Get"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"row1"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"get."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setMaxVersions"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");  "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// will return last 3 versions of row"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Result r "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(get);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] b "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getValue"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CF, ATTR);  "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// returns current version of value"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"List<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Cell"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> cells "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getColumnCells"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CF, ATTR);  "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// returns all versions of this column"})]})]})})}),`
`,e.jsx(i.h4,{id:"put-1",children:"Put"}),`
`,e.jsxs(i.p,{children:["Doing a put always creates a new version of a ",e.jsx(i.code,{children:"cell"}),`, at a certain timestamp.
By default the system uses the server's `,e.jsx(i.code,{children:"currentTimeMillis"}),`, but you can specify the version (= the long integer) yourself, on a per-column level.
This means you could assign a time in the past or the future, or use the long value for non-time purposes.`]}),`
`,e.jsx(i.p,{children:"To overwrite an existing value, do a put at exactly the same row, column, and version as that of the cell you want to overwrite."}),`
`,e.jsx(i.h4,{id:"implicit-version-example-toc",children:"Implicit Version Example"}),`
`,e.jsx(i.p,{children:"The following Put will be implicitly versioned by HBase with the current time."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] CF "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "cf"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] ATTR "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "attr"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Put put "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Put"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(row));"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"put."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CF, ATTR, Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"( data));"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"table."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"put"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(put);"})]})]})})}),`
`,e.jsx(i.h4,{id:"explicit-version-example",children:"Explicit Version Example"}),`
`,e.jsx(i.p,{children:"The following Put has the version timestamp explicitly set."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] CF "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "cf"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] ATTR "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "attr"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Put put "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Put"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"( Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(row));"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"long"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" explicitTimeInMs "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 555"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";  "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// just an example"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"put."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CF, ATTR, explicitTimeInMs, Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(data));"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"table."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"put"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(put);"})]})]})})}),`
`,e.jsx(i.p,{children:`Caution: the version timestamp is used internally by HBase for things like time-to-live calculations.
It's usually best to avoid setting this timestamp yourself.
Prefer using a separate timestamp attribute of the row, or have the timestamp as a part of the row key, or both.`}),`
`,e.jsx(i.h4,{id:"cell-version-example-toc",children:"Cell Version Example"}),`
`,e.jsx(i.p,{children:`The following Put uses a method getCellBuilder() to get a CellBuilder instance
that already has relevant Type and Row set.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] CF "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "cf"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" byte"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] ATTR "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "attr"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Put put "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Put"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(row));"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"put."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(put."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getCellBuilder"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setQualifier"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ATTR)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   ."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setFamily"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CF)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   ."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setValue"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(data))"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   ."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"build"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"());"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"table."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"put"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(put);"})]})]})})}),`
`,e.jsx(i.h4,{id:"delete-toc",children:"Delete"}),`
`,e.jsxs(i.p,{children:[`There are three different types of internal delete markers.
See Lars Hofhansl's blog for discussion of his attempt adding another, `,e.jsx(i.a,{href:"http://hadoop-hbase.blogspot.com/2012/01/scanning-in-hbase.html",children:"Scanning in HBase: Prefix Delete Marker"}),"."]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Delete: for a specific version of a column."}),`
`,e.jsx(i.li,{children:"Delete column: for all versions of a column."}),`
`,e.jsx(i.li,{children:"Delete family: for all columns of a particular ColumnFamily"}),`
`]}),`
`,e.jsx(i.p,{children:"When deleting an entire row, HBase will internally create a tombstone for each ColumnFamily (i.e., not each individual column)."}),`
`,e.jsxs(i.p,{children:["Deletes work by creating ",e.jsx(i.em,{children:"tombstone"}),` markers.
For example, let's suppose we want to delete a row.
For this you can specify a version, or else by default the `,e.jsx(i.code,{children:"currentTimeMillis"}),` is used.
What this means is `,e.jsx(i.em,{children:"delete all cells where the version is less than or equal to this version"}),`.
HBase never modifies data in place, so for example a delete will not immediately delete (or mark as deleted) the entries in the storage file that correspond to the delete condition.
Rather, a so-called `,e.jsx(i.em,{children:"tombstone"}),` is written, which will mask the deleted values.
When HBase does a major compaction, the tombstones are processed to actually remove the dead values, together with the tombstones themselves.
If the version you specified when deleting a row is larger than the version of any value in the row, then you can consider the complete row to be deleted.`]}),`
`,e.jsxs(i.p,{children:["For an informative discussion on how deletes and versioning interact, see the thread ",e.jsx(i.a,{href:"https://lists.apache.org/thread/g6s0fkx74hbmc0pplnf5r3gq5xn4vkyt",children:"Put w/timestamp -> Deleteall -> Put w/ timestamp fails"})," up on the user mailing list."]}),`
`,e.jsxs(i.p,{children:["Also see ",e.jsx(i.a,{href:"/docs/architecture/regions#keyvalue",children:"keyvalue"})," for more information on the internal KeyValue format."]}),`
`,e.jsxs(i.p,{children:["Delete markers are purged during the next major compaction of the store, unless the ",e.jsx(i.code,{children:"KEEP_DELETED_CELLS"})," option is set in the column family (See ",e.jsx(i.a,{href:"/docs/regionserver-sizing#keeping-deleted-cells",children:"Keeping Deleted Cells"}),`).
To keep the deletes for a configurable amount of time, you can set the delete TTL via the `,e.jsx(i.code,{children:"hbase.hstore.time.to.purge.deletes"})," property in ",e.jsx(i.em,{children:"hbase-site.xml"}),`.
If `,e.jsx(i.code,{children:"hbase.hstore.time.to.purge.deletes"}),` is not set, or set to 0, all delete markers, including those with timestamps in the future, are purged during the next major compaction.
Otherwise, a delete marker with a timestamp in the future is kept until the major compaction which occurs after the time represented by the marker's timestamp plus the value of `,e.jsx(i.code,{children:"hbase.hstore.time.to.purge.deletes"}),", in milliseconds."]}),`
`,e.jsx(t,{type:"info",children:e.jsxs(i.p,{children:[`This behavior represents a fix for an unexpected change that was introduced in HBase 0.94, and was
fixed in `,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-10118",children:"HBASE-10118"}),`. The change has been
backported to HBase 0.94 and newer branches.`]})}),`
`,e.jsx(i.h3,{id:"optional-new-version-and-delete-behavior-in-hbase-200",children:"Optional New Version and Delete behavior in HBase-2.0.0"}),`
`,e.jsxs(i.p,{children:["In ",e.jsx(i.code,{children:"hbase-2.0.0"}),`, the operator can specify an alternate version and
delete treatment by setting the column descriptor property
`,e.jsx(i.code,{children:"NEW_VERSION_BEHAVIOR"}),` to true (To set a property on a column family
descriptor, you must first disable the table and then alter the
column family descriptor; see `,e.jsx(i.a,{href:"/docs/regionserver-sizing#keeping-deleted-cells",children:"Keeping Deleted Cells"}),` for an example
of editing an attribute on a column family descriptor).`]}),`
`,e.jsxs(i.p,{children:[`The 'new version behavior', undoes the limitations listed below
whereby a `,e.jsx(i.code,{children:"Delete"})," ALWAYS overshadows a ",e.jsx(i.code,{children:"Put"}),` if at the same
location — i.e. same row, column family, qualifier and timestamp
-- regardless of which arrived first. Version accounting is also
changed as deleted versions are considered toward total version count.
This is done to ensure results are not changed should a major
compaction intercede. See `,e.jsx(i.code,{children:"HBASE-15968"}),` and linked issues for
discussion.`]}),`
`,e.jsx(i.p,{children:`Running with this new configuration currently costs; we factor
the Cell MVCC on every compare so we burn more CPU. The slow
down will depend. In testing we've seen between 0% and 25%
degradation.`}),`
`,e.jsxs(i.p,{children:[`If replicating, it is advised that you run with the new
serial replication feature (See `,e.jsx(i.code,{children:"HBASE-9465"}),`; the serial
replication feature did NOT make it into `,e.jsx(i.code,{children:"hbase-2.0.0"}),` but
should arrive in a subsequent hbase-2.x release) as now
the order in which Mutations arrive is a factor.`]}),`
`,e.jsx(i.h3,{id:"current-limitations",children:"Current Limitations"}),`
`,e.jsxs(i.p,{children:[`The below limitations are addressed in hbase-2.0.0. See
the section above, `,e.jsx(i.a,{href:"/docs/datamodel#optional-new-version-and-delete-behavior-in-hbase-200",children:"Optional New Version and Delete behavior in HBase-2.0.0"}),"."]}),`
`,e.jsx(i.h4,{id:"deletes-mask-puts",children:"Deletes mask Puts"}),`
`,e.jsxs(i.p,{children:[`Deletes mask puts, even puts that happened after the delete was entered.
See `,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-2256",children:"HBASE-2256"}),`.
Remember that a delete writes a tombstone, which only disappears after then next major compaction has run.
Suppose you do a delete of everything `,e.jsx(i.code,{children:"<= T"}),`.
After this you do a new put with a timestamp `,e.jsx(i.code,{children:"<= T"}),`.
This put, even if it happened after the delete, will be masked by the delete tombstone.
Performing the put will not fail, but when you do a get you will notice the put did have no effect.
It will start working again after the major compaction has run.
These issues should not be a problem if you use always-increasing versions for new puts to a row.
But they can occur even if you do not care about time: just do delete and put immediately after each other, and there is some chance they happen within the same millisecond.`]}),`
`,e.jsx(i.h4,{id:"major-compactions-change-query-results",children:"Major compactions change query results"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.em,{children:`...create three cell versions at t1, t2 and t3, with a maximum-versions
setting of 2. So when getting all versions, only the values at t2 and t3 will be
returned. But if you delete the version at t2 or t3, the one at t1 will appear again.
Obviously, once a major compaction has run, such behavior will not be the case
anymore...`})," (See ",e.jsx(i.em,{children:"Garbage Collection"})," in ",e.jsx(i.a,{href:"https://web.archive.org/web/20160909085951/https://www.ngdata.com/bending-time-in-hbase/",children:"Bending time in HBase"}),".)"]}),`
`,e.jsx(i.h2,{id:"sort-order",children:"Sort Order"}),`
`,e.jsx(i.p,{children:`All data model operations HBase return data in sorted order.
First by row, then by ColumnFamily, followed by column qualifier, and finally timestamp (sorted in reverse, so newest records are returned first).`}),`
`,e.jsx(i.h2,{id:"column-metadata",children:"Column Metadata"}),`
`,e.jsx(i.p,{children:`There is no store of column metadata outside of the internal KeyValue instances for a ColumnFamily.
Thus, while HBase can support not only a wide number of columns per row, but a heterogeneous set of columns between rows as well, it is your responsibility to keep track of the column names.`}),`
`,e.jsxs(i.p,{children:[`The only way to get a complete set of columns that exist for a ColumnFamily is to process all the rows.
For more information about how HBase stores data internally, see `,e.jsx(i.a,{href:"/docs/architecture/regions#keyvalue",children:"keyvalue"}),"."]}),`
`,e.jsx(i.h2,{id:"datamodel-joins",children:"Joins"}),`
`,e.jsx(i.p,{children:"Whether HBase supports joins is a common question on the dist-list, and there is a simple answer: it doesn't, at not least in the way that RDBMS' support them (e.g., with equi-joins or outer-joins in SQL). As has been illustrated in this chapter, the read data model operations in HBase are Get and Scan."}),`
`,e.jsx(i.p,{children:`However, that doesn't mean that equivalent join functionality can't be supported in your application, but you have to do it yourself.
The two primary strategies are either denormalizing the data upon writing to HBase, or to have lookup tables and do the join between HBase tables in your application or MapReduce code (and as RDBMS' demonstrate, there are several strategies for this depending on the size of the tables, e.g., nested loops vs.
hash-joins). So which is the best approach? It depends on what you are trying to do, and as such there isn't a single answer that works for every use case.`}),`
`,e.jsx(i.h2,{id:"acid",children:"ACID"}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/acid-semantics",children:"ACID Semantics"}),`.
Lars Hofhansl has also written a note on `,e.jsx(i.a,{href:"http://hadoop-hbase.blogspot.com/2012/03/acid-in-hbase.html",children:"ACID in HBase"}),"."]})]})}function m(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}function a(s,i){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}export{o as _markdown,m as default,r as extractedReferences,h as frontmatter,c as structuredData,d as toc};
